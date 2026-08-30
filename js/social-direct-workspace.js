(function () {
    'use strict';

    var root = document.querySelector('[data-social-direct-workspace]');
    if (!root) return;

    var mode = root.getAttribute('data-social-direct-workspace');
    var social = window.WriteUrduSocialMaker;
    var core = window.WriteUrduCardStudio;
    var titleMeta = document.querySelector('meta[property="og:title"]');
    var pageTitle = titleMeta && titleMeta.content ? titleMeta.content : document.title;

    function mountWhatsappWorkspace() {
        if (root.querySelector('#cardCanvas')) return;
        root.innerHTML += [
            '<section class="social-maker-direct-task" aria-labelledby="whatsapp-content-title">',
              '<p class="social-maker-eyebrow">1 · Write your status</p><h2 id="whatsapp-content-title">Your Urdu text</h2>',
              '<p class="social-maker-task-copy">Type Roman Urdu word by word, paste Urdu directly, or convert a longer Roman Urdu passage before styling the image.</p>',
              '<div class="batch-transliteration-panel" data-batch-transliteration data-batch-input-mode="card" data-batch-target="#cardText" role="region" aria-labelledby="whatsapp-batch-title"><strong data-batch-title id="whatsapp-batch-title">Two ways to write Urdu</strong><span data-batch-guide>Type Roman Urdu and press Space, or convert a longer passage in one step.</span><small data-batch-note>This is transliteration: it changes sounds into Urdu script, not English meaning.</small><strong data-batch-prompt hidden>Long Roman Urdu text detected. Convert this passage to Urdu script?</strong><button type="button" data-batch-action hidden>Convert passage to Urdu script</button><span data-batch-status role="status" aria-live="polite"></span></div>',
              '<label class="card-studio-label" for="cardText">Status text</label><textarea class="card-studio-textarea" id="cardText" dir="rtl" lang="ur" data-card-field="text.value" placeholder="اپنا اسٹیٹس یہاں لکھیں"></textarea>',
              '<div class="card-studio-transliteration" aria-live="polite"><span data-card-transliteration-status>Roman Urdu input is loading…</span><button class="card-studio-transliteration-retry" type="button" data-card-transliteration-retry hidden>Retry</button></div>',
              '<div class="input-mode-control input-mode-control-card" data-input-mode-control data-input-mode-storage="whatsapp-status" data-input-mode-targets="#cardText,#cardCanvasEditor" role="group" aria-label="Input mode"><span class="input-mode-title" data-input-mode-title>Input mode</span><button type="button" class="input-mode-option" data-input-mode-option="roman" aria-pressed="true">Roman Urdu → Urdu</button><button type="button" class="input-mode-option" data-input-mode-option="direct" aria-pressed="false">Direct Urdu / English</button><span class="input-mode-note" data-input-mode-note>Type Roman Urdu and press Space to convert each word.</span></div>',
              '<p class="card-studio-help" data-card-character-help><span>0 characters</span></p><p class="card-studio-text-warning" data-card-text-warning hidden></p>',
              '<div class="social-maker-direct-export"><p class="social-maker-eyebrow">2 · Check and export</p><h3>Status-safe output</h3><label class="card-studio-check"><input type="checkbox" data-social-safe-toggle checked><span>Show WhatsApp safe-area guide</span></label><label class="card-studio-label" for="socialExportFormat">Download format</label><select class="card-studio-select" id="socialExportFormat" data-social-export-format><option value="png">PNG</option><option value="jpeg">JPEG</option></select><div data-social-quality-wrap hidden><label class="card-studio-label" for="socialJpegQuality">JPEG quality <span data-social-quality-value>90%</span></label><input class="card-studio-range" id="socialJpegQuality" data-social-jpeg-quality type="range" min=".6" max="1" step=".01" value=".9"></div><p class="card-studio-text-warning" data-social-safe-warning hidden></p><div class="social-maker-direct-actions"><button class="card-studio-button primary" type="button" data-card-action="download">Download PNG</button><button class="card-studio-button secondary" type="button" data-card-action="share">Share image</button><button class="card-studio-button" type="button" data-social-caption>Copy text</button></div><p class="social-maker-local-note"><strong>Private by default.</strong> Your text and local background stay in this browser unless you choose to share the downloaded result.</p><div class="card-studio-status" data-card-status aria-live="polite"></div></div>',
            '</section>',
            '<figure class="card-studio-preview social-maker-direct-preview" aria-labelledby="whatsapp-preview-title"><div class="card-studio-artboard-wrap" data-card-artboard><canvas class="card-studio-canvas" id="cardCanvas" aria-hidden="true"></canvas><div class="card-studio-safe-area" data-card-safe-area data-social-only hidden aria-hidden="true"><span data-card-safe-area-label></span></div><div class="card-studio-context-toolbar card-studio-canvas-toolbar" data-card-context-toolbar hidden role="toolbar" aria-label="Selected status text actions"><span class="card-studio-selected-object" data-card-selected-object data-card-i18n="textSelected">Text selected</span><button type="button" class="card-studio-icon-button" data-card-object-action="edit" data-card-tooltip="edit" aria-label="Edit" title="Edit text"><span class="card-toolbar-icon" aria-hidden="true">✎</span><span class="card-toolbar-label" data-card-i18n="edit">Edit</span></button><button type="button" class="card-studio-icon-button" data-card-object-action="align-left" data-card-tooltip="left" aria-label="Left" title="Align left"><span class="card-toolbar-icon" aria-hidden="true">←</span><span class="card-toolbar-label" data-card-i18n="left">Left</span></button><button type="button" class="card-studio-icon-button" data-card-object-action="align-center" data-card-tooltip="centre" aria-label="Centre" title="Align centre"><span class="card-toolbar-icon" aria-hidden="true">↔</span><span class="card-toolbar-label" data-card-i18n="centre">Centre</span></button><button type="button" class="card-studio-icon-button" data-card-object-action="align-right" data-card-tooltip="right" aria-label="Right" title="Align right"><span class="card-toolbar-icon" aria-hidden="true">→</span><span class="card-toolbar-label" data-card-i18n="right">Right</span></button><button type="button" class="card-studio-icon-button" data-card-object-action="reset" data-card-tooltip="resetPosition" aria-label="Reset position" title="Reset text position"><span class="card-toolbar-icon" aria-hidden="true">⌖</span><span class="card-toolbar-label" data-card-i18n="resetPosition">Reset position</span></button><button type="button" class="card-studio-icon-button card-studio-icon-button-success" data-card-object-action="done" data-card-tooltip="done" aria-label="Done" title="Done editing" hidden><span class="card-toolbar-icon" aria-hidden="true">✓</span><span class="card-toolbar-label" data-card-i18n="done">Done</span></button><button type="button" class="card-studio-icon-button card-studio-icon-button-danger" data-card-object-action="cancel" data-card-tooltip="cancel" aria-label="Cancel" title="Cancel editing" hidden><span class="card-toolbar-icon" aria-hidden="true">×</span><span class="card-toolbar-label" data-card-i18n="cancel">Cancel</span></button></div><div class="card-studio-interaction-layer" data-card-interaction-layer tabindex="0" role="group" aria-label="Editable WhatsApp Status preview" aria-describedby="whatsapp-canvas-help"><div class="card-studio-selection-box" data-card-selection-box hidden aria-hidden="true"><span class="card-studio-selection-label" data-card-selection-label></span><button type="button" class="card-studio-resize-handle left" data-card-resize="left" aria-label="Resize text box from the left"></button><button type="button" class="card-studio-resize-handle right" data-card-resize="right" aria-label="Resize text box from the right"></button><button type="button" class="card-studio-font-handle" data-card-resize="font" aria-label="Adjust text size"></button></div><textarea class="card-studio-canvas-editor" id="cardCanvasEditor" data-card-canvas-editor hidden aria-label="Edit selected status text" aria-describedby="whatsapp-canvas-help" lang="ur" dir="auto" autocomplete="off" spellcheck="false"></textarea><div class="card-studio-guides" data-card-guides aria-hidden="true"></div></div><span class="card-studio-dimensions" data-card-dimensions></span></div><p class="card-studio-canvas-help" id="whatsapp-canvas-help">The dashed guide marks the recommended WhatsApp-safe area. Tap or click the text to move, resize or edit it directly.</p><figcaption id="whatsapp-preview-title" class="card-studio-sr-only">Live 1080 × 1920 WhatsApp Status preview. <span data-accessible-card-text></span></figcaption></figure>',
            '<details class="social-maker-direct-refine" open><summary>Refine the status design</summary><div class="social-maker-refine-body"><section><h3>Status style</h3><div class="card-template-grid social-maker-template-grid" data-card-templates role="group" aria-label="Status styles"></div></section><section class="social-maker-refine-grid"><label class="card-studio-label" for="cardFont">Urdu font<select class="card-studio-select" id="cardFont" data-card-field="text.fontFamily"><option>Noto Nastaliq Urdu</option><option>Noto Naskh Arabic</option><option>Amiri</option><option>Lateef</option><option>Scheherazade New</option><option>Tajawal</option></select></label><label class="card-studio-label" for="cardTextColor">Text colour<input class="card-studio-input" id="cardTextColor" data-card-field="text.color" type="color"></label><label class="card-studio-check"><input type="checkbox" data-card-font-auto checked><span>Auto-fit status text</span></label><label class="card-studio-label" for="cardFontSize">Text size <span data-card-font-size-value></span><input class="card-studio-range" id="cardFontSize" data-card-field="text.fontSize" type="range" min="28" max="190" step="1"></label><label class="card-studio-label" for="cardTextAlign">Alignment<select class="card-studio-select" id="cardTextAlign" data-card-field="text.align"><option value="right">Right</option><option value="center">Centre</option><option value="left">Left</option></select></label><label class="card-studio-label" for="cardVerticalAlign">Vertical position<select class="card-studio-select" id="cardVerticalAlign" data-card-field="text.verticalAlign"><option value="top">Top</option><option value="center">Centre</option><option value="bottom">Bottom</option></select></label></section><section><h3>Background</h3><label class="card-studio-label" for="cardBackgroundType">Background type<select class="card-studio-select" id="cardBackgroundType" data-card-field="background.type"><option value="solid">Solid colour</option><option value="gradient">Built-in gradient</option><option value="image">Your image</option></select></label><div data-card-background-solid><label class="card-studio-label" for="cardBackgroundColor">Background colour<input class="card-studio-input" id="cardBackgroundColor" data-card-field="background.color" type="color"></label></div><div data-card-background-gradient><label class="card-studio-label" for="cardGradient">Gradient<select class="card-studio-select" id="cardGradient" data-card-field="background.gradientId"></select></label></div><div class="card-studio-upload" data-card-background-image><label class="card-studio-label" for="cardImage">Local JPG, PNG or WebP<input id="cardImage" type="file" accept="image/jpeg,image/png,image/webp"></label><p class="card-studio-help">The image is decoded locally and is not uploaded.</p><button class="card-studio-button" type="button" data-card-action="remove-image">Remove image</button></div></section></div></details>',
            '<div class="social-maker-engine-support" hidden aria-hidden="true"><select id="cardPreset"></select><input id="cardAttribution" data-card-field="attribution.value" type="text"><input type="checkbox" data-card-field="attribution.enabled"><input id="cardLineHeight" data-card-field="text.lineHeight" type="range"><span data-card-line-height-value></span><select id="cardShadow" data-card-field="text.shadow"><option value="none">None</option><option value="soft">Soft</option><option value="strong">Strong</option></select><select data-card-layout-object><option value="text">Text</option><option value="attribution">Attribution</option></select><input data-card-layout-field="x" type="number"><input data-card-layout-field="y" type="number"><input data-card-layout-field="width" type="range"><button type="button" data-card-layout-action="center-x">Center X</button><button type="button" data-card-layout-action="center-y">Center Y</button><button type="button" data-card-layout-action="reset">Reset layout</button><div data-card-background-image><select id="cardImageFit" data-card-field="background.fit"><option value="cover">Cover</option><option value="contain">Contain</option></select><input id="cardOverlayColor" data-card-field="background.overlayColor" type="color"><input id="cardOverlay" data-card-field="background.overlayOpacity" type="range"><span data-card-overlay-value></span><input id="cardPositionX" data-card-field="background.positionX" type="range"><input id="cardPositionY" data-card-field="background.positionY" type="range"></div><input type="checkbox" data-card-field="watermark.enabled"><select id="cardWatermarkPosition" data-card-field="watermark.position"><option value="bottom-left">Left</option><option value="bottom-center">Centre</option><option value="bottom-right">Right</option></select><button type="button" data-card-action="back">Back</button><button type="button" data-card-action="reset">Reset</button></div>'
        ].join('');
    }

    function ensureCommunityAssetEntry() {
        return new Promise(function (resolve) {
            if (window.WriteUrduCommunityAssetEntry) { resolve(window.WriteUrduCommunityAssetEntry); return; }
            var existing = document.querySelector('script[data-wu-community-asset-entry]');
            if (existing) {
                existing.addEventListener('load', function () { resolve(window.WriteUrduCommunityAssetEntry || null); }, { once: true });
                window.setTimeout(function () { resolve(window.WriteUrduCommunityAssetEntry || null); }, 1600);
                return;
            }
            var script = document.createElement('script');
            script.src = '/js/community-publishing-asset-entry.js';
            script.setAttribute('data-wu-community-asset-entry', '');
            script.onload = function () { resolve(window.WriteUrduCommunityAssetEntry || null); };
            script.onerror = function () { resolve(null); };
            document.head.appendChild(script);
        });
    }

    function mountCommunityButton() {
        var attempts = 0;
        var timer = window.setInterval(function () {
            attempts += 1;
            var container = root.querySelector('.social-maker-direct-actions');
            if (!container && attempts < 100) return;
            window.clearInterval(timer);
            if (!container) return;
            ensureCommunityAssetEntry().then(function (entry) {
                if (!entry) return;
                entry.mountButton(container, function () {
                    var field = document.getElementById('cardText');
                    return field ? field.value : '';
                });
            });
        }, 50);
    }

    function preserveRoleShell() {
        if (document.body.classList.contains('social-maker-embedded')) document.body.classList.remove('social-maker-embedded');
        document.title = pageTitle;
        root.dataset.socialDirectMode = mode;
    }

    function connect() {
        preserveRoleShell();
        var app = window.WriteUrduCardStudioApp;
        var config = social && social.getMode ? social.getMode(mode) : null;
        if (!app || !config || !core) return;
        var current = app.getState();
        if (!current || current.presetId !== config.defaultPreset || current.socialMode !== mode) {
            var next = core.applyPreset(current || core.createDefaultCardProject(''), config.defaultPreset);
            next.socialMode = mode;
            next.name = config.filenamePrefix;
            app.replaceState(core.normalizeCardProject(next), { save: false });
            if (app.scheduleSave) app.scheduleSave();
        }
        app.requestRender();
        window.WriteUrduSocialDirectApp = {
            mode: mode,
            getWorkspaceApp: function () { return app; },
            getCanvas: function () { return app.getCanvas(); },
            getState: function () { return app.getState(); }
        };
        document.dispatchEvent(new CustomEvent('write-urdu:social-direct-ready', { detail: { mode: mode } }));
    }

    if (mode === 'whatsapp') mountWhatsappWorkspace();
    mountCommunityButton();
    preserveRoleShell();
    document.addEventListener('DOMContentLoaded', preserveRoleShell, { once: true });
    if (window.WriteUrduCardStudioApp) connect();
    else document.addEventListener('write-urdu:card-studio-ready', connect, { once: true });
    document.addEventListener('write-urdu:locale-change', preserveRoleShell);
}());
