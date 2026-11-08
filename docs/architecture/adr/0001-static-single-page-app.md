# 0001. Ship a static single-page app instead of an application server

* Status: accepted
* Date: 2026-11-08

## Context and problem statement

The app must be free to run indefinitely and usable by anyone with a browser.
It asks random multiplication questions and needs no shared data between users:
each child's progress is private. There is no requirement for accounts, syncing
across devices, or aggregate statistics.

A traditional architecture with an application server and a database would add
hosting cost, an attack surface, a privacy obligation and operations work, all
of which conflict with the project's purpose.

## Considered options

### Option A: Static files on free hosting

Pros: no servers to run or patch, no cost, HTTPS for free, trivial rollback
(git revert), cannot leak user data because none is collected.

Cons: no multi-device sync, no server-side validation, storage limited to the
browser.

### Option B: Server-rendered app with a database

Pros: progress follows the child across devices, server-side validation,
possible class or school features later.

Cons: hosting cost, GDPR obligations for children's data, database backups,
authentication, considerably more code and maintenance.

### Option C: Static front end plus a serverless backend

Pros: cross-device progress, still no server to patch.

Cons: needs authentication to be meaningful, reintroduces a data controller
role, free tiers have quotas, and there is no product requirement yet.

## Decision outcome

We chose **Option A**. The learning problem is solved entirely on the client,
the audience is families and schools with no integration needs, and "free, safe
and simple" outweighs cross-device convenience. This decision keeps the whole
system inside a Git repository and removes every operational concern.

### Consequences

* Positive: zero hosting cost, zero uptime risk, no personal data processing,
  deploying is a `git push`.
* Positive: the app works when the host is slow, since assets are small and
  local.
* Negative / risks: a child cannot continue on another device or regain
  progress after clearing browser data. Accepted.
* Negative / risks: no server-side validation; anti-tampering is impossible,
  which is irrelevant for a practice app.
* Follow-up: if cross-device progress is ever required, it needs a new ADR and
  will change the system from one container to several.
