(()=>{'use strict';
const stages=[
 {key:'review',label:'Интервальное повторение',minutes:8},
 {key:'vocab',label:'Новая лексика',minutes:10},
 {key:'grammar',label:'Грамматика · Use of English',minutes:10},
 {key:'listening',label:'Аудирование',minutes:12},
 {key:'reading',label:'Чтение',minutes:10},
 {key:'speaking',label:'Разговорная практика',minutes:10},
 {key:'writing',label:'Письмо',minutes:12},
 {key:'exam',label:'Итоговая проверка',minutes:5}
];
const learningStages=stages.filter(x=>x.key!=='exam');
const icons={
 review:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></svg>',
 vocab:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20M8 7h8M8 10h6"/></svg>',
 grammar:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16M4 12h16M4 19h16"/><circle cx="9" cy="5" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="7" cy="19" r="2"/></svg>',
 listening:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14v-3a8 8 0 0 1 16 0v3"/><path d="M4 13H3v5h4v-5H4zm16 0h1v5h-4v-5h3zM12 21h3"/></svg>',
 reading:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H12v17H5.5A2.5 2.5 0 0 0 3 22z"/><path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H12v17h6.5A2.5 2.5 0 0 1 21 22z"/></svg>',
 speaking:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4m-4 0h8"/></svg>',
 writing:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 20 4.5-1 10.8-10.8a2.1 2.1 0 0 0-3-3L5.5 16z"/><path d="m14.8 6.2 3 3M4 20h16"/></svg>',
 exam:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v4H7zM5 5H3v16h18V5h-2"/><path d="m8 14 2.5 2.5L16 11"/></svg>'
};
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function mount(view,api){
 const {unit,store,save,onExit,onExam,speak,voiceAvailable,voiceLocale,getReviewItems,onReview}=api;
 store.study=store.study||{};
 const log=store.study[unit.id]||(store.study[unit.id]={done:{},answers:{},time:{},assessment:{}});
 log.done=log.done||{};log.answers=log.answers||{};log.time=log.time||{};log.assessment=log.assessment||{};
 let timer=null;
 const stop=()=>{if(timer)clearInterval(timer);timer=null;save();};
 function panel(key,title,html){
  stop();if(key!=='speaking')window.WOLFIE_SPEECH_CALLBACK=null;
  view.innerHTML='<div class="study-wrap"><button id="study-back" class="secondary" type="button">← План дня</button><h1>'+title+'</h1><div class="study-panel-content">'+html+'</div><p class="study-time">Время в этом блоке: <b id="study-clock">'+Math.floor((log.time[key]||0)/60)+' мин</b></p></div>';
  view.querySelector('#study-back').onclick=home;
  timer=setInterval(()=>{if(!document.hidden){log.time[key]=(log.time[key]||0)+1;const t=view.querySelector('#study-clock');if(t)t.textContent=Math.floor(log.time[key]/60)+' мин';if(log.time[key]%10===0)save();}},1000);
 }
 function complete(key){log.done[key]=true;log.completedAt=log.completedAt||{};log.completedAt[key]=Date.now();save();home();}
 function home(){
  stop();window.WOLFIE_SPEECH_CALLBACK=null;
  const done=learningStages.filter(x=>log.done[x.key]).length;
  const examEnabled=done===learningStages.length;
  const examDone=!!log.done.exam;
  let html='<div class="study-wrap"><button class="secondary" id="study-exit" type="button">← К курсу</button><h1>Учебный день '+unit.day+'</h1><p>'+unit.level+' · 7 учебных блоков и итоговый тест · 77 минут. Дополнительно: 15 минут свободного погружения.</p><div class="bar" role="progressbar" aria-label="Прогресс учебного дня" aria-valuemin="0" aria-valuemax="7" aria-valuenow="'+done+'"><div style="width:'+Math.round(done/7*100)+'%"></div></div><p class="muted">Завершено учебных блоков: '+done+'/7. Итоговый тест открывается после всех семи блоков.</p><div class="study-stages">';
  for(const stage of stages){
   const enabled=stage.key!=='exam'||examEnabled;
   const completed=!!log.done[stage.key]||(stage.key==='exam'&&examDone);
   html+='<button class="study-stage '+(completed?'completed':'')+'" type="button" data-study="'+stage.key+'" '+(enabled?'':'disabled')+'><span class="stage-icon">'+icons[stage.key]+'</span><span class="stage-detail"><strong>'+stage.label+'</strong><small>~'+stage.minutes+' мин · '+(completed?'✓ выполнено':enabled?'открыть':'сначала заверши 7 учебных блоков')+'</small></span></button>';
  }
  html+='</div><p class="muted">Система проверяет ответы и структуру письменной работы. Транскрипция речи не является оценкой произношения; синтезированная речь не заменяет аутентичные аудиозаписи.</p></div>';
  view.innerHTML=html;
  view.querySelector('#study-exit').onclick=()=>{stop();onExit();};
  view.querySelectorAll('[data-study]').forEach(b=>b.onclick=()=>open(b.dataset.study));
 }
 function open(key){if(key==='exam'){if(!learningStages.every(x=>log.done[x.key]))return;stop();onExam();return;}window.WOLFIE_STUDY_TASKS.open({key,unit,log,view,panel,complete,esc,save,speak,voiceAvailable,voiceLocale,getReviewItems,onReview});}
 home();
}
window.WOLFIE_STUDY={mount,stages};
})();