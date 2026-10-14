(function (root, factory) {
    var api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduWeddingDesigns = api;
}(typeof window !== 'undefined' ? window : null, function () {
    'use strict';

    // WU-SHAADI-001 wedding design library.
    //
    // Every design is original procedural SVG artwork generated here at whatever card size is
    // requested (portrait, story, print), so it stays crisp on high-DPI screens and in exports
    // and costs no image requests. Artwork never contains text: invitation wording is drawn on
    // top by js/wedding-invitation-canvas.js inside each design's `safe` rectangle.
    //
    // A design owns visual decisions only (art, colourways, text colours, lettering defaults).
    // It never owns wedding semantics; those stay in the WeddingProject.

    var STYLES = ['traditional', 'modern'];
    var EVENT_ORDER = ['nikah', 'mehndi', 'baraat', 'walima', 'mayun', 'dholki', 'engagement', 'rukhsati', 'custom'];

    // ---------- small deterministic helpers ----------

    function seeded(seedText) {
        var seed = 2166136261;
        for (var i = 0; i < seedText.length; i += 1) {
            seed ^= seedText.charCodeAt(i);
            seed = Math.imul(seed, 16777619) >>> 0;
        }
        return function () {
            seed = (Math.imul(seed ^ (seed >>> 15), 2246822507) + 0x6d2b79f5) >>> 0;
            seed = Math.imul(seed ^ (seed >>> 13), 3266489909) >>> 0;
            return ((seed ^ (seed >>> 16)) >>> 0) / 4294967296;
        };
    }

    function n(value) {
        return Math.round(value * 100) / 100;
    }

    function attrs(map) {
        return Object.keys(map).map(function (key) {
            return map[key] === undefined || map[key] === null ? '' : ' ' + key + '="' + map[key] + '"';
        }).join('');
    }

    function el(tag, map, inner) {
        return '<' + tag + attrs(map || {}) + (inner === undefined ? '/>' : '>' + inner + '</' + tag + '>');
    }

    function group(transform, inner, extra) {
        return el('g', Object.assign({ transform: transform }, extra || {}), inner);
    }

    function wrapSvg(W, H, defs, body) {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
            '<defs>' + defs + '</defs>' + body + '</svg>';
    }

    function linear(id, stops, x2, y2) {
        return el('linearGradient', { id: id, x1: 0, y1: 0, x2: x2 === undefined ? 0 : x2, y2: y2 === undefined ? 1 : y2 },
            stops.map(function (stop, index) {
                return el('stop', { offset: n(index / Math.max(1, stops.length - 1)), 'stop-color': stop });
            }).join(''));
    }

    function radial(id, stops, opacities) {
        return el('radialGradient', { id: id, cx: '50%', cy: '50%', r: '50%' },
            stops.map(function (stop, index) {
                return el('stop', { offset: n(index / Math.max(1, stops.length - 1)), 'stop-color': stop, 'stop-opacity': opacities ? opacities[index] : 1 });
            }).join(''));
    }

    function rectFrame(x, y, w, h, stroke, width, radius, extra) {
        return el('rect', Object.assign({ x: n(x), y: n(y), width: n(w), height: n(h), rx: radius || 0, fill: 'none', stroke: stroke, 'stroke-width': width }, extra || {}));
    }

    // Pointed Mughal arch from the base line up to an apex with a small finial.
    function archPath(x, y, w, h, springRatio, closed) {
        var cx = x + w / 2;
        var bottom = y + h;
        var spring = y + h * (springRatio === undefined ? 0.36 : springRatio);
        var rise = spring - y;
        var d = 'M' + n(x) + ' ' + n(bottom) + ' L' + n(x) + ' ' + n(spring) +
            ' C' + n(x) + ' ' + n(spring - rise * 0.62) + ' ' + n(cx - w * 0.2) + ' ' + n(y + rise * 0.22) + ' ' + n(cx) + ' ' + n(y) +
            ' C' + n(cx + w * 0.2) + ' ' + n(y + rise * 0.22) + ' ' + n(x + w) + ' ' + n(spring - rise * 0.62) + ' ' + n(x + w) + ' ' + n(spring) +
            ' L' + n(x + w) + ' ' + n(bottom);
        return closed ? d + ' Z' : d;
    }

    function finial(cx, y, size, fill) {
        return el('path', { d: 'M' + n(cx) + ' ' + n(y - size * 1.9) + ' C' + n(cx + size * 0.55) + ' ' + n(y - size * 1.1) + ' ' + n(cx + size * 0.6) + ' ' + n(y - size * 0.3) + ' ' + n(cx) + ' ' + n(y) +
            ' C' + n(cx - size * 0.6) + ' ' + n(y - size * 0.3) + ' ' + n(cx - size * 0.55) + ' ' + n(y - size * 1.1) + ' ' + n(cx) + ' ' + n(y - size * 1.9) + 'Z', fill: fill }) +
            el('circle', { cx: n(cx), cy: n(y - size * 2.35), r: n(size * 0.32), fill: fill });
    }

    function leaf(x, y, length, angle, fill, rib) {
        var l = length;
        var shape = el('path', { d: 'M0 0 C' + n(l * 0.3) + ' ' + n(-l * 0.28) + ' ' + n(l * 0.72) + ' ' + n(-l * 0.24) + ' ' + n(l) + ' 0 C' + n(l * 0.72) + ' ' + n(l * 0.24) + ' ' + n(l * 0.3) + ' ' + n(l * 0.28) + ' 0 0Z', fill: fill });
        var line = rib ? el('path', { d: 'M' + n(l * 0.08) + ' 0 L' + n(l * 0.9) + ' 0', stroke: rib, 'stroke-width': n(Math.max(0.8, l * 0.035)), fill: 'none', 'stroke-linecap': 'round' }) : '';
        return group('translate(' + n(x) + ' ' + n(y) + ') rotate(' + n(angle) + ')', shape + line);
    }

    function rose(x, y, r, petal, dark, light) {
        var s = r / 40;
        var outline = 'M-40 4 C-42 -22 -20 -42 2 -40 C26 -40 42 -20 40 2 C40 26 22 42 -2 40 C-24 41 -40 26 -40 4Z';
        var inner = [
            'M-28 8 C-30 -14 -10 -30 8 -28 C24 -26 32 -10 28 6',
            'M-18 10 C-20 -6 -6 -20 8 -18 C18 -16 22 -4 18 8 C14 18 0 22 -10 16',
            'M-8 6 C-8 -4 2 -10 8 -6 C12 -2 10 6 2 8',
            'M-32 14 C-26 30 -6 36 12 32 C26 28 34 18 34 8'
        ];
        return group('translate(' + n(x) + ' ' + n(y) + ') scale(' + n(s) + ')',
            el('path', { d: outline, fill: petal }) +
            el('path', { d: 'M-30 -6 C-26 -26 -6 -36 12 -32', fill: 'none', stroke: light, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0.7 }) +
            inner.map(function (d) { return el('path', { d: d, fill: 'none', stroke: dark, 'stroke-width': 3.4, 'stroke-linecap': 'round' }); }).join(''));
    }

    function petalFlower(x, y, r, count, petal, center, edge, rotation) {
        var parts = '';
        for (var i = 0; i < count; i += 1) {
            var angle = (360 / count) * i + (rotation || 0);
            parts += el('ellipse', { cx: 0, cy: n(-r * 0.52), rx: n(r * 0.3), ry: n(r * 0.52), fill: petal, stroke: edge || 'none', 'stroke-width': edge ? n(Math.max(0.6, r * 0.04)) : 0, transform: 'rotate(' + n(angle) + ')' });
        }
        parts += el('circle', { cx: 0, cy: 0, r: n(r * 0.24), fill: center });
        return group('translate(' + n(x) + ' ' + n(y) + ')', parts);
    }

    // Ruffled genda ball: rings of overlapping scallops, darker at the rim.
    function marigold(x, y, r, outer, mid, inner) {
        var parts = el('circle', { cx: 0, cy: 0, r: n(r * 0.92), fill: mid });
        var rings = [[outer, 16, 0.76, 0.27], [mid, 12, 0.5, 0.24], [inner, 7, 0.24, 0.2]];
        rings.forEach(function (ring, k) {
            for (var i = 0; i < ring[1]; i += 1) {
                var angle = (Math.PI * 2 / ring[1]) * i + k * 0.35;
                parts += el('circle', { cx: n(Math.cos(angle) * r * ring[2]), cy: n(Math.sin(angle) * r * ring[2]), r: n(r * ring[3]), fill: ring[0], stroke: outer, 'stroke-width': n(Math.max(0.4, r * 0.035)), 'stroke-opacity': 0.55 });
            }
        });
        parts += el('circle', { cx: 0, cy: 0, r: n(r * 0.12), fill: outer, opacity: 0.8 });
        return group('translate(' + n(x) + ' ' + n(y) + ')', parts);
    }

    // Repeated motifs (garland flowers) are defined once and placed with <use> to keep the
    // artwork small. `motif` is drawn at the origin with radius `base`.
    function motifDef(id, motif) {
        return el('g', { id: id }, motif);
    }

    function useMotif(id, x, y, scale) {
        return el('use', { href: '#' + id, transform: 'translate(' + n(x) + ' ' + n(y) + ') scale(' + n(scale) + ')' });
    }

    function sprig(x, y, length, angle, stem, leafFill, bud) {
        var parts = el('path', { d: 'M0 0 Q' + n(length * 0.5) + ' ' + n(-length * 0.08) + ' ' + n(length) + ' 0', fill: 'none', stroke: stem, 'stroke-width': n(Math.max(1, length * 0.018)), 'stroke-linecap': 'round' });
        for (var i = 1; i <= 4; i += 1) {
            var t = i / 5;
            parts += leaf(length * t, -length * 0.02, length * 0.22, -38, leafFill);
            parts += leaf(length * t, length * 0.01, length * 0.2, 36, leafFill);
        }
        if (bud) parts += el('circle', { cx: n(length), cy: 0, r: n(length * 0.05), fill: bud });
        return group('translate(' + n(x) + ' ' + n(y) + ') rotate(' + n(angle) + ')', parts);
    }

    function star8(cx, cy, r, fill, stroke, width) {
        var points = [];
        for (var i = 0; i < 16; i += 1) {
            var radius = i % 2 === 0 ? r : r * 0.62;
            var angle = Math.PI / 8 * i - Math.PI / 2;
            points.push(n(cx + Math.cos(angle) * radius) + ',' + n(cy + Math.sin(angle) * radius));
        }
        return el('polygon', { points: points.join(' '), fill: fill || 'none', stroke: stroke || 'none', 'stroke-width': width || 0 });
    }

    function sparkle(cx, cy, r, fill) {
        return el('path', { d: 'M' + n(cx) + ' ' + n(cy - r) + ' Q' + n(cx + r * 0.16) + ' ' + n(cy - r * 0.16) + ' ' + n(cx + r) + ' ' + n(cy) +
            ' Q' + n(cx + r * 0.16) + ' ' + n(cy + r * 0.16) + ' ' + n(cx) + ' ' + n(cy + r) +
            ' Q' + n(cx - r * 0.16) + ' ' + n(cy + r * 0.16) + ' ' + n(cx - r) + ' ' + n(cy) +
            ' Q' + n(cx - r * 0.16) + ' ' + n(cy - r * 0.16) + ' ' + n(cx) + ' ' + n(cy - r) + 'Z', fill: fill });
    }

    function lantern(cx, top, length, size, body, metal, glow) {
        var y = top + length;
        return el('line', { x1: n(cx), y1: n(top), x2: n(cx), y2: n(y - size * 0.9), stroke: metal, 'stroke-width': n(Math.max(1, size * 0.05)) }) +
            el('circle', { cx: n(cx), cy: n(y + size * 0.4), r: n(size * 1.6), fill: 'url(#lanternGlow)', opacity: glow }) +
            el('path', { d: 'M' + n(cx - size * 0.35) + ' ' + n(y - size * 0.9) + ' L' + n(cx + size * 0.35) + ' ' + n(y - size * 0.9) + ' L' + n(cx + size * 0.62) + ' ' + n(y - size * 0.45) + ' L' + n(cx - size * 0.62) + ' ' + n(y - size * 0.45) + 'Z', fill: metal }) +
            el('path', { d: 'M' + n(cx - size * 0.62) + ' ' + n(y - size * 0.45) + ' L' + n(cx + size * 0.62) + ' ' + n(y - size * 0.45) + ' L' + n(cx + size * 0.5) + ' ' + n(y + size * 0.75) + ' L' + n(cx - size * 0.5) + ' ' + n(y + size * 0.75) + 'Z', fill: body, stroke: metal, 'stroke-width': n(Math.max(1, size * 0.06)) }) +
            el('path', { d: 'M' + n(cx) + ' ' + n(y - size * 0.45) + ' L' + n(cx) + ' ' + n(y + size * 0.75) + ' M' + n(cx - size * 0.56) + ' ' + n(y + size * 0.15) + ' L' + n(cx + size * 0.56) + ' ' + n(y + size * 0.15), stroke: metal, 'stroke-width': n(Math.max(0.8, size * 0.04)), opacity: 0.7 }) +
            el('path', { d: 'M' + n(cx - size * 0.5) + ' ' + n(y + size * 0.75) + ' L' + n(cx + size * 0.5) + ' ' + n(y + size * 0.75) + ' L' + n(cx + size * 0.2) + ' ' + n(y + size * 1.05) + ' L' + n(cx - size * 0.2) + ' ' + n(y + size * 1.05) + 'Z', fill: metal }) +
            el('circle', { cx: n(cx), cy: n(y + size * 1.25), r: n(size * 0.12), fill: metal });
    }

    function diya(cx, cy, size, bowl, rim, flame) {
        return el('ellipse', { cx: n(cx), cy: n(cy - size * 0.95), rx: n(size * 0.9), ry: n(size * 1.2), fill: 'url(#diyaGlow)' }) +
            el('path', { d: 'M' + n(cx - size) + ' ' + n(cy) + ' Q' + n(cx) + ' ' + n(cy + size * 0.95) + ' ' + n(cx + size) + ' ' + n(cy) + ' Q' + n(cx + size * 0.5) + ' ' + n(cy - size * 0.12) + ' ' + n(cx + size * 1.25) + ' ' + n(cy - size * 0.38) + ' L' + n(cx - size) + ' ' + n(cy) + 'Z', fill: bowl }) +
            el('path', { d: 'M' + n(cx - size) + ' ' + n(cy) + ' Q' + n(cx) + ' ' + n(cy + size * 0.3) + ' ' + n(cx + size) + ' ' + n(cy), fill: 'none', stroke: rim, 'stroke-width': n(size * 0.12) }) +
            el('path', { d: 'M' + n(cx) + ' ' + n(cy - size * 1.15) + ' C' + n(cx + size * 0.35) + ' ' + n(cy - size * 0.6) + ' ' + n(cx + size * 0.25) + ' ' + n(cy - size * 0.1) + ' ' + n(cx) + ' ' + n(cy - size * 0.08) +
                ' C' + n(cx - size * 0.25) + ' ' + n(cy - size * 0.1) + ' ' + n(cx - size * 0.35) + ' ' + n(cy - size * 0.6) + ' ' + n(cx) + ' ' + n(cy - size * 1.15) + 'Z', fill: flame });
    }

    function stringOfPoints(x1, y1, x2, y2, sag, count) {
        var points = [];
        for (var i = 0; i <= count; i += 1) {
            var t = i / count;
            points.push({ x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t + Math.sin(Math.PI * t) * sag });
        }
        return points;
    }

    function swagPath(x1, y1, x2, y2, sag) {
        return 'M' + n(x1) + ' ' + n(y1) + ' Q' + n((x1 + x2) / 2) + ' ' + n((y1 + y2) / 2 + sag * 2) + ' ' + n(x2) + ' ' + n(y2);
    }

    // Corner ornament built from scrolls: drawn for the top-left corner, mirrored by callers.
    function cornerScroll(size, stroke, width, accent) {
        var s = size;
        return el('path', { d: 'M0 ' + n(s) + ' L0 ' + n(s * 0.22) + ' Q0 0 ' + n(s * 0.22) + ' 0 L' + n(s) + ' 0', fill: 'none', stroke: stroke, 'stroke-width': width }) +
            el('path', { d: 'M' + n(s * 0.14) + ' ' + n(s * 0.78) + ' C' + n(s * 0.14) + ' ' + n(s * 0.3) + ' ' + n(s * 0.3) + ' ' + n(s * 0.14) + ' ' + n(s * 0.78) + ' ' + n(s * 0.14), fill: 'none', stroke: stroke, 'stroke-width': n(width * 0.7) }) +
            el('path', { d: 'M' + n(s * 0.2) + ' ' + n(s * 0.2) + ' C' + n(s * 0.42) + ' ' + n(s * 0.12) + ' ' + n(s * 0.5) + ' ' + n(s * 0.36) + ' ' + n(s * 0.34) + ' ' + n(s * 0.4) + ' C' + n(s * 0.24) + ' ' + n(s * 0.42) + ' ' + n(s * 0.22) + ' ' + n(s * 0.3) + ' ' + n(s * 0.3) + ' ' + n(s * 0.28), fill: 'none', stroke: stroke, 'stroke-width': n(width * 0.8), 'stroke-linecap': 'round' }) +
            star8(s * 0.2, s * 0.2, s * 0.07, accent || stroke);
    }

    function fourCorners(W, H, inset, size, builder) {
        var inner = builder(size);
        return group('translate(' + n(inset) + ' ' + n(inset) + ')', inner) +
            group('translate(' + n(W - inset) + ' ' + n(inset) + ') scale(-1 1)', inner) +
            group('translate(' + n(inset) + ' ' + n(H - inset) + ') scale(1 -1)', inner) +
            group('translate(' + n(W - inset) + ' ' + n(H - inset) + ') scale(-1 -1)', inner);
    }

    function safeRect(x, y, w, h) {
        return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
    }

    // ---------- designs ----------

    var DESIGNS = [];

    function define(design) {
        DESIGNS.push(Object.freeze(design));
    }

    // 0. Royal Mughal — the WU-CARD-ART-001 flagship, shared with Card Studio's backgrounds.
    // One artistic identity, a ceremony palette each: emerald Nikah, ruby Baraat, saffron
    // Mehndi, champagne Walima. Drawn by js/card-art-royal-mughal.js at any card size.
    function royalMughalArt() {
        if (typeof window !== 'undefined' && window.WriteUrduRoyalMughalArt) return window.WriteUrduRoyalMughalArt;
        if (typeof require === 'function') return require('./card-art-royal-mughal.js');
        throw new Error('Royal Mughal artwork unavailable');
    }

    define({
        id: 'royal-mughal',
        name: 'Royal Mughal',
        nameUr: 'شاہی مغلیہ',
        blurb: 'Cusped ivory arch in ruby and gold, a matching suite for every function',
        bestFor: ['nikah', 'baraat', 'walima', 'mehndi', 'engagement', 'rukhsati'],
        style: 'traditional',
        lettering: 'calligraphic',
        divider: 'flourish',
        eventColorways: { nikah: 'emerald', baraat: 'ruby', mehndi: 'saffron', walima: 'champagne', engagement: 'emerald', rukhsati: 'ruby' },
        colorways: [
            { id: 'emerald', name: 'Nikah emerald', swatch: ['#0f4634', '#c99a45', '#fdf7ea'], c: { palette: 'emerald', ink: '#173f30', accent: '#7a1424', muted: '#7a6a4a' } },
            { id: 'ruby', name: 'Baraat ruby', swatch: ['#6e1427', '#c99a45', '#fdf6ea'], c: { palette: 'ruby', ink: '#4d0d1b', accent: '#0f4634', muted: '#7a5a4a' } },
            { id: 'saffron', name: 'Mehndi saffron', swatch: ['#d9821a', '#b5175b', '#fffaf0'], c: { palette: 'saffron', ink: '#6b1230', accent: '#b5175b', muted: '#8a5a2a' } },
            { id: 'champagne', name: 'Walima champagne', swatch: ['#d9c3a5', '#7d9479', '#fffdf8'], c: { palette: 'champagne', ink: '#3f4a3a', accent: '#5c7259', muted: '#8a7a5e' } }
        ],
        art: function (W, H, c) {
            return royalMughalArt().render(W, H, { palette: c.palette });
        }
    });

    // 1. Mughal Garden — ivory arch climbed by rose vines.
    define({
        id: 'mughal-garden',
        name: 'Mughal Garden',
        nameUr: 'مغل باغ',
        blurb: 'Rose vines around a Mughal arch',
        bestFor: ['nikah', 'baraat', 'walima', 'mehndi', 'engagement'],
        style: 'traditional',
        lettering: 'calligraphic',
        divider: 'flourish',
        eventColorways: { mehndi: 'marigold', baraat: 'burgundy', walima: 'sage', nikah: 'rose', engagement: 'rose' },
        colorways: [
            { id: 'rose', name: 'Rose & gold', swatch: ['#fbf6ec', '#c45a6a', '#b08a4a'], c: { bg1: '#fffaf1', bg2: '#f4eadb', frame: '#b38a49', flower: '#c4566a', flowerDark: '#8e2f45', flowerLight: '#f2b6bf', leaf: '#7f9a72', ink: '#4a3a32', accent: '#8e2f45', muted: '#8a7360' } },
            { id: 'marigold', name: 'Marigold', swatch: ['#fff6dc', '#f0a019', '#5f8a3a'], c: { bg1: '#fffbe9', bg2: '#fbeec2', frame: '#c8902b', flower: '#f0a019', flowerDark: '#c56a0c', flowerLight: '#ffd36b', leaf: '#5f8a3a', ink: '#4f3a1d', accent: '#a64b12', muted: '#8a6a35' } },
            { id: 'burgundy', name: 'Burgundy', swatch: ['#fbf3ea', '#7d1f33', '#b58b45'], c: { bg1: '#fcf6ee', bg2: '#f1e2d0', frame: '#a8803e', flower: '#8b2236', flowerDark: '#5a1020', flowerLight: '#d7808f', leaf: '#6d7f55', ink: '#3f2a26', accent: '#7d1f33', muted: '#83645a' } },
            { id: 'sage', name: 'Sage', swatch: ['#f7f8f1', '#e6b6b0', '#8ea489'], c: { bg1: '#fbfbf6', bg2: '#eef0e6', frame: '#b49d6c', flower: '#e3a9a6', flowerDark: '#b8706e', flowerLight: '#f6d9d4', leaf: '#8ea489', ink: '#46503f', accent: '#5f7259', muted: '#7e8774' } }
        ],
        art: function (W, H, c) {
            var s = W / 1080;
            var m = 46 * s;
            var archX = 150 * s;
            var archW = W - archX * 2;
            var archY = 150 * s;
            var archH = H - archY - 120 * s;
            var vine = '';
            var rand = seeded('mughal' + W + H);
            [-1, 1].forEach(function (side) {
                var baseX = side < 0 ? archX : archX + archW;
                var steps = 12;
                var stem = '';
                for (var i = 0; i < steps; i += 1) {
                    var t = i / (steps - 1);
                    var y = archY + archH - t * (archH * 0.7);
                    var x = baseX + side * (Math.sin(t * 9) * 16 * s);
                    stem += (i === 0 ? 'M' : ' L') + n(x) + ' ' + n(y);
                    vine += leaf(x, y, (40 + rand() * 18) * s, side < 0 ? -160 + rand() * 50 : -20 - rand() * 50, c.leaf, c.flowerDark);
                    vine += leaf(x, y + 14 * s, (34 + rand() * 14) * s, side < 0 ? 150 - rand() * 50 : 30 + rand() * 50, c.leaf);
                    if (i % 3 === 0) vine += rose(x + side * 6 * s, y - 8 * s, (26 + rand() * 10) * s, c.flower, c.flowerDark, c.flowerLight);
                    else if (i % 3 === 1) vine += petalFlower(x + side * 14 * s, y - 12 * s, 15 * s, 5, c.flowerLight, c.frame);
                    else vine += el('circle', { cx: n(x - side * 14 * s), cy: n(y - 4 * s), r: n(6 * s), fill: c.flower });
                }
                vine = el('path', { d: stem, fill: 'none', stroke: c.leaf, 'stroke-width': n(2.4 * s), 'stroke-linejoin': 'round' }) + vine;
            });
            var crown = rose(W / 2, archY + 48 * s, 30 * s, c.flower, c.flowerDark, c.flowerLight) +
                leaf(W / 2 - 18 * s, archY + 54 * s, 56 * s, 200, c.leaf, c.flowerDark) +
                leaf(W / 2 + 18 * s, archY + 54 * s, 56 * s, -20, c.leaf, c.flowerDark) +
                rose(W / 2 - 62 * s, archY + 76 * s, 18 * s, c.flower, c.flowerDark, c.flowerLight) +
                rose(W / 2 + 62 * s, archY + 76 * s, 18 * s, c.flower, c.flowerDark, c.flowerLight);
            var defs = linear('bg', [c.bg1, c.bg2], 1, 1) +
                el('pattern', { id: 'geo', width: n(60 * s), height: n(60 * s), patternUnits: 'userSpaceOnUse' }, star8(30 * s, 30 * s, 12 * s, 'none', c.frame, n(1.1 * s)));
            var body = el('rect', { width: W, height: H, fill: 'url(#bg)' }) +
                el('rect', { width: W, height: H, fill: 'url(#geo)', opacity: 0.16 }) +
                rectFrame(m, m, W - m * 2, H - m * 2, c.frame, n(3 * s), 6 * s) +
                rectFrame(m + 12 * s, m + 12 * s, W - (m + 12 * s) * 2, H - (m + 12 * s) * 2, c.frame, n(1.2 * s), 4 * s) +
                fourCorners(W, H, m + 12 * s, 90 * s, function (size) { return cornerScroll(size, c.frame, n(2 * s)); }) +
                el('path', { d: archPath(archX, archY, archW, archH, 0.33, true), fill: c.bg1, opacity: 0.8 }) +
                el('path', { d: archPath(archX, archY, archW, archH, 0.33), fill: 'none', stroke: c.frame, 'stroke-width': n(3 * s) }) +
                el('path', { d: archPath(archX + 16 * s, archY + 22 * s, archW - 32 * s, archH - 22 * s, 0.33), fill: 'none', stroke: c.frame, 'stroke-width': n(1.2 * s), opacity: 0.8 }) +
                finial(W / 2, archY - 4 * s, 16 * s, c.frame) +
                vine + crown;
            return { svg: wrapSvg(W, H, defs, body), safe: safeRect(archX + 64 * s, archY + archH * 0.2, archW - 128 * s, archH * 0.76) };
        }
    });

    // 2. Emerald Nikah — deep emerald with gold geometry.
    define({
        id: 'emerald-nikah',
        name: 'Emerald Nikah',
        nameUr: 'زمرد',
        blurb: 'Deep emerald, gold Islamic geometry',
        bestFor: ['nikah', 'walima', 'engagement'],
        style: 'traditional',
        lettering: 'calligraphic',
        divider: 'star',
        eventColorways: { nikah: 'emerald', walima: 'teal', baraat: 'oxblood' },
        colorways: [
            { id: 'emerald', name: 'Emerald', swatch: ['#0c3b30', '#d8b66a', '#f7ecd2'], c: { bg1: '#0f4637', bg2: '#082a22', frame: '#d4b064', pattern: '#d4b064', ink: '#f6ead0', accent: '#f0d48e', muted: '#c9b88f' } },
            { id: 'teal', name: 'Peacock teal', swatch: ['#0d3b45', '#d6b46f', '#eef3ef'], c: { bg1: '#11515c', bg2: '#082b33', frame: '#d6b46f', pattern: '#d6b46f', ink: '#f1efe4', accent: '#f1d697', muted: '#bfc9bf' } },
            { id: 'oxblood', name: 'Oxblood', swatch: ['#4a0f1c', '#d9b46b', '#f8e9d5'], c: { bg1: '#5b1424', bg2: '#300811', frame: '#d9b46b', pattern: '#d9b46b', ink: '#f8ead6', accent: '#f2d18f', muted: '#d6b9a4' } }
        ],
        art: function (W, H, c) {
            var s = W / 1080;
            var m = 40 * s;
            var tile = 96 * s;
            var pattern = el('pattern', { id: 'geo', width: n(tile), height: n(tile), patternUnits: 'userSpaceOnUse' },
                star8(tile / 2, tile / 2, tile * 0.32, 'none', c.pattern, n(1.4 * s)) +
                el('rect', { x: n(tile / 2 - tile * 0.16), y: n(tile / 2 - tile * 0.16), width: n(tile * 0.32), height: n(tile * 0.32), fill: 'none', stroke: c.pattern, 'stroke-width': n(1 * s), transform: 'rotate(45 ' + n(tile / 2) + ' ' + n(tile / 2) + ')' }) +
                el('path', { d: 'M0 0 L' + n(tile * 0.18) + ' ' + n(tile * 0.18) + ' M' + n(tile) + ' 0 L' + n(tile * 0.82) + ' ' + n(tile * 0.18) + ' M0 ' + n(tile) + ' L' + n(tile * 0.18) + ' ' + n(tile * 0.82) + ' M' + n(tile) + ' ' + n(tile) + ' L' + n(tile * 0.82) + ' ' + n(tile * 0.82), stroke: c.pattern, 'stroke-width': n(1.2 * s) }));
            var defs = linear('bg', [c.bg1, c.bg2], 0.4, 1) + pattern + radial('vignette', ['#000000', '#000000'], [0, 0.35]);
            var panelX = 118 * s;
            var panelY = 170 * s;
            var panelW = W - panelX * 2;
            var panelH = H - panelY - 130 * s;
            var stars = '';
            [[m + 70 * s, m + 70 * s], [W - m - 70 * s, m + 70 * s], [m + 70 * s, H - m - 70 * s], [W - m - 70 * s, H - m - 70 * s]].forEach(function (p) {
                stars += star8(p[0], p[1], 34 * s, 'none', c.frame, n(2 * s)) + star8(p[0], p[1], 18 * s, c.frame);
            });
            var body = el('rect', { width: W, height: H, fill: 'url(#bg)' }) +
                el('rect', { width: W, height: H, fill: 'url(#geo)', opacity: 0.22 }) +
                el('rect', { width: W, height: H, fill: 'url(#vignette)' }) +
                el('path', { d: archPath(panelX, panelY, panelW, panelH, 0.3, true), fill: c.bg2, opacity: 0.86 }) +
                el('path', { d: archPath(panelX, panelY, panelW, panelH, 0.3, true), fill: 'none', stroke: c.frame, 'stroke-width': n(3.5 * s) }) +
                el('path', { d: archPath(panelX + 18 * s, panelY + 26 * s, panelW - 36 * s, panelH - 44 * s, 0.3, true), fill: 'none', stroke: c.frame, 'stroke-width': n(1.2 * s), 'stroke-dasharray': n(2 * s) + ' ' + n(7 * s), 'stroke-linecap': 'round' }) +
                finial(W / 2, panelY - 6 * s, 18 * s, c.frame) +
                rectFrame(m, m, W - m * 2, H - m * 2, c.frame, n(2.4 * s)) +
                rectFrame(m + 10 * s, m + 10 * s, W - (m + 10 * s) * 2, H - (m + 10 * s) * 2, c.frame, n(1 * s)) +
                stars +
                el('path', { d: 'M' + n(W / 2 - 150 * s) + ' ' + n(H - 104 * s) + ' L' + n(W / 2 + 150 * s) + ' ' + n(H - 104 * s), stroke: c.frame, 'stroke-width': n(1.4 * s) }) +
                star8(W / 2, H - 104 * s, 12 * s, c.frame);
            return { svg: wrapSvg(W, H, defs, body), safe: safeRect(panelX + 54 * s, panelY + panelH * 0.2, panelW - 108 * s, panelH * 0.76) };
        }
    });

    // 3. Ivory Nikah — minimal, generous whitespace, fine arch linework.
    define({
        id: 'ivory-nikah',
        name: 'Ivory Nikah',
        nameUr: 'عاجی',
        blurb: 'Quiet ivory with fine gold arches',
        bestFor: ['nikah', 'walima', 'engagement', 'rukhsati'],
        style: 'modern',
        lettering: 'calligraphic',
        divider: 'line',
        eventColorways: { nikah: 'gold', walima: 'sage', baraat: 'rose' },
        colorways: [
            { id: 'gold', name: 'Ivory & gold', swatch: ['#fbf7ee', '#b8945a', '#2f4a3f'], c: { bg1: '#fdfaf3', bg2: '#f5eedf', frame: '#b8945a', ink: '#33463c', accent: '#2c4a3d', muted: '#8f7a58' } },
            { id: 'sage', name: 'Ivory & sage', swatch: ['#f9faf4', '#93a58b', '#47554a'], c: { bg1: '#fbfcf7', bg2: '#eef1e6', frame: '#93a58b', ink: '#47554a', accent: '#3d5345', muted: '#86917f' } },
            { id: 'rose', name: 'Ivory & rose', swatch: ['#fcf6f2', '#c08a85', '#5a3a39'], c: { bg1: '#fdf8f4', bg2: '#f5e8e2', frame: '#c08a85', ink: '#5a3a39', accent: '#7c3f45', muted: '#a07d74' } }
        ],
        art: function (W, H, c) {
            var s = W / 1080;
            var archX = 210 * s;
            var archW = W - archX * 2;
            var archY = 120 * s;
            var archH = H - archY - 150 * s;
            var domes = '';
            var cx = W / 2;
            var baseY = H - 150 * s;
            // Small mosque silhouette in line art beneath the arch.
            domes += el('path', { d: 'M' + n(cx - 70 * s) + ' ' + n(baseY) + ' C' + n(cx - 70 * s) + ' ' + n(baseY - 60 * s) + ' ' + n(cx - 20 * s) + ' ' + n(baseY - 78 * s) + ' ' + n(cx) + ' ' + n(baseY - 100 * s) + ' C' + n(cx + 20 * s) + ' ' + n(baseY - 78 * s) + ' ' + n(cx + 70 * s) + ' ' + n(baseY - 60 * s) + ' ' + n(cx + 70 * s) + ' ' + n(baseY), fill: 'none', stroke: c.frame, 'stroke-width': n(1.6 * s) });
            [-1, 1].forEach(function (side) {
                var mx = cx + side * 120 * s;
                domes += el('path', { d: 'M' + n(mx - 8 * s) + ' ' + n(baseY) + ' L' + n(mx - 8 * s) + ' ' + n(baseY - 110 * s) + ' L' + n(mx) + ' ' + n(baseY - 128 * s) + ' L' + n(mx + 8 * s) + ' ' + n(baseY - 110 * s) + ' L' + n(mx + 8 * s) + ' ' + n(baseY), fill: 'none', stroke: c.frame, 'stroke-width': n(1.4 * s) });
            });
            domes += el('path', { d: 'M' + n(cx - 170 * s) + ' ' + n(baseY) + ' L' + n(cx + 170 * s) + ' ' + n(baseY), stroke: c.frame, 'stroke-width': n(1.4 * s) });
            var defs = linear('bg', [c.bg1, c.bg2], 0, 1);
            var body = el('rect', { width: W, height: H, fill: 'url(#bg)' }) +
                el('path', { d: archPath(archX, archY, archW, archH, 0.3), fill: 'none', stroke: c.frame, 'stroke-width': n(1.8 * s) }) +
                el('path', { d: archPath(archX - 22 * s, archY - 26 * s, archW + 44 * s, archH + 26 * s, 0.3), fill: 'none', stroke: c.frame, 'stroke-width': n(0.9 * s), opacity: 0.7 }) +
                finial(cx, archY - 30 * s, 10 * s, c.frame) +
                sparkle(cx, archY + 40 * s, 10 * s, c.frame) +
                domes;
            return { svg: wrapSvg(W, H, defs, body), safe: safeRect(archX + 24 * s, archY + archH * 0.15, archW - 48 * s, archH * 0.68) };
        }
    });

    // 4. Rose Garden — cream with deep red rose clusters in two corners.
    define({
        id: 'rose-garden',
        name: 'Rose Garden',
        nameUr: 'گلاب باغ',
        blurb: 'Deep red roses on warm cream',
        bestFor: ['baraat', 'nikah', 'engagement', 'walima'],
        style: 'traditional',
        lettering: 'calligraphic',
        divider: 'diamond',
        eventColorways: { baraat: 'crimson', nikah: 'crimson', walima: 'blush', engagement: 'blush', mehndi: 'coral' },
        colorways: [
            { id: 'crimson', name: 'Crimson', swatch: ['#fbf4ea', '#a3192c', '#5d7a52'], c: { bg1: '#fdf8f0', bg2: '#f3e6d6', flower: '#b01f33', flowerDark: '#6e0b19', flowerLight: '#e3707d', leaf: '#5d7a52', leafDark: '#3e5737', frame: '#b38d55', ink: '#3e2b26', accent: '#8e1426', muted: '#86695b' } },
            { id: 'blush', name: 'Blush', swatch: ['#fdf7f5', '#e09a9f', '#7f9a83'], c: { bg1: '#fefaf8', bg2: '#f6e9e5', flower: '#e3a0a4', flowerDark: '#b4636c', flowerLight: '#f7d2d2', leaf: '#86a08a', leafDark: '#5f7a63', frame: '#c9a27a', ink: '#4c3a3a', accent: '#9a4e5a', muted: '#9a8279' } },
            { id: 'coral', name: 'Coral', swatch: ['#fff8ef', '#ec7a57', '#5c8a5a'], c: { bg1: '#fffaf2', bg2: '#fcebd9', flower: '#ec7a57', flowerDark: '#b7462b', flowerLight: '#ffc29f', leaf: '#5c8a5a', leafDark: '#3e6a3e', frame: '#d09a5a', ink: '#4a3326', accent: '#a8401f', muted: '#93725c' } }
        ],
        art: function (W, H, c) {
            var s = W / 1080;
            var rand = seeded('rose-garden' + W + H);
            function cluster(x, y, flip) {
                var parts = '';
                var leaves = 9;
                for (var i = 0; i < leaves; i += 1) {
                    parts += leaf((rand() * 220 - 30) * s, (rand() * 200 - 30) * s, (60 + rand() * 50) * s, rand() * 360, i % 2 ? c.leaf : c.leafDark, c.leafDark);
                }
                parts += sprig(150 * s, 30 * s, 190 * s, 8, c.leafDark, c.leaf);
                parts += sprig(30 * s, 150 * s, 190 * s, 82, c.leafDark, c.leaf);
                parts += rose(60 * s, 60 * s, 70 * s, c.flower, c.flowerDark, c.flowerLight);
                parts += rose(165 * s, 30 * s, 46 * s, c.flower, c.flowerDark, c.flowerLight);
                parts += rose(30 * s, 168 * s, 46 * s, c.flower, c.flowerDark, c.flowerLight);
                parts += rose(150 * s, 128 * s, 32 * s, c.flowerLight, c.flowerDark, '#ffffff');
                parts += petalFlower(232 * s, 92 * s, 20 * s, 5, c.flowerLight, c.frame);
                parts += petalFlower(96 * s, 236 * s, 18 * s, 5, c.flowerLight, c.frame);
                return group('translate(' + n(x) + ' ' + n(y) + ')' + (flip ? ' scale(-1 -1)' : ''), parts);
            }
            var m = 54 * s;
            var defs = linear('bg', [c.bg1, c.bg2], 1, 1);
            var body = el('rect', { width: W, height: H, fill: 'url(#bg)' }) +
                rectFrame(m, m, W - m * 2, H - m * 2, c.frame, n(1.6 * s), 0) +
                rectFrame(m + 9 * s, m + 9 * s, W - (m + 9 * s) * 2, H - (m + 9 * s) * 2, c.frame, n(0.8 * s), 0) +
                cluster(34 * s, 34 * s, false) +
                cluster(W - 34 * s, H - 34 * s, true) +
                petalFlower(W - 120 * s, 120 * s, 14 * s, 5, c.flowerLight, c.frame) +
                petalFlower(120 * s, H - 120 * s, 14 * s, 5, c.flowerLight, c.frame);
            return { svg: wrapSvg(W, H, defs, body), safe: safeRect(150 * s, 270 * s, W - 300 * s, H - 540 * s) };
        }
    });

    // 5. Royal Maroon — rich maroon with an ornate gold Mughal frame.
    define({
        id: 'royal-maroon',
        name: 'Royal Maroon',
        nameUr: 'شاہی عنابی',
        blurb: 'Maroon and gold, a regal Baraat',
        bestFor: ['baraat', 'nikah', 'walima'],
        style: 'traditional',
        lettering: 'calligraphic',
        divider: 'flourish',
        eventColorways: { baraat: 'maroon', nikah: 'emerald', walima: 'royal' },
        colorways: [
            { id: 'maroon', name: 'Maroon', swatch: ['#5e0f1f', '#e0bd6e', '#f8e6c4'], c: { bg1: '#6e1325', bg2: '#3b0712', frame: '#e0bd6e', frameDark: '#a57d33', ink: '#f8e8cc', accent: '#f4d48a', muted: '#d8b896' } },
            { id: 'emerald', name: 'Emerald', swatch: ['#0d4434', '#e0bd6e', '#f3ead2'], c: { bg1: '#11503e', bg2: '#06291f', frame: '#e0bd6e', frameDark: '#a57d33', ink: '#f5ead2', accent: '#f4d48a', muted: '#c8bf97' } },
            { id: 'royal', name: 'Royal blue', swatch: ['#16285a', '#e0bd6e', '#eef0f7'], c: { bg1: '#1d326b', bg2: '#0c1736', frame: '#e0bd6e', frameDark: '#a57d33', ink: '#f2efe6', accent: '#f4d48a', muted: '#c4c6d4' } }
        ],
        art: function (W, H, c) {
            var s = W / 1080;
            var m = 56 * s;
            var bandW = 26 * s;
            var paisleyTile = 70 * s;
            var buta = 'M0 ' + n(14 * s) + ' C' + n(-14 * s) + ' ' + n(6 * s) + ' ' + n(-12 * s) + ' ' + n(-14 * s) + ' ' + n(2 * s) + ' ' + n(-16 * s) + ' C' + n(14 * s) + ' ' + n(-16 * s) + ' ' + n(14 * s) + ' ' + n(2 * s) + ' ' + n(4 * s) + ' ' + n(6 * s) + ' C' + n(10 * s) + ' ' + n(-2 * s) + ' ' + n(2 * s) + ' ' + n(-6 * s) + ' ' + n(0) + ' ' + n(0) + ' C' + n(-4 * s) + ' ' + n(6 * s) + ' ' + n(4 * s) + ' ' + n(12 * s) + ' 0 ' + n(14 * s) + 'Z';
            var defs = linear('bg', [c.bg1, c.bg2], 0.3, 1) +
                radial('glow', ['#ffffff', '#ffffff'], [0.1, 0]) +
                linear('gold', [c.frame, c.frameDark, c.frame], 1, 1) +
                el('pattern', { id: 'buta', width: n(paisleyTile), height: n(paisleyTile), patternUnits: 'userSpaceOnUse' },
                    group('translate(' + n(paisleyTile / 2) + ' ' + n(paisleyTile / 2) + ')', el('path', { d: buta, fill: c.frame })) +
                    el('circle', { cx: 0, cy: 0, r: n(2.4 * s), fill: c.frame }) + el('circle', { cx: n(paisleyTile), cy: n(paisleyTile), r: n(2.4 * s), fill: c.frame }));
            // Ornate band: outer thick gold frame, dotted inner rule, scalloped inner edge.
            var scallops = '';
            var innerX = m + bandW + 18 * s;
            var innerY = m + bandW + 18 * s;
            var innerW = W - innerX * 2;
            var innerH = H - innerY * 2;
            var count = Math.round(innerW / (40 * s));
            var step = innerW / count;
            for (var i = 0; i < count; i += 1) {
                scallops += el('path', { d: 'M' + n(innerX + i * step) + ' ' + n(innerY) + ' q' + n(step / 2) + ' ' + n(step * 0.5) + ' ' + n(step) + ' 0', fill: 'none', stroke: c.frame, 'stroke-width': n(1.4 * s) });
                scallops += el('path', { d: 'M' + n(innerX + i * step) + ' ' + n(innerY + innerH) + ' q' + n(step / 2) + ' ' + n(-step * 0.5) + ' ' + n(step) + ' 0', fill: 'none', stroke: c.frame, 'stroke-width': n(1.4 * s) });
            }
            var archX = 170 * s;
            var archY = 200 * s;
            var archW = W - archX * 2;
            var archH = H - archY - 170 * s;
            var body = el('rect', { width: W, height: H, fill: 'url(#bg)' }) +
                el('rect', { width: W, height: H, fill: 'url(#buta)', opacity: 0.1 }) +
                el('ellipse', { cx: W / 2, cy: H * 0.45, rx: W * 0.5, ry: H * 0.4, fill: 'url(#glow)' }) +
                rectFrame(m, m, W - m * 2, H - m * 2, 'url(#gold)', n(bandW)) +
                rectFrame(m - bandW / 2 + 5 * s, m - bandW / 2 + 5 * s, W - (m - bandW / 2 + 5 * s) * 2, H - (m - bandW / 2 + 5 * s) * 2, c.bg2, n(1.4 * s)) +
                rectFrame(m + bandW / 2 - 5 * s, m + bandW / 2 - 5 * s, W - (m + bandW / 2 - 5 * s) * 2, H - (m + bandW / 2 - 5 * s) * 2, c.bg2, n(1.4 * s), 0, { 'stroke-dasharray': n(1 * s) + ' ' + n(6 * s), 'stroke-linecap': 'round' }) +
                scallops +
                fourCorners(W, H, innerX + 6 * s, 120 * s, function (size) { return cornerScroll(size, c.frame, n(2.2 * s)); }) +
                el('path', { d: archPath(archX, archY, archW, archH, 0.32), fill: 'none', stroke: c.frame, 'stroke-width': n(2.2 * s) }) +
                el('path', { d: archPath(archX + 14 * s, archY + 20 * s, archW - 28 * s, archH - 20 * s, 0.32), fill: 'none', stroke: c.frame, 'stroke-width': n(0.9 * s), opacity: 0.7 }) +
                finial(W / 2, archY - 6 * s, 16 * s, c.frame) +
                star8(W / 2, H - 128 * s, 16 * s, c.frame) + star8(W / 2, H - 128 * s, 8 * s, c.bg2);
            return { svg: wrapSvg(W, H, defs, body), safe: safeRect(archX + 50 * s, archY + archH * 0.19, archW - 100 * s, archH * 0.78) };
        }
    });

    // 6. Mehndi Marigold — genda garlands, diyas and a bright joyful field.
    define({
        id: 'mehndi-marigold',
        name: 'Marigold Mehndi',
        nameUr: 'گیندا مہندی',
        blurb: 'Marigold garlands and little diyas',
        bestFor: ['mehndi', 'mayun', 'dholki'],
        style: 'traditional',
        lettering: 'calligraphic',
        divider: 'dots',
        eventColorways: { mehndi: 'sunshine', mayun: 'saffron', dholki: 'leaf' },
        colorways: [
            { id: 'sunshine', name: 'Sunshine', swatch: ['#ffe27a', '#f08a12', '#3f7d3a'], c: { bg1: '#ffe680', bg2: '#ffc53d', panel: '#fff8e1', m1: '#f07d0c', m2: '#f9a51f', m3: '#ffd34d', leaf: '#3f7d3a', thread: '#8a4f12', ink: '#4a2f12', accent: '#b2440b', muted: '#8b6a2f', diya: '#c0622b' } },
            { id: 'saffron', name: 'Saffron', swatch: ['#ffbf5e', '#d9480f', '#2e6b3a'], c: { bg1: '#ffc76e', bg2: '#f59a2b', panel: '#fff3df', m1: '#d9480f', m2: '#f27a17', m3: '#ffb53b', leaf: '#2e6b3a', thread: '#7a3a0e', ink: '#4a2412', accent: '#a8350a', muted: '#8d5a33', diya: '#a94a1e' } },
            { id: 'leaf', name: 'Leaf green', swatch: ['#c7df7c', '#f2a516', '#2f6a35'], c: { bg1: '#cfe48a', bg2: '#8fbf4f', panel: '#fbfbe8', m1: '#f08c0c', m2: '#f7b21f', m3: '#ffe066', leaf: '#2f6a35', thread: '#5a4a12', ink: '#2f3d16', accent: '#a5520a', muted: '#6e7537', diya: '#b55a20' } }
        ],
        art: function (W, H, c) {
            var s = W / 1080;
            var garlands = '';
            // Hanging genda ladis along the top.
            var strands = 9;
            for (var i = 0; i < strands; i += 1) {
                var x = (i + 0.5) * (W / strands);
                var len = (i % 2 === 0 ? 210 : 150) * s;
                garlands += el('line', { x1: n(x), y1: 0, x2: n(x), y2: n(len), stroke: c.thread, 'stroke-width': n(1.4 * s) });
                for (var k = 0; k * 34 * s < len; k += 1) {
                    garlands += useMotif(k % 2 ? 'mgB' : 'mgA', x, 18 * s + k * 34 * s, 17 / 20);
                }
                garlands += leaf(x, len + 4 * s, 24 * s, 70, c.leaf) + leaf(x, len + 4 * s, 24 * s, 110, c.leaf);
            }
            // Swag garland across the top.
            stringOfPoints(0, 30 * s, W, 30 * s, 70 * s, 22).forEach(function (p, idx) {
                garlands += useMotif(idx % 2 ? 'mgA' : 'mgB', p.x, p.y, 22 / 20);
            });
            var panelX = 110 * s;
            var panelY = 270 * s;
            var panelW = W - panelX * 2;
            var panelH = H - panelY - 190 * s;
            var diyas = '';
            [W * 0.2, W * 0.35, W * 0.65, W * 0.8].forEach(function (x, idx) {
                diyas += diya(x, H - 88 * s, (idx % 3 === 0 ? 30 : 24) * s, c.diya, c.m3, '#ffcf3f');
            });
            var mirror = el('pattern', { id: 'gota', width: n(46 * s), height: n(46 * s), patternUnits: 'userSpaceOnUse' },
                el('circle', { cx: n(23 * s), cy: n(23 * s), r: n(4 * s), fill: '#ffffff', opacity: 0.55 }) +
                el('circle', { cx: n(23 * s), cy: n(23 * s), r: n(7 * s), fill: 'none', stroke: c.m1, 'stroke-width': n(1.2 * s), opacity: 0.5 }));
            var defs = linear('bg', [c.bg1, c.bg2], 0, 1) + mirror + radial('diyaGlow', ['#fff2a8', '#ffcf3f'], [0.75, 0]) +
                motifDef('mgA', marigold(0, 0, 20 * s, c.m1, c.m2, c.m3)) + motifDef('mgB', marigold(0, 0, 20 * s, c.m2, c.m2, c.m3));
            var body = el('rect', { width: W, height: H, fill: 'url(#bg)' }) +
                el('rect', { width: W, height: H, fill: 'url(#gota)' }) +
                el('path', { d: archPath(panelX, panelY, panelW, panelH, 0.26, true), fill: c.panel }) +
                el('path', { d: archPath(panelX + 16 * s, panelY + 22 * s, panelW - 32 * s, panelH - 38 * s, 0.26, true), fill: 'none', stroke: c.m1, 'stroke-width': n(2 * s), 'stroke-dasharray': n(10 * s) + ' ' + n(8 * s) }) +
                marigold(W / 2, panelY + 2 * s, 30 * s, c.m1, c.m2, c.m3) +
                garlands + diyas;
            return { svg: wrapSvg(W, H, defs, body), safe: safeRect(panelX + 60 * s, panelY + panelH * 0.2, panelW - 120 * s, panelH * 0.74) };
        }
    });

    // 7. Mela (folk / truck-art inspired) — vibrant bands that frame a calm centre.
    define({
        id: 'mela-folk',
        name: 'Mela Folk',
        nameUr: 'میلہ',
        blurb: 'Truck-art colour, calm centre',
        bestFor: ['mehndi', 'dholki', 'mayun'],
        style: 'modern',
        lettering: 'calligraphic',
        divider: 'dots',
        eventColorways: { mehndi: 'classic', dholki: 'pink', mayun: 'classic' },
        colorways: [
            { id: 'classic', name: 'Bazaar', swatch: ['#e3263b', '#1f8a70', '#ffcc29'], c: { band: '#1f8a70', band2: '#e3263b', band3: '#ffcc29', band4: '#2b3a8f', petal: '#ff6fa5', panel: '#fff7e6', ink: '#2b2140', accent: '#c8102e', muted: '#6c5a73' } },
            { id: 'pink', name: 'Hot pink', swatch: ['#e6007e', '#12a3a0', '#ffd23f'], c: { band: '#12a3a0', band2: '#e6007e', band3: '#ffd23f', band4: '#5a2a82', petal: '#ff9f1c', panel: '#fff6f8', ink: '#3a1a3f', accent: '#c4006c', muted: '#7a5a76' } },
            { id: 'indigo', name: 'Indigo', swatch: ['#28327a', '#f25c54', '#f7b32b'], c: { band: '#28327a', band2: '#f25c54', band3: '#f7b32b', band4: '#2a9d8f', petal: '#f7b32b', panel: '#fbf7ef', ink: '#1f2552', accent: '#c7362f', muted: '#5f6283' } }
        ],
        art: function (W, H, c) {
            var s = W / 1080;
            var b = 34 * s;
            var bands = '';
            // Concentric colour bands with patterns, like a painted truck panel.
            bands += el('rect', { width: W, height: H, fill: c.band4 });
            bands += el('rect', { x: n(b), y: n(b), width: n(W - b * 2), height: n(H - b * 2), fill: c.band });
            bands += el('rect', { x: n(b * 2), y: n(b * 2), width: n(W - b * 4), height: n(H - b * 4), fill: c.band2 });
            bands += el('rect', { x: n(b * 2), y: n(b * 2), width: n(W - b * 4), height: n(H - b * 4), fill: 'url(#chev)' });
            bands += el('rect', { x: n(b * 3.4), y: n(b * 3.4), width: n(W - b * 6.8), height: n(H - b * 6.8), fill: c.band3 });
            var inset = b * 4;
            var count = Math.round((W - inset * 2) / (38 * s));
            var step = (W - inset * 2) / count;
            var scallop = '';
            for (var i = 0; i < count; i += 1) {
                scallop += el('circle', { cx: n(inset + step * (i + 0.5)), cy: n(inset), r: n(step / 2), fill: c.band4 });
                scallop += el('circle', { cx: n(inset + step * (i + 0.5)), cy: n(H - inset), r: n(step / 2), fill: c.band4 });
            }
            var countV = Math.round((H - inset * 2) / (38 * s));
            var stepV = (H - inset * 2) / countV;
            for (var j = 0; j < countV; j += 1) {
                scallop += el('circle', { cx: n(inset), cy: n(inset + stepV * (j + 0.5)), r: n(stepV / 2), fill: c.band4 });
                scallop += el('circle', { cx: n(W - inset), cy: n(inset + stepV * (j + 0.5)), r: n(stepV / 2), fill: c.band4 });
            }
            var panelInset = inset + 30 * s;
            var flowers = '';
            [[panelInset + 40 * s, panelInset + 40 * s], [W - panelInset - 40 * s, panelInset + 40 * s], [panelInset + 40 * s, H - panelInset - 40 * s], [W - panelInset - 40 * s, H - panelInset - 40 * s]].forEach(function (p) {
                flowers += petalFlower(p[0], p[1], 46 * s, 8, c.petal, c.band3, c.band2) + petalFlower(p[0], p[1], 22 * s, 6, c.band3, c.band2);
            });
            [W / 2].forEach(function (x) {
                flowers += petalFlower(x, panelInset + 12 * s, 30 * s, 8, c.band2, c.band3) + leaf(x - 30 * s, panelInset + 14 * s, 50 * s, 180, c.band) + leaf(x + 30 * s, panelInset + 14 * s, 50 * s, 0, c.band);
                flowers += petalFlower(x, H - panelInset - 12 * s, 30 * s, 8, c.band2, c.band3) + leaf(x - 30 * s, H - panelInset - 14 * s, 50 * s, 180, c.band) + leaf(x + 30 * s, H - panelInset - 14 * s, 50 * s, 0, c.band);
            });
            var defs = el('pattern', { id: 'chev', width: n(28 * s), height: n(28 * s), patternUnits: 'userSpaceOnUse' },
                el('path', { d: 'M0 ' + n(20 * s) + ' L' + n(14 * s) + ' ' + n(6 * s) + ' L' + n(28 * s) + ' ' + n(20 * s), fill: 'none', stroke: c.band3, 'stroke-width': n(4 * s) }));
            var body = bands + scallop +
                el('rect', { x: n(panelInset), y: n(panelInset), width: n(W - panelInset * 2), height: n(H - panelInset * 2), rx: n(24 * s), fill: c.panel }) +
                el('rect', { x: n(panelInset + 10 * s), y: n(panelInset + 10 * s), width: n(W - (panelInset + 10 * s) * 2), height: n(H - (panelInset + 10 * s) * 2), rx: n(18 * s), fill: 'none', stroke: c.band, 'stroke-width': n(2.4 * s), 'stroke-dasharray': n(2 * s) + ' ' + n(8 * s), 'stroke-linecap': 'round' }) +
                flowers;
            return { svg: wrapSvg(W, H, defs, body), safe: safeRect(panelInset + 60 * s, panelInset + 90 * s, W - (panelInset + 60 * s) * 2, H - (panelInset + 90 * s) * 2) };
        }
    });

    // 8. Ajrak — Sindhi block-print inspired border around a cream panel.
    define({
        id: 'ajrak',
        name: 'Ajrak',
        nameUr: 'اجرک',
        blurb: 'Sindhi block-print border',
        bestFor: ['mehndi', 'nikah', 'baraat', 'dholki'],
        style: 'traditional',
        lettering: 'calligraphic',
        divider: 'star',
        eventColorways: { mehndi: 'crimson', nikah: 'indigo', baraat: 'crimson' },
        colorways: [
            { id: 'crimson', name: 'Crimson', swatch: ['#9c1b23', '#1d2552', '#f5ead6'], c: { ground: '#9c1b23', ground2: '#1d2552', motif: '#f5ead6', dot: '#141414', panel: '#f8efdc', ink: '#2a1f2a', accent: '#8c1520', muted: '#6c5652' } },
            { id: 'indigo', name: 'Indigo', swatch: ['#1d2a5c', '#a3202a', '#f3ead8'], c: { ground: '#1d2a5c', ground2: '#a3202a', motif: '#f3ead8', dot: '#0d0d16', panel: '#f6efe0', ink: '#1d2140', accent: '#1d2a5c', muted: '#5c5f74' } },
            { id: 'madder', name: 'Madder', swatch: ['#6d1a2b', '#c08a2b', '#f6ead2'], c: { ground: '#6d1a2b', ground2: '#2e2a26', motif: '#efd7a6', dot: '#1a0d10', panel: '#f8eedc', ink: '#2e1d20', accent: '#6d1a2b', muted: '#6b5a52' } }
        ],
        art: function (W, H, c) {
            var s = W / 1080;
            var t = 90 * s;
            var tile = el('rect', { width: n(t), height: n(t), fill: c.ground }) +
                star8(t / 2, t / 2, t * 0.34, c.motif) +
                star8(t / 2, t / 2, t * 0.2, c.ground2) +
                el('circle', { cx: n(t / 2), cy: n(t / 2), r: n(t * 0.07), fill: c.motif });
            [[0, 0], [t, 0], [0, t], [t, t]].forEach(function (p) {
                tile += el('circle', { cx: n(p[0]), cy: n(p[1]), r: n(t * 0.12), fill: c.ground2 }) + el('circle', { cx: n(p[0]), cy: n(p[1]), r: n(t * 0.05), fill: c.motif });
            });
            [[t / 2, 0], [0, t / 2], [t, t / 2], [t / 2, t]].forEach(function (p) {
                tile += el('circle', { cx: n(p[0]), cy: n(p[1]), r: n(t * 0.035), fill: c.dot });
            });
            var stripe = 18 * s;
            var defs = el('pattern', { id: 'ajrak', width: n(t), height: n(t), patternUnits: 'userSpaceOnUse' }, tile) +
                el('pattern', { id: 'teeth', width: n(stripe), height: n(stripe), patternUnits: 'userSpaceOnUse' },
                    el('rect', { width: n(stripe), height: n(stripe), fill: c.ground2 }) + el('path', { d: 'M0 ' + n(stripe) + ' L' + n(stripe / 2) + ' 0 L' + n(stripe) + ' ' + n(stripe) + 'Z', fill: c.motif }));
            var border = 150 * s;
            var px = border;
            var pw = W - border * 2;
            var ph = H - border * 2;
            var body = el('rect', { width: W, height: H, fill: 'url(#ajrak)' }) +
                el('rect', { x: n(px - 26 * s), y: n(px - 26 * s), width: n(pw + 52 * s), height: n(ph + 52 * s), fill: 'url(#teeth)' }) +
                el('rect', { x: n(px - 10 * s), y: n(px - 10 * s), width: n(pw + 20 * s), height: n(ph + 20 * s), fill: c.ground2 }) +
                el('rect', { x: n(px), y: n(px), width: n(pw), height: n(ph), fill: c.panel }) +
                rectFrame(px + 16 * s, px + 16 * s, pw - 32 * s, ph - 32 * s, c.ground, n(1.6 * s)) +
                star8(W / 2, px + 52 * s, 20 * s, c.ground) + star8(W / 2, px + 52 * s, 10 * s, c.ground2) +
                star8(W / 2, H - px - 52 * s, 20 * s, c.ground) + star8(W / 2, H - px - 52 * s, 10 * s, c.ground2);
            return { svg: wrapSvg(W, H, defs, body), safe: safeRect(px + 48 * s, px + 100 * s, pw - 96 * s, ph - 200 * s) };
        }
    });

    // 9. Phulkari — Punjabi embroidery geometry as a modern border.
    define({
        id: 'phulkari',
        name: 'Phulkari',
        nameUr: 'پھلکاری',
        blurb: 'Punjabi embroidery diamonds',
        bestFor: ['mehndi', 'dholki', 'mayun', 'baraat'],
        style: 'modern',
        lettering: 'calligraphic',
        divider: 'diamond',
        eventColorways: { mehndi: 'sunset', dholki: 'magenta', baraat: 'ruby' },
        colorways: [
            { id: 'sunset', name: 'Sunset', swatch: ['#c2185b', '#ff8f00', '#ffd54f'], c: { ground: '#7a1037', a: '#ff8f00', b: '#ffd54f', d: '#ff4f7b', panel: '#fff6ea', ink: '#3d1424', accent: '#b0124e', muted: '#7d5a63' } },
            { id: 'magenta', name: 'Magenta', swatch: ['#8e1162', '#f9a825', '#4dd0e1'], c: { ground: '#5a0c40', a: '#f9a825', b: '#ffe082', d: '#4dd0e1', panel: '#fff7f6', ink: '#3a1030', accent: '#a0136e', muted: '#7b5a70' } },
            { id: 'ruby', name: 'Ruby', swatch: ['#7f0e17', '#f2b134', '#f6e3b4'], c: { ground: '#5e0a12', a: '#f2b134', b: '#f6e3b4', d: '#e85d3f', panel: '#fff7ec', ink: '#3b1214', accent: '#94141f', muted: '#7d5c55' } }
        ],
        art: function (W, H, c) {
            var s = W / 1080;
            var t = 72 * s;
            function diamondMotif(cx, cy, r) {
                var out = '';
                [[1, c.a], [0.72, c.b], [0.46, c.d], [0.22, c.b]].forEach(function (layer) {
                    var rr = r * layer[0];
                    out += el('path', { d: 'M' + n(cx) + ' ' + n(cy - rr) + ' L' + n(cx + rr) + ' ' + n(cy) + ' L' + n(cx) + ' ' + n(cy + rr) + ' L' + n(cx - rr) + ' ' + n(cy) + 'Z', fill: layer[1] });
                });
                // Darning-stitch texture.
                for (var k = -3; k <= 3; k += 1) {
                    out += el('line', { x1: n(cx - r * 0.9 + Math.abs(k) * r * 0.14), y1: n(cy + k * r * 0.13), x2: n(cx + r * 0.9 - Math.abs(k) * r * 0.14), y2: n(cy + k * r * 0.13), stroke: c.ground, 'stroke-width': n(0.8 * s), opacity: 0.25 });
                }
                return out;
            }
            var defs = el('pattern', { id: 'phul', width: n(t), height: n(t), patternUnits: 'userSpaceOnUse' },
                el('rect', { width: n(t), height: n(t), fill: c.ground }) + diamondMotif(t / 2, t / 2, t * 0.36) +
                [[0, 0], [t, 0], [0, t], [t, t]].map(function (p) { return el('circle', { cx: n(p[0]), cy: n(p[1]), r: n(t * 0.08), fill: c.a }); }).join(''));
            var border = 112 * s;
            var pw = W - border * 2;
            var ph = H - border * 2;
            var body = el('rect', { width: W, height: H, fill: 'url(#phul)' }) +
                el('rect', { x: n(border - 14 * s), y: n(border - 14 * s), width: n(pw + 28 * s), height: n(ph + 28 * s), rx: n(10 * s), fill: c.a }) +
                el('rect', { x: n(border - 6 * s), y: n(border - 6 * s), width: n(pw + 12 * s), height: n(ph + 12 * s), rx: n(8 * s), fill: c.ground }) +
                el('rect', { x: n(border), y: n(border), width: n(pw), height: n(ph), rx: n(6 * s), fill: c.panel }) +
                diamondMotif(W / 2, border + 64 * s, 46 * s) +
                diamondMotif(W / 2 - 90 * s, border + 64 * s, 22 * s) + diamondMotif(W / 2 + 90 * s, border + 64 * s, 22 * s) +
                diamondMotif(W / 2, H - border - 64 * s, 46 * s) +
                diamondMotif(W / 2 - 90 * s, H - border - 64 * s, 22 * s) + diamondMotif(W / 2 + 90 * s, H - border - 64 * s, 22 * s);
            return { svg: wrapSvg(W, H, defs, body), safe: safeRect(border + 50 * s, border + 140 * s, pw - 100 * s, ph - 280 * s) };
        }
    });

    // 10. Pastel Walima — sage and blush florals, champagne frame.
    define({
        id: 'pastel-walima',
        name: 'Pastel Walima',
        nameUr: 'نرم ولیمہ',
        blurb: 'Sage, blush and champagne',
        bestFor: ['walima', 'engagement', 'nikah', 'rukhsati'],
        style: 'modern',
        lettering: 'classic',
        divider: 'line',
        eventColorways: { walima: 'sage', engagement: 'blush', nikah: 'sage', rukhsati: 'powder' },
        colorways: [
            { id: 'sage', name: 'Sage', swatch: ['#f4f6ef', '#a9bba1', '#e8c1bb'], c: { bg1: '#f8f9f3', bg2: '#ebefe4', frame: '#c6b089', flower: '#ebc2bc', flowerDark: '#c98f8a', leaf: '#a9bba1', leafDark: '#7f977a', ink: '#4c5546', accent: '#5f7259', muted: '#8a927f' } },
            { id: 'blush', name: 'Blush', swatch: ['#fcf3f1', '#e9b8b5', '#b7c4b0'], c: { bg1: '#fdf6f4', bg2: '#f7e6e2', frame: '#d1a98c', flower: '#e9b0ae', flowerDark: '#c07c7e', leaf: '#b7c4b0', leafDark: '#8ea288', ink: '#5a4545', accent: '#9a5a62', muted: '#a08a86' } },
            { id: 'powder', name: 'Powder blue', swatch: ['#f2f5f9', '#b8c8dc', '#e7d3b8'], c: { bg1: '#f6f8fb', bg2: '#e6edf5', frame: '#c9b28c', flower: '#f1d9d6', flowerDark: '#c69a9a', leaf: '#b8c8dc', leafDark: '#8aa0bd', ink: '#3f4b5c', accent: '#4e6382', muted: '#8590a0' } }
        ],
        art: function (W, H, c) {
            var s = W / 1080;
            function spray(x, y, rotation, scale) {
                var k = scale * s;
                var parts = sprig(0, 0, 200 * k, -20, c.leafDark, c.leaf, null) +
                    sprig(0, 0, 160 * k, 30, c.leafDark, c.leaf, null) +
                    sprig(0, 0, 130 * k, -70, c.leafDark, c.leaf, null) +
                    petalFlower(18 * k, -6 * k, 34 * k, 6, c.flower, c.flowerDark, c.flowerDark) +
                    petalFlower(70 * k, 40 * k, 22 * k, 5, c.flower, c.flowerDark) +
                    petalFlower(60 * k, -50 * k, 18 * k, 5, c.flower, c.flowerDark) +
                    el('circle', { cx: n(150 * k), cy: n(-40 * k), r: n(6 * k), fill: c.flowerDark }) +
                    el('circle', { cx: n(120 * k), cy: n(70 * k), r: n(5 * k), fill: c.flowerDark });
                return group('translate(' + n(x) + ' ' + n(y) + ') rotate(' + rotation + ')', parts);
            }
            var m = 70 * s;
            var defs = linear('bg', [c.bg1, c.bg2], 0.2, 1);
            var body = el('rect', { width: W, height: H, fill: 'url(#bg)' }) +
                el('rect', { x: n(m), y: n(m), width: n(W - m * 2), height: n(H - m * 2), rx: n(W / 2 - m), ry: n(220 * s), fill: '#ffffff', opacity: 0.55 }) +
                el('rect', { x: n(m), y: n(m), width: n(W - m * 2), height: n(H - m * 2), rx: n(W / 2 - m), ry: n(220 * s), fill: 'none', stroke: c.frame, 'stroke-width': n(1.6 * s) }) +
                el('rect', { x: n(m + 14 * s), y: n(m + 14 * s), width: n(W - (m + 14 * s) * 2), height: n(H - (m + 14 * s) * 2), rx: n(W / 2 - m - 14 * s), ry: n(206 * s), fill: 'none', stroke: c.frame, 'stroke-width': n(0.8 * s) }) +
                spray(m + 30 * s, H - m - 40 * s, -30, 1.7) +
                spray(W - m - 30 * s, H - m - 40 * s, -150, 1.35) +
                spray(W / 2, m + 18 * s, 90, 0.95);
            return { svg: wrapSvg(W, H, defs, body), safe: safeRect(m + 90 * s, m + 220 * s, W - (m + 90 * s) * 2, H - (m + 220 * s) - (m + 220 * s)) };
        }
    });

    // 11. Midnight — night sky, stars and hanging lanterns.
    define({
        id: 'midnight',
        name: 'Midnight Lanterns',
        nameUr: 'چاند رات',
        blurb: 'Night sky, stars and lanterns',
        bestFor: ['walima', 'baraat', 'nikah', 'dholki'],
        style: 'modern',
        lettering: 'classic',
        divider: 'star',
        eventColorways: { walima: 'navy', baraat: 'plum', nikah: 'navy', dholki: 'plum' },
        colorways: [
            { id: 'navy', name: 'Navy & gold', swatch: ['#0e1a3b', '#e2c27a', '#f6efe0'], c: { bg1: '#15244f', bg2: '#070d22', frame: '#e2c27a', star: '#f7e6b5', lantern: '#f2b84b', ink: '#f4eee2', accent: '#f1d593', muted: '#b8bdd0' } },
            { id: 'plum', name: 'Plum', swatch: ['#2b1238', '#e7c27e', '#f6ece4'], c: { bg1: '#3b1a4c', bg2: '#13071b', frame: '#e7c27e', star: '#f8e7c2', lantern: '#f29f4b', ink: '#f6ece4', accent: '#f3d494', muted: '#c9b5c9' } },
            { id: 'teal', name: 'Deep teal', swatch: ['#0b2f35', '#e3c47f', '#eef4f1'], c: { bg1: '#0f4148', bg2: '#05181c', frame: '#e3c47f', star: '#eef7e8', lantern: '#f2c14e', ink: '#eef4f1', accent: '#f1d593', muted: '#b4c8c4' } }
        ],
        art: function (W, H, c) {
            var s = W / 1080;
            var rand = seeded('midnight' + W + H);
            var stars = '';
            for (var i = 0; i < 90; i += 1) {
                var x = rand() * W;
                var y = rand() * H * 0.9;
                stars += el('circle', { cx: n(x), cy: n(y), r: n((rand() * 1.8 + 0.6) * s), fill: c.star, opacity: n(0.35 + rand() * 0.6) });
            }
            for (var j = 0; j < 9; j += 1) {
                stars += sparkle(rand() * W, rand() * H * 0.85, (7 + rand() * 7) * s, c.star);
            }
            var lanterns = '';
            [[W * 0.16, 170, 34], [W * 0.3, 90, 26], [W * 0.7, 120, 28], [W * 0.84, 200, 36], [W * 0.5, 40, 22]].forEach(function (l) {
                lanterns += lantern(l[0], 0, l[1] * s, l[2] * s, c.lantern, c.frame, 0.9);
            });
            var m = 44 * s;
            var crescentX = W - 170 * s;
            var crescentY = H - 190 * s;
            var defs = linear('bg', [c.bg1, c.bg2], 0, 1) + radial('lanternGlow', [c.lantern, c.lantern], [0.55, 0]) +
                el('mask', { id: 'moon' }, el('rect', { width: W, height: H, fill: '#fff' }) + el('circle', { cx: n(crescentX + 18 * s), cy: n(crescentY - 10 * s), r: n(40 * s), fill: '#000' }));
            var body = el('rect', { width: W, height: H, fill: 'url(#bg)' }) + stars +
                el('circle', { cx: n(crescentX), cy: n(crescentY), r: n(46 * s), fill: c.star, mask: 'url(#moon)', opacity: 0.9 }) +
                rectFrame(m, m, W - m * 2, H - m * 2, c.frame, n(1.6 * s), 14 * s) +
                rectFrame(m + 10 * s, m + 10 * s, W - (m + 10 * s) * 2, H - (m + 10 * s) * 2, c.frame, n(0.8 * s), 10 * s) +
                lanterns +
                el('path', { d: archPath(150 * s, 330 * s, W - 300 * s, H - 330 * s - 130 * s, 0.24), fill: 'none', stroke: c.frame, 'stroke-width': n(1.2 * s), opacity: 0.55 });
            return { svg: wrapSvg(W, H, defs, body), safe: safeRect(190 * s, 330 * s + (H - 460 * s) * 0.16, W - 380 * s, (H - 460 * s) * 0.8) };
        }
    });

    // 12. Minimal Modern — negative space, a single botanical accent.
    define({
        id: 'minimal-modern',
        name: 'Minimal Modern',
        nameUr: 'سادہ جدید',
        blurb: 'Clean type, lots of breathing room',
        bestFor: ['walima', 'engagement', 'nikah', 'mehndi'],
        style: 'modern',
        lettering: 'modern',
        divider: 'line',
        eventColorways: { walima: 'sand', engagement: 'sand', nikah: 'olive', mehndi: 'terracotta' },
        colorways: [
            { id: 'sand', name: 'Sand', swatch: ['#f6f1e9', '#2c2a28', '#b59a7a'], c: { bg1: '#f7f2ea', bg2: '#efe7db', line: '#b59a7a', leaf: '#8c9a7a', ink: '#2c2a28', accent: '#2c2a28', muted: '#8b7f72' } },
            { id: 'olive', name: 'Olive', swatch: ['#f1f2ea', '#3d4a32', '#a3ab86'], c: { bg1: '#f3f4ed', bg2: '#e6e9dc', line: '#a3ab86', leaf: '#6f7d58', ink: '#2f3826', accent: '#3d4a32', muted: '#7d8670' } },
            { id: 'terracotta', name: 'Terracotta', swatch: ['#fbf0e6', '#b65a3b', '#e6b98f'], c: { bg1: '#fcf3ea', bg2: '#f4e2d2', line: '#d59a74', leaf: '#b65a3b', ink: '#40261c', accent: '#a34d30', muted: '#9a7462' } }
        ],
        art: function (W, H, c) {
            var s = W / 1080;
            var defs = linear('bg', [c.bg1, c.bg2], 0, 1);
            var body = el('rect', { width: W, height: H, fill: 'url(#bg)' }) +
                el('circle', { cx: n(W * 0.86), cy: n(H * 0.1), r: n(220 * s), fill: c.line, opacity: 0.12 }) +
                el('circle', { cx: n(W * 0.08), cy: n(H * 0.93), r: n(160 * s), fill: c.line, opacity: 0.1 }) +
                sprig(W - 80 * s, 90 * s, 210 * s, 152, c.leaf, c.leaf) +
                sprig(W - 110 * s, 70 * s, 150 * s, 170, c.leaf, c.leaf) +
                sprig(110 * s, H - 140 * s, 200 * s, -40, c.leaf, c.leaf) +
                rectFrame(60 * s, 60 * s, W - 120 * s, H - 120 * s, c.line, n(1 * s));
            return { svg: wrapSvg(W, H, defs, body), safe: safeRect(140 * s, 250 * s, W - 280 * s, H - 470 * s) };
        }
    });

    // 13. Peacock Garden — jewel tones and stylised feathers.
    define({
        id: 'peacock',
        name: 'Peacock Garden',
        nameUr: 'مور',
        blurb: 'Jewel-tone peacock feathers',
        bestFor: ['mehndi', 'baraat', 'walima', 'engagement'],
        style: 'traditional',
        lettering: 'calligraphic',
        divider: 'flourish',
        eventColorways: { mehndi: 'jade', baraat: 'sapphire', walima: 'sapphire', engagement: 'jade' },
        colorways: [
            { id: 'sapphire', name: 'Sapphire', swatch: ['#0c2a4d', '#1aa39a', '#e2bf6d'], c: { bg1: '#0f3560', bg2: '#081b33', eye1: '#0b3a7a', eye2: '#1aa39a', eye3: '#e2bf6d', barb: '#2ab7a9', frame: '#e2bf6d', panel: '#fbf6ea', ink: '#1d2a3a', accent: '#0f3560', muted: '#5f6f7d' } },
            { id: 'jade', name: 'Jade', swatch: ['#0d4a3f', '#3d6fd6', '#e8c66f'], c: { bg1: '#0f5a4b', bg2: '#062a23', eye1: '#1d3f9a', eye2: '#2bb39b', eye3: '#e8c66f', barb: '#5fd0b2', frame: '#e8c66f', panel: '#fbf7ea', ink: '#1f3a32', accent: '#0d4a3f', muted: '#5e7268' } },
            { id: 'amethyst', name: 'Amethyst', swatch: ['#2d1745', '#2aa3a3', '#e5c271'], c: { bg1: '#3c1f5c', bg2: '#170a26', eye1: '#2b2f86', eye2: '#2aa3a3', eye3: '#e5c271', barb: '#56c2b8', frame: '#e5c271', panel: '#fbf6ef', ink: '#2a1c3a', accent: '#4a2470', muted: '#6e6080' } }
        ],
        art: function (W, H, c) {
            var s = W / 1080;
            function feather(x, y, length, angle) {
                var parts = el('path', { d: 'M0 0 Q' + n(length * 0.5) + ' ' + n(-length * 0.04) + ' ' + n(length) + ' 0', stroke: c.frame, 'stroke-width': n(2 * s), fill: 'none' });
                for (var i = 0; i < 26; i += 1) {
                    var t = 0.12 + i / 26 * 0.7;
                    var bx = length * t;
                    var span = length * 0.12 * Math.sin(Math.PI * t);
                    parts += el('path', { d: 'M' + n(bx) + ' 0 q' + n(span * 0.6) + ' ' + n(-span * 0.6) + ' ' + n(span * 1.2) + ' ' + n(-span), stroke: c.barb, 'stroke-width': n(1.2 * s), fill: 'none', opacity: 0.85 });
                    parts += el('path', { d: 'M' + n(bx) + ' 0 q' + n(span * 0.6) + ' ' + n(span * 0.6) + ' ' + n(span * 1.2) + ' ' + n(span), stroke: c.barb, 'stroke-width': n(1.2 * s), fill: 'none', opacity: 0.85 });
                }
                var ex = length * 0.9;
                parts += el('ellipse', { cx: n(ex), cy: 0, rx: n(length * 0.13), ry: n(length * 0.09), fill: c.eye2 }) +
                    el('ellipse', { cx: n(ex + length * 0.01), cy: 0, rx: n(length * 0.09), ry: n(length * 0.065), fill: c.eye3 }) +
                    el('ellipse', { cx: n(ex + length * 0.02), cy: 0, rx: n(length * 0.06), ry: n(length * 0.045), fill: c.eye1 }) +
                    el('ellipse', { cx: n(ex + length * 0.03), cy: 0, rx: n(length * 0.026), ry: n(length * 0.022), fill: c.bg2 });
                return group('translate(' + n(x) + ' ' + n(y) + ') rotate(' + n(angle) + ')', parts);
            }
            var fan = '';
            [[-1, 1], [1, 1]].forEach(function (side) {
                var ox = side[0] < 0 ? 0 : W;
                var base = side[0] < 0 ? -90 : -90;
                for (var i = 0; i < 6; i += 1) {
                    var angle = side[0] < 0 ? -10 - i * 14 : -170 + i * 14;
                    fan += feather(ox, H - 20 * s, (300 + (i % 2) * 70) * s, angle + (base - base));
                }
            });
            var px = 130 * s;
            var py = 130 * s;
            var pw = W - px * 2;
            var ph = H - py - 300 * s;
            var defs = linear('bg', [c.bg1, c.bg2], 0.2, 1) +
                el('pattern', { id: 'scale', width: n(40 * s), height: n(30 * s), patternUnits: 'userSpaceOnUse' },
                    el('path', { d: 'M0 ' + n(30 * s) + ' Q' + n(20 * s) + ' 0 ' + n(40 * s) + ' ' + n(30 * s), fill: 'none', stroke: c.barb, 'stroke-width': n(1 * s), opacity: 0.4 }));
            var body = el('rect', { width: W, height: H, fill: 'url(#bg)' }) +
                el('rect', { width: W, height: H, fill: 'url(#scale)', opacity: 0.5 }) +
                fan +
                el('path', { d: archPath(px, py, pw, ph, 0.28, true), fill: c.panel }) +
                el('path', { d: archPath(px + 12 * s, py + 18 * s, pw - 24 * s, ph - 30 * s, 0.28, true), fill: 'none', stroke: c.frame, 'stroke-width': n(2 * s) }) +
                finial(W / 2, py - 4 * s, 16 * s, c.frame);
            return { svg: wrapSvg(W, H, defs, body), safe: safeRect(px + 50 * s, py + ph * 0.18, pw - 100 * s, ph * 0.68) };
        }
    });

    // 14. Jaali — marble lattice border around a plain arched window.
    define({
        id: 'jaali',
        name: 'Jaali Window',
        nameUr: 'جالی',
        blurb: 'Carved lattice, arched window',
        bestFor: ['nikah', 'walima', 'baraat', 'rukhsati'],
        style: 'traditional',
        lettering: 'calligraphic',
        divider: 'star',
        eventColorways: { nikah: 'marble', walima: 'marble', baraat: 'sandstone' },
        colorways: [
            { id: 'marble', name: 'White marble', swatch: ['#f3f1ec', '#c9c2b3', '#2f5b4a'], c: { stone: '#efece5', stone2: '#ddd7cb', line: '#b9b09d', window: '#fffdf8', ink: '#2f3f37', accent: '#2f5b4a', muted: '#7c7b6e', frame: '#b49866' } },
            { id: 'sandstone', name: 'Red sandstone', swatch: ['#b25a3c', '#e9c8a8', '#4a2318'], c: { stone: '#b6603f', stone2: '#8f4429', line: '#e3b48f', window: '#fbf1e4', ink: '#4a2318', accent: '#8f3b20', muted: '#8a6450', frame: '#d79c62' } },
            { id: 'jade', name: 'Jade stone', swatch: ['#5f8f80', '#d9e6df', '#20372f'], c: { stone: '#628f81', stone2: '#3f6b5e', line: '#cfe1d7', window: '#f8fbf8', ink: '#20372f', accent: '#2d5a4b', muted: '#6a7f77', frame: '#c4a868' } }
        ],
        art: function (W, H, c) {
            var s = W / 1080;
            var t = 56 * s;
            var r = t / 2;
            var lattice = el('rect', { width: n(t), height: n(t), fill: c.stone }) +
                [[0, 0], [t, 0], [0, t], [t, t], [r, r]].map(function (p) { return el('circle', { cx: n(p[0]), cy: n(p[1]), r: n(r), fill: 'none', stroke: c.line, 'stroke-width': n(3 * s) }); }).join('') +
                el('circle', { cx: n(r), cy: n(r), r: n(r * 0.18), fill: c.stone2 });
            var defs = el('pattern', { id: 'jaali', width: n(t), height: n(t), patternUnits: 'userSpaceOnUse' }, lattice) +
                linear('shade', ['#000000', '#000000'], 0, 1) +
                el('filter', { id: 'inset' }, el('feGaussianBlur', { stdDeviation: n(8 * s) }));
            var px = 150 * s;
            var py = 150 * s;
            var pw = W - px * 2;
            var ph = H - py - 120 * s;
            var body = el('rect', { width: W, height: H, fill: 'url(#jaali)' }) +
                el('rect', { width: W, height: H, fill: c.stone2, opacity: 0.12 }) +
                el('path', { d: archPath(px - 18 * s, py - 24 * s, pw + 36 * s, ph + 24 * s, 0.3, true), fill: c.stone }) +
                el('path', { d: archPath(px - 18 * s, py - 24 * s, pw + 36 * s, ph + 24 * s, 0.3, true), fill: 'none', stroke: c.frame, 'stroke-width': n(2.2 * s) }) +
                el('path', { d: archPath(px, py, pw, ph, 0.3, true), fill: '#000', opacity: 0.18, filter: 'url(#inset)' }) +
                el('path', { d: archPath(px, py, pw, ph, 0.3, true), fill: c.window }) +
                el('path', { d: archPath(px + 14 * s, py + 20 * s, pw - 28 * s, ph - 34 * s, 0.3, true), fill: 'none', stroke: c.frame, 'stroke-width': n(1 * s), opacity: 0.8 }) +
                finial(W / 2, py - 30 * s, 14 * s, c.frame) +
                el('rect', { x: 0, y: n(H - 60 * s), width: W, height: n(60 * s), fill: c.stone2 }) +
                el('rect', { x: 0, y: n(H - 60 * s), width: W, height: n(4 * s), fill: c.frame, opacity: 0.8 });
            return { svg: wrapSvg(W, H, defs, body), safe: safeRect(px + 50 * s, py + ph * 0.2, pw - 100 * s, ph * 0.74) };
        }
    });

    // 15. Watercolour Bloom — soft painted florals.
    define({
        id: 'watercolour',
        name: 'Watercolour Bloom',
        nameUr: 'آبی رنگ',
        blurb: 'Soft painted blooms',
        bestFor: ['walima', 'engagement', 'mehndi', 'nikah'],
        style: 'modern',
        lettering: 'classic',
        divider: 'line',
        eventColorways: { walima: 'peony', engagement: 'peony', mehndi: 'apricot', nikah: 'lilac' },
        colorways: [
            { id: 'peony', name: 'Peony', swatch: ['#fdf8f6', '#eba3b0', '#9cb79a'], c: { bg: '#fefaf8', w1: '#eba3b0', w2: '#f6c9c3', w3: '#d97f93', leaf: '#9cb79a', leafDark: '#6f9170', ink: '#4d3a3e', accent: '#a24a63', muted: '#9a848a' } },
            { id: 'apricot', name: 'Apricot', swatch: ['#fff9f1', '#f7b27a', '#8fb08a'], c: { bg: '#fffaf3', w1: '#f7b27a', w2: '#fcd5a8', w3: '#ec8c58', leaf: '#8fb08a', leafDark: '#5e8a5b', ink: '#4c3526', accent: '#b45a2a', muted: '#9a8070' } },
            { id: 'lilac', name: 'Lilac', swatch: ['#faf8fd', '#c3b0e0', '#9fb7a6'], c: { bg: '#fbf9fe', w1: '#c3b0e0', w2: '#e2d6f2', w3: '#a289cd', leaf: '#9fb7a6', leafDark: '#6f8f79', ink: '#3e3650', accent: '#6a4f99', muted: '#8a8298' } }
        ],
        art: function (W, H, c) {
            var s = W / 1080;
            var rand = seeded('watercolour' + W + H);
            // Layered translucent petals with a slight bleed, like wet-on-wet paint.
            function bloom(x, y, r) {
                var parts = '';
                [[1, c.w2, 0.55, 7], [0.78, c.w1, 0.5, 6], [0.5, c.w3, 0.5, 5]].forEach(function (layer, k) {
                    var count = layer[3];
                    for (var i = 0; i < count; i += 1) {
                        var angle = (360 / count) * i + k * 20 + rand() * 14;
                        parts += el('ellipse', { cx: 0, cy: n(-r * layer[0] * 0.5), rx: n(r * layer[0] * 0.36), ry: n(r * layer[0] * 0.52), fill: layer[1], opacity: layer[2], transform: 'rotate(' + n(angle) + ')' });
                    }
                });
                return group('translate(' + n(x) + ' ' + n(y) + ')', el('g', { filter: 'url(#soft)' }, parts) +
                    el('circle', { cx: 0, cy: 0, r: n(r * 0.14), fill: c.w3, opacity: 0.85 }) +
                    el('circle', { cx: n(r * 0.05), cy: n(-r * 0.04), r: n(r * 0.05), fill: '#ffffff', opacity: 0.5 }));
            }
            function wash(x, y, rx, ry, fill, op) {
                return el('ellipse', { cx: n(x), cy: n(y), rx: n(rx), ry: n(ry), fill: fill, opacity: op, filter: 'url(#wash)' });
            }
            var corner = function (x, y, flip) {
                var f = flip ? -1 : 1;
                return wash(x + f * 80 * s, y + f * 60 * s, 260 * s, 170 * s, c.w2, 0.45) +
                    leaf(x + f * 60 * s, y + f * 170 * s, 130 * s, flip ? -70 : 110, c.leaf, c.leafDark) +
                    leaf(x + f * 200 * s, y + f * 30 * s, 120 * s, flip ? 190 : 10, c.leaf, c.leafDark) +
                    leaf(x + f * 150 * s, y + f * 170 * s, 100 * s, flip ? -40 : 140, c.leafDark) +
                    leaf(x + f * 250 * s, y + f * 90 * s, 80 * s, flip ? 210 : 30, c.leaf) +
                    sprig(x + f * 120 * s, y + f * 120 * s, 200 * s, flip ? 225 : 45, c.leafDark, c.leaf) +
                    bloom(x + f * 70 * s, y + f * 60 * s, 120 * s) +
                    bloom(x + f * 210 * s, y + f * 110 * s, 80 * s) +
                    bloom(x + f * 90 * s, y + f * 210 * s, 70 * s) +
                    bloom(x + f * 250 * s, y + f * 230 * s, 34 * s);
            };
            var defs = el('filter', { id: 'soft', x: '-30%', y: '-30%', width: '160%', height: '160%' }, el('feGaussianBlur', { stdDeviation: n(2.2 * s) })) +
                el('filter', { id: 'soft2' }, el('feGaussianBlur', { stdDeviation: n(3 * s) })) +
                el('filter', { id: 'wash', x: '-40%', y: '-40%', width: '180%', height: '180%' }, el('feGaussianBlur', { stdDeviation: n(30 * s) }));
            var body = el('rect', { width: W, height: H, fill: c.bg }) +
                corner(60 * s, 60 * s, false) +
                corner(W - 60 * s, H - 60 * s, true) +
                rectFrame(70 * s, 70 * s, W - 140 * s, H - 140 * s, c.w3, n(1 * s), 0, { opacity: 0.5 });
            return { svg: wrapSvg(W, H, defs, body), safe: safeRect(160 * s, 340 * s, W - 320 * s, H - 680 * s) };
        }
    });

    // 16. Courtyard — arcade of arches with hanging flower strings.
    define({
        id: 'courtyard',
        name: 'Haveli Courtyard',
        nameUr: 'حویلی',
        blurb: 'Arcade arches, hanging garlands',
        bestFor: ['mehndi', 'nikah', 'walima', 'mayun', 'dholki'],
        style: 'traditional',
        lettering: 'calligraphic',
        divider: 'flourish',
        eventColorways: { mehndi: 'marigold', nikah: 'terracotta', walima: 'stone', mayun: 'marigold' },
        colorways: [
            { id: 'terracotta', name: 'Terracotta', swatch: ['#f7ead8', '#b5643f', '#e8b04a'], c: { bg1: '#faf0e1', bg2: '#f1dcc0', wall: '#c06c45', wall2: '#9b4f2f', flower: '#f3eee4', flower2: '#e8b04a', leaf: '#5f7d4c', ink: '#45261a', accent: '#93421f', muted: '#8a6550', frame: '#c08a4a' } },
            { id: 'marigold', name: 'Marigold', swatch: ['#fff3d6', '#c7552b', '#f2a01c'], c: { bg1: '#fff6dc', bg2: '#fde5b2', wall: '#c7552b', wall2: '#9a3a1a', flower: '#f2a01c', flower2: '#f7c948', leaf: '#4f7d3a', ink: '#4a2814', accent: '#a83f12', muted: '#8a6440', frame: '#c58a2c' } },
            { id: 'stone', name: 'Stone & jasmine', swatch: ['#f4f1ea', '#a8a291', '#f7f5ee'], c: { bg1: '#f7f5ef', bg2: '#ebe6da', wall: '#b3ab98', wall2: '#8a8370', flower: '#fbfaf5', flower2: '#e9d9a6', leaf: '#6f8a62', ink: '#3b3a32', accent: '#5a5a3f', muted: '#85806f', frame: '#b49a66' } }
        ],
        art: function (W, H, c) {
            var s = W / 1080;
            var archCount = 3;
            var archW = W / archCount;
            // Top band of three arches: the wall with arch-shaped cut-outs (drawn as wall + window fills).
            var wall = el('rect', { x: 0, y: 0, width: W, height: n(250 * s), fill: c.wall });
            var windows = '';
            for (var k = 0; k < archCount; k += 1) {
                var ax = k * archW + 30 * s;
                windows += el('path', { d: archPath(ax, 70 * s, archW - 60 * s, 200 * s, 0.55, true), fill: c.bg1 });
                windows += el('path', { d: archPath(ax, 70 * s, archW - 60 * s, 200 * s, 0.55), fill: 'none', stroke: c.frame, 'stroke-width': n(3 * s) });
                windows += el('path', { d: archPath(ax - 10 * s, 58 * s, archW - 40 * s, 212 * s, 0.55), fill: 'none', stroke: c.wall2, 'stroke-width': n(4 * s) });
            }
            var strings = '';
            var rand = seeded('courtyard' + W + H);
            for (var j = 0; j < 14; j += 1) {
                var sx = (j + 0.5) * (W / 14);
                var len = (110 + rand() * 120) * s;
                strings += el('line', { x1: n(sx), y1: n(230 * s), x2: n(sx), y2: n(230 * s + len), stroke: c.leaf, 'stroke-width': n(1.2 * s) });
                for (var b = 0; b * 27 * s < len; b += 1) {
                    strings += useMotif(b % 3 === 2 ? 'pfB' : 'pfA', sx, 242 * s + b * 27 * s, 1);
                }
                strings += useMotif('mgC', sx, 232 * s + len + 14 * s, 1);
            }
            var floor = el('rect', { x: 0, y: n(H - 130 * s), width: W, height: n(130 * s), fill: c.wall }) +
                el('rect', { x: 0, y: n(H - 130 * s), width: W, height: n(10 * s), fill: c.wall2 });
            var pots = '';
            [W * 0.12, W * 0.88].forEach(function (x) {
                pots += el('path', { d: 'M' + n(x - 40 * s) + ' ' + n(H - 130 * s) + ' Q' + n(x - 52 * s) + ' ' + n(H - 200 * s) + ' ' + n(x - 30 * s) + ' ' + n(H - 220 * s) + ' L' + n(x + 30 * s) + ' ' + n(H - 220 * s) + ' Q' + n(x + 52 * s) + ' ' + n(H - 200 * s) + ' ' + n(x + 40 * s) + ' ' + n(H - 130 * s) + 'Z', fill: c.wall2 });
                pots += sprig(x, H - 220 * s, 140 * s, -70, c.leaf, c.leaf) + sprig(x, H - 220 * s, 120 * s, -110, c.leaf, c.leaf) + sprig(x, H - 220 * s, 150 * s, -90, c.leaf, c.leaf);
                pots += petalFlower(x, H - 360 * s, 16 * s, 6, c.flower2, c.wall2) + petalFlower(x - 40 * s, H - 330 * s, 12 * s, 5, c.flower, c.flower2) + petalFlower(x + 44 * s, H - 320 * s, 12 * s, 5, c.flower, c.flower2);
            });
            var defs = linear('bg', [c.bg1, c.bg2], 0, 1) +
                motifDef('pfA', petalFlower(0, 0, 13 * s, 5, c.flower, c.flower2)) +
                motifDef('pfB', petalFlower(0, 0, 13 * s, 5, c.flower2, c.flower2)) +
                motifDef('mgC', marigold(0, 0, 17 * s, c.flower2, c.flower2, c.flower));
            var body = el('rect', { width: W, height: H, fill: 'url(#bg)' }) + wall + windows + strings + floor + pots +
                rectFrame(120 * s, 410 * s, W - 240 * s, H - 410 * s - 160 * s, c.frame, n(1.2 * s), 0, { opacity: 0.6 });
            return { svg: wrapSvg(W, H, defs, body), safe: safeRect(170 * s, 430 * s, W - 340 * s, H - 430 * s - 190 * s) };
        }
    });

    // ---------- lookup / recommendation ----------

    function getDesign(id) {
        for (var i = 0; i < DESIGNS.length; i += 1) {
            if (DESIGNS[i].id === id) return DESIGNS[i];
        }
        return null;
    }

    function getColorway(design, colorwayId, eventType) {
        if (!design) return null;
        var wanted = colorwayId || (design.eventColorways && design.eventColorways[eventType]) || design.colorways[0].id;
        for (var i = 0; i < design.colorways.length; i += 1) {
            if (design.colorways[i].id === wanted) return design.colorways[i];
        }
        return design.colorways[0];
    }

    function eventRank(design, eventType) {
        var index = design.bestFor.indexOf(eventType);
        return index < 0 ? 99 : index;
    }

    // Designs ordered for an event: ones made for that event first (by how central the event
    // is to the design), then everything else in library order. Never filters anything out.
    function designsForEvent(eventType) {
        return DESIGNS.slice().sort(function (a, b) {
            var diff = eventRank(a, eventType) - eventRank(b, eventType);
            return diff !== 0 ? diff : DESIGNS.indexOf(a) - DESIGNS.indexOf(b);
        });
    }

    var DEFAULT_DESIGN_FOR_EVENT = Object.freeze({
        nikah: 'emerald-nikah',
        mehndi: 'mehndi-marigold',
        baraat: 'royal-maroon',
        walima: 'pastel-walima',
        mayun: 'courtyard',
        dholki: 'mela-folk',
        engagement: 'rose-garden',
        rukhsati: 'ivory-nikah',
        custom: 'mughal-garden'
    });

    function defaultDesignFor(eventType) {
        return DEFAULT_DESIGN_FOR_EVENT[eventType] || 'mughal-garden';
    }

    function filterDesigns(filter, eventType) {
        if (!filter || filter === 'recommended') return designsForEvent(eventType);
        if (filter === 'all') return DESIGNS.slice();
        if (STYLES.indexOf(filter) >= 0) return DESIGNS.filter(function (design) { return design.style === filter; });
        return designsForEvent(filter).filter(function (design) { return design.bestFor.indexOf(filter) >= 0; });
    }

    function buildArt(designId, colorwayId, eventType, width, height) {
        var design = getDesign(designId) || getDesign(defaultDesignFor(eventType));
        var colorway = getColorway(design, colorwayId, eventType);
        var result = design.art(width, height, colorway.c);
        return { design: design, colorway: colorway, svg: result.svg, safe: result.safe };
    }

    return {
        STYLES: STYLES,
        EVENT_ORDER: EVENT_ORDER,
        DESIGNS: DESIGNS,
        DEFAULT_DESIGN_FOR_EVENT: DEFAULT_DESIGN_FOR_EVENT,
        getDesign: getDesign,
        getColorway: getColorway,
        designsForEvent: designsForEvent,
        defaultDesignFor: defaultDesignFor,
        filterDesigns: filterDesigns,
        buildArt: buildArt
    };
}));
