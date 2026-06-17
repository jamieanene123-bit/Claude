/*
 * components/kontakt.js — Kontaktseite (Demo: mailto, kein Backend).
 */
(function (global) {
  'use strict';

  var ui = global.TDS.ui;

  function view() {
    var html = '' +
      '<div class="hero hero-sm"><div class="hero-eye">Kontakt</div>' +
        '<h1>Sag uns, wie wir helfen können</h1>' +
        '<p>Fragen zum Service, Feedback oder eine Idee? Wir freuen uns.</p></div>' +

      '<div class="wrap">' +
        '<div class="sec">' +
          '<div class="sec-head">Direkt erreichen</div>' +
          '<div class="contact-rows">' +
            '<div class="contact-row"><span class="contact-ico">✉</span><div><div class="contact-k">E-Mail</div>' +
              '<a href="mailto:info@toeffdealscout.ch">info@toeffdealscout.ch</a></div></div>' +
            '<div class="contact-row"><span class="contact-ico">📍</span><div><div class="contact-k">Ort</div>' +
              '<span>Zürich, Schweiz</span></div></div>' +
            '<div class="contact-row"><span class="contact-ico">⏱</span><div><div class="contact-k">Antwortzeit</div>' +
              '<span>in der Regel innerhalb von 24 Stunden</span></div></div>' +
          '</div>' +
        '</div>' +

        '<div class="sec">' +
          '<div class="sec-head">Nachricht schreiben</div>' +
          '<div class="field"><label class="lbl" for="k-name">Name</label>' +
            '<input type="text" id="k-name" placeholder="Dein Name"></div>' +
          '<div class="field"><label class="lbl" for="k-msg">Nachricht</label>' +
            '<textarea id="k-msg" placeholder="Wie können wir helfen?"></textarea></div>' +
          '<button class="btn-primary" id="k-send" type="button">Per E-Mail senden →</button>' +
          '<div class="hint-text">Öffnet dein E-Mail-Programm — es werden keine Daten an einen Server gesendet (Demo).</div>' +
        '</div>' +
      '</div>';
    ui.render(html);

    var btn = global.document.getElementById('k-send');
    if (btn) btn.addEventListener('click', function () {
      var name = (global.document.getElementById('k-name').value || '').trim();
      var msg = (global.document.getElementById('k-msg').value || '').trim();
      var body = encodeURIComponent((name ? 'Von: ' + name + '\n\n' : '') + msg);
      var subject = encodeURIComponent('Anfrage über Töff Deal Scout');
      global.location.href = 'mailto:info@toeffdealscout.ch?subject=' + subject + '&body=' + body;
    });
  }

  global.TDS = global.TDS || {};
  global.TDS.views = global.TDS.views || {};
  global.TDS.views.kontakt = view;
})(window);
