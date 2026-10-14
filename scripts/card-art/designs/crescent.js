'use strict';

var k = require('../art-kit.js');

// Crescent: seasonal and national greetings built around the crescent.
//  - eid: ivory morning, a gold crescent and star hung beneath a jasmine-and-rose garland.
//  - ramadan: indigo night with a row of glowing lanterns at different heights.
//  - pakistan: deep green with cascading jasmine (chambeli), a white crescent and star.
//  - jumma: dusk sky over a domed mosque silhouette with minarets.
// None of the artwork contains script; greetings are always typed by the person.

var PALETTES = {
    eid: { ground: ['#fffaf0', '#f6ead0'], gold: ['#f4dc9a', '#c99a45', '#8f6424'], leaf: '#6f8f5a', petal: '#ffffff', rose: '#e4a0a8', ink: '#2f4a3a' },
    ramadan: { ground: ['#0b1030', '#1b2150', '#2a2f66'], gold: ['#f4dc9a', '#d9a441', '#8f6424'], glass: 'rgba(255,196,100,0.7)', star: '#fff1c4' },
    pakistan: { ground: ['#0f5a36', '#093d25'], white: '#fbfaf3', leaf: '#4f9a62', leafDark: '#2f6e43', bud: '#f3efe0' },
    jumma: { sky: ['#0f2b3c', '#2c4d63', '#c9806a', '#f2b77d'], silhouette: '#0a1a24', moon: '#fff1c4', glow: '#ffd9a0' }
};

function crescentPath(cx, cy, r, inner, offset) {
    // Outer circle arc then inner arc offset to the right.
    var top = [cx + r * 0.2, cy - r * 0.98];
    var bottom = [cx + r * 0.2, cy + r * 0.98];
    return 'M' + top[0].toFixed(1) + ' ' + top[1].toFixed(1) + ' A' + r + ' ' + r + ' 0 1 0 ' + bottom[0].toFixed(1) + ' ' + bottom[1].toFixed(1) +
        ' A' + (r * inner) + ' ' + (r * inner) + ' 0 0 1 ' + top[0].toFixed(1) + ' ' + top[1].toFixed(1) + 'Z';
    void offset;
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

function jasmineGarland(x1, y1, x2, y2, sag, p, rng, size) {
    var z = size || 1;
    var parts = '';
    var cx = (x1 + x2) / 2;
    var cy = (y1 + y2) / 2 + sag;
    parts += k.stroke('M' + x1 + ' ' + y1 + ' Q' + cx + ' ' + (cy + sag) + ' ' + x2 + ' ' + y2, p.leaf, 2.4 * z);
    for (var i = 0; i <= 26; i += 1) {
        var t = i / 26;
        var x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
        var y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * (cy + sag) + t * t * y2;
        if (i % 2) parts += k.leaf(x, y, 26 * z, (rng() - 0.5) * 120 + (i % 4 ? 30 : 150), p.leaf, null, { width: 8 * z });
        parts += k.blossom(x, y + 4 * z, (11 + rng() * 4) * z, p.petal, '#f2d27a', rng() * 70, { edge: 'rgba(160,140,90,0.35)' });
        if (i % 6 === 3 && p.rose) parts += k.blossom(x, y + 2, 14 * z, p.rose, '#b5566a', rng() * 70, { count: 5 });
    }
    return parts;
}

function mosque(W, base, color) {
    var parts = '';
    var cx = W / 2;
    // Main prayer hall with arches.
    parts += k.rect(cx - 260, base - 150, 520, 150, color);
    // Central dome on a drum.
    parts += k.rect(cx - 120, base - 210, 240, 70, color);
    parts += k.path('M' + (cx - 140) + ' ' + (base - 205) + ' C' + (cx - 150) + ' ' + (base - 330) + ' ' + (cx - 40) + ' ' + (base - 390) + ' ' + cx + ' ' + (base - 420) +
        ' C' + (cx + 40) + ' ' + (base - 390) + ' ' + (cx + 150) + ' ' + (base - 330) + ' ' + (cx + 140) + ' ' + (base - 205) + 'Z', color);
    parts += k.onionFinial(cx, base - 416, 12, color);
    // Side domes.
    [-1, 1].forEach(function (s) {
        var x = cx + s * 190;
        parts += k.path('M' + (x - 60) + ' ' + (base - 148) + ' C' + (x - 64) + ' ' + (base - 200) + ' ' + (x - 20) + ' ' + (base - 230) + ' ' + x + ' ' + (base - 244) +
            ' C' + (x + 20) + ' ' + (base - 230) + ' ' + (x + 64) + ' ' + (base - 200) + ' ' + (x + 60) + ' ' + (base - 148) + 'Z', color);
        parts += k.onionFinial(x, base - 240, 7, color);
        // Minarets with balconies.
        var mx = cx + s * 340;
        parts += k.rect(mx - 18, base - 470, 36, 470, color);
        parts += k.rect(mx - 30, base - 330, 60, 12, color);
        parts += k.rect(mx - 28, base - 440, 56, 12, color);
        parts += k.path('M' + (mx - 22) + ' ' + (base - 470) + ' C' + (mx - 22) + ' ' + (base - 510) + ' ' + (mx - 6) + ' ' + (base - 530) + ' ' + mx + ' ' + (base - 540) + ' C' + (mx + 6) + ' ' + (base - 530) + ' ' + (mx + 22) + ' ' + (base - 510) + ' ' + (mx + 22) + ' ' + (base - 470) + 'Z', color);
        parts += k.stroke('M' + mx + ' ' + (base - 540) + ' L' + mx + ' ' + (base - 566), color, 3);
    });
    parts += k.rect(0, base - 6, W, 400, color);
    return parts;
}

function render(W, H, options) {
    var o = options || {};
    var layout = o.layout || 'eid';
    var p = PALETTES[o.palette || layout];
    var rng = k.seeded('crescent-' + layout);
    var defs = k.grainFilter('cr-grain', 0.9, 2, 71);
    var body = '';

    if (layout === 'eid') {
        defs += k.linear('cr-ground', p.ground) + k.linear('cr-gold', [p.gold[0], p.gold[1], p.gold[0], p.gold[2]], 0, 0, 1, 1);
        defs += k.radial('cr-sun', [['#ffffff', 0.9], ['#ffffff', 0]], '50%', '22%', '50%');
        body += k.rect(0, 0, W, H, 'url(#cr-ground)') + k.rect(0, 0, W, H, 'url(#cr-sun)');
        body += jasmineGarland(-30, 30, W + 30, 30, 60, p, rng, 1.9);
        body += k.stroke('M' + (W / 2) + ' 140 L' + (W / 2) + ' 200', 'url(#cr-gold)', 2.4);
        body += k.path(crescentPath(W / 2 - 14, 300, 100, 0.84), 'url(#cr-gold)');
        body += star5(W / 2 + 70, 272, 26, 'url(#cr-gold)');
        [[260, 140, 60], [820, 150, 80], [180, 200, 40], [900, 230, 50]].forEach(function (s) {
            body += k.stroke('M' + s[0] + ' 90 L' + s[0] + ' ' + (90 + s[2]), 'url(#cr-gold)', 1.2);
            body += star5(s[0], 100 + s[2], 16, 'url(#cr-gold)');
        });
        // A quiet gold arcade at the foot.
        for (var a = 0; a < 6; a += 1) body += k.path(k.pointedArch(80 + a * 160, H - 170, 120, 170, 0.45), 'none', { stroke: 'url(#cr-gold)', 'stroke-width': 2, opacity: 0.75 });
        body += k.rect(60, H - 4 - 2, W - 120, 2, 'url(#cr-gold)');
    } else if (layout === 'ramadan') {
        defs += k.linear('cr-ground', p.ground) + k.linear('cr-gold', [p.gold[0], p.gold[1], p.gold[2]], 0, 0, 1, 1);
        defs += k.radial('cr-lamp', [['#ffcf7a', 0.6, 0], ['#ffb347', 0.18, 0.4], ['#ffb347', 0, 1]]);
        defs += k.radial('cr-moon', [[p.star, 0.35], [p.star, 0]]);
        body += k.rect(0, 0, W, H, 'url(#cr-ground)');
        body += k.stars(W, H, 110, rng, p.star, H * 0.85, 0.6, 2.2);
        body += k.circle(820, 300, 200, 'url(#cr-moon)');
        body += k.path(crescentPath(820, 300, 80, 0.82), p.star, { transform: 'rotate(-25 820 300)' });
        [[110, 140, 50], [250, 260, 58], [390, 120, 44], [690, 140, 46], [960, 200, 54]].forEach(function (l) {
            body += k.lantern(l[0], 0, l[1], l[2], p.gold[1], p.glass, 'cr-lamp');
        });
        // Geometric band along the foot.
        defs += k.girihPattern('cr-girih', 60, 'rgba(244,220,154,0.55)', 1.2);
        body += k.rect(0, H - 120, W, 120, 'url(#cr-girih)');
        body += k.rect(0, H - 124, W, 3, p.gold[1]);
    } else if (layout === 'pakistan') {
        defs += k.linear('cr-ground', p.ground, 0, 0, 1, 1);
        defs += k.radial('cr-glow', [['#ffffff', 0.12], ['#ffffff', 0]], '50%', '45%', '55%');
        body += k.rect(0, 0, W, H, 'url(#cr-ground)') + k.rect(0, 0, W, H, 'url(#cr-glow)');
        body += k.path(crescentPath(W - 190, 210, 80, 0.8), 'none', { stroke: p.white, 'stroke-width': 3, transform: 'rotate(30 ' + (W - 190) + ' 210)' });
        body += k.at(W - 150, 170, 18, 1, star5(0, 0, 24, 'none').replace('fill="none"', 'fill="none" stroke="' + p.white + '" stroke-width="3"'));
        // Cascading jasmine strands from the top-left corner and along the left edge.
        var jp = { leaf: p.leaf, petal: p.white };
        body += jasmineGarland(-20, 60, 560, -20, 90, jp, rng, 1.6);
        [[60, 1000], [130, 760], [200, 520]].forEach(function (s, i) {
            body += k.stroke('M' + s[0] + ' 0 C' + (s[0] + 20) + ' ' + (s[1] * 0.4) + ' ' + (s[0] - 20) + ' ' + (s[1] * 0.7) + ' ' + s[0] + ' ' + s[1], p.leafDark, 2.4);
            for (var y = 40; y < s[1]; y += 38) {
                body += k.leaf(s[0], y, 34, (y / 38) % 2 ? 30 : 150, p.leaf, null, { width: 10 });
                if ((y / 38 + i) % 2 < 1) body += k.blossom(s[0] + (rng() - 0.5) * 10, y + 10, 18, p.white, '#e9d98a', rng() * 70);
                else body += k.ellipse(s[0] + 6, y + 6, 6, 13, p.bud);
            }
        });
        body += k.rect(0, H - 10, W, 10, p.white, { opacity: 0.85 });
    } else {
        // Keep the warm horizon low so the text field above the domes stays dark and legible.
        defs += k.linear('cr-sky', [[p.sky[0], 1, 0], [p.sky[1], 1, 0.52], [p.sky[2], 1, 0.8], [p.sky[3], 1, 0.98]]);
        defs += k.radial('cr-glow', [[p.glow, 0.32], [p.glow, 0]]);
        body += k.rect(0, 0, W, H, 'url(#cr-sky)');
        body += k.stars(W, H, 80, rng, '#ffffff', 600, 0.6, 2);
        body += k.circle(W / 2, H - 300, 380, 'url(#cr-glow)');
        body += k.path(crescentPath(830, 220, 56, 0.82), p.moon, { transform: 'rotate(-20 830 220)' });
        body += mosque(W, H - 120, p.silhouette);
        // Lit arch windows in the prayer hall.
        for (var w = 0; w < 7; w += 1) body += k.path(k.pointedArch(W / 2 - 238 + w * 68, H - 250, 40, 90, 0.5), 'rgba(255,214,150,0.55)');
    }
    body += k.grainLayer(W, H, 'cr-grain', 0.05, layout === 'eid' ? 'multiply' : 'overlay');
    return k.svg(W, H, defs, body);
}

module.exports = { id: 'crescent', render: render, palettes: Object.keys(PALETTES) };
