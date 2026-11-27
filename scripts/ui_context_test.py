import asyncio,threading
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/'app/src/main/assets'
EVIDENCE=ROOT/'ui-evidence'
EVIDENCE.mkdir(exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
async def main():
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ASSETS)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  async with async_playwright() as p:
   browser=await p.chromium.launch(headless=True)
   for width in (360,700):
    ctx=await browser.new_context(viewport={'width':width,'height':820})
    page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto(f'http://127.0.0.1:{server.server_port}/index.html',wait_until='networkidle')
    packs=await page.evaluate('window.WOLFIE_CONTEXT.packs.map(p=>({day:p.day,ru:p.ru,id:p.id,cardCount:p.cards.length,grammarCount:p.grammar.exercises.length}))')
    assert len(packs)==80
    # Open every authored mission through the actual course UI, then inspect each block.
    for i,pack in enumerate(packs):
     day=pack['day'];m=(day-1)//30
     month=page.locator('.course-month').nth(m)
     if not await month.evaluate('(e)=>e.open'):await month.locator('summary').click()
     await page.locator(f'[data-course="{day-1}"]').click()
     await page.locator('#begin-course').click()
     await page.locator('#study-context').click()
     assert await page.get_by_role('heading',name=pack['ru'],exact=True).is_visible()
     for tab in ('review','vocab','grammar','reading','audio','speaking','writing','final','result'):
      await page.locator(f'[data-ctx-tab="{tab}"]').click()
      if tab=='final':assert await page.locator('#ctx-final-submit').is_visible()
      if tab=='vocab':assert await page.locator('[data-ctx-vcheck]').count()==pack['cardCount']
      if tab=='grammar':assert await page.locator('[id^="ctx-gcheck-"]').count()==pack['grammarCount']
      if tab=='reading':assert await page.locator('.study-reading').is_visible()
      if tab=='speaking':assert await page.locator('[id^="ctx-s-"]').count()==5
      if tab=='writing':assert await page.locator('#ctx-writing-choice option').count()==3
      if tab=='audio':
       await page.wait_for_function("document.querySelector('#ctx-audio').readyState>=1")
       assert await page.locator('#ctx-audio').evaluate('(a)=>Number.isFinite(a.duration)&&a.duration>5')
     if i==0:
      await page.locator('[data-ctx-tab="overview"]').click()
      await page.locator('#ctx-mode').select_option('quick')
      assert await page.locator('[data-ctx-jump]').count()==2
      await page.locator('#ctx-mode').select_option('standard')
      assert await page.locator('[data-ctx-jump]').count()==8
      await page.locator('[data-ctx-tab="final"]').click()
      await page.locator('#ctx-final-submit').click()
      assert await page.locator('#ctx-final-error').is_visible()
      await page.locator('[name="ctx-final-0"][value="1"]').check()
      await page.locator('#ctx-final-1').fill('a few')
      await page.locator('[name="ctx-final-2"][value="0"]').check()
      await page.locator('#ctx-final-submit').click()
      assert await page.get_by_role('heading',name='Результат: 3/3').is_visible()
      await page.locator('[data-ctx-tab="vocab"]').click()
      expected=await page.evaluate('window.WOLFIE_CONTEXT.packs[0].cards[0].en')
      await page.locator('#ctx-v-0').fill(expected);await page.locator('[data-ctx-vcheck="0"]').click()
      assert await page.locator('[data-ctx-vcheck="0"]').is_disabled()
      await page.locator('[data-ctx-tab="grammar"]').click()
      await page.locator('[name="ctx-g-0"][value="1"]').check();await page.locator('#ctx-gcheck-0').click()
      await page.locator('#ctx-g-1').fill('a few');await page.locator('#ctx-gcheck-1').click()
      indices=await page.evaluate("""()=>{const ex=window.WOLFIE_CONTEXT.packs[0].grammar.exercises[2];return ex[3].split(' ').map(x=>ex[2].indexOf(x))}""")
      for n in indices:await page.locator(f'[data-order-group="2"][data-order-index="{n}"]').click()
      await page.locator('#ctx-gcheck-2').click()
      await page.screenshot(path=str(EVIDENCE/f'context-grammar-{width}.png'))
      await page.locator('[data-ctx-tab="audio"]').click()
      await page.locator('[name="ctx-mc-audio"][value="0"]').check()
      await page.locator('#ctx-mc-audio').click()
      assert not await page.locator('#ctx-mc-audio').is_disabled()
      await page.locator('#ctx-transcript summary').click()
      await page.locator('#ctx-mc-audio').click()
      assert await page.locator('#ctx-mc-audio').is_disabled()
      await page.screenshot(path=str(EVIDENCE/f'context-dialogue-{width}.png'))
      await page.locator('[data-ctx-tab="writing"]').click()
      await page.locator('#ctx-writing').fill('A private draft for this task.')
      await page.locator('#ctx-writing-choice').select_option('1')
      await page.locator('#ctx-writing').fill('Another draft.')
      await page.locator('#ctx-writing-choice').select_option('0')
      assert await page.locator('#ctx-writing').input_value()=='A private draft for this task.'
      await page.reload(wait_until='networkidle')
      month=page.locator('.course-month').first
      if not await month.evaluate('(e)=>e.open'):await month.locator('summary').click()
      await page.locator('[data-course="1"]').click()
      await page.locator('#begin-course').click();await page.locator('#study-context').click()
      assert await page.locator('#ctx-writing').input_value()=='A private draft for this task.'
      saved=await page.evaluate("JSON.parse(localStorage.getItem('wolfie-progress'))")
      s=saved['contextLessons'][pack['id']]
      assert all(s['checks'][k]['ok'] for k in ('v0','g0','g1','g2'))
      assert s['checks']['audio']['assisted']
      assert s['finalSubmitted'] and all(s['checks'][k]['ok'] for k in ('f0','f1','f2'))
      assert not saved.get('finished',{}).get('course-002',{}).get('done',False)
      await page.get_by_role('button',name='Включить тёмную тему').click()
      await page.screenshot(path=str(EVIDENCE/f'context-writing-dark-{width}.png'))
      await page.get_by_role('button',name='Включить светлую тему').click()
     assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
     await page.locator('#ctx-exit').click();await page.locator('#study-exit').click()
    assert not errors,errors
    await ctx.close()
   # Independent actual media playback: a seek must not qualify, but uninterrupted playback may.
   for trial in ('seek','full'):
    ctx=await browser.new_context(viewport={'width':360,'height':820})
    page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto(f'http://127.0.0.1:{server.server_port}/index.html',wait_until='networkidle')
    assert await page.locator('#home-course-progress').inner_text()=='0/300'
    month=page.locator('.course-month').first
    if not await month.evaluate('(e)=>e.open'):await month.locator('summary').click()
    await page.locator('[data-course="1"]').click()
    await page.locator('#begin-course').click()
    await page.locator('#study-context').click()
    await page.locator('[data-ctx-tab="audio"]').click()
    await page.wait_for_function("document.querySelector('#ctx-audio').readyState>=1")
    await page.locator('#ctx-rate').select_option('1.2')
    await page.locator('#ctx-audio').evaluate('(a)=>a.play()')
    await page.wait_for_function("document.querySelector('#ctx-audio').currentTime>.25")
    if trial=='seek':await page.locator('#ctx-audio').evaluate('(a)=>a.currentTime=a.duration-.3')
    await page.wait_for_function("document.querySelector('#ctx-audio').ended && document.querySelector('#ctx-audio-status').textContent.length>0",timeout=60000)
    await page.locator('[name="ctx-mc-audio"][value="0"]').check()
    await page.locator('#ctx-mc-audio').click()
    state=await page.evaluate("JSON.parse(localStorage.getItem('wolfie-progress')).contextLessons['mission-v2-002']")
    if trial=='seek':
     assert not state.get('playbackEnded') and not state['checks'].get('audio'),state
    else:
     assert state['playbackEnded'] and state['checks']['audio']['ok'] and not state['checks']['audio']['assisted'],state
    assert not errors,errors
    await ctx.close()
   print('PASS: actual continuous HTML audio playback qualifies an unassisted answer; seeking does not; this does not prove audibility')
   await browser.close()
 finally:server.shutdown();server.server_close()
 print('PASS: all 80 contextual packages reachable at 360/700 px, all 80 audio files load, three grammar interactions, recall, transcript-assisted distinction, draft resume, no false day completion')
if __name__=='__main__':asyncio.run(main())
