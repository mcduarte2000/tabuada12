# 0010. Play traditional music from note data with a vendored Tone.js

* Status: accepted
* Date: 2026-11-11

## Context and problem statement

Children asked for music while they practise, and a parent asked for a
radio-style player with a choice of instrument. Music was deliberately left out
earlier: iterations 1 and 2 scoped it away, and ADR-0007 notes that an
intermediate version was removed to keep the experience calm and the code small.
Reinstating it therefore reverses a recorded decision and needs a new record.

Three constraints bear on how, not just whether:

- **No third-party runtime request** (ADR-0002, ADR-0008). The app is precached
  and must work offline.
- **No build step and no `package.json`.**
- **Licensing.** The project is MIT. Recordings and modern arrangements carry
  rights. Only the plain traditional melodies are safe, and they must be
  documented with source and credit.

The music must also be pleasant enough that a child leaves it on, which rules
out a single beeping oscillator reused for every tune.

## Considered options

### Option A: Synthesise melodies with the built-in Web Audio API

Pros: no dependency, no new file, reuses the `AudioContext` already created for
feedback sounds; about 6 KB of note data.

Cons: every instrument has to be hand-built from oscillators and filters. The
result sounds like a toy keyboard. Polyphony, envelopes and scheduling are
manual work, and the manual scheduler is exactly where defects appear.

### Option B: Vendor Tone.js and drive it with note data

Pros: a mature scheduler (`Tone.Part`, `Tone.Transport`) that handles timing and
polyphony; several built-in synthesis models that make an audible difference
between instruments; MIT licensed; vendored locally, so still no runtime request.

Cons: `Tone.js` is about 341 KB minified, roughly five times the size of all the
app's own JavaScript; it is a dependency, which AGENTS.md forbids without an ADR; and its API
has traps: a `Part` given `[note, duration]` arrays schedules nothing useful,
numeric times are seconds while `loopEnd` strings are parsed differently, and
leftover Parts on the shared Transport bleed into the next tune.

### Option C: Ship recorded audio files

Pros: best sound quality.

Cons: recording rights are the hard problem, files are large, and offline
precaching of many audio files is wasteful. Rejected on licensing grounds.

## Decision outcome

We chose **Option B**, with the dependency contained.

- `assets/vendor/tone/Tone.js` is redistributed byte-identical from cdnjs at
  version 14.8.49, with its MIT licence beside it in
  `assets/vendor/tone/LICENSE.md`. It is precached, so the app makes no
  third-party request and keeps working offline.
- Melodies live in `assets/music/tracks.js` as `[note, duration]` pairs. They
  were **generated at authoring time** from public ABC notation using `music21`
  in a throwaway virtualenv; `music21` never ships. The data file carries the
  source URL, country, era, credit and a one-line history for each tune.
- `music.js` owns all audio. It exposes `window.MusicEngine` and contains no game
  logic, so a music fault cannot break a question. `app.js` is untouched by it.
- Eight instruments are offered: triangle, flute, bell, music box, piano,
  guitar, ukulele and clarinet. Piano is the default.
- Music starts **off**, never autoplays, and the play/stop choice is stored in a
  cookie named `tabuada12_music`, alongside the app's other preferences.

### Consequences

* Positive: the app gets music that sounds like instruments rather than beeps,
  with a scheduler maintained by someone else.
* Positive: no runtime request, no build step, and the licence position of every
  tune is recorded in `LICENSE`.
* Positive: audio is isolated in one module with a narrow interface, so the game
  suite cannot be broken by a music change.
* Negative / risks: the bundle grows by about 341 KB, roughly five times the
  size of the project's own JavaScript. On a slow connection the first visit is heavier.
* Negative / risks: Tone.js introduces a dependency and a version to watch. It is
  pinned and vendored, so an upstream release cannot break the app, but a
  security fix must be applied by hand.
* Negative / risks: the shared `Tone.Transport` requires every track change to
  dispose the previous Parts before moving the transport. Getting this wrong is
  audible as stray notes, and it happened once during development (R17).
* Negative / risks: the melodies are only as good as their ABC sources. They are
  generated, not hand-checked note by note, so an error would come from the
  source transcription.
