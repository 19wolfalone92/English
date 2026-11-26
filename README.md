# Wolfie English 0.7.0

Offline-first Android English-learning app for a Russian-speaking learner following a 300-day A2 → B1 → B2 study route.

## 0.7.0 curriculum baseline
- 300 sequenced days: 120 A2, 90 B1, 90 B2.
- 1,102 bilingual vocabulary items and 1,008 bilingual phrases/sentences.
- 40 grammar topics with 80 objective Use of English checks.
- 40 reading passages: 20 existing and 20 new; each new passage has five comprehension questions.
- 300 distinct daily mission openings.
- Strict topic matching. Missing topic coverage fails validation; the old generic fallback is removed.
- Eight daily stages totalling 77 minutes: review 8, vocabulary 10, grammar 10, listening 12, reading 10, speaking 10, writing 12 and final test 5. An additional 15 minutes of free immersion is recommended.

## Assessment gates
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
- No reliable automated writing assessment for grammar, spelling, punctuation, coherence, register or task fulfilment.
- 40 reading passages remain below the 80–120 target.
- Independent A2/B1/B2 qualification and calibrated mock exams are still required.
- Android 13–16 physical-device/emulator qualification remains pending. Browser tests do not prove OEM TTS, speech recognition, Doze, keyboard/insets or TalkBack behaviour.

## Verification and build
GitHub Actions checks reproducible content generation, stable IDs, the 300-day course, topic integrity, JavaScript syntax, Playwright UI smoke tests at 360px/700px, Android lint, unit tests, Debug APK assembly and SHA-256.

Expected artifact: **Wolfie-English-v0.7.0-debug**, containing `app-debug.apk` and `app-debug.apk.sha256`. This is a test build, not a Play Store release.

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
