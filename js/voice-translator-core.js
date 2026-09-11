(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduVoiceTranslatorCore = api;
}(typeof window !== 'undefined' ? window : null, function () {
    'use strict';

    var MAX_TEXT_CHARS = 5000;
    var DIRECTIONS = Object.freeze({
        'ur-en': Object.freeze({
            key: 'ur-en',
            from: 'ur',
            to: 'en',
            recognitionLang: 'ur-PK',
            sourceDir: 'rtl',
            resultDir: 'ltr',
            sourceLabel: 'Urdu transcript',
            resultLabel: 'English translation',
            startLabel: 'Speak Urdu',
            translateLabel: 'Translate to English'
        }),
        'en-ur': Object.freeze({
            key: 'en-ur',
            from: 'en',
            to: 'ur',
            recognitionLang: 'en-US',
            sourceDir: 'ltr',
            resultDir: 'rtl',
            sourceLabel: 'English transcript',
            resultLabel: 'Urdu translation',
            startLabel: 'Speak English',
            translateLabel: 'Translate to Urdu'
        })
    });

    function getDirection(key) {
        return DIRECTIONS[String(key || '').toLowerCase()] || DIRECTIONS['ur-en'];
    }

    function cleanText(value) {
        return String(value == null ? '' : value).replace(/\u0000/g, '').trim();
    }

    function appendTranscript(existing, phrase) {
        var left = cleanText(existing);
        var right = cleanText(phrase);
        if (!right) return left;
        return left ? left + ' ' + right : right;
    }

    function validateSource(text) {
        var clean = cleanText(text);
        if (!clean) return { ok: false, error: 'empty_text' };
        if (clean.length > MAX_TEXT_CHARS) return { ok: false, error: 'text_too_long' };
        return { ok: true, text: clean };
    }

    function buildTranslationRequest(directionKey, text) {
        var direction = getDirection(directionKey);
        var valid = validateSource(text);
        if (!valid.ok) return valid;
        return {
            ok: true,
            body: {
                version: 1,
                from: direction.from,
                to: direction.to,
                text: valid.text
            }
        };
    }

    function friendlyTranslationError(code) {
        if (code === 'translation_service_not_enabled') return 'Translation is not enabled on this preview yet.';
        if (code === 'translation_rate_limited') return 'Translation is busy right now. Try again shortly.';
        if (code === 'translation_timeout') return 'Translation took too long. Try again.';
        if (code === 'translation_invalid_response') return 'The translation service returned an unexpected response.';
        if (code === 'text_too_large') return 'Shorten the transcript to 5,000 characters or fewer.';
        if (code === 'unsupported_direction') return 'That translation direction is not supported.';
        return 'Translation is unavailable right now. Your transcript is still here.';
    }

    function friendlyVoiceError(category) {
        if (category === 'permission-denied') return 'Microphone access was blocked. Allow microphone access in your browser settings and try again.';
        if (category === 'audio-capture') return 'No microphone was available. Check your microphone and try again.';
        if (category === 'no-speech') return 'No speech was detected. Try again and begin speaking after Listening appears.';
        if (category === 'network') return 'Voice recognition could not connect. Check your connection and try again.';
        if (category === 'language-not-supported') return 'Voice recognition for this language is not available in this browser.';
        if (category === 'start-failed') return 'Voice recognition could not start yet. Try again.';
        if (category === 'aborted') return 'Voice recognition stopped.';
        return 'Voice recognition could not continue. You can still type the source text manually.';
    }

    return {
        MAX_TEXT_CHARS: MAX_TEXT_CHARS,
        DIRECTIONS: DIRECTIONS,
        getDirection: getDirection,
        cleanText: cleanText,
        appendTranscript: appendTranscript,
        validateSource: validateSource,
        buildTranslationRequest: buildTranslationRequest,
        friendlyTranslationError: friendlyTranslationError,
        friendlyVoiceError: friendlyVoiceError
    };
}));
