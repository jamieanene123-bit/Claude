/*
 * services/scout.js — Deal-Generierungs- & Bewertungs-Engine.
 *
 * Erzeugt aus einer Anfrage plausible Beispiel-Deals und bewertet sie
 * (Deal-Score, Risiko, Empfehlung, Verhandlungsargumente). KEINE echten
 * Inserate — die Listings werden aus dem Markt-Datensatz (data/market.js)
 * synthetisiert. Deterministisch pro Anfrage-ID (seeded RNG): derselbe
 * Report ergibt immer dieselben Deals.
 *
 * Reine Funktionen ohne DOM → vollständig unit-testbar (siehe tests/).
 */
(function (global) {
  'use strict';

  var cfg = global.TDS.config;
  var market = global.TDS.data.market;
  var fmt = global.TDS.format;

  var NOW_YEAR = 2025;

  /* ---------- Seeded RNG (deterministisch) ---------- */
  function cyrb53(str, seed) {
    var h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (var i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function makeRng(seedStr) {
    var seed = cyrb53(seedStr || 'tds', 1);
    return mulberry32(seed);
  }

  /* ---------- Helfer ---------- */
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function round(n, step) { step = step || 1; return Math.round(n / step) * step; }

  function parseKm(s) {
    if (!s) return null;
    var digits = String(s).replace(/[^\d]/g, '');
    if (!digits) return null; // "Egal", "Keine Präferenz"
    return parseInt(digits, 10);
  }
  function parseYear(s) {
    var y = parseInt(s, 10);
    return (y && y > 1990) ? y : null;
  }

  /* ---------- Constraints aus Anfrage ---------- */
  function constraints(values) {
    var styles = (values.stil || []).map(function (label) { return cfg.STYLE_KEYS[label] || 'any'; });
    var anyStyle = styles.length === 0 || styles.indexOf('any') !== -1;
    var kwCap = cfg.LICENSE_KW[values.ausweis];
    if (kwCap === undefined) kwCap = Infinity;
    var von = parseInt(values.budget_von, 10) || 3000;
    var bis = parseInt(values.budget_bis, 10) || Math.max(von + 2000, 8000);
    return {
      styles: anyStyle ? null : styles,
      a2required: kwCap <= 35,
      a1required: kwCap <= 11,
      kwCap: kwCap,
      budgetVon: von, budgetBis: bis,
      currency: values.waehrung || cfg.currencyFor(values.land),
      yearFrom: parseYear(values.baujahr),
      maxKm: parseKm(values.km),
      modelPref: (values.modell || '').trim(),
      region: values.region || '–',
      land: values.land
    };
  }

  /* ---------- Kandidaten wählen ---------- */
  function candidates(c, count) {
    var pool = [];
    var seen = {};
    function add(list) {
      list.forEach(function (m) {
        var key = m.brand + m.model;
        if (!seen[key]) { seen[key] = true; pool.push(m); }
      });
    }
    if (c.modelPref) add(market.search(c.modelPref));
    if (c.styles) c.styles.forEach(function (s) { add(market.byStyle(s)); });
    else add(market.all());

    // Lizenz-Filter: A1 (≤11 kW / 125er) ist strenger als A2 (drosselbar).
    var licenseOk = c.a1required
      ? function (m) { return m.a1; }
      : (c.a2required ? function (m) { return m.a2; } : function () { return true; });
    pool = pool.filter(licenseOk);

    // Auffüllen, falls nach Filter zu wenige Kandidaten.
    if (pool.length < count) {
      add(market.all().filter(licenseOk));
    }

    // Fit-Score: Budget-Nähe + Zuverlässigkeit + Modell-Treffer
    var mid = (c.budgetVon + c.budgetBis) / 2;
    pool.forEach(function (m) {
      var priceDist = Math.abs(m.refPrice - mid) / Math.max(mid, 1);
      var modelHit = c.modelPref && (m.brand + ' ' + m.model).toLowerCase().indexOf(c.modelPref.toLowerCase()) !== -1;
      m._fit = (modelHit ? 3 : 0) + (1 - clamp(priceDist, 0, 1)) + m.reliability * 0.15;
    });
    pool.sort(function (a, b) { return b._fit - a._fit; });
    return pool.slice(0, count);
  }

  /* ---------- ein Listing + Bewertung ---------- */
  var ASK_RANGES = [[0.88, 0.96], [0.97, 1.05], [1.06, 1.16], [0.94, 1.04], [1.00, 1.12]];
  var CONDITIONS = [
    { label: 'sehr gut', w: 3, bonus: 0.8, risk: -6 },
    { label: 'gut', w: 5, bonus: 0.3, risk: 0 },
    { label: 'mittel', w: 3, bonus: -0.4, risk: 10 },
    { label: 'mit Mängeln', w: 1, bonus: -1.2, risk: 22 }
  ];

  function weighted(rng, items) {
    var total = items.reduce(function (s, i) { return s + i.w; }, 0);
    var r = rng() * total;
    for (var i = 0; i < items.length; i++) { r -= items[i].w; if (r <= 0) return items[i]; }
    return items[items.length - 1];
  }

  function buildDeal(model, rank, c, rng) {
    var cur = c.currency;

    // Jahr (respektiert "Baujahr ab")
    var minYear = Math.max(c.yearFrom || 2013, 2013, model.refYear - 5);
    var maxYear = Math.min(2024, model.refYear + 2);
    if (minYear > maxYear) minYear = maxYear;
    var year = Math.round(minYear + rng() * (maxYear - minYear));

    var age = Math.max(0, NOW_YEAR - year);
    var expectedKm = 4000 + age * 5500;
    var km = round(expectedKm * (0.6 + rng() * 0.9), 500);
    if (c.maxKm) km = Math.min(km, c.maxKm);
    km = Math.max(1500, km);

    var cond = weighted(rng, CONDITIONS);
    var seller = rng() < 0.62 ? 'privat' : 'Händler';
    var serviceHistory = rng() < (cond.label === 'sehr gut' ? 0.85 : 0.55);
    var freshMfk = c.land === 'CH' ? rng() < 0.5 : false;

    // Marktwert
    var yearFactor = Math.pow(1 - model.depr, model.refYear - year);
    var kmFactor = clamp(1 - (km - market.REF_KM) / 10000 * 0.04, 0.6, 1.2);
    var marketValue = model.refPrice * yearFactor * kmFactor * (1 + cond.bonus * 0.04);

    // Angebotspreis
    var rangeIdx = Math.min(rank, ASK_RANGES.length - 1);
    var rg = ASK_RANGES[rangeIdx];
    var askMult = rg[0] + rng() * (rg[1] - rg[0]);
    if (seller === 'Händler') askMult += 0.04; // Gewährleistung -> teurer
    var asking = marketValue * askMult;
    // in Budget halten
    asking = clamp(asking, c.budgetVon, c.budgetBis);
    asking = round(asking, 50);

    var gap = (marketValue - asking) / marketValue; // >0 = unter Marktwert

    // Deal-Score
    var kmRel = (km - expectedKm) / expectedKm;
    var score = 6
      + gap * 22
      + cond.bonus
      + (model.reliability - 3) * 0.4
      + clamp(-kmRel * 1.5, -1.2, 0.8)
      + (serviceHistory ? 0.5 : -0.4)
      + (seller === 'Händler' ? 0.2 : 0);
    score = clamp(score, 1.5, 9.8);
    score = Math.round(score * 10) / 10;

    // Risiko
    var risk = 10
      + age * 3.2
      + Math.max(0, kmRel) * 22
      + cond.risk
      + (3 - model.reliability) * 7
      + (model.parts === 'hoch' ? 10 : model.parts === 'mittel' ? 3 : 0)
      + (serviceHistory ? -6 : 8)
      + (seller === 'privat' ? 4 : 0)
      + model.issues.length * 2;
    risk = Math.round(clamp(risk, 5, 95));
    var riskLevel = risk < 34 ? 'low' : risk < 64 ? 'mid' : 'high';
    var riskLabel = riskLevel === 'low' ? 'Niedrig' : riskLevel === 'mid' ? 'Mittel' : 'Höher';

    // Empfehlung
    var reco;
    if (score >= 7.5 && riskLevel !== 'high') reco = { level: 'good', text: 'Top-Deal — wenig Risiko, schnell handeln.' };
    else if (score >= 6 && riskLevel !== 'high') reco = { level: 'ok', text: 'Solide — mit gezielten Fragen nachverhandeln.' };
    else if (riskLevel === 'high') reco = { level: 'warn', text: 'Erhöhtes Risiko — nur mit MFK/Gutachten kaufen.' };
    else reco = { level: 'ok', text: 'Brauchbar — Preis vor Ort nachverhandeln.' };

    // Einschätzungs-Sicherheit (wie belastbar ist die Bewertung?)
    var confidence = 62
      + (serviceHistory ? 14 : 0)
      + (model.reliability - 3) * 5
      + (seller === 'Händler' ? 8 : 0)
      - (cond.label === 'mit Mängeln' ? 12 : 0)
      - (model.parts === 'hoch' ? 4 : 0);
    confidence = Math.round(clamp(confidence, 40, 96));

    return {
      confidence: confidence,
      rank: rank,
      brand: model.brand,
      model: model.model,
      title: model.brand + ' ' + model.model,
      year: year,
      km: km,
      condition: cond.label,
      seller: seller,
      serviceHistory: serviceHistory,
      freshMfk: freshMfk,
      location: c.region,
      currency: cur,
      asking: asking,
      marketValue: Math.round(marketValue),
      valueGapPct: Math.round(gap * 100),
      score: score,
      risk: { score: risk, level: riskLevel, label: riskLabel },
      recommendation: reco,
      reliability: model.reliability,
      parts: model.parts,
      issues: model.issues.slice(),
      negotiationArgs: negotiation(model, { asking: asking, marketValue: marketValue, gap: gap, km: km, expectedKm: expectedKm, cond: cond.label, seller: seller, serviceHistory: serviceHistory }, cur),
      inspectionPoints: inspection(model, cond.label),
      sellerQuestions: questions(model, seller, serviceHistory)
    };
  }

  function negotiation(model, d, cur) {
    var args = [];
    var diff = Math.round(Math.abs(d.marketValue - d.asking));
    if (d.gap < -0.01) args.push('Preis ~' + fmt.money(diff, cur) + ' über Marktwert (Ø ' + fmt.money(d.marketValue, cur) + ') → Nachlass fordern.');
    else if (d.gap > 0.03) args.push('Bereits ' + fmt.money(diff, cur) + ' unter Marktwert — zügig zusagen, nur kleiner Puffer nötig.');
    else args.push('Preis nahe Marktwert (Ø ' + fmt.money(d.marketValue, cur) + ') — Spielraum über Mängel/Service holen.');
    if (d.km > d.expectedKm * 1.15) args.push('Überdurchschnittliche Laufleistung (' + fmt.km(d.km) + ') → Verschleissteile einpreisen.');
    if (d.cond === 'mittel' || d.cond === 'mit Mängeln') args.push('Sichtbare Mängel → Kostenvoranschlag als Hebel nutzen.');
    if (!d.serviceHistory) args.push('Kein lückenloses Serviceheft → Abschlag für unklare Wartung.');
    if (d.seller === 'Händler') args.push('Händler → Gewährleistung & ggf. frische MFK schriftlich sichern.');
    else args.push('Privatkauf → Probefahrt und Kaltstart-Check vor Zusage vereinbaren.');
    return args.slice(0, 4);
  }

  function inspection(model, cond) {
    var base = ['Rahmen-/Motornummern mit Ausweis abgleichen', 'Reifen-Alter (DOT) & Profil', 'Bremsbeläge & -scheiben', 'Gabel auf Ölverlust', 'Elektrik/Beleuchtung & Kaltstart'];
    var pts = model.issues.concat(base);
    if (cond === 'mit Mängeln') pts.unshift('Unfall-/Sturzschäden genau dokumentieren');
    // Duplikate raus
    var seen = {}, out = [];
    pts.forEach(function (p) { if (!seen[p]) { seen[p] = true; out.push(p); } });
    return out.slice(0, 6);
  }

  function questions(model, seller, serviceHistory) {
    var q = ['Warum wird verkauft / wie lange im Besitz?', 'Sturz-, Unfall- oder Trackday-Historie?', 'Letzter Service – wann, wo, was gemacht?'];
    if (!serviceHistory) q.push('Liegen Servicebelege/Rechnungen vor?');
    if (seller === 'Händler') q.push('Welche Gewährleistung / Garantie ist inklusive?');
    else q.push('Ist eine Probefahrt möglich (mit Anzahlung/Ausweis)?');
    q.push('Bekannte Mängel oder anstehende Arbeiten?');
    return q.slice(0, 5);
  }

  /* ---------- öffentliche API ---------- */
  function generate(record) {
    var values = record.values || record;
    var c = constraints(values);
    var pkg = cfg.packageById(values.paket);
    var count = clamp(pkg ? pkg.dealCount : 3, 1, 5);
    var rng = makeRng(record.id || 'preview');

    var picks = candidates(c, count);
    var deals = picks.map(function (m, i) { return buildDeal(m, i, c, rng); });
    deals.sort(function (a, b) { return b.score - a.score; });
    deals.forEach(function (d, i) { d.rank = i; });

    var scores = deals.map(function (d) { return d.score; });
    var avg = scores.length ? scores.reduce(function (s, x) { return s + x; }, 0) / scores.length : 0;
    var srcs = (cfg.REGIONS[c.land] && cfg.REGIONS[c.land].sources) || ['anibis.ch', 'tutti.ch'];

    return {
      deals: deals,
      summary: {
        count: deals.length,
        region: c.region,
        currency: c.currency,
        budgetVon: c.budgetVon,
        budgetBis: c.budgetBis,
        modelFocus: c.modelPref || (values.stil && values.stil.length ? values.stil.join(', ') : 'verschiedene Stile'),
        avgScore: Math.round(avg * 10) / 10,
        bestScore: scores.length ? Math.max.apply(null, scores) : 0,
        sources: srcs
      }
    };
  }

  global.TDS = global.TDS || {};
  global.TDS.scout = { generate: generate, _constraints: constraints, _makeRng: makeRng };
})(window);
