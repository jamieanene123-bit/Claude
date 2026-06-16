/*
 * scripts/build-single.js — bündelt die App in EINE eigenständige HTML-Datei.
 * Alle JS-Module (IIFEs auf window.TDS) und das CSS werden inline eingebettet,
 * sodass die Datei per Doppelklick (file://) in jedem Browser läuft — z.B. Edge.
 * Nutzung:  node scripts/build-single.js   ->   toeffdealscout-standalone.html
 */
'use strict';
var fs = require('fs'), path = require('path');
var ROOT = path.join(__dirname, '..');
function read(f) { return fs.readFileSync(path.join(ROOT, f), 'utf8'); }

// Lade-Reihenfolge wie in index.html
var JS = [
  'js/core/events.js', 'js/core/format.js', 'js/core/charts.js', 'js/core/theme.js',
  'js/core/toast.js', 'js/core/motion.js', 'js/core/dom.js',
  'js/data/config.js', 'js/data/market.js', 'js/data/demo.js',
  'js/services/store.js', 'js/services/scout.js',
  'js/router.js',
  'js/components/layout.js', 'js/components/landing.js', 'js/components/form.js',
  'js/components/success.js', 'js/components/admin.js', 'js/components/report.js',
  'js/components/settings.js', 'js/components/notfound.js',
  'js/app.js'
];

var css = read('css/styles.css');
var js = JS.map(function (f) { return '/* ===== ' + f + ' ===== */\n' + read(f); }).join('\n');

var html = '<!DOCTYPE html>\n<html lang="de">\n<head>\n' +
  '<meta charset="UTF-8">\n' +
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
  '<title>Töff Deal Scout</title>\n' +
  '<meta name="description" content="Töff Deal Scout — Motorrad-Kaufberatung mit Deal-Score, Risiko und Verhandlungsargumenten.">\n' +
  '<meta name="theme-color" media="(prefers-color-scheme: light)" content="#FAF6F0">\n' +
  '<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1A1512">\n' +
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">\n' +
  '<style>\n' + css + '\n</style>\n' +
  '</head>\n<body>\n' +
  '<div id="app"></div>\n' +
  '<div id="route-announcer" class="sr-only" aria-live="polite" aria-atomic="true"></div>\n' +
  '<noscript><div style="max-width:560px;margin:64px auto;padding:0 20px;font-family:system-ui,sans-serif;text-align:center">' +
  '<h1>Töff Deal Scout</h1><p>Diese App braucht JavaScript. Bitte in Edge aktivieren.</p></div></noscript>\n' +
  '<script>\n' + js + '\n</' + 'script>\n' +
  '</body>\n</html>\n';

var out = path.join(ROOT, 'toeffdealscout-standalone.html');
fs.writeFileSync(out, html);
console.log('Geschrieben: toeffdealscout-standalone.html (' + Math.round(html.length / 1024) + ' KB)');
