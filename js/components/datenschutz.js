/*
 * components/datenschutz.js — Datenschutzerklärung (Pflichtseite).
 */
(function (global) {
  'use strict';

  var ui = global.TDS.ui;

  function view() {
    var html = '' +
      '<div class="hero hero-sm"><div class="hero-eye">Rechtliches</div>' +
        '<h1>Datenschutzerklärung</h1>' +
        '<p>Wie wir mit deinen Daten umgehen — kurz und ehrlich.</p></div>' +
      '<div class="wrap">' +
        '<div class="sec legal">' +
          '<p>Diese Anwendung ist eine <strong>Demo</strong>. Es gilt das schweizerische ' +
            'Datenschutzgesetz (DSG); für Nutzer:innen aus DE/AT/LI zusätzlich die DSGVO.</p>' +
          '<h2>Welche Daten wir verarbeiten</h2>' +
          '<p>Alle Eingaben (Anfragen, Notizen, Einstellungen) werden ausschliesslich ' +
            '<strong>lokal in deinem Browser</strong> über LocalStorage gespeichert. Es gibt ' +
            '<strong>keinen Server</strong>, <strong>kein Tracking</strong>, keine Cookies zu ' +
            'Analysezwecken und <strong>keine Weitergabe</strong> an Dritte.</p>' +
          '<h2>Speicherdauer &amp; Löschung</h2>' +
          '<p>Die Daten bleiben so lange erhalten, bis du sie löschst. Über ' +
            '<a href="#/settings">Einstellungen → Daten</a> kannst du jederzeit alles entfernen.</p>' +
          '<h2>Kontakt</h2>' +
          '<p>Fragen zum Datenschutz: <a href="mailto:info@toeffdealscout.ch">info@toeffdealscout.ch</a></p>' +
          '<a class="btn-ghost" href="#/">← Zur Startseite</a>' +
        '</div>' +
      '</div>';
    ui.render(html);
  }

  global.TDS = global.TDS || {};
  global.TDS.views = global.TDS.views || {};
  global.TDS.views.datenschutz = view;
})(window);
