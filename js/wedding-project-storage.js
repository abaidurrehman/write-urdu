(function (rootWindow, factory) {
    'use strict';
    var core = rootWindow && rootWindow.WriteUrduWeddingCore;
    if (!core && typeof require === 'function') core = require('./wedding-project-core.js');
    var api = factory(core);
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (rootWindow) rootWindow.WriteUrduWeddingProjectStorage = api;
}(typeof window !== 'undefined' ? window : null, function (core) {
    'use strict';
    if (!core) throw new Error('Wedding project core unavailable');

    var STORAGE_KEY = 'writeUrdu.weddingProject.draft.v1';

    // Migration seam: keyed by the schemaVersion a saved draft was written with.
    // Today it's an identity function; a real future migration is additive here,
    // never a breaking rewrite. An unknown/missing version fails closed to null.
    var MIGRATIONS = {
        1: function (raw) { return raw; }
    };

    function getStorage() {
        try {
            return typeof localStorage !== 'undefined' ? localStorage : null;
        } catch (error) {
            return null;
        }
    }

    function saveDraft(project) {
        var storage = getStorage();
        if (!storage) return { ok: false, errorCode: 'storage_unavailable' };
        try {
            var normalized = core.normalizeWeddingProject(project);
            storage.setItem(STORAGE_KEY, JSON.stringify(normalized));
            return { ok: true };
        } catch (error) {
            return { ok: false, errorCode: 'write_failed' };
        }
    }

    function loadDraft() {
        var storage = getStorage();
        if (!storage) return null;
        try {
            var raw = storage.getItem(STORAGE_KEY);
            if (!raw) return null;
            var parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') return null;
            var migrate = MIGRATIONS[parsed.schemaVersion];
            if (typeof migrate !== 'function') return null;
            return core.normalizeWeddingProject(migrate(parsed));
        } catch (error) {
            return null;
        }
    }

    function resetDraft() {
        var storage = getStorage();
        if (!storage) return;
        try { storage.removeItem(STORAGE_KEY); } catch (error) {}
    }

    return {
        STORAGE_KEY: STORAGE_KEY,
        saveDraft: saveDraft,
        loadDraft: loadDraft,
        resetDraft: resetDraft
    };
}));
