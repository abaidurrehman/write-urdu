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
    var ADSENSE_SCRIPT = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4727847909946286';
    var SHARED_SLOT = '8323789671';
    var ACQUISITION_SCRIPT = '/js/acquisition-telemetry.js';

    var PAGE_TYPES = {
        write: ['/', '/urdu-editor', '/urdu-keyboard'],
        learn: [
            '/roman-urdu-transliteration', '/urdu-alphabet', '/urdu-fonts-nastaliq-vs-naskh',
            '/english-urdu-typing-tutorial', '/urdu-faq', '/write-urdu-documentation',
            '/write-urdu-features', '/urdu-editor-features', '/how-to-write-urdu-on-photo',
            '/how-to-share-urdu-writing-online'
        ],
        create: [
            '/urdu-card-studio', '/urdu-templates', '/stylish-urdu-text-generator',
            '/urdu-name-art-maker', '/urdu-whatsapp-status-maker', '/urdu-instagram-post-maker',
            '/urdu-invoice-generator', '/qr-code-generator', '/urdu-text-cleaner', '/urdu-ocr',
            '/tools/urdu-voice-typing', '/tools/inpage-unicode-converter'
        ],
        trust: [
            '/why-write-urdu', '/contact', '/changelog', '/feedback', '/write-urdu-feedback', '/write-urdu-privacy',
            '/write-urdu-search', '/write-urdu-sitemap', '/sign-in', '/my-documents'
        ]
    };

    var LEGACY_DUPLICATE_ROUTES = { '/english-urdu-typing-tutorial': true };

    var LEARN_ANCHORS = [
        '[data-wu-ad-boundary="after-answer"]', '.authority-quick-answer', '.authority-section',
        '.seo-content > section', '.content-article > section', 'main section', '.page-intro', '.docs-lede'
    ];

    var CREATE_ANCHORS = [
        '[data-wu-ad-boundary="post-workspace"]', '.name-art-workspace', '.social-maker-workspace',
        '.invoice-workspace', '[data-invoice-generator]', '[data-stylish-generator]', '[data-template-library]',
        '[data-urdu-text-cleaner]', '[data-urdu-ocr]', '[data-urdu-voice-typing]', '[data-inpage-converter]',
        '.card-studio-workspace', '.card-studio-shell', '.qr-workspace', '.qr-generator-shell', 'main'
    ];

    var CREATE_PROTECTED_AREAS = [
        '[data-card-studio]', '[data-invoice-generator]', '[data-stylish-generator]', '[data-template-library]',
        '[data-urdu-text-cleaner]', '[data-urdu-ocr]', '[data-urdu-voice-typing]', '[data-inpage-converter]',
        '.name-art-workspace', '.social-maker-workspace', '.invoice-workspace', '.card-studio-workspace',
        '.card-studio-shell', '.qr-workspace', '.qr-generator-shell'
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
        var type = Object.keys(PAGE_TYPES).find(function (key) { return PAGE_TYPES[key].indexOf(path) >= 0; });
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
        if (!parent.textContent.trim() && !parent.querySelector('img,iframe,video,canvas,a,button,input,textarea,select')) parent.hidden = true;
    }

    function cleanLegacyDuplicates(document, path, canonicalRegion) {
        if (!LEGACY_DUPLICATE_ROUTES[path]) return 0;
        var removed = 0;
        Array.prototype.slice.call(document.querySelectorAll('ins.adsbygoogle')).forEach(function (slot) {
            if (canonicalRegion && canonicalRegion.contains(slot)) return;
            removeSlot(slot);
            removed += 1;
        });
        if (path === '/english-urdu-typing-tutorial' && removed) {
            var article = document.querySelector('.col-12.col-md-9');
            var row = article && article.parentElement;
            var side = row && row.querySelector('.col-6.col-md-3');
            if (side) side.hidden = true;
            if (article) { article.style.flex = '0 0 100%'; article.style.maxWidth = '100%'; }
            if (document.body) document.body.classList.add('wu-legacy-ad-cleanup');
        }
        return removed;
    }

    function removeAllAds(document) {
        Array.prototype.slice.call(document.querySelectorAll('ins.adsbygoogle')).forEach(removeSlot);
        Array.prototype.slice.call(document.querySelectorAll('.wu-header-ad')).forEach(function (region) { region.remove(); });
    }

    function buildSlotMarkup() {
        return '<ins class="adsbygoogle" style="display:block" data-ad-client="' + ADSENSE_CLIENT + '" data-ad-slot="' + SHARED_SLOT + '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
    }

    function ensureAcquisitionTelemetry(root) {
        var document = root && root.document;
        if (!document || root.__wuAcquisitionTelemetryLoaded || document.querySelector('script[data-write-urdu-acquisition-telemetry]')) return false;
        var script = document.createElement('script');
        script.async = true;
        script.src = ACQUISITION_SCRIPT;
        script.setAttribute('data-write-urdu-acquisition-telemetry', '');
        document.head.appendChild(script);
        return true;
    }

    function protectAutoAds(document, pageType) {
        if (!document) return 0;
        var protectedCount = 0;
        if (document.body && (pageType === 'write' || pageType === 'trust')) {
            document.body.classList.add('google-anno-skip');
            document.body.setAttribute('google-side-rail-overlap', 'false');
            protectedCount += 1;
        }
        if (pageType === 'create') {
            CREATE_PROTECTED_AREAS.forEach(function (selector) {
                Array.prototype.slice.call(document.querySelectorAll(selector)).forEach(function (node) {
                    node.classList.add('google-anno-skip');
                    node.setAttribute('google-side-rail-overlap', 'false');
                    protectedCount += 1;
                });
            });
        }
        Array.prototype.slice.call(document.querySelectorAll('nav a, a[download], a[href^="#"], [data-create-card], [data-create-qr], .home-actions-group-create a')).forEach(function (link) {
            link.setAttribute('data-google-vignette', 'false');
            protectedCount += 1;
        });
        return protectedCount;
    }

    function createCanonicalRegion(document, pageType) {
        if (!document || document.querySelector('.wu-header-ad')) return document && document.querySelector('.wu-header-ad');
        if (pageType !== 'learn' && pageType !== 'create') return null;
        var anchor = pageType === 'learn' ? findFirst(document, LEARN_ANCHORS) : findFirst(document, CREATE_ANCHORS);
        if (!anchor || !anchor.insertAdjacentElement) return null;
        var region = document.createElement('aside');
        region.className = 'wu-header-ad wu-ad-region wu-ad-placeholder';
        region.setAttribute('aria-label', 'Advertisement');
        region.setAttribute('data-wu-design-ad-slot', '');
        region.setAttribute('data-wu-ad-placement', placementName(pageType));
        region.setAttribute('data-wu-ad-page-type', pageType);
        region.innerHTML = buildSlotMarkup();
        anchor.insertAdjacentElement('afterend', region);
        return region;
    }

    function positionCanonicalRegion(document, pageType, region) {
        if (!region) return { moved: false, placement: null };
        var placement = placementName(pageType);
        var anchor = null;
        if (pageType === 'learn') anchor = findFirst(document, LEARN_ANCHORS);
        if (pageType === 'create') anchor = findFirst(document, CREATE_ANCHORS);
        if (pageType === 'write') {
            anchor = document.querySelector('[data-wu-ad-boundary="post-workspace"]');
            if (!anchor) { region.remove(); return { moved: false, placement: null }; }
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
                try { (root.adsbygoogle = root.adsbygoogle || []).push({}); }
                catch (error) { if (root.console && typeof root.console.warn === 'function') root.console.warn('An advertising slot could not be initialized.', error); }
            });
        }
        var script = document.createElement('script');
        script.async = true;
        script.src = ADSENSE_SCRIPT;
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
        var protectedAutoAds = protectAutoAds(document, pageType);
        ensureAcquisitionTelemetry(root);
        if (pageType === 'trust') {
            removeAllAds(document);
            return { path: path, pageType: pageType, placement: null, slotCount: 0, adsenseLoaded: false, protectedAutoAds: protectedAutoAds };
        }
        var canonicalRegion = document.querySelector('.wu-header-ad') || createCanonicalRegion(document, pageType);
        var removedLegacySlots = cleanLegacyDuplicates(document, path, canonicalRegion);
        var position = positionCanonicalRegion(document, pageType, canonicalRegion);
        var slots = Array.prototype.slice.call(document.querySelectorAll('ins.adsbygoogle'));
        slots.forEach(function (slot) {
            if (!slot.getAttribute('data-wu-ad-placement')) slot.setAttribute('data-wu-ad-placement', position.placement || 'legacy_manual');
            slot.setAttribute('data-wu-ad-page-type', pageType);
        });
        var loaded = loadAdSense(root, slots);
        return { path: path, pageType: pageType, placement: position.placement, moved: position.moved, removedLegacySlots: removedLegacySlots, slotCount: slots.length, adsenseLoaded: loaded, protectedAutoAds: protectedAutoAds };
    }

    return {
        ADSENSE_CLIENT: ADSENSE_CLIENT,
        ADSENSE_SCRIPT: ADSENSE_SCRIPT,
        SHARED_SLOT: SHARED_SLOT,
        ACQUISITION_SCRIPT: ACQUISITION_SCRIPT,
        PAGE_TYPES: PAGE_TYPES,
        LEGACY_DUPLICATE_ROUTES: LEGACY_DUPLICATE_ROUTES,
        normalizePath: normalizePath,
        resolvePageType: resolvePageType,
        placementName: placementName,
        createCanonicalRegion: createCanonicalRegion,
        protectAutoAds: protectAutoAds,
        init: init
    };
}));