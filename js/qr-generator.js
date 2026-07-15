(function (window, document) {
    'use strict';
    var root = document.querySelector('[data-qr-generator]');
    if (!root || !window.WriteUrduQrCore || !window.QRCode) return;
    var core = window.WriteUrduQrCore;
    var canvas = document.getElementById('qrCanvas');
    var state;
    var logoImage = null;
    var logoObjectUrl = null;
    var renderToken = 0;
    var saveTimer = null;
    var incomingKey = 'writeUrdu.qrGenerator.incoming';
    var storageKey = 'writeUrdu.qrGenerator.project';
    var dbName = 'writeUrduQrGenerator';

    function openDb() {
        return new Promise(function (resolve, reject) {
            if (!window.indexedDB) return reject(new Error('indexeddb-unavailable'));
            var request = window.indexedDB.open(dbName, 1);
            request.onupgradeneeded = function () { var db = request.result; if (!db.objectStoreNames.contains('projects')) db.createObjectStore('projects', { keyPath: 'id' }); if (!db.objectStoreNames.contains('assets')) db.createObjectStore('assets', { keyPath: 'id' }); };
            request.onsuccess = function () { resolve(request.result); };
            request.onerror = function () { reject(request.error || new Error('indexeddb-error')); };
        });
    }
    function dataUrlToBlob(dataUrl) { var parts = String(dataUrl || '').split(','); var binary = atob(parts[1] || ''); var bytes = new Uint8Array(binary.length); for (var index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index); return new Blob([bytes], { type: (parts[0].match(/data:([^;]+)/) || [])[1] || 'image/png' }); }
    async function saveIndexedDb() {
        var db = await openDb();
        var project = JSON.parse(JSON.stringify(state));
        project.logo.dataUrl = null;
        await new Promise(function (resolve, reject) { var transaction = db.transaction(['projects', 'assets'], 'readwrite'); transaction.objectStore('projects').put(project); if (state.logo.enabled && state.logo.dataUrl) transaction.objectStore('assets').put({ id: 'current-logo', projectId: state.id, blob: dataUrlToBlob(state.logo.dataUrl) }); else transaction.objectStore('assets').delete('current-logo'); transaction.oncomplete = resolve; transaction.onerror = function () { reject(transaction.error); }; });
        db.close();
    }
    async function restoreIndexedLogo(project) {
        if (!project || !project.logo || !project.logo.enabled || project.logo.dataUrl || !window.indexedDB) return;
        try {
            var db = await openDb();
            var record = await new Promise(function (resolve, reject) { var request = db.transaction('assets').objectStore('assets').get('current-logo'); request.onsuccess = function () { resolve(request.result); }; request.onerror = function () { reject(request.error); }; });
            db.close();
            if (!record || !record.blob) return;
            var reader = new FileReader(); reader.onload = async function () { state.logo.dataUrl = reader.result; state.logo.enabled = true; logoImage = await loadLogoImage(reader.result); syncLogoControls(); requestRender(); }; reader.readAsDataURL(record.blob);
        } catch (error) { /* localStorage state remains usable without the logo */ }
    }

    var labels = {
        en: {
            url: 'Website URL', text: 'Text / Urdu Text', whatsapp: 'WhatsApp', wifi: 'Wi-Fi', email: 'Email', phone: 'Phone call', sms: 'SMS', vcard: 'Contact card', location: 'Location',
            urlLabel: 'Website URL', textLabel: 'Text to encode', phone: 'Phone number', message: 'Message (optional)', email: 'Email address', subject: 'Subject (optional)',
            ssid: 'Network name (SSID)', security: 'Security', password: 'Password', hidden: 'Hidden network', fullName: 'Full name', organization: 'Organization (optional)', title: 'Job title (optional)', mobile: 'Mobile phone (optional)', workPhone: 'Work phone (optional)', website: 'Website (optional)', street: 'Street (optional)', city: 'City (optional)', region: 'State or region (optional)', postalCode: 'Postal code (optional)', country: 'Country (optional)', note: 'Note (optional)', latitude: 'Latitude', longitude: 'Longitude', addHttps: 'Add https:// when missing', showPassword: 'Show password', hidePassword: 'Hide password', open: 'None (open network)', wpa: 'WPA / WPA2 / WPA3', wep: 'WEP'
        },
        ur: {
            url: 'ویب سائٹ کا پتہ', text: 'متن / اردو متن', whatsapp: 'واٹس ایپ', wifi: 'وائی فائی', email: 'ای میل', phone: 'فون کال', sms: 'ایس ایم ایس', vcard: 'رابطہ کارڈ', location: 'مقام',
            urlLabel: 'ویب سائٹ کا پتہ', textLabel: 'شامل کرنے کے لیے متن', phone: 'فون نمبر', message: 'پیغام (اختیاری)', email: 'ای میل پتہ', subject: 'موضوع (اختیاری)',
            ssid: 'نیٹ ورک کا نام (SSID)', security: 'سکیورٹی', password: 'پاس ورڈ', hidden: 'پوشیدہ نیٹ ورک', fullName: 'پورا نام', organization: 'ادارہ (اختیاری)', title: 'عہدہ (اختیاری)', mobile: 'موبائل فون (اختیاری)', workPhone: 'کام کا فون (اختیاری)', website: 'ویب سائٹ (اختیاری)', street: 'گلی (اختیاری)', city: 'شہر (اختیاری)', region: 'صوبہ یا علاقہ (اختیاری)', postalCode: 'ڈاک کوڈ (اختیاری)', country: 'ملک (اختیاری)', note: 'نوٹ (اختیاری)', latitude: 'عرض بلد', longitude: 'طول بلد', addHttps: 'ضرورت ہو تو https:// شامل کریں', showPassword: 'پاس ورڈ دکھائیں', hidePassword: 'پاس ورڈ چھپائیں', open: 'کوئی سکیورٹی نہیں (کھلا نیٹ ورک)', wpa: 'WPA / WPA2 / WPA3', wep: 'WEP'
        }
    };
    var staticCopy = {
        en: { reset: 'Reset', back: 'Back to Write Urdu', encodeQuestion: 'What would you like to encode?', design: 'Design', qrColour: 'QR colour', background: 'Background', designHelp: 'A dark QR colour, light background and four-module margin are safest for scanning.', centreLogo: 'Centre logo', optional: 'optional', chooseLogo: 'Choose a local PNG, JPG or WebP', removeLogo: 'Remove logo', logoHelp: 'The logo is processed on this device. Adding one automatically uses high error correction.', downloadPng: 'Download PNG', downloadSvg: 'Download SVG', copyImage: 'Copy image', share: 'Share' },
        ur: { reset: 'ری سیٹ', back: 'رائٹ اردو پر واپس جائیں', encodeQuestion: 'آپ کیا شامل کرنا چاہتے ہیں؟', design: 'ڈیزائن', qrColour: 'QR رنگ', background: 'پس منظر', designHelp: 'گہرا QR رنگ، ہلکا پس منظر اور چار ماڈیول کا حاشیہ اسکین کے لیے زیادہ قابلِ اعتماد ہے۔', centreLogo: 'مرکزی لوگو', optional: 'اختیاری', chooseLogo: 'مقامی PNG، JPG یا WebP منتخب کریں', removeLogo: 'لوگو ہٹائیں', logoHelp: 'لوگو اسی آلے پر پروسیس ہوتا ہے۔ لوگو شامل کرنے پر زیادہ خرابی اصلاح خود منتخب ہوتی ہے۔', downloadPng: 'PNG ڈاؤن لوڈ کریں', downloadSvg: 'SVG ڈاؤن لوڈ کریں', copyImage: 'تصویر کاپی کریں', share: 'شیئر کریں' }
    };

    function locale() { return window.WriteUrduLocale && window.WriteUrduLocale.get() === 'ur' ? 'ur' : 'en'; }
    function t(key) { return labels[locale()][key] || labels.en[key] || key; }
    function esc(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]; }); }
    function field(name, label, value, type, extra) {
        type = type || 'text';
        extra = extra || '';
        return '<label class="qr-label">' + esc(label) + '<input class="qr-input" type="' + type + '" data-qr-field="' + name + '" value="' + esc(value || '') + '" ' + extra + '></label>';
    }
    function textarea(name, label, value) {
        return '<label class="qr-label">' + esc(label) + '<textarea class="qr-textarea" data-qr-field="' + name + '" dir="auto">' + esc(value || '') + '</textarea></label>';
    }
    function checkbox(name, label, checked) {
        return '<label class="qr-check"><input type="checkbox" data-qr-field="' + name + '"' + (checked ? ' checked' : '') + '><span>' + esc(label) + '</span></label>';
    }
    function typeFields(type) {
        var fields = state.content.fields || {};
        if (type === 'url') return '<h2>' + t('urlLabel') + '</h2>' + field('url', t('urlLabel'), fields.url || '') + checkbox('addHttps', t('addHttps'), fields.addHttps !== false);
        if (type === 'text') return '<h2>' + t('textLabel') + '</h2>' + textarea('text', t('textLabel'), fields.text || '') + '<div class="qr-count"><span data-qr-char-count>0 characters</span><span data-qr-byte-count>0 bytes</span></div>';
        if (type === 'whatsapp') return '<h2>' + t('whatsapp') + '</h2>' + field('phone', t('phone'), fields.phone || '', 'tel') + textarea('message', t('message'), fields.message || '');
        if (type === 'wifi') return '<h2>' + t('wifi') + '</h2>' + field('ssid', t('ssid'), fields.ssid || '') + '<label class="qr-label">' + t('security') + '<select class="qr-control" data-qr-field="security"><option value="WPA">' + t('wpa') + '</option><option value="WEP"' + (fields.security === 'WEP' ? ' selected' : '') + '>WEP</option><option value="none"' + (fields.security === 'none' ? ' selected' : '') + '>' + t('open') + '</option></select></label>' + field('password', t('password'), fields.password || '', 'password', 'data-qr-password') + '<button type="button" class="qr-link-button" data-qr-toggle-password aria-label="' + t('showPassword') + '">' + t('showPassword') + '</button>' + checkbox('hidden', t('hidden'), fields.hidden);
        if (type === 'email') return '<h2>' + t('email') + '</h2>' + field('email', t('email'), fields.email || '', 'email') + field('subject', t('subject'), fields.subject || '') + textarea('message', t('message'), fields.message || '');
        if (type === 'phone') return '<h2>' + t('phone') + '</h2>' + field('phone', t('phone'), fields.phone || '', 'tel');
        if (type === 'sms') return '<h2>' + t('sms') + '</h2>' + field('phone', t('phone'), fields.phone || '', 'tel') + textarea('message', t('message'), fields.message || '');
        if (type === 'vcard') return '<h2>' + t('vcard') + '</h2>' + field('fullName', t('fullName'), fields.fullName || '') + '<details class="qr-advanced"><summary>Additional contact details</summary>' + field('organization', t('organization'), fields.organization || '') + field('title', t('title'), fields.title || '') + field('mobile', t('mobile'), fields.mobile || '', 'tel') + field('workPhone', t('workPhone'), fields.workPhone || '', 'tel') + field('email', t('email'), fields.email || '', 'email') + field('website', t('website'), fields.website || '') + field('street', t('street'), fields.street || '') + field('city', t('city'), fields.city || '') + field('region', t('region'), fields.region || '') + field('postalCode', t('postalCode'), fields.postalCode || '') + field('country', t('country'), fields.country || '') + textarea('note', t('note'), fields.note || '') + '</details>';
        return '<h2>' + t('location') + '</h2>' + '<div class="qr-control-grid">' + field('latitude', t('latitude'), fields.latitude || '', 'number', 'step="any"') + field('longitude', t('longitude'), fields.longitude || '', 'number', 'step="any"') + '</div>';
    }

    function populateTypeSelect() {
        var select = root.querySelector('[data-qr-type]');
        select.innerHTML = core.CONTENT_TYPES.map(function (item) { return '<option value="' + item.id + '">' + esc(t(item.id)) + '</option>'; }).join('');
        select.value = state.content.type;
    }
    function renderFields() {
        root.querySelector('[data-qr-fields]').innerHTML = typeFields(state.content.type);
        root.querySelectorAll('[data-qr-field]').forEach(function (element) {
            element.addEventListener('input', onFieldChange);
            element.addEventListener('change', onFieldChange);
        });
        var toggle = root.querySelector('[data-qr-toggle-password]');
        if (toggle) toggle.addEventListener('click', function () {
            var input = root.querySelector('[data-qr-password]');
            var showing = input.type === 'text';
            input.type = showing ? 'password' : 'text';
            toggle.textContent = showing ? t('showPassword') : t('hidePassword');
            toggle.setAttribute('aria-label', showing ? t('showPassword') : t('hidePassword'));
        });
        updateTextCount();
    }
    function updateTextCount() {
        var text = state.content.type === 'text' ? String(state.content.fields.text || '') : '';
        var chars = root.querySelector('[data-qr-char-count]');
        var bytes = root.querySelector('[data-qr-byte-count]');
        if (chars) chars.textContent = text.length + ' characters';
        if (bytes) bytes.textContent = core.getUtf8ByteLength(text) + ' bytes';
    }
    function collectFields() {
        var fields = {};
        root.querySelectorAll('[data-qr-field]').forEach(function (element) { fields[element.getAttribute('data-qr-field')] = element.type === 'checkbox' ? element.checked : element.value; });
        state.content.fields = fields;
    }
    function onFieldChange() { collectFields(); updateTextCount(); requestRender(); scheduleSave(); }
    function setState(next) { state = core.normalizeQrProject(next); populateTypeSelect(); renderFields(); syncDesignControls(); syncLogoControls(); requestRender(); }
    function syncDesignControls() {
        root.querySelector('[data-qr-design="foregroundColor"]').value = state.design.foregroundColor;
        root.querySelector('[data-qr-design="backgroundColor"]').value = state.design.backgroundColor;
        root.querySelector('[data-qr-design="margin"]').value = String(state.design.margin);
        root.querySelector('[data-qr-design="errorCorrectionLevel"]').value = state.design.errorCorrectionLevel;
        root.querySelector('[data-qr-export="pngSize"]').value = String(state.export.pngSize);
    }
    function syncLogoControls() {
        var options = root.querySelector('[data-qr-logo-options]');
        options.hidden = !state.logo.enabled;
        root.querySelector('[data-qr-logo-size]').value = String(Math.round(state.logo.sizeRatio * 100));
        root.querySelector('[data-qr-logo-size-value]').value = Math.round(state.logo.sizeRatio * 100) + '%';
        root.querySelector('[data-qr-logo-shape]').value = state.logo.plateShape;
    }
    function status(message, isError) { var node = root.querySelector('[data-qr-status]'); node.textContent = message || ''; node.classList.toggle('error', Boolean(isError)); }
    function scheduleSave() { window.clearTimeout(saveTimer); saveTimer = window.setTimeout(saveProject, 650); }
    function saveProject() { try { var copy = JSON.parse(JSON.stringify(state)); if (copy.logo) copy.logo.dataUrl = null; window.localStorage.setItem(storageKey, JSON.stringify(copy)); saveIndexedDb().catch(function () { /* localStorage fallback is already complete */ }); status('Saved on this device'); } catch (error) { status('Your current design is still available, but it could not be saved locally.'); } }
    function readIncoming() { try { var value = window.sessionStorage.getItem(incomingKey); if (!value) return null; window.sessionStorage.removeItem(incomingKey); return JSON.parse(value); } catch (error) { return null; } }
    function readSaved() { try { var value = window.localStorage.getItem(storageKey); return value ? JSON.parse(value) : null; } catch (error) { return null; } }
    function setFieldError(name, message) {
        if (!message) return;
        var input = root.querySelector('[data-qr-field="' + name + '"]');
        if (!input) return;
        var error = document.createElement('p'); error.className = 'qr-field-error'; error.id = 'qr-error-' + name; error.textContent = message; input.parentElement.appendChild(error); input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', error.id);
    }
    function renderHealth(validation) {
        var health = root.querySelector('[data-qr-health]');
        var messages = validation.warnings.slice();
        Object.keys(validation.payload.errors || {}).forEach(function (key) { messages.unshift(validation.payload.errors[key]); });
        if (validation.payload.utf8Bytes > 700) messages.push('This content is very dense; a larger printed QR code may scan more reliably.');
        else if (validation.payload.utf8Bytes > 300) messages.push('Long content creates a denser QR code and may be harder to scan at small sizes.');
        health.className = 'qr-health ' + validation.contrast.level;
        health.textContent = validation.valid && !messages.length ? 'Good readability · ' + validation.payload.utf8Bytes + ' UTF-8 bytes' : messages.join(' ');
    }
    function qrOptions(size) { return { width: size, margin: state.design.margin, errorCorrectionLevel: state.logo.enabled ? 'H' : state.design.errorCorrectionLevel, color: { dark: state.design.foregroundColor, light: state.design.backgroundColor } }; }
    function loadLogoImage(dataUrl) {
        return new Promise(function (resolve, reject) { if (!dataUrl) return resolve(null); var image = new Image(); image.onload = function () { resolve(image); }; image.onerror = reject; image.src = dataUrl; });
    }
    function isSafeLogoDataUrl(dataUrl) { return /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(String(dataUrl || '')); }
    function drawLogo(context, size) {
        if (!logoImage || !state.logo.enabled) return;
        var placement = core.calculateLogoPlacement(size, { width: logoImage.naturalWidth || logoImage.width, height: logoImage.naturalHeight || logoImage.height }, state.logo);
        context.save(); context.fillStyle = state.logo.plateColor; context.beginPath();
        if (state.logo.plateShape === 'circle') { context.arc(size / 2, size / 2, placement.boxSize / 2, 0, Math.PI * 2); } else { var radius = placement.boxSize * .14; context.roundRect ? context.roundRect(placement.x, placement.y, placement.boxSize, placement.boxSize, radius) : context.rect(placement.x, placement.y, placement.boxSize, placement.boxSize); }
        context.fill(); context.drawImage(logoImage, placement.imageX, placement.imageY, placement.imageWidth, placement.imageHeight); context.restore();
    }
    async function renderPreview() {
        var token = ++renderToken;
        collectFields();
        var validation = core.validateQrProject(state);
        renderHealth(validation);
        root.querySelector('[data-qr-payload]').textContent = validation.payload.payload || '';
        root.querySelectorAll('.qr-field-error').forEach(function (node) { node.remove(); });
        root.querySelectorAll('[aria-invalid="true"]').forEach(function (node) { node.removeAttribute('aria-invalid'); node.removeAttribute('aria-describedby'); });
        Object.keys(validation.payload.errors || {}).forEach(function (name) { setFieldError(name, validation.payload.errors[name]); });
        var buttons = root.querySelectorAll('[data-qr-download-png],[data-qr-download-svg],[data-qr-copy],[data-qr-share]');
        buttons.forEach(function (button) { button.disabled = !validation.valid; });
        if (!validation.valid) { root.querySelector('[data-qr-preview-empty]').hidden = false; canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height); return; }
        root.querySelector('[data-qr-preview-empty]').hidden = true;
        try {
            if (state.logo.enabled && !logoImage) logoImage = await loadLogoImage(state.logo.dataUrl);
            if (token !== renderToken) return;
            await QRCode.toCanvas(canvas, validation.payload.payload, qrOptions(512));
            if (token !== renderToken) return;
            drawLogo(canvas.getContext('2d'), 512);
            status('Preview updated');
        } catch (error) {
            status(error && /code length|too long|overflow/i.test(error.message || '') ? 'This content is too long for the selected QR settings. Shorten it or remove the logo.' : 'The QR code could not be generated. Check the content and try again.', true);
            buttons.forEach(function (button) { button.disabled = true; });
        }
    }
    function requestRender() { window.clearTimeout(requestRender.timer); requestRender.timer = window.setTimeout(renderPreview, 120); }
    function downloadBlob(blob, filename) { var url = URL.createObjectURL(blob); var anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove(); window.setTimeout(function () { URL.revokeObjectURL(url); }, 500); }
    async function finalCanvas() { collectFields(); var validation = core.validateQrProject(state); if (!validation.valid) throw new Error('invalid'); if (state.logo.enabled && !logoImage) logoImage = await loadLogoImage(state.logo.dataUrl); var output = document.createElement('canvas'); output.width = state.export.pngSize; output.height = state.export.pngSize; await QRCode.toCanvas(output, validation.payload.payload, qrOptions(state.export.pngSize)); drawLogo(output.getContext('2d'), state.export.pngSize); return { canvas: output, validation: validation }; }
    function baseName() { return core.safeFilename(state.name || 'write-urdu-qr-code', 'write-urdu-qr-code') + '-' + state.content.type; }
    async function downloadPng() { try { status('Preparing PNG…'); var result = await finalCanvas(); result.canvas.toBlob(function (blob) { if (!blob) return status('PNG generation failed.', true); downloadBlob(blob, baseName() + '.png'); status('PNG downloaded'); }); } catch (error) { status('PNG generation failed. Check your content and try again.', true); } }
    async function svgString() { collectFields(); var validation = core.validateQrProject(state); if (!validation.valid) throw new Error('invalid'); var svg = await QRCode.toString(validation.payload.payload, Object.assign({ type: 'svg' }, qrOptions(state.export.pngSize))); if (state.logo.enabled && state.logo.dataUrl) { if (!isSafeLogoDataUrl(state.logo.dataUrl)) throw new Error('unsafe-logo'); var placement = core.calculateLogoPlacement(state.export.pngSize, { width: logoImage.naturalWidth || logoImage.width, height: logoImage.naturalHeight || logoImage.height }, state.logo); var shape = state.logo.plateShape === 'circle' ? '<circle cx="' + state.export.pngSize / 2 + '" cy="' + state.export.pngSize / 2 + '" r="' + placement.boxSize / 2 + '" fill="' + state.logo.plateColor + '"/>' : '<rect x="' + placement.x + '" y="' + placement.y + '" width="' + placement.boxSize + '" height="' + placement.boxSize + '" rx="' + placement.boxSize * .14 + '" fill="' + state.logo.plateColor + '"/>'; var image = '<image href="' + state.logo.dataUrl + '" x="' + placement.imageX + '" y="' + placement.imageY + '" width="' + placement.imageWidth + '" height="' + placement.imageHeight + '" preserveAspectRatio="xMidYMid meet"/>'; svg = svg.replace('</svg>', shape + image + '</svg>'); } if (/<script|foreignObject| on[a-z]+=|(?:href|xlink:href)=["']https?:/i.test(svg)) throw new Error('unsafe-svg'); return svg; }
    async function downloadSvg() { try { status('Preparing SVG…'); var svg = await svgString(); downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), baseName() + '.svg'); status('SVG downloaded'); } catch (error) { status('SVG generation failed. Check your content and try again.', true); } }
    async function copyImage() { try { var result = await finalCanvas(); var blob = await new Promise(function (resolve) { result.canvas.toBlob(resolve, 'image/png'); }); if (!navigator.clipboard || !window.ClipboardItem) throw new Error('unsupported'); await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); status('QR image copied'); } catch (error) { status('Copying an image is not supported here. Download the PNG instead.', true); } }
    async function shareImage() { try { var result = await finalCanvas(); var blob = await new Promise(function (resolve) { result.canvas.toBlob(resolve, 'image/png'); }); var file = new File([blob], baseName() + '.png', { type: 'image/png' }); if (!navigator.share || !navigator.canShare || !navigator.canShare({ files: [file] })) throw new Error('unsupported'); await navigator.share({ files: [file], title: 'QR Code' }); status('QR image shared'); } catch (error) { if (error && error.name === 'AbortError') return; status('Sharing is unavailable. Download the PNG and share it manually.', true); } }
    function onTypeChange(event) { collectFields(); state.content.type = event.target.value; state.content.fields = {}; renderFields(); requestRender(); scheduleSave(); }
    function onDesignChange(event) { var key = event.target.getAttribute('data-qr-design'); state.design[key] = key === 'margin' ? Number(event.target.value) : event.target.value; if (state.logo.enabled && key === 'errorCorrectionLevel') state.design.errorCorrectionLevel = 'H'; requestRender(); scheduleSave(); }
    function onExportChange(event) { state.export.pngSize = Number(event.target.value); scheduleSave(); }
    function fileToDataUrl(file) { return new Promise(function (resolve, reject) { var reader = new FileReader(); reader.onload = function () { resolve(reader.result); }; reader.onerror = reject; reader.readAsDataURL(file); }); }
    async function onLogo(event) { var file = event.target.files && event.target.files[0]; if (!file) return; if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 5 * 1024 * 1024) { status('Choose a PNG, JPG or WebP logo smaller than 5 MB.', true); event.target.value = ''; return; } try { if (logoObjectUrl) URL.revokeObjectURL(logoObjectUrl); logoObjectUrl = URL.createObjectURL(file); var dataUrl = await fileToDataUrl(file); logoImage = await loadLogoImage(dataUrl); state.logo.enabled = true; state.logo.dataUrl = dataUrl; state.logo.assetId = 'current-logo'; state.design.errorCorrectionLevel = 'H'; syncDesignControls(); syncLogoControls(); requestRender(); scheduleSave(); } catch (error) { status('This logo could not be opened. Choose a PNG, JPG or WebP file.', true); } }
    function removeLogo() { state.logo.enabled = false; state.logo.dataUrl = null; state.logo.assetId = null; logoImage = null; if (logoObjectUrl) URL.revokeObjectURL(logoObjectUrl); logoObjectUrl = null; syncLogoControls(); requestRender(); scheduleSave(); }
    function applyLocale() {
        var privacy = root.querySelector('[data-qr-privacy]');
        if (privacy) privacy.textContent = locale() === 'ur' ? 'آپ کا متن اور لوگو اسی براؤزر میں رہتے ہیں اور کبھی اپ لوڈ نہیں کیے جاتے۔' : 'Your content and logo stay in this browser and are never uploaded.';
        var copy = staticCopy[locale()];
        root.querySelectorAll('[data-qr-copy]').forEach(function (element) { var key = element.getAttribute('data-qr-copy'); if (copy[key]) { var input = element.querySelector('input,select'); if (input) { Array.prototype.slice.call(element.childNodes).forEach(function (node) { if (node.nodeType === 3 && node.nodeValue.trim()) node.remove(); }); element.insertBefore(document.createTextNode(copy[key]), input); } else element.textContent = copy[key]; } });
        populateTypeSelect(); renderFields(); syncLogoControls();
    }
    function bind() {
        root.querySelector('[data-qr-type]').addEventListener('change', onTypeChange);
        root.querySelectorAll('[data-qr-design]').forEach(function (element) { element.addEventListener('input', onDesignChange); element.addEventListener('change', onDesignChange); });
        root.querySelector('[data-qr-export]').addEventListener('change', onExportChange);
        root.querySelector('[data-qr-logo]').addEventListener('change', onLogo);
        root.querySelector('[data-qr-remove-logo]').addEventListener('click', removeLogo);
        root.querySelector('[data-qr-logo-size]').addEventListener('input', function (event) { state.logo.sizeRatio = Number(event.target.value) / 100; syncLogoControls(); requestRender(); scheduleSave(); });
        root.querySelector('[data-qr-logo-shape]').addEventListener('change', function (event) { state.logo.plateShape = event.target.value; requestRender(); scheduleSave(); });
        root.querySelector('[data-qr-reset]').addEventListener('click', function () { if (window.confirm('Reset this QR code design?')) setState(core.createDefaultQrProject()); });
        root.querySelector('[data-qr-download-png]').addEventListener('click', downloadPng); root.querySelector('[data-qr-download-svg]').addEventListener('click', downloadSvg); root.querySelector('[data-qr-copy-image]').addEventListener('click', copyImage); root.querySelector('[data-qr-share]').addEventListener('click', shareImage);
        document.addEventListener('write-urdu:locale-change', applyLocale);
        window.addEventListener('beforeunload', function () { if (logoObjectUrl) URL.revokeObjectURL(logoObjectUrl); });
    }
    var incoming = readIncoming();
    var saved;
    if (incoming) {
        saved = core.createDefaultQrProject();
        saved.content.type = 'text';
        saved.content.fields = { text: String(incoming.text || '') };
    } else {
        saved = core.normalizeQrProject(readSaved() || core.createDefaultQrProject());
    }
    setState(saved); bind(); applyLocale(); restoreIndexedLogo(saved);
}(window, document));
