#!/usr/bin/env python3
"""Import the qualified six-file Kokoro pilot; fail closed on changed audio or reading."""
import hashlib,json,shutil,sys,subprocess
from pathlib import Path
from build_context_audio import load,ASSETS
source=Path(sys.argv[1])
out=ASSETS/'neural_audio'
out.mkdir(exist_ok=True)
packs={p['id']:p for p in load()}
pinned=[
 ('mission-v2-009','A2','en-us','da1099446fa603608d6ac30b8dac139b0ad71506e1f56db0ed26730ae465b4f2'),
 ('mission-v2-009','A2','en-gb','e72d7817281f724178c2e9b99c4d012ebd9c2b44d61e1cfdd11d4c6f86589c3c'),
 ('mission-v2-129','B1','en-us','00ac32241232b95c4f217d9e08f9c64359c5075da77bbe9a5073f7c97416e0d6'),
 ('mission-v2-129','B1','en-gb','b6c55504c49eb7bfbdf6b3f056e1b17826222305ec7a87c1b41dbd620d554161'),
 ('mission-v2-219','B2','en-us','2b7212ed084f7485eaead91f3da5bb3d514f7b8d9f7faf4ca48acac07f985384'),
 ('mission-v2-219','B2','en-gb','d4a4f12c91f6d22cc8e9aac4ba5158a5679fff684221eb71b97e115229b5feb9')]
rows=json.loads((source/'comparison.json').read_text())
records=[]
for ident,level,locale,sha in pinned:
    name=f'{level}-{locale}-kokoro-int8.mp3'
    matches=[r for r in rows if r['file']==name and r['engine']=='kokoro-int8']
    assert len(matches)==1,name
    r=matches[0]
    transcript=' '.join(packs[ident]['reading']['paragraphs'])
    assert hashlib.sha256(transcript.encode()).hexdigest()==r['text_sha256']
    b=(source/name).read_bytes()
    assert hashlib.sha256(b).hexdigest()==sha==r['sha256']
    assert len(b)==r['bytes']
    target=out/f'{ident}-{locale}.mp3'
    target.write_bytes(b)
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(target),'-f','null','-'],check=True)
    records.append(dict(id=ident,locale=locale,voice=r['voice'],file=target.name,bytes=len(b),sha256=sha,seconds=r['seconds'],text_sha256=r['text_sha256'],source='Kokoro v1.0 INT8',assessment=False))
assert set(p.name for p in out.glob('*.mp3'))=={r['file'] for r in records}
(out/'manifest.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n')
(out/'index.js').write_text('window.WOLFIE_NEURAL_AUDIO='+json.dumps(records,ensure_ascii=False)+';\n',encoding='utf-8')
print('PASS: six pinned and decoded Kokoro tracks, three original texts, US/GB voice alternatives; not independent listening assessment')
