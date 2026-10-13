const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const core = require('../js/wedding-project-core.js');
const designs = require('../js/wedding-design-library.js');

const SIZES = [[1080, 1350], [1080, 1920], [1500, 2100]];
const ids = designs.DESIGNS.map((design) => design.id);

assert.ok(designs.DESIGNS.length >= 12, 'The wedding maker needs a real library, not a demo handful of designs');
assert.equal(new Set(ids).size, ids.length, 'Design ids must be unique');
assert.ok(designs.DESIGNS.some((design) => design.style === 'traditional'), 'Library must include traditional designs');
assert.ok(designs.DESIGNS.some((design) => design.style === 'modern'), 'Library must include modern designs');

function assertBalancedSvg(svg, label) {
  const stack = [];
  const tagPattern = /<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g;
  let match;
  while ((match = tagPattern.exec(svg))) {
    const [, closing, name, , selfClosing] = match;
    if (selfClosing) continue;
    if (closing) {
      assert.equal(stack.pop(), name, `${label}: mismatched </${name}>`);
    } else {
      stack.push(name);
    }
  }
  assert.equal(stack.length, 0, `${label}: unclosed tags ${stack.join(',')}`);
}

for (const design of designs.DESIGNS) {
  assert.ok(designs.STYLES.includes(design.style), `${design.id}: unknown style`);
  assert.ok(design.name && design.blurb, `${design.id}: needs a human name and blurb`);
  assert.ok(design.bestFor.length >= 2, `${design.id}: must declare the events it suits`);
  design.bestFor.forEach((type) => assert.ok(core.EVENT_TYPES.includes(type), `${design.id}: unknown event ${type}`));
  assert.ok(core.LETTERING_STYLES.includes(design.lettering), `${design.id}: unknown lettering default`);
  assert.ok(design.colorways.length >= 2, `${design.id}: needs colour variations`);
  design.colorways.forEach((colorway) => {
    assert.ok(colorway.c.ink && colorway.c.accent && colorway.c.muted, `${design.id}/${colorway.id}: text colours required`);
    assert.equal(colorway.swatch.length, 3, `${design.id}/${colorway.id}: swatch needs three colours`);
  });
  Object.values(design.eventColorways || {}).forEach((colorwayId) => {
    assert.ok(design.colorways.some((colorway) => colorway.id === colorwayId), `${design.id}: event colourway ${colorwayId} missing`);
  });

  for (const [width, height] of SIZES) {
    for (const colorway of design.colorways) {
      const built = designs.buildArt(design.id, colorway.id, design.bestFor[0], width, height);
      const label = `${design.id}/${colorway.id}@${width}x${height}`;
      assert.match(built.svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, `${label}: must be standalone SVG`);
      // Artwork never carries wording or anything executable/external: text is drawn separately.
      assert.doesNotMatch(built.svg, /<text|<script|foreignObject|href="(?!#)|url\((?!#)|NaN|undefined/i, `${label}: unsafe or broken artwork`);
      assertBalancedSvg(built.svg, label);
      const safe = built.safe;
      assert.ok(safe.x >= 0 && safe.y >= 0 && safe.x + safe.w <= width && safe.y + safe.h <= height, `${label}: text area must sit inside the card`);
      assert.ok(safe.w >= width * 0.45 && safe.h >= height * 0.38, `${label}: text area too small for readable Urdu`);
      assert.ok(built.svg.length < 250000, `${label}: artwork unexpectedly heavy`);
    }
  }
}

// Every event type gets a default design that exists, and the main four have real choice.
core.EVENT_TYPES.forEach((type) => assert.ok(designs.getDesign(designs.defaultDesignFor(type)), `${type}: default design missing`));
['nikah', 'mehndi', 'baraat', 'walima'].forEach((type) => {
  const suited = designs.DESIGNS.filter((design) => design.bestFor.includes(type));
  assert.ok(suited.length >= 5, `${type}: needs at least five suited designs (has ${suited.length})`);
  const ordered = designs.designsForEvent(type);
  assert.equal(ordered.length, designs.DESIGNS.length, `${type}: recommendations reorder, never hide, designs`);
  assert.ok(ordered[0].bestFor.includes(type), `${type}: first recommendation must suit the event`);
});

// Colourways follow the event unless chosen explicitly.
const garden = designs.getDesign('mughal-garden');
assert.equal(designs.getColorway(garden, '', 'mehndi').id, 'marigold');
assert.equal(designs.getColorway(garden, '', 'baraat').id, 'burgundy');
assert.equal(designs.getColorway(garden, 'sage', 'mehndi').id, 'sage');
assert.equal(designs.getColorway(garden, 'not-a-colourway', 'nikah').id, garden.colorways[0].id);

// Filters.
assert.ok(designs.filterDesigns('modern', 'nikah').every((design) => design.style === 'modern'));
assert.ok(designs.filterDesigns('walima', 'nikah').every((design) => design.bestFor.includes('walima')));
assert.equal(designs.filterDesigns('all', 'nikah').length, designs.DESIGNS.length);

// Deterministic artwork: the same request always produces the same bytes.
assert.equal(designs.buildArt('watercolour', 'peony', 'walima', 1080, 1350).svg, designs.buildArt('watercolour', 'peony', 'walima', 1080, 1350).svg);

// Unknown or legacy (Riwaayat) design ids fall back to the event default.
assert.equal(designs.buildArt('riwaayat-nikah-ivory', null, 'nikah', 1080, 1350).design.id, designs.defaultDesignFor('nikah'));

// The page must stay asset-light: designs ship as code, not wedding JPEGs.
const pageHtml = fs.readFileSync(path.join(__dirname, '..', 'urdu-wedding-invitation-maker.html'), 'utf8');
assert.doesNotMatch(pageHtml, /\.(jpe?g|webp)["')]/i, 'Wedding maker must not load raster wedding artwork');
assert.doesNotMatch(pageHtml, /<script[^>]+html2canvas/i, 'Wedding maker must not eagerly load html2canvas');
assert.doesNotMatch(pageHtml, /<script[^>]+vendor\/qrcode/i, 'The QR library loads only when a QR is requested');

console.log('wedding design library contract passed');
