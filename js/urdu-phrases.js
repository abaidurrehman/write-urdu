(function (root, document) {
    'use strict';
    if (!root || !document) return;

    var search = document.querySelector('[data-phrase-search]');
    var rows = Array.prototype.slice.call(document.querySelectorAll('[data-phrase-row]'));
    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-phrase-filter]'));
    var count = document.querySelector('[data-phrase-count]');
    var empty = document.querySelector('[data-phrase-empty]');
    var status = document.querySelector('[data-phrase-status]');
    var activeFilter = 'all';
    var copyTimers = new WeakMap();

    function normalize(value) {
        return String(value || '').toLocaleLowerCase().replace(/[’'\-_/]+/g, ' ').replace(/\s+/g, ' ').trim();
    }

    function applyFilters() {
        var query = normalize(search && search.value);
        var visible = 0;
        rows.forEach(function (row) {
            var haystack = normalize(row.getAttribute('data-search') || row.textContent);
            var categories = String(row.getAttribute('data-category') || '').split(/\s+/);
            var categoryMatch = activeFilter === 'all' || categories.indexOf(activeFilter) >= 0;
            var queryMatch = !query || haystack.indexOf(query) >= 0 || query.split(' ').every(function (word) { return !word || haystack.indexOf(word) >= 0; });
            var show = categoryMatch && queryMatch;
            row.hidden = !show;
            if (show) visible += 1;
        });
        if (count) count.textContent = visible + (visible === 1 ? ' phrase' : ' phrases');
        if (empty) empty.hidden = visible !== 0;
    }

    function fallbackCopy(text) {
        return new Promise(function (resolve, reject) {
            var field = document.createElement('textarea');
            field.value = text;
            field.setAttribute('readonly', '');
            field.style.position = 'fixed';
            field.style.opacity = '0';
            field.style.pointerEvents = 'none';
            document.body.appendChild(field);
            field.select();
            field.setSelectionRange(0, field.value.length);
            try {
                if (document.execCommand('copy')) resolve();
                else reject(new Error('copy_failed'));
            } catch (error) { reject(error); }
            field.remove();
        });
    }

    function copyText(text) {
        if (root.navigator && root.navigator.clipboard && root.isSecureContext && typeof root.navigator.clipboard.writeText === 'function') {
            return root.navigator.clipboard.writeText(text).catch(function () { return fallbackCopy(text); });
        }
        return fallbackCopy(text);
    }

    function markCopied(button, text) {
        var label = button.querySelector('span') || button;
        var original = button.getAttribute('data-copy-label') || label.textContent || 'Copy';
        button.setAttribute('data-copy-label', original);
        label.textContent = 'Copied';
        button.classList.add('is-copied');
        button.setAttribute('aria-label', 'Copied ' + text);
        if (copyTimers.has(button)) root.clearTimeout(copyTimers.get(button));
        copyTimers.set(button, root.setTimeout(function () {
            label.textContent = original;
            button.classList.remove('is-copied');
            button.setAttribute('aria-label', 'Copy ' + text);
        }, 1600));
        if (status) status.textContent = 'Copied “' + text + '”.';
    }

    function handleCopy(button) {
        var text = String(button.getAttribute('data-copy') || '').trim();
        if (!text) return;
        copyText(text).then(function () { markCopied(button, text); }).catch(function () {
            if (status) status.textContent = 'Copy was unavailable in this browser. Select the phrase and copy it manually.';
        });
    }

    function sendToCardStudio(text) {
        text = String(text || '').trim();
        if (!text) return;
        try {
            root.sessionStorage.setItem('writeUrdu.cardStudio.incoming', JSON.stringify({
                version: 1,
                text: text,
                source: 'urdu-phrase-library',
                createdAt: new Date().toISOString()
            }));
        } catch (error) { /* Card Studio still opens when storage is unavailable. */ }
        root.location.href = '/urdu-card-studio';
    }

    if (search) search.addEventListener('input', applyFilters);
    filters.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-phrase-filter') || 'all';
            filters.forEach(function (item) {
                var selected = item === button;
                item.classList.toggle('is-active', selected);
                item.setAttribute('aria-pressed', selected ? 'true' : 'false');
            });
            applyFilters();
        });
    });

    document.addEventListener('click', function (event) {
        var copyButton = event.target.closest && event.target.closest('[data-copy]');
        if (copyButton) { handleCopy(copyButton); return; }
        var cardButton = event.target.closest && event.target.closest('[data-card-text]');
        if (cardButton) sendToCardStudio(cardButton.getAttribute('data-card-text'));
    });

    applyFilters();
}(window, document));
