(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.WriteUrduInvoiceCore = factory();
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    var MAX_ITEMS = 6;
    var SCHEMA_VERSION = 2;
    var CURRENCIES = ['PKR', 'USD', 'GBP', 'EUR', 'AED', 'SAR'];
    var STATUSES = ['Unpaid', 'Partially paid', 'Paid'];

    function nowIso() { return new Date().toISOString(); }
    function id(prefix) { return prefix + '_' + Math.random().toString(36).slice(2, 10); }
    function text(value) { return value === null || value === undefined ? '' : String(value); }
    function hasMeaningfulText(value) { return text(value).trim().length > 0; }
    function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
    function numberValue(value, fallback) {
        var parsed = typeof value === 'number' ? value : Number(String(value === undefined || value === null ? '' : value).replace(/,/g, '').trim());
        if (Number.isFinite(parsed)) return parsed;
        return fallback === undefined ? 0 : fallback;
    }
    function minor(value) { return Math.round(Math.max(0, numberValue(value, 0) * 100)); }
    function money(minorValue) { return Math.round(numberValue(minorValue, 0)); }
    function adjustment(mode, value) {
        return { mode: mode === 'percentage' || mode === 'flat' ? mode : 'disabled', value: text(value) };
    }
    function emptyParty() {
        return { name: '', tagline: '', logoId: null, address: '', phone: '', email: '', website: '', referenceLabel: '', referenceValue: '', referenceLabel2: '', referenceValue2: '' };
    }
    function emptyItem() { return { id: id('item'), description: '', quantity: '1', unitPrice: '' }; }
    function emptySections() {
        return {
            qr: { enabled: false, visibilityMode: 'manual' },
            notesTerms: { enabled: true, visibilityMode: 'auto' },
            paymentDetails: { enabled: true, visibilityMode: 'auto' },
            authorization: { enabled: false, visibilityMode: 'manual' },
            footer: { enabled: true, visibilityMode: 'auto' }
        };
    }
    function createDefaultInvoiceDocument(date) {
        var stamp = date instanceof Date ? date : new Date();
        var year = stamp.getFullYear();
        var isoDate = stamp.toISOString().slice(0, 10);
        return {
            schemaVersion: SCHEMA_VERSION,
            id: id('invoice'),
            createdAt: stamp.toISOString(),
            updatedAt: stamp.toISOString(),
            languageMode: 'english',
            templateId: 'professional-bilingual',
            invoiceTitle: 'INVOICE',
            invoiceNumber: 'INV-' + year + '-0001',
            issueDate: isoDate,
            dueDate: '',
            status: 'Unpaid',
            currency: 'PKR',
            customCurrencyLabel: '',
            seller: emptyParty(),
            buyer: emptyParty(),
            items: [emptyItem()],
            discount: adjustment('disabled', ''),
            tax: adjustment('disabled', ''),
            additionalCharge: '',
            amountPaid: '',
            notes: '',
            terms: '',
            paymentDetails: { bankName: '', accountTitle: '', accountNumber: '', iban: '', instructions: '' },
            authorization: { name: '', role: '', signatureImageId: null, stampImageId: null },
            footerMessage: '',
            qr: { enabled: false, purpose: 'business-contact', captionMode: 'automatic', customCaption: '', caption: '', position: 'seller-section', whatsappNumber: '', url: '', customContent: '' },
            sections: emptySections(),
            preferences: { densityMode: 'automatic', sellerHeaderMode: 'identity-only', showGeneratorCredit: true },
            generatedSequenceYear: year,
            generatedSequenceValue: 1,
            sequenceCommitted: false
        };
    }
    function merge(base, value) {
        if (!value || typeof value !== 'object') return base;
        Object.keys(value).forEach(function (key) {
            if (value[key] && typeof value[key] === 'object' && !Array.isArray(value[key]) && base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) base[key] = merge(base[key], value[key]);
            else if (value[key] !== undefined) base[key] = value[key];
        });
        return base;
    }
    function normalizeInvoiceDocument(raw) {
        var source = raw && typeof raw === 'object' ? raw : {};
        var result = merge(createDefaultInvoiceDocument(), source);
        result.schemaVersion = SCHEMA_VERSION;
        result.languageMode = ['english', 'urdu', 'bilingual'].indexOf(result.languageMode) >= 0 ? result.languageMode : 'english';
        result.currency = CURRENCIES.indexOf(result.currency) >= 0 ? result.currency : 'PKR';
        result.status = STATUSES.indexOf(result.status) >= 0 ? result.status : 'Unpaid';
        result.invoiceNumber = text(result.invoiceNumber).trim().slice(0, 60);
        result.invoiceTitle = text(result.invoiceTitle).trim().slice(0, 80) || (result.languageMode === 'urdu' ? 'انوائس' : 'INVOICE');
        result.items = (Array.isArray(result.items) ? result.items : []).slice(0, MAX_ITEMS).map(function (item) {
            return { id: text(item && item.id) || id('item'), description: text(item && item.description).slice(0, 80), quantity: text(item && item.quantity), unitPrice: text(item && item.unitPrice) };
        });
        if (!result.items.length) result.items = [emptyItem()];
        result.discount = adjustment(result.discount && result.discount.mode, result.discount && result.discount.value);
        result.tax = adjustment(result.tax && result.tax.mode, result.tax && result.tax.value);
        result.additionalCharge = text(result.additionalCharge);
        result.amountPaid = text(result.amountPaid);
        ['notes', 'terms', 'footerMessage'].forEach(function (key) { result[key] = text(result[key]); });
        result.sections = merge(emptySections(), result.sections || {});
        ['qr', 'notesTerms', 'paymentDetails', 'authorization', 'footer'].forEach(function (key) {
            result.sections[key].enabled = result.sections[key].enabled !== false;
        });
        result.qr = merge({ enabled: false, purpose: 'business-contact', captionMode: 'automatic', customCaption: '', caption: '', position: 'seller-section', whatsappNumber: '', url: '', customContent: '' }, result.qr || {});
        result.qr.purpose = ['business-contact', 'payment-information', 'whatsapp', 'url', 'custom'].indexOf(result.qr.purpose) >= 0 ? result.qr.purpose : 'custom';
        result.qr.captionMode = result.qr.captionMode === 'custom' ? 'custom' : 'automatic';
        result.qr.position = ['seller-section', 'header', 'footer'].indexOf(result.qr.position) >= 0 ? result.qr.position : 'seller-section';
        var legacyCaption = text(result.qr.caption).trim();
        var customCaption = text(result.qr.customCaption).trim();
        if (!customCaption && legacyCaption && !isTechnicalQrCaption(legacyCaption)) {
            result.qr.customCaption = legacyCaption;
            result.qr.captionMode = 'custom';
        } else result.qr.customCaption = customCaption;
        result.qr.enabled = Boolean(result.qr.enabled);
        result.preferences = merge({ densityMode: 'automatic', sellerHeaderMode: 'identity-only', showGeneratorCredit: true }, result.preferences || {});
        result.preferences.densityMode = ['automatic', 'comfortable', 'balanced', 'compact'].indexOf(result.preferences.densityMode) >= 0 ? result.preferences.densityMode : 'automatic';
        result.preferences.sellerHeaderMode = ['identity-only', 'full-details'].indexOf(result.preferences.sellerHeaderMode) >= 0 ? result.preferences.sellerHeaderMode : 'identity-only';
        result.preferences.showGeneratorCredit = result.preferences.showGeneratorCredit !== false;
        result.updatedAt = nowIso();
        return result;
    }
    function isTechnicalQrCaption(value) {
        var caption = text(value).trim();
        return !caption || /^https?:\/\//i.test(caption) || /^BEGIN:VCARD/i.test(caption) || /^WIFI:/i.test(caption) || /^https:\/\/wa\.me\//i.test(caption) || /^\+?[\d\s().-]{7,}$/.test(caption);
    }
    function calculateAdjustment(adjustmentValue, baseMinor) {
        if (!adjustmentValue || adjustmentValue.mode === 'disabled') return 0;
        var value = numberValue(adjustmentValue.value, 0);
        if (value <= 0) return 0;
        if (adjustmentValue.mode === 'percentage') return Math.min(baseMinor, Math.round(baseMinor * clamp(value, 0, 100) / 100));
        return Math.min(baseMinor, minor(value));
    }
    function calculateInvoiceTotals(invoice) {
        var doc = normalizeInvoiceDocument(invoice);
        var lineAmounts = doc.items.map(function (item) { return minor(numberValue(item.quantity, 0) * numberValue(item.unitPrice, 0)); });
        var subtotal = lineAmounts.reduce(function (sum, value) { return sum + value; }, 0);
        var discount = calculateAdjustment(doc.discount, subtotal);
        var afterDiscount = Math.max(0, subtotal - discount);
        var tax = calculateAdjustment(doc.tax, afterDiscount);
        var additional = minor(doc.additionalCharge);
        var grand = afterDiscount + tax + additional;
        var paid = Math.min(grand, minor(doc.amountPaid));
        return { lineAmounts: lineAmounts, subtotalMinor: subtotal, discountMinor: discount, afterDiscountMinor: afterDiscount, taxMinor: tax, additionalChargeMinor: additional, grandTotalMinor: grand, amountPaidMinor: paid, balanceDueMinor: Math.max(0, grand - paid) };
    }
    function shouldShowNotesTerms(invoice) {
        return invoice.sections.notesTerms.enabled !== false && (hasMeaningfulText(invoice.notes) || hasMeaningfulText(invoice.terms));
    }
    function shouldShowPaymentDetails(invoice) {
        var p = invoice.paymentDetails || {};
        return invoice.sections.paymentDetails.enabled !== false && ['bankName', 'accountTitle', 'accountNumber', 'iban', 'instructions'].some(function (key) { return hasMeaningfulText(p[key]); });
    }
    function shouldShowAuthorization(invoice) {
        var a = invoice.authorization || {};
        return invoice.sections.authorization.enabled === true && (hasMeaningfulText(a.name) || hasMeaningfulText(a.role) || a.signatureImageId || a.stampImageId);
    }
    function getVisibility(invoice) {
        var doc = normalizeInvoiceDocument(invoice);
        var totals = calculateInvoiceTotals(doc);
        return { header: true, seller: true, buyer: true, items: true, totals: true, notesTerms: shouldShowNotesTerms(doc), paymentDetails: shouldShowPaymentDetails(doc), authorization: shouldShowAuthorization(doc), footer: doc.sections.footer.enabled !== false && hasMeaningfulText(doc.footerMessage), qr: doc.sections.qr.enabled === true && doc.qr.enabled === true && Boolean(getQrPayload(doc)), discount: totals.discountMinor > 0, tax: totals.taxMinor > 0, additionalCharge: totals.additionalChargeMinor > 0, amountPaid: totals.amountPaidMinor > 0, balanceDue: doc.status !== 'Paid' || totals.amountPaidMinor > 0 || totals.balanceDueMinor !== totals.grandTotalMinor };
    }
    function resolveNotesTermsVariant(invoice) {
        var hasNotes = hasMeaningfulText(invoice.notes), hasTerms = hasMeaningfulText(invoice.terms);
        if (hasNotes && hasTerms) return 'both';
        if (hasNotes) return 'notes';
        if (hasTerms) return 'terms';
        return 'hidden';
    }
    function resolveNotesTermsHeading(languageMode, hasNotes, hasTerms) {
        if (!hasNotes && !hasTerms) return null;
        var key = hasNotes && hasTerms ? 'both' : hasNotes ? 'notes' : 'terms';
        var headings = {
            english: { notes: 'Notes', terms: 'Terms & Conditions', both: 'Notes & Terms' },
            urdu: { notes: 'نوٹس', terms: 'شرائط و ضوابط', both: 'نوٹس اور شرائط' },
            bilingual: { notes: 'Notes / نوٹس', terms: 'Terms & Conditions / شرائط و ضوابط', both: 'Notes & Terms / نوٹس اور شرائط' }
        };
        return (headings[languageMode] || headings.english)[key];
    }
    function resolveHeaderContact(seller) {
        var party = seller || {};
        if (hasMeaningfulText(party.website)) return { type: 'website', value: text(party.website).trim() };
        if (hasMeaningfulText(party.email)) return { type: 'email', value: text(party.email).trim() };
        if (hasMeaningfulText(party.phone)) return { type: 'phone', value: text(party.phone).trim() };
        return null;
    }
    function resolveSellerHeaderContent(invoice) {
        var doc = invoice && invoice.seller ? invoice : null, seller = doc ? doc.seller : (invoice || {}), preferences = doc && doc.preferences ? doc.preferences : {};
        var mode = preferences.sellerHeaderMode === 'full-details' ? 'full-details' : 'identity-only';
        return { mode: mode, name: text(seller.name).trim(), tagline: text(seller.tagline).trim(), contact: resolveHeaderContact(seller), logoId: seller.logoId || null };
    }
    function estimateLines(value) { return hasMeaningfulText(value) ? Math.max(1, text(value).split(/\r?\n/).reduce(function (sum, line) { return sum + Math.max(1, Math.ceil(line.length / 62)); }, 0)) : 0; }
    function isMeaningfulItem(item) { return hasMeaningfulText(item && item.description) || hasMeaningfulText(item && item.unitPrice) || (item && Number(item.quantity) !== 1); }
    function estimateLongTextScore(invoice) {
        return [invoice.notes, invoice.terms, invoice.paymentDetails && invoice.paymentDetails.instructions, invoice.seller && invoice.seller.address, invoice.buyer && invoice.buyer.address].reduce(function (score, value) { return score + (estimateLines(value) >= 3 ? 1 : 0); }, 0);
    }
    function resolveInvoiceDensity(context) {
        var ctx = context || {}, override = ctx.preferences && ctx.preferences.densityMode;
        if (ctx.items || ctx.seller || ctx.buyer) {
            var doc = normalizeInvoiceDocument(ctx), visible = getVisibility(doc);
            ctx = { itemCount: doc.items.filter(isMeaningfulItem).length, visibleOptionalSectionCount: [visible.notesTerms, visible.paymentDetails, visible.authorization, visible.qr].filter(Boolean).length, notesLineEstimate: estimateLines(doc.notes), termsLineEstimate: estimateLines(doc.terms), sellerVisibleFieldCount: Object.keys(doc.seller).filter(function (key) { return ['name', 'tagline', 'address', 'phone', 'email', 'website', 'referenceLabel', 'referenceValue', 'referenceLabel2', 'referenceValue2'].indexOf(key) >= 0 && hasMeaningfulText(doc.seller[key]); }).length, buyerVisibleFieldCount: Object.keys(doc.buyer).filter(function (key) { return ['name', 'address', 'phone', 'email', 'referenceLabel', 'referenceValue', 'referenceLabel2', 'referenceValue2'].indexOf(key) >= 0 && hasMeaningfulText(doc.buyer[key]); }).length, hasPaymentDetails: visible.paymentDetails, hasAuthorization: visible.authorization, hasQr: visible.qr, languageMode: doc.languageMode, longTextScore: estimateLongTextScore(doc), preferences: doc.preferences };
            override = doc.preferences.densityMode;
        }
        if (['comfortable', 'balanced', 'compact'].indexOf(override) >= 0) return override;
        var pressure = 0;
        pressure += (Number(ctx.itemCount) || 0) * 2;
        pressure += (Number(ctx.visibleOptionalSectionCount) || 0) * 2;
        pressure += Math.min(Number(ctx.notesLineEstimate) || 0, 6);
        pressure += Math.min(Number(ctx.termsLineEstimate) || 0, 6);
        pressure += Math.max(0, (Number(ctx.sellerVisibleFieldCount) || 0) - 4);
        pressure += Math.max(0, (Number(ctx.buyerVisibleFieldCount) || 0) - 4);
        pressure += ctx.hasPaymentDetails ? 3 : 0;
        pressure += ctx.hasAuthorization ? 3 : 0;
        pressure += ctx.hasQr ? 2 : 0;
        pressure += ctx.languageMode === 'bilingual' ? 3 : 0;
        pressure += ctx.languageMode === 'urdu' ? 1 : 0;
        pressure += Math.min(Number(ctx.longTextScore) || 0, 4) * 2;
        if (pressure <= 11) return 'comfortable';
        if (pressure >= 25) return 'compact';
        return 'balanced';
    }
    function lowerSectionLayout(visibility) {
        var notes = visibility.notesTerms, payment = visibility.paymentDetails, auth = visibility.authorization;
        if (!notes && !payment && !auth) return { leftPrimary: null, leftSecondary: null, rightPrimary: 'totals', rightSecondary: null, mode: 'totals-only' };
        if (notes && payment) return { leftPrimary: 'notesTerms', leftSecondary: 'paymentDetails', rightPrimary: 'totals', rightSecondary: auth ? 'authorization' : null, mode: 'stacked-left' };
        if (notes) return { leftPrimary: 'notesTerms', leftSecondary: null, rightPrimary: 'totals', rightSecondary: auth ? 'authorization' : null, mode: 'two-column' };
        if (payment && auth) return { leftPrimary: 'paymentDetails', leftSecondary: null, rightPrimary: 'totals', rightSecondary: 'authorization', mode: 'two-column' };
        if (payment) return { leftPrimary: 'paymentDetails', leftSecondary: null, rightPrimary: 'totals', rightSecondary: null, mode: 'two-column' };
        return { leftPrimary: null, leftSecondary: null, rightPrimary: 'totals', rightSecondary: 'authorization', mode: 'full-width-secondary' };
    }
    function buildInvoicePreviewViewModel(invoice, totals) {
        var doc = normalizeInvoiceDocument(invoice), calculated = totals || calculateInvoiceTotals(doc), visibility = getVisibility(doc), optionalCount = [visibility.notesTerms, visibility.paymentDetails, visibility.authorization, visibility.qr].filter(Boolean).length;
        var sellerFields = ['name', 'tagline', 'address', 'phone', 'email', 'website', 'referenceLabel', 'referenceValue', 'referenceLabel2', 'referenceValue2'].filter(function (key) { return hasMeaningfulText(doc.seller[key]); }).length;
        var buyerFields = ['name', 'address', 'phone', 'email', 'referenceLabel', 'referenceValue', 'referenceLabel2', 'referenceValue2'].filter(function (key) { return hasMeaningfulText(doc.buyer[key]); }).length;
        var density = resolveInvoiceDensity(doc), sellerHeader = resolveSellerHeaderContent(doc);
        return { document: doc, totals: calculated, visibility: visibility, density: density, notesTermsVariant: resolveNotesTermsVariant(doc), notesTermsHeading: resolveNotesTermsHeading(doc.languageMode, hasMeaningfulText(doc.notes), hasMeaningfulText(doc.terms)), headerContact: sellerHeader.contact, sellerHeader: sellerHeader, qrCaption: resolveQrCaption(doc.qr, doc.languageMode), lowerLayout: lowerSectionLayout(visibility), showDiscountRow: visibility.discount, showTaxRow: visibility.tax, showAdditionalChargeRow: visibility.additionalCharge, showAmountPaidRow: visibility.amountPaid, showBalanceDueRow: visibility.balanceDue, useAlternatingItemRows: doc.items.filter(isMeaningfulItem).length >= 4, showGeneratorCredit: doc.preferences.showGeneratorCredit !== false };
    }
    function resolveQrCaption(qr, languageMode) {
        var settings = qr || {}, custom = text(settings.customCaption || settings.caption).trim();
        if (settings.captionMode === 'custom' && custom && !isTechnicalQrCaption(custom)) return custom;
        var captions = {
            english: { 'business-contact': 'Scan to save our contact details', 'payment-information': 'Scan for payment details', whatsapp: 'Scan to contact us on WhatsApp', url: 'Scan to open link', custom: 'Scan QR code' },
            urdu: { 'business-contact': 'ہماری رابطہ معلومات محفوظ کرنے کے لیے اسکین کریں', 'payment-information': 'ادائیگی کی تفصیلات کے لیے اسکین کریں', whatsapp: 'واٹس ایپ پر رابطے کے لیے اسکین کریں', url: 'لنک کھولنے کے لیے اسکین کریں', custom: 'کیو آر کوڈ اسکین کریں' },
            bilingual: { 'business-contact': 'Scan to save our contact details\nرابطہ معلومات محفوظ کرنے کے لیے اسکین کریں', 'payment-information': 'Scan for payment details\nادائیگی کی تفصیلات کے لیے اسکین کریں', whatsapp: 'Scan to contact us on WhatsApp\nواٹس ایپ پر رابطے کے لیے اسکین کریں', url: 'Scan to open link\nلنک کھولنے کے لیے اسکین کریں', custom: 'Scan QR code\nکیو آر کوڈ اسکین کریں' }
        };
        return (captions[languageMode] || captions.english)[settings.purpose] || captions.english.custom;
    }
    function requiresZeroTotalConfirmation(invoice, totals) {
        var calculated = totals || calculateInvoiceTotals(invoice);
        return calculated.grandTotalMinor === 0;
    }
    function getQrPayload(invoice) {
        var qr = invoice.qr || {};
        if (!qr.enabled) return '';
        if (qr.purpose === 'business-contact') {
            var seller = invoice.seller || {}, contact = ['BEGIN:VCARD', 'VERSION:3.0', 'FN:' + text(seller.name).trim()];
            if (hasMeaningfulText(seller.phone)) contact.push('TEL:' + text(seller.phone).trim());
            if (hasMeaningfulText(seller.email)) contact.push('EMAIL:' + text(seller.email).trim());
            if (hasMeaningfulText(seller.website)) contact.push('URL:' + text(seller.website).trim());
            if (hasMeaningfulText(seller.address)) contact.push('ADR:;;' + text(seller.address).trim().replace(/[\r\n]+/g, ', ') + ';;;;');
            contact.push('END:VCARD');
            return hasMeaningfulText(seller.name) ? contact.join('\n') : '';
        }
        if (qr.purpose === 'payment-information') {
            var totals = calculateInvoiceTotals(invoice), payment = invoice.paymentDetails || {};
            return [['Business', invoice.seller && invoice.seller.name], ['Invoice', invoice.invoiceNumber], ['Amount', formatMoney(totals.grandTotalMinor, invoice.currency)], ['Account title', payment.accountTitle], ['IBAN', payment.iban]].filter(function (row) { return hasMeaningfulText(row[1]); }).map(function (row) { return row[0] + ': ' + text(row[1]).trim(); }).join('\n');
        }
        if (qr.purpose === 'url') return text(qr.url).trim();
        if (qr.purpose === 'whatsapp') return text(qr.whatsappNumber).replace(/[^0-9]/g, '') ? 'https://wa.me/' + text(qr.whatsappNumber).replace(/[^0-9]/g, '') : '';
        return text(qr.customContent).trim();
    }
    function validateInvoice(invoice) {
        var doc = normalizeInvoiceDocument(invoice);
        var errors = {};
        if (!hasMeaningfulText(doc.seller.name)) errors['seller.name'] = 'Business name is required.';
        if (!hasMeaningfulText(doc.buyer.name)) errors['buyer.name'] = 'Client name is required.';
        if (!hasMeaningfulText(doc.invoiceNumber)) errors.invoiceNumber = 'Invoice number is required.';
        if (!hasMeaningfulText(doc.issueDate)) errors.issueDate = 'Invoice date is required.';
        var validItems = 0;
        doc.items.forEach(function (item, index) {
            var quantity = numberValue(item.quantity, NaN);
            var rate = numberValue(item.unitPrice, NaN);
            if (!hasMeaningfulText(item.description)) errors['items.' + index + '.description'] = 'Add a description.';
            if (!Number.isFinite(quantity) || quantity <= 0) errors['items.' + index + '.quantity'] = 'Quantity must be greater than zero.';
            if (!Number.isFinite(rate) || rate < 0) errors['items.' + index + '.unitPrice'] = 'Unit price must be zero or greater.';
            if (hasMeaningfulText(item.description) && Number.isFinite(quantity) && quantity > 0 && Number.isFinite(rate) && rate >= 0) validItems += 1;
        });
        if (!validItems) errors.items = 'Add at least one valid line item.';
        if (doc.items.length > MAX_ITEMS) errors.items = 'This one-page invoice supports up to six items.';
        if (doc.qr.enabled) {
            var qrPayload = getQrPayload(doc);
            if (!qrPayload) errors.qr = 'Add valid QR content or turn the QR section off.';
            if (doc.qr.purpose === 'url' && qrPayload && !/^https?:\/\//i.test(qrPayload)) errors.qr = 'Use a complete http:// or https:// URL for the QR code.';
            if (doc.qr.purpose === 'whatsapp' && qrPayload && !/^https:\/\/wa\.me\/\d{7,15}$/i.test(qrPayload)) errors.qr = 'Enter a WhatsApp number with 7–15 digits.';
        }
        return { valid: Object.keys(errors).length === 0, errors: errors, warnings: doc.dueDate && doc.issueDate && doc.dueDate < doc.issueDate ? ['Due date is earlier than invoice date.'] : [] };
    }
    function isMeaningfulDraft(invoice) {
        var doc = normalizeInvoiceDocument(invoice);
        var defaults = createDefaultInvoiceDocument(new Date(doc.createdAt || Date.now()));
        return hasMeaningfulText(doc.seller.name) || hasMeaningfulText(doc.buyer.name) || doc.items.some(function (item) { return hasMeaningfulText(item.description) || hasMeaningfulText(item.unitPrice); }) || hasMeaningfulText(doc.notes) || hasMeaningfulText(doc.terms) || hasMeaningfulText(doc.footerMessage) || doc.qr.enabled || doc.sections.authorization.enabled || doc.invoiceNumber !== defaults.invoiceNumber;
    }
    function formatMoney(minorValue, currency) {
        var amount = numberValue(minorValue, 0) / 100;
        var label = currency || 'PKR';
        return label + ' ' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    function safeFilename(invoiceNumber, clientName, extension) {
        var base = ('Invoice-' + (text(invoiceNumber).trim() || 'draft') + '-' + (text(clientName).trim() || 'client')).replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 100) || 'Invoice-draft';
        return base + (extension && extension.charAt(0) === '.' ? extension : '.' + (extension || 'pdf'));
    }
    function nextInvoiceNumber(year, sequence) { return 'INV-' + year + '-' + String(Math.max(1, Math.floor(numberValue(sequence, 1)))).padStart(4, '0'); }
    return { MAX_ITEMS: MAX_ITEMS, CURRENCIES: CURRENCIES, STATUSES: STATUSES, SCHEMA_VERSION: SCHEMA_VERSION, createDefaultInvoiceDocument: createDefaultInvoiceDocument, normalizeInvoiceDocument: normalizeInvoiceDocument, migrateInvoiceDocument: normalizeInvoiceDocument, calculateInvoiceTotals: calculateInvoiceTotals, getVisibility: getVisibility, resolveNotesTermsVariant: resolveNotesTermsVariant, resolveNotesTermsHeading: resolveNotesTermsHeading, resolveHeaderContact: resolveHeaderContact, resolveSellerHeaderContent: resolveSellerHeaderContent, resolveInvoiceDensity: resolveInvoiceDensity, lowerSectionLayout: lowerSectionLayout, buildInvoicePreviewViewModel: buildInvoicePreviewViewModel, resolveQrCaption: resolveQrCaption, requiresZeroTotalConfirmation: requiresZeroTotalConfirmation, getQrPayload: getQrPayload, validateInvoice: validateInvoice, isMeaningfulDraft: isMeaningfulDraft, formatMoney: formatMoney, safeFilename: safeFilename, nextInvoiceNumber: nextInvoiceNumber, hasMeaningfulText: hasMeaningfulText };
}));
