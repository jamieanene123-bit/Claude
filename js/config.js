/*
 * config.js — Zentrale Konfiguration & statische Daten.
 * Alles, was sich später ändern könnte (Regionen, Pakete, Status),
 * liegt hier an einem Ort.
 */
(function (global) {
  'use strict';

  var REGIONS = {
    CH: {
      label: 'Kanton / Region',
      hint: 'Wir suchen auf anibis.ch und tutti.ch',
      opts: ['Zürich', 'Bern', 'Basel', 'Luzern', 'St. Gallen', 'Aargau', 'Thurgau', 'Zentralschweiz', 'Ostschweiz', 'Westschweiz (FR/VD/GE)', 'Tessin', 'Ganze Schweiz'],
      cur: 'CHF',
      payment: 'TWINT- oder Stripe-Zahlungslink per E-Mail'
    },
    DE: {
      label: 'Bundesland',
      hint: 'Wir suchen auf mobile.de und ebay-kleinanzeigen.de',
      opts: ['Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen', 'Sachsen-Anhalt', 'Schleswig-Holstein', 'Thüringen', 'Ganz Deutschland'],
      cur: 'EUR',
      payment: 'Stripe-Zahlungslink per E-Mail (EUR)'
    },
    AT: {
      label: 'Bundesland',
      hint: 'Wir suchen auf willhaben.at und autoscout24.at',
      opts: ['Wien', 'Niederösterreich', 'Oberösterreich', 'Steiermark', 'Tirol', 'Kärnten', 'Salzburg', 'Vorarlberg', 'Burgenland', 'Ganz Österreich'],
      cur: 'EUR',
      payment: 'Stripe-Zahlungslink per E-Mail (EUR)'
    },
    LI: {
      label: 'Region',
      hint: 'Wir suchen auf anibis.ch und lokalen Quellen',
      opts: ['Vaduz', 'Schaan', 'Balzers', 'Triesen', 'Eschen', 'Mauren', 'Ruggell', 'Ganz Liechtenstein'],
      cur: 'CHF',
      payment: 'TWINT- oder Stripe-Zahlungslink per E-Mail'
    }
  };

  var BUDGETS = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000, 6000, 7000, 8000, 10000, 12000, 15000, 20000];

  var PACKAGES = [
    {
      id: 'Quick-Check',
      name: 'Quick-Check',
      badge: '',
      price: { CHF: '9.90', EUR: '9.90' },
      sub: 'Schnelle Einschätzung eines Inserats',
      feats: ['Deal-Score (4 Kriterien)', 'Preisvergleich Markt', 'Lieferung in 12h']
    },
    {
      id: 'Scout',
      name: 'Scout',
      badge: 'Empfohlen',
      price: { CHF: '30', EUR: '30' },
      sub: 'Top-3-Deals mit vollständigem Report',
      feats: ['Alles aus Quick-Check', 'Top-3-Inserate bewertet', 'Verhandlungsargumente', 'Fragen für Verkäufer'],
      recommended: true
    },
    {
      id: 'Premium',
      name: 'Premium',
      badge: '',
      price: { CHF: '50', EUR: '50' },
      sub: 'Persönliche Beratung inkl. Call',
      feats: ['Alles aus Scout', 'Besichtigungs-Checkliste', '30-Min Beratungscall', 'Nachfragen bis zum Kauf']
    }
  ];

  // Reihenfolge = Workflow-Reihenfolge im Admin.
  var STATUSES = ['Neu', 'In Prüfung', 'Report erstellt', 'Abgeschlossen'];

  var DEFAULT_STATUS = 'Neu';

  function currencyFor(land) {
    return (land && REGIONS[land]) ? REGIONS[land].cur : 'CHF';
  }

  global.TDS = global.TDS || {};
  global.TDS.config = {
    REGIONS: REGIONS,
    BUDGETS: BUDGETS,
    PACKAGES: PACKAGES,
    STATUSES: STATUSES,
    DEFAULT_STATUS: DEFAULT_STATUS,
    currencyFor: currencyFor
  };
})(window);
