(function (root, factory) {
    'use strict';
    var api = factory(root);
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduTextHandoff = api;
}(typeof window !== 'undefined' ? window : null, function (root) {
    'use strict';

    var KEY = 'write-urdu:text-handoff:v1';
    var BASIC_DRAFT_KEY = 'write-urdu:draft:v1:basic';
    var BASIC_HISTORY_KEY = 'write-urdu:history:v1:basic';
    var MAX_HISTORY = 5;
    var MAX_LENGTH = 100000;
    var MAX_AGE_MS = 30 * 60 * 1000;

    function storage() {
        if (!root || !root.sessionStorage) return null;
        try {
            var probe = KEY + ':probe';
            root.sessionStorage.setItem(probe, '1');
            root.sessionStorage.removeItem(probe);
            return root.sessionStorage;
        } catch (error) {
            return null;
        }
    }

    function store(text, target) {
        var value = String(text || '');
        var storeRef = storage();
        if (!storeRef || !value.trim() || value.length > MAX_LENGTH) return false;
        try {
            storeRef.setItem(KEY, JSON.stringify({
                version: 1,
                target: target || '/',
                createdAt: Date.now(),
                text: value
            }));
            return true;
        } catch (error) {
            return false;
        }
    }

    function take(target) {
        var storeRef = storage();
        if (!storeRef) return null;
        var raw = null;
        try {
            raw = storeRef.getItem(KEY);
            if (!raw) return null;
            var payload = JSON.parse(raw);
            if (!payload || payload.version !== 1 || typeof payload.text !== 'string') {
                storeRef.removeItem(KEY);
                return null;
            }
            if (payload.text.length > MAX_LENGTH || !payload.createdAt || Date.now() - Number(payload.createdAt) > MAX_AGE_MS) {
                storeRef.removeItem(KEY);
                return null;
            }
            // A consumer for the wrong route must not destroy a valid handoff.
            if (target && payload.target && payload.target !== target) return null;
            storeRef.removeItem(KEY);
            return payload.text;
        } catch (error) {
            try { storeRef.removeItem(KEY); } catch (ignored) { }
            return null;
        }
    }

    function normalizedPath() {
        return (root && root.location && root.location.pathname || '/').replace(/\.html$/i, '').replace(/\/index$/i, '/').replace(/\/+$/, '') || '/';
    }

    function snapshotSignature(snapshot) {
        if (!snapshot) return '';
        return String(snapshot.text || '').replace(/\s+/g, ' ').trim() + '\u0000' + String(snapshot.content || '').replace(/\s+/g, ' ').trim();
    }

    function preserveBasicSnapshot(snapshot) {
        if (!snapshot || !String(snapshot.text || snapshot.content || '').trim()) return false;
        try {
            var items = JSON.parse(root.localStorage.getItem(BASIC_HISTORY_KEY) || '[]');
            if (!Array.isArray(items)) items = [];
            var signature = snapshotSignature(snapshot);
            items = items.filter(function (item) { return snapshotSignature(item) !== signature; });
            items.unshift(snapshot);
            root.localStorage.setItem(BASIC_HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
            return true;
        } catch (error) {
            return false;
        }
    }

    function preserveBasicBeforeImport(target) {
        try {
            var existing = JSON.parse(root.localStorage.getItem(BASIC_DRAFT_KEY) || 'null');
            if (existing) preserveBasicSnapshot(existing);
        } catch (error) { /* Local storage can be unavailable. */ }
        var visible = target && String(target.value || '').trim();
        if (visible) preserveBasicSnapshot({ content: target.value, text: target.value, savedAt: Date.now() });
    }

    function discardV2(targetWorkspace) {
        var runtime = root && root.WriteUrduWorkspaceHandoff;
        if (runtime && typeof runtime.discard === 'function') {
            try { runtime.discard(targetWorkspace); } catch (error) { /* legacy import already succeeded */ }
        }
    }

    function switchBasicEditorToDirectMode() {
        if (!root || !root.document) return;
        var direct = root.document.querySelector('[data-input-mode-control][data-input-mode-storage="basic"] [data-input-mode-option="direct"]');
        if (direct && direct.getAttribute('aria-pressed') !== 'true') direct.click();
    }

    function consumeBasicEditor() {
        if (!root || !root.document || normalizedPath() !== '/') return false;
        var target = root.document.getElementById('transliterateTextarea');
        if (!target) return false;
        var text = take('/');
        if (text === null) return false;
        preserveBasicBeforeImport(target);
        switchBasicEditorToDirectMode();
        target.value = text;
        target.dispatchEvent(new Event('input', { bubbles: true }));
        target.dispatchEvent(new Event('change', { bubbles: true }));
        if (typeof target.focus === 'function') target.focus();
        try { target.setSelectionRange(target.value.length, target.value.length); } catch (error) { }
        discardV2('basic-writer');
        var notice = root.document.getElementById('appNotifications');
        if (notice) {
            notice.textContent = 'Your imported Urdu text is ready to edit.';
            notice.className = 'app-notifications is-visible is-success';
        }
        return true;
    }

    function consumeCleaner() {
        if (!root || !root.document || normalizedPath() !== '/urdu-text-cleaner') return false;
        var source = root.document.getElementById('cleanerSource');
        var analyze = root.document.querySelector('[data-cleaner-analyze]');
        if (!source || !analyze) return false;
        var text = take('/urdu-text-cleaner');
        if (text === null) return false;
        source.value = text;
        source.dispatchEvent(new Event('input', { bubbles: true }));
        analyze.click();
        if (typeof source.focus === 'function') source.focus();
        discardV2('text-cleaner');
        return true;
    }

    function consumeForCurrentRoute() {
        if (consumeBasicEditor()) return true;
        return consumeCleaner();
    }

    function start() {
        // Run after route-specific controls initialize. Imported Unicode text is
        // explicit session-only state and is consumed once by its target tool.
        root.setTimeout(consumeForCurrentRoute, 0);
    }

    if (root && root.document) {
        if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start);
        else start();
    }

    return {
        KEY: KEY,
        MAX_LENGTH: MAX_LENGTH,
        store: store,
        take: take,
        preserveBasicBeforeImport: preserveBasicBeforeImport,
        consumeBasicEditor: consumeBasicEditor,
        consumeCleaner: consumeCleaner,
        consumeForCurrentRoute: consumeForCurrentRoute
    };
}));
