const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const seoConfig = require(path.join(root, 'seo.config.js'));

const css = read('css/v2-creation.css');
const cardUi = read('js/card-studio-ui.js');
const templateUi = read('js/template-library.js');
const cardPage = read('urdu-card-studio.html');
const templatePage = read('urdu-templates.html');
const sw = read('sw.js');

assert.match(css, /\.wu-v2-shell\.card-studio-page/, 'Card Studio is missing the v2 creation workspace layer');
assert.match(css, /\.wu-v2-shell\.template-library-page-body/, 'Templates are missing the v2 creation workspace layer');
assert.match(css, /grid-template-columns:minmax\(300px,330px\) minmax\(0,1fr\)/, 'Card Studio must keep the artboard dominant on desktop');
assert.match(css, /\.card-studio-panel\{[\s\S]*position:sticky/, 'Card Studio control rail should remain available while designing');
assert.match(css, /\.template-library-controls\{[\s\S]*top:108px/, 'Template filters should account for the sticky v2 header');
assert.match(css, /@media\(max-width:900px\)/, 'Card Studio v2 creation layer needs a mobile breakpoint');
assert.match(css, /@media\(max-width:720px\)/, 'Template v2 creation layer needs a mobile breakpoint');

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

assert.match(sw, /css\/v2-creation\.css/, 'The v2 creation layer should be available in the PWA shell');

console.log('V2 Card Studio + Templates creation migration contract passed.');
