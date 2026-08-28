(function (root, factory) {
    'use strict';
    var api = factory(root);
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduCoreWorkspaceConvergence = api;
}(typeof window !== 'undefined' ? window : null, function (root) {
    'use strict';

    var CORE_ROUTES = ['/', '/urdu-keyboard', '/urdu-editor'];
    var LEGACY_TRUST_SELECTORS = ['#fb-root', '.fb-like', '.twitter-follow-button', '.fb-comments'];
    var PREMATURE_CORE_SELECTORS = ['[data-wu-authoring-share-primary]'];
    var CLEANUP_GUARD_MS = 6000;
    var BASIC_COMMAND_TOOLBAR_SRC = '/js/basic-writer-command-toolbar.js';
    var cleanupObserver = null;
    var cleanupTimer = null;
    var USER_FIRST_LABELS = {
        cleaner: 'Fix broken or badly formatted Urdu text',
        image: 'Turn an Urdu screenshot or photo into editable text'
    };
    var BASIC_COMMAND_COPY = {
        en: {
            toolbar: 'Writing and document actions',
            primary: 'Share and copy',
            outputs: 'Document actions',
            mode: 'Input mode',
            share: 'Share',
            copy: 'Copy',
            more: 'More',
            clear: 'Clear',
            preview: 'Preview',
            print: 'Print',
            fileOptions: 'File options',
            editorOptions: 'Editor options',
            textFile: 'Text file'
        },
        ur: {
            toolbar: 'تحریر اور دستاویز کی کارروائیاں',
            primary: 'شیئر اور کاپی',
            outputs: 'دستاویز کی کارروائیاں',
            mode: 'لکھنے کا طریقہ',
            share: 'شیئر کریں',
            copy: 'متن کاپی کریں',
            more: 'مزید',
            clear: 'صاف کریں',
            preview: 'پیش منظر',
            print: 'پرنٹ',
            fileOptions: 'فائل کے اختیارات',
            editorOptions: 'ایڈیٹر کے اختیارات',
            textFile: 'متنی فائل'
        }
    };

    function normalizeRoute(value) {
        if (root && root.WriteUrduLocaleRoute && typeof root.WriteUrduLocaleRoute.productPath === 'function') return root.WriteUrduLocaleRoute.productPath(value || '/');
        var path = String(value || '/').split('?')[0].split('#')[0] || '/';
        if (path === '/index' || path === '/index.html') return '/';
        if (/\.html$/i.test(path)) path = path.slice(0, -5);
        if (path.length > 1) path = path.replace(/\/+$/, '');
        return path || '/';
    }

    function currentRoute() {
        return normalizeRoute(root && root.location && root.location.pathname || '/');
    }

    function coreWorkspace(route) {
        route = normalizeRoute(route);
        if (route === '/') return 'basic';
        if (route === '/urdu-keyboard') return 'keyboard';
        if (route === '/urdu-editor') return 'rich';
        return null;
    }

    function ensureStyles() {
        if (!root || !root.document || root.document.querySelector('link[data-wu-core-convergence-style]')) return;
        var link = root.document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/core-workspace-convergence.css';
        link.setAttribute('data-wu-core-convergence-style', '');
        root.document.head.appendChild(link);
    }

    function removeSelectors(selectors) {
        if (!root || !root.document) return 0;
        var removed = 0;
        selectors.forEach(function (selector) {
            root.document.querySelectorAll(selector).forEach(function (node) {
                node.remove();
                removed += 1;
            });
        });
        return removed;
    }

    function removeLegacyTrustChrome() {
        return removeSelectors(LEGACY_TRUST_SELECTORS);
    }

    function removePrematureCoreChrome() {
        if (!coreWorkspace(currentRoute())) return 0;
        return removeSelectors(PREMATURE_CORE_SELECTORS);
    }

    function cleanupCoreChrome() {
        removeLegacyTrustChrome();
        removePrematureCoreChrome();
    }

    function startCleanupGuard() {
        if (!root || !root.document || !root.MutationObserver || cleanupObserver || !coreWorkspace(currentRoute())) return;
        cleanupObserver = new root.MutationObserver(cleanupCoreChrome);
        cleanupObserver.observe(root.document.documentElement, { childList: true, subtree: true });
        cleanupTimer = root.setTimeout(function () {
            if (cleanupObserver) cleanupObserver.disconnect();
            cleanupObserver = null;
            cleanupTimer = null;
            cleanupCoreChrome();
        }, CLEANUP_GUARD_MS);
    }

    function setOutcomeLabel(href, label, technicalLabel) {
        if (!root || !root.document) return false;
        var changed = false;
        root.document.querySelectorAll('.wu-outcome-menu a[href="' + href + '"]').forEach(function (link) {
            var strong = link.querySelector('strong');
            var small = link.querySelector('small');
            if (strong && strong.textContent !== label) {
                strong.textContent = label;
                changed = true;
            }
            if (small && technicalLabel && small.textContent !== technicalLabel) {
                small.textContent = technicalLabel;
                changed = true;
            }
        });
        return changed;
    }

    function enhanceGlobalLabels() {
        setOutcomeLabel('/urdu-text-cleaner', USER_FIRST_LABELS.cleaner, 'Urdu Text Cleaner');
        setOutcomeLabel('/urdu-ocr', USER_FIRST_LABELS.image, 'Image to Urdu Text');
    }

    function basicLocale() {
        if (root && root.WriteUrduLocale && typeof root.WriteUrduLocale.get === 'function') return root.WriteUrduLocale.get() === 'ur' ? 'ur' : 'en';
        return root && root.document && /^ur\b/i.test(root.document.documentElement.lang || '') ? 'ur' : 'en';
    }

    function setCommandLabel(actions, selector, label) {
        var control = actions && actions.querySelector(selector);
        if (!control) return false;
        var text = control.querySelector('span');
        if (text) text.textContent = label;
        else control.textContent = label;
        control.setAttribute('aria-label', label);
        return true;
    }

    function localizeBasicCommandToolbar() {
        if (!root || !root.document || currentRoute() !== '/') return false;
        var actions = root.document.querySelector('.home-actions[data-wu-basic-command-toolbar]');
        if (!actions) return false;
        var copy = BASIC_COMMAND_COPY[basicLocale()] || BASIC_COMMAND_COPY.en;
        actions.setAttribute('aria-label', copy.toolbar);

        var primary = actions.querySelector('.wu-basic-command-primary');
        var outputs = actions.querySelector('[data-wu-basic-output-group]');
        var mode = actions.querySelector('.wu-basic-command-mode');
        if (primary) primary.setAttribute('aria-label', copy.primary);
        if (outputs) outputs.setAttribute('aria-label', copy.outputs);
        if (mode) mode.setAttribute('aria-label', copy.mode);

        setCommandLabel(actions, '[data-wu-command-action="share"]', copy.share);
        setCommandLabel(actions, '[data-wu-command-action="copy"]', copy.copy);
        setCommandLabel(actions, '[data-wu-basic-more-toggle]', copy.more);
        setCommandLabel(actions, '[data-wu-command-action="clear"]', copy.clear);
        setCommandLabel(actions, '[data-wu-command-action="preview"]', copy.preview);
        setCommandLabel(actions, '[data-wu-command-action="print"]', copy.print);
        setCommandLabel(actions, '[data-wu-command-action="text"]', copy.textFile);

        var mobileOutputs = actions.querySelector('[data-wu-basic-mobile-outputs]');
        if (mobileOutputs) mobileOutputs.setAttribute('aria-label', copy.outputs);
        var fileHeading = actions.querySelector('[data-wu-basic-file-options] .wu-basic-command-more-heading');
        if (fileHeading) fileHeading.textContent = copy.fileOptions;
        var editorHeading = actions.querySelector('[data-wu-basic-editor-options] .wu-basic-command-more-heading');
        if (editorHeading) editorHeading.textContent = copy.editorOptions;
        actions.setAttribute('data-wu-basic-command-locale', basicLocale());
        return true;
    }

    function retireBasicCreateGroup(actions) {
        if (!actions) return false;
        var createGroup = actions.querySelector('.home-actions-group-create');
        if (!createGroup) return false;
        createGroup.setAttribute('data-wu-retired-premature-actions', 'true');
        createGroup.remove();
        return true;
    }

    function loadBasicCommandToolbar() {
        if (!root || !root.document || currentRoute() !== '/') return false;
        if (root.WriteUrduBasicCommandToolbar && typeof root.WriteUrduBasicCommandToolbar.run === 'function') {
            root.WriteUrduBasicCommandToolbar.run();
            localizeBasicCommandToolbar();
            return true;
        }
        var existing = root.document.querySelector('script[data-wu-basic-command-toolbar-script]');
        if (existing) return true;
        var script = root.document.createElement('script');
        script.src = BASIC_COMMAND_TOOLBAR_SRC;
        script.defer = true;
        script.setAttribute('data-wu-basic-command-toolbar-script', '');
        script.addEventListener('load', function () {
            if (root.WriteUrduBasicCommandToolbar && typeof root.WriteUrduBasicCommandToolbar.run === 'function') root.WriteUrduBasicCommandToolbar.run();
            localizeBasicCommandToolbar();
        });
        root.document.head.appendChild(script);
        return true;
    }

    function convergeBasicWriter() {
        if (!root || !root.document || currentRoute() !== '/') return false;
        var editor = root.document.getElementById('transliterateTextarea');
        var actions = root.document.querySelector('.home-actions');
        if (!editor || !actions) return false;

        var heroActions = root.document.querySelector('.home-hero-actions');
        if (heroActions) heroActions.setAttribute('data-wu-pre-workspace-actions', 'orientation-only');
        root.document.body.setAttribute('data-wu-core-workspace', 'basic');
        root.document.body.setAttribute('data-wu-canvas-first', 'true');
        root.document.body.setAttribute('data-wu-command-toolbar-transition', 'source-controls');

        retireBasicCreateGroup(actions);
        actions.hidden = false;
        actions.removeAttribute('hidden');
        actions.setAttribute('aria-hidden', 'false');
        actions.setAttribute('data-wu-core-actionbar', 'pre-editor');
        loadBasicCommandToolbar();
        return true;
    }

    function markCoreWorkspace() {
        if (!root || !root.document) return;
        var kind = coreWorkspace(currentRoute());
        if (!kind) return;
        root.document.body.setAttribute('data-wu-core-workspace', kind);
        root.document.body.setAttribute('data-wu-legacy-social-retired', 'true');
        root.document.body.setAttribute('data-wu-premature-header-action-retired', 'true');
    }

    function findCardByHref(container, href) {
        if (!container) return null;
        return container.querySelector('a.sitemap-directory-card[href="' + href + '"]');
    }

    function createWorkSection(beforeNode) {
        if (!root || !root.document || root.document.getElementById('work')) return root.document.getElementById('work');
        var section = root.document.createElement('section');
        section.className = 'sitemap-directory-section';
        section.id = 'work';
        section.setAttribute('aria-labelledby', 'work-title');
        section.innerHTML =
            '<div class="sitemap-directory-section-heading">' +
                '<div><span class="sitemap-directory-step">03</span><p class="sitemap-directory-eyebrow">Work</p></div>' +
                '<div><h2 id="work-title">Create practical Urdu documents for work</h2><p>Make invoices and formal documents without leaving your Urdu writing tools.</p></div>' +
            '</div>' +
            '<div class="sitemap-directory-grid" data-wu-work-grid></div>';
        beforeNode.parentNode.insertBefore(section, beforeNode);
        return section;
    }

    function convergeSitemap() {
        if (!root || !root.document || currentRoute() !== '/write-urdu-sitemap') return false;
        var write = root.document.getElementById('write');
        var create = root.document.getElementById('create');
        var learn = root.document.getElementById('learn');
        var jump = root.document.querySelector('.sitemap-directory-jump');
        if (!write || !create || !learn) return false;

        var cleaner = findCardByHref(create, '/urdu-text-cleaner');
        var invoice = findCardByHref(create, '/urdu-invoice-generator');
        var writeGrid = write.querySelector('.sitemap-directory-grid');
        if (cleaner && writeGrid) writeGrid.appendChild(cleaner);

        var work = createWorkSection(learn);
        var workGrid = work && work.querySelector('[data-wu-work-grid]');
        if (invoice && workGrid) workGrid.appendChild(invoice);

        if (jump && !jump.querySelector('a[href="#work"]')) {
            var workLink = root.document.createElement('a');
            workLink.href = '#work';
            workLink.textContent = 'Work';
            var learnLink = jump.querySelector('a[href="#learn"]');
            jump.insertBefore(workLink, learnLink || null);
        }

        var createEyebrow = create.querySelector('.sitemap-directory-eyebrow');
        if (createEyebrow) createEyebrow.textContent = 'Create';
        var createTitle = create.querySelector('h2');
        if (createTitle) createTitle.textContent = 'Turn Urdu into something ready to share';
        var writeEyebrow = write.querySelector('.sitemap-directory-eyebrow');
        if (writeEyebrow) writeEyebrow.textContent = 'Write';

        var learnStep = learn.querySelector('.sitemap-directory-step');
        if (learnStep) learnStep.textContent = '04';
        root.document.body.setAttribute('data-wu-taxonomy-synced', 'true');
        return true;
    }

    function docsCard(href, icon, title, body, cta) {
        return '<article class="docs-card" data-wu-capture-path><span class="docs-card-icon" aria-hidden="true">' + icon + '</span><h3>' + title + '</h3><p>' + body + '</p><a href="' + href + '">' + cta + ' <span aria-hidden="true">→</span></a></article>';
    }

    function convergeDocumentation() {
        if (!root || !root.document || currentRoute() !== '/write-urdu-documentation') return false;
        var section = root.document.getElementById('paths-title');
        if (!section) return false;
        section.textContent = 'Choose how your Urdu starts';
        var heading = section.closest('.docs-section');
        var intro = heading && heading.querySelector('.docs-section-heading p');
        var grid = heading && heading.querySelector('.docs-card-grid');
        if (intro) intro.textContent = 'Start with Roman Urdu, direct Urdu, your voice, an image, or older InPage text. You can refine and format the result without starting over.';
        if (grid && !grid.querySelector('[data-wu-capture-path]')) {
            grid.insertAdjacentHTML('beforeend',
                docsCard('/tools/urdu-voice-typing', '🎙', 'Speak Urdu', 'Speak Urdu and turn your words into editable text you can copy or continue writing with.', 'Start voice typing') +
                docsCard('/urdu-ocr', '▣', 'Image to Urdu Text', 'Turn a clear Urdu screenshot, photo or scan into editable text for correction and reuse.', 'Convert an Urdu image') +
                docsCard('/tools/inpage-unicode-converter', 'I→U', 'Convert older InPage text', 'Move supported older Urdu text into a format you can copy and use in current apps.', 'Convert InPage text')
            );
        }
        root.document.body.setAttribute('data-wu-taxonomy-synced', 'true');
        return true;
    }

    function run() {
        if (!root || !root.document) return false;
        ensureStyles();
        markCoreWorkspace();
        cleanupCoreChrome();
        startCleanupGuard();
        enhanceGlobalLabels();
        convergeBasicWriter();
        localizeBasicCommandToolbar();
        convergeSitemap();
        convergeDocumentation();
        return true;
    }

    function bind() {
        run();
        if (!root || !root.document) return;
        root.document.addEventListener('write-urdu:locale-change', function () { root.setTimeout(localizeBasicCommandToolbar, 0); });
        root.document.addEventListener('write-urdu:locale-changed', function () { root.setTimeout(run, 0); });
        root.setTimeout(enhanceGlobalLabels, 100);
        root.setTimeout(enhanceGlobalLabels, 800);
    }

    if (root && root.document) {
        if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', bind, { once: true });
        else bind();
    }

    return {
        CORE_ROUTES: CORE_ROUTES.slice(),
        LEGACY_TRUST_SELECTORS: LEGACY_TRUST_SELECTORS.slice(),
        PREMATURE_CORE_SELECTORS: PREMATURE_CORE_SELECTORS.slice(),
        USER_FIRST_LABELS: Object.assign({}, USER_FIRST_LABELS),
        BASIC_COMMAND_TOOLBAR_SRC: BASIC_COMMAND_TOOLBAR_SRC,
        normalizeRoute: normalizeRoute,
        coreWorkspace: coreWorkspace,
        run: run,
        convergeBasicWriter: convergeBasicWriter,
        convergeSitemap: convergeSitemap,
        convergeDocumentation: convergeDocumentation,
        enhanceGlobalLabels: enhanceGlobalLabels,
        localizeBasicCommandToolbar: localizeBasicCommandToolbar,
        loadBasicCommandToolbar: loadBasicCommandToolbar,
        removeLegacyTrustChrome: removeLegacyTrustChrome,
        removePrematureCoreChrome: removePrematureCoreChrome
    };
}));
