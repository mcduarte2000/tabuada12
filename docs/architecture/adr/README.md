# Architecture Decision Records

One record per hard-to-reverse decision. Format follows MADR.

## Index

| ADR | Title | Status |
| --- | --- | --- |
| [0001](./0001-static-single-page-app.md) | Ship a static single-page app instead of an application server | accepted |
| [0002](./0002-plain-html-css-js-no-build-step.md) | Use plain HTML, CSS and ES5 JavaScript without a build step | accepted |
| [0003](./0003-fluent-emoji-mascots.md) | Use Microsoft Fluent Emoji for the mascots | accepted |
| [0004](./0004-adaptive-fact-selection.md) | Select the next fact with weighted random choice | accepted |
| [0005](./0005-browser-local-storage-only.md) | Keep all state in the browser, in `localStorage` and cookies | accepted |
| [0006](./0006-material-design-3.md) | Use Material Design 3 tokens as the visual system | accepted |
| [0007](./0007-synthesised-sound-effects.md) | Synthesise feedback sounds with the Web Audio API | accepted |
| [0008](./0008-installable-web-app.md) | Ship as an installable Progressive Web App | accepted |
| [0009](./0009-timer-and-input-honesty.md) | Give the countdown one owner and never show input that is discarded | accepted |
| [0010](./0010-vendored-tonejs-music.md) | Play traditional music from note data with a vendored Tone.js | accepted |

## Numbering

Numbers are monotonic and never reused. Gaps are acceptable. A superseded ADR
keeps its number and changes its status to `superseded by ADR-MMMM`.

The next decision uses the next free number: **0011**.
