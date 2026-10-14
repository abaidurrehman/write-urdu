'use strict';

var k = require('../art-kit.js');

// Gold Ornament: fine-line gilding for quotes, duas and formal greetings.
//  - illuminated: an ivory manuscript page. A ruled gold frame carries a full arabesque
//    in each corner and a small medallion at head and foot, like a Mughal album folio.
//  - vine: a deep teal ground with a single gold vine that climbs the left edge and turns
//    across the top, leaving the right and centre quiet.
// No letters or script appear in the artwork.

var PALETTES = {
    ivory: {
        ground: ['#fffcf3', '#f5ead2'], tint: '#e9d6a6', gold: '#b48a3e', goldDark: '#8a6522', leaf: '#ecd9a6', accent: '#2f6f69', accent2: '#a24b4b'
    },
    teal: {
        ground: ['#0c7185', '#085463', '#05353f'], glow: '#27a1b2', gold: ['#f6e0a0', '#cfa44c', '#8f6828'], leaf: ['#e8c978', '#b88a38'], berry: '#f6e0a0'
    }
};

function cubicPoint(p, t) {
    var u = 1 - t;
    return [
        u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0],
        u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1]
    ];
}

function cubicAngle(p, t) {
    var a = cubicPoint(p, Math.max(0, t - 0.01));
    var b = cubicPoint(p, Math.min(1, t + 0.01));
    return Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
}

function illuminated(W, H, p, rng) {
    var defs = k.linear('go-ground', p.ground, 0, 0, 0.4, 1) + k.mottleFilter('go-mottle', 0.0042, 5) +
        k.radial('go-wash', [[p.tint, 0.5, 0], [p.tint, 0]], '50%', '50%', '62%');
    var body = k.rect(0, 0, W, H, 'url(#go-ground)') + k.rect(0, 0, W, H, 'url(#go-wash)') + k.grainLayer(W, H, 'go-mottle', 0.07);
    // Ruled frame: outer thick, inner fine, with small square joins at the corners.
    body += k.rect(52, 52, W - 104, H - 104, 'none', { stroke: p.gold, 'stroke-width': 3 });
    body += k.rect(70, 70, W - 140, H - 140, 'none', { stroke: p.gold, 'stroke-width': 1.2, opacity: 0.8 });
    body += k.rect(86, 86, W - 172, H - 172, 'none', { stroke: p.gold, 'stroke-width': 0.8, opacity: 0.45 });
    [[52, 52], [W - 52, 52], [52, H - 52], [W - 52, H - 52]].forEach(function (c) {
        body += k.rect(c[0] - 9, c[1] - 9, 18, 18, p.ground[0], { stroke: p.gold, 'stroke-width': 2 });
        body += k.circle(c[0], c[1], 3.4, p.accent2);
    });
    // Corner arabesques.
    var size = 250;
    body += k.arabesque(92, H - 92, size, 0, p.gold, p.leaf, p.accent2, false);
    body += k.arabesque(W - 92, H - 92, size, 0, p.gold, p.leaf, p.accent2, true);
    body += k.arabesque(W - 92, 92, size, 180, p.gold, p.leaf, p.accent2, false);
    body += k.arabesque(92, 92, size, 180, p.gold, p.leaf, p.accent2, true);
    // Medallions at head and foot.
    [86, H - 86].forEach(function (y, i) {
        var dir = i ? -1 : 1;
        body += k.circle(W / 2, y, 34, p.ground[0], { stroke: p.gold, 'stroke-width': 2 });
        body += k.circle(W / 2, y, 26, 'none', { stroke: p.gold, 'stroke-width': 0.9, opacity: 0.7 });
        body += k.blossom(W / 2, y, 21, p.leaf, p.accent2, 0, { count: 8, edge: p.gold });
        body += k.circle(W / 2, y, 4.2, p.accent);
        [-1, 1].forEach(function (s) {
            body += k.path(k.poly([[W / 2 + s * 58, y], [W / 2 + s * 70, y - 8 * dir], [W / 2 + s * 82, y], [W / 2 + s * 70, y + 8 * dir]]), p.accent);
            body += k.stroke('M' + (W / 2 + s * 88) + ' ' + y + ' L' + (W / 2 + s * 150) + ' ' + y, p.gold, 1.2, { opacity: 0.7 });
            body += k.circle(W / 2 + s * 156, y, 3, p.gold);
        });
    });
    return { defs: defs, body: body };
}

function vine(W, H, p, rng) {
    var defs = k.linear('go-ground', p.ground, 0.15, 0, 0.7, 1) + k.linear('go-gold', [p.gold[0], p.gold[1], p.gold[2]], 0, 0, 1, 1) +
        k.linear('go-leaf', [p.leaf[0], p.leaf[1]], 0, 0, 1, 1) + k.radial('go-glow', [[p.glow, 0.5, 0], [p.glow, 0]], '58%', '52%', '60%') +
        k.lozengePattern('go-loz', 46, 46, 'rgba(246,224,160,0.6)', p.gold[0]);
    var body = k.rect(0, 0, W, H, 'url(#go-ground)') + k.rect(0, 0, W, H, 'url(#go-glow)');
    // A faint lozenge dado on the right edge answers the vine on the left.
    body += k.g({ opacity: 0.22 }, k.rect(W - 74, 0, 74, H, 'url(#go-loz)'));
    body += k.rect(W - 78, 0, 2, H, 'url(#go-gold)', { opacity: 0.8 });
    // The main stem: up the left edge, over the top.
    var stem = [[96, H + 30], [20, H * 0.62], [170, H * 0.32], [150, 220]];
    var cap = [[150, 220], [130, 90], [300, 70], [560, 82]];
    var parts = '';
    function branch(curve, from, to, step, flip) {
        for (var t = from; t <= to + 0.0001; t += step) {
            var pt = cubicPoint(curve, t);
            var a = cubicAngle(curve, t);
            var side = flip ? -1 : 1;
            var size = 58 + rng() * 34;
            var turn = (flip ? 1 : -1);
            parts += k.leaf(pt[0], pt[1], size, a + turn * (52 + rng() * 14), 'url(#go-leaf)', 'rgba(70,40,5,0.35)', { width: size * 0.3, curl: side * 5 });
            parts += k.leaf(pt[0], pt[1], size * 0.78, a - turn * (60 + rng() * 14), 'url(#go-leaf)', 'rgba(70,40,5,0.35)', { width: size * 0.26, curl: -side * 5 });
            if (rng() > 0.55) {
                var dx = Math.cos((a - 90) * Math.PI / 180) * 34;
                var dy = Math.sin((a - 90) * Math.PI / 180) * 34;
                parts += k.circle(pt[0] + dx, pt[1] + dy, 5.4, p.berry);
                parts += k.circle(pt[0] + dx * 1.5, pt[1] + dy * 1.5, 3.4, p.berry);
            }
        }
    }
    parts += k.stroke('M' + stem[0] + ' C' + stem[1] + ' ' + stem[2] + ' ' + stem[3], 'url(#go-gold)', 6);
    parts += k.stroke('M' + cap[0] + ' C' + cap[1] + ' ' + cap[2] + ' ' + cap[3], 'url(#go-gold)', 5);
    branch(stem, 0.04, 0.98, 0.075, false);
    branch(cap, 0.08, 0.96, 0.1, true);
    // Blossoms at the turn and at the vine's end.
    [[0.4, stem], [0.78, stem], [0.3, cap], [0.82, cap]].forEach(function (b, i) {
        var pt = cubicPoint(b[1], b[0]);
        parts += k.blossom(pt[0] + (i % 2 ? 14 : -14), pt[1] - 10, 30 - i * 2, p.gold[0], '#9a4a3a', rng() * 60, { count: 6, edge: p.gold[2] });
    });
    body += parts;
    // A small echo of the vine in the lower right.
    body += k.vineScroll(W - 140, H - 86, 210, -8, 'url(#go-gold)', 'url(#go-leaf)', rng, true);
    return { defs: defs, body: body };
}

function render(W, H, options) {
    var o = options || {};
    var layout = o.layout || 'illuminated';
    var p = PALETTES[o.palette || (layout === 'vine' ? 'teal' : 'ivory')];
    var rng = k.seeded('gold-ornament-' + layout);
    var part = layout === 'vine' ? vine(W, H, p, rng) : illuminated(W, H, p, rng);
    var defs = part.defs + k.grainFilter('go-grain', 0.9, 2, 53);
    var body = part.body + k.grainLayer(W, H, 'go-grain', layout === 'vine' ? 0.05 : 0.04, layout === 'vine' ? 'overlay' : 'multiply');
    return k.svg(W, H, defs, body);
}

module.exports = { id: 'gold-ornament', render: render, palettes: Object.keys(PALETTES) };
