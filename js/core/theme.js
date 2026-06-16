/*
 * core/theme.js — Farbschema mit Persistenz.
 * Modi: 'system' (Standard, folgt OS), 'light', 'dark'.
 * Setzt data-theme (light|dark) auf <html>; das CSS reagiert über Variablen.
 */
(function (global) {
  'use strict';

  var KEY = 'tds_theme';

  function systemPref() {
    return (global.matchMedia && global.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }

  /** Gewählter Modus inkl. 'system'. */
  function mode() {
    try { return global.localStorage.getItem(KEY) || 'system'; }
    catch (e) { return 'system'; }
  }

  /** Tatsächlich angewandtes Schema (system -> aufgelöst). */
  function resolved() {
    var m = mode();
    return m === 'system' ? systemPref() : m;
  }

  function apply(t) {
    if (global.document && global.document.documentElement) {
      global.document.documentElement.setAttribute('data-theme', t);
    }
  }

  function set(m) {
    try { global.localStorage.setItem(KEY, m); } catch (e) {}
    apply(resolved());
    if (global.TDS.events) global.TDS.events.emit('theme:change', resolved());
  }

  function toggle() { set(resolved() === 'dark' ? 'light' : 'dark'); }

  function init() {
    apply(resolved());
    // Bei Modus 'system' auf OS-Wechsel reagieren.
    if (global.matchMedia) {
      var mq = global.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function () { if (mode() === 'system') apply(resolved()); };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  global.TDS = global.TDS || {};
  global.TDS.theme = {
    init: init,
    mode: mode,        // 'system' | 'light' | 'dark'
    current: resolved, // tatsächliches Schema 'light' | 'dark'
    set: set,
    toggle: toggle
  };
})(window);
