(function (root, factory) {
    var api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduStylishText = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
    'use strict';

    var STORAGE_KEYS = {
        favorites: 'writeUrdu.stylishText.favorites.v1',
        collections: 'writeUrdu.stylishText.collections.v1',
        recents: 'writeUrdu.stylishText.recents.v1',
        handoff: 'writeUrdu.nameArt.handoff.v1'
    };
    var MAX_GRAPHEMES = 100;
    var BIDI_CONTROLS = /[\u202A-\u202E\u2066-\u2069]/g;
    var ARABIC = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    var LATIN = /[A-Za-z]/;
    var MARKS = /[\u0300-\u036f\u064B-\u065F\u0670]/;

    function graphemes(value) {
        value = String(value == null ? '' : value);
        if (typeof Intl !== 'undefined' && Intl.Segmenter) {
            try { return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value), function (part) { return part.segment; }); } catch (error) { /* fallback */ }
        }
        var result = [], current = '';
        Array.from(value).forEach(function (character) {
            if (!current || MARKS.test(character) || character === '\u200d' || current.charAt(current.length - 1) === '\u200d') current += character;
            else { result.push(current); current = character; }
        });
        if (current) result.push(current);
        return result;
    }

    function normalizeText(value, limit) {
        var cleaned = String(value == null ? '' : value).normalize ? String(value == null ? '' : value).normalize('NFC') : String(value == null ? '' : value);
        cleaned = cleaned.replace(/\r\n?/g, '\n').replace(BIDI_CONTROLS, '').replace(/[\t ]+/g, ' ').replace(/[ \t]*\n[ \t]*/g, '\n').trim();
        var parts = graphemes(cleaned);
        limit = Number.isFinite(Number(limit)) ? Math.max(1, Number(limit)) : MAX_GRAPHEMES;
        var truncated = parts.length > limit;
        return { value: (truncated ? parts.slice(0, limit) : parts).join(''), truncated: truncated, graphemeCount: Math.min(parts.length, limit) };
    }

    function detectScript(value) {
        var text = String(value || ''), hasArabic = ARABIC.test(text), hasLatin = LATIN.test(text), hasNumber = /\d/.test(text);
        if (hasArabic && hasLatin) return 'mixed';
        if (hasArabic) return 'urdu';
        if (hasLatin) return 'latin';
        if (hasNumber) return 'numeric';
        return text.trim() ? 'symbols' : 'empty';
    }

    function segmentRuns(value) {
        var text = String(value || ''), runs = [], current = '', currentKind = null;
        function kind(character) { return ARABIC.test(character) ? 'urdu' : LATIN.test(character) ? 'latin' : /\d/.test(character) ? 'numeric' : 'other'; }
        Array.from(text).forEach(function (character) {
            var next = kind(character);
            if (currentKind !== next && current) { runs.push({ kind: currentKind, text: current }); current = ''; }
            currentKind = next; current += character;
        });
        if (current) runs.push({ kind: currentKind, text: current });
        return runs;
    }

    var boldMap = { A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',L:'𝗟',M:'𝗠',N:'𝗡',O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',V:'𝗩',W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭',a:'𝗮',b:'𝗯',c:'𝗰',d:'𝗱',e:'𝗲',f:'𝗳',g:'𝗴',h:'𝗵',i:'𝗶',j:'𝗷',k:'𝗸',l:'𝗹',m:'𝗺',n:'𝗻',o:'𝗼',p:'𝗽',q:'𝗾',r:'𝗿',s:'𝘀',t:'𝘁',u:'𝘂',v:'𝘃',w:'𝘄',x:'𝘅',y:'𝘆',z:'𝘇' };
    var smallCapsMap = { a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'ꜱ',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ' };
    function mapLatin(value, map) { return Array.from(String(value || '')).map(function (character) { return map[character] || map[character.toLowerCase()] || character; }).join(''); }
    function wordSeparator(value, separator) { return String(value || '').split(/(\s+)/).map(function (part) { return /^\s+$/.test(part) ? part : part ? separator + part + separator : part; }).join(''); }

    // Only insert a kashida between characters that can safely connect in the
    // common Urdu joining model. Never touch punctuation or combining marks.
    var JOIN_FORWARD = 'بتثجحخسشصضطظعغفقكکگلممنهھی';
    var JOIN_BACK = 'ءآأؤإئابتثجحخدذرزسشصضطظعغفقكکگلممنهویے';
    function kashida(value, amount) {
        amount = Math.max(1, Math.min(2, Number(amount) || 1));
        return String(value || '').split(/(\s+)/).map(function (word) {
            if (!word || /^\s+$/.test(word)) return word;
            var chars = Array.from(word), result = '';
            for (var i = 0; i < chars.length; i += 1) {
                result += chars[i];
                var next = chars[i + 1];
                if (next && JOIN_FORWARD.indexOf(chars[i]) >= 0 && JOIN_BACK.indexOf(next) >= 0 && !MARKS.test(chars[i]) && !MARKS.test(next)) result += 'ـ'.repeat(amount);
            }
            return result;
        }).join('');
    }

    var frames = [
        ['minimal', 'Minimal', '', '', 'Works widely'],
        ['royal', 'Royal', '『', '』', 'Works widely'],
        ['hearts', 'Hearts', '♡ ', ' ♡', 'May vary by app'],
        ['islamic', 'Islamic', '☾ ', ' ☽', 'May vary by app'],
        ['gaming', 'Gaming', '『⚡ ', ' ⚡』', 'May vary by app'],
        ['social', 'Social', '✦ ', ' ✦', 'Works widely'],
        ['decorative', 'Decorative', '❖ ', ' ❖', 'May vary by app'],
        ['urdu-english', 'Urdu + English', '《 ', ' 》', 'Works widely'],
        ['kashida', 'Kashida', '', '', 'Best as an image'],
        ['popular', 'Popular', '【 ', ' 】', 'Works widely']
    ];
    var variantMarks = ['','·','•','✧','✦','⁕','⋆','❖'];
    var styles = [];
    frames.forEach(function (frame, frameIndex) {
        for (var variant = 1; variant <= 8; variant += 1) {
            var transform = 'identity';
            if (frame[0] === 'social' && variant % 2 === 0) transform = 'boldLatin';
            if (frame[0] === 'urdu-english' && variant % 2 === 0) transform = 'smallCapsLatin';
            if (frame[0] === 'kashida') transform = variant > 4 ? 'kashidaMedium' : 'kashidaLight';
            if (frame[0] === 'popular' && variant % 3 === 0) transform = 'wordDot';
            styles.push({ id: frame[0] + '-' + String(variant).padStart(2, '0'), name: frame[1] + ' ' + variant, category: frame[0], intensity: variant <= 3 ? 'light' : variant <= 6 ? 'medium' : 'strong', prefix: frame[2], suffix: frame[3] + variantMarks[variant - 1], transform: transform, compatibility: frame[4], featured: frameIndex < 3 || variant === 1, order: frameIndex * 10 + variant });
        }
    });

    function applyTransform(value, transform) {
        if (transform === 'boldLatin') return segmentRuns(value).map(function (run) { return run.kind === 'latin' ? mapLatin(run.text, boldMap) : run.text; }).join('');
        if (transform === 'smallCapsLatin') return segmentRuns(value).map(function (run) { return run.kind === 'latin' ? mapLatin(run.text, smallCapsMap) : run.text; }).join('');
        if (transform === 'wordDot') return wordSeparator(value, '·');
        if (transform === 'wordStar') return wordSeparator(value, '✦');
        if (transform === 'kashidaLight') return kashida(value, 1);
        if (transform === 'kashidaMedium') return kashida(value, 2);
        return value;
    }

    function styleSupports(style, script) {
        // Latin-only maps safely leave Arabic-script runs untouched; keeping
        // those variants visible gives Urdu users the same full catalog while
        // mixed-script users still benefit from the map on their Latin runs.
        return true;
    }
    function generateStyles(input, options) {
        options = options || {};
        var normalized = normalizeText(input), text = normalized.value, script = detectScript(text), category = options.category || 'all', intensity = options.intensity || 'all', query = String(options.query || '').toLowerCase();
        var offset = Math.max(0, Number(options.offset) || 0), limit = Math.max(1, Number(options.limit) || 24), seen = {}, all = [];
        styles.filter(function (style) {
            if (category !== 'all' && category !== 'popular' && style.category !== category && !(category === 'popular' && style.featured)) return false;
            if (intensity !== 'all' && style.intensity !== intensity) return false;
            if (query && (style.name + ' ' + style.category + ' ' + style.compatibility).toLowerCase().indexOf(query) < 0) return false;
            return styleSupports(style, script);
        }).sort(function (a, b) { return (b.featured - a.featured) || (a.order - b.order); }).forEach(function (style) {
            var output = style.prefix + applyTransform(text, style.transform) + style.suffix;
            if (!output || seen[output]) return;
            seen[output] = true;
            all.push({ id: style.id, name: style.name, category: style.category, intensity: style.intensity, compatibility: style.compatibility, featured: style.featured, input: text, output: output, script: script });
        });
        return { items: all.slice(offset, offset + limit), total: all.length, hasMore: offset + limit < all.length, normalized: normalized, script: script };
    }

    function createHandoff(text) {
        var normalized = normalizeText(text);
        return { version: 1, text: normalized.value, source: 'stylish-urdu-text-generator', createdAt: new Date().toISOString() };
    }
    return { MAX_GRAPHEMES: MAX_GRAPHEMES, STORAGE_KEYS: STORAGE_KEYS, STYLE_DEFINITIONS: styles, graphemes: graphemes, normalizeText: normalizeText, detectScript: detectScript, segmentRuns: segmentRuns, kashida: kashida, applyTransform: applyTransform, generateStyles: generateStyles, createHandoff: createHandoff };
}));
