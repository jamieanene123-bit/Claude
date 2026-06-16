/*
 * report.js — Report-Mockup für eine Anfrage.
 * Zeigt 3 Beispiel-Deals. Noch KEINE echten Inserate — die Werte werden
 * aus den Wunschangaben der Anfrage plausibel abgeleitet (reines Mockup).
 */
(function (global) {
  'use strict';

  var ui = global.TDS.ui;
  var store = global.TDS.store;

  function view(params) {
    store.get(params.id).then(function (rec) {
      if (!rec) {
        ui.render(ui.header() + '<div class="wrap"><div class="sec"><p>Anfrage nicht gefunden.</p>' +
          '<a class="btn-ghost" href="#/admin">← Zurück</a></div></div>' + ui.footer());
        return;
      }
      var v = rec.values;
      var deals = buildDeals(v);

      var cards = deals.map(function (d, i) { return cardHtml(d, i); }).join('');

      var html = ui.header() +
        '<div class="report-head">' +
          '<div class="report-head-inner">' +
            '<div class="hero-eye">Deal-Report · Mockup</div>' +
            '<h1>Top-Deals für ' + ui.esc(v.vorname) + '</h1>' +
            '<p class="report-summary">' + ui.esc(summaryText(v)) + '</p>' +
            '<div class="report-meta">' +
              '<span class="mono">' + ui.esc(rec.id) + '</span>' +
              '<span>' + ui.esc(v.region) + '</span>' +
              '<span>' + ui.esc(budgetText(v)) + '</span>' +
              ui.statusBadge(rec.status) +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="wrap wrap-wide">' +
          '<div class="report-note">⚠️ Demo-Report mit Beispiel-Inseraten. In der finalen Version stehen hier echte, geprüfte Angebote.</div>' +
          '<div class="deals">' + cards + '</div>' +

          '<div class="report-actions">' +
            '<a class="btn-ghost" href="#/admin/' + ui.esc(rec.id) + '">← Zur Anfrage</a>' +
            '<a class="btn-primary" href="#/">Fertig</a>' +
          '</div>' +
        '</div>' +
        ui.footer();

      ui.render(html);
    });
  }

  function cardHtml(d, i) {
    var args = d.argumente.map(function (a) { return '<li>' + ui.esc(a) + '</li>'; }).join('');
    return '' +
      '<div class="deal-card">' +
        '<div class="deal-rank">Deal ' + (i + 1) + '</div>' +
        '<div class="deal-top">' +
          '<div class="deal-model">' + ui.esc(d.modell) + '</div>' +
          '<div class="deal-price">' + ui.esc(d.preis) + '</div>' +
        '</div>' +
        '<div class="deal-specs">' +
          spec('Kilometer', d.km) +
          spec('Baujahr', d.baujahr) +
        '</div>' +
        '<div class="deal-scores">' +
          '<div class="score">' +
            '<div class="score-label">Deal-Score</div>' +
            '<div class="score-bar"><span style="width:' + (d.score * 10) + '%"></span></div>' +
            '<div class="score-val">' + d.score.toFixed(1) + '<small>/10</small></div>' +
          '</div>' +
          '<div class="risk risk-' + d.risikoLevel + '">' +
            '<div class="score-label">Risiko</div>' +
            '<div class="risk-val">' + ui.esc(d.risiko) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="deal-reco reco-' + d.empfehlungLevel + '">' +
          '<strong>Empfehlung:</strong> ' + ui.esc(d.empfehlung) +
        '</div>' +
        '<div class="deal-args">' +
          '<div class="deal-args-head">Verhandlungsargumente</div>' +
          '<ul>' + args + '</ul>' +
        '</div>' +
      '</div>';
  }

  function spec(label, val) {
    return '<div class="spec"><span class="spec-label">' + ui.esc(label) + '</span>' +
      '<span class="spec-val">' + ui.esc(val) + '</span></div>';
  }

  // ---------- Mock-Generierung ----------
  function buildDeals(v) {
    var cur = v.waehrung || 'CHF';
    var lo = parseInt(v.budget_von) || 3000;
    var hi = parseInt(v.budget_bis) || 8000;
    var span = Math.max(hi - lo, 1000);

    // Modellnamen: Wunschmodell + stil-typische Beispiele
    var base = v.modell && v.modell.trim() ? v.modell.trim() : modelForStyle(v.stil);
    var alts = altModels(v.stil, base);

    function money(n) {
      var sep = cur === 'CHF' ? "'" : '.';
      return cur + ' ' + (n >= 1000 ? Math.floor(n / 1000) + sep + String(n % 1000).padStart(3, '0') : n);
    }

    return [
      {
        modell: base,
        preis: money(lo + Math.round(span * 0.35)),
        km: km(18000), baujahr: yearFrom(v.baujahr, 2),
        score: 8.7, risiko: 'Niedrig', risikoLevel: 'low',
        empfehlung: 'Top-Deal — schnell zuschlagen.', empfehlungLevel: 'good',
        argumente: ['Preis 8% unter Marktschnitt für dieses Modell.', 'Lückenloses Serviceheft erwähnt.', 'Reifen & Bremsen laut Inserat neu — kein sofortiger Invest nötig.']
      },
      {
        modell: alts[0],
        preis: money(lo + Math.round(span * 0.6)),
        km: km(31000), baujahr: yearFrom(v.baujahr, 4),
        score: 7.2, risiko: 'Mittel', risikoLevel: 'mid',
        empfehlung: 'Solide — bei Besichtigung Kette & Ritzel prüfen.', empfehlungLevel: 'ok',
        argumente: ['Etwas höherer km-Stand → Spielraum für ' + (cur) + ' 300–500 Nachlass.', 'Letzter Service unklar — Nachweis verlangen.', 'Zweithand: Vorbesitzer-Historie erfragen.']
      },
      {
        modell: alts[1],
        preis: money(lo + Math.round(span * 0.85)),
        km: km(9000), baujahr: yearFrom(v.baujahr, 1),
        score: 6.4, risiko: 'Höher', risikoLevel: 'high',
        empfehlung: 'Nur mit MFK/Gutachten — Preis grenzwertig.', empfehlungLevel: 'warn',
        argumente: ['Preis am oberen Budgetrand — wenig Verhandlungsspielraum eingeplant.', 'Händlerinserat: Gewährleistung als Hebel nutzen.', 'Optische Mängel auf Fotos → Kostenvoranschlag als Argument.']
      }
    ];
  }

  function modelForStyle(stil) {
    var s = (Array.isArray(stil) ? stil[0] : stil) || '';
    if (/Sport/i.test(s)) return 'Yamaha YZF-R3';
    if (/Scrambler|Retro/i.test(s)) return 'Triumph Street Twin';
    if (/Enduro|Adventure/i.test(s)) return 'Suzuki V-Strom 650';
    if (/Touring/i.test(s)) return 'Kawasaki Versys 650';
    return 'Yamaha MT-07';
  }

  function altModels(stil, base) {
    var pool = ['Honda CB500F', 'Kawasaki Z650', 'KTM 390 Duke', 'Suzuki SV650', 'Honda CB650R', 'Yamaha XSR700'];
    var out = pool.filter(function (m) { return m !== base; });
    return [out[0], out[1]];
  }

  function km(n) {
    return n.toLocaleString('de-CH').replace(/\./g, "'") + ' km';
  }

  function yearFrom(baujahrAb, offset) {
    var y = parseInt(baujahrAb);
    if (!y || isNaN(y)) y = 2022;
    return String(y + offset > 2024 ? 2024 : y + offset);
  }

  function budgetText(v) {
    var cur = v.waehrung || 'CHF';
    if (!v.budget_von && !v.budget_bis) return cur + ' (offen)';
    return cur + ' ' + (v.budget_von || '?') + '–' + (v.budget_bis || '?');
  }

  function summaryText(v) {
    var stil = Array.isArray(v.stil) ? v.stil.join(', ') : (v.stil || 'verschiedene Stile');
    var modell = v.modell ? '„' + v.modell + '“' : stil;
    return 'Wir haben den Markt in ' + (v.region || 'deiner Region') +
      ' nach ' + modell + ' durchsucht und 3 passende Inserate bewertet — sortiert nach Deal-Score.';
  }

  global.TDS = global.TDS || {};
  global.TDS.views = global.TDS.views || {};
  global.TDS.views.report = view;
})(window);
