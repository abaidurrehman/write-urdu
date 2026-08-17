const assert = require('node:assert/strict');
const Core = require('../js/inpage-unicode-core.js');

function legacy(bytes) {
  return bytes.map(byte => Core.PREFIX + Core.byteToClipboardChar(byte)).join('');
}

assert.equal(Core.decodeLegacyText(legacy([0x81, 0x82, 0x83])).text, 'ابپ');
assert.equal(Core.decodeLegacyText(legacy([0x9C, 0x9D, 0xA4, 0xA5])).text, 'کگیے');
assert.equal(Core.decodeLegacyText(legacy([0xD1, 0xD2, 0xD3, 0xF3])).text, '۱۲۳۔');
assert.equal(Core.decodeLegacyText(legacy([0x81, 0xBF])).text, 'أ');
assert.equal(Core.decodeLegacyText(legacy([0x81, 0xB3])).text, 'آ');
assert.equal(Core.decodeLegacyText(legacy([0xA2, 0xBF])).text, 'ؤ');
assert.equal(Core.decodeLegacyText(legacy([0xA4, 0xBF])).text, 'یئ');

const phrase = 'یہ ایک اردو متن ہے۔ ۱۲۳';
const encoded = Core.encodeUnicodeText(phrase);
assert.equal(encoded.unsupported, 0);
assert.equal(Core.decodeLegacyText(encoded.text).text, phrase);

const mixed = 'Invoice 12 — اردو';
const mixedEncoded = Core.encodeUnicodeText(mixed);
assert.ok(mixedEncoded.text.startsWith('Invoice'));
assert.equal(Core.decodeLegacyText(mixedEncoded.text).text, mixed);

const unknownLegacy = Core.PREFIX + Core.byteToClipboardChar(0xE3);
const decodedUnknown = Core.decodeLegacyText(unknownLegacy);
assert.equal(decodedUnknown.text, unknownLegacy, 'unknown legacy bytes must be preserved');
assert.equal(decodedUnknown.unsupported, 1);

const unsupportedUnicode = Core.encodeUnicodeText('اردو🙂');
assert.ok(unsupportedUnicode.text.endsWith('🙂'), 'unsupported Unicode must be preserved');
assert.equal(unsupportedUnicode.unsupported, 1);

assert.equal(Core.decodeLegacyText('already Unicode اردو').looksLikeLegacy, false);
assert.equal(Core.unsupportedBucket(0), '0');
assert.equal(Core.unsupportedBucket(7), '6-10');
assert.equal(Core.unsupportedBucket(20), '11+');

console.log('InPage Unicode core contract passed.');
