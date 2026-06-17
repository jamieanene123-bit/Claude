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

  // Theme & Dichte so früh wie möglich anwenden.
  TDS.theme.init();
  try {
    var dens = global.localStorage.getItem('tds_density');
    if (dens) global.document.documentElement.setAttribute('data-density', dens);
  } catch (e) {}

  // Routen
  router.register('/', views.landing);
  router.register('/form', views.form);
  router.register('/success/:id', views.success);
  router.register('/admin', views.adminList);
  router.register('/admin/:id', views.adminDetail);
  router.register('/report/:id', views.report);
  router.register('/settings', views.settings);
  router.register('/datenschutz', views.datenschutz);
  router.register('/agb', views.agb);
  router.register('/impressum', views.impressum);
  router.register('/preise', views.preise);
  router.register('/ueber-uns', views.ueberUns);
  router.register('/kontakt', views.kontakt);
  router.register('/ratgeber', views.ratgeber);
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
    } else if (action === 'newsletter') {
      var input = global.document.getElementById('nl-email');
      var val = input && input.value ? input.value.trim() : '';
      var okMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      if (TDS.toast) TDS.toast[okMail ? 'success' : 'info'](okMail ? 'Danke! Eingetragen (Demo).' : 'Bitte gültige E-Mail eingeben.');
      if (okMail && input) input.value = '';
    } else if (action === 'nav-toggle') {
      var openNow = !global.document.documentElement.classList.contains('nav-open');
      global.document.documentElement.classList.toggle('nav-open', openNow);
      t.setAttribute('aria-expanded', openNow ? 'true' : 'false');
      t.setAttribute('aria-label', openNow ? 'Menü schliessen' : 'Menü öffnen');
    }
  });

  // Globaler Fehler-Fänger: meldet unerwartete Fehler dezent (gedrosselt).
  var lastErrToast = 0;
  function reportError() {
    var now = Date.now();
    if (now - lastErrToast < 4000) return;
    lastErrToast = now;
    if (TDS.toast) TDS.toast.error('Etwas ist schiefgelaufen — bitte erneut versuchen.');
  }
  global.addEventListener('error', reportError);
  global.addEventListener('unhandledrejection', reportError);

  router.start();

  // Verdichtende, "schwebende" Kopfzeile beim Scrollen.
  var rafPending = false;
  var onScroll = function () {
    var y = global.scrollY || global.pageYOffset || 0;
    global.document.documentElement.classList.toggle('is-scrolled', y > 8);
    // Parallax-Wert nur einmal pro Frame setzen (RAF-Debounce, weniger Recalcs).
    if (!rafPending) {
      rafPending = true;
      global.requestAnimationFrame(function () {
        global.document.documentElement.style.setProperty('--sy', y);
        rafPending = false;
      });
    }
  };
  global.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Tastatur-Shortcuts: "/" fokussiert die Admin-Suche, "n" startet eine neue Anfrage.
  global.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName || '').toLowerCase();
    if (e.key === 'Escape' && global.document.documentElement.classList.contains('nav-open')) {
      global.document.documentElement.classList.remove('nav-open');
      var nt = global.document.querySelector('.nav-toggle');
      if (nt) { nt.setAttribute('aria-expanded', 'false'); nt.setAttribute('aria-label', 'Menü öffnen'); nt.focus(); }
      return;
    }
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '/') {
      var s = global.document.getElementById('search');
      if (s) { e.preventDefault(); s.focus(); }
    } else if (e.key === 'n') {
      router.navigate('/form');
    }
  });

  // Höfliche Ansage des Seitenwechsels für Screenreader (ohne Fokus zu stehlen).
  function announceRoute() {
    // Mobile-Menü bei jeder Navigation schliessen.
    global.document.documentElement.classList.remove('nav-open');
    var tgl = global.document.querySelector('.nav-toggle');
    if (tgl) { tgl.setAttribute('aria-expanded', 'false'); tgl.setAttribute('aria-label', 'Menü öffnen'); }
    var h = global.location.hash || '#/';
    var label = 'Startseite';
    if (h.indexOf('#/form') === 0) label = 'Suchanfrage-Formular';
    else if (h.indexOf('#/admin') === 0) label = 'Admin-Bereich';
    else if (h.indexOf('#/settings') === 0) label = 'Einstellungen';
    else if (h.indexOf('#/report') === 0) label = 'Deal-Report';
    else if (h.indexOf('#/success') === 0) label = 'Anfrage gesendet';
    else if (h.indexOf('#/datenschutz') === 0) label = 'Datenschutzerklärung';
    else if (h.indexOf('#/agb') === 0) label = 'AGB';
    else if (h.indexOf('#/impressum') === 0) label = 'Impressum';
    else if (h.indexOf('#/preise') === 0) label = 'Pakete & Preise';
    else if (h.indexOf('#/ueber-uns') === 0) label = 'Über uns';
    else if (h.indexOf('#/kontakt') === 0) label = 'Kontakt';
    else if (h.indexOf('#/ratgeber') === 0) label = 'Ratgeber';
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
