/*
 * form.js — Suchanfrage-Formular.
 * Übernimmt Felder, Design und Validierung aus der Original-HTML und
 * speichert die Anfrage bei Erfolg über den Store (LocalStorage).
 */
(function (global) {
  'use strict';

  var ui = global.TDS.ui;
  var cfg = global.TDS.config;
  var store = global.TDS.store;
  var router = global.TDS.router;

  function packageCardsHtml() {
    return cfg.PACKAGES.map(function (p) {
      var feats = p.feats.map(function (f) {
        return '<li class="pkg-feat">' + ui.esc(f) + '</li>';
      }).join('');
      return '' +
        '<div class="pkg-wrap">' +
          '<input type="radio" name="paket" id="pkg-' + p.id + '" value="' + ui.esc(p.id) + '"' + (p.recommended ? ' checked' : '') + '>' +
          '<label class="pkg-card" for="pkg-' + p.id + '">' +
            (p.badge ? '<div class="pkg-badge">' + ui.esc(p.badge) + '</div>' : '') +
            '<div class="pkg-name">' + ui.esc(p.name) + '</div>' +
            '<div class="pkg-price"><sub class="pkg-cur">CHF </sub><span>' + ui.esc(p.price.CHF) + '</span></div>' +
            '<div class="pkg-sub">' + ui.esc(p.sub) + '</div>' +
            '<ul class="pkg-feats">' + feats + '</ul>' +
          '</label>' +
        '</div>';
    }).join('');
  }

  function view() {
    var html = '' +
      '<div class="hero hero-sm">' +
        '<div class="hero-eye">Suchanfrage</div>' +
        '<h1>Erzähl uns von deinem Wunsch-Töff</h1>' +
        '<p>Je genauer, desto besser der Report. Dauert ~2 Minuten — kein Konto nötig. Pflichtfelder sind mit <span style="color:var(--accent)">*</span> markiert.</p>' +
      '</div>' +

      '<div class="wrap">' +
      '<div id="draft-banner"></div>' +
      '<div class="form-progress" aria-hidden="true">' +
        '<div class="fp-bar"><span id="fp-fill" style="width:0"></span></div>' +
        '<div class="fp-label" id="fp-label">0 % ausgefüllt</div>' +
      '</div>' +
      '<form id="frm" novalidate>' +

        '<div id="form-errors" class="form-errors" role="alert" tabindex="-1" hidden></div>' +

        // SEKTION 1: KONTAKT
        '<div class="sec">' +
          '<div class="sec-head">Deine Angaben</div>' +
          '<div class="row2">' +
            field('vorname', 'Vorname', true, '<input type="text" id="vorname" name="vorname" placeholder="Max" autocomplete="given-name">', 'Bitte Vorname eingeben.') +
            field('nachname', 'Nachname', true, '<input type="text" id="nachname" name="nachname" placeholder="Muster" autocomplete="family-name">', 'Bitte Nachname eingeben.') +
          '</div>' +
          field('email', 'E-Mail', true, '<input type="email" id="email" name="email" placeholder="max@muster.com" autocomplete="email">', 'Bitte eine gültige E-Mail-Adresse eingeben.') +
          field('telefon', 'Telefon / WhatsApp', false, '<input type="tel" id="telefon" name="telefon" placeholder="+41 79 123 45 67" autocomplete="tel">', '', 'optional') +
          '<div class="row2">' +
            field('land', 'Land', true,
              '<div class="sel-wrap"><select id="land" name="land">' +
                '<option value="">Land wählen</option>' +
                '<option value="CH">Schweiz</option>' +
                '<option value="DE">Deutschland</option>' +
                '<option value="AT">Österreich</option>' +
                '<option value="LI">Liechtenstein</option>' +
              '</select></div>', 'Bitte Land auswählen.') +
            field('region', 'Region', true,
              '<div class="sel-wrap"><select id="region" name="region"><option value="">Zuerst Land wählen</option></select></div>',
              'Bitte Region auswählen.', '', '<div class="hint-text" id="quellen-hint"></div>') +
          '</div>' +
        '</div>' +

        // SEKTION 2: FÜHRERSCHEIN
        '<div class="sec">' +
          '<div class="sec-head">Führerausweis &amp; Erfahrung</div>' +
          '<div class="field">' +
            '<label class="lbl" id="lbl-ausweis">Führerausweis <span class="req">*</span></label>' +
            '<div class="chips" id="chips-ausweis" role="radiogroup" aria-labelledby="lbl-ausweis">' +
              chip('radio', 'ausweis', 'A (unbeschränkt)') +
              chip('radio', 'ausweis', 'A2 (max. 35 kW)') +
              chip('radio', 'ausweis', 'A1 (max. 11 kW)') +
              chip('radio', 'ausweis', 'Nur B') +
              chip('radio', 'ausweis', 'Noch keinen') +
            '</div>' +
            '<div class="err-msg" id="e-ausweis">Bitte Führerausweis auswählen.</div>' +
          '</div>' +
          '<div class="field">' +
            '<label class="lbl">Erfahrung <span class="opt">optional</span></label>' +
            '<div class="chips">' +
              chip('radio', 'erfahrung', 'Anfänger — erstes Motorrad', 'Anfänger') +
              chip('radio', 'erfahrung', 'Einige Jahre') +
              chip('radio', 'erfahrung', 'Erfahren') +
            '</div>' +
          '</div>' +
        '</div>' +

        // SEKTION 3: WUNSCH-MOTORRAD
        '<div class="sec">' +
          '<div class="sec-head">Dein Wunsch-Motorrad</div>' +
          '<div class="field">' +
            '<label class="lbl" id="lbl-stil">Stil <span class="req">*</span> <span class="opt">Mehrfachauswahl möglich</span></label>' +
            '<div class="chips" id="chips-stil" role="group" aria-labelledby="lbl-stil">' +
              chip('checkbox', 'stil', 'Naked Bike') +
              chip('checkbox', 'stil', 'Sportmotorrad') +
              chip('checkbox', 'stil', 'Scrambler / Retro') +
              chip('checkbox', 'stil', 'Enduro / Adventure') +
              chip('checkbox', 'stil', 'Touring') +
              chip('checkbox', 'stil', 'Egal — bestes P/L') +
            '</div>' +
            '<div class="err-msg" id="e-stil">Bitte mindestens einen Stil auswählen.</div>' +
          '</div>' +
          field('modell', 'Bestimmtes Modell', false, '<input type="text" id="modell" name="modell" placeholder="z.B. Honda CB500F, Yamaha MT-07 …">', '', 'optional') +
          '<div class="field">' +
            '<label class="lbl">Budget <span class="req">*</span></label>' +
            '<div class="row2">' +
              '<div><div class="mini-lbl">Von</div><div class="sel-wrap"><select id="budget-von" name="budget_von"></select></div></div>' +
              '<div><div class="mini-lbl">Bis</div><div class="sel-wrap"><select id="budget-bis" name="budget_bis"></select></div></div>' +
            '</div>' +
            '<div class="err-msg" id="e-budget">Bitte Budget auswählen.</div>' +
          '</div>' +
          '<div class="row2">' +
            field('baujahr', 'Baujahr ab', false,
              '<div class="sel-wrap"><select id="baujahr" name="baujahr">' +
                '<option value="">Keine Präferenz</option>' +
                '<option>2023</option><option>2021</option><option>2019</option>' +
                '<option>2017</option><option>2015</option><option>2012</option>' +
                '<option>2010</option><option>Egal</option>' +
              '</select></div>', '', 'optional') +
            field('km', 'Max. Kilometerstand', false,
              '<div class="sel-wrap"><select id="km" name="km">' +
                '<option value="">Keine Präferenz</option>' +
                "<option>10'000 km</option><option>20'000 km</option>" +
                "<option>30'000 km</option><option>40'000 km</option>" +
                "<option>50'000 km</option><option>Egal</option>" +
              '</select></div>', '', 'optional') +
          '</div>' +
          '<div class="field">' +
            '<label class="lbl">Hauptnutzung <span class="opt">optional</span></label>' +
            '<div class="chips">' +
              chip('radio', 'nutzung', 'Pendeln / Alltag') +
              chip('radio', 'nutzung', 'Wochenende / Spass', 'Wochenende') +
              chip('radio', 'nutzung', 'Längere Touren', 'Touren') +
              chip('radio', 'nutzung', 'Gemischt') +
            '</div>' +
          '</div>' +
          field('prioritaeten', 'Worauf legst du am meisten Wert?', false,
            '<textarea id="prioritaeten" name="prioritaeten" placeholder="z.B. MFK frisch, Serviceheft vorhanden, keine Sturzschäden, privater Verkäufer bevorzugt …"></textarea>', '', 'optional') +
        '</div>' +

        // SEKTION 4: PAKET
        '<div class="sec">' +
          '<div class="sec-head">Paket wählen <span style="font-weight:400;color:var(--err);"> *</span></div>' +
          '<div class="pkg-grid">' + packageCardsHtml() + '</div>' +
          '<div class="err-msg" id="e-paket" style="margin-top:8px;">Bitte ein Paket auswählen.</div>' +
        '</div>' +

        // SUBMIT
        '<div class="submit-area">' +
          '<button type="submit" class="btn-submit" id="submit-btn">Anfrage absenden →</button>' +
          '<div class="submit-note">' +
            'Nach dem Absenden erhältst du einen <strong id="payment-hint">Zahlungslink</strong> (Demo).<br>' +
            'Der Report wird innerhalb von 24h nach Zahlungseingang geliefert.<br>' +
            '<span style="font-size:10px;margin-top:4px;display:block;">Demo: Deine Daten werden nur lokal im Browser gespeichert.</span>' +
          '</div>' +
        '</div>' +

      '</form>' +
      '</div>' +
      '';

    ui.render(html);
    wire();
  }

  // ---- kleine HTML-Helfer ----
  function field(id, label, required, control, errMsg, optTag, extra) {
    return '' +
      '<div class="field">' +
        '<label class="lbl" for="' + id + '">' + ui.esc(label) +
          (required ? ' <span class="req">*</span>' : '') +
          (optTag ? ' <span class="opt">' + ui.esc(optTag) + '</span>' : '') +
        '</label>' +
        control +
        (errMsg ? '<div class="err-msg" id="e-' + id + '">' + ui.esc(errMsg) + '</div>' : '') +
        (extra || '') +
      '</div>';
  }

  function chip(type, name, value, label) {
    var id = name + '-' + value.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    return '' +
      '<div class="chip-wrap">' +
        '<input type="' + type + '" name="' + name + '" id="' + id + '" value="' + ui.esc(value) + '">' +
        '<label for="' + id + '">' + ui.esc(label || value) + '</label>' +
      '</div>';
  }

  // ---- Verhalten ----
  function $(id) { return document.getElementById(id); }

  function fillBudgets(cur) {
    var sep = cur === 'CHF' ? "'" : '.';
    function fmt(n) {
      return cur + ' ' + (n >= 1000 ? Math.floor(n / 1000) + sep + String(n % 1000).padStart(3, '0') : n) + (n === 20000 ? '+' : '');
    }
    var selVon = $('budget-von'), selBis = $('budget-bis');
    var oldVon = selVon.value, oldBis = selBis.value;
    selVon.innerHTML = '<option value="">Von wählen</option>';
    selBis.innerHTML = '<option value="">Bis wählen</option>';
    cfg.BUDGETS.forEach(function (v) {
      var o1 = new Option(fmt(v), v), o2 = new Option(fmt(v), v);
      if (String(v) === oldVon || (!oldVon && v === 4000)) o1.selected = true;
      if (String(v) === oldBis || (!oldBis && v === 8000)) o2.selected = true;
      selVon.add(o1); selBis.add(o2);
    });
  }

  function setCurrency(cur) {
    Array.prototype.forEach.call(document.querySelectorAll('.pkg-cur'), function (el, i) {
      el.textContent = cur + ' ';
      // Preis je nach Währung (hier identisch, aber vorbereitet)
      var span = el.nextElementSibling;
      if (span && cfg.PACKAGES[i]) span.textContent = cfg.PACKAGES[i].price[cur] || cfg.PACKAGES[i].price.CHF;
    });
    var land = $('land').value;
    $('payment-hint').textContent = (land && cfg.REGIONS[land]) ? cfg.REGIONS[land].payment : 'Zahlungslink';
    fillBudgets(cur);
  }

  function clearErr(id) {
    var el = $('e-' + id); if (el) el.classList.remove('show');
    var inp = $(id); if (inp) inp.classList.remove('err');
  }

  function liveCheckBudget() {
    var vonSel = $('budget-von'), bisSel = $('budget-bis');
    var von = parseInt(vonSel.value) || 0;
    var bis = parseInt(bisSel.value) || 0;
    if (von && bis && von >= bis) {
      // Sanfte Autokorrektur: nächsthöhere "Bis"-Option wählen
      var fixed = null;
      Array.prototype.forEach.call(bisSel.options, function (o) {
        var ov = parseInt(o.value) || 0;
        if (fixed === null && ov > von) fixed = o.value;
      });
      if (fixed !== null) { bisSel.value = fixed; clearErr('budget'); }
      else { $('e-budget').textContent = '"Von" muss kleiner sein als "Bis".'; $('e-budget').classList.add('show'); }
    } else {
      clearErr('budget');
    }
  }

  function validate() {
    var errs = [];
    function check(pass, errId, inputId, msg, label) {
      var errEl = $(errId), inp = $(inputId);
      if (!pass) {
        if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); }
        if (inp) { inp.classList.add('err'); inp.setAttribute('aria-invalid', 'true'); }
        errs.push({ id: inputId, label: label || msg });
      } else {
        if (errEl) errEl.classList.remove('show');
        if (inp) { inp.classList.remove('err'); inp.removeAttribute('aria-invalid'); }
      }
    }

    check($('vorname').value.trim() !== '', 'e-vorname', 'vorname', 'Bitte Vorname eingeben.', 'Vorname');
    check($('nachname').value.trim() !== '', 'e-nachname', 'nachname', 'Bitte Nachname eingeben.', 'Nachname');
    check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('email').value.trim()), 'e-email', 'email', 'Bitte eine gültige E-Mail-Adresse eingeben.', 'E-Mail');
    check($('land').value !== '', 'e-land', 'land', 'Bitte Land auswählen.', 'Land');
    check($('region').value !== '', 'e-region', 'region', 'Bitte Region auswählen.', 'Region');

    chipsGroup('ausweis', 'e-ausweis', 'chips-ausweis', 'Bitte Führerausweis auswählen.', 'Führerausweis', errs);
    chipsGroup('stil', 'e-stil', 'chips-stil', 'Bitte mindestens einen Stil auswählen.', 'Stil', errs);

    var von = parseInt($('budget-von').value) || 0;
    var bis = parseInt($('budget-bis').value) || 0;
    if (!von || !bis) {
      setErr('e-budget', 'budget-von', 'Bitte Budget Von und Bis auswählen.'); errs.push({ id: 'budget-von', label: 'Budget' });
    } else if (von >= bis) {
      setErr('e-budget', 'budget-von', '"Von" muss kleiner sein als "Bis".'); errs.push({ id: 'budget-von', label: 'Budget' });
    } else { clearErr('budget'); $('budget-von').classList.remove('err'); }

    if (!document.querySelector('input[name="paket"]:checked')) {
      $('e-paket').classList.add('show'); errs.push({ id: 'pkg-Quick-Check', label: 'Paket' });
    } else { $('e-paket').classList.remove('show'); }

    if (errs.length > 0) { showErrorSummary(errs); return false; }
    clearErrorSummary();
    return true;
  }

  /** Barrierefreie Fehler-Zusammenfassung oben im Formular. */
  function showErrorSummary(errs) {
    var box = $('form-errors');
    if (!box) return;
    var links = errs.map(function (e) {
      return '<li><a href="#' + e.id + '" data-target="' + e.id + '">' + ui.esc(e.label) + '</a></li>';
    }).join('');
    box.innerHTML = '<strong>Bitte korrigiere ' + errs.length + (errs.length === 1 ? ' Angabe' : ' Angaben') + ':</strong>' +
      '<ul>' + links + '</ul>';
    box.hidden = false;
    box.focus();
  }

  function clearErrorSummary() {
    var box = $('form-errors');
    if (box) { box.hidden = true; box.innerHTML = ''; }
  }

  function setErr(errId, inputId, msg) {
    var errEl = $(errId), inp = $(inputId);
    if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); }
    if (inp) inp.classList.add('err');
  }

  function chipsGroup(name, errId, wrapId, msg, label, errs) {
    var ok = document.querySelector('input[name="' + name + '"]:checked') !== null;
    var errEl = $(errId), wrap = $(wrapId);
    if (!ok) {
      if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); }
      if (wrap) { wrap.classList.add('err-chips'); wrap.setAttribute('aria-invalid', 'true'); }
      errs.push({ id: wrapId, label: label });
    } else {
      if (errEl) errEl.classList.remove('show');
      if (wrap) { wrap.classList.remove('err-chips'); wrap.removeAttribute('aria-invalid'); }
    }
  }

  /** Formularwerte einsammeln -> flaches Objekt für den Store. */
  function collect() {
    var stile = [];
    document.querySelectorAll('input[name="stil"]:checked').forEach(function (el) { stile.push(el.value); });
    function radio(name) {
      var el = document.querySelector('input[name="' + name + '"]:checked');
      return el ? el.value : '';
    }
    var land = $('land').value;
    return {
      vorname: $('vorname').value.trim(),
      nachname: $('nachname').value.trim(),
      email: $('email').value.trim(),
      telefon: $('telefon').value.trim(),
      land: land,
      landLabel: ({ CH: 'Schweiz', DE: 'Deutschland', AT: 'Österreich', LI: 'Liechtenstein' })[land] || land,
      region: $('region').value,
      ausweis: radio('ausweis'),
      erfahrung: radio('erfahrung'),
      stil: stile,
      modell: $('modell').value.trim(),
      budget_von: $('budget-von').value,
      budget_bis: $('budget-bis').value,
      waehrung: cfg.currencyFor(land),
      baujahr: $('baujahr').value,
      km: $('km').value,
      nutzung: radio('nutzung'),
      prioritaeten: $('prioritaeten').value.trim(),
      paket: radio('paket')
    };
  }

  /* ---------- Entwurf (Autosave/Resume) ---------- */
  var DRAFT_KEY = 'tds_draft_v1';

  function serializeDraft() {
    var vals = {};
    ['vorname', 'nachname', 'email', 'telefon', 'land', 'region', 'modell',
      'prioritaeten', 'baujahr', 'km', 'budget-von', 'budget-bis'].forEach(function (id) {
      var el = $(id); if (el) vals[id] = el.value;
    });
    var radios = {};
    ['ausweis', 'erfahrung', 'nutzung', 'paket'].forEach(function (name) {
      var el = document.querySelector('input[name="' + name + '"]:checked');
      radios[name] = el ? el.value : '';
    });
    var stil = [];
    document.querySelectorAll('input[name="stil"]:checked').forEach(function (el) { stil.push(el.value); });
    return { vals: vals, radios: radios, stil: stil };
  }

  function draftHasContent(d) {
    return !!(d && d.vals && (d.vals.vorname || d.vals.nachname || d.vals.email || d.vals.modell || (d.stil && d.stil.length)));
  }

  function saveDraft() {
    try {
      var d = serializeDraft();
      if (draftHasContent(d)) {
        global.localStorage.setItem(DRAFT_KEY, JSON.stringify({ at: new Date().toISOString(), data: d }));
      }
    } catch (e) {}
  }

  function loadDraft() {
    try { return JSON.parse(global.localStorage.getItem(DRAFT_KEY) || 'null'); }
    catch (e) { return null; }
  }

  function clearDraft() {
    try { global.localStorage.removeItem(DRAFT_KEY); } catch (e) {}
  }

  function pick(name, value) {
    if (!value) return;
    var el = document.querySelector('input[name="' + name + '"][value="' + value.replace(/"/g, '\\"') + '"]');
    if (el) el.checked = true;
  }

  function applyDraft(d) {
    var v = d.vals || {};
    ['vorname', 'nachname', 'email', 'telefon', 'modell', 'prioritaeten'].forEach(function (id) {
      if ($(id) && v[id] != null) $(id).value = v[id];
    });
    if (v.land) { $('land').value = v.land; $('land').dispatchEvent(new Event('change')); }
    if (v.region && $('region')) $('region').value = v.region;
    if (v['budget-von']) $('budget-von').value = v['budget-von'];
    if (v['budget-bis']) $('budget-bis').value = v['budget-bis'];
    if (v.baujahr && $('baujahr')) $('baujahr').value = v.baujahr;
    if (v.km && $('km')) $('km').value = v.km;
    Object.keys(d.radios || {}).forEach(function (name) { pick(name, d.radios[name]); });
    (d.stil || []).forEach(function (val) { pick('stil', val); });
  }

  function showDraftBanner() {
    var draft = loadDraft();
    if (!draft || !draftHasContent(draft.data)) return;
    var banner = $('draft-banner');
    if (!banner) return;
    banner.innerHTML = '<div class="draft-bar">' +
      '<span>📝 Nicht abgeschickter Entwurf von <strong>' + ui.esc(ui.fmt.relative(draft.at)) + '</strong> gefunden.</span>' +
      '<span class="draft-actions">' +
        '<button type="button" class="btn-mini" id="draft-restore">Wiederherstellen</button>' +
        '<button type="button" class="btn-mini ghost" id="draft-discard">Verwerfen</button>' +
      '</span></div>';
    $('draft-restore').addEventListener('click', function () {
      applyDraft(draft.data); banner.innerHTML = '';
      updateProgress();
      if (global.TDS.toast) global.TDS.toast.info('Entwurf wiederhergestellt');
    });
    $('draft-discard').addEventListener('click', function () {
      clearDraft(); banner.innerHTML = '';
    });
  }

  function progressState() {
    var checks = [
      $('vorname').value.trim() !== '',
      $('nachname').value.trim() !== '',
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('email').value.trim()),
      $('land').value !== '',
      $('region').value !== '',
      !!document.querySelector('input[name="ausweis"]:checked'),
      !!document.querySelector('input[name="stil"]:checked'),
      !!($('budget-von').value && $('budget-bis').value),
      !!document.querySelector('input[name="paket"]:checked')
    ];
    var done = checks.filter(Boolean).length;
    return { done: done, total: checks.length, pct: Math.round(done / checks.length * 100) };
  }

  function updateProgress() {
    var p = progressState();
    var fill = $('fp-fill'); if (fill) fill.style.width = p.pct + '%';
    var label = $('fp-label'); if (label) label.textContent = p.pct + ' % ausgefüllt' + (p.pct === 100 ? ' — bereit zum Absenden ✓' : '');
  }

  function wire() {
    fillBudgets('CHF');
    showDraftBanner();
    updateProgress();

    // Autosave + Fortschritt bei jeder Eingabe
    $('frm').addEventListener('input', function () { saveDraft(); updateProgress(); });
    $('frm').addEventListener('change', function () { saveDraft(); updateProgress(); });

    // Fehler-Zusammenfassung: Klick springt zum Feld
    $('form-errors').addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-target]');
      if (!a) return;
      e.preventDefault();
      var t = $(a.getAttribute('data-target'));
      if (t) { if (t.focus) t.focus(); if (t.scrollIntoView) t.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });

    $('land').addEventListener('change', function () {
      var land = this.value;
      var sel = $('region'), hint = $('quellen-hint');
      sel.innerHTML = '';
      if (!land) {
        sel.add(new Option('Zuerst Land wählen', ''));
        hint.textContent = '';
        setCurrency('CHF');
        $('payment-hint').textContent = 'Zahlungslink';
        return;
      }
      var d = cfg.REGIONS[land];
      sel.add(new Option('Bitte ' + d.label + ' wählen', ''));
      d.opts.forEach(function (o) { sel.add(new Option(o, o)); });
      hint.textContent = d.hint;
      setCurrency(d.cur);
      clearErr('land');
    });

    $('region').addEventListener('change', function () { if (this.value) clearErr('region'); });
    $('budget-von').addEventListener('change', liveCheckBudget);
    $('budget-bis').addEventListener('change', liveCheckBudget);

    $('frm').addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;

      var btn = $('submit-btn');
      btn.disabled = true;
      btn.textContent = 'Wird gespeichert …';

      store.create(collect()).then(function (record) {
        clearDraft();
        if (global.TDS.toast) global.TDS.toast.success('Anfrage gespeichert');
        router.navigate('/success/' + record.id);
      }).catch(function (err) {
        console.error(err);
        btn.disabled = false;
        btn.textContent = 'Anfrage absenden →';
        if (global.TDS.toast) global.TDS.toast.error('Speichern fehlgeschlagen. Bitte erneut versuchen.');
      });
    });
  }

  global.TDS = global.TDS || {};
  global.TDS.views = global.TDS.views || {};
  global.TDS.views.form = view;
})(window);
