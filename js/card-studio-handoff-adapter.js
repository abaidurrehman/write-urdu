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

    function writeLegacyText(envelope) {
        var text = envelope && envelope.payload && typeof envelope.payload.text === 'string' ? envelope.payload.text : '';
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

    function consume() {
        if (normalizePath() !== '/urdu-card-studio') return null;
        var handoff = root.WriteUrduWorkspaceHandoff;
        if (!handoff || typeof handoff.take !== 'function') return null;
        var envelope = handoff.take(TARGET);
        if (!envelope || !envelope.payload) return null;

        var kind = envelope.payload.kind;
        if (kind === 'template-seed') {
            var template = templateFromId(envelope.payload.templateId || envelope.context && envelope.context.templateId);
            if (!template) return null;
            applyTemplateRoute(template);
        } else if (kind !== 'plain-text') {
            return null;
        }

        if (!writeLegacyText(envelope)) return null;
        if (root.document && root.document.documentElement) {
            root.document.documentElement.setAttribute('data-wu-card-seed-kind', kind);
        }
        return envelope;
    }

    var consumed = consume();
    root.WriteUrduCardStudioHandoffAdapter = {
        TARGET: TARGET,
        consume: consume,
        consumed: consumed,
        templateFromId: templateFromId
    };
}(window));
