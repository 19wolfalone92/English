# Wolfie English — Project State

State date: 2026-11-27  
Audit baseline code HEAD: 08ca8c81beba96774d2b5e9aca133e8c7a288087  
Project status: PARTIAL / HOLD

## Identity

- Repository: 19wolfalone92/English
- Working branch: feature/daily-60min-course
- Pull request: #5, open and not merged
- PR base: feature/ten-month-300-day-course-20261030
- PR head at audit baseline: 08ca8c81beba96774d2b5e9aca133e8c7a288087
- VersionName: 0.9.2
- VersionCode: 22
- Main application ID: com.wolfie.english
- Preview application ID: com.wolfie.english.preview
- minSdk: 24
- targetSdk: 35

No changes were made to Williams Bot, Williams AI or other repositories.

## Recovery from Execution Guard Pro checkpoint

Execution Guard Pro owner authentication was confirmed with eg:read and eg:write scopes. The retrieved project checkpoint was revision 37:

- Project: wolfie-english
- Checkpoint description: 0.9.0 verified; neural audio pilot passed; 90-route candidate authored
- Checkpoint code commit: a37fe3773679eac0abec119504bc0806ce288f0a

The GitHub branch was newer than the checkpoint. GitHub compare reported exactly two commits ahead, with no commits behind:

1. ee0f4201b96af94131aa89031a160afe350b037c — 0.9.1, ten extended contextual lessons and 140 offline reading narrations.
2. 08ca8c81beba96774d2b5e9aca133e8c7a288087 — 0.9.2, offline Kokoro voice pilot integration, native regression and Qwen3 CPU screening.

The 0.9.2 branch HEAD and PR #5 head were independently read and matched. The five qualification workflows below all target that same HEAD.

## GitHub Actions evidence

| Workflow | Run | Result | Key artifact |
|---|---:|---|---|
| Android APK and curriculum validation | 46005261029 | SUCCESS | Debug APK 15201471714; Preview APK 15202266300; screenshots 15201736371 |
| Additional build on same HEAD | 46005248380 | SUCCESS | Debug APK 15201386585; Preview APK 15201756576 |
| Android emulator qualification | 46005261072 | SUCCESS | API 33–37 evidence artifacts |
| Offline neural audio and teacher research | 46005261025 | SUCCESS for audio; teacher job SKIPPED | Audio comparison 15201396737 |
| Qwen3 4B independent CPU screening | 46005261086 | SUCCESS | Qwen evidence 15202510065 |

The separate Qwen workflow is the evidence for the 4B CPU screening. The teacher job inside the audio research workflow was skipped.

## APK evidence

The initial 0.9.2 build artifact from run 46005261029 contained (superseded by the final branch build below):

| Artifact | Size | SHA-256 |
|---|---:|---|
| app-debug.apk | 57,211,731 bytes | 6c2c6df670dbed70ad2da7ecde75aecbda53041a04dfa6889cc35e7ad1047c88 |
| app-preview.apk | 57,211,743 bytes | e69dfafc57c7dbe5e53c933f0da68fd44ba84a0cf090e625d5aa9a7f9ee35dfa |

Both APK checksums were independently recomputed from the downloaded artifacts and matched their embedded .sha256 files. CI ran apksigner verification successfully on both.

The 0.9.2 debug certificate SHA-256 fingerprint was 7fa222bfbf2dc2ffc05b28066a1991624be72d421c3dd3d630b02cb0ee0a6236. A second build of the same source HEAD produced certificate fingerprint 0e5358bd34229049e7f79b9fc7e4ce43a263e5b3236ddf2b58e799300035ce2e. The signing identity is therefore not stable across builds. Do not use these debug artifacts as same-key updates to an existing installation signed by another certificate.

The 0.9.2 APK contains 297 entries, including 90 contextual dialogue MP3s, 140 reading MP3s and six Kokoro alternatives. The main and preview APKs have the same content inventory but different package IDs.

## Education inventory at 0.9.2

The reproducible source/APK audit reports 300 scheduled days, 90 contextual packages (20 extended), 1,824 unique vocabulary IDs, 1,598 unique phrase IDs, 140 readings, 480 reading questions, 130 grammar units, 410 grammar practice checks, 270 transfer checks, 90 contextual dialogues, 440 dialogue turns, 450 contextual speaking prompts and 270 contextual writing prompts.

The base 300-day schedule has only 912 distinct bilingual pair IDs across 8,400 scheduled pair slots. It has 40 underlying mission scenarios, 30 focus angles, 15 unique question prompts, 9 unique writing prompts and 8 distinct challenge strings. The 300 unique mission-opening strings do not prove 300 complete unique lessons. Only 90 days have an authored contextual package.

## Audio evidence

- 90 synthetic contextual-dialogue MP3s: 1,547.999 seconds.
- 140 synthetic reading MP3s: 7,438.95 seconds.
- Six Kokoro INT8 alternatives for three texts, US/GB: 320.162 seconds.
- Human listening quality and pronunciation review: NOT CONFIRMED.
- The APK imports the earlier pinned pilot from run 46003216202. The newer comparison from run 46005261025 is not the audio source used by the APK.

## Qwen3-4B evidence

Model: Qwen3-4B-Q4_K_M.gguf  
Model bytes: 2,497,280,256  
Model SHA-256: 7485fe6f11af29433bc51cab58009521f205840f5b4ae3a32fa7f92e8534fdf5  
Exact closed-form answers: 12/12  
Open responses: 6 OPEN_REVIEW_REQUIRED, not scored  
Linux CPU max RSS/HWM: 4,530,988 kB  
Aggregate elapsed inference: 86.303 seconds  
Runtime: llama.cpp b6500 CPU Linux, NOT Android

The model is not integrated into the APK and is not qualified as an autonomous teacher.

## Android and UI evidence

The native workflow passed four instrumentation tests on each of API 33, 34, 35, 36 and 37: 20/20 PASS. The test cases cover progress migration/recovery, offline contextual lesson and draft persistence, WebView/diagnostic restoration, and offline neural narration loading.

The browser artifact contains 27 actual screenshots across 14 screen categories. This does not prove all 17 requested screens are fully redesigned. No physical Samsung Galaxy S23 Ultra test has been performed.

## Persistence and security boundaries

ProgressVault supports bounded data, previous-generation recovery, legacy migration and SAF JSON export/import. The data is compressed and checked with SHA-256, but it is not encrypted and the checksum is not a keyed authenticity mechanism. Android backup is enabled. Android speech recognition is invoked through the platform RecognizerIntent; EXTRA_PREFER_OFFLINE is not a guarantee of offline recognition.

## Execution Guard status

Execution Guard Pro authentication and checkpoint revision 37 were read. A bounded health probe was submitted; its initial state was QUEUED and had not yet returned terminal evidence at the time of this document. The next checkpoint must be written with an expected-revision guard after the documentation commit and then read back.


## Post-recovery CI and checkpoint update

- Current branch head after the state/audit commit: fd775b174ff3e449f322897a6f415f786032f6cf.
- Application asset/code baseline remains 08ca8c81beba96774d2b5e9aca133e8c7a288087; the fd775 commit changes documentation, the structural depth audit and its CI step.
- New build run 46051623928 completed SUCCESS against fd775. The depth-audit CI step ran and reported PARTIAL with 90 contextual packages, 210 uncovered days, 1,824 vocabulary IDs, 1,598 phrases, 140 readings, 130 grammar units, 410 grammar checks, 270 transfer checks, 912 unique pair IDs, 40 scenarios, 15 unique question prompts, 9 writing prompts and 8 challenge strings.
- New artifacts: debug 15224149468, preview 15224144446, browser screenshots 15224239233.
- New debug APK SHA-256: 2b6d34edc2be1a576fd6a8e509ebe76a1a8ba21c227462226a0482de817f8322.
- New preview APK SHA-256: 536ab88a5f43ec4f3821c0be3dbd87687d718269aa9d49c1d0c7dacfb9d7733c.
- New build signer fingerprint: 09ab9e1e57add20a01dc6d589b37c94369cd6e0975133548f970a0d16448aa1b. This is a third distinct debug certificate for the same application code.
- Execution Guard Pro health probe task 2a832817-3420-4a39-b040-db8e5c44351b succeeded; database online and persistence probe verified.
- Checkpoint revision 38 was saved with expected revision 37 and read back successfully.


## Signing integration, final branch build and Android qualification

- Current branch head before this final state-documentation commit: 7662f97e44f3b4c19c6ed44a65e08780f8f6a692.
- PR #5 head matched that commit; PR remains open and unmerged.
- Commit 47017168e07e3a2be0979327ef8cb14be5589257 added an optional ownerRelease Gradle signing config, a fail-closed verification task, a manual release-candidate workflow, keystore .gitignore patterns and owner setup instructions.
- Commit 7662f97e44f3b4c19c6ed44a65e08780f8f6a692 made Android validation push/manual-only, made native qualification push/manual-only, and made neural/Qwen research manual-only. This prevents cumulative PR-diff filters from rerunning expensive completed research on every PR synchronization.
- The final branch build run 46053115967 completed SUCCESS against 7662f97e44f3b4c19c6ed44a65e08780f8f6a692. The audit, browser tests, lint, unit tests, APK packaging, packaged audio/content checks, signature verification and fail-closed signing check all passed.
- Final APK artifacts: debug 15225174528; preview 15224924743; screenshots 15225986393.
- Final debug APK SHA-256: 7401f86e791539981f933debcb94cd0bf3a33fa8ffd31005f58dc70976adc3bf (57,211,731 bytes).
- Final preview APK SHA-256: a2115ef56dd7d8d7df1866cd01d121d7e627fec9a2a9fadee9fa9f0bb9bfc4a3 (57,211,743 bytes).
- Final build certificate fingerprint: e033bb14b6698e3c7b0741eb6b8c87278aa36383bf0465a3c2b8ad1799541e8c. It differs from prior build fingerprints 7fa222bfbf2dc2ffc05b28066a1991624be72d421c3dd3d630b02cb0ee0a6236, 0e5358bd34229049e7f79b9fc7e4ce43a263e5b3236ddf2b58e799300035ce2e and 09ab9e1e57add20a01dc6d589b37c94369cd6e0975133548f970a0d16448aa1b.
- Both final APK SHA files matched independent local hashes; APK ZIP integrity passed; binary AndroidManifest parsing confirmed main package com.wolfie.english, preview package com.wolfie.english.preview, VersionCode 22, VersionName 0.9.2/0.9.2-preview, minSdk 24 and targetSdk 35.
- APK entry inventories are byte-identical to the earlier 0.9.2 APKs; the later APK file hashes differ because signing/build metadata differs. The application version remains 0.9.2.
- The fail-closed signing check passed: without owner signing inputs in the normal build job, the release signing task returned WOLFIE_RELEASE_SIGNING_NOT_CONFIGURED as expected.
- Native Android run 46052789603 completed SUCCESS: API 33, 34, 35, 36 and 37 each reported four tests, zero failures, zero errors and zero skipped (20/20 PASS). The four tests cover ProgressVault migration/recovery, offline contextual lesson/audio and draft persistence, WebView/diagnostic restoration, and Kokoro narration loading.
- The duplicate Qwen3 run 46052789607 and audio run 46052789669 were automatically triggered by the PR's cumulative diff before the trigger optimization. They completed successfully but were not used as new model/audio qualification evidence. The neural workflow's legacy teacher job was skipped. Future research workflows are manual-only.
- Owner secret availability is NOT CONFIRMED: the GitHub connector cannot read Actions secret values and the manual release-candidate workflow has not been run. No owner-signed release or same-key update has been produced.


## Execution Guard final checkpoint

After the state-documentation commit dc27d90a7442df925297debfba29659ad8a3030b, Execution Guard Pro checkpoint revision 39 was saved with expected revision 38 and read back successfully. It records branch head dc27d90a7442df925297debfba29659ad8a3030b, build run 46053115967, device run 46052789603, final APK hashes and all remaining release blockers.
