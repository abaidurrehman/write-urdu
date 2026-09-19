(function (rootWindow, factory) {
    'use strict';
    var wording = rootWindow && rootWindow.WriteUrduWeddingWording;
    if (!wording && typeof require === 'function') wording = require('./wedding-wording-registry.js');
    var riwaayatManifest = rootWindow && rootWindow.WriteUrduRiwaayatManifest;
    if (!riwaayatManifest && typeof require === 'function') riwaayatManifest = require('./riwaayat-manifest.js');
    var api = factory(wording, riwaayatManifest);
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (rootWindow) rootWindow.WriteUrduWeddingTemplateSelector = api;
}(typeof window !== 'undefined' ? window : null, function (wording, riwaayatManifest) {
    'use strict';
    if (!wording) throw new Error('Wedding wording registry unavailable');
    if (!riwaayatManifest) throw new Error('Riwaayat design manifest unavailable');

    var WORDING_TONES = ['formal', 'informal', 'concise'];
    var DEFAULT_WORDING_TONE = 'formal';
    // The one documented fallback for an ambiguous or unmatched (eventType, language, tone)
    // combination. concise-whatsapp matches every event type and language by design
    // (see js/wedding-wording-registry.js), so it always exists as a safe default.
    var FALLBACK_TEMPLATE_ID = 'concise-whatsapp';

    function selectTemplate(project, event) {
        var language = project && project.invitationLanguage;
        var eventType = event && event.type;
        var tone = (event && WORDING_TONES.indexOf(event.wordingTone) >= 0) ? event.wordingTone : DEFAULT_WORDING_TONE;

        var matches = wording.TEMPLATES.filter(function (template) {
            return template.eventTypes.indexOf(eventType) >= 0 &&
                template.languages.indexOf(language) >= 0 &&
                template.formality === tone;
        });

        return matches.length ? matches[0].id : FALLBACK_TEMPLATE_ID;
    }

    // Palette/motif conventions from published Pakistani wedding invitation design guides
    // (see spec doc §5 for sources) — a bounded configurable model, not an invented standard.
    // Custom events intentionally have no entry: a design palette is never guessed.
    var EVENT_DESIGN_PALETTES = Object.freeze({
        nikah: Object.freeze({ paletteTone: 'reverent', paletteColors: Object.freeze(['deep-green', 'gold', 'ivory']), motifs: Object.freeze(['islamic-geometric', 'crescent', 'nastaliq-calligraphy']) }),
        mehndi: Object.freeze({ paletteTone: 'festive', paletteColors: Object.freeze(['yellow', 'orange', 'marigold']), motifs: Object.freeze(['floral-rose', 'floral-jasmine']) }),
        baraat: Object.freeze({ paletteTone: 'opulent', paletteColors: Object.freeze(['maroon', 'royal-red', 'gold']), motifs: Object.freeze(['paisley', 'mughal-arabesque', 'zari-foil']) }),
        walima: Object.freeze({ paletteTone: 'elegant', paletteColors: Object.freeze(['emerald', 'royal-blue', 'gold', 'silver']), motifs: Object.freeze(['mughal-architectural']) })
    });

    function getDesignPalette(eventType) {
        return EVENT_DESIGN_PALETTES[eventType] || null;
    }

    function suggestBackgroundCategory(project, event) {
        var eventType = event && event.type;
        if (!eventType) return [];
        // Cross-references the Riwaayat art pack's own eventTypes tags (WU-SHAADI-001
        // SVG Art Pack 01) — no invented per-event ranking, just what the pack itself
        // declares it's for. An event type with no matching variant returns empty,
        // never a guess.
        var matches = riwaayatManifest.variants.filter(function (variant) {
            return variant.eventTypes.indexOf(eventType) >= 0;
        });
        return matches.map(function (variant) { return variant.id; }).sort();
    }

    function resolveEventBackground(project, event) {
        var explicit = event && event.selectedBackgroundId;
        if (explicit) return explicit;
        var suggestions = suggestBackgroundCategory(project, event);
        return suggestions.length ? suggestions[0] : null;
    }

    function getBackgroundVariant(variantId) {
        if (!variantId) return null;
        for (var i = 0; i < riwaayatManifest.variants.length; i += 1) {
            if (riwaayatManifest.variants[i].id === variantId) return riwaayatManifest.variants[i];
        }
        return null;
    }

    return {
        WORDING_TONES: WORDING_TONES,
        DEFAULT_WORDING_TONE: DEFAULT_WORDING_TONE,
        FALLBACK_TEMPLATE_ID: FALLBACK_TEMPLATE_ID,
        EVENT_DESIGN_PALETTES: EVENT_DESIGN_PALETTES,
        selectTemplate: selectTemplate,
        getDesignPalette: getDesignPalette,
        suggestBackgroundCategory: suggestBackgroundCategory,
        resolveEventBackground: resolveEventBackground,
        getBackgroundVariant: getBackgroundVariant
    };
}));
