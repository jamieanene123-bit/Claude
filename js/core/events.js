/*
 * core/events.js — winziger globaler EventBus (Publish/Subscribe).
 * Wird u.a. vom Store genutzt, damit sich Views nach Datenänderungen
 * selbst aktualisieren können, ohne enge Kopplung.
 */
(function (global) {
  'use strict';

  var listeners = {};

  function on(type, fn) {
    (listeners[type] = listeners[type] || []).push(fn);
    return function off() {
      listeners[type] = (listeners[type] || []).filter(function (f) { return f !== fn; });
    };
  }

  function emit(type, payload) {
    (listeners[type] || []).slice().forEach(function (fn) {
      try { fn(payload); } catch (e) { console.error('EventBus listener error for "' + type + '"', e); }
    });
  }

  global.TDS = global.TDS || {};
  global.TDS.events = { on: on, emit: emit };
})(window);
