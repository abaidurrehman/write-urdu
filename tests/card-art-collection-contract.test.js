const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// WU-CARD-ART-001: generated card artwork stays in step with the shared background registry.
const root = path.resolve(__dirname, '..');
const registry = require('../js/card-background-registry.js');
const specs = require('../scripts/card-art/design-specs.js').designs;

const generated = registry.backgrounds.filter((item) => item.flagship || item.refined);
assert.strictEqual(new Set(specs.map((spec) => spec.id)).size, specs.length, 'design specs must not repeat an ID');
assert.deepStrictEqual(specs.map((spec) => spec.id).sort(), generated.map((item) => item.id).sort(), 'every generated registry design needs exactly one build spec');
assert.ok(registry.backgrounds.filter((item) => item.flagship).length >= 11, 'the flagship collection must keep at least 11 families');

const families = new Set();
specs.forEach((spec) => {
    const record = registry.getBackgroundById(spec.id);
    assert.ok(record.family, `${spec.id} needs a family`);
    if (record.flagship) {
        assert.ok(!families.has(record.family), `${spec.id}: each flagship must be a distinct family, not a colourway`);
        families.add(record.family);
    }
    assert.strictEqual(record.src, `/assets/card-studio/backgrounds/${spec.id}.webp`);
    assert.strictEqual(record.thumbnailSrc, `/assets/card-studio/backgrounds/thumbs/${spec.id}.webp`);
    assert.ok(fs.existsSync(path.join(root, 'scripts', 'card-art', 'designs', spec.module + '.js')), `${spec.id} design module missing`);
    const safe = record.safeArea;
    assert.ok(safe.top + safe.bottom < 0.8 && safe.left + safe.right < 0.8, `${spec.id} safe area leaves too little room for text`);

    const design = require(path.join(root, 'scripts', 'card-art', 'designs', spec.module + '.js'));
    const markup = design.render(1080, 1350, { palette: spec.palette, layout: spec.layout });
    assert.match(markup, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="1080" height="1350"/, `${spec.id} must render a 1080x1350 SVG`);
    assert.doesNotMatch(markup, /<text|<tspan|<image|href="http/i, `${spec.id} artwork must not contain text, embedded images or remote references`);
    assert.strictEqual(design.render(1080, 1350, { palette: spec.palette, layout: spec.layout }), markup, `${spec.id} must render deterministically`);
});

console.log(`Card art collection contract passed: ${specs.length} generated designs, ${families.size} flagship families.`);
