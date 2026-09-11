(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduAudioTranscriptionCore = api;
}(typeof window !== 'undefined' ? window : null, function () {
    'use strict';

    var MAX_FILE_BYTES = 6 * 1024 * 1024;
    var MAX_DURATION_SECONDS = 5 * 60;
    var LANGUAGES = Object.freeze({
        ur: Object.freeze({ code: 'ur', label: 'Urdu', transcriptDir: 'rtl', translateTo: 'en', translateLabel: 'Translate to English' }),
        en: Object.freeze({ code: 'en', label: 'English', transcriptDir: 'ltr', translateTo: 'ur', translateLabel: 'Translate to Urdu' })
    });
    var EXTENSION_TYPES = Object.freeze({
        mp3: 'audio/mpeg',
        m4a: 'audio/mp4',
        mp4: 'audio/mp4',
        wav: 'audio/wav',
        webm: 'audio/webm',
        ogg: 'audio/ogg',
        aac: 'audio/aac'
    });
    var ALLOWED_TYPES = Object.freeze([
        'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a',
        'audio/wav', 'audio/x-wav', 'audio/webm', 'audio/ogg', 'audio/aac'
    ]);

    function language(value) {
        return LANGUAGES[String(value || '').toLowerCase()] || LANGUAGES.ur;
    }

    function cleanText(value) {
        return String(value || '').replace(/\u0000/g, '').trim();
    }

    function extension(name) {
        var match = String(name || '').toLowerCase().match(/\.([a-z0-9]+)$/);
        return match ? match[1] : '';
    }

    function contentType(file) {
        var declared = String(file && file.type || '').split(';', 1)[0].trim().toLowerCase();
        if (ALLOWED_TYPES.indexOf(declared) >= 0) return declared;
        return EXTENSION_TYPES[extension(file && file.name)] || null;
    }

    function validateFile(file, durationSeconds) {
        if (!file) return { ok: false, error: 'no_file' };
        var type = contentType(file);
        if (!type) return { ok: false, error: 'unsupported_audio_type' };
        if (!Number.isFinite(Number(file.size)) || Number(file.size) <= 0) return { ok: false, error: 'empty_audio' };
        if (Number(file.size) > MAX_FILE_BYTES) return { ok: false, error: 'audio_too_large' };
        if (durationSeconds != null) {
            var duration = Number(durationSeconds);
            if (!Number.isFinite(duration) || duration <= 0) return { ok: false, error: 'audio_metadata_unavailable' };
            if (duration > MAX_DURATION_SECONDS) return { ok: false, error: 'audio_too_long' };
        }
        return { ok: true, contentType: type };
    }

    function transcriptionUrl(languageCode) {
        return '/api/audio-transcribe?language=' + encodeURIComponent(language(languageCode).code);
    }

    function buildTranslationRequest(languageCode, transcript) {
        var config = language(languageCode);
        var text = cleanText(transcript);
        if (!text) return { ok: false, error: 'empty_text' };
        if (text.length > 5000) return { ok: false, error: 'text_too_long' };
        return {
            ok: true,
            body: { version: 1, from: config.code, to: config.translateTo, text: text }
        };
    }

    function friendlyTranscriptionError(code) {
        var messages = {
            audio_transcription_not_enabled: 'Audio transcription is not enabled yet.',
            unsupported_language: 'Choose Urdu or English before transcribing.',
            unsupported_audio_type: 'Use MP3, M4A, WAV, WebM, OGG or AAC audio.',
            audio_too_large: 'This audio file is too large for the preview.',
            empty_audio: 'The selected audio file is empty.',
            transcription_invalid_response: 'The audio was processed but no usable transcript was returned.',
            transcription_unavailable: 'Audio transcription is unavailable right now. Try again later.'
        };
        return messages[String(code || '')] || messages.transcription_unavailable;
    }

    function friendlyFileError(code) {
        var messages = {
            no_file: 'Choose an audio file first.',
            unsupported_audio_type: 'Use MP3, M4A, WAV, WebM, OGG or AAC audio.',
            empty_audio: 'The selected audio file is empty.',
            audio_too_large: 'Keep the audio file under 6 MB for this preview.',
            audio_too_long: 'Keep the voice note to 5 minutes or less for this preview.',
            audio_metadata_unavailable: 'This browser could not read the audio duration. Try another supported audio file.'
        };
        return messages[String(code || '')] || 'Choose another audio file and try again.';
    }

    return {
        MAX_FILE_BYTES: MAX_FILE_BYTES,
        MAX_DURATION_SECONDS: MAX_DURATION_SECONDS,
        ALLOWED_TYPES: ALLOWED_TYPES,
        language: language,
        cleanText: cleanText,
        contentType: contentType,
        validateFile: validateFile,
        transcriptionUrl: transcriptionUrl,
        buildTranslationRequest: buildTranslationRequest,
        friendlyTranscriptionError: friendlyTranscriptionError,
        friendlyFileError: friendlyFileError
    };
}));
