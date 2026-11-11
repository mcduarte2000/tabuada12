# 0009. One owner for the countdown, and no input that lies

* Status: accepted
* Date: 2026-11-10

## Context and problem statement

Two field reports described the same underlying problem in different places:

1. "Sometimes a button is pressed, it even changes colour, but nothing happens."
2. "Sometimes the countdown reaches 0 and it does not count as a loss; it just
   waits for an answer. After the answer it moves on and works normally."

Both are symptoms of state that the interface and the logic disagree about.
The keypad rippled on `pointerdown` from its own listener, while the digit was
accepted or dropped much later by `pressDigit`/`submit`, guarded by
`phase` and `busy`. The ripple fired even when the guard would reject the press,
so the child saw feedback for an action that did not happen.

The countdown had no single owner either. It was armed by
`startQuestionTimer`, persisted by `armDeadline`, frozen by `stopTimer` on the
first wrong attempt, resumed by `resumeTimer` only when `remaining > 0`, and
reinitialised by `resetTimerDisplay`. Several call sites set `state.paused`
directly. A first wrong attempt called `stopTimer()` and never rearmed, so the
second attempt had no deadline at all. If a pause landed on the last millisecond,
`remaining` became `0`, `resumeTimer` refused to rearm, and `newQuestion` bailed
out early while paused — leaving a question answerable at `0:00` forever.

`formatTime` also floored, so the display showed `0:00` for up to a second while
the question still accepted input. That is the observable half of the second
report: the child sees zero, keeps answering, and the answer is accepted.

These are not cosmetic. They break the promise in `docs/levels.md` that running
out of time is a wrong answer, and they teach a child that the controls are
unreliable.

## Considered options

### Option A: patch each symptom where it was seen

Add `stopTimer` back on the wrong path, clamp `remaining`, and floor the
remaining time to at least one second.

Pros: smallest diff.

Cons: the state machine keeps several writers, so the next pause or resume path
reproduces the same class of bug. It fixes instances, not the cause.

### Option B: one timer owner plus a single input gate

Make the countdown a small state machine with one entry point per transition,
and derive both the countdown and the keypad's enabled state from `state`, so
no control can look active while the logic would ignore it.

Pros: removes the class of defect; the invariants become testable; the ripple
matches what will happen.

Cons: touches more call sites; needs a migration of every direct `state.paused`
write.

### Option C: move the countdown into CSS animation and read it back

Pros: none for correctness; animation events are less reliable than timers.

Cons: discards the pause semantics and makes tests worse.

## Decision outcome

We chose **Option B**. Three invariants now hold, and each has a regression
check:

1. **The countdown has one owner.** `pauseTimer(reason)` and
   `resumeTimer(reason)` take a reason key from a set, because pauses overlap:
   a hidden tab, an open dialog and the level-up celebration can coincide. The
   timer runs only while no reason is held. `resumeTimer` re-arms from
   `state.remaining`, and if that is zero it resolves the question instead of
   leaving it open. `startQuestionTimer` no longer returns early while paused;
   it records the remaining time so the resume path can arm it.
2. **Expiry always ends the question.** `timeUp` transitions to `revealed`, so a
   question can never sit answerable at zero. The deadline callback clears the
   countdown before calling it.
3. **A control reports its real state.** `updateConfirm` disables every keypad
   key that cannot accept input, and `spawnRipple` refuses disabled buttons, so
   the visual reaction and the action agree. The display rounds time up, so
   `0:00` appears only when there is nothing left to answer.

The first wrong attempt no longer clears the deadline: the same clock spans
both attempts of a question, which is what `docs/levels.md` describes.

Dialogs now pause and resume the timer, because reading the Acertos sheet used
to consume the child's remaining time.

### Consequences

* Positive: the two reported defects cannot recur through a new pause path
  without failing a check, because every pause goes through a reason key.
* Positive: the keypad's appearance is derived from the same predicate that
  gates input, so "it looks pressable but does nothing" is structurally
  impossible.
* Positive: the countdown is testable without a browser, because the state
  transitions are named functions.
* Negative / risks: a new pause reason must be paired with its resume, or the
  clock stays paused. The reason key set makes the omission visible and the
  dialog and visibility paths are both covered by checks.
* Negative / risks: the clock now runs during the second attempt, so a child who
  used the whole first attempt gets no free second attempt. This is the
  documented rule, and the level-up thresholds were tuned for it.
