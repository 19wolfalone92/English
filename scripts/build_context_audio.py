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
            with wave.open(str(wav),'wb') as output:
                output.setnchannels(1);output.setsampwidth(2);output.setframerate(22050)
                for i,(role,text,_) in enumerate(p['dialogue']):
                    line=td/f'{i}.wav'
                    run('espeak','-v',voices[roles.index(role)%2],'-s',str(speed),'-w',str(line),text)
                    with wave.open(str(line),'rb') as src:
                        assert (src.getnchannels(),src.getsampwidth(),src.getframerate())==(1,2,22050)
                        output.writeframes(src.readframes(src.getnframes()))
                    output.writeframes(b'\x00\x00'*6615)
            path=OUT/(p['id']+'.mp3')
            run('ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-codec:a','libmp3lame','-b:a','48k','-map_metadata','-1',str(path))
            run('ffmpeg','-hide_banner','-loglevel','error','-i',str(path),'-f','null','-')
            duration=float(run('ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(path)).stdout)
            assert 5<duration<120,(p['id'],duration)
            records.append(dict(id=p['id'],file=path.name,source='synthetic-espeak',voices=voices,speed_wpm=speed,seconds=round(duration,3),bytes=path.stat().st_size,sha256=hashlib.sha256(path.read_bytes()).hexdigest(),text_sha256=hashlib.sha256('\n'.join(r[1] for r in p['dialogue']).encode()).hexdigest()))
    (OUT/'manifest.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    assert set(f.name for f in OUT.glob('*.mp3'))=={r['file'] for r in records}
    print(f'PASS: {len(records)} locally generated synthetic dialogue MP3s, {sum(r["seconds"] for r in records):.1f} seconds, decoded and hashed')
if __name__=='__main__':build()
