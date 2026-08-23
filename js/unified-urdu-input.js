(function (root, factory) {
    'use strict';
    var api = factory(root);
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduUnifiedInput = api;
}(typeof window !== 'undefined' ? window : null, function (root) {
    'use strict';

    var CLOSING_PUNCTUATION = /^[,.;:!?،؛؟۔%)\]}]/;
    var OPENING_PUNCTUATION = /[(\[{]$/;
    var VOICE_COPY = {
        en: {
            method: 'Speak Urdu',
            start: 'Start voice typing',
            stop: 'Stop voice typing',
            ready: 'Ready',
            starting: 'Starting…',
            listening: 'Listening…',
            hearing: 'Listening…',
            added: 'Text added',
            stopped: 'Text added / stopped',
            permission: 'Permission blocked',
            unavailable: 'Voice unavailable',
            noSpeech: 'No speech heard',
            error: 'Voice typing could not continue',
            readyNote: 'Tap Start voice typing, then speak Urdu.',
            permissionNote: 'Allow microphone access in your browser settings and try again.',
            unavailableNote: 'Voice typing is unavailable in this browser. You can keep typing normally.',
            noSpeechNote: 'No speech was detected. Try again after Listening appears.',
            errorNote: 'Try again, or keep typing with English letters or direct Urdu.'
        },
        ur: {
            method: 'بول کر اردو لکھیں',
            start: 'آواز سے لکھنا شروع کریں',
            stop: 'آواز سے لکھنا روکیں',
            ready: 'تیار',
            starting: 'شروع ہو رہا ہے…',
            listening: 'سن رہا ہے…',
            hearing: 'سن رہا ہے…',
            added: 'متن شامل ہو گیا',
            stopped: 'متن شامل ہو گیا / رک گیا',
            permission: 'مائیک کی اجازت مسدود ہے',
            unavailable: 'آواز سے لکھنا دستیاب نہیں',
            noSpeech: 'کوئی آواز نہیں ملی',
            error: 'آواز سے لکھنا جاری نہیں رہ سکا',
            readyNote: 'آواز سے لکھنا شروع کریں دبائیں، پھر اردو بولیں۔',
            permissionNote: 'براؤزر کی ترتیبات میں مائیک کی اجازت دیں اور دوبارہ کوشش کریں۔',
            unavailableNote: 'اس براؤزر میں آواز سے لکھنا دستیاب نہیں۔ آپ معمول کے مطابق لکھ سکتے ہیں۔',
            noSpeechNote: 'کوئی آواز نہیں ملی۔ سن رہا ہے ظاہر ہونے کے بعد دوبارہ بولیں۔',
            errorNote: 'دوبارہ کوشش کریں، یا انگریزی حروف یا براہِ راست اردو سے لکھتے رہیں۔'
        }
    };

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, Number(value) || 0));
    }

    function needsSpace(left, right) {
        if (!left || !right || /\s$/.test(left) || /^\s/.test(right)) return false;
        if (CLOSING_PUNCTUATION.test(right) || OPENING_PUNCTUATION.test(left)) return false;
        return true;
    }

    function insertTextAtSelection(value, selectionStart, selectionEnd, insertion) {
        var current = String(value == null ? '' : value);
        var start = clamp(selectionStart, 0, current.length);
        var end = clamp(selectionEnd, start, current.length);
        var spoken = String(insertion == null ? '' : insertion).replace(/^\s+|\s+$/g, '');
        if (!spoken) return { value: current, selectionStart: start, selectionEnd: start };

        var prefix = current.slice(0, start);
        var suffix = current.slice(end);
        var committed = (needsSpace(prefix, spoken) ? ' ' : '') + spoken + (needsSpace(spoken, suffix) ? ' ' : '');
        var caret = prefix.length + committed.length;
        return {
            value: prefix + committed + suffix,
            selectionStart: caret,
            selectionEnd: caret
        };
    }

    function eventFor(target, name) {
        var view = target && target.ownerDocument && target.ownerDocument.defaultView;
        var EventConstructor = view && view.Event || root && root.Event;
        if (EventConstructor) return new EventConstructor(name, { bubbles: true });
        return { type: name, bubbles: true };
    }

    function createTextControlAdapter(target) {
        if (!target || typeof target.value === 'undefined') throw new Error('A textarea or input target is required.');

        function selection() {
            var length = String(target.value || '').length;
            var start = typeof target.selectionStart === 'number' ? target.selectionStart : length;
            var end = typeof target.selectionEnd === 'number' ? target.selectionEnd : start;
            return { start: start, end: end };
        }

        return {
            kind: 'text-control',
            isEditable: function () { return !target.disabled && !target.readOnly; },
            getValue: function () { return String(target.value || ''); },
            getSelection: selection,
            focus: function () { if (typeof target.focus === 'function') target.focus(); },
            insertText: function (text) {
                if (!this.isEditable()) return null;
                var currentSelection = selection();
                var result = insertTextAtSelection(target.value, currentSelection.start, currentSelection.end, text);
                target.value = result.value;
                if (typeof target.setSelectionRange === 'function') target.setSelectionRange(result.selectionStart, result.selectionEnd);
                if (typeof target.dispatchEvent === 'function') {
                    target.dispatchEvent(eventFor(target, 'input'));
                    target.dispatchEvent(eventFor(target, 'change'));
                }
                return result;
            }
        };
    }

    function createVoiceInputController(options) {
        options = options || {};
        var voiceApi = options.voiceApi || root && root.WriteUrduVoiceInput;
        var adapter = options.adapter;
        if (!voiceApi || typeof voiceApi.create !== 'function') throw new Error('WriteUrdu voice input core is required.');
        if (!adapter || typeof adapter.insertText !== 'function') throw new Error('A unified input target adapter is required.');

        var elements = options.elements || {};
        var listening = false;
        var stateKey = 'ready';
        var noticeKey = 'readyNote';
        var errorState = false;

        function locale() {
            if (typeof options.locale === 'function') return options.locale() === 'ur' ? 'ur' : 'en';
            var documentRef = root && root.document;
            return documentRef && documentRef.documentElement && documentRef.documentElement.lang === 'ur' ? 'ur' : 'en';
        }

        function text(key) {
            return VOICE_COPY[locale()][key] || VOICE_COPY.en[key] || '';
        }

        function render() {
            if (elements.methodLabel) elements.methodLabel.textContent = text('method');
            if (elements.startButton) elements.startButton.textContent = text('start');
            if (elements.stopButton) elements.stopButton.textContent = text('stop');
            if (elements.status) elements.status.textContent = text(stateKey);
            if (elements.notice) elements.notice.textContent = noticeKey ? text(noticeKey) : '';
            if (elements.root) elements.root.setAttribute('data-voice-state', stateKey);
        }

        function setState(nextState, nextNotice) {
            stateKey = nextState;
            if (typeof nextNotice !== 'undefined') noticeKey = nextNotice;
            render();
            if (typeof options.onStateChange === 'function') options.onStateChange(nextState);
        }

        function setListening(next) {
            listening = Boolean(next);
            if (elements.startButton) elements.startButton.hidden = listening;
            if (elements.stopButton) elements.stopButton.hidden = !listening;
        }

        function errorCopy(category) {
            if (category === 'permission-denied') return { state: 'permission', notice: 'permissionNote' };
            if (category === 'no-speech') return { state: 'noSpeech', notice: 'noSpeechNote' };
            return { state: 'error', notice: 'errorNote' };
        }

        var controller = voiceApi.create({
            host: options.host,
            document: options.document,
            Recognition: options.Recognition,
            lang: options.lang || 'ur-PK',
            interimResults: true,
            continuous: true,
            onState: function (state) {
                if (state === 'starting') setState('starting', 'readyNote');
                if (state === 'listening') setState('listening', null);
                if (state === 'hearing-speech') setState('hearing', null);
            },
            onStart: function () {
                errorState = false;
                setListening(true);
                setState('listening', null);
                if (typeof options.onStart === 'function') options.onStart();
            },
            onInterim: function (value) {
                if (elements.interim) elements.interim.textContent = value || (listening ? text('listening') : '');
            },
            onFinal: function (value) {
                adapter.insertText(value);
                if (elements.interim) elements.interim.textContent = '';
                setState('added', null);
                if (typeof options.onFinal === 'function') options.onFinal();
            },
            onError: function (category) {
                if (category === 'aborted') return;
                errorState = true;
                var copy = errorCopy(category);
                setState(copy.state, copy.notice);
                if (typeof options.onError === 'function') options.onError(category);
            },
            onEnd: function () {
                setListening(false);
                if (elements.interim) elements.interim.textContent = '';
                if (!errorState) setState('stopped', null);
                if (typeof options.onEnd === 'function') options.onEnd();
            }
        });

        var supported = controller.isSupported();
        if (elements.startButton) elements.startButton.disabled = !supported;
        if (elements.methodButton) {
            elements.methodButton.disabled = !supported;
            elements.methodButton.setAttribute('aria-disabled', supported ? 'false' : 'true');
            if (!supported) elements.methodButton.setAttribute('title', text('unavailableNote'));
        }
        setListening(false);
        setState(supported ? 'ready' : 'unavailable', supported ? 'readyNote' : 'unavailableNote');

        function start() {
            if (!supported || listening) return false;
            errorState = false;
            noticeKey = null;
            return controller.start();
        }

        function stop() {
            if (!listening) return false;
            return controller.stop();
        }

        function startClick() { start(); }
        function stopClick() { stop(); }
        if (elements.startButton) elements.startButton.addEventListener('click', startClick);
        if (elements.stopButton) elements.stopButton.addEventListener('click', stopClick);

        return {
            isSupported: function () { return supported; },
            isListening: function () { return listening; },
            getState: function () { return stateKey; },
            start: start,
            stop: stop,
            abort: function () { return controller.abort(); },
            refreshLocale: render,
            destroy: function () {
                if (elements.startButton) elements.startButton.removeEventListener('click', startClick);
                if (elements.stopButton) elements.stopButton.removeEventListener('click', stopClick);
                controller.destroy();
            }
        };
    }

    return {
        insertTextAtSelection: insertTextAtSelection,
        createTextControlAdapter: createTextControlAdapter,
        createVoiceInputController: createVoiceInputController,
        VOICE_COPY: VOICE_COPY
    };
}));
