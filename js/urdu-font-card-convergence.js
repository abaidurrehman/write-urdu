(function (root, factory) {
    'use strict';
    var api = factory(root);
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.WriteUrduFontCardConvergence = api;
}(typeof window !== 'undefined' ? window : null, function (root) {
    'use strict';

    var installed = false;
    var bypass = new WeakSet();

    function registry() {
        return root && root.WriteUrduFontRegistry || null;
    }

    function app() {
        return root && root.WriteUrduCardStudioApp || null;
    }

    function capability() {
        var body = root && root.document && root.document.body;
        return body && body.classList.contains('name-art-page') ? 'name-art' : 'card-studio';
    }

    function records() {
        var value = registry();
        return value ? value.getForCapability(capability(), { webOnly: true, excludeCandidates: true }) : [];
    }

    function notify(message, type) {
        var current = app();
        if (current && typeof current.notify === 'function') current.notify(message, type);
        else if (root.WriteUrduUI && typeof root.WriteUrduUI.notify === 'function') root.WriteUrduUI.notify(message, type);
    }

    function populateSelector() {
        var doc = root.document;
        var select = doc.getElementById('cardFont');
        var available = records();
        if (!select || !available.length) return false;
        var current = app();
        var state = current && current.getState ? current.getState() : null;
        var selected = state && state.text && state.text.fontFamily || select.value;
        select.innerHTML = '';
        available.forEach(function (record) {
            var option = doc.createElement('option');
            option.value = record.family;
            option.textContent = record.family;
            option.setAttribute('data-wu-font-id', record.id);
            select.appendChild(option);
        });
        var resolved = registry().get(selected);
        select.value = resolved && available.some(function (record) { return record.id === resolved.id; }) ? resolved.family : available[0].family;
        select.setAttribute('data-wu-font-registry-owned', capability());
        return true;
    }

    function stateFontRequests(state) {
        state = state || {};
        var requests = [];
        var text = state.text || {};
        var attribution = state.attribution || {};
        if (text.fontFamily) requests.push({ font: text.fontId || text.fontFamily, weight: 400 });
        if (attribution.enabled && String(attribution.value || '').trim() && attribution.fontFamily) requests.push({ font: attribution.fontId || attribution.fontFamily, weight: 400 });
        return requests;
    }

    function strictLoader() {
        var value = registry();
        return value && value.createLoader ? value.createLoader({ document: root.document }) : null;
    }

    function loadStateFonts(state) {
        var loader = strictLoader();
        if (!loader) return Promise.reject(new Error('Urdu font registry is unavailable.'));
        var requests = stateFontRequests(state);
        if (!requests.length) return Promise.resolve([]);
        return Promise.all(requests.map(function (request) {
            return loader.load(request.font, { weight: request.weight }).then(function (result) {
                if (!result.ok) throw new Error('The selected Urdu font could not be loaded (' + result.code + ').');
                return result;
            });
        }));
    }

    function revealCanvas(ok) {
        var canvas = root.document && root.document.getElementById('cardCanvas');
        if (!canvas) return;
        canvas.style.visibility = ok ? '' : 'hidden';
        if (ok) canvas.removeAttribute('data-wu-font-load-pending');
        else canvas.setAttribute('data-wu-font-load-pending', 'true');
    }

    function verifyAndRender() {
        var current = app();
        if (!current || typeof current.getState !== 'function') return Promise.resolve(false);
        revealCanvas(false);
        return loadStateFonts(current.getState()).then(function () {
            revealCanvas(true);
            if (typeof current.requestRender === 'function') current.requestRender();
            root.document.documentElement.setAttribute('data-wu-font-convergence', capability());
            return true;
        }).catch(function (error) {
            revealCanvas(false);
            notify(error.message || 'The selected Urdu font could not be loaded.', 'error');
            return false;
        });
    }

    function guardSelector() {
        var select = root.document.getElementById('cardFont');
        if (!select || select.getAttribute('data-wu-font-guarded') === 'true') return;
        select.setAttribute('data-wu-font-guarded', 'true');
        select.addEventListener('change', function (event) {
            if (bypass.has(select)) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            var current = app();
            var previousState = current && current.getState ? current.getState() : null;
            var previous = previousState && previousState.text && previousState.text.fontFamily;
            var record = registry() && registry().get(select.value);
            if (!record || record.licenseStatus !== 'approved-web' || record.capabilities.indexOf(capability()) === -1) {
                if (previous) select.value = previous;
                notify('That Urdu font is not approved for this tool.', 'error');
                return;
            }
            var loader = strictLoader();
            loader.load(record.id).then(function (result) {
                if (!result.ok) throw new Error('The selected Urdu font could not be loaded (' + result.code + ').');
                if (current && typeof current.updateTextStyle === 'function') current.updateTextStyle({ fontFamily: record.family });
                bypass.add(select);
                select.value = record.family;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                bypass.delete(select);
            }).catch(function (error) {
                if (previous) select.value = previous;
                notify(error.message || 'The selected Urdu font could not be loaded.', 'error');
            });
        }, true);
    }

    function guardedReplay(button) {
        if (!button || button.getAttribute('data-wu-font-export-guard') === 'true') return;
        button.setAttribute('data-wu-font-export-guard', 'true');
        button.addEventListener('click', function (event) {
            if (bypass.has(button)) return;
            var current = app();
            if (!current || typeof current.getState !== 'function') return;
            event.preventDefault();
            event.stopImmediatePropagation();
            button.disabled = true;
            loadStateFonts(current.getState()).then(function () {
                bypass.add(button);
                button.disabled = false;
                button.click();
                bypass.delete(button);
            }).catch(function (error) {
                button.disabled = false;
                notify(error.message || 'Export stopped because the selected Urdu font did not load.', 'error');
            });
        }, true);
    }

    function guardExports() {
        root.document.querySelectorAll('[data-card-action="download"], [data-card-action="share"], [data-name-art-transparent]').forEach(guardedReplay);
    }

    function install() {
        if (installed || !root || !root.document || !registry()) return false;
        var current = app();
        if (!current) return false;
        installed = true;
        populateSelector();
        guardSelector();
        guardExports();
        verifyAndRender();
        return true;
    }

    function boot() {
        if (install()) return;
        root.document.addEventListener('write-urdu:card-studio-ready', install, { once: true });
        if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', install, { once: true });
    }

    if (root) boot();

    return {
        install: install,
        populateSelector: populateSelector,
        loadStateFonts: loadStateFonts,
        stateFontRequests: stateFontRequests,
        capability: capability
    };
}));
