(function (root) {
    'use strict';

    function targetIds() {
        return ['cardGalleryText', 'urduCardsOwnText', 'urdu-cards-personalizer-text'].filter(function (id) {
            return Boolean(root.document.getElementById(id));
        });
    }

    var TARGET_IDS = ['cardGalleryText', 'urduCardsOwnText', 'urdu-cards-personalizer-text'];
    var lastSeen = new WeakMap();
    var settleTimers = new WeakMap();

    function isTarget(element) {
        return Boolean(element && element.id && TARGET_IDS.indexOf(element.id) !== -1);
    }

    // Google's control swaps the typed word a moment after the key is released
    // and fires no event, so previews would keep the English letters. Re-read the
    // field shortly after each key and announce the change as a normal `input`.
    function syncSilentConversions() {
        function check(field) {
            if (field.value !== lastSeen.get(field)) field.dispatchEvent(new Event('input', { bubbles: true }));
        }
        root.document.addEventListener('input', function (event) {
            if (isTarget(event.target)) lastSeen.set(event.target, event.target.value);
        }, true);
        root.document.addEventListener('keyup', function (event) {
            var field = event.target;
            if (!isTarget(field)) return;
            var timers = settleTimers.get(field) || [];
            timers.forEach(clearTimeout);
            settleTimers.set(field, [350, 900].map(function (delay) {
                return root.setTimeout(function () { check(field); }, delay);
            }));
        }, true);
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
            syncSilentConversions();
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