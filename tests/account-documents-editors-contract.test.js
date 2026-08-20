const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const shell = read('site-header.js');
const controller = read('js', 'editor-account-documents.mjs');
const clientSource = read('js', 'account-documents.mjs');
const library = read('js', 'my-documents.mjs');
const shareClientSource = read('js', 'document-share.mjs');
const shareServer = read('functions', '_lib', 'share-artifacts.js');
const editorTools = read('js', 'editor-tools.js');
const serviceWorker = read('sw.js');
const styles = read('css', 'account-documents.css');

assert.match(shell, /function installEditorAccountDocuments\(\)/, 'Shared shell must own Rich/Keyboard account-document loading');
assert.match(shell, /\['\/urdu-editor', '\/urdu-keyboard'\]/, 'Only Rich Editor and Urdu Keyboard should receive the DOC-D controller');
assert.match(shell, /\/js\/editor-account-documents\.mjs/, 'Shared shell must load the DOC-D account document controller');

assert.match(controller, /'\/urdu-editor': 'rich'/, 'Rich Editor route must map to rich account documents');
assert.match(controller, /'\/urdu-keyboard': 'keyboard'/, 'Urdu Keyboard route must map to keyboard account documents');
assert.match(controller, /WriteUrduTools/, 'DOC-D must consume the established editor adapter boundary');
assert.doesNotMatch(controller, /\btinymce\b|getElementById\(['"]write['"]\)|getElementById\(['"]basic-example['"]\)/, 'DOC-D must not reach around the shared adapter into editor internals');
assert.match(controller, /documentMetadataKey\(editorKind\)/, 'Each editor must keep its own account-document association');
assert.match(controller, /if \(!metadata && !explicit\) return;/, 'Remote persistence must never begin before explicit opt-in');
assert.match(controller, /setTimeout\(\(\) => \{ void syncToAccount\(\); \}, DOCUMENT_SYNC_DELAY_MS\)/, 'Opted-in Rich/Keyboard documents must retain throttled remote sync');
assert.match(controller, /flushLocalWriting\(runtime\)/, 'Remote saves and replacements must preserve current local history first');
assert.match(controller, /document_revision_conflict/, 'Rich/Keyboard account sync must preserve optimistic-concurrency behavior');
assert.match(controller, /Nothing was overwritten/, 'Conflict handling must remain data-preserving');
assert.match(controller, /readDocumentOpenHandoff/, 'Rich/Keyboard editors must consume the same private My Documents handoff');
assert.match(controller, /adapter\.setContent\(handoff\.content \|\| handoff\.plainText \|\| ''\)/, 'Remote rich content must restore through adapter.setContent');
assert.match(controller, /Opened from My Documents · Saved to your account/, 'Restored documents must retain truthful account status');
assert.match(controller, /Save to my account/, 'DOC-D first remote action must remain explicit');
assert.doesNotMatch(controller, /followers|comments|team|collaborat/i, 'DOC-D must not expand into social/collaboration scope');

assert.match(library, /rich: '\/urdu-editor'/, 'My Documents must route rich documents to the Rich Editor');
assert.match(library, /keyboard: '\/urdu-keyboard'/, 'My Documents must route keyboard documents to the Urdu Keyboard');
assert.match(library, /plain-text snapshot/, 'My Documents must describe sharing as a plain-text snapshot');
assert.match(library, /rich formatting stay private/, 'Rich formatting must remain private when a share link is created');

assert.match(shareClientSource, /rich: 'rich_editor'/, 'Saved Rich Editor shares need a bounded source enum');
assert.match(shareClientSource, /keyboard: 'urdu_keyboard'/, 'Saved Urdu Keyboard shares need a bounded source enum');
assert.match(shareClientSource, /form\.set\('public_text', text\)/, 'Saved document sharing must publish plain text only');
assert.doesNotMatch(shareClientSource, /form\.set\([^\n]*(?:content|html)/, 'Private rich HTML must never be sent to the public share endpoint');
assert.match(shareServer, /'rich_editor'/, 'Share API must accept Rich Editor snapshot attribution');
assert.match(shareServer, /'urdu_keyboard'/, 'Share API must accept Urdu Keyboard snapshot attribution');

assert.match(clientSource, /ACCOUNT_DOCUMENT_EDITOR_KINDS = Object\.freeze\(\['basic', 'rich', 'keyboard'\]\)/, 'Shared document client must keep the server-supported editor-kind set explicit');
assert.match(clientSource, /DOCUMENT_METADATA_PREFIX/, 'Per-editor account metadata must share one bounded namespace');
assert.match(editorTools, /SAVE_DELAY = 650/, 'Existing local autosave cadence must remain unchanged');
assert.match(editorTools, /kind: 'rich'/, 'Rich adapter must remain owned by editor-tools');
assert.match(editorTools, /createTextAdapter\(keyboard, 'keyboard'\)/, 'Keyboard adapter must remain owned by editor-tools');
assert.match(styles, /\.editor-account-documents/, 'Rich/Keyboard account persistence needs a bounded editor-native panel');
assert.doesNotMatch(styles, /position\s*:\s*(?:fixed|sticky)/, 'DOC-D account controls must not become fixed or sticky authoring chrome');
assert.match(serviceWorker, /write-urdu-shell-v27/, 'PWA shell must be refreshed for DOC-D');
assert.match(serviceWorker, /\.\/js\/editor-account-documents\.mjs/, 'PWA install must refresh the DOC-D controller');

(async () => {
  const docs = await import(pathToFileURL(path.join(root, 'js', 'account-documents.mjs')).href);
  const shares = await import(pathToFileURL(path.join(root, 'js', 'document-share.mjs')).href);

  assert.strictEqual(docs.documentMetadataKey('basic'), 'write-urdu:account-document:v1:basic');
  assert.strictEqual(docs.documentMetadataKey('rich'), 'write-urdu:account-document:v1:rich');
  assert.strictEqual(docs.documentMetadataKey('keyboard'), 'write-urdu:account-document:v1:keyboard');
  assert.notStrictEqual(docs.documentMetadataKey('rich'), docs.documentMetadataKey('keyboard'));
  assert.strictEqual(shares.shareSourceForDocument({ editorKind: 'basic' }), 'basic_editor');
  assert.strictEqual(shares.shareSourceForDocument({ editorKind: 'rich' }), 'rich_editor');
  assert.strictEqual(shares.shareSourceForDocument({ editorKind: 'keyboard' }), 'urdu_keyboard');

  const richHtml = '<p dir="rtl" style="text-align: right;"><strong>میری تحریر</strong> — اردو ۱۲۳</p><ul><li>پہلا نکتہ</li></ul>';
  const richText = 'میری تحریر — اردو ۱۲۳\nپہلا نکتہ';
  const keyboardText = 'یہ اردو کی بورڈ سے لکھی ہوئی سطر ہے۔ ۱۲۳';
  const requests = [];
  let nextId = 1;

  const client = docs.createDocumentsClient(async (url, options) => {
    requests.push({ url, options, body: options.body ? JSON.parse(options.body) : null });
    if (options.method === 'POST') {
      const body = JSON.parse(options.body);
      return new Response(JSON.stringify({ document: {
        id: `00000000-0000-4000-8000-${String(nextId++).padStart(12, '0')}`,
        editorKind: body.editorKind,
        title: body.title,
        content: body.content,
        plainText: body.plainText,
        formatVersion: body.formatVersion,
        revision: 1
      } }), { status: 201, headers: { 'content-type': 'application/json' } });
    }
    if (options.method === 'PATCH') {
      const body = JSON.parse(options.body);
      return new Response(JSON.stringify({ document: {
        id: '00000000-0000-4000-8000-000000000001',
        editorKind: 'rich',
        content: body.content,
        plainText: body.plainText,
        formatVersion: body.formatVersion,
        revision: Number(body.revision) + 1
      } }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    throw new Error(`Unexpected ${options.method} ${url}`);
  });

  const basic = await client.create({ content: 'سادہ متن', text: 'سادہ متن' });
  assert.strictEqual(basic.editorKind, 'basic', 'Default client creation must remain backward-compatible with Basic Writer');

  const rich = await client.create({ content: richHtml, text: richText }, { editorKind: 'rich' });
  assert.strictEqual(rich.editorKind, 'rich');
  assert.strictEqual(rich.content, richHtml, 'Rich HTML must reach the document API byte-for-byte');
  assert.strictEqual(rich.plainText, richText, 'Rich Urdu text must reach the document API unchanged');

  const keyboard = await client.create({ content: keyboardText, text: keyboardText }, { editorKind: 'keyboard' });
  assert.strictEqual(keyboard.editorKind, 'keyboard');
  assert.strictEqual(keyboard.content, keyboardText);
  assert.strictEqual(keyboard.plainText, keyboardText, 'Urdu Keyboard text must round-trip unchanged');

  const updated = await client.update(rich.id, 1, { content: richHtml, text: richText });
  assert.strictEqual(updated.content, richHtml, 'Rich update must not normalize or flatten HTML');
  assert.strictEqual(updated.plainText, richText);

  const richCreate = requests.find((request) => request.body?.editorKind === 'rich');
  assert.ok(richCreate);
  assert.strictEqual(richCreate.body.content, richHtml);
  assert.strictEqual(richCreate.body.plainText, richText);
  assert.strictEqual(richCreate.options.credentials, 'same-origin');
  assert.strictEqual(richCreate.options.cache, 'no-store');

  const values = new Map();
  const handoffStorage = {
    getItem(key) { return values.get(key) || null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };
  const richDocument = {
    id: rich.id,
    editorKind: 'rich',
    title: 'فارمیٹ شدہ تحریر',
    content: richHtml,
    plainText: richText,
    formatVersion: 1,
    revision: 7
  };
  assert.strictEqual(docs.writeDocumentOpenHandoff(handoffStorage, richDocument), true);
  const handoff = docs.readDocumentOpenHandoff(handoffStorage);
  assert.strictEqual(handoff.editorKind, 'rich');
  assert.strictEqual(handoff.content, richHtml, 'Private handoff must preserve exact Rich Editor HTML');
  assert.strictEqual(handoff.plainText, richText, 'Private handoff must preserve exact Urdu text');
  assert.strictEqual(handoff.revision, 7);
  assert.strictEqual(docs.readDocumentOpenHandoff(handoffStorage), null, 'Private open handoff must remain consume-once');

  console.log('Rich Editor and Urdu Keyboard account document contracts passed.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
