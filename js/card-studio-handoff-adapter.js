(function (root) {
    'use strict';

    var TARGET = 'card-studio';
    var VISUAL_SEED_SOURCES = { 'card-gallery': true, 'urdu-cards': true, 'home-featured-card': true };
    var LEGACY_KEY = 'writeUrdu.cardStudio.incoming';
    var consuming = false;

    function normalizePath() {
        if (root.WriteUrduLocaleRoute && typeof root.WriteUrduLocaleRoute.productPath === 'function') return root.WriteUrduLocaleRoute.productPath(root.location && root.location.pathname || '/');
        var path = String(root.location && root.location.pathname || '/').split('?')[0].split('#')[0] || '/';
        if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
        if (path.endsWith('.html')) path = path.slice(0, -5);
        return path || '/';
    }

    function templateFromId(id) {
        var library = root.WriteUrduTemplateLibrary;
        if (!library || !Array.isArray(library.TEMPLATES) || !id) return null;
        return library.TEMPLATES.find(function (template) { return template.id === id; }) || null;
    }

    function applyTemplateRoute(template) {
        if (!template || !root.history || typeof root.history.replaceState !== 'function') return false;
        var url = new URL(root.location.href);
        url.searchParams.set('template', template.slug);
        root.history.replaceState(root.history.state, '', url.pathname + url.search + url.hash);
        return true;
    }

    function payloadText(envelope) {
        return envelope && envelope.payload && typeof envelope.payload.text === 'string' ? envelope.payload.text : '';
    }

    function writeLegacyText(envelope) {
        var text = payloadText(envelope);
        if (!text.trim()) return true;
        try {
            root.sessionStorage.setItem(LEGACY_KEY, JSON.stringify({
                version: 1,
                text: text,
                source: envelope.source && envelope.source.workspace || 'workspace',
                createdAt: new Date(envelope.createdAt || Date.now()).toISOString()
            }));
            return true;
        } catch (error) {
            return false;
        }
    }

    function applyToRunningApp(envelope, template) {
        var app = root.WriteUrduCardStudioApp;
        var core = root.WriteUrduCardStudio;
        var library = root.WriteUrduTemplateLibrary;
        if (!app || !core || typeof app.getState !== 'function') return false;

        var text = payloadText(envelope);
        if (template && library && typeof library.applyToCardProject === 'function') {
            var next = library.applyToCardProject(
                core,
                core.createDefaultCardProject(text || ''),
                template,
                { useSampleText: !text.trim() }
            );
            if (typeof app.replaceState === 'function') app.replaceState(next);
            else return false;
        } else if (text.trim() && typeof app.updateObjectText === 'function') {
            app.updateObjectText('text', text);
        } else return false;

        if (typeof app.syncControls === 'function') app.syncControls();
        if (typeof app.requestRender === 'function') app.requestRender();
        if (typeof app.scheduleSave === 'function') app.scheduleSave();
        return true;
    }

    function applyGallerySeed(envelope) {
        var app = root.WriteUrduCardStudioApp;
        var library = root.WriteUrduCardStudioBackgroundLibrary;
        if (!app || typeof app.updateObjectText !== 'function' || !library || typeof library.applyById !== 'function') return null;
        var text = payloadText(envelope);
        app.updateObjectText('text', text, { save: false });
        return library.applyById(envelope.payload.backgroundId).then(function (result) {
            if (typeof app.syncControls === 'function') app.syncControls();
            if (typeof app.requestRender === 'function') app.requestRender();
            if (typeof app.scheduleSave === 'function') app.scheduleSave();
            return result;
        });
    }

    function galleryTelemetry(envelope, result) {
        if (envelope && envelope.source && envelope.source.workspace === 'home-featured-card') return;
        if (!root.WriteUrduTelemetry || typeof root.WriteUrduTelemetry.track !== 'function') return;
        var background = result && result.background;
        root.WriteUrduTelemetry.track('card_gallery_destination_ready', {
            background_id: background && background.id || null,
            gallery_category: background && background.category || null,
            gallery_text_bucket: envelope && envelope.context && envelope.context.textLengthBucket || null,
            success: Boolean(result && result.ok)
        });
    }

    function path(stage, handoff, envelope) {
        if (!envelope || !root.WriteUrduTelemetry || !root.WriteUrduTelemetry.trackContinuationPath) return;
        root.WriteUrduTelemetry.trackContinuationPath(stage, handoff.telemetryDetail(envelope));
    }

    function consume() {
        if (normalizePath() !== '/urdu-card-studio') return null;
        var handoff = root.WriteUrduWorkspaceHandoff;
        if (!handoff || typeof handoff.take !== 'function' || typeof handoff.peek !== 'function') return null;

        var preview = handoff.peek(TARGET);
        if (!preview || !preview.payload) return null;
        var kind = preview.payload.kind;
        var template = null;
        if (kind === 'template-seed') {
            template = templateFromId(preview.payload.templateId || preview.context && preview.context.templateId);
            if (!template) return null;
        } else if (kind === 'visual-project-seed') {
            if (!preview.source || !VISUAL_SEED_SOURCES[preview.source.workspace] || typeof preview.payload.backgroundId !== 'string') return null;
        } else if (kind !== 'plain-text') return null;

        var app = root.WriteUrduCardStudioApp;
        var core = root.WriteUrduCardStudio;
        if (!app || !core || typeof app.getState !== 'function') return null;
        if (kind === 'visual-project-seed') {
            if (consuming) return null;
            var pending = applyGallerySeed(preview);
            if (!pending) return null;
            consuming = true;
            path('destination_ready', handoff, preview);
            return pending.then(function (result) {
                var envelope = handoff.take(TARGET);
                if (!envelope || !envelope.payload) return null;
                if (root.WriteUrduTelemetry && root.WriteUrduTelemetry.track) root.WriteUrduTelemetry.track('continuation_destination_ready', { target_route: '/urdu-card-studio' });
                if (root.WriteUrduTelemetry && root.WriteUrduTelemetry.track) root.WriteUrduTelemetry.track('continuation_payload_restored', { target_route: '/urdu-card-studio' });
                path('payload_restored', handoff, envelope);
                galleryTelemetry(envelope, result);
                if (root.document && root.document.documentElement) {
                    root.document.documentElement.setAttribute('data-wu-card-seed-kind', kind);
                    root.document.documentElement.setAttribute('data-wu-card-seed-applied', result && result.ok ? 'live' : 'text-only');
                    if (result && result.reason) root.document.documentElement.setAttribute('data-wu-card-seed-fallback', result.reason);
                }
                return envelope;
            }).finally(function () { consuming = false; });
        }
        path('destination_ready', handoff, preview);
        if (template) applyTemplateRoute(template);
        if (!applyToRunningApp(preview, template)) return null;

        var envelope = handoff.take(TARGET);
        if (!envelope || !envelope.payload) return null;
        if (root.WriteUrduTelemetry && root.WriteUrduTelemetry.track) root.WriteUrduTelemetry.track('continuation_destination_ready', { target_route: '/urdu-card-studio' });
        if (root.WriteUrduTelemetry && root.WriteUrduTelemetry.track) root.WriteUrduTelemetry.track('continuation_payload_restored', { target_route: '/urdu-card-studio' });
        path('payload_restored', handoff, envelope);

        if (root.document && root.document.documentElement) {
            root.document.documentElement.setAttribute('data-wu-card-seed-kind', kind);
            root.document.documentElement.setAttribute('data-wu-card-seed-applied', 'live');
        }
        return envelope;
    }

    var consumed = consume();
    if (!consumed && normalizePath() === '/urdu-card-studio') {
        root.document.addEventListener('write-urdu:card-studio-ready', function () { consume(); }, { once: true });
        root.document.addEventListener('write-urdu:card-background-library-ready', function () { consume(); }, { once: true });
    }

    root.WriteUrduCardStudioHandoffAdapter = {
        TARGET: TARGET,
        consume: consume,
        consumed: consumed,
        templateFromId: templateFromId,
        applyToRunningApp: applyToRunningApp
    };
}(window));
