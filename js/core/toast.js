/*
 * core/toast.js — leichte, nicht-blockierende Benachrichtigungen.
 * TDS.toast.success('Gespeichert'); TDS.toast.error('Fehler');
 */
(function (global) {
  'use strict';

  function container() {
    var doc = global.document;
    var c = doc.getElementById('tds-toasts');
    if (!c) {
      c = doc.createElement('div');
      c.id = 'tds-toasts';
      c.className = 'toasts';
      c.setAttribute('role', 'status');
      c.setAttribute('aria-live', 'polite');
      doc.body.appendChild(c);
    }
    return c;
  }

  var ICONS = { success: '✓', error: '⚠', info: 'ℹ' };

  function show(msg, type, ms) {
    type = type || 'info';
    var doc = global.document;
    var t = doc.createElement('div');
    t.className = 'toast toast-' + type;
    t.innerHTML = '<span class="toast-ico">' + (ICONS[type] || '') + '</span><span>' + String(msg) + '</span>';
    container().appendChild(t);
    global.requestAnimationFrame(function () { t.classList.add('in'); });
    var life = ms || 2800;
    setTimeout(function () {
      t.classList.remove('in');
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 260);
    }, life);
  }

  global.TDS = global.TDS || {};
  global.TDS.toast = {
    show: show,
    success: function (m, ms) { show(m, 'success', ms); },
    error: function (m, ms) { show(m, 'error', ms); },
    info: function (m, ms) { show(m, 'info', ms); }
  };
})(window);
