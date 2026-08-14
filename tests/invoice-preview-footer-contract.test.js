const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const invoiceUi = fs.readFileSync(path.join(root, 'js', 'invoice-generator.js'), 'utf8');

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

console.log('Invoice preview footer isolation contract passed.');
