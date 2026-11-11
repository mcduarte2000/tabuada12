# Iteration 6 — Traditional music, a radio bar and a music page

* Status: completed
* Period: 2026-11-11
* Shipped in: v1.8.0

Children asked for music while they practise. The request grew into a small
player with a choice of instrument, a radio-style bar on the game screen, and a
separate page describing every tune. Music had been deliberately removed twice
before (iterations 1 and 2), so this iteration also records why it comes back;
see [ADR-0010](../architecture/adr/0010-vendored-tonejs-music.md).

## Summary

| Metric | Value |
| --- | --- |
| User stories | 3 (US-28, US-29, US-30) |
| EARS requirements | 11 |
| Gherkin scenarios | 8 |
| Automated checks | 128 → 146 (90 static, 56 browser) |
| Defects found and fixed | 6 in this iteration, plus 2 carried from iteration 5 |
| New dependencies | 1 (Tone.js 14.8.49, vendored, MIT) |
| External runtime requests | 0 → 0 |

## Scope

### In scope

- Eighteen traditional melodies, synthesised on the device.
- A radio bar on the game screen with play/stop, track name, instrument and
  volume.
- A music page reachable from the information dialog.
- Credits for every tune, in the app and in `LICENSE`.

### Out of scope

- Recorded music, which is rejected on licensing grounds.
- Lyrics, which would need a separate rights review.
- Music during the setup screens.

---

## US-28 — Hear music while playing

**User story**

> As a child, I want music while I practise, so that the game feels less like a
> test.

### Requirements

**R28.1 (ubiquitous)** The system shall play traditional melodies from note data
synthesised on the device, with no audio files and no network request.

**R28.2 (state-driven)** While music is playing, the system shall show the title
of the current tune on the game screen.

**R28.3 (unwanted behaviour)** If the music is not enabled, then the system shall
not start playing on page load or on the first interaction.

**R28.4 (event-driven)** When the child leaves the game screen, the system shall
stop the music.

**R28.5 (state-driven)** While the game screen is not visible, the system shall
not expose music controls.

### Acceptance criteria

```gherkin
Feature: Music on the game screen

  Scenario: Starting the music
    Given the game screen is showing
    And the music is stopped
    When the child presses Tocar
    Then music is audible
    And the button becomes Parar
    And the title of the tune is shown

  Scenario: Music never starts by itself
    Given the music was left playing on a previous visit
    When the app loads and the child moves through the setup screens
    Then no music is audible
    And the button still reads Tocar

  Scenario: Leaving the game
    Given music is playing
    When the child returns to the setup screen
    Then the music stops

  Scenario: The bar is only on the game screen
    Given the app is on the name or mascot step
    Then no music bar is visible
```

---

## US-29 — Choose how the music sounds

**User story**

> As a child, I want to pick the instrument, so that the music sounds the way I
> like.

### Requirements

**R29.1 (ubiquitous)** The system shall offer at least eight instruments and
shall default to the piano.

**R29.2 (event-driven)** When the child changes the instrument, the system shall
apply it to the tune that is playing and remember it for the next visit.

**R29.3 (ubiquitous)** The system shall keep every instrument at a comparable
loudness, so none is effectively inaudible.

### Acceptance criteria

```gherkin
Feature: Instrument choice

  Scenario: Changing instrument while playing
    Given music is playing with the piano
    When the child selects Guitarra
    Then the same tune continues with the new sound
    And the choice is remembered after a reload

  Scenario: Balanced loudness
    Given each of the eight instruments
    Then each produces a measurable signal at the output
```

---

## US-30 — Know what the music is

**User story**

> As a parent, I want to know where each melody comes from and who wrote it, so
> that the credits are honest and the app is safe to publish.

### Requirements

**R30.1 (ubiquitous)** The system shall list every tune with its country, era,
credit and a short history, on a page reachable from the information dialog.

**R30.2 (event-driven)** When the child presses play on a tune in that page, the
system shall play that tune only.

**R30.3 (ubiquitous)** The system shall record the source of every melody and the
licence of every third-party file in `LICENSE`.

### Acceptance criteria

```gherkin
Feature: The music page

  Scenario: Reading about a tune
    Given the music page is open
    Then every tune shows its title, country, era and credit
    And every tune has a play button

  Scenario: Playing one tune
    When the child presses play on La Cucaracha
    Then La Cucaracha plays
    And no other row shows as playing
```

---

## Defects found and fixed

| Defect | Cause | Fix |
| --- | --- | --- |
| A key press looked accepted but did nothing | (iteration 5) | (see iteration-05) |
| The countdown froze or expired without a miss | (iteration 5) | (see iteration-05) |
| **Stray notes played over the next tune** | The previous tune's `Tone.Part` objects stayed attached to the shared `Tone.Transport` for 100 ms after the next one started, so old notes re-fired at the wrong position | Dispose every Part before the Transport moves; reset position and cancel scheduled events |
| **No sound at all** | `Tone.start()` was called without awaiting it, so the context stayed `suspended` | Await the promise before scheduling |
| **A `Part` returned by `[note, duration]` scheduled nothing** | Tone.js treats the pair as a single event, not a note list | Build explicit `[time, {note, duration}]` events |
| **Every tune played at the wrong tempo, or started mid-way** | Event times were baked in seconds while the Transport was never reset between tracks | Compute times from the transport's own clock and reset it per track |
| **The music restarted on the mascot step** | The "remember my choice" gesture handler called `startRadio()` on the first tap anywhere, including the name form | The first gesture now only unlocks the audio context; only the play button starts sound |
| **Music kept playing after leaving the game** | Hiding the screen did not stop the scheduler | Observe the game screen's `hidden` attribute and stop when it hides |
| Guitar and ukulele were nearly silent | `PluckSynth` output is roughly 60× lower than a plain oscillator | Per-voice gain stage |

## Verification

Both suites pass:

```sh
node tests/regression.js      # 90 passed, 0 failed
python3 tests/validate-docs.py .   # 24 passed, 0 failed
```

Browser checks were run against a cache-free server so a stale service worker
could not make a broken build look correct:

- Fresh visit with the cookie set to `on`: silent on the name step, the mascot
  step and the game screen, until the play button is pressed.
- Play produces a measurable signal at the destination, shows the tune title and
  switches the button to Parar; stop silences it and returns the button.
- Leaving the game silences the music; returning does not resume it on its own.
- Each of the eight instruments produces a measurable signal, between 0.054 and
  0.158 peak, so none is effectively inaudible.
- The music page lists all 18 tunes with country, era and credit, and plays one
  tune at a time from its own row.
- At 320 px wide the radio bar fits with no horizontal overflow, and the whole
  game screen still fits one phone screen.
