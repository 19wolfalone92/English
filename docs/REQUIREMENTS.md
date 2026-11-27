# Wolfie English — Requirements and Verified Coverage

Audit baseline: 0.9.2 / VersionCode 22  
The quantities below are source/APK inventory counts. They do not substitute for independent linguistic quality review.

| Requirement | Project target | Verified current state | Status |
|---|---:|---|---|
| A2–B2 route | 300 days | 300-day scaffold; 120 A2, 90 B1, 90 B2 | PARTIAL |
| Deep daily lessons | 300 | 90 contextual packages; 210 scheduled days without one; full 77-minute depth not established | PARTIAL |
| Unique lesson situations | 300 | 40 underlying scenarios; 30 focus angles | PARTIAL |
| Unique daily questions and writing | Daily unique prompts | 15 unique question prompts; 9 unique writing prompts; 8 challenge strings | PARTIAL |
| Vocabulary | 5,000+ | 1,824 unique IDs | PARTIAL |
| Phrases | 5,000+ | 1,598 unique IDs | PARTIAL |
| Reading texts | 300+ | 140 texts, 480 questions | PARTIAL |
| Grammar units | 120+ | 130 units (40 core + 90 contextual) | Quantity met; quality PARTIAL |
| Grammar exercises | 3,000+ | 410 grammar practice checks plus 270 transfer checks | PARTIAL |
| Interactive exercises | 15,000+ | 8,400 scheduled pair slots but only 912 distinct pair IDs; seven stage handlers and three contextual grammar mechanics | PARTIAL |
| Interactive formats | 30+ | Seven major stage handlers; three contextual grammar exercise mechanics | PARTIAL |
| Speaking prompts | 1,500+ | 450 contextual prompts; mission bank has 40 underlying scenario statements | PARTIAL |
| Writing prompts | 900+ | 270 contextual prompts; mission bank has 9 unique writing prompts | PARTIAL |
| Dialogues | 600+ | 90 contextual scripts, 440 dialogue turns | PARTIAL |
| Professional dialogues | 100+ | Earlier inventory records 8; current APK-level recount still required | PARTIAL |
| Distinct audio scripts | 300+ | 90 dialogue + 140 reading scripts = 230; six Kokoro files are alternate voices for three existing texts | PARTIAL |
| AI teacher | Real connected and qualified model | No model integrated; Qwen3-4B is a Linux CPU research candidate only | HOLD |
| Pronunciation scoring | Phoneme, stress, intonation, rhythm | Android recognition returns transcript; no validated phonetic scoring | HOLD |
| Writing assessment | Semantic and linguistic feedback | Structural checks and limited rule-based corrections; no semantic AI assessment | HOLD |
| Adaptive learning | Individual competency profile and qualified scheduling | Local SRS/progress evidence exists; FSRS not qualified | PARTIAL |
| Independent CEFR exams | A2, B1 and B2 | Diagnostic forms exist; no calibrated independent CEFR qualification | HOLD |
| Visual redesign | 17 screens | 27 real screenshots across 14 screen categories | PARTIAL |
| Offline-first | Core course and audio offline | Core course and bundled MP3s are local; no integrated AI runtime | PARTIAL |
| Android compatibility | API 13–17 plus physical device | 20/20 emulator instrumentation PASS on API 33–37; physical device not tested | PARTIAL |
| Performance | Physical S23 Ultra metrics | No physical-device timing, memory or energy evidence | NOT CONFIRMED |
| Progress preservation | Migration, recovery, export/import | ProgressVault regression and emulator migration tests pass; encryption and physical upgrade remain open | PARTIAL |
| Permanent APK signature | Same-key upgrade | Multiple generated debug certificates differ across builds; ownerRelease signing workflow is prepared, but owner-secret availability and same-key upgrade are NOT CONFIRMED | HOLD |

## Functional boundaries

- A unique opening string is not a unique lesson. The audit found 300 unique openings but only 40 underlying situations, 15 unique mission questions, 9 unique writing prompts and 8 challenge strings.
- A scheduled pair slot is not a unique exercise. The 300-day route schedules 8,400 pair slots but uses 912 distinct pair IDs.
- A synthetic MP3 is not a human recording or proof of natural listening quality.
- A transcript is not a pronunciation score.
- A rule-based correction is not a semantic writing assessment.
- A successful workflow is not an AI teacher qualification.
- An emulator pass is not physical-device qualification.
- An internal score is not an official CEFR or Cambridge result.

## Current evidence

- APK build and curriculum validation: run 46005261029.
- Native Android qualification: run 46005261072.
- Neural audio comparison: run 46005261025.
- Qwen3-4B CPU screening: run 46005261086.
- Source-level depth audit: scripts/audit_course_depth.mjs.
