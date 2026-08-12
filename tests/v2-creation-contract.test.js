const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const seoConfig = require(path.join(root, 'seo.config.js'));

const css = read('css/v2-creation.css');
const focusedCss = read('css/v2-creation-tools.css');
const cardUi = read('js/card-studio-ui.js');
const templateUi = read('js/template-library.js');
const stylishUi = read('js/stylish-urdu-text.js');
const nameArtUi = read('js/name-art.js');
const cardPage = read('urdu-card-studio.html');
const templatePage = read('urdu-templates.html');
const stylishPage = read('stylish-urdu-text-generator.html');
const nameArtPage = read('urdu-name-art-maker.html');
const sw = read('sw.js');

assert.match(css, /\.wu-v2-shell\.card-studio-page/, 'Card Studio is missing the v2 creation workspace layer');
assert.match(css, /\.wu-v2-shell\.template-library-page-body/, 'Templates are missing the v2 creation workspace layer');
assert.match(css, /grid-template-columns:minmax\(300px,330px\) minmax\(0,1fr\)/, 'Card Studio must keep the artboard dominant on desktop');
assert.match(css, /\.card-studio-panel\{[\s\S]*position:sticky/, 'Card Studio control rail should remain available while designing');
assert.match(css, /\.template-library-controls\{[\s\S]*top:108px/, 'Template filters should account for the sticky v2 header');
assert.match(css, /@media\(max-width:900px\)/, 'Card Studio v2 creation layer needs a mobile breakpoint');
assert.match(css, /@media\(max-width:720px\)/, 'Template v2 creation layer needs a mobile breakpoint');

assert.match(focusedCss, /\.wu-v2-shell\.stylish-page/, 'Stylish Text is missing the focused v2 creation layer');
assert.match(focusedCss, /\.wu-v2-shell\.name-art-page/, 'Name Art is missing the focused v2 creation layer');
assert.match(focusedCss, /grid-template-columns:minmax\(290px,330px\) minmax\(0,1fr\)/, 'Focused creative tools must keep the result/workspace dominant on desktop');
assert.match(focusedCss, /\.stylish-panel\{[\s\S]*position:sticky/, 'Stylish Text input rail should remain available beside results');
assert.match(focusedCss, /\.name-art-shortcuts\{[\s\S]*position:sticky/, 'Name Art shortcut rail should remain available beside the canvas');
assert.match(focusedCss, /\.name-art-frame\{[\s\S]*height:calc\(100vh - 132px\)/, 'Name Art live workspace should dominate the desktop viewport');
assert.match(focusedCss, /@media\(max-width:900px\)/, 'Focused creation layer needs a mobile stacking breakpoint');

assert.match(cardUi, /css\/v2-creation\.css/, 'Card Studio does not load the shared v2 creation layer');
assert.match(cardUi, /root\.dataset\.v2CreationWorkspace = 'card-studio'/, 'Card Studio migration marker is missing');
assert.doesNotMatch(cardUi, /toBlob|drawImage|fillText|canvas\.width/, 'Presentation migration must not become a second renderer');

assert.match(templateUi, /css\/v2-creation\.css/, 'Template Library does not load the shared v2 creation layer');
assert.match(templateUi, /root\.dataset\.v2CreationWorkspace = 'templates'/, 'Template Library migration marker is missing');
assert.match(templateUi, /Start a blank card/, 'Templates need a direct blank Card Studio entry point');
assert.match(templateUi, /Edit in Card Studio/, 'Template card CTA should make the destination explicit');
assert.match(templateUi, /\/urdu-card-studio\?template=/, 'Template-to-Card-Studio handoff route changed');
assert.match(templateUi, /writeUrdu\.templateFavorites\.v1/, 'Template favorites storage contract changed');
assert.match(templateUi, /writeUrdu\.templateRecents\.v1/, 'Template recents storage contract changed');

assert.match(stylishUi, /css\/v2-creation\.css/, 'Stylish Text does not load the shared v2 creation foundation');
assert.match(stylishUi, /css\/v2-creation-tools\.css/, 'Stylish Text does not load the focused v2 creation layer');
assert.match(stylishUi, /root\.dataset\.v2CreationWorkspace = 'stylish-text'/, 'Stylish Text migration marker is missing');
assert.match(stylishUi, /writeUrdu\.stylishText\.incoming\.v1/, 'Stylish Text editor handoff changed during migration');
assert.match(stylishUi, /core\.STORAGE_KEYS\.favorites/, 'Stylish Text favorites contract changed during migration');
assert.match(stylishUi, /core\.STORAGE_KEYS\.collections/, 'Stylish Text collections contract changed during migration');
assert.match(stylishUi, /button\('Share'/, 'Stylish Text result sharing changed during migration');
assert.match(stylishUi, /button\('Name Art'/, 'Stylish Text to Name Art handoff changed during migration');
assert.doesNotMatch(stylishUi, /drawImage|fillText|canvas\.width/, 'Stylish Text presentation migration must not add image rendering');

assert.match(nameArtUi, /css\/v2-creation\.css/, 'Name Art does not load the shared v2 creation foundation');
assert.match(nameArtUi, /css\/v2-creation-tools\.css/, 'Name Art does not load the focused v2 creation layer');
assert.match(nameArtUi, /root\.dataset\.v2CreationWorkspace = 'name-art'/, 'Name Art migration marker is missing');
assert.match(nameArtUi, /writeUrdu\.nameArt\.handoff\.v1/, 'Name Art incoming handoff changed during migration');
assert.match(nameArtUi, /urdu-card-studio\.html\?nameArt=1/, 'Name Art must continue to reuse Card Studio');
assert.match(nameArtUi, /canvas\.width !== 1600 \|\| canvas\.height !== 900/, 'Transparent Name Art export dimensions changed');
assert.match(nameArtUi, /urdu-name-art-transparent\.png/, 'Transparent Name Art filename contract changed');

assert.match(cardPage, /data-card-studio/, 'Card Studio application root changed');
assert.match(cardPage, /data-card-action="download"/, 'Card Studio download contract changed');
assert.match(cardPage, /data-card-action="share"/, 'Card Studio share contract changed');
assert.match(cardPage, /data-card-templates/, 'Card Studio template controls changed');
assert.match(cardPage, /class="card-studio-preview"/, 'Card Studio preview is missing');
assert.match(cardPage, /<section class="seo-content"/, 'Card Studio supporting content should remain after the workspace');
assert.doesNotMatch(cardPage, /<ins[^>]+adsbygoogle/i, 'Do not place a manual ad inside Card Studio markup');

assert.match(templatePage, /data-template-library/, 'Template Library application root changed');
assert.match(templatePage, /data-template-grid/, 'Template result grid changed');
assert.match(templatePage, /data-template-search/, 'Template search changed');
assert.match(templatePage, /data-template-categories/, 'Template category filters changed');
assert.ok(templatePage.includes(`href="${seoConfig.canonical('/urdu-templates')}"`), 'Template canonical URL changed');

assert.match(stylishPage, /data-stylish-generator/, 'Stylish Text application root changed');
assert.match(stylishPage, /data-stylish-results/, 'Stylish Text results grid changed');
assert.match(stylishPage, /data-stylish-category/, 'Stylish Text category filter changed');
assert.match(stylishPage, /data-stylish-intensity/, 'Stylish Text intensity filter changed');
assert.ok(stylishPage.includes(`href="${seoConfig.canonical('/stylish-urdu-text-generator')}"`), 'Stylish Text canonical URL changed');

assert.match(nameArtPage, /data-name-art/, 'Name Art application root changed');
assert.match(nameArtPage, /data-name-art-frame/, 'Name Art Card Studio iframe changed');
assert.match(nameArtPage, /data-name-art-templates/, 'Name Art template control changed');
assert.match(nameArtPage, /data-name-art-transparent/, 'Name Art transparent export action changed');
assert.ok(nameArtPage.includes(`href="${seoConfig.canonical('/urdu-name-art-maker')}"`), 'Name Art canonical URL changed');

assert.match(sw, /css\/v2-creation\.css/, 'The v2 creation layer should be available in the PWA shell');
assert.match(sw, /css\/v2-creation-tools\.css/, 'The focused v2 creation layer should be available in the PWA shell');

console.log('V2 creation migration contract passed for Card Studio, Templates, Stylish Text and Name Art.');
