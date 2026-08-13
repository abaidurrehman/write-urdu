(function () {
    'use strict';

    var root = document.querySelector('[data-social-direct-workspace]');
    if (!root) return;

    var mode = root.getAttribute('data-social-direct-workspace');
    var social = window.WriteUrduSocialMaker;
    var core = window.WriteUrduCardStudio;
    var titleMeta = document.querySelector('meta[property="og:title"]');
    var pageTitle = titleMeta && titleMeta.content ? titleMeta.content : document.title;

    function preserveRoleShell() {
        document.body.classList.remove('social-maker-embedded');
        document.title = pageTitle;
        root.dataset.socialDirectMode = mode;
    }

    function connect() {
        preserveRoleShell();
        var app = window.WriteUrduCardStudioApp;
        var config = social && social.getMode ? social.getMode(mode) : null;
        if (!app || !config || !core) return;

        var current = app.getState();
        if (!current || current.presetId !== config.defaultPreset || current.socialMode !== mode) {
            var next = core.applyPreset(current || core.createDefaultCardProject(''), config.defaultPreset);
            next.socialMode = mode;
            next.name = config.filenamePrefix;
            app.replaceState(core.normalizeCardProject(next), { save: false });
            if (app.scheduleSave) app.scheduleSave();
        }
        app.requestRender();

        window.WriteUrduSocialDirectApp = {
            mode: mode,
            getWorkspaceApp: function () { return app; },
            getCanvas: function () { return app.getCanvas(); },
            getState: function () { return app.getState(); }
        };
        document.dispatchEvent(new CustomEvent('write-urdu:social-direct-ready', { detail: { mode: mode } }));
    }

    preserveRoleShell();
    if (window.WriteUrduCardStudioApp) connect();
    else document.addEventListener('write-urdu:card-studio-ready', connect, { once: true });
    document.addEventListener('write-urdu:locale-change', preserveRoleShell);
}());
