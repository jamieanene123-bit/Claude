/*
 * sw.js — Service Worker (PWA). App-Shell-Caching für Offline-Betrieb.
 * Aktiv nur, wenn die App über http(s) ausgeliefert wird (nicht file://).
 * Strategie: cache-first für eigene Assets, Netzwerk als Fallback.
 */
var CACHE = 'tds-shell-v2';
var ASSETS = [
  './',
  'index.html',
  'css/styles.css',
  'favicon.svg',
  'manifest.json',
  'js/core/events.js',
  'js/core/format.js',
  'js/core/charts.js',
  'js/core/theme.js',
  'js/core/toast.js',
  'js/core/motion.js',
  'js/core/dom.js',
  'js/data/config.js',
  'js/data/market.js',
  'js/data/demo.js',
  'js/services/store.js',
  'js/services/scout.js',
  'js/router.js',
  'js/components/layout.js',
  'js/components/landing.js',
  'js/components/form.js',
  'js/components/success.js',
  'js/components/admin.js',
  'js/components/report.js',
  'js/components/settings.js',
  'js/components/notfound.js',
  'js/app.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  // Navigationsanfragen offline auf die App-Shell zurückfallen lassen.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(function () { return caches.match('index.html'); }));
    return;
  }
  e.respondWith(
    caches.match(req).then(function (cached) {
      return cached || fetch(req).then(function (res) {
        // Eigene GET-Antworten opportunistisch nachcachen.
        if (res && res.status === 200 && req.url.indexOf(self.location.origin) === 0) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return cached; });
    })
  );
});
