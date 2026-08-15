const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const invoiceUi = fs.readFileSync(path.join(root, 'js', 'invoice-generator.js'), 'utf8');
const invoiceHtml = fs.readFileSync(path.join(root, 'urdu-invoice-generator.html'), 'utf8');
const invoiceTweaks = fs.readFileSync(path.join(root, 'css', 'invoice-generator-tweaks.css'), 'utf8');
const adsSource = fs.readFileSync(path.join(root, 'js', 'ads.js'), 'utf8');
const registry = fs.readFileSync(path.join(root, 'docs', 'WU-PUBLIC-PAGE-REGISTRY.csv'), 'utf8');

assert.doesNotMatch(
  invoiceUi,
  /<footer class=\"invoice-footer\">/,
  'The document preview must not expose a footer landmark that the shared site shell can claim.'
);
assert.match(
  invoiceUi,
  /<div class=\"invoice-footer\">/,
  'The invoice footer content must remain inside the export preview without becoming the page footer.'
);

// V3 workspace contract: the business tool keeps the functional markup and
// export engine, while the final linked tweak layer owns the product-level
// visual treatment.
assert.match(invoiceHtml, /class=\"invoice-generator-page\"/, 'Invoice page must retain its dedicated V3 page hook');
assert.match(invoiceHtml, /css\/invoice-generator-tweaks\.css/, 'Invoice page must load the final V3 workspace refinement layer');
assert.doesNotMatch(invoiceHtml, /<ins[^>]+adsbygoogle/i, 'Invoice HTML must not hard-code AdSense units inside the authoring workflow');
assert.match(invoiceTweaks, /\.invoice-generator-page \.invoice-actionbar[\s\S]*position:\s*sticky/, 'Desktop invoice actions should remain available below the shared header');
assert.match(invoiceTweaks, /\.invoice-generator-page \.invoice-preview-workspace[\s\S]*position:\s*sticky/, 'Desktop live preview should remain visible while editing invoice details');
assert.match(invoiceTweaks, /\.invoice-generator-page \.invoice-about-grid/, 'Supporting invoice content must use the V3 card system');
assert.match(invoiceTweaks, /@media \(max-width: 900px\)/, 'Invoice V3 treatment needs a tablet/mobile stacking breakpoint');
assert.match(invoiceTweaks, /@media \(max-width: 620px\)/, 'Invoice V3 treatment needs a narrow mobile control layout');

// Monetization must begin after the active two-column editor/preview workspace,
// never between fields, actions, and the live invoice preview.
assert.match(adsSource, /['\"]\.invoice-workspace['\"]/, 'Invoice workspace must be an explicit safe Create-page AdSense anchor');
assert.match(registry, /urdu-invoice-generator\.html,\/urdu-invoice-generator,Business,[^\n]*,migrated,P1,/, 'Public-page registry must mark the invoice V3 migration complete');

console.log('Invoice preview, V3 workspace and monetization contracts passed.');
