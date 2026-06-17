/*
 * components/preise.js — Pakete & Preise (eigene Seite mit Vergleichstabelle).
 */
(function (global) {
  'use strict';

  var ui = global.TDS.ui;
  var cfg = global.TDS.config;

  function priceCards() {
    return '<div class="pricing-grid">' + cfg.PACKAGES.map(function (p) {
      var feats = p.feats.map(function (f) { return '<li>' + ui.esc(f) + '</li>'; }).join('');
      return '<div class="price-card' + (p.recommended ? ' price-card-rec' : '') + '">' +
        (p.badge ? '<div class="pkg-badge">' + ui.esc(p.badge) + '</div>' : '') +
        '<div class="price-name">' + ui.esc(p.name) + '</div>' +
        '<div class="price-amount">CHF ' + ui.esc(p.price.CHF) + '</div>' +
        '<div class="price-sub2">' + ui.esc(p.sub) + '</div>' +
        '<ul class="price-feats">' + feats + '</ul>' +
        '<a class="btn-' + (p.recommended ? 'primary' : 'secondary') + ' btn-block" href="#/form">' + ui.esc(p.name) + ' wählen</a>' +
        '</div>';
    }).join('') + '</div>';
  }

  function compareTable() {
    var rows = [
      ['Deal-Score', ['✓', '✓', '✓']],
      ['Preisvergleich Markt', ['✓', '✓', '✓']],
      ['Anzahl bewertete Inserate', ['1', '3', '5']],
      ['Verhandlungsargumente', ['–', '✓', '✓']],
      ['Fragen für Verkäufer', ['–', '✓', '✓']],
      ['Besichtigungs-Checkliste', ['–', '–', '✓']],
      ['30-Min Beratungscall', ['–', '–', '✓']],
      ['Lieferzeit', ['12 h', '24 h', '24 h']]
    ];
    var head = '<tr><th scope="col">Leistung</th>' +
      cfg.PACKAGES.map(function (p) { return '<th scope="col">' + ui.esc(p.name) + '</th>'; }).join('') + '</tr>';
    var body = rows.map(function (r) {
      return '<tr><th scope="row">' + ui.esc(r[0]) + '</th>' +
        r[1].map(function (c) {
          var cls = c === '✓' ? ' class="cmp-yes"' : (c === '–' ? ' class="cmp-no"' : '');
          return '<td' + cls + '>' + ui.esc(c) + '</td>';
        }).join('') + '</tr>';
    }).join('');
    return '<div class="table-card"><table class="tbl cmp-table"><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>';
  }

  function view() {
    var html = '' +
      '<div class="hero hero-sm"><div class="hero-eye">Pakete &amp; Preise</div>' +
        '<h1>Transparent. Du zahlst erst für den Report.</h1>' +
        '<p>Die Anfrage ist immer kostenlos. Kein Abo, keine versteckten Kosten.</p></div>' +

      '<div class="wrap wrap-wide">' +
        priceCards() +
        '<div class="section-head"><div class="section-eye">Im Detail</div>' +
        '<h2 class="section-title">Was steckt in welchem Paket?</h2></div>' +
        compareTable() +
        '<div class="pricing-note">Demo: Es werden keine echten Zahlungen ausgelöst. Im Produktivbetrieb via TWINT/Stripe.</div>' +
        '<div class="cta-hero" style="margin-top:40px"><div class="cta-hero-inner">' +
          '<h2>Bereit?</h2><p>Starte mit einer kostenlosen Anfrage.</p>' +
          '<a class="btn-primary btn-lg" href="#/form">Anfrage starten →</a>' +
        '</div></div>' +
      '</div>';
    ui.render(html);
  }

  global.TDS = global.TDS || {};
  global.TDS.views = global.TDS.views || {};
  global.TDS.views.preise = view;
})(window);
