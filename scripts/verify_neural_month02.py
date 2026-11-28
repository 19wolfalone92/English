#!/usr/bin/env python3
"""Qualify a separately downloadable month-02 audio module against source.
No network access or Android installation; output remains separate from APK."""
import hashlib,json,subprocess,sys,shutil,zipfile
from pathlib import Path
from build_context_audio import load
packs={p['id']:p for p in load() if 31<=p['day']<=60}
assert len(packs)==30
root=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(parents=True,exist_ok=True)
rows={}
for folder in sorted(root.glob('Wolfie-neural-month02-*')):
    for r in json.loads((folder/'manifest.json').read_text(encoding='utf-8')):
        ident=r['id'];p=packs[ident]
        assert ident not in rows
        assert r['file']==ident+'.mp3' and r['engine']=='kokoro-int8' and r['source']=='synthetic'
        f=folder/r['file']
        assert f.stat().st_size==r['bytes'] and hashlib.sha256(f.read_bytes()).hexdigest()==r['sha256']
        assert r['text_sha256']==hashlib.sha256('\n'.join(x[1] for x in p['dialogue']).encode()).hexdigest()
        assert r['day']==p['day'] and r['level']==p['level'] and 30<=r['seconds']<=90
        assert len(r['cues'])==len(p['dialogue'])
        last=0
        for c,line in zip(r['cues'],p['dialogue']):
            assert c['role']==line[0] and 0<=last<=c['start']<c['end']<=r['seconds']+.01
            last=c['end']
        assert set(r['voices'])==set(x[0] for x in p['dialogue'])
        assert len(set(tuple(x) for x in r['voices'].values()))==len(r['voices'])
        duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(f)]))
        assert abs(duration-r['seconds'])<.2
        subprocess.run(['ffmpeg','-v','error','-i',str(f),'-f','null','-'],check=True)
        rows[ident]=r
        shutil.copyfile(f,out/r['file'])
assert set(rows)==set(packs)
ordered=sorted(rows.values(),key=lambda x:x['day'])
manifest={'schema':1,'module':'wolfie-neural-month02','source_commit':sys.argv[3],'tracks':ordered,'quality':'OBJECTIVE_AUDIO_ONLY','android_import':'NOT_IMPLEMENTED'}
(out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
zip_path=out.parent/'wolfie-neural-month02.zip'
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED) as z:
    for f in sorted(out.iterdir()):z.write(f,f.name)
with zipfile.ZipFile(zip_path) as z:
    assert z.testzip() is None
    assert set(z.namelist())=={'manifest.json'}|{r['file'] for r in ordered}
    for r in ordered:assert hashlib.sha256(z.read(r['file'])).hexdigest()==r['sha256']
digest=hashlib.sha256(zip_path.read_bytes()).hexdigest()
zip_path.with_suffix('.zip.sha256').write_text(digest+'  '+zip_path.name+'\n')
print(f"PASS: {len(ordered)} decoded, source-bound tracks; {sum(r['seconds'] for r in ordered):.3f}s; module SHA256 {digest}; Android import and listening review NOT QUALIFIED")
