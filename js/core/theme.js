/*
 * core/theme.js — Hell/Dunkel-Modus mit Persistenz.
 * Setzt data-theme auf <html>; das CSS reagiert über Variablen-Overrides.
 */
(function (global) {
  'use strict';

  var KEY = 'tds_theme';

  function systemPref() {
    return (global.matchMedia && global.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }

  function current() {
    try { return global.localStorage.getItem(KEY) || systemPref(); }
    catch (e) { return 'light'; }
  }

  function apply(t) {
    if (global.document && global.document.documentElement) {
      global.document.documentElement.setAttribute('data-theme', t);
    }
  }

  function set(t) {
    try { global.localStorage.setItem(KEY, t); } catch (e) {}
    apply(t);
    if (global.TDS.events) global.TDS.events.emit('theme:change', t);
  }

  function toggle() { set(current() === 'dark' ? 'light' : 'dark'); }

  global.TDS = global.TDS || {};
  global.TDS.theme = {
    init: function () { apply(current()); },
    current: current,
    set: set,
    toggle: toggle
  };
})(window);
