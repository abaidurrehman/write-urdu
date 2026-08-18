(function (root, factory) {
    'use strict';
    var registry = null;
    if (typeof module === 'object' && module.exports) {
        try { registry = require('./workspace-journey-registry.js'); } catch (error) { registry = null; }
    } else if (root) {
        registry = root.WriteUrduWorkspaceRegistry || null;
    }
    var api = factory(root, registry);
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduWorkspaceNextStep = api;
}(typeof window !== 'undefined' ? window : null, function (root, Registry) {
    'use strict';

    var MAX_VISIBLE = 3;
    var CAPTURE_WORKSPACES = ['image-to-urdu-text', 'voice-typing', 'inpage-converter'];
    var SHARED_WORKSPACES = ['basic-writer', 'urdu-keyboard', 'rich-editor', 'text-cleaner'].concat(CAPTURE_WORKSPACES);
    var BIND_TIMEOUT_MS = 6000;
    var OCR_WATCH_ATTEMPTS = 240;
    var cleanupObserver = null;
    var cleanupTimer = null;

    function normalizeRoute(value) {
        if (Registry && typeof Registry.normalizeRoute === 'function') return Registry.normalizeRoute(value);
        var path = String(value || '/').split('?')[0].split('#')[0] || '/';
        if (path === '/index' || path === '/index.html') path = '/';
        if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
        if (path.endsWith('.html')) path = path.slice(0, -5);
        return path || '/';
    }

    function currentWorkspace() {
        if (!Registry || typeof Registry.findByRoute !== 'function') return null;
        return Registry.findByRoute(normalizeRoute(root && root.location && root.location.pathname || '/'));
    }

    function classifyWorkspace(workspace) {
        if (!workspace || workspace.status !== 'current') return 'unavailable';
        if (SHARED_WORKSPACES.indexOf(workspace.id) >= 0) return 'shared-recommendations';
        var next = Array.isArray(workspace.next) ? workspace.next : [];
        if (!next.length || next.every(function (edge) { return edge.type === 'embedded'; })) return 'embedded-endpoint';
        return 'native-continuation';
    }

    function targetDescriptor(edge) {
        return edge && edge.target && Registry && typeof Registry.get === 'function' ? Registry.get(edge.target) : null;
    }

    function targetRoute(edge) {
        var target = targetDescriptor(edge);
        return target && target.routes && target.routes[0] || null;
    }

    function buildModel(workspaceId, context) {
        context = context || {};
        var workspace = Registry && typeof Registry.get === 'function' ? Registry.get(workspaceId) : null;
        if (!workspace) return { workspace: null, mode: 'unavailable', visible: [], more: [], embedded: [] };
        var mode = classifyWorkspace(workspace);
        var hasContent = Boolean(context.hasContent);
        var navigating = (workspace.next || []).filter(function (edge) {
            if (edge.type === 'embedded' || !edge.target) return false;
            var target = targetDescriptor(edge);
            return Boolean(target && target.status === 'current' && targetRoute(edge));
        }).map(function (edge) {
            var target = targetDescriptor(edge);
            return {
                id: edge.id,
                type: edge.type,
                target: edge.target,
                href: targetRoute(edge),
                label: edge.label,
                technicalLabel: target.technicalLabel || target.label,
                payloadKind: edge.payloadKind || null
            };
        });
        if (!hasContent) navigating = [];
        var embedded = (workspace.next || []).filter(function (edge) { return edge.type === 'embedded'; });
        return {
            workspace: workspace,
            mode: mode,
            visible: navigating.slice(0, MAX_VISIBLE),
            more: navigating.slice(MAX_VISIBLE),
            embedded: embedded
        };
    }

    function modelSignature(workspaceId, model) {
        return [
            workspaceId,
            model.visible.map(function (action) { return action.id; }).join(','),
            model.more.map(function (action) { return action.id; }).join(','),
            model.visible.length ? 'visible' : 'hidden'
        ].join('|');
    }

    function textFromTinyMce() {
        var editor = root && root.tinymce && root.tinymce.get && root.tinymce.get('basic-example');
        return editor && editor.initialized ? String(editor.getContent({ format: 'text' }) || '').trim() : '';
    }

    function inPageProducesUnicode() {
        if (!root || !root.document) return false;
        var unicodeMode = root.document.querySelector('[data-inpage-mode="legacy-to-unicode"]');
        return Boolean(unicodeMode && unicodeMode.getAttribute('aria-pressed') === 'true');
    }

    function currentText(workspaceId) {
        if (!root || !root.document) return '';
        if (workspaceId === 'basic-writer') {
            var basic = root.document.getElementById('transliterateTextarea');
            return basic ? String(basic.value || '').trim() : '';
        }
        if (workspaceId === 'urdu-keyboard') {
            var keyboard = root.document.getElementById('write');
            return keyboard ? String(keyboard.value || '').trim() : '';
        }
        if (workspaceId === 'rich-editor') return textFromTinyMce();
        if (workspaceId === 'text-cleaner') {
            var cleaner = root.document.getElementById('cleanerResult');
            return cleaner ? String(cleaner.value || '').trim() : '';
        }
        if (workspaceId === 'image-to-urdu-text') {
            var ocr = root.document.getElementById('ocrResult');
            return ocr ? String(ocr.value || '').trim() : '';
        }
        if (workspaceId === 'voice-typing') {
            var voice = root.document.getElementById('voiceTranscript');
            return voice ? String(voice.value || '').trim() : '';
        }
        if (workspaceId === 'inpage-converter') {
            if (!inPageProducesUnicode()) return '';
            var inpage = root.document.getElementById('inpageResult');
            return inpage ? String(inpage.value || '').trim() : '';
        }
        return '';
    }

    function mountFor(workspaceId) {
        if (!root || !root.document) return null;
        if (workspaceId === 'basic-writer') return root.document.querySelector('.homepage-seo');
        if (workspaceId === 'urdu-keyboard') return root.document.querySelector('.keyboard-supporting-content');
        if (workspaceId === 'rich-editor') return root.document.querySelector('.rich-editor-page .col-12.col-md-9 > .card');
        if (workspaceId === 'text-cleaner' || CAPTURE_WORKSPACES.indexOf(workspaceId) >= 0) {
            return root.document.querySelector('[data-wu-ad-boundary="post-workspace"]');
        }
        return null;
    }

    function ensureStyles() {
        if (!root || !root.document || root.document.querySelector('link[data-wu-workspace-next-step-style]')) return;
        var link = root.document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/workspace-next-step.css';
        link.setAttribute('data-wu-workspace-next-step-style', '');
        root.document.head.appendChild(link);
    }

    function cleanupLegacyUi() {
        if (!root || !root.document) return;
        root.document.querySelectorAll('[data-cleaner-continuity-actions]').forEach(function (node) { node.remove(); });
        root.document.querySelectorAll('[data-wu-journey-panel]:not([data-wu-next-step-version="2"])').forEach(function (node) { node.remove(); });
    }

    function startCleanupGuard() {
        if (!root || !root.document || !root.MutationObserver || cleanupObserver) return;
        cleanupObserver = new root.MutationObserver(cleanupLegacyUi);
        cleanupObserver.observe(root.document.documentElement, { childList: true, subtree: true });
        cleanupTimer = root.setTimeout(function () {
            if (cleanupObserver) cleanupObserver.disconnect();
            cleanupObserver = null;
            cleanupTimer = null;
            cleanupLegacyUi();
        }, BIND_TIMEOUT_MS);
    }

    function actionMarkup(action, primary) {
        return '<a class="wu-continue-action' + (primary ? ' is-primary' : '') + '" href="' + action.href + '" data-wu-continuity-target="' + action.target + '" data-wu-next-step-action="' + action.id + '" data-wu-journey="' + action.id + '">' +
            '<strong>' + action.label + '</strong><small>' + action.technicalLabel + '</small></a>';
    }

    function panelMarkup(model) {
        var visible = model.visible.map(function (action, index) { return actionMarkup(action, index === 0); }).join('');
        var more = model.more.length ?
            '<details class="wu-continue-more"><summary>More options</summary><div class="wu-continue-more-actions">' +
            model.more.map(function (action) { return actionMarkup(action, false); }).join('') + '</div></details>' : '';
        return '<p class="wu-continue-eyebrow">Continue with…</p>' +
            '<h2 id="wu-next-step-title">What do you want to do next?</h2>' +
            '<p class="wu-continue-copy">Choose the next workspace for the Urdu text you just prepared.</p>' +
            '<div class="wu-continue-actions">' + visible + '</div>' + more;
    }

    function render() {
        if (!root || !root.document) return false;
        var workspace = currentWorkspace();
        if (!workspace) return false;
        var mode = classifyWorkspace(workspace);
        root.document.body && root.document.body.setAttribute('data-wu-continuation-mode', mode);
        if (mode !== 'shared-recommendations') return false;

        ensureStyles();
        cleanupLegacyUi();
        startCleanupGuard();
        var mount = mountFor(workspace.id);
        if (!mount || !mount.parentNode) return false;

        var hasContent = Boolean(currentText(workspace.id));
        var model = buildModel(workspace.id, { hasContent: hasContent });
        var signature = modelSignature(workspace.id, model);
        var panel = root.document.querySelector('[data-wu-next-step-version="2"]');
        if (!panel) {
            panel = root.document.createElement('section');
            panel.className = 'wu-continue-panel';
            panel.setAttribute('data-wu-journey-panel', '');
            panel.setAttribute('data-wu-next-step-version', '2');
            panel.setAttribute('aria-labelledby', 'wu-next-step-title');
            mount.parentNode.insertBefore(panel, mount);
        }
        panel.setAttribute('data-wu-source-workspace', workspace.id);
        if (panel.getAttribute('data-wu-next-step-signature') !== signature) {
            panel.innerHTML = panelMarkup(model);
            panel.setAttribute('data-wu-next-step-signature', signature);
        }
        panel.hidden = model.visible.length === 0;
        panel.setAttribute('aria-hidden', panel.hidden ? 'true' : 'false');
        return !panel.hidden;
    }

    function inputSelector(workspaceId) {
        var selectors = {
            'basic-writer': '#transliterateTextarea',
            'urdu-keyboard': '#write',
            'text-cleaner': '#cleanerResult',
            'image-to-urdu-text': '#ocrResult',
            'voice-typing': '#voiceTranscript',
            'inpage-converter': '#inpageResult'
        };
        return selectors[workspaceId] || null;
    }

    function watchOcrResult(attempt) {
        attempt = Number(attempt) || 0;
        render();
        if (currentText('image-to-urdu-text')) return;
        var status = root && root.document && root.document.querySelector('[data-ocr-status-pill]');
        var label = status ? String(status.textContent || '') : '';
        if (/failed|no text|cancelled/i.test(label)) return;
        if (attempt < OCR_WATCH_ATTEMPTS) root.setTimeout(function () { watchOcrResult(attempt + 1); }, 250);
    }

    function bindCaptureControls(workspaceId) {
        if (!root || !root.document) return;
        if (workspaceId === 'image-to-urdu-text') {
            var start = root.document.querySelector('[data-ocr-start]');
            var clear = root.document.querySelector('[data-ocr-clear]');
            if (start && start.getAttribute('data-wu-next-step-control-bound') !== 'true') {
                start.setAttribute('data-wu-next-step-control-bound', 'true');
                start.addEventListener('click', function () { root.setTimeout(function () { watchOcrResult(0); }, 0); });
            }
            if (clear && clear.getAttribute('data-wu-next-step-control-bound') !== 'true') {
                clear.setAttribute('data-wu-next-step-control-bound', 'true');
                clear.addEventListener('click', function () { root.setTimeout(render, 0); });
            }
        }
        if (workspaceId === 'inpage-converter') {
            root.document.querySelectorAll('[data-inpage-mode],[data-inpage-convert],[data-inpage-swap],[data-inpage-clear]').forEach(function (control) {
                if (control.getAttribute('data-wu-next-step-control-bound') === 'true') return;
                control.setAttribute('data-wu-next-step-control-bound', 'true');
                control.addEventListener('click', function () { root.setTimeout(render, 0); });
            });
        }
    }

    function bindStandardInput(workspaceId) {
        if (!root || !root.document) return;
        var selector = inputSelector(workspaceId);
        var input = selector && root.document.querySelector(selector);
        if (!input || input.getAttribute('data-wu-next-step-bound') === 'true') return;
        input.setAttribute('data-wu-next-step-bound', 'true');
        input.addEventListener('input', render);
        bindCaptureControls(workspaceId);
    }

    function bindRichEditor(attempt) {
        attempt = attempt || 0;
        var editor = root && root.tinymce && root.tinymce.get && root.tinymce.get('basic-example');
        if (editor && editor.initialized) {
            if (!editor.__writeUrduNextStepBound) {
                editor.__writeUrduNextStepBound = true;
                editor.on('input keyup SetContent Undo Redo', render);
            }
            render();
            return;
        }
        if (attempt < 40) root.setTimeout(function () { bindRichEditor(attempt + 1); }, 150);
    }

    function bind() {
        var workspace = currentWorkspace();
        if (!workspace) return;
        var mode = classifyWorkspace(workspace);
        if (root.document && root.document.body) root.document.body.setAttribute('data-wu-continuation-mode', mode);
        if (mode !== 'shared-recommendations') return;
        render();
        if (workspace.id === 'rich-editor') bindRichEditor(0);
        else bindStandardInput(workspace.id);
        root.addEventListener && root.addEventListener('pageshow', render);
        root.document.addEventListener('write-urdu:handoff-imported', function () { root.setTimeout(render, 0); });
    }

    if (root && root.document) {
        if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', bind);
        else bind();
    }

    return {
        MAX_VISIBLE: MAX_VISIBLE,
        CAPTURE_WORKSPACES: CAPTURE_WORKSPACES.slice(),
        SHARED_WORKSPACES: SHARED_WORKSPACES.slice(),
        normalizeRoute: normalizeRoute,
        classifyWorkspace: classifyWorkspace,
        buildModel: buildModel,
        modelSignature: modelSignature,
        currentWorkspace: currentWorkspace,
        currentText: currentText,
        inPageProducesUnicode: inPageProducesUnicode,
        render: render,
        bind: bind
    };
}));
