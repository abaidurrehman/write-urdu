(function () {
    'use strict';

    var root = document.querySelector('[data-urdu-voice-typing]');
    if (!root || !window.WriteUrduVoiceInput || !window.WriteUrduUnifiedInput) return;

    var startButton = root.querySelector('[data-voice-start]');
    var stopButton = root.querySelector('[data-voice-stop]');
    var clearButton = root.querySelector('[data-voice-clear]');
    var copyButton = root.querySelector('[data-voice-copy]');
    var cleanButton = root.querySelector('[data-voice-clean]');
    var editorButton = root.querySelector('[data-voice-editor]');
    var transcript = root.querySelector('#voiceTranscript');
    var interim = root.querySelector('[data-voice-interim]');
    var statusPill = root.querySelector('[data-voice-status-pill]');
    var notice = root.querySelector('[data-voice-notice]');
    var supportNote = root.querySelector('[data-voice-support-note]');
    var transcriptTarget = window.WriteUrduUnifiedInput.createTextControlAdapter(transcript);

    var listening = false;
    var startedAt = 0;
    var currentStateKey = 'checking-support';
    var currentNoticeKey = null;

    var STR = {
        'start-voice-typing': { en: 'Start voice typing', ur: 'آواز سے ٹائپنگ شروع کریں' },
        'voice-typing-unavailable': { en: 'Voice typing unavailable', ur: 'آواز سے ٹائپنگ دستیاب نہیں' },
        'checking-support': { en: 'Checking support', ur: 'معاونت جانچی جا رہی ہے' },
        ready: { en: 'Ready', ur: 'تیار' },
        listening: { en: 'Listening', ur: 'سن رہا ہے' },
        'hearing-speech': { en: 'Hearing speech', ur: 'آواز سنائی دے رہی ہے' },
        'text-ready': { en: 'Text ready', ur: 'متن تیار ہے' },
        'permission-blocked': { en: 'Permission blocked', ur: 'اجازت مسدود' },
        'no-speech-detected': { en: 'No speech detected', ur: 'کوئی آواز نہیں ملی' },
        'voice-typing-error': { en: 'Voice typing error', ur: 'آواز سے ٹائپنگ میں خرابی' },
        'could-not-start': { en: 'Could not start', ur: 'شروع نہیں ہو سکا' },
        'not-supported': { en: 'Not supported', ur: 'معاونت دستیاب نہیں' },
        'listening-ellipsis': { en: 'Listening…', ur: 'سن رہا ہے…' },
        'speak-naturally': { en: 'Speak naturally in Urdu. Your words will appear in the text box.', ur: 'اردو میں قدرتی انداز میں بولیں۔ آپ کے الفاظ ٹیکسٹ باکس میں ظاہر ہوں گے۔' },
        'done-edit': { en: 'Done. Edit anything you want, then copy or keep writing.', ur: 'مکمل ہو گیا۔ جو چاہیں تبدیل کریں، پھر کاپی کریں یا لکھنا جاری رکھیں۔' },
        copied: { en: 'Urdu text copied.', ur: 'اردو متن کاپی ہو گیا۔' },
        'copy-blocked': { en: 'Copy was blocked. Select the text and copy it manually.', ur: 'کاپی مسدود ہو گئی۔ متن منتخب کر کے دستی طور پر کاپی کریں۔' },
        'copy-first': { en: 'Copy the text first, then open the next tool.', ur: 'پہلے متن کاپی کریں، پھر اگلا ٹول کھولیں۔' },
        'unsupported-note': { en: 'Voice typing is not available in this browser. Try another supported browser or continue with normal Urdu typing.', ur: 'آواز سے ٹائپنگ اس براؤزر میں دستیاب نہیں۔ کوئی دوسرا معاون براؤزر آزمائیں یا معمول کے مطابق اردو ٹائپ کرتے رہیں۔' },
        'ready-note': { en: 'Ready when you are. Press Start voice typing and speak Urdu.', ur: 'جب آپ تیار ہوں، آواز سے ٹائپنگ شروع کریں دبائیں اور اردو بولیں۔' },
        'could-not-start-yet': { en: 'Voice typing could not start yet. Wait a moment and try again.', ur: 'آواز سے ٹائپنگ ابھی شروع نہیں ہو سکی۔ تھوڑی دیر انتظار کر کے دوبارہ کوشش کریں۔' },
        'mic-blocked': { en: 'Microphone access was blocked. Allow it in your browser settings and try again.', ur: 'مائیک تک رسائی مسدود کر دی گئی۔ براؤزر کی ترتیبات میں اجازت دیں اور دوبارہ کوشش کریں۔' },
        'no-mic': { en: 'No microphone was available. Check your microphone and try again.', ur: 'کوئی مائیک دستیاب نہیں تھا۔ اپنا مائیک چیک کر کے دوبارہ کوشش کریں۔' },
        'no-speech-heard': { en: 'I did not hear any speech. Try again and start speaking after Listening appears.', ur: 'کوئی آواز سنائی نہیں دی۔ دوبارہ کوشش کریں اور ‘سن رہا ہے’ ظاہر ہونے کے بعد بولنا شروع کریں۔' },
        'network-error': { en: 'Voice typing could not connect. Check your internet connection and try again.', ur: 'آواز سے ٹائپنگ منسلک نہیں ہو سکی۔ اپنا انٹرنیٹ کنکشن چیک کر کے دوبارہ کوشش کریں۔' },
        'lang-not-supported': { en: 'Urdu voice typing is not available in this browser.', ur: 'اس براؤزر میں اردو آواز سے ٹائپنگ دستیاب نہیں۔' },
        aborted: { en: 'Voice typing stopped.', ur: 'آواز سے ٹائپنگ رک گئی۔' },
        'generic-error': { en: 'Voice typing could not continue. You can still type Urdu normally in WriteUrdu.', ur: 'آواز سے ٹائپنگ جاری نہیں رہ سکی۔ آپ اب بھی رائٹ اردو میں معمول کے مطابق اردو ٹائپ کر سکتے ہیں۔' }
    };

    function isUrduLocale() { return document.documentElement.lang === 'ur'; }
    function t(key) { return STR[key][isUrduLocale() ? 'ur' : 'en']; }

    function setNotice(messageKey, type) {
        currentNoticeKey = messageKey;
        notice.textContent = messageKey ? t(messageKey) : '';
        notice.className = 'urdu-tool-notice' + (type ? ' ' + type : '');
    }

    function setStatus(stateKey) {
        currentStateKey = stateKey;
        statusPill.textContent = t(stateKey);
        root.setAttribute('data-voice-state', stateKey);
    }

    function hasText() {
        return Boolean(String(transcript.value || '').trim());
    }

    function refreshActions() {
        var ready = hasText();
        copyButton.disabled = !ready;
        cleanButton.disabled = !ready;
        editorButton.disabled = !ready;
        clearButton.disabled = !ready && !listening;
    }

    function friendlyErrorKey(category) {
        if (category === 'permission-denied') return 'mic-blocked';
        if (category === 'audio-capture') return 'no-mic';
        if (category === 'no-speech') return 'no-speech-heard';
        if (category === 'network') return 'network-error';
        if (category === 'language-not-supported') return 'lang-not-supported';
        if (category === 'aborted') return 'aborted';
        if (category === 'start-failed') return 'could-not-start-yet';
        return 'generic-error';
    }

    function errorState(category) {
        if (category === 'permission-denied') return 'permission-blocked';
        if (category === 'no-speech') return 'no-speech-detected';
        if (category === 'start-failed') return 'could-not-start';
        return 'voice-typing-error';
    }

    var controller = window.WriteUrduVoiceInput.create({
        lang: 'ur-PK',
        interimResults: true,
        continuous: true,
        onState: function (state) {
            if (state === 'listening') setStatus('listening');
            if (state === 'hearing-speech') setStatus('hearing-speech');
        },
        onStart: function () {
            listening = true;
            startedAt = Date.now();
            startButton.hidden = true;
            stopButton.hidden = false;
            interim.textContent = t('listening-ellipsis');
            setStatus('listening');
            setNotice('speak-naturally', 'success');
            refreshActions();
        },
        onInterim: function (text) {
            interim.textContent = text || (listening ? t('listening-ellipsis') : '');
        },
        onFinal: function (text) {
            transcriptTarget.insertText(text);
            interim.textContent = listening ? t('listening-ellipsis') : '';
            refreshActions();
        },
        onError: function (category) {
            if (category === 'aborted') {
                setStatus(hasText() ? 'text-ready' : 'ready');
                return;
            }
            setNotice(friendlyErrorKey(category), 'error');
            setStatus(errorState(category));
        },
        onEnd: function () {
            listening = false;
            startButton.hidden = false;
            stopButton.hidden = true;
            interim.textContent = '';
            if (['permission-blocked', 'no-speech-detected', 'voice-typing-error', 'could-not-start'].indexOf(currentStateKey) === -1) {
                setStatus(hasText() ? 'text-ready' : 'ready');
                if (startedAt && hasText()) setNotice('done-edit', 'success');
            }
            refreshActions();
        }
    });

    function restorePageIdentity() {
        statusPill.textContent = t(currentStateKey);
        startButton.textContent = t(startButton.disabled ? 'voice-typing-unavailable' : 'start-voice-typing');
        supportNote.textContent = t(controller.isSupported() ? 'ready-note' : 'unsupported-note');
        if (currentNoticeKey) notice.textContent = t(currentNoticeKey);
        if (listening && !interim.textContent) interim.textContent = t('listening-ellipsis');
    }

    function startRecognition() {
        if (!controller.isSupported() || listening) return;
        setNotice(null);
        controller.start();
    }

    function stopRecognition() {
        controller.stop();
    }

    function abortRecognition() {
        controller.abort();
        listening = false;
    }

    function copyTranscript() {
        var text = String(transcript.value || '');
        if (!text.trim()) return;
        var promise;
        if (navigator.clipboard && window.isSecureContext) promise = navigator.clipboard.writeText(text);
        else {
            transcript.focus();
            transcript.select();
            promise = document.execCommand('copy') ? Promise.resolve() : Promise.reject(new Error('copy'));
        }
        promise.then(function () {
            setNotice('copied', 'success');
            if (window.WriteUrduTelemetry) window.WriteUrduTelemetry.trackOutcome('copy_completed', { format: 'clipboard', success: true });
        }).catch(function () { setNotice('copy-blocked', 'error'); });
    }

    function handoff(target) {
        var text = String(transcript.value || '');
        if (!text.trim()) return;
        function go() {
            if (window.WriteUrduTelemetry) window.WriteUrduTelemetry.track('tool_handoff', { target_route: target });
            abortRecognition();
            window.location.assign(target);
        }
        var Handoff = window.WriteUrduTextHandoff;
        if (Handoff && Handoff.store(text, target)) {
            go();
            return;
        }
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(go).catch(function () { setNotice('copy-first', 'error'); });
        } else setNotice('copy-first', 'error');
    }

    if (!controller.isSupported()) {
        setStatus('not-supported');
        startButton.disabled = true;
        startButton.textContent = t('voice-typing-unavailable');
        supportNote.textContent = t('unsupported-note');
        supportNote.classList.add('is-warning');
    } else {
        setStatus('ready');
        supportNote.textContent = t('ready-note');
    }

    document.addEventListener('write-urdu:locale-change', restorePageIdentity);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', restorePageIdentity);
    else restorePageIdentity();

    startButton.addEventListener('click', startRecognition);
    stopButton.addEventListener('click', stopRecognition);
    clearButton.addEventListener('click', function () {
        abortRecognition();
        transcript.value = '';
        interim.textContent = '';
        setStatus(controller.isSupported() ? 'ready' : 'not-supported');
        setNotice(null);
        startButton.hidden = false;
        stopButton.hidden = true;
        refreshActions();
        transcript.focus();
    });
    copyButton.addEventListener('click', copyTranscript);
    cleanButton.addEventListener('click', function () { handoff('/urdu-text-cleaner'); });
    editorButton.addEventListener('click', function () { handoff('/'); });
    transcript.addEventListener('input', refreshActions);

    refreshActions();
}());
