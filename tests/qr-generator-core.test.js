const assert = require('node:assert/strict');
const core = require('../js/qr-generator-core.js');

assert.equal(core.buildUrlPayload({ url: 'write-urdu.com' }).payload, 'https://write-urdu.com/', 'URL payload normalization changed');
assert.match(core.buildTextPayload({ text: 'ہمیں اردو سے محبت ہے۔' }).payload, /اردو/, 'Urdu text payload must remain intact');
assert.match(
  core.buildWhatsAppPayload({ phone: '+45 12 34 56 78', message: 'سلام' }).payload,
  /wa\.me\/4512345678\?text=/,
  'WhatsApp phone normalization changed'
);
assert.match(core.buildWifiPayload({ ssid: 'a;b', security: 'WPA', password: 'p:q' }).payload, /a\\;b.*p\\:q/, 'Wi-Fi payload escaping changed');
assert.match(core.buildVCardPayload({ fullName: 'A;B' }).payload, /N:;A\\;B/, 'vCard escaping changed');
assert.equal(core.buildLocationPayload({ latitude: 91, longitude: 0 }).valid, false, 'Location bounds must be enforced');

const normalized = core.normalizeQrProject({
  design: { foregroundColor: '#fff', margin: 9 },
  logo: { sizeRatio: 1 }
});
assert.equal(normalized.design.margin, 4, 'QR design state must clamp invalid margins');
assert.ok(
  core.calculateLogoPlacement(1000, { width: 2000, height: 1000 }, { sizeRatio: 0.18 }).imageWidth <= 180,
  'QR logo placement must stay contained'
);
assert.equal(core.safeFilename('a/b:c', 'fallback'), 'a b c', 'QR filename sanitization changed');

console.log('QR generator core tests passed.');
