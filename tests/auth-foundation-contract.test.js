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
const pageRegistry = read('docs', 'WU-PUBLIC-PAGE-REGISTRY.csv');
const seoConfigSource = read('seo.config.js');

// WriteUrdu reuses its existing D1 allocation; no new DB binding is introduced.
assert.match(authSource, /D1Adapter\(env\.METRICS_DB\)/, 'Auth.js must use the existing METRICS_DB D1 binding');
assert.match(authSource, /hasD1Binding\(env\.METRICS_DB\)/, 'Auth readiness must validate the existing D1 binding');
assert.doesNotMatch([authSource, meRoute].join('\n'), /ACCOUNT_DB|WRITE_URDU_DB/, 'Auth runtime must not introduce a second D1 binding');
const authTables = [...migration.matchAll(/CREATE TABLE IF NOT EXISTS\s+"([^"]+)"/gi)].map(match => match[1]).sort();
assert.deepStrictEqual(authTables, ['accounts', 'sessions', 'users', 'verification_tokens'].sort(), 'Auth migration must create only the four Auth.js-owned tables');
assert.match(migration, /CREATE TABLE IF NOT EXISTS "accounts"/, 'Auth.js accounts table migration is required');
assert.match(migration, /CREATE TABLE IF NOT EXISTS "sessions"/, 'Auth.js sessions table migration is required');
assert.match(migration, /CREATE TABLE IF NOT EXISTS "users"/, 'Auth.js users table migration is required');
assert.match(migration, /CREATE TABLE IF NOT EXISTS "verification_tokens"/, 'Auth.js verification token table migration is required');

// Keep Auth.js behind one project-owned boundary.
assert.match(authSource, /from '@auth\/core'/, 'The project auth wrapper must import Auth.js core');
assert.match(authSource, /from '@auth\/d1-adapter'/, 'The project auth wrapper must import the D1 adapter');
assert.match(authSource, /from '@auth\/core\/providers\/facebook'/, 'The project auth wrapper must import the Facebook provider for AUTH-D');
assert.doesNotMatch([authRoute, meRoute].join('\n'), /from '@auth\//, 'Pages routes must use the WriteUrdu auth wrapper instead of importing Auth.js directly');
assert.match(authRoute, /handleAuthRequest/, 'The catch-all route must delegate to the project auth wrapper');

// Identity remains minimal and stable-user-ID based.
assert.match(authSource, /openid email profile/, 'Google identity scope must remain minimal');
assert.doesNotMatch(authSource, /drive|gmail|calendar|contacts/i, 'Identity login must not request Google product-data scopes');
assert.match(authSource, /FACEBOOK_IDENTITY_SCOPE = 'email'/, 'Facebook identity scope must stay minimal');
assert.doesNotMatch(authSource, /user_friends|pages_show_list|publish_actions|instagram_basic|ads_management|pages_manage/i, 'Facebook scope must stay identity-only, not social/Page/ads permissions');
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

// Provider-aware sign-in rendering: a provider button appears only once it is actually configured/ready.
assert.match(accountSession, /fetchReadyProviderIds/, 'Sign-in must be able to read which providers are actually ready');
assert.match(accountPage, /fetchReadyProviderIds/, 'Account page must gate provider buttons on readiness, not show every provider unconditionally');
assert.match(signIn, /data-google-sign-in data-provider-id="google" hidden/, 'Google form must start hidden until confirmed ready');
assert.match(signIn, /data-facebook-sign-in data-provider-id="facebook" hidden/, 'Facebook form must start hidden until confirmed ready');
assert.match(accountSession, /candidate\.startsWith\('\/'\)/, 'Return targets must be local paths');
assert.match(accountSession, /candidate\.startsWith\('\/\/'\)/, 'Protocol-relative return targets must be rejected');
assert.match(accountSession, /BLOCKED_RETURN_PREFIXES/, 'Sensitive/internal account return targets must be blocked');

// Account UI stays optional, governed and non-indexable.
assert.match(signIn, /meta name="robots" content="noindex,follow,noarchive"/, 'Sign-in page must follow the WU noindex utility convention');
assert.match(signIn, /meta name="googlebot" content="noindex,follow"/, 'Sign-in page must include the WU Googlebot utility directive');
assert.match(signIn, /Continue with Google/, 'Google is the first account provider');
assert.match(signIn, /Continue with Facebook/, 'Facebook is available as a second account provider (AUTH-D)');
assert.match(signIn, /data-provider-id="google"/, 'Google sign-in form must be identifiable for provider-aware rendering');
assert.match(signIn, /data-provider-id="facebook"/, 'Facebook sign-in form must be identifiable for provider-aware rendering');
assert.match(signIn, /Existing local drafts are not uploaded/, 'Sign-in page must state the local-first boundary');
assert.match(seoConfigSource, /id: 'sign-in'[\s\S]*path: '\/sign-in'[\s\S]*indexable: false/, 'Sign-in must be registered as a noindex SEO utility');
assert.match(pageRegistry, /sign-in\.html,\/sign-in,Utility,[^\n]*,noindex,no,/, 'Sign-in must be registered as noindex and excluded from the sitemap');
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
  assert.strictEqual(auth.buildIdentityProviders(readyEnv).length, 1);
  assert.strictEqual(auth.resolveAuthRedirect('/urdu-editor?from=account', 'https://write-urdu.com'), 'https://write-urdu.com/urdu-editor?from=account');
  assert.strictEqual(auth.resolveAuthRedirect('https://evil.example/path', 'https://write-urdu.com'), 'https://write-urdu.com/');

  // Facebook (AUTH-D): a complete pair becomes available alongside Google; an incomplete pair
  // is excluded without disabling Google (provider-neutral readiness regression).
  const bothProvidersEnv = { ...readyEnv, FACEBOOK_CLIENT_ID: 'facebook-client-id', FACEBOOK_CLIENT_SECRET: 'facebook-client-secret' };
  assert.deepStrictEqual(auth.getAuthReadiness(bothProvidersEnv).providers, ['google', 'facebook']);
  assert.strictEqual(auth.buildIdentityProviders(bothProvidersEnv).length, 2);

  const partialFacebookEnv = { ...readyEnv, FACEBOOK_CLIENT_ID: 'facebook-client-id-only' };
  const partialReadiness = auth.getAuthReadiness(partialFacebookEnv);
  assert.strictEqual(partialReadiness.ready, true, 'Google alone must remain ready when Facebook is only partially configured');
  assert.deepStrictEqual(partialReadiness.providers, ['google']);
  assert.deepStrictEqual(partialReadiness.partialProviders, ['facebook']);
  assert.strictEqual(auth.buildIdentityProviders(partialFacebookEnv).length, 1, 'An incomplete Facebook credential pair must not construct a broken provider');

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
