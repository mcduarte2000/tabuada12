# 0005. Keep all state in the browser, in localStorage and cookies

* Status: accepted
* Date: 2026-11-08

## Context and problem statement

The game needs to remember the child's name, the chosen mascot, the record and
the per-fact progress. Because the app has no backend, all state must live in
the browser. Two mechanics are available: `localStorage` and cookies.

`localStorage` holds roughly 5 MB, never expires on its own and is easy to
serialise. Cookies are limited to about 4 KB per cookie and can carry an
explicit expiry, but are sent with every HTTP request to the origin, which
wastes bandwidth if overused.

A specific defect drove this decision: switching mascot mid-game reset the
session counters. The fix had to distinguish "same child, new mascot" from "new
child", which requires persisting the profile, not just the progress.

## Considered options

### Option A: `localStorage` only

Pros: simple, large quota, no request overhead.

Cons: cleared by some browser cleanup tools more aggressively than cookies; no
expiry mechanism, so expiry must be enforced by reading a timestamp.

### Option B: Cookies only

Pros: explicit `Max-Age`, survives some cleanups, works without JavaScript on
the server side (irrelevant here).

Cons: 4 KB limit per cookie; the full JSON progress for 144 facts does not fit;
sent on every request to the same origin.

### Option C: Both, with clear roles

Pros: keeps the rich data in `localStorage` and a compact, expiring copy in a
cookie; either can recover the other; expiry semantics come from the cookie.

Cons: two write paths to keep consistent; encoding differs between the two.

## Decision outcome

We chose **Option C**, with explicit roles:

- `localStorage` is the source of truth. It stores the full JSON, including
  recency fields `last` and `lastOk`.
- Cookies are a compact, expiring backup: `tabuada12_name` and
  `tabuada12_mascot` for one year, `tabuada12_progress` for 24 hours.
- The progress cookie uses a compact string format,
  `timestamp|3x4:0,0,3;...` (successes, second-try successes, failures), which
  measured 3541 bytes in the worst case, under the 3800-byte safety limit.
- On startup, expired data is discarded and the source with more recorded facts
  wins; recency is merged back from `localStorage`.

### Consequences

* Positive: progress survives reloads, navigations and some storage cleanups;
  the 24-hour expiry is enforced by the browser, not only by application code.
* Positive: the profile (name and mascot) is known before the game starts, so
  switching mascot no longer loses the session.
* Negative / risks: two representations of the same data. A divergence is
  possible if a write fails, which is handled by preferring the richer source.
* Negative / risks: the cookie is capped at 3800 bytes; if the compact format
  ever exceeds it, the cookie stops updating and only `localStorage` remains.
  Tracked as R1 in [quality-and-risks.md](../quality-and-risks.md).
* Negative / risks: consoles show these cookies on every request. They hold no
  identifiers, only a first name and game counters.
