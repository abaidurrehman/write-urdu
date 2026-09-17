(function (root) {
    'use strict';

    var document = root.document;
    var FAVORITES_KEY = 'writeUrdu.urduCardsFavorites.v1';
    var RECENTS_KEY = 'writeUrdu.urduCardsRecents.v1';
    var MAX_RECENTS = 8;
    var knownIds = {};
    var COPY = {
        en: {
            title: 'Your cards',
            subtitle: 'Saved only in this browser.',
            continue: 'Continue last card',
            recent: 'Recent',
            favorites: 'Favorites',
            addFavorite: 'Add {id} to favorites',
            removeFavorite: 'Remove {id} from favorites',
            cards: ' cards'
        },
        ur: {
            title: 'آپ کے کارڈز',
            subtitle: 'صرف اسی براؤزر میں محفوظ ہیں۔',
            continue: 'پچھلا کارڈ دوبارہ کھولیں',
            recent: 'حالیہ',
            favorites: 'پسندیدہ',
            addFavorite: '{id} کارڈ پسندیدہ میں شامل کریں',
            removeFavorite: '{id} کارڈ پسندیدہ سے نکالیں',
            cards: ' کارڈز'
        }
    };

    var state = {
        favorites: readList(FAVORITES_KEY),
        recents: readList(RECENTS_KEY),
        activeFilter: null
    };

    function locale() {
        return document.documentElement.lang === 'ur' ? 'ur' : 'en';
    }

    function copy(key, values) {
        var value = COPY[locale()][key];
        Object.keys(values || {}).forEach(function (name) {
            value = value.split('{' + name + '}').join(values[name]);
        });
        return value;
    }

    function readList(key) {
        try {
            var value = JSON.parse(root.localStorage.getItem(key) || '[]');
            if (!Array.isArray(value)) return [];
            return value.filter(function (item) {
                return typeof item === 'string' && item.length > 0 && item.length <= 80;
            });
        } catch (error) {
            return [];
        }
    }

    function writeList(key, value) {
        try { root.localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* private browsing */ }
    }

    function cardId(article) {
        return String(article && article.id || '').replace(/^card-/, '');
    }

    function isFavorite(id) {
        return state.favorites.indexOf(id) !== -1;
    }

    function sanitizeAgainstCards(cards) {
        knownIds = {};
        cards.forEach(function (article) { knownIds[cardId(article)] = true; });
        state.favorites = state.favorites.filter(function (id, index, list) {
            return knownIds[id] && list.indexOf(id) === index;
        });
        state.recents = state.recents.filter(function (id, index, list) {
            return knownIds[id] && list.indexOf(id) === index;
        }).slice(0, MAX_RECENTS);
        writeList(FAVORITES_KEY, state.favorites);
        writeList(RECENTS_KEY, state.recents);
    }

    function ensureStylesheet() {
        if (document.querySelector('link[href$="/css/urdu-cards-returning-state.css"], link[href$="css/urdu-cards-returning-state.css"]')) return;
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = root.location && root.location.protocol === 'file:' ? 'css/urdu-cards-returning-state.css' : '/css/urdu-cards-returning-state.css';
        link.dataset.urduCardsReturningStyle = 'true';
        document.head.appendChild(link);
    }

    function addRecent(id) {
        if (!knownIds[id]) return;
        state.recents = [id].concat(state.recents.filter(function (item) { return item !== id; })).slice(0, MAX_RECENTS);
        writeList(RECENTS_KEY, state.recents);
        renderReturningControls();
        if (state.activeFilter === 'recent') renderActiveFilter();
    }

    function toggleFavorite(id) {
        if (!knownIds[id]) return;
        if (isFavorite(id)) state.favorites = state.favorites.filter(function (item) { return item !== id; });
        else state.favorites = [id].concat(state.favorites.filter(function (item) { return item !== id; }));
        writeList(FAVORITES_KEY, state.favorites);
        syncFavoriteButtons();
        renderReturningControls();
        if (state.activeFilter === 'favorites') renderActiveFilter();
    }

    function favoriteButtonFor(article) {
        var id = cardId(article);
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'urdu-cards-favorite';
        button.dataset.urduCardsFavorite = id;
        syncFavoriteButton(button);
        button.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            toggleFavorite(id);
        });
        return button;
    }

    function syncFavoriteButton(button) {
        var id = button.dataset.urduCardsFavorite;
        var favorite = isFavorite(id);
        button.setAttribute('aria-pressed', String(favorite));
        button.setAttribute('aria-label', favorite ? copy('removeFavorite', { id: id }) : copy('addFavorite', { id: id }));
        button.textContent = favorite ? '♥' : '♡';
    }

    function mountFavoriteButtons(cards) {
        cards.forEach(function (article) {
            if (article.querySelector('[data-urdu-cards-favorite]')) return;
            var art = article.querySelector('.card-gallery-art');
            if (art) art.appendChild(favoriteButtonFor(article));
        });
    }

    function syncFavoriteButtons() {
        document.querySelectorAll('[data-urdu-cards-favorite]').forEach(syncFavoriteButton);
    }

    function createReturningControls(page, filters) {
        var existing = page.querySelector('[data-urdu-cards-returning]');
        if (existing) return existing;

        var section = document.createElement('section');
        section.className = 'urdu-cards-returning';
        section.dataset.urduCardsReturning = 'true';
        section.hidden = true;
        section.setAttribute('aria-label', copy('title'));

        var copyWrap = document.createElement('div');
        copyWrap.className = 'urdu-cards-returning-copy';
        var title = document.createElement('strong');
        title.textContent = copy('title');
        var subtitle = document.createElement('span');
        subtitle.textContent = copy('subtitle');
        copyWrap.appendChild(title);
        copyWrap.appendChild(subtitle);

        var actions = document.createElement('div');
        actions.className = 'urdu-cards-returning-actions';

        var continueButton = document.createElement('button');
        continueButton.type = 'button';
        continueButton.dataset.urduCardsContinue = 'true';
        continueButton.textContent = copy('continue');
        continueButton.addEventListener('click', function () {
            var id = state.recents[0];
            var article = id && document.getElementById('card-' + id);
            if (!article) return;
            resetToAll(filters);
            article.scrollIntoView({ behavior: 'smooth', block: 'center' });
            var action = article.querySelector('[data-urdu-cards-image-share], [data-urdu-cards-edit]');
            if (action) action.focus({ preventScroll: true });
        });

        var recentButton = document.createElement('button');
        recentButton.type = 'button';
        recentButton.dataset.urduCardsReturningFilter = 'recent';
        recentButton.setAttribute('aria-pressed', 'false');
        recentButton.addEventListener('click', function () { toggleReturningFilter('recent', filters); });

        var favoriteButton = document.createElement('button');
        favoriteButton.type = 'button';
        favoriteButton.dataset.urduCardsReturningFilter = 'favorites';
        favoriteButton.setAttribute('aria-pressed', 'false');
        favoriteButton.addEventListener('click', function () { toggleReturningFilter('favorites', filters); });

        actions.appendChild(continueButton);
        actions.appendChild(recentButton);
        actions.appendChild(favoriteButton);
        section.appendChild(copyWrap);
        section.appendChild(actions);
        filters.insertAdjacentElement('beforebegin', section);
        return section;
    }

    function renderReturningControls() {
        var section = document.querySelector('[data-urdu-cards-returning]');
        if (!section) return;
        var hasState = state.recents.length > 0 || state.favorites.length > 0;
        section.hidden = !hasState;
        var continueButton = section.querySelector('[data-urdu-cards-continue]');
        var recentButton = section.querySelector('[data-urdu-cards-returning-filter="recent"]');
        var favoriteButton = section.querySelector('[data-urdu-cards-returning-filter="favorites"]');

        if (continueButton) continueButton.hidden = state.recents.length === 0;
        if (recentButton) {
            recentButton.hidden = state.recents.length === 0;
            recentButton.textContent = copy('recent') + ' · ' + state.recents.length;
            recentButton.setAttribute('aria-pressed', String(state.activeFilter === 'recent'));
        }
        if (favoriteButton) {
            favoriteButton.hidden = state.favorites.length === 0;
            favoriteButton.textContent = copy('favorites') + ' · ' + state.favorites.length;
            favoriteButton.setAttribute('aria-pressed', String(state.activeFilter === 'favorites'));
        }
    }

    function visibleSet(kind) {
        var list = kind === 'favorites' ? state.favorites : state.recents;
        var result = {};
        list.forEach(function (id) { result[id] = true; });
        return result;
    }

    function updateCount(visible) {
        var count = document.querySelector('[data-urdu-cards-count]');
        if (count) count.textContent = visible + copy('cards');
    }

    function clearCategoryPressed() {
        document.querySelectorAll('[data-urdu-cards-filter]').forEach(function (button) {
            button.setAttribute('aria-pressed', 'false');
        });
    }

    function renderActiveFilter() {
        if (!state.activeFilter) return;
        var allowed = visibleSet(state.activeFilter);
        var visible = 0;
        document.querySelectorAll('.card-gallery-card[id^="card-"]').forEach(function (article) {
            article.hidden = !allowed[cardId(article)];
            if (!article.hidden) visible += 1;
        });
        clearCategoryPressed();
        updateCount(visible);
        renderReturningControls();
    }

    function toggleReturningFilter(kind, filters) {
        if (state.activeFilter === kind) {
            resetToAll(filters);
            return;
        }
        state.activeFilter = kind;
        renderActiveFilter();
    }

    function resetToAll(filters) {
        state.activeFilter = null;
        renderReturningControls();
        var all = filters && filters.querySelector('[data-urdu-cards-filter="all"]');
        if (all) all.click();
    }

    function actionCardId(target) {
        var action = target.closest('[data-urdu-cards-image-share], [data-urdu-cards-edit], [data-urdu-cards-whatsapp-status], [data-urdu-cards-share]');
        if (!action) return '';
        return action.dataset.urduCardsImageShare || action.dataset.urduCardsEdit || action.dataset.urduCardsWhatsappStatus || action.dataset.urduCardsShare || '';
    }

    function mount() {
        var page = document.querySelector('[data-urdu-cards]');
        if (!page || page.dataset.urduCardsReturningMounted === 'true') return false;
        var filters = page.querySelector('[data-urdu-cards-filters]');
        var cards = Array.prototype.slice.call(page.querySelectorAll('.card-gallery-card[id^="card-"]'));
        if (!filters || !cards.length) return false;

        ensureStylesheet();
        sanitizeAgainstCards(cards);
        mountFavoriteButtons(cards);
        createReturningControls(page, filters);
        renderReturningControls();

        filters.addEventListener('click', function (event) {
            if (event.target.closest('[data-urdu-cards-filter]')) {
                state.activeFilter = null;
                renderReturningControls();
            }
        });
        page.addEventListener('click', function (event) {
            var id = actionCardId(event.target);
            if (id) addRecent(id);
        });
        root.addEventListener('storage', function (event) {
            if (event.key !== FAVORITES_KEY && event.key !== RECENTS_KEY) return;
            state.favorites = readList(FAVORITES_KEY);
            state.recents = readList(RECENTS_KEY);
            sanitizeAgainstCards(cards);
            syncFavoriteButtons();
            renderReturningControls();
            if (state.activeFilter) renderActiveFilter();
        });

        page.dataset.urduCardsReturningMounted = 'true';
        root.WriteUrduCardsReturningState = {
            getState: function () {
                return {
                    favorites: state.favorites.slice(),
                    recents: state.recents.slice(),
                    activeFilter: state.activeFilter
                };
            },
            clear: function () {
                state.favorites = [];
                state.recents = [];
                writeList(FAVORITES_KEY, []);
                writeList(RECENTS_KEY, []);
                syncFavoriteButtons();
                resetToAll(filters);
            },
            storageKeys: {
                favorites: FAVORITES_KEY,
                recents: RECENTS_KEY
            }
        };
        return true;
    }

    function retryMount(attempt) {
        if (mount()) return;
        if (attempt >= 30) return;
        root.requestAnimationFrame(function () { retryMount(attempt + 1); });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { retryMount(0); });
    else retryMount(0);
}(window));
