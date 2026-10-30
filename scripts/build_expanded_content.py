"""Build the compact offline bilingual expansion from independently reviewable text files.

Rows: # LEVEL|topic, followed by English|Russian words or Russian|English phrases.
The generated item IDs are deterministic content hashes, so existing progress survives updates.
"""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'
ASSETS = ROOT / 'app/src/main/assets'


def rows(path, phrase=False):
    level = topic = None
    for n, raw in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
        line = raw.strip()
        if not line:
            continue
        if line.startswith('# '):
            level, topic = (s.strip() for s in line[2:].split('|', 1))
            if level not in ('A2', 'B1', 'B2') or not topic:
                raise ValueError(f'Invalid heading at {path}:{n}')
            continue
        if not level or line.count('|') != 1:
            raise ValueError(f'Invalid row at {path}:{n}')
        a, b = (s.strip() for s in line.split('|', 1))
        if not a or not b:
            raise ValueError(f'Empty translation {path}:{n}')
        en, ru = (b, a) if phrase else (a, b)
        if not re.search('[a-z]', en, re.I) or not re.search('[а-яё]', ru, re.I):
            raise ValueError(f'Wrong language at {path}:{n}: {line}')
        yield {'en': en, 'ru': ru, 'level': level, 'topic': topic}


def existing():
    p = ASSETS / 'curriculum.js'
    s = p.read_text(encoding='utf-8')
    lessons = json.loads(s[len('window.WOLFIE_LESSONS = '):-2])
    base_phrases = {x['en'].casefold() for u in lessons for x in u['pairs']}
    v = (ASSETS / 'vocab.js').read_text(encoding='utf-8')
    base_words = {x.casefold() for x in re.findall(r"\{level:'(?:A2|B1|B2)',en:'([^']+)',ru:'[^']+'\}", v)}
    return base_words, base_phrases


def build():
    base_words, base_phrases = existing()
    output = {}
    for typ, baseline in [('words', base_words), ('phrases', base_phrases)]:
        out = []
        seen = set(baseline)
        skipped = []
        for r in rows(DATA / (typ + '.txt'), typ == 'phrases'):
            normalized = re.sub(r'\s+', ' ', r['en'].casefold()).strip()
            if normalized in seen:
                skipped.append(r['en'])
                continue
            seen.add(normalized)
            token = hashlib.sha1(normalized.encode('utf-8')).hexdigest()[:14]
            r['id'] = ('extra-word-' if typ == 'words' else 'extra-phrase-') + token
            out.append(r)
        output[typ] = out
        by_level = {k: sum(x['level'] == k for x in out) for k in ('A2', 'B1', 'B2')}
        print(f'{typ}: {len(out)} NEW / {len(baseline)} existing, {by_level}; skipped duplicates: {len(skipped)}')
        if skipped:
            print('  Duplicates not added:', ', '.join(skipped[:25]))
    js = 'window.WOLFIE_EXTRA_WORDS = ' + json.dumps(output['words'], ensure_ascii=False, separators=(',', ':')) + ';\n'
    js += 'window.WOLFIE_EXTRA_PHRASES = ' + json.dumps(output['phrases'], ensure_ascii=False, separators=(',', ':')) + ';\n'
    (ASSETS / 'expanded.js').write_text(js, encoding='utf-8')
    return output


if __name__ == '__main__':
    build()
