(function (root) {
    'use strict';

    // WU-SHAADI-001 invitation renderer.
    //
    // One drawing path for every surface: hero samples, design thumbnails, the live preview
    // and the downloaded/printed file all call renderInvitation(), so what the user sees is
    // what they get. Artwork comes from js/wedding-design-library.js as SVG (vector, so it is
    // re-rasterised crisply at any size); wording comes from js/wedding-invitation-layout.js
    // and is drawn with canvas text so Urdu shaping and bidi come from the browser itself.

    var designs = root.WriteUrduWeddingDesigns;
    var layout = root.WriteUrduWeddingLayout;
    if (!designs || !layout) return;

    var SIZES = {
        portrait: { id: 'portrait', w: 1080, h: 1350, label: 'Phone & WhatsApp', note: '4:5 · 1080×1350' },
        story: { id: 'story', w: 1080, h: 1920, label: 'WhatsApp Status', note: '9:16 · 1080×1920' },
        print: { id: 'print', w: 1500, h: 2100, label: 'Print card', note: '5×7 in · 300 dpi' }
    };

    var FONTS = {
        nastaliq: { family: 'Noto Nastaliq Urdu', lineHeight: 1.72 },
        naskh: { family: 'Noto Naskh Arabic', lineHeight: 1.5 },
        amiri: { family: 'Amiri', lineHeight: 1.6 },
        serif: { family: 'Cormorant Garamond', lineHeight: 1.18 },
        script: { family: 'Great Vibes', lineHeight: 1.12 },
        caps: { family: 'Cinzel', lineHeight: 1.25 },
        sans: { family: 'Jost', lineHeight: 1.3 }
    };

    // [font, weight, size, colourRole, italic, tracking, uppercase] per role, per script, per lettering.
    function roleStyle(role, script, lettering) {
        if (script === 'ar') return ['amiri', 400, 40, 'accent'];
        if (script === 'ur') {
            var urBody = lettering === 'modern' ? 'naskh' : 'nastaliq';
            var map = {
                kicker: [urBody, 500, 31, 'muted'],
                heading: ['nastaliq', 700, 74, 'accent'],
                invite: [urBody, 400, 33, 'ink'],
                name: ['nastaliq', 700, 98, 'accent'],
                joiner: ['nastaliq', 400, 36, 'muted'],
                parents: [urBody, 400, 28, 'muted'],
                date: [urBody, 600, 36, 'ink'],
                time: [urBody, 500, 33, 'ink'],
                venue: [urBody, 600, 37, 'ink'],
                address: [urBody, 400, 28, 'muted'],
                extra: [urBody, 400, 26, 'muted'],
                host: [urBody, 500, 29, 'ink'],
                rsvp: [urBody, 400, 26, 'muted'],
                closing: [urBody, 500, 30, 'accent'],
                qrLabel: [urBody, 400, 20, 'muted']
            };
            return map[role] || [urBody, 400, 28, 'ink'];
        }
        var calligraphic = lettering === 'calligraphic';
        var modern = lettering === 'modern';
        var en = {
            kicker: ['serif', 500, 28, 'muted', true],
            heading: calligraphic ? ['script', 400, 88, 'accent'] : modern ? ['sans', 500, 34, 'accent', false, 0.32, true] : ['caps', 600, 48, 'accent', false, 0.06],
            subheading: ['caps', 500, 22, 'muted', false, 0.3],
            invite: modern ? ['sans', 400, 26, 'ink'] : ['serif', 500, 31, 'ink', true],
            name: calligraphic ? ['script', 400, 112, 'accent'] : modern ? ['serif', 500, 80, 'accent'] : ['serif', 600, 82, 'accent'],
            joiner: calligraphic ? ['script', 400, 58, 'muted'] : ['serif', 500, 44, 'muted', true],
            parents: ['serif', 500, 27, 'muted', true],
            date: modern ? ['sans', 500, 28, 'ink', false, 0.12, true] : ['caps', 500, 28, 'ink', false, 0.08],
            time: modern ? ['sans', 400, 27, 'ink'] : ['serif', 600, 32, 'ink'],
            venue: modern ? ['sans', 500, 30, 'ink'] : ['serif', 600, 36, 'ink'],
            address: modern ? ['sans', 400, 24, 'muted'] : ['serif', 500, 28, 'muted'],
            extra: modern ? ['sans', 400, 22, 'muted'] : ['serif', 500, 26, 'muted', true],
            host: modern ? ['sans', 400, 24, 'ink'] : ['serif', 500, 29, 'ink', true],
            rsvp: modern ? ['sans', 400, 22, 'muted'] : ['serif', 500, 26, 'muted'],
            closing: modern ? ['sans', 500, 24, 'accent'] : ['serif', 600, 30, 'accent', true],
            qrLabel: ['sans', 400, 19, 'muted']
        };
        return en[role] || ['serif', 500, 28, 'ink'];
    }

    var GAP_BEFORE = { opening: 0, kicker: 10, heading: 8, subheading: 0, invite: 16, name: 18, joiner: 0, parents: 0, divider: 18, date: 16, time: 4, venue: 14, address: 0, extra: 8, host: 20, rsvp: 8, closing: 18, qr: 18 };

    // ---------- fonts ----------

    var fontPromises = {};

    function fontSpec(style, size) {
        var font = FONTS[style[0]];
        return (style[4] ? 'italic ' : '') + style[1] + ' ' + Math.max(1, Math.round(size * 10) / 10) + 'px "' + font.family + '", ' + (style[0] === 'nastaliq' || style[0] === 'naskh' || style[0] === 'amiri' ? '"Noto Naskh Arabic", serif' : 'Georgia, serif');
    }

    function ensureFont(style, sampleText) {
        if (!root.document || !root.document.fonts || typeof root.document.fonts.load !== 'function') return Promise.resolve();
        var key = style[0] + '|' + style[1] + '|' + (style[4] ? 'i' : 'n');
        if (!fontPromises[key]) {
            fontPromises[key] = root.document.fonts.load(fontSpec(style, 40), sampleText || 'Aa اردو').catch(function () { return null; });
        }
        return fontPromises[key];
    }

    // ---------- artwork ----------

    var artCache = {};

    function loadArt(designId, colorwayId, eventType, w, h) {
        var key = [designId, colorwayId || '', eventType || '', w, h].join('|');
        if (artCache[key]) return artCache[key];
        var built = designs.buildArt(designId, colorwayId, eventType, w, h);
        artCache[key] = new Promise(function (resolve) {
            var img = new root.Image();
            img.decoding = 'async';
            img.onload = function () { resolve({ img: img, safe: built.safe, design: built.design, colorway: built.colorway }); };
            img.onerror = function () { resolve({ img: null, safe: built.safe, design: built.design, colorway: built.colorway }); };
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(built.svg);
        });
        return artCache[key];
    }

    // ---------- QR ----------

    var qrCache = {};

    function loadQr(url, dark) {
        var key = url + '|' + dark;
        if (qrCache[key]) return qrCache[key];
        qrCache[key] = new Promise(function (resolve) {
            if (!root.QRCode || typeof root.QRCode.toCanvas !== 'function') { resolve(null); return; }
            var qrCanvas = root.document.createElement('canvas');
            root.QRCode.toCanvas(qrCanvas, url, { width: 360, margin: 1, color: { dark: dark, light: '#ffffffff' } }, function (error) {
                resolve(error ? null : qrCanvas);
            });
        });
        return qrCache[key];
    }

    // ---------- text layout ----------

    function setFont(ctx, style, size, script) {
        ctx.font = fontSpec(style, size);
        ctx.direction = script === 'ur' || script === 'ar' ? 'rtl' : 'ltr';
        if ('letterSpacing' in ctx) ctx.letterSpacing = script === 'en' && style[5] ? Math.round(size * style[5] * 10) / 10 + 'px' : '0px';
    }

    function wrapText(ctx, value, maxWidth) {
        var words = String(value).split(/\s+/).filter(Boolean);
        var lines = [];
        var current = '';
        words.forEach(function (word) {
            var candidate = current ? current + ' ' + word : word;
            if (!current || ctx.measureText(candidate).width <= maxWidth) current = candidate;
            else { lines.push(current); current = word; }
        });
        if (current) lines.push(current);
        return lines.length ? lines : [''];
    }

    function measureBlocks(ctx, blocks, lettering, unit, fit, maxWidth) {
        var items = [];
        var total = 0;
        blocks.forEach(function (item, index) {
            var gap = index === 0 ? 0 : (GAP_BEFORE[item.role] || 6) * unit * fit;
            if (item.role === 'divider') {
                var dh = 30 * unit * fit;
                items.push({ block: item, gap: gap, height: dh });
                total += gap + dh;
                return;
            }
            if (item.role === 'qr') {
                var qh = (150 + 34) * unit * fit;
                items.push({ block: item, gap: gap, height: qh });
                total += gap + qh;
                return;
            }
            var style = roleStyle(item.role, item.script, lettering);
            var size = style[2] * unit * fit;
            var display = style[6] ? item.text.toUpperCase() : item.text;
            setFont(ctx, style, size, item.script);
            // Headings and names prefer one line: shrink them (down to 62%) before wrapping.
            if ((item.role === 'name' || item.role === 'heading') && ctx.measureText(display).width > maxWidth) {
                var ratio = Math.max(0.62, maxWidth / ctx.measureText(display).width);
                size *= ratio;
                setFont(ctx, style, size, item.script);
            }
            var lines = wrapText(ctx, display, maxWidth);
            var lineHeight = size * FONTS[style[0]].lineHeight;
            var height = lineHeight * lines.length;
            items.push({ block: item, gap: gap, height: height, lines: lines, style: style, size: size, lineHeight: lineHeight });
            total += gap + height;
        });
        return { items: items, total: total };
    }

    function drawDivider(ctx, kind, cx, cy, unit, color) {
        var w = 120 * unit;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = Math.max(1, 1.6 * unit);
        ctx.lineCap = 'round';
        if (kind === 'dots') {
            [-24, 0, 24].forEach(function (dx, i) { ctx.beginPath(); ctx.arc(cx + dx * unit, cy, (i === 1 ? 5 : 3.4) * unit, 0, Math.PI * 2); ctx.fill(); });
        } else if (kind === 'line') {
            ctx.beginPath(); ctx.moveTo(cx - w * 0.6, cy); ctx.lineTo(cx + w * 0.6, cy); ctx.stroke();
        } else {
            ctx.beginPath(); ctx.moveTo(cx - w, cy); ctx.lineTo(cx - 18 * unit, cy); ctx.moveTo(cx + 18 * unit, cy); ctx.lineTo(cx + w, cy); ctx.stroke();
            if (kind === 'star') {
                ctx.beginPath();
                for (var i = 0; i < 16; i += 1) {
                    var r = (i % 2 === 0 ? 11 : 5) * unit;
                    var a = Math.PI / 8 * i - Math.PI / 2;
                    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
                }
                ctx.closePath(); ctx.fill();
            } else if (kind === 'diamond') {
                ctx.beginPath(); ctx.moveTo(cx, cy - 9 * unit); ctx.lineTo(cx + 9 * unit, cy); ctx.lineTo(cx, cy + 9 * unit); ctx.lineTo(cx - 9 * unit, cy); ctx.closePath(); ctx.fill();
            } else {
                // flourish: diamond with curls at both ends of the rule.
                ctx.beginPath(); ctx.moveTo(cx, cy - 8 * unit); ctx.lineTo(cx + 8 * unit, cy); ctx.lineTo(cx, cy + 8 * unit); ctx.lineTo(cx - 8 * unit, cy); ctx.closePath(); ctx.fill();
                [-1, 1].forEach(function (side) {
                    ctx.beginPath();
                    ctx.arc(cx + side * (w + 6 * unit), cy - 6 * unit, 6 * unit, side < 0 ? 0 : Math.PI, side < 0 ? Math.PI * 1.6 : Math.PI * 2.4, side > 0);
                    ctx.stroke();
                });
            }
        }
        ctx.restore();
    }

    function colourFor(role, colorway) {
        var c = colorway.c;
        if (role === 'accent') return c.accent || c.ink;
        if (role === 'muted') return c.muted || c.ink;
        return c.ink;
    }

    // ---------- public render ----------

    function blocksFor(options) {
        var composed = layout.composeInvitation(options.project, options.eventId, { sample: options.sample !== false });
        var blocks = composed.blocks.slice();
        if (composed.qr) blocks.push({ role: 'qr', text: '', script: composed.qr.script, qr: composed.qr });
        return { composed: composed, blocks: blocks };
    }

    function preloadFonts(blocks, lettering) {
        var loads = blocks.filter(function (item) { return item.role !== 'divider' && item.role !== 'qr'; }).map(function (item) {
            return ensureFont(roleStyle(item.role, item.script, lettering), item.text);
        });
        return Promise.all(loads);
    }

    function eventOf(project, eventId) {
        for (var i = 0; i < project.events.length; i += 1) if (project.events[i].id === eventId) return project.events[i];
        return project.events[0] || null;
    }

    // options: { project, eventId, designId, colorwayId, lettering, sizeId, sample }
    // Draws into `canvas`, scaling the logical card size to canvas.width.
    function renderInvitation(canvas, options) {
        var size = SIZES[options.sizeId] || SIZES.portrait;
        var token = (canvas.__wuWeddingToken || 0) + 1;
        canvas.__wuWeddingToken = token;
        var event = eventOf(options.project, options.eventId) || { type: 'nikah' };
        var prepared = blocksFor(options);
        var design = designs.getDesign(options.designId) || designs.getDesign(designs.defaultDesignFor(event.type));
        var lettering = options.lettering || event.lettering || design.lettering;
        var qrBlock = prepared.blocks.filter(function (item) { return item.role === 'qr'; })[0];

        return Promise.all([
            loadArt(design.id, options.colorwayId || event.designColorway, event.type, size.w, size.h),
            preloadFonts(prepared.blocks, lettering),
            qrBlock ? loadQr(qrBlock.qr.url, '#1f1f1f') : Promise.resolve(null)
        ]).then(function (results) {
            if (canvas.__wuWeddingToken !== token) return null;
            var art = results[0];
            var qrCanvas = results[2];
            var colorway = art.colorway;
            var ctx = canvas.getContext('2d');
            var scale = canvas.width / size.w;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.setTransform(scale, 0, 0, scale, 0, 0);
            if (art.img) ctx.drawImage(art.img, 0, 0, size.w, size.h);
            else { ctx.fillStyle = colorway.c.bg1 || colorway.c.bg || '#fffaf1'; ctx.fillRect(0, 0, size.w, size.h); }

            var safe = art.safe;
            var unit = size.w / 1080;
            var fit = 1;
            var measured = measureBlocks(ctx, prepared.blocks, lettering, unit, fit, safe.w);
            // Short invitations grow a little to fill the frame; long ones shrink until they fit.
            if (measured.total < safe.h * 0.78) {
                fit = Math.min(1.3, Math.sqrt((safe.h * 0.86) / measured.total));
                measured = measureBlocks(ctx, prepared.blocks, lettering, unit, fit, safe.w);
            }
            for (var attempt = 0; attempt < 18 && measured.total > safe.h; attempt += 1) {
                fit *= Math.max(0.88, Math.min(0.97, Math.sqrt(safe.h / measured.total)));
                measured = measureBlocks(ctx, prepared.blocks, lettering, unit, fit, safe.w);
            }
            var y = safe.y + Math.max(0, (safe.h - measured.total) / 2);
            var cx = safe.x + safe.w / 2;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            measured.items.forEach(function (item) {
                y += item.gap;
                var divColour = colorway.c.frame || colorway.c.accent;
                if (item.block.role === 'divider') {
                    drawDivider(ctx, design.divider, cx, y + item.height / 2, unit * fit, divColour);
                } else if (item.block.role === 'qr') {
                    var box = 150 * unit * fit;
                    if (qrCanvas) {
                        ctx.fillStyle = '#ffffff';
                        var pad = 8 * unit * fit;
                        ctx.fillRect(cx - box / 2 - pad, y - pad, box + pad * 2, box + pad * 2);
                        ctx.drawImage(qrCanvas, cx - box / 2, y, box, box);
                    }
                    var labelStyle = roleStyle('qrLabel', item.block.script, lettering);
                    setFont(ctx, labelStyle, labelStyle[2] * unit * fit, item.block.script);
                    ctx.fillStyle = colourFor(labelStyle[3], colorway);
                    ctx.fillText(item.block.qr.label, cx, y + box + 22 * unit * fit);
                } else {
                    setFont(ctx, item.style, item.size, item.block.script);
                    ctx.fillStyle = colourFor(item.style[3], colorway);
                    item.lines.forEach(function (line, index) {
                        var lineY = y + item.lineHeight * index + item.lineHeight / 2;
                        // Nastaliq glyph mass sits above the em-box middle; nudge it down a little.
                        if (item.style[0] === 'nastaliq') lineY += item.size * 0.12;
                        ctx.fillText(line, cx, lineY);
                    });
                }
                y += item.height;
            });
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
            return { composed: prepared.composed, design: design, colorway: colorway, size: size, fit: fit };
        });
    }

    function exportCanvas(options) {
        var size = SIZES[options.sizeId] || SIZES.portrait;
        var canvas = root.document.createElement('canvas');
        canvas.width = size.w;
        canvas.height = size.h;
        return renderInvitation(canvas, Object.assign({}, options, { sample: false })).then(function (result) {
            return { canvas: canvas, result: result };
        });
    }

    function exportBlob(options, type, quality) {
        return exportCanvas(options).then(function (out) {
            return new Promise(function (resolve, reject) {
                out.canvas.toBlob(function (blob) {
                    if (blob) resolve({ blob: blob, canvas: out.canvas, result: out.result });
                    else reject(new Error('export_failed'));
                }, type || 'image/png', quality);
            });
        });
    }

    root.WriteUrduWeddingCanvas = {
        SIZES: SIZES,
        renderInvitation: renderInvitation,
        exportCanvas: exportCanvas,
        exportBlob: exportBlob,
        loadArt: loadArt
    };
}(typeof window !== 'undefined' ? window : this));
