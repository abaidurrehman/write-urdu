(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./invoice-generator-core.js'));
    else root.WriteUrduInvoiceDocument = factory(root.WriteUrduInvoiceCore);
}(typeof self !== 'undefined' ? self : this, function (core) {
    'use strict';

    // The one renderer for every invoice surface: live preview, template
    // thumbnails, PDF, PNG and print all call renderPages() with the same
    // invoice document, so what people see is exactly what they export.

    var LABELS = {
        invoice: ['Invoice', 'انوائس'],
        from: ['From', 'منجانب'],
        billTo: ['Bill to', 'بنام'],
        invoiceNo: ['Invoice no.', 'انوائس نمبر'],
        date: ['Date', 'تاریخ'],
        due: ['Due date', 'ادائیگی کی آخری تاریخ'],
        item: ['Item or service', 'تفصیل'],
        qty: ['Qty', 'تعداد'],
        price: ['Price', 'قیمت'],
        amount: ['Amount', 'رقم'],
        subtotal: ['Subtotal', 'میزان'],
        discount: ['Discount', 'رعایت'],
        tax: ['Tax', 'ٹیکس'],
        additional: ['Additional charges', 'اضافی اخراجات'],
        total: ['Total', 'کل رقم'],
        paid: ['Amount paid', 'ادا شدہ رقم'],
        balance: ['Balance due', 'بقایا رقم'],
        amountDue: ['Amount due', 'واجب الادا رقم'],
        payment: ['Payment details', 'ادائیگی کی تفصیلات'],
        bank: ['Bank', 'بینک'],
        accountTitle: ['Account title', 'اکاؤنٹ ٹائٹل'],
        accountNumber: ['Account no.', 'اکاؤنٹ نمبر'],
        iban: ['IBAN', 'آئی بین'],
        wallet: ['Mobile wallet', 'موبائل والیٹ'],
        authorised: ['Authorised signature', 'مجاز دستخط'],
        page: ['Page', 'صفحہ'],
        of: ['of', 'از'],
        continued: ['continued', 'جاری'],
        Unpaid: ['Unpaid', 'ادائیگی باقی'],
        'Partially paid': ['Partially paid', 'جزوی ادائیگی'],
        Paid: ['Paid', 'ادا شدہ']
    };
    var URDU_MONTHS = ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'];
    var EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var TEMPLATE_NAMES = { modern: 'Modern Professional', 'classic-urdu': 'Classic Urdu', contemporary: 'Contemporary Business' };
    var URDU_PATTERN = /[\u0600-ۿݐ-ݿﭐ-﷿ﹰ-\ufeff]/;

    function esc(value) {
        return String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g, function (char) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]; });
    }
    function has(value) { return core.hasMeaningfulText(value); }
    function hasUrdu(value) { return URDU_PATTERN.test(String(value || '')); }

    // Theme colours are computed here (not with CSS color-mix) because the
    // canvas exporter only understands plain hex/rgb values.
    function hexToRgb(hex) { var v = parseInt(String(hex).slice(1), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; }
    function rgbToHex(rgb) { return '#' + rgb.map(function (c) { return ('0' + Math.round(Math.max(0, Math.min(255, c))).toString(16)).slice(-2); }).join(''); }
    function mix(hex, other, amount) { var a = hexToRgb(hex), b = hexToRgb(other); return rgbToHex(a.map(function (c, i) { return c + (b[i] - c) * amount; })); }
    function luminance(hex) {
        return hexToRgb(hex).map(function (c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }).reduce(function (sum, c, i) { return sum + c * [0.2126, 0.7152, 0.0722][i]; }, 0);
    }
    function themeVars(doc) {
        var accent = doc.design.accent, light = luminance(accent) > 0.36;
        var ink = light ? mix(accent, '#000000', 0.55) : accent;
        return {
            '--inv-accent': accent,
            '--inv-accent-ink': ink,
            '--inv-on-accent': light ? '#15181d' : '#ffffff',
            '--inv-accent-soft': mix(accent, '#ffffff', 0.92),
            '--inv-accent-tint': mix(accent, '#ffffff', 0.82),
            '--inv-accent-line': mix(accent, '#ffffff', 0.6)
        };
    }

    function labelFor(doc, key, options) {
        var pair = LABELS[key] || [key, key], mode = doc.languageMode;
        if (mode === 'urdu') return '<span class="inv-l inv-l-ur" lang="ur">' + esc(pair[1]) + '</span>';
        if (mode === 'english') return '<span class="inv-l inv-l-en">' + esc(pair[0]) + '</span>';
        return '<span class="inv-l inv-l-bi' + (options && options.stack ? ' inv-l-stack' : '') + '"><span class="inv-l-en">' + esc(pair[0]) + '</span><span class="inv-l-ur" lang="ur">' + esc(pair[1]) + '</span></span>';
    }
    // User-entered text keeps its own direction (dir=auto) and gets Urdu
    // line spacing only when it actually contains Urdu, so mixed invoices
    // never clip tall Nastaliq letters or reverse English phrases.
    function userText(value, tag, className) {
        var name = tag || 'span';
        var classes = [className || '', hasUrdu(value) ? 'inv-ur' : ''].join(' ').trim();
        return '<' + name + ' dir="auto"' + (classes ? ' class="' + classes + '"' : '') + '>' + esc(value) + '</' + name + '>';
    }
    function ltr(value, className) { return '<bdi class="inv-ltr' + (className ? ' ' + className : '') + '" dir="ltr">' + esc(value) + '</bdi>'; }

    function formatDate(doc, value) {
        var parts = String(value || '').split('-');
        if (parts.length !== 3) return esc(value || '');
        var day = String(Number(parts[2])), month = Number(parts[1]) - 1, year = parts[0];
        if (!(month >= 0 && month < 12)) return esc(value);
        if (doc.languageMode === 'urdu') return '<span class="inv-date" dir="rtl" lang="ur"><bdi dir="ltr">' + day + '</bdi> ' + URDU_MONTHS[month] + ' <bdi dir="ltr">' + year + '</bdi></span>';
        return ltr(day + ' ' + EN_MONTHS[month] + ' ' + year, 'inv-date');
    }
    function moneyFormatter(doc, totals) {
        var values = [totals.subtotalMinor, totals.discountMinor, totals.taxMinor, totals.additionalChargeMinor, totals.amountPaidMinor].concat(totals.lineAmounts, doc.items.map(function (item) { return core.minor(item.unitPrice); }));
        var decimals = values.some(function (value) { return value % 100 !== 0; }) ? 2 : 0;
        function plain(minorValue) { return (core.numberValue(minorValue, 0) / 100).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }); }
        return { plain: plain, withCurrency: function (minorValue) { return doc.currency + ' ' + plain(minorValue); } };
    }

    function contactList(party, options) {
        var rows = [];
        if (has(party.address)) rows.push(userText(party.address, 'span', 'inv-address'));
        if (has(party.phone)) rows.push(ltr(party.phone));
        if (has(party.email)) rows.push(ltr(party.email));
        if (has(party.website) && !(options && options.skipWebsite)) rows.push(ltr(party.website));
        if (has(party.referenceLabel) && has(party.referenceValue)) rows.push('<span>' + userText(party.referenceLabel) + ': ' + ltr(party.referenceValue) + '</span>');
        if (has(party.referenceLabel2) && has(party.referenceValue2)) rows.push('<span>' + userText(party.referenceLabel2) + ': ' + ltr(party.referenceValue2) + '</span>');
        return rows.length ? '<div class="inv-contact">' + rows.join('') + '</div>' : '';
    }
    function placeholder(text) { return '<span class="inv-placeholder">' + esc(text) + '</span>'; }
    function partyName(doc, party, fallbackEn, fallbackUr) {
        if (has(party.name)) return userText(party.name, 'strong', 'inv-party-name');
        return '<strong class="inv-party-name">' + placeholder(doc.languageMode === 'urdu' ? fallbackUr : fallbackEn) + '</strong>';
    }
    function businessName(doc) {
        if (has(doc.seller.name)) return userText(doc.seller.name, 'h2', 'inv-business');
        return '<h2 class="inv-business">' + placeholder(doc.languageMode === 'urdu' ? 'آپ کے کاروبار کا نام' : 'Your business name') + '</h2>';
    }
    function logo(doc) { return doc.seller.logoDataUrl ? '<img class="inv-logo" src="' + esc(doc.seller.logoDataUrl) + '" alt="">' : ''; }
    function statusBadge(doc) { return '<span class="inv-status inv-status-' + esc(doc.status.toLowerCase().replace(/\s+/g, '-')) + '">' + labelFor(doc, doc.status) + '</span>'; }
    function titleBlock(doc) {
        if (doc.languageMode === 'urdu') return '<div class="inv-title" lang="ur">انوائس</div>';
        if (doc.languageMode === 'bilingual') return '<div class="inv-title"><span class="inv-title-en">Invoice</span><span class="inv-title-ur" lang="ur">انوائس</span></div>';
        return '<div class="inv-title"><span class="inv-title-en">Invoice</span></div>';
    }
    function metaRows(doc) {
        var rows = [['invoiceNo', ltr(doc.invoiceNumber || '—')], ['date', formatDate(doc, doc.issueDate)]];
        if (doc.dueDate) rows.push(['due', formatDate(doc, doc.dueDate)]);
        return rows;
    }
    function metaList(doc, className) {
        return '<dl class="' + (className || 'inv-meta') + '">' + metaRows(doc).map(function (row) { return '<div><dt>' + labelFor(doc, row[0]) + '</dt><dd>' + row[1] + '</dd></div>'; }).join('') + '</dl>';
    }
    function amountDueBlock(doc, view, money) {
        var due = view.totals.balanceDueMinor;
        return '<div class="inv-due"><span class="inv-due-label">' + labelFor(doc, 'amountDue') + '</span><strong class="inv-due-value">' + ltr(money.withCurrency(due)) + '</strong>' + (doc.dueDate && due > 0 ? '<span class="inv-due-by">' + labelFor(doc, 'due') + ' ' + formatDate(doc, doc.dueDate) + '</span>' : '') + '</div>';
    }

    function headerHtml(doc, view, money) {
        var tpl = doc.templateId, tagline = has(doc.seller.tagline) ? userText(doc.seller.tagline, 'p', 'inv-tagline') : '';
        var contact = contactList({ phone: doc.seller.phone, email: doc.seller.email, website: doc.seller.website });
        if (tpl === 'classic-urdu') {
            return '<header class="inv-head">' + logo(doc) + businessName(doc) + tagline + contactList(doc.seller) +
                '<div class="inv-ornament" aria-hidden="true"><span></span><svg viewBox="0 0 24 24" width="18" height="18"><rect x="5.5" y="5.5" width="13" height="13"/><rect x="5.5" y="5.5" width="13" height="13" transform="rotate(45 12 12)"/><circle cx="12" cy="12" r="2.4"/></svg><span></span></div>' +
                titleBlock(doc) + '<div class="inv-strip">' + metaRows(doc).map(function (row) { return '<div><span class="inv-strip-label">' + labelFor(doc, row[0]) + '</span><span class="inv-strip-value">' + row[1] + '</span></div>'; }).join('') + '<div><span class="inv-strip-label">' + labelFor(doc, 'amountDue') + '</span><span class="inv-strip-value">' + ltr(money.withCurrency(view.totals.balanceDueMinor)) + '</span></div></div></header>';
        }
        if (tpl === 'contemporary') {
            return '<header class="inv-head"><div class="inv-band"><div class="inv-band-brand">' + logo(doc) + '<div>' + businessName(doc) + tagline + '</div></div>' + titleBlock(doc) + '</div>' +
                '<div class="inv-head-row">' + metaList(doc, 'inv-meta inv-meta-chips') + amountDueBlock(doc, view, money) + '</div></header>';
        }
        return '<header class="inv-head"><div class="inv-head-brand">' + logo(doc) + '<div>' + businessName(doc) + tagline + contact + '</div></div>' +
            '<div class="inv-head-doc">' + titleBlock(doc) + statusBadge(doc) + metaList(doc) + '</div></header>';
    }
    function partiesHtml(doc) {
        var tpl = doc.templateId;
        var seller = tpl === 'modern' ? contactList({ address: doc.seller.address, referenceLabel: doc.seller.referenceLabel, referenceValue: doc.seller.referenceValue, referenceLabel2: doc.seller.referenceLabel2, referenceValue2: doc.seller.referenceValue2 }) : (tpl === 'classic-urdu' ? '' : contactList(doc.seller));
        var from = tpl === 'classic-urdu' ? '' : '<section class="inv-party"><h3>' + labelFor(doc, 'from') + '</h3>' + partyName(doc, doc.seller, 'Your business name', 'آپ کے کاروبار کا نام') + seller + '</section>';
        var to = '<section class="inv-party inv-party-to"><h3>' + labelFor(doc, 'billTo') + '</h3>' + partyName(doc, doc.buyer, 'Customer name', 'گاہک کا نام') + contactList(doc.buyer) + '</section>';
        var status = tpl === 'modern' ? '' : '<section class="inv-party inv-party-status">' + statusBadge(doc) + '</section>';
        return '<div class="inv-parties">' + from + to + status + '</div>';
    }
    function tableHead(doc) {
        var taxColumn = core.hasItemTax(doc) ? '<th class="inv-col-tax">' + labelFor(doc, 'tax', { stack: true }) + '</th>' : '';
        return '<thead><tr><th class="inv-col-n">#</th><th class="inv-col-desc">' + labelFor(doc, 'item', { stack: true }) + '</th><th class="inv-col-qty">' + labelFor(doc, 'qty', { stack: true }) + '</th><th class="inv-col-num">' + labelFor(doc, 'price', { stack: true }) + '</th>' + taxColumn + '<th class="inv-col-num">' + labelFor(doc, 'amount', { stack: true }) + ' <span class="inv-cur">(' + esc(doc.currency) + ')</span></th></tr></thead>';
    }
    // Quantity and its unit read as one phrase ("4 kg", "2 گھنٹہ"); the
    // number stays left-to-right inside Urdu pages.
    function quantityHtml(item) {
        return ltr(item.quantity || '0') + (has(item.unit) ? ' ' + userText(item.unit.trim(), 'span', 'inv-unit') : '');
    }
    function taxRateText(item) {
        var rate = core.itemTaxRate(item);
        return rate > 0 ? ltr(String(Math.round(rate * 100) / 100) + '%') : '<span class="inv-muted">—</span>';
    }
    function itemRows(doc, view, money) {
        var rows = [];
        var taxColumn = core.hasItemTax(doc);
        doc.items.forEach(function (item, index) {
            if (!core.isMeaningfulItem(item)) return;
            rows.push('<tr><td class="inv-col-n">' + ltr(rows.length + 1) + '</td><td class="inv-col-desc">' + (has(item.description) ? userText(item.description) : placeholder('—')) + '</td><td class="inv-col-qty">' + quantityHtml(item) + '</td><td class="inv-col-num">' + ltr(money.plain(core.minor(item.unitPrice))) + '</td>' + (taxColumn ? '<td class="inv-col-tax">' + taxRateText(item) + '</td>' : '') + '<td class="inv-col-num">' + ltr(money.plain(view.totals.lineAmounts[index])) + '</td></tr>');
        });
        if (!rows.length) rows.push('<tr class="inv-row-empty"><td class="inv-col-n">' + ltr(1) + '</td><td class="inv-col-desc">' + placeholder(doc.languageMode === 'urdu' ? 'چیز یا خدمت کی تفصیل' : 'Item or service description') + '</td><td class="inv-col-qty">' + ltr(1) + '</td><td class="inv-col-num">' + ltr(money.plain(0)) + '</td><td class="inv-col-num">' + ltr(money.plain(0)) + '</td></tr>');
        return rows;
    }
    function totalsHtml(doc, view, money) {
        var t = view.totals, rows = [];
        function row(key, value, className) { rows.push('<div class="inv-total-row' + (className ? ' ' + className : '') + '"><span>' + labelFor(doc, key) + '</span><span>' + ltr(value) + '</span></div>'); }
        row('subtotal', money.withCurrency(t.subtotalMinor));
        if (view.showDiscountRow) row('discount', '− ' + money.withCurrency(t.discountMinor));
        if (view.showTaxRow) row('tax', money.withCurrency(t.taxMinor));
        if (view.showAdditionalChargeRow) row('additional', money.withCurrency(t.additionalChargeMinor));
        row('total', money.withCurrency(t.grandTotalMinor), 'inv-total-grand');
        if (view.showAmountPaidRow) row('paid', '− ' + money.withCurrency(t.amountPaidMinor));
        if (view.showAmountPaidRow || doc.status === 'Paid') row('balance', money.withCurrency(t.balanceDueMinor), 'inv-total-balance');
        return '<section class="inv-totals">' + rows.join('') + '</section>';
    }
    function paymentHtml(doc, qrDataUrl, view) {
        var p = doc.paymentDetails, rows = [];
        function row(key, value, isLtr) { if (has(value)) rows.push('<div class="inv-pay-row"><span class="inv-pay-label">' + labelFor(doc, key) + '</span><span class="inv-pay-value">' + (isLtr ? ltr(value) : userText(value)) + '</span></div>'); }
        row('bank', p.bankName); row('accountTitle', p.accountTitle); row('accountNumber', p.accountNumber, true); row('iban', p.iban, true);
        if (has(p.walletNumber)) rows.push('<div class="inv-pay-row"><span class="inv-pay-label">' + (p.walletProvider && p.walletProvider !== 'Other' ? ltr(p.walletProvider) : labelFor(doc, 'wallet')) + '</span><span class="inv-pay-value">' + ltr(p.walletNumber) + (has(p.walletTitle) ? ' · ' + userText(p.walletTitle) : '') + '</span></div>');
        var instructions = has(p.instructions) ? userText(p.instructions, 'p', 'inv-pay-note') : '';
        if (!view.visibility.paymentDetails) return '';
        return '<section class="inv-payment"><div><h3>' + labelFor(doc, 'payment') + '</h3>' + rows.join('') + instructions + '</div></section>';
    }
    function qrHtml(view, qrDataUrl) {
        if (!view.visibility.qr) return '';
        return '<figure class="inv-qr">' + (qrDataUrl ? '<img src="' + esc(qrDataUrl) + '" alt="" width="84" height="84">' : '<span class="inv-qr-pending"></span>') + '<figcaption>' + userText(view.qrCaption) + '</figcaption></figure>';
    }
    function notesHtml(doc, view) {
        if (!view.visibility.notesTerms) return '';
        var heading = doc.languageMode === 'urdu' || doc.languageMode === 'english' ? esc(view.notesTermsHeading) : esc(view.notesTermsHeading).replace(/ \/ (.*)$/, ' <span class="inv-l-ur" lang="ur">$1</span>');
        return '<section class="inv-notes"><h3>' + heading + '</h3>' + (has(doc.notes) ? userText(doc.notes, 'p') : '') + (has(doc.terms) ? userText(doc.terms, 'p', 'inv-terms') : '') + '</section>';
    }
    function authorizationHtml(doc, view) {
        if (!view.visibility.authorization) return '';
        var a = doc.authorization;
        return '<section class="inv-sign"><span class="inv-sign-line"></span>' + (has(a.name) ? userText(a.name, 'strong') : '') + (has(a.role) ? userText(a.role, 'span') : '') + '<span class="inv-sign-label">' + labelFor(doc, 'authorised') + '</span></section>';
    }
    function lowerBlocks(doc, view, money, qrDataUrl) {
        var payment = paymentHtml(doc, qrDataUrl, view), notes = notesHtml(doc, view), sign = authorizationHtml(doc, view), totals = totalsHtml(doc, view, money), qr = qrHtml(view, qrDataUrl);
        var left = notes + payment;
        return {
            combined: '<div class="inv-lower">' + '<div class="inv-lower-side">' + left + '</div><div class="inv-lower-main">' + totals + qr + sign + '</div></div>',
            split: ['<div class="inv-lower"><div class="inv-lower-side">' + payment + '</div><div class="inv-lower-main">' + totals + qr + '</div></div>', notes ? '<div class="inv-lower-full">' + notes + '</div>' : '', sign ? '<div class="inv-lower-full inv-lower-sign">' + sign + '</div>' : ''].filter(Boolean)
        };
    }
    function footerHtml(doc, view) {
        var message = view.visibility.footer ? userText(doc.footerMessage, 'span', 'inv-footer-message') : '';
        var credit = view.showGeneratorCredit ? '<span class="inv-footer-credit">Created with Write-Urdu Invoice Generator</span>' : '';
        return '<div class="invoice-footer inv-footer">' + message + '<span class="inv-footer-meta">' + credit + '<span class="inv-page-number" data-inv-page-number></span></span></div>';
    }
    function continuationHtml(doc) {
        return '<div class="inv-continued">' + (has(doc.seller.name) ? userText(doc.seller.name, 'strong') : '') + '<span>' + labelFor(doc, 'invoice') + ' ' + ltr(doc.invoiceNumber) + ' · ' + labelFor(doc, 'continued') + '</span></div>';
    }

    function createPage(host, doc, vars, index, view) {
        var page = host.ownerDocument.createElement('article');
        page.className = 'inv-page inv-tpl-' + doc.templateId + ' inv-lang-' + doc.languageMode + ' inv-urdu-' + doc.design.urduFont;
        page.setAttribute('dir', doc.languageMode === 'urdu' ? 'rtl' : 'ltr');
        page.setAttribute('lang', doc.languageMode === 'urdu' ? 'ur' : 'en');
        page.setAttribute('data-page-index', String(index));
        Object.keys(vars).forEach(function (key) { page.style.setProperty(key, vars[key]); });
        page.innerHTML = '<div class="inv-frame"><div class="inv-flow"></div>' + footerHtml(doc, view) + '</div>';
        host.appendChild(page);
        return { el: page, flow: page.querySelector('.inv-flow') };
    }
    function overflows(page) {
        var flow = page.flow, frame = flow.parentNode, footer = frame.querySelector('.inv-footer');
        var limit = frame.clientHeight - parseFloat(getComputedStyle(frame).paddingTop) - parseFloat(getComputedStyle(frame).paddingBottom) - (footer ? footer.offsetHeight + 10 : 0);
        return flow.scrollHeight > limit + 1;
    }
    function appendHtml(parent, html) {
        // <template> keeps table rows intact; a <div> parser would drop <tr>.
        var holder = parent.ownerDocument.createElement('template');
        holder.innerHTML = html;
        var nodes = Array.prototype.slice.call(holder.content.childNodes);
        nodes.forEach(function (node) { parent.appendChild(node); });
        return nodes;
    }
    function newTable(page, doc) {
        appendHtml(page.flow, '<table class="inv-items">' + tableHead(doc) + '<tbody></tbody></table>');
        return page.flow.querySelector('.inv-items:last-of-type tbody');
    }

    // Lays the invoice out on as many A4 pages as it needs. Rows move to a new
    // page (with a repeated table heading) instead of being shrunk or clipped.
    function renderPages(host, input, options) {
        var opts = options || {};
        var doc = core.normalizeInvoiceDocument(input);
        var view = core.buildInvoicePreviewViewModel(doc);
        var money = moneyFormatter(doc, view.totals);
        var vars = themeVars(doc);
        var maxPages = opts.maxPages || 20;
        host.innerHTML = '';
        var pages = [createPage(host, doc, vars, 0, view)];
        var page = pages[0];
        appendHtml(page.flow, headerHtml(doc, view, money));
        appendHtml(page.flow, partiesHtml(doc));
        var tbody = newTable(page, doc);
        var rows = itemRows(doc, view, money);
        function nextPage() {
            if (pages.length >= maxPages) return null;
            page = createPage(host, doc, vars, pages.length, view);
            pages.push(page);
            appendHtml(page.flow, continuationHtml(doc));
            return page;
        }
        for (var i = 0; i < rows.length; i += 1) {
            var added = appendHtml(tbody, rows[i]);
            if (overflows(page) && tbody.children.length > 1) {
                added.forEach(function (node) { node.remove(); });
                if (!nextPage()) break;
                tbody = newTable(page, doc);
                appendHtml(tbody, rows[i]);
            }
        }
        var lower = lowerBlocks(doc, view, money, opts.qrDataUrl);
        var placed = appendHtml(page.flow, lower.combined);
        if (overflows(page)) {
            placed.forEach(function (node) { node.remove(); });
            // Carry the last rows over so the totals never sit alone on a page.
            var carried = tbody.children.length > 3 ? Array.prototype.slice.call(tbody.children, -2) : [];
            carried.forEach(function (row) { row.remove(); });
            var fresh = nextPage();
            if (!fresh) carried.forEach(function (row) { tbody.appendChild(row); });
            if (fresh) {
                if (carried.length) { tbody = newTable(page, doc); carried.forEach(function (row) { tbody.appendChild(row); }); }
                placed = appendHtml(page.flow, lower.combined);
                if (overflows(page)) {
                    placed.forEach(function (node) { node.remove(); });
                    lower.split.forEach(function (block, index) {
                        var nodes = appendHtml(page.flow, block);
                        if (overflows(page) && index > 0 && nextPage()) { nodes.forEach(function (node) { node.remove(); }); appendHtml(page.flow, block); }
                    });
                }
            }
        }
        if (pages.length > 1) {
            pages.forEach(function (item, index) {
                var number = item.el.querySelector('[data-inv-page-number]');
                if (number) number.innerHTML = labelFor(doc, 'page') + ' ' + ltr(index + 1) + ' ' + labelFor(doc, 'of') + ' ' + ltr(pages.length);
            });
        }
        return { pageCount: pages.length, pages: pages.map(function (item) { return item.el; }), overflow: pages.some(overflows) };
    }

    return { LABELS: LABELS, TEMPLATE_NAMES: TEMPLATE_NAMES, renderPages: renderPages, themeVars: themeVars, hasUrdu: hasUrdu, labelText: function (doc, key) { var pair = LABELS[key] || [key, key]; return doc.languageMode === 'urdu' ? pair[1] : doc.languageMode === 'bilingual' ? pair[0] + ' / ' + pair[1] : pair[0]; } };
}));
