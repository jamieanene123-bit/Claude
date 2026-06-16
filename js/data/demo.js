/*
 * data/demo.js — kanonischer Beispieldatensatz (Demo/Seed).
 * Eine Quelle der Wahrheit für Admin & Einstellungen.
 */
(function (global) {
  'use strict';

  var SAMPLES = [
    { vorname: 'Lena', nachname: 'Berger', email: 'lena.berger@example.ch', telefon: '+41 79 222 11 33', land: 'CH', landLabel: 'Schweiz', region: 'Zürich', ausweis: 'A2 (max. 35 kW)', erfahrung: 'Anfänger — erstes Motorrad', stil: ['Naked Bike'], modell: 'Yamaha MT-07', budget_von: '5000', budget_bis: '8000', waehrung: 'CHF', baujahr: '2019', km: "30'000 km", nutzung: 'Pendeln / Alltag', prioritaeten: 'MFK frisch, Serviceheft, privater Verkäufer', paket: 'Scout' },
    { vorname: 'Marco', nachname: 'Frei', email: 'marco.frei@example.ch', telefon: '', land: 'CH', landLabel: 'Schweiz', region: 'Bern', ausweis: 'A (unbeschränkt)', erfahrung: 'Erfahren', stil: ['Enduro / Adventure', 'Touring'], modell: '', budget_von: '8000', budget_bis: '12000', waehrung: 'CHF', baujahr: '2017', km: "50'000 km", nutzung: 'Längere Touren', prioritaeten: 'Koffersystem, Kettenkit neu', paket: 'Premium' },
    { vorname: 'Sara', nachname: 'Hofer', email: 'sara.hofer@example.de', telefon: '+49 151 99887766', land: 'DE', landLabel: 'Deutschland', region: 'Bayern', ausweis: 'A1 (max. 11 kW)', erfahrung: 'Einige Jahre', stil: ['Scrambler / Retro'], modell: 'Honda CB125R', budget_von: '2000', budget_bis: '4000', waehrung: 'EUR', baujahr: '2021', km: "10'000 km", nutzung: 'Wochenende / Spass', prioritaeten: 'Optik wichtig, keine Stürze', paket: 'Quick-Check' },
    { vorname: 'Tobias', nachname: 'Meier', email: 'tobias.meier@example.ch', telefon: '+41 78 555 12 12', land: 'CH', landLabel: 'Schweiz', region: 'Aargau', ausweis: 'A (unbeschränkt)', erfahrung: 'Einige Jahre', stil: ['Sportmotorrad'], modell: '', budget_von: '7000', budget_bis: '10000', waehrung: 'CHF', baujahr: '2019', km: "20'000 km", nutzung: 'Wochenende / Spass', prioritaeten: 'Keine Trackday-Maschine', paket: 'Scout' }
  ];

  function samples() { return SAMPLES.map(function (s) { return JSON.parse(JSON.stringify(s)); }); }

  global.TDS = global.TDS || {};
  global.TDS.data = global.TDS.data || {};
  global.TDS.data.demo = { samples: samples };
})(window);
