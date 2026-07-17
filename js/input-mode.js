(function () {
    'use strict';

    var STORAGE_PREFIX = 'write-urdu:input-mode:v1:';
    var currentControl = null;
    var copy = {
        en: {
            title: 'Input mode',
            roman: 'Roman Urdu → Urdu',
            direct: 'Direct Urdu / English',
            romanNote: 'Type Roman Urdu and press Space to convert each word.',
            directNote: 'Type or paste Urdu or English directly. Existing text is kept unchanged.'
        },
        ur: {
            title: 'تحریر کا طریقہ',
            roman: 'رومن اردو → اردو',
            direct: 'براہِ راست اردو / انگریزی',
            romanNote: 'رومن اردو لکھیں اور ہر لفظ کو تبدیل کرنے کے لیے Space دبائیں۔',
            directNote: 'اردو یا انگریزی براہِ راست لکھیں یا پیسٹ کریں۔ موجودہ متن تبدیل نہیں ہوگا۔'
        }
    };

    function locale() {
        return window.WriteUrduLocale && typeof window.WriteUrduLocale.get === 'function' && window.WriteUrduLocale.get() === 'ur' ? 'ur' : 'en';
    }

    function text(key) {
        return copy[locale()][key];
    }

    function storageKey(root) {
        return STORAGE_PREFIX + (root.getAttribute('data-input-mode-storage') || 'default');
    }

    function readMode(root) {
        var stored = null;
        try { stored = window.localStorage.getItem(storageKey(root)); } catch (error) { /* private browsing */ }
        return stored === 'direct' || stored === 'roman' ? stored : (root.getAttribute('data-input-mode-default') === 'direct' ? 'direct' : 'roman');
    }

    function targets(root) {
        var selectors = (root.getAttribute('data-input-mode-targets') || '').split(',').map(function (value) { return value.trim(); }).filter(Boolean);
        var result = [];
        selectors.forEach(function (selector) {
            try { document.querySelectorAll(selector).forEach(function (element) { if (result.indexOf(element) < 0) result.push(element); }); } catch (error) { /* invalid optional selector */ }
        });
        return result;
    }

    function setFrameDirection(frame, mode) {
        if (!frame || !frame.contentDocument) return;
        var documentElement = frame.contentDocument.documentElement;
        var body = frame.contentDocument.body;
        if (documentElement) documentElement.dir = mode === 'roman' ? 'rtl' : 'auto';
        if (body) body.dir = mode === 'roman' ? 'rtl' : 'auto';
    }

    function syncTarget(target, mode) {
        if (target.tagName === 'IFRAME') {
            setFrameDirection(target, mode);
            if (!target.dataset.inputModeBound) {
                target.addEventListener('load', function () { setFrameDirection(target, mode); });
                target.dataset.inputModeBound = 'true';
            }
            return;
        }
        target.setAttribute('dir', mode === 'roman' ? 'rtl' : 'auto');
        // The editor remains Urdu-first in both modes; `dir="auto"` lets
        // English sentences naturally flow left-to-right when direct input is
        // selected without changing the document's language semantics.
        target.setAttribute('lang', 'ur');
        target.dataset.inputMode = mode;
        if (mode === 'roman') {
            target.setAttribute('data-input-mode-placeholder', target.getAttribute('placeholder') || '');
            if (target.id === 'transliterateTextarea' || target.id === 'cardText' || target.id === 'cardCanvasEditor') target.setAttribute('placeholder', locale() === 'ur' ? 'رومن اردو لکھیں…' : 'Type Roman Urdu…');
        } else if (target.id === 'transliterateTextarea' || target.id === 'cardText' || target.id === 'cardCanvasEditor') {
            target.setAttribute('placeholder', locale() === 'ur' ? 'اردو یا انگریزی براہِ راست لکھیں…' : 'Type Urdu or English directly…');
        }
    }

    function setTransliteration(mode) {
        var control = currentControl || window.writeUrduTransliterationControl;
        if (!control) return;
        try {
            if (mode === 'roman' && typeof control.enableTransliteration === 'function') control.enableTransliteration();
            if (mode === 'direct' && typeof control.disableTransliteration === 'function') control.disableTransliteration();
        } catch (error) { /* The optional Google control may be unavailable or still loading. */ }
    }

    function render(root, mode) {
        root.dataset.inputMode = mode;
        root.querySelectorAll('[data-input-mode-option]').forEach(function (button) {
            var active = button.getAttribute('data-input-mode-option') === mode;
            button.setAttribute('aria-pressed', String(active));
            button.classList.toggle('is-active', active);
        });
        var title = root.querySelector('[data-input-mode-title]');
        var note = root.querySelector('[data-input-mode-note]');
        var roman = root.querySelector('[data-input-mode-option="roman"]');
        var direct = root.querySelector('[data-input-mode-option="direct"]');
        if (title) title.textContent = text('title');
        if (roman) roman.textContent = text('roman');
        if (direct) direct.textContent = text('direct');
        if (note) note.textContent = mode === 'roman' ? text('romanNote') : text('directNote');
        targets(root).forEach(function (target) { syncTarget(target, mode); });
        setTransliteration(mode);
    }

    function persist(root, mode) {
        try { window.localStorage.setItem(storageKey(root), mode); } catch (error) { /* private browsing */ }
    }

    function setMode(root, mode) {
        if (mode !== 'direct' && mode !== 'roman') return;
        persist(root, mode);
        render(root, mode);
        root.dispatchEvent(new CustomEvent('write-urdu:input-mode-change', { bubbles: true, detail: { mode: mode } }));
    }

    function bindShortcut(root) {
        targets(root).forEach(function (target) {
            if (target.dataset.inputModeShortcutBound || target.tagName === 'IFRAME') return;
            target.addEventListener('keydown', function (event) {
                if (!(event.ctrlKey || event.metaKey) || String(event.key).toLowerCase() !== 'g') return;
                event.preventDefault();
                event.stopPropagation();
                setMode(root, root.dataset.inputMode === 'roman' ? 'direct' : 'roman');
            }, true);
            target.dataset.inputModeShortcutBound = 'true';
        });
    }

    function bind(root) {
        if (root.dataset.inputModeBound) return;
        root.dataset.inputModeBound = 'true';
        root.querySelectorAll('[data-input-mode-option]').forEach(function (button) {
            button.addEventListener('click', function () { setMode(root, button.getAttribute('data-input-mode-option')); });
        });
        render(root, readMode(root));
        bindShortcut(root);
    }

    function bindAll() { document.querySelectorAll('[data-input-mode-control]').forEach(bind); }

    window.WriteUrduInputMode = {
        get: function (root) { return root ? root.dataset.inputMode || readMode(root) : null; },
        set: function (mode, root) {
            root = root || document.querySelector('[data-input-mode-control]');
            if (root) setMode(root, mode);
        },
        refresh: bindAll
    };

    document.addEventListener('write-urdu:transliteration-ready', function (event) {
        currentControl = event.detail && event.detail.control || window.writeUrduTransliterationControl || null;
        bindAll();
        document.querySelectorAll('[data-input-mode-control]').forEach(function (root) { render(root, root.dataset.inputMode || readMode(root)); bindShortcut(root); });
    });
    document.addEventListener('write-urdu:locale-change', bindAll);
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindAll);
    else bindAll();
}());
