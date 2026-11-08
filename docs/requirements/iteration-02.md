# Iteration 2 — Fits on one phone screen and survives large system fonts

* Status: completed
* Period: 2026-11-08

This iteration fixed two usability defects reported on a real Android phone:
the mascot picker pushed the play button off screen, and the operating system
font-size setting broke the header and the statistics panel.

## Scope

### In scope

- Horizontal mascot carousel replacing the 4-column grid.
- Guarantee that the profile setup fits a 360x640 phone screen without page
  scrolling.
- Correct behaviour with enlarged system font sizes.
- Fix the header clash between the title and the action buttons.
- Fix truncated statistic labels.
- Keep the sound toggle available in the setup screen.

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

## Verification record

| Requirement group | Method | Result |
| --- | --- | --- |
| R10 (carousel) | Browser test at 360x640 and 320x568; scroll width measured (2433 px content in 304 px viewport); page overflow measured as false | pass |
| R11 (large fonts) | Font sizes enlarged by an injected stylesheet to simulate the Android setting; label overflow measured with `scrollWidth` vs `clientWidth` | pass |
| Header overlap | Bounding boxes of title, subtitle and action buttons compared | pass |
| Sound toggle | Visibility checked before and after entering the mascot step | pass |

## Known gaps at the end of this iteration

- The simulation used injected CSS rather than a real Android device with the
  font-size accessibility setting. `TODO: confirm` on a physical device.
- The mascot carousel has no keyboard arrow navigation; Tab still reaches every
  option.
- At 320 px the subtitle occupies two lines, which slightly reduces the space
  available for the carousel. Acceptable, but worth revisiting if more vertical
  elements are added.
