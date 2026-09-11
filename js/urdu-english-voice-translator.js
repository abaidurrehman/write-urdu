(function () {
    'use strict';

    var root = document.querySelector('[data-voice-translator]');
    var voice = window.WriteUrduVoiceInput;
    var core = window.WriteUrduVoiceTranslatorCore;
    if (!root || !voice || !core) return;

    var directionSelect = root.querySelector('[data-voice-translate-direction]');
    var startButton = root.querySelector('[data-voice-translate-start]');
    var stopButton = root.querySelector('[data-voice-translate-stop]');
    var translateButton = root.querySelector('[data-voice-translate-submit]');
    var clearButton = root.querySelector('[data-voice-translate-clear]');
    var copySourceButton = root.querySelector('[data-voice-translate-copy-source]');
    var copyResultButton = root.querySelector('[data-voice-translate-copy-result]');
    var source = root.querySelector('[data-voice-translate-source]');
    var result = root.querySelector('[data-voice-translate-result]');
    var sourceLabel = root.querySelector('[data-voice-translate-source-label]');
    var resultLabel = root.querySelector('[data-voice-translate-result-label]');
    var sourceCount = root.querySelector('[data-voice-translate-source-count]');
    var interim = root.querySelector('[data-voice-translate-interim]');
    var status = root.querySelector('[data-voice-translate-status]');
    var notice = root.querySelector('[data-voice-translate-notice]');
    var controller = null;
    var listening = false;
    var translating = false;

    function direction() {
        return core.getDirection(directionSelect.value);
    }

    function setStatus(text, state) {
        status.textContent = text;
        status.setAttribute('data-state', state || 'idle');
    }

    function setNotice(text, state) {
        notice.textContent = text || '';
        notice.setAttribute('data-state', state || 'idle');
    }

    function updateActions() {
        var sourceReady = Boolean(core.cleanText(source.value));
        var resultReady = Boolean(core.cleanText(result.value));
        translateButton.disabled = !sourceReady || translating;
        copySourceButton.disabled = !sourceReady;
        copyResultButton.disabled = !resultReady;
        clearButton.disabled = !sourceReady && !resultReady && !listening;
        startButton.disabled = listening || translating || !(controller && controller.isSupported());
        stopButton.hidden = !listening;
        startButton.hidden = listening;
        sourceCount.textContent = source.value.length + ' / ' + core.MAX_TEXT_CHARS;
    }

    function applyDirectionUi(clearText) {
        var config = direction();
        if (controller) controller.destroy();
        controller = null;
        listening = false;
        interim.textContent = '';

        if (clearText) {
            source.value = '';
            result.value = '';
        }

        source.setAttribute('lang', config.from);
        source.setAttribute('dir', config.sourceDir);
        result.setAttribute('lang', config.to);
        result.setAttribute('dir', config.resultDir);
        source.classList.toggle('voice-translator-urdu-text', config.from === 'ur');
        result.classList.toggle('voice-translator-urdu-text', config.to === 'ur');
        sourceLabel.textContent = config.sourceLabel;
        resultLabel.textContent = config.resultLabel;
        startButton.textContent = config.startLabel;
        translateButton.textContent = config.translateLabel;
        source.placeholder = config.from === 'ur'
            ? 'آپ کی اردو گفتگو یہاں نظر آئے گی۔ آپ اسے ترجمہ کرنے سے پہلے درست کر سکتے ہیں۔'
            : 'Your English speech appears here. You can edit it before translating.';
        result.placeholder = config.to === 'ur'
            ? 'اردو ترجمہ یہاں نظر آئے گا۔'
            : 'Your English translation appears here.';

        controller = voice.create({
            lang: config.recognitionLang,
            interimResults: true,
            continuous: true,
            onState: function (state) {
                if (state === 'listening') setStatus('Listening', 'listening');
                if (state === 'hearing-speech') setStatus('Hearing speech', 'listening');
            },
            onStart: function () {
                listening = true;
                setNotice('Speak naturally. Your words stay in the transcript until you choose Translate.', 'info');
                updateActions();
            },
            onFinal: function (phrase) {
                source.value = core.appendTranscript(source.value, phrase);
                setStatus('Transcript ready', 'ready');
                updateActions();
            },
            onInterim: function (text) {
                interim.textContent = text || '';
            },
            onError: function (category) {
                setNotice(core.friendlyVoiceError(category), 'error');
                setStatus('Voice unavailable', 'error');
            },
            onEnd: function () {
                listening = false;
                interim.textContent = '';
                if (core.cleanText(source.value)) setStatus('Transcript ready', 'ready');
                else setStatus('Ready', 'idle');
                updateActions();
            }
        });

        if (!controller.isSupported()) {
            setStatus('Voice not supported', 'error');
            setNotice('Voice recognition is not available in this browser. You can still type text here and translate it, or try another supported browser.', 'error');
        } else {
            setStatus('Ready', 'idle');
            setNotice('Microphone audio is handled by your browser speech-recognition service. WriteUrdu sends text for translation only when you choose Translate.', 'info');
        }
        updateActions();
    }

    async function translateSource() {
        var request = core.buildTranslationRequest(directionSelect.value, source.value);
        if (!request.ok) {
            setNotice(request.error === 'text_too_long' ? 'Shorten the transcript to 5,000 characters or fewer.' : 'Add some text before translating.', 'error');
            return;
        }

        translating = true;
        setStatus('Translating', 'busy');
        setNotice('Sending the reviewed transcript for translation…', 'info');
        updateActions();

        try {
            var response = await fetch('/api/language-translate', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(request.body)
            });
            var payload = await response.json().catch(function () { return null; });
            if (!response.ok || !payload || payload.ok !== true || typeof payload.translation !== 'string') {
                throw { code: payload && payload.error ? payload.error : 'translation_unavailable' };
            }
            result.value = payload.translation.trim();
            setStatus('Translation ready', 'ready');
            setNotice('Translation ready. Review it before copying or using it.', 'success');
        } catch (error) {
            setStatus('Translation unavailable', 'error');
            setNotice(core.friendlyTranslationError(error && error.code), 'error');
        } finally {
            translating = false;
            updateActions();
        }
    }

    async function copyText(text, successMessage) {
        var value = core.cleanText(text);
        if (!value) return;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(value);
            } else {
                var helper = document.createElement('textarea');
                helper.value = value;
                helper.setAttribute('readonly', '');
                helper.style.position = 'fixed';
                helper.style.opacity = '0';
                document.body.appendChild(helper);
                helper.select();
                document.execCommand('copy');
                document.body.removeChild(helper);
            }
            setNotice(successMessage, 'success');
        } catch (error) {
            setNotice('Copy was blocked. Select the text and copy it manually.', 'error');
        }
    }

    directionSelect.addEventListener('change', function () {
        applyDirectionUi(true);
        setNotice('Direction changed. Start a new transcript in the selected language.', 'info');
    });

    startButton.addEventListener('click', function () {
        if (!controller || !controller.isSupported()) return;
        setNotice('', 'idle');
        if (!controller.start()) {
            setNotice('Voice recognition could not start yet. Try again.', 'error');
        }
        updateActions();
    });

    stopButton.addEventListener('click', function () {
        if (controller) controller.stop();
    });

    translateButton.addEventListener('click', translateSource);
    copySourceButton.addEventListener('click', function () { copyText(source.value, 'Source transcript copied.'); });
    copyResultButton.addEventListener('click', function () { copyText(result.value, 'Translation copied.'); });

    clearButton.addEventListener('click', function () {
        if (controller && controller.isActive()) controller.abort();
        source.value = '';
        result.value = '';
        interim.textContent = '';
        setStatus('Ready', 'idle');
        setNotice('Cleared.', 'info');
        updateActions();
    });

    source.addEventListener('input', function () {
        if (source.value.length > core.MAX_TEXT_CHARS) source.value = source.value.slice(0, core.MAX_TEXT_CHARS);
        updateActions();
    });
    result.addEventListener('input', updateActions);

    applyDirectionUi(false);
}());
