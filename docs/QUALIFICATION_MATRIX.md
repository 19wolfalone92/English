# Wolfie English — Qualification Matrix

Audit baseline code HEAD: 08ca8c81beba96774d2b5e9aca133e8c7a288087  
Overall result: PARTIAL / HOLD  
No PR merge or production release is authorized by this matrix.

| Gate | Domain | Status | Evidence and remaining gap |
|---|---|---|---|
| A | Source integrity and reproducible build | PASS | Branch/PR/HEAD verified; 0.9.2 build, source checks, lint, unit tests and APK asset/hash checks succeeded. |
| B | 300-day lesson completeness | PARTIAL | 300-day scaffold exists, but only 90 contextual packages; 210 days lack one. 40 underlying scenarios, 15 unique questions, 9 writing prompts and 8 challenge strings do not establish 300 deep lessons. |
| C | Educational content quality and volume | PARTIAL | 1,824 vocabulary IDs, 1,598 phrases, 140 readings, 130 grammar units. Targets for vocabulary, phrases, texts, exercises and dialogues remain unmet; independent linguistic review is absent. |
| D | Objective and transferable assessment | PARTIAL | 410 grammar practice checks and 270 separate transfer checks; six diagnostic forms and objective items exist. Open-response scoring and broad alternative-answer validation remain incomplete. |
| E | Adaptive learning | PARTIAL | Local SRS, progress and error evidence exist. FSRS comparison, complete competency profiling and validated adaptation remain outstanding. |
| F | Listening, speaking and pronunciation | PARTIAL | 90 dialogue and 140 reading narrations plus six Kokoro alternatives are bundled. All are synthetic; human quality review and phoneme-level scoring are absent. |
| G | Writing and intelligent feedback | PARTIAL | Draft persistence, structural checks and a small rule-based correction set exist. Semantic evaluation, coherence, register and task fulfilment are not independently assessed. |
| H | Real Wolfie AI teacher | HOLD | No LLM is integrated in the APK. Qwen3-4B passed 12/12 closed-form exact answers but open responses were unscored and contained material errors. |
| I | Visual redesign | PARTIAL | 27 real browser screenshots cover 14 screen categories. The 17-screen target is not fully evidenced. |
| J | Progress storage and migration | PARTIAL | ProgressVault migration/recovery and backup tests pass. Storage is not encrypted; physical-device upgrade and full data-retention tests remain open. |
| K | Security and privacy | PARTIAL | WebView file/content access and cleartext are restricted. Android backup is enabled; recognizer privacy and a full security review remain open. |
| L | Physical-device performance | NOT CONFIRMED | No Samsung Galaxy S23 Ultra cold-start, memory, CPU, audio latency, energy or process-recovery measurements. |
| M | Android compatibility | PARTIAL | 20/20 native emulator tests pass on API 33–37. Physical-device and OEM-specific behaviour are not confirmed. |
| N | Independent A2/B1/B2 examinations | HOLD | Internal diagnostic material exists; no independent calibrated CEFR examination or examiner validation. |
| O | APK signature and release readiness | HOLD | Debug APKs verify, but signer fingerprints differ between builds. No persistent owner-controlled release key or same-key upgrade has been qualified. |

## CI evidence

All five latest requested workflows completed against code HEAD 08ca8c81beba96774d2b5e9aca133e8c7a288087:

- Build: 46005261029 — SUCCESS.
- Additional build: 46005248380 — SUCCESS.
- Android emulator qualification: 46005261072 — SUCCESS.
- Neural audio comparison: 46005261025 — audio job SUCCESS; teacher job SKIPPED.
- Qwen3-4B CPU screening: 46005261086 — SUCCESS.

A workflow SUCCESS confirms that its steps completed. It does not override the PARTIAL/HOLD domain decisions above.
