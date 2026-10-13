(function (root) {
    'use strict';

    // Mounts the shared English letters → Urdu engine (input-mode.js + the Google control) on
    // the wedding maker's free-text fields. Wedding state and rendering stay in
    // urdu-wedding-invitation-maker.js; this file only registers fields. Conversion defaults
    // to off ("Type Urdu directly") so English names are never converted unless asked.
    var document = root.document;
    var FIELD_SELECTOR = '[data-wm-urdu-input]';
    var counter = 0;
    var control = null;

    function register() {
        if (!control) return;
        var ids = [];
        document.querySelectorAll(FIELD_SELECTOR).forEach(function (field) {
            if (field.dataset.wmUrduRegistered === 'true') return;
            if (!field.id) field.id = 'weddingUrduField' + (counter += 1);
            field.dataset.wmUrduRegistered = 'true';
            ids.push(field.id);
        });
        if (ids.length) {
            try { control.makeTransliteratable(ids); } catch (error) { /* direct typing keeps working */ }
        }
        if (root.WriteUrduInputMode && root.WriteUrduInputMode.refresh) root.WriteUrduInputMode.refresh();
    }

    function init() {
        var google = root.google;
        document.addEventListener('write-urdu:wedding-fields-changed', register);
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
                    document.dispatchEvent(new CustomEvent('write-urdu:transliteration-ready', { detail: { control: control } }));
                } catch (error) { /* optional enhancement */ }
            });
        } catch (error) { /* optional enhancement */ }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
}(window));
