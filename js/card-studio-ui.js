/* Guided Card Studio UI. This layer owns workflow presentation only; the
   existing renderer and direct-manipulation controller remain the source of
   truth for the card itself. */
(function () {
    'use strict';

    var root;
    var app;
    var core;
    var interaction;
    var steps = ['content', 'format', 'style', 'export'];
    var useCases = {
        quote: { template: 'classic-nastaliq', preset: 'square' },
        social: { template: 'minimal-white', preset: 'square' },
        story: { template: 'midnight', preset: 'story' },
        announcement: { template: 'botanical-frame', preset: 'landscape' }
    };
    var labels = { content: 'Content', format: 'Format', style: 'Style', export: 'Export' };
    var ui = { activeStep: 'content', mode: 'quick' };

    function clone(value) {
        try { return JSON.parse(JSON.stringify(value)); } catch (error) { return value; }
    }

    function commitEditing() {
        if (interaction && interaction.commit) interaction.commit();
    }

    function announce(message) {
        var status = root.querySelector('[data-card-ui-status]');
        if (!status) return;
        status.textContent = message;
        window.setTimeout(function () { if (status.textContent === message) status.textContent = ''; }, 2600);
    }

    function syncAdvancedVisibility() {
        var advanced = ui.mode === 'advanced';
        root.dataset.cardUiMode = ui.mode;
        root.querySelectorAll('[data-card-advanced]').forEach(function (element) {
            element.hidden = !advanced;
        });
        root.querySelectorAll('[data-card-ui-mode]').forEach(function (button) {
            var selected = button.dataset.cardUiMode === ui.mode;
            button.classList.toggle('is-active', selected);
            button.setAttribute('aria-pressed', selected ? 'true' : 'false');
        });
    }

    function syncSteps() {
        root.dataset.cardActiveStep = ui.activeStep;
        root.querySelectorAll('button[data-card-step]').forEach(function (button) {
            var selected = button.dataset.cardStep === ui.activeStep;
            button.classList.toggle('is-active', selected);
            if (selected) button.setAttribute('aria-current', 'step');
            else button.removeAttribute('aria-current');
        });
        root.querySelectorAll('[data-card-step-panel]').forEach(function (panel) {
            panel.hidden = panel.dataset.cardStep !== ui.activeStep;
        });
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
            ui.activeStep = 'content';
            syncSteps();
            announce('Add card text before moving to the next step.');
            var text = root.querySelector('#cardText');
            if (text) text.focus();
            return;
        }
        ui.activeStep = step;
        syncSteps();
        announce(labels[step] + ' step');
    }

    function setMode(mode) {
        if (mode !== 'quick' && mode !== 'advanced') return;
        commitEditing();
        ui.mode = mode;
        syncAdvancedVisibility();
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
        document.addEventListener('write-urdu:locale-change', syncSteps);
        syncSteps();
        updateHistoryButtons();
    }

    function start() {
        root = document.querySelector('[data-card-studio]');
        app = window.WriteUrduCardStudioApp;
        core = window.WriteUrduCardStudio;
        interaction = window.WriteUrduCardStudioInteractionApi;
        if (!root || !app || !core) return;
        bind();
        window.WriteUrduCardStudioUi = { getState: function () { return { activeStep: ui.activeStep, mode: ui.mode }; }, setStep: setStep, setMode: setMode };
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
}());
