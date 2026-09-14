(function (root, document) {
    'use strict';

    function normalizedPath() {
        var pathname = String(root.location && root.location.pathname || '/');
        if (root.WriteUrduLocaleRoute && typeof root.WriteUrduLocaleRoute.productPath === 'function') {
            return root.WriteUrduLocaleRoute.productPath(pathname);
        }
        var path = pathname.split('?')[0].split('#')[0] || '/';
        if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
        if (path.endsWith('.html')) path = path.slice(0, -5);
        return path || '/';
    }

    function load(src, marker, next) {
        if (marker && root[marker]) { next(); return; }
        var existing = document.querySelector('script[src="' + src + '"]');
        if (existing) { existing.addEventListener('load', next, { once: true }); return; }
        var script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.addEventListener('load', next, { once: true });
        document.head.appendChild(script);
    }

    function loadLegacy() {
        load('/js/card-studio-entry-legacy.js', 'WriteUrduJourneyHandoffs', function () {});
    }

    if (normalizedPath() === '/urdu-editor') {
        load('/js/urdu-font-registry.js', 'WriteUrduFontRegistry', function () {
            load('/js/urdu-font-tinymce-adapter.js', 'WriteUrduFontTinyMceAdapter', loadLegacy);
        });
    } else {
        loadLegacy();
    }
}(window, document));
