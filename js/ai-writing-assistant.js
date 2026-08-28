(function (root, factory) {
    'use strict';
    var api = factory(root);
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduAiWriting = api;
}(typeof window !== 'undefined' ? window : null, function (root) {
    'use strict';

    // Host adapter contract (see createAiWritingAdapter in js/basic-writer-command-toolbar.js):
    //   getValue(): string
    //   getSelectionRange(): { start, end }
    //   replaceRange(start, end, text): void  — must dispatch input/change and keep the editor focused

    var CONFIG_ENDPOINT = '/api/form-config';
    var SUBMIT_ENDPOINT = '/api/ai-writing';
    var TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    var TURNSTILE_ACTION = 'ai-writing';
    var REQUEST_TIMEOUT_MS = 25000;
    var TOKEN_TIMEOUT_MS = 8000;

    var ACTIONS = ['fix', 'improve', 'simplify', 'formal', 'friendly', 'shorten', 'expand', 'summarize'];

    var COMMAND_LABEL = {
        en: { fix: 'Fix Urdu', improve: 'Improve writing', simplify: 'Make simpler', formal: 'Make formal', friendly: 'Make friendly', shorten: 'Shorten', expand: 'Expand', summarize: 'Summarize', menu: 'More improvements', menuToggle: 'Choose another AI writing action', busy: 'Working on your Urdu…' },
        ur: { fix: 'اردو درست کریں', improve: 'تحریر بہتر بنائیں', simplify: 'آسان بنائیں', formal: 'رسمی انداز', friendly: 'دوستانہ انداز', shorten: 'مختصر کریں', expand: 'تفصیل بڑھائیں', summarize: 'خلاصہ کریں', menu: 'مزید بہتری', menuToggle: 'مزید AI تحریری اختیارات منتخب کریں', busy: 'آپ کی اردو پر کام ہو رہا ہے…' }
    };

    var ACTION_HELP = {
        en: { improve: 'Clearer, more natural Urdu', simplify: 'Easier everyday wording', formal: 'Respectful professional tone', friendly: 'Warm conversational tone', shorten: 'Keep the point, lose repetition', expand: 'Add clarity without inventing facts', summarize: 'Keep only the main points' },
        ur: { improve: 'زیادہ واضح اور قدرتی اردو', simplify: 'آسان روزمرہ الفاظ', formal: 'باادب اور پیشہ ورانہ انداز', friendly: 'نرم اور دوستانہ انداز', shorten: 'بات برقرار، تکرار کم', expand: 'نئی بات شامل کیے بغیر وضاحت', summarize: 'صرف اہم نکات رکھیں' }
    };

    var DISCOVERY_COPY = {
        en: {
            eyebrow: 'AI writing assistant', badge: '18+', title: 'Make your Urdu clearer',
            body: 'Fix mistakes, simplify difficult wording, or change tone while keeping your original safe.',
            scope: 'Select text for a precise change, or place your cursor in a paragraph.',
            jump: 'AI writing', jumpTitle: 'Open AI writing help', empty: 'Write or paste some Urdu first, then choose AI writing.',
            menuHeading: 'Choose how to improve it', ready: 'Your suggestion is ready. Review it before changing your writing.'
        },
        ur: {
            eyebrow: 'AI تحریری معاون', badge: '18+', title: 'اپنی اردو مزید واضح بنائیں',
            body: 'اصل تحریر محفوظ رکھتے ہوئے غلطیاں درست کریں، مشکل الفاظ آسان بنائیں یا انداز بدلیں۔',
            scope: 'خاص تبدیلی کے لیے متن منتخب کریں، یا کرسر کسی پیراگراف میں رکھیں۔',
            jump: 'AI تحریر', jumpTitle: 'AI تحریری مدد کھولیں', empty: 'پہلے کچھ اردو لکھیں یا پیسٹ کریں، پھر AI تحریری مدد منتخب کریں۔',
            menuHeading: 'بہتری کا طریقہ منتخب کریں', ready: 'آپ کی تجویز تیار ہے۔ تحریر بدلنے سے پہلے اسے دیکھ لیں۔'
        }
    };

    var RESULT_LABEL = {
        en: { fix: 'Suggested fix', improve: 'Improved version', simplify: 'Simpler version', formal: 'Formal version', friendly: 'Friendly version', shorten: 'Shorter version', expand: 'Expanded version', summarize: 'Summary' },
        ur: { fix: 'تجویز کردہ درستگی', improve: 'بہتر بنایا گیا متن', simplify: 'آسان متن', formal: 'رسمی متن', friendly: 'دوستانہ متن', shorten: 'مختصر متن', expand: 'تفصیلی متن', summarize: 'خلاصہ' }
    };

    var PANEL_LABEL = {
        en: { replace: 'Replace', insertBelow: 'Insert below', copy: 'Copy', keep: 'Keep original', undo: 'Undo', replaced: 'Replaced.', copied: 'Copied.', emptyScope: 'Select text or place your cursor in a paragraph, then try again.' },
        ur: { replace: 'تبدیل کریں', insertBelow: 'نیچے شامل کریں', copy: 'کاپی کریں', keep: 'اصل رکھیں', undo: 'واپس کریں', replaced: 'تبدیل کر دیا گیا۔', copied: 'کاپی ہو گیا۔', emptyScope: 'پہلے متن منتخب کریں یا کرسر کسی پیراگراف میں رکھیں، پھر دوبارہ کوشش کریں۔' }
    };

    var FAILURE_COPY = {
        en: {
            'invalid-input': "That text couldn't be used. Try adjusting it and try again.",
            'too-large': 'That selection is too long for AI writing help right now.',
            'rate-limited': 'AI writing help is busy right now. Please try again shortly.',
            'provider-unavailable': "AI writing help isn't available right now. Your writing is unchanged.",
            timeout: 'That took too long. Your writing is unchanged. Try again.',
            refused: "We couldn't verify that request. Please try again.",
            'invalid-output': "We couldn't improve this text right now. Your writing is unchanged.",
            'budget-exhausted': "AI writing help has reached today's limit. Please try again later.",
            default: "We couldn't improve this text right now. Your writing is unchanged."
        },
        ur: {
            'invalid-input': 'یہ متن استعمال نہیں ہو سکا۔ اسے تبدیل کر کے دوبارہ کوشش کریں۔',
            'too-large': 'یہ انتخاب AI تحریری مدد کے لیے فی الحال زیادہ طویل ہے۔',
            'rate-limited': 'AI تحریری مدد اس وقت مصروف ہے۔ براہ کرم تھوڑی دیر بعد کوشش کریں۔',
            'provider-unavailable': 'AI تحریری مدد اس وقت دستیاب نہیں۔ آپ کی تحریر محفوظ ہے۔',
            timeout: 'اس میں زیادہ وقت لگ گیا۔ آپ کی تحریر محفوظ ہے۔ دوبارہ کوشش کریں۔',
            refused: 'ہم اس درخواست کی تصدیق نہ کر سکے۔ دوبارہ کوشش کریں۔',
            'invalid-output': 'ہم ابھی یہ متن بہتر نہ کر سکے۔ آپ کی تحریر محفوظ ہے۔',
            'budget-exhausted': 'AI تحریری مدد کی آج کی حد مکمل ہو چکی۔ بعد میں کوشش کریں۔',
            default: 'ہم ابھی یہ متن بہتر نہ کر سکے۔ آپ کی تحریر محفوظ ہے۔'
        }
    };

    var configPromise = null;
    var turnstileLoader = null;
    var turnstileWidgetId = null;
    var pendingToken = null;

    function lang(options) {
        if (options && typeof options.locale === 'function') return options.locale() === 'ur' ? 'ur' : 'en';
        return root && root.document && root.document.documentElement && root.document.documentElement.lang === 'ur' ? 'ur' : 'en';
    }

    function notify(message, type) {
        if (root && root.WriteUrduUI && typeof root.WriteUrduUI.notify === 'function') root.WriteUrduUI.notify(message, type);
    }

    function telemetry(eventName, detail) {
        if (root && root.WriteUrduTelemetry && typeof root.WriteUrduTelemetry.trackOutcome === 'function') {
            root.WriteUrduTelemetry.trackOutcome(eventName, detail || {});
        }
    }

    function getConfig() {
        if (configPromise) return configPromise;
        configPromise = fetch(CONFIG_ENDPOINT, { headers: { Accept: 'application/json' }, credentials: 'same-origin', cache: 'no-store' })
            .then(function (response) {
                if (!response.ok) throw new Error('config-unavailable');
                return response.json();
            })
            .catch(function () {
                configPromise = null;
                return { aiWritingEnabled: false };
            });
        return configPromise;
    }

    function loadTurnstile() {
        if (root.turnstile) return Promise.resolve(root.turnstile);
        if (turnstileLoader) return turnstileLoader;
        turnstileLoader = new Promise(function (resolve, reject) {
            var script = root.document.createElement('script');
            script.src = TURNSTILE_SCRIPT;
            script.async = true;
            script.defer = true;
            script.addEventListener('load', function () { resolve(root.turnstile); }, { once: true });
            script.addEventListener('error', function () { reject(new Error('turnstile-load-failed')); }, { once: true });
            root.document.head.appendChild(script);
        });
        return turnstileLoader;
    }

    // Renders one invisible, manually-executed Turnstile widget and reuses it for
    // every AI writing request so the control never blocks a normal keystroke.
    function getToken(siteKey, hiddenHost) {
        return loadTurnstile().then(function (turnstile) {
            return new Promise(function (resolve, reject) {
                var settled = false;
                function finish(fn, value) {
                    if (settled) return;
                    settled = true;
                    pendingToken = null;
                    fn(value);
                }
                pendingToken = {
                    resolve: function (token) { finish(resolve, token); },
                    reject: function (error) { finish(reject, error); }
                };
                if (turnstileWidgetId === null) {
                    turnstileWidgetId = turnstile.render(hiddenHost, {
                        sitekey: siteKey,
                        action: TURNSTILE_ACTION,
                        size: 'invisible',
                        execution: 'execute',
                        retry: 'never',
                        callback: function (token) { if (pendingToken) pendingToken.resolve(token); },
                        'error-callback': function () { if (pendingToken) pendingToken.reject(new Error('turnstile-error')); },
                        'expired-callback': function () { if (pendingToken) pendingToken.reject(new Error('turnstile-expired')); }
                    });
                } else {
                    turnstile.reset(turnstileWidgetId);
                }
                turnstile.execute(turnstileWidgetId);
                root.setTimeout(function () { finish(reject, new Error('turnstile-timeout')); }, TOKEN_TIMEOUT_MS);
            });
        });
    }

    function computeScope(adapter) {
        var value = adapter.getValue();
        var range = adapter.getSelectionRange();
        var start = range.start;
        var end = range.end;
        if (end > start) return { text: value.slice(start, end), start: start, end: end, kind: 'selection' };
        var before = value.lastIndexOf('\n\n', Math.max(0, start - 1));
        var paraStart = before === -1 ? 0 : before + 2;
        var afterIdx = value.indexOf('\n\n', start);
        var paraEnd = afterIdx === -1 ? value.length : afterIdx;
        return { text: value.slice(paraStart, paraEnd), start: paraStart, end: paraEnd, kind: 'paragraph' };
    }

    function createEntryPoint(activeLang, onAction) {
        var group = root.document.createElement('div');
        group.className = 'wu-ai-writing-group';
        group.setAttribute('data-wu-ai-writing-group', '');
        group.setAttribute('role', 'group');
        group.setAttribute('aria-label', COMMAND_LABEL[activeLang].menu);

        var fixButton = root.document.createElement('button');
        fixButton.type = 'button';
        fixButton.className = 'wu-ai-writing-command wu-ai-writing-command--fix';
        fixButton.setAttribute('data-wu-ai-writing-action', 'fix');
        fixButton.setAttribute('data-wu-basic-content-action', '');
        fixButton.innerHTML = '<i class="fas fa-magic" aria-hidden="true"></i><span>' + COMMAND_LABEL[activeLang].fix + '</span>';

        var details = root.document.createElement('details');
        details.className = 'wu-ai-writing-menu';
        details.setAttribute('data-wu-ai-writing-menu', '');

        var summary = root.document.createElement('summary');
        summary.className = 'wu-ai-writing-command wu-ai-writing-command--menu';
        summary.setAttribute('data-wu-basic-content-action', '');
        summary.setAttribute('aria-label', COMMAND_LABEL[activeLang].menuToggle);
        summary.innerHTML = '<span>' + COMMAND_LABEL[activeLang].menu + '</span><i class="fas fa-caret-down" aria-hidden="true"></i>';
        details.appendChild(summary);

        var list = root.document.createElement('div');
        list.className = 'wu-ai-writing-menu-panel';
        var menuHeading = root.document.createElement('strong');
        menuHeading.className = 'wu-ai-writing-menu-heading';
        menuHeading.setAttribute('data-wu-ai-writing-menu-heading', '');
        menuHeading.textContent = DISCOVERY_COPY[activeLang].menuHeading;
        list.appendChild(menuHeading);
        ACTIONS.filter(function (action) { return action !== 'fix'; }).forEach(function (action) {
            var item = root.document.createElement('button');
            item.type = 'button';
            item.className = 'wu-ai-writing-menu-item';
            item.setAttribute('data-wu-ai-writing-action', action);
            item.innerHTML = '<span>' + COMMAND_LABEL[activeLang][action] + '</span><small>' + ACTION_HELP[activeLang][action] + '</small>';
            list.appendChild(item);
        });
        details.appendChild(list);

        group.appendChild(fixButton);
        group.appendChild(details);

        group.addEventListener('click', function (event) {
            var target = event.target.closest && event.target.closest('[data-wu-ai-writing-action]');
            if (!target || target.disabled) return;
            details.open = false;
            onAction(target.getAttribute('data-wu-ai-writing-action'));
        });

        root.document.addEventListener('click', function (event) {
            if (details.open && !details.contains(event.target)) details.open = false;
        });

        return group;
    }

    function createAssistantIntro(activeLang, group) {
        var copy = DISCOVERY_COPY[activeLang];
        var shell = root.document.createElement('div');
        shell.className = 'wu-ai-writing-shell';

        var intro = root.document.createElement('div');
        intro.className = 'wu-ai-writing-intro';
        intro.innerHTML =
            '<div class="wu-ai-writing-eyebrow"><i class="fas fa-magic" aria-hidden="true"></i><span data-wu-ai-writing-eyebrow>' + copy.eyebrow + '</span><span class="wu-ai-writing-age-badge">' + copy.badge + '</span></div>' +
            '<strong class="wu-ai-writing-title" data-wu-ai-writing-title>' + copy.title + '</strong>' +
            '<p data-wu-ai-writing-body>' + copy.body + '</p>';

        var commands = root.document.createElement('div');
        commands.className = 'wu-ai-writing-commands';
        commands.appendChild(group);
        var scope = root.document.createElement('small');
        scope.className = 'wu-ai-writing-scope';
        scope.setAttribute('data-wu-ai-writing-scope', '');
        scope.textContent = copy.scope;
        commands.appendChild(scope);

        shell.appendChild(intro);
        shell.appendChild(commands);
        return shell;
    }

    function createDiscoveryJump(options, activeLang, group) {
        var discoveryContainer = options.discoveryContainer;
        if (!discoveryContainer || discoveryContainer.querySelector('[data-wu-ai-writing-jump]')) return null;
        var copy = DISCOVERY_COPY[activeLang];
        var jump = root.document.createElement('button');
        jump.type = 'button';
        jump.className = 'wu-basic-command wu-basic-command--ai';
        jump.setAttribute('data-wu-ai-writing-jump', '');
        jump.setAttribute('title', copy.jumpTitle);
        jump.innerHTML = '<i class="fas fa-magic" aria-hidden="true"></i><span>' + copy.jump + '</span><small>AI</small>';
        jump.addEventListener('click', function () {
            if (!String(options.adapter.getValue() || '').trim()) {
                notify(copy.empty, 'info');
                if (options.editor && typeof options.editor.focus === 'function') options.editor.focus();
                return;
            }
            options.container.classList.add('is-guided');
            options.container.scrollIntoView({ behavior: root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
            root.setTimeout(function () {
                options.container.classList.remove('is-guided');
                var firstAction = group.querySelector('[data-wu-ai-writing-action]');
                if (firstAction) firstAction.focus();
            }, 450);
        });
        discoveryContainer.appendChild(jump);
        return jump;
    }

    function createResultPanel() {
        var panel = root.document.createElement('div');
        panel.className = 'wu-ai-writing-panel';
        panel.setAttribute('data-wu-ai-writing-panel', '');
        panel.hidden = true;
        panel.setAttribute('role', 'region');

        var status = root.document.createElement('div');
        status.className = 'wu-ai-writing-status';
        status.setAttribute('aria-live', 'polite');
        status.setAttribute('data-wu-ai-writing-status', '');

        var context = root.document.createElement('strong');
        context.className = 'wu-ai-writing-context';
        context.setAttribute('tabindex', '-1');

        var resultText = root.document.createElement('div');
        resultText.className = 'wu-ai-writing-result-text';
        resultText.setAttribute('dir', 'rtl');
        resultText.setAttribute('lang', 'ur');

        var actions = root.document.createElement('div');
        actions.className = 'wu-ai-writing-panel-actions';

        function actionButton(key, className, activeLang) {
            var button = root.document.createElement('button');
            button.type = 'button';
            button.className = 'wu-ai-writing-panel-action ' + className;
            button.setAttribute('data-wu-ai-writing-panel-action', key);
            button.textContent = PANEL_LABEL[activeLang][key];
            return button;
        }

        panel.appendChild(status);
        panel.appendChild(context);
        panel.appendChild(resultText);
        panel.appendChild(actions);

        return { root: panel, status: status, context: context, resultText: resultText, actions: actions, actionButton: actionButton };
    }

    function mount(options) {
        options = options || {};
        var container = options.container;
        var adapter = options.adapter;
        if (!root || !root.document || !container || !adapter) return Promise.resolve(null);
        if (container.querySelector('[data-wu-ai-writing-group]')) return Promise.resolve(container.querySelector('[data-wu-ai-writing-group]'));

        return getConfig().then(function (config) {
            if (!config || !config.aiWritingEnabled || !config.turnstileSiteKey) return null;
            var existingGroup = container.querySelector('[data-wu-ai-writing-group]');
            if (existingGroup) return existingGroup;

            var activeLang = lang(options);
            var hiddenHost = root.document.createElement('div');
            hiddenHost.className = 'wu-ai-writing-turnstile-host';
            hiddenHost.setAttribute('aria-hidden', 'true');

            var panelParts = createResultPanel();
            var replaceButton = panelParts.actionButton('replace', 'wu-ai-writing-panel-action--primary', activeLang);
            var insertButton = panelParts.actionButton('insertBelow', '', activeLang);
            var copyButton = panelParts.actionButton('copy', '', activeLang);
            var keepButton = panelParts.actionButton('keep', '', activeLang);
            [replaceButton, insertButton, copyButton, keepButton].forEach(function (button) { panelParts.actions.appendChild(button); });

            var busy = false;
            var currentUndo = null;

            function setBusy(next) {
                busy = next;
                panelParts.status.textContent = next ? COMMAND_LABEL[activeLang].busy : '';
                group.querySelectorAll('[data-wu-ai-writing-action]').forEach(function (button) { button.disabled = next; });
            }

            function showFailure(code) {
                var copyMap = FAILURE_COPY[activeLang];
                notify(copyMap[code] || copyMap.default, 'error');
            }

            function closePanel() {
                panelParts.root.hidden = true;
                panelParts.status.textContent = '';
                currentUndo = null;
            }

            function resetPanelActions() {
                [replaceButton, insertButton, copyButton, keepButton].forEach(function (button) { button.hidden = false; });
                keepButton.textContent = PANEL_LABEL[activeLang].keep;
            }

            function showResult(action, text, scope) {
                resetPanelActions();
                panelParts.context.textContent = RESULT_LABEL[activeLang][action] || RESULT_LABEL[activeLang].fix;
                panelParts.resultText.textContent = text;
                panelParts.status.textContent = DISCOVERY_COPY[activeLang].ready;
                panelParts.root.hidden = false;
                panelParts.context.focus();

                replaceButton.onclick = function () {
                    var beforeValue = adapter.getValue();
                    adapter.replaceRange(scope.start, scope.end, text);
                    currentUndo = beforeValue;
                    panelParts.status.textContent = PANEL_LABEL[activeLang].replaced;
                    telemetry('ai_writing_applied', { format: 'replace' });
                    insertButton.hidden = true;
                    copyButton.hidden = true;
                    replaceButton.hidden = true;
                    keepButton.textContent = PANEL_LABEL[activeLang].undo;
                    keepButton.onclick = function () {
                        if (currentUndo !== null) {
                            adapter.replaceRange(0, adapter.getValue().length, currentUndo);
                            telemetry('ai_writing_applied', { format: 'undo' });
                        }
                        closePanel();
                    };
                };

                insertButton.onclick = function () {
                    var value = adapter.getValue();
                    var needsBreak = scope.end > 0 && value.charAt(scope.end - 1) !== '\n';
                    adapter.replaceRange(scope.end, scope.end, (needsBreak ? '\n\n' : '') + text);
                    telemetry('ai_writing_applied', { format: 'insert-below' });
                    closePanel();
                };

                copyButton.onclick = function () {
                    if (root.navigator && root.navigator.clipboard && root.navigator.clipboard.writeText) {
                        root.navigator.clipboard.writeText(text).then(function () {
                            panelParts.status.textContent = PANEL_LABEL[activeLang].copied;
                        }).catch(function () { });
                    }
                    telemetry('ai_writing_applied', { format: 'copy' });
                };

                keepButton.onclick = function () {
                    telemetry('ai_writing_applied', { format: 'keep-original' });
                    closePanel();
                };
            }

            function runAction(action) {
                if (busy) return;
                var scope = computeScope(adapter);
                if (!scope.text || !scope.text.trim()) {
                    notify(PANEL_LABEL[activeLang].emptyScope, 'error');
                    return;
                }

                var ageGate = root.WriteUrduAiWritingAgeGate;
                var ackPromise = ageGate && typeof ageGate.ensureAccepted === 'function'
                    ? ageGate.ensureAccepted({ locale: activeLang })
                    : Promise.resolve(true);

                ackPromise.then(function (accepted) {
                    if (!accepted) return;
                    setBusy(true);
                    telemetry('ai_writing_started', { format: action });

                    getToken(config.turnstileSiteKey, hiddenHost).then(function (token) {
                        var controller = root.AbortController ? new root.AbortController() : null;
                        var timer = root.setTimeout(function () { if (controller) controller.abort(); }, REQUEST_TIMEOUT_MS);
                        return fetch(SUBMIT_ENDPOINT, {
                            method: 'POST',
                            headers: { 'content-type': 'application/json' },
                            credentials: 'same-origin',
                            signal: controller ? controller.signal : undefined,
                            body: JSON.stringify({ version: 1, action: action, text: scope.text, 'cf-turnstile-response': token })
                        }).finally(function () { root.clearTimeout(timer); });
                    }).then(function (response) {
                        return response.json().catch(function () { return {}; }).then(function (body) { return { ok: response.ok, body: body }; });
                    }).then(function (result) {
                        setBusy(false);
                        if (!result.ok || !result.body || !result.body.ok) {
                            var code = (result.body && result.body.code) || 'provider-unavailable';
                            showFailure(code);
                            telemetry('ai_writing_completed', { format: action, success: false, error_category: code });
                            return;
                        }
                        showResult(action, result.body.result, scope);
                        telemetry('ai_writing_completed', { format: action, success: true });
                    }).catch(function () {
                        setBusy(false);
                        showFailure('provider-unavailable');
                        telemetry('ai_writing_completed', { format: action, success: false, error_category: 'network' });
                    });
                });
            }

            var group = createEntryPoint(activeLang, runAction);
            container.appendChild(createAssistantIntro(activeLang, group));
            container.appendChild(hiddenHost);
            container.appendChild(panelParts.root);
            createDiscoveryJump(options, activeLang, group);
            return group;
        });
    }

    function refreshLocale(container, nextLang) {
        nextLang = nextLang === 'ur' ? 'ur' : 'en';
        var group = container && container.querySelector('[data-wu-ai-writing-group]');
        if (!group) return false;
        var fixSpan = group.querySelector('[data-wu-ai-writing-action="fix"] span');
        if (fixSpan) fixSpan.textContent = COMMAND_LABEL[nextLang].fix;
        var menuSpan = group.querySelector('summary span');
        if (menuSpan) menuSpan.textContent = COMMAND_LABEL[nextLang].menu;
        var copy = DISCOVERY_COPY[nextLang];
        var host = group.closest('[data-wu-ai-writing-host]') || container;
        var eyebrow = host.querySelector('[data-wu-ai-writing-eyebrow]');
        var title = host.querySelector('[data-wu-ai-writing-title]');
        var body = host.querySelector('[data-wu-ai-writing-body]');
        var scope = host.querySelector('[data-wu-ai-writing-scope]');
        var menuHeading = host.querySelector('[data-wu-ai-writing-menu-heading]');
        if (eyebrow) eyebrow.textContent = copy.eyebrow;
        if (title) title.textContent = copy.title;
        if (body) body.textContent = copy.body;
        if (scope) scope.textContent = copy.scope;
        if (menuHeading) menuHeading.textContent = copy.menuHeading;
        host.setAttribute('aria-label', copy.eyebrow);
        group.querySelectorAll('.wu-ai-writing-menu-item').forEach(function (item) {
            var action = item.getAttribute('data-wu-ai-writing-action');
            if (action && COMMAND_LABEL[nextLang][action]) item.innerHTML = '<span>' + COMMAND_LABEL[nextLang][action] + '</span><small>' + ACTION_HELP[nextLang][action] + '</small>';
        });
        var jump = root.document.querySelector('[data-wu-ai-writing-jump]');
        if (jump) {
            jump.setAttribute('title', copy.jumpTitle);
            var jumpLabel = jump.querySelector('span');
            if (jumpLabel) jumpLabel.textContent = copy.jump;
            var discovery = jump.closest('[data-wu-ai-writing-discovery]');
            if (discovery) discovery.setAttribute('aria-label', copy.eyebrow);
        }
        return true;
    }

    return {
        ACTIONS: ACTIONS.slice(),
        mount: mount,
        refreshLocale: refreshLocale,
        computeScope: computeScope
    };
}));
