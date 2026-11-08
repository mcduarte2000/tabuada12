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
| R4 | No service worker, so the app does not work offline after a cold start. | Cannot be used on a plane or without connectivity. | High for offline use cases. | `TODO: confirm` whether offline support is required; the manifest already exists. |
| R5 | Browser storage is per-origin and can be cleared by the user or by the browser. | Progress and profile are lost. | Medium over long periods. | Cookies survive some cleanups; profile lasts one year, progress 24 hours, and the game is usable from scratch. |
| R6 | Home-screen installation shows a rounded icon stretched into a maskable safe zone. | Icon may look cropped on Android launchers. | Medium. | `TODO: confirm` a dedicated maskable icon with the 80% safe zone. |
| R7 | `localStorage` progress never expires on its own; only the timestamp is validated. | Stale data occupies storage indefinitely. | Low. | Read path rejects entries older than 24 hours; a cleanup write happens on the next answer. |
| R8 | ES5-only, single-IIFE `app.js` grows past 1000 lines. | Cognitive load for contributors. | Medium as features accumulate. | Documented module map in [building-blocks.md](./building-blocks.md); split requires an ADR. |

### 11.2 Technical debt

| ID | Debt | Reason it exists | Suggested action |
| --- | --- | --- | --- |
| D1 | No automated tests of any kind. | No build step and no test runner were allowed by the constraints. | Add a headless smoke test through a browser automation tool, or extract pure functions into a testable file with an ADR. |
| D2 | Duplicated priority logic between `PRIORITY` constants and `factWeight()`. | Constants were added first, then the formula grew. | Keep as is while small; document the formula next to the constants. |
| D3 | UI strings are hard-coded pt-PT, mixed between HTML and JS. | Single-language target. | Extract to a dictionary only if a second language is confirmed. |
| D4 | Sound effect tuning values (frequencies, volumes) are inline in `app.js`. | They were adjusted by ear. | Move to a `SOUND` constant block if they need further tuning. |
| D5 | Presentation details live in CSS while some layout decisions depend on timings in JS (advance delays). | Timing and layout evolved together. | Document the timings; extract `TIMING` constants if they change again. |
| D6 | No service worker and no offline cache. | Music and offline work were deprioritised. | See R4; requires an ADR before implementation. |

### 11.3 Accepted trade-offs

- **No framework.** Long-term maintainability is traded for zero build tooling
  and zero dependency upgrades. Recorded in
  [ADR-0001](./adr/0001-static-single-page-app.md).
- **No backend.** Progress cannot follow a child across devices. In exchange
  there is no privacy exposure, no hosting cost and no operations work.
  Recorded in [ADR-0005](./adr/0005-browser-local-storage-only.md).
- **Dual storage (cookie plus `localStorage`).** Two write paths to keep
  coherent, in exchange for a progress copy that survives some storage
  cleanups. Recorded in [ADR-0005](./adr/0005-browser-local-storage-only.md).
