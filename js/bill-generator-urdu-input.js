(function (root) {
    'use strict';

    // Mounts the shared English letters → Urdu engine (input-mode.js + the
    // Google control) on the bill's free-text fields. Bill state and rendering
    // stay in bill-generator.js; this file only registers fields.
    var document = root.document;
    var FIELD_SELECTOR = '[data-field="business.name"],[data-field="customer.name"],[data-item-field="description"]';
    var counter = 0;
    var control = null;

    function fields() {
        return Array.prototype.slice.call(document.querySelectorAll(FIELD_SELECTOR));
    }

    function register() {
        if (!control) return;
        var ids = [];
        fields().forEach(function (field) {
            if (field.dataset.billUrduInput === 'true') return;
            if (!field.id) field.id = 'billUrduField' + (counter += 1);
            field.dataset.billUrduInput = 'true';
            ids.push(field.id);
        });
        if (ids.length) {
            try { control.makeTransliteratable(ids); } catch (error) { /* direct Urdu keeps working */ }
        }
        if (root.WriteUrduInputMode && root.WriteUrduInputMode.refresh) root.WriteUrduInputMode.refresh();
    }

    function init() {
        var google = root.google;
        if (!google || typeof google.load !== 'function' || typeof google.setOnLoadCallback !== 'function') return;
        try {
            google.load('elements', '1', { packages: 'transliteration' });
            google.setOnLoadCallback(function () {
                try {
                    var t = google.elements.transliteration;
                    control = new t.TransliterationControl({
                        sourceLanguage: t.LanguageCode.ENGLISH,
                        destinationLanguage: [t.LanguageCode.URDU],
                        shortcutKey: 'ctrl+g',
                        transliterationEnabled: true
                    });
                    root.writeUrduTransliterationControl = control;
                    register();
                    var host = document.querySelector('[data-bill-items]');
                    if (host && root.MutationObserver) new root.MutationObserver(register).observe(host, { childList: true });
                    document.dispatchEvent(new CustomEvent('write-urdu:transliteration-ready', { detail: { control: control } }));
                } catch (error) { /* optional enhancement */ }
            });
        } catch (error) { /* optional enhancement */ }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
}(window));
