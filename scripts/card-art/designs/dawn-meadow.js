'use strict';

var k = require('../art-kit.js');

// Dawn Meadow: a morning greeting. The sun lifts over layered hills wrapped in mist, a pair
// of birds crosses a peach-and-gold sky, and wildflowers, daisies and grasses fill the
// foreground. Soft, warm and hopeful, without a stock-photo look.

var PALETTES = {
    peach: { sky: ['#fbe3c4', '#fdd6a8', '#f8c39a', '#e9b8a8'], top: '#d7e3ef', sun: ['#fffbe8', '#ffe39a'], hills: ['#c9d6c1', '#a8c1a0', '#86a881', '#5f8a5d'], mist: '#fff6e6', flower: ['#f28c8c', '#f7c548', '#ffffff', '#c58ad6'], stem: '#4e7a4a', ink: '#3b4a2f' },
    mint: { sky: ['#eaf3e6', '#f4efd4', '#fbe2bf', '#f5d1b8'], top: '#cfe3ee', sun: ['#fffdf0', '#ffe9a8'], hills: ['#cfe0cf', '#aecdb0', '#8db793', '#5f9068'], mist: '#ffffff', flower: ['#ff9f9f', '#ffd166', '#ffffff', '#9fb8ff'], stem: '#4f8a57', ink: '#2f4a36' }
};

function render(W, H, options) {
    var p = PALETTES[(options && options.palette) || 'peach'];
    var rng = k.seeded('dawn-meadow');
    var sunX = 700;
    var sunY = 860;
    var defs = '';
    defs += k.linear('dm-sky', [[p.top, 1, 0], [p.sky[0], 1, 0.35], [p.sky[1], 1, 0.58], [p.sky[2], 1, 0.75], [p.sky[3], 1, 1]]);
    defs += k.radial('dm-sun', [[p.sun[0], 1, 0], [p.sun[1], 1, 0.6], [p.sun[1], 0, 1]]);
    defs += k.radial('dm-glow', [[p.sun[0], 0.75, 0], [p.sun[1], 0.25, 0.4], [p.sun[1], 0, 1]]);
    defs += k.linear('dm-mist', [[p.mist, 0], [p.mist, 0.8], [p.mist, 0]]);
    defs += k.blur('dm-blur', 22);
    defs += k.blur('dm-cloud', 14);
    defs += k.grainFilter('dm-grain', 0.9, 2, 8);

    var body = '';
    body += k.rect(0, 0, W, H, 'url(#dm-sky)');
    body += k.circle(sunX, sunY, 520, 'url(#dm-glow)');
    // Light rays.
    body += k.g({ opacity: 0.12 }, [0, 1, 2, 3, 4, 5, 6].map(function (i) {
        var a = (-160 + i * 20) * Math.PI / 180;
        var a2 = a + 0.06;
        return k.path(k.poly([[sunX, sunY], [sunX + Math.cos(a) * 1400, sunY + Math.sin(a) * 1400], [sunX + Math.cos(a2) * 1400, sunY + Math.sin(a2) * 1400]]), p.sun[0]);
    }).join(''));
    body += k.circle(sunX, sunY, 92, 'url(#dm-sun)');
    // Soft clouds.
    body += k.g({ filter: 'url(#dm-cloud)', opacity: 0.7 }, k.ellipse(220, 210, 180, 30, '#ffffff') + k.ellipse(330, 240, 140, 22, '#ffffff') + k.ellipse(860, 150, 160, 26, '#ffffff', { opacity: 0.8 }));
    body += k.bird(230, 330, 30, p.ink) + k.bird(300, 362, 22, p.ink) + k.bird(350, 318, 16, p.ink) + k.bird(880, 270, 18, p.ink);
    // Hills, back to front, with mist between.
    body += k.path(k.ridge(W, 900, 50, k.seeded('dm1'), H, 2), p.hills[0]);
    body += k.rect(0, 860, W, 140, 'url(#dm-mist)', { filter: 'url(#dm-blur)' });
    body += k.path(k.ridge(W, 980, 60, k.seeded('dm2'), H, 3), p.hills[1]);
    body += k.rect(0, 960, W, 100, 'url(#dm-mist)', { filter: 'url(#dm-blur)', opacity: 0.6 });
    body += k.path(k.ridge(W, 1080, 50, k.seeded('dm3'), H, 3), p.hills[2]);
    body += k.path(k.ridge(W, 1190, 34, k.seeded('dm4'), H, 3), p.hills[3]);
    // Foreground meadow: grasses and flowers.
    var meadow = '';
    for (var g = 0; g < 46; g += 1) meadow += k.grassTuft(rng() * W, H + 4, 50 + rng() * 70, rng() < 0.5 ? p.stem : p.hills[3], rng, 6);
    for (var f = 0; f < 30; f += 1) {
        var fx = rng() * W;
        var fy = H - 30 - rng() * 120;
        meadow += k.stroke('M' + fx.toFixed(1) + ' ' + (H + 4) + ' Q' + (fx + (rng() - 0.5) * 30).toFixed(1) + ' ' + ((fy + H) / 2).toFixed(1) + ' ' + fx.toFixed(1) + ' ' + fy.toFixed(1), p.stem, 2.2);
        var kind = rng();
        if (kind < 0.4) meadow += k.daisy(fx, fy, 18 + rng() * 10, '#ffffff', p.flower[1], rng() * 30);
        else meadow += k.blossom(fx, fy, 13 + rng() * 9, p.flower[Math.floor(rng() * p.flower.length)], p.flower[1], rng() * 70, { stamens: '#c98a2e' });
    }
    body += meadow;
    if (options && options.layout === 'garden') {
        // Tall flowering stems (hollyhock-like) rising up both sides frame the morning.
        [[70, 1], [150, 0.8], [W - 70, 1], [W - 160, 0.75]].forEach(function (st) {
            var top = H - 760 * st[1];
            body += k.stroke('M' + st[0] + ' ' + H + ' C' + (st[0] + 10) + ' ' + (H - 300) + ' ' + (st[0] - 10) + ' ' + (top + 200) + ' ' + st[0] + ' ' + top, p.stem, 4);
            for (var y = top; y < H - 160; y += 52) {
                body += k.blossom(st[0] + (rng() - 0.5) * 18, y, 24 - (y - top) / 60, p.flower[st[0] < W / 2 ? 0 : 3], '#f7e08a', rng() * 70, { stamens: '#c98a2e' });
                body += k.leaf(st[0], y + 26, 44, (y / 52) % 2 ? 20 : 160, p.stem, null, { width: 14 });
            }
        });
    }
    body += k.grainLayer(W, H, 'dm-grain', 0.06);
    return k.svg(W, H, defs, body);
}

module.exports = { id: 'dawn-meadow-sunrise', render: render, palettes: Object.keys(PALETTES) };
