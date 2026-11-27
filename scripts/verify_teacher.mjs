import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const w={},ctx=vm.createContext({window:w});
for(const f of ['teacher_rules.js','teacher.js'])vm.runInContext(fs.readFileSync(new URL('../app/src/main/assets/'+f,import.meta.url),'utf8'),ctx);
const t=w.WOLFIE_TEACHER;
const calibration=[
["He don't like coffee.","third-negative","He doesn't like coffee."],
["They doesn't work here.","plural-negative","They don't work here."],
["Did she went home?","did-base","Did she go home?"],
["I didn't took the train.","did-base","I didn't take the train."],
["I have sent the report yesterday.","finished-past","I sent the report yesterday."],
["Despite of the rain, we walked.","despite-of","Despite the rain, we walked."],
["We can to check the address.","modal-to","We can check the address."],
["This path is more shorter than the other one.","double-comparison","This path is shorter than the other one."],
["Could you tell me where is the library?","indirect-question","Could you tell me where the library is?"],
["I need a hour.","article-sound","I need an hour."],
["It is an useful tool.","article-sound","It is a useful tool."]];
for(const [s,id,expected] of calibration){
 const r=t.analyze(s);assert.equal(r.status,'supported-pattern',s);assert.equal(r.ruleId,id,s);assert.equal(r.correction,expected,s);
 assert.ok(t.validateProposal(r,{rule_id:id,correction:expected}));assert.ok(!t.validateProposal(r,{rule_id:id,correction:'Wrong.'}));assert.ok(!t.validateProposal(r,{rule_id:'unrelated',correction:expected}));assert.ok(r.practice.options[r.practice.correct]);
}
for(const s of ["He doesn't like coffee.","They don't work here.","I have worked since yesterday.","I have sent it before yesterday.","Although it rained, we walked.","We walked despite the rain.","Could you tell me where the library is?","It is a university.","If you will help, I can finish.","I said \"he don't work\".","", "x".repeat(501)]){
 const r=t.analyze(s);assert.equal(r.status,'unsupported',s);assert.ok(t.validateProposal(r,{rule_id:'unsupported',correction:null}));assert.ok(!t.validateProposal(r,{rule_id:'article-sound',correction:s}));
}
console.log('PASS: 11 explicit correction cases, 12 unsupported/negative controls and strict proposal validation; no LLM qualification implied');
