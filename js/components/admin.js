/*
 * components/admin.js — Admin-Bereich.
 *   #/admin       -> Dashboard (KPIs + Charts) + durchsuchbare Liste
 *   #/admin/:id   -> Detailansicht: Stammdaten, Status, Notizen, Historie
 *
 * Hinweis: Kein Login (MVP). Auth-Guard-Stelle ist in app.js markiert.
 */
(function (global) {
  'use strict';

  var ui = global.TDS.ui;
  var cfg = global.TDS.config;
  var store = global.TDS.store;
  var router = global.TDS.router;
  var charts = global.TDS.charts;
  var fmt = global.TDS.format;
  var toast = global.TDS.toast;

  // Tabellenzustand (in-memory)
  var PAGE = 8;
  var state = { q: '', status: 'Alle', sort: 'date-desc', limit: PAGE };
  var allRows = [];

  function $(id) { return global.document.getElementById(id); }

  /* ============== LISTE / DASHBOARD ============== */
  function list() {
    Promise.all([store.list(), store.stats()]).then(function (res) {
      allRows = res[0];
      var stats = res[1];

      var html = '' +
        '<div class="admin-bar">' +
          '<div class="admin-bar-inner">' +
            '<div><h2 class="admin-title">Dashboard</h2>' +
            '<div class="admin-sub">' + stats.total + ' Anfragen · lokal gespeichert</div></div>' +
            '<a class="btn-primary btn-sm" href="#/form">+ Neue Anfrage</a>' +
          '</div>' +
        '</div>' +

        '<div class="wrap wrap-wide">' +
          dashboardHtml(stats) +

          '<div class="toolbar">' +
            '<input type="search" id="search" class="search-input" placeholder="Suche: Name, E-Mail, Modell, ID …" value="' + ui.esc(state.q) + '">' +
            '<div class="sel-wrap toolbar-sort"><select id="sort">' +
              sortOpt('date-desc', 'Neueste zuerst') + sortOpt('date-asc', 'Älteste zuerst') +
              sortOpt('name-asc', 'Name A–Z') + sortOpt('status-asc', 'Status') +
            '</select></div>' +
          '</div>' +

          '<div class="filters" id="filters">' + filterBtns(stats) + '</div>' +

          '<div class="table-card">' +
            '<table class="tbl"><thead><tr>' +
              '<th scope="col">ID</th>' +
              th('Datum', 'date') + th('Name', 'name') +
              '<th scope="col">Region</th><th scope="col">Wunsch</th><th scope="col">Paket</th>' +
              th('Status', 'status') +
            '</tr></thead><tbody id="tbody"></tbody></table>' +
            '<div class="table-more" id="table-more"></div>' +
          '</div>' +

          '<div class="admin-tools">' +
            '<button class="btn-ghost btn-sm" id="seed-btn">Beispieldaten laden</button>' +
            '<button class="btn-ghost btn-sm" id="csv-btn">CSV exportieren</button>' +
            '<button class="btn-ghost btn-sm" id="json-btn">JSON exportieren</button>' +
            '<button class="btn-ghost btn-sm" id="import-btn">JSON importieren</button>' +
            '<button class="btn-ghost btn-sm danger" id="clear-btn">Alle löschen</button>' +
            '<input type="file" id="import-file" accept="application/json,.json" hidden>' +
          '</div>' +
        '</div>' +
        '';

      ui.render(html);
      refreshTable();
      wireList();
    });
  }

  function dashboardHtml(s) {
    var segments = cfg.STATUSES.map(function (st) {
      return { label: st, value: s.byStatus[st] || 0, color: cfg.STATUS_COLORS[st] };
    });
    var legend = segments.map(function (seg) {
      return '<div class="legend-row"><span class="legend-dot" style="background:' + seg.color + '"></span>' +
        ui.esc(seg.label) + '<span class="legend-val">' + seg.value + '</span></div>';
    }).join('');

    var pkgBars = Object.keys(s.byPackage).map(function (k) {
      return { label: k, value: s.byPackage[k] };
    });
    var countryBars = Object.keys(s.byCountry).map(function (k) {
      return { label: k, value: s.byCountry[k] };
    }).sort(function (a, b) { return b.value - a.value; });

    return '<div class="dash-grid">' +
        kpi('Anfragen gesamt', s.total, '') +
        kpi('Neu (7 Tage)', s.last7, 'frisch') +
        kpi('Offen', s.open, 'in Bearbeitung') +
        kpi('Conversion', fmt.pct(s.conversion), 'Report/abgeschlossen') +
        kpi('Ø Budget', fmt.money(s.avgBudget, 'CHF'), 'Mittelwert') +
      '</div>' +
      '<div class="dash-charts">' +
        '<div class="chart-card">' +
          '<div class="chart-card-head">Status-Verteilung</div>' +
          '<div class="donut-wrap">' +
            charts.donut(segments, { center: s.total, centerSub: 'Anfragen' }) +
            '<div class="legend">' + legend + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="chart-card">' +
          '<div class="chart-card-head">Pakete</div>' +
          (pkgBars.length ? charts.bars(pkgBars) : '<div class="muted-cell">Noch keine Daten.</div>') +
        '</div>' +
      '</div>' +
      '<div class="dash-charts">' +
        '<div class="chart-card">' +
          '<div class="chart-card-head">Länder</div>' +
          (countryBars.length ? charts.bars(countryBars) : '<div class="muted-cell">Noch keine Daten.</div>') +
        '</div>' +
        '<div class="chart-card">' +
          '<div class="chart-card-head">Letzte Aktivität</div>' +
          recentHtml() +
        '</div>' +
      '</div>';
  }

  function recentHtml() {
    if (!allRows.length) return '<div class="muted-cell">Noch keine Anfragen.</div>';
    return '<div class="recent-list">' + allRows.slice(0, 5).map(function (r) {
      var v = r.values;
      return '<a class="recent-item" href="#/admin/' + ui.esc(r.id) + '">' +
        '<span class="recent-name">' + ui.esc(v.vorname + ' ' + v.nachname) + '</span>' +
        ui.statusBadge(r.status) +
        '<span class="recent-time">' + ui.esc(fmt.relative(r.updatedAt || r.createdAt)) + '</span>' +
        '</a>';
    }).join('') + '</div>';
  }

  function kpi(label, value, sub) {
    var valHtml = (typeof value === 'number')
      ? '<div class="kpi-val" data-count="' + value + '">0</div>'
      : '<div class="kpi-val">' + ui.esc(value) + '</div>';
    return '<div class="kpi">' + valHtml +
      '<div class="kpi-label">' + ui.esc(label) + '</div>' +
      (sub ? '<div class="kpi-sub">' + ui.esc(sub) + '</div>' : '') + '</div>';
  }

  function sortOpt(val, label) {
    return '<option value="' + val + '"' + (state.sort === val ? ' selected' : '') + '>' + ui.esc(label) + '</option>';
  }

  // Sortierbarer Spaltenkopf (klickbar, mit aria-sort)
  function th(label, key) {
    var parts = state.sort.split('-'), active = parts[0] === key;
    var aria = active ? (parts[1] === 'asc' ? 'ascending' : 'descending') : 'none';
    var arrow = active ? (parts[1] === 'asc' ? ' ▲' : ' ▼') : '';
    return '<th scope="col" class="th-sort' + (active ? ' active' : '') + '" data-key="' + key + '" aria-sort="' + aria + '" tabindex="0" role="button">' +
      ui.esc(label) + '<span class="th-arrow">' + arrow + '</span></th>';
  }

  // Spaltenkopf-Klick: gleiche Spalte -> Richtung wechseln, sonst aufsteigend.
  function setSort(key) {
    var parts = state.sort.split('-');
    var dir = (parts[0] === key && parts[1] === 'asc') ? 'desc' : 'asc';
    state.sort = key + '-' + dir;
    state.limit = PAGE;
    var sel = $('sort'); if (sel) sel.value = state.sort; // falls Option existiert
    syncSortHeaders();
    refreshTable();
  }

  // aria-sort / Pfeile an den aktuellen state.sort angleichen.
  function syncSortHeaders() {
    var parts = state.sort.split('-'), key = parts[0], dir = parts[1];
    Array.prototype.forEach.call(global.document.querySelectorAll('.th-sort'), function (el) {
      var on = el.getAttribute('data-key') === key;
      el.classList.toggle('active', on);
      el.setAttribute('aria-sort', on ? (dir === 'asc' ? 'ascending' : 'descending') : 'none');
      var a = el.querySelector('.th-arrow'); if (a) a.textContent = on ? (dir === 'asc' ? ' ▲' : ' ▼') : '';
    });
  }

  function filterBtns(stats) {
    var counts = { Alle: stats.total };
    cfg.STATUSES.forEach(function (s) { counts[s] = stats.byStatus[s] || 0; });
    return ['Alle'].concat(cfg.STATUSES).map(function (s) {
      return '<button class="filter-btn' + (state.status === s ? ' active' : '') +
        '" data-filter="' + ui.esc(s) + '">' + ui.esc(s) +
        ' <span class="filter-count">' + (counts[s] || 0) + '</span></button>';
    }).join('');
  }

  function applyFilters() {
    var rows = allRows.slice();
    if (state.status !== 'Alle') rows = rows.filter(function (r) { return r.status === state.status; });
    if (state.q) {
      var q = state.q.toLowerCase();
      rows = rows.filter(function (r) {
        var v = r.values;
        return [r.id, v.vorname, v.nachname, v.email, v.modell, v.region, v.paket,
          (Array.isArray(v.stil) ? v.stil.join(' ') : v.stil)].join(' ').toLowerCase().indexOf(q) !== -1;
      });
    }
    var parts = state.sort.split('-'), key = parts[0], dir = parts[1] === 'desc' ? -1 : 1;
    rows.sort(function (a, b) {
      var r;
      if (key === 'name') r = (a.values.nachname || '').localeCompare(b.values.nachname || '');
      else if (key === 'status') r = cfg.STATUSES.indexOf(a.status) - cfg.STATUSES.indexOf(b.status);
      else r = new Date(a.createdAt) - new Date(b.createdAt);
      return r * dir;
    });
    return rows;
  }

  function refreshTable() {
    var rows = applyFilters();
    var tbody = $('tbody');
    var more = $('table-more');
    if (more) more.innerHTML = '';
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="empty-row">Keine Treffer. ' +
        '<a href="#/form">Neue Anfrage erstellen →</a></td></tr>';
      return;
    }
    var shown = rows.slice(0, state.limit);
    tbody.innerHTML = shown.map(rowHtml).join('');
    if (more && rows.length > state.limit) {
      more.innerHTML = '<button class="btn-ghost btn-sm" id="more-btn">Weitere ' +
        Math.min(PAGE, rows.length - state.limit) + ' von ' + rows.length + ' anzeigen</button>';
      $('more-btn').addEventListener('click', function () { state.limit += PAGE; refreshTable(); });
    }
    // Klicks werden delegiert (siehe wireList) — kein Listener pro Zeile.
  }

  function rowHtml(r) {
    var v = r.values;
    var wunsch = v.modell ? v.modell : (Array.isArray(v.stil) ? v.stil.join(', ') : v.stil || '–');
    return '<tr data-id="' + ui.esc(r.id) + '">' +
      '<td class="mono">' + ui.esc(r.id) + '</td>' +
      '<td>' + ui.esc(fmt.dateShort(r.createdAt)) + '</td>' +
      '<td>' + ui.esc(v.vorname + ' ' + v.nachname) + '</td>' +
      '<td class="muted-cell">' + ui.esc(v.region || '–') + '</td>' +
      '<td class="muted-cell">' + ui.esc(wunsch) + '</td>' +
      '<td>' + ui.esc(v.paket || '–') + '</td>' +
      '<td>' + ui.statusBadge(r.status) + '</td>' +
      '</tr>';
  }

  function wireList() {
    var search = $('search');
    search.addEventListener('input', global.TDS.dom.debounce(function () { state.q = search.value; state.limit = PAGE; refreshTable(); }, 140));
    $('sort').addEventListener('change', function () { state.sort = this.value; state.limit = PAGE; syncSortHeaders(); refreshTable(); });

    // Sortierbare Spaltenköpfe (Klick + Tastatur)
    Array.prototype.forEach.call(global.document.querySelectorAll('.th-sort'), function (el) {
      el.addEventListener('click', function () { setSort(this.getAttribute('data-key')); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSort(this.getAttribute('data-key')); }
      });
    });

    // Ein delegierter Klick-Listener für alle (auch künftige) Tabellenzeilen.
    $('tbody').addEventListener('click', function (e) {
      var tr = e.target.closest && e.target.closest('tr[data-id]');
      if (tr) router.navigate('/admin/' + tr.getAttribute('data-id'));
    });

    Array.prototype.forEach.call(global.document.querySelectorAll('.filter-btn'), function (btn) {
      btn.addEventListener('click', function () {
        state.status = this.getAttribute('data-filter');
        state.limit = PAGE;
        Array.prototype.forEach.call(global.document.querySelectorAll('.filter-btn'), function (b) {
          b.classList.toggle('active', b === btn);
        });
        refreshTable();
      });
    });

    $('seed-btn').addEventListener('click', function () {
      seedDemo().then(function () { toast.success('Beispieldaten geladen'); list(); });
    });
    $('csv-btn').addEventListener('click', exportCsv);
    $('json-btn').addEventListener('click', function () {
      store.exportJSON().then(function (json) {
        global.TDS.dom.download('toeffdealscout-export.json', json, 'application/json');
        toast.success('JSON exportiert');
      });
    });
    $('import-btn').addEventListener('click', function () { $('import-file').click(); });
    $('import-file').addEventListener('change', function (e) {
      var file = e.target.files[0]; if (!file) return;
      var reader = new global.FileReader();
      reader.onload = function () {
        store.importJSON(reader.result, 'merge').then(function (r) {
          toast.success('Import: ' + r.imported + ' neu, ' + r.skipped + ' übersprungen');
          list();
        }).catch(function () { toast.error('Import fehlgeschlagen — ungültige Datei.'); });
      };
      reader.readAsText(file);
    });
    $('clear-btn').addEventListener('click', function () {
      if (global.confirm('Wirklich ALLE Anfragen löschen?')) {
        store.clear().then(function (prev) {
          state.status = 'Alle'; state.q = '';
          toast.info((prev.length) + ' Anfragen gelöscht', { action: { label: 'Rückgängig', fn: function () {
            store.restoreMany(prev).then(function () { toast.success('Wiederhergestellt'); list(); });
          } } });
          list();
        });
      }
    });
  }

  /* ============== DETAIL ============== */
  function detail(params) {
    store.get(params.id).then(function (rec) {
      if (!rec) return notFound();
      var v = rec.values;

      var statusOpts = cfg.STATUSES.map(function (s) {
        return '<option value="' + ui.esc(s) + '"' + (s === rec.status ? ' selected' : '') + '>' + ui.esc(s) + '</option>';
      }).join('');
      var nextStatus = cfg.STATUSES[cfg.STATUSES.indexOf(rec.status) + 1] || null;

      var html = '' +
        '<div class="admin-bar"><div class="admin-bar-inner">' +
          '<div><a class="back-link" href="#/admin">← Dashboard</a>' +
            '<h2 class="admin-title">' + ui.esc(v.vorname + ' ' + v.nachname) + '</h2>' +
            '<div class="admin-sub mono">' + ui.esc(rec.id) + ' · ' + ui.esc(fmt.date(rec.createdAt)) + '</div></div>' +
          '<a class="btn-primary btn-sm" href="#/report/' + ui.esc(rec.id) + '">Report ansehen →</a>' +
        '</div></div>' +

        '<div class="wrap wrap-wide"><div class="detail-grid">' +
          '<div class="detail-main">' +
            dataBlock('Kontakt', [
              ['Vorname', v.vorname], ['Nachname', v.nachname], ['E-Mail', v.email],
              ['Telefon', v.telefon || '–'], ['Land', v.landLabel || v.land], ['Region', v.region]
            ]) +
            dataBlock('Führerausweis & Erfahrung', [
              ['Führerausweis', v.ausweis], ['Erfahrung', v.erfahrung || '–']
            ]) +
            dataBlock('Wunsch-Motorrad', [
              ['Stil', Array.isArray(v.stil) ? v.stil.join(', ') : v.stil],
              ['Modell', v.modell || '–'], ['Budget', budgetText(v)],
              ['Baujahr ab', v.baujahr || '–'], ['Max. km', v.km || '–'],
              ['Nutzung', v.nutzung || '–'], ['Prioritäten', v.prioritaeten || '–']
            ]) +
            notesBlock(rec) +
          '</div>' +

          '<aside class="detail-side">' +
            '<div class="side-card">' +
              '<div class="side-card-head">Status</div>' +
              '<div class="current-status">' + ui.statusBadge(rec.status) + '</div>' +
              '<div class="sel-wrap"><select id="status-sel">' + statusOpts + '</select></div>' +
              (nextStatus ? '<button class="btn-ghost btn-sm btn-block" id="advance-btn" style="margin-top:8px">Weiter zu „' + ui.esc(nextStatus) + '" →</button>' : '') +
              '<div class="side-saved" id="status-saved">✓ Gespeichert</div>' +
            '</div>' +
            '<div class="side-card">' +
              '<div class="side-card-head">Paket</div>' +
              '<div class="side-pkg">' + ui.esc(v.paket || '–') + '</div>' +
            '</div>' +
            historyBlock(rec) +
            '<div class="side-card">' +
              '<div class="side-card-head">Aktionen</div>' +
              '<a class="btn-ghost btn-block" href="#/report/' + ui.esc(rec.id) + '">Report-Mockup öffnen</a>' +
              '<a class="btn-ghost btn-block" href="mailto:' + ui.esc(v.email) + '">E-Mail an Kunde</a>' +
              '<button class="btn-ghost btn-block danger" id="del-btn">Anfrage löschen</button>' +
            '</div>' +
          '</aside>' +
        '</div></div>' +
        '';

      ui.render(html);
      wireDetail(rec);
    });
  }

  function notesBlock(rec) {
    var items = (rec.notes || []).slice().reverse().map(function (n) {
      return '<div class="note-item"><div class="note-meta">' + ui.esc(fmt.relative(n.at)) + '</div>' +
        '<div class="note-text">' + ui.esc(n.text) + '</div></div>';
    }).join('');
    return '<div class="data-block">' +
      '<div class="data-block-head">Interne Notizen</div>' +
      '<div class="note-add">' +
        '<textarea id="note-input" placeholder="Notiz hinzufügen (nur intern sichtbar) …"></textarea>' +
        '<button class="btn-ghost btn-sm" id="note-btn">Notiz speichern</button>' +
      '</div>' +
      '<div class="note-list">' + (items || '<div class="muted-cell">Noch keine Notizen.</div>') + '</div>' +
      '</div>';
  }

  function historyBlock(rec) {
    var items = (rec.history || []).slice().reverse().map(function (h) {
      return '<div class="tl-item"><span class="tl-dot" style="background:' + (cfg.STATUS_COLORS[h.status] || 'var(--accent)') + '"></span>' +
        '<div><div class="tl-status">' + ui.esc(h.status) + '</div>' +
        '<div class="tl-time">' + ui.esc(fmt.date(h.at)) + '</div></div></div>';
    }).join('');
    return '<div class="side-card"><div class="side-card-head">Verlauf</div>' +
      '<div class="timeline">' + items + '</div></div>';
  }

  function wireDetail(rec) {
    var sel = $('status-sel');
    sel.addEventListener('change', function () {
      store.updateStatus(rec.id, this.value).then(function () {
        var cur = global.document.querySelector('.current-status');
        if (cur) cur.innerHTML = ui.statusBadge(sel.value);
        var saved = $('status-saved');
        saved.classList.add('show');
        setTimeout(function () { saved.classList.remove('show'); }, 1600);
        if (toast) toast.success('Status: ' + sel.value);
        detail({ id: rec.id }); // Verlauf aktualisieren
      });
    });
    var adv = $('advance-btn');
    if (adv) adv.addEventListener('click', function () {
      var next = cfg.STATUSES[cfg.STATUSES.indexOf(rec.status) + 1];
      if (!next) return;
      store.updateStatus(rec.id, next).then(function () {
        if (toast) toast.success('Status: ' + next);
        detail({ id: rec.id });
      });
    });
    $('note-btn').addEventListener('click', function () {
      var input = $('note-input');
      var text = (input.value || '').trim();
      if (!text) { input.focus(); return; }
      store.addNote(rec.id, text).then(function () {
        if (toast) toast.success('Notiz gespeichert');
        detail({ id: rec.id });
      });
    });
    $('del-btn').addEventListener('click', function () {
      if (global.confirm('Diese Anfrage wirklich löschen?')) {
        store.remove(rec.id).then(function (removed) {
          if (toast) toast.info('Anfrage gelöscht', { action: { label: 'Rückgängig', fn: function () {
            store.restore(removed).then(function () { toast.success('Wiederhergestellt'); detail({ id: removed.id }); });
          } } });
          router.navigate('/admin');
        });
      }
    });
  }

  /* ============== Helfer ============== */
  function notFound() {
    ui.render('' + '<div class="wrap"><div class="sec"><p>Anfrage nicht gefunden.</p>' +
      '<a class="btn-ghost" href="#/admin">← Zurück</a></div></div>' + '');
  }

  function budgetText(v) {
    if (!v.budget_von && !v.budget_bis) return '–';
    var cur = v.waehrung || 'CHF';
    return fmt.money(v.budget_von, cur) + ' – ' + fmt.money(v.budget_bis, cur);
  }

  function dataBlock(title, pairs) {
    var rows = pairs.map(function (p) {
      return '<div class="dl-row"><dt>' + ui.esc(p[0]) + '</dt><dd>' + ui.esc(p[1]) + '</dd></div>';
    }).join('');
    return '<div class="data-block"><div class="data-block-head">' + ui.esc(title) + '</div><dl class="dl">' + rows + '</dl></div>';
  }

  /* ---- Export / Demo ---- */
  function csvCell(s) {
    s = (s == null ? '' : String(s));
    return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function exportCsv() {
    var cols = ['ID', 'Datum', 'Vorname', 'Nachname', 'E-Mail', 'Telefon', 'Land', 'Region',
      'Ausweis', 'Erfahrung', 'Stil', 'Modell', 'Budget von', 'Budget bis', 'Währung',
      'Baujahr ab', 'Max km', 'Nutzung', 'Prioritäten', 'Paket', 'Status'];
    var lines = [cols.map(csvCell).join(';')];
    allRows.forEach(function (r) {
      var v = r.values;
      lines.push([r.id, fmt.date(r.createdAt), v.vorname, v.nachname, v.email, v.telefon,
        v.landLabel || v.land, v.region, v.ausweis, v.erfahrung,
        (Array.isArray(v.stil) ? v.stil.join(', ') : v.stil), v.modell,
        v.budget_von, v.budget_bis, v.waehrung, v.baujahr, v.km, v.nutzung,
        v.prioritaeten, v.paket, r.status].map(csvCell).join(';'));
    });
    global.TDS.dom.download('toeffdealscout-anfragen.csv', '﻿' + lines.join('\r\n'), 'text/csv;charset=utf-8');
    toast.success('CSV exportiert (' + allRows.length + ' Zeilen)');
  }

  function seedDemo() {
    var samples = global.TDS.data.demo.samples();
    return Promise.all(samples.map(function (s) { return store.create(s); }));
  }

  global.TDS = global.TDS || {};
  global.TDS.views = global.TDS.views || {};
  global.TDS.views.adminList = list;
  global.TDS.views.adminDetail = detail;
})(window);
