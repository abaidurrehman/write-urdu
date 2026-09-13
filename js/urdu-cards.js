(function (root) {
    'use strict';

    var document = root.document;
    var registry = root.WriteUrduCardBackgroundRegistry;
    var core = root.WriteUrduCardGalleryCore;
    var data = root.WriteUrduCardsData;
    var CANONICAL_ORIGIN = 'https://write-urdu.com';

    function normalizedPath() {
        return String(root.location && root.location.pathname || '/')
            .replace(/\.html$/i, '')
            .replace(/\/$/, '') || '/';
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

    function cardUrl(card) {
        return CANONICAL_ORIGIN + '/urdu-cards#card-' + card.id;
    }

    function mount() {
        if (normalizedPath() !== '/urdu-cards' || !registry || !core || !data) return false;
        var page = document.querySelector('[data-urdu-cards]');
        if (!page || page.dataset.urduCardsMounted === 'true') return false;

        var filters = page.querySelector('[data-urdu-cards-filters]');
        var grid = page.querySelector('[data-urdu-cards-grid]');
        var count = page.querySelector('[data-urdu-cards-count]');
        var status = page.querySelector('[data-urdu-cards-status]');
        var cardRecords = [];

        function updateCount(visible) {
            count.textContent = visible + ' cards';
        }

        function startEdit(card, background, button) {
            var handoff = root.WriteUrduWorkspaceHandoff;
            if (!handoff || typeof handoff.transfer !== 'function') {
                status.textContent = 'This browser could not open Card Studio.';
                return;
            }
            var pathDetail = pathDetailFor(card);
            if (root.WriteUrduTelemetry && typeof root.WriteUrduTelemetry.trackContinuationPath === 'function') {
                root.WriteUrduTelemetry.trackContinuationPath('selected', pathDetail);
            }
            var result = handoff.transfer({
                sourceWorkspace: 'urdu-cards',
                sourceRoute: '/urdu-cards',
                targetWorkspace: 'card-studio',
                targetRoute: '/urdu-card-studio',
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
                status.textContent = 'This browser could not open Card Studio.';
                return;
            }
            if (root.WriteUrduTelemetry && typeof root.WriteUrduTelemetry.trackContinuationPath === 'function') {
                root.WriteUrduTelemetry.trackContinuationPath('handoff_created', pathDetail);
            }
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
            status.textContent = 'Opening Card Studio…';
            if (root.WriteUrduTelemetry && typeof root.WriteUrduTelemetry.flush === 'function') root.WriteUrduTelemetry.flush(true);
            root.location.href = root.location.protocol === 'file:' ? 'urdu-card-studio.html' : (result.route || '/urdu-card-studio');
        }

        function startShare(card, button) {
            var url = cardUrl(card);
            if (root.navigator && typeof root.navigator.share === 'function') {
                root.navigator.share({ title: 'Write Urdu Card', url: url }).catch(function () { copyLink(url); });
                return;
            }
            copyLink(url);
        }

        function copyLink(url) {
            if (root.navigator && root.navigator.clipboard && typeof root.navigator.clipboard.writeText === 'function') {
                root.navigator.clipboard.writeText(url).then(function () {
                    status.textContent = 'Link copied.';
                }).catch(function () {
                    status.textContent = url;
                });
            } else {
                status.textContent = url;
            }
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
            name.textContent = background.name;
            names.appendChild(name);
            details.appendChild(names);

            var actions = document.createElement('div');
            actions.className = 'urdu-cards-actions';

            var edit = document.createElement('button');
            edit.type = 'button';
            edit.className = 'urdu-cards-edit';
            edit.dataset.urduCardsEdit = card.id;
            edit.textContent = 'Edit in Card Studio · اس میں تبدیلی کریں';
            edit.setAttribute('aria-label', 'Edit ' + card.id + ' in Card Studio');
            edit.addEventListener('click', function () { startEdit(card, background, edit); });

            var share = document.createElement('button');
            share.type = 'button';
            share.className = 'urdu-cards-share';
            share.dataset.urduCardsShare = card.id;
            share.textContent = 'Share · شیئر کریں';
            share.setAttribute('aria-label', 'Share ' + card.id);
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
            button.textContent = category.name + ' · ' + category.nameUr;
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
