import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const root=new URL('../app/src/main/assets/',import.meta.url),w={};
const ctx=vm.createContext({window:w,Date,Math});
const names=['curriculum','vocab','expanded','roadmap','readings_a','readings_b','readings_c','readings_d','readings_e','readings_f','readings_g','readings_h','context_packs_a','context_packs_b','context_packs_c','context_packs_d','context_packs_e','context_packs_f','context_packs_g','context_packs_h','context_packs_i','context_checks','context_checks_d','context_checks_e','context_checks_f','context_checks_g','context_checks_h','context_checks_i','context'];
for(const name of names)vm.runInContext(fs.readFileSync(new URL(name+'.js',root),'utf8'),ctx);
const c=w.WOLFIE_CONTEXT,unique=(arr,label)=>assert.equal(new Set(arr.map(c.norm)).size,arr.length,label);
assert.equal(c.packs.length,90);unique(c.packs.map(p=>p.id),'IDs');assert.equal(new Set(c.packs.map(p=>p.day)).size,90);
assert.equal(c.newCards.filter(p=>p.kind==='w').length,598);assert.equal(c.newCards.filter(p=>p.kind==='p').length,550);
unique(c.newCards.map(p=>p.id),'card IDs');
unique(c.packs.flatMap(p=>p.speaking),'speaking');unique(c.packs.flatMap(p=>p.writing),'writing');
unique([...w.WOLFIE_READINGS.map(p=>p.paragraphs.join(' ')),...c.packs.map(p=>p.reading.paragraphs.join(' '))],'reading');
const legacyIDs=new Set([...w.WOLFIE_WORDS,...w.WOLFIE_EXTRA_WORDS,...w.WOLFIE_EXTRA_PHRASES,...w.WOLFIE_LESSONS.flatMap(l=>l.pairs)].map(p=>p.id));
assert.ok(c.newCards.every(p=>!legacyIDs.has(p.id)));
assert.equal(c.packs.filter(p=>p.profile==='extended-v1').length,20);
assert.equal(c.packs.reduce((n,p)=>n+p.grammar.exercises.length,0),330);
assert.equal(c.packs.reduce((n,p)=>n+p.reading.questions.length,0),290);
for(const p of c.packs){
 const extended=p.profile==='extended-v1';
 assert.equal(c.get(w.WOLFIE_ROADMAP.unit(p.day-1)).id,p.id);
 assert.equal(p.level,w.WOLFIE_ROADMAP.unit(p.day-1).level);
 assert.equal(p.cards.length,extended?20:11);assert.equal(p.words.length,extended?10:6);assert.equal(p.phrases.length,extended?10:5);assert.equal(p.grammar.exercises.length,extended?6:3);assert.equal(p.reading.questions.length,extended?4:3);assert.equal(p.speaking.length,5);assert.equal(p.writing.length,3);assert.equal(p.dialogue.length,extended?8:4);assert.ok(p.dialogue.every(r=>r.length===3&&r.every(Boolean)));
 assert.ok(p.reading.paragraphs.join(' ').split(/\s+/).length>=(extended?120:90));
 for(const q of [...p.reading.questions,p.listening]){assert.ok(q[1][q[2]]);unique(q[1],q[0]);}
 for(const ex of p.grammar.exercises){
  let val=ex[0]==='choice'?ex[3]:ex[0]==='type'?ex[2][0]:c.norm(ex[3]).split(' ').map((word,i,words)=>{const prev=words.slice(0,i).filter(x=>x===word).length;return ex[2].map((x,j)=>[c.norm(x),j]).filter(x=>x[0]===word)[prev]?.[1]});
  assert.ok(c.answerOk(ex,val),p.id+' '+ex[1]);
  assert.ok(!c.answerOk(ex,ex[0]==='choice'?(val+1)%ex[2].length:ex[0]==='type'?'wrong answer':Array(ex[2].length).fill(0)));
 }
}
assert.equal(w.WOLFIE_ROADMAP.build().filter(u=>c.get(u)).length,90);
assert.equal(Object.keys(w.WOLFIE_CONTEXT_CHECKS).length,90);
const transfer=Object.values(w.WOLFIE_CONTEXT_CHECKS).flat();assert.equal(transfer.length,270);unique(transfer.map(ex=>ex[1]),'transfer questions');
for(const p of c.packs){const rows=w.WOLFIE_CONTEXT_CHECKS[p.id];assert.equal(rows.length,3);for(const ex of rows){const a=ex[0]==='choice'?ex[3]:ex[2][0];assert.ok(c.answerOk(ex,a));assert.ok(!c.answerOk(ex,ex[0]==='choice'?(a+1)%ex[2].length:'incorrect'));}}
const training=new Set(c.packs.flatMap(p=>p.grammar.exercises.map(x=>c.norm(x[1]))));assert.ok(transfer.every(ex=>!training.has(c.norm(ex[1]))));
console.log('PASS: 270 separately authored transfer checks, correct and incorrect answers, no exact overlap with grammar practice');
console.log('PASS: 90 linked context packages, 598 new lexical units, 550 new phrases, 90 original readings/dialogues, 450 speaking and 270 writing prompts, 330 grammar checks; exact duplicate and correct/incorrect scoring checks');
