(function (root, factory) {
    'use strict';
    var api = factory(root);
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduWriterVoiceInput = api;
}(typeof window !== 'undefined' ? window : null, function (root) {
    'use strict';

    var voiceController = null;
    var DISCOVERY_COPY = {
        en: {
            intro: 'Type, paste or speak Urdu.',
            helper: 'Use the mic when speaking is faster than typing.'
        },
        ur: {
            intro: 'اردو ٹائپ کریں، پیسٹ کریں یا بول کر لکھیں۔',
            helper: 'جب بولنا آسان ہو تو مائیک استعمال کریں۔'
        }
    };

    function locale() {
        if (!root || !root.document || !root.document.documentElement) return 'en';
        return root.document.documentElement.lang === 'ur' ? 'ur' : 'en';
    }

    function discoveryText(key) {
        var current = DISCOVERY_COPY[locale()] || DISCOVERY_COPY.en;
        return current[key] || DISCOVERY_COPY.en[key] || '';
    }

    function ensureStyles() {
        if (!root || !root.document || root.document.querySelector('link[data-wu-writer-voice-style]')) return;
        var link = root.document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/writer-voice-input.css';
        link.setAttribute('data-wu-writer-voice-style', '');
        root.document.head.appendChild(link);
    }

    var VOICE_EVENT_NAMES = {
        'voice-exposed': 'voice_exposed',
        'voice-selected': 'voice_selected',
        'voice-started': 'voice_started',
        'voice-final': 'voice_final',
        'voice-switch-continued': 'voice_switch_continued',
        'voice-error': 'voice_error'
    };

    function telemetry(workspace, action, errorCategory) {
        if (!root || !root.WriteUrduTelemetry || typeof root.WriteUrduTelemetry.trackOutcome !== 'function') return;
        var eventName = VOICE_EVENT_NAMES[action];
        if (!eventName) return;
        var detail = { input_mode: 'voice' };
        if (eventName === 'voice_error') detail.error_category = errorCategory;
        root.WriteUrduTelemetry.trackOutcome(eventName, detail);
    }

    function buildWidget(idPrefix) {
        var methodButton = root.document.createElement('button');
        methodButton.type = 'button';
        methodButton.id = idPrefix + 'Method';
        methodButton.className = 'input-mode-option wu-voice-method';
        methodButton.setAttribute('data-wu-voice-method', '');
        methodButton.setAttribute('aria-expanded', 'false');
        methodButton.setAttribute('aria-controls', idPrefix + 'Panel');
        methodButton.innerHTML = '<span class="wu-voice-method-icon" aria-hidden="true"><i class="fas fa-microphone"></i></span><span data-wu-voice-label>Speak Urdu</span>';

        var panel = root.document.createElement('div');
        panel.id = idPrefix + 'Panel';
        panel.className = 'wu-voice-panel';
        panel.setAttribute('data-wu-voice-panel', '');
        panel.setAttribute('aria-labelledby', methodButton.id);
        panel.hidden = true;

        var actions = root.document.createElement('div');
        actions.className = 'wu-voice-actions';
        var start = root.document.createElement('button');
        start.type = 'button';
        start.className = 'wu-voice-action wu-voice-action--start';
        start.setAttribute('data-wu-voice-start', '');
        var stop = root.document.createElement('button');
        stop.type = 'button';
        stop.className = 'wu-voice-action wu-voice-action--stop';
        stop.setAttribute('data-wu-voice-stop', '');
        stop.hidden = true;
        actions.appendChild(start);
        actions.appendChild(stop);

        var feedback = root.document.createElement('div');
        feedback.className = 'wu-voice-feedback';
        var status = root.document.createElement('strong');
        status.setAttribute('data-wu-voice-status', '');
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        var notice = root.document.createElement('span');
        notice.setAttribute('data-wu-voice-notice', '');
        var interim = root.document.createElement('span');
        interim.className = 'wu-voice-interim';
        interim.setAttribute('data-wu-voice-interim', '');
        interim.setAttribute('aria-hidden', 'true');
        feedback.appendChild(status);
        feedback.appendChild(notice);
        feedback.appendChild(interim);
        panel.appendChild(actions);
        panel.appendChild(feedback);

        return { methodButton: methodButton, panel: panel, start: start, stop: stop, status: status, notice: notice, interim: interim };
    }

    function mountDiscoveryIntro(control) {
        if (!control) return null;
        control.setAttribute('data-wu-voice-promoted', '');
        var existing = control.querySelector('[data-wu-voice-discovery-copy]');
        if (existing) return existing;

        var intro = root.document.createElement('span');
        intro.className = 'wu-voice-discovery-copy';
        intro.setAttribute('data-wu-voice-discovery-copy', '');
        intro.innerHTML = '<strong data-wu-voice-discovery-intro></strong><span data-wu-voice-discovery-helper></span>';

        var title = control.querySelector('[data-input-mode-title], .input-mode-title');
        if (title && title.nextSibling) control.insertBefore(intro, title.nextSibling);
        else control.insertBefore(intro, control.firstChild || null);
        refreshDiscoveryIntro(intro);
        return intro;
    }

    function refreshDiscoveryIntro(intro) {
        if (!intro) return;
        var heading = intro.querySelector('[data-wu-voice-discovery-intro]');
        var helper = intro.querySelector('[data-wu-voice-discovery-helper]');
        if (heading) heading.textContent = discoveryText('intro');
        if (helper) helper.textContent = discoveryText('helper');
    }

    function placeFeaturedMethod(control, methodButton, note) {
        var directButton = control.querySelector('[data-input-mode-option="direct"]');
        if (directButton) control.insertBefore(methodButton, directButton);
        else control.insertBefore(methodButton, note || null);
    }

    function promoteControlBeforeTarget(control, target) {
        if (!control || !target || !target.parentNode || control.parentNode !== target.parentNode) return;
        if (control.nextElementSibling === target) return;
        target.parentNode.insertBefore(control, target);
    }

    function closePanel(widget) {
        if (voiceController && voiceController.isListening()) voiceController.stop();
        widget.panel.hidden = true;
        widget.methodButton.classList.remove('is-active');
        widget.methodButton.setAttribute('aria-expanded', 'false');
    }

    function wireController(widget, adapter, workspace, intro) {
        if (!root.WriteUrduVoiceInput || !root.WriteUrduUnifiedInput) return null;

        var awaitingSwitchProxy = false;
        widget.noteModeSwitch = function () {
            if (!awaitingSwitchProxy) return;
            awaitingSwitchProxy = false;
            telemetry(workspace, 'voice-switch-continued');
        };

        voiceController = root.WriteUrduUnifiedInput.createVoiceInputController({
            adapter: adapter,
            elements: {
                root: widget.panel,
                methodButton: widget.methodButton,
                methodLabel: widget.methodButton.querySelector('[data-wu-voice-label]'),
                startButton: widget.start,
                stopButton: widget.stop,
                status: widget.status,
                notice: widget.notice,
                interim: widget.interim
            },
            onStart: function () { awaitingSwitchProxy = false; telemetry(workspace, 'voice-started'); },
            onFinal: function () { awaitingSwitchProxy = true; telemetry(workspace, 'voice-final'); },
            onError: function (category) {
                if (category === 'aborted') return;
                telemetry(workspace, 'voice-error', category);
            }
        });

        widget.methodButton.addEventListener('click', function () {
            if (!voiceController.isSupported()) return;
            var opening = widget.panel.hidden;
            if (opening) {
                widget.panel.hidden = false;
                widget.methodButton.classList.add('is-active');
                widget.methodButton.setAttribute('aria-expanded', 'true');
                telemetry(workspace, 'voice-selected');
            } else closePanel(widget);
        });

        function refreshLocale() {
            if (voiceController) voiceController.refreshLocale();
            refreshDiscoveryIntro(intro);
        }
        root.document.addEventListener('write-urdu:locale-change', refreshLocale);
        root.document.addEventListener('write-urdu:locale-changed', refreshLocale);

        telemetry(workspace, 'voice-exposed');
        return voiceController;
    }

    function createRichTextAdapter(editor) {
        return {
            insertText: function (text) {
                var holder = root.document.createElement('div');
                holder.textContent = text;
                editor.insertContent(holder.innerHTML);
            }
        };
    }

    function mountRichEditor() {
        var modeControl = root.document.querySelector('.input-mode-control-rich[data-input-mode-control]');
        if (!modeControl || modeControl.querySelector('[data-wu-voice-method]')) return;

        var attempts = 0;
        var timer = root.setInterval(function () {
            attempts += 1;
            var editor = root.tinymce && root.tinymce.get && root.tinymce.get('basic-example');
            if (editor && editor.initialized) {
                root.clearInterval(timer);
                ensureStyles();

                var intro = mountDiscoveryIntro(modeControl);
                var widget = buildWidget('wuRichVoice');
                var note = modeControl.querySelector('[data-input-mode-note]');
                placeFeaturedMethod(modeControl, widget.methodButton, note);
                modeControl.appendChild(widget.panel);

                wireController(widget, createRichTextAdapter(editor), 'rich_editor', intro);

                modeControl.querySelectorAll('[data-input-mode-option]').forEach(function (button) {
                    button.addEventListener('click', function () {
                        closePanel(widget);
                        if (widget.noteModeSwitch) widget.noteModeSwitch();
                    });
                });
            } else if (attempts > 100) {
                root.clearInterval(timer);
            }
        }, 100);
    }

    var CREATION_WORKSPACE_ALIASES = {
        card: 'card_studio',
        'whatsapp-status': 'whatsapp_status',
        'instagram-post': 'instagram',
        'stylish-text': 'stylish'
    };

    function mountInputModeTextTargets() {
        if (!root.document || !root.WriteUrduUnifiedInput) return;
        var controls = root.document.querySelectorAll('[data-input-mode-control][data-input-mode-targets]');
        controls.forEach(function (control) {
            if (control.classList.contains('input-mode-control-rich')) return;
            if (control.querySelector('[data-wu-voice-method]')) return;

            var targetSelector = String(control.getAttribute('data-input-mode-targets') || '').split(',')[0].trim();
            var target = targetSelector && root.document.querySelector(targetSelector);
            if (!target || typeof target.value === 'undefined') return;

            ensureStyles();

            var storageId = control.getAttribute('data-input-mode-storage') || 'creation';
            var workspace = CREATION_WORKSPACE_ALIASES[storageId] || storageId.replace(/-/g, '_');
            var intro = mountDiscoveryIntro(control);
            var widget = buildWidget('wuVoice' + storageId.replace(/[^a-zA-Z0-9]/g, ''));
            var note = control.querySelector('[data-input-mode-note]');
            placeFeaturedMethod(control, widget.methodButton, note);
            control.appendChild(widget.panel);
            promoteControlBeforeTarget(control, target);

            wireController(widget, root.WriteUrduUnifiedInput.createTextControlAdapter(target), workspace, intro);

            control.querySelectorAll('[data-input-mode-option]').forEach(function (button) {
                button.addEventListener('click', function () {
                    closePanel(widget);
                    if (widget.noteModeSwitch) widget.noteModeSwitch();
                });
            });
        });
    }

    function mountNameArt() {
        if (!root.document || !root.WriteUrduUnifiedInput) return;
        var target = root.document.querySelector('[data-name-art-text]');
        var actions = root.document.querySelector('.name-art-text-actions');
        if (!target || !actions || actions.querySelector('[data-wu-voice-method]')) return;

        ensureStyles();

        var widget = buildWidget('wuNameArtVoice');
        widget.methodButton.classList.add('wu-voice-method--standalone');
        actions.appendChild(widget.methodButton);
        actions.appendChild(widget.panel);

        var caution = root.document.createElement('span');
        caution.className = 'name-art-convert-note';
        caution.setAttribute('data-wu-voice-name-caution', '');
        caution.textContent = 'Voice works best for short names or phrases. Check the spelling before creating art.';
        actions.appendChild(caution);

        wireController(widget, root.WriteUrduUnifiedInput.createTextControlAdapter(target), 'name_art', null);
    }

    function mountKeyboard() {
        var textarea = root.document.getElementById('write');
        var toolbar = root.document.querySelector('.keyboard-actions');
        if (!textarea || !toolbar || !toolbar.parentNode || root.document.querySelector('[data-wu-voice-widget]')) return;
        if (!root.WriteUrduUnifiedInput) return;

        ensureStyles();

        var widget = buildWidget('wuKeyboardVoice');
        widget.methodButton.classList.add('btn', 'btn-outline-success', 'btn-sm', 'wu-voice-method--standalone');

        var container = root.document.createElement('div');
        container.className = 'wu-voice-widget';
        container.setAttribute('data-wu-voice-widget', '');
        var intro = root.document.createElement('span');
        intro.className = 'wu-voice-discovery-copy wu-voice-discovery-copy--standalone';
        intro.setAttribute('data-wu-voice-discovery-copy', '');
        intro.innerHTML = '<strong data-wu-voice-discovery-intro></strong><span data-wu-voice-discovery-helper></span>';
        refreshDiscoveryIntro(intro);
        container.appendChild(intro);
        container.appendChild(widget.methodButton);
        container.appendChild(widget.panel);
        toolbar.parentNode.insertBefore(container, toolbar.nextSibling);

        wireController(widget, root.WriteUrduUnifiedInput.createTextControlAdapter(textarea), 'urdu_keyboard', intro);
    }

    function boot() {
        if (!root || !root.document) return;
        if (root.document.getElementById('basic-example')) mountRichEditor();
        else if (root.document.getElementById('write')) mountKeyboard();
        mountInputModeTextTargets();
        mountNameArt();
    }

    if (root && root.document) {
        if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', boot, { once: true });
        else boot();
    }

    return {
        mountRichEditor: mountRichEditor,
        mountKeyboard: mountKeyboard,
        mountInputModeTextTargets: mountInputModeTextTargets,
        mountNameArt: mountNameArt,
        mountDiscoveryIntro: mountDiscoveryIntro,
        promoteControlBeforeTarget: promoteControlBeforeTarget
    };
}));
