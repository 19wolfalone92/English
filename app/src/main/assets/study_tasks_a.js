(()=>{'use strict';
const handlers={};
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=a=>{const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;};
const bank=()=>[
 ...(window.WOLFIE_WORDS||[]),...(window.WOLFIE_EXTRA_WORDS||[]),
 ...(window.WOLFIE_LESSONS||[]).flatMap(u=>u.pairs.map(p=>({...p,level:u.level,topic:u.title}))),
 ...(window.WOLFIE_EXTRA_PHRASES||[])
];
function choicesFor(item){
 const candidates=shuffle(bank().filter(x=>x.id!==item.id&&x.level===item.level&&x.ru!==item.ru));
 const selected=[];const seen=new Set([item.ru]);
 for(const x of candidates){if(!seen.has(x.ru)){selected.push(x);seen.add(x.ru);}if(selected.length===3)break;}
 return shuffle([item,...selected]);
}
function renderRecall(c,container,items,key,passPercent,onDone,credited=new Set()){
 let submitted=false;
 let html='<fieldset class="study-questions"><legend>Вспомни перевод без подсказки</legend>';
 html+=items.map((item,i)=>'<div class="study-question"><b>'+(i+1)+'. '+esc(item.en)+'</b>'+choicesFor(item).map((o,j)=>'<label><input type="radio" name="'+key+i+'" value="'+(o.id===item.id?'1':'0')+'"> '+esc(o.ru)+'</label>').join('')+'</div>').join('');
 html+='</fieldset><p id="'+key+'-error" role="status"></p><button type="button" class="primary" id="'+key+'-check">Проверить ответы</button><div id="'+key+'-result" aria-live="polite"></div>';
 container.innerHTML=html;
 container.querySelector('#'+key+'-check').onclick=()=>{
  if(submitted)return;
  const selected=[];for(let i=0;i<items.length;i++){const v=container.querySelector('input[name="'+key+i+'"]:checked');if(!v){container.querySelector('#'+key+'-error').textContent='Ответь на все вопросы.';return;}selected.push(v.value==='1');}
  submitted=true;container.querySelector('#'+key+'-check').disabled=true;
  const correct=selected.filter(Boolean).length;
  selected.forEach((ok,i)=>{if(!credited.has(items[i].id)){if(c.onReview)c.onReview(items[i],ok);if(ok)credited.add(items[i].id);}});
  const percent=Math.round(correct/items.length*100);
  c.log.answers[key]={correct,total:items.length,percent,at:Date.now()};
  c.log.assessment=c.log.assessment||{};
  c.log.assessment[key==='vocabQuiz'?'vocabulary':'review']={correct,total:items.length,percent};
  c.save();
  if(correct>=Math.ceil(items.length*passPercent)){
   container.querySelector('#'+key+'-result').innerHTML='<div class="feedback"><strong>Результат '+correct+'/'+items.length+' ('+percent+'%)</strong><p>Порог пройден. Ответы добавлены в интервальное повторение.</p><button type="button" class="primary" id="'+key+'-finish">Завершить этап</button></div>';
   container.querySelector('#'+key+'-finish').onclick=onDone;
  }else{
   container.querySelector('#'+key+'-result').innerHTML='<div class="feedback bad"><strong>'+correct+'/'+items.length+' — нужно не менее '+Math.ceil(items.length*passPercent)+' правильных ответов.</strong><p>Повтори материал и пройди проверку ещё раз.</p><button type="button" class="secondary" id="'+key+'-retry">Повторить проверку</button></div>';
   container.querySelector('#'+key+'-retry').onclick=()=>renderRecall(c,container,items,key,passPercent,onDone,credited);
  }
 };
}
handlers.review=c=>{
 const items=(c.getReviewItems?c.getReviewItems():[]).slice(0,8);
 const html=items.length
  ?'<p>Сначала повторяются карточки, срок которых наступил. Правильный ответ увеличивает интервал, ошибка возвращает карточку в очередь.</p><div id="review-quiz"></div>'
  :'<p>Сейчас нет карточек с наступившим сроком повторения. Новые слова появятся в очереди после изучения и проверки.</p><div class="feedback"><strong>Очередь пуста</strong><p>Этот блок засчитывается без искусственного добавления новых карточек.</p></div><button id="study-complete" class="primary" type="button">Завершить повторение</button>';
 c.panel('review','Интервальное повторение',html);
 if(items.length)renderRecall(c,c.view.querySelector('#review-quiz'),items,'reviewQuiz',.7,()=>c.complete('review'));
 else c.view.querySelector('#study-complete').onclick=()=>{c.log.answers.review='0/0';c.log.assessment.review={status:'no-cards-due',correct:0,total:0};c.complete('review');};
};
handlers.vocab=c=>{
 const words=(c.unit.practicePairs||c.unit.pairs).slice(0,15);
 const quizItems=shuffle(words).slice(0,5);
 const html='<p>Просмотри карточки, затем проверь активное воспроизведение: выбери русский смысл без открытия подсказки. Пять ответов попадут в интервальное повторение.</p><div class="study-pairs">'+words.map((p,i)=>'<details class="study-pair"><summary>'+(i+1)+'. '+esc(p.en)+'</summary><p>'+esc(p.ru)+'</p></details>').join('')+'</div><div id="vocab-quiz"></div>';
 c.panel('vocab','Новая лексика',html);
 renderRecall(c,c.view.querySelector('#vocab-quiz'),quizItems,'vocabQuiz',.8,()=>c.complete('vocab'));
};
handlers.grammar=c=>{
 const m=window.WOLFIE_ROADMAP.months[c.unit.month-1];
 const g=m.grammar[Math.min(3,Math.floor((c.unit.day-1)/7))];
 const extra=window.WOLFIE_GRAMMAR_BANK[g.title],quiz=window.WOLFIE_GRAMMAR_QUIZ?.[g.title]||[];
 const html='<div class="grammar-box"><h2>'+esc(g.title)+'</h2><p>'+esc(g.rule)+'</p><p class="grammar-example"><b>'+esc(g.example.en)+'</b><br>'+esc(g.example.ru)+'</p>'+extra.examples.map(pair=>'<p class="grammar-example">'+esc(pair[0])+'<br>'+esc(pair[1])+'</p>').join('')+'<p class="study-tip"><b>Частая ошибка:</b> '+esc(extra.pitfall)+'</p></div><p>Ответь на два задания Use of English, затем напиши два собственных предложения. Автоматическая проверка оценивает тест; собственные предложения сохраняются для повторного анализа.</p><fieldset class="study-questions"><legend>Use of English · '+esc(g.title)+'</legend>'+quiz.map((q,i)=>'<div class="study-question"><b>'+(i+1)+'. '+esc(q.prompt)+'</b>'+q.options.map((o,j)=>'<label><input type="radio" name="grammar-q'+i+'" value="'+j+'"> '+esc(o)+'</label>').join('')+'</div>').join('')+'</fieldset><p id="grammar-error" role="status"></p><div id="grammar-feedback"></div><label for="study-grammar">Два собственных предложения</label><textarea class="study-input" id="study-grammar" rows="5" placeholder="Write two original sentences...">'+esc(c.log.answers.grammar||'')+'</textarea><button id="study-complete" class="primary" type="button">Проверить и сохранить</button>';
 c.panel('grammar','Грамматика и Use of English',html);
 const area=c.view.querySelector('#study-grammar');let saveTimer=null;
 area.addEventListener('input',()=>{c.log.answers.grammar=area.value;if(saveTimer)clearTimeout(saveTimer);saveTimer=setTimeout(c.save,350);});
 c.view.querySelector('#study-complete').onclick=()=>{
  let correct=0;const explanations=[];
  for(let i=0;i<quiz.length;i++){const selected=c.view.querySelector('input[name="grammar-q'+i+'"]:checked');if(!selected){c.view.querySelector('#grammar-error').textContent='Ответь на оба вопроса Use of English.';return;}const ok=Number(selected.value)===quiz[i].correct;correct+=Number(ok);explanations.push('<p>'+(ok?'✓ ':'✕ ')+esc(quiz[i].explanation)+'</p>');}
  const sentences=area.value.split(/[.!?]+/).filter(x=>x.trim().split(/\s+/).length>=4);
  c.log.answers.grammar=area.value;c.log.answers.grammarQuiz={correct,total:quiz.length,percent:Math.round(correct/quiz.length*100)};
  c.log.assessment=c.log.assessment||{};c.log.assessment.grammar={correct,total:quiz.length,percent:Math.round(correct/quiz.length*100)};
  c.save();
  c.view.querySelector('#grammar-feedback').innerHTML='<div class="feedback '+(correct===quiz.length?'':'bad')+'"><strong>Use of English: '+correct+'/'+quiz.length+'</strong>'+explanations.join('')+'</div>';
  if(correct!==quiz.length){c.view.querySelector('#grammar-error').textContent='Нужно ответить правильно на оба вопроса. Исправь ответы и проверь снова.';return;}
  if(sentences.length<2){c.view.querySelector('#grammar-error').textContent='Напиши два самостоятельных предложения (не менее четырёх слов каждое).';return;}
  c.complete('grammar');
 };
};
handlers.reading=c=>{
 const slot=Math.min(3,Math.floor((c.unit.day-1)/8));
 const index=slot<2?(c.unit.month-1)+slot*10:20+(c.unit.month-1)*2+(slot-2);
 const text=window.WOLFIE_READINGS[index],questions=text.questions;
 let html='<p class="muted">Прочитай текст без переводчика. Вопросы проверяют основную мысль, детали, выводы, лексику и авторскую позицию.</p><article class="study-reading"><h2>'+esc(text.title)+'</h2>'+text.paragraphs.map(p=>'<p>'+esc(p)+'</p>').join('')+'</article><fieldset class="study-questions"><legend>Проверь понимание</legend>'+questions.map((q,i)=>'<div class="study-question"><small class="question-label">'+esc(q.type||'comprehension')+'</small><b>'+(i+1)+'. '+esc(q.q)+'</b>'+q.options.map((o,j)=>'<label><input type="radio" name="rq'+i+'" value="'+j+'"> '+esc(o)+'</label>').join('')+'</div>').join('')+'</fieldset><p id="study-error" role="status"></p><button id="study-complete" class="primary" type="button">Проверить ответы</button>';
 c.panel('reading','Чтение',html);
 c.view.querySelector('#study-complete').onclick=()=>{
  let scored=0;for(let i=0;i<questions.length;i++){const selected=c.view.querySelector('input[name="rq'+i+'"]:checked');if(!selected){c.view.querySelector('#study-error').textContent='Ответь на все вопросы.';return;}scored+=Number(Number(selected.value)===questions[i].correct);}
  const threshold=Math.ceil(questions.length*2/3),percent=Math.round(scored/questions.length*100);
  c.log.answers.reading=scored+'/'+questions.length;c.log.assessment=c.log.assessment||{};c.log.assessment.reading={correct:scored,total:questions.length,percent};c.save();
  if(scored<threshold){c.view.querySelector('#study-error').textContent='Результат '+scored+'/'+questions.length+'. Для завершения нужно '+threshold+'. Перечитай текст и исправь ответы.';return;}
  c.complete('reading');
 };
};
window.WOLFIE_STUDY_TASKS={handlers,open(ctx){const fn=handlers[ctx.key];if(!fn)throw Error('Missing study stage '+ctx.key);fn(ctx);}};
})();