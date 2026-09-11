import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  INPUT_TRANSLATION_MAX_TEXT_CHARS,
  normalizeTranslationRequest
} from '../functions/lib/input-translation/contract.mjs';
import {
  translateWithCloudflare,
  CLOUDFLARE_INPUT_TRANSLATION_MODELS
} from '../functions/lib/input-translation/providers/cloudflare.mjs';
import { translateWithMicrosoft } from '../functions/lib/input-translation/providers/microsoft.mjs';
import {
  isInputTranslationEnabled,
  providerForDirection,
  translateInputText
} from '../functions/lib/input-translation/service.mjs';
import { handleLanguageTranslate } from '../functions/lib/input-translation/handler.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

function request(body, contentType = 'application/json') {
  return new Request('https://write-urdu.test/api/language-translate', {
    method: 'POST',
    headers: { 'content-type': contentType },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  });
}

async function jsonBody(response) {
  return JSON.parse(await response.text());
}

// Request contract.
assert.deepEqual(
  normalizeTranslationRequest({ version: 1, from: 'ur', to: 'en', text: '  سلام  ' }),
  { ok: true, value: { version: 1, from: 'ur', to: 'en', text: 'سلام', direction: 'ur-en' } }
);
assert.equal(normalizeTranslationRequest({ from: 'en', to: 'ur', text: 'Hello' }).ok, true);
assert.equal(normalizeTranslationRequest({ from: 'ur', to: 'ur', text: 'سلام' }).code, 'unsupported-direction');
assert.equal(normalizeTranslationRequest({ from: 'fr', to: 'ur', text: 'Bonjour' }).code, 'unsupported-direction');
assert.equal(normalizeTranslationRequest({ from: 'ur', to: 'en', text: ' ' }).code, 'invalid-text');
assert.equal(normalizeTranslationRequest({ from: 'ur', to: 'en', text: 'x'.repeat(INPUT_TRANSLATION_MAX_TEXT_CHARS + 1) }).code, 'text-too-large');
assert.equal(normalizeTranslationRequest({ version: 2, from: 'ur', to: 'en', text: 'سلام' }).code, 'unsupported-version');
assert.equal(normalizeTranslationRequest({ from: 'ur', to: 'en', text: 'سلام', provider: 'microsoft' }).code, 'invalid-request');

// Server-side enablement/provider selection only.
assert.equal(isInputTranslationEnabled({}), false);
assert.equal(isInputTranslationEnabled({ INPUT_TRANSLATION_ENABLED: '1' }), true);
assert.equal(providerForDirection({ from: 'en', to: 'ur' }, {}), 'cloudflare');
assert.equal(providerForDirection({ from: 'ur', to: 'en' }, {}), 'cloudflare');
assert.equal(providerForDirection({ from: 'ur', to: 'en' }, { INPUT_TRANSLATION_PROVIDER_UR_EN: 'microsoft' }), 'microsoft');
assert.equal(providerForDirection({ from: 'ur', to: 'en' }, { INPUT_TRANSLATION_PROVIDER_UR_EN: 'browser-choice' }), null);

// Cloudflare English→Urdu uses IndicTrans2 and the Urdu Arabic target code.
{
  const calls = [];
  const env = {
    AI: {
      async run(model, input) {
        calls.push({ model, input });
        return { translations: ['مجھے کل لاہور جانا ہے۔'] };
      }
    }
  };
  const result = await translateWithCloudflare({ from: 'en', to: 'ur', text: 'I need to go to Lahore tomorrow.' }, env);
  assert.equal(result.ok, true);
  assert.equal(result.translation, 'مجھے کل لاہور جانا ہے۔');
  assert.equal(result.providerAlias, 'cloudflare-indictrans2');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].model, CLOUDFLARE_INPUT_TRANSLATION_MODELS['en-ur']);
  assert.deepEqual(calls[0].input.text, ['I need to go to Lahore tomorrow.']);
  assert.equal(calls[0].input.target_language, 'urd_Arab');
}

// Cloudflare Urdu→English uses M2M100 explicitly as ur→en.
{
  const calls = [];
  const env = {
    AI: {
      async run(model, input) {
        calls.push({ model, input });
        return { translated_text: 'I need to go to Lahore tomorrow.' };
      }
    }
  };
  const result = await translateWithCloudflare({ from: 'ur', to: 'en', text: 'مجھے کل لاہور جانا ہے۔' }, env);
  assert.equal(result.ok, true);
  assert.equal(result.translation, 'I need to go to Lahore tomorrow.');
  assert.equal(result.providerAlias, 'cloudflare-m2m100');
  assert.equal(calls[0].model, CLOUDFLARE_INPUT_TRANSLATION_MODELS['ur-en']);
  assert.equal(calls[0].input.source_lang, 'ur');
  assert.equal(calls[0].input.target_lang, 'en');
}

// Cloudflare fails closed for missing binding and malformed output.
assert.equal((await translateWithCloudflare({ from: 'ur', to: 'en', text: 'سلام' }, {})).code, 'provider-unavailable');
assert.equal((await translateWithCloudflare(
  { from: 'ur', to: 'en', text: 'سلام' },
  { AI: { async run() { return {}; } } }
)).code, 'invalid-output');

// Microsoft adapter keeps credentials server-side and sends an explicit direction.
{
  let captured;
  const fetchFn = async (url, options) => {
    captured = { url, options };
    return new Response(JSON.stringify([{ translations: [{ text: 'Hello' }] }]), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  };
  const result = await translateWithMicrosoft(
    { from: 'ur', to: 'en', text: 'سلام' },
    {
      AZURE_TRANSLATOR_KEY: 'secret-test-key',
      AZURE_TRANSLATOR_REGION: 'westeurope'
    },
    { fetchFn, timeoutMs: 1000 }
  );
  assert.equal(result.ok, true);
  assert.equal(result.translation, 'Hello');
  assert.match(captured.url, /api-version=3\.0/);
  assert.match(captured.url, /from=ur/);
  assert.match(captured.url, /to=en/);
  assert.equal(captured.options.headers['Ocp-Apim-Subscription-Key'], 'secret-test-key');
  assert.equal(captured.options.headers['Ocp-Apim-Subscription-Region'], 'westeurope');
  assert.deepEqual(JSON.parse(captured.options.body), [{ Text: 'سلام' }]);
  assert.doesNotMatch(JSON.stringify(result), /secret-test-key/);
}

assert.equal((await translateWithMicrosoft({ from: 'ur', to: 'en', text: 'سلام' }, {})).code, 'provider-unavailable');
assert.equal((await translateWithMicrosoft(
  { from: 'ur', to: 'en', text: 'سلام' },
  { AZURE_TRANSLATOR_KEY: 'x' },
  { fetchFn: async () => new Response('{}', { status: 429 }), timeoutMs: 1000 }
)).code, 'rate-limited');
assert.equal((await translateWithMicrosoft(
  { from: 'ur', to: 'en', text: 'سلام' },
  { AZURE_TRANSLATOR_KEY: 'x' },
  { fetchFn: async () => new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }), timeoutMs: 1000 }
)).code, 'invalid-output');

// Service is disabled by default and has no silent provider fallback.
assert.equal((await translateInputText({ from: 'ur', to: 'en', text: 'سلام' }, {})).code, 'translation-disabled');
assert.equal((await translateInputText(
  { from: 'ur', to: 'en', text: 'سلام' },
  { INPUT_TRANSLATION_ENABLED: '1', INPUT_TRANSLATION_PROVIDER_UR_EN: 'microsoft' }
)).code, 'provider-unavailable');

// HTTP handler contract.
{
  const disabled = await handleLanguageTranslate(
    request({ version: 1, from: 'ur', to: 'en', text: 'سلام' }),
    {}
  );
  assert.equal(disabled.status, 503);
  assert.equal((await jsonBody(disabled)).error, 'translation_service_not_enabled');
}

{
  const badType = await handleLanguageTranslate(request('{}', 'text/plain'), {});
  assert.equal(badType.status, 415);
  assert.equal((await jsonBody(badType)).error, 'json_required');
}

{
  const badDirection = await handleLanguageTranslate(
    request({ version: 1, from: 'ur', to: 'ur', text: 'سلام' }),
    { INPUT_TRANSLATION_ENABLED: '1' }
  );
  assert.equal(badDirection.status, 400);
  assert.equal((await jsonBody(badDirection)).error, 'unsupported_direction');
}

{
  const clientProviderAttempt = await handleLanguageTranslate(
    request({ version: 1, from: 'ur', to: 'en', text: 'سلام', provider: 'microsoft' }),
    { INPUT_TRANSLATION_ENABLED: '1' }
  );
  assert.equal(clientProviderAttempt.status, 400);
  assert.equal((await jsonBody(clientProviderAttempt)).error, 'invalid_request');
}

{
  const calls = [];
  const response = await handleLanguageTranslate(
    request({ version: 1, from: 'en', to: 'ur', text: 'Please call me tomorrow.' }),
    {
      INPUT_TRANSLATION_ENABLED: '1',
      AI: {
        async run(model, input) {
          calls.push({ model, input });
          return { translations: ['براہ کرم مجھے کل فون کریں۔'] };
        }
      }
    }
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await jsonBody(response);
  assert.equal(body.ok, true);
  assert.equal(body.from, 'en');
  assert.equal(body.to, 'ur');
  assert.equal(body.translation, 'براہ کرم مجھے کل فون کریں۔');
  assert.equal(body.meta.providerAlias, 'cloudflare-indictrans2');
  assert.equal(calls.length, 1);
}

{
  const response = await handleLanguageTranslate(
    request({ version: 1, from: 'ur', to: 'en', text: 'براہ کرم مجھے کل فون کریں۔' }),
    {
      INPUT_TRANSLATION_ENABLED: '1',
      AI: { async run() { return { translated_text: 'Please call me tomorrow.' }; } }
    }
  );
  const body = await jsonBody(response);
  assert.equal(response.status, 200);
  assert.equal(body.translation, 'Please call me tomorrow.');
  assert.equal(body.meta.providerAlias, 'cloudflare-m2m100');
}

// Privacy/regression source checks.
const runtimeFiles = [
  'functions/api/language-translate.js',
  'functions/lib/input-translation/handler.mjs',
  'functions/lib/input-translation/service.mjs',
  'functions/lib/input-translation/providers/cloudflare.mjs',
  'functions/lib/input-translation/providers/microsoft.mjs'
];
for (const relative of runtimeFiles) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  assert.doesNotMatch(source, /console\.(log|info|warn|error)/, `${relative} must not log user translation content`);
}

const endpointSource = fs.readFileSync(path.join(root, 'functions/api/language-translate.js'), 'utf8');
assert.doesNotMatch(endpointSource, /provider\s*[:=]/i, 'Public endpoint must not expose a provider-selection request field');
assert.doesNotMatch(endpointSource, /index\.html|voice-input-core|document-translate/, 'Shared endpoint must not couple to existing client/editor/document routes');

console.log('WU-INPUT-001B bidirectional translation foundation tests passed.');
