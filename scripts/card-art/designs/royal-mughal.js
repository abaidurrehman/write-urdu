'use strict';

var k = require('../art-kit.js');

// Royal Mughal: an ivory cusped-arch panel set in a ruby-and-gold moulding on emerald,
// arabesque scrolls in the spandrels and a parchin-kari flower dado below.
// The ivory arch is the text field; ornament stays outside it.

var PALETTES = {
    emerald: { ground: ['#0f4634', '#0a2d22'], band: '#6b1427', bandDeep: '#4d0d1b', gold: ['#f4dc9a', '#c99a45', '#8f6424'], ivory: ['#fdf7ea', '#f3e5c8'], ink: '#173f30', flowerPetal: '#a8213b', flowerInner: '#d24a5c', leaf: '#2f6a49', leaf2: '#3d7d57' },
    ruby: { ground: ['#6e1427', '#45091a'], band: '#0f4634', bandDeep: '#0a2d22', gold: ['#f4dc9a', '#c99a45', '#8f6424'], ivory: ['#fdf6ea', '#f4e2c9'], ink: '#5a1022', flowerPetal: '#a8213b', flowerInner: '#d24a5c', leaf: '#2f6a49', leaf2: '#3d7d57' }
};

function render(W, H, options) {
    var p = PALETTES[(options && options.palette) || 'emerald'];
    var rng = k.seeded('royal-mughal');
    var defs = '';
    defs += k.linear('rm-ground', p.ground);
    defs += k.radial('rm-glow', [['#ffffff', 0.16], ['#ffffff', 0]], '50%', '42%', '60%');
    defs += k.linear('rm-gold', [p.gold[0], p.gold[1], p.gold[2], p.gold[1]], 0, 0, 1, 1);
    defs += k.linear('rm-gold-v', [p.gold[0], p.gold[1], p.gold[0], p.gold[2]]);
    defs += k.radial('rm-ivory', [[p.ivory[0], 1], [p.ivory[1], 1]], '50%', '38%', '75%');
    defs += k.lozengePattern('rm-damask', 64, 64, 'rgba(244,220,154,0.07)', 'rgba(244,220,154,0.1)');
    defs += k.lozengePattern('rm-band', 30, 30, 'rgba(244,220,154,0.7)', p.gold[0], p.band);
    defs += k.grainFilter('rm-grain', 0.9, 3, 11);
    defs += k.mottleFilter('rm-mottle', 0.006, 5);
    defs += k.el('clipPath', { id: 'rm-panel' }, k.path(k.cuspedArch(232, 330, 616, 860, 0.3, 5, 0.34), '#000'));

    var body = '';
    body += k.rect(0, 0, W, H, 'url(#rm-ground)');
    body += k.rect(0, 0, W, H, 'url(#rm-damask)');
    body += k.rect(0, 0, W, H, 'url(#rm-glow)');

    // Outer border: gold rules with a ruby lozenge band.
    body += k.rect(26, 26, W - 52, H - 52, 'none', { stroke: 'url(#rm-gold)', 'stroke-width': 3 });
    body += k.rect(38, 38, W - 76, H - 76, 'url(#rm-band)');
    body += k.rect(70, 70, W - 140, H - 140, 'url(#rm-ground)');
    body += k.rect(70, 70, W - 140, H - 140, 'url(#rm-damask)');
    body += k.rect(38, 38, W - 76, H - 76, 'none', { stroke: 'url(#rm-gold)', 'stroke-width': 2 });
    body += k.rect(70, 70, W - 140, H - 140, 'none', { stroke: 'url(#rm-gold)', 'stroke-width': 2.5 });
    body += k.rect(80, 80, W - 160, H - 160, 'none', { stroke: 'rgba(244,220,154,0.45)', 'stroke-width': 1 });

    // Spandrel arabesques (behind the arch moulding).
    var gold = 'rgba(232,200,128,0.82)';
    var goldLeaf = 'rgba(214,176,98,0.75)';
    void rng;
    [[104, 470, false], [976, 470, true]].forEach(function (s) {
        body += k.arabesque(s[0], s[1], 330, 0, gold, goldLeaf, p.flowerPetal, s[2]);
    });
    // Rosette medallions anchor each spandrel.
    [[176, 156], [904, 156]].forEach(function (c) {
        body += k.circle(c[0], c[1], 34, 'none', { stroke: gold, 'stroke-width': 2 });
        body += k.circle(c[0], c[1], 28, p.bandDeep);
        body += k.blossom(c[0], c[1], 24, goldLeaf, p.flowerPetal, 0, { count: 8 });
        body += k.blossom(c[0], c[1], 11, p.flowerInner, p.gold[0], 22.5, { count: 8 });
    });

    // Arch moulding: gold outer, ruby band, gold inner, ivory cusped panel.
    body += k.path(k.pointedArch(176, 226, 728, 1000, 0.3), 'url(#rm-gold)');
    body += k.path(k.pointedArch(186, 240, 708, 986, 0.3), p.band);
    body += k.path(k.pointedArch(186, 240, 708, 986, 0.3), 'url(#rm-band)', { opacity: 0.55 });
    body += k.path(k.pointedArch(206, 272, 668, 954, 0.3), 'url(#rm-gold)');
    body += k.path(k.pointedArch(214, 284, 652, 942, 0.3), p.bandDeep);
    body += k.path(k.cuspedArch(226, 318, 628, 908, 0.3, 5, 0.34), 'url(#rm-gold)');
    body += k.path(k.cuspedArch(232, 330, 616, 896, 0.3, 5, 0.34), 'url(#rm-ivory)');
    body += k.g({ 'clip-path': 'url(#rm-panel)' },
        k.grainLayer(W, H, 'rm-mottle', 0.08) + k.grainLayer(W, H, 'rm-grain', 0.05) +
        k.path(k.cuspedArch(250, 350, 580, 860, 0.3, 5, 0.34), 'none', { stroke: 'rgba(176,132,62,0.55)', 'stroke-width': 1.6 }) +
        k.path(k.cuspedArch(260, 362, 560, 840, 0.3, 5, 0.34), 'none', { stroke: 'rgba(176,132,62,0.25)', 'stroke-width': 1 }));

    // Crown finial above the apex.
    body += k.onionFinial(540, 222, 22, 'url(#rm-gold-v)');
    body += k.blossom(540, 262, 14, p.gold[0], p.flowerPetal, 0, { count: 6 });

    // Small hanging jewel inside the arch apex (kept above the text field).
    body += k.stroke('M540 352 L540 386', 'rgba(150,110,48,0.8)', 1.4);
    body += k.path('M540 386 L552 400 L540 418 L528 400Z', p.flowerPetal);
    body += k.path('M540 391 L547 400 L540 411 L533 400Z', p.flowerInner);
    body += k.circle(540, 424, 3.2, 'rgba(150,110,48,0.9)');

    // Columns flanking the arch.
    [168, 912].forEach(function (cx) {
        body += k.rect(cx - 12, 560, 24, 640, 'url(#rm-gold-v)', { rx: 4 });
        body += k.rect(cx - 7, 580, 14, 600, p.bandDeep, { rx: 3 });
        for (var i = 0; i < 9; i += 1) body += k.path('M' + (cx - 5) + ' ' + (600 + i * 64) + ' L' + cx + ' ' + (590 + i * 64) + ' L' + (cx + 5) + ' ' + (600 + i * 64) + ' L' + cx + ' ' + (610 + i * 64) + 'Z', 'rgba(244,220,154,0.6)');
        body += k.rect(cx - 20, 548, 40, 16, 'url(#rm-gold)', { rx: 4 });
        body += k.onionFinial(cx, 546, 10, 'url(#rm-gold-v)');
    });

    // Parchin-kari dado: framed panel with inlaid flowering plants.
    body += k.rect(100, 1186, W - 200, 84, 'url(#rm-gold)', { rx: 6 });
    body += k.rect(106, 1192, W - 212, 72, p.ivory[1], { rx: 4 });
    var flower = { stem: p.leaf, leaf: p.leaf, leaf2: p.leaf2, vein: 'rgba(255,255,255,0.35)', petal: p.flowerPetal, petalInner: p.flowerInner, bud: p.flowerPetal };
    [212, 376, 540, 704, 868].forEach(function (fx, index) {
        body += k.parchinFlower(fx, 1262, index === 2 ? 74 : 66, flower);
    });
    [294, 458, 622, 786].forEach(function (fx) {
        body += k.blossom(fx, 1228, 9, p.flowerPetal, p.gold[1], 0, { count: 6 });
        body += k.leaf(fx - 4, 1244, 18, 160, p.leaf, null);
        body += k.leaf(fx + 4, 1244, 18, 20, p.leaf2, null);
    });

    // Light grain over everything for a printed-on-card feel.
    body += k.grainLayer(W, H, 'rm-grain', 0.06, 'overlay');
    return k.svg(W, H, defs, body);
}

module.exports = {
    id: 'royal-mughal-emerald',
    render: render,
    palettes: Object.keys(PALETTES)
};
