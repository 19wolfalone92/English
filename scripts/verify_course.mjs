// Node 20+; curriculum integrity without third-party modules
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../app/src/main/assets/',import.meta.url);
const w={},context=vm.createContext({window:w,setInterval:()=>0,clearInterval:()=>{},document:{hidden:false}});
for(const file of ['curriculum.js','vocab.js','expanded.js','roadmap.js','readings_a.js','readings_b.js','readings_c.js','readings_d.js','readings_e.js','readings_f.js','grammar_a.js','grammar_b.js','grammar_c.js','grammar_d.js','study_tasks_a.js','study_tasks_b.js','study.js']){
 vm.runInContext(fs.readFileSync(new URL(file,root),'utf8'),context,{filename:file});
}
const course=w.WOLFIE_ROADMAP,units=course.build();
assert.equal(course.months.length,10);
assert.equal(units.length,300);
assert.equal(new Set(units.map(x=>x.id)).size,300);
for(let i=0;i<300;i++){
 const u=units[i];assert.equal(u.index,i);assert.equal(u.id,'course-'+String(i+1).padStart(3,'0'));
 assert.equal(u.month,Math.floor(i/30)+1);assert.equal(u.day,i%30+1);
 assert.equal(u.pairs.length,10,'unit '+(i+1));
 assert.equal(new Set(u.pairs.map(x=>x.id)).size,10,'duplicate cards '+(i+1));
 assert.ok(u.pairs.every(x=>x.level===u.level&&x.en&&x.ru),'bilingual pair '+(i+1));
 assert.ok(u.challenge.length>=15);
 assert.equal(u.practicePairs.length,18,'18 extra study prompts on day '+(i+1));
 assert.equal(new Set([...u.pairs,...u.practicePairs].map(p=>p.id)).size,28,'test questions must differ from study cards');
 if(u.courseKind==='grammar')assert.ok(u.grammar&&u.pairs.some(x=>x.id===u.grammar.example.id));
}
assert.equal(course.grammarPairs().length,40);
assert.equal(Object.keys(w.WOLFIE_GRAMMAR_BANK).length,40,'authored grammar guide coverage');
assert.ok(course.months.every(m=>m.grammar.every(g=>w.WOLFIE_GRAMMAR_BANK[g.title]?.examples?.length===2)),'two extra examples per grammar topic');
assert.equal(w.WOLFIE_READINGS.length,20,'one authored passage per month');
assert.ok(w.WOLFIE_READINGS.every(x=>x.paragraphs.length>=2&&x.questions.length===3));
assert.equal(w.WOLFIE_STUDY.stages.length,7);
assert.ok(['vocab','grammar','reading','listening','speaking','writing'].every(key=>typeof w.WOLFIE_STUDY_TASKS.handlers[key]==='function'));
assert.ok(new Set(units.flatMap(x=>x.pairs.map(z=>z.id))).size>=600,'insufficient diverse content');
assert.equal(units.filter(x=>x.level==='A2').length,120);
assert.equal(units.filter(x=>x.level==='B1').length,90);
assert.equal(units.filter(x=>x.level==='B2').length,90);

// DOM-light smoke: make sure the course is actually mounted by the Android WebView entry point.
const handlers=new Map(), elements=new Map(), view={innerHTML:'',querySelectorAll:()=>[]};
function node(id){if(id==='view')return view;if(!elements.has(id))elements.set(id,{textContent:'',hidden:false,addEventListener(type,cb){handlers.set(id+':'+type,cb);}});return elements.get(id);}
const doc={getElementById:node,querySelector:()=>node('bottom'),querySelectorAll:()=>[]};
const browserContext=vm.createContext({window:w,document:doc,localStorage:{getItem:()=>null,setItem(){}},console,Date,Math,confirm:()=>true,setTimeout:()=>0,clearInterval:()=>{},setInterval:()=>0});
vm.runInContext(fs.readFileSync(new URL('app.js',root),'utf8'),browserContext,{filename:'app.js'});
assert.match(view.innerHTML,/Курс на 10 месяцев/);
assert.match(view.innerHTML,/data-course="0"/);
assert.match(view.innerHTML,/data-course="299"/);
assert.equal((view.innerHTML.match(/class="course-month"/g)||[]).length,10);
assert.equal(typeof handlers.get('quick:click'),'function');
handlers.get('quick:click')();
assert.match(view.innerHTML,/Present Simple/);
assert.match(view.innerHTML,/Начать тренировку/);


// Guided curriculum UI smoke with a small DOM shim: 7 stages and authored reading.
const studyNodes=new Map();let stageButtons=[];
const studyView={
 innerHTML:'',
 querySelector(sel){if(!studyNodes.has(sel))studyNodes.set(sel,{textContent:'',onclick:null,addEventListener(){}});return studyNodes.get(sel);},
 querySelectorAll(sel){if(sel==='[data-study]'){stageButtons=[...this.innerHTML.matchAll(/data-study="([^"]+)"/g)].map(x=>({dataset:{study:x[1]},onclick:null}));return stageButtons;}return [];}
};
const studyStore={};
w.WOLFIE_STUDY.mount(studyView,{unit:units[0],store:studyStore,save(){},onExit(){},onExam(){},speak(){},voiceAvailable:()=>false});
assert.equal(stageButtons.length,7,'all daily stages visible');
assert.match(studyView.innerHTML,/Учебный день/);
assert.ok(studyView.innerHTML.includes('data-study="exam" disabled'),'exam locked before study stages');
stageButtons.find(x=>x.dataset.study==='reading').onclick();
assert.match(studyView.innerHTML,/Проверь понимание/);
assert.equal((studyView.innerHTML.match(/class="study-question"/g)||[]).length,3);
console.log('PASS: 300 days, 40 grammar topics, 20 reading passages, 7 stages and UI smoke');

