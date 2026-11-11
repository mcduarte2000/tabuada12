(function () {
  'use strict';

  var STORAGE = {
    name: 'tabuada12.name',
    mascot: 'tabuada12.mascot',
    best: 'tabuada12.bestStreak',
    records: 'tabuada12.records',
    sound: 'tabuada12.sound',
    theme: 'tabuada12.theme',
    progress: 'tabuada12.progress',
    level: 'tabuada12.level'
  };

  var COOKIE = {
    name: 'tabuada12_name',
    mascot: 'tabuada12_mascot',
    progress: 'tabuada12_progress',
    records: 'tabuada12_records',
    level: 'tabuada12_level'
  };

  var PROGRESS_TTL = 24 * 60 * 60;
  var APP_VERSION = '1.8.1';

  var LEVELS = [
    { level: 1, name: 'Iniciante', emoji: '🐣', maxTable: 10, excludeOne: false, seconds: 30, equations: false, unlockStreak: 0 },
    { level: 2, name: 'Aprendiz', emoji: '🐥', maxTable: 12, excludeOne: true, seconds: 20, equations: false, unlockStreak: 25 },
    { level: 3, name: 'Esperto', emoji: '🦊', maxTable: 12, excludeOne: true, seconds: 12, equations: false, unlockStreak: 50 },
    { level: 4, name: 'Mestre', emoji: '🧠', maxTable: 12, excludeOne: true, seconds: 10, equations: true, unlockStreak: 50 },
    { level: 5, name: 'Génio', emoji: '🚀', maxTable: 12, excludeOne: true, seconds: 7, equations: true, unlockStreak: 100 },
    { level: 6, name: 'Einstein', emoji: '🏆', maxTable: 12, excludeOne: true, seconds: 5, equations: true, unlockStreak: 200 }
  ];

  var EQUATION_CHANCE = 0.34;
  var MAX_INPUT = 3;
  var PROFILE_TTL = 365 * 24 * 60 * 60;
  var COOKIE_LIMIT = 3800;

  var els = {
    gameName: document.getElementById('gameName'),
    setupName: document.getElementById('setupName'),
    themeToggle: document.getElementById('themeToggle'),
    soundToggle: document.getElementById('soundToggle'),
    editBtn: document.getElementById('editBtn'),
    aboutBtn: document.getElementById('aboutBtn'),
    installBtn: document.getElementById('installBtn'),
    aboutDialog: document.getElementById('aboutDialog'),
    setup: document.getElementById('setup'),
    nameStep: document.getElementById('nameStep'),
    mascotStep: document.getElementById('mascotStep'),
    stepDot1: document.getElementById('stepDot1'),
    stepDot2: document.getElementById('stepDot2'),
    nameForm: document.getElementById('nameForm'),
    nameInput: document.getElementById('nameInput'),
    nameError: document.getElementById('nameError'),
    mascotTitle: document.getElementById('mascotTitle'),
    mascotText: document.getElementById('mascotText'),
    mascotGrid: document.getElementById('mascotGrid'),
    mascotScroller: document.getElementById('mascotScroller'),
    mascotHint: document.getElementById('mascotHint'),
    mascotPages: document.getElementById('mascotPages'),
    coachPreview: document.getElementById('coachPreview'),
    setupAvatar: document.getElementById('setupAvatar'),
    setupBubbleText: document.getElementById('setupBubbleText'),
    startBtn: document.getElementById('startBtn'),
    game: document.getElementById('game'),
    gameAvatar: document.getElementById('gameAvatar'),
    bubble: document.getElementById('bubble'),
    bubbleIcon: document.getElementById('bubbleIcon'),
    bubbleText: document.getElementById('bubbleText'),
    srQuestion: document.getElementById('srQuestion'),
    card: document.getElementById('card'),
    question: document.getElementById('question'),
    keypad: document.getElementById('keypad'),
    confirm: document.getElementById('confirmBtn'),
    next: document.getElementById('nextBtn'),
    statTime: document.getElementById('statTime'),
    levelBadge: document.getElementById('levelBadge'),
    levelEmoji: document.getElementById('levelEmoji'),
    levelText: document.getElementById('levelText'),
    levelUp: document.getElementById('levelUp'),
    levelUpEmoji: document.getElementById('levelUpEmoji'),
    slotA: document.getElementById('slotA'),
    slotB: document.getElementById('slotB'),
    slotR: document.getElementById('slotR'),
    levelUpTitle: document.getElementById('levelUpTitle'),
    levelUpName: document.getElementById('levelUpName'),
    operatorX: document.getElementById('operatorX'),
    operatorEq: document.getElementById('operatorEq'),
    statCorrect: document.getElementById('statCorrect'),
    statMiss: document.getElementById('statMiss'),
    statStreak: document.getElementById('statStreak'),
    statBest: document.getElementById('statBest'),
    statCorrectBtn: document.getElementById('statCorrectBtn'),
    statMissBtn: document.getElementById('statMissBtn'),
    statBestBtn: document.getElementById('statBestBtn'),
    correctDialog: document.getElementById('correctDialog'),
    missDialog: document.getElementById('missDialog'),
    bestDialog: document.getElementById('bestDialog'),
    correctLead: document.getElementById('correctLead'),
    correctSplit: document.getElementById('correctSplit'),
    missLead: document.getElementById('missLead'),
    missSplit: document.getElementById('missSplit'),
    bestLead: document.getElementById('bestLead'),
    bestNote: document.getElementById('bestNote'),
    recordList: document.getElementById('recordList'),
    confetti: document.getElementById('confetti'),
    appVersion: document.getElementById('appVersion')
  };

  var ICONS = {
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v6"/><circle cx="12" cy="17" r="1.1" fill="currentColor" stroke="none"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6v.5h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z"/></svg>'
  };

  var state = {
    name: '',
    mascot: null,
    content: window.FALLBACK_CONTENT,
    lastPhrase: {},
    a: 0,
    b: 0,
    input: '',
    attempt: 1,
    phase: 'answering',
    busy: false,
    correctCount: 0,
    missCount: 0,
    streak: 0,
    best: 0,
    firstTryCount: 0,
    secondTryCount: 0,
    sessionPeak: 0,
    sessionStart: 0,
    sessionRecorded: false,
    missFirst: 0,
    missSecond: 0,
    records: [],
    sound: true,
    startedAt: null,
    elapsed: 0,
    timerId: null,
    progress: {},
    level: 1,
    question: { kind: 'product', a: 0, b: 0, missing: null },
    dueAt: 0,
    remaining: 0,
    deadlineId: null,
    paused: false,
    pauseReasons: {},
    savedQuestion: null
  };

  var PRIORITY = {
    nova: 6,
    falhou: 14,
    acertouSegunda: 4.5,
    acertouPrimeira: 0.8
  };

  var audioContext = null;
  var advanceTimer = null;

  function readStored(key, fallback) {
    try {
      var value = window.localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function writeStored(key, value) {
    try {
      window.localStorage.setItem(key, String(value));
    } catch (error) {
      /* armazenamento indisponível: o jogo continua a funcionar */
    }
  }

  function cookieSecureSuffix() {
    return window.location.protocol === 'https:' ? '; Secure' : '';
  }

  function setCookie(nome, valor, maxAge) {
    try {
      var encoded = encodeURIComponent(valor);
      document.cookie = nome + '=' + encoded +
        '; Max-Age=' + maxAge +
        '; Path=/' +
        '; SameSite=Lax' +
        cookieSecureSuffix();
    } catch (error) {
      /* cookies indisponíveis: o jogo continua a funcionar */
    }
  }

  function getCookie(nome) {
    try {
      var prefixo = nome + '=';
      var partes = document.cookie ? document.cookie.split('; ') : [];

      for (var i = 0; i < partes.length; i += 1) {
        if (partes[i].indexOf(prefixo) === 0) {
          return decodeURIComponent(partes[i].slice(prefixo.length));
        }
      }
    } catch (error) {
      return '';
    }

    return '';
  }

  function setProfileCookies(name, mascotId) {
    setCookie(COOKIE.name, name, PROFILE_TTL);
    setCookie(COOKIE.mascot, mascotId, PROFILE_TTL);
  }

  function readProfileCookies() {
    return {
      name: getCookie(COOKIE.name).trim(),
      mascot: getCookie(COOKIE.mascot)
    };
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function pickFresh(list, key) {
    if (!list || !list.length) return '';
    if (list.length === 1) return list[0];
    var previous = state.lastPhrase[key];
    var chosen = pick(list);
    var guard = 0;
    while (chosen === previous && guard < 12) {
      chosen = pick(list);
      guard += 1;
    }
    state.lastPhrase[key] = chosen;
    return chosen;
  }

  function fill(template, extra) {
    var mascot = state.mascot || {};
    return String(template)
      .replace(/\{nome\}/g, state.name)
      .replace(/\{produto\}/g, String(state.a * state.b))
      .replace(/\{a\}/g, String(state.a))
      .replace(/\{b\}/g, String(state.b))
      .replace(/\{interjeicao\}/g, mascot.interjeicao || '')
      .replace(/\{traco\}/g, mascot.traco || '')
      .replace(/\{mascote\}/g, mascot.name || '')
      .replace(/\{([a-z]+)\}/g, function (match, token) {
        return extra && extra[token] !== undefined ? String(extra[token]) : match;
      });
  }

  function phrases(kind, extra) {
    var set = state.content && state.content.geral ? state.content.geral[kind] : null;
    var list = set && set.length ? set : (window.FALLBACK_CONTENT.geral[kind] || ['']);
    return fill(pickFresh(list, kind), extra);
  }

  function mascotPhrases(kind, extra) {
    var owned = state.mascot && state.content ? state.content[state.mascot.id] : null;
    var list = owned && owned[kind] && owned[kind].length ? owned[kind] : null;
    if (!list) return phrases(kind, extra);
    return fill(pickFresh(list, kind), extra);
  }

  function ensureAudio() {
    if (!state.sound) return null;
    try {
      if (!audioContext) {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        audioContext = new Ctx();
      }
      if (audioContext.state === 'suspended') audioContext.resume();
      return audioContext;
    } catch (error) {
      return null;
    }
  }

  function beep(frequency, delay, duration, type, volume) {
    var ctx = ensureAudio();
    if (!ctx) return;
    try {
      var start = ctx.currentTime + delay;
      var oscillator = ctx.createOscillator();
      var gain = ctx.createGain();
      oscillator.type = type || 'sine';
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume || 0.045, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.02);
    } catch (error) {
      /* o som é um extra */
    }
  }

  function soundCorrect() {
    beep(659.25, 0, 0.12, 'sine', 0.05);
    beep(987.77, 0.1, 0.18, 'sine', 0.045);
  }

  function soundWrong() {
    beep(220, 0, 0.16, 'triangle', 0.045);
  }

  function soundLevelUp() {
    beep(523.25, 0, 0.12, 'sine', 0.05);
    beep(659.25, 0.1, 0.12, 'sine', 0.05);
    beep(783.99, 0.2, 0.12, 'sine', 0.05);
    beep(1046.5, 0.3, 0.26, 'sine', 0.045);
  }

  function soundTimeout() {
    beep(196, 0, 0.1, 'square', 0.03);
    beep(155.56, 0.1, 0.22, 'square', 0.03);
  }

  function soundReveal() {
    beep(392, 0, 0.14, 'sine', 0.04);
    beep(329.63, 0.14, 0.2, 'sine', 0.035);
  }

  function bump(element) {
    element.classList.remove('bump');
    void element.offsetWidth;
    element.classList.add('bump');
  }

  function restartAnimation(element, name) {
    element.classList.remove(name);
    void element.offsetWidth;
    element.classList.add(name);
  }

  function say(message, tone, iconKey) {
    els.bubbleText.textContent = message;
    els.bubble.dataset.tone = tone || 'neutral';

    if (iconKey && ICONS[iconKey]) {
      els.bubbleIcon.innerHTML = ICONS[iconKey];
      els.bubbleIcon.hidden = false;
    } else {
      els.bubbleIcon.innerHTML = '';
      els.bubbleIcon.hidden = true;
    }
  }

  function react(kind) {
    els.gameAvatar.classList.remove('yay', 'oops');
    void els.gameAvatar.offsetWidth;
    els.gameAvatar.classList.add(kind === 'yay' ? 'yay' : 'oops');
  }

  function setAvatar(container, mascot) {
    if (!container) return;
    container.innerHTML = '';

    if (!mascot) return;

    var img = document.createElement('img');
    img.src = mascot.img;
    img.alt = '';
    img.width = 120;
    img.height = 120;
    img.decoding = 'async';
    container.appendChild(img);
  }

  function applyThemeColors(mascot) {
    var bg = mascot ? mascot.bg : '#fde8d4';
    document.documentElement.style.setProperty('--mascot-bg', bg);
  }

  function renderStats() {
    els.statCorrect.textContent = String(state.correctCount);
    els.statMiss.textContent = String(state.missCount);
    els.statStreak.textContent = String(state.streak);
    els.statBest.textContent = String(state.best);
  }

  function formatTime(ms) {
    var total = Math.max(0, Math.ceil(ms / 1000));
    var minutes = Math.floor(total / 60);
    var seconds = total % 60;
    return minutes + ':' + (seconds < 10 ? '0' + seconds : String(seconds));
  }

  function remainingTime() {
    if (!state.dueAt) return state.remaining;
    return Math.max(0, state.dueAt - Date.now());
  }

  function renderTime() {
    var config = levelConfig();
    var remaining = state.paused || !state.dueAt ? state.remaining : remainingTime();

    els.statTime.textContent = formatTime(remaining);
    els.statTime.setAttribute('aria-label', 'Tempo restante: ' + formatTime(remaining));

    var ratio = remaining / (config.seconds * 1000);
    els.statTime.parentNode.classList.toggle('danger', ratio <= 0.2);
    els.statTime.parentNode.classList.toggle('warning', ratio > 0.2 && ratio <= 0.5);
  }

  function stopTimer() {
    if (state.dueAt) {
      state.remaining = Math.max(0, state.dueAt - Date.now());
      state.dueAt = 0;
    }

    if (state.timerId !== null) {
      window.clearInterval(state.timerId);
      state.timerId = null;
    }
    if (state.deadlineId !== null) {
      window.clearTimeout(state.deadlineId);
      state.deadlineId = null;
    }
  }

  function hasPauseReason() {
    for (var reason in state.pauseReasons) {
      if (state.pauseReasons.hasOwnProperty(reason)) return true;
    }
    return false;
  }

  function clearPauseReasons() {
    state.pauseReasons = {};
    state.paused = false;
  }

  function pauseTimer(reason) {
    state.pauseReasons[reason || 'manual'] = true;

    if (state.paused) return;
    if (state.dueAt) {
      state.remaining = Math.max(0, state.dueAt - Date.now());
      state.dueAt = 0;
    }
    state.paused = true;
    stopTimer();
    renderTime();
  }

  function resumeTimer(reason) {
    delete state.pauseReasons[reason || 'manual'];
    if (hasPauseReason() || !state.paused) return;

    state.paused = false;

    if (state.phase === 'answering') {
      if (state.remaining > 0) {
        armDeadline(state.remaining);
      } else {
        timeUp();
      }
    }

    renderTime();
  }

  function armDeadline(ms) {
    stopTimer();

    state.dueAt = Date.now() + ms;
    state.remaining = ms;
    renderTime();

    state.timerId = window.setInterval(renderTime, 250);
    state.deadlineId = window.setTimeout(function () {
      state.dueAt = 0;
      state.remaining = 0;
      stopTimer();
      timeUp();
    }, ms);
  }

  function startQuestionTimer() {
    var config = levelConfig();
    var ms = config.seconds * 1000;

    if (state.paused) {
      state.dueAt = 0;
      state.remaining = ms;
      renderTime();
      return;
    }

    armDeadline(ms);
  }

  function resetTimerDisplay() {
    var config = levelConfig();
    state.dueAt = 0;
    clearPauseReasons();
    state.remaining = config.seconds * 1000;
    renderTime();
  }

  function sanitizeRecords(list) {
    if (!list || Object.prototype.toString.call(list) !== '[object Array]') return [];

    return list.filter(function (item) {
      return item && typeof item.streak === 'number' && typeof item.at === 'number';
    }).slice(0, 10);
  }

  function encodeRecords(list) {
    return list.map(function (item) {
      return item.streak + '.' + item.at;
    }).join(';');
  }

  function decodeRecords(raw) {
    if (!raw) return [];

    return raw.split(';').map(function (chunk) {
      var dot = chunk.indexOf('.');
      if (dot <= 0) return null;

      var streak = parseInt(chunk.slice(0, dot), 10);
      var at = parseInt(chunk.slice(dot + 1), 10);
      if (!streak || !at) return null;

      return { streak: streak, at: at };
    }).filter(Boolean).slice(0, 10);
  }

  function readRecords() {
    var fromCookie = sanitizeRecords(decodeRecords(getCookie(COOKIE.records)));
    var fromStore = [];

    try {
      var raw = window.localStorage.getItem(STORAGE.records);
      fromStore = sanitizeRecords(raw ? JSON.parse(raw) : []);
    } catch (error) {
      fromStore = [];
    }

    var best = fromStore.length >= fromCookie.length ? fromStore : fromCookie;

    return best.slice().sort(function (a, b) {
      return b.streak - a.streak;
    });
  }

  function writeRecords() {
    var payload = JSON.stringify(state.records);

    try {
      window.localStorage.setItem(STORAGE.records, payload);
    } catch (error) {
      /* ignora */
    }

    var compact = encodeRecords(state.records);
    if (compact.length <= COOKIE_LIMIT) {
      setCookie(COOKIE.records, compact, PROFILE_TTL);
    }
  }

  function startSessionRecord() {
    state.sessionPeak = 0;
    state.sessionStart = Date.now();
    state.sessionRecorded = false;
  }

  function finalizeSession() {
    if (state.sessionRecorded) return;
    if (state.sessionPeak <= 0) return;

    state.sessionRecorded = true;
    state.records.push({ streak: state.sessionPeak, at: state.sessionStart || Date.now() });
    state.records.sort(function (a, b) {
      if (b.streak !== a.streak) return b.streak - a.streak;
      return b.at - a.at;
    });
    state.records = state.records.slice(0, 10);
    writeRecords();
  }

  function updateBest() {
    if (state.streak > state.sessionPeak) state.sessionPeak = state.streak;

    if (state.streak <= state.best) return;
    state.best = state.streak;
    writeStored(STORAGE.best, state.best);
    bump(els.statBest);
  }

  function resetStreak() {
    if (state.streak === 0) return;

    state.streak = 0;
    renderStats();
    bump(els.statStreak);
  }

  function renderAnswer() {
    var slot = answerSlot();
    var hasInput = state.input.length > 0;

    slot.textContent = hasInput ? state.input : '?';
    slot.classList.toggle('is-empty', !hasInput);
  }

  /*
   * How many digits the correct answer has. A dropped key press leaves a short
   * answer that is wrong only because of the keyboard, so the confirm key stays
   * unavailable until the count matches exactly. Too many digits is refused for
   * the same reason: 100 is not an attempt at 10.
   */
  function expectedDigits() {
    var answer = questionAnswer(state.question);
    return String(Math.abs(answer)).length;
  }

  function canSubmit() {
    if (state.phase !== 'answering' || state.busy) return false;
    return state.input.length === expectedDigits();
  }

  function updateConfirm() {
    var typing = state.phase === 'answering' && !state.busy;
    var full = state.input.length >= MAX_INPUT;
    var keys = els.keypad.querySelectorAll('button[data-key]');
    var index;
    var key;

    /*
     * Digits stay usable up to the hard limit, even past the expected length,
     * so a child can type 100 for an answer of 10 and be refused rather than
     * find the keypad dead. Only the confirm key enforces the digit count.
     */
    for (index = 0; index < keys.length; index += 1) {
      key = keys[index];
      key.disabled = /^[0-9]$/.test(key.dataset.key) ? !typing || full : !typing;
    }

    els.confirm.disabled = !canSubmit();
  }

  function clearAdvance() {
    if (advanceTimer !== null) {
      window.clearTimeout(advanceTimer);
      advanceTimer = null;
    }
  }

  function scheduleAdvance(fn, delay) {
    clearAdvance();
    advanceTimer = window.setTimeout(fn, delay);
  }

  function levelConfig(level) {
    var target = level || state.level;
    for (var i = 0; i < LEVELS.length; i += 1) {
      if (LEVELS[i].level === target) return LEVELS[i];
    }
    return LEVELS[0];
  }

  function nextLevelConfig(level) {
    for (var i = 0; i < LEVELS.length; i += 1) {
      if (LEVELS[i].level === level + 1) return LEVELS[i];
    }
    return null;
  }

  function readLevel() {
    var fromCookie = parseInt(getCookie(COOKIE.level), 10);
    var fromStore = parseInt(readStored(STORAGE.level, '0'), 10);
    var value = Math.max(fromCookie || 0, fromStore || 0);

    if (value < 1 || value > LEVELS.length) return 1;
    return value;
  }

  function writeLevel() {
    var value = String(state.level);
    writeStored(STORAGE.level, value);
    setCookie(COOKIE.level, value, PROFILE_TTL);
  }

  function renderLevel() {
    var config = levelConfig();

    if (els.levelEmoji) els.levelEmoji.textContent = config.emoji;
    if (els.levelText) els.levelText.textContent = 'Nível ' + config.level;
    if (els.levelBadge) {
      els.levelBadge.setAttribute('title', 'Nível ' + config.level + ' — ' + config.name);
      els.levelBadge.setAttribute('aria-label', 'Nível ' + config.level + ', ' + config.name);
    }
  }

  function factKey(a, b) {
    return a + 'x' + b;
  }

  function encodeProgress(fatos, savedAt) {
    var keys = Object.keys(fatos).sort();
    var parts = [];

    keys.forEach(function (key) {
      var entry = fatos[key];
      var ok = entry.ok || 0;
      var second = entry.second || 0;
      var fail = entry.fail || 0;
      if (!ok && !second && !fail) return;
      parts.push(key + ':' + ok + ',' + second + ',' + fail);
    });

    return String(savedAt) + '|' + parts.join(';');
  }

  function decodeProgress(raw) {
    if (!raw) return null;

    if (raw.charAt(0) === '{') {
      try {
        var legacy = JSON.parse(raw);
        if (!legacy || typeof legacy !== 'object') return null;
        if (legacy.fatos && typeof legacy.fatos === 'object') return legacy;
        return { savedAt: Date.now(), fatos: legacy };
      } catch (error) {
        return null;
      }
    }

    var split = raw.indexOf('|');
    if (split <= 0) return null;

    var savedAt = parseInt(raw.slice(0, split), 10);
    if (!savedAt) return null;

    var fatos = {};
    var body = raw.slice(split + 1);

    if (body) {
      body.split(';').forEach(function (chunk) {
        var colon = chunk.indexOf(':');
        if (colon <= 0) return;

        var counts = chunk.slice(colon + 1).split(',');
        var key = chunk.slice(0, colon);

        fatos[key] = {
          ok: parseInt(counts[0], 10) || 0,
          second: parseInt(counts[1], 10) || 0,
          fail: parseInt(counts[2], 10) || 0,
          last: 0,
          lastOk: 0
        };
      });
    }

    return { savedAt: savedAt, fatos: fatos };
  }

  function readLegacyRecency() {
    try {
      var raw = window.localStorage.getItem(STORAGE.progress);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      var fatos = parsed && parsed.fatos ? parsed.fatos : parsed;
      return fatos && typeof fatos === 'object' ? fatos : {};
    } catch (error) {
      return {};
    }
  }

  function mergeRecency(fatos) {
    var recency = readLegacyRecency();

    Object.keys(fatos).forEach(function (key) {
      var extra = recency[key];
      if (!extra) return;
      if (extra.last) fatos[key].last = extra.last;
      if (extra.lastOk) fatos[key].lastOk = extra.lastOk;
    });

    return fatos;
  }

  function readProgress() {
    var fromCookie = decodeProgress(getCookie(COOKIE.progress));
    var fromStore = decodeProgress(readStoreProgress());

    var candidates = [fromCookie, fromStore].filter(function (data) {
      if (!data) return false;
      var age = (Date.now() - data.savedAt) / 1000;
      return age >= 0 && age <= PROGRESS_TTL;
    });

    candidates.sort(function (a, b) {
      return Object.keys(b.fatos).length - Object.keys(a.fatos).length;
    });

    if (!candidates.length) return {};
    return mergeRecency(candidates[0].fatos);
  }

  function readStoreProgress() {
    try {
      return window.localStorage.getItem(STORAGE.progress);
    } catch (error) {
      return '';
    }
  }

  function saveProgress() {
    if (Object.keys(state.progress).length === 0) return;

    var savedAt = Date.now();
    var compact = encodeProgress(state.progress, savedAt);
    var full = JSON.stringify({ savedAt: savedAt, fatos: state.progress });

    try {
      window.localStorage.setItem(STORAGE.progress, full);
    } catch (error) {
      /* ignora */
    }

    if (compact.length <= COOKIE_LIMIT) {
      setCookie(COOKIE.progress, compact, PROGRESS_TTL);
    }
  }

  function recordResult(a, b, kind) {
    var key = factKey(a, b);
    var entry = state.progress[key] || { ok: 0, second: 0, fail: 0, last: 0, lastOk: 0 };

    if (kind === 'ok') {
      entry.ok += 1;
      entry.lastOk = Date.now();
    } else if (kind === 'second') {
      entry.second += 1;
      entry.lastOk = Date.now();
    } else {
      entry.fail += 1;
      entry.last = Date.now();
    }

    state.progress[key] = entry;
    saveProgress();
  }

  function factWeight(a, b) {
    var entry = state.progress[factKey(a, b)];
    if (!entry) return PRIORITY.nova;

    var weight = PRIORITY.nova;

    if (entry.fail > 0) {
      weight = PRIORITY.falhou * (1 + entry.fail);
      if (entry.ok > 0 || entry.second > 0) weight *= 0.6;
    } else if (entry.second > 0) {
      weight = PRIORITY.acertouSegunda;
    } else if (entry.ok > 0) {
      weight = PRIORITY.acertouPrimeira / entry.ok;
    }

    if (entry.lastOk) {
      var minutes = (Date.now() - entry.lastOk) / 60000;
      if (minutes < 3) {
        weight *= 0.12;
      } else if (minutes < 12) {
        weight *= 0.45;
      }
    }

    return Math.max(0.05, weight);
  }

  function chooseFact() {
    var pool = [];
    var total = 0;
    var config = levelConfig();
    var min = config.excludeOne ? 2 : 1;
    var max = config.maxTable;
    var a;
    var b;

    for (a = min; a <= max; a += 1) {
      for (b = min; b <= max; b += 1) {
        var weight = factWeight(a, b);

        if (a === state.a && b === state.b) weight *= 0.08;
        if (a === state.b && b === state.a) weight *= 0.6;

        pool.push({ a: a, b: b, weight: weight });
        total += weight;
      }
    }

    var target = Math.random() * total;
    for (var index = 0; index < pool.length; index += 1) {
      target -= pool[index].weight;
      if (target <= 0) return pool[index];
    }

    return pool[pool.length - 1];
  }

  function buildQuestion() {
    var pick = chooseFact();
    var config = levelConfig();
    var a = pick.a;
    var b = pick.b;
    var kind = 'product';

    if (config.equations && Math.random() < EQUATION_CHANCE) {
      kind = Math.random() < 0.5 ? 'missingA' : 'missingB';
    }

    return { kind: kind, a: a, b: b, product: a * b };
  }

  function questionAnswer(q) {
    if (q.kind === 'missingA') return q.a;
    if (q.kind === 'missingB') return q.b;
    return q.product;
  }

  function questionLabel(q) {
    if (q.kind === 'missingA') return '? vezes ' + q.b + ' igual a ' + q.product;
    if (q.kind === 'missingB') return q.a + ' vezes ? igual a ' + q.product;
    return 'Quanto é ' + q.a + ' vezes ' + q.b + '?';
  }

  function answerSlot() {
    var kind = state.question.kind;
    if (kind === 'missingA') return els.slotA;
    if (kind === 'missingB') return els.slotB;
    return els.slotR;
  }

  function renderQuestion() {
    var q = state.question;

    [els.slotA, els.slotB, els.slotR].forEach(function (slot) {
      slot.classList.remove('is-answer', 'is-empty', 'flash', 'pop');
      slot.removeAttribute('aria-label');
    });

    if (q.kind === 'missingA') {
      els.slotA.textContent = '?';
      els.slotA.classList.add('is-unknown');
      els.slotB.textContent = String(q.b);
      els.slotB.classList.remove('is-unknown');
      els.slotR.textContent = String(q.product);
    } else if (q.kind === 'missingB') {
      els.slotA.textContent = String(q.a);
      els.slotA.classList.remove('is-unknown');
      els.slotB.textContent = '?';
      els.slotB.classList.add('is-unknown');
      els.slotR.textContent = String(q.product);
    } else {
      els.slotA.textContent = String(q.a);
      els.slotB.textContent = String(q.b);
      els.slotA.classList.remove('is-unknown');
      els.slotB.classList.remove('is-unknown');
      els.slotR.textContent = '?';
    }

    var slot = answerSlot();
    slot.classList.add('is-answer', 'is-empty');
    slot.setAttribute('aria-label', 'A tua resposta');

    els.card.classList.remove('is-correct', 'is-revealed');
    els.keypad.hidden = false;
    els.next.hidden = true;
    els.srQuestion.textContent = questionLabel(q);
  }

  function newQuestion() {
    clearAdvance();

    state.question = buildQuestion();
    state.a = state.question.a;
    state.b = state.question.b;
    state.input = '';
    state.attempt = 1;
    state.phase = 'answering';
    state.busy = false;

    renderQuestion();
    say(mascotPhrases('perguntar'), 'neutral');
    renderAnswer();
    renderStats();
    updateConfirm();
    restartAnimation(els.question, 'pop');
    startQuestionTimer();
  }

  function pressDigit(digit) {
    if (state.phase !== 'answering' || state.busy) return;
    if (state.input.length >= MAX_INPUT) return;

    state.input = state.input === '0' ? digit : state.input + digit;
    renderAnswer();
    updateConfirm();
  }

  function pressDelete() {
    if (state.phase !== 'answering' || state.busy) return;
    state.input = state.input.slice(0, -1);
    renderAnswer();
    updateConfirm();
  }

  function burstConfetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var colors = ['#6750a4', '#eaddff', '#f9a8d4', '#ffd76e', '#7ccb7f', '#a78bfa'];
    var fragment = document.createDocumentFragment();
    var count = 18;

    for (var index = 0; index < count; index += 1) {
      var piece = document.createElement('i');
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = (Math.random() * 0.25).toFixed(2) + 's';
      piece.style.transform = 'rotate(' + Math.floor(Math.random() * 180) + 'deg)';
      fragment.appendChild(piece);
    }

    els.confetti.appendChild(fragment);
    window.setTimeout(function () {
      els.confetti.innerHTML = '';
    }, 2000);
  }

  function submit() {
    if (state.phase !== 'answering' || state.busy) return;

    if (!state.input) {
      restartAnimation(answerSlot(), 'flash');
      return;
    }

    if (!canSubmit()) {
      restartAnimation(answerSlot(), 'flash');
      say(state.input.length < expectedDigits()
        ? 'Faltam números.'
        : 'São números a mais.', 'err', 'error');
      return;
    }

    var expected = questionAnswer(state.question);
    var value = Number(state.input);

    if (value === expected) {
      var firstTry = state.attempt === 1;

      state.busy = true;
      state.phase = 'correct';
      state.correctCount += 1;
      recordResult(state.a, state.b, firstTry ? 'ok' : 'second');

      if (firstTry) {
        state.firstTryCount += 1;
        state.streak += 1;
        updateBest();
      } else {
        state.secondTryCount += 1;
      }

      stopTimer();
      els.card.classList.add('is-correct');
      restartAnimation(answerSlot(), 'pop');
      say(mascotPhrases(firstTry ? 'acertou' : 'acertouSegunda'), 'ok', 'check');
      react('yay');
      soundCorrect();
      burstConfetti();
      renderStats();
      bump(els.statCorrect);
      if (firstTry) bump(els.statStreak);
      updateConfirm();

      if (firstTry && checkLevelUp()) return;

      scheduleAdvance(newQuestion, 1250);
      return;
    }

    state.missCount += 1;

    if (state.attempt === 1) {
      state.missFirst += 1;
      state.attempt = 2;
      state.input = '';
      resetStreak();
      renderStats();
      bump(els.statMiss);
      say(mascotPhrases('errou'), 'err', 'error');
      react('oops');
      soundWrong();
      renderAnswer();
      updateConfirm();
      restartAnimation(els.question, 'shake');
      return;
    }

    stopTimer();
    state.missSecond += 1;
    state.phase = 'revealed';
    state.input = String(expected);
    state.busy = false;
    recordResult(state.a, state.b, 'fail');
    resetStreak();
    bump(els.statMiss);
    els.card.classList.add('is-revealed');
    restartAnimation(answerSlot(), 'pop');
    say(mascotPhrases('revelou'), 'info', 'bulb');
    react('oops');
    soundReveal();
    renderAnswer();
    renderStats();
    updateConfirm();
    els.keypad.hidden = true;
    els.next.hidden = false;
    els.next.focus({ preventScroll: true });

    scheduleAdvance(newQuestion, 7000);
  }

  function saveQuestionForResume() {
    if (state.phase !== 'answering') {
      state.savedQuestion = null;
      return;
    }

    state.savedQuestion = {
      question: {
        kind: state.question.kind,
        a: state.question.a,
        b: state.question.b,
        product: state.question.product
      },
      input: state.input,
      attempt: state.attempt,
      remaining: state.paused || !state.dueAt ? state.remaining : remainingTime()
    };
  }

  function resumeSavedQuestion() {
    var saved = state.savedQuestion;
    state.savedQuestion = null;

    if (!saved || !saved.question) return false;

    state.question = saved.question;
    state.a = saved.question.a;
    state.b = saved.question.b;
    state.input = saved.input;
    state.attempt = saved.attempt;
    state.phase = 'answering';
    state.busy = false;

    renderQuestion();
    renderAnswer();
    renderStats();
    updateConfirm();
    startQuestionTimerFrom(saved.remaining);

    return true;
  }

  function startQuestionTimerFrom(ms) {
    if (state.paused) {
      state.remaining = ms;
      renderTime();
      return;
    }
    armDeadline(Math.max(500, ms));
  }

  function timeUp() {
    if (state.phase !== 'answering' || state.busy) return;

    var expected = questionAnswer(state.question);

    state.busy = true;
    state.missCount += 1;
    state.missSecond += 1;
    state.phase = 'revealed';
    state.input = String(expected);
    recordResult(state.a, state.b, 'fail');
    resetStreak();
    bump(els.statMiss);

    els.card.classList.add('is-revealed');
    restartAnimation(answerSlot(), 'pop');
    say(mascotPhrases('tempo'), 'err', 'error');
    react('oops');
    soundTimeout();
    renderAnswer();
    renderStats();
    updateConfirm();
    els.keypad.hidden = true;
    els.next.hidden = false;
    els.next.focus({ preventScroll: true });

    scheduleAdvance(newQuestion, 7000);
  }

  function showLevelUp(config) {
    if (!els.levelUp) return;

    els.levelUpEmoji.textContent = config.emoji;
    els.levelUpTitle.textContent = 'Nível ' + config.level;
    els.levelUpName.textContent = config.name;
    els.levelUp.hidden = false;

    burstConfetti();
    burstConfetti();
    soundLevelUp();
  }

  function hideLevelUp() {
    if (!els.levelUp) return;
    els.levelUp.hidden = true;
  }

  function checkLevelUp() {
    var next = nextLevelConfig(state.level);
    if (!next) return false;
    if (state.streak < next.unlockStreak) return false;

    state.level = next.level;
    writeLevel();
    renderLevel();

    if (els.levelBadge) {
      restartAnimation(els.levelBadge, 'pop');
    }

    state.streak = 0;
    renderStats();

    showLevelUp(next);
    say(mascotPhrases('nivel'), 'ok', 'star');

    state.paused = true;
    state.pauseReasons.levelUp = true;
    stopTimer();

    window.setTimeout(function () {
      hideLevelUp();
      delete state.pauseReasons.levelUp;
      state.paused = hasPauseReason();
      newQuestion();
    }, 2600);

    return true;
  }

  function nextQuestion() {
    if (state.phase !== 'revealed') return;
    newQuestion();
  }

  function updateSoundButton() {
    els.soundToggle.setAttribute('aria-pressed', state.sound ? 'true' : 'false');
    els.soundToggle.setAttribute('aria-label', state.sound ? 'Desativar efeitos sonoros' : 'Ativar efeitos sonoros');
  }

  function updateThemeButton() {
    var dark = document.documentElement.dataset.theme === 'dark';
    els.themeToggle.setAttribute('aria-label', dark ? 'Mudar para tema diurno' : 'Mudar para tema noturno');
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    writeStored(STORAGE.theme, theme);
    updateThemeButton();
  }

  function spawnRipple(button, event) {
    if (!button || button.disabled) return;
    var rect = button.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height) * 1.7;
    var x = (event.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
    var y = (event.clientY || rect.top + rect.height / 2) - rect.top - size / 2;

    var ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    button.appendChild(ripple);

    ripple.addEventListener('animationend', function () {
      ripple.remove();
    });
  }

  function renderMascotOptions() {
    els.mascotGrid.innerHTML = '';

    window.MASCOTS.forEach(function (mascot) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'mascot-option';
      button.dataset.mascot = mascot.id;
      button.setAttribute('aria-pressed', 'false');
      button.style.setProperty('--option-bg', mascot.bg);

      var avatar = document.createElement('span');
      avatar.className = 'mascot-option-avatar';

      var img = document.createElement('img');
      img.src = mascot.img;
      img.alt = '';
      img.width = 120;
      img.height = 120;
      img.loading = 'lazy';
      img.decoding = 'async';
      avatar.appendChild(img);

      var label = document.createElement('span');
      label.className = 'mascot-option-name';
      label.textContent = mascot.name;

      img.addEventListener('load', refreshMascotPages, { once: true });

      button.appendChild(avatar);
      button.appendChild(label);
      button.setAttribute('aria-label', mascot.name);

      els.mascotGrid.appendChild(button);
    });

    renderMascotPages();
    updateScrollHint();
  }

  function refreshMascotPages() {
    renderMascotPages();
    updateScrollHint();
  }

  function mascotPageCount() {
    if (!els.mascotGrid) return 1;
    var grid = els.mascotGrid;
    var max = Math.max(0, grid.scrollWidth - grid.clientWidth);
    if (max <= 4) return 1;
    return Math.ceil(grid.scrollWidth / grid.clientWidth);
  }

  function currentMascotPage() {
    var grid = els.mascotGrid;
    if (!grid) return 0;
    var max = Math.max(1, grid.scrollWidth - grid.clientWidth);
    var ratio = Math.min(1, Math.max(0, grid.scrollLeft / max));
    return Math.round(ratio * (mascotPageCount() - 1));
  }

  function renderMascotPages() {
    if (!els.mascotPages) return;

    var total = mascotPageCount();
    els.mascotPages.innerHTML = '';

    for (var i = 0; i < total; i += 1) {
      var dot = document.createElement('i');
      els.mascotPages.appendChild(dot);
    }
  }

  function updateScrollHint() {
    if (!els.mascotScroller || !els.mascotGrid) return;

    var grid = els.mascotGrid;
    var max = grid.scrollWidth - grid.clientWidth;
    var canScroll = max > 4;
    var atEnd = grid.scrollLeft >= max - 4;
    var active = currentMascotPage();

    els.mascotScroller.classList.toggle('can-scroll-right', canScroll && !atEnd);

    if (els.mascotPages) {
      Array.prototype.forEach.call(els.mascotPages.children, function (dot, index) {
        dot.classList.toggle('is-active', index === active);
        dot.classList.toggle('is-near', Math.abs(index - active) === 1);
      });
    }

    if (els.mascotHint) {
      els.mascotHint.hidden = !canScroll || atEnd;
    }
  }

  function scrollMascotsBy(direction) {
    var grid = els.mascotGrid;
    if (!grid) return;

    var amount = Math.max(120, grid.clientWidth * 0.8);
    grid.scrollLeft += direction * amount;
  }

  function attachMascotDrag() {
    var grid = els.mascotGrid;
    if (!grid) return;

    var dragging = false;
    var captured = false;
    var startX = 0;
    var startScroll = 0;
    var moved = false;

    grid.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      dragging = true;
      moved = false;
      startX = event.clientX;
      startScroll = grid.scrollLeft;
    });

    grid.addEventListener('pointermove', function (event) {
      if (!dragging) return;
      var delta = event.clientX - startX;
      if (Math.abs(delta) > 4) moved = true;
      if (!moved) return;
      if (event.cancelable) event.preventDefault();

      if (!captured && grid.setPointerCapture) {
        captured = true;
        try { grid.setPointerCapture(event.pointerId); } catch (error) { /* ignora */ }
      }

      grid.scrollLeft = startScroll - delta;
      updateScrollHint();
    });

    function stopDrag() {
      dragging = false;
      captured = false;
    }

    grid.addEventListener('pointerup', stopDrag);
    grid.addEventListener('pointercancel', stopDrag);

    grid.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-mascot]');

      if (moved) {
        event.preventDefault();
        event.stopPropagation();
        moved = false;
        return;
      }

      if (button && button.dataset.mascot) {
        selectMascot(button.dataset.mascot);
      }
    });

    grid.addEventListener('scroll', updateScrollHint, { passive: true });

    grid.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollMascotsBy(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollMascotsBy(-1);
      }
    });
  }

  function selectMascot(id) {
    state.mascot = window.MASCOTS.filter(function (item) { return item.id === id; })[0] || null;

    Array.prototype.forEach.call(els.mascotGrid.children, function (button) {
      button.setAttribute('aria-pressed', button.dataset.mascot === id ? 'true' : 'false');
    });

    applyThemeColors(state.mascot);
    setAvatar(els.setupAvatar, state.mascot);

    if (state.mascot) {
      els.startBtn.disabled = false;
      els.coachPreview.hidden = false;
      els.setupBubbleText.textContent = fill(ownedHello(state.mascot), {});
      if (els.setupName) els.setupName.textContent = state.mascot.name;
      scrollMascotIntoView(id);
    } else {
      els.startBtn.disabled = true;
      els.coachPreview.hidden = true;
    }

    refreshMascotPages();
  }

  function scrollMascotIntoView(id) {
    var grid = els.mascotGrid;
    var button = grid.querySelector('button[data-mascot="' + id + '"]');
    if (!button) return;

    var left = button.offsetLeft - grid.offsetLeft;
    var right = left + button.offsetWidth;
    var viewLeft = grid.scrollLeft;
    var viewRight = viewLeft + grid.clientWidth;

    if (left < viewLeft) {
      grid.scrollLeft = left - 4;
    } else if (right > viewRight) {
      grid.scrollLeft = right - grid.clientWidth + 4;
    }
  }

  function ownedHello(mascot) {
    var owned = state.content ? state.content[mascot.id] : null;
    var fallback = 'Olá! Eu sou ' + (mascot.article || 'o') + ' ' + mascot.name + '.';

    if (!owned || !owned.ola) return fallback;

    if (Object.prototype.toString.call(owned.ola) === '[object Array]') {
      return pick(owned.ola) || fallback;
    }

    return owned.ola;
  }

  function startGame() {
    if (!state.mascot || !state.name) return;

    var resuming = !!state.savedQuestion;

    if (!resuming) {
      finalizeSession();
      startSessionRecord();
    }

    writeStored(STORAGE.name, state.name);
    writeStored(STORAGE.mascot, state.mascot.id);
    setProfileCookies(state.name, state.mascot.id);

    els.setup.hidden = true;
    els.game.hidden = false;
    els.editBtn.hidden = false;
    els.soundToggle.hidden = false;

    setAvatar(els.gameAvatar, state.mascot);
    if (els.gameName) els.gameName.textContent = state.mascot.name;
    applyThemeColors(state.mascot);

    if (!resuming) clearPauseReasons();
    delete state.pauseReasons.setup;
    state.paused = hasPauseReason();
    renderLevel();

    var resumed = resumeSavedQuestion();
    if (!resumed) {
      resetTimerDisplay();
      newQuestion();
    }

    updateSoundButton();

    if (resuming) {
      say(mascotPhrases('perguntar'), 'neutral');
    } else {
      say(fill(ownedHello(state.mascot), {}), 'info');
      window.setTimeout(function () {
        if (state.phase === 'answering' && state.attempt === 1 && !state.input) {
          say(mascotPhrases('perguntar'), 'neutral');
        }
      }, 2400);
    }
  }

  function goToMascotStep() {
    els.nameStep.hidden = true;
    els.mascotStep.hidden = false;
    els.stepDot1.classList.remove('is-active');
    els.stepDot2.classList.add('is-active');

    if (state.mascot) {
      els.mascotTitle.textContent = 'Olá, ' + state.name + '!';
      els.mascotText.textContent = 'Queres manter o ' + state.mascot.name + ' ou escolher outro?';
    } else {
      els.mascotTitle.textContent = 'Olá, ' + state.name + '!';
      els.mascotText.textContent = 'Quem queres que te faça as perguntas?';
    }

    els.startBtn.textContent = 'Vamos jogar, ' + state.name + '!';
    els.startBtn.disabled = !state.mascot;

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(refreshMascotPages);
    }
    window.requestAnimationFrame(refreshMascotPages);

    if (state.mascot) {
      els.coachPreview.hidden = false;
      setAvatar(els.setupAvatar, state.mascot);
      els.setupBubbleText.textContent = fill(ownedHello(state.mascot), {});
    }
  }

  function resetToSetup(keepValues, keepSession) {
    clearAdvance();
    stopTimer();
    finalizeSession();

    if (keepSession) {
      saveQuestionForResume();
      pauseTimer('setup');
    } else {
      state.savedQuestion = null;
      clearPauseReasons();
    }

    state.phase = 'answering';
    state.busy = false;
    state.input = '';

    if (!keepSession) {
      state.correctCount = 0;
      state.missCount = 0;
      state.firstTryCount = 0;
      state.secondTryCount = 0;
      state.missFirst = 0;
      state.missSecond = 0;
      state.streak = 0;
      startSessionRecord();
      resetTimerDisplay();
    }

    els.game.hidden = true;
    els.setup.hidden = false;
    els.editBtn.hidden = true;

    els.nameStep.hidden = false;
    els.mascotStep.hidden = true;
    els.stepDot1.classList.add('is-active');
    els.stepDot2.classList.remove('is-active');
    els.nameError.hidden = true;

    if (!keepValues) {
      state.name = '';
      state.mascot = null;
      els.nameInput.value = '';
      els.startBtn.disabled = true;
      els.coachPreview.hidden = true;
      Array.prototype.forEach.call(els.mascotGrid.children, function (button) {
        button.setAttribute('aria-pressed', 'false');
      });
    } else {
      els.nameInput.value = state.name;
    }

    applyThemeColors(state.mascot);
    renderStats();
  }

  function loadContent() {
    if (!window.fetch) return Promise.resolve();

    return window.fetch('content.json', { cache: 'no-cache' })
      .then(function (response) {
        if (!response.ok) throw new Error('content.json indisponível');
        return response.json();
      })
      .then(function (data) {
        if (!data || typeof data !== 'object') return;

        state.content = { geral: data.geral || window.FALLBACK_CONTENT.geral };
        (data.mascotes || []).forEach(function (mascot) {
          if (mascot && mascot.id) state.content[mascot.id] = mascot;
        });

        if (state.mascot) {
          els.setupBubbleText.textContent = fill(ownedHello(state.mascot), {});
        }
      })
      .catch(function () {
        /* offline ou ficheiro em falta: usamos as frases de recurso */
      });
  }

  function showNameError(message) {
    els.nameError.textContent = message;
    els.nameError.hidden = false;
    els.nameInput.focus();
  }

  els.nameForm.addEventListener('submit', function (event) {
    event.preventDefault();

    var value = els.nameInput.value.replace(/\s+/g, ' ').trim();

    if (value.length < 2) {
      showNameError('Escreve um nome de jogo para continuar.');
      return;
    }

    if (/\s/.test(value)) {
      showNameError('Usa só uma palavra, como um apelido divertido.');
      return;
    }

    els.nameError.hidden = true;
    state.name = value.charAt(0).toUpperCase() + value.slice(1);
    goToMascotStep();
    els.mascotGrid.querySelector('button').focus({ preventScroll: true });
  });

  els.nameInput.addEventListener('input', function () {
    if (!els.nameError.hidden) els.nameError.hidden = true;
  });

  els.startBtn.addEventListener('click', startGame);

  function plural(count, singular, pluralForm) {
    return count + ' ' + (count === 1 ? singular : pluralForm);
  }

  function formatRecordDate(timestamp) {
    try {
      return new Date(timestamp).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return '';
    }
  }

  function currentSessionRecord() {
    if (state.sessionPeak <= 0) return null;
    if (state.sessionRecorded) return null;

    return {
      streak: state.sessionPeak,
      at: state.sessionStart || Date.now(),
      live: true
    };
  }

  function visibleRecords() {
    var live = currentSessionRecord();
    var list = state.records.slice();

    if (live) list.push(live);

    list.sort(function (a, b) {
      if (b.streak !== a.streak) return b.streak - a.streak;
      return b.at - a.at;
    });

    return list.slice(0, 10);
  }

  function renderRecords() {
    if (!els.recordList) return;

    els.recordList.innerHTML = '';
    var records = visibleRecords();

    if (!records.length) {
      els.bestLead.textContent = 'Ainda não há recordes.';
      els.bestNote.hidden = true;

      var empty = document.createElement('li');
      empty.className = 'detail-empty';
      empty.textContent = 'Acerta várias contas seguidas à primeira para começares uma série.';
      els.recordList.appendChild(empty);
      return;
    }

    els.bestLead.textContent = 'A tua melhor série é de ' + records[0].streak + ' seguidas.';
    els.bestNote.hidden = false;

    records.forEach(function (item, index) {
      var row = document.createElement('li');
      if (item.live) row.className = 'is-live';

      var rank = document.createElement('span');
      rank.className = 'record-rank';
      rank.textContent = item.live ? '•' : (index + 1) + '.';

      var value = document.createElement('span');
      value.className = 'record-value';
      value.textContent = item.streak + ' seguidas';

      var date = document.createElement('span');
      date.className = 'record-date';

      if (item.live) {
        date.textContent = 'agora';
      } else {
        date.textContent = formatRecordDate(item.at);
      }

      row.appendChild(rank);
      row.appendChild(value);
      row.appendChild(date);
      els.recordList.appendChild(row);
    });
  }

  function renderSessionDialogs() {
    if (els.correctLead) {
      els.correctLead.textContent = plural(state.correctCount, 'acerto', 'acertos') + '.';
      els.correctSplit.textContent =
        state.firstTryCount + ' à primeira, ' + state.secondTryCount + ' à segunda.';
    }

    if (els.missLead) {
      els.missLead.textContent = plural(state.missCount, 'falha', 'falhas') + '.';
      els.missSplit.textContent =
        state.missFirst + ' na primeira tentativa, ' + state.missSecond + ' na segunda.';
    }
  }

  function openDialog(dialog, render) {
    if (!dialog) return;

    if (typeof render === 'function') render();

    if (!els.game.hidden) pauseTimer('dialog');

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }

    var body = dialog.querySelector('.sheet-body');
    if (body) body.scrollTop = 0;

    var title = dialog.querySelector('.sheet-title');
    if (title && title.focus) title.focus({ preventScroll: true });
  }

  function closeDialog(dialog) {
    if (!dialog) return;

    if (dialog.open === true && typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
    }

    resumeTimer('dialog');
  }

  function openAbout() {
    if (!els.aboutDialog) return;

    if (els.appVersion) els.appVersion.textContent = APP_VERSION;

    if (!els.game.hidden) pauseTimer('dialog');

    if (typeof els.aboutDialog.showModal === 'function') {
      els.aboutDialog.showModal();
    } else {
      els.aboutDialog.setAttribute('open', '');
    }

    var body = els.aboutDialog.querySelector('.sheet-body');
    if (body) body.scrollTop = 0;

    var title = els.aboutDialog.querySelector('.sheet-title');
    if (title && title.focus) title.focus({ preventScroll: true });
  }

  els.aboutBtn.addEventListener('click', openAbout);

  var installPrompt = null;

  function updateInstallButton() {
    if (!els.installBtn) return;
    els.installBtn.hidden = installPrompt === null;
  }

  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    installPrompt = event;
    updateInstallButton();
  });

  window.addEventListener('appinstalled', function () {
    installPrompt = null;
    updateInstallButton();
  });

  if (els.installBtn) {
    els.installBtn.addEventListener('click', function () {
      if (!installPrompt) return;

      installPrompt.prompt();
      installPrompt.userChoice.then(function () {
        installPrompt = null;
        updateInstallButton();
      }).catch(function () {
        installPrompt = null;
        updateInstallButton();
      });
    });
  }

  updateInstallButton();

  if (els.statCorrectBtn) {
    els.statCorrectBtn.addEventListener('click', function () {
      openDialog(els.correctDialog, renderSessionDialogs);
    });
  }

  if (els.statMissBtn) {
    els.statMissBtn.addEventListener('click', function () {
      openDialog(els.missDialog, renderSessionDialogs);
    });
  }

  if (els.statBestBtn) {
    els.statBestBtn.addEventListener('click', function () {
      openDialog(els.bestDialog, renderRecords);
    });
  }

  [els.correctDialog, els.missDialog, els.bestDialog].forEach(function (dialog) {
    if (!dialog) return;
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) closeDialog(dialog);
    });
    dialog.addEventListener('close', function () {
      resumeTimer('dialog');
    });
  });
  els.aboutDialog.addEventListener('click', function (event) {
    if (event.target === els.aboutDialog) closeDialog(els.aboutDialog);
  });
  els.aboutDialog.addEventListener('close', function () {
    resumeTimer('dialog');
  });

  attachMascotDrag();

  window.addEventListener('resize', function () {
    renderMascotPages();
    updateScrollHint();
  });

  els.editBtn.addEventListener('click', function () {
    resetToSetup(true, true);
    goToMascotStep();
  });

  els.keypad.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-key]');
    if (!button) return;

    var key = button.dataset.key;
    if (key === 'del') {
      pressDelete();
    } else if (key === 'ok') {
      submit();
    } else {
      pressDigit(key);
    }
  });

  els.keypad.addEventListener('pointerdown', function (event) {
    spawnRipple(event.target.closest('button[data-key]'), event);
  });

  els.next.addEventListener('click', nextQuestion);
  els.next.addEventListener('pointerdown', function (event) {
    spawnRipple(els.next, event);
  });

  els.soundToggle.addEventListener('click', function () {
    state.sound = !state.sound;
    writeStored(STORAGE.sound, state.sound ? 'on' : 'off');
    updateSoundButton();

    if (state.sound) {
      ensureAudio();
      beep(660, 0, 0.08, 'sine', 0.04);
    }
  });

  els.soundToggle.addEventListener('pointerdown', function (event) {
    spawnRipple(els.soundToggle, event);
  });

  els.themeToggle.addEventListener('click', function () {
    var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });

  els.themeToggle.addEventListener('pointerdown', function (event) {
    spawnRipple(els.themeToggle, event);
  });

  document.addEventListener('keydown', function (event) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (els.game.hidden) return;

    var target = event.target instanceof Element ? event.target : null;
    if ((els.aboutDialog && els.aboutDialog.open) ||
        (els.correctDialog && els.correctDialog.open) ||
        (els.missDialog && els.missDialog.open) ||
        (els.bestDialog && els.bestDialog.open)) return;

    var onControl = target && target.closest('#soundToggle, #themeToggle, #editBtn, #aboutBtn, #installBtn, #nextBtn, a');

    if (/^\d$/.test(event.key)) {
      event.preventDefault();
      pressDigit(event.key);
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      pressDelete();
      return;
    }

    if (event.key === 'Enter') {
      if (onControl) return;
      event.preventDefault();
      if (state.phase === 'revealed') {
        nextQuestion();
      } else {
        submit();
      }
    }
  });

  window.addEventListener('pagehide', finalizeSession);

  document.addEventListener('visibilitychange', function () {
    if (els.game.hidden) return;

    if (document.hidden) {
      pauseTimer('hidden');
    } else {
      resumeTimer('hidden');
    }
  });

  function init() {
    state.best = parseInt(readStored(STORAGE.best, '0'), 10) || 0;
    state.records = readRecords();
    state.sound = readStored(STORAGE.sound, 'on') !== 'off';
    state.progress = readProgress();
    state.level = readLevel();

    var profile = readProfileCookies();
    var savedName = profile.name || readStored(STORAGE.name, '').trim();
    var savedMascotId = profile.mascot || readStored(STORAGE.mascot, '');
    var savedMascot = window.MASCOTS.filter(function (item) {
      return item.id === savedMascotId;
    })[0];

    if (savedName && savedMascot) {
      setProfileCookies(savedName, savedMascot.id);
    }

    state.name = savedName;
    renderMascotOptions();
    renderLevel();
    renderStats();
    resetTimerDisplay();
    updateSoundButton();
    updateThemeButton();

    if (savedMascot) selectMascot(savedMascot.id);

    if (savedName) {
      els.nameInput.value = savedName;
    }

    return loadContent();
  }

  var DESKTOP_WINDOW = { width: 460, height: 760 };

  function isInstalledApp() {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
    if (window.matchMedia && window.matchMedia('(display-mode: window-controls-overlay)').matches) return true;
    return window.navigator.standalone === true;
  }

  function isDesktopScreen() {
    return Math.min(window.screen.width, window.screen.height) >= 700;
  }

  function fitDesktopWindow() {
    if (!isInstalledApp() || !isDesktopScreen()) return;
    if (typeof window.resizeTo !== 'function') return;

    var width = Math.min(DESKTOP_WINDOW.width, window.screen.availWidth || window.screen.width);
    var height = Math.min(DESKTOP_WINDOW.height, window.screen.availHeight || window.screen.height);

    if (width < 320 || height < 480) return;

    var currentWidth = window.outerWidth || 0;
    var currentHeight = window.outerHeight || 0;
    var nearTarget = Math.abs(currentWidth - width) <= 40 && Math.abs(currentHeight - height) <= 40;

    if (nearTarget) return;

    try {
      window.resizeTo(width, height);

      var spareWidth = (window.screen.availWidth || width) - width;
      var spareHeight = (window.screen.availHeight || height) - height;
      if (spareWidth > 80 && spareHeight > 80) {
        window.moveTo(
          Math.round(Math.max(0, spareWidth / 2)),
          Math.round(Math.max(0, spareHeight / 2))
        );
      }
    } catch (error) {
      /* alguns browsers ignoram resizeTo em janelas de app */
    }
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') return;

    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').then(function (registration) {
        if (registration.waiting && registration.waiting.postMessage) {
          registration.waiting.postMessage('skip-waiting');
        }
      }).catch(function () {
        /* offline support is an enhancement: the app works without it */
      });
    });
  }

  registerServiceWorker();
  init();

  window.addEventListener('load', fitDesktopWindow);
  window.addEventListener('appinstalled', function () {
    window.setTimeout(fitDesktopWindow, 1200);
  });
})();
