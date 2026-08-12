(function (root, factory) {
    'use strict';

    var api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) {
        root.WriteUrduAds = api;
        if (root.document) api.init(root);
    }
}(typeof window !== 'undefined' ? window : null, function () {
    'use strict';

    var ADSENSE_CLIENT = 'ca-pub-4727847909946286';
    var SHARED_SLOT = '8323789671';

    // GROWTH-A1: every public product route has one monetization posture.
    // This is deliberately independent from SEO intent ownership: the groups
    // only describe how aggressively a page may carry advertising.
    var PAGE_TYPES = {
        write: [
            '/', '/urdu-editor', '/urdu-keyboard'
        ],
        learn: [
            '/roman-urdu-transliteration', '/urdu-alphabet', '/urdu-fonts-nastaliq-vs-naskh',
            '/english-urdu-typing-tutorial', '/urdu-faq', '/write-urdu-documentation',
            '/write-urdu-features', '/urdu-editor-features'
        ],
        create: [
            '/urdu-card-studio', '/urdu-templates', '/stylish-urdu-text-generator',
            '/urdu-name-art-maker', '/urdu-whatsapp-status-maker', '/urdu-instagram-post-maker',
            '/urdu-invoice-generator', '/qr-code-generator'
        ],
        trust: [
            '/why-write-urdu', '/write-urdu-feedback', '/write-urdu-privacy',
            '/write-urdu-search', '/write-urdu-sitemap'
        ]
    };

    var LEGACY_DUPLICATE_ROUTES = {
        '/english-urdu-typing-tutorial': true
    };

    var LEARN_ANCHORS = [
        '[data-wu-ad-boundary="after-answer"]',
        '.authority-quick-answer',
        '.authority-section',
        '.seo-content > section',
        '.content-article > section',
        'main section',
        '.page-intro',
        '.docs-lede'
    ];

    var CREATE_ANCHORS = [
        '[data-wu-ad-boundary="post-workspace"]',
        '.name-art-workspace',
        '.social-maker-workspace',
        '[data-invoice-generator]',
        '[data-stylish-generator]',
        '[data-template-library]',
        'main'
    ];

    function normalizePath(pathname) {
        var path = String(pathname || '/').split('?')[0].split('#')[0] || '/';
        if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
        if (path === '/index.html') return '/';
        if (path.endsWith('.html')) path = path.slice(0, -5);
        return path || '/';
    }

    function resolvePageType(pathname) {
        var path = normalizePath(pathname);
        var type = Object.keys(PAGE_TYPES).find(function (key) {
            return PAGE_TYPES[key].indexOf(path) >= 0;
        });
        return type || 'unclassified';
    }

    function placementName(pageType) {
        if (pageType === 'learn') return 'guide_after_answer';
        if (pageType === 'create') return 'tool_post_workspace';
        if (pageType === 'write') return 'write_post_workspace';
        return 'legacy_content';
    }

    function findFirst(document, selectors) {
        for (var i = 0; i < selectors.length; i += 1) {
            var element = document.querySelector(selectors[i]);
            if (element) return element;
        }
        return null;
    }

    function moveAfter(region, anchor) {
        if (!region || !anchor || region === anchor || region.contains(anchor)) return false;
        anchor.insertAdjacentElement('afterend', region);
        return true;
    }

    function removeSlot(slot) {
        if (!slot || !slot.parentElement) return;
        var parent = slot.parentElement;
        slot.remove();
        if (!parent.textContent.trim() && !parent.querySelector('img,iframe,video,canvas,a,button,input,textarea,select')) {
            parent.hidden = true;
        }
    }

    function cleanLegacyDuplicates(document, path, canonicalRegion) {
        if (!LEGACY_DUPLICATE_ROUTES[path]) return 0;
        var removed = 0;
        Array.prototype.slice.call(document.querySelectorAll('ins.adsbygoogle')).forEach(function (slot) {
            if (canonicalRegion && canonicalRegion.contains(slot)) return;
            removeSlot(slot);
            removed += 1;
        });

        // The legacy tutorial used a dedicated Bootstrap side rail containing
        // only social widgets and repeated ad units. After the repeated units
        // are retired, let the article use the full row instead of preserving
        // an empty 25% column.
        if (path === '/english-urdu-typing-tutorial' && removed) {
            var article = document.querySelector('.col-12.col-md-9');
            var row = article && article.parentElement;
            var side = row && row.querySelector('.col-6.col-md-3');
            if (side) side.hidden = true;
            if (article) {
                article.style.flex = '0 0 100%';
                article.style.maxWidth = '100%';
            }
            if (document.body) document.body.classList.add('wu-legacy-ad-cleanup');
        }
        return removed;
    }

    function removeAllAds(document) {
        Array.prototype.slice.call(document.querySelectorAll('ins.adsbygoogle')).forEach(removeSlot);
        Array.prototype.slice.call(document.querySelectorAll('.wu-header-ad')).forEach(function (region) {
            region.remove();
        });
    }

    function positionCanonicalRegion(document, pageType, region) {
        if (!region) return { moved: false, placement: null };
        var placement = placementName(pageType);
        var anchor = null;

        if (pageType === 'learn') anchor = findFirst(document, LEARN_ANCHORS);
        if (pageType === 'create') anchor = findFirst(document, CREATE_ANCHORS);

        // Core writing routes intentionally require an explicit post-workspace
        // boundary before a shared unit can be shown. If a future shell change
        // accidentally injects a top-of-page unit, remove it rather than
        // guessing where the active editor ends.
        if (pageType === 'write') {
            anchor = document.querySelector('[data-wu-ad-boundary="post-workspace"]');
            if (!anchor) {
                region.remove();
                return { moved: false, placement: null };
            }
        }

        var moved = anchor ? moveAfter(region, anchor) : false;
        region.classList.add('wu-ad-region');
        region.setAttribute('data-wu-ad-placement', placement);
        region.setAttribute('data-wu-ad-page-type', pageType);
        region.setAttribute('aria-label', 'Advertisement');
        return { moved: moved, placement: placement };
    }

    function loadAdSense(root, slots) {
        var document = root.document;
        if (!slots.length || document.querySelector('script[data-write-urdu-ads]')) return false;

        function initializeSlots() {
            slots.forEach(function (slot) {
                if (!slot.isConnected || slot.getAttribute('data-adsbygoogle-status')) return;
                try {
                    (root.adsbygoogle = root.adsbygoogle || []).push({});
                } catch (error) {
                    if (root.console && typeof root.console.warn === 'function') {
                        root.console.warn('An advertising slot could not be initialized.', error);
                    }
                }
            });
        }

        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_CLIENT;
        script.crossOrigin = 'anonymous';
        script.setAttribute('data-write-urdu-ads', '');
        script.onload = initializeSlots;
        document.head.appendChild(script);
        return true;
    }

    function init(root) {
        root = root || (typeof window !== 'undefined' ? window : null);
        if (!root || !root.document) return null;

        var document = root.document;
        var path = normalizePath(root.location && root.location.pathname);
        var pageType = resolvePageType(path);
        if (document.body) {
            document.body.setAttribute('data-wu-monetization-type', pageType);
            document.body.classList.add('wu-monetization-' + pageType);
        }

        if (pageType === 'trust') {
            removeAllAds(document);
            return { path: path, pageType: pageType, placement: null, slotCount: 0, adsenseLoaded: false };
        }

        var canonicalRegion = document.querySelector('.wu-header-ad');
        var removedLegacySlots = cleanLegacyDuplicates(document, path, canonicalRegion);
        var position = positionCanonicalRegion(document, pageType, canonicalRegion);
        var slots = Array.prototype.slice.call(document.querySelectorAll('ins.adsbygoogle'));

        // Stable non-AdSense metadata makes DOM checks and future reporting
        // integrations possible without inventing custom-channel IDs. Actual
        // AdSense data-ad-channel values are added only after the matching
        // channels are created in the publisher account.
        slots.forEach(function (slot) {
            if (!slot.getAttribute('data-wu-ad-placement')) {
                slot.setAttribute('data-wu-ad-placement', position.placement || 'legacy_manual');
            }
            slot.setAttribute('data-wu-ad-page-type', pageType);
        });

        var loaded = loadAdSense(root, slots);
        return {
            path: path,
            pageType: pageType,
            placement: position.placement,
            moved: position.moved,
            removedLegacySlots: removedLegacySlots,
            slotCount: slots.length,
            adsenseLoaded: loaded
        };
    }

    return {
        ADSENSE_CLIENT: ADSENSE_CLIENT,
        SHARED_SLOT: SHARED_SLOT,
        PAGE_TYPES: PAGE_TYPES,
        LEGACY_DUPLICATE_ROUTES: LEGACY_DUPLICATE_ROUTES,
        normalizePath: normalizePath,
        resolvePageType: resolvePageType,
        placementName: placementName,
        init: init
    };
}));
