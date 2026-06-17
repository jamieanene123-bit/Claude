/*
 * components/landing.js — Marketing-Startseite (Shopify-Stil).
 * Reichhaltige Sektionen: zweispaltiger Hero mit Produkt-Visual, Trust-Leiste,
 * Statistik-Band, alternierende Feature-Blöcke, Ablauf-Stepper, Testimonials,
 * Pricing und FAQ. Liefert nur Content; render() ergänzt Header/Main/Footer.
 */
(function (global) {
  'use strict';

  var ui = global.TDS.ui;
  var cfg = global.TDS.config;
  var scout = global.TDS.scout;
  var fmt = global.TDS.format;

  // Feste Demo-Anfrage für den Live-Hero (deterministisch via Scout-Engine).
  var DEMO_REQUEST = { id: 'demo-hero', values: { land: 'CH', region: 'Zürich', ausweis: 'A (unbeschränkt)', stil: ['Naked Bike'], budget_von: 4000, budget_bis: 9000, waehrung: 'CHF', paket: 'Scout' } };

  /* ---------- Hero ---------- */
  function staticHeroCard() {
    // Dekoratives "Deal-Vorschau"-Kärtchen (rein visuell).
    return '<div class="hero-visual" aria-hidden="true">' +
      '<div class="hv-card hv-card-main">' +
        '<div class="hv-row"><span class="hv-rank">Bestes Angebot</span><span class="hv-risk">Risiko: Niedrig</span></div>' +
        '<div class="hv-model">Yamaha MT-07</div>' +
        '<div class="hv-meta">2021 · 18 000 km · privat</div>' +
        '<div class="hv-score"><div class="hv-gauge"><span>8.7</span></div>' +
          '<div class="hv-price"><div class="hv-amount">CHF 6’450</div><div class="hv-sub">12% unter Markt</div></div></div>' +
        '<div class="hv-bar"><i style="width:87%"></i></div>' +
      '</div>' +
      '<div class="hv-card hv-card-float hv-f1">📊 Deal-Score 8.7</div>' +
      '<div class="hv-card hv-card-float hv-f2">🤝 CHF 850 Sparpotenzial</div>' +
    '</div>';
  }

  // Live: ruft die echte Scout-Engine auf und zeigt das beste Beispiel-Angebot.
  function heroVisual() {
    var result = scout && scout.generate(DEMO_REQUEST);
    var best = result && result.deals && result.deals[0];
    if (!best) return staticHeroCard();
    var cur = best.currency || 'CHF';
    var scoreWidth = Math.round(best.score / 10 * 100);
    var gapLabel = best.valueGapPct > 0
      ? best.valueGapPct + '% unter Markt'
      : (best.valueGapPct < 0 ? Math.abs(best.valueGapPct) + '% über Markt' : 'am Marktwert');
    var savingAbs = Math.round(Math.abs(best.marketValue - best.asking));
    return '<div class="hero-visual" aria-label="Beispiel Deal-Report (Live-Demo)">' +
      '<div class="hv-card hv-card-main">' +
        '<div class="hv-row">' +
          '<span class="hv-rank">Bestes Angebot</span>' +
          '<span class="hv-risk hv-risk-' + best.risk.level + '">Risiko: ' + ui.esc(best.risk.label) + '</span>' +
        '</div>' +
        '<div class="hv-model">' + ui.esc(best.brand + ' ' + best.model) + '</div>' +
        '<div class="hv-meta">' + ui.esc(best.year + ' · ' + fmt.km(best.km) + ' · ' + best.seller) + '</div>' +
        '<div class="hv-score">' +
          '<div class="hv-gauge"><span>' + best.score.toFixed(1) + '</span></div>' +
          '<div class="hv-price">' +
            '<div class="hv-amount">' + ui.esc(fmt.money(best.asking, cur)) + '</div>' +
            '<div class="hv-sub">' + ui.esc(gapLabel) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="hv-bar"><i style="width:' + scoreWidth + '%"></i></div>' +
      '</div>' +
      '<div class="hv-card hv-card-float hv-f1">Deal-Score ' + best.score.toFixed(1) + '</div>' +
      '<div class="hv-card hv-card-float hv-f2">' +
        (best.valueGapPct > 0 ? ui.esc(fmt.money(savingAbs, cur)) + ' Sparpotenzial' : 'Preis nahe Marktwert') +
      '</div>' +
    '</div>';
  }

  function hero() {
    return '<section class="hero2">' +
      '<div class="hero2-inner">' +
        '<div class="hero2-text">' +
          '<div class="hero-eye">Motorrad-Kaufberatung · Schweiz &amp; DACH · Live-Demo</div>' +
          '<h1>Das beste Töff zum besten Preis — <span class="accentword">ohne Risiko</span>.</h1>' +
          '<p class="hero2-sub">Sag uns, welches Motorrad du suchst. Wir scannen den Markt und liefern einen klaren Report mit Deal-Score, Risiko-Check und Verhandlungsargumenten.</p>' +
          '<div class="hero2-cta">' +
            '<a class="btn-primary btn-lg" href="#/form">Kostenlos starten →</a>' +
            '<a class="btn-secondary btn-lg" href="#/report/demo">Beispiel-Report ansehen</a>' +
          '</div>' +
          '<div class="hero2-trust"><span class="stars">★★★★★</span> Beta · kostenlos &amp; unverbindlich · keine Echtzahlungen</div>' +
        '</div>' +
        heroVisual() +
      '</div>' +
    '</section>';
  }

  /* ---------- Trust / Quellen ---------- */
  function trust() {
    var srcs = ['anibis.ch', 'tutti.ch', 'ricardo.ch', 'mobile.de', 'kleinanzeigen.de', 'willhaben.at', 'autoscout24'];
    return '<section class="trust-strip" aria-label="Quellen"><div class="wrap wrap-wide">' +
      '<h2 class="sr-only">Quellen, die wir durchsuchen</h2>' +
      '<div class="trust-label">Wir durchsuchen u.a.</div>' +
      '<div class="trust-logos">' + srcs.map(function (s) {
        return '<span class="trust-logo">' + ui.esc(s) + '</span>';
      }).join('') + '</div>' +
    '</div></section>';
  }

  /* ---------- Statistik-Band ---------- */
  function stats() {
    var items = [
      ['12’000+', 'Inserate analysiert', 'pro Monat (Beispiel)'],
      ['Ø 850', 'CHF Sparpotenzial', 'pro Deal (Beispiel)'],
      ['< 24 h', 'bis zum Report', 'nach Anfrage'],
      ['4', 'Länder', 'CH · DE · AT · LI']
    ];
    return '<section class="stats-band" aria-label="Kennzahlen"><div class="wrap wrap-wide">' +
      '<h2 class="sr-only">Kennzahlen</h2>' +
      '<div class="stats-demo-label">Beispielwerte · Demo</div>' +
      '<div class="stats-grid">' +
      items.map(function (s) {
        return '<div class="stat"><div class="stat-num">' + ui.esc(s[0]) + '</div>' +
          '<div class="stat-label">' + ui.esc(s[1]) + '</div>' +
          '<div class="stat-sub">' + ui.esc(s[2]) + '</div></div>';
      }).join('') + '</div></div></section>';
  }

  /* ---------- Feature-Blöcke (alternierend) ---------- */
  function illu(kind) {
    if (kind === 'score') {
      return '<svg viewBox="0 0 220 180" class="illu" role="img" aria-hidden="true">' +
        '<rect x="14" y="20" width="192" height="140" rx="14" fill="var(--surface)" stroke="var(--border)"/>' +
        '<rect x="32" y="120" width="22" height="26" rx="3" fill="var(--accent)" opacity=".35"/>' +
        '<rect x="62" y="98" width="22" height="48" rx="3" fill="var(--accent)" opacity=".55"/>' +
        '<rect x="92" y="74" width="22" height="72" rx="3" fill="var(--accent)" opacity=".75"/>' +
        '<rect x="122" y="52" width="22" height="94" rx="3" fill="var(--accent)"/>' +
        '<circle cx="170" cy="64" r="22" fill="none" stroke="var(--accent)" stroke-width="6" stroke-dasharray="104 40" transform="rotate(-90 170 64)"/>' +
        '<text x="170" y="69" text-anchor="middle" font-size="15" font-weight="700" fill="var(--text)">8.7</text>' +
      '</svg>';
    }
    if (kind === 'risk') {
      return '<svg viewBox="0 0 220 180" class="illu" role="img" aria-hidden="true">' +
        '<rect x="14" y="20" width="192" height="140" rx="14" fill="var(--surface)" stroke="var(--border)"/>' +
        '<path d="M110 44 l46 18 v34 c0 30 -22 46 -46 56 c-24 -10 -46 -26 -46 -56 V62 Z" fill="var(--ok-bg)" stroke="var(--ok)" stroke-width="3"/>' +
        '<path d="M96 100 l12 12 l22 -26" fill="none" stroke="var(--ok)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';
    }
    return '<svg viewBox="0 0 220 180" class="illu" role="img" aria-hidden="true">' +
      '<rect x="14" y="20" width="192" height="140" rx="14" fill="var(--surface)" stroke="var(--border)"/>' +
      '<rect x="34" y="48" width="120" height="12" rx="6" fill="var(--accent)" opacity=".7"/>' +
      '<rect x="34" y="74" width="152" height="10" rx="5" fill="var(--border)"/>' +
      '<rect x="34" y="94" width="138" height="10" rx="5" fill="var(--border)"/>' +
      '<rect x="34" y="120" width="84" height="26" rx="8" fill="var(--accent)"/>' +
      '<text x="76" y="138" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">-CHF 500</text>' +
    '</svg>';
  }

  function featureBlock(kind, eye, title, text, points, flip) {
    var li = points.map(function (p) { return '<li>' + ui.esc(p) + '</li>'; }).join('');
    var media = '<div class="fb-media">' + illu(kind) + '</div>';
    var body = '<div class="fb-body">' +
      '<div class="fb-eye">' + ui.esc(eye) + '</div>' +
      '<h3 class="fb-title">' + ui.esc(title) + '</h3>' +
      '<p class="fb-text">' + ui.esc(text) + '</p>' +
      '<ul class="fb-list">' + li + '</ul>' +
      '<a class="link-arrow" href="#/form">Jetzt analysieren lassen →</a>' +
      '</div>';
    return '<section class="feature-block' + (flip ? ' flip' : '') + '"><div class="wrap wrap-wide"><div class="fb-grid">' +
      (flip ? body + media : media + body) + '</div></div></section>';
  }

  /* ---------- Stepper ---------- */
  function steps() {
    var data = [
      ['1', 'Anfrage ausfüllen', 'Budget, Stil, Wunschmodell und Region — in rund 2 Minuten.'],
      ['2', 'Wir scouten den Markt', 'Wir prüfen aktuelle Inserate auf Preis, Zustand und Risiko.'],
      ['3', 'Report erhalten', 'Top-Deals mit Deal-Score, Risiko und Verhandlungsargumenten.']
    ];
    return '<section class="wrap wrap-wide">' +
      '<div class="section-head"><div class="section-eye">So funktioniert\'s</div>' +
      '<h2 class="section-title">In drei Schritten zum besten Deal</h2></div>' +
      '<div class="stepper">' + data.map(function (s) {
        return '<div class="step2"><div class="step2-num">' + s[0] + '</div>' +
          '<div class="step2-title">' + ui.esc(s[1]) + '</div>' +
          '<div class="step2-text">' + ui.esc(s[2]) + '</div></div>';
      }).join('') + '</div></section>';
  }

  /* ---------- Testimonials ---------- */
  function testimonials() {
    var data = [
      ['„Endlich wusste ich, was ein fairer Preis ist. CHF 700 runtergehandelt."', 'Lena B.', 'Zürich · Yamaha MT-07'],
      ['„Der Risiko-Check hat mich vor einem Unfallbike bewahrt. Gold wert."', 'Marco F.', 'Bern · V-Strom 650'],
      ['„A2-Filter top — nur passende Modelle, kein Suchen mehr."', 'Sara H.', 'München · CB500X']
    ];
    return '<section class="wrap wrap-wide">' +
      '<div class="section-head"><div class="section-eye">Stimmen (Beispiel)</div>' +
      '<h2 class="section-title">Was Käufer:innen sagen könnten (Beispielzitate)</h2></div>' +
      '<div class="testi-grid">' + data.map(function (t) {
        return '<figure class="testi"><div class="testi-stars">★★★★★</div>' +
          '<blockquote>' + ui.esc(t[0]) + '</blockquote>' +
          '<figcaption><span class="testi-name">' + ui.esc(t[1]) + '</span>' +
          '<span class="testi-meta">' + ui.esc(t[2]) + '</span></figcaption></figure>';
      }).join('') + '</div></section>';
  }

  /* ---------- Pricing ---------- */
  function pricing() {
    var cards = cfg.PACKAGES.map(function (p) {
      var feats = p.feats.map(function (f) { return '<li>' + ui.esc(f) + '</li>'; }).join('');
      return '<div class="price-card' + (p.recommended ? ' price-card-rec' : '') + '">' +
        (p.badge ? '<div class="pkg-badge">' + ui.esc(p.badge) + '</div>' : '') +
        '<div class="price-name">' + ui.esc(p.name) + '</div>' +
        '<div class="price-amount">CHF ' + ui.esc(p.price.CHF) + '</div>' +
        '<div class="price-sub2">' + ui.esc(p.sub) + '</div>' +
        '<ul class="price-feats">' + feats + '</ul>' +
        '<a class="btn-' + (p.recommended ? 'primary' : 'secondary') + ' btn-block" href="#/form">' + ui.esc(p.name) + ' wählen</a>' +
        '</div>';
    }).join('');
    return '<section class="wrap wrap-wide">' +
      '<div class="section-head"><div class="section-eye">Pakete &amp; Preise</div>' +
      '<h2 class="section-title">Transparent. Du zahlst erst für den Report.</h2></div>' +
      '<div class="pricing-grid">' + cards + '</div>' +
      '<div class="pricing-note">Die Anfrage ist kostenlos. Kein Abo, keine versteckten Kosten.</div></section>';
  }

  /* ---------- FAQ ---------- */
  function faq() {
    var qa = [
      ['Was kostet der Service?', 'Die Anfrage ist kostenlos. Du zahlst erst für den gewählten Report (ab CHF 9.90). In dieser Demo wird nichts verrechnet — alles bleibt lokal im Browser.'],
      ['Woher kommen die Inserate?', 'In der Demo sind die Deals synthetisch (Beispieldaten). Produktiv durchsuchen wir Quellen wie anibis.ch, tutti.ch, mobile.de oder willhaben.at.'],
      ['Wie schnell bekomme ich den Report?', 'Im Normalbetrieb innerhalb von 24 Stunden. Quick-Check-Einschätzungen schneller.'],
      ['Berücksichtigt ihr meinen Führerausweis?', 'Ja. Bei A2/A1 filtern wir auf zulässige bzw. drosselbare Modelle.'],
      ['Was passiert mit meinen Daten?', 'In der Demo bleiben sie ausschliesslich in deinem Browser (LocalStorage). Kein Server, kein Konto, keine Weitergabe.']
    ];
    return '<section class="wrap wrap-wide">' +
      '<div class="section-head"><div class="section-eye">Häufige Fragen</div>' +
      '<h2 class="section-title">Alles Wichtige auf einen Blick</h2></div>' +
      '<div class="faq faq-2col">' + qa.map(function (x) {
        return '<details class="faq-item"><summary>' + ui.esc(x[0]) + '</summary>' +
          '<div class="faq-a">' + ui.esc(x[1]) + '</div></details>';
      }).join('') + '</div></section>';
  }

  /* ---------- Finale CTA ---------- */
  function finalCta() {
    return '<section class="wrap wrap-wide"><div class="cta-hero">' +
      '<div class="cta-hero-inner">' +
        '<h2>Bereit, den besten Deal zu finden?</h2>' +
        '<p>Starte kostenlos — in zwei Minuten zum persönlichen Deal-Report.</p>' +
        '<a class="btn-primary btn-lg" href="#/form">Jetzt Anfrage stellen →</a>' +
      '</div>' +
    '</div></section>';
  }

  /* ---------- Schnell-Score-Widget ---------- */
  function quickScore() {
    return '<section class="quick-score-section wrap wrap-narrow">' +
      '<div class="sec qs-card">' +
        '<div class="sec-head">Schnell-Check — passt der Preis?</div>' +
        '<div class="row2">' +
          '<div class="field"><label class="lbl" for="qs-model">Modell</label>' +
            '<input type="text" id="qs-model" placeholder="z.B. Yamaha MT-07"></div>' +
          '<div class="field"><label class="lbl" for="qs-price">Angebotspreis (CHF)</label>' +
            '<input type="text" id="qs-price" placeholder="z.B. 7200" inputmode="numeric"></div>' +
        '</div>' +
        '<button class="btn-primary" id="qs-btn" type="button">Score schätzen →</button>' +
        '<div id="qs-result" class="qs-result" role="status"></div>' +
      '</div>' +
    '</section>';
  }

  function wireQuickScore() {
    var btn = global.document.getElementById('qs-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var model = (global.document.getElementById('qs-model').value || '').trim();
      var price = parseInt((global.document.getElementById('qs-price').value || '').replace(/[^\d]/g, ''), 10);
      var res = global.document.getElementById('qs-result');
      if (!model || !price) {
        res.innerHTML = '<div class="qs-hint">Bitte Modell und Preis eingeben.</div>';
        return;
      }
      var match = global.TDS.data.market.search(model)[0];
      var values = { land: 'CH', region: 'Zürich', ausweis: 'A (unbeschränkt)', stil: [], modell: model,
        budget_von: price, budget_bis: price, waehrung: 'CHF', paket: 'Quick-Check' };
      var out = scout.generate({ id: 'qs-' + model + '-' + price, values: values });
      var best = out.deals && out.deals[0];
      if (!best) { res.innerHTML = '<div class="qs-hint">Keine Einschätzung möglich.</div>'; return; }
      var col = best.score >= 7.5 ? 'var(--ok)' : best.score >= 5.5 ? 'var(--warn)' : 'var(--err)';
      var gap = best.valueGapPct > 0 ? best.valueGapPct + '% unter Markt'
        : (best.valueGapPct < 0 ? Math.abs(best.valueGapPct) + '% über Markt' : 'am Marktwert');
      res.innerHTML = '<div class="qs-out">' +
        '<div class="qs-badge" style="background:' + col + '">' + best.score.toFixed(1) + '</div>' +
        '<div class="qs-info"><div class="qs-title">' + ui.esc(best.brand + ' ' + best.model) + '</div>' +
          '<div class="qs-sub">Angebot ' + ui.esc(fmt.money(price, 'CHF')) + ' · Marktwert Ø ' +
            ui.esc(fmt.money(best.marketValue, 'CHF')) + ' · ' + ui.esc(gap) + '</div>' +
          (match ? '' : '<div class="qs-hint">Modell nicht im Demo-Katalog — grobe Schätzung.</div>') +
        '</div>' +
        '<a class="btn-primary" href="#/form">Vollständige Analyse →</a>' +
      '</div>';
    });
  }

  function view() {
    var html =
      hero() +
      quickScore() +
      trust() +
      stats() +
      featureBlock('score', 'Deal-Score', 'Objektiv erkennen, ob der Preis stimmt',
        'Wir vergleichen jedes Inserat mit dem Marktwert und bewerten es auf einer Skala von 0–10 — inklusive Zustand, Laufleistung und Zuverlässigkeit.',
        ['Preis vs. realistischer Marktwert', 'Bewertung in 4+ Kriterien', 'Sofort sichtbar: Top oder Finger weg'], false) +
      featureBlock('risk', 'Risiko & A2-Filter', 'Böse Überraschungen vermeiden',
        'Alter, Kilometer, Service-Historie und modelltypische Schwächen ergeben eine klare Risiko-Einstufung. Mit A2/A1 zeigen wir nur passende Modelle.',
        ['Risiko: Niedrig / Mittel / Höher', 'A2-/A1-konforme Auswahl', 'Modelltypische Schwachstellen im Blick'], true) +
      featureBlock('deal', 'Verhandlung', 'Mit Argumenten zum besseren Preis',
        'Du bekommst konkrete Verhandlungsargumente, einen realistischen Zielpreis und eine Besichtigungs-Checkliste für genau dieses Modell.',
        ['Konkrete Hebel & Zielpreis', 'Besichtigungs-Checkliste', 'Fragen für den Verkäufer'], false) +
      steps() +
      testimonials() +
      pricing() +
      faq() +
      finalCta();

    ui.render(html);
    wireQuickScore();
  }

  global.TDS = global.TDS || {};
  global.TDS.views = global.TDS.views || {};
  global.TDS.views.landing = view;
})(window);
