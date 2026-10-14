'use strict';

var k = require('../art-kit.js');

// Lantern Garden: festive evenings where lanterns hang among flowers.
//  - garland: a rose-and-eucalyptus swag sags across the top of a blush ground, three
//    lanterns hanging from it at different heights; the lower card stays open.
//  - columns: deep emerald with two jasmine vines that fall down the left and right edges
//    beside pairs of lanterns, framing a tall open field.
//  - diagonal: a bright Eid emerald; a string of small lanterns runs diagonally from the
//    top-left under a large crescent and star, over a low line of domes.
// No letters or script appear in the artwork.

var PALETTES = {
    blush: {
        ground: ['#fff6ef', '#f8e0d8', '#f2cdc6'], wash: ['#f6c5c8', '#f3d6bd'], rose: { deep: '#a8344f', mid: '#dc6f87', light: '#fbd0d6', shade: '#5a1022' },
        rose2: { deep: '#cc6c58', mid: '#eba48a', light: '#fde1d0', shade: '#6a2a18' }, leaf: ['#41603f', '#7d9873'], euca: '#97ae9b', stem: '#5d7556',
        metal: '#c9993f', glass: 'rgba(255,196,120,0.72)'
    },
    jasmine: {
        ground: ['#0a4f3b', '#07382a', '#052419'], petal: '#fffdf2', leaf: '#4b9a6b', leafDark: '#2c6e4a', bud: '#f3efdc',
        metal: '#e6c274', glass: 'rgba(255,205,120,0.66)', line: '#e2c27a'
    },
    eid: {
        ground: ['#0e7a5a', '#096048', '#064634'], gold: ['#f7e3a0', '#d3a64a', '#926a28'], star: '#fff4cf', dome: '#064a38', domeFar: '#0a6a50',
        glass: 'rgba(255,214,130,0.78)', metal: '#e9c46c'
    }
};

function curvePoint(x1, y1, cx, cy, x2, y2, t) {
    var u = 1 - t;
    return [u * u * x1 + 2 * u * t * cx + t * t * x2, u * u * y1 + 2 * u * t * cy + t * t * y2];
}

function garland(W, H, p, rng) {
    var defs = k.linear('lg-ground', p.ground) + k.roseDefs('lg-a', p.rose) + k.roseDefs('lg-b', p.rose2) + k.linear('lg-leaf', p.leaf, 0, 0, 1, 0) +
        k.linear('lg-euca', [p.euca, '#c4d2c6'], 0, 0, 1, 1) + k.blur('lg-soft', 40) + k.blur('lg-shadow', 8) +
        k.radial('lg-lamp', [['#ffd27a', 0.5, 0], ['#ffb347', 0.14, 0.4], ['#ffb347', 0, 1]]) + k.mottleFilter('lg-mottle', 0.0045, 11);
    var body = k.rect(0, 0, W, H, 'url(#lg-ground)') + k.grainLayer(W, H, 'lg-mottle', 0.06);
    body += k.g({ filter: 'url(#lg-soft)', opacity: 0.5 }, k.ellipse(180, 120, 260, 120, p.wash[0]) + k.ellipse(W - 160, 130, 280, 120, p.wash[1]) + k.ellipse(W / 2, H - 80, 400, 110, p.wash[0]));
    var x1 = -40;
    var y1 = 70;
    var x2 = W + 40;
    var y2 = 110;
    var cx = W / 2;
    var cy = 330;
    // Cord and foliage first, blooms over the top.
    var leaves = '';
    var blooms = '';
    for (var i = 0; i <= 40; i += 1) {
        var t = i / 40;
        var pt = curvePoint(x1, y1, cx, cy, x2, y2, t);
        var around = t < 0.5 ? 1 : -1;
        leaves += k.leaf(pt[0], pt[1], 70 + rng() * 40, (rng() - 0.5) * 160 + (i % 2 ? 90 : -90), i % 3 ? 'url(#lg-leaf)' : 'url(#lg-euca)', 'rgba(255,255,255,0.3)', { width: 22 });
        if (i % 4 === 1) blooms += k.blossom(pt[0] + (rng() - 0.5) * 20, pt[1] + (rng() - 0.5) * 20, 15, '#ffffff', '#e8c56b', rng() * 70, { stamens: '#c9a046' });
        void around;
    }
    var roses = [[0.06, 62, 'lg-a'], [0.2, 48, 'lg-b'], [0.34, 70, 'lg-a'], [0.5, 56, 'lg-b'], [0.64, 72, 'lg-a'], [0.78, 50, 'lg-b'], [0.93, 64, 'lg-a']];
    var shadow = '';
    roses.forEach(function (r, i) {
        var pt = curvePoint(x1, y1, cx, cy, x2, y2, r[0]);
        blooms += k.rose(pt[0], pt[1] + 4, r[1], r[2], i * 37);
        shadow += k.circle(pt[0], pt[1] + 16, r[1] * 0.9, '#7a2a30');
    });
    body += k.stroke('M' + x1 + ' ' + y1 + ' Q' + cx + ' ' + cy + ' ' + x2 + ' ' + y2, p.stem, 4);
    body += k.g({ filter: 'url(#lg-shadow)', opacity: 0.16, transform: 'translate(6 12)' }, leaves + shadow);
    body += leaves + blooms;
    // Lanterns hang from the swag.
    [[0.13, 190, 46], [0.3, 110, 34], [0.88, 250, 54]].forEach(function (l) {
        var pt = curvePoint(x1, y1, cx, cy, x2, y2, l[0]);
        body += k.lantern(pt[0], pt[1] + 20, l[1], l[2], p.metal, p.glass, 'lg-lamp');
    });
    // Petals drift down and a low sprig of eucalyptus anchors each bottom corner.
    [[210, 560, 20], [860, 700, -30], [170, 960, 60], [900, 1100, 10]].forEach(function (pt, i) {
        body += k.at(pt[0], pt[1], pt[2], 1, k.path('M0 0 C8 -10 22 -10 26 0 C22 9 8 9 0 0Z', i % 2 ? p.rose.mid : p.rose2.mid, { opacity: 0.5 }));
    });
    body += k.roundLeafStem(-20, H - 70, 300, -22, 'url(#lg-euca)', p.stem, rng);
    body += k.roundLeafStem(W + 20, H - 50, 300, 202, 'url(#lg-euca)', p.stem, rng);
    body += k.rose(150, H - 120, 46, 'lg-b', 20) + k.rose(W - 160, H - 100, 40, 'lg-a', -20);
    return { defs: defs, body: body };
}

function columns(W, H, p, rng) {
    var defs = k.linear('lg-ground', p.ground, 0.2, 0, 0.8, 1) + k.radial('lg-lamp', [['#ffd27a', 0.55, 0], ['#ffb347', 0.16, 0.4], ['#ffb347', 0, 1]]) +
        k.radial('lg-centre', [['#3fa07a', 0.28, 0], ['#3fa07a', 0]], '50%', '55%', '55%') + k.girihPattern('lg-girih', 110, p.line, 1.2) +
        k.radial('lg-fade', [['#000', 1, 0], ['#000', 1, 0.5], ['#fff', 1, 1]], '50%', '50%', '70%');
    defs += k.el('mask', { id: 'lg-mask' }, k.rect(0, 0, W, H, 'url(#lg-fade)'));
    var body = k.rect(0, 0, W, H, 'url(#lg-ground)') + k.g({ mask: 'url(#lg-mask)', opacity: 0.2 }, k.rect(0, 0, W, H, 'url(#lg-girih)')) + k.rect(0, 0, W, H, 'url(#lg-centre)');
    // Hairline arch that joins the two sides.
    body += k.path(k.pointedArch(120, 90, W - 240, H - 150, 0.2), 'none', { stroke: p.line, 'stroke-width': 1.4, opacity: 0.5 });
    function vine(x, length, lean, seed) {
        var r = k.seeded(seed);
        var parts = k.stroke('M' + x + ' -10 C' + (x + lean) + ' ' + length * 0.3 + ' ' + (x - lean) + ' ' + length * 0.65 + ' ' + (x + lean * 0.4) + ' ' + length, p.leafDark, 3);
        for (var y = 30; y < length; y += 40) {
            var t = y / length;
            var vx = x + lean * 3 * t * (1 - t) * (t < 0.5 ? 1 : -1) * 1.1;
            parts += k.leaf(vx, y, 46 + r() * 18, (y / 40) % 2 ? 40 + r() * 30 : 140 - r() * 30, p.leaf, 'rgba(255,255,255,0.25)', { width: 14 });
            if ((y / 40) % 3 !== 2) parts += k.blossom(vx + (r() - 0.5) * 24, y + 8, 17 + r() * 5, p.petal, '#e9d98a', r() * 70, { edge: 'rgba(160,140,90,0.3)' });
            else parts += k.ellipse(vx + 8, y + 10, 5, 12, p.bud);
        }
        return parts;
    }
    body += vine(74, 1000, 26, 'lg-v1') + vine(W - 74, 900, -26, 'lg-v2') + vine(150, 520, 14, 'lg-v3') + vine(W - 150, 440, -14, 'lg-v4');
    body += k.lantern(235, 0, 120, 52, p.metal, p.glass, 'lg-lamp') + k.lantern(W - 235, 0, 220, 60, p.metal, p.glass, 'lg-lamp');
    body += k.lantern(310, 0, 40, 30, p.metal, p.glass, 'lg-lamp');
    body += k.rect(0, H - 14, W, 14, p.metal, { opacity: 0.75 }) + k.rect(0, H - 22, W, 2, p.line, { opacity: 0.5 });
    return { defs: defs, body: body };
}

function crescentPath(cx, cy, r, inner) {
    var top = [cx + r * 0.2, cy - r * 0.98];
    var bottom = [cx + r * 0.2, cy + r * 0.98];
    return 'M' + top[0].toFixed(1) + ' ' + top[1].toFixed(1) + ' A' + r + ' ' + r + ' 0 1 0 ' + bottom[0].toFixed(1) + ' ' + bottom[1].toFixed(1) +
        ' A' + (r * inner) + ' ' + (r * inner) + ' 0 0 1 ' + top[0].toFixed(1) + ' ' + top[1].toFixed(1) + 'Z';
}

function star5(cx, cy, r, fill) {
    var pts = [];
    for (var i = 0; i < 10; i += 1) {
        var rr = i % 2 ? r * 0.42 : r;
        var a = -Math.PI / 2 + (Math.PI * i) / 5;
        pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    return k.path(k.poly(pts), fill);
}

function diagonal(W, H, p, rng) {
    var defs = k.linear('lg-ground', p.ground, 0.1, 0, 0.9, 1) + k.linear('lg-gold', [p.gold[0], p.gold[1], p.gold[0], p.gold[2]], 0, 0, 1, 1) +
        k.radial('lg-lamp', [['#ffe28a', 0.65, 0], ['#ffc247', 0.2, 0.4], ['#ffc247', 0, 1]]) + k.radial('lg-halo', [[p.star, 0.3, 0], [p.star, 0]]);
    var body = k.rect(0, 0, W, H, 'url(#lg-ground)');
    body += k.stars(W, H, 70, rng, p.star, 760, 0.7, 2.2);
    // Moon with a wide halo.
    body += k.circle(W - 210, 230, 230, 'url(#lg-halo)');
    body += k.path(crescentPath(W - 214, 230, 112, 0.84), 'url(#lg-gold)', { transform: 'rotate(-24 ' + (W - 214) + ' 230)' });
    body += star5(W - 108, 168, 30, 'url(#lg-gold)');
    // Lantern string, with a hanging lantern at each of seven beads.
    var sx = -20;
    var sy = 90;
    var ex = W * 0.72;
    var ey = 420;
    body += k.stroke('M' + sx + ' ' + sy + ' Q' + (W * 0.3) + ' ' + (sy + 190) + ' ' + ex + ' ' + ey, p.metal, 2);
    var drops = [0.12, 0.26, 0.4, 0.54, 0.68, 0.82, 0.96];
    drops.forEach(function (t, i) {
        var pt = curvePoint(sx, sy, W * 0.3, sy + 190, ex, ey, t);
        body += k.lantern(pt[0], pt[1], 12 + (i % 3) * 22, 20 + (i % 2) * 8, p.metal, p.glass, 'lg-lamp');
    });
    // A low rim of domes.
    var base = H - 70;
    function domeRow(color, y, scale, offset, gap, count) {
        var parts = k.rect(0, y, W, H - y, color);
        for (var d = 0; d < count; d += 1) {
            var cx = offset + d * gap;
            var w = (70 + ((d * 37) % 40)) * scale;
            parts += k.path('M' + (cx - w) + ' ' + y + ' C' + (cx - w) + ' ' + (y - w * 1.1) + ' ' + (cx - w * 0.3) + ' ' + (y - w * 1.5) + ' ' + cx + ' ' + (y - w * 1.7) + ' C' + (cx + w * 0.3) + ' ' + (y - w * 1.5) + ' ' + (cx + w) + ' ' + (y - w * 1.1) + ' ' + (cx + w) + ' ' + y + 'Z', color);
            parts += k.onionFinial(cx, y - w * 1.66, 7, color);
        }
        return parts;
    }
    body += domeRow(p.domeFar, base - 20, 0.8, 50, 160, 7) + domeRow(p.dome, base + 18, 1, 130, 220, 5);
    body += k.rect(0, H - 10, W, 10, p.gold[1], { opacity: 0.6 });
    return { defs: defs, body: body };
}

function render(W, H, options) {
    var o = options || {};
    var layout = o.layout || 'garland';
    var p = PALETTES[o.palette || ({ garland: 'blush', columns: 'jasmine', diagonal: 'eid' }[layout])];
    var rng = k.seeded('lantern-garden-' + layout);
    var part = layout === 'columns' ? columns(W, H, p, rng) : layout === 'diagonal' ? diagonal(W, H, p, rng) : garland(W, H, p, rng);
    var defs = part.defs + k.grainFilter('lg-grain', 0.9, 2, 61);
    var body = part.body + k.grainLayer(W, H, 'lg-grain', 0.05, layout === 'garland' ? 'multiply' : 'overlay');
    return k.svg(W, H, defs, body);
}

module.exports = { id: 'lantern-garden', render: render, palettes: Object.keys(PALETTES) };
