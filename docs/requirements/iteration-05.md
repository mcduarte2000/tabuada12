# Iteration 5 — Reliable controls and an honest countdown

* Status: completed
* Period: 2026-11-10
* Shipped in: v1.8.0 (same release as iteration 6)

This iteration started from two field reports about the calculation screen. Both
turned out to be the same class of defect: the interface showed one state while
the logic acted on another.

## Summary

| Metric | Value |
| --- | --- |
| User stories | 2 (US-26, US-27) |
| EARS requirements | 6 |
| Gherkin scenarios | 5 |
| Automated checks | 119 → 128 (72 static, 56 browser) |
| Defects found and fixed | 5 |
| External runtime requests | 0 → 0 |

## Scope

### In scope

- A keypad key that reacts to a press it then discards.
- A countdown that freezes on the second attempt.
- A question that can sit answerable at `0:00` without counting as a loss.
- The installed version and a changelog link in the information dialog.

### Out of scope

- Reworking the level thresholds.
- Any change to the adaptive selection weights.
- Any new dependency, build step or external request.

---

## US-26 — Trust that a pressed control did what it looked like it did

**User story**

> As a child, I want a key that lights up to actually type the digit, so that I
> do not think the game is broken.

### Requirements

**R26.1 (ubiquitous)** The system shall derive the enabled state of every keypad
key from the same condition that gates input for that key.

**R26.2 (unwanted behaviour)** If a key cannot accept a press, then the system
shall render it visually disabled and shall not show press feedback.

**R26.3 (state-driven)** While the input is at its maximum length, the system
shall disable the digit keys and keep the delete key enabled.

### Acceptance criteria

```gherkin
Feature: Honest keypad

  Scenario: Press during the answer celebration
    Given a correct answer was just confirmed
    When a digit key is pressed
    Then the key is disabled
    And it has reduced opacity and a default cursor
    And the next question starts with an empty answer

  Scenario: Maximum length
    Given the answer already has three digits
    Then every digit key is disabled
    And the delete key is still enabled
    And pressing a digit key leaves the answer unchanged

  Scenario: Editable again
    When a digit is deleted
    Then the digit keys are enabled again
```

---

## US-27 — Trust the countdown

**User story**

> As a child, I want the time bar to mean something, so that I know when I am
> out of time and cannot be surprised by it.

### Requirements

**R27.1 (ubiquitous)** The system shall run one countdown per question that spans
both attempts.

**R27.2 (unwanted behaviour)** If the countdown reaches zero, then the system
shall end the question in the revealed phase and count a miss.

**R27.3 (state-driven)** While the time display shows `0:00`, the system shall
not accept an answer.

### Acceptance criteria

```gherkin
Feature: A countdown that always resolves

  Scenario: Wrong first attempt
    Given a question with a running countdown
    When the first attempt is wrong
    Then the countdown keeps running
    And it can still expire on the second attempt

  Scenario: Expiry on the second attempt
    Given the first attempt was wrong
    When the countdown reaches zero
    Then the answer is revealed
    And the keypad is hidden
    And the miss counter increased

  Scenario: No question at zero
    Given the countdown has reached zero
    Then no keypad key accepts input
    And the Continue button is visible

  Scenario: Reading a panel
    Given a question with a running countdown
    When the Acertos panel opens
    Then the countdown is paused
    When the panel closes
    Then the countdown resumes from the same value
```

---

## Defects found and fixed

| Defect | Cause | Fix |
| --- | --- | --- |
| A key changed colour and typed nothing | The ripple had its own `pointerdown` listener and ignored the phase and busy guards that `pressDigit` applied | Derive every key's `disabled` state from those guards and refuse to ripple a disabled button |
| The clock froze on the second attempt | The first wrong path called `stopTimer()` and never rearmed | One countdown spans both attempts; only a resolved question stops it |
| A question stayed open at `0:00` | A pause on the last millisecond left `remaining = 0`, `resumeTimer` refused to rearm, and `startQuestionTimer` returned early while paused | Resume always arms or resolves; a zero remainder resolves the question |
| The display showed `0:00` while answering was still possible | `formatTime` floored | Round up, so `0:00` only appears when nothing can be answered |
| Reading a panel cost time | Dialogs never touched the timer | Dialogs hold and release a named pause reason |

## Verification

Both suites pass:

```sh
node tests/regression.js
python3 tests/validate-docs.py .
```

The browser checks below were confirmed against a service-worker-free server so
the assertions could not pass on a stale cached script:

- Level 6, wrong first answer: the display counted `0:05`, `0:03`; expiry then
  revealed the answer with a second miss.
- Level 6, no input: the display reached `0:00` exactly once, with every keypad
  key disabled and Continue visible.
- Three digits typed: digit keys disabled at reduced opacity, delete still
  enabled, and a scripted click on a disabled digit changed nothing.
- The information dialog reports `1.8.0` and links to the rendered changelog.
