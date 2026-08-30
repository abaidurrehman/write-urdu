const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.join(__dirname, '..');
const clientSource = fs.readFileSync(path.join(root, 'js', 'account-documents.mjs'), 'utf8');
const controllerSource = fs.readFileSync(path.join(root, 'js', 'editor-account-documents.mjs'), 'utf8');
const basicController = fs.readFileSync(path.join(root, 'js', 'basic-account-documents.mjs'), 'utf8');
const editorTools = fs.readFileSync(path.join(root, 'js', 'editor-tools.js'), 'utf8');
const richPage = fs.readFileSync(path.join(root, 'urdu-editor.html'), 'utf8');
const keyboardPage = fs.readFileSync(path.join(root, 'urdu-keyboard.html'), 'utf8');
const siteHeader = fs.readFileSync(path.join(root, 'site-header.js'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'css', 'account-documents.css'), 'utf8');
const serviceWorker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const shareClientSource = fs.readFileSync(path.join(root, 'js', 'document-share.mjs'), 'utf8');
const shareServer = fs.readFileSync(path.join(root, 'functions', '_lib', 'share-artifacts.js'), 'utf8');

assert.match(siteHeader, /installEditorAccountDocuments/, 'Shared shell must install Rich/Keyboard account persistence');
assert.match(siteHeader, /\['\/urdu-editor', '\/urdu-keyboard'\]/, 'Only Rich Editor and Urdu Keyboard should load DOC-D from the shared shell');
assert.match(siteHeader, /\/js\/editor-account-documents\.mjs/, 'Shared shell must load the bounded DOC-D controller');

assert.match(controllerSource, /const ROUTE_KIND = Object\.freeze\(\{[\s\S]*'\/urdu-editor': 'rich',[\s\S]*'\/urdu-keyboard': 'keyboard'/, 'Controller must stay scoped to Rich Editor and Urdu Keyboard routes');
assert.match(controllerSource, /fetchAccountState/, 'Controller must reuse the shared account session state');
assert.match(controllerSource, /readDocumentOpenHandoff/, 'Controller must consume the existing My Documents open handoff');
assert.match(controllerSource, /writeAccountDocumentMetadata/, 'Controller must preserve account document metadata after create/update');
assert.match(controllerSource, /documentSnapshotSignature/, 'Controller must compare exact document snapshots before syncing');
assert.match(controllerSource, /DOCUMENT_SYNC_DELAY_MS/, 'Remote sync must use the shared bounded debounce');
assert.match(controllerSource, /adapter\.onChange/, 'Remote save must subscribe through the shared editor adapter');
assert.match(controllerSource, /flushLocalWriting\(runtime\)/, 'Account saves must flush the existing local writer before remote sync');
assert.match(controllerSource, /runtime\.confirm/, 'Opening a saved document over different local content must require confirmation');
assert.match(controllerSource, /document_revision_conflict/, 'Revision conflicts must pause rather than overwrite');
assert.match(controllerSource, /handoff\.editorKind !== editorKind/, 'My Documents handoff must stay bound to the active editor kind');
assert.doesNotMatch(controllerSource, /localStorage\.clear|sessionStorage\.clear/, 'DOC-D must not clear unrelated browser-local state');
assert.doesNotMatch(controllerSource, /innerHTML\s*=\s*`[^`]*(?:content|plainText)/s, 'Saved document content must not be interpolated into account UI HTML');

assert.match(basicController, /documentSnapshotSignature/, 'Basic Writer must keep using the shared document signature contract');
assert.match(basicController, /writeAccountDocumentMetadata/, 'Basic Writer must keep account document metadata compatible with My Documents');
assert.match(basicController, /readDocumentOpenHandoff/, 'Basic Writer must keep consuming My Documents handoffs');

assert.match(richPage, /id="basic-example"/, 'Rich Editor must keep the TinyMCE source hook used by editor-tools');
assert.match(keyboardPage, /id="write"/, 'Urdu Keyboard must keep the textarea hook used by editor-tools');
assert.match(richPage, /js\/editor-tools\.js/, 'Rich Editor must keep the shared browser-local editor controller');
assert.match(keyboardPage, /js\/editor-tools\.js/, 'Urdu Keyboard must keep the shared browser-local editor controller');

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
assert.match(serviceWorker, /write-urdu-shell-v39/, 'PWA shell must include the current account/document UI cache revision');
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

  console.log('Rich Editor and Urdu Keyboard account document contracts passed.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
