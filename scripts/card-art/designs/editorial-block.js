'use strict';

var k = require('../art-kit.js');

// Modern Urdu Editorial: confident colour-blocking for Instagram and WhatsApp. A tall
// terracotta column with a halftone fade holds a single arch cut-out; a mustard sun crosses
// the boundary; fine ink rules and registration marks give a printed-poster finish. The large
// cream field on the right is reserved for big Urdu type.

var PALETTES = {
    terracotta: { paper: '#f4ede1', block: '#c8553d', blockDeep: '#a8402c', sun: '#e8a33d', ink: '#1f2a44', rule: '#1f2a44' },
    teal: { paper: '#eef1ea', block: '#1f6f6b', blockDeep: '#155451', sun: '#f0b44c', ink: '#22252b', rule: '#22252b' },
    plum: { paper: '#f6efe9', block: '#6b2f57', blockDeep: '#512241', sun: '#f2a07b', ink: '#231a26', rule: '#231a26' }
};

function render(W, H, options) {
    var p = PALETTES[(options && options.palette) || 'terracotta'];
    var defs = '';
    defs += k.el('pattern', { id: 'ed-dots', width: 18, height: 18, patternUnits: 'userSpaceOnUse' }, k.circle(9, 9, 3.2, p.blockDeep));
    defs += k.linear('ed-fade', [['#fff', 0], ['#fff', 1]]);
    defs += k.el('mask', { id: 'ed-halftone' }, k.rect(0, 0, W, H, 'url(#ed-fade)'));
    defs += k.grainFilter('ed-grain', 0.9, 2, 13);
    defs += k.el('clipPath', { id: 'ed-blockclip' }, k.rect(0, 0, 330, H, '#000'));

    var body = '';
    body += k.rect(0, 0, W, H, p.paper);
    // Sun disc behind the block edge.
    body += k.circle(330, 220, 150, p.sun);
    // Terracotta column with halftone fade at its base.
    body += k.rect(0, 0, 330, H, p.block);
    body += k.g({ mask: 'url(#ed-halftone)', opacity: 0.8 }, k.rect(0, 0, 330, H, 'url(#ed-dots)'));
    body += k.g({ 'clip-path': 'url(#ed-blockclip)' }, k.circle(330, 220, 150, p.sun, { opacity: 0.92 }) + k.circle(330, 220, 150, p.blockDeep, { opacity: 0.25 }));
    // Arch cut-out window in the column.
    body += k.path(k.pointedArch(86, 640, 158, 330, 0.42), p.paper);
    body += k.path(k.pointedArch(104, 666, 122, 304, 0.42), 'none', { stroke: p.block, 'stroke-width': 3 });
    body += k.circle(165, 860, 26, p.sun);
    // Rules, ticks and registration marks.
    body += k.rect(392, 120, 2, H - 240, p.rule, { opacity: 0.85 });
    body += k.rect(392, 120, W - 470, 2, p.rule, { opacity: 0.85 });
    body += k.rect(392, H - 122, W - 470, 2, p.rule, { opacity: 0.85 });
    for (var t = 0; t < 12; t += 1) body += k.rect(392 + 50 * t, H - 132, 1.4, t % 4 === 0 ? 20 : 10, p.rule, { opacity: 0.7 });
    [[W - 78, 120], [W - 78, H - 120]].forEach(function (c) {
        body += k.circle(c[0], c[1], 11, 'none', { stroke: p.rule, 'stroke-width': 1.6 });
        body += k.rect(c[0] - 18, c[1] - 0.8, 36, 1.6, p.rule) + k.rect(c[0] - 0.8, c[1] - 18, 1.6, 36, p.rule);
    });
    // Small accent: three stacked bars echoing the column colour.
    [0, 1, 2].forEach(function (i) { body += k.rect(W - 210 + i * 30, 164, 18, 64 - i * 16, i === 1 ? p.sun : p.block); });
    body += k.grainLayer(W, H, 'ed-grain', 0.07);
    return k.svg(W, H, defs, body);
}

module.exports = { id: 'editorial-terracotta-block', render: render, palettes: Object.keys(PALETTES) };
