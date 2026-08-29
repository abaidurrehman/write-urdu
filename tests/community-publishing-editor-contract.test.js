const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const shell = read('site-header.js');
const ui = read('js', 'community-publishing-ui.mjs');
const client = read('js', 'community-publishing.mjs');
const sw = read('sw.js');
const events = read('functions', 'api', 'events.js');

// --- Shared shell wiring ---
assert.match(shell, /function installCommunityPublishing\(\)/, 'Shared shell must own community publishing entry loading');
assert.match(shell, /installCommunityPublishing[\s\S]{0,80}\['\/', '\/urdu-editor', '\/urdu-keyboard', '\/tools\/urdu-voice-typing'\]/,
  'Community publishing must stay bounded to the four eligible editor surfaces');
assert.match(shell, /\/js\/community-publishing-ui\.mjs/, 'Shared shell must load the community publishing controller');
assert.match(shell, /installCommunityPublishing\(\);/, 'Community publishing installation must run with the shared shell');

// --- Service worker precache ---
assert.match(sw, /const CACHE_NAME = 'write-urdu-shell-v\d+'/, 'PWA shell must keep an explicit cache revision');
assert.match(sw, /'\.\/js\/community-publishing\.mjs'/, 'PWA shell must cache the community publishing logic module');
assert.match(sw, /'\.\/js\/community-publishing-ui\.mjs'/, 'PWA shell must cache the community publishing UI controller');
assert.match(sw, /'\.\/css\/community-publishing\.css'/, 'PWA shell must cache community publishing styling');

// --- Telemetry event allowlist ---
for (const eventName of [
  'community_publish_prompt_shown',
  'community_publish_prompt_clicked',
  'community_publish_manual_clicked',
  'community_submission_started',
  'community_submission_completed',
  'community_submission_failed'
]) {
  assert.match(events, new RegExp(`'${eventName}'`), `Telemetry allowlist must include ${eventName}`);
}

// --- UI source: platform decisions / product rules preserved ---
assert.match(client, /credentials: 'same-origin'/, 'Community client must use safe request defaults');
assert.doesNotMatch(ui, /console\.(?:log|info|warn|error)/, 'Community publishing UI must not log private writing content');
assert.doesNotMatch(client, /console\.(?:log|info|warn|error)/, 'Community publishing client must not log private writing content');
assert.match(ui, /Submitted for review/, 'Success copy must say review, never published');
assert.doesNotMatch(ui, />Published</, 'Success copy must never claim publication before moderation');
assert.match(ui, /location\.href = `\/sign-in\?returnTo=/, 'Signed-out publishing must reuse the existing /sign-in flow');
assert.doesNotMatch(ui, /[?&](?:title|body|text|content)=/, 'Writing must never be placed in navigation URLs');
assert.match(ui, /writePublishIntent/, 'Signed-out publish intent must be preserved through the auth round trip');
assert.match(ui, /flushLocalWriting/, 'Publishing must flush local autosave before navigation');

// --- Pure logic + API client (no DOM required) ---
(async () => {
  const community = await import(pathToFileURL(path.join(root, 'js', 'community-publishing.mjs')).href);
  const taxonomy = await import(pathToFileURL(path.join(root, 'functions', 'lib', 'community-taxonomy.mjs')).href);

  // Taxonomy must never drift between client and server.
  assert.deepStrictEqual(community.COMMUNITY_TAXONOMY.primaryCategories, taxonomy.COMMUNITY_TAXONOMY.primaryCategories,
    'Client and server primary categories must match exactly');
  assert.deepStrictEqual(community.COMMUNITY_TAXONOMY.tags, taxonomy.COMMUNITY_TAXONOMY.tags,
    'Client and server tags must match exactly');

  // Predicate: 599 non-whitespace chars, <90 words => not eligible.
  const almostChars = 'ا'.repeat(599);
  assert.strictEqual(community.countNonWhitespaceChars(almostChars), 599);
  assert.strictEqual(community.isMeaningfulWriting(almostChars), false);

  // 600+ non-whitespace chars => eligible.
  const enoughChars = 'ا'.repeat(600);
  assert.strictEqual(community.isMeaningfulWriting(enoughChars), true);

  // 90+ whitespace-delimited words => eligible even under the char threshold.
  const manyWords = new Array(90).fill('لفظ').join(' ');
  assert.strictEqual(community.countWhitespaceDelimitedWords(manyWords), 90);
  assert.strictEqual(community.isMeaningfulWriting(manyWords), true);

  // 89 words and well under the char threshold => not eligible.
  const tooFewWords = new Array(89).fill('لفظ').join(' ');
  assert.strictEqual(community.isMeaningfulWriting(tooFewWords), false);

  // Whitespace-only content is never eligible.
  assert.strictEqual(community.isMeaningfulWriting('   \n\n   '), false);
  assert.strictEqual(community.isMeaningfulWriting(''), false);

  // Prompt suppression: fake sessionStorage.
  function fakeStorage() {
    const data = new Map();
    return {
      getItem: (key) => (data.has(key) ? data.get(key) : null),
      setItem: (key, value) => data.set(key, String(value)),
      removeItem: (key) => data.delete(key)
    };
  }

  const storage = fakeStorage();
  assert.strictEqual(community.shouldShowPrompt(storage, 'basic', enoughChars), true);
  const signature = community.promptSignature('basic', enoughChars);
  community.suppressPrompt(storage, signature);
  assert.strictEqual(community.isPromptSuppressed(storage, signature), true);
  assert.strictEqual(community.shouldShowPrompt(storage, 'basic', enoughChars), false);
  // Substantially different content gets a different signature and remains eligible.
  const differentText = 'ب'.repeat(900);
  assert.notStrictEqual(community.promptSignature('basic', enoughChars), community.promptSignature('basic', differentText));
  assert.strictEqual(community.shouldShowPrompt(storage, 'basic', differentText), true);

  // Publish intent handoff: round trip, no writing content, consume-once, expiry.
  const intentStorage = fakeStorage();
  assert.strictEqual(community.readPublishIntent(intentStorage), null);
  community.writePublishIntent(intentStorage, { workspaceKind: 'rich', editorKind: 'rich', entryPoint: 'manual' });
  const rawIntent = intentStorage.getItem(community.COMMUNITY_PUBLISH_INTENT_KEY);
  assert.doesNotMatch(rawIntent, /[ا-ے]/, 'Publish intent handoff must never carry writing content');
  const intent = community.readPublishIntent(intentStorage);
  assert.strictEqual(intent.editorKind, 'rich');
  assert.strictEqual(intent.entryPoint, 'manual');
  assert.strictEqual(community.readPublishIntent(intentStorage), null, 'Publish intent handoff must be consume-once');

  const expiredStorage = fakeStorage();
  expiredStorage.setItem(community.COMMUNITY_PUBLISH_INTENT_KEY, JSON.stringify({
    workspaceKind: 'basic', editorKind: 'basic', entryPoint: 'manual', queuedAt: Date.now() - (31 * 60 * 1000)
  }));
  assert.strictEqual(community.readPublishIntent(expiredStorage), null, 'Expired publish intent must fail safely');

  // Form validation.
  const validFields = {
    title: 'ایک نظم',
    publicAuthorName: 'قلم کار',
    plainText: 'یہ ایک آزمائشی تحریر ہے جو کم از کم حروف کی حد پوری کرنے کے لیے کافی طویل ہونی چاہیے۔ '.repeat(2),
    primaryCategory: 'poetry',
    tags: ['ghazal'],
    rightsConfirmed: true,
    publicConfirmed: true,
    guidelinesConfirmed: true
  };
  assert.strictEqual(community.validateSubmissionForm(validFields).valid, true);
  assert.strictEqual(community.validateSubmissionForm({ ...validFields, title: '' }).errors.title, 'title_required');
  assert.strictEqual(community.validateSubmissionForm({ ...validFields, tags: [] }).errors.tags, 'tags_invalid');
  assert.strictEqual(community.validateSubmissionForm({ ...validFields, tags: ['not-a-tag'] }).errors.tags, 'tags_invalid');
  assert.strictEqual(community.validateSubmissionForm({ ...validFields, tags: ['ghazal', 'ghazal'] }).errors.tags, 'tags_invalid');
  assert.strictEqual(community.validateSubmissionForm({ ...validFields, primaryCategory: 'not-real' }).errors.primaryCategory, 'primary_category_required');
  assert.strictEqual(community.validateSubmissionForm({ ...validFields, rightsConfirmed: false }).errors.rightsConfirmed, 'rights_confirmation_required');
  assert.strictEqual(community.validateSubmissionForm({ ...validFields, publicConfirmed: false }).errors.publicConfirmed, 'public_confirmation_required');
  assert.strictEqual(community.validateSubmissionForm({ ...validFields, guidelinesConfirmed: false }).errors.guidelinesConfirmed, 'guidelines_confirmation_required');
  assert.strictEqual(community.validateSubmissionForm({ ...validFields, plainText: 'short' }).errors.plainText, 'plain_text_too_short');

  // buildSubmissionPayload: server owns status/id/user, client never sends them.
  const payload = community.buildSubmissionPayload({ ...validFields, editorKind: 'basic', sourceDocumentId: 'doc-1' });
  assert.strictEqual(payload.contentFormat, 'plain');
  assert.strictEqual(payload.editorKind, 'basic');
  assert.strictEqual(payload.sourceDocumentId, 'doc-1');
  assert.strictEqual(payload.status, undefined);
  assert.strictEqual(payload.userId, undefined);
  assert.strictEqual(payload.guidelinesVersion, community.COMMUNITY_GUIDELINES_VERSION);

  // API client: probe/submit/list/get against a mock fetch.
  function jsonResponse(status, body) {
    return { ok: status >= 200 && status < 300, status, json: async () => body };
  }

  let lastRequest = null;
  const fetchMock = async (url, options) => {
    lastRequest = { url, options };
    if (url === '/api/community/submissions' && (!options || options.method === undefined || options.method === 'GET')) {
      return jsonResponse(401, { error: { code: 'authentication_required' } });
    }
    if (url === '/api/community/submissions' && options.method === 'POST') {
      const body = JSON.parse(options.body);
      if (body.title === 'duplicate') return jsonResponse(200, { submission: { id: 'existing', status: 'pending' } });
      return jsonResponse(201, { submission: { id: 'new-id', status: 'pending' } });
    }
    return jsonResponse(404, { error: { code: 'not_found' } });
  };

  const client = community.createCommunityClient(fetchMock);
  const probe = await client.probe();
  assert.deepStrictEqual(probe, { available: true, authenticated: false });

  const created = await client.submit({ ...payload, title: 'fresh' });
  assert.strictEqual(created.reused, false);
  assert.strictEqual(created.submission.id, 'new-id');
  assert.strictEqual(lastRequest.options.credentials, 'same-origin');
  assert.doesNotMatch(lastRequest.options.body, /userId|status/);

  const duplicate = await client.submit({ ...payload, title: 'duplicate' });
  assert.strictEqual(duplicate.reused, true);
  assert.strictEqual(duplicate.submission.id, 'existing');

  console.log('Community publishing editor UX (COMMUNITY-B) contracts passed.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
