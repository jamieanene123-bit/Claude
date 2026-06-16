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

  /**
   * @param {string} msg
   * @param {string} type  success|error|info
   * @param {number|object} opts  Lebensdauer (ms) ODER { ms, action:{label, fn} }
   */
  function show(msg, type, opts) {
    type = type || 'info';
    opts = (typeof opts === 'number') ? { ms: opts } : (opts || {});
    var doc = global.document;
    var t = doc.createElement('div');
    t.className = 'toast toast-' + type;
    t.innerHTML = '<span class="toast-ico">' + (ICONS[type] || '') + '</span><span class="toast-msg">' + String(msg) + '</span>';

    var life = opts.ms || (opts.action ? 6000 : 2800);
    var dismiss = function () {
      t.classList.remove('in');
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 260);
    };

    if (opts.action && opts.action.label) {
      var btn = doc.createElement('button');
      btn.className = 'toast-action';
      btn.type = 'button';
      btn.textContent = opts.action.label;
      btn.addEventListener('click', function () {
        try { opts.action.fn(); } catch (e) { /* noop */ }
        clearTimeout(timer); dismiss();
      });
      t.appendChild(btn);
    }

    container().appendChild(t);
    global.requestAnimationFrame(function () { t.classList.add('in'); });
    var timer = setTimeout(dismiss, life);
  }

  global.TDS = global.TDS || {};
  global.TDS.toast = {
    show: show,
    success: function (m, opts) { show(m, 'success', opts); },
    error: function (m, opts) { show(m, 'error', opts); },
    info: function (m, opts) { show(m, 'info', opts); }
  };
})(window);
