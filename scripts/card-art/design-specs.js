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
    { id: 'celebration-balloons', module: 'celebration', palette: 'confetti' }
];

function find(id) {
    var spec = designs.find(function (item) { return item.id === id; });
    if (!spec) throw new Error('Unknown design: ' + id);
    var record = registry.getBackgroundById(id) || {};
    return Object.assign({}, record, spec.draft || {}, spec);
}

module.exports = { designs: designs, find: find };
