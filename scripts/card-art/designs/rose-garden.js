'use strict';

var k = require('../art-kit.js');

// Garden of Roses: asymmetric botanical stationery. A lush cluster of garden roses, buds,
// eucalyptus and baby's breath spills in from the top-right corner, answered by a smaller
// spray at the bottom-left, over a soft watercolour wash on handmade paper. A hairline gold
// frame is overlapped by the flowers so the arrangement feels placed, not pasted.

var PALETTES = {
    blush: {
        paper: ['#fffaf5', '#fbeee8'], wash: ['#f4c9cf', '#e9d6c4', '#cfdccb'],
        rose: { deep: '#a3334f', mid: '#dc7086', light: '#fbd0d6', shade: '#5a1022' },
        rose2: { deep: '#c76b55', mid: '#eba487', light: '#fde2d0', shade: '#6a2a18' },
        leaf: ['#41603f', '#7d9873'], euca: '#93ab98', stem: '#5d7556', dot: '#ffffff', frame: '#c9a46a'
    },
    ivory: {
        paper: ['#fffdf8', '#f6f0e4'], wash: ['#efd9c8', '#e6e0cf', '#d3dccf'],
        rose: { deep: '#b28457', mid: '#e3c39d', light: '#fff4e3', shade: '#6b4a24' },
        rose2: { deep: '#c47a72', mid: '#e8b2a9', light: '#fde9e3', shade: '#6b2c24' },
        leaf: ['#4c6447', '#8aa080'], euca: '#a3b6a8', stem: '#61795c', dot: '#ffffff', frame: '#bf9b62'
    }
};

function cluster(rng, p, scale) {
    var s = scale;
    var parts = '';
    // Foliage first (behind the blooms).
    parts += k.roundLeafStem(0, 0, 300 * s, 200, 'url(#rg-euca)', p.stem, rng);
    parts += k.roundLeafStem(0, 0, 260 * s, 112, 'url(#rg-euca)', p.stem, rng);
    parts += k.leaf(-40 * s, 30 * s, 150 * s, 150, 'url(#rg-leaf)', 'rgba(255,255,255,0.4)', { curl: 12 * s });
    parts += k.leaf(-10 * s, 60 * s, 130 * s, 118, 'url(#rg-leaf)', 'rgba(255,255,255,0.4)', { curl: -10 * s });
    parts += k.leaf(-120 * s, -10 * s, 120 * s, 190, 'url(#rg-leaf)', 'rgba(255,255,255,0.4)', { curl: 8 * s });
    parts += k.leaf(-60 * s, 120 * s, 110 * s, 100, 'url(#rg-leaf)', 'rgba(255,255,255,0.4)', { curl: 10 * s });
    parts += k.sprig(-150 * s, 40 * s, 170 * s, 170, p.stem, p.dot, rng, 12);
    parts += k.sprig(-30 * s, 140 * s, 160 * s, 105, p.stem, p.dot, rng, 11);
    parts += k.sprig(-210 * s, -20 * s, 120 * s, 200, p.stem, p.dot, rng, 8);
    // Blooms.
    parts += k.rose(-150 * s, 60 * s, 62 * s, 'rg-b', 20, { edge: 'rgba(255,255,255,0.4)', line: 'rgba(110,40,30,0.25)' });
    parts += k.rose(-10 * s, -10 * s, 92 * s, 'rg-a', -8);
    parts += k.rose(-40 * s, 150 * s, 54 * s, 'rg-a', 40);
    parts += k.rosebud(-250 * s, 10 * s, 26 * s, -70, 'rg-a', 'url(#rg-leaf)');
    parts += k.rosebud(-60 * s, 250 * s, 24 * s, 200, 'rg-b', 'url(#rg-leaf)');
    parts += k.blossom(-200 * s, 110 * s, 16 * s, '#ffffff', '#e8c56b', 15, { stamens: '#c9a046' });
    parts += k.blossom(-100 * s, 210 * s, 13 * s, '#ffffff', '#e8c56b', 40, { stamens: '#c9a046' });
    parts += k.blossom(70 * s, 100 * s, 14 * s, '#ffffff', '#e8c56b', 0, { stamens: '#c9a046' });
    return parts;
}

function render(W, H, options) {
    var p = PALETTES[(options && options.palette) || 'blush'];
    var rng = k.seeded('rose-garden');
    var defs = '';
    defs += k.linear('rg-paper', p.paper, 0, 0, 0.4, 1);
    defs += k.linear('rg-leaf', [p.leaf[0], p.leaf[1]], 0, 0, 1, 0);
    defs += k.linear('rg-euca', [p.euca, '#c4d2c6'], 0, 0, 1, 1);
    defs += k.roseDefs('rg-a', p.rose);
    defs += k.roseDefs('rg-b', p.rose2);
    defs += k.blur('rg-soft', 38);
    defs += k.blur('rg-shadow', 10);
    defs += k.grainFilter('rg-grain', 0.8, 3, 4);
    defs += k.mottleFilter('rg-mottle', 0.0045, 9);

    var body = '';
    body += k.rect(0, 0, W, H, 'url(#rg-paper)');
    body += k.grainLayer(W, H, 'rg-mottle', 0.07);
    // Watercolour washes behind each cluster.
    body += k.g({ filter: 'url(#rg-soft)', opacity: 0.55 },
        k.ellipse(W - 140, 170, 300, 200, p.wash[0]) + k.ellipse(W - 330, 90, 180, 120, p.wash[2]) + k.ellipse(W - 60, 380, 140, 190, p.wash[1]) +
        k.ellipse(150, H - 150, 230, 160, p.wash[0]) + k.ellipse(300, H - 70, 170, 100, p.wash[2]));
    // Hairline frame, overlapped by the arrangement.
    body += k.rect(64, 64, W - 128, H - 128, 'none', { stroke: p.frame, 'stroke-width': 2, opacity: 0.8 });
    body += k.rect(76, 76, W - 152, H - 152, 'none', { stroke: p.frame, 'stroke-width': 0.8, opacity: 0.55 });
    // Soft drop shadow under each cluster.
    body += k.g({ filter: 'url(#rg-shadow)', opacity: 0.18, transform: 'translate(8 14)' },
        k.at(W - 110, 150, 0, 1, cluster(k.seeded('rose-garden'), p, 1.25)));
    body += k.at(W - 110, 150, 0, 1, cluster(rng, p, 1.25));
    body += k.at(150, H - 150, 180, 1, cluster(k.seeded('rose-garden-low'), p, 0.82));
    // A few drifting petals.
    [[260, 330, 30], [830, 620, -40], [190, 900, 70], [760, 1180, 10]].forEach(function (pt, i) {
        body += k.at(pt[0], pt[1], pt[2], 1, k.path('M0 0 C8 -10 22 -10 26 0 C22 9 8 9 0 0Z', i % 2 ? p.rose.mid : p.rose2.mid, { opacity: 0.55 }));
    });
    body += k.grainLayer(W, H, 'rg-grain', 0.06);
    return k.svg(W, H, defs, body);
}

module.exports = { id: 'rose-garden-blush', render: render, palettes: Object.keys(PALETTES) };
