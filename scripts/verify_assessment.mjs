// Regression checks against the actual course handlers.
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const root=new URL('../app/src/main/assets/',import.meta.url),w={};
const ctx=vm.createContext({window:w,Date,Math,setTimeout:()=>1,clearTimeout(){}});
for(const f of ["curriculum","vocab","expanded","roadmap","missions_a","missions_b","missions_c","missions","study_tasks_a","study_tasks_b"])vm.runInContext(fs.readFileSync(new URL(f+'.js',root),'utf8'),ctx);
const app=fs.readFileSync(new URL('app.js',root),'utf8');

const units=w.WOLFIE_ROADMAP.build(),ids=new Set([...w.WOLFIE_EXTRA_PHRASES,...w.WOLFIE_LESSONS.flatMap(x=>x.pairs)].map(x=>x.id));
for(const u of units)assert.ok(u.practicePairs.filter(p=>ids.has(p.id)&&p.en.split(/\s+/).length>=3).length>=6);
const u=units[0],phrases=u.practicePairs.filter(p=>ids.has(p.id)&&p.en.split(/\s+/).length>=3).slice(0,6);
function harness(log={answers:{},assessment:{}}){let elements=new Map(),markup='',complete=[],scored=[];function node(s){if(!elements.has(s))elements.set(s,{value:'',textContent:'',hidden:false,innerHTML:'',onclick:null,disabled:false,addEventListener(k,f){this[k]=f;}});return elements.get(s);}
const view={querySelector:node,querySelectorAll:()=>[]};
return {unit:u,log,view,panel(k,t,h){elements=new Map();markup=h;},complete:k=>complete.push(k),save(){},voiceAvailable:()=>true,speak:()=>true,onReview:(p,ok)=>scored.push([p.id,ok]),node,completeLog:complete,scored,get markup(){return markup;}};
}
let h=harness();w.WOLFIE_STUDY_TASKS.handlers.listening(h);
h.node('#listen-input').value=phrases[0].en;h.node('#listen-check').onclick();assert.equal(h.scored.length,0);
h.node('#listen-play').onclick();h.node('#listen-check').onclick();h.node('#listen-check').onclick();assert.equal(h.scored.length,1);assert.equal(h.log.answers.listeningSession.correct,1);
h.node('#listen-next').onclick();assert.equal(h.log.answers.listeningSession.index,1);
h.node('#listen-input').value='unfinished text';h.node('#listen-input').input();
h=harness(h.log);w.WOLFIE_STUDY_TASKS.handlers.listening(h);assert.match(h.markup,/Диктант 2\/6/);assert.match(h.markup,/unfinished text/);
for(let i=1;i<6;i++){h.node('#listen-play').onclick();h.node('#listen-input').value=i<4?phrases[i].en:'wrong answer';h.node('#listen-check').onclick();h.node('#listen-next').onclick();}
assert.equal(h.log.assessment.listening.correct,4);h.node('#study-complete').onclick();assert.deepEqual(h.completeLog,['listening']);
let fail=harness();w.WOLFIE_STUDY_TASKS.handlers.listening(fail);
for(let i=0;i<6;i++){fail.node('#listen-play').onclick();fail.node('#listen-input').value='wrong answer';fail.node('#listen-check').onclick();fail.node('#listen-next').onclick();}
assert.equal(fail.log.assessment.listening.correct,0);assert.match(fail.markup,/нужно 4/);assert.equal(fail.completeLog.length,0);
let unavailable=harness();unavailable.voiceAvailable=()=>false;w.WOLFIE_STUDY_TASKS.handlers.listening(unavailable);assert.match(unavailable.markup,/недоступен/);
let changed=harness(h.log);changed.voiceLocale='en-GB';w.WOLFIE_STUDY_TASKS.handlers.listening(changed);assert.match(changed.markup,/Диктант 1\/6/);
// Test the exact SRS function in app.js with isolated persistence and simulated time.
const scoreStart=app.indexOf('function score(item,ok)'),scoreEnd=app.indexOf('function finish()',scoreStart);
assert.ok(scoreStart>=0&&scoreEnd>scoreStart);
const store={items:{},days:{}};
let now=1000000000;
const score=new Function('store','Date','dateKey','today','save','header',app.slice(scoreStart,scoreEnd)+';return score;')(store,{now:()=>now},()=> 'date',()=>store.days.date||0,()=>{},()=>{});
const card={id:'test'};score(card,true);const due=store.items.test.due;score(card,true);assert.equal(store.items.test.stage,1);assert.equal(store.items.test.due,due);
now=due;score(card,true);assert.equal(store.items.test.stage,2);score(card,false);assert.equal(store.items.test.stage,0);assert.equal(store.items.test.due,now);
console.log('PASS: 300-day phrase coverage; listening playback request, duplicate submission, draft resume, 4/6 pass, 0/6 fail, unavailable voice, locale reset; SRS early/due/wrong transitions');
