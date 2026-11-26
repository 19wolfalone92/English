import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const root=new URL('../app/src/main/assets/',import.meta.url),w={};
const ctx=vm.createContext({window:w,Date,Math});
const names=['curriculum','vocab','expanded','roadmap','readings_a','readings_b','readings_c','readings_d','readings_e','readings_f','readings_g','readings_h','grammar_a','grammar_b','grammar_c','grammar_d','grammar_quiz','diagnostic_bank','diagnostic'];
for(const name of names)vm.runInContext(fs.readFileSync(new URL(name+'.js',root),'utf8'),ctx);
const d=w.WOLFIE_DIAGNOSTIC,forms=d.forms;
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const training=new Set([...w.WOLFIE_READINGS.flatMap(r=>[r.paragraphs.join(' '),...r.questions.map(q=>q.q)]),...Object.values(w.WOLFIE_GRAMMAR_QUIZ).flat().map(x=>x.prompt),...w.WOLFIE_WORDS.map(x=>x.en),...w.WOLFIE_EXTRA_WORDS.map(x=>x.en),...w.WOLFIE_EXTRA_PHRASES.map(x=>x.en),...w.WOLFIE_LESSONS.flatMap(l=>l.pairs.map(x=>x.en))].map(norm));
assert.equal(forms.length,6);assert.equal(new Set(forms.map(x=>x.id)).size,6);
const prompts=new Set();
for(const f of forms){
 assert.equal(f.items.length,8);assert.equal(new Set(f.items.map(x=>x.id)).size,8);
 assert.ok(!training.has(norm(f.passage)));
 assert.ok(f.passage.split(/\s+/).length>=50);
 const correct={};
 for(const q of f.items){
  assert.ok(!prompts.has(norm(q.prompt))&&!training.has(norm(q.prompt)),q.prompt);prompts.add(norm(q.prompt));
  if(q.options){assert.equal(new Set(q.options.map(norm)).size,q.options.length);assert.ok(q.options[q.correct]);correct[q.id]=q.correct;}
  else {assert.ok(q.answers.length);correct[q.id]=q.answers[0].toUpperCase()+' ';}
 }
 const report=d.evaluate(f,correct);
 assert.equal(report.qualification,'screening-only');assert.equal(report.unassessed.length,3);
 assert.deepEqual(Object.values(report.stats).map(x=>x.correct),[2,3,3]);
 assert.ok(Object.values(d.evaluate(f,{}).stats).every(x=>x.correct===0));
 const wrong={};for(const q of f.items)wrong[q.id]=q.options?(q.correct+1)%q.options.length:'incorrect answer';
 assert.ok(Object.values(d.evaluate(f,wrong).stats).every(x=>x.correct===0));
}
for(const level of ['A2','B1','B2']){
 const first=d.chooseForm(level,[]);const second=d.chooseForm(level,[{formId:first.id,at:1}]);assert.notEqual(first.id,second.id);
 assert.equal(d.chooseForm(level,[{formId:first.id,at:1},{formId:second.id,at:2}]).id,first.id);
}
assert.equal(w.WOLFIE_READINGS.length,50);assert.equal(new Set(w.WOLFIE_READINGS.map(r=>norm(r.paragraphs.join(' ')))).size,50);
for(let m=1;m<=10;m++){const r=w.WOLFIE_READINGS[39+m];assert.equal(r.month,m);assert.equal(r.level,w.WOLFIE_ROADMAP.months[m-1].level);assert.equal(r.questions.length,3);}
for(const u of w.WOLFIE_ROADMAP.build()){const slot=Math.min(4,Math.floor((u.day-1)/6));const index=slot===4?40+u.month-1:slot<2?u.month-1+slot*10:20+(u.month-1)*2+(slot-2);assert.ok(w.WOLFIE_READINGS[index]);}
console.log('PASS: 6 isolated screening forms, 48 distinct objective items, all-correct/all-wrong/empty scoring, alternate forms, 50 unique readings, 300-day reading mapping. Exact-match isolation only; no linguistic certification.');
