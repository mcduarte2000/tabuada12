# AGENTS.md

Instructions for contributors and AI agents. This file is the contract: it says
how to work here and where everything lives. Detail lives in
[`CONTRIBUTING.md`](CONTRIBUTING.md) and [`docs/`](docs/README.md).

## Project

**Tabuada 12** is a free, static web app that helps children practise
multiplication tables from 1 to 12. A chosen animal mascot asks random questions,
the child gets two attempts, and wrong answers are revisited more often.

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
```

An HTTP server is required, not optional: `content.json` is loaded with `fetch`,
which is blocked on `file://`.

CI runs both suites on every push: [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Where things live

| Path | What it is |
| --- | --- |
| `index.html`, `styles.css` | the single page and its Material Design 3 styles |
| `app.js` | all game logic, one IIFE, ES5 |
| `mascots.js` | mascot list and fallback phrases |
| `content.json` | per-mascot phrases, editable, fetched at runtime |
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
- **`docs/levels.md` and `LEVELS` change together**; the suite compares them.
- **Bump `VERSION` in `sw.js`** in the same commit as any precached file change.

Full rules: [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Do not touch without an ADR

- **No dependencies, no build step, no framework.** Adding one requires an ADR.
- **No backend, no analytics, no tracking.** State stays in the browser.
- **No third-party runtime script.** The only external request is Google Fonts.
- **Generated or vendored files**: `assets/mascots/fluent/` and its licence file.
  Replace them only as a whole set, and update `LICENSE` in the same commit.
- **Published git tags.** Never rewrite one; cut a patch version instead.

## Before you commit

```sh
node tests/regression.js
python3 tests/validate-docs.py .
git status --porcelain     # confirm only intended files are staged
```

Both suites must pass. If a document and the code disagree, fix one before
closing: the suite checks the pairs that matter, not the prose.
