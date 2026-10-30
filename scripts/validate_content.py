import json, pathlib, re, sys
p=pathlib.Path(__file__).resolve().parents[1]/'app/src/main/assets/curriculum.js'
s=p.read_text(encoding='utf-8')
prefix='window.WOLFIE_LESSONS = '
assert s.startswith(prefix) and s.endswith(';\n')
units=json.loads(s[len(prefix):-2]);assert len(units)>=24
counts={}; ids=set(); total=0
for i,unit in enumerate(units):
    assert unit['id']==f'u{i+1:02d}' and unit['level'] in ('A2','B1','B2')
    counts[unit['level']]=counts.get(unit['level'],0)+1
    assert len(unit['pairs'])==10
    for j,card in enumerate(unit['pairs']):
        assert card['id']==f'u{i+1:02d}p{j+1:02d}' and card['id'] not in ids
        ids.add(card['id']);total+=1
        assert isinstance(card['en'],str) and isinstance(card['ru'],str)
        assert len(card['en'])>=8 and len(card['ru'])>=8
        assert not re.search(r'\b(?:we.ll can|i.ll can)\b',card['en'],re.I)
assert all(counts.get(level,0)>=7 for level in ('A2','B1','B2'))
assert total>=240
print('OK:',len(units),'lessons,',total,'phrases;',counts)


# Vocabulary used by the dedicated flashcard module
vocab=pathlib.Path(__file__).resolve().parents[1]/'app/src/main/assets/vocab.js'
t=vocab.read_text(encoding='utf-8')
entries=re.findall(r"\{level:'(A2|B1|B2)',en:'([^']+)',ru:'([^']+)'\}",t)
assert len(entries)>=90, f"Expected at least 90 reviewed vocabulary items, got {len(entries)}"
assert all(sum(x[0]==level for x in entries)>=30 for level in ('A2','B1','B2'))
assert len(set((x[0],x[1]) for x in entries)) == len(entries), 'Duplicate vocabulary items'
assert 'id:' in t, 'Missing stable word IDs'
print('OK: vocabulary',len(entries),'words')

# Large offline bank generated from auditable manually entered bilingual source rows.
import hashlib
from build_expanded_content import rows
root = pathlib.Path(__file__).resolve().parents[1]
a = root / 'app/src/main/assets/expanded.js'
lines = a.read_text(encoding='utf-8').splitlines()
assert len(lines) == 2, 'The expansion must contain two explicit arrays'
assert lines[0].startswith('window.WOLFIE_EXTRA_WORDS = ') and lines[0].endswith(';')
assert lines[1].startswith('window.WOLFIE_EXTRA_PHRASES = ') and lines[1].endswith(';')
words = json.loads(lines[0][len('window.WOLFIE_EXTRA_WORDS = '):-1])
extras = json.loads(lines[1][len('window.WOLFIE_EXTRA_PHRASES = '):-1])
assert len(words) >= 900 and len(extras) >= 700, (len(words), len(extras))
assert len(words)+len(entries) >= 1000 and len(extras)+total >= 1000
assert all(sum(x['level']==k for x in words)>=250 for k in ('A2','B1','B2'))
assert all(sum(x['level']==k for x in extras)>=100 for k in ('A2','B1','B2'))
assert len(set(x['topic'] for x in words)) >= 35
assert len(set(x['topic'] for x in extras)) >= 45
seen_ids = set(ids)
base_word_en = {en.lower() for _,en,_ in entries}
base_phrase_en = {card['en'].casefold() for u in units for card in u['pairs']}
for category, arr, old in [('word',words,base_word_en),('phrase',extras,base_phrase_en)]:
    seen_en=set(old)
    for item in arr:
        assert set(item) == {'en','ru','level','topic','id'}, item
        assert len(item['en'])>=2 and len(item['ru'])>=2
        assert item['level'] in ('A2','B1','B2')
        assert re.search('[а-яё]',item['ru'], re.I) and re.search('[a-z]',item['en'],re.I)
        canonical = re.sub(r'\s+',' ',item['en'].casefold()).strip()
        assert canonical not in seen_en, (category,canonical)
        seen_en.add(canonical)
        expected = 'extra-'+category+'-'+hashlib.sha1(canonical.encode('utf-8')).hexdigest()[:14]
        assert item['id']==expected, (item['id'],expected)
        assert item['id'] not in seen_ids
        seen_ids.add(item['id'])
assert '<script src="expanded.js" defer></script>' in (root / 'app/src/main/assets/index.html').read_text()
print('OK: expansion',len(words),'new words +',len(extras),'new phrases;',
      'TOTAL',len(words)+len(entries),'words,',len(extras)+total,'phrases; topics',
      len(set(x['topic'] for x in words)),len(set(x['topic'] for x in extras)))
