const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const Registry = require(path.join(root, 'js', 'workspace-journey-registry.js'));
const NextStep = require(path.join(root, 'js', 'workspace-next-step.js'));
const runtime = fs.readFileSync(path.join(root, 'js', 'workspace-next-step.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'workspace-next-step.css'), 'utf8');
const header = fs.readFileSync(path.join(root, 'site-header.js'), 'utf8');
const playwright = fs.readFileSync(path.join(root, 'playwright.config.js'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

assert.strictEqual(NextStep.MAX_VISIBLE, 3, 'Continue with must never expose more than three primary recommendations');
assert.deepStrictEqual(NextStep.SHARED_WORKSPACES, ['basic-writer', 'urdu-keyboard', 'rich-editor', 'text-cleaner'], 'Slice E shared-workspace ownership changed unexpectedly');

const modes = Registry.list({ status: 'current' }).map(workspace => [workspace.id, NextStep.classifyWorkspace(workspace)]);
assert.ok(modes.every(([, mode]) => mode !== 'unavailable'), 'Every current workspace needs an intentional continuation or endpoint mode');
assert.strictEqual(NextStep.classifyWorkspace(Registry.get('card-studio')), 'embedded-endpoint', 'Card Studio completion should remain embedded in its owning workspace');
assert.strictEqual(NextStep.classifyWorkspace(Registry.get('invoice')), 'embedded-endpoint', 'Invoice completion should remain embedded in its owning workspace');
assert.strictEqual(NextStep.classifyWorkspace(Registry.get('image-to-urdu-text')), 'native-continuation', 'OCR should retain its current native result actions until Slice F');
assert.strictEqual(NextStep.classifyWorkspace(Registry.get('voice-typing')), 'native-continuation', 'Voice should retain its current native result actions until Slice F');
assert.strictEqual(NextStep.classifyWorkspace(Registry.get('inpage-converter')), 'native-continuation', 'InPage should retain its current native result actions until Slice F');

const emptyBasic = NextStep.buildModel('basic-writer', { hasContent: false });
assert.strictEqual(emptyBasic.visible.length, 0, 'Empty writer must not show continuation actions before the user has work');

const basic = NextStep.buildModel('basic-writer', { hasContent: true });
assert.deepStrictEqual(basic.visible.map(action => action.id), ['basic-to-rich', 'basic-to-card', 'basic-to-qr'], 'Basic Writer source priority must follow the registry');
assert.strictEqual(basic.more.length, 0, 'Basic Writer should not invent low-value overflow options');
assert.ok(basic.visible.every(action => action.href && action.technicalLabel), 'Recommendations need crawlable fallbacks and recognizable tool context');

const rich = NextStep.buildModel('rich-editor', { hasContent: true });
assert.deepStrictEqual(rich.visible.map(action => action.id), ['rich-to-card', 'rich-to-qr'], 'Rich Editor should recommend only true cross-workspace continuations');
assert.ok(rich.embedded.some(action => action.id === 'rich-export'), 'Rich Editor export must remain an embedded completion action');

const cleaner = NextStep.buildModel('text-cleaner', { hasContent: true });
assert.deepStrictEqual(cleaner.visible.map(action => action.id), ['cleaner-to-basic', 'cleaner-to-rich', 'cleaner-to-card'], 'Cleaner must show its three highest-priority registry actions');
assert.deepStrictEqual(cleaner.more.map(action => action.id), ['cleaner-to-qr'], 'Cleaner overflow should contain only the lower-priority QR transformation');

assert.match(runtime, /<details class=\"wu-continue-more\"><summary>More options<\/summary>/, 'More options must be an accessible disclosure');
assert.match(runtime, /data-wu-continuity-target/, 'Shared actions must reuse the established v2 continuity target contract');
assert.match(runtime, /data-wu-journey-panel/, 'Shared panel must preserve the journey placement contract used by visual tests');
assert.match(runtime, /panel\.hidden = model\.visible\.length === 0/, 'Panel must be result/content-aware');
assert.match(runtime, /data-cleaner-continuity-actions/, 'Slice E must remove the retired duplicate Cleaner action row');
assert.doesNotMatch(css, /position\s*:\s*(?:fixed|sticky)/, 'Continue with panel must never interrupt authoring with fixed/sticky positioning');
assert.match(css, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/, 'Desktop panel should present at most three equal recommendations');
assert.match(css, /@media\(max-width:520px\)/, 'Mobile continuation layout is missing');
assert.match(header, /workspace-next-step\.js/, 'Shared shell must load contextual next steps on supported workspaces');
assert.match(header, /\['\/', '\/urdu-editor', '\/urdu-keyboard', '\/urdu-text-cleaner'\]/, 'Slice E loader must remain scoped to the four v2-ready sources');

const registryPos = header.indexOf("/js/workspace-journey-registry.js");
const handoffPos = header.indexOf("/js/workspace-handoff.js");
const continuityPos = header.indexOf("/js/core-continuity.js");
const nextStepPos = header.indexOf("/js/workspace-next-step.js");
assert.ok(registryPos >= 0 && handoffPos > registryPos && continuityPos > handoffPos && nextStepPos > continuityPos, 'Slice E dependencies must load registry → handoff → continuity → renderer');
assert.match(playwright, /outcome-navigation\.spec\.js/, 'Slice D browser acceptance must be discoverable by Playwright');
assert.match(playwright, /workspace-next-step\.spec\.js/, 'Slice E browser acceptance must be discoverable by Playwright');
assert.match(sw, /js\/workspace-handoff\.js/, 'PWA shell must cache the v2 handoff dependency loaded by Slice E');
assert.match(sw, /js\/core-continuity\.js/, 'PWA shell must cache the continuity dependency loaded by Slice E');

console.log('Contextual workspace next-step contract passed.');