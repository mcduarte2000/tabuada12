/*
 * Music for Tabuada 12.
 *
 * One small engine plays a traditional tune from note data, and the radio bar
 * on the game screen drives it. The music page reuses the same engine.
 *
 * Instruments are synthesised with Tone.js, so there are no audio files and no
 * network requests. Tone.js is vendored in assets/vendor/tone/.
 *
 * Browser rule: audio cannot start until the visitor interacts with the page,
 * so nothing plays before the first tap or key press.
 */
(function () {
  'use strict';

  var COOKIE = {
    enabled: 'tabuada12_music',
    volume: 'tabuada12_musicVolume',
    instrument: 'tabuada12_musicInstrument'
  };

  var COOKIE_TTL = 365 * 24 * 60 * 60;

  var DEFAULT_VOLUME = 0.6;
  var DEFAULT_ENABLED = false;
  var LOOP_FADE_SECONDS = 1.2;
  var MUSIC_VOLUME = -14;
  var BASS_VOLUME = -22;
  var PLUCK_GAIN = 14;

  var INSTRUMENTS = [
    {
      id: 'triangle',
      label: 'Triângulo',
      make: function (Tone, bus) {
        return new Tone.Synth({
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.01, decay: 0.12, sustain: 0.35, release: 0.18 }
        }).connect(bus);
      }
    },
    {
      id: 'flute',
      label: 'Flauta',
      make: function (Tone, bus) {
        return new Tone.Synth({
          oscillator: { type: 'sine' },
          envelope: { attack: 0.06, decay: 0.1, sustain: 0.7, release: 0.22 }
        }).connect(bus);
      }
    },
    {
      id: 'bell',
      label: 'Sino',
      make: function (Tone, bus) {
        return new Tone.FMSynth({
          harmonicity: 3,
          modulationIndex: 6,
          envelope: { attack: 0.005, decay: 0.3, sustain: 0.05, release: 0.4 },
          modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 }
        }).connect(bus);
      }
    },
    {
      id: 'musicbox',
      label: 'Caixa de música',
      make: function (Tone, bus) {
        return new Tone.AMSynth({
          harmonicity: 2.5,
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.004, decay: 0.2, sustain: 0.1, release: 0.3 }
        }).connect(bus);
      }
    },
    {
      id: 'piano',
      label: 'Piano',
      make: function (Tone, bus) {
        return new Tone.Synth({
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.004, decay: 0.35, sustain: 0.12, release: 0.5 },
          filter: { type: 'lowpass', frequency: 2600, Q: 1 },
          filterEnvelope: {
            attack: 0.004,
            decay: 0.3,
            sustain: 0.1,
            release: 0.4,
            baseFrequency: 420,
            octaves: 4
          }
        }).connect(bus);
      }
    },
    {
      id: 'guitar',
      label: 'Guitarra',
      make: function (Tone, bus) {
        var synth = new Tone.PluckSynth({
          attackNoise: 1.2,
          dampening: 2800,
          resonance: 0.92
        }).connect(bus);

        // PluckSynth is far quieter than the others; level it with the rest.
        synth.volume.value = PLUCK_GAIN;
        return synth;
      }
    },
    {
      id: 'ukulele',
      label: 'Ukelele',
      make: function (Tone, bus) {
        var synth = new Tone.PluckSynth({
          attackNoise: 0.8,
          dampening: 4200,
          resonance: 0.86
        }).connect(bus);

        synth.volume.value = PLUCK_GAIN;
        return synth;
      }
    },
    {
      id: 'clarinet',
      label: 'Clarinete',
      make: function (Tone, bus) {
        return new Tone.Synth({
          oscillator: { type: 'square' },
          envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.18 },
          filter: { type: 'lowpass', frequency: 1500, Q: 2 }
        }).connect(bus);
      }
    }
  ];

  var state = {
    started: false,
    playing: false,
    loops: 1,
    onEnd: null,
    enabled: true,
    volume: DEFAULT_VOLUME,
    instrument: 'piano',
    bus: null,
    current: null,
    timer: null,
    track: null,
    order: [],
    position: -1,
    lastPlayed: null,
    onTrackChange: null,
    onStop: null,
    onVolumeChange: null,
    onInstrumentChange: null
  };

  function cookieSecureSuffix() {
    return window.location.protocol === 'https:' ? '; Secure' : '';
  }

  function writeCookie(nome, valor) {
    try {
      document.cookie = nome + '=' + encodeURIComponent(valor) +
        '; Max-Age=' + COOKIE_TTL +
        '; Path=/' +
        '; SameSite=Lax' +
        cookieSecureSuffix();
    } catch (error) {
      /* cookies indisponíveis: a música continua a funcionar */
    }
  }

  function readCookie(nome) {
    try {
      var prefixo = nome + '=';
      var partes = document.cookie ? document.cookie.split('; ') : [];
      var i;

      for (i = 0; i < partes.length; i += 1) {
        if (partes[i].indexOf(prefixo) === 0) {
          return decodeURIComponent(partes[i].slice(prefixo.length));
        }
      }
    } catch (error) {
      return '';
    }

    return '';
  }

  function tracks() {
    return window.MUSIC_TRACKS || [];
  }

  function instrumentById(id) {
    var i;
    for (i = 0; i < INSTRUMENTS.length; i += 1) {
      if (INSTRUMENTS[i].id === id) return INSTRUMENTS[i];
    }
    return INSTRUMENTS[0];
  }

  function bus() {
    var Tone = window.Tone;

    if (!state.bus) {
      state.bus = new Tone.Gain(state.volume).toDestination();
    }

    return state.bus;
  }

  function readSettings() {
    state.enabled = readCookie(COOKIE.enabled) === 'on';

    var volume = parseFloat(readCookie(COOKIE.volume));
    state.volume = isNaN(volume) || volume < 0 || volume > 1
      ? DEFAULT_VOLUME
      : volume;

    state.instrument = instrumentById(
      readCookie(COOKIE.instrument) || 'piano'
    ).id;
  }

  function setVolume(value) {
    state.volume = Math.min(1, Math.max(0, value));
    writeCookie(COOKIE.volume, state.volume);

    if (state.bus) {
      state.bus.gain.rampTo(state.volume, 0.15);
    }

    if (typeof state.onVolumeChange === 'function') {
      state.onVolumeChange(state.volume);
    }
  }

  function setInstrument(id) {
    state.instrument = instrumentById(id).id;
    writeCookie(COOKIE.instrument, state.instrument);

    if (typeof state.onInstrumentChange === 'function') {
      state.onInstrumentChange(state.instrument);
    }

    if (state.playing && state.track) {
      restart();
    }
  }

  function secondsOf(duration) {
    return window.Tone.Time(duration).toSeconds();
  }

  function buildMelody(track) {
    var events = [];
    var at = 0;

    track.melody.forEach(function (note) {
      events.push([at, note[0], note[1]]);
      at += secondsOf(note[1]);
    });

    return { events: events, seconds: at };
  }

  function buildBass(track, totalSeconds) {
    var events = [];
    var step = totalSeconds / track.chords.length;

    track.chords.forEach(function (chord, index) {
      events.push([index * step, chord]);
    });

    return events;
  }

  function disposeCurrent() {
    if (state.timer !== null) {
      window.clearTimeout(state.timer);
      state.timer = null;
    }

    var current = state.current;

    if (!current) return;

    state.current = null;

    [current.melodyPart, current.bassPart].forEach(function (part) {
      if (!part) return;
      try {
        part.stop();
      } catch (error) {
        /* já parado */
      }
      try {
        part.dispose();
      } catch (error) {
        /* já libertado */
      }
    });

    [current.lead, current.bass].forEach(function (synth) {
      if (!synth) return;
      try {
        synth.dispose();
      } catch (error) {
        /* já libertado */
      }
    });
  }

  /*
   * The Transport is shared, so a new track must never start while parts from
   * the previous one are still attached to it. That was audible as stray notes
   * from the old tune playing over the new one, which is why the previous parts
   * are now disposed before the Transport moves.
   */
  function playTrack(track, loops, onEnd) {
    var Tone = window.Tone;

    disposeCurrent();

    Tone.Transport.stop();
    Tone.Transport.cancel(0);
    Tone.Transport.position = 0;
    Tone.Transport.bpm.value = track.bpm;

    var melody = buildMelody(track);
    var bassEvents = buildBass(track, melody.seconds);
    var busNode = bus();
    var lead = instrumentById(state.instrument).make(Tone, busNode);
    var bass = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.2, sustain: 0.3, release: 0.25 }
    }).connect(busNode);

    lead.volume.value = MUSIC_VOLUME;
    bass.volume.value = BASS_VOLUME;

    var melodyPart = new Tone.Part(function (time, event) {
      if (event[1] === 'rest') return;
      lead.triggerAttackRelease(event[1], event[2], time);
    }, melody.events.map(function (event) {
      return [event[0], [event[0], event[1], event[2]]];
    }));

    melodyPart.loop = loops;
    melodyPart.loopEnd = melody.seconds;

    var bassPart = new Tone.Part(function (time, event) {
      bass.triggerAttackRelease(event[1], '2n', time);
    }, bassEvents.map(function (event) {
      return [event[0], [event[0], event[1]]];
    }));

    bassPart.loop = loops;
    bassPart.loopEnd = melody.seconds;

    state.current = {
      lead: lead,
      bass: bass,
      melodyPart: melodyPart,
      bassPart: bassPart,
      seconds: melody.seconds
    };

    Tone.Transport.start();
    melodyPart.start(0);
    bassPart.start(0);

    state.track = track;
    state.playing = true;
    state.started = true;

    if (typeof state.onTrackChange === 'function') {
      state.onTrackChange(track);
    }

    state.timer = window.setTimeout(function () {
      state.timer = null;
      if (typeof onEnd === 'function') onEnd();
    }, melody.seconds * loops * 1000);
  }

  function stop() {
    disposeCurrent();
    state.playing = false;
    state.track = null;

    if (window.Tone && window.Tone.Transport) {
      window.Tone.Transport.stop();
      window.Tone.Transport.cancel(0);
      window.Tone.Transport.position = 0;
    }

    if (typeof state.onStop === 'function') {
      state.onStop();
    }
  }

  function restart() {
    if (!state.track) return;
    var track = state.track;
    playTrack(track, state.loops, state.onEnd);
  }

  function shuffle(list) {
    var copy = list.slice();
    var i;
    var j;
    var temp;

    for (i = copy.length - 1; i > 0; i -= 1) {
      j = Math.floor(Math.random() * (i + 1));
      temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }

    return copy;
  }

  function nextShuffled() {
    var list = tracks();
    var index;

    if (!list.length) return null;

    if (state.position >= state.order.length - 1) {
      state.order = shuffle(list);

      if (list.length > 1 && state.order[0] === state.lastPlayed) {
        index = 1 + Math.floor(Math.random() * (state.order.length - 1));
        var swap = state.order[0];
        state.order[0] = state.order[index];
        state.order[index] = swap;
      }

      state.position = -1;
    }

    state.position += 1;

    return state.order[state.position];
  }

  function playNext() {
    var track = nextShuffled();

    if (!track) return;

    state.lastPlayed = track;
    state.loops = 2;
    state.onEnd = playNext;
    playTrack(track, 2, playNext);
  }

  function startRadio() {
    if (!tracks().length) return;

    var unlocked = window.Tone && window.Tone.start
      ? window.Tone.start()
      : Promise.resolve();

    Promise.resolve(unlocked).then(function () {
      state.started = true;
      playNext();
    }, function () {
      state.started = false;
    });
  }

  function pauseRadio() {
    stop();
  }

  function engine() {
    return {
      state: state,
      instruments: INSTRUMENTS,
      readSettings: readSettings,
      setVolume: setVolume,
      setInstrument: setInstrument,
      playTrack: playTrack,
      playNext: playNext,
      startRadio: startRadio,
      pauseRadio: pauseRadio,
      stop: stop,
      tracks: tracks
    };
  }

  window.MusicEngine = engine();

  /*
   * The radio bar lives on the game screen only. It is wired here so app.js
   * never has to know about audio; if the element is absent this block is
   * skipped, which is also what happens on the music page.
   */
  function initRadio() {
    var bar = document.getElementById('radio');
    var playBtn = document.getElementById('musicPlay');
    var nowPlaying = document.getElementById('nowPlaying');
    var volume = document.getElementById('musicVolume');
    var instrument = document.getElementById('musicInstrument');

    if (!bar || !playBtn || !nowPlaying) return;

    if (!tracks().length) {
      bar.hidden = true;
      return;
    }

    readSettings();

    state.onTrackChange = function (track) {
      nowPlaying.textContent = track.title;
      bar.dataset.state = 'playing';
      bar.classList.add('is-live');
      renderButton();
    };

    state.onStop = function () {
      nowPlaying.textContent = state.track ? state.track.title : 'Pronta a tocar';
      bar.dataset.state = 'idle';
      bar.classList.remove('is-live');
      renderButton();
    };

    function renderButton() {
      var playing = state.playing;

      playBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      playBtn.setAttribute('aria-label', playing ? 'Parar música' : 'Tocar música');
      playBtn.classList.toggle('is-playing', playing);
      playBtn.dataset.state = playing ? 'playing' : 'stopped';
    }

    playBtn.addEventListener('click', function (event) {
      event.stopPropagation();

      if (state.playing) {
        state.enabled = false;
        writeCookie(COOKIE.enabled, 'off');
        pauseRadio();
      } else {
        state.enabled = true;
        writeCookie(COOKIE.enabled, 'on');
        startRadio();
      }
    });

    if (volume) {
      volume.value = String(state.volume);
      volume.setAttribute('aria-valuetext', Math.round(state.volume * 100) + '%');

      volume.addEventListener('input', function () {
        setVolume(parseFloat(volume.value));
        volume.setAttribute('aria-valuetext', Math.round(state.volume * 100) + '%');
      });
    }

    if (instrument) {
      instrument.innerHTML = '';

      INSTRUMENTS.forEach(function (item) {
        var option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.label;
        instrument.appendChild(option);
      });

      instrument.value = state.instrument;
      instrument.addEventListener('change', function () {
        setInstrument(instrument.value);
      });
    }

    renderButton();
    bar.dataset.state = 'idle';

    /*
     * Browsers only allow audio after a gesture. That first gesture unlocks the
     * audio context and nothing else: playback never starts by itself, not even
     * when the cookie remembers that music was on. A remembered "on" used to
     * resume here, which made music start on the mascot step.
     */
    var unlock = function () {
      document.removeEventListener('pointerdown', unlock, true);
      document.removeEventListener('keydown', unlock, true);

      if (window.Tone && window.Tone.start) {
        window.Tone.start();
      }
    };

    document.addEventListener('pointerdown', unlock, true);
    document.addEventListener('keydown', unlock, true);

    /*
     * The radio belongs to the game screen, so leaving it stops the music
     * instead of letting it play on under a screen that shows no controls.
     */
    var game = document.getElementById('game');

    if (game && window.MutationObserver) {
      new window.MutationObserver(function () {
        if (game.hidden && state.playing) {
          pauseRadio();
        }
      }).observe(game, { attributes: true, attributeFilter: ['hidden'] });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRadio);
  } else {
    initRadio();
  }
}());
