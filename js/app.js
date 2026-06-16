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

  // Service Worker (PWA) — nur über http(s), nicht über file://.
  if ('serviceWorker' in global.navigator && global.location.protocol.indexOf('http') === 0) {
    global.addEventListener('load', function () {
      global.navigator.serviceWorker.register('sw.js').catch(function () { /* offline optional */ });
    });
  }
})(window);
