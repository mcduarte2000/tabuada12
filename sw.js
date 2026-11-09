/*
 * Service worker for Tabuada 12.
 *
 * Precaches the app shell so the game starts offline and loads instantly on
 * repeat visits. Everything is same-origin: the Roboto font is vendored under
 * assets/fonts and precached with the rest, so there is no third-party request.
 *
 * Strategy:
 *   - navigation requests: network first, cache fallback, so a deploy is picked
 *     up on the next online visit while offline still works.
 *   - static assets: cache first, then network, with the response copied into
 *     the cache.
 *   - anything else: plain network.
 */
'use strict';

var VERSION = 'tabuada12-v8';
var SHELL = VERSION + '-shell';

var SHELL_FILES = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'mascots.js',
  'content.json',
  'manifest.webmanifest',
  'assets/icon.svg',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/icon-maskable.svg',
  'assets/icon-maskable-192.png',
  'assets/icon-maskable-512.png',
  'assets/apple-touch-icon.png',
  'assets/screenshot-setup.png',
  'assets/screenshot-game.png',
  'assets/fonts/roboto-latin.woff2',
  'assets/fonts/LICENSE-roboto.txt'
];

var MASCOTS = [
  'gato', 'cao', 'raposa', 'tigre', 'leao', 'macaco', 'urso', 'panda',
  'coelho', 'hamster', 'koala', 'guaxinim', 'preguica', 'lontra', 'ourico',
  'coruja', 'pinguim', 'pato', 'tartaruga', 'sapo', 'dinossauro', 'dragao',
  'unicornio', 'polvo', 'borboleta', 'joaninha', 'caranguejo', 'caracol',
  'baleia', 'golfinho'
];

MASCOTS.forEach(function (id) {
  SHELL_FILES.push('assets/mascots/fluent/' + id + '.svg');
});

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(SHELL).then(function (cache) {
      return cache.addAll(SHELL_FILES);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) {
        return key !== SHELL;
      }).map(function (key) {
        return caches.delete(key);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;

  if (request.method !== 'GET') return;

  var url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(function (response) {
        var copy = response.clone();
        caches.open(SHELL).then(function (cache) {
          cache.put('index.html', copy);
        });
        return response;
      }).catch(function () {
        return caches.match('index.html').then(function (hit) {
          return hit || caches.match('./');
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (hit) {
      if (hit) return hit;

      return fetch(request).then(function (response) {
        if (response && response.status === 200 && response.type === 'basic') {
          var copy = response.clone();
          caches.open(SHELL).then(function (cache) {
            cache.put(request, copy);
          });
        }
        return response;
      });
    })
  );
});

self.addEventListener('message', function (event) {
  if (event.data === 'skip-waiting') self.skipWaiting();
});
