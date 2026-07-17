(function () {
    'use strict';

    var core = window.WriteUrduCardStudio;
    if (!core) return;
    var social = window.WriteUrduSocialMaker;
    var socialConfig = social && social.getModeFromLocation ? social.getModeFromLocation(window.location) : null;
    var templateLibrary = window.WriteUrduTemplateLibrary;
    var root = document.querySelector('[data-card-studio]');
    if (!root) return;

    var DB_NAME = 'writeUrduCardStudio';
    var DB_VERSION = 1;
    var projectKey = socialConfig && social.storageKey ? social.storageKey(socialConfig.id) : 'writeUrdu.cardStudio.project';
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
    var transliterationAttempt = 0;
    var transliterationStatusKey = 'transliterationLoading';
    var interactionState = { selectedObjectId: null, editingObjectId: null };
    var currentLayouts = {};
    var socialExportFormat = 'png';
    var socialJpegQuality = .9;

    var copy = {
        en: { title:'Urdu Card Studio', subtitle:'Turn your Urdu words into a polished shareable image.', templateFrom:'Template: ', templateApplied:'Library template applied', back:'Back to editor', reset:'Reset', share:'Share', download:'Download PNG', sizeHeading:'Canvas', presetLabel:'Output preset', templateHeading:'Template', textHeading:'Content', textLabel:'Card text', characters:'{n} characters', transliterationLoading:'Roman Urdu input is loading…', transliterationReady:'Roman Urdu input is ready. Press Space after each word, including when editing on the card.', transliterationUnavailable:'Roman Urdu input is unavailable. Check your connection and retry.', retryTransliteration:'Retry transliteration', attributionLabel:'Author or source (optional)', showAttribution:'Show author or source', typographyHeading:'Text style', fontLabel:'Font', autoFit:'Auto-fit text to the card', fontSizeLabel:'Font size', alignmentLabel:'Alignment', verticalLabel:'Vertical', lineHeightLabel:'Line height', textColorLabel:'Text colour', shadowLabel:'Shadow', layoutHeading:'Layout', selectedObjectLabel:'Selected object', mainText:'Main text', authorSource:'Author/source', xPosition:'X position (%)', yPosition:'Y position (%)', textBoxWidth:'Text-box width (%)', centerHorizontally:'Centre horizontally', centerVertically:'Centre vertically', resetLayout:'Reset layout', textSelected:'Text selected', edit:'Edit', left:'Left', centre:'Centre', right:'Right', resetPosition:'Reset position', done:'Done', cancel:'Cancel', backgroundHeading:'Background', backgroundTypeLabel:'Background type', backgroundColorLabel:'Background colour', gradientLabel:'Gradient', uploadLabel:'Upload a local JPG, PNG or WebP', privacy:'Your text and images stay in this browser and are not uploaded.', removeImage:'Remove image', fitLabel:'Image fit', overlayColorLabel:'Overlay colour', overlayLabel:'Overlay strength', positionXLabel:'Horizontal position', positionYLabel:'Vertical position', brandingHeading:'Branding', watermarkLabel:'Show Write-Urdu.com watermark', watermarkPositionLabel:'Watermark position', saved:'Saved on this device', saving:'Saving…', storageUnavailable:'Your card can still be created, but this browser could not save it locally.', preparing:'Preparing image…', downloaded:'PNG downloaded.', shared:'Share sheet opened.', shareFallback:'Sharing is not supported here. The PNG was downloaded instead.', resetConfirm:'Reset this card and discard its current design?', emptyText:'Add some Urdu text before exporting.', imageError:'This image could not be opened. Choose a JPG, PNG or WebP file smaller than 15 MB.', imageRemoved:'Background image removed.', fitWarning:'This text is larger than the available card area. Reduce the text or switch on auto-fit.', noImage:'Choose a local image to use this background.' },
        ur: { title:'اردو کارڈ اسٹوڈیو', subtitle:'اپنے اردو الفاظ کو خوب صورت، شیئر کرنے کے قابل تصویر بنائیں۔', templateFrom:'ٹیمپلیٹ: ', templateApplied:'لائبریری ٹیمپلیٹ لاگو ہے', back:'ایڈیٹر پر واپس جائیں', reset:'دوبارہ ترتیب دیں', share:'شیئر کریں', download:'PNG ڈاؤن لوڈ کریں', sizeHeading:'سائز', presetLabel:'آؤٹ پٹ سائز', templateHeading:'ڈیزائن', textHeading:'متن', textLabel:'کارڈ کا متن', characters:'{n} حروف', transliterationLoading:'رومن اردو کی تحریر تبدیلی لوڈ ہو رہی ہے…', transliterationReady:'رومن اردو ان پٹ تیار ہے۔ ہر لفظ کے بعد Space دبائیں۔', transliterationUnavailable:'رومن اردو کی تحریر تبدیلی دستیاب نہیں۔ کنکشن دیکھ کر دوبارہ کوشش کریں۔', retryTransliteration:'دوبارہ کوشش کریں', attributionLabel:'مصنف یا ماخذ (اختیاری)', showAttribution:'مصنف یا ماخذ دکھائیں', typographyHeading:'خط اور انداز', fontLabel:'فونٹ', autoFit:'متن کو کارڈ کے مطابق خودکار فٹ کریں', fontSizeLabel:'فونٹ کا سائز', alignmentLabel:'سیدھ', verticalLabel:'عمودی جگہ', lineHeightLabel:'سطری فاصلہ', textColorLabel:'متن کا رنگ', shadowLabel:'سایہ', layoutHeading:'ترتیب', selectedObjectLabel:'منتخب جزو', mainText:'مرکزی متن', authorSource:'مصنف یا ماخذ', xPosition:'افقی مقام (%)', yPosition:'عمودی مقام (%)', textBoxWidth:'متن کے خانے کی چوڑائی (%)', centerHorizontally:'افقی مرکز', centerVertically:'عمودی مرکز', resetLayout:'ترتیب دوبارہ بنائیں', textSelected:'متن منتخب ہے', edit:'ترمیم', left:'بائیں', centre:'درمیان', right:'دائیں', resetPosition:'مقام دوبارہ بنائیں', done:'مکمل', cancel:'منسوخ', backgroundHeading:'پس منظر', backgroundTypeLabel:'پس منظر کی قسم', backgroundColorLabel:'پس منظر کا رنگ', gradientLabel:'گریڈینٹ', uploadLabel:'مقامی JPG، PNG یا WebP اپ لوڈ کریں', privacy:'آپ کا متن اور تصاویر اسی براؤزر میں رہتی ہیں اور اپ لوڈ نہیں کی جاتیں۔', removeImage:'تصویر ہٹائیں', fitLabel:'تصویر کی مطابقت', overlayColorLabel:'اوورلے کا رنگ', overlayLabel:'اوورلے کی شدت', positionXLabel:'افقی جگہ', positionYLabel:'عمودی جگہ', brandingHeading:'برانڈنگ', watermarkLabel:'Write-Urdu.com واٹرمارک دکھائیں', watermarkPositionLabel:'واٹرمارک کی جگہ', saved:'اسی آلے پر محفوظ ہے', saving:'محفوظ کیا جا رہا ہے…', storageUnavailable:'کارڈ بن سکتا ہے، لیکن یہ براؤزر اسے مقامی طور پر محفوظ نہیں کر سکا۔', preparing:'تصویر تیار کی جا رہی ہے…', downloaded:'PNG ڈاؤن لوڈ ہو گیا۔', shared:'شیئر ونڈو کھول دی گئی۔', shareFallback:'یہاں شیئرنگ دستیاب نہیں۔ PNG ڈاؤن لوڈ کر دیا گیا ہے۔', resetConfirm:'کیا اس کارڈ کا موجودہ ڈیزائن ختم کر کے دوبارہ ترتیب دیں؟', emptyText:'برآمد کرنے سے پہلے کچھ اردو متن شامل کریں۔', imageError:'یہ تصویر نہیں کھل سکی۔ 15 MB سے کم JPG، PNG یا WebP فائل منتخب کریں۔', imageRemoved:'پس منظر کی تصویر ہٹا دی گئی۔', fitWarning:'یہ متن کارڈ کے دستیاب حصے سے بڑا ہے۔ متن کم کریں یا خودکار فٹ آن کریں۔', noImage:'اس پس منظر کے لیے مقامی تصویر منتخب کریں۔', templateNames:{'classic-nastaliq':'روایتی نستعلیق', midnight:'آدھی رات', 'minimal-white':'سادہ سفید', emerald:'زمرد', paper:'کاغذ', 'photo-quote':'تصویری اقتباس', 'sunflower-bloom':'سورج مکھی', 'golden-mandala':'سنہری منڈلا', 'botanical-frame':'نباتاتی فریم'} }
    };

    copy.en.subtitle = 'Design, move, edit and export Urdu cards in your browser.';
    copy.ur.subtitle = 'براؤزر میں اردو کارڈ بنائیں، متن منتقل کریں، ترمیم کریں اور برآمد کریں۔';
    copy.en.canvasHelp = 'Select text to move or resize it. Choose Edit, or double-click, to type directly on the card.';
    copy.ur.canvasHelp = 'متن منتخب کر کے اسے منتقل یا بڑا چھوٹا کریں۔ کارڈ پر لکھنے کے لیے ترمیم منتخب کریں یا دو بار کلک کریں۔';
    copy.ur.transliterationReady = 'رومن اردو ان پٹ تیار ہے۔ ہر لفظ کے بعد Space دبائیں، کارڈ پر ترمیم کرتے وقت بھی۔';
    copy.en.tooltips = { edit:'Edit text', left:'Align left', centre:'Align centre', right:'Align right', resetPosition:'Reset text position', done:'Done editing', cancel:'Cancel editing' };
    copy.ur.tooltips = { edit:'متن میں ترمیم', left:'بائیں سیدھ', centre:'درمیانی سیدھ', right:'دائیں سیدھ', resetPosition:'متن کی جگہ دوبارہ بنائیں', done:'ترمیم مکمل کریں', cancel:'ترمیم منسوخ کریں' };

    if (socialConfig) {
        copy.en.title = socialConfig.title;
        copy.en.subtitle = socialConfig.subtitle;
        root.dataset.cardSocialMode = socialConfig.id;
        document.body.classList.add('social-maker-embedded');
        root.querySelectorAll('[data-social-only]').forEach(function (element) { element.hidden = false; });
        var socialTitle = root.querySelector('[data-social-title]');
        var socialSubtitle = root.querySelector('[data-social-subtitle]');
        if (socialTitle) socialTitle.textContent = socialConfig.title;
        if (socialSubtitle) socialSubtitle.textContent = socialConfig.subtitle;
        document.title = socialConfig.title + ' – Write Urdu';
    }

    function t(key) { var value = (copy[locale] && copy[locale][key]) || copy.en[key] || key; var args = Array.prototype.slice.call(arguments, 1); return value.replace('{n}', args[0] == null ? '' : args[0]); }
    function notify(message, type) { if (window.WriteUrduUI && window.WriteUrduUI.notify) window.WriteUrduUI.notify(message, type); else setStatus(message, type); }
    function setStatus(message, type) { var target = root.querySelector('[data-card-status]'); if (target) { target.textContent = message || ''; target.className = 'card-studio-status' + (type === 'error' ? ' card-studio-error' : ''); } }
    function socialPreset() { return getPreset(); }
    function socialSafeArea() { return socialConfig && social.getSafeArea ? social.getSafeArea(socialConfig.id, socialPreset()) : null; }
    function syncSocialControls() {
        if (!socialConfig || !social) return;
        var preset = socialPreset();
        var area = socialSafeArea();
        var guide = root.querySelector('[data-card-safe-area]');
        var toggle = root.querySelector('[data-social-safe-toggle]');
        var format = root.querySelector('[data-social-export-format]');
        var quality = root.querySelector('[data-social-jpeg-quality]');
        var qualityWrap = root.querySelector('[data-social-quality-wrap]');
        var qualityValue = root.querySelector('[data-social-quality-value]');
        var warning = root.querySelector('[data-social-safe-warning]');
        var guideLabel = root.querySelector('[data-card-safe-area-label]');
        if (guide && area) {
            guide.style.setProperty('--safe-top', (area.top / preset.height * 100) + '%');
            guide.style.setProperty('--safe-right', (area.right / preset.width * 100) + '%');
            guide.style.setProperty('--safe-bottom', (area.bottom / preset.height * 100) + '%');
            guide.style.setProperty('--safe-left', (area.left / preset.width * 100) + '%');
            guide.setAttribute('data-label', socialConfig.guideLabel);
            guide.hidden = !(toggle ? toggle.checked : true);
            if (guideLabel) guideLabel.textContent = socialConfig.guideLabel;
        }
        if (format) format.value = socialExportFormat;
        root.querySelectorAll('[data-card-action="download"]').forEach(function (button) { button.textContent = 'Download ' + (socialExportFormat === 'jpeg' ? 'JPEG' : 'PNG'); });
        if (quality) quality.value = socialJpegQuality;
        if (qualityWrap) qualityWrap.hidden = socialExportFormat !== 'jpeg';
        if (qualityValue) qualityValue.textContent = Math.round(socialJpegQuality * 100) + '%';
        if (warning && area) {
            var objects = { text: objectRect('text') };
            if (state.attribution.enabled && state.attribution.value.trim()) objects.attribution = objectRect('attribution');
            var result = social.evaluateSafeArea(objects, preset, area);
            warning.hidden = result.valid;
            warning.textContent = result.valid ? '' : 'Some text extends outside the recommended safe area. Move or resize it before downloading.';
        }
    }
    function copySocialCaption() {
        if (!socialConfig) return;
        var value = String(state.text.value || '').trim();
        if (!value) { setStatus('Add text before copying a caption.', 'error'); return; }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(value).then(function () { setStatus('Caption text copied.'); }).catch(function () { setStatus('Copy was not available in this browser.', 'error'); });
        else setStatus('Copy was not available in this browser.', 'error');
    }
    function setTransliterationStatus(key, failed) { transliterationStatusKey = key; var status = root.querySelector('[data-card-transliteration-status]'); var retry = root.querySelector('[data-card-transliteration-retry]'); if (status) status.textContent = t(key); if (retry) { retry.hidden = !failed; retry.textContent = t('retryTransliteration'); } }
    function initialiseTransliteration() {
        var attempt = ++transliterationAttempt;
        setTransliterationStatus('transliterationLoading', false);
        if (!window.google || typeof google.load !== 'function' || typeof google.setOnLoadCallback !== 'function') { setTransliterationStatus('transliterationUnavailable', true); return; }
        var finished = false;
        function fail() { if (attempt === transliterationAttempt && !finished) { finished = true; setTransliterationStatus('transliterationUnavailable', true); } }
        function ready() {
            if (attempt !== transliterationAttempt || finished) return;
            try {
                var options = { sourceLanguage: google.elements.transliteration.LanguageCode.ENGLISH, destinationLanguage: [google.elements.transliteration.LanguageCode.URDU], shortcutKey: 'ctrl+g', transliterationEnabled: true };
                var control = new google.elements.transliteration.TransliterationControl(options);
                control.makeTransliteratable(['cardText', 'cardCanvasEditor']);
                window.writeUrduTransliterationControl = control;
                document.dispatchEvent(new CustomEvent('write-urdu:transliteration-ready', { detail: { control: control } }));
                finished = true;
                window.writeUrduTransliterationReady = true;
                setTransliterationStatus('transliterationReady', false);
            } catch (error) { fail(); }
        }
        try { google.load('elements', '1', { packages: 'transliteration' }); google.setOnLoadCallback(ready); } catch (error) { fail(); return; }
        window.setTimeout(fail, 8000);
    }
    function setNested(object, path, value) { var parts = path.split('.'); var target = object; parts.slice(0, -1).forEach(function (part) { target = target[part]; }); target[parts[parts.length - 1]] = value; }
    function getNested(object, path) { return path.split('.').reduce(function (value, part) { return value && value[part]; }, object); }
    function inputValue(element) { if (element.type === 'checkbox') return element.checked; if (element.type === 'range') return Number(element.value); return element.value; }
    function formatBytes(bytes) { return Math.round(bytes / 1024 / 1024 * 10) / 10; }
    function getPreset() { return core.PRESETS.find(function (item) { return item.id === state.presetId; }) || core.PRESETS[0]; }
    function objectTransform(objectId) { return state[objectId] && state[objectId].transform ? state[objectId].transform : core.defaultTransform(getPreset(), objectId); }
    function objectRect(objectId) { return core.transformToRect(objectTransform(objectId), getPreset(), objectId); }
    function setObjectRect(objectId, rect, flags) {
        var preset = getPreset(); var object = state[objectId]; if (!object) return;
        var transform = core.rectToTransform(rect, preset, object.transform, objectId);
        if (flags && flags.widthCustomized) transform.widthCustomized = true;
        if (flags && flags.positionCustomized === false) transform.positionCustomized = false;
        object.transform = transform;
    }
    function getObjectLabel(objectId) { return objectId === 'attribution' ? (locale === 'ur' ? 'مصنف یا ماخذ' : 'Author/source') : (locale === 'ur' ? 'مرکزی متن' : 'Main text'); }
    function activeObjectValue(objectId) { return objectId === 'attribution' ? String(state.attribution.value || '') : String(state.text.value || ''); }

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
    function dbGetLatest() { return openDb().then(function (db) { return new Promise(function (resolve, reject) { var tx = db.transaction('projects', 'readonly'); var request = tx.objectStore('projects').index('updatedAt').openCursor(null, 'prev'); request.onsuccess = function () { var cursor = request.result; if (!cursor) { resolve(null); return; } var value = cursor.value; if ((value.scope || 'card-studio') === (socialConfig ? socialConfig.id : 'card-studio')) resolve(value); else { cursor.continue(); } }; request.onerror = function () { reject(request.error); }; }); }); }
    function dbGetAsset(id) { return id ? openDb().then(function (db) { return new Promise(function (resolve, reject) { var request = db.transaction('assets', 'readonly').objectStore('assets').get(id); request.onsuccess = function () { resolve(request.result || null); }; request.onerror = function () { reject(request.error); }; }); }) : Promise.resolve(null); }

    function readIncoming() { try { var raw = sessionStorage.getItem(incomingKey); if (!raw) return null; sessionStorage.removeItem(incomingKey); var value = JSON.parse(raw); return value && typeof value.text === 'string' ? value.text : null; } catch (error) { return null; } }
    function readTemplateSelection() {
        if (!templateLibrary) return null;
        try {
            var slug = new URLSearchParams(window.location.search || '').get('template');
            return slug ? templateLibrary.getTemplateBySlug(slug) : null;
        } catch (error) { return null; }
    }
    function readLocalProject() { try { var raw = localStorage.getItem(projectKey); return raw ? core.normalizeCardProject(JSON.parse(raw)) : null; } catch (error) { return null; } }
    function saveProject() {
        state.updatedAt = new Date().toISOString();
        var serializable = JSON.parse(JSON.stringify(state));
        serializable.scope = socialConfig ? socialConfig.id : 'card-studio';
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
        var transliterationStatus = root.querySelector('[data-card-transliteration-status]'); if (transliterationStatus) transliterationStatus.textContent = t(transliterationStatusKey); var retry = root.querySelector('[data-card-transliteration-retry]'); if (retry) retry.textContent = t('retryTransliteration');
        var tooltipCopy = copy[locale] && copy[locale].tooltips || copy.en.tooltips;
        root.querySelectorAll('[data-card-tooltip]').forEach(function (button) { var label = tooltipCopy[button.getAttribute('data-card-tooltip')]; var labelElement = button.querySelector('[data-card-i18n]'); if (label) { button.title = label; button.setAttribute('aria-label', labelElement ? t(labelElement.getAttribute('data-card-i18n')) : label); } });
        syncLibraryTemplateBadge();
    }

    function syncLibraryTemplateBadge() {
        var badge = root.querySelector('[data-card-library-template]');
        var panel = root.querySelector('[data-card-library-design]');
        if (!badge) return;
        var selected = templateLibrary && state.libraryTemplateId && Array.isArray(templateLibrary.TEMPLATES)
            ? templateLibrary.TEMPLATES.find(function (template) { return template.id === state.libraryTemplateId; })
            : null;
        badge.hidden = !selected;
        badge.textContent = selected ? t('templateFrom') + selected.name + (locale === 'ur' && selected.nameUrdu ? ' · ' + selected.nameUrdu : '') : '';
        if (selected) badge.setAttribute('aria-label', badge.textContent);
        else badge.removeAttribute('aria-label');
        if (panel) {
            panel.hidden = !selected;
            if (selected) {
                var name = panel.querySelector('[data-card-library-design-name]');
                var meta = panel.querySelector('[data-card-library-design-meta]');
                var swatch = panel.querySelector('[data-card-library-design-swatch]');
                if (name) name.textContent = locale === 'ur' && selected.nameUrdu ? selected.nameUrdu : selected.name;
                if (meta) meta.textContent = t('templateApplied') + ' · ' + selected.canvas.width + ' × ' + selected.canvas.height;
                if (swatch) { swatch.style.backgroundColor = selected.canvas.backgroundColor; swatch.style.borderColor = selected.style && selected.style.accent || '#147a49'; }
            }
        }
    }

    function fillOptions() {
        var preset = document.getElementById('cardPreset');
        core.PRESETS.forEach(function (item) { var option = document.createElement('option'); option.value = item.id; option.textContent = item.name + ' · ' + item.width + ' × ' + item.height; preset.appendChild(option); });
        var gradient = document.getElementById('cardGradient');
        core.GRADIENTS.forEach(function (item) { var option = document.createElement('option'); option.value = item.id; option.textContent = item.name; gradient.appendChild(option); });
        var templates = root.querySelector('[data-card-templates]');
        core.TEMPLATES.forEach(function (item) { var button = document.createElement('button'); button.type = 'button'; button.className = 'card-template'; button.dataset.template = item.id; button.dataset.cardTemplate = item.id; button.setAttribute('aria-pressed', 'false'); button.textContent = item.name; button.addEventListener('click', function () { if (window.WriteUrduCardStudioInteractionApi && window.WriteUrduCardStudioInteractionApi.commit) window.WriteUrduCardStudioInteractionApi.commit(); userChanged = true; state = core.applyTemplate(state, item.id); delete state.libraryTemplateId; syncControls(); requestRender(); scheduleSave(); }); templates.appendChild(button); });
    }

    function syncControls() {
        document.getElementById('cardPreset').value = state.presetId;
        document.getElementById('cardGradient').value = state.background.gradientId || core.GRADIENTS[0].id;
        root.querySelectorAll('[data-card-field]').forEach(function (element) { var value = getNested(state, element.dataset.cardField); if (element.type === 'checkbox') element.checked = Boolean(value); else if (value != null) element.value = value; });
        var auto = root.querySelector('[data-card-font-auto]'); auto.checked = state.text.fontMode === 'auto'; document.getElementById('cardFontSize').disabled = auto.checked;
        root.querySelector('[data-card-font-size-value]').textContent = Math.round(state.text.fontSize) + ' px'; root.querySelector('[data-card-line-height-value]').textContent = Number(state.text.lineHeight).toFixed(2); root.querySelector('[data-card-overlay-value]').textContent = Math.round(state.background.overlayOpacity * 100) + '%';
        root.querySelector('[data-card-character-help]').firstElementChild.textContent = t('characters', String(state.text.value || '').length);
        root.querySelector('[data-card-templates]').querySelectorAll('[data-card-template]').forEach(function (button) { button.setAttribute('aria-pressed', String(!state.libraryTemplateId && button.dataset.cardTemplate === state.templateId)); });
        root.querySelector('[data-card-background-solid]').hidden = state.background.type !== 'solid'; root.querySelector('[data-card-background-gradient]').hidden = state.background.type !== 'gradient'; root.querySelectorAll('[data-card-background-image]').forEach(function (element) { element.hidden = state.background.type !== 'image'; });
        var warning = root.querySelector('[data-card-text-warning]'); if (state.text.value.length > 350) { warning.hidden = false; warning.textContent = t('fitWarning'); } else warning.hidden = true;
        applyLocale();
        syncSocialControls();
    }

    /*
     * Canvas does not trigger a web-font download just because ctx.font uses a
     * family name. Ask the Font Loading API for every family used by the
     * project before measuring or drawing.  The normalizer also keeps old
     * projects that stored "Scheherazade" compatible with the hosted
     * "Scheherazade New" family.
     */
    function ensureFont(fontFamily, size) {
        var family = core.normalizeFontFamily ? core.normalizeFontFamily(fontFamily, 'Noto Nastaliq Urdu') : String(fontFamily || 'Noto Nastaliq Urdu');
        var fontSize = Math.max(1, Number(size) || 16);
        if (!document.fonts || !document.fonts.load) return Promise.resolve(family);
        return document.fonts.load(fontSize + 'px "' + family + '"')
            .then(function () { return document.fonts.ready ? document.fonts.ready.then(function () { return family; }) : family; })
            .catch(function () { return family; });
    }

    function ensureProjectFonts() {
        var requests = [ensureFont(state.text.fontFamily, state.text.fontSize)];
        var attribution = state.attribution;
        if (attribution && attribution.enabled && String(attribution.value || '').trim()) {
            var attributionSize = Math.max(16, Math.round(Number(state.text.fontSize || 64) * (Number(attribution.fontSizeRatio) || .44)));
            requests.push(ensureFont(attribution.fontFamily, attributionSize));
        }
        return Promise.all(requests);
    }
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
    function drawPaperLines(preset, minSide, colour) {
        ctx.save(); ctx.globalAlpha = .16; ctx.strokeStyle = colour; ctx.lineWidth = Math.max(1, minSide * .002);
        for (var y = preset.marginY * 1.15; y < preset.height - preset.marginY * .8; y += minSide * .075) { ctx.beginPath(); ctx.moveTo(preset.marginX * .7, y); ctx.lineTo(preset.width - preset.marginX * .7, y); ctx.stroke(); }
        ctx.globalAlpha = .3; ctx.fillStyle = colour; ctx.beginPath(); ctx.moveTo(preset.width - preset.marginX * .72, 0); ctx.lineTo(preset.width, 0); ctx.lineTo(preset.width, preset.marginY * .72); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    function drawNightSky(preset, minSide, accent) {
        ctx.save(); ctx.globalAlpha = .68; ctx.fillStyle = accent;
        [[.16, .2, .012], [.82, .18, .009], [.25, .75, .008], [.76, .72, .012], [.62, .3, .006], [.4, .14, .006]].forEach(function (star) { ctx.beginPath(); ctx.arc(preset.width * star[0], preset.height * star[1], minSide * star[2], 0, Math.PI * 2); ctx.fill(); });
        ctx.globalAlpha = .18; ctx.beginPath(); ctx.arc(preset.width - preset.marginX * .85, preset.marginY * .9, minSide * .09, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = .9; ctx.fillStyle = preset.width > preset.height ? '#0f172a' : '#101d35'; ctx.beginPath(); ctx.arc(preset.width - preset.marginX * .8 + minSide * .035, preset.marginY * .87, minSide * .08, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    function drawCleanFrame(preset, minSide, accent) {
        ctx.save(); ctx.globalAlpha = .18; ctx.fillStyle = accent; var size = minSide * .085;
        ctx.fillRect(preset.marginX * .5, preset.marginY * .5, size, Math.max(3, minSide * .008)); ctx.fillRect(preset.marginX * .5, preset.marginY * .5, Math.max(3, minSide * .008), size);
        ctx.fillRect(preset.width - preset.marginX * .5 - size, preset.height - preset.marginY * .5 - Math.max(3, minSide * .008), size, Math.max(3, minSide * .008)); ctx.fillRect(preset.width - preset.marginX * .5 - Math.max(3, minSide * .008), preset.height - preset.marginY * .5 - size, Math.max(3, minSide * .008), size); ctx.restore();
    }
    function drawEmeraldGlow(preset, minSide, accent) {
        ctx.save(); var glow = ctx.createRadialGradient(preset.width * .1, preset.height * .1, 0, preset.width * .1, preset.height * .1, minSide * .42); glow.addColorStop(0, accent + '66'); glow.addColorStop(1, accent + '00'); ctx.fillStyle = glow; ctx.fillRect(0, 0, preset.width, preset.height); ctx.globalAlpha = .18; ctx.strokeStyle = accent; ctx.lineWidth = Math.max(2, minSide * .012); ctx.beginPath(); ctx.arc(preset.width - preset.marginX * .55, preset.height - preset.marginY * .55, minSide * .12, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    function drawPhotoBands(preset, minSide, accent) {
        ctx.save(); ctx.globalAlpha = .12; ctx.fillStyle = accent; ctx.translate(preset.width * .5, preset.height * .5); ctx.rotate(-.18); ctx.fillRect(-preset.width * .58, -minSide * .12, preset.width * 1.16, minSide * .035); ctx.fillRect(-preset.width * .58, minSide * .12, preset.width * 1.16, minSide * .018); ctx.restore();
    }
    function drawEducationDetails(preset, minSide, accent) {
        ctx.save(); ctx.globalAlpha = .18; ctx.fillStyle = accent; ctx.fillRect(preset.width - preset.marginX * .78, 0, preset.marginX * .78, preset.height); ctx.globalAlpha = .28; ctx.strokeStyle = accent; ctx.lineWidth = Math.max(2, minSide * .004);
        for (var row = 0; row < 4; row += 1) { var y = preset.marginY * (1.35 + row * .55); ctx.beginPath(); ctx.moveTo(preset.marginX * .7, y); ctx.lineTo(preset.width - preset.marginX * 1.15, y); ctx.stroke(); }
        ctx.globalAlpha = .72; ctx.fillStyle = accent; for (var i = 0; i < 3; i += 1) { ctx.beginPath(); ctx.arc(preset.width - preset.marginX * .38, preset.marginY * (1.2 + i * .55), minSide * .018, 0, Math.PI * 2); ctx.fill(); } ctx.restore();
    }
    function drawMotif(motif, preset, minSide) {
        if (motif === 'sunflower') { drawPetalFlower(preset.marginX * .8, preset.marginY * .7, minSide * .14, 12, '#efc235', '#9b6819', -.2); drawPetalFlower(preset.width - preset.marginX * .72, preset.height - preset.marginY * .64, minSide * .105, 10, '#e6b629', '#9b6819', .2); drawLeaf(preset.marginX * .9, preset.marginY * 1.05, minSide * .2, .4, '#78a15b'); drawLeaf(preset.width - preset.marginX * .75, preset.height - preset.marginY * .95, minSide * .18, 3.6, '#78a15b'); }
        if (motif === 'mandala') { drawMandala(preset.width / 2, preset.height / 2, minSide * .43, '#5c4214', '#fff0a8'); drawPetalFlower(preset.marginX * .62, preset.marginY * .62, minSide * .07, 8, '#fff0a8', '#8a6418', 0); }
        if (motif === 'botanical') { var leaf = '#4e8a59'; drawLeaf(preset.marginX * .55, preset.marginY * .55, minSide * .24, .2, leaf); drawLeaf(preset.marginX * .7, preset.marginY * .82, minSide * .2, .65, leaf); drawLeaf(preset.width - preset.marginX * .58, preset.height - preset.marginY * .62, minSide * .25, 3.35, leaf); drawLeaf(preset.width - preset.marginX * .78, preset.height - preset.marginY * .8, minSide * .18, 3.75, leaf); drawPetalFlower(preset.width - preset.marginX * .58, preset.marginY * .72, minSide * .055, 8, '#e0b331', '#8a6418', 0); }
        if (motif === 'paper') drawPaperLines(preset, minSide, '#a66a36');
        if (motif === 'night') drawNightSky(preset, minSide, '#dbeafe');
        if (motif === 'clean' || motif === 'cream') drawCleanFrame(preset, minSide, motif === 'cream' ? '#b77935' : '#1c8152');
        if (motif === 'emerald') drawEmeraldGlow(preset, minSide, '#d8f36a');
        if (motif === 'photo') drawPhotoBands(preset, minSide, '#ffffff');
        if (motif === 'education') drawEducationDetails(preset, minSide, '#1d5d8f');
    }

    function drawTextObject(objectId, box, preset) {
        var object = state[objectId];
        if (!object || (objectId === 'attribution' && (!object.enabled || !String(object.value || '').trim()))) return null;
        var fontSize = objectId === 'attribution' ? Math.max(16, Math.round(Number(state.text.fontSize || 64) * (Number(object.fontSizeRatio) || .44))) : Number(object.fontSize) || 64;
        var textProject = Object.assign({}, state, { text: Object.assign({}, state.text), attribution: Object.assign({}, state.attribution, { enabled: false, value: '' }) });
        if (objectId === 'attribution') textProject.text = Object.assign({}, state.text, { value: object.value, fontFamily: object.fontFamily || 'Noto Naskh Arabic', fontSize: fontSize, fontMode: 'manual', lineHeight: 1.35, align: state.text.align });
        else textProject.text.fontSize = fontSize;
        var availableHeight = box.height || Math.max(100, preset.height - box.y - preset.marginY);
        var layout = objectId === 'text' && object.fontMode === 'auto' ? core.findBestFontSize(ctx, textProject, { x: box.x, y: box.y, width: box.width, height: availableHeight }) : core.layoutCardText(ctx, textProject, { x: box.x, y: box.y, width: box.width, height: availableHeight });
        if (objectId === 'text') object.fontSize = layout.fontSize || object.fontSize;
        currentLayouts[objectId] = layout;
        if (interactionState.editingObjectId === objectId) return layout;
        ctx.save(); ctx.direction = 'rtl'; ctx.textAlign = state.text.align === 'left' ? 'left' : state.text.align === 'right' ? 'right' : 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = object.color || state.text.color || '#172a21'; var shadow = objectId === 'text' ? shadowFor(state.text.shadow) : null; if (shadow) { ctx.shadowColor = shadow.color; ctx.shadowBlur = shadow.blur; ctx.shadowOffsetY = shadow.y; }
        ctx.font = layout.fontSize + 'px "' + (object.fontFamily || state.text.fontFamily) + '"'; var ascent = layout.fontSize * .88; var y = state.text.verticalAlign === 'top' || objectId === 'attribution' ? box.y + ascent : state.text.verticalAlign === 'bottom' ? box.y + availableHeight - layout.height + ascent : box.y + (availableHeight - layout.height) / 2 + ascent; var x = state.text.align === 'right' ? box.x + box.width : state.text.align === 'left' ? box.x : box.x + box.width / 2;
        layout.lines.forEach(function (line, index) { if (line.text) ctx.fillText(line.text, x, y); y += layout.lineHeight; if (line.isParagraphEnd && index < layout.lines.length - 1) y += layout.lineHeight * .22; });
        ctx.restore();
        return layout;
    }
    function drawCard() {
        var token = ++renderToken;
        var preset = getPreset();
        canvas.width = preset.width; canvas.height = preset.height;
        ctx.clearRect(0, 0, preset.width, preset.height);
        if (state.background.type === 'gradient') { ctx.fillStyle = gradientFor(state.background.gradientId, preset.width, preset.height); ctx.fillRect(0, 0, preset.width, preset.height); } else { ctx.fillStyle = state.background.color || '#ffffff'; ctx.fillRect(0, 0, preset.width, preset.height); }
        if (state.background.type === 'image' && currentAsset) { var placement = core.calculateImagePlacement(currentAsset, preset, state.background.fit, state.background.positionX, state.background.positionY); ctx.save(); if (state.background.blur) ctx.filter = 'blur(' + state.background.blur + 'px)'; ctx.drawImage(currentAsset.image, placement.x, placement.y, placement.width, placement.height); ctx.restore(); } else if (state.background.type === 'image') { ctx.fillStyle = 'rgba(30,50,40,.12)'; ctx.fillRect(0, 0, preset.width, preset.height); }
        if (state.background.type === 'image' && state.background.overlayOpacity) { ctx.fillStyle = state.background.overlayColor + Math.round(state.background.overlayOpacity * 255).toString(16).padStart(2, '0'); ctx.fillRect(0, 0, preset.width, preset.height); }
        var template = core.TEMPLATES.find(function (item) { return item.id === state.templateId; }) || core.TEMPLATES[0];
        var libraryTemplate = templateLibrary && state.libraryTemplateId && Array.isArray(templateLibrary.TEMPLATES) ? templateLibrary.TEMPLATES.find(function (item) { return item.id === state.libraryTemplateId; }) : null;
        var libraryStyle = libraryTemplate && libraryTemplate.style ? libraryTemplate.style : null;
        var minSide = Math.min(preset.width, preset.height);
        var motif = libraryStyle && libraryStyle.id ? libraryStyle.id : template.decoration && template.decoration.motif;
        if (motif) drawMotif(motif, preset, minSide);
        if (template.decoration && template.decoration.border && template.decoration.border.enabled) { ctx.strokeStyle = template.decoration.border.color; ctx.lineWidth = Math.max(2, minSide * .004); ctx.strokeRect(preset.marginX * .55, preset.marginY * .55, preset.width - preset.marginX * 1.1, preset.height - preset.marginY * 1.1); }
        ctx.strokeStyle = template.decoration.accent; ctx.lineWidth = Math.max(3, minSide * .006); if (state.text.align === 'center') ctx.beginPath(), ctx.moveTo(preset.width / 2 - minSide * .09, preset.marginY * .82), ctx.lineTo(preset.width / 2 + minSide * .09, preset.marginY * .82), ctx.stroke(); else ctx.fillRect(state.text.align === 'right' ? preset.width - preset.marginX : preset.marginX, preset.marginY * .82, minSide * .12, Math.max(3, minSide * .006));
        currentLayouts = {};
        drawTextObject('text', objectRect('text'), preset);
        drawTextObject('attribution', objectRect('attribution'), preset);
        if (state.watermark.enabled) { ctx.save(); ctx.direction = 'ltr'; ctx.font = Math.max(16, Math.round(minSide * .018)) + 'px "Segoe UI", Arial, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.72)'; if (state.background.type === 'solid' && !/^#(0|1|2|3)/i.test(state.background.color || '')) ctx.fillStyle = 'rgba(20,50,35,.55)'; ctx.textAlign = state.watermark.position === 'bottom-right' ? 'right' : state.watermark.position === 'bottom-center' ? 'center' : 'left'; var watermarkX = state.watermark.position === 'bottom-right' ? preset.width - preset.marginX : state.watermark.position === 'bottom-center' ? preset.width / 2 : preset.marginX; ctx.fillText('Write-Urdu.com', watermarkX, preset.height - Math.max(30, preset.marginY * .42)); ctx.restore(); }
        if (token === renderToken) { root.querySelector('[data-card-dimensions]').textContent = preset.width + ' × ' + preset.height + ' px'; root.querySelector('[data-accessible-card-text]').textContent = state.text.value; if (currentLayouts.text && currentLayouts.text.overflow && state.text.fontMode === 'manual') setStatus(t('fitWarning'), 'error'); syncSocialControls(); document.dispatchEvent(new CustomEvent('write-urdu:card-rendered', { detail: { preset: preset.id, socialMode: socialConfig && socialConfig.id } })); }
    }
    function requestRender() { if (renderQueued) return; renderQueued = true; window.requestAnimationFrame(function () { renderQueued = false; ensureProjectFonts().then(drawCard); }); }

    function exportMime() { return socialConfig && socialExportFormat === 'jpeg' ? 'image/jpeg' : 'image/png'; }
    function filename() { if (socialConfig && social.safeFilename) return social.safeFilename(state.name || socialConfig.filenamePrefix, socialExportFormat); return core.safeFilename(state.name, 'write-urdu-card') + '-' + new Date().toISOString().slice(0, 10) + '.png'; }
    function exportBlob() { var mime = exportMime(); return new Promise(function (resolve, reject) { canvas.toBlob(function (blob) { blob ? resolve(blob) : reject(new Error('Image generation failed')); }, mime, mime === 'image/jpeg' ? socialJpegQuality : undefined); }); }
    function downloadBlob(blob, name) { var url = URL.createObjectURL(blob); var link = document.createElement('a'); link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000); }
    function exportPng() { if (window.WriteUrduCardStudioInteractionApi && window.WriteUrduCardStudioInteractionApi.commit) window.WriteUrduCardStudioInteractionApi.commit(); if (!state.text.value.trim() || state.text.value === core.DEFAULT_TEXT) { setStatus(t('emptyText'), 'error'); return Promise.reject(new Error('empty')); } setStatus(t('preparing')); return ensureProjectFonts().then(drawCard).then(exportBlob).then(function (blob) { downloadBlob(blob, filename()); setStatus(socialConfig ? ((socialExportFormat === 'jpeg' ? 'JPEG' : 'PNG') + ' downloaded.') : t('downloaded')); return blob; }); }
    function shareCard() { return exportPng().then(function (blob) { var name = filename(); var file = new File([blob], name, { type: exportMime() }); if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) return navigator.share({ files: [file], title: socialConfig ? socialConfig.title : 'Urdu card' }).then(function () { setStatus(t('shared')); }); setStatus(t('shareFallback')); }).catch(function (error) { if (error && error.name === 'AbortError') return; if (error && error.message !== 'empty') setStatus(error.message || 'Unable to export image.', 'error'); }); }

    function bindControls() {
        root.querySelectorAll('[data-card-field]').forEach(function (element) { element.addEventListener('input', function () { userChanged = true; setNested(state, element.dataset.cardField, inputValue(element)); state = core.normalizeCardProject(state); requestRender(); syncControls(); scheduleSave(); }); element.addEventListener('change', function () { userChanged = true; setNested(state, element.dataset.cardField, inputValue(element)); state = core.normalizeCardProject(state); requestRender(); syncControls(); scheduleSave(); }); });
        root.querySelector('[data-card-font-auto]').addEventListener('change', function (event) { userChanged = true; state.text.fontMode = event.target.checked ? 'auto' : 'manual'; document.getElementById('cardFontSize').disabled = event.target.checked; requestRender(); scheduleSave(); });
        root.querySelectorAll('[data-card-action="download"]').forEach(function (button) { button.addEventListener('click', exportPng); }); root.querySelectorAll('[data-card-action="share"]').forEach(function (button) { button.addEventListener('click', shareCard); });
        root.querySelector('[data-card-action="back"]').addEventListener('click', function () { window.location.href = '/'; });
        root.querySelector('[data-card-action="reset"]').addEventListener('click', function () { if (window.confirm(t('resetConfirm'))) { if (window.WriteUrduCardStudioInteractionApi && window.WriteUrduCardStudioInteractionApi.commit) window.WriteUrduCardStudioInteractionApi.commit(); userChanged = true; state = socialConfig && social.applyDefaults ? social.applyDefaults(core, core.createDefaultCardProject(''), socialConfig.id) : core.createDefaultCardProject(''); currentAsset = null; if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl); currentObjectUrl = null; syncControls(); requestRender(); scheduleSave(); } });
        document.getElementById('cardPreset').addEventListener('change', function (event) { if (window.WriteUrduCardStudioInteractionApi && window.WriteUrduCardStudioInteractionApi.commit) window.WriteUrduCardStudioInteractionApi.commit(); userChanged = true; state = core.applyPreset(state, event.target.value); syncControls(); requestRender(); scheduleSave(); });
        document.getElementById('cardImage').addEventListener('change', function (event) { var file = event.target.files && event.target.files[0]; if (!file) return; if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 15 * 1024 * 1024) { setStatus(t('imageError'), 'error'); event.target.value = ''; return; } userChanged = true; var url = URL.createObjectURL(file); var image = new Image(); image.onload = function () { if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl); currentObjectUrl = url; currentAsset = { image: image, width: image.naturalWidth, height: image.naturalHeight }; state.background.type = 'image'; state.background.imageAssetId = state.id + '_image'; syncControls(); requestRender(); scheduleSave(); dbPut('assets', { id: state.background.imageAssetId, projectId: state.id, blob: file, updatedAt: new Date().toISOString() }).catch(function () {}); }; image.onerror = function () { URL.revokeObjectURL(url); setStatus(t('imageError'), 'error'); }; image.src = url; });
        root.querySelector('[data-card-action="remove-image"]').addEventListener('click', function () { userChanged = true; var template = core.TEMPLATES.find(function (item) { return item.id === state.templateId; }) || core.TEMPLATES[0]; state.background.type = template.background.type; state.background.color = template.background.color || state.background.color; state.background.gradientId = template.background.gradientId || null; state.background.imageAssetId = null; currentAsset = null; if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl); currentObjectUrl = null; syncControls(); requestRender(); scheduleSave(); setStatus(t('imageRemoved')); });
        root.querySelector('[data-card-transliteration-retry]').addEventListener('click', initialiseTransliteration);
        if (socialConfig) {
            var socialToggle = root.querySelector('[data-social-safe-toggle]');
            var socialFormat = root.querySelector('[data-social-export-format]');
            var socialQuality = root.querySelector('[data-social-jpeg-quality]');
            var socialCaption = root.querySelector('[data-social-caption]');
            if (socialToggle) socialToggle.addEventListener('change', syncSocialControls);
            if (socialFormat) socialFormat.addEventListener('change', function (event) { socialExportFormat = event.target.value === 'jpeg' ? 'jpeg' : 'png'; syncSocialControls(); });
            if (socialQuality) socialQuality.addEventListener('input', function (event) { socialJpegQuality = Math.max(.6, Math.min(1, Number(event.target.value) || .9)); syncSocialControls(); });
            if (socialCaption) socialCaption.addEventListener('click', copySocialCaption);
        }
    }

    function restoreAsset() { return dbGetAsset(state.background.imageAssetId).then(function (asset) { if (!asset || !asset.blob) return; var url = URL.createObjectURL(asset.blob); var image = new Image(); image.onload = function () { currentObjectUrl = url; currentAsset = { image: image, width: image.naturalWidth, height: image.naturalHeight }; requestRender(); }; image.src = url; }).catch(function () {}); }
    function setInteractionState(next) { interactionState = Object.assign({}, interactionState, next || {}); requestRender(); }
    function updateObjectRect(objectId, rect, options) { setObjectRect(objectId, rect, options); state = core.normalizeCardProject(state); requestRender(); syncControls(); if (!options || options.save !== false) scheduleSave(); }
    function updateObjectText(objectId, value, options) { if (objectId === 'attribution') state.attribution.value = String(value == null ? '' : value); else state.text.value = String(value == null ? '' : value); state = core.normalizeCardProject(state); requestRender(); syncControls(); if (!options || options.save !== false) scheduleSave(); }
    function updateTextStyle(patch, options) { state.text = Object.assign({}, state.text, patch || {}); state = core.normalizeCardProject(state); requestRender(); syncControls(); if (!options || options.save !== false) scheduleSave(); }
    function replaceState(next, options) { state = core.normalizeCardProject(next); requestRender(); syncControls(); if (!options || options.save !== false) scheduleSave(); }
    function setObjectAlignment(value) { state.text.align = ['left', 'center', 'right'].includes(value) ? value : state.text.align; state = core.normalizeCardProject(state); requestRender(); syncControls(); scheduleSave(); }
    function resetObject(objectId) { var preset = getPreset(); state[objectId].transform = core.defaultTransform(preset, objectId); state[objectId].transform.positionCustomized = false; state[objectId].transform.widthCustomized = false; state = core.normalizeCardProject(state); requestRender(); syncControls(); scheduleSave(); }
    function exposeApplication() {
        window.WriteUrduCardStudioApp = {
            getState: function () { return state; },
            getPreset: getPreset,
            getObjectRect: objectRect,
            getObjectValue: activeObjectValue,
            getLayouts: function () { return currentLayouts; },
            getCanvas: function () { return canvas; },
            getArtboard: function () { return root.querySelector('[data-card-artboard]'); },
            updateObjectRect: updateObjectRect,
            updateObjectText: updateObjectText,
            updateTextStyle: updateTextStyle,
            replaceState: replaceState,
            setObjectAlignment: setObjectAlignment,
            resetObject: resetObject,
            setInteractionState: setInteractionState,
            getInteractionState: function () { return interactionState; },
            requestRender: requestRender,
            syncControls: syncControls,
            scheduleSave: scheduleSave,
            ensureFont: ensureFont,
            ensureProjectFonts: ensureProjectFonts,
            notify: notify
        };
    }
    function initialise() {
        fillOptions();
        var incoming = readIncoming();
        var selectedTemplate = readTemplateSelection();
        var saved = incoming || selectedTemplate ? null : readLocalProject();
        if (selectedTemplate && templateLibrary && typeof templateLibrary.applyToCardProject === 'function') {
            state = templateLibrary.applyToCardProject(
                core,
                socialConfig && social.applyDefaults ? social.applyDefaults(core, core.createDefaultCardProject(incoming || ''), socialConfig.id, incoming) : core.createDefaultCardProject(incoming || ''),
                selectedTemplate,
                { useSampleText: incoming == null }
            );
        } else {
            state = core.normalizeCardProject(incoming != null ? (socialConfig && social.applyDefaults ? social.applyDefaults(core, core.createDefaultCardProject(incoming), socialConfig.id, incoming) : core.createDefaultCardProject(incoming)) : saved || (socialConfig && social.applyDefaults ? social.applyDefaults(core, core.createDefaultCardProject(''), socialConfig.id) : state));
        }
        bindControls(); syncControls(); restoreAsset(); exposeApplication(); requestRender(); initialiseTransliteration();
        document.dispatchEvent(new CustomEvent('write-urdu:card-studio-ready'));
        if (!incoming && !saved && !selectedTemplate) {
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
