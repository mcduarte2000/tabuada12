# Iteration 1 — Playable multiplication game

* Status: completed
* Period: 2026-11-08
* Shipped in: v1.0.0 to v1.2.0

This iteration produced the first complete, playable version of Tabuada 12: a
child enters a name, picks a mascot, answers multiplication questions with two
attempts each, and the app adapts which facts it asks based on what the child
gets right and wrong.

Requirements below are written in English. Every acceptance criterion was
executed in a browser (Chromium, 320x568, 390x844 and desktop, light and dark).
Test results are recorded at the end of the document.

## Scope

### In scope

- Name entry and mascot selection on first use.
- Random multiplication facts from 1x1 to 12x12.
- Two attempts per fact, with the correct answer revealed after the second
  mistake.
- Adaptive repetition of failed facts and deprioritisation of mastered facts.
- Session statistics: correct answers, misses, streak, record and elapsed time.
- Persistence of profile, preferences and progress in the browser.
- Light and dark themes.
- Optional feedback sound.
- Mascot dialogue that reacts to answers.
- Static hosting with no backend.

### Out of scope in this iteration

- Offline support after a cold start (no service worker).
- Background music. An intermediate version added it and it was removed before
  the iteration closed.
- Multiple languages.
- Accounts or cross-device sync.
- Native mobile packaging.

---

## US-1 — Play the game with a mascot

**User story**

> As a child, I want a friendly animal to ask me multiplication questions, so
> that practising feels like a game instead of a test.

### Requirements

**R1.1 (event-driven)** When the app starts and no saved profile exists, the
system shall ask, in second person ("Como te queres chamar?"), for a game name
before showing any question.

**R1.2 (unwanted behaviour)** If the submitted name is shorter than two
characters after trimming and collapsing whitespace, then the system shall show
an inline error, keep the app on the name step, and move focus to the name
field.

**R1.3 (event-driven)** When a valid name is submitted, the system shall display
the mascot selection with 30 mascot options, each with a visible name and an
accessible name.

**R1.4 (state-driven)** While no mascot is selected, the system shall keep the
play button disabled.

**R1.5 (event-driven)** When the child selects a mascot, the system shall
highlight it, show a welcome line from that mascot, and enable the play button.

**R1.6 (event-driven)** When the child presses the play button, the system shall
show the game screen with the mascot, the question and a numeric keypad.

**R1.7 (ubiquitous)** The system shall accept input only through on-screen
digits, a delete key, and a confirm key; it shall not require a physical
keyboard.

**R1.8 (event-driven)** When the child types a digit, the system shall append it
to the current answer and enable the confirm key; it shall accept at most three
digits.

**R1.9 (event-driven)** When the child presses the delete key, the system shall
remove the last typed digit.

**R1.10 (optional feature)** Where a physical keyboard is available, the system
shall accept digits, Backspace and Enter as equivalents of the on-screen keys
while the game screen is visible.

### Acceptance criteria

```gherkin
Feature: Starting a game with a mascot

  Scenario: First visit asks for a name
    Given the child has no saved profile
    When the app finishes loading
    Then the name step is visible
    And no multiplication question is shown

  Scenario: Rejecting a too-short name
    Given the name step is visible
    When the child submits " A "
    Then an inline error is shown
    And the name step remains visible
    And focus is on the name field

  Scenario: Choosing a mascot enables play
    Given the child has submitted the name "Maria"
    Then 30 mascot options are visible
    And the play button is disabled
    When the child selects "Fofuxa"
    Then "Fofuxa" is marked as selected
    And the play button is enabled
    And a welcome line from Fofuxa is shown

  Scenario: Starting the game
    Given a name and a mascot are chosen
    When the child presses the play button
    Then a multiplication question is displayed
    And the numeric keypad is displayed
    And the mascot is displayed next to its speech bubble

  Scenario: Typing and deleting digits
    Given a question is displayed
    When the child presses 1, 2 and 3
    Then the answer box shows "123"
    When the child presses the delete key
    Then the answer box shows "12"

  Scenario: Answer limit
    Given a question is displayed
    When the child presses 1, 2, 3 and 4
    Then the answer box shows "123"

  Scenario: Physical keyboard support
    Given the game screen is visible
    When the child presses the key 7, then Backspace
    Then the answer box is empty
    When the child presses the key 7 and then Enter
    Then the current answer is submitted
```

---

## US-2 — Get two chances before seeing the answer

**User story**

> As a child, I want a second chance when I make a mistake, so that I can think
> again before being told the answer.

### Requirements

**R2.1 (event-driven)** When the child submits a wrong answer on the first
attempt, the system shall clear the answer box, keep the same question, show an
encouraging message, and allow one more attempt.

**R2.2 (state-driven)** While the child is on the second attempt, the system
shall keep the same multiplication fact and not generate a new one.

**R2.3 (event-driven)** When the child submits the correct answer on the first
attempt, the system shall mark the answer as correct, show praise, play the
correct sound and schedule the next question after 1250 ms.

**R2.4 (event-driven)** When the child submits the correct answer on the second
attempt, the system shall mark the answer as correct, show a message that
acknowledges the second attempt, and schedule the next question after 1250 ms.

**R2.5 (event-driven)** When the child submits a wrong answer on the second
attempt, the system shall reveal the correct product, show it in the answer box
and in the mascot bubble, hide the keypad, and show a Continue button focused
for keyboard users.

**R2.6 (event-driven)** When the child presses Continue after a reveal, the
system shall immediately show a new question.

**R2.7 (state-driven)** While the answer is revealed, the system shall replace
the question with a new one after 7000 ms even if the child does not press
Continue.

**R2.8 (unwanted behaviour)** If the child presses confirm with an empty answer,
then the system shall not consume an attempt and shall signal the empty answer
visually.

### Acceptance criteria

```gherkin
Feature: Two attempts per question

  Scenario: First mistake keeps the question
    Given the question "3 x 4" is displayed
    When the child answers "10" and confirms
    Then the question "3 x 4" remains displayed
    And an encouraging message is shown
    And the answer box is empty
    And the child can answer again

  Scenario: Correct on the first attempt advances automatically
    Given the question "3 x 4" is displayed
    When the child answers "12" and confirms
    Then praise is shown
    And the mascot animates happily
    And the correct counter increases by one
    And a new question appears after about 1250 ms

  Scenario: Correct on the second attempt advances automatically
    Given the question "3 x 4" is displayed
    And the child has already answered "10" once
    When the child answers "12" and confirms
    Then a message acknowledging the second attempt is shown
    And the correct counter increases by one
    And the streak is not increased
    And a new question appears after about 1250 ms

  Scenario: Second mistake reveals the answer
    Given the question "3 x 4" is displayed
    And the child has already answered "10" once
    When the child answers "11" and confirms
    Then the answer box shows "12"
    And the mascot bubble states that the answer is 12
    And the keypad is hidden
    And a Continue button is visible and focused

  Scenario: Continue starts the next question immediately
    Given the answer to the current question has been revealed
    When the child presses Continue
    Then a new question is displayed immediately

  Scenario: Reveal advances on its own
    Given the answer to the current question has been revealed
    When the child does nothing for 7000 ms
    Then a new question is displayed

  Scenario: Empty answer does not consume an attempt
    Given the question "3 x 4" is displayed
    When the child presses confirm with no digits typed
    Then no attempt is consumed
    And the answer box signals the empty answer
    And the child can still answer
```

---

## US-3 — Practise more the facts I get wrong

**User story**

> As a child, I want the questions I get wrong to come back more often, so that
> I improve where it matters instead of repeating what I already know.

### Requirements

**R3.1 (ubiquitous)** The system shall treat each ordered pair (a, b) with
1 <= a <= 12 and 1 <= b <= 12 as an independent fact, giving 144 facts.

**R3.2 (ubiquitous)** The system shall select the next fact with a random draw
proportional to a weight computed per fact.

**R3.3 (state-driven)** While a fact has never been answered, the system shall
assign it the base weight of 6.

**R3.4 (state-driven)** While a fact has one or more recorded failures, the
system shall assign it the weight `14 x (1 + failures)`, reduced to 60 % of that
value if the fact also has at least one recorded success.

**R3.5 (state-driven)** While a fact has only ever been answered correctly on
the second attempt, the system shall assign it the weight 4.5.

**R3.6 (state-driven)** While a fact has been answered correctly on the first
attempt at least once and has no failures, the system shall assign it the weight
`0.8 / successes`.

**R3.7 (state-driven)** While a fact was answered correctly less than 3 minutes
ago, the system shall multiply its weight by 0.12; between 3 and 12 minutes ago
the multiplier shall be 0.45.

**R3.8 (ubiquitous)** The system shall never assign a weight below 0.05, so no
fact becomes unreachable.

**R3.9 (ubiquitous)** The system shall damp the weight of the fact asked
immediately before to 0.08 of its value, and the weight of its commutative
counterpart to 0.6.

**R3.10 (event-driven)** When the child answers, the system shall record the
outcome as a first-try success, a second-try success, or a failure, and shall
update the weight inputs immediately.

### Acceptance criteria

```gherkin
Feature: Adaptive repetition

  Scenario: A failed fact is much more likely than a new fact
    Given the fact "7 x 8" has two recorded failures
    And the fact "2 x 3" has never been asked
    Then the weight of "7 x 8" is 42
    And the weight of "2 x 3" is 6

  Scenario: A mastered fact is rarely repeated
    Given the fact "5 x 5" has three first-try successes and no failures
    And the last success was more than 12 minutes ago
    Then the weight of "5 x 5" is about 0.27

  Scenario: Recent success is suppressed
    Given the fact "6 x 7" was answered correctly 1 minute ago
    Then its weight is 0.12 times its base weight

  Scenario: The previous fact is unlikely to repeat
    Given the fact "4 x 9" was the last question asked
    Then its weight is 0.08 of the value it would otherwise have

  Scenario: No fact becomes unreachable
    Given a fact has been answered correctly on the first attempt 100 times
    Then its weight is 0.05

  Scenario: Second-try successes count differently
    Given the fact "9 x 9" was only ever answered correctly on the second attempt
    And the last answer was more than 12 minutes ago
    Then its weight is 4.5
```

---

## US-4 — See how I am doing

**User story**

> As a child, I want to see my correct answers, my misses, my streak and my
> record, so that I feel motivated to keep going.

### Requirements

**R4.1 (ubiquitous)** The system shall display five session indicators: elapsed
time, correct answers, misses, current streak and record.

**R4.2 (event-driven)** When the game starts, the system shall begin the session
clock and display it as `m:ss`.

**R4.3 (event-driven)** When the child answers correctly, the system shall
increase the correct counter and animate it.

**R4.4 (event-driven)** When the child submits a wrong answer, the system shall
increase the miss counter immediately, on the first attempt as well as the
second, and animate it.

**R4.5 (event-driven)** When the child answers correctly on the first attempt,
the system shall increase the streak by one and, if it exceeds the stored
record, update and persist the record.

**R4.6 (event-driven)** When the child submits any wrong answer, the system
shall reset the streak to zero.

**R4.7 (state-driven)** While the browser tab is hidden, the system shall pause
the clock update; when it becomes visible again, the clock shall continue from
the original start time.

**R4.8 (event-driven)** When the child changes mascot mid-game, the system shall
preserve the correct count, the miss count, the streak and the elapsed time.

### Acceptance criteria

```gherkin
Feature: Session statistics

  Scenario: Clock starts with the first question
    Given the child presses the play button
    Then the time indicator starts at "0:00" and increases each second

  Scenario: Correct answer increments the counter
    Given the correct counter shows 4
    When the child answers correctly
    Then the correct counter shows 5

  Scenario: First mistake increments the miss counter
    Given the miss counter shows 0
    When the child answers wrongly for the first time
    Then the miss counter shows 1

  Scenario: Streak resets on a mistake
    Given the streak shows 3
    When the child answers wrongly
    Then the streak shows 0

  Scenario: Record only grows
    Given the record shows 5
    And the streak reaches 6
    Then the record shows 6
    When the child fails and later reaches a streak of 4
    Then the record still shows 6

  Scenario: Changing mascot preserves the session
    Given the correct counter shows 2, the streak shows 1 and the clock shows "1:20"
    When the child changes the mascot and presses play
    Then the correct counter still shows 2
    And the streak still shows 1
    And the clock continues instead of restarting at "0:00"

  Scenario: Clock pauses in a hidden tab
    Given the clock shows "0:30"
    When the tab becomes hidden for 2 minutes and is shown again
    Then the clock shows about "0:32", not "2:32"
```

---

## US-5 — Keep my profile and progress

**User story**

> As a child, I want the app to remember my name, my mascot and what I have been
> practising, so that I do not start from scratch every time.

### Requirements

**R5.1 (event-driven)** When the child starts a game, the system shall store the
name and mascot in cookies with a validity of 365 days, using
`SameSite=Lax` and `Secure` on HTTPS.

**R5.2 (ubiquitous)** The system shall keep the full progress in
`localStorage`, including per-fact counters and the timestamps of the last
answer and last correct answer.

**R5.3 (event-driven)** When the child answers, the system shall also write a
compact progress representation to a cookie with a validity of 24 hours.

**R5.4 (state-driven)** While the compact representation exceeds 3800 bytes,
the system shall stop updating the progress cookie and keep
`localStorage` as the only source.

**R5.5 (state-driven)** While stored progress is older than 24 hours, the system
shall ignore it when selecting facts, while keeping the name and mascot.

**R5.6 (unwanted behaviour)** If a cookie is missing, malformed or cannot be
decoded, then the system shall fall back to `localStorage` and continue without
showing an error.

**R5.7 (unwanted behaviour)** If browser storage is unavailable or full, then
the system shall continue the game with in-memory state only.

**R5.8 (event-driven)** When the app loads, the system shall restore the saved
name and mascot, preselect the mascot, and prefill the name field.

### Acceptance criteria

```gherkin
Feature: Persistence

  Scenario: Profile survives a reload
    Given the child played as "Maria" with "Fofuxa"
    When the page is reloaded
    Then the name field contains "Maria"
    And "Fofuxa" is preselected in the mascot step

  Scenario: Profile cookies have a one-year lifetime
    Given the child started a game
    Then a cookie named "tabuada12_name" exists with the value "Maria"
    And a cookie named "tabuada12_mascot" exists with the value "fofuxa"
    And both have a lifetime of 365 days

  Scenario: Progress is written to both stores
    Given the child answers "3 x 4" incorrectly twice
    Then "localStorage" contains a failure for "3x4"
    And the progress cookie contains "3x4:0,0,2" with a 24-hour lifetime

  Scenario: Expired progress is ignored
    Given progress was saved 25 hours ago
    When the app loads
    Then the saved name and mascot are still restored
    And no fact weight reflects the expired progress

  Scenario: Corrupt cookie falls back to localStorage
    Given the progress cookie contains invalid data
    And "localStorage" contains valid progress
    When the app loads
    Then the game starts normally
    And the weights use the "localStorage" progress

  Scenario: Storage blocked still allows play
    Given cookies and "localStorage" are blocked by the browser
    When the child plays a round
    Then every question can be answered
    And no error message is shown to the child
```

---

## US-6 — Play comfortably in any light and on any phone

**User story**

> As a child or parent, I want the app to be readable outdoors and comfortable
> at night on a small phone, so that it can be used anywhere.

### Requirements

**R6.1 (ubiquitous)** The system shall provide a light and a dark theme, chosen
automatically from the operating system preference on first use.

**R6.2 (event-driven)** When the child presses the theme button, the system
shall switch theme and persist the choice.

**R6.3 (state-driven)** While the page is loading, the system shall apply the
saved theme before first paint to avoid a flash of the wrong theme.

**R6.4 (ubiquitous)** The system shall be usable from a viewport 320 px wide
without horizontal scrolling and without truncated labels.

**R6.5 (ubiquitous)** The system shall provide touch targets of at least 44 CSS
pixels for all interactive controls.

**R6.6 (state-driven)** While the operating system requests reduced motion, the
system shall disable decorative animation, confetti and ripples.

**R6.7 (ubiquitous)** The system shall respect `env(safe-area-inset-*)` so that
content is not hidden by notches or home indicators.

**R6.8 (ubiquitous)** The system shall give every interactive control an
accessible name and shall expose feedback through live regions.

### Acceptance criteria

```gherkin
Feature: Themes and responsive layout

  Scenario: Theme follows the system on first use
    Given the operating system prefers a dark colour scheme
    And the child has never chosen a theme
    When the app loads
    Then the dark palette is applied

  Scenario: Theme choice is persisted
    Given the app is in the light theme
    When the child presses the theme button
    Then the dark palette is applied
    And the choice survives a reload

  Scenario: Narrow viewport
    Given a viewport 320 px wide
    When the game screen is displayed
    Then no horizontal scrolling is required
    And all five statistic labels are readable
    And the title "Tabuada 12" is fully visible

  Scenario: Reduced motion
    Given the operating system requests reduced motion
    When the child answers correctly
    Then no confetti is rendered
    And no ripple animation is rendered

  Scenario: Accessible controls
    Given the game screen is displayed
    Then every keypad button has an accessible name
    And the mascot bubble is announced politely
    And the sound and theme buttons report their state
```

---

## US-7 — Hear feedback without needing to read

**User story**

> As a child who cannot read fluently, I want a sound when I am right or wrong,
> so that I understand the result immediately.

### Requirements

**R7.1 (event-driven)** When the child answers correctly, the system shall play
a two-note rising chime.

**R7.2 (event-driven)** When the child answers wrongly, the system shall play a
short low tone.

**R7.3 (event-driven)** When the answer is revealed, the system shall play a
two-note falling figure.

**R7.4 (ubiquitous)** The system shall generate all sounds in the browser and
shall not download any audio file.

**R7.5 (event-driven)** When the child presses the sound button, the system
shall toggle sound effects, update the button state, and persist the choice.

**R7.6 (state-driven)** While sound is disabled, the system shall not create any
audio oscillator.

**R7.7 (unwanted behaviour)** If the browser blocks audio until a user gesture,
then the system shall create the audio context on the first interaction and
continue silently until then.

### Acceptance criteria

```gherkin
Feature: Sound feedback

  Scenario: Correct answer plays a chime
    Given sound effects are enabled
    When the child answers correctly
    Then a two-note rising chime is audible

  Scenario: Wrong answer plays a low tone
    Given sound effects are enabled
    When the child submits a wrong answer
    Then a short low tone is audible

  Scenario: No audio files are requested
    Given the app is loaded
    When the child plays and answers questions
    Then the network panel shows no audio file requests

  Scenario: Sound can be disabled
    Given sound effects are enabled
    When the child presses the sound button
    Then the button reports the disabled state
    And the choice survives a reload
    And no oscillator is created for later answers
```

---

## US-8 — Be greeted and encouraged by the mascot

**User story**

> As a child, I want the mascot to talk to me with funny lines, so that the game
> feels alive and I am not afraid of making mistakes.

### Requirements

**R8.1 (event-driven)** When a question appears, the system shall show a phrase
from the current mascot that invites an answer.

**R8.2 (event-driven)** When the child answers correctly on the first attempt,
the system shall show a random praise phrase from the current mascot.

**R8.3 (event-driven)** When the child answers correctly on the second attempt,
the system shall show a random phrase from the current mascot that acknowledges
the second attempt.

**R8.4 (event-driven)** When the child answers wrongly, the system shall show a
random encouraging phrase from the current mascot without revealing the answer.

**R8.5 (event-driven)** When the answer is revealed, the system shall show a
phrase from the current mascot that contains the correct product.

**R8.6 (ubiquitous)** The system shall substitute the placeholders `{nome}`,
`{produto}`, `{a}`, `{b}`, `{interjeicao}` and `{traco}` in every phrase.

**R8.7 (ubiquitous)** The system shall avoid repeating the same phrase twice in
a row within the same category when more than one phrase is available.

**R8.8 (optional feature)** Where `content.json` is reachable, the system shall
use its phrase pools per mascot; otherwise it shall use built-in generic
phrases.

**R8.9 (event-driven)** When the child answers, the system shall animate the
mascot differently for success and for failure.

### Acceptance criteria

```gherkin
Feature: Mascot dialogue

  Scenario: Every mascot has its own voice
    Given the child chose "Bigodes"
    When a question appears
    Then the bubble shows a phrase from the cat pool
    And the phrase contains placeholders already substituted

  Scenario: Praise varies
    Given the child answers five questions correctly
    Then the praise phrases are not all identical
    And no phrase repeats twice in a row

  Scenario: Placeholder substitution
    Given the question is "7 x 8" and the child is called "Maria"
    When the answer is revealed
    Then the bubble text contains "56"
    And the bubble text does not contain a raw placeholder such as "{produto}"

  Scenario: Fallback phrases when the content file is missing
    Given "content.json" cannot be fetched
    When the child plays
    Then phrases are still shown
    And they come from the built-in fallback pool

  Scenario: Mascot reacts to the outcome
    Given a question is displayed
    When the child answers correctly
    Then the mascot plays the success animation
    When the child answers wrongly
    Then the mascot plays the failure animation
```

---

## US-9 — Host it for free and keep it private

**User story**

> As the parent or maintainer, I want the app to be free to host and to collect
> no data, so that I can share it without cost or privacy concerns.

### Requirements

**R9.1 (ubiquitous)** The system shall consist only of static files and shall
not require server-side code at runtime.

**R9.2 (ubiquitous)** The system shall be deployable to GitHub Pages from the
repository default branch and to Cloudflare Workers or Pages without a build
step.

**R9.3 (ubiquitous)** The system shall make no runtime request that carries user
data.

**R9.4 (ubiquitous)** The system shall not include analytics, tracking scripts
or third-party runtime libraries.

**R9.5 (optional feature)** Where Google Fonts is reachable, the system shall use
Roboto; otherwise it shall fall back to system fonts.

**R9.6 (ubiquitous)** The system shall be released under the MIT licence and
shall document the licence of every bundled asset.

**R9.7 (ubiquitous)** The system shall carry a stable application identifier
through `manifest.webmanifest`, allowing installation to the home screen.

### Acceptance criteria

```gherkin
Feature: Free hosting and privacy

  Scenario: Static deployment
    Given the repository is pushed to the hosting provider
    Then "index.html" loads without a build step
    And the game is playable

  Scenario: No tracking
    Given the app is loaded
    When the network panel is inspected
    Then the only external requests are to Google Fonts
    And no analytics or tracking request is made

  Scenario: No user data leaves the device
    Given the child has played several questions
    When the network panel is inspected
    Then no request body contains the child's name or progress

  Scenario: Font fallback
    Given Google Fonts is unreachable
    When the app loads
    Then the app renders with system fonts
    And the game is playable

  Scenario: Licence compliance
    Given the repository contents
    Then a "LICENSE" file states the MIT licence
    And the mascot folder contains the upstream MIT licence file

  Scenario: Installable
    Given the app is opened in a supporting browser
    Then the manifest provides a name, icons and a start URL
```

---

## Verification record

| Requirement group | Method | Result |
| --- | --- | --- |
| R1 (start flow) | Manual browser test, 320x568 and 390x844 | pass |
| R2 (attempts) | Manual browser test, correct and wrong paths, auto-advance timing observed | pass |
| R3 (selection) | Weight formula evaluated against recorded progress; probabilities computed from the pool | pass |
| R4 (statistics) | Manual browser test, including mascot change and hidden tab | pass |
| R5 (persistence) | Browser storage inspected; expiry simulated with a 25-hour-old timestamp | pass |
| R6 (themes, layout) | 320x568, 390x844 and desktop, light and dark; label overflow measured | pass |
| R7 (sound) | Oscillator count measured with sound on and off; network panel checked | pass |
| R8 (dialogue) | Phrases observed across mascots; fallback tested with `content.json` blocked | pass |
| R9 (hosting) | Deployed to GitHub Pages and configured for Cloudflare Workers | pass |

## Known gaps at the end of this iteration

- R9.5: Roboto is still fetched from Google Fonts. Self-hosting was considered
  and not done. Tracked as risk R3 in
  [quality-and-risks.md](../architecture/quality-and-risks.md).
- No automated tests. All verification above was manual. Tracked as debt D1.
- Offline start is not supported. Tracked as risk R4.
