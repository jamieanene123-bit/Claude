/*
 * components/impressum.js — Impressum (Pflichtseite).
 */
(function (global) {
  'use strict';

  var ui = global.TDS.ui;

  function view() {
    var html = '' +
      '<div class="hero hero-sm"><div class="hero-eye">Rechtliches</div>' +
        '<h1>Impressum</h1>' +
        '<p>Wer hinter Töff Deal Scout steht.</p></div>' +
      '<div class="wrap">' +
        '<div class="sec legal">' +
          '<h2>Anbieter</h2>' +
          '<p>Töff Deal Scout<br>Zürich, Schweiz</p>' +
          '<h2>Kontakt</h2>' +
          '<p><a href="mailto:info@toeffdealscout.ch">info@toeffdealscout.ch</a></p>' +
          '<h2>Hinweis</h2>' +
          '<p>Dies ist ein <strong>Demo-Projekt</strong>. Aktuell ist keine kommerzielle ' +
            'Tätigkeit aktiv; es werden keine Zahlungen abgewickelt und keine Daten an Server übertragen.</p>' +
          '<a class="btn-ghost" href="#/">← Zur Startseite</a>' +
        '</div>' +
      '</div>';
    ui.render(html);
  }

  global.TDS = global.TDS || {};
  global.TDS.views = global.TDS.views || {};
  global.TDS.views.impressum = view;
})(window);
