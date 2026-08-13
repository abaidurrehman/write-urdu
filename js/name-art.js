(function () {
    'use strict';
    var root = document.querySelector('[data-name-art]');
    var frame = document.querySelector('[data-name-art-frame]');
    var nameArt = window.WriteUrduNameArt;
    if (!root || !frame || !nameArt) return;

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
    var cardIncomingKey = 'writeUrdu.cardStudio.incoming';
    var status = root.querySelector('[data-name-art-status]');
    var textInput = root.querySelector('[data-name-art-text]');
    var convertButton = root.querySelector('[data-name-art-convert]');
    var purposeButtons = Array.prototype.slice.call(root.querySelectorAll('[data-name-art-purpose]'));
    var packSelect = root.querySelector('[data-name-art-pack]');
    var presetSelect = root.querySelector('[data-name-art-preset]');
    var templateGrid = root.querySelector('[data-name-art-templates]');
    var downloadButton = root.querySelector('[data-name-art-download]');
    var transparentButton = root.querySelector('[data-name-art-transparent]');
    var frameApp = null;
    var frameCore = null;
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

    function forwardHandoff(incoming) {
        if (!incoming) return;
        try {
            sessionStorage.setItem(cardIncomingKey, JSON.stringify({
                version: 1,
                text: incoming.text.trim(),
                source: incoming.source || 'name-art',
                createdAt: new Date().toISOString()
            }));
        } catch (error) { /* session storage can be unavailable */ }
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
        return frameApp && frameApp.getState ? frameApp.getState() : null;
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

    function syncTextToFrame(options) {
        if (!frameApp) return;
        var value = String(textInput.value || '').trim();
        frameApp.updateObjectText('text', value, options);
    }

    function applyTemplate(templateId) {
        if (!frameApp || !frameCore) return setStatus('The design workspace is still loading.');
        var next = frameCore.applyTemplate(currentState(), templateId);
        frameApp.replaceState(next);
        syncSelection();
        setStatus('Style applied. Your name is ready to refine in the live workspace.');
    }

    function applyPreset(presetId) {
        pendingPreset = presetId;
        presetSelect.value = presetId;
        syncPurpose(presetId);
        if (!frameApp || !frameCore) {
            setStatus('Your output choice is ready. The live preview is still loading.');
            return;
        }
        var next = presetId === 'name-transparent' ? nameArt.transparentState(frameCore, currentState()) : frameCore.applyPreset(currentState(), presetId);
        frameApp.replaceState(next);
        syncSelection();
        setStatus((presetId === 'name-transparent' ? 'Transparent name' : 'Output size') + ' selected.');
    }

    function initialNameArtState() {
        var value = String(textInput.value || '').trim();
        var next = frameCore.createDefaultCardProject(value);
        next = frameCore.applyPreset(next, pendingPreset === 'name-transparent' ? 'square' : pendingPreset);
        next = frameCore.applyTemplate(next, nameArt.TEMPLATES[0].id);
        if (pendingPreset === 'name-transparent') next = nameArt.transparentState(frameCore, next);
        next.text.value = value;
        next.watermark = { enabled: false, position: 'bottom-left' };
        return frameCore.normalizeCardProject(next);
    }

    function waitForFrameApp(attempt) {
        attempt = attempt || 0;
        var win = frame.contentWindow;
        if (win && win.WriteUrduCardStudioApp && win.WriteUrduCardStudio) {
            frameApp = win.WriteUrduCardStudioApp;
            frameCore = win.WriteUrduCardStudio;
            nameArt.install(frameCore);
            frameApp.replaceState(initialNameArtState(), { save: false });
            frameApp.requestRender();
            syncSelection();
            if (String(textInput.value || '').trim()) setStatus('Your name is in the live preview. Choose a style or refine it below.');
            else setStatus('Type your name above to start. The live preview updates as you type.');
            return;
        }
        if (attempt >= 120) {
            setStatus('The design workspace could not be initialized. Reload this page and try again.', 'error');
            return;
        }
        window.setTimeout(function () { waitForFrameApp(attempt + 1); }, 50);
    }

    function hasUsableName() {
        var state = currentState();
        var value = state && state.text ? String(state.text.value || '').trim() : String(textInput.value || '').trim();
        return Boolean(value && (!frameCore || value !== frameCore.DEFAULT_TEXT));
    }

    function requireName() {
        if (hasUsableName()) return true;
        setStatus('Add your name or short Urdu text first.', 'error');
        textInput.focus();
        return false;
    }

    function requestDownload() {
        if (!frameApp || !frame.contentDocument) return setStatus('The design workspace is still loading.');
        if (!requireName()) return;
        var button = frame.contentDocument.querySelector('[data-card-action="download"]');
        if (!button) return setStatus('PNG export is unavailable. Reload this page and try again.', 'error');
        button.click();
        setStatus('Preparing your PNG in the design workspace…');
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
            syncTextToFrame();
            setStatus('Converted to Urdu script. Review the name, then choose a style.');
        }).catch(function () {
            setStatus('The name could not be converted. Check your connection or type Urdu directly.', 'error');
        }).finally(function () {
            convertButton.disabled = false;
        });
    }

    function waitForFonts(doc, state) {
        if (!doc.fonts || typeof doc.fonts.load !== 'function') return Promise.resolve();
        var requests = [];
        var text = state && state.text || {};
        var attribution = state && state.attribution || {};
        if (text.fontFamily) requests.push(doc.fonts.load(Math.max(16, Number(text.fontSize) || 64) + 'px "' + text.fontFamily + '"'));
        if (attribution.enabled && attribution.value && attribution.fontFamily) requests.push(doc.fonts.load('24px "' + attribution.fontFamily + '"'));
        return Promise.all(requests.map(function (request) { return Promise.resolve(request).catch(function () {}); }))
            .then(function () { return doc.fonts.ready || undefined; })
            .catch(function () {});
    }

    function nextPaint(win) {
        return new Promise(function (resolve) {
            win.requestAnimationFrame(function () {
                win.requestAnimationFrame(function () { win.setTimeout(resolve, 40); });
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
        if (!frameApp || !frameCore) return Promise.resolve(setStatus('The design workspace is still loading.'));
        if (!requireName()) return Promise.resolve();
        var original = JSON.parse(JSON.stringify(currentState()));
        transparentButton.disabled = true;
        setStatus('Preparing transparent 1600 × 900 PNG…');
        var transparent = nameArt.transparentState(frameCore, original);
        frameApp.replaceState(transparent, { save: false });
        return waitForFonts(frame.contentDocument, transparent)
            .then(function () { frameApp.requestRender(); return nextPaint(frame.contentWindow); })
            .then(function () {
                var canvas = frameApp.getCanvas();
                if (!canvas || canvas.width !== 1600 || canvas.height !== 900) throw new Error('Transparent export dimensions are not ready.');
                return canvasBlob(canvas);
            })
            .then(function (blob) {
                downloadBlob(blob, 'urdu-name-art-transparent.png');
                setStatus('Transparent PNG downloaded at 1600 × 900.');
            })
            .catch(function (error) {
                setStatus(error && error.message || 'Transparent PNG export failed. Your design is still available below.', 'error');
            })
            .finally(function () {
                frameApp.replaceState(original, { save: false });
                frameApp.requestRender();
                transparentButton.disabled = false;
                syncSelection();
            });
    }

    var incoming = readHandoff();
    if (incoming) textInput.value = incoming.text.trim();
    forwardHandoff(incoming);
    populateControls();

    textInput.addEventListener('input', function () {
        syncTextToFrame();
        if (String(textInput.value || '').trim()) setStatus('Live preview updated. Choose a purpose or style when you are ready.');
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
    frame.addEventListener('load', function () { waitForFrameApp(0); });
    frame.src = 'urdu-card-studio.html?nameArt=1';

    window.WriteUrduNameArtApp = {
        getFrameApp: function () { return frameApp; },
        applyTemplate: applyTemplate,
        applyPreset: applyPreset,
        setText: function (value) { textInput.value = String(value || ''); syncTextToFrame(); },
        exportTransparent: exportTransparent
    };
}());
