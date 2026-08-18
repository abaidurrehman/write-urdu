(function (root) {
    'use strict';

    var registry = root.WriteUrduWorkspaceRegistry;
    if (!registry || registry.__sliceGBoundariesApplied) return;

    var additions = {
        'basic-writer': [
            { id: 'basic-to-templates', target: 'templates', type: 'handoff', label: 'Start from a template', payloadKind: 'plain-text' }
        ],
        'public-share': [
            { id: 'share-to-qr', target: 'qr-generator', type: 'transformation', label: 'Make a QR code for this link', payloadKind: 'plain-text' }
        ]
    };

    function enrich(workspace) {
        if (!workspace || !additions[workspace.id]) return workspace;
        var existing = Array.isArray(workspace.next) ? workspace.next.slice() : [];
        additions[workspace.id].forEach(function (edge) {
            if (!existing.some(function (candidate) { return candidate.id === edge.id; })) existing.push(JSON.parse(JSON.stringify(edge)));
        });
        workspace.next = existing;
        return workspace;
    }

    var baseGet = registry.get.bind(registry);
    var baseList = registry.list.bind(registry);
    var baseFindByRoute = registry.findByRoute.bind(registry);
    var baseAction = registry.action.bind(registry);
    var baseValidate = registry.validate.bind(registry);

    registry.get = function (id) { return enrich(baseGet(id)); };
    registry.list = function (options) { return baseList(options).map(enrich); };
    registry.findByRoute = function (route) { return enrich(baseFindByRoute(route)); };
    registry.action = function (sourceId, actionId) {
        var base = baseAction(sourceId, actionId);
        if (base) return base;
        var workspace = registry.get(sourceId);
        if (!workspace) return null;
        var edge = workspace.next.find(function (candidate) { return candidate.id === actionId; });
        return edge ? JSON.parse(JSON.stringify(edge)) : null;
    };
    registry.validate = function () {
        var errors = baseValidate();
        Object.keys(additions).forEach(function (sourceId) {
            var source = registry.get(sourceId);
            additions[sourceId].forEach(function (edge) {
                if (!source || !source.next.some(function (candidate) { return candidate.id === edge.id; })) errors.push('Slice G edge missing: ' + edge.id);
                if (edge.target && !registry.get(edge.target)) errors.push('Slice G target missing: ' + edge.target);
            });
        });
        return errors;
    };
    registry.SLICE_G_ADDITIONS = JSON.parse(JSON.stringify(additions));
    registry.__sliceGBoundariesApplied = true;
    root.WriteUrduCreatePublishBoundariesRegistry = { additions: registry.SLICE_G_ADDITIONS };
}(window));
