const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const coreSource = read('js', 'account-documents.mjs');
const uiSource = read('js', 'basic-account-documents.mjs');
const siteHeader = read('site-header.js');
const editorTools = read('js', 'editor-tools.js');
const styles = read('css', 'account-documents.css');
const serviceWorker = read('sw.js');

assert.match(siteHeader, /installHomeAccountDocuments/, 'Shared shell must own homepage account-document loading');
assert.match(siteHeader, /normalizedPath\(\) !== '\/'/, 'Account document UI must be homepage-only in DOC-B');
assert.match(siteHeader, /\/css\/account-documents\.css/, 'Homepage account document styles must be loaded');
assert.match(siteHeader, /\/js\/basic-account-documents\.mjs/, 'Homepage account document module must be loaded');
assert.match(serviceWorker, /\.\/css\/account-documents\.css/, 'PWA shell must refresh the account document stylesheet');
assert.match(serviceWorker, /\.\/js\/account-documents\.mjs/, 'PWA shell must cache the account document client');
assert.match(serviceWorker, /\.\/js\/basic-account-documents\.mjs/, 'PWA shell must cache the Basic Writer account integration');
assert.match(serviceWorker, /url\.pathname\.startsWith\('\/api\/'\)/, 'Private document APIs must stay outside Cache API handling');

assert.match(coreSource, /DOCUMENT_SYNC_DELAY_MS = 25_000/, 'Remote document sync must use a tens-of-seconds cadence');
assert.match(coreSource, /write-urdu:account-document:v1:basic/, 'DOC-B must keep account metadata separate from local draft payloads');
assert.match(coreSource, /credentials: 'same-origin'/, 'Private document API calls must send same-origin session cookies');
assert.match(coreSource, /cache: 'no-store'/, 'Private document API reads/writes must bypass browser HTTP cache');
assert.match(coreSource, /editorKind: 'basic'/, 'DOC-B must remain scoped to the Basic Writer');
assert.doesNotMatch(coreSource, /email|providerAccountId|access_token|refresh_token|sessionToken/, 'Local account-document metadata must not contain provider/session credentials');

assert.match(uiSource, /WriteUrduTools/, 'DOC-B must use the established editor adapter boundary');
assert.match(uiSource, /flushLocalWriting\(runtime\)/, 'Explicit account saves and account navigation must preserve local writing first');
assert.match(uiSource, /if \(!metadata && !explicit\) return;/, 'Account persistence must never start before explicit opt-in');
assert.match(uiSource, /setTimeout\(\(\) => \{\s*void syncToAccount\(\);\s*\}, DOCUMENT_SYNC_DELAY_MS\)/, 'Opted-in documents must use throttled remote sync');
assert.match(uiSource, /document_revision_conflict/, 'DOC-B must surface remote revision conflicts without overwriting');
assert.match(uiSource, /Nothing was overwritten/, 'Conflict messaging must be data-preserving');
assert.match(uiSource, /Account save paused — your local draft is safe/, 'Remote failure must truthfully preserve the local-first contract');
assert.match(uiSource, /Save to my account/, 'The first remote action must be explicit');
assert.match(uiSource, /Keep your writing/, 'The highlighted homepage area must explain account continuity');
assert.match(uiSource, /Save this Urdu writing for later and continue on another device/, 'Homepage account value must be plain-language and task-led');
assert.doesNotMatch(uiSource, /followers|comments|team|collaborat/i, 'DOC-B must not expand into social/collaboration scope');
assert.match(styles, /home-account-hero-layout/, 'Desktop hero must provide a bounded second column for the account value card');
assert.match(styles, /@media \(max-width: 960px\)/, 'Account value card must collapse safely on smaller screens');
assert.match(editorTools, /SAVE_DELAY = 650/, 'Existing local autosave cadence must remain unchanged');

(async () => {
  const modulePath = pathToFileURL(path.join(root, 'js', 'account-documents.mjs')).href;
  const docs = await import(modulePath);

  assert.strictEqual(docs.DOCUMENT_SYNC_DELAY_MS, 25000);
  assert.strictEqual(docs.deriveDocumentTitle('  میری پہلی تحریر   دوسری سطر  '), 'میری پہلی تحریر دوسری سطر');

  const snapshot = { content: 'میرا متن', text: 'میرا متن' };
  assert.strictEqual(docs.documentSnapshotSignature(snapshot), docs.documentSnapshotSignature(snapshot));
  assert.notStrictEqual(docs.documentSnapshotSignature(snapshot), docs.documentSnapshotSignature({ content: 'میرا متن!', text: 'میرا متن!' }));

  const calls = [];
  const client = docs.createDocumentsClient(async (url, options) => {
    calls.push({ url, options });
    if (options.method === 'GET') {
      return new Response(JSON.stringify({ error: { code: 'authentication_required' } }), {
        status: 401,
        headers: { 'content-type': 'application/json' }
      });
    }
    if (options.method === 'POST') {
      const body = JSON.parse(options.body);
      assert.strictEqual(body.editorKind, 'basic');
      assert.strictEqual(body.content, 'میرا متن');
      assert.strictEqual(body.plainText, 'میرا متن');
      return new Response(JSON.stringify({ document: { id: '11111111-1111-4111-8111-111111111111', revision: 1 } }), {
        status: 201,
        headers: { 'content-type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({
      error: { code: 'document_revision_conflict', currentRevision: 2, updatedAt: '2026-08-20T17:00:00.000Z' }
    }), {
      status: 409,
      headers: { 'content-type': 'application/json' }
    });
  });

  const probe = await client.probe();
  assert.deepStrictEqual(probe, { available: true, authenticated: false });
  const created = await client.create(snapshot);
  assert.strictEqual(created.revision, 1);
  assert.strictEqual(calls[1].options.credentials, 'same-origin');
  assert.strictEqual(calls[1].options.cache, 'no-store');

  await assert.rejects(
    () => client.update(created.id, 1, snapshot),
    (error) => error instanceof docs.DocumentApiError && error.code === 'document_revision_conflict' && error.currentRevision === 2
  );

  const values = new Map();
  const fakeStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };
  const metadata = {
    documentId: created.id,
    ownerUserId: 'user-123',
    revision: 1,
    lastSyncedSignature: docs.documentSnapshotSignature(snapshot)
  };
  assert.strictEqual(docs.writeAccountDocumentMetadata(fakeStorage, metadata), true);
  assert.deepStrictEqual(docs.readAccountDocumentMetadata(fakeStorage), metadata);
  assert.strictEqual(docs.clearAccountDocumentMetadata(fakeStorage), true);
  assert.strictEqual(docs.readAccountDocumentMetadata(fakeStorage), null);

  console.log('Basic Writer account document contracts passed.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
