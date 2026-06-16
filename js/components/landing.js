/*
 * components/landing.js — Startseite mit Erklärung, Ablauf und CTA.
 */
(function (global) {
  'use strict';

  var ui = global.TDS.ui;
  var cfg = global.TDS.config;

  function pricingHtml() {
    return '<div class="pricing-grid">' + cfg.PACKAGES.map(function (p) {
      var feats = p.feats.map(function (f) { return '<li>' + ui.esc(f) + '</li>'; }).join('');
      return '<div class="price-card' + (p.recommended ? ' price-card-rec' : '') + '">' +
        (p.badge ? '<div class="pkg-badge">' + ui.esc(p.badge) + '</div>' : '') +
        '<div class="price-name">' + ui.esc(p.name) + '</div>' +
        '<div class="price-amount">CHF ' + ui.esc(p.price.CHF) + '</div>' +
        '<div class="price-sub2">' + ui.esc(p.sub) + '</div>' +
        '<ul class="price-feats">' + feats + '</ul>' +
        '<a class="btn-' + (p.recommended ? 'primary' : 'ghost') + ' btn-block" href="#/form">Wählen</a>' +
        '</div>';
    }).join('') + '</div>';
  }

  function faqHtml() {
    var qa = [
      ['Was kostet der Service?', 'Die Anfrage ist kostenlos. Du zahlst erst für den gewählten Report (ab CHF 9.90). Diese Demo speichert alles nur lokal — es wird nichts verrechnet.'],
      ['Woher kommen die Inserate?', 'In dieser Demo sind die Deals synthetisch (Beispieldaten). Produktiv durchsuchen wir Quellen wie anibis.ch, tutti.ch, mobile.de oder willhaben.at.'],
      ['Wie schnell bekomme ich den Report?', 'Im Normalbetrieb innerhalb von 24 Stunden nach Eingang. Quick-Check-Einschätzungen schneller.'],
      ['Berücksichtigt ihr meinen Führerausweis?', 'Ja. Bei A2/A1 filtern wir auf zulässige bzw. drosselbare Modelle, damit die Vorschläge wirklich passen.'],
      ['Was passiert mit meinen Daten?', 'In dieser Demo bleiben sie ausschliesslich in deinem Browser (LocalStorage). Kein Server, kein Konto, keine Weitergabe.']
    ];
    return '<div class="faq">' + qa.map(function (x) {
      return '<details class="faq-item"><summary>' + ui.esc(x[0]) + '</summary>' +
        '<div class="faq-a">' + ui.esc(x[1]) + '</div></details>';
    }).join('') + '</div>';
  }

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
    var html = '' +
      '<div class="hero">' +
        '<div class="hero-eye">Motorrad-Kaufberatung · Schweiz &amp; DACH</div>' +
        '<h1>Den besten Deal finden — ohne Risiko.</h1>' +
        '<p>Sag uns, welches Töff du suchst. Wir analysieren den Markt und liefern eine klare Einschätzung mit Deal-Score, Risiko und Verhandlungsargumenten.</p>' +
        '<a class="btn-primary" href="#/form">Suchanfrage starten →</a>' +
        '<div class="hero-trust">Kostenlos &amp; unverbindlich · ~2 Minuten · kein Konto nötig</div>' +
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

        '<div class="section-eye">Pakete &amp; Preise</div>' +
        pricingHtml() +

        '<div class="section-eye">Häufige Fragen</div>' +
        faqHtml() +

        '<div class="cta-band">' +
          '<div>' +
            '<div class="cta-title">Bereit, den besten Deal zu finden?</div>' +
            '<div class="cta-sub">Kostenlos starten — du zahlst erst für den Report.</div>' +
          '</div>' +
          '<a class="btn-primary" href="#/form">Jetzt Anfrage stellen →</a>' +
        '</div>' +
      '</div>' +

      '';

    ui.render(html);
  }

  global.TDS = global.TDS || {};
  global.TDS.views = global.TDS.views || {};
  global.TDS.views.landing = view;
})(window);
