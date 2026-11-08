# Quality and risks

Quality requirements, risks and technical debt for Tabuada 12, in arc42
sections 10 and 11.

## 10. Quality requirements

### 10.1 Quality tree

| Attribute | Requirement | Where it is handled |
| --- | --- | --- |
| Functional suitability | Every fact from 1x1 to 12x12 can appear; answers are validated against the exact product. | `chooseFact()`, `submit()` |
| Functional suitability | A failed fact reappears sooner than a mastered fact. | `factWeight()` |
| Usability | First question reachable in under 30 seconds without reading text. | Setup flow: name, mascot, play |
| Usability | The child is never blocked: a second mistake reveals the answer and advances. | `submit()` reveal branch |
| Performance | First meaningful paint under 1 s on a mid-range phone on 4G. | No framework, ~1 MB of assets, no blocking scripts |
| Performance | Interaction latency under 100 ms. | Synchronous DOM updates, no network on interaction |
| Reliability | Storage failure never breaks the game. | `try`/`catch` around every storage access |
| Accessibility | Fully operable at 320 px width with keyboard only. | Responsive CSS, keydown handler, focus management |
| Privacy | No user data leaves the device. | No network calls with user input |
| Maintainability | Wording and mascot changes require no logic changes. | `content.json`, `mascots.js` |

### 10.2 Quality scenarios

**Q1 — Adaptive repetition.** A child answers 3x5 correctly on the first try,
then fails 7x8 twice. In the following ten questions, 7x8 appears more often
than 3x5. Verified by inspecting `factWeight()`: a failed fact weighs 14 times
the base for one failure, while a first-try success weighs 0.8 divided by the
number of successes.

**Q2 — Storage unavailable.** A browser with cookies and `localStorage`
blocked still plays a complete round. Every access is wrapped in `try`/`catch`
and no error reaches the user.

**Q3 — Narrow viewport.** At 320x568 the question, keypad and all five stat
values are visible without horizontal scrolling, and no label is truncated.

**Q3b — Installation.** On a physical Android phone with Chrome, the header
shows the install control after the browser offers it, the app installs to the
home screen, opens without browser chrome, and works after the network is
switched off. Confirmed by the maintainer.

**Q4 — Reduced motion.** With `prefers-reduced-motion: reduce`, confetti and
ripples are not rendered and animation durations collapse to near zero.

**Q5 — Expired progress.** Progress saved 25 hours ago is ignored at startup;
the game starts with fresh selection weights while the name and mascot are
retained.

## 11. Risks and technical debt

### 11.1 Risks

| ID | Risk | Impact | Likelihood | Mitigation |
| --- | --- | --- | --- | --- |
| R1 | Cookie exceeds the 4 KB limit once every fact accumulates high counters. | Progress cookie silently stops being written; the `localStorage` copy still works. | Low. Worst case measured at 3541 bytes for 144 facts with counters at 999. | Compact encoding, `COOKIE_LIMIT` guard, `localStorage` stays the primary source. |
| R2 | `content.json` is fetched at runtime; opening `index.html` from the file system skips it. | The app falls back to generic phrases, losing mascot personality. | Medium when someone opens the file directly. | Built-in `FALLBACK_CONTENT`, documented local-server requirement. |
| R3 | Google Fonts is the only external request; it can be blocked or slow. | Roboto falls back to the system font; layout metrics shift slightly. | Medium in restricted networks. | Font stack lists system fallbacks; the app is fully usable without the webfont. |
| R4 | Closed by ADR-0008: the app starts offline after the first visit. | — | — | Kept for traceability; the mitigation is implemented. |
| R5 | Browser storage is per-origin and can be cleared by the user or by the browser. | Progress and profile are lost. | Medium over long periods. | Cookies survive some cleanups; profile lasts one year, progress 24 hours, and the game is usable from scratch. |
| R6 | Closed by ADR-0008: a dedicated maskable icon now keeps the artwork inside the 80% safe zone. | — | — | Kept for traceability; the mitigation is implemented. |
| R7 | `localStorage` progress never expires on its own; only the timestamp is validated. | Stale data occupies storage indefinitely. | Low. | Read path rejects entries older than 24 hours; a cleanup write happens on the next answer. |
| R8 | ES5-only, single-IIFE `app.js` grows past 1000 lines. | Cognitive load for contributors. | Medium as features accumulate. | Documented module map in [building-blocks.md](./building-blocks.md); split requires an ADR. |
| R9 | Enlarged system fonts (Android accessibility setting) can break fixed-size layouts. | Header overlap, truncated labels, controls pushed off screen. | Medium on phones with large text. | Unitless line heights, wrapping statistics, a compact icon and title row. Confirmed on the maintainer's physical Android device. |
| R10 | The service worker serves a stale shell after a deploy, because precached files are only replaced when `VERSION` changes. | Users keep an old interface until the cache is retired. | High if the version is forgotten. | The regression suite asserts that `sw.js` is versioned; bumping the version is documented in ADR-0008. |
| R11 | A single missing file breaks `cache.addAll`, so the worker never installs and offline silently fails. | No offline support, no visible error. | Medium when adding assets. | The regression suite resolves every precached path against the disk. |
| R12 | Installing from Samsung Internet on Android raises "Unsafe app blocked: this app was built for an older version of Android". | The parent cannot install the app from that browser without an extra confirmation step. | High on Samsung Internet. Reproduced in March 2026 and reported by several PWA authors. | Not fixable from the project. Samsung Internet mints a WebAPK with an outdated target SDK, which Google Play Protect flags; no manifest field changes it. The dialog offers "More details" then "Install anyway" in most regions. Chrome, Edge and Opera are unaffected. Documented in the README as a Chrome-first path. |
| R13 | In some regions Android 13+ enables enhanced fraud protection, which blocks sideloaded packages without an "Install anyway" option. | The Samsung Internet path may be unreachable there, not merely noisy. | Low for EU users, medium elsewhere. | Not fixable from the project. Use Chrome or Edge, where installation goes through the browser rather than a minted APK. |

### 11.2 Platform limitations

These are upstream behaviours we cannot change. They are recorded so that a
report of the same symptom does not trigger a fresh investigation.

| ID | Limitation | What the user can do |
| --- | --- | --- |
| P1 | Firefox on Android never fires `beforeinstallprompt`. The Mozilla position is that installation must not depend on a browser autoprompt. | Use the browser menu, or install from Chrome. The app still works offline once installed by any route. |
| P2 | Safari on iOS never fires `beforeinstallprompt` and ignores most of the manifest. | Share, then "Add to Home Screen". The in-app install button stays hidden by design. |
| P3 | Samsung Internet's WebAPK generator is outdated, triggering the Play Protect warning in R12. | Chrome or Edge. Otherwise "Install anyway". |
| P4 | Service workers on iOS require 16.4 or later. | On older iOS the app works online only. |

See risk R12 and R13 for the Samsung Internet case.

### 11.3 Technical debt

| ID | Debt | Reason it exists | Suggested action |
| --- | --- | --- | --- |
| D1 | Closed: `tests/regression.js` covers static checks and a browser walkthrough. | Removed. | — |
| D2 | Duplicated priority logic between `PRIORITY` constants and `factWeight()`. | Constants were added first, then the formula grew. | Keep as is while small; document the formula next to the constants. |
| D3 | UI strings are hard-coded pt-PT, mixed between HTML and JS. | Single-language target. | Extract to a dictionary only if a second language is confirmed. |
| D4 | Sound effect tuning values (frequencies, volumes) are inline in `app.js`. | They were adjusted by ear. | Move to a `SOUND` constant block if they need further tuning. |
| D5 | Presentation details live in CSS while some layout decisions depend on timings in JS (advance delays). | Timing and layout evolved together. | Document the timings; extract `TIMING` constants if they change again. |
| D6 | Closed by ADR-0008: the service worker now caches the shell and all mascots. | Removed. | — |
| D7 | The large-font fix was validated with injected CSS, not a real Android font-size setting. | No physical device was available. | Test on a device with the accessibility font setting before the next release. |
| D8 | Roboto is loaded from Google Fonts instead of being vendored. | Self-hosting was deferred to avoid adding binary font files. | Vendor the woff2 files with the Apache 2.0 licence; requires an ADR. |

### 11.4 Accepted trade-offs

- **No framework.** Long-term maintainability is traded for zero build tooling
  and zero dependency upgrades. Recorded in
  [ADR-0001](./adr/0001-static-single-page-app.md).
- **No backend.** Progress cannot follow a child across devices. In exchange
  there is no privacy exposure, no hosting cost and no operations work.
  Recorded in [ADR-0005](./adr/0005-browser-local-storage-only.md).
- **Dual storage (cookie plus `localStorage`).** Two write paths to keep
  coherent, in exchange for a progress copy that survives some storage
  cleanups. Recorded in [ADR-0005](./adr/0005-browser-local-storage-only.md).
