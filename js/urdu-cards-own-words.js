(function (root) {
    'use strict';

    var document = root.document;
    var data = root.WriteUrduCardsData;
    var registry = root.WriteUrduCardBackgroundRegistry;
    var core = root.WriteUrduCardGalleryCore;
    var MAX_TEXT_LENGTH = Number(core && core.MAX_PREVIEW_TEXT_LENGTH) || 600;
    var enhancementPromise = null;
    var COPY = {
        en: {
            title: 'Use your own words',
            intro: 'Type Roman Urdu, Urdu directly, paste a message, or speak Urdu. Your words will appear across the unique card designs below.',
            label: 'Your message',
            placeholder: 'Type Roman Urdu and press Space, paste Urdu, or use Speak Urdu…',
            help: 'Up to {max} characters. Your message is not saved to Favorites or Recent.',
            back: 'Back to ready-made cards',
            clear: 'Clear',
            showing: 'Showing your words on {count} designs.',
            tooLong: 'Keep the message to {max} characters or fewer.',
            designs: ' designs'
        },
        ur: {
            title: 'اپنا پیغام استعمال کریں',
            intro: 'رومن اردو لکھیں، اردو براہِ راست ٹائپ کریں، پیغام پیسٹ کریں یا اردو بول کر لکھیں۔ آپ کے الفاظ نیچے منفرد کارڈ ڈیزائنز پر نظر آئیں گے۔',
            label: 'آپ کا پیغام',
            placeholder: 'رومن اردو لکھیں، اردو پیسٹ کریں یا بول کر لکھیں…',
            help: 'زیادہ سے زیادہ {max} حروف۔ آپ کا پیغام پسندیدہ یا حالیہ کارڈز میں محفوظ نہیں ہوتا۔',
            back: 'تیار شدہ کارڈز پر واپس جائیں',
            clear: 'صاف کریں',
            showing: 'آپ کا پیغام {count} ڈیزائنز پر دکھایا جا رہا ہے۔',
            tooLong: 'پیغام کو {max} یا اس سے کم حروف تک محدود رکھیں۔',
            designs: ' ڈیزائنز'
        }
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

    function assetPath(path) {
        return root.location && root.location.protocol === 'file:' ? path.replace(/^\//, '') : path;
    }

    function ensureStyle(path, marker) {
        if (document.querySelector('link[' + marker + ']')) return;
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = assetPath(path);
        link.setAttribute(marker, 'true');
        document.head.appendChild(link);
    }

    function loadScript(path, marker, ready) {
        if (typeof ready === 'function' && ready()) return Promise.resolve();
        var existing = document.querySelector('script[' + marker + ']');
        if (existing) {
            return new Promise(function (resolve) {
                if ((typeof ready === 'function' && ready()) || existing.dataset.loaded === 'true') resolve();
                else existing.addEventListener('load', resolve, { once: true });
            });
        }
        return new Promise(function (resolve, reject) {
            var script = document.createElement('script');
            script.src = assetPath(path);
            script.async = true;
            script.setAttribute(marker, 'true');
            script.onload = function () {
                script.dataset.loaded = 'true';
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function ensureInputEnhancements() {
        if (enhancementPromise) return enhancementPromise;
        ensureStyle('/css/input-mode.css', 'data-urdu-cards-input-mode-style');
        enhancementPromise = loadScript('/js/input-mode.js', 'data-urdu-cards-input-mode-script', function () {
            return Boolean(root.WriteUrduInputMode);
        }).then(function () {
            if (root.WriteUrduInputMode && typeof root.WriteUrduInputMode.refresh === 'function') root.WriteUrduInputMode.refresh();
            return loadScript('/js/card-gallery-transliteration.js', 'data-urdu-cards-transliteration-script', function () {
                return Boolean(root.writeUrduTransliterationControl);
            });
        }).then(function () {
            return loadScript('/js/urdu-cards-own-words-voice.js', 'data-urdu-cards-own-words-voice-script', function () {
                return Boolean(root.WriteUrduCardsOwnWordsVoice);
            });
        }).catch(function () {
            enhancementPromise = null;
        });
        return enhancementPromise;
    }

    function mount() {
        var page = document.querySelector('[data-urdu-cards]');
        var ownChoice = page && page.querySelector('[data-urdu-cards-start-choice="own-words"]');
        var readyChoice = page && page.querySelector('[data-urdu-cards-start-choice="ready-made"]');
        var filters = page && page.querySelector('[data-urdu-cards-filters]');
        var grid = page && page.querySelector('[data-urdu-cards-grid]');
        var count = page && page.querySelector('[data-urdu-cards-count]');
        if (!page || !ownChoice || !filters || !grid || !count || !data || !registry || !core) return false;
        if (page.dataset.urduCardsOwnWordsMounted === 'true') return true;

        ensureStyle('/css/urdu-cards-own-words.css', 'data-urdu-cards-own-words-style');

        var cards = data.getAllCards();
        var originals = {};
        var representatives = {};
        var articleById = {};
        var representativeCount = 0;
        cards.forEach(function (card) {
            originals[card.id] = card.textUr;
            articleById[card.id] = document.getElementById('card-' + card.id);
            if (!representatives[card.backgroundId]) {
                representatives[card.backgroundId] = card.id;
                representativeCount += 1;
            }
        });

        var section = document.createElement('section');
        section.id = 'urdu-cards-own-words';
        section.className = 'urdu-cards-own-words';
        section.dataset.urduCardsOwnWords = 'true';
        section.hidden = true;
        section.setAttribute('aria-labelledby', 'urdu-cards-own-words-title');

        var heading = document.createElement('div');
        heading.className = 'urdu-cards-own-words-heading';
        var headingCopy = document.createElement('div');
        var title = document.createElement('h2');
        title.id = 'urdu-cards-own-words-title';
        title.textContent = copy('title');
        var intro = document.createElement('p');
        intro.textContent = copy('intro');
        headingCopy.appendChild(title);
        headingCopy.appendChild(intro);
        var back = document.createElement('button');
        back.type = 'button';
        back.className = 'urdu-cards-own-back';
        back.dataset.urduCardsOwnBack = 'true';
        back.textContent = copy('back');
        heading.appendChild(headingCopy);
        heading.appendChild(back);

        var form = document.createElement('div');
        form.className = 'urdu-cards-own-form';
        var label = document.createElement('label');
        label.setAttribute('for', 'urduCardsOwnText');
        label.textContent = copy('label');

        var inputMode = document.createElement('div');
        inputMode.className = 'input-mode-control input-mode-control-card urdu-cards-own-input-mode';
        inputMode.setAttribute('data-input-mode-control', '');
        inputMode.setAttribute('data-input-mode-storage', 'urdu-cards-own-words');
        inputMode.setAttribute('data-input-mode-targets', '#urduCardsOwnText');
        inputMode.setAttribute('role', 'group');
        inputMode.setAttribute('aria-label', locale() === 'ur' ? 'تحریر کا طریقہ' : 'Input mode');
        inputMode.innerHTML = '<span class="input-mode-title" data-input-mode-title>Input mode</span>' +
            '<button type="button" class="input-mode-option" data-input-mode-option="roman" aria-pressed="true">English letters → Urdu</button>' +
            '<button type="button" class="input-mode-option" data-input-mode-option="direct" aria-pressed="false">Type Urdu directly</button>' +
            '<span class="input-mode-note" data-input-mode-note>Type Roman Urdu and press Space to convert each word.</span>';

        var textarea = document.createElement('textarea');
        textarea.id = 'urduCardsOwnText';
        textarea.className = 'urdu-cards-own-text';
        textarea.dataset.urduCardsOwnInput = 'true';
        textarea.lang = 'ur';
        textarea.dir = 'rtl';
        textarea.rows = 4;
        textarea.maxLength = MAX_TEXT_LENGTH;
        textarea.placeholder = copy('placeholder');
        textarea.setAttribute('autocomplete', 'off');
        textarea.setAttribute('spellcheck', 'false');

        var meta = document.createElement('div');
        meta.className = 'urdu-cards-own-meta';
        var help = document.createElement('small');
        help.textContent = copy('help', { max: MAX_TEXT_LENGTH });
        var clear = document.createElement('button');
        clear.type = 'button';
        clear.className = 'urdu-cards-own-clear';
        clear.dataset.urduCardsOwnClear = 'true';
        clear.textContent = copy('clear');
        meta.appendChild(help);
        meta.appendChild(clear);

        var ownStatus = document.createElement('p');
        ownStatus.className = 'urdu-cards-own-status';
        ownStatus.dataset.urduCardsOwnStatus = 'true';
        ownStatus.setAttribute('role', 'status');
        ownStatus.setAttribute('aria-live', 'polite');

        form.appendChild(label);
        form.appendChild(inputMode);
        form.appendChild(textarea);
        form.appendChild(meta);
        form.appendChild(ownStatus);
        section.appendChild(heading);
        section.appendChild(form);

        var start = page.querySelector('[data-urdu-cards-start]');
        if (start) start.insertAdjacentElement('afterend', section);
        else filters.insertAdjacentElement('beforebegin', section);

        ownChoice.setAttribute('aria-controls', section.id);
        ownChoice.setAttribute('aria-expanded', 'false');

        function allFilter() {
            return filters.querySelector('[data-urdu-cards-filter="all"]');
        }

        function restoreReadyMade() {
            cards.forEach(function (card) {
                card.textUr = originals[card.id];
                var article = articleById[card.id];
                if (!article) return;
                var preview = article.querySelector('.card-gallery-preview-text');
                if (preview) preview.textContent = originals[card.id];
                article.dataset.textTier = core.previewTextTier(originals[card.id]);
            });
            page.removeAttribute('data-urdu-cards-own-active');
            filters.hidden = false;
            var all = allFilter();
            if (all) all.click();
            else {
                Object.keys(articleById).forEach(function (id) { if (articleById[id]) articleById[id].hidden = false; });
                count.textContent = cards.length + (locale() === 'ur' ? ' کارڈز' : ' cards');
            }
        }

        function applyOwnWords(value) {
            var normalized = core.preserveText(String(value || '').replace(/\r\n?/g, '\n'));
            if (!normalized.trim()) {
                restoreReadyMade();
                ownStatus.textContent = '';
                return;
            }
            if (normalized.length > MAX_TEXT_LENGTH) {
                ownStatus.textContent = copy('tooLong', { max: MAX_TEXT_LENGTH });
                return;
            }

            var all = allFilter();
            if (all) all.click();
            cards.forEach(function (card) {
                card.textUr = normalized;
                var article = articleById[card.id];
                if (!article) return;
                var preview = article.querySelector('.card-gallery-preview-text');
                if (preview) preview.textContent = normalized;
                article.dataset.textTier = core.previewTextTier(normalized);
                article.hidden = representatives[card.backgroundId] !== card.id;
            });
            page.setAttribute('data-urdu-cards-own-active', 'true');
            filters.hidden = true;
            count.textContent = representativeCount + copy('designs');
            ownStatus.textContent = copy('showing', { count: representativeCount });
        }

        function openOwnWords(event) {
            if (event) event.preventDefault();
            section.hidden = false;
            ownChoice.setAttribute('aria-expanded', 'true');
            ensureInputEnhancements().then(function () {
                if (root.WriteUrduInputMode && typeof root.WriteUrduInputMode.refresh === 'function') root.WriteUrduInputMode.refresh();
                if (root.WriteUrduCardsOwnWordsVoice && typeof root.WriteUrduCardsOwnWordsVoice.ensure === 'function') root.WriteUrduCardsOwnWordsVoice.ensure();
            });
            if (textarea.value.trim()) applyOwnWords(textarea.value);
            root.requestAnimationFrame(function () { textarea.focus(); });
        }

        function closeOwnWords(options) {
            options = options || {};
            if (root.WriteUrduCardsOwnWordsVoice && typeof root.WriteUrduCardsOwnWordsVoice.stop === 'function') root.WriteUrduCardsOwnWordsVoice.stop();
            restoreReadyMade();
            section.hidden = true;
            ownChoice.setAttribute('aria-expanded', 'false');
            ownStatus.textContent = '';
            if (options.focusReady && readyChoice) readyChoice.focus();
        }

        ownChoice.addEventListener('click', openOwnWords);
        if (readyChoice) readyChoice.addEventListener('click', function () { closeOwnWords(); });
        textarea.addEventListener('input', function () { applyOwnWords(textarea.value); });
        clear.addEventListener('click', function () {
            textarea.value = '';
            applyOwnWords('');
            textarea.focus();
        });
        back.addEventListener('click', function () { closeOwnWords({ focusReady: true }); });

        page.dataset.urduCardsOwnWordsMounted = 'true';
        root.WriteUrduCardsOwnWords = {
            open: openOwnWords,
            close: closeOwnWords,
            clear: function () {
                textarea.value = '';
                applyOwnWords('');
            },
            getState: function () {
                return {
                    active: page.getAttribute('data-urdu-cards-own-active') === 'true',
                    composerOpen: !section.hidden,
                    textLength: String(textarea.value || '').length,
                    designCount: representativeCount
                };
            }
        };
        return true;
    }

    function retry(attempt) {
        if (mount()) return;
        if (attempt >= 30) return;
        root.requestAnimationFrame(function () { retry(attempt + 1); });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { retry(0); });
    else retry(0);
}(window));