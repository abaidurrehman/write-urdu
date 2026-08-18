(function (root, document) {
    'use strict';

    // The preserved core still owns established shell behavior, including the
    // single AdSense loader guard script[src="js/ads.js"]. Slice D owns rendered
    // taxonomy; Slice E owns contextual continuation. Slice F extends that same
    // governed runtime to successful Voice, Image-to-Text and InPage capture
    // results. Slice G extends the registry before continuity renders Create /
    // Publish boundaries and adds a compatibility-safe Card Studio seed adapter.
    // WU-PLAT-003 remains the low-risk core-workspace convergence layer.

    function loadScript(src, marker, done) {
        if (marker && root[marker]) {
            done();
            return;
        }
        var existing = document.querySelector('script[src="' + src + '"]');
        if (existing) {
            if (existing.getAttribute('data-wu-loaded') === 'true' || (marker && root[marker])) done();
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

    function normalizedPath() {
        var path = String(root.location && root.location.pathname || '/').split('?')[0].split('#')[0] || '/';
        if (path === '/index' || path === '/index.html') return '/';
        if (/\.html$/i.test(path)) path = path.slice(0, -5);
        if (path.length > 1) path = path.replace(/\/+$/, '');
        return path || '/';
    }

    function loadJourneyFoundation(done) {
        loadScript('/js/workspace-journey-registry.js', 'WriteUrduWorkspaceRegistry', function () {
            loadScript('/js/create-publish-boundaries-registry.js', 'WriteUrduCreatePublishBoundariesRegistry', function () {
                loadScript('/js/workspace-handoff.js', 'WriteUrduWorkspaceHandoff', done);
            });
        });
    }

    function shouldLoadContextualNextSteps() {
        return [
            '/',
            '/urdu-editor',
            '/urdu-keyboard',
            '/urdu-text-cleaner',
            '/urdu-ocr',
            '/tools/urdu-voice-typing',
            '/tools/inpage-unicode-converter'
        ].indexOf(normalizedPath()) >= 0;
    }

    function loadContextualNextSteps() {
        if (!shouldLoadContextualNextSteps()) return;
        loadJourneyFoundation(function () {
            loadScript('/js/core-continuity.js', 'WriteUrduCoreContinuity', function () {
                loadScript('/js/workspace-next-step.js', 'WriteUrduWorkspaceNextStep', function () {
                    if (root.WriteUrduWorkspaceNextStep && typeof root.WriteUrduWorkspaceNextStep.render === 'function') {
                        root.WriteUrduWorkspaceNextStep.render();
                    }
                });
            });
        });
    }

    function loadCreationDestinationAdapters() {
        if (normalizedPath() !== '/urdu-card-studio') return;
        loadJourneyFoundation(function () {
            loadScript('/js/card-studio-handoff-adapter.js', 'WriteUrduCardStudioHandoffAdapter', function () {});
        });
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
                if (root.WriteUrduCoreWorkspaceConvergence && typeof root.WriteUrduCoreWorkspaceConvergence.enhanceGlobalLabels === 'function') {
                    root.WriteUrduCoreWorkspaceConvergence.enhanceGlobalLabels();
                }
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
            loadScript('/js/core-workspace-convergence.js', 'WriteUrduCoreWorkspaceConvergence', function () {
                if (root.WriteUrduCoreWorkspaceConvergence && typeof root.WriteUrduCoreWorkspaceConvergence.run === 'function') {
                    root.WriteUrduCoreWorkspaceConvergence.run();
                }
                loadContextualNextSteps();
                loadCreationDestinationAdapters();
            });
        });
    });
}(window, document));
