/*
 * success.js — Bestätigungsseite nach dem Absenden.
 */
(function (global) {
  'use strict';

  var ui = global.TDS.ui;
  var cfg = global.TDS.config;
  var store = global.TDS.store;

  function view(params) {
    store.get(params.id).then(function (rec) {
      if (!rec) {
        ui.render('' +
          '<div class="wrap"><div class="sec"><p>Anfrage nicht gefunden.</p>' +
          '<a class="btn-primary" href="#/form">Neue Anfrage</a></div></div>' + '');
        return;
      }

      var v = rec.values;
      var quellen = (v.land && cfg.REGIONS[v.land]) ? cfg.REGIONS[v.land].hint.replace('Wir suchen', 'Gesucht wird') + '.' : '';

      var html = '' +
        '<div class="wrap wrap-narrow">' +
          '<div class="success">' +
            '<div class="ok-ico">✓</div>' +
            '<div class="ok-title">Anfrage erhalten!</div>' +
            '<div class="ok-text">Danke, ' + ui.esc(v.vorname) + '. Wir melden uns innerhalb von 24 Stunden mit deinem persönlichen Deal-Report.</div>' +
            '<div class="ok-detail">' +
              '<strong>Was passiert jetzt?</strong>' +
              'Wir analysieren aktuelle Inserate in deiner Region, bewerten sie nach Preis, Zustand und Risiko und schicken dir deinen Report. ' + ui.esc(quellen) +
            '</div>' +
            '<ol class="next-steps">' +
              '<li>Wir durchsuchen den Markt in deiner Region.</li>' +
              '<li>Jedes Inserat wird nach Preis, Zustand und Risiko bewertet.</li>' +
              '<li>Du erhältst deinen Report mit Deal-Score und Verhandlungsargumenten.</li>' +
            '</ol>' +
            '<div class="ok-meta">' +
              '<div><span>Anfrage-Nr.</span><strong id="ref-no">' + ui.esc(rec.id) + '</strong></div>' +
              '<div><span>Paket</span><strong>' + ui.esc(v.paket) + '</strong></div>' +
              '<div><span>Status</span>' + ui.statusBadge(rec.status) + '</div>' +
            '</div>' +
            '<div class="success-actions">' +
              '<a class="btn-primary" href="#/report/' + ui.esc(rec.id) + '">Beispiel-Report ansehen →</a>' +
              '<button class="btn-ghost" id="copy-ref" type="button">Anfrage-Nr. kopieren</button>' +
              '<a class="btn-ghost" href="#/">Zur Startseite</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '';

      ui.render(html);

      var copyBtn = global.document.getElementById('copy-ref');
      if (copyBtn) copyBtn.addEventListener('click', function () {
        var done = function () { if (global.TDS.toast) global.TDS.toast.success('Anfrage-Nr. kopiert: ' + rec.id); };
        if (global.navigator && global.navigator.clipboard) {
          global.navigator.clipboard.writeText(rec.id).then(done, done);
        } else { done(); }
      });
    });
  }

  global.TDS = global.TDS || {};
  global.TDS.views = global.TDS.views || {};
  global.TDS.views.success = view;
})(window);
