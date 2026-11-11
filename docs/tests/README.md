# Tests

Regression tests for Tabuada 12. Every case maps to a defect that was actually
found or to a documented requirement.

## Running

```sh
node tests/regression.js       # behaviour
python3 tests/validate-docs.py .   # documentation conventions
```

Both run in CI on every push (`.github/workflows/ci.yml`).

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
| Records stored in a one-year cookie | The record history could be lost with `localStorage` |
| One record per session | A 16-answer streak wrote 16 descending entries |
| Levels documented and coded | The level table drifted from `docs/levels.md` |
| Level persisted for one year | The child dropped back to level 1 on every visit |
| Table of 1 excluded from level 2 | A level 2 question could be `1 x 7` |
| Equations only from level 4 | Equations leaked into early levels |
| Timeout counts as a wrong answer | Expiry was free, so waiting beat guessing |
| Changing mascot keeps the question | The child could re-roll a hard fact |
| Level badge right aligned | The badge sat next to the title, because the flex row shrank to its content |
| Badge rule is not defeated by its parent | A correct `margin-left: auto` with a content-sized parent does nothing |
| Timeout phrases are full sentences | A bare "Tempo!" is not usable Portuguese |
| A wrong first attempt keeps the countdown armed | The clock froze on the second attempt, so a level-6 fact could never expire |
| Expiry always reveals | A question could sit answerable at `0:00` after a pause at the last millisecond |
| The time display rounds up | `0:00` showed for a whole second while input was still accepted |
| An open dialog pauses the countdown | Reading the Acertos sheet used to consume the child's time |
| Keys that ignore a press look disabled | A key rippled and typed nothing, which reads as a broken game |
| The music bar sits on the game screen only | Music controls on the setup screens distract from the one task there |
| The music bar has play and stop | A speaker icon does not say whether music is running |
| Music is off until asked for | Sound that starts by itself surprises a child and a parent |
| The music choice is kept in a cookie | The decision must survive a reload like the other preferences |
| A remembered preference never starts playback | Music started on the mascot step because the first gesture resumed it |
| Leaving the game screen stops the music | Music played on under a screen that shows no music controls |
| Piano is the default instrument | The requested default timbre must not depend on a saved cookie |
| The information dialog makes no offline claim about music | The sentence was removed on request |
| The confirm key needs the right number of digits | A dropped key press left a short answer that scored a miss |
| Enter obeys the digit count | The shortcut must not bypass the rule the button enforces |
| A new track never overlaps the previous one | Leftover Parts from the old tune were audible as stray notes |
| The player offers a choice of instruments | Four extra timbres were requested and must stay reachable |
| The music page lists every tune | A page nobody can reach, or that lists a tune with no way to hear it, is useless |
| The information dialog links to the music page | The page must be reachable from the app |
| Manifest is installable with icons and screenshots | Chrome silently refuses installation |
| Every manifest icon exists on disk | A 404 blocks install with no visible reason |
| Every precached file exists | `cache.addAll` is atomic, so one 404 disables offline |
| Service worker is versioned | Stale shells survive forever |
| Service worker activates and caches the shell | Offline support that never engages |
| App loads offline | The main promise of the PWA route |
| Time label says remaining | The markup said elapsed while the value counted down |
| Name error announced once | `role=alert` plus `aria-describedby` duplicates the announcement |
| Level badge is silent | The overlay already announces assertively |
| Font is self-hosted | A runtime Google Fonts request broke offline and leaked a visit |
| Roboto licence is OFL | The notice said Apache, inherited from the static v2 family |
| CI runs tests and validator | A convention CI does not check is not enforced |
| AGENTS.md answers four questions | A new agent must learn install, layout, conventions and prohibitions |
| AGENTS.md stays under the length limit | A bloated file is skipped by readers |
| CONTRIBUTING.md holds the moved detail | Detail must move, not disappear |
| Desktop window fits content when installed | An installed app opened at the browser default size |
| Window size is not forced back | A resize loop would fight the user |
| Live session row matches the header | The list hid the current record while the header showed it |
| Cookie write is size-checked | The compact progress could exceed 4 KB |
| Failures weigh more than successes | Adaptive selection lost its purpose |
| Storage access wrapped | Storage failures must never break the game |
| The app asks for a nickname | Personal data must not be requested |
| Licence and privacy dialog exists | The information must stay reachable from one place only |
| Licence dialog links to the repository | The source must stay discoverable and open safely |
| Required files exist | Broken links and missing assets |
| Licence lists third-party content | MIT attribution is a legal obligation |
| Every mascot file credited | Same reason |
| Gherkin fences balanced | Requirements must stay renderable |
| The version shown matches the changelog | A drifting version string misleads whoever reports a bug |
| The information dialog shows the version | Support needs to know which build the child is running |

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
- The service worker reaches the active state and caches at least 30 entries.
- After going offline the app still renders, keeps styles and lists all
  mascots, with no new console errors.
- Acertos, Falhas and Recorde each open a dialog **by real mouse click**; only
  those three are buttons, while Tempo and Série are not; the first two report
  the first/second attempt split, the third lists the top ten with dates and
  includes the running session marked "agora".
- Reduced motion does not break layout.
- At 320x568: title fits, subtitle is not clipped, no vertical overflow.
- After a wrong first attempt the countdown keeps running and can expire on the
  second attempt, revealing the answer with a miss.
- A question never sits answerable at `0:00`: sampling the display while a
  level-6 question runs finds no zero sample with an enabled key.
- A key that cannot accept input is disabled, under 0.9 opacity and uses the
  default cursor; a scripted click on it changes nothing.
- The information dialog opens with the installed version and a link to the
  rendered changelog on GitHub.
- With an answer of `18`: the confirm key is grey and `not-allowed` while empty
  or holding `1`, purple and `pointer` at `18`, and grey again at `189`.
  Pressing Enter in either wrong-length case keeps the question open, says which
  way it is wrong, and leaves the miss counter unchanged.
- The radio bar is absent on the setup screens and present on the game screen.
- Pressing play produces a non-zero signal at the destination, shows the track
  name, and switches the button to stop; pressing stop silences it and returns
  the button to play.
- With the music cookie unset, nothing plays and the audio context stays
  suspended until a gesture. With the cookie set to `on`, the pages remain
  silent: the first gesture only unlocks audio, and the play button is the only
  thing that starts sound.
- Leaving the game screen while music plays silences it, and returning does not
  resume it on its own.
- Each of the eight instruments produces a measurable signal, so none is
  effectively silent.
- The music page lists all 18 tunes with country, era, author and a play button
  that starts the same engine used by the radio bar.

## Input quality

Clickable behaviour is exercised with real pointer input (`page.mouse.move`,
`mouse.down`, `mouse.up`), not with `element.click()` in page context. A
scripted click fires the handler directly and skips hit testing, so it passes
even when an overlay, a `pointer-events` rule or a layout bug makes the element
unclickable for a person.

Static checks also assert the affordance: `.stat` sets `cursor: pointer` and
`.stat--static` resets it, so a clickable-looking element is always a real
button and a static one never looks tappable.

The keypad follows the same rule from the other direction: `updateConfirm`
derives `disabled` from the very predicate that gates `pressDigit` and
`submit`, and `spawnRipple` refuses a disabled button. A press that would be
ignored therefore cannot show feedback, and a press that shows feedback cannot
be ignored. See [ADR-0009](../architecture/adr/0009-timer-and-input-honesty.md).

Beware the service worker when reproducing a defect by hand: a registered
worker serves the previous `app.js` from cache, so a fix can look absent. Either
unregister the worker and clear caches, or serve the copy without `sw.js`.

## Adding a case

When a defect is found, add a failing check first, then fix it. Put static
assertions in `staticTests()` and interaction assertions in `browserTests()`,
and name the check after the behaviour, not the function.
