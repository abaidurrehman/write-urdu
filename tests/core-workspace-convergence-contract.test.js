const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const Convergence = require(path.join(root, 'js', 'core-workspace-convergence.js'));
const runtime = fs.readFileSync(path.join(root, 'js', 'core-workspace-convergence.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'core-workspace-convergence.css'), 'utf8');
const nextStepRuntime = fs.readFileSync(path.join(root, 'js', 'workspace-next-step.js'), 'utf8');
const nextStepCss = fs.readFileSync(path.join(root, 'css', 'workspace-next-step.css'), 'utf8');
const spec = fs.readFileSync(path.join(root, 'specs', 'WU-PLAT-003-core-workspace-convergence.md'), 'utf8');

assert.deepStrictEqual(Convergence.CORE_ROUTES, ['/', '/urdu-keyboard', '/urdu-editor'], 'Core convergence route ownership changed unexpectedly');
assert.strictEqual(Convergence.coreWorkspace('/'), 'basic');
assert.strictEqual(Convergence.coreWorkspace('/urdu-keyboard.html'), 'keyboard');
assert.strictEqual(Convergence.coreWorkspace('/urdu-editor/'), 'rich');
assert.strictEqual(Convergence.coreWorkspace('/urdu-card-studio'), null);

assert.strictEqual(Convergence.USER_FIRST_LABELS.cleaner, 'Fix broken or badly formatted Urdu text');
assert.strictEqual(Convergence.USER_FIRST_LABELS.image, 'Turn an Urdu screenshot or photo into editable text');
assert.ok(Convergence.LEGACY_TRUST_SELECTORS.includes('.fb-comments'), 'Legacy comments retirement is missing');
assert.ok(Convergence.LEGACY_TRUST_SELECTORS.includes('.twitter-follow-button'), 'Legacy social follow retirement is missing');

assert.match(runtime, /data-wu-retired-premature-actions/, 'Basic Writer create-toolbar retirement marker is missing');
assert.match(runtime, /actions\.hidden = !hasContent/, 'Basic Writer action bar must remain hidden while empty');
assert.match(runtime, /organizeBasicCompletionActions\(actions\)/, 'Basic Writer completion hierarchy must be normalized');
assert.match(runtime, /data-wu-share-location.*more/, 'Basic Writer text sharing must live under More rather than compete with Copy and Export');
assert.match(runtime, /panel\.insertBefore\(share, panel\.firstChild\)/, 'Basic Writer share action must move into the More menu');
assert.match(runtime, /parent\.insertBefore\(actions, hint\.nextSibling\)/, 'Basic Writer action bar must move below the editor hint');
assert.match(runtime, /findCardByHref\(create, '\/urdu-text-cleaner'\)/, 'Text Cleaner taxonomy move is missing');
assert.match(runtime, /findCardByHref\(create, '\/urdu-invoice-generator'\)/, 'Invoice Work taxonomy move is missing');
assert.match(runtime, /docsCard\('\/tools\/urdu-voice-typing'/, 'Voice capture path is missing from documentation convergence');
assert.match(runtime, /docsCard\('\/urdu-ocr'/, 'Image-to-text capture path is missing from documentation convergence');
assert.match(runtime, /docsCard\('\/tools\/inpage-unicode-converter'/, 'InPage capture path is missing from documentation convergence');

assert.match(nextStepRuntime, /rich-editor'\) return root\.document\.querySelector\('\.rich-editor-page \.col-12\.col-md-9 > \.card'\)/, 'Rich continuation must mount against its own post-editor content boundary');
assert.doesNotMatch(nextStepRuntime, /rich-editor'\) return root\.document\.querySelector\('\.fb-comments'\)/, 'Rich continuation must not depend on legacy Facebook comments');
assert.match(nextStepCss, /rich-editor-page .*wu-continue-panel\{order:7/, 'Rich continuation needs an explicit post-editor flex order');
assert.match(css, /home-actions\[hidden\]/, 'Hidden-empty action bar CSS is missing');
assert.match(css, /\.wu-more-share-action/, 'Basic Writer More-menu share styling is missing');
assert.doesNotMatch(css, /position\s*:\s*(?:fixed|sticky)/, 'Core convergence must not introduce fixed/sticky authoring controls');
assert.match(spec, /Make the oldest, most-used parts of Write Urdu feel as intentional as the newest parts/, 'Initiative principle is missing');
assert.match(spec, /Slice D — Urdu Keyboard convergence/, 'Keyboard convergence follow-up is not documented');
assert.match(spec, /Slice E — Rich Editor convergence/, 'Rich Editor convergence follow-up is not documented');
assert.match(spec, /runtime convergence layer is an intentionally low-risk bridge/i, 'Source-retirement follow-up rule is missing');

console.log('Core workspace convergence contract passed.');