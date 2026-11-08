# 0003. Use Microsoft Fluent Emoji for the mascots

* Status: accepted
* Date: 2026-11-08

## Context and problem statement

The mascot is central to the product: it asks the questions, reacts to answers
and gives the app personality. It needs around 30 animals, all visually
consistent, and it must be legal to redistribute in an MIT-licensed
repository.

Earlier artwork was drawn by hand as inline SVG. It was inconsistent and needed
redesign whenever a new animal was added. A child rejected the first cat, which
showed that visual quality and breadth matter more than uniqueness of style at
this stage.

## Considered options

### Option A: Microsoft Fluent Emoji (MIT)

Pros: MIT licence, about 30 usable animal faces, consistent flat style, SVG
sources available, no attribution obligation beyond keeping the licence file.

Cons: recognisably Microsoft's style, not unique to the project, limited to the
existing animal set.

### Option B: Commissioned or self-drawn SVG mascots

Pros: unique identity, exact style control.

Cons: time cost per animal, quality inconsistent across 30 illustrations, and a
redesign cycle each time a child dislikes one.

### Option C: Icon set such as Icons8

Pros: large catalogue.

Cons: licensing terms differ per asset and per plan, some require attribution or
payment, which conflicts with the MIT redistribution requirement.

## Decision outcome

We chose **Option A**. MIT licensing plus a consistent set removed both the
legal question and the visual-quality question. Uniqueness is not a quality
goal for this project; clarity and breadth are.

### Consequences

* Positive: 30 mascots with a uniform visual weight, each an SVG under 100 KB.
* Positive: credit and licence are trivially documented in
  `assets/mascots/fluent/LICENSE-fluentui-emoji.md`.
* Positive: adding a mascot is copying a file and one line in `mascots.js`.
* Negative / risks: the app looks like Fluent Emoji; differentiating would
  require custom art later.
* Negative / risks: upstream could stop publishing assets. Mitigated because
  the SVGs are vendored in the repository, not hot-linked.
