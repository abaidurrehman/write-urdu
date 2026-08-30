const assert = require('node:assert/strict');
const core = require('../js/invoice-generator-core.js');

const invoice = core.createDefaultInvoiceDocument(new Date('2026-07-17T00:00:00Z'));
assert.equal(invoice.schemaVersion, 2, 'Invoice schema must use the current presentation version');
assert.equal(invoice.preferences.densityMode, 'automatic', 'Invoice density must default to automatic');
assert.equal(invoice.preferences.sellerHeaderMode, 'identity-only', 'Seller header must default to identity-only');
assert.equal(invoice.preferences.showGeneratorCredit, true, 'Generator credit must default to visible');

invoice.seller.name = 'Seller';
invoice.seller.website = 'write-urdu.com';
invoice.seller.email = 'hello@example.com';
invoice.buyer.name = 'Buyer';
invoice.items[0].description = 'Service';
invoice.items[0].quantity = '2';
invoice.items[0].unitPrice = '125.50';
invoice.paymentDetails.bankName = 'Local bank';

assert.equal(core.calculateInvoiceTotals(invoice).grandTotalMinor, 25100, 'Invoice total calculation changed');
assert.equal(core.validateInvoice(invoice).valid, true, 'A valid invoice must pass validation');
assert.equal(core.getVisibility(invoice).notesTerms, false, 'Empty notes/terms must remain hidden');
assert.deepEqual(core.resolveHeaderContact(invoice.seller), { type: 'website', value: 'write-urdu.com' }, 'Header contact priority changed');
assert.equal(core.resolveSellerHeaderContent(invoice).mode, 'identity-only', 'Seller header presentation mode changed');

const invalidInvoice = core.createDefaultInvoiceDocument(new Date('2026-07-17T00:00:00Z'));
invalidInvoice.seller.name = 'Seller';
invalidInvoice.buyer.name = 'Buyer';
invalidInvoice.items[0].description = 'Service';
invalidInvoice.items[0].unitPrice = 'not-a-number';
assert.equal(core.validateInvoice(invalidInvoice).valid, false, 'Non-numeric prices must be rejected');

invoice.notes = 'Thank you';
assert.equal(core.resolveNotesTermsVariant(invoice), 'notes');
invoice.terms = 'Payment due in 14 days';
assert.equal(core.resolveNotesTermsVariant(invoice), 'both');
assert.equal(core.resolveNotesTermsHeading('english', true, false), 'Notes');
assert.equal(core.resolveNotesTermsHeading('english', false, true), 'Terms & Conditions');
assert.equal(core.resolveNotesTermsHeading('bilingual', true, true), 'Notes & Terms / نوٹس اور شرائط');

assert.equal(core.resolveInvoiceDensity({
  itemCount: 2,
  visibleOptionalSectionCount: 1,
  notesLineEstimate: 1,
  termsLineEstimate: 0,
  sellerVisibleFieldCount: 2,
  buyerVisibleFieldCount: 1,
  languageMode: 'english'
}), 'comfortable', 'Sparse invoices must remain comfortable');
assert.equal(core.resolveInvoiceDensity({
  itemCount: 6,
  visibleOptionalSectionCount: 4,
  notesLineEstimate: 6,
  termsLineEstimate: 6,
  sellerVisibleFieldCount: 8,
  buyerVisibleFieldCount: 6,
  hasPaymentDetails: true,
  hasAuthorization: true,
  hasQr: true,
  languageMode: 'bilingual'
}), 'compact', 'Dense invoices must remain compact');
assert.equal(core.lowerSectionLayout(core.getVisibility(invoice)).mode, 'stacked-left');

assert.equal(core.resolveQrCaption({ purpose: 'business-contact', captionMode: 'automatic' }, 'english'), 'Scan to save our contact details');
assert.equal(core.resolveQrCaption({ purpose: 'payment-information', captionMode: 'automatic' }, 'urdu'), 'ادائیگی کی تفصیلات کے لیے اسکین کریں');
assert.equal(core.resolveQrCaption({ purpose: 'custom', captionMode: 'custom', customCaption: 'Scan our catalogue' }, 'english'), 'Scan our catalogue');
assert.equal(core.resolveQrCaption({ purpose: 'custom', captionMode: 'custom', customCaption: '1234567890' }, 'english'), 'Scan QR code', 'Technical-only captions must fall back to user language');

const migrated = core.normalizeInvoiceDocument({
  schemaVersion: 1,
  seller: { name: 'Legacy' },
  qr: { enabled: true, purpose: 'business-contact', caption: '1234567890' }
});
assert.equal(migrated.schemaVersion, 2, 'Legacy invoices must migrate to the current schema');
assert.equal(migrated.preferences.showGeneratorCredit, true);
assert.equal(migrated.qr.captionMode, 'automatic', 'Technical QR captions must not become custom captions during migration');

assert.equal(core.requiresZeroTotalConfirmation(Object.assign({}, invoice, {
  amountPaid: '0',
  items: [{ id: 'zero', description: 'Free service', quantity: '1', unitPrice: '0' }]
})), true, 'Zero-total invoices must require confirmation');
assert.equal(core.requiresZeroTotalConfirmation(invoice), false);
assert.equal(core.safeFilename('INV/1', 'A:B', 'pdf'), 'Invoice-INV-1-A-B.pdf');

console.log('Invoice generator core tests passed.');
