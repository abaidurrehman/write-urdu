const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const Priority = require(path.join(root, 'js', 'basic-writer-export-priority.js'));
const runtime = fs.readFileSync(path.join(root, 'js', 'basic-writer-export-priority.js'), 'utf8');
const coreRuntime = fs.readFileSync(path.join(root, 'js', 'core-workspace-convergence.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'basic-writer-export-priority.css'), 'utf8');
const serviceWorker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const spec = fs.readFileSync(path.join(root, 'specs', 'WU-PLAT-004C-basic-writer-export-priority.md'), 'utf8');

assert.deepStrictEqual(Priority.DIRECT_EXPORTS, ['pdf', 'word', 'png'], 'The three observed dominant export formats must stay first-level');
assert.strictEqual(Priority.STYLE_HREF, '/css/basic-writer-export-priority.css');
assert.match(runtime, /data-wu-basic-direct-export-row/, 'Direct export row contract is missing');
assert.match(runtime, /DIRECT_EXPORTS = \['pdf', 'word', 'png'\]/, 'Direct export order must remain PDF, Word, PNG');
assert.match(runtime, /moveToDirectRow/, 'Direct export restoration is missing');
assert.match(runtime, /moveIntoDisclosure/, 'Existing disclosure compatibility is missing');
assert.match(runtime, /attributeName === 'aria-expanded'/, 'Disclosure state must drive direct-format movement');
assert.match(runtime, /More export formats/, 'Export overflow needs an accessible label');

assert.match(coreRuntime, /BASIC_EXPORT_PRIORITY_SRC = '\/js\/basic-writer-export-priority\.js'/, 'Core workspace must load the export-priority adapter');
assert.match(coreRuntime, /loadBasicExportPriority\(\)/, 'Export-priority loader must be invoked after the Basic Writer toolbar');

assert.match(css, /wu-basic-command-direct-exports/, 'Direct export cluster styling is missing');
assert.match(css, /wu-basic-command--direct-export/, 'Direct format styling is missing');
assert.match(css, /\.wu-basic-command-mode[\s\S]*flex: 1 1 100%/, 'Input mode must own a deliberate full-width row');
assert.match(css, /@media \(max-width: 767px\)[\s\S]*wu-basic-command-export-priority[\s\S]*width: auto;[\s\S]*flex: 1 1 auto/, 'Compact layouts must keep exports visible without forcing another pre-editor row');
assert.match(css, /min-width: 48px;[\s\S]*min-height: 44px/, 'Compact direct formats need bounded width and safe tap targets');
assert.doesNotMatch(css, /position\s*:\s*(?:fixed|sticky)/, 'Export priority must not create fixed or sticky authoring chrome');

assert.match(serviceWorker, /basic-writer-export-priority\.css/, 'PWA shell must cache the export-priority CSS');
assert.match(serviceWorker, /basic-writer-export-priority\.js/, 'PWA shell must cache the export-priority runtime');

assert.match(spec, /PDF: 1,347/);
assert.match(spec, /Word: 909/);
assert.match(spec, /PNG: 583/);
assert.match(spec, /98\.6%/);
assert.match(spec, /Copy · Preview \| PDF · Word · PNG · ▾ \| Share · Print · More/);

console.log('Basic Writer export priority contract passed.');
