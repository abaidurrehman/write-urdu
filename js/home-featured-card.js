(function (root) {
    'use strict';

    var document = root.document;
    var registry = root.WriteUrduCardBackgroundRegistry;
    var core = root.WriteUrduCardGalleryCore;
    var data = root.WriteUrduCardsData;
    var selector = root.WriteUrduHomeFeaturedCardSelector;
    var sharing = root.WriteUrduCuratedCardShare;

    function productPath() {
        if (root.WriteUrduLocaleRoute && typeof root.WriteUrduLocaleRoute.productPath === 'function') return root.WriteUrduLocaleRoute.productPath(root.location.pathname || '/');
        var path = String(root.location && root.location.pathname || '/').replace(/\/index\.html$/i, '').replace(/\.html$/i, '').replace(/\/$/, '') || '/';
        return path === '/urdu' ? '/' : path;
    }

    function isUrduLocale() {
        if (root.WriteUrduLocaleRoute && typeof root.WriteUrduLocaleRoute.locale === 'function') return root.WriteUrduLocaleRoute.locale(root.location.pathname || '/') === 'ur';
        return /^\/urdu(?:\/|$)/.test(String(root.location && root.location.pathname || '/'));
    }

    function contextLabel(context) {
        return {
            morning: 'صبح بخیر',
            daytime: 'آج کی خوبصورت بات',
            evening: 'آج کی خوبصورت بات',
            night: 'شب بخیر',
            friday: 'جمعہ مبارک'
        }[context] || '';
    }

    function pathDetail(card, context) {
        return {
            recommendationId: 'home-featured-card-to-studio',
            sourceWorkspace: 'home-featured-card',
            destinationWorkspace: 'card-studio',
            pathVersion: 'home-featured-card-v1',
            releaseMarker: 'wu-card-retention-001a',
            handoffRequired: true,
            restoreRequired: true,
            featuredCardId: card.id,
            featuredContext: context
        };
    }

    function attachToInstructions(section) {
        var instructionCard = section.nextElementSibling;
        if (!instructionCard || !instructionCard.classList.contains('card')) return false;
        var body = instructionCard.firstElementChild;
        if (!body || !body.classList.contains('card-body')) return false;
        body.classList.add('home-instructions-with-card');
        body.appendChild(section);
        return true;
    }

    function mount() {
        if (productPath() !== '/' || !registry || !core || !data || !selector || !sharing) return false;
        var section = document.querySelector('[data-home-featured-card]');
        if (!section || section.dataset.homeFeaturedCardMounted === 'true') return false;
        var now = new Date();
        var context = selector.contextForDate(now);
        var card = selector.selectFeaturedCard(data.getAllCards(), now, registry);
        var background = card && registry.getBackgroundById(card.backgroundId);
        var insets = background && core.safeAreaStyle(background.safeArea);
        if (!card || !background || !insets) return false;

        attachToInstructions(section);

        var art = section.querySelector('[data-home-featured-card-art]');
        var image = section.querySelector('[data-home-featured-card-image]');
        var overlay = section.querySelector('[data-home-featured-card-overlay]');
        var safeArea = section.querySelector('[data-home-featured-card-safe-area]');
        var text = section.querySelector('[data-home-featured-card-text]');
        var label = section.querySelector('[data-home-featured-card-context]');
        var shareButton = section.querySelector('[data-home-featured-card-share]');
        var studioButton = section.querySelector('[data-home-featured-card-edit]');
        var status = section.querySelector('[data-home-featured-card-status]');
        if (!art || !image || !overlay || !safeArea || !text || !label || !shareButton || !studioButton || !status) return false;

        label.textContent = contextLabel(context);
        image.src = background.thumbnailSrc || background.src;
        image.alt = '';
        image.addEventListener('error', function () { section.hidden = true; }, { once: true });
        overlay.style.backgroundColor = background.overlayColor;
        overlay.style.opacity = String(background.overlayOpacity);
        safeArea.style.top = insets.top;
        safeArea.style.right = insets.right;
        safeArea.style.bottom = insets.bottom;
        safeArea.style.left = insets.left;
        safeArea.style.textAlign = background.preferredAlign;
        text.textContent = card.textUr;
        art.dataset.textTier = core.previewTextTier(card.textUr);

        if (isUrduLocale()) {
            section.querySelector('[data-home-featured-card-title]').textContent = 'آج کا منتخب اردو کارڈ';
            shareButton.textContent = 'شیئر کریں';
            studioButton.textContent = 'کارڈ اسٹوڈیو میں کھولیں';
        }

        shareButton.addEventListener('click', function () {
            shareButton.disabled = true;
            shareButton.setAttribute('aria-busy', 'true');
            status.textContent = isUrduLocale() ? 'شیئر کرنے کا لنک تیار ہو رہا ہے…' : 'Creating your shareable link…';
            sharing.shareCard(card, background, { title: 'Write Urdu Card' }).then(function (result) {
                if (result.result === 'link_copied') status.textContent = isUrduLocale() ? 'لنک کاپی ہو گیا۔' : 'Link copied.';
                else if (result.result === 'fallback') status.textContent = result.url;
                else status.textContent = isUrduLocale() ? 'شیئر مینو کھل گیا۔' : 'Share sheet opened.';
            }).catch(function () {
                status.textContent = sharing.cardUrl(card);
            }).finally(function () {
                shareButton.disabled = false;
                shareButton.removeAttribute('aria-busy');
            });
        });

        studioButton.addEventListener('click', function () {
            var handoff = root.WriteUrduWorkspaceHandoff;
            if (!handoff || typeof handoff.transfer !== 'function') {
                status.textContent = isUrduLocale() ? 'اس براؤزر میں کارڈ اسٹوڈیو نہیں کھل سکا۔' : 'This browser could not open Card Studio.';
                return;
            }
            var detail = pathDetail(card, context);
            if (root.WriteUrduTelemetry && typeof root.WriteUrduTelemetry.trackContinuationPath === 'function') root.WriteUrduTelemetry.trackContinuationPath('selected', detail);
            var result = handoff.transfer({
                sourceWorkspace: 'home-featured-card',
                sourceRoute: '/',
                targetWorkspace: 'card-studio',
                targetRoute: '/urdu-card-studio',
                actionId: 'home-featured-card-to-studio',
                kind: 'visual-project-seed',
                payload: { text: card.textUr, backgroundId: card.backgroundId },
                context: {
                    recommendationId: 'home-featured-card-to-studio',
                    pathVersion: 'home-featured-card-v1',
                    releaseMarker: 'wu-card-retention-001a',
                    featuredCardId: card.id,
                    featuredContext: context,
                    handoffRequired: true,
                    restoreRequired: true
                }
            });
            if (!result.ok) {
                status.textContent = isUrduLocale() ? 'اس براؤزر میں کارڈ اسٹوڈیو نہیں کھل سکا۔' : 'This browser could not open Card Studio.';
                return;
            }
            if (root.WriteUrduTelemetry && typeof root.WriteUrduTelemetry.trackContinuationPath === 'function') root.WriteUrduTelemetry.trackContinuationPath('handoff_created', detail);
            studioButton.disabled = true;
            studioButton.setAttribute('aria-busy', 'true');
            status.textContent = isUrduLocale() ? 'کارڈ اسٹوڈیو کھل رہا ہے…' : 'Opening Card Studio…';
            if (root.WriteUrduTelemetry && typeof root.WriteUrduTelemetry.flush === 'function') root.WriteUrduTelemetry.flush(true);
            root.location.href = root.location.protocol === 'file:' ? 'urdu-card-studio.html' : (result.route || '/urdu-card-studio');
        });

        section.dataset.featuredCardId = card.id;
        section.dataset.featuredContext = context;
        section.dataset.homeFeaturedCardMounted = 'true';
        section.hidden = false;
        return true;
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
}(window));
