const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const inputMode = read('css', 'input-mode.css');
const voice = read('css', 'voice-discovery.css');
const logo = fs.readFileSync(path.join(root, 'image', 'logo10.png'));

assert.match(inputMode, /\.input-mode-option\.is-active,[\s\S]*\[aria-pressed="true"\][\s\S]*background:\s*#117a43/, 'Active input mode must use the measured accessible green');
assert.match(voice, /@media \(min-width: 900px\)[\s\S]*\.wu-voice-entry-home/, 'Voice discovery must reserve its desktop hero geometry before late CSS arrives');

assert.deepStrictEqual([...logo.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'Primary logo must remain a valid PNG');
const width = logo.readUInt32BE(16);
const height = logo.readUInt32BE(20);
const bitDepth = logo[24];
const colorType = logo[25];
const interlace = logo[28];
assert.strictEqual(width, 256, 'Primary logo must remain 256px wide');
assert.strictEqual(height, 256, 'Primary logo must remain 256px high');
assert.strictEqual(bitDepth, 8, 'Logo coverage guard expects 8-bit PNG');
assert.strictEqual(colorType, 6, 'Logo coverage guard expects RGBA PNG');
assert.strictEqual(interlace, 0, 'Logo coverage guard expects a non-interlaced PNG');

let offset = 8;
const idat = [];
while (offset < logo.length) {
  const length = logo.readUInt32BE(offset);
  const type = logo.toString('ascii', offset + 4, offset + 8);
  if (type === 'IDAT') idat.push(logo.subarray(offset + 8, offset + 8 + length));
  offset += 12 + length;
}
const raw = zlib.inflateSync(Buffer.concat(idat));
const bytesPerPixel = 4;
const stride = width * bytesPerPixel;
let previous = Buffer.alloc(stride);
let cursor = 0;
let minX = width;
let maxX = -1;
let minY = height;
let maxY = -1;

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

for (let y = 0; y < height; y += 1) {
  const filter = raw[cursor++];
  const row = Buffer.from(raw.subarray(cursor, cursor + stride));
  cursor += stride;
  for (let x = 0; x < stride; x += 1) {
    const left = x >= bytesPerPixel ? row[x - bytesPerPixel] : 0;
    const up = previous[x];
    const upLeft = x >= bytesPerPixel ? previous[x - bytesPerPixel] : 0;
    if (filter === 1) row[x] = (row[x] + left) & 255;
    else if (filter === 2) row[x] = (row[x] + up) & 255;
    else if (filter === 3) row[x] = (row[x] + Math.floor((left + up) / 2)) & 255;
    else if (filter === 4) row[x] = (row[x] + paeth(left, up, upLeft)) & 255;
    else assert.strictEqual(filter, 0, `Unsupported PNG filter ${filter}`);
  }
  for (let x = 0; x < width; x += 1) {
    if (row[x * 4 + 3] === 0) continue;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  previous = row;
}

const paintedWidth = maxX - minX + 1;
const paintedHeight = maxY - minY + 1;
assert.ok(paintedWidth >= 120, `Logo artwork is too narrow (${paintedWidth}px); likely cropped during optimization`);
assert.ok(paintedHeight >= 200, `Logo artwork is too short (${paintedHeight}px); likely cropped during optimization`);

console.log(`Lighthouse quick-win batch 3 contract passed (logo coverage ${paintedWidth}x${paintedHeight}).`);
