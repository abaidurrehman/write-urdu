(function (root) {
    'use strict';

    var TARGET = 'qr-generator';
    var LEGACY_KEY = 'writeUrdu.qrGenerator.incoming';

    function normalizePath() {
        var path = String(root.location && root.location.pathname || '/').split('?')[0].split('#')[0] || '/';
        if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
        if (path.endsWith('.html')) path = path.slice(0, -5);
        return path || '/';
    }

    function consume() {
        if (normalizePath() !== '/qr-code-generator') return null;
        var handoff = root.WriteUrduWorkspaceHandoff;
        if (!handoff || typeof handoff.take !== 'function') return null;
        var envelope = handoff.take(TARGET);
        if (!envelope || !envelope.payload || envelope.payload.kind !== 'plain-text') return null;
        var text = typeof envelope.payload.text === 'string' ? envelope.payload.text : '';
        if (!text.trim()) return null;
        try {
            root.sessionStorage.setItem(LEGACY_KEY, JSON.stringify({
                version: 1,
                type: 'text',
                text: text,
                source: envelope.source && envelope.source.workspace || 'workspace',
                createdAt: new Date(envelope.createdAt || Date.now()).toISOString()
            }));
        } catch (error) {
            return null;
        }
        if (root.document && root.document.documentElement) {
            root.document.documentElement.setAttribute('data-wu-qr-v2-imported', 'true');
        }
        return envelope;
    }

    var consumed = consume();
    root.WriteUrduQrHandoffAdapter = { TARGET: TARGET, consume: consume, consumed: consumed };
}(window));
