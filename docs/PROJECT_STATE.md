# Wolfie English — verified project state 0.9.3
Date: 2026-11-28. Overall PARTIAL / HOLD. PR #5 open, no merge. Branch feature/daily-60min-course.
Verified application code HEAD: 1e178187090a3c0da8e90512038494aae9f10b47; qualification workflow fix HEAD b7bf48b92ed4569b006595cf772dfc0b1d4627e3. Subsequent documentation/release-workflow-only changes do not change verified app bytes. Previous recovery checkpoint 40; latest actual branch HEAD is tracked by Execution Guard Pro wolfie-english.

## Build and evidence
- Build 46072972432 SUCCESS: all 111 contexts accessible at 360/700px, 21 neural dialogues at both widths, real playback, segment/highlight/fallback tests, package hashes, JavaScript checks, lint/unit/build and fail-closed owner signing PASS.
- Debug artifact 15233912161: 80,050,823 bytes; SHA256 e081aa831cb90c7e083ebfd8a6a541a1d88b1ad7036667ae112281ae2e0c34ba.
- Preview artifact 15234231692: 80,050,831 bytes; SHA256 fc41351719c4a0665bb34f6c1721032e90e6cd146f5be1aeea9d9ee4d511de82.
- Both APKs independently verified ZIP, checksum, binary manifest and v2 certificate: 1db20666187d5adf9d621cde0628358d47d156a4d86db80680812a8b2f5f8655 (unstable debug, not owner). VersionName 0.9.3 / 0.9.3-preview, VersionCode 23, main/preview package IDs com.wolfie.english / com.wolfie.english.preview, min24 target35.
- Browser screenshots 15233892219: 31 genuine captures.
- Native run 46072972441: original XML from API33–37 (artifact IDs 15233852399, 15233822190, 15234116611, 15233309797, 15233269964), 6 per API, 30 PASS / 0 failures / 0 errors / 0 skips. Overall run FAILURE solely due to isolated upgrade fixture missing default keystore; all five post-test screenshots invalid because AGP uninstalled target before capture. Fixed workflow explicitly reinstalls app before capture and checks launch.
- Focused upgrade 46073670043 SUCCESS, artifact 15233508478. Actual original 0.9.2 and verified integrated 0.9.3 plus test APK re-signed with same throwaway CI key. Matching cert 713d2db840a5bd52a0e40fbff030b348eff74a8d26900d428cd71addcd2401fb; old v22 → new v23 installed via adb install -r, no uninstall between versions. Three actual test invocations PASS: seed old, verify new, verify after restart; original fixture fields, XP, completed lesson, theme and draft retained; launch Status: ok. This is not owner signing and not a real user's phone.
- Neural original production 46071941627 shards 0/1 and recovered 46072326239 shard2; 21 originals, all decoded/hashes matched, 1,015.655s, 8,140,188 bytes; exact pins in research/month01_neural_pins.json. Human listening not confirmed.
- Hybrid CPU 46071776309, artifact 15234000716: model Qwen3-4B-Q4_K_M.gguf 2,497,280,256 bytes, 24 paired cases/48 responses; 14/24 baseline vs 24/24 hybrid structured correctness, 24 validator accepts, 0 truncations. 637.155s total, max RSS 4,872,576 kB; supplied full reference, explanations unqualified; no runtime model in APK.

## Curriculum
21 new authored contexts, 111 total/41 extended; month1 30/30 contextual, 23 extended; other months 9/30 contextual each, 189 missing. Counts verified by final APK independent recount: 2011 vocabulary IDs, 1808 phrases, 161 readings, 564 reading questions, 151 grammar units, 536 grammar checks, 333 transfer, 111 dialogues/608 turns, 555 speaking, 333 writing. 20 legacy content files byte-identical.
Audio 299 MP3s/272 distinct scripts (111 eSpeak dialogue 2771.891s, 161 readings 8642.793s, 6 Kokoro reading alternatives 320.162s, 21 neural dialogue alternatives 1015.655s). Base slot reuse 8400/912 and base scenario/question/writing/challenge counts 40/15/9/8 unchanged. Strict APK depth recount fails. 7 existing stage handlers; new mentor reuses existing choices, not a new independent format. No independent linguistic review or CEFR calibration.

See qualification matrix, requirements, blockers and continuation state. No physical device, owner key, release-grade AI, phonetic scoring, full visual redesign or 1.0 claim.
