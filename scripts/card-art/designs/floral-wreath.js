'use strict';

var k = require('../art-kit.js');

// Floral Wreath: botanical stationery for weddings and keepsakes.
//  - wreath: an oval wreath of garden roses, buds, blossoms and eucalyptus around a blush
//    ground; the wreath is full at the lower-left and upper-right and thins to a few leaves
//    elsewhere, so the oval reads as hand-tied, not stamped.
//  - dado: cream wallpaper-style bands of small floral lozenges across the top and foot,
//    with pressed-flower sprays; the middle of the card is plain aged paper.
// No letters or script appear in the artwork.

var PALETTES = {
    blush: {
        ground: ['#fff7f1', '#fbe6df', '#f5d3cf'], wash: ['#f6c7cd', '#f3dac3', '#d4dfcf'], gold: '#c9a46a',
        rose: { deep: '#a73450', mid: '#dd7188', light: '#fbd0d6', shade: '#5a1022' },
        rose2: { deep: '#c96a56', mid: '#eaa388', light: '#fde2d0', shade: '#6a2a18' },
        leaf: ['#41603f', '#7d9873'], euca: '#97ae9b', stem: '#5d7556'
    },
    cream: {
        ground: ['#fcf5e4', '#f4e8cd', '#ead9b4'], rose: '#a9605e', rose2: '#c9918a', sage: '#7d8f6b', sage2: '#a8b595', bud: '#d9a65f', ink: '#6a4a3c', line: '#b9976b'
    }
};

function wreath(W, H, p, rng) {
    var defs = k.linear('fw-ground', p.ground, 0.2, 0, 0.8, 1) + k.roseDefs('fw-a', p.rose) + k.roseDefs('fw-b', p.rose2) +
        k.linear('fw-leaf', p.leaf, 0, 0, 1, 0) + k.linear('fw-euca', [p.euca, '#c7d4c9'], 0, 0, 1, 1) + k.blur('fw-soft', 44) + k.blur('fw-shadow', 9) + k.mottleFilter('fw-mottle', 0.0045, 17);
    var body = k.rect(0, 0, W, H, 'url(#fw-ground)') + k.grainLayer(W, H, 'fw-mottle', 0.06);
    body += k.g({ filter: 'url(#fw-soft)', opacity: 0.45 }, k.ellipse(W * 0.78, 250, 260, 200, p.wash[0]) + k.ellipse(W * 0.22, H - 260, 280, 220, p.wash[1]));
    var cx = W / 2;
    var cy = H / 2;
    var rx = 412;
    var ry = 540;
    // Hairline ring echoing the wreath on the inside.
    body += k.ellipse(cx, cy, rx - 86, ry - 100, 'none', { stroke: p.gold, 'stroke-width': 1.4, opacity: 0.7 });
    body += k.ellipse(cx, cy, rx - 98, ry - 112, 'none', { stroke: p.gold, 'stroke-width': 0.7, opacity: 0.45 });
    var foliage = '';
    var blooms = '';
    var shadow = '';
    // Foliage and filler all the way round (thicker where the wreath is full).
    for (var i = 0; i < 110; i += 1) {
        var a = (Math.PI * 2 * i) / 110 + rng() * 0.05;
        var weight = 0.45 + 0.55 * Math.max(Math.cos(a + 0.78), Math.cos(a - 2.36));
        var x = cx + Math.cos(a) * rx;
        var y = cy + Math.sin(a) * ry;
        var tangent = Math.atan2(Math.cos(a) * ry, -Math.sin(a) * rx) * 180 / Math.PI;
        var dir = i % 2 ? 1 : -1;
        foliage += k.leaf(x, y, (78 + rng() * 44) * (0.7 + weight * 0.5), tangent + dir * (30 + rng() * 40), i % 3 ? 'url(#fw-leaf)' : 'url(#fw-euca)', 'rgba(255,255,255,0.3)', { width: 26, curl: dir * 4 });
        if (weight > 0.55 && i % 4 === 0) blooms += k.blossom(x + (rng() - 0.5) * 30, y + (rng() - 0.5) * 30, 14, '#ffffff', '#e8c56b', rng() * 70, { stamens: '#c9a046' });
    }
    // Roses concentrated on the full arcs.
    var placed = 0;
    var guard = 0;
    while (placed < 15 && guard < 200) {
        guard += 1;
        var ang = rng() * Math.PI * 2;
        var wgt = Math.max(Math.cos(ang + 0.78), Math.cos(ang - 2.36));
        if (rng() > wgt * 1.05 + 0.05) continue;
        var r = 38 + wgt * 38 + rng() * 14;
        var rxAdj = rx + (rng() - 0.5) * 40;
        var ryAdj = ry + (rng() - 0.5) * 40;
        var bx = cx + Math.cos(ang) * rxAdj;
        var by = cy + Math.sin(ang) * ryAdj;
        blooms += k.rose(bx, by, r, placed % 2 ? 'fw-b' : 'fw-a', rng() * 360);
        shadow += k.circle(bx, by + 16, r * 0.9, '#7a2a30');
        if (placed % 3 === 0) blooms += k.rosebud(bx + 44, by - 40, 22, rng() * 360, placed % 2 ? 'fw-a' : 'fw-b', 'url(#fw-leaf)');
        placed += 1;
    }
    body += k.g({ filter: 'url(#fw-shadow)', opacity: 0.15, transform: 'translate(6 12)' }, foliage + shadow);
    body += foliage + blooms;
    // Eucalyptus sprays trail off the two full arcs.
    body += k.roundLeafStem(W - 150, 150, 260, 130, 'url(#fw-euca)', p.stem, rng);
    body += k.roundLeafStem(150, H - 150, 260, -50, 'url(#fw-euca)', p.stem, rng);
    return { defs: defs, body: body };
}

function dado(W, H, p, rng) {
    var defs = k.linear('fw-ground', p.ground, 0.2, 0, 0.8, 1) + k.mottleFilter('fw-mottle', 0.0038, 23) +
        k.lozengePattern('fw-loz', 62, 62, p.rose2, p.bud) + k.lozengePattern('fw-loz2', 62, 62, p.sage, p.rose, p.ground[1]);
    var body = k.rect(0, 0, W, H, 'url(#fw-ground)') + k.grainLayer(W, H, 'fw-mottle', 0.1);
    // Two wallpaper bands: a light one on top, a deeper one at the foot.
    body += k.rect(0, 0, W, 150, 'url(#fw-loz2)', { opacity: 0.8 });
    body += k.rect(0, 150, W, 5, p.line, { opacity: 0.8 }) + k.rect(0, 162, W, 1.5, p.line, { opacity: 0.55 });
    body += k.rect(0, H - 260, W, 260, 'url(#fw-loz)', { opacity: 0.72 });
    body += k.rect(0, H - 266, W, 5, p.line, { opacity: 0.8 }) + k.rect(0, H - 278, W, 1.5, p.line, { opacity: 0.55 });
    // Soft vignette to age the paper.
    body += k.g({ opacity: 0.2 }, k.rect(0, 163, 36, H - 441, p.line) + k.rect(W - 36, 163, 36, H - 441, p.line));
    // Pressed sprays sit on the rules at both ends.
    function spray(x, y, angle, flip) {
        var s = '';
        s += k.roundLeafStem(0, 0, 230, 0, p.sage2, p.sage, rng);
        s += k.leaf(60, 0, 100, -30, p.sage, 'rgba(255,255,255,0.3)', { width: 28 }) + k.leaf(120, 0, 90, 28, p.sage, 'rgba(255,255,255,0.3)', { width: 26 });
        s += k.blossom(40, -26, 24, p.rose2, p.bud, 14, { count: 5, edge: 'rgba(110,50,40,0.25)' }) + k.blossom(120, 30, 28, p.rose, p.bud, 40, { count: 5, edge: 'rgba(110,50,40,0.25)' });
        s += k.blossom(190, -18, 18, '#fff7e6', p.bud, 0, { count: 5, edge: 'rgba(110,50,40,0.2)' });
        s += k.circle(80, 36, 5, p.bud) + k.circle(158, -34, 4.4, p.bud);
        return k.at(x, y, angle, flip ? [-1, 1] : 1, s);
    }
    body += spray(60, 160, 18, false) + spray(W - 60, 160, -18, true);
    body += spray(60, H - 276, -18, false) + spray(W - 60, H - 276, 18, true);
    // Small keepsake motif centred on the top rule.
    body += k.at(W / 2, 156, 0, 1, k.circle(0, 0, 32, p.ground[0], { stroke: p.line, 'stroke-width': 2 }) + k.blossom(0, 0, 22, p.rose2, p.bud, 0, { count: 8, edge: 'rgba(110,50,40,0.25)' }));
    return { defs: defs, body: body };
}

function render(W, H, options) {
    var o = options || {};
    var layout = o.layout || 'wreath';
    var p = PALETTES[o.palette || (layout === 'dado' ? 'cream' : 'blush')];
    var rng = k.seeded('floral-wreath-' + layout);
    var part = layout === 'dado' ? dado(W, H, p, rng) : wreath(W, H, p, rng);
    var defs = part.defs + k.grainFilter('fw-grain', 0.85, 3, 67);
    var body = part.body + k.grainLayer(W, H, 'fw-grain', 0.05);
    return k.svg(W, H, defs, body);
}

module.exports = { id: 'floral-wreath', render: render, palettes: Object.keys(PALETTES) };
