(function (root, factory) {
    'use strict';
    var api = factory(root);
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduAiWritingAgeGate = api;
}(typeof window !== 'undefined' ? window : null, function (root) {
    'use strict';

    var STORAGE_KEY = 'write-urdu:ai-writing-age-ack:v1';

    var COPY = {
        en: {
            title: 'Before you continue',
            body: 'AI writing help is only for people 18 or older. No personal details are collected to confirm this.',
            confirm: 'I am 18 or older, continue',
            cancel: 'Not now'
        },
        ur: {
            title: 'جاری رکھنے سے پہلے',
            body: 'AI تحریری مدد صرف 18 سال یا اس سے زائد عمر کے افراد کے لیے ہے۔ اس کی تصدیق کے لیے کوئی ذاتی معلومات جمع نہیں کی جاتیں۔',
            confirm: 'میری عمر 18 سال یا زائد ہے، جاری رکھیں',
            cancel: 'ابھی نہیں'
        }
    };

    function hasAcknowledged() {
        try {
            return root.localStorage.getItem(STORAGE_KEY) === 'true';
        } catch (error) {
            return false;
        }
    }

    function remember() {
        try {
            root.localStorage.setItem(STORAGE_KEY, 'true');
        } catch (error) {
            // Best effort; a rejected write just means the gate reappears next time.
        }
    }

    function ensureAccepted(options) {
        options = options || {};
        if (hasAcknowledged()) return Promise.resolve(true);
        if (!root || !root.document || !root.document.body) return Promise.resolve(false);

        var lang = options.locale === 'ur' ? 'ur' : 'en';
        var text = COPY[lang];

        return new Promise(function (resolve) {
            var overlay = root.document.createElement('div');
            overlay.className = 'wu-ai-writing-age-gate';
            overlay.setAttribute('data-wu-ai-writing-age-gate', '');
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-labelledby', 'wuAiWritingAgeGateTitle');

            var card = root.document.createElement('div');
            card.className = 'wu-ai-writing-age-gate-card';

            var title = root.document.createElement('h2');
            title.id = 'wuAiWritingAgeGateTitle';
            title.textContent = text.title;

            var body = root.document.createElement('p');
            body.textContent = text.body;

            var actions = root.document.createElement('div');
            actions.className = 'wu-ai-writing-age-gate-actions';

            var cancel = root.document.createElement('button');
            cancel.type = 'button';
            cancel.className = 'wu-ai-writing-age-gate-cancel';
            cancel.setAttribute('data-wu-ai-writing-age-gate-cancel', '');
            cancel.textContent = text.cancel;

            var confirm = root.document.createElement('button');
            confirm.type = 'button';
            confirm.className = 'wu-ai-writing-age-gate-confirm';
            confirm.setAttribute('data-wu-ai-writing-age-gate-confirm', '');
            confirm.textContent = text.confirm;

            actions.appendChild(cancel);
            actions.appendChild(confirm);
            card.appendChild(title);
            card.appendChild(body);
            card.appendChild(actions);
            overlay.appendChild(card);
            root.document.body.appendChild(overlay);

            function close(accepted) {
                overlay.remove();
                root.document.removeEventListener('keydown', onKeydown, true);
                if (accepted) remember();
                resolve(accepted);
            }

            function onKeydown(event) {
                if (event.key === 'Escape') close(false);
            }

            confirm.addEventListener('click', function () { close(true); });
            cancel.addEventListener('click', function () { close(false); });
            overlay.addEventListener('click', function (event) { if (event.target === overlay) close(false); });
            root.document.addEventListener('keydown', onKeydown, true);
            confirm.focus();
        });
    }

    return {
        STORAGE_KEY: STORAGE_KEY,
        hasAcknowledged: hasAcknowledged,
        ensureAccepted: ensureAccepted
    };
}));
