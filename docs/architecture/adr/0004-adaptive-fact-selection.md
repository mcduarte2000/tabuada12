# 0004. Select the next fact with weighted random choice

* Status: accepted
* Date: 2026-11-08

## Context and problem statement

The app exists so a child learns facts they do not know. Picking uniformly at
random from the 144 facts wastes time on facts already mastered and gives too
little practice to facts that keep failing.

The selection has to be fair enough to keep the game varied, deterministic
enough to be explainable in documentation, and simple enough for an ES5 file
with no tests.

## Considered options

### Option A: Uniform random choice

Pros: trivial, perfectly unpredictable, easy to explain.

Cons: no learning adaptation at all; a child can be asked 12x12 five times in a
row, or never see the fact they always fail.

### Option B: Spaced repetition with explicit due dates

Pros: well-understood learning science, predictable review intervals.

Cons: needs dates per fact, a scheduler and a notion of "due now"; overkill for
a session-based game and hard to tune without tests.

### Option C: Weighted random choice per fact

Pros: adapts immediately, no dates or queues, one formula, easy to explain and
tune; recency can be folded in as a multiplier.

Cons: weights need tuning by feel; no guarantee a failed fact appears soon,
only that it is more likely.

### Option D: Strict priority queue (always ask the worst fact)

Pros: guarantees failed facts come next.

Cons: repetitive and demotivating; the child notices the same question looping.

## Decision outcome

We chose **Option C**. Each fact carries a weight and the next question is drawn
proportionally to it. Weighted random preserves variety while heavily biasing
towards failures.

Current weights: base 6 for an unseen fact; `14 x (1 + failures)` for a failed
fact, reduced to 60 % if it was also answered correctly at some point; 4.5 for a
fact only ever answered on the second try; `0.8 / successes` for facts answered
on the first try. Recency multipliers of 0.12 within 3 minutes and 0.45 within
12 minutes suppress immediate repeats, and the previous fact is damped to 0.08.

### Consequences

* Positive: one function (`factWeight()`) encodes the entire pedagogy, so it
  can be tuned without touching the game flow.
* Positive: failed facts appear roughly 5 to 25 times more often than mastered
  ones, depending on failure count, without ever disappearing.
* Negative / risks: no guarantees, only probabilities; a failed fact might wait
  a few questions. Accepted as the price of variety.
* Negative / risks: the formula has no automated test, so regressions are only
  visible by playing. Tracked as debt D1 in
  [quality-and-risks.md](../quality-and-risks.md).
* Follow-up: if a proper spaced-repetition model is wanted later, it replaces
  this ADR.
