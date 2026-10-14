(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.WriteUrduCardArtKit = api;
}(typeof window !== 'undefined' ? window : null, function () {
    'use strict';

    // Shared drawing kit for Write Urdu's original card artwork.
    //
    // Every design in scripts/card-art/designs/ is composed from these primitives so that an
    // ornament drawn once (a rose, a marigold string, a cusped Mughal arch, a girih field) is
    // reused across families instead of being redrawn per card. Output is plain SVG markup;
    // scripts/card-art/build.js rasterises it to the WebP backgrounds the shared registry serves,
    // and the wedding maker draws the same compositions live at any card size in the browser.
    //
    // Rules the kit enforces by construction:
    // - artwork never contains letters or pseudo-script, so it can never be mistaken for text;
    // - everything is deterministic (seeded), so a rebuild reproduces the same art byte-for-byte
    //   in SVG form and visually identical rasters.

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
        return Object.keys(map || {}).map(function (key) {
            var value = map[key];
            return value === undefined || value === null || value === false ? '' : ' ' + key + '="' + value + '"';
        }).join('');
    }

    function el(tag, map, inner) {
        return '<' + tag + attrs(map) + (inner === undefined ? '/>' : '>' + inner + '</' + tag + '>');
    }

    function g(map, inner) {
        return el('g', map, inner);
    }

    function at(x, y, rotate, scale, inner, extra) {
        var t = 'translate(' + n(x) + ' ' + n(y) + ')';
        if (rotate) t += ' rotate(' + n(rotate) + ')';
        if (scale !== undefined && scale !== 1) t += ' scale(' + (Array.isArray(scale) ? n(scale[0]) + ' ' + n(scale[1]) : n(scale)) + ')';
        return g(Object.assign({ transform: t }, extra || {}), inner);
    }

    function svg(W, H, defs, body) {
        return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
            '<defs>' + defs + '</defs>' + body + '</svg>';
    }

    function stops(list) {
        return list.map(function (stop, index) {
            var item = Array.isArray(stop) ? stop : [stop];
            var offset = item.length > 2 ? item[2] : index / Math.max(1, list.length - 1);
            return el('stop', { offset: n(offset), 'stop-color': item[0], 'stop-opacity': item[1] === undefined ? 1 : item[1] });
        }).join('');
    }

    function linear(id, list, x1, y1, x2, y2) {
        return el('linearGradient', { id: id, x1: x1 === undefined ? 0 : x1, y1: y1 === undefined ? 0 : y1, x2: x2 === undefined ? 0 : x2, y2: y2 === undefined ? 1 : y2 }, stops(list));
    }

    function radial(id, list, cx, cy, r, extra) {
        return el('radialGradient', Object.assign({ id: id, cx: cx === undefined ? '50%' : cx, cy: cy === undefined ? '50%' : cy, r: r === undefined ? '50%' : r }, extra || {}), stops(list));
    }

    function blur(id, deviation) {
        return el('filter', { id: id, x: '-50%', y: '-50%', width: '200%', height: '200%' }, el('feGaussianBlur', { stdDeviation: deviation }));
    }

    // Fine paper/cloth grain. Multiply a neutral noise layer over the ground at low opacity.
    function grainFilter(id, frequency, octaves, seed) {
        return el('filter', { id: id, x: 0, y: 0, width: '100%', height: '100%' },
            el('feTurbulence', { type: 'fractalNoise', baseFrequency: frequency || 0.85, numOctaves: octaves || 3, seed: seed || 7, stitchTiles: 'stitch' }) +
            el('feColorMatrix', { type: 'saturate', values: 0 }) +
            el('feComponentTransfer', {}, el('feFuncA', { type: 'linear', slope: 0, intercept: 1 })));
    }

    // Large, soft mottling (handmade paper clouds, watercolour washes).
    function mottleFilter(id, frequency, seed) {
        return el('filter', { id: id, x: 0, y: 0, width: '100%', height: '100%' },
            el('feTurbulence', { type: 'fractalNoise', baseFrequency: frequency || 0.004, numOctaves: 4, seed: seed || 3 }) +
            el('feColorMatrix', { type: 'saturate', values: 0 }));
    }

    function grainLayer(W, H, filterId, opacity, blend) {
        return el('rect', { width: W, height: H, filter: 'url(#' + filterId + ')', opacity: opacity, style: 'mix-blend-mode:' + (blend || 'multiply') });
    }

    function rect(x, y, w, h, fill, extra) {
        return el('rect', Object.assign({ x: n(x), y: n(y), width: n(w), height: n(h), fill: fill }, extra || {}));
    }

    function circle(cx, cy, r, fill, extra) {
        return el('circle', Object.assign({ cx: n(cx), cy: n(cy), r: n(r), fill: fill }, extra || {}));
    }

    function ellipse(cx, cy, rx, ry, fill, extra) {
        return el('ellipse', Object.assign({ cx: n(cx), cy: n(cy), rx: n(rx), ry: n(ry), fill: fill }, extra || {}));
    }

    function path(d, fill, extra) {
        return el('path', Object.assign({ d: d, fill: fill || 'none' }, extra || {}));
    }

    function stroke(d, color, width, extra) {
        return el('path', Object.assign({ d: d, fill: 'none', stroke: color, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, extra || {}));
    }

    function poly(points) {
        return 'M' + points.map(function (p) { return n(p[0]) + ' ' + n(p[1]); }).join(' L') + ' Z';
    }

    // ---------------------------------------------------------------- botanicals

    // A leaf pointing along +x from the origin. `curl` bends the tip.
    function leafShape(length, width, curl) {
        var l = length;
        var w = width === undefined ? l * 0.32 : width;
        var c = curl || 0;
        return 'M0 0 C' + n(l * 0.22) + ' ' + n(-w * 0.95) + ' ' + n(l * 0.68) + ' ' + n(-w * 0.9 + c) + ' ' + n(l) + ' ' + n(c) +
            ' C' + n(l * 0.66) + ' ' + n(w * 0.75 + c) + ' ' + n(l * 0.24) + ' ' + n(w * 0.9) + ' 0 0Z';
    }

    function leaf(x, y, length, angle, fill, vein, options) {
        options = options || {};
        var l = length;
        var body = path(leafShape(l, options.width, options.curl), fill, options.opacity ? { opacity: options.opacity } : null);
        var veins = '';
        if (vein) {
            var c = options.curl || 0;
            veins += stroke('M' + n(l * 0.04) + ' 0 Q' + n(l * 0.55) + ' ' + n(c * 0.35) + ' ' + n(l * 0.94) + ' ' + n(c * 0.95), vein, n(Math.max(0.7, l * 0.022)), { opacity: 0.75 });
            if (l > 40) {
                for (var i = 1; i <= 4; i += 1) {
                    var t = i / 5.4;
                    var vx = l * t;
                    var vy = c * t * t * 0.6;
                    var len = l * 0.17 * (1 - t * 0.5);
                    veins += stroke('M' + n(vx) + ' ' + n(vy) + ' q' + n(len * 0.5) + ' ' + n(-len * 0.32) + ' ' + n(len) + ' ' + n(-len * 0.55), vein, n(Math.max(0.5, l * 0.012)), { opacity: 0.5 });
                    veins += stroke('M' + n(vx) + ' ' + n(vy) + ' q' + n(len * 0.5) + ' ' + n(len * 0.32) + ' ' + n(len) + ' ' + n(len * 0.55), vein, n(Math.max(0.5, l * 0.012)), { opacity: 0.5 });
                }
            }
        }
        return at(x, y, angle, 1, body + veins);
    }

    // Layered garden rose, seen from slightly above. `palette` = { deep, mid, light, shade }.
    // The petal gradients must be defined once with roseDefs(prefix, palette).
    function roseDefs(prefix, palette) {
        return radial(prefix + '-petal', [[palette.light, 1, 0], [palette.mid, 1, 0.55], [palette.deep, 1, 1]], '50%', '20%', '90%') +
            radial(prefix + '-heart', [[palette.deep, 1, 0], [palette.mid, 1, 0.7], [palette.light, 1, 1]], '50%', '50%', '60%') +
            radial(prefix + '-shadow', [[palette.shade || '#000', 0.35, 0], [palette.shade || '#000', 0, 1]]);
    }

    function rose(x, y, r, prefix, rotation, palette) {
        var parts = '';
        var petal = 'url(#' + prefix + '-petal)';
        var edge = palette && palette.edge ? palette.edge : 'rgba(255,255,255,0.22)';
        var line = palette && palette.line ? palette.line : 'rgba(80,10,30,0.2)';
        parts += ellipse(r * 0.06, r * 0.12, r * 1.18, r * 1.08, 'url(#' + prefix + '-shadow)');
        // Outer guard petals: broad cups around the bloom.
        var outer = 6;
        for (var i = 0; i < outer; i += 1) {
            var a = (360 / outer) * i + 12;
            parts += at(0, 0, a, 1, path('M0 ' + n(-r * 0.18) + ' C' + n(r * 0.62) + ' ' + n(-r * 0.6) + ' ' + n(r * 1.08) + ' ' + n(-r * 0.24) + ' ' + n(r * 1.02) + ' ' + n(r * 0.18) +
                ' C' + n(r * 0.96) + ' ' + n(r * 0.6) + ' ' + n(r * 0.4) + ' ' + n(r * 0.68) + ' 0 ' + n(r * 0.24) + 'Z', petal) +
                stroke('M' + n(r * 0.98) + ' ' + n(-r * 0.05) + ' C' + n(r * 0.98) + ' ' + n(r * 0.3) + ' ' + n(r * 0.7) + ' ' + n(r * 0.52) + ' ' + n(r * 0.36) + ' ' + n(r * 0.5), edge, n(r * 0.035)));
        }
        // Middle cup.
        for (var j = 0; j < 5; j += 1) {
            var b = 72 * j + 40;
            parts += at(0, 0, b, 1, path('M0 ' + n(-r * 0.1) + ' C' + n(r * 0.42) + ' ' + n(-r * 0.46) + ' ' + n(r * 0.78) + ' ' + n(-r * 0.12) + ' ' + n(r * 0.72) + ' ' + n(r * 0.2) +
                ' C' + n(r * 0.62) + ' ' + n(r * 0.5) + ' ' + n(r * 0.24) + ' ' + n(r * 0.5) + ' 0 ' + n(r * 0.14) + 'Z', petal, { opacity: 0.96 }) +
                stroke('M' + n(r * 0.7) + ' ' + n(r * 0.05) + ' C' + n(r * 0.62) + ' ' + n(r * 0.36) + ' ' + n(r * 0.36) + ' ' + n(r * 0.44) + ' ' + n(r * 0.14) + ' ' + n(r * 0.3), line, n(r * 0.03)));
        }
        // Spiral heart.
        parts += circle(0, 0, r * 0.42, 'url(#' + prefix + '-heart)');
        parts += stroke('M' + n(-r * 0.3) + ' ' + n(r * 0.06) + ' C' + n(-r * 0.32) + ' ' + n(-r * 0.24) + ' ' + n(r * 0.02) + ' ' + n(-r * 0.36) + ' ' + n(r * 0.24) + ' ' + n(-r * 0.18) +
            ' C' + n(r * 0.4) + ' ' + n(-r * 0.02) + ' ' + n(r * 0.26) + ' ' + n(r * 0.24) + ' ' + n(r * 0.02) + ' ' + n(r * 0.24) +
            ' C' + n(-r * 0.16) + ' ' + n(r * 0.22) + ' ' + n(-r * 0.2) + ' ' + n(r * 0.02) + ' ' + n(-r * 0.06) + ' ' + n(-r * 0.08) +
            ' C' + n(r * 0.04) + ' ' + n(-r * 0.14) + ' ' + n(r * 0.14) + ' ' + n(-r * 0.04) + ' ' + n(r * 0.06) + ' ' + n(r * 0.06), line, n(r * 0.03));
        parts += stroke('M' + n(-r * 0.36) + ' ' + n(-r * 0.12) + ' C' + n(-r * 0.2) + ' ' + n(-r * 0.4) + ' ' + n(r * 0.18) + ' ' + n(-r * 0.44) + ' ' + n(r * 0.36) + ' ' + n(-r * 0.22), edge, n(r * 0.04));
        return at(x, y, rotation || 0, 1, parts);
    }

    function rosebud(x, y, r, angle, prefix, sepal) {
        var bud = path('M0 ' + n(-r) + ' C' + n(r * 0.7) + ' ' + n(-r * 0.5) + ' ' + n(r * 0.66) + ' ' + n(r * 0.45) + ' 0 ' + n(r * 0.62) +
            ' C' + n(-r * 0.66) + ' ' + n(r * 0.45) + ' ' + n(-r * 0.7) + ' ' + n(-r * 0.5) + ' 0 ' + n(-r) + 'Z', 'url(#' + prefix + '-petal)');
        var fold = stroke('M' + n(-r * 0.3) + ' ' + n(-r * 0.2) + ' C' + n(-r * 0.05) + ' ' + n(-r * 0.6) + ' ' + n(r * 0.3) + ' ' + n(-r * 0.4) + ' ' + n(r * 0.35) + ' ' + n(r * 0.1), 'rgba(80,10,30,0.3)', n(r * 0.08));
        var cup = path('M' + n(-r * 0.62) + ' ' + n(r * 0.2) + ' C' + n(-r * 0.5) + ' ' + n(r * 0.95) + ' ' + n(r * 0.5) + ' ' + n(r * 0.95) + ' ' + n(r * 0.62) + ' ' + n(r * 0.2) +
            ' L' + n(r * 0.2) + ' ' + n(r * 0.55) + ' L0 ' + n(-r * 0.1) + ' L' + n(-r * 0.2) + ' ' + n(r * 0.55) + 'Z', sepal);
        return at(x, y, angle, 1, bud + fold + cup);
    }

    // Five-petal blossom (jasmine, apple blossom, wild rose).
    function blossom(x, y, r, petal, centre, rotation, options) {
        options = options || {};
        var count = options.count || 5;
        var parts = '';
        for (var i = 0; i < count; i += 1) {
            parts += at(0, 0, (360 / count) * i, 1, path('M0 0 C' + n(-r * 0.55) + ' ' + n(-r * 0.25) + ' ' + n(-r * 0.5) + ' ' + n(-r * 1.02) + ' 0 ' + n(-r) +
                ' C' + n(r * 0.5) + ' ' + n(-r * 1.02) + ' ' + n(r * 0.55) + ' ' + n(-r * 0.25) + ' 0 0Z', petal, options.edge ? { stroke: options.edge, 'stroke-width': n(r * 0.04) } : null));
        }
        parts += circle(0, 0, r * 0.2, centre);
        if (options.stamens) {
            for (var s = 0; s < 8; s += 1) {
                var a = (Math.PI * 2 * s) / 8;
                parts += circle(Math.cos(a) * r * 0.32, Math.sin(a) * r * 0.32, r * 0.05, options.stamens);
            }
        }
        return at(x, y, rotation || 0, 1, parts);
    }

    // Gypsophila / filler sprays: tiny dots on hairline stems.
    function sprig(x, y, length, angle, stem, dot, rng, count) {
        var parts = stroke('M0 0 Q' + n(length * 0.5) + ' ' + n(-length * 0.08) + ' ' + n(length) + ' 0', stem, 1.4);
        for (var i = 0; i < (count || 9); i += 1) {
            var t = 0.25 + rng() * 0.75;
            var bx = length * t;
            var by = (rng() - 0.5) * length * 0.34;
            parts += stroke('M' + n(bx * 0.8) + ' 0 L' + n(bx) + ' ' + n(by), stem, 0.9);
            parts += circle(bx, by, 2.4 + rng() * 2.6, dot);
        }
        return at(x, y, angle, 1, parts);
    }

    // Eucalyptus-style stem: round leaves paired along a gently curved stem.
    function roundLeafStem(x, y, length, angle, leafFill, stemColor, rng) {
        var parts = stroke('M0 0 Q' + n(length * 0.5) + ' ' + n(length * 0.1) + ' ' + n(length) + ' 0', stemColor, 2.2);
        var pairs = Math.max(3, Math.round(length / 34));
        for (var i = 0; i < pairs; i += 1) {
            var t = (i + 0.6) / pairs;
            var px = length * t;
            var py = length * 0.1 * 2 * t * (1 - t);
            var size = 15 + (1 - t) * 10 + rng() * 4;
            parts += ellipse(px, py - size * 0.9, size * 0.72, size * 0.9, leafFill, { transform: 'rotate(' + n(-20 + rng() * 14) + ' ' + n(px) + ' ' + n(py) + ')', opacity: 0.92 });
            parts += ellipse(px + 6, py + size * 0.9, size * 0.72, size * 0.9, leafFill, { transform: 'rotate(' + n(20 - rng() * 14) + ' ' + n(px) + ' ' + n(py) + ')', opacity: 0.84 });
        }
        return at(x, y, angle, 1, parts);
    }

    // Marigold (genda): ruffled double pompom.
    function marigold(x, y, r, palette, rng) {
        // Layers of frilled petal wedges, outermost first; each wedge has a scalloped rim and a
        // darker edge so the bloom reads as a ruffled pompom rather than concentric discs.
        var parts = circle(0, 0, r * 0.9, palette.deep);
        var rings = [[1, 15, palette.deep], [0.84, 13, palette.mid], [0.66, 11, palette.light], [0.46, 8, palette.mid], [0.26, 5, palette.light]];
        var edge = 'rgba(120,40,0,0.32)';
        rings.forEach(function (ring, index) {
            var rr = r * ring[0];
            var wedge = Math.PI / ring[1];
            for (var i = 0; i < ring[1]; i += 1) {
                var a = (Math.PI * 2 * i) / ring[1] + index * 0.42 + (rng() - 0.5) * 0.25;
                var reach = rr * (0.92 + rng() * 0.14);
                var a1 = a - wedge * 1.05;
                var a2 = a + wedge * 1.05;
                var d = 'M0 0 L' + n(Math.cos(a1) * reach * 0.86) + ' ' + n(Math.sin(a1) * reach * 0.86) +
                    ' Q' + n(Math.cos(a - wedge * 0.5) * reach * 1.08) + ' ' + n(Math.sin(a - wedge * 0.5) * reach * 1.08) + ' ' + n(Math.cos(a) * reach * 0.94) + ' ' + n(Math.sin(a) * reach * 0.94) +
                    ' Q' + n(Math.cos(a + wedge * 0.5) * reach * 1.08) + ' ' + n(Math.sin(a + wedge * 0.5) * reach * 1.08) + ' ' + n(Math.cos(a2) * reach * 0.86) + ' ' + n(Math.sin(a2) * reach * 0.86) + 'Z';
                parts += path(d, ring[2], { stroke: edge, 'stroke-width': n(Math.max(0.5, r * 0.035)), 'stroke-linejoin': 'round' });
            }
        });
        parts += circle(0, 0, r * 0.12, palette.deep);
        parts += circle(-r * 0.3, -r * 0.34, r * 0.38, 'rgba(255,255,255,0.14)');
        parts += circle(r * 0.18, r * 0.24, r * 0.7, 'rgba(120,30,0,0.08)');
        return at(x, y, rng() * 360, 1, parts);
    }

    // Hanging string of marigolds with alternating colours, leaf collars and a finishing ornament.
    function marigoldString(x, top, length, r, palettes, rng, finish) {
        var parts = stroke('M' + n(x) + ' ' + n(top) + ' L' + n(x) + ' ' + n(top + length), 'rgba(80,50,10,0.5)', 1.5);
        var step = r * 1.42;
        var count = Math.floor(length / step);
        for (var i = 0; i < count; i += 1) {
            var cy = top + r + i * step;
            if (i % 4 === 3) {
                parts += leaf(x, cy, r * 1.25, 160, '#3f7d3a', null);
                parts += leaf(x, cy, r * 1.25, 20, '#4f8f45', null);
                continue;
            }
            parts += marigold(x + (rng() - 0.5) * 2, cy, r * (0.92 + rng() * 0.12), palettes[i % palettes.length], rng);
        }
        var endY = top + r + count * step;
        if (finish) parts += finish(x, endY);
        return parts;
    }

    // Brass bell / tassel finials for garlands and lanterns.
    function tassel(x, y, size, fill, thread) {
        var parts = circle(x, y, size * 0.35, fill);
        parts += path('M' + n(x - size * 0.35) + ' ' + n(y + size * 0.25) + ' L' + n(x + size * 0.35) + ' ' + n(y + size * 0.25) + ' L' + n(x + size * 0.55) + ' ' + n(y + size * 1.8) + ' L' + n(x - size * 0.55) + ' ' + n(y + size * 1.8) + 'Z', thread);
        for (var i = -2; i <= 2; i += 1) parts += stroke('M' + n(x + i * size * 0.1) + ' ' + n(y + size * 0.4) + ' L' + n(x + i * size * 0.22) + ' ' + n(y + size * 1.75), 'rgba(0,0,0,0.18)', 1);
        return parts;
    }

    function bell(x, y, size, fill, shine) {
        return path('M' + n(x) + ' ' + n(y) + ' C' + n(x + size * 0.5) + ' ' + n(y) + ' ' + n(x + size * 0.45) + ' ' + n(y + size * 0.9) + ' ' + n(x + size * 0.8) + ' ' + n(y + size * 1.1) +
            ' L' + n(x - size * 0.8) + ' ' + n(y + size * 1.1) + ' C' + n(x - size * 0.45) + ' ' + n(y + size * 0.9) + ' ' + n(x - size * 0.5) + ' ' + n(y) + ' ' + n(x) + ' ' + n(y) + 'Z', fill) +
            circle(x, y + size * 1.22, size * 0.18, fill) +
            stroke('M' + n(x - size * 0.2) + ' ' + n(y + size * 0.25) + ' Q' + n(x - size * 0.32) + ' ' + n(y + size * 0.7) + ' ' + n(x - size * 0.55) + ' ' + n(y + size * 0.98), shine, n(size * 0.08));
    }

    // Mughal parchin-kari stem: a symmetric flowering plant (tulip/poppy) with paired leaves,
    // as inlaid on Mughal dados. Grows upward from (x, y).
    function parchinFlower(x, y, h, palette) {
        var p = palette;
        var parts = stroke('M0 0 C' + n(-h * 0.03) + ' ' + n(-h * 0.35) + ' ' + n(h * 0.03) + ' ' + n(-h * 0.62) + ' 0 ' + n(-h * 0.78), p.stem, n(h * 0.022));
        // Paired leaves.
        [[0.16, 0.42, 0.15], [0.38, 0.34, 0.12], [0.58, 0.24, 0.09]].forEach(function (spec) {
            var ly = -h * spec[0];
            parts += leaf(0, ly, h * spec[1], -152 + spec[2] * 40, p.leaf, p.vein, { width: h * spec[1] * 0.26, curl: -h * 0.02 });
            parts += leaf(0, ly, h * spec[1], -28 - spec[2] * 40, p.leaf2 || p.leaf, p.vein, { width: h * spec[1] * 0.26, curl: h * 0.02 });
        });
        // Side buds.
        parts += at(-h * 0.2, -h * 0.66, -30, 1, path('M0 0 C' + n(-h * 0.05) + ' ' + n(-h * 0.06) + ' ' + n(-h * 0.03) + ' ' + n(-h * 0.13) + ' 0 ' + n(-h * 0.15) + ' C' + n(h * 0.03) + ' ' + n(-h * 0.13) + ' ' + n(h * 0.05) + ' ' + n(-h * 0.06) + ' 0 0Z', p.bud || p.petal));
        parts += at(h * 0.2, -h * 0.66, 30, 1, path('M0 0 C' + n(-h * 0.05) + ' ' + n(-h * 0.06) + ' ' + n(-h * 0.03) + ' ' + n(-h * 0.13) + ' 0 ' + n(-h * 0.15) + ' C' + n(h * 0.03) + ' ' + n(-h * 0.13) + ' ' + n(h * 0.05) + ' ' + n(-h * 0.06) + ' 0 0Z', p.bud || p.petal));
        parts += stroke('M0 ' + n(-h * 0.5) + ' Q' + n(-h * 0.1) + ' ' + n(-h * 0.58) + ' ' + n(-h * 0.2) + ' ' + n(-h * 0.66), p.stem, n(h * 0.012));
        parts += stroke('M0 ' + n(-h * 0.5) + ' Q' + n(h * 0.1) + ' ' + n(-h * 0.58) + ' ' + n(h * 0.2) + ' ' + n(-h * 0.66), p.stem, n(h * 0.012));
        // Tulip head: three petals plus inner shading.
        var top = -h * 0.78;
        var fw = h * 0.13;
        parts += path('M0 ' + n(top) + ' C' + n(-fw * 1.4) + ' ' + n(top - fw * 0.2) + ' ' + n(-fw * 1.3) + ' ' + n(top - fw * 1.6) + ' ' + n(-fw * 0.7) + ' ' + n(top - fw * 2.1) +
            ' C' + n(-fw * 0.5) + ' ' + n(top - fw * 1.4) + ' ' + n(-fw * 0.2) + ' ' + n(top - fw * 1.2) + ' 0 ' + n(top - fw * 1.6) +
            ' C' + n(fw * 0.2) + ' ' + n(top - fw * 1.2) + ' ' + n(fw * 0.5) + ' ' + n(top - fw * 1.4) + ' ' + n(fw * 0.7) + ' ' + n(top - fw * 2.1) +
            ' C' + n(fw * 1.3) + ' ' + n(top - fw * 1.6) + ' ' + n(fw * 1.4) + ' ' + n(top - fw * 0.2) + ' 0 ' + n(top) + 'Z', p.petal);
        parts += path('M0 ' + n(top - fw * 0.15) + ' C' + n(-fw * 0.6) + ' ' + n(top - fw * 0.5) + ' ' + n(-fw * 0.5) + ' ' + n(top - fw * 1.2) + ' 0 ' + n(top - fw * 1.45) +
            ' C' + n(fw * 0.5) + ' ' + n(top - fw * 1.2) + ' ' + n(fw * 0.6) + ' ' + n(top - fw * 0.5) + ' 0 ' + n(top - fw * 0.15) + 'Z', p.petalInner || p.petal, { opacity: 0.9 });
        parts += path('M' + n(-fw * 0.9) + ' ' + n(top - fw * 0.15) + ' Q0 ' + n(top + fw * 0.45) + ' ' + n(fw * 0.9) + ' ' + n(top - fw * 0.15) + ' Q0 ' + n(top + fw * 0.1) + ' ' + n(-fw * 0.9) + ' ' + n(top - fw * 0.15) + 'Z', p.leaf);
        return at(x, y, 0, 1, parts);
    }

    // Arabesque scroll: a spiralling vine with leaves and buds. Draws from (x, y) heading `angle`.
    function vineScroll(x, y, size, angle, color, leafColor, rng, mirror) {
        var s = size;
        var d = 'M0 0 C' + n(s * 0.35) + ' ' + n(-s * 0.05) + ' ' + n(s * 0.7) + ' ' + n(-s * 0.3) + ' ' + n(s * 0.78) + ' ' + n(-s * 0.62) +
            ' C' + n(s * 0.86) + ' ' + n(-s * 0.95) + ' ' + n(s * 0.6) + ' ' + n(-s * 1.12) + ' ' + n(s * 0.42) + ' ' + n(-s * 0.95) +
            ' C' + n(s * 0.28) + ' ' + n(-s * 0.82) + ' ' + n(s * 0.36) + ' ' + n(-s * 0.62) + ' ' + n(s * 0.52) + ' ' + n(-s * 0.68);
        var parts = stroke(d, color, n(Math.max(1.2, s * 0.028)));
        parts += leaf(s * 0.3, -s * 0.06, s * 0.3, -40, leafColor, null, { width: s * 0.08 });
        parts += leaf(s * 0.62, -s * 0.26, s * 0.26, 30, leafColor, null, { width: s * 0.07 });
        parts += leaf(s * 0.8, -s * 0.7, s * 0.22, -100, leafColor, null, { width: s * 0.06 });
        parts += circle(s * 0.52, -s * 0.68, s * 0.045, color);
        var sub = 'M' + n(s * 0.22) + ' ' + n(-s * 0.04) + ' C' + n(s * 0.18) + ' ' + n(-s * 0.24) + ' ' + n(s * 0.02) + ' ' + n(-s * 0.32) + ' ' + n(-s * 0.06) + ' ' + n(-s * 0.22);
        parts += stroke(sub, color, n(Math.max(1, s * 0.02)));
        parts += circle(-s * 0.06, -s * 0.22, s * 0.035, color);
        return at(x, y, angle, mirror ? [-1, 1] : 1, parts);
    }

    // Split palmette: the two-lobed leaf of Islamic arabesque, pointing along +x.
    function palmette(x, y, size, angle, fill, line) {
        var s = size;
        var d = 'M0 0 C' + n(s * 0.2) + ' ' + n(-s * 0.42) + ' ' + n(s * 0.62) + ' ' + n(-s * 0.5) + ' ' + n(s * 1.02) + ' ' + n(-s * 0.2) +
            ' C' + n(s * 0.7) + ' ' + n(-s * 0.26) + ' ' + n(s * 0.48) + ' ' + n(-s * 0.08) + ' ' + n(s * 0.42) + ' ' + n(s * 0.08) +
            ' C' + n(s * 0.62) + ' ' + n(s * 0.06) + ' ' + n(s * 0.86) + ' ' + n(s * 0.24) + ' ' + n(s * 0.9) + ' ' + n(s * 0.46) +
            ' C' + n(s * 0.56) + ' ' + n(s * 0.48) + ' ' + n(s * 0.16) + ' ' + n(s * 0.34) + ' 0 0Z';
        return at(x, y, angle, 1, path(d, fill) + (line ? stroke('M' + n(s * 0.06) + ' ' + n(-s * 0.02) + ' C' + n(s * 0.3) + ' ' + n(-s * 0.2) + ' ' + n(s * 0.6) + ' ' + n(-s * 0.28) + ' ' + n(s * 0.86) + ' ' + n(-s * 0.2), line, n(Math.max(0.8, s * 0.02))) : ''));
    }

    // A full arabesque spray filling a corner/spandrel: a scrolling stem that coils twice,
    // split palmettes along it and a rosette at the heart of each coil. Grows from (x, y)
    // towards +x/-y; `mirror` flips it horizontally.
    function arabesque(x, y, size, angle, color, leafFill, accent, mirror) {
        var s = size;
        var w = n(Math.max(1.4, s * 0.022));
        var main = 'M0 0 C' + n(s * 0.18) + ' ' + n(-s * 0.3) + ' ' + n(s * 0.5) + ' ' + n(-s * 0.36) + ' ' + n(s * 0.62) + ' ' + n(-s * 0.6) +
            ' C' + n(s * 0.74) + ' ' + n(-s * 0.86) + ' ' + n(s * 0.5) + ' ' + n(-s * 1.02) + ' ' + n(s * 0.36) + ' ' + n(-s * 0.86) +
            ' C' + n(s * 0.26) + ' ' + n(-s * 0.74) + ' ' + n(s * 0.36) + ' ' + n(-s * 0.6) + ' ' + n(s * 0.48) + ' ' + n(-s * 0.68);
        var branch = 'M' + n(s * 0.3) + ' ' + n(-s * 0.3) + ' C' + n(s * 0.6) + ' ' + n(-s * 0.2) + ' ' + n(s * 0.9) + ' ' + n(-s * 0.24) + ' ' + n(s * 1.02) + ' ' + n(-s * 0.08) +
            ' C' + n(s * 1.12) + ' ' + n(s * 0.06) + ' ' + n(s * 0.98) + ' ' + n(s * 0.2) + ' ' + n(s * 0.86) + ' ' + n(s * 0.1);
        var twig = 'M' + n(s * 0.08) + ' ' + n(-s * 0.16) + ' C' + n(-s * 0.04) + ' ' + n(-s * 0.4) + ' ' + n(s * 0.04) + ' ' + n(-s * 0.62) + ' ' + n(s * 0.16) + ' ' + n(-s * 0.66);
        var parts = stroke(main, color, w) + stroke(branch, color, w) + stroke(twig, color, n(w * 0.8));
        parts += palmette(s * 0.2, -s * 0.24, s * 0.3, -70, leafFill, color);
        parts += palmette(s * 0.62, -s * 0.33, s * 0.26, 10, leafFill, color);
        parts += palmette(s * 0.64, -s * 0.72, s * 0.22, -150, leafFill, color);
        parts += palmette(s * 0.94, -s * 0.2, s * 0.2, -40, leafFill, color);
        parts += palmette(s * 0.16, -s * 0.66, s * 0.18, -120, leafFill, color);
        parts += blossom(s * 0.47, -s * 0.76, s * 0.09, leafFill, accent, 0, { count: 6 });
        parts += blossom(s * 0.88, s * 0.06, s * 0.06, leafFill, accent, 0, { count: 5 });
        parts += circle(s * 0.16, -s * 0.66, s * 0.025, color);
        return at(x, y, angle, mirror ? [-1, 1] : 1, parts);
    }

    // ---------------------------------------------------------------- architecture

    // Pointed (four-centred style) Mughal arch outline from springing line up to an apex.
    function pointedArch(x, y, w, h, spring) {
        var cx = x + w / 2;
        var bottom = y + h;
        var sp = y + h * (spring === undefined ? 0.3 : spring);
        var rise = sp - y;
        return 'M' + n(x) + ' ' + n(bottom) + ' L' + n(x) + ' ' + n(sp) +
            ' C' + n(x) + ' ' + n(sp - rise * 0.62) + ' ' + n(cx - w * 0.22) + ' ' + n(y + rise * 0.24) + ' ' + n(cx) + ' ' + n(y) +
            ' C' + n(cx + w * 0.22) + ' ' + n(y + rise * 0.24) + ' ' + n(x + w) + ' ' + n(sp - rise * 0.62) + ' ' + n(x + w) + ' ' + n(sp) +
            ' L' + n(x + w) + ' ' + n(bottom) + ' Z';
    }

    function cubic(p0, p1, p2, p3, t) {
        var u = 1 - t;
        return [
            u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
            u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]
        ];
    }

    // Cusped (multifoil) Mughal arch: the pointed arch intrados broken into scallops.
    // `cusps` per side; the apex keeps its point.
    function cuspedArch(x, y, w, h, spring, cusps, depth) {
        var cx = x + w / 2;
        var bottom = y + h;
        var sp = y + h * spring;
        var rise = sp - y;
        var left = [[x, sp], [x, sp - rise * 0.62], [cx - w * 0.22], [cx, y]];
        left[2] = [cx - w * 0.22, y + rise * 0.24];
        var right = [[cx, y], [cx + w * 0.22, y + rise * 0.24], [x + w, sp - rise * 0.62], [x + w, sp]];
        var pts = [];
        var k = cusps || 5;
        for (var i = 0; i <= k; i += 1) pts.push(cubic(left[0], left[1], left[2], left[3], i / k));
        for (var j = 1; j <= k; j += 1) pts.push(cubic(right[0], right[1], right[2], right[3], j / k));
        var centre = [cx, sp + rise * 0.15];
        var dd = depth === undefined ? 0.32 : depth;
        var d = 'M' + n(x) + ' ' + n(bottom) + ' L' + n(pts[0][0]) + ' ' + n(pts[0][1]);
        for (var p = 1; p < pts.length; p += 1) {
            var a = pts[p - 1];
            var b = pts[p];
            var mx = (a[0] + b[0]) / 2;
            var my = (a[1] + b[1]) / 2;
            var vx = centre[0] - mx;
            var vy = centre[1] - my;
            var len = Math.sqrt(vx * vx + vy * vy) || 1;
            var seg = Math.sqrt((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1]));
            // Scallops bulge inward (towards the opening) except the two apex segments, which stay pointed.
            var apex = p === k || p === k + 1;
            var bulge = apex ? seg * 0.08 : seg * dd;
            d += ' Q' + n(mx + (vx / len) * bulge) + ' ' + n(my + (vy / len) * bulge) + ' ' + n(b[0]) + ' ' + n(b[1]);
        }
        d += ' L' + n(x + w) + ' ' + n(bottom) + ' Z';
        return d;
    }

    function onionFinial(cx, y, size, fill) {
        return path('M' + n(cx) + ' ' + n(y - size * 2.1) + ' C' + n(cx + size * 0.2) + ' ' + n(y - size * 1.5) + ' ' + n(cx + size * 0.75) + ' ' + n(y - size * 1.1) + ' ' + n(cx + size * 0.7) + ' ' + n(y - size * 0.55) +
            ' C' + n(cx + size * 0.66) + ' ' + n(y - size * 0.2) + ' ' + n(cx + size * 0.3) + ' ' + n(y) + ' ' + n(cx) + ' ' + n(y) +
            ' C' + n(cx - size * 0.3) + ' ' + n(y) + ' ' + n(cx - size * 0.66) + ' ' + n(y - size * 0.2) + ' ' + n(cx - size * 0.7) + ' ' + n(y - size * 0.55) +
            ' C' + n(cx - size * 0.75) + ' ' + n(y - size * 1.1) + ' ' + n(cx - size * 0.2) + ' ' + n(y - size * 1.5) + ' ' + n(cx) + ' ' + n(y - size * 2.1) + 'Z', fill) +
            stroke('M' + n(cx) + ' ' + n(y - size * 2.1) + ' L' + n(cx) + ' ' + n(y - size * 2.9), fill, n(size * 0.12)) +
            circle(cx, y - size * 2.45, size * 0.14, fill);
    }

    // Hanging lantern (fanoos) with pierced metalwork and an inner glow. Hangs from (x, top).
    function lantern(x, top, chain, size, metal, glass, glowId) {
        var s = size;
        var y = top + chain;
        var parts = stroke('M' + n(x) + ' ' + n(top) + ' L' + n(x) + ' ' + n(y), metal, n(Math.max(1.2, s * 0.03)));
        if (glowId) parts += circle(x, y + s * 1.05, s * 1.9, 'url(#' + glowId + ')');
        parts += circle(x, y - s * 0.02, s * 0.08, 'none', { stroke: metal, 'stroke-width': n(s * 0.03) });
        // Dome cap.
        parts += path('M' + n(x - s * 0.42) + ' ' + n(y + s * 0.42) + ' C' + n(x - s * 0.4) + ' ' + n(y + s * 0.1) + ' ' + n(x - s * 0.15) + ' ' + n(y + s * 0.02) + ' ' + n(x) + ' ' + n(y + s * 0.02) +
            ' C' + n(x + s * 0.15) + ' ' + n(y + s * 0.02) + ' ' + n(x + s * 0.4) + ' ' + n(y + s * 0.1) + ' ' + n(x + s * 0.42) + ' ' + n(y + s * 0.42) + 'Z', metal);
        parts += rect(x - s * 0.5, y + s * 0.4, s, s * 0.08, metal, { rx: n(s * 0.03) });
        // Glass body: elongated hexagonal lantern.
        var body = poly([[x - s * 0.44, y + s * 0.48], [x + s * 0.44, y + s * 0.48], [x + s * 0.56, y + s * 1.05], [x + s * 0.4, y + s * 1.62], [x - s * 0.4, y + s * 1.62], [x - s * 0.56, y + s * 1.05]]);
        parts += path(body, glass);
        parts += path(body, 'none', { stroke: metal, 'stroke-width': n(s * 0.05), 'stroke-linejoin': 'round' });
        parts += stroke('M' + n(x) + ' ' + n(y + s * 0.48) + ' L' + n(x) + ' ' + n(y + s * 1.62), metal, n(s * 0.035));
        parts += stroke('M' + n(x - s * 0.56) + ' ' + n(y + s * 1.05) + ' L' + n(x + s * 0.56) + ' ' + n(y + s * 1.05), metal, n(s * 0.03));
        // Pierced dots on the glass panels.
        for (var r = 0; r < 3; r += 1) {
            for (var c = -1; c <= 1; c += 2) {
                parts += circle(x + c * s * 0.22, y + s * (0.68 + r * 0.3), s * 0.045, metal, { opacity: 0.55 });
            }
        }
        parts += rect(x - s * 0.44, y + s * 1.6, s * 0.88, s * 0.08, metal, { rx: n(s * 0.03) });
        parts += path('M' + n(x - s * 0.3) + ' ' + n(y + s * 1.68) + ' L' + n(x + s * 0.3) + ' ' + n(y + s * 1.68) + ' L' + n(x) + ' ' + n(y + s * 2.05) + 'Z', metal);
        parts += circle(x, y + s * 2.1, s * 0.07, metal);
        return parts;
    }

    // ---------------------------------------------------------------- pattern fields

    // Eight-pointed star (khatam) and cross tessellation, drawn as an interlaced line pattern.
    function girihPattern(id, size, color, width, background) {
        var s = size;
        var h = s / 2;
        var a = s * 0.2071; // (sqrt(2)-1)/2 * s : star arm inset for a regular octagram on the grid
        // One tile centred on a star; neighbouring stars sit on the tile corners.
        var star = function (cx, cy) {
            var r = h * 0.62;
            var pts1 = [];
            var pts2 = [];
            for (var i = 0; i < 4; i += 1) {
                var t1 = Math.PI / 4 + (Math.PI / 2) * i;
                var t2 = (Math.PI / 2) * i;
                pts1.push([cx + Math.cos(t1) * r, cy + Math.sin(t1) * r]);
                pts2.push([cx + Math.cos(t2) * r, cy + Math.sin(t2) * r]);
            }
            return poly(pts1) + ' ' + poly(pts2);
        };
        var d = star(h, h) + ' ' + star(0, 0) + ' ' + star(s, 0) + ' ' + star(0, s) + ' ' + star(s, s);
        // Connecting cross arms between stars.
        var links = 'M' + n(h) + ' ' + n(h - h * 0.62) + ' L' + n(h) + ' 0 M' + n(h) + ' ' + n(h + h * 0.62) + ' L' + n(h) + ' ' + n(s) +
            ' M' + n(h - h * 0.62) + ' ' + n(h) + ' L0 ' + n(h) + ' M' + n(h + h * 0.62) + ' ' + n(h) + ' L' + n(s) + ' ' + n(h);
        void a;
        return el('pattern', { id: id, width: n(s), height: n(s), patternUnits: 'userSpaceOnUse' },
            (background ? rect(0, 0, s, s, background) : '') +
            path(d, 'none', { stroke: color, 'stroke-width': width, 'stroke-linejoin': 'round' }) +
            path(links, 'none', { stroke: color, 'stroke-width': width }));
    }

    // Small repeating floral lozenge used in borders (Mughal dado bands, block-print grounds).
    function lozengePattern(id, w, h, fill, accent, background) {
        return el('pattern', { id: id, width: n(w), height: n(h), patternUnits: 'userSpaceOnUse' },
            (background ? rect(0, 0, w, h, background) : '') +
            path(poly([[w / 2, h * 0.08], [w * 0.92, h / 2], [w / 2, h * 0.92], [w * 0.08, h / 2]]), 'none', { stroke: fill, 'stroke-width': 1.4 }) +
            blossom(w / 2, h / 2, Math.min(w, h) * 0.2, fill, accent, 0, { count: 4 }) +
            circle(0, 0, 2.2, accent) + circle(w, 0, 2.2, accent) + circle(0, h, 2.2, accent) + circle(w, h, 2.2, accent));
    }

    // Phulkari satin-stitch fill: dense parallel stitches clipped to a shape.
    function stitchPattern(id, gap, color, angle, background) {
        var s = gap * 2;
        return el('pattern', { id: id, width: n(s), height: n(s), patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(' + (angle || 0) + ')' },
            (background ? rect(0, 0, s, s, background) : '') +
            rect(0, 0, s, gap * 0.78, color) +
            rect(0, gap, s, gap * 0.78, color, { opacity: 0.86 }));
    }

    // ---------------------------------------------------------------- sky and landscape

    function stars(W, H, count, rng, color, maxY, minR, maxR) {
        var parts = '';
        for (var i = 0; i < count; i += 1) {
            var r = (minR || 0.8) + Math.pow(rng(), 3) * ((maxR || 2.8) - (minR || 0.8));
            parts += circle(rng() * W, rng() * (maxY || H), r, color, { opacity: n(0.35 + rng() * 0.65) });
        }
        return parts;
    }

    function sparkle(x, y, size, fill) {
        var s = size;
        return path('M' + n(x) + ' ' + n(y - s) + ' Q' + n(x + s * 0.12) + ' ' + n(y - s * 0.12) + ' ' + n(x + s) + ' ' + n(y) + ' Q' + n(x + s * 0.12) + ' ' + n(y + s * 0.12) + ' ' + n(x) + ' ' + n(y + s) +
            ' Q' + n(x - s * 0.12) + ' ' + n(y + s * 0.12) + ' ' + n(x - s) + ' ' + n(y) + ' Q' + n(x - s * 0.12) + ' ' + n(y - s * 0.12) + ' ' + n(x) + ' ' + n(y - s) + 'Z', fill);
    }

    // Smooth ridge line built from a few seeded sine waves; returns a filled silhouette path.
    function ridge(W, baseY, amplitude, rng, bottom, waves) {
        var phases = [];
        for (var i = 0; i < (waves || 3); i += 1) phases.push([0.6 + rng() * 2.6 * (i + 1), rng() * Math.PI * 2, amplitude / (i + 1.2)]);
        var d = 'M0 ' + n(bottom);
        for (var x = 0; x <= W; x += W / 60) {
            var y = baseY;
            phases.forEach(function (ph) { y += Math.sin((x / W) * ph[0] * Math.PI + ph[1]) * ph[2]; });
            d += ' L' + n(x) + ' ' + n(y);
        }
        return d + ' L' + n(W) + ' ' + n(bottom) + ' Z';
    }

    function moon(cx, cy, r, palette) {
        return circle(cx, cy, r, 'url(#' + palette.gradient + ')') +
            circle(cx - r * 0.3, cy - r * 0.15, r * 0.16, palette.crater, { opacity: 0.22 }) +
            circle(cx + r * 0.28, cy + r * 0.25, r * 0.22, palette.crater, { opacity: 0.16 }) +
            circle(cx + r * 0.05, cy - r * 0.42, r * 0.09, palette.crater, { opacity: 0.18 }) +
            circle(cx - r * 0.18, cy + r * 0.4, r * 0.1, palette.crater, { opacity: 0.14 });
    }

    // Paisley (boteh) teardrop with an inner echo and dotted outline.
    function paisley(x, y, size, angle, fill, inner, dots) {
        var s = size;
        var outer = 'M0 ' + n(s * 0.55) + ' C' + n(-s * 0.62) + ' ' + n(s * 0.55) + ' ' + n(-s * 0.7) + ' ' + n(-s * 0.2) + ' ' + n(-s * 0.2) + ' ' + n(-s * 0.48) +
            ' C' + n(s * 0.1) + ' ' + n(-s * 0.65) + ' ' + n(s * 0.42) + ' ' + n(-s * 0.85) + ' ' + n(s * 0.28) + ' ' + n(-s * 1.1) +
            ' C' + n(s * 0.75) + ' ' + n(-s * 0.85) + ' ' + n(s * 0.68) + ' ' + n(s * 0.55) + ' 0 ' + n(s * 0.55) + 'Z';
        var parts = path(outer, fill);
        parts += at(s * 0.05, s * 0.05, 0, 0.62, path(outer, inner));
        parts += at(s * 0.08, s * 0.12, 0, 0.3, path(outer, fill));
        if (dots) {
            for (var i = 0; i < 14; i += 1) {
                var a = (Math.PI * 2 * i) / 14;
                parts += circle(Math.cos(a) * s * 0.62, s * 0.05 + Math.sin(a) * s * 0.62, s * 0.045, dots);
            }
        }
        return at(x, y, angle, 1, parts);
    }

    // ---------------------------------------------------------------- folk textile

    // Phulkari satin-stitch diamond: the two halves are stitched in opposite directions so they
    // catch the light differently, as silk floss does. Needs phulkariDefs(prefix, colours).
    function phulkariDefs(prefix, colours) {
        return Object.keys(colours).map(function (key) {
            var c = colours[key];
            return stitchPattern(prefix + '-' + key + '-a', 3.2, c[0], 62, c[1]) + stitchPattern(prefix + '-' + key + '-b', 3.2, c[0], -62, c[1]);
        }).join('');
    }

    function phulkariDiamond(cx, cy, w, h, prefix, key, outline) {
        var left = poly([[cx, cy - h / 2], [cx, cy + h / 2], [cx - w / 2, cy]]);
        var right = poly([[cx, cy - h / 2], [cx + w / 2, cy], [cx, cy + h / 2]]);
        return path(left, 'url(#' + prefix + '-' + key + '-a)') + path(right, 'url(#' + prefix + '-' + key + '-b)') +
            (outline ? path(poly([[cx, cy - h / 2], [cx + w / 2, cy], [cx, cy + h / 2], [cx - w / 2, cy]]), 'none', { stroke: outline, 'stroke-width': 1.2, opacity: 0.6 }) : '');
    }

    // Bagh flower: eight satin-stitched petals around a centre diamond.
    function phulkariFlower(cx, cy, r, prefix, petalKey, centreKey) {
        var parts = '';
        for (var i = 0; i < 8; i += 1) {
            parts += at(cx, cy, i * 45, 1, phulkariDiamond(0, -r * 0.62, r * 0.42, r * 0.78, prefix, petalKey));
        }
        parts += phulkariDiamond(cx, cy, r * 0.5, r * 0.5, prefix, centreKey);
        return parts;
    }

    // ---------------------------------------------------------------- weather and celebration

    // A raindrop on glass: dark refracted body, bright specular highlight, soft lower rim.
    function raindrop(x, y, r, tint) {
        return ellipse(x, y, r, r * 1.08, 'rgba(10,20,30,0.28)') +
            ellipse(x, y + r * 0.1, r * 0.82, r * 0.86, tint || 'rgba(255,220,170,0.16)') +
            ellipse(x - r * 0.3, y - r * 0.36, r * 0.26, r * 0.18, 'rgba(255,255,255,0.75)') +
            path('M' + n(x - r * 0.7) + ' ' + n(y + r * 0.3) + ' Q' + n(x) + ' ' + n(y + r * 1.15) + ' ' + n(x + r * 0.7) + ' ' + n(y + r * 0.3), 'none', { stroke: 'rgba(255,255,255,0.35)', 'stroke-width': n(Math.max(0.6, r * 0.12)) });
    }

    function balloon(x, y, r, fill, shine, stringColor, stringLength, sway) {
        var knotY = y + r * 1.18;
        var parts = stroke('M' + n(x) + ' ' + n(knotY) + ' C' + n(x + sway) + ' ' + n(knotY + stringLength * 0.3) + ' ' + n(x - sway) + ' ' + n(knotY + stringLength * 0.65) + ' ' + n(x + sway * 0.5) + ' ' + n(knotY + stringLength), stringColor, 1.6);
        parts += path('M' + n(x) + ' ' + n(y - r) + ' C' + n(x + r * 0.95) + ' ' + n(y - r) + ' ' + n(x + r * 1.02) + ' ' + n(y + r * 0.35) + ' ' + n(x + r * 0.12) + ' ' + n(knotY - r * 0.06) +
            ' L' + n(x - r * 0.12) + ' ' + n(knotY - r * 0.06) + ' C' + n(x - r * 1.02) + ' ' + n(y + r * 0.35) + ' ' + n(x - r * 0.95) + ' ' + n(y - r) + ' ' + n(x) + ' ' + n(y - r) + 'Z', fill);
        parts += path('M' + n(x - r * 0.1) + ' ' + n(knotY - r * 0.04) + ' L' + n(x + r * 0.1) + ' ' + n(knotY - r * 0.04) + ' L' + n(x + r * 0.14) + ' ' + n(knotY + r * 0.1) + ' L' + n(x - r * 0.14) + ' ' + n(knotY + r * 0.1) + 'Z', fill);
        parts += ellipse(x - r * 0.38, y - r * 0.42, r * 0.2, r * 0.32, shine, { transform: 'rotate(28 ' + n(x - r * 0.38) + ' ' + n(y - r * 0.42) + ')' });
        parts += ellipse(x - r * 0.2, y - r * 0.06, r * 0.07, r * 0.1, shine, { opacity: 0.6 });
        return parts;
    }

    // Bunting: a sagging cord with triangular pennants.
    function bunting(x1, y1, x2, y2, sag, count, colours, cord) {
        var parts = stroke('M' + n(x1) + ' ' + n(y1) + ' Q' + n((x1 + x2) / 2) + ' ' + n((y1 + y2) / 2 + sag * 2) + ' ' + n(x2) + ' ' + n(y2), cord, 2);
        for (var i = 0; i < count; i += 1) {
            var t = (i + 0.5) / count;
            var px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * ((x1 + x2) / 2) + t * t * x2;
            var py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * ((y1 + y2) / 2 + sag * 2) + t * t * y2;
            var w = (x2 - x1) / count * 0.42;
            parts += path(poly([[px - w, py], [px + w, py], [px, py + w * 1.7]]), colours[i % colours.length]);
            parts += path(poly([[px - w, py], [px, py], [px, py + w * 1.7]]), 'rgba(0,0,0,0.08)');
        }
        return parts;
    }

    // Confetti scattered over the card but kept out of an exclusion box (the text field).
    function confetti(W, H, count, rng, colours, avoid) {
        var parts = '';
        var placed = 0;
        var guard = 0;
        while (placed < count && guard < count * 20) {
            guard += 1;
            var x = rng() * W;
            var y = rng() * H;
            if (avoid && x > avoid.x && x < avoid.x + avoid.w && y > avoid.y && y < avoid.y + avoid.h) continue;
            var c = colours[Math.floor(rng() * colours.length)];
            var kind = rng();
            var rot = rng() * 180;
            if (kind < 0.45) parts += rect(x, y, 6 + rng() * 8, 12 + rng() * 10, c, { transform: 'rotate(' + n(rot) + ' ' + n(x) + ' ' + n(y) + ')', rx: 1.5 });
            else if (kind < 0.75) parts += circle(x, y, 3 + rng() * 4, c);
            else parts += stroke('M' + n(x) + ' ' + n(y) + ' q8 -10 16 0 t16 0', c, 3, { transform: 'rotate(' + n(rot) + ' ' + n(x) + ' ' + n(y) + ')' });
            placed += 1;
        }
        return parts;
    }

    // Meadow flowers for daily-greeting landscapes.
    function daisy(x, y, r, petal, centre, rotation) {
        var parts = '';
        for (var i = 0; i < 12; i += 1) parts += at(0, 0, i * 30, 1, ellipse(0, -r * 0.6, r * 0.16, r * 0.46, petal));
        parts += circle(0, 0, r * 0.26, centre);
        return at(x, y, rotation || 0, 1, parts);
    }

    function grassTuft(x, y, h, color, rng, blades) {
        var parts = '';
        for (var i = 0; i < (blades || 7); i += 1) {
            var lean = (rng() - 0.5) * h * 0.7;
            var bh = h * (0.6 + rng() * 0.5);
            var bx = x + (rng() - 0.5) * h * 0.3;
            parts += path('M' + n(bx - 2.5) + ' ' + n(y) + ' Q' + n(bx + lean * 0.3) + ' ' + n(y - bh * 0.6) + ' ' + n(bx + lean) + ' ' + n(y - bh) + ' Q' + n(bx + lean * 0.3 + 3) + ' ' + n(y - bh * 0.6) + ' ' + n(bx + 2.5) + ' ' + n(y) + 'Z', color);
        }
        return parts;
    }

    function bird(x, y, s, color) {
        return stroke('M' + n(x - s) + ' ' + n(y) + ' Q' + n(x - s * 0.5) + ' ' + n(y - s * 0.55) + ' ' + n(x) + ' ' + n(y) + ' Q' + n(x + s * 0.5) + ' ' + n(y - s * 0.55) + ' ' + n(x + s) + ' ' + n(y), color, n(Math.max(1.2, s * 0.14)));
    }

    return {
        phulkariDefs: phulkariDefs, phulkariDiamond: phulkariDiamond, phulkariFlower: phulkariFlower,
        raindrop: raindrop, balloon: balloon, bunting: bunting, confetti: confetti, daisy: daisy, grassTuft: grassTuft, bird: bird,
        seeded: seeded, n: n, el: el, g: g, at: at, svg: svg,
        linear: linear, radial: radial, blur: blur, grainFilter: grainFilter, mottleFilter: mottleFilter, grainLayer: grainLayer,
        rect: rect, circle: circle, ellipse: ellipse, path: path, stroke: stroke, poly: poly,
        leafShape: leafShape, leaf: leaf, roseDefs: roseDefs, rose: rose, rosebud: rosebud, blossom: blossom, sprig: sprig,
        roundLeafStem: roundLeafStem, marigold: marigold, marigoldString: marigoldString, tassel: tassel, bell: bell,
        parchinFlower: parchinFlower, vineScroll: vineScroll, palmette: palmette, arabesque: arabesque,
        pointedArch: pointedArch, cuspedArch: cuspedArch, onionFinial: onionFinial, lantern: lantern,
        girihPattern: girihPattern, lozengePattern: lozengePattern, stitchPattern: stitchPattern,
        stars: stars, sparkle: sparkle, ridge: ridge, moon: moon, paisley: paisley
    };
}));
