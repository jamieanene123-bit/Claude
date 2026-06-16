/*
 * notfound.js — Fallback-Seite für unbekannte Routen.
 */
(function (global) {
  'use strict';

  var ui = global.TDS.ui;

  function view(ctx) {
    var path = (ctx && ctx.path) ? ctx.path : '';
    var html = ui.header() +
      '<div class="wrap wrap-narrow">' +
        '<div class="sec notfound">' +
          '<div class="nf-code">404</div>' +
          '<div class="ok-title">Seite nicht gefunden</div>' +
          '<div class="ok-text">Die Route <span class="mono">' + ui.esc(path) + '</span> gibt es nicht.</div>' +
          '<div class="success-actions">' +
            '<a class="btn-primary" href="#/">Zur Startseite</a>' +
            '<a class="btn-ghost" href="#/form">Anfrage stellen</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
      ui.footer();
    ui.render(html);
  }

  global.TDS = global.TDS || {};
  global.TDS.views = global.TDS.views || {};
  global.TDS.views.notFound = view;
})(window);
