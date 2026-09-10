const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pngPath = path.join(root, 'image', 'logo10.png');
const svgPath = path.join(root, 'image', 'logo.svg');

assert.ok(fs.existsSync(pngPath), 'Primary PNG logo must remain available for social/schema/export compatibility');
assert.ok(fs.existsSync(svgPath), 'Vector source logo must remain available');

const pngBytes = fs.statSync(pngPath).size;
assert.ok(pngBytes <= 40000, `Primary PNG logo is ${pngBytes} bytes; keep it at or below 40 KB`);

console.log(`Logo asset budget contract passed (${pngBytes} bytes).`);
