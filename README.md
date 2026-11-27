# Wolfie English 0.9.2 — PARTIAL / HOLD

Offline-first Android language-learning application for a Russian-speaking adult learner following an A2 → B1 → B2 route.

**Verified application build:** VersionName 0.9.2, VersionCode 22  
**Main package:** com.wolfie.english  
**Preview package:** com.wolfie.english.preview  
**Android range:** min API 24, target API 35  
**Working branch:** feature/daily-60min-course  
**Pull request:** #5 — open, not merged

This is a verified development build, not a production or Play Store release. The 1.0.0 acceptance gates remain open.

## Verified educational inventory

- 300-day route scaffold: 120 A2, 90 B1 and 90 B2 days.
- 90 contextual learning packages, including 20 extended packages.
- 1,824 unique vocabulary IDs and 1,598 unique phrase IDs.
- 140 reading texts with 480 comprehension questions.
- 130 grammar units: 40 core topics plus 90 contextual micro-lessons.
- 410 grammar practice checks and 270 separately authored transfer checks.
- 90 contextual dialogue scripts containing 440 dialogue turns.
- 450 contextual speaking prompts and 270 contextual writing prompts.
- The earlier project inventory records 8 professional dialogue scripts; this count still needs a fresh source-level audit.

These are structural counts, not a claim that every item has received independent linguistic review.

## Important: a 300-day route is not yet 300 complete lessons

The 300-day schedule and its eight-stage, 77-minute timetable are present. However, only 90 of the 300 scheduled days currently have an authored contextual package; 210 days do not.

The independent depth audit also finds substantial reuse in the base route:

- 300 unique mission-opening strings, but only 40 underlying scenario descriptions.
- 30 unique focus angles, 15 unique mission question prompts and 9 unique mission writing prompts.
- Only 8 distinct daily challenge strings.
- 8,400 scheduled bilingual-pair slots across the route, but 912 distinct pair IDs.

Consequently, the route scaffold must not be described as 300 fully authored, unique 77-minute lessons. The current qualification is PARTIAL / HOLD. Run `node scripts/audit_course_depth.mjs` to reproduce the audit. The `--strict` option exits non-zero while these gaps remain.

## Audio inventory

The 0.9.2 APK contains:

- 90 synthetic contextual-dialogue MP3 files: 1,547.999 seconds total.
- 140 synthetic reading-narration MP3 files: 7,438.95 seconds total.
- 6 pre-rendered Kokoro INT8 alternatives for 3 existing reading texts, with US and GB voice variants: 320.162 seconds total.

The six Kokoro files are alternate narrations, not six new lessons. All audio is bundled for offline playback. Naturalness and pronunciation quality have not received a documented human listening review. The APK does not perform neural TTS inference at runtime.

## AI, speaking and writing boundaries

Qwen3-4B was tested with real CPU inference on Linux, not on Android. It answered 12/12 closed-form exact-match screening questions; six open-ended teaching responses were left unscored. Manual review found substantive teaching errors and incomplete responses. Qwen3-4B is not integrated into the APK and is not qualified as an autonomous teacher.

Speaking uses Android speech recognition to return a transcript. It does not provide phoneme-level pronunciation, prosody or fluency scoring, and the app does not currently retain a learner voice recording as a speaking portfolio. The offline preference passed to Android recognition is a preference, not a guarantee that the recognizer never uses a network service.

Writing feedback is a small rule-based correction set plus structural checks. It is not semantic AI assessment and does not independently grade grammar, coherence, register or task fulfilment.

## Android, persistence and privacy

The 0.9.2 native emulator workflow passed 4 instrumentation tests on each of Android API 33, 34, 35, 36 and 37: 20/20 PASS. This does not establish compatibility or performance on a physical Samsung Galaxy S23 Ultra.

ProgressVault supports bounded storage, previous-generation recovery, legacy migration and JSON export/import. Its local SharedPreferences payload is compressed and protected by an unkeyed SHA-256 integrity check; it is not encrypted and the checksum is not an authenticity mechanism. Android backup is enabled in the current manifest.

The WebView disables file/content access and file-to-file universal access. The core course and bundled audio work offline. No integrated cloud AI service is present.

## Release blockers

- The APKs are signed with generated Android Debug certificates, not a persistent owner-controlled release key. Three builds of the same application code produced different certificate fingerprints. An update from an APK signed with a different certificate will be rejected by Android.
- An owner-secret-backed release signing path is prepared, but no owner key has been configured; a same-key upgrade and progress-preserving update have not been qualified.
- Physical-device, performance, Doze, rotation, TalkBack and real OEM speech-service tests remain outstanding.
- Independent linguistic review and calibrated A2/B1/B2 examinations remain outstanding.
- Full 300-day lesson depth, requested content volumes, 30 interactive formats, AI teaching, phonetic scoring and semantic writing assessment remain incomplete.

See [SIGNING_SETUP](docs/SIGNING_SETUP.md), [PROJECT_STATE](docs/PROJECT_STATE.md), [REQUIREMENTS](docs/REQUIREMENTS.md), [QUALIFICATION_MATRIX](docs/QUALIFICATION_MATRIX.md), [KNOWN_BLOCKERS](docs/KNOWN_BLOCKERS.md) and [CONTINUATION_STATE](docs/CONTINUATION_STATE.md).

## Verification

The 0.9.2 build workflow completed content validation, assessment/progress/context checks, browser tests, Android lint, JVM unit tests, APK packaging, asset/hash checks and APK signature verification. Native emulator evidence is recorded in the Android qualification workflow.

- Build: https://github.com/19wolfalone92/English/actions/runs/46005261029
- Native Android qualification: https://github.com/19wolfalone92/English/actions/runs/46005261072
- Neural audio comparison: https://github.com/19wolfalone92/English/actions/runs/46005261025
- Qwen3-4B CPU screening: https://github.com/19wolfalone92/English/actions/runs/46005261086

Do not merge PR #5 or treat 0.9.2 as a production release without the remaining gates and explicit owner approval.
