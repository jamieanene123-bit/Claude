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

  function demoRecord() {
    var v = global.TDS.data.demo.samples()[0];
    return { id: 'demo', createdAt: new Date().toISOString(), status: 'Report erstellt', values: v };
  }

  function view(params) {
    if (params.id === 'demo') { renderReport(demoRecord()); return; }
    store.get(params.id).then(function (rec) {
      if (!rec) {
        ui.render('' + '<div class="wrap"><div class="sec"><p>Anfrage nicht gefunden.</p>' +
          '<a class="btn-ghost" href="#/admin">← Zurück</a></div></div>' + '');
        return;
      }
      renderReport(rec);
    });
  }

  function renderReport(rec) {
      var v = rec.values;
      var result = scout.generate(rec);
      var deals = result.deals;
      var s = result.summary;
      var top = deals[0];

      var html = '' +
        '<div class="print-only print-head">TöffDealScout · Deal-Report · ' + ui.esc(rec.id) + ' · ' + ui.esc(fmt.dateShort(new Date().toISOString())) + '</div>' +
        '<div class="report-head"><div class="report-head-inner">' +
          '<div class="hero-eye">Deal-Report · Mockup</div>' +
          '<h1>Top-Deals für ' + ui.esc(v.vorname) + '</h1>' +
          '<p class="report-summary">Wir haben den Markt in ' + ui.esc(s.region) + ' nach ' + ui.esc(s.modelFocus) +
            ' durchsucht und ' + s.count + ' passende Inserate bewertet — sortiert nach Deal-Score.</p>' +
          '<div class="report-meta">' +
            '<span class="mono">' + ui.esc(rec.id) + '</span>' +
            '<span>Budget: ' + ui.esc(fmt.money(s.budgetVon, s.currency) + '–' + fmt.money(s.budgetBis, s.currency)) + '</span>' +
            '<span>' + ui.esc(s.region) + '</span>' +
            ui.statusBadge(rec.status) +
          '</div>' +
          '<div class="report-kpis">' +
            '<div class="report-kpi"><b>' + s.count + '</b><span>Deals geprüft</span></div>' +
            '<div class="report-kpi"><b>' + s.avgScore.toFixed(1) + '</b><span>Ø Deal-Score</span></div>' +
            '<div class="report-kpi"><b>' + s.bestScore.toFixed(1) + '</b><span>Bester Score</span></div>' +
            '<div class="report-kpi"><b>' + ui.esc(fmt.money(top.asking, top.currency)) + '</b><span>Bester Preis</span></div>' +
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
            (rec.id === 'demo'
              ? '<a class="btn-ghost" href="#/">← Zur Startseite</a>'
              : '<a class="btn-ghost" href="#/admin/' + ui.esc(rec.id) + '">← Zur Anfrage</a>') +
            '<div class="report-actions-right">' +
              '<button class="btn-ghost" id="share-report" type="button">Report-Link kopieren</button>' +
              '<button class="btn-ghost" id="dl-btn" type="button">Als Text speichern</button>' +
              '<button class="btn-ghost" id="copy-btn" type="button">Zusammenfassung kopieren</button>' +
              '<button class="btn-ghost" id="print-btn" type="button">🖨 Drucken / PDF</button>' +
              '<a class="btn-primary" href="#/">Fertig</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '';

      ui.render(html);
      var p = global.document.getElementById('print-btn');
      if (p) p.addEventListener('click', function () { global.print(); });
      var shareBtn = global.document.getElementById('share-report');
      if (shareBtn) shareBtn.addEventListener('click', function () {
        var url = global.location.href;
        if (global.navigator && global.navigator.clipboard) {
          global.navigator.clipboard.writeText(url).then(function () {
            if (global.TDS.toast) global.TDS.toast.success('Link kopiert');
          }, function () { if (global.TDS.toast) global.TDS.toast.info('Link: ' + url); });
        } else if (global.TDS.toast) { global.TDS.toast.info('Link: ' + url); }
      });
      var dl = global.document.getElementById('dl-btn');
      if (dl) dl.addEventListener('click', function () {
        global.TDS.dom.download('toeffdealscout-report-' + rec.id + '.txt', summaryText(rec, deals, s), 'text/plain;charset=utf-8');
        if (global.TDS.toast) global.TDS.toast.success('Report gespeichert');
      });
      var c = global.document.getElementById('copy-btn');
      if (c) c.addEventListener('click', function () {
        var text = summaryText(rec, deals, s);
        var done = function () { if (global.TDS.toast) global.TDS.toast.success('Report-Zusammenfassung kopiert'); };
        if (global.navigator && global.navigator.clipboard) global.navigator.clipboard.writeText(text).then(done, done);
        else done();
      });
  }

  function summaryText(rec, deals, s) {
    var lines = ['Töff Deal Scout — Report ' + rec.id, 'Region: ' + s.region + ' · Budget: ' +
      fmt.money(s.budgetVon, s.currency) + '–' + fmt.money(s.budgetBis, s.currency), ''];
    deals.forEach(function (d, i) {
      lines.push((i + 1) + '. ' + d.title + ' (' + d.year + ', ' + fmt.km(d.km) + ')');
      lines.push('   Preis ' + fmt.money(d.asking, d.currency) + ' · Marktwert Ø ' + fmt.money(d.marketValue, d.currency) +
        ' · Score ' + d.score.toFixed(1) + '/10 · Risiko ' + d.risk.label);
      lines.push('   Empfehlung: ' + d.recommendation.text);
    });
    return lines.join('\n');
  }

  function scoreOverview(deals) {
    var bars = deals.map(function (d, i) {
      var col = d.score >= 7.5 ? 'var(--ok)' : d.score >= 5.5 ? 'var(--warn)' : 'var(--err)';
      return { label: 'Deal ' + (i + 1) + ' · ' + d.title, value: d.score, display: d.score.toFixed(1), color: col };
    });
    return '<div class="chart-card overview-card">' +
      '<div class="chart-card-head">Deal-Score im Vergleich</div>' +
      charts.bars(bars) +
      '<div class="score-legend">' +
        '<span><i class="dot dot-ok"></i> 7.5–10 Top-Deal</span>' +
        '<span><i class="dot dot-warn"></i> 5.5–7.4 solide</span>' +
        '<span><i class="dot dot-err"></i> &lt; 5.5 Vorsicht</span>' +
      '</div></div>';
  }

  function gapLabel(d) {
    if (d.valueGapPct > 1) return '<span class="gap good">' + d.valueGapPct + '% unter Markt</span>';
    if (d.valueGapPct < -1) return '<span class="gap bad">' + Math.abs(d.valueGapPct) + '% über Markt</span>';
    return '<span class="gap neutral">am Marktwert</span>';
  }

  function cardHtml(d, i) {
    var args = d.negotiationArgs.map(function (a) { return '<li>' + ui.esc(a) + '</li>'; }).join('');
    return '<div class="deal-card reco-border-' + d.recommendation.level + (i === 0 ? ' is-best' : '') + '">' +
        (i === 0 ? '<div class="best-ribbon">★ Bestes Angebot</div>' : '') +
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
          priceMeter(d) +
        '</div>' +

        '<div class="deal-specs">' +
          spec('Baujahr', d.year) +
          spec('Kilometer', fmt.number(d.km)) +
          spec('Zustand', d.condition) +
          spec('Service', d.serviceHistory ? 'Heft vorhanden' : 'unklar') +
        '</div>' +

        '<div class="deal-reco reco-' + d.recommendation.level + '"><strong>Empfehlung:</strong> ' + ui.esc(d.recommendation.text) + '</div>' +
        '<div class="deal-confidence" title="Wie belastbar ist diese Einschätzung?">Einschätzungs-Sicherheit: <b>' + d.confidence + '%</b></div>' +

        '<div class="deal-args"><div class="deal-args-head">Verhandlungsargumente</div><ul>' + args + '</ul></div>' +
      '</div>';
  }

  // Mini-Balken: Angebot relativ zum Marktwert (links günstig, rechts teuer).
  function priceMeter(d) {
    var ratio = d.marketValue ? d.asking / d.marketValue : 1;
    var pos = Math.max(4, Math.min(96, Math.round(ratio * 50))); // 50% = Marktwert
    var col = d.valueGapPct > 1 ? 'var(--ok)' : d.valueGapPct < -1 ? 'var(--err)' : 'var(--warn)';
    return '<div class="pmeter" title="Angebot vs. Marktwert">' +
      '<div class="pmeter-track"><span class="pmeter-mid"></span>' +
        '<span class="pmeter-dot" style="left:' + pos + '%;background:' + col + '"></span></div>' +
      '<div class="pmeter-labels"><span>günstig</span><span>Markt</span><span>teuer</span></div>' +
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
        '<th scope="col">Deal</th><th scope="col">Baujahr</th><th scope="col">km</th><th scope="col">Preis</th><th scope="col">Marktwert</th><th scope="col">Score</th><th scope="col">Risiko</th>' +
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
