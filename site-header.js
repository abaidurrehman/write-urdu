(function () {
    'use strict';

    if (!document.documentElement.lang) document.documentElement.lang = 'en';

    var links = [
        { href: 'index.html', match: ['/', '/index.html'], label: 'Write Urdu' },
        { href: 'urdu-editor.html', label: 'Rich Text Editor' },
        { href: 'urdu-keyboard.html', label: 'Urdu Keyboard' },
        { href: 'urdu-alphabet.html', label: 'Urdu Alphabet' },
        { href: 'write-urdu-features.html', label: 'Features' },
        { href: 'english-urdu-typing-tutorial.html', label: 'Tutorials' }
    ];

    function normalizedPath() {
        var path = window.location.pathname.replace(/\/+$/, '') || '/';
        return path.toLowerCase();
    }

    function isActive(link, path) {
        var candidates = link.match || [link.href];
        return candidates.some(function (candidate) {
            var candidatePath = candidate.charAt(0) === '/' ? candidate : '/' + candidate;
            return candidatePath.toLowerCase() === path;
        });
    }

    function addStylesheet() {
        if (document.querySelector('link[href$="css/site-header.css"]')) return;
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/site-header.css';
        link.setAttribute('data-write-urdu-header', '');
        document.head.appendChild(link);
    }

    function renderHeader() {
        var oldNav = document.querySelector('nav.navbar, nav');
        if (!oldNav) return;

        var currentPath = normalizedPath();
        if (!['/', '/index.html', '/urdu-editor.html', '/urdu-keyboard.html'].includes(currentPath)) {
            document.body.classList.add('content-page');
        }

        document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
            link.rel = 'noopener noreferrer';
        });
        if (document.querySelector('ins.adsbygoogle') && !document.querySelector('script[src="js/ads.js"]')) {
            var ads = document.createElement('script');
            ads.src = 'js/ads.js';
            ads.defer = true;
            document.head.appendChild(ads);
        }

        var path = currentPath;
        var header = document.createElement('header');
        header.className = 'wu-site-header';
        header.setAttribute('data-write-urdu-header', '');
        header.innerHTML =
            '<div class="wu-header-inner">' +
                '<a class="wu-brand" href="index.html" aria-label="Write Urdu home">' +
                    '<span class="wu-brand-mark" lang="ur" dir="rtl">و</span>' +
                    '<span><strong>Write Urdu</strong><small>اردو لکھیے، آسانی سے</small></span>' +
                '</a>' +
                '<button class="wu-menu-toggle" type="button" aria-expanded="false" aria-controls="wu-primary-nav">' +
                    '<span class="wu-menu-icon" aria-hidden="true"></span><span class="wu-menu-label">Menu</span>' +
                '</button>' +
                '<nav class="wu-primary-nav" id="wu-primary-nav" aria-label="Primary navigation">' +
                    links.map(function (item) {
                        var active = isActive(item, path);
                        return '<a href="' + item.href + '"' + (active ? ' class="is-active" aria-current="page"' : '') + '>' + item.label + '</a>';
                    }).join('') +
                    '<a class="wu-feedback-link" href="write-urdu-feedback.html">Feedback</a>' +
                '</nav>' +
            '</div>';

        var wrapper = oldNav.parentElement;
        oldNav.replaceWith(header);
        if (wrapper && wrapper.children.length === 1 && wrapper.firstElementChild === header) {
            wrapper.classList.add('wu-header-wrapper');
        }

        var toggle = header.querySelector('.wu-menu-toggle');
        var nav = header.querySelector('.wu-primary-nav');

        function closeMenu() {
            toggle.setAttribute('aria-expanded', 'false');
            nav.classList.remove('is-open');
        }

        toggle.addEventListener('click', function () {
            var open = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!open));
            nav.classList.toggle('is-open', !open);
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closeMenu();
        });
        document.addEventListener('click', function (event) {
            if (!header.contains(event.target)) closeMenu();
        });
        window.addEventListener('resize', function () {
            if (window.innerWidth >= 960) closeMenu();
        });
    }

    addStylesheet();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderHeader);
    } else {
        renderHeader();
    }
}());
