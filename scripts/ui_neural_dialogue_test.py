#!/usr/bin/env python3
import asyncio,threading
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1];ASSETS=ROOT/'app/src/main/assets';EVIDENCE=ROOT/'ui-evidence';EVIDENCE.mkdir(exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
async def main():
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ASSETS)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  async with async_playwright() as p:
   browser=await p.chromium.launch(headless=True)
   for width in (360,700):
    ctx=await browser.new_context(viewport={'width':width,'height':820});page=await ctx.new_page();errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto(f'http://127.0.0.1:{server.server_port}/index.html',wait_until='networkidle')
    rows=await page.evaluate('window.WOLFIE_NEURAL_DIALOGUES')
    assert len(rows)==21
    for i,r in enumerate(rows):
     await page.locator(f'[data-course="{r["day"]-1}"]').click()
     await page.locator('#begin-course').click();await page.locator('#study-context').click()
     await page.locator('[data-ctx-tab="audio"]').click()
     await page.wait_for_function("document.querySelector('#ctx-audio').readyState>=1")
     assert await page.locator('#ctx-voice').input_value()=='kokoro'
     assert abs(await page.locator('#ctx-audio').evaluate('(a)=>a.duration')-r['seconds'])<.2
     if i==0:
      await page.locator('#ctx-voice').select_option('espeak')
      await page.wait_for_function("document.querySelector('#ctx-audio').currentSrc.includes('/context_audio/')&&document.querySelector('#ctx-audio').readyState>=1")
      await page.locator('#ctx-voice').select_option('kokoro')
      await page.wait_for_function("document.querySelector('#ctx-audio').currentSrc.includes('/neural_dialogue/')&&document.querySelector('#ctx-audio').readyState>=1")
      await page.locator('#ctx-transcript summary').click()
      await page.locator('[data-line-repeat="1"]').click()
      await page.wait_for_function("document.querySelector('[data-dialogue-line=\"1\"]').getAttribute('aria-current')==='true'")
      await page.screenshot(path=str(EVIDENCE/f'neural-dialogue-{width}.png'))
      await page.wait_for_function("document.querySelector('#ctx-audio').paused",timeout=30000)
      state=await page.evaluate("JSON.parse(localStorage.getItem('wolfie-progress')).contextLessons['mission-v2-001']")
      assert state['transcriptSeen'] and not state.get('playbackEnded'),state
     assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
     await page.locator('#ctx-exit').click();await page.locator('#study-exit').click()
    assert not errors,errors;await ctx.close()
   await browser.close()
 finally:server.shutdown();server.server_close()
 print('PASS: 21 neural dialogues at two viewport sizes; actual playback and timed transcript, reserve audio, segment does not qualify as unassisted listening')
if __name__=='__main__':asyncio.run(main())
