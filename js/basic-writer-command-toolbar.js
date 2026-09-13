(function (root, factory) {
    'use strict';
    var api = factory(root);
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduBasicCommandToolbar = api;
}(typeof window !== 'undefined' ? window : null, function (root) {
    'use strict';

    var MOBILE_QUERY = '(max-width: 767px)';
    var OUTPUT_ACTIONS = ['pdf', 'word', 'png', 'svg', 'preview', 'print'];
    var DOWNLOAD_ACTIONS = ['pdf', 'word', 'png', 'svg', 'text'];
    var PRIMARY_DOCUMENT_ACTIONS = ['copy', 'preview', 'share', 'print'];
    var mediaQuery = null;
    var publishLoader = null;
    var voiceController = null;
    var aiWritingLoader = null;

    function normalizeRoute(value) {
        var path = String(value || '/').split('?')[0].split('#')[0] || '/';
        if (path === '/index' || path === '/index.html') return '/';
        if (/\.html$/i.test(path)) path = path.slice(0, -5);
        if (path.length > 1) path = path.replace(/\/+$/, '');
        return path || '/';
    }

    function isBasicRoute() {
        var path = root && root.location && root.location.pathname || '/';
        if (root && root.WriteUrduLocaleRoute && typeof root.WriteUrduLocaleRoute.productPath === 'function') {
            path = root.WriteUrduLocaleRoute.productPath(path);
        }
        return normalizeRoute(path) === '/';
    }

    function hasContent() {
        var editor = root && root.document && root.document.getElementById('transliterateTextarea');
        return Boolean(editor && String(editor.value || '').trim());
    }

    function ensureStyles() {
        if (!root || !root.document || root.document.querySelector('link[data-wu-basic-command-toolbar-style]')) return;
        var link = root.document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/basic-writer-command-toolbar.css';
        link.setAttribute('data-wu-basic-command-toolbar-style', '');
        root.document.head.appendChild(link);
    }

    function setAction(button, action, label, icon, kind) {
        if (!button) return null;
        button.type = 'button';
        button.classList.add('wu-basic-command');
        button.classList.add('wu-basic-command--' + (kind || 'utility'));
        button.setAttribute('data-wu-command-action', action);
        button.setAttribute('data-wu-basic-content-action', '');
        button.removeAttribute('data-wu-i18n-control');
        button.removeAttribute('data-wu-i18n-aria');
        button.removeAttribute('data-wu-i18n-title');
        button.setAttribute('aria-label', label);
        button.innerHTML = '<i class="' + icon + '" aria-hidden="true"></i><span>' + label + '</span>';
        return button;
    }

    var VOICE_EVENT_NAMES = {
        'voice-exposed': 'voice_exposed',
        'voice-selected': 'voice_selected',
        'voice-started': 'voice_started',
        'voice-final': 'voice_final',
        'voice-auto-open': 'voice_selected',
        'voice-switch-continued': 'voice_switch_continued',
        'voice-error': 'voice_error'
    };

    function telemetry(action, errorCategory) {
        if (!root || !root.WriteUrduTelemetry || typeof root.WriteUrduTelemetry.trackOutcome !== 'function') return;
        var voiceEventName = VOICE_EVENT_NAMES[action];
        if (voiceEventName) {
            var detail = { input_mode: 'voice' };
            if (voiceEventName === 'voice_error') detail.error_category = errorCategory;
            root.WriteUrduTelemetry.trackOutcome(voiceEventName, detail);
            return;
        }
        var detail = {
            workspace: 'basic-writer',
            action: action,
            hasContent: hasContent()
        };
        root.WriteUrduTelemetry.trackOutcome('basic_toolbar_action', detail);
    }

    function closeVoicePanel(methodButton, panel) {
        if (!methodButton || !panel) return;
        if (voiceController && voiceController.isListening()) voiceController.stop();
        panel.hidden = true;
        methodButton.classList.remove('is-active');
        methodButton.setAttribute('aria-expanded', 'false');
    }

    var AUTO_VOICE_PARAM = 'wu-voice';

    function consumeAutoVoiceFlag() {
        if (!root || !root.location || !root.URLSearchParams) return false;
        var params = new root.URLSearchParams(root.location.search);
        if (!params.has(AUTO_VOICE_PARAM)) return false;
        params.delete(AUTO_VOICE_PARAM);
        var query = params.toString();
        var next = root.location.pathname + (query ? '?' + query : '') + root.location.hash;
        if (root.history && typeof root.history.replaceState === 'function') root.history.replaceState(null, '', next);
        return true;
    }

    function openVoicePanelIfRequested(methodButton, panel) {
        if (!methodButton || !panel || !voiceController || !consumeAutoVoiceFlag()) return;
        if (!voiceController.isSupported() || !panel.hidden) return;
        panel.hidden = false;
        methodButton.classList.add('is-active');
        methodButton.setAttribute('aria-expanded', 'true');
        telemetry('voice-auto-open');
    }

    function createVoiceInput(surface, modeControl, editor) {
        if (!surface || !modeControl || !editor || !root.WriteUrduVoiceInput || !root.WriteUrduUnifiedInput) return null;
        var existing = modeControl.querySelector('[data-wu-basic-voice-method]');
        if (existing) return voiceController;

        var methodButton = root.document.createElement('button');
        methodButton.type = 'button';
        methodButton.id = 'wuBasicVoiceMethod';
        methodButton.className = 'input-mode-option wu-basic-voice-method';
        methodButton.setAttribute('data-wu-basic-voice-method', '');
        methodButton.setAttribute('data-wu-command-action', 'voice-select');
        methodButton.setAttribute('aria-expanded', 'false');
        methodButton.setAttribute('aria-controls', 'wuBasicVoicePanel');
        methodButton.innerHTML = '<i class="fas fa-microphone" aria-hidden="true"></i><span data-wu-basic-voice-label>Speak Urdu</span>';

        var panel = root.document.createElement('div');
        panel.id = 'wuBasicVoicePanel';
        panel.className = 'wu-basic-voice-panel';
        panel.setAttribute('data-wu-basic-voice-panel', '');
        panel.setAttribute('aria-labelledby', methodButton.id);
        panel.hidden = true;

        var actions = root.document.createElement('div');
        actions.className = 'wu-basic-voice-actions';
        var start = root.document.createElement('button');
        start.type = 'button';
        start.className = 'wu-basic-voice-action wu-basic-voice-action--start';
        start.setAttribute('data-wu-basic-voice-start', '');
        start.setAttribute('data-wu-command-action', 'voice-start');
        var stop = root.document.createElement('button');
        stop.type = 'button';
        stop.className = 'wu-basic-voice-action wu-basic-voice-action--stop';
        stop.setAttribute('data-wu-basic-voice-stop', '');
        stop.setAttribute('data-wu-command-action', 'voice-stop');
        stop.hidden = true;
        actions.appendChild(start);
        actions.appendChild(stop);

        var feedback = root.document.createElement('div');
        feedback.className = 'wu-basic-voice-feedback';
        var status = root.document.createElement('strong');
        status.setAttribute('data-wu-basic-voice-status', '');
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        var notice = root.document.createElement('span');
        notice.setAttribute('data-wu-basic-voice-notice', '');
        var interim = root.document.createElement('span');
        interim.className = 'wu-basic-voice-interim';
        interim.setAttribute('data-wu-basic-voice-interim', '');
        interim.setAttribute('aria-hidden', 'true');
        feedback.appendChild(status);
        feedback.appendChild(notice);
        feedback.appendChild(interim);
        panel.appendChild(actions);
        panel.appendChild(feedback);

        var sourceNote = modeControl.querySelector('[data-input-mode-note]');
        modeControl.insertBefore(methodButton, sourceNote || null);
        modeControl.appendChild(panel);

        var awaitingSwitchProxy = false;

        voiceController = root.WriteUrduUnifiedInput.createVoiceInputController({
            adapter: root.WriteUrduUnifiedInput.createTextControlAdapter(editor),
            elements: {
                root: panel,
                methodButton: methodButton,
                methodLabel: methodButton.querySelector('[data-wu-basic-voice-label]'),
                startButton: start,
                stopButton: stop,
                status: status,
                notice: notice,
                interim: interim
            },
            onStart: function () { awaitingSwitchProxy = false; telemetry('voice-started'); },
            onError: function (category) {
                if (category === 'aborted') return;
                telemetry('voice-error', category);
            },
            onFinal: function () {
                syncState(surface);
                awaitingSwitchProxy = true;
                telemetry('voice-final');
            }
        });

        methodButton.addEventListener('click', function () {
            if (!voiceController.isSupported()) return;
            var opening = panel.hidden;
            if (opening) {
                panel.hidden = false;
                methodButton.classList.add('is-active');
                methodButton.setAttribute('aria-expanded', 'true');
                telemetry('voice-selected');
            } else closeVoicePanel(methodButton, panel);
        });

        modeControl.querySelectorAll('[data-input-mode-option]').forEach(function (button) {
            button.addEventListener('click', function () {
                closeVoicePanel(methodButton, panel);
                if (awaitingSwitchProxy) {
                    awaitingSwitchProxy = false;
                    telemetry('voice-switch-continued');
                }
            });
        });

        telemetry('voice-exposed');
        return voiceController;
    }

    function notifyShareLoadError() {
        if (root.WriteUrduUI && typeof root.WriteUrduUI.notify === 'function') {
            root.WriteUrduUI.notify('Public sharing is still loading. Try again in a moment.', 'error');
            return;
        }
        if (root.alert) root.alert('Public sharing is still loading. Try again in a moment.');
    }

    function ensurePublicSharePublisher() {
        if (root.WriteUrduBasicPublish && typeof root.WriteUrduBasicPublish.open === 'function') {
            return Promise.resolve(root.WriteUrduBasicPublish);
        }
        if (publishLoader) return publishLoader;
        publishLoader = new Promise(function (resolve, reject) {
            var existing = root.document.querySelector('script[data-wu-basic-publish-loader],script[src$="/js/basic-writer-publish.js"]');
            function finish() {
                if (root.WriteUrduBasicPublish && typeof root.WriteUrduBasicPublish.open === 'function') resolve(root.WriteUrduBasicPublish);
                else reject(new Error('basic_share_publisher_unavailable'));
            }
            if (existing) {
                existing.addEventListener('load', finish, { once: true });
                root.setTimeout(finish, 1200);
                return;
            }
            var script = root.document.createElement('script');
            script.src = '/js/basic-writer-publish.js';
            script.setAttribute('data-wu-basic-publish-loader', '');
            script.onload = finish;
            script.onerror = function () { reject(new Error('basic_share_publisher_load_failed')); };
            root.document.head.appendChild(script);
        }).catch(function (error) {
            publishLoader = null;
            throw error;
        });
        return publishLoader;
    }

    function aiWritingLocale() {
        if (root.WriteUrduLocale && typeof root.WriteUrduLocale.get === 'function') return root.WriteUrduLocale.get() === 'ur' ? 'ur' : 'en';
        return root.document && /^ur\b/i.test(root.document.documentElement.lang || '') ? 'ur' : 'en';
    }

    function createAiWritingAdapter(editor) {
        return {
            getValue: function () { return editor.value || ''; },
            getSelectionRange: function () {
                var value = editor.value || '';
                var start = typeof editor.selectionStart === 'number' ? editor.selectionStart : value.length;
                var end = typeof editor.selectionEnd === 'number' ? editor.selectionEnd : start;
                return { start: start, end: end };
            },
            replaceRange: function (start, end, text) {
                var value = editor.value || '';
                editor.value = value.slice(0, start) + text + value.slice(end);
                var caret = start + text.length;
                editor.focus();
                if (typeof editor.setSelectionRange === 'function') editor.setSelectionRange(caret, caret);
                editor.dispatchEvent(new Event('input', { bubbles: true }));
                editor.dispatchEvent(new Event('change', { bubbles: true }));
            }
        };
    }

    function ensureAiWritingAssistant() {
        if (root.WriteUrduAiWriting && typeof root.WriteUrduAiWriting.mount === 'function') return Promise.resolve(root.WriteUrduAiWriting);
        if (aiWritingLoader) return aiWritingLoader;
        aiWritingLoader = new Promise(function (resolve, reject) {
            var existing = root.document.querySelector('script[data-wu-ai-writing-loader],script[src$="/js/ai-writing-assistant.js"]');
            function finish() {
                if (root.WriteUrduAiWriting && typeof root.WriteUrduAiWriting.mount === 'function') resolve(root.WriteUrduAiWriting);
                else reject(new Error('ai_writing_assistant_unavailable'));
            }
            if (existing) {
                existing.addEventListener('load', finish, { once: true });
                root.setTimeout(finish, 1200);
                return;
            }
            if (!root.document.querySelector('script[data-wu-ai-writing-age-gate-loader],script[src$="/js/ai-writing-age-gate.js"]')) {
                var ageGateScript = root.document.createElement('script');
                ageGateScript.src = '/js/ai-writing-age-gate.js';
                ageGateScript.setAttribute('data-wu-ai-writing-age-gate-loader', '');
                root.document.head.appendChild(ageGateScript);
            }
            if (!root.document.querySelector('link[data-wu-ai-writing-style]')) {
                var link = root.document.createElement('link');
                link.rel = 'stylesheet';
                link.href = '/css/ai-writing-assistant.css';
                link.setAttribute('data-wu-ai-writing-style', '');
                root.document.head.appendChild(link);
            }
            var script = root.document.createElement('script');
            script.src = '/js/ai-writing-assistant.js';
            script.setAttribute('data-wu-ai-writing-loader', '');
            script.onload = finish;
            script.onerror = function () { reject(new Error('ai_writing_assistant_load_failed')); };
            root.document.head.appendChild(script);
        }).catch(function (error) {
            aiWritingLoader = null;
            throw error;
        });
        return aiWritingLoader;
    }

    function mountAiWriting(surface, editor) {
        if (!surface || !editor) return;
        var primary = surface.querySelector('.wu-basic-command-primary') || surface;
        var discoveryContainer = surface.querySelector('[data-wu-ai-writing-discovery]');
        if (!discoveryContainer) {
            discoveryContainer = root.document.createElement('div');
            discoveryContainer.className = 'wu-basic-command-group wu-basic-command-ai-entry';
            discoveryContainer.setAttribute('data-wu-ai-writing-discovery', '');
            discoveryContainer.setAttribute('data-wu-basic-reveal-on-content', '');
            discoveryContainer.setAttribute('role', 'group');
            discoveryContainer.setAttribute('aria-label', aiWritingLocale() === 'ur' ? 'AI تحریری مدد' : 'AI writing help');
            discoveryContainer.hidden = !hasContent();
            discoveryContainer.setAttribute('aria-hidden', hasContent() ? 'false' : 'true');
            primary.parentNode.insertBefore(discoveryContainer, primary.nextSibling);
        }
        var host = root.document.querySelector('[data-wu-ai-writing-host]');
        if (!host) {
            host = root.document.createElement('section');
            host.id = 'ai-writing-assistant';
            host.className = 'wu-ai-writing-host';
            host.setAttribute('data-wu-ai-writing-host', '');
            host.setAttribute('aria-label', aiWritingLocale() === 'ur' ? 'AI تحریری معاون' : 'AI writing assistant');
            var editorFrame = editor.closest ? editor.closest('#demo') : null;
            editorFrame = editorFrame || editor;
            editorFrame.parentNode.insertBefore(host, editorFrame.nextSibling);
        }
        if (host.querySelector('[data-wu-ai-writing-group]')) return;
        ensureAiWritingAssistant().then(function (assistant) {
            return assistant.mount({
                container: host,
                adapter: createAiWritingAdapter(editor),
                locale: aiWritingLocale,
                editor: editor,
                discoveryContainer: discoveryContainer
            });
        }).then(function (group) {
            if (!group) {
                if (host.parentNode) host.parentNode.removeChild(host);
                if (discoveryContainer.parentNode) discoveryContainer.parentNode.removeChild(discoveryContainer);
                return;
            }
            syncState(surface);
            root.document.body.setAttribute('data-wu-ai-writing-available', 'true');
        }).catch(function () {
            if (host && !host.querySelector('[data-wu-ai-writing-group]') && host.parentNode) host.parentNode.removeChild(host);
            if (discoveryContainer && discoveryContainer.parentNode) discoveryContainer.parentNode.removeChild(discoveryContainer);
            /* Optional enhancement; toolbar works without it. */
        });
    }

    function mountCommunitySlot(surface) {
        if (!surface) return null;
        var primary = surface.querySelector('.wu-basic-command-primary') || surface;
        var slot = surface.querySelector('[data-wu-community-toolbar-slot]');
        if (slot) return slot;
        slot = root.document.createElement('div');
        slot.className = 'wu-basic-command-group wu-basic-command-community';
        slot.setAttribute('data-wu-community-toolbar-slot', '');
        slot.setAttribute('role', 'group');
        slot.setAttribute('aria-label', 'Publish to the community');
        primary.parentNode.insertBefore(slot, primary.nextSibling);
        return slot;
    }

    function runAuthoringShare() {
        if (!hasContent()) return false;
        ensurePublicSharePublisher().then(function (publisher) {
            publisher.open();
        }).catch(function () {
            notifyShareLoadError();
        });
        return true;
    }

    var COPY_COMPLETION_SEEN_KEY = 'wu-basic-copy-completion-seen';
    var copyCompletionTimer = null;

    function copyCompletionSeen() {
        try { return root.sessionStorage.getItem(COPY_COMPLETION_SEEN_KEY) === 'true'; }
        catch (error) { return false; }
    }

    function markCopyCompletionSeen() {
        try { root.sessionStorage.setItem(COPY_COMPLETION_SEEN_KEY, 'true'); }
        catch (error) { /* Private browsing or storage disabled; the strip just shows again. */ }
    }

    function growthRequestActive() {
        var panel = root.document.querySelector('[data-home-account-continuity]');
        return Boolean(panel && !panel.hidden);
    }

    function createCopyCompletion() {
        var strip = root.document.createElement('div');
        strip.className = 'wu-basic-copy-completion';
        strip.setAttribute('data-wu-basic-copy-completion', '');
        strip.setAttribute('role', 'status');
        strip.setAttribute('aria-live', 'polite');
        strip.hidden = true;

        var message = root.document.createElement('span');
        message.className = 'wu-basic-copy-completion-message';
        message.textContent = 'Copied.';

        var shareAction = root.document.createElement('button');
        shareAction.type = 'button';
        shareAction.className = 'wu-basic-copy-completion-share';
        shareAction.setAttribute('data-wu-basic-copy-completion-share', '');
        shareAction.textContent = 'Share this Urdu';

        var dismiss = root.document.createElement('button');
        dismiss.type = 'button';
        dismiss.className = 'wu-basic-copy-completion-dismiss';
        dismiss.setAttribute('data-wu-basic-copy-completion-dismiss', '');
        dismiss.setAttribute('aria-label', 'Dismiss');
        dismiss.innerHTML = '&times;';

        strip.appendChild(message);
        strip.appendChild(shareAction);
        strip.appendChild(dismiss);
        return strip;
    }

    function hideCopyCompletion(strip) {
        if (!strip) return;
        strip.hidden = true;
        root.clearTimeout(copyCompletionTimer);
    }

    function maybeShowCopyCompletion(strip) {
        if (!strip || strip.hidden === false || copyCompletionSeen() || growthRequestActive()) return;
        markCopyCompletionSeen();
        strip.hidden = false;
        telemetry('copy-continuation-shown');
        root.clearTimeout(copyCompletionTimer);
        copyCompletionTimer = root.setTimeout(function () { hideCopyCompletion(strip); }, 8000);
    }

    function closeSiblingDisclosures(wrapper) {
        var surface = wrapper && wrapper.closest('[data-wu-basic-command-surface]');
        if (!surface) return;
        surface.querySelectorAll('[data-wu-basic-disclosure]').forEach(function (other) {
            if (other === wrapper) return;
            var panel = other.querySelector('[data-wu-basic-disclosure-panel]');
            var toggle = other.querySelector('[aria-expanded]');
            if (panel && !panel.hidden) panel.hidden = true;
            other.classList.remove('is-open');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
        });
    }

    function createDownloadMenu(filenameLabel, filenameInput, textExport, outputButtons) {
        var wrapper = root.document.createElement('div');
        wrapper.className = 'wu-basic-command-download';
        wrapper.setAttribute('data-wu-basic-download', '');
        wrapper.setAttribute('data-wu-basic-disclosure', '');

        var toggle = root.document.createElement('button');
        setAction(toggle, 'download-menu', 'Download', 'fas fa-download', 'download');
        toggle.setAttribute('data-wu-basic-download-toggle', '');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', 'wuBasicCommandDownloadPanel');
        toggle.innerHTML = '<i class="fas fa-download" aria-hidden="true"></i><span>Download</span><i class="fas fa-chevron-down wu-basic-command-chevron" aria-hidden="true"></i>';

        var panel = root.document.createElement('div');
        panel.id = 'wuBasicCommandDownloadPanel';
        panel.className = 'wu-basic-command-download-panel';
        panel.setAttribute('data-wu-basic-download-panel', '');
        panel.setAttribute('data-wu-basic-disclosure-panel', '');
        panel.hidden = true;

        var heading = root.document.createElement('strong');
        heading.className = 'wu-basic-command-popover-heading';
        heading.textContent = 'Download document';
        panel.appendChild(heading);

        var fileOptions = root.document.createElement('div');
        fileOptions.className = 'wu-basic-command-download-file';
        if (filenameLabel) fileOptions.appendChild(filenameLabel);
        if (filenameInput) fileOptions.appendChild(filenameInput);
        panel.appendChild(fileOptions);

        var list = root.document.createElement('div');
        list.className = 'wu-basic-command-download-list';
        list.setAttribute('role', 'group');
        list.setAttribute('aria-label', 'Download formats');
        (outputButtons || []).forEach(function (button) { if (button) list.appendChild(button); });
        if (textExport) list.appendChild(textExport);
        panel.appendChild(list);

        wrapper.appendChild(toggle);
        wrapper.appendChild(panel);

        function close(focusToggle) {
            panel.hidden = true;
            wrapper.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            if (focusToggle) toggle.focus();
        }

        toggle.addEventListener('click', function () {
            if (toggle.disabled) return;
            var opening = panel.hidden;
            if (opening) {
                closeSiblingDisclosures(wrapper);
                panel.hidden = false;
                wrapper.classList.add('is-open');
                toggle.setAttribute('aria-expanded', 'true');
            } else close(false);
        });
        list.addEventListener('click', function (event) {
            var action = event.target.closest && event.target.closest('[data-wu-command-action]');
            if (action && !action.disabled) root.setTimeout(function () { close(false); }, 0);
        });
        root.document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && !panel.hidden) close(true);
        });
        root.document.addEventListener('click', function (event) {
            if (!panel.hidden && !wrapper.contains(event.target)) close(false);
        });
        return wrapper;
    }

    function createMoreMenu(settingsPanel, clearButton) {
        var wrapper = root.document.createElement('div');
        wrapper.className = 'wu-basic-command-more';
        wrapper.setAttribute('data-wu-basic-more', '');
        wrapper.setAttribute('data-wu-basic-disclosure', '');

        var toggle = root.document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'wu-basic-command wu-basic-command--more';
        toggle.setAttribute('data-wu-basic-more-toggle', '');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', 'wuBasicCommandMorePanel');
        toggle.innerHTML = '<i class="fas fa-ellipsis-h" aria-hidden="true"></i><span>More</span>';

        var panel = root.document.createElement('div');
        panel.id = 'wuBasicCommandMorePanel';
        panel.className = 'wu-basic-command-more-panel';
        panel.setAttribute('data-wu-basic-more-panel', '');
        panel.setAttribute('data-wu-basic-disclosure-panel', '');
        panel.hidden = true;

        var mobileSection = root.document.createElement('div');
        mobileSection.className = 'wu-basic-command-more-section wu-basic-command-mobile-document-actions';
        mobileSection.setAttribute('data-wu-basic-mobile-document-actions', '');
        mobileSection.setAttribute('aria-label', 'More document actions');
        mobileSection.hidden = true;
        panel.appendChild(mobileSection);

        if (settingsPanel) {
            var settingsSection = root.document.createElement('div');
            settingsSection.className = 'wu-basic-command-more-section';
            settingsSection.setAttribute('data-wu-basic-editor-options', '');
            var settingsHeading = root.document.createElement('strong');
            settingsHeading.className = 'wu-basic-command-popover-heading';
            settingsHeading.textContent = 'Editor options';
            settingsSection.appendChild(settingsHeading);
            while (settingsPanel.firstChild) settingsSection.appendChild(settingsPanel.firstChild);
            panel.appendChild(settingsSection);
        }

        if (clearButton) {
            var taskSection = root.document.createElement('div');
            taskSection.className = 'wu-basic-command-more-section wu-basic-command-more-task';
            taskSection.setAttribute('data-wu-basic-task-options', '');
            taskSection.appendChild(clearButton);
            panel.appendChild(taskSection);
        }

        wrapper.appendChild(toggle);
        wrapper.appendChild(panel);

        function close(focusToggle) {
            panel.hidden = true;
            wrapper.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            if (focusToggle) toggle.focus();
        }

        toggle.addEventListener('click', function () {
            var opening = panel.hidden;
            if (opening) {
                closeSiblingDisclosures(wrapper);
                panel.hidden = false;
                wrapper.classList.add('is-open');
                toggle.setAttribute('aria-expanded', 'true');
            } else close(false);
        });
        root.document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && !panel.hidden) close(true);
        });
        root.document.addEventListener('click', function (event) {
            if (!panel.hidden && !wrapper.contains(event.target)) close(false);
        });
        return wrapper;
    }

    function syncModeHelper(surface) {
        if (!surface) return;
        var source = surface.querySelector('[data-input-mode-note]');
        var target = surface.querySelector('[data-wu-basic-mode-helper]');
        if (source && target) target.textContent = source.textContent || '';
    }

    function syncState(surface) {
        if (!surface) return false;
        var enabled = hasContent();
        surface.setAttribute('data-wu-has-content', enabled ? 'true' : 'false');
        surface.querySelectorAll('[data-wu-basic-content-action]').forEach(function (button) {
            if ('disabled' in button) button.disabled = !enabled;
            button.setAttribute('aria-disabled', enabled ? 'false' : 'true');
        });
        surface.querySelectorAll('[data-wu-basic-reveal-on-content]').forEach(function (element) {
            element.hidden = !enabled;
            element.setAttribute('aria-hidden', enabled ? 'false' : 'true');
        });
        syncResponsiveOutputs(surface);
        return enabled;
    }

    function syncResponsiveOutputs(surface) {
        if (!surface) return;
        mediaQuery = mediaQuery || (root.matchMedia ? root.matchMedia(MOBILE_QUERY) : null);
        var compact = Boolean(mediaQuery && mediaQuery.matches);
        var primary = surface.querySelector('[data-wu-basic-primary-actions]');
        var mobileGroup = surface.querySelector('[data-wu-basic-mobile-document-actions]');
        var print = surface.querySelector('[data-wu-command-action="print"]');
        var more = surface.querySelector('[data-wu-basic-more]');
        if (!primary || !mobileGroup || !print || !more) return;
        var destination = compact ? mobileGroup : primary;
        if (print.parentElement !== destination) {
            if (compact) destination.appendChild(print);
            else primary.insertBefore(print, more);
        }
        mobileGroup.hidden = !compact;
        mobileGroup.setAttribute('aria-hidden', compact ? 'false' : 'true');
        surface.setAttribute('data-wu-output-layout', compact ? 'compact' : 'direct');
    }

    function removeEmptyLegacyContainer(container) {
        if (!container || container.closest('[data-wu-basic-command-surface]')) return;
        var meaningful = container.querySelector('button,a,input,textarea,select,details,[role="toolbar"]');
        if (!meaningful && !String(container.textContent || '').trim()) container.remove();
    }

    function build() {
        if (!root || !root.document || !isBasicRoute()) return null;
        var existing = root.document.querySelector('[data-wu-basic-command-surface]');
        if (existing) {
            var existingEditor = root.document.getElementById('transliterateTextarea');
            var existingModeControl = existing.querySelector('[data-input-mode-control]');
            createVoiceInput(existing, existingModeControl, existingEditor);
            if (existingModeControl) {
                openVoicePanelIfRequested(
                    existingModeControl.querySelector('[data-wu-basic-voice-method]'),
                    existingModeControl.querySelector('[data-wu-basic-voice-panel]')
                );
            }
            syncModeHelper(existing);
            syncState(existing);
            syncResponsiveOutputs(existing);
            mountCommunitySlot(existing);
            mountAiWriting(existing, existingEditor);
            return existing;
        }

        var editor = root.document.getElementById('transliterateTextarea');
        var demo = root.document.getElementById('demo');
        var actions = root.document.querySelector('.home-actions');
        var editorChrome = root.document.querySelector('.editor-chrome');
        if (!editor || !demo || !actions || !editorChrome || !demo.parentNode) return null;

        ensureStyles();

        var legacyContainer = actions.closest('.container');
        var primary = actions.querySelector('.home-actions-group-primary');
        var exportDetails = primary && primary.querySelector('details.action-menu');
        var exportPanel = exportDetails && exportDetails.querySelector('.action-menu-panel');
        var secondary = actions.querySelector('.home-actions-group-secondary');
        var settingsDetails = secondary && secondary.querySelector('details.action-menu');
        var settingsPanel = settingsDetails && settingsDetails.querySelector('.action-menu-panel.settings-panel');
        var legacyShare = secondary && secondary.querySelector('[data-write-urdu-share]');
        if (legacyShare) legacyShare.remove();

        var share = root.document.createElement('button');
        share.type = 'button';
        share.setAttribute('data-wu-basic-share', '');
        var copy = primary && primary.querySelector('[data-copy-target="#transliterateTextarea"]');
        var pdf = exportPanel && exportPanel.querySelector('#exportPdf');
        var word = exportPanel && exportPanel.querySelector('#exportWord');
        var png = exportPanel && exportPanel.querySelector('#exportImage');
        var svg = exportPanel && exportPanel.querySelector('#exportSvg');
        var preview = exportPanel && exportPanel.querySelector('#previewExport');
        var print = exportPanel && exportPanel.querySelector('#PrintCurrentText');
        var filenameLabel = exportPanel && exportPanel.querySelector('label[for="inputFileNameToSaveAs"]');
        var filenameInput = exportPanel && exportPanel.querySelector('#inputFileNameToSaveAs');
        var textExport = exportPanel && exportPanel.querySelector('button[onclick*="saveTextAsFile"]');
        var modeControl = editorChrome.querySelector('[data-input-mode-control]');
        var spinner = editorChrome.querySelector('#spinner');
        var clear = editorChrome.querySelector('#clear');
        var shortcut = editorChrome.querySelector('.editor-shortcut');
        if (clear) clear.classList.remove('btn-clear');
        if (!copy || !pdf || !word || !png || !preview || !print || !modeControl || !clear || !textExport) return null;

        var surface = root.document.createElement('section');
        surface.className = 'wu-basic-command-surface';
        surface.setAttribute('data-wu-basic-command-surface', '');
        surface.setAttribute('aria-label', 'Basic Writer controls');

        actions.innerHTML = '';
        actions.hidden = false;
        actions.removeAttribute('hidden');
        actions.className = 'home-actions wu-basic-command-toolbar';
        actions.setAttribute('data-wu-basic-command-toolbar', '');
        actions.setAttribute('data-wu-core-actionbar', 'pre-editor');
        actions.setAttribute('aria-label', 'Writing and document actions');

        var primaryGroup = root.document.createElement('div');
        primaryGroup.className = 'wu-basic-command-group wu-basic-command-primary';
        primaryGroup.setAttribute('data-wu-basic-primary-actions', '');
        primaryGroup.setAttribute('role', 'group');
        primaryGroup.setAttribute('aria-label', 'Document actions');

        setAction(copy, 'copy', 'Copy', 'far fa-copy', 'copy');
        copy.setAttribute('data-wu-basic-reveal-on-content', '');
        setAction(preview, 'preview', 'Preview', 'far fa-eye', 'document');
        preview.setAttribute('data-wu-basic-reveal-on-content', '');
        setAction(share, 'share', 'Share', 'fas fa-share-alt', 'share');
        share.setAttribute('title', 'Create a short Write Urdu link');
        share.setAttribute('data-wu-basic-reveal-on-content', '');
        setAction(print, 'print', 'Print', 'fas fa-print', 'document');
        print.setAttribute('data-wu-basic-reveal-on-content', '');

        setAction(pdf, 'pdf', 'PDF', 'fas fa-file-pdf', 'download-item');
        setAction(word, 'word', 'Word', 'fas fa-file-word', 'download-item');
        setAction(png, 'png', 'PNG', 'fas fa-image', 'download-item');
        if (svg) setAction(svg, 'svg', 'SVG', 'far fa-file-image', 'download-item');
        setAction(textExport, 'text', 'Text file', 'far fa-file-alt', 'download-item');

        setAction(clear, 'clear', 'Clear document', 'far fa-trash-alt', 'clear');
        clear.setAttribute('data-wu-basic-reveal-on-content', '');

        var download = createDownloadMenu(filenameLabel, filenameInput, textExport, [pdf, word, png, svg]);
        var more = createMoreMenu(settingsPanel, clear);

        primaryGroup.appendChild(copy);
        primaryGroup.appendChild(preview);
        primaryGroup.appendChild(download);
        primaryGroup.appendChild(share);
        primaryGroup.appendChild(print);
        primaryGroup.appendChild(more);

        var modeGroup = root.document.createElement('div');
        modeGroup.className = 'wu-basic-command-group wu-basic-command-mode';
        modeGroup.setAttribute('role', 'group');
        modeGroup.setAttribute('aria-label', 'Input mode');
        modeControl.classList.add('wu-basic-input-mode');
        var sourceNote = modeControl.querySelector('[data-input-mode-note]');
        if (sourceNote) sourceNote.classList.add('wu-basic-mode-note-source');
        modeGroup.appendChild(modeControl);

        actions.appendChild(primaryGroup);
        actions.appendChild(modeGroup);

        var helper = root.document.createElement('div');
        helper.className = 'wu-basic-command-helper';
        helper.setAttribute('data-wu-basic-command-helper', '');
        var helperText = root.document.createElement('span');
        helperText.setAttribute('data-wu-basic-mode-helper', '');
        helperText.setAttribute('aria-live', 'polite');
        helperText.innerHTML = '<i class="fas fa-magic" aria-hidden="true"></i><span></span>';
        var helperCopy = helperText.querySelector('span');
        helperCopy.setAttribute('data-wu-basic-mode-helper-copy', '');
        helperText.removeAttribute('data-wu-basic-mode-helper');
        helperCopy.setAttribute('data-wu-basic-mode-helper', '');
        helper.appendChild(helperText);
        if (spinner) {
            spinner.classList.add('wu-basic-command-spinner');
            helper.appendChild(spinner);
        }
        if (shortcut) {
            shortcut.className = 'wu-basic-command-shortcut';
            shortcut.innerHTML = '<kbd>Ctrl+G</kbd>';
            helper.appendChild(shortcut);
        } else {
            shortcut = root.document.createElement('span');
            shortcut.className = 'wu-basic-command-shortcut';
            shortcut.innerHTML = '<kbd>Ctrl+G</kbd>';
            helper.appendChild(shortcut);
        }

        var copyCompletion = createCopyCompletion();

        surface.appendChild(actions);
        surface.appendChild(copyCompletion);
        surface.appendChild(helper);
        demo.parentNode.insertBefore(surface, demo);

        editorChrome.remove();
        root.document.body.setAttribute('data-wu-basic-command-toolbar', 'true');
        removeEmptyLegacyContainer(legacyContainer);

        share.addEventListener('click', runAuthoringShare);

        copyCompletion.querySelector('[data-wu-basic-copy-completion-share]').addEventListener('click', function () {
            telemetry('copy-continuation-share-selected');
            hideCopyCompletion(copyCompletion);
            runAuthoringShare();
        });
        copyCompletion.querySelector('[data-wu-basic-copy-completion-dismiss]').addEventListener('click', function () {
            telemetry('copy-continuation-dismissed');
            hideCopyCompletion(copyCompletion);
        });
        root.document.addEventListener('write-urdu:copy-completed', function (event) {
            if (!event || !event.detail || event.detail.target !== '#transliterateTextarea') return;
            root.setTimeout(function () { maybeShowCopyCompletion(copyCompletion); }, 0);
        });

        if (actions.getAttribute('data-wu-toolbar-telemetry-bound') !== 'true') {
            actions.setAttribute('data-wu-toolbar-telemetry-bound', 'true');
            actions.addEventListener('click', function (event) {
                var button = event.target.closest && event.target.closest('[data-wu-command-action]');
                if (!button || button.disabled) return;
                telemetry(button.getAttribute('data-wu-command-action'));
            });
        }

        editor.addEventListener('input', function () { syncState(surface); });
        clear.addEventListener('click', function () { root.setTimeout(function () { syncState(surface); }, 0); });
        modeControl.addEventListener('write-urdu:input-mode-change', function () { root.setTimeout(function () { syncModeHelper(surface); }, 0); });
        root.document.addEventListener('write-urdu:handoff-imported', function () { root.setTimeout(function () { syncState(surface); }, 0); });
        root.document.addEventListener('write-urdu:locale-change', function () { root.setTimeout(function () { syncModeHelper(surface); }, 0); });
        root.document.addEventListener('write-urdu:locale-changed', function () { root.setTimeout(function () { syncModeHelper(surface); }, 0); });
        root.document.addEventListener('write-urdu:locale-change', function () { if (root.WriteUrduAiWriting && typeof root.WriteUrduAiWriting.refreshLocale === 'function') root.WriteUrduAiWriting.refreshLocale(surface, aiWritingLocale()); });
        root.document.addEventListener('write-urdu:locale-changed', function () { if (root.WriteUrduAiWriting && typeof root.WriteUrduAiWriting.refreshLocale === 'function') root.WriteUrduAiWriting.refreshLocale(surface, aiWritingLocale()); });

        createVoiceInput(surface, modeControl, editor);
        openVoicePanelIfRequested(
            modeControl.querySelector('[data-wu-basic-voice-method]'),
            modeControl.querySelector('[data-wu-basic-voice-panel]')
        );
        root.document.addEventListener('write-urdu:locale-change', function () { if (voiceController) voiceController.refreshLocale(); });
        root.document.addEventListener('write-urdu:locale-changed', function () { if (voiceController) voiceController.refreshLocale(); });

        mediaQuery = root.matchMedia ? root.matchMedia(MOBILE_QUERY) : null;
        if (mediaQuery) {
            var mediaHandler = function () { syncResponsiveOutputs(surface); };
            if (typeof mediaQuery.addEventListener === 'function') mediaQuery.addEventListener('change', mediaHandler);
            else if (typeof mediaQuery.addListener === 'function') mediaQuery.addListener(mediaHandler);
        }

        syncState(surface);
        syncResponsiveOutputs(surface);
        syncModeHelper(surface);
        mountCommunitySlot(surface);
        mountAiWriting(surface, editor);
        root.setTimeout(function () { syncModeHelper(surface); syncState(surface); }, 100);
        root.setTimeout(function () { syncModeHelper(surface); syncState(surface); }, 700);
        return surface;
    }

    function run() {
        if (!isBasicRoute()) return false;
        ensureStyles();
        return Boolean(build());
    }

    if (root && root.document) {
        if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', run, { once: true });
        else run();
    }

    return {
        MOBILE_QUERY: MOBILE_QUERY,
        OUTPUT_ACTIONS: OUTPUT_ACTIONS.slice(),
        DOWNLOAD_ACTIONS: DOWNLOAD_ACTIONS.slice(),
        PRIMARY_DOCUMENT_ACTIONS: PRIMARY_DOCUMENT_ACTIONS.slice(),
        normalizeRoute: normalizeRoute,
        hasContent: hasContent,
        syncState: syncState,
        syncModeHelper: syncModeHelper,
        syncResponsiveOutputs: syncResponsiveOutputs,
        createVoiceInput: createVoiceInput,
        runAuthoringShare: runAuthoringShare,
        build: build,
        run: run
    };
}));
