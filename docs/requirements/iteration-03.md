# Iteration 3 — Levels and a per-question countdown

* Status: completed
* Period: 2026-11-09
* Shipped in: v1.5.0

This iteration turned a single endless mode into six progressive levels, each
with its own fact set and time limit, and fixed a cheat: changing mascot
mid-game used to produce a fresh question, letting the child dodge a hard fact.

## Summary

| Metric | Value |
| --- | --- |
| User stories | 4 (US-19 to US-22) |
| EARS requirements | 28 |
| Gherkin scenarios | 18 |
| Automated checks | 103 |
| Defects found and fixed | 3 |
| New documents | `docs/levels.md` |
| Releases | 1 (v1.5.0) |

## Scope

### In scope

- Six levels with their own fact range, time limit and equation mix, specified
  in [levels.md](../levels.md).
- A per-question countdown replacing the old elapsed clock.
- Running out of time counts as a wrong answer.
- Missing-factor equations from level 4 onwards.
- Level-up celebration: overlay with the level name and emoji, confetti, a
  congratulation line from the mascot, and a short pause.
- The level is always visible as a badge with an emoji, right aligned in the
  header.
- Level persisted in `localStorage` and a one-year cookie.
- Fix: changing mascot preserves the question, the partial answer, the attempt
  count and the remaining time.

### Out of scope

- Demotion. A level is never lost.
- Per-level leaderboards.
- Custom time limits chosen by the parent.

---

## US-19 — Play through levels that get harder

**User story**

> As a child, I want the game to get harder as I improve, so that I keep being
> challenged and can see my progress.

### Requirements

**R19.1 (ubiquitous)** The system shall define six levels: Iniciante,
Aprendiz, Esperto, Mestre, Génio and Einstein.

**R19.2 (state-driven)** While on level 1, the system shall ask facts from 1 to
10 on both factors.

**R19.3 (state-driven)** While on levels 2 to 6, the system shall ask facts from
2 to 12 and shall never ask a fact where either factor is 1.

**R19.4 (ubiquitous)** The system shall assign a per-question time limit of 30,
20, 12, 10, 7 and 5 seconds to levels 1 to 6 respectively.

**R19.5 (event-driven)** When the child reaches a first-try streak of 25 on
level 1, the system shall unlock level 2.

**R19.6 (event-driven)** When the child reaches a first-try streak of 50 on
level 2, the system shall unlock level 3; 50 on level 3 unlocks level 4; 100 on
level 4 unlocks level 5; and 200 on level 5 unlocks level 6.

**R19.7 (event-driven)** When a level is unlocked, the system shall reset the
streak to zero and start counting towards the next threshold.

**R19.8 (ubiquitous)** The system shall never demote a child to a lower level.

### Acceptance criteria

```gherkin
Feature: Progressive levels

  Scenario: Level 1 uses the tables up to 10
    Given the child is on level 1
    When ten questions have been asked
    Then no factor is greater than 10

  Scenario: Level 2 excludes the table of 1
    Given the child is on level 2
    When twenty questions have been asked
    Then no factor equals 1

  Scenario: Unlocking level 2
    Given the child is on level 1 with a streak of 24
    When the child answers a question correctly on the first attempt
    Then level 2 is unlocked
    And the streak is reset to zero

  Scenario: A level is never lost
    Given the child reached level 4
    When the child fails many questions in a row
    Then the level remains 4
```

---

## US-20 — Answer against the clock

**User story**

> As a child at a higher level, I want a time limit so that I learn to recall
> the facts quickly, not just correctly.

### Requirements

**R20.1 (ubiquitous)** The system shall show the time remaining for the current
question as a countdown in `m:ss`.

**R20.2 (event-driven)** When the countdown reaches zero while the question is
still unanswered, the system shall treat it as a wrong answer.

**R20.3 (event-driven)** When the countdown expires, the system shall reveal the
correct answer, hide the keypad, show the Continue button, increase the miss
counter and reset the streak.

**R20.4 (state-driven)** While the answer is being evaluated, revealed, a dialog
is open, a level-up celebration is running, or the tab is hidden, the system
shall pause the countdown.

**R20.5 (event-driven)** When the tab becomes visible again, the countdown shall
resume from the remaining time, not restart.

**R20.6 (state-driven)** While the remaining time is below half the limit, the
system shall show the time in a warning colour; below 20 %, in the error colour.

**R20.7 (ubiquitous)** The system shall phrase a timeout as a complete sentence,
never a bare "Tempo".

### Acceptance criteria

```gherkin
Feature: Per-question countdown

  Scenario: Countdown starts at the level limit
    Given the child is on level 3
    When a question appears
    Then the time indicator starts at 0:12

  Scenario: Timeout counts as a wrong answer
    Given the child is on level 6
    And a question is displayed
    When the child does not answer within 5 seconds
    Then the correct answer is revealed
    And the miss counter increases by one
    And the streak is reset
    And the mascot explains, in a full sentence, that the time ran out

  Scenario: Countdown pauses while the tab is hidden
    Given a question is displayed with 10 seconds remaining
    When the tab is hidden for 30 seconds and shown again
    Then the countdown resumes at about 10 seconds

  Scenario: Low time is signalled
    Given a level 1 question with 9 seconds left
    Then the time indicator uses the warning colour
```

---

## US-21 — Answer missing-factor equations

**User story**

> As an advanced child, I want questions with a missing factor, so that I
> practise the inverse operation and not only the product.

### Requirements

**R21.1 (state-driven)** While on levels 1 to 3, the system shall ask only
product questions.

**R21.2 (state-driven)** While on levels 4 to 6, the system shall sometimes ask
an equation with one factor missing.

**R21.3 (ubiquitous)** The two equation shapes are `<a> x ? = <product>` and
`? x <b> = <product>`; the product is always shown.

**R21.4 (event-driven)** When the child answers an equation, the system shall
compare the input with the missing factor, not with the product.

**R21.5 (ubiquitous)** On a reveal, the system shall fill the missing factor in
place and leave the product visible.

**R21.6 (ubiquitous)** The answer field shall occupy the slot of the unknown,
so the on-screen keypad keeps working unchanged.

### Acceptance criteria

```gherkin
Feature: Missing-factor equations

  Scenario: No equations early
    Given the child is on level 3
    When twenty questions have been asked
    Then every question shows a question mark only after "="

  Scenario: Equations appear later
    Given the child is on level 4
    When twenty questions have been asked
    Then at least one question has the question mark before "="

  Scenario: Solving an equation
    Given the question "? x 8 = 80"
    When the child answers 10
    Then the answer is accepted

  Scenario: Wrong factor is rejected
    Given the question "? x 8 = 80"
    When the child answers 80
    Then the answer is rejected

  Scenario: Reveal fills the unknown
    Given the question "? x 8 = 80" was failed twice
    Then the missing slot shows 10
    And the product still shows 80
```

---

## US-22 — See and celebrate my level

**User story**

> As a child, I want to see my level and be celebrated when I reach a new one,
> so that levelling up feels like winning something.

### Requirements

**R22.1 (ubiquitous)** The system shall show the current level on every screen
as a badge with an emoji and the level number.

**R22.2 (ubiquitous)** The badge shall sit at the right edge of the header row,
regardless of the title length, so that it does not read as part of the title.

**R22.3 (event-driven)** When a level is unlocked, the system shall show an
overlay with the level number, its name and its emoji for about two and a half
seconds.

**R22.4 (event-driven)** When a level is unlocked, the system shall launch
confetti and play a rising four-note chime.

**R22.5 (event-driven)** When a level is unlocked, the mascot shall congratulate
the child by name.

**R22.6 (state-driven)** While the level-up overlay is visible, the system shall
pause the countdown and accept no input.

**R22.7 (state-driven)** While `prefers-reduced-motion` is set, the system shall
show the overlay without confetti or animation.

### Acceptance criteria

```gherkin
Feature: Level badge and celebration

  Scenario: Badge always visible
    Given the app is on the setup screen
    Then a badge shows the current level with its emoji
    When the game starts
    Then the badge is still visible, right aligned

  Scenario: Reaching a new level
    Given the child is about to unlock level 2
    When the streak reaches 25
    Then an overlay shows "Nível 2" and "Aprendiz"
    And confetti falls
    And the mascot congratulates the child

  Scenario: The overlay does not block the game forever
    Given the level-up overlay is visible
    When about three seconds pass
    Then the overlay disappears
    And a new question at the new level is shown

  Scenario: Reduced motion
    Given the system requests reduced motion
    When a level is unlocked
    Then the overlay is shown without confetti
```

---

## Defects found and fixed

| Defect | Cause | Fix |
| --- | --- | --- |
| Changing mascot replaced the current question, allowing the child to dodge a hard fact | `startGame` always called `newQuestion()` | Snapshot the question, partial input, attempt and remaining time on leaving; restore them on return |
| The countdown kept running while the child was choosing a mascot | Only the interval was cleared, not the deadline | Pause records the remaining time and cancels the deadline timer |
| The product of an equation was drawn as `?`, indistinguishable from the unknown | A single `answerBox` element was reused for both roles | The question is three slots; the answer slot moves to the unknown position |
| The level badge stayed next to the title instead of moving right | The header row shrank to its content, so `margin-left: auto` had nothing to push against | The row takes the full width and the badge never shrinks |

## Verification record

| Requirement group | Method | Result |
| --- | --- | --- |
| R19 (levels) | Static checks on the level table, the fact ranges and the unlock thresholds; browser run reaching level 2 by 25 correct answers | pass |
| R20 (countdown) | Browser test at level 6: 5 s start, `0:00`, reveal, miss counter, full-sentence timeout line; hidden-tab pause asserted by hand | pass |
| R21 (equations) | Browser run of ten questions at level 4: 3 equations, both shapes, correct factor accepted and product rejected | pass |
| R22 (badge, celebration) | Browser run to the level-2 overlay: title, name, emoji, 54 confetti pieces, congratulation by name; badge alignment measured at 0 px gap | pass |
| Mascot-change fix | Browser run: same fact before and after, countdown frozen at `0:22` for 1.5 s in setup, resumed at the same value | pass |

## Known gaps at the end of this iteration

- The level thresholds were verified by scripted answering, not by a child
  playing. Whether 25 / 50 / 50 / 100 / 200 feel right is a product judgement
  that needs real play. `TODO: confirm`.
- Equations are generated uniformly over the 121 facts; a fact such as
  `11 x 11` produces a less natural equation than `7 x 8`. Acceptable for now.
- The countdown uses `setTimeout` with 250 ms display refresh. On a heavily
  throttled phone the deadline could fire a few hundred milliseconds late.
- Level 6 has no further level; the streak keeps counting for the record but
  nothing else unlocks. Confirmed as intended.
- Roboto remains external, carried over from iteration 2.
- The service-worker version had to be bumped twice during this iteration
  because precached files changed. This is risk R10 behaving as documented.
