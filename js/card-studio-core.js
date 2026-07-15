(function (root, factory) {
    var api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.WriteUrduCardStudio = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
    'use strict';

    var PRESETS = [
        { id: 'square', name: 'Square Post', width: 1080, height: 1080, marginX: 96, marginY: 96 },
        { id: 'landscape', name: 'Landscape Post', width: 1280, height: 720, marginX: 110, marginY: 70 },
        { id: 'facebook', name: 'Wide Social Post', width: 1200, height: 630, marginX: 96, marginY: 70 },
        { id: 'story', name: 'Story / Status', width: 1080, height: 1920, marginX: 100, marginY: 170 }
    ];

    var GRADIENTS = [
        { id: 'midnight-blue', name: 'Midnight Blue', angle: 135, stops: [{ offset: 0, color: '#0f172a' }, { offset: 1, color: '#1e3a5f' }] },
        { id: 'emerald-night', name: 'Emerald Night', angle: 135, stops: [{ offset: 0, color: '#082c1d' }, { offset: 1, color: '#1c8152' }] },
        { id: 'rose-dawn', name: 'Rose Dawn', angle: 135, stops: [{ offset: 0, color: '#7f1d4f' }, { offset: 1, color: '#f59e9e' }] },
        { id: 'saffron', name: 'Saffron', angle: 135, stops: [{ offset: 0, color: '#78350f' }, { offset: 1, color: '#f59e0b' }] },
        { id: 'indigo', name: 'Indigo', angle: 135, stops: [{ offset: 0, color: '#312e81' }, { offset: 1, color: '#6366f1' }] },
        { id: 'ocean', name: 'Ocean', angle: 135, stops: [{ offset: 0, color: '#164e63' }, { offset: 1, color: '#22d3ee' }] },
        { id: 'plum', name: 'Plum', angle: 135, stops: [{ offset: 0, color: '#3b0764' }, { offset: 1, color: '#a855f7' }] },
        { id: 'slate', name: 'Slate', angle: 135, stops: [{ offset: 0, color: '#1f2937' }, { offset: 1, color: '#64748b' }] }
    ];

    var TEMPLATES = [
        {
            id: 'classic-nastaliq', name: 'Classic Nastaliq', fontFamily: 'Noto Nastaliq Urdu', textColor: '#1f2937', attributionColor: '#64748b',
            textAlign: 'center', verticalAlign: 'center', fontSizeRatio: .06, lineHeight: 1.8, background: { type: 'solid', color: '#fbf7ef' },
            decoration: { border: { enabled: true, color: 'rgba(91,65,39,.28)' }, accent: '#b77935' }, watermark: { enabled: true, position: 'bottom-left' }
        },
        {
            id: 'midnight', name: 'Midnight', fontFamily: 'Noto Naskh Arabic', textColor: '#f8fafc', attributionColor: '#cbd5e1',
            textAlign: 'center', verticalAlign: 'center', fontSizeRatio: .058, lineHeight: 1.65, background: { type: 'gradient', gradientId: 'midnight-blue' },
            decoration: { border: { enabled: true, color: 'rgba(255,255,255,.28)' }, accent: '#93c5fd' }, watermark: { enabled: true, position: 'bottom-left' }
        },
        {
            id: 'minimal-white', name: 'Minimal White', fontFamily: 'Noto Naskh Arabic', textColor: '#172a21', attributionColor: '#607269',
            textAlign: 'right', verticalAlign: 'center', fontSizeRatio: .055, lineHeight: 1.5, background: { type: 'solid', color: '#ffffff' },
            decoration: { border: { enabled: false }, accent: '#1c8152' }, watermark: { enabled: true, position: 'bottom-right' }
        },
        {
            id: 'emerald', name: 'Emerald', fontFamily: 'Noto Nastaliq Urdu', textColor: '#fffdf2', attributionColor: '#d7f7e4',
            textAlign: 'center', verticalAlign: 'center', fontSizeRatio: .06, lineHeight: 1.8, background: { type: 'gradient', gradientId: 'emerald-night' },
            decoration: { border: { enabled: true, color: 'rgba(224,255,237,.35)' }, accent: '#d8f36a' }, watermark: { enabled: true, position: 'bottom-left' }
        },
        {
            id: 'paper', name: 'Paper', fontFamily: 'Noto Nastaliq Urdu', textColor: '#3d2b1f', attributionColor: '#765b46',
            textAlign: 'right', verticalAlign: 'center', fontSizeRatio: .058, lineHeight: 1.8, background: { type: 'solid', color: '#f5ead7' },
            decoration: { border: { enabled: true, color: 'rgba(96,64,31,.25)' }, accent: '#a66a36' }, watermark: { enabled: true, position: 'bottom-left' }
        },
        {
            id: 'photo-quote', name: 'Photo Quote', fontFamily: 'Noto Naskh Arabic', textColor: '#ffffff', attributionColor: '#f8fafc',
            textAlign: 'center', verticalAlign: 'bottom', fontSizeRatio: .055, lineHeight: 1.6, background: { type: 'solid', color: '#263238' },
            decoration: { border: { enabled: false }, accent: '#ffffff' }, watermark: { enabled: true, position: 'bottom-right' },
            imageOverlay: { color: '#000000', opacity: .42 }
        },
        {
            id: 'sunflower-bloom', name: 'Sunflower Bloom', fontFamily: 'Noto Nastaliq Urdu', textColor: '#26382b', attributionColor: '#607052',
            textAlign: 'center', verticalAlign: 'center', fontSizeRatio: .055, lineHeight: 1.8, background: { type: 'solid', color: '#fffdf4' },
            decoration: { border: { enabled: true, color: 'rgba(177,126,22,.26)' }, accent: '#d7a51a', motif: 'sunflower' }, watermark: { enabled: true, position: 'bottom-left' }
        },
        {
            id: 'golden-mandala', name: 'Golden Mandala', fontFamily: 'Noto Naskh Arabic', textColor: '#2d2414', attributionColor: '#695329',
            textAlign: 'center', verticalAlign: 'center', fontSizeRatio: .052, lineHeight: 1.65, background: { type: 'solid', color: '#f5c84b' },
            decoration: { border: { enabled: true, color: 'rgba(64,44,14,.36)' }, accent: '#3f2e14', motif: 'mandala' }, watermark: { enabled: true, position: 'bottom-right' }
        },
        {
            id: 'botanical-frame', name: 'Botanical Frame', fontFamily: 'Noto Nastaliq Urdu', textColor: '#1d3b2a', attributionColor: '#55705d',
            textAlign: 'right', verticalAlign: 'center', fontSizeRatio: .052, lineHeight: 1.8, background: { type: 'solid', color: '#f5f2e8' },
            decoration: { border: { enabled: true, color: 'rgba(35,93,58,.30)' }, accent: '#277044', motif: 'botanical' }, watermark: { enabled: true, position: 'bottom-left' }
        }
    ];

    var DEFAULT_TEXT = 'یہاں اپنا اردو متن لکھیں۔';

    function findById(items, id) {
        return items.find(function (item) { return item.id === id; }) || items[0];
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function createDefaultCardProject(incomingText) {
        var template = TEMPLATES[0];
        var now = new Date().toISOString();
        return {
            version: 1, id: 'card_' + Date.now().toString(36), name: 'Untitled card', createdAt: now, updatedAt: now,
            presetId: 'square', templateId: template.id,
            text: { value: String(incomingText || '').trim() || DEFAULT_TEXT, fontFamily: template.fontFamily, fontMode: 'auto', fontSize: 64, minFontSize: 28, maxFontSize: 160, color: template.textColor, align: template.textAlign, verticalAlign: template.verticalAlign, lineHeight: template.lineHeight, shadow: 'none' },
            attribution: { enabled: false, value: '', fontFamily: 'Noto Naskh Arabic', fontSizeRatio: .44, color: template.attributionColor },
            background: { type: template.background.type, color: template.background.color || '#ffffff', gradientId: template.background.gradientId || null, imageAssetId: null, fit: 'cover', positionX: .5, positionY: .5, overlayColor: (template.imageOverlay && template.imageOverlay.color) || '#000000', overlayOpacity: (template.imageOverlay && template.imageOverlay.opacity) || 0, blur: 0 },
            watermark: clone(template.watermark)
        };
    }

    function normalizeCardProject(raw) {
        var base = createDefaultCardProject('');
        raw = raw && typeof raw === 'object' ? raw : {};
        var project = Object.assign(base, raw);
        project.version = 1;
        project.presetId = findById(PRESETS, project.presetId).id;
        project.templateId = findById(TEMPLATES, project.templateId).id;
        project.text = Object.assign(base.text, raw.text || {});
        project.attribution = Object.assign(base.attribution, raw.attribution || {});
        project.background = Object.assign(base.background, raw.background || {});
        project.watermark = Object.assign(base.watermark, raw.watermark || {});
        project.text.value = String(project.text.value == null ? DEFAULT_TEXT : project.text.value);
        project.text.fontMode = project.text.fontMode === 'manual' ? 'manual' : 'auto';
        project.text.fontSize = clampNumber(project.text.fontSize, 12, 240, 64);
        project.text.minFontSize = clampNumber(project.text.minFontSize, 12, 120, 28);
        project.text.maxFontSize = clampNumber(project.text.maxFontSize, project.text.minFontSize, 240, 160);
        project.text.lineHeight = clampNumber(project.text.lineHeight, 1.2, 2.2, 1.7);
        project.text.align = ['left', 'center', 'right'].includes(project.text.align) ? project.text.align : 'center';
        project.text.verticalAlign = ['top', 'center', 'bottom'].includes(project.text.verticalAlign) ? project.text.verticalAlign : 'center';
        project.background.type = ['solid', 'gradient', 'image'].includes(project.background.type) ? project.background.type : 'solid';
        project.background.fit = project.background.fit === 'contain' ? 'contain' : 'cover';
        project.background.positionX = clampNumber(project.background.positionX, 0, 1, .5);
        project.background.positionY = clampNumber(project.background.positionY, 0, 1, .5);
        project.background.overlayOpacity = clampNumber(project.background.overlayOpacity, 0, .8, 0);
        project.background.blur = clampNumber(project.background.blur, 0, 16, 0);
        return project;
    }

    function clampNumber(value, min, max, fallback) {
        value = Number(value);
        return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
    }

    function applyTemplate(project, templateId) {
        project = normalizeCardProject(project);
        var template = findById(TEMPLATES, templateId);
        project.templateId = template.id;
        project.text.fontFamily = template.fontFamily;
        project.text.color = template.textColor;
        project.text.align = template.textAlign;
        project.text.verticalAlign = template.verticalAlign;
        project.text.lineHeight = template.lineHeight;
        project.background.type = template.background.type;
        project.background.color = template.background.color || project.background.color;
        project.background.gradientId = template.background.gradientId || null;
        project.background.overlayColor = (template.imageOverlay && template.imageOverlay.color) || '#000000';
        project.background.overlayOpacity = (template.imageOverlay && template.imageOverlay.opacity) || 0;
        project.watermark = clone(template.watermark);
        project.updatedAt = new Date().toISOString();
        return project;
    }

    function applyPreset(project, presetId) {
        project = normalizeCardProject(project);
        project.presetId = findById(PRESETS, presetId).id;
        project.updatedAt = new Date().toISOString();
        return project;
    }

    function normalizeLines(text) {
        return String(text == null ? '' : text).replace(/\r\n?/g, '\n').split('\n');
    }

    function wrapRtlText(ctx, text, maxWidth, options) {
        options = options || {};
        var lines = [];
        normalizeLines(text).forEach(function (paragraph, paragraphIndex) {
            if (!paragraph) {
                lines.push({ text: '', width: 0, paragraphIndex: paragraphIndex, isParagraphEnd: true, isBlank: true });
                return;
            }
            var words = paragraph.trim().split(/\s+/).filter(Boolean);
            var current = '';
            function pushCurrent(isEnd) {
                if (!current) return;
                lines.push({ text: current, width: ctx.measureText(current).width, paragraphIndex: paragraphIndex, isParagraphEnd: !!isEnd });
                current = '';
            }
            words.forEach(function (word) {
                var candidate = current ? current + ' ' + word : word;
                if (ctx.measureText(candidate).width <= maxWidth || !current) {
                    if (!current && ctx.measureText(word).width > maxWidth) {
                        var chunk = '';
                        Array.from(word).forEach(function (character) {
                            var next = chunk + character;
                            if (chunk && ctx.measureText(next).width > maxWidth) {
                                lines.push({ text: chunk, width: ctx.measureText(chunk).width, paragraphIndex: paragraphIndex, isParagraphEnd: false });
                                chunk = character;
                            } else chunk = next;
                        });
                        current = chunk;
                    } else current = candidate;
                } else {
                    pushCurrent(false);
                    current = word;
                }
            });
            pushCurrent(true);
        });
        return lines;
    }

    function layoutCardText(ctx, project, box) {
        var text = project.text || {};
        var size = Number(text.fontSize) || 64;
        ctx.font = size + 'px "' + (text.fontFamily || 'Noto Nastaliq Urdu') + '"';
        ctx.direction = 'rtl';
        ctx.textBaseline = 'alphabetic';
        var lines = wrapRtlText(ctx, text.value, box.width, {});
        var lineHeight = size * (Number(text.lineHeight) || 1.7);
        var paragraphGap = lineHeight * .22;
        var height = lines.reduce(function (total, line, index) {
            return total + lineHeight + (index && lines[index - 1].isParagraphEnd ? paragraphGap : 0);
        }, 0);
        var attribution = project.attribution && project.attribution.enabled && String(project.attribution.value || '').trim();
        var attributionSize = Math.max(16, Math.round(size * ((project.attribution && project.attribution.fontSizeRatio) || .44)));
        if (attribution) height += attributionSize * 1.45 + lineHeight * .35;
        return { lines: lines, width: box.width, height: height, lineHeight: lineHeight, fontSize: size, attribution: attribution ? String(project.attribution.value).trim() : '', attributionSize: attributionSize, overflow: height > box.height };
    }

    function findBestFontSize(ctx, project, box) {
        var text = project.text || {};
        var low = Number(text.minFontSize) || 28;
        var high = Number(text.maxFontSize) || 160;
        var best = low;
        while (low <= high) {
            var size = Math.floor((low + high) / 2);
            var candidate = Object.assign({}, project, { text: Object.assign({}, text, { fontSize: size }) });
            var layout = layoutCardText(ctx, candidate, box);
            if (layout.height <= box.height) { best = size; low = size + 1; } else high = size - 1;
        }
        var finalProject = Object.assign({}, project, { text: Object.assign({}, text, { fontSize: best }) });
        var result = layoutCardText(ctx, finalProject, box);
        result.fontSize = best;
        result.overflow = result.height > box.height;
        return result;
    }

    function calculateImagePlacement(imageSize, canvasSize, fit, positionX, positionY) {
        var iw = Number(imageSize.width), ih = Number(imageSize.height), cw = Number(canvasSize.width), ch = Number(canvasSize.height);
        if (!(iw > 0 && ih > 0 && cw > 0 && ch > 0)) return { x: 0, y: 0, width: 0, height: 0, scale: 1 };
        var scale = fit === 'contain' ? Math.min(cw / iw, ch / ih) : Math.max(cw / iw, ch / ih);
        var width = iw * scale, height = ih * scale;
        var x = (cw - width) * clampNumber(positionX, 0, 1, .5);
        var y = (ch - height) * clampNumber(positionY, 0, 1, .5);
        return { x: x, y: y, width: width, height: height, scale: scale };
    }

    function safeFilename(title, fallback) {
        var value = String(title || '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '-').replace(/\s+/g, ' ').trim().replace(/^[-.]+|[-.]+$/g, '').slice(0, 80);
        return value || fallback || 'write-urdu-card';
    }

    function validateCardProject(project) {
        project = normalizeCardProject(project);
        return { valid: Boolean(project.text.value.trim()), project: project, errors: project.text.value.trim() ? [] : ['Text is empty.'] };
    }

    return { PRESETS: PRESETS, GRADIENTS: GRADIENTS, TEMPLATES: TEMPLATES, DEFAULT_TEXT: DEFAULT_TEXT, createDefaultCardProject: createDefaultCardProject, normalizeCardProject: normalizeCardProject, applyTemplate: applyTemplate, applyPreset: applyPreset, wrapRtlText: wrapRtlText, layoutCardText: layoutCardText, findBestFontSize: findBestFontSize, calculateImagePlacement: calculateImagePlacement, safeFilename: safeFilename, validateCardProject: validateCardProject };
}));
