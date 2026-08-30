const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const moderationSource = read('functions', 'lib', 'community-moderation.mjs');
const queueRoute = read('functions', 'api', 'internal', 'community', 'moderation', 'index.js');
const detailRoute = read('functions', 'api', 'internal', 'community', 'moderation', '[id].js');
const approveRoute = read('functions', 'api', 'internal', 'community', 'moderation', '[id]', 'approve.js');
const rejectRoute = read('functions', 'api', 'internal', 'community', 'moderation', '[id]', 'reject.js');
const unpublishRoute = read('functions', 'api', 'internal', 'community', 'publications', '[id]', 'unpublish.js');
const osHtml = read('os', 'community-writing.html');
const osScript = read('js', 'community-writing-os.mjs');

// --- Routes delegate to the domain module (no bespoke auth invented per route) ---
assert.match(queueRoute, /handleModerationQueue/, 'Queue route must delegate to the moderation module');
assert.match(detailRoute, /handleModerationDetail/, 'Detail route must delegate to the moderation module');
assert.match(approveRoute, /handleModerationApprove/, 'Approve route must delegate to the moderation module');
assert.match(rejectRoute, /handleModerationReject/, 'Reject route must delegate to the moderation module');
assert.match(unpublishRoute, /handlePublicationUnpublish/, 'Unpublish route must delegate to the moderation module');

// --- No writer/public API may perform these transitions (Slice C's non-negotiable rule) ---
const submissionsSource = read('functions', 'lib', 'community-submissions.mjs');
assert.doesNotMatch(submissionsSource, /status\s*=\s*'approved'|reviewed_by|reviewed_at\s*=/, 'Writer-facing submissions module must never itself perform approval transitions');

// --- Fail-closed host + Access identity boundary ---
assert.match(moderationSource, /PRODUCT_OS_HOST/, 'Moderation must gate on the protected OS host');
assert.match(moderationSource, /cf-access-authenticated-user-email/, 'Moderation must read the Cloudflare Access identity header');
assert.match(moderationSource, /COMMUNITY_MODERATOR_EMAILS/, 'Optional moderator allowlist must be supported');
assert.doesNotMatch(moderationSource, /localStorage|query(?:String)?\.get\(['"]role['"]\)|searchParams\.get\(['"]role['"]\)/i,
  'Moderator identity must never be sourced from client-controlled storage/query state');
assert.doesNotMatch(moderationSource, /console\.(?:log|info|warn|error)/, 'Moderation runtime must not log private writing content');

// --- Audit/privacy: no writer email, no token persistence, no writing_documents access ---
assert.doesNotMatch(moderationSource, /writing_documents/, 'Moderation must never touch the private My Documents table (unpublish must not delete source)');
assert.doesNotMatch(moderationSource, /writerEmail|writer_email/i, 'Moderation must not persist writer email in the moderation row');

// --- OS UI: no client-role/session-email bypass, structured rejection UI, exact preview ---
assert.match(osHtml, /noindex/, 'Internal moderation console must stay noindex');
assert.match(osHtml, /lang="ur" dir="rtl"/, 'Review body must render Urdu writing in correct script direction');
assert.doesNotMatch(osScript, /console\.(?:log|info|warn|error)/, 'OS moderation UI must not log private writing content');
assert.match(osScript, /credentials: 'same-origin'/, 'OS moderation client must use safe request defaults');

(async () => {
  const moderation = await import(pathToFileURL(path.join(root, 'functions', 'lib', 'community-moderation.mjs')).href);

  const req = (url, headers) => new Request(url, { headers: headers || {} });

  // Public WriteUrdu hostname cannot reach moderation, even with a well-formed Access header.
  let response = await moderation.handleModerationQueue(
    req('https://write-urdu.com/api/internal/community/moderation', { 'cf-access-authenticated-user-email': 'mod@write-urdu.com' }),
    { PRODUCT_OS_HOST: 'os.write-urdu.com', METRICS_DB: { prepare() { return {}; } } }
  );
  assert.strictEqual(response.status, 404);

  // Protected host but missing Access identity header fails closed.
  response = await moderation.handleModerationQueue(
    req('https://os.write-urdu.com/api/internal/community/moderation'),
    { PRODUCT_OS_HOST: 'os.write-urdu.com', METRICS_DB: { prepare() { return {}; } } }
  );
  assert.strictEqual(response.status, 401);
  assert.strictEqual((await response.json()).error.code, 'moderator_identity_required');

  // Access sometimes forwards only Cf-Access-Jwt-Assertion without the
  // pre-parsed email header (observed in production on this Pages domain) --
  // moderation must fall back to the email claim inside the already-validated JWT.
  const jwtPayload = Buffer.from(JSON.stringify({ email: 'mod@write-urdu.com' })).toString('base64url');
  response = await moderation.handleModerationQueue(
    req('https://os.write-urdu.com/api/internal/community/moderation', { 'cf-access-jwt-assertion': `header.${jwtPayload}.sig` }),
    { PRODUCT_OS_HOST: 'os.write-urdu.com', METRICS_DB: { prepare() { return {}; } } },
    { repositoryFactory() { return { async listQueue() { return []; } }; } }
  );
  assert.strictEqual(response.status, 200, 'Missing email header must fall back to the Cf-Access-Jwt-Assertion email claim');

  // A malformed/garbage JWT assertion must not be trusted blindly -- fails closed.
  response = await moderation.handleModerationQueue(
    req('https://os.write-urdu.com/api/internal/community/moderation', { 'cf-access-jwt-assertion': 'not-a-jwt' }),
    { PRODUCT_OS_HOST: 'os.write-urdu.com', METRICS_DB: { prepare() { return {}; } } }
  );
  assert.strictEqual(response.status, 401);

  // Malformed header value (not an email) fails closed rather than trusting it blindly.
  response = await moderation.handleModerationQueue(
    req('https://os.write-urdu.com/api/internal/community/moderation', { 'cf-access-authenticated-user-email': 'not-an-email' }),
    { PRODUCT_OS_HOST: 'os.write-urdu.com', METRICS_DB: { prepare() { return {}; } } }
  );
  assert.strictEqual(response.status, 401);

  // Configured allowlist rejects an Access identity that is not on it.
  response = await moderation.handleModerationQueue(
    req('https://os.write-urdu.com/api/internal/community/moderation', { 'cf-access-authenticated-user-email': 'outsider@example.com' }),
    {
      PRODUCT_OS_HOST: 'os.write-urdu.com',
      METRICS_DB: { prepare() { return {}; } },
      COMMUNITY_MODERATOR_EMAILS: 'mod@write-urdu.com, other@write-urdu.com'
    }
  );
  assert.strictEqual(response.status, 403);
  assert.strictEqual((await response.json()).error.code, 'moderator_not_authorized');

  // Configured allowlist accepts a matching Access identity (case/space-insensitive).
  response = await moderation.handleModerationQueue(
    req('https://os.write-urdu.com/api/internal/community/moderation', { 'cf-access-authenticated-user-email': ' Mod@Write-Urdu.com ' }),
    {
      PRODUCT_OS_HOST: 'os.write-urdu.com',
      METRICS_DB: { prepare() { return {}; } },
      COMMUNITY_MODERATOR_EMAILS: 'mod@write-urdu.com'
    },
    { repositoryFactory() { return { async listQueue() { return []; } }; } }
  );
  assert.strictEqual(response.status, 200);

  // Missing D1 binding fails closed with 503, never a silent empty-success.
  response = await moderation.handleModerationQueue(
    req('https://os.write-urdu.com/api/internal/community/moderation', { 'cf-access-authenticated-user-email': 'mod@write-urdu.com' }),
    { PRODUCT_OS_HOST: 'os.write-urdu.com' }
  );
  assert.strictEqual(response.status, 503);

  // Mutation endpoints (approve/reject/unpublish) share the same fail-closed boundary.
  const mutationEnv = { PRODUCT_OS_HOST: 'os.write-urdu.com', METRICS_DB: { prepare() { return {}; } } };
  for (const call of [
    () => moderation.handleModerationApprove(new Request('https://write-urdu.com/x', { method: 'POST', body: '{}' }), mutationEnv, 'id'),
    () => moderation.handleModerationReject(new Request('https://write-urdu.com/x', { method: 'POST', body: '{}' }), mutationEnv, 'id'),
    () => moderation.handlePublicationUnpublish(new Request('https://write-urdu.com/x', { method: 'POST' }), mutationEnv, 'id')
  ]) {
    const result = await call();
    assert.strictEqual(result.status, 404, 'Mutation route must also fail closed on the public host');
  }

  console.log('Community moderation security (COMMUNITY-C security) contracts passed.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
