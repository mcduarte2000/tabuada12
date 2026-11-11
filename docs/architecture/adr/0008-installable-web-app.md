# 0008. Ship as an installable Progressive Web App

* Status: accepted
* Date: 2026-11-08

## Context and problem statement

Parents asked for the game on the home screen as an app, without a store, an
account or a download cost. Documents produced earlier suggested two routes:
a Trusted Web Activity packaged for Play Store, or a Capacitor wrapper with the
files bundled inside a WebView.

Both add a build pipeline, an Android toolchain and a release cadence. This
project has no build step (ADR-0002) and no dependencies. The store route also
triggers Play Store obligations: developer account, closed testing, a data
safety declaration and, for apps aimed at children, the Designed for Families
policy.

The app is also used on a school tablet that is frequently offline, so "works
without network" became a real requirement rather than a nicety.

## Considered options

### Option A: Progressive Web App with manifest and service worker

Pros: installs from Chrome and Edge on Android with the built-in "Install app"
prompt; no store, no toolchain, no build; one codebase and one deploy; offline
via the service worker; also installable on desktop and iOS via "Add to Home
Screen".

Cons: installability depends on the browser and on HTTPS; iOS uses a different
path with fewer capabilities; no presence in the Play Store, so discovery is
limited to the link; the service worker adds a cache invalidation concern.

### Option B: Trusted Web Activity

Pros: a real Play Store listing; packages the same site; small bundle.

Cons: needs Bubblewrap, an Android build, a signing key and
`assetlinks.json` served with the exact Play App Signing fingerprint; still
depends on Chrome at runtime; a broken fingerprint shows the URL bar.

### Option C: Capacitor wrapper

Pros: offline by construction, app-store presence, native APIs available.

Cons: bundles the assets, adding megabytes; needs Android Studio and a sync
step per change; breaks the no-build principle; doubles the surface to test.

## Decision outcome

We chose **Option A**. It delivers everything the parents asked for with no new
tooling and keeps a single source of truth. The store listings stay possible
later through Option B without changing the application code, because option A
is a prerequisite for both.

### Consequences

* Positive: installing is one tap in Chrome, with the screenshots and icons
  prepared for a rich install prompt.
* Positive: the app starts offline after the first visit. The typeface was later
  self-hosted (iteration 4), which removed the last runtime request.
* Positive: no account, no store review, no signing key, no release cadence.
* Negative / risks: discovery depends on sharing a link; there is no Play
  Store search result.
* Negative / risks: the service worker caches aggressively. A stale shell is
  only retired by bumping `VERSION` in `sw.js`, so every deploy that changes a
  precached file must bump it. Recorded as risk R10.
* Negative / risks: a missing file in the precache list fails the whole
  install, because `cache.addAll` is atomic. The regression suite asserts every
  listed file exists.
* Follow-up: when a Play Store listing is wanted, add a Trusted Web Activity on
  top of this and publish `assetlinks.json`. No app code changes are required.

## Implementation notes

- `manifest.webmanifest` declares `name`, `short_name`, `start_url` (`./`),
  `scope`, `display: standalone`, `display_override`, theme and background
  colours, five icons (any and maskable), two phone screenshots and one
  shortcut.
- The maskable icon is a dedicated asset with the artwork inside the 80 % safe
  zone, so Android can crop it to any launcher shape.
- `sw.js` precaches the shell, all 30 mascot SVGs, the icons and the
  screenshots. Navigation uses network-first with a cache fallback, so a deploy
  is picked up on the next online visit while offline still works. Static
  assets are cache-first.
- Roboto is self-hosted in `assets/fonts/` and precached (iteration 4), so there
  is no font request at runtime and no fallback path to reason about.
- The header shows an install button only after the browser fires
  `beforeinstallprompt`, and hides it again after `appinstalled`.
