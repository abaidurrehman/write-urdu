(function (root) {
    'use strict';

    var document = root.document;
    var section = document.querySelector('[data-whatsapp-status-discovery]');
    var data = root.WriteUrduCardsData;
    if (!section || !data || typeof data.getAllCards !== 'function') return;

    var STATUS_CATEGORIES = [
        { id: 'all', label: 'Popular', labelUr: 'مقبول' },
        { id: 'morning', label: 'Morning', labelUr: 'صبح بخیر' },
        { id: 'jumma', label: 'Jumma', labelUr: 'جمعہ مبارک' },
        { id: 'dua', label: 'Dua', labelUr: 'دعا' },
        { id: 'love', label: 'Love', labelUr: 'محبت' },
        { id: 'friendship', label: 'Friendship', labelUr: 'دوستی' },
        { id: 'poetry-quote', label: 'Poetry & Quotes', labelUr: 'شاعری' },
        { id: 'night', label: 'Night', labelUr: 'شب بخیر' }
    ];
    var CATEGORY_IDS = STATUS_CATEGORIES.slice(1).map(function (item) { return item.id; });
    var grid = section.querySelector('[data-whatsapp-status-grid]');
    var filters = section.querySelector('[data-whatsapp-status-filters]');
    var status = section.querySelector('[data-whatsapp-status-status]');
    var activeCategory = 'all';

    function track(name, detail) {
        try {
            if (root.WriteUrduTelemetry && typeof root.WriteUrduTelemetry.track === 'function') {
                root.WriteUrduTelemetry.track(name, detail || {});
            }
        } catch (error) {}
    }

    function safeCard(card) {
        return Boolean(card && card.status === 'approved' &&
            CATEGORY_IDS.indexOf(card.category) >= 0 &&
            card.source && card.source.verified === true &&
            card.rights && card.rights.status === 'original' &&
            typeof card.textUr === 'string' && card.textUr.trim());
    }

    function score(card) {
        return (card.featuredEligible === true ? 100 : 0) + Number(card.schedulePriority || 0);
    }

    function popularCards(cards) {
        var selected = [];
        CATEGORY_IDS.forEach(function (category) {
            var best = cards.filter(function (card) { return card.category === category; })
                .sort(function (a, b) { return score(b) - score(a); })[0];
            if (best) selected.push(best);
        });
        return selected.slice(0, 8);
    }

    function cardsFor(category) {
        var cards = data.getAllCards().filter(safeCard);
        if (category === 'all') return popularCards(cards);
        return cards.filter(function (card) { return card.category === category; })
            .sort(function (a, b) { return score(b) - score(a); })
            .slice(0, 8);
    }

    function categoryMeta(id) {
        return STATUS_CATEGORIES.find(function (item) { return item.id === id; }) || STATUS_CATEGORIES[0];
    }

    function writeClipboard(text) {
        if (root.navigator.clipboard && root.isSecureContext) return root.navigator.clipboard.writeText(text);
        var field = document.createElement('textarea');
        field.value = text;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        var copied = document.execCommand('copy');
        field.remove();
        return copied ? Promise.resolve() : Promise.reject(new Error('copy_failed'));
    }

    function waitForTextField(callback, attempts) {
        var field = document.getElementById('cardText');
        if (field) { callback(field); return; }
        if ((attempts || 0) >= 40) {
            status.textContent = 'The Status editor is still loading. Try again in a moment.';
            return;
        }
        root.setTimeout(function () { waitForTextField(callback, (attempts || 0) + 1); }, 50);
    }

    function useCard(card) {
        waitForTextField(function (field) {
            field.value = card.textUr;
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
            status.textContent = 'Loaded into the Status Maker. You can change the words, style or background below.';
            track('whatsapp_status_ready_made_selected', { card_id: card.id, category: card.category, action: 'use' });
            var workspace = document.querySelector('[data-social-direct-workspace="whatsapp"]');
            if (workspace && typeof workspace.scrollIntoView === 'function') workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
            field.focus({ preventScroll: true });
        });
    }

    function copyCard(card, button) {
        var original = button.textContent;
        writeClipboard(card.textUr).then(function () {
            button.textContent = 'Copied ✓';
            status.textContent = 'Urdu status text copied.';
            track('whatsapp_status_ready_made_selected', { card_id: card.id, category: card.category, action: 'copy' });
            root.setTimeout(function () { button.textContent = original; }, 1600);
        }).catch(function () {
            status.textContent = 'Copy was blocked. Select the Urdu text and copy it manually.';
        });
    }

    function cardNode(card) {
        var article = document.createElement('article');
        article.className = 'whatsapp-status-card';
        article.dataset.statusCardId = card.id;
        article.dataset.statusCategory = card.category;

        var meta = document.createElement('span');
        meta.className = 'whatsapp-status-card-category';
        var category = categoryMeta(card.category);
        meta.textContent = category.label + ' · ' + category.labelUr;
        article.appendChild(meta);

        var text = document.createElement('p');
        text.className = 'whatsapp-status-card-text';
        text.lang = 'ur';
        text.dir = 'rtl';
        text.textContent = card.textUr;
        article.appendChild(text);

        var actions = document.createElement('div');
        actions.className = 'whatsapp-status-card-actions';

        var use = document.createElement('button');
        use.type = 'button';
        use.className = 'whatsapp-status-action primary';
        use.textContent = 'Use this status';
        use.addEventListener('click', function () { useCard(card); });
        actions.appendChild(use);

        var copy = document.createElement('button');
        copy.type = 'button';
        copy.className = 'whatsapp-status-action';
        copy.textContent = 'Copy text';
        copy.addEventListener('click', function () { copyCard(card, copy); });
        actions.appendChild(copy);

        article.appendChild(actions);
        return article;
    }

    function render() {
        var cards = cardsFor(activeCategory);
        grid.innerHTML = '';
        cards.forEach(function (card) { grid.appendChild(cardNode(card)); });
        status.textContent = cards.length ? '' : 'No ready-made statuses are available in this category yet.';
        Array.prototype.forEach.call(filters.querySelectorAll('[data-status-filter]'), function (button) {
            button.setAttribute('aria-pressed', String(button.dataset.statusFilter === activeCategory));
        });
    }

    function mountFilters() {
        STATUS_CATEGORIES.forEach(function (category) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'whatsapp-status-filter';
            button.dataset.statusFilter = category.id;
            button.setAttribute('aria-pressed', String(category.id === activeCategory));
            button.textContent = category.label + (category.id === 'all' ? '' : ' · ' + category.labelUr);
            button.addEventListener('click', function () {
                activeCategory = category.id;
                render();
                track('whatsapp_status_ready_made_filter', { category: category.id });
            });
            filters.appendChild(button);
        });
    }

    mountFilters();
    render();
}(window));
