'use strict';

var k = require('../art-kit.js');

// Truck Art: an original take on Pakistani truck painting. Saturated enamel colours with
// bold black keylines, chamak-patti style reflective triangle chains, and bouquets with a
// parrot at the corners, around a scalloped panel kept calm for the words.

var PALETTES = {
    turquoise: { ground: '#ffd23f', border: '#e2264d', panel: ['#bff3ee', '#8fe3dc'], keyline: '#1a1414', chain: ['#e2264d', '#1fa37a', '#2f6fd6', '#ff8c1a', '#7a3fd1'], rose: { deep: '#c2103a', mid: '#ff4d6d', light: '#ffc2cf', shade: '#3a0010' }, leaf: '#1f9d55', parrot: ['#22b04b', '#ff3b30', '#ffd23f'] },
    rose: { ground: '#2fc7c0', border: '#ffd23f', panel: ['#fff1f5', '#ffd1df'], keyline: '#1a1414', chain: ['#ff4d6d', '#1fa37a', '#2f6fd6', '#ff8c1a', '#ffd23f'], rose: { deep: '#c2103a', mid: '#ff4d6d', light: '#ffc2cf', shade: '#3a0010' }, leaf: '#1f9d55', parrot: ['#22b04b', '#ff3b30', '#ffd23f'] }
};

function parrot(x, y, s, mirror, c, key) {
    var body = 'M0 0 C30 -40 90 -46 120 -10 C140 14 130 60 100 80 C70 100 30 96 10 120 L-10 160 C-6 120 -16 80 -6 40 Z';
    var parts = k.path(body, c[0], { stroke: key, 'stroke-width': 4 });
    parts += k.path('M20 30 C40 10 80 10 100 30 C80 60 40 70 20 60Z', '#7ee08a', { stroke: key, 'stroke-width': 2 });
    parts += k.path('M120 -10 C150 -12 158 12 140 24 C134 10 128 2 120 -10Z', c[1], { stroke: key, 'stroke-width': 3 });
    parts += k.circle(100, -6, 9, '#ffffff', { stroke: key, 'stroke-width': 2.5 }) + k.circle(102, -6, 4, key);
    parts += k.path('M-10 160 L-40 230 L-4 180 L0 236 L10 170Z', c[2], { stroke: key, 'stroke-width': 2.5 });
    return k.at(x, y, 0, mirror ? [-s, s] : s, parts);
}

function render(W, H, options) {
    var p = PALETTES[(options && options.palette) || 'turquoise'];
    var rng = k.seeded('truck-art');
    var defs = '';
    defs += k.linear('ta-panel', p.panel);
    defs += k.roseDefs('ta-rose', p.rose);
    defs += k.grainFilter('ta-grain', 0.9, 2, 81);

    var body = '';
    body += k.rect(0, 0, W, H, p.ground);
    // Chamak-patti triangle chains around the edge.
    var tri = 30;
    function chain(x0, y0, count, horizontal, flip) {
        var out = '';
        for (var i = 0; i < count; i += 1) {
            var cx = horizontal ? x0 + i * tri : x0;
            var cy = horizontal ? y0 : y0 + i * tri;
            var pts = horizontal
                ? (flip ? [[cx, cy], [cx + tri, cy], [cx + tri / 2, cy - tri * 0.9]] : [[cx, cy], [cx + tri, cy], [cx + tri / 2, cy + tri * 0.9]])
                : (flip ? [[cx, cy], [cx, cy + tri], [cx - tri * 0.9, cy + tri / 2]] : [[cx, cy], [cx, cy + tri], [cx + tri * 0.9, cy + tri / 2]]);
            out += k.path(k.poly(pts), p.chain[i % p.chain.length], { stroke: p.keyline, 'stroke-width': 2 });
        }
        return out;
    }
    body += k.rect(0, 0, W, 48, p.border) + k.rect(0, H - 48, W, 48, p.border) + k.rect(0, 0, 48, H, p.border) + k.rect(W - 48, 0, 48, H, p.border);
    body += chain(0, 48, Math.ceil(W / tri), true, false) + chain(0, H - 48, Math.ceil(W / tri), true, true);
    body += chain(48, 48, Math.ceil(H / tri), false, false) + chain(W - 48, 48, Math.ceil(H / tri), false, true);
    for (var d = 24; d < W; d += 60) body += k.circle(d, 24, 9, '#ffffff', { stroke: p.keyline, 'stroke-width': 2 }) + k.circle(d, H - 24, 9, '#ffffff', { stroke: p.keyline, 'stroke-width': 2 });

    // Scalloped calm panel.
    var px = 190;
    var py = 300;
    var pw = W - 380;
    var ph = H - 560;
    var sc = 'M' + px + ' ' + py;
    var n = 10;
    for (var s = 0; s < n; s += 1) sc += ' q' + (pw / n / 2) + ' -34 ' + (pw / n) + ' 0';
    sc += ' L' + (px + pw) + ' ' + (py + ph);
    for (var b = 0; b < n; b += 1) sc += ' q' + (-pw / n / 2) + ' 34 ' + (-pw / n) + ' 0';
    sc += 'Z';
    body += k.path(sc, p.keyline, { transform: 'translate(8 10)' });
    body += k.path(sc, 'url(#ta-panel)', { stroke: p.keyline, 'stroke-width': 5 });
    body += k.path(sc, 'none', { stroke: p.border, 'stroke-width': 3, transform: 'translate(' + (px + pw / 2) + ' ' + (py + ph / 2) + ') scale(0.94) translate(' + (-(px + pw / 2)) + ' ' + (-(py + ph / 2)) + ')' });

    // Corner bouquets with bold keylines, and a parrot on each upper bouquet.
    function bouquet(x, y, scale, flip) {
        var out = '';
        [[-70, 20, -150], [70, 20, -30], [0, 60, 90], [-90, -30, 200], [90, -30, -20]].forEach(function (l) {
            out += k.at(l[0], l[1], 0, 1, k.path(k.leafShape(90, 30, 6), p.leaf, { stroke: p.keyline, 'stroke-width': 3, transform: 'rotate(' + l[2] + ')' }));
        });
        out += k.rose(-46, -10, 44, 'ta-rose', 10);
        out += k.rose(46, -6, 40, 'ta-rose', -20);
        out += k.rose(0, -56, 50, 'ta-rose', 0);
        out += k.blossom(-90, 40, 22, '#ffffff', p.chain[3], 0, { edge: p.keyline });
        out += k.blossom(92, 44, 20, p.chain[2], '#ffd23f', 20, { edge: p.keyline });
        return k.at(x, y, 0, flip ? [-scale, scale] : scale, out);
    }
    body += bouquet(190, 230, 1, false) + bouquet(W - 190, 230, 1, true);
    body += bouquet(190, H - 220, 0.9, false) + bouquet(W - 190, H - 220, 0.9, true);
    body += parrot(300, 120, 0.7, false, p.parrot, p.keyline) + parrot(W - 300, 120, 0.7, true, p.parrot, p.keyline);
    // Peacock-eye dots in the panel corners.
    [[px + 50, py + 50], [px + pw - 50, py + 50], [px + 50, py + ph - 50], [px + pw - 50, py + ph - 50]].forEach(function (c) {
        body += k.ellipse(c[0], c[1], 14, 20, p.chain[2], { stroke: p.keyline, 'stroke-width': 2 }) + k.ellipse(c[0], c[1] + 3, 7, 10, '#ffd23f') + k.circle(c[0], c[1] + 4, 3.5, p.keyline);
    });
    void rng;
    body += k.grainLayer(W, H, 'ta-grain', 0.05);
    return k.svg(W, H, defs, body);
}

module.exports = { id: 'truck-art-modern-bloom', render: render, palettes: Object.keys(PALETTES) };
