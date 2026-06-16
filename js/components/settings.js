/*
 * components/settings.js — Einstellungen: Design, Datenverwaltung, Info.
 */
(function (global) {
  'use strict';

  var ui = global.TDS.ui;
  var store = global.TDS.store;
  var theme = global.TDS.theme;
  var toast = global.TDS.toast;

  function $(id) { return global.document.getElementById(id); }

  function view() {
    store.stats().then(function (s) {
      var cur = theme.current();
      var html = ui.header() +
        '<div class="hero hero-sm">' +
          '<div class="hero-eye">Einstellungen</div>' +
          '<h1>App-Einstellungen</h1>' +
          '<p>Design und lokale Daten verwalten. Alles bleibt in diesem Browser.</p>' +
        '</div>' +

        '<div class="wrap">' +
          '<div class="sec">' +
            '<div class="sec-head">Design</div>' +
            '<div class="field">' +
              '<label class="lbl">Farbschema</label>' +
              '<div class="segmented" id="theme-seg">' +
                segBtn('light', 'Hell', cur) +
                segBtn('dark', 'Dunkel', cur) +
              '</div>' +
              '<div class="hint-text">Folgt standardmässig der System-Einstellung.</div>' +
            '</div>' +
          '</div>' +

          '<div class="sec">' +
            '<div class="sec-head">Daten (' + s.total + ' Anfragen)</div>' +
            '<p class="settings-text">Anfragen werden lokal im Browser gespeichert (LocalStorage). Du kannst sie sichern, übertragen oder löschen.</p>' +
            '<div class="settings-actions">' +
              '<button class="btn-ghost btn-sm" id="seed-btn">Beispieldaten laden</button>' +
              '<button class="btn-ghost btn-sm" id="json-btn">Backup exportieren (JSON)</button>' +
              '<button class="btn-ghost btn-sm" id="import-btn">Backup importieren</button>' +
              '<button class="btn-ghost btn-sm danger" id="clear-btn">Alle Daten löschen</button>' +
              '<input type="file" id="import-file" accept="application/json,.json" hidden>' +
            '</div>' +
          '</div>' +

          '<div class="sec">' +
            '<div class="sec-head">Über diese App</div>' +
            aboutRow('Produkt', 'Töff Deal Scout — Motorrad-Kaufberatung') +
            aboutRow('Version', 'MVP / Demo · Frontend-only') +
            aboutRow('Technik', 'Vanilla JS, Hash-Router, LocalStorage, kein Build') +
            aboutRow('Geplant', 'Backend-API, Login, Stripe/TWINT — Architektur ist vorbereitet') +
            '<a class="btn-ghost btn-block" href="#/admin" style="margin-top:12px;">Zum Admin-Dashboard</a>' +
          '</div>' +
        '</div>' +
        ui.footer();

      ui.render(html);
      wire();
    });
  }

  function segBtn(val, label, cur) {
    return '<button class="seg-btn' + (cur === val ? ' active' : '') + '" data-theme="' + val + '">' + ui.esc(label) + '</button>';
  }

  function aboutRow(k, v) {
    return '<div class="dl-row"><dt>' + ui.esc(k) + '</dt><dd>' + ui.esc(v) + '</dd></div>';
  }

  function wire() {
    Array.prototype.forEach.call(global.document.querySelectorAll('.seg-btn'), function (btn) {
      btn.addEventListener('click', function () {
        theme.set(this.getAttribute('data-theme'));
        Array.prototype.forEach.call(global.document.querySelectorAll('.seg-btn'), function (b) {
          b.classList.toggle('active', b === btn);
        });
        toast.info('Design: ' + (theme.current() === 'dark' ? 'Dunkel' : 'Hell'));
      });
    });

    $('seed-btn').addEventListener('click', function () {
      var samples = demoSamples();
      Promise.all(samples.map(function (x) { return store.create(x); })).then(function () {
        toast.success('Beispieldaten geladen'); view();
      });
    });
    $('json-btn').addEventListener('click', function () {
      store.exportJSON().then(function (json) {
        download('toeffdealscout-backup.json', json, 'application/json');
        toast.success('Backup exportiert');
      });
    });
    $('import-btn').addEventListener('click', function () { $('import-file').click(); });
    $('import-file').addEventListener('change', function (e) {
      var file = e.target.files[0]; if (!file) return;
      var reader = new global.FileReader();
      reader.onload = function () {
        store.importJSON(reader.result, 'merge').then(function (r) {
          toast.success('Import: ' + r.imported + ' neu, ' + r.skipped + ' übersprungen'); view();
        }).catch(function () { toast.error('Import fehlgeschlagen — ungültige Datei.'); });
      };
      reader.readAsText(file);
    });
    $('clear-btn').addEventListener('click', function () {
      if (global.confirm('Wirklich ALLE lokalen Daten löschen?')) {
        store.clear().then(function () { toast.info('Alle Daten gelöscht'); view(); });
      }
    });
  }

  function download(filename, text, mime) {
    var blob = new global.Blob([text], { type: mime || 'text/plain' });
    var url = global.URL.createObjectURL(blob);
    var a = global.document.createElement('a');
    a.href = url; a.download = filename;
    global.document.body.appendChild(a); a.click(); global.document.body.removeChild(a);
    setTimeout(function () { global.URL.revokeObjectURL(url); }, 1000);
  }

  function demoSamples() {
    return [
      { vorname: 'Lena', nachname: 'Berger', email: 'lena.berger@example.ch', telefon: '+41 79 222 11 33', land: 'CH', landLabel: 'Schweiz', region: 'Zürich', ausweis: 'A2 (max. 35 kW)', erfahrung: 'Anfänger — erstes Motorrad', stil: ['Naked Bike'], modell: 'Yamaha MT-07', budget_von: '5000', budget_bis: '8000', waehrung: 'CHF', baujahr: '2019', km: "30'000 km", nutzung: 'Pendeln / Alltag', prioritaeten: 'MFK frisch, Serviceheft', paket: 'Scout' },
      { vorname: 'Marco', nachname: 'Frei', email: 'marco.frei@example.ch', telefon: '', land: 'CH', landLabel: 'Schweiz', region: 'Bern', ausweis: 'A (unbeschränkt)', erfahrung: 'Erfahren', stil: ['Enduro / Adventure', 'Touring'], modell: '', budget_von: '8000', budget_bis: '12000', waehrung: 'CHF', baujahr: '2017', km: "50'000 km", nutzung: 'Längere Touren', prioritaeten: 'Koffersystem', paket: 'Premium' }
    ];
  }

  global.TDS = global.TDS || {};
  global.TDS.views = global.TDS.views || {};
  global.TDS.views.settings = view;
})(window);
