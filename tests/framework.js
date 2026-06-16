/*
 * tests/framework.js — winziges, abhängigkeitsfreies Test-Framework.
 * Läuft im Browser (tests.html) und in Node (tests/node.js).
 * Unterstützt synchrone und Promise-basierte Tests.
 */
(function (global) {
  'use strict';

  var suites = [];
  var current = null;

  function describe(name, fn) {
    current = { name: name, tests: [] };
    suites.push(current);
    fn();
    current = null;
  }

  function it(name, fn) {
    (current ? current.tests : []).push({ name: name, fn: fn });
  }

  function show(v) {
    try { return typeof v === 'object' ? JSON.stringify(v) : String(v); }
    catch (e) { return String(v); }
  }

  function expect(actual) {
    return {
      toBe: function (e) { if (actual !== e) throw new Error('erwartet ' + show(e) + ', erhalten ' + show(actual)); },
      toEqual: function (e) { if (JSON.stringify(actual) !== JSON.stringify(e)) throw new Error('deep erwartet ' + show(e) + ', erhalten ' + show(actual)); },
      toBeTruthy: function () { if (!actual) throw new Error('erwartet truthy, erhalten ' + show(actual)); },
      toBeFalsy: function () { if (actual) throw new Error('erwartet falsy, erhalten ' + show(actual)); },
      toBeGreaterThanOrEqual: function (e) { if (!(actual >= e)) throw new Error(show(actual) + ' ist nicht >= ' + show(e)); },
      toBeLessThanOrEqual: function (e) { if (!(actual <= e)) throw new Error(show(actual) + ' ist nicht <= ' + show(e)); },
      toContain: function (e) { if (String(actual).indexOf(e) < 0) throw new Error(show(actual) + ' enthält nicht ' + show(e)); }
    };
  }

  function run() {
    var res = [];
    var chain = Promise.resolve();
    suites.forEach(function (s) {
      s.tests.forEach(function (t) {
        chain = chain.then(function () {
          return Promise.resolve().then(t.fn).then(
            function () { res.push({ suite: s.name, name: t.name, pass: true }); },
            function (e) { res.push({ suite: s.name, name: t.name, pass: false, err: e && e.message }); }
          );
        });
      });
    });
    return chain.then(function () { return res; });
  }

  global.TDS = global.TDS || {};
  global.TDS.test = { describe: describe, it: it, expect: expect, run: run };
})(typeof window !== 'undefined' ? window : globalThis);
