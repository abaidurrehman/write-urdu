import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  DICTIONARY_MAX_BODY_BYTES,
  DICTIONARY_MAX_TERM_CHARS,
  isDictionaryEnabled,
  validateDictionaryRequest
} from '../functions/lib/dictionary/contract.mjs';
import { lookupWithMicrosoft } from '../functions/lib/dictionary/providers/microsoft.mjs';
import { handleDictionaryLookup } from '../functions/lib/dictionary/handler.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const page = read('tools/urdu-english-dictionary.html');
const client = read('js/urdu-english-dictionary.js');
const endpoint = read('functions/api/dictionary-lookup.js');
const browserCore = read('js/dictionary-core.js');

assert.equal(DICTIONARY_MAX_BODY_BYTES, 4096);
assert.equal(DICTIONARY_MAX_TERM_CHARS, 100);
assert.equal(isDictionaryEnabled({}), false);
assert.equal(isDictionaryEnabled({ DICTIONARY_LOOKUP_ENABLED: '1' }), true);

assert.equal(validateDictionaryRequest({ version: 1, from: 'en', to: 'ur', term: 'work' }).ok, true);
assert.equal(validateDictionaryRequest({ version: 1, from: 'ur', to: 'en', term: 'کام' }).ok, true);
assert.equal(validateDictionaryRequest({ version: 1, from: 'en', to: 'fr', term: 'work' }).code, 'unsupported_language_pair');
assert.equal(validateDictionaryRequest({ version: 1, from: 'auto', to: 'ur', term: 'work' }).code, 'unsupported_language_pair');
assert.equal(validateDictionaryRequest({ version: 1, from: 'en', to: 'ur', term: '' }).code, 'invalid_term');
assert.equal(validateDictionaryRequest({ version: 1, from: 'en', to: 'ur', term: 'x'.repeat(101) }).code, 'invalid_term');
assert.equal(validateDictionaryRequest({ version: 1, from: 'en', to: 'ur', term: 'work', provider: 'microsoft' }).code, 'invalid_request');

const disabled = await handleDictionaryLookup(new Request('https://example.test/api/dictionary-lookup', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ version: 1, from: 'en', to: 'ur', term: 'work' })
}), {});
assert.equal(disabled.status, 503);
assert.equal((await disabled.json()).error, 'dictionary_not_enabled');

let capturedUrl = '';
let capturedInit = null;
const providerSuccess = await lookupWithMicrosoft({ version: 1, from: 'en', to: 'ur', term: 'work' }, {
  AZURE_TRANSLATOR_KEY: 'secret-test-key',
  AZURE_TRANSLATOR_REGION: 'westeurope'
}, {
  fetchFn: async (url, init) => {
    capturedUrl = url;
    capturedInit = init;
    return new Response(JSON.stringify([{
      normalizedSource: 'work',
      displaySource: 'work',
      translations: [
        {
          normalizedTarget: 'کام',
          displayTarget: 'کام',
          posTag: 'NOUN',
          confidence: 0.92,
          backTranslations: [
            { normalizedText: 'work', displayText: 'work', numExamples: 10, frequencyCount: 100 },
            { normalizedText: 'task', displayText: 'task', numExamples: 4, frequencyCount: 30 }
          ]
        }
      ]
    }]), { status: 200, headers: { 'content-type': 'application/json' } });
  }
});
assert.equal(providerSuccess.ok, true);
assert.equal(providerSuccess.source, 'work');
assert.equal(providerSuccess.entries[0].term, 'کام');
assert.equal(providerSuccess.entries[0].partOfSpeech, 'NOUN');
assert.equal(providerSuccess.entries[0].confidence, 0.92);
assert.equal(providerSuccess.entries[0].backTranslations[1].term, 'task');
assert.match(capturedUrl, /\/dictionary\/lookup\?api-version=3\.0&from=en&to=ur/);
assert.equal(capturedInit.method, 'POST');
assert.equal(capturedInit.headers['Ocp-Apim-Subscription-Key'], 'secret-test-key');
assert.equal(capturedInit.headers['Ocp-Apim-Subscription-Region'], 'westeurope');
assert.deepEqual(JSON.parse(capturedInit.body), [{ Text: 'work' }]);

const providerEmpty = await lookupWithMicrosoft({ version: 1, from: 'ur', to: 'en', term: 'غیرموجود' }, {
  AZURE_TRANSLATOR_KEY: 'secret-test-key'
}, {
  fetchFn: async () => new Response(JSON.stringify([{
    normalizedSource: 'غیرموجود',
    displaySource: 'غیرموجود',
    translations: []
  }]), { status: 200, headers: { 'content-type': 'application/json' } })
});
assert.equal(providerEmpty.ok, true);
assert.deepEqual(providerEmpty.entries, []);

const normalized = await handleDictionaryLookup(new Request('https://example.test/api/dictionary-lookup', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ version: 1, from: 'ur', to: 'en', term: 'کام' })
}), { DICTIONARY_LOOKUP_ENABLED: '1' }, {
  lookupFn: async () => ({
    ok: true,
    source: 'کام',
    entries: [{ term: 'work', partOfSpeech: 'NOUN', confidence: 0.8, backTranslations: [{ term: 'کام', examplesAvailable: 3, frequency: 12 }] }]
  })
});
assert.equal(normalized.status, 200);
const normalizedPayload = await normalized.json();
assert.equal(normalizedPayload.ok, true);
assert.deepEqual(normalizedPayload.synonyms, []);
assert.equal(normalizedPayload.synonymStatus, 'verified-source-not-configured');
assert.equal(normalizedPayload.entries[0].term, 'work');
assert.equal(Object.hasOwn(normalizedPayload, 'providerAlias'), false);
assert.equal(Object.hasOwn(normalizedPayload, 'modelAlias'), false);

assert.match(endpoint, /handleDictionaryLookup/, 'Pages endpoint should remain a thin wrapper');
assert.match(page, /<meta name="robots" content="noindex,follow">/, 'Dictionary preview must remain noindex until acceptance');
assert.match(page, /data-dictionary-tool/, 'Dictionary root is missing');
assert.match(page, /value="en-ur"/, 'English→Urdu lookup direction is missing');
assert.match(page, /value="ur-en"/, 'Urdu→English lookup direction is missing');
assert.match(page, /data-dictionary-synonyms-section/, 'Verified synonym boundary UI is missing');
assert.match(page, /Back-translations are shown as context clues, not called synonyms/, 'Page must explain back-translation/synonym distinction');
assert.doesNotMatch(page, /Continue editing in WriteUrdu/, 'Editor handoff is out of scope for dictionary preview');
assert.doesNotMatch(page, /batch-transliteration/, 'Dictionary preview must not become another Roman Urdu surface');

assert.match(browserCore, /MAX_TERM_CHARS = 100/, 'Browser term limit must match server/provider constraint');
assert.match(client, /form\.addEventListener\('submit',\s*lookup\)/, 'Lookup must require explicit form submission');
assert.match(client, /fetch\('\/api\/dictionary-lookup'/, 'Client must use the bounded dictionary endpoint');
assert.doesNotMatch(client, /dictionary\/examples/i, 'First slice must not add an automatic second provider call');
assert.doesNotMatch(client, /providerAlias|modelAlias|AZURE_TRANSLATOR|microsoft/i, 'Browser must not choose/expose provider credentials or aliases');
assert.match(client, /Back-translations above are context clues, not synonyms/, 'Empty synonym state must not mislabel back-translations');
assert.doesNotMatch(client, /console\.(log|info|warn|error)/, 'Client must not log lookup terms/results');
assert.doesNotMatch(client, /innerHTML\s*=/, 'Provider/user dictionary content must not be injected through innerHTML');

console.log('WU-INPUT-001E dictionary foundation contract passed.');
