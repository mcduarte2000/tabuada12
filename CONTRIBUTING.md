# Contributing

Detail behind the contract in [`AGENTS.md`](AGENTS.md). Read that first; this
file explains each rule and how it is checked.

## Code

### Language level

`app.js` is ES5 inside one IIFE: `var`, `function`, no modules, no `let`, no
arrow functions, no template literals. The file is served as written, with no
transpiler and no bundler, so a modern-only syntax error is a runtime failure on
old devices with no build step to catch it.

The regression suite runs `node --check` on every script, which catches syntax
errors but not ES5 violations. Keep the habit: if a feature needs ES6, it needs an
ADR first.

### Comments

No comments, with two exceptions:

- A non-obvious browser quirk that a reader would otherwise "fix" incorrectly.
- A licensing fact that must travel with the code.

Both are rare. A comment that restates the code is noise.

### Reuse before you build

Before writing a tool, parser, converter or helper, search for one that already
exists. State where you looked and why the existing option was rejected. "I did
not check" is not a reason; neither is "it was quicker to write my own".

This applies to authoring-time work as much as to shipped code. A converter used
once to generate a data file is still a tool someone else has already written and
tested, and a hand-rolled version will silently produce wrong output. The ABC-to-
note-array generator for `assets/music/tracks.js` is the cautionary example: a
regex parser was written first and produced melodies that did not match the
sources, while `music21` parsed the same ABC correctly.

An authoring-time dependency may live in a throwaway environment (a virtualenv, a
temporary directory) and never ship. That keeps `AGENTS.md`'s "no dependencies"
rule intact: the rule is about what the browser downloads, not about what a
contributor runs to produce a file.

### Numbers

Every magic number lives in a constant block at the top of `app.js`:

```js
var STORAGE = { ... };
var COOKIE = { ... };
var PRIORITY = { ... };
var LEVELS = [ ... ];
var PROGRESS_TTL = 24 * 60 * 60;
```

When a number also appears in a document — `docs/levels.md`, a risk's mitigation,
a requirement — a test compares the two. The validator is
`tests/validate-docs.py`, and `docs/levels.md` is compared against `LEVELS` by the
regression suite.

### UI text

European Portuguese, short, active voice, addressed to a child. No jargon, no
passive constructions, no "por favor" filler. Timeout messages are full sentences:
"O tempo esgotou", not "Tempo".

### Accessibility

A gate, not a nice-to-have:

- Every interactive element is a `<button>` with an accessible name.
- Feedback goes through `aria-live` regions.
- `prefers-reduced-motion` disables confetti, ripples and animation.
- Focus is visible and focus order follows the reading order.
- Contrast comes from the Material Design 3 token pairs, never hand-picked.

### Browser verification

Before committing a UI change, open the app at 320x568, 390x844 and desktop, in
both themes, and use the real input method for the device you are testing
(touch on a phone, mouse and keyboard on desktop).

## Documentation

Documentation is versioned with the code. The rules below are enforced by
`tests/validate-docs.py` where a machine can check them, and by review where it
cannot.

### Structure

```
docs/
├── README.md                        index of everything
├── architecture/
│   ├── README.md
│   ├── overview.md                  arc42 1-4
│   ├── building-blocks.md           arc42 5-8
│   ├── quality-and-risks.md         arc42 10-11
│   └── adr/
│       ├── README.md
│       └── NNNN-slug.md
├── requirements/
│   ├── README.md
│   └── iteration-NN.md
├── tests/
│   └── README.md
├── levels.md                        the numeric specification
└── backlog.md                       investigated, unscheduled
```

Why `backlog.md` is at the docs root: research that rules an idea out is
expensive to repeat, and unscheduled work must stay out of `requirements/`, which
describes only what shipped.

Why `docs/tests/` exists although the runner is in `tests/`: the catalogue is
documentation, and keeping it beside the architecture and requirements means a
defect fix updates all three in the same commit.

Why `requirements/` is separate from `architecture/`: architecture says how the
system is built, requirements say what was asked and how it was verified. Mixing
them loses both.

Do not add folders beyond these without updating this file and the docs index.

### Naming

Lowercase, kebab-case, ASCII. `building-blocks.md`, never `Building_Blocks.md`.
ADRs are `NNNN-short-slug.md`, monotonic, never renumbered; gaps are acceptable
because a withdrawn decision keeps its number.

Root exceptions: `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `AGENTS.md`,
`LICENSE`.

Every folder has a `README.md` that indexes its contents with relative links.

### Diagrams

C4 model in Mermaid, embedded in Markdown.

- One diagram per fenced block, complete. Never a half-written block.
- A heading and a caption sentence before the fence, outside it.
- `Person` and `System_Ext` for people and external systems; the system under
  study as `System`. Label arrows with protocol or technology.
- Stop at container level. Code-level diagrams are noise for a project this size.
- Start with context. Add containers when there is more than one executable unit.
- Split anything above roughly ten elements.

### ADRs

MADR format, one file per decision:

```markdown
# NNNN. Imperative title

* Status: accepted
* Date: YYYY-MM-DD

## Context and problem statement

## Considered options

### Option A
Pros: ... / Cons: ...

### Option B
Pros: ... / Cons: ...

## Decision outcome

We chose X because ...

### Consequences

* Positive: ...
* Negative / risks: ...
```

Only hard-to-reverse decisions with real alternatives. A formatting convention is
not an ADR. When one replaces another, mark the old one
`superseded by ADR-MMMM` and link both ways.

### Requirements per iteration

One file per **closed** iteration, written after the work, describing what was
observed. Three layers, all in English:

1. **User story** — `US-n`: "As a ..., I want ..., so that ...".
2. **EARS requirement** — `R<iteration>.<n>` with the pattern named:
   Ubiquitous ("shall"), Event-driven ("When ..."), State-driven ("While ..."),
   Optional ("Where ..."), Unwanted ("If ... then ...").
3. **Gherkin** — `Feature` and `Scenario` with Given/When/Then, runnable by a
   tester without reading the code.

Also required: a **Verification record** table naming the method per group, a
**Known gaps** list, and a closing **Estado ao fechar** stating what is complete,
what is incomplete, and how to resume each incomplete item.

Never renumber requirements. Mark removed ones as removed. Update
`docs/requirements/README.md` and `CHANGELOG.md` in the same commit.

### Backlog

Investigated, deliberately unscheduled. Not a promise, not a roadmap. Each entry
states why it is deferred, what it would need, which decisions it would force, and
cites the sources checked. Nothing enters without verification against the real
upstream policy.

Promote to an iteration file when scheduled; delete and record the reason in an ADR
when dropped.

### Update discipline

Every iteration updates the whole set:

| Change | Documents |
| --- | --- |
| New behaviour | iteration file, `CHANGELOG.md` |
| New constraint or goal | `overview.md` |
| New or moved module | `building-blocks.md` |
| New, closed or changed risk | `quality-and-risks.md` |
| Hard-to-reverse decision | new ADR, supersede the old |
| New automated check | `docs/tests/README.md` |
| Numeric parameter | `docs/levels.md` **and** the constant |

If a file needed no change, say so when closing. Silence is indistinguishable from
a forgotten file.

## Third-party content and licensing

The project is MIT. `LICENSE` holds the MIT text, then a **Third-party notices**
section. The MIT text is never edited; notices are appended.

Every borrowed item records: work title, author, source URL, licence name, licence
URL, the files it covers, and any modification made. Vendored assets also keep
their upstream licence file beside them, for example
`assets/mascots/fluent/LICENSE-fluentui-emoji.md`.

Acceptable licences: CC0, CC BY, MIT, ISC, Apache 2.0, OFL. Rejected: CC BY-NC,
CC BY-ND, CC BY-SA (copyleft would force the whole project to that licence), and
anything described as "free" without a named licence.

When adding or removing third-party files, update `LICENSE` in the same commit.
`tests/validate-docs.py` checks both directions: every file on disk appears in the
notices, and every file listed exists.

## PWA

The app is installable (ADR-0008).

- `manifest.webmanifest` and `sw.js` are production files.
- **Bump `VERSION` in `sw.js` in the same commit as any change to a precached
  file.** Otherwise browsers serve the old shell and the change appears not to
  work. This is the most common "my fix did nothing" cause in this project.
- Add every new runtime file to `SHELL_FILES`. `cache.addAll` is atomic: one 404
  disables offline support entirely, and the suite checks every listed file exists.
- **Vendored libraries are not dependencies at build time.** Tone.js ships as a
  file in `assets/vendor/`, is precached like any other asset, and needs no
  install step. A new library still needs an ADR (see ADR-0010) and a licence
  entry in `LICENSE`.
- **Generated data is not hand-edited.** `assets/music/tracks.js` is produced
  from public ABC notation by an authoring-time script. Change the source, or
  change the entry through that script; editing notes by hand breaks the link to
  the recorded source. If `assets/music/tracks.js` is missing entirely the radio
  bar stays hidden and the game runs normally; a malformed entry inside it will
  throw when that tune is played, so the suite checks the shape of every melody.
- Icons: keep an `any` icon at 192 or 512 px, and a separate maskable icon with the
  artwork inside the centred 80 % safe zone.
- Test offline before committing: load once online, switch the network off, reload,
  confirm the setup screen renders with styles and all 30 mascots.

## Tests

`node tests/regression.js` must pass before any commit that changes behaviour. It
exits non-zero on failure.

- Static checks need no browser. Browser checks use Playwright when available,
  otherwise the system Chrome.
- **Defect first.** Write the check, watch it fail, then fix.
- **Real input.** Use `page.mouse` and `page.keyboard` for anything a person
  clicks or types. `element.click()` in page context bypasses hit testing,
  overlays and layout, so it passes on an unclickable UI.
- **Geometry assertions need a revert check.** After writing one, revert the fix
  and confirm it fails. Otherwise it may compare two elements that always move
  together.
- Never delete a check to make the suite pass. If a requirement changed, change the
  check and the requirement together.
- Name checks after the behaviour, not the function.
- Add the row to `docs/tests/README.md` naming the defect the check prevents, in
  the same commit.

## Versioning

`CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
[Semantic Versioning](https://semver.org/).

- New user-visible work goes under `[Unreleased]` and is promoted to a dated
  version on release.
- Promotion includes the comparison link at the bottom.
- Annotated tags `vX.Y.Z`, pushed separately from the branch.
- Breaking the stored-data format so old data cannot be read is a MAJOR change.
- Never rewrite a published tag. Cut a patch version instead.

### Version numbers mean

| Change | Version |
| --- | --- |
| Incompatible stored data, removed feature | MAJOR |
| New behaviour, backwards compatible | MINOR |
| Fix or internal change, no visible behaviour | PATCH |

## Git

- Commits are imperative and describe the change, not the file touched.
- One logical change per commit; documentation travels with the code it describes.
- Do not commit `.DS_Store`, editor folders, build output, or secrets.
- Do not commit a tag pointing at a commit that lacks part of what the changelog
  claims. Write the entry, then tag, then verify the tag resolves to a commit that
  contains everything.
