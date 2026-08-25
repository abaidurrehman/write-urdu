(function () {
    'use strict';

    var ENDPOINT = '/api/events';
    var SESSION_KEY = 'write-urdu:telemetry-session:v1';
    var QUEUE_LIMIT = 10;
    var FLUSH_DELAY = 4500;
    var ACTIVE_WINDOW_MS = 15000;
    var CORE_EDITOR_ROUTES = ['/', '/urdu-editor', '/urdu-keyboard'];
    var queue = [];
    var flushTimer = null;
    var engaged = false;
    var lastActivityAt = 0;
    var activeSeconds = 0;
    var summarySent = false;
    var editorReader = null;
    var currentInputMode = 'unknown';
    var outcomeHooksInstalled = false;
    var copyWatchToken = 0;
    var trackedOnce = Object.create(null);

    function normalizedPath(value) {
        if (typeof window !== 'undefined' && window.WriteUrduLocaleRoute && typeof window.WriteUrduLocaleRoute.productPath === 'function') return window.WriteUrduLocaleRoute.productPath(value || '/');
        var path = String(value || '/').split('?')[0].split('#')[0].replace(/\.html$/i, '').replace(/\/+$/, '') || '/';
        if (path === '/index') path = '/';
        return /^\/[a-z0-9\/-]*$/i.test(path) ? path : '/';
    }

    function currentLocale() {
        if (typeof window !== 'undefined' && window.WriteUrduLocaleRoute && typeof window.WriteUrduLocaleRoute.locale === 'function') {
            return window.WriteUrduLocaleRoute.locale(window.location.pathname) === 'ur' ? 'ur' : 'en';
        }
        return /^\/urdu(?:\/|$)/i.test(String(window.location.pathname || '/')) ? 'ur' : 'en';
    }

    function toolForRoute(path) {
        var tools = {
            '/': 'basic_editor',
            '/urdu-editor': 'rich_editor',
            '/urdu-keyboard': 'urdu_keyboard',
            '/urdu-card-studio': 'card_studio',
            '/stylish-urdu-text-generator': 'stylish_text',
            '/urdu-name-art-maker': 'name_art',
            '/urdu-whatsapp-status-maker': 'whatsapp_status',
            '/urdu-instagram-post-maker': 'instagram_post',
            '/urdu-invoice-generator': 'invoice_generator',
            '/qr-code-generator': 'qr_generator',
            '/tools/urdu-voice-typing': 'voice_typing'
        };
        return tools[path] || 'content';
    }

    function randomId() {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
        var bytes = new Uint8Array(16);
        if (window.crypto && typeof window.crypto.getRandomValues === 'function') window.crypto.getRandomValues(bytes);
        else for (var i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
        return Array.prototype.map.call(bytes, function (value) { return value.toString(16).padStart(2, '0'); }).join('');
    }

    function sessionId() {
        try {
            var existing = window.sessionStorage.getItem(SESSION_KEY);
            if (existing) return existing;
            var created = randomId();
            window.sessionStorage.setItem(SESSION_KEY, created);
            return created;
        } catch (error) {
            return randomId();
        }
    }

    var session = sessionId();
    var route = normalizedPath(window.location.pathname);
    var locale = currentLocale();
    var tool = toolForRoute(route);

    function deviceClass() {
        var width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        if (width < 600) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }

    function lengthBucket(length) {
        if (length === null || typeof length === 'undefined') return null;
        var count = Math.max(0, Number(length) || 0);
        if (!count) return '0';
        if (count <= 20) return '1-20';
        if (count <= 50) return '21-50';
        if (count <= 100) return '51-100';
        if (count <= 250) return '101-250';
        if (count <= 500) return '251-500';
        if (count <= 1000) return '501-1000';
        if (count <= 2500) return '1001-2500';
        return '2500+';
    }

    function activeTimeBucket(seconds) {
        var count = Math.max(0, Math.round(Number(seconds) || 0));
        if (count <= 10) return '0-10s';
        if (count <= 30) return '11-30s';
        if (count <= 60) return '31-60s';
        if (count <= 180) return '61-180s';
        if (count <= 600) return '181-600s';
        return '600s+';
    }

    function textLength() {
        if (!editorReader) return null;
        try {
            return String(editorReader() || '').trim().length;
        } catch (error) {
            return null;
        }
    }

    function payload(eventName, detail) {
        detail = detail || {};
        return {
            event_id: randomId(),
            session_id: session,
            route: route,
            locale: locale,
            tool: tool,
            event_name: eventName,
            format: detail.format || null,
            length_bucket: detail.length_bucket || null,
            active_time_bucket: detail.active_time_bucket || null,
            input_mode: detail.input_mode || null,
            success: typeof detail.success === 'boolean' ? detail.success : null,
            device_class: deviceClass(),
            target_route: detail.target_route ? normalizedPath(detail.target_route) : null
        };
    }

    function scheduleFlush() {
        if (flushTimer || queue.length === 0) return;
        flushTimer = window.setTimeout(function () {
            flushTimer = null;
            flush(false);
        }, FLUSH_DELAY);
    }

    function track(eventName, detail) {
        if (!eventName || queue.length >= 50) return;
        queue.push(payload(eventName, detail));
        if (queue.length >= QUEUE_LIMIT) flush(false);
        else scheduleFlush();
    }

    function trackOnce(key, eventName, detail) {
        if (trackedOnce[key]) return false;
        trackedOnce[key] = true;
        track(eventName, detail);
        return true;
    }

    function send(events, beacon) {
        if (!events.length) return;
        var body = JSON.stringify({ events: events });
        if (beacon && navigator.sendBeacon) {
            try {
                if (navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }))) return;
            } catch (error) { }
        }
        try {
            fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: body,
                keepalive: Boolean(beacon),
                credentials: 'same-origin'
            }).catch(function () { });
        } catch (error) { }
    }

    function flush(beacon) {
        if (flushTimer) {
            window.clearTimeout(flushTimer);
            flushTimer = null;
        }
        if (!queue.length) return;
        var events = queue.splice(0, QUEUE_LIMIT);
        send(events, beacon);
        if (queue.length) {
            if (beacon) flush(true);
            else scheduleFlush();
        }
    }

    function noteActivity() {
        lastActivityAt = Date.now();
    }

    function markEngaged() {
        noteActivity();
        if (engaged) return;
        engaged = true;
        var detail = {};
        var bucket = lengthBucket(textLength());
        if (bucket) detail.length_bucket = bucket;
        if (currentInputMode !== 'unknown') detail.input_mode = currentInputMode;
        track(CORE_EDITOR_ROUTES.indexOf(route) >= 0 ? 'editor_engaged' : 'tool_engaged', detail);
    }

    function attachTextarea(node) {
        if (!node) return false;
        editorReader = function () { return node.value; };
        ['input', 'keyup', 'paste', 'change'].forEach(function (name) {
            node.addEventListener(name, markEngaged, { passive: true });
        });
        node.addEventListener('focus', noteActivity, { passive: true });
        return true;
    }

    function attachDynamicReader(selector) {
        editorReader = function () {
            var node = document.querySelector(selector);
            return node && typeof node.value !== 'undefined' ? node.value : '';
        };
        return true;
    }

    function attachRichEditor() {
        if (!window.tinymce || !window.tinymce.activeEditor) return false;
        var editor = window.tinymce.activeEditor;
        editorReader = function () { return editor.getContent({ format: 'text' }); };
        editor.on('input change keyup paste', markEngaged);
        editor.on('focus', noteActivity);
        return true;
    }

    function bindPrimaryEditor() {
        if (route === '/') return attachTextarea(document.getElementById('transliterateTextarea'));
        if (route === '/urdu-keyboard') return attachTextarea(document.getElementById('write'));
        if (route === '/urdu-editor') {
            if (attachRichEditor()) return true;
            var attempts = 0;
            var timer = window.setInterval(function () {
                attempts += 1;
                if (attachRichEditor() || attempts >= 40) window.clearInterval(timer);
            }, 250);
            return true;
        }
        if (route === '/urdu-card-studio') return attachDynamicReader('#cardText');
        if (route === '/stylish-urdu-text-generator') return attachTextarea(document.getElementById('stylishText'));
        if (route === '/urdu-name-art-maker') return attachTextarea(document.getElementById('nameArtText'));
        if (route === '/urdu-whatsapp-status-maker' || route === '/urdu-instagram-post-maker') return attachDynamicReader('#cardText');
        if (route === '/tools/urdu-voice-typing') return attachTextarea(document.getElementById('voiceTranscript'));
        return false;
    }

    function selectedInputMode() {
        var selected = document.querySelector('[data-input-mode-option][aria-pressed="true"]');
        return selected ? (selected.getAttribute('data-input-mode-option') || 'unknown') : 'unknown';
    }

    function trackOutcome(name, detail) {
        detail = detail || {};
        markEngaged();
        if (typeof detail.length_bucket === 'undefined') {
            var bucket = lengthBucket(textLength());
            if (bucket) detail.length_bucket = bucket;
        }
        if (detail.input_mode === 'voice') currentInputMode = 'voice';
        track(name, detail);
    }

    function watchCopyConfirmation() {
        copyWatchToken += 1;
        var token = copyWatchToken;
        var attempts = 0;
        function inspect() {
            if (token !== copyWatchToken) return;
            attempts += 1;
            var notice = document.getElementById('appNotifications');
            if (notice) {
                var message = String(notice.textContent || '');
                if (notice.classList.contains('is-success') && /copied to the clipboard/i.test(message)) {
                    copyWatchToken += 1;
                    trackOutcome('copy_completed', { format: 'clipboard', success: true });
                    return;
                }
                if (notice.classList.contains('is-error') && /copy failed/i.test(message)) {
                    copyWatchToken += 1;
                    return;
                }
            }
            if (attempts < 24) window.setTimeout(inspect, 100);
        }
        window.setTimeout(inspect, 0);
    }

    function bindProductActions() {
        currentInputMode = selectedInputMode();
        document.addEventListener('click', function (event) {
            var closest = event.target.closest ? event.target.closest.bind(event.target) : null;
            if (!closest) return;

            if (closest('[data-copy-target], [data-clipboard-target]')) {
                watchCopyConfirmation();
                noteActivity();
                return;
            }

            var mode = closest('[data-input-mode-option]');
            if (mode) {
                currentInputMode = mode.getAttribute('data-input-mode-option') || 'unknown';
                markEngaged();
                return;
            }

            if (closest('[data-batch-action]')) {
                markEngaged();
                track('batch_transliteration', {
                    input_mode: currentInputMode !== 'unknown' ? currentInputMode : null,
                    length_bucket: lengthBucket(textLength())
                });
                return;
            }

            if (closest('[data-write-urdu-share]')) {
                trackOutcome('share_clicked', {});
                return;
            }

            var handoff = closest('[data-create-card], [data-create-qr], [data-wu-next-step-action], .home-actions-group-create a');
            if (handoff) {
                markEngaged();
                var href = handoff.getAttribute('href');
                var targetRoute = href || (handoff.hasAttribute('data-create-card') ? '/urdu-card-studio' : '/qr-code-generator');
                track('tool_handoff', { target_route: targetRoute, length_bucket: lengthBucket(textLength()) });
            }
        }, true);
    }

    function rootSelectorForTool() {
        var selectors = {
            card_studio: '[data-card-studio]',
            stylish_text: '[data-stylish-generator]',
            name_art: '[data-name-art]',
            whatsapp_status: '[data-social-direct-workspace="whatsapp"]',
            instagram_post: '[data-social-direct-workspace="instagram"]',
            invoice_generator: '[data-invoice-generator]',
            qr_generator: '[data-qr-generator]'
        };
        return selectors[tool] || null;
    }

    function bindCreationToolSignals() {
        var rootSelector = rootSelectorForTool();
        if (!rootSelector) return;

        document.addEventListener('input', function (event) {
            if (event.target && event.target.closest && event.target.closest(rootSelector)) markEngaged();
        }, true);
        document.addEventListener('change', function (event) {
            if (!event.target || !event.target.closest || !event.target.closest(rootSelector)) return;
            markEngaged();
            if (event.target.matches && event.target.matches('input[type="file"]') && event.target.files && event.target.files.length) {
                track('background_image_used');
            }
        }, true);
        document.addEventListener('click', function (event) {
            if (!event.target || !event.target.closest) return;
            var template = event.target.closest('[data-card-use-case], [data-card-template], [data-name-art-template]');
            if (template && template.closest(rootSelector)) {
                markEngaged();
                track('template_used');
                return;
            }
            var action = event.target.closest('[data-stylish-generate], [data-stylish-surprise], [data-stylish-example], [data-name-art-purpose], [data-invoice-add-item], [data-invoice-sample], [data-qr-reset-colors]');
            if (action && action.closest(rootSelector)) markEngaged();
        }, true);

        document.addEventListener('write-urdu:card-interaction-state', function (event) {
            var detail = event && event.detail || {};
            if (!detail.selectedObjectId && !detail.editingObjectId) return;
            markEngaged();
            trackOnce('canvas-interaction', 'canvas_interaction');
        });
    }

    function formatFromFilename(filename) {
        var match = String(filename || '').toLowerCase().match(/\.([a-z0-9]+)$/);
        if (!match) return null;
        if (match[1] === 'doc' || match[1] === 'docx') return 'doc';
        if (match[1] === 'txt' || match[1] === 'png') return match[1];
        return null;
    }

    function wrapExportRuntime() {
        var runtime = window.WriteUrduExport;
        if (!runtime || runtime.__wuTelemetryWrapped) return false;
        runtime.__wuTelemetryWrapped = true;

        if (typeof runtime.downloadData === 'function') {
            var originalDownloadData = runtime.downloadData;
            runtime.downloadData = function (uri, filename) {
                var result = originalDownloadData.apply(this, arguments);
                var format = formatFromFilename(filename);
                if (format) trackOutcome('export_completed', { format: format, success: true });
                return result;
            };
        }

        if (typeof runtime.downloadWord === 'function') {
            var originalDownloadWord = runtime.downloadWord;
            runtime.downloadWord = function () {
                var result = originalDownloadWord.apply(this, arguments);
                trackOutcome('export_completed', { format: 'doc', success: true });
                return result;
            };
        }

        if (typeof runtime.downloadPdf === 'function') {
            var originalDownloadPdf = runtime.downloadPdf;
            runtime.downloadPdf = function () {
                var result;
                try {
                    result = originalDownloadPdf.apply(this, arguments);
                } catch (error) {
                    throw error;
                }
                return Promise.resolve(result).then(function (value) {
                    trackOutcome('export_completed', { format: 'pdf', success: true });
                    return value;
                });
            };
        }

        if (typeof runtime.printCanvas === 'function') {
            var originalPrintCanvas = runtime.printCanvas;
            runtime.printCanvas = function () {
                var result = originalPrintCanvas.apply(this, arguments);
                trackOutcome('print_started', { format: 'print', success: true });
                return result;
            };
        }
        return true;
    }

    function wrapTextExport() {
        if (typeof window.saveTextAsFile !== 'function' || window.saveTextAsFile.__wuTelemetryWrapped) return false;
        var originalSave = window.saveTextAsFile;
        var wrapped = function () {
            var result = originalSave.apply(this, arguments);
            trackOutcome('export_completed', { format: 'txt', success: true });
            return result;
        };
        wrapped.__wuTelemetryWrapped = true;
        window.saveTextAsFile = wrapped;
        return true;
    }

    function installOutcomeHooks() {
        if (outcomeHooksInstalled) return;
        var attempts = 0;
        var timer = window.setInterval(function () {
            attempts += 1;
            var exportsReady = wrapExportRuntime();
            var textReady = wrapTextExport();
            if ((exportsReady || (window.WriteUrduExport && window.WriteUrduExport.__wuTelemetryWrapped)) &&
                (textReady || typeof window.saveTextAsFile !== 'function' || window.saveTextAsFile.__wuTelemetryWrapped)) {
                outcomeHooksInstalled = true;
                window.clearInterval(timer);
            } else if (attempts >= 40) {
                window.clearInterval(timer);
            }
        }, 250);
    }

    function sendSummary() {
        if (summarySent || !engaged) return;
        summarySent = true;
        var detail = { active_time_bucket: activeTimeBucket(activeSeconds) };
        var bucket = lengthBucket(textLength());
        if (bucket) detail.length_bucket = bucket;
        if (currentInputMode !== 'unknown') detail.input_mode = currentInputMode;
        track('session_summary', detail);
        flush(true);
    }

    function startActiveTimer() {
        window.setInterval(function () {
            if (!engaged || document.visibilityState !== 'visible') return;
            if (Date.now() - lastActivityAt <= ACTIVE_WINDOW_MS) activeSeconds += 1;
        }, 1000);
    }

    function start() {
        bindPrimaryEditor();
        bindProductActions();
        bindCreationToolSignals();
        installOutcomeHooks();
        startActiveTimer();
        track('page_session_started');
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'hidden') flush(true);
        });
        window.addEventListener('pagehide', sendSummary, { once: true });
    }

    window.WriteUrduTelemetry = {
        track: track,
        trackOnce: trackOnce,
        engage: markEngaged,
        trackOutcome: trackOutcome,
        lengthBucket: lengthBucket,
        activeTimeBucket: activeTimeBucket,
        flush: flush
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
}());
