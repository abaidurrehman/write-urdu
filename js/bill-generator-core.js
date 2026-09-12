(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.WriteUrduBillCore = factory();
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    var SCHEMA_VERSION = 1;
    var DOCUMENT_TYPES = ['bill', 'cash-memo', 'receipt'];
    var LANGUAGE_MODES = ['english', 'urdu', 'bilingual'];
    var PAYMENT_METHODS = ['cash', 'raast', 'jazzcash', 'easypaisa', 'bank-transfer', 'udhaar', 'other'];
    var PAYMENT_STATES = ['paid', 'partially-paid', 'unpaid'];

    var TERMINOLOGY = Object.freeze({
        bill: { english: 'Bill', urdu: 'بل' },
        cashMemo: { english: 'Cash Memo', urdu: 'کیش میمو' },
        receipt: { english: 'Receipt', urdu: 'رسید' },
        customer: { english: 'Customer', urdu: 'گاہک' },
        description: { english: 'Description', urdu: 'تفصیل' },
        quantity: { english: 'Quantity', urdu: 'تعداد' },
        rate: { english: 'Rate', urdu: 'نرخ' },
        subtotal: { english: 'Subtotal', urdu: 'جمع' },
        discount: { english: 'Discount', urdu: 'رعایت' },
        total: { english: 'Total', urdu: 'کل رقم' },
        paid: { english: 'Paid', urdu: 'ادا شدہ' },
        balance: { english: 'Balance', urdu: 'بقایا' },
        udhaar: { english: 'Udhaar', urdu: 'ادھار' },
        cash: { english: 'Cash', urdu: 'نقد' }
    });

    function text(value) {
        return value === undefined || value === null ? '' : String(value);
    }

    function trimmed(value, maxLength) {
        var valueText = text(value).trim();
        return typeof maxLength === 'number' ? valueText.slice(0, maxLength) : valueText;
    }

    function finiteNumber(value) {
        if (typeof value === 'number') return Number.isFinite(value) ? value : null;
        var valueText = text(value).replace(/,/g, '').trim();
        if (!valueText) return null;
        var parsed = Number(valueText);
        return Number.isFinite(parsed) ? parsed : null;
    }

    function normalizeNonNegativeNumber(value, fallback) {
        var parsed = finiteNumber(value);
        if (parsed === null || parsed < 0) return fallback === undefined ? 0 : fallback;
        return parsed;
    }

    function toMinor(value) {
        return Math.round(normalizeNonNegativeNumber(value, 0) * 100);
    }

    function quantityValue(value) {
        var parsed = finiteNumber(value);
        if (parsed === null || parsed < 0) return 0;
        return parsed;
    }

    function normalizeParty(value) {
        var party = value && typeof value === 'object' ? value : {};
        return {
            name: trimmed(party.name, 120),
            phone: trimmed(party.phone, 80)
        };
    }

    function normalizePaymentDetails(value) {
        var details = value && typeof value === 'object' ? value : {};
        return {
            raastId: trimmed(details.raastId, 120),
            phoneOrAccount: trimmed(details.phoneOrAccount, 120),
            accountTitle: trimmed(details.accountTitle, 120),
            ibanOrAccount: trimmed(details.ibanOrAccount, 160),
            note: trimmed(details.note, 240)
        };
    }

    function normalizeItem(item, index) {
        var value = item && typeof item === 'object' ? item : {};
        return {
            id: trimmed(value.id, 80) || 'item-' + (index + 1),
            description: trimmed(value.description, 240),
            quantity: quantityValue(value.quantity),
            rate: normalizeNonNegativeNumber(value.rate, 0)
        };
    }

    function isoDate(date) {
        var stamp = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
        return stamp.toISOString().slice(0, 10);
    }

    function sequenceNumber(prefix, date) {
        return prefix + '-' + isoDate(date).replace(/-/g, '') + '-001';
    }

    function createDefaultBillDocument(date, documentType) {
        var type = documentType === 'cash-memo' ? 'cash-memo' : 'bill';
        return {
            version: SCHEMA_VERSION,
            documentType: type,
            languageMode: 'bilingual',
            documentNumber: sequenceNumber(type === 'cash-memo' ? 'CM' : 'BILL', date),
            date: isoDate(date),
            business: { name: '', phone: '' },
            customer: { name: '', phone: '' },
            items: [{ id: 'item-1', description: '', quantity: 1, rate: 0 }],
            discount: 0,
            amountPaid: 0,
            paymentMethod: type === 'cash-memo' ? 'cash' : 'cash',
            paymentDetails: normalizePaymentDetails(),
            notes: ''
        };
    }

    function createDefaultReceiptDocument(date) {
        return {
            version: SCHEMA_VERSION,
            documentType: 'receipt',
            languageMode: 'bilingual',
            documentNumber: sequenceNumber('RCT', date),
            date: isoDate(date),
            business: { name: '', phone: '' },
            receivedFrom: { name: '', phone: '' },
            amountReceived: 0,
            purpose: '',
            paymentMethod: 'cash',
            paymentDetails: normalizePaymentDetails(),
            notes: ''
        };
    }

    function normalizeCommon(source, result) {
        result.version = SCHEMA_VERSION;
        result.languageMode = LANGUAGE_MODES.indexOf(source.languageMode) >= 0 ? source.languageMode : result.languageMode;
        result.documentNumber = trimmed(source.documentNumber || result.documentNumber, 80);
        result.date = /^\d{4}-\d{2}-\d{2}$/.test(text(source.date)) ? source.date : result.date;
        result.business = normalizeParty(source.business || result.business);
        result.paymentMethod = PAYMENT_METHODS.indexOf(source.paymentMethod) >= 0 ? source.paymentMethod : result.paymentMethod;
        result.paymentDetails = normalizePaymentDetails(source.paymentDetails || result.paymentDetails);
        result.notes = trimmed(source.notes, 1000);
        return result;
    }

    function normalizeBillLikeDocument(raw) {
        var source = raw && typeof raw === 'object' ? raw : {};
        var type = source.documentType === 'cash-memo' ? 'cash-memo' : 'bill';
        var result = createDefaultBillDocument(undefined, type);
        result = normalizeCommon(source, result);
        result.documentType = type;
        result.customer = normalizeParty(source.customer || result.customer);
        result.items = (Array.isArray(source.items) ? source.items : result.items).map(normalizeItem).slice(0, 50);
        if (!result.items.length) result.items = [normalizeItem({}, 0)];
        result.discount = normalizeNonNegativeNumber(source.discount, 0);
        result.amountPaid = normalizeNonNegativeNumber(source.amountPaid, 0);
        return result;
    }

    function normalizeReceiptDocument(raw) {
        var source = raw && typeof raw === 'object' ? raw : {};
        var result = createDefaultReceiptDocument();
        result = normalizeCommon(source, result);
        result.documentType = 'receipt';
        result.receivedFrom = normalizeParty(source.receivedFrom || result.receivedFrom);
        result.amountReceived = normalizeNonNegativeNumber(source.amountReceived, 0);
        result.purpose = trimmed(source.purpose, 500);
        return result;
    }

    function normalizeBillingDocument(raw) {
        return raw && raw.documentType === 'receipt' ? normalizeReceiptDocument(raw) : normalizeBillLikeDocument(raw);
    }

    function calculateBillTotals(raw) {
        var documentValue = normalizeBillLikeDocument(raw);
        var lineAmounts = documentValue.items.map(function (item) {
            return Math.round(toMinor(item.rate) * item.quantity);
        });
        var subtotalMinor = lineAmounts.reduce(function (sum, amount) { return sum + amount; }, 0);
        var discountMinor = Math.min(subtotalMinor, toMinor(documentValue.discount));
        var totalMinor = Math.max(0, subtotalMinor - discountMinor);
        var requestedPaidMinor = toMinor(documentValue.amountPaid);
        var amountPaidMinor = Math.min(totalMinor, requestedPaidMinor);
        var balanceMinor = Math.max(0, totalMinor - amountPaidMinor);
        var paymentState = totalMinor > 0 && amountPaidMinor >= totalMinor
            ? 'paid'
            : amountPaidMinor > 0
                ? 'partially-paid'
                : 'unpaid';
        return {
            lineAmounts: lineAmounts,
            subtotalMinor: subtotalMinor,
            discountMinor: discountMinor,
            totalMinor: totalMinor,
            amountPaidMinor: amountPaidMinor,
            balanceMinor: balanceMinor,
            paymentState: paymentState
        };
    }

    function commaInteger(value) {
        var source = String(Math.max(0, Math.floor(value)));
        return source.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function formatMoneyMinor(minorValue, options) {
        var value = Math.max(0, Math.round(finiteNumber(minorValue) || 0));
        var major = Math.floor(value / 100);
        var fraction = String(value % 100).padStart(2, '0');
        var prefix = options && options.prefix ? String(options.prefix) : 'PKR';
        return prefix + ' ' + commaInteger(major) + '.' + fraction;
    }

    function hasMeaningfulText(value) {
        return trimmed(value).length > 0;
    }

    function numericFieldError(value, field, allowZero) {
        var parsed = finiteNumber(value);
        if (parsed === null) return field + ':invalid';
        if (parsed < 0) return field + ':negative';
        if (!allowZero && parsed === 0) return field + ':zero';
        return null;
    }

    function validateBillingDocument(raw) {
        var source = raw && typeof raw === 'object' ? raw : {};
        var errors = [];
        if (DOCUMENT_TYPES.indexOf(source.documentType) < 0) errors.push('documentType:invalid');
        if (source.languageMode !== undefined && LANGUAGE_MODES.indexOf(source.languageMode) < 0) errors.push('languageMode:invalid');
        if (source.paymentMethod !== undefined && PAYMENT_METHODS.indexOf(source.paymentMethod) < 0) errors.push('paymentMethod:invalid');

        if (source.documentType === 'receipt') {
            var receiptAmountError = numericFieldError(source.amountReceived, 'amountReceived', false);
            if (receiptAmountError) errors.push(receiptAmountError);
        } else {
            var items = Array.isArray(source.items) ? source.items : [];
            if (!items.length) errors.push('items:required');
            items.forEach(function (item, index) {
                var row = item && typeof item === 'object' ? item : {};
                var quantityError = numericFieldError(row.quantity, 'items[' + index + '].quantity', false);
                var rateError = numericFieldError(row.rate, 'items[' + index + '].rate', true);
                if (quantityError) errors.push(quantityError);
                if (rateError) errors.push(rateError);
                if (!hasMeaningfulText(row.description) && finiteNumber(row.rate) === 0) errors.push('items[' + index + ']:not-meaningful');
            });
            if (source.discount !== undefined) {
                var discountError = numericFieldError(source.discount, 'discount', true);
                if (discountError) errors.push(discountError);
            }
            if (source.amountPaid !== undefined) {
                var paidError = numericFieldError(source.amountPaid, 'amountPaid', true);
                if (paidError) errors.push(paidError);
            }
        }
        return { valid: errors.length === 0, errors: errors };
    }

    function firstStrongDirection(value) {
        var source = text(value);
        for (var i = 0; i < source.length; i += 1) {
            var character = source.charAt(i);
            if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(character)) return 'rtl';
            if (/[A-Za-z]/.test(character)) return 'ltr';
        }
        return 'ltr';
    }

    function directionForValue(value, kind) {
        if (kind === 'identifier' || kind === 'number' || kind === 'phone' || kind === 'date') return 'ltr';
        return firstStrongDirection(value);
    }

    return {
        SCHEMA_VERSION: SCHEMA_VERSION,
        DOCUMENT_TYPES: DOCUMENT_TYPES,
        LANGUAGE_MODES: LANGUAGE_MODES,
        PAYMENT_METHODS: PAYMENT_METHODS,
        PAYMENT_STATES: PAYMENT_STATES,
        TERMINOLOGY: TERMINOLOGY,
        createDefaultBillDocument: createDefaultBillDocument,
        createDefaultReceiptDocument: createDefaultReceiptDocument,
        normalizeBillingDocument: normalizeBillingDocument,
        normalizeBillLikeDocument: normalizeBillLikeDocument,
        normalizeReceiptDocument: normalizeReceiptDocument,
        calculateBillTotals: calculateBillTotals,
        validateBillingDocument: validateBillingDocument,
        formatMoneyMinor: formatMoneyMinor,
        directionForValue: directionForValue,
        toMinor: toMinor,
        finiteNumber: finiteNumber
    };
}));
