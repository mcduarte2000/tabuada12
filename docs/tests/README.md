# Tests

Regression tests for Tabuada 12. Every case maps to a defect that was actually
found or to a documented requirement.

## Running

```sh
node tests/regression.js
```

The script starts its own static server on port 8912 and needs nothing else for
the static checks. Browser checks run when Playwright is resolvable:

```sh
npm i -D playwright          # once
npx playwright install chromium
node tests/regression.js
```

If Playwright is unavailable or has no browser downloaded, the script falls
back to the system Chrome installed at
`/Applications/Google Chrome.app`. The `CHROME_PATH` environment variable
overrides the search.

Exit code is `0` when every check passes and `1` otherwise, so it can gate a
release.

## What is covered

### Static checks

These read the repository and need no browser. They exist to stop a previous
defect from returning unnoticed.

| Check | Defect it prevents |
| --- | --- |
| No pixel `line-height` | Enlarged Android fonts clipped every text box |
| Title on its own row | "Tabuada 12" was truncated to "Tabuada..." by the buttons |
| Title has no ellipsis | The app name must never be abbreviated |
| Header has no subtitle and a static icon | The mascot belongs beside the speech bubble |
| Header stacks title above right-aligned actions | Identity left, controls right, two rows |
| No mandatory scroll snap | Short swipes on Android sprang back to the start |
| `touch-action: pan-x` on the row | Native horizontal scroll was blocked |
| Page dots present | The row did not look scrollable |
| Drag hint present | Same reason |
| 30 mascots with several greetings each | Every mascot said the same line |
| Greetings differ between mascots | Same reason |
| No unknown placeholders | A typo in `content.json` would print `{foo}` |
| Single audio toggle | Two overlapping audio controls existed |
| No music leftovers | The removed music feature must not reappear in code |
| Clock pauses on hidden tab | Elapsed time jumped by the hidden duration |
| Progress TTL 24 h, profile 1 year | Expiry drifted from the documented values |
| Cookie write is size-checked | The compact progress could exceed 4 KB |
| Failures weigh more than successes | Adaptive selection lost its purpose |
| Storage access wrapped | Storage failures must never break the game |
| The app asks for a nickname | Personal data must not be requested |
| Licence and privacy dialog exists | The information must stay reachable in the app |
| Licence dialog links to the repository | The source must stay discoverable and open safely |
| Required files exist | Broken links and missing assets |
| Licence lists third-party content | MIT attribution is a legal obligation |
| Every mascot file credited | Same reason |
| Gherkin fences balanced | Requirements must stay renderable |

### Browser checks

Run with Playwright or system Chrome at 360x640.

- No console errors on load or during a full session.
- Header: title fully visible, app icon before a game, mascot after.
- Setup fits one screen before and after entering a name; play button visible.
- A two-word entry is refused as a nickname.
- Carousel: overflows, dots render after images load, active dot follows the
  scroll, hint hides at the end, and each mascot shows a different greeting.
- Game: question appears, five statistics, no truncated labels.
- Answering correctly increments the counter, writes `localStorage` progress,
  writes the progress cookie and the profile cookies, then advances to a
  different question.
- A wrong first attempt increments misses, keeps the same fact, and the second
  wrong attempt reveals the answer, hides the keypad and shows Continue.
- Changing mascot preserves counters, keeps the clock running, keeps the sound
  toggle visible and updates the header image.
- The licence and privacy dialog opens at the top, states the local-only
  policy and the licences, closes on its button, and does not forward digits to
  the game.
- Acertos renders green and Falhas red, on both the number and the label.
- Reduced motion does not break layout.
- At 320x568: title fits, subtitle is not clipped, no vertical overflow.

## Adding a case

When a defect is found, add a failing check first, then fix it. Put static
assertions in `staticTests()` and interaction assertions in `browserTests()`,
and name the check after the behaviour, not the function.
