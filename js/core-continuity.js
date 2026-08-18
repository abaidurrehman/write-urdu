(function (root, factory) {
    'use strict';
    var api = factory(root, root && root.WriteUrduWorkspaceRegistry, root && root.WriteUrduWorkspaceHandoff);
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduCoreContinuity = api;
}(typeof window !== 'undefined' ? window : null, function (root, Registry, Handoff) {
    'use strict';

    var DRAFT_PREFIX = 'write-urdu:draft:v1:';
    var HISTORY_PREFIX = 'write-urdu:history:v1:';
    var MAX_HISTORY = 5;
    var CORE_SOURCES = ['basic-writer', 'urdu-keyboard', 'rich-editor', 'text-cleaner'];
    var LEGACY_QR_KEY = 'writeUrdu.qrGenerator.incoming';

    function normalizeRoute(value) {
        if (Registry && typeof Registry.normalizeRoute === 'function') return Registry.normalizeRoute(value);
        var path = String(value || '/').split('?')[0].split('#')[0] || '/';
        if (path === '/index' || path === '/index.html') return '/';
        if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
        if (path.endsWith('.html')) path = path.slice(0, -5);
        return path || '/';
    }

    function currentRoute() {
        return normalizeRoute(root && root.location && root.location.pathname || '/');
    }

    function currentWorkspace() {
        return Registry && typeof Registry.findByRoute === 'function' ? Registry.findByRoute(currentRoute()) : null;
    }

    function workspaceId() {
        var workspace = currentWorkspace();
        return workspace && workspace.id || null;
    }

    function selectedTextFrom(element) {
        if (!element || typeof element.value !== 'string') return '';
        var start = typeof element.selectionStart === 'number' ? element.selectionStart : 0;
        var end = typeof element.selectionEnd === 'number' ? element.selectionEnd : 0;
        if (end > start) return element.value.slice(start, end).trim();
        return String(element.value || '').trim();
    }

    function currentPlainText() {
        var route = currentRoute();
        if (route === '/urdu-text-cleaner') {
            var cleaned = root.document && root.document.getElementById('cleanerResult');
            return cleaned ? String(cleaned.value || '').trim() : '';
        }

        var active = root.document && root.document.activeElement;
        if (active && /^(TEXTAREA|INPUT)$/.test(active.tagName || '') && typeof active.value === 'string') {
            var activeText = selectedTextFrom(active);
            if (activeText) return activeText;
        }

        var basic = root.document && root.document.getElementById('transliterateTextarea');
        if (basic && basic.value.trim()) return selectedTextFrom(basic);

        var keyboard = root.document && root.document.getElementById('write');
        if (keyboard && keyboard.value.trim()) return selectedTextFrom(keyboard);

        var editor = root.tinymce && root.tinymce.get && root.tinymce.get('basic-example');
        if (editor && editor.initialized) {
            var selected = editor.selection && editor.selection.getContent({ format: 'text' });
            if (selected && selected.trim()) return selected.trim();
            return String(editor.getContent({ format: 'text' }) || '').trim();
        }

        if (root.WriteUrduTools && root.WriteUrduTools.adapter && typeof root.WriteUrduTools.adapter.getText === 'function') {
            return String(root.WriteUrduTools.adapter.getText() || '').trim();
        }
        return '';
    }

    function currentRichContent() {
        var editor = root.tinymce && root.tinymce.get && root.tinymce.get('basic-example');
        if (editor && editor.initialized) return String(editor.getContent() || '');
        return currentPlainText();
    }

    function draftKindFor(workspace) {
        if (workspace === 'basic-writer') return 'basic';
        if (workspace === 'urdu-keyboard') return 'keyboard';
        if (workspace === 'rich-editor') return 'rich';
        return null;
    }

    function snapshotSignature(snapshot) {
        if (!snapshot) return '';
        return String(snapshot.text || '').replace(/\s+/g, ' ').trim() + '\u0000' + String(snapshot.content || '').replace(/\s+/g, ' ').trim();
    }

    function readHistory(kind) {
        try {
            var items = JSON.parse(root.localStorage.getItem(HISTORY_PREFIX + kind) || '[]');
            return Array.isArray(items) ? items : [];
        } catch (error) {
            return [];
        }
    }

    function preserveSnapshot(kind, snapshot) {
        if (!kind || !snapshot || !String(snapshot.text || snapshot.content || '').trim()) return false;
        try {
            var signature = snapshotSignature(snapshot);
            var items = readHistory(kind).filter(function (item) { return snapshotSignature(item) !== signature; });
            items.unshift(snapshot);
            root.localStorage.setItem(HISTORY_PREFIX + kind, JSON.stringify(items.slice(0, MAX_HISTORY)));
            root.localStorage.setItem(DRAFT_PREFIX + kind, JSON.stringify(snapshot));
            return true;
        } catch (error) {
            return false;
        }
    }

    function preserveSourceDraft(sourceWorkspace) {
        var kind = draftKindFor(sourceWorkspace);
        if (!kind) return false;
        var text = currentPlainText();
        if (!text) return false;
        var snapshot = {
            text: text,
            content: kind === 'rich' ? currentRichContent() : text,
            savedAt: Date.now()
        };
        if (root.WriteUrduTools && typeof root.WriteUrduTools.saveDraft === 'function') {
            try { root.WriteUrduTools.saveDraft(); } catch (error) { /* direct snapshot below is the safety layer */ }
        }
        return preserveSnapshot(kind, snapshot);
    }

    function preserveExistingDestinationDraft(targetWorkspace) {
        var kind = draftKindFor(targetWorkspace);
        if (!kind) return false;
        try {
            var existing = JSON.parse(root.localStorage.getItem(DRAFT_PREFIX + kind) || 'null');
            if (!existing || !String(existing.text || existing.content || '').trim()) return false;
            var signature = snapshotSignature(existing);
            var items = readHistory(kind).filter(function (item) { return snapshotSignature(item) !== signature; });
            items.unshift(existing);
            root.localStorage.setItem(HISTORY_PREFIX + kind, JSON.stringify(items.slice(0, MAX_HISTORY)));
            return true;
        } catch (error) {
            return false;
        }
    }

    function targetRoute(targetWorkspace) {
        if (Handoff && typeof Handoff.destination === 'function') return Handoff.destination(targetWorkspace);
        var target = Registry && typeof Registry.get === 'function' ? Registry.get(targetWorkspace) : null;
        return target && target.routes && target.routes[0] || null;
    }

    function actionId(sourceWorkspace, targetWorkspace) {
        var source = Registry && typeof Registry.get === 'function' ? Registry.get(sourceWorkspace) : null;
        if (!source || !Array.isArray(source.next)) return null;
        var edge = source.next.find(function (candidate) { return candidate.target === targetWorkspace; });
        return edge && edge.id || null;
    }

    function navigate(route) {
        if (!route) return false;
        if (root.location && root.location.protocol === 'file:') {
            var fileMap = {
                '/urdu-editor': 'urdu-editor.html',
                '/urdu-card-studio': 'urdu-card-studio.html',
                '/qr-code-generator': 'qr-code-generator.html',
                '/': 'index.html'
            };
            root.location.href = fileMap[route] || route;
            return true;
        }
        root.location.href = route;
        return true;
    }

    function notify(message, type) {
        if (root.WriteUrduUI && typeof root.WriteUrduUI.notify === 'function') {
            root.WriteUrduUI.notify(message, type || 'success');
            return;
        }
        var node = root.document && root.document.getElementById('appNotifications');
        if (!node) return;
        node.textContent = message;
        node.className = 'app-notifications is-visible ' + (type === 'error' ? 'is-error' : 'is-success');
    }

    function transfer(targetWorkspace) {
        var sourceWorkspace = workspaceId();
        if (!sourceWorkspace || CORE_SOURCES.indexOf(sourceWorkspace) < 0) return false;
        var route = targetRoute(targetWorkspace);
        if (!route) return false;
        var text = currentPlainText();

        preserveSourceDraft(sourceWorkspace);
        if (!text) return navigate(route);
        if (!Handoff || typeof Handoff.transfer !== 'function') {
            notify('This browser could not prepare the next step. Copy your text before leaving this page.', 'error');
            return false;
        }

        var result = Handoff.transfer({
            sourceWorkspace: sourceWorkspace,
            sourceRoute: currentRoute(),
            targetWorkspace: targetWorkspace,
            targetRoute: route,
            actionId: actionId(sourceWorkspace, targetWorkspace),
            kind: 'plain-text',
            payload: { text: text }
        });
        if (!result || !result.ok) {
            notify('This browser could not move your text safely. Copy it before opening the next tool.', 'error');
            return false;
        }
        return navigate(result.route || route);
    }

    function targetForControl(control) {
        if (!control) return null;
        var explicit = control.getAttribute('data-wu-continuity-target');
        if (explicit) return explicit;
        if (control.matches('[data-continue-rich], .home-actions-group-create a[href="/urdu-editor"]')) return 'rich-editor';
        if (control.matches('[data-create-card]')) return 'card-studio';
        if (control.matches('[data-create-qr]')) return 'qr-generator';
        if (control.matches('[data-cleaner-handoff]')) return 'basic-writer';
        return null;
    }

    function onClick(event) {
        var source = workspaceId();
        if (!source || CORE_SOURCES.indexOf(source) < 0) return;
        var control = event.target && event.target.closest && event.target.closest('[data-wu-continuity-target],[data-continue-rich],[data-create-card],[data-create-qr],[data-cleaner-handoff],.home-actions-group-create a[href="/urdu-editor"]');
        if (!control) return;
        var target = targetForControl(control);
        if (!target) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        transfer(target);
    }

    function installKeyboardQrAction() {
        if (currentRoute() !== '/urdu-keyboard' || !root.document) return;
        var actions = root.document.querySelector('.keyboard-actions');
        if (!actions || actions.querySelector('[data-create-qr]')) return;
        var button = root.document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-outline-secondary btn-sm';
        button.setAttribute('data-create-qr', '');
        button.setAttribute('data-wu-continuity-target', 'qr-generator');
        button.innerHTML = '<i class="fas fa-qrcode" aria-hidden="true"></i> Create QR Code';
        actions.appendChild(button);
    }

    function installCleanerActions() {
        if (currentRoute() !== '/urdu-text-cleaner' || !root.document) return;
        var handoff = root.document.querySelector('[data-cleaner-handoff]');
        if (!handoff || root.document.querySelector('[data-cleaner-continuity-actions]')) return;
        handoff.textContent = 'Continue writing';
        handoff.setAttribute('data-wu-continuity-target', 'basic-writer');

        var group = root.document.createElement('div');
        group.className = 'urdu-tool-actions';
        group.setAttribute('data-cleaner-continuity-actions', '');
        group.innerHTML =
            '<button class="urdu-tool-button" type="button" data-wu-continuity-target="rich-editor">Format as a document</button>' +
            '<button class="urdu-tool-button" type="button" data-wu-continuity-target="card-studio">Create a card</button>' +
            '<button class="urdu-tool-button" type="button" data-wu-continuity-target="qr-generator">Make a QR code</button>';
        handoff.closest('.urdu-tool-actions').insertAdjacentElement('afterend', group);

        function sync() {
            var disabled = !String(root.document.getElementById('cleanerResult').value || '').trim();
            group.querySelectorAll('button').forEach(function (button) { button.disabled = disabled; });
        }
        root.document.getElementById('cleanerResult').addEventListener('input', sync);
        sync();
    }

    function bridgeToLegacy(envelope, targetWorkspace) {
        if (!envelope || !envelope.payload || envelope.payload.kind !== 'plain-text' || typeof envelope.payload.text !== 'string') return false;
        if (targetWorkspace === 'qr-generator') {
            try {
                root.sessionStorage.setItem(LEGACY_QR_KEY, JSON.stringify({
                    version: 1,
                    type: 'text',
                    text: envelope.payload.text,
                    source: envelope.source && envelope.source.workspace || 'workspace',
                    createdAt: new Date(envelope.createdAt).toISOString()
                }));
                return true;
            } catch (error) {
                return false;
            }
        }
        if (Handoff && typeof Handoff.writeLegacyMirror === 'function') {
            return Handoff.writeLegacyMirror(envelope, root.sessionStorage);
        }
        return false;
    }

    function bridgeIncoming() {
        if (!Handoff || typeof Handoff.take !== 'function') return null;
        var target = workspaceId();
        if (['basic-writer', 'rich-editor', 'card-studio', 'qr-generator'].indexOf(target) < 0) return null;
        preserveExistingDestinationDraft(target);
        var envelope = Handoff.take(target);
        if (!envelope) return null;
        if (!bridgeToLegacy(envelope, target)) return null;
        try {
            root.document.documentElement.setAttribute('data-wu-handoff-bridged', target);
            root.document.documentElement.setAttribute('data-wu-handoff-source', envelope.source && envelope.source.workspace || 'unknown');
        } catch (error) { /* marker is diagnostic only */ }
        if (target === 'qr-generator') {
            root.setTimeout(function () { notify('Your imported Urdu text is ready as a QR code.', 'success'); }, 0);
        }
        return envelope;
    }

    function bootUi() {
        installKeyboardQrAction();
        installCleanerActions();
    }

    if (root && root.document) {
        root.document.addEventListener('click', onClick, true);
        bridgeIncoming();
        if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', bootUi);
        else bootUi();
    }

    return {
        currentRoute: currentRoute,
        workspaceId: workspaceId,
        currentPlainText: currentPlainText,
        preserveSourceDraft: preserveSourceDraft,
        preserveExistingDestinationDraft: preserveExistingDestinationDraft,
        targetForControl: targetForControl,
        transfer: transfer,
        bridgeIncoming: bridgeIncoming,
        bridgeToLegacy: bridgeToLegacy,
        installKeyboardQrAction: installKeyboardQrAction,
        installCleanerActions: installCleanerActions
    };
}));
