const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const allHtmlFiles = fs.readdirSync(root).filter(file => file.endsWith('.html'));
const htmlFiles = allHtmlFiles.filter(file => !file.startsWith('google'));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

for (const file of htmlFiles) {
  const html = read(file);
  assert.match(html, /<html[^>]*\blang=["']en["']/i, `${file} must declare its language`);
  assert.doesNotMatch(html, /GTM-M45V9FW|googletagmanager\.com\/gtm\.js/i, `${file} must not load the retired GTM container`);
  assert.doesNotMatch(html, /javascript[\\/]main\.js/i, `${file} references the obsolete main.js path`);
}

for (const file of htmlFiles) {
  const html = read(file);
  assert.doesNotMatch(html, /menuscript|writting|lcass=|cwlass=|your to write|right write/i, `${file} contains a retired copy error`);
  for (const level of [1, 2, 3, 4, 5, 6]) {
    const opens = (html.match(new RegExp(`<h${level}(?:\\s|>)`, 'gi')) || []).length;
    const closes = (html.match(new RegExp(`</h${level}>`, 'gi')) || []).length;
    assert.strictEqual(opens, closes, `${file} has an unbalanced h${level} heading`);
  }
}

for (const file of ['index.html', 'urdu-editor.html', 'urdu-keyboard.html']) {
  const html = read(file);
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(match => match[1]);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  assert.deepStrictEqual([...new Set(duplicates)], [], `${file} contains duplicate IDs: ${duplicates.join(', ')}`);
}

const home = read('index.html');
assert.match(home, /makeTransliteratable\(\[['"]transliterateTextarea['"]\]\)/, 'Basic transliteration target changed');
assert.doesNotMatch(home, /clearDynamicLink|textBaseline\s*=\s*["']center|\.backgroundcolor|encodeURI\(/, 'Homepage contains a repaired legacy export defect');

const editor = read('urdu-editor.html');
assert.match(editor, /makeTransliteratable\(\[['"]basic-example_ifr['"]\]\)/, 'Rich editor transliteration target changed');
const activeEditorCode = editor.replace(/^\s*\/\/.*$/gm, '');
assert.doesNotMatch(activeEditorCode, /fonts\/Qadreeregular\.css|\.backgroundcolor|encodeURI\(/, 'Rich editor contains a repaired legacy defect');

const keyboard = read('urdu-keyboard.html');
assert.match(keyboard, /<script src=["']main\.js["']><\/script>/, 'Urdu keyboard does not load main.js');

const mainScript = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
assert.match(mainScript, /new Blob\(\[['"]\\ufeff['"],\s*textToSave\].*charset=utf-8/, 'Text export must preserve Urdu with UTF-8 and a BOM');

const runtime = fs.readFileSync(path.join(root, 'js', 'site-runtime.js'), 'utf8');
assert.match(runtime, /padding:\s*['"]64px 58px 34px['"]|function renderCanvas\(|function downloadPdf\(/, 'Shared padded export rendering is missing');
for (const file of ['index.html', 'urdu-editor.html']) {
  const html = read(file);
  assert.match(html, /WriteUrduExport\.renderCanvas/, `${file} does not use the shared export renderer`);
  assert.doesNotMatch(html, /html2canvas\(element|textBaseline\s*=|fillText\(["']Generated/, `${file} still uses the clipping-prone legacy export path`);
}

const alphabet = read('urdu-alphabet.html');
const table = alphabet.match(/<table>[\s\S]*?<\/table>/i)[0];
const letters = [...table.matchAll(/<td>\s*([^<\s]+)\s*<\/td>/gi)].map(match => match[1]).filter(value => /[\u0600-\u06ff]/.test(value));
assert.strictEqual(new Set(letters).size, letters.length, 'Urdu alphabet table contains duplicate letter rows');

const sharedStyles = fs.readFileSync(path.join(root, 'css', 'site-header.css'), 'utf8');
assert.match(sharedStyles, /--wu-text:|\.content-article|\[lang=["']ur["']\]/, 'Shared editorial typography is missing');
assert.match(sharedStyles, /footer\{position:static!important|\.wu-footer-links|\.cse-branding-bottom/, 'Shared responsive content safeguards are missing');

const sharedHeader = fs.readFileSync(path.join(root, 'site-header.js'), 'utf8');
assert.match(sharedHeader, /classList\.add\(['"]content-page['"]\)|function renderFooter\(\)/, 'Shared content-page enhancement is missing');
const linkedPages = new Set([...sharedHeader.matchAll(/(?:href:\s*'|href=")([^'"]+\.html)/g)].map(match => match[1]));
for (const file of htmlFiles) {
  assert(linkedPages.has(file), `${file} is not connected to the shared header or footer`);
}
for (const file of allHtmlFiles.filter(file => !htmlFiles.includes(file))) {
  assert.match(read(file), /^google-site-verification:/, `${file} is an unlinked HTML file without a documented infrastructure purpose`);
}

console.log(`Static regression tests passed for ${htmlFiles.length} HTML files.`);
