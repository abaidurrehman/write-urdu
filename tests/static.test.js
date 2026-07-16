const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const allHtmlFiles = fs.readdirSync(root).filter(file => file.endsWith('.html'));
const htmlFiles = allHtmlFiles.filter(file => !file.startsWith('google'));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const seoConfig = require(path.join(root, 'seo.config.js'));
assert.strictEqual(seoConfig.SITE_ORIGIN, 'https://write-urdu.com', 'SEO canonical origin changed unexpectedly');
assert.ok(seoConfig.pages.some(page => page.path === '/urdu-card-studio' && page.indexable), 'Card Studio is missing from the SEO registry');
assert.ok(seoConfig.pages.some(page => page.path === '/qr-code-generator' && page.indexable), 'QR Generator is missing from the SEO registry');
assert.ok(seoConfig.pages.some(page => page.path === '/write-urdu-search' && !page.indexable), 'Search utility must remain noindex');
assert.ok(fs.existsSync(path.join(root, 'llms.txt')), 'AI-readable site summary is missing');
assert.ok(fs.existsSync(path.join(root, 'docs', 'SEO-POST-DEPLOYMENT.md')), 'SEO post-deployment checklist is missing');
assert.ok(fs.existsSync(path.join(root, 'scripts', 'submit-indexnow.js')), 'IndexNow deployment helper is missing');
assert.ok(fs.existsSync(path.join(root, 'scripts', 'run-lighthouse.js')), 'Repeatable Lighthouse workflow is missing');

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
assert.match(read('index.html'), /data-create-qr/, 'Basic editor is missing the QR generator entry action');
assert.match(read('urdu-editor.html'), /data-create-qr/, 'Rich editor is missing the QR generator entry action');

const home = read('index.html');
assert.match(home, /makeTransliteratable\(\[['"]transliterateTextarea['"]\]\)/, 'Basic transliteration target changed');
assert.doesNotMatch(home, /clearDynamicLink|textBaseline\s*=\s*["']center|\.backgroundcolor|encodeURI\(/, 'Homepage contains a repaired legacy export defect');

const editor = read('urdu-editor.html');
assert.match(editor, /makeTransliteratable\(\[['"]basic-example_ifr['"]\]\)/, 'Rich editor transliteration target changed');
const activeEditorCode = editor.replace(/^\s*\/\/.*$/gm, '');
assert.doesNotMatch(activeEditorCode, /fonts\/Qadreeregular\.css|\.backgroundcolor|encodeURI\(/, 'Rich editor contains a repaired legacy defect');

const keyboard = read('urdu-keyboard.html');
assert.match(keyboard, /<script src=["']main\.js["']><\/script>/, 'Urdu keyboard does not load main.js');
assert.match(keyboard, /Direct Urdu typing versus Roman Urdu transliteration/, 'Urdu keyboard comparison content is missing');
assert.match(keyboard, /How to use the keyboard on mobile/, 'Urdu keyboard mobile guidance is missing');
assert.match(keyboard, /keyboard-faq/, 'Urdu keyboard FAQ is missing');

const mainScript = fs.readFileSync(path.join(root, 'main.js'), 'utf8');
assert.match(mainScript, /new Blob\(\[['"]\\ufeff['"],\s*textToSave\].*charset=utf-8/, 'Text export must preserve Urdu with UTF-8 and a BOM');

const runtime = fs.readFileSync(path.join(root, 'js', 'site-runtime.js'), 'utf8');
assert.match(runtime, /padding:\s*['"]64px 58px 34px['"]|function renderCanvas\(|function downloadPdf\(/, 'Shared padded export rendering is missing');
assert.match(runtime, /function ensurePdfDependency\(|cdn\.jsdelivr\.net\/npm\/jspdf/, 'PDF export retry loader is missing');
assert.ok(fs.existsSync(path.join(root, 'manifest.webmanifest')), 'Installable app manifest is missing');
assert.ok(fs.existsSync(path.join(root, 'sw.js')), 'Offline service worker is missing');
const manifest = read('manifest.webmanifest');
assert.match(manifest, /"start_url"\s*:\s*"\.\/"/, 'PWA manifest start URL is missing');
assert.match(fs.readFileSync(path.join(root, 'sw.js'), 'utf8'), /CACHE_NAME|addEventListener\(['"]fetch['"]/, 'Offline shell service worker is incomplete');
const cardStudio = read('urdu-card-studio.html');
assert.match(cardStudio, /data-card-studio/, 'Card Studio page is missing its application root');
assert.match(cardStudio, /id="cardCanvas"/, 'Card Studio canvas is missing');
assert.match(cardStudio, /data-card-action="download"/, 'Card Studio download action is missing');
assert.match(cardStudio, /google_jsapi\.js/, 'Card Studio must load the existing transliteration dependency');
assert.match(fs.readFileSync(path.join(root, 'js', 'card-studio.js'), 'utf8'), /makeTransliteratable\(\['cardText'\]\)|makeTransliteratable\(\["cardText"\]\)/, 'Card Studio text field is not connected to transliteration');
assert.match(fs.readFileSync(path.join(root, 'js', 'card-studio-core.js'), 'utf8'), /wrapRtlText|findBestFontSize|calculateImagePlacement/, 'Card Studio rendering utilities are missing');
assert.match(cardStudio, /data-card-interaction-layer|data-card-canvas-editor/, 'Card Studio direct editing layer is missing');
assert.match(fs.readFileSync(path.join(root, 'js', 'card-studio.js'), 'utf8'), /WriteUrduCardStudioApp|editingObjectId/, 'Card Studio application bridge is missing');
const cardCore = require(path.join(root, 'js', 'card-studio-core.js'));
assert.strictEqual(cardCore.PRESETS.length, 4, 'Card Studio must provide four output presets');
assert.ok(cardCore.TEMPLATES.length >= 9, 'Card Studio must provide at least nine templates');
assert.deepStrictEqual(cardCore.calculateImagePlacement({ width: 1600, height: 800 }, { width: 1080, height: 1080 }, 'cover', .5, .5).width >= 1080, true, 'Card Studio cover placement is invalid');
assert.strictEqual(cardCore.safeFilename('a/b:c', 'fallback'), 'a-b-c', 'Card Studio filename sanitisation is incomplete');
const cardInteraction = require(path.join(root, 'js', 'card-studio-interaction-core.js'));
const transform = cardInteraction.getPreviewTransform({ width: 1080, height: 1080 }, { left: 20, top: 30, width: 540, height: 540 });
assert.deepStrictEqual(cardInteraction.clientPointToCardPoint({ x: 290, y: 300 }, transform), { x: 540, y: 540 }, 'Card Studio pointer conversion is incorrect');
assert.deepStrictEqual(cardInteraction.resizeRect({ x: 100, y: 80, width: 300, height: 200 }, 'left', { x: 250, y: 0 }, { minWidth: 120, maxWidth: 500 }), { x: 280, y: 80, width: 120, height: 200 }, 'Card Studio resize utility changed unexpectedly');
assert.strictEqual(cardCore.createDefaultCardProject('').version, 2, 'Card Studio project schema was not upgraded for direct editing');
assert.ok(cardCore.normalizeCardProject({ version: 1, text: { value: 'old' } }).text.transform, 'Card Studio cannot migrate old project transforms');
const qrHtml = read('qr-code-generator.html');
assert.match(qrHtml, /data-qr-generator/, 'QR generator page is missing its application root');
assert.match(qrHtml, /id="qrCanvas"/, 'QR generator canvas is missing');
assert.match(qrHtml, /js\/vendor\/qrcode\.js/, 'QR encoder must be bundled locally');
assert.doesNotMatch(qrHtml, /qr-code-generator-api|api\.qr|quickchart\.io|cdn.*qrcode/i, 'QR generator must not use a remote QR API or CDN');
assert.match(qrHtml, /id="qr-about"|Create static QR codes in your browser/, 'QR Generator is missing its crawlable supporting explanation');
assert.match(cardStudio, /id="card-studio-about"|Create Urdu cards and quote images online/, 'Card Studio is missing its crawlable supporting explanation');
assert.match(home, /Choose the right Urdu tool|data-create-qr/, 'Homepage is missing crawlable tool discovery content');
assert.match(read('write-urdu-privacy.html'), /Privacy summary|data processing summary|transliteration suggestions use the Google/i, 'Privacy page is missing feature-specific processing details');
assert.match(read('urdu-faq.html'), /Tools, privacy and exports|Is Write Urdu free and do I need an account/i, 'FAQ is missing product questions');
const qrCore = require(path.join(root, 'js', 'qr-generator-core.js'));
assert.strictEqual(qrCore.buildUrlPayload({ url: 'write-urdu.com' }).payload, 'https://write-urdu.com/', 'URL payload normalization failed');
assert.match(qrCore.buildTextPayload({ text: 'ہمیں اردو سے محبت ہے۔' }).payload, /اردو/, 'Urdu text payload failed');
assert.match(qrCore.buildWhatsAppPayload({ phone: '+45 12 34 56 78', message: 'سلام' }).payload, /wa\.me\/4512345678\?text=/, 'WhatsApp payload normalization failed');
assert.match(qrCore.buildWifiPayload({ ssid: 'a;b', security: 'WPA', password: 'p:q' }).payload, /a\\;b.*p\\:q/, 'Wi-Fi payload escaping failed');
assert.match(qrCore.buildVCardPayload({ fullName: 'A;B' }).payload, /N:;A\\;B/, 'vCard escaping failed');
assert.strictEqual(qrCore.buildLocationPayload({ latitude: 91, longitude: 0 }).valid, false, 'Location bounds are not enforced');
assert.strictEqual(qrCore.normalizeQrProject({ design: { foregroundColor: '#fff', margin: 9 }, logo: { sizeRatio: 1 } }).design.margin, 4, 'QR state normalization failed');
assert.strictEqual(qrCore.calculateLogoPlacement(1000, { width: 2000, height: 1000 }, { sizeRatio: .18 }).imageWidth <= 180, true, 'QR logo contain placement failed');
assert.strictEqual(qrCore.safeFilename('a/b:c', 'fallback'), 'a b c', 'QR filename sanitisation is incomplete');
assert.ok(fs.existsSync(path.join(root, '.htaccess')), 'Clean-route Apache configuration is missing');
assert.match(fs.readFileSync(path.join(root, '.htaccess'), 'utf8'), /REQUEST_FILENAME\.html|RewriteRule/, 'Clean-route rewrite is incomplete');
assert.ok(fs.existsSync(path.join(root, '_redirects')), 'Cloudflare Pages redirect configuration is missing');
const cloudflareRedirects = fs.readFileSync(path.join(root, '_redirects'), 'utf8');
assert.match(cloudflareRedirects, /\/urdu-editor\.html\s+\/urdu-editor\s+301/, 'Cloudflare legacy editor redirect is missing');
assert.match(cloudflareRedirects, /\/qr-code-generator\.html\s+\/qr-code-generator\s+301/, 'Cloudflare QR legacy redirect is missing');
for (const file of ['index.html', 'urdu-editor.html']) {
  const html = read(file);
  assert.match(html, /WriteUrduExport\.renderCanvas/, `${file} does not use the shared export renderer`);
  assert.doesNotMatch(html, /html2canvas\(element|textBaseline\s*=|fillText\(["']Generated/, `${file} still uses the clipping-prone legacy export path`);
}

const editorTools = fs.readFileSync(path.join(root, 'js', 'editor-tools.js'), 'utf8');
assert.match(editorTools, /write-urdu:draft:v1:|write-urdu:history:v1:|data-import-file|function countWords\(|navigator\.share|function normaliseSpacing\(/, 'Frontend writing tools are incomplete');
assert.match(editorTools, /function draftSignature\(|lastSavedSignature|Compact duplicate entries/, 'Draft history must deduplicate unchanged editor lifecycle events');
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
assert.match(documentation, /href=["'](?:\/|\/urdu-editor)["']/i, 'Documentation page is missing editor entry points');

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
assert.match(sharedHeader, /wu-header-trustbar|header\.noAccount/, 'Shared header privacy reassurance is missing');
assert.match(sharedHeader, /header\.free|Free to use/, 'Shared free-to-use messaging is missing');
assert.match(sharedHeader, /roman-urdu-transliteration|footer\.transliteration/, 'Transliteration guide is not linked from shared navigation/footer');
assert.match(sharedHeader, /urdu-fonts-nastaliq-vs-naskh|footer\.fonts/, 'Font comparison guide is not linked from shared navigation/footer');
assert.match(sharedHeader, /wu-footer-main|footer\.privacyNote/, 'Shared footer structure is missing');
assert.match(sharedStyles, /h1\.wu-page-title|wu-page-subtitle/, 'Shared page-title typography is missing');
assert.match(sharedStyles, /\.wu-language-toggle|html\[dir=["']rtl["']\]/, 'Shared language-toggle styles are missing');
const contentLocale = fs.readFileSync(path.join(root, 'js', 'content-locale.js'), 'utf8');
assert.match(contentLocale, /localizeDocumentation|docs-faq|localizeEditorHelp/, 'Long-form Urdu content translations are missing');
const adsScript = fs.readFileSync(path.join(root, 'js', 'ads.js'), 'utf8');
assert.match(adsScript, /adsbygoogle\.js\?client=ca-pub-4727847909946286/, 'AdSense loader must use the configured publisher client');
assert.match(adsScript, /crossOrigin\s*=\s*["']anonymous["']/, 'AdSense loader must use anonymous CORS');
assert.match(read('write-urdu-search.html'), /googlebot["']\s+content=["']noindex,follow/i, 'Search utility must explicitly noindex Googlebot');
assert.match(read('write-urdu-feedback.html'), /googlebot["']\s+content=["']noindex,follow/i, 'Feedback utility must explicitly noindex Googlebot');
assert.match(read('why-write-urdu.html'), /Who maintains Write Urdu|Editorial and correction policy/, 'About page is missing publisher and correction policy content');
assert.match(read('roman-urdu-transliteration.html'), /transliteration, not translation/i, 'Transliteration guide is missing');
assert.match(read('urdu-fonts-nastaliq-vs-naskh.html'), /Nastaliq versus Naskh/i, 'Font comparison guide is missing');
for (const file of htmlFiles) {
  const slug = file === 'index.html' ? '/' : '/' + file.replace(/\.html$/i, '');
  const route = new RegExp(`href(?::|=)\\s*["']${slug === '/' ? '\\/' : slug}["']`);
  assert(route.test(sharedHeader), `${file} is not connected to the shared header or footer`);
}
for (const file of allHtmlFiles.filter(file => !htmlFiles.includes(file))) {
  assert.match(read(file), /^google-site-verification:/, `${file} is an unlinked HTML file without a documented infrastructure purpose`);
}

console.log(`Static regression tests passed for ${htmlFiles.length} HTML files.`);
