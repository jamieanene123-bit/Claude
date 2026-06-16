/*
 * components/report.js — datengetriebener Deal-Report.
 * Nutzt die Scout-Engine (services/scout.js), um aus der Anfrage Deals zu
 * berechnen und darzustellen: Score-Gauge, Risiko, Preisvergleich,
 * Verhandlungsargumente, Besichtigungs-Checkliste und Verkäuferfragen.
 * Druckbar (Print/PDF). KEINE echten Inserate — siehe Hinweis im Report.
 */
(function (global) {
  'use strict';

  var ui = global.TDS.ui;
  var store = global.TDS.store;
  var scout = global.TDS.scout;
  var charts = global.TDS.charts;
  var fmt = global.TDS.format;

  function view(params) {
    store.get(params.id).then(function (rec) {
      if (!rec) {
        ui.render(ui.header() + '<div class="wrap"><div class="sec"><p>Anfrage nicht gefunden.</p>' +
          '<a class="btn-ghost" href="#/admin">← Zurück</a></div></div>' + ui.footer());
        return;
      }

      var v = rec.values;
      var result = scout.generate(rec);
      var deals = result.deals;
      var s = result.summary;
      var top = deals[0];

      var html = ui.header() +
        '<div class="report-head"><div class="report-head-inner">' +
          '<div class="hero-eye">Deal-Report · Mockup</div>' +
          '<h1>Top-Deals für ' + ui.esc(v.vorname) + '</h1>' +
          '<p class="report-summary">Wir haben den Markt in ' + ui.esc(s.region) + ' nach ' + ui.esc(s.modelFocus) +
            ' durchsucht und ' + s.count + ' passende Inserate bewertet — sortiert nach Deal-Score.</p>' +
          '<div class="report-meta">' +
            '<span class="mono">' + ui.esc(rec.id) + '</span>' +
            '<span>Budget: ' + ui.esc(fmt.money(s.budgetVon, s.currency) + '–' + fmt.money(s.budgetBis, s.currency)) + '</span>' +
            '<span>Ø Score: ' + s.avgScore.toFixed(1) + '</span>' +
            ui.statusBadge(rec.status) +
          '</div>' +
        '</div></div>' +

        '<div class="wrap wrap-wide">' +
          '<div class="report-note">⚠️ Demo-Report mit synthetischen Beispiel-Inseraten. In der finalen Version stehen hier echte, geprüfte Angebote von ' +
            ui.esc(s.sources.join(', ')) + '.</div>' +

          scoreOverview(deals) +

          '<div class="deals">' + deals.map(cardHtml).join('') + '</div>' +

          comparisonTable(deals) +

          '<div class="report-cols">' +
            checklistCard(top) +
            questionsCard(top) +
          '</div>' +

          '<div class="report-actions">' +
            '<a class="btn-ghost" href="#/admin/' + ui.esc(rec.id) + '">← Zur Anfrage</a>' +
            '<div class="report-actions-right">' +
              '<button class="btn-ghost" id="print-btn">🖨 Drucken / PDF</button>' +
              '<a class="btn-primary" href="#/">Fertig</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
        ui.footer();

      ui.render(html);
      var p = global.document.getElementById('print-btn');
      if (p) p.addEventListener('click', function () { global.print(); });
    });
  }

  function scoreOverview(deals) {
    var bars = deals.map(function (d, i) {
      var col = d.score >= 7.5 ? 'var(--ok)' : d.score >= 5.5 ? 'var(--warn)' : 'var(--err)';
      return { label: 'Deal ' + (i + 1) + ' · ' + d.title, value: d.score, display: d.score.toFixed(1), color: col };
    });
    return '<div class="chart-card overview-card">' +
      '<div class="chart-card-head">Deal-Score im Vergleich</div>' +
      charts.bars(bars) + '</div>';
  }

  function gapLabel(d) {
    if (d.valueGapPct > 1) return '<span class="gap good">' + d.valueGapPct + '% unter Markt</span>';
    if (d.valueGapPct < -1) return '<span class="gap bad">' + Math.abs(d.valueGapPct) + '% über Markt</span>';
    return '<span class="gap neutral">am Marktwert</span>';
  }

  function cardHtml(d, i) {
    var args = d.negotiationArgs.map(function (a) { return '<li>' + ui.esc(a) + '</li>'; }).join('');
    return '<div class="deal-card reco-border-' + d.recommendation.level + '">' +
        '<div class="deal-cardhead">' +
          '<span class="deal-rank">Deal ' + (i + 1) + '</span>' +
          ui.riskBadge(d.risk.level, 'Risiko: ' + d.risk.label) +
        '</div>' +
        '<div class="deal-model">' + ui.esc(d.title) + '</div>' +
        '<div class="deal-sub">' + d.year + ' · ' + ui.esc(fmt.km(d.km)) + ' · ' + ui.esc(d.condition) + ' · ' + ui.esc(d.seller) + '</div>' +

        '<div class="deal-scorewrap">' + charts.gauge(d.score) + '</div>' +

        '<div class="deal-pricebox">' +
          '<div class="price-main">' + ui.esc(fmt.money(d.asking, d.currency)) + '</div>' +
          '<div class="price-sub">Marktwert Ø ' + ui.esc(fmt.money(d.marketValue, d.currency)) + ' · ' + gapLabel(d) + '</div>' +
        '</div>' +

        '<div class="deal-specs">' +
          spec('Baujahr', d.year) +
          spec('Kilometer', fmt.number(d.km)) +
          spec('Zustand', d.condition) +
          spec('Service', d.serviceHistory ? 'Heft vorhanden' : 'unklar') +
        '</div>' +

        '<div class="deal-reco reco-' + d.recommendation.level + '"><strong>Empfehlung:</strong> ' + ui.esc(d.recommendation.text) + '</div>' +

        '<div class="deal-args"><div class="deal-args-head">Verhandlungsargumente</div><ul>' + args + '</ul></div>' +
      '</div>';
  }

  function spec(label, val) {
    return '<div class="spec"><span class="spec-label">' + ui.esc(label) + '</span>' +
      '<span class="spec-val">' + ui.esc(val) + '</span></div>';
  }

  function comparisonTable(deals) {
    var rows = deals.map(function (d, i) {
      return '<tr>' +
        '<td><strong>Deal ' + (i + 1) + '</strong><br><span class="muted-cell">' + ui.esc(d.title) + '</span></td>' +
        '<td>' + d.year + '</td>' +
        '<td>' + ui.esc(fmt.number(d.km)) + '</td>' +
        '<td>' + ui.esc(fmt.money(d.asking, d.currency)) + '</td>' +
        '<td>' + ui.esc(fmt.money(d.marketValue, d.currency)) + '</td>' +
        '<td><strong>' + d.score.toFixed(1) + '</strong></td>' +
        '<td>' + ui.riskBadge(d.risk.level, d.risk.label) + '</td>' +
        '</tr>';
    }).join('');
    return '<div class="chart-card"><div class="chart-card-head">Vergleich auf einen Blick</div>' +
      '<div class="table-card no-shadow"><table class="tbl compare-tbl"><thead><tr>' +
        '<th>Deal</th><th>Baujahr</th><th>km</th><th>Preis</th><th>Marktwert</th><th>Score</th><th>Risiko</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }

  function checklistCard(d) {
    var items = d.inspectionPoints.map(function (p) { return '<li>' + ui.esc(p) + '</li>'; }).join('');
    return '<div class="chart-card">' +
      '<div class="chart-card-head">Besichtigungs-Checkliste · ' + ui.esc(d.title) + '</div>' +
      '<ul class="check-list">' + items + '</ul></div>';
  }

  function questionsCard(d) {
    var items = d.sellerQuestions.map(function (q) { return '<li>' + ui.esc(q) + '</li>'; }).join('');
    return '<div class="chart-card">' +
      '<div class="chart-card-head">Fragen an den Verkäufer</div>' +
      '<ol class="q-list">' + items + '</ol></div>';
  }

  global.TDS = global.TDS || {};
  global.TDS.views = global.TDS.views || {};
  global.TDS.views.report = view;
})(window);
