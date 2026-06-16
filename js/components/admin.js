/*
 * admin.js — Admin-Ansicht.
 * #/admin        -> Liste aller Anfragen mit Status-Filter
 * #/admin/:id    -> Detailansicht einer Anfrage inkl. Status ändern
 *
 * Hinweis: Kein Login (MVP). Die Stelle für eine spätere Auth-Prüfung
 * ist in app.js / router markiert.
 */
(function (global) {
  'use strict';

  var ui = global.TDS.ui;
  var cfg = global.TDS.config;
  var store = global.TDS.store;
  var router = global.TDS.router;

  // aktueller Filter (in-memory, reicht für MVP)
  var activeFilter = 'Alle';

  // ---------- LISTE ----------
  function list() {
    store.list().then(function (rows) {
      var counts = { Alle: rows.length };
      cfg.STATUSES.forEach(function (s) { counts[s] = 0; });
      rows.forEach(function (r) { counts[r.status] = (counts[r.status] || 0) + 1; });

      var filtered = activeFilter === 'Alle'
        ? rows
        : rows.filter(function (r) { return r.status === activeFilter; });

      var filterBtns = ['Alle'].concat(cfg.STATUSES).map(function (s) {
        return '<button class="filter-btn' + (activeFilter === s ? ' active' : '') +
          '" data-filter="' + ui.esc(s) + '">' + ui.esc(s) +
          ' <span class="filter-count">' + (counts[s] || 0) + '</span></button>';
      }).join('');

      var rowsHtml = filtered.length
        ? filtered.map(rowHtml).join('')
        : '<tr><td colspan="6" class="empty-row">Keine Anfragen' +
            (activeFilter !== 'Alle' ? ' mit Status „' + ui.esc(activeFilter) + '“' : '') +
            '. <a href="#/form">Neue Anfrage erstellen →</a></td></tr>';

      var html = ui.header() +
        '<div class="admin-bar">' +
          '<div class="admin-bar-inner">' +
            '<div><h2 class="admin-title">Anfragen</h2>' +
            '<div class="admin-sub">' + rows.length + ' gesamt · lokal gespeichert (LocalStorage)</div></div>' +
            '<a class="btn-primary btn-sm" href="#/form">+ Neue Anfrage</a>' +
          '</div>' +
        '</div>' +
        '<div class="wrap wrap-wide">' +
          '<div class="filters">' + filterBtns + '</div>' +
          '<div class="table-card">' +
            '<table class="tbl">' +
              '<thead><tr>' +
                '<th>ID</th><th>Datum</th><th>Name</th><th>Wunsch</th><th>Paket</th><th>Status</th>' +
              '</tr></thead>' +
              '<tbody>' + rowsHtml + '</tbody>' +
            '</table>' +
          '</div>' +
          '<p class="admin-foot-note">Demo-Tipp: Daten liegen nur in diesem Browser. ' +
            '<button class="link-btn" id="seed-btn">Beispieldaten laden</button> · ' +
            '<button class="link-btn danger" id="clear-btn">Alle löschen</button></p>' +
        '</div>' +
        ui.footer();

      ui.render(html);

      // Events
      document.querySelectorAll('.filter-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          activeFilter = this.getAttribute('data-filter');
          list();
        });
      });
      document.querySelectorAll('tr[data-id]').forEach(function (tr) {
        tr.addEventListener('click', function () {
          router.navigate('/admin/' + this.getAttribute('data-id'));
        });
      });
      var seed = document.getElementById('seed-btn');
      if (seed) seed.addEventListener('click', function () {
        seedDemo().then(list);
      });
      var clear = document.getElementById('clear-btn');
      if (clear) clear.addEventListener('click', function () {
        if (confirm('Wirklich alle Anfragen löschen?')) {
          clearAll().then(function () { activeFilter = 'Alle'; list(); });
        }
      });
    });
  }

  function rowHtml(r) {
    var v = r.values;
    var wunsch = v.modell ? v.modell : (Array.isArray(v.stil) ? v.stil.join(', ') : v.stil || '–');
    return '' +
      '<tr data-id="' + ui.esc(r.id) + '">' +
        '<td class="mono">' + ui.esc(r.id) + '</td>' +
        '<td>' + ui.esc(ui.formatDate(r.createdAt)) + '</td>' +
        '<td>' + ui.esc(v.vorname + ' ' + v.nachname) + '</td>' +
        '<td class="muted-cell">' + ui.esc(wunsch) + '</td>' +
        '<td>' + ui.esc(v.paket || '–') + '</td>' +
        '<td>' + ui.statusBadge(r.status) + '</td>' +
      '</tr>';
  }

  // ---------- DETAIL ----------
  function detail(params) {
    store.get(params.id).then(function (rec) {
      if (!rec) {
        ui.render(ui.header() + '<div class="wrap"><div class="sec"><p>Anfrage nicht gefunden.</p>' +
          '<a class="btn-ghost" href="#/admin">← Zurück</a></div></div>' + ui.footer());
        return;
      }
      var v = rec.values;

      var statusOpts = cfg.STATUSES.map(function (s) {
        return '<option value="' + ui.esc(s) + '"' + (s === rec.status ? ' selected' : '') + '>' + ui.esc(s) + '</option>';
      }).join('');

      var html = ui.header() +
        '<div class="admin-bar">' +
          '<div class="admin-bar-inner">' +
            '<div>' +
              '<a class="back-link" href="#/admin">← Alle Anfragen</a>' +
              '<h2 class="admin-title">' + ui.esc(v.vorname + ' ' + v.nachname) + '</h2>' +
              '<div class="admin-sub mono">' + ui.esc(rec.id) + ' · ' + ui.esc(ui.formatDate(rec.createdAt)) + '</div>' +
            '</div>' +
            '<a class="btn-primary btn-sm" href="#/report/' + ui.esc(rec.id) + '">Report ansehen →</a>' +
          '</div>' +
        '</div>' +

        '<div class="wrap wrap-wide">' +
          '<div class="detail-grid">' +

            '<div class="detail-main">' +
              dataBlock('Kontakt', [
                ['Vorname', v.vorname], ['Nachname', v.nachname],
                ['E-Mail', v.email], ['Telefon', v.telefon || '–'],
                ['Land', v.landLabel || v.land], ['Region', v.region]
              ]) +
              dataBlock('Führerausweis & Erfahrung', [
                ['Führerausweis', v.ausweis], ['Erfahrung', v.erfahrung || '–']
              ]) +
              dataBlock('Wunsch-Motorrad', [
                ['Stil', Array.isArray(v.stil) ? v.stil.join(', ') : v.stil],
                ['Modell', v.modell || '–'],
                ['Budget', budgetText(v)],
                ['Baujahr ab', v.baujahr || '–'],
                ['Max. km', v.km || '–'],
                ['Nutzung', v.nutzung || '–'],
                ['Prioritäten', v.prioritaeten || '–']
              ]) +
            '</div>' +

            '<aside class="detail-side">' +
              '<div class="side-card">' +
                '<div class="side-card-head">Status</div>' +
                '<div class="current-status">' + ui.statusBadge(rec.status) + '</div>' +
                '<div class="sel-wrap"><select id="status-sel">' + statusOpts + '</select></div>' +
                '<div class="side-saved" id="status-saved">✓ Gespeichert</div>' +
              '</div>' +
              '<div class="side-card">' +
                '<div class="side-card-head">Paket</div>' +
                '<div class="side-pkg">' + ui.esc(v.paket || '–') + '</div>' +
              '</div>' +
              '<div class="side-card">' +
                '<div class="side-card-head">Aktionen</div>' +
                '<a class="btn-ghost btn-block" href="#/report/' + ui.esc(rec.id) + '">Report-Mockup öffnen</a>' +
                '<a class="btn-ghost btn-block" href="mailto:' + ui.esc(v.email) + '">E-Mail an Kunde</a>' +
                '<button class="btn-ghost btn-block danger" id="del-btn">Anfrage löschen</button>' +
              '</div>' +
            '</aside>' +

          '</div>' +
        '</div>' +
        ui.footer();

      ui.render(html);

      var sel = document.getElementById('status-sel');
      sel.addEventListener('change', function () {
        store.updateStatus(rec.id, this.value).then(function () {
          var saved = document.getElementById('status-saved');
          // Badge im Header der Statuskarte aktualisieren
          var cur = document.querySelector('.current-status');
          if (cur) cur.innerHTML = ui.statusBadge(sel.value);
          saved.classList.add('show');
          setTimeout(function () { saved.classList.remove('show'); }, 1600);
        });
      });
      document.getElementById('del-btn').addEventListener('click', function () {
        if (confirm('Diese Anfrage wirklich löschen?')) {
          store.remove(rec.id).then(function () { router.navigate('/admin'); });
        }
      });
    });
  }

  function budgetText(v) {
    if (!v.budget_von && !v.budget_bis) return '–';
    var cur = v.waehrung || 'CHF';
    return cur + ' ' + (v.budget_von || '?') + ' – ' + cur + ' ' + (v.budget_bis || '?');
  }

  function dataBlock(title, pairs) {
    var rows = pairs.map(function (p) {
      return '<div class="dl-row"><dt>' + ui.esc(p[0]) + '</dt><dd>' + ui.esc(p[1]) + '</dd></div>';
    }).join('');
    return '<div class="data-block"><div class="data-block-head">' + ui.esc(title) + '</div><dl class="dl">' + rows + '</dl></div>';
  }

  // ---------- Demo-Helfer ----------
  function seedDemo() {
    var samples = [
      { vorname: 'Lena', nachname: 'Berger', email: 'lena.berger@example.ch', telefon: '+41 79 222 11 33', land: 'CH', landLabel: 'Schweiz', region: 'Zürich', ausweis: 'A2 (max. 35 kW)', erfahrung: 'Anfänger — erstes Motorrad', stil: ['Naked Bike'], modell: 'Yamaha MT-07', budget_von: '5000', budget_bis: '8000', waehrung: 'CHF', baujahr: '2019', km: "30'000 km", nutzung: 'Pendeln / Alltag', prioritaeten: 'MFK frisch, Serviceheft, privater Verkäufer', paket: 'Scout' },
      { vorname: 'Marco', nachname: 'Frei', email: 'marco.frei@example.ch', telefon: '', land: 'CH', landLabel: 'Schweiz', region: 'Bern', ausweis: 'A (unbeschränkt)', erfahrung: 'Erfahren', stil: ['Enduro / Adventure', 'Touring'], modell: '', budget_von: '8000', budget_bis: '12000', waehrung: 'CHF', baujahr: '2017', km: "50'000 km", nutzung: 'Längere Touren', prioritaeten: 'Koffersystem, Kettenkit neu', paket: 'Premium' },
      { vorname: 'Sara', nachname: 'Hofer', email: 'sara.hofer@example.de', telefon: '+49 151 99887766', land: 'DE', landLabel: 'Deutschland', region: 'Bayern', ausweis: 'A1 (max. 11 kW)', erfahrung: 'Einige Jahre', stil: ['Scrambler / Retro'], modell: 'Honda CB125R', budget_von: '2000', budget_bis: '4000', waehrung: 'EUR', baujahr: '2021', km: "10'000 km", nutzung: 'Wochenende / Spass', prioritaeten: 'Optik wichtig, keine Stürze', paket: 'Quick-Check' }
    ];
    return Promise.all(samples.map(function (s) { return store.create(s); }));
  }

  function clearAll() {
    return store.list().then(function (rows) {
      return Promise.all(rows.map(function (r) { return store.remove(r.id); }));
    });
  }

  global.TDS = global.TDS || {};
  global.TDS.views = global.TDS.views || {};
  global.TDS.views.adminList = list;
  global.TDS.views.adminDetail = detail;
})(window);
