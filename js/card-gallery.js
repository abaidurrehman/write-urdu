(function (root) {
    'use strict';

    var document = root.document;
    var registry = root.WriteUrduCardBackgroundRegistry;
    var core = root.WriteUrduCardGalleryCore;
    var EXAMPLE_TEXT = 'محبت روشنی ہے';

    function normalizedPath() {
        return String(root.location && root.location.pathname || '/')
            .replace(/\.html$/i, '')
            .replace(/\/$/, '') || '/';
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
        var state = { text: '', bucket: 'empty', frame: 0, renders: 0, refreshes: 0 };
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

        function previewText() {
            return state.text || EXAMPLE_TEXT;
        }

        function updateCount(visible) {
            count.textContent = visible + ' designs';
        }

        function createPreview(background, target) {
            var article = document.createElement('article');
            article.className = 'card-gallery-card';
            article.dataset.cardGalleryPreview = background.id;
            article.dataset.category = background.category;

            var art = document.createElement('div');
            art.className = 'card-gallery-art';
            art.setAttribute('aria-hidden', 'true');

            var image = document.createElement('img');
            image.src = background.thumbnailSrc || background.src;
            image.alt = '';
            image.loading = 'lazy';
            image.decoding = 'async';
            image.width = 320;
            image.height = 400;
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
            text.textContent = EXAMPLE_TEXT;
            safeArea.appendChild(text);
            art.appendChild(safeArea);

            var example = document.createElement('span');
            example.className = 'card-gallery-example-label';
            example.textContent = 'Example preview';
            art.appendChild(example);

            var details = document.createElement('div');
            details.className = 'card-gallery-card-details';
            var names = document.createElement('div');
            names.className = 'card-gallery-card-names';
            var name = document.createElement('h2');
            name.textContent = background.name;
            var nameUr = document.createElement('span');
            nameUr.lang = 'ur';
            nameUr.dir = 'rtl';
            nameUr.textContent = background.nameUr;
            names.appendChild(name);
            names.appendChild(nameUr);

            var fit = document.createElement('span');
            fit.className = 'card-gallery-fit';
            fit.textContent = 'Better for shorter text';
            fit.hidden = true;
            details.appendChild(names);
            details.appendChild(fit);

            var choose = document.createElement('button');
            choose.type = 'button';
            choose.className = 'card-gallery-choose';
            choose.dataset.cardGalleryChoose = background.id;
            choose.disabled = true;
            choose.textContent = 'Use this design · یہ ڈیزائن استعمال کریں';
            choose.setAttribute('aria-label', 'Use ' + background.name + ' design in Card Studio');
            choose.addEventListener('click', function () { startHandoff(background, choose); });
            article.appendChild(art);
            article.appendChild(details);
            article.appendChild(choose);
            target.appendChild(article);

            previewRecords.push({ article: article, text: text, example: example, fit: fit, choose: choose, background: background });
        }

        function startHandoff(background, button) {
            var handoff = root.WriteUrduWorkspaceHandoff;
            state.text = core.preserveText(input.value);
            state.bucket = core.classifyText(state.text);
            if (!state.text.trim() || !handoff || typeof handoff.transfer !== 'function') {
                status.textContent = state.text.trim() ? 'This browser could not prepare Card Studio. Your text remains here.' : 'Write some Urdu before choosing a design.';
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
                sourceRoute: '/urdu-card-gallery',
                targetWorkspace: 'card-studio',
                targetRoute: '/urdu-card-studio',
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
                status.textContent = 'This browser could not prepare Card Studio. Your text remains here.';
                return;
            }
            if (root.WriteUrduTelemetry && typeof root.WriteUrduTelemetry.trackContinuationPath === 'function') {
                root.WriteUrduTelemetry.trackContinuationPath('handoff_created', pathDetail);
            }
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
            status.textContent = 'Opening Card Studio with your design…';
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

        var REFRESH_CHUNK_SIZE = 8;

        function applyPreview(record, value, tier, bucket) {
            record.text.textContent = value;
            record.article.dataset.textTier = tier;
            record.article.dataset.example = bucket === 'empty' ? 'true' : 'false';
            record.example.hidden = bucket !== 'empty';
            record.fit.hidden = core.isSuitable(bucket, record.background.textCapacity);
            record.choose.disabled = bucket === 'empty';
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
                }
            }

            step();
        }

        function scheduleRefresh() {
            if (state.frame) return;
            state.frame = root.requestAnimationFrame(refreshPreviews);
        }

        function onInput() {
            state.text = core.preserveText(input.value);
            state.bucket = core.classifyText(state.text);
            if (state.bucket !== 'empty' && !page.dataset.cardGalleryFirstInput) {
                page.dataset.cardGalleryFirstInput = 'true';
                telemetry('card_gallery_first_input');
                if (root.WriteUrduTelemetry && typeof root.WriteUrduTelemetry.engage === 'function') root.WriteUrduTelemetry.engage();
            }
            scheduleRefresh();
        }

        function selectFilter(button) {
            var category = button.dataset.cardGalleryFilter;
            filters.querySelectorAll('[data-card-gallery-filter]').forEach(function (item) {
                item.setAttribute('aria-pressed', item === button ? 'true' : 'false');
            });
            var visible = 0;
            previewRecords.forEach(function (record) {
                record.article.hidden = category !== 'all' && record.background.category !== category;
                if (!record.article.hidden) visible += 1;
            });
            updateCount(visible);
            telemetry('card_gallery_category_used', null, category);
        }

        registry.getBackgroundCategories().forEach(function (category) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'card-gallery-filter';
            button.dataset.cardGalleryFilter = category.id;
            button.setAttribute('aria-pressed', category.id === 'all' ? 'true' : 'false');
            button.textContent = category.name + ' · ' + category.nameUr;
            button.addEventListener('click', function () { selectFilter(button); });
            filters.appendChild(button);
        });

        renderShells();
        refreshPreviews();
        telemetry('card_gallery_previews_visible');
        input.addEventListener('input', onInput);
        page.dataset.cardGalleryMounted = 'true';
        root.WriteUrduCardGalleryApp = {
            getDiagnostics: function () {
                return { shells: previewRecords.length, renders: state.renders, refreshes: state.refreshes, bucket: state.bucket };
            }
        };
        return true;
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
}(window));
