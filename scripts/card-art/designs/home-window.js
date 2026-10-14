'use strict';

var k = require('../art-kit.js');

// Home Window: a warm Pakistani home interior for family and everyday greetings.
//  - morning: an arched window lets a soft beam across plaster; chai steams on the sill
//    beside a trailing money plant and a book.
//  - evening: curtains drawn back from a dusk window with a crescent, a glowing hanging lamp,
//    a diya and a bowl of jasmine on the sill.

var PALETTES = {
    morning: { wall: ['#f8ecd8', '#efdcc0'], frame: '#8a5a36', frameLight: '#b07a4e', sky: ['#cfe3f2', '#fdf0d6'], beam: '#fff6df', sill: ['#a46a3e', '#7c4c28'], cup: '#ffffff', chai: '#b97a45', plant: ['#3f7d4a', '#6aa363'], pot: '#c9653e', book: ['#2f5d7c', '#b8463b'] },
    evening: { wall: ['#f3dfbf', '#e2c49a'], frame: '#6b3f24', frameLight: '#946040', sky: ['#2b2d5c', '#c76b5a'], beam: '#ffd99a', sill: ['#8c5530', '#653a1f'], curtain: ['#8e2a3c', '#5e1626'], lamp: '#d9a441', glass: 'rgba(255,200,110,0.65)', diya: '#b5562d', jasmine: '#ffffff', plant: ['#3f7d4a', '#6aa363'] }
};

function steam(x, y, color) {
    return k.stroke('M' + x + ' ' + y + ' c-14 -24 14 -40 0 -64 c-12 -22 10 -36 0 -56', color, 3.4, { opacity: 0.5 }) +
        k.stroke('M' + (x + 22) + ' ' + (y + 4) + ' c-10 -20 12 -34 0 -54', color, 2.6, { opacity: 0.4 });
}

function render(W, H, options) {
    var o = options || {};
    var layout = o.layout || 'morning';
    var p = PALETTES[o.palette || layout];
    var rng = k.seeded('home-' + layout);
    var defs = '';
    defs += k.linear('hw-wall', p.wall);
    defs += k.linear('hw-sky', p.sky);
    defs += k.linear('hw-sill', p.sill);
    defs += k.linear('hw-beam', [[p.beam, 0.55], [p.beam, 0]]);
    defs += k.radial('hw-glow', [[p.beam, 0.6, 0], [p.beam, 0, 1]]);
    defs += k.mottleFilter('hw-plaster', 0.008, 14);
    defs += k.grainFilter('hw-grain', 0.9, 2, 51);
    defs += k.blur('hw-soft', 18);
    defs += k.blur('hw-shadow', 6);
    defs += k.lozengePattern('hw-tiles', 60, 60, 'rgba(255,240,215,0.35)', 'rgba(255,240,215,0.5)', p.sill[1]);

    var body = '';
    body += k.rect(0, 0, W, H, 'url(#hw-wall)');
    body += k.grainLayer(W, H, 'hw-plaster', 0.1);

    // Arched window at the top centre.
    var wx = 380;
    var wy = 70;
    var ww = 320;
    var wh = 300;
    body += k.path(k.pointedArch(wx - 24, wy - 20, ww + 48, wh + 40, 0.42), p.frame);
    body += k.path(k.pointedArch(wx, wy, ww, wh, 0.42), 'url(#hw-sky)');
    if (layout === 'morning') {
        body += k.circle(wx + ww * 0.68, wy + 120, 60, p.beam, { opacity: 0.8, filter: 'url(#hw-soft)' });
        body += k.path(k.ridge(ww, wy + wh - 50, 14, k.seeded('hw-hill'), wy + wh, 2), '#a9c3a0', { transform: 'translate(' + wx + ' 0)', opacity: 0.8 });
    } else {
        body += k.path('M' + (wx + 210) + ' ' + (wy + 70) + ' A38 38 0 1 0 ' + (wx + 210) + ' ' + (wy + 146) + ' A48 48 0 0 1 ' + (wx + 210) + ' ' + (wy + 70) + 'Z', '#fff1c4');
        body += k.stars(ww, wh - 60, 14, rng, '#ffffff', wh - 80, 0.8, 2).replace(/<circle cx="/g, '<circle transform="translate(' + wx + ' ' + wy + ')" cx="');
    }
    // Mullions and a jaali grille across the lower window.
    body += k.rect(wx + ww / 2 - 4, wy + 30, 8, wh - 30, p.frame);
    body += k.rect(wx, wy + wh * 0.55, ww, 8, p.frame);
    body += k.rect(wx - 36, wy + wh + 14, ww + 72, 18, p.frameLight, { rx: 4 });

    if (layout === 'morning') {
        // Light beam falling across the wall.
        body += k.path(k.poly([[wx, wy + 60], [wx + ww, wy + 60], [W - 40, H - 260], [140, H - 260]]), 'url(#hw-beam)', { opacity: 0.55 });
    } else {
        // Curtains drawn back to each side.
        [[0, 1], [W, -1]].forEach(function (c) {
            var x = c[0];
            var d = c[1];
            var curtain = 'M' + x + ' 0 L' + (x + d * 250) + ' 0 C' + (x + d * 210) + ' 260 ' + (x + d * 120) + ' 420 ' + (x + d * 150) + ' 560 C' + (x + d * 170) + ' 760 ' + (x + d * 110) + ' 980 ' + (x + d * 60) + ' 1120 L' + x + ' 1120Z';
            body += k.path(curtain, p.curtain[0]);
            for (var f = 1; f < 5; f += 1) body += k.stroke('M' + (x + d * f * 44) + ' 0 C' + (x + d * f * 38) + ' 300 ' + (x + d * f * 24) + ' 600 ' + (x + d * f * 14) + ' 1110', p.curtain[1], 5, { opacity: 0.55 });
            body += k.rect(x + d * 140 - 24, 540, 48, 22, '#d9a441', { rx: 8 });
        });
        body += k.rect(0, 0, W, 22, p.frame);
        // Hanging lamp glow.
        body += k.lantern(W - 290, 0, 250, 66, p.lamp, p.glass, 'hw-glow');
    }

    // Sill / shelf along the bottom with objects.
    var sy = H - 210;
    body += k.g({ filter: 'url(#hw-shadow)', opacity: 0.3 }, k.rect(40, sy + 20, W - 80, 40, '#3a2210'));
    body += k.rect(30, sy, W - 60, 34, 'url(#hw-sill)', { rx: 6 });
    body += k.rect(50, sy + 34, W - 100, H - sy - 34, 'url(#hw-tiles)', { opacity: 0.55 });
    if (layout === 'morning') {
        // Book stack.
        body += k.rect(140, sy - 34, 190, 34, p.book[0], { rx: 3 }) + k.rect(156, sy - 62, 160, 28, p.book[1], { rx: 3 }) + k.rect(150, sy - 28, 180, 4, '#f3e6cc');
        // Tea cup with saucer and steam.
        body += k.ellipse(560, sy - 4, 90, 14, p.cup) + k.ellipse(560, sy - 6, 70, 9, '#e8dccb');
        body += k.path('M500 ' + (sy - 96) + ' L620 ' + (sy - 96) + ' C618 ' + (sy - 40) + ' 600 ' + (sy - 12) + ' 560 ' + (sy - 12) + ' C520 ' + (sy - 12) + ' 502 ' + (sy - 40) + ' 500 ' + (sy - 96) + 'Z', p.cup);
        body += k.ellipse(560, sy - 96, 60, 10, p.chai);
        body += k.stroke('M618 ' + (sy - 80) + ' c34 0 34 44 -4 46', p.cup, 9);
        body += steam(552, sy - 120, '#ffffff');
        // Money plant trailing over the sill edge.
        body += k.path('M800 ' + sy + ' L820 ' + (sy - 110) + ' L940 ' + (sy - 110) + ' L960 ' + sy + 'Z', p.pot);
        var vine = 'M880 ' + (sy - 110) + ' C840 ' + (sy - 180) + ' 760 ' + (sy - 170) + ' 740 ' + (sy - 120) + ' M900 ' + (sy - 110) + ' C980 ' + (sy - 60) + ' 1010 ' + (sy + 40) + ' 990 ' + (sy + 150) + ' M870 ' + (sy - 110) + ' C850 ' + (sy - 220) + ' 900 ' + (sy - 260) + ' 940 ' + (sy - 240);
        body += k.stroke(vine, p.plant[0], 3);
        [[860, sy - 170, -150], [780, sy - 160, -120], [750, sy - 128, 170], [960, sy - 70, 40], [990, sy, 70], [995, sy + 80, 110], [900, sy - 230, -60], [930, sy - 250, -20], [880, sy - 140, -90]].forEach(function (l, i) {
            body += k.at(l[0], l[1], l[2], 1, k.path('M0 0 C14 -22 44 -22 52 0 C44 22 14 22 0 0Z', i % 2 ? p.plant[0] : p.plant[1]));
        });
    } else {
        // Diya with flame and a bowl of jasmine.
        body += k.radial && '';
        body += k.circle(360, sy - 50, 70, 'url(#hw-glow)');
        body += k.path('M300 ' + (sy - 30) + ' C320 ' + sy + ' 400 ' + sy + ' 420 ' + (sy - 30) + ' L360 ' + (sy - 36) + 'Z', p.diya);
        body += k.path('M360 ' + (sy - 92) + ' C374 ' + (sy - 70) + ' 372 ' + (sy - 48) + ' 360 ' + (sy - 40) + ' C348 ' + (sy - 48) + ' 346 ' + (sy - 70) + ' 360 ' + (sy - 92) + 'Z', '#ffb547');
        body += k.path('M360 ' + (sy - 78) + ' C366 ' + (sy - 64) + ' 365 ' + (sy - 52) + ' 360 ' + (sy - 46) + ' C355 ' + (sy - 52) + ' 354 ' + (sy - 64) + ' 360 ' + (sy - 78) + 'Z', '#fff2c2');
        body += k.path('M600 ' + (sy - 10) + ' C600 ' + (sy - 70) + ' 760 ' + (sy - 70) + ' 760 ' + (sy - 10) + 'Z', '#2f6d8a');
        for (var j = 0; j < 14; j += 1) body += k.blossom(612 + rng() * 136, sy - 50 - rng() * 30, 12, p.jasmine, '#e7d48a', rng() * 70);
        [[620, sy - 66, -150], [740, sy - 70, -30]].forEach(function (l) { body += k.leaf(l[0], l[1], 40, l[2], p.plant[0], null); });
    }
    body += k.grainLayer(W, H, 'hw-grain', 0.05);
    return k.svg(W, H, defs, body);
}

module.exports = { id: 'home-window', render: render, palettes: Object.keys(PALETTES) };
