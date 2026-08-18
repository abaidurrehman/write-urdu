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

    function protectOutcomeNavigationDuringV2Start() {
        if (!root.MutationObserver || !root.WriteUrduOutcomeNavigation) return;
        var observer;
        var timeout;

        function stop() {
            if (observer) observer.disconnect();
            observer = null;
            if (timeout) root.clearTimeout(timeout);
            timeout = null;
        }

        function isReady() {
            var nav = document.querySelector('.wu-primary-nav');
            var footer = document.querySelector('.wu-footer-nav');
            return Boolean(nav && nav.getAttribute('data-wu-outcome-nav') === 'v2' && footer && footer.getAttribute('data-wu-outcome-footer') === 'v2');
        }

        function settle() {
            if (document.body && document.body.classList.contains('wu-v2-shell') && isReady()) stop();
        }

        observer = new MutationObserver(function () {
            var nav = document.querySelector('.wu-primary-nav');
            var footer = document.querySelector('.wu-footer-nav');
            var outcomeWasReplaced = (nav && nav.getAttribute('data-wu-outcome-nav') !== 'v2') || (footer && footer.getAttribute('data-wu-outcome-footer') !== 'v2');
            if (outcomeWasReplaced && root.WriteUrduOutcomeNavigation && typeof root.WriteUrduOutcomeNavigation.render === 'function') {
                root.WriteUrduOutcomeNavigation.render();
            }
            settle();
        });
        observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
        timeout = root.setTimeout(stop, 6000);
        settle();
    }

    loadScript('/js/site-header-core.js', 'WriteUrduLocale', function () {
        loadScript('/js/outcome-navigation.js', 'WriteUrduOutcomeNavigation', function () {
            if (root.WriteUrduOutcomeNavigation && typeof root.WriteUrduOutcomeNavigation.render === 'function') {
                root.WriteUrduOutcomeNavigation.render();
                protectOutcomeNavigationDuringV2Start();
            }
        });
    });
}(window, document));