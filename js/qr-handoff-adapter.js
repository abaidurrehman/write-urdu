(function (root) {
    'use strict';

    var TARGET = 'qr-generator';
    var LEGACY_KEY = 'writeUrdu.qrGenerator.incoming';

    function normalizePath() {
        if (root.WriteUrduLocaleRoute && typeof root.WriteUrduLocaleRoute.productPath === 'function') return root.WriteUrduLocaleRoute.productPath(root.location && root.location.pathname || '/');
        var path = String(root.location && root.location.pathname || '/').split('?')[0].split('#')[0] || '/';
        if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
        if (path.endsWith('.html')) path = path.slice(0, -5);
        return path || '/';
    }

    function path(stage, handoff, envelope) {
        if (!envelope || !root.WriteUrduTelemetry || !root.WriteUrduTelemetry.trackContinuationPath) return;
        root.WriteUrduTelemetry.trackContinuationPath(stage, handoff.telemetryDetail(envelope));
    }

    function consume() {
        if (normalizePath() !== '/qr-code-generator') return null;
        var handoff = root.WriteUrduWorkspaceHandoff;
        if (!handoff || typeof handoff.take !== 'function' || typeof handoff.peek !== 'function') return null;
        var preview = handoff.peek(TARGET);
        if (!preview || !preview.payload || preview.payload.kind !== 'plain-text') return null;
        var imported = root.document && root.document.documentElement && root.document.documentElement.getAttribute('data-wu-qr-incoming-restored') === 'true';
        if (!imported) return null;
        path('destination_ready', handoff, preview);
        var envelope = handoff.take(TARGET);
        if (!envelope) return null;
        if (root.WriteUrduTelemetry && root.WriteUrduTelemetry.track) root.WriteUrduTelemetry.track('continuation_destination_ready', { target_route: '/qr-code-generator' });
        if (root.WriteUrduTelemetry && root.WriteUrduTelemetry.track) root.WriteUrduTelemetry.track('continuation_payload_restored', { target_route: '/qr-code-generator' });
        path('payload_restored', handoff, envelope);
        if (root.document && root.document.documentElement) root.document.documentElement.setAttribute('data-wu-qr-v2-imported', 'true');
        return envelope;
    }

    var consumed = consume();
    if (!consumed && normalizePath() === '/qr-code-generator') {
        root.document.addEventListener('write-urdu:qr-generator-imported', function () {
            var envelope = consume();
            if (root.WriteUrduQrHandoffAdapter) root.WriteUrduQrHandoffAdapter.consumed = envelope;
        }, { once: true });
    }
    root.WriteUrduQrHandoffAdapter = { TARGET: TARGET, consume: consume, consumed: consumed };
}(window));
