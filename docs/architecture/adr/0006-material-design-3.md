# 0006. Use Material Design 3 tokens as the visual system

* Status: accepted
* Date: 2026-11-08

## Context and problem statement

The app targets phones first and must look deliberate rather than improvised.
It needs light and dark themes, accessible contrast, touch-sized controls and a
consistent component language, all without a UI library because of the no-build
constraint (ADR-0002).

Hand-rolled CSS without a system had produced ad-hoc colours, inconsistent
radii and a dark mode that was guessed rather than derived.

## Considered options

### Option A: Material Design 3 colour tokens, hand-written CSS

Pros: published, tested palettes with paired foreground/background tokens;
built-in light and dark schemes; recognisable to Android users; no library to
ship.

Cons: the token vocabulary is large and mostly unused here; M3 idioms such as
ripples must be implemented manually.

### Option B: A component library (for example Material Web Components)

Pros: ready components, less CSS.

Cons: adds a dependency and a bundle, breaking the no-build constraint; the app
has only buttons, a card and a keypad.

### Option C: Custom design system from scratch

Pros: full control, smallest CSS.

Cons: contrast and dark mode must be validated manually for every pair; more
time for a worse result than an established system.

## Decision outcome

We chose **Option A**. The M3 colour roles are copied into CSS custom
properties for a light and a dark scheme, and components are written by hand
using those tokens. Nothing from Material is downloaded; only the palette and
the interaction conventions are adopted.

### Consequences

* Positive: light and dark themes are complete and consistent, with contrast
  pairs guaranteed by the token design.
* Positive: no runtime dependency; the visual system is 800 lines of readable
  CSS.
* Positive: familiar interaction patterns for Android users, including ripples
  and 48 px touch targets.
* Negative / risks: M3 evolves; the vendored token values will age. Acceptable,
  because palettes are stable and changes are cosmetic.
* Negative / risks: hand-written components can drift from M3 behaviour. The
  scope is small enough that the drift is visible and cheap to fix.
