(function () {
    'use strict';

    var shellObserver;
    var telemetryRoutes = [
        '/urdu-card-studio', '/stylish-urdu-text-generator', '/urdu-name-art-maker',
        '/urdu-whatsapp-status-maker', '/urdu-instagram-post-maker',
        '/urdu-invoice-generator', '/qr-code-generator'
    ];

    function normalizedPath() {
        return (window.location.pathname || '/').replace(/\/+$/, '') || '/';
    }

    function normalizedProductPath() {
        if (window.WriteUrduLocaleRoute && typeof window.WriteUrduLocaleRoute.productPath === 'function') return window.WriteUrduLocaleRoute.productPath(window.location.pathname || '/');
        var path = normalizedPath().replace(/\.html$/i, '');
        return path === '/index' ? '/' : path;
    }

    function ensureProductTelemetry() {
        if (telemetryRoutes.indexOf(normalizedProductPath()) < 0) return;

        function loadIntegrations() {
            if (document.querySelector('script[data-write-urdu-product-telemetry-integrations]')) return;
            var integrations = document.createElement('script');
            integrations.src = '/js/product-telemetry-integrations.js';
            integrations.async = false;
            integrations.setAttribute('data-write-urdu-product-telemetry-integrations', '');
            document.head.appendChild(integrations);
        }

        if (window.WriteUrduTelemetry) {
            loadIntegrations();
            return;
        }
        var existing = document.querySelector('script[data-write-urdu-product-telemetry], script[src$="js/product-telemetry.js"]');
        if (existing) {
            existing.addEventListener('load', loadIntegrations, { once: true });
            return;
        }
        var telemetry = document.createElement('script');
        telemetry.src = '/js/product-telemetry.js';
        telemetry.async = false;
        telemetry.setAttribute('data-write-urdu-product-telemetry', '');
        telemetry.addEventListener('load', loadIntegrations, { once: true });
        document.head.appendChild(telemetry);
    }

    function isCurrent(href) {
        var path = normalizedPath().replace(/\.html$/i, '');
        var target = href.replace(/\.html$/i, '');
        return target === '/' ? path === '/' || path === '/index' : path === target;
    }

    function label(key, text) {
        return '<span data-wu-i18n-key="nav.' + key + '">' + text + '</span>';
    }

    function customLabel(english, urdu) {
        return '<span data-wu-v2-label data-v2-en="' + english + '" data-v2-ur="' + urdu + '">' + english + '</span>';
    }

    function link(href, contents, extraClass) {
        return '<a href="' + href + '"' + (extraClass ? ' class="' + extraClass + (isCurrent(href) ? ' is-active' : '') + '"' : (isCurrent(href) ? ' class="is-active"' : '')) + (isCurrent(href) ? ' aria-current="page"' : '') + '>' + contents + '</a>';
    }

    function menu(title, urduTitle, menuClass, items, active) {
        return '<details class="wu-nav-more ' + menuClass + '">' +
            '<summary' + (active ? ' class="is-active"' : '') + '>' + customLabel(title, urduTitle) + '<span aria-hidden="true">⌄</span></summary>' +
            '<div class="wu-nav-more-menu">' + items.join('') + '</div>' +
        '</details>';
    }

    function buildNavigation(nav) {
        if (!nav || nav.hasAttribute('data-wu-v2-navigation')) return;

        var createRoutes = [
            '/urdu-card-studio', '/urdu-templates', '/stylish-urdu-text-generator',
            '/urdu-name-art-maker', '/urdu-whatsapp-status-maker',
            '/urdu-instagram-post-maker', '/qr-code-generator'
        ];
        var learnRoutes = [
            '/write-urdu-documentation', '/urdu-faq', '/roman-urdu-transliteration',
            '/urdu-alphabet', '/english-urdu-typing-tutorial',
            '/urdu-fonts-nastaliq-vs-naskh'
        ];
        var createActive = createRoutes.some(isCurrent);
        var learnActive = learnRoutes.some(isCurrent);

        var createItems = [
            '<div class="wu-nav-menu-heading">' + customLabel('Design and publish', 'ڈیزائن اور اشاعت') + '</div>',
            link('/urdu-card-studio', label('cardStudio', 'Card Studio')),
            link('/urdu-templates', label('templates', 'Templates')),
            link('/stylish-urdu-text-generator', label('stylishText', 'Stylish Urdu Text')),
            link('/urdu-name-art-maker', label('nameArt', 'Urdu Name Art')),
            link('/urdu-whatsapp-status-maker', label('whatsappMaker', 'WhatsApp Status Maker')),
            link('/urdu-instagram-post-maker', label('instagramMaker', 'Instagram Post Maker')),
            link('/qr-code-generator', label('qrGenerator', 'QR Code Generator'))
        ];
        var learnItems = [
            '<div class="wu-nav-menu-heading">' + customLabel('Help and learning', 'مدد اور رہنمائی') + '</div>',
            link('/write-urdu-documentation', label('documentation', 'Documentation')),
            link('/urdu-faq', label('faq', 'FAQ')),
            link('/roman-urdu-transliteration', customLabel('Roman Urdu guide', 'رومن اردو رہنما')),
            link('/urdu-alphabet', label('alphabet', 'Urdu Alphabet')),
            link('/english-urdu-typing-tutorial', label('tutorials', 'Tutorials')),
            link('/urdu-fonts-nastaliq-vs-naskh', customLabel('Urdu fonts', 'اردو فونٹس'))
        ];

        nav.innerHTML =
            link('/', label('home', 'Write Urdu'), 'wu-nav-write') +
            link('/urdu-editor', label('editor', 'Rich Text Editor')) +
            link('/urdu-keyboard', label('keyboard', 'Urdu Keyboard')) +
            menu('Create', 'تخلیق', 'wu-nav-create', createItems, createActive) +
            link('/urdu-invoice-generator', label('invoiceGenerator', 'Invoice Generator'), 'wu-nav-business') +
            menu('Learn', 'سیکھیں', 'wu-nav-learn', learnItems, learnActive);
        nav.setAttribute('data-wu-v2-navigation', '');
    }

    function buildFooter(footer) {
        if (!footer || footer.hasAttribute('data-wu-v2-footer')) return;
        footer.classList.add('wu-footer', 'wu-v2-footer');
        footer.setAttribute('data-wu-v2-footer', '');
        footer.innerHTML =
            '<div class="wu-footer-inner">' +
                '<div class="wu-v2-footer-top">' +
                    '<div class="wu-v2-footer-brand">' +
                        '<a class="wu-footer-brand" href="/" aria-label="Write Urdu home">' +
                            '<img src="image/logo10.png" alt="" width="40" height="40">' +
                            '<span data-wu-i18n-key="brand">Write Urdu</span>' +
                        '</a>' +
                        '<p data-wu-i18n-key="footer.description">A simple, private space to type, format, and share Urdu online.</p>' +
                    '</div>' +
                    '<nav class="wu-footer-links wu-footer-nav" aria-label="Footer navigation">' +
                        '<div class="wu-footer-group"><h2>' + customLabel('Write', 'لکھیں') + '</h2>' +
                            link('/', label('home', 'Write Urdu')) +
                            link('/urdu-editor', label('editor', 'Rich Text Editor')) +
                            link('/urdu-keyboard', label('keyboard', 'Urdu Keyboard')) +
                        '</div>' +
                        '<div class="wu-footer-group"><h2>' + customLabel('Create', 'تخلیق') + '</h2>' +
                            link('/urdu-card-studio', label('cardStudio', 'Card Studio')) +
                            link('/urdu-templates', label('templates', 'Templates')) +
                            link('/stylish-urdu-text-generator', label('stylishText', 'Stylish Urdu Text')) +
                            link('/qr-code-generator', label('qrGenerator', 'QR Code Generator')) +
                            link('/urdu-invoice-generator', label('invoiceGenerator', 'Invoice Generator')) +
                        '</div>' +
                        '<div class="wu-footer-group"><h2>' + customLabel('Learn', 'سیکھیں') + '</h2>' +
                            link('/write-urdu-documentation', label('documentation', 'Documentation')) +
                            link('/urdu-faq', label('faq', 'FAQ')) +
                            link('/roman-urdu-transliteration', customLabel('Roman Urdu guide', 'رومن اردو رہنما')) +
                            link('/urdu-alphabet', label('alphabet', 'Urdu Alphabet')) +
                        '</div>' +
                        '<div class="wu-footer-group"><h2>' + customLabel('About', 'تعارف') + '</h2>' +
                            link('/why-write-urdu', customLabel('Why Write Urdu?', 'رائٹ اردو کیوں؟')) +
                            link('/contact', customLabel('Contact', 'رابطہ')) +
                            link('/feedback', customLabel('Feedback', 'رائے')) +
                            link('/write-urdu-privacy', label('privacy', 'Privacy and terms')) +
                            link('/write-urdu-sitemap', customLabel('Sitemap', 'سائٹ میپ')) +
                        '</div>' +
                    '</nav>' +
                '</div>' +
                '<div class="wu-v2-footer-status">' +
                    '<span data-wu-i18n-key="footer.privacyNote">Your writing stays in this browser unless you choose to export or share it.</span>' +
                    '<span data-wu-i18n-key="footer.note">© Write Urdu. Free Urdu writing and creative tools.</span>' +
                '</div>' +
            '</div>';
    }

    function compactTrustbar(header) {
        var inner = header && header.querySelector('.wu-header-trustbar-inner');
        if (!inner || inner.hasAttribute('data-wu-v2-trustbar')) return;
        inner.innerHTML =
            '<span class="wu-header-trust-item"><span class="wu-header-trust-icon" aria-hidden="true">✓</span><span data-wu-i18n-key="header.noAccount">No account required</span></span>' +
            '<span class="wu-header-privacy" data-wu-i18n-key="header.privacy">Private by default · export or share when ready.</span>';
        inner.setAttribute('data-wu-v2-trustbar', '');
    }

    function currentLocale() {
        if (window.WriteUrduLocale && typeof window.WriteUrduLocale.get === 'function') return window.WriteUrduLocale.get();
        return document.documentElement.lang === 'ur' ? 'ur' : 'en';
    }

    function applyCustomLabels() {
        var locale = currentLocale();
        document.querySelectorAll('[data-wu-v2-label]').forEach(function (node) {
            node.textContent = node.getAttribute(locale === 'ur' ? 'data-v2-ur' : 'data-v2-en') || node.textContent;
        });
    }

    function upgradeShell() {
        var header = document.querySelector('[data-write-urdu-header]');
        var nav = header && header.querySelector('.wu-primary-nav');
        var footer = document.querySelector('footer');
        if (!header || !nav || !footer) return false;

        document.body.classList.add('wu-v2-shell');
        buildNavigation(nav);
        compactTrustbar(header);
        buildFooter(footer);
        applyCustomLabels();
        if (window.WriteUrduLocale && typeof window.WriteUrduLocale.apply === 'function') {
            window.WriteUrduLocale.apply();
            applyCustomLabels();
        }
        return true;
    }

    function ensureStylesheet() {
        if (document.querySelector('link[href$="css/v2-shell.css"]')) return;
        var stylesheet = document.createElement('link');
        stylesheet.rel = 'stylesheet';
        stylesheet.href = '/css/v2-shell.css';
        stylesheet.setAttribute('data-write-urdu-v2-shell', '');
        document.head.appendChild(stylesheet);
    }

    function start() {
        ensureProductTelemetry();
        ensureStylesheet();
        if (upgradeShell()) return;
        if (!window.MutationObserver) return;
        shellObserver = new MutationObserver(function () {
            if (upgradeShell() && shellObserver) shellObserver.disconnect();
        });
        shellObserver.observe(document.documentElement, { childList: true, subtree: true });
        window.setTimeout(function () {
            if (shellObserver) shellObserver.disconnect();
            upgradeShell();
        }, 5000);
    }

    document.addEventListener('write-urdu:locale-change', applyCustomLabels);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
}());
