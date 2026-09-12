const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const core = require('../js/bill-generator-core.js');

const fixturePath = path.join(__dirname, 'fixtures', 'wu-bill-001', 'billing-documents.v1.json');
const fixtureSet = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

assert.equal(core.SCHEMA_VERSION, 1, 'Billing schema must start at version 1');
assert.deepEqual(core.DOCUMENT_TYPES, ['bill', 'cash-memo', 'receipt']);
assert.deepEqual(core.LANGUAGE_MODES, ['english', 'urdu', 'bilingual']);
assert.deepEqual(core.PAYMENT_METHODS, ['cash', 'raast', 'jazzcash', 'easypaisa', 'bank-transfer', 'udhaar', 'other']);
assert.deepEqual(core.PAYMENT_STATES, ['paid', 'partially-paid', 'unpaid']);

assert.equal(core.TERMINOLOGY.bill.urdu, 'بل');
assert.equal(core.TERMINOLOGY.cashMemo.urdu, 'کیش میمو');
assert.equal(core.TERMINOLOGY.receipt.urdu, 'رسید');
assert.equal(core.TERMINOLOGY.customer.urdu, 'گاہک');
assert.equal(core.TERMINOLOGY.subtotal.urdu, 'جمع');
assert.equal(core.TERMINOLOGY.total.urdu, 'کل رقم');
assert.equal(core.TERMINOLOGY.paid.urdu, 'ادا شدہ');
assert.equal(core.TERMINOLOGY.balance.urdu, 'بقایا');
assert.equal(core.TERMINOLOGY.udhaar.urdu, 'ادھار');

const defaultBill = core.createDefaultBillDocument(new Date('2026-09-12T00:00:00Z'));
assert.equal(defaultBill.version, 1);
assert.equal(defaultBill.documentType, 'bill');
assert.equal(defaultBill.languageMode, 'bilingual');
assert.equal(defaultBill.documentNumber, 'BILL-20260912-001');
assert.equal(defaultBill.date, '2026-09-12');
assert.ok(!Object.prototype.hasOwnProperty.call(defaultBill, 'total'), 'Derived totals must not be persisted');
assert.ok(!Object.prototype.hasOwnProperty.call(defaultBill, 'balance'), 'Derived balances must not be persisted');

const defaultReceipt = core.createDefaultReceiptDocument(new Date('2026-09-12T00:00:00Z'));
assert.equal(defaultReceipt.documentType, 'receipt');
assert.equal(defaultReceipt.documentNumber, 'RCT-20260912-001');
assert.ok(!Object.prototype.hasOwnProperty.call(defaultReceipt, 'items'), 'Receipt state must not fake item rows');
assert.ok(Object.prototype.hasOwnProperty.call(defaultReceipt, 'amountReceived'), 'Receipt must own amountReceived explicitly');

assert.equal(fixtureSet.version, 1, 'Fixture schema version changed unexpectedly');
assert.ok(Array.isArray(fixtureSet.cases) && fixtureSet.cases.length >= 10, 'Slice 0 requires the complete fixture corpus');

for (const fixture of fixtureSet.cases) {
  const validation = core.validateBillingDocument(fixture.document);
  assert.equal(validation.valid, fixture.expected.valid, `${fixture.id}: validation result changed: ${validation.errors.join(', ')}`);

  if (fixture.expected.valid && fixture.document.documentType !== 'receipt') {
    const totals = core.calculateBillTotals(fixture.document);
    for (const key of ['subtotalMinor', 'discountMinor', 'totalMinor', 'amountPaidMinor', 'balanceMinor', 'paymentState']) {
      assert.equal(totals[key], fixture.expected[key], `${fixture.id}: ${key} changed`);
    }
    assert.ok(totals.lineAmounts.every(Number.isFinite), `${fixture.id}: line totals must stay finite`);
  }

  for (const directionFixture of fixture.direction || []) {
    assert.equal(
      core.directionForValue(directionFixture.value, directionFixture.kind),
      directionFixture.expected,
      `${fixture.id}: direction changed for ${directionFixture.value}`
    );
  }
}

const invalidFixture = fixtureSet.cases.find((fixture) => fixture.id === 'invalid-quantity-and-rate');
const invalidResult = core.validateBillingDocument(invalidFixture.document);
assert.ok(invalidResult.errors.includes('items[0].quantity:invalid'));
assert.ok(invalidResult.errors.includes('items[0].rate:invalid'));
assert.ok(invalidResult.errors.includes('discount:negative'));
assert.ok(invalidResult.errors.includes('amountPaid:invalid'));

const discountClamp = core.calculateBillTotals({
  documentType: 'bill', languageMode: 'english', paymentMethod: 'cash',
  items: [{ id: '1', description: 'Service', quantity: 1, rate: 100 }],
  discount: 500, amountPaid: 0
});
assert.equal(discountClamp.subtotalMinor, 10000);
assert.equal(discountClamp.discountMinor, 10000, 'Discount must clamp to subtotal');
assert.equal(discountClamp.totalMinor, 0);
assert.equal(discountClamp.balanceMinor, 0);

const paidClamp = core.calculateBillTotals({
  documentType: 'bill', languageMode: 'english', paymentMethod: 'cash',
  items: [{ id: '1', description: 'Service', quantity: 1, rate: 100 }],
  discount: 0, amountPaid: 999
});
assert.equal(paidClamp.amountPaidMinor, 10000, 'Amount paid must clamp to total');
assert.equal(paidClamp.balanceMinor, 0);
assert.equal(paidClamp.paymentState, 'paid');

const decimalLine = core.calculateBillTotals({
  documentType: 'bill', languageMode: 'english', paymentMethod: 'cash',
  items: [{ id: '1', description: 'Measured item', quantity: 1.5, rate: 99.99 }],
  discount: 0, amountPaid: 0
});
assert.deepEqual(decimalLine.lineAmounts, [14999], 'Decimal quantity/rate must round once to minor units');
assert.equal(decimalLine.subtotalMinor, 14999);

assert.equal(core.toMinor('1,234.56'), 123456, 'Formatted numeric input must normalize deterministically');
assert.equal(core.formatMoneyMinor(123456), 'PKR 1,234.56');
assert.equal(core.formatMoneyMinor(0), 'PKR 0.00');
assert.equal(core.formatMoneyMinor(19999999998), 'PKR 199,999,999.98');

assert.equal(core.directionForValue('قمیض SKU-42', 'text'), 'rtl');
assert.equal(core.directionForValue('SKU-42 قمیض', 'text'), 'ltr');
assert.equal(core.directionForValue('03001234567', 'phone'), 'ltr');
assert.equal(core.directionForValue('PK36SCBL0000001123456702', 'identifier'), 'ltr');
assert.equal(core.directionForValue('2026-09-12', 'date'), 'ltr');

const normalizedMixed = core.normalizeBillingDocument({
  documentType: 'bill',
  languageMode: 'urdu',
  documentNumber: 'BILL-MIXED',
  date: '2026-09-12',
  business: { name: 'نور موبائل', phone: '+92 300 1234567' },
  items: [{ id: 'row', description: 'پرنٹر SKU-HP85A', quantity: '2', rate: '1,250.50' }],
  discount: '0',
  amountPaid: '500',
  paymentMethod: 'raast',
  paymentDetails: { raastId: '03001234567', ibanOrAccount: 'PK36SCBL0000001123456702' }
});
assert.equal(normalizedMixed.business.phone, '+92 300 1234567', 'Phone identifiers must not be reversed or rewritten');
assert.equal(normalizedMixed.items[0].description, 'پرنٹر SKU-HP85A', 'Mixed-script descriptions must preserve source text');
assert.equal(normalizedMixed.paymentDetails.raastId, '03001234567');
assert.equal(normalizedMixed.paymentDetails.ibanOrAccount, 'PK36SCBL0000001123456702');
assert.ok(!Object.prototype.hasOwnProperty.call(normalizedMixed, 'balanceMinor'), 'Normalization must not persist derived totals');

console.log(`Billing generator core tests passed (${fixtureSet.cases.length} fixtures).`);
