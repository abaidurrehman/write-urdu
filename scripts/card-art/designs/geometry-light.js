'use strict';

var k = require('../art-kit.js');

// Islamic Geometry & Light: a khatam (eight-pointed star) lattice in fine gold that dissolves
// towards the centre, where light pours through a tall pointed arch. Two fanoos lanterns
// glow at the top and a quiet arcade sits along the base. Made for Jumma, duas and Ramadan.

var PALETTES = {
    teal: { ground: ['#0b3a40', '#082a30', '#051a1f'], line: '#d8b86a', light: '#fff1cc', arch: ['#14505a', '#0d3d45'], glass: 'rgba(255,214,140,0.55)', metal: '#d8b86a', arcade: '#04161a' },
    emerald: { ground: ['#0f4a36', '#0a3627', '#06241a'], line: '#e2c27a', light: '#fff4d6', arch: ['#18654a', '#0f4a36'], glass: 'rgba(255,214,140,0.55)', metal: '#e2c27a', arcade: '#041a12' },
    ivory: { ground: ['#fbf6ea', '#f3e9d4', '#eadcc0'], line: '#b48a3e', light: '#ffffff', arch: ['#fffdf7', '#f6edda'], glass: 'rgba(255,200,110,0.6)', metal: '#a67c34', arcade: '#e2d2b0' }
};

function render(W, H, options) {
    var p = PALETTES[(options && options.palette) || 'teal'];
    var defs = '';
    defs += k.linear('gl-ground', p.ground);
    defs += k.girihPattern('gl-girih', 120, p.line, 1.6);
    defs += k.radial('gl-fade', [['#000', 1, 0], ['#000', 1, 0.42], ['#fff', 1, 0.95]], '50%', '48%', '62%');
    defs += k.el('mask', { id: 'gl-mask' }, k.rect(0, 0, W, H, 'url(#gl-fade)'));
    defs += k.linear('gl-arch', [p.arch[0], p.arch[1]]);
    defs += k.linear('gl-beam', [[p.light, 0.42], [p.light, 0.08], [p.light, 0]]);
    defs += k.radial('gl-lamp', [['#ffd27a', 0.55, 0], ['#ffb347', 0.18, 0.4], ['#ffb347', 0, 1]]);
    defs += k.radial('gl-centre', [[p.light, 0.16, 0], [p.light, 0, 1]], '50%', '40%', '55%');
    defs += k.grainFilter('gl-grain', 0.9, 2, 31);
    defs += k.linear('gl-window', [['#ffcf7a', 0.5], ['#ffb347', 0.16]]);
    defs += k.el('clipPath', { id: 'gl-archclip' }, k.path(k.pointedArch(250, 210, 580, 960, 0.32), '#000'));

    var body = '';
    body += k.rect(0, 0, W, H, 'url(#gl-ground)');
    body += k.g({ mask: 'url(#gl-mask)', opacity: 0.55 }, k.rect(0, 0, W, H, 'url(#gl-girih)'));
    body += k.rect(0, 0, W, H, 'url(#gl-centre)');

    // Tall arch window with a light beam spilling down.
    var ax = 250;
    var aw = 580;
    var ay = 210;
    var ah = 960;
    body += k.path(k.pointedArch(ax - 18, ay - 22, aw + 36, ah + 22, 0.32), 'none', { stroke: p.line, 'stroke-width': 2, opacity: 0.85 });
    body += k.path(k.pointedArch(ax - 6, ay - 8, aw + 12, ah + 8, 0.32), 'none', { stroke: p.line, 'stroke-width': 1, opacity: 0.5 });
    body += k.path(k.pointedArch(ax, ay, aw, ah, 0.32), 'url(#gl-arch)', { opacity: 0.55 });
    body += k.path(k.pointedArch(ax, ay, aw, ah, 0.32), 'url(#gl-beam)');
    body += k.g({ 'clip-path': 'url(#gl-archclip)', opacity: 0.09 }, [0, 1, 2, 3].map(function (r) { return k.path(k.poly([[300 + r * 120, 180], [360 + r * 120, 180], [220 + r * 150, 1200], [130 + r * 150, 1200]]), p.light); }).join(''));
    // Apex rosette.
    body += k.at(540, ay - 60, 0, 1,
        k.circle(0, 0, 26, 'none', { stroke: p.line, 'stroke-width': 1.6 }) +
        k.path(k.poly([[0, -20], [6, -6], [20, 0], [6, 6], [0, 20], [-6, 6], [-20, 0], [-6, -6]]), p.line) +
        k.at(0, 0, 45, 0.7, k.path(k.poly([[0, -20], [6, -6], [20, 0], [6, 6], [0, 20], [-6, 6], [-20, 0], [-6, -6]]), p.line, { opacity: 0.6 })));

    // Lanterns.
    body += k.lantern(150, 0, 170, 64, p.metal, p.glass, 'gl-lamp');
    body += k.lantern(W - 150, 0, 120, 52, p.metal, p.glass, 'gl-lamp');

    // Arcade along the base: a dark wall pierced by softly lit arched windows.
    body += k.rect(0, H - 170, W, 170, p.arcade);
    for (var i = 0; i < 7; i += 1) {
        var x = -45 + i * 170;
        body += k.path(k.pointedArch(x + 34, H - 140, 102, 140, 0.45), 'url(#gl-window)');
        body += k.path(k.pointedArch(x + 34, H - 140, 102, 140, 0.45), 'none', { stroke: p.line, 'stroke-width': 1.4, opacity: 0.55 });
        body += k.rect(x + 84, H - 112, 2, 112, p.arcade, { opacity: 0.8 });
    }
    body += k.rect(0, H - 176, W, 5, p.line, { opacity: 0.6 });
    body += k.rect(0, H - 188, W, 1.5, p.line, { opacity: 0.4 });

    body += k.grainLayer(W, H, 'gl-grain', 0.06, 'overlay');
    return k.svg(W, H, defs, body);
}

module.exports = { id: 'jumma-geometry-light', render: render, palettes: Object.keys(PALETTES) };
