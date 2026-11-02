(()=>{'use strict';
const stages=[['vocab','📖 Словарь',10],['grammar','🧠 Грамматика',10],['reading','📚 Чтение',10],['listening','🎧 Аудирование',10],['speaking','🗣️ Разговор',10],['writing','✍️ Письмо',10],['exam','🏆 Проверка',5]];
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function mount(view,api){
const {unit,store,save,onExit,onExam,speak,voiceAvailable}=api;
store.study=store.study||{};const log=store.study[unit.id]||(store.study[unit.id]={done:{},answers:{},time:{}});let timer=null;
const stop=()=>{if(timer)clearInterval(timer);timer=null;save();};
function panel(key,title,html){stop();view.innerHTML='<div class="study-wrap"><button id="study-back" class="secondary">← План дня</button><h1>'+title+'</h1>'+html+'<p class="study-time">Время в этом блоке: <b id="study-clock">'+Math.floor((log.time[key]||0)/60)+' мин</b></p></div>';view.querySelector('#study-back').onclick=home;timer=setInterval(()=>{if(!document.hidden){log.time[key]=(log.time[key]||0)+1;const t=view.querySelector('#study-clock');if(t)t.textContent=Math.floor(log.time[key]/60)+' мин';if(log.time[key]%15===0)save();}},1000);}
function complete(key){log.done[key]=true;save();home();}
function home(){stop();let s='<div class="study-wrap"><button class="secondary" id="study-exit">← К курсу</button><h1>Учебный день '+unit.day+' 🐺</h1><p>'+unit.level+' · 7 этапов, примерно 60–65 минут. Тест — лишь заключительная часть.</p><div class="study-stages">';for(const [key,label,min] of stages){let enabled=key!=='exam'||stages.slice(0,6).every(x=>log.done[x[0]]);s+='<button class="study-stage" data-study="'+key+'" '+(enabled?'':'disabled')+'><strong>'+label+'</strong><small>~'+min+' мин · '+(log.done[key]?'✓ выполнено':enabled?'открыть':'сначала заверши 6 этапов')+'</small></button>';}view.innerHTML=s+'</div><p class="muted">Разговорные ответы и свободное письмо пока не оцениваются автоматически. Выполнение упражнений не подтверждает уровень B2.</p></div>';view.querySelector('#study-exit').onclick=()=>{stop();onExit();};view.querySelectorAll('[data-study]').forEach(b=>b.onclick=()=>open(b.dataset.study));}
function open(key){if(key==='exam'){stop();onExam();return;}window.WOLFIE_STUDY_TASKS.open({key,unit,log,view,panel,complete,esc,save,speak,voiceAvailable});}
home();}
window.WOLFIE_STUDY={mount,stages};
})();