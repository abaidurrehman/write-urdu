const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const invoiceUi = read('js/invoice-generator.js');
const invoiceDocument = read('js/invoice-document.js');
const invoiceHtml = read('urdu-invoice-generator.html');
const workspaceCss = read('css/invoice-generator.css');
const documentCss = read('css/invoice-document.css');
const adsSource = read('js/ads.js');
const registry = read('docs/WU-PUBLIC-PAGE-REGISTRY.csv');

// The shared document renderer owns the invoice footer. It must never emit a
// <footer> landmark that the shared site shell could claim as the page footer.
assert.doesNotMatch(invoiceDocument, /<footer class=\"invoice-footer/, 'The invoice document must not expose a footer landmark.');
assert.match(invoiceDocument, /<div class=\"invoice-footer inv-footer\">/, 'The invoice footer must stay inside the exported document.');
assert.doesNotMatch(invoiceUi, /<footer/, 'The editor must not render footer landmarks into the page.');

// One renderer for preview, thumbnails, PDF, PNG and print.
assert.match(invoiceHtml, /js\/invoice-document\.js/, 'Invoice page must load the shared document renderer');
assert.match(invoiceUi, /renderer\.renderPages\(/, 'Preview and exports must render through the shared document renderer');
assert.doesNotMatch(invoiceUi, /html2canvas\(preview/, 'Exports must not capture the scaled on-screen preview');

// Workspace contract: page hook, sticky actions and preview, responsive modes.
assert.match(invoiceHtml, /class=\"invoice-generator-page\"/, 'Invoice page must retain its dedicated page hook');
assert.match(invoiceHtml, /css\/invoice-generator\.css/, 'Invoice page must load the workspace stylesheet');
assert.match(invoiceHtml, /css\/invoice-document\.css/, 'Invoice page must load the document template stylesheet');
assert.doesNotMatch(invoiceHtml, /<ins[^>]+adsbygoogle/i, 'Invoice HTML must not hard-code AdSense units inside the authoring workflow');
assert.match(workspaceCss, /\.inv-toolbar \{[^}]*position: sticky/, 'Desktop invoice actions should remain available below the shared header');
assert.match(workspaceCss, /\.inv-preview \{[^}]*position: sticky/, 'Desktop live preview should remain visible while editing invoice details');
assert.match(workspaceCss, /\.invoice-generator-page \.invoice-about-grid/, 'Supporting invoice content must keep its card grid');
assert.match(workspaceCss, /@media \(max-width: 900px\)[\s\S]*data-view="edit"\] \.inv-preview \{ display: none; \}/, 'Phones and tablets switch between Edit and Preview instead of stacking everything');
assert.match(workspaceCss, /@media \(max-width: 620px\)/, 'Invoice workspace needs a narrow mobile control layout');
assert.match(documentCss, /@media print[\s\S]*@page \{ size: A4; margin: 0; \}/, 'Printing must produce bare A4 pages');

// Monetization must begin after the active two-column editor/preview workspace,
// never between fields, actions, and the live invoice preview.
assert.match(invoiceHtml, /class=\"invoice-workspace inv-workspace\"/, 'The editor and preview must stay inside the protected .invoice-workspace');
assert.match(adsSource, /['\"]\.invoice-workspace['\"]/, 'Invoice workspace must be an explicit safe Create-page AdSense anchor');
assert.match(registry, /urdu-invoice-generator\.html,\/urdu-invoice-generator,Business,[^\n]*,migrated,P1,/, 'Public-page registry must mark the invoice V3 migration complete');

// Telemetry hooks read these status messages and the print button.
assert.match(invoiceHtml, /data-invoice-fit-status/, 'Export status region used by telemetry must remain');
assert.match(invoiceUi, /'PDF downloaded\.'/, 'PDF success message used by telemetry must remain');
assert.match(invoiceUi, /'PNG downloaded\.'/, 'PNG success message used by telemetry must remain');
assert.match(invoiceHtml, /data-invoice-print/, 'Print action used by telemetry must remain');

// Privacy: drafts stay on the device and the existing draft key keeps working.
assert.match(invoiceUi, /writeUrdu\.invoiceGenerator\.draft\.v1/, 'Existing local drafts must keep restoring');
assert.doesNotMatch(invoiceUi, /fetch\(|XMLHttpRequest|sendBeacon/, 'Invoice data must never be sent to a server');

console.log('Invoice document, workspace and monetization contracts passed.');
