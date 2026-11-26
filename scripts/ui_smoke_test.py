import asyncio,threading
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.async_api import async_playwright
ASSETS=Path(__file__).resolve().parents[1]/'app'/'src'/'main'/'assets'
SCREENSHOTS=ASSETS.parents[3]/'ui-evidence'
SCREENSHOTS.mkdir(exist_ok=True)
class QuietHandler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
async def main():
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ASSETS)));threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  async with async_playwright() as p:
   browser=await p.chromium.launch(headless=True)
   for width in (360,700):
    context=await browser.new_context(viewport={'width':width,'height':820})
    await context.add_init_script("""Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[],cancel(){},speak(){}}});""")
    page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto(f'http://127.0.0.1:{server.server_port}/index.html',wait_until='networkidle')
    assert await page.get_by_role('heading',name='Продолжаем учиться?').is_visible()
    assert await page.locator('.course-month').count()==10
    await page.screenshot(path=str(SCREENSHOTS/f'home-{width}-light.png'))
    await page.locator('#open-diagnostic').click()
    await page.locator('[data-diag-level="A2"]').click()
    await page.screenshot(path=str(SCREENSHOTS/f'diagnostic-{width}-light.png'))
    await page.locator('[name="diag-choice"]').nth(1).check()
    await page.locator('#diag-next').click()
    await page.reload(wait_until='networkidle')
    await page.locator('#open-diagnostic').click()
    await page.locator('#diag-resume').click()
    assert await page.get_by_text('2/8',exact=False).is_visible()
    for _ in range(7):await page.locator('#diag-skip').click()
    await page.locator('#diag-writing').fill('A draft for a teacher.')
    await page.locator('#diag-finish').click()
    assert await page.get_by_text('Listening · Speaking · Writing — не оценены').is_visible()
    await page.locator('#diag-menu').click()
    await page.locator('[data-diag-level="A2"]').click()
    active=await page.evaluate("JSON.parse(localStorage.getItem('wolfie-progress')).diagnostic.active.formId")
    assert active=='diagnostic-A2-b'
    await page.locator('#diag-back').click()
    assert await page.locator('[data-course="1"]').is_enabled()
    month=page.locator('.course-month').first
    if not await month.evaluate('(e)=>e.open'):await month.locator('summary').click()
    await page.locator('[data-course="0"]').click();await page.get_by_role('button',name='Начать тренировку →').click()
    assert await page.locator('[data-study]').count()==8 and await page.locator('[data-study="exam"]').is_disabled()
    await page.get_by_role('button',name='Включить тёмную тему').click();assert await page.locator('html').get_attribute('data-theme')=='dark'
    await page.screenshot(path=str(SCREENSHOTS/f'lesson-{width}-dark.png'))
    await page.get_by_role('button',name='Включить светлую тему').click()
    await page.locator('[data-study="review"]').click();assert await page.get_by_text('Очередь пуста').is_visible();await page.locator('#study-complete').click()
    await page.locator('[data-study="vocab"]').click();assert await page.locator('.study-pair').count()==15
    for i in range(5):await page.locator(f'input[name="vocabQuiz{i}"][value="1"]').check()
    await page.locator('#vocabQuiz-check').click();await page.locator('#vocabQuiz-finish').click()
    await page.locator('[data-study="grammar"]').click()
    ans=await page.evaluate("""()=>{let k=document.querySelector('.grammar-box h2').textContent;return window.WOLFIE_GRAMMAR_QUIZ[k].map((q,i)=>({i,c:q.correct}))}""")
    for x in ans:await page.locator(f'input[name="grammar-q{x["i"]}"][value="{x["c"]}"]').check()
    await page.locator('#study-grammar').fill('I work every day. She works in a small office.');await page.locator('#study-complete').click()
    await page.locator('[data-study="reading"]').click()
    ans=await page.evaluate("()=>window.WOLFIE_READINGS[0].questions.map((q,i)=>({i,c:q.correct}))")
    for x in ans:await page.locator(f'input[name="rq{x["i"]}"][value="{x["c"]}"]').check()
    await page.locator('#study-complete').click()
    await page.locator('[data-study="listening"]').click();assert await page.locator('.study-warning').is_visible()
    assert await page.locator('#study-complete').count()==0;await page.locator('#study-back').click()
    await page.locator('[data-study="speaking"]').click()
    answers=['I would explain the problem and describe what happened first.','I would compare two possible solutions and choose the safer option.','I think clear communication helps everyone understand the next step.']
    for i,x in enumerate(answers):await page.locator(f'[data-speech="{i}"]').fill(x)
    await page.locator('#study-complete').click()
    saved=await page.evaluate("JSON.parse(localStorage.getItem('wolfie-progress')||'{}')")
    assert saved['study']['course-001']['assessment']['speaking']['pronunciation']=='not-assessed'
    await page.locator('[data-study="writing"]').click()
    essay='I usually plan my day before work. First, I check the tasks and decide what is important. I write clear notes because they help me remember details. If a problem appears, I ask a colleague for advice. After that, I review the result and prepare the next step. This routine makes my work easier and gives me confidence.'
    await page.locator('#study-essay').fill(essay);await page.wait_for_timeout(450);await page.locator('#essay-review').click()
    assert await page.get_by_text('Структурный анализ: 4/4').is_visible()
    await page.locator('#essay-self-review').check();await page.locator('#study-complete').click()
    saved=await page.evaluate("JSON.parse(localStorage.getItem('wolfie-progress')||'{}')");assert saved['study']['course-001']['done']['writing']
    assert await page.locator('[data-study="exam"]').is_disabled()
    await page.locator('#study-exit').click();await page.locator('[data-tab="stats"]').click()
    await page.locator('#font-scale').select_option('1.2');assert await page.locator('html').evaluate('(e)=>getComputedStyle(e).fontSize')!='16px'
    if width==360:assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    # Test the real browser backup flow, including tamper rejection and migration.
    await page.screenshot(path=str(SCREENSHOTS/f'progress-{width}-light.png'))
    await page.locator('#backup-export').scroll_into_view_if_needed()
    async with page.expect_download() as downloaded:
     await page.locator('#backup-export').click()
    download=await downloaded.value
    path=await download.path()
    import json
    backup=json.loads(path.read_text())
    baseline=json.loads(backup['payload'])
    assert baseline['study']['course-001']['done']['writing']
    await page.locator('#backup-file').set_input_files({'name':'corrupt.json','mimeType':'application/json','buffer':json.dumps({**backup,'sha256':'0'*64}).encode()})
    await page.get_by_text('Импорт отклонён:',exact=False).wait_for()
    page.once('dialog',lambda dialog:dialog.accept())
    await page.locator('#backup-file').set_input_files({'name':'valid.json','mimeType':'application/json','buffer':json.dumps(backup).encode()})
    await page.get_by_text('Прогресс восстановлен.',exact=True).wait_for()
    saved=await page.evaluate("JSON.parse(localStorage.getItem('wolfie-progress'))")
    assert saved['study']==baseline['study'] and saved['diagnostic']==baseline['diagnostic']
    # Corrupted current record must restore the previous valid generation, not clear it.
    await page.evaluate("""v=>{localStorage.setItem('wolfie-progress-prev',JSON.stringify(v));localStorage.setItem('wolfie-progress','broken')}""",baseline)
    await page.reload(wait_until='networkidle')
    assert await page.get_by_text('Восстановлена предыдущая копия прогресса.',exact=True).is_visible()
    await page.locator('[data-tab="stats"]').click()
    assert await page.get_by_text('Прогресс и навыки',exact=True).is_visible()
    assert not errors,errors;await context.close()
   await browser.close()
 finally:server.shutdown();server.server_close()
 print('PASS: browser lesson and diagnostic, themes, font scaling, backup export/import, corrupt checksum rejection, previous-generation recovery at 360/700 px')
if __name__=='__main__':asyncio.run(main())
