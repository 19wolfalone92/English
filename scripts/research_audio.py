#!/usr/bin/env python3
"""A/B matched-text audio qualification: objective file metrics, subjective quality not yet rated."""
import hashlib,json,subprocess,time,os
from pathlib import Path
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro
from build_context_audio import load
out=Path('research-evidence/audio');out.mkdir(parents=True,exist_ok=True)
model=Kokoro('research-models/kokoro-v1.0.int8.onnx','research-models/voices-v1.0.bin')
rows=[]
for level in ['A2','B1','B2']:
    pack=next(p for p in load() if p['level']==level and p.get('profile')=='extended-v1')
    text=' '.join(pack['reading']['paragraphs'])
    (out/f'{level}-text.txt').write_text(text)
    for locale,voice,espeak in [('en-us','af_heart','en-us+f2'),('en-gb','bm_george','en-gb+m2')]:
        for engine in ['espeak','kokoro-int8']:
            name=f'{level}-{locale}-{engine}';wav=out/(name+'.wav');mp3=out/(name+'.mp3')
            start=time.monotonic()
            if engine=='espeak':
                subprocess.run(['espeak','-v',espeak,'-s',str({'A2':140,'B1':155,'B2':170}[level]),'-w',str(wav),text],check=True)
            else:
                samples,sr=model.create(text,voice=voice,speed={'A2':.85,'B1':.95,'B2':1.0}[level],lang=locale)
                assert np.isfinite(samples).all() and len(samples)>sr*5
                sf.write(wav,samples,sr)
            generation=time.monotonic()-start
            data,sr=sf.read(wav);assert np.isfinite(data).all() and np.max(np.abs(data))>0.01
            subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','64k',str(mp3)],check=True)
            subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(mp3),'-f','null','-'],check=True)
            rows.append(dict(level=level,locale=locale,engine=engine,voice=voice if engine!='espeak' else espeak,text_sha256=hashlib.sha256(text.encode()).hexdigest(),words=len(text.split()),seconds=round(len(data)/sr,3),generation_seconds=round(generation,3),bytes=mp3.stat().st_size,sha256=hashlib.sha256(mp3.read_bytes()).hexdigest(),peak=round(float(np.max(np.abs(data))),4),rms=round(float(np.sqrt(np.mean(data**2))),4),file=mp3.name,subjective_quality='NOT_CONFIRMED'))
            wav.unlink()
            (out/'comparison.json').write_text(json.dumps(rows,indent=2))
assert len(rows)==12
print(json.dumps(rows,indent=2))
