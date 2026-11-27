#!/usr/bin/env python3
import hashlib,json,sys,zipfile
from pathlib import Path
assets=Path(__file__).resolve().parents[1]/'app/src/main/assets'
for name in sys.argv[1:]:
    with zipfile.ZipFile(name) as z:
        records=json.loads(z.read('assets/context_audio/manifest.json'))
        assert len(records)==80
        for r in records:
            b=z.read('assets/context_audio/'+r['file'])
            assert len(b)==r['bytes'] and hashlib.sha256(b).hexdigest()==r['sha256']
        for f in ('context.js','context_packs_a.js','context_packs_b.js','context_packs_c.js','context_packs_d.js','context_packs_e.js','context_packs_f.js','context_packs_g.js','context_packs_h.js','context_checks.js','context_checks_d.js','context_checks_e.js','context_checks_f.js','context_checks_g.js','context_checks_h.js','index.html','study.js','app.js'):
            assert z.read('assets/'+f)==(assets/f).read_bytes(),f
        assert b'context_packs_a.js' in z.read('assets/index.html')
    print(f'PASS: {name}: 80 MP3s and context source assets byte-identical to checked build inputs')
