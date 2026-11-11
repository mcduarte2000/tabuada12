# AGENTS.md

Instructions for contributors and AI agents. This file is the contract: it says
how to work here and where everything lives. Detail lives in
[`CONTRIBUTING.md`](CONTRIBUTING.md) and [`docs/`](docs/README.md).

## Project

**Tabuada 12** is a free, static web app where children practise the
multiplication tables from 1 to 12. A chosen animal mascot asks random questions,
the child gets two attempts, and failed facts return more often.

- Live app: <https://tabuada12.miguelduarte.eu/>
- Repository: <https://github.com/mcduarte2000/tabuada12>
- Licence: MIT (see `LICENSE`)
- UI language: European Portuguese. Code, docs and ADRs: English.
- Exception: `README.md` and `CHANGELOG.md` stay in Portuguese, because they are
  the public project page.

## Install, run, test, build

There is no build step and no `package.json`. Plain files, served statically.

```sh
# run locally
python3 -m http.server 8000
# then open http://localhost:8000/
```

```sh
# tests: static checks always, browser checks when Playwright or system Chrome is present
node tests/regression.js

# documentation validator
python3 tests/validate-docs.py .
```

```sh
# "build" is a copy of the repository root; nothing is compiled or bundled
# deploy: push to main (GitHub Pages) or let Cloudflare Pages read the branch
# an HTTP server is required: content.json is fetched, which fails on file://
```

CI runs both suites on every push: [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Where things live

| Path | What it is |
| --- | --- |
| `index.html`, `styles.css` | the single page and its Material Design 3 styles |
| `app.js` | all game logic, one IIFE, ES5 |
| `mascots.js` | mascot list and fallback phrases |
| `content.json` | per-mascot phrases, editable, fetched at runtime |
| `music.js` | music engine and the radio bar; no game logic |
| `assets/music/tracks.js` | the 18 tunes, generated from public ABC; never hand-edited |
| `assets/vendor/tone/` | Tone.js and its MIT licence |
| `musicas.html`, `musicas.js`, `musicas.css` | the music page |
| `sw.js`, `manifest.webmanifest` | PWA shell and metadata |
| `assets/` | icons, screenshots, mascot SVGs, vendored licences |
| `tests/regression.js` | regression suite |
| `tests/validate-docs.py` | documentation validator |
| `docs/architecture/overview.md` | goals, constraints, context, strategy |
| `docs/architecture/building-blocks.md` | module map, runtime, deployment |
| `docs/architecture/quality-and-risks.md` | quality, risks, debt |
| `docs/architecture/adr/` | one file per hard-to-reverse decision |
| `docs/requirements/iteration-NN.md` | one file per closed iteration |
| `docs/levels.md` | the six levels: facts, time limits, equations |
| `docs/tests/README.md` | every check, and the defect it prevents |
| `docs/backlog.md` | investigated, deliberately unscheduled |
| `CONTRIBUTING.md` | code, documentation and licensing rules |

## Conventions in one screen

- **ES5 only** in `app.js`: `var`, `function`, one IIFE, no modules. No comments
  except for a non-obvious browser quirk or a licensing fact.
- **One source of truth for numbers** at the top of `app.js`: `STORAGE`,
  `COOKIE`, `PRIORITY`, `LEVELS`, TTL constants.
- **UI text** is pt-PT, short, active voice, child-facing.
- **Accessibility is a gate**: every control is a `<button>` with an accessible
  name, feedback uses live regions, `prefers-reduced-motion` is honoured.
- **Tests first for defects**: write the failing check, watch it fail, then fix.
- **Reuse before you build**: search for an existing tool, library or dataset
  before writing your own. State the search you did and why the existing
  option was rejected. A dependency that only runs at authoring time may live
  in a throwaway environment and never ships; see
  [`CONTRIBUTING.md`](CONTRIBUTING.md#reuse-before-you-build).
- **`docs/levels.md` and `LEVELS` change together**; the suite compares them.
- **Bump `VERSION` in `sw.js`** whenever a precached file changes, same commit.
- **Never trust a cached build.** A registered service worker serves the old
  `app.js`, so a fix can look broken or a bug can look fixed. Verify with
  `sw.js` blocked or the worker unregistered, or the result means nothing.
- **Never quote a number you did not measure.** Test counts and sizes in docs
  come from the run that just happened, never from an estimate.

Full rules: [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Do not touch without an ADR

- **No dependencies, no build step, no framework.** Adding one requires an ADR.
- **No backend, no analytics, no tracking.** State stays in the browser.
- **No third-party runtime script.** The app makes no external request at all:
  every asset, font and library is vendored and precached.
- **Generated or vendored files**: `assets/mascots/fluent/` and its licence file.
  Replace them only as a whole set, and update `LICENSE` in the same commit.
- **Published git tags.** Never rewrite one; cut a patch version instead.

## Before you commit

```sh
node tests/regression.js
python3 tests/validate-docs.py .
git status --porcelain     # confirm only intended files are staged
```

Both suites must pass **on a clean tree**. They also pass on a dirty tree, and
that hides real failures: the version check only fires once everything is
committed. Commit first, re-run both suites, and only then push and tag.

The version number lives in three places and they must agree: `APP_VERSION` in
`app.js`, the `<strong id="appVersion">` text in `index.html`, and the top entry
in `CHANGELOG.md`. The suite compares all three.

If a document and the code disagree, fix one before closing: the suite checks
the pairs that matter, not the prose.

### Stop and ask, do not guess

Mistakes already made here. When one applies, stop and ask, do not choose:

- **Splitting uncommitted work into several commits.** If two iterations share
  files, say so and commit them together; never fabricate an intermediate state
  to make the history look tidy.
- **Inventing a release.** A version that only ever existed in an uncommitted
  working tree was not released. Check `git tag` against `HEAD` before writing
  a changelog entry, and never describe a number as shipped until it is tagged.
- **Changing behaviour past what was asked.** Restricting the keypad further than
  requested, or adding autoplay "because it remembers the choice", are both real
  examples. Implement the request, then state the trade-off you noticed.
