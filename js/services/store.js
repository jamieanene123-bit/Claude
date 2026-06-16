/*
 * services/store.js — Datenzugriffsschicht (Repository-Pattern).
 *
 * Kapselt die gesamte Persistenz hinter einer Promise-basierten API.
 * Heute: LocalStorage über einen austauschbaren Adapter. Für ein echtes
 * Backend genügt es, einen anderen Adapter zu setzen (z.B. RestAdapter
 * mit fetch) — die Views bleiben unverändert.
 *
 * Zusatzfeatures gegenüber MVP:
 *  - versioniertes Schema inkl. Migration von v1
 *  - Status-Historie (Audit-Trail) je Anfrage
 *  - interne Notizen
 *  - Events bei Änderungen (data:change) für reaktive Views
 *  - Export/Import (JSON) und Statistik-Aggregation
 */
(function (global) {
  'use strict';

  var cfg = global.TDS.config;
  var events = global.TDS.events;

  var KEY = 'tds_db_v2';
  var LEGACY_KEY = 'tds_requests_v1';
  var SCHEMA = 2;

  /* ---------------- Adapter ---------------- */
  function LocalStorageAdapter(key) {
    return {
      read: function () {
        try {
          var raw = global.localStorage.getItem(key);
          return raw ? JSON.parse(raw) : null;
        } catch (e) { console.warn('Store read error', e); return null; }
      },
      write: function (db) {
        global.localStorage.setItem(key, JSON.stringify(db));
      }
    };
  }

  // In-Memory-Adapter (v.a. für Tests).
  function MemoryAdapter() {
    var data = null;
    return {
      read: function () { return data; },
      write: function (db) { data = JSON.parse(JSON.stringify(db)); }
    };
  }

  var adapter = LocalStorageAdapter(KEY);

  /* ---------------- intern ---------------- */
  function emptyDb() { return { v: SCHEMA, requests: [] }; }

  function migrateLegacy() {
    try {
      var raw = global.localStorage.getItem(LEGACY_KEY);
      if (!raw) return null;
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return null;
      var db = emptyDb();
      db.requests = arr.map(function (r) {
        return normalize({
          id: r.id, createdAt: r.createdAt, updatedAt: r.updatedAt || r.createdAt,
          status: r.status || cfg.DEFAULT_STATUS, values: r.values || {},
          history: [{ status: r.status || cfg.DEFAULT_STATUS, at: r.createdAt }],
          notes: []
        });
      });
      return db;
    } catch (e) { return null; }
  }

  function normalize(r) {
    r.history = r.history || [{ status: r.status, at: r.createdAt }];
    r.notes = r.notes || [];
    return r;
  }

  function load() {
    var db = adapter.read();
    if (!db) {
      db = migrateLegacy() || emptyDb();
      adapter.write(db);
    }
    if (db.v !== SCHEMA) { db.v = SCHEMA; } // Platz für künftige Migrationen
    db.requests = db.requests.map(normalize);
    return db;
  }

  function save(db) {
    adapter.write(db);
    if (events) events.emit('data:change', { count: db.requests.length });
  }

  function genId() {
    var rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
    return 'TDS-' + rnd;
  }

  function sortByDate(list) {
    return list.slice().sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
  }

  /* ---------------- öffentliche API ---------------- */
  var Store = {
    /** Adapter wechseln (z.B. Tests oder späteres Backend). */
    _useAdapter: function (a) { adapter = a; },
    _memoryAdapter: MemoryAdapter,

    list: function (filter) {
      var rows = sortByDate(load().requests);
      if (filter && filter.status && filter.status !== 'Alle') {
        rows = rows.filter(function (r) { return r.status === filter.status; });
      }
      if (filter && filter.q) {
        var q = filter.q.toLowerCase();
        rows = rows.filter(function (r) { return matchQuery(r, q); });
      }
      return Promise.resolve(rows);
    },

    get: function (id) {
      var found = load().requests.filter(function (r) { return r.id === id; })[0] || null;
      return Promise.resolve(found);
    },

    create: function (values) {
      var db = load();
      var now = new Date().toISOString();
      var record = normalize({
        id: genId(), createdAt: now, updatedAt: now,
        status: cfg.DEFAULT_STATUS, values: values,
        history: [{ status: cfg.DEFAULT_STATUS, at: now }], notes: []
      });
      db.requests.push(record);
      save(db);
      return Promise.resolve(record);
    },

    updateStatus: function (id, status) {
      var db = load(); var updated = null; var now = new Date().toISOString();
      db.requests.forEach(function (r) {
        if (r.id === id && r.status !== status) {
          r.status = status; r.updatedAt = now;
          r.history.push({ status: status, at: now });
          updated = r;
        }
      });
      if (updated) save(db);
      return Promise.resolve(updated);
    },

    addNote: function (id, text) {
      var db = load(); var updated = null; var now = new Date().toISOString();
      db.requests.forEach(function (r) {
        if (r.id === id) {
          r.notes.push({ text: text, at: now });
          r.updatedAt = now; updated = r;
        }
      });
      if (updated) save(db);
      return Promise.resolve(updated);
    },

    /** Löscht eine Anfrage und liefert den gelöschten Datensatz (für Undo) zurück. */
    remove: function (id) {
      var db = load();
      var removed = db.requests.filter(function (r) { return r.id === id; })[0] || null;
      db.requests = db.requests.filter(function (r) { return r.id !== id; });
      save(db);
      return Promise.resolve(removed);
    },

    /** Stellt einen zuvor gelöschten Datensatz unverändert wieder her (Undo). */
    restore: function (record) {
      if (!record || !record.id) return Promise.resolve(null);
      var db = load();
      if (!db.requests.some(function (r) { return r.id === record.id; })) {
        db.requests.push(normalize(record));
        save(db);
      }
      return Promise.resolve(record);
    },

    /** Leert alle Anfragen und liefert die vorherige Liste (für Undo) zurück. */
    clear: function () {
      var prev = load().requests;
      save(emptyDb());
      return Promise.resolve(prev);
    },

    /** Mehrere Datensätze wiederherstellen (Undo von "Alle löschen"). */
    restoreMany: function (records) {
      var db = emptyDb();
      db.requests = (records || []).map(normalize);
      save(db);
      return Promise.resolve(db.requests.length);
    },

    /** Statistik-Aggregation für das Dashboard. */
    stats: function () {
      var rows = load().requests;
      var byStatus = {}; cfg.STATUSES.forEach(function (s) { byStatus[s] = 0; });
      var byCountry = {}, byPackage = {};
      var weekAgo = Date.now() - 7 * 864e5;
      var last7 = 0, budgetSum = 0, budgetN = 0;

      rows.forEach(function (r) {
        byStatus[r.status] = (byStatus[r.status] || 0) + 1;
        var land = (r.values.landLabel || r.values.land || '–');
        byCountry[land] = (byCountry[land] || 0) + 1;
        var pkg = r.values.paket || '–';
        byPackage[pkg] = (byPackage[pkg] || 0) + 1;
        if (new Date(r.createdAt).getTime() >= weekAgo) last7++;
        var von = parseInt(r.values.budget_von), bis = parseInt(r.values.budget_bis);
        if (von && bis) { budgetSum += (von + bis) / 2; budgetN++; }
      });

      var done = (byStatus['Report erstellt'] || 0) + (byStatus['Abgeschlossen'] || 0);
      return Promise.resolve({
        total: rows.length,
        last7: last7,
        open: (byStatus['Neu'] || 0) + (byStatus['In Prüfung'] || 0),
        done: done,
        conversion: rows.length ? Math.round((done / rows.length) * 100) : 0,
        avgBudget: budgetN ? Math.round(budgetSum / budgetN) : 0,
        byStatus: byStatus, byCountry: byCountry, byPackage: byPackage
      });
    },

    /** Vollständiger Export als JSON-String. */
    exportJSON: function () {
      return Promise.resolve(JSON.stringify(load(), null, 2));
    },

    /**
     * Import. mode 'replace' ersetzt, 'merge' fügt neue IDs hinzu.
     * @returns {Promise<{imported:number, skipped:number}>}
     */
    importJSON: function (jsonStr, mode) {
      return new Promise(function (resolve, reject) {
        try {
          var incoming = JSON.parse(jsonStr);
          var list = Array.isArray(incoming) ? incoming : (incoming.requests || []);
          if (!Array.isArray(list)) throw new Error('Kein gültiges Datenformat.');
          var db = mode === 'merge' ? load() : emptyDb();
          var existing = {}; db.requests.forEach(function (r) { existing[r.id] = true; });
          var imported = 0, skipped = 0;
          list.forEach(function (r) {
            if (!r || !r.id) { skipped++; return; }
            if (existing[r.id]) { skipped++; return; }
            db.requests.push(normalize(r)); existing[r.id] = true; imported++;
          });
          save(db);
          resolve({ imported: imported, skipped: skipped });
        } catch (e) { reject(e); }
      });
    }
  };

  function matchQuery(r, q) {
    var v = r.values;
    var hay = [r.id, v.vorname, v.nachname, v.email, v.modell, v.region, v.landLabel, v.paket,
      (Array.isArray(v.stil) ? v.stil.join(' ') : v.stil)].join(' ').toLowerCase();
    return hay.indexOf(q) !== -1;
  }

  global.TDS = global.TDS || {};
  global.TDS.store = Store;
})(window);
