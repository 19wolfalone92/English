# 0.8.1 storage, privacy and installation qualification

## Critical release finding
The downloaded 0.7.2 and 0.8.0 APKs were independently inspected. Their Android Debug signer certificates differ:
- 0.7.2 SHA-256 certificate fingerprint: 49fcde9af6236b808393635080695c675ca9678754f9853abb70aba923252200
- 0.8.0 SHA-256 certificate fingerprint: 636e59e867a6a6075e942581e1ae5302da56a962f7a53c02fbbb86f11acf7037

A valid APK signature does not establish upgrade compatibility. A normal update of a same-package install signed with a different key is rejected by Android. Do not uninstall the existing app merely to install the new APK: its private progress might be lost. The original signer private key is not available in this task. A stable privately managed signing identity is required for subsequent production builds. Keep signing keys outside source code and artifacts; configure an authorised secret-backed build environment separately. No key material is committed.

The preview variant has application ID com.wolfie.english.preview and a visibly different app label, preserving an old installation by using a separate package. It does not import the old package's private data automatically. Preview remains debug-signed; export its progress before any later replacement. Upgrade/installation is NOT CONFIRMED on physical Android.

## Actual implementation
- Native SHA-256 + bounded gzip v2 envelope, confirmed SharedPreferences commit, readback and previous valid generation, v1 legacy read support. Legacy snapshot is retained; both-invalid case blocks automatic overwriting.
- Versioned JS validation; checksum-backed user export/import with explicit confirmation; Android Storage Access Framework picker; browser file picker and download. No new storage permission.
- Checksum establishes accidental-corruption integrity, not authenticity or protection from deliberate local editing. Backup contains potentially private answers and is not encrypted. Store it privately.
- No new network permissions. Disabled generic WebView file/content access (bundled assets remain allowed by Android). Speech recognition requests offline preference and discloses possible processing by provider before invocation.
- Browser and JVM regression tests; actual Android document picker, physical process death, filesystem failure and on-device migration remain to be tested.
