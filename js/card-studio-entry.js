(function () {
    'use strict';

    function ensureCoreContinuityForRich() {
        var path = window.WriteUrduLocaleRoute ? window.WriteUrduLocaleRoute.productPath(window.location && window.location.pathname || '/') : String(window.location && window.location.pathname || '/').split('?')[0].split('#')[0] || '/';
        if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
        if (path.endsWith('.html')) path = path.slice(0, -5);
        if (path !== '/urdu-editor' || window.WriteUrduCoreContinuity) return;

        function load(src, ready, next) {
            if (ready()) { next(); return; }
            var existing = document.querySelector('script[src="' + src + '"]');
            if (existing) { existing.addEventListener('load', next, { once: true }); return; }
            var script = document.createElement('script');
            script.src = src;
            script.async = false;
            script.addEventListener('load', next, { once: true });
            document.head.appendChild(script);
        }

        load('js/workspace-journey-registry.js', function () { return Boolean(window.WriteUrduWorkspaceRegistry); }, function () {
            load('js/workspace-handoff.js', function () { return Boolean(window.WriteUrduWorkspaceHandoff); }, function () {
                load('js/core-continuity.js', function () { return Boolean(window.WriteUrduCoreContinuity); }, function () {});
            });
        });
    }

    ensureCoreContinuityForRich();

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

    function track(name, detail) {
        if (window.WriteUrduTelemetry && window.WriteUrduTelemetry.track) window.WriteUrduTelemetry.track(name, detail || {});
    }

    function normalizePath() {
        var path = window.WriteUrduLocaleRoute ? window.WriteUrduLocaleRoute.productPath(window.location && window.location.pathname || '/') : String(window.location && window.location.pathname || '/').split('?')[0].split('#')[0] || '/';
        if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
        if (path === '/index.html') return '/';
        if (path.endsWith('.html')) path = path.slice(0, -5);
        return path || '/';
    }

    function isUrduLocale() {
        if (window.WriteUrduLocaleRoute && typeof window.WriteUrduLocaleRoute.locale === 'function') {
            return window.WriteUrduLocaleRoute.locale(window.location && window.location.pathname || '/') === 'ur';
        }
        return /^\/urdu(?:\/|$)/.test(String(window.location && window.location.pathname || '/'));
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
        track('continuation_stored', { target_route: config.route });
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
                var replace = window.confirm(isUrduLocale()
                    ? 'اپنا موجودہ رچ ایڈیٹر مسودہ بیسک رائٹر کے متن سے تبدیل کریں؟ آپ کا موجودہ مسودہ پہلے مقامی ہسٹری میں محفوظ کر دیا گیا ہے۔'
                    : 'Replace your current Rich Editor draft with the text from Basic Writer? Your current draft is already saved to local history.');
                if (!replace) return;
            }
            editor.setContent(html);
            track('continuation_payload_restored', { target_route: '/urdu-editor' });
            document.body.setAttribute('data-rich-handoff-imported', 'true');
            if (window.WriteUrduUI && typeof window.WriteUrduUI.notify === 'function') {
                window.WriteUrduUI.notify(isUrduLocale() ? 'آپ کا اردو متن فارمیٹنگ کے لیے تیار ہے۔' : 'Your Urdu text is ready to format.', 'success');
            }
            editor.focus();
            return;
        }
        if (attempt >= 120) {
            if (window.WriteUrduUI && typeof window.WriteUrduUI.notify === 'function') {
                window.WriteUrduUI.notify(isUrduLocale()
                    ? 'رچ ایڈیٹر لوڈ ہونے میں وقت لگ رہا ہے۔ آپ کا متن بطور ڈرافٹ محفوظ ہے۔'
                    : 'Rich Editor is taking longer than expected to load. Your text is safely saved as a draft.', 'info');
            }
            return;
        }
        window.setTimeout(function () { waitForRichEditor(incoming, html, attempt + 1); }, 50);
    }

    function consumeRichHandoff() {
        if (normalizePath() !== '/urdu-editor') return;
        var incoming = readOneTimeHandoff('rich');
        if (!incoming) return;
        track('continuation_destination_ready', { target_route: '/urdu-editor' });
        var html = plainTextToHtml(incoming.text);
        stageRichDraft(incoming, html);
        waitForRichEditor(incoming, html, 0);
    }

    function ensureStylesheet() {
        if (document.querySelector('link[href="css/journey-handoffs.css"]')) return;
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/journey-handoffs.css';
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
                '<button type="button" class="wu-next-journey-action" data-create-stylish data-editor-source="' + sourceName() + '" data-wu-journey="write-to-stylish"><strong>Try Stylish Urdu Text</strong><small>Create decorated versions you can copy and paste.</small></button>' +
                '<button type="button" class="wu-next-journey-action" data-create-name-art data-editor-source="' + sourceName() + '" data-wu-journey="write-to-name-art"><strong>Make Urdu Name Art</strong><small>Render the text with real Urdu fonts as an image.</small></button>' +
                '<a class="wu-next-journey-action" href="/urdu-templates" data-wu-journey="write-to-templates"><strong>Browse Urdu templates</strong><small>Choose a ready-made visual starting point for Card Studio.</small></a>' +
            '</div>';
        if (isUrduLocale()) {
            var eyebrow = section.querySelector('.wu-next-journey-eyebrow');
            var title = section.querySelector('#wu-next-journey-title');
            var copy = section.querySelector('.wu-next-journey-copy');
            if (eyebrow) eyebrow.textContent = 'اگلا مرحلہ';
            if (title) title.textContent = 'اب اپنی لکھی ہوئی اردو استعمال کریں';
            if (copy) copy.textContent = 'اپنے موجودہ متن کو اگلے کام کے مطابق کسی دوسرے ٹول میں لے جائیں۔ متن اسی براؤزر میں منتقل ہوتا ہے؛ عوامی لنک صرف اس وقت بنتا ہے جب آپ خود شیئر کرنے کا انتخاب کریں۔';
            var labels = {
                'write-to-card': ['اس اردو کو کارڈ بنا کر شیئر کریں', 'متن کو کارڈ اسٹوڈیو میں کھولیں، خوبصورت بنائیں اور پھر Write-Urdu.com کا لنک شیئر کریں۔'],
                'write-to-rich': ['رچ ایڈیٹر میں جاری رکھیں', 'دستاویز کو فارمیٹ کریں، پھر Word یا PDF میں محفوظ کریں۔'],
                'write-to-stylish': ['اسٹائلش اردو متن آزمائیں', 'اسی متن کی کاپی کرنے کے قابل مختلف انداز بنائیں۔'],
                'write-to-name-art': ['اردو نام آرٹ بنائیں', 'متن کو اصلی اردو فونٹس کے ساتھ تصویر کی صورت میں بنائیں۔'],
                'write-to-templates': ['اردو ٹیمپلیٹس دیکھیں', 'کارڈ اسٹوڈیو کے لیے تیار ڈیزائن سے آغاز کریں۔']
            };
            Object.keys(labels).forEach(function (journey) {
                var action = section.querySelector('[data-wu-journey="' + journey + '"]');
                if (!action) return;
                var strong = action.querySelector('strong');
                var small = action.querySelector('small');
                if (strong) strong.textContent = labels[journey][0];
                if (small) small.textContent = labels[journey][1];
            });
        }
        mount.parentNode.insertBefore(section, mount);
    }

    function setActionLabel(control, label, iconClass) {
        if (!control) return;
        control.innerHTML = (iconClass ? '<i class="' + iconClass + '" aria-hidden="true"></i> ' : '') + label;
    }

    function createHeaderShareButton(attempt) {
        var existing = document.querySelector('[data-wu-authoring-share-primary]');
        if (existing) return existing;
        var header = document.querySelector('.wu-header-inner');
        if (!header) {
            if ((attempt || 0) < 20) window.setTimeout(function () { createHeaderShareButton((attempt || 0) + 1); bindCreateCardActions(); }, 50);
            return null;
        }
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'wu-authoring-share-primary';
        button.setAttribute('data-wu-authoring-share-primary', '');
        button.setAttribute('data-create-card', '');
        button.setAttribute('data-editor-source', sourceName());
        button.setAttribute('aria-label', 'Create and share this Urdu');
        button.title = 'Create a visual from this Urdu, then publish a Write-Urdu.com share link';
        button.innerHTML = '<span class="wu-authoring-share-icon" aria-hidden="true">↗</span><span class="wu-authoring-share-label">Create &amp; Share</span><span class="wu-authoring-share-label-mobile">Share</span>';
        if (isUrduLocale()) {
            button.setAttribute('aria-label', 'اس اردو سے تصویر بنائیں اور شیئر کریں');
            button.title = 'اس اردو سے تصویر بنائیں اور Write-Urdu.com کا لنک شیئر کریں';
            button.innerHTML = '<span class="wu-authoring-share-icon" aria-hidden="true">↗</span><span class="wu-authoring-share-label">بنائیں اور شیئر کریں</span><span class="wu-authoring-share-label-mobile">شیئر کریں</span>';
        }
        var language = header.querySelector('.wu-language-toggle');
        header.insertBefore(button, language || null);
        return button;
    }

    function bindCreateCardActions() {
        document.querySelectorAll('[data-create-card]').forEach(function (button) {
            if (button.dataset.createCardBound) return;
            button.dataset.createCardBound = 'true';
            button.addEventListener('click', function () { openDestination('card', button); });
        });
    }

    function promoteAuthoringShareAction() {
        var path = normalizePath();
        if (!['/', '/urdu-editor', '/urdu-keyboard'].includes(path)) return;
        ensureStylesheet();
        createHeaderShareButton(0);
        document.querySelectorAll('[data-write-urdu-share]').forEach(function (button) {
            if (button.dataset.wuShareTextOnlyLabelled) return;
            button.dataset.wuShareTextOnlyLabelled = 'true';
            button.removeAttribute('data-wu-i18n-control');
            button.title = 'Share the Urdu text only without creating a public Write Urdu link';
            setActionLabel(button, 'Share text only', 'fas fa-share-alt');
            if (isUrduLocale()) {
                button.title = 'عوامی Write Urdu لنک بنائے بغیر صرف اردو متن شیئر کریں';
                setActionLabel(button, 'صرف متن شیئر کریں', 'fas fa-share-alt');
            }
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
        bindCreateCardActions();
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
