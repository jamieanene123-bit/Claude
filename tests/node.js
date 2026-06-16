/*
 * tests/node.js — führt die Browser-Tests headless in Node aus.
 * Nutzung:  node tests/node.js
 * Exit-Code != 0 bei Fehlern (CI-tauglich).
 */
'use strict';
var fs = require('fs');
var path = require('path');

// Minimal-Stubs, damit die App-Module (window/localStorage) laden.
var ls = {};
global.window = global;
global.localStorage = {
  getItem: function (k) { return k in ls ? ls[k] : null; },
  setItem: function (k, v) { ls[k] = String(v); },
  removeItem: function (k) { delete ls[k]; }
};
global.matchMedia = function () { return { matches: false }; };
global.document = { documentElement: { setAttribute: function () {} } };

var ROOT = path.join(__dirname, '..');
function load(f) { new Function(fs.readFileSync(path.join(ROOT, f), 'utf8')).call(global); }

[
  'js/core/events.js', 'js/core/format.js', 'js/core/charts.js',
  'js/data/config.js', 'js/data/market.js', 'js/data/demo.js',
  'js/services/store.js', 'js/services/scout.js',
  'tests/framework.js', 'tests/suite.js'
].forEach(load);

global.TDS.test.run().then(function (res) {
  var pass = res.filter(function (r) { return r.pass; }).length;
  var fail = res.length - pass;
  var lastSuite = '';
  res.forEach(function (r) {
    if (r.suite !== lastSuite) { console.log('\n' + r.suite); lastSuite = r.suite; }
    console.log('  ' + (r.pass ? '✓' : '✗') + ' ' + r.name + (r.pass ? '' : '  → ' + r.err));
  });
  console.log('\n' + pass + '/' + res.length + ' Tests bestanden' + (fail ? ', ' + fail + ' FEHLGESCHLAGEN' : ''));
  process.exit(fail ? 1 : 0);
});
