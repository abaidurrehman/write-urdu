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
        en: { fix: 'Fix Urdu', improve: 'Improve writing', simplify: 'Simplify', formal: 'Make formal', friendly: 'Make friendly', shorten: 'Shorten', expand: 'Expand', summarize: 'Summarize', menu: 'Improve', menuToggle: 'More AI writing actions', busy: 'Working on your Urdu…' },
        ur: { fix: 'اردو درست کریں', improve: 'تحریر بہتر بنائیں', simplify: 'آسان بنائیں', formal: 'رسمی انداز', friendly: 'دوستانہ انداز', shorten: 'مختصر کریں', expand: 'تفصیل بڑھائیں', summarize: 'خلاصہ کریں', menu: 'بہتر بنائیں', menuToggle: 'مزید AI تحریری اختیارات', busy: 'آپ کی اردو پر کام ہو رہا ہے…' }
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
        fixButton.innerHTML = '<i class="fas fa-wand-magic-sparkles" aria-hidden="true"></i><span>' + COMMAND_LABEL[activeLang].fix + '</span>';

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
        ACTIONS.filter(function (action) { return action !== 'fix'; }).forEach(function (action) {
            var item = root.document.createElement('button');
            item.type = 'button';
            item.className = 'wu-ai-writing-menu-item';
            item.setAttribute('data-wu-ai-writing-action', action);
            item.textContent = COMMAND_LABEL[activeLang][action];
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

        var resultText = root.document.createElement('div');
        resultText.className = 'wu-ai-writing-result-text';
        resultText.setAttribute('dir', 'auto');

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
                panelParts.root.hidden = false;

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
            container.appendChild(group);
            container.appendChild(hiddenHost);
            container.appendChild(panelParts.root);
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
        group.querySelectorAll('.wu-ai-writing-menu-item').forEach(function (item) {
            var action = item.getAttribute('data-wu-ai-writing-action');
            if (action && COMMAND_LABEL[nextLang][action]) item.textContent = COMMAND_LABEL[nextLang][action];
        });
        return true;
    }

    return {
        ACTIONS: ACTIONS.slice(),
        mount: mount,
        refreshLocale: refreshLocale,
        computeScope: computeScope
    };
}));
