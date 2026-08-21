/* Guided Card Studio UI. This layer owns workflow presentation only; the
   existing renderer and direct-manipulation controller remain the source of
   truth for the card itself. */
(function () {
    'use strict';

    var root;
    var app;
    var core;
    var interaction;
    var social;
    var role = '';
    var roleEnforcing = false;
    var steps = ['content', 'format', 'style', 'export'];
    var useCases = {
        quote: { template: 'classic-nastaliq', preset: 'square' },
        social: { template: 'minimal-white', preset: 'square' },
        story: { template: 'midnight', preset: 'story' },
        announcement: { template: 'botanical-frame', preset: 'landscape' }
    };
    var labels = { content: 'Content', format: 'Format', style: 'Style', export: 'Export' };
    var ui = { activeStep: 'content', mode: 'quick', selection: 'none', interactionMode: 'idle', capabilities: { isMobile: false, supportsNativeKeyboard: false } };

    function ensureV2CreationStyles() {
        if (document.querySelector('link[href$="css/v2-creation.css"]')) return;
        var stylesheet = document.createElement('link');
        stylesheet.rel = 'stylesheet';
        stylesheet.href = '/css/v2-creation.css';
        stylesheet.setAttribute('data-write-urdu-v2-creation', '');
        document.head.appendChild(stylesheet);
    }
    function clone(value) { try { return JSON.parse(JSON.stringify(value)); } catch (error) { return value; } }
    function commitEditing() { if (interaction && interaction.commit) interaction.commit(); }
    function announce(message) {
        var status = root.querySelector('[data-card-ui-status]');
        if (!status) return;
        status.textContent = message;
        window.setTimeout(function () { if (status.textContent === message) status.textContent = ''; }, 2600);
    }
    function syncAdvancedVisibility() {
        var advanced = ui.mode === 'advanced';
        root.dataset.cardUiMode = ui.mode;
        root.querySelectorAll('[data-card-advanced]').forEach(function (element) { element.hidden = !advanced; });
        root.querySelectorAll('[data-card-ui-mode]').forEach(function (button) {
            var selected = button.dataset.cardUiMode === ui.mode;
            button.classList.toggle('is-active', selected);
            button.setAttribute('aria-pressed', selected ? 'true' : 'false');
        });
    }
    function syncInteractionState(event) {
        var detail = event && event.detail ? event.detail : (app && app.getInteractionState ? app.getInteractionState() : {});
        ui.selection = detail.selectedObjectId || 'none';
        ui.interactionMode = detail.editingObjectId ? 'text-edit' : (ui.selection === 'none' ? 'idle' : 'canvas-edit');
        root.dataset.cardSelection = ui.selection;
        root.dataset.cardInteractionMode = ui.interactionMode;
    }
    function syncSteps() {
        root.dataset.cardActiveStep = ui.activeStep;
        root.querySelectorAll('button[data-card-step]').forEach(function (button) {
            var selected = button.dataset.cardStep === ui.activeStep;
            button.classList.toggle('is-active', selected);
            if (selected) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
        });
        root.querySelectorAll('[data-card-step-panel]').forEach(function (panel) { panel.hidden = panel.dataset.cardStep !== ui.activeStep; });
        syncAdvancedVisibility();
        var activeUseCase = app && app.getState && app.getState().useCase;
        root.querySelectorAll('[data-card-use-case]').forEach(function (button) {
            var selected = Boolean(activeUseCase) && button.dataset.cardUseCase === activeUseCase;
            button.classList.toggle('is-selected', selected);
            button.setAttribute('aria-pressed', selected ? 'true' : 'false');
        });
    }
    function setStep(step) {
        if (steps.indexOf(step) === -1) return;
        commitEditing();
        if (step !== 'content' && app && app.getState && !String(app.getState().text.value || '').trim()) {
            ui.activeStep = 'content'; syncSteps(); announce('Add card text before moving to the next step.');
            var text = root.querySelector('#cardText'); if (text) text.focus(); return;
        }
        ui.activeStep = step; syncSteps(); announce(labels[step] + ' step');
    }
    function setMode(mode) {
        if (mode !== 'quick' && mode !== 'advanced') return;
        commitEditing(); ui.mode = mode; syncAdvancedVisibility();
        announce(mode === 'quick' ? 'Quick mode enabled.' : 'Advanced controls revealed.');
    }
    function selectUseCase(event) {
        var button = event.currentTarget;
        var useCase = button.dataset.cardUseCase;
        var preset = useCases[useCase];
        if (!preset) return;
        commitEditing();
        var before = clone(app.getState());
        var next = clone(app.getState());
        next = core.applyTemplate(next, preset.template);
        next = core.applyPreset(next, preset.preset);
        next.useCase = useCase;
        app.replaceState(next);
        if (interaction && interaction.recordHistory) interaction.recordHistory(before);
        root.querySelectorAll('[data-card-use-case]').forEach(function (item) {
            var selected = item.dataset.cardUseCase === useCase;
            item.classList.toggle('is-selected', selected);
            item.setAttribute('aria-pressed', selected ? 'true' : 'false');
        });
        if (app.syncControls) app.syncControls();
        if (app.requestRender) app.requestRender();
        announce('Recommended ' + button.querySelector('strong').textContent + ' layout applied.');
    }
    function updateHistoryButtons() {
        if (!interaction || !interaction.getHistoryState) return;
        var history = interaction.getHistoryState();
        root.querySelectorAll('[data-card-ui-action="undo"]').forEach(function (button) { button.disabled = !history.canUndo; });
        root.querySelectorAll('[data-card-ui-action="redo"]').forEach(function (button) { button.disabled = !history.canRedo; });
    }
    function contentAction(event) {
        var action = event.currentTarget.dataset.cardContentAction;
        if (action === 'sample') app.updateObjectText('text', core.DEFAULT_TEXT);
        if (action === 'clear') app.updateObjectText('text', '');
        if (app.syncControls) app.syncControls();
        if (app.scheduleSave) app.scheduleSave();
        announce(action === 'sample' ? 'Sample Urdu text added.' : 'Card text cleared.');
    }

    function ownImageShareLabels() {
        root.querySelectorAll('[data-card-action="share"]').forEach(function (button) {
            button.removeAttribute('data-card-i18n');
            button.removeAttribute('data-wu-i18n-control');
            if (String(button.textContent || '').trim() !== 'Share image only') button.textContent = 'Share image only';
            button.title = 'Share the image file without creating a public Write Urdu link';
        });
    }

    function ensureFacebookEntry() {
        var group = root.querySelector('[data-card-use-cases]');
        if (!group) return;
        var entry = group.querySelector('[data-card-role-entry="facebook"]');
        if (!entry) {
            entry = document.createElement('a');
            entry.className = 'card-studio-use-case';
            entry.href = '/urdu-card-studio?role=facebook';
            entry.setAttribute('data-card-role-entry', 'facebook');
            entry.innerHTML = '<strong>Facebook post</strong><small>1200 × 630 wide layout</small>';
            group.appendChild(entry);
        }
        if (role === 'facebook') {
            entry.classList.add('is-selected');
            entry.setAttribute('aria-current', 'page');
            root.querySelectorAll('[data-card-use-case]').forEach(function (item) { item.hidden = true; });
        }
    }
    function applyFacebookPresentation() {
        if (role !== 'facebook') return;
        document.body.classList.remove('social-maker-embedded');
        document.body.classList.add('card-facebook-role');
        var socialBadge = root.querySelector('.card-studio-social-badge');
        if (socialBadge) socialBadge.hidden = true;
        root.dataset.cardRoleMode = 'facebook';
        ensureFacebookEntry();
        var preset = root.querySelector('#cardPreset');
        if (preset) { preset.disabled = true; preset.setAttribute('aria-label', 'Facebook post size: 1200 by 630 pixels'); }
        var socialHelp = root.querySelector('.social-maker-controls .card-studio-help:last-child');
        if (socialHelp) socialHelp.textContent = 'Write Urdu does not post to Facebook. Download the image and upload it manually from your device.';
        var intro = root.querySelector('[data-card-use-cases]');
        if (intro) intro.setAttribute('aria-label', 'Facebook post role');
    }
    function enforceFacebookRole() {
        if (role !== 'facebook' || roleEnforcing || !app || !core || !social) return;
        applyFacebookPresentation();
        var current = app.getState();
        if (current && current.presetId === 'facebook' && current.socialMode === 'facebook') return;
        roleEnforcing = true;
        var value = current && current.text ? String(current.text.value || '') : '';
        var incoming = value && value !== core.DEFAULT_TEXT ? value : null;
        var next = social.applyDefaults(core, current || core.createDefaultCardProject(''), 'facebook', incoming);
        app.replaceState(next, { save: false });
        if (app.scheduleSave) app.scheduleSave();
        if (app.requestRender) app.requestRender();
        window.setTimeout(function () { roleEnforcing = false; }, 0);
    }

    function bind() {
        root.querySelectorAll('button[data-card-step]').forEach(function (button) { button.addEventListener('click', function () { setStep(button.dataset.cardStep); }); });
        root.querySelectorAll('[data-card-ui-mode]').forEach(function (button) { button.addEventListener('click', function () { setMode(button.dataset.cardUiMode); }); });
        root.querySelectorAll('[data-card-use-case]').forEach(function (button) { button.addEventListener('click', selectUseCase); });
        root.querySelectorAll('[data-card-content-action]').forEach(function (button) { button.addEventListener('click', contentAction); });
        root.querySelectorAll('[data-card-ui-action]').forEach(function (button) {
            button.addEventListener('click', function () {
                if (!interaction) return;
                commitEditing();
                if (button.dataset.cardUiAction === 'undo' && interaction.undo) interaction.undo();
                if (button.dataset.cardUiAction === 'redo' && interaction.redo) interaction.redo();
                updateHistoryButtons();
            });
        });
        document.addEventListener('write-urdu:locale-change', function () { syncSteps(); applyFacebookPresentation(); ownImageShareLabels(); });
        document.addEventListener('write-urdu:card-interaction-state', syncInteractionState);
        if (role === 'facebook') document.addEventListener('write-urdu:card-rendered', enforceFacebookRole);
        syncInteractionState(); syncSteps(); updateHistoryButtons(); ownImageShareLabels();
    }
    function start() {
        ensureV2CreationStyles();
        root = document.querySelector('[data-card-studio]');
        app = window.WriteUrduCardStudioApp;
        core = window.WriteUrduCardStudio;
        social = window.WriteUrduSocialMaker;
        interaction = window.WriteUrduCardStudioInteractionApi;
        role = new URLSearchParams(window.location.search || '').get('role') || '';
        if (!root || !app || !core) return;
        root.dataset.v2CreationWorkspace = 'card-studio';
        ensureFacebookEntry();
        bind();
        ui.capabilities.isMobile = Boolean(window.matchMedia && window.matchMedia('(max-width: 900px)').matches);
        ui.capabilities.supportsNativeKeyboard = Boolean(root.querySelector('[data-card-canvas-editor]'));
        applyFacebookPresentation();
        enforceFacebookRole();
        window.setTimeout(enforceFacebookRole, 180);
        window.WriteUrduCardStudioUi = { getState: function () { return clone(ui); }, setStep: setStep, setMode: setMode, getRole: function () { return role; } };
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
}());

/* Load the public publishing layer only after the Card Studio application and
   guided UI are available. Keeping this separate protects the mature canvas
   renderer and existing download/image-share behavior from the networked
   publication feature. */
(function () {
    'use strict';
    function loadPublishLayer() {
        if (!window.WriteUrduCardStudioApp || document.querySelector('script[data-write-urdu-share-publish]')) return;
        var script = document.createElement('script');
        script.src = '/js/card-studio-publish.js';
        script.defer = true;
        script.setAttribute('data-write-urdu-share-publish', '');
        document.body.appendChild(script);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { window.setTimeout(loadPublishLayer, 0); });
    else window.setTimeout(loadPublishLayer, 0);
}());
