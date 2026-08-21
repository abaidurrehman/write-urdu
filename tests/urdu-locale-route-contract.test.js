const assert = require('node:assert/strict');
const config = require('../locale.config.js');
const Route = require('../js/locale-route.js');

assert.deepStrictEqual(config.locales, ['en', 'ur']);
assert.strictEqual(config.prefix.ur, '/urdu');
assert.strictEqual(config.phase1Routes.length, 8, 'Slice A must expose exactly eight Urdu routes');

const cases = [
  ['/', 'en', '/'],
  ['/index.html', 'en', '/'],
  ['/urdu-name-art-maker', 'en', '/urdu-name-art-maker'],
  ['/urdu', 'ur', '/'],
  ['/urdu/', 'ur', '/'],
  ['/urdu/index.html', 'ur', '/'],
  ['/urdu/urdu-editor', 'ur', '/urdu-editor'],
  ['/urdu/urdu-editor.html', 'ur', '/urdu-editor'],
  ['/tools/urdu-voice-typing', 'en', '/tools/urdu-voice-typing'],
  ['/urdu/tools/urdu-voice-typing', 'ur', '/tools/urdu-voice-typing'],
  ['/urdu/tools/urdu-voice-typing/', 'ur', '/tools/urdu-voice-typing']
];
for (const [input, locale, productPath] of cases) {
  assert.deepStrictEqual(Route.parse(input).locale, locale, input + ' locale');
  assert.deepStrictEqual(Route.productPath(input), productPath, input + ' productPath');
}

assert.strictEqual(Route.href('/', 'ur'), '/urdu/');
assert.strictEqual(Route.href('/urdu-keyboard', 'ur'), '/urdu/urdu-keyboard');
assert.strictEqual(Route.counterpart('/urdu/urdu-keyboard', 'en'), '/urdu-keyboard');
assert.strictEqual(Route.counterpart('/urdu-keyboard', 'ur'), '/urdu/urdu-keyboard');
assert.strictEqual(Route.hasLocale('/urdu-card-studio', 'ur'), true);
assert.strictEqual(Route.hasLocale('/urdu-invoice-generator', 'ur'), false);
assert.strictEqual(Route.href('/urdu-invoice-generator', 'ur'), null);

console.log('Urdu locale route contract passed.');
