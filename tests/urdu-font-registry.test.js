const assert = require('node:assert');
const registry = require('../js/urdu-font-registry.js');

const expectedCurrentIds = [
  'noto-nastaliq-urdu',
  'noto-naskh-arabic',
  'amiri',
  'lateef',
  'scheherazade-new',
  'tajawal',
  'harmattan',
  'katibeh'
];

const all = registry.getAll();
assert.ok(all.length >= 16, 'registry should govern shipped fonts plus reviewed candidates');
assert.deepStrictEqual(
  all.filter(record => record.licenseStatus === 'approved-web').map(record => record.id),
  expectedCurrentIds,
  'all currently shipped web families need stable IDs'
);
assert.strictEqual(registry.resolveId('Noto Nastaliq Urdu'), 'noto-nastaliq-urdu');
assert.strictEqual(registry.resolveId('"Noto Nastaliq Urdu"'), 'noto-nastaliq-urdu');
assert.strictEqual(registry.resolveId('Scheherazade'), 'scheherazade-new', 'legacy editor family should map to governed Scheherazade New ID');
assert.strictEqual(registry.resolveId('unknown face'), null);

const cardFonts = registry.getForCapability('card-studio', { webOnly: true });
assert.deepStrictEqual(
  cardFonts.map(record => record.id),
  ['noto-nastaliq-urdu', 'noto-naskh-arabic', 'amiri', 'lateef', 'scheherazade-new', 'tajawal'],
  'Card Studio capability should preserve the six currently shipped creation fonts'
);
assert.deepStrictEqual(
  registry.getForCapability('editor', { webOnly: true }).map(record => record.id),
  ['noto-nastaliq-urdu', 'noto-naskh-arabic', 'amiri', 'lateef', 'tajawal', 'harmattan', 'katibeh'],
  'editor capability should preserve current governed web families without silently adding candidates'
);

for (const record of all) {
  assert.ok(Object.isFrozen(record), `${record.id} record should be immutable`);
  assert.doesNotThrow(() => registry.validateRecord(record));
  if (record.licenseStatus === 'license-review') {
    assert.strictEqual(record.assetUrl, null, `${record.id} must not expose an asset while license-review`);
    assert.strictEqual(record.stylesheetUrl, null, `${record.id} must not expose a stylesheet while license-review`);
  }
}

assert.throws(
  () => registry.validateRecord({
    id: 'unsafe-font', family: 'Unsafe Font', style: 'nastaliq', delivery: 'future-webfont',
    licenseStatus: 'license-review', weights: [400], defaultWeight: 400,
    capabilities: ['candidate'], assetUrl: '/fonts/unsafe.woff2'
  }),
  /unapproved_font_asset/,
  'license-review fonts must be structurally unable to point at a bundled asset'
);
assert.throws(
  () => registry.validateRecords([all[0], all[0]]),
  /duplicate_font_id/,
  'registry validation must reject duplicate stable IDs'
);

function loadedDocument() {
  let loads = 0;
  const doc = {
    fonts: {
      load(spec, sample) {
        loads += 1;
        assert.match(spec, /Noto Nastaliq Urdu/);
        assert.match(sample, /[\u0600-\u06FF]/);
        return Promise.resolve([{ family: 'Noto Nastaliq Urdu' }]);
      },
      check() { return true; },
      ready: Promise.resolve(true)
    },
    querySelector() { return null; },
    createElement() { throw new Error('stylesheet should not be injected when face already exists'); },
    head: { appendChild() { throw new Error('stylesheet should not be appended when face already exists'); } }
  };
  return { doc, getLoads: () => loads };
}

async function run() {
  const alreadyLoaded = loadedDocument();
  const loader = registry.createLoader({ document: alreadyLoaded.doc });
  const p1 = loader.load('noto-nastaliq-urdu');
  const p2 = loader.load('Noto Nastaliq Urdu');
  assert.strictEqual(p1, p2, 'concurrent identical loads must reuse one cached promise');
  const loaded = await p1;
  assert.deepStrictEqual(
    { ok: loaded.ok, id: loaded.id, code: loaded.code, source: loaded.source },
    { ok: true, id: 'noto-nastaliq-urdu', code: 'loaded', source: 'existing' }
  );
  assert.strictEqual(alreadyLoaded.getLoads(), 1, 'deduplicated load should call Font Loading API once');

  let stylesheetInjected = false;
  let attempts = 0;
  const lazyDoc = {
    fonts: {
      load() {
        attempts += 1;
        return Promise.resolve(stylesheetInjected ? [{ family: 'Amiri' }] : []);
      },
      check() { return stylesheetInjected; },
      ready: Promise.resolve(true)
    },
    querySelector() { return null; },
    createElement() {
      return {
        setAttribute() {},
        rel: '', href: '', onload: null, onerror: null
      };
    },
    head: {
      appendChild(link) {
        stylesheetInjected = true;
        assert.match(link.href, /fonts\.googleapis\.com\/css2\?family=Amiri/);
        link.onload();
      }
    }
  };
  const lazyLoader = registry.createLoader({ document: lazyDoc, timeoutMs: 50 });
  const lazyResult = await lazyLoader.load('amiri');
  assert.strictEqual(lazyResult.ok, true);
  assert.strictEqual(lazyResult.source, 'stylesheet');
  assert.strictEqual(attempts, 2, 'loader should try existing face, then retry after scoped stylesheet injection');

  const candidateResult = await lazyLoader.load('mehr-nastaliq-web');
  assert.deepStrictEqual(
    { ok: candidateResult.ok, id: candidateResult.id, code: candidateResult.code },
    { ok: false, id: 'mehr-nastaliq-web', code: 'not-web-approved' },
    'license-review candidates must fail closed before stylesheet or font loading'
  );

  const unknown = await lazyLoader.load('totally-unknown');
  assert.deepStrictEqual(
    { ok: unknown.ok, id: unknown.id, code: unknown.code },
    { ok: false, id: null, code: 'unknown-font' }
  );

  const noApi = registry.createLoader({ document: {} });
  const noApiResult = await noApi.load('amiri');
  assert.strictEqual(noApiResult.code, 'font-loading-api-unavailable');

  console.log('WU-FONT-001 Slice 1 registry passed: stable IDs, capability filtering, license fail-closed rules and deduplicated font loading are enforced.');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
