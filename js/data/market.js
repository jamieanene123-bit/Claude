/*
 * data/market.js — synthetischer Markt-Datensatz für die Scout-Engine.
 *
 * KEINE echten Inserate. Die Werte sind realistische Referenzgrössen,
 * mit denen die Scout-Engine (services/scout.js) plausible Beispiel-Deals
 * berechnet: refPrice = typischer Marktpreis (CHF) für ein sauberes
 * Exemplar mit refYear / refKm. Bei echtem Backend würde dieser Katalog
 * durch reale Inserate/Preisindizes ersetzt.
 *
 * Felder: brand, model, style, kw (Leistung), a2 (A2-tauglich/-drosselbar),
 *   refYear, refKm, refPrice, depr (jährliche Wertminderung),
 *   reliability (1–5), parts (Ersatzteilkosten), issues (typische Mängel).
 */
(function (global) {
  'use strict';

  var REF_KM = 20000;

  var MODELS = [
    // ---- Naked ----
    { brand: 'Yamaha', model: 'MT-07', style: 'naked', kw: 54, a2: true, refYear: 2021, refPrice: 7200, depr: 0.08, reliability: 5, parts: 'tief', issues: ['Kettensatz auf Verschleiss prüfen', 'Bremsscheiben vorne (Riefen)'] },
    { brand: 'Yamaha', model: 'MT-09', style: 'naked', kw: 87, a2: false, refYear: 2021, refPrice: 9800, depr: 0.09, reliability: 4, parts: 'mittel', issues: ['Ruckeln im Teillastbereich (Mapping)', 'Kettensatz'] },
    { brand: 'Kawasaki', model: 'Z650', style: 'naked', kw: 50, a2: true, refYear: 2021, refPrice: 6600, depr: 0.08, reliability: 5, parts: 'tief', issues: ['Bremsbeläge', 'Kettenspannung'] },
    { brand: 'Kawasaki', model: 'Z900', style: 'naked', kw: 92, a2: false, refYear: 2020, refPrice: 9200, depr: 0.09, reliability: 4, parts: 'mittel', issues: ['Gabeldichtungen', 'Kettensatz'] },
    { brand: 'KTM', model: '390 Duke', style: 'naked', kw: 32, a2: true, refYear: 2021, refPrice: 5100, depr: 0.10, reliability: 3, parts: 'mittel', issues: ['Wasserpumpen-Wellendichtring', 'Schaltbarkeit/Getriebe'] },
    { brand: 'KTM', model: '790 Duke', style: 'naked', kw: 77, a2: false, refYear: 2020, refPrice: 8900, depr: 0.10, reliability: 3, parts: 'hoch', issues: ['Nockenwellen (frühe Serie)', 'Software-Updates'] },
    { brand: 'Honda', model: 'CB500F', style: 'naked', kw: 35, a2: true, refYear: 2021, refPrice: 5600, depr: 0.07, reliability: 5, parts: 'tief', issues: ['Kettensatz', 'Bremsflüssigkeit alt'] },
    { brand: 'Honda', model: 'CB650R', style: 'naked', kw: 70, a2: true, refYear: 2021, refPrice: 8200, depr: 0.08, reliability: 5, parts: 'mittel', issues: ['Bremsscheiben', 'Kettensatz'] },
    { brand: 'Suzuki', model: 'SV650', style: 'naked', kw: 56, a2: true, refYear: 2020, refPrice: 6400, depr: 0.07, reliability: 5, parts: 'tief', issues: ['Spannungsregler (ältere Serien)', 'Kettensatz'] },

    // ---- Sport ----
    { brand: 'Yamaha', model: 'YZF-R3', style: 'sport', kw: 31, a2: true, refYear: 2021, refPrice: 5600, depr: 0.08, reliability: 5, parts: 'tief', issues: ['Sturzschäden (Verkleidung) prüfen', 'Kettensatz'] },
    { brand: 'Yamaha', model: 'YZF-R6', style: 'sport', kw: 87, a2: false, refYear: 2019, refPrice: 9800, depr: 0.07, reliability: 4, parts: 'mittel', issues: ['Trackday-Historie?', 'Ventilspiel-Service teuer'] },
    { brand: 'Kawasaki', model: 'Ninja 650', style: 'sport', kw: 50, a2: true, refYear: 2021, refPrice: 6900, depr: 0.08, reliability: 5, parts: 'tief', issues: ['Kettensatz', 'Bremsbeläge'] },
    { brand: 'Kawasaki', model: 'Ninja 400', style: 'sport', kw: 33, a2: true, refYear: 2021, refPrice: 5500, depr: 0.08, reliability: 5, parts: 'tief', issues: ['Sturzschäden prüfen', 'Kettenspannung'] },
    { brand: 'Honda', model: 'CBR500R', style: 'sport', kw: 35, a2: true, refYear: 2021, refPrice: 6100, depr: 0.07, reliability: 5, parts: 'tief', issues: ['Kettensatz', 'Bremsscheiben'] },
    { brand: 'Aprilia', model: 'RS 660', style: 'sport', kw: 73, a2: true, refYear: 2021, refPrice: 9900, depr: 0.10, reliability: 3, parts: 'hoch', issues: ['Elektronik/Sensorik', 'Service-Historie wichtig'] },

    // ---- Retro / Scrambler ----
    { brand: 'Triumph', model: 'Street Twin 900', style: 'retro', kw: 48, a2: true, refYear: 2020, refPrice: 8400, depr: 0.08, reliability: 4, parts: 'mittel', issues: ['Kupplung (Greifpunkt)', 'Steuerkette'] },
    { brand: 'Ducati', model: 'Scrambler Icon 800', style: 'retro', kw: 54, a2: true, refYear: 2020, refPrice: 8200, depr: 0.09, reliability: 3, parts: 'hoch', issues: ['Zahnriemen-Service fällig?', 'Kupplung'] },
    { brand: 'Yamaha', model: 'XSR700', style: 'retro', kw: 54, a2: true, refYear: 2021, refPrice: 7600, depr: 0.07, reliability: 5, parts: 'tief', issues: ['Kettensatz', 'Tank/Lack (Roststellen)'] },
    { brand: 'Royal Enfield', model: 'Interceptor 650', style: 'retro', kw: 35, a2: true, refYear: 2021, refPrice: 5500, depr: 0.09, reliability: 3, parts: 'mittel', issues: ['Massepunkte/Elektrik', 'Ölnebel/Undichtigkeiten'] },
    { brand: 'BMW', model: 'R nineT', style: 'retro', kw: 80, a2: false, refYear: 2019, refPrice: 11200, depr: 0.07, reliability: 4, parts: 'hoch', issues: ['Endantrieb prüfen', 'Federbein-Verschleiss'] },

    // ---- Adventure / Enduro ----
    { brand: 'Suzuki', model: 'V-Strom 650', style: 'adventure', kw: 51, a2: true, refYear: 2020, refPrice: 7600, depr: 0.07, reliability: 5, parts: 'tief', issues: ['Kettensatz', 'Lenkkopflager'] },
    { brand: 'Honda', model: 'CB500X', style: 'adventure', kw: 35, a2: true, refYear: 2021, refPrice: 6600, depr: 0.07, reliability: 5, parts: 'tief', issues: ['Kettensatz', 'Bremsen vorne'] },
    { brand: 'KTM', model: '390 Adventure', style: 'adventure', kw: 32, a2: true, refYear: 2021, refPrice: 6200, depr: 0.10, reliability: 3, parts: 'mittel', issues: ['Wasserpumpe', 'Software-Updates'] },
    { brand: 'Yamaha', model: 'Ténéré 700', style: 'adventure', kw: 54, a2: true, refYear: 2021, refPrice: 11200, depr: 0.06, reliability: 5, parts: 'mittel', issues: ['Sturz-/Geländespuren prüfen', 'Kettensatz'] },
    { brand: 'BMW', model: 'F750GS', style: 'adventure', kw: 57, a2: true, refYear: 2020, refPrice: 9600, depr: 0.08, reliability: 4, parts: 'hoch', issues: ['Service nur Vertragspartner?', 'Endantrieb'] },
    { brand: 'BMW', model: 'R1250GS', style: 'adventure', kw: 100, a2: false, refYear: 2020, refPrice: 16500, depr: 0.07, reliability: 4, parts: 'hoch', issues: ['Endantrieb/Kardan', 'Telelever-Lager'] },
    { brand: 'Kawasaki', model: 'Versys 650', style: 'adventure', kw: 50, a2: true, refYear: 2020, refPrice: 7000, depr: 0.07, reliability: 5, parts: 'tief', issues: ['Kettensatz', 'Windschild-Klappern'] },

    // ---- Touring ----
    { brand: 'Yamaha', model: 'Tracer 7', style: 'touring', kw: 54, a2: true, refYear: 2021, refPrice: 8200, depr: 0.07, reliability: 5, parts: 'tief', issues: ['Kettensatz', 'Koffer-Halterungen'] },
    { brand: 'Honda', model: 'NC750X', style: 'touring', kw: 43, a2: true, refYear: 2021, refPrice: 6800, depr: 0.07, reliability: 5, parts: 'tief', issues: ['DCT-Service (falls Automat)', 'Kettensatz'] },
    { brand: 'Kawasaki', model: 'Versys 1000', style: 'touring', kw: 88, a2: false, refYear: 2020, refPrice: 11500, depr: 0.08, reliability: 4, parts: 'mittel', issues: ['Kettensatz', 'Federbein'] },
    { brand: 'BMW', model: 'R1250RT', style: 'touring', kw: 100, a2: false, refYear: 2020, refPrice: 18500, depr: 0.08, reliability: 4, parts: 'hoch', issues: ['Endantrieb', 'ESA-Fahrwerk-Elektronik'] }
  ];

  function all() { return MODELS.slice(); }

  function byStyle(styleKey) {
    if (!styleKey || styleKey === 'any') return all();
    return MODELS.filter(function (m) { return m.style === styleKey; });
  }

  /** Modelle, die zu einem freien Text (Marke/Modell) passen. */
  function search(text) {
    if (!text) return [];
    var q = text.toLowerCase();
    return MODELS.filter(function (m) {
      return (m.brand + ' ' + m.model).toLowerCase().indexOf(q) !== -1 ||
        q.indexOf(m.model.toLowerCase()) !== -1;
    });
  }

  global.TDS = global.TDS || {};
  global.TDS.data = global.TDS.data || {};
  global.TDS.data.market = { REF_KM: REF_KM, all: all, byStyle: byStyle, search: search };
})(window);
