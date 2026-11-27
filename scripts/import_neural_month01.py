#!/usr/bin/env python3
"""Verify immutable generated dialogue assets against source and pinned hashes."""
import hashlib,json,subprocess,shutil,sys
from pathlib import Path
from build_context_audio import load
root=Path(__file__).resolve().parents[1]
pins=json.loads((root/'research/month01_neural_pins.json').read_text())
packs={p['id']:p for p in load() if p['day']==1 or 11<=p['day']<=30}
assert len(pins)==len(packs)==21 and set(pins)==set(packs)
out=root/'app/src/main/assets/neural_dialogue';out.mkdir(parents=True,exist_ok=True)
rows=[]
for folder in map(Path,sys.argv[1:]):
    for r in json.loads((folder/'manifest.json').read_text()):
        ident=r['id'];p=packs[ident];f=folder/r['file']
        assert r['file']==ident+'.mp3' and r['engine']=='kokoro-int8' and r['source']=='synthetic'
        assert r['sha256']==pins[ident] and hashlib.sha256(f.read_bytes()).hexdigest()==r['sha256'] and f.stat().st_size==r['bytes']
        assert r['text_sha256']==hashlib.sha256('\n'.join(x[1] for x in p['dialogue']).encode()).hexdigest()
        assert 30<=r['seconds']<=90 and r['day']==p['day'] and r['level']==p['level']
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
        shutil.copyfile(f,out/r['file']);rows.append(r)
assert len(rows)==len({r['id'] for r in rows})==21 and {r['id'] for r in rows}==set(packs)
rows.sort(key=lambda r:r['day'])
(out/'manifest.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
(out/'index.js').write_text('window.WOLFIE_NEURAL_DIALOGUES='+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\n')
print(f"PASS: {len(rows)} neural dialogues verified and packaged; {sum(r['seconds'] for r in rows):.1f}s, {sum(r['bytes'] for r in rows)} bytes; subjective quality not confirmed")
