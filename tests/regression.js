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

  check('title is its own row', /class="brand-title"[\s\S]{0,400}?class="top-row"/.test(html),
    'the title must sit above mascot and buttons so it never truncates');

  check('title has no nowrap ellipsis', /\.brand-title\s*\{[^}]*text-overflow:\s*ellipsis/.test(css) === false,
    'the app name must never be shortened to "Tabuada..."');

  check('header uses the app icon', /class="brand-mark"[\s\S]{0,200}?assets\/icon\.svg/.test(html),
    'the placeholder cross was replaced by the application icon');

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

  check('single audio toggle', (html.match(/id="soundToggle"/g) || []).length === 1 &&
    (html.match(/id="musicToggle"/g) || []).length === 0,
    'there must be exactly one sound control and no music control');

  check('music removal kept app.js clean', /\bMusic\b|musicToggle|trackChip/.test(js) === false,
    'no leftover references to the removed music feature');

  check('clock pauses on hidden tab', /pauseTimer/.test(js) && /visibilitychange/.test(js),
    'elapsed time must stop accumulating while the tab is hidden');

  check('progress TTL is 24 hours', /PROGRESS_TTL\s*=\s*24\s*\*\s*60\s*\*\s*60/.test(js),
    'progress cookie must expire after 24 hours');

  check('profile TTL is one year', /PROFILE_TTL\s*=\s*365\s*\*\s*24\s*\*\s*60\s*\*\s*60/.test(js),
    'name and mascot cookies last one year');

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
    'docs/requirements/iteration-01.md', 'docs/requirements/iteration-02.md'
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

  check('privacy and licence reachable', (function () {
    var html = read('index.html');
    return /id="aboutBtn"/.test(html) &&
      /id="aboutDialog"/.test(html) &&
      html.indexOf('sai deste dispositivo') >= 0 &&
      html.indexOf('licença MIT') >= 0 &&
      html.indexOf('Apache 2.0') >= 0;
  })(), 'the app must expose its licence and local-only storage policy');

  check('required files exist', missing.length === 0, 'missing: ' + missing.join(', '));

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
}

// ---------------------------------------------------------------------------
// Browser checks: run when Playwright is available
// ---------------------------------------------------------------------------

async function browserTests(browser) {
  var context = await browser.newContext({ viewport: { width: 360, height: 640 } });
  var page = await context.newPage();
  var errors = [];
  page.on('pageerror', function (error) { errors.push(String(error)); });
  page.on('console', function (msg) {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('http://localhost:' + PORT + '/', { waitUntil: 'networkidle' });

  check('no console errors on load', errors.length === 0, errors.join(' | '));

  check('title fully visible', await page.evaluate(function () {
    var t = document.querySelector('.brand-title');
    return t.scrollWidth <= t.clientWidth + 1;
  }), 'the header must render the whole app name');

  check('app icon shown before a mascot is chosen', await page.evaluate(function () {
    var img = document.querySelector('#brandMark img');
    return img && img.getAttribute('src').indexOf('assets/icon.svg') >= 0;
  }), 'placeholder cross must not appear');

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
      /\d/.test(document.getElementById('factorA').textContent);
  }), 'the game screen must appear with a question');

  check('five statistics visible', await page.evaluate(function () {
    return document.querySelectorAll('.stats .stat').length === 5;
  }), 'time, correct, misses, streak and record');

  check('no truncated statistic labels', await page.evaluate(function () {
    return Array.prototype.every.call(document.querySelectorAll('.stat-label'), function (el) {
      return el.scrollWidth <= el.clientWidth + 1;
    });
  }), 'labels must not be clipped');

  var answer = await page.evaluate(function () {
    var a = Number(document.getElementById('factorA').textContent);
    var b = Number(document.getElementById('factorB').textContent);
    return { a: a, b: b, product: a * b };
  });

  await page.keyboard.type(String(answer.product));
  await page.keyboard.press('Enter');
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

  check('profile cookies written', await page.evaluate(function () {
    return /tabuada12_name=Foguet/.test(document.cookie) &&
      /tabuada12_mascot=/.test(document.cookie);
  }), 'name and mascot must persist across visits');

  await page.waitForTimeout(1200);
  var nextQuestion = await page.evaluate(function () {
    var a = Number(document.getElementById('factorA').textContent);
    var b = Number(document.getElementById('factorB').textContent);
    return { a: a, b: b };
  });

  check('advances to a new question', nextQuestion.a !== answer.a || nextQuestion.b !== answer.b,
    'the previous question must not repeat immediately');

  await page.keyboard.type('999');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);

  check('miss counter increments on first wrong attempt', await page.evaluate(function () {
    return document.getElementById('statMiss').textContent === '1';
  }), 'misses are counted per attempt, not per question');

  check('same question kept after first mistake', await page.evaluate(function (q) {
    return Number(document.getElementById('factorA').textContent) === q.a &&
      Number(document.getElementById('factorB').textContent) === q.b;
  }, nextQuestion), 'the child gets a second chance on the same fact');

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

  check('header shows the chosen mascot', await page.evaluate(function () {
    var img = document.querySelector('#brandMark img');
    return img && img.getAttribute('src').indexOf('coruja') >= 0;
  }), 'the header reflects the current mascot');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(function () {
    window.dispatchEvent(new Event('resize'));
  });

  check('about dialog opens with privacy and licence', await page.evaluate(async function () {
    document.getElementById('aboutBtn').click();
    await new Promise(function (r) { setTimeout(r, 120); });
    var dialog = document.getElementById('aboutDialog');
    var text = dialog ? dialog.textContent : '';
    return !!dialog && dialog.open === true &&
      text.indexOf('sai deste dispositivo') >= 0 &&
      text.indexOf('licença MIT') >= 0 &&
      text.indexOf('Apache 2.0') >= 0;
  }), 'the dialog must state local-only storage and list licences');

  check('about dialog closes', await page.evaluate(async function () {
    document.querySelector('.sheet-actions button').click();
    await new Promise(function (r) { setTimeout(r, 120); });
    return document.getElementById('aboutDialog').open === false;
  }), 'the close button must dismiss the dialog');

  check('keypad disabled while the dialog is open', await page.evaluate(async function () {
    document.getElementById('aboutBtn').click();
    await new Promise(function (r) { setTimeout(r, 120); });
    var before = document.getElementById('answerBox').textContent;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '5', bubbles: true }));
    var after = document.getElementById('answerBox').textContent;
    document.querySelector('.sheet-actions button').click();
    await new Promise(function (r) { setTimeout(r, 120); });
    return before === after;
  }), 'digits must not reach the game behind the dialog');

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

  check('subtitle not clipped at 320 px', await page.evaluate(function () {
    var s = document.querySelector('.brand-subtitle');
    return s.scrollHeight <= s.clientHeight + 1;
  }), 'the subtitle wraps to two lines instead of truncating');

  check('no vertical overflow at 320 px', await page.evaluate(function () {
    return document.documentElement.scrollHeight <= window.innerHeight + 1;
  }), 'the game must fit a small phone');

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
