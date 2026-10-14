'use strict';

var k = require('../art-kit.js');

// Skyline Scenes: landscapes with the message set in the open sky.
//  - moonlit: a full moon over still water; a jasmine branch hangs lanterns from the top-left
//    and floating lamps drift across the lower third.
//  - city: a crescent over three layers of domes, minarets and flat roofs, lit windows in the
//    nearest layer.
//  - garden: a Mughal garden pavilion at sunset, cypresses either side, a water channel and
//    flower beds running towards it.
// No letters or script appear in the artwork.

var PALETTES = {
    moonlit: { sky: ['#06102a', '#0f2349', '#1c3b66'], water: ['#0a1d3b', '#06122a'], moon: '#fff2cf', shore: '#050d1e', leaf: '#4b9a6b', petal: '#fffdf2', metal: '#e6c274', glass: 'rgba(255,205,120,0.7)', flame: '#ffc15e' },
    city: { sky: ['#050b22', '#0c1c44', '#1d3b68', '#46557d'], far: '#233a63', mid: '#12254a', near: '#07122b', moon: '#fff1c4', window: 'rgba(255,208,130,0.85)', glow: '#f2b77d' },
    garden: {
        sky: ['#f7e4c3', '#f4cfa0', '#e9b184'], sun: '#fff0cf', stone: ['#e3b98b', '#b78559'], arch: '#5f402f', cypress: ['#34502f', '#1f3820'], lawn: ['#9aa25a', '#6f7a3c'], water: ['#f8dcb4', '#e6b98a'], bed: '#c7576a', bed2: '#f3d6a0'
    }
};

function crescentPath(cx, cy, r, inner) {
    var top = [cx + r * 0.2, cy - r * 0.98];
    var bottom = [cx + r * 0.2, cy + r * 0.98];
    return 'M' + top[0].toFixed(1) + ' ' + top[1].toFixed(1) + ' A' + r + ' ' + r + ' 0 1 0 ' + bottom[0].toFixed(1) + ' ' + bottom[1].toFixed(1) +
        ' A' + (r * inner) + ' ' + (r * inner) + ' 0 0 1 ' + top[0].toFixed(1) + ' ' + top[1].toFixed(1) + 'Z';
}

function moonlit(W, H, p, rng) {
    var defs = k.linear('ss-sky', p.sky) + k.linear('ss-water', p.water) + k.radial('ss-halo', [[p.moon, 0.28, 0], [p.moon, 0]]) +
        k.radial('ss-moon', [['#fffbe8', 1, 0], [p.moon, 1, 0.7], ['#e8d8a8', 1, 1]], '40%', '35%', '70%') +
        k.radial('ss-lamp', [['#ffd27a', 0.55, 0], ['#ffb347', 0.16, 0.4], ['#ffb347', 0, 1]]) + k.radial('ss-flame', [['#ffe9a8', 0.9, 0], ['#ffb347', 0.25, 0.5], ['#ffb347', 0, 1]]);
    var body = k.rect(0, 0, W, 1030, 'url(#ss-sky)') + k.stars(W, H, 110, rng, '#ffffff', 900, 0.6, 2.1);
    var mx = 850;
    var my = 232;
    body += k.circle(mx, my, 330, 'url(#ss-halo)') + k.moon(mx, my, 92, { gradient: 'ss-moon', crater: '#a08e60' });
    // Jasmine branch with hanging lanterns.
    var branch = 'M-20 70 C120 40 230 120 360 128';
    body += k.stroke(branch, '#2c6e4a', 5);
    for (var i = 0; i < 12; i += 1) {
        var t = i / 11;
        var bx = -20 + 380 * t;
        var by = 70 + 56 * Math.sin(t * Math.PI * 0.8) + t * 12;
        body += k.leaf(bx, by, 52 + rng() * 14, i % 2 ? 60 : -60, p.leaf, null, { width: 15 });
        body += k.blossom(bx + 10, by + (i % 2 ? 14 : -14), 15, p.petal, '#e9d98a', rng() * 70, { edge: 'rgba(160,140,90,0.3)' });
    }
    body += k.lantern(130, 78, 86, 40, p.metal, p.glass, 'ss-lamp') + k.lantern(260, 108, 160, 34, p.metal, p.glass, 'ss-lamp') + k.lantern(350, 126, 50, 26, p.metal, p.glass, 'ss-lamp');
    // Far shore and water.
    body += k.path(k.ridge(W, 1000, 26, k.seeded('ss-shore'), 1060, 3), p.shore);
    for (var h = 0; h < 14; h += 1) {
        var sx = 40 + h * 78 + (h % 3) * 12;
        body += k.circle(sx, 1004 - (h % 4) * 6, 3.2, '#ffd27a', { opacity: 0.65 });
    }
    body += k.rect(0, 1034, W, H - 1034, 'url(#ss-water)');
    // Moon path and ripples.
    for (var r = 0; r < 14; r += 1) {
        var w = 150 - r * 7 + rng() * 40;
        body += k.ellipse(mx + (rng() - 0.5) * 40, 1060 + r * 20, w, 4.2, p.moon, { opacity: 0.5 - r * 0.027 });
    }
    for (var q = 0; q < 12; q += 1) body += k.rect(60 + rng() * 800, 1070 + rng() * 250, 80 + rng() * 120, 1.4, '#7fa0d0', { opacity: 0.22 });
    // Floating lamps.
    [[210, 1130, 1], [420, 1210, 1.2], [650, 1160, 0.9], [940, 1260, 1.3], [90, 1280, 1.1]].forEach(function (l) {
        body += k.circle(l[0], l[1] - 6, 34 * l[2], 'url(#ss-flame)');
        body += k.path('M' + (l[0] - 15 * l[2]) + ' ' + l[1] + ' Q' + l[0] + ' ' + (l[1] + 16 * l[2]) + ' ' + (l[0] + 15 * l[2]) + ' ' + l[1] + 'Z', '#a8571f');
        body += k.path('M' + l[0] + ' ' + (l[1] - 15 * l[2]) + ' C' + (l[0] + 6 * l[2]) + ' ' + (l[1] - 7 * l[2]) + ' ' + (l[0] + 4 * l[2]) + ' ' + (l[1] - 1) + ' ' + l[0] + ' ' + (l[1] - 1) + ' C' + (l[0] - 4 * l[2]) + ' ' + (l[1] - 1) + ' ' + (l[0] - 6 * l[2]) + ' ' + (l[1] - 7 * l[2]) + ' ' + l[0] + ' ' + (l[1] - 15 * l[2]) + 'Z', p.flame);
    });
    return { defs: defs, body: body };
}

function city(W, H, p, rng) {
    var defs = k.linear('ss-sky', [[p.sky[0], 1, 0], [p.sky[1], 1, 0.4], [p.sky[2], 1, 0.7], [p.sky[3], 1, 1]]) + k.radial('ss-glow', [[p.glow, 0.28, 0], [p.glow, 0]]) +
        k.radial('ss-halo', [[p.moon, 0.25, 0], [p.moon, 0]]);
    var body = k.rect(0, 0, W, H, 'url(#ss-sky)') + k.stars(W, H, 130, rng, '#ffffff', 760, 0.6, 2.2);
    body += k.circle(W / 2, H - 170, 520, 'url(#ss-glow)');
    body += k.circle(210, 175, 190, 'url(#ss-halo)') + k.path(crescentPath(210, 175, 62, 0.82), p.moon, { transform: 'rotate(-20 210 175)' });
    body += k.sparkle(305, 140, 12, p.moon);
    function layer(color, baseY, tallest, density, windows, seed) {
        var r = k.seeded(seed);
        var parts = k.rect(0, baseY, W, H - baseY, color);
        var x = -30;
        while (x < W + 30) {
            var kind = r();
            var w = 70 + r() * 70;
            var h = tallest * (0.25 + r() * 0.45);
            if (kind < 0.26) {
                // Domed hall with a drum and finial.
                parts += k.rect(x, baseY - h, w, h + 2, color);
                var dw = w * 0.52;
                var dx = x + w / 2;
                var top = baseY - h;
                parts += k.rect(dx - dw * 0.8, top - 30, dw * 1.6, 32, color);
                parts += k.path('M' + (dx - dw) + ' ' + (top - 28) + ' C' + (dx - dw * 1.1) + ' ' + (top - 120) + ' ' + (dx - dw * 0.3) + ' ' + (top - 150) + ' ' + dx + ' ' + (top - 168) + ' C' + (dx + dw * 0.3) + ' ' + (top - 150) + ' ' + (dx + dw * 1.1) + ' ' + (top - 120) + ' ' + (dx + dw) + ' ' + (top - 28) + 'Z', color);
                parts += k.onionFinial(dx, top - 164, 7, color);
            } else if (kind < 0.5) {
                // Minaret: tall shaft, two balconies, domed cap.
                var mw = 24 + r() * 8;
                var mh = tallest * (0.75 + r() * 0.35);
                var mx = x + w / 2;
                parts += k.rect(mx - mw / 2, baseY - mh, mw, mh + 2, color);
                parts += k.rect(mx - mw * 0.9, baseY - mh * 0.62, mw * 1.8, 9, color) + k.rect(mx - mw * 0.8, baseY - mh * 0.9, mw * 1.6, 9, color);
                parts += k.path('M' + (mx - mw * 0.7) + ' ' + (baseY - mh) + ' C' + (mx - mw * 0.7) + ' ' + (baseY - mh - 34) + ' ' + (mx - 6) + ' ' + (baseY - mh - 52) + ' ' + mx + ' ' + (baseY - mh - 64) + ' C' + (mx + 6) + ' ' + (baseY - mh - 52) + ' ' + (mx + mw * 0.7) + ' ' + (baseY - mh - 34) + ' ' + (mx + mw * 0.7) + ' ' + (baseY - mh) + 'Z', color);
                parts += k.stroke('M' + mx + ' ' + (baseY - mh - 62) + ' L' + mx + ' ' + (baseY - mh - 84), color, 2.4);
                w = mw * 2.5;
            } else {
                // Flat-roofed house, sometimes with a small kiosk dome.
                parts += k.rect(x, baseY - h * 0.7, w, h * 0.7 + 2, color);
                if (kind > 0.8) {
                    var kx = x + w / 2;
                    parts += k.path('M' + (kx - 20) + ' ' + (baseY - h * 0.7) + ' C' + (kx - 20) + ' ' + (baseY - h * 0.7 - 36) + ' ' + (kx - 4) + ' ' + (baseY - h * 0.7 - 48) + ' ' + kx + ' ' + (baseY - h * 0.7 - 56) + ' C' + (kx + 4) + ' ' + (baseY - h * 0.7 - 48) + ' ' + (kx + 20) + ' ' + (baseY - h * 0.7 - 36) + ' ' + (kx + 20) + ' ' + (baseY - h * 0.7) + 'Z', color);
                }
                if (windows) {
                    for (var wy = 0; wy < 2; wy += 1) {
                        for (var wx = 0; wx < Math.floor(w / 34); wx += 1) {
                            if (r() > 0.45) parts += k.path(k.pointedArch(x + 10 + wx * 34, baseY - h * 0.7 + 16 + wy * 40, 16, 26, 0.5), p.window);
                        }
                    }
                }
            }
            x += w + (r() * 24 - density);
        }
        return parts;
    }
    body += layer(p.far, H - 165, 340, 6, false, 'ss-far');
    body += layer(p.mid, H - 65, 400, 10, true, 'ss-mid');
    body += layer(p.near, H + 30, 290, 14, true, 'ss-near');
    return { defs: defs, body: body };
}

function garden(W, H, p, rng) {
    var defs = k.linear('ss-sky', p.sky) + k.radial('ss-sun', [[p.sun, 0.9, 0], [p.sun, 0]], '50%', '70%', '60%') + k.linear('ss-stone', p.stone, 0, 0, 0, 1) +
        k.linear('ss-cyp', p.cypress, 0, 0, 1, 0) + k.linear('ss-lawn', p.lawn) + k.linear('ss-water', p.water);
    var base = 1066;
    var body = k.rect(0, 0, W, H, 'url(#ss-sky)') + k.circle(W / 2, base - 150, 560, 'url(#ss-sun)');
    // Soft hills behind.
    body += k.path(k.ridge(W, base - 70, 40, k.seeded('ss-hill'), base, 3), '#d9a173', { opacity: 0.6 });
    // Lawn and the water channel in perspective.
    body += k.rect(0, base, W, H - base, 'url(#ss-lawn)');
    body += k.path(k.poly([[W / 2 - 60, base], [W / 2 + 60, base], [W / 2 + 230, H], [W / 2 - 230, H]]), 'url(#ss-water)');
    body += k.path(k.poly([[W / 2 - 60, base], [W / 2 + 60, base], [W / 2 + 230, H], [W / 2 - 230, H]]), 'none', { stroke: p.stone[0], 'stroke-width': 4 });
    for (var f = 0; f < 6; f += 1) body += k.ellipse(W / 2, base + 24 + f * f * 8 + f * 12, 40 + f * 26, 3, '#ffffff', { opacity: 0.35 });
    // Flower beds converge on the pavilion.
    [-1, 1].forEach(function (side) {
        for (var row = 0; row < 7; row += 1) {
            var y = base + 20 + row * row * 6 + row * 14;
            var inner = 140 + row * 45;
            for (var c = 0; c < 6; c += 1) {
                var x = W / 2 + side * (inner + c * (30 + row * 8));
                body += k.circle(x, y, 4 + row * 1.2, (c + row) % 2 ? p.bed : p.bed2);
            }
        }
    });
    // Cypresses flank the view.
    [[130, 330], [W - 130, 330], [250, 230], [W - 250, 230]].forEach(function (c) {
        body += k.path('M' + c[0] + ' ' + (base - c[1]) + ' C' + (c[0] + 46) + ' ' + (base - c[1] * 0.55) + ' ' + (c[0] + 38) + ' ' + (base - 6) + ' ' + c[0] + ' ' + base + ' C' + (c[0] - 38) + ' ' + (base - 6) + ' ' + (c[0] - 46) + ' ' + (base - c[1] * 0.55) + ' ' + c[0] + ' ' + (base - c[1]) + 'Z', 'url(#ss-cyp)');
    });
    // Pavilion: plinth, five cusped arches, entablature and three domes.
    var px = 290;
    var pw = 500;
    var ah = 104;
    body += k.rect(px - 30, base - 22, pw + 60, 22, 'url(#ss-stone)') + k.rect(px - 50, base - 8, pw + 100, 8, p.stone[1]);
    body += k.rect(px, base - 22 - ah, pw, ah, 'url(#ss-stone)');
    for (var a = 0; a < 5; a += 1) {
        var ax = px + 14 + a * (pw / 5);
        body += k.path(k.cuspedArch(ax, base - 22 - ah + 12, pw / 5 - 28, ah - 12, 0.4, 3, 0.3), p.arch);
    }
    var ty = base - 22 - ah;
    body += k.rect(px - 16, ty - 22, pw + 32, 22, 'url(#ss-stone)') + k.rect(px - 22, ty - 28, pw + 44, 8, p.stone[1]);
    function dome(cx, y, w, h) {
        return k.path('M' + (cx - w) + ' ' + y + ' C' + (cx - w * 1.1) + ' ' + (y - h * 0.7) + ' ' + (cx - w * 0.3) + ' ' + (y - h * 0.95) + ' ' + cx + ' ' + (y - h) + ' C' + (cx + w * 0.3) + ' ' + (y - h * 0.95) + ' ' + (cx + w * 1.1) + ' ' + (y - h * 0.7) + ' ' + (cx + w) + ' ' + y + 'Z', 'url(#ss-stone)') +
            k.onionFinial(cx, y - h + 4, 6, p.stone[1]);
    }
    body += dome(W / 2, ty - 28, 120, 86) + dome(px + 40, ty - 28, 44, 52) + dome(px + pw - 40, ty - 28, 44, 52);
    // Chhatri kiosks on the corners.
    [px + 10, px + pw - 10].forEach(function (cx) { body += k.rect(cx - 5, ty - 74, 10, 46, p.stone[1]); });
    return { defs: defs, body: body };
}

function render(W, H, options) {
    var o = options || {};
    var layout = o.layout || 'moonlit';
    var p = PALETTES[o.palette || layout];
    var rng = k.seeded('skyline-scenes-' + layout);
    var part = layout === 'city' ? city(W, H, p, rng) : layout === 'garden' ? garden(W, H, p, rng) : moonlit(W, H, p, rng);
    var defs = part.defs + k.grainFilter('ss-grain', 0.9, 2, 73);
    var body = part.body + k.grainLayer(W, H, 'ss-grain', 0.05, layout === 'garden' ? 'multiply' : 'overlay');
    return k.svg(W, H, defs, body);
}

module.exports = { id: 'skyline-scenes', render: render, palettes: Object.keys(PALETTES) };
