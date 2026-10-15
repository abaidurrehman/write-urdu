(function () {
    'use strict';

    var root = document.querySelector('[data-bill-generator]');
    var core = window.WriteUrduBillCore;
    if (!root || !core) return;

    var PAYMENT_FIELDS = {
        cash: [], raast: ['raastId'], jazzcash: ['phoneOrAccount'], easypaisa: ['phoneOrAccount'],
        'bank-transfer': ['accountTitle', 'ibanOrAccount'], udhaar: [], other: ['note']
    };
    var DOCUMENT_LABELS = {
        bill: { en: 'Bill', ur: 'بل', prefix: 'BILL' },
        'cash-memo': { en: 'Cash Memo', ur: 'کیش میمو', prefix: 'CM' },
        receipt: { en: 'Payment Receipt', ur: 'رسید', prefix: 'RCT' }
    };
    var UNIT_LABELS = {
        piece: { en: 'pcs', ur: 'عدد' }, kg: { en: 'kg', ur: 'کلو' },
        meter: { en: 'm', ur: 'میٹر' }, hour: { en: 'hr', ur: 'گھنٹہ' }
    };
    var TEMPLATE_LABELS = {
        classic: 'Classic Urdu', modern: 'Modern Retail', boutique: 'Elegant Boutique',
        service: 'Service & Repair', thermal: 'Thermal Receipt'
    };
    var PRINT_LABELS = { a4: 'A4', a5: 'A5', '80mm': '80mm' };
    var PROFILE_KEY = 'write-urdu:bill:profile:v2';
    var DRAFT_KEY = 'write-urdu:bill:draft:v2';
    var LEGACY_KEY = 'write-urdu:bill:v1';
    var STORAGE_VERSION = 2;

    var preview = root.querySelector('[data-bill-preview]');
    var statusNode = root.querySelector('[data-bill-status]');
    var validationNode = root.querySelector('[data-bill-validation]');
    var modeStates = {};
    var startedTracked = false;
    var validationAttempted = false;
    var exportBusy = false;
    var cashMemoAutoPaid = false;

    function defaultPreferences() {
        return { template: 'classic', printSize: 'a4', accentColor: '#176b4b', showContact: true, closingMessage: '' };
    }

    function readJson(key) {
        try { return JSON.parse(window.localStorage.getItem(key) || 'null'); }
        catch (error) { return null; }
    }

    function writeJson(key, value) {
        try { window.localStorage.setItem(key, JSON.stringify(value)); return true; }
        catch (error) { return false; }
    }

    function clone(value) { return JSON.parse(JSON.stringify(value)); }

    function normalizedPreferences(raw) {
        var source = raw && typeof raw === 'object' ? raw : {};
        var defaults = defaultPreferences();
        return {
            template: Object.prototype.hasOwnProperty.call(TEMPLATE_LABELS, source.template) ? source.template : defaults.template,
            printSize: Object.prototype.hasOwnProperty.call(PRINT_LABELS, source.printSize) ? source.printSize : defaults.printSize,
            accentColor: /^#[0-9a-f]{6}$/i.test(String(source.accentColor || '')) ? source.accentColor : defaults.accentColor,
            showContact: source.showContact !== false,
            closingMessage: String(source.closingMessage || '').trim().slice(0, 180)
        };
    }

    function loadLocalState() {
        var profileEnvelope = readJson(PROFILE_KEY);
        var draftEnvelope = readJson(DRAFT_KEY);
        var legacy = readJson(LEGACY_KEY);
        var profile = profileEnvelope && profileEnvelope.v === STORAGE_VERSION ? profileEnvelope : null;
        var draft = draftEnvelope && draftEnvelope.v === STORAGE_VERSION ? draftEnvelope.document : null;
        if (!profile && legacy && legacy.bill) {
            profile = {
                v: STORAGE_VERSION,
                business: legacy.profile || legacy.bill.business || { name: '', phone: '' },
                languageMode: legacy.bill.languageMode || 'bilingual',
                preferences: defaultPreferences()
            };
        }
        if (!draft && legacy && legacy.bill) draft = legacy.bill;
        return {
            profile: profile || { v: STORAGE_VERSION, business: { name: '', phone: '' }, languageMode: 'bilingual', preferences: defaultPreferences() },
            draft: draft ? core.normalizeBillingDocument(draft) : null
        };
    }

    var local = loadLocalState();
    var preferences = normalizedPreferences(local.profile.preferences);
    var state = local.draft || core.createDefaultBillDocument(new Date());
    if (!local.draft) {
        state.business = clone(local.profile.business || { name: '', phone: '' });
        state.languageMode = local.profile.languageMode || 'bilingual';
    }

    function track(name, detail) {
        try {
            if (window.WriteUrduTelemetry && typeof window.WriteUrduTelemetry.track === 'function') {
                window.WriteUrduTelemetry.track(name, detail || {});
            }
        } catch (error) {}
    }

    function markStarted() {
        if (startedTracked) return;
        startedTracked = true;
        track('billing_started', { mode: state.documentType });
    }

    function esc(value) {
        return String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g, function (char) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
        });
    }

    function pathParts(path) { return path.split('.'); }
    function getPath(object, path) { return pathParts(path).reduce(function (value, key) { return value && value[key]; }, object); }
    function setPath(object, path, value) {
        var keys = pathParts(path);
        var target = object;
        keys.slice(0, -1).forEach(function (key) {
            if (!target[key] || typeof target[key] !== 'object') target[key] = {};
            target = target[key];
        });
        target[keys[keys.length - 1]] = value;
    }

    function label(en, ur) {
        if (state.languageMode === 'urdu') return '<bdi class="bill-urdu-label" lang="ur" dir="rtl">' + esc(ur) + '</bdi>';
        if (state.languageMode === 'bilingual') return esc(en) + ' <span aria-hidden="true">/</span> <bdi class="bill-urdu-label" lang="ur" dir="rtl">' + esc(ur) + '</bdi>';
        return esc(en);
    }

    function money(minor) { return core.formatMoneyMinor(minor); }
    function previewMoney(minor) {
        if (state.languageMode !== 'urdu') return money(minor);
        return money(minor).replace(/^PKR\s*/, '') + ' روپے';
    }

    function unitLabel(unit) {
        var value = UNIT_LABELS[unit] || UNIT_LABELS.piece;
        if (state.languageMode === 'urdu') return value.ur;
        if (state.languageMode === 'bilingual') return value.en + ' / ' + value.ur;
        return value.en;
    }

    function documentLabel() { return DOCUMENT_LABELS[state.documentType] || DOCUMENT_LABELS.bill; }

    function setStatus(message, type) {
        if (!statusNode) return;
        statusNode.textContent = message;
        statusNode.classList.toggle('is-error', type === 'error');
        statusNode.classList.toggle('is-ready', type === 'ready');
    }

    function persist() {
        writeJson(PROFILE_KEY, {
            v: STORAGE_VERSION,
            business: clone(state.business || { name: '', phone: '' }),
            languageMode: state.languageMode,
            preferences: preferences
        });
        writeJson(DRAFT_KEY, { v: STORAGE_VERSION, document: state });
    }

    function nextDocumentNumber(previous, dateIso, type) {
        var meta = DOCUMENT_LABELS[type] || DOCUMENT_LABELS.bill;
        var match = /^(.*?)(\d{8})-(\d+)$/.exec(String(previous || ''));
        var stamp = String(dateIso || '').replace(/-/g, '');
        var next = match && match[2] === stamp && match[1] === meta.prefix + '-' ? Number(match[3]) + 1 : 1;
        return meta.prefix + '-' + stamp + '-' + String(next).padStart(3, '0');
    }

    function syncCashMemoPaid() {
        if (state.documentType === 'cash-memo' && cashMemoAutoPaid) {
            state.amountPaid = (core.calculateBillTotals(state).totalMinor / 100).toFixed(2);
        }
    }

    function renderItemsEditor(focusIndex) {
        var host = root.querySelector('[data-bill-items]');
        if (!host || state.documentType === 'receipt') return;
        var totals = core.calculateBillTotals(state);
        host.innerHTML = state.items.map(function (item, index) {
            var unitOptions = core.ITEM_UNITS.map(function (unit) {
                return '<option value="' + unit + '"' + (item.unit === unit ? ' selected' : '') + '>' + esc(UNIT_LABELS[unit].en) + '</option>';
            }).join('');
            return '<div class="bill-item-row" data-item-id="' + esc(item.id) + '" data-item-index="' + index + '">' +
                '<input data-item-field="description" value="' + esc(item.description) + '" placeholder="Item / service" aria-label="Item or service ' + (index + 1) + '">' +
                '<input data-item-field="quantity" inputmode="decimal" min="0" value="' + esc(item.quantity) + '" aria-label="Quantity for item ' + (index + 1) + '">' +
                '<select data-item-field="unit" aria-label="Unit for item ' + (index + 1) + '">' + unitOptions + '</select>' +
                '<input data-item-field="rate" inputmode="decimal" min="0" value="' + esc(item.rate) + '" aria-label="Rate for item ' + (index + 1) + '">' +
                '<span class="bill-item-amount" aria-label="Amount for item ' + (index + 1) + '">' + esc(money(totals.lineAmounts[index] || 0)) + '</span>' +
                '<span class="bill-item-actions"><button type="button" class="bill-item-copy" data-copy-item aria-label="Duplicate item ' + (index + 1) + '" title="Duplicate">＋</button>' +
                '<button type="button" class="bill-item-remove" data-remove-item aria-label="Remove item ' + (index + 1) + '" title="Remove">×</button></span></div>';
        }).join('');
        if (typeof focusIndex === 'number') {
            var focusField = host.querySelector('[data-item-index="' + focusIndex + '"] [data-item-field="description"]');
            if (focusField) focusField.focus();
        }
    }

    function renderPaymentFields() {
        var relevant = PAYMENT_FIELDS[state.paymentMethod] || [];
        root.querySelectorAll('[data-payment-field]').forEach(function (block) {
            block.hidden = relevant.indexOf(block.getAttribute('data-payment-field')) < 0;
        });
    }

    function renderModeFields() {
        var receipt = state.documentType === 'receipt';
        root.querySelector('[data-billlike-fields]').hidden = receipt;
        root.querySelector('[data-receipt-fields]').hidden = !receipt;
        root.querySelector('[data-customer-phone-field]').hidden = receipt;
        root.querySelector('[data-received-phone-field]').hidden = !receipt;
        root.querySelectorAll('[data-document-type]').forEach(function (button) {
            var selected = button.getAttribute('data-document-type') === state.documentType;
            button.classList.toggle('is-selected', selected);
            button.setAttribute('aria-pressed', selected ? 'true' : 'false');
        });
        var mobileLabel = root.querySelector('[data-bill-mobile-label]');
        if (mobileLabel) mobileLabel.textContent = receipt ? 'Received' : 'Total';
    }

    function renderFieldValues() {
        root.querySelectorAll('[data-field]').forEach(function (field) {
            var value = getPath(state, field.getAttribute('data-field'));
            if (document.activeElement !== field) field.value = value === undefined || value === null ? '' : value;
        });
        renderModeFields();
        renderPaymentFields();
    }

    function renderPreferences() {
        root.querySelectorAll('[data-template-option]').forEach(function (button) {
            var selected = button.getAttribute('data-template-option') === preferences.template;
            button.setAttribute('aria-pressed', selected ? 'true' : 'false');
            button.classList.toggle('is-selected', selected);
        });
        root.querySelectorAll('[data-preference]').forEach(function (field) {
            var key = field.getAttribute('data-preference');
            if (field.type === 'checkbox') field.checked = Boolean(preferences[key]);
            else if (document.activeElement !== field) field.value = preferences[key];
        });
        var previewName = root.querySelector('[data-bill-preview-name]');
        if (previewName) previewName.textContent = TEMPLATE_LABELS[preferences.template] + ' · ' + PRINT_LABELS[preferences.printSize];
    }

    function paymentLabel() {
        var labels = {
            english: { cash: 'Cash', raast: 'Raast', jazzcash: 'JazzCash', easypaisa: 'Easypaisa', 'bank-transfer': 'Bank transfer', udhaar: 'Udhaar', other: 'Other' },
            urdu: { cash: 'نقد', raast: 'راست', jazzcash: 'جاز کیش', easypaisa: 'ایزی پیسہ', 'bank-transfer': 'بینک ٹرانسفر', udhaar: 'ادھار', other: 'دیگر' },
            bilingual: { cash: 'Cash / نقد', raast: 'Raast', jazzcash: 'JazzCash', easypaisa: 'Easypaisa', 'bank-transfer': 'Bank transfer', udhaar: 'Udhaar / ادھار', other: 'Other' }
        };
        return (labels[state.languageMode] || labels.english)[state.paymentMethod] || state.paymentMethod;
    }

    function paymentDetailsHtml() {
        var relevant = PAYMENT_FIELDS[state.paymentMethod] || [];
        var details = state.paymentDetails || {};
        var parts = relevant.map(function (key) { return details[key]; }).filter(Boolean);
        return parts.length ? ' <span aria-hidden="true">·</span> <bdi dir="ltr">' + parts.map(esc).join(' · ') + '</bdi>' : '';
    }

    function statusBadge(paymentState) {
        var values = {
            paid: ['PAID', 'ادا شدہ'], 'partially-paid': ['PART PAID', 'جزوی ادائیگی'], unpaid: ['BALANCE DUE', 'بقایا رقم']
        }[paymentState] || ['UNPAID', 'بقایا'];
        return '<span class="bill-state-badge bill-state-' + paymentState + '">' + label(values[0], values[1]) + '</span>';
    }

    function commonHeader(meta, badge) {
        var businessName = state.business && state.business.name ? state.business.name : 'Your shop name';
        var businessPhone = preferences.showContact && state.business && state.business.phone
            ? '<div class="bill-page-phone"><bdi dir="ltr">' + esc(state.business.phone) + '</bdi></div>' : '';
        return '<header class="bill-page-header"><div class="bill-brand-block"><p class="bill-document-kicker">' + label(meta.en, meta.ur) + '</p><h2 class="bill-page-title" dir="auto">' + esc(businessName) + '</h2>' + businessPhone + '</div>' +
            '<div class="bill-page-meta">' + badge + '<div># <bdi dir="ltr">' + esc(state.documentNumber) + '</bdi></div><div><bdi dir="ltr">' + esc(state.date) + '</bdi></div></div></header>';
    }

    function commonFooter() {
        var closing = preferences.closingMessage ? '<p class="bill-closing" dir="auto">' + esc(preferences.closingMessage) + '</p>' : '';
        return closing + '<p class="bill-generator-credit">Made privately with WriteUrdu</p>';
    }

    function renderBillPreview() {
        var totals = core.calculateBillTotals(state);
        var itemRows = state.items.map(function (item, index) {
            return '<tr><td>' + (index + 1) + '</td><td dir="' + core.directionForValue(item.description, 'text') + '">' + (esc(item.description) || '—') + '</td>' +
                '<td class="bill-numeric"><bdi>' + esc(item.quantity || 0) + ' ' + esc(unitLabel(item.unit)) + '</bdi></td>' +
                '<td class="bill-numeric"><bdi>' + esc(previewMoney(core.toMinor(item.rate))) + '</bdi></td>' +
                '<td class="bill-numeric"><bdi>' + esc(previewMoney(totals.lineAmounts[index] || 0)) + '</bdi></td></tr>';
        }).join('');
        var customerParts = [state.customer && state.customer.name, state.customer && state.customer.phone].filter(Boolean);
        var customerLine = customerParts.length ? '<div class="bill-page-customer">' + label('Customer', 'گاہک') + ': <bdi dir="auto">' + esc(customerParts.join(' · ')) + '</bdi></div>' : '';
        var totalsRows = '<tr><td>' + label('Subtotal', 'جمع') + '</td><td class="bill-numeric"><bdi>' + esc(previewMoney(totals.subtotalMinor)) + '</bdi></td></tr>' +
            (totals.discountMinor > 0 ? '<tr><td>' + label('Discount', 'رعایت') + '</td><td class="bill-numeric"><bdi>−' + esc(previewMoney(totals.discountMinor)) + '</bdi></td></tr>' : '') +
            '<tr class="bill-grand-total"><td>' + label('Total', 'کل رقم') + '</td><td class="bill-numeric"><bdi>' + esc(previewMoney(totals.totalMinor)) + '</bdi></td></tr>' +
            '<tr><td>' + label('Paid', 'ادا شدہ') + '</td><td class="bill-numeric"><bdi>' + esc(previewMoney(totals.amountPaidMinor)) + '</bdi></td></tr>' +
            '<tr class="' + (totals.balanceMinor > 0 ? 'bill-balance-positive' : 'bill-balance-zero') + '"><td>' + label('Balance due', 'بقایا رقم') + '</td><td class="bill-numeric"><bdi>' + esc(previewMoney(totals.balanceMinor)) + '</bdi></td></tr>';
        return commonHeader(documentLabel(), statusBadge(totals.paymentState)) +
            '<div class="bill-page-parties">' + customerLine + '</div>' +
            '<table class="bill-items-table"><thead><tr><th>#</th><th>' + label('Item / service', 'سامان / خدمت') + '</th><th class="bill-numeric">' + label('Qty', 'تعداد') + '</th><th class="bill-numeric">' + label('Rate', 'قیمت') + '</th><th class="bill-numeric">' + label('Amount', 'رقم') + '</th></tr></thead><tbody>' + itemRows + '</tbody></table>' +
            '<div class="bill-summary-block"><table class="bill-totals"><tbody>' + totalsRows + '</tbody></table></div>' +
            '<p class="bill-payment-line"><strong>' + label('Payment', 'ادائیگی') + '</strong> ' + esc(paymentLabel()) + paymentDetailsHtml() + '</p>' +
            (state.notes ? '<p class="bill-note" dir="auto">' + esc(state.notes) + '</p>' : '') + commonFooter();
    }

    function renderReceiptPreview() {
        var received = state.receivedFrom || {};
        var receivedParts = [received.name, received.phone].filter(Boolean);
        return commonHeader(documentLabel(), '<span class="bill-state-badge bill-state-paid">' + label('RECEIVED', 'وصول شدہ') + '</span>') +
            '<div class="bill-receipt-amount"><span>' + label('Amount received', 'وصول شدہ رقم') + '</span><strong><bdi>' + esc(previewMoney(core.toMinor(state.amountReceived))) + '</bdi></strong></div>' +
            '<dl class="bill-receipt-details"><div><dt>' + label('Received from', 'وصول کنندہ') + '</dt><dd dir="auto">' + esc(receivedParts.join(' · ') || '—') + '</dd></div>' +
            '<div><dt>' + label('For', 'مد') + '</dt><dd dir="auto">' + esc(state.purpose || '—') + '</dd></div>' +
            '<div><dt>' + label('Payment method', 'طریقۂ ادائیگی') + '</dt><dd>' + esc(paymentLabel()) + paymentDetailsHtml() + '</dd></div></dl>' +
            (state.notes ? '<p class="bill-note" dir="auto">' + esc(state.notes) + '</p>' : '') + commonFooter();
    }

    function renderEditorTotals() {
        var host = root.querySelector('[data-bill-editor-totals]');
        if (!host || state.documentType === 'receipt') return;
        var totals = core.calculateBillTotals(state);
        host.innerHTML = '<span>' + label('Total', 'کل رقم') + '<strong>' + esc(previewMoney(totals.totalMinor)) + '</strong></span>' +
            '<span class="' + (totals.balanceMinor > 0 ? 'has-balance' : '') + '">' + label('Balance', 'بقایا') + '<strong>' + esc(previewMoney(totals.balanceMinor)) + '</strong></span>';
    }

    function renderPreview() {
        preview.setAttribute('dir', state.languageMode === 'urdu' ? 'rtl' : 'ltr');
        preview.setAttribute('data-template', preferences.template);
        preview.setAttribute('data-print-size', preferences.printSize);
        preview.style.setProperty('--bill-document-accent', preferences.accentColor);
        preview.innerHTML = state.documentType === 'receipt' ? renderReceiptPreview() : renderBillPreview();
        renderEditorTotals();
        var mobileTotal = root.querySelector('[data-bill-mobile-total]');
        if (mobileTotal) mobileTotal.textContent = state.documentType === 'receipt'
            ? previewMoney(core.toMinor(state.amountReceived)) : previewMoney(core.calculateBillTotals(state).totalMinor);
        renderPreferences();
        persist();
        if (validationAttempted) renderValidation();
    }

    function friendlyError(error) {
        if (error === 'business.name:required') return 'Add your shop or business name.';
        if (/^amountReceived:(zero|invalid|negative)$/.test(error)) return 'Enter an amount received greater than zero.';
        if (/\.description:required$/.test(error)) return 'Add a name for every item or service.';
        if (/\.quantity:zero$/.test(error)) return 'Quantity must be greater than zero.';
        if (/\.quantity:(invalid|negative)$/.test(error)) return 'Enter a valid non-negative quantity.';
        if (/\.rate:(invalid|negative)$/.test(error)) return 'Enter a valid non-negative rate.';
        if (error === 'discount:exceeds-subtotal') return 'Discount cannot be more than the subtotal.';
        if (error === 'amountPaid:exceeds-total') return 'Amount received cannot be more than the total.';
        if (error === 'discount:negative') return 'Discount cannot be negative.';
        if (error === 'amountPaid:negative') return 'Amount received cannot be negative.';
        return 'Check the highlighted fields before continuing.';
    }

    function renderValidation() {
        var result = core.validateBillingDocument(state);
        root.querySelectorAll('[aria-invalid="true"]').forEach(function (field) { field.removeAttribute('aria-invalid'); });
        if (result.valid) {
            validationNode.hidden = true;
            validationNode.innerHTML = '';
            return result;
        }
        result.errors.forEach(function (error) {
            var selector = null;
            var itemMatch = /^items\[(\d+)\]\.([a-z]+):/.exec(error);
            if (itemMatch) selector = '[data-item-index="' + itemMatch[1] + '"] [data-item-field="' + itemMatch[2] + '"]';
            else if (error.indexOf('business.name:') === 0) selector = '[data-field="business.name"]';
            else if (error.indexOf('amountReceived:') === 0) selector = '[data-field="amountReceived"]';
            else if (error.indexOf('discount:') === 0) selector = '[data-field="discount"]';
            else if (error.indexOf('amountPaid:') === 0) selector = '[data-field="amountPaid"]';
            var field = selector ? root.querySelector(selector) : null;
            if (field) field.setAttribute('aria-invalid', 'true');
        });
        var unique = result.errors.map(friendlyError).filter(function (message, index, list) { return list.indexOf(message) === index; });
        validationNode.innerHTML = '<strong>Please fix this before exporting:</strong><ul>' + unique.map(function (message) { return '<li>' + esc(message) + '</li>'; }).join('') + '</ul>';
        validationNode.hidden = false;
        return result;
    }

    function ensureValidOutput() {
        validationAttempted = true;
        var result = renderValidation();
        if (!result.valid) {
            setStatus('Check the highlighted fields.', 'error');
            validationNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
            track('billing_error', { category: 'validation' });
            return false;
        }
        return true;
    }

    function itemCountBucket(count) {
        if (count <= 1) return '1';
        if (count <= 3) return '2-3';
        if (count <= 6) return '4-6';
        return '7+';
    }

    function sharedDocument(type) {
        var next = type === 'receipt' ? core.createDefaultReceiptDocument(new Date()) : core.createDefaultBillDocument(new Date(), type);
        next.business = clone(state.business || { name: '', phone: '' });
        next.languageMode = state.languageMode;
        next.paymentMethod = type === 'cash-memo' ? 'cash' : state.paymentMethod;
        return next;
    }

    function switchDocumentType(type) {
        if (!DOCUMENT_LABELS[type] || type === state.documentType) return;
        modeStates[state.documentType] = clone(state);
        var previous = state;
        if (modeStates[type]) state = clone(modeStates[type]);
        else if (type !== 'receipt' && previous.documentType !== 'receipt') {
            state = core.normalizeBillLikeDocument(previous);
            state.documentType = type;
            state.documentNumber = nextDocumentNumber('', state.date, type);
            if (type === 'cash-memo') {
                state.paymentMethod = 'cash';
                cashMemoAutoPaid = true;
                syncCashMemoPaid();
            }
        } else state = sharedDocument(type);
        if (type !== 'cash-memo') cashMemoAutoPaid = false;
        validationAttempted = false;
        startedTracked = false;
        renderItemsEditor();
        renderFieldValues();
        renderPreview();
        setStatus(DOCUMENT_LABELS[type].en + ' ready.', 'ready');
        track('billing_mode_selected', { mode: type });
    }

    function onFieldChange(field) {
        var path = field.getAttribute('data-field');
        setPath(state, path, field.value);
        if (path === 'amountPaid') cashMemoAutoPaid = false;
        markStarted();
        if (path === 'paymentMethod') {
            var relevant = PAYMENT_FIELDS[field.value] || [];
            ['raastId', 'phoneOrAccount', 'accountTitle', 'ibanOrAccount', 'note'].forEach(function (key) {
                if (relevant.indexOf(key) < 0) state.paymentDetails[key] = '';
            });
            renderPaymentFields();
            track('billing_payment_category_selected', { category: field.value });
        }
        if (path === 'languageMode') track('billing_language_selected', { mode: field.value });
        renderPreview();
    }

    function onItemChange(field) {
        var row = field.closest('[data-item-index]');
        var index = row ? Number(row.getAttribute('data-item-index')) : -1;
        var item = state.items[index];
        if (!item) return;
        item[field.getAttribute('data-item-field')] = field.value;
        markStarted();
        syncCashMemoPaid();
        var amountNode = row.querySelector('.bill-item-amount');
        if (amountNode) amountNode.textContent = money(core.calculateBillTotals(state).lineAmounts[index] || 0);
        var paidField = root.querySelector('[data-field="amountPaid"]');
        if (paidField && cashMemoAutoPaid) paidField.value = state.amountPaid;
        renderPreview();
    }

    function updatePreference(field) {
        var key = field.getAttribute('data-preference');
        preferences[key] = field.type === 'checkbox' ? field.checked : field.value;
        preferences = normalizedPreferences(preferences);
        renderPreview();
    }

    function safeFilename() {
        var meta = documentLabel();
        var number = String(state.documentNumber || meta.prefix).replace(/[^A-Za-z0-9-]+/g, '-').replace(/^-|-$/g, '');
        return (number || meta.prefix).toLowerCase() + '.pdf';
    }

    function pdfDimensions(canvas) {
        if (preferences.printSize === 'a5') return { width: 148, height: 210, margin: 8 };
        if (preferences.printSize === '80mm') {
            var width = 80;
            var margin = 4;
            return { width: width, height: Math.max(60, canvas.height * (width - margin * 2) / canvas.width + margin * 2), margin: margin };
        }
        return { width: 210, height: 297, margin: 10 };
    }

    function buildPdfBlob(canvas) {
        var Pdf = window.jspdf.jsPDF;
        var size = pdfDimensions(canvas);
        var doc = new Pdf({ unit: 'mm', format: [size.width, size.height], orientation: 'portrait', compress: true });
        var imageWidth = size.width - size.margin * 2;
        var contentHeight = size.height - size.margin * 2;
        var pixelsPerMm = canvas.width / imageWidth;
        var slicePixels = Math.max(1, Math.floor(contentHeight * pixelsPerMm));
        var offset = 0;
        var page = 0;
        while (offset < canvas.height) {
            var height = Math.min(slicePixels, canvas.height - offset);
            var slice = document.createElement('canvas');
            slice.width = canvas.width;
            slice.height = height;
            var context = slice.getContext('2d');
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, slice.width, slice.height);
            context.drawImage(canvas, 0, offset, canvas.width, height, 0, 0, canvas.width, height);
            if (page > 0) doc.addPage([size.width, size.height], 'portrait');
            doc.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', size.margin, size.margin, imageWidth, height / pixelsPerMm, undefined, 'FAST');
            offset += height;
            page += 1;
        }
        return doc.output('blob');
    }

    function createPdfFile() {
        if (typeof window.html2canvas !== 'function' || !window.jspdf || typeof window.jspdf.jsPDF !== 'function') {
            return Promise.reject(new Error('pdf-unavailable'));
        }
        return window.html2canvas(preview, { backgroundColor: '#ffffff', scale: 2, useCORS: true, logging: false }).then(function (canvas) {
            var blob = buildPdfBlob(canvas);
            var filename = safeFilename();
            var file = typeof window.File === 'function' ? new File([blob], filename, { type: 'application/pdf' }) : null;
            return { blob: blob, file: file, filename: filename };
        });
    }

    function downloadBlob(blob, filename) {
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    function setExportBusy(busy) {
        exportBusy = busy;
        root.querySelectorAll('[data-bill-pdf],[data-bill-share],[data-bill-mobile-share]').forEach(function (button) { button.disabled = busy; });
    }

    function downloadPdf() {
        if (exportBusy || !ensureValidOutput()) return;
        setExportBusy(true);
        setStatus('Preparing your PDF…', 'ready');
        track('billing_output_attempted', { format: 'pdf' });
        createPdfFile().then(function (result) {
            downloadBlob(result.blob, result.filename);
            setStatus('PDF downloaded.', 'ready');
            track('billing_output_completed', { format: 'pdf' });
        }).catch(function (error) {
            var unavailable = error && error.message === 'pdf-unavailable';
            setStatus(unavailable ? 'PDF export is unavailable. Use Print / Save PDF.' : 'Unable to create the PDF. Your document is still safe.', 'error');
            track('billing_error', { category: unavailable ? 'pdf-unavailable' : 'pdf-failed' });
        }).finally(function () { setExportBusy(false); });
    }

    function shareDocument() {
        if (exportBusy || !ensureValidOutput()) return;
        setExportBusy(true);
        setStatus('Preparing a private file to share…', 'ready');
        track('billing_output_attempted', { format: 'share' });
        createPdfFile().then(function (result) {
            var canShareFile = result.file && navigator.share && (!navigator.canShare || navigator.canShare({ files: [result.file] }));
            if (canShareFile) {
                return navigator.share({ files: [result.file], title: documentLabel().en, text: 'Your document is ready. Thank you.' }).then(function () {
                    setStatus('Shared from your device.', 'ready');
                    track('billing_output_completed', { format: 'share' });
                }).catch(function (error) {
                    if (error && error.name === 'AbortError') return setStatus('Sharing cancelled. Your document was not changed.', 'ready');
                    downloadBlob(result.blob, result.filename);
                    root.querySelector('[data-bill-share-fallback]').hidden = false;
                    setStatus('PDF downloaded. Attach it in WhatsApp or another app.', 'ready');
                    track('billing_error', { category: 'share-fallback' });
                });
            }
            downloadBlob(result.blob, result.filename);
            root.querySelector('[data-bill-share-fallback]').hidden = false;
            setStatus('PDF downloaded. Attach it in WhatsApp or another app.', 'ready');
            track('billing_output_completed', { format: 'share-fallback' });
        }).catch(function () {
            setStatus('Sharing is unavailable. Use Print / Save PDF.', 'error');
            track('billing_error', { category: 'share-unavailable' });
        }).finally(function () { setExportBusy(false); });
    }

    function configurePrintPage() {
        var style = document.querySelector('[data-bill-print-rules]');
        if (!style) {
            style = document.createElement('style');
            style.setAttribute('data-bill-print-rules', '');
            document.head.appendChild(style);
        }
        if (preferences.printSize === 'a5') style.textContent = '@page { size: A5 portrait; margin: 8mm; }';
        else if (preferences.printSize === '80mm') {
            var heightMm = Math.max(80, Math.ceil(preview.scrollHeight * 25.4 / 96) + 8);
            style.textContent = '@page { size: 80mm ' + heightMm + 'mm; margin: 4mm; }';
        } else style.textContent = '@page { size: A4 portrait; margin: 12mm; }';
        document.body.setAttribute('data-bill-print-size', preferences.printSize);
    }

    function newDocument() {
        if (!window.confirm('Start a new document? Your shop details and design will stay saved.')) return;
        var previous = state;
        var type = state.documentType;
        state = type === 'receipt' ? core.createDefaultReceiptDocument(new Date()) : core.createDefaultBillDocument(new Date(), type);
        state.business = clone(previous.business || { name: '', phone: '' });
        state.languageMode = previous.languageMode;
        state.documentNumber = nextDocumentNumber(previous.documentNumber, state.date, type);
        if (type === 'cash-memo') { state.paymentMethod = 'cash'; cashMemoAutoPaid = true; }
        modeStates = {};
        validationAttempted = false;
        startedTracked = false;
        renderItemsEditor();
        renderFieldValues();
        renderPreview();
        setStatus('New ' + documentLabel().en.toLowerCase() + ' ready. Shop details kept; customer details cleared.', 'ready');
    }

    function setMobilePreview(open) {
        root.classList.toggle('is-mobile-preview-open', open);
        document.body.classList.toggle('bill-preview-lock', open);
        if (open) root.querySelector('[data-bill-preview-close]').focus();
        else root.querySelector('[data-bill-mobile-preview]').focus();
    }

    function clearLocalData() {
        if (!window.confirm('Clear the saved shop profile and unfinished document from this device?')) return;
        [PROFILE_KEY, DRAFT_KEY, LEGACY_KEY].forEach(function (key) { try { window.localStorage.removeItem(key); } catch (error) {} });
        preferences = defaultPreferences();
        state = core.createDefaultBillDocument(new Date());
        modeStates = {};
        validationAttempted = false;
        renderItemsEditor();
        renderFieldValues();
        renderPreferences();
        renderPreview();
        setStatus('Saved data cleared from this device.', 'ready');
    }

    function bind() {
        root.addEventListener('input', function (event) {
            var itemField = event.target.closest('[data-item-field]');
            if (itemField) return onItemChange(itemField);
            var field = event.target.closest('[data-field]');
            if (field) return onFieldChange(field);
            var preference = event.target.closest('[data-preference]');
            if (preference) updatePreference(preference);
        });
        root.addEventListener('change', function (event) {
            var itemField = event.target.closest('[data-item-field]');
            if (itemField) return onItemChange(itemField);
            var field = event.target.closest('[data-field]');
            if (field) return onFieldChange(field);
            var preference = event.target.closest('[data-preference]');
            if (preference) updatePreference(preference);
        });
        root.addEventListener('click', function (event) {
            var mode = event.target.closest('[data-document-type]');
            if (mode) return switchDocumentType(mode.getAttribute('data-document-type'));
            var template = event.target.closest('[data-template-option]');
            if (template) {
                preferences.template = template.getAttribute('data-template-option');
                if (preferences.template === 'thermal') preferences.printSize = '80mm';
                else if (preferences.printSize === '80mm') preferences.printSize = 'a4';
                return renderPreview();
            }
            var remove = event.target.closest('[data-remove-item]');
            if (remove) {
                var row = remove.closest('[data-item-index]');
                var index = Number(row.getAttribute('data-item-index'));
                if (state.items.length === 1) state.items[0] = { id: 'item-' + Date.now(), description: '', quantity: 1, unit: 'piece', rate: 0 };
                else state.items.splice(index, 1);
                syncCashMemoPaid();
                renderItemsEditor(Math.max(0, index - 1));
                return renderPreview();
            }
            var copy = event.target.closest('[data-copy-item]');
            if (copy) {
                var sourceRow = copy.closest('[data-item-index]');
                var sourceIndex = Number(sourceRow.getAttribute('data-item-index'));
                var duplicate = clone(state.items[sourceIndex]);
                duplicate.id = 'item-' + Date.now();
                state.items.splice(sourceIndex + 1, 0, duplicate);
                syncCashMemoPaid();
                renderItemsEditor(sourceIndex + 1);
                return renderPreview();
            }
        });
        root.querySelector('[data-bill-add-item]').addEventListener('click', function () {
            if (state.items.length >= 50) return;
            state.items.push({ id: 'item-' + Date.now(), description: '', quantity: 1, unit: 'piece', rate: 0 });
            markStarted();
            track('billing_item_count_bucket', { bucket: itemCountBucket(state.items.length) });
            renderItemsEditor(state.items.length - 1);
            renderPreview();
        });
        root.querySelector('[data-bill-new]').addEventListener('click', newDocument);
        var pdfPrintButton = root.querySelector('[data-bill-pdf-print]');
        if (pdfPrintButton) pdfPrintButton.addEventListener('click', function () {
            if (!ensureValidOutput()) return;
            configurePrintPage();
            track('billing_output_attempted', { format: 'print-' + preferences.printSize });
            setStatus('Print window opened. Choose a printer or Save as PDF.', 'ready');
            window.print();
            track('billing_output_completed', { format: 'print-' + preferences.printSize });
        });
        root.querySelector('[data-bill-pdf]').addEventListener('click', downloadPdf);
        root.querySelector('[data-bill-share]').addEventListener('click', shareDocument);
        root.querySelector('[data-bill-mobile-share]').addEventListener('click', shareDocument);
        root.querySelector('[data-bill-mobile-preview]').addEventListener('click', function () { setMobilePreview(true); });
        root.querySelector('[data-bill-preview-close]').addEventListener('click', function () { setMobilePreview(false); });
        root.querySelector('[data-bill-clear-local]').addEventListener('click', clearLocalData);
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && root.classList.contains('is-mobile-preview-open')) setMobilePreview(false);
        });
    }

    if (local.draft) setStatus('Restored your unfinished document from this device.', 'ready');
    track('billing_tool_viewed', { route: '/urdu-bill-generator' });
    track('billing_mode_selected', { mode: state.documentType });
    bind();
    renderItemsEditor();
    renderFieldValues();
    renderPreferences();
    renderPreview();
}());
