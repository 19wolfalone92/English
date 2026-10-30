# Wolfie English 🇬🇧🐺

Offline-first Android English-learning app. Built for a Russian-speaking A2/A2+ learner working toward B1 and B2.

## Features (v0.3.0)

- 25 sequential mini-lessons covering A2, B1 and B2 **practice topics** (not a certified B2 course)
- **1,038 unique vocabulary items** (single words and multiword expressions), including 948 expanded items
- **1,008 unique bilingual sentences** (250 core + 758 extra), including 446 new B2 sentences
- Tap-to-match English/Russian phrases, multiple-choice translations and English typing
- **Dedicated listening mode**: hear English (without seeing English text) and choose the Russian translation; immediate feedback and replay
- **Flip flashcards**: 1,038 curated vocabulary items and all 1,008 bilingual sentences in both EN → RU and RU → EN directions; self-rating and scheduled repetition
- Choose a CEFR practice level **and topical category** (39 word topics, 56 phrase topics); all listening and flashcard practice works on A2, B1 and B2 content; built-in English TTS is required for audio
- Session scores, XP, streaks, daily goal, lesson unlocking and review queue
- Spaced repetition: 1, 3, 7, 14 and 30 days for recalled phrases; mistakes return for practice
- Progress stored locally in Android `SharedPreferences`, available offline
- No registration, accounts, tracking, permissions, or required internet connection
- All Russian UI; no copyrighted Duolingo artwork/content

## Building

GitHub Actions > **Android APK and curriculum validation** > latest successful run > `Wolfie-English-v0.3.0-debug` artifact. Unzip and install `app-debug.apk` (Android 7+). Debug APK is signed by the CI debug key and **is not** a Play Store release.

Locally: JDK 17, Android SDK 35, Gradle 8.9, `gradle :app:assembleDebug`.

## Content and architecture

- `app/src/main/assets/curriculum.js`: stable 25 lesson pairs with level and topic
- `data/words.txt` and `data/phrases.txt`: reviewable bilingual expansion source with topic and level headings, manually authored to avoid machine-generated nonsense
- `scripts/build_expanded_content.py`: reproducible ID-stable generator to `app/src/main/assets/expanded.js`
- `app/src/main/assets/index.html`, `styles.css`, `app.js`, `practice.js`, `vocab.js`: offline learning experience and reviewed vocabulary
- `MainActivity.java`: secure local WebView wrapper, native English voice and persistent progress
- `scripts/validate_content.py`: checks curriculum consistency, unique IDs, pair counts and JSON-like structure

## Limitations and roadmap

This version is a **working learning platform with an expanded vocabulary and practice bank**, not yet complete CEFR B2 proficiency training. B2 requires substantial additional grammar, vocabulary, listening and speaking content plus assessment. Native TTS uses voices installed on the phone; it may be unavailable without an installed English voice pack. No audio transcription or speech recognition yet. Future phases: longer real-world listening recordings, free speaking with feedback, complete grammar syllabus, adaptive CEFR placement tests and independent B2 exam tasks. Matching 1,008 translations is **not equivalent to B2 ability**. Word count includes fixed expressions (not just dictionary headwords).

## Listening and flashcard details

Open **Практика** (bottom navigation), choose A2/B1/B2, a thematic category, and then choose **Аудирование** or **Карточки**. Speech is synthesized locally; the app does not silently penalize unavailable audio: it shows a clear retry/voice-installation message. For flashcards select word vs phrase and translation direction, flip to reveal the meaning, and rate **Я вспомнил** or **Повторить**. Scores and reviews share the existing offline progress store.

## Build note

GitHub Actions checks that the generated vocabulary bank matches the editable source files, validates IDs, checks JS syntax, builds and publishes a debug APK. Do not merge or ship if checks fail. Confirm installation and speech synthesis on device.
