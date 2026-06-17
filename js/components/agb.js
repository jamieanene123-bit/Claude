/*
 * components/agb.js — Allgemeine Geschäftsbedingungen (Pflichtseite).
 */
(function (global) {
  'use strict';

  var ui = global.TDS.ui;

  function view() {
    var html = '' +
      '<div class="hero hero-sm"><div class="hero-eye">Rechtliches</div>' +
        '<h1>Allgemeine Geschäftsbedingungen</h1>' +
        '<p>Die Rahmenbedingungen — für den Produktivbetrieb.</p></div>' +
      '<div class="wrap">' +
        '<div class="sec legal">' +
          '<p><strong>Demo-Hinweis:</strong> Diese Version ist eine Demonstration. Es findet ' +
            '<strong>keine Zahlung</strong> und keine kommerzielle Leistung statt. Die folgenden ' +
            'Bedingungen gelten sinngemäss im späteren Produktivbetrieb.</p>' +
          '<h2>1. Leistung</h2>' +
          '<p>Töff Deal Scout erstellt eine unverbindliche Markteinschätzung (Deal-Report) zu ' +
            'Motorrad-Inseraten. Es handelt sich um eine Beratungs-/Informationsleistung, nicht um ' +
            'eine Kauf- oder Vermittlungsgarantie.</p>' +
          '<h2>2. Preise &amp; Zahlung</h2>' +
          '<p>Im Produktivbetrieb erfolgt die Zahlung pro Report (Paketpreis) via Stripe bzw. TWINT. ' +
            'Preise verstehen sich inkl. allfälliger gesetzlicher Abgaben.</p>' +
          '<h2>3. Widerruf</h2>' +
          '<p>Da der Report unmittelbar als digitale Leistung erbracht wird, besteht nach Lieferung ' +
            'des Reports kein Rücktrittsrecht.</p>' +
          '<h2>4. Haftung</h2>' +
          '<p>Einschätzungen beruhen auf öffentlich verfügbaren Daten und Modellannahmen. Eine ' +
            'Gewähr für Vollständigkeit oder Kaufentscheidungen wird nicht übernommen.</p>' +
          '<h2>5. Recht &amp; Gerichtsstand</h2>' +
          '<p>Es gilt schweizerisches Recht. Gerichtsstand ist Zürich.</p>' +
          '<a class="btn-ghost" href="#/">← Zur Startseite</a>' +
        '</div>' +
      '</div>';
    ui.render(html);
  }

  global.TDS = global.TDS || {};
  global.TDS.views = global.TDS.views || {};
  global.TDS.views.agb = view;
})(window);
