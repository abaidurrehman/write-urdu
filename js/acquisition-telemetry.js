(function (root) {
    'use strict';

    if (!root || !root.document || root.__wuAcquisitionTelemetryLoaded) return;
    root.__wuAcquisitionTelemetryLoaded = true;

    var ENDPOINT = '/api/acquisition';
    var CAMPAIGN_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'gclid', 'dclid', 'gbraid', 'wbraid'];
    var OTHER_SEARCH_HOSTS = [
        'bing.com', 'duckduckgo.com', 'yahoo.com', 'search.yahoo.com',
        'yandex.com', 'yandex.ru', 'baidu.com', 'ecosia.org',
        'brave.com', 'search.brave.com', 'startpage.com', 'qwant.com'
    ];

    function normalizedPath(value) {
        var path = String(value || '/').split('?')[0].split('#')[0].replace(/\.html$/i, '').replace(/\/+$/, '') || '/';
        if (path === '/index') path = '/';
        return /^\/[a-z0-9\/-]*$/i.test(path) ? path : '/';
    }

    function hostKey(value) {
        return String(value || '').toLowerCase().replace(/^www\./, '');
    }

    function sameSite(referrerHost, currentHost) {
        return hostKey(referrerHost) === hostKey(currentHost);
    }

    function hasCampaignSignal(url) {
        return CAMPAIGN_PARAMS.some(function (name) { return url.searchParams.has(name); });
    }

    function isGoogleSearchHost(host) {
        return /(^|\.)google\.[a-z.]+$/i.test(host);
    }

    function isOtherSearchHost(host) {
        host = String(host || '').toLowerCase();
        return OTHER_SEARCH_HOSTS.some(function (candidate) {
            return host === candidate || host.endsWith('.' + candidate);
        });
    }

    function acquisitionChannel() {
        var current;
        try {
            current = new URL(root.location.href);
            if (hasCampaignSignal(current)) return 'campaign';
        } catch (error) { }

        var referrer = root.document.referrer;
        if (!referrer) return 'direct_unknown';

        try {
            var source = new URL(referrer);
            if (sameSite(source.hostname, root.location.hostname)) return 'internal';
            if (isGoogleSearchHost(source.hostname)) return 'google_search';
            if (isOtherSearchHost(source.hostname)) return 'other_search';
            return 'referral';
        } catch (error) {
            return 'direct_unknown';
        }
    }

    function pageType() {
        var value = root.document.body && root.document.body.getAttribute('data-wu-monetization-type');
        return /^(write|learn|create|trust)$/.test(String(value || '')) ? value : 'unclassified';
    }

    function send() {
        var body = JSON.stringify({
            route: normalizedPath(root.location.pathname),
            page_type: pageType(),
            acquisition_channel: acquisitionChannel()
        });
        try {
            root.fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: body,
                keepalive: true,
                credentials: 'same-origin'
            }).catch(function () { });
        } catch (error) { }
    }

    root.WriteUrduAcquisitionTelemetry = {
        classify: acquisitionChannel,
        normalizedPath: normalizedPath
    };

    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', send, { once: true });
    else send();
}(typeof window !== 'undefined' ? window : null));
