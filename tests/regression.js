#!/usr/bin/env node
/*
 * Regression tests for Tabuada 12.
 *
 * No dependencies, no build step. Runs with `node tests/regression.js`.
 * Starts its own static server, drives a headless Chromium through the
 * Playwright API if available, and falls back to static analysis when it is
 * not.
 *
 * Every test maps to a past defect or a documented requirement. When a new
 * defect is found, add a case here before fixing it.
 */
'use strict';

var http = require('http');
var fs = require('fs');
var path = require('path');
var url = require('url');

var ROOT = path.resolve(__dirname, '..');
var PORT = 8912;

var results = [];

function pass(name, detail) {
  results.push({ name: name, ok: true, detail: detail });
}

function fail(name, detail) {
  results.push({ name: name, ok: false, detail: detail });
}

function check(name, condition, detail) {
  if (condition) pass(name, detail);
  else fail(name, detail);
}

var MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png'
};

function startServer() {
  return new Promise(function (resolve) {
    var server = http.createServer(function (req, res) {
      var pathname = decodeURIComponent(url.parse(req.url).pathname);
      if (pathname === '/') pathname = '/index.html';

      var file = path.join(ROOT, pathname);
      if (file.indexOf(ROOT) !== 0) {
        res.writeHead(403);
        res.end();
        return;
      }

      fs.readFile(file, function (error, data) {
        if (error) {
          res.writeHead(404);
          res.end('not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
        res.end(data);
      });
    });

    server.listen(PORT, function () {
      resolve(server);
    });
  });
}

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function findSystemChrome() {
  var candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ];

  for (var i = 0; i < candidates.length; i += 1) {
    if (candidates[i] && fs.existsSync(candidates[i])) return candidates[i];
  }
  return null;
}

function loadPlaywright() {
  var candidates = ['playwright', 'playwright-core', 'kilo-playwright'];
  for (var i = 0; i < candidates.length; i += 1) {
    try {
      return require(candidates[i]);
    } catch (error) {
      /* tenta o seguinte */
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Static checks: always run, no browser required
// ---------------------------------------------------------------------------

function staticTests() {
  var html = read('index.html');
  var css = read('styles.css');
  var js = read('app.js');
  var content = JSON.parse(read('content.json'));

  check('no pixel line-heights', /line-height:\s*\d+px/.test(css) === false,
    'fixed px line-height clips text when the OS scales fonts');

  check('header shows the app icon beside the title',
    /class="brand"[\s\S]{0,180}?class="brand-mark"[\s\S]{0,300}?class="brand-title"/.test(html),
    'the icon and the app name share the first header row, aligned left');

  check('header has no subtitle and no mascot in the bar',
    /\.brand-subtitle|id="brandSubtitle"/.test(html + css) === false &&
      /id="brandMark"/.test(html) === false,
    'the bar keeps a static app icon; the mascot lives beside the speech bubble');

  check('header stacks title above right-aligned actions',
    /\.top-app-bar\s*\{[^}]*flex-direction:\s*column/.test(css) &&
      /\.top-app-bar\s*\{[^}]*align-items:\s*flex-start/.test(css) &&
      /\.top-actions\s*\{[^}]*align-self:\s*flex-end/.test(css),
    'the icon and title sit left on the first row, buttons right on the second');

  check('mascot name sits under the speaker', /class="coach-face"[\s\S]{0,200}?class="coach-name"/.test(html),
    'each speaking mascot is labelled underneath');

  check('clickable stats expose pointer affordance',
    /\.stat\s*\{[^}]*cursor:\s*pointer/.test(css) &&
      /\.stat--static\s*\{[^}]*cursor:\s*default/.test(css),
    'clickable indicators must look clickable and static ones must not');

  check('correct and miss stats are coloured',
    /\.stat--correct[^}]*var\(--success\)/.test(css) && /\.stat--miss[^}]*var\(--md-error\)/.test(css),
    'Acertos must read green and Falhas red');

  check('carousel has no mandatory snap', /scroll-snap-type/.test(css) === false,
    'mandatory snapping made short Android swipes spring back');

  check('carousel allows horizontal pan', /\.mascot-grid\s*\{[^}]*touch-action:\s*pan-x/.test(css),
    'touch-action manipulation blocks native horizontal scrolling on Android');

  check('carousel exposes page dots', /id="mascotPages"/.test(html) && /\.mascot-pages/.test(css),
    'dot indicators show that more mascots exist');

  check('carousel exposes drag hint', /id="mascotHint"/.test(html),
    'a visible hint is required because the row is not obviously scrollable');

  var mascots = content.mascotes;
  check('content has 30 mascots', mascots.length === 30, 'found ' + mascots.length);

  var allGreetings = mascots.every(function (m) {
    return Array.isArray(m.ola) && m.ola.length >= 2;
  });
  check('every mascot has several greetings', allGreetings,
    'a single shared greeting made all mascots sound identical');

  var firsts = mascots.map(function (m) { return m.ola[0]; });
  check('greetings differ between mascots', new Set(firsts).size === mascots.length,
    new Set(firsts).size + ' unique of ' + mascots.length);

  var allowed = ['nome', 'produto', 'a', 'b', 'interjeicao', 'traco', 'mascote'];
  var badPlaceholder = null;
  mascots.forEach(function (m) {
    ['ola', 'perguntar', 'acertou', 'acertouSegunda', 'errou', 'revelou'].forEach(function (field) {
      (m[field] || []).forEach(function (text) {
        var found = text.match(/\{([a-z]+)\}/g) || [];
        found.forEach(function (token) {
          var name = token.slice(1, -1);
          if (allowed.indexOf(name) === -1) badPlaceholder = name;
        });
      });
    });
  });
  check('no unknown placeholders', badPlaceholder === null, 'unknown token: ' + badPlaceholder);

  check('the music bar sits on the game screen only', (function () {
    var game = html.slice(html.indexOf('<section id="game"'));
    game = game.slice(0, game.indexOf('</main>'));
    return /id="radio"/.test(game) &&
      !/id="radio"/.test(html.slice(0, html.indexOf('<section id="game"')));
  })(), 'music controls belong to the screen where the child is playing');

  check('the music bar has play and stop, not a speaker toggle', (function () {
    return /id="musicPlay"/.test(html) &&
      /icon-play/.test(html) && /icon-stop/.test(html) &&
      !/id="soundToggle"/.test(html.slice(html.indexOf('id="radio"'), html.indexOf('</main>')));
  })(), 'the requested control is a play and stop button');

  check('music is off until the visitor asks for it', (function () {
    var player = read('music.js');
    return /DEFAULT_ENABLED = false/.test(player) &&
      /state\.enabled = readCookie\(COOKIE\.enabled\) === 'on'/.test(player) &&
      /playback never starts by itself/.test(player);
  })(), 'sound that starts on its own surprises a child and a parent');

  check('a remembered preference never starts playback', (function () {
    var player = read('music.js');
    var unlock = player.slice(player.indexOf('var unlock = function'));
    unlock = unlock.slice(0, unlock.indexOf('document.addEventListener'));
    return unlock.indexOf('startRadio') === -1;
  })(), 'music restarted on the mascot step because the first gesture resumed it');

  check('leaving the game screen stops the music', (function () {
    var player = read('music.js');
    return /MutationObserver/.test(player) &&
      /game\.hidden && state\.playing/.test(player) &&
      /pauseRadio\(\)/.test(player);
  })(), 'music played on under a screen that shows no music controls');

  check('piano is the default instrument', (function () {
    var player = read('music.js');
    return /readCookie\(COOKIE\.instrument\) \|\| 'piano'/.test(player) &&
      /instrument: 'piano'/.test(player);
  })(), 'the requested default timbre must not depend on a saved cookie');

  check('the music choice is kept in a cookie, not localStorage', (function () {
    var player = read('music.js');
    return /document\.cookie/.test(player) &&
      /tabuada12_music/.test(player) &&
      /localStorage/.test(player) === false;
  })(), 'the decision must survive a reload under the same name as the rest of the app');

  check('the player offers a choice of instruments', (function () {
    var player = read('music.js');
    var picker = /INSTRUMENTS = \[/.test(player) &&
      /id="musicInstrument"/.test(html) &&
      /INSTRUMENTS\.forEach/.test(player);
    var ids = player.match(/^      id: '[a-z]+',$/gm) || [];
    return picker && ids.length >= 8 &&
      /piano/.test(player) && /guitar/.test(player) &&
      /ukulele/.test(player) && /clarinet/.test(player);
  })(), 'the tone of the music should be selectable');

  check('music lives outside the game logic', /\bmusicToggle\b/.test(js) === false &&
    /musicPlay/.test(read('music.js')),
    'a music bug must not be able to break a question');

  check('Tone.js is vendored, never fetched', (function () {
    if (/cdnjs|unpkg|jsdelivr|cdn\./.test(html.replace(/https:\/\/github\.com[^"]*/g, ''))) {
      return false;
    }
    return /assets\/vendor\/tone\/Tone\.js/.test(html) &&
      fs.existsSync(path.join(ROOT, 'assets/vendor/tone/Tone.js')) &&
      fs.existsSync(path.join(ROOT, 'assets/vendor/tone/LICENSE.md'));
  })(), 'a runtime request to a CDN breaks offline play and the privacy promise');

  check('the playlist has eighteen public-domain tracks', (function () {
    var music = read('assets/music/tracks.js');
    var ids = music.match(/^    id: '/gm) || [];
    var credited = music.match(/^    credit: /gm) || [];
    var sourced = music.match(/^    source: /gm) || [];
    return ids.length === 18 && credited.length === 18 && sourced.length === 18;
  })(), 'every track needs an id, a credit and a source');

  check('every melody is note and duration pairs', (function () {
    var music = read('assets/music/tracks.js');
    var pairs = music.match(/\['(?:[A-G][#b]?-?\d|rest)','[0-9]+[nt][.]?'\]/g) || [];
    return pairs.length > 800;
  })(), 'a malformed melody would throw inside Tone.Part at play time');

  check('a new track never overlaps the previous one', (function () {
    var player = read('music.js');
    return /disposeCurrent\(\);[\s\S]{0,200}?Transport\.stop\(\)/.test(player) &&
      /Transport\.cancel\(0\)/.test(player);
  })(), 'leftover Parts from the old tune were audible as stray notes');

  check('the music page lists every tune with a play button', (function () {
    var page = read('musicas.html');
    var script = read('musicas.js');
    return /id="musicList"/.test(page) &&
      /engine\.tracks\(\)\.forEach/.test(script) &&
      /playTrack/.test(script) &&
      /track\.about/.test(script) &&
      /track\.year/.test(script) &&
      /track\.country/.test(script);
  })(), 'the page must show the story of each tune and let a child hear it');

  check('the information dialog links to the music page', (function () {
    var dialog = html.slice(html.indexOf('id="aboutDialog"'));
    var music = dialog.slice(dialog.indexOf('Música'));
    var link = music.indexOf('href="musicas.html"');
    var tracks = music.indexOf('Tarantella Napoletana');
    return link !== -1 && tracks !== -1 && link > tracks;
  })(), 'the link belongs at the end of the music section, after the credits');

  check('the information dialog makes no offline claim about music', (function () {
    var dialog = html.slice(html.indexOf('id="aboutDialog"'));
    return !/sem rede|continua a funcionar sem/.test(dialog);
  })(), 'the offline sentence was removed on request');

  check('the music credits are in the information dialog', (function () {
    return /Música/.test(html) && /Tone\.js/.test(html) &&
      /Cielito Lindo/.test(html) && /Quirino Mendoza/.test(html);
  })(), 'the licence and authorship of every tune must be reachable in the app');

  check('music credits are also in LICENSE', (function () {
    var licence = read('LICENSE');
    return /## \d+\. Music/.test(licence) &&
      /Tone\.js/.test(licence) &&
      /Cielito Lindo/.test(licence) &&
      /Soldier's Joy/.test(licence);
  })(), 'LICENSE is the authoritative third-party notice');

  check('clock pauses on hidden tab', /pauseTimer/.test(js) && /visibilitychange/.test(js),
    'elapsed time must stop accumulating while the tab is hidden');

  check('progress TTL is 24 hours', /PROGRESS_TTL\s*=\s*24\s*\*\s*60\s*\*\s*60/.test(js),
    'progress cookie must expire after 24 hours');

  check('profile TTL is one year', /PROFILE_TTL\s*=\s*365\s*\*\s*24\s*\*\s*60\s*\*\s*60/.test(js),
    'name, mascot and record cookies last one year');

  check('one record per session, not per streak increment',
    /function finalizeSession/.test(js) &&
      /state\.records\.push\(\{\s*streak:\s*state\.sessionPeak/.test(js) &&
      /state\.recordBest\(/.test(js) === false,
    'a long streak used to write 16, 15, 14... entries for the same session');

  check('levels are defined and documented', (function () {
    var levels = read('docs/levels.md');
    var js = read('app.js');
    return /Nível 1/.test(levels) && /Einstein/.test(levels) &&
      /LEVELS = \[/.test(js) &&
      /seconds: 30/.test(js) && /seconds: 5/.test(js) &&
      /unlockStreak: 25/.test(js) && /unlockStreak: 200/.test(js);
  })(), 'the six levels must exist in code and be documented');

  check('levels are persisted for one year',
    /level: 'tabuada12.level'/.test(js) &&
      /level: 'tabuada12_level'/.test(js) &&
      /setCookie\(COOKIE\.level, value, PROFILE_TTL\)/.test(js),
    'the level must survive a reload in localStorage and a cookie');

  check('level 1 asks up to 10, later levels from 2 to 12',
    /maxTable: 10, excludeOne: false/.test(js) &&
      /maxTable: 12, excludeOne: true/.test(js),
    'excluding the table of 1 from level 2 is an explicit rule');

  check('equations only from level 4', (function () {
    var blocks = js.match(/\{ level: \d[^}]*\}/g) || [];
    var withEq = blocks.filter(function (b) { return /equations: true/.test(b); });
    return withEq.length === 3 && withEq.every(function (b) {
      return /level: [456]/.test(b);
    });
  })(), 'missing-factor equations belong to levels 4, 5 and 6');

  check('timeout phrases are complete sentences', (function () {
    var content = JSON.parse(read('content.json'));
    var phrases = content.mascotes.reduce(function (acc, m) {
      return acc.concat(m.tempo || []);
    }, []);
    return phrases.length > 0 && phrases.every(function (p) {
      return p.split(' ').length >= 5;
    });
  })(), 'a lone "Tempo!" is not Portuguese a child can learn from');

  check('timeouts count as wrong answers',
    /function timeUp/.test(js) &&
      /state\.missCount \+= 1/.test(js) &&
      /resetStreak\(\)/.test(js),
    'running out of time must consume the attempt and break the streak');

  check('changing mascot preserves the question',
    /function saveQuestionForResume/.test(js) &&
      /function resumeSavedQuestion/.test(js) &&
      /state\.savedQuestion/.test(js),
    'a new question on mascot change let the child dodge a hard fact');

  check('records are stored in a cookie too',
    /records:\s*'tabuada12_records'/.test(js) &&
      /setCookie\(COOKIE\.records,\s*compact,\s*PROFILE_TTL\)/.test(js),
    'the top 10 records must survive with a one-year cookie');

  check('cookie writes are guarded', /COOKIE_LIMIT/.test(js),
    'the compact progress must be size-checked before writing a cookie');

  check('failed facts weigh more than mastered', (function () {
    var failed = /falhou:\s*14/.test(js);
    var mastered = /acertouPrimeira:\s*0\.8/.test(js);
    return failed && mastered;
  })(), 'PRIORITY constants must keep failures above successes');

  check('storage access is wrapped', (function () {
    var tries = (js.match(/try\s*\{/g) || []).length;
    return tries >= 6;
  })(), 'every storage read and write must tolerate failure');

  var requiredFiles = [
    'index.html', 'styles.css', 'app.js', 'mascots.js', 'content.json',
    'manifest.webmanifest', 'LICENSE', 'README.md', 'CHANGELOG.md', 'AGENTS.md',
    'assets/icon.svg', 'assets/mascots/fluent/gato.svg',
    'assets/mascots/fluent/LICENSE-fluentui-emoji.md',
    'docs/README.md', 'docs/architecture/overview.md',
    'docs/architecture/building-blocks.md', 'docs/architecture/quality-and-risks.md',
    'docs/architecture/adr/README.md', 'docs/requirements/README.md',
    'docs/requirements/iteration-01.md', 'docs/requirements/iteration-02.md',
    'docs/requirements/iteration-03.md', 'docs/requirements/iteration-04.md',
    'docs/levels.md', 'assets/fonts/roboto-latin.woff2',
    'assets/fonts/LICENSE-roboto.txt',
    'tests/validate-docs.py', '.github/workflows/ci.yml'
  ];
  var missing = requiredFiles.filter(function (file) {
    return fs.existsSync(path.join(ROOT, file)) === false;
  });
  check('does not ask for the real name', (function () {
    var html = read('index.html');
    return html.indexOf('Não escrevas o teu nome verdadeiro') >= 0 &&
      html.indexOf('super-herói preferido') >= 0 &&
      html.indexOf('autocomplete="given-name"') === -1;
  })(), 'the app must ask for a nickname with examples and never autofill a real name');

  var manifest = JSON.parse(read('manifest.webmanifest'));
  var sw = read('sw.js');

  check('manifest is installable', (function () {
    return manifest.name &&
      manifest.short_name &&
      manifest.start_url &&
      manifest.scope &&
      manifest.display === 'standalone' &&
      manifest.theme_color &&
      manifest.background_color &&
      /^(#|rgb|\.\/)/.test(manifest.start_url);
  })(), 'name, start_url, scope, display and colours are required to install');

  check('manifest has any and maskable icons', (function () {
    var any = manifest.icons.filter(function (i) { return (i.purpose || 'any') === 'any'; });
    var mask = manifest.icons.filter(function (i) { return i.purpose === 'maskable'; });
    var has192or512 = manifest.icons.some(function (i) { return i.sizes === '192x192' || i.sizes === '512x512'; });
    return any.length > 0 && mask.length > 0 && has192or512;
  })(), 'Chrome requires a 192 or 512 icon plus a maskable one');

  check('every manifest icon exists on disk', (function () {
    var missing = manifest.icons.filter(function (i) {
      return fs.existsSync(path.join(ROOT, i.src)) === false;
    });
    return missing.length === 0;
  })(), 'a missing icon blocks installation silently');

  check('manifest declares screenshots', (function () {
    return Object.prototype.toString.call(manifest.screenshots) === '[object Array]' &&
      manifest.screenshots.length >= 1 &&
      manifest.screenshots.every(function (s) {
        return fs.existsSync(path.join(ROOT, s.src));
      });
  })(), 'screenshots produce a richer install prompt on Android');

  check('manifest is valid JSON', (function () {
    try {
      JSON.parse(read('manifest.webmanifest'));
      return true;
    } catch (error) {
      return false;
    }
  })(), 'a malformed manifest is ignored by the browser');

  check('service worker precaches the shell', (function () {
    var required = ['index.html', 'styles.css', 'app.js', 'mascots.js', 'content.json'];
    return required.every(function (file) { return sw.indexOf("'" + file + "'") >= 0; }) &&
      /assets\/mascots\/fluent\//.test(sw);
  })(), 'the game must start offline');

  check('every precached file exists', (function () {
    var list = sw.slice(sw.indexOf('SHELL_FILES'), sw.indexOf('];', sw.indexOf('SHELL_FILES')));
    var files = (list.match(/'([^']+)'/g) || []).map(function (f) { return f.slice(1, -1); });
    var missing = files.filter(function (f) {
      return f !== './' && fs.existsSync(path.join(ROOT, f)) === false;
    });
    return missing.length === 0;
  })(), 'cache.addAll rejects the whole install if one file 404s');

  check('service worker is versioned', /var VERSION = 'tabuada12-v\d+'/.test(sw),
    'a version bump is the only way to retire stale caches');

  check('app registers the service worker', /serviceWorker\.register\('sw\.js'\)/.test(js),
    'the manifest alone does not make the app offline-capable');

  check('desktop window fits the content when installed', (function () {
    var js = read('app.js');
    return /function fitDesktopWindow/.test(js) &&
      /display-mode: standalone/.test(js) &&
      /window\.resizeTo\(width, height\)/.test(js) &&
      /screen\.availWidth/.test(js) &&
      /if \(!isInstalledApp\(\) \|\| !isDesktopScreen\(\)\) return;/.test(js);
  })(), 'resizing must never fire in a browser tab or on a phone');

  check('window size is not fixed once set', (function () {
    var js = read('app.js');
    return /nearTarget/.test(js);
  })(), 'the user must keep the freedom to resize the installed window');

  check('install button is wired', /beforeinstallprompt/.test(js) && /id="installBtn"/.test(html),
    'the in-app install control depends on the browser prompt event');

  check('iOS standalone metadata present', (function () {
    return /apple-mobile-web-app-capable/.test(html) &&
      /apple-touch-icon/.test(html) &&
      /mobile-web-app-capable/.test(html);
  })(), 'iOS ignores the manifest for the home-screen experience');

  check('privacy and licence reachable', (function () {
    var html = read('index.html');
    return /id="aboutBtn"/.test(html) &&
      /id="aboutDialog"/.test(html) &&
      /id="aboutLink"/.test(html) === false &&
      html.indexOf('sai deste dispositivo') >= 0 &&
      html.indexOf('licença MIT') >= 0 &&
      html.indexOf('Apache 2.0') >= 0;
  })(), 'one entry point in the header; no duplicate link in the footer');

  check('licence dialog links to the repository', (function () {
    var html = read('index.html');
    var link = html.match(/class="about-link"[^>]*href="([^"]+)"/);
    return !!link &&
      link[1] === 'https://github.com/mcduarte2000/tabuada12' &&
      /rel="noopener noreferrer"/.test(html) &&
      /target="_blank"/.test(html);
  })(), 'the source must be reachable, opened safely in a new tab');

  check('required files exist', missing.length === 0, 'missing: ' + missing.join(', '));

  check('time stat labels the remaining time, not elapsed', (function () {
    var html = read('index.html');
    return /id="statTime"[^>]*aria-label="Tempo restante"/.test(html);
  })(), 'the markup said Tempo de jogo while the value counts down');

  check('name error is announced once, not twice', (function () {
    var html = read('index.html');
    var field = html.match(/<p class="field-error" id="nameError"[^>]*>/);
    if (!field) return false;
    var hasAlert = /role="alert"/.test(field[0]);
    var input = html.match(/<input id="nameInput"[^>]*>/);
    var hasDescribedBy = input && /aria-describedby="[^"]*nameError/.test(input[0]);
    return !(hasAlert && hasDescribedBy);
  })(), 'role=alert plus aria-describedby announces the same error twice');

  check('level badge is not a second live region', (function () {
    var html = read('index.html');
    var badge = html.match(/<span class="level-badge"[^>]*>/);
    return !!badge && /aria-live/.test(badge[0]) === false;
  })(), 'the level-up overlay already announces the change assertively');

  check('font is self-hosted, not fetched from Google', (function () {
    var html = read('index.html');
    var css = read('styles.css');
    var remote = /fonts\.googleapis\.com|fonts\.gstatic\.com/.test(html);
    var local = /assets\/fonts\/roboto/.test(css);
    return !remote && local;
  })(), 'a runtime third-party font request breaks offline and leaks a visit');

  check('Roboto licence field is OFL, not Apache', (function () {
    var licence = read('LICENSE');
    var block = licence.slice(licence.indexOf('## 2. Typeface Roboto'));
    block = block.slice(0, block.indexOf('## 3.'));
    var field = block.match(/- \*\*Licence:\*\* ([^\n]+(?:\n  [^\n]+)*)/);
    return !!field && /SIL Open Font License 1\.1/.test(field[1]) &&
      /Apache/.test(field[1]) === false;
  })(), 'the static Roboto was Apache; the variable family is OFL. Copying the old notice is the trap');

  check('the vendored licence file is the OFL text', (function () {
    var text = read('assets/fonts/LICENSE-roboto.txt');
    return /SIL OPEN FONT LICENSE Version 1\.1/.test(text) &&
      /Apache License/.test(text) === false;
  })(), 'a mismatched licence file does not satisfy the OFL condition of shipping the licence');

  check('the dialog no longer claims a Google Fonts request', (function () {
    var html = read('index.html');
    return /Google Fonts/.test(html) === false &&
      /Open Font License/.test(html);
  })(), 'the privacy copy must match what the app actually does');

  check('font files and licence exist', (function () {
    return fs.existsSync(path.join(ROOT, 'assets/fonts/roboto-latin.woff2')) &&
      fs.existsSync(path.join(ROOT, 'assets/fonts/LICENSE-roboto.txt'));
  })(), 'a vendored font needs its licence beside it');

  check('font is precached for offline', (function () {
    return /assets\/fonts\/roboto-latin\.woff2/.test(read('sw.js'));
  })(), 'an uncached font means a flash of fallback text offline');

  check('CI runs the tests and the validator', (function () {
    var workflow = read('.github/workflows/ci.yml');
    return /node tests\/regression\.js/.test(workflow) &&
      /validate-docs\.py/.test(workflow) &&
      /node --check/.test(workflow);
  })(), 'a convention that CI does not check is not enforced');

  check('AGENTS.md answers the four contract questions', (function () {
    var agents = read('AGENTS.md');
    var lines = agents.split('\n').length;
    return lines <= 140 &&
      /## Install, run, test, build/.test(agents) &&
      /## Where things live/.test(agents) &&
      /## Conventions/.test(agents) &&
      /## Do not touch/.test(agents);
  })(), 'a new agent must learn install, layout, conventions and prohibitions');

  check('AGENTS.md stays within the contract length', (function () {
    return read('AGENTS.md').split('\n').length <= 140;
  })(), 'a bloated instruction file is skipped by readers');

  check('CONTRIBUTING.md holds the moved detail', (function () {
    var text = read('CONTRIBUTING.md');
    return /## Code/.test(text) && /## Documentation/.test(text) &&
      /## Third-party content/.test(text) && /## Tests/.test(text);
  })(), 'detail must move, not disappear');

  check('the reuse rule is stated in both instruction files', (function () {
    var agents = read('AGENTS.md');
    var contributing = read('CONTRIBUTING.md');
    return /Reuse before you build/i.test(agents) &&
      /### Reuse before you build/.test(contributing) &&
      /authoring-time/i.test(contributing);
  })(), 'a hand-rolled tool is written when nobody searches first; the ABC parser was one');

  var licence = read('LICENSE');
  check('licence lists third-party content',
    licence.indexOf('Third-party notices') >= 0 && licence.indexOf('Fluent Emoji') >= 0,
    'external assets must be credited with their licence');

  var svgFiles = fs.readdirSync(path.join(ROOT, 'assets/mascots/fluent'))
    .filter(function (f) { return f.endsWith('.svg'); });
  var unlisted = svgFiles.filter(function (f) { return licence.indexOf(f) === -1; });
  check('every mascot file is credited', unlisted.length === 0, 'unlisted: ' + unlisted.join(', '));

  ['docs/requirements/iteration-01.md', 'docs/requirements/iteration-02.md'].forEach(function (file) {
    var text = read(file);
    check('Gherkin blocks balanced in ' + path.basename(file), text.split('```').length % 2 === 1,
      'unbalanced code fences');
  });

  check('a key that cannot accept a press does not look pressable',
    /\.key:disabled[\s\S]{0,200}?opacity:/.test(css) &&
      /\.key:disabled[\s\S]{0,200}?cursor:\s*default/.test(css),
    'a disabled key that still lights up on touch reads as a broken game');

  check('a wrong first attempt keeps the countdown armed', (function () {
    var block = js.slice(js.indexOf('function submit()'), js.indexOf('function saveQuestionForResume'));
    var wrongPath = block.slice(block.indexOf('state.missCount += 1'));
    var firstAttempt = wrongPath.slice(0, wrongPath.indexOf('state.attempt = 2'));
    return firstAttempt.indexOf('stopTimer()') === -1;
  })(), 'clearing the deadline on the first miss leaves the second attempt untimed forever');

  check('a question can never sit answerable at zero', (function () {
    return /function timeUp\(\)[\s\S]{0,500}?if \(state\.phase !== 'answering' \|\| state\.busy\) return;/.test(js) &&
      /state\.phase = 'revealed'/.test(js.slice(js.indexOf('function timeUp()'), js.indexOf('function showLevelUp')));
  })(), 'expiry must always end in the reveal phase, never fall through');

  check('the confirm key needs the right number of digits', (function () {
    var start = js.indexOf('function expectedDigits()');
    var end = js.indexOf('function updateConfirm()');
    var block = js.slice(start, end);
    return /questionAnswer\(state\.question\)/.test(block) &&
      /state\.input\.length === expectedDigits\(\)/.test(block) &&
      /els\.confirm\.disabled = !canSubmit\(\)/.test(js);
  })(), 'a dropped key leaves a short answer that must be refused, and 100 is not an attempt at 10');

  check('Enter obeys the digit count, not just the button', (function () {
    return /if \(!canSubmit\(\)\)/.test(js.slice(js.indexOf('function submit()'), js.indexOf('function saveQuestionForResume')));
  })(), 'the keyboard shortcut must not bypass the rule the button enforces');

  check('the time display rounds up', (function () {
    return /function formatTime\(ms\)[\s\S]{0,220}?Math\.ceil/.test(js);
  })(), 'flooring showed 0:00 for a whole second while the question was still answerable');

  check('an open dialog pauses the countdown', (function () {
    return /function openDialog[\s\S]{0,900}?pauseTimer\('dialog'\)/.test(js) &&
      /function closeDialog[\s\S]{0,500}?resumeTimer\('dialog'\)/.test(js);
  })(), 'reading the Acertos sheet used to cost the child the question');

  check('the information dialog shows the installed version', (function () {
    return /id="appVersion"/.test(html) &&
      /blob\/main\/CHANGELOG\.md/.test(html);
  })(), 'a parent reporting a bug needs the version that is installed and its release notes');

  check('the shown version matches the newest changelog release', (function () {
    var shown = js.match(/var APP_VERSION = '([0-9]+\.[0-9]+\.[0-9]+)'/);
    var released = read('CHANGELOG.md').match(/^## \[([0-9]+\.[0-9]+\.[0-9]+)\]/m);
    var inMarkup = html.match(/id="appVersion">([0-9]+\.[0-9]+\.[0-9]+)</);
    return !!shown && !!released && !!inMarkup &&
      shown[1] === released[1] && inMarkup[1] === released[1];
  })(), 'a version string that drifts from the changelog or the markup misleads support');
}

// ---------------------------------------------------------------------------
// Browser checks: run when Playwright is available
// ---------------------------------------------------------------------------

async function browserTests(browser) {
  var context = await browser.newContext({ viewport: { width: 360, height: 640 } });
  var page = await context.newPage();

  async function realClick(selector) {
    var box = await page.locator(selector).first().boundingBox();
    if (!box) throw new Error('element not visible: ' + selector);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.up();
    await page.waitForTimeout(160);
  }
  var errors = [];
  page.on('pageerror', function (error) { errors.push(String(error)); });
  page.on('console', function (msg) {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('http://localhost:' + PORT + '/', { waitUntil: 'networkidle' });

  async function readQuestion() {
    return await page.evaluate(function () {
      return {
        a: document.getElementById('slotA').textContent,
        b: document.getElementById('slotB').textContent,
        r: document.getElementById('slotR').textContent,
        sr: document.getElementById('srQuestion').textContent
      };
    });
  }

  async function answerCurrent() {
    var q = await readQuestion();
    var value;
    if (q.a === '?') value = Number(q.r) / Number(q.b);
    else if (q.b === '?') value = Number(q.r) / Number(q.a);
    else value = Number(q.a) * Number(q.b);
    await page.keyboard.type(String(value));
    await page.keyboard.press('Enter');
    return { q: q, value: value };
  }

  check('no console errors on load', errors.length === 0, errors.join(' | '));

  check('title fully visible', await page.evaluate(function () {
    var t = document.querySelector('.brand-title');
    return t.scrollWidth <= t.clientWidth + 1;
  }), 'the header must render the whole app name');

  check('name step wording is second person', await page.evaluate(function () {
    return document.querySelector('#nameStep .setup-title').textContent.trim() === 'Como te queres chamar?';
  }), 'the heading must address the child directly');

  check('page does not scroll vertically on setup', await page.evaluate(function () {
    return document.documentElement.scrollHeight <= window.innerHeight + 1;
  }), 'all setup content must fit one screen');

  check('full name rejected as a nickname', await page.evaluate(async function () {
    var input = document.getElementById('nameInput');
    input.value = 'Maria Silva';
    document.getElementById('nameForm').dispatchEvent(new Event('submit', { cancelable: true }));
    await new Promise(function (r) { setTimeout(r, 50); });
    var shown = document.getElementById('nameError').hidden === false;
    input.value = 'Foguetão';
    return shown;
  }), 'a first and last name must be refused, to discourage real names');

  await page.fill('#nameInput', 'Foguetão');
  await page.click('#nameForm button[type="submit"]');
  await page.waitForTimeout(300);

  check('setup fits after choosing a name', await page.evaluate(function () {
    return document.documentElement.scrollHeight <= window.innerHeight + 1;
  }), 'mascot step must not overflow the viewport');

  check('play button visible on setup', await page.evaluate(function () {
    var b = document.getElementById('startBtn').getBoundingClientRect();
    return b.top >= 0 && b.bottom <= window.innerHeight;
  }), 'the play button must never be pushed off screen');

  check('page dots rendered', await page.evaluate(function () {
    return document.querySelectorAll('#mascotPages i').length > 1;
  }), 'dots are created after images load');

  check('greeting differs between mascots', await page.evaluate(async function () {
    var grid = document.getElementById('mascotGrid');
    var buttons = grid.querySelectorAll('button[data-mascot]');
    var seen = [];
    for (var i = 0; i < 4; i += 1) {
      buttons[i].click();
      await new Promise(function (r) { setTimeout(r, 30); });
      seen.push(document.getElementById('setupBubbleText').textContent);
    }
    return new Set(seen).size > 1;
  }), 'mascots must not all say the same line');

  check('carousel scrolls horizontally', await page.evaluate(function () {
    var grid = document.getElementById('mascotGrid');
    return grid.scrollWidth > grid.clientWidth + 20;
  }), 'the row must overflow so more mascots are reachable');

  check('dots follow scroll', await page.evaluate(function () {
    var grid = document.getElementById('mascotGrid');
    var dots = document.querySelectorAll('#mascotPages i');
    grid.scrollLeft = 0;
    grid.dispatchEvent(new Event('scroll'));
    var first = Array.prototype.findIndex.call(dots, function (d) {
      return d.classList.contains('is-active');
    });
    grid.scrollLeft = grid.scrollWidth;
    grid.dispatchEvent(new Event('scroll'));
    var last = Array.prototype.findIndex.call(dots, function (d) {
      return d.classList.contains('is-active');
    });
    return first === 0 && last === dots.length - 1;
  }), 'the active dot must track the scroll position');

  check('hint hidden at the end of the row', await page.evaluate(function () {
    return document.getElementById('mascotHint').hidden === true;
  }), 'the swipe hint must disappear once everything is visible');

  await page.evaluate(function () {
    document.getElementById('mascotGrid').scrollLeft = 0;
    document.getElementById('mascotGrid').dispatchEvent(new Event('scroll'));
  });

  await page.click('button[data-mascot="gato"]');
  await page.click('#startBtn');
  await page.waitForTimeout(400);

  check('game shows a question', await page.evaluate(function () {
    return document.getElementById('game').hidden === false &&
      /\d/.test(document.getElementById('slotA').textContent);
  }), 'the game screen must appear with a question');

  check('level badge is visible', await page.evaluate(function () {
    var badge = document.getElementById('levelBadge');
    return !!badge && /Nível \d/.test(document.getElementById('levelText').textContent) &&
      document.getElementById('levelEmoji').textContent.length > 0;
  }), 'the level must always be on screen with its emoji');

  check('countdown starts at the level limit', await page.evaluate(function () {
    var t = document.getElementById('statTime').textContent;
    return /^0:(2\d|30)$/.test(t) || t === '0:30';
  }), 'level 1 allows 30 seconds per question');

  check('five statistics visible', await page.evaluate(function () {
    return document.querySelectorAll('.stats .stat').length === 5;
  }), 'time, correct, misses, streak and record');

  check('no truncated statistic labels', await page.evaluate(function () {
    return Array.prototype.every.call(document.querySelectorAll('.stat-label'), function (el) {
      return el.scrollWidth <= el.clientWidth + 1;
    });
  }), 'labels must not be clipped');

  var first = await answerCurrent();
  var answer = { a: Number(first.q.a), b: Number(first.q.b), product: first.value };
  await page.waitForTimeout(300);

  check('correct answer increments the counter', await page.evaluate(function () {
    return document.getElementById('statCorrect').textContent === '1';
  }), 'answering correctly must count');

  check('progress written to localStorage', await page.evaluate(function () {
    var raw = localStorage.getItem('tabuada12.progress');
    if (!raw) return false;
    var parsed = JSON.parse(raw);
    return parsed && parsed.fatos && Object.keys(parsed.fatos).length > 0;
  }), 'per-fact progress must persist');

  check('progress cookie written', await page.evaluate(function () {
    return /tabuada12_progress=/.test(document.cookie);
  }), 'compact progress must also reach the cookie');

  var statPairs = [
    ['#statCorrectBtn', 'correctDialog'],
    ['#statMissBtn', 'missDialog'],
    ['#statBestBtn', 'bestDialog']
  ];
  var mouseOpened = [];

  for (var pair = 0; pair < statPairs.length; pair += 1) {
    var sel = statPairs[pair][0];
    var dlg = statPairs[pair][1];
    await realClick(sel);
    mouseOpened.push(await page.evaluate(function (d) {
      return document.getElementById(d).open === true;
    }, dlg));
    await realClick('#' + dlg + ' .sheet-actions button');
  }

  check('mouse clicks open the statistic dialogs', mouseOpened.every(Boolean),
    'a real pointer click must open Acertos, Falhas and Recorde: ' + JSON.stringify(mouseOpened));

  check('stat indicators are real buttons', await page.evaluate(function () {
    return ['statCorrectBtn', 'statMissBtn', 'statBestBtn'].every(function (id) {
      return document.getElementById(id).tagName === 'BUTTON';
    }) && ['statTime', 'statStreak'].every(function (id) {
      var stat = document.getElementById(id).closest('.stat');
      return stat.tagName !== 'BUTTON';
    });
  }), 'only indicators with detail are clickable');

  check('correct dialog reports the session split', await (async function () {
    await realClick('#statCorrectBtn');
    var text = await page.evaluate(function () {
      return {
        lead: document.getElementById('correctLead').textContent,
        split: document.getElementById('correctSplit').textContent
      };
    });
    await realClick('#correctDialog .sheet-actions button');
    return /acerto/.test(text.lead) && /à primeira/.test(text.split) && /à segunda/.test(text.split);
  })(), 'the dialog must break successes into first and second attempt');

  check('miss dialog reports the session split', await (async function () {
    await realClick('#statMissBtn');
    var text = await page.evaluate(function () {
      return {
        lead: document.getElementById('missLead').textContent,
        split: document.getElementById('missSplit').textContent
      };
    });
    await realClick('#missDialog .sheet-actions button');
    return /falha/.test(text.lead) && /primeira tentativa/.test(text.split) && /segunda/.test(text.split);
  })(), 'the dialog must break misses by attempt');

  check('live session appears in the record list', await (async function () {
    await realClick('#statBestBtn');
    var info = await page.evaluate(function () {
      var rows = document.querySelectorAll('#recordList li');
      var live = document.querySelector('#recordList li.is-live');
      var header = Number(document.getElementById('statBest').textContent);
      var leadMatch = document.getElementById('bestLead').textContent.match(/(\d+) seguidas/);
      return {
        hasLive: !!live,
        liveText: live ? live.textContent : '',
        header: header,
        lead: leadMatch ? Number(leadMatch[1]) : -1
      };
    });
    await realClick('#bestDialog .sheet-actions button');
    return info.hasLive &&
      /agora/.test(info.liveText) &&
      info.header === info.lead;
  })(), 'the current best streak must be visible and match the header counter');

  check('record dialog lists records with date', await (async function () {
    await realClick('#statBestBtn');
    var info = await page.evaluate(function () {
      var rows = document.querySelectorAll('#recordList li');
      return {
        count: rows.length,
        first: rows[0] ? rows[0].textContent : '',
        hasDate: rows[0] ? /\d{2}\/\d{2}\/\d{4}/.test(rows[0].textContent) : false
      };
    });
    await realClick('#bestDialog .sheet-actions button');
    return info.count > 0 && /\d/.test(info.first) && info.hasDate;
  }), 'the top-10 list must render with streak and date');

  check('profile cookies written', await page.evaluate(function () {
    return /tabuada12_name=Foguet/.test(document.cookie) &&
      /tabuada12_mascot=/.test(document.cookie);
  }), 'name and mascot must persist across visits');

  await page.waitForTimeout(1200);
  var nextRaw = await readQuestion();
  var nextQuestion = { a: Number(nextRaw.a), b: Number(nextRaw.b) };

  check('advances to a new question', nextQuestion.a !== answer.a || nextQuestion.b !== answer.b,
    'the previous question must not repeat immediately');

  await page.keyboard.type('999');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);

  check('miss counter increments on first wrong attempt', await page.evaluate(function () {
    return document.getElementById('statMiss').textContent === '1';
  }), 'misses are counted per attempt, not per question');

  check('same question kept after first mistake', await (async function () {
    var raw = await readQuestion();
    return Number(raw.a) === nextQuestion.a && Number(raw.b) === nextQuestion.b;
  })(), 'the child gets a second chance on the same fact');

  await page.keyboard.type('998');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);

  check('answer revealed after second mistake', await page.evaluate(function () {
    return document.getElementById('nextBtn').hidden === false &&
      document.getElementById('keypad').hidden === true;
  }), 'keypad hides and Continue appears');

  check('miss counter now two', await page.evaluate(function () {
    return document.getElementById('statMiss').textContent === '2';
  }), 'each wrong attempt counts');

  await page.click('#nextBtn');
  await page.waitForTimeout(300);

  await page.click('#editBtn');
  await page.waitForTimeout(400);

  check('session survives a mascot change', await page.evaluate(function () {
    return document.getElementById('statCorrect').textContent === '1' &&
      document.getElementById('statMiss').textContent === '2';
  }), 'changing mascot must not reset counters');

  check('sound toggle still available', await page.evaluate(function () {
    return document.getElementById('soundToggle').hidden === false;
  }), 'returning to setup must not hide the sound control');

  await page.click('button[data-mascot="coruja"]');
  await page.click('#startBtn');
  await page.waitForTimeout(400);

  check('clock keeps running after mascot change', await page.evaluate(function () {
    var t = document.getElementById('statTime').textContent;
    return t !== '0:00';
  }), 'elapsed time must not restart');

  check('mascot name shown under the speaker', await page.evaluate(function () {
    return document.getElementById('gameName').textContent === 'Sabichona';
  }), 'the speaker is labelled with the chosen mascot name');

  check('Acertos green and Falhas red', await page.evaluate(function () {
    var green = getComputedStyle(document.querySelector('.stat--correct .stat-value')).color;
    var red = getComputedStyle(document.querySelector('.stat--miss .stat-value')).color;
    var labels = getComputedStyle(document.querySelector('.stat--correct .stat-label')).color;
    return green === labels && green !== red;
  }), 'both the number and the label must carry the colour');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(function () {
    window.dispatchEvent(new Event('resize'));
  });

  check('about dialog opens at the top by mouse', await (async function () {
    await realClick('#aboutBtn');
    var scrolled = await page.evaluate(function () {
      return document.querySelector('#aboutDialog .sheet-body').scrollTop;
    });
    await realClick('#aboutDialog .sheet-actions button');
    return scrolled === 0;
  })(), 'the dialog must open on Privacidade, not scrolled to the GitHub link');

  check('about dialog opens with privacy and licence', await (async function () {
    await realClick('#aboutBtn');
    var state = await page.evaluate(function () {
      var dialog = document.getElementById('aboutDialog');
      var text = dialog ? dialog.textContent : '';
      return {
        open: !!dialog && dialog.open === true,
        privacy: text.indexOf('sai deste dispositivo') >= 0,
        mit: text.indexOf('licença MIT') >= 0,
        apache: text.indexOf('Apache 2.0') >= 0
      };
    });
    await realClick('#aboutDialog .sheet-actions button');
    return state.open && state.privacy && state.mit && state.apache;
  }), 'the dialog must state local-only storage and list licences');

  check('about dialog closes by mouse', await (async function () {
    await realClick('#aboutBtn');
    await realClick('#aboutDialog .sheet-actions button');
    return await page.evaluate(function () {
      return document.getElementById('aboutDialog').open === false;
    });
  }), 'the close button must dismiss the dialog');

  check('keypad disabled while the dialog is open', await (async function () {
    await realClick('#aboutBtn');
    var before = await page.evaluate(function () {
      return document.querySelector('.q-slot.is-answer').textContent;
    });
    await page.keyboard.press('5');
    await page.waitForTimeout(120);
    var after = await page.evaluate(function () {
      return document.querySelector('.q-slot.is-answer').textContent;
    });
    await realClick('#aboutDialog .sheet-actions button');
    return before === after;
  })(), 'digits must not reach the game behind the dialog');

  check('service worker activates', await (async function () {
    var active = false;
    for (var attempt = 0; attempt < 20; attempt += 1) {
      active = await page.evaluate(function () {
        return navigator.serviceWorker.getRegistration().then(function (reg) {
          return !!(reg && reg.active);
        });
      });
      if (active) break;
      await page.waitForTimeout(200);
    }
    return active;
  })(), 'the worker must reach the active state, otherwise offline never works');

  check('shell is precached', await page.evaluate(async function () {
    var keys = await caches.keys();
    var total = 0;
    for (var i = 0; i < keys.length; i += 1) {
      var cache = await caches.open(keys[i]);
      total += (await cache.keys()).length;
    }
    return total >= 30;
  }), 'the 30 mascots plus the shell must be cached');

  check('countdown reaches zero and reveals', await (async function () {
    await page.evaluate(function () {
      localStorage.setItem('tabuada12.level', '6');
      document.cookie = 'tabuada12_level=6; Max-Age=31536000; Path=/';
    });
    await page.goto('http://localhost:' + PORT + '/?timeout=1');
    await page.waitForTimeout(500);
    await page.fill('#nameInput', 'Tempo');
    await page.click('#nameForm button[type="submit"]');
    await page.waitForTimeout(200);
    await page.click('button[data-mascot="gato"]');
    await page.click('#startBtn');
    await page.waitForTimeout(300);

    var atStart = await page.evaluate(function () {
      return document.getElementById('statTime').textContent;
    });
    await page.waitForTimeout(6200);
    var after = await page.evaluate(function () {
      return {
        time: document.getElementById('statTime').textContent,
        revealed: !document.getElementById('nextBtn').hidden,
        miss: Number(document.getElementById('statMiss').textContent)
      };
    });
    return /^0:0[0-5]$/.test(atStart) && after.time === '0:00' && after.revealed && after.miss >= 1;
  })(), 'level 6 gives 5 seconds, then the answer is revealed with a miss');

  check('the clock keeps running after a wrong first attempt', await (async function () {
    await page.goto('http://localhost:' + PORT + '/?secondattempt=1');
    await page.waitForTimeout(400);
    await page.fill('#nameInput', 'Tempo');
    await page.click('#nameForm button[type="submit"]');
    await page.waitForTimeout(200);
    await page.click('button[data-mascot="gato"]');
    await page.click('#startBtn');
    await page.waitForTimeout(250);

    await page.keyboard.type('999');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
    var before = await page.evaluate(function () {
      return document.getElementById('statTime').textContent;
    });
    await page.waitForTimeout(2200);
    var after = await page.evaluate(function () {
      return {
        time: document.getElementById('statTime').textContent,
        revealed: !document.getElementById('nextBtn').hidden
      };
    });
    return before !== after.time && after.revealed;
  })(), 'a frozen clock on the second attempt means a level-6 question can never expire');

  check('no question stays answerable at 0:00', await (async function () {
    await page.goto('http://localhost:' + PORT + '/?zero=1');
    await page.waitForTimeout(400);
    await page.fill('#nameInput', 'Tempo');
    await page.click('#nameForm button[type="submit"]');
    await page.waitForTimeout(200);
    await page.click('button[data-mascot="gato"]');
    await page.click('#startBtn');
    await page.waitForTimeout(250);

    var zero = null;
    for (var tick = 0; tick < 30; tick += 1) {
      var sample = await page.evaluate(function () {
        return {
          time: document.getElementById('statTime').textContent,
          keypad: document.getElementById('keypad').hidden === false,
          typing: document.querySelectorAll('#keypad button[data-key]:not(:disabled)').length > 0
        };
      });
      if (sample.time === '0:00' && sample.keypad && sample.typing) {
        zero = sample;
        break;
      }
      if (!sample.keypad) break;
      await page.waitForTimeout(200);
    }
    return zero === null;
  })(), 'an expired question must be revealed with a miss, never left waiting for input');

  await page.evaluate(function () {
    localStorage.setItem('tabuada12.level', '6');
    document.cookie = 'tabuada12_level=6; Max-Age=31536000; Path=/';
  });

  check('keys that ignore a press look disabled', await (async function () {
    await page.goto('http://localhost:' + PORT + '/?keys=1');
    await page.waitForTimeout(400);
    await page.fill('#nameInput', 'Teclas');
    await page.click('#nameForm button[type="submit"]');
    await page.waitForTimeout(200);
    await page.click('button[data-mascot="gato"]');
    await page.click('#startBtn');
    await page.waitForTimeout(300);

    var idle = await page.evaluate(function () {
      var key = document.querySelector('#keypad button[data-key="5"]');
      return {
        disabled: key.disabled,
        opacity: Number(getComputedStyle(key).opacity),
        cursor: getComputedStyle(key).cursor
      };
    });

    var q = await readQuestion();
    var value = Number(q.a) * Number(q.b);
    await page.keyboard.type(String(value));
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    var celebrating = await page.evaluate(function () {
      var key = document.querySelector('#keypad button[data-key="5"]');
      return {
        disabled: key.disabled,
        opacity: Number(getComputedStyle(key).opacity),
        cursor: getComputedStyle(key).cursor
      };
    });

    return idle.disabled === false && idle.opacity === 1 &&
      celebrating.disabled === true && celebrating.opacity < 0.9 &&
      celebrating.cursor === 'default';
  })(), 'a key that turns colour but drops the press is the reported "nothing happens"');

  check('the confirm key needs as many digits as the answer', await (async function () {
    await page.goto('http://localhost:' + PORT + '/?digits=1');
    await page.waitForTimeout(400);
    await page.fill('#nameInput', 'Digitos');
    await page.click('#nameForm button[type="submit"]');
    await page.waitForTimeout(200);
    await page.click('button[data-mascot="gato"]');
    await page.click('#startBtn');
    await page.waitForTimeout(350);

    var probe = await page.evaluate(function () {
      var slot = document.querySelector('.q-slot.is-answer');
      var parts = ['slotA', 'slotB', 'slotR'].map(function (id) {
        return document.getElementById(id).textContent;
      });
      var values = parts.map(function (text) {
        return text === '?' ? null : Number(text);
      });
      var answer;
      if (values[0] === null) answer = values[2] / values[1];
      else if (values[1] === null) answer = values[2] / values[0];
      else answer = values[0] * values[1];
      return { answer: answer, digits: String(answer).length, empty: slot.textContent };
    });

    if (probe.digits < 2) return 'skip';

    var confirm = page.locator('#confirmBtn');

    var isDisabled = async function () {
      return await confirm.evaluate(function (el) { return el.disabled; });
    };

    var emptyDisabled = await isDisabled();

    // type exactly one digit: a 2+ digit answer must stay unavailable
    await page.keyboard.type(String(probe.answer).charAt(0));
    await page.waitForTimeout(80);
    var shortDisabled = await isDisabled();

    // fill the remaining digits: now it must be available
    await page.keyboard.type(String(probe.answer).slice(1));
    await page.waitForTimeout(80);
    var fullDisabled = await isDisabled();

    // the disabled state must also be visible
    var look = await confirm.evaluate(function (el) {
      return {
        opacity: Number(getComputedStyle(el).opacity),
        cursor: getComputedStyle(el).cursor,
        bg: getComputedStyle(el).backgroundColor
      };
    });

    return emptyDisabled === true && shortDisabled === true && fullDisabled === false &&
      look.cursor === 'pointer';
  })(), 'a dropped key press leaves a short answer; the child must not be able to submit it');

  check('a too-long answer is refused as well', await (async function () {
    var probe = await page.evaluate(function () {
      var parts = ['slotA', 'slotB', 'slotR'].map(function (id) {
        return document.getElementById(id).textContent;
      });
      var values = parts.map(function (text) { return text === '?' ? null : Number(text); });
      var answer;
      if (values[0] === null) answer = values[2] / values[1];
      else if (values[1] === null) answer = values[2] / values[0];
      else answer = values[0] * values[1];
      return { correct: String(answer) };
    });

    for (var i = 0; i < 4; i += 1) await page.keyboard.press('Backspace');
    await page.keyboard.type(probe.correct);
    var atExact = await page.evaluate(function () {
      return document.getElementById('confirmBtn').disabled;
    });

    if (probe.correct.length >= 3) return atExact === false;

    await page.keyboard.type('9');
    var tooLong = await page.evaluate(function () {
      return {
        input: document.querySelector('.q-slot.is-answer').textContent,
        disabled: document.getElementById('confirmBtn').disabled
      };
    });

    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    var submitted = await page.evaluate(function () {
      return !document.getElementById('nextBtn').hidden;
    });

    return atExact === false && tooLong.disabled === true && submitted === false;
  })(), '100 is not an attempt at 10; the confirm key must refuse the extra digit');

  check('a wrong-length answer says so instead of scoring a miss', await (async function () {
    var probe = await page.evaluate(function () {
      var parts = ['slotA', 'slotB', 'slotR'].map(function (id) {
        return document.getElementById(id).textContent;
      });
      var values = parts.map(function (text) { return text === '?' ? null : Number(text); });
      var answer;
      if (values[0] === null) answer = values[2] / values[1];
      else if (values[1] === null) answer = values[2] / values[0];
      else answer = values[0] * values[1];
      return { correct: String(answer) };
    });

    if (probe.correct.length >= 3) return 'skip';

    for (var i = 0; i < 4; i += 1) await page.keyboard.press('Backspace');

    var before = await page.evaluate(function () {
      return document.getElementById('statMiss').textContent;
    });

    // one digit short, then Enter
    await page.keyboard.type(probe.correct.slice(0, -1));
    await page.keyboard.press('Enter');
    await page.waitForTimeout(250);

    var shortResult = await page.evaluate(function () {
      return {
        miss: document.getElementById('statMiss').textContent,
        bubble: document.getElementById('bubbleText').textContent,
        revealed: !document.getElementById('nextBtn').hidden
      };
    });

    return before === shortResult.miss &&
      shortResult.revealed === false &&
      /faltam/i.test(shortResult.bubble);
  })(), 'a wrong-length answer is a typing slip, not a mistake to punish');

  check('a short answer cannot be submitted even by pressing Enter', await (async function () {
    var probe = await page.evaluate(function () {
      var parts = ['slotA', 'slotB', 'slotR'].map(function (id) {
        return document.getElementById(id).textContent;
      });
      var values = parts.map(function (text) { return text === '?' ? null : Number(text); });
      var answer;
      if (values[0] === null) answer = values[2] / values[1];
      else if (values[1] === null) answer = values[2] / values[0];
      else answer = values[0] * values[1];
      return { correct: String(answer) };
    });

    // clear, then type one digit fewer than needed
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    var short = probe.correct.slice(0, probe.correct.length - 1);
    await page.keyboard.type(short);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);

    return await page.evaluate(function () {
      return {
        phase: !document.getElementById('nextBtn').hidden,
        input: document.querySelector('.q-slot.is-answer').textContent,
        correct: document.getElementById('statCorrect').textContent
      };
    }).then(function (after) {
      return after.phase === false && after.input === short;
    });
  })(), 'the keyboard shortcut must obey the same rule as the button');

  check('level badge always shows the level', await page.evaluate(function () {
    return /Nível \d/.test(document.getElementById('levelText').textContent) &&
      document.getElementById('levelEmoji').textContent.length > 0;
  }), 'the level must be marked on screen with an emoji');

  check('level badge is right aligned', await page.evaluate(function () {
    var badge = document.getElementById('levelBadge').getBoundingClientRect();
    var bar = document.querySelector('.top-app-bar').getBoundingClientRect();
    var title = document.querySelector('.brand-title').getBoundingClientRect();
    return bar.right - badge.right < 8 &&
      badge.left > title.right + 40;
  }), 'the badge must hug the right edge of the header, not the title');

  check('badge alignment rule is not defeated by the flex parent', (function () {
    var css = read('styles.css');
    var brandBlock = css.match(/\.brand\s*\{([^}]*)\}/);
    var badgeBlock = css.match(/\.level-badge\s*\{([^}]*)\}/);
    return !!brandBlock && /width:\s*100%/.test(brandBlock[1]) &&
      !!badgeBlock && /margin-left:\s*auto/.test(badgeBlock[1]);
  })(), 'margin-left auto does nothing unless the flex row fills the width');

  check('reduced motion still renders the app', await page.evaluate(function () {
    return document.getElementById('game').hidden === false;
  }), 'reduced motion must not break layout');

  await page.setViewportSize({ width: 320, height: 568 });
  await page.evaluate(function () {
    document.getElementById('mascotGrid') && document.getElementById('mascotGrid').dispatchEvent(new Event('scroll'));
  });
  await page.waitForTimeout(300);

  check('title fits at 320 px', await page.evaluate(function () {
    var t = document.querySelector('.brand-title');
    return t.scrollWidth <= t.clientWidth + 1;
  }), 'the app name must survive the narrowest viewport');

  check('actions sit below the title, right aligned', await page.evaluate(function () {
    var bar = document.querySelector('.top-app-bar').getBoundingClientRect();
    var brand = document.querySelector('.brand').getBoundingClientRect();
    var actions = document.querySelector('.top-actions').getBoundingClientRect();
    var icon = document.querySelector('.brand-mark').getBoundingClientRect();
    var title = document.querySelector('.brand-title').getBoundingClientRect();
    return actions.top >= brand.bottom - 1 &&
      title.left >= icon.right &&
      Math.abs(bar.right - actions.right) <= 8 &&
      actions.left > icon.left + 40;
  }), 'two rows: icon and title left on top, buttons right below');

  check('no vertical overflow at 320 px', await page.evaluate(function () {
    return document.documentElement.scrollHeight <= window.innerHeight + 1;
  }), 'the game must fit a small phone');

  check('app still loads offline', await (async function () {
    var before = errors.length;
    await context.setOffline(true);
    await page.goto('http://localhost:' + PORT + '/?offline=1', { waitUntil: 'load' });
    await page.waitForTimeout(700);
    var state = await page.evaluate(function () {
      return {
        setup: !!document.getElementById('setup'),
        mascots: document.querySelectorAll('#mascotGrid button').length,
        styled: getComputedStyle(document.body).backgroundColor !== 'rgba(0, 0, 0, 0)'
      };
    });
    await context.setOffline(false);
    await page.goto('http://localhost:' + PORT + '/', { waitUntil: 'load' });
    await page.waitForTimeout(500);
    return state.setup && state.mascots === 30 && state.styled && errors.length === before;
  })(), 'a cached app must render without network and without new errors');

  check('no console errors during the session', errors.length === 0, errors.join(' | '));

  await context.close();
}

// ---------------------------------------------------------------------------

(async function main() {
  staticTests();

  var server = await startServer();
  var playwright = loadPlaywright();
  var browser = null;

  if (!playwright) {
    console.log('Playwright not available: skipping browser checks.');
    console.log('Install it with `npm i -D playwright` to enable them.\n');
  } else {
    try {
      var launchOptions = {};
      var chrome = findSystemChrome();

      try {
        browser = await playwright.chromium.launch(launchOptions);
      } catch (launchError) {
        if (!chrome) throw launchError;
        browser = await playwright.chromium.launch({ executablePath: chrome });
      }

      await browserTests(browser);
    } catch (error) {
      fail('browser test run', String(error && error.message || error));
    } finally {
      if (browser) await browser.close();
    }
  }

  server.close();

  var failures = results.filter(function (r) { return !r.ok; });

  results.forEach(function (r) {
    console.log((r.ok ? '  ok   ' : '  FAIL ') + r.name + (r.detail && !r.ok ? ' — ' + r.detail : ''));
  });

  console.log('\n' + (results.length - failures.length) + ' passed, ' + failures.length + ' failed, ' + results.length + ' total');
  process.exit(failures.length === 0 ? 0 : 1);
})();
