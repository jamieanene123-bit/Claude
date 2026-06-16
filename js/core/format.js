/*
 * core/format.js — zentrale Formatierung (Schweiz/DACH-tauglich).
 * Eine Quelle der Wahrheit für Währung, Zahlen, Kilometer und Datum.
 */
(function (global) {
  'use strict';

  function group(intStr, sep) {
    return String(intStr).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  }

  /** Währung: CHF mit Apostroph-Tausender, EUR mit Punkt. */
  function money(n, cur) {
    cur = cur || 'CHF';
    if (n === null || n === undefined || isNaN(n)) return cur + ' –';
    var sep = cur === 'CHF' ? "'" : '.';
    var neg = n < 0;
    return cur + ' ' + (neg ? '-' : '') + group(Math.round(Math.abs(n)), sep);
  }

  /** Reine Zahl im CH-Stil (1'234). */
  function number(n) {
    if (n === null || n === undefined || isNaN(n)) return '–';
    return group(Math.round(n), "'");
  }

  function km(n) {
    if (n === null || n === undefined || isNaN(n)) return '–';
    return number(n) + ' km';
  }

  function pct(n, digits) {
    if (n === null || n === undefined || isNaN(n)) return '–';
    return (digits ? n.toFixed(digits) : Math.round(n)) + '%';
  }

  function pad(x) { return String(x).padStart(2, '0'); }

  /** "16.06.2026, 14:32" */
  function date(iso) {
    if (!iso) return '–';
    var d = new Date(iso);
    if (isNaN(d)) return '–';
    return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear() +
      ', ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  /** "16.06.2026" */
  function dateShort(iso) {
    if (!iso) return '–';
    var d = new Date(iso);
    if (isNaN(d)) return '–';
    return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear();
  }

  /** "gerade eben", "vor 3 Min.", "vor 2 Std.", "vor 4 Tagen". */
  function relative(iso) {
    if (!iso) return '–';
    var d = new Date(iso);
    if (isNaN(d)) return '–';
    var s = Math.round((Date.now() - d.getTime()) / 1000);
    if (s < 45) return 'gerade eben';
    var m = Math.round(s / 60);
    if (m < 60) return 'vor ' + m + ' Min.';
    var h = Math.round(m / 60);
    if (h < 24) return 'vor ' + h + ' Std.';
    var days = Math.round(h / 24);
    if (days === 1) return 'gestern';
    if (days < 31) return 'vor ' + days + ' Tagen';
    return dateShort(iso);
  }

  global.TDS = global.TDS || {};
  global.TDS.format = {
    money: money, number: number, km: km, pct: pct,
    date: date, dateShort: dateShort, relative: relative
  };
})(window);
