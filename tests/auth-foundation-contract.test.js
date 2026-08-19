const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const authSource = read('functions', 'lib', 'auth.mjs');
const authRoute = read('functions', 'api', 'auth', '[[path]].js');
const meRoute = read('functions', 'api', 'me.js');
const migration = read('migrations', '0005_authjs_d1_foundation.sql');
const accountSession = read('js', 'account-session.mjs');
const accountControl = read('js', 'account-control.mjs');
const accountPage = read('js', 'account-page.mjs');
const signIn = read('sign-in.html');
const header = read('site-header.js');
const serviceWorker = read('sw.js');
const headers = read('_headers');
const redirects = read('_redirects');

// WriteUrdu reuses its existing D1 allocation; no new DB binding is introduced.
assert.match(authSource, /D1Adapter\(env\.METRICS_DB\)/, 'Auth.js must use the existing METRICS_DB D1 binding');
assert.match(authSource, /hasD1Binding\(env\.METRICS_DB\)/, 'Auth readiness must validate the existing D1 binding');
assert.doesNotMatch([authSource, meRoute].join('\n'), /ACCOUNT_DB|WRITE_URDU_DB/, 'Auth runtime must not introduce a second D1 binding');
assert.match(migration, /CREATE TABLE IF NOT EXISTS "accounts"/, 'Auth.js accounts table migration is required');
assert.match(migration, /CREATE TABLE IF NOT EXISTS "sessions"/, 'Auth.js sessions table migration is required');
assert.match(migration, /CREATE TABLE IF NOT EXISTS "users"/, 'Auth.js users table migration is required');
assert.match(migration, /CREATE TABLE IF NOT EXISTS "verification_tokens"/, 'Auth.js verification token table migration is required');
assert.doesNotMatch(migration, /draft|document|public_text|product_events/i, 'Auth migration must not mix writing or telemetry payload tables into Auth.js ownership');

// Keep Auth.js behind one project-owned boundary.
assert.match(authSource, /from '@auth\/core'/, 'The project auth wrapper must import Auth.js core');
assert.match(authSource, /from '@auth\/d1-adapter'/, 'The project auth wrapper must import the D1 adapter');
assert.doesNotMatch([authRoute, meRoute].join('\n'), /from '@auth\//, 'Pages routes must use the WriteUrdu auth wrapper instead of importing Auth.js directly');
assert.match(authRoute, /handleAuthRequest/, 'The catch-all route must delegate to the project auth wrapper');

// Identity remains minimal and stable-user-ID based.
assert.match(authSource, /openid email profile/, 'Google identity scope must remain minimal');
assert.doesNotMatch(authSource, /drive|gmail|calendar|contacts/i, 'Identity login must not request Google product-data scopes');
assert.match(authSource, /allowDangerousEmailAccountLinking:\s*false/, 'Automatic provider linking by matching email must remain disabled');
assert.match(authSource, /session\.user = \{ \.\.\.session\.user, id: userId \}/, 'Stable adapter user ID must be exposed to product session code');
assert.match(authSource, /target\.origin === base\.origin/, 'Auth redirects must remain same-origin');
assert.match(authSource, /Cache-Control': 'no-store'/, 'Auth responses must be no-store');
assert.match(meRoute, /Cache-Control': 'no-store'/, '/api/me must be no-store');

// Optional-account behavior and safe account projection.
assert.match(meRoute, /authenticated: false, available: false/, 'Auth disabled must project a safe unavailable state');
assert.match(meRoute, /authenticated: false, available: true/, 'Signed-out ready auth must project an available state');
assert.match(meRoute, /id: String\(session\.user\.id\)/, '/api/me must expose stable user ID');
assert.doesNotMatch(meRoute, /access_token|refresh_token|sessionToken|providerAccountId/, '/api/me must not expose Auth.js/provider credentials');

// OAuth navigation preserves the existing local draft path instead of creating a second save stack.
assert.match(accountSession, /WriteUrduTools\?\.saveDraft/, 'Account navigation must reuse the existing local draft save hook');
assert.match(accountControl, /flushLocalWriting\(runtime\)/, 'Header sign-in must flush local writing before navigation');
assert.match(accountPage, /flushLocalWriting\(window\)/, 'Account page must preserve local writing if entered from a writing route');
assert.match(accountSession, /candidate\.startsWith\('\/'\)/, 'Return targets must be local paths');
assert.match(accountSession, /candidate\.startsWith\('\/\/'\)/, 'Protocol-relative return targets must be rejected');
assert.match(accountSession, /BLOCKED_RETURN_PREFIXES/, 'Sensitive/internal account return targets must be blocked');

// Account UI stays optional and non-indexable.
assert.match(signIn, /meta name="robots" content="noindex,nofollow,noarchive"/, 'Sign-in page must be noindex');
assert.match(signIn, /Continue with Google/, 'Google is the first account provider');
assert.match(signIn, /Existing local drafts are not uploaded/, 'Sign-in page must state the local-first boundary');
assert.match(header, /data-wu-account-control/, 'Shared shell must reserve an optional account control');
assert.match(header, /account-control\.mjs/, 'Shared shell must load the isolated account control module');
assert.match(headers, /\/sign-in[\s\S]*X-Robots-Tag: noindex/, 'HTTP headers must reinforce sign-in noindex');
assert.match(redirects, /\/sign-in\.html \/sign-in 301/, 'Sign-in must have a canonical extensionless route');

// The existing PWA cache must never cache request-specific account/session APIs.
assert.match(serviceWorker, /url\.pathname\.startsWith\('\/api\/'\)/, 'Service worker must bypass every API route');
assert.match(serviceWorker, /url\.pathname === '\/sign-in'/, 'Service worker must not cache the account shell');

(async () => {
  const auth = await import(pathToFileURL(path.join(root, 'functions', 'lib', 'auth.mjs')).href);
  const fakeDb = { prepare() { return {}; } };
  const readyEnv = {
    AUTH_ENABLED: 'true',
    AUTH_SECRET: 'test-secret-not-for-production',
    METRICS_DB: fakeDb,
    GOOGLE_CLIENT_ID: 'google-client-id',
    GOOGLE_CLIENT_SECRET: 'google-client-secret'
  };

  assert.strictEqual(auth.getAuthReadiness({}).state, auth.AUTH_CONFIGURATION_STATE.DISABLED);
  assert.strictEqual(auth.getAuthReadiness({ AUTH_ENABLED: 'true' }).state, auth.AUTH_CONFIGURATION_STATE.MISCONFIGURED);
  assert.deepStrictEqual(auth.getAuthReadiness(readyEnv).providers, ['google']);
  assert.strictEqual(auth.getAuthReadiness(readyEnv).ready, true);
  assert.strictEqual(auth.resolveAuthRedirect('/urdu-editor?from=account', 'https://write-urdu.com'), 'https://write-urdu.com/urdu-editor?from=account');
  assert.strictEqual(auth.resolveAuthRedirect('https://evil.example/path', 'https://write-urdu.com'), 'https://write-urdu.com/');

  let called = false;
  const disabledResponse = await auth.handleAuthRequest(new Request('https://write-urdu.com/api/auth/session'), {}, {
    auth: async () => { called = true; return new Response('{}'); }
  });
  assert.strictEqual(disabledResponse.status, 404);
  assert.strictEqual(called, false);

  const readyResponse = await auth.handleAuthRequest(new Request('https://write-urdu.com/api/auth/session'), readyEnv, {
    auth: async () => new Response('{}', { status: 200 })
  });
  assert.strictEqual(readyResponse.status, 200);
  assert.strictEqual(readyResponse.headers.get('cache-control'), 'no-store');

  const session = await auth.getSession(new Request('https://write-urdu.com/', {
    headers: { cookie: 'example=session' }
  }), readyEnv, {
    auth: async (request) => {
      assert.strictEqual(new URL(request.url).pathname, '/api/auth/session');
      assert.strictEqual(request.headers.get('cookie'), 'example=session');
      return new Response(JSON.stringify({ user: { id: 'user-123', name: 'Writer' } }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }
  });
  assert.strictEqual(session.user.id, 'user-123');

  console.log('Auth.js account foundation contracts passed.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
