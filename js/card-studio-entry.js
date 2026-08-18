(function () {
    'use strict';

    var HANDOFF_TTL = 30 * 60 * 1000;
    var RICH_DRAFT_KEY = 'write-urdu:draft:v1:rich';
    var RICH_HISTORY_KEY = 'write-urdu:history:v1:rich';
    var MAX_RICH_HISTORY = 5;
    var DESTINATIONS = {
        rich: { route: '/urdu-editor', file: 'urdu-editor.html', key: 'writeUrdu.richEditor.incoming.v1' },
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

    function readOneTimeHandoff(destination) {
        var config = DESTINATIONS[destination];
        if (!config) return null;
        var incoming = null;
        try {
            incoming = JSON.parse(sessionStorage.getItem(config.key) || 'null');
            sessionStorage.removeItem(config.key);
        } catch (error) {
            incoming = null;
        }
        var created = incoming && Date.parse(incoming.createdAt || '');
        if (!incoming || incoming.version !== 1 || typeof incoming.text !== 'string' || !incoming.text.trim()) return null;
        if (!created || Date.now() - created > HANDOFF_TTL) return null;
        return incoming;
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

    function snapshotSignature(snapshot) {
        if (!snapshot) return '';
        return String(snapshot.text || '').replace(/\s+/g, ' ').trim() + '\u0000' + String(snapshot.content || '').replace(/\s+/g, ' ').trim();
    }

    function readRichHistory() {
        try {
            var items = JSON.parse(localStorage.getItem(RICH_HISTORY_KEY) || '[]');
            return Array.isArray(items) ? items : [];
        } catch (error) {
            return [];
        }
    }

    function preserveRichSnapshot(snapshot) {
        if (!snapshot || !String(snapshot.text || snapshot.content || '').trim()) return;
        try {
            var signature = snapshotSignature(snapshot);
            var items = readRichHistory().filter(function (item) { return snapshotSignature(item) !== signature; });
            items.unshift({
                content: String(snapshot.content || ''),
                text: String(snapshot.text || ''),
                savedAt: Number(snapshot.savedAt) || Date.now(),
                title: snapshot.title || undefined
            });
            localStorage.setItem(RICH_HISTORY_KEY, JSON.stringify(items.slice(0, MAX_RICH_HISTORY)));
        } catch (error) { /* Local storage can be unavailable. */ }
    }

    function plainTextToHtml(text) {
        var holder = document.createElement('div');
        holder.textContent = String(text || '');
        return '<p>' + holder.innerHTML.replace(/\r?\n/g, '<br>') + '</p>';
    }

    function stageRichDraft(incoming, html) {
        try {
            var existing = JSON.parse(localStorage.getItem(RICH_DRAFT_KEY) || 'null');
            if (existing && snapshotSignature(existing) !== snapshotSignature({ text: incoming.text, content: html })) preserveRichSnapshot(existing);
            localStorage.setItem(RICH_DRAFT_KEY, JSON.stringify({
                content: html,
                text: incoming.text.trim(),
                savedAt: Date.now()
            }));
        } catch (error) { /* The handoff still works when local storage is unavailable. */ }
    }

    function waitForRichEditor(incoming, html, attempt) {
        attempt = attempt || 0;
        var editor = window.tinymce && window.tinymce.get && window.tinymce.get('basic-example');
        if (editor && editor.initialized) {
            var currentText = String(editor.getContent({ format: 'text' }) || '').trim();
            if (currentText && currentText !== incoming.text.trim()) {
                preserveRichSnapshot({ content: editor.getContent() || '', text: currentText, savedAt: Date.now() });
            }
            editor.setContent(html);
            document.body.setAttribute('data-rich-handoff-imported', 'true');
            if (window.WriteUrduUI && typeof window.WriteUrduUI.notify === 'function') {
                window.WriteUrduUI.notify('Your Urdu text is ready to format.', 'success');
            }
            editor.focus();
            return;
        }
        if (attempt >= 120) return;
        window.setTimeout(function () { waitForRichEditor(incoming, html, attempt + 1); }, 50);
    }

    function consumeRichHandoff() {
        if (normalizePath() !== '/urdu-editor') return;
        var incoming = readOneTimeHandoff('rich');
        if (!incoming) return;
        var html = plainTextToHtml(incoming.text);
        stageRichDraft(incoming, html);
        waitForRichEditor(incoming, html, 0);
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

        var richAction = path === '/urdu-editor' ? '' :
            '<button type="button" class="wu-next-journey-action" data-continue-rich data-editor-source="' + sourceName() + '" data-wu-journey="write-to-rich"><strong>Continue in Rich Editor</strong><small>Format an assignment or document, then export Word or PDF.</small></button>';
        var section = document.createElement('section');
        section.className = 'wu-next-journey';
        section.setAttribute('data-wu-journey-panel', '');
        section.setAttribute('aria-labelledby', 'wu-next-journey-title');
        section.innerHTML =
            '<p class="wu-next-journey-eyebrow">Your next step</p>' +
            '<h2 id="wu-next-journey-title">Use the Urdu you just wrote</h2>' +
            '<p class="wu-next-journey-copy">Move the current text into the tool that matches what you want to do next. The handoff stays in this browser; a public link is created only when you explicitly choose Publish &amp; Share.</p>' +
            '<div class="wu-next-journey-actions">' +
                '<button type="button" class="wu-next-journey-action is-primary is-share" data-create-card data-editor-source="' + sourceName() + '" data-wu-journey="write-to-card"><strong>Create &amp; share this Urdu</strong><small>Open the text in Card Studio, make it visual, then publish a beautiful Write-Urdu.com link.</small></button>' +
                richAction +
                '<button type="button" class="wu-next-journey-action" data-create-stylish data-editor-source="' + sourceName() + '" data-wu-journey="write-to-stylish"><strong>Try Stylish Urdu Text</strong><small>Generate copyable Unicode-decorated versions of the text.</small></button>' +
                '<button type="button" class="wu-next-journey-action" data-create-name-art data-editor-source="' + sourceName() + '" data-wu-journey="write-to-name-art"><strong>Make Urdu Name Art</strong><small>Render the text with real Urdu fonts as an image.</small></button>' +
                '<a class="wu-next-journey-action" href="/urdu-templates" data-wu-journey="write-to-templates"><strong>Browse Urdu templates</strong><small>Choose a ready-made visual starting point for Card Studio.</small></a>' +
            '</div>';
        mount.parentNode.insertBefore(section, mount);
    }

    function setActionLabel(control, label, iconClass) {
        if (!control) return;
        control.innerHTML = (iconClass ? '<i class="' + iconClass + '" aria-hidden="true"></i> ' : '') + label;
    }

    function createPrimaryShareButton(path) {
        var existing = document.querySelector('[data-wu-authoring-share-primary]');
        if (existing) return existing;

        var mount = path === '/' ? document.querySelector('.home-actions') : document.querySelector('.tool-actions');
        if (!mount) return null;
        var before = null;
        if (path === '/') before = mount.querySelector('.home-actions-group-export');
        else if (path === '/urdu-editor') before = mount.querySelector('.home-actions-group-export');
        else if (path === '/urdu-keyboard') before = mount.querySelector('[data-write-urdu-share]');

        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-success btn-sm wu-authoring-share-primary';
        button.setAttribute('data-wu-authoring-share-primary', '');
        button.setAttribute('data-create-card', '');
        button.setAttribute('data-editor-source', sourceName());
        button.title = 'Create a visual from this Urdu, then publish a Write-Urdu.com share link';
        setActionLabel(button, 'Create & Share', 'fas fa-share-square');
        mount.insertBefore(button, before || mount.firstElementChild || null);
        return button;
    }

    function promoteAuthoringShareAction() {
        var path = normalizePath();
        if (!['/', '/urdu-editor', '/urdu-keyboard'].includes(path)) return;
        ensureStylesheet();
        createPrimaryShareButton(path);
        document.querySelectorAll('[data-write-urdu-share]').forEach(function (button) {
            if (button.dataset.wuShareTextOnlyLabelled) return;
            button.dataset.wuShareTextOnlyLabelled = 'true';
            button.title = 'Share the Urdu text only without creating a public Write Urdu link';
            setActionLabel(button, 'Share text only', 'fas fa-share-alt');
        });
    }

    function bindRichEditorActions() {
        if (normalizePath() === '/urdu-editor') return;
        document.querySelectorAll('[data-continue-rich], .home-actions-group-create a[href="/urdu-editor"]').forEach(function (control) {
            if (control.dataset.continueRichBound) return;
            control.dataset.continueRichBound = 'true';
            control.addEventListener('click', function (event) {
                event.preventDefault();
                openDestination('rich', control);
            });
        });
    }

    function bindJourneyLinks() {
        document.querySelectorAll('[data-wu-journey]').forEach(function (element) {
            if (element.dataset.wuJourneyBound) return;
            element.dataset.wuJourneyBound = 'true';
            if (element.matches('[data-continue-rich],[data-create-card],[data-create-stylish],[data-create-name-art]')) return;
            element.addEventListener('click', function () {
                dispatchJourney(element.getAttribute('data-wu-journey'), '', sourceName());
            });
        });
    }

    function bind() {
        consumeRichHandoff();
        renderJourneyPanel();
        promoteAuthoringShareAction();
        bindRichEditorActions();
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
