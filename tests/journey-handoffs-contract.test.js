const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const entry = fs.readFileSync(path.join(root, 'js', 'card-studio-entry.js'), 'utf8');
const main = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
const stylish = fs.readFileSync(path.join(root, 'js', 'stylish-urdu-text.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'journey-handoffs.css'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

assert.match(entry, /writeUrdu\.richEditor\.incoming\.v1/, 'Rich Editor incoming handoff is missing');
assert.match(entry, /writeUrdu\.cardStudio\.incoming/, 'Card Studio text handoff key changed');
assert.match(entry, /writeUrdu\.stylishText\.incoming\.v1/, 'Stylish Text incoming handoff is missing');
assert.match(entry, /writeUrdu\.nameArt\.handoff\.v1/, 'Name Art handoff is missing');
assert.match(entry, /data-continue-rich/, 'Rich Editor continuation action is missing');
assert.match(entry, /data-create-card/, 'Card journey action is missing');
assert.match(entry, /data-create-stylish/, 'Stylish Text journey action is missing');
assert.match(entry, /data-create-name-art/, 'Name Art journey action is missing');
assert.match(entry, /data-wu-journey="write-to-templates"/, 'Template journey action is missing');
assert.match(entry, /HANDOFF_TTL = 30 \* 60 \* 1000/, 'Journey handoffs must expire after 30 minutes');
assert.match(entry, /write-urdu:draft:v1:rich/, 'Rich Editor current-draft preservation key is missing');
assert.match(entry, /write-urdu:history:v1:rich/, 'Rich Editor history preservation key is missing');
assert.match(entry, /preserveRichSnapshot/, 'Existing Rich Editor work must be preserved before continuation');
assert.match(entry, /stageRichDraft/, 'Incoming student text must be staged as the current Rich Editor draft');
assert.match(entry, /\['\/', '\/urdu-editor', '\/urdu-keyboard'\]/, 'Core Write route guard changed unexpectedly');
assert.match(entry, /\.homepage-seo/, 'Homepage journey must remain below the writing task');
assert.match(entry, /\.fb-comments/, 'Rich Editor journey insertion boundary is missing');
assert.match(entry, /\.keyboard-supporting-content/, 'Keyboard journey insertion boundary is missing');
assert.match(entry, /hasText:\s*Boolean/, 'Journey event must expose only a text-presence flag');
assert.doesNotMatch(entry, /detail:\s*\{[^}]*text\s*:/s, 'Journey analytics/event detail must never contain user text');
assert.match(entry, /sessionStorage\.setItem/, 'Journey handoffs must remain browser-session local');
assert.match(entry, /sessionStorage\.removeItem/, 'One-time handoffs must be consumed from session storage');
assert.doesNotMatch(entry, /[?&](?:text|name)=/, 'Journey handoffs must not put user text into URLs');

assert.match(main, /loadCoreContinuity/, 'Basic/Keyboard must load the shared Slice C continuity layer');
assert.match(main, /workspace-journey-registry\.js/, 'Core continuity loader must load the workspace registry');
assert.match(main, /workspace-handoff\.js/, 'Core continuity loader must load the shared v2 handoff runtime');
assert.match(main, /core-continuity\.js/, 'Core continuity loader must load the capture/continuity bridge');
assert.match(main, /loadScript\('js\/card-studio-entry\.js'/, 'Keyboard must retain the existing journey UI after continuity loads');
assert.match(main, /loadScript\('js\/qr-generator-entry\.js'/, 'Keyboard must retain the QR entry fallback after continuity loads');

assert.match(stylish, /INCOMING_KEY = 'writeUrdu\.stylishText\.incoming\.v1'/, 'Stylish Text must read the editor handoff');
assert.match(stylish, /sessionStorage\.removeItem\(INCOMING_KEY\)/, 'Stylish Text incoming handoff must be one-time');
assert.match(stylish, /30 \* 60 \* 1000/, 'Stylish Text incoming handoff must expire after 30 minutes');
assert.match(stylish, /Your editor text is ready to style/, 'Stylish Text must acknowledge imported editor text');

assert.match(css, /\.wu-next-journey/, 'Contextual journey UI styles are missing');
assert.match(css, /@media\(max-width:480px\)/, 'Journey UI needs a mobile layout contract');
assert.match(sw, /css\/journey-handoffs\.css/, 'Journey styling must be part of the PWA shell');

function page(name) { return fs.readFileSync(path.join(root, name), 'utf8'); }
function mustLink(source, href, message) { assert.match(source, new RegExp('href=["\\\']' + href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '["\\\']'), message); }

const homepage = page('index.html');
mustLink(homepage, '/urdu-editor', 'Homepage must link to the Rich Editor');
mustLink(homepage, '/urdu-keyboard', 'Homepage must link to the Urdu Keyboard');
mustLink(homepage, '/urdu-card-studio', 'Homepage must expose Card Studio as a destination');

const romanGuide = page('roman-urdu-transliteration.html');
mustLink(romanGuide, '/', 'Roman Urdu guide must hand users into actual typing');

const alphabet = page('urdu-alphabet.html');
mustLink(alphabet, '/urdu-keyboard', 'Alphabet guide must link to direct Urdu typing');
mustLink(alphabet, '/urdu-editor', 'Alphabet guide must link to the Rich Editor');

const fontGuide = page('urdu-fonts-nastaliq-vs-naskh.html');
mustLink(fontGuide, '/urdu-editor', 'Font guide must link to the Rich Editor');
mustLink(fontGuide, '/urdu-card-studio', 'Font guide must link to Card Studio');
mustLink(fontGuide, '/urdu-name-art-maker', 'Font guide must link to Name Art');

const faq = page('urdu-faq.html');
mustLink(faq, '/', 'FAQ must link back to the writing action');
mustLink(faq, '/roman-urdu-transliteration', 'FAQ must link to the Roman Urdu guide');
mustLink(faq, '/urdu-alphabet', 'FAQ must link to the Alphabet guide');

const stylishPage = page('stylish-urdu-text-generator.html');
mustLink(stylishPage, '/urdu-name-art-maker', 'Stylish Text must link to Name Art');
mustLink(stylishPage, '/urdu-card-studio', 'Stylish Text must link to Card Studio');
mustLink(stylishPage, '/urdu-templates', 'Stylish Text must link to templates');

const nameArtPage = page('urdu-name-art-maker.html');
mustLink(nameArtPage, '/stylish-urdu-text-generator', 'Name Art must link back to Stylish Text');
mustLink(nameArtPage, '/urdu-card-studio', 'Name Art must link to Card Studio');
mustLink(nameArtPage, '/urdu-templates', 'Name Art must link to templates');

const cardStudio = page('urdu-card-studio.html');
mustLink(cardStudio, '/urdu-templates', 'Card Studio must keep its template handoff');

console.log('Contextual writing journey contract passed.');
