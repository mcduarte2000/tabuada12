# 0011. Ship the Android app as a Trusted Web Activity shell

* Status: accepted
* Date: 2026-11-18

## Context and problem statement

Parents asked for an Android app, not just an installable home-screen icon.
ADR-0008 left the store route open as a follow-up: "when a Play Store listing
is wanted, add a Trusted Web Activity on top of this and publish
`assetlinks.json`. No app code changes are required." Backlog BL-1 investigated
F-Droid and deferred it: F-Droid rejects thin website wrappers, its build
verification conflicts with the service worker fetching new code, and the
three-month history rule is not met. BL-1 recorded the no-review alternative:
a Trusted Web Activity signed by the maintainer, distributed as a direct APK.

The web app is deliberately buildless (ADR-0002) with one source of truth, so
any Android client must not fork the game logic.

## Considered options

### Option A: Trusted Web Activity shell (chosen)

A tiny native shell in `android/` that opens
<https://tabuada12.miguelduarte.eu/> fullscreen via Chrome's TWA protocol,
generated from the Bubblewrap template.

Pros: zero duplication of game logic and content; the service worker keeps the
app working offline after the first visit; small APK; icons, screenshots and
colours are reused from the PWA manifest; no store review needed for a direct
APK; works on any device with a TWA-capable browser.

Cons: needs a TWA-capable browser at runtime, falling back to a Custom Tab with
the URL bar otherwise; fullscreen additionally needs `assetlinks.json` served
with the signing key's SHA-256 fingerprint, otherwise the URL bar stays; a
sideloaded APK can trigger Play Protect warnings; the Android `versionCode` is
a second version number to maintain.

### Option B: Capacitor wrapper with bundled assets

Pros: offline by construction, native APIs (text-to-speech, haptics) available,
the route F-Droid would accept.

Cons: bundles the assets, duplicating them in the APK; a sync step per change;
needs the native feature work from BL-1 before any store submission; doubles
the surface to test. This remains the scheduled path for F-Droid in BL-1.

### Option C: Native Kotlin rewrite

Pros: full native control.

Cons: reimplements the game, the levels, the adaptive fact selection, the
mascots and the music in a second codebase; violates the single-source-of-truth
constraint; highest maintenance cost for a children's game.

## Decision outcome

We chose **Option A**. The Android app is a TWA shell in `android/`, rendered
from the Bubblewrap 1.27.0 template for package `eu.miguelduarte.tabuada12`,
wrapping the hosted PWA. The web app is untouched; ADR-0002's no-build rule is
excepted for the `android/` subtree only, which has its own Gradle build on a
developer machine and is excluded from the deployed site via `.assetsignore`.

Distribution starts as a signed APK downloaded from the site. A Play Store
listing stays possible later (Play App Signing fingerprint in
`assetlinks.json`, plus the Designed for Families policy, because the app is
for children); F-Droid stays deferred per BL-1.

### Consequences

* Positive: one codebase; the game, levels and content change in one place and
  reach every platform on the next deploy.
* Positive: offline still works inside the TWA, because Chrome serves the PWA
  through its service worker.
* Positive: `/.well-known/assetlinks.json` is now part of the site and is
  checked by the regression suite against the Android package id.
* Negative / risks: TWA depends on the user's browser; without a verified
  asset fingerprint the app shows the URL bar (recorded as risk R21). A
  sideloaded APK may raise a Play Protect warning.
* Negative / risks: the Android `versionCode` in `android/app/build.gradle` is
  versioned independently of the web `APP_VERSION`.
* Follow-up: app shortcuts are not carried into the shell (the launcher icon
  already opens the game); notifications are disabled.

## Implementation notes

- `android/` is the Bubblewrap 1.27.0 template project with the EJS placeholders
  rendered from `manifest.webmanifest`: package `eu.miguelduarte.tabuada12`,
  host `tabuada12.miguelduarte.eu`, launch URL `/`, theme `#6750a4`,
  background `#fef7ff`, portrait orientation, `customtabs` fallback, no
  notifications, no shortcuts.
- `android/twa-manifest.json` lets `npx @bubblewrap/cli build` run directly in
  `android/`; the signing key (`android.keystore`) is gitignored.
- `compileSdk`/`targetSdk` are pinned to 35 (newest platform AGP 8.9.1 supports
  without warnings); raise with the AGP version.
- Launcher icons and splash are copied from `assets/`; `store_icon.png` is the
  512 px store listing icon.
- `.well-known/assetlinks.json` carries a placeholder fingerprint; the
  maintainer pastes the SHA-256 of the signing key after the first signed
  build, and the regression suite keeps package name and relation in sync.
