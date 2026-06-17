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
      var cur = theme.mode();
      var dens = currentDensity();
      var html = '' +
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
                segBtn('system', 'System', cur) +
                segBtn('light', 'Hell', cur) +
                segBtn('dark', 'Dunkel', cur) +
              '</div>' +
              '<div class="hint-text">„System" folgt der Einstellung deines Geräts.</div>' +
            '</div>' +
            '<div class="field">' +
              '<label class="lbl">Dichte</label>' +
              '<div class="segmented" id="density-seg">' +
                densBtn('comfortable', 'Komfortabel', dens) +
                densBtn('compact', 'Kompakt', dens) +
              '</div>' +
              '<div class="hint-text">„Kompakt" zeigt mehr auf einmal (engere Abstände).</div>' +
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
            aboutRow('Version', '0.3.0 · Demo / Frontend-only') +
            aboutRow('Technik', 'Vanilla JS, Hash-Router, LocalStorage, kein Build') +
            aboutRow('Geplant', 'Backend-API, Login, Stripe/TWINT — Architektur ist vorbereitet') +
            '<a class="btn-ghost btn-block" href="#/admin" style="margin-top:12px;">Zum Admin-Dashboard</a>' +
          '</div>' +
        '</div>' +
        '';

      ui.render(html);
      wire();
    });
  }

  function segBtn(val, label, cur) {
    return '<button class="seg-btn' + (cur === val ? ' active' : '') + '" data-theme="' + val + '">' + ui.esc(label) + '</button>';
  }
  function densBtn(val, label, cur) {
    return '<button class="seg-btn' + (cur === val ? ' active' : '') + '" data-density="' + val + '">' + ui.esc(label) + '</button>';
  }

  function currentDensity() {
    try { return global.localStorage.getItem('tds_density') || 'comfortable'; } catch (e) { return 'comfortable'; }
  }
  function setDensity(val) {
    try { global.localStorage.setItem('tds_density', val); } catch (e) {}
    global.document.documentElement.setAttribute('data-density', val);
  }

  function aboutRow(k, v) {
    return '<div class="dl-row"><dt>' + ui.esc(k) + '</dt><dd>' + ui.esc(v) + '</dd></div>';
  }

  function activate(group, el) {
    Array.prototype.forEach.call(group.parentNode.querySelectorAll('.seg-btn'), function (b) {
      b.classList.toggle('active', b === el);
    });
  }

  function wire() {
    Array.prototype.forEach.call(global.document.querySelectorAll('#theme-seg .seg-btn'), function (btn) {
      btn.addEventListener('click', function () {
        theme.set(this.getAttribute('data-theme'));
        activate(this, this);
        var m = theme.mode();
        toast.info('Farbschema: ' + (m === 'system' ? 'System' : m === 'dark' ? 'Dunkel' : 'Hell'));
      });
    });
    Array.prototype.forEach.call(global.document.querySelectorAll('#density-seg .seg-btn'), function (btn) {
      btn.addEventListener('click', function () {
        setDensity(this.getAttribute('data-density'));
        activate(this, this);
        toast.info('Dichte: ' + (this.getAttribute('data-density') === 'compact' ? 'Kompakt' : 'Komfortabel'));
      });
    });

    $('seed-btn').addEventListener('click', function () {
      var samples = global.TDS.data.demo.samples();
      Promise.all(samples.map(function (x) { return store.create(x); })).then(function () {
        toast.success('Beispieldaten geladen'); view();
      });
    });
    $('json-btn').addEventListener('click', function () {
      store.exportJSON().then(function (json) {
        global.TDS.dom.download('toeffdealscout-backup.json', json, 'application/json');
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

  global.TDS = global.TDS || {};
  global.TDS.views = global.TDS.views || {};
  global.TDS.views.settings = view;
})(window);
