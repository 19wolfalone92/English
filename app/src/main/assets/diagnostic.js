(()=>{'use strict';
const forms=window.WOLFIE_DIAGNOSTIC_FORMS||[];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').toLowerCase().trim().replace(/[’‘]/g,"'").replace(/\s+/g,' ').replace(/[.!?]$/,'');
const getForm=id=>forms.find(f=>f.id===id);
function evaluate(form,answers){
 const stats={Vocabulary:{correct:0,total:0},Grammar:{correct:0,total:0},Reading:{correct:0,total:0}};
 const results=form.items.map(q=>{const a=answers[q.id];const ok=q.options?Number.isInteger(a)&&a===q.correct:typeof a==='string'&&q.answers.some(x=>norm(x)===norm(a));stats[q.skill].total++;stats[q.skill].correct+=Number(ok);return {id:q.id,skill:q.skill,ok};});
 return {stats,results,unassessed:['Listening','Speaking','Writing'],qualification:'screening-only'};
}
function chooseForm(level,history){const options=forms.filter(f=>f.level===level);return options.find(f=>!history.some(h=>h.formId===f.id))||options.slice().sort((a,b)=>(history.filter(h=>h.formId===a.id).at(-1)?.at||0)-(history.filter(h=>h.formId===b.id).at(-1)?.at||0))[0];}
function recommend(level,stats){const gaps=Object.entries(stats).filter(([,v])=>v.correct/v.total<.75).map(([k])=>k);return gaps.length?'Повтори '+gaps.join(', ')+' на уровне '+level+'.':'Можно попробовать следующий уровень диагностики. Это не подтверждает CEFR.';}
function mount(view,{store,save,onExit,onPractice}){
 const model=store.diagnostic||(store.diagnostic={history:[],active:null});
 model.history=Array.isArray(model.history)?model.history:[];
 const node=s=>view.querySelector(s);
 const draw=html=>{view.innerHTML='<section class="diagnostic-shell"><button id="diag-back" class="secondary" type="button">← К курсу</button>'+html+'</section>';node('#diag-back').onclick=onExit;if(typeof window.scrollTo==='function')window.scrollTo(0,0);};
 function menu(){
  const last=model.history.at(-1);
  draw('<span class="eyebrow">WOLFIE · CHECKPOINT</span><h1>Диагностика знаний</h1><p>Короткий независимый скрининг: словарь, грамматика с вводом ответа и чтение. Восемь заданий на форму. Не официальный экзамен CEFR.</p><div class="diag-levels">'+['A2','B1','B2'].map(l=>'<button class="secondary" data-diag-level="'+l+'">'+l+' · начать</button>').join('')+'</div>'+(model.active?'<button class="primary" id="diag-resume">Продолжить незавершённый тест</button>':'')+(last?'<div class="question-card"><h2>Последний результат · '+esc(getForm(last.formId)?.level||'')+'</h2>'+scoreHtml(last.report)+'<button id="diag-last" class="secondary">Разбор ответов</button></div>':'')+'<p class="muted">Устная и письменная речь требуют независимой оценки. Аудирование не входит в эту версию скрининга.</p>');
  view.querySelectorAll('[data-diag-level]').forEach(b=>b.onclick=()=>{if(model.active){node('#diag-resume').focus();return;}const f=chooseForm(b.dataset.diagLevel,model.history);model.active={formId:f.id,index:0,answers:{},writing:'',speaking:'',seen:model.history.some(h=>h.formId===f.id)};save();render();});
  if(model.active)node('#diag-resume').onclick=render;
  if(last)node('#diag-last').onclick=()=>result(last);
 }
 function scoreHtml(report){return Object.entries(report.stats).map(([k,v])=>'<p><b>'+esc(k)+'</b> '+v.correct+'/'+v.total+'</p>').join('')+'<p>Listening · Speaking · Writing — не оценены</p>';}
 function render(){
  const s=model.active,f=getForm(s?.formId);if(!f){model.active=null;save();menu();return;}
  if(s.index>=f.items.length){production(s,f);return;}
  const q=f.items[s.index],a=s.answers[q.id];
  draw('<p class="muted">'+f.level+' · '+(s.index+1)+'/'+f.items.length+(s.seen?' · повторная форма':' · новая форма')+'</p><div class="bar"><div style="width:'+Math.round(s.index/f.items.length*100)+'%"></div></div>'+(q.skill==='Reading'?'<article class="study-reading"><h2>'+esc(f.title)+'</h2><p>'+esc(f.passage)+'</p></article>':'')+'<h1>'+esc(q.skill)+'</h1><p>'+esc(q.prompt)+'</p>'+(q.options?'<fieldset class="study-questions"><legend>Выбери ответ</legend>'+q.options.map((x,i)=>'<label><input type="radio" name="diag-choice" value="'+i+'" '+(a===i?'checked':'')+'> '+esc(x)+'</label>').join('')+'</fieldset>':'<label for="diag-answer">Ответ</label><input id="diag-answer" class="study-input" type="text" autocomplete="off" value="'+esc(a)+'">')+'<p id="diag-error" role="status"></p><button id="diag-next" class="primary">Далее</button><button id="diag-skip" class="secondary">Не знаю / пропустить</button>');
  if(q.options)view.querySelectorAll('[name="diag-choice"]').forEach(b=>b.onchange=()=>{s.answers[q.id]=Number(b.value);save();});
  else node('#diag-answer').oninput=e=>{s.answers[q.id]=e.target.value;save();};
  let advanced=false;const advance=skip=>{if(advanced||model.active!==s)return;const value=s.answers[q.id];if(!skip&&(value===undefined||String(value).trim()==='')){node('#diag-error').textContent='Введи ответ или выбери «Не знаю».';return;}advanced=true;if(skip)s.answers[q.id]=null;s.index++;save();render();};
  node('#diag-next').onclick=()=>advance(false);node('#diag-skip').onclick=()=>advance(true);
 }
 function production(s,f){
  draw('<h1>Свободные ответы</h1><p>Объективный тест завершён. Эти задания необязательны и не оцениваются автоматически. Можно сохранить ответ для преподавателя.</p><label for="diag-writing">Writing · '+esc(f.writing)+'</label><textarea id="diag-writing" class="study-input" rows="6">'+esc(s.writing)+'</textarea><label for="diag-speaking">Speaking · '+esc(f.speaking)+'</label><textarea id="diag-speaking" class="study-input" rows="4" placeholder="Заметки к устному ответу">'+esc(s.speaking)+'</textarea><button class="primary" id="diag-finish">Завершить и показать результат</button>');
  node('#diag-writing').oninput=e=>{s.writing=e.target.value;save();};node('#diag-speaking').oninput=e=>{s.speaking=e.target.value;save();};
  node('#diag-finish').onclick=()=>{if(model.active!==s)return;const rec={formId:f.id,at:Date.now(),seen:s.seen,answers:{...s.answers},writing:s.writing,speaking:s.speaking,report:evaluate(f,s.answers)};model.history.push(rec);model.active=null;save();result(rec);};
 }
 function result(rec){const f=getForm(rec.formId);if(!f){menu();return;}draw('<h1>Результат · '+f.level+'</h1><p>'+(rec.seen?'Повторная форма: возможен эффект запоминания.':'Первая попытка на этой форме.')+'</p>'+scoreHtml(rec.report)+'<p>'+esc(recommend(f.level,rec.report.stats))+'</p><details class="question-card"><summary>Разбор заданий</summary>'+f.items.map((q,i)=>'<p><b>'+(i+1)+'. '+esc(q.prompt)+'</b><br>Твой ответ: '+esc(q.options?q.options[rec.answers[q.id]]??'—':rec.answers[q.id]??'—')+'<br>Ожидаемый ответ: '+esc(q.options?q.options[q.correct]:q.answers.join(' / '))+'<br>'+ (rec.report.results[i].ok?'Верно':'Повторить')+'</p>').join('')+'</details><button class="primary" id="diag-menu">Другой тест</button><button class="secondary" id="diag-practice">Практика курса</button>');
  node('#diag-menu').onclick=menu;node('#diag-practice').onclick=onPractice;
 }
 menu();
}
window.WOLFIE_DIAGNOSTIC={forms,evaluate,chooseForm,recommend,mount};
})();
