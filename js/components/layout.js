/*
 * layout.js — gemeinsame UI-Bausteine & kleine Helfer.
 * Header und Footer sind hier zentral, damit jede View denselben Rahmen nutzt.
 */
(function (global) {
  'use strict';

  var app = function () { return document.getElementById('app'); };

  /** HTML in #app rendern. */
  function render(html) {
    app().innerHTML = html;
  }

  /** Sicheres Escapen für Text aus Nutzereingaben. */
  function esc(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** ISO-Datum -> "16.06.2026, 14:32" */
  function formatDate(iso) {
    if (!iso) return '–';
    var d = new Date(iso);
    if (isNaN(d)) return '–';
    function p(n) { return String(n).padStart(2, '0'); }
    return p(d.getDate()) + '.' + p(d.getMonth() + 1) + '.' + d.getFullYear() +
      ', ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function header(opts) {
    opts = opts || {};
    return '' +
      '<header class="hdr">' +
        '<a class="logo" href="#/">Töff<em>Deal</em>Scout</a>' +
        '<nav class="hdr-nav">' +
          '<a href="#/form" class="hdr-link">Anfrage</a>' +
          '<a href="#/admin" class="hdr-link">Admin</a>' +
          '<span class="hdr-tag">Schweiz &amp; DACH · Beta</span>' +
        '</nav>' +
      '</header>';
  }

  function footer() {
    return '' +
      '<footer>' +
        '&copy; 2025 Töff Deal Scout &middot; Zürich &middot; ' +
        '<a href="mailto:info@toeffdealscout.ch">info@toeffdealscout.ch</a> &middot; ' +
        '<a href="#/admin">Admin-Ansicht</a> &middot; ' +
        '<span>Demo / MVP — Daten werden nur lokal im Browser gespeichert.</span>' +
      '</footer>';
  }

  /** Statusfarbe als (ASCII-)CSS-Klassenname, z.B. "In Prüfung" -> "st-in-pruefung". */
  function statusClass(status) {
    var s = (status || '').toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return 'st-' + s;
  }

  function statusBadge(status) {
    return '<span class="badge ' + statusClass(status) + '">' + esc(status) + '</span>';
  }

  global.TDS = global.TDS || {};
  global.TDS.ui = {
    render: render,
    esc: esc,
    formatDate: formatDate,
    header: header,
    footer: footer,
    statusClass: statusClass,
    statusBadge: statusBadge
  };
})(window);
