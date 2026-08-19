(function (root, document) {
    'use strict';

    // The preserved core still owns established shell behavior, including the
    // single AdSense loader guard script[src="js/ads.js"]. Slice D owns rendered
    // taxonomy; Slice E owns contextual continuation. Slice F extends that same
    // governed runtime to successful Voice, Image-to-Text and InPage capture
    // results. Slice G extends the registry before continuity renders Create /
    // Publish boundaries and adds a compatibility-safe Card Studio seed adapter.
    // WU-PLAT-003 remains the low-risk core-workspace convergence layer.

    var HOME_SEARCH_INTENT_INTRO = 'Type Urdu using English letters. Press Space after each word to get Urdu script — no Urdu keyboard or account needed.';

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

    function loadModule(src) {
        if (document.querySelector('script[src="' + src + '"]')) return;
        var script = document.createElement('script');
        script.type = 'module';
        script.src = src;
        document.head.appendChild(script);
    }

    function ensureStylesheet(href) {
        if (document.querySelector('link[href="' + href + '"]')) return;
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    function installAccountControl() {
        var headerInner = document.querySelector('.wu-header-inner');
        if (!headerInner) return;
        if (!headerInner.querySelector('[data-wu-account-control]')) {
            var control = document.createElement('div');
            control.className = 'wu-account-control';
            control.setAttribute('data-wu-account-control', '');
            control.innerHTML = '<a class="wu-account-sign-in" href="/sign-in" aria-hidden="true" tabindex="-1">Sign in</a>';
            control.hidden = true;
            var languageToggle = headerInner.querySelector('[data-wu-language-toggle]');
            headerInner.insertBefore(control, languageToggle || null);
        }
        ensureStylesheet('/css/account.css');
        loadModule('/js/account-control.mjs');
    }

    function normalizedPath() {
        var path = String(root.location && root.location.pathname || '/').split('?')[0].split('#')[0] || '/';
        if (path === '/index' || path === '/index.html') return '/';
        if (/\.html$/i.test(path)) path = path.slice(0, -5);
        if (path.length > 1) path = path.replace(/\/+$/, '');
        return path || '/';
    }

    function restoreHomepageSearchIntentCopy(event) {
        if (normalizedPath() !== '/') return;
        var locale = event && event.detail && event.detail.locale;
        if (locale === 'ur') return;
        var intro = document.querySelector('.page-intro');
        if (intro) intro.textContent = HOME_SEARCH_INTENT_INTRO;
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

    document.addEventListener('write-urdu:locale-change', restoreHomepageSearchIntentCopy);

    loadScript('/js/site-header-core.js', 'WriteUrduLocale', function () {
        installAccountControl();
        restoreHomepageSearchIntentCopy({ detail: { locale: root.WriteUrduLocale && typeof root.WriteUrduLocale.get === 'function' ? root.WriteUrduLocale.get() : 'en' } });
        loadScript('/js/outcome-navigation.js', 'WriteUrduOutcomeNavigation', function () {
            if (root.WriteUrduOutcomeNavigation && typeof root.WriteUrduOutcomeNavigation.render === 'function') {
                root.WriteUrduOutcomeNavigation.render();
                protectOutcomeNavigationDuringV2Start();
            }
            loadScript('/js/core-workspace-convergence.js', 'WriteUrduCoreWorkspaceConvergence', function () {
                if (root.WriteUrduCoreWorkspaceConvergence && typeof root.WriteUrduCoreWorkspaceConvergence.run === 'function') {
                    root.WriteUrduCoreWorkspaceConvergence.run();
                }
                restoreHomepageSearchIntentCopy({ detail: { locale: root.WriteUrduLocale && typeof root.WriteUrduLocale.get === 'function' ? root.WriteUrduLocale.get() : 'en' } });
                loadContextualNextSteps();
                loadCreationDestinationAdapters();
            });
        });
    });
}(window, document));
