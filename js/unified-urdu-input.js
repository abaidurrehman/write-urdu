(function (root, factory) {
    'use strict';
    var api = factory(root);
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduUnifiedInput = api;
}(typeof window !== 'undefined' ? window : null, function (root) {
    'use strict';

    var CLOSING_PUNCTUATION = /^[,.;:!?،؛؟۔%)\]}]/;
    var OPENING_PUNCTUATION = /[(\[{]$/;

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, Number(value) || 0));
    }

    function needsSpace(left, right) {
        if (!left || !right || /\s$/.test(left) || /^\s/.test(right)) return false;
        if (CLOSING_PUNCTUATION.test(right) || OPENING_PUNCTUATION.test(left)) return false;
        return true;
    }

    function insertTextAtSelection(value, selectionStart, selectionEnd, insertion) {
        var current = String(value == null ? '' : value);
        var start = clamp(selectionStart, 0, current.length);
        var end = clamp(selectionEnd, start, current.length);
        var spoken = String(insertion == null ? '' : insertion).replace(/^\s+|\s+$/g, '');
        if (!spoken) return { value: current, selectionStart: start, selectionEnd: start };

        var prefix = current.slice(0, start);
        var suffix = current.slice(end);
        var committed = (needsSpace(prefix, spoken) ? ' ' : '') + spoken + (needsSpace(spoken, suffix) ? ' ' : '');
        var caret = prefix.length + committed.length;
        return {
            value: prefix + committed + suffix,
            selectionStart: caret,
            selectionEnd: caret
        };
    }

    function eventFor(target, name) {
        var view = target && target.ownerDocument && target.ownerDocument.defaultView;
        var EventConstructor = view && view.Event || root && root.Event;
        if (EventConstructor) return new EventConstructor(name, { bubbles: true });
        return { type: name, bubbles: true };
    }

    function createTextControlAdapter(target) {
        if (!target || typeof target.value === 'undefined') throw new Error('A textarea or input target is required.');

        function selection() {
            var length = String(target.value || '').length;
            var start = typeof target.selectionStart === 'number' ? target.selectionStart : length;
            var end = typeof target.selectionEnd === 'number' ? target.selectionEnd : start;
            return { start: start, end: end };
        }

        return {
            kind: 'text-control',
            isEditable: function () { return !target.disabled && !target.readOnly; },
            getValue: function () { return String(target.value || ''); },
            getSelection: selection,
            focus: function () { if (typeof target.focus === 'function') target.focus(); },
            insertText: function (text) {
                if (!this.isEditable()) return null;
                var currentSelection = selection();
                var result = insertTextAtSelection(target.value, currentSelection.start, currentSelection.end, text);
                target.value = result.value;
                if (typeof target.setSelectionRange === 'function') target.setSelectionRange(result.selectionStart, result.selectionEnd);
                if (typeof target.dispatchEvent === 'function') {
                    target.dispatchEvent(eventFor(target, 'input'));
                    target.dispatchEvent(eventFor(target, 'change'));
                }
                return result;
            }
        };
    }

    return {
        insertTextAtSelection: insertTextAtSelection,
        createTextControlAdapter: createTextControlAdapter
    };
}));
