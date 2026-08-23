(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduVoiceInput = api;
}(typeof window !== 'undefined' ? window : null, function () {
    'use strict';

    var ERROR_CATEGORIES = {
        'not-allowed': 'permission-denied',
        'service-not-allowed': 'permission-denied',
        'audio-capture': 'audio-capture',
        'no-speech': 'no-speech',
        network: 'network',
        'language-not-supported': 'language-not-supported',
        aborted: 'aborted'
    };

    function recognitionConstructor(host) {
        return host && (host.SpeechRecognition || host.webkitSpeechRecognition) || null;
    }

    function errorCategory(code) {
        return ERROR_CATEGORIES[String(code || '')] || 'unknown';
    }

    function create(options) {
        options = options || {};
        var host = options.host || (typeof window !== 'undefined' ? window : null);
        var documentRef = options.document || (host && host.document) || null;
        var Recognition = options.Recognition || recognitionConstructor(host);
        var recognition = null;
        var active = false;
        var destroyed = false;
        var processedFinalResults = [];

        function call(name, value) {
            if (typeof options[name] === 'function') options[name](value);
        }

        function setState(state) {
            call('onState', state);
        }

        function handleResult(event) {
            if (destroyed || !event || !event.results) return;
            var interim = '';
            var start = Math.max(0, Number(event.resultIndex) || 0);
            for (var i = start; i < event.results.length; i += 1) {
                var result = event.results[i];
                var phrase = result && result[0] && result[0].transcript != null ? String(result[0].transcript) : '';
                if (!phrase) continue;
                if (result.isFinal) {
                    if (processedFinalResults.indexOf(result) >= 0) continue;
                    processedFinalResults.push(result);
                    call('onFinal', phrase);
                } else {
                    interim += (interim ? ' ' : '') + phrase.trim();
                }
            }
            call('onInterim', interim);
        }

        function configureRecognition() {
            if (!Recognition || destroyed) return null;
            var instance = new Recognition();
            instance.lang = options.lang || 'ur-PK';
            instance.continuous = options.continuous !== false;
            instance.interimResults = options.interimResults !== false;
            instance.maxAlternatives = 1;
            instance.onstart = function () {
                if (destroyed) return;
                active = true;
                setState('listening');
                call('onStart');
            };
            instance.onaudiostart = function () { if (!destroyed) setState('listening'); };
            instance.onspeechstart = function () { if (!destroyed) setState('hearing-speech'); };
            instance.onresult = handleResult;
            instance.onerror = function (event) {
                if (destroyed) return;
                call('onError', errorCategory(event && event.error));
            };
            instance.onend = function () {
                if (destroyed) return;
                active = false;
                call('onInterim', '');
                setState('ended');
                call('onEnd');
            };
            return instance;
        }

        function start() {
            if (destroyed || !Recognition || active) return false;
            if (!recognition) recognition = configureRecognition();
            if (!recognition) return false;
            processedFinalResults = [];
            active = true;
            setState('starting');
            try {
                recognition.start();
                return true;
            } catch (error) {
                active = false;
                call('onError', 'start-failed');
                setState('ended');
                call('onEnd');
                return false;
            }
        }

        function stop() {
            if (destroyed || !recognition || !active) return false;
            try {
                recognition.stop();
                return true;
            } catch (error) {
                return false;
            }
        }

        function abort() {
            if (!recognition) return false;
            active = false;
            try {
                recognition.abort();
                return true;
            } catch (error) {
                return false;
            }
        }

        function handleVisibilityChange() {
            if (documentRef && documentRef.hidden && active) stop();
        }

        function handlePageHide() {
            if (active) abort();
        }

        function destroy() {
            if (destroyed) return;
            if (active) abort();
            destroyed = true;
            if (documentRef && typeof documentRef.removeEventListener === 'function') documentRef.removeEventListener('visibilitychange', handleVisibilityChange);
            if (host && typeof host.removeEventListener === 'function') host.removeEventListener('pagehide', handlePageHide);
            if (recognition) {
                recognition.onstart = null;
                recognition.onaudiostart = null;
                recognition.onspeechstart = null;
                recognition.onresult = null;
                recognition.onerror = null;
                recognition.onend = null;
            }
            recognition = null;
        }

        if (documentRef && typeof documentRef.addEventListener === 'function') documentRef.addEventListener('visibilitychange', handleVisibilityChange);
        if (host && typeof host.addEventListener === 'function') host.addEventListener('pagehide', handlePageHide);

        return {
            isSupported: function () { return Boolean(Recognition); },
            isActive: function () { return active; },
            start: start,
            stop: stop,
            abort: abort,
            destroy: destroy
        };
    }

    return {
        create: create,
        recognitionConstructor: recognitionConstructor,
        errorCategory: errorCategory
    };
}));
