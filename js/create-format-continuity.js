(function (root) {
    'use strict';

    var document = root.document;
    var mounted = false;
    var busy = false;
    var FORMATS = [
        { workspace: 'card-studio', route: '/urdu-card-studio', file: 'urdu-card-studio.html', label: 'Card Studio', labelUr: 'کارڈ اسٹوڈیو' },
        { workspace: 'whatsapp-status', route: '/urdu-whatsapp-status-maker', file: 'urdu-whatsapp-status-maker.html', label: 'WhatsApp Status', labelUr: 'واٹس ایپ اسٹیٹس' },
        { workspace: 'instagram-post', route: '/urdu-instagram-post-maker', file: 'urdu-instagram-post-maker.html', label: 'Instagram Post', labelUr: 'انسٹاگرام پوسٹ' }
    ];

    function normalizePath() {
        if (root.WriteUrduLocaleRoute && typeof root.WriteUrduLocaleRoute.productPath === 'function') {
            return root.WriteUrduLocaleRoute.productPath(root.location && root.location.pathname || '/');
        }
        var path = String(root.location && root.location.pathname || '/').split('?')[0].split('#')[0] || '/';
        path = path.replace(/^\/urdu(?=\/|$)/, '');
        if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
        if (path.endsWith('.html')) path = path.slice(0, -5);
        return path || '/';
    }

    function currentFormat() {
        var path = normalizePath();
        for (var index = 0; index < FORMATS.length; index += 1) {
            if (FORMATS[index].route === path) return FORMATS[index];
        }
        return null;
    }

    function isUrdu() {
        return document.documentElement.lang === 'ur' || /^\/urdu(?:\/|$)/.test(String(root.location && root.location.pathname || '/'));
    }

    function localizedRoute(path) {
        if (root.WriteUrduLocaleRoute && typeof root.WriteUrduLocaleRoute.href === 'function') {
            return root.WriteUrduLocaleRoute.href(path, isUrdu() ? 'ur' : 'en');
        }
        return isUrdu() ? '/urdu' + path : path;
    }

    function destinationUrl(format) {
        if (root.location && root.location.protocol === 'file:') return format.file;
        return localizedRoute(format.route);
    }

    function cloneProject(project) {
        try { return JSON.parse(JSON.stringify(project || {})); } catch (error) { return null; }
    }

    function currentBackgroundId() {
        var selected = document.querySelector('[data-card-built-in-background][aria-pressed="true"]');
        return selected ? selected.getAttribute('data-card-built-in-background') : null;
    }

    function status(message) {
        var node = document.querySelector('[data-create-format-continuity-status]');
        if (node) node.textContent = message || '';
    }

    function transferTo(format, button) {
        if (busy) return;
        var current = currentFormat();
        var app = root.WriteUrduCardStudioApp;
        var handoff = root.WriteUrduWorkspaceHandoff;
        if (!current || !format || current.workspace === format.workspace) return;
        if (!app || typeof app.getState !== 'function' || !handoff || typeof handoff.transfer !== 'function') {
            status(isUrdu() ? 'یہ فارمیٹ ابھی تیار نہیں۔ دوبارہ کوشش کریں۔' : 'This format is still loading. Please try again.');
            return;
        }

        var project = cloneProject(app.getState());
        var text = project && project.text && typeof project.text.value === 'string' ? project.text.value : '';
        if (!project || !text.trim()) {
            status(isUrdu() ? 'آگے بڑھنے سے پہلے کچھ اردو متن شامل کریں۔' : 'Add some Urdu text before switching format.');
            return;
        }

        busy = true;
        if (button) {
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
        }
        status(isUrdu() ? 'وہی ڈیزائن نئے فارمیٹ میں کھولا جا رہا ہے…' : 'Opening the same design in the new format…');

        var result = handoff.transfer({
            sourceWorkspace: current.workspace,
            sourceRoute: current.route,
            targetWorkspace: format.workspace,
            targetRoute: format.route,
            actionId: 'create-format-' + current.workspace + '-to-' + format.workspace,
            kind: 'plain-text',
            payload: {
                text: text,
                project: project,
                continuityVersion: 1,
                backgroundId: currentBackgroundId()
            },
            context: {
                creationFormatContinuity: true,
                pathVersion: 'urdu-create-format-v1',
                releaseMarker: 'wu-cards-s6b-2026-09-17-v1',
                handoffRequired: true,
                restoreRequired: true
            }
        });

        if (!result || !result.ok) {
            busy = false;
            if (button) {
                button.disabled = false;
                button.removeAttribute('aria-busy');
            }
            status(isUrdu() ? 'یہ فارمیٹ نہیں کھل سکا۔ آپ کا موجودہ ڈیزائن محفوظ ہے۔' : 'Could not open that format. Your current design is unchanged.');
            return;
        }

        root.location.href = root.location && root.location.protocol === 'file:' ? format.file : (result.route || destinationUrl(format));
    }

    function injectStyles() {
        if (document.querySelector('style[data-create-format-continuity-style]')) return;
        var style = document.createElement('style');
        style.setAttribute('data-create-format-continuity-style', '');
        style.textContent = [
            '.wu-create-format-continuity{max-width:1180px;margin:0 auto 16px;padding:12px 14px;border:1px solid rgba(34,91,66,.18);border-radius:14px;background:#f8fcfa;box-shadow:0 6px 18px rgba(18,59,42,.05)}',
            '.wu-create-format-continuity-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:9px}',
            '.wu-create-format-continuity-kicker{margin:0 0 2px;color:#2d7153;font-size:.7rem;font-weight:850;letter-spacing:.06em;text-transform:uppercase}',
            '.wu-create-format-continuity-title{margin:0;color:#173e31;font-size:.95rem;line-height:1.35}',
            '.wu-create-format-continuity-back{flex:0 0 auto;color:#2d7153;font-size:.76rem;font-weight:800;text-decoration:none}',
            '.wu-create-format-continuity-back:hover{text-decoration:underline}',
            '.wu-create-format-continuity-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}',
            '.wu-create-format-continuity-action{min-width:0;min-height:40px;padding:8px 10px;border:1px solid #cadfd4;border-radius:10px;background:#fff;color:#274d3d;font:inherit;font-size:.76rem;font-weight:800;line-height:1.25;cursor:pointer}',
            '.wu-create-format-continuity-action[aria-current="page"]{border-color:#2d7153;background:#1f6749;color:#fff;cursor:default}',
            '.wu-create-format-continuity-action:focus-visible{outline:3px solid rgba(45,113,83,.25);outline-offset:2px}',
            '.wu-create-format-continuity-status{min-height:1.2em;margin:7px 0 0;color:#5a7166;font-size:.72rem}',
            '@media(max-width:640px){.wu-create-format-continuity{margin-bottom:12px;padding:10px}.wu-create-format-continuity-head{display:block}.wu-create-format-continuity-back{display:inline-block;margin-top:5px}.wu-create-format-continuity-actions{grid-template-columns:1fr}.wu-create-format-continuity-action{width:100%;font-size:.78rem}}'
        ].join('');
        document.head.appendChild(style);
    }

    function mount() {
        if (mounted) return true;
        var current = currentFormat();
        var app = root.WriteUrduCardStudioApp;
        var handoff = root.WriteUrduWorkspaceHandoff;
        if (!current || !app || typeof app.getState !== 'function' || !handoff || typeof handoff.transfer !== 'function') return false;

        var workspace = current.workspace === 'card-studio'
            ? document.querySelector('.card-studio-topbar')
            : document.querySelector('[data-social-direct-workspace]');
        if (!workspace || !workspace.parentNode) return false;

        injectStyles();
        var nav = document.createElement('nav');
        nav.className = 'wu-create-format-continuity';
        nav.setAttribute('data-create-format-continuity', current.workspace);
        nav.setAttribute('aria-label', isUrdu() ? 'تخلیقی فارمیٹ تبدیل کریں' : 'Switch creation format');

        var head = document.createElement('div');
        head.className = 'wu-create-format-continuity-head';
        var textWrap = document.createElement('div');
        var kicker = document.createElement('p');
        kicker.className = 'wu-create-format-continuity-kicker';
        kicker.textContent = isUrdu() ? 'ایک ہی ڈیزائن · مختلف فارمیٹ' : 'Same design · different format';
        var title = document.createElement('p');
        title.className = 'wu-create-format-continuity-title';
        title.textContent = isUrdu() ? 'اپنا متن اور ڈیزائن رکھتے ہوئے فارمیٹ تبدیل کریں' : 'Switch format without starting your message and design over.';
        textWrap.appendChild(kicker);
        textWrap.appendChild(title);
        var back = document.createElement('a');
        back.className = 'wu-create-format-continuity-back';
        back.href = localizedRoute('/urdu-cards');
        back.textContent = isUrdu() ? 'کارڈز پر واپس جائیں' : 'Back to Urdu Cards';
        head.appendChild(textWrap);
        head.appendChild(back);

        var actions = document.createElement('div');
        actions.className = 'wu-create-format-continuity-actions';
        FORMATS.forEach(function (format) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'wu-create-format-continuity-action';
            button.dataset.createFormatTarget = format.workspace;
            button.textContent = isUrdu() ? format.labelUr : format.label;
            if (format.workspace === current.workspace) {
                button.setAttribute('aria-current', 'page');
                button.disabled = true;
            } else {
                button.addEventListener('click', function () { transferTo(format, button); });
            }
            actions.appendChild(button);
        });

        var live = document.createElement('p');
        live.className = 'wu-create-format-continuity-status';
        live.dataset.createFormatContinuityStatus = 'true';
        live.setAttribute('role', 'status');
        live.setAttribute('aria-live', 'polite');

        nav.appendChild(head);
        nav.appendChild(actions);
        nav.appendChild(live);
        workspace.parentNode.insertBefore(nav, workspace);
        document.documentElement.setAttribute('data-wu-create-format', current.workspace);
        mounted = true;
        return true;
    }

    function retry(attempt) {
        if (mount()) return;
        if (attempt >= 120) return;
        root.setTimeout(function () { retry(attempt + 1); }, 50);
    }

    document.addEventListener('write-urdu:card-studio-ready', function () { retry(0); });
    document.addEventListener('write-urdu:social-direct-ready', function () { retry(0); });
    document.addEventListener('write-urdu:locale-change', function () {
        var existing = document.querySelector('[data-create-format-continuity]');
        if (existing) existing.remove();
        mounted = false;
        retry(0);
    });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { retry(0); });
    else retry(0);

    root.WriteUrduCreateFormatContinuity = {
        mount: mount,
        currentFormat: currentFormat,
        transferTo: transferTo
    };
}(window));