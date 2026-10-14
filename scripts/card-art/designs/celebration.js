'use strict';

var k = require('../art-kit.js');

// Celebration: birthdays, results day, a new baby, any good news. Glossy balloons drift in
// from both top corners, a pennant bunting swings between them, and confetti and sparkles
// are scattered everywhere except the message field. Bright, but organised.

var PALETTES = {
    confetti: { ground: ['#fffaf2', '#ffeede'], balloons: ['#ff6f61', '#2ec4b6', '#ffbf3c', '#9b8cff', '#ff8fb1'], cord: '#6b5a4a', sparkle: '#ffbf3c', ink: '#23305a', ribbon: '#ff6f61' },
    baby: { ground: ['#f7fbff', '#eaf2fb'], balloons: ['#8ec5ff', '#ffd1dc', '#ffe9a8', '#b8e6d4', '#c9b8ff'], cord: '#7a8696', sparkle: '#f5c451', ink: '#2c3d5a', ribbon: '#8ec5ff' }
};

function render(W, H, options) {
    var p = PALETTES[(options && options.palette) || 'confetti'];
    var rng = k.seeded('celebration');
    var b = p.balloons;
    var defs = '';
    defs += k.linear('cb-ground', p.ground);
    defs += k.radial('cb-centre', [['#ffffff', 0.9, 0], ['#ffffff', 0, 1]], '50%', '52%', '45%');
    defs += k.grainFilter('cb-grain', 0.9, 2, 23);
    defs += k.blur('cb-shadow', 10);

    var body = '';
    body += k.rect(0, 0, W, H, 'url(#cb-ground)');
    body += k.rect(0, 0, W, H, 'url(#cb-centre)');
    body += k.confetti(W, H, 170, rng, b.concat([p.sparkle]), { x: 150, y: 330, w: W - 300, h: 700 });
    // Bunting across the top.
    body += k.bunting(-20, 60, W + 20, 60, 60, 14, b, p.cord);
    // Balloon clusters (shadow first).
    var left = [[150, 330, 92, b[0], 40], [270, 250, 80, b[1], -30], [110, 480, 74, b[2], 20]];
    var right = [[930, 300, 96, b[3], -40], [810, 220, 78, b[4], 30], [990, 470, 70, b[0], -20], [860, 430, 66, b[2], 25]];
    var shadows = '';
    left.concat(right).forEach(function (bl) { shadows += k.ellipse(bl[0] + 14, bl[1] + 18, bl[2] * 0.95, bl[2] * 1.1, '#5b3a2a'); });
    body += k.g({ filter: 'url(#cb-shadow)', opacity: 0.14 }, shadows);
    left.forEach(function (bl) {
        body += k.balloon(bl[0], bl[1], bl[2], bl[3], 'rgba(255,255,255,0.55)', p.cord, 170 + rng() * 120, -Math.abs(bl[4]) * 0.6);
    });
    right.forEach(function (bl) {
        body += k.balloon(bl[0], bl[1], bl[2], bl[3], 'rgba(255,255,255,0.55)', p.cord, 170 + rng() * 120, Math.abs(bl[4]) * 0.6);
    });
    // Sparkles.
    [[520, 250, 18], [600, 1150, 22], [190, 1100, 14], [900, 1120, 16], [470, 1220, 10], [700, 230, 11]].forEach(function (s) {
        body += k.sparkle(s[0], s[1], s[2], p.sparkle);
    });
    // Curling ribbon streamer along the bottom.
    body += k.stroke('M-20 1250 C120 1170 200 1320 340 1240 S560 1170 680 1260 S900 1320 1100 1220', p.ribbon, 7, { opacity: 0.85 });
    body += k.stroke('M-20 1290 C140 1230 240 1340 380 1290 S600 1230 760 1300 S960 1330 1100 1280', b[1], 5, { opacity: 0.7 });
    body += k.grainLayer(W, H, 'cb-grain', 0.04);
    return k.svg(W, H, defs, body);
}

module.exports = { id: 'celebration-balloons', render: render, palettes: Object.keys(PALETTES) };
