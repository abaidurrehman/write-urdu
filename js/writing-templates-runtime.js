(function (root, factory) {
    'use strict';
    var catalog = root && root.WriteUrduWritingTemplateCatalog;
    if (typeof module === 'object' && module.exports) catalog = require('./writing-template-catalog.js');
    var api = factory(root, catalog || []);
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduWritingTemplates = api;
}(typeof window !== 'undefined' ? window : null, function (root, TEMPLATES) {
    'use strict';

    var CATEGORIES = [
        { id: 'all', label: 'All templates' }, { id: 'school', label: 'School' },
        { id: 'office', label: 'Office' }, { id: 'applications', label: 'Applications' },
        { id: 'business', label: 'Business' }, { id: 'personal', label: 'Personal' }
    ];

    function getTemplate(id) { return TEMPLATES.find(function (template) { return template.id === id; }) || null; }
    function searchTemplates(query, category) {
        var q = String(query || '').trim().toLowerCase();
        var selected = category || 'all';
        return TEMPLATES.filter(function (template) {
            if (selected !== 'all' && template.category !== selected) return false;
            if (!q) return true;
            return [template.title, template.titleUrdu, template.description].concat(template.keywords || []).join(' ').toLowerCase().indexOf(q) !== -1;
        });
    }
    function copyText(text) {
        if (root && root.navigator && root.navigator.clipboard && typeof root.navigator.clipboard.writeText === 'function') return root.navigator.clipboard.writeText(text);
        return Promise.reject(new Error('clipboard_unavailable'));
    }
    function transfer(text, targetWorkspace, actionId) {
        var handoff = root && root.WriteUrduWorkspaceHandoff;
        if (!handoff || typeof handoff.transfer !== 'function') return { ok: false, reason: 'handoff-unavailable' };
        return handoff.transfer({ sourceWorkspace: 'templates', sourceRoute: '/urdu-writing-templates', targetWorkspace: targetWorkspace, kind: 'plain-text', payload: { text: String(text || '') }, actionId: actionId });
    }

    function mount() {
        if (!root || !root.document) return null;
        var scope = root.document.querySelector('[data-writing-templates]');
        if (!scope || !TEMPLATES.length) return null;
        var grid = scope.querySelector('[data-writing-template-grid]');
        var search = scope.querySelector('[data-writing-template-search]');
        var categories = scope.querySelector('[data-writing-template-categories]');
        var count = scope.querySelector('[data-writing-template-count]');
        var empty = scope.querySelector('[data-writing-template-empty]');
        var editor = scope.querySelector('[data-writing-template-editor]');
        var editorTitle = scope.querySelector('[data-writing-template-editor-title]');
        var editorMeta = scope.querySelector('[data-writing-template-editor-meta]');
        var selectedSection = scope.querySelector('[data-writing-template-selected]');
        var copyButton = scope.querySelector('[data-writing-template-copy]');
        var writerButton = scope.querySelector('[data-writing-template-writer]');
        var richButton = scope.querySelector('[data-writing-template-rich]');
        var resetButton = scope.querySelector('[data-writing-template-reset]');
        var notice = scope.querySelector('[data-writing-template-notice]');
        var state = { query: '', category: 'all', selectedId: null, originalText: '' };

        function setNotice(message, kind) { if (notice) { notice.textContent = message || ''; notice.dataset.state = kind || ''; } }
        function selectTemplate(id, focus) {
            var template = getTemplate(id); if (!template) return;
            state.selectedId = id; state.originalText = template.body; editor.value = template.body;
            editorTitle.textContent = template.titleUrdu; editorMeta.textContent = template.title + ' · Edit the placeholders before using it.';
            selectedSection.hidden = false; setNotice('', '');
            if (focus) { selectedSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); root.setTimeout(function () { editor.focus(); }, 250); }
        }
        function card(template) {
            var article = root.document.createElement('article'); article.className = 'writing-template-card'; article.dataset.templateId = template.id;
            var category = CATEGORIES.find(function (item) { return item.id === template.category; });
            article.innerHTML = '<span class="writing-template-badge"></span><h3 lang="ur" dir="rtl"></h3><p class="writing-template-english-title"></p><p class="writing-template-description"></p><p class="writing-template-preview" lang="ur" dir="rtl"></p>';
            article.children[0].textContent = category ? category.label : template.category;
            article.children[1].textContent = template.titleUrdu; article.children[2].textContent = template.title;
            article.children[3].textContent = template.description; article.children[4].textContent = template.body.split('\n').filter(Boolean).slice(0, 3).join(' ');
            var button = root.document.createElement('button'); button.type = 'button'; button.className = 'urdu-tool-button primary'; button.dataset.writingTemplateOpen = template.id; button.textContent = 'Use this template'; article.appendChild(button);
            return article;
        }
        function renderCategories() {
            categories.replaceChildren(); CATEGORIES.forEach(function (category) {
                var button = root.document.createElement('button'); button.type = 'button'; button.className = 'writing-template-filter'; button.dataset.writingTemplateCategory = category.id; button.setAttribute('aria-pressed', String(state.category === category.id)); button.textContent = category.label; categories.appendChild(button);
            });
        }
        function render() {
            var templates = searchTemplates(state.query, state.category); grid.replaceChildren(); templates.forEach(function (template) { grid.appendChild(card(template)); });
            count.textContent = templates.length + ' writing template' + (templates.length === 1 ? '' : 's'); empty.hidden = templates.length !== 0; renderCategories();
        }

        scope.addEventListener('click', function (event) {
            var category = event.target.closest('[data-writing-template-category]'); if (category) { state.category = category.dataset.writingTemplateCategory; render(); return; }
            var open = event.target.closest('[data-writing-template-open]'); if (open) selectTemplate(open.dataset.writingTemplateOpen, true);
        });
        search.addEventListener('input', function () { state.query = search.value; render(); });
        resetButton.addEventListener('click', function () { if (!getTemplate(state.selectedId)) return; editor.value = state.originalText; setNotice('Template reset to its original wording.', 'success'); editor.focus(); });
        copyButton.addEventListener('click', async function () { var text = String(editor.value || '').trim(); if (!text) return; try { await copyText(text); setNotice('Template copied.', 'success'); } catch (error) { editor.focus(); editor.select(); setNotice('Select the template text and copy it from your browser.', 'info'); } });
        writerButton.addEventListener('click', function () { var text = String(editor.value || '').trim(); if (!text) return; var result = transfer(text, 'basic-writer', 'writing-template-to-basic'); if (result && result.ok && result.route) return root.location.assign(result.route); setNotice('Copy the template, then open WriteUrdu to continue.', 'info'); });
        richButton.addEventListener('click', function () { var text = String(editor.value || '').trim(); if (!text) return; var result = transfer(text, 'rich-editor', 'writing-template-to-rich'); if (result && result.ok && result.route) return root.location.assign(result.route); setNotice('Copy the template, then open the Urdu editor to format it.', 'info'); });

        render(); selectTemplate(TEMPLATES[0].id, false); return { state: state, editor: editor };
    }

    if (root && root.document) { if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', mount); else mount(); }
    return { CATEGORIES: CATEGORIES, TEMPLATES: TEMPLATES, getTemplate: getTemplate, searchTemplates: searchTemplates, transfer: transfer, mount: mount };
}));
