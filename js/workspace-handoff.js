(function (root, factory) {
    'use strict';
    var registry = null;
    if (typeof module === 'object' && module.exports) {
        try { registry = require('./workspace-journey-registry.js'); } catch (error) { registry = null; }
    } else if (root) {
        registry = root.WriteUrduWorkspaceRegistry || null;
    }
    var api = factory(root, registry);
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduWorkspaceHandoff = api;
}(typeof window !== 'undefined' ? window : null, function (root, registry) {
    'use strict';

    var VERSION = 2;
    var TTL_MS = 30 * 60 * 1000;
    var MAX_TEXT_LENGTH = 100000;
    var MAX_SERIALIZED_BYTES = 220000;
    var KEY_PREFIX = 'write-urdu:workspace-handoff:v2:';
    var ALLOWED_KINDS = ['plain-text', 'rich-text', 'template-seed', 'visual-project-seed', 'structured-seed', 'draft-reference'];

    var LEGACY_TARGETS = {
        'rich-editor': { key: 'writeUrdu.richEditor.incoming.v1', shape: 'destination', route: '/urdu-editor' },
        'card-studio': { key: 'writeUrdu.cardStudio.incoming', shape: 'destination', route: '/urdu-card-studio' },
        'stylish-text': { key: 'writeUrdu.stylishText.incoming.v1', shape: 'destination', route: '/stylish-urdu-text-generator' },
        'name-art': { key: 'writeUrdu.nameArt.handoff.v1', shape: 'destination', route: '/urdu-name-art-maker' },
        'basic-writer': { key: 'write-urdu:text-handoff:v1', shape: 'generic', route: '/' },
        'text-cleaner': { key: 'write-urdu:text-handoff:v1', shape: 'generic', route: '/urdu-text-cleaner' }
    };

    function now() { return Date.now(); }

    function storage(candidate) {
        if (candidate) return candidate;
        if (!root || !root.sessionStorage) return null;
        try {
            var probe = KEY_PREFIX + 'probe';
            root.sessionStorage.setItem(probe, '1');
            root.sessionStorage.removeItem(probe);
            return root.sessionStorage;
        } catch (error) {
            return null;
        }
    }

    function randomId() {
        if (root && root.crypto && typeof root.crypto.randomUUID === 'function') return root.crypto.randomUUID();
        return 'wu-' + now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    }

    function normalizedRoute(value) {
        return registry && typeof registry.normalizeRoute === 'function' ? registry.normalizeRoute(value) : String(value || '/');
    }

    function getWorkspace(id) {
        return registry && typeof registry.get === 'function' ? registry.get(id) : null;
    }

    function inferWorkspace(route) {
        return registry && typeof registry.findByRoute === 'function' ? registry.findByRoute(route) : null;
    }

    function keyFor(targetWorkspace) {
        return KEY_PREFIX + String(targetWorkspace || 'unknown');
    }

    function payloadSize(value) {
        try { return new Blob([JSON.stringify(value)]).size; } catch (error) { return JSON.stringify(value).length; }
    }

    function hasContent(payload) {
        if (!payload || typeof payload !== 'object') return false;
        if (typeof payload.text === 'string') return Boolean(payload.text.trim());
        return Object.keys(payload).length > 1 || Boolean(payload.value || payload.id || payload.templateId || payload.draftId);
    }

    function validatePayload(kind, payload) {
        var errors = [];
        if (ALLOWED_KINDS.indexOf(kind) < 0) errors.push('unsupported-payload-kind');
        if (!payload || typeof payload !== 'object') errors.push('invalid-payload');
        if (payload && Object.prototype.hasOwnProperty.call(payload, 'text')) {
            if (typeof payload.text !== 'string') errors.push('invalid-text');
            else if (payload.text.length > MAX_TEXT_LENGTH) errors.push('payload-too-large');
        }
        if (payload && payloadSize(payload) > MAX_SERIALIZED_BYTES) errors.push('payload-too-large');
        return errors;
    }

    function build(options) {
        options = options || {};
        var createdAt = Number(options.createdAt) || now();
        var sourceWorkspace = String(options.sourceWorkspace || '');
        var targetWorkspace = String(options.targetWorkspace || '');
        var sourceDescriptor = getWorkspace(sourceWorkspace);
        var targetDescriptor = getWorkspace(targetWorkspace);
        var sourceRoute = options.sourceRoute || (sourceDescriptor && sourceDescriptor.routes[0]) || '/';
        var targetRoute = options.targetRoute || (targetDescriptor && targetDescriptor.routes[0]) || '/';
        var kind = String(options.kind || 'plain-text');
        var payload = options.payload || {};

        return {
            version: VERSION,
            id: options.id || randomId(),
            createdAt: createdAt,
            expiresAt: Number(options.expiresAt) || createdAt + TTL_MS,
            source: {
                workspace: sourceWorkspace,
                route: normalizedRoute(sourceRoute),
                intent: options.intent ? String(options.intent) : null
            },
            target: {
                workspace: targetWorkspace,
                route: normalizedRoute(targetRoute)
            },
            actionId: options.actionId ? String(options.actionId) : null,
            payload: Object.assign({ kind: kind }, payload),
            context: options.context && typeof options.context === 'object' ? options.context : {}
        };
    }

    function validate(envelope, expectedTarget, atTime) {
        var errors = [];
        var currentTime = Number(atTime) || now();
        if (!envelope || typeof envelope !== 'object') return ['invalid-envelope'];
        if (envelope.version !== VERSION) errors.push('invalid-version');
        if (!envelope.id || typeof envelope.id !== 'string') errors.push('missing-id');
        if (!envelope.source || !envelope.source.workspace) errors.push('missing-source');
        if (!envelope.target || !envelope.target.workspace) errors.push('missing-target');
        if (!envelope.createdAt || !envelope.expiresAt || envelope.expiresAt <= envelope.createdAt) errors.push('invalid-expiry');
        if (envelope.expiresAt && currentTime > envelope.expiresAt) errors.push('expired');
        if (expectedTarget && envelope.target && envelope.target.workspace !== expectedTarget) errors.push('wrong-target');

        var kind = envelope.payload && envelope.payload.kind;
        errors = errors.concat(validatePayload(kind, envelope.payload));

        if (registry && envelope.target && envelope.target.workspace) {
            var target = getWorkspace(envelope.target.workspace);
            if (!target) errors.push('unknown-target');
            else if (target.accepts.indexOf(kind) < 0) errors.push('target-rejects-payload');
        }
        if (registry && envelope.source && envelope.source.workspace && !getWorkspace(envelope.source.workspace)) errors.push('unknown-source');
        return errors.filter(function (value, index, all) { return all.indexOf(value) === index; });
    }

    function telemetryDetail(envelope, outcome, failureReason) {
        return {
            sourceWorkspace: envelope && envelope.source ? envelope.source.workspace : null,
            destinationWorkspace: envelope && envelope.target ? envelope.target.workspace : null,
            actionId: envelope && envelope.actionId || null,
            payloadKind: envelope && envelope.payload ? envelope.payload.kind : null,
            hasContent: Boolean(envelope && hasContent(envelope.payload)),
            outcome: outcome || null,
            failureReason: failureReason || null
        };
    }

    function dispatch(name, envelope, outcome, failureReason) {
        if (!root || !root.document || typeof root.CustomEvent !== 'function') return;
        root.document.dispatchEvent(new root.CustomEvent(name, {
            detail: telemetryDetail(envelope, outcome, failureReason)
        }));
    }

    function writeLegacyMirror(envelope, storeRef) {
        if (!storeRef || !envelope || !envelope.target || !envelope.payload || envelope.payload.kind !== 'plain-text') return false;
        var config = LEGACY_TARGETS[envelope.target.workspace];
        if (!config || typeof envelope.payload.text !== 'string' || !envelope.payload.text.trim()) return false;
        var legacy;
        if (config.shape === 'generic') {
            legacy = {
                version: 1,
                target: config.route,
                createdAt: envelope.createdAt,
                text: envelope.payload.text
            };
        } else {
            legacy = {
                version: 1,
                text: envelope.payload.text,
                source: envelope.source.workspace,
                createdAt: new Date(envelope.createdAt).toISOString()
            };
        }
        try {
            storeRef.setItem(config.key, JSON.stringify(legacy));
            return true;
        } catch (error) {
            return false;
        }
    }

    function clearLegacyMirror(targetWorkspace, storeRef) {
        var config = LEGACY_TARGETS[targetWorkspace];
        if (!config || !storeRef) return;
        try {
            if (config.shape === 'generic') {
                var raw = storeRef.getItem(config.key);
                if (!raw) return;
                var payload = JSON.parse(raw);
                if (payload && normalizedRoute(payload.target) !== normalizedRoute(config.route)) return;
            }
            storeRef.removeItem(config.key);
        } catch (error) { /* ignore malformed legacy state */ }
    }

    function fromLegacy(targetWorkspace, legacy) {
        var config = LEGACY_TARGETS[targetWorkspace];
        if (!config || !legacy || legacy.version !== 1 || typeof legacy.text !== 'string' || !legacy.text.trim()) return null;
        var createdAt = config.shape === 'generic' ? Number(legacy.createdAt) : Date.parse(legacy.createdAt || '');
        if (!createdAt || now() - createdAt > TTL_MS) return null;
        var source = String(legacy.source || 'legacy-workspace');
        if (!getWorkspace(source)) {
            if (source === 'basic-editor') source = 'basic-writer';
            else if (source === 'rich-editor') source = 'rich-editor';
            else if (source === 'urdu-keyboard') source = 'urdu-keyboard';
            else source = 'basic-writer';
        }
        return build({
            id: 'legacy-' + createdAt,
            createdAt: createdAt,
            expiresAt: createdAt + TTL_MS,
            sourceWorkspace: source,
            sourceRoute: (getWorkspace(source) && getWorkspace(source).routes[0]) || '/',
            targetWorkspace: targetWorkspace,
            targetRoute: config.route,
            kind: 'plain-text',
            payload: { text: legacy.text },
            actionId: 'legacy-compatibility'
        });
    }

    function takeLegacy(targetWorkspace, storeRef) {
        var config = LEGACY_TARGETS[targetWorkspace];
        if (!config || !storeRef) return null;
        try {
            var raw = storeRef.getItem(config.key);
            if (!raw) return null;
            var legacy = JSON.parse(raw);
            if (config.shape === 'generic' && normalizedRoute(legacy.target) !== normalizedRoute(config.route)) return null;
            storeRef.removeItem(config.key);
            return fromLegacy(targetWorkspace, legacy);
        } catch (error) {
            try { storeRef.removeItem(config.key); } catch (ignored) { }
            return null;
        }
    }

    function storeEnvelope(options, storageOverride) {
        var storeRef = storage(storageOverride);
        if (!storeRef) return { ok: false, reason: 'storage-unavailable', envelope: null };
        var envelope = build(options);
        var errors = validate(envelope, envelope.target.workspace);
        if (errors.length) {
            dispatch('write-urdu:handoff-failed', envelope, 'failed', errors[0]);
            return { ok: false, reason: errors[0], errors: errors, envelope: envelope };
        }
        try {
            storeRef.setItem(keyFor(envelope.target.workspace), JSON.stringify(envelope));
            writeLegacyMirror(envelope, storeRef);
            dispatch('write-urdu:handoff-started', envelope, 'stored', null);
            return { ok: true, reason: null, envelope: envelope };
        } catch (error) {
            dispatch('write-urdu:handoff-failed', envelope, 'failed', 'storage-write-failed');
            return { ok: false, reason: 'storage-write-failed', envelope: envelope };
        }
    }

    function peek(targetWorkspace, storageOverride) {
        var storeRef = storage(storageOverride);
        if (!storeRef) return null;
        try {
            var raw = storeRef.getItem(keyFor(targetWorkspace));
            if (!raw) return null;
            var envelope = JSON.parse(raw);
            if (validate(envelope, targetWorkspace).length) return null;
            return envelope;
        } catch (error) {
            return null;
        }
    }

    function take(targetWorkspace, storageOverride) {
        var storeRef = storage(storageOverride);
        if (!storeRef) return null;
        var key = keyFor(targetWorkspace);
        var raw = null;
        try { raw = storeRef.getItem(key); } catch (error) { return null; }
        if (raw) {
            var envelope = null;
            try { envelope = JSON.parse(raw); } catch (error) { envelope = null; }
            var errors = validate(envelope, targetWorkspace);
            if (errors.length) {
                if (errors.indexOf('wrong-target') < 0) {
                    try { storeRef.removeItem(key); } catch (ignored) { }
                }
                dispatch('write-urdu:handoff-failed', envelope, 'failed', errors[0]);
                return null;
            }
            try { storeRef.removeItem(key); } catch (ignored) { }
            clearLegacyMirror(targetWorkspace, storeRef);
            dispatch('write-urdu:handoff-imported', envelope, 'imported', null);
            return envelope;
        }

        var legacyEnvelope = takeLegacy(targetWorkspace, storeRef);
        if (legacyEnvelope) {
            dispatch('write-urdu:handoff-imported', legacyEnvelope, 'legacy-imported', null);
            return legacyEnvelope;
        }
        return null;
    }

    function discard(targetWorkspace, storageOverride) {
        var storeRef = storage(storageOverride);
        if (!storeRef) return false;
        try {
            storeRef.removeItem(keyFor(targetWorkspace));
            clearLegacyMirror(targetWorkspace, storeRef);
            return true;
        } catch (error) {
            return false;
        }
    }

    function destination(targetWorkspace) {
        var descriptor = getWorkspace(targetWorkspace);
        return descriptor && descriptor.routes.length ? descriptor.routes[0] : null;
    }

    function transfer(options, storageOverride) {
        var result = storeEnvelope(options, storageOverride);
        if (!result.ok) return result;
        result.route = destination(result.envelope.target.workspace);
        return result;
    }

    return {
        VERSION: VERSION,
        TTL_MS: TTL_MS,
        MAX_TEXT_LENGTH: MAX_TEXT_LENGTH,
        MAX_SERIALIZED_BYTES: MAX_SERIALIZED_BYTES,
        KEY_PREFIX: KEY_PREFIX,
        ALLOWED_KINDS: ALLOWED_KINDS.slice(),
        LEGACY_TARGETS: JSON.parse(JSON.stringify(LEGACY_TARGETS)),
        build: build,
        validate: validate,
        telemetryDetail: telemetryDetail,
        store: storeEnvelope,
        peek: peek,
        take: take,
        discard: discard,
        transfer: transfer,
        destination: destination,
        fromLegacy: fromLegacy,
        takeLegacy: takeLegacy,
        writeLegacyMirror: writeLegacyMirror
    };
}));
