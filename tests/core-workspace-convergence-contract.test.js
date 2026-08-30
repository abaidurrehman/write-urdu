const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const Convergence = require(path.join(root, 'js', 'core-workspace-convergence.js'));
const Toolbar = require(path.join(root, 'js', 'basic-writer-command-toolbar.js'));
const runtime = fs.readFileSync(path.join(root, 'js', 'core-workspace-convergence.js'), 'utf8');
const toolbarRuntime = fs.readFileSync(path.join(root, 'js', 'basic-writer-command-toolbar.js'), 'utf8');
const basicPublish = fs.readFileSync(path.join(root, 'js', 'basic-writer-publish.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'core-workspace-convergence.css'), 'utf8');
const toolbarCss = fs.readFileSync(path.join(root, 'css', 'basic-writer-command-toolbar.css'), 'utf8');
const nextStepRuntime = fs.readFileSync(path.join(root, 'js', 'workspace-next-step.js'), 'utf8');
const nextStepCss = fs.readFileSync(path.join(root, 'css', 'workspace-next-step.css'), 'utf8');
const spec = fs.readFileSync(path.join(root, 'specs', 'WU-PLAT-003-core-workspace-convergence.md'), 'utf8');
const toolbarSpec = fs.readFileSync(path.join(root, 'specs', 'WU-PLAT-004-basic-writer-command-toolbar.md'), 'utf8');
const shareAddendum = fs.readFileSync(path.join(root, 'specs', 'WU-PLAT-004A-basic-writer-public-share-short-link.md'), 'utf8');
const serviceWorker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const cleanerPage = fs.readFileSync(path.join(root, 'urdu-text-cleaner.html'), 'utf8');
const qrPage = fs.readFileSync(path.join(root, 'qr-code-generator.html'), 'utf8');
const stylishPage = fs.readFileSync(path.join(root, 'stylish-urdu-text-generator.html'), 'utf8');
const nameArtPage = fs.readFileSync(path.join(root, 'urdu-name-art-maker.html'), 'utf8');
const invoicePage = fs.readFileSync(path.join(root, 'urdu-invoice-generator.html'), 'utf8');

assert.deepStrictEqual(Convergence.CORE_ROUTES, ['/', '/urdu-keyboard', '/urdu-editor'], 'Core convergence route ownership changed unexpectedly');
assert.strictEqual(Convergence.coreWorkspace('/'), 'basic');
assert.strictEqual(Convergence.coreWorkspace('/urdu-keyboard.html'), 'keyboard');
assert.strictEqual(Convergence.coreWorkspace('/urdu-editor/'), 'rich');
assert.strictEqual(Convergence.coreWorkspace('/urdu-card-studio'), null);

assert.strictEqual(Convergence.USER_FIRST_LABELS.cleaner, 'Fix broken or badly formatted Urdu text');
assert.strictEqual(Convergence.USER_FIRST_LABELS.image, 'Turn an Urdu screenshot or photo into editable text');
assert.ok(Convergence.LEGACY_TRUST_SELECTORS.includes('.fb-comments'), 'Legacy comments retirement is missing');
assert.ok(Convergence.LEGACY_TRUST_SELECTORS.includes('.twitter-follow-button'), 'Legacy social follow retirement is missing');

assert.match(cleanerPage, /Fix Broken or Badly Formatted Urdu Text/, 'Text Cleaner must lead with the user problem');
assert.match(cleanerPage, /PDF, Word file, website or message/, 'Text Cleaner must name recognizable sources of broken Urdu text');
assert.doesNotMatch(cleanerPage, /Safe code-point|review-only RTL|session-only browser storage/, 'Text Cleaner primary help must not expose implementation language');
assert.match(qrPage, /What should your QR code open or show/, 'QR setup must ask about the user outcome');
assert.doesNotMatch(qrPage, /What would you like to encode|Show encoded content|four-module margin/, 'QR setup must not require encoding or QR-spec vocabulary');
assert.match(stylishPage, /ready to copy, paste and compare/, 'Stylish Text must explain the immediate result');
assert.doesNotMatch(stylishPage, /Results are deterministic and generated locally/, 'Stylish Text results must not expose engineering guarantees');
assert.match(nameArtPage, /Choose your Urdu font/, 'Name Art guidance must lead with a design choice');
assert.doesNotMatch(nameArtPage, /shared renderer|short-lived session storage/, 'Name Art guidance must not expose renderer or storage internals');
assert.match(invoicePage, /Show only what you need/, 'Invoice guidance must explain the user benefit of optional sections');
assert.doesNotMatch(invoicePage, /without exposing the payload|More tools by the same developer/, 'Invoice guidance must not expose implementation nouns or developer-centric framing');

// Runtime assertions below intentionally describe the currently shipped toolbar. WU-PLAT-002H/WU-PLAT-004
// now define the next evidence-backed convergence change; that UI will update these runtime assertions in its implementation PR.
assert.strictEqual(Convergence.BASIC_COMMAND_TOOLBAR_SRC, '/js/basic-writer-command-toolbar.js', 'Basic Writer toolbar loader path drifted');
assert.match(runtime, /data-wu-command-toolbar-transition/, 'Basic Writer command-toolbar transition marker is missing');
assert.match(runtime, /actions\.hidden = false/, 'Current Basic Writer command surface must remain visible while empty until the activation slice replaces it');
assert.match(runtime, /data-wu-core-actionbar', 'pre-editor'/, 'Basic Writer action surface must be treated as pre-editor');
assert.match(runtime, /loadBasicCommandToolbar\(\)/, 'Core convergence must load the dedicated Basic Writer command toolbar');
assert.doesNotMatch(runtime, /parent\.insertBefore\(actions, hint\.nextSibling\)/, 'Legacy post-editor action-bar relocation must be retired');

assert.deepStrictEqual(Toolbar.OUTPUT_ACTIONS, ['pdf', 'word', 'png', 'preview', 'print'], 'Current direct output action order changed unexpectedly');
assert.strictEqual(Toolbar.MOBILE_QUERY, '(max-width: 767px)');
assert.match(toolbarRuntime, /setAction\(share, 'share', 'Share'/, 'Current Share action is missing');
assert.match(toolbarRuntime, /setAction\(copy, 'copy', 'Copy'/, 'Current Copy action is missing');
assert.match(toolbarRuntime, /setAction\(pdf, 'pdf', 'PDF'/, 'Current PDF action is missing');
assert.match(toolbarRuntime, /setAction\(word, 'word', 'Word'/, 'Current Word action is missing');
assert.match(toolbarRuntime, /setAction\(png, 'png', 'PNG'/, 'Current PNG action is missing');
assert.match(toolbarRuntime, /setAction\(preview, 'preview', 'Preview'/, 'Current Preview action is missing');
assert.match(toolbarRuntime, /setAction\(print, 'print', 'Print'/, 'Current Print action is missing');
assert.match(toolbarRuntime, /data-wu-basic-content-action/, 'Current content-dependent toolbar state contract is missing');
assert.match(toolbarRuntime, /button\.disabled = !enabled/, 'Current empty-state commands must use the real disabled property');
assert.match(toolbarRuntime, /data-wu-basic-mobile-outputs/, 'Mobile overflow destination is missing');
assert.match(toolbarRuntime, /compact \? mobileGroup : desktopGroup/, 'Document actions must move into More on small screens');
assert.match(toolbarRuntime, /data-input-mode-control/, 'Existing input-mode control must be reused');
assert.match(toolbarRuntime, /data-wu-basic-mode-helper/, 'Input-mode helper row is missing');
assert.match(toolbarRuntime, /basic-writer-publish\.js/, 'Toolbar Share must load the first-party Basic Writer publisher');
assert.match(toolbarRuntime, /WriteUrduBasicPublish/, 'Toolbar Share must delegate to the Basic Writer public-link adapter');
assert.doesNotMatch(toolbarRuntime, /WriteUrduTools\.share/, 'First-class Basic Share must not fall back to raw text sharing');
assert.match(toolbarRuntime, /removeAttribute\('data-wu-i18n-control'\)/, 'Toolbar ownership must clear stale legacy control labels');
assert.match(toolbarRuntime, /basic_toolbar_action/, 'Toolbar must preserve privacy-safe action telemetry');
assert.doesNotMatch(toolbarRuntime, /navigator\.share/, 'Toolbar itself must not duplicate share implementation');
assert.doesNotMatch(toolbarRuntime, /location\.(?:href|search).*value|URLSearchParams.*transliterateTextarea/, 'Toolbar must not put user text into URLs');

assert.match(basicPublish, /form\.append\('source_tool', 'basic_editor'\)/, 'Basic publisher must identify the Basic Editor source');
assert.match(basicPublish, /form\.append\('public_text', text\)/, 'Basic publisher must send bounded plain text to the first-party share API');
assert.match(basicPublish, /fetch\('\/api\/shares'/, 'Basic publisher must reuse the first-party share API');
assert.match(basicPublish, /write-urdu\.com\/s\/…/, 'Confirmation must explain the Write Urdu short-link contract');
assert.match(basicPublish, /Publish &amp; get short link/, 'Publishing must remain explicit');
assert.match(basicPublish, /buildPreview/, 'Basic publishing must generate a controlled social-preview PNG');
assert.match(basicPublish, /writeUrdu\.shareManagement\.v1/, 'Basic shares must use the shared local management-token store');
assert.match(basicPublish, /writeUrdu\.basicShareLast\.v1/, 'Basic shares should reuse the current unchanged public link from this browser');
assert.match(basicPublish, /navigator\.share\(\{[\s\S]*url: url/, 'Native share must send the Write Urdu public URL after publication');
assert.doesNotMatch(basicPublish, /location\.(?:href|search).*text|URLSearchParams.*text/, 'Basic publisher must never place writing into a URL');

assert.match(toolbarCss, /wu-basic-command--share/, 'Share-first toolbar styling is missing');
assert.match(toolbarCss, /wu-basic-command--copy/, 'Copy secondary styling is missing');
assert.match(toolbarCss, /wu-basic-command--utility/, 'Direct utility styling is missing');
assert.match(toolbarCss, /wu-basic-command--clear/, 'Destructive Clear styling is missing');
assert.match(toolbarCss, /@media \(max-width: 767px\)/, 'Pixel/mobile toolbar behavior is missing');
assert.doesNotMatch(toolbarCss, /position\s*:\s*(?:fixed|sticky)/, 'Basic Writer toolbar must not become fixed/sticky');
assert.match(serviceWorker, /write-urdu-shell-v38/, 'PWA cache must include the latest shared-shell and account-control production fixes');
assert.match(serviceWorker, /basic-writer-command-toolbar\.css/, 'Toolbar CSS must be cached');
assert.match(serviceWorker, /basic-writer-command-toolbar\.js/, 'Toolbar runtime must be cached');
assert.match(serviceWorker, /basic-writer-publish\.js/, 'Basic public-link publisher must be cached');
assert.match(serviceWorker, /card-studio-publish\.css/, 'Shared publish-dialog styling must be cached');

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

// The specification is now intentionally ahead of the shipped toolbar. Guard the revised product decision rather than
// pinning the 2026-08-18 command wall and forcing future UX research to preserve it forever.
assert.match(toolbarSpec, /visibility\/priority model is superseded by `WU-PLAT-002H`/i, 'WU-PLAT-004 must record the evidence-driven visibility reversal');
assert.match(toolbarSpec, /E0 — Empty/, 'WU-PLAT-004 must define the empty-state activation contract');
assert.match(toolbarSpec, /English letters -> Urdu/, 'WU-PLAT-004 must lead with the proven English-letter input job');
assert.match(toolbarSpec, /Copy becomes directly visible\/obvious/, 'WU-PLAT-004 must reveal Copy after first value');
assert.match(toolbarSpec, /Continue with formatting/, 'WU-PLAT-004 must define the substantial-writing Rich escalation');
assert.match(toolbarSpec, /one growth request at a time/i, 'WU-PLAT-004 must defer growth prompts to the shared arbitration rule');

assert.match(shareAddendum, /supersedes WU-PLAT-004 §9\.1/i, 'Public-share addendum must explicitly supersede the old text-only toolbar behavior');
assert.match(shareAddendum, /Publish & get short link/i, 'Public-share addendum must define the first-party short-link share behavior');
assert.match(shareAddendum, /Publishing is \*\*always explicit\*\*/i, 'Explicit-publication guardrail is missing');

console.log('Core workspace convergence contract passed.');
