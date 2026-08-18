const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const Convergence = require(path.join(root, 'js', 'core-workspace-convergence.js'));
const Toolbar = require(path.join(root, 'js', 'basic-writer-command-toolbar.js'));
const runtime = fs.readFileSync(path.join(root, 'js', 'core-workspace-convergence.js'), 'utf8');
const toolbarRuntime = fs.readFileSync(path.join(root, 'js', 'basic-writer-command-toolbar.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'core-workspace-convergence.css'), 'utf8');
const toolbarCss = fs.readFileSync(path.join(root, 'css', 'basic-writer-command-toolbar.css'), 'utf8');
const nextStepRuntime = fs.readFileSync(path.join(root, 'js', 'workspace-next-step.js'), 'utf8');
const nextStepCss = fs.readFileSync(path.join(root, 'css', 'workspace-next-step.css'), 'utf8');
const spec = fs.readFileSync(path.join(root, 'specs', 'WU-PLAT-003-core-workspace-convergence.md'), 'utf8');
const toolbarSpec = fs.readFileSync(path.join(root, 'specs', 'WU-PLAT-004-basic-writer-command-toolbar.md'), 'utf8');
const serviceWorker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

assert.deepStrictEqual(Convergence.CORE_ROUTES, ['/', '/urdu-keyboard', '/urdu-editor'], 'Core convergence route ownership changed unexpectedly');
assert.strictEqual(Convergence.coreWorkspace('/'), 'basic');
assert.strictEqual(Convergence.coreWorkspace('/urdu-keyboard.html'), 'keyboard');
assert.strictEqual(Convergence.coreWorkspace('/urdu-editor/'), 'rich');
assert.strictEqual(Convergence.coreWorkspace('/urdu-card-studio'), null);

assert.strictEqual(Convergence.USER_FIRST_LABELS.cleaner, 'Fix broken or badly formatted Urdu text');
assert.strictEqual(Convergence.USER_FIRST_LABELS.image, 'Turn an Urdu screenshot or photo into editable text');
assert.ok(Convergence.LEGACY_TRUST_SELECTORS.includes('.fb-comments'), 'Legacy comments retirement is missing');
assert.ok(Convergence.LEGACY_TRUST_SELECTORS.includes('.twitter-follow-button'), 'Legacy social follow retirement is missing');

assert.strictEqual(Convergence.BASIC_COMMAND_TOOLBAR_SRC, '/js/basic-writer-command-toolbar.js', 'Basic Writer toolbar loader path drifted');
assert.match(runtime, /data-wu-command-toolbar-transition/, 'Basic Writer command-toolbar transition marker is missing');
assert.match(runtime, /actions\.hidden = false/, 'Basic Writer command surface must remain visible while empty');
assert.match(runtime, /data-wu-core-actionbar', 'pre-editor'/, 'Basic Writer action surface must be treated as pre-editor');
assert.match(runtime, /loadBasicCommandToolbar\(\)/, 'Core convergence must load the dedicated Basic Writer command toolbar');
assert.doesNotMatch(runtime, /parent\.insertBefore\(actions, hint\.nextSibling\)/, 'Legacy post-editor action-bar relocation must be retired');

assert.deepStrictEqual(Toolbar.OUTPUT_ACTIONS, ['pdf', 'word', 'png', 'preview', 'print'], 'Direct output action order changed unexpectedly');
assert.strictEqual(Toolbar.MOBILE_QUERY, '(max-width: 767px)');
assert.match(toolbarRuntime, /setAction\(share, 'share', 'Share'/, 'Share must be a first-class toolbar action');
assert.match(toolbarRuntime, /setAction\(copy, 'copy', 'Copy'/, 'Copy must be directly visible');
assert.match(toolbarRuntime, /setAction\(pdf, 'pdf', 'PDF'/, 'PDF must be a direct desktop action');
assert.match(toolbarRuntime, /setAction\(word, 'word', 'Word'/, 'Word must be a direct desktop action');
assert.match(toolbarRuntime, /setAction\(png, 'png', 'PNG'/, 'PNG must be a direct desktop action');
assert.match(toolbarRuntime, /setAction\(preview, 'preview', 'Preview'/, 'Preview must be a direct desktop action');
assert.match(toolbarRuntime, /setAction\(print, 'print', 'Print'/, 'Print must be a direct desktop action');
assert.match(toolbarRuntime, /data-wu-basic-content-action/, 'Content-dependent toolbar state contract is missing');
assert.match(toolbarRuntime, /button\.disabled = !enabled/, 'Empty-state commands must use the real disabled property');
assert.match(toolbarRuntime, /data-wu-basic-mobile-outputs/, 'Mobile overflow destination is missing');
assert.match(toolbarRuntime, /compact \? mobileGroup : desktopGroup/, 'Document actions must move into More on small screens');
assert.match(toolbarRuntime, /data-input-mode-control/, 'Existing input-mode control must be reused');
assert.match(toolbarRuntime, /data-wu-basic-mode-helper/, 'Input-mode helper row is missing');
assert.match(toolbarRuntime, /WriteUrduTools\.share/, 'Created Share fallback must use the existing authoring share API');
assert.match(toolbarRuntime, /basic_toolbar_action/, 'Toolbar must preserve privacy-safe action telemetry');
assert.doesNotMatch(toolbarRuntime, /navigator\.share/, 'Toolbar must not duplicate native share implementation');
assert.doesNotMatch(toolbarRuntime, /location\.(?:href|search).*value|URLSearchParams.*transliterateTextarea/, 'Toolbar must not put user text into URLs');

assert.match(toolbarCss, /wu-basic-command--share/, 'Share-first toolbar styling is missing');
assert.match(toolbarCss, /wu-basic-command--copy/, 'Copy secondary styling is missing');
assert.match(toolbarCss, /wu-basic-command--utility/, 'Direct utility styling is missing');
assert.match(toolbarCss, /wu-basic-command--clear/, 'Destructive Clear styling is missing');
assert.match(toolbarCss, /@media \(max-width: 767px\)/, 'Pixel/mobile toolbar behavior is missing');
assert.doesNotMatch(toolbarCss, /position\s*:\s*(?:fixed|sticky)/, 'Basic Writer toolbar must not become fixed/sticky');
assert.match(serviceWorker, /write-urdu-shell-v22/, 'PWA cache must advance for the new command toolbar runtime');
assert.match(serviceWorker, /basic-writer-command-toolbar\.css/, 'Toolbar CSS must be cached');
assert.match(serviceWorker, /basic-writer-command-toolbar\.js/, 'Toolbar runtime must be cached');

assert.match(runtime, /findCardByHref\(create, '\/urdu-text-cleaner'\)/, 'Text Cleaner taxonomy move is missing');
assert.match(runtime, /findCardByHref\(create, '\/urdu-invoice-generator'\)/, 'Invoice Work taxonomy move is missing');
assert.match(runtime, /docsCard\('\/tools\/urdu-voice-typing'/, 'Voice capture path is missing from documentation convergence');
assert.match(runtime, /docsCard\('\/urdu-ocr'/, 'Image-to-text capture path is missing from documentation convergence');
assert.match(runtime, /docsCard\('\/tools\/inpage-unicode-converter'/, 'InPage capture path is missing from documentation convergence');

assert.match(nextStepRuntime, /rich-editor'\) return root\.document\.querySelector\('\.rich-editor-page \.col-12\.col-md-9 > \.card'\)/, 'Rich continuation must mount against its own post-editor content boundary');
assert.doesNotMatch(nextStepRuntime, /rich-editor'\) return root\.document\.querySelector\('\.fb-comments'\)/, 'Rich continuation must not depend on legacy Facebook comments');
assert.match(nextStepCss, /rich-editor-page .*wu-continue-panel\{order:7/, 'Rich continuation needs an explicit post-editor flex order');
assert.doesNotMatch(css, /position\s*:\s*(?:fixed|sticky)/, 'Core convergence must not introduce fixed/sticky authoring controls');
assert.match(spec, /Make the oldest, most-used parts of Write Urdu feel as intentional as the newest parts/, 'Initiative principle is missing');
assert.match(spec, /Slice D — Urdu Keyboard convergence/, 'Keyboard convergence follow-up is not documented');
assert.match(spec, /Slice E — Rich Editor convergence/, 'Rich Editor convergence follow-up is not documented');
assert.match(toolbarSpec, /Share → Copy → PDF → Word → PNG → Preview → Print → Input mode → More → Clear/, 'Approved command order is missing from WU-PLAT-004');
assert.match(toolbarSpec, /remain visible before typing/i, 'Persistent empty-state toolbar decision is missing');
assert.match(toolbarSpec, /do not duplicate `navigator\.share` logic/i, 'Share adapter guardrail is missing');

console.log('Core workspace convergence contract passed.');