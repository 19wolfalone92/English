# Wolfie English — Known Blockers

Audit baseline: 0.9.2 / code HEAD 08ca8c81beba96774d2b5e9aca133e8c7a288087

## P0 — Release and user-data blockers

### 1. Unstable APK signing identity

The 0.9.2 build run 46005261029 used certificate SHA-256 7fa222bfbf2dc2ffc05b28066a1991624be72d421c3dd3d630b02cb0ee0a6236. A second build of the same source HEAD, run 46005248380, used 0e5358bd34229049e7f79b9fc7e4ce43a263e5b3236ddf2b58e799300035ce2e.

The default Android Debug signing identity is generated per runner/build. An APK signed by one certificate cannot update an installation signed by another. A persistent owner-controlled keystore and secret configuration are required. A Gradle ownerRelease signing config, fail-closed verification task and manual release workflow are now prepared; no owner key has been supplied or configured. No private key may be committed or printed in logs. Same-key update and progress-preserving migration remain unqualified. A third build of the same application code used fingerprint 09ab9e1e57add20a01dc6d589b37c94369cd6e0975133548f970a0d16448aa1b, confirming the instability across three builds.

### 2. The 300-day route is not 300 complete unique lessons

Only 90 days have contextual learning packages; 210 scheduled days do not. The 300 route openings are unique strings, but the underlying bank contains 40 scenario descriptions, 30 focus angles, 15 unique question prompts, 9 unique writing prompts and 8 challenge strings. The route schedules 8,400 bilingual-pair slots but only 912 distinct pair IDs. Do not treat the scaffold as 300 full 77-minute lessons.

### 3. Educational inventory remains below target

Current unique counts: 1,824 vocabulary IDs, 1,598 phrase IDs, 140 reading texts, 410 grammar practice checks plus 270 transfer checks, 90 contextual dialogues, 450 contextual speaking prompts and 270 contextual writing prompts. Requested targets include 5,000 words, 5,000 phrases, 300 texts, 3,000 grammar exercises, 15,000 interactive exercises, 1,500 speaking prompts, 900 writing prompts and 600 dialogues.

### 4. Real AI teacher is not deployed

Qwen3-4B was tested on a Linux CPU, not on Android. The model file was 2.497 GB and max RSS/HWM was about 4.53 GB. The workflow recorded 12/12 exact answers for closed-form items, but six open responses were not scored. Manual review found an incorrect don't/doesn't explanation, an incorrect although/despite rule, incomplete or weak responses, and an unsupported universal claim. No model is integrated in the APK. Do not advertise Wolfie AI as a working autonomous teacher.

### 5. Speaking and pronunciation are not objectively assessed

The Android path invokes RecognizerIntent and receives text. It does not provide a saved learner voice recording or validated phoneme, stress, intonation, rhythm, fluency or intelligibility score. EXTRA_PREFER_OFFLINE is not a guarantee that the system recognizer remains offline.

### 6. Writing assessment is limited

The editor has a small rule-based correction set and structural checks. It does not provide independent semantic review, reliable grammar/spelling assessment, coherence, register or task-fulfilment grading.

## P1 — Educational and platform qualification

### 7. Audio quality and provenance

The APK includes 90 synthetic dialogue files, 140 synthetic reading narrations and six Kokoro alternatives for three readings. Subjective quality is NOT_CONFIRMED. The APK imports the older pinned pilot from run 46003216202; the newer comparison from run 46005261025 was not imported. Human listening review and redistribution-license review remain outstanding.

### 8. Independent CEFR examinations

The app has internal diagnostic and course checks, but no independently calibrated A2/B1/B2 exam, external examiner evidence or official certificate. Internal completion must not be labelled B2.

### 9. Physical Samsung qualification and performance

Android API 33–37 emulator instrumentation passed 20/20. No physical Samsung Galaxy S23 Ultra qualification or measurements for cold start, memory, CPU, audio latency, energy, Doze, process death, TalkBack or OEM speech behaviour are available.

### 10. Progress encryption and backup privacy

ProgressVault uses compressed SharedPreferences data and an unkeyed SHA-256 integrity check. This is not encryption or keyed authenticity. Android backup is enabled. Optional encrypted backup, restore threat modelling and physical migration remain outstanding.

### 11. Visual scope

The browser artifact contains 27 screenshots across 14 screen categories. The requested full redesign of all 17 screens is not yet confirmed.

### 12. CI and external artifact retention

The 0.9.2 build imports a previously pinned GitHub Actions artifact. GitHub Actions artifact retention is finite. Archive the qualified source pilot and manifests in owner-controlled storage before expiry; do not silently substitute new audio files.
