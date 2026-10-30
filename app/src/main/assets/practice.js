(()=>{'use strict';
const words=Array.isArray(window.WOLFIE_WORDS)?window.WOLFIE_WORDS:[];
const phrases=(window.WOLFIE_LESSONS||[]).flatMap(x=>x.pairs.map(p=>({...p,level:x.level})));
const levels=['A2','B1','B2'];
let root=null,core=null,round=null;
const h=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;};
const levelOptions=()=>levels.map(l=>`<option value="${l}">${l}</option>`).join('');
function prefs(){if(!core.store.practicePrefs||typeof core.store.practicePrefs!=='object')core.store.practicePrefs={};return core.store.practicePrefs;}
function currentPool(type,level){return (type==='words'?words:phrases).filter(x=>x.level===level);}
function sortedPool(type,level){const now=Date.now(),list=shuffle(currentPool(type,level));return list.sort((a,b)=>{
  const aS=core.store.items[a.id],bS=core.store.items[b.id];
  const score=s=>!s?0:Number(s.due)<=now?1:2;
  return score(aS)-score(bS);
});}
function mount(el,api){root=el;core=api;round=null;showMenu();}
function showMenu(){round=null;const p=prefs(),level=levels.includes(p.level)?p.level:'A2';const wordCount=words.filter(w=>w.level===level).length;const phraseCount=phrases.filter(w=>w.level===level).length;
const dueWords=words.filter(w=>w.level===level&&core.store.items[w.id]&&Number(core.store.items[w.id].due)<=Date.now()).length;
root.innerHTML=`<h1>Практика 🎧</h1><p>Слушай английскую речь, выбирай русский перевод и закрепляй слова карточками. Начни с A2 и постепенно переходи к B1 и B2.</p>
<label class="field-label" for="practice-level">Уровень материала</label><select class="input" id="practice-level">${levelOptions()}</select>
<div class="practice-modes"><section class="practice-mode"><div class="mode-symbol">🎧</div><h2>Аудирование</h2><p>Услышь английскую фразу, затем выбери её значение на русском. Английский текст скрыт до ответа.</p><button class="primary" id="start-listen" type="button">Начать · 10 вопросов</button></section>
<section class="practice-mode"><div class="mode-symbol">🃏</div><h2>Карточки</h2><p>Слова и целые выражения: переворачивай карточку, слушай произношение и отмечай, что запомнил.</p><label class="field-label" for="card-type">Что учим?</label><select id="card-type" class="input"><option value="words">Слова (${wordCount})</option><option value="phrases">Фразы (${phraseCount})</option></select>
<label class="field-label" for="card-side">Сначала показывать</label><select id="card-side" class="input"><option value="en">Английский → русский</option><option value="ru">Русский → английский</option></select>
<button class="primary" id="start-cards" type="button">Учить · 12 карточек</button><div class="muted">К повторению слов сегодня: ${dueWords}</div></section></div>
<p class="muted">🔊 Озвучивание использует английский голос на твоём устройстве. Для офлайн-работы должен быть установлен голос английского языка.</p>`;
const sel=root.querySelector('#practice-level');sel.value=level;
sel.addEventListener('change',()=>{prefs().level=sel.value;core.save();showMenu();});
root.querySelector('#card-type').value=['words','phrases'].includes(p.type)?p.type:'words';
root.querySelector('#card-side').value=['en','ru'].includes(p.side)?p.side:'en';
root.querySelector('#start-listen').addEventListener('click',()=>startListening(sel.value));
root.querySelector('#start-cards').addEventListener('click',()=>{const type=root.querySelector('#card-type').value,side=root.querySelector('#card-side').value;prefs().type=type;prefs().side=side;core.save();startCards(type,sel.value,side);});
}
function showVoiceError(level){root.innerHTML=`<section class="practice-mode"><div class="mode-symbol">🔇</div><h2>Английский голос недоступен</h2><p>Для аудирования нужен работающий синтез речи и установленный английский голос. Проверь настройки преобразования текста в речь на телефоне и вернись к тренировке.</p><button class="primary" id="retry-tts">Проверить ещё раз</button><button class="secondary full" id="voice-back">К практике</button></section>`;
root.querySelector('#retry-tts').addEventListener('click',()=>startListening(level));root.querySelector('#voice-back').addEventListener('click',showMenu);}
function startListening(level){if(!core.voiceAvailable()){showVoiceError(level);return;}const pool=shuffle(currentPool('phrases',level)).slice(0,10);if(pool.length<4){showMenu();return;}round={kind:'audio',level,items:pool,index:0,correct:0,answered:false,token:Symbol('audio')};renderAudio();}
function renderAudio(){const r=round;if(!r||r.kind!=='audio')return;if(r.index>=r.items.length){finishRound();return;}r.answered=false;const item=r.items[r.index];const pool=currentPool('phrases',r.level);
const uniqueOthers=[...new Map(shuffle(pool.filter(x=>x.id!==item.id&&x.ru!==item.ru)).map(x=>[x.ru,x])).values()];const options=shuffle([item,...uniqueOthers.slice(0,3)]);
root.innerHTML=`<div class="top-actions"><button class="secondary" id="practice-exit">✕ Назад</button><span class="question-progress">${r.index+1} / ${r.items.length}</span><span class="pill">🎧 ${r.level}</span></div><div class="bar"><div style="width:${100*r.index/r.items.length}%"></div></div><section class="question-card"><div class="question-label">Послушай и выбери перевод</div><p class="muted">Нажми на динамик. Слова на английском появятся после ответа.</p><button class="speak audio-hero" id="audio-play" type="button" aria-label="Прослушать английскую фразу">🔊</button><div class="answers">${options.map(o=>`<button type="button" class="answer" data-id="${h(o.id)}">${h(o.ru)}</button>`).join('')}</div></section><div id="practice-notice" aria-live="polite"></div>`;
root.querySelector('#practice-exit').addEventListener('click',showMenu);
root.querySelector('#audio-play').addEventListener('click',()=>core.speak(item.en));
root.querySelectorAll('.answer').forEach(b=>b.addEventListener('click',()=>{
 if(r.answered)return;r.answered=true;const ok=b.dataset.id===item.id;r.correct+=Number(ok);core.score(item,ok);
 root.querySelectorAll('.answer').forEach(btn=>{btn.disabled=true;if(btn.dataset.id===item.id)btn.classList.add('good');else if(btn===b)btn.classList.add('bad');});
 const panel=root.querySelector('#practice-notice');panel.innerHTML=`<div class="feedback ${ok?'':'bad'}"><strong>${ok?'Правильно! +10 XP':'Повторим эту фразу позже'}</strong><p><b>${h(item.en)}</b><br>${h(item.ru)}</p><div class="two-buttons"><button type="button" class="secondary" id="hear-again">🔊 Ещё раз</button><button type="button" class="primary" id="audio-next">Далее →</button></div></div>`;
 panel.querySelector('#hear-again').addEventListener('click',()=>core.speak(item.en));panel.querySelector('#audio-next').addEventListener('click',()=>{r.index++;renderAudio();});
}));
// The sound is also playable with a dedicated tap for browsers that block autoplay.
setTimeout(()=>{if(round===r&&!r.answered&&r.items[r.index]===item)core.speak(item.en);},250);
}
function startCards(type,level,side){const pool=sortedPool(type,level).slice(0,12);if(!pool.length){showMenu();return;}round={kind:'cards',type,side,level,items:pool,index:0,correct:0,flipped:false};renderCard();}
function renderCard(){const r=round;if(!r||r.kind!=='cards')return;if(r.index>=r.items.length){finishRound();return;}r.flipped=false;const item=r.items[r.index];const front=r.side==='en'?item.en:item.ru;const back=r.side==='en'?item.ru:item.en;
root.innerHTML=`<div class="top-actions"><button type="button" class="secondary" id="cards-exit">✕ Назад</button><span class="question-progress">${r.index+1} / ${r.items.length}</span><span class="pill">${r.type==='words'?'📖 Слова':'💬 Фразы'} · ${r.level}</span></div><div class="bar"><div style="width:${100*r.index/r.items.length}%"></div></div><section class="question-card"><div class="question-label">Вспомни перевод, затем открой ответ</div><button class="flashcard" type="button" id="flip" aria-label="Перевернуть карточку"><span class="card-face-label" id="card-label">${r.side==='en'?'ENGLISH':'РУССКИЙ'}</span><span class="card-phrase" id="card-phrase">${h(front)}</span><span class="card-hint" id="card-hint">Нажми, чтобы перевернуть ↻</span></button><div class="card-audio"><button class="secondary" id="card-speak" type="button" ${r.side==='ru'?'disabled':''}>🔊 Произношение</button></div><div id="card-rating" class="two-buttons" hidden><button type="button" class="secondary" id="card-again">🔁 Повторить</button><button type="button" class="primary" id="card-know">✅ Я вспомнил</button></div></section>`;
root.querySelector('#cards-exit').addEventListener('click',showMenu);
const card=root.querySelector('#flip');const speaker=root.querySelector('#card-speak');if(!core.voiceAvailable()){speaker.disabled=true;speaker.textContent='🔇 Голос недоступен';}speaker.addEventListener('click',()=>core.speak(item.en));
card.addEventListener('click',()=>{r.flipped=!r.flipped;root.querySelector('#card-label').textContent=r.flipped?(r.side==='en'?'РУССКИЙ':'ENGLISH'):(r.side==='en'?'ENGLISH':'РУССКИЙ');root.querySelector('#card-phrase').textContent=r.flipped?back:front;root.querySelector('#card-hint').textContent=r.flipped?'Нажми, чтобы увидеть исходную фразу ↻':'Нажми, чтобы перевернуть ↻';speaker.disabled=!core.voiceAvailable()||(r.side==='ru'&&!r.flipped);root.querySelector('#card-rating').hidden=!r.flipped;});
for(const [id,ok] of [['card-again',false],['card-know',true]]){root.querySelector('#'+id).addEventListener('click',()=>{if(!r.flipped)return;core.score(item,ok);r.correct+=Number(ok);r.index++;renderCard();});}
}
function finishRound(){const r=round;round=null;root.innerHTML=`<section class="hero" style="text-align:center"><div class="mode-symbol">${r.kind==='audio'?'🎧':'🃏'}</div><h1>Тренировка завершена!</h1><p>${r.kind==='audio'?'Правильных переводов':'Отмечено как выученное'}: <b>${r.correct} из ${r.items.length}</b></p><p>Сложные слова и фразы появятся снова в повторениях. Прогресс сохранён на устройстве.</p><button id="practice-home" type="button" class="primary">К упражнениям</button></section>`;root.querySelector('#practice-home').addEventListener('click',showMenu);}
window.WOLFIE_PRACTICE={mount};
})();
