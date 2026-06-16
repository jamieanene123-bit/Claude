/*
 * core/motion.js — Bewegungs-Layer ("smooth").
 *
 * Zentralisiert alle Animationen, damit Views nichts davon wissen müssen:
 * layout.render() ruft nach jedem Rendern motion.enter(#app) auf.
 *  - sanftes Page-In (Cross-Fade/Slide beim View-Wechsel)
 *  - Scroll-Reveals via IntersectionObserver, leicht gestaffelt
 *  - Count-up für KPIs ([data-count])
 *  - Aufziehen von Charts (Balken-Breite, Gauge-Bogen)
 *
 * Progressive Enhancement: Ohne JS/Observer bleibt alles sichtbar.
 * prefers-reduced-motion wird respektiert (keine Bewegung).
 */
(function (global) {
  'use strict';

  function reduced() {
    return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function raf(fn) { (global.requestAnimationFrame || function (f) { setTimeout(f, 16); })(fn); }
  function now() { return (global.performance && global.performance.now) ? global.performance.now() : Date.now(); }
  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }

  var REVEAL_SEL = [
    '.hero-eye', '.hero h1', '.hero p', '.hero .btn-primary', '.hero-pills',
    '.section-eye', '.step', '.feat', '.sec', '.kpi', '.chart-card', '.deal-card',
    '.data-block', '.cta-band', '.table-card', '.toolbar', '.filters',
    '.report-note', '.success', '.report-actions', '.report-cols > *', '.draft-bar'
  ].join(',');

  var observer = null;
  function getObserver() {
    if (observer) return observer;
    if (!('IntersectionObserver' in global)) return null;
    observer = new global.IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          // Charts/Zähler erst animieren, wenn sie sichtbar werden (lazy).
          animateCharts(e.target, false);
          countUps(e.target, false);
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    return observer;
  }

  function markAllVisible(container) {
    var els = container.querySelectorAll('.reveal');
    Array.prototype.forEach.call(els, function (el) { el.classList.add('in'); });
  }

  function pageIn(container) {
    container.classList.remove('page-in');
    void container.offsetWidth; // Reflow erzwingen -> Animation neu starten
    if (!reduced()) container.classList.add('page-in');
  }

  function setupReveals(container) {
    var nodes = container.querySelectorAll(REVEAL_SEL);
    Array.prototype.forEach.call(nodes, function (el) {
      if (el.classList.contains('reveal')) return;
      el.classList.add('reveal');
      var parent = el.parentNode || container;
      parent.__rev = (parent.__rev || 0);
      var i = parent.__rev++;
      el.style.transitionDelay = Math.min(i * 70, 350) + 'ms';
    });
    var obs = getObserver();
    if (!obs) { markAllVisible(container); return; }
    Array.prototype.forEach.call(nodes, function (el) { obs.observe(el); });
  }

  function countUps(container, instant) {
    var els = container.querySelectorAll('[data-count]');
    Array.prototype.forEach.call(els, function (el) {
      var to = parseFloat(el.getAttribute('data-count')) || 0;
      if (instant || reduced()) { el.textContent = String(to); return; }
      var dur = 900, start = now();
      (function tick() {
        var p = Math.min((now() - start) / dur, 1);
        el.textContent = String(Math.round(easeOut(p) * to));
        if (p < 1) raf(tick);
      })();
    });
  }

  function animateCharts(container, instant) {
    var bars = container.querySelectorAll('.cb-fill[data-w]');
    Array.prototype.forEach.call(bars, function (el) {
      var w = el.getAttribute('data-w');
      if (instant || reduced()) { el.style.width = w; return; }
      raf(function () { el.style.width = w; });
    });
    var gauges = container.querySelectorAll('.gauge-fill[data-dash]');
    Array.prototype.forEach.call(gauges, function (el) {
      var d = el.getAttribute('data-dash');
      if (instant || reduced()) { el.setAttribute('stroke-dasharray', d); return; }
      raf(function () { el.setAttribute('stroke-dasharray', d); });
    });
  }

  function enter(container) {
    if (!container) return;
    pageIn(container);
    if (reduced()) {
      markAllVisible(container);
      countUps(container, true);
      animateCharts(container, true);
      return;
    }
    setupReveals(container);
    // Charts/Zähler werden pro Element animiert, sobald es sichtbar wird
    // (siehe IntersectionObserver). Fallback ohne Observer:
    if (!('IntersectionObserver' in global)) {
      animateCharts(container, false);
      countUps(container, false);
    }
  }

  global.TDS = global.TDS || {};
  global.TDS.motion = { enter: enter };
})(window);
