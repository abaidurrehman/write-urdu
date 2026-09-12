(function () {
    'use strict';
    var root = document.querySelector('[data-bill-generator]');
    var core = window.WriteUrduBillCore;
    if (!root || !core) return;

    var PAYMENT_FIELDS = {
        cash: [], raast: ['raastId'], jazzcash: ['phoneOrAccount'], easypaisa: ['phoneOrAccount'],
        'bank-transfer': ['accountTitle', 'ibanOrAccount'], udhaar: [], other: ['note']
    };

    var state = core.createDefaultBillDocument(new Date());
    var preview = root.querySelector('[data-bill-preview]');
    var statusNode = root.querySelector('[data-bill-status]');
    var startedTracked = false;

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
        var keys = pathParts(path), target = object;
        keys.slice(0, -1).forEach(function (key) { if (!target[key] || typeof target[key] !== 'object') target[key] = {}; target = target[key]; });
        target[keys[keys.length - 1]] = value;
    }

    function label(en, ur) {
        if (state.languageMode === 'urdu') return '<bdi class="bill-urdu-label" lang="ur" dir="rtl">' + esc(ur) + '</bdi>';
        if (state.languageMode === 'bilingual') return esc(en) + ' / <bdi class="bill-urdu-label" lang="ur" dir="rtl">' + esc(ur) + '</bdi>';
        return esc(en);
    }

    function money(minor) { return core.formatMoneyMinor(minor); }

    function setStatus(message, type) {
        if (!statusNode) return;
        statusNode.textContent = message;
        statusNode.classList.toggle('is-error', type === 'error');
        statusNode.classList.toggle('is-ready', type === 'ready');
    }

    function renderItemsEditor() {
        var host = root.querySelector('[data-bill-items]');
        if (!host) return;
        var totals = core.calculateBillTotals(state);
        host.innerHTML = state.items.map(function (item, index) {
            return '<div class="bill-item-row" data-item-id="' + esc(item.id) + '" data-item-index="' + index + '">' +
                '<input data-item-field="description" value="' + esc(item.description) + '" placeholder="Item / service">' +
                '<input data-item-field="quantity" inputmode="decimal" value="' + esc(item.quantity) + '" aria-label="Quantity">' +
                '<input data-item-field="rate" inputmode="decimal" value="' + esc(item.rate) + '" aria-label="Rate">' +
                '<span class="bill-item-amount">' + esc(money(totals.lineAmounts[index] || 0)) + '</span>' +
                '<button type="button" class="bill-item-remove" data-remove-item aria-label="Remove item">×</button></div>';
        }).join('');
        host.querySelectorAll('[data-item-field]').forEach(function (field) {
            field.addEventListener('input', function () {
                var row = field.closest('[data-item-id]');
                var item = row ? state.items[Number(row.dataset.itemIndex)] : null;
                if (!item) return;
                markStarted();
                item[field.getAttribute('data-item-field')] = field.value;
                renderPreview();
                var amountNode = row.querySelector('.bill-item-amount');
                if (amountNode) amountNode.textContent = money(core.calculateBillTotals(state).lineAmounts[Number(row.dataset.itemIndex)] || 0);
            });
        });
    }

    function renderPaymentFields() {
        var relevant = PAYMENT_FIELDS[state.paymentMethod] || [];
        root.querySelectorAll('[data-payment-field]').forEach(function (block) {
            block.hidden = relevant.indexOf(block.getAttribute('data-payment-field')) < 0;
        });
    }

    function renderFieldValues() {
        root.querySelectorAll('[data-field]').forEach(function (field) {
            var value = getPath(state, field.getAttribute('data-field'));
            if (document.activeElement !== field) field.value = value === undefined || value === null ? '' : value;
        });
        renderPaymentFields();
    }

    function renderPreview() {
        state = core.normalizeBillingDocument(state);
        var totals = core.calculateBillTotals(state);
        var dir = state.languageMode === 'urdu' ? 'rtl' : 'ltr';
        preview.setAttribute('dir', dir);

        var itemRows = state.items.map(function (item, index) {
            var descDir = core.directionForValue(item.description, 'text');
            return '<tr><td>' + (index + 1) + '</td><td dir="' + descDir + '">' + (esc(item.description) || '—') + '</td>' +
                '<td class="bill-numeric"><bdi>' + esc(item.quantity || 0) + '</bdi></td>' +
                '<td class="bill-numeric"><bdi>' + esc(money(core.toMinor(item.rate))) + '</bdi></td>' +
                '<td class="bill-numeric"><bdi>' + esc(money(totals.lineAmounts[index] || 0)) + '</bdi></td></tr>';
        }).join('');

        var totalsRows = '<tr><td>' + label('Subtotal', 'جمع') + '</td><td class="bill-numeric"><bdi>' + esc(money(totals.subtotalMinor)) + '</bdi></td></tr>' +
            (totals.discountMinor > 0 ? '<tr><td>' + label('Discount', 'رعایت') + '</td><td class="bill-numeric"><bdi>−' + esc(money(totals.discountMinor)) + '</bdi></td></tr>' : '') +
            '<tr class="bill-grand-total"><td>' + label('Total', 'کل رقم') + '</td><td class="bill-numeric"><bdi>' + esc(money(totals.totalMinor)) + '</bdi></td></tr>' +
            '<tr><td>' + label('Paid', 'ادا شدہ') + '</td><td class="bill-numeric"><bdi>' + esc(money(totals.amountPaidMinor)) + '</bdi></td></tr>' +
            '<tr class="' + (totals.balanceMinor > 0 ? 'bill-balance-positive' : '') + '"><td>' + label('Balance', 'بقایا') + '</td><td class="bill-numeric"><bdi>' + esc(money(totals.balanceMinor)) + '</bdi></td></tr>';

        var paymentLabelMap = { cash: 'Cash / نقد', raast: 'Raast', jazzcash: 'JazzCash', easypaisa: 'Easypaisa', 'bank-transfer': 'Bank transfer', udhaar: 'Udhaar / ادھار', other: 'Other' };
        var details = state.paymentDetails || {};
        var detailParts = [details.raastId, details.phoneOrAccount, details.accountTitle, details.ibanOrAccount, details.note].filter(function (value) { return value; });
        var paymentLine = '<p class="bill-payment-line">' + label('Payment method', 'طریقۂ ادائیگی') + ': ' + esc(paymentLabelMap[state.paymentMethod] || state.paymentMethod) +
            (detailParts.length ? ' — <bdi dir="ltr">' + detailParts.map(esc).join(' · ') + '</bdi>' : '') + '</p>';

        var businessName = state.business.name || '—';
        var businessPhone = state.business.phone ? '<div class="bill-page-phone" dir="ltr">' + esc(state.business.phone) + '</div>' : '';
        var customerValue = [state.customer && state.customer.name, state.customer && state.customer.phone].filter(function (value) { return value; }).join(' · ');
        var customerLine = customerValue
            ? '<div class="bill-page-customer">' + label('Customer', 'گاہک') + ': <bdi dir="ltr">' + esc(customerValue) + '</bdi></div>'
            : '';

        preview.innerHTML =
            '<header class="bill-page-header"><div><h2 class="bill-page-title">' + esc(businessName) + '</h2>' + businessPhone + '</div>' +
            '<div class="bill-page-meta"><div>' + label('Bill', 'بل') + ' # <bdi dir="ltr">' + esc(state.documentNumber) + '</bdi></div><div dir="ltr">' + esc(state.date) + '</div></div></header>' +
            '<div class="bill-page-parties">' + customerLine + '</div>' +
            '<table class="bill-items-table"><thead><tr><th>#</th><th>' + label('Description', 'تفصیل') + '</th><th class="bill-numeric">' + label('Qty', 'تعداد') + '</th><th class="bill-numeric">' + label('Rate', 'نرخ') + '</th><th class="bill-numeric">' + label('Amount', 'رقم') + '</th></tr></thead><tbody>' + itemRows + '</tbody></table>' +
            '<table class="bill-totals"><tbody>' + totalsRows + '</tbody></table>' +
            paymentLine +
            (state.notes ? '<p class="bill-payment-line">' + esc(state.notes) + '</p>' : '');

        track('billing_payment_state', { state: totals.paymentState });
    }

    function onFieldChange(field) {
        var path = field.getAttribute('data-field');
        setPath(state, path, field.value);
        markStarted();
        if (path === 'paymentMethod') {
            var relevant = PAYMENT_FIELDS[field.value] || [];
            var allDetailFields = ['raastId', 'phoneOrAccount', 'accountTitle', 'ibanOrAccount', 'note'];
            allDetailFields.forEach(function (key) { if (relevant.indexOf(key) < 0) state.paymentDetails[key] = ''; });
            renderPaymentFields();
            renderFieldValues();
            track('billing_payment_category_selected', { category: field.value });
        }
        if (path === 'languageMode') track('billing_language_selected', { mode: field.value });
        renderPreview();
    }

    function itemCountBucket(count) {
        if (count <= 1) return '1';
        if (count <= 3) return '2-3';
        if (count <= 6) return '4-6';
        return '7+';
    }

    function bind() {
        root.addEventListener('input', function (event) {
            var field = event.target.closest('[data-field]');
            if (field) onFieldChange(field);
        });
        root.addEventListener('click', function (event) {
            var remove = event.target.closest('[data-remove-item]');
            if (remove) {
                var row = remove.closest('[data-item-id]');
                state.items = state.items.filter(function (item) { return item.id !== row.dataset.itemId; });
                if (!state.items.length) state.items.push({ id: 'item-' + Date.now(), description: '', quantity: 1, rate: 0 });
                renderItemsEditor();
                renderPreview();
            }
        });
        var addButton = root.querySelector('[data-bill-add-item]');
        if (addButton) addButton.addEventListener('click', function () {
            if (state.items.length >= 50) return;
            state.items.push({ id: 'item-' + Date.now(), description: '', quantity: 1, rate: 0 });
            markStarted();
            track('billing_item_count_bucket', { bucket: itemCountBucket(state.items.length) });
            renderItemsEditor();
            renderPreview();
        });
        var newButton = root.querySelector('[data-bill-new]');
        if (newButton) newButton.addEventListener('click', function () {
            if (!window.confirm('Start a new bill and clear the current fields?')) return;
            state = core.createDefaultBillDocument(new Date());
            startedTracked = false;
            renderItemsEditor(); renderFieldValues(); renderPreview();
        });
        var printButton = root.querySelector('[data-bill-print]');
        if (printButton) printButton.addEventListener('click', function () {
            track('billing_output_attempted', { format: 'print' });
            window.print();
            track('billing_output_completed', { format: 'print' });
        });
        var pdfButton = root.querySelector('[data-bill-pdf]');
        if (pdfButton) pdfButton.addEventListener('click', downloadPdf);
    }

    function safeFilename() {
        var number = String(state.documentNumber || 'bill').replace(/[^A-Za-z0-9-]+/g, '-');
        return number.toLowerCase() + '.pdf';
    }

    function downloadPdf() {
        track('billing_output_attempted', { format: 'pdf' });
        if (typeof window.html2canvas !== 'function' || !window.jspdf || typeof window.jspdf.jsPDF !== 'function') {
            setStatus('PDF export is unavailable in this browser. Use Print instead.', 'error');
            track('billing_error', { category: 'pdf-unavailable' });
            return;
        }
        window.html2canvas(preview, { backgroundColor: '#ffffff', scale: 1.5, useCORS: true, logging: false }).then(function (canvas) {
            var Pdf = window.jspdf.jsPDF;
            var widthMm = 210;
            var heightMm = widthMm * canvas.height / canvas.width;
            var doc = new Pdf({ unit: 'mm', format: [widthMm, heightMm], orientation: 'portrait' });
            doc.addImage(canvas.toDataURL('image/jpeg', 0.82), 'JPEG', 0, 0, widthMm, heightMm);
            doc.save(safeFilename());
            setStatus('PDF downloaded.', 'ready');
            track('billing_output_completed', { format: 'pdf' });
        }).catch(function () {
            setStatus('Unable to create the PDF. Use Print instead.', 'error');
            track('billing_error', { category: 'pdf-failed' });
        });
    }

    track('billing_tool_viewed', { route: '/urdu-bill-generator' });
    track('billing_mode_selected', { mode: state.documentType });
    bind();
    renderItemsEditor();
    renderFieldValues();
    renderPreview();
}());
