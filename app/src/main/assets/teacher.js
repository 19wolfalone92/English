(()=>{'use strict';
const rules=window.WOLFIE_TEACHER_RULES;
const base={went:'go',saw:'see',took:'take',bought:'buy',came:'come',sent:'send',wrote:'write',called:'call',arrived:'arrive',left:'leave',found:'find',made:'make',had:'have'};
const past={sent:'sent',seen:'saw',gone:'went',done:'did',taken:'took',bought:'bought',written:'wrote',called:'called',arrived:'arrived',left:'left',found:'found',made:'made',finished:'finished',visited:'visited',received:'received',returned:'returned',worked:'worked',cleaned:'cleaned',met:'met'};
const normalize=s=>String(s??'').trim().replace(/[‘’]/g,"'").replace(/\s+/g,' ');
const canonical=s=>normalize(s).toLowerCase().replace(/[.!?]$/,'');
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
function analyze(input){
 if(typeof input!=='string'||input.length>500)return {status:'unsupported',reason:'Введите одно предложение до 500 символов.'};
 const text=normalize(input);
 if(!text)return {status:'unsupported',reason:'Введите предложение.'};
 // Exclude quotations, multiple clauses that may alter the interpretation, and ambiguous temporal adjuncts.
 if(/["“”]/.test(text)||/[.!?].+[.!?]/.test(text)||/\b(?:since|until|by|before|after|because|if|when)\b/i.test(text)&&/\b(?:have|has)\b.*\b(?:yesterday|last night|last week)\b/i.test(text))
  return {status:'unsupported',reason:'Контекст или временная конструкция неоднозначны; автоматическое исправление не предлагается.'};
 const matches=[];
 for(const rule of rules)for(const [pattern,replacement] of rule.patterns){
  const re=new RegExp(pattern,'i'),m=text.match(re);if(!m)continue;
  if(rule.id==='finished-past'&&/\b(?:that|who|which|since|until|by|before|after)\b/i.test(m[3]))continue;
  let corrected=text.replace(re,replacement);
  if(rule.id==='did-base')corrected=corrected.replace('@VERB@',base[m[2].toLowerCase()]);
  if(rule.id==='finished-past')corrected=corrected.replace('@SUBJECT@',m[1].split(' ')[0]).replace('@PAST@',past[m[2].toLowerCase()]);
  if(/@\w+@|undefined/.test(corrected))continue;
  matches.push({status:'supported-pattern',ruleId:rule.id,title:rule.title,level:rule.level,original:text,correction:cap(corrected),explanation:rule.explanation,example:rule.example,source:rule.source,practice:rule.practice});
 }
 if(matches.length!==1)return {status:'unsupported',reason:'Нет единственного подтверждённого шаблона. Это не означает, что предложение правильное.'};
 return matches[0];
}
function validateProposal(result,proposal){
 if(!proposal||typeof proposal!=='object')return false;
 if(result.status!=='supported-pattern')return proposal.rule_id==='unsupported'&&proposal.correction===null;
 return proposal.rule_id===result.ruleId&&typeof proposal.correction==='string'&&canonical(proposal.correction)===canonical(result.correction);
}
window.WOLFIE_TEACHER={rules,analyze,validateProposal};
})();
