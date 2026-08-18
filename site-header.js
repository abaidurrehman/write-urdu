(function (root, document) {
    'use strict';

    // The preserved core still owns the established shell behaviors checked by
    // older contracts, including the single AdSense loader guard
    // script[src="js/ads.js"]. Slice D only replaces rendered taxonomy.
    // Established route ownership also remains unchanged, including
    // /urdu-invoice-generator; no /write, /create, /work or /learn URLs exist.

    function loadScript(src, marker, done) {
        if (marker && root[marker]) {
            done();
            return;
        }
        var existing = document.querySelector('script[src="' + src + '"]');
        if (existing) {
            if (existing.getAttribute('data-wu-loaded') === 'true') done();
            else existing.addEventListener('load', done, { once: true });
            return;
        }
        var script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.addEventListener('load', function () {
            script.setAttribute('data-wu-loaded', 'true');
            done();
        }, { once: true });
        document.head.appendChild(script);
    }

    loadScript('/js/site-header-core.js', 'WriteUrduLocale', function () {
        loadScript('/js/outcome-navigation.js', 'WriteUrduOutcomeNavigation', function () {
            if (root.WriteUrduOutcomeNavigation && typeof root.WriteUrduOutcomeNavigation.render === 'function') {
                root.WriteUrduOutcomeNavigation.render();
            }
        });
    });
}(window, document));