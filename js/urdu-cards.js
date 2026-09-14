(function (root) {
    'use strict';

    var document = root.document;
    var registry = root.WriteUrduCardBackgroundRegistry;
    var core = root.WriteUrduCardGalleryCore;
    var data = root.WriteUrduCardsData;
    var sharing = root.WriteUrduCuratedCardShare;
    var whatsappStatusPromise = null;

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

    function track(name, detail) {
        try {
            if (root.WriteUrduTelemetry && typeof root.WriteUrduTelemetry.track === 'function') {
                root.WriteUrduTelemetry.track(name, detail || {});
            }
        } catch (error) {}
    }

    function ensureWhatsAppStatusShare() {
        if (root.WriteUrduWhatsAppStatusShare && typeof root.WriteUrduWhatsAppStatusShare.shareCard === 'function') {
            return Promise.resolve(root.WriteUrduWhatsAppStatusShare);
        }
        if (whatsappStatusPromise) return whatsappStatusPromise;
        whatsappStatusPromise = new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = root.location && root.location.protocol === 'file:' ? 'js/whatsapp-status-share.js' : '/js/whatsapp-status-share.js';
            script.async = true;
            script.onload = function () {
                var api = root.WriteUrduWhatsAppStatusShare;
                if (api && typeof api.shareCard === 'function') resolve(api);
                else reject(new Error('status_share_api_missing'));
            };
            script.onerror = function () { reject(new Error('status_share_script_failed')); };
            document.head.appendChild(script);
        }).catch(function (error) {
            whatsappStatusPromise = null;
            throw error;
        });
        return whatsappStatusPromise;
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
            var background = registry.getBackgroundById(card.backgroundId);
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
            status.textContent = 'Creating your shareable link…';
            var share = background ? sharing.shareCard(card, background) : Promise.reject(new Error('no_background'));
            share.then(function (result) {
                button.disabled = false;
                button.removeAttribute('aria-busy');
                if (result.result === 'link_copied') status.textContent = 'Link copied.';
                else if (result.result === 'fallback') status.textContent = result.url;
                else status.textContent = 'Share sheet opened.';
            }).catch(function () {
                button.disabled = false;
                button.removeAttribute('aria-busy');
                status.textContent = sharing.cardUrl(card);
            });
        }

        function startWhatsAppStatus(card, background, button) {
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
            status.textContent = 'Preparing WhatsApp Status…';
            track('card_whatsapp_status_share_attempted', {
                card_id: card.id,
                background_id: card.backgroundId,
                source_route: '/urdu-cards'
            });
            ensureWhatsAppStatusShare().then(function (whatsappStatus) {
                return whatsappStatus.shareCard(card, background);
            }).then(function (result) {
                button.disabled = false;
                button.removeAttribute('aria-busy');
                if (result.result === 'shared') {
                    status.textContent = 'Shared — choose WhatsApp and My Status when prompted.';
                    track('card_whatsapp_status_share_completed', { card_id: card.id, background_id: card.backgroundId, method: 'native_share' });
                } else if (result.result === 'downloaded') {
                    status.textContent = 'PNG downloaded. Open WhatsApp → Updates → Add status.';
                    track('card_whatsapp_status_share_completed', { card_id: card.id, background_id: card.backgroundId, method: 'download_fallback' });
                } else {
                    status.textContent = 'Sharing cancelled.';
                    track('card_whatsapp_status_share_cancelled', { card_id: card.id, background_id: card.backgroundId });
                }
            }).catch(function () {
                button.disabled = false;
                button.removeAttribute('aria-busy');
                status.textContent = 'Could not prepare this Status image. Try Edit in Card Studio.';
                track('card_whatsapp_status_share_failed', { card_id: card.id, background_id: card.backgroundId });
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
            name.textContent = background.name;
            names.appendChild(name);
            details.appendChild(names);

            var actions = document.createElement('div');
            actions.className = 'urdu-cards-actions';

            var whatsapp = document.createElement('button');
            whatsapp.type = 'button';
            whatsapp.className = 'urdu-cards-whatsapp';
            whatsapp.dataset.urduCardsWhatsappStatus = card.id;
            whatsapp.textContent = 'WhatsApp Status · اسٹیٹس';
            whatsapp.setAttribute('aria-label', 'Share ' + card.id + ' to WhatsApp Status');
            whatsapp.addEventListener('click', function () { startWhatsAppStatus(card, background, whatsapp); });

            var edit = document.createElement('button');
            edit.type = 'button';
            edit.className = 'urdu-cards-edit';
            edit.dataset.urduCardsEdit = card.id;
            edit.textContent = 'Edit · تبدیل کریں';
            edit.setAttribute('aria-label', 'Edit ' + card.id + ' in Card Studio');
            edit.addEventListener('click', function () { startEdit(card, background, edit); });

            var share = document.createElement('button');
            share.type = 'button';
            share.className = 'urdu-cards-share';
            share.dataset.urduCardsShare = card.id;
            share.textContent = 'Share link · لنک شیئر کریں';
            share.setAttribute('aria-label', 'Share ' + card.id);
            share.addEventListener('click', function () { startShare(card, share); });

            actions.appendChild(whatsapp);
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
                return {
                    shells: cardRecords.length,
                    whatsappStatusShareLoaded: Boolean(root.WriteUrduWhatsAppStatusShare)
                };
            }
        };
        return true;
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
}(window));
