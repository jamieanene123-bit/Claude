/*
 * components/landing.js — Startseite mit Erklärung, Ablauf und CTA.
 */
(function (global) {
  'use strict';

  var ui = global.TDS.ui;

  function feature(icon, title, text) {
    return '<div class="feat"><div class="feat-ico">' + icon + '</div>' +
      '<div class="feat-title">' + ui.esc(title) + '</div>' +
      '<div class="feat-text">' + ui.esc(text) + '</div></div>';
  }

  function step(n, title, text) {
    return '<div class="step"><div class="step-num">' + n + '</div>' +
      '<div class="step-title">' + ui.esc(title) + '</div>' +
      '<div class="step-text">' + ui.esc(text) + '</div></div>';
  }

  function view() {
    var html = ui.header() +
      '<div class="hero">' +
        '<div class="hero-eye">Motorrad-Kaufberatung · Schweiz &amp; DACH</div>' +
        '<h1>Den besten Deal finden — ohne Risiko.</h1>' +
        '<p>Sag uns, welches Töff du suchst. Wir analysieren den Markt und liefern eine klare Einschätzung mit Deal-Score, Risiko und Verhandlungsargumenten.</p>' +
        '<a class="btn-primary" href="#/form">Suchanfrage starten →</a>' +
        '<div class="hero-pills">' +
          '<div class="pill">Preis-Check</div>' +
          '<div class="pill">Risikobewertung</div>' +
          '<div class="pill">A2-Filter</div>' +
          '<div class="pill">Verhandlungsskript</div>' +
        '</div>' +
      '</div>' +

      '<div class="wrap wrap-wide">' +
        '<div class="section-eye">So funktioniert\'s</div>' +
        '<div class="steps">' +
          step(1, 'Anfrage ausfüllen', 'Budget, Stil, Wunschmodell und Region — in 2 Minuten erledigt.') +
          step(2, 'Wir scouten den Markt', 'Wir prüfen aktuelle Inserate auf Preis, Zustand und Risiko.') +
          step(3, 'Report erhalten', 'Top-Deals mit Deal-Score und Verhandlungsargumenten.') +
        '</div>' +

        '<div class="section-eye">Das steckt im Report</div>' +
        '<div class="feat-grid">' +
          feature('📊', 'Deal-Score 0–10', 'Objektive Bewertung aus Preis vs. Marktwert, Zustand, Laufleistung und Zuverlässigkeit.') +
          feature('🛡️', 'Risiko-Einschätzung', 'Niedrig / Mittel / Höher — basierend auf Alter, km, Service-Historie und modelltypischen Schwächen.') +
          feature('🤝', 'Verhandlungsargumente', 'Konkrete Hebel und ein realistischer Zielpreis für dein Verkäufergespräch.') +
          feature('📋', 'Besichtigungs-Checkliste', 'Worauf du bei genau diesem Modell vor Ort achten musst — plus Fragen für den Verkäufer.') +
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
