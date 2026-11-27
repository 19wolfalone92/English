(()=>{'use strict';
const packs=window.WOLFIE_CONTEXT_PACKS||[];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=x=>String(x??'').normalize('NFKC').toLowerCase().replace(/[‘’]/g,"'").replace(/[.!?,;:]+/g,' ').replace(/\s+/g,' ').trim();
const lex=x=>norm(x).replace(/^(a|an|to)\s+/,'');
const legacyWords=[...(window.WOLFIE_WORDS||[]),...(window.WOLFIE_EXTRA_WORDS||[])];
const legacyPhrases=[...(window.WOLFIE_LESSONS||[]).flatMap(l=>l.pairs.map(p=>({...p,level:l.level,topic:l.title}))),...(window.WOLFIE_EXTRA_PHRASES||[])];
const legacy=new Map([...legacyWords.map(p=>['w:'+lex(p.en),p]),...legacyPhrases.map(p=>['p:'+norm(p.en),p])]);
const cardMap=new Map(),newCards=[];
for(const p of packs){
 p.cards=[];
 for(const [kind,rows] of [['w',p.words],['p',p.phrases]])rows.forEach(([en,ru],i)=>{
  const key=kind+':'+(kind==='w'?lex(en):norm(en));const prior=legacy.get(key)||cardMap.get(key);
  const card={id:prior?.id||p.id+'-'+kind+'-'+(i+1),en,ru,level:p.level,topic:p.ru,kind,goal:p.goal,version:p.version,quality:p.quality};
  if(!prior){newCards.push(card);cardMap.set(key,card);}
  p.cards.push(card);
 });
}
const get=unit=>packs.find(p=>p.day===unit.index+1);
const same=(value,expected)=>norm(value)===norm(expected);
function answerOk(ex,value){
 if(ex[0]==='choice')return Number.isInteger(value)&&value===ex[3];
 if(ex[0]==='type')return typeof value==='string'&&ex[2].some(x=>same(x,value));
 if(ex[0]==='order')return Array.isArray(value)&&value.length===ex[2].length&&new Set(value).size===value.length&&value.every(i=>Number.isInteger(i)&&i>=0&&i<ex[2].length)&&same(value.map(i=>ex[2][i]).join(' '),ex[3]);
 return false;
}
function mount(view,{pack:p,store,save,score,onExit,speak,getReviewItems}){
 const all=store.contextLessons||(store.contextLessons={});
 const s=all[p.id]||(all[p.id]={version:p.version,tab:'overview',answers:{},drafts:{},checks:{},writingIndex:0});
 s.answers=s.answers||{};s.drafts=s.drafts||{};s.checks=s.checks||{};
 const tabs=[['overview','Маршрут'],['review','Повторение · 8 мин'],['vocab','Лексика · 10 мин'],['grammar','Грамматика · 10 мин'],['audio','Диалог · 12 мин'],['reading','Чтение · 10 мин'],['speaking','Speaking · 10 мин'],['writing','Writing · 12 мин'],['final','Проверка · 5 мин'],['result','Результат']];
 const plans={quick:{name:'15 минут',keys:['review','final']},short:{name:'30 минут',keys:['review','vocab','audio']},standard:{name:'77 минут',keys:['review','vocab','grammar','audio','reading','speaking','writing','final']},intensive:{name:'92 минуты и больше',keys:['review','vocab','grammar','audio','reading','speaking','writing','final']},free:{name:'Свободная практика',keys:[]}};
 if(!Object.prototype.hasOwnProperty.call(plans,s.mode))s.mode='standard';
 const finalItems=window.WOLFIE_CONTEXT_CHECKS?.[p.id]||[];
 const node=x=>view.querySelector(x);
 function draw(tab,html){
  view.querySelector('#ctx-audio')?.pause();s.tab=tab;save();view.innerHTML='<section class="context-shell"><button id="ctx-exit" class="secondary">← План дня</button><p class="context-kicker">'+p.level+' · День '+p.day+' · Тематическая миссия</p><h1>'+esc(p.ru)+'</h1><p>'+esc(p.goal)+'</p><div class="context-tabs" aria-label="Блоки тематической миссии">'+tabs.map(([k,t])=>'<button data-ctx-tab="'+k+'" class="secondary" '+(k===tab?'aria-current="page"':'')+'>'+t+'</button>').join('')+'</div><div id="ctx-body">'+html+'</div></section>';
  node('#ctx-exit').onclick=()=>{view.querySelector('#ctx-audio')?.pause();onExit();};view.querySelectorAll('[data-ctx-tab]').forEach(b=>b.onclick=()=>open(b.dataset.ctxTab));if(typeof window.scrollTo==='function')window.scrollTo(0,0);
 }
 function overview(){
  const plan=plans[s.mode];
  draw('overview','<h2 lang="en">'+esc(p.title)+'</h2><p>Один сюжет объединяет лексику, грамматику, чтение, диалог и самостоятельные ответы. Выбери рекомендуемую нагрузку. Незавершённые блоки остаются доступны; сокращённый маршрут не означает завершённый день или освоенный уровень.</p><label for="ctx-mode">Режим занятия</label><select class="input" id="ctx-mode">'+Object.entries(plans).map(([k,v])=>'<option value="'+k+'" '+(k===s.mode?'selected':'')+'>'+esc(v.name)+'</option>').join('')+'</select><div class="context-grid">'+tabs.filter(([k])=>plan.keys.length?plan.keys.includes(k):k!=='overview').map(([k,t])=>'<button class="secondary" data-ctx-jump="'+k+'">'+t+'</button>').join('')+'</div><p>'+(s.mode==='intensive'?'Основной маршрут 77 минут + 15 минут: перескажи текст, повтори диалог и выполни второй вариант Writing.':s.mode==='standard'?'Дополнительно: 15 минут свободного языкового погружения.':s.mode==='quick'?'8 минут повторения + 5 минут итоговой практики, оставшееся время — разбор ошибок.':'Время — ориентир, а не таймер или доказательство знания.')+'</p><p class="muted">Материалы авторские, без независимой языковой экспертизы. Старый маршрут сохранён; результаты новой миссии хранятся отдельно.</p>');
  node('#ctx-mode').onchange=e=>{s.mode=e.target.value;save();overview();};view.querySelectorAll('[data-ctx-jump]').forEach(b=>b.onclick=()=>open(b.dataset.ctxJump));
 }
 function review(){
  if(!Array.isArray(s.reviewItems)){s.reviewItems=(getReviewItems?.()||[]).slice(0,8).map(x=>({id:x.id,en:x.en,ru:x.ru}));save();}
  const rows=s.reviewItems;
  draw('review','<h2>Интервальное повторение</h2><p>Карточки с наступившим сроком. Введи ожидаемый английский вариант. Повторный клик не увеличивает результат.</p>'+(rows.length?rows.map((card,i)=>'<section class="context-question"><label for="ctx-rev-'+i+'">'+esc(card.ru)+'</label><input id="ctx-rev-'+i+'" class="study-input" value="'+esc(s.answers['rev'+i]??'')+'" '+(s.checks['rev'+i]?'disabled':'')+'><button data-ctx-review="'+i+'" class="secondary" '+(s.checks['rev'+i]?'disabled':'')+'>Проверить</button><p id="ctx-rev-feedback-'+i+'" role="status">'+(s.checks['rev'+i]?esc(feedback(s.checks['rev'+i].ok,card.en)):'')+'</p></section>').join(''):'<p>Нет карточек к повторению на момент открытия блока. Результат языкового теста не начисляется.</p>'));
  rows.forEach((card,i)=>{const key='rev'+i,input=node('#ctx-rev-'+i);input.oninput=()=>{s.answers[key]=input.value;save();};});
  view.querySelectorAll('[data-ctx-review]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.ctxReview),key='rev'+i,input=node('#ctx-rev-'+i);if(s.checks[key]||!input.value.trim())return;const card=rows[i],ok=same(input.value,card.en);s.answers[key]=input.value;s.checks[key]={ok,kind:'review-exact'};save();score?.(card,ok);b.disabled=true;input.disabled=true;node('#ctx-rev-feedback-'+i).textContent=feedback(ok,card.en);});
 }
 function vocab(){
  draw('vocab','<h2>Слова и фразы</h2><p>Сначала изучи выражения; затем введи английский вариант по русскому смыслу. Проверка точного варианта не оценивает все возможные переводы.</p>'+p.cards.map((c,i)=>'<details class="study-pair"><summary lang="en">'+esc(c.en)+'</summary><p>'+esc(c.ru)+'</p><button class="secondary" data-ctx-say="'+i+'">Произнести (TTS)</button></details>').join('')+'<h2>Воспроизведение</h2>'+p.cards.map((c,i)=>'<section class="context-question"><label for="ctx-v-'+i+'">'+esc(c.ru)+'</label><input id="ctx-v-'+i+'" autocomplete="off" class="study-input" value="'+esc(s.answers['v'+i]??'')+'" '+(s.checks['v'+i]?'disabled':'')+'><button data-ctx-vcheck="'+i+'" class="secondary" '+(s.checks['v'+i]?'disabled':'')+'>Проверить</button><p id="ctx-vf-'+i+'" role="status">'+(s.checks['v'+i]?feedback(s.checks['v'+i].ok,c.en):'')+'</p></section>').join(''));
  view.querySelectorAll('[data-ctx-say]').forEach(b=>b.onclick=()=>speak?.(p.cards[Number(b.dataset.ctxSay)].en));
  p.cards.forEach((c,i)=>{const key='v'+i,input=node('#ctx-v-'+i);input.oninput=()=>{s.answers[key]=input.value;save();};});
  view.querySelectorAll('[data-ctx-vcheck]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.ctxVcheck),key='v'+i,c=p.cards[i],input=node('#ctx-v-'+i);if(s.checks[key]||!input.value.trim())return;const ok=same(input.value,c.en);s.answers[key]=input.value;s.checks[key]={ok,kind:'typed-exact'};save();score?.(c,ok);b.disabled=true;input.disabled=true;node('#ctx-vf-'+i).textContent=feedback(ok,c.en);});
 }
 const feedback=(ok,answer)=> (ok?'Верно. ':'Ожидаемый вариант: ')+answer;
 function grammar(){
  const g=p.grammar;
  draw('grammar','<h2 lang="en">'+esc(g.title)+'</h2><p>'+esc(g.rule)+'</p><p class="context-pattern">'+esc(g.pattern)+'</p><p lang="en">'+esc(g.example)+'</p><p><b>Типичная ошибка:</b> '+esc(g.pitfall)+'</p>'+g.exercises.map((ex,i)=>exerciseHtml(ex,i)).join(''));
  g.exercises.forEach((ex,i)=>{const key='g'+i;if(s.checks[key])return;
   if(ex[0]==='choice')view.querySelectorAll('[name="ctx-g-'+i+'"]').forEach(b=>b.onchange=()=>{s.answers[key]=Number(b.value);save();});
   if(ex[0]==='type')node('#ctx-g-'+i).oninput=e=>{s.answers[key]=e.target.value;save();};
   if(ex[0]==='order'){
    const update=()=>{const order=Array.isArray(s.answers[key])?s.answers[key]:[];node('#ctx-order-'+i).textContent=order.map(j=>ex[2][j]).join(' ');view.querySelectorAll('[data-order-group="'+i+'"]').forEach(b=>b.disabled=order.includes(Number(b.dataset.orderIndex)));};
    view.querySelectorAll('[data-order-group="'+i+'"]').forEach(b=>b.onclick=()=>{const order=Array.isArray(s.answers[key])?s.answers[key]:[];const j=Number(b.dataset.orderIndex);if(!order.includes(j))s.answers[key]=[...order,j];save();update();});
    node('#ctx-undo-'+i).onclick=()=>{s.answers[key]=(s.answers[key]||[]).slice(0,-1);save();update();};update();
   }
   node('#ctx-gcheck-'+i).onclick=()=>{if(s.checks[key])return;const value=s.answers[key];if(value===undefined||value===''||(ex[0]==='order'&&(!Array.isArray(value)||value.length!==ex[2].length)))return; s.checks[key]={ok:answerOk(ex,value),kind:ex[0]};save();grammar();};
  });
 }
 function exerciseHtml(ex,i){
  const key='g'+i,a=s.answers[key],checked=s.checks[key];const off=checked?'disabled':'';
  const expected=ex[0]==='choice'?ex[2][ex[3]]:ex[0]==='type'?ex[2].join(' / '):ex[3];
  const body=ex[0]==='choice'?'<fieldset class="study-questions"><legend>'+esc(ex[1])+'</legend>'+ex[2].map((x,j)=>'<label><input type="radio" name="ctx-g-'+i+'" value="'+j+'" '+(a===j?'checked':'')+' '+off+'> '+esc(x)+'</label>').join('')+'</fieldset>':ex[0]==='type'?'<label for="ctx-g-'+i+'">'+esc(ex[1])+'</label><input class="study-input" id="ctx-g-'+i+'" autocomplete="off" value="'+esc(a??'')+'" '+off+'>':'<p>'+esc(ex[1])+'</p><p class="context-pattern" id="ctx-order-'+i+'" aria-live="polite">'+esc(Array.isArray(a)?a.map(j=>ex[2][j]).join(' '):'')+'</p><div class="context-tokens">'+ex[2].map((x,j)=>'<button class="secondary" data-order-group="'+i+'" data-order-index="'+j+'" '+off+'>'+esc(x)+'</button>').join('')+'</div><button id="ctx-undo-'+i+'" class="secondary" '+off+'>Убрать последнее слово</button>';
  return '<section class="context-question">'+body+'<button class="secondary" id="ctx-gcheck-'+i+'" '+off+'>Проверить</button>'+(checked?'<p role="status">'+esc(feedback(checked.ok,expected))+' '+esc(ex.at(-1))+'</p>':'')+'</section>';
 }
 function mc(q,key){const check=s.checks[key];return '<section class="context-question"><fieldset class="study-questions"><legend>'+esc(q[0])+'</legend>'+q[1].map((x,j)=>'<label><input type="radio" name="ctx-mc-'+key+'" value="'+j+'" '+(s.answers[key]===j?'checked':'')+' '+(check?'disabled':'')+'> '+esc(x)+'</label>').join('')+'</fieldset><button class="secondary" id="ctx-mc-'+key+'" '+(check?'disabled':'')+'>Проверить</button>'+(check?'<p role="status">'+esc(feedback(check.ok,q[1][q[2]]))+'</p>':'')+'</section>';}
 function bindMC(q,key,refresh,guard=()=>true){
  if(s.checks[key])return;view.querySelectorAll('[name="ctx-mc-'+key+'"]').forEach(b=>b.onchange=()=>{s.answers[key]=Number(b.value);save();});
  node('#ctx-mc-'+key).onclick=()=>{if(s.checks[key]||!Number.isInteger(s.answers[key])||!guard())return;s.checks[key]={ok:s.answers[key]===q[2],kind:'choice',assisted:key==='audio'&&!!s.transcriptSeen};save();refresh();};
 }
 function reading(){draw('reading','<article class="study-reading"><h2 lang="en">'+esc(p.reading.title)+'</h2>'+p.reading.paragraphs.map(x=>'<p lang="en">'+esc(x)+'</p>').join('')+'</article>'+p.reading.questions.map((q,i)=>mc(q,'r'+i)).join(''));p.reading.questions.forEach((q,i)=>bindMC(q,'r'+i,reading));}
 function audio(){
  const neural=(window.WOLFIE_NEURAL_DIALOGUES||[]).find(x=>x.id===p.id);
  let mode=neural&&s.dialogueVoice!=='espeak'?'kokoro':'espeak';
  const fallback='context_audio/'+p.id+'.mp3',source=()=>mode==='kokoro'?'neural_dialogue/'+neural.file:fallback;
  const transcript=p.dialogue.map(([role,en,ru],i)=>'<p class="dialogue-line" data-dialogue-line="'+i+'"><b>'+esc(role)+'</b>: <span lang="en">'+esc(en)+'</span><br><span class="muted">'+esc(ru)+'</span>'+(neural?'<br><button class="secondary line-repeat" data-line-repeat="'+i+'" '+(mode==='kokoro'?'':'disabled')+'>Повторить реплику</button>':'')+'</p>').join('');
  draw('audio','<h2>Диалог</h2><p>Синтезированная речь (не человеческая запись). Прослушай весь диалог, затем ответь. Открытие транскрипта до ответа переводит результат в практику с подсказкой.</p>'+(neural?'<label for="ctx-voice">Озвучивание</label><select class="input" id="ctx-voice"><option value="kokoro" '+(mode==='kokoro'?'selected':'')+'>Kokoro · разные голоса (US/UK)</option><option value="espeak" '+(mode==='espeak'?'selected':'')+'>eSpeak · резервный вариант</option></select>':'<p class="muted">eSpeak · резервная синтетическая озвучка</p>')+'<audio id="ctx-audio" controls preload="metadata" src="'+esc(source())+'"></audio><p id="ctx-duration" class="muted" aria-live="polite"></p><label for="ctx-rate">Скорость</label><select id="ctx-rate" class="input"><option value="0.8">0.8×</option><option value="1" selected>1×</option><option value="1.2">1.2×</option></select><p id="ctx-audio-status" role="status">'+(s.playbackEnded?'Получено событие окончания воспроизведения.':'')+'</p>'+mc(p.listening,'audio')+'<details id="ctx-transcript" '+(s.transcriptSeen?'open':'')+'><summary>Транскрипт и перевод · Shadowing</summary><p class="muted">Повторяй реплику вслух после записи. Это самостоятельная практика, а не оценка произношения.</p>'+transcript+'</details>');
  const player=node('#ctx-audio'),status=node('#ctx-audio-status');let continuous=false,last=0,repeat=null,active=-1;
  function highlight(i){if(active===i)return;active=i;view.querySelectorAll('[data-dialogue-line]').forEach(el=>{const on=Number(el.dataset.dialogueLine)===i;el.classList.toggle('dialogue-active',on);if(on)el.setAttribute('aria-current','true');else el.removeAttribute('aria-current');});}
  player.onloadedmetadata=()=>{if(!player.isConnected)return;node('#ctx-duration').textContent=Number.isFinite(player.duration)?Math.floor(player.duration/60)+':'+String(Math.floor(player.duration%60)).padStart(2,'0')+' · '+(mode==='kokoro'?'Kokoro, локальный файл':'eSpeak, локальный файл'):'';};
  player.onplay=()=>{if(!repeat&&player.currentTime<.5){continuous=true;last=0;}};
  player.ontimeupdate=()=>{if(continuous&&player.currentTime-last>2.5)continuous=false;last=player.currentTime;if(neural&&mode==='kokoro'){highlight(neural.cues.findIndex(c=>player.currentTime>=c.start&&player.currentTime<c.end));if(repeat&&player.currentTime>=repeat.end){player.pause();repeat=null;}}};
  player.onseeking=()=>{continuous=false;};
  player.onended=()=>{highlight(-1);if(continuous&&!repeat&&Number.isFinite(player.duration)&&last>=player.duration-2.5){s.playbackEnded=true;save();status.textContent='Получено событие окончания воспроизведения. Оно не доказывает, что звук был слышен.';}else status.textContent='Для проверки прослушай запись с начала без перемотки.';repeat=null;};
  player.onerror=()=>{status.textContent='Аудиофайл не воспроизводится. '+(neural&&mode==='kokoro'?'Выбери резервный eSpeak или используй транскрипт.':'Используй транскрипт как практику; аудирование не подтверждено.');};
  if(neural){
   node('#ctx-voice').onchange=e=>{player.pause();continuous=false;last=0;repeat=null;highlight(-1);mode=e.target.value==='kokoro'?'kokoro':'espeak';s.dialogueVoice=mode;save();player.src=source();player.load();view.querySelectorAll('[data-line-repeat]').forEach(b=>b.disabled=mode!=='kokoro');node('#ctx-duration').textContent='';};
   view.querySelectorAll('[data-line-repeat]').forEach(b=>b.onclick=()=>{if(mode!=='kokoro'||!Number.isFinite(player.duration))return;const cue=neural.cues[Number(b.dataset.lineRepeat)];if(!cue)return;continuous=false;repeat=cue;s.transcriptSeen=true;save();player.currentTime=cue.start;player.play().catch(()=>{repeat=null;status.textContent='Не удалось начать воспроизведение.';});});
  }
  node('#ctx-rate').onchange=e=>{player.playbackRate=Number(e.target.value);};
  node('#ctx-transcript').ontoggle=e=>{if(e.target.open&&!s.checks.audio){s.transcriptSeen=true;save();}};
  bindMC(p.listening,'audio',audio,()=>{if(node('#ctx-transcript').open){s.transcriptSeen=true;save();}if(s.playbackEnded||s.transcriptSeen)return true;status.textContent='Сначала прослушай запись полностью или открой транскрипт для практики с подсказкой.';return false;});
 }
 function speaking(){draw('speaking','<h2>Разговорная практика</h2><p>Ответь вслух и сохрани заметки. Критерии для самопроверки: выполнение конкретной задачи, понятность, связность, грамматика и подходящая лексика. Заметки не подтверждают произношение или качество речи.</p>'+p.speaking.map((x,i)=>'<section class="context-question"><label for="ctx-s-'+i+'" lang="en">'+esc(x)+'</label><textarea class="study-input" id="ctx-s-'+i+'" rows="3">'+esc(s.drafts['s'+i]||'')+'</textarea></section>').join(''));p.speaking.forEach((_,i)=>node('#ctx-s-'+i).oninput=e=>{s.drafts['s'+i]=e.target.value;save();});}
 function writing(){const i=Number.isInteger(s.writingIndex)&&s.writingIndex>=0&&s.writingIndex<p.writing.length?s.writingIndex:0;draw('writing','<h2>Письменная практика</h2><p>Выбери одно задание. Остальные доступны как дополнительные. Проверь выполнение цели, ясность, связность, точность и регистр. Автоматическая оценка смысла пока недоступна.</p><label for="ctx-writing-choice">Задание</label><select id="ctx-writing-choice" class="input">'+p.writing.map((_,j)=>'<option value="'+j+'" '+(i===j?'selected':'')+'>Вариант '+(j+1)+'</option>').join('')+'</select><label for="ctx-writing" lang="en">'+esc(p.writing[i])+'</label><textarea class="study-input" id="ctx-writing" rows="9">'+esc(s.drafts['w'+i]||'')+'</textarea><details><summary>Пример тематического ответа (не эталон для всех вариантов)</summary><p lang="en">'+esc(p.model)+'</p></details>');node('#ctx-writing-choice').onchange=e=>{s.writingIndex=Number(e.target.value);save();writing();};node('#ctx-writing').oninput=e=>{s.drafts['w'+i]=e.target.value;save();};}
 function final(){
  draw('final','<h2>Проверка переноса знаний</h2><p>Новые задачи по теме, а не повтор показанных предложений. Ответы открываются после отправки всех трёх заданий. Это учебная проверка, не независимый экзамен.</p>'+finalItems.map((ex,i)=>{
   const key='f'+i,a=s.answers[key],off=s.finalSubmitted?'disabled':'';
   if(ex[0]==='choice'){
    const options=ex[2].map((x,j)=>({x,j})),shift=(p.day+i)%options.length,rotated=options.slice(shift).concat(options.slice(0,shift));
    return '<fieldset class="context-question"><legend>'+esc(ex[1])+'</legend>'+rotated.map(o=>'<label><input type="radio" name="ctx-final-'+i+'" value="'+o.j+'" '+(a===o.j?'checked':'')+' '+off+'> '+esc(o.x)+'</label>').join('')+'</fieldset>';
   }
   return '<section class="context-question"><label for="ctx-final-'+i+'">'+esc(ex[1])+'</label><input id="ctx-final-'+i+'" class="study-input" autocomplete="off" value="'+esc(a??'')+'" '+off+'></section>';
  }).join('')+(s.finalSubmitted?'<div class="question-card"><h2>Результат: '+finalItems.filter((_,i)=>s.checks['f'+i]?.ok).length+'/'+finalItems.length+'</h2>'+finalItems.map((ex,i)=>'<p>'+esc(feedback(!!s.checks['f'+i]?.ok,ex[0]==='choice'?ex[2][ex[3]]:ex[2].join(' / ')))+' '+esc(ex.at(-1))+'</p>').join('')+'</div>':'<button id="ctx-final-submit" class="primary">Проверить все ответы</button><p id="ctx-final-error" role="status"></p>'));
  if(s.finalSubmitted)return;
  finalItems.forEach((ex,i)=>{const key='f'+i;if(ex[0]==='choice')view.querySelectorAll('[name="ctx-final-'+i+'"]').forEach(b=>b.onchange=()=>{s.answers[key]=Number(b.value);save();});else node('#ctx-final-'+i).oninput=e=>{s.answers[key]=e.target.value;save();};});
  node('#ctx-final-submit').onclick=()=>{if(s.finalSubmitted)return;if(finalItems.length!==3||finalItems.some((_,i)=>s.answers['f'+i]===undefined||String(s.answers['f'+i]).trim()==='')){node('#ctx-final-error').textContent='Ответь на все три задания.';return;}finalItems.forEach((ex,i)=>s.checks['f'+i]={ok:answerOk(ex,s.answers['f'+i]),kind:'transfer'});s.finalSubmitted=true;save();final();};
 }
 function result(){
  const count=(prefix,total)=>{const rows=Object.entries(s.checks).filter(([k])=>new RegExp('^'+prefix+'[0-9]+$').test(k));return rows.filter(([,v])=>v.ok).length+'/'+total+' · проверено '+rows.length;};
  draw('result','<h2>Результаты тематической миссии</h2><p>Повторение: '+(Array.isArray(s.reviewItems)?(s.reviewItems.length?count('rev',s.reviewItems.length):'нет карточек'):'не открыто')+'</p><p>Лексика: '+count('v',p.cards.length)+'</p><p>Грамматика: '+count('g',p.grammar.exercises.length)+'</p><p>Чтение: '+count('r',p.reading.questions.length)+'</p><p>Диалог: '+(s.checks.audio?(s.checks.audio.assisted?'с транскриптом, не аудирование':s.checks.audio.ok?'ответ верный после события воспроизведения':'ответ неверный'):'не проверен')+'</p><p>Speaking: '+p.speaking.filter((_,i)=>String(s.drafts['s'+i]||'').trim()).length+'/5 заметок; качество речи не оценено.</p><p>Writing: '+p.writing.filter((_,i)=>String(s.drafts['w'+i]||'').trim()).length+'/3 черновиков; язык не оценён.</p><p>Итоговая проверка: '+(s.finalSubmitted?count('f',finalItems.length):'не пройдена')+'</p><p>Повтори неверные карточки через раздел интервального повторения. Это тренировочная статистика, не экзамен CEFR.</p>');
 }
 function open(k){const screens={overview,review,vocab,grammar,reading,audio,speaking,writing,final,result};(Object.prototype.hasOwnProperty.call(screens,k)?screens[k]:overview)();}
 open(s.tab);
}
window.WOLFIE_CONTEXT={packs,get,newCards,answerOk,norm,mount};
})();
