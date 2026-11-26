import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const root=new URL('../app/src/main/assets/',import.meta.url),w={};
const ctx=vm.createContext({window:w,document:{hidden:false},setInterval:()=>1,clearInterval:()=>{},console,Date,Math});
const files=['progress.js','curriculum.js','vocab.js','expanded.js','roadmap.js','readings_a.js','readings_b.js','readings_c.js','readings_d.js','readings_e.js','readings_f.js','readings_g.js','readings_h.js','grammar_a.js','grammar_b.js','grammar_c.js','grammar_d.js','grammar_quiz.js','missions_a.js','missions_b.js','missions_c.js','missions.js','study_tasks_a.js','study_tasks_b.js','study.js'];
for(const f of files)vm.runInContext(fs.readFileSync(new URL(f,root),'utf8'),ctx,{filename:f});
const course=w.WOLFIE_ROADMAP,units=course.build();
assert.equal(units.length,300);assert.equal(new Set(units.map(x=>x.id)).size,300);
assert.equal(w.WOLFIE_WORDS.length+w.WOLFIE_EXTRA_WORDS.length,1226);
assert.equal(w.WOLFIE_LESSONS.reduce((n,x)=>n+x.pairs.length,0)+w.WOLFIE_EXTRA_PHRASES.length,1048);
for(let i=0;i<300;i++){const u=units[i],topics=course.months[u.month-1].topics;assert.equal(u.pairs.length,10);assert.equal(u.practicePairs.length,18);assert.equal(new Set([...u.pairs,...u.practicePairs].map(x=>x.id)).size,28);assert.ok([...u.pairs,...u.practicePairs].every(x=>x.level===u.level&&x.en&&x.ru&&(x.topic==='Грамматика'||topics.includes(x.topic))));assert.ok(u.challenge.length>=15);if(u.courseKind==='grammar')assert.ok(u.grammar&&u.pairs.some(x=>x.id===u.grammar.example.id));}
assert.equal(course.grammarPairs().length,40);assert.equal(Object.keys(w.WOLFIE_GRAMMAR_BANK).length,40);assert.equal(Object.keys(w.WOLFIE_GRAMMAR_QUIZ).length,40);
for(const [k,q] of Object.entries(w.WOLFIE_GRAMMAR_QUIZ)){assert.ok(w.WOLFIE_GRAMMAR_BANK[k]);assert.equal(q.length,2);for(const x of q){assert.equal(x.options.length,4);assert.ok(x.correct>=0&&x.correct<4);}}
assert.equal(w.WOLFIE_READINGS.length,50);assert.ok(w.WOLFIE_EXTRA_WORDS.filter(x=>x.topic==='Инженерия и надёжность').length>=140);assert.ok(w.WOLFIE_EXTRA_PHRASES.filter(x=>['Инженерия и надёжность','Надёжность и риски'].includes(x.topic)).length>=55);assert.ok(w.WOLFIE_SCENARIOS[8].some(x=>x.includes('substation')));assert.ok(w.WOLFIE_READINGS.every(x=>x.paragraphs.length>=2&&[3,5].includes(x.questions.length)&&x.paragraphs.join(' ').split(/\s+/).length>=90));
assert.equal(w.WOLFIE_SCENARIOS.length,10);assert.ok(w.WOLFIE_SCENARIOS.every(x=>x.length===4));
assert.equal(new Set(units.map(u=>w.WOLFIE_MISSIONS.get(u).opening)).size,300);
assert.equal(w.WOLFIE_STUDY.stages.length,8);assert.equal(w.WOLFIE_STUDY.stages.reduce((n,x)=>n+x.minutes,0),77);
const html=fs.readFileSync(new URL('index.html',root),'utf8'),css=fs.readFileSync(new URL('styles.css',root),'utf8'),app=fs.readFileSync(new URL('app.js',root),'utf8'),java=fs.readFileSync(new URL('../java/com/wolfie/english/MainActivity.java',root),'utf8');
assert.ok(html.includes('readings_g.js')&&html.includes('grammar_quiz.js')&&!html.includes('ui.css'));
assert.ok(css.includes(':root[data-theme="dark"]')&&css.includes('--font-scale'));
assert.ok(app.includes("requiredStages=['review','vocab','grammar','reading','listening','speaking','writing']")&&app.includes('voiceLocale:selectedVoice()'));
assert.ok(java.includes('isSpeechAvailableFor(String languageTag)')&&java.includes('setOnApplyWindowInsetsListener'));
const handlers=new Map(),els=new Map(),view={innerHTML:'',querySelector(s){return node(s);},querySelectorAll(s){if(s==='[data-study]')return [...this.innerHTML.matchAll(/data-study="([^"]+)"/g)].map(m=>{const k='stage:'+m[1];if(!els.has(k))els.set(k,{dataset:{study:m[1]},onclick:null});return els.get(k);});return[];}};
function node(id){if(id==='view')return view;if(!els.has(id))els.set(id,{textContent:'',hidden:false,value:'',dataset:{},style:{},classList:{toggle(){},add(){},remove(){}},addEventListener(t,cb){handlers.set(id+':'+t,cb);},setAttribute(){},onclick:null});return els.get(id);}
const doc={hidden:false,documentElement:{dataset:{},style:{setProperty(){}}},getElementById:node,querySelector:()=>node('bottom'),querySelectorAll:()=>[]};
vm.runInContext(app,vm.createContext({window:w,document:doc,localStorage:{getItem:()=>null,setItem(){}},console,Date,Math,confirm:()=>true,setTimeout:()=>1,clearTimeout:()=>{},setInterval:()=>1,clearInterval:()=>{}}),{filename:'app.js'});
assert.match(view.innerHTML,/Курс на 10 месяцев/);assert.equal((view.innerHTML.match(/class="course-month"/g)||[]).length,10);assert.match(view.innerHTML,/data-course="299"/);
handlers.get('quick:click')();handlers.get('begin-course:click')();const stages=view.querySelectorAll('[data-study]');assert.equal(stages.length,8);assert.match(view.innerHTML,/data-study="exam" disabled/);
stages.find(x=>x.dataset.study==='review').onclick();assert.match(view.innerHTML,/Очередь пуста/);view.querySelector('#study-complete').onclick();assert.match(view.innerHTML,/✓ выполнено/);
console.log('PASS: 300 days, 1,226 words, 1,048 phrases, 50 readings, 40 grammar topics/80 checks, 300 unique missions, strict topics and 77-minute 8-stage gate');
