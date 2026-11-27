#!/usr/bin/env python3
"""Produce NEW dialogues only, preserving earlier pinned neural recordings.
Objective audio checks are not a human listening or linguistic review."""
import argparse,hashlib,json,subprocess,time
from pathlib import Path
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro
from build_context_audio import load
ap=argparse.ArgumentParser()
ap.add_argument('--shard',type=int,choices=range(3),required=True)
args=ap.parse_args()
out=Path('research-evidence/month01')/str(args.shard);out.mkdir(parents=True,exist_ok=True)
model=Kokoro('research-models/kokoro-v1.0.int8.onnx','research-models/voices-v1.0.bin')
packs=sorted([p for p in load() if p['day']==1 or 11<=p['day']<=30],key=lambda p:p['day'])
assert len(packs)==21
rows=[]
for p in packs[args.shard*7:(args.shard+1)*7]:
    start=time.monotonic();parts=[];cues=[];offset=0
    roles=list(dict.fromkeys(r[0] for r in p['dialogue']))
    assert len(roles)==2,(p['id'],roles)
    role_voice=dict(zip(roles,[('af_heart','en-us'),('bm_george','en-gb')]))
    for role,txt,_ in p['dialogue']:
        voice,locale=role_voice[role]
        samples,sr=model.create(txt,voice=voice,speed=.98,lang=locale)
        samples=np.asarray(samples,dtype=np.float32)
        assert sr==24000 and samples.ndim==1 and np.isfinite(samples).all() and len(samples)>sr*.4 and np.max(np.abs(samples))>.01,(p['id'],txt)
        cues.append(dict(role=role,start=round(offset/sr,3),end=round((offset+len(samples))/sr,3)))
        parts.extend([samples,np.zeros(int(sr*.25),dtype=np.float32)])
        offset+=len(samples)+int(sr*.25)
    data=np.concatenate(parts);duration=len(data)/sr
    assert 30<=duration<=90,(p['id'],duration)
    wav=out/(p['id']+'.wav');mp3=out/(p['id']+'.mp3')
    sf.write(wav,data,sr)
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','64k','-map_metadata','-1',str(mp3)],check=True)
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(mp3),'-f','null','-'],check=True)
    wav.unlink()
    rows.append(dict(id=p['id'],day=p['day'],level=p['level'],file=mp3.name,engine='kokoro-int8',source='synthetic',voices=role_voice,seconds=round(duration,3),words=len(' '.join(r[1] for r in p['dialogue']).split()),sha256=hashlib.sha256(mp3.read_bytes()).hexdigest(),text_sha256=hashlib.sha256('\n'.join(r[1] for r in p['dialogue']).encode()).hexdigest(),bytes=mp3.stat().st_size,cues=cues,subjective_quality='NOT_CONFIRMED',generation_seconds=round(time.monotonic()-start,3)))
    (out/'manifest.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
    print(p['id'],duration,flush=True)
assert len(rows)==7
print('PASS: 7 decoded original dialogue recordings; human review pending')
