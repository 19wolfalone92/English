import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const w={},ctx=vm.createContext({window:w,Date,Math});
const dir=new URL('../app/src/main/assets/',import.meta.url);
for(const n of ['curriculum','vocab','expanded','roadmap',...Array.from('abcdefghijklmnopqr',x=>'context_packs_'+x),'context_checks','context_checks_d','context_checks_e','context_checks_f','context_checks_g','context_checks_h','context_checks_i','context_checks_j','context_checks_k','context_checks_l','context_checks_m','context_checks_n','context_checks_o','context_checks_p','context_checks_q','context_checks_r','context','studio'])vm.runInContext(fs.readFileSync(new URL(n+'.js',dir),'utf8'),ctx);
const s=w.WOLFIE_STUDIO;assert.equal(s.charts.length,5);
const cases=[['I am agree.','I agree'],['Does she likes tea?','Does she like'],["He don't work here.","He doesn't work"],['This is more better.','better'],['We can to wait.','can wait'],['i will go.','I'],['despite of the delay','despite']];
for(const [text,expected] of cases){const r=s.inspect(text);assert.equal(r.length,1,text);assert.equal(r[0].replacement,expected,text);assert.equal(text.slice(r[0].start,r[0].end),r[0].original);}
for(const text of ['I agree.','She likes tea.','Does she like tea?',"He doesn't work here.",'This is better.','We can wait.','I will go.','Despite the delay, we stayed.','In spite of the delay, we stayed.'])assert.equal(s.inspect(text).length,0,text);
assert.throws(()=>s.inspect('x'.repeat(4001)));
const p=w.WOLFIE_CONTEXT.packs[0],store={contextLessons:{[p.id]:{checks:{g0:{ok:false},g1:{ok:true},audio:{ok:true,assisted:true},f0:{ok:true}},answers:{g0:0}}}};
const out=s.evidence(store);assert.equal(out.errors.length,1);assert.equal(out.totals.grammar.total,2);assert.equal(out.totals.grammar.right,1);assert.equal(out.totals.audio.total,0);assert.equal(out.totals.audio.assisted,1);assert.equal(out.totals.transfer.right,1);
store.studio={corrections:{[out.errors[0].id]:{ok:true,at:1}}};assert.equal(s.evidence(store).totals.grammar.right,1);
assert.equal(s.evidence({}).totals.reading.total,0);
console.log('PASS: five grammar comparisons, seven explicit correction patterns and negative controls, contextual evidence separates assistance and original errors from repeat correction');
