(()=>{'use strict';
const H=window.WOLFIE_STUDY_TASKS.handlers;
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').toLowerCase().replace(/[‘’]/g,"'").replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const wordCount=s=>(String(s||'').match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g)||[]).length;
H.listening=c=>{
 const phraseIds=new Set([...(window.WOLFIE_EXTRA_PHRASES||[]),...(window.WOLFIE_LESSONS||[]).flatMap(x=>x.pairs)].map(x=>x.id));
 const phrases=(c.unit.practicePairs||c.unit.pairs).filter(p=>phraseIds.has(p.id)&&p.en.split(/\s+/).length>=3).slice(0,6);
 const required=4,ids=(c.voiceLocale||'en-US')+'|'+phrases.map(p=>p.id).join('|');
 if(phrases.length!==6){c.panel('listening','Аудирование','<p class="study-warning">Недостаточно проверенных фраз для диктанта. Этап не засчитан.</p>');return;}
 const fresh=()=>({ids,index:0,correct:0,draft:'',checked:false,matched:false});
 let state=c.log.answers.listeningSession;
 if(!state||state.ids!==ids||!Number.isInteger(state.index)||state.index<0||state.index>6||!Number.isInteger(state.correct)||state.correct<0||state.correct>state.index+Number(!!state.checked))state=fresh();
 c.log.answers.listeningSession=state;c.save();
 function reset(){state=fresh();c.log.answers.listeningSession=state;c.save();render();}
 function finish(){
  const correct=state.correct,percent=Math.round(correct/6*100);
  c.log.answers.listening=correct+'/6';c.log.assessment=c.log.assessment||{};
  c.log.assessment.listening={correct,total:6,percent,source:'device-tts',voiceLocale:c.voiceLocale||'en-US'};c.save();
  if(correct>=required){
   c.panel('listening','Аудирование · результат','<div class="feedback"><strong>'+correct+'/6 · '+percent+'%</strong><p>Порог пройден. Это диктант на синтезированной речи, а не проверка естественного аудирования.</p><button id="study-complete" class="primary" type="button">Завершить аудирование</button><button id="listen-retry" class="secondary" type="button">Новая попытка</button></div>');
   c.view.querySelector('#study-complete').onclick=()=>c.complete('listening');
   c.view.querySelector('#listen-retry').onclick=reset;
  }else{
   c.panel('listening','Аудирование · повторная попытка','<div class="feedback bad"><strong>'+correct+'/6 — нужно 4 правильных ответа.</strong><p>Повтори фразы и пройди диктант ещё раз.</p><button id="listen-retry" class="primary" type="button">Повторить диктант</button></div>');
   c.view.querySelector('#listen-retry').onclick=reset;
  }
 }
 function render(){
  if(state.index>=6){finish();return;}
  const p=phrases[state.index],audio=c.voiceAvailable(c.voiceLocale||'en-US');
  if(!audio&&!state.checked){
   c.panel('listening','Аудирование','<p class="study-warning">Английский голос '+esc(c.voiceLocale||'en-US')+' недоступен. Этап не будет засчитан по текстовой подмене.</p><p>Установи английский голос в настройках Android или выбери доступный вариант.</p><button id="listen-recheck" class="primary" type="button">Проверить голос ещё раз</button>');
   c.view.querySelector('#listen-recheck').onclick=render;return;
  }
  let played=false;
  const html='<p>Диктант '+(state.index+1)+'/6. Прослушай фразу и запиши услышанное. Можно повторить воспроизведение до ответа.</p><p class="muted">Источник: синтезированная речь ('+esc(c.voiceLocale||'en-US')+').</p><button class="secondary" id="listen-play" type="button">Прослушать фразу</button><label for="listen-input">Что ты услышал?</label><textarea class="study-input" id="listen-input" rows="3" autocomplete="off">'+esc(state.draft)+'</textarea><div class="study-answer" id="listen-result" hidden></div><p id="listen-error" role="status"></p><button class="primary" id="listen-check" type="button">Проверить</button><button class="primary" id="listen-next" type="button" hidden>Следующая фраза</button>';
  c.panel('listening','Аудирование',html);
  const input=c.view.querySelector('#listen-input'),check=c.view.querySelector('#listen-check'),next=c.view.querySelector('#listen-next'),error=c.view.querySelector('#listen-error');
  function feedback(){const box=c.view.querySelector('#listen-result');box.hidden=false;box.innerHTML='<b>'+(state.matched?'✓ Точный ответ':'↻ Сравни с оригиналом')+'</b><p>'+esc(p.en)+'</p><p>'+esc(p.ru)+'</p>';input.disabled=true;check.hidden=true;next.hidden=false;}
  input.addEventListener('input',()=>{if(!state.checked){state.draft=input.value;c.save();}});
  c.view.querySelector('#listen-play').onclick=()=>{played=c.speak(p.en,c.voiceLocale||'en-US')===true||played;if(!played)error.textContent='Не удалось запросить воспроизведение.';else error.textContent='';};
  check.onclick=()=>{
   if(state.checked)return;
   if(!played){error.textContent='Сначала запроси воспроизведение фразы.';return;}
   const v=input.value.trim();if(!v){error.textContent='Сначала введи услышанную фразу.';return;}
   state.draft=v;state.matched=norm(v)===norm(p.en);state.correct+=Number(state.matched);state.checked=true;
   c.save();if(c.onReview)c.onReview(p,state.matched);feedback();
  };
  next.onclick=()=>{if(!state.checked)return;state.index++;state.draft='';state.checked=false;state.matched=false;c.save();render();};
  if(state.checked)feedback();
 }
 render();
};
H.speaking=c=>{
 const mission=window.WOLFIE_MISSIONS.get(c.unit),examples=(c.unit.practicePairs||c.unit.pairs).filter(p=>p.en.split(/\s+/).length>=3).slice(0,5);
 const answers=c.log.answers.speech||{},sources=c.log.answers.speechSource||{};
 const minWords=c.unit.level==='A2'?8:c.unit.level==='B1'?12:16;
 const html='<p><b>Ситуация:</b> '+esc(mission.scenario)+'</p><p><b>Фокус:</b> '+esc(mission.angle)+'</p><p>Ответь на пять вопросов по-английски. Используй диктовку Android или введи текст вручную. Системное распознавание может передавать звук поставщику сервиса, даже при запросе автономного режима. Для завершения нужны минимум три ответа требуемого объёма.</p>'+
 mission.questions.map((q,i)=>'<section class="study-pair"><b>'+(i+1)+'. '+esc(q)+'</b><p class="muted">Выражение для использования: <em>'+esc(examples[i]?.en||'')+'</em></p><textarea class="study-input" rows="3" data-speech="'+i+'" aria-label="Ответ '+(i+1)+'">'+esc(answers[i]||'')+'</textarea><button class="secondary" type="button" data-record="'+i+'" '+(window.WolfieAndroid&&window.WolfieAndroid.recognizeSpeech?'':'disabled')+'>Записать ответ голосом</button><small class="muted" id="speech-status-'+i+'">'+(sources[i]==='recognition'?'Получена системная транскрипция':'Текстовый ответ не подтверждён распознаванием')+'</small></section>').join('')+
 '<p id="speech-error" role="status"></p><p class="muted">Ограничение оценки: приложение анализирует только наличие и объём транскрипта. Оно не оценивает произношение, беглость или качество аудио.</p><button id="study-complete" class="primary" type="button">Сохранить разговорную практику</button>';
 c.panel('speaking','Разговорная практика',html);
 let active=null,saveTimer=null;
 c.view.querySelectorAll('[data-speech]').forEach(el=>el.addEventListener('input',()=>{const n=Number(el.dataset.speech);c.log.answers.speech=c.log.answers.speech||{};c.log.answers.speech[n]=el.value;c.log.answers.speechSource=c.log.answers.speechSource||{};c.log.answers.speechSource[n]='manual';const status=c.view.querySelector('#speech-status-'+n);if(status)status.textContent='Текстовый ответ изменён вручную';if(saveTimer)clearTimeout(saveTimer);saveTimer=setTimeout(c.save,300);}));
 c.view.querySelectorAll('[data-record]').forEach(b=>b.onclick=()=>{if(active!==null)return;if(typeof window.confirm==='function'&&!window.confirm('Разрешить системное распознавание? Поставщик Android может обработать звук вне устройства.'))return;active=Number(b.dataset.record);if(window.WolfieAndroid&&window.WolfieAndroid.recognizeSpeechFor)window.WolfieAndroid.recognizeSpeechFor(c.voiceLocale||'en-US');else if(window.WolfieAndroid&&window.WolfieAndroid.recognizeSpeech)window.WolfieAndroid.recognizeSpeech();});
 window.WOLFIE_SPEECH_CALLBACK=function(transcript){
  if(active===null)return;const target=active;active=null;
  if(!transcript||!c.view.querySelector('[data-speech="'+target+'"]'))return;
  c.log.answers.speech=c.log.answers.speech||{};c.log.answers.speechSource=c.log.answers.speechSource||{};
  c.log.answers.speech[target]=transcript;c.log.answers.speechSource[target]='recognition';c.save();
  const input=c.view.querySelector('[data-speech="'+target+'"]');if(input)input.value=transcript;
  const status=c.view.querySelector('#speech-status-'+target);if(status)status.textContent='Получена системная транскрипция';
 };
 c.view.querySelector('#study-complete').onclick=()=>{
  const a=c.log.answers.speech||{},src=c.log.answers.speechSource||{};
  const valid=mission.questions.filter((_,i)=>wordCount(a[i])>=minWords).length;
  const recognised=mission.questions.filter((_,i)=>src[i]==='recognition'&&wordCount(a[i])>=minWords).length;
  if(valid<3){c.view.querySelector('#speech-error').textContent='Ответов требуемого объёма: '+valid+'/5. Нужно минимум 3 ответа по '+minWords+' слов.';return;}
  c.log.assessment=c.log.assessment||{};c.log.assessment.speaking={responses:valid,recognised,total:5,status:recognised>=3?'transcribed':'manual-practice',pronunciation:'not-assessed'};
  c.log.answers.speakingSummary={responses:valid,recognised,pronunciation:'not-assessed'};c.save();c.complete('speaking');
 };
};
H.writing=c=>{
 const mission=window.WOLFIE_MISSIONS.get(c.unit),level=c.unit.level;
 const minWords=level==='A2'?50:level==='B1'?100:150;
 const minSentences=level==='A2'?4:level==='B1'?6:8;
 const minLinkers=level==='A2'?1:level==='B1'?2:3;
 const prompt=mission.writing[(c.unit.day-1)%mission.writing.length];
 const existing=c.log.answers.essay||c.log.answers.essay0||'';
 const html='<p><b>Ситуация:</b> '+esc(mission.scenario)+'</p><p><b>Задача:</b> '+esc(prompt)+'</p><p>Напиши один связный текст. Цель: '+minWords+' слов, не менее '+minSentences+' предложений и '+minLinkers+' связующих выражений.</p><label for="study-essay">Твой текст на английском</label><textarea class="study-input" id="study-essay" rows="10" placeholder="Write your text here...">'+esc(existing)+'</textarea><button id="essay-review" class="secondary" type="button">Проверить структуру текста</button><div id="essay-feedback" aria-live="polite"></div><label class="study-confirm"><input id="essay-self-review" type="checkbox"> Я перечитал текст и внёс необходимые исправления</label><p id="essay-error" role="status"></p><button id="study-complete" class="primary" type="button">Сохранить письменную работу</button><p class="muted">Проверка оценивает объём, структуру, связки и разнообразие словаря. Без отдельного языкового анализатора она не подтверждает грамматическую и орфографическую правильность.</p>';
 c.panel('writing','Письменная практика',html);
 const area=c.view.querySelector('#study-essay');let saveTimer=null,reviewedText=null,lastMetrics=null;
 area.addEventListener('input',()=>{c.log.answers.essay=area.value;reviewedText=null;lastMetrics=null;if(saveTimer)clearTimeout(saveTimer);saveTimer=setTimeout(c.save,300);});
 function analyse(text){
  const words=(text.toLowerCase().match(/[a-z]+(?:['’-][a-z]+)*/g)||[]);
  const sentences=text.split(/[.!?]+/).map(x=>x.trim()).filter(x=>x.split(/\s+/).filter(Boolean).length>=2);
  const connectors=['because','although','however','therefore','moreover','furthermore','for example','for instance','as a result','on the other hand','in addition','whereas','nevertheless','consequently','firstly','finally','since','but','so'];
  const lower=' '+text.toLowerCase().replace(/[^a-z ]/g,' ')+' ';
  const linkers=connectors.filter(x=>x.includes(' ')?lower.includes(' '+x+' '):new RegExp('\\b'+x+'\\b').test(lower)).length;
  const diversity=words.length?new Set(words).size/words.length:0;
  const checks=[
   {label:'Объём: '+words.length+'/'+minWords,ok:words.length>=minWords},
   {label:'Предложения: '+sentences.length+'/'+minSentences,ok:sentences.length>=minSentences},
   {label:'Связующие выражения: '+linkers+'/'+minLinkers,ok:linkers>=minLinkers},
   {label:'Разнообразие словаря: '+Math.round(diversity*100)+'% (ориентир 30%)',ok:diversity>=.3}
  ];
  return {words:words.length,sentences:sentences.length,linkers,lexicalDiversity:Number(diversity.toFixed(3)),checks,passed:words.length>=minWords&&checks.filter(x=>x.ok).length>=3};
 }
 c.view.querySelector('#essay-review').onclick=()=>{
  const text=area.value.trim();lastMetrics=analyse(text);reviewedText=text;
  c.log.answers.essay=text;c.log.answers.essayReview=lastMetrics;
  c.log.assessment=c.log.assessment||{};c.log.assessment.writing={structuralChecks:lastMetrics.checks.filter(x=>x.ok).length,totalChecks:4,words:lastMetrics.words,passed:lastMetrics.passed};c.save();
  const suggestions=lastMetrics.checks.filter(x=>!x.ok).map(x=>'<li>'+esc(x.label)+' — доработай этот аспект.</li>').join('');
  c.view.querySelector('#essay-feedback').innerHTML='<div class="feedback '+(lastMetrics.passed?'':'bad')+'"><strong>Структурный анализ: '+lastMetrics.checks.filter(x=>x.ok).length+'/4</strong><ul>'+lastMetrics.checks.map(x=>'<li>'+(x.ok?'✓ ':'✕ ')+esc(x.label)+'</li>').join('')+'</ul>'+(suggestions?'<p>Рекомендации:</p><ul>'+suggestions+'</ul>':'<p>Структурные критерии выполнены. Перечитай формулировки и проверь смысл.</p>')+'</div>';
 };
 c.view.querySelector('#study-complete').onclick=()=>{
  const text=area.value.trim();if(reviewedText!==text||!lastMetrics){c.view.querySelector('#essay-error').textContent='Сначала запусти структурную проверку после последнего изменения текста.';return;}
  if(!lastMetrics.passed){c.view.querySelector('#essay-error').textContent='Структурные критерии пока не выполнены. Исправь текст и проверь снова.';return;}
  if(!c.view.querySelector('#essay-self-review').checked){c.view.querySelector('#essay-error').textContent='Перечитай работу и подтверди, что внёс необходимые исправления.';return;}
  c.log.answers.essay=text;c.save();c.complete('writing');
 };
};
})();