# Iteration 2 — Fits on one phone screen and survives large system fonts

* Status: completed
* Period: 2026-11-08

This iteration fixed usability defects reported on a real Android phone: the
mascot picker pushed the play button off screen, the operating system font-size
setting broke the header and the statistics panel, the carousel had no
affordance, and the app title was truncated by the action buttons.

## Scope

### In scope

- Horizontal mascot carousel replacing the 4-column grid.
- Guarantee that the profile setup fits a 360x640 phone screen without page
  scrolling.
- Correct behaviour with enlarged system font sizes.
- Fix the header clash between the title and the action buttons.
- Fix truncated statistic labels.
- Keep the sound toggle available in the setup screen.
- Signal that the mascot row scrolls horizontally.
- Render the app title on its own line, with the application icon in the
  header before a mascot is chosen.

### Out of scope

- Offline support.
- Localisation.
- Native packaging.

---

## US-10 — Pick a mascot without losing the play button

**User story**

> As a child, I want to swipe through the mascots and always see the play
> button, so that I can start playing without hunting for it.

### Requirements

**R10.1 (ubiquitous)** The system shall present the mascot options in a single
horizontally scrollable row.

**R10.2 (event-driven)** When the child swipes the mascot row, the system shall
scroll only that row and shall not scroll the page vertically.

**R10.3 (state-driven)** While the mascot row is displayed, the system shall
snap each mascot to the start of the visible area after a swipe.

**R10.4 (state-driven)** While the mascot row overflows, the system shall hide
the scrollbar without removing scrollability.

**R10.5 (ubiquitous)** The system shall keep the mascot presentation bubble and
the play button visible below the row at all times, without vertical page
scrolling, on a 360x640 viewport.

**R10.6 (event-driven)** When the child taps a mascot anywhere in the row, the
system shall select it and scroll it into view.

### Acceptance criteria

```gherkin
Feature: Horizontal mascot picker

  Scenario: All mascots are reachable by swiping
    Given the mascot step is visible on a 360x640 viewport
    Then 30 mascot options exist in the row
    And the row is horizontally scrollable
    And the row is not vertically scrollable
    When the child swipes the row to the end
    Then the last mascot "Bolhinha" is reachable

  Scenario: Nothing is pushed off screen
    Given the mascot step is visible on a 360x640 viewport
    Then the mascot presentation bubble is visible
    And the play button is fully visible
    And the page does not scroll vertically

  Scenario: Selecting a mascot outside the viewport
    Given the mascot row has been swiped
    When the child taps a visible mascot
    Then that mascot is marked as selected
    And the play button is enabled
```

---

## US-11 — Read the app with enlarged system fonts

**User story**

> As a child or parent using a phone with large text enabled, I want every label
> to stay readable and nothing to overlap, so that I can use the app like
> everyone else.

### Requirements

**R11.1 (ubiquitous)** The system shall use unitless line heights so that text
boxes grow with the font size instead of clipping.

**R11.2 (state-driven)** While the header subtitle needs more than one line, the
system shall wrap it up to two lines instead of truncating it with an ellipsis.

**R11.3 (ubiquitous)** The system shall keep the header title fully visible and
shall never let the action buttons overlap it.

**R11.4 (state-driven)** While the statistic labels do not fit in one row, the
system shall allow the statistic items to wrap onto a second row rather than
truncate a label.

**R11.5 (ubiquitous)** The system shall keep the game screen fully usable at
320x568 with enlarged text: question, keypad and all five statistics visible
without horizontal scrolling.

**R11.6 (event-driven)** When the child starts a game, the system shall keep the
sound toggle visible; changing mascot from the game screen shall not hide it.

### Acceptance criteria

```gherkin
Feature: Large system fonts

  Scenario: Subtitle wraps instead of being cut
    Given the operating system uses an enlarged font size
    When the app loads on a 360 px wide viewport
    Then the subtitle reads "Treina a tabuada do 1 ao 12"
    And it occupies at most two lines

  Scenario: Title is never covered
    Given the operating system uses an enlarged font size
    When the game screen is displayed
    Then the title "Tabuada 12" is fully visible
    And no action button overlaps the title

  Scenario: Statistics stay readable
    Given the operating system uses an enlarged font size
    When the game screen is displayed
    Then all five labels are readable
    And no label is truncated with an ellipsis

  Scenario: Narrow game screen with large text
    Given a 320x568 viewport with enlarged fonts
    When a question is displayed
    Then the question, the keypad and the five statistics are visible
    And no horizontal scrolling is required

  Scenario: Sound toggle survives a mascot change
    Given the child is playing
    When the child opens the mascot step and returns to the game
    Then the sound toggle is still visible
```

---

## US-12 — Spot that the mascot row can be swiped

**User story**

> As a child, I want a visible hint that more mascots exist to the right, so
> that I do not assume the four visible ones are all there is.

### Requirements

**R12.1 (state-driven)** While the mascot row can scroll further right, the
system shall show a hint that more options are available.

**R12.2 (state-driven)** While the mascot row is at its rightmost position, the
system shall hide the hint.

**R12.3 (ubiquitous)** The system shall show a progress indicator below the row
that represents both the visible portion and the current scroll position.

**R12.4 (event-driven)** When the child scrolls the row, the system shall update
the page indicators and the hint without animation jank.

**R12.4a (ubiquitous)** The system shall indicate the current position with one
dot per visible page, rather than a continuous progress bar, because a single
swipe moves a small fraction of a 2400 px row and a bar looks static.

**R12.5 (ubiquitous)** The system shall render a gradient fade at the right edge
while more content is available in that direction.

**R12.7 (ubiquitous)** The system shall allow horizontal dragging with a pointer
or a finger, and shall not swallow a tap that follows no movement.

**R12.8 (event-driven)** When the child presses Arrow Left or Arrow Right while
a mascot option has focus, the system shall scroll the row by one screen.

**R12.9 (unwanted behaviour)** If a pointer gesture moved more than four pixels,
then the system shall treat it as a drag and not as a mascot selection.

**R12.6 (event-driven)** When a mascot is selected, the system shall scroll it
into view if it is outside the visible area.

### Acceptance criteria

```gherkin
Feature: Mascot row affordance

  Scenario: Hint is visible at the start
    Given the mascot step is visible
    And the row can scroll to the right
    Then the text "Desliza para ver mais" is visible
    And a right-edge gradient is visible

  Scenario: Hint disappears at the end
    Given the mascot step is visible
    When the child scrolls the row to the rightmost position
    Then the hint is hidden
    And the right-edge gradient is hidden

  Scenario: Progress indicator tracks position
    Given the row is at the start
    Then the indicator sits at the left
    When the child scrolls to the middle
    Then the indicator moves right proportionally

  Scenario: Selected mascot is brought into view
    Given the row is scrolled to the end
    When the child selects the first mascot by keyboard
    Then the row scrolls back so that mascot is visible
```

---

## US-13 — Read the app title on a phone

**User story**

> As a user on a phone with a custom launcher font, I want to read the full app
> title, so that I know which app I opened.

### Requirements

**R13.1 (ubiquitous)** The system shall render, in every screen, a header pinned
to the top of the page with two rows: the application icon and app title
aligned left on the first, the action buttons aligned right on the second.

**R13.2 (state-driven)** While the title is wider than the available space, the
system shall wrap or shrink it rather than truncate it with an ellipsis.

**R13.3 (ubiquitous)** The application icon in the header shall be static, so
that the header never changes with the chosen mascot.

**R13.4 (state-driven)** While the header subtitle does not fit on one line, the
system shall wrap it to at most two lines.

**R13.5 (state-driven)** While the game is running, the header shall show only
the app title and the action buttons; the mascot and its name live beside the
speech bubble instead.

**R13.6 (ubiquitous)** The system shall show the speaking mascot's name directly
under its image, in both the setup preview and the game.

### Acceptance criteria

```gherkin
Feature: Header legibility

  Scenario: Two header rows, title left and buttons right
    Given the app is open on a 360x640 viewport
    Then the application icon and "Tabuada 12" share the first row, aligned left
    And the action buttons are on the row below, aligned right
    And the header sits at the top of the page, not vertically centred

  Scenario: Static application icon
    Given the header is visible on the setup screen
    When the child starts a game
    Then the header still shows the application icon
    And the chosen mascot appears beside the speech bubble instead

  Scenario: Subtitle wraps at 320 px
    Given a 320 px wide viewport
    Then the subtitle reads in full
    And it occupies at most two lines
```

---

## US-14 — Every mascot introduces itself differently

**User story**

> As a child, I want each animal to greet me in its own way, so that choosing a
> different mascot actually feels different.

### Requirements

**R14.1 (ubiquitous)** The system shall provide at least five greeting lines per
mascot.

**R14.2 (event-driven)** When a mascot is selected, the system shall pick one
greeting at random from that mascot's own pool.

**R14.3 (ubiquitous)** The first greeting of every mascot shall be different from
the first greeting of every other mascot.

**R14.4 (unwanted behaviour)** If `content.json` is unavailable or holds a single
string instead of a list, then the system shall fall back to a generic greeting
for that mascot.

### Acceptance criteria

```gherkin
Feature: Individual mascot greetings

  Scenario: Selecting two mascots shows different lines
    Given the mascot step is visible
    When the child selects "Bigodes"
    Then the bubble shows one of the cat greetings
    When the child selects "Sabichona"
    Then the bubble shows one of the owl greetings
    And it differs from the cat line

  Scenario: Greetings rotate
    Given a mascot with five greetings
    When the child selects it several times across visits
    Then different greetings can appear

  Scenario: Fallback without the content file
    Given "content.json" cannot be fetched
    When the child selects a mascot
    Then a generic greeting that names the mascot is shown
    And no raw placeholder is displayed
```

## US-15 — Choose a fun name instead of a real one

**User story**

> As a parent, I want the app to ask for a nickname instead of a real name, so
> that my child does not type personal data into it.

### Requirements

**R15.1 (ubiquitous)** The system shall ask for a fun game name, give examples
(a favourite animal or superhero) and state that the real name must not be
used, all in a single sentence.

**R15.2 (ubiquitous)** The system shall label the field as a game name, not as a
first name.

**R15.3 (unwanted behaviour)** If the entry contains a space, then the system
shall refuse it and explain that only one word is allowed, because a first and
last name is the shape of a real name.

**R15.4 (ubiquitous)** The system shall disable browser autofill for personal
names on the field.

**R15.5 (event-driven)** When a valid game name is submitted, the system shall
use it in the mascot dialogue and store it as before.

### Acceptance criteria

```gherkin
Feature: Nickname instead of a real name

  Scenario: The field asks for a game name
    Given the app loads with no saved profile
    Then the text "Não escrevas o teu nome verdadeiro" is visible
    And the field label is "Nome de jogo"
    And the field does not request autofill of a personal name

  Scenario: A two-word entry is refused
    Given the name step is visible
    When the child submits "Maria Silva"
    Then an error explains that only one word is allowed
    And the app stays on the name step

  Scenario: A nickname is accepted
    Given the name step is visible
    When the child submits "Foguetão"
    Then the mascot step is shown
    And the mascot uses "Foguetão" in its greeting
```

## US-16 — Read the licence and privacy policy in the app

**User story**

> As a parent, I want to see, inside the app, which licence it uses and what
> happens to my child's data, so that I can trust it without reading the
> repository.

### Requirements

**R16.1 (ubiquitous)** The system shall provide an information control in the
header, available on every screen.

**R16.2 (event-driven)** When the parent activates the information control, the
system shall open a dialog titled "Sobre esta aplicação", scrolled to the top
so that the Privacidade section is the first thing shown.

**R16.3 (ubiquitous)** The dialog shall state that data stays on the device,
that there are no accounts, servers, analytics, advertising or third-party
scripts, and that the only external request is the Roboto typeface.

**R16.4 (ubiquitous)** The dialog shall state the retention periods: one year
for the nickname and mascot, 24 hours for progress.

**R16.5 (ubiquitous)** The dialog shall name the project licence (MIT) and each
third-party item with its licence: Fluent Emoji (MIT), Roboto (Apache 2.0) and
Material Design 3 (Apache 2.0).

**R16.9 (ubiquitous)** The licence section shall end with a link to the source
repository, opened in a new tab with `rel="noopener noreferrer"`.

**R16.6 (event-driven)** When the dialog is dismissed by its button, the backdrop
or Escape, the system shall return focus to the page without losing game state.

**R16.7 (unwanted behaviour)** If a digit or Enter is pressed while the dialog is
open, then the system shall not forward it to the game.

**R16.8 (optional feature)** Where the viewport is tall enough to show the
footnote, the system shall also expose a "Licença e privacidade" link there.

### Acceptance criteria

```gherkin
Feature: Licence and privacy information

  Scenario: Opening the information dialog
    Given the game is running
    When the parent presses the information button
    Then a dialog titled "Sobre esta aplicação" opens
    And it states that nothing leaves the device
    And it states the MIT licence and the Apache 2.0 items

  Scenario: Keyboard does not leak into the game
    Given the dialog is open on the game screen
    When the parent presses the digit 5
    Then the answer box does not change

  Scenario: Closing the dialog
    Given the dialog is open
    When the parent presses "Fechar"
    Then the dialog closes
    And the game is still on the same question

  Scenario: Source code is reachable
    Given the information dialog is open
    When the parent scrolls the licence section to the end
    Then a link labelled "Ver o código no GitHub" is visible
    And it points at the repository
    And it opens in a new tab without opener access

  Scenario: Dialog fits a small phone
    Given a 320x568 viewport
    When the dialog opens
    Then it fits the viewport
    And its body scrolls internally
```

---

## Verification record

| Requirement group | Method | Result |
| --- | --- | --- |
| R10 (carousel) | Browser test at 360x640 and 320x568; scroll width measured (2433 px content in 304 px viewport); page overflow measured as false | pass |
| R11 (large fonts) | Font sizes enlarged by an injected stylesheet to simulate the Android setting; label overflow measured with `scrollWidth` vs `clientWidth` | pass |
| Header overlap | Bounding boxes of title, subtitle and action buttons compared | pass |
| R12 (carousel affordance) | Browser test: indicator width/transform and hint visibility measured before and after scrolling to the end | pass |
| R13 (header) | Browser test at 360x640 and 320x568; title overflow and subtitle line count measured | pass |
| R12.4a-12.9 (carousel) | Automated regression suite, touch emulation with `Input.dispatchTouchEvent`; scroll delta and active dot asserted | pass |
| R14 (greetings) | Automated regression suite: four mascots selected, greetings compared; static check over all 30 pools | pass |
| R15 (nickname) | Automated regression suite: static check for the privacy copy and missing `autocomplete="given-name"`; browser check that a two-word entry is refused | pass |
| R16 (licence and privacy) | Automated regression suite: static check that the controls and the required statements exist; browser checks for opening, closing and digit suppression | pass |
| Sound toggle | Visibility checked before and after entering the mascot step | pass |

## Known gaps at the end of this iteration

- The simulation used injected CSS rather than a real Android device with the
  font-size accessibility setting. `TODO: confirm` on a physical device.
- The mascot carousel has no keyboard arrow navigation; Tab still reaches every
  option.
- At 320 px the subtitle occupies two lines, which slightly reduces the space
  available for the carousel. Acceptable, but worth revisiting if more vertical
  elements are added.
- The carousel gesture was validated with emulated touch events in Chromium.
  `TODO: confirm` on a physical Android device after deploying.

## Defects found while writing the tests

| Defect | Cause | Fix |
| --- | --- | --- |
| Mascot taps stopped working | `setPointerCapture` fired on `pointerdown`, so the click reached the row instead of the button | Capture only after real movement; delegate clicks to the row |
| Only one page dot rendered | The dot count was computed before the mascot images loaded, when the row had no width | Recompute on image `load`, on fonts ready, and on resize |
| The bar looked frozen on Android | One swipe moves about 7 % of a 2400 px row, so a 3 px bar shifted a few pixels | Replaced the bar with page dots, which step visibly
