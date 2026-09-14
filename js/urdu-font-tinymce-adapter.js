(function (root, factory) {
    'use strict';
    var api = factory(root);
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.WriteUrduFontTinyMceAdapter = api;
}(typeof window !== 'undefined' ? window : null, function (root) {
    'use strict';

    var LATIN_SYSTEM_FORMATS = [
        'Arial=arial,helvetica,sans-serif',
        'Courier New=courier new,courier',
        'Georgia=georgia,palatino',
        'Tahoma=tahoma,arial,sans-serif',
        'Times New Roman=times new roman,times',
        'Verdana=verdana,geneva'
    ];
    var attached = typeof WeakSet === 'function' ? new WeakSet() : null;

    function registry() { return root && root.WriteUrduFontRegistry || null; }

    function editorRecords() {
        var value = registry();
        return value ? value.getForCapability('editor', { webOnly: true, excludeCandidates: true }) : [];
    }

    function buildFontFormats() {
        return editorRecords().map(function (record) { return record.family; }).concat(LATIN_SYSTEM_FORMATS).join('; ');
    }

    function repairFontSamples(doc) {
        doc = doc || root && root.document;
        if (!doc) return;
        var modal = doc.getElementById('exampleModal');
        if (!modal) return;
        Array.prototype.forEach.call(modal.querySelectorAll('li'), function (item) {
            var text = String(item.textContent || '');
            if (/Qadreeregular/i.test(text)) {
                item.remove();
                return;
            }
            if (/^\s*Scheherazade\b(?! New)/i.test(text)) item.textContent = text.replace(/Scheherazade/i, 'Scheherazade New');
        });
        modal.setAttribute('data-wu-font-registry-owned', 'editor');
    }

    function setEditorFormats(editor) {
        var formats = buildFontFormats();
        if (!formats) return false;
        editor.settings = editor.settings || {};
        editor.settings.font_formats = formats;
        if (editor.options && typeof editor.options.set === 'function') {
            try { editor.options.set('font_family_formats', formats); } catch (error) { /* TinyMCE version compatibility */ }
            try { editor.options.set('font_formats', formats); } catch (error) { /* TinyMCE version compatibility */ }
        }
        return true;
    }

    function createIframeLoader(editor) {
        var value = registry();
        if (!value || !editor || typeof editor.getDoc !== 'function') return null;
        var doc = editor.getDoc();
        return doc ? value.createLoader({ document: doc }) : null;
    }

    function notify(message) {
        if (root && root.WriteUrduUI && typeof root.WriteUrduUI.notify === 'function') root.WriteUrduUI.notify(message, 'error');
    }

    function loadFont(editor, value, weight) {
        var record = registry() && registry().get(value);
        if (!record || record.capabilities.indexOf('editor') === -1 || record.licenseStatus !== 'approved-web') {
            return Promise.resolve({ ok:false, code:'not-editor-approved', id:record && record.id || null });
        }
        var loader = createIframeLoader(editor);
        if (!loader) return Promise.resolve({ ok:false, code:'iframe-font-loader-unavailable', id:record.id });
        return loader.load(record.id, { weight:weight || record.defaultWeight }).then(function (result) {
            if (!result.ok) notify('The selected Urdu font could not be loaded in the editor. Your text has not been changed.');
            return result;
        });
    }

    function selectedFamily(editor) {
        if (!editor || !editor.selection || typeof editor.selection.getNode !== 'function') return 'Noto Nastaliq Urdu';
        var node = editor.selection.getNode();
        var view = editor.getWin && editor.getWin();
        if (!node || !view || !view.getComputedStyle) return 'Noto Nastaliq Urdu';
        var family = String(view.getComputedStyle(node).fontFamily || '').split(',')[0].replace(/^['"]|['"]$/g, '').trim();
        return registry() && registry().get(family) ? family : 'Noto Nastaliq Urdu';
    }

    function attach(editor) {
        if (!editor || !registry()) return false;
        if (attached && attached.has(editor)) return true;
        if (attached) attached.add(editor);
        setEditorFormats(editor);
        repairFontSamples(root.document);
        loadFont(editor, 'noto-nastaliq-urdu');

        if (typeof editor.on === 'function') {
            editor.on('ExecCommand', function (event) {
                if (!event || !/^(FontName|mceFontName)$/i.test(String(event.command || ''))) return;
                loadFont(editor, event.value || selectedFamily(editor));
            });
            editor.on('NodeChange', function () {
                var family = selectedFamily(editor);
                var record = registry().get(family);
                if (record && record.capabilities.indexOf('editor') !== -1) loadFont(editor, record.id);
            });
        }
        if (root.document && root.document.documentElement) root.document.documentElement.setAttribute('data-wu-editor-font-registry', 'true');
        return true;
    }

    function install() {
        if (!root || !root.tinymce || !registry()) return false;
        var editor = root.tinymce.get && root.tinymce.get('basic-example');
        if (editor && editor.initialized) return attach(editor);
        if (typeof root.tinymce.on === 'function') root.tinymce.on('AddEditor', function (event) {
            if (event && event.editor && event.editor.id === 'basic-example') {
                if (event.editor.initialized) attach(event.editor);
                else event.editor.on('init', function () { attach(event.editor); });
            }
        });
        return false;
    }

    function boot(attempt) {
        attempt = attempt || 0;
        if (install()) return;
        if (attempt < 120 && root) root.setTimeout(function () { boot(attempt + 1); }, 50);
    }

    if (root) boot(0);

    return {
        LATIN_SYSTEM_FORMATS: LATIN_SYSTEM_FORMATS.slice(),
        editorRecords: editorRecords,
        buildFontFormats: buildFontFormats,
        repairFontSamples: repairFontSamples,
        setEditorFormats: setEditorFormats,
        loadFont: loadFont,
        attach: attach,
        install: install
    };
}));
