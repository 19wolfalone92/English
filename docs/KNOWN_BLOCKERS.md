# Known blockers — 0.9.3

1. **Course depth:** 189 contextual days missing; 259 days not extended. Month 1 has complete contextual coverage but seven basic contexts and no independent 77-minute pedagogical validation. Source audit stays PARTIAL; strict independent APK recount exits 1. Base slot reuse 8,400/912 and base scenarios/questions/writing/challenges 40/15/9/8 remain.
2. **Content:** vocabulary, phrases, texts, grammar practice, dialogues, speaking, writing and distinct audio scripts below target. No independent linguistic review or calibrated CEFR exam. The 30-format engine and professional RZA targets remain unfulfilled.
3. **Teacher:** 9-rule offline mentor is a real deterministic feature, not an integrated LLM. Qwen3 4B paired study improves structured outputs 14/24→24/24 with complete retrieved references. Explanation quality not independently scored and material errors remain; 200-case exam, Android inference, model resource limits and broad semantic assessment unresolved.
4. **Audio:** 21 new neural dialogues generated and checked, with timed cues/fallback; human listening quality and full licensing/redistribution review not confirmed. 272 unique scripts, not 299. B1/B2 long-form audio, recording, ASR and validated phonetics still missing. Existing fallback preserved.
5. **UI:** real home/course/mentor/player improvements; global 17-screen design and physical usability remain incomplete.
6. **Progress and security:** 20 legacy content files unchanged, representative tests pass; no full 0.7.2→all intermediate physical migrations, complete privacy audit, encrypted backup, physical recovery or performance validation.
7. **Signing and release:** owner-controlled stable key availability not confirmed. Debug certificates change between CI builds; do not uninstall user data or update incompatible package. An isolated same-test-key migration is not actual owner key recovery. See SIGNING_SETUP and current qualification matrix.
8. **Qualification:** initial integrated native workflow reported 30/30 instrumentation PASS but its extra upgrade step used nonexistent default debug-keystore path. AGP had also removed the target before the post-test screenshot step; those screenshots are invalid as app evidence. Workflow fix uses an explicit isolated temporary key and explicit reinstall before normal post-test capture; a focused API35 rerun is recorded in the matrix. No weakening of emulator setup or test gates.
9. **Physical Samsung S23 Ultra:** NOT CONFIRMED. No physical device connection, local LLM runtime, measurements or safe real-user update attempted.

No 1.0.0 claim, no merge. Use verified APK only with the signature caveat; prefer Preview for side-by-side trial.

Focused API35 same-disposable-key upgrade run 46073670043: SUCCESS, artifact 15233508478. Old v22 → new v23 in-place installation, seed/verify/restart 3/3 PASS, launch Status: ok. No owner key or physical device qualification.

Visual inspection of the focused API35 post-launch PNG found an empty startup surface: capture occurred immediately after am start. It is not a valid rendered-app screenshot. Activity launch returned Status: ok and the seed/upgrade/restart instrumented WebView assertions passed independently. Use the 31 verified browser screenshots as visual evidence; a rendered native screenshot remains outstanding.
