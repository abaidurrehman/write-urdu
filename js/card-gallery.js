(function (root) {
    'use strict';

    var document = root.document;
    var registry = root.WriteUrduCardBackgroundRegistry;
    var core = root.WriteUrduCardGalleryCore;
    var EXAMPLE_TEXT = 'محبت روشنی ہے';
    var HANDOFF_TTL = 30 * 60 * 1000;
    var LEGACY_INCOMING_KEY = 'writeUrdu.cardGallery.incoming.v1';
    var COPY = {
        en: {
            designs: ' designs', example: 'Example preview', shorter: 'Better for shorter text',
            useDesign: 'Use this design · یہ ڈیزائن استعمال کریں', useDesignLabel: 'Use {name} design in Card Studio',
            tooLong: 'This text is longer than {max} characters. Shorten it before choosing a card so nothing is silently removed.',
            unavailable: 'This browser could not prepare Card Studio. Your text remains here.', empty: 'Write some Urdu before choosing a design.',
            opening: 'Opening Card Studio with your design…', restoredLong: 'Your text is here, but it is longer than {max} characters. Shorten it to {max} characters or fewer to choose a card.',
            restored: 'Your text is ready. Choose a design below.', fits: 'Your text now fits. Choose a design below.',
            inspect: 'Inspect', inspectLabel: 'Inspect {name} larger', compare: 'Compare', compareAdded: 'Added', compareLabel: 'Add {name} to compare', compareRemoveLabel: 'Remove {name} from compare',
            compareFull: 'You can compare up to 3 designs. Remove one to add another.', compareBar: '{n} selected', compareOpen: 'Compare side by side', compareClear: 'Clear',
            close: 'Close', inspectTitle: 'Design preview', compareTitle: 'Compare designs', needText: 'Write some Urdu above to use a design.',
            families: 'Style families', allStyles: 'All styles'
        },
        ur: {
            designs: ' ڈیزائنز', example: 'مثالی پیش منظر', shorter: 'مختصر متن کے لیے بہتر',
            useDesign: 'یہ ڈیزائن استعمال کریں', useDesignLabel: 'کارڈ اسٹوڈیو میں {name} ڈیزائن استعمال کریں',
            tooLong: 'یہ متن {max} حروف سے زیادہ ہے۔ کارڈ منتخب کرنے سے پہلے اسے مختصر کریں تاکہ کوئی حصہ حذف نہ ہو۔',
            unavailable: 'یہ براؤزر کارڈ اسٹوڈیو تیار نہیں کر سکا۔ آپ کا متن یہیں محفوظ ہے۔', empty: 'ڈیزائن منتخب کرنے سے پہلے کچھ اردو لکھیں۔',
            opening: 'آپ کے ڈیزائن کے ساتھ کارڈ اسٹوڈیو کھولا جا رہا ہے…', restoredLong: 'آپ کا متن موجود ہے، مگر یہ {max} حروف سے زیادہ ہے۔ کارڈ منتخب کرنے کے لیے اسے {max} یا اس سے کم حروف تک مختصر کریں۔',
            restored: 'آپ کا متن تیار ہے۔ نیچے کوئی ڈیزائن منتخب کریں۔', fits: 'آپ کا متن اب موزوں ہے۔ نیچے کوئی ڈیزائن منتخب کریں۔',
            inspect: 'بڑا دیکھیں', inspectLabel: '{name} بڑا کر کے دیکھیں', compare: 'موازنہ', compareAdded: 'شامل', compareLabel: '{name} کو موازنے میں شامل کریں', compareRemoveLabel: '{name} کو موازنے سے ہٹائیں',
            compareFull: 'آپ زیادہ سے زیادہ 3 ڈیزائنز کا موازنہ کر سکتے ہیں۔ نیا شامل کرنے کے لیے کوئی ہٹائیں۔', compareBar: '{n} منتخب', compareOpen: 'ساتھ ساتھ موازنہ', compareClear: 'صاف کریں',
            close: 'بند کریں', inspectTitle: 'ڈیزائن کا پیش منظر', compareTitle: 'ڈیزائنز کا موازنہ', needText: 'ڈیزائن استعمال کرنے کے لیے اوپر کچھ اردو لکھیں۔',
            families: 'انداز کے خاندان', allStyles: 'تمام انداز'
        }
    };

    // Families with three or more members get their own filter; smaller ones stay out of the way.
    var FAMILY_MIN_MEMBERS = 3;
    var MAX_COMPARE = 3;
    var FAMILY_NAMES = {
        'crescent': { en: 'Crescent & Eid', ur: 'ہلال و عید' },
        'geometry-light': { en: 'Geometry & Light', ur: 'نقش اور نور' },
        'lantern-garden': { en: 'Lantern Gardens', ur: 'فانوس باغ' },
        'skyline-scenes': { en: 'Skylines & Scenes', ur: 'منظر نامے' },
        'ink-wash': { en: 'Ink Wash', ur: 'روشنائی' }
    };

    function familyLabel(family) {
        var known = FAMILY_NAMES[family];
        if (known) return known[locale()];
        return String(family).replace(/-/g, ' ').replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); });
    }

    function locale() {
        return document.documentElement.lang === 'ur' ? 'ur' : 'en';
    }

    function copyText(key, values) {
        var value = COPY[locale()][key];
        Object.keys(values || {}).forEach(function (name) { value = value.split('{' + name + '}').join(values[name]); });
        return value;
    }

    function normalizedPath() {
        var pathname = String(root.location && root.location.pathname || '/');
        if (root.WriteUrduLocaleRoute) return root.WriteUrduLocaleRoute.productPath(pathname);
        return pathname.replace(/^\/urdu(?=\/|$)/, '')
            .replace(/\.html$/i, '')
            .replace(/\/$/, '') || '/';
    }

    function localizedRoute(productPath) {
        return root.WriteUrduLocaleRoute && root.WriteUrduLocaleRoute.href(productPath, locale()) || productPath;
    }

    function mount() {
        if (normalizedPath() !== '/urdu-card-gallery' || !registry || !core) return false;
        var page = document.querySelector('[data-card-gallery]');
        if (!page || page.dataset.cardGalleryMounted === 'true') return false;

        var input = page.querySelector('[data-card-gallery-input]');
        var filters = page.querySelector('[data-card-gallery-filters]');
        var grid = page.querySelector('[data-card-gallery-grid]');
        var count = page.querySelector('[data-card-gallery-count]');
        var status = page.querySelector('[data-card-gallery-status]');
        var maxTextLength = Number(core.MAX_PREVIEW_TEXT_LENGTH) || 600;
        var state = { text: '', bucket: 'empty', frame: 0, renders: 0, refreshes: 0, overLimit: false };
        var previewRecords = [];

        function telemetry(name, background, category) {
            var client = root.WriteUrduTelemetry;
            if (!client || typeof client.track !== 'function') return;
            client.track(name, {
                background_id: background && background.id || null,
                gallery_category: category || background && background.category || null,
                gallery_text_bucket: state.bucket
            });
        }

        function continuationPath(stage, envelope) {
            var client = root.WriteUrduTelemetry;
            var handoff = root.WriteUrduWorkspaceHandoff;
            if (!client || typeof client.trackContinuationPath !== 'function' || !handoff || typeof handoff.telemetryDetail !== 'function' || !envelope) return;
            client.trackContinuationPath(stage, handoff.telemetryDetail(envelope));
        }

        function readLegacyIncoming() {
            var incoming = null;
            try {
                incoming = JSON.parse(root.sessionStorage.getItem(LEGACY_INCOMING_KEY) || 'null');
                root.sessionStorage.removeItem(LEGACY_INCOMING_KEY);
            } catch (error) {
                incoming = null;
            }
            var created = incoming && Date.parse(incoming.createdAt || '');
            if (!incoming || incoming.version !== 1 || typeof incoming.text !== 'string' || !incoming.text.trim()) return null;
            if (!created || Date.now() - created > HANDOFF_TTL) return null;
            return incoming;
        }

        function incomingText() {
            var handoff = root.WriteUrduWorkspaceHandoff;
            var envelope = handoff && typeof handoff.take === 'function' ? handoff.take('card-gallery') : null;
            if (envelope && envelope.payload && envelope.payload.kind === 'plain-text' && typeof envelope.payload.text === 'string' && envelope.payload.text.trim()) {
                return {
                    text: envelope.payload.text,
                    source: envelope.source && envelope.source.workspace || 'workspace',
                    envelope: envelope
                };
            }
            var legacy = readLegacyIncoming();
            return legacy ? { text: legacy.text, source: legacy.source || 'workspace', envelope: null } : null;
        }

        function previewText() {
            return state.text || EXAMPLE_TEXT;
        }

        function updateCount(visible) {
            count.textContent = visible + copyText('designs');
        }

        function displayName(background) {
            return locale() === 'ur' ? background.nameUr : background.name;
        }

        // Builds the card art with its text inside the design's safe area. Tiles use the small
        // thumbnail; inspect and compare pass full=true to load the full-size image on demand.
        function buildArt(background, full, textValue) {
            var art = document.createElement('div');
            art.className = 'card-gallery-art';
            art.setAttribute('aria-hidden', 'true');

            var image = document.createElement('img');
            image.src = background.thumbnailSrc || background.src;
            if (full) image.src = background.src;
            image.alt = '';
            image.loading = 'lazy';
            if (full) image.loading = 'eager';
            image.decoding = 'async';
            image.width = full ? 1080 : 320;
            image.height = full ? 1350 : 400;
            art.appendChild(image);

            var overlay = document.createElement('span');
            overlay.className = 'card-gallery-overlay';
            overlay.style.backgroundColor = background.overlayColor;
            overlay.style.opacity = String(background.overlayOpacity);
            art.appendChild(overlay);

            var safeArea = document.createElement('div');
            var insets = core.safeAreaStyle(background.safeArea);
            safeArea.className = 'card-gallery-safe-area';
            safeArea.style.top = insets.top;
            safeArea.style.right = insets.right;
            safeArea.style.bottom = insets.bottom;
            safeArea.style.left = insets.left;
            safeArea.style.textAlign = background.preferredAlign;

            var text = document.createElement('p');
            text.className = 'card-gallery-preview-text';
            text.lang = 'ur';
            text.dir = 'rtl';
            text.style.color = background.textColor;
            text.textContent = textValue || EXAMPLE_TEXT;
            safeArea.appendChild(text);
            art.appendChild(safeArea);
            return { art: art, text: text };
        }

        function createPreview(background, target) {
            var article = document.createElement('article');
            article.className = 'card-gallery-card';
            article.dataset.cardGalleryPreview = background.id;
            article.dataset.category = background.category;
            if (background.family) article.dataset.family = background.family;

            var built = buildArt(background, false);
            var art = built.art;
            var text = built.text;

            var example = document.createElement('span');
            example.className = 'card-gallery-example-label';
            example.textContent = copyText('example');
            art.appendChild(example);

            var details = document.createElement('div');
            details.className = 'card-gallery-card-details';
            var names = document.createElement('div');
            names.className = 'card-gallery-card-names';
            var name = document.createElement('h2');
            name.textContent = locale() === 'ur' ? background.nameUr : background.name;
            var nameUr = document.createElement('span');
            nameUr.lang = 'ur';
            nameUr.dir = 'rtl';
            nameUr.textContent = background.nameUr;
            names.appendChild(name);
            names.appendChild(nameUr);

            var fit = document.createElement('span');
            fit.className = 'card-gallery-fit';
            fit.textContent = copyText('shorter');
            fit.hidden = true;
            details.appendChild(names);
            details.appendChild(fit);

            var tools = document.createElement('div');
            tools.className = 'card-gallery-tools';
            var inspect = document.createElement('button');
            inspect.type = 'button';
            inspect.className = 'card-gallery-tool';
            inspect.dataset.cardGalleryInspect = background.id;
            inspect.textContent = copyText('inspect');
            inspect.setAttribute('aria-label', copyText('inspectLabel', { name: displayName(background) }));
            inspect.addEventListener('click', function () { openInspect(background, inspect); });
            var compareButton = document.createElement('button');
            compareButton.type = 'button';
            compareButton.className = 'card-gallery-tool';
            compareButton.dataset.cardGalleryCompare = background.id;
            compareButton.setAttribute('aria-pressed', 'false');
            compareButton.textContent = copyText('compare');
            compareButton.setAttribute('aria-label', copyText('compareLabel', { name: displayName(background) }));
            compareButton.addEventListener('click', function () { toggleCompare(background); });
            tools.appendChild(inspect);
            tools.appendChild(compareButton);

            var choose = document.createElement('button');
            choose.type = 'button';
            choose.className = 'card-gallery-choose';
            choose.dataset.cardGalleryChoose = background.id;
            choose.disabled = true;
            choose.textContent = copyText('useDesign');
            choose.setAttribute('aria-label', copyText('useDesignLabel', { name: locale() === 'ur' ? background.nameUr : background.name }));
            choose.addEventListener('click', function () { startHandoff(background, choose); });
            article.appendChild(art);
            article.appendChild(details);
            article.appendChild(tools);
            article.appendChild(choose);
            target.appendChild(article);

            previewRecords.push({ article: article, text: text, example: example, fit: fit, choose: choose, compare: compareButton, background: background });
        }

        // ---- Inspect and compare -------------------------------------------------------------
        var compareIds = [];
        var inspectDialog = null;
        var compareDialog = null;
        var compareBar = null;
        var lastOpener = null;

        function showDialog(dialog) {
            if (typeof dialog.showModal === 'function') dialog.showModal();
            else dialog.setAttribute('open', '');
        }

        function closeDialog(dialog) {
            if (typeof dialog.close === 'function' && dialog.open) dialog.close();
            else dialog.removeAttribute('open');
            if (lastOpener && document.contains(lastOpener)) lastOpener.focus();
        }

        function makeDialog(kind, titleKey) {
            var dialog = document.createElement('dialog');
            dialog.className = 'card-gallery-dialog';
            dialog.dataset['cardGallery' + kind] = '';
            dialog.setAttribute('aria-label', copyText(titleKey));
            var head = document.createElement('div');
            head.className = 'card-gallery-dialog-head';
            var title = document.createElement('h2');
            title.textContent = copyText(titleKey);
            var close = document.createElement('button');
            close.type = 'button';
            close.className = 'card-gallery-tool card-gallery-dialog-close';
            close.textContent = copyText('close');
            close.addEventListener('click', function () { closeDialog(dialog); });
            head.appendChild(title);
            head.appendChild(close);
            var body = document.createElement('div');
            body.className = 'card-gallery-dialog-body';
            dialog.appendChild(head);
            dialog.appendChild(body);
            dialog.addEventListener('click', function (event) { if (event.target === dialog) closeDialog(dialog); });
            page.appendChild(dialog);
            return dialog;
        }

        // One large card: full-size art, the visitor's own text in the safe area, name, and a
        // choose button. Used by inspect (one card) and compare (up to three).
        function buildLargeCard(background) {
            var article = document.createElement('article');
            article.className = 'card-gallery-card card-gallery-card-large';
            article.dataset.textTier = core.previewTextTier(state.text);
            article.dataset.example = state.bucket === 'empty' ? 'true' : 'false';
            var built = buildArt(background, true, previewText());
            article.appendChild(built.art);
            var details = document.createElement('div');
            details.className = 'card-gallery-card-details';
            var names = document.createElement('div');
            names.className = 'card-gallery-card-names';
            var name = document.createElement('h3');
            name.textContent = displayName(background);
            names.appendChild(name);
            details.appendChild(names);
            var fit = document.createElement('span');
            fit.className = 'card-gallery-fit';
            fit.textContent = copyText('shorter');
            fit.hidden = core.isSuitable(state.bucket, background.textCapacity);
            details.appendChild(fit);
            article.appendChild(details);
            var choose = document.createElement('button');
            choose.type = 'button';
            choose.className = 'card-gallery-choose';
            choose.dataset.cardGalleryChoose = background.id;
            choose.textContent = copyText('useDesign');
            choose.setAttribute('aria-label', copyText('useDesignLabel', { name: displayName(background) }));
            choose.disabled = state.bucket === 'empty' || state.overLimit;
            choose.addEventListener('click', function () { startHandoff(background, choose); });
            article.appendChild(choose);
            return { article: article, text: built.text, fit: fit };
        }

        function fitLarge(cards) {
            // Dialog content is only measurable once the dialog is open and laid out.
            root.requestAnimationFrame(function () {
                cards.forEach(function (card) {
                    var result = core.fitPreviewText(card.text, card.text.parentNode);
                    if (!result.fits && state.bucket !== 'empty') card.fit.hidden = false;
                });
            });
        }

        function openInspect(background, opener) {
            if (!inspectDialog) inspectDialog = makeDialog('Inspect', 'inspectTitle');
            lastOpener = opener || null;
            var body = inspectDialog.querySelector('.card-gallery-dialog-body');
            body.textContent = '';
            var card = buildLargeCard(background);
            body.appendChild(card.article);
            var actions = document.createElement('div');
            actions.className = 'card-gallery-tools';
            var add = document.createElement('button');
            add.type = 'button';
            add.className = 'card-gallery-tool';
            add.dataset.cardGalleryInspectCompare = background.id;
            var refreshAdd = function () {
                var on = compareIds.indexOf(background.id) >= 0;
                add.setAttribute('aria-pressed', on ? 'true' : 'false');
                add.textContent = on ? copyText('compareAdded') : copyText('compare');
            };
            add.addEventListener('click', function () { toggleCompare(background); refreshAdd(); });
            refreshAdd();
            actions.appendChild(add);
            body.appendChild(actions);
            if (card.article.querySelector('.card-gallery-choose').disabled) {
                var hint = document.createElement('p');
                hint.className = 'card-gallery-dialog-hint';
                hint.textContent = copyText(state.overLimit ? 'tooLong' : 'needText', { max: maxTextLength });
                body.appendChild(hint);
            }
            showDialog(inspectDialog);
            fitLarge([card]);
        }

        function openCompare(opener) {
            if (compareIds.length < 2) return;
            if (!compareDialog) compareDialog = makeDialog('Compare', 'compareTitle');
            lastOpener = opener || null;
            var body = compareDialog.querySelector('.card-gallery-dialog-body');
            body.textContent = '';
            var row = document.createElement('div');
            row.className = 'card-gallery-compare-row';
            row.dataset.count = String(compareIds.length);
            var cards = compareIds.map(function (id) { return registry.getBackgroundById(id); }).filter(Boolean).map(function (background) {
                var card = buildLargeCard(background);
                row.appendChild(card.article);
                return card;
            });
            body.appendChild(row);
            showDialog(compareDialog);
            fitLarge(cards);
        }

        function syncCompareUi() {
            previewRecords.forEach(function (record) {
                var on = compareIds.indexOf(record.background.id) >= 0;
                record.compare.setAttribute('aria-pressed', on ? 'true' : 'false');
                record.compare.textContent = on ? copyText('compareAdded') : copyText('compare');
                record.compare.setAttribute('aria-label', copyText(on ? 'compareRemoveLabel' : 'compareLabel', { name: displayName(record.background) }));
            });
            if (!compareBar) {
                compareBar = document.createElement('div');
                compareBar.className = 'card-gallery-compare-bar';
                compareBar.dataset.cardGalleryCompareBar = '';
                var label = document.createElement('span');
                label.dataset.cardGalleryCompareCount = '';
                var open = document.createElement('button');
                open.type = 'button';
                open.className = 'card-gallery-tool card-gallery-compare-open';
                open.dataset.cardGalleryCompareOpen = '';
                open.textContent = copyText('compareOpen');
                open.addEventListener('click', function () { openCompare(open); });
                var clear = document.createElement('button');
                clear.type = 'button';
                clear.className = 'card-gallery-tool';
                clear.textContent = copyText('compareClear');
                clear.addEventListener('click', function () { compareIds = []; syncCompareUi(); });
                compareBar.appendChild(label);
                compareBar.appendChild(open);
                compareBar.appendChild(clear);
                page.appendChild(compareBar);
            }
            compareBar.hidden = compareIds.length === 0;
            compareBar.querySelector('[data-card-gallery-compare-count]').textContent = copyText('compareBar', { n: compareIds.length });
            compareBar.querySelector('[data-card-gallery-compare-open]').disabled = compareIds.length < 2;
        }

        function toggleCompare(background) {
            var index = compareIds.indexOf(background.id);
            if (index >= 0) {
                compareIds.splice(index, 1);
            } else if (compareIds.length >= MAX_COMPARE) {
                status.textContent = copyText('compareFull');
                return;
            } else {
                compareIds.push(background.id);
                status.textContent = '';
            }
            syncCompareUi();
        }

        function startHandoff(background, button) {
            var handoff = root.WriteUrduWorkspaceHandoff;
            var raw = String(input.value || '').replace(/\r\n?/g, '\n');
            if (raw.length > maxTextLength) {
                state.overLimit = true;
                status.textContent = copyText('tooLong', { max: maxTextLength });
                scheduleRefresh();
                input.focus();
                return;
            }
            state.text = core.preserveText(raw);
            state.bucket = core.classifyText(state.text);
            state.overLimit = false;
            if (!state.text.trim() || !handoff || typeof handoff.transfer !== 'function') {
                status.textContent = state.text.trim() ? copyText('unavailable') : copyText('empty');
                return;
            }
            telemetry('card_gallery_design_selected', background);
            var pathDetail = {
                recommendationId: 'gallery-to-card',
                sourceWorkspace: 'card-gallery',
                destinationWorkspace: 'card-studio',
                pathVersion: 'card-gallery-v1',
                releaseMarker: 'wu-card-gallery-s2-2026-09-13-v1',
                handoffRequired: true,
                restoreRequired: true
            };
            if (root.WriteUrduTelemetry && typeof root.WriteUrduTelemetry.trackContinuationPath === 'function') {
                root.WriteUrduTelemetry.trackContinuationPath('selected', pathDetail);
            }
            var result = handoff.transfer({
                sourceWorkspace: 'card-gallery',
                sourceRoute: localizedRoute('/urdu-card-gallery'),
                targetWorkspace: 'card-studio',
                targetRoute: localizedRoute('/urdu-card-studio'),
                actionId: 'gallery-to-card',
                kind: 'visual-project-seed',
                payload: { text: state.text, backgroundId: background.id },
                context: {
                    recommendationId: 'gallery-to-card',
                    pathVersion: 'card-gallery-v1',
                    releaseMarker: 'wu-card-gallery-s2-2026-09-13-v1',
                    textLengthBucket: state.bucket,
                    handoffRequired: true,
                    restoreRequired: true
                }
            });
            if (!result.ok) {
                status.textContent = copyText('unavailable');
                return;
            }
            if (root.WriteUrduTelemetry && typeof root.WriteUrduTelemetry.trackContinuationPath === 'function') {
                root.WriteUrduTelemetry.trackContinuationPath('handoff_created', pathDetail);
            }
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
            status.textContent = copyText('opening');
            telemetry('card_gallery_handoff_started', background);
            if (root.WriteUrduTelemetry && typeof root.WriteUrduTelemetry.flush === 'function') root.WriteUrduTelemetry.flush(true);
            root.location.href = root.location.protocol === 'file:' ? 'urdu-card-studio.html' : (result.route || '/urdu-card-studio');
        }

        function renderShells() {
            var fragment = document.createDocumentFragment();
            registry.getAllBackgrounds().forEach(function (background) {
                createPreview(background, fragment);
            });
            grid.appendChild(fragment);
            state.renders += 1;
            updateCount(previewRecords.length);
        }

        var REFRESH_CHUNK_SIZE = 5;

        function applyPreview(record, value, tier, bucket) {
            record.text.textContent = value;
            record.article.dataset.textTier = tier;
            record.article.dataset.example = bucket === 'empty' ? 'true' : 'false';
            record.article.dataset.overLimit = state.overLimit ? 'true' : 'false';
            record.example.hidden = bucket !== 'empty';
            record.fit.hidden = core.isSuitable(bucket, record.background.textCapacity);
            record.choose.disabled = bucket === 'empty' || state.overLimit;
        }

        function refreshPreviews() {
            state.frame = 0;
            var value = previewText();
            var tier = core.previewTextTier(state.text);
            var bucket = state.bucket;
            var index = 0;

            function step() {
                var end = Math.min(index + REFRESH_CHUNK_SIZE, previewRecords.length);
                for (; index < end; index += 1) {
                    applyPreview(previewRecords[index], value, tier, bucket);
                }
                if (index < previewRecords.length) {
                    root.requestAnimationFrame(step);
                } else {
                    state.refreshes += 1;
                    scheduleFit();
                }
            }

            step();
        }

        // After a refresh settles, shrink any tile whose text overflows its design's safe area;
        // if it still cannot fit, say so on the tile instead of clipping the words.
        var fitTimer = 0;
        function scheduleFit() {
            if (typeof core.fitPreviewText !== 'function') return;
            root.clearTimeout(fitTimer);
            fitTimer = root.setTimeout(fitPreviews, 160);
        }

        function fitPreviews() {
            var index = 0;
            function step() {
                var end = Math.min(index + REFRESH_CHUNK_SIZE, previewRecords.length);
                for (; index < end; index += 1) {
                    var record = previewRecords[index];
                    if (record.article.hidden) continue;
                    var result = core.fitPreviewText(record.text, record.text.parentNode);
                    record.article.dataset.textFits = result.fits ? 'true' : 'false';
                    if (!result.fits && state.bucket !== 'empty') record.fit.hidden = false;
                }
                if (index < previewRecords.length) root.requestAnimationFrame(step);
            }
            step();
        }

        function scheduleRefresh() {
            if (state.frame) return;
            state.frame = root.requestAnimationFrame(refreshPreviews);
        }

        function restoreIncoming() {
            var incoming = incomingText();
            if (!incoming) return false;
            var raw = String(incoming.text || '').replace(/\r\n?/g, '\n');
            input.value = raw;
            state.overLimit = raw.length > maxTextLength;
            state.text = core.preserveText(raw);
            state.bucket = core.classifyText(state.text);
            page.dataset.cardGalleryPrefilled = 'true';
            page.dataset.cardGalleryPrefillSource = incoming.source || 'workspace';
            if (incoming.envelope) {
                continuationPath('destination_ready', incoming.envelope);
                continuationPath('payload_restored', incoming.envelope);
            }
            status.textContent = state.overLimit
                ? copyText('restoredLong', { max: maxTextLength })
                : copyText('restored');
            return true;
        }

        function onInput() {
            var raw = String(input.value || '').replace(/\r\n?/g, '\n');
            var wasOverLimit = state.overLimit;
            state.overLimit = raw.length > maxTextLength;
            state.text = core.preserveText(raw);
            state.bucket = core.classifyText(state.text);
            if (state.bucket !== 'empty' && !page.dataset.cardGalleryFirstInput) {
                page.dataset.cardGalleryFirstInput = 'true';
                telemetry('card_gallery_first_input');
                if (root.WriteUrduTelemetry && typeof root.WriteUrduTelemetry.engage === 'function') root.WriteUrduTelemetry.engage();
            }
            if (state.overLimit) {
                status.textContent = copyText('tooLong', { max: maxTextLength });
            } else if (wasOverLimit) {
                status.textContent = state.bucket === 'empty' ? '' : copyText('fits');
            }
            scheduleRefresh();
        }

        var activeCategory = 'all';
        var activeFamily = 'all';
        var familyRow = document.createElement('div');

        function applyFilters() {
            var visible = 0;
            previewRecords.forEach(function (record) {
                var bg = record.background;
                record.article.hidden = (activeCategory !== 'all' && bg.category !== activeCategory) || (activeFamily !== 'all' && bg.family !== activeFamily);
                if (!record.article.hidden) visible += 1;
            });
            updateCount(visible);
            scheduleFit();
        }

        function selectFilter(button) {
            activeCategory = button.dataset.cardGalleryFilter;
            filters.querySelectorAll('[data-card-gallery-filter]').forEach(function (item) {
                item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
            });
            applyFilters();
            telemetry('card_gallery_category_used', null, activeCategory);
        }

        function selectFamily(button) {
            activeFamily = button.dataset.cardGalleryFamilyFilter;
            familyRow.querySelectorAll('[data-card-gallery-family-filter]').forEach(function (item) {
                item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
            });
            applyFilters();
        }

        registry.getBackgroundCategories().forEach(function (category) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'card-gallery-filter';
            button.dataset.cardGalleryFilter = category.id;
            button.setAttribute('aria-pressed', category.id === 'all' ? 'true' : 'false');
            button.textContent = locale() === 'ur' ? category.nameUr : category.name + ' · ' + category.nameUr;
            button.addEventListener('click', function () { selectFilter(button); });
            filters.appendChild(button);
        });

        // Family filters: only families with enough members to be worth a filter.
        familyRow.className = 'card-gallery-filter-row card-gallery-family-row';
        familyRow.dataset.cardGalleryFamilies = '';
        familyRow.setAttribute('role', 'group');
        familyRow.setAttribute('aria-label', copyText('families'));
        var familyCounts = {};
        registry.getAllBackgrounds().forEach(function (background) {
            if (background.family) familyCounts[background.family] = (familyCounts[background.family] || 0) + 1;
        });
        var familyIds = Object.keys(familyCounts).filter(function (family) { return familyCounts[family] >= FAMILY_MIN_MEMBERS; });
        if (familyIds.length) {
            [{ id: 'all', label: copyText('allStyles') }].concat(familyIds.map(function (family) { return { id: family, label: familyLabel(family) }; })).forEach(function (item) {
                var button = document.createElement('button');
                button.type = 'button';
                button.className = 'card-gallery-filter';
                button.dataset.cardGalleryFamilyFilter = item.id;
                button.setAttribute('aria-pressed', item.id === 'all' ? 'true' : 'false');
                button.textContent = item.label;
                button.addEventListener('click', function () { selectFamily(button); });
                familyRow.appendChild(button);
            });
            // Outside the sticky composer so the pinned header stays short.
            var composerSection = filters.closest('section') || filters.parentNode;
            composerSection.parentNode.insertBefore(familyRow, composerSection.nextSibling);
        }

        renderShells();
        restoreIncoming();
        refreshPreviews();
        telemetry('card_gallery_previews_visible');
        input.addEventListener('input', onInput);
        root.addEventListener('resize', scheduleFit);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleFit);
        page.dataset.cardGalleryMounted = 'true';
        root.WriteUrduCardGalleryApp = {
            getDiagnostics: function () {
                return { shells: previewRecords.length, renders: state.renders, refreshes: state.refreshes, bucket: state.bucket, overLimit: state.overLimit };
            }
        };
        return true;
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
}(window));
