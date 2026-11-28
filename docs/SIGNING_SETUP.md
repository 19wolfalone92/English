# Owner-controlled Android release signing

Status: signing integration prepared; owner-secret availability NOT CONFIRMED; no owner-signed release has been produced.

## Existing-installation constraint

The 0.9.2 debug builds were signed with different generated Android Debug certificates. Android will not install an APK as an update if its signing certificate differs from the installed package's certificate. Do not uninstall the current app or attempt an update with a different signer. Preserve the existing installation and export a ProgressVault backup before any owner-approved migration.

The original 0.9.0/0.9.2 signing identity has not been recovered from the current repository tree. The supported GitHub connector cannot read repository Actions secret values, so the presence or contents of an owner keystore secret cannot be confirmed here. The four-secret release workflow has not been dispatched. If an original owner keystore exists, reuse it; do not generate a replacement key until that has been checked.

## Owner setup

1. On a trusted offline workstation, locate and back up the existing production keystore if one exists. Keep at least two encrypted offline backups. Never send the keystore or passwords in chat.
2. If no reusable owner key exists, generate a new permanent key only after accepting that it cannot update packages signed with previous debug certificates:

   `keytool -genkeypair -v -keystore wolfie-release.jks -alias wolfie-release -keyalg RSA -keysize 4096 -validity 10000`

3. Encode the keystore as a single-line Base64 value without changing the keystore bytes. On Linux, use `base64 -w0 wolfie-release.jks`; on PowerShell, use `[Convert]::ToBase64String([IO.File]::ReadAllBytes("wolfie-release.jks"))`.
4. In GitHub repository Settings → Secrets and variables → Actions, create these repository secrets:
   - `WOLFIE_RELEASE_KEYSTORE_BASE64`
   - `WOLFIE_RELEASE_STORE_PASSWORD`
   - `WOLFIE_RELEASE_KEY_ALIAS`
   - `WOLFIE_RELEASE_KEY_PASSWORD`
5. Manually run the `Owner-signed release candidate` workflow. It decodes the keystore only into the runner's temporary directory, builds the release APK, runs apksigner verification and emits the certificate fingerprint and SHA-256. It does not upload the keystore.
6. Record the certificate fingerprint in owner-controlled release records. Verify it matches the intended existing signing identity before installing anything.
7. Test a same-key update on a disposable device or emulator with representative ProgressVault data. Verify the app updates in place and the progress survives. Do not use the user's primary installation as the first migration test.

## Fail-closed implementation

- Gradle reads signing inputs only from environment variables.
- The release build uses the ownerRelease signing config only when all four values are present.
- The verifyReleaseSigningConfiguration task fails with WOLFIE_RELEASE_SIGNING_NOT_CONFIGURED when inputs are missing and fails if the keystore file is unreadable.
- assembleRelease depends on that verification task.
- The normal debug/preview workflow remains independent of the owner key.
- The normal CI explicitly verifies that release signing fails closed when owner inputs are absent.
- Keystore extensions are ignored by Git; no key material belongs in source control, APK assets, artifacts or logs.

This integration is not a completed signing qualification until an owner-controlled key is configured, a release APK is built, its certificate is checked, and a same-key upgrade with progress preservation passes.


## 0.9.3 isolated migration evidence (2026-11-28)
Initial run 46072972441: all 30 native instrumentation tests passed but extra API35 migration step failed because ~/.android/debug.keystore was absent. Fixed harness: explicit disposable PKCS12 test key, re-sign actual downloaded old and new APKs and test APK, verify all certificates and package/version, install old, seed representative progress, install -r new without removal, verify progress and restart. Focused 46073670043 SUCCESS; artifact 15233508478; all three invocations OK (1 test); matching fingerprint 713d2db840a5bd52a0e40fbff030b348eff74a8d26900d428cd71addcd2401fb; launch Status: ok. This is neither the user's key nor a persistent production identity. The key was temporary and deleted. The distributed debug APK certificate is different: 1db20666187d5adf9d621cde0628358d47d156a4d86db80680812a8b2f5f8655.
Owner release workflow has been corrected to generate/verify the same pinned audio assets, limit signing secrets to signing steps, remove temporary key and verify release package; actual owner workflow has not been run, and stable owner key remains NOT CONFIRMED. Use existing owner key if available; otherwise establish owner-controlled key and a safe export/import migration. Never send secrets into chat or delete user app.
