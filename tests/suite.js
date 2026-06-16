/*
 * tests/suite.js — Testfälle für Format, Markt, Scout-Engine und Store.
 */
(function (global) {
  'use strict';

  var T = global.TDS.test;
  var describe = T.describe, it = T.it, expect = T.expect;
  var TDS = global.TDS;

  var baseValues = {
    vorname: 'Test', nachname: 'User', email: 't@e.ch', telefon: '',
    land: 'CH', landLabel: 'Schweiz', region: 'Zürich',
    ausweis: 'A2 (max. 35 kW)', erfahrung: 'Anfänger — erstes Motorrad',
    stil: ['Naked Bike'], modell: '', budget_von: '5000', budget_bis: '8000',
    waehrung: 'CHF', baujahr: '2019', km: "40'000 km", nutzung: 'Pendeln / Alltag',
    prioritaeten: '', paket: 'Scout'
  };
  function req(over) {
    return { id: (over && over.id) || 'TDS-TEST01', values: Object.assign({}, baseValues, over && over.values) };
  }

  /* ---------- Format ---------- */
  describe('format', function () {
    it('CHF mit Apostroph-Tausender', function () {
      expect(TDS.format.money(7250, 'CHF')).toBe("CHF 7'250");
    });
    it('EUR mit Punkt-Tausender', function () {
      expect(TDS.format.money(12000, 'EUR')).toBe('EUR 12.000');
    });
    it('km formatiert', function () {
      expect(TDS.format.km(31000)).toBe("31'000 km");
    });
    it('Datum tolerant gegen ungültige Werte', function () {
      expect(TDS.format.date('')).toBe('–');
    });
  });

  /* ---------- Markt ---------- */
  describe('market', function () {
    it('hat mindestens 25 Modelle', function () {
      expect(TDS.data.market.all().length).toBeGreaterThanOrEqual(25);
    });
    it('byStyle filtert korrekt', function () {
      var ok = TDS.data.market.byStyle('naked').every(function (m) { return m.style === 'naked'; });
      expect(ok).toBeTruthy();
    });
    it('Suche findet Modell', function () {
      expect(TDS.data.market.search('V-Strom').length).toBeGreaterThanOrEqual(1);
    });
  });

  /* ---------- Scout-Engine ---------- */
  describe('scout', function () {
    it('ist deterministisch pro ID', function () {
      var a = JSON.stringify(TDS.scout.generate(req()));
      var b = JSON.stringify(TDS.scout.generate(req()));
      expect(a).toBe(b);
    });
    it('Paket steuert Anzahl Deals (Scout=3)', function () {
      expect(TDS.scout.generate(req()).deals.length).toBe(3);
    });
    it('Premium=5, Quick-Check=1', function () {
      expect(TDS.scout.generate(req({ id: 'P', values: { paket: 'Premium' } })).deals.length).toBe(5);
      expect(TDS.scout.generate(req({ id: 'Q', values: { paket: 'Quick-Check' } })).deals.length).toBe(1);
    });
    it('Scores im gültigen Bereich und absteigend sortiert', function () {
      var deals = TDS.scout.generate(req()).deals;
      deals.forEach(function (d) {
        expect(d.score).toBeGreaterThanOrEqual(1.5);
        expect(d.score).toBeLessThanOrEqual(9.8);
      });
      expect(deals[0].score).toBeGreaterThanOrEqual(deals[deals.length - 1].score);
    });
    it('Angebotspreise liegen im Budget', function () {
      TDS.scout.generate(req()).deals.forEach(function (d) {
        expect(d.asking).toBeGreaterThanOrEqual(5000);
        expect(d.asking).toBeLessThanOrEqual(8000);
      });
    });
    it('A2-Filter: nur A2-taugliche Modelle', function () {
      var deals = TDS.scout.generate(req()).deals;
      var ok = deals.every(function (d) {
        var m = TDS.data.market.all().filter(function (x) { return x.model === d.model; })[0];
        return m && m.a2;
      });
      expect(ok).toBeTruthy();
    });
    it('Wunschmodell wird berücksichtigt', function () {
      var deals = TDS.scout.generate(req({ id: 'M', values: { modell: 'V-Strom', stil: [] } })).deals;
      var hit = deals.some(function (d) { return d.title.indexOf('V-Strom') >= 0; });
      expect(hit).toBeTruthy();
    });
    it('liefert qualitative Inhalte je Deal', function () {
      TDS.scout.generate(req()).deals.forEach(function (d) {
        expect(d.negotiationArgs.length).toBeGreaterThanOrEqual(1);
        expect(d.inspectionPoints.length).toBeGreaterThanOrEqual(1);
        expect(d.sellerQuestions.length).toBeGreaterThanOrEqual(1);
        expect(['low', 'mid', 'high']).toContain(d.risk.level);
      });
    });
    it('respektiert maximale Kilometer', function () {
      var deals = TDS.scout.generate(req({ id: 'K', values: { km: "20'000 km" } })).deals;
      expect(deals.every(function (d) { return d.km <= 20000; })).toBeTruthy();
    });
  });

  /* ---------- Demo-Daten ---------- */
  describe('demo', function () {
    it('liefert mehrere Beispieldatensätze', function () {
      expect(TDS.data.demo.samples().length).toBeGreaterThanOrEqual(4);
    });
    it('jeder Datensatz hat ein Paket', function () {
      var ok = TDS.data.demo.samples().every(function (s) { return !!s.paket; });
      expect(ok).toBeTruthy();
    });
    it('liefert frische Kopien (keine geteilte Referenz)', function () {
      var a = TDS.data.demo.samples(); a[0].vorname = 'XXX';
      expect(TDS.data.demo.samples()[0].vorname).toBe('Lena');
    });
  });

  /* ---------- Store ---------- */
  describe('store', function () {
    function fresh() { TDS.store._useAdapter(TDS.store._memoryAdapter()); }

    it('create setzt Status "Neu" und Historie', function () {
      fresh();
      return TDS.store.create(baseValues).then(function (rec) {
        expect(rec.status).toBe('Neu');
        expect(rec.history.length).toBe(1);
        expect(rec.id).toContain('TDS-');
      });
    });
    it('updateStatus schreibt Historie', function () {
      fresh();
      return TDS.store.create(baseValues).then(function (rec) {
        return TDS.store.updateStatus(rec.id, 'In Prüfung').then(function () {
          return TDS.store.get(rec.id);
        });
      }).then(function (r) {
        expect(r.status).toBe('In Prüfung');
        expect(r.history.length).toBe(2);
      });
    });
    it('addNote fügt Notiz hinzu', function () {
      fresh();
      return TDS.store.create(baseValues).then(function (rec) {
        return TDS.store.addNote(rec.id, 'Hallo');
      }).then(function (r) {
        expect(r.notes.length).toBe(1);
        expect(r.notes[0].text).toBe('Hallo');
      });
    });
    it('stats aggregiert korrekt', function () {
      fresh();
      return TDS.store.create(baseValues)
        .then(function () { return TDS.store.create(baseValues); })
        .then(function () { return TDS.store.stats(); })
        .then(function (s) {
          expect(s.total).toBe(2);
          expect(s.byStatus['Neu']).toBe(2);
        });
    });
    it('export/import round-trip', function () {
      fresh();
      return TDS.store.create(baseValues)
        .then(function () { return TDS.store.exportJSON(); })
        .then(function (json) {
          fresh();
          return TDS.store.importJSON(json, 'replace');
        })
        .then(function (r) { expect(r.imported).toBe(1); return TDS.store.list(); })
        .then(function (list) { expect(list.length).toBe(1); });
    });
    it('remove löscht Eintrag', function () {
      fresh();
      return TDS.store.create(baseValues).then(function (rec) {
        return TDS.store.remove(rec.id).then(function () { return TDS.store.list(); });
      }).then(function (list) { expect(list.length).toBe(0); });
    });
  });
})(typeof window !== 'undefined' ? window : globalThis);
