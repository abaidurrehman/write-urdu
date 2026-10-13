'use strict';

var k = require('../art-kit.js');

// Rain & Memory: looking out through a rain-beaded window at evening lights. Warm and teal
// bokeh float in a slate dusk; droplets and a few running trails sit on the glass, thinning
// towards the middle so the words rest on a calm, softly lit pane.

var PALETTES = {
    slate: { sky: ['#1b2633', '#24384a', '#3a4f5f'], bokeh: ['#ffb45c', '#ffd28a', '#6fc3c9', '#f08a5d', '#fff0c8'], glow: '#ffcf8a', mist: '#c9d6df' },
    plum: { sky: ['#221a2e', '#3a2a47', '#55405c'], bokeh: ['#ffb070', '#ffd59a', '#9fb6ff', '#f58aa8', '#fff0d0'], glow: '#ffc79a', mist: '#dccfe0' }
};

function render(W, H, options) {
    var p = PALETTES[(options && options.palette) || 'slate'];
    var rng = k.seeded('rain-memory');
    var defs = '';
    defs += k.linear('rm2-sky', p.sky);
    defs += k.blur('rm2-bokeh-far', 26);
    defs += k.blur('rm2-bokeh-near', 12);
    defs += k.blur('rm2-mist', 60);
    defs += k.blur('rm2-trail', 1.2);
    defs += k.radial('rm2-pane', [['#ffffff', 0.1, 0], ['#ffffff', 0, 1]], '50%', '48%', '45%');
    defs += k.grainFilter('rm2-grain', 0.9, 2, 41);

    var body = '';
    body += k.rect(0, 0, W, H, 'url(#rm2-sky)');
    // Distant city glow and street-light bokeh.
    body += k.g({ filter: 'url(#rm2-mist)', opacity: 0.55 }, k.ellipse(W * 0.3, H * 0.84, 420, 160, p.glow) + k.ellipse(W * 0.85, H * 0.62, 260, 140, p.bokeh[2]));
    var far = '';
    for (var i = 0; i < 46; i += 1) {
        var y = H * (0.56 + rng() * 0.46);
        far += k.circle(rng() * W, y, 14 + rng() * 34, p.bokeh[Math.floor(rng() * p.bokeh.length)], { opacity: (0.25 + rng() * 0.45).toFixed(2) });
    }
    body += k.g({ filter: 'url(#rm2-bokeh-far)' }, far);
    var near = '';
    for (var j = 0; j < 18; j += 1) {
        var ny = H * (0.64 + rng() * 0.38);
        var nx = rng() < 0.5 ? rng() * W * 0.28 : W * 0.72 + rng() * W * 0.28;
        near += k.circle(nx, ny, 30 + rng() * 40, p.bokeh[Math.floor(rng() * p.bokeh.length)], { opacity: (0.35 + rng() * 0.35).toFixed(2) });
    }
    body += k.g({ filter: 'url(#rm2-bokeh-near)' }, near);
    body += k.rect(0, 0, W, H, 'url(#rm2-pane)');

    // Raindrops: dense at the edges, sparse in the text field.
    var drops = '';
    for (var d = 0; d < 420; d += 1) {
        var x = rng() * W;
        var yy = rng() * H;
        var dx = Math.abs(x - W / 2) / (W / 2);
        var dy = Math.abs(yy - H * 0.47) / (H / 2);
        var edge = Math.max(dx, dy);
        if (rng() > edge * edge * 1.15 + 0.04) continue;
        var r = 2.2 + Math.pow(rng(), 2.2) * 12;
        drops += k.raindrop(x, yy, r);
    }
    body += drops;
    // A few running trails down the glass.
    [[120, 80, 520], [960, 140, 460], [210, 760, 360], [880, 820, 420], [60, 420, 300]].forEach(function (t) {
        var d2 = 'M' + t[0] + ' ' + t[1];
        var x = t[0];
        for (var s = 1; s <= 8; s += 1) { x += (rng() - 0.5) * 10; d2 += ' L' + x.toFixed(1) + ' ' + (t[1] + (t[2] * s) / 8).toFixed(1); }
        body += k.g({ filter: 'url(#rm2-trail)' }, k.stroke(d2, 'rgba(255,255,255,0.22)', 3) + k.stroke(d2, 'rgba(10,20,30,0.25)', 1.2, { transform: 'translate(1.5 0)' }));
        body += k.raindrop(x, t[1] + t[2] + 8, 9);
    });
    body += k.grainLayer(W, H, 'rm2-grain', 0.07, 'overlay');
    return k.svg(W, H, defs, body);
}

module.exports = { id: 'rain-memory-window', render: render, palettes: Object.keys(PALETTES) };
