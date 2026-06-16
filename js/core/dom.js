/*
 * core/dom.js — kleine DOM-Helfer, die mehrfach gebraucht werden.
 * Zentralisiert u.a. den Datei-Download (Admin/Settings nutzen ihn).
 */
(function (global) {
  'use strict';

  var doc = global.document;

  function byId(id) { return doc.getElementById(id); }
  function qs(sel, root) { return (root || doc).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }

  /** Text als Datei herunterladen (Blob + temporärer <a>). */
  function download(filename, text, mime) {
    var blob = new global.Blob([text], { type: mime || 'text/plain;charset=utf-8' });
    var url = global.URL.createObjectURL(blob);
    var a = doc.createElement('a');
    a.href = url; a.download = filename;
    doc.body.appendChild(a); a.click(); doc.body.removeChild(a);
    setTimeout(function () { global.URL.revokeObjectURL(url); }, 1000);
  }

  /** Funktion erst nach Ruhephase ausführen (z.B. Sucheingabe). */
  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, ms || 120);
    };
  }

  global.TDS = global.TDS || {};
  global.TDS.dom = { byId: byId, qs: qs, qsa: qsa, download: download, debounce: debounce };
})(window);
