import asyncio
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import os, threading
from playwright.async_api import async_playwright

async def main():
    asset_dir=Path(__file__).resolve().parents[1]/'app/src/main/assets'
    html=(asset_dir/'index.html').read_text(encoding='utf-8')
    html=html.replace('<link rel="stylesheet" href="styles.css">', '<style>'+ (asset_dir/'styles.css').read_text(encoding='utf-8') + '</style>')
    html=html.replace('<link rel="stylesheet" href="ui.css">', '<style>'+ (asset_dir/'ui.css').read_text(encoding='utf-8') + '</style>')
    for asset in ('curriculum.js','vocab.js','expanded.js','practice.js','app.js'):
        html=html.replace(f'<script src="{asset}" defer></script>', '')
    scripts=''.join('<script>'+ (asset_dir/asset).read_text(encoding='utf-8') + '</script>' for asset in ('curriculum.js','vocab.js','expanded.js','practice.js','app.js'))
    html=html.replace('</body>',scripts+'</body>')
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--allow-file-access-from-files'])
        for width in (360, 700):
            ctx=await browser.new_context(viewport={'width':width,'height':780})
            page=await ctx.new_page()
            errors=[]
            page.on('pageerror',lambda err: errors.append(str(err)))
            await page.set_content(html)
            assert await page.get_by_role('heading',name='Продолжаем учиться?').is_visible()
            assert await page.locator('.shortcut').count() == 6
            await page.get_by_role('button',name='Слова Пополняй словарь').click()
            assert await page.locator('#card-phrase').is_visible()
            await page.get_by_role('button',name='✕ Назад').click()
            await page.get_by_role('button',name='Уроки').click()
            assert await page.get_by_role('heading',name='Продолжаем учиться?').is_visible()
            assert await page.locator('.logo-img').count() == 1
            assert await page.evaluate('getComputedStyle(document.documentElement).colorScheme') == 'light'
            await page.get_by_role('button',name='Практика').click()
            assert await page.get_by_role('heading',name='Практика 🎧').is_visible()
            assert await page.get_by_role('button',name='Начать · 10 вопросов').is_visible()
            totals=await page.evaluate("""[window.WOLFIE_WORDS.length + window.WOLFIE_EXTRA_WORDS.length, window.WOLFIE_LESSONS.flatMap(x=>x.pairs).length + window.WOLFIE_EXTRA_PHRASES.length]""" )
            assert totals[0]>=1000 and totals[1]>=1000, totals
            assert await page.locator('#listen-topic option').count()>=10
            assert await page.locator('#card-topic option').count()>=10
            await page.locator('#practice-level').select_option('B2')
            assert await page.locator('#listen-topic option').count()>=20
            await page.locator('#card-type').select_option('phrases')
            assert await page.locator('#card-topic option').count()>=20
            await page.locator('#card-type').select_option('words')
            await page.locator('#practice-level').select_option('A2')
            await page.get_by_role('button',name='Учить · до 12 карточек').click()
            assert await page.locator('#card-phrase').is_visible()
            initial=await page.locator('#card-phrase').inner_text()
            await page.locator('#flip').click()
            translated=await page.locator('#card-phrase').inner_text()
            assert initial!=translated
            await page.get_by_role('button',name='Я вспомнил').click()
            assert '2 / 12' in await page.locator('.question-progress').inner_text()
            await page.get_by_role('button',name='✕ Назад').click()
            await page.locator('#card-type').select_option('phrases')
            await page.locator('#card-side').select_option('ru')
            await page.get_by_role('button',name='Учить · до 12 карточек').click()
            assert 'РУССКИЙ' == await page.locator('#card-label').inner_text()
            assert await page.locator('#card-speak').is_disabled()
            await page.locator('#flip').click()
            assert 'ENGLISH' == await page.locator('#card-label').inner_text()
            await page.get_by_role('button',name='Повторить').click()
            assert '2 / 13' in await page.locator('.question-progress').inner_text()
            await page.get_by_role('button',name='✕ Назад').click()
            await page.get_by_role('button',name='Начать · 10 вопросов').click()
            if await page.get_by_role('heading',name='Английский голос недоступен').count():
                assert await page.get_by_role('button',name='Проверить ещё раз').is_visible()
            else:
                assert await page.locator('#audio-play').is_visible()
                assert len(await page.locator('.answer').all())==4
                await page.locator('.answer').first.click()
                assert await page.locator('#practice-notice').is_visible()
                await page.get_by_role('button',name='Далее →').click()
                assert '2 / 10' in await page.locator('.question-progress').inner_text()
            assert not errors, (width, errors)
            # A2 navigation on tiny screens must not trigger horizontal scroll
            if width==360:
                assert await page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), 'Horizontal overflow'
            await ctx.close()
        await browser.close()
    print('PASS: practice menu, both flashcard directions, progress, 10-question listening and mobile layout')

asyncio.run(main())
