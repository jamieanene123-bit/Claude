/*
 * components/ueber-uns.js — Über-uns-Seite (Story, Mission, Werte).
 */
(function (global) {
  'use strict';

  var ui = global.TDS.ui;

  function value(icon, title, text) {
    return '<div class="value-card"><div class="value-ico">' + icon + '</div>' +
      '<div class="value-title">' + ui.esc(title) + '</div>' +
      '<div class="value-text">' + ui.esc(text) + '</div></div>';
  }

  function view() {
    var html = '' +
      '<div class="hero hero-sm"><div class="hero-eye">Über uns</div>' +
        '<h1>Bessere Töff-Käufe — mit Daten statt Bauchgefühl</h1>' +
        '<p>Wir machen den unübersichtlichen Occasionsmarkt transparent: ein klarer Report statt stundenlangem Vergleichen.</p></div>' +

      '<div class="wrap wrap-wide">' +
        '<div class="about-lead sec">' +
          '<p>Ein gutes gebrauchtes Motorrad zu finden, kostet Nerven: Hunderte Inserate, ' +
          'schwankende Preise, versteckte Mängel. <strong>Töff Deal Scout</strong> ist entstanden, ' +
          'weil wir genau dieses Problem selbst hatten — und fanden, dass es besser gehen muss.</p>' +
          '<p>Unsere Engine vergleicht Angebote mit realistischen Marktwerten, bewertet Risiko und ' +
          'liefert konkrete Verhandlungsargumente. So entscheidest du sicher statt aus dem Bauch heraus.</p>' +
        '</div>' +

        '<div class="section-head"><div class="section-eye">Wofür wir stehen</div>' +
        '<h2 class="section-title">Unsere Werte</h2></div>' +
        '<div class="values-grid">' +
          value('🔍', 'Transparenz', 'Nachvollziehbare Bewertungen statt Black-Box. Du siehst, warum ein Deal gut ist.') +
          value('⚖️', 'Unabhängigkeit', 'Wir verkaufen keine Motorräder und kassieren keine Vermittlungs-Provision.') +
          value('🛡️', 'Datenschutz', 'Deine Daten bleiben bei dir. In dieser Demo sogar ausschliesslich im Browser.') +
          value('🇨🇭', 'DACH-Fokus', 'Quellen und Preise zugeschnitten auf Schweiz, Deutschland, Österreich und Liechtenstein.') +
        '</div>' +

        '<div class="cta-hero" style="margin-top:48px"><div class="cta-hero-inner">' +
          '<h2>Probier es aus — kostenlos</h2>' +
          '<p>In zwei Minuten zu deinem persönlichen Deal-Report.</p>' +
          '<a class="btn-primary btn-lg" href="#/form">Anfrage starten →</a>' +
        '</div></div>' +
      '</div>';
    ui.render(html);
  }

  global.TDS = global.TDS || {};
  global.TDS.views = global.TDS.views || {};
  global.TDS.views.ueberUns = view;
})(window);
