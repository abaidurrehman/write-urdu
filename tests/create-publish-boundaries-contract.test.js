const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const BaseRegistry = require('../js/workspace-journey-registry.js');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const extension = read('js/create-publish-boundaries-registry.js');
const templateBoundary = read('js/template-library-boundary.js');
const cardAdapter = read('js/card-studio-handoff-adapter.js');
const qrAdapter = read('js/qr-handoff-adapter.js');
const templateHtml = read('urdu-templates.html');
const qrHtml = read('qr-code-generator.html');
const sharePage = read('js/share-page.js');
const shareFunction = read('functions/s/[id].js');
const shell = read('site-header.js');
const sw = read('sw.js');

const context = { window: { WriteUrduWorkspaceRegistry: BaseRegistry }, console };
vm.runInNewContext(extension, context, { filename: 'create-publish-boundaries-registry.js' });
const Registry = context.window.WriteUrduWorkspaceRegistry;

assert.deepEqual(Registry.validate(), [], 'Slice G registry extension must remain valid');
assert.ok(Registry.get('basic-writer').next.some(edge => edge.id === 'basic-to-templates' && edge.target === 'templates' && edge.payloadKind === 'plain-text'), 'Basic Writer must offer Templates as a lower-priority handoff');
assert.ok(Registry.get('public-share').next.some(edge => edge.id === 'share-to-qr' && edge.target === 'qr-generator' && edge.type === 'transformation'), 'Public share must expose QR as a governed transformation');
assert.ok(Registry.get('templates').next.some(edge => edge.id === 'template-to-card' && edge.payloadKind === 'template-seed'), 'Templates must route through a template seed owned by Card Studio');
assert.ok(!Registry.get('rich-editor').next.some(edge => edge.target === 'invoice'), 'Rich Editor must not gain a generic Invoice handoff');

const invoice = Registry.get('invoice');
assert.ok(invoice.next.some(edge => edge.id === 'invoice-payment-qr' && edge.type === 'embedded' && !edge.target), 'Invoice payment QR must remain embedded');
assert.ok(invoice.next.every(edge => edge.type === 'embedded'), 'Invoice completion must remain inside the Invoice workspace');
['card-studio', 'whatsapp-status', 'instagram-post', 'qr-generator'].forEach(id => {
  const workspace = Registry.get(id);
  const completionEdges = workspace.next.filter(edge => edge.id.includes('download') || edge.id.includes('publish') || edge.id.includes('caption'));
  assert.ok(completionEdges.every(edge => edge.type === 'embedded'), `${id} completion actions must remain embedded`);
});

assert.match(templateBoundary, /runtime\.transfer\(\{/, 'Template selection must use the v2 handoff runtime');
assert.match(templateBoundary, /kind: 'template-seed'/, 'Template selection must carry a bounded template seed');
assert.match(templateBoundary, /payload: \{ templateId: template\.id, text: text \}/, 'Template seed must keep optional current text separate from template metadata');
assert.match(templateBoundary, /ownerWorkspace/, 'Template destination ownership must be explicit and future-extensible');
assert.match(templateBoundary, /data-template-staged-text/, 'Template Library must acknowledge staged writing before selection');
assert.doesNotMatch(templateBoundary, /[?&](?:text|content|payload)=/, 'Template handoff must never put user writing in the URL');
assert.match(templateHtml, /workspace-journey-registry\.js/, 'Template Library must load the journey registry');
assert.match(templateHtml, /workspace-handoff\.js/, 'Template Library must load the v2 handoff runtime');
assert.match(templateHtml, /template-library-boundary\.js/, 'Template Library must load the Slice G producer adapter');

assert.match(cardAdapter, /handoff\.peek\(TARGET\)/, 'Card adapter must inspect a seed before consuming one-time state');
assert.ok(cardAdapter.indexOf('handoff.peek(TARGET)') < cardAdapter.indexOf('handoff.take(TARGET)'), 'Card adapter must peek before take');
assert.match(cardAdapter, /applyToRunningApp/, 'Card adapter must remain safe whether it loads before or after Card Studio initialization');
assert.match(shell, /card-studio-handoff-adapter\.js/, 'Shared shell must load the Card Studio destination adapter on its owner route');

assert.match(qrHtml, /workspace-handoff\.js[\s\S]*qr-handoff-adapter\.js[\s\S]*qr-generator\.js/, 'QR v2 adapter must run before the mature QR engine');
assert.match(qrAdapter, /handoff\.take\(TARGET\)/, 'QR destination must consume the v2 envelope');
assert.match(qrAdapter, /writeUrdu\.qrGenerator\.incoming/, 'QR adapter must bridge to the proven local QR consumer shape');

assert.match(sharePage, /transfer\('basic-writer', 'share-to-basic', publicText\(\)/, 'Use this text must continue into Basic Writer');
assert.match(sharePage, /transfer\('card-studio', 'share-to-card', publicText\(\), 'create'\)/, 'Create your own design must seed Card Studio');
assert.match(sharePage, /transfer\('qr-generator', 'share-to-qr', publicUrl\(\)/, 'Public share QR must encode the public URL');
assert.doesNotMatch(sharePage, /writeUrdu\.cardStudio\.incoming/, 'Public share must not write Card Studio legacy state directly');
assert.doesNotMatch(sharePage, /payload:\s*\{\s*text:\s*[^}]*window\.location\.href/, 'Public URL handoff should use the normalized publicUrl helper');
assert.match(shareFunction, /data-share-qr/, 'Public share page must expose the QR continuation action');
assert.match(shareFunction, /workspace-journey-registry\.js[\s\S]*create-publish-boundaries-registry\.js[\s\S]*workspace-handoff\.js/, 'Public share page must load the governed v2 runtime before its action script');

assert.match(sw, /write-urdu-shell-v35/, 'PWA cache must retain Slice G assets with the account-aware shared shell');
['create-publish-boundaries-registry.js', 'card-studio-handoff-adapter.js', 'qr-handoff-adapter.js', 'template-library-boundary.js', 'share-page.js'].forEach(asset => {
  assert.ok(sw.includes(asset), `${asset} must be cached with the current shell`);
});

console.log('Create / Publish / Work boundary contract passed.');
