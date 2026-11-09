# Documentation

Documentation for **Tabuada 12**, versioned with the code (docs-as-code).

- Live app: <https://tabuada12.miguelduarte.eu/>
- Repository: <https://github.com/mcduarte2000/tabuada12>

## Index

- [Architecture](./architecture/README.md) — context, building blocks, quality,
  risks and architectural decisions.
- [Requirements](./requirements/README.md) — user stories, EARS requirements and
  Gherkin acceptance criteria, one file per closed iteration.
- [Tests](./tests/README.md) — the regression suite and the defects it
  protects against.
- [Levels](./levels.md) — the six levels: facts, time limits, equations and
  how each one is unlocked.
- [Backlog](./backlog.md) — investigated ideas that are deliberately not
  scheduled, such as publishing on F-Droid.
- [Changelog](../CHANGELOG.md) — released versions and pending changes.

## Conventions

All documents follow the rules in [AGENTS.md](../AGENTS.md):

- English content, short sentences, active voice.
- Lowercase, kebab-case, ASCII file names.
- C4 model diagrams in Mermaid, starting at context level.
- Decisions recorded as MADR ADRs, one file per decision.
- Relative links only.

## Scope

This folder describes the **software architecture**. User-facing instructions
(how to run, how to deploy, licence, credits) stay in the
[root README](../README.md).
