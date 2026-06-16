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
        ui.render(ui.header() +
          '<div class="wrap"><div class="sec"><p>Anfrage nicht gefunden.</p>' +
          '<a class="btn-primary" href="#/form">Neue Anfrage</a></div></div>' + ui.footer());
        return;
      }

      var v = rec.values;
      var quellen = (v.land && cfg.REGIONS[v.land]) ? cfg.REGIONS[v.land].hint.replace('Wir suchen', 'Gesucht wird') + '.' : '';

      var html = ui.header() +
        '<div class="wrap wrap-narrow">' +
          '<div class="success">' +
            '<div class="ok-ico">✓</div>' +
            '<div class="ok-title">Anfrage erhalten!</div>' +
            '<div class="ok-text">Danke, ' + ui.esc(v.vorname) + '. Wir melden uns innerhalb von 24 Stunden mit deinem persönlichen Deal-Report.</div>' +
            '<div class="ok-detail">' +
              '<strong>Was passiert jetzt?</strong>' +
              'Wir analysieren aktuelle Inserate in deiner Region, bewerten sie nach Preis, Zustand und Risiko und schicken dir deinen Report. ' + ui.esc(quellen) +
            '</div>' +
            '<div class="ok-meta">' +
              '<div><span>Anfrage-Nr.</span><strong>' + ui.esc(rec.id) + '</strong></div>' +
              '<div><span>Paket</span><strong>' + ui.esc(v.paket) + '</strong></div>' +
              '<div><span>Status</span>' + ui.statusBadge(rec.status) + '</div>' +
            '</div>' +
            '<div class="success-actions">' +
              '<a class="btn-primary" href="#/report/' + ui.esc(rec.id) + '">Beispiel-Report ansehen →</a>' +
              '<a class="btn-ghost" href="#/">Zur Startseite</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
        ui.footer();

      ui.render(html);
    });
  }

  global.TDS = global.TDS || {};
  global.TDS.views = global.TDS.views || {};
  global.TDS.views.success = view;
})(window);
