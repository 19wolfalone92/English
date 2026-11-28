import asyncio,threading
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
ASSETS=ROOT/'app/src/main/assets'
EVIDENCE=ROOT/'ui-evidence';EVIDENCE.mkdir(exist_ok=True)
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
    await page.locator('#open-studio').click()
    await page.locator('#studio-level').select_option('B2')
    await page.locator('#studio-search').fill('signal list')
    await page.locator('[data-reading="mission-v2-242"]').click()
    await page.wait_for_function("document.querySelector('#studio-reading-audio').readyState>=1")
    assert await page.locator('#studio-reading-audio').evaluate('(a)=>Number.isFinite(a.duration)&&a.duration>10')
    await page.locator('#studio-reading-rate').select_option('0.8')
    assert await page.locator('#studio-reading-audio').evaluate('(a)=>a.playbackRate===0.8')
    await page.locator('.studio-chip-grid [data-word]').first.click()
    before=await page.evaluate("JSON.parse(localStorage.getItem('wolfie-progress')||'{}').xp||0")
    await page.locator('#studio-bookmark').click()
    state=await page.evaluate("JSON.parse(localStorage.getItem('wolfie-progress'))")
    assert len(state['studio']['saved'])==1 and state['xp']==before
    saved_id=next(iter(state['studio']['saved']))
    assert state['items'][saved_id]['stage']==0
    await page.screenshot(path=str(EVIDENCE/f'studio-library-{width}.png'))
    await page.locator('[data-studio-tab="words"]').click()
    await page.locator('#studio-saved-only').check()
    assert await page.locator('[data-vocab]').count()==1
    await page.screenshot(path=str(EVIDENCE/f'studio-dictionary-{width}.png'))
    await page.locator('[data-studio-tab="grammar"]').click()
    await page.locator('[name="studio-chart-answer"][value="1"]').check()
    await page.locator('#studio-chart-check').click()
    assert await page.locator('#studio-chart-check').is_disabled()
    await page.screenshot(path=str(EVIDENCE/f'studio-grammar-{width}.png'))
    await page.locator('[data-studio-tab="writing"]').click()
    await page.locator('#studio-draft').fill('I am agree. We can to wait.')
    await page.locator('#studio-save-version').click()
    await page.locator('#studio-inspect').click()
    assert await page.locator('[data-fix]').count()==2
    await page.locator('[data-fix="0"]').click()
    assert await page.locator('#studio-draft').input_value()=='I agree. We can to wait.'
    await page.locator('[data-fix="0"]').click()
    assert await page.locator('#studio-draft').input_value()=='I agree. We can wait.'
    await page.locator('#studio-save-version').click()
    await page.screenshot(path=str(EVIDENCE/f'studio-writing-{width}.png'))
    await page.reload(wait_until='networkidle')
    await page.locator('#open-studio').click();await page.locator('[data-studio-tab="writing"]').click()
    assert await page.locator('#studio-draft').input_value()=='I agree. We can wait.'
    assert await page.locator('[data-restore-version]').count()==2
    await page.locator('[data-studio-tab="teacher"]').click()
    await page.locator('#teacher-input').fill("She don't work here.")
    await page.locator('#teacher-check').click()
    assert await page.locator('.teacher-correction').inner_text()=="She doesn't work here."
    correct=await page.evaluate("window.WOLFIE_TEACHER.analyze(\"She don't work here.\").practice.correct")
    await page.locator(f'[data-teacher-choice="{correct}"]').click()
    assert 'верно' in await page.locator('#teacher-practice-result').inner_text()
    await page.screenshot(path=str(EVIDENCE/f'studio-teacher-{width}.png'))
    await page.reload(wait_until='networkidle')
    await page.locator('#open-studio').click()
    await page.locator('[data-studio-tab="teacher"]').click()
    assert await page.locator('#teacher-input').input_value()=="She don't work here."
    assert 'верно' in await page.locator('#teacher-history').inner_text()
    await page.locator('#teacher-input').fill('I have worked here since 2020.')
    await page.locator('#teacher-check').click()
    assert await page.locator('.teacher-correction').count()==0
    assert 'Нужна дополнительная проверка' in await page.locator('#teacher-answer').inner_text()
    # Actual alternate neural audio files: three distinct texts, two voices each.
    await page.locator('[data-studio-tab="library"]').click()
    for ident,title in [('mission-v2-009','A picnic with a backup plan'),('mission-v2-129','Requesting leave with a handover'),('mission-v2-219','The contract with an unclear scope')]:
     await page.locator('#studio-search').fill(title)
     await page.locator(f'[data-reading="{ident}"]').click()
     assert await page.locator('#studio-reading-voice option').count()==3
     for locale in ('en-us','en-gb'):
      await page.locator('#studio-reading-voice').select_option(f'neural_audio/{ident}-{locale}.mp3')
      await page.wait_for_function("(path)=>{const a=document.querySelector('#studio-reading-audio');return a.readyState>=1 && a.currentSrc.endsWith(path) && a.duration>30}",arg=f'{ident}-{locale}.mp3')
     if width==360 and ident=='mission-v2-009':
      await page.locator('#studio-reading-audio').evaluate('(a)=>a.play()')
      await page.wait_for_function("document.querySelector('#studio-reading-audio').currentTime>.25")
      await page.locator('#studio-reading-audio').evaluate('(a)=>a.pause()')
      await page.screenshot(path=str(EVIDENCE/'studio-neural-360.png'))
     await page.locator('#studio-library-back').click()
    await page.locator('#studio-back').click()
    await page.locator('[data-course="1"]').click()
    await page.locator('#begin-course').click()
    await page.locator('#study-context').click()
    await page.locator('[data-ctx-tab="grammar"]').click()
    await page.locator('[name="ctx-g-0"][value="0"]').check()
    await page.locator('#ctx-gcheck-0').click()
    await page.locator('#ctx-exit').click();await page.locator('#study-exit').click()
    await page.locator('#open-studio-profile').click()
    assert '0/1' in await page.locator('#studio-content').inner_text()
    await page.screenshot(path=str(EVIDENCE/f'studio-profile-{width}.png'))
    await page.locator('#studio-review-errors').click()
    assert await page.locator('[data-correct]').count()==1
    await page.locator('.studio-card summary').click()
    await page.locator('[data-correct]').click()
    answer=await page.evaluate("(()=>{const e=window.WOLFIE_CONTEXT.packs[0].grammar.exercises[0];return e[2][e[3]]})()")
    await page.locator('[data-correction-slot] input').fill(answer)
    await page.locator('[data-correction-slot] button').click()
    state=await page.evaluate("JSON.parse(localStorage.getItem('wolfie-progress'))")
    assert state['studio']['corrections']['mission-v2-002:g0']['ok']
    assert state['contextLessons']['mission-v2-002']['checks']['g0']['ok']==False
    assert state['xp']==before
    await page.screenshot(path=str(EVIDENCE/f'studio-errors-{width}.png'))
    await page.locator('[data-studio-tab="profile"]').click()
    assert '0/1' in await page.locator('#studio-content').inner_text()
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    assert not errors,errors
    await ctx.close()
   await browser.close()
 finally:server.shutdown();server.server_close()
 print('PASS: Study Studio library search/filter, dictionary queue without XP, grammar answer, writing corrections and versions, original error and repeat correction remain separate at 360/700px')
if __name__=='__main__':asyncio.run(main())
