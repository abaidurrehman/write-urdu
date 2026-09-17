(function (root) {
    'use strict';

    var document = root.document;
    var busy = false;
    var TARGETS = {
        '/urdu-whatsapp-status-maker': 'whatsapp-status',
        '/urdu-instagram-post-maker': 'instagram-post'
    };
    var CONTINUITY_SOURCES = { 'card-studio': true, 'whatsapp-status': true, 'instagram-post': true };

    function normalizePath() {
        var path = String(root.location && root.location.pathname || '/').split('?')[0].split('#')[0] || '/';
        if (root.WriteUrduLocaleRoute && typeof root.WriteUrduLocaleRoute.productPath === 'function') {
            path = root.WriteUrduLocaleRoute.productPath(path);
        } else {
            path = path.replace(/^\/urdu(?=\/|$)/, '');
        }
        if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
        if (path.endsWith('.html')) path = path.slice(0, -5);
        return path || '/';
    }

    function asset(path) {
        return root.location && root.location.protocol === 'file:' ? path.replace(/^\//, '') : path;
    }

    function loadScript(path, marker, ready) {
        if (ready()) return Promise.resolve();
        var existing = document.querySelector('script[' + marker + ']');
        if (existing) {
            return new Promise(function (resolve) {
                if (ready()) resolve();
                else existing.addEventListener('load', resolve, { once: true });
            });
        }
        return new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = asset(path);
            script.async = true;
            script.setAttribute(marker, 'true');
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function ensureDependencies() {
        return loadScript('/js/workspace-journey-registry.js', 'data-social-format-registry', function () {
            return Boolean(root.WriteUrduWorkspaceRegistry);
        }).then(function () {
            return loadScript('/js/workspace-handoff.js', 'data-social-format-handoff', function () {
                return Boolean(root.WriteUrduWorkspaceHandoff);
            });
        }).then(function () {
            return loadScript('/js/card-background-registry.js', 'data-card-background-registry', function () {
                return Boolean(root.WriteUrduCardBackgroundRegistry);
            });
        }).then(function () {
            return loadScript('/js/card-studio-background-library.js', 'data-card-background-library', function () {
                return Boolean(root.WriteUrduCardStudioBackgroundLibrary);
            });
        });
    }

    function continuityProject(preview) {
        if (!preview || !preview.payload || preview.payload.kind !== 'plain-text') return null;
        if (preview.payload.continuityVersion !== 1 || !preview.payload.project || typeof preview.payload.project !== 'object') return null;
        if (!preview.context || preview.context.creationFormatContinuity !== true) return null;
        if (!preview.source || !CONTINUITY_SOURCES[preview.source.workspace]) return null;
        return preview.payload.project;
    }

    function applyProjectContinuity(preview) {
        var project = continuityProject(preview);
        var app = root.WriteUrduCardStudioApp;
        var core = root.WriteUrduCardStudio;
        var social = root.WriteUrduSocialMaker;
        var target = TARGETS[normalizePath()];
        var mode = target === 'whatsapp-status' ? 'whatsapp' : target === 'instagram-post' ? 'instagram' : null;
        var config = social && typeof social.getMode === 'function' ? social.getMode(mode) : null;
        if (!project || !app || !core || !config || typeof app.replaceState !== 'function') return null;

        var next;
        try {
            next = core.normalizeCardProject(JSON.parse(JSON.stringify(project)));
            next = core.applyPreset(next, config.defaultPreset);
            next.socialMode = config.id;
            next.name = config.filenamePrefix;
            next = core.normalizeCardProject(next);
        } catch (error) {
            return null;
        }

        app.replaceState(next, { save: false });
        if (typeof app.syncControls === 'function') app.syncControls();
        if (typeof app.requestRender === 'function') app.requestRender();
        if (typeof app.scheduleSave === 'function') app.scheduleSave();
        var field = document.getElementById('cardText');
        if (field && next.text && field.value !== next.text.value) {
            field.value = next.text.value;
            field.dispatchEvent(new Event('input', { bubbles: true }));
        }
        return Promise.resolve({ ok: true, reason: 'project-continuity' });
    }

    function applyCardsSeed(preview) {
        var app = root.WriteUrduCardStudioApp;
        var library = root.WriteUrduCardStudioBackgroundLibrary;
        if (!app || typeof app.updateObjectText !== 'function' || !library || typeof library.applyById !== 'function') return null;
        if (!preview || !preview.payload || preview.payload.kind !== 'plain-text') return null;
        if (!preview.source || preview.source.workspace !== 'urdu-cards') return null;
        var text = typeof preview.payload.text === 'string' ? preview.payload.text : '';
        if (!text.trim()) return null;
        var backgroundId = preview.context && typeof preview.context.backgroundId === 'string' ? preview.context.backgroundId : '';

        app.updateObjectText('text', text, { save: false });
        var backgroundPromise = backgroundId
            ? library.applyById(backgroundId).catch(function () { return { ok: false, reason: 'background-apply-failed' }; })
            : Promise.resolve({ ok: false, reason: 'missing-background' });

        return backgroundPromise.then(function (result) {
            if (typeof app.syncControls === 'function') app.syncControls();
            if (typeof app.requestRender === 'function') app.requestRender();
            if (typeof app.scheduleSave === 'function') app.scheduleSave();
            var field = document.getElementById('cardText');
            if (field && field.value !== text) {
                field.value = text;
                field.dispatchEvent(new Event('input', { bubbles: true }));
            }
            return result || { ok: false, reason: 'background-unknown' };
        });
    }

    function applyIncoming(preview) {
        return applyProjectContinuity(preview) || applyCardsSeed(preview);
    }

    function mark(target, result, preview) {
        if (!document.documentElement) return;
        document.documentElement.setAttribute('data-wu-social-seed-target', target);
        document.documentElement.setAttribute('data-wu-social-seed-applied', result && result.ok ? 'live' : 'text-only');
        if (result && result.reason) document.documentElement.setAttribute('data-wu-social-seed-fallback', result.reason);
        if (continuityProject(preview)) document.documentElement.setAttribute('data-wu-create-continuity-restored', 'true');
    }

    function consume() {
        if (busy) return null;
        var target = TARGETS[normalizePath()];
        if (!target) return null;
        var handoff = root.WriteUrduWorkspaceHandoff;
        if (!handoff || typeof handoff.peek !== 'function' || typeof handoff.take !== 'function') return null;
        var preview = handoff.peek(target);
        if (!preview || !preview.payload || preview.payload.kind !== 'plain-text') return null;
        if (!continuityProject(preview) && (!preview.source || preview.source.workspace !== 'urdu-cards')) return null;
        var pending = applyIncoming(preview);
        if (!pending) return null;
        busy = true;
        return pending.then(function (result) {
            var envelope = handoff.take(target);
            if (!envelope) return null;
            mark(target, result, preview);
            return envelope;
        }).finally(function () {
            busy = false;
        });
    }

    function attempt(attemptNo) {
        var target = TARGETS[normalizePath()];
        if (!target) return;
        ensureDependencies().then(function () {
            var result = consume();
            if (result) return;
            if (attemptNo >= 60) return;
            root.setTimeout(function () { attempt(attemptNo + 1); }, 50);
        }).catch(function () {
            if (attemptNo >= 20) return;
            root.setTimeout(function () { attempt(attemptNo + 1); }, 100);
        });
    }

    function loadContinuityShell() {
        if (root.WriteUrduCreateFormatContinuity || document.querySelector('script[data-create-format-continuity-script]')) return;
        var script = document.createElement('script');
        script.src = asset('/js/create-format-continuity.js');
        script.async = true;
        script.setAttribute('data-create-format-continuity-script', '');
        document.head.appendChild(script);
    }

    document.addEventListener('write-urdu:social-direct-ready', function () { attempt(0); });
    document.addEventListener('write-urdu:card-background-library-ready', function () { attempt(0); });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { attempt(0); });
    else attempt(0);
    loadContinuityShell();

    root.WriteUrduSocialFormatHandoff = {
        consume: consume,
        targetForPath: function (path) { return TARGETS[path] || null; },
        continuityProject: continuityProject
    };
}(window));