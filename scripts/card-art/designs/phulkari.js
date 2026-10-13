'use strict';

var k = require('../art-kit.js');

// Phulkari Bagh: a madder-red khaddar ground worked in silk satin stitch, after the Punjabi
// "garden" phulkari. A border of diamond rows and eight-petal bagh flowers surrounds a calm
// unbleached-cotton panel, edged in running stitch, that carries the words.

var PALETTES = {
    madder: {
        ground: '#8a1b24', groundDeep: '#6b121b', weave: 'rgba(0,0,0,0.12)',
        floss: { gold: ['#f6b82e', '#d9921a'], orange: ['#f07a26', '#cc5a14'], pink: ['#e2457e', '#b8285e'], white: ['#fbf3df', '#e6d6b4'], green: ['#3f8f5c', '#2c6a43'] },
        panel: ['#f8eedb', '#efe0c4'], stitch: '#a3232f'
    },
    indigo: {
        ground: '#1d2a5c', groundDeep: '#141d42', weave: 'rgba(0,0,0,0.14)',
        floss: { gold: ['#f6c240', '#d99c1d'], orange: ['#f08a3a', '#cc6a1e'], pink: ['#ef6b9a', '#c94a78'], white: ['#fbf3df', '#e6d6b4'], green: ['#4aa070', '#327a52'] },
        panel: ['#f7efe0', '#ece0c8'], stitch: '#1d2a5c'
    }
};

function render(W, H, options) {
    var p = PALETTES[(options && options.palette) || 'madder'];
    var defs = '';
    defs += k.phulkariDefs('pk', p.floss);
    defs += k.el('pattern', { id: 'pk-weave', width: 6, height: 6, patternUnits: 'userSpaceOnUse' },
        k.rect(0, 0, 6, 6, p.ground) + k.rect(0, 0, 6, 1.2, p.weave) + k.rect(0, 0, 1.2, 6, p.weave));
    defs += k.el('pattern', { id: 'pk-cotton', width: 5, height: 5, patternUnits: 'userSpaceOnUse' },
        k.rect(0, 0, 5, 5, p.panel[0]) + k.rect(0, 0, 5, 0.8, 'rgba(120,90,50,0.07)') + k.rect(0, 0, 0.8, 5, 'rgba(120,90,50,0.06)'));
    defs += k.linear('pk-panelshade', [[p.panel[1], 0], [p.panel[1], 0.55]]);
    defs += k.grainFilter('pk-grain', 0.8, 3, 17);
    defs += k.blur('pk-shadow', 8);

    var body = '';
    body += k.rect(0, 0, W, H, 'url(#pk-weave)');

    var keys = ['gold', 'orange', 'pink', 'gold', 'white', 'gold', 'pink', 'orange'];
    // Outer diamond rows along all four edges.
    var dw = 40;
    var dh = 54;
    var i;
    for (i = 0; i * dw * 0.98 < W + dw; i += 1) {
        body += k.phulkariDiamond(20 + i * dw, 40, dw * 0.92, dh, 'pk', keys[i % keys.length]);
        body += k.phulkariDiamond(20 + i * dw, H - 40, dw * 0.92, dh, 'pk', keys[(i + 3) % keys.length]);
    }
    for (i = 0; 90 + i * dw < H - 90; i += 1) {
        body += k.at(40, 100 + i * dw, 90, 1, k.phulkariDiamond(0, 0, dw * 0.92, dh, 'pk', keys[(i + 1) % keys.length]));
        body += k.at(W - 40, 100 + i * dw, 90, 1, k.phulkariDiamond(0, 0, dw * 0.92, dh, 'pk', keys[(i + 5) % keys.length]));
    }
    // Bagh flowers at the corners and the middle of each long side.
    [[150, 160], [W - 150, 160], [150, H - 160], [W - 150, H - 160]].forEach(function (c, index) {
        body += k.phulkariFlower(c[0], c[1], 66, 'pk', index % 2 ? 'gold' : 'orange', 'pink');
    });
    [[150, H / 2], [W - 150, H / 2]].forEach(function (c) {
        body += k.phulkariFlower(c[0], c[1], 54, 'pk', 'pink', 'gold');
        body += k.phulkariDiamond(c[0], c[1] - 150, 30, 46, 'pk', 'white');
        body += k.phulkariDiamond(c[0], c[1] + 150, 30, 46, 'pk', 'white');
    });
    // Bagh lattice: the field between the edge rows and the panel is covered in a staggered
    // grid of small satin diamonds, leaving clearings for the flowers.
    var flowers = [[150, 160, 96], [W - 150, 160, 96], [150, H - 160, 96], [W - 150, H - 160, 96], [150, H / 2, 82], [W - 150, H / 2, 82], [W / 2, 150, 60], [W / 2, H - 150, 60]];
    var lattice = ['gold', 'gold', 'orange', 'gold', 'pink', 'gold', 'white', 'orange'];
    var row = 0;
    for (var y = 92; y < H - 80; y += 34, row += 1) {
        for (var x = 92 + (row % 2) * 26; x < W - 80; x += 52) {
            if (x > 206 && x < W - 206 && y > 202 && y < H - 210) continue;
            if (flowers.some(function (f) { return Math.hypot(f[0] - x, f[1] - y) < f[2]; })) continue;
            body += k.phulkariDiamond(x, y, 30, 30, 'pk', lattice[(row * 3 + Math.round(x / 52)) % lattice.length]);
        }
    }
    // Re-draw the flowers above the lattice clearings.
    [[150, 160], [W - 150, 160], [150, H - 160], [W - 150, H - 160]].forEach(function (c, index) {
        body += k.phulkariFlower(c[0], c[1], 66, 'pk', index % 2 ? 'gold' : 'orange', 'pink');
    });
    [[150, H / 2], [W - 150, H / 2]].forEach(function (c) {
        body += k.phulkariFlower(c[0], c[1], 54, 'pk', 'pink', 'gold');
    });
    [-1, 0, 1].forEach(function (o) {
        body += k.phulkariDiamond(W / 2 + o * 40, 150, 34, 50, 'pk', o ? 'gold' : 'white');
        body += k.phulkariDiamond(W / 2 + o * 40, H - 150, 34, 50, 'pk', o ? 'gold' : 'white');
    });

    // Cotton panel with running-stitch edge.
    body += k.g({ filter: 'url(#pk-shadow)', opacity: 0.4 }, k.rect(236, 236, W - 472, H - 462, '#2a0508', { rx: 6 }));
    body += k.rect(230, 226, W - 460, H - 452, 'url(#pk-cotton)', { rx: 6 });
    body += k.rect(230, 226, W - 460, H - 452, 'url(#pk-panelshade)', { rx: 6 });
    body += k.rect(248, 244, W - 496, H - 488, 'none', { stroke: p.stitch, 'stroke-width': 3, 'stroke-dasharray': '14 9', 'stroke-linecap': 'round', rx: 4 });
    body += k.rect(262, 258, W - 524, H - 516, 'none', { stroke: p.floss.gold[1], 'stroke-width': 1.6, 'stroke-dasharray': '4 6', 'stroke-linecap': 'round', rx: 3, opacity: 0.8 });
    body += k.grainLayer(W, H, 'pk-grain', 0.07);
    return k.svg(W, H, defs, body);
}

module.exports = { id: 'phulkari-bagh-madder', render: render, palettes: Object.keys(PALETTES) };
