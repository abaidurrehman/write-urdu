const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const page = read('functions', 's', '[id].js');
const client = read('js', 'share-page.js');
const css = read('css', 'share-page.css');
const media = read('functions', 'share-media', '[id].js');
const spec = read('specs', 'WU-SHARE-001V-viral-recipient-surface.md');

assert.match(page, /data-share-download/, 'share page needs a direct PNG download');
assert.match(page, /data-share-copy-text/, 'share page needs a Copy Urdu action');
assert.match(page, /data-share-gallery/, 'share page needs a card-gallery remix action');
assert.match(page, /اپنا خوبصورت اردو کارڈ بنائیں/, 'share page neds a high-intent Urdu creation CTA');
assert.match(page, /Create your own Urdu card — free, no account/, 'creation CTA needs low-friction supporting copy');
assert.match(page, /const titleExcerpt = excerpt\(share\.public_text, 72\)/, 'social/page title should use a bounded public-text excerpt');
assert.match(page, /meta name="robots" content="noindex,follow,max-image-preview:large"/, 'existing unlisted share pages stay noindex in this slice');

assert.match(client, /transfer\('card-gallery', 'share-to-gallery'/, 'same public Urdu should hand off to the live card gallery');
assert.match(client, /data-share-copy-text/, 'Copy Urdu action must be wired');
assert.match(client, /data-share-download/, 'PNG download interaction must be measured without a renderer');
assert.doesNotMatch(client, /URLSearchParams[sS]*(?:publicText|shareId)|location\.href\s*=[^;]*(?:text=|share=)/, 'recipient content/identity must not leak into destination URLs');

assert.match(media, /searchParams\.get\('download'\) === '1'/, 'media route needs an explicit attachment mode');
assert.match(media, /wantsDownload \? 'attachment' : 'inline'/, 'same media object should support view and download modes');

assert.match(css, /\.share-media-actions\{/, 'compact card-level actions need dedicated lightweight styling');
assert.match(css, /\.share-hero-cta\{/, 'creation acquisition CTA needs a dedicated visual hierarchy');

assert.match(spec, /Unlisted public share — current\/default/, 'spec must distinguish current unlisted sharing');
assert.match(spec, /Discoverable public share — future opt-in/, 'spec must define an explicit future discoverability mode');
assert.match(spec, /All existing share artifacts remain in this mode/, 'old public links must not become searchable retroactively');
assert.match(spec, /Do not add AdSense in this slice/, 'first viral slice must stay ad-script free');

console.log('WU-SHARE-001V viral recipient surface contract passed.');
