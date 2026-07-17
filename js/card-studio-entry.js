(function () {
    'use strict';
    function plainTextFromEditor() {
        var basic = document.getElementById('transliterateTextarea');
        if (basic) {
            var start = basic.selectionStart || 0;
            var end = basic.selectionEnd || 0;
            return (start !== end ? basic.value.slice(start, end) : basic.value).trim();
        }
        if (window.tinymce && tinymce.activeEditor) {
            var editor = tinymce.activeEditor;
            var selected = editor.selection && editor.selection.getContent({ format: 'text' });
            return String((selected && selected.trim()) || editor.getContent({ format: 'text' }) || '').trim();
        }
        var write = document.getElementById('write');
        return write ? String(write.value || '').trim() : '';
    }
    function openStudio(button) {
        var text = plainTextFromEditor();
        try {
            sessionStorage.setItem('writeUrdu.cardStudio.incoming', JSON.stringify({ version: 1, text: text, source: button.getAttribute('data-editor-source') || 'editor', createdAt: new Date().toISOString() }));
        } catch (error) { /* Private browsing: Card Studio can still open blank. */ }
        // Extensionless routes are used in production. Keep local file-based
        // previews and the static Playwright harness usable as well.
        window.location.href = window.location.protocol === 'file:' ? 'urdu-card-studio.html' : '/urdu-card-studio';
    }
    function bind() { document.querySelectorAll('[data-create-card]').forEach(function (button) { button.addEventListener('click', function () { openStudio(button); }); }); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
}());
