(function (rootWindow, factory) {
    'use strict';
    var wording = rootWindow && rootWindow.WriteUrduWeddingWording;
    if (!wording && typeof require === 'function') wording = require('./wedding-wording-registry.js');
    var backgroundRegistry = rootWindow && rootWindow.WriteUrduCardBackgroundRegistry;
    if (!backgroundRegistry && typeof require === 'function') backgroundRegistry = require('./card-background-registry.js');
    var api = factory(wording, backgroundRegistry);
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (rootWindow) rootWindow.WriteUrduWeddingTemplateSelector = api;
}(typeof window !== 'undefined' ? window : null, function (wording, backgroundRegistry) {
    'use strict';
    if (!wording) throw new Error('Wedding wording registry unavailable');
    if (!backgroundRegistry) throw new Error('Card background registry unavailable');

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
        if (!getDesignPalette(eventType)) return [];
        // The registry has no per-event-type tags yet (only a single generic "wedding"
        // category — see spec §5), so every known wedding event type gets the same
        // cross-referenced suggestion until finer-grained assets are produced
        // (tracked in specs/BACKLOG.md P1.10). This is honest about the current data,
        // not a fabricated per-event ranking.
        var matches = backgroundRegistry.getAllBackgrounds().filter(function (background) {
            return background.category === 'wedding' && background.goodFor.indexOf('wedding') >= 0;
        });
        return matches.map(function (background) { return background.id; }).sort();
    }

    return {
        WORDING_TONES: WORDING_TONES,
        DEFAULT_WORDING_TONE: DEFAULT_WORDING_TONE,
        FALLBACK_TEMPLATE_ID: FALLBACK_TEMPLATE_ID,
        EVENT_DESIGN_PALETTES: EVENT_DESIGN_PALETTES,
        selectTemplate: selectTemplate,
        getDesignPalette: getDesignPalette,
        suggestBackgroundCategory: suggestBackgroundCategory
    };
}));
