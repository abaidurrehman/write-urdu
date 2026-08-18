(function (root, factory) {
    'use strict';
    var api = factory(root);
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduBasicCommandToolbar = api;
}(typeof window !== 'undefined' ? window : null, function (root) {
    'use strict';

    var MOBILE_QUERY = '(max-width: 767px)';
    var OUTPUT_ACTIONS = ['pdf', 'word', 'png', 'preview', 'print'];
    var mediaQuery = null;

    function normalizeRoute(value) {
        var path = String(value || '/').split('?')[0].split('#')[0] || '/';
        if (path === '/index' || path === '/index.html') return '/';
        if (/\.html$/i.test(path)) path = path.slice(0, -5);
        if (path.length > 1) path = path.replace(/\/+$/, '');
        return path || '/';
    }

    function isBasicRoute() {
        return normalizeRoute(root && root.location && root.location.pathname || '/') === '/';
    }

    function hasContent() {
        var editor = root && root.document && root.document.getElementById('transliterateTextarea');
        return Boolean(editor && String(editor.value || '').trim());
    }

    function ensureStyles() {
        if (!root || !root.document || root.document.querySelector('link[data-wu-basic-command-toolbar-style]')) return;
        var link = root.document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/basic-writer-command-toolbar.css';
        link.setAttribute('data-wu-basic-command-toolbar-style', '');
        root.document.head.appendChild(link);
    }

    function setAction(button, action, label, icon, kind) {
        if (!button) return null;
        button.type = 'button';
        button.classList.add('wu-basic-command');
        button.classList.add('wu-basic-command--' + (kind || 'utility'));
        button.setAttribute('data-wu-command-action', action);
        button.setAttribute('data-wu-basic-content-action', '');
        button.setAttribute('aria-label', label);
        button.innerHTML = '<i class="' + icon + '" aria-hidden="true"></i><span>' + label + '</span>';
        return button;
    }

    function telemetry(action) {
        if (!root || !root.WriteUrduTelemetry || typeof root.WriteUrduTelemetry.trackOutcome !== 'function') return;
        root.WriteUrduTelemetry.trackOutcome('basic_toolbar_action', {
            workspace: 'basic-writer',
            action: action,
            hasContent: hasContent()
        });
    }

    function runAuthoringShare() {
        if (root.WriteUrduTools && typeof root.WriteUrduTools.share === 'function') {
            root.WriteUrduTools.share();
            return true;
        }
        if (root.WriteUrduUI && typeof root.WriteUrduUI.notify === 'function') {
            root.WriteUrduUI.notify('Sharing is still loading. Try again in a moment.', 'error');
        }
        return false;
    }

    function createMoreMenu(filenameLabel, filenameInput, textExport, settingsPanel) {
        var wrapper = root.document.createElement('div');
        wrapper.className = 'wu-basic-command-more';
        wrapper.setAttribute('data-wu-basic-more', '');

        var toggle = root.document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'wu-basic-command wu-basic-command--more';
        toggle.setAttribute('data-wu-basic-more-toggle', '');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-controls', 'wuBasicCommandMorePanel');
        toggle.innerHTML = '<i class="fas fa-ellipsis-h" aria-hidden="true"></i><span>More</span>';

        var panel = root.document.createElement('div');
        panel.id = 'wuBasicCommandMorePanel';
        panel.className = 'wu-basic-command-more-panel';
        panel.setAttribute('data-wu-basic-more-panel', '');
        panel.hidden = true;

        var mobileOutputs = root.document.createElement('div');
        mobileOutputs.className = 'wu-basic-command-more-section wu-basic-command-mobile-outputs';
        mobileOutputs.setAttribute('data-wu-basic-mobile-outputs', '');
        mobileOutputs.setAttribute('aria-label', 'Document actions');
        panel.appendChild(mobileOutputs);

        var fileSection = root.document.createElement('div');
        fileSection.className = 'wu-basic-command-more-section';
        fileSection.setAttribute('data-wu-basic-file-options', '');
        var heading = root.document.createElement('strong');
        heading.className = 'wu-basic-command-more-heading';
        heading.textContent = 'File options';
        fileSection.appendChild(heading);
        if (filenameLabel) fileSection.appendChild(filenameLabel);
        if (filenameInput) fileSection.appendChild(filenameInput);
        if (textExport) {
            textExport.className = 'wu-basic-command-more-action';
            textExport.setAttribute('data-wu-command-action', 'text');
            textExport.setAttribute('data-wu-basic-content-action', '');
            textExport.innerHTML = '<i class="far fa-file-alt" aria-hidden="true"></i><span>Text file</span>';
            fileSection.appendChild(textExport);
        }
        panel.appendChild(fileSection);

        if (settingsPanel) {
            var settingsSection = root.document.createElement('div');
            settingsSection.className = 'wu-basic-command-more-section';
            settingsSection.setAttribute('data-wu-basic-editor-options', '');
            var settingsHeading = root.document.createElement('strong');
            settingsHeading.className = 'wu-basic-command-more-heading';
            settingsHeading.textContent = 'Editor options';
            settingsSection.appendChild(settingsHeading);
            while (settingsPanel.firstChild) settingsSection.appendChild(settingsPanel.firstChild);
            panel.appendChild(settingsSection);
        }

        wrapper.appendChild(toggle);
        wrapper.appendChild(panel);

        function close(focusToggle) {
            panel.hidden = true;
            wrapper.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            if (focusToggle) toggle.focus();
        }

        toggle.addEventListener('click', function () {
            var opening = panel.hidden;
            if (opening) {
                panel.hidden = false;
                wrapper.classList.add('is-open');
                toggle.setAttribute('aria-expanded', 'true');
            } else {
                close(false);
            }
        });

        root.document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && !panel.hidden) close(true);
        });
        root.document.addEventListener('click', function (event) {
            if (!panel.hidden && !wrapper.contains(event.target)) close(false);
        });

        return wrapper;
    }

    function syncModeHelper(surface) {
        if (!surface) return;
        var source = surface.querySelector('[data-input-mode-note]');
        var target = surface.querySelector('[data-wu-basic-mode-helper]');
        if (source && target) target.textContent = source.textContent || '';
    }

    function syncState(surface) {
        if (!surface) return false;
        var enabled = hasContent();
        surface.setAttribute('data-wu-has-content', enabled ? 'true' : 'false');
        surface.querySelectorAll('[data-wu-basic-content-action]').forEach(function (button) {
            if ('disabled' in button) button.disabled = !enabled;
            button.setAttribute('aria-disabled', enabled ? 'false' : 'true');
        });
        return enabled;
    }

    function syncResponsiveOutputs(surface) {
        if (!surface) return;
        mediaQuery = mediaQuery || (root.matchMedia ? root.matchMedia(MOBILE_QUERY) : null);
        var compact = Boolean(mediaQuery && mediaQuery.matches);
        var desktopGroup = surface.querySelector('[data-wu-basic-output-group]');
        var mobileGroup = surface.querySelector('[data-wu-basic-mobile-outputs]');
        if (!desktopGroup || !mobileGroup) return;
        OUTPUT_ACTIONS.forEach(function (action) {
            var button = surface.querySelector('[data-wu-command-action="' + action + '"]');
            if (button) (compact ? mobileGroup : desktopGroup).appendChild(button);
        });
        desktopGroup.hidden = compact;
        mobileGroup.hidden = !compact;
        surface.setAttribute('data-wu-output-layout', compact ? 'overflow' : 'direct');
    }

    function removeEmptyLegacyContainer(container) {
        if (!container || container.closest('[data-wu-basic-command-surface]')) return;
        var meaningful = container.querySelector('button,a,input,textarea,select,details,[role="toolbar"]');
        if (!meaningful && !String(container.textContent || '').trim()) container.remove();
    }

    function build() {
        if (!root || !root.document || !isBasicRoute()) return null;
        var existing = root.document.querySelector('[data-wu-basic-command-surface]');
        if (existing) {
            syncModeHelper(existing);
            syncState(existing);
            syncResponsiveOutputs(existing);
            return existing;
        }

        var editor = root.document.getElementById('transliterateTextarea');
        var demo = root.document.getElementById('demo');
        var actions = root.document.querySelector('.home-actions');
        var editorChrome = root.document.querySelector('.editor-chrome');
        if (!editor || !demo || !actions || !editorChrome || !demo.parentNode) return null;

        ensureStyles();

        var legacyContainer = actions.closest('.container');
        var primary = actions.querySelector('.home-actions-group-primary');
        var exportDetails = primary && primary.querySelector('details.action-menu');
        var exportPanel = exportDetails && exportDetails.querySelector('.action-menu-panel');
        var secondary = actions.querySelector('.home-actions-group-secondary');
        var settingsDetails = secondary && secondary.querySelector('details.action-menu');
        var settingsPanel = settingsDetails && settingsDetails.querySelector('.action-menu-panel.settings-panel');
        var legacyShare = secondary && secondary.querySelector('[data-write-urdu-share]');
        if (legacyShare) legacyShare.remove();

        var share = root.document.createElement('button');
        share.type = 'button';
        share.setAttribute('data-wu-basic-share', '');
        var copy = primary && primary.querySelector('[data-copy-target="#transliterateTextarea"]');
        var pdf = exportPanel && exportPanel.querySelector('#exportPdf');
        var word = exportPanel && exportPanel.querySelector('#exportWord');
        var png = exportPanel && exportPanel.querySelector('#exportImage');
        var preview = exportPanel && exportPanel.querySelector('#previewExport');
        var print = exportPanel && exportPanel.querySelector('#PrintCurrentText');
        var filenameLabel = exportPanel && exportPanel.querySelector('label[for="inputFileNameToSaveAs"]');
        var filenameInput = exportPanel && exportPanel.querySelector('#inputFileNameToSaveAs');
        var textExport = exportPanel && exportPanel.querySelector('button[onclick*="saveTextAsFile"]');
        var modeControl = editorChrome.querySelector('[data-input-mode-control]');
        var spinner = editorChrome.querySelector('#spinner');
        var clear = editorChrome.querySelector('#clear');
        var shortcut = editorChrome.querySelector('.editor-shortcut');
        if (!copy || !pdf || !word || !png || !preview || !print || !modeControl || !clear) return null;

        var surface = root.document.createElement('section');
        surface.className = 'wu-basic-command-surface';
        surface.setAttribute('data-wu-basic-command-surface', '');
        surface.setAttribute('aria-label', 'Basic Writer controls');

        actions.innerHTML = '';
        actions.hidden = false;
        actions.removeAttribute('hidden');
        actions.className = 'home-actions wu-basic-command-toolbar';
        actions.setAttribute('data-wu-basic-command-toolbar', '');
        actions.setAttribute('data-wu-core-actionbar', 'pre-editor');
        actions.setAttribute('aria-label', 'Writing and document actions');

        var primaryGroup = root.document.createElement('div');
        primaryGroup.className = 'wu-basic-command-group wu-basic-command-primary';
        primaryGroup.setAttribute('role', 'group');
        primaryGroup.setAttribute('aria-label', 'Share and copy');
        setAction(share, 'share', 'Share', 'fas fa-share-alt', 'share');
        setAction(copy, 'copy', 'Copy', 'far fa-copy', 'copy');
        primaryGroup.appendChild(share);
        primaryGroup.appendChild(copy);

        var outputGroup = root.document.createElement('div');
        outputGroup.className = 'wu-basic-command-group wu-basic-command-outputs';
        outputGroup.setAttribute('data-wu-basic-output-group', '');
        outputGroup.setAttribute('role', 'group');
        outputGroup.setAttribute('aria-label', 'Document actions');
        setAction(pdf, 'pdf', 'PDF', 'far fa-file-pdf', 'utility');
        setAction(word, 'word', 'Word', 'far fa-file-word', 'utility');
        setAction(png, 'png', 'PNG', 'far fa-image', 'utility');
        setAction(preview, 'preview', 'Preview', 'far fa-eye', 'utility');
        setAction(print, 'print', 'Print', 'fas fa-print', 'utility');
        [pdf, word, png, preview, print].forEach(function (button) { outputGroup.appendChild(button); });

        var modeGroup = root.document.createElement('div');
        modeGroup.className = 'wu-basic-command-group wu-basic-command-mode';
        modeGroup.setAttribute('role', 'group');
        modeGroup.setAttribute('aria-label', 'Input mode');
        modeControl.classList.add('wu-basic-input-mode');
        var sourceNote = modeControl.querySelector('[data-input-mode-note]');
        if (sourceNote) sourceNote.classList.add('wu-basic-mode-note-source');
        modeGroup.appendChild(modeControl);

        var more = createMoreMenu(filenameLabel, filenameInput, textExport, settingsPanel);
        var moreGroup = root.document.createElement('div');
        moreGroup.className = 'wu-basic-command-group wu-basic-command-overflow';
        moreGroup.appendChild(more);

        var clearGroup = root.document.createElement('div');
        clearGroup.className = 'wu-basic-command-group wu-basic-command-destructive';
        setAction(clear, 'clear', 'Clear', 'far fa-trash-alt', 'clear');
        clearGroup.appendChild(clear);

        actions.appendChild(primaryGroup);
        actions.appendChild(outputGroup);
        actions.appendChild(modeGroup);
        actions.appendChild(moreGroup);
        actions.appendChild(clearGroup);

        var helper = root.document.createElement('div');
        helper.className = 'wu-basic-command-helper';
        helper.setAttribute('data-wu-basic-command-helper', '');
        var helperText = root.document.createElement('span');
        helperText.setAttribute('data-wu-basic-mode-helper', '');
        helperText.setAttribute('aria-live', 'polite');
        helperText.innerHTML = '<i class="fas fa-magic" aria-hidden="true"></i><span></span>';
        var helperCopy = helperText.querySelector('span');
        helperCopy.setAttribute('data-wu-basic-mode-helper-copy', '');
        helperText.removeAttribute('data-wu-basic-mode-helper');
        helperCopy.setAttribute('data-wu-basic-mode-helper', '');
        helper.appendChild(helperText);
        if (spinner) {
            spinner.classList.add('wu-basic-command-spinner');
            helper.appendChild(spinner);
        }
        if (shortcut) {
            shortcut.className = 'wu-basic-command-shortcut';
            shortcut.innerHTML = '<kbd>Ctrl+G</kbd>';
            helper.appendChild(shortcut);
        } else {
            shortcut = root.document.createElement('span');
            shortcut.className = 'wu-basic-command-shortcut';
            shortcut.innerHTML = '<kbd>Ctrl+G</kbd>';
            helper.appendChild(shortcut);
        }

        surface.appendChild(actions);
        surface.appendChild(helper);
        demo.parentNode.insertBefore(surface, demo);

        editorChrome.remove();
        var usageHint = root.document.getElementById('UsageAlert');
        if (usageHint) usageHint.setAttribute('data-wu-basic-legacy-hint', '');
        root.document.body.setAttribute('data-wu-basic-command-toolbar', 'true');
        removeEmptyLegacyContainer(legacyContainer);

        share.addEventListener('click', runAuthoringShare);

        if (actions.getAttribute('data-wu-toolbar-telemetry-bound') !== 'true') {
            actions.setAttribute('data-wu-toolbar-telemetry-bound', 'true');
            actions.addEventListener('click', function (event) {
                var button = event.target.closest && event.target.closest('[data-wu-command-action]');
                if (!button || button.disabled) return;
                telemetry(button.getAttribute('data-wu-command-action'));
            });
        }

        editor.addEventListener('input', function () { syncState(surface); });
        clear.addEventListener('click', function () { root.setTimeout(function () { syncState(surface); }, 0); });
        modeControl.addEventListener('write-urdu:input-mode-change', function () { root.setTimeout(function () { syncModeHelper(surface); }, 0); });
        root.document.addEventListener('write-urdu:handoff-imported', function () { root.setTimeout(function () { syncState(surface); }, 0); });
        root.document.addEventListener('write-urdu:locale-change', function () { root.setTimeout(function () { syncModeHelper(surface); }, 0); });
        root.document.addEventListener('write-urdu:locale-changed', function () { root.setTimeout(function () { syncModeHelper(surface); }, 0); });

        mediaQuery = root.matchMedia ? root.matchMedia(MOBILE_QUERY) : null;
        if (mediaQuery) {
            var mediaHandler = function () { syncResponsiveOutputs(surface); };
            if (typeof mediaQuery.addEventListener === 'function') mediaQuery.addEventListener('change', mediaHandler);
            else if (typeof mediaQuery.addListener === 'function') mediaQuery.addListener(mediaHandler);
        }

        syncState(surface);
        syncResponsiveOutputs(surface);
        syncModeHelper(surface);
        root.setTimeout(function () { syncModeHelper(surface); syncState(surface); }, 100);
        root.setTimeout(function () { syncModeHelper(surface); syncState(surface); }, 700);
        return surface;
    }

    function run() {
        if (!isBasicRoute()) return false;
        ensureStyles();
        return Boolean(build());
    }

    if (root && root.document) {
        if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', run, { once: true });
        else run();
    }

    return {
        MOBILE_QUERY: MOBILE_QUERY,
        OUTPUT_ACTIONS: OUTPUT_ACTIONS.slice(),
        normalizeRoute: normalizeRoute,
        hasContent: hasContent,
        syncState: syncState,
        syncModeHelper: syncModeHelper,
        syncResponsiveOutputs: syncResponsiveOutputs,
        runAuthoringShare: runAuthoringShare,
        build: build,
        run: run
    };
}));