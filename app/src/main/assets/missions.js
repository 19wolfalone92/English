(()=>{'use strict';
const angles={
A2:['Describe the people and place.','Explain what normally happens.','Say what is happening now.','Talk about what happened yesterday.','Ask three polite questions.','Compare two simple options.','Explain a plan for tomorrow.','Describe a problem and ask for help.','Give instructions to a visitor.','Explain what you like and why.'],
B1:['Explain the background and the main problem.','Describe a previous experience.','Compare at least two possible solutions.','Explain the advantages and disadvantages.','Suggest a practical step-by-step plan.','Describe how someone else might react.','State what you would do in this situation.','Discuss what you have learned.','Offer a compromise.','Summarise the likely outcome.'],
B2:['Identify two competing interpretations.','Distinguish evidence from assumptions.','Compare short-term and long-term consequences.','Give a qualified counterargument.','Evaluate the reliability of the available evidence.','Explain how you would handle uncertainty.','Defend a recommendation against objections.','Discuss ethical consequences and trade-offs.','Speculate about an alternative past outcome.','Present a balanced conclusion with limitations.']
};
const questions={
A2:['Who is involved and where are they?','What do you need to do?','What usually happens in this situation?','What happened last time, or what could happen next?','What would you say to another person?'],
B1:['What is the main problem, and how did it begin?','What are two realistic options?','What could happen if nobody takes action?','Which option would you choose and why?','How would you explain your decision politely?'],
B2:['What competing interests or interpretations are involved?','Which assumptions are supported by evidence?','What are the strongest arguments on both sides?','How would you address a reasonable counterargument?','What qualified recommendation can you defend?']
};
function get(unit){
const scenario=window.WOLFIE_SCENARIOS[unit.month-1][Math.min(3,Math.floor((unit.day-1)/8))];
const angle=angles[unit.level][(unit.day-1)%10];
const opening='Scenario: '+scenario+' Focus: '+angle;
const writing=unit.level==='A2'
 ?['Write a short message to a friend about this situation.','Describe what happened or what you plan to do.','Write a short dialogue that could happen in this situation.']
 :unit.level==='B1'
 ?['Write an email explaining the situation to a colleague or friend.','Compare two possible responses and discuss the results.','Write a practical recommendation supported by examples.']
 :['Write a balanced argument: present a claim, evidence and a counterargument.','Write a formal recommendation acknowledging risk and uncertainty.','Evaluate an alternative perspective and finish with a qualified conclusion.'];
return {scenario,angle,opening,questions:questions[unit.level],writing};
}
window.WOLFIE_MISSIONS={get};
})();