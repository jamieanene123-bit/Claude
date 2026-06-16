/*
 * landing.js — Startseite mit kurzer Erklärung und CTA.
 */
(function (global) {
  'use strict';

  var ui = global.TDS.ui;

  function view() {
    var html = ui.header() +
      '<div class="hero">' +
        '<div class="hero-eye">Motorrad-Kaufberatung</div>' +
        '<h1>Den besten Deal finden — ohne Risiko.</h1>' +
        '<p>Sag uns, welches Töff du suchst. Wir analysieren den Markt und liefern dir eine klare Einschätzung mit Verhandlungsargumenten.</p>' +
        '<a class="btn-primary" href="#/form">Suchanfrage starten →</a>' +
        '<div class="hero-pills">' +
          '<div class="pill">Preis-Check</div>' +
          '<div class="pill">Risikobewertung</div>' +
          '<div class="pill">A2-Filter</div>' +
          '<div class="pill">Verhandlungsskript</div>' +
        '</div>' +
      '</div>' +

      '<div class="wrap">' +
        '<div class="steps">' +
          '<div class="step">' +
            '<div class="step-num">1</div>' +
            '<div class="step-title">Anfrage ausfüllen</div>' +
            '<div class="step-text">Budget, Stil, Wunschmodell und Region — in 2 Minuten erledigt.</div>' +
          '</div>' +
          '<div class="step">' +
            '<div class="step-num">2</div>' +
            '<div class="step-title">Wir scouten den Markt</div>' +
            '<div class="step-text">Wir prüfen aktuelle Inserate auf Preis, Zustand und Risiko.</div>' +
          '</div>' +
          '<div class="step">' +
            '<div class="step-num">3</div>' +
            '<div class="step-title">Report erhalten</div>' +
            '<div class="step-text">Top-Deals mit Deal-Score und Verhandlungsargumenten.</div>' +
          '</div>' +
        '</div>' +

        '<div class="cta-band">' +
          '<div>' +
            '<div class="cta-title">Bereit, den besten Deal zu finden?</div>' +
            '<div class="cta-sub">Kostenlos starten — du zahlst erst für den Report.</div>' +
          '</div>' +
          '<a class="btn-primary" href="#/form">Jetzt Anfrage stellen →</a>' +
        '</div>' +
      '</div>' +

      ui.footer();

    ui.render(html);
  }

  global.TDS = global.TDS || {};
  global.TDS.views = global.TDS.views || {};
  global.TDS.views.landing = view;
})(window);
