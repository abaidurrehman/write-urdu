'use strict';

var k = require('../art-kit.js');

// Mehndi Festival: a sunlit saffron courtyard dressed for the mehndi night. A mirror-work
// toran runs across the top, marigold (genda) strings cascade down both sides ending in
// brass bells, and a cream cusped panel holds the wording. A teal block-print hem with
// paisleys grounds the composition.

var PALETTES = {
    saffron: { ground: ['#ffcf4a', '#f7a823', '#ef8a17'], print: 'rgba(196,72,22,0.12)', toran: '#d6336c', toranDeep: '#9e1f4e', teal: '#0f7c79', tealDeep: '#09524f', gold: '#f6d27a', panel: ['#fffaf0', '#fbefd6'], panelEdge: '#d6336c', ink: '#7a1c2e' },
    rose: { ground: ['#ffb6c8', '#f78fb0', '#e46a96'], print: 'rgba(150,20,70,0.1)', toran: '#f5a623', toranDeep: '#c46f0b', teal: '#0f7c79', tealDeep: '#09524f', gold: '#ffe08a', panel: ['#fffaf3', '#fdeee6'], panelEdge: '#0f7c79', ink: '#7a1c2e' }
};

var GENDA = [
    { deep: '#e2580b', mid: '#f57c12', light: '#ffa53a' },
    { deep: '#f0a500', mid: '#ffc21a', light: '#ffde5c' },
    { deep: '#d9480f', mid: '#f06a0f', light: '#ff9a3c' }
];

function render(W, H, options) {
    var p = PALETTES[(options && options.palette) || 'saffron'];
    var rng = k.seeded('mehndi-festival');
    var defs = '';
    defs += k.linear('mf-ground', p.ground);
    defs += k.radial('mf-sun', [['#fff6d6', 0.65], ['#fff6d6', 0]], '50%', '45%', '55%');
    defs += k.lozengePattern('mf-print', 72, 72, p.print, p.print);
    defs += k.linear('mf-panel', p.panel);
    defs += k.linear('mf-brass', ['#fff0b3', '#d9a62e', '#9a6a12'], 0, 0, 1, 1);
    defs += k.grainFilter('mf-grain', 0.9, 2, 5);
    defs += k.blur('mf-shadow', 9);

    var body = '';
    body += k.rect(0, 0, W, H, 'url(#mf-ground)');
    body += k.rect(0, 0, W, H, 'url(#mf-print)');
    body += k.rect(0, 0, W, H, 'url(#mf-sun)');

    // Cream cusped panel with a soft shadow, pink double border and mirror dots.
    var panel = k.cuspedArch(196, 300, 688, 920, 0.3, 6, 0.3);
    body += k.g({ filter: 'url(#mf-shadow)', opacity: 0.3, transform: 'translate(0 12)' }, k.path(panel, '#7a2a00'));
    body += k.path(k.cuspedArch(180, 284, 720, 952, 0.3, 6, 0.3), p.panelEdge);
    body += k.path(k.cuspedArch(188, 292, 704, 936, 0.3, 6, 0.3), p.gold);
    body += k.path(panel, 'url(#mf-panel)');
    body += k.path(k.cuspedArch(214, 320, 652, 886, 0.3, 6, 0.3), 'none', { stroke: p.panelEdge, 'stroke-width': 1.6, 'stroke-dasharray': '2 9', 'stroke-linecap': 'round', opacity: 0.8 });
    // Small mehndi-cone vine flourish at the top of the panel (above the text field).
    body += k.at(540, 430, 0, 1,
        k.stroke('M-120 0 C-80 -26 -40 -26 0 -6 C40 -26 80 -26 120 0', p.panelEdge, 2.2) +
        k.blossom(0, -12, 13, p.panelEdge, p.gold, 0, { count: 6 }) +
        k.leaf(-62, -20, 26, -160, p.teal, null) + k.leaf(62, -20, 26, -20, p.teal, null) +
        k.circle(-128, 2, 4, p.panelEdge) + k.circle(128, 2, 4, p.panelEdge));

    // Marigold cascades: long strings at the outer edges, shorter swags in front of the toran.
    var finishBell = function (x, y) { return k.bell(x, y + 6, 15, 'url(#mf-brass)', 'rgba(255,255,255,0.6)'); };
    var finishTassel = function (x, y) { return k.tassel(x, y + 8, 18, p.toran, p.toran); };
    [[56, 1100, finishBell], [124, 800, finishTassel], [W - 56, 1100, finishBell], [W - 124, 800, finishTassel]].forEach(function (s) {
        body += k.marigoldString(s[0], 90, s[1], 17, GENDA, rng, s[2]);
    });
    [[300, 120], [420, 70], [660, 70], [780, 120]].forEach(function (s, index) {
        body += k.marigoldString(s[0], 90, s[1], 14, index % 2 ? GENDA.slice(1) : GENDA, rng, finishBell);
    });

    // Toran: fabric valance with a teal stripe, scalloped hem, mirror work and tassels.
    body += k.rect(0, 0, W, 100, p.toran);
    body += k.rect(0, 18, W, 22, p.teal);
    body += k.rect(0, 20, W, 18, 'url(#mf-print)');
    var zig = 'M0 58';
    for (var zx = 0; zx <= W; zx += 24) zig += ' L' + (zx + 12) + ' ' + (zx % 48 === 0 ? 50 : 66);
    body += k.stroke(zig, p.gold, 3);
    var scallops = 'M0 92';
    var step = 60;
    for (var sx = 0; sx < W; sx += step) scallops += ' Q' + (sx + step / 2) + ' 136 ' + (sx + step) + ' 92';
    body += k.path(scallops + ' L' + W + ' 80 L0 80Z', p.toranDeep);
    body += k.path(scallops.replace('M0 92', 'M0 86').replace(/ 92/g, ' 86').replace(/136/g, '126') + ' L' + W + ' 76 L0 76Z', p.toran);
    for (var mx = step / 2; mx < W; mx += step) {
        body += k.circle(mx, 104, 8, '#e9eef2', { stroke: p.gold, 'stroke-width': 2.5 });
        body += k.circle(mx - 2, 102, 3, '#ffffff', { opacity: 0.9 });
    }
    for (var dx = 12; dx < W; dx += 36) body += k.circle(dx, 10, 3.2, p.gold, { opacity: 0.85 });

    // Block-print hem with paisleys.
    body += k.rect(0, H - 104, W, 104, p.tealDeep);
    body += k.rect(0, H - 104, W, 6, p.gold);
    body += k.rect(0, H - 92, W, 80, p.teal);
    body += k.rect(0, H - 92, W, 80, 'url(#mf-print)');
    for (var px = 40; px < W; px += 120) {
        body += k.paisley(px + 20, H - 50, 30, 30, p.toran, p.gold, '#fff3c4');
        body += k.blossom(px + 80, H - 54, 10, p.gold, p.toran, 0, { count: 6 });
    }
    body += k.rect(0, H - 12, W, 12, p.toranDeep);

    body += k.grainLayer(W, H, 'mf-grain', 0.05);
    return k.svg(W, H, defs, body);
}

module.exports = { id: 'mehndi-marigold-festival', render: render, palettes: Object.keys(PALETTES) };
