(function (root) {
    'use strict';

    var document = root.document;
    var dependencyPromise = null;

    function assetPath(path) {
        return root.location && root.location.protocol === 'file:' ? path.replace(/^\//, '') : path;
    }

    function loadScript(path, marker, ready) {
        if (typeof ready === 'function' && ready()) return Promise.resolve();
        var existing = document.querySelector('script[' + marker + ']');
        if (existing) {
            return new Promise(function (resolve) {
                if ((typeof ready === 'function' && ready()) || existing.dataset.loaded === 'true') resolve();
                else existing.addEventListener('load', resolve, { once: true });
            });
        }
        return new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = assetPath(path);
            script.async = true;
            script.setAttribute(marker, 'true');
            script.onload = function () {
                script.dataset.loaded = 'true';
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function mountSharedVoiceTarget() {
        if (!root.WriteUrduWriterVoiceInput || typeof root.WriteUrduWriterVoiceInput.mountInputModeTextTargets !== 'function') return;
        root.WriteUrduWriterVoiceInput.mountInputModeTextTargets();
    }

    function ensureVoice() {
        if (dependencyPromise) return dependencyPromise;
        dependencyPromise = loadScript('/js/voice-input-core.js', 'data-urdu-cards-voice-core-script', function () {
            return Boolean(root.WriteUrduVoiceInput);
        }).then(function () {
            return loadScript('/js/unified-urdu-input.js', 'data-urdu-cards-unified-input-script', function () {
                return Boolean(root.WriteUrduUnifiedInput);
            });
        }).then(function () {
            return loadScript('/js/writer-voice-input.js', 'data-urdu-cards-writer-voice-script', function () {
                return Boolean(root.WriteUrduWriterVoiceInput);
            });
        }).then(function () {
            mountSharedVoiceTarget();
            return root.WriteUrduWriterVoiceInput;
        }).catch(function () {
            dependencyPromise = null;
            return null;
        });
        return dependencyPromise;
    }

    function stopVoice(page) {
        var method = page && page.querySelector('[data-wu-voice-method][aria-expanded="true"]');
        if (method) method.click();
    }

    function mount() {
        var page = document.querySelector('[data-urdu-cards]');
        var ownChoice = page && page.querySelector('[data-urdu-cards-start-choice="own-words"]');
        if (!page || !ownChoice) return false;
        if (page.dataset.urduCardsOwnWordsVoiceMounted === 'true') return true;

        ownChoice.addEventListener('click', function () {
            ensureVoice().then(mountSharedVoiceTarget);
        });

        page.addEventListener('click', function (event) {
            if (!event.target.closest('[data-urdu-cards-own-back], [data-urdu-cards-start-choice="ready-made"]')) return;
            stopVoice(page);
        });

        page.dataset.urduCardsOwnWordsVoiceMounted = 'true';
        if (ownChoice.getAttribute('aria-expanded') === 'true') ensureVoice().then(mountSharedVoiceTarget);

        root.WriteUrduCardsOwnWordsVoice = {
            ensure: ensureVoice,
            stop: function () { stopVoice(page); },
            getState: function () {
                var method = page.querySelector('[data-wu-voice-method]');
                var panel = page.querySelector('[data-wu-voice-panel]');
                return {
                    mounted: true,
                    dependenciesReady: Boolean(root.WriteUrduVoiceInput && root.WriteUrduUnifiedInput && root.WriteUrduWriterVoiceInput),
                    supported: method ? method.getAttribute('aria-disabled') !== 'true' : null,
                    panelOpen: Boolean(panel && !panel.hidden)
                };
            }
        };
        return true;
    }

    function retry(attempt) {
        if (mount()) return;
        if (attempt >= 30) return;
        root.requestAnimationFrame(function () { retry(attempt + 1); });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { retry(0); });
    else retry(0);
}(window));