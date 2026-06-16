/*
 * core/charts.js — abhängigkeitsfreie Mini-Charts als HTML/SVG-Strings.
 * Bewusst keine externe Lib: bars (CSS), donut & gauge (SVG).
 */
(function (global) {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** Horizontale Balken. items: [{label, value, display?, color?}] */
  function bars(items, opts) {
    opts = opts || {};
    var max = Math.max.apply(null, items.map(function (i) { return i.value; }).concat([1]));
    return '<div class="chart-bars">' + items.map(function (it) {
      var w = Math.round((it.value / max) * 100);
      return '<div class="cb-row">' +
        '<div class="cb-label">' + esc(it.label) + '</div>' +
        '<div class="cb-track"><div class="cb-fill" data-w="' + w + '%" style="width:0;background:' + (it.color || 'var(--accent)') + '"></div></div>' +
        '<div class="cb-val">' + esc(it.display != null ? it.display : it.value) + '</div>' +
        '</div>';
    }).join('') + '</div>';
  }

  /** Donut. segments: [{label, value, color}], opts.center = Mitteltext */
  function donut(segments, opts) {
    opts = opts || {};
    var size = opts.size || 132, sw = opts.stroke || 20;
    var r = (size - sw) / 2, c = 2 * Math.PI * r, cx = size / 2, cy = size / 2;
    var total = segments.reduce(function (s, x) { return s + x.value; }, 0) || 1;
    var off = 0, circ = '';
    segments.forEach(function (seg) {
      var len = (seg.value / total) * c;
      if (len <= 0) return;
      circ += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + seg.color +
        '" stroke-width="' + sw + '" stroke-dasharray="' + len.toFixed(2) + ' ' + (c - len).toFixed(2) +
        '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>';
      off += len;
    });
    var center = opts.center != null ?
      '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" class="donut-num">' + esc(opts.center) + '</text>' +
      (opts.centerSub ? '<text x="' + cx + '" y="' + (cy + 16) + '" text-anchor="middle" class="donut-sub">' + esc(opts.centerSub) + '</text>' : '')
      : '';
    return '<svg class="donut" viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" role="img">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="var(--border)" stroke-width="' + sw + '"/>' +
      circ + center + '</svg>';
  }

  /** Halbkreis-Gauge 0..max (Deal-Score). */
  function gauge(value, max, opts) {
    opts = opts || {};
    max = max || 10;
    var size = opts.size || 140, sw = opts.stroke || 14;
    var r = (size - sw) / 2, cx = size / 2, cy = size / 2;
    var half = Math.PI * r; // Länge Halbkreis
    var frac = Math.max(0, Math.min(1, value / max));
    var col = value >= 7.5 ? 'var(--ok)' : value >= 5.5 ? 'var(--warn)' : 'var(--err)';
    // Halbkreis von links (180°) nach rechts (0°)
    function arc() {
      return 'M ' + sw / 2 + ' ' + cy + ' A ' + r + ' ' + r + ' 0 0 1 ' + (size - sw / 2) + ' ' + cy;
    }
    return '<svg class="gauge" viewBox="0 0 ' + size + ' ' + (cy + sw) + '" width="' + size + '" role="img" aria-label="Score ' + value + ' von ' + max + '">' +
      '<path d="' + arc() + '" fill="none" stroke="var(--border)" stroke-width="' + sw + '" stroke-linecap="round"/>' +
      '<path class="gauge-fill" d="' + arc() + '" fill="none" stroke="' + col + '" stroke-width="' + sw + '" stroke-linecap="round" ' +
      'stroke-dasharray="0 ' + half.toFixed(2) + '" data-dash="' + (half * frac).toFixed(2) + ' ' + half.toFixed(2) + '"/>' +
      '<text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" class="gauge-num">' + esc(value.toFixed ? value.toFixed(1) : value) + '</text>' +
      '<text x="' + cx + '" y="' + (cy + 12) + '" text-anchor="middle" class="gauge-sub">von ' + max + '</text>' +
      '</svg>';
  }

  global.TDS = global.TDS || {};
  global.TDS.charts = { bars: bars, donut: donut, gauge: gauge };
})(window);
