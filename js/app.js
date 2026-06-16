/*
 * app.js — Bootstrap. Verdrahtet Routen mit Views und startet den Router.
 *
 * Erweiterung später:
 *  - Auth/Login: vor adminList/adminDetail einen Guard einfügen
 *    (z.B. if (!TDS.auth.isAdmin()) return TDS.views.login();).
 *  - Backend: nur js/store.js austauschen, Views bleiben unverändert.
 *  - Stripe: im Submit-Handler (form.js) nach store.create() einen
 *    Checkout-Redirect ergänzen.
 */
(function (global) {
  'use strict';

  var router = global.TDS.router;
  var views = global.TDS.views;

  router.register('/', views.landing);
  router.register('/form', views.form);
  router.register('/success/:id', views.success);
  router.register('/admin', views.adminList);
  router.register('/admin/:id', views.adminDetail);
  router.register('/report/:id', views.report);

  router.start();
})(window);
