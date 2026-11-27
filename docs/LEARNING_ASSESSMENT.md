# Wolfie English — Learning Assessment and Evidence Boundaries

Version: 0.9.2 · VersionCode 22 · Route: 300 scheduled days (120 A2, 90 B1, 90 B2)  
Qualification: PARTIAL / HOLD

## Daily structure

| Stage | Planned time | Current evidence | Boundary |
|---|---:|---|---|
| Spaced review | 8 min | Existing local SRS queue and persisted review state | FSRS has not been independently evaluated |
| Vocabulary | 10 min | Active-recall cards and objective checks | A correct translation is not full productive mastery |
| Grammar / Use of English | 10 min | Objective quiz and contextual grammar exercises | Limited item formats; open production is not fully graded |
| Listening | 12 min | Six-item dictation using synthetic device TTS | Playback request is not proof of audible output or natural listening |
| Reading | 10 min | Texts with comprehension questions | Internal questions are not a calibrated CEFR scale |
| Speaking | 10 min | Prompted response and Android-recognized transcript | Transcript is not a pronunciation, prosody or fluency score |
| Writing | 12 min | Saved draft, structural checks and limited rule-based corrections | No independent semantic, coherence, register or task-fulfilment grade |
| Final test | 5 min | Ten-item test; 70% threshold after the seven learning blocks | Internal progression evidence, not an external certificate |

Total planned learning time: **77 minutes**. Fifteen minutes of free immersion is additional. The timetable is a design target; it is not proof that the learner spent the stated time or mastered every skill.

## Current content counts

- 300 scheduled days, 90 contextual packages and 20 extended packages.
- 1,824 unique vocabulary IDs; 1,598 unique phrase IDs.
- 140 reading texts and 480 comprehension questions.
- 130 grammar units: 40 core grammar topics and 90 contextual micro-lessons.
- 410 grammar practice checks and 270 separate transfer checks.
- 90 contextual dialogue scripts with 440 dialogue turns.
- 450 contextual speaking prompts and 270 contextual writing prompts.
- Seven major daily-stage handlers; contextual grammar exercises currently use three mechanics: choice, type and order.

## Mission and lesson-depth audit

The 300-day schedule has 300 unique opening strings, but the strings are not equivalent to 300 unique lesson situations. Source-level analysis reports:

| Measure | Current count |
|---|---:|
| Authored contextual packages | 90 / 300 |
| Underlying scenario descriptions | 40 |
| Focus angles | 30 |
| Unique mission question prompts | 15 |
| Unique mission writing prompts | 9 |
| Unique daily challenge strings | 8 |
| Scheduled test/practice pair slots | 8,400 |
| Distinct pair IDs across those slots | 912 |

The route therefore remains a scaffold plus a 90-package contextual layer. It is not accepted as 300 fully authored, non-repetitive 77-minute lessons. The depth audit is reproducible with `scripts/audit_course_depth.mjs`; `--strict` returns a failure while the target is unmet.

## Audio evidence

The APK contains 90 contextual-dialogue recordings (1,547.999 seconds), 140 reading narrations (7,438.95 seconds) and six Kokoro INT8 alternatives (320.162 seconds) for three existing texts. The six neural tracks provide US/GB voice alternatives; they are not six additional reading texts.

All recordings are synthetic. The 0.9.2 APK imports the previously pinned pilot from run 46003216202. A newer 12-clip comparison was produced in run 46005261025, but those newer files were not imported into this APK. The newer comparison artifact labels subjective quality NOT_CONFIRMED. Human listening review, pronunciation validation and redistribution-license review remain outstanding.

## Wolfie AI screening

Qwen3-4B-Q4_K_M was loaded and run through llama.cpp on a Linux CPU. The model file was 2,497,280,256 bytes; maximum resident memory was approximately 4,530,988 kB; aggregate inference time across 18 prompts was 86.303 seconds. Twelve closed-form questions received 12/12 exact-match answers. Six open-ended responses were explicitly left OPEN_REVIEW_REQUIRED and were not scored by the workflow.

Manual inspection found material errors in the open responses, including an incorrect explanation of don't/doesn't and an incorrect restriction on where although/despite can appear. Some answers were incomplete or did not satisfy the requested rubric. The test was not performed on Android. The model is not packaged, connected or approved as an autonomous teacher.

## Assessment integrity

- 300 route openings do not establish 300 unique lessons.
- A scheduled pair slot does not establish a unique exercise.
- A TTS playback request does not prove that the learner heard the audio.
- A recognized transcript does not prove correct pronunciation.
- A structural writing check does not prove semantic correctness.
- Completing 300 days or internal quizzes does not establish CEFR B2.
- No result in this app is an official Cambridge or CEFR certificate.

## Android evidence

The 0.9.2 native workflow produced four passing instrumentation tests on each emulator API 33–37 (20/20 PASS): ProgressVault migration/recovery, contextual offline lesson/audio and draft persistence, WebView/offline diagnostic restoration, and native WebView loading of Kokoro audio. No physical-device qualification has been completed.

## Release decision

The course may be used as a development build with the above limitations. Do not claim independent A2/B1/B2 proficiency, production AI teaching, phonetic scoring, semantic writing assessment or 300 complete lessons until the corresponding gates have independent evidence.


## Version delta: documented 0.8.9 baseline vs verified 0.9.2

The 0.8.9 figures below are the previously documented project baseline. The 0.9.2 figures were recounted from the packaged APK/source assets in this recovery.

| Measure | 0.8.9 documented baseline | 0.9.2 verified | Change |
|---|---:|---:|---:|
| Contextual packages | 80 | 90 | +10 |
| Extended contextual packages | 10 | 20 | +10 |
| Vocabulary IDs | 1,727 | 1,824 | +97 |
| Phrase IDs | 1,498 | 1,598 | +100 |
| Reading texts | 130 | 140 | +10 |
| Reading questions | 440 | 480 | +40 |
| Grammar units | 120 | 130 | +10 |
| Grammar practice checks | 350 | 410 | +60 |
| Contextual speaking prompts | 415 | 450 | +35 |
| Contextual writing prompts | 249 | 270 | +21 |
| Contextual dialogue scripts | 80 | 90 | +10 |
| Local audio files in prior inventory | 80 | 230 distinct audio scripts plus 6 Kokoro alternate files | Expanded |

This growth is real, but it does not close the overall content targets. No new application version beyond 0.9.2 was created during this recovery; the latest commits add audit/signing/CI infrastructure rather than a new user-facing curriculum version.
