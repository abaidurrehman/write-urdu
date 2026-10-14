'use strict';

var k = require('../art-kit.js');

// Moonlit Poetry: a quiet night for a ghazal. A haloed moon rides behind thin cloud, three
// ridges fade into mist, and the moon's light breaks into glitter on a still lake. A
// silhouetted branch frames the upper corner. The open sky in the middle belongs to the poem.

var PALETTES = {
    indigo: { sky: ['#070f24', '#13224a', '#2a3d6e', '#4b5d8c'], halo: '#cfd9ff', moon: ['#fffaf0', '#f2e6c4'], crater: '#b9a77a', cloud: '#a8b6e0', ridges: ['#33446f', '#1f2c52', '#111a35'], water: ['#1a2750', '#0a1129'], glint: '#fff1c9', branch: '#060b1a' },
    dusk: { sky: ['#1d1033', '#3b1f54', '#6d3a6b', '#b06a6e'], halo: '#ffd6c2', moon: ['#fffaf0', '#f6dcc0'], crater: '#c2977a', cloud: '#e5a9a6', ridges: ['#5a2f5e', '#3b1d45', '#20102a'], water: ['#3a1e48', '#160a1f'], glint: '#ffe3c4', branch: '#12081a' }
};

function branch(color, rng) {
    var parts = k.stroke('M0 0 C80 30 160 40 240 90 C300 128 340 170 380 240', color, 9);
    parts += k.stroke('M150 46 C180 100 190 150 182 210', color, 5);
    parts += k.stroke('M260 100 C300 110 340 100 380 120', color, 4);
    parts += k.stroke('M60 18 C80 60 84 100 76 140', color, 3.5);
    var anchors = [[40, 14], [90, 30], [140, 44], [190, 60], [240, 90], [290, 120], [330, 160], [360, 205], [176, 120], [184, 190], [320, 106], [370, 118], [78, 100]];
    anchors.forEach(function (a) {
        for (var i = 0; i < 4; i += 1) {
            var ang = 40 + rng() * 120;
            k.leaf; // keep reference for readers: leaves are slim willow-like blades below
            parts += k.at(a[0], a[1], ang, 1, k.path(k.leafShape(26 + rng() * 22, 6 + rng() * 3, (rng() - 0.5) * 6), color));
        }
    });
    return parts;
}

function render(W, H, options) {
    var p = PALETTES[(options && options.palette) || 'indigo'];
    var rng = k.seeded('moonlit-poetry');
    var mx = 770;
    var my = 250;
    var mr = 78;
    var horizon = 1040;
    var defs = '';
    defs += k.linear('mp-sky', [[p.sky[0], 1, 0], [p.sky[1], 1, 0.38], [p.sky[2], 1, 0.7], [p.sky[3], 1, 1]]);
    defs += k.radial('mp-halo', [[p.halo, 0.42, 0], [p.halo, 0.16, 0.28], [p.halo, 0.05, 0.6], [p.halo, 0, 1]]);
    defs += k.radial('mp-moon', [[p.moon[0], 1, 0], [p.moon[1], 1, 1]], '42%', '38%', '70%');
    defs += k.linear('mp-water', p.water);
    defs += k.linear('mp-mist', [[p.sky[3], 0], [p.sky[3], 0.55], [p.sky[3], 0]]);
    defs += k.blur('mp-cloud', 18);
    defs += k.blur('mp-mistblur', 26);
    defs += k.blur('mp-glow', 3);
    defs += k.blur('mp-crater', 6);
    defs += k.radial('mp-innerhalo', [[p.halo, 0.55, 0], [p.halo, 0, 1]]);
    defs += k.grainFilter('mp-grain', 0.95, 2, 21);

    var body = '';
    body += k.rect(0, 0, W, H, 'url(#mp-sky)');
    body += k.stars(W, H, 150, rng, '#ffffff', horizon - 120, 0.6, 2.4);
    body += k.g({ filter: 'url(#mp-glow)' }, k.stars(W, H, 12, rng, '#fff6dc', 700, 1.6, 3.2));
    body += k.circle(mx, my, 420, 'url(#mp-halo)');
    body += k.circle(mx, my, mr * 1.9, 'url(#mp-innerhalo)');
    body += k.circle(mx, my, mr, 'url(#mp-moon)');
    body += k.g({ filter: 'url(#mp-crater)', opacity: 0.32 }, k.circle(mx - 26, my - 12, 18, p.crater) + k.circle(mx + 22, my + 20, 22, p.crater) + k.circle(mx + 6, my - 34, 10, p.crater) + k.circle(mx - 12, my + 34, 11, p.crater));
    // Cloud wisps drifting across the moon and the upper sky.
    body += k.g({ filter: 'url(#mp-cloud)', opacity: 0.5 },
        k.ellipse(mx - 40, my + 60, 210, 22, p.cloud) + k.ellipse(mx + 120, my + 40, 150, 16, p.cloud) +
        k.ellipse(300, 430, 260, 20, p.cloud, { opacity: 0.6 }) + k.ellipse(520, 520, 200, 14, p.cloud, { opacity: 0.4 }));
    // Ridges with atmospheric perspective.
    body += k.path(k.ridge(W, horizon - 110, 60, k.seeded('r1'), horizon + 4, 3), p.ridges[0], { opacity: 0.85 });
    body += k.rect(0, horizon - 120, W, 140, 'url(#mp-mist)', { filter: 'url(#mp-mistblur)', opacity: 0.6 });
    body += k.path(k.ridge(W, horizon - 50, 46, k.seeded('r2'), horizon + 4, 3), p.ridges[1]);
    body += k.path(k.ridge(W, horizon - 50, 46, k.seeded('r2'), horizon + 4, 3), 'none', { stroke: p.halo, 'stroke-width': 1.2, opacity: 0.18 });
    body += k.path(k.ridge(W, horizon - 14, 22, k.seeded('r3'), horizon + 4, 4), p.ridges[2]);
    // Still lake with the moon path.
    body += k.rect(0, horizon, W, H - horizon, 'url(#mp-water)');
    body += k.g({ filter: 'url(#mp-glow)' }, (function () {
        var glints = '';
        for (var i = 0; i < 46; i += 1) {
            var t = i / 46;
            var y = horizon + 10 + t * (H - horizon - 20);
            var spread = 14 + t * 90;
            var w = 10 + rng() * 40 * (1 - t * 0.4);
            glints += k.rect(mx - w / 2 + (rng() - 0.5) * spread, y, w, 2 + t * 2, p.glint, { rx: 1.5, opacity: n2(0.85 - t * 0.55) });
        }
        return glints;
    }()));
    for (var r = 0; r < 9; r += 1) body += k.rect(60 + rng() * (W - 300), horizon + 30 + rng() * 260, 80 + rng() * 160, 1.4, '#c7d2f5', { opacity: 0.18 });
    // Framing branch from the top-left corner.
    body += k.at(-30, -20, 4, 1.45, branch(p.branch, rng));
    body += reeds(30, H, 1, p.branch, rng) + reeds(W - 30, H, -1, p.branch, rng);
    body += k.grainLayer(W, H, 'mp-grain', 0.08, 'overlay');
    return k.svg(W, H, defs, body);
}

// Foreground reeds and grasses rising from the bottom corners, leaning inward.
function reeds(x, bottom, dir, color, rng) {
    var parts = '';
    for (var i = 0; i < 16; i += 1) {
        var bx = x + dir * rng() * 150;
        var h = 120 + rng() * 210;
        var lean = dir * (20 + rng() * 60);
        parts += k.path('M' + (bx - 3) + ' ' + bottom + ' Q' + (bx + lean * 0.3) + ' ' + (bottom - h * 0.6) + ' ' + (bx + lean) + ' ' + (bottom - h) + ' Q' + (bx + lean * 0.3 + 4) + ' ' + (bottom - h * 0.6) + ' ' + (bx + 4) + ' ' + bottom + 'Z', color);
        if (i % 4 === 0) parts += k.ellipse(bx + lean * 0.92, bottom - h * 0.96, 5, 22, color, { transform: 'rotate(' + Math.round(lean * 0.4) + ' ' + Math.round(bx + lean * 0.92) + ' ' + Math.round(bottom - h * 0.96) + ')' });
    }
    return parts;
}

function n2(value) { return Math.round(value * 100) / 100; }

module.exports = { id: 'moonlit-poetry-night', render: render, palettes: Object.keys(PALETTES) };
