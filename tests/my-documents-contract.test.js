const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const routeSource = read('functions', 'my-documents.js');
const clientSource = read('js', 'account-documents.mjs');
const controllerSource = read('js', 'my-documents.mjs');
const uiSource = read('js', 'my-documents-ui.mjs');
const shareSource = read('js', 'document-share.mjs');
const basicSource = read('js', 'basic-account-documents.mjs');
const accountControlSource = read('js', 'account-control.mjs');
const registrySource = read('js', 'workspace-journey-registry.js');
const serviceWorker = read('sw.js');
const adsSource = read('js', 'ads.js');
const editorTools = read('js', 'editor-tools.js');

assert.match(routeSource, /<h1>My Documents<\/h1>/, 'Account workspace must use the founder-approved My Documents language');
assert.match(routeSource, /noindex,follow,noarchive/, 'My Documents must be noindex in HTML');
assert.match(routeSource, /X-Robots-Tag[^\n]*noindex, follow, noarchive/, 'My Documents must also be noindex at the HTTP layer');
assert.match(routeSource, /Cache-Control[^\n]*private, no-store, max-age=0/, 'Private account workspace shell must never be cached');
assert.doesNotMatch(routeSource, /adsbygoogle|pagead2\.googlesyndication|data-wu-ad/, 'My Documents shell must not contain advertising markup');
assert.match(routeSource, /\/js\/my-documents\.mjs/, 'My Documents function shell must load the document controller');

assert.match(registrySource, /id: 'my-documents', routes: \['\/my-documents'\], status: 'current'/, 'Product registry must expose the shipped My Documents workspace');
assert.match(registrySource, /label: 'My Documents', technicalLabel: 'Account-backed documents'/, 'Registry must use simple public language and precise internal terminology');
assert.match(registrySource, /id: 'documents-share'[\s\S]*label: 'Share with a link'/, 'Registry must model the explicit snapshot-sharing outcome');
assert.doesNotMatch(registrySource, /id: 'my-drafts'|routes: \['\/my-drafts'\]|technicalLabel: 'Cloud Drafts'/, 'Retired planned My drafts terminology must not remain in the workspace registry');

assert.match(clientSource, /async list\(\)/, 'Client must list account-owned documents');
assert.match(clientSource, /async get\(documentId\)/, 'Client must fetch a full account-owned document only on demand');
assert.match(clientSource, /async rename\(documentId, revision, title\)/, 'Rename must retain revision-based concurrency');
assert.match(clientSource, /async remove\(documentId\)/, 'Document library must support explicit deletion');
assert.match(clientSource, /async copy\(documentId, title\)/, 'Document library must support private conflict-safe copies');
assert.match(clientSource, /DOCUMENT_OPEN_HANDOFF_KEY/, 'Opening a document must use a bounded private browser handoff');
assert.match(clientSource, /Date\.now\(\) - Number\(value\.queuedAt \|\| 0\) > 5 \* 60 \* 1000/, 'Document open handoff must expire quickly');
assert.match(clientSource, /credentials: 'same-origin'/, 'Document API requests must carry only same-origin session context');
assert.match(clientSource, /cache: 'no-store'/, 'Private document requests must bypass browser HTTP cache');

['open', 'rename', 'copy', 'share', 'delete'].forEach((action) => {
  assert.match(uiSource, new RegExp(`actionButton\\('${action}'`), `My Documents must expose ${action} as an explicit user action`);
});
assert.match(controllerSource, /confirmAction\(dialog,[\s\S]*Delete this account copy\?/, 'Delete must require confirmation');
assert.match(controllerSource, /Browser-local drafts and history are not deleted/, 'Delete copy must distinguish account storage from local drafts');
assert.match(controllerSource, /document_revision_conflict/, 'Document library must surface optimistic-concurrency conflicts');
assert.match(controllerSource, /writeDocumentOpenHandoff/, 'Open must route through the private handoff rather than query strings');
assert.match(controllerSource, /sessionStore\(\)/, 'Document open must tolerate unavailable sessionStorage');
assert.doesNotMatch(controllerSource, /[?&](?:content|text)=|URLSearchParams[\s\S]*(?:content|text)/, 'Private document content must never be put into navigation URLs');

assert.match(basicSource, /readDocumentOpenHandoff/, 'Basic Writer must consume My Documents open handoff');
assert.match(basicSource, /flushLocalWriting\(runtime\)[\s\S]*runtime\.confirm\(/, 'Different current local writing must be flushed before replacement confirmation');
assert.match(basicSource, /clearAccountDocumentMetadata\(storage\(\)\)[\s\S]*adapter\.setContent/, 'Old account association must be cleared before incoming content is applied');
assert.match(basicSource, /Opened from My Documents · Saved to your account/, 'Opened account documents must retain truthful persistence status');
assert.match(basicSource, /Share with a link/, 'Homepage account card may advertise sharing only now that the real action exists');
assert.match(basicSource, /href="\/my-documents"/, 'Signed-in homepage card must link to My Documents');
assert.match(accountControlSource, /href="\/my-documents">My Documents/, 'Signed-in account menu must expose My Documents');

assert.match(shareSource, /MAX_DOCUMENT_SHARE_TEXT = 8000/, 'Document share must honor the existing public text limit');
assert.match(shareSource, /form\.set\('source_tool', 'basic_editor'\)/, 'DOC-C must reuse the existing Basic Writer share-artifact source contract');
assert.match(shareSource, /form\.set\('preset', 'document_snapshot'\)/, 'Saved-document publishing must identify the snapshot presentation');
assert.match(shareSource, /form\.set\('image', image, 'write-urdu-document\.png'\)/, 'Share service must receive the required generated PNG preview');
assert.match(shareSource, /fetch\('\/api\/shares'/, 'My Documents must reuse the existing share-artifact backend');
assert.match(shareSource, /credentials: 'same-origin'/, 'Share publication must stay same-origin');
assert.match(shareSource, /cache: 'no-store'/, 'Share publication response must not be cached');
assert.match(controllerSource, /Create a public share link\?/, 'Publishing must be an explicit confirmed action');
assert.match(controllerSource, /saved account document stays private/, 'Share confirmation must explain private-document/public-snapshot boundary');
assert.match(controllerSource, /later edits do not silently change this snapshot/, 'Share must be snapshot-based rather than live public document access');
assert.doesNotMatch(shareSource + controllerSource, /collaborat|followers|comments|team permissions/i, 'DOC-C must not introduce social or collaboration semantics');

assert.match(serviceWorker, /url\.pathname === '\/my-documents'/, 'Private workspace shell must bypass the service-worker Cache API');
assert.match(serviceWorker, /\.\/js\/my-documents\.mjs/, 'PWA install should refresh My Documents static assets without caching the account page response');
assert.match(adsSource, /'\/sign-in', '\/my-documents'/, 'My Documents must be classified with ad-free account/trust routes');
assert.match(editorTools, /SAVE_DELAY = 650/, 'Local autosave behavior must remain unchanged');

(async () => {
  const modulePath = pathToFileURL(path.join(root, 'js', 'account-documents.mjs')).href;
  const docs = await import(modulePath);
  const calls = [];
  const full = {
    id: '11111111-1111-4111-8111-111111111111',
    editorKind: 'basic',
    title: 'میرا مضمون',
    content: 'میرا متن',
    plainText: 'میرا متن',
    formatVersion: 1,
    revision: 3
  };
  const client = docs.createDocumentsClient(async (url, options) => {
    calls.push({ url, options });
    if (url === '/api/documents' && options.method === 'GET') {
      return new Response(JSON.stringify({ documents: [{ ...full, content: undefined, plainText: undefined, preview: 'میرا متن' }] }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (url.endsWith(full.id) && options.method === 'GET') {
      return new Response(JSON.stringify({ document: full }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (url.endsWith(full.id) && options.method === 'PATCH') {
      const body = JSON.parse(options.body);
      return new Response(JSON.stringify({ document: { ...full, title: body.title || full.title, revision: 4 } }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (url.endsWith(full.id) && options.method === 'DELETE') {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new Response(JSON.stringify({ document: { ...full, id: '22222222-2222-4222-8222-222222222222', revision: 1 } }), { status: 201, headers: { 'content-type': 'application/json' } });
  });

  const listed = await client.list();
  assert.strictEqual(listed.length, 1);
  assert.strictEqual(listed[0].preview, 'میرا متن');
  const fetched = await client.get(full.id);
  assert.strictEqual(fetched.content, 'میرا متن');
  const renamed = await client.rename(full.id, 3, 'نیا نام');
  assert.strictEqual(renamed.title, 'نیا نام');
  assert.strictEqual(await client.remove(full.id), true);
  const copied = await client.copy(full.id, 'نقل');
  assert.strictEqual(copied.id, '22222222-2222-4222-8222-222222222222');
  calls.forEach((call) => {
    assert.strictEqual(call.options.credentials, 'same-origin');
    assert.strictEqual(call.options.cache, 'no-store');
  });

  const values = new Map();
  const handoffStorage = {
    getItem(key) { return values.get(key) || null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };
  assert.strictEqual(docs.writeDocumentOpenHandoff(handoffStorage, full), true);
  const handoff = docs.readDocumentOpenHandoff(handoffStorage);
  assert.strictEqual(handoff.id, full.id);
  assert.strictEqual(handoff.content, full.content);
  assert.strictEqual(docs.readDocumentOpenHandoff(handoffStorage), null, 'Open handoff must be consume-once');

  console.log('My Documents DOC-C contracts passed.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
