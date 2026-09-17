(function (root) {
    'use strict';

    var document = root.document;
    var mounted = false;
    var COPY = {
        en: {
            label: 'Use this design for',
            card: 'Card',
            whatsapp: 'WhatsApp Status',
            instagram: 'Instagram Post',
            openingWhatsapp: 'Opening WhatsApp Status Maker…',
            openingInstagram: 'Opening Instagram Post Maker…',
            unavailable: 'Could not continue with this design in that format.'
        },
        ur: {
            label: 'یہ ڈیزائن استعمال کریں',
            card: 'کارڈ',
            whatsapp: 'واٹس ایپ اسٹیٹس',
            instagram: 'انسٹاگرام پوسٹ',
            openingWhatsapp: 'واٹس ایپ اسٹیٹس میکر کھولا جا رہا ہے…',
            openingInstagram: 'انسٹاگرام پوسٹ میکر کھولا جا رہا ہے…',
            unavailable: 'یہ ڈیزائن اس فارمیٹ میں نہیں کھل سکا۔'
        }
    };

    function locale() {
        return document.documentElement.lang === 'ur' ? 'ur' : 'en';
    }

    function copy(key) {
        return (COPY[locale()] || COPY.en)[key] || COPY.en[key] || '';
    }

    function route(productPath) {
        if (root.WriteUrduLocaleRoute && typeof root.WriteUrduLocaleRoute.href === 'function') {
            return root.WriteUrduLocaleRoute.href(productPath, locale());
        }
        return productPath;
    }

    function asset(path) {
        if (root.location && root.location.protocol === 'file:') return path.replace(/^\//, '');
        return path;
    }

    function ensureStyles() {
        if (document.querySelector('style[data-urdu-cards-format-style]')) return;
        var style = document.createElement('style');
        style.setAttribute('data-urdu-cards-format-style', '');
        style.textContent = [
            '.urdu-cards-format-presets{margin:0 12px 10px;padding:9px;border:1px solid #dce7e1;border-radius:12px;background:#fbfdfc}',
            '.urdu-cards-format-presets-label{display:block;margin:0 0 7px;color:#60736a;font-size:.64rem;font-weight:800;letter-spacing:.02em}',
            '.urdu-cards-format-presets-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}',
            '.urdu-cards-format-preset{min-width:0;min-height:36px;padding:6px 7px;border:1px solid #cdded5;border-radius:9px;background:#fff;color:#244d3b;font:inherit;font-size:.62rem;font-weight:800;line-height:1.25;cursor:pointer}',
            '.urdu-cards-format-preset:hover{background:#eef5f1;border-color:#9ebdab}',
            '.urdu-cards-format-preset:focus-visible{outline:3px solid rgba(23,107,75,.2);outline-offset:2px}',
            '.urdu-cards-format-preset:disabled{cursor:not-allowed;opacity:.5}',
            '@media(max-width:720px){.urdu-cards-format-presets{margin:0 9px 9px;padding:8px}.urdu-cards-format-preset{font-size:.59rem;padding:6px 5px}}'
        ].join('');
        document.head.appendChild(style);
    }

    function cardData(id) {
        var api = root.WriteUrduCardsData;
        if (!api || typeof api.getAllCards !== 'function') return null;
        var cards = api.getAllCards();
        for (var index = 0; index < cards.length; index += 1) {
            if (cards[index].id === id) return cards[index];
        }
        return null;
    }

    function statusNode() {
        return document.querySelector('[data-urdu-cards-status]');
    }

    function transfer(card, targetWorkspace, targetRoute, format, button) {
        var handoff = root.WriteUrduWorkspaceHandoff;
        var status = statusNode();
        if (!card || !handoff || typeof handoff.transfer !== 'function') {
            if (status) status.textContent = copy('unavailable');
            return;
        }

        button.disabled = true;
        button.setAttribute('aria-busy', 'true');
        if (status) status.textContent = format === 'whatsapp' ? copy('openingWhatsapp') : copy('openingInstagram');

        var result = handoff.transfer({
            sourceWorkspace: 'urdu-cards',
            sourceRoute: route('/urdu-cards'),
            targetWorkspace: targetWorkspace,
            targetRoute: route(targetRoute),
            kind: 'plain-text',
            payload: { text: String(card.textUr || '') },
            context: {
                backgroundId: card.backgroundId,
                sourceCardId: card.id,
                socialFormat: format,
                handoffRequired: true,
                restoreRequired: true
            }
        });

        if (!result || !result.ok) {
            button.disabled = false;
            button.removeAttribute('aria-busy');
            if (status) status.textContent = copy('unavailable');
            return;
        }
        root.location.href = root.location && root.location.protocol === 'file:' ? targetRoute.replace(/^\//, '') + '.html' : (result.route || targetRoute);
    }

    function createButton(label, kind, cardId) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'urdu-cards-format-preset';
        button.dataset.urduCardsFormat = kind;
        button.dataset.cardId = cardId;
        button.textContent = label;
        return button;
    }

    function mountCard(article) {
        if (!article || article.querySelector('[data-urdu-cards-format-presets]')) return;
        var id = String(article.id || '').replace(/^card-/, '');
        if (!id) return;
        var secondary = article.querySelector('.urdu-cards-secondary-actions');
        if (!secondary) return;

        var wrap = document.createElement('div');
        wrap.className = 'urdu-cards-format-presets';
        wrap.dataset.urduCardsFormatPresets = id;
        var label = document.createElement('span');
        label.className = 'urdu-cards-format-presets-label';
        label.textContent = copy('label');
        var actions = document.createElement('div');
        actions.className = 'urdu-cards-format-presets-actions';

        var cardButton = createButton(copy('card'), 'card', id);
        var whatsappButton = createButton(copy('whatsapp'), 'whatsapp', id);
        var instagramButton = createButton(copy('instagram'), 'instagram', id);

        cardButton.addEventListener('click', function () {
            var edit = article.querySelector('[data-urdu-cards-edit]');
            if (edit) edit.click();
        });
        whatsappButton.addEventListener('click', function () {
            transfer(cardData(id), 'whatsapp-status', '/urdu-whatsapp-status-maker', 'whatsapp', whatsappButton);
        });
        instagramButton.addEventListener('click', function () {
            transfer(cardData(id), 'instagram-post', '/urdu-instagram-post-maker', 'instagram', instagramButton);
        });

        actions.appendChild(cardButton);
        actions.appendChild(whatsappButton);
        actions.appendChild(instagramButton);
        wrap.appendChild(label);
        wrap.appendChild(actions);
        secondary.insertAdjacentElement('beforebegin', wrap);
    }

    function mount() {
        if (mounted) return true;
        var page = document.querySelector('[data-urdu-cards]');
        if (!page) return false;
        var cards = page.querySelectorAll('.card-gallery-card[id^="card-"]');
        if (!cards.length) return false;
        ensureStyles();
        cards.forEach(mountCard);
        mounted = true;
        page.dataset.urduCardsSocialFormatsMounted = 'true';
        root.WriteUrduCardsSocialFormats = {
            mount: mount,
            cardData: cardData
        };
        return true;
    }

    function retry(attempt) {
        if (mount()) return;
        if (attempt >= 40) return;
        root.requestAnimationFrame(function () { retry(attempt + 1); });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { retry(0); });
    else retry(0);
}(window));
