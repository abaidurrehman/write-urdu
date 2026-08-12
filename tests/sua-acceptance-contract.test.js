const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const nameArt = require('../js/name-art-core.js');
const cardCore = require('../js/card-studio-core.js');

assert.strictEqual(nameArt.PACKS.length, 12, 'Name Art must expose the 12 promised template packs');
assert.strictEqual(nameArt.TEMPLATES.length, 24, 'Name Art must ship 24 original templates');
assert.strictEqual(new Set(nameArt.TEMPLATES.map(template => template.id)).size, 24, 'Name Art template IDs must be unique');
nameArt.PACKS.forEach(pack => {
    assert.strictEqual(nameArt.templatesForPack(pack.id).length, 2, `${pack.label} must ship two launch templates`);
});

const expectedPresets = {
    square: [1080, 1080],
    portrait: [1080, 1350],
    landscape: [1280, 720],
    facebook: [1200, 630],
    story: [1080, 1920],
    'name-transparent': [1600, 900]
};
assert.strictEqual(nameArt.PRESETS.length, 6, 'Name Art must expose all six required output presets');
nameArt.PRESETS.forEach(preset => {
    assert.deepStrictEqual([preset.width, preset.height], expectedPresets[preset.id], `${preset.label} dimensions changed`);
});

assert.strictEqual(nameArt.install(cardCore), true, 'Name Art must install into the shared Card Studio core');
assert.ok(cardCore.PRESETS.some(preset => preset.id === 'name-transparent' && preset.width === 1600 && preset.height === 900), 'Shared renderer is missing the transparent name preset');
nameArt.TEMPLATES.forEach(template => {
    assert.ok(cardCore.TEMPLATES.some(item => item.id === template.id), `${template.id} was not installed into Card Studio`);
    const applied = cardCore.applyTemplate(cardCore.createDefaultCardProject('سلام'), template.id);
    assert.strictEqual(applied.templateId, template.id, `${template.id} cannot be applied by the shared renderer`);
});

const transparent = nameArt.transparentState(cardCore, cardCore.createDefaultCardProject('میرا نام'));
assert.strictEqual(transparent.presetId, 'name-transparent', 'Transparent export must use the 1600×900 preset');
assert.strictEqual(transparent.templateId, 'name-transparent-clean', 'Transparent export must use the no-decoration template');
assert.strictEqual(transparent.background.type, 'solid');
assert.strictEqual(transparent.background.color, 'rgba(0,0,0,0)', 'Transparent export background must remain alpha-zero');
assert.strictEqual(transparent.watermark.enabled, false, 'Transparent name export must not burn in a watermark');
assert.strictEqual(transparent.text.value, 'میرا نام', 'Transparent export must preserve the user text');

const stylishController = fs.readFileSync(path.join(root, 'js', 'stylish-urdu-text.js'), 'utf8');
assert.match(stylishController, /button\('Share'/, 'Stylish result cards must provide the required Share action');
assert.match(stylishController, /STORAGE_KEYS\.favorites/, 'Stylish favourites persistence is missing');
assert.match(stylishController, /STORAGE_KEYS\.collections/, 'Stylish collections persistence is missing');
assert.match(stylishController, /STORAGE_KEYS\.recents/, 'Stylish recent-input persistence is missing');

const nameArtPage = fs.readFileSync(path.join(root, 'urdu-name-art-maker.html'), 'utf8');
assert.match(nameArtPage, /js\/name-art-core\.js[^\n]*js\/name-art\.js/, 'Name Art core must load before its controller');
assert.match(nameArtPage, /data-name-art-pack/, 'Name Art pack selector is missing');
assert.match(nameArtPage, /data-name-art-preset/, 'Name Art preset selector is missing');
assert.match(nameArtPage, /data-name-art-transparent/, 'Transparent PNG action is missing');
assert.match(nameArtPage, /data-wu-ad-boundary="post-workspace"/, 'Name Art monetization boundary must remain outside the workspace');
assert.match(nameArtPage, /Nothing is uploaded|stay in this browser/i, 'Name Art local-processing privacy message is missing');
assert.doesNotMatch(nameArtPage, /[?&](?:text|name)=/i, 'Name Art must not put user text into URLs');

const nameArtController = fs.readFileSync(path.join(root, 'js', 'name-art.js'), 'utf8');
assert.match(nameArtController, /30 \* 60 \* 1000/, 'Name Art handoff must expire after 30 minutes');
assert.match(nameArtController, /sessionStorage\.removeItem\(handoffKey\)/, 'Name Art must remove the one-time handoff after import');
assert.match(nameArtController, /nameArt\.install\(frameCore\)/, 'Name Art must extend the existing Card Studio core rather than create another renderer');
assert.match(nameArtController, /document\.fonts|doc\.fonts/, 'Name Art export must wait for fonts');
assert.match(nameArtController, /canvas\.width !== 1600 \|\| canvas\.height !== 900/, 'Transparent export must verify exact pixel dimensions');
assert.match(nameArtController, /canvas\.toBlob/, 'Transparent export must use the rendered canvas PNG pipeline');

const cardStudioController = fs.readFileSync(path.join(root, 'js', 'card-studio.js'), 'utf8');
assert.match(cardStudioController, /ensureProjectFonts\(\).*drawCard\(\{ export: true \}\)/s, 'Normal Card Studio PNG export must keep waiting for project fonts before rendering');
assert.match(cardStudioController, /image\.onload/, 'Local background images must finish decoding before becoming the current export asset');

console.log('WU-SUA-001 acceptance contract passed.');
