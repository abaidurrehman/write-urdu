'use strict';

var k = require('../art-kit.js');

// Paper & Ink: a leaf from a hand-copied diwan. Burnished handmade paper with a deckled edge
// rests on linen; the text block is ruled with a manuscript jadwal (fine coloured rules either
// side of a gold band), crowned by a small illuminated sarlauh band, with an ink-drawn sprig in
// the margin. Restraint is the point: generous whitespace for verse.

var PALETTES = {
    natural: { linen: ['#d9d1c3', '#c8bfae'], paper: ['#fbf5e6', '#f2e6cc'], gold: ['#e5c779', '#b98d36'], lapis: '#24427a', vermilion: '#b13a2a', ink: '#2b241d', sprig: '#3a3128' },
    rose: { linen: ['#ded0cb', '#cbb9b3'], paper: ['#fcf4ee', '#f3e3d7'], gold: ['#e8c88a', '#b98d4a'], lapis: '#4a3a6e', vermilion: '#b3434a', ink: '#33242a', sprig: '#3e2c33' }
};

function deckle(x, y, w, h, rng) {
    // Irregular edge: many small jitters along each side.
    var pts = [];
    var step = 14;
    var j = function () { return (rng() - 0.5) * 5; };
    for (var i = 0; i <= w; i += step) pts.push([x + i, y + j()]);
    for (var a = 0; a <= h; a += step) pts.push([x + w + j(), y + a]);
    for (var b = w; b >= 0; b -= step) pts.push([x + b, y + h + j()]);
    for (var c = h; c >= 0; c -= step) pts.push([x + j(), y + c]);
    return k.poly(pts);
}

function inkSprig(color) {
    // Brush-drawn stem with tapered leaves and two buds; varied stroke weights read as a pen.
    var parts = k.stroke('M0 0 C20 -60 30 -130 70 -200 C90 -236 120 -258 150 -268', color, 3.2);
    parts += k.stroke('M44 -110 C70 -120 96 -116 118 -100', color, 2);
    parts += k.stroke('M64 -170 C40 -186 26 -206 22 -232', color, 1.8);
    [[24, -50, -62, 46], [36, -96, -130, 40], [54, -140, -40, 42], [84, -208, -128, 36], [100, -112, 10, 38], [120, -250, -30, 32], [30, -214, -110, 30]].forEach(function (l) {
        parts += k.at(l[0], l[1], l[2], 1, k.path(k.leafShape(l[3], l[3] * 0.24, 2), 'none', { stroke: color, 'stroke-width': 1.6 }) + k.stroke('M3 0 Q' + l[3] * 0.5 + ' 1 ' + l[3] * 0.9 + ' 1', color, 0.9));
    });
    parts += k.at(150, -268, -30, 1, k.path('M0 0 C8 -10 10 -22 0 -32 C-10 -22 -8 -10 0 0Z', 'none', { stroke: color, 'stroke-width': 1.6 }) + k.stroke('M0 -4 L0 -26', color, 0.8));
    parts += k.at(118, -100, 40, 0.8, k.path('M0 0 C8 -10 10 -22 0 -32 C-10 -22 -8 -10 0 0Z', 'none', { stroke: color, 'stroke-width': 1.6 }));
    parts += k.circle(22, -234, 3, color);
    return parts;
}

function render(W, H, options) {
    var p = PALETTES[(options && options.palette) || 'natural'];
    var rng = k.seeded('paper-ink');
    var defs = '';
    defs += k.linear('pi-linen', p.linen, 0, 0, 1, 1);
    defs += k.el('pattern', { id: 'pi-weave', width: 4, height: 4, patternUnits: 'userSpaceOnUse' }, k.rect(0, 0, 4, 1, 'rgba(0,0,0,0.05)') + k.rect(0, 0, 1, 4, 'rgba(255,255,255,0.08)'));
    defs += k.radial('pi-paper', [[p.paper[0], 1, 0], [p.paper[0], 1, 0.5], [p.paper[1], 1, 1]], '48%', '42%', '75%');
    defs += k.linear('pi-gold', [p.gold[0], p.gold[1], p.gold[0]], 0, 0, 1, 1);
    defs += k.mottleFilter('pi-mottle', 0.006, 12);
    defs += k.grainFilter('pi-grain', 0.75, 4, 3);
    defs += k.blur('pi-shadow', 14);
    defs += k.el('clipPath', { id: 'pi-sheet' }, k.path(deckle(70, 60, W - 140, H - 120, k.seeded('deckle')), '#000'));

    var body = '';
    body += k.rect(0, 0, W, H, 'url(#pi-linen)');
    body += k.rect(0, 0, W, H, 'url(#pi-weave)');
    body += k.g({ filter: 'url(#pi-shadow)', opacity: 0.35 }, k.rect(84, 80, W - 150, H - 130, '#3a2e20'));
    body += k.path(deckle(70, 60, W - 140, H - 120, k.seeded('deckle')), 'url(#pi-paper)');
    body += k.g({ 'clip-path': 'url(#pi-sheet)' }, k.grainLayer(W, H, 'pi-mottle', 0.1) + k.grainLayer(W, H, 'pi-grain', 0.08) +
        // Faint chain and laid lines of handmade paper.
        (function () { var l = ''; for (var x = 120; x < W; x += 120) l += k.rect(x, 0, 1, H, 'rgba(120,90,40,0.05)'); return l; }()));

    // Jadwal ruling around the text block.
    var bx = 190;
    var by = 270;
    var bw = W - 380;
    var bh = H - 520;
    body += k.rect(bx - 16, by - 16, bw + 32, bh + 32, 'none', { stroke: p.lapis, 'stroke-width': 1.2, opacity: 0.75 });
    body += k.rect(bx - 11, by - 11, bw + 22, bh + 22, 'none', { stroke: 'url(#pi-gold)', 'stroke-width': 6 });
    body += k.rect(bx - 6, by - 6, bw + 12, bh + 12, 'none', { stroke: p.vermilion, 'stroke-width': 1, opacity: 0.8 });
    body += k.rect(bx, by, bw, bh, 'none', { stroke: p.ink, 'stroke-width': 0.8, opacity: 0.35 });

    // Sarlauh: illuminated headpiece band above the block.
    var sx = bx - 16;
    var sw = bw + 32;
    var sy = 150;
    body += k.rect(sx, sy, sw, 84, 'url(#pi-gold)');
    body += k.rect(sx + 6, sy + 6, sw - 12, 72, 'none', { stroke: p.lapis, 'stroke-width': 1.4 });
    body += k.path('M' + (W / 2 - 150) + ' ' + (sy + 42) + ' C' + (W / 2 - 120) + ' ' + (sy + 12) + ' ' + (W / 2 + 120) + ' ' + (sy + 12) + ' ' + (W / 2 + 150) + ' ' + (sy + 42) +
        ' C' + (W / 2 + 120) + ' ' + (sy + 72) + ' ' + (W / 2 - 120) + ' ' + (sy + 72) + ' ' + (W / 2 - 150) + ' ' + (sy + 42) + 'Z', p.lapis);
    body += k.path('M' + (W / 2 - 132) + ' ' + (sy + 42) + ' C' + (W / 2 - 104) + ' ' + (sy + 20) + ' ' + (W / 2 + 104) + ' ' + (sy + 20) + ' ' + (W / 2 + 132) + ' ' + (sy + 42) +
        ' C' + (W / 2 + 104) + ' ' + (sy + 64) + ' ' + (W / 2 - 104) + ' ' + (sy + 64) + ' ' + (W / 2 - 132) + ' ' + (sy + 42) + 'Z', 'none', { stroke: p.gold[0], 'stroke-width': 1.2 });
    body += k.blossom(W / 2, sy + 42, 12, p.gold[0], p.vermilion, 0, { count: 8 });
    [-1, 1].forEach(function (s) {
        body += k.blossom(W / 2 + s * 80, sy + 42, 7, p.gold[0], p.vermilion, 0, { count: 6 });
        body += k.vineScroll(W / 2 + s * 190, sy + 60, 60, s > 0 ? -10 : 10, p.lapis, p.lapis, rng, s < 0);
        body += k.vineScroll(W / 2 + s * 290, sy + 60, 56, s > 0 ? -10 : 10, p.vermilion, p.lapis, rng, s < 0);
    });
    // Small finial tab above the sarlauh.
    body += k.path('M' + (W / 2 - 26) + ' ' + sy + ' Q' + (W / 2) + ' ' + (sy - 46) + ' ' + (W / 2 + 26) + ' ' + sy + 'Z', 'url(#pi-gold)');
    body += k.circle(W / 2, sy - 18, 5, p.lapis);

    // Margin sprig, bottom right, and a catchword-style ornament bottom left.
    body += k.at(W - 500, H - 168, 60, 0.85, inkSprig(p.sprig));
    body += k.at(210, H - 160, 0, 1, k.path(k.poly([[0, -10], [10, 0], [0, 10], [-10, 0]]), 'url(#pi-gold)') + k.circle(-22, 0, 3, p.vermilion) + k.circle(22, 0, 3, p.vermilion));
    // A few age spots.
    body += k.g({ 'clip-path': 'url(#pi-sheet)', opacity: 0.12 }, k.circle(160, 1100, 26, '#a07a3a', { filter: 'url(#pi-shadow)' }) + k.circle(930, 220, 18, '#a07a3a', { filter: 'url(#pi-shadow)' }));
    return k.svg(W, H, defs, body);
}

module.exports = { id: 'manuscript-paper-ink', render: render, palettes: Object.keys(PALETTES) };
