(function (root) {
    'use strict';

    var document = root.document;
    var registry = root.WriteUrduCardBackgroundRegistry;
    var core = root.WriteUrduCardGalleryCore;
    var data = root.WriteUrduCardsData;
    var sharing = root.WriteUrduCuratedCardShare;
    var COPY = {
        en: { cards: ' cards', unavailable: 'This browser could not open Card Studio.', opening: 'Opening Card Studio…', creating: 'Creating your shareable link…', copied: 'Link copied.', shared: 'Share sheet opened.', edit: 'Edit in Card Studio · اس میں تبدیلی کریں', editLabel: 'Edit {id} in Card Studio', share: 'Share · شیئر کریں', shareLabel: 'Share {id}' },
        ur: { cards: ' کارڈز', unavailable: 'یہ براؤزر کارڈ اسٹوڈیو نہیں کھول سکا۔', opening: 'کارڈ اسٹوڈیو کھولا جا رہا ہے…', creating: 'شیئر کرنے کے لیے لنک بنایا جا رہا ہے…', copied: 'لنک کاپی ہو گیا۔', shared: 'شیئر مینو کھل گیا۔', edit: 'کارڈ اسٹوڈیو میں ترمیم کریں', editLabel: 'کارڈ اسٹوڈیو میں {id} کارڈ تبدیل کریں', share: 'شیئر کریں', shareLabel: '{id} کارڈ شیئر کریں' }
    };

    function locale() { return document.documentElement.lang === 'ur' ? 'ur' : 'en'; }
    function copyText(key, values) {
        var value = COPY[locale()][key];
        Object.keys(values || {}).forEach(function (name) { value = value.split('{' + name + '}').join(values[name]); });
        return value;
    }

    function normalizedPath() {
        var pathname = String(root.location && root.location.pathname || '/');
        if (root.WriteUrduLocaleRoute) return root.WriteUrduLocaleRoute.productPath(pathname);
        return pathname.replace(/^\/urdu(?=\/|$)/, '')
            .replace(/\.html$/i, '')
            .replace(/\/$/, '') || '/';
    }

    function localizedRoute(productPath) {
        return root.WriteUrduLocaleRoute && root.WriteUrduLocaleRoute.href(productPath, locale()) || productPath;
    }

    function pathDetailFor(card) {
        return {
            recommendationId: 'urdu-cards-to-card',
            sourceWorkspace: 'urdu-cards',
            destinationWorkspace: 'card-studio',
            pathVersion: 'urdu-cards-v1',
            releaseMarker: 'wu-urdu-cards-s1-2026-09-13-v1',
            handoffRequired: true,
            restoreRequired: true
        };
    }

    function mount() {
        if (normalizedPath() !== '/urdu-cards' || !registry || !core || !data || !sharing) return false;
        var page = document.querySelector('[data-urdu-cards]');
        if (!page || page.dataset.urduCardsMounted === 'true') return false;

        var filters = page.querySelector('[data-urdu-cards-filters]');
        var grid = page.querySelector('[data-urdu-cards-grid]');
        var count = page.querySelector('[data-urdu-cards-count]');
        var status = page.querySelector('[data-urdu-cards-status]');
        var cardRecords = [];

        function updateCount(visible) {
            count.textContent = visible + copyText('cards');
        }

        function startEdit(card, background, button) {
            var handoff = root.WriteUrduWorkspaceHandoff;
            if (!handoff || typeof handoff.transfer !== 'function') {
                status.textContent = copyText('unavailable');
                return;
            }
            var pathDetail = pathDetailFor(card);
            if (root.WriteUrduTelemetry && typeof root.WriteUrduTelemetry.trackContinuationPath === 'function') {
                root.WriteUrduTelemetry.trackContinuationPath('selected', pathDetail);
            }
            var result = handoff.transfer({
                sourceWorkspace: 'urdu-cards',
                sourceRoute: localizedRoute('/urdu-cards'),
                targetWorkspace: 'card-studio',
                targetRoute: localizedRoute('/urdu-card-studio'),
                actionId: 'urdu-cards-to-card',
                kind: 'visual-project-seed',
                payload: { text: card.textUr, backgroundId: card.backgroundId },
                context: {
                    recommendationId: 'urdu-cards-to-card',
                    pathVersion: 'urdu-cards-v1',
                    releaseMarker: 'wu-urdu-cards-s1-2026-09-13-v1',
                    textLengthBucket: core.classifyText(card.textUr),
                    handoffRequired: true,
                    restoreRequired: true
                }
            });
            if (!result.ok) {
                status.textContent = copyText('unavailable');
                return;
            }
            if (root.WriteUrduTelemetry && typeof root.WriteUrduTelemetry.trackContinuationPath === 'function') {
                root.WriteUrduTelemetry.trackContinuationPath('handoff_created', pathDetail);
            }
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
            status.textContent = copyText('opening');
            if (root.WriteUrduTelemetry && typeof root.WriteUrduTelemetry.flush === 'function') root.WriteUrduTelemetry.flush(true);
            root.location.href = root.location.protocol === 'file:' ? 'urdu-card-studio.html' : (result.route || '/urdu-card-studio');
        }

        function startShare(card, button) {
            var background = registry.getBackgroundById(card.backgroundId);
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
            status.textContent = copyText('creating');
            var shareOptions = { route: localizedRoute('/urdu-cards'), title: locale() === 'ur' ? 'رائٹ اردو کارڈ' : 'Write Urdu Card' };
            var share = background ? sharing.shareCard(card, background, shareOptions) : Promise.reject(new Error('no_background'));
            share.then(function (result) {
                button.disabled = false;
                button.removeAttribute('aria-busy');
                if (result.result === 'link_copied') status.textContent = copyText('copied');
                else if (result.result === 'fallback') status.textContent = result.url;
                else status.textContent = copyText('shared');
            }).catch(function () {
                button.disabled = false;
                button.removeAttribute('aria-busy');
                status.textContent = sharing.cardUrl(card, shareOptions);
            });
        }

        function createCard(card) {
            var background = registry.getBackgroundById(card.backgroundId);
            if (!background) return;

            var article = document.createElement('article');
            article.className = 'card-gallery-card';
            article.id = 'card-' + card.id;
            article.dataset.category = card.category;
            article.dataset.textTier = core.previewTextTier(card.textUr);

            var art = document.createElement('div');
            art.className = 'card-gallery-art';
            art.setAttribute('aria-hidden', 'true');

            var image = document.createElement('img');
            image.src = background.thumbnailSrc || background.src;
            image.alt = '';
            image.loading = 'lazy';
            image.decoding = 'async';
            image.width = 320;
            image.height = 400;
            art.appendChild(image);

            var overlay = document.createElement('span');
            overlay.className = 'card-gallery-overlay';
            overlay.style.backgroundColor = background.overlayColor;
            overlay.style.opacity = String(background.overlayOpacity);
            art.appendChild(overlay);

            var safeArea = document.createElement('div');
            var insets = core.safeAreaStyle(background.safeArea);
            safeArea.className = 'card-gallery-safe-area';
            safeArea.style.top = insets.top;
            safeArea.style.right = insets.right;
            safeArea.style.bottom = insets.bottom;
            safeArea.style.left = insets.left;
            safeArea.style.textAlign = background.preferredAlign;

            var text = document.createElement('p');
            text.className = 'card-gallery-preview-text';
            text.lang = 'ur';
            text.dir = 'rtl';
            text.style.color = background.textColor;
            text.textContent = card.textUr;
            safeArea.appendChild(text);
            art.appendChild(safeArea);

            var details = document.createElement('div');
            details.className = 'card-gallery-card-details';
            var names = document.createElement('div');
            names.className = 'card-gallery-card-names';
            var name = document.createElement('h2');
            name.textContent = locale() === 'ur' ? background.nameUr : background.name;
            names.appendChild(name);
            details.appendChild(names);

            var actions = document.createElement('div');
            actions.className = 'urdu-cards-actions';

            var edit = document.createElement('button');
            edit.type = 'button';
            edit.className = 'urdu-cards-edit';
            edit.dataset.urduCardsEdit = card.id;
            edit.textContent = copyText('edit');
            edit.setAttribute('aria-label', copyText('editLabel', { id: card.id }));
            edit.addEventListener('click', function () { startEdit(card, background, edit); });

            var share = document.createElement('button');
            share.type = 'button';
            share.className = 'urdu-cards-share';
            share.dataset.urduCardsShare = card.id;
            share.textContent = copyText('share');
            share.setAttribute('aria-label', copyText('shareLabel', { id: card.id }));
            share.addEventListener('click', function () { startShare(card, share); });

            actions.appendChild(edit);
            actions.appendChild(share);

            article.appendChild(art);
            article.appendChild(details);
            article.appendChild(actions);
            grid.appendChild(article);

            cardRecords.push({ article: article, card: card });
        }

        function selectFilter(button) {
            var category = button.dataset.urduCardsFilter;
            filters.querySelectorAll('[data-urdu-cards-filter]').forEach(function (item) {
                item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
            });
            var visible = 0;
            cardRecords.forEach(function (record) {
                record.article.hidden = category !== 'all' && record.card.category !== category;
                if (!record.article.hidden) visible += 1;
            });
            updateCount(visible);
        }

        data.getCardCategories().forEach(function (category) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'card-gallery-filter';
            button.dataset.urduCardsFilter = category.id;
            button.setAttribute('aria-pressed', category.id === 'all' ? 'true' : 'false');
            button.textContent = locale() === 'ur' ? category.nameUr : category.name + ' · ' + category.nameUr;
            button.addEventListener('click', function () { selectFilter(button); });
            filters.appendChild(button);
        });

        data.getAllCards().forEach(createCard);
        updateCount(cardRecords.length);
        page.dataset.urduCardsMounted = 'true';
        root.WriteUrduCardsApp = {
            getDiagnostics: function () {
                return { shells: cardRecords.length };
            }
        };
        return true;
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
}(window));
