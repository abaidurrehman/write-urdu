const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const adsPath = path.join(root, 'js', 'ads.js');
const adsSource = fs.readFileSync(adsPath, 'utf8');
const ads = require(adsPath);
const writeMonetization = fs.readFileSync(path.join(root, 'js', 'write-monetization.js'), 'utf8');
const mainSource = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
const inputModeSource = fs.readFileSync(path.join(root, 'js', 'input-mode.js'), 'utf8');

assert.strictEqual(ads.ADSENSE_CLIENT, 'ca-pub-4727847909946286', 'AdSense publisher client changed unexpectedly');
assert.strictEqual(ads.SHARED_SLOT, '8323789671', 'Shared responsive ad slot changed unexpectedly');

assert.strictEqual(ads.normalizePath('/index.html'), '/', 'Homepage path normalization failed');
assert.strictEqual(ads.normalizePath('/urdu-alphabet.html'), '/urdu-alphabet', 'Extensionless route normalization failed');
assert.strictEqual(ads.normalizePath('/urdu-alphabet/'), '/urdu-alphabet', 'Trailing slash normalization failed');

assert.strictEqual(ads.resolvePageType('/'), 'write', 'Homepage must remain a conservative Write surface');
assert.strictEqual(ads.resolvePageType('/urdu-editor'), 'write', 'Rich Editor must remain a conservative Write surface');
assert.strictEqual(ads.resolvePageType('/urdu-keyboard'), 'write', 'Urdu Keyboard must remain a conservative Write surface');
assert.strictEqual(ads.resolvePageType('/roman-urdu-transliteration'), 'learn', 'Roman Urdu guide must be a Learn surface');
assert.strictEqual(ads.resolvePageType('/urdu-alphabet'), 'learn', 'Urdu Alphabet must be a Learn surface');
assert.strictEqual(ads.resolvePageType('/urdu-card-studio'), 'create', 'Card Studio must be a Create surface');
assert.strictEqual(ads.resolvePageType('/urdu-invoice-generator'), 'create', 'Invoice Generator must be a Create surface');
assert.strictEqual(ads.resolvePageType('/write-urdu-privacy'), 'trust', 'Privacy must not be monetized as a content page');
assert.strictEqual(ads.resolvePageType('/write-urdu-feedback'), 'trust', 'Feedback must not be monetized as a content page');

assert.strictEqual(ads.placementName('learn'), 'guide_after_answer', 'Learn placement family changed');
assert.strictEqual(ads.placementName('create'), 'tool_post_workspace', 'Create placement family changed');
assert.strictEqual(ads.placementName('write'), 'write_post_workspace', 'Write placement family changed');
assert.strictEqual(ads.LEGACY_DUPLICATE_ROUTES['/english-urdu-typing-tutorial'], true, 'Legacy tutorial duplicate-slot cleanup must remain enabled');

assert.match(adsSource, /data-wu-monetization-type/, 'Page-type measurement metadata is missing');
assert.match(adsSource, /data-wu-ad-placement/, 'Placement measurement metadata is missing');
assert.match(adsSource, /post-workspace/, 'Explicit post-workspace boundary guard is missing');
assert.match(adsSource, /data-write-urdu-ads/, 'AdSense single-loader marker is missing');
assert.doesNotMatch(adsSource, /data-ad-channel\s*=/, 'Do not invent AdSense custom-channel IDs before channels exist in the publisher account');

// Regression contract for the 2026-07-11 monetization incident: the major
// cleanup removed advertising from the three highest-value writing surfaces.
// Keep exactly one safe restoration path after the workspace instead of
// bringing back legacy sidebar/page-level ad initialization.
assert.match(writeMonetization, /CORE_ROUTES\s*=\s*\['\/', '\/urdu-editor', '\/urdu-keyboard'\]/, 'All three core Write routes must participate in monetization restoration');
assert.match(writeMonetization, /data-wu-ad-boundary["']?,?\s*['"]post-workspace|setAttribute\('data-wu-ad-boundary', 'post-workspace'\)/, 'Core Write ads must remain behind an explicit post-workspace boundary');
assert.match(writeMonetization, /id\('UsageAlert'\)|getElementById\('UsageAlert'\)/, 'Homepage ad boundary must remain after the active writing workspace');
assert.match(writeMonetization, /getElementById\('basic-example'\)/, 'Rich Editor ad boundary must remain after the editor mount');
assert.match(writeMonetization, /getElementById\('key1'\)/, 'Urdu Keyboard ad boundary must remain after the on-screen keyboard');
assert.match(writeMonetization, /data-ad-slot=\\?"['"]?\s*\+?\s*SHARED_SLOT|data-ad-slot/, 'Core Write restoration must use the shared responsive AdSense unit');
assert.match(writeMonetization, /js\/ads\.js/, 'Core Write restoration must delegate initialization to the central AdSense policy runtime');
assert.doesNotMatch(writeMonetization, /enable_page_level_ads|3607727011|6402857400|7272007417/, 'Do not restore legacy page-level, sidebar, green or link-ad stacks');
assert.match(mainSource, /js\/write-monetization\.js/, 'Homepage/keyboard runtime must load the core Write monetization module');
assert.match(inputModeSource, /js\/write-monetization\.js/, 'Rich editor runtime must load the core Write monetization module');

const registryPath = path.join(root, 'docs', 'WU-PUBLIC-PAGE-REGISTRY.csv');
const registryLines = fs.readFileSync(registryPath, 'utf8').trim().split(/\r?\n/).slice(1);
const registryRoutes = registryLines.map(line => line.split(',')[1]).filter(Boolean);
const unclassified = registryRoutes.filter(route => ads.resolvePageType(route) === 'unclassified');
assert.deepStrictEqual(unclassified, [], `Every registered public route must have a monetization type: ${unclassified.join(', ')}`);

const siteHeader = fs.readFileSync(path.join(root, 'site-header.js'), 'utf8');
assert.match(siteHeader, /script\[src=\\?"js\/ads\.js\\?"\]/, 'Shared shell must keep the AdSense loader single-instance guard');
assert.doesNotMatch(siteHeader, /adsbygoogle[^\n]*data-ad-channel/, 'Shared shell must not hard-code an unverified custom-channel ID');

console.log('AdSense page-type policy contract passed.');
