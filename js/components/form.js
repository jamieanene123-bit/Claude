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
    var html = ui.header() +
      '<div class="hero hero-sm">' +
        '<div class="hero-eye">Suchanfrage</div>' +
        '<h1>Erzähl uns von deinem Wunsch-Töff</h1>' +
        '<p>Je genauer, desto besser der Report. Pflichtfelder sind mit <span style="color:var(--accent)">*</span> markiert.</p>' +
      '</div>' +

      '<div class="wrap">' +
      '<form id="frm" novalidate>' +

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
            '<label class="lbl">Führerausweis <span class="req">*</span></label>' +
            '<div class="chips" id="chips-ausweis">' +
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
            '<label class="lbl">Stil <span class="req">*</span> <span class="opt">Mehrfachauswahl möglich</span></label>' +
            '<div class="chips" id="chips-stil">' +
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
      ui.footer();

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
    var von = parseInt($('budget-von').value) || 0;
    var bis = parseInt($('budget-bis').value) || 0;
    if (von && bis && von >= bis) {
      $('e-budget').textContent = '"Von" muss kleiner sein als "Bis".';
      $('e-budget').classList.add('show');
    } else {
      clearErr('budget');
    }
  }

  function validate() {
    var errors = [];
    function check(pass, errId, inputId, msg) {
      var errEl = $(errId), inp = $(inputId);
      if (!pass) {
        if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); }
        if (inp) inp.classList.add('err');
        errors.push(inputId);
      } else {
        if (errEl) errEl.classList.remove('show');
        if (inp) inp.classList.remove('err');
      }
    }

    check($('vorname').value.trim() !== '', 'e-vorname', 'vorname', 'Bitte Vorname eingeben.');
    check($('nachname').value.trim() !== '', 'e-nachname', 'nachname', 'Bitte Nachname eingeben.');
    check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('email').value.trim()), 'e-email', 'email', 'Bitte eine gültige E-Mail-Adresse eingeben.');
    check($('land').value !== '', 'e-land', 'land', 'Bitte Land auswählen.');
    check($('region').value !== '', 'e-region', 'region', 'Bitte Region auswählen.');

    chipsGroup('ausweis', 'e-ausweis', 'chips-ausweis', 'Bitte Führerausweis auswählen.', errors);
    chipsGroup('stil', 'e-stil', 'chips-stil', 'Bitte mindestens einen Stil auswählen.', errors);

    var von = parseInt($('budget-von').value) || 0;
    var bis = parseInt($('budget-bis').value) || 0;
    if (!von || !bis) {
      setErr('e-budget', 'budget-von', 'Bitte Budget Von und Bis auswählen.'); errors.push('budget-von');
    } else if (von >= bis) {
      setErr('e-budget', 'budget-von', '"Von" muss kleiner sein als "Bis".'); errors.push('budget-von');
    } else { clearErr('budget'); $('budget-von').classList.remove('err'); }

    if (!document.querySelector('input[name="paket"]:checked')) {
      $('e-paket').classList.add('show'); errors.push('pkg-Quick-Check');
    } else { $('e-paket').classList.remove('show'); }

    if (errors.length > 0) {
      var firstEl = $(errors[0]) || document.querySelector('.err-msg.show');
      if (firstEl) firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  }

  function setErr(errId, inputId, msg) {
    var errEl = $(errId), inp = $(inputId);
    if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); }
    if (inp) inp.classList.add('err');
  }

  function chipsGroup(name, errId, wrapId, msg, errors) {
    var ok = document.querySelector('input[name="' + name + '"]:checked') !== null;
    var errEl = $(errId), wrap = $(wrapId);
    if (!ok) {
      if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); }
      if (wrap) wrap.classList.add('err-chips');
      errors.push(wrapId);
    } else {
      if (errEl) errEl.classList.remove('show');
      if (wrap) wrap.classList.remove('err-chips');
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

  function wire() {
    fillBudgets('CHF');

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
        router.navigate('/success/' + record.id);
      }).catch(function (err) {
        console.error(err);
        btn.disabled = false;
        btn.textContent = 'Anfrage absenden →';
        alert('Speichern fehlgeschlagen. Bitte erneut versuchen.');
      });
    });
  }

  global.TDS = global.TDS || {};
  global.TDS.views = global.TDS.views || {};
  global.TDS.views.form = view;
})(window);
