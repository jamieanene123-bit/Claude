/*
 * data/config.js — zentrale Konfiguration & statische Stammdaten.
 * Alles, was sich fachlich ändern könnte (Regionen, Budgets, Pakete,
 * Status, Stil-Mapping), liegt hier an einem Ort.
 */
(function (global) {
  'use strict';

  var REGIONS = {
    CH: {
      label: 'Kanton / Region',
      hint: 'Wir suchen auf anibis.ch und tutti.ch',
      sources: ['anibis.ch', 'tutti.ch', 'ricardo.ch'],
      opts: ['Zürich', 'Bern', 'Basel', 'Luzern', 'St. Gallen', 'Aargau', 'Thurgau', 'Zentralschweiz', 'Ostschweiz', 'Westschweiz (FR/VD/GE)', 'Tessin', 'Ganze Schweiz'],
      cur: 'CHF',
      payment: 'TWINT- oder Stripe-Zahlungslink per E-Mail'
    },
    DE: {
      label: 'Bundesland',
      hint: 'Wir suchen auf mobile.de und ebay-kleinanzeigen.de',
      sources: ['mobile.de', 'kleinanzeigen.de', 'autoscout24.de'],
      opts: ['Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen', 'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen', 'Ganz Deutschland'],
      cur: 'EUR',
      payment: 'Stripe-Zahlungslink per E-Mail (EUR)'
    },
    AT: {
      label: 'Bundesland',
      hint: 'Wir suchen auf willhaben.at und autoscout24.at',
      sources: ['willhaben.at', 'autoscout24.at', 'bazar.at'],
      opts: ['Wien', 'Niederösterreich', 'Oberösterreich', 'Steiermark', 'Tirol', 'Kärnten', 'Salzburg', 'Vorarlberg', 'Burgenland', 'Ganz Österreich'],
      cur: 'EUR',
      payment: 'Stripe-Zahlungslink per E-Mail (EUR)'
    },
    LI: {
      label: 'Region',
      hint: 'Wir suchen auf anibis.ch und lokalen Quellen',
      sources: ['anibis.ch', 'tutti.ch'],
      opts: ['Vaduz', 'Schaan', 'Balzers', 'Triesen', 'Eschen', 'Mauren', 'Ruggell', 'Ganz Liechtenstein'],
      cur: 'CHF',
      payment: 'TWINT- oder Stripe-Zahlungslink per E-Mail'
    }
  };

  var LAND_LABELS = { CH: 'Schweiz', DE: 'Deutschland', AT: 'Österreich', LI: 'Liechtenstein' };

  var BUDGETS = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000, 6000, 7000, 8000, 10000, 12000, 15000, 20000];

  var PACKAGES = [
    {
      id: 'Quick-Check', name: 'Quick-Check', badge: '',
      price: { CHF: '9.90', EUR: '9.90' },
      sub: 'Schnelle Einschätzung eines Inserats',
      feats: ['Deal-Score (4 Kriterien)', 'Preisvergleich Markt', 'Lieferung in 12h'],
      dealCount: 1
    },
    {
      id: 'Scout', name: 'Scout', badge: 'Empfohlen', recommended: true,
      price: { CHF: '30', EUR: '30' },
      sub: 'Top-3-Deals mit vollständigem Report',
      feats: ['Alles aus Quick-Check', 'Top-3-Inserate bewertet', 'Verhandlungsargumente', 'Fragen für Verkäufer'],
      dealCount: 3
    },
    {
      id: 'Premium', name: 'Premium', badge: '',
      price: { CHF: '50', EUR: '50' },
      sub: 'Persönliche Beratung inkl. Call',
      feats: ['Alles aus Scout', 'Besichtigungs-Checkliste', '30-Min Beratungscall', 'Nachfragen bis zum Kauf'],
      dealCount: 5
    }
  ];

  // Workflow-Reihenfolge & Farbschlüssel (für Badges/Charts).
  var STATUSES = ['Neu', 'In Prüfung', 'Report erstellt', 'Abgeschlossen'];
  var STATUS_COLORS = {
    'Neu': '#E85D1A',
    'In Prüfung': '#2B4FB7',
    'Report erstellt': '#1A7A3F',
    'Abgeschlossen': '#8A8780'
  };
  var DEFAULT_STATUS = 'Neu';

  // Mapping Formular-Stil -> interner Stil-Schlüssel (Markt-Datensatz).
  var STYLE_KEYS = {
    'Naked Bike': 'naked',
    'Sportmotorrad': 'sport',
    'Scrambler / Retro': 'retro',
    'Enduro / Adventure': 'adventure',
    'Touring': 'touring',
    'Egal — bestes P/L': 'any'
  };

  // Maximale Leistung je Führerausweis (kW) — für A2/A1-Filter.
  var LICENSE_KW = {
    'A (unbeschränkt)': Infinity,
    'A2 (max. 35 kW)': 35,
    'A1 (max. 11 kW)': 11,
    'Nur B': 11,
    'Noch keinen': 35
  };

  function currencyFor(land) {
    return (land && REGIONS[land]) ? REGIONS[land].cur : 'CHF';
  }

  function packageById(id) {
    return PACKAGES.filter(function (p) { return p.id === id; })[0] || null;
  }

  global.TDS = global.TDS || {};
  global.TDS.config = {
    REGIONS: REGIONS, LAND_LABELS: LAND_LABELS, BUDGETS: BUDGETS,
    PACKAGES: PACKAGES, STATUSES: STATUSES, STATUS_COLORS: STATUS_COLORS,
    DEFAULT_STATUS: DEFAULT_STATUS, STYLE_KEYS: STYLE_KEYS, LICENSE_KW: LICENSE_KW,
    currencyFor: currencyFor, packageById: packageById
  };
})(window);
