'use strict';

// Build manifest for generated card artwork: which design module and colourway produces each
// registry background. Registry metadata (safe area, text colour, typography) lives in
// js/card-background-registry.js; tests/card-art-collection-contract.test.js keeps the two in step.

var registry = require('../../js/card-background-registry.js');

var designs = [
    { id: 'royal-mughal-emerald', module: 'royal-mughal', palette: 'emerald' },
    { id: 'rose-garden-blush', module: 'rose-garden', palette: 'blush' },
    { id: 'mehndi-marigold-festival', module: 'mehndi-festival', palette: 'saffron' },
    { id: 'moonlit-poetry-night', module: 'moonlit-poetry', palette: 'indigo' },
    { id: 'jumma-geometry-light', module: 'geometry-light', palette: 'teal' },
    { id: 'editorial-terracotta-block', module: 'editorial-block', palette: 'terracotta' },
    { id: 'phulkari-bagh-madder', module: 'phulkari', palette: 'madder' },
    { id: 'manuscript-paper-ink', module: 'paper-ink', palette: 'natural' },
    { id: 'rain-memory-window', module: 'rain-memory', palette: 'slate' },
    { id: 'dawn-meadow-sunrise', module: 'dawn-meadow', palette: 'peach' },
    { id: 'celebration-balloons', module: 'celebration', palette: 'confetti' },
    // Refined legacy backgrounds: same IDs, new artwork.
    { id: 'ajrak-modern-frame', module: 'ajrak', palette: 'indigo' },
    { id: 'ink-moon-poetry', module: 'ink-wash', palette: 'mist', layout: 'moon' },
    { id: 'quiet-blue-distance', module: 'ink-wash', palette: 'blue', layout: 'distance' },
    { id: 'quiet-moon-sky', module: 'ink-wash', palette: 'night', layout: 'night' },
    { id: 'minimal-cream-poetry', module: 'stationery', palette: 'cream', layout: 'letterpress' },
    { id: 'warm-paper-reflection', module: 'stationery', palette: 'kraft', layout: 'pressed' },
    { id: 'window-light-tea', module: 'home-window', palette: 'morning', layout: 'morning' },
    { id: 'family-warm-interior', module: 'home-window', palette: 'evening', layout: 'evening' },
    { id: 'friendship-bright-modern', module: 'modern-shapes', palette: 'friends', layout: 'friends' },
    { id: 'self-respect-black-sand', module: 'modern-shapes', palette: 'noir', layout: 'noir' },
    { id: 'eid-morning-gold', module: 'crescent', palette: 'eid', layout: 'eid' },
    { id: 'ramadan-lantern-night', module: 'crescent', palette: 'ramadan', layout: 'ramadan' },
    { id: 'pakistan-green-heritage', module: 'crescent', palette: 'pakistan', layout: 'pakistan' },
    { id: 'jumma-midnight-silhouette', module: 'crescent', palette: 'jumma', layout: 'jumma' },
    { id: 'jumma-ivory-geometry', module: 'geometry-light', palette: 'ivory' },
    { id: 'emerald-prayer-light', module: 'geometry-light', palette: 'emerald' },
    { id: 'rose-mist-affection', module: 'rose-garden', palette: 'mist', layout: 'cascade' },
    { id: 'soft-sunrise-garden', module: 'dawn-meadow', palette: 'mint', layout: 'garden' },
    { id: 'rainy-window-reflection', module: 'rain-memory', palette: 'plum' },
    { id: 'truck-art-modern-bloom', module: 'truck-art', palette: 'turquoise' },
    { id: 'emerald-mughal', module: 'mughal-niche', palette: 'emerald', layout: 'niche' },
    { id: 'blush-rose-lanterns', module: 'lantern-garden', palette: 'blush', layout: 'garland' },
    { id: 'midnight-crescent-city', module: 'skyline-scenes', palette: 'city', layout: 'city' },
    { id: 'ivory-arabesque', module: 'gold-ornament', palette: 'ivory', layout: 'illuminated' },
    { id: 'heritage-mughal-garden', module: 'skyline-scenes', palette: 'garden', layout: 'garden' },
    { id: 'burgundy-arch', module: 'mughal-niche', palette: 'burgundy', layout: 'arcade' },
    { id: 'rose-garden-frame', module: 'floral-wreath', palette: 'blush', layout: 'wreath' },
    { id: 'emerald-eid-lanterns', module: 'lantern-garden', palette: 'eid', layout: 'diagonal' },
    { id: 'teal-gold-botanical', module: 'gold-ornament', palette: 'teal', layout: 'vine' },
    { id: 'vintage-floral', module: 'floral-wreath', palette: 'cream', layout: 'dado' },
    { id: 'moonlit-lanterns', module: 'skyline-scenes', palette: 'moonlit', layout: 'moonlit' },
    { id: 'emerald-jasmine-lanterns', module: 'lantern-garden', palette: 'jasmine', layout: 'columns' }
];

function find(id) {
    var spec = designs.find(function (item) { return item.id === id; });
    if (!spec) throw new Error('Unknown design: ' + id);
    var record = registry.getBackgroundById(id) || {};
    return Object.assign({}, record, spec.draft || {}, spec);
}

module.exports = { designs: designs, find: find };
