(function (root, factory) {
    'use strict';
    var api = factory(root);
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduDocumentTranslator = api;
}(typeof window !== 'undefined' ? window : null, function (root) {
    'use strict';

    var MAX_SOURCE_CHARS = 12000;
    var MAX_FILE_BYTES = 65536;

    function normalizeText(value) {
        return String(value || '').replace(/\r\n?/g, '\n').replace(/\u0000/g, '').trim();
    }

    function validateSource(value) {
        var text = normalizeText(value);
        if (!text) return { ok: false, error: 'empty_text', text: '' };
        if (text.length > MAX_SOURCE_CHARS) return { ok: false, error: 'text_too_long', text: text };
        return { ok: true, error: null, text: text };
    }

    function isTextFile(file) {
        if (!file) return false;
        var name = String(file.name || '').toLowerCase();
        var type = String(file.type || '').toLowerCase();
        return name.endsWith('.txt') || type === 'text/plain';
    }

    function friendlyError(code) {
        var messages = {
            empty_text: 'Paste some English text or choose a .txt file first.',
            text_too_long: 'This preview supports up to 12,000 characters at a time.',
            unsupported_file: 'For this first preview, choose a plain .txt file.',
            file_too_large: 'This preview accepts .txt files up to 64 KB.',
            translation_service_not_configured: 'Translation is not enabled on the production service yet.',
            translation_unavailable: 'Translation is temporarily unavailable. Please try again.',
            unexpected_translation_response: 'The translation service returned an unexpected result. Please try again.',
            invalid_text: 'Please use English text up to 12,000 characters.',
            payload_too_large: 'That text is too large for this preview.'
        };
        return messages[code] || 'We could not translate this text right now. Please try again.';
    }

    async function requestTranslation(text) {
        var response = await root.fetch('/api/document-translate', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        var body = await response.json().catch(function () { return {}; });
        if (!response.ok || !body.ok || typeof body.translation !== 'string') {
            var error = new Error(friendlyError(body.error));
            error.code = body.error || 'translation_failed';
            throw error;
        }
        return body.translation;
    }

    function copyText(text) {
        if (root.navigator && root.navigator.clipboard && typeof root.navigator.clipboard.writeText === 'function') {
            return root.navigator.clipboard.writeText(text);
        }
        return Promise.reject(new Error('clipboard_unavailable'));
    }

    function mount() {
        if (!root || !root.document) return null;
        var scope = root.document.querySelector('[data-document-translator]');
        if (!scope) return null;

        var source = scope.querySelector('[data-document-source]');
        var result = scope.querySelector('[data-document-result]');
        var fileInput = scope.querySelector('[data-document-file]');
        var translate = scope.querySelector('[data-document-translate]');
        var sample = scope.querySelector('[data-document-sample]');
        var clear = scope.querySelector('[data-document-clear]');
        var copy = scope.querySelector('[data-document-copy]');
        var continueButton = scope.querySelector('[data-document-continue]');
        var status = scope.querySelector('[data-document-status]');
        var notice = scope.querySelector('[data-document-notice]');
        var sourceCount = scope.querySelector('[data-document-source-count]');
        var resultCount = scope.querySelector('[data-document-result-count]');

        function setStatus(label, state) {
            if (status) {
                status.textContent = label;
                status.dataset.state = state || 'idle';
            }
        }

        function setNotice(message, state) {
            if (!notice) return;
            notice.textContent = message || '';
            notice.dataset.state = state || '';
        }

        function updateCounts() {
            if (sourceCount) sourceCount.textContent = String((source.value || '').length) + ' / ' + MAX_SOURCE_CHARS;
            if (resultCount) resultCount.textContent = String((result.value || '').length) + ' characters';
            translate.disabled = !String(source.value || '').trim();
            copy.disabled = !String(result.value || '').trim();
            continueButton.disabled = !String(result.value || '').trim();
        }

        source.addEventListener('input', updateCounts);
        result.addEventListener('input', updateCounts);

        fileInput.addEventListener('change', async function () {
            var file = fileInput.files && fileInput.files[0];
            if (!file) return;
            if (!isTextFile(file)) {
                setNotice(friendlyError('unsupported_file'), 'error');
                fileInput.value = '';
                return;
            }
            if (file.size > MAX_FILE_BYTES) {
                setNotice(friendlyError('file_too_large'), 'error');
                fileInput.value = '';
                return;
            }
            try {
                var text = await file.text();
                var validation = validateSource(text);
                if (!validation.ok) {
                    setNotice(friendlyError(validation.error), 'error');
                    return;
                }
                source.value = validation.text;
                result.value = '';
                setNotice('Text loaded from ' + file.name + '. Review it, then translate.', 'success');
                setStatus('Ready to translate', 'ready');
                updateCounts();
                source.focus();
            } catch (error) {
                setNotice('We could not read that text file.', 'error');
            }
        });

        sample.addEventListener('click', function () {
            source.value = 'Dear Parent,\n\nThe school will remain closed on Friday due to staff training. Classes will resume on Monday at the normal time. Please contact the school office if you have any questions.';
            result.value = '';
            setNotice('Example loaded. Select Translate to Urdu.', 'success');
            setStatus('Ready to translate', 'ready');
            updateCounts();
            source.focus();
        });

        clear.addEventListener('click', function () {
            source.value = '';
            result.value = '';
            fileInput.value = '';
            setNotice('', '');
            setStatus('Waiting for text', 'idle');
            updateCounts();
            source.focus();
        });

        translate.addEventListener('click', async function () {
            var validation = validateSource(source.value);
            if (!validation.ok) {
                setNotice(friendlyError(validation.error), 'error');
                return;
            }
            translate.disabled = true;
            fileInput.disabled = true;
            sample.disabled = true;
            setStatus('Translating…', 'busy');
            setNotice('Sending this text for English → Urdu translation. WriteUrdu does not save it as a document.', 'info');
            try {
                var translated = await requestTranslation(validation.text);
                result.value = translated;
                setStatus('Translation ready', 'success');
                setNotice('Review the Urdu before using it, especially names, dates and formal wording.', 'success');
                result.focus();
            } catch (error) {
                setStatus('Could not translate', 'error');
                setNotice(error && error.message ? error.message : friendlyError('translation_failed'), 'error');
            } finally {
                fileInput.disabled = false;
                sample.disabled = false;
                updateCounts();
            }
        });

        copy.addEventListener('click', async function () {
            var text = String(result.value || '').trim();
            if (!text) return;
            try {
                await copyText(text);
                setNotice('Urdu translation copied.', 'success');
            } catch (error) {
                result.focus();
                result.select();
                setNotice('Select the Urdu text and copy it from your browser.', 'info');
            }
        });

        continueButton.addEventListener('click', function () {
            var text = String(result.value || '').trim();
            if (!text) return;
            var handoff = root.WriteUrduTextHandoff;
            if (handoff && typeof handoff.store === 'function' && handoff.store(text, '/')) {
                root.location.assign('/');
                return;
            }
            setNotice('Copy the Urdu result, then open WriteUrdu to continue editing.', 'info');
        });

        updateCounts();
        return { source: source, result: result };
    }

    if (root && root.document) {
        if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', mount);
        else mount();
    }

    return {
        MAX_SOURCE_CHARS: MAX_SOURCE_CHARS,
        MAX_FILE_BYTES: MAX_FILE_BYTES,
        normalizeText: normalizeText,
        validateSource: validateSource,
        isTextFile: isTextFile,
        friendlyError: friendlyError,
        mount: mount
    };
}));
