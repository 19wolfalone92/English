# Offline neural pilot — qualification boundary

## What is in APK 0.9.2

The 0.9.2 APK contains six pre-rendered Kokoro INT8 tracks for three already authored reading texts (days 9, 129 and 219). Each text has US and GB voice alternatives. The original eSpeak narration remains available. No neural inference, model weights, paid API, microphone permission or network connection is required by these playback features. These six files are alternatives, not six new educational texts or independent listening tests.

The APK importer pins each MP3 SHA-256, binds its transcript hash to the authored text, checks sizes and fully decodes the files before packaging. The original model and voice weights were pinned and checked by the pilot workflow. Subjective speech naturalness and pronunciation still require a human listening review.

## Provenance distinction: earlier imported pilot vs newer comparison

The APK build workflow imports the previously qualified pilot from run 46003216202, artifact 15198914031, archive SHA-256 37942c0888b90919265f208d8d65186594699486bf2352197d29719a370247a8. This is the source of the six Kokoro files currently packaged in APK 0.9.2.

A newer comparison was run separately on 2026-11-27:

- Workflow run: 46005261025
- Artifact: 15201396737
- Result: 12 matched clips (6 Kokoro INT8 and 6 eSpeak), using the same three A2/B1/B2 reading texts and US/GB variants.
- Model SHA-256: ae315a79b623f244700e4afb9246c46a26066782e049ba174bf3ba433970ee9c
- Voice file SHA-256: bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d
- Artifact ZIP SHA-256: 1eccdcfcb776574628be5c9e13fcee59c96b6caafa347775dcdfeb7132dde17e
- Subjective quality: NOT_CONFIRMED for every comparison row.

The newer comparison artifact was inspected, but it was not the source imported into APK 0.9.2. Its six Kokoro MP3 hashes differ from the six files in the APK. Do not claim that the latest comparison's exact recordings are packaged. Do not replace the pinned pilot until the new recordings have been reviewed, qualified, and their hashes/transcript bindings are deliberately updated.

## Build and retention

GitHub Actions artifact retention is finite. Archive the qualified comparison ZIP and its manifest in owner-controlled storage. For local builds, extract the selected pilot ZIP to research-models/neural-pilot and run scripts/import_neural_pilot.py after generating the baseline audio. If an artifact expires, restore the original evidence or rerun and qualify the documented research workflow; then update the artifact reference and six hash pins explicitly. Do not silently substitute audio or claim byte reproducibility across runtime/hardware versions.

## Remaining qualification

- Human listening review of voice naturalness, pronunciation, pacing and intelligibility.
- Listening comprehension independent of transcript visibility and playback request.
- Voice and model redistribution-license review before public distribution.
- Expanded coverage beyond three reading texts.
- Device-side playback and accessibility review on physical Android hardware.

Upstream references: https://github.com/thewh1teagle/kokoro-onnx and https://huggingface.co/hexgrad/Kokoro-82M . This pilot is not a completed release/license audit.


## 0.9.3 month 01 production (2026-11-28)

21 original dialogues for days 1 and 11–30, 2–3 speakers, Kokoro INT8 voice identifiers af_heart, bm_george, am_michael (US/UK). 1,015.655 seconds, 8,140,188 bytes MP3; range 40.682–57.559 seconds. Original artifacts: run 46071941627 shards 0/1 (15234195012, 15233705997); shard 2 failed on a 3-speaker dialogue after three clips. Fixed voice assignment and resumed only missing clips in run 46072326239 artifact 15233059874; preserved hashes of existing clips. All 21 locally decoded, checked for integrity, duration and transcript hash; source pins research/month01_neural_pins.json. Integrated APK run 46072972432 verifies byte-identical files; browser checks actual playback, cues, segment repeat, eSpeak fallback and transcript assistance; no claim of actual audible human assessment.

Upstream model card https://huggingface.co/hexgrad/Kokoro-82M lists Apache-2.0 weights; https://github.com/thewh1teagle/kokoro-onnx lists MIT implementation. This is a preliminary source/license check, not a full voice/data/output redistribution or legal review. Synthetic origin explicitly labeled. Original eSpeak and previous pilot files retained. No paid TTS API used. Actual audio quality requires listening review. The APK contains 299 MP3s but only 272 distinct scripts; neural variants must not inflate content count.
