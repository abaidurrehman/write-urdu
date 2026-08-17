(function () {
    'use strict';

    var root = document.querySelector('[data-urdu-voice-typing]');
    if (!root) return;

    var Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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

    var recognition = null;
    var listening = false;
    var startedAt = 0;

    function restorePageIdentity() {
        var urdu = document.documentElement.lang === 'ur';
        var heading = root.querySelector('h1');
        if (heading) heading.textContent = urdu ? 'اردو آواز سے ٹائپنگ' : 'Urdu Voice Typing';
        document.title = urdu ? 'اردو آواز سے ٹائپنگ | رائٹ اردو' : 'Urdu Voice Typing — Speak to Type Urdu Online | WriteUrdu';
    }

    // Nested tool routes retain their own title after the shared shell applies
    // locale copy. Unknown shared-shell routes otherwise inherit homepage copy.
    document.addEventListener('write-urdu:locale-change', restorePageIdentity);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', restorePageIdentity);
    else restorePageIdentity();

    function setNotice(message, type) {
        notice.textContent = message || '';
        notice.className = 'urdu-tool-notice' + (type ? ' ' + type : '');
    }

    function setStatus(label) {
        statusPill.textContent = label;
        root.setAttribute('data-voice-state', label.toLowerCase().replace(/\s+/g, '-'));
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

    function normalizeJoin(existing, addition) {
        var left = String(existing || '');
        var right = String(addition || '').trim();
        if (!right) return left;
        if (!left) return right;
        if (/\s$/.test(left)) return left + right;
        return left + ' ' + right;
    }

    function friendlyError(code) {
        if (code === 'not-allowed' || code === 'service-not-allowed') return 'Microphone or speech recognition permission was not allowed. Check your browser permissions and try again.';
        if (code === 'audio-capture') return 'No usable microphone was available to the browser.';
        if (code === 'no-speech') return 'No speech was detected. Try again and speak clearly after the listening indicator appears.';
        if (code === 'network') return 'The browser speech-recognition service could not be reached. Your browser may require an internet connection for recognition.';
        if (code === 'language-not-supported') return 'This browser does not appear to support Urdu speech recognition.';
        if (code === 'aborted') return 'Voice typing stopped.';
        return 'Voice typing could not continue in this browser. You can still type Urdu normally in WriteUrdu.';
    }

    function configureRecognition() {
        if (!Recognition) return null;
        var instance = new Recognition();
        instance.lang = 'ur-PK';
        instance.continuous = true;
        instance.interimResults = true;
        instance.maxAlternatives = 1;

        instance.onstart = function () {
            listening = true;
            startedAt = Date.now();
            startButton.hidden = true;
            stopButton.hidden = false;
            interim.textContent = 'Listening…';
            setStatus('Listening');
            setNotice('Speak naturally in Urdu. Final recognized phrases will be added to the editable transcript.', 'success');
            refreshActions();
        };

        instance.onaudiostart = function () {
            setStatus('Listening');
        };

        instance.onspeechstart = function () {
            setStatus('Hearing speech');
        };

        instance.onresult = function (event) {
            var live = '';
            for (var i = event.resultIndex; i < event.results.length; i += 1) {
                var result = event.results[i];
                var phrase = result && result[0] && result[0].transcript ? String(result[0].transcript) : '';
                if (!phrase) continue;
                if (result.isFinal) transcript.value = normalizeJoin(transcript.value, phrase);
                else live += (live ? ' ' : '') + phrase.trim();
            }
            interim.textContent = live || (listening ? 'Listening…' : '');
            transcript.dispatchEvent(new Event('input', { bubbles: true }));
            refreshActions();
        };

        instance.onerror = function (event) {
            var code = event && event.error || 'unknown';
            if (code !== 'aborted') setNotice(friendlyError(code), 'error');
            if (code === 'not-allowed' || code === 'service-not-allowed') setStatus('Permission blocked');
            else if (code === 'no-speech') setStatus('No speech detected');
            else setStatus('Recognition error');
        };

        instance.onend = function () {
            listening = false;
            startButton.hidden = false;
            stopButton.hidden = true;
            interim.textContent = '';
            if (!/blocked|error|detected/i.test(statusPill.textContent)) {
                setStatus(hasText() ? 'Transcript ready' : 'Ready');
                if (startedAt && hasText()) setNotice('Voice typing stopped. Review the transcript before copying or continuing.', 'success');
            }
            refreshActions();
        };

        return instance;
    }

    function startRecognition() {
        if (!Recognition || listening) return;
        setNotice('');
        if (!recognition) recognition = configureRecognition();
        try {
            recognition.start();
        } catch (error) {
            setStatus('Could not start');
            setNotice('The browser could not start a new recognition session yet. Wait a moment and try again.', 'error');
        }
    }

    function stopRecognition() {
        if (!recognition || !listening) return;
        try { recognition.stop(); } catch (error) { }
    }

    function abortRecognition() {
        if (!recognition) return;
        try { recognition.abort(); } catch (error) { }
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
        promise.then(function () { setNotice('Urdu transcript copied to the clipboard.', 'success'); })
            .catch(function () { setNotice('Copy was blocked. Select the transcript and copy it manually.', 'error'); });
    }

    function handoff(target) {
        var text = String(transcript.value || '');
        if (!text.trim()) return;
        var Handoff = window.WriteUrduTextHandoff;
        if (Handoff && Handoff.store(text, target)) {
            abortRecognition();
            window.location.assign(target);
            return;
        }
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(function () {
                abortRecognition();
                window.location.assign(target);
            }).catch(function () { setNotice('Your browser blocked the session handoff. Copy the transcript first, then open the next tool.', 'error'); });
        } else setNotice('Your browser blocked the session handoff. Copy the transcript first, then open the next tool.', 'error');
    }

    if (!Recognition) {
        setStatus('Not supported');
        startButton.disabled = true;
        startButton.textContent = 'Voice typing unavailable';
        supportNote.textContent = 'This browser does not expose the Web Speech Recognition interface used by this tool. You can still use Roman Urdu typing, the Urdu keyboard, or try a browser that supports speech recognition.';
        supportNote.classList.add('is-warning');
    } else {
        setStatus('Ready');
        supportNote.textContent = 'Speech recognition is provided by your browser or operating platform. Depending on the browser, audio may be processed by a vendor service and an internet connection may be required.';
    }

    startButton.addEventListener('click', startRecognition);
    stopButton.addEventListener('click', stopRecognition);
    clearButton.addEventListener('click', function () {
        abortRecognition();
        transcript.value = '';
        interim.textContent = '';
        setStatus(Recognition ? 'Ready' : 'Not supported');
        setNotice('');
        startButton.hidden = false;
        stopButton.hidden = true;
        refreshActions();
        transcript.focus();
    });
    copyButton.addEventListener('click', copyTranscript);
    cleanButton.addEventListener('click', function () { handoff('/urdu-text-cleaner'); });
    editorButton.addEventListener('click', function () { handoff('/'); });
    transcript.addEventListener('input', refreshActions);
    document.addEventListener('visibilitychange', function () { if (document.hidden && listening) stopRecognition(); });
    window.addEventListener('pagehide', abortRecognition);

    refreshActions();
}());
