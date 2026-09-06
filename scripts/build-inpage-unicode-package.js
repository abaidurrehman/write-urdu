// Regenerates packages/inpage-unicode/dist/ from the single canonical engine
// file. Runs automatically before `npm pack`/`npm publish` (see the
// package's "prepack" script). Never hand-edit the dist/ output — edit
// js/inpage-unicode-core.js instead and rerun this.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'js', 'inpage-unicode-core.js');
const outDir = path.join(root, 'packages', 'inpage-unicode', 'dist');
const outFile = path.join(outDir, 'inpage-unicode-core.js');

const contents = fs.readFileSync(source, 'utf8');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, contents);

const roundTrip = fs.readFileSync(outFile, 'utf8');
if (roundTrip !== contents) {
  throw new Error('Packaged copy of inpage-unicode-core.js does not match the source byte-for-byte.');
}

console.log(`Packaged ${path.relative(root, source)} -> ${path.relative(root, outFile)} (${contents.length} bytes, verified identical)`);
