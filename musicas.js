/*
 * The music page: lists every tune with its story and a play button.
 *
 * Playback uses window.MusicEngine, the same engine as the radio bar on the
 * game screen, so a tune sounds identical in both places and there is only one
 * copy of the scheduling code.
 */
(function () {
  'use strict';

  var engine = window.MusicEngine;
  var list = document.getElementById('musicList');
  var instrumentSelect = document.getElementById('pageInstrument');
  var volumeInput = document.getElementById('pageVolume');

  if (!engine || !list) return;

  var rows = [];
  var activeIndex = -1;

  function flag(country) {
    return country || '';
  }

  function rowFor(track, index) {
    var item = document.createElement('li');
    item.className = 'music-item';

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'music-play';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', 'Ouvir ' + track.title);

    var icon = document.createElement('span');
    icon.className = 'music-play-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML =
      '<svg class="icon-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5Z"/></svg>' +
      '<svg class="icon-stop" viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="7" width="10" height="10" rx="1.5"/></svg>';

    button.appendChild(icon);

    var text = document.createElement('span');
    text.className = 'music-item-text';

    var title = document.createElement('span');
    title.className = 'music-item-title';
    title.textContent = track.title;

    var meta = document.createElement('span');
    meta.className = 'music-item-meta';
    meta.textContent = [flag(track.country), track.year, track.credit]
      .filter(Boolean)
      .join(' · ');

    var about = document.createElement('span');
    about.className = 'music-item-about';
    about.textContent = track.about || '';

    text.appendChild(title);
    text.appendChild(meta);
    text.appendChild(about);

    button.appendChild(text);
    item.appendChild(button);

    button.addEventListener('click', function () {
      if (activeIndex === index) {
        engine.stop();
        setActive(-1);
        return;
      }

      engine.playTrack(track, 1, function () {
        setActive(-1);
      });
      setActive(index);
    });

    rows.push({ button: button, index: index });

    return item;
  }

  function setActive(index) {
    activeIndex = index;

    rows.forEach(function (row) {
      var on = row.index === index;
      row.button.classList.toggle('is-playing', on);
      row.button.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function fillInstruments() {
    if (!instrumentSelect) return;

    engine.instruments.forEach(function (item) {
      var option = document.createElement('option');
      option.value = item.id;
      option.textContent = item.label;
      instrumentSelect.appendChild(option);
    });

    instrumentSelect.value = engine.state.instrument;
    instrumentSelect.addEventListener('change', function () {
      engine.setInstrument(instrumentSelect.value);
      setActive(-1);
    });
  }

  engine.tracks().forEach(function (track, index) {
    list.appendChild(rowFor(track, index));
  });

  engine.onInstrumentChange = function () {
    if (instrumentSelect) instrumentSelect.value = engine.state.instrument;
  };

  engine.onStop = function () {
    setActive(-1);
  };

  engine.readSettings();
  fillInstruments();

  engine.setVolume(engine.state.volume);

  if (volumeInput) {
    volumeInput.value = String(engine.state.volume);
    volumeInput.addEventListener('input', function () {
      engine.setVolume(parseFloat(volumeInput.value));
    });
  }

  // A single tap anywhere else unlocks audio, so the play buttons just work.
  document.addEventListener('pointerdown', function () {
    if (window.Tone && window.Tone.start) window.Tone.start();
  }, { once: true });
}());
