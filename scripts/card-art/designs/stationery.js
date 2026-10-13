'use strict';

var k = require('../art-kit.js');

// Stationery: minimal cards that feel intentionally finished, not empty.
//  - letterpress: heavy cream cotton card with a blind-debossed double border and a small
//    gold-foil sprig, for poetry that wants silence around it.
//  - pressed: warm kraft paper with a pressed fern and a dried flower taped at the corner.

var PALETTES = {
    cream: { paper: ['#fdfaf1', '#f3ecdc'], deboss: '#e3d8bf', light: '#ffffff', foil: ['#f2dc9c', '#c59a45', '#8c6420'], ink: '#3c3324' },
    kraft: { paper: ['#e7d2b0', '#d6bb92'], deboss: '#c4a77b', light: '#f3e4c8', foil: ['#f2dc9c', '#c59a45', '#8c6420'], ink: '#493927', fern: '#6f7d4f', fernDark: '#4f5c36', flower: '#c9785e', tape: 'rgba(250,244,228,0.75)' }
};

function fern(length, color, dark, rng) {
    var parts = k.stroke('M0 0 C' + (length * 0.3) + ' -20 ' + (length * 0.7) + ' -16 ' + length + ' -40', dark, 3);
    var pairs = 16;
    for (var i = 1; i < pairs; i += 1) {
        var t = i / pairs;
        var x = length * t;
        var y = -20 * Math.sin(t * Math.PI * 0.9) - 24 * t * t;
        var leafLen = (1 - t) * 70 + 14;
        parts += k.leaf(x, y, leafLen, -70 - t * 10 + (rng() - 0.5) * 6, color, dark, { width: leafLen * 0.22, curl: -3 });
        parts += k.leaf(x, y, leafLen * 0.92, 72 + t * 8 + (rng() - 0.5) * 6, color, dark, { width: leafLen * 0.22, curl: 3 });
    }
    return parts;
}

function render(W, H, options) {
    var o = options || {};
    var p = PALETTES[o.palette || 'cream'];
    var layout = o.layout || 'letterpress';
    var rng = k.seeded('stationery-' + layout);
    var defs = '';
    defs += k.radial('st-paper', [[p.paper[0], 1, 0], [p.paper[0], 1, 0.45], [p.paper[1], 1, 1]], '50%', '45%', '78%');
    defs += k.linear('st-foil', [p.foil[0], p.foil[1], p.foil[0], p.foil[2]], 0, 0, 1, 1);
    defs += k.mottleFilter('st-mottle', layout === 'pressed' ? 0.01 : 0.004, 2);
    defs += k.grainFilter('st-grain', layout === 'pressed' ? 0.6 : 0.85, 4, 27);
    defs += k.blur('st-shadow', 6);

    var body = '';
    body += k.rect(0, 0, W, H, 'url(#st-paper)');
    body += k.grainLayer(W, H, 'st-mottle', layout === 'pressed' ? 0.16 : 0.06);
    body += k.grainLayer(W, H, 'st-grain', layout === 'pressed' ? 0.14 : 0.07);

    function debossRect(x, y, w, h, rx) {
        // Blind deboss: a dark edge offset up-left and a light edge offset down-right.
        return k.rect(x - 1.2, y - 1.2, w, h, 'none', { stroke: p.deboss, 'stroke-width': 2.4, rx: rx }) +
            k.rect(x + 1.2, y + 1.2, w, h, 'none', { stroke: p.light, 'stroke-width': 2, rx: rx, opacity: 0.9 });
    }

    if (layout === 'letterpress') {
        body += debossRect(84, 84, W - 168, H - 168, 18);
        body += debossRect(108, 108, W - 216, H - 216, 10);
        // Gold foil sprig and fine rule at the top, a small foil diamond below.
        body += k.at(W / 2, 236, 0, 1.8,
            k.stroke('M-110 0 L-30 0 M30 0 L110 0', 'url(#st-foil)', 1) +
            k.leaf(0, 0, 34, -120, 'url(#st-foil)', null, { width: 9 }) + k.leaf(0, 0, 34, -60, 'url(#st-foil)', null, { width: 9 }) +
            k.leaf(0, 0, 26, -160, 'url(#st-foil)', null, { width: 7 }) + k.leaf(0, 0, 26, -20, 'url(#st-foil)', null, { width: 7 }) +
            k.circle(0, 4, 5, 'url(#st-foil)'));
        body += k.at(W / 2, H - 236, 0, 1, k.stroke('M-90 0 L-24 0 M24 0 L90 0', 'url(#st-foil)', 1.4) + k.path(k.poly([[0, -9], [9, 0], [0, 9], [-9, 0]]), 'url(#st-foil)'));
    } else {
        body += debossRect(70, 70, W - 140, H - 140, 6);
        // Pressed fern rising from the lower left corner, slightly translucent like a dried leaf.
        body += k.g({ filter: 'url(#st-shadow)', opacity: 0.25, transform: 'translate(6 8)' }, k.at(110, H - 100, -24, 1, fern(380, '#2a2010', '#2a2010', k.seeded('fern'))));
        body += k.at(110, H - 100, -24, 1, fern(380, p.fern, p.fernDark, k.seeded('fern')), { opacity: 0.9 });
        // A dried flower and its strip of tape near the upper right.
        body += k.at(W - 200, 200, 18, 1,
            k.stroke('M0 0 C-20 60 -30 120 -60 180', p.fernDark, 2.4) +
            k.blossom(0, 0, 38, p.flower, '#8a4b2c', 0, { count: 5, stamens: '#e2b35b' }) +
            k.leaf(-40, 110, 50, 160, p.fern, p.fernDark, { width: 12 }));
        body += k.rect(W - 280, 150, 150, 40, p.tape, { transform: 'rotate(-24 ' + (W - 205) + ' 170)' });
        body += k.rect(60, H - 200, 130, 36, p.tape, { transform: 'rotate(32 125 ' + (H - 182) + ')' });
        void rng;
    }
    return k.svg(W, H, defs, body);
}

module.exports = { id: 'stationery', render: render, palettes: Object.keys(PALETTES) };
