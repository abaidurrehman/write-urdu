// WU-UXR-002 Slice H (CARD-UX-014, 015): one helper builds the WhatsApp and Facebook
// share links, and both the Card Studio publish layer and the recipient page load it.
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');
const Core = require(path.join(root, 'js', 'share-publish-core.js'));

const url = 'https://write-urdu.com/s/Ab12Cd34';
assert.strictEqual(typeof Core.socialLinks, 'function', 'share-publish-core must export socialLinks(url, text)');
const links = Core.socialLinks(url);
assert.strictEqual(links.whatsapp, 'https://wa.me/?text=' + encodeURIComponent('Urdu card for you ' + url), 'WhatsApp link carries the default text and the URL');
assert.strictEqual(links.facebook, 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), 'Facebook link carries only the URL');
const urdu = Core.socialLinks(url, 'آپ کے لیے اردو کارڈ');
assert.strictEqual(urdu.whatsapp, 'https://wa.me/?text=' + encodeURIComponent('آپ کے لیے اردو کارڈ ' + url), 'Urdu text is encoded into the WhatsApp link');
assert.ok(!/text=|share=/.test(links.facebook.split('?u=')[1] || ''), 'no card text goes to Facebook');

const sharePage = read('functions', 's', '[id].js');
const coreTag = sharePage.indexOf('/js/share-publish-core.js');
const pageTag = sharePage.indexOf('/js/share-page.js');
assert.ok(coreTag > 0 && coreTag < pageTag, 'the recipient page loads share-publish-core.js before share-page.js');

const ui = read('js', 'card-studio-ui.js');
assert.match(ui, /\/js\/share-publish-core\.js/, 'Card Studio loads the shared helper before its publish layer');

const publish = read('js', 'card-studio-publish.js');
assert.match(publish, /data-wu-share-whatsapp/, 'success dialog has a WhatsApp link');
assert.match(publish, /data-wu-share-facebook/, 'success dialog has a Facebook link');
assert.match(publish, /data-wu-share-chooser/, 'Export step explains Picture vs Link');
assert.match(publish, /shareImageOnly: 'Send picture'/, 'file-only sharing is called Send picture');
assert.doesNotMatch(publish, /immutable snapshot/, 'success copy is plain language');

console.log('card share sheet contract passed');
