#!/usr/bin/env python3
import hashlib,json,sys,zipfile
from pathlib import Path
assets=Path(__file__).resolve().parents[1]/'app/src/main/assets'
for name in sys.argv[1:]:
    with zipfile.ZipFile(name) as z:
        records=json.loads(z.read('assets/context_audio/manifest.json'))
        assert len(records)==90
        for r in records:
            b=z.read('assets/context_audio/'+r['file'])
            assert len(b)==r['bytes'] and hashlib.sha256(b).hexdigest()==r['sha256']
        reading=json.loads(z.read('assets/reading_audio/manifest.json'))
        assert len(reading)==140 and len({r['id'] for r in reading})==140
        assert {r['id'] for r in reading if r['level']!='legacy'}=={r['id'] for r in records}
        assert {r['id'] for r in reading if r['level']=='legacy'}=={f'legacy-{i}' for i in range(50)}
        for r in reading:
            b=z.read('assets/reading_audio/'+r['file'])
            assert len(b)==r['bytes'] and hashlib.sha256(b).hexdigest()==r['sha256']
        neural=json.loads(z.read('assets/neural_audio/manifest.json'))
        assert len(neural)==6 and len({r['id'] for r in neural})==3
        assert {r['locale'] for r in neural}=={'en-us','en-gb'}
        for r in neural:
            b=z.read('assets/neural_audio/'+r['file'])
            assert len(b)==r['bytes'] and hashlib.sha256(b).hexdigest()==r['sha256']
        assert z.read('assets/neural_audio/index.js')==(assets/'neural_audio/index.js').read_bytes()
        for f in ('context.js','context_packs_a.js','context_packs_b.js','context_packs_c.js','context_packs_d.js','context_packs_e.js','context_packs_f.js','context_packs_g.js','context_packs_h.js','context_packs_i.js','context_checks.js','context_checks_d.js','context_checks_e.js','context_checks_f.js','context_checks_g.js','context_checks_h.js','context_checks_i.js','index.html','study.js','app.js','studio.js','studio.css'):
            assert z.read('assets/'+f)==(assets/f).read_bytes(),f
        assert b'context_packs_a.js' in z.read('assets/index.html')
    print(f'PASS: {name}: 90 dialogue + 140 reading + 6 neural alternate MP3s and context source assets byte-identical to checked build inputs')
