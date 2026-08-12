const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const entry = fs.readFileSync(path.join(root, 'js', 'card-studio-entry.js'), 'utf8');
const main = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
const stylish = fs.readFileSync(path.join(root, 'js', 'stylish-urdu-text.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'journey-handoffs.css'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');

assert.match(entry, /writeUrdu\.cardStudio\.incoming/, 'Card Studio text handoff key changed');
assert.match(entry, /writeUrdu\.stylishText\.incoming\.v1/, 'Stylish Text incoming handoff is missing');
assert.match(entry, /writeUrdu\.nameArt\.handoff\.v1/, 'Name Art handoff is missing');
assert.match(entry, /data-create-card/, 'Card journey action is missing');
assert.match(entry, /data-create-stylish/, 'Stylish Text journey action is missing');
assert.match(entry, /data-create-name-art/, 'Name Art journey action is missing');
assert.match(entry, /data-wu-journey="write-to-templates"/, 'Template journey action is missing');
assert.match(entry, /\['\/', '\/urdu-editor', '\/urdu-keyboard'\]/, 'Core Write route guard changed unexpectedly');
assert.match(entry, /\.homepage-seo/, 'Homepage journey must remain below the writing task');
assert.match(entry, /\.fb-comments/, 'Rich Editor journey insertion boundary is missing');
assert.match(entry, /\.keyboard-supporting-content/, 'Keyboard journey insertion boundary is missing');
assert.match(entry, /hasText:\s*Boolean/, 'Journey event must expose only a text-presence flag');
assert.doesNotMatch(entry, /detail:\s*\{[^}]*text\s*:/s, 'Journey analytics/event detail must never contain user text');
assert.match(entry, /sessionStorage\.setItem/, 'Journey handoffs must remain browser-session local');
assert.doesNotMatch(entry, /[?&](?:text|name)=/, 'Journey handoffs must not put user text into URLs');

assert.match(main, /path !== '\/urdu-keyboard'/, 'Urdu Keyboard must load the shared journey handoff runtime');
assert.match(main, /js\/card-studio-entry\.js/, 'Keyboard journey runtime loader is missing');

assert.match(stylish, /INCOMING_KEY = 'writeUrdu\.stylishText\.incoming\.v1'/, 'Stylish Text must read the editor handoff');
assert.match(stylish, /sessionStorage\.removeItem\(INCOMING_KEY\)/, 'Stylish Text incoming handoff must be one-time');
assert.match(stylish, /30 \* 60 \* 1000/, 'Stylish Text incoming handoff must expire after 30 minutes');
assert.match(stylish, /Your editor text is ready to style/, 'Stylish Text must acknowledge imported editor text');

assert.match(css, /\.wu-next-journey/, 'Contextual journey UI styles are missing');
assert.match(css, /@media\(max-width:480px\)/, 'Journey UI needs a mobile layout contract');
assert.match(sw, /css\/journey-handoffs\.css/, 'Journey styling must be part of the PWA shell');

console.log('Contextual writing journey contract passed.');
