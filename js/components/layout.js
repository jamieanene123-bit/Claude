/*
 * components/layout.js — gemeinsame UI-Bausteine & Helfer.
 * Header (mit Navigation + Theme-Umschalter) und Footer für alle Views.
 */
(function (global) {
  'use strict';

  var fmt = global.TDS.format;

  function app() { return global.document.getElementById('app'); }

  /**
   * Rendert eine View. Views liefern nur den Inhalt; Header, <main>-Landmark
   * und Footer werden hier zentral ergänzt (DRY + saubere Semantik/a11y).
   */
  function render(content) {
    var el = app();
    el.innerHTML = header() +
      '<main id="main" class="main" tabindex="-1">' + content + '</main>' +
      footer();
    if (global.TDS.motion) global.TDS.motion.enter(el); // Bewegungs-Layer
  }

  function esc(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function activeKey() {
    var h = global.location.hash || '#/';
    if (h.indexOf('#/form') === 0) return 'form';
    if (h.indexOf('#/preise') === 0) return 'preise';
    if (h.indexOf('#/admin') === 0) return 'admin';
    if (h.indexOf('#/settings') === 0) return 'settings';
    return 'home';
  }

  function navLink(href, key, label, active) {
    var on = key === active;
    return '<a href="' + href + '" class="hdr-link' + (on ? ' active' : '') + '"' +
      (on ? ' aria-current="page"' : '') + '>' + esc(label) + '</a>';
  }

  function announce() {
    return '<div class="annc">' +
      '<span class="annc-text">🏍️ Demo-Version · Keine echten Zahlungen · Daten nur lokal im Browser.</span>' +
      '<a class="annc-link" href="#/form">Jetzt starten →</a>' +
      '</div>';
  }

  function header() {
    var active = activeKey();
    var isDark = global.TDS.theme ? global.TDS.theme.current() === 'dark' : false;
    return '' +
      '<a class="skip-link" href="#main">Zum Inhalt springen</a>' +
      announce() +
      '<header class="hdr">' +
        '<a class="logo" href="#/" aria-label="Töff Deal Scout — Startseite">Töff<em>Deal</em>Scout</a>' +
        '<button class="nav-toggle" data-action="nav-toggle" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="primary-nav">' +
          '<span class="nav-toggle-bars" aria-hidden="true"></span>' +
        '</button>' +
        '<nav class="hdr-nav" id="primary-nav" aria-label="Hauptnavigation">' +
          navLink('#/preise', 'preise', 'Preise', active) +
          navLink('#/form', 'form', 'Anfrage', active) +
          navLink('#/admin', 'admin', 'Admin', active) +
          navLink('#/settings', 'settings', 'Einstellungen', active) +
          '<button class="icon-btn" data-action="theme-toggle" type="button" ' +
            'title="Hell/Dunkel umschalten" aria-label="Design umschalten" aria-pressed="' + (isDark ? 'true' : 'false') + '">◐</button>' +
        '</nav>' +
      '</header>';
  }

  function footCol(title, links) {
    var items = links.map(function (l) {
      return '<li><a href="' + l[1] + '">' + esc(l[0]) + '</a></li>';
    }).join('');
    return '<div class="foot-col"><div class="foot-head">' + esc(title) + '</div><ul>' + items + '</ul></div>';
  }

  function footer() {
    return '' +
      '<footer class="footer">' +
        '<div class="footer-top">' +
          '<div class="foot-brand">' +
            '<div class="logo logo-foot">Töff<em>Deal</em>Scout</div>' +
            '<p class="foot-tag">Die smarte Motorrad-Kaufberatung für die Schweiz &amp; DACH. Finde den besten Deal — mit Daten statt Bauchgefühl.</p>' +
            '<form class="newsletter" data-action="newsletter">' +
              '<input type="email" id="nl-email" placeholder="E-Mail für Tipps &amp; Updates" aria-label="E-Mail-Adresse">' +
              '<button class="btn-primary" type="button" data-action="newsletter">Abonnieren</button>' +
            '</form>' +
          '</div>' +
          '<div class="foot-cols">' +
            footCol('Produkt', [['Anfrage stellen', '#/form'], ['Pakete & Preise', '#/preise'], ['Beispiel-Report', '#/report/demo']]) +
            footCol('Unternehmen', [['Über uns', '#/ueber-uns'], ['Kontakt', '#/kontakt'], ['Admin', '#/admin'], ['Einstellungen', '#/settings']]) +
            footCol('Ressourcen', [['Ratgeber', '#/ratgeber'], ['So funktioniert\'s', '#/ueber-uns'], ['FAQ', '#/preise']]) +
            footCol('Rechtliches', [['Datenschutz (DSG)', '#/datenschutz'], ['AGB', '#/agb'], ['Impressum', '#/impressum']]) +
          '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span>&copy; 2026 Töff Deal Scout · Zürich</span>' +
          '<span class="footer-note">Demo / MVP — Daten nur lokal im Browser (LocalStorage).</span>' +
          '<span class="foot-social">' +
            '<a href="#main" class="foot-top-link" aria-label="Nach oben">↑ Nach oben</a>' +
            '<a href="mailto:info@toeffdealscout.ch" aria-label="E-Mail">✉</a>' +
            '<a href="#/" aria-label="Instagram">◎</a><a href="#/" aria-label="X">✕</a></span>' +
        '</div>' +
      '</footer>';
  }

  function statusClass(status) {
    var s = (status || '').toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return 'st-' + s;
  }
  function statusBadge(status) {
    return '<span class="badge ' + statusClass(status) + '">' + esc(status) + '</span>';
  }
  function riskBadge(level, label) {
    return '<span class="badge risk-badge risk-' + level + '">' + esc(label) + '</span>';
  }

  global.TDS = global.TDS || {};
  global.TDS.ui = {
    render: render,
    esc: esc,
    header: header,
    footer: footer,
    statusClass: statusClass,
    statusBadge: statusBadge,
    riskBadge: riskBadge,
    // Bequemer Zugriff auf Formatierung
    fmt: fmt,
    formatDate: fmt.date
  };
})(window);
