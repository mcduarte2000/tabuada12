# Backlog

Ideas and investigations that are **not** scheduled. Nothing here is a
commitment. Each item records enough context to be picked up later without
repeating the research.

When an item is scheduled, move its essence into
[`requirements/`](./requirements/README.md) as an iteration, and delete it from
this file. When an item is dropped, delete it and record the reason in the
relevant ADR or in `quality-and-risks.md`.

---

## BL-1. Publish an Android build on F-Droid

* Investigated: 2026-11-08
* Status: not started, deliberately deferred
* Effort: large. Requires a build pipeline the project does not have.
* Prerequisite: the PWA is shipped (ADR-0008). It is the starting point, not
  the deliverable.

### Why it is deferred

Three blockers, in order of severity.

**1. F-Droid does not accept web apps.** It distributes APKs built from source
with a FLOSS toolchain. The manifest and service worker are irrelevant to
submission.

**2. The inclusion policy penalises thin website wrappers.** The *Quality
Control* section states: "The application should provide native features and
enhancements when it wraps a website." A bare Trusted Web Activity is the exact
case that clause targets and would likely be rejected.

**3. The service worker conflicts with build verification.** The same policy
states: "Applications must not download additional executable binary files
(e.g. add-ons, auto-updates, etc.) without explicit user consent." A service
worker fetches new JavaScript from the server after installation, so the code
reviewed by F-Droid would not be the code that runs. Any Android build must
bundle the assets locally and disable the remote service worker.

There is also a calendar constraint. The policy asks for at least three months
of active development, unless the app has proven users, the author maintains
other F-Droid apps, or it was built for an event. This project is one day old.

### What would have to be done

| Step | Detail | Status |
| --- | --- | --- |
| Bundle the assets locally | Capacitor with a `www` directory copied from the repo, or a plain WebView with `file://` assets | to do |
| Disable the service worker in the APK | Build flag or protocol detection, so no remote code is fetched | to do |
| **Add native features** | See the list below. Without this the submission is rejected | **mandatory** |
| Self-host Roboto | Removes the Google Fonts dependency, which reviewers flag as `NonFreeNet`, and closes debt D8 in [quality-and-risks.md](./architecture/quality-and-risks.md) | to do |
| Application ID from the domain | `eu.miguelduarte.tabuada12` | to do |
| Version tags per release | Already present (`v1.0.0` to `v1.4.0`); keep the habit | done |
| Upstream fastlane metadata | `fastlane/metadata/android/en-US/` with `short_description.txt`, `full_description.txt`, `images/icon.png`, `images/phoneScreenshots/1.png` and `2.png`, and `changelogs/<versionCode>.txt` | to do |
| `fdroiddata` merge request | `metadata/eu.miguelduarte.tabuada12.yml` describing repo, build block and update check | last |
| Reproducible build | Encouraged by F-Droid, not required. Cheaper to adopt before the first release than after, because a signing key cannot be swapped later | optional |

### Native features that would justify inclusion

Ranked by value for the target audience.

1. **Text to speech** reading the question aloud, for example "quanto é três
   vezes quatro". A child who cannot read fluently gains something the website
   cannot offer. This is the strongest argument that the app is more than a
   wrapper.
2. **Haptic feedback** on correct and wrong answers.
3. **Android back button** handled correctly: leave the game, not the app.
4. **Landscape layout** that actually works.
5. **Native share sheet** to send the record to a parent.

The first two alone change the submission from "a website in a box" to "an
Android client with advantages over the website", which is the distinction the
reviewer applies.

### Alternative that avoids F-Droid

A Trusted Web Activity signed by the maintainer, distributed as a direct APK
download from the site, needs no policy review and reuses the existing icons
and screenshots. This can ship as soon as there is demand, without the native
feature work.

### Recommended sequence

1. Keep the PWA as the only channel while the project is new.
2. If Android presence is wanted, build a Capacitor wrapper with text to speech
   and haptics, and distribute the APK directly.
3. Submit to F-Droid once there are users and several months of history.

### Decisions this would force

- **New ADR** replacing the no-build constraint in
  [ADR-0002](./architecture/adr/0002-plain-html-css-js-no-build-step.md) for the
  Android client only. The web app would stay buildless; the Android shell
  would gain `package.json`, Capacitor and a Gradle project.
- ADR-0002 and ADR-0008 would need a note pointing at that new ADR.

### Sources checked

- <https://f-droid.org/en/docs/Inclusion_Policy/>
- <https://f-droid.org/en/docs/Submitting_to_F-Droid_Quick_Start_Guide/>
