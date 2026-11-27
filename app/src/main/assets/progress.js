(()=>{'use strict';
const LIMIT=5000000;
const map=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const integer=x=>Number.isSafeInteger(x)&&x>=0;
const bytes=s=>new TextEncoder().encode(s);
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
function validate(raw){
 if(typeof raw!=='string'||bytes(raw).length>LIMIT)throw Error('Размер прогресса превышает 5 МБ.');
 const v=JSON.parse(raw);
 if(!map(v))throw Error('Некорректный формат прогресса.');
 let count=0;
 function safe(x,depth=0){if(depth>32||++count>300000)throw Error('Слишком сложная структура.');if(x!==null&&typeof x==='object'){for(const k of Object.keys(x)){if(['__proto__','constructor','prototype'].includes(k))throw Error('Недопустимый ключ.');safe(x[k],depth+1);}}}
 safe(v);
 if(own(v,'schemaVersion')&&![1,2].includes(v.schemaVersion))throw Error('Неподдерживаемая версия прогресса.');
 for(const k of ['items','finished','days','study','settings','selfReviews','contextLessons'])if(own(v,k)&&!map(v[k]))throw Error('Некорректный раздел '+k);
 for(const k of ['xp','correct','attempts'])if(own(v,k)&&!integer(v[k]))throw Error('Некорректный счётчик '+k);
 if((v.correct||0)>(v.attempts||0))throw Error('Некорректное число правильных ответов.');
 for(const [id,x] of Object.entries(v.items||{}))if(!map(x)||!integer(x.stage)||x.stage>5||!integer(x.due))throw Error('Некорректная карточка '+id);
 for(const [id,x] of Object.entries(v.finished||{}))if(!map(x)||typeof x.done!=='boolean'||!integer(x.best))throw Error('Некорректный результат '+id);
 for(const x of Object.values(v.days||{}))if(!integer(x))throw Error('Некорректная дневная статистика.');
 for(const [id,x] of Object.entries(v.study||{})){if(!map(x))throw Error('Некорректный урок '+id);for(const k of ['done','answers','time','assessment','completedAt'])if(own(x,k)&&!map(x[k]))throw Error('Некорректный раздел урока '+k);}
 if(own(v,'contextLessons'))for(const [id,x] of Object.entries(v.contextLessons)){
  if(!/^mission-v2-\d{3}$/.test(id)||!map(x)||!integer(x.version)||!['overview','review','vocab','grammar','reading','audio','speaking','writing','final','result'].includes(x.tab))throw Error('Некорректная тематическая миссия.');
  for(const k of ['answers','drafts','checks'])if(!map(x[k]))throw Error('Некорректный раздел миссии.');
  for(const [k,a] of Object.entries(x.answers))if(!/^(v\d+|g\d+|r\d+|rev\d+|f\d+|audio)$/.test(k)||!(typeof a==='string'||integer(a)||Array.isArray(a)&&a.every(integer)))throw Error('Некорректный ответ миссии.');
  for(const a of Object.values(x.drafts))if(typeof a!=='string')throw Error('Некорректный черновик миссии.');
  for(const a of Object.values(x.checks))if(!map(a)||typeof a.ok!=='boolean')throw Error('Некорректная проверка миссии.');
  if(own(x,'mode')&&!['quick','short','standard','intensive','free'].includes(x.mode))throw Error('Некорректный режим миссии.');
  if(own(x,'finalSubmitted')&&typeof x.finalSubmitted!=='boolean')throw Error('Некорректный итог миссии.');
  if(own(x,'reviewItems')&&(!Array.isArray(x.reviewItems)||x.reviewItems.length>8||x.reviewItems.some(r=>!map(r)||typeof r.id!=='string'||typeof r.en!=='string'||typeof r.ru!=='string')))throw Error('Некорректное повторение миссии.');
  if(own(x,'writingIndex')&&(!integer(x.writingIndex)||x.writingIndex>2))throw Error('Некорректный вариант письма.');
 }
 if(own(v,'studio')){
  const s=v.studio;
  if(!map(s)||!map(s.saved)||!map(s.corrections)||!map(s.charts)||typeof s.draft!=='string'||s.draft.length>4000||!Array.isArray(s.versions)||s.versions.length>20)throw Error('Некорректная учебная студия.');
  for(const [id,value] of Object.entries(s.saved))if(typeof id!=='string'||id.length>128||value!==true)throw Error('Некорректная сохранённая карточка.');
  if(own(s,'teacher')){const t=s.teacher;if(!map(t)||typeof t.draft!=='string'||t.draft.length>500||!map(t.rules)||Object.keys(t.rules).length>32)throw Error('Некорректный профиль наставника.');for(const [id,r] of Object.entries(t.rules))if(!/^[a-z][a-z-]{1,39}$/.test(id)||!map(r)||!['pending','correct','incorrect'].includes(r.practice))throw Error('Некорректный результат наставника.');}
  for(const v of s.versions)if(!map(v)||!integer(v.at)||typeof v.text!=='string'||v.text.length>4000)throw Error('Некорректная версия текста.');
  for(const [id,v] of Object.entries(s.corrections))if(!/^mission-v2-\d{3}:(?:g\d+|v\d+|r\d+|f\d+|rev\d+|audio)$/.test(id)||!map(v)||typeof v.ok!=='boolean'||!integer(v.at))throw Error('Некорректное исправление.');
  for(const [id,v] of Object.entries(s.charts))if(!['present','past','future','passive','condition'].includes(id)||!map(v)||!integer(v.answer)||v.answer>2||typeof v.ok!=='boolean')throw Error('Некорректная грамматическая проверка.');
 }
 if(own(v,'diagnostic')){
  const d=v.diagnostic;if(!map(d)||!Array.isArray(d.history)||!(d.active===null||map(d.active)))throw Error('Некорректная диагностика.');
  const forms=window.WOLFIE_DIAGNOSTIC_FORMS||[];
  const form=id=>forms.find(f=>f.id===id);
  if(d.active){const f=form(d.active.formId);if(!f||!integer(d.active.index)||d.active.index>f.items.length||!map(d.active.answers)||typeof d.active.writing!=='string'||typeof d.active.speaking!=='string')throw Error('Некорректный черновик диагностики.');}
  for(const h of d.history){if(!map(h)||!form(h.formId)||!map(h.answers)||!map(h.report)||!integer(h.at))throw Error('Некорректный результат диагностики.');}
 }
 return {...{items:{},finished:{},xp:0,days:{},correct:0,attempts:0,speed:false,study:{},settings:{}},...v,schemaVersion:2};
}
async function hash(raw,android){
 if(android&&typeof android.progressHash==='function'){const h=android.progressHash(raw);if(!/^[a-f0-9]{64}$/.test(h))throw Error('Не удалось вычислить контрольную сумму.');return h;}
 if(!globalThis.crypto?.subtle)throw Error('Контрольная сумма недоступна на этом устройстве.');
 const d=await globalThis.crypto.subtle.digest('SHA-256',bytes(raw));return [...new Uint8Array(d)].map(n=>n.toString(16).padStart(2,'0')).join('');
}
async function makeBackup(store,android){const payload=JSON.stringify(store);validate(payload);return JSON.stringify({format:'wolfie-progress',schema:1,sha256:await hash(payload,android),payload});}
async function readBackup(raw,android){
 if(typeof raw!=='string'||bytes(raw).length>10000000)throw Error('Файл резервной копии слишком большой.');
 const e=JSON.parse(raw);if(!map(e)||e.format!=='wolfie-progress'||e.schema!==1||typeof e.payload!=='string'||!/^[a-f0-9]{64}$/.test(e.sha256||''))throw Error('Неподдерживаемый формат резервной копии.');
 const v=validate(e.payload);if(await hash(e.payload,android)!==e.sha256)throw Error('Контрольная сумма не совпадает.');return v;
}
window.WOLFIE_PROGRESS={validate,makeBackup,readBackup};
})();
