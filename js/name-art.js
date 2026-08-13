(function () {
    'use strict';

    var root = document.querySelector('[data-name-art]');
    var workspaceRoot = document.querySelector('[data-name-art-workspace][data-card-studio]');
    var nameArt = window.WriteUrduNameArt;
    var cardCore = window.WriteUrduCardStudio;
    if (!root || !workspaceRoot || !nameArt || !cardCore) return;

    /* Install Name Art presets/templates before Card Studio's DOMContentLoaded
       initializer fills its internal option lists. */
    nameArt.install(cardCore);

    /* Card Studio historically restores its own latest draft when no incoming
       value exists. Name Art is a separate role workspace, so provide a one-use
       blank marker and replace it with Name Art state as soon as the shared
       engine announces readiness. This prevents an unrelated Card Studio draft
       flashing into the direct Name Art canvas. */
    try {
        sessionStorage.setItem('writeUrdu.cardStudio.incoming', JSON.stringify({
            version: 1,
            text: ' ',
            source: 'name-art-direct',
            createdAt: new Date().toISOString()
        }));
    } catch (error) { /* session storage can be unavailable */ }

    function ensureCreationStyles() {
        root.dataset.v2CreationWorkspace = 'name-art';
        ['css/v2-creation.css', 'css/v2-creation-tools.css', 'css/name-art-task-first.css'].forEach(function (href) {
            if (document.querySelector('link[href$="' + href + '"]')) return;
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.setAttribute('data-write-urdu-v2-creation', '');
            document.head.appendChild(link);
        });
    }
    ensureCreationStyles();

    var handoffKey = 'writeUrdu.nameArt.handoff.v1';
    var status = root.querySelector('[data-name-art-status]');
    var textInput = root.querySelector('[data-name-art-text]');
    var convertButton = root.querySelector('[data-name-art-convert]');
    var purposeButtons = Array.prototype.slice.call(root.querySelectorAll('[data-name-art-purpose]'));
    var packSelect = root.querySelector('[data-name-art-pack]');
    var presetSelect = root.querySelector('[data-name-art-preset]');
    var templateGrid = root.querySelector('[data-name-art-templates]');
    var downloadButton = root.querySelector('[data-name-art-download]');
    var transparentButton = root.querySelector('[data-name-art-transparent]');
    var engineStatus = workspaceRoot.querySelector('[data-card-status]');
    var workspaceApp = null;
    var pendingPreset = 'square';

    var GRADIENT_PREVIEWS = {
        'midnight-blue': 'linear-gradient(135deg,#0f172a,#1e3a5f)',
        'emerald-night': 'linear-gradient(135deg,#082c1d,#1c8152)',
        plum: 'linear-gradient(135deg,#3b0764,#a855f7)',
        indigo: 'linear-gradient(135deg,#312e81,#6366f1)',
        ocean: 'linear-gradient(135deg,#164e63,#22d3ee)',
        slate: 'linear-gradient(135deg,#1f2937,#64748b)'
    };

    function setStatus(message, type) {
        status.textContent = message || '';
        status.classList.toggle('is-error', type === 'error');
    }

    function readHandoff() {
        var incoming = null;
        try {
            incoming = JSON.parse(sessionStorage.getItem(handoffKey) || 'null');
            sessionStorage.removeItem(handoffKey);
        } catch (error) {
            incoming = null;
        }
        var created = incoming && Date.parse(incoming.createdAt || '');
        if (!incoming || incoming.version !== 1 || typeof incoming.text !== 'string' || !incoming.text.trim()) return null;
        if (!created || Date.now() - created > 30 * 60 * 1000) return null;
        return incoming;
    }

    function createTemplatePreview(template) {
        var preview = document.createElement('span');
        preview.className = 'name-art-template-preview';
        preview.lang = 'ur';
        preview.dir = 'rtl';
        preview.textContent = 'نام';
        preview.style.color = template.textColor || '#172a21';
        preview.style.fontFamily = '"' + (template.fontFamily || 'Noto Nastaliq Urdu') + '"';
        if (template.background && template.background.type === 'gradient') {
            preview.style.background = GRADIENT_PREVIEWS[template.background.gradientId] || 'linear-gradient(135deg,#183c2a,#527565)';
        } else {
            preview.style.background = template.background && template.background.color || '#f7faf8';
        }
        return preview;
    }

    function populateControls() {
        nameArt.PACKS.forEach(function (pack) {
            var option = document.createElement('option');
            option.value = pack.id;
            option.textContent = pack.label;
            packSelect.appendChild(option);
        });
        nameArt.PRESETS.forEach(function (preset) {
            var option = document.createElement('option');
            option.value = preset.id;
            option.textContent = preset.label + ' · ' + preset.width + ' × ' + preset.height;
            presetSelect.appendChild(option);
        });
        presetSelect.value = pendingPreset;
        renderTemplates('all');
        syncPurpose(pendingPreset);
    }

    function renderTemplates(pack) {
        templateGrid.innerHTML = '';
        nameArt.templatesForPack(pack).forEach(function (template) {
            var packMeta = nameArt.PACKS.find(function (item) { return item.id === template.pack; });
            var button = document.createElement('button');
            var strong = document.createElement('strong');
            var small = document.createElement('small');
            button.type = 'button';
            button.className = 'name-art-template';
            button.setAttribute('data-name-art-template', template.id);
            button.setAttribute('role', 'listitem');
            button.setAttribute('aria-pressed', 'false');
            button.appendChild(createTemplatePreview(template));
            strong.textContent = template.name;
            small.textContent = (packMeta ? packMeta.label : template.pack) + ' · ' + template.fontFamily;
            button.appendChild(strong);
            button.appendChild(small);
            button.addEventListener('click', function () { applyTemplate(template.id); });
            templateGrid.appendChild(button);
        });
        syncSelection();
    }

    function currentState() {
        return workspaceApp && workspaceApp.getState ? workspaceApp.getState() : null;
    }

    function syncPurpose(presetId) {
        purposeButtons.forEach(function (button) {
            var selected = button.getAttribute('data-name-art-purpose') === presetId;
            button.classList.toggle('is-selected', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
    }

    function syncSelection() {
        var state = currentState();
        if (!state) return;
        templateGrid.querySelectorAll('[data-name-art-template]').forEach(function (button) {
            button.setAttribute('aria-pressed', String(button.getAttribute('data-name-art-template') === state.templateId));
        });
        if (nameArt.PRESETS.some(function (preset) { return preset.id === state.presetId; })) {
            presetSelect.value = state.presetId;
            pendingPreset = state.presetId;
            syncPurpose(state.presetId);
        }
    }

    function syncTextToWorkspace(options) {
        if (!workspaceApp) return;
        var value = String(textInput.value || '').trim();
        workspaceApp.updateObjectText('text', value, Object.assign({ save: false }, options || {}));
    }

    function applyTemplate(templateId) {
        if (!workspaceApp) return setStatus('The direct canvas is still loading.');
        var next = cardCore.applyTemplate(currentState(), templateId);
        workspaceApp.replaceState(next, { save: false });
        syncSelection();
        setStatus('Style applied. Refine the name on the live canvas or use the design controls.');
    }

    function applyPreset(presetId) {
        pendingPreset = presetId;
        presetSelect.value = presetId;
        syncPurpose(presetId);
        if (!workspaceApp) {
            setStatus('Your output choice is ready. The direct canvas is still loading.');
            return;
        }
        var next = presetId === 'name-transparent' ? nameArt.transparentState(cardCore, currentState()) : cardCore.applyPreset(currentState(), presetId);
        workspaceApp.replaceState(next, { save: false });
        syncSelection();
        setStatus((presetId === 'name-transparent' ? 'Transparent name' : 'Output size') + ' selected.');
    }

    function initialNameArtState() {
        var value = String(textInput.value || '').trim();
        var next = cardCore.createDefaultCardProject(value);
        next = cardCore.applyPreset(next, pendingPreset === 'name-transparent' ? 'square' : pendingPreset);
        next = cardCore.applyTemplate(next, nameArt.TEMPLATES[0].id);
        if (pendingPreset === 'name-transparent') next = nameArt.transparentState(cardCore, next);
        next.text.value = value;
        next.watermark = { enabled: false, position: 'bottom-left' };
        return cardCore.normalizeCardProject(next);
    }

    function connectWorkspace() {
        if (workspaceApp) return;
        workspaceApp = window.WriteUrduCardStudioApp;
        if (!workspaceApp) return;
        workspaceApp.replaceState(initialNameArtState(), { save: false });
        workspaceApp.requestRender();
        syncSelection();
        if (String(textInput.value || '').trim()) setStatus('Your name is ready on the direct canvas. Choose a style or refine it here.');
        else setStatus('Name Art is ready. Type your name above and the direct canvas updates immediately.');
    }

    function hasUsableName() {
        var state = currentState();
        var value = state && state.text ? String(state.text.value || '').trim() : String(textInput.value || '').trim();
        return Boolean(value && value !== cardCore.DEFAULT_TEXT);
    }

    function requireName() {
        if (hasUsableName()) return true;
        setStatus('Add your name or short Urdu text first.', 'error');
        textInput.focus();
        return false;
    }

    function requestDownload() {
        if (!workspaceApp) return setStatus('The direct canvas is still loading.');
        if (!requireName()) return;
        var button = workspaceRoot.querySelector('[data-card-action="download"]');
        if (!button) return setStatus('PNG export is unavailable. Reload this page and try again.', 'error');
        button.click();
        setStatus('Preparing your PNG from the direct Name Art canvas…');
    }

    function convertRomanUrdu() {
        var value = String(textInput.value || '').trim();
        if (!value) {
            setStatus('Type a name in Roman Urdu first, for example Ayesha.', 'error');
            textInput.focus();
            return;
        }
        if (!/[A-Za-z]{2,}/.test(value)) {
            setStatus('This text does not look like Roman Urdu. You can keep it as entered.');
            return;
        }
        var service = window.WriteUrduBatchTransliteration;
        if (!service || typeof service.transliterate !== 'function') {
            setStatus('Roman Urdu conversion is not available right now. You can type Urdu directly.', 'error');
            return;
        }
        convertButton.disabled = true;
        setStatus('Converting Roman Urdu sounds into Urdu script…');
        service.transliterate(value).then(function (converted) {
            textInput.value = converted;
            syncTextToWorkspace();
            setStatus('Converted to Urdu script. Review the name, then choose a style.');
        }).catch(function () {
            setStatus('The name could not be converted. Check your connection or type Urdu directly.', 'error');
        }).finally(function () {
            convertButton.disabled = false;
        });
    }

    function waitForFonts(state) {
        if (!document.fonts || typeof document.fonts.load !== 'function') return Promise.resolve();
        var requests = [];
        var text = state && state.text || {};
        var attribution = state && state.attribution || {};
        if (text.fontFamily) requests.push(document.fonts.load(Math.max(16, Number(text.fontSize) || 64) + 'px "' + text.fontFamily + '"'));
        if (attribution.enabled && attribution.value && attribution.fontFamily) requests.push(document.fonts.load('24px "' + attribution.fontFamily + '"'));
        return Promise.all(requests.map(function (request) { return Promise.resolve(request).catch(function () {}); }))
            .then(function () { return document.fonts.ready || undefined; })
            .catch(function () {});
    }

    function nextPaint() {
        return new Promise(function (resolve) {
            window.requestAnimationFrame(function () {
                window.requestAnimationFrame(function () { window.setTimeout(resolve, 40); });
            });
        });
    }

    function canvasBlob(canvas) {
        return new Promise(function (resolve, reject) {
            canvas.toBlob(function (blob) { blob ? resolve(blob) : reject(new Error('Transparent PNG could not be generated.')); }, 'image/png');
        });
    }

    function downloadBlob(blob, filename) {
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    function exportTransparent() {
        if (!workspaceApp) return Promise.resolve(setStatus('The direct canvas is still loading.'));
        if (!requireName()) return Promise.resolve();
        var original = JSON.parse(JSON.stringify(currentState()));
        transparentButton.disabled = true;
        setStatus('Preparing transparent 1600 × 900 PNG…');
        var transparent = nameArt.transparentState(cardCore, original);
        workspaceApp.replaceState(transparent, { save: false });
        return waitForFonts(transparent)
            .then(function () { workspaceApp.requestRender(); return nextPaint(); })
            .then(function () {
                var canvas = workspaceApp.getCanvas();
                if (!canvas || canvas.width !== 1600 || canvas.height !== 900) throw new Error('Transparent export dimensions are not ready.');
                return canvasBlob(canvas);
            })
            .then(function (blob) {
                downloadBlob(blob, 'urdu-name-art-transparent.png');
                setStatus('Transparent PNG downloaded at 1600 × 900.');
            })
            .catch(function (error) {
                setStatus(error && error.message || 'Transparent PNG export failed. Your design is still available.', 'error');
            })
            .finally(function () {
                workspaceApp.replaceState(original, { save: false });
                workspaceApp.requestRender();
                transparentButton.disabled = false;
                syncSelection();
            });
    }

    function mirrorEngineExportStatus() {
        if (!engineStatus || !window.MutationObserver) return;
        new MutationObserver(function () {
            var message = String(engineStatus.textContent || '').trim();
            if (!message) return;
            if (/Preparing image|downloaded|Unable to export|Add some Urdu text/i.test(message)) {
                setStatus(message, engineStatus.classList.contains('card-studio-error') ? 'error' : undefined);
            }
        }).observe(engineStatus, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }

    var incoming = readHandoff();
    if (incoming) textInput.value = incoming.text.trim();
    populateControls();
    mirrorEngineExportStatus();

    textInput.addEventListener('input', function () {
        syncTextToWorkspace();
        if (String(textInput.value || '').trim()) setStatus('Live canvas updated. Choose a purpose or style when you are ready.');
        else setStatus('Type your name above to start.');
    });
    convertButton.addEventListener('click', convertRomanUrdu);
    purposeButtons.forEach(function (button) {
        button.addEventListener('click', function () { applyPreset(button.getAttribute('data-name-art-purpose')); });
    });
    packSelect.addEventListener('change', function () { renderTemplates(packSelect.value); });
    presetSelect.addEventListener('change', function () { applyPreset(presetSelect.value); });
    downloadButton.addEventListener('click', requestDownload);
    transparentButton.addEventListener('click', exportTransparent);

    if (window.WriteUrduCardStudioApp) connectWorkspace();
    else document.addEventListener('write-urdu:card-studio-ready', connectWorkspace, { once: true });

    window.WriteUrduNameArtApp = {
        getWorkspaceApp: function () { return workspaceApp; },
        getCanvas: function () { return workspaceApp && workspaceApp.getCanvas ? workspaceApp.getCanvas() : null; },
        applyTemplate: applyTemplate,
        applyPreset: applyPreset,
        setText: function (value) { textInput.value = String(value || ''); syncTextToWorkspace(); },
        exportTransparent: exportTransparent
    };
}());
