'use strict';

var k = require('../art-kit.js');

// Ink Wash: soft, painterly landscapes built from blurred, layered washes rather than hard
// vector shapes, the way ink and water bleed on paper. Three compositions share the
// technique: a misty moon over far mountains, a quiet lake with a distant shore and birds,
// and a high moon over drifting night cloud.

var PALETTES = {
    mist: { paper: ['#f4f1e8', '#e9e4d6'], ink: '#3c3a36', wash: '#8f8a80', moon: '#fbf8ee', accent: '#b9a47c' },
    blue: { paper: ['#c9d8e6', '#8fa8c0'], ink: '#24364a', wash: '#5e7893', moon: '#f3f6fa', accent: '#e9eef4' },
    night: { paper: ['#0d1a33', '#1d3157'], ink: '#050c1c', wash: '#2a4170', moon: '#fff4d4', accent: '#cdd9f5' }
};

function render(W, H, options) {
    var o = options || {};
    var p = PALETTES[o.palette || 'mist'];
    var layout = o.layout || 'moon';
    var rng = k.seeded('ink-wash-' + layout);
    var defs = '';
    defs += k.linear('iw-paper', p.paper);
    defs += k.blur('iw-wash', 16);
    defs += k.blur('iw-soft', 5);
    defs += k.blur('iw-haze', 40);
    defs += k.radial('iw-moonglow', [[p.moon, 0.7, 0], [p.moon, 0.18, 0.35], [p.moon, 0, 1]]);
    defs += k.mottleFilter('iw-mottle', 0.005, 6);
    defs += k.grainFilter('iw-grain', 0.75, 3, 19);
    defs += k.el('filter', { id: 'iw-bleed', x: '-10%', y: '-10%', width: '120%', height: '120%' },
        k.el('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.012, numOctaves: 3, seed: 4, result: 'n' }) +
        k.el('feDisplacementMap', { in: 'SourceGraphic', in2: 'n', scale: 26, xChannelSelector: 'R', yChannelSelector: 'G', result: 'd' }) +
        k.el('feGaussianBlur', { in: 'd', stdDeviation: 3 }));

    var body = '';
    body += k.rect(0, 0, W, H, 'url(#iw-paper)');
    body += k.grainLayer(W, H, 'iw-mottle', 0.08);

    function mountains(base, amp, opacity, seed, color) {
        return k.g({ filter: 'url(#iw-bleed)', opacity: opacity }, k.path(k.ridge(W, base, amp, k.seeded(seed), H + 40, 4), color || p.wash));
    }

    if (layout === 'moon') {
        body += k.circle(760, 300, 260, 'url(#iw-moonglow)');
        body += k.circle(760, 300, 70, p.moon, { opacity: 0.95 });
        body += mountains(930, 120, 0.22, 'iw-a');
        body += k.rect(0, 900, W, 140, p.paper[0], { filter: 'url(#iw-haze)', opacity: 0.8 });
        body += mountains(1040, 90, 0.4, 'iw-b');
        body += k.rect(0, 1030, W, 100, p.paper[0], { filter: 'url(#iw-haze)', opacity: 0.6 });
        body += mountains(1160, 60, 0.75, 'iw-c', p.ink);
        // Sumi-e pines: a trunk stroke with tiers of tapered horizontal brush marks.
        [[150, 1150, 1], [236, 1170, 0.78], [920, 1180, 0.66]].forEach(function (pine) {
            var px = pine[0];
            var py = pine[1];
            var sc = pine[2];
            var tree = k.stroke('M' + px + ' ' + py + ' C' + (px - 6) + ' ' + (py - 120 * sc) + ' ' + (px + 8) + ' ' + (py - 220 * sc) + ' ' + (px + 2) + ' ' + (py - 300 * sc), p.ink, 6 * sc);
            for (var tier = 0; tier < 4; tier += 1) {
                var ty = py - (110 + tier * 52) * sc;
                var reach = (110 - tier * 20) * sc;
                for (var pad = 0; pad < 5; pad += 1) {
                    var off = (rng() - 0.5) * reach * 1.6;
                    tree += k.ellipse(px + off, ty + (rng() - 0.5) * 12 * sc, reach * (0.22 + rng() * 0.16), (11 + rng() * 6) * sc, p.ink, { opacity: (0.6 + rng() * 0.4).toFixed(2) });
                }
                tree += k.stroke('M' + px + ' ' + (ty + 8 * sc) + ' Q' + (px + (tier % 2 ? 1 : -1) * reach * 0.4) + ' ' + (ty + 2 * sc) + ' ' + (px + (tier % 2 ? 1 : -1) * reach * 0.7) + ' ' + (ty - 4 * sc), p.ink, 3 * sc);
            }
            body += k.g({ filter: 'url(#iw-soft)', opacity: 0.85 }, tree);
        });
    } else if (layout === 'distance') {
        body += k.g({ filter: 'url(#iw-haze)', opacity: 0.6 }, k.ellipse(W * 0.3, 260, 360, 90, p.accent));
        body += mountains(820, 50, 0.25, 'iw-d');
        body += mountains(860, 30, 0.5, 'iw-e', p.ink);
        // Water: long horizontal washes with a few reflections.
        for (var w = 0; w < 14; w += 1) {
            body += k.g({ filter: 'url(#iw-soft)', opacity: (0.08 + rng() * 0.14).toFixed(2) }, k.rect(rng() * W * 0.4, 900 + w * 30 + rng() * 10, W * (0.3 + rng() * 0.6), 4 + rng() * 6, p.ink, { rx: 3 }));
        }
        body += k.g({ filter: 'url(#iw-bleed)', opacity: 0.85 }, k.path('M' + (W - 380) + ' ' + (H + 20) + ' C' + (W - 300) + ' 1120 ' + (W - 160) + ' 1080 ' + (W + 20) + ' 1060 L' + (W + 20) + ' ' + (H + 20) + 'Z', p.ink));
        // Reeds from the near bank.
        for (var r = 0; r < 14; r += 1) {
            var rx = W - 300 + rng() * 290;
            body += k.stroke('M' + rx.toFixed(1) + ' ' + H + ' Q' + (rx - 10).toFixed(1) + ' ' + (1080 - rng() * 60).toFixed(1) + ' ' + (rx - 30 - rng() * 40).toFixed(1) + ' ' + (980 - rng() * 120).toFixed(1), p.ink, 2.4 + rng() * 2, { opacity: 0.8 });
        }
        body += k.bird(300, 420, 26, p.ink) + k.bird(360, 450, 18, p.ink) + k.bird(250, 470, 14, p.ink);
    } else {
        // Night sky: a soft diagonal star band, a crescent, and a lone tree on a low hill.
        body += k.g({ filter: 'url(#iw-haze)', opacity: 0.45 }, k.ellipse(W * 0.45, H * 0.42, 820, 120, p.wash, { transform: 'rotate(-32 ' + (W * 0.45) + ' ' + (H * 0.42) + ')' }));
        body += k.stars(W, H, 160, rng, p.accent, 1080, 0.5, 1.8);
        body += k.circle(780, 250, 240, 'url(#iw-moonglow)', { opacity: 0.7 });
        body += k.path('M780 180 A70 70 0 1 0 780 320 A92 92 0 0 1 780 180Z', p.moon, { transform: 'rotate(-20 780 250)' });
        body += k.g({ filter: 'url(#iw-bleed)' }, k.path('M-20 ' + (H + 20) + ' L-20 1210 C200 1150 420 1130 640 1170 C800 1200 960 1180 ' + (W + 20) + ' 1150 L' + (W + 20) + ' ' + (H + 20) + 'Z', p.ink));
        var trunk = 'M840 1186 C846 1120 836 1060 852 1000 M848 1060 C880 1040 900 1010 930 1000 M846 1090 C810 1070 790 1040 770 1030';
        body += k.stroke(trunk, p.ink, 7);
        var crown = '';
        [[852, 980, 70], [910, 990, 52], [790, 1010, 50], [860, 940, 54], [820, 960, 44]].forEach(function (c) { crown += k.circle(c[0], c[1], c[2], p.ink); });
        body += k.g({ filter: 'url(#iw-soft)' }, crown);
    }
    body += k.grainLayer(W, H, 'iw-grain', 0.06);
    return k.svg(W, H, defs, body);
}

module.exports = { id: 'ink-wash', render: render, palettes: Object.keys(PALETTES) };
