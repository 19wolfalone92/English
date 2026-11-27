import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../app/src/main/assets/', import.meta.url);
const windowObject = {};
const context = vm.createContext({
  window: windowObject, Date, Math, TextEncoder, console,
  document: { hidden: false }, setInterval: () => 1, clearInterval: () => {},
  setTimeout: () => 1, clearTimeout: () => {},
});
const files = [
  'progress.js', 'curriculum.js', 'vocab.js', 'expanded.js', 'roadmap.js',
  'readings_a.js', 'readings_b.js', 'readings_c.js', 'readings_d.js',
  'readings_e.js', 'readings_f.js', 'readings_g.js', 'readings_h.js',
  'grammar_a.js', 'grammar_b.js', 'grammar_c.js', 'grammar_d.js',
  'grammar_quiz.js', 'missions_a.js', 'missions_b.js', 'missions_c.js',
  'missions.js', 'study_tasks_a.js', 'study_tasks_b.js', 'study.js',
  'context_packs_a.js', 'context_packs_b.js', 'context_packs_c.js',
  'context_packs_d.js', 'context_packs_e.js', 'context_packs_f.js',
  'context_packs_g.js', 'context_packs_h.js', 'context_packs_i.js',
  'context_packs_j.js', 'context_packs_k.js', 'context_packs_l.js', 'context_packs_m.js',
  'context_checks.js', 'context_checks_d.js', 'context_checks_e.js',
  'context_checks_f.js', 'context_checks_g.js', 'context_checks_h.js',
  'context_checks_i.js', 'context_checks_j.js', 'context_checks_k.js', 'context_checks_l.js', 'context_checks_m.js', 'context.js',
];
for (const file of files) {
  vm.runInContext(fs.readFileSync(new URL(file, root), 'utf8'), context, { filename: file });
}

const w = windowObject;
const units = w.WOLFIE_ROADMAP.build();
const packs = w.WOLFIE_CONTEXT.packs;
const missionRows = units.map(unit => w.WOLFIE_MISSIONS.get(unit));
const flatten = (rows, key) => rows.flatMap(row => row[key] || []);
const unique = values => new Set(values).size;
const testPairs = flatten(units, 'pairs');
const practicePairs = flatten(units, 'practicePairs');
const pairRows = [...testPairs, ...practicePairs];
const basePairs = w.WOLFIE_LESSONS.flatMap(lesson => lesson.pairs);
const cards = w.WOLFIE_CONTEXT.newCards;
const contextChecks = Object.values(w.WOLFIE_CONTEXT_CHECKS).flat();
const grammarQuizItems = Object.values(w.WOLFIE_GRAMMAR_QUIZ).flat();
const scenarioTexts = missionRows.map(row => row.scenario);
const focusAngles = missionRows.map(row => row.angle);
const missionOpenings = missionRows.map(row => row.opening);
const questionPrompts = missionRows.flatMap(row => row.questions);
const writingPrompts = missionRows.flatMap(row => row.writing);
const challengeTexts = units.map(unit => unit.challenge);
const levelDistribution = units.reduce((counts, unit) => {
  counts[unit.level] = (counts[unit.level] || 0) + 1;
  return counts;
}, {});
const uniqueVocabularyIds = unique([
  ...w.WOLFIE_WORDS.map(item => item.id),
  ...w.WOLFIE_EXTRA_WORDS.map(item => item.id),
  ...cards.filter(item => item.kind === 'w').map(item => item.id),
]);
const uniquePhraseIds = unique([
  ...basePairs.map(item => item.id),
  ...w.WOLFIE_EXTRA_PHRASES.map(item => item.id),
  ...cards.filter(item => item.kind === 'p').map(item => item.id),
]);
const contextGrammarChecks = packs.reduce((sum, pack) => sum + pack.grammar.exercises.length, 0);
const readingQuestions = w.WOLFIE_READINGS.reduce((sum, reading) => sum + reading.questions.length, 0)
  + packs.reduce((sum, pack) => sum + pack.reading.questions.length, 0);
const grammarUnits = Object.keys(w.WOLFIE_GRAMMAR_BANK).length + packs.length;
const interactiveMechanics = [...new Set([
  ...packs.flatMap(pack => pack.grammar.exercises.map(item => item[0])),
  ...contextChecks.map(item => item[0]),
])].sort();
const stageHandlers = Object.keys(w.WOLFIE_STUDY_TASKS.handlers);
const audit = {
  schema_version: 1,
  release_readiness: 'PARTIAL',
  note: 'Structural depth audit only; not an independent linguistic or CEFR review.',
  route: {
    days: units.length,
    level_distribution: levelDistribution,
    contextual_packages: packs.length,
    contextual_days_without_package: units.length - packs.length,
    extended_contextual_packages: packs.filter(pack => pack.profile === 'extended-v1').length,
    monthly_coverage: Array.from({length:10},(_,i)=>({month:i+1,contextual: packs.filter(p=>p.day>i*30&&p.day<=(i+1)*30).length,extended:packs.filter(p=>p.day>i*30&&p.day<=(i+1)*30&&p.profile==='extended-v1').length})),
    daily_stage_count: w.WOLFIE_STUDY.stages.length,
    daily_minutes: w.WOLFIE_STUDY.stages.reduce((sum, stage) => sum + stage.minutes, 0),
  },
  content: {
    unique_vocabulary_ids: uniqueVocabularyIds,
    unique_phrase_ids: uniquePhraseIds,
    reading_texts: w.WOLFIE_READINGS.length + packs.length,
    reading_questions: readingQuestions,
    grammar_units: grammarUnits,
    grammar_practice_checks: grammarQuizItems.length + contextGrammarChecks,
    separate_transfer_checks: contextChecks.length,
    contextual_dialogues: packs.length,
    contextual_dialogue_turns: packs.reduce((sum, pack) => sum + pack.dialogue.length, 0),
    contextual_speaking_prompts: flatten(packs, 'speaking').length,
    contextual_writing_prompts: flatten(packs, 'writing').length,
    interactive_stage_handlers: stageHandlers.length,
    contextual_exercise_mechanics: interactiveMechanics,
  },
  reuse_audit: {
    daily_test_pair_slots: testPairs.length,
    unique_daily_test_pair_ids: unique(testPairs.map(item => item.id)),
    daily_practice_pair_slots: practicePairs.length,
    unique_daily_practice_pair_ids: unique(practicePairs.map(item => item.id)),
    combined_pair_slots: pairRows.length,
    unique_combined_pair_ids: unique(pairRows.map(item => item.id)),
    unique_scenario_descriptions: unique(scenarioTexts),
    unique_focus_angles: unique(focusAngles),
    unique_mission_openings: unique(missionOpenings),
    unique_mission_question_prompts: unique(questionPrompts),
    unique_mission_writing_prompts: unique(writingPrompts),
    unique_daily_challenge_texts: unique(challengeTexts),
  },
  blockers: [],
};
if (audit.route.contextual_packages < audit.route.days) audit.blockers.push('Only a subset of the 300 scheduled days has an authored contextual package.');
if (audit.reuse_audit.unique_combined_pair_ids < 15000) audit.blockers.push('The unique interactive exercise target is not met; scheduled slots are not unique exercises.');
if (audit.reuse_audit.unique_scenario_descriptions < audit.route.days) audit.blockers.push('Underlying mission situations are reused across multiple days.');
if (audit.reuse_audit.unique_mission_question_prompts < audit.route.days) audit.blockers.push('Mission question prompts are reused across multiple days.');
if (audit.reuse_audit.unique_mission_writing_prompts < audit.route.days) audit.blockers.push('Mission writing prompts are reused across multiple days.');
if (audit.reuse_audit.unique_daily_challenge_texts < audit.route.days) audit.blockers.push('Daily challenge text is selected from a small repeated set.');
if (stageHandlers.length < 30) audit.blockers.push('The 30-format interactive exercise target is not met by the current stage-handler inventory.');

console.log(JSON.stringify(audit, null, 2));
if (process.argv.includes('--strict') && audit.blockers.length) process.exitCode = 1;
