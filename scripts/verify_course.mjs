// Node 20+; curriculum integrity without third-party modules
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../app/src/main/assets/',import.meta.url);
const w={},context=vm.createContext({window:w});
for(const file of ['curriculum.js','vocab.js','expanded.js','roadmap.js']){
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
 if(u.courseKind==='grammar')assert.ok(u.grammar&&u.pairs.some(x=>x.id===u.grammar.example.id));
}
assert.equal(course.grammarPairs().length,40);
assert.ok(new Set(units.flatMap(x=>x.pairs.map(z=>z.id))).size>=600,'insufficient diverse content');
assert.equal(units.filter(x=>x.level==='A2').length,120);
assert.equal(units.filter(x=>x.level==='B1').length,90);
assert.equal(units.filter(x=>x.level==='B2').length,90);
console.log('PASS: 300 days, 10 months, 40 grammar topics and varied bilingual tasks');
