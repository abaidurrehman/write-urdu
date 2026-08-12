(function () {
    'use strict';
    var core = window.WriteUrduStylishText, root = document.querySelector('[data-stylish-generator]');
    if (!core || !root) return;
    var textarea = document.getElementById('stylishText'), grid = root.querySelector('[data-stylish-results]'), count = root.querySelector('[data-stylish-count]'), status = root.querySelector('[data-stylish-status]');
    var query = root.querySelector('[data-stylish-query]'), category = root.querySelector('[data-stylish-category]'), intensity = root.querySelector('[data-stylish-intensity]');
    var offset = 0, timer = 0;
    var INCOMING_KEY = 'writeUrdu.stylishText.incoming.v1';
    var state = { favorites: readList(core.STORAGE_KEYS.favorites), recents: readList(core.STORAGE_KEYS.recents), collections: readObject(core.STORAGE_KEYS.collections) };
    function readList(key) { try { var value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; } catch (error) { return []; } }
    function readObject(key) { try { var value = JSON.parse(localStorage.getItem(key) || '{}'); return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; } catch (error) { return {}; } }
    function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (error) { return false; } }
    function setStatus(message) { if (status) status.textContent = message || ''; }
    function readIncoming() {
        var incoming = null;
        try {
            incoming = JSON.parse(sessionStorage.getItem(INCOMING_KEY) || 'null');
            sessionStorage.removeItem(INCOMING_KEY);
        } catch (error) { incoming = null; }
        var created = incoming && Date.parse(incoming.createdAt || '');
        if (!incoming || incoming.version !== 1 || typeof incoming.text !== 'string' || !incoming.text.trim()) return null;
        if (!created || Date.now() - created > 30 * 60 * 1000) return null;
        return core.normalizeText(incoming.text).value;
    }
    function copy(value) { if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(value); var input = document.createElement('textarea'); input.value = value; input.style.position = 'fixed'; input.style.opacity = '0'; document.body.appendChild(input); input.select(); try { document.execCommand('copy'); } catch (error) {} input.remove(); return Promise.resolve(); }
    function shareOutput(item) {
        if (navigator.share) {
            return Promise.resolve(navigator.share({ title: item.name + ' – Stylish Urdu', text: item.output }))
                .then(function () { setStatus('Share sheet opened for “' + item.name + '”.'); })
                .catch(function (error) { if (error && error.name !== 'AbortError') setStatus('Sharing was unavailable. Copy the style instead.'); });
        }
        return copy(item.output).then(function () { setStatus('Style copied for sharing.'); });
    }
    function getOptions() { return { category: category ? category.value : 'all', intensity: intensity ? intensity.value : 'all', query: query ? query.value : '', offset: offset, limit: 24 }; }
    function render(reset) {
        if (reset) offset = 0;
        var result = core.generateStyles(textarea.value, getOptions());
        if (reset) grid.innerHTML = '';
        result.items.forEach(function (item) {
            var card = document.createElement('article'); card.className = 'stylish-card'; card.dataset.styleId = item.id;
            var preview = document.createElement('div'); preview.className = 'stylish-card-preview'; preview.dir = 'auto'; preview.textContent = item.output; card.appendChild(preview);
            var meta = document.createElement('div'); meta.className = 'stylish-card-meta';
            var name = document.createElement('span'); name.className = 'stylish-card-name'; name.textContent = item.name; meta.appendChild(name);
            var badge = document.createElement('span'); badge.className = 'stylish-badge'; badge.textContent = item.compatibility; meta.appendChild(badge); card.appendChild(meta);
            var actions = document.createElement('div'); actions.className = 'stylish-card-actions';
            function button(label, handler, primary) { var b = document.createElement('button'); b.type = 'button'; b.textContent = label; if (primary) b.className = 'primary'; b.addEventListener('click', handler); actions.appendChild(b); }
            button('Copy', function () { copy(item.output).then(function () { setStatus('Copied “' + item.name + '”.'); }); }, true);
            button(state.favorites.indexOf(item.id) >= 0 ? '★ Saved' : '☆ Favorite', function () { var index = state.favorites.indexOf(item.id); if (index >= 0) state.favorites.splice(index, 1); else state.favorites.push(item.id); save(core.STORAGE_KEYS.favorites, state.favorites); render(true); setStatus(index >= 0 ? 'Removed from favorites.' : 'Saved to favorites.'); });
            button('Collection', function () { var collectionName = window.prompt('Collection name', 'My Urdu styles'); if (!collectionName) return; if (!Array.isArray(state.collections[collectionName])) state.collections[collectionName] = []; if (state.collections[collectionName].indexOf(item.id) < 0) state.collections[collectionName].push(item.id); save(core.STORAGE_KEYS.collections, state.collections); setStatus('Added to “' + collectionName + '”.'); });
            button('Share', function () { shareOutput(item); });
            button('Name Art', function () { var handoff = core.createHandoff(item.output); try { sessionStorage.setItem(core.STORAGE_KEYS.handoff, JSON.stringify(handoff)); } catch (error) {} window.location.href = '/urdu-name-art-maker'; });
            card.appendChild(actions); grid.appendChild(card);
        });
        offset += result.items.length;
        if (count) count.textContent = result.total ? result.total + ' styles ready' : 'No styles match this filter.';
        var more = root.querySelector('[data-stylish-more]'); if (more) more.hidden = !result.hasMore;
        if (!result.total && grid) { var empty = document.createElement('p'); empty.className = 'stylish-card'; empty.textContent = 'Try another category or a shorter search.'; grid.appendChild(empty); }
    }
    function saveRecentInput() {
        var normalized = core.normalizeText(textarea.value);
        state.recents = [normalized.value].concat(state.recents.filter(function (item) { return item !== normalized.value; })).filter(Boolean).slice(0, 10);
        save(core.STORAGE_KEYS.recents, state.recents);
    }
    function schedule() { window.clearTimeout(timer); timer = window.setTimeout(function () { render(true); saveRecentInput(); }, 180); }
    textarea.addEventListener('input', schedule);
    if (query) query.addEventListener('input', function () { render(true); });
    [category, intensity].forEach(function (input) { if (input) input.addEventListener('change', function () { render(true); }); });
    root.querySelectorAll('[data-stylish-example]').forEach(function (button) { button.addEventListener('click', function () { textarea.value = button.getAttribute('data-stylish-example') || ''; textarea.dispatchEvent(new Event('input', { bubbles: true })); textarea.focus(); }); });
    root.querySelector('[data-stylish-generate]').addEventListener('click', function () { var normalized = core.normalizeText(textarea.value); textarea.value = normalized.value; render(true); saveRecentInput(); setStatus(normalized.truncated ? 'Text was shortened to 100 grapheme clusters.' : 'Styles refreshed.'); });
    root.querySelector('[data-stylish-clear]').addEventListener('click', function () { textarea.value = ''; render(true); textarea.focus(); setStatus('Text cleared.'); });
    root.querySelector('[data-stylish-surprise]').addEventListener('click', function () { var examples = ['زندگی ایک خوب صورت سفر ہے۔', 'آج کا دن ایک نئی شروعات ہے۔', 'Abaid Rehman']; textarea.value = examples[Math.floor(Math.random() * examples.length)]; render(true); saveRecentInput(); });
    root.querySelector('[data-stylish-more]').addEventListener('click', function () { render(false); });
    root.querySelector('[data-stylish-share]').addEventListener('click', function () { var value = core.normalizeText(textarea.value).value; if (!value) return setStatus('Add text before sharing.'); if (navigator.share) navigator.share({ title: 'Stylish Urdu text', text: value }).catch(function () {}); else copy(value).then(function () { setStatus('Text copied for sharing.'); }); });
    function initTransliteration() { if (!window.google || !google.load || !google.setOnLoadCallback) return; try { google.load('elements', '1', { packages: 'transliteration' }); google.setOnLoadCallback(function () { try { var control = new google.elements.transliteration.TransliterationControl({ sourceLanguage: google.elements.transliteration.LanguageCode.ENGLISH, destinationLanguage: [google.elements.transliteration.LanguageCode.URDU], shortcutKey: 'ctrl+g', transliterationEnabled: true }); control.makeTransliteratable(['stylishText']); window.writeUrduTransliterationControl = control; document.dispatchEvent(new CustomEvent('write-urdu:transliteration-ready', { detail: { control: control } })); } catch (error) {} }); } catch (error) {} }
    var incomingText = readIncoming();
    if (incomingText) textarea.value = incomingText;
    initTransliteration();
    render(true);
    if (incomingText) { saveRecentInput(); setStatus('Your editor text is ready to style.'); }
}());
