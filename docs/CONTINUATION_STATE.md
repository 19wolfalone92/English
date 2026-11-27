# Wolfie English — Continuation State

Last audited application code HEAD: 08ca8c81beba96774d2b5e9aca133e8c7a288087  
Branch: feature/daily-60min-course  
PR: #5, open, not merged  
Version: 0.9.2 / VersionCode 22  
Execution Guard Pro checkpoint retrieved: revision 37, code commit a37fe3773679eac0abec119504bc0806ce288f0a

## What is already verified

- The checkpoint-to-branch discrepancy was resolved: exactly two commits followed the revision-37 code commit (0.9.1 and 0.9.2).
- All five latest workflows ran against the same 0.9.2 code HEAD.
- Debug and Preview APKs were downloaded; embedded SHA-256 files matched independent hashes; CI apksigner verification passed.
- The APK contents include 90 contextual dialogue MP3s, 140 reading MP3s and six pinned Kokoro alternatives.
- Native emulator tests passed 20/20 across API 33–37.
- Qwen3-4B CPU inference and the newer audio comparison artifacts were downloaded and inspected.
- The 300-day content reuse audit was reproduced locally and committed as scripts/audit_course_depth.mjs. Its default mode reports PARTIAL; --strict returns non-zero until the content-depth blockers are fixed.

## Non-negotiable constraints

- Do not merge PR #5 without explicit owner approval.
- Do not delete user progress or uninstall an existing application.
- Do not assume a debug APK can update an installation signed with another certificate.
- Do not put signing keys, passwords, API keys or tokens in the repository or logs.
- Do not claim the Qwen model is deployed or qualified.
- Do not claim phonetic pronunciation scoring or semantic writing assessment.
- Do not claim 300 full unique lessons or official CEFR B2.
- Keep Williams Bot and Williams AI separate from this project.

## Next execution order

1. **Permanent signing:** establish an owner-controlled keystore, configure secret-backed release signing without exposing key material, build a release candidate, verify its certificate and prove a same-key upgrade with progress preservation. Existing debug fingerprints differ; no current APK is a stable update channel.
2. **300-day content depth:** author the 210 missing contextual packages and replace repeated scenario/question/writing/challenge banks with genuinely distinct, level-appropriate tasks. Keep the depth audit strict; do not satisfy it by changing IDs or headings.
3. **Content volume and quality:** expand vocabulary, phrases, readings, grammar exercises, dialogues and audio toward the requirements; run duplicate, answer-key, level and linguistic checks.
4. **Interactive engine:** add genuinely different exercise mechanics toward 30 formats; verify each format's answer handling, feedback, persistence and negative cases.
5. **Neural audio:** human-review the existing and newer Kokoro comparisons, verify licensing, then explicitly qualify and pin any replacement tracks before packaging.
6. **Speaking:** add an explicit recording workflow and evaluate an offline speech stack; do not assign phonetic scores without validated phoneme-level evidence.
7. **Writing:** implement and independently evaluate semantic, grammatical, coherence, register and task-fulfilment feedback.
8. **Wolfie AI:** compare candidates on held-out bilingual teaching exams, then test Android runtime, memory, latency and thermal behaviour before integration. Keep the deterministic educational reference layer authoritative.
9. **Adaptive learning and exams:** qualify the competency profile/SRS and independent A2/B1/B2 forms without leaking holdout items.
10. **UI and physical device:** complete all 17 screen acceptance checks, then test the Samsung Galaxy S23 Ultra and record real performance, audio, keyboard, accessibility and recovery evidence.

## Artifact provenance

The last verified 0.9.2 APKs are from build run 46005261029 and correspond to application code HEAD 08ca8c81beba96774d2b5e9aca133e8c7a288087. Subsequent documentation/audit-only commits do not change app assets. Do not substitute a later debug build as an update until signing is stabilized.

After every substantial verified stage, update this document, the qualification matrix and the Execution Guard checkpoint. Read the checkpoint back and record the exact revision.
