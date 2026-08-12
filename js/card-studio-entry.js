(function () {
    'use strict';

    var DESTINATIONS = {
        card: { route: '/urdu-card-studio', file: 'urdu-card-studio.html', key: 'writeUrdu.cardStudio.incoming' },
        stylish: { route: '/stylish-urdu-text-generator', file: 'stylish-urdu-text-generator.html', key: 'writeUrdu.stylishText.incoming.v1' },
        nameArt: { route: '/urdu-name-art-maker', file: 'urdu-name-art-maker.html', key: 'writeUrdu.nameArt.handoff.v1' }
    };

    function normalizePath() {
        var path = String(window.location && window.location.pathname || '/').split('?')[0].split('#')[0] || '/';
        if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
        if (path === '/index.html') return '/';
        if (path.endsWith('.html')) path = path.slice(0, -5);
        return path || '/';
    }

    function sourceName() {
        var path = normalizePath();
        if (path === '/urdu-editor') return 'rich-editor';
        if (path === '/urdu-keyboard') return 'urdu-keyboard';
        return 'basic-editor';
    }

    function plainTextFromEditor() {
        var basic = document.getElementById('transliterateTextarea');
        if (basic) {
            var start = basic.selectionStart || 0;
            var end = basic.selectionEnd || 0;
            return (start !== end ? basic.value.slice(start, end) : basic.value).trim();
        }
        if (window.tinymce && tinymce.activeEditor) {
            var editor = tinymce.activeEditor;
            var selected = editor.selection && editor.selection.getContent({ format: 'text' });
            return String((selected && selected.trim()) || editor.getContent({ format: 'text' }) || '').trim();
        }
        var write = document.getElementById('write');
        return write ? String(write.value || '').trim() : '';
    }

    function dispatchJourney(destination, text, source) {
        document.dispatchEvent(new CustomEvent('write-urdu:journey', {
            detail: {
                source: source || sourceName(),
                destination: destination,
                hasText: Boolean(String(text || '').trim())
            }
        }));
    }

    function storeHandoff(destination, text, source) {
        var config = DESTINATIONS[destination];
        if (!config) return;
        var payload = {
            version: 1,
            text: String(text || '').trim(),
            source: source || sourceName(),
            createdAt: new Date().toISOString()
        };
        try {
            sessionStorage.setItem(config.key, JSON.stringify(payload));
        } catch (error) { /* Private browsing: destination can still open blank. */ }
    }

    function destinationUrl(destination) {
        var config = DESTINATIONS[destination];
        if (!config) return '/';
        return window.location.protocol === 'file:' ? config.file : config.route;
    }

    function openDestination(destination, trigger) {
        var text = plainTextFromEditor();
        var source = trigger && trigger.getAttribute('data-editor-source') || sourceName();
        storeHandoff(destination, text, source);
        dispatchJourney(destination, text, source);
        window.location.href = destinationUrl(destination);
    }

    function ensureStylesheet() {
        if (document.querySelector('link[href="css/journey-handoffs.css"]')) return;
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/journey-handoffs.css';
        document.head.appendChild(link);
    }

    function journeyMount(path) {
        if (path === '/') return document.querySelector('.homepage-seo');
        if (path === '/urdu-editor') return document.querySelector('.fb-comments');
        if (path === '/urdu-keyboard') return document.querySelector('.keyboard-supporting-content');
        return null;
    }

    function renderJourneyPanel() {
        var path = normalizePath();
        if (!['/', '/urdu-editor', '/urdu-keyboard'].includes(path) || document.querySelector('[data-wu-journey-panel]')) return;
        var mount = journeyMount(path);
        if (!mount || !mount.parentNode) return;
        ensureStylesheet();

        var section = document.createElement('section');
        section.className = 'wu-next-journey';
        section.setAttribute('data-wu-journey-panel', '');
        section.setAttribute('aria-labelledby', 'wu-next-journey-title');
        section.innerHTML =
            '<p class="wu-next-journey-eyebrow">Your next step</p>' +
            '<h2 id="wu-next-journey-title">Use the Urdu you just wrote</h2>' +
            '<p class="wu-next-journey-copy">Keep the current text and move it into the tool that matches what you want to make next. The handoff stays in this browser.</p>' +
            '<div class="wu-next-journey-actions">' +
                '<button type="button" class="wu-next-journey-action is-primary" data-create-card data-editor-source="' + sourceName() + '" data-wu-journey="write-to-card"><strong>Create an Urdu card</strong><small>Turn the text into a quote, poetry or announcement image.</small></button>' +
                '<button type="button" class="wu-next-journey-action" data-create-stylish data-editor-source="' + sourceName() + '" data-wu-journey="write-to-stylish"><strong>Try Stylish Urdu Text</strong><small>Generate copyable Unicode-decorated versions of the text.</small></button>' +
                '<button type="button" class="wu-next-journey-action" data-create-name-art data-editor-source="' + sourceName() + '" data-wu-journey="write-to-name-art"><strong>Make Urdu Name Art</strong><small>Render the text with real Urdu fonts as an image.</small></button>' +
                '<a class="wu-next-journey-action" href="/urdu-templates" data-wu-journey="write-to-templates"><strong>Browse Urdu templates</strong><small>Choose a ready-made visual starting point for Card Studio.</small></a>' +
            '</div>';
        mount.parentNode.insertBefore(section, mount);
    }

    function bindJourneyLinks() {
        document.querySelectorAll('[data-wu-journey]').forEach(function (element) {
            if (element.dataset.wuJourneyBound) return;
            element.dataset.wuJourneyBound = 'true';
            if (element.matches('[data-create-card],[data-create-stylish],[data-create-name-art]')) return;
            element.addEventListener('click', function () {
                dispatchJourney(element.getAttribute('data-wu-journey'), '', sourceName());
            });
        });
    }

    function bind() {
        renderJourneyPanel();
        document.querySelectorAll('[data-create-card]').forEach(function (button) {
            if (button.dataset.createCardBound) return;
            button.dataset.createCardBound = 'true';
            button.addEventListener('click', function () { openDestination('card', button); });
        });
        document.querySelectorAll('[data-create-stylish]').forEach(function (button) {
            if (button.dataset.createStylishBound) return;
            button.dataset.createStylishBound = 'true';
            button.addEventListener('click', function () { openDestination('stylish', button); });
        });
        document.querySelectorAll('[data-create-name-art]').forEach(function (button) {
            if (button.dataset.createNameArtBound) return;
            button.dataset.createNameArtBound = 'true';
            button.addEventListener('click', function () { openDestination('nameArt', button); });
        });
        bindJourneyLinks();
    }

    window.WriteUrduJourneyHandoffs = {
        getText: plainTextFromEditor,
        open: openDestination,
        store: storeHandoff,
        render: renderJourneyPanel,
        bind: bind
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
}());
