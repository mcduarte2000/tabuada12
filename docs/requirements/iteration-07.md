# Iteration 7 — Do not punish a dropped key press

* Status: completed
* Period: 2026-11-11
* Shipped in: v1.8.1

A child answers `4 × 3` by pressing `1` and `2`. On a touchscreen that is
occasionally unresponsive, the `2` is lost, the child sees `1`, presses the
confirm key and loses an attempt for a mistake the keyboard made. This iteration
refuses an answer whose digit count does not match the correct answer, in both
directions.

## Summary

| Metric | Value |
| --- | --- |
| User stories | 1 (US-31) |
| EARS requirements | 4 |
| Gherkin scenarios | 4 |
| Automated checks | 146 → 152 (92 static, 60 browser) |
| Defects found and fixed | 1 |
| External runtime requests | 0 → 0 |

## Scope

### In scope

- The confirm key's availability follows the digit count of the correct answer.
- A visible difference between available and unavailable.
- Too many digits is refused as well as too few.
- A wrong-length answer does not consume an attempt.

### Out of scope

- Any change to how a wrong answer of the right length is scored.
- A waiting period before the confirm key becomes usable; the count alone
  decides.

---

## US-31 — Do not lose an attempt because a key press was dropped

**User story**

> As a child, I want the confirm key to wait until I have typed as many digits as
> the answer needs, so that a dropped key press costs me a correction instead of
> an attempt.

### Requirements

**R31.1 (state-driven)** While the number of digits typed differs from the number
of digits in the correct answer, the system shall keep the confirm key
unavailable.

**R31.2 (ubiquitous)** The system shall make the difference between an available
and an unavailable confirm key visible without relying on colour alone.

**R31.3 (unwanted behaviour)** If the child submits a wrong-length answer, then
the system shall keep the question open, consume no attempt, and say what is
missing or excessive.

**R31.4 (event-driven)** When the child presses Enter with a wrong-length answer,
the system shall apply the same rule as the confirm key.

### Acceptance criteria

```gherkin
Feature: The confirm key follows the digit count

  Scenario: Too few digits
    Given the correct answer is 18
    When the child has typed 1
    Then the confirm key is unavailable
    And it is greyed and shows a not-allowed cursor
    And pressing Enter keeps the question open
    And the mascot says "Faltam números."

  Scenario: Exactly enough digits
    Given the correct answer is 18
    When the child has typed 18
    Then the confirm key is available
    And it is purple with a pointer cursor

  Scenario: Too many digits
    Given the correct answer is 10
    When the child has typed 100
    Then the confirm key is unavailable
    And pressing Enter keeps the question open
    And the mascot says "São números a mais."

  Scenario: A wrong-length answer is not a mistake
    Given the child submits a wrong-length answer
    Then the miss counter does not change
    And the streak is not reset
    And the attempt in play is not consumed
```

---

## Defects found and fixed

| Defect | Cause | Fix |
| --- | --- | --- |
| An attempt could be lost to a dropped key press | The confirm key required only a non-empty answer | The confirm key and the Enter shortcut require the input length to equal the digit count of the correct answer |
| A wrong-length answer scored a miss | The submitted value was compared with the answer with no length check | Length is checked before the value, so a slip costs nothing |

## Design notes

The digit keys themselves stay live up to the three-digit hard limit rather than
stopping at the expected length. Two reasons:

- A child who typed `100` for `10` must be able to see the mistake and correct
  it with the delete key. Locking the keypad at two digits would leave a live
  confirm key over an unchangeable wrong answer.
- The refused key would be indistinguishable, to a child, from the dropped key
  press this iteration exists to forgive.

Only the confirm key enforces the count, which keeps one rule in one place.

## Verification

Both suites pass:

```sh
node tests/regression.js          # 92 passed, 0 failed (152 checks when a browser is available)
python3 tests/validate-docs.py .  # 28 passed, 0 failed
```

Browser checks were run against a cache-free server:

| Input, answer `18` | Confirm key | Enter | Misses |
| --- | --- | --- | --- |
| empty | grey, `not-allowed` | — | 0 |
| `1` | grey, `not-allowed` | "Faltam números." | 0 |
| `18` | purple, `pointer` | scores | 0 |
| `189` | grey, `not-allowed` | "São números a mais." | 0 |

A partial answer also survives leaving the game and returning: the restored
value keeps the confirm key unavailable until it is completed.
