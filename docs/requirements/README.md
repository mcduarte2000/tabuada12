# Requirements

Requirements for **Tabuada 12**, grouped by development iteration. One file per
iteration, written when the iteration closes.

## Index

| Iteration | Title | Status | Document |
| --- | --- | --- | --- |
| 1 | Playable multiplication game | completed | [iteration-01.md](./iteration-01.md) |
| 2 | One-screen setup and large-font support | completed | [iteration-02.md](./iteration-02.md) |

## Why this folder exists

The architecture documents describe *how* the system is built. This folder
records *what* was asked for and *how it was verified*. Keeping them apart means
a requirement can be traced to an ADR and to code without mixing product intent
with design rationale.

## Requirement format

Every requirement uses three layers, in English:

1. **User story** — who wants what, and why.
2. **EARS requirements** — testable statements using the
   [EARS](https://alistairmavin.com/ears/) patterns:
   - *Ubiquitous*: "The system shall ..."
   - *Event-driven*: "When ..., the system shall ..."
   - *State-driven*: "While ..., the system shall ..."
   - *Optional feature*: "Where ..., the system shall ..."
   - *Unwanted behaviour*: "If ..., then the system shall ..."
3. **Acceptance criteria** — Gherkin scenarios (`Given` / `When` / `Then`) that
   a tester can execute without reading the code.

Identifiers are stable: `R<iteration>.<n>` for a requirement and `US-<n>` for a
user story. Never renumber a requirement; if it is dropped, mark it as removed.

## Iteration status values

| Status | Meaning |
| --- | --- |
| planned | Agreed, not started |
| in progress | Being implemented |
| completed | Implemented and verified against the acceptance criteria |
| removed | Dropped or replaced; kept for traceability |

## Rules

- Add one file per iteration, `iteration-NN.md`, zero-padded.
- Write the file when the iteration closes, not when it starts.
- Acceptance criteria must reflect observed behaviour, not intentions. When the
  code and the criterion disagree, fix one of them before marking the iteration
  completed.
- Update the index table and `CHANGELOG.md` in the same commit.
