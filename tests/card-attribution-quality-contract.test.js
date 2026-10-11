const assert = require('assert');
const fs = require('fs');
const path = require('path');

// WU-UXR-002 Slice D: legible credit line and clean designer backgrounds (CARD-UX-006, CARD-UX-007).
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const studio = read('js/card-studio.js');
const library = read('js/card-studio-background-library.js');
const whatsapp = read('js/social-direct-workspace.js');
const instagram = read('js/social-direct-instagram.js');

// The background library tells the app how to style the credit line.
assert.match(studio, /updateAttribution:\s*updateAttribution/, 'the app must expose updateAttribution');
assert.match(library, /app\.updateAttribution\(/, 'applying a designer background must restyle the credit line');
assert.match(library, /attributionColor/, 'the credit colour follows the background');
assert.match(library, /FontSizeRatio/, 'the credit size is raised to at least .5');

// Safe area and decoration skip in the renderer.
assert.match(studio, /objectId === 'attribution'/, 'objectTransform handles the credit line');
assert.match(studio, /var designer = state\.background\.type === 'image' && safeAreaInsets\(state\.background\.safeArea\);/, 'drawCard must detect designer backgrounds');
assert.match(studio, /if \(motif && !designer\) drawMotif/, 'motifs are skipped on designer backgrounds');
assert.match(studio, /!designer && template\.decoration && template\.decoration\.border/, 'the template frame is skipped on designer backgrounds');
assert.match(studio, /if \(!designer\) \{ ctx\.strokeStyle = template\.decoration\.accent/, 'the accent is skipped on designer backgrounds');

// Author auto-enables unless the writer unticked it.
assert.match(studio, /attributionUnticked/, 'track that the writer unticked the author box');

// The makers show the author field in the content block.
[whatsapp, instagram].forEach(source => assert.ok(source.includes('Poet / author (optional)'), 'makers label the author field'));
assert.match(studio, /makerAuthor:'[^']*[؀-ۿ][^']*'/, 'Urdu author label for the makers');
const engineBlock = html => (html.match(/social-maker-engine-support[^]*?<button type="button" data-card-action="reset">Reset<\/button><\/div>/) || [''])[0];
[whatsapp, instagram].forEach(source => assert.ok(!/id="cardAttribution"/.test(engineBlock(source)), 'the hidden engine block must not hold #cardAttribution'));

console.log('card-attribution-quality contract passed');
