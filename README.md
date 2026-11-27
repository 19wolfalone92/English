# Wolfie English — 0.9.3 (PARTIAL / HOLD)

Offline Android English learning for an adult Russian-speaking learner. The 300-day A2–B2 schedule remains a curriculum framework, not proof of CEFR attainment.

**Verified build:** 0.9.3 / VersionCode 23; application source HEAD `1e178187090a3c0da8e90512038494aae9f10b47`. Main package `com.wolfie.english`, Preview `com.wolfie.english.preview`; min API 24, target API 35. PR #5 remains open/unmerged.

## What actually works
- 111 authored contextual days (41 extended); month 1 has 30/30 contexts, 23 extended. The other nine months have nine contexts each; 189 days remain without them.
- 2,011 vocabulary IDs, 1,808 phrase IDs, 161 readings, 564 reading questions, 151 grammar units, 536 grammar checks, 333 distinct transfer checks, 111 dialogues/608 turns, 555 speaking and 333 writing prompts.
- Offline bounded grammar mentor: nine supported rule groups, canonical Russian explanation, correction, transfer practice, persistent draft and review history. Unsupported sentences are not declared correct. No runtime LLM is integrated in the APK.
- 21 new Kokoro dialogue recordings, timed speaker turns, segment repeat, speed control and eSpeak fallback. 299 packaged audio files: 111 eSpeak dialogues, 161 readings, six neural reading alternatives and 21 neural dialogue alternatives. They represent 272 distinct scripts, not 299 distinct lessons.
- Actual browser UI tests at 360/700px and six native instrumentation tests per API 33–37 (30/30 XML PASS). See qualification matrix for the separate upgrade and post-test launch evidence.

## Verified artifacts
- [Build 46072972432](https://github.com/19wolfalone92/English/actions/runs/46072972432): debug artifact 15233912161, preview 15234231692, 31 browser screenshots 15233892219.
- [Native run 46072972441](https://github.com/19wolfalone92/English/actions/runs/46072972441): 30/30 tests, overall workflow failed the separate signing-fixture step. Do not equate XML success with workflow success.
- [Paired hybrid CPU experiment 46071776309](https://github.com/19wolfalone92/English/actions/runs/46071776309): 14/24 baseline vs 24/24 retrieved-reference structured answers; explanation quality and Android inference remain unqualified.

Do not uninstall an existing installation or attempt an incompatible debug-signature update. Preview is a separate package, not an automatic progress migration.

See [PROJECT_STATE](docs/PROJECT_STATE.md), [REQUIREMENTS](docs/REQUIREMENTS.md), [QUALIFICATION_MATRIX](docs/QUALIFICATION_MATRIX.md), [KNOWN_BLOCKERS](docs/KNOWN_BLOCKERS.md), [CONTINUATION_STATE](docs/CONTINUATION_STATE.md), [LEARNING_ASSESSMENT](docs/LEARNING_ASSESSMENT.md), [SIGNING_SETUP](docs/SIGNING_SETUP.md), [neural pilot](research/neural-pilot.md).

**Strict content gate remains failing.** No production release, external CEFR certificate or physical Samsung Galaxy S23 Ultra qualification is claimed. Research workflows remain manually controlled except the bounded one-time new-content research runs.

Focused API35 same-disposable-key upgrade run 46073670043: SUCCESS, artifact 15233508478. Old v22 → new v23 in-place installation, seed/verify/restart 3/3 PASS, launch Status: ok. No owner key or physical device qualification.
