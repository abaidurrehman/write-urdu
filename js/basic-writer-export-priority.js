(function (root, factory) {
    'use strict';
    var api = factory(root);
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduBasicExportPriority = api;
}(typeof window !== 'undefined' ? window : null, function (root) {
    'use strict';

    var DIRECT_EXPORTS = ['pdf', 'word', 'png'];
    var STYLE_HREF = '/css/basic-writer-export-priority.css';
    var observer = null;

    function locale() {
        if (root && root.WriteUrduLocale && typeof root.WriteUrduLocale.get === 'function') return root.WriteUrduLocale.get() === 'ur' ? 'ur' : 'en';
        return root && root.document && /^ur\b/i.test(root.document.documentElement.lang || '') ? 'ur' : 'en';
    }

    function ensureStyles() {
        if (!root || !root.document || root.document.querySelector('link[data-wu-basic-export-priority-style]')) return;
        var link = root.document.createElement('link');
        link.rel = 'stylesheet';
        link.href = STYLE_HREF;
        link.setAttribute('data-wu-basic-export-priority-style', '');
        root.document.head.appendChild(link);
    }

    function directButtons(surface) {
        return DIRECT_EXPORTS.map(function (action) {
            return surface.querySelector('[data-wu-command-action="' + action + '"]');
        }).filter(Boolean);
    }

    function moveToDirectRow(surface) {
        var wrapper = surface && surface.querySelector('[data-wu-basic-download]');
        var row = wrapper && wrapper.querySelector('[data-wu-basic-direct-export-row]');
        if (!row) return false;
        directButtons(surface).forEach(function (button) {
            button.classList.add('wu-basic-command--direct-export');
            row.appendChild(button);
        });
        return true;
    }

    function moveIntoDisclosure(surface) {
        var list = surface && surface.querySelector('.wu-basic-command-download-list');
        if (!list) return false;
        var anchor = list.firstChild;
        directButtons(surface).forEach(function (button) {
            button.classList.remove('wu-basic-command--direct-export');
            list.insertBefore(button, anchor);
        });
        return true;
    }

    function syncDisclosure(surface) {
        var toggle = surface && surface.querySelector('[data-wu-basic-download-toggle]');
        if (!toggle) return false;
        if (toggle.getAttribute('aria-expanded') === 'true') return moveIntoDisclosure(surface);
        return moveToDirectRow(surface);
    }

    function refreshLabels(surface) {
        if (!surface) return;
        var urdu = locale() === 'ur';
        var wrapper = surface.querySelector('[data-wu-basic-download]');
        var row = wrapper && wrapper.querySelector('[data-wu-basic-direct-export-row]');
        var toggle = wrapper && wrapper.querySelector('[data-wu-basic-download-toggle]');
        var heading = wrapper && wrapper.querySelector('[data-wu-basic-download-panel] .wu-basic-command-popover-heading');
        if (row) row.setAttribute('aria-label', urdu ? 'فوری ڈاؤن لوڈ فارمیٹس' : 'Quick download formats');
        if (toggle) {
            var label = urdu ? 'مزید ڈاؤن لوڈ فارمیٹس' : 'More export formats';
            toggle.setAttribute('aria-label', label);
            toggle.setAttribute('title', label);
        }
        if (heading) heading.textContent = urdu ? 'مزید ایکسپورٹ اختیارات' : 'More export options';
    }

    function mount(surface) {
        if (!surface || surface.getAttribute('data-wu-basic-export-priority') === 'true') return Boolean(surface);
        var wrapper = surface.querySelector('[data-wu-basic-download]');
        var toggle = wrapper && wrapper.querySelector('[data-wu-basic-download-toggle]');
        var panel = wrapper && wrapper.querySelector('[data-wu-basic-download-panel]');
        var list = wrapper && wrapper.querySelector('.wu-basic-command-download-list');
        var buttons = directButtons(surface);
        if (!wrapper || !toggle || !panel || !list || buttons.length !== DIRECT_EXPORTS.length) return false;

        var row = root.document.createElement('div');
        row.className = 'wu-basic-command-direct-exports';
        row.setAttribute('data-wu-basic-direct-export-row', '');
        row.setAttribute('role', 'group');
        wrapper.insertBefore(row, toggle);

        wrapper.classList.add('wu-basic-command-export-priority');
        toggle.classList.add('wu-basic-command--export-more');
        toggle.setAttribute('data-wu-basic-export-more', '');
        surface.setAttribute('data-wu-basic-export-priority', 'true');

        moveToDirectRow(surface);
        refreshLabels(surface);

        observer = new root.MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'aria-expanded') syncDisclosure(surface);
            });
        });
        observer.observe(toggle, { attributes: true, attributeFilter: ['aria-expanded'] });

        root.document.addEventListener('write-urdu:locale-change', function () {
            root.setTimeout(function () { refreshLabels(surface); }, 10);
        });
        root.document.addEventListener('write-urdu:locale-changed', function () {
            root.setTimeout(function () { refreshLabels(surface); }, 10);
        });
        return true;
    }

    function run() {
        if (!root || !root.document) return false;
        ensureStyles();
        var surface = root.document.querySelector('[data-wu-basic-command-surface]');
        if (surface) return mount(surface);

        var tries = 0;
        var timer = root.setInterval(function () {
            tries += 1;
            var candidate = root.document.querySelector('[data-wu-basic-command-surface]');
            if (candidate && mount(candidate)) root.clearInterval(timer);
            else if (tries >= 40) root.clearInterval(timer);
        }, 50);
        return true;
    }

    if (root && root.document) {
        if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', run, { once: true });
        else run();
    }

    return {
        DIRECT_EXPORTS: DIRECT_EXPORTS.slice(),
        STYLE_HREF: STYLE_HREF,
        moveToDirectRow: moveToDirectRow,
        moveIntoDisclosure: moveIntoDisclosure,
        syncDisclosure: syncDisclosure,
        mount: mount,
        run: run
    };
}));
