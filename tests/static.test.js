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
assert.match(runtime, /function ensurePdfDependency\(|cdn\.jsdelivr\.net\/npm\/jspdf/, 'PDF export retry loader is missing');
assert.ok(fs.existsSync(path.join(root, 'manifest.webmanifest')), 'Installable app manifest is missing');
assert.ok(fs.existsSync(path.join(root, 'sw.js')), 'Offline service worker is missing');
const manifest = read('manifest.webmanifest');
assert.match(manifest, /"start_url"\s*:\s*"\.\/index\.html"/, 'PWA manifest start URL is missing');
assert.match(fs.readFileSync(path.join(root, 'sw.js'), 'utf8'), /CACHE_NAME|addEventListener\(['"]fetch['"]/, 'Offline shell service worker is incomplete');
for (const file of ['index.html', 'urdu-editor.html']) {
  const html = read(file);
  assert.match(html, /WriteUrduExport\.renderCanvas/, `${file} does not use the shared export renderer`);
  assert.doesNotMatch(html, /html2canvas\(element|textBaseline\s*=|fillText\(["']Generated/, `${file} still uses the clipping-prone legacy export path`);
}

const editorTools = fs.readFileSync(path.join(root, 'js', 'editor-tools.js'), 'utf8');
assert.match(editorTools, /write-urdu:draft:v1:|write-urdu:history:v1:|data-import-file|function countWords\(|navigator\.share|function normaliseSpacing\(/, 'Frontend writing tools are incomplete');
assert.match(editorTools, /home-actions, \.tool-actions, \.keyboard-actions|toolbar\.appendChild\(toolActions\)/, 'Productivity actions are not promoted to the top toolbar');
const editorToolStyles = fs.readFileSync(path.join(root, 'css', 'editor-tools.css'), 'utf8');
assert.match(editorToolStyles, /editor-find-panel.*order:100|Productivity controls live beside/, 'Top-toolbar productivity layout is missing');
for (const file of ['index.html', 'urdu-editor.html', 'urdu-keyboard.html']) {
  const html = read(file);
  assert.match(html, /js\/editor-tools\.js/, `${file} does not load the shared writing tools`);
  assert.match(html, /css\/editor-tools\.css/, `${file} does not load the shared writing-tool styles`);
  assert.match(html, /data-write-urdu-share/, `${file} does not expose native sharing`);
}

const alphabet = read('urdu-alphabet.html');
assert.match(alphabet, /<body[^>]*class=["']alphabet-page["']/i, 'Urdu alphabet page is missing its isolated layout class');
assert.match(alphabet, /<main[^>]*class=["']alphabet-main["']/i, 'Urdu alphabet page is missing its normal-flow main region');
assert.match(alphabet, /<caption>Common standalone Urdu characters/i, 'Urdu alphabet table is missing its accessible caption');
assert.match(alphabet, /<th[^>]*scope=["']col["']/i, 'Urdu alphabet table headers must declare their scope');
assert.match(alphabet, /<td>\s*ghain\s*<\/td>/i, 'Urdu alphabet table contains the corrected ghain name');
const table = alphabet.match(/<table\b[^>]*>[\s\S]*?<\/table>/i)[0];
const letters = [...table.matchAll(/<td>\s*([^<\s]+)\s*<\/td>/gi)].map(match => match[1]).filter(value => /[\u0600-\u06ff]/.test(value));
assert.strictEqual(new Set(letters).size, letters.length, 'Urdu alphabet table contains duplicate letter rows');

const documentation = read('write-urdu-documentation.html');
assert.match(documentation, /class=["']documentation-main["']/i, 'Documentation page is missing its main content region');
assert.match(documentation, /class=["']docs-hero["']/i, 'Documentation page is missing its hero section');
assert.match(documentation, /class=["']docs-faq["']/i, 'Documentation page is missing its accessible FAQ');
assert.match(documentation, /href=["'](?:index\.html|urdu-editor\.html)["']/i, 'Documentation page is missing editor entry points');

const sharedStyles = fs.readFileSync(path.join(root, 'css', 'site-header.css'), 'utf8');
assert.match(sharedStyles, /--wu-text:|\.content-article|\[lang=["']ur["']\]/, 'Shared editorial typography is missing');
assert.match(sharedStyles, /footer\{position:static!important|\.wu-footer-links|\.cse-branding-bottom/, 'Shared responsive content safeguards are missing');

const sharedHeader = fs.readFileSync(path.join(root, 'site-header.js'), 'utf8');
assert.match(sharedHeader, /classList\.add\(['"]content-page['"]\)|function renderFooter\(\)/, 'Shared content-page enhancement is missing');
assert.match(sharedHeader, /data-ad-slot["']?[:=]["']8323789671|data-ad-slot=\\?"8323789671/, 'Shared header ad slot is missing');
assert.match(sharedHeader, /setupProgressiveWebApp|serviceWorker\.register/, 'Shared PWA registration is missing');
assert.match(sharedHeader, /function renderHeaderAd\(|function loadAds\(/, 'Shared header ad placement is missing');
assert.match(sharedHeader, /function normalizePageTitle\(/, 'Shared page-title normalization is missing');
assert.match(sharedHeader, /write-urdu:locale:v1/, 'Shared locale preference storage is missing');
assert.match(sharedHeader, /data-wu-language-toggle/, 'Shared language toggle is missing');
assert.match(sharedHeader, /locale-urdu|document\.documentElement\.dir/, 'Shared Urdu direction handling is missing');
assert.match(sharedHeader, /js\/content-locale\.js|function loadContentLocale\(/, 'Long-form content localization loader is missing');
assert.match(sharedStyles, /h1\.wu-page-title|wu-page-subtitle/, 'Shared page-title typography is missing');
assert.match(sharedStyles, /\.wu-language-toggle|html\[dir=["']rtl["']\]/, 'Shared language-toggle styles are missing');
const contentLocale = fs.readFileSync(path.join(root, 'js', 'content-locale.js'), 'utf8');
assert.match(contentLocale, /localizeDocumentation|docs-faq|localizeEditorHelp/, 'Long-form Urdu content translations are missing');
const adsScript = fs.readFileSync(path.join(root, 'js', 'ads.js'), 'utf8');
assert.match(adsScript, /adsbygoogle\.js\?client=ca-pub-4727847909946286/, 'AdSense loader must use the configured publisher client');
assert.match(adsScript, /crossOrigin\s*=\s*["']anonymous["']/, 'AdSense loader must use anonymous CORS');
const linkedPages = new Set([...sharedHeader.matchAll(/(?:href:\s*'|href=")([^'"]+\.html)/g)].map(match => match[1]));
for (const file of htmlFiles) {
  assert(linkedPages.has(file), `${file} is not connected to the shared header or footer`);
}
for (const file of allHtmlFiles.filter(file => !htmlFiles.includes(file))) {
  assert.match(read(file), /^google-site-verification:/, `${file} is an unlinked HTML file without a documented infrastructure purpose`);
}

console.log(`Static regression tests passed for ${htmlFiles.length} HTML files.`);
