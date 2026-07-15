(function () {
    'use strict';

    var core = window.WriteUrduCardStudio;
    if (!core) return;
    var root = document.querySelector('[data-card-studio]');
    if (!root) return;

    var DB_NAME = 'writeUrduCardStudio';
    var DB_VERSION = 1;
    var projectKey = 'writeUrdu.cardStudio.project';
    var incomingKey = 'writeUrdu.cardStudio.incoming';
    var state = core.createDefaultCardProject('');
    var canvas = document.getElementById('cardCanvas');
    var ctx = canvas.getContext('2d');
    var currentAsset = null;
    var currentObjectUrl = null;
    var renderToken = 0;
    var renderQueued = false;
    var saveTimer = 0;
    var dbPromise = null;
    var locale = 'en';
    var userChanged = false;

    var copy = {
        en: { title:'Urdu Card Studio', subtitle:'Turn your Urdu words into a polished shareable image.', back:'Back to editor', reset:'Reset', share:'Share', download:'Download PNG', sizeHeading:'Size', presetLabel:'Output preset', templateHeading:'Design', textHeading:'Text', textLabel:'Card text', characters:'{n} characters', attributionLabel:'Author or source (optional)', showAttribution:'Show author or source', typographyHeading:'Typography', fontLabel:'Font', autoFit:'Auto-fit text to the card', fontSizeLabel:'Font size', alignmentLabel:'Alignment', verticalLabel:'Vertical', lineHeightLabel:'Line height', textColorLabel:'Text colour', shadowLabel:'Shadow', backgroundHeading:'Background', backgroundTypeLabel:'Background type', backgroundColorLabel:'Background colour', gradientLabel:'Gradient', uploadLabel:'Upload a local JPG, PNG or WebP', privacy:'Your text and images stay in this browser and are not uploaded.', removeImage:'Remove image', fitLabel:'Image fit', overlayColorLabel:'Overlay colour', overlayLabel:'Overlay strength', positionXLabel:'Horizontal position', positionYLabel:'Vertical position', brandingHeading:'Branding', watermarkLabel:'Show Write-Urdu.com watermark', watermarkPositionLabel:'Watermark position', saved:'Saved on this device', saving:'Saving…', storageUnavailable:'Your card can still be created, but this browser could not save it locally.', preparing:'Preparing image…', downloaded:'PNG downloaded.', shared:'Share sheet opened.', shareFallback:'Sharing is not supported here. The PNG was downloaded instead.', resetConfirm:'Reset this card and discard its current design?', emptyText:'Add some Urdu text before exporting.', imageError:'This image could not be opened. Choose a JPG, PNG or WebP file smaller than 15 MB.', imageRemoved:'Background image removed.', fitWarning:'This text is larger than the available card area. Reduce the text or switch on auto-fit.', noImage:'Choose a local image to use this background.' },
        ur: { title:'اردو کارڈ اسٹوڈیو', subtitle:'اپنے اردو الفاظ کو خوب صورت، شیئر کرنے کے قابل تصویر بنائیں۔', back:'ایڈیٹر پر واپس جائیں', reset:'دوبارہ ترتیب دیں', share:'شیئر کریں', download:'PNG ڈاؤن لوڈ کریں', sizeHeading:'سائز', presetLabel:'آؤٹ پٹ سائز', templateHeading:'ڈیزائن', textHeading:'متن', textLabel:'کارڈ کا متن', characters:'{n} حروف', attributionLabel:'مصنف یا ماخذ (اختیاری)', showAttribution:'مصنف یا ماخذ دکھائیں', typographyHeading:'خط اور انداز', fontLabel:'فونٹ', autoFit:'متن کو کارڈ کے مطابق خودکار فٹ کریں', fontSizeLabel:'فونٹ کا سائز', alignmentLabel:'سیدھ', verticalLabel:'عمودی جگہ', lineHeightLabel:'سطری فاصلہ', textColorLabel:'متن کا رنگ', shadowLabel:'سایہ', backgroundHeading:'پس منظر', backgroundTypeLabel:'پس منظر کی قسم', backgroundColorLabel:'پس منظر کا رنگ', gradientLabel:'گریڈینٹ', uploadLabel:'مقامی JPG، PNG یا WebP اپ لوڈ کریں', privacy:'آپ کا متن اور تصاویر اسی براؤزر میں رہتی ہیں اور اپ لوڈ نہیں کی جاتیں۔', removeImage:'تصویر ہٹائیں', fitLabel:'تصویر کی مطابقت', overlayColorLabel:'اوورلے کا رنگ', overlayLabel:'اوورلے کی شدت', positionXLabel:'افقی جگہ', positionYLabel:'عمودی جگہ', brandingHeading:'برانڈنگ', watermarkLabel:'Write-Urdu.com واٹرمارک دکھائیں', watermarkPositionLabel:'واٹرمارک کی جگہ', saved:'اسی آلے پر محفوظ ہے', saving:'محفوظ کیا جا رہا ہے…', storageUnavailable:'کارڈ بن سکتا ہے، لیکن یہ براؤزر اسے مقامی طور پر محفوظ نہیں کر سکا۔', preparing:'تصویر تیار کی جا رہی ہے…', downloaded:'PNG ڈاؤن لوڈ ہو گیا۔', shared:'شیئر ونڈو کھول دی گئی۔', shareFallback:'یہاں شیئرنگ دستیاب نہیں۔ PNG ڈاؤن لوڈ کر دیا گیا ہے۔', resetConfirm:'کیا اس کارڈ کا موجودہ ڈیزائن ختم کر کے دوبارہ ترتیب دیں؟', emptyText:'برآمد کرنے سے پہلے کچھ اردو متن شامل کریں۔', imageError:'یہ تصویر نہیں کھل سکی۔ 15 MB سے کم JPG، PNG یا WebP فائل منتخب کریں۔', imageRemoved:'پس منظر کی تصویر ہٹا دی گئی۔', fitWarning:'یہ متن کارڈ کے دستیاب حصے سے بڑا ہے۔ متن کم کریں یا خودکار فٹ آن کریں۔', noImage:'اس پس منظر کے لیے مقامی تصویر منتخب کریں۔', templateNames:{'classic-nastaliq':'روایتی نستعلیق', midnight:'آدھی رات', 'minimal-white':'سادہ سفید', emerald:'زمرد', paper:'کاغذ', 'photo-quote':'تصویری اقتباس', 'sunflower-bloom':'سورج مکھی', 'golden-mandala':'سنہری منڈلا', 'botanical-frame':'نباتاتی فریم'} }
    };

    function t(key) { var value = (copy[locale] && copy[locale][key]) || copy.en[key] || key; var args = Array.prototype.slice.call(arguments, 1); return value.replace('{n}', args[0] == null ? '' : args[0]); }
    function notify(message, type) { if (window.WriteUrduUI && window.WriteUrduUI.notify) window.WriteUrduUI.notify(message, type); else setStatus(message, type); }
    function setStatus(message, type) { var target = root.querySelector('[data-card-status]'); if (target) { target.textContent = message || ''; target.className = 'card-studio-status' + (type === 'error' ? ' card-studio-error' : ''); } }
    function setNested(object, path, value) { var parts = path.split('.'); var target = object; parts.slice(0, -1).forEach(function (part) { target = target[part]; }); target[parts[parts.length - 1]] = value; }
    function getNested(object, path) { return path.split('.').reduce(function (value, part) { return value && value[part]; }, object); }
    function inputValue(element) { if (element.type === 'checkbox') return element.checked; if (element.type === 'range') return Number(element.value); return element.value; }
    function formatBytes(bytes) { return Math.round(bytes / 1024 / 1024 * 10) / 10; }

    function openDb() {
        if (dbPromise) return dbPromise;
        if (!window.indexedDB) return Promise.reject(new Error('IndexedDB unavailable'));
        dbPromise = new Promise(function (resolve, reject) {
            var request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = function () { var db = request.result; if (!db.objectStoreNames.contains('projects')) { var projects = db.createObjectStore('projects', { keyPath: 'id' }); projects.createIndex('updatedAt', 'updatedAt'); } if (!db.objectStoreNames.contains('assets')) { var assets = db.createObjectStore('assets', { keyPath: 'id' }); assets.createIndex('projectId', 'projectId'); } };
            request.onsuccess = function () { resolve(request.result); };
            request.onerror = function () { reject(request.error || new Error('Database unavailable')); };
        });
        return dbPromise;
    }
    function dbPut(storeName, value) { return openDb().then(function (db) { return new Promise(function (resolve, reject) { var tx = db.transaction(storeName, 'readwrite'); tx.objectStore(storeName).put(value); tx.oncomplete = resolve; tx.onerror = function () { reject(tx.error); }; }); }); }
    function dbGetLatest() { return openDb().then(function (db) { return new Promise(function (resolve, reject) { var tx = db.transaction('projects', 'readonly'); var request = tx.objectStore('projects').index('updatedAt').openCursor(null, 'prev'); request.onsuccess = function () { resolve(request.result ? request.result.value : null); }; request.onerror = function () { reject(request.error); }; }); }); }
    function dbGetAsset(id) { return id ? openDb().then(function (db) { return new Promise(function (resolve, reject) { var request = db.transaction('assets', 'readonly').objectStore('assets').get(id); request.onsuccess = function () { resolve(request.result || null); }; request.onerror = function () { reject(request.error); }; }); }) : Promise.resolve(null); }

    function readIncoming() { try { var raw = sessionStorage.getItem(incomingKey); if (!raw) return null; sessionStorage.removeItem(incomingKey); var value = JSON.parse(raw); return value && typeof value.text === 'string' ? value.text : null; } catch (error) { return null; } }
    function readLocalProject() { try { var raw = localStorage.getItem(projectKey); return raw ? core.normalizeCardProject(JSON.parse(raw)) : null; } catch (error) { return null; } }
    function saveProject() {
        state.updatedAt = new Date().toISOString();
        var serializable = JSON.parse(JSON.stringify(state));
        dbPut('projects', serializable).then(function () { setStatus(t('saved')); }).catch(function () { try { localStorage.setItem(projectKey, JSON.stringify(serializable)); setStatus(t('saved')); } catch (error) { setStatus(t('storageUnavailable'), 'error'); } });
    }
    function scheduleSave() { window.clearTimeout(saveTimer); setStatus(t('saving')); saveTimer = window.setTimeout(saveProject, 700); }

    function applyLocale() {
        locale = window.WriteUrduLocale && window.WriteUrduLocale.get ? window.WriteUrduLocale.get() : 'en';
        root.querySelectorAll('[data-card-i18n]').forEach(function (element) {
            var label = t(element.getAttribute('data-card-i18n'));
            var textNode = Array.prototype.find.call(element.childNodes, function (node) { return node.nodeType === 3; });
            if (textNode) textNode.nodeValue = label;
            else element.textContent = label;
        });
        document.documentElement.lang = locale === 'ur' ? 'ur' : 'en';
        document.documentElement.dir = locale === 'ur' ? 'rtl' : 'ltr';
        root.querySelector('[data-card-character-help]').firstElementChild.textContent = t('characters', String(state.text.value || '').length);
        var names = copy[locale] && copy[locale].templateNames;
        root.querySelector('[data-card-templates]').querySelectorAll('[data-card-template]').forEach(function (button) { var item = core.TEMPLATES.find(function (template) { return template.id === button.dataset.cardTemplate; }); if (item) button.textContent = names && names[item.id] || item.name; });
    }

    function fillOptions() {
        var preset = document.getElementById('cardPreset');
        core.PRESETS.forEach(function (item) { var option = document.createElement('option'); option.value = item.id; option.textContent = item.name + ' · ' + item.width + ' × ' + item.height; preset.appendChild(option); });
        var gradient = document.getElementById('cardGradient');
        core.GRADIENTS.forEach(function (item) { var option = document.createElement('option'); option.value = item.id; option.textContent = item.name; gradient.appendChild(option); });
        var templates = root.querySelector('[data-card-templates]');
        core.TEMPLATES.forEach(function (item) { var button = document.createElement('button'); button.type = 'button'; button.className = 'card-template'; button.dataset.template = item.id; button.dataset.cardTemplate = item.id; button.setAttribute('aria-pressed', 'false'); button.textContent = item.name; button.addEventListener('click', function () { userChanged = true; state = core.applyTemplate(state, item.id); syncControls(); requestRender(); scheduleSave(); }); templates.appendChild(button); });
    }

    function syncControls() {
        document.getElementById('cardPreset').value = state.presetId;
        document.getElementById('cardGradient').value = state.background.gradientId || core.GRADIENTS[0].id;
        root.querySelectorAll('[data-card-field]').forEach(function (element) { var value = getNested(state, element.dataset.cardField); if (element.type === 'checkbox') element.checked = Boolean(value); else if (value != null) element.value = value; });
        var auto = root.querySelector('[data-card-font-auto]'); auto.checked = state.text.fontMode === 'auto'; document.getElementById('cardFontSize').disabled = auto.checked;
        root.querySelector('[data-card-font-size-value]').textContent = Math.round(state.text.fontSize) + ' px'; root.querySelector('[data-card-line-height-value]').textContent = Number(state.text.lineHeight).toFixed(2); root.querySelector('[data-card-overlay-value]').textContent = Math.round(state.background.overlayOpacity * 100) + '%';
        root.querySelector('[data-card-character-help]').firstElementChild.textContent = t('characters', String(state.text.value || '').length);
        root.querySelector('[data-card-templates]').querySelectorAll('[data-card-template]').forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.cardTemplate === state.templateId)); });
        root.querySelector('[data-card-background-solid]').hidden = state.background.type !== 'solid'; root.querySelector('[data-card-background-gradient]').hidden = state.background.type !== 'gradient'; root.querySelectorAll('[data-card-background-image]').forEach(function (element) { element.hidden = state.background.type !== 'image'; });
        var warning = root.querySelector('[data-card-text-warning]'); if (state.text.value.length > 350) { warning.hidden = false; warning.textContent = t('fitWarning'); } else warning.hidden = true;
        applyLocale();
    }

    function ensureFont(fontFamily, size) { if (!document.fonts || !document.fonts.load) return Promise.resolve(); return document.fonts.load(size + 'px "' + fontFamily + '"').catch(function () {}); }
    function gradientFor(id, width, height) { var gradient = core.GRADIENTS.find(function (item) { return item.id === id; }) || core.GRADIENTS[0]; var angle = (gradient.angle - 90) * Math.PI / 180; var x = Math.cos(angle) * width, y = Math.sin(angle) * height; var canvasGradient = ctx.createLinearGradient(width / 2 - x / 2, height / 2 - y / 2, width / 2 + x / 2, height / 2 + y / 2); gradient.stops.forEach(function (stop) { canvasGradient.addColorStop(stop.offset, stop.color); }); return canvasGradient; }
    function shadowFor(id) { return id === 'strong' ? { color: 'rgba(0,0,0,.55)', blur: 16, y: 5 } : id === 'soft' ? { color: 'rgba(0,0,0,.3)', blur: 10, y: 3 } : null; }
    function drawPetalFlower(x, y, radius, petals, petalColor, centreColor, rotation) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(rotation || 0); ctx.globalAlpha = .84; ctx.fillStyle = petalColor;
        for (var i = 0; i < petals; i += 1) { ctx.save(); ctx.rotate((Math.PI * 2 * i) / petals); ctx.beginPath(); ctx.ellipse(0, -radius * .62, radius * .22, radius * .62, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
        ctx.globalAlpha = 1; ctx.fillStyle = centreColor; ctx.beginPath(); ctx.arc(0, 0, radius * .22, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    function drawLeaf(x, y, length, angle, color) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.fillStyle = color; ctx.globalAlpha = .78; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(length * .52, -length * .2, length * .95, -length * .08, length, 0); ctx.bezierCurveTo(length * .72, length * .25, length * .22, length * .25, 0, 0); ctx.fill(); ctx.restore();
    }
    function drawMandala(x, y, radius, colour, accent) {
        ctx.save(); ctx.translate(x, y); ctx.globalAlpha = .24; ctx.strokeStyle = colour; ctx.lineWidth = Math.max(2, radius * .018); ctx.fillStyle = accent;
        for (var ring = 0; ring < 3; ring += 1) { var ringRadius = radius * (.38 + ring * .28); ctx.beginPath(); ctx.arc(0, 0, ringRadius, 0, Math.PI * 2); ctx.stroke(); for (var i = 0; i < 12; i += 1) { ctx.save(); ctx.rotate(i * Math.PI / 6); ctx.beginPath(); ctx.ellipse(0, -ringRadius, radius * .045, radius * .12, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } }
        ctx.globalAlpha = .38; ctx.beginPath(); ctx.arc(0, 0, radius * .14, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    function drawMotif(motif, preset, minSide) {
        if (motif === 'sunflower') { drawPetalFlower(preset.marginX * .8, preset.marginY * .7, minSide * .14, 12, '#efc235', '#9b6819', -.2); drawPetalFlower(preset.width - preset.marginX * .72, preset.height - preset.marginY * .64, minSide * .105, 10, '#e6b629', '#9b6819', .2); drawLeaf(preset.marginX * .9, preset.marginY * 1.05, minSide * .2, .4, '#78a15b'); drawLeaf(preset.width - preset.marginX * .75, preset.height - preset.marginY * .95, minSide * .18, 3.6, '#78a15b'); }
        if (motif === 'mandala') { drawMandala(preset.width / 2, preset.height / 2, minSide * .43, '#5c4214', '#fff0a8'); drawPetalFlower(preset.marginX * .62, preset.marginY * .62, minSide * .07, 8, '#fff0a8', '#8a6418', 0); }
        if (motif === 'botanical') { var leaf = '#4e8a59'; drawLeaf(preset.marginX * .55, preset.marginY * .55, minSide * .24, .2, leaf); drawLeaf(preset.marginX * .7, preset.marginY * .82, minSide * .2, .65, leaf); drawLeaf(preset.width - preset.marginX * .58, preset.height - preset.marginY * .62, minSide * .25, 3.35, leaf); drawLeaf(preset.width - preset.marginX * .78, preset.height - preset.marginY * .8, minSide * .18, 3.75, leaf); drawPetalFlower(preset.width - preset.marginX * .58, preset.marginY * .72, minSide * .055, 8, '#e0b331', '#8a6418', 0); }
    }

    function drawCard() {
        var token = ++renderToken;
        var preset = core.PRESETS.find(function (item) { return item.id === state.presetId; }) || core.PRESETS[0];
        canvas.width = preset.width; canvas.height = preset.height;
        ctx.clearRect(0, 0, preset.width, preset.height);
        if (state.background.type === 'gradient') { ctx.fillStyle = gradientFor(state.background.gradientId, preset.width, preset.height); ctx.fillRect(0, 0, preset.width, preset.height); } else { ctx.fillStyle = state.background.color || '#ffffff'; ctx.fillRect(0, 0, preset.width, preset.height); }
        if (state.background.type === 'image' && currentAsset) { var placement = core.calculateImagePlacement(currentAsset, preset, state.background.fit, state.background.positionX, state.background.positionY); ctx.save(); if (state.background.blur) ctx.filter = 'blur(' + state.background.blur + 'px)'; ctx.drawImage(currentAsset.image, placement.x, placement.y, placement.width, placement.height); ctx.restore(); } else if (state.background.type === 'image') { ctx.fillStyle = 'rgba(30,50,40,.12)'; ctx.fillRect(0, 0, preset.width, preset.height); }
        if (state.background.type === 'image' && state.background.overlayOpacity) { ctx.fillStyle = state.background.overlayColor + Math.round(state.background.overlayOpacity * 255).toString(16).padStart(2, '0'); ctx.fillRect(0, 0, preset.width, preset.height); }
        var template = core.TEMPLATES.find(function (item) { return item.id === state.templateId; }) || core.TEMPLATES[0];
        var minSide = Math.min(preset.width, preset.height); if (template.decoration && template.decoration.motif) drawMotif(template.decoration.motif, preset, minSide); if (template.decoration && template.decoration.border && template.decoration.border.enabled) { ctx.strokeStyle = template.decoration.border.color; ctx.lineWidth = Math.max(2, minSide * .004); ctx.strokeRect(preset.marginX * .55, preset.marginY * .55, preset.width - preset.marginX * 1.1, preset.height - preset.marginY * 1.1); }
        ctx.strokeStyle = template.decoration.accent; ctx.lineWidth = Math.max(3, minSide * .006); if (state.text.align === 'center') ctx.beginPath(), ctx.moveTo(preset.width / 2 - minSide * .09, preset.marginY * .82), ctx.lineTo(preset.width / 2 + minSide * .09, preset.marginY * .82), ctx.stroke(); else ctx.fillRect(state.text.align === 'right' ? preset.width - preset.marginX : preset.marginX, preset.marginY * .82, minSide * .12, Math.max(3, minSide * .006));
        var box = { x: preset.marginX, y: preset.marginY, width: preset.width - preset.marginX * 2, height: preset.height - preset.marginY * 2 - 28 };
        var layout = state.text.fontMode === 'auto' ? core.findBestFontSize(ctx, state, box) : core.layoutCardText(ctx, state, box); state.text.fontSize = layout.fontSize || state.text.fontSize;
        ctx.save(); ctx.direction = 'rtl'; ctx.textAlign = state.text.align === 'left' ? 'left' : state.text.align === 'right' ? 'right' : 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = state.text.color || '#172a21'; var shadow = shadowFor(state.text.shadow); if (shadow) { ctx.shadowColor = shadow.color; ctx.shadowBlur = shadow.blur; ctx.shadowOffsetY = shadow.y; }
        ctx.font = layout.fontSize + 'px "' + state.text.fontFamily + '"'; var ascent = layout.fontSize * .88; var y = layout.verticalAlign === 'top' ? box.y + ascent : layout.verticalAlign === 'bottom' ? box.y + box.height - layout.height + ascent : box.y + (box.height - layout.height) / 2 + ascent; var x = state.text.align === 'right' ? box.x + box.width : state.text.align === 'left' ? box.x : preset.width / 2;
        layout.lines.forEach(function (line, index) { if (line.text) ctx.fillText(line.text, x, y); y += layout.lineHeight; if (line.isParagraphEnd && index < layout.lines.length - 1) y += layout.lineHeight * .22; });
        if (layout.attribution) { y += layout.lineHeight * .15; ctx.font = layout.attributionSize + 'px "' + (state.attribution.fontFamily || 'Noto Naskh Arabic') + '"'; ctx.fillStyle = state.attribution.color || state.text.color; ctx.fillText(layout.attribution, x, y); }
        ctx.restore();
        if (state.watermark.enabled) { ctx.save(); ctx.direction = 'ltr'; ctx.font = Math.max(16, Math.round(minSide * .018)) + 'px "Segoe UI", Arial, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.72)'; if (state.background.type === 'solid' && !/^#(0|1|2|3)/i.test(state.background.color || '')) ctx.fillStyle = 'rgba(20,50,35,.55)'; ctx.textAlign = state.watermark.position === 'bottom-right' ? 'right' : state.watermark.position === 'bottom-center' ? 'center' : 'left'; var watermarkX = state.watermark.position === 'bottom-right' ? preset.width - preset.marginX : state.watermark.position === 'bottom-center' ? preset.width / 2 : preset.marginX; ctx.fillText('Write-Urdu.com', watermarkX, preset.height - Math.max(30, preset.marginY * .42)); ctx.restore(); }
        if (token === renderToken) { root.querySelector('[data-card-dimensions]').textContent = preset.width + ' × ' + preset.height + ' px'; root.querySelector('[data-accessible-card-text]').textContent = state.text.value; if (layout.overflow && state.text.fontMode === 'manual') setStatus(t('fitWarning'), 'error'); }
    }
    function requestRender() { if (renderQueued) return; renderQueued = true; window.requestAnimationFrame(function () { renderQueued = false; ensureFont(state.text.fontFamily, state.text.fontSize).then(drawCard); }); }

    function filename() { return core.safeFilename(state.name, 'write-urdu-card') + '-' + new Date().toISOString().slice(0, 10) + '.png'; }
    function exportBlob() { return new Promise(function (resolve, reject) { canvas.toBlob(function (blob) { blob ? resolve(blob) : reject(new Error('PNG generation failed')); }, 'image/png'); }); }
    function downloadBlob(blob, name) { var url = URL.createObjectURL(blob); var link = document.createElement('a'); link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000); }
    function exportPng() { if (!state.text.value.trim() || state.text.value === core.DEFAULT_TEXT) { setStatus(t('emptyText'), 'error'); return Promise.reject(new Error('empty')); } setStatus(t('preparing')); return ensureFont(state.text.fontFamily, state.text.fontSize).then(drawCard).then(exportBlob).then(function (blob) { downloadBlob(blob, filename()); setStatus(t('downloaded')); return blob; }); }
    function shareCard() { return exportPng().then(function (blob) { var name = filename(); var file = new File([blob], name, { type: 'image/png' }); if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) return navigator.share({ files: [file], title: 'Urdu card' }).then(function () { setStatus(t('shared')); }); setStatus(t('shareFallback')); }).catch(function (error) { if (error && error.name === 'AbortError') return; if (error && error.message !== 'empty') setStatus(error.message || 'Unable to export PNG.', 'error'); }); }

    function bindControls() {
        root.querySelectorAll('[data-card-field]').forEach(function (element) { element.addEventListener('input', function () { userChanged = true; setNested(state, element.dataset.cardField, inputValue(element)); state = core.normalizeCardProject(state); requestRender(); syncControls(); scheduleSave(); }); element.addEventListener('change', function () { userChanged = true; setNested(state, element.dataset.cardField, inputValue(element)); state = core.normalizeCardProject(state); requestRender(); syncControls(); scheduleSave(); }); });
        root.querySelector('[data-card-font-auto]').addEventListener('change', function (event) { userChanged = true; state.text.fontMode = event.target.checked ? 'auto' : 'manual'; document.getElementById('cardFontSize').disabled = event.target.checked; requestRender(); scheduleSave(); });
        root.querySelectorAll('[data-card-action="download"]').forEach(function (button) { button.addEventListener('click', exportPng); }); root.querySelectorAll('[data-card-action="share"]').forEach(function (button) { button.addEventListener('click', shareCard); });
        root.querySelector('[data-card-action="back"]').addEventListener('click', function () { window.location.href = '/'; });
        root.querySelector('[data-card-action="reset"]').addEventListener('click', function () { if (window.confirm(t('resetConfirm'))) { userChanged = true; state = core.createDefaultCardProject(''); currentAsset = null; if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl); currentObjectUrl = null; syncControls(); requestRender(); scheduleSave(); } });
        document.getElementById('cardPreset').addEventListener('change', function (event) { userChanged = true; state = core.applyPreset(state, event.target.value); syncControls(); requestRender(); scheduleSave(); });
        document.getElementById('cardImage').addEventListener('change', function (event) { var file = event.target.files && event.target.files[0]; if (!file) return; if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 15 * 1024 * 1024) { setStatus(t('imageError'), 'error'); event.target.value = ''; return; } userChanged = true; var url = URL.createObjectURL(file); var image = new Image(); image.onload = function () { if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl); currentObjectUrl = url; currentAsset = { image: image, width: image.naturalWidth, height: image.naturalHeight }; state.background.type = 'image'; state.background.imageAssetId = state.id + '_image'; syncControls(); requestRender(); scheduleSave(); dbPut('assets', { id: state.background.imageAssetId, projectId: state.id, blob: file, updatedAt: new Date().toISOString() }).catch(function () {}); }; image.onerror = function () { URL.revokeObjectURL(url); setStatus(t('imageError'), 'error'); }; image.src = url; });
        root.querySelector('[data-card-action="remove-image"]').addEventListener('click', function () { userChanged = true; var template = core.TEMPLATES.find(function (item) { return item.id === state.templateId; }) || core.TEMPLATES[0]; state.background.type = template.background.type; state.background.color = template.background.color || state.background.color; state.background.gradientId = template.background.gradientId || null; state.background.imageAssetId = null; currentAsset = null; if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl); currentObjectUrl = null; syncControls(); requestRender(); scheduleSave(); setStatus(t('imageRemoved')); });
    }

    function restoreAsset() { return dbGetAsset(state.background.imageAssetId).then(function (asset) { if (!asset || !asset.blob) return; var url = URL.createObjectURL(asset.blob); var image = new Image(); image.onload = function () { currentObjectUrl = url; currentAsset = { image: image, width: image.naturalWidth, height: image.naturalHeight }; requestRender(); }; image.src = url; }).catch(function () {}); }
    function initialise() {
        fillOptions();
        var incoming = readIncoming();
        var saved = incoming ? null : readLocalProject();
        state = core.normalizeCardProject(incoming != null ? core.createDefaultCardProject(incoming) : saved || state);
        bindControls(); syncControls(); restoreAsset(); requestRender();
        if (!incoming && !saved) {
            setStatus(t('privacy'));
            dbGetLatest().then(function (latest) {
                if (!latest || userChanged) return;
                state = core.normalizeCardProject(latest); syncControls(); restoreAsset(); requestRender();
            }).catch(function () {});
        }
        document.addEventListener('write-urdu:locale-change', applyLocale);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise); else initialise();
}());
