const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const Registry = require(path.join(root, 'js', 'workspace-journey-registry.js'));
const NextStep = require(path.join(root, 'js', 'workspace-next-step.js'));
const Continuity = require(path.join(root, 'js', 'core-continuity.js'));
const nextStepRuntime = fs.readFileSync(path.join(root, 'js', 'workspace-next-step.js'), 'utf8');
const continuityRuntime = fs.readFileSync(path.join(root, 'js', 'core-continuity.js'), 'utf8');
const shellRuntime = fs.readFileSync(path.join(root, 'site-header.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'workspace-next-step.css'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

const captures = ['image-to-urdu-text', 'voice-typing', 'inpage-converter'];
assert.deepStrictEqual(NextStep.CAPTURE_WORKSPACES, captures, 'Capture continuation ownership changed unexpectedly');

captures.forEach(id => {
  const workspace = Registry.get(id);
  assert.ok(workspace && workspace.status === 'current', `${id} must remain a current workspace`);
  assert.strictEqual(NextStep.classifyWorkspace(workspace), 'shared-recommendations', `${id} must use the shared continuation component`);
  const model = NextStep.buildModel(id, { hasContent: true });
  assert.ok(model.visible.length > 0 && model.visible.length <= 3, `${id} must expose one to three visible next steps after a result exists`);
  assert.strictEqual(model.more.length, 0, `${id} should not need overflow actions in Slice F`);
});

assert.deepStrictEqual(
  NextStep.buildModel('image-to-urdu-text', { hasContent: true }).visible.map(action => action.id),
  ['image-text-to-cleaner', 'image-text-to-basic', 'image-text-to-rich']
);
assert.deepStrictEqual(
  NextStep.buildModel('voice-typing', { hasContent: true }).visible.map(action => action.id),
  ['voice-to-basic', 'voice-to-rich', 'voice-to-card']
);
assert.deepStrictEqual(
  NextStep.buildModel('inpage-converter', { hasContent: true }).visible.map(action => action.id),
  ['inpage-to-cleaner', 'inpage-to-basic', 'inpage-to-rich']
);

captures.forEach(id => assert.ok(Continuity.CONTINUITY_SOURCES.includes(id), `${id} must be accepted by the v2 transfer runtime`));
assert.match(nextStepRuntime, /inPageProducesUnicode\(\)/, 'InPage continuation must be gated to Unicode output');
assert.match(nextStepRuntime, /watchOcrResult/, 'Asynchronous OCR completion must refresh the shared continuation panel');
assert.match(continuityRuntime, /\/tools\/urdu-voice-typing/, 'Voice transcript must be readable by the shared transfer runtime');
assert.match(continuityRuntime, /\/urdu-ocr/, 'Image-to-text result must be readable by the shared transfer runtime');
assert.match(continuityRuntime, /\/tools\/inpage-unicode-converter/, 'InPage Unicode result must be readable by the shared transfer runtime');

['/urdu-ocr', '/tools/urdu-voice-typing', '/tools/inpage-unicode-converter'].forEach(route => {
  assert.ok(shellRuntime.includes(`'${route}'`), `${route} must load the shared continuation runtime`);
});

['data-ocr-clean', 'data-ocr-editor', 'data-voice-clean', 'data-voice-editor', 'data-inpage-clean', 'data-inpage-editor'].forEach(marker => {
  assert.ok(css.includes(`[${marker}]`), `${marker} duplicate native handoff must be visually retired when shared continuation is active`);
});

assert.match(sw, /write-urdu-shell-v40/, 'PWA cache must retain Capture continuity assets with the account-aware shared shell');
console.log('Capture-to-continuation contract passed.');
