const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const registry = require(path.join(root, 'js', 'workspace-journey-registry.js'));
const handoff = require(path.join(root, 'js', 'workspace-handoff.js'));

class MemoryStorage {
    constructor() { this.values = new Map(); }
    getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
    setItem(key, value) { this.values.set(key, String(value)); }
    removeItem(key) { this.values.delete(key); }
}

assert.deepStrictEqual(registry.validate(), [], 'workspace registry must be internally valid');
assert.strictEqual(registry.findByRoute('/index.html').id, 'basic-writer');
assert.strictEqual(registry.findByRoute('/tools/urdu-voice-typing/index.html').id, 'voice-typing');
assert.strictEqual(registry.findByRoute('/tools/inpage-unicode-converter/').id, 'inpage-converter');
assert.strictEqual(registry.findByRoute('/s/example-share').id, 'public-share');
assert.strictEqual(registry.get('image-to-urdu-text').label, 'Image to Urdu Text', 'plain-language image-to-text label must lead');
assert.strictEqual(registry.get('image-to-urdu-text').technicalLabel, 'Urdu OCR', 'OCR stays available as a secondary technical/search term');
assert.strictEqual(registry.get('voice-typing').status, 'current', 'shipped voice typing must be registered as current');
assert.strictEqual(registry.get('inpage-converter').status, 'current', 'shipped InPage converter must be registered as current');
assert.strictEqual(registry.get('urdu-hindi-script-converter').status, 'research', 'Hindi script conversion must stay research-only');

for (const workspace of registry.list()) {
    for (const edge of workspace.next) {
        assert.ok(registry.EDGE_TYPES.includes(edge.type), `${workspace.id}/${edge.id} must classify its edge`);
        if (edge.type === 'embedded') assert.strictEqual(edge.target, null, `${edge.id} must stay inside its workspace`);
        else assert.ok(registry.get(edge.target), `${edge.id} must target a registered workspace`);
    }
}

// Governance: every currently published Write/Create/Business product route must have a workspace descriptor.
const publicRegistry = fs.readFileSync(path.join(root, 'docs', 'WU-PUBLIC-PAGE-REGISTRY.csv'), 'utf8').trim().split(/\r?\n/).slice(1);
const governedAreas = new Set(['Write', 'Create', 'Business']);
for (const row of publicRegistry) {
    const columns = row.split(',');
    const route = columns[1];
    const area = columns[2];
    const status = columns[6];
    if (!governedAreas.has(area) || status !== 'keep') continue;
    assert.ok(registry.findByRoute(route), `published interactive route ${route} must be registered before release`);
}

function plainTransfer(overrides = {}) {
    return Object.assign({
        sourceWorkspace: 'basic-writer',
        targetWorkspace: 'rich-editor',
        actionId: 'basic-to-rich',
        kind: 'plain-text',
        payload: { text: 'سلام دنیا' },
        createdAt: 1000000,
        expiresAt: 1000000 + handoff.TTL_MS
    }, overrides);
}

const envelope = handoff.build(plainTransfer());
assert.deepStrictEqual(handoff.validate(envelope, 'rich-editor', 1000001), [], 'valid handoff must pass');
assert.ok(handoff.validate(Object.assign({}, envelope, { version: 1 }), 'rich-editor', 1000001).includes('invalid-version'));
assert.ok(handoff.validate(envelope, 'card-studio', 1000001).includes('wrong-target'));
assert.ok(handoff.validate(envelope, 'rich-editor', envelope.expiresAt + 1).includes('expired'));
assert.ok(handoff.validate(handoff.build(plainTransfer({ kind: 'unknown-kind', payload: { text: 'x' } })), 'rich-editor', 1000001).includes('unsupported-payload-kind'));
assert.ok(handoff.validate(handoff.build(plainTransfer({ payload: { text: 'x'.repeat(handoff.MAX_TEXT_LENGTH + 1) } })), 'rich-editor', 1000001).includes('payload-too-large'));

const telemetry = handoff.telemetryDetail(envelope, 'stored', null);
assert.deepStrictEqual(Object.keys(telemetry).sort(), ['actionId', 'destinationWorkspace', 'failureReason', 'hasContent', 'outcome', 'payloadKind', 'sourceWorkspace'].sort());
assert.strictEqual(Object.prototype.hasOwnProperty.call(telemetry, 'text'), false, 'telemetry must never expose user text');
assert.strictEqual(JSON.stringify(telemetry).includes('سلام دنیا'), false, 'telemetry values must never contain payload content');

const store = new MemoryStorage();
const stored = handoff.store(plainTransfer({ createdAt: Date.now(), expiresAt: Date.now() + handoff.TTL_MS }), store);
assert.strictEqual(stored.ok, true, 'v2 handoff must store successfully');
assert.ok(store.getItem(handoff.KEY_PREFIX + 'rich-editor'), 'v2 target key must be written');
assert.ok(store.getItem(handoff.LEGACY_TARGETS['rich-editor'].key), 'current Rich consumer must receive a legacy compatibility mirror');
assert.ok(handoff.peek('rich-editor', store), 'peek must not consume');
assert.strictEqual(handoff.take('card-studio', store), null, 'wrong target must not consume another target handoff');
assert.ok(handoff.peek('rich-editor', store), 'wrong-target read must leave the correct target available');
const consumed = handoff.take('rich-editor', store);
assert.strictEqual(consumed.payload.text, 'سلام دنیا');
assert.strictEqual(handoff.take('rich-editor', store), null, 'successful consume must be one-time');
assert.strictEqual(store.getItem(handoff.LEGACY_TARGETS['rich-editor'].key), null, 'v2 consume must clear its compatibility mirror');

// Old destination-specific producers remain readable by the v2 runtime.
const legacyDestinationStore = new MemoryStorage();
legacyDestinationStore.setItem(handoff.LEGACY_TARGETS['card-studio'].key, JSON.stringify({
    version: 1,
    text: 'پرانی منتقلی',
    source: 'basic-editor',
    createdAt: new Date().toISOString()
}));
const migratedCard = handoff.take('card-studio', legacyDestinationStore);
assert.strictEqual(migratedCard.version, 2);
assert.strictEqual(migratedCard.source.workspace, 'basic-writer');
assert.strictEqual(migratedCard.target.workspace, 'card-studio');
assert.strictEqual(migratedCard.payload.text, 'پرانی منتقلی');

// The older generic text handoff for Basic/Cleaner also remains readable and route-safe.
const legacyGenericStore = new MemoryStorage();
legacyGenericStore.setItem('write-urdu:text-handoff:v1', JSON.stringify({
    version: 1,
    target: '/urdu-text-cleaner',
    createdAt: Date.now(),
    text: 'صاف کریں'
}));
assert.strictEqual(handoff.take('basic-writer', legacyGenericStore), null, 'generic legacy handoff for Cleaner must not be stolen by Basic');
assert.ok(legacyGenericStore.getItem('write-urdu:text-handoff:v1'), 'wrong legacy target must remain available');
const migratedCleaner = handoff.take('text-cleaner', legacyGenericStore);
assert.strictEqual(migratedCleaner.target.workspace, 'text-cleaner');
assert.strictEqual(migratedCleaner.payload.text, 'صاف کریں');

// No public URL serialization of user content exists in the shared runtime.
const runtimeSource = fs.readFileSync(path.join(root, 'js', 'workspace-handoff.js'), 'utf8');
assert.doesNotMatch(runtimeSource, /[?&](?:text|content|payload)=/i, 'handoff runtime must not serialize user content into URLs');
assert.doesNotMatch(runtimeSource, /localStorage/, 'ephemeral handoffs must remain session-scoped, not durable local storage');

console.log('Workspace journey registry and shared handoff runtime tests passed.');
