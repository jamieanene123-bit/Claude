/*
 * tests/smoke.js — Headless-Render-Smoke-Test.
 * Lädt alle App-Module mit minimalen DOM-Stubs in echter Reihenfolge und
 * rendert jede View. Fängt Ladereihenfolge-/Laufzeitfehler ab, bevor sie im
 * Browser auffallen. Nutzung: node tests/smoke.js   (Exit != 0 bei Fehler)
 */
'use strict';
var fs = require('fs'), path = require('path');
process.chdir(path.join(__dirname, '..')); // immer vom Repo-Root aus

function mk() {
  var h = '';
  return {
    set innerHTML(v) { h = v; }, get innerHTML() { return h; },
    value: '', textContent: '', style: {}, files: [], checked: false, offsetWidth: 0, nextElementSibling: null,
    classList: { add: function () {}, remove: function () {}, toggle: function () {}, contains: function () { return false; } },
    addEventListener: function () {}, removeEventListener: function () {}, dispatchEvent: function () {}, add: function () {},
    appendChild: function () {}, removeChild: function () {}, click: function () {}, focus: function () {},
    getAttribute: function () { return ''; }, setAttribute: function () {},
    querySelector: function () { return null; }, querySelectorAll: function () { return []; }, closest: function () { return null; }
  };
}

var store = {};
global.window = global;
var app = mk();
global.document = {
  getElementById: function (id) { return id === 'app' ? app : mk(); },
  querySelector: function () { return null; }, querySelectorAll: function () { return []; },
  createElement: function () { return mk(); }, body: mk(), addEventListener: function () {},
  documentElement: { setAttribute: function () {}, style: { setProperty: function () {} }, classList: { add: function () {}, remove: function () {}, toggle: function () {}, contains: function () { return false; } } }
};
// Manche Globals (navigator/performance) sind in Node read-only -> defensiv setzen.
function setGlobal(k, v) {
  try { global[k] = v; }
  catch (e) { try { Object.defineProperty(global, k, { value: v, configurable: true, writable: true }); } catch (_) {} }
}
setGlobal('navigator', global.navigator || {});
setGlobal('location', { hash: '', protocol: 'file:' });
setGlobal('performance', { now: function () { return Date.now(); } });
global.matchMedia = function () { return { matches: false }; };
global.requestAnimationFrame = function () {};
global.IntersectionObserver = function () { this.observe = function () {}; this.unobserve = function () {}; };
global.scrollTo = function () {}; global.scrollY = 0; global.pageYOffset = 0;
global.print = function () {}; global.confirm = function () { return true; }; global.addEventListener = function () {};
global.Option = function (t, v) { return { text: t, value: v }; };
global.localStorage = { getItem: function (k) { return k in store ? store[k] : null; }, setItem: function (k, v) { store[k] = String(v); }, removeItem: function (k) { delete store[k]; } };
global.Blob = function () {}; global.URL = { createObjectURL: function () { return 'blob:x'; }, revokeObjectURL: function () {} };
global.FileReader = function () { this.readAsText = function () {}; };

var errors = [];
process.on('unhandledRejection', function (e) { errors.push('unhandledRejection: ' + (e && e.stack || e)); });

JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
JSON.parse(fs.readFileSync('package.json', 'utf8'));

function dir(d) { return fs.readdirSync(d).filter(function (f) { return /\.js$/.test(f); }).map(function (f) { return d + '/' + f; }); }
var coreFirst = ['js/core/events.js', 'js/core/format.js', 'js/core/charts.js', 'js/core/theme.js', 'js/core/toast.js', 'js/core/motion.js', 'js/core/dom.js'];
var core = coreFirst.concat(dir('js/core').filter(function (f) { return coreFirst.indexOf(f) < 0; }));
var dataFirst = ['js/data/config.js', 'js/data/market.js'];
var data = dataFirst.concat(dir('js/data').filter(function (f) { return dataFirst.indexOf(f) < 0; }));
var services = dir('js/services');
var comps = ['layout', 'landing', 'form', 'success', 'admin', 'report', 'settings', 'datenschutz', 'agb', 'impressum', 'preise', 'ueber-uns', 'kontakt', 'ratgeber', 'notfound'].map(function (n) { return 'js/components/' + n + '.js'; });
var files = core.concat(data, services, ['js/router.js'], comps, ['js/app.js']);

files.forEach(function (f) {
  try { new Function(fs.readFileSync(f, 'utf8')).call(global); }
  catch (e) { errors.push('LOAD ' + f + ': ' + e.message); }
});
if (errors.length) { console.log('FAIL\n' + errors.join('\n')); process.exit(1); }

var T = global.TDS;
T.store._useAdapter(T.store._memoryAdapter());
T.store.create({ vorname: 'A', nachname: 'B', email: 'a@e.ch', land: 'CH', landLabel: 'Schweiz', region: 'Zürich', ausweis: 'A2 (max. 35 kW)', stil: ['Naked Bike'], budget_von: '5000', budget_bis: '8000', waehrung: 'CHF', km: "40'000 km", baujahr: '2019', paket: 'Scout' }).then(function (rec) {
  var id = rec.id;
  [['landing', function () { T.views.landing(); }], ['form', function () { T.views.form(); }],
   ['success', function () { T.views.success({ id: id }); }], ['adminList', function () { T.views.adminList(); }],
   ['adminDetail', function () { T.views.adminDetail({ id: id }); }], ['report', function () { T.views.report({ id: id }); }],
   ['settings', function () { T.views.settings(); }],
   ['datenschutz', function () { T.views.datenschutz(); }], ['agb', function () { T.views.agb(); }], ['impressum', function () { T.views.impressum(); }],
   ['preise', function () { T.views.preise(); }], ['ueberUns', function () { T.views.ueberUns(); }], ['kontakt', function () { T.views.kontakt(); }], ['ratgeber', function () { T.views.ratgeber(); }],
   ['report-demo', function () { T.views.report({ id: 'demo' }); }],
   ['notFound', function () { T.views.notFound({ path: '/x' }); }]]
    .forEach(function (p) { try { p[1](); } catch (e) { errors.push(p[0] + ': ' + e.message); } });
  setTimeout(function () {
    var h = app.innerHTML;
    ['undefined', '[object Object]', 'NaN'].forEach(function (bad) { if (h.indexOf(bad) >= 0) errors.push('Render enthält "' + bad + '"'); });
    if (errors.length) { console.log('FAIL\n' + errors.join('\n')); process.exit(1); }
    console.log('SMOKE OK: ' + files.length + ' Module geladen, 8 Views rendern sauber');
  }, 40);
});
