(function (root) {
    'use strict';

    function targetIds() {
        return ['cardGalleryText', 'urduCardsOwnText'].filter(function (id) {
            return Boolean(root.document.getElementById(id));
        });
    }

    function ready() {
        try {
            var google = root.google;
            var ids = targetIds();
            if (!ids.length) return;
            var options = {
                sourceLanguage: google.elements.transliteration.LanguageCode.ENGLISH,
                destinationLanguage: [google.elements.transliteration.LanguageCode.URDU],
                shortcutKey: 'ctrl+g',
                transliterationEnabled: true
            };
            var control = new google.elements.transliteration.TransliterationControl(options);
            control.makeTransliteratable(ids);
            root.writeUrduTransliterationControl = control;
            root.document.dispatchEvent(new CustomEvent('write-urdu:transliteration-ready', { detail: { control: control } }));
        } catch (error) { /* Google transliteration unavailable; direct Urdu input still works. */ }
    }

    function init() {
        var google = root.google;
        if (!google || typeof google.load !== 'function' || typeof google.setOnLoadCallback !== 'function') return;
        try {
            google.load('elements', '1', { packages: 'transliteration' });
            google.setOnLoadCallback(ready);
        } catch (error) { /* optional enhancement */ }
    }

    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', init);
    else init();
}(window));