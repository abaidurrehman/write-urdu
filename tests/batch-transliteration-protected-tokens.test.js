'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'batch-transliteration.js'), 'utf8');

function createHarness() {
  const calls = [];
  const window = {
    setTimeout,
    fetch: async function (query) {
      const value = new URL(query).searchParams.get('text');
      calls.push(value);
      return {
        ok: true,
        json: async function () {
          return ['SUCCESS', [[value, ['⟦' + value + '⟧']]]];
        }
      };
    }
  };
  const document = {
    readyState: 'loading',
    addEventListener: function () {},
    querySelectorAll: function () { return []; }
  };
  const context = vm.createContext({
    window,
    document,
    URL,
    encodeURIComponent,
    Promise,
    Array,
    String,
    Math,
    Event: function Event() {},
    MutationObserver: function MutationObserver() {},
    console
  });
  vm.runInContext(source, context, { filename: 'js/batch-transliteration.js' });
  assert.equal(typeof window.WriteUrduBatchTransliteration.transliterate, 'function');
  return { calls, transliterate: window.WriteUrduBatchTransliteration.transliterate };
}

(async function () {
  {
    const harness = createHarness();
    const input = 'mera khayal hai';
    const output = await harness.transliterate(input);
    assert.deepEqual(harness.calls, [input], 'Unprotected Roman Urdu must keep the legacy one-request batch path.');
    assert.equal(output, '⟦' + input + '⟧', 'Unprotected provider output must remain unchanged by B4.');
  }

  {
    const harness = createHarness();
    const protectedValues = [
      'WhatsApp', 'PDF', 'https://write-urdu.com', 'admin@example.com', '@ali',
      'PKR', '2500', '0300-1234567', '12/09/2026', '3:30', 'PM', 'iPhone', '15'
    ];
    const input = 'WhatsApp par PDF bhejo https://write-urdu.com admin@example.com @ali ko PKR 2500 dena 0300-1234567 par 12/09/2026 3:30 PM iPhone 15 lana';
    const output = await harness.transliterate(input);

    for (const token of protectedValues) {
      assert.ok(output.includes(token), 'Protected token must survive byte-for-byte: ' + token);
      assert.ok(!harness.calls.some(call => call.includes(token)), 'Protected token must never be sent inside a provider segment: ' + token);
    }
    assert.ok(harness.calls.some(call => call.includes('par')), 'Surrounding Roman Urdu must still be sent for transliteration.');
    assert.ok(harness.calls.some(call => call.includes('bhejo')), 'Roman Urdu after a protected token must still be converted.');
  }

  {
    const harness = createHarness();
    const input = 'Facebook Word Ali plz kg thanks';
    await harness.transliterate(input);
    assert.deepEqual(
      harness.calls,
      [input],
      'Ambiguous title-case/lowercase Latin words must not be treated as protected tokens.'
    );
  }

  {
    const harness = createHarness();
    const input = 'mera khayal hai\nWhatsApp par milo\n0300-1234567';
    const output = await harness.transliterate(input);
    assert.equal(output.split('\n').length, 3, 'B4 must preserve line count.');
    assert.ok(output.includes('WhatsApp'), 'Protected token inside a later line must survive.');
    assert.ok(output.endsWith('0300-1234567'), 'A non-Roman numeric-only line must remain unchanged.');
  }

  console.log('Production batch transliteration protected-token checks passed.');
}()).catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
