(function (root) {
    'use strict';

    var TARGET = 'card-studio';
    var LEGACY_KEY = 'writeUrdu.cardStudio.incoming';

    function normalizePath() {
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

    function consume() {
        if (normalizePath() !== '/urdu-card-studio') return null;
        var handoff = root.WriteUrduWorkspaceHandoff;
        if (!handoff || typeof handoff.take !== 'function') return null;
        var envelope = handoff.take(TARGET);
        if (!envelope || !envelope.payload) return null;

        var kind = envelope.payload.kind;
        var template = null;
        if (kind === 'template-seed') {
            template = templateFromId(envelope.payload.templateId || envelope.context && envelope.context.templateId);
            if (!template) return null;
            applyTemplateRoute(template);
        } else if (kind !== 'plain-text') return null;

        var appliedLive = applyToRunningApp(envelope, template);
        if (!appliedLive && !writeLegacyText(envelope)) return null;

        if (root.document && root.document.documentElement) {
            root.document.documentElement.setAttribute('data-wu-card-seed-kind', kind);
            root.document.documentElement.setAttribute('data-wu-card-seed-applied', appliedLive ? 'live' : 'staged');
        }
        return envelope;
    }

    var consumed = consume();
    if (!consumed && normalizePath() === '/urdu-card-studio') {
        root.document.addEventListener('write-urdu:card-studio-ready', function () { consume(); }, { once: true });
    }

    root.WriteUrduCardStudioHandoffAdapter = {
        TARGET: TARGET,
        consume: consume,
        consumed: consumed,
        templateFromId: templateFromId,
        applyToRunningApp: applyToRunningApp
    };
}(window));
