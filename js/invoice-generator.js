(function () {
    'use strict';
    var root = document.querySelector('[data-invoice-generator]');
    var core = window.WriteUrduInvoiceCore;
    var renderer = window.WriteUrduInvoiceDocument;
    var pdfText = window.WriteUrduInvoicePdfText;
    if (!root || !core || !renderer) return;

    // Storage: the current draft keeps its original key so existing drafts
    // restore unchanged. Invoice history, the remembered business profile and
    // design preferences live beside it, all in this browser only.
    var DRAFT_KEY = 'writeUrdu.invoiceGenerator.draft.v1';
    var HISTORY_KEY = 'writeUrdu.invoiceGenerator.history.v1';
    var BUSINESS_KEY = 'writeUrdu.invoiceGenerator.business.v1';
    var PREFS_KEY = 'writeUrdu.invoiceGenerator.prefs.v1';
    var HISTORY_LIMIT = 25;
    var PAGE_WIDTH = 794;
    var PAGE_HEIGHT = 1123;
    var PAGE_GAP = 24;
    var MOBILE_QUERY = window.matchMedia ? window.matchMedia('(max-width: 899px)') : { matches: false, addEventListener: function () {} };

    var state = core.createDefaultInvoiceDocument();
    var startedOwn = false;
    var zoomMode = 'fit';
    var fullZoom = 0;
    var qrCache = {};
    var saveTimer = null;
    var thumbTimer = null;
    var frame = 0;
    var toastTimer = null;
    var lastSavedAt = null;
    var transliterationControl = null;
    var urduFieldCounter = 0;
    var exporting = false;

    var $ = function (selector, scope) { return (scope || root).querySelector(selector); };
    var $$ = function (selector, scope) { return Array.prototype.slice.call((scope || root).querySelectorAll(selector)); };
    var preview = $('[data-invoice-preview]');
    var scaler = $('[data-invoice-scaler]');
    var canvas = $('[data-invoice-canvas]');
    var statusNode = $('[data-invoice-fit-status]');
    var itemsHost = $('[data-invoice-items]');

    function esc(value) {
        return String(value === undefined || value === null ? '' : value).replace(/[&<>"']/g, function (char) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]; });
    }
    function getPath(object, path) { return path.split('.').reduce(function (value, key) { return value && value[key]; }, object); }
    function setPath(object, path, value) {
        var keys = path.split('.'), target = object;
        keys.slice(0, -1).forEach(function (key) { if (!target[key] || typeof target[key] !== 'object') target[key] = {}; target = target[key]; });
        target[keys[keys.length - 1]] = value;
    }
    function readJson(key) { try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (error) { return null; } }
    function writeJson(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (error) { return false; } }
    function removeKey(key) { try { localStorage.removeItem(key); } catch (error) { /* storage unavailable */ } }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function money(minorValue, doc) { var amount = (minorValue || 0) / 100; var whole = Math.round(amount) === amount; return (doc || state).currency + ' ' + amount.toLocaleString('en-US', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }); }
    function todayIso() { var now = new Date(); return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
    function addDays(iso, days) { var base = iso ? new Date(iso + 'T00:00:00') : new Date(); base.setDate(base.getDate() + days); return new Date(base.getTime() - base.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
    function relativeTime(iso) {
        var then = new Date(iso).getTime(); if (!then) return '';
        var minutes = Math.round((Date.now() - then) / 60000);
        if (minutes < 1) return 'just now';
        if (minutes < 60) return minutes + ' min ago';
        var date = new Date(iso);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ', ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
    function setStatus(message, type) {
        if (!statusNode) return;
        statusNode.textContent = message;
        statusNode.classList.toggle('is-error', type === 'error');
        statusNode.classList.toggle('is-ready', type === 'ready');
        statusNode.classList.add('is-visible');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function () { statusNode.classList.remove('is-visible'); }, type === 'error' ? 6000 : 3800);
    }

    /* ---------- What the preview shows ---------- */
    function showingDemo() { return !startedOwn && !core.isMeaningfulDraft(state); }
    function displayDoc() {
        if (!showingDemo()) return state;
        var demo = core.createSampleInvoice(state.languageMode);
        demo.templateId = state.templateId;
        demo.design = clone(state.design);
        demo.currency = state.currency;
        demo.seller.logoDataUrl = state.seller.logoDataUrl;
        return demo;
    }

    /* ---------- Persistence ---------- */
    function prefsFrom(doc) { return { templateId: doc.templateId, languageMode: doc.languageMode, design: clone(doc.design), currency: doc.currency }; }
    function loadHistory() { var list = readJson(HISTORY_KEY); return Array.isArray(list) ? list.filter(function (entry) { return entry && entry.id; }) : []; }
    // Logos are the largest part of a saved invoice. If storage runs out,
    // older copies drop their logo first, and only then are the oldest
    // invoices left out.
    function saveHistory(list) {
        var trimmed = list.slice(0, HISTORY_LIMIT);
        if (writeJson(HISTORY_KEY, trimmed)) return trimmed.length;
        trimmed = trimmed.map(function (entry, index) { if (index === 0 || !entry.seller || !entry.seller.logoDataUrl) return entry; var copy = clone(entry); copy.seller.logoDataUrl = ''; return copy; });
        while (trimmed.length && !writeJson(HISTORY_KEY, trimmed)) trimmed = trimmed.slice(0, Math.floor(trimmed.length / 2));
        return trimmed.length;
    }
    function upsertHistory(doc) {
        var list = loadHistory().filter(function (entry) { return entry.id !== doc.id; });
        list.unshift(Object.assign(clone(doc), { savedAt: new Date().toISOString() }));
        saveHistory(list);
    }
    function businessProfile() { var profile = readJson(BUSINESS_KEY); return profile && profile.seller && core.hasMeaningfulText(profile.seller.name) ? profile : null; }
    function rememberBusiness() {
        writeJson(BUSINESS_KEY, { seller: clone(state.seller), paymentDetails: clone(state.paymentDetails), savedAt: new Date().toISOString() });
    }
    function saveNow() {
        window.clearTimeout(saveTimer);
        if (showingDemo()) { renderSaveState(); return; }
        state.updatedAt = new Date().toISOString();
        var ok = writeJson(DRAFT_KEY, state);
        if (ok && !state.isSample && core.isMeaningfulDraft(state)) upsertHistory(state);
        writeJson(PREFS_KEY, Object.assign(readJson(PREFS_KEY) || {}, prefsFrom(state)));
        var remember = $('[data-invoice-remember-business]');
        if (ok && remember && remember.checked && core.hasMeaningfulText(state.seller.name)) rememberBusiness();
        lastSavedAt = ok ? state.updatedAt : null;
        renderSaveState(ok ? 'saved' : 'failed');
    }
    function scheduleSave() { renderSaveState('saving'); window.clearTimeout(saveTimer); saveTimer = window.setTimeout(saveNow, 500); }
    function renderSaveState(mode) {
        var node = $('[data-invoice-save-state]'), textNode = $('[data-invoice-save-text]');
        if (!node || !textNode) return;
        var label = 'Not saved yet';
        if (showingDemo()) label = 'Nothing to save yet';
        else if (mode === 'saving') label = 'Saving…';
        else if (mode === 'failed') label = 'Can’t save in this browser';
        else if (lastSavedAt) label = 'Saved on this device';
        node.dataset.state = mode === 'failed' ? 'error' : mode === 'saving' ? 'saving' : lastSavedAt ? 'saved' : 'idle';
        textNode.textContent = label;
        node.title = lastSavedAt ? 'Saved ' + relativeTime(lastSavedAt) + '. Only this browser keeps it.' : '';
    }

    /* ---------- Banner and start card ---------- */
    function showBanner(message, actions) {
        var banner = $('[data-invoice-banner]');
        if (!banner) return;
        $('[data-invoice-banner-copy]').textContent = message;
        var host = $('[data-invoice-banner-actions]');
        host.innerHTML = '';
        (actions || []).forEach(function (action) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = action.primary ? 'inv-btn inv-btn-small inv-btn-secondary' : 'inv-link';
            button.textContent = action.label;
            button.addEventListener('click', function () { banner.hidden = true; action.run(); });
            host.appendChild(button);
        });
        var close = document.createElement('button');
        close.type = 'button'; close.className = 'inv-banner-close'; close.setAttribute('aria-label', 'Dismiss'); close.textContent = '✕';
        close.addEventListener('click', function () { banner.hidden = true; });
        host.appendChild(close);
        banner.hidden = false;
    }
    function renderStartCard() {
        var start = $('[data-invoice-start]'), badge = $('[data-invoice-sample-badge]'), demo = showingDemo();
        if (start) start.hidden = !demo;
        if (badge) badge.hidden = !demo;
        root.classList.toggle('is-demo', demo);
    }

    /* ---------- Editor rendering ---------- */
    function renderFieldValues() {
        $$('[data-field]').forEach(function (field) {
            var value = getPath(state, field.getAttribute('data-field'));
            if (field.type === 'checkbox') field.checked = Boolean(value);
            else if (document.activeElement !== field && field.value !== String(value === undefined || value === null ? '' : value)) field.value = value === undefined || value === null ? '' : value;
        });
        $$('[data-section]').forEach(function (field) { var key = field.getAttribute('data-section'); field.checked = Boolean(state.sections[key] && state.sections[key].enabled); });
        var qrFields = $('[data-invoice-qr-fields]'); if (qrFields) qrFields.hidden = !state.sections.qr.enabled;
        $$('[data-qr-purpose]').forEach(function (field) { field.hidden = field.getAttribute('data-qr-purpose') !== state.qr.purpose; });
        var authFields = $('[data-invoice-auth-fields]'); if (authFields) authFields.hidden = !state.sections.authorization.enabled;
        $$('[data-lang-option]').forEach(function (button) { button.setAttribute('aria-checked', String(button.getAttribute('data-lang-option') === state.languageMode)); });
        $$('[data-template-option]').forEach(function (button) { button.setAttribute('aria-checked', String(button.getAttribute('data-template-option') === state.templateId)); });
        $$('[data-font-option]').forEach(function (button) { button.setAttribute('aria-checked', String(button.getAttribute('data-font-option') === state.design.urduFont)); });
        var preset = core.ACCENTS.indexOf(state.design.accent) >= 0;
        $$('[data-accent-option]').forEach(function (button) { button.setAttribute('aria-checked', String(button.getAttribute('data-accent-option') === state.design.accent)); });
        var custom = $('.inv-swatch-custom'); if (custom) { custom.classList.toggle('is-selected', !preset); custom.style.setProperty('--swatch', preset ? '#ffffff' : state.design.accent); }
        renderLogoControls();
        renderSavedBusiness();
        var inputMode = $('[data-input-mode-control]'); if (inputMode) inputMode.hidden = state.languageMode === 'english';
        var taxValue = $('[data-tax-value-field]'); if (taxValue) taxValue.hidden = state.tax.mode === 'per-item';
        var taxHelp = $('[data-tax-per-item-help]'); if (taxHelp) taxHelp.hidden = state.tax.mode !== 'per-item';
        root.dataset.lang = state.languageMode;
    }
    function renderLogoControls() {
        var box = $('[data-invoice-logo-preview]'), remove = $('[data-invoice-logo-remove]'), action = $('[data-invoice-logo-action]');
        var hasLogo = Boolean(state.seller.logoDataUrl);
        if (box) { box.classList.toggle('has-logo', hasLogo); box.style.backgroundImage = hasLogo ? 'url("' + state.seller.logoDataUrl + '")' : ''; }
        if (remove) remove.hidden = !hasLogo;
        if (action) action.textContent = hasLogo ? 'Change logo' : 'Add logo';
    }
    function renderSavedBusiness() {
        var host = $('[data-invoice-saved-business]'), profile = businessProfile(), remember = $('[data-invoice-remember-business]');
        if (remember) remember.checked = Boolean(profile);
        if (!host) return;
        var show = Boolean(profile) && !core.hasMeaningfulText(state.seller.name);
        host.hidden = !show;
        if (show) {
            host.innerHTML = '<span>Use your saved details: <strong dir="auto">' + esc(profile.seller.name) + '</strong></span><button type="button" class="inv-btn inv-btn-small inv-btn-secondary" data-use-saved-business>Use</button>';
        }
    }
    function itemRowHtml(item, index, amount) {
        var base = 'item-' + esc(item.id);
        return '<div class="inv-item" data-item-id="' + esc(item.id) + '" data-item-index="' + index + '">' +
            '<label class="inv-item-desc"><span class="inv-item-label">Item ' + (index + 1) + '</span><input data-item-field="description" data-urdu-input value="' + esc(item.description) + '" maxlength="' + core.MAX_DESCRIPTION + '" placeholder="Item or service" aria-label="Item ' + (index + 1) + ' description" aria-describedby="' + base + '-err"></label>' +
            '<label class="inv-item-qty"><span class="inv-item-label">Qty</span><input data-item-field="quantity" inputmode="decimal" dir="ltr" value="' + esc(item.quantity) + '" aria-label="Item ' + (index + 1) + ' quantity"></label>' +
            '<label class="inv-item-unit"><span class="inv-item-label">Unit</span><input data-item-field="unit" dir="auto" list="inv-unit-options" maxlength="' + core.MAX_UNIT + '" value="' + esc(item.unit) + '" placeholder="' + (state.languageMode === 'urdu' ? 'عدد' : 'pcs') + '" aria-label="Item ' + (index + 1) + ' unit"></label>' +
            '<label class="inv-item-price"><span class="inv-item-label">Price</span><input data-item-field="unitPrice" inputmode="decimal" dir="ltr" value="' + esc(item.unitPrice) + '" placeholder="0" aria-label="Item ' + (index + 1) + ' price"></label>' +
            '<label class="inv-item-tax"><span class="inv-item-label">Tax %</span><input data-item-field="taxRate" inputmode="decimal" dir="ltr" value="' + esc(item.taxRate) + '" placeholder="0" aria-label="Item ' + (index + 1) + ' tax rate"></label>' +
            '<output class="inv-item-amount" data-item-amount aria-label="Item ' + (index + 1) + ' amount">' + esc(money(amount)) + '</output>' +
            '<span class="inv-item-tools"><button type="button" class="inv-icon-btn" data-move-item="-1" aria-label="Move item ' + (index + 1) + ' up"' + (index === 0 ? ' disabled' : '') + '><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg></button><button type="button" class="inv-icon-btn" data-move-item="1" aria-label="Move item ' + (index + 1) + ' down"' + (index === state.items.length - 1 ? ' disabled' : '') + '><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button><button type="button" class="inv-icon-btn inv-icon-danger" data-remove-item aria-label="Remove item ' + (index + 1) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 11v6M14 11v6M7 7l1 12h8l1-12M9 7V4h6v3"/></svg></button></span>' +
            '<span class="inv-error inv-item-error" id="' + base + '-err" data-item-error></span></div>';
    }
    function renderItemsEditor() {
        if (!itemsHost) return;
        var totals = core.calculateInvoiceTotals(state);
        itemsHost.innerHTML = state.items.map(function (item, index) { return itemRowHtml(item, index, totals.lineAmounts[index]); }).join('');
        itemsHost.classList.toggle('has-item-tax', state.tax.mode === 'per-item');
        renderUnitOptions();
        var add = $('[data-invoice-add-item]'); if (add) add.disabled = state.items.length >= core.MAX_ITEMS;
        registerUrduFields();
    }
    // Unit suggestions follow the invoice language; people can still type any unit.
    function renderUnitOptions() {
        var list = document.getElementById('inv-unit-options');
        if (!list) return;
        var mode = state.languageMode;
        if (list.dataset.mode === mode) return;
        list.dataset.mode = mode;
        list.innerHTML = core.UNITS.map(function (pair) {
            return mode === 'urdu' ? '<option value="' + esc(pair[1]) + '">' : mode === 'bilingual' ? '<option value="' + esc(pair[0]) + '"><option value="' + esc(pair[1]) + '">' : '<option value="' + esc(pair[0]) + '">';
        }).join('');
    }
    function newItem() { return { id: 'item_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), description: '', quantity: '1', unit: '', unitPrice: '', taxRate: '' }; }
    function updateItemAmounts() {
        var totals = core.calculateInvoiceTotals(state);
        $$('[data-item-amount]').forEach(function (node, index) { node.textContent = money(totals.lineAmounts[index]); });
    }
    function renderSummary() {
        var t = core.calculateInvoiceTotals(state), rows = [];
        function row(label, value, cls) { rows.push('<div class="inv-summary-row' + (cls ? ' ' + cls : '') + '"><span>' + label + '</span><strong dir="ltr">' + esc(value) + '</strong></div>'); }
        row('Subtotal', money(t.subtotalMinor));
        if (t.discountMinor) row('Discount', '− ' + money(t.discountMinor));
        if (t.taxMinor) row('Tax', money(t.taxMinor));
        if (t.additionalChargeMinor) row('Extra charges', money(t.additionalChargeMinor));
        row('Total', money(t.grandTotalMinor), 'is-total');
        var summary = $('[data-invoice-summary]'); if (summary) summary.innerHTML = rows.join('');
        var due = t.balanceDueMinor;
        var finish = $('[data-invoice-finish-total]');
        if (finish) finish.innerHTML = '<span class="inv-finish-label">' + (t.amountPaidMinor ? 'Balance due' : 'Amount due') + '</span><strong dir="ltr">' + esc(money(due)) + '</strong>' + (t.amountPaidMinor ? '<span class="inv-finish-sub" dir="ltr">Total ' + esc(money(t.grandTotalMinor)) + ' · Received ' + esc(money(t.amountPaidMinor)) + '</span>' : '');
        var mobile = $('[data-invoice-mobile-total]');
        if (mobile) mobile.innerHTML = '<span>' + (t.amountPaidMinor ? 'Balance due' : 'Total') + '</span><strong dir="ltr">' + esc(money(showingDemo() ? 0 : due)) + '</strong>';
    }
    function renderChecklist() {
        var host = $('[data-invoice-checklist]'); if (!host) return;
        var checks = [
            [core.hasMeaningfulText(state.seller.name), 'Your business name', 'seller.name'],
            [core.hasMeaningfulText(state.buyer.name), 'Customer name', 'buyer.name'],
            [core.meaningfulItems(state).some(function (item) { return core.hasMeaningfulText(item.description) && core.numberValue(item.quantity, 0) > 0; }), 'At least one item', 'items']
        ];
        host.innerHTML = checks.map(function (check) { return '<li class="' + (check[0] ? 'is-done' : '') + '"><span aria-hidden="true">' + (check[0] ? '✓' : '') + '</span>' + (check[0] ? esc(check[1]) : '<button type="button" class="inv-link" data-focus-field="' + check[2] + '">Add ' + esc(check[1].toLowerCase()) + '</button>') + '</li>'; }).join('');
        host.classList.toggle('is-complete', checks.every(function (check) { return check[0]; }));
    }
    function renderHints() {
        var t = core.calculateInvoiceTotals(state), count = core.meaningfulItems(state).length;
        var hints = {
            design: renderer.TEMPLATE_NAMES[state.templateId] + ' · ' + ({ english: 'English', urdu: 'اردو', bilingual: 'Both' })[state.languageMode],
            parties: core.hasMeaningfulText(state.seller.name) || core.hasMeaningfulText(state.buyer.name) ? [state.seller.name, state.buyer.name].filter(core.hasMeaningfulText).join(' → ') : 'Add names',
            items: count ? count + (count === 1 ? ' item · ' : ' items · ') + money(t.grandTotalMinor) : 'Add what you charge for',
            finish: state.invoiceNumber + ' · ' + state.status
        };
        $$('[data-section-hint]').forEach(function (node) { node.textContent = hints[node.getAttribute('data-section-hint')] || ''; node.setAttribute('dir', 'auto'); });
        var warning = $('[data-invoice-due-warning]');
        if (warning) warning.textContent = state.dueDate && state.issueDate && state.dueDate < state.issueDate ? 'The due date is before the invoice date.' : '';
    }

    /* ---------- Preview ---------- */
    function qrPayload(doc) { return doc.qr.enabled && doc.sections.qr.enabled ? core.getQrPayload(doc) : ''; }
    function ensureQr(doc) {
        var payload = qrPayload(doc);
        if (!payload || qrCache[payload] !== undefined || !window.QRCode || typeof window.QRCode.toDataURL !== 'function') return Promise.resolve(qrCache[payload]);
        qrCache[payload] = '';
        return window.QRCode.toDataURL(payload, { width: 220, margin: 1, color: { dark: '#17263b', light: '#ffffff' } }).then(function (url) {
            qrCache[payload] = url; requestRender();
            return url;
        }).catch(function () { setStatus('The QR code could not be created from these details.', 'error'); });
    }
    // Pages are always laid out in an off-screen host that is never hidden,
    // because pagination measures real heights; a hidden panel (such as the
    // mobile preview while editing) would otherwise measure zero.
    function measureHost() {
        var host = document.querySelector('.inv-measure-host');
        if (!host) { host = document.createElement('div'); host.className = 'inv-print-host inv-measure-host'; host.setAttribute('aria-hidden', 'true'); document.body.appendChild(host); }
        return host;
    }
    function renderInto(host, doc, options) {
        ensureQr(doc);
        var scratch = measureHost();
        var result = renderer.renderPages(scratch, doc, Object.assign({ qrDataUrl: qrCache[qrPayload(doc)] || '' }, options || {}));
        host.innerHTML = '';
        while (scratch.firstChild) host.appendChild(scratch.firstChild);
        return result;
    }
    function layoutPreview() {
        if (!scaler || !canvas || !preview) return;
        var pageCount = preview.children.length || 1;
        var totalHeight = pageCount * PAGE_HEIGHT + (pageCount - 1) * PAGE_GAP;
        var style = getComputedStyle(canvas);
        var available = canvas.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        var availableHeight = canvas.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
        var scale = available / PAGE_WIDTH;
        if (zoomMode === 'fit' && !MOBILE_QUERY.matches && availableHeight > 200) scale = Math.min(scale, availableHeight / PAGE_HEIGHT);
        scale = Math.max(0.2, Math.min(scale, 1.4));
        preview.style.transform = 'scale(' + scale.toFixed(4) + ')';
        scaler.style.width = Math.round(PAGE_WIDTH * scale) + 'px';
        scaler.style.height = Math.round(totalHeight * scale) + 'px';
    }
    function renderPreview() {
        var doc = displayDoc();
        var result = renderInto(preview, doc);
        layoutPreview();
        var count = $('[data-invoice-page-count]');
        if (count) count.textContent = 'A4 · ' + result.pageCount + (result.pageCount === 1 ? ' page' : ' pages');
        root.dataset.pageCount = String(result.pageCount);
        scheduleThumbnails();
        var full = document.querySelector('[data-invoice-fullscreen-dialog]');
        if (full && full.open) renderFullscreen();
    }
    function scheduleThumbnails() { window.clearTimeout(thumbTimer); thumbTimer = window.setTimeout(renderThumbnails, 350); }
    function renderThumbnails() {
        var doc = displayDoc();
        $$('[data-template-thumb]').forEach(function (thumb) {
            var copy = clone(doc); copy.templateId = thumb.getAttribute('data-template-thumb');
            var inner = thumb.firstElementChild;
            if (!inner) { inner = document.createElement('div'); inner.className = 'inv-thumb-pages'; thumb.appendChild(inner); }
            renderInto(inner, copy, { maxPages: 1 });
            var scale = thumb.clientWidth / PAGE_WIDTH;
            inner.style.transform = 'scale(' + scale + ')';
        });
    }
    function requestRender() {
        if (frame) return;
        frame = window.requestAnimationFrame(function () {
            frame = 0;
            renderPreview(); renderSummary(); renderChecklist(); renderHints(); renderStartCard();
        });
    }
    function renderAll() {
        renderFieldValues(); renderItemsEditor(); renderStartCard(); renderPreview(); renderSummary(); renderChecklist(); renderHints(); renderSaveState(lastSavedAt ? 'saved' : null);
    }

    /* ---------- Editing ---------- */
    function leaveDemo() { if (!startedOwn) { startedOwn = true; } }
    function syncStatusFromPayment() {
        var t = core.calculateInvoiceTotals(state);
        if (t.amountPaidMinor > 0 && t.grandTotalMinor > 0) state.status = t.amountPaidMinor >= t.grandTotalMinor ? 'Paid' : 'Partially paid';
        else if (state.status !== 'Paid') state.status = 'Unpaid';
    }
    function onFieldChange(field) {
        var path = field.getAttribute('data-field');
        var value = field.type === 'checkbox' ? field.checked : field.value;
        if (getPath(state, path) === value) return;
        leaveDemo();
        setPath(state, path, value);
        if (path === 'seller.name' || path === 'buyer.name') state.isSample = false;
        if (path === 'qr.customCaption') state.qr.captionMode = core.hasMeaningfulText(value) ? 'custom' : 'automatic';
        if (path === 'amountPaid') { syncStatusFromPayment(); renderFieldValues(); }
        if (path === 'qr.purpose' || path === 'design.accent') renderFieldValues();
        if (path === 'tax.mode') { renderFieldValues(); renderItemsEditor(); }
        clearError(path);
        requestRender(); scheduleSave();
    }
    function onItemChange(field) {
        var row = field.closest('[data-item-id]'), item = row ? state.items[Number(row.dataset.itemIndex)] : null;
        if (!item) return;
        var key = field.getAttribute('data-item-field');
        if (item[key] === field.value) return;
        leaveDemo();
        item[key] = field.value;
        state.isSample = false;
        var error = row.querySelector('[data-item-error]'); if (error) error.textContent = '';
        field.removeAttribute('aria-invalid');
        updateItemAmounts(); requestRender(); scheduleSave();
    }
    function addItem(focus) {
        if (state.items.length >= core.MAX_ITEMS) return;
        leaveDemo();
        state.items.push(newItem());
        renderItemsEditor(); requestRender(); scheduleSave();
        if (focus) { var last = itemsHost.lastElementChild; var input = last && last.querySelector('[data-item-field="description"]'); if (input) input.focus(); }
    }
    function moveItem(index, delta) {
        var target = index + delta; if (target < 0 || target >= state.items.length) return;
        var moved = state.items.splice(index, 1)[0]; state.items.splice(target, 0, moved);
        renderItemsEditor(); requestRender(); scheduleSave();
        var button = itemsHost.children[target] && itemsHost.children[target].querySelector('[data-move-item="' + delta + '"]:not([disabled])') || itemsHost.children[target] && itemsHost.children[target].querySelector('[data-item-field]');
        if (button) button.focus();
    }
    function removeItem(index) {
        var item = state.items[index]; if (!item) return;
        state.items.splice(index, 1);
        if (!state.items.length) state.items.push(newItem());
        renderItemsEditor(); requestRender(); scheduleSave();
        if (core.isMeaningfulItem(item)) setStatus('Item removed.', 'ready');
    }
    function setLanguage(mode) {
        if (state.languageMode === mode) return;
        state.languageMode = mode;
        syncInputMode();
        renderFieldValues(); renderItemsEditor(); requestRender(); scheduleSave();
    }
    function setTemplate(id) {
        if (state.templateId === id) return;
        state.templateId = id;
        root.classList.add('is-switching');
        window.setTimeout(function () { root.classList.remove('is-switching'); }, 260);
        renderFieldValues(); requestRender(); scheduleSave();
    }

    /* ---------- Logo ---------- */
    function readLogo(file) {
        if (!file) return;
        if (!/^image\/(png|jpeg|webp)$/.test(file.type)) { setStatus('Choose a PNG, JPG or WebP image for the logo.', 'error'); return; }
        var reader = new FileReader();
        reader.onload = function () {
            var image = new Image();
            image.onload = function () {
                var max = 480, ratio = Math.min(1, max / Math.max(image.width, image.height));
                var c = document.createElement('canvas');
                c.width = Math.max(1, Math.round(image.width * ratio)); c.height = Math.max(1, Math.round(image.height * ratio));
                c.getContext('2d').drawImage(image, 0, 0, c.width, c.height);
                leaveDemo();
                state.seller.logoDataUrl = c.toDataURL(file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.9);
                renderFieldValues(); requestRender(); scheduleSave();
                setStatus('Logo added to your invoice.', 'ready');
            };
            image.onerror = function () { setStatus('That image could not be read.', 'error'); };
            image.src = reader.result;
        };
        reader.readAsDataURL(file);
    }

    /* ---------- Confirm dialog ---------- */
    function confirmAction(title, copy, okLabel) {
        var dialog = document.querySelector('[data-invoice-confirm-dialog]');
        if (!dialog || typeof dialog.showModal !== 'function') return Promise.resolve(window.confirm(title + '\n\n' + copy));
        dialog.querySelector('[data-confirm-title]').textContent = title;
        dialog.querySelector('[data-confirm-copy]').textContent = copy;
        dialog.querySelector('[data-confirm-ok]').textContent = okLabel;
        dialog.returnValue = '';
        return new Promise(function (resolve) {
            dialog.addEventListener('close', function onClose() { dialog.removeEventListener('close', onClose); resolve(dialog.returnValue === 'confirm'); });
            dialog.showModal();
        });
    }

    /* ---------- New, sample, history ---------- */
    function freshDocument(keepBusiness) {
        var doc = core.createDefaultInvoiceDocument();
        doc.templateId = state.templateId; doc.design = clone(state.design); doc.languageMode = state.languageMode; doc.currency = state.currency;
        doc.preferences.showGeneratorCredit = state.preferences.showGeneratorCredit;
        if (keepBusiness && !state.isSample) { doc.seller = clone(state.seller); doc.paymentDetails = clone(state.paymentDetails); doc.sections.qr = clone(state.sections.qr); doc.qr = clone(state.qr); doc.footerMessage = state.footerMessage; doc.terms = state.terms; }
        var numbers = loadHistory().map(function (entry) { return entry.invoiceNumber; });
        var next = state.isSample || !core.isMeaningfulDraft(state) ? doc.invoiceNumber : core.incrementInvoiceNumber(state.invoiceNumber, new Date().getFullYear());
        while (numbers.indexOf(next) >= 0) next = core.incrementInvoiceNumber(next);
        doc.invoiceNumber = next;
        return doc;
    }
    function newInvoice() {
        var meaningful = core.isMeaningfulDraft(state) && !state.isSample;
        var proceed = meaningful ? confirmAction('Start a new invoice?', 'Invoice ' + state.invoiceNumber + ' is saved in My invoices on this device. Your business and payment details are carried over.', 'Start new invoice') : Promise.resolve(true);
        proceed.then(function (ok) {
            if (!ok) return;
            if (meaningful) saveNow();
            state = core.normalizeInvoiceDocument(freshDocument(true));
            startedOwn = true;
            renderAll(); saveNow();
            var banner = $('[data-invoice-banner]'); if (banner) banner.hidden = true;
            setStatus('New invoice ' + state.invoiceNumber + ' started.', 'ready');
            focusField('buyer.name');
        });
    }
    function loadSample() {
        var meaningful = core.isMeaningfulDraft(state) && !state.isSample;
        var proceed = meaningful ? confirmAction('Load the sample invoice?', 'Your current invoice is kept in My invoices on this device, so you can return to it.', 'Load sample') : Promise.resolve(true);
        proceed.then(function (ok) {
            if (!ok) return;
            if (meaningful) saveNow();
            var sample = core.createSampleInvoice(state.languageMode);
            sample.templateId = state.templateId; sample.design = clone(state.design);
            state = sample; startedOwn = true;
            renderAll(); saveNow();
            showBanner('Sample loaded. Replace the sample details with your own before sending.', [{ label: 'Start my own instead', primary: true, run: function () { state = core.normalizeInvoiceDocument(freshDocument(false)); renderAll(); saveNow(); focusField('seller.name'); } }]);
        });
    }
    function startOwn() {
        startedOwn = true;
        renderAll();
        focusField('seller.name');
    }
    function renderHistory() {
        var list = document.querySelector('[data-invoice-history-list]'); if (!list) return;
        var entries = loadHistory();
        if (!entries.length) { list.innerHTML = '<li class="inv-history-empty">No saved invoices yet. Invoices you create are kept here automatically.</li>'; return; }
        list.innerHTML = entries.map(function (entry) {
            var doc = core.normalizeInvoiceDocument(entry), totals = core.calculateInvoiceTotals(doc), current = doc.id === state.id;
            return '<li class="inv-history-item' + (current ? ' is-current' : '') + '" data-history-id="' + esc(doc.id) + '"><div class="inv-history-main"><strong dir="ltr">' + esc(doc.invoiceNumber) + '</strong><span dir="auto">' + esc(doc.buyer.name || 'No customer yet') + '</span></div><div class="inv-history-meta"><strong dir="ltr">' + esc(money(totals.grandTotalMinor, doc)) + '</strong><span>' + (current ? 'Open now' : esc(relativeTime(entry.savedAt || doc.updatedAt))) + '</span></div><div class="inv-history-actions">' + (current ? '' : '<button type="button" class="inv-btn inv-btn-small inv-btn-secondary" data-history-open>Open</button>') + '<button type="button" class="inv-btn inv-btn-small inv-btn-ghost" data-history-duplicate>Duplicate</button><button type="button" class="inv-icon-btn inv-icon-danger" data-history-delete aria-label="Delete invoice ' + esc(doc.invoiceNumber) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 11v6M14 11v6M7 7l1 12h8l1-12M9 7V4h6v3"/></svg></button></div></li>';
        }).join('');
    }
    function openHistory() {
        if (core.isMeaningfulDraft(state) && !state.isSample) saveNow();
        renderHistory();
        var dialog = document.querySelector('[data-invoice-history-dialog]');
        if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
    }
    function historyAction(event) {
        var item = event.target.closest('[data-history-id]'); if (!item) return;
        var id = item.getAttribute('data-history-id'), entries = loadHistory(), entry = entries.filter(function (e) { return e.id === id; })[0];
        if (!entry) return;
        var dialog = document.querySelector('[data-invoice-history-dialog]');
        if (event.target.closest('[data-history-open]')) {
            state = core.normalizeInvoiceDocument(entry); startedOwn = true; dialog.close(); renderAll(); saveNow();
            setStatus('Opened invoice ' + state.invoiceNumber + '.', 'ready');
        } else if (event.target.closest('[data-history-duplicate]')) {
            var copy = core.normalizeInvoiceDocument(clone(entry));
            var numbers = entries.map(function (e) { return e.invoiceNumber; });
            copy.id = 'invoice_' + Math.random().toString(36).slice(2, 10);
            copy.invoiceNumber = core.incrementInvoiceNumber(entries.reduce(function (max, e) { return String(e.invoiceNumber) > String(max) ? e.invoiceNumber : max; }, copy.invoiceNumber));
            while (numbers.indexOf(copy.invoiceNumber) >= 0) copy.invoiceNumber = core.incrementInvoiceNumber(copy.invoiceNumber);
            copy.issueDate = todayIso(); copy.dueDate = ''; copy.status = 'Unpaid'; copy.amountPaid = ''; copy.isSample = false; copy.createdAt = new Date().toISOString();
            state = copy; startedOwn = true; dialog.close(); renderAll(); saveNow();
            setStatus('Duplicated as ' + state.invoiceNumber + '. Check the customer and items.', 'ready');
        } else if (event.target.closest('[data-history-delete]')) {
            dialog.close();
            confirmAction('Delete invoice ' + entry.invoiceNumber + '?', 'It will be removed from this device. This cannot be undone.', 'Delete invoice').then(function (ok) {
                if (ok) {
                    saveHistory(loadHistory().filter(function (e) { return e.id !== id; }));
                    if (id === state.id) { state = core.normalizeInvoiceDocument(freshDocument(true)); renderAll(); saveNow(); }
                    setStatus('Invoice deleted from this device.', 'ready');
                }
                openHistory();
            });
        }
    }

    /* ---------- Backup, restore and spreadsheet ---------- */
    function fileStamp() { return todayIso(); }
    function downloadBackup() {
        if (core.isMeaningfulDraft(state) && !state.isSample) saveNow();
        var entries = loadHistory();
        if (!entries.length) { setStatus('There are no saved invoices to back up yet.', 'error'); return; }
        var backup = core.createBackup(entries, businessProfile());
        downloadBlob(new Blob([JSON.stringify(backup, null, 1)], { type: 'application/json' }), 'write-urdu-invoices-backup-' + fileStamp() + '.json');
        setStatus('Backup downloaded with ' + backup.invoices.length + (backup.invoices.length === 1 ? ' invoice.' : ' invoices.'), 'ready');
    }
    function downloadCsv() {
        if (core.isMeaningfulDraft(state) && !state.isSample) saveNow();
        var entries = loadHistory();
        if (!entries.length) { setStatus('There are no saved invoices to export yet.', 'error'); return; }
        downloadBlob(new Blob([core.historyToCsv(entries)], { type: 'text/csv;charset=utf-8' }), 'write-urdu-invoices-' + fileStamp() + '.csv');
        setStatus('Spreadsheet downloaded.', 'ready');
    }
    var BACKUP_ERRORS = { 'not-backup': 'This file is not a Write-Urdu invoice backup.', 'newer-version': 'This backup was made by a newer version of the page. Reload and try again.', 'too-large': 'This file is too large to be an invoice backup.', unreadable: 'The file could not be read.' };
    function restoreBackup(file) {
        if (!file) return;
        if (file.size > 8 * 1024 * 1024) { setStatus(BACKUP_ERRORS['too-large'], 'error'); return; }
        var reader = new FileReader();
        reader.onerror = function () { setStatus(BACKUP_ERRORS.unreadable, 'error'); };
        reader.onload = function () {
            var parsed = core.parseBackup(String(reader.result || ''));
            if (!parsed.ok) { setStatus(BACKUP_ERRORS[parsed.error] || BACKUP_ERRORS['not-backup'], 'error'); return; }
            if (core.isMeaningfulDraft(state) && !state.isSample) saveNow();
            var merged = core.mergeHistory(loadHistory(), parsed.invoices, HISTORY_LIMIT);
            var kept = saveHistory(merged.list);
            if (parsed.business && !businessProfile()) writeJson(BUSINESS_KEY, parsed.business);
            renderHistory(); renderSavedBusiness();
            var message = merged.added || merged.updated ? 'Restored ' + merged.added + (merged.added === 1 ? ' invoice' : ' invoices') + (merged.updated ? ' and updated ' + merged.updated : '') + '.' : 'Everything in this backup is already here.';
            if (merged.dropped || kept < merged.list.length) message += ' Only the newest ' + Math.min(kept, HISTORY_LIMIT) + ' invoices are kept.';
            setStatus(message, 'ready');
        };
        reader.readAsText(file);
    }

    /* ---------- Validation ---------- */
    function clearError(path) {
        var node = root.querySelector('[data-error-for="' + path + '"]'); if (node) node.textContent = '';
        var field = root.querySelector('[data-field="' + path + '"]'); if (field) field.removeAttribute('aria-invalid');
    }
    function reveal(element) {
        var details = element; while (details && details !== root) { if (details.tagName === 'DETAILS') details.open = true; details = details.parentElement; }
        if (MOBILE_QUERY.matches && root.dataset.view !== 'edit') setView('edit');
    }
    function focusField(path) {
        var field = path === 'items' ? itemsHost.querySelector('[data-item-field="description"]') : root.querySelector('[data-field="' + path + '"]');
        if (!field) return;
        reveal(field);
        window.setTimeout(function () { field.focus({ preventScroll: true }); field.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 30);
    }
    function showErrors(errors) {
        $$('[data-error-for]').forEach(function (node) { node.textContent = ''; });
        $$('[aria-invalid]').forEach(function (node) { node.removeAttribute('aria-invalid'); });
        var first = null;
        Object.keys(errors).forEach(function (key) {
            var match = key.match(/^items\.(\d+)\.(\w+)$/);
            if (match) {
                var row = itemsHost.children[Number(match[1])];
                var input = row && row.querySelector('[data-item-field="' + match[2] + '"]');
                var message = row && row.querySelector('[data-item-error]');
                if (input) input.setAttribute('aria-invalid', 'true');
                if (message && !message.textContent) message.textContent = errors[key];
                if (!first && input) first = input;
                return;
            }
            var node = root.querySelector('[data-error-for="' + key + '"]'); if (node) node.textContent = errors[key];
            var field = root.querySelector('[data-field="' + key + '"]');
            if (field) field.setAttribute('aria-invalid', 'true');
            if (!first) first = field || node;
        });
        if (first) { reveal(first); window.setTimeout(function () { if (first.focus) first.focus({ preventScroll: true }); first.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 30); }
    }
    function confirmZeroTotal() {
        if (!core.requiresZeroTotalConfirmation(state)) return Promise.resolve(true);
        var dialog = root.querySelector('[data-invoice-zero-dialog]');
        if (!dialog || typeof dialog.showModal !== 'function') return Promise.resolve(window.confirm('This invoice has a zero total. Download anyway?'));
        dialog.returnValue = '';
        return new Promise(function (resolve) { dialog.addEventListener('close', function onClose() { dialog.removeEventListener('close', onClose); resolve(dialog.returnValue === 'confirm'); }); dialog.showModal(); });
    }
    function prepareExport() {
        if (exporting) return Promise.reject(new Error('busy'));
        if (showingDemo()) {
            setStatus('Add your business, customer and items first — the preview is only a sample.', 'error');
            startOwn();
            return Promise.reject(new Error('demo'));
        }
        var result = core.validateInvoice(state);
        if (!result.valid) {
            showErrors(result.errors);
            setStatus(result.errors[Object.keys(result.errors)[0]] || 'Please complete the highlighted fields.', 'error');
            return Promise.reject(new Error('invalid'));
        }
        var sampleCheck = state.isSample ? confirmAction('This invoice still has sample details', 'The business, customer or items still come from the sample. Download it anyway?', 'Download anyway') : Promise.resolve(true);
        return sampleCheck.then(function (ok) { if (!ok) throw new Error('cancelled'); return confirmZeroTotal(); }).then(function (ok) {
            if (!ok) throw new Error('cancelled');
            saveNow();
            return ensureFonts().then(function () { return ensureQr(state); });
        });
    }
    function ensureFonts() {
        if (!document.fonts || !document.fonts.load) return Promise.resolve();
        var families = ['400 12px Inter', '700 12px Inter', '700 12px "Plus Jakarta Sans"', '400 14px "Noto Nastaliq Urdu"', '700 14px "Noto Nastaliq Urdu"', '400 14px "Noto Naskh Arabic"', '700 14px "Noto Naskh Arabic"'];
        return Promise.all(families.map(function (font) { return document.fonts.load(font, 'Aa ۱ اردو').catch(function () {}); })).then(function () { return document.fonts.ready; });
    }

    /* ---------- Export ---------- */
    function exportHost() {
        var host = document.querySelector('.inv-export-host');
        if (!host) { host = document.createElement('div'); host.className = 'inv-print-host inv-export-host'; host.setAttribute('aria-hidden', 'true'); document.body.appendChild(host); }
        renderInto(host, state);
        return host;
    }
    function capturePages() {
        if (typeof window.html2canvas !== 'function') return Promise.reject(new Error('Export is unavailable in this browser. Use Print instead.'));
        var host = exportHost(), pages = Array.prototype.slice.call(host.querySelectorAll('.inv-page'));
        return pages.reduce(function (chain, page) {
            return chain.then(function (list) {
                var runs = pdfText ? pdfText.collectRuns(page) : [];
                return window.html2canvas(page, { backgroundColor: getComputedStyle(page).backgroundColor || '#ffffff', scale: 2.5, useCORS: true, logging: false, width: PAGE_WIDTH, height: PAGE_HEIGHT, windowWidth: 1280, scrollX: 0, scrollY: 0 }).then(function (c) { c.textRuns = runs; list.push(c); return list; });
            });
        }, Promise.resolve([]));
    }
    function buildPdf() {
        return capturePages().then(function (canvases) {
            if (!window.jspdf || typeof window.jspdf.jsPDF !== 'function') throw new Error('The PDF library did not load. Use Print and choose “Save as PDF”.');
            var pdf = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
            canvases.forEach(function (c, index) {
                if (index) pdf.addPage('a4', 'portrait');
                pdf.addImage(c.toDataURL('image/jpeg', 0.94), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
                // Invisible text over the image makes numbers and English text selectable.
                if (pdfText && c.textRuns && c.textRuns.length) { try { pdfText.addTextLayer(pdf, c.textRuns, PAGE_WIDTH, 210); } catch (error) { /* the image alone is still a complete invoice */ } }
            });
            pdf.setProperties({ title: 'Invoice ' + state.invoiceNumber, creator: 'Write-Urdu Invoice Generator' });
            return pdf;
        });
    }
    function downloadBlob(blob, name) { var url = URL.createObjectURL(blob), anchor = document.createElement('a'); anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove(); window.setTimeout(function () { URL.revokeObjectURL(url); }, 1500); }
    function busy(on, label) { exporting = on; root.classList.toggle('is-exporting', on); if (on && label) setStatus(label); }
    function failed(error) { busy(false); if (error && ['busy', 'demo', 'invalid', 'cancelled'].indexOf(error.message) >= 0) return; setStatus((error && error.message) || 'Something went wrong while creating the file.', 'error'); }
    function downloadPdf() {
        prepareExport().then(function () { busy(true, 'Creating your PDF…'); return buildPdf(); }).then(function (pdf) {
            pdf.save(core.safeFilename(state.invoiceNumber, state.buyer.name, 'pdf'));
            busy(false); setStatus('PDF downloaded.', 'ready');
        }).catch(failed);
    }
    function downloadPng() {
        prepareExport().then(function () { busy(true, 'Creating your image…'); return capturePages(); }).then(function (canvases) {
            var out = canvases[0];
            if (canvases.length > 1) {
                var gap = 40;
                out = document.createElement('canvas'); out.width = canvases[0].width; out.height = canvases.reduce(function (sum, c) { return sum + c.height; }, 0) + gap * (canvases.length - 1);
                var ctx = out.getContext('2d'); ctx.fillStyle = '#e7eaee'; ctx.fillRect(0, 0, out.width, out.height);
                var y = 0; canvases.forEach(function (c) { ctx.drawImage(c, 0, y); y += c.height + gap; });
            }
            return new Promise(function (resolve, reject) { out.toBlob(function (blob) { if (!blob) { reject(new Error('The image could not be created.')); return; } downloadBlob(blob, core.safeFilename(state.invoiceNumber, state.buyer.name, 'png')); resolve(); }, 'image/png'); });
        }).then(function () { busy(false); setStatus('PNG downloaded.', 'ready'); }).catch(failed);
    }
    function printInvoice() {
        prepareExport().then(function () {
            exportHost();
            document.body.classList.add('inv-printing');
            window.print();
        }).catch(failed);
    }
    function whatsappText(withFile) {
        var t = core.calculateInvoiceTotals(state);
        return 'Invoice ' + state.invoiceNumber + (core.hasMeaningfulText(state.seller.name) ? ' from ' + state.seller.name : '') + ' — ' + (t.amountPaidMinor ? 'balance due ' + money(t.balanceDueMinor) : 'total ' + money(t.grandTotalMinor)) + (withFile ? '. The PDF is attached.' : '. I am sending the PDF here.');
    }
    function shareInvoice() {
        var filename = core.safeFilename(state.invoiceNumber, state.buyer.name, 'pdf');
        prepareExport().then(function () { busy(true, 'Preparing your invoice to share…'); return buildPdf(); }).then(function (pdf) {
            var blob = pdf.output('blob'), file = null;
            try { file = new File([blob], filename, { type: 'application/pdf' }); } catch (error) { file = null; }
            if (file && navigator.canShare && navigator.share && navigator.canShare({ files: [file] })) {
                return navigator.share({ files: [file], title: 'Invoice ' + state.invoiceNumber, text: whatsappText(true) }).then(function () { busy(false); setStatus('Invoice shared.', 'ready'); }, function (error) { busy(false); if (!error || error.name !== 'AbortError') setStatus('Sharing was not completed. You can download the PDF instead.', 'error'); });
            }
            downloadBlob(blob, filename);
            busy(false); setStatus('PDF downloaded.', 'ready');
            var dialog = document.querySelector('[data-invoice-share-dialog]');
            if (dialog && typeof dialog.showModal === 'function') {
                dialog.querySelector('[data-share-filename]').textContent = filename;
                dialog.querySelector('[data-share-whatsapp]').href = 'https://wa.me/?text=' + encodeURIComponent(whatsappText(false));
                dialog.showModal();
            }
        }).catch(failed);
    }

    /* ---------- Mobile view and full-screen preview ---------- */
    function setView(view) {
        var tabs = $('.inv-tabs');
        var top = MOBILE_QUERY.matches && tabs ? tabs.getBoundingClientRect().top + window.scrollY - headerOffset() : 0;
        var changed = root.dataset.view !== view;
        root.dataset.view = view;
        $$('[data-view-tab]').forEach(function (tab) { tab.setAttribute('aria-selected', String(tab.getAttribute('data-view-tab') === view)); });
        $$('[data-mobile-action="preview"]').forEach(function (b) { b.hidden = view === 'preview'; });
        $$('[data-mobile-action="edit"],[data-mobile-pdf],[data-mobile-share]').forEach(function (b) { b.hidden = view !== 'preview'; });
        // Switching modes on a phone lands at the top of the chosen panel.
        if (MOBILE_QUERY.matches && changed) window.scrollTo({ top: Math.max(0, Math.round(top)), behavior: 'auto' });
        layoutPreview();
    }
    function headerOffset() { var header = document.querySelector('.wu-site-header'); return header && getComputedStyle(header).position === 'sticky' ? header.offsetHeight : 0; }
    function renderFullscreen() {
        var dialog = document.querySelector('[data-invoice-fullscreen-dialog]'); if (!dialog) return;
        var pages = dialog.querySelector('[data-full-pages]'), wrap = dialog.querySelector('[data-full-scaler]'), area = dialog.querySelector('[data-full-canvas]');
        var result = renderInto(pages, displayDoc());
        var fit = Math.min((area.clientWidth - 32) / PAGE_WIDTH, MOBILE_QUERY.matches ? 9 : (area.clientHeight - 32) / PAGE_HEIGHT);
        var scale = fullZoom === 0 ? fit : fullZoom;
        pages.style.transform = 'scale(' + scale + ')';
        wrap.style.width = Math.round(PAGE_WIDTH * scale) + 'px';
        wrap.style.height = Math.round((result.pageCount * PAGE_HEIGHT + (result.pageCount - 1) * PAGE_GAP) * scale) + 'px';
        dialog.querySelector('[data-full-zoom-label]').textContent = Math.round(scale * 100) + '%';
        dialog.dataset.scale = String(scale);
    }
    function openFullscreen() {
        var dialog = document.querySelector('[data-invoice-fullscreen-dialog]');
        if (!dialog || typeof dialog.showModal !== 'function') return;
        fullZoom = 0; dialog.showModal(); renderFullscreen();
    }

    /* ---------- Urdu typing ---------- */
    function syncInputMode() {
        var control = $('[data-input-mode-control]');
        if (!control || !window.WriteUrduInputMode) return;
        var prefs = readJson(PREFS_KEY) || {};
        // Urdu invoices start with English-letter conversion; bilingual ones
        // start with direct typing so English names stay English. A choice the
        // person makes is remembered per language.
        var chosen = prefs.urduTyping && typeof prefs.urduTyping === 'object' ? prefs.urduTyping[state.languageMode] : null;
        var mode = state.languageMode === 'english' ? 'direct' : (chosen || (state.languageMode === 'urdu' ? 'roman' : 'direct'));
        window.WriteUrduInputMode.set(mode, control);
        enforceFieldDirection();
    }
    // Google's control sets dir="rtl" on every field it manages, even while
    // conversion is off. English invoices and direct typing keep dir="auto"
    // so English text is never shown or typed right-to-left.
    function enforceFieldDirection() {
        var control = $('[data-input-mode-control]');
        var direct = state.languageMode === 'english' || (control && control.dataset.inputMode === 'direct');
        if (!direct) return;
        $$('[data-urdu-input]').forEach(function (field) { if (field.getAttribute('dir') !== 'auto') field.setAttribute('dir', 'auto'); });
    }
    function registerUrduFields() {
        $$('[data-urdu-input]').forEach(function (field) { if (!field.id) field.id = 'invoiceUrduField' + (urduFieldCounter += 1); });
        if (transliterationControl) {
            var ids = $$('[data-urdu-input]').filter(function (field) { return field.dataset.invoiceUrduBound !== 'true'; }).map(function (field) { field.dataset.invoiceUrduBound = 'true'; return field.id; });
            if (ids.length) { try { transliterationControl.makeTransliteratable(ids); } catch (error) { /* direct typing still works */ } }
        }
        if (window.WriteUrduInputMode && window.WriteUrduInputMode.refresh) window.WriteUrduInputMode.refresh();
        enforceFieldDirection();
    }
    function initTransliteration() {
        var google = window.google;
        if (!google || typeof google.load !== 'function' || typeof google.setOnLoadCallback !== 'function') return;
        try {
            google.load('elements', '1', { packages: 'transliteration' });
            google.setOnLoadCallback(function () {
                try {
                    var t = google.elements.transliteration;
                    transliterationControl = new t.TransliterationControl({ sourceLanguage: t.LanguageCode.ENGLISH, destinationLanguage: [t.LanguageCode.URDU], shortcutKey: 'ctrl+g', transliterationEnabled: state.languageMode !== 'english' });
                    window.writeUrduTransliterationControl = transliterationControl;
                    registerUrduFields();
                    document.dispatchEvent(new CustomEvent('write-urdu:transliteration-ready', { detail: { control: transliterationControl } }));
                    syncInputMode();
                } catch (error) { /* optional enhancement */ }
            });
        } catch (error) { /* optional enhancement */ }
    }

    /* ---------- Events ---------- */
    function bind() {
        ['input', 'change', 'keyup'].forEach(function (type) {
            root.addEventListener(type, function (event) {
                var target = event.target;
                if (!target || !target.closest) return;
                var field = target.closest('[data-field]'); if (field && field.type !== 'file') { onFieldChange(field); return; }
                var item = target.closest('[data-item-field]'); if (item) { onItemChange(item); return; }
                if (type === 'change') {
                    var section = target.closest('[data-section]');
                    if (section) { leaveDemo(); var key = section.getAttribute('data-section'); state.sections[key].enabled = section.checked; if (key === 'qr') state.qr.enabled = section.checked; renderFieldValues(); requestRender(); scheduleSave(); }
                    if (target.matches('[data-invoice-logo-input]')) { readLogo(target.files && target.files[0]); target.value = ''; }
                    if (target.matches('[data-history-restore]')) { restoreBackup(target.files && target.files[0]); target.value = ''; }
                    if (target.matches('[data-invoice-remember-business]')) {
                        if (target.checked) { if (core.hasMeaningfulText(state.seller.name)) { rememberBusiness(); setStatus('Business details will be filled in next time on this device.', 'ready'); } else { target.checked = false; setStatus('Add your business name first.', 'error'); focusField('seller.name'); } }
                        else { removeKey(BUSINESS_KEY); setStatus('Saved business details removed from this device.', 'ready'); }
                    }
                }
            });
        });
        itemsHost.addEventListener('keydown', function (event) {
            if (event.key !== 'Enter' || !event.target.matches('[data-item-field]')) return;
            event.preventDefault();
            var row = event.target.closest('[data-item-id]');
            if (row === itemsHost.lastElementChild) addItem(true);
            else { var next = row.nextElementSibling && row.nextElementSibling.querySelector('[data-item-field="description"]'); if (next) next.focus(); }
        });
        root.addEventListener('click', function (event) {
            var target = event.target.closest('button, a'); if (!target || !root.contains(target)) return;
            if (target.matches('[data-lang-option]')) setLanguage(target.getAttribute('data-lang-option'));
            else if (target.matches('[data-template-option]')) setTemplate(target.getAttribute('data-template-option'));
            else if (target.matches('[data-accent-option]')) { state.design.accent = target.getAttribute('data-accent-option'); renderFieldValues(); requestRender(); scheduleSave(); }
            else if (target.matches('[data-font-option]')) { state.design.urduFont = target.getAttribute('data-font-option'); renderFieldValues(); requestRender(); scheduleSave(); }
            else if (target.matches('[data-invoice-reset-style]')) { state.templateId = 'modern'; state.design = { accent: core.ACCENTS[0], urduFont: 'nastaliq' }; renderFieldValues(); requestRender(); scheduleSave(); setStatus('Design reset to Modern Professional.', 'ready'); }
            else if (target.matches('[data-invoice-logo-remove]')) { state.seller.logoDataUrl = ''; renderFieldValues(); requestRender(); scheduleSave(); }
            else if (target.matches('[data-use-saved-business]')) { var profile = businessProfile(); if (profile) { leaveDemo(); state.seller = Object.assign(state.seller, profile.seller); state.paymentDetails = Object.assign(state.paymentDetails, profile.paymentDetails || {}); renderAll(); scheduleSave(); setStatus('Your saved business details were added.', 'ready'); } }
            else if (target.matches('[data-invoice-add-item]')) addItem(true);
            else if (target.matches('[data-remove-item]')) removeItem(Number(target.closest('[data-item-id]').dataset.itemIndex));
            else if (target.matches('[data-move-item]')) moveItem(Number(target.closest('[data-item-id]').dataset.itemIndex), Number(target.getAttribute('data-move-item')));
            else if (target.matches('[data-due-days]')) { leaveDemo(); state.dueDate = addDays(state.issueDate || todayIso(), Number(target.getAttribute('data-due-days'))); renderFieldValues(); requestRender(); scheduleSave(); }
            else if (target.matches('[data-invoice-sample]')) loadSample();
            else if (target.matches('[data-invoice-start-own]')) startOwn();
            else if (target.matches('[data-invoice-new]')) newInvoice();
            else if (target.matches('[data-invoice-history]')) openHistory();
            else if (target.matches('[data-history-backup]')) downloadBackup();
            else if (target.matches('[data-history-csv]')) downloadCsv();
            else if (target.matches('[data-invoice-print]')) printInvoice();
            else if (target.matches('[data-invoice-pdf]')) downloadPdf();
            else if (target.matches('[data-invoice-png]')) downloadPng();
            else if (target.matches('[data-invoice-share]')) shareInvoice();
            else if (target.matches('[data-focus-field]')) focusField(target.getAttribute('data-focus-field'));
            else if (target.matches('[data-view-tab]')) setView(target.getAttribute('data-view-tab'));
            else if (target.matches('[data-mobile-action]')) setView(target.getAttribute('data-mobile-action'));
            else if (target.matches('[data-invoice-zoom]')) { zoomMode = target.getAttribute('data-invoice-zoom'); $$('[data-invoice-zoom]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === target)); }); layoutPreview(); }
            else if (target.matches('[data-invoice-fullscreen]')) openFullscreen();
            else if (target.matches('[data-full-zoom]')) { var dialog = target.closest('dialog'), step = Number(target.getAttribute('data-full-zoom')), current = Number(dialog.dataset.scale) || 1; fullZoom = step === 0 ? 0 : Math.max(0.3, Math.min(2.5, Math.round((current + step * 0.25) * 4) / 4)); renderFullscreen(); }
            else if (target.matches('[data-full-close]')) target.closest('dialog').close();
            else if (target.matches('.input-mode-option') && state.languageMode !== 'english') { var prefs = readJson(PREFS_KEY) || {}; if (!prefs.urduTyping || typeof prefs.urduTyping !== 'object') prefs.urduTyping = {}; prefs.urduTyping[state.languageMode] = target.getAttribute('data-input-mode-option'); writeJson(PREFS_KEY, prefs); }
        });
        canvas.addEventListener('click', function (event) { if (MOBILE_QUERY.matches && event.target.closest('.inv-page')) openFullscreen(); });
        var historyDialog = root.querySelector('[data-invoice-history-dialog]'); if (historyDialog) historyDialog.addEventListener('click', historyAction);
        window.addEventListener('resize', function () { layoutPreview(); scheduleThumbnails(); });
        if (MOBILE_QUERY.addEventListener) MOBILE_QUERY.addEventListener('change', function () { setView(root.dataset.view || 'edit'); });
        window.addEventListener('beforeprint', function () { if (!document.body.classList.contains('inv-printing') && !showingDemo()) { exportHost(); document.body.classList.add('inv-printing'); } });
        window.addEventListener('afterprint', function () { document.body.classList.remove('inv-printing'); });
        if (window.MutationObserver) new MutationObserver(enforceFieldDirection).observe(root, { subtree: true, attributes: true, attributeFilter: ['dir', 'data-input-mode'] });
        if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', function () { requestRender(); });
        var header = document.querySelector('.wu-site-header');
        var setOffset = function () { root.style.setProperty('--inv-header-h', headerOffset() + 'px'); };
        setOffset(); window.addEventListener('resize', setOffset);
        window.setTimeout(setOffset, 1200);
        if (header && window.ResizeObserver) new ResizeObserver(setOffset).observe(header);
    }

    /* ---------- Start ---------- */
    function init() {
        var prefs = readJson(PREFS_KEY);
        var raw = readJson(DRAFT_KEY);
        var draft = raw ? core.normalizeInvoiceDocument(raw) : null;
        if (draft && core.isMeaningfulDraft(draft)) {
            state = draft; startedOwn = true; lastSavedAt = raw.updatedAt || null;
            renderAll();
            showBanner('Welcome back — your invoice ' + state.invoiceNumber + (core.hasMeaningfulText(state.buyer.name) ? ' for ' + state.buyer.name : '') + ' was restored.', [{ label: 'Start a new invoice', primary: true, run: newInvoice }]);
        } else {
            if (prefs) { state.templateId = prefs.templateId || state.templateId; state.languageMode = prefs.languageMode || state.languageMode; state.design = prefs.design || state.design; state.currency = prefs.currency || state.currency; state = core.normalizeInvoiceDocument(state); }
            var profile = businessProfile();
            if (profile) {
                state.seller = Object.assign(state.seller, profile.seller);
                state.paymentDetails = Object.assign(state.paymentDetails, profile.paymentDetails || {});
                var numbers = loadHistory().map(function (entry) { return entry.invoiceNumber; }).sort();
                if (numbers.length) { var next = core.incrementInvoiceNumber(numbers[numbers.length - 1]); while (numbers.indexOf(next) >= 0) next = core.incrementInvoiceNumber(next); state.invoiceNumber = next; }
                startedOwn = true;
                renderAll();
                showBanner('Your saved business details are filled in. Add the customer and items.', []);
            } else renderAll();
        }
        syncInputMode();
        setView('edit');
    }

    bind();
    init();
    initTransliteration();
}());
