(function (root, document) {
    'use strict';

    var SOURCE = 'templates';

    function library() { return root.WriteUrduTemplateLibrary; }
    function handoff() { return root.WriteUrduWorkspaceHandoff; }
    function registry() { return root.WriteUrduWorkspaceRegistry; }

    function stagedEnvelope() {
        var runtime = handoff();
        return runtime && typeof runtime.peek === 'function' ? runtime.peek(SOURCE) : null;
    }

    function stagedText() {
        var envelope = stagedEnvelope();
        return envelope && envelope.payload && envelope.payload.kind === 'plain-text' && typeof envelope.payload.text === 'string'
            ? envelope.payload.text
            : '';
    }

    function notify(message, error) {
        var existing = document.querySelector('[data-template-boundary-status]');
        if (!existing) {
            existing = document.createElement('p');
            existing.className = 'template-results';
            existing.setAttribute('data-template-boundary-status', '');
            existing.setAttribute('role', 'status');
            var hero = document.querySelector('.template-library-hero > div:first-child');
            if (hero) hero.appendChild(existing);
        }
        if (!existing) return;
        existing.textContent = message || '';
        existing.classList.toggle('is-error', Boolean(error));
    }

    function showStagedTextNote() {
        var text = stagedText();
        var hero = document.querySelector('.template-library-hero > div:first-child');
        if (!hero) return;
        var note = hero.querySelector('[data-template-staged-text]');
        if (!text.trim()) {
            if (note) note.remove();
            return;
        }
        if (!note) {
            note = document.createElement('p');
            note.className = 'template-results';
            note.setAttribute('data-template-staged-text', '');
            hero.appendChild(note);
        }
        note.textContent = 'Your current Urdu is ready. Choose a template and the text will be applied in the design workspace.';
    }

    function ownerWorkspace(template) {
        var candidate = template && template.ownerWorkspace ? String(template.ownerWorkspace) : 'card-studio';
        var target = registry() && registry().get ? registry().get(candidate) : null;
        return target && target.status === 'current' && target.accepts.indexOf('template-seed') >= 0 ? candidate : 'card-studio';
    }

    function targetRoute(targetWorkspace) {
        var runtime = handoff();
        if (runtime && typeof runtime.destination === 'function') return runtime.destination(targetWorkspace);
        var target = registry() && registry().get ? registry().get(targetWorkspace) : null;
        return target && target.routes && target.routes[0] || null;
    }

    function boundedFallback(template, route) {
        if (!template || !route) return false;
        var url = route + '?template=' + encodeURIComponent(template.slug);
        root.location.href = url;
        return true;
    }

    function openTemplate(slug) {
        var lib = library();
        var template = lib && lib.getTemplateBySlug ? lib.getTemplateBySlug(slug) : null;
        if (!template) return false;

        var targetWorkspace = ownerWorkspace(template);
        var route = targetRoute(targetWorkspace);
        var text = stagedText();
        var runtime = handoff();

        if (!runtime || typeof runtime.transfer !== 'function') {
            if (!text.trim()) return boundedFallback(template, route || '/urdu-card-studio');
            notify('This browser could not prepare your template with the current text. Your writing is still safe on this page.', true);
            return false;
        }

        var result = runtime.transfer({
            sourceWorkspace: SOURCE,
            sourceRoute: '/urdu-templates',
            targetWorkspace: targetWorkspace,
            targetRoute: route,
            actionId: 'template-to-card',
            kind: 'template-seed',
            payload: { templateId: template.id, text: text },
            context: {
                templateId: template.id,
                sourceWorkspace: stagedEnvelope() && stagedEnvelope().source ? stagedEnvelope().source.workspace : null
            }
        });

        if (!result || !result.ok) {
            if (!text.trim()) return boundedFallback(template, route || '/urdu-card-studio');
            notify('This browser could not prepare the selected template. Your current writing has not been discarded.', true);
            return false;
        }

        if (typeof runtime.discard === 'function') runtime.discard(SOURCE);
        root.location.href = result.route || route;
        return true;
    }

    function enhanceButtons() {
        document.querySelectorAll('[data-template-open]').forEach(function (button) {
            button.textContent = 'Use this template';
            button.setAttribute('aria-label', 'Use this Urdu template');
        });
    }

    function onClick(event) {
        var control = event.target && event.target.closest && event.target.closest('[data-template-open]');
        if (!control) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        openTemplate(control.getAttribute('data-template-open'));
    }

    function bind() {
        var rootNode = document.querySelector('[data-template-library]');
        if (!rootNode || rootNode.getAttribute('data-template-boundary-bound') === 'true') return;
        rootNode.setAttribute('data-template-boundary-bound', 'true');
        rootNode.addEventListener('click', onClick, true);
        showStagedTextNote();
        enhanceButtons();
        document.addEventListener('write-urdu:templates-rendered', function () {
            enhanceButtons();
            showStagedTextNote();
        });
        var observer = root.MutationObserver ? new root.MutationObserver(enhanceButtons) : null;
        var grid = document.querySelector('[data-template-grid]');
        if (observer && grid) {
            observer.observe(grid, { childList: true, subtree: true });
            root.setTimeout(function () { observer.disconnect(); }, 5000);
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
    else bind();

    root.WriteUrduTemplateLibraryBoundary = {
        stagedText: stagedText,
        ownerWorkspace: ownerWorkspace,
        openTemplate: openTemplate,
        bind: bind
    };
}(window, document));
