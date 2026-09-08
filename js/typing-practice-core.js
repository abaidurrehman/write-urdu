(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.WriteUrduTypingPracticeCore = api;
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    var BIDI_CONTROLS = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g;

    var BASE_MAP = Object.freeze({
        '`': '`',
        '1': '۱', '2': '۲', '3': '۳', '4': '۴', '5': '۵',
        '6': '۶', '7': '۷', '8': '۸', '9': '۹', '0': '۰',
        '-': '-', '=': '=',
        'q': 'ق', 'w': 'و', 'e': 'ع', 'r': 'ر', 't': 'ت',
        'y': 'ے', 'u': 'ء', 'i': 'ی', 'o': 'ہ', 'p': 'پ',
        '[': '[', ']': ']', '\\': '\\',
        'a': 'ا', 's': 'س', 'd': 'د', 'f': 'ف', 'g': 'گ',
        'h': 'ح', 'j': 'ج', 'k': 'ک', 'l': 'ل', ';': '؛', "'": "'",
        'z': 'ز', 'x': 'ش', 'c': 'چ', 'v': 'ط', 'b': 'ب',
        'n': 'ن', 'm': 'م', ',': '،', '.': '۔', '/': '/'
    });

    var SHIFT_MAP = Object.freeze({
        '~': 'ً',
        '!': '1', '@': '2', '#': '3', '$': '4', '%': '5',
        '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
        '_': '_', '+': '+',
        'Q': 'ْ', 'W': 'ّ', 'E': 'ٰ', 'R': 'ڑ', 'T': 'ٹ',
        'Y': 'َ', 'U': 'ئ', 'I': 'ِ', 'O': 'ۃ', 'P': 'ُ',
        '{': '{', '}': '}', '|': '|',
        'A': 'آ', 'S': 'ص', 'D': 'ڈ', 'G': 'غ', 'H': 'ھ',
        'J': 'ض', 'K': 'خ', ':': ':', '"': '"',
        'Z': 'ذ', 'X': 'ژ', 'C': 'ث', 'V': 'ظ', 'N': 'ں',
        '>': '٫', '?': '؟'
    });

    var segmenter = typeof Intl !== 'undefined' && Intl.Segmenter
        ? new Intl.Segmenter('ur', { granularity: 'grapheme' })
        : null;

    function normalizeText(value) {
        return String(value == null ? '' : value)
            .replace(BIDI_CONTROLS, '')
            .replace(/\u00a0/g, ' ')
            .normalize('NFC');
    }

    function graphemes(value) {
        var text = normalizeText(value);
        if (!segmenter) return Array.from(text);
        return Array.from(segmenter.segment(text), function (item) { return item.segment; });
    }

    function mapKey(key) {
        if (key === ' ') return ' ';
        if (Object.prototype.hasOwnProperty.call(BASE_MAP, key)) return BASE_MAP[key];
        if (Object.prototype.hasOwnProperty.call(SHIFT_MAP, key)) return SHIFT_MAP[key];
        return null;
    }

    function measure(targetValue, typedValue, elapsedSeconds) {
        var target = graphemes(targetValue);
        var typed = graphemes(typedValue);
        var correct = 0;
        var errors = 0;

        for (var i = 0; i < typed.length; i += 1) {
            if (i < target.length && typed[i] === target[i]) correct += 1;
            else errors += 1;
        }

        var elapsed = Math.max(Number(elapsedSeconds) || 0, 0.01);
        var wpm = typed.length ? Math.max(0, Math.round((correct / 5) / (elapsed / 60))) : 0;
        var accuracy = typed.length ? Math.max(0, Math.min(100, Math.round((correct / typed.length) * 100))) : 100;
        var progress = target.length ? Math.max(0, Math.min(100, Math.round((Math.min(typed.length, target.length) / target.length) * 100))) : 0;

        return {
            correct: correct,
            errors: errors,
            typed: typed.length,
            target: target.length,
            wpm: wpm,
            accuracy: accuracy,
            progress: progress
        };
    }

    function buildTimedTarget(sentences, seconds) {
        var source = Array.isArray(sentences) ? sentences.map(normalizeText).filter(Boolean) : [];
        if (!source.length) return '';
        var duration = Math.max(60, Math.min(300, Number(seconds) || 60));
        var desired = Math.max(1600, Math.ceil((duration / 60) * 900));
        var parts = [];
        var length = 0;
        var index = 0;

        while (length < desired && parts.length < 250) {
            var sentence = source[index % source.length];
            parts.push(sentence);
            length += sentence.length + 1;
            index += 1;
        }
        return parts.join(' ');
    }

    return Object.freeze({
        BASE_MAP: BASE_MAP,
        SHIFT_MAP: SHIFT_MAP,
        normalizeText: normalizeText,
        graphemes: graphemes,
        mapKey: mapKey,
        measure: measure,
        buildTimedTarget: buildTimedTarget
    });
}));
