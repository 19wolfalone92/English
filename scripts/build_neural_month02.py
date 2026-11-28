#!/usr/bin/env python3
"""Produce an independent month 02 audio module, preserving earlier pinned recordings.
Objective audio checks are not a human listening or linguistic review."""
import argparse,hashlib,json,subprocess,time
from pathlib import Path
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro
from build_context_audio import load
ap=argparse.ArgumentParser()
ap.add_argument('--shard',type=int,choices=range(5),required=True)
args=ap.parse_args()
out=Path('research-evidence/month02')/str(args.shard);out.mkdir(parents=True,exist_ok=True)
model=Kokoro('research-models/kokoro-v1.0.int8.onnx','research-models/voices-v1.0.bin')
packs=sorted([p for p in load() if 31<=p['day']<=60],key=lambda p:p['day'])
assert len(packs)==30 and [p['day'] for p in packs]==list(range(31,61))
selected=packs[args.shard*6:(args.shard+1)*6]
rows=json.loads((out/'manifest.json').read_text()) if (out/'manifest.json').exists() else []
assert len({r['id'] for r in rows})==len(rows)
for r in rows:
    p=next(p for p in selected if p['id']==r['id'])
    assert r['text_sha256']==hashlib.sha256('\n'.join(x[1] for x in p['dialogue']).encode()).hexdigest()
    f=out/r['file']
    assert f.stat().st_size==r['bytes'] and hashlib.sha256(f.read_bytes()).hexdigest()==r['sha256']
    assert 30<=r['seconds']<=90
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(f),'-f','null','-'],check=True)
    print('Reused verified recording',r['id'],flush=True)
for p in selected:
    if any(r['id']==p['id'] for r in rows):continue
    start=time.monotonic()
    roles=list(dict.fromkeys(r[0] for r in p['dialogue']))
    assert 2<=len(roles)<=3,(p['id'],roles)
    role_voice=dict(zip(roles,[('af_heart','en-us'),('bm_george','en-gb'),('am_michael','en-us')]))
    def render(speed):
        parts=[];cues=[];offset=0
        for role,txt,_ in p['dialogue']:
            voice,locale=role_voice[role]
            samples,sr=model.create(txt,voice=voice,speed=speed,lang=locale)
            samples=np.asarray(samples,dtype=np.float32)
            assert sr==24000 and samples.ndim==1 and np.isfinite(samples).all() and len(samples)>sr*.4 and np.max(np.abs(samples))>.01,(p['id'],txt)
            cues.append(dict(role=role,start=round(offset/sr,3),end=round((offset+len(samples))/sr,3)))
            parts.extend([samples,np.zeros(int(sr*.25),dtype=np.float32)])
            offset+=len(samples)+int(sr*.25)
        data=np.concatenate(parts)
        return data,sr,cues,len(data)/sr
    speed=.98
    data,sr,cues,duration=render(speed)
    # A2 learner-friendly slower speech, never padded/repeated to pass duration.
    # Preserve the 30–90 second gate. If still too short, report failure.
    if duration<30:
        speed=max(.65,round(.98*duration/32,2))
        data,sr,cues,duration=render(speed)
    assert 30<=duration<=90,(p['id'],duration,speed)
    wav=out/(p['id']+'.wav');mp3=out/(p['id']+'.mp3')
    sf.write(wav,data,sr)
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','64k','-map_metadata','-1',str(mp3)],check=True)
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(mp3),'-f','null','-'],check=True)
    wav.unlink()
    rows.append(dict(id=p['id'],day=p['day'],level=p['level'],file=mp3.name,engine='kokoro-int8',source='synthetic',voices=role_voice,speed=speed,seconds=round(duration,3),words=len(' '.join(r[1] for r in p['dialogue']).split()),sha256=hashlib.sha256(mp3.read_bytes()).hexdigest(),text_sha256=hashlib.sha256('\n'.join(r[1] for r in p['dialogue']).encode()).hexdigest(),bytes=mp3.stat().st_size,cues=cues,subjective_quality='NOT_CONFIRMED',generation_seconds=round(time.monotonic()-start,3)))
    (out/'manifest.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
    print(p['id'],duration,flush=True)
assert len(rows)==6
print('PASS: 6 decoded original dialogue recordings; human review pending')
