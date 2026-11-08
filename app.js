(function () {
  'use strict';

  var STORAGE = {
    name: 'tabuada12.name',
    mascot: 'tabuada12.mascot',
    best: 'tabuada12.bestStreak',
    sound: 'tabuada12.sound',
    theme: 'tabuada12.theme',
    progress: 'tabuada12.progress'
  };

  var COOKIE = {
    name: 'tabuada12_name',
    mascot: 'tabuada12_mascot',
    progress: 'tabuada12_progress'
  };

  var PROGRESS_TTL = 24 * 60 * 60;
  var PROFILE_TTL = 365 * 24 * 60 * 60;
  var COOKIE_LIMIT = 3800;

  var els = {
    brandMark: document.getElementById('brandMark'),
    brandSubtitle: document.getElementById('brandSubtitle'),
    themeToggle: document.getElementById('themeToggle'),
    soundToggle: document.getElementById('soundToggle'),
    editBtn: document.getElementById('editBtn'),
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
    factorA: document.getElementById('factorA'),
    factorB: document.getElementById('factorB'),
    answer: document.getElementById('answerBox'),
    keypad: document.getElementById('keypad'),
    confirm: document.getElementById('confirmBtn'),
    next: document.getElementById('nextBtn'),
    statTime: document.getElementById('statTime'),
    statCorrect: document.getElementById('statCorrect'),
    statMiss: document.getElementById('statMiss'),
    statStreak: document.getElementById('statStreak'),
    statBest: document.getElementById('statBest'),
    confetti: document.getElementById('confetti')
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
    sound: true,
    startedAt: null,
    elapsed: 0,
    timerId: null,
    progress: {}
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
    container.innerHTML = '';

    if (!mascot) {
      var icon = document.createElement('img');
      icon.src = 'assets/icon.svg';
      icon.alt = '';
      icon.width = 44;
      icon.height = 44;
      icon.decoding = 'async';
      container.appendChild(icon);
      return;
    }

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
    var total = Math.max(0, Math.floor(ms / 1000));
    var minutes = Math.floor(total / 60);
    var seconds = total % 60;
    return minutes + ':' + (seconds < 10 ? '0' + seconds : String(seconds));
  }

  function elapsedTime() {
    return state.elapsed + (state.startedAt ? Date.now() - state.startedAt : 0);
  }

  function renderTime() {
    els.statTime.textContent = formatTime(elapsedTime());
  }

  function startTimer() {
    if (!state.startedAt) {
      state.startedAt = Date.now();
    }
    renderTime();
    if (state.timerId === null) {
      state.timerId = window.setInterval(renderTime, 1000);
    }
  }

  function pauseTimer() {
    if (state.startedAt) {
      state.elapsed += Date.now() - state.startedAt;
      state.startedAt = null;
    }
    stopTimer();
  }

  function stopTimer() {
    if (state.timerId !== null) {
      window.clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function updateBest() {
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
    var hasInput = state.input.length > 0;
    els.answer.textContent = hasInput ? state.input : '?';
    els.answer.classList.toggle('is-empty', !hasInput);
  }

  function updateConfirm() {
    els.confirm.disabled = state.phase !== 'answering' || state.input.length === 0;
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
    var a;
    var b;

    for (a = 1; a <= 12; a += 1) {
      for (b = 1; b <= 12; b += 1) {
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

  function newQuestion() {
    clearAdvance();

    var pick = chooseFact();
    var a = pick.a;
    var b = pick.b;

    state.a = a;
    state.b = b;
    state.input = '';
    state.attempt = 1;
    state.phase = 'answering';
    state.busy = false;

    els.factorA.textContent = String(a);
    els.factorB.textContent = String(b);
    els.card.classList.remove('is-correct', 'is-revealed');
    els.answer.classList.remove('flash', 'pop');
    els.keypad.hidden = false;
    els.next.hidden = true;
    say(mascotPhrases('perguntar'), 'neutral');
    renderAnswer();
    renderStats();
    updateConfirm();
    restartAnimation(els.question, 'pop');
    els.srQuestion.textContent = 'Quanto é ' + a + ' vezes ' + b + '?';
  }

  function pressDigit(digit) {
    if (state.phase !== 'answering' || state.busy) return;
    if (state.input.length >= 3) return;
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
      restartAnimation(els.answer, 'flash');
      return;
    }

    var product = state.a * state.b;
    var value = Number(state.input);

    if (value === product) {
      var firstTry = state.attempt === 1;

      state.busy = true;
      state.phase = 'correct';
      state.correctCount += 1;
      recordResult(state.a, state.b, firstTry ? 'ok' : 'second');

      if (firstTry) {
        state.streak += 1;
        updateBest();
      }

      els.card.classList.add('is-correct');
      restartAnimation(els.answer, 'pop');
      say(mascotPhrases(firstTry ? 'acertou' : 'acertouSegunda'), 'ok', 'check');
      react('yay');
      soundCorrect();
      burstConfetti();
      renderStats();
      bump(els.statCorrect);
      if (firstTry) bump(els.statStreak);
      updateConfirm();

      scheduleAdvance(newQuestion, 1250);
      return;
    }

    state.missCount += 1;

    if (state.attempt === 1) {
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

    state.phase = 'revealed';
    state.input = String(product);
    state.busy = false;
    recordResult(state.a, state.b, 'fail');
    resetStreak();
    bump(els.statMiss);
    els.card.classList.add('is-revealed');
    restartAnimation(els.answer, 'pop');
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

    writeStored(STORAGE.name, state.name);
    writeStored(STORAGE.mascot, state.mascot.id);
    setProfileCookies(state.name, state.mascot.id);

    els.setup.hidden = true;
    els.game.hidden = false;
    els.editBtn.hidden = false;
    els.soundToggle.hidden = false;

    els.brandMark.classList.add('is-animal');
    setAvatar(els.brandMark, state.mascot);
    setAvatar(els.gameAvatar, state.mascot);
    applyThemeColors(state.mascot);

    els.brandSubtitle.textContent = state.name + ' com ' + state.mascot.name;

    renderTime();
    newQuestion();
    startTimer();

    updateSoundButton();

    say(fill(ownedHello(state.mascot), {}), 'info');
    window.setTimeout(function () {
      if (state.phase === 'answering' && state.attempt === 1 && !state.input) {
        say(mascotPhrases('perguntar'), 'neutral');
      }
    }, 2400);
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

    state.phase = 'answering';
    state.busy = false;
    state.input = '';

    if (!keepSession) {
      state.correctCount = 0;
      state.missCount = 0;
      state.streak = 0;
      state.startedAt = null;
      state.elapsed = 0;
      renderTime();
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

    els.brandMark.classList.remove('is-animal');
    setAvatar(els.brandMark, null);
    els.brandSubtitle.textContent = 'Treina a tabuada do 1 ao 12';
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

  els.nameForm.addEventListener('submit', function (event) {
    event.preventDefault();

    var value = els.nameInput.value.replace(/\s+/g, ' ').trim();

    if (value.length < 2) {
      els.nameError.hidden = false;
      els.nameInput.focus();
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
    var onControl = target && target.closest('#soundToggle, #themeToggle, #editBtn, #nextBtn, a');

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

  document.addEventListener('visibilitychange', function () {
    if (els.game.hidden) return;

    if (document.hidden) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  function init() {
    state.best = parseInt(readStored(STORAGE.best, '0'), 10) || 0;
    state.sound = readStored(STORAGE.sound, 'on') !== 'off';
    state.progress = readProgress();

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
    renderStats();
    renderTime();
    updateSoundButton();
    updateThemeButton();

    if (savedMascot) selectMascot(savedMascot.id);

    if (savedName) {
      els.nameInput.value = savedName;
    }

    return loadContent();
  }

  init();
})();
