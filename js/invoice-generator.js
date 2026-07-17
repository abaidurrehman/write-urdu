(function () {
    'use strict';
    var root = document.querySelector('[data-invoice-generator]');
    var core = window.WriteUrduInvoiceCore;
    if (!root || !core) return;
    var DRAFT_KEY = 'writeUrdu.invoiceGenerator.draft.v1';
    var state = core.createDefaultInvoiceDocument();
    var preview = root.querySelector('[data-invoice-preview]');
    var statusNode = root.querySelector('[data-invoice-fit-status]');
    var restore = root.querySelector('[data-invoice-restore]');
    var pendingDraft = null;
    var autosaveTimer = null;
    var renderToken = 0;
    var transliterationControl = null;
    var zeroTotalDialog = root.querySelector('[data-invoice-zero-dialog]');

    function esc(value) {
        return String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g, function (char) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]; });
    }
    function pathParts(path) { return path.split('.'); }
    function getPath(object, path) { return pathParts(path).reduce(function (value, key) { return value && value[key]; }, object); }
    function setPath(object, path, value) {
        var keys = pathParts(path), target = object;
        keys.slice(0, -1).forEach(function (key) { if (!target[key] || typeof target[key] !== 'object') target[key] = {}; target = target[key]; });
        target[keys[keys.length - 1]] = value;
    }
    function label(en, ur) {
        if (state.languageMode === 'urdu') return '<span class="invoice-urdu-label" lang="ur" dir="rtl">' + esc(ur) + '</span>';
        if (state.languageMode === 'bilingual') return esc(en) + ' / <span class="invoice-urdu-label" lang="ur" dir="rtl">' + esc(ur) + '</span>';
        return esc(en);
    }
    function display(value) { return core.hasMeaningfulText(value) ? esc(value) : ''; }
    function line(value, className) { return core.hasMeaningfulText(value) ? '<p' + (className ? ' class="' + className + '"' : '') + '>' + esc(value) + '</p>' : ''; }
    function contactLines(party) { return [party.address, party.phone, party.email, party.website, party.referenceLabel && party.referenceValue ? party.referenceLabel + ': ' + party.referenceValue : '', party.referenceLabel2 && party.referenceValue2 ? party.referenceLabel2 + ': ' + party.referenceValue2 : ''].filter(core.hasMeaningfulText).map(esc).join('<br>'); }
    function formatDate(value) { if (!value) return ''; var parts = value.split('-'); return parts.length === 3 ? parts[2] + '/' + parts[1] + '/' + parts[0] : value; }
    function currency(value) { return core.formatMoney(value, state.currency); }
    function setStatus(message, type) { if (!statusNode) return; statusNode.textContent = message; statusNode.classList.toggle('is-error', type === 'error'); statusNode.classList.toggle('is-ready', type === 'ready'); }

    function renderItemsEditor() {
        var host = root.querySelector('[data-invoice-items]');
        if (!host) return;
        host.innerHTML = '<div class="invoice-items-editor">' + state.items.map(function (item, index) {
            var amount = core.calculateInvoiceTotals(state).lineAmounts[index] || 0;
            return '<div class="invoice-item-editor" data-item-id="' + esc(item.id) + '" data-item-index="' + index + '">' +
                '<label>Description<input data-item-field="description" value="' + esc(item.description) + '" maxlength="80" placeholder="Service or product"></label>' +
                '<label>Qty<input data-item-field="quantity" inputmode="decimal" value="' + esc(item.quantity) + '" aria-label="Quantity"></label>' +
                '<label>Unit price<input data-item-field="unitPrice" inputmode="decimal" value="' + esc(item.unitPrice) + '" aria-label="Unit price"><span class="invoice-item-amount">' + esc(currency(amount)) + '</span></label>' +
                '<button type="button" data-remove-item aria-label="Remove line item">×</button></div>';
        }).join('') + '</div>';
        host.querySelectorAll('[data-item-field]').forEach(function (field) {
            field.addEventListener('input', function () {
                var row = field.closest('[data-item-id]'), item = row ? state.items[Number(row.dataset.itemIndex)] : null;
                if (!item) return;
                item[field.getAttribute('data-item-field')] = field.value;
                renderPreview(false);
                scheduleSave();
            });
        });
        var add = root.querySelector('[data-invoice-add-item]');
        if (add) add.disabled = state.items.length >= core.MAX_ITEMS;
    }
    function renderFieldValues() {
        root.querySelectorAll('[data-field]').forEach(function (field) {
            var value = getPath(state, field.getAttribute('data-field'));
            if (field.type === 'checkbox') field.checked = Boolean(value);
            else if (document.activeElement !== field) field.value = value === undefined || value === null ? '' : value;
        });
        root.querySelectorAll('[data-section]').forEach(function (field) {
            var key = field.getAttribute('data-section'); field.checked = Boolean(state.sections[key] && state.sections[key].enabled);
        });
        var qrFields = root.querySelector('[data-invoice-qr-fields]'); if (qrFields) qrFields.hidden = !state.sections.qr.enabled;
        root.querySelectorAll('[data-qr-purpose]').forEach(function (field) { field.hidden = field.getAttribute('data-qr-purpose') !== state.qr.purpose; });
        var authFields = root.querySelector('[data-invoice-auth-fields]'); if (authFields) authFields.hidden = !state.sections.authorization.enabled;
    }
    function renderPartyCard(titleEn, titleUr, party, extra) {
        return '<section class="invoice-card' + (extra ? ' invoice-card-with-qr' : '') + '"><div><h3>' + label(titleEn, titleUr) + '</h3><strong>' + (display(party.name) || '—') + '</strong>' + line(party.tagline) + (contactLines(party) ? '<p>' + contactLines(party) + '</p>' : '') + '</div>' + (extra || '') + '</section>';
    }
    function renderNotesBlock(variant) {
        if (variant === 'hidden') return '';
        var heading = core.resolveNotesTermsHeading(state.languageMode, core.hasMeaningfulText(state.notes), core.hasMeaningfulText(state.terms));
        return '<section class="invoice-notes invoice-lower-card"><h3>' + esc(heading || '') + '</h3>' + (variant === 'both' ? line(state.notes, 'invoice-notes-copy') + line(state.terms, 'invoice-terms-copy') : line(variant === 'notes' ? state.notes : state.terms)) + '</section>';
    }
    function renderPaymentBlock() {
        return '<section class="invoice-payment invoice-lower-card"><h3>' + label('Payment details', 'ادائیگی کی تفصیلات') + '</h3>' + line([state.paymentDetails.bankName, state.paymentDetails.accountTitle, state.paymentDetails.accountNumber, state.paymentDetails.iban, state.paymentDetails.instructions].filter(core.hasMeaningfulText).join('\n')) + '</section>';
    }
    function renderAuthorizationBlock() {
        return '<section class="invoice-auth invoice-lower-card"><h3>' + label('Authorised by', 'مجاز شخص') + '</h3>' + line([state.authorization.name, state.authorization.role].filter(core.hasMeaningfulText).join('\n')) + '</section>';
    }
    function renderLowerLayout(view, totalsRows) {
        var layout = view.lowerLayout, left = [], right = ['<section class="invoice-totals-card"><table class="invoice-totals"><tbody>' + totalsRows + '</tbody></table></section>'], columns = [];
        if (layout.leftPrimary === 'notesTerms') left.push(renderNotesBlock(view.notesTermsVariant));
        if (layout.leftPrimary === 'paymentDetails') left.push(renderPaymentBlock());
        if (layout.leftSecondary === 'paymentDetails') left.push(renderPaymentBlock());
        if (layout.rightSecondary === 'authorization') right.push(renderAuthorizationBlock());
        if (left.length) columns.push('<div class="invoice-lower-left-stack">' + left.join('') + '</div>');
        if (right.length) columns.push('<div class="invoice-lower-right-stack">' + right.join('') + '</div>');
        return '<div class="invoice-lower-grid" data-lower-layout="' + esc(layout.mode) + '">' + columns.join('') + '</div>';
    }
    function renderQr() {
        var payload = core.getQrPayload(state);
        if (!state.qr.enabled || !payload || !window.QRCode || typeof window.QRCode.toDataURL !== 'function') return Promise.resolve();
        return window.QRCode.toDataURL(payload, { width: 140, margin: 1, color: { dark: '#17263b', light: '#ffffff' } }).then(function (url) {
            var image = preview.querySelector('[data-invoice-qr-image]'); if (image) image.src = url;
        }).catch(function () { setStatus('QR content could not be generated.', 'error'); });
    }
    function renderPreview() {
        var token = ++renderToken;
        state = core.normalizeInvoiceDocument(state);
        var view = core.buildInvoicePreviewViewModel(state), totals = view.totals, visibility = view.visibility, dir = state.languageMode === 'urdu' ? 'rtl' : 'ltr';
        var itemHeaders = '<th>#</th><th>' + label('Description', 'تفصیل') + '</th><th>' + label('Qty', 'مقدار') + '</th><th class="invoice-numeric-cell">' + label('Unit price', 'فی یونٹ') + '</th><th class="invoice-numeric-cell">' + label('Amount', 'رقم') + '</th>';
        var rows = state.items.map(function (item, index) { var alternate = view.useAlternatingItemRows && index % 2 ? ' class="invoice-item-alt"' : ''; return '<tr' + alternate + '><td>' + (index + 1) + '</td><td>' + (display(item.description) || '—') + '</td><td class="invoice-numeric-cell"><bdi>' + esc(item.quantity || '0') + '</bdi></td><td class="invoice-numeric-cell"><bdi>' + esc(currency(core.minor ? core.minor(item.unitPrice) : Math.round(Number(item.unitPrice || 0) * 100))) + '</bdi></td><td class="invoice-numeric-cell"><bdi>' + esc(currency(totals.lineAmounts[index])) + '</bdi></td></tr>'; }).join('');
        var totalsRows = '<tr><td>' + label('Subtotal', 'ذیلی مجموعہ') + '</td><td class="invoice-numeric-cell"><bdi>' + esc(currency(totals.subtotalMinor)) + '</bdi></td></tr>' +
            (view.showDiscountRow ? '<tr><td>' + label('Discount', 'رعایت') + '</td><td class="invoice-numeric-cell invoice-negative"><bdi>−' + esc(currency(totals.discountMinor)) + '</bdi></td></tr>' : '') +
            (view.showTaxRow ? '<tr><td>' + label('Tax', 'ٹیکس') + '</td><td class="invoice-numeric-cell"><bdi>' + esc(currency(totals.taxMinor)) + '</bdi></td></tr>' : '') +
            (view.showAdditionalChargeRow ? '<tr><td>' + label('Additional charge', 'اضافی چارج') + '</td><td class="invoice-numeric-cell"><bdi>' + esc(currency(totals.additionalChargeMinor)) + '</bdi></td></tr>' : '') +
            (view.showAmountPaidRow ? '<tr><td>' + label('Amount paid', 'ادا شدہ رقم') + '</td><td class="invoice-numeric-cell"><bdi>−' + esc(currency(totals.amountPaidMinor)) + '</bdi></td></tr>' : '') +
            '<tr class="invoice-grand-total"><td>' + label('Grand total', 'کل رقم') + '</td><td class="invoice-numeric-cell"><bdi>' + esc(currency(totals.grandTotalMinor)) + '</bdi></td></tr>' +
            (view.showBalanceDueRow ? '<tr class="invoice-balance-due"><td>' + label('Balance due', 'بقایا رقم') + '</td><td class="invoice-numeric-cell"><bdi>' + esc(currency(totals.balanceDueMinor)) + '</bdi></td></tr>' : '');
        var qr = visibility.qr ? '<div class="invoice-qr-box"><img data-invoice-qr-image alt="Local invoice QR code" width="68" height="68"><span>' + esc(view.qrCaption) + '</span></div>' : '';
        var headerContact = view.headerContact ? '<p class="invoice-header-contact"><span aria-hidden="true">•</span> ' + esc(view.headerContact.value) + '</p>' : '';
        preview.setAttribute('dir', dir);
        preview.setAttribute('data-density', view.density);
        var titleUrdu = state.languageMode === 'english' ? '' : '<div class="invoice-title-urdu" lang="ur" dir="rtl">انوائس</div>';
        var footerCredit = view.showGeneratorCredit ? '<span class="invoice-footer-credit">Created with Write-Urdu Invoice Generator</span>' : '';
        preview.innerHTML = '<header class="invoice-header"><div><h2 class="invoice-brand-name">' + (display(state.seller.name) || 'Your business') + '</h2>' + line(state.seller.tagline, 'invoice-brand-tagline') + headerContact + '</div><div class="invoice-meta"><h1 class="invoice-title">' + display(state.invoiceTitle) + '</h1>' + titleUrdu + '<span class="invoice-status">' + esc(state.status) + '</span></div><div class="invoice-meta"><span class="invoice-meta-label">' + label('Invoice no.', 'انوائس نمبر') + '</span><div class="invoice-meta-value"><bdi>' + esc(state.invoiceNumber) + '</bdi></div><span class="invoice-meta-label">' + label('Date', 'تاریخ') + '</span><div class="invoice-meta-value"><bdi>' + esc(formatDate(state.issueDate)) + '</bdi></div>' + (state.dueDate ? '<span class="invoice-meta-label">' + label('Due', 'آخری تاریخ') + '</span><div class="invoice-meta-value"><bdi>' + esc(formatDate(state.dueDate)) + '</bdi></div>' : '') + '</div></header>' +
            '<div class="invoice-parties">' + renderPartyCard('From / Seller', 'فروخت کنندہ', state.seller, qr) + renderPartyCard('To / Client', 'خریدار', state.buyer) + '</div>' +
            '<table class="invoice-items"><thead><tr>' + itemHeaders + '</tr></thead><tbody>' + rows + '</tbody></table>' +
            renderLowerLayout(view, totalsRows) + '<footer class="invoice-footer">' + (visibility.footer ? '<span class="invoice-footer-message">' + esc(state.footerMessage) + '</span>' : '') + footerCredit + '</footer>';
        renderQr().then(function () { if (token !== renderToken) return; updateFitStatus(); });
        updateFitStatus();
    }
    function updateFitStatus() {
        if (!preview || !statusNode) return;
        var fits = preview.scrollHeight <= preview.clientHeight + 2;
        statusNode.textContent = fits ? 'Fits one page' : 'Too much content for one page';
        statusNode.classList.toggle('is-ready', fits); statusNode.classList.toggle('is-error', !fits);
    }
    function loadDraft() { try { var raw = localStorage.getItem(DRAFT_KEY); if (!raw) return null; var draft = core.normalizeInvoiceDocument(JSON.parse(raw)); return core.isMeaningfulDraft(draft) ? draft : null; } catch (error) { return null; } }
    function showRestore(draft) { if (!restore) return; var copy = restore.querySelector('[data-invoice-restore-copy]'); if (copy) copy.textContent = 'A saved invoice is available on this device.'; restore.hidden = false; restore.dataset.hasDraft = 'true'; restore._draft = draft; }
    function saveDraft() { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(state)); } catch (error) { setStatus('Local saving is unavailable; you can still export.', 'error'); } }
    function scheduleSave() { window.clearTimeout(autosaveTimer); autosaveTimer = window.setTimeout(saveDraft, 450); }
    function syncTransliterationMode() {
        if (!transliterationControl) return;
        try {
            if (state.languageMode === 'english') {
                if (typeof transliterationControl.disableTransliteration === 'function') transliterationControl.disableTransliteration();
            } else if (typeof transliterationControl.enableTransliteration === 'function') transliterationControl.enableTransliteration();
        } catch (error) {}
    }
    function onFieldChange(field) { var path = field.getAttribute('data-field'), value = field.type === 'checkbox' ? field.checked : field.value; setPath(state, path, value); if (path === 'qr.customCaption') state.qr.captionMode = core.hasMeaningfulText(value) ? 'custom' : 'automatic'; state.updatedAt = new Date().toISOString(); if (path === 'languageMode') syncTransliterationMode(); renderPreview(); scheduleSave(); }
    function bind() {
        root.addEventListener('input', function (event) {
            var field = event.target.closest('[data-field]'); if (field) onFieldChange(field);
        });
        root.addEventListener('change', function (event) {
            var field = event.target.closest('[data-field]'); if (field) onFieldChange(field);
            var section = event.target.closest('[data-section]'); if (section) { state.sections[section.getAttribute('data-section')].enabled = section.checked; if (section.getAttribute('data-section') === 'qr') state.qr.enabled = section.checked; renderFieldValues(); renderPreview(); scheduleSave(); }
        });
        root.addEventListener('click', function (event) {
            var remove = event.target.closest('[data-remove-item]'); if (remove) { var row = remove.closest('[data-item-id]'); state.items = state.items.filter(function (item) { return item.id !== row.dataset.itemId; }); if (!state.items.length) state.items.push({ id: 'item_' + Date.now(), description: '', quantity: '1', unitPrice: '' }); renderItemsEditor(); renderPreview(false); scheduleSave(); return; }
        });
        root.querySelector('[data-invoice-add-item]').addEventListener('click', function () { if (state.items.length < core.MAX_ITEMS) { state.items.push({ id: 'item_' + Date.now(), description: '', quantity: '1', unitPrice: '' }); renderItemsEditor(); renderPreview(false); scheduleSave(); } });
        root.querySelector('[data-invoice-sample]').addEventListener('click', loadSample);
        root.querySelector('[data-invoice-reset]').addEventListener('click', reset);
        root.querySelector('[data-invoice-new]').addEventListener('click', reset);
        root.querySelector('[data-invoice-print]').addEventListener('click', printInvoice);
        var pdfButton = root.querySelector('[data-invoice-pdf]'); if (pdfButton) pdfButton.addEventListener('click', downloadPdf);
        root.querySelector('[data-invoice-png]').addEventListener('click', downloadPng);
        root.querySelector('[data-invoice-restore-action]').addEventListener('click', function () { if (pendingDraft) { state = pendingDraft; pendingDraft = null; restore.hidden = true; renderItemsEditor(); renderFieldValues(); renderPreview(false); } });
        root.querySelector('[data-invoice-discard]').addEventListener('click', function () { try { localStorage.removeItem(DRAFT_KEY); } catch (error) {} pendingDraft = null; restore.hidden = true; state = core.createDefaultInvoiceDocument(); renderItemsEditor(); renderFieldValues(); renderPreview(false); });
    }
    function reset() { if (core.isMeaningfulDraft(state) && !window.confirm('Start a new invoice and clear the current fields?')) return; pendingDraft = null; if (restore) restore.hidden = true; state = core.createDefaultInvoiceDocument(); try { localStorage.removeItem(DRAFT_KEY); } catch (error) {} renderItemsEditor(); renderFieldValues(); renderPreview(false); }
    function loadSample() { if (core.isMeaningfulDraft(state) && !window.confirm('Replace the current invoice with a sample?')) return; pendingDraft = null; if (restore) restore.hidden = true; state = core.createDefaultInvoiceDocument(); state.seller.name = 'Write Urdu Studio'; state.seller.tagline = 'Urdu writing tools'; state.seller.address = 'Online service'; state.buyer.name = 'Bright Future Academy'; state.buyer.address = 'Lahore, Pakistan'; state.items = [{ id: 'sample-1', description: 'Document formatting service', quantity: '2', unitPrice: '12500' }, { id: 'sample-2', description: 'Urdu card design', quantity: '1', unitPrice: '8000' }]; state.notes = 'Thank you for your business.'; state.footerMessage = 'Thank you for your trust and business!'; renderItemsEditor(); renderFieldValues(); renderPreview(false); scheduleSave(); }
    function zeroTotalMessage() {
        if (state.languageMode === 'urdu') return 'اس انوائس کی کل رقم صفر ہے۔\n\nممکن ہے انوائس نامکمل ہو کیونکہ تمام اشیاء کی رقم صفر ہے۔\n\nکیا آپ پھر بھی جاری رکھنا چاہتے ہیں؟';
        if (state.languageMode === 'bilingual') return 'This invoice has a zero total.\n\nاس انوائس کی کل رقم صفر ہے۔\n\nThe invoice may be incomplete because all item amounts are zero.\n\nDownload anyway?';
        return 'This invoice has a zero total.\n\nThe invoice may be incomplete because all item amounts are zero.\n\nDownload anyway?';
    }
    function confirmZeroTotal() {
        if (!core.requiresZeroTotalConfirmation(state)) return Promise.resolve(true);
        if (!zeroTotalDialog || typeof zeroTotalDialog.showModal !== 'function') return Promise.resolve(window.confirm(zeroTotalMessage()));
        var title = zeroTotalDialog.querySelector('#invoice-zero-dialog-title'), copy = zeroTotalDialog.querySelector('#invoice-zero-dialog-copy'), confirm = zeroTotalDialog.querySelector('[data-invoice-zero-confirm]'), cancel = zeroTotalDialog.querySelector('[data-invoice-zero-cancel]');
        if (title) title.textContent = state.languageMode === 'urdu' ? 'اس انوائس کی کل رقم صفر ہے' : state.languageMode === 'bilingual' ? 'This invoice has a zero total / اس انوائس کی کل رقم صفر ہے' : 'This invoice has a zero total';
        if (copy) copy.textContent = state.languageMode === 'urdu' ? 'ممکن ہے انوائس نامکمل ہو کیونکہ تمام اشیاء کی رقم صفر ہے۔' : state.languageMode === 'bilingual' ? 'The invoice may be incomplete because all item amounts are zero. ممکن ہے انوائس نامکمل ہو۔' : 'The invoice may be incomplete because all item amounts are zero.';
        if (confirm) confirm.textContent = state.languageMode === 'urdu' ? 'پھر بھی جاری رکھیں' : 'Download anyway';
        if (cancel) cancel.textContent = state.languageMode === 'urdu' ? 'منسوخ کریں' : 'Cancel';
        return new Promise(function (resolve) { var settled = false, finish = function () { if (settled) return; settled = true; zeroTotalDialog.removeEventListener('close', onClose); resolve(zeroTotalDialog.returnValue === 'confirm'); }, onClose = function () { finish(); }; zeroTotalDialog.addEventListener('close', onClose); zeroTotalDialog.showModal(); });
    }
    function prepareExport() { var result = core.validateInvoice(state); updateFitStatus(); if (!result.valid) { var first = Object.keys(result.errors)[0]; var field = root.querySelector('[data-field="' + first + '"]'); if (field) field.focus(); setStatus(result.errors[first] || 'Please complete the required fields.', 'error'); return Promise.reject(new Error(result.errors[first] || 'Invoice is not valid.')); } if (preview.scrollHeight > preview.clientHeight + 2) { setStatus('Shorten the content or remove an optional section before downloading.', 'error'); return Promise.reject(new Error('Invoice is too long for one page.')); } return confirmZeroTotal().then(function (confirmed) { if (!confirmed) throw new Error('Export cancelled.'); return document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve(); }); }
    function downloadBlob(blob, name) { var url = URL.createObjectURL(blob), anchor = document.createElement('a'); anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove(); window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000); }
    function printInvoice() { prepareExport().then(function () { window.print(); }).catch(function () {}); }
    function downloadPdf() { prepareExport().then(function () { if (typeof window.html2canvas !== 'function') throw new Error('PDF export is unavailable in this browser.'); if (!window.jspdf || typeof window.jspdf.jsPDF !== 'function') throw new Error('The PDF library is unavailable. Use Print invoice instead.'); return window.html2canvas(preview, { backgroundColor: '#ffffff', scale: 2, useCORS: true, logging: false, width: preview.scrollWidth, height: preview.scrollHeight }); }).then(function (canvas) { var Pdf = window.jspdf.jsPDF, doc = new Pdf({ unit: 'mm', format: 'a4', orientation: 'portrait' }); doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297); doc.save(core.safeFilename(state.invoiceNumber, state.buyer.name, 'pdf')); setStatus('PDF downloaded.', 'ready'); }).catch(function (error) { setStatus(error.message || 'Unable to create the PDF.', 'error'); }); }
    function downloadPng() { prepareExport().then(function () { if (typeof window.html2canvas !== 'function') throw new Error('PNG export is unavailable in this browser.'); return window.html2canvas(preview, { backgroundColor: '#ffffff', scale: 2, useCORS: true, logging: false, width: preview.scrollWidth, height: preview.scrollHeight }); }).then(function (canvas) { return new Promise(function (resolve) { canvas.toBlob(function (blob) { if (blob) { downloadBlob(blob, core.safeFilename(state.invoiceNumber, state.buyer.name, 'png')); setStatus('PNG downloaded.', 'ready'); } resolve(); }, 'image/png'); }); }).catch(function (error) { setStatus(error.message || 'Unable to create the PNG.', 'error'); }); }
    function initTransliteration() { var ids = ['invoiceSellerName', 'invoiceSellerTagline', 'invoiceSellerAddress', 'invoiceBuyerName', 'invoiceBuyerAddress', 'invoiceNotes', 'invoiceTerms', 'invoiceBankName', 'invoiceAccountTitle', 'invoicePaymentInstructions', 'invoiceAuthName', 'invoiceAuthRole', 'invoiceFooter', 'invoiceQrCaption']; if (!window.google || !google.load || !google.setOnLoadCallback) return; try { google.load('elements', '1', { packages: 'transliteration' }); google.setOnLoadCallback(function () { try { transliterationControl = new google.elements.transliteration.TransliterationControl({ sourceLanguage: google.elements.transliteration.LanguageCode.ENGLISH, destinationLanguage: [google.elements.transliteration.LanguageCode.URDU], shortcutKey: 'ctrl+g', transliterationEnabled: state.languageMode !== 'english' }); transliterationControl.makeTransliteratable(ids); syncTransliterationMode(); } catch (error) {} }); } catch (error) {} }
    pendingDraft = loadDraft();
    if (pendingDraft) showRestore(pendingDraft);
    bind(); renderItemsEditor(); renderFieldValues(); renderPreview(false); initTransliteration();
}());
