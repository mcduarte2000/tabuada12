# 0002. Use plain HTML, CSS and ES5 JavaScript without a build step

* Status: accepted
* Date: 2026-11-08

## Context and problem statement

The app is a single screen with a numeric keypad, one question at a time and a
list of mascots. A framework is not needed for this amount of state. However,
modern tooling expects a bundler, a transpiler, a lockfile and a lockfile
upgrade cadence.

The maintainer wants the repository to be readable and runnable by a beginner,
and the app must keep working for years without reinstalling dependencies.

## Considered options

### Option A: Plain HTML, CSS and ES5 JavaScript

Pros: no install step, no dependency upgrades, works by serving the folder, the
source is the artifact, easy to read for learners.

Cons: no component model, no type checking, no tree shaking, manual DOM
updates, ES5 limits expressiveness.

### Option B: Modern bundler with a framework (React or Vue)

Pros: component model, ecosystem, better ergonomics for larger UIs.

Cons: `package.json`, lockfile churn, build output is the artifact, deploy
requires CI or a build step, and the app is far too small to benefit.

### Option C: Modern JavaScript without a framework, type-checked with JSDoc

Pros: private fields, modules, optional types, still close to the platform.

Cons: requires a minimum browser baseline, and `type="module"` interacts with
`file://` and with older school devices.

## Decision outcome

We chose **Option A**. One IIFE in `app.js`, `var` and `function`, no imports.
The entire application is under 1200 lines of logic, so the ergonomic gain of a
framework is smaller than the cost of its toolchain.

### Consequences

* Positive: anyone can fork, edit and host the app without installing
  anything. No supply-chain risk, no outdated-dependency alerts.
* Positive: the file that runs is the file that is reviewed.
* Negative / risks: no automatic refactoring support, no types; typos surface
  at runtime. Mitigated by keeping functions small and verifying in a browser.
* Negative / risks: `app.js` will eventually be large. Splitting it into
  multiple `<script>` files or ES modules requires a new ADR.
