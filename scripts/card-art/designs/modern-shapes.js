'use strict';

var k = require('../art-kit.js');

// Modern Shapes: contemporary social graphics built from a few confident forms.
//  - friends: warm pastel blobs, two linked rings and a playful squiggle around the edges.
//  - noir: black ground, a sand quarter-disc and fine gold arcs; spare and assured, for
//    self-respect and resolve.

var PALETTES = {
    friends: { ground: '#fff4e8', shapes: ['#ffc8a8', '#a8dcc8', '#ffe08a', '#c8c4f4', '#ff9f8a'], line: '#2f3a56', dots: '#2f3a56' },
    noir: { ground: '#0e0d0c', sand: '#d9c39a', sandDeep: '#b79f72', gold: '#c9a35a', line: '#3a342a' }
};

function blob(cx, cy, r, rng, fill) {
    var pts = [];
    var n = 7;
    for (var i = 0; i < n; i += 1) {
        var a = (Math.PI * 2 * i) / n;
        var rr = r * (0.82 + rng() * 0.32);
        pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    var d = 'M' + ((pts[0][0] + pts[n - 1][0]) / 2).toFixed(1) + ' ' + ((pts[0][1] + pts[n - 1][1]) / 2).toFixed(1);
    for (var j = 0; j < n; j += 1) {
        var a1 = pts[j];
        var b1 = pts[(j + 1) % n];
        d += ' Q' + a1[0].toFixed(1) + ' ' + a1[1].toFixed(1) + ' ' + ((a1[0] + b1[0]) / 2).toFixed(1) + ' ' + ((a1[1] + b1[1]) / 2).toFixed(1);
    }
    return k.path(d + 'Z', fill);
}

function render(W, H, options) {
    var o = options || {};
    var layout = o.layout || 'friends';
    var p = PALETTES[o.palette || layout];
    var rng = k.seeded('shapes-' + layout);
    var defs = k.grainFilter('ms-grain', 0.9, 2, 61);
    var body = k.rect(0, 0, W, H, p.ground);

    if (layout === 'friends') {
        var s = p.shapes;
        body += blob(80, 120, 230, rng, s[0]) + blob(W - 60, 260, 200, rng, s[1]) + blob(W - 140, H - 90, 250, rng, s[2]) + blob(110, H - 200, 180, rng, s[3]);
        body += k.circle(W - 250, 110, 46, s[4]);
        body += k.circle(250, H - 70, 30, s[1]);
        // Two linked rings: a quiet friendship symbol.
        body += k.circle(470, 210, 62, 'none', { stroke: p.line, 'stroke-width': 7 });
        body += k.circle(560, 210, 62, 'none', { stroke: s[4], 'stroke-width': 7 });
        body += k.stroke('M520 158 A62 62 0 0 1 532 170', p.line, 7);
        body += k.stroke('M140 560 q30 -40 60 0 t60 0 t60 0', p.line, 5);
        body += k.stroke('M800 1010 q24 -32 48 0 t48 0 t48 0', p.line, 5);
        for (var d = 0; d < 26; d += 1) {
            var x = rng() * W;
            var y = rng() * H;
            if (x > 180 && x < W - 180 && y > 330 && y < H - 300) continue;
            body += k.circle(x, y, 4 + rng() * 4, p.dots, { opacity: 0.8 });
        }
        body += k.sparkle(W - 300, 520, 22, s[4]) + k.sparkle(220, 980, 16, p.line);
    } else {
        body += k.circle(0, H, 520, p.sand);
        body += k.circle(0, H, 520, 'none', { stroke: p.sandDeep, 'stroke-width': 2 });
        body += k.circle(0, H, 440, 'none', { stroke: p.ground, 'stroke-width': 1.5, opacity: 0.4 });
        [600, 660, 720].forEach(function (r, i) { body += k.circle(0, H, r, 'none', { stroke: p.gold, 'stroke-width': i === 1 ? 2 : 1, opacity: 0.8 - i * 0.2 }); });
        body += k.rect(W - 120, 120, 26, 420, p.sand);
        body += k.rect(W - 80, 120, 4, 300, p.gold);
        body += k.circle(W - 210, 150, 34, 'none', { stroke: p.gold, 'stroke-width': 2 });
        body += k.rect(120, 120, 200, 2, p.gold, { opacity: 0.8 });
        body += k.rect(120, 132, 120, 2, p.gold, { opacity: 0.5 });
        for (var g = 0; g < 7; g += 1) body += k.rect(120 + g * 18, 168, 8, 8, p.line);
    }
    body += k.grainLayer(W, H, 'ms-grain', layout === 'noir' ? 0.1 : 0.05, layout === 'noir' ? 'screen' : 'multiply');
    return k.svg(W, H, defs, body);
}

module.exports = { id: 'modern-shapes', render: render, palettes: Object.keys(PALETTES) };
