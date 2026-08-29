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
const v2ShellCss = fs.readFileSync(path.join(root, 'css', 'v2-shell.css'), 'utf8');
const v3DesignCss = fs.readFileSync(path.join(root, 'css', 'v3-design-system.css'), 'utf8');
const designTokens = fs.readFileSync(path.join(root, 'css', 'design-tokens.css'), 'utf8');
const coreWriteAutoAdsPolicy = fs.readFileSync(path.join(root, 'docs', 'WU-MOBILE-ADSENSE-CORE-WRITE-PAGE-EXCLUSIONS-2026-08-19.md'), 'utf8');

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
assert.strictEqual(ads.resolvePageType('/changelog'), 'trust', 'Customer changelog must remain an ad-free trust/product-information surface');
assert.strictEqual(ads.resolvePageType('/write-urdu-feedback'), 'trust', 'Feedback must not be monetized as a content page');
assert.strictEqual(ads.resolvePageType('/community-guidelines'), 'trust', 'Community guidelines must not be monetized as a content page');
assert.strictEqual(ads.resolvePageType('/my-publications'), 'trust', 'My Publications is a private writer dashboard and must stay ad-free');
assert.strictEqual(ads.resolvePageType('/urdu-writers'), 'trust', 'Urdu Writers hub must be ad-free until content density is deliberately promoted to a monetized page type');
assert.strictEqual(ads.resolvePageType('/urdu-writers/some-slug'), 'trust', 'Urdu Writers detail pages must be ad-free until content density is deliberately promoted to a monetized page type');
assert.strictEqual(ads.resolvePageType('/urdu-writers/category/poetry'), 'trust', 'Urdu Writers category pages must be ad-free until content density is deliberately promoted to a monetized page type');

assert.strictEqual(ads.placementName('learn'), 'guide_after_answer', 'Learn placement family changed');
assert.strictEqual(ads.placementName('create'), 'tool_post_workspace', 'Create placement family changed');
assert.strictEqual(ads.placementName('write'), 'write_post_workspace', 'Write placement family changed');
assert.strictEqual(ads.LEGACY_DUPLICATE_ROUTES['/english-urdu-typing-tutorial'], true, 'Legacy tutorial duplicate-slot cleanup must remain enabled');
assert.strictEqual(typeof ads.createCanonicalRegion, 'function', 'V3 must expose the safe Learn/Create slot fallback for contract tests');

assert.match(adsSource, /data-wu-monetization-type/, 'Page-type measurement metadata is missing');
assert.match(adsSource, /data-wu-ad-placement/, 'Placement measurement metadata is missing');
assert.match(adsSource, /post-workspace/, 'Explicit post-workspace boundary guard is missing');
assert.match(adsSource, /data-write-urdu-ads/, 'AdSense single-loader marker is missing');
assert.match(adsSource, /createCanonicalRegion/, 'Learn/Create pages must be able to create one design-system ad region when legacy markup has none');
assert.match(adsSource, /data-wu-design-ad-slot/, 'Design-system-created ad regions need an explicit DOM marker');
assert.match(adsSource, /card-studio-workspace|card-studio-shell/, 'Card Studio needs a safe post-workspace placement anchor');
assert.match(adsSource, /qr-workspace|qr-generator-shell/, 'QR Generator needs a safe post-workspace placement anchor');
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

// Auto Ads are account-level behavior and must be explicitly excluded from the
// three core writing URLs. The application keeps the intentional manual unit;
// it must not hide Google-injected ads after rendering as a workaround.
['https://write-urdu.com/', 'https://write-urdu.com/urdu-editor', 'https://write-urdu.com/urdu-keyboard'].forEach(url => {
  assert.ok(coreWriteAutoAdsPolicy.includes(url), `Core Write Auto Ads exclusion policy is missing ${url}`);
});
assert.match(coreWriteAutoAdsPolicy, /Page exclusions/, 'Operational AdSense page-exclusion steps are missing');
assert.match(coreWriteAutoAdsPolicy, /This page only/, 'Core Write exclusions must be exact-page rules');
assert.match(coreWriteAutoAdsPolicy, /manual responsive unit|manual ad unit/i, 'Policy must preserve the intentional post-workspace manual ad');
assert.match(coreWriteAutoAdsPolicy, /Do not attempt to solve this by hiding already-rendered Google ad iframes or containers with CSS\/JavaScript/, 'Policy must forbid brittle client-side hiding of Auto Ads');

// V3 design-system contract: every route gets the visual layer through the
// already-global V2 shell, so individual HTML files do not need duplicate CSS
// links. Advertising uses the same geometry but remains clearly labelled and
// outside protected authoring surfaces.
assert.match(v2ShellCss, /@import\s+url\(["']\.\/v3-design-system\.css["']\)/, 'Shared shell must load the V3 design system on every migrated page');
assert.match(v3DesignCss, /\.wu-v2-shell \.wu-site-header/, 'V3 must style the shared header rather than page-local copies');
assert.match(v3DesignCss, /\.wu-v2-shell \.wu-footer/, 'V3 must style the shared footer rather than page-local copies');
assert.match(v3DesignCss, /\.wu-v2-shell \.wu-header-ad[\s\S]*min-height:/, 'Ad slots must reserve layout space to reduce CLS');
assert.match(v3DesignCss, /content:\s*["']Advertisement["']/, 'Advertising surfaces must remain explicitly labelled');
assert.match(v3DesignCss, /data-wu-monetization-type=["']trust["']/, 'Trust pages must keep their no-ad visual rule');
assert.match(v3DesignCss, /#transliterateTextarea/, 'The primary authoring surface must receive the V3 workspace treatment');
assert.match(v3DesignCss, /@media \(max-width: 767px\)/, 'V3 needs a dedicated mobile layout pass');
assert.match(designTokens, /--wu-ad-min-height-desktop/, 'Ad layout reservation belongs in the shared token system');
assert.match(designTokens, /--wu-shell-width/, 'Global page width belongs in the shared token system');

const registryPath = path.join(root, 'docs', 'WU-PUBLIC-PAGE-REGISTRY.csv');
const registryLines = fs.readFileSync(registryPath, 'utf8').trim().split(/\r?\n/).slice(1);
const registryRoutes = registryLines.map(line => line.split(',')[1]).filter(Boolean);
const unclassified = registryRoutes.filter(route => ads.resolvePageType(route) === 'unclassified');
assert.deepStrictEqual(unclassified, [], `Every registered public route must have a monetization type: ${unclassified.join(', ')}`);

const siteHeader = fs.readFileSync(path.join(root, 'site-header.js'), 'utf8');
assert.match(siteHeader, /script\[src=\\?"js\/ads\.js\\?"\]/, 'Shared shell must keep the AdSense loader single-instance guard');
assert.doesNotMatch(siteHeader, /adsbygoogle[^\n]*data-ad-channel/, 'Shared shell must not hard-code an unverified custom-channel ID');

console.log('AdSense and V3 design-system policy contract passed.');