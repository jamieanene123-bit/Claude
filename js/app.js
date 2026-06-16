/*
 * app.js — Bootstrap. Initialisiert Theme, registriert Routen, verdrahtet
 * globale Interaktionen (Theme-Umschalter) und startet den Router.
 *
 * Erweiterung später:
 *  - Auth/Login: vor adminList/adminDetail/settings einen Guard einsetzen
 *    (z.B. if (!TDS.auth.isAdmin()) return TDS.views.login();).
 *  - Backend: nur services/store.js-Adapter austauschen, Views bleiben gleich.
 *  - Stripe/TWINT: im Submit-Handler (components/form.js) nach store.create()
 *    einen Checkout-Redirect ergänzen.
 */
(function (global) {
  'use strict';

  var TDS = global.TDS;
  var router = TDS.router;
  var views = TDS.views;

  // Theme so früh wie möglich anwenden.
  TDS.theme.init();

  // Routen
  router.register('/', views.landing);
  router.register('/form', views.form);
  router.register('/success/:id', views.success);
  router.register('/admin', views.adminList);
  router.register('/admin/:id', views.adminDetail);
  router.register('/report/:id', views.report);
  router.register('/settings', views.settings);
  router.setNotFound(views.notFound);

  // Globale, delegierte Interaktionen (überleben Re-Renders von #app).
  global.document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-action]');
    if (!t) return;
    var action = t.getAttribute('data-action');
    if (action === 'theme-toggle') {
      TDS.theme.toggle();
      var dark = TDS.theme.current() === 'dark';
      t.setAttribute('aria-pressed', dark ? 'true' : 'false');
      if (TDS.toast) TDS.toast.info('Design: ' + (dark ? 'Dunkel' : 'Hell'));
    }
  });

  router.start();

  // Verdichtende, "schwebende" Kopfzeile beim Scrollen.
  var onScroll = function () {
    var y = global.scrollY || global.pageYOffset || 0;
    global.document.documentElement.classList.toggle('is-scrolled', y > 8);
  };
  global.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Höfliche Ansage des Seitenwechsels für Screenreader (ohne Fokus zu stehlen).
  function announceRoute() {
    var h = global.location.hash || '#/';
    var label = 'Startseite';
    if (h.indexOf('#/form') === 0) label = 'Suchanfrage-Formular';
    else if (h.indexOf('#/admin') === 0) label = 'Admin-Bereich';
    else if (h.indexOf('#/settings') === 0) label = 'Einstellungen';
    else if (h.indexOf('#/report') === 0) label = 'Deal-Report';
    else if (h.indexOf('#/success') === 0) label = 'Anfrage gesendet';
    global.document.title = 'Töff Deal Scout — ' + label;
    var a = global.document.getElementById('route-announcer');
    if (a) a.textContent = 'Seite: ' + label;
  }
  global.addEventListener('hashchange', announceRoute);
  announceRoute();

  // Service Worker (PWA) — nur über http(s), nicht über file://.
  if ('serviceWorker' in global.navigator && global.location.protocol.indexOf('http') === 0) {
    global.addEventListener('load', function () {
      global.navigator.serviceWorker.register('sw.js').catch(function () { /* offline optional */ });
    });
  }
})(window);
