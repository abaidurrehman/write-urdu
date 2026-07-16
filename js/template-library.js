(function () {
    'use strict';
    var library = window.WriteUrduTemplateLibrary;
    var root = document.querySelector('[data-template-library]');
    if (!library || !root) return;

    var FAVORITES_KEY = 'writeUrdu.templateFavorites.v1';
    var RECENTS_KEY = 'writeUrdu.templateRecents.v1';
    var state = { query: '', category: 'all', size: 'all', sort: 'featured', favoritesOnly: false };
    var favorites = readList(FAVORITES_KEY);
    var recents = readList(RECENTS_KEY);
    var grid = root.querySelector('[data-template-grid]');
    var recentGrid = root.querySelector('[data-template-recent-grid]');
    var recentSection = root.querySelector('[data-template-recent-section]');
    var skeleton = root.querySelector('[data-template-skeleton]');
    var empty = root.querySelector('[data-template-empty]');
    var resultCount = root.querySelector('[data-template-result-count]');
    var search = root.querySelector('[data-template-search]');
    var categoryRow = root.querySelector('[data-template-categories]');
    var sizeSelect = root.querySelector('[data-template-size]');
    var sortSelect = root.querySelector('[data-template-sort]');
    var favoritesToggle = root.querySelector('[data-template-favorites]');
    var clearButton = root.querySelector('[data-template-clear]');

    function readList(key) {
        try {
            var value = JSON.parse(localStorage.getItem(key) || '[]');
            return Array.isArray(value) ? value.filter(function (item) { return typeof item === 'string'; }) : [];
        } catch (error) { return []; }
    }
    function writeList(key, list) {
        try { localStorage.setItem(key, JSON.stringify(list)); } catch (error) { /* private browsing */ }
    }
    function isFavorite(id) { return favorites.indexOf(id) !== -1; }
    function dimensionsFilter(template) {
        var width = template.canvas.width; var height = template.canvas.height;
        if (state.size === 'square') return width === height;
        if (state.size === 'story') return height > width;
        if (state.size === 'landscape') return width > height;
        return true;
    }
    function filteredTemplates() {
        var query = state.query.trim().toLowerCase();
        var result = library.TEMPLATES.filter(function (template) {
            if (state.category !== 'all' && template.category !== state.category) return false;
            if (!dimensionsFilter(template)) return false;
            if (state.favoritesOnly && !isFavorite(template.id)) return false;
            if (!query) return true;
            var haystack = [template.name, template.nameUrdu, template.description, template.category].concat(template.tags).join(' ').toLowerCase();
            return haystack.indexOf(query) !== -1;
        });
        result.sort(function (a, b) {
            if (state.sort === 'newest') return String(b.updatedAt).localeCompare(String(a.updatedAt)) || a.name.localeCompare(b.name);
            if (state.sort === 'name') return a.name.localeCompare(b.name);
            return Number(b.featured) - Number(a.featured) || String(b.updatedAt).localeCompare(String(a.updatedAt)) || a.name.localeCompare(b.name);
        });
        return result;
    }
    function createCard(template) {
        var card = document.createElement('article'); card.className = 'template-card'; card.dataset.templateId = template.id;
        var preview = document.createElement('div'); preview.className = 'template-card-preview'; preview.style.backgroundColor = template.canvas.backgroundColor;
        var image = document.createElement('img'); image.src = template.thumbnail; image.width = 1200; image.height = 630; image.loading = 'lazy'; image.decoding = 'async'; image.alt = template.name + ' Urdu design template preview'; preview.appendChild(image);
        var previewCopy = document.createElement('div'); previewCopy.className = 'template-card-preview-copy'; previewCopy.setAttribute('lang', 'ur'); previewCopy.setAttribute('dir', 'rtl'); previewCopy.textContent = template.nameUrdu || 'اپنا اردو متن لکھیں'; preview.appendChild(previewCopy); card.appendChild(preview);
        var body = document.createElement('div'); body.className = 'template-card-body';
        var titleRow = document.createElement('div'); titleRow.className = 'template-card-title-row';
        var title = document.createElement('h3'); title.textContent = template.name; titleRow.appendChild(title);
        var favorite = document.createElement('button'); favorite.type = 'button'; favorite.className = 'template-favorite'; favorite.dataset.templateFavorite = template.id; favorite.setAttribute('aria-pressed', String(isFavorite(template.id))); favorite.setAttribute('aria-label', (isFavorite(template.id) ? 'Remove ' : 'Add ') + template.name + ' ' + (isFavorite(template.id) ? 'from favorites' : 'to favorites')); favorite.textContent = isFavorite(template.id) ? '★' : '☆'; titleRow.appendChild(favorite); body.appendChild(titleRow);
        var category = document.createElement('p'); category.className = 'template-card-category'; category.textContent = library.getCategoryLabel(template.category); body.appendChild(category);
        var description = document.createElement('p'); description.className = 'template-card-description'; description.textContent = template.description; body.appendChild(description);
        var footer = document.createElement('div'); footer.className = 'template-card-footer'; var size = document.createElement('span'); size.className = 'template-card-size'; size.textContent = library.dimensionsLabel(template); footer.appendChild(size); var open = document.createElement('button'); open.type = 'button'; open.className = 'template-open'; open.dataset.templateOpen = template.slug; open.textContent = 'Edit template'; footer.appendChild(open); body.appendChild(footer); card.appendChild(body);
        return card;
    }
    function renderRecent() {
        var templates = recents.map(library.getTemplateBySlug).filter(Boolean).slice(0, 6);
        recentGrid.replaceChildren();
        recentSection.hidden = !templates.length;
        templates.forEach(function (template) { recentGrid.appendChild(createCard(template)); });
    }
    function render() {
        var templates = filteredTemplates();
        grid.replaceChildren();
        templates.forEach(function (template) { grid.appendChild(createCard(template)); });
        empty.hidden = templates.length !== 0;
        resultCount.textContent = templates.length + ' template' + (templates.length === 1 ? '' : 's') + ' available';
        resultCount.setAttribute('aria-live', 'polite');
        favoritesToggle.setAttribute('aria-pressed', String(state.favoritesOnly));
        favoritesToggle.textContent = state.favoritesOnly ? 'Showing favorites' : 'Favorites';
        skeleton.hidden = true;
        renderRecent();
    }
    function addRecent(template) {
        recents = [template.slug].concat(recents.filter(function (slug) { return slug !== template.slug; })).slice(0, 8);
        writeList(RECENTS_KEY, recents); renderRecent();
    }
    function toggleFavorite(id) {
        if (isFavorite(id)) favorites = favorites.filter(function (item) { return item !== id; });
        else favorites.unshift(id);
        writeList(FAVORITES_KEY, favorites); render();
    }
    function openTemplate(slug) {
        var template = library.getTemplateBySlug(slug); if (!template) return;
        addRecent(template); window.location.href = '/urdu-card-studio?template=' + encodeURIComponent(template.slug);
    }
    function renderCategories() {
        categoryRow.replaceChildren();
        var all = document.createElement('button'); all.type = 'button'; all.className = 'template-filter-button'; all.dataset.templateCategory = 'all'; all.textContent = 'All templates'; categoryRow.appendChild(all);
        library.CATEGORIES.forEach(function (category) { var button = document.createElement('button'); button.type = 'button'; button.className = 'template-filter-button'; button.dataset.templateCategory = category.id; button.textContent = category.shortLabel; categoryRow.appendChild(button); });
        updateCategoryButtons();
    }
    function updateCategoryButtons() { categoryRow.querySelectorAll('[data-template-category]').forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.templateCategory === state.category)); }); }
    root.addEventListener('click', function (event) {
        var favorite = event.target.closest('[data-template-favorite]'); if (favorite) { event.preventDefault(); toggleFavorite(favorite.dataset.templateFavorite); return; }
        var open = event.target.closest('[data-template-open]'); if (open) { event.preventDefault(); openTemplate(open.dataset.templateOpen); return; }
        var category = event.target.closest('[data-template-category]'); if (category) { state.category = category.dataset.templateCategory; updateCategoryButtons(); render(); return; }
        if (event.target.closest('[data-template-clear]')) { state = { query: '', category: 'all', size: 'all', sort: 'featured', favoritesOnly: false }; search.value = ''; sizeSelect.value = 'all'; sortSelect.value = 'featured'; updateCategoryButtons(); render(); }
        if (event.target.closest('[data-template-favorites]')) { state.favoritesOnly = !state.favoritesOnly; render(); }
    });
    search.addEventListener('input', function () { state.query = search.value; render(); });
    sizeSelect.addEventListener('change', function () { state.size = sizeSelect.value; render(); });
    sortSelect.addEventListener('change', function () { state.sort = sortSelect.value; render(); });
    renderCategories();
    window.setTimeout(render, 80);
    document.dispatchEvent(new CustomEvent('write-urdu:templates-rendered', { detail: { count: library.TEMPLATES.length } }));
    window.WriteUrduTemplateLibraryApp = { getState: function () { return state; }, getTemplates: function () { return library.TEMPLATES.slice(); }, clearFavorites: function () { favorites = []; writeList(FAVORITES_KEY, favorites); render(); }, clearRecents: function () { recents = []; writeList(RECENTS_KEY, recents); renderRecent(); } };
}());
