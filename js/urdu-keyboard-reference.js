(function () {
    'use strict';

    var root = document.querySelector('[data-physical-key-reference]');
    var Core = window.WriteUrduTypingPracticeCore;
    if (!root || !Core) return;

    var rows = root.querySelector('[data-key-reference-rows]');
    var modeButtons = root.querySelectorAll('[data-key-reference-mode]');
    var shiftKeys = {
        '`': '~', '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
        '6': '^', '7': '&', '8': '*', '9': '(', '0': ')', '-': '_', '=': '+',
        '[': '{', ']': '}', '\\': '|', ';': ':', "'": '"', ',': '<', '.': '>', '/': '?'
    };
    var mode = 'base';

    function shiftedKey(key) {
        return shiftKeys[key] || key.toUpperCase();
    }

    function render() {
        rows.replaceChildren();
        Core.KEYBOARD_ROWS.forEach(function (row) {
            var rowNode = document.createElement('div');
            rowNode.className = 'physical-key-reference-row';
            row.forEach(function (baseKey) {
                var lookup = mode === 'shift' ? shiftedKey(baseKey) : baseKey;
                var glyph = mode === 'shift' ? Core.SHIFT_MAP[lookup] : Core.BASE_MAP[baseKey];
                var keyNode = document.createElement('div');
                keyNode.className = 'physical-key-reference-key';

                var latin = document.createElement('kbd');
                latin.textContent = mode === 'shift' ? 'Shift+' + lookup : baseKey.toUpperCase();
                var urdu = document.createElement('span');
                urdu.lang = 'ur';
                urdu.dir = 'rtl';
                urdu.textContent = glyph || '—';

                keyNode.append(latin, urdu);
                rowNode.appendChild(keyNode);
            });
            rows.appendChild(rowNode);
        });
    }

    modeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            mode = button.getAttribute('data-key-reference-mode') === 'shift' ? 'shift' : 'base';
            modeButtons.forEach(function (candidate) {
                candidate.setAttribute('aria-pressed', candidate === button ? 'true' : 'false');
            });
            render();
        });
    });

    render();
}());
