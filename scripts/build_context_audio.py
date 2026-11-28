#!/usr/bin/env python3
"""Build original dialogue audio with offline eSpeak and FFmpeg.
Synthetic speech, not a human recording. No paid API or external text."""
import json, hashlib, subprocess, tempfile, wave, shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/'app/src/main/assets'
OUT=ASSETS/'context_audio'
def load():
    prefix='window.WOLFIE_CONTEXT_PACKS=(window.WOLFIE_CONTEXT_PACKS||[]).concat('
    return [p for f in sorted(ASSETS.glob('context_packs_*.js')) for p in json.loads(f.read_text(encoding='utf-8').removeprefix(prefix).removesuffix(');\n'))]
def run(*args):
    return subprocess.run(args,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
def build():
    if not shutil.which('espeak') or not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
        raise RuntimeError('eSpeak and FFmpeg are required')
    OUT.mkdir(exist_ok=True)
    records=[]
    for p in load():
        with tempfile.TemporaryDirectory() as td:
            td=Path(td)
            wav=td/'dialogue.wav'
            voices=['en-us+m3','en-gb+f2'] if p['level']=='A2' else ['en-gb+m2','en-us+f3']
            speed={'A2':140,'B1':155,'B2':170}[p['level']]
            roles=list(dict.fromkeys(r[0] for r in p['dialogue']))
            voices=(voices+['en-us+m4','en-gb+f4'])[:len(roles)]
            assert len(roles)==len(voices) and len(set(voices))==len(roles),p['id']
            role_voices=dict(zip(roles,voices))
            with wave.open(str(wav),'wb') as output:
                output.setnchannels(1);output.setsampwidth(2);output.setframerate(22050)
                for i,(role,text,_) in enumerate(p['dialogue']):
                    line=td/f'{i}.wav'
                    run('espeak','-v',role_voices[role],'-s',str(speed),'-w',str(line),text)
                    with wave.open(str(line),'rb') as src:
                        assert (src.getnchannels(),src.getsampwidth(),src.getframerate())==(1,2,22050)
                        output.writeframes(src.readframes(src.getnframes()))
                    output.writeframes(b'\x00\x00'*6615)
            path=OUT/(p['id']+'.mp3')
            run('ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','48k','-map_metadata','-1',str(path))
            run('ffmpeg','-hide_banner','-loglevel','error','-i',str(path),'-f','null','-')
            duration=float(run('ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(path)).stdout)
            assert 5<duration<120,(p['id'],duration)
            records.append(dict(id=p['id'],file=path.name,source='synthetic-espeak',voices=voices,role_voices=role_voices,speed_wpm=speed,seconds=round(duration,3),bytes=path.stat().st_size,sha256=hashlib.sha256(path.read_bytes()).hexdigest(),text_sha256=hashlib.sha256('\n'.join(r[1] for r in p['dialogue']).encode()).hexdigest()))
    (OUT/'manifest.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    assert set(f.name for f in OUT.glob('*.mp3'))=={r['file'] for r in records}
    print(f'PASS: {len(records)} locally generated synthetic dialogue MP3s, {sum(r["seconds"] for r in records):.1f} seconds, decoded and hashed')
def build_reading():
    """Narration of existing authored reading texts, not new independent listening tasks."""
    out=ASSETS/'reading_audio'
    out.mkdir(exist_ok=True)
    records=[]
    legacy=[]
    for f in sorted(ASSETS.glob('readings_*.js')):
        source=f.read_text(encoding='utf-8')
        legacy.extend(json.loads(source.split('.concat(',1)[1].removesuffix(');\n')))
    rows=[dict(id=p['id'],level=p['level'],title=p['reading']['title'],paragraphs=p['reading']['paragraphs']) for p in load()]
    rows += [dict(id=f'legacy-{i}',level='legacy',title=p['title'],paragraphs=p['paragraphs']) for i,p in enumerate(legacy)]
    assert len({r['id'] for r in rows})==len(rows)
    for row in rows:
        voice='en-us+f2' if row['level'] in ('A2','legacy') else 'en-gb+m2'
        speed={'A2':140,'B1':155,'B2':170,'legacy':145}[row['level']]
        transcript='\n\n'.join(row['paragraphs'])
        with tempfile.TemporaryDirectory() as td:
            td=Path(td)
            txt=td/'text.txt';txt.write_text(transcript,encoding='utf-8')
            wav=td/'narration.wav'
            run('espeak','-v',voice,'-s',str(speed),'-w',str(wav),'-f',str(txt))
            path=out/(row['id']+'.mp3')
            run('ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','48k','-map_metadata','-1',str(path))
            run('ffmpeg','-hide_banner','-loglevel','error','-i',str(path),'-f','null','-')
        duration=float(run('ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(path)).stdout)
        assert 10<duration<600,(row['id'],duration)
        records.append(dict(id=row['id'],level=row['level'],title=row['title'],file=path.name,source='synthetic-espeak',voice=voice,speed_wpm=speed,seconds=round(duration,3),bytes=path.stat().st_size,sha256=hashlib.sha256(path.read_bytes()).hexdigest(),text_sha256=hashlib.sha256(transcript.encode()).hexdigest(),linked_task='reading',assessment=False))
    (out/'manifest.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    assert set(f.name for f in out.glob('*.mp3'))=={r['file'] for r in records}
    print(f'PASS: {len(records)} separate synthetic reading narrations, {sum(r["seconds"] for r in records):.1f} seconds, decoded and hashed')
if __name__=='__main__':
    build()
    build_reading()

