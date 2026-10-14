(function (root, factory) {
    'use strict';
    var kit = root && root.WriteUrduCardArtKit;
    if (!kit && typeof require === 'function') kit = require('./card-art-kit.js');
    var api = factory(kit);
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.WriteUrduRoyalMughalArt = api;
}(typeof window !== 'undefined' ? window : null, function (k) {
    'use strict';

    // Royal Mughal (WU-CARD-ART-001): an ivory cusped-arch panel in a ruby-and-gold moulding,
    // arabesque spandrels, slim columns and a parchin-kari flower dado. The ivory arch is the
    // text field; ornament stays outside it.
    //
    // Drawn at any card size: horizontal measures scale with width, the arch and columns grow
    // with height, so the same artwork serves the 4:5 card background, the 9:16 WhatsApp Status
    // and the 5x7 print invitation. render() returns the SVG plus the text-safe rectangle.

    if (!k) throw new Error('Card art kit unavailable');

    // Ceremony palettes form the wedding suite; the card background uses emerald.
    var PALETTES = {
        emerald: { ground: ['#0f4634', '#0a2d22'], band: '#6b1427', bandDeep: '#4d0d1b', gold: ['#f4dc9a', '#c99a45', '#8f6424'], ivory: ['#fdf7ea', '#f3e5c8'], flowerPetal: '#a8213b', flowerInner: '#d24a5c', leaf: '#2f6a49', leaf2: '#3d7d57' },
        ruby: { ground: ['#6e1427', '#45091a'], band: '#0f4634', bandDeep: '#0a2d22', gold: ['#f4dc9a', '#c99a45', '#8f6424'], ivory: ['#fdf6ea', '#f4e2c9'], flowerPetal: '#a8213b', flowerInner: '#d24a5c', leaf: '#2f6a49', leaf2: '#3d7d57' },
        saffron: { ground: ['#d9821a', '#a8560c'], band: '#b5175b', bandDeep: '#7d0e3e', gold: ['#fbe3a0', '#d9a441', '#8f6424'], ivory: ['#fffaf0', '#fbedd2'], flowerPetal: '#c2185b', flowerInner: '#f06292', leaf: '#3f7d3a', leaf2: '#5c9a4a' },
        champagne: { ground: ['#d9c3a5', '#b89c78'], band: '#7d9479', bandDeep: '#5c7259', gold: ['#fbecc4', '#c9a463', '#8f6a2e'], ivory: ['#fffdf8', '#f6eee0'], ornament: 'rgba(128,92,40,0.78)', ornamentLeaf: 'rgba(150,112,58,0.7)', flowerPetal: '#d98c8f', flowerInner: '#f2b9ba', leaf: '#6f8a6a', leaf2: '#8aa585' }
    };

    function render(W, H, options) {
        var p = PALETTES[(options && options.palette) || 'emerald'] || PALETTES.emerald;
        var s = W / 1080;
        var X = function (v) { return v * s; };
        var id = 'rm' + Math.round(W) + 'x' + Math.round(H);
        var B = H - X(124);                 // arch base line
        var spring = function (top) { return Math.min(0.45, X(300) / (B - top)); };
        var arch = function (x, top, w) { return k.pointedArch(X(x), top, X(w), B - top, spring(top)); };
        var cusped = function (x, top, w, bottom) { return k.cuspedArch(X(x), top, X(w), (bottom || B) - top, spring(top), 5, 0.34); };

        var defs = '';
        defs += k.linear(id + '-ground', p.ground);
        defs += k.radial(id + '-glow', [['#ffffff', 0.16], ['#ffffff', 0]], '50%', '42%', '60%');
        defs += k.linear(id + '-gold', [p.gold[0], p.gold[1], p.gold[2], p.gold[1]], 0, 0, 1, 1);
        defs += k.linear(id + '-goldv', [p.gold[0], p.gold[1], p.gold[0], p.gold[2]]);
        defs += k.radial(id + '-ivory', [[p.ivory[0], 1], [p.ivory[1], 1]], '50%', '38%', '75%');
        defs += k.lozengePattern(id + '-damask', X(64), X(64), 'rgba(244,220,154,0.07)', 'rgba(244,220,154,0.1)');
        defs += k.lozengePattern(id + '-band', X(30), X(30), 'rgba(244,220,154,0.7)', p.gold[0], p.band);
        defs += k.grainFilter(id + '-grain', 0.9, 3, 11);
        defs += k.mottleFilter(id + '-mottle', 0.006, 5);
        defs += k.el('clipPath', { id: id + '-panel' }, k.path(cusped(232, X(330), 616, B - X(36)), '#000'));
        var u = function (name) { return 'url(#' + id + '-' + name + ')'; };

        var body = '';
        body += k.rect(0, 0, W, H, u('ground')) + k.rect(0, 0, W, H, u('damask')) + k.rect(0, 0, W, H, u('glow'));

        // Outer border: gold rules around a lozenge band.
        body += k.rect(X(26), X(26), W - X(52), H - X(52), 'none', { stroke: u('gold'), 'stroke-width': X(3) });
        body += k.rect(X(38), X(38), W - X(76), H - X(76), u('band'));
        body += k.rect(X(70), X(70), W - X(140), H - X(140), u('ground'));
        body += k.rect(X(70), X(70), W - X(140), H - X(140), u('damask'));
        body += k.rect(X(38), X(38), W - X(76), H - X(76), 'none', { stroke: u('gold'), 'stroke-width': X(2) });
        body += k.rect(X(70), X(70), W - X(140), H - X(140), 'none', { stroke: u('gold'), 'stroke-width': X(2.5) });
        body += k.rect(X(80), X(80), W - X(160), H - X(160), 'none', { stroke: 'rgba(244,220,154,0.45)', 'stroke-width': X(1) });

        // Spandrel arabesques and rosettes.
        var gold = p.ornament || 'rgba(232,200,128,0.82)';
        var goldLeaf = p.ornamentLeaf || 'rgba(214,176,98,0.75)';
        body += k.at(0, 0, 0, s, k.arabesque(104, 470, 330, 0, gold, goldLeaf, p.flowerPetal, false) + k.arabesque(976, 470, 330, 0, gold, goldLeaf, p.flowerPetal, true));
        [[176, 156], [904, 156]].forEach(function (c) {
            body += k.at(X(c[0]), X(c[1]), 0, s,
                k.circle(0, 0, 34, 'none', { stroke: gold, 'stroke-width': 2 }) + k.circle(0, 0, 28, p.bandDeep) +
                k.blossom(0, 0, 24, goldLeaf, p.flowerPetal, 0, { count: 8 }) + k.blossom(0, 0, 11, p.flowerInner, p.gold[0], 22.5, { count: 8 }));
        });

        // Arch moulding: gold, lozenge band, gold, deep band, cusped gold edge, ivory panel.
        body += k.path(arch(176, X(226), 728), u('gold'));
        body += k.path(arch(186, X(240), 708), p.band);
        body += k.path(arch(186, X(240), 708), u('band'), { opacity: 0.55 });
        body += k.path(arch(206, X(272), 668), u('gold'));
        body += k.path(arch(214, X(284), 652), p.bandDeep);
        body += k.path(cusped(226, X(318), 628), u('gold'));
        body += k.path(cusped(232, X(330), 616), u('ivory'));
        body += k.g({ 'clip-path': u('panel') },
            k.grainLayer(W, H, id + '-mottle', 0.08) + k.grainLayer(W, H, id + '-grain', 0.05) +
            k.path(cusped(250, X(350), 580, B - X(36)), 'none', { stroke: 'rgba(176,132,62,0.55)', 'stroke-width': X(1.6) }) +
            k.path(cusped(260, X(362), 560, B - X(46)), 'none', { stroke: 'rgba(176,132,62,0.25)', 'stroke-width': X(1) }));

        // Crown finial and the small hanging jewel inside the apex.
        body += k.onionFinial(X(540), X(222), X(22), u('goldv'));
        body += k.at(X(540), X(262), 0, s, k.blossom(0, 0, 14, p.gold[0], p.flowerPetal, 0, { count: 6 }));
        body += k.at(X(540), 0, 0, s,
            k.stroke('M0 352 L0 386', 'rgba(150,110,48,0.8)', 1.4) + k.path('M0 386 L12 400 L0 418 L-12 400Z', p.flowerPetal) +
            k.path('M0 391 L7 400 L0 411 L-7 400Z', p.flowerInner) + k.circle(0, 424, 3.2, 'rgba(150,110,48,0.9)'));

        // Columns flanking the arch, as tall as the arch allows.
        var colTop = X(548);
        var colBottom = B - X(26);
        [168, 912].forEach(function (cx) {
            var x = X(cx);
            body += k.rect(x - X(12), colTop + X(12), X(24), colBottom - colTop - X(12), u('goldv'), { rx: X(4) });
            body += k.rect(x - X(7), colTop + X(32), X(14), colBottom - colTop - X(52), p.bandDeep, { rx: X(3) });
            for (var y = colTop + X(52); y < colBottom - X(30); y += X(64)) {
                body += k.path('M' + (x - X(5)) + ' ' + y + ' L' + x + ' ' + (y - X(10)) + ' L' + (x + X(5)) + ' ' + y + ' L' + x + ' ' + (y + X(10)) + 'Z', 'rgba(244,220,154,0.6)');
            }
            body += k.rect(x - X(20), colTop, X(40), X(16), u('gold'), { rx: X(4) });
            body += k.onionFinial(x, colTop - X(2), X(10), u('goldv'));
        });

        // Parchin-kari dado.
        var dado = H - X(164);
        body += k.rect(X(100), dado, W - X(200), X(84), u('gold'), { rx: X(6) });
        body += k.rect(X(106), dado + X(6), W - X(212), X(72), p.ivory[1], { rx: X(4) });
        var flower = { stem: p.leaf, leaf: p.leaf, leaf2: p.leaf2, vein: 'rgba(255,255,255,0.35)', petal: p.flowerPetal, petalInner: p.flowerInner, bud: p.flowerPetal };
        var dadoArt = '';
        [212, 376, 540, 704, 868].forEach(function (fx, index) { dadoArt += k.parchinFlower(fx, 76, index === 2 ? 74 : 66, flower); });
        [294, 458, 622, 786].forEach(function (fx) {
            dadoArt += k.blossom(fx, 42, 9, p.flowerPetal, p.gold[1], 0, { count: 6 });
            dadoArt += k.leaf(fx - 4, 58, 18, 160, p.leaf, null) + k.leaf(fx + 4, 58, 18, 20, p.leaf2, null);
        });
        body += k.at(0, dado, 0, s, dadoArt);

        body += k.grainLayer(W, H, id + '-grain', 0.06, 'overlay');
        // Text field: inside the ivory panel, below the cusped crown and above the dado.
        var safeTop = X(330) + X(300) * 0.82;
        var safe = { x: Math.round(X(262)), y: Math.round(safeTop), w: Math.round(X(556)), h: Math.round(dado - X(36) - safeTop) };
        return { svg: k.svg(W, H, defs, body), safe: safe };
    }

    return { PALETTES: PALETTES, render: render };
}));
