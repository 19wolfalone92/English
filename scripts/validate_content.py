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
