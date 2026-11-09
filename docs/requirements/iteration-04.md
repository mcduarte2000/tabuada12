# Iteration 4 — Accessibility fixes and self-hosted typeface

* Status: completed
* Period: 2026-11-09
* Shipped in: v1.7.0

This iteration started as a UI audit against the Web Interface Guidelines and
ended with the removal of the last external runtime request.

## Summary

| Metric | Value |
| --- | --- |
| User stories | 2 (US-24, US-25) |
| EARS requirements | 12 |
| Gherkin scenarios | 8 |
| Automated checks | 119 |
| Defects found and fixed | 4 |
| External runtime requests | 1 → 0 |

## Scope

### In scope

- The three accessibility findings from the audit.
- Self-hosted Roboto, removing the Google Fonts request.
- Correct attribution for the font's actual licence.

### Out of scope

- A full accessibility conformance audit against WCAG 2.2 AA.
- Localisation.
- Any new dependency; the project still has none.

---

## US-24 — Trust what the screen reader announces

**User story**

> As a child using a screen reader, I want each message announced once and
> correctly, so that I am not confused or interrupted.

### Requirements

**R24.1 (ubiquitous)** The time indicator shall be labelled as the remaining
time, matching the value it shows.

**R24.2 (unwanted behaviour)** If the name field is invalid, then the system shall
announce the error through exactly one channel: the field's description or a live
region, never both.

**R24.3 (state-driven)** While the level changes, the system shall announce it
once, through the level-up overlay, and the badge shall not be a second live
region.

### Acceptance criteria

```gherkin
Feature: Single, accurate announcements

  Scenario: Time indicator
    Given the game is running
    Then the time indicator's accessible name says remaining time
    And it does not say elapsed time

  Scenario: Name error announced once
    Given the name field contains one character
    When the form is submitted
    Then the error is announced once
    And the field points at the error text

  Scenario: Level badge is silent on its own
    Given the game is running
    When the level increases
    Then the overlay announces the new level
    And the badge does not also announce it
```

---

## US-25 — Load the typeface without a third-party request

**User story**

> As a parent, I want the app to work without contacting Google, so that it stays
> private and works offline.

### Requirements

**R25.1 (ubiquitous)** The system shall serve its typeface from its own origin and
shall not request any font from a third-party host.

**R25.2 (state-driven)** While the app runs offline after the first visit, the
typeface shall be available from the cache.

**R25.3 (ubiquitous)** The vendored font shall be recorded in the third-party
notices with the licence of the exact upstream release it came from.

**R25.4 (ubiquitous)** The vendored licence file shall be the licence that applies
to the vendored file.

### Acceptance criteria

```gherkin
Feature: Self-hosted typeface

  Scenario: No external font request
    Given the app is loaded
    When the network panel is inspected
    Then no request goes to fonts.googleapis.com or fonts.gstatic.com
    And the font loads from the same origin

  Scenario: Correct rendering
    Given the page has loaded
    Then the @font-face rule is registered
    And document.fonts reports Roboto as loaded
    And text renders differently from the monospace fallback

  Scenario: Offline
    Given the app was opened once online
    When the device goes offline and the page reloads
    Then the font loads from the cache
    And text still renders in Roboto

  Scenario: Licence accuracy
    Then LICENSE states SIL Open Font License 1.1 for the font
    And the vendored licence file is the OFL text
```

---

## Defects found and fixed

| Defect | Cause | Fix |
| --- | --- | --- |
| The time indicator said "Tempo de jogo" while counting down | The markup kept the label from the era of the elapsed clock | Label the remaining time, matching the dynamic `renderTime` |
| The name error was announced twice | `role="alert"` on the error plus `aria-describedby` on the field | Keep the description, drop the live region |
| The level was announced twice | `aria-live="polite"` on the badge plus the assertive overlay | The overlay is the single announcer |
| **The font licence was stated as Apache 2.0** | The notice was inherited from Roboto v2, which was Apache. The variable family used here is OFL 1.1 | Replace the notice and the vendored licence file; assert both in the suite |

The fourth was caught by the maintainer asking whether the new font created a
licence conflict. It did. The lesson is recorded as platform limitation P6: font
licences change between versions, so the licence must be read from the exact
release of the file being vendored, never from a tutorial.

## Verification record

| Requirement group | Method | Result |
| --- | --- | --- |
| R24 (announcements) | Browser run asserting the accessible name, the absence of `role=alert`, and the absence of `aria-live` on the badge | pass |
| R25 (typeface) | Network panel: zero requests to `fonts.googleapis.com` or `fonts.gstatic.com`, font served from origin. `document.fonts` reports loaded; a width probe differs from the monospace fallback (523 px vs 361 px at 100 px). Offline reload still renders Roboto | pass |
| Licence accuracy | Static checks on the licence field and the vendored licence text | pass |

## Known gaps at the end of this iteration

- The audit covered the Web Interface Guidelines, not the full WCAG 2.2 AA
  conformance list. Contrast ratios, target sizes and motion sensitivity were
  checked by hand but not measured automatically.
- Only the latin subset is vendored. European Portuguese needs no other subset,
  but a language with Cyrillic or Greek would silently fall back.
- The service worker served a stale `styles.css` during this iteration, hiding the
  new `@font-face` until the cache was cleared. Risk R10 behaving as documented:
  bumping `VERSION` retires the cache, but the browser must fetch the new worker
  first.
- `assets/fonts/roboto-latin.woff2` is 37 KB. Acceptable now; a second weight
  would double it, which is why the variable file is used instead of three statics.
