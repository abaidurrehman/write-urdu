(function () {
    'use strict';

    var ENDPOINT = '/api/events';
    var SESSION_KEY = 'write-urdu:telemetry-session:v1';
    var QUEUE_LIMIT = 10;
    var FLUSH_DELAY = 4500;
    var ACTIVE_WINDOW_MS = 15000;
    var queue = [];
    var flushTimer = null;
    var engaged = false;
    var lastActivityAt = 0;
    var activeSeconds = 0;
    var summarySent = false;
    var editorReader = null;
    var currentInputMode = 'unknown';

    function normalizedPath(value) {
        var path = String(value || '/').split('?')[0].split('#')[0].replace(/\.html$/i, '').replace(/\/+$/, '') || '/';
        if (path === '/index') path = '/';
        return /^\/[a-z0-9\/-]*$/i.test(path) ? path : '/';
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
            '/qr-code-generator': 'qr_generator'
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
    var tool = toolForRoute(route);

    function deviceClass() {
        var width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        if (width < 600) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    }

    function lengthBucket(length) {
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
        try {
            return editorReader ? String(editorReader() || '').trim().length : 0;
        } catch (error) {
            return 0;
        }
    }

    function payload(eventName, detail) {
        detail = detail || {};
        return {
            event_id: randomId(),
            session_id: session,
            route: route,
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
        track('editor_engaged', { length_bucket: lengthBucket(textLength()), input_mode: currentInputMode });
    }

    function attachTextarea(node) {
        if (!node) return false;
        editorReader = function () { return node.value; };
        ['input', 'keyup', 'paste', 'change'].forEach(function (name) {
            node.addEventListener(name, function () {
                markEngaged();
            }, { passive: true });
        });
        node.addEventListener('focus', noteActivity, { passive: true });
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
        return false;
    }

    function selectedInputMode() {
        var selected = document.querySelector('[data-input-mode-option][aria-pressed="true"]');
        return selected ? (selected.getAttribute('data-input-mode-option') || 'unknown') : 'unknown';
    }

    function bindProductActions() {
        currentInputMode = selectedInputMode();
        document.addEventListener('click', function (event) {
            var mode = event.target.closest && event.target.closest('[data-input-mode-option]');
            if (mode) {
                currentInputMode = mode.getAttribute('data-input-mode-option') || 'unknown';
                track('input_mode_changed', { input_mode: currentInputMode });
                noteActivity();
                return;
            }

            if (event.target.closest && event.target.closest('[data-batch-action]')) {
                track('batch_transliteration', { input_mode: currentInputMode, length_bucket: lengthBucket(textLength()) });
                noteActivity();
                return;
            }

            if (event.target.closest && event.target.closest('[data-write-urdu-share]')) {
                track('share_clicked', { length_bucket: lengthBucket(textLength()) });
                return;
            }

            var handoff = event.target.closest && event.target.closest('[data-create-card], [data-create-qr], .home-actions-group-create a');
            if (handoff) {
                var href = handoff.getAttribute('href');
                var targetRoute = href || (handoff.hasAttribute('data-create-card') ? '/urdu-card-studio' : '/qr-code-generator');
                track('tool_handoff', { target_route: targetRoute, length_bucket: lengthBucket(textLength()) });
            }
        }, true);
    }

    function sendSummary() {
        if (summarySent) return;
        summarySent = true;
        track('session_summary', {
            length_bucket: lengthBucket(textLength()),
            active_time_bucket: activeTimeBucket(activeSeconds),
            input_mode: currentInputMode
        });
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
        startActiveTimer();
        track('page_session_started');
        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'hidden') flush(true);
        });
        window.addEventListener('pagehide', sendSummary, { once: true });
    }

    function trackOutcome(name, detail) {
        detail = detail || {};
        if (typeof detail.length_bucket === 'undefined') detail.length_bucket = lengthBucket(textLength());
        track(name, detail);
    }

    window.WriteUrduTelemetry = {
        track: track,
        trackOutcome: trackOutcome,
        lengthBucket: lengthBucket,
        activeTimeBucket: activeTimeBucket,
        flush: flush
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
}());
