(function (root, factory) {
    var api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.WriteUrduWeddingInvitationRenderAdapter = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
    'use strict';

    // Existing Card Studio templates (js/card-studio-core.js TEMPLATES); this adapter
    // references them by id, it never defines new wedding-specific visual templates.
    var DEFAULT_TEMPLATE_ID = 'classic-nastaliq';
    var DEFAULT_PRESET_ID = 'portrait';
    var SAFE_AREA_MARGIN_RATIO = 0.12;

    function hasText(value) {
        return typeof value === 'string' && value.trim().length > 0;
    }

    function firstStrongDirection(value) {
        var text = String(value || '');
        for (var i = 0; i < text.length; i += 1) {
            var code = text.codePointAt(i);
            if ((code >= 0x0600 && code <= 0x06FF) || (code >= 0x0750 && code <= 0x077F) || (code >= 0x08A0 && code <= 0x08FF)) return 'rtl';
            if ((code >= 0x0041 && code <= 0x005A) || (code >= 0x0061 && code <= 0x007A)) return 'ltr';
        }
        return 'rtl';
    }

    // Maps a normalized InvitationViewModel plus its already-rendered wording text into a
    // Card Studio-compatible project seed (js/card-studio-core.js#normalizeCardProject shape).
    //
    // This function does not, and must not:
    // - filter guests or assign events (that is InvitationViewModel's job);
    // - generate or alter wording (wordingText must already be rendered, e.g. by
    //   js/wedding-wording-registry.js);
    // - re-run wedding-domain validation.
    function buildCardStudioSeed(viewModel, wordingText, options) {
        options = options && typeof options === 'object' ? options : {};
        if (!viewModel || typeof viewModel !== 'object') {
            throw new Error('wedding-invitation-render-adapter: viewModel is required');
        }
        if (!hasText(wordingText)) {
            throw new Error('wedding-invitation-render-adapter: wordingText is required (this adapter does not generate wording)');
        }

        var design = viewModel.design && typeof viewModel.design === 'object' ? viewModel.design : {};
        var templateId = design.templateId || DEFAULT_TEMPLATE_ID;
        var presetId = options.presetId || DEFAULT_PRESET_ID;
        var direction = firstStrongDirection(wordingText);

        var background = {};
        if (hasText(design.backgroundId)) {
            background = { type: 'image', imageAssetId: design.backgroundId };
        }

        return {
            version: 2,
            id: 'wedding-seed_' + (viewModel.projectId || 'project') + (viewModel.guestId ? '_' + viewModel.guestId : ''),
            name: 'Wedding invitation card',
            presetId: presetId,
            templateId: templateId,
            text: {
                value: wordingText,
                align: direction === 'rtl' ? 'right' : 'left',
                verticalAlign: 'center',
                lineHeight: 1.8
            },
            attribution: { enabled: false, value: '' },
            background: background,
            // Not part of the native Card Studio project shape; normalizeCardProject carries
            // unknown top-level keys through untouched. Records the two adapter
            // responsibilities (language/direction, safe-area default) that Card Studio's own
            // schema has no field for.
            wedding: {
                sourceEpic: 'WU-SHAADI-001',
                projectId: viewModel.projectId || null,
                guestId: viewModel.guestId || null,
                language: viewModel.language || null,
                direction: direction,
                safeAreaMarginRatio: SAFE_AREA_MARGIN_RATIO
            }
        };
    }

    return {
        DEFAULT_TEMPLATE_ID: DEFAULT_TEMPLATE_ID,
        DEFAULT_PRESET_ID: DEFAULT_PRESET_ID,
        SAFE_AREA_MARGIN_RATIO: SAFE_AREA_MARGIN_RATIO,
        firstStrongDirection: firstStrongDirection,
        buildCardStudioSeed: buildCardStudioSeed
    };
}));
