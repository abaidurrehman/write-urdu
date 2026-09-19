const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'assets', 'wedding-invitations', 'riwaayat', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

assert.strictEqual(manifest.id, 'riwaayat');
assert.strictEqual(manifest.variants.length, 6);
assert.deepStrictEqual(manifest.canvas, { width: 1080, height: 1350, aspectRatio: '4:5' });

const expectedEvents = ['nikah', 'mehndi', 'baraat', 'walima', 'mayun', 'dholki'];
assert.deepStrictEqual(manifest.variants.map((item) => item.eventTypes[0]), expectedEvents);

manifest.variants.forEach((variant) => {
  const fullPath = path.join(root, variant.src.replace(/^\//, ''));
  assert.ok(fs.existsSync(fullPath), `missing SVG: ${variant.src}`);
  const svg = fs.readFileSync(fullPath, 'utf8');

  assert.match(svg, /<svg[^>]+width="1080"[^>]+height="1350"[^>]+viewBox="0 0 1080 1350"/);
  assert.doesNotMatch(svg, /<text\b/i, `${variant.id} must not bake invitation copy into artwork`);
  assert.doesNotMatch(svg, /(?:href|src)="https?:\/\//i, `${variant.id} must not depend on remote assets`);

  const safeWidth = 1 - variant.safeArea.left - variant.safeArea.right;
  const safeHeight = 1 - variant.safeArea.top - variant.safeArea.bottom;
  assert.ok(safeWidth >= 0.60 && safeWidth <= 0.72, `${variant.id} safe width is outside target`);
  assert.ok(safeHeight >= 0.60 && safeHeight <= 0.70, `${variant.id} safe height is outside target`);
});

console.log('WU-SHAADI Riwaayat SVG pack contract passed: 6 event variants.');
