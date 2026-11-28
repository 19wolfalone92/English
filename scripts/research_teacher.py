#!/usr/bin/env python3
"""CPU research only: separate exact-answer and open-response evidence. Not an Android integration."""
import argparse,hashlib,json,os,re,subprocess,time,urllib.request,resource
from pathlib import Path
p=argparse.ArgumentParser()
p.add_argument('--server',required=True);p.add_argument('--model',required=True);p.add_argument('--out',required=True);p.add_argument('--qwen3',action='store_true')
a=p.parse_args();out=Path(a.out);out.mkdir(parents=True,exist_ok=True)
bank=json.loads(Path('research/teacher_exam.json').read_text())
def norm(s):return re.sub(r'\s+',' ',s.strip()).lower().rstrip('.?!')
def api(path,payload=None):
    data=None if payload is None else json.dumps(payload).encode()
    req=urllib.request.Request('http://127.0.0.1:19091'+path,data=data,headers={'Content-Type':'application/json'})
    with urllib.request.urlopen(req,timeout=90) as r:return json.load(r)
with (out/'server.log').open('w') as log:
    proc=subprocess.Popen([a.server,'-m',a.model,'--host','127.0.0.1','--port','19091','-c','2048','-t','4','-ngl','0','--parallel','1']+(['--jinja'] if a.qwen3 else []),stdout=log,stderr=subprocess.STDOUT)
    try:
        for i in range(120):
            if proc.poll() is not None:raise RuntimeError('server exited')
            try:
                if api('/health').get('status')=='ok':break
            except Exception:time.sleep(1)
        else:raise RuntimeError('server readiness timeout')
        rows=[]
        for item in bank:
            start=time.monotonic()
            result=api('/v1/chat/completions',dict(model='local',messages=[dict(role='system',content='You are a careful English teacher for a Russian-speaking adult. Follow the requested response format. Admit uncertainty; never invent facts.'),dict(role='user',content=item['task']+('\n/no_think' if a.qwen3 else ''))],temperature=0,seed=42,max_tokens=220,stream=False))
            raw=result['choices'][0]['message']['content']; assert isinstance(raw,str)
            answer=re.sub(r'^\s*<think>\s*</think>\s*','',raw)
            assert answer.strip()
            row=dict(id=item['id'],level=item['level'],answer=answer,raw_answer=raw,elapsed_seconds=round(time.monotonic()-start,3),usage=result.get('usage'),finish_reason=result['choices'][0].get('finish_reason'),status='OPEN_REVIEW_REQUIRED')
            if 'key' in item:row.update(expected=item['key'],status='PASS' if norm(answer)==norm(item['key']) else 'FAIL')
            rows.append(row)
            (out/'responses.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2))
        status=Path(f'/proc/{proc.pid}/status').read_text()
        summary=dict(model=Path(a.model).name,bytes=Path(a.model).stat().st_size,sha256=hashlib.file_digest(open(a.model,'rb'),'sha256').hexdigest(),exact_pass=sum(r['status']=='PASS' for r in rows),exact_total=sum('key' in i for i in bank),open_review_required=sum(r['status']=='OPEN_REVIEW_REQUIRED' for r in rows),rss_lines=[x for x in status.splitlines() if x.startswith(('VmRSS:','VmHWM:'))],total_elapsed_seconds=round(sum(r['elapsed_seconds'] for r in rows),3),runtime='llama.cpp b6500 CPU Linux, NOT Android')
        (out/'summary.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary))
    finally:
        proc.terminate()
        try:proc.wait(timeout=10)
        except subprocess.TimeoutExpired:proc.kill();proc.wait()
