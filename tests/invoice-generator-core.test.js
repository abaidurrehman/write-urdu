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

// Redesign (templates, wallets, numbering, samples, long invoices).
assert.equal(core.createDefaultInvoiceDocument().templateId, 'modern', 'New invoices start on Modern Professional');
assert.equal(core.normalizeInvoiceDocument({ templateId: 'professional-bilingual' }).templateId, 'modern', 'Legacy template ids must migrate');
assert.equal(core.normalizeInvoiceDocument({ templateId: 'unknown' }).templateId, 'modern');
assert.equal(core.normalizeInvoiceDocument({ design: { accent: 'red' } }).design.accent, core.ACCENTS[0], 'Invalid accent colours fall back to the default');
assert.equal(core.normalizeInvoiceDocument({ seller: { logoDataUrl: 'javascript:alert(1)' } }).seller.logoDataUrl, '', 'Only image data URLs are accepted as logos');
assert.equal(core.incrementInvoiceNumber('INV-2026-0009'), 'INV-2026-0010');
assert.equal(core.incrementInvoiceNumber('A-99'), 'A-100');
assert.equal(core.incrementInvoiceNumber('Bill 7/B'), 'Bill 8/B');
assert.ok(core.MAX_ITEMS >= 30, 'Long invoices paginate instead of stopping at six items');

const walletOnly = core.createDefaultInvoiceDocument(new Date('2026-07-17T00:00:00Z'));
walletOnly.paymentDetails.walletProvider = 'JazzCash';
walletOnly.paymentDetails.walletNumber = '0300 1234567';
assert.equal(core.getVisibility(walletOnly).paymentDetails, true, 'Mobile wallet details alone show the payment section');

const withBlankRow = core.normalizeInvoiceDocument(invoice);
withBlankRow.items.push({ id: 'blank', description: '', quantity: '1', unitPrice: '' });
assert.equal(core.validateInvoice(withBlankRow).valid, true, 'An untouched extra row must not block export');

['english', 'urdu', 'bilingual'].forEach((mode) => {
  const sample = core.createSampleInvoice(mode, new Date('2026-07-17T00:00:00Z'));
  assert.equal(sample.isSample, true, 'Sample invoices are flagged as samples');
  assert.equal(sample.languageMode, mode);
  assert.equal(core.validateInvoice(sample).valid, true, mode + ' sample must be a valid invoice');
});

const partial = core.normalizeInvoiceDocument(Object.assign({}, invoice, {
  items: [{ id: 'a', description: 'Work', quantity: '2', unitPrice: '1000' }],
  discount: { mode: 'percentage', value: '10' }, tax: { mode: 'percentage', value: '16' }, additionalCharge: '200', amountPaid: '1000'
}));
const partialTotals = core.calculateInvoiceTotals(partial);
assert.equal(partialTotals.subtotalMinor, 200000);
assert.equal(partialTotals.discountMinor, 20000, 'Discount applies to the subtotal');
assert.equal(partialTotals.taxMinor, 28800, 'Tax applies after the discount');
assert.equal(partialTotals.grandTotalMinor, 228800, 'Extra charges are added last');
assert.equal(partialTotals.balanceDueMinor, 128800, 'Balance due subtracts the amount already paid');

// Units are free text kept with each item; per-item tax rates are charged on
// each line's share of the discounted subtotal.
const perItem = core.normalizeInvoiceDocument(Object.assign({}, invoice, {
  items: [
    { id: 'a', description: 'Cement', quantity: '10', unit: 'bag', unitPrice: '1000', taxRate: '18' },
    { id: 'b', description: 'Labour', quantity: '2', unit: 'دن', unitPrice: '5000', taxRate: '' }
  ],
  discount: { mode: 'percentage', value: '10' }, tax: { mode: 'per-item', value: '99' }
}));
assert.equal(perItem.tax.mode, 'per-item', 'Per-item tax mode survives normalisation');
assert.equal(perItem.tax.value, '', 'Per-item mode ignores an invoice-level tax value');
assert.equal(perItem.items[1].unit, 'دن', 'Urdu units are kept as typed');
const perItemTotals = core.calculateInvoiceTotals(perItem);
assert.equal(perItemTotals.subtotalMinor, 2000000);
assert.equal(perItemTotals.discountMinor, 200000);
assert.deepEqual(perItemTotals.lineTaxes, [162000, 0], 'Only taxed lines carry tax, after their share of the discount');
assert.equal(perItemTotals.taxMinor, 162000);
assert.equal(perItemTotals.grandTotalMinor, 1962000);
assert.equal(core.hasItemTax(perItem), true);
assert.equal(core.normalizeInvoiceDocument({ items: [{ description: 'x', unit: 'a'.repeat(40) }] }).items[0].unit.length, core.MAX_UNIT, 'Units are capped');
const badRate = core.normalizeInvoiceDocument(perItem); badRate.items[0].taxRate = '140';
assert.equal(core.validateInvoice(badRate).errors['items.0.taxRate'], 'Tax must be between 0 and 100%.');
const legacyItem = core.normalizeInvoiceDocument({ items: [{ id: 'old', description: 'Old', quantity: '1', unitPrice: '5' }] }).items[0];
assert.equal(legacyItem.unit, '', 'Older drafts gain an empty unit');
assert.equal(legacyItem.taxRate, '', 'Older drafts gain an empty tax rate');

// Backups round-trip through the normaliser and merge by invoice id.
const older = Object.assign(core.normalizeInvoiceDocument(invoice), { id: 'inv-a', savedAt: '2026-01-01T00:00:00.000Z' });
const newer = Object.assign(core.normalizeInvoiceDocument(invoice), { id: 'inv-a', invoiceNumber: 'INV-2026-0099', savedAt: '2026-02-01T00:00:00.000Z' });
const sampleEntry = Object.assign(core.createSampleInvoice('english'), { id: 'sample' });
const backup = core.createBackup([newer, sampleEntry], { seller: { name: 'Shop' } }, new Date('2026-03-01T00:00:00Z'));
assert.equal(backup.format, core.BACKUP_FORMAT);
assert.equal(backup.invoices.length, 1, 'Sample invoices are never written to a backup');
const parsed = core.parseBackup(JSON.stringify(backup));
assert.equal(parsed.ok, true);
assert.equal(parsed.invoices[0].id, 'inv-a', 'Restored invoices keep their id so re-importing does not duplicate them');
assert.equal(parsed.invoices[0].savedAt, '2026-02-01T00:00:00.000Z');
assert.equal(parsed.business.seller.name, 'Shop');
assert.deepEqual(core.parseBackup('{"hello":1}'), { ok: false, error: 'not-backup' });
assert.deepEqual(core.parseBackup('not json'), { ok: false, error: 'not-backup' });
assert.equal(core.parseBackup(JSON.stringify(Object.assign({}, backup, { version: 99 }))).error, 'newer-version');
const hostile = core.parseBackup(JSON.stringify(Object.assign({}, backup, { invoices: [{ id: 'x', seller: { logoDataUrl: 'data:image/png;base64,AAAA")' } }] })));
assert.equal(hostile.invoices[0].seller.logoDataUrl, '', 'Malformed logo data is dropped on restore');
const merged = core.mergeHistory([older], parsed.invoices, 25);
assert.equal(merged.updated, 1, 'A newer backup copy replaces the one on the device');
assert.equal(merged.list[0].invoiceNumber, 'INV-2026-0099');
assert.equal(core.mergeHistory(parsed.invoices, [older], 25).updated, 0, 'An older backup copy never overwrites newer work');
assert.equal(core.mergeHistory([], [newer, Object.assign({}, older, { id: 'inv-b' })], 1).dropped, 1);
const csv = core.historyToCsv([Object.assign(core.normalizeInvoiceDocument(invoice), { buyer: Object.assign(core.normalizeInvoiceDocument(invoice).buyer, { name: '=SUM(A1), "Ali"' }) })]);
assert.ok(csv.charCodeAt(0) === 0xfeff, 'CSV starts with a byte-order mark for Excel');
assert.ok(csv.includes(`"'=SUM(A1), ""Ali"""`), 'Formula-like cells are neutralised and quoted');

console.log('Invoice generator core tests passed.');
