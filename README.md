# Wolfie English 🇬🇧🐺

Offline-first Android English-learning app. Built for a Russian-speaking A2/A2+ learner working toward B1 and B2.

## Features (v0.1.0)

- 25 sequential mini-lessons covering A2, B1 and B2 **practice topics** (not a certified B2 course)
- Tap-to-match English/Russian phrases, multiple-choice translations, English typing, listen-and-choose using Android TTS
- Session scores, XP, streaks, daily goal, lesson unlocking and review queue
- Spaced repetition: 1, 3, 7, 14 and 30 days for recalled phrases; mistakes return for practice
- Progress stored locally in Android `SharedPreferences`, available offline
- No registration, accounts, tracking, permissions, or required internet connection
- All Russian UI; no copyrighted Duolingo artwork/content

## Building

GitHub Actions > **Android APK and curriculum validation** > latest successful run > `Wolfie-English-v0.1.0-debug` artifact. Unzip and install `app-debug.apk` (Android 7+). Debug APK is signed by the CI debug key and **is not** a Play Store release.

Locally: JDK 17, Android SDK 35, Gradle 8.9, `gradle :app:assembleDebug`.

## Content and architecture

- `app/src/main/assets/curriculum.js`: human-authored structured phrase pairs with level and topic
- `app/src/main/assets/index.html`, `styles.css`, `app.js`: offline learning experience
- `MainActivity.java`: secure local WebView wrapper, native English voice and persistent progress
- `scripts/validate_content.py`: checks curriculum consistency, unique IDs, pair counts and JSON-like structure

## Limitations and roadmap

This first version is a **working learning platform and starter curriculum**, not yet complete CEFR B2 proficiency training. B2 requires substantial additional grammar, vocabulary, listening and speaking content plus assessment. Native TTS uses voices installed on the phone; it may be unavailable without an installed English voice pack. No audio transcription or speech recognition yet. Future phases: thousands of reviewed examples, recorded voices, sentence building, writing feedback, adaptive placement tests, mastery analytics, longer listening stories, speaking tasks.
