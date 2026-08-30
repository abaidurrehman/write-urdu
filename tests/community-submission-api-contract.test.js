const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const migration = read('migrations', '0012_community_writing.sql');
const submissionsSource = read('functions', 'lib', 'community-submissions.mjs');
const contentSource = read('functions', 'lib', 'community-content.mjs');
const taxonomySource = read('functions', 'lib', 'community-taxonomy.mjs');
const collectionRoute = read('functions', 'api', 'community', 'submissions.js');
const itemRoute = read('functions', 'api', 'community', 'submissions', '[id].js');

// --- Migration: additive, community-owned tables only ---
assert.match(migration, /CREATE TABLE IF NOT EXISTS "community_writing_submissions"/, 'Slice A must add the submissions table');
assert.match(migration, /CREATE TABLE IF NOT EXISTS "community_writing_publications"/, 'Slice A must add the publications table');
assert.match(migration, /CREATE TABLE IF NOT EXISTS "community_writing_reports"/, 'Slice A must add the reports table');
assert.doesNotMatch(migration, /\b(?:ALTER|DROP)\s+TABLE\b/i, 'Community migration must remain additive');
const createdTables = [...migration.matchAll(/CREATE TABLE IF NOT EXISTS\s+"([^"]+)"/gi)].map((match) => match[1]);
assert.deepStrictEqual(
  createdTables,
  ['community_writing_submissions', 'community_writing_publications', 'community_writing_reports'],
  'Slice A migration must create only its product-owned tables'
);
assert.doesNotMatch(migration, /"writing_documents"|"share_artifacts"|"verification_tokens"|"users"|"accounts"|"sessions"/,
  'Community migration must never touch existing telemetry/share/Auth.js/document tables');

for (const index of [
  'idx_community_submissions_status_submitted',
  'idx_community_submissions_user_submitted',
  'idx_community_submissions_user_status_submitted',
  'idx_community_submissions_publication_revision',
  'idx_community_submissions_signature_submitted',
  'idx_community_publications_status_published',
  'idx_community_publications_status_category_published',
  'idx_community_publications_user_status_published',
  'idx_community_reports_publication_created'
]) {
  assert.match(migration, new RegExp(index), `Required index missing: ${index}`);
}

assert.match(migration, /"status" TEXT NOT NULL CHECK \("status" IN \('pending', 'rejected', 'approved', 'withdrawn'\)\)/,
  'Submission status must be constrained to the documented state set');
assert.match(migration, /"status" TEXT NOT NULL CHECK \("status" IN \('published', 'unpublished'\)\)/,
  'Publication status must be constrained to the documented state set');
assert.match(migration, /"reason" TEXT NOT NULL CHECK \("reason" IN \('spam', 'abuse', 'privacy', 'copyright', 'other'\)\)/,
  'Report reason must be constrained to the documented reason set');
assert.doesNotMatch(migration, /reporter|reporter_id|reporter_email|ip_address|user_agent/i,
  'Reports table must never carry reporter identity');

// --- Routes: use the project auth boundary, delegate to the domain module ---
assert.match(collectionRoute, /from '\.\.\/\.\.\/lib\/auth\.mjs'/, 'Collection route must use the project auth boundary');
assert.match(itemRoute, /from '\.\.\/\.\.\/\.\.\/lib\/auth\.mjs'/, 'Item route must use the project auth boundary');
assert.match(collectionRoute, /handleSubmissionsCollection/, 'Collection route must delegate to the community submissions module');
assert.match(itemRoute, /handleSubmissionItem/, 'Item route must delegate to the community submissions module');
assert.doesNotMatch([collectionRoute, itemRoute].join('\n'), /from '@auth\//, 'Community routes must not import Auth.js directly');

// --- Domain module: platform decisions preserved ---
assert.match(submissionsSource, /env\.COMMUNITY_SUBMISSIONS_ENABLED !== 'true'/, 'Submissions must be independently feature-gated');
assert.match(submissionsSource, /env\.METRICS_DB/, 'Submissions must reuse the existing D1 binding');
assert.doesNotMatch(submissionsSource, /COMMUNITY_DB|WRITE_URDU_DB|ACCOUNT_DB/, 'Submissions must not create or depend on another D1 binding');
assert.match(submissionsSource, /MAX_PENDING_PER_USER = 5/, '5-pending-per-user quota is required');
assert.match(submissionsSource, /MAX_SUBMISSIONS_PER_24H = 10/, '10-submissions-per-24h rate bound is required');
assert.match(submissionsSource, /Cache-Control': 'no-store'/, 'Every submission response must be no-store');
assert.match(submissionsSource, /WHERE id = \?1 AND user_id = \?2/, 'Single-submission reads must be owner scoped');
assert.match(submissionsSource, /WHERE id = \?13 AND user_id = \?14 AND status = 'pending' AND submission_revision = \?15/,
  'Pending updates must be scoped by owner, pending state and last-known revision');
assert.match(submissionsSource, /community_submission_revision_conflict/, 'Stale revisions must surface a deterministic conflict code');
assert.match(submissionsSource, /rightsConfirmed !== true/, 'Rights confirmation must be strictly required');
assert.match(submissionsSource, /publicConfirmed !== true/, 'Public confirmation must be strictly required');
assert.doesNotMatch(submissionsSource, /console\.(?:log|info|warn|error)/, 'Community runtime must not log private writing content');

assert.match(contentSource, /MAX_TITLE_CHARS = 180/, 'Title limit must match the slice spec');
assert.match(contentSource, /MAX_PUBLIC_AUTHOR_CHARS = 80/, 'Public author name limit must match the slice spec');
assert.match(contentSource, /MIN_PLAIN_TEXT_CHARS = 80/, 'Minimum body length must match the slice spec');
assert.match(contentSource, /MAX_PLAIN_TEXT_UTF8_BYTES = 500 \* 1024/, 'Body byte cap must match the slice spec');
assert.match(contentSource, /ALLOWED_CONTENT_FORMATS = Object\.freeze\(\['plain'\]\)/,
  'Slice A must store plain text only until a proven sanitizer exists');
assert.doesNotMatch(contentSource, /console\.(?:log|info|warn|error)/, 'Content module must not log private writing content');

assert.match(taxonomySource, /'poetry'/, 'Primary category taxonomy must be present');
assert.match(taxonomySource, /MAX_TAGS = 5/, 'Tag cardinality cap must match the slice spec');
assert.doesNotMatch(taxonomySource, /console\.(?:log|info|warn|error)/, 'Taxonomy module must not log');

(async () => {
  const community = await import(pathToFileURL(path.join(root, 'functions', 'lib', 'community-submissions.mjs')).href);
  const fakeDb = { prepare() { return {}; } };
  const env = { COMMUNITY_SUBMISSIONS_ENABLED: 'true', METRICS_DB: fakeDb };
  const signedIn = async () => ({ user: { id: 'user-a' } });

  const validPayload = () => ({
    editorKind: 'basic',
    contentFormat: 'plain',
    title: 'ایک نظم',
    publicAuthorName: 'قلم کار',
    plainText: 'یہ ایک آزمائشی تحریر ہے جو اسی جانچ کے لیے کافی طویل ہونی چاہیے تاکہ کم از کم حروف کی حد پوری ہو سکے۔ '.repeat(2),
    primaryCategory: 'poetry',
    tags: ['ghazal'],
    rightsConfirmed: true,
    publicConfirmed: true,
    guidelinesVersion: '2026-08-25'
  });

  const post = (body) => new Request('https://write-urdu.com/api/community/submissions', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });

  // Disabled feature must fail closed before touching session/database.
  let sessionCalled = false;
  let response = await community.handleSubmissionsCollection(new Request('https://write-urdu.com/api/community/submissions'), {}, {
    getSession: async () => { sessionCalled = true; return { user: { id: 'unexpected' } }; }
  });
  assert.strictEqual(response.status, 404);
  assert.strictEqual(sessionCalled, false);

  // Unauthenticated must be rejected.
  response = await community.handleSubmissionsCollection(new Request('https://write-urdu.com/api/community/submissions'), env, {
    getSession: async () => null,
    repositoryFactory() { throw new Error('repository must not initialize before authentication'); }
  });
  assert.strictEqual(response.status, 401);

  // GET list is owner-scoped.
  let listOwner = '';
  response = await community.handleSubmissionsCollection(new Request('https://write-urdu.com/api/community/submissions'), env, {
    getSession: signedIn,
    repositoryFactory() {
      return { async list(userId) { listOwner = userId; return [{ id: 'metadata-only' }]; } };
    }
  });
  assert.strictEqual(response.status, 200);
  assert.strictEqual(listOwner, 'user-a');

  // Invalid editor kind rejected.
  response = await community.handleSubmissionsCollection(post({ ...validPayload(), editorKind: 'invoice' }), env, {
    getSession: signedIn,
    repositoryFactory() { return {}; }
  });
  assert.strictEqual(response.status, 400);
  assert.strictEqual((await response.json()).error.code, 'community_editor_kind_invalid');

  // Rich content format rejected in Slice A (no proven sanitizer).
  response = await community.handleSubmissionsCollection(post({ ...validPayload(), contentFormat: 'rich' }), env, {
    getSession: signedIn,
    repositoryFactory() { return {}; }
  });
  assert.strictEqual(response.status, 400);
  assert.strictEqual((await response.json()).error.code, 'community_content_format_invalid');

  // Missing rights confirmation rejected.
  response = await community.handleSubmissionsCollection(post({ ...validPayload(), rightsConfirmed: false }), env, {
    getSession: signedIn,
    repositoryFactory() { return {}; }
  });
  assert.strictEqual(response.status, 400);
  assert.strictEqual((await response.json()).error.code, 'community_rights_confirmation_required');

  // Invalid tag rejected (no free-form public tags).
  response = await community.handleSubmissionsCollection(post({ ...validPayload(), tags: ['not-a-real-tag'] }), env, {
    getSession: signedIn,
    repositoryFactory() { return {}; }
  });
  assert.strictEqual(response.status, 400);
  assert.strictEqual((await response.json()).error.code, 'community_tags_invalid');

  // Body below minimum length rejected.
  response = await community.handleSubmissionsCollection(post({ ...validPayload(), plainText: 'بہت مختصر' }), env, {
    getSession: signedIn,
    repositoryFactory() { return {}; }
  });
  assert.strictEqual(response.status, 400);
  assert.strictEqual((await response.json()).error.code, 'community_plain_text_too_short');

  // Unowned source document reference rejected.
  response = await community.handleSubmissionsCollection(
    post({ ...validPayload(), sourceDocumentId: '123e4567-e89b-12d3-a456-426614174000' }),
    env,
    {
      getSession: signedIn,
      repositoryFactory() {
        return { async verifyDocumentOwnership() { return false; } };
      }
    }
  );
  assert.strictEqual(response.status, 400);
  assert.strictEqual((await response.json()).error.code, 'community_source_document_invalid');

  // Exact duplicate pending submission returns the existing row instead of creating queue spam.
  response = await community.handleSubmissionsCollection(post(validPayload()), env, {
    getSession: signedIn,
    repositoryFactory() {
      return {
        async findPendingDuplicate() { return { id: 'existing-pending' }; }
      };
    }
  });
  assert.strictEqual(response.status, 200);
  assert.deepStrictEqual((await response.json()).submission, { id: 'existing-pending' });

  // Pending quota enforced.
  response = await community.handleSubmissionsCollection(post(validPayload()), env, {
    getSession: signedIn,
    repositoryFactory() {
      return {
        async findPendingDuplicate() { return null; },
        async countPending() { return 5; }
      };
    }
  });
  assert.strictEqual(response.status, 409);
  assert.strictEqual((await response.json()).error.code, 'community_pending_quota_reached');

  // Rolling 24h rate limit enforced.
  response = await community.handleSubmissionsCollection(post(validPayload()), env, {
    getSession: signedIn,
    repositoryFactory() {
      return {
        async findPendingDuplicate() { return null; },
        async countPending() { return 0; },
        async countSince() { return 10; }
      };
    }
  });
  assert.strictEqual(response.status, 429);
  assert.strictEqual((await response.json()).error.code, 'community_submission_rate_limited');

  // Successful create: owner comes from session, never from request body.
  let createArgs;
  response = await community.handleSubmissionsCollection(
    post({ ...validPayload(), userId: 'attacker-controlled-owner', status: 'approved' }),
    env,
    {
      getSession: signedIn,
      randomUUID: () => '123e4567-e89b-12d3-a456-426614174000',
      now: () => '2026-08-28T12:00:00.000Z',
      repositoryFactory() {
        return {
          async findPendingDuplicate() { return null; },
          async countPending() { return 0; },
          async countSince() { return 0; },
          async create(...args) {
            createArgs = args;
            return { id: args[3], status: 'pending' };
          }
        };
      }
    }
  );
  assert.strictEqual(response.status, 201);
  assert.strictEqual(createArgs[0], 'user-a', 'Owner must come from session.user.id, never request JSON');
  assert.strictEqual(createArgs[1].primaryCategory, 'poetry');
  assert.strictEqual((await response.json()).submission.status, 'pending');

  // GET item is owner-scoped.
  const id = '123e4567-e89b-12d3-a456-426614174000';
  let getArgs;
  response = await community.handleSubmissionItem(new Request(`https://write-urdu.com/api/community/submissions/${id}`), env, id, {
    getSession: signedIn,
    repositoryFactory() {
      return { async get(...args) { getArgs = args; return { id, status: 'pending' }; } };
    }
  });
  assert.strictEqual(response.status, 200);
  assert.deepStrictEqual(getArgs, ['user-a', id]);

  // Stale revision on PATCH surfaces a conflict, not a silent overwrite.
  response = await community.handleSubmissionItem(
    new Request(`https://write-urdu.com/api/community/submissions/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...validPayload(), submissionRevision: 1 })
    }),
    env,
    id,
    {
      getSession: signedIn,
      now: () => '2026-08-28T12:05:00.000Z',
      repositoryFactory() {
        return {
          async updatePending(userId, submissionId, revision) {
            assert.strictEqual(userId, 'user-a');
            assert.strictEqual(submissionId, id);
            assert.strictEqual(revision, 1);
            return { status: 'conflict', currentRevision: 2, currentStatus: 'pending' };
          }
        };
      }
    }
  );
  assert.strictEqual(response.status, 409);
  const conflict = await response.json();
  assert.strictEqual(conflict.error.code, 'community_submission_revision_conflict');
  assert.strictEqual(conflict.error.currentRevision, 2);

  assert.deepStrictEqual(community.COMMUNITY_SUBMISSION_LIMITS.allowedEditorKinds, ['basic', 'rich', 'keyboard', 'voice', 'card']);
  assert.strictEqual(community.COMMUNITY_SUBMISSION_LIMITS.maxPendingPerUser, 5);
  assert.strictEqual(community.COMMUNITY_SUBMISSION_LIMITS.maxSubmissionsPer24h, 10);

  // Content signature is deterministic and order-independent for tags.
  const content = await import(pathToFileURL(path.join(root, 'functions', 'lib', 'community-content.mjs')).href);
  const a = await content.contentSignature({ title: 't', publicAuthorName: 'n', plainText: 'p', primaryCategory: 'poetry', tags: ['ghazal', 'story'] });
  const b = await content.contentSignature({ title: 't', publicAuthorName: 'n', plainText: 'p', primaryCategory: 'poetry', tags: ['story', 'ghazal'] });
  assert.strictEqual(a, b, 'Signature must be independent of submitted tag order');
  assert.match(a, /^[0-9a-f]{64}$/, 'Signature must be a SHA-256 hex digest');

  // Urdu plain text with internal spaces must survive normalization untouched.
  const roundTrip = content.validatePlainText('یہ ایک ازمائشی سطر ہے جس میں کئی الفاظ اور خالی جگہیں شامل ہیں تاکہ کم از کم طوالت پوری ہو سکے۔');
  assert.strictEqual(roundTrip.error, undefined);
  assert.match(roundTrip.value, / /, 'Word-separating spaces must not be stripped from Urdu plain text');

  console.log('Community submissions COMMUNITY-A contracts passed.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
