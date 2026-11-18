# Android app

The Android application for Tabuada 12: a **Trusted Web Activity (TWA)** shell
that opens <https://tabuada12.miguelduarte.eu/> fullscreen, with the package id
`eu.miguelduarte.tabuada12`. The game itself is not duplicated here — the app
loads the hosted PWA, so the web app stays the single source of truth and the
service worker keeps it working offline after the first visit. The decision and
its trade-offs are in
[ADR-0011](../docs/architecture/adr/0011-android-trusted-web-activity.md).

The project is the [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap)
1.27.0 template rendered for this PWA (Apache-2.0, credited in section 6 of
[../LICENSE](../LICENSE)), with the values in `twa-manifest.json`.

## Contents

| Path | What it is |
| --- | --- |
| `twa-manifest.json` | Bubblewrap manifest: host, package id, colours, URLs, key. Edit this, then re-render. |
| `build.gradle`, `settings.gradle`, `gradle.properties` | Gradle build (AGP 8.9.1, Gradle 8.11.1 wrapper). |
| `gradlew`, `gradlew.bat`, `gradle/wrapper/` | Gradle wrapper, including `gradle-wrapper.jar`. |
| `app/build.gradle` | App module: TWA values become `resValue`s; dependency is `androidbrowserhelper:2.7.4`. |
| `app/src/main/AndroidManifest.xml` | TWA launcher activity, asset statements, intent filters. |
| `app/src/main/java/eu/miguelduarte/tabuada12/` | `Application`, `LauncherActivity`, `DelegationService`. |
| `app/src/main/res/` | Icons (copied from `../assets/`), splash, strings, shortcuts. |
| `store_icon.png` | 512x512 icon for a store listing. |
| `enable-debug.sh` | Disables Digital Asset Links verification for a URL via adb (debugging only). |

## Build

Prerequisites: JDK 17+ and the Android SDK (platform 35, build-tools). The
easiest route is the Bubblewrap CLI, which can download its own JDK and SDK:

```sh
cd android
npx @bubblewrap/cli build        # asks for a signing key, outputs app-release-signed.apk
npx @bubblewrap/cli install      # installs on a connected device via adb
```

Or with a local toolchain:

```sh
cd android
./gradlew assembleRelease        # unsigned APK in app/build/outputs/apk/release/
```

Sign with the keystore created by Bubblewrap (`android.keystore`, gitignored):

```sh
keytool -genkeypair -keystore android.keystore -alias android -keyalg RSA -keysize 2048 -validity 10000
$ANDROID_SDK/build-tools/<version>/apksigner sign --ks android.keystore app-release-unsigned.apk
```

## Verify the domain (Digital Asset Links)

Fullscreen TWA requires the site to point back at the app. After the first
signed build, copy the SHA-256 fingerprint of the signing key into
[`../.well-known/assetlinks.json`](../.well-known/assetlinks.json) and deploy
the site:

```sh
keytool -list -v -keystore android.keystore -alias android | grep SHA256
```

Until the fingerprint matches, Chrome opens the app as a Custom Tab with the
URL bar visible — the game still works. With Play Store distribution, use the
Play App Signing key's fingerprint instead. `./enable-debug.sh
https://tabuada12.miguelduarte.eu/` bypasses verification on a debug device.

## Versioning

The Android `versionCode`/`versionName` in `app/build.gradle` are independent
of the web app's `APP_VERSION`: bump `versionCode` on every APK release. To
re-render this project after a manifest change, run
`npx @bubblewrap/cli init --manifest https://tabuada12.miguelduarte.eu/manifest.webmanifest`
in a scratch directory and copy the generated files over, keeping the values in
`twa-manifest.json`.

## Not included

No app shortcuts (the launcher icon already opens the game), no notifications,
no WebView fallback (`customtabs` only), and `compileSdk`/`targetSdk` pinned
to 35. The F-Droid route with bundled assets and native features stays in the
backlog (BL-1).
