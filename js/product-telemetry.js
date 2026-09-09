(function () {
    'use strict';

    var ENDPOINT = '/api/events';
    var SESSION_KEY = 'write-urdu:telemetry-session:v1';
    var QUEUE_LIMIT = 10;
    var FLUSH_DELAY = 4500;
    var ACTIVE_WINDOW_MS = 15000;
    var CORE_EDITOR_ROUTES = ['/', '/urdu-editor', '/urdu-keyboard'];
    var URDU_CHAR_PATTERN = /[؀-ۿݐ-ݿ]/;
    var DEPTH_THRESHOLDS = [20, 100, 500, 1000];
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
    var SHARE_REFERRAL_KEY = 'writeUrdu.shareReferral.v1';
    var REFERRAL_DESTINATION_TOOLS = { basic_editor: true, qr_generator: true };
    var CONTINUATION_RELEASE_MARKER = 'wu-plat-002h-s1-2026-09-06-v1';

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
            error_category: detail.error_category || null,
            target_route: detail.target_route ? normalizedPath(detail.target_route) : null,
            card_mode: detail.card_mode || null,
            recommendation_id: detail.recommendation_id || null,
            source_workspace: detail.source_workspace || null,
            destination_workspace: detail.destination_workspace || null,
            path_version: detail.path_version || null,
            release_marker: detail.release_marker || null,
            handoff_required: typeof detail.handoff_required === 'boolean' ? detail.handoff_required : null,
            restore_required: typeof detail.restore_required === 'boolean' ? detail.restore_required : null,
            request_family: detail.request_family || null,
            growth_stage: detail.growth_stage || null,
            writer_state: detail.writer_state || null,
            growth_workspace: detail.growth_workspace || null,
            growth_account_state: detail.growth_account_state || null,
            suppression_winner: detail.suppression_winner || null,
            suppression_reason: detail.suppression_reason || null,
            growth_release_marker: detail.growth_release_marker || null
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

    function normalizeContinuationDetail(detail) {
        detail = detail || {};
        var source = detail.source_workspace || detail.sourceWorkspace || null;
        var destination = detail.destination_workspace || detail.destinationWorkspace || null;
        var recommendation = detail.recommendation_id || detail.recommendationId || detail.actionId || null;
        if (!source || !destination || !recommendation) return null;
        return {
            recommendation_id: recommendation,
            source_workspace: source,
            destination_workspace: destination,
            path_version: detail.path_version || detail.pathVersion || 'v2',
            release_marker: detail.release_marker || detail.releaseMarker || CONTINUATION_RELEASE_MARKER,
            handoff_required: detail.handoff_required !== false && detail.handoffRequired !== false,
            restore_required: detail.restore_required !== false && detail.restoreRequired !== false
        };
    }

    function continuationContextFromDocument() {
        var node = document.documentElement;
        if (!node) return null;
        return normalizeContinuationDetail({
            recommendation_id: node.getAttribute('data-wu-continuation-recommendation'),
            source_workspace: node.getAttribute('data-wu-continuation-source'),
            destination_workspace: node.getAttribute('data-wu-continuation-destination'),
            path_version: node.getAttribute('data-wu-continuation-path-version'),
            release_marker: node.getAttribute('data-wu-continuation-release'),
            handoff_required: node.getAttribute('data-wu-continuation-handoff-required') !== 'false',
            restore_required: node.getAttribute('data-wu-continuation-restore-required') !== 'false'
        });
    }

    function rememberContinuationContext(detail) {
        var meta = normalizeContinuationDetail(detail);
        var node = document.documentElement;
        if (!meta || !node) return false;
        node.setAttribute('data-wu-continuation-recommendation', meta.recommendation_id);
        node.setAttribute('data-wu-continuation-source', meta.source_workspace);
        node.setAttribute('data-wu-continuation-destination', meta.destination_workspace);
        node.setAttribute('data-wu-continuation-path-version', meta.path_version);
        node.setAttribute('data-wu-continuation-release', meta.release_marker);
        node.setAttribute('data-wu-continuation-handoff-required', meta.handoff_required ? 'true' : 'false');
        node.setAttribute('data-wu-continuation-restore-required', meta.restore_required ? 'true' : 'false');
        return true;
    }

    function trackContinuationPath(stage, detail) {
        var meta = normalizeContinuationDetail(detail);
        if (!meta || !/^(eligible|shown|selected|handoff_created|destination_ready|payload_restored|meaningful_start|destination_outcome)$/.test(String(stage || ''))) return false;
        if (stage === 'payload_restored') rememberContinuationContext(meta);
        var key = ['continuation-path', stage, meta.recommendation_id, meta.source_workspace, meta.destination_workspace, meta.path_version].join(':');
        return trackOnce(key, 'continuation_path_' + stage, meta);
    }

    function recommendationDetail(control) {
        if (!control || !control.getAttribute) return null;
        var panel = control.closest && control.closest('[data-wu-next-step-version="2"]');
        var recommendation = control.getAttribute('data-wu-next-step-action');
        var source = panel && panel.getAttribute('data-wu-source-workspace');
        var destination = control.getAttribute('data-wu-continuity-target');
        if (!recommendation || !source || !destination) return null;
        return normalizeContinuationDetail({
            recommendation_id: recommendation,
            source_workspace: source,
            destination_workspace: destination,
            path_version: 'v2',
            release_marker: CONTINUATION_RELEASE_MARKER,
            handoff_required: true,
            restore_required: true
        });
    }

    function trackContinuationMeaningfulInteraction() {
        var meta = continuationContextFromDocument();
        if (meta) trackContinuationPath('meaningful_start', meta);
    }

    // Generalizes the referral marker js/card-studio-publish.js already
    // maintains for Card Studio to the other two share-page CTA destinations
    // (Basic Writer, QR generator) so WU-PLAT-002H Gate A's share-referral
    // trace covers all three, not just Card Studio.
    function getShareReferral() {
        try {
            var raw = window.sessionStorage.getItem(SHARE_REFERRAL_KEY);
            if (!raw) return null;
            var value = JSON.parse(raw);
            if (!value || !/^[A-Za-z0-9]{8,12}$/.test(String(value.id || '')) || Number(value.expiresAt || 0) <= Date.now()) {
                window.sessionStorage.removeItem(SHARE_REFERRAL_KEY);
                return null;
            }
            return value;
        } catch (error) {
            return null;
        }
    }

    function saveShareReferral(value) {
        try { window.sessionStorage.setItem(SHARE_REFERRAL_KEY, JSON.stringify(value)); } catch (error) { }
    }

    function trackShareReferralDestinationReady() {
        if (!REFERRAL_DESTINATION_TOOLS[tool] || !getShareReferral()) return;
        trackOnce('share-destination-ready', 'share_destination_ready');
        trackOnce('share-referral-recognized', 'share_referral_recognized');
    }

    function trackShareReferredCreationStarted() {
        if (!REFERRAL_DESTINATION_TOOLS[tool]) return;
        var referral = getShareReferral();
        if (!referral || referral.started) return;
        referral.started = true;
        referral.startedAt = Date.now();
        saveShareReferral(referral);
        track('share_referred_creation_started', {});
    }

    // Meaningful referred start is stricter than "started": a first keystroke
    // alone is not proof the recipient actually began creating (WU-SHARE-001R
    // section 5, step 8). Writing workspaces require the same minimal
    // non-empty/useful state as writer_depth_20; other referral-eligible
    // tools use their existing outcome event (export/copy) instead.
    function trackShareReferredMeaningfulStart() {
        if (!REFERRAL_DESTINATION_TOOLS[tool]) return;
        var referral = getShareReferral();
        if (!referral || referral.meaningful) return;
        referral.meaningful = true;
        saveShareReferral(referral);
        track('share_referred_meaningful_start', {});
    }

    function trackContinuationMeaningfulStart() {
        if (route !== '/urdu-editor' || !document.body.hasAttribute('data-rich-handoff-imported')) return;
        trackOnce('continuation-destination-meaningful-start', 'continuation_destination_meaningful_start', { target_route: '/urdu-editor' });
        trackContinuationMeaningfulInteraction();
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

    function writerFunnelEligible() {
        return CORE_EDITOR_ROUTES.indexOf(route) >= 0;
    }

    function trackWriterFunnel() {
        if (!writerFunnelEligible()) return;
        trackOnce('writer-first-input', 'writer_first_input');
        var text = textLength() === null ? '' : String(editorReader() || '');
        var trimmedLength = text.trim().length;
        if (URDU_CHAR_PATTERN.test(text)) {
            var liveInputMode = selectedInputMode();
            trackOnce('writer-first-urdu-success', 'writer_first_urdu_success', {
                input_mode: liveInputMode !== 'unknown' ? liveInputMode : null
            });
        }
        DEPTH_THRESHOLDS.forEach(function (threshold) {
            if (trimmedLength >= threshold) {
                trackOnce('writer-depth-' + threshold, 'writer_depth_' + threshold, {
                    length_bucket: lengthBucket(trimmedLength)
                });
                if (threshold === DEPTH_THRESHOLDS[0]) trackShareReferredMeaningfulStart();
            }
        });
    }

    function markEngaged() {
        noteActivity();
        trackShareReferredCreationStarted();
        trackWriterFunnel();
        if (engaged) return;
        engaged = true;
        var detail = {};
        var bucket = lengthBucket(textLength());
        if (bucket) detail.length_bucket = bucket;
        if (currentInputMode !== 'unknown') detail.input_mode = currentInputMode;
        track(CORE_EDITOR_ROUTES.indexOf(route) >= 0 ? 'editor_engaged' : 'tool_engaged', detail);
    }

    function noteWriterFocus() {
        noteActivity();
        if (writerFunnelEligible()) trackOnce('writer-focused', 'writer_focused');
    }

    function attachTextarea(node) {
        if (!node) return false;
        editorReader = function () { return node.value; };
        ['input', 'keyup', 'paste', 'change'].forEach(function (name) {
            node.addEventListener(name, function (event) {
                if (event.isTrusted) markEngaged();
            }, { passive: true });
        });
        node.addEventListener('focus', noteWriterFocus, { passive: true });
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
        editor.on('input keyup paste', trackContinuationMeaningfulStart);
        editor.on('focus', noteWriterFocus);
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
        trackShareReferredMeaningfulStart();
        var continuationContext = continuationContextFromDocument();
        if (continuationContext) trackContinuationPath('destination_outcome', continuationContext);
        if (writerFunnelEligible()) trackOnce('writer-outcome-first', 'writer_outcome_first');
        if (typeof document !== 'undefined' && document.dispatchEvent) {
            document.dispatchEvent(new CustomEvent('write-urdu:outcome', { detail: { name: name, detail: detail } }));
        }
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
                var recommendation = recommendationDetail(handoff);
                if (recommendation) trackContinuationPath('selected', recommendation);
                var href = handoff.getAttribute('href');
                var targetRoute = href || (handoff.hasAttribute('data-create-card') ? '/urdu-card-studio' : '/qr-code-generator');
                track('tool_handoff', { target_route: targetRoute, length_bucket: lengthBucket(textLength()) });
                return;
            }

            var cardExport = closest('[data-card-action="download"], [data-card-action="share"]');
            var cardRoot = cardExport && closest('[data-card-studio]');
            if (cardRoot) {
                markEngaged();
                track('card_studio_export_attempted', { card_mode: cardRoot.getAttribute('data-card-ui-mode') || 'quick' });
            }
        }, true);
    }

    // Slice 1 keeps the coarse Gate A counters for historical continuity,
    // while adding a bounded per-recommendation diagnostic path. Hidden
    // overflow actions are eligible but are not counted as shown until their
    // disclosure is opened. No recommendation identity is derived from text.
    function trackRecommendationControls() {
        var controls = Array.prototype.slice.call(document.querySelectorAll('[data-wu-next-step-action]'));
        controls.forEach(function (control) {
            var meta = recommendationDetail(control);
            if (!meta) return;
            trackContinuationPath('eligible', meta);
            var details = control.closest && control.closest('details');
            if (!details || details.open) trackContinuationPath('shown', meta);
        });
        document.querySelectorAll('[data-wu-next-step-version="2"] details').forEach(function (details) {
            if (details.getAttribute('data-wu-continuation-toggle-bound') === 'true') return;
            details.setAttribute('data-wu-continuation-toggle-bound', 'true');
            details.addEventListener('toggle', function () { if (details.open) trackRecommendationControls(); });
        });
        return controls.length > 0;
    }

    function bindContinuationSignals() {
        document.addEventListener('write-urdu:handoff-started', function (event) {
            track('continuation_stored');
            trackContinuationPath('handoff_created', event && event.detail || {});
        });
        document.addEventListener('write-urdu:handoff-imported', function () { track('continuation_payload_restored'); });
        var attempts = 0;
        var timer = window.setInterval(function () {
            attempts += 1;
            var hasRecommendations = trackRecommendationControls();
            if (hasRecommendations || document.querySelector('[data-continue-rich], [data-create-card], [data-create-qr], .home-actions-group-create a')) {
                trackOnce('continuation-shown', 'continuation_shown');
            }
            if (attempts >= 80) window.clearInterval(timer);
        }, 250);
    }

    // Card Studio completion funnel (Gate A completion). Observes the guided
    // UI's own state attributes/click targets instead of touching
    // js/card-studio.js or js/card-studio-ui.js, matching the existing
    // decoupled-observer pattern used for export_completed detection.
    function bindCardStudioExportSignals() {
        if (tool !== 'card_studio') return;
        var attempts = 0;
        var timer = window.setInterval(function () {
            attempts += 1;
            var root = document.querySelector('[data-card-studio]');
            if (root) {
                window.clearInterval(timer);
                var check = function () {
                    if (root.getAttribute('data-card-active-step') === 'export') trackOnce('card-studio-export-step-reached', 'card_studio_export_step_reached');
                };
                if (window.MutationObserver) {
                    new MutationObserver(check).observe(root, { attributes: true, attributeFilter: ['data-card-active-step'] });
                }
                check();
            } else if (attempts >= 40) {
                window.clearInterval(timer);
            }
        }, 250);
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
            if (event.isTrusted && event.target && event.target.closest && event.target.closest(rootSelector)) {
                markEngaged();
                trackContinuationMeaningfulInteraction();
            }
        }, true);
        document.addEventListener('change', function (event) {
            if (!event.isTrusted || !event.target || !event.target.closest || !event.target.closest(rootSelector)) return;
            markEngaged();
            trackContinuationMeaningfulInteraction();
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
            if (action && action.closest(rootSelector)) { markEngaged(); trackContinuationMeaningfulInteraction(); }
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
        bindContinuationSignals();
        bindCardStudioExportSignals();
        installOutcomeHooks();
        startActiveTimer();
        track('page_session_started');
        if (writerFunnelEligible()) trackOnce('writer-viewed', 'writer_viewed');
        trackShareReferralDestinationReady();
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
        trackContinuationPath: trackContinuationPath,
        rememberContinuationContext: rememberContinuationContext,
        continuationContextFromDocument: continuationContextFromDocument,
        lengthBucket: lengthBucket,
        activeTimeBucket: activeTimeBucket,
        flush: flush
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
}());
