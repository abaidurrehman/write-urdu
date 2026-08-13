const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const seo = require(path.join(root, 'seo.config.js'));
const social = require(path.join(root, 'js', 'social-maker-core.js'));
const qr = require(path.join(root, 'js', 'qr-generator-core.js'));

const creationCss = read('css/v2-creation.css');
const focusedCss = read('css/v2-creation-tools.css');
const directCss = read('css/social-direct-workspace.css');
const cardUi = read('js/card-studio-ui.js');
const stylishUi = read('js/stylish-urdu-text.js');
const nameArtUi = read('js/name-art.js');
const directUi = read('js/social-direct-workspace.js');
const instagramUi = read('js/social-direct-instagram.js');
const cardPage = read('urdu-card-studio.html');
const templatePage = read('urdu-templates.html');
const stylishPage = read('stylish-urdu-text-generator.html');
const nameArtPage = read('urdu-name-art-maker.html');
const whatsappPage = read('urdu-whatsapp-status-maker.html');
const instagramPage = read('urdu-instagram-post-maker.html');
const qrPage = read('qr-code-generator.html');
const sw = read('sw.js');

assert.match(creationCss, /\.wu-v2-shell\.card-studio-page/, 'Card Studio v2 layer missing');
assert.match(creationCss, /grid-template-columns:minmax\(300px,330px\) minmax\(0,1fr\)/, 'Card Studio desktop hierarchy changed');
assert.match(focusedCss, /\.wu-v2-shell\.stylish-page/, 'Stylish v2 layer missing');
assert.match(focusedCss, /\.wu-v2-shell\.name-art-page/, 'Name Art v2 layer missing');
assert.match(directCss, /\.social-maker-workspace-direct/, 'Direct social workspace styling missing');
assert.match(directCss, /\.social-maker-engine-support\{display:none!important\}/, 'Shared-engine support must remain internal');

assert.match(cardUi, /root\.dataset\.v2CreationWorkspace = 'card-studio'/, 'Card Studio marker missing');
assert.doesNotMatch(cardUi, /toBlob|drawImage|fillText|canvas\.width/, 'Card Studio presentation layer must not become another renderer');
assert.match(stylishUi, /button\('Share'/, 'Stylish Share changed');
assert.match(stylishUi, /button\('Name Art'/, 'Stylish to Name Art handoff changed');
assert.doesNotMatch(stylishUi, /drawImage|fillText|canvas\.width/, 'Stylish must not add image rendering');
assert.match(nameArtUi, /WriteUrduCardStudioApp/, 'Name Art must reuse the shared Card Studio engine');
assert.match(nameArtUi, /getWorkspaceApp/, 'Name Art direct workspace bridge missing');
assert.doesNotMatch(nameArtUi, /frame\.contentWindow|frame\.contentDocument|data-name-art-frame/, 'Name Art must not depend on iframe internals');

assert.match(cardPage, /data-card-studio/, 'Card Studio root changed');
assert.match(cardPage, /data-card-action="download"/, 'Card Studio download changed');
assert.match(templatePage, /data-template-library/, 'Template Library root changed');
assert.match(templatePage, /data-template-grid/, 'Template result grid changed');
assert.ok(templatePage.includes(`href="${seo.canonical('/urdu-templates')}"`), 'Template canonical changed');
assert.match(stylishPage, /data-stylish-generator/, 'Stylish root changed');
assert.match(stylishPage, /data-stylish-results/, 'Stylish results changed');
assert.ok(stylishPage.includes(`href="${seo.canonical('/stylish-urdu-text-generator')}"`), 'Stylish canonical changed');
assert.match(nameArtPage, /data-name-art-workspace[^>]+data-card-studio/, 'Name Art must own the shared engine root');
assert.match(nameArtPage, /<canvas[^>]+id="cardCanvas"/, 'Name Art direct canvas missing');
assert.doesNotMatch(nameArtPage, /<iframe\b/i, 'Name Art must not contain an iframe');

for (const [page, mode, route] of [
  [whatsappPage, 'whatsapp', '/urdu-whatsapp-status-maker'],
  [instagramPage, 'instagram', '/urdu-instagram-post-maker']
]) {
  assert.match(page, new RegExp(`data-social-direct-workspace="${mode}"[^>]+data-card-studio|data-card-studio[^>]+data-social-direct-workspace="${mode}"`), `${mode} must own the shared visual-engine root`);
  assert.match(page, /js\/social-direct-workspace\.js/, `${mode} shared direct adapter missing`);
  assert.match(page, /css\/social-direct-workspace\.css/, `${mode} direct styles missing`);
  assert.doesNotMatch(page, /<iframe\b/i, `${mode} must not contain an iframe`);
  assert.ok(page.includes(`href="${seo.canonical(route)}"`), `${mode} canonical changed`);
  assert.match(page, /data-wu-ad-boundary="post-workspace"/, `${mode} ad boundary must remain after the workspace`);
  assert.doesNotMatch(page, /<ins[^>]+adsbygoogle/i, `${mode} active workspace must not contain a manual ad`);
}
assert.doesNotMatch(whatsappPage, /urdu-card-studio\.html\?social=whatsapp/, 'WhatsApp legacy iframe route must be removed');
assert.doesNotMatch(instagramPage, /urdu-card-studio\.html\?social=instagram/, 'Instagram legacy iframe route must be removed');
assert.match(instagramPage, /js\/social-direct-instagram\.js/, 'Instagram direct role controller missing');
assert.match(instagramPage, /css\/instagram-direct-workspace\.css/, 'Instagram role styles missing');

assert.match(directUi, /WriteUrduCardStudioApp/, 'Direct social roles must reuse the shared Card Studio application engine');
assert.match(directUi, /getWorkspaceApp/, 'Direct social app bridge missing');
assert.doesNotMatch(directUi, /contentWindow|contentDocument|frameLocator/, 'Shared direct adapter must not reach into iframe internals');
assert.match(instagramUi, /id="cardCanvas"/, 'Instagram must mount the real top-level canvas');
assert.match(instagramUi, /data-instagram-preset="square"/, 'Instagram square choice missing');
assert.match(instagramUi, /data-instagram-preset="portrait"/, 'Instagram portrait choice missing');
assert.match(instagramUi, /data-instagram-preset="story"/, 'Instagram story choice missing');
assert.match(instagramUi, /core\.applyPreset/, 'Instagram role choices must map into shared project state');
assert.doesNotMatch(instagramUi, /contentWindow|contentDocument|drawImage|fillText/, 'Instagram role controller must not embed an app or create a renderer');

assert.strictEqual(social.getMode('whatsapp').defaultPreset, 'story');
assert.strictEqual(social.getMode('instagram').defaultPreset, 'square');
assert.strictEqual(social.getModeFromLocation({ pathname:'/urdu-whatsapp-status-maker.html', search:'' }).id, 'whatsapp');
assert.strictEqual(social.getModeFromLocation({ pathname:'/urdu-instagram-post-maker.html', search:'' }).id, 'instagram');
assert.deepStrictEqual(social.getSafeArea('whatsapp', { id:'story', width:1080, height:1920 }), { top:230, right:100, bottom:290, left:100 });
assert.deepStrictEqual(social.getSafeArea('instagram', { id:'square', width:1080, height:1080 }), { top:90, right:90, bottom:90, left:90 });
assert.deepStrictEqual(social.getSafeArea('instagram', { id:'portrait', width:1080, height:1350 }), { top:120, right:90, bottom:150, left:90 });
assert.deepStrictEqual(social.getSafeArea('instagram', { id:'story', width:1080, height:1920 }), { top:230, right:100, bottom:290, left:100 });

assert.match(qrPage, /data-qr-download-png/, 'QR PNG download changed');
assert.match(qrPage, /data-qr-download-svg/, 'QR SVG download changed');
assert.strictEqual(qr.buildTextPayload({ text:'سلام دنیا' }).valid, true);
assert.strictEqual(qr.buildUrlPayload({ url:'not a url' }).valid, false);
assert.match(sw, /urdu-whatsapp-status-maker\.html/, 'WhatsApp missing from PWA shell');
assert.match(sw, /urdu-instagram-post-maker\.html/, 'Instagram missing from PWA shell');

console.log('V2 creation contract passed for direct Name Art, WhatsApp Status and Instagram workspaces.');
