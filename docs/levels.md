# Levels

The game has six levels. Each level sets which multiplication facts can be
asked, how long the child has to answer, and whether missing-factor equations
appear. Levels are unlocked by answering correctly on streaks, and the highest
level reached is remembered for one year.

## Rules that apply to every level

- **An answer is correct for the streak only when given on the first attempt.**
  A second-attempt success counts as a correct answer for the statistics, but it
  resets the streak, exactly like a wrong answer.
- **A wrong answer on either attempt resets the streak.** So does a wrong answer
  in an equation.
- **Running out of time is a wrong answer.** It consumes the attempt in play,
  shows the mascot's "time is up" line, and applies the same streak reset.
- **The answer must have exactly as many digits as the correct answer.** A
  dropped key press on a touchscreen leaves a short answer, and a child should
  not lose an attempt because of the hardware. The confirm key stays visibly
  unavailable until the digit count matches, and the Enter shortcut obeys the
  same rule. Too many digits is refused for the same reason: `100` is not an
  attempt at `10`. A wrong-length answer costs nothing: it says "Faltam
  números." or "São números a mais.", ends no attempt and leaves the statistics
  untouched. The digit keys stay live up to the three-digit limit, so a child
  can see and correct an over-long answer instead of finding a dead keypad.
- **The streak that unlocks a level is counted inside the current level.** On
  reaching a new level, the streak resets to zero and the count starts again
  towards the next threshold.
- **Once reached, a level is never lost.** A bad session does not demote the
  child; the level only goes up.

## Level table

| Level | Name | Emoji | Facts asked | Time per question | Unlocked by |
| --- | --- | --- | --- | --- | --- |
| 1 | Iniciante | 🐣 | 1 to 10 | 30 s | starting level |
| 2 | Aprendiz | 🐥 | 2 to 12 | 20 s | 25 correct in a row in level 1 |
| 3 | Esperto | 🦊 | 2 to 12 | 12 s | 50 correct in a row in level 2 |
| 4 | Mestre | 🧠 | 2 to 12, plus equations | 10 s | 50 correct in a row in level 3 |
| 5 | Génio | 🚀 | 2 to 12, plus equations | 7 s | 100 correct in a row in level 4 |
| 6 | Einstein | 🏆 | 2 to 12, plus equations | 5 s | 200 correct in a row in level 5 |

Level 6 has no further level. Reaching it keeps the 5-second limit, and the
streak counter keeps running for the record.

## Facts per level

Level 1 asks every fact from `1 x 1` to `10 x 10`. Levels 2 to 6 exclude the
table of 1 entirely: neither `1 x n` nor `n x 1` is asked, so 121 facts remain
(from 2 to 12 on both sides).

The adaptive weighting described in
[ADR-0004](./architecture/adr/0004-adaptive-fact-selection.md) still applies
inside the allowed set. A fact the child fails comes back more often; the level
only decides which facts are eligible and how much time is available.

## Equations

From level 4 onwards, some questions show a missing factor instead of the
product. The child answers with the missing number.

Two shapes exist and are chosen at random for each question:

```
7 x ? = 56      the answer is 8
? x 5 = 25      the answer is 5
```

The product is always shown. The answer box always holds the missing number, so
the keypad keeps working the same way. Roughly one in three questions in levels
4 and 5 is an equation; level 6 uses the same mix.

## Timer

The "Tempo" indicator shows the **time remaining for the current question**, in
`m:ss`, counting down. It turns amber in the last third of the limit and red in
the last three seconds.

One countdown spans **both attempts** of a question: a wrong first answer does
not stop it, so a child who used the whole first attempt has the same limit for
the second. Only resolving the question — correct answer, second miss or expiry
— stops it.

The timer is held, and resumes from the same value, while an answer has been
accepted, while the answer is being revealed, while a dialog is open, while a
level-up celebration is on screen, and while the browser tab is hidden. Pauses
can overlap, so each one is a named reason; the timer runs only when no reason
is held.

The display rounds up. `0:00` appears only when the question is resolved, and
never while an answer can still be given.

## Level-up celebration

When a level is unlocked:

1. The game pauses.
2. A full-screen overlay shows the level number and its emoji, for example
   "Nível 3" with 🦊, for about 2 seconds.
3. Confetti falls.
4. The mascot says a congratulation line.
5. A new question starts at the new level and the new time limit.

## Persistence

The current level is stored in `localStorage` and in a cookie with a one-year
lifetime, alongside the name and mascot. On return, the game starts at the
stored level.

If the stored level is missing or invalid, the game starts at level 1.

## On screen

The level is always visible as a badge: the emoji plus the number, for example
`🐣 Nível 1`. It appears in the header on every screen, including before the
game starts, so the child can see the level reached so far.
