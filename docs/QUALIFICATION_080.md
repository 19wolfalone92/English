# Wolfie English 0.8.0 qualification boundaries

## Baseline
0.7.2, commit 84d7c02829751177d4b1ecd0b17c7dc386ff0b5f, PR 5. No merge; existing progress keys remain unchanged.

## Research and design
- CEFR Companion Volume: https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors — separate reception, production and interaction; don't infer proficiency from lesson completion.
- Cambridge B2 First format: https://www.cambridgeenglish.org/exams-and-tests/qualifications/first/format/ — separate Reading/Use of English, Writing, Listening, Speaking; original screening here is much shorter and uncalibrated.
- Duolingo https://blog.duolingo.com/spaced-repetition-for-learning/ — spaced review; Babbel https://www.babbel.com/the-babbel-method — contextual goals; Busuu https://www.busuu.com/en/english/personalized-study-plan-busuu-premium — level-linked goals; LingQ https://www.lingq.com/how-to-use-lingq/ — reading/listening in context; ELSA https://elsaspeak.com/en/faqs/how-does-elsas-pronunciation-feedback-work — sound/stress/intonation feedback, not equivalent to Android transcription.
- BBC Learning English direct access was blocked by robots.txt; no claim of full audit.
- No third-party content copied, no paid services enabled.

## Gate criteria (full qualification)
A: reproducible build, static and regression checks.
B: all 300 unique daily lessons with full target content.
C: independent linguistic and technical terminology review plus automatic validation.
D: objective scores independent of self-assessment; validated open-response assessment.
E: diagnostic placement, measured skill-specific adaptation and longitudinal evaluation.
F: validated playback completion, recordings, comprehension and speech assessment.
G: grammar/meaning/style feedback validated against human-marked writing.
H: actual LLM or qualified inference backend, consent, no embedded key, offline fallback.
I: all 17 screens, light/dark, contrast, responsive, real screenshots.
J: migration, integrity, atomic storage, backup/restore and process-death tests.
K: threat review, WebView isolation, consent and external data boundaries.
L: device startup/memory/energy measurements.
M: Android 13–17 tested separately on device/emulator where available.
N: calibrated independent exams and alternate forms for all five skills; no official certificate claims.
O: signed build, manifest, checksum, install/upgrade verification.

## Candidate evidence
10 original reading passages with 30 questions added; 50 training passages total. Six original screening forms (two per level), 48 objective questions (2 vocabulary, 3 typed grammar, 3 reading per form) and 12 unscored production prompts. No exact prompt overlap with training bank, not a held-out psychometrically validated exam; bundled answers accessible to a technically capable user. Missing responses score zero. Alternate forms marked as seen when repeated. No progress or CEFR award on screening results. User may open any day without falsely marking earlier days complete. Self-assessment no longer awards correct answers. Browser screenshots are not Android screenshots. Full Gate B–O remain open unless evidence satisfies every criterion. 
