(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduDictionaryCore = api;
}(typeof window !== 'undefined' ? window : null, function () {
    'use strict';

    var MAX_TERM_CHARS = 100;
    var DIRECTIONS = Object.freeze({
        'en-ur': Object.freeze({
            key: 'en-ur', from: 'en', to: 'ur', inputDir: 'ltr', resultDir: 'rtl',
            label: 'English word or short phrase', placeholder: 'Type an English word, for example work',
            resultLabel: 'Urdu meanings & alternatives'
        }),
        'ur-en': Object.freeze({
            key: 'ur-en', from: 'ur', to: 'en', inputDir: 'rtl', resultDir: 'ltr',
            label: 'Urdu word or short phrase', placeholder: 'اردو لفظ لکھیں، مثلاً کام',
            resultLabel: 'English meanings & alternatives'
        })
    });

    function direction(key) {
        return DIRECTIONS[String(key || '').toLowerCase()] || DIRECTIONS['en-ur'];
    }

    function cleanTerm(value) {
        return String(value == null ? '' : value).replace(/\u0000/g, '').trim();
    }

    function validateTerm(value) {
        var term = cleanTerm(value);
        if (!term) return { ok: false, error: 'empty_term' };
        if (term.length > MAX_TERM_CHARS) return { ok: false, error: 'term_too_long' };
        return { ok: true, term: term };
    }

    function buildRequest(directionKey, value) {
        var checked = validateTerm(value);
        if (!checked.ok) return checked;
        var config = direction(directionKey);
        return {
            ok: true,
            body: { version: 1, from: config.from, to: config.to, term: checked.term }
        };
    }

    function confidencePercent(value) {
        var number = Number(value);
        if (!Number.isFinite(number) || number < 0 || number > 1) return null;
        return Math.round(number * 100);
    }

    function friendlyError(code) {
        if (code === 'dictionary_not_enabled') return 'Dictionary lookup is not enabled yet.';
        if (code === 'dictionary_not_configured') return 'Dictionary lookup is not configured yet.';
        if (code === 'dictionary_rate_limited') return 'Dictionary lookup is busy right now. Try again shortly.';
        if (code === 'dictionary_timeout') return 'Dictionary lookup took too long. Try again.';
        if (code === 'invalid_term') return 'Use one word or a short phrase of 100 characters or fewer.';
        if (code === 'unsupported_language_pair') return 'This preview currently supports only Urdu and English.';
        return 'Dictionary lookup is unavailable right now. Try again later.';
    }

    return {
        MAX_TERM_CHARS: MAX_TERM_CHARS,
        direction: direction,
        cleanTerm: cleanTerm,
        validateTerm: validateTerm,
        buildRequest: buildRequest,
        confidencePercent: confidencePercent,
        friendlyError: friendlyError
    };
}));
