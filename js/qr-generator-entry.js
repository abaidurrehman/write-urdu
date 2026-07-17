(function (window, document) {
    'use strict';
    function plainTextFromEditor() {
        var active = document.activeElement;
        if (active && typeof active.value === 'string' && active.selectionEnd > active.selectionStart) return active.value.slice(active.selectionStart, active.selectionEnd);
        var textarea = document.querySelector('#transliterateTextarea');
        if (textarea && textarea.value.trim()) return textarea.value;
        var editor = window.tinymce && window.tinymce.get('basic-example');
        if (editor) {
            var selected = editor.selection && editor.selection.getContent({ format: 'text' });
            if (selected && selected.trim()) return selected;
            return editor.getContent({ format: 'text' });
        }
        return '';
    }
    function openQrGenerator() {
        var text = plainTextFromEditor().trim();
        try { window.sessionStorage.setItem('writeUrdu.qrGenerator.incoming', JSON.stringify({ version: 1, type: 'text', text: text, source: 'editor', createdAt: new Date().toISOString() })); } catch (error) { /* blank generator fallback */ }
        window.location.href = window.location.protocol === 'file:' ? 'qr-code-generator.html' : '/qr-code-generator';
    }
    document.addEventListener('click', function (event) { var button = event.target.closest('[data-create-qr]'); if (!button) return; event.preventDefault(); openQrGenerator(); });
    window.WriteUrduQrEntry = { open: openQrGenerator };
}(window, document));
