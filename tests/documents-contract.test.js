const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const source = read('functions', 'lib', 'documents.mjs');
const collectionRoute = read('functions', 'api', 'documents.js');
const itemRoute = read('functions', 'api', 'documents', '[id].js');
const migration = read('migrations', '0006_writing_documents.sql');

assert.match(migration, /CREATE TABLE IF NOT EXISTS "writing_documents"/, 'DOC-A must add the writing_documents table');
assert.match(migration, /editor_kind[^\n]*CHECK[^\n]*basic[^\n]*rich[^\n]*keyboard/, 'Document editor kinds must be constrained in schema');
assert.match(migration, /idx_writing_documents_user_updated/, 'Recent-document owner index is required');
assert.match(migration, /idx_writing_documents_user_id/, 'Owner/id lookup index is required');
assert.doesNotMatch(migration, /\b(?:ALTER|DROP)\s+TABLE\b/i, 'DOC-A migration must remain additive');
const createdTables = [...migration.matchAll(/CREATE TABLE IF NOT EXISTS\s+"([^"]+)"/gi)].map((match) => match[1]);
assert.deepStrictEqual(createdTables, ['writing_documents'], 'DOC-A migration must create only its product-owned table');

assert.match(collectionRoute, /from '\.\.\/lib\/auth\.mjs'/, 'Collection route must use the project auth boundary');
assert.match(itemRoute, /from '\.\.\/\.\.\/lib\/auth\.mjs'/, 'Item route must use the project auth boundary');
assert.match(collectionRoute, /handleDocumentsCollection/, 'Collection route must delegate to the documents module');
assert.match(itemRoute, /handleDocumentItem/, 'Item route must delegate to the documents module');
assert.doesNotMatch([collectionRoute, itemRoute].join('\n'), /from '@auth\//, 'Document routes must not import Auth.js directly');

assert.match(source, /env\.DOCUMENTS_ENABLED !== 'true'/, 'My Documents must remain independently feature-gated');
assert.match(source, /env\.METRICS_DB/, 'Documents must reuse the existing D1 binding');
assert.doesNotMatch(source, /ACCOUNT_DB|WRITE_URDU_DB/, 'Documents must not create or depend on another D1 binding');
assert.match(source, /MAX_CONTENT_BYTES = 750 \* 1024/, '750 KB document-content guard is required');
assert.match(source, /MAX_DOCUMENTS_PER_USER = 100/, '100 document/user quota is required');
assert.match(source, /\['basic', 'rich', 'keyboard'\]/, 'Only the approved writer kinds belong in DOC-A');
assert.match(source, /crypto\.randomUUID\(\)/, 'Document IDs must use Web Crypto');
assert.match(source, /Cache-Control': 'no-store'/, 'Every document response must be no-store');
assert.match(source, /WHERE id = \?1 AND user_id = \?2/, 'Single-document reads/deletes must be owner scoped');
assert.match(source, /WHERE user_id = \?1/, 'Document list/count must be owner scoped');
assert.match(source, /AND user_id = \?\$\{userParam\} AND revision = \?\$\{revisionParam\}/, 'Updates must scope by owner and last-known revision');
assert.doesNotMatch(source, /console\.(?:log|info|warn|error)/, 'Document runtime must not log private writing content');
assert.match(source, /document_revision_conflict/, 'Stale revisions must surface a deterministic conflict code');

(async () => {
  const docs = await import(pathToFileURL(path.join(root, 'functions', 'lib', 'documents.mjs')).href);
  const fakeDb = { prepare() { return {}; } };
  const env = { DOCUMENTS_ENABLED: 'true', METRICS_DB: fakeDb };
  const signedIn = async () => ({ user: { id: 'user-a' } });

  let sessionCalled = false;
  let response = await docs.handleDocumentsCollection(new Request('https://write-urdu.com/api/documents'), {}, {
    getSession: async () => { sessionCalled = true; return { user: { id: 'unexpected' } }; }
  });
  assert.strictEqual(response.status, 404);
  assert.strictEqual(sessionCalled, false, 'Disabled documents must fail closed before session/database work');

  response = await docs.handleDocumentsCollection(new Request('https://write-urdu.com/api/documents'), env, {
    getSession: async () => null,
    repositoryFactory() { throw new Error('repository must not initialize before authentication'); }
  });
  assert.strictEqual(response.status, 401);

  let listOwner = '';
  response = await docs.handleDocumentsCollection(new Request('https://write-urdu.com/api/documents'), env, {
    getSession: signedIn,
    repositoryFactory() {
      return { async list(userId) { listOwner = userId; return [{ id: 'metadata-only' }]; } };
    }
  });
  assert.strictEqual(response.status, 200);
  assert.strictEqual(listOwner, 'user-a');
  assert.deepStrictEqual((await response.json()).documents, [{ id: 'metadata-only' }]);

  const post = (body) => new Request('https://write-urdu.com/api/documents', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });

  response = await docs.handleDocumentsCollection(post({ editorKind: 'invoice', content: 'x' }), env, {
    getSession: signedIn,
    repositoryFactory() { return { async count() { return 0; } }; }
  });
  assert.strictEqual(response.status, 400);
  assert.strictEqual((await response.json()).error.code, 'document_editor_kind_invalid');

  response = await docs.handleDocumentsCollection(post({ editorKind: 'basic', content: 'x' }), env, {
    getSession: signedIn,
    repositoryFactory() { return { async count() { return 100; } }; }
  });
  assert.strictEqual(response.status, 409);
  assert.strictEqual((await response.json()).error.code, 'document_quota_reached');

  let createArgs;
  response = await docs.handleDocumentsCollection(post({
    editorKind: 'basic',
    content: 'میری محفوظ تحریر',
    userId: 'attacker-controlled-owner'
  }), env, {
    getSession: signedIn,
    randomUUID: () => '123e4567-e89b-12d3-a456-426614174000',
    now: () => '2026-08-20T17:00:00.000Z',
    repositoryFactory() {
      return {
        async count() { return 0; },
        async create(...args) {
          createArgs = args;
          return { id: args[3], revision: 1 };
        }
      };
    }
  });
  assert.strictEqual(response.status, 201);
  assert.strictEqual(createArgs[0], 'user-a', 'Owner must come from session.user.id, never request JSON');
  assert.strictEqual(createArgs[1].plainText, 'میری محفوظ تحریر');

  const id = '123e4567-e89b-12d3-a456-426614174000';
  let getArgs;
  response = await docs.handleDocumentItem(new Request(`https://write-urdu.com/api/documents/${id}`), env, id, {
    getSession: signedIn,
    repositoryFactory() {
      return { async get(...args) { getArgs = args; return { id, revision: 2 }; } };
    }
  });
  assert.strictEqual(response.status, 200);
  assert.deepStrictEqual(getArgs, ['user-a', id]);

  response = await docs.handleDocumentItem(new Request(`https://write-urdu.com/api/documents/${id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ revision: 2, title: 'نیا عنوان' })
  }), env, id, {
    getSession: signedIn,
    now: () => '2026-08-20T17:01:00.000Z',
    repositoryFactory() {
      return {
        async update(userId, documentId, revision, patch) {
          assert.strictEqual(userId, 'user-a');
          assert.strictEqual(documentId, id);
          assert.strictEqual(revision, 2);
          assert.strictEqual(patch.title, 'نیا عنوان');
          return { status: 'conflict', currentRevision: 3, updatedAt: '2026-08-20T17:00:30.000Z' };
        }
      };
    }
  });
  assert.strictEqual(response.status, 409);
  const conflict = await response.json();
  assert.strictEqual(conflict.error.code, 'document_revision_conflict');
  assert.strictEqual(conflict.error.currentRevision, 3);

  let deleteOwner = '';
  response = await docs.handleDocumentItem(new Request(`https://write-urdu.com/api/documents/${id}`, {
    method: 'DELETE'
  }), env, id, {
    getSession: signedIn,
    repositoryFactory() {
      return { async delete(userId) { deleteOwner = userId; return true; } };
    }
  });
  assert.strictEqual(response.status, 200);
  assert.strictEqual(deleteOwner, 'user-a');

  assert.deepStrictEqual(docs.DOCUMENT_LIMITS.allowedEditorKinds, ['basic', 'rich', 'keyboard']);
  assert.strictEqual(docs.DOCUMENT_LIMITS.maxDocumentsPerUser, 100);
  assert.strictEqual(docs.DOCUMENT_LIMITS.maxContentBytes, 750 * 1024);

  console.log('My Documents DOC-A contracts passed.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
