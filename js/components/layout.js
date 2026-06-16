/*
 * components/layout.js — gemeinsame UI-Bausteine & Helfer.
 * Header (mit Navigation + Theme-Umschalter) und Footer für alle Views.
 */
(function (global) {
  'use strict';

  var fmt = global.TDS.format;

  function app() { return global.document.getElementById('app'); }
  function render(html) {
    var el = app();
    el.innerHTML = html;
    if (global.TDS.motion) global.TDS.motion.enter(el); // Bewegungs-Layer
  }

  function esc(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function activeKey() {
    var h = global.location.hash || '#/';
    if (h.indexOf('#/form') === 0) return 'form';
    if (h.indexOf('#/admin') === 0) return 'admin';
    if (h.indexOf('#/settings') === 0) return 'settings';
    return 'home';
  }

  function navLink(href, key, label, active) {
    return '<a href="' + href + '" class="hdr-link' + (key === active ? ' active' : '') + '">' + esc(label) + '</a>';
  }

  function header() {
    var active = activeKey();
    return '' +
      '<header class="hdr">' +
        '<a class="logo" href="#/">Töff<em>Deal</em>Scout</a>' +
        '<nav class="hdr-nav">' +
          navLink('#/form', 'form', 'Anfrage', active) +
          navLink('#/admin', 'admin', 'Admin', active) +
          navLink('#/settings', 'settings', 'Einstellungen', active) +
          '<button class="icon-btn" data-action="theme-toggle" title="Hell/Dunkel umschalten" aria-label="Design umschalten">◐</button>' +
        '</nav>' +
      '</header>';
  }

  function footer() {
    return '' +
      '<footer>' +
        '<div class="footer-inner">' +
          '<span>&copy; 2025 Töff Deal Scout · Zürich</span>' +
          '<span><a href="mailto:info@toeffdealscout.ch">info@toeffdealscout.ch</a></span>' +
          '<span><a href="#/admin">Admin</a> · <a href="#/settings">Einstellungen</a></span>' +
          '<span class="footer-note">Demo / MVP — Daten nur lokal im Browser (LocalStorage).</span>' +
        '</div>' +
      '</footer>';
  }

  function statusClass(status) {
    var s = (status || '').toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    return 'st-' + s;
  }
  function statusBadge(status) {
    return '<span class="badge ' + statusClass(status) + '">' + esc(status) + '</span>';
  }
  function riskBadge(level, label) {
    return '<span class="badge risk-badge risk-' + level + '">' + esc(label) + '</span>';
  }

  global.TDS = global.TDS || {};
  global.TDS.ui = {
    render: render,
    esc: esc,
    header: header,
    footer: footer,
    statusClass: statusClass,
    statusBadge: statusBadge,
    riskBadge: riskBadge,
    // Bequemer Zugriff auf Formatierung
    fmt: fmt,
    formatDate: fmt.date
  };
})(window);
