const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const seoConfig = require(path.join(root, 'seo.config.js'));
const socialCore = require(path.join(root, 'js', 'social-maker-core.js'));
const qrCore = require(path.join(root, 'js', 'qr-generator-core.js'));

const creationCss = read('css/v2-creation.css');
const focusedCss = read('css/v2-creation-tools.css');
const nameArtCss = read('css/name-art-task-first.css');
const publishCss = read('css/v2-publish-tools.css');
const cardUi = read('js/card-studio-ui.js');
const templateUi = read('js/template-library.js');
const stylishUi = read('js/stylish-urdu-text.js');
const nameArtUi = read('js/name-art.js');
const cardPage = read('urdu-card-studio.html');
const templatePage = read('urdu-templates.html');
const stylishPage = read('stylish-urdu-text-generator.html');
const nameArtPage = read('urdu-name-art-maker.html');
const whatsappPage = read('urdu-whatsapp-status-maker.html');
const instagramPage = read('urdu-instagram-post-maker.html');
const qrPage = read('qr-code-generator.html');
const sw = read('sw.js');

assert.match(creationCss, /\.wu-v2-shell\.card-studio-page/, 'Card Studio v2 layer missing');
assert.match(creationCss, /\.wu-v2-shell\.template-library-page-body/, 'Templates v2 layer missing');
assert.match(creationCss, /grid-template-columns:minmax\(300px,330px\) minmax\(0,1fr\)/, 'Card Studio artboard must dominate desktop');
assert.match(creationCss, /@media\(max-width:900px\)/, 'Card Studio mobile breakpoint missing');

assert.match(focusedCss, /\.wu-v2-shell\.stylish-page/, 'Stylish Text focused layer missing');
assert.match(focusedCss, /\.wu-v2-shell\.name-art-page/, 'Name Art focused layer missing');
assert.match(focusedCss, /grid-template-columns:minmax\(290px,330px\) minmax\(0,1fr\)/, 'Focused tools must keep result/workspace dominant');
assert.match(nameArtCss, /\.name-art-direct-shell/, 'Name Art direct workspace styling missing');
assert.match(nameArtCss, /\.name-art-engine-support\{display:none!important\}/, 'Shared-engine support UI must remain internal');

assert.match(publishCss, /\.wu-v2-shell\.social-maker-page/, 'Social publish layer missing');
assert.match(publishCss, /\.wu-v2-shell\.qr-generator-page/, 'QR publish layer missing');
assert.match(publishCss, /@media\(max-width:900px\)/, 'Publish mobile breakpoint missing');

assert.match(cardUi, /css\/v2-creation\.css/, 'Card Studio must load v2 creation CSS');
assert.match(cardUi, /root\.dataset\.v2CreationWorkspace = 'card-studio'/, 'Card Studio marker missing');
assert.doesNotMatch(cardUi, /toBlob|drawImage|fillText|canvas\.width/, 'Card Studio UI layer must not become another renderer');

assert.match(templateUi, /root\.dataset\.v2CreationWorkspace = 'templates'/, 'Templates marker missing');
assert.match(templateUi, /Start a blank card/, 'Templates need blank Card Studio entry');
assert.match(templateUi, /Edit in Card Studio/, 'Template edit CTA changed');
assert.match(templateUi, /writeUrdu\.templateFavorites\.v1/, 'Template favourites storage changed');
assert.match(templateUi, /writeUrdu\.templateRecents\.v1/, 'Template recents storage changed');

assert.match(stylishUi, /root\.dataset\.v2CreationWorkspace = 'stylish-text'/, 'Stylish marker missing');
assert.match(stylishUi, /writeUrdu\.stylishText\.incoming\.v1/, 'Stylish handoff changed');
assert.match(stylishUi, /button\('Share'/, 'Stylish Share changed');
assert.match(stylishUi, /button\('Name Art'/, 'Stylish to Name Art handoff changed');
assert.doesNotMatch(stylishUi, /drawImage|fillText|canvas\.width/, 'Stylish must not add image rendering');

assert.match(nameArtUi, /root\.dataset\.v2CreationWorkspace = 'name-art'/, 'Name Art marker missing');
assert.match(nameArtUi, /writeUrdu\.nameArt\.handoff\.v1/, 'Name Art handoff changed');
assert.match(nameArtUi, /WriteUrduCardStudioApp/, 'Name Art must reuse the shared Card Studio engine');
assert.match(nameArtUi, /getWorkspaceApp/, 'Name Art must expose a direct workspace app');
assert.doesNotMatch(nameArtUi, /data-name-art-frame|frame\.contentWindow|frame\.contentDocument|urdu-card-studio\.html\?nameArt=1/, 'Name Art must not depend on an embedded Card Studio route');
assert.match(nameArtUi, /canvas\.width !== 1600 \|\| canvas\.height !== 900/, 'Transparent export dimensions changed');
assert.match(nameArtUi, /urdu-name-art-transparent\.png/, 'Transparent export filename changed');

assert.match(cardPage, /data-card-studio/, 'Card Studio root changed');
assert.match(cardPage, /data-card-action="download"/, 'Card Studio download changed');
assert.match(cardPage, /data-card-action="share"/, 'Card Studio share changed');
assert.match(cardPage, /class="card-studio-preview"/, 'Card Studio preview missing');
assert.doesNotMatch(cardPage, /<ins[^>]+adsbygoogle/i, 'Card Studio must not contain a manual active-workspace ad');

assert.match(templatePage, /data-template-library/, 'Template Library root changed');
assert.match(templatePage, /data-template-grid/, 'Template result grid changed');
assert.ok(templatePage.includes(`href="${seoConfig.canonical('/urdu-templates')}"`), 'Template canonical changed');

assert.match(stylishPage, /data-stylish-generator/, 'Stylish root changed');
assert.match(stylishPage, /data-stylish-results/, 'Stylish results changed');
assert.ok(stylishPage.includes(`href="${seoConfig.canonical('/stylish-urdu-text-generator')}"`), 'Stylish canonical changed');

assert.match(nameArtPage, /data-name-art/, 'Name Art root changed');
assert.match(nameArtPage, /data-name-art-workspace[^>]+data-card-studio/, 'Name Art must own the shared engine root directly');
assert.match(nameArtPage, /<canvas[^>]+id="cardCanvas"/, 'Name Art direct canvas missing');
assert.doesNotMatch(nameArtPage, /<iframe\b/i, 'Name Art must not contain an iframe');
assert.match(nameArtPage, /data-name-art-templates/, 'Name Art template controls changed');
assert.match(nameArtPage, /data-name-art-transparent/, 'Name Art transparent export changed');
assert.ok(nameArtPage.includes(`href="${seoConfig.canonical('/urdu-name-art-maker')}"`), 'Name Art canonical changed');

for (const [page, route, marker, mode] of [
  [whatsappPage, '/urdu-whatsapp-status-maker', 'social-whatsapp', 'whatsapp'],
  [instagramPage, '/urdu-instagram-post-maker', 'social-instagram', 'instagram']
]) {
  assert.match(page, new RegExp(`data-v2-creation-workspace="${marker}"`), `${marker} marker missing`);
  assert.match(page, new RegExp(`urdu-card-studio\\.html\\?social=${mode}`), `${marker} current shared-engine iframe contract changed before its migration slice`);
  assert.match(page, /data-wu-ad-boundary="post-workspace"/, `${marker} must keep monetization after the workspace`);
  assert.ok(page.includes(`href="${seoConfig.canonical(route)}"`), `${marker} canonical changed`);
  assert.doesNotMatch(page, /<ins[^>]+adsbygoogle/i, `${marker} must not contain a manual active-workspace ad`);
}

assert.strictEqual(socialCore.getMode('whatsapp').defaultPreset, 'story', 'WhatsApp default changed');
assert.strictEqual(socialCore.getMode('instagram').defaultPreset, 'square', 'Instagram default changed');
assert.deepStrictEqual(socialCore.getSafeArea('whatsapp', { id: 'story', width: 1080, height: 1920 }), { top: 230, right: 100, bottom: 290, left: 100 }, 'WhatsApp safe area changed');
assert.deepStrictEqual(socialCore.getSafeArea('instagram', { id: 'portrait', width: 1080, height: 1350 }), { top: 120, right: 90, bottom: 150, left: 90 }, 'Instagram safe area changed');

assert.match(qrPage, /data-v2-creation-workspace="qr-generator"/, 'QR marker missing');
assert.match(qrPage, /data-qr-download-png/, 'QR PNG download changed');
assert.match(qrPage, /data-qr-download-svg/, 'QR SVG download changed');
assert.match(qrPage, /data-wu-ad-boundary="post-workspace"/, 'QR ad boundary changed');
assert.ok(qrPage.includes(`href="${seoConfig.canonical('/qr-code-generator')}"`), 'QR canonical changed');
assert.strictEqual(qrCore.buildTextPayload({ text: 'سلام دنیا' }).valid, true, 'Urdu QR payload regressed');
assert.strictEqual(qrCore.buildUrlPayload({ url: 'not a url' }).valid, false, 'Invalid QR URL must remain rejected');

assert.match(sw, /css\/v2-creation\.css/, 'v2 creation CSS missing from PWA shell');
assert.match(sw, /css\/v2-creation-tools\.css/, 'focused creation CSS missing from PWA shell');
assert.match(sw, /css\/v2-publish-tools\.css/, 'publish CSS missing from PWA shell');
assert.match(sw, /urdu-whatsapp-status-maker\.html/, 'WhatsApp maker missing from PWA shell');
assert.match(sw, /urdu-instagram-post-maker\.html/, 'Instagram maker missing from PWA shell');

console.log('V2 creation contract passed including direct Name Art workspace.');
