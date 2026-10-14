'use strict';

var k = require('../art-kit.js');

// Mughal Niche: architectural greetings framed by the cusped arches of Mughal gateways.
//  - niche: one tall cusped arch (a mihrab-style niche) holds the message; a lamp hangs from
//    its apex and a parchin-kari dado of inlaid tulips grows along the base.
//  - arcade: a row of five smaller arches runs across the top like a cloister, each hung
//    with a tassel or star, over a gold lozenge border; the field below is left open.
// No letters or script appear in the artwork.

var PALETTES = {
    emerald: {
        ground: ['#0f4d39', '#0a3828', '#06241a'], glow: '#2f8a68', gold: ['#f3dd96', '#cba046', '#8a6122'], line: '#e2c27a',
        inlay: { stem: '#d6b567', leaf: '#3f9a73', leaf2: '#2f7f5d', vein: 'rgba(255,240,200,0.5)', petal: '#f6e7c2', petalInner: '#e9a98f', bud: '#f6e7c2' },
        glass: 'rgba(255,205,120,0.62)', spandrel: '#1b6a4f'
    },
    burgundy: {
        ground: ['#64193a', '#46112a', '#2d0a1b'], glow: '#a2415f', gold: ['#f3dd96', '#cba046', '#8a6122'], line: '#e2c27a',
        inlay: { stem: '#d6b567', leaf: '#8a3550', leaf2: '#6e2640', vein: 'rgba(255,240,200,0.5)', petal: '#f6e7c2', petalInner: '#e8a58f', bud: '#f6e7c2' },
        glass: 'rgba(255,205,130,0.62)', spandrel: '#7a2a47'
    }
};

function nicheLayout(W, H, p, rng) {
    var defs = '';
    var body = '';
    defs += k.linear('mn-ground', p.ground);
    defs += k.linear('mn-gold', [p.gold[0], p.gold[1], p.gold[0], p.gold[2]], 0, 0, 1, 1);
    defs += k.radial('mn-glow', [[p.glow, 0.5, 0], [p.glow, 0]], '50%', '58%', '55%');
    defs += k.radial('mn-lamp', [['#ffd27a', 0.55, 0], ['#ffb347', 0.16, 0.4], ['#ffb347', 0, 1]]);
    defs += k.girihPattern('mn-girih', 96, p.line, 1.3);
    defs += k.radial('mn-fade', [['#000', 1, 0], ['#000', 1, 0.55], ['#fff', 1, 1]], '50%', '45%', '70%');
    defs += k.el('mask', { id: 'mn-mask' }, k.rect(0, 0, W, H, 'url(#mn-fade)'));

    var ax = 150;
    var ay = 140;
    var aw = W - 300;
    var ah = H - 230;
    body += k.rect(0, 0, W, H, 'url(#mn-ground)');
    body += k.g({ mask: 'url(#mn-mask)', opacity: 0.34 }, k.rect(0, 0, W, H, 'url(#mn-girih)'));
    // Spandrel arabesques fill the two shoulders either side of the apex.
    body += k.at(ax - 16, ay + 330, 0, 1, k.arabesque(0, 0, 150, -90, p.line, p.spandrel, p.gold[0], false), { opacity: 0.7 });
    body += k.at(W - ax + 16, ay + 330, 0, 1, k.arabesque(0, 0, 150, 90, p.line, p.spandrel, p.gold[0], true), { opacity: 0.7 });
    // Niche: three nested cusped outlines and an inner glow.
    var niche = k.cuspedArch(ax, ay, aw, ah, 0.3, 6, 0.3);
    body += k.path(niche, 'url(#mn-glow)');
    body += k.path(niche, 'none', { stroke: 'url(#mn-gold)', 'stroke-width': 4 });
    body += k.path(k.cuspedArch(ax - 24, ay - 30, aw + 48, ah + 30, 0.3, 6, 0.3), 'none', { stroke: p.line, 'stroke-width': 1.6, opacity: 0.75 });
    body += k.path(k.cuspedArch(ax - 46, ay - 58, aw + 92, ah + 58, 0.3, 6, 0.3), 'none', { stroke: p.line, 'stroke-width': 0.9, opacity: 0.45 });
    body += k.path(k.cuspedArch(ax + 20, ay + 26, aw - 40, ah - 26, 0.3, 6, 0.3), 'none', { stroke: p.line, 'stroke-width': 1.2, opacity: 0.5 });
    // Lamp from the apex.
    body += k.lantern(W / 2, ay + 26, 46, 38, 'url(#mn-gold)', p.glass, 'mn-lamp');
    body += k.sparkle(W / 2 - 118, ay + 230, 12, p.gold[0]) + k.sparkle(W / 2 + 118, ay + 230, 12, p.gold[0]);
    // Dado of inlaid tulips along the base.
    var baseY = H - 82;
    body += k.rect(ax - 46, baseY, aw + 92, 3, 'url(#mn-gold)');
    for (var i = 0; i < 7; i += 1) {
        var x = ax + 40 + i * ((aw - 80) / 6);
        body += k.parchinFlower(x, baseY - 4, i % 2 ? 150 : 200, p.inlay);
    }
    body += k.rect(0, H - 54, W, 54, 'rgba(0,0,0,0.28)');
    body += k.rect(0, H - 56, W, 2, p.line, { opacity: 0.7 });
    body += k.rect(0, H - 22, W, 1.4, p.line, { opacity: 0.5 });
    return { defs: defs, body: body };
}

function arcadeLayout(W, H, p, rng) {
    var defs = '';
    var body = '';
    defs += k.linear('mn-ground', p.ground);
    defs += k.linear('mn-gold', [p.gold[0], p.gold[1], p.gold[0], p.gold[2]], 0, 0, 1, 1);
    defs += k.linear('mn-bay', [[p.glow, 0.55], [p.glow, 0.12]]);
    defs += k.lozengePattern('mn-loz', 54, 54, p.line, p.gold[0]);
    defs += k.radial('mn-wash', [[p.glow, 0.32, 0], [p.glow, 0]], '50%', '62%', '60%');
    body += k.rect(0, 0, W, H, 'url(#mn-ground)') + k.rect(0, 0, W, H, 'url(#mn-wash)');
    // Cloister band: five bays, alternating tassel and star.
    var bays = 5;
    var bw = (W - 120) / bays;
    body += k.rect(0, 0, W, 92, 'rgba(0,0,0,0.3)');
    body += k.rect(0, 92, W, 3, 'url(#mn-gold)');
    for (var i = 0; i < bays; i += 1) {
        var x = 60 + i * bw;
        var arch = k.cuspedArch(x + 10, 118, bw - 20, 290, 0.48, 4, 0.3);
        body += k.path(arch, 'url(#mn-bay)');
        body += k.path(arch, 'none', { stroke: 'url(#mn-gold)', 'stroke-width': 2.6 });
        body += k.path(k.cuspedArch(x - 2, 104, bw + 4, 304, 0.48, 4, 0.3), 'none', { stroke: p.line, 'stroke-width': 1, opacity: 0.5 });
        var cx = x + bw / 2;
        if (i % 2 === 0) {
            body += k.stroke('M' + cx + ' 158 L' + cx + ' 214', p.line, 1.6);
            body += k.tassel(cx, 224, 22, 'url(#mn-gold)', p.line);
        } else {
            body += k.stroke('M' + cx + ' 158 L' + cx + ' 196', p.line, 1.6);
            body += k.sparkle(cx, 226, 26, p.gold[0]);
        }
    }
    body += k.rect(0, 408, W, 3, 'url(#mn-gold)', { opacity: 0.85 });
    // Slim columns divide the bays.
    for (var j = 1; j < bays; j += 1) body += k.rect(60 + j * bw - 3, 250, 6, 160, 'url(#mn-gold)', { opacity: 0.7 });
    // Lozenge border at the foot.
    body += k.rect(0, H - 150, W, 150, 'url(#mn-loz)', { opacity: 0.55 });
    body += k.rect(0, H - 154, W, 3, 'url(#mn-gold)');
    body += k.rect(0, H - 146, W, 1.2, p.line, { opacity: 0.6 });
    body += k.rect(0, H - 8, W, 3, 'url(#mn-gold)');
    // A small rosette centred above the lozenge band.
    body += k.at(W / 2, H - 154, 0, 1, k.circle(0, 0, 30, p.ground[1], { stroke: p.line, 'stroke-width': 2 }) + k.blossom(0, 0, 20, p.gold[0], p.gold[2], 0, { count: 8 }));
    return { defs: defs, body: body };
}

function render(W, H, options) {
    var o = options || {};
    var layout = o.layout || 'niche';
    var p = PALETTES[o.palette || (layout === 'niche' ? 'emerald' : 'burgundy')];
    var rng = k.seeded('mughal-niche-' + layout);
    var part = layout === 'arcade' ? arcadeLayout(W, H, p, rng) : nicheLayout(W, H, p, rng);
    var defs = part.defs + k.grainFilter('mn-grain', 0.9, 2, 41);
    var body = part.body + k.grainLayer(W, H, 'mn-grain', 0.06, 'overlay');
    return k.svg(W, H, defs, body);
}

module.exports = { id: 'mughal-niche', render: render, palettes: Object.keys(PALETTES) };
