const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ui = require('../js/invoice-ui-urdu.js');
const core = require('../js/invoice-generator-core.js');

// Every entry has Urdu wording (or deliberately keeps Latin product names).
Object.keys(ui.EXACT).forEach((english) => {
  const urdu = ui.EXACT[english];
  assert.ok(typeof urdu === 'string' && urdu.trim(), 'Missing Urdu for: ' + english);
  assert.ok(/[\u0600-ۿ]/.test(urdu), 'Urdu entry must contain Urdu script: ' + english);
});

// Messages with numbers and invoice numbers keep their values.
assert.equal(ui.translate('New invoice INV-2026-0002 started.'), 'نئی انوائس INV-2026-0002 شروع ہو گئی۔');
assert.equal(ui.translate('Move item 3 up'), 'چیز 3 اوپر کریں');
assert.equal(ui.translate('A4 · 1 page'), 'A4 · 1 صفحہ');
assert.equal(ui.translate('A4 · 3 pages'), 'A4 · 3 صفحات');
assert.equal(ui.translate('2 items · PKR 5,000'), '2 چیزیں · PKR 5,000', 'Hints joined with a middle dot translate part by part');
assert.equal(ui.translate('Welcome back — your invoice INV-1 was restored.'), 'خوش آمدید — آپ کی انوائس INV-1 بحال کر دی گئی۔');
assert.equal(ui.translate('Something nobody wrote'), null, 'Unknown text stays English');
assert.equal(ui.translate('میرا نام'), null, 'Urdu text is never re-translated');

// Every validation message the core can show has Urdu wording.
const coreSource = fs.readFileSync(path.join(__dirname, '..', 'js', 'invoice-generator-core.js'), 'utf8');
// (Messages built with + are covered by the explicit check below.)
const messages = [...coreSource.matchAll(/errors(?:\[[^\]]+\]|\.\w+) = '([^']+)'(?! \+)/g)].map((match) => match[1]);
assert.ok(messages.length >= 8, 'Validation messages were found in the core');
messages.forEach((message) => assert.notEqual(ui.translate(message), null, 'Validation message needs Urdu: ' + message));
assert.notEqual(ui.translate('An invoice supports up to ' + core.MAX_ITEMS + ' items.'), null);

// Toasts the controller shows have Urdu wording.
const controller = fs.readFileSync(path.join(__dirname, '..', 'js', 'invoice-generator.js'), 'utf8');
// Messages built with + are covered by the pattern checks above.
[...controller.matchAll(/setStatus\('([^']+)'(?! \+)/g)].map((match) => match[1]).forEach((message) => {
  assert.notEqual(ui.translate(message), null, 'Status message needs Urdu: ' + message);
});

// Export telemetry still recognises the Urdu success messages.
const telemetry = fs.readFileSync(path.join(__dirname, '..', 'js', 'product-telemetry-integrations.js'), 'utf8');
assert.ok(telemetry.includes(ui.EXACT['PDF downloaded.']), 'Telemetry must recognise the Urdu PDF message');
assert.ok(telemetry.includes(ui.EXACT['PNG downloaded.']), 'Telemetry must recognise the Urdu PNG message');

console.log('Invoice editor Urdu wording tests passed.');
