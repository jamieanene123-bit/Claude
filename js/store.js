/*
 * store.js — Datenzugriffsschicht (Repository-Pattern).
 *
 * Kapselt die komplette Persistenz hinter einer kleinen API.
 * Heute: LocalStorage. Später kann der Body dieser Methoden 1:1 durch
 * fetch()-Aufrufe gegen ein echtes Backend ersetzt werden, ohne dass
 * die UI-Komponenten angefasst werden müssen.
 *
 * Die Methoden sind absichtlich Promise-basiert, damit der spätere
 * Wechsel auf async/Netzwerk keine Signaturänderung erzwingt.
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'tds_requests_v1';
  var DEFAULT_STATUS = global.TDS.config.DEFAULT_STATUS;

  function readAll() {
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Store: konnte Daten nicht lesen', e);
      return [];
    }
  }

  function writeAll(list) {
    global.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function genId() {
    // Kurze, gut lesbare ID: TDS-XXXXXX
    var rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
    return 'TDS-' + rnd;
  }

  var Store = {
    /** Alle Anfragen, neueste zuerst. */
    list: function () {
      var all = readAll().slice().sort(function (a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      return Promise.resolve(all);
    },

    /** Eine Anfrage anhand der ID. */
    get: function (id) {
      var found = readAll().filter(function (r) { return r.id === id; })[0] || null;
      return Promise.resolve(found);
    },

    /**
     * Neue Anfrage anlegen.
     * @param {object} values - rohe Formularwerte
     * @returns {Promise<object>} gespeicherter Datensatz
     */
    create: function (values) {
      var all = readAll();
      var record = {
        id: genId(),
        createdAt: new Date().toISOString(),
        status: DEFAULT_STATUS,
        values: values
      };
      all.push(record);
      writeAll(all);
      return Promise.resolve(record);
    },

    /** Status einer Anfrage ändern. */
    updateStatus: function (id, status) {
      var all = readAll();
      var updated = null;
      all.forEach(function (r) {
        if (r.id === id) {
          r.status = status;
          r.updatedAt = new Date().toISOString();
          updated = r;
        }
      });
      writeAll(all);
      return Promise.resolve(updated);
    },

    /** Anfrage löschen (nur Admin/Demo). */
    remove: function (id) {
      var all = readAll().filter(function (r) { return r.id !== id; });
      writeAll(all);
      return Promise.resolve(true);
    }
  };

  global.TDS = global.TDS || {};
  global.TDS.store = Store;
})(window);
