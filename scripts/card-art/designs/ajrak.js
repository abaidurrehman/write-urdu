'use strict';

var k = require('../art-kit.js');

// Ajrak: an original interpretation of Sindhi block-printed ajrak. Madder-red and indigo
// fields, black outlines and white resist dots; wide printed bands frame a deep indigo
// centre left deliberately empty so the Urdu never sits on busy pattern.

var PALETTES = {
    indigo: { red: '#a3202a', indigo: '#16224a', indigoDeep: '#0e1733', black: '#120c0c', white: '#f6efe2', field: ['#1b2a5a', '#101a3a'] },
    madder: { red: '#16224a', indigo: '#a3202a', indigoDeep: '#7d1720', black: '#120c0c', white: '#f6efe2', field: ['#8f1c25', '#6e131b'] }
};

// One printed rosette block: star-cross in red on indigo with white dot ring and black keylines.
function rosetteTile(id, s, p) {
    var h = s / 2;
    var star = [];
    for (var i = 0; i < 16; i += 1) {
        var r = i % 2 ? h * 0.34 : h * 0.78;
        var a = (Math.PI * 2 * i) / 16 - Math.PI / 2;
        star.push([h + Math.cos(a) * r, h + Math.sin(a) * r]);
    }
    var dots = '';
    for (var d = 0; d < 16; d += 1) {
        var ang = (Math.PI * 2 * d) / 16;
        dots += k.circle(h + Math.cos(ang) * h * 0.92, h + Math.sin(ang) * h * 0.92, s * 0.018, p.white);
    }
    var corners = [[0, 0], [s, 0], [0, s], [s, s]].map(function (c) {
        return k.path(k.poly([[c[0], c[1] - h * 0.32], [c[0] + h * 0.32, c[1]], [c[0], c[1] + h * 0.32], [c[0] - h * 0.32, c[1]]]), p.red, { stroke: p.black, 'stroke-width': 1.4 }) +
            k.circle(c[0], c[1], s * 0.03, p.white);
    }).join('');
    return k.el('pattern', { id: id, width: s, height: s, patternUnits: 'userSpaceOnUse' },
        k.rect(0, 0, s, s, p.indigo) + dots +
        k.path(k.poly(star), p.red, { stroke: p.black, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }) +
        k.circle(h, h, h * 0.24, p.indigo, { stroke: p.black, 'stroke-width': 1.4 }) +
        k.blossom(h, h, h * 0.2, p.white, p.red, 0, { count: 8 }) + corners);
}

// Narrow border band: running trefoil arches (the classic ajrak edge) with dot fill.
function trefoilBand(id, w, p) {
    var h = w * 0.9;
    var arch = 'M0 ' + h + ' L0 ' + (h * 0.5) + ' Q0 ' + (h * 0.15) + ' ' + (w * 0.25) + ' ' + (h * 0.2) + ' Q' + (w * 0.5) + ' ' + (-h * 0.05) + ' ' + (w * 0.75) + ' ' + (h * 0.2) + ' Q' + w + ' ' + (h * 0.15) + ' ' + w + ' ' + (h * 0.5) + ' L' + w + ' ' + h + ' Z';
    return k.el('pattern', { id: id, width: w, height: h, patternUnits: 'userSpaceOnUse' },
        k.rect(0, 0, w, h, p.black) + k.path(arch, p.red, { transform: 'translate(' + (w * 0.08) + ' ' + (h * 0.08) + ') scale(0.84)' }) +
        k.circle(w / 2, h * 0.55, w * 0.07, p.white) + k.circle(w * 0.3, h * 0.72, w * 0.04, p.white) + k.circle(w * 0.7, h * 0.72, w * 0.04, p.white));
}

function render(W, H, options) {
    var p = PALETTES[(options && options.palette) || 'indigo'];
    var defs = '';
    defs += rosetteTile('aj-rosette', 108, p);
    defs += trefoilBand('aj-trefoil', 36, p);
    defs += k.el('pattern', { id: 'aj-dots', width: 14, height: 14, patternUnits: 'userSpaceOnUse' }, k.rect(0, 0, 14, 14, p.black) + k.circle(7, 7, 2.2, p.white));
    defs += k.linear('aj-field', p.field);
    defs += k.radial('aj-glow', [['#ffffff', 0.08], ['#ffffff', 0]], '50%', '45%', '55%');
    defs += k.grainFilter('aj-grain', 0.8, 3, 9);

    var body = '';
    body += k.rect(0, 0, W, H, 'url(#aj-rosette)');
    // Bands: dots, trefoils, dots, from the outer printed field into the centre.
    var inset = 216;
    body += k.rect(inset - 40, inset - 40, W - 2 * (inset - 40), H - 2 * (inset - 40), 'url(#aj-dots)');
    body += k.rect(inset - 28, inset - 28, W - 2 * (inset - 28), H - 2 * (inset - 28), 'url(#aj-trefoil)');
    body += k.rect(inset - 8, inset - 8, W - 2 * (inset - 8), H - 2 * (inset - 8), 'url(#aj-dots)');
    body += k.rect(inset, inset, W - 2 * inset, H - 2 * inset, 'url(#aj-field)');
    body += k.rect(inset, inset, W - 2 * inset, H - 2 * inset, 'url(#aj-glow)');
    body += k.rect(inset + 14, inset + 14, W - 2 * inset - 28, H - 2 * inset - 28, 'none', { stroke: p.white, 'stroke-width': 1.2, 'stroke-dasharray': '1 9', 'stroke-linecap': 'round', opacity: 0.6 });
    // Small printed medallions at the centre panel's corners.
    [[inset + 44, inset + 44], [W - inset - 44, inset + 44], [inset + 44, H - inset - 44], [W - inset - 44, H - inset - 44]].forEach(function (c) {
        body += k.blossom(c[0], c[1], 16, p.red, p.white, 0, { count: 8, edge: p.black });
    });
    body += k.grainLayer(W, H, 'aj-grain', 0.09);
    return k.svg(W, H, defs, body);
}

module.exports = { id: 'ajrak-modern-frame', render: render, palettes: Object.keys(PALETTES) };
