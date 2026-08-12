(function () {
    'use strict';
    var root = document.querySelector('[data-name-art]');
    var frame = document.querySelector('[data-name-art-frame]');
    var nameArt = window.WriteUrduNameArt;
    if (!root || !frame || !nameArt) return;

    function ensureCreationStyles() {
        root.dataset.v2CreationWorkspace = 'name-art';
        ['css/v2-creation.css', 'css/v2-creation-tools.css'].forEach(function (href) {
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
    var packSelect = root.querySelector('[data-name-art-pack]');
    var presetSelect = root.querySelector('[data-name-art-preset]');
    var templateGrid = root.querySelector('[data-name-art-templates]');
    var downloadButton = root.querySelector('[data-name-art-download]');
    var transparentButton = root.querySelector('[data-name-art-transparent]');
    var frameApp = null;
    var frameCore = null;

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
        renderTemplates('all');
    }

    function renderTemplates(pack) {
        templateGrid.innerHTML = '';
        nameArt.templatesForPack(pack).forEach(function (template) {
            var packMeta = nameArt.PACKS.find(function (item) { return item.id === template.pack; });
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'name-art-template';
            button.setAttribute('data-name-art-template', template.id);
            button.setAttribute('role', 'listitem');
            button.setAttribute('aria-pressed', 'false');
            button.innerHTML = '<strong>' + template.name + '</strong><small>' + (packMeta ? packMeta.label : template.pack) + ' · ' + template.fontFamily + '</small>';
            button.addEventListener('click', function () { applyTemplate(template.id); });
            templateGrid.appendChild(button);
        });
        syncSelection();
    }

    function currentState() {
        return frameApp && frameApp.getState ? frameApp.getState() : null;
    }

    function syncSelection() {
        var state = currentState();
        if (!state) return;
        templateGrid.querySelectorAll('[data-name-art-template]').forEach(function (button) {
            button.setAttribute('aria-pressed', String(button.getAttribute('data-name-art-template') === state.templateId));
        });
        if (nameArt.PRESETS.some(function (preset) { return preset.id === state.presetId; })) presetSelect.value = state.presetId;
    }

    function applyTemplate(templateId) {
        if (!frameApp || !frameCore) return setStatus('The design workspace is still loading.');
        var next = frameCore.applyTemplate(currentState(), templateId);
        frameApp.replaceState(next);
        syncSelection();
        setStatus('Template applied. Continue editing in the workspace below.');
    }

    function applyPreset(presetId) {
        if (!frameApp || !frameCore) return setStatus('The design workspace is still loading.');
        var next = presetId === 'name-transparent' ? nameArt.transparentState(frameCore, currentState()) : frameCore.applyPreset(currentState(), presetId);
        frameApp.replaceState(next);
        syncSelection();
        setStatus((presetId === 'name-transparent' ? 'Transparent name' : 'Output size') + ' selected.');
    }

    function waitForFrameApp(attempt) {
        attempt = attempt || 0;
        var win = frame.contentWindow;
        if (win && win.WriteUrduCardStudioApp && win.WriteUrduCardStudio) {
            frameApp = win.WriteUrduCardStudioApp;
            frameCore = win.WriteUrduCardStudio;
            nameArt.install(frameCore);
            syncSelection();
            setStatus('Name Art Studio is ready. Choose a template or edit directly below.');
            return;
        }
        if (attempt >= 120) {
            setStatus('The design workspace could not be initialized. Reload this page and try again.', 'error');
            return;
        }
        window.setTimeout(function () { waitForFrameApp(attempt + 1); }, 50);
    }

    function requestDownload() {
        if (!frameApp || !frame.contentDocument) return setStatus('The design workspace is still loading.');
        var button = frame.contentDocument.querySelector('[data-card-action="download"]');
        if (!button) return setStatus('PNG export is unavailable. Reload the page and try again.', 'error');
        button.click();
        setStatus('Preparing PNG in the design workspace…');
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
        var original = JSON.parse(JSON.stringify(currentState()));
        if (!String(original.text && original.text.value || '').trim() || original.text.value === frameCore.DEFAULT_TEXT) {
            setStatus('Add a name or short Urdu phrase before exporting.', 'error');
            return Promise.resolve();
        }
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
    forwardHandoff(incoming);
    populateControls();
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
        exportTransparent: exportTransparent
    };
}());
