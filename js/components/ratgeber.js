/*
 * components/ratgeber.js — Ratgeber/Ressourcen (statische Tipps-Karten).
 */
(function (global) {
  'use strict';

  var ui = global.TDS.ui;

  function card(tag, title, text) {
    return '<article class="guide-card">' +
      '<div class="guide-tag">' + ui.esc(tag) + '</div>' +
      '<h3 class="guide-title">' + ui.esc(title) + '</h3>' +
      '<p class="guide-text">' + ui.esc(text) + '</p>' +
      '<a class="link-arrow" href="#/form">Passendes Töff finden →</a>' +
      '</article>';
  }

  function view() {
    var html = '' +
      '<div class="hero hero-sm"><div class="hero-eye">Ratgeber</div>' +
        '<h1>Clever zum richtigen Töff</h1>' +
        '<p>Kurz und praxisnah: worauf es beim Gebrauchtkauf wirklich ankommt.</p></div>' +

      '<div class="wrap wrap-wide">' +
        '<div class="guide-grid">' +
          card('Einsteiger', 'A2 verstehen — was darf ich fahren?', 'A2 erlaubt bis 35 kW (oder gedrosselte Modelle). Wir zeigen dir nur Motorräder, die wirklich passen — kein Risiko mit der Leistung.') +
          card('Preis', 'Ist der Preis fair?', 'Vergleiche nie nur zwei Inserate. Marktwert hängt von Baujahr, Kilometern und Zustand ab — genau das macht unser Deal-Score sichtbar.') +
          card('Besichtigung', 'Die wichtigsten Checks vor Ort', 'Kette & Ritzel, Reifenalter (DOT), Bremsen, Gabel auf Ölverlust, Kaltstart. Unser Report liefert die Checkliste je Modell.') +
          card('Verhandlung', 'So holst du den besten Preis', 'Mit konkreten Argumenten (km über Schnitt, fehlender Service) und einem realistischen Zielpreis verhandelst du souverän.') +
          card('Risiko', 'Unfallbikes erkennen', 'Achte auf Spaltmasse, Lacknasen und unrunde Schrauben. Eine erhöhte Risiko-Einstufung im Report ist ein klares Warnsignal.') +
          card('Papiere', 'MFK, Serviceheft & Co.', 'Frische MFK (CH) und lückenloses Serviceheft sparen bares Geld und Ärger. Fehlt der Nachweis: Preis nachverhandeln.') +
        '</div>' +
      '</div>';
    ui.render(html);
  }

  global.TDS = global.TDS || {};
  global.TDS.views = global.TDS.views || {};
  global.TDS.views.ratgeber = view;
})(window);
