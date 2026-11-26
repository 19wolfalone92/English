# Wolfie English 0.7.2

Offline-first Android English-learning app for a Russian-speaking learner following a 300-day A2 → B1 → B2 route.

## Curriculum baseline
- 300 sequenced days: 120 A2, 90 B1, 90 B2.
- **1,226 bilingual vocabulary items** and **1,048 bilingual phrases/sentences**.
- 40 grammar topics with 80 objective Use of English checks.
- 40 reading passages: 20 existing and 20 new; each new passage has five comprehension questions.
- 300 distinct daily mission openings.
- Strict topic mapping. Missing monthly topic coverage fails validation; generic fallback is removed.
- Eight daily stages totalling 77 minutes: review 8, vocabulary 10, grammar 10, listening 12, reading 10, speaking 10, writing 12 and final test 5. Fifteen minutes of free immersion is recommended separately.

## Month 9 — specialist engineering English
The B2 technical module now includes **124 newly added specialist terms**, **40 new technical phrases**, four substation/relay-protection scenarios and the existing engineering vocabulary. The combined topic bank contains at least 149 vocabulary items and 56 phrases across engineering/reliability categories.

Coverage includes substations, switchgear, circuit breakers, busbars, feeders, transformer bays, relay protection, differential/overcurrent/earth-fault protection, CT/VT, inrush and fault currents, trip circuits, breaker-failure protection, SCADA, RTU, IEC 61850/GOOSE, disturbance records, testing terminology, switching programmes, permits to work, interlocking and electrical safety communication. Scenarios train technical explanation and reporting; they are not operational switching instructions.

## Daily assessment gates
- Vocabulary: 15 study cards; five-item active-recall quiz, 4/5 required.
- Grammar: two objective questions, both correct; two original examples are saved but not automatically graded.
- Reading: at least two thirds of questions correct.
- Listening: 4/6 dictation items and a supported English TTS voice. Text fallback cannot complete the stage.
- Speaking: five prompts; at least three substantive responses. Transcripts are not pronunciation/fluency scores.
- Writing: one extended response with structural checks for length, sentences, linking expressions and lexical diversity. Grammar/spelling are not certified.
- Final test: 10 items, 70% required after all seven learning blocks.

The course does not award B2 solely for completing 300 days. Internal results are learning evidence, not official CEFR scores.

## Known limitations
- No authentic multi-speaker audio library yet; listening currently uses installed device/browser TTS.
- No phoneme-level pronunciation, intonation, fluency or spontaneous-interaction assessment.
- Writing feedback is structural only; grammar, spelling, punctuation, coherence and register are not independently evaluated.
- 40 reading passages remain below the 80–120 target; 40 grammar topics remain below the proposed 80–100 micro-lesson target.
- Independent A2/B1/B2 qualification and calibrated mock exams are still required.
- Android 13–16 physical-device/emulator qualification remains pending. Browser tests do not prove OEM TTS, speech recognition, Doze, keyboard/insets or TalkBack behaviour.

## Verification and build
GitHub Actions checks reproducible content generation, bilingual IDs, the 300-day course, topic integrity, JavaScript syntax, Playwright UI smoke tests at 360px/700px, Android lint, unit tests, Debug APK assembly and SHA-256 verification.

Expected artifact: **Wolfie-English-v0.7.2-debug**. It is a test build, not a Play Store release.

```bash
python3 scripts/build_expanded_content.py
python3 scripts/validate_content.py
node scripts/verify_course.mjs
python3 -m pip install playwright
python3 -m playwright install chromium
python3 scripts/ui_smoke_test.py
gradle --no-daemon :app:lintDebug :app:testDebugUnitTest :app:assembleDebug
```

Progress keys and the original 25 mini-lessons are retained. Do not reset user progress or merge the working branch until CI and upgrade migration are reviewed.

## Assessment integrity update
Listening resumes from the saved item and draft, uses six actual phrase-bank items and requires a playback request before each answer. A playback request is not proof of audible output. Duplicate submissions cannot advance the same item. Vocabulary quizzes use the displayed 15 cards; early repeated correct answers do not advance the SRS interval. Manual edits invalidate speech-transcript provenance. Native device testing remains required.
