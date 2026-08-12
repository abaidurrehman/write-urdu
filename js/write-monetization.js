(function () {
    'use strict';

    var SHARED_SLOT = '8323789671';
    var CLIENT = 'ca-pub-4727847909946286';
    var CORE_ROUTES = ['/', '/urdu-editor', '/urdu-keyboard'];

    function normalizePath(pathname) {
        var path = String(pathname || '/').split('?')[0].split('#')[0] || '/';
        if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
        if (path === '/index.html') return '/';
        if (path.endsWith('.html')) path = path.slice(0, -5);
        return path || '/';
    }

    function workspaceBoundary(path) {
        if (path === '/') return document.getElementById('UsageAlert');
        if (path === '/urdu-editor') {
            var richEditor = document.getElementById('basic-example');
            return richEditor ? richEditor.parentElement : null;
        }
        if (path === '/urdu-keyboard') return document.getElementById('key1');
        return null;
    }

    function ensureAdsRuntime() {
        if (window.WriteUrduAds && typeof window.WriteUrduAds.init === 'function') {
            window.WriteUrduAds.init(window);
            return;
        }
        if (document.querySelector('script[src="js/ads.js"]')) return;
        var script = document.createElement('script');
        script.src = 'js/ads.js';
        script.defer = true;
        document.head.appendChild(script);
    }

    function restoreCoreWriteAd() {
        var path = normalizePath(window.location && window.location.pathname);
        if (CORE_ROUTES.indexOf(path) < 0) return false;
        if (document.querySelector('.wu-header-ad')) {
            ensureAdsRuntime();
            return true;
        }

        var boundary = workspaceBoundary(path);
        if (!boundary) return false;
        boundary.setAttribute('data-wu-ad-boundary', 'post-workspace');

        var region = document.createElement('aside');
        region.className = 'wu-header-ad wu-write-ad';
        region.setAttribute('aria-label', 'Advertisement');
        region.setAttribute('data-wu-write-ad', '');
        region.innerHTML =
            '<ins class="adsbygoogle"' +
                ' style="display:block"' +
                ' data-ad-client="' + CLIENT + '"' +
                ' data-ad-slot="' + SHARED_SLOT + '"' +
                ' data-ad-format="auto"' +
                ' data-full-width-responsive="true"></ins>';
        boundary.insertAdjacentElement('afterend', region);
        ensureAdsRuntime();
        return true;
    }

    window.WriteUrduWriteMonetization = {
        normalizePath: normalizePath,
        restore: restoreCoreWriteAd,
        routes: CORE_ROUTES.slice()
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', restoreCoreWriteAd);
    else restoreCoreWriteAd();
}());
