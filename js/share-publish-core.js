/* Shared public-link rules for every Write Urdu publisher (WU-UXR-002 Slice F, WU-SHARE-001).
   One consent answer per browser, one store of management tokens, one way to delete a link.
   The storage keys are the ones Card Studio has always used, so existing tokens stay deletable. */
(function (root, factory) {
    'use strict';
    var api = factory(root);
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.WriteUrduSharePublishCore = api;
}(typeof window !== 'undefined' ? window : null, function (root) {
    'use strict';

    var ACK_KEY = 'writeUrdu.sharePublishAcknowledged.v1';
    var MANAGEMENT_KEY = 'writeUrdu.shareManagement.v1';
    var MANAGEMENT_LIMIT = 40;

    var COPY = {
        en: {
            consentTitle: 'Make a public link for this card?',
            consentIntro: 'Write-Urdu.com will host a picture of this card on its own page.',
            consentPublic: 'Public to anyone with the link',
            consentWhat: 'The card picture and its Urdu words are uploaded. Nothing else from this browser is.',
            consentDelete: 'You can delete the link later from this browser with Manage links.',
            consentPicture: 'To send only the picture, choose Share image instead. That creates no link.',
            consentPrivate: 'Do not publish private writing. Link pages are not listed in search, but a link can be forwarded.',
            cancel: 'Cancel',
            confirm: 'Make link',
            close: 'Close',
            manageTitle: 'Your public links',
            manageIntro: 'Links made in this browser. Deleting one takes its page down for everyone.',
            manageEmpty: 'No public links from this browser.',
            open: 'Open',
            remove: 'Delete',
            removeConfirm: 'Delete this public link? People who open it will see that it was removed.',
            removed: 'Link deleted.',
            removeFailed: 'Could not delete this link right now. Try again later.',
            published: 'Made {date}'
        },
        ur: {
            consentTitle: 'اس کارڈ کا عوامی لنک بنائیں؟',
            consentIntro: 'رائٹ اردو اس کارڈ کی تصویر ایک الگ صفحے پر رکھے گا۔',
            consentPublic: 'لنک رکھنے والا ہر شخص اسے دیکھ سکتا ہے',
            consentWhat: 'صرف کارڈ کی تصویر اور اس کے اردو الفاظ اپ لوڈ ہوتے ہیں، اس براؤزر کی کوئی اور چیز نہیں۔',
            consentDelete: 'بعد میں «لنکس سنبھالیں» سے آپ یہ لنک اسی براؤزر سے مٹا سکتے ہیں۔',
            consentPicture: 'صرف تصویر بھیجنی ہو تو «تصویر شیئر کریں» چنیں، اس سے کوئی لنک نہیں بنتا۔',
            consentPrivate: 'نجی تحریر شائع نہ کریں۔ لنک والے صفحے سرچ میں نہیں آتے، مگر لنک آگے بھیجا جا سکتا ہے۔',
            cancel: 'رہنے دیں',
            confirm: 'لنک بنائیں',
            close: 'بند کریں',
            manageTitle: 'آپ کے عوامی لنکس',
            manageIntro: 'اس براؤزر سے بنائے گئے لنکس۔ مٹانے سے صفحہ سب کے لیے ہٹ جاتا ہے۔',
            manageEmpty: 'اس براؤزر سے کوئی عوامی لنک نہیں بنا۔',
            open: 'کھولیں',
            remove: 'مٹائیں',
            removeConfirm: 'یہ عوامی لنک مٹا دیں؟ کھولنے والوں کو بتایا جائے گا کہ اسے ہٹا دیا گیا ہے۔',
            removed: 'لنک مٹا دیا گیا۔',
            removeFailed: 'یہ لنک ابھی نہیں مٹ سکا۔ کچھ دیر بعد دوبارہ کوشش کریں۔',
            published: '{date} کو بنایا'
        }
    };

    function documentRef() { return root && root.document; }
    function storage() { try { return root && root.localStorage; } catch (error) { return null; } }
    function locale() {
        var document = documentRef();
        return document && document.documentElement && document.documentElement.lang === 'ur' ? 'ur' : 'en';
    }
    function t(key, values) {
        var value = COPY[locale()][key] || COPY.en[key] || key;
        Object.keys(values || {}).forEach(function (name) { value = value.split('{' + name + '}').join(values[name]); });
        return value;
    }

    function hasAcknowledged() {
        try { return storage().getItem(ACK_KEY) === '1'; } catch (error) { return false; }
    }
    function acknowledge() {
        try { storage().setItem(ACK_KEY, '1'); } catch (error) {}
    }

    function managementState() {
        try {
            var parsed = JSON.parse(storage().getItem(MANAGEMENT_KEY) || 'null');
            return parsed && parsed.items && typeof parsed.items === 'object' ? parsed : { items: {} };
        } catch (error) {
            return { items: {} };
        }
    }
    function saveManagement(state) {
        try { storage().setItem(MANAGEMENT_KEY, JSON.stringify(state)); } catch (error) {}
    }
    function rememberShare(result) {
        if (!result || !result.id || !result.manageToken) return;
        var state = managementState();
        state.items[result.id] = { token: result.manageToken, url: result.url, createdAt: new Date().toISOString() };
        Object.keys(state.items).sort(function (a, b) {
            return String(state.items[b].createdAt || '').localeCompare(String(state.items[a].createdAt || ''));
        }).slice(MANAGEMENT_LIMIT).forEach(function (id) { delete state.items[id]; });
        saveManagement(state);
    }
    function forgetShare(id) {
        var state = managementState();
        delete state.items[id];
        saveManagement(state);
    }
    function isManaged(id) {
        return Boolean(id && managementState().items[id]);
    }

    function ensureStyles() {
        var document = documentRef();
        if (!document || document.querySelector('link[href$="css/card-studio-publish.css"]')) return;
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/css/card-studio-publish.css';
        document.head.appendChild(link);
    }

    function el(tag, className, text) {
        var node = documentRef().createElement(tag);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    }

    function showDialog(marker, build) {
        var document = documentRef();
        ensureStyles();
        var previous = document.querySelector('dialog[' + marker + ']');
        if (previous) previous.remove();
        var dialog = el('dialog', 'wu-share-dialog');
        dialog.setAttribute(marker, '');
        dialog.setAttribute('dir', locale() === 'ur' ? 'rtl' : 'ltr');
        dialog.setAttribute('lang', locale());
        var shell = el('div', 'wu-share-dialog-shell');
        dialog.appendChild(shell);
        document.body.appendChild(dialog);
        build(shell, dialog);
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
        return dialog;
    }

    function closeDialog(dialog) {
        if (!dialog) return;
        if (typeof dialog.close === 'function' && dialog.open) dialog.close();
        dialog.remove();
    }

    function head(shell, title, intro, onClose) {
        var wrap = el('div', 'wu-share-dialog-head');
        var text = el('div');
        text.appendChild(el('h2', null, title));
        if (intro) text.appendChild(el('p', null, intro));
        var close = el('button', 'wu-share-dialog-close', '×');
        close.type = 'button';
        close.setAttribute('aria-label', t('close'));
        close.addEventListener('click', onClose);
        wrap.appendChild(text);
        wrap.appendChild(close);
        shell.appendChild(wrap);
    }

    // Resolves true when the person agrees to make a public link. Asked once per browser: an answer
    // given in Card Studio, Urdu Cards or on the homepage covers all of them.
    function requestConsent() {
        if (hasAcknowledged()) return Promise.resolve(true);
        if (!documentRef() || !documentRef().body) return Promise.resolve(false);
        return new Promise(function (resolve) {
            var settled = false;
            var dialog;
            function finish(value) {
                if (settled) return;
                settled = true;
                if (value) acknowledge();
                closeDialog(dialog);
                resolve(value);
            }
            dialog = showDialog('data-wu-share-consent', function (shell, node) {
                head(shell, t('consentTitle'), t('consentIntro'), function () { finish(false); });
                var card = el('div', 'wu-share-public-card');
                card.appendChild(el('div', 'wu-share-public-icon', 'WU'));
                var copy = el('div');
                copy.appendChild(el('strong', null, t('consentPublic')));
                copy.appendChild(el('span', null, t('consentWhat')));
                card.appendChild(copy);
                shell.appendChild(card);
                var list = el('ul', 'wu-share-checks');
                list.appendChild(el('li', null, t('consentDelete')));
                list.appendChild(el('li', null, t('consentPicture')));
                shell.appendChild(list);
                shell.appendChild(el('p', 'wu-share-small', t('consentPrivate')));
                var actions = el('div', 'wu-share-dialog-actions');
                var cancel = el('button', null, t('cancel'));
                cancel.type = 'button';
                cancel.setAttribute('data-wu-share-cancel', '');
                cancel.addEventListener('click', function () { finish(false); });
                var confirm = el('button', 'primary', t('confirm'));
                confirm.type = 'button';
                confirm.setAttribute('data-wu-share-confirm', '');
                confirm.addEventListener('click', function () { finish(true); });
                actions.appendChild(cancel);
                actions.appendChild(confirm);
                shell.appendChild(actions);
                node.addEventListener('cancel', function (event) { event.preventDefault(); finish(false); });
                node.addEventListener('click', function (event) { if (event.target === node) finish(false); });
                root.setTimeout(function () { confirm.focus(); }, 0);
            });
        });
    }

    function publish(form) {
        if (!root || typeof root.fetch !== 'function') return Promise.reject(new Error('publish_unavailable'));
        return root.fetch('/api/shares', { method: 'POST', body: form, credentials: 'same-origin', cache: 'no-store' }).then(function (response) {
            return response.json().catch(function () { return {}; }).then(function (result) {
                if (!response.ok || !result || !result.ok || !result.url) {
                    var error = new Error((result && result.error) || 'publish_failed');
                    error.code = (result && result.error) || 'publish_failed';
                    throw error;
                }
                rememberShare(result);
                return result;
            });
        });
    }

    function deleteShare(id) {
        var item = managementState().items[id];
        if (!item || !item.token || !root || typeof root.fetch !== 'function') return Promise.reject(new Error('delete_unavailable'));
        return root.fetch('/api/shares/' + encodeURIComponent(id), {
            method: 'DELETE',
            headers: { 'x-writeurdu-manage-token': item.token },
            credentials: 'same-origin'
        }).then(function (response) {
            // 404/410: already gone, so there is nothing left to manage.
            if (!response.ok && response.status !== 404 && response.status !== 410) throw new Error('delete_failed');
            forgetShare(id);
            return true;
        });
    }

    function manageDialog(options) {
        options = options || {};
        if (!documentRef() || !documentRef().body) return null;
        return showDialog('data-wu-share-manage', function (shell, node) {
            head(shell, t('manageTitle'), t('manageIntro'), function () { closeDialog(node); });
            var list = el('div', 'wu-share-list');
            list.setAttribute('data-wu-share-list', '');
            var status = el('p', 'wu-share-small');
            status.setAttribute('role', 'status');
            shell.appendChild(list);
            shell.appendChild(status);
            function render() {
                list.textContent = '';
                var items = managementState().items;
                var ids = Object.keys(items).sort(function (a, b) { return String(items[b].createdAt || '').localeCompare(String(items[a].createdAt || '')); });
                if (!ids.length) { list.appendChild(el('div', 'wu-share-empty', t('manageEmpty'))); return; }
                ids.forEach(function (id) {
                    var item = items[id];
                    var row = el('div', 'wu-share-list-item');
                    var info = el('div');
                    var url = el('strong', null, item.url || id);
                    url.setAttribute('dir', 'ltr');
                    info.appendChild(url);
                    if (item.createdAt) info.appendChild(el('span', null, t('published', { date: new Date(item.createdAt).toLocaleDateString(locale() === 'ur' ? 'ur-PK' : undefined) })));
                    var actions = el('div', 'wu-share-list-actions');
                    var open = el('a', null, t('open'));
                    open.href = item.url;
                    open.target = '_blank';
                    open.rel = 'noopener';
                    var remove = el('button', null, t('remove'));
                    remove.type = 'button';
                    remove.setAttribute('data-wu-share-delete', id);
                    remove.addEventListener('click', function () {
                        if (root.confirm && !root.confirm(t('removeConfirm'))) return;
                        remove.disabled = true;
                        deleteShare(id).then(function () {
                            status.textContent = t('removed');
                            if (typeof options.onDelete === 'function') options.onDelete(id);
                            render();
                        }, function () {
                            remove.disabled = false;
                            status.textContent = t('removeFailed');
                        });
                    });
                    actions.appendChild(open);
                    actions.appendChild(remove);
                    row.appendChild(info);
                    row.appendChild(actions);
                    list.appendChild(row);
                });
            }
            render();
            node.addEventListener('click', function (event) { if (event.target === node) closeDialog(node); });
        });
    }

    return {
        ACK_KEY: ACK_KEY,
        MANAGEMENT_KEY: MANAGEMENT_KEY,
        hasAcknowledged: hasAcknowledged,
        acknowledge: acknowledge,
        managementState: managementState,
        rememberShare: rememberShare,
        forgetShare: forgetShare,
        isManaged: isManaged,
        requestConsent: requestConsent,
        publish: publish,
        deleteShare: deleteShare,
        manageDialog: manageDialog
    };
}));
