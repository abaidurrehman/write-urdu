const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const wrapperSource = read('functions', 'lib', 'inpage-unicode.mjs');
const apiSource = read('functions', 'lib', 'inpage-unicode-api.mjs');
const routeSource = read('functions', 'api', 'v1', 'inpage-unicode', 'convert.js');
const engineSource = read('js', 'inpage-unicode-core.js');

// The route file must stay a thin delegate; all real logic lives in the .mjs lib
// (same split this codebase already uses for functions/api/documents.js).
assert.match(routeSource, /from '\.\.\/\.\.\/\.\.\/lib\/inpage-unicode-api\.mjs'/, 'Route must import the shared handler module');
assert.match(routeSource, /handleInPageUnicodeConvert/, 'Route must delegate POST to the shared handler');
assert.match(routeSource, /handleInPageUnicodeOptions/, 'Route must delegate OPTIONS to the shared handler');
assert.doesNotMatch(routeSource, /INPAGE_API_BETA_SECRET/, 'Route file must not duplicate auth logic itself');

// Single source of truth: the wrapper must call the shared engine, never redefine it.
assert.match(wrapperSource, /from '\.\.\/\.\.\/js\/inpage-unicode-core\.js'/, 'Wrapper must import the one canonical engine file');
assert.doesNotMatch(wrapperSource, /BYTE_TO_UNICODE|PREFERRED_BYTE/, 'Wrapper must not redefine mapping tables');
assert.doesNotMatch(apiSource, /BYTE_TO_UNICODE|PREFERRED_BYTE/, 'API handler must not redefine mapping tables');
assert.match(engineSource, /BYTE_TO_UNICODE/, 'The canonical engine file must still own the mapping table');

// Security/contract requirements from WU-API-001 / WU-API-001A.
assert.match(apiSource, /env\.INPAGE_API_ENABLED !== 'true'/, 'Beta API must remain independently feature-gated');
assert.match(apiSource, /timingSafeEqualString/, 'Bearer secret must be compared in constant time');
assert.match(apiSource, /Access-Control-Allow-Origin/, 'This is the first cross-origin route and must set CORS headers');
assert.match(apiSource, /Cache-Control.*no-store|'cache-control': 'no-store'/, 'Responses must not be cached');
assert.doesNotMatch(apiSource, /console\.(?:log|info|warn|error)/, 'API handler must never log request/response text');
assert.doesNotMatch(wrapperSource, /console\.(?:log|info|warn|error)/, 'Wrapper must never log request/response text');
assert.match(apiSource, /ok: false, error: 'invalid_direction'/, "Invalid direction must use this repo's { ok, error } convention");
assert.doesNotMatch(apiSource, /INVALID_REQUEST|AUTHENTICATION_FAILED|RATE_LIMITED/, "Must use this repo's snake_case error codes, not another repo's enum");

(async () => {
  const api = await import(pathToFileURL(path.join(root, 'functions', 'lib', 'inpage-unicode-api.mjs')).href);

  const baseEnv = { INPAGE_API_ENABLED: 'true', INPAGE_API_BETA_SECRET: 'test-secret-value' };

  function request(body, { headers = {}, method = 'POST' } = {}) {
    const text = typeof body === 'string' ? body : JSON.stringify(body);
    return new Request('https://write-urdu.com/api/v1/inpage-unicode/convert', {
      method,
      headers: {
        'content-type': 'application/json',
        'content-length': String(Buffer.byteLength(text)),
        authorization: 'Bearer test-secret-value',
        ...headers
      },
      body: text
    });
  }

  // Disabled kill switch.
  {
    const res = await api.handleInPageUnicodeConvert(request({ direction: 'legacy-to-unicode', text: 'x' }), { INPAGE_API_ENABLED: 'false', INPAGE_API_BETA_SECRET: 'test-secret-value' });
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.equal(body.error, 'conversion_service_not_configured');
  }

  // Missing bearer secret.
  {
    const res = await api.handleInPageUnicodeConvert(request({ direction: 'legacy-to-unicode', text: 'x' }, { headers: { authorization: '' } }), baseEnv);
    assert.equal(res.status, 401);
    assert.equal((await res.json()).error, 'authentication_failed');
  }

  // Wrong bearer secret.
  {
    const res = await api.handleInPageUnicodeConvert(request({ direction: 'legacy-to-unicode', text: 'x' }, { headers: { authorization: 'Bearer wrong' } }), baseEnv);
    assert.equal(res.status, 401);
    assert.equal((await res.json()).error, 'authentication_failed');
  }

  // Oversized declared Content-Length.
  {
    const res = await api.handleInPageUnicodeConvert(request({ direction: 'legacy-to-unicode', text: 'x' }, { headers: { 'content-length': String(500000) } }), baseEnv);
    assert.equal(res.status, 413);
    assert.equal((await res.json()).error, 'payload_too_large');
  }

  // Malformed JSON.
  {
    const res = await api.handleInPageUnicodeConvert(request('{not json', { headers: { 'content-length': String(Buffer.byteLength('{not json')) } }), baseEnv);
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error, 'invalid_request');
  }

  // Invalid direction.
  {
    const res = await api.handleInPageUnicodeConvert(request({ direction: 'sideways', text: 'x' }), baseEnv);
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error, 'invalid_direction');
  }

  // Happy path: legacy -> Unicode.
  {
    const legacyAlif = String.fromCharCode(4) + String.fromCharCode(0x81);
    const res = await api.handleInPageUnicodeConvert(request({ direction: 'legacy-to-unicode', text: legacyAlif }), baseEnv);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), '*');
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.text, 'ا');
    assert.equal(body.converted, 1);
    assert.equal(body.profile, 'inpage-v1v2-clipboard-2026-08-17');
  }

  // Happy path: Unicode -> legacy.
  {
    const res = await api.handleInPageUnicodeConvert(request({ direction: 'unicode-to-legacy', text: 'اردو' }), baseEnv);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(typeof body.text, 'string');
    assert.ok(body.text.length > 0);
  }

  // OPTIONS preflight.
  {
    const res = api.handleInPageUnicodeOptions();
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('Access-Control-Allow-Methods'), 'POST, OPTIONS');
  }

  console.log('InPage Unicode API contract passed.');
})();
