const fs = require('fs');
const path = require('path');
const config = require('../seo.config.js');

const root = path.resolve(__dirname, '..');
const writeMode = process.argv.includes('--write');
const checkMode = process.argv.includes('--check') || !writeMode;

function htmlText(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function htmlAttr(value) {
  return htmlText(value).replace(/"/g, '&quot;');
}

function sourceFile(page) {
  if (page.path === '/') return 'index.html';
  const legacy = (page.legacyPaths || []).find(candidate => /\.html$/i.test(candidate));
  return legacy ? legacy.replace(/^\//, '') : page.path.replace(/^\//, '') + '.html';
}

function replaceRequired(source, pattern, replacement, label, file) {
  if (!pattern.test(source)) throw new Error(`${file}: missing ${label}`);
  pattern.lastIndex = 0;
  return source.replace(pattern, replacement);
}

function syncPage(page) {
  const file = sourceFile(page);
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) throw new Error(`${file}: source file not found for ${page.path}`);

  const title = page.searchTitle || page.title;
  const description = page.searchDescription || page.description;
  let source = fs.readFileSync(absolute, 'utf8');
  const original = source;

  source = replaceRequired(source, /<title>[\s\S]*?<\/title>/i, `<title>${htmlText(title)}</title>`, '<title>', file);
  source = replaceRequired(source, /<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?\s*>/i, `<meta name="description" content="${htmlAttr(description)}">`, 'meta description', file);
  source = replaceRequired(source, /<meta\s+property=["']og:title["']\s+content=["'][^"']*["']/i, `<meta property="og:title" content="${htmlAttr(title)}"`, 'og:title', file);
  source = replaceRequired(source, /<meta\s+property=["']og:description["']\s+content=["'][^"']*["']/i, `<meta property="og:description" content="${htmlAttr(description)}"`, 'og:description', file);
  source = replaceRequired(source, /<meta\s+name=["']twitter:title["']\s+content=["'][^"']*["']/i, `<meta name="twitter:title" content="${htmlAttr(title)}"`, 'twitter:title', file);
  source = replaceRequired(source, /<meta\s+name=["']twitter:description["']\s+content=["'][^"']*["']/i, `<meta name="twitter:description" content="${htmlAttr(description)}"`, 'twitter:description', file);

  if (source === original) return { file, changed: false };
  if (writeMode) fs.writeFileSync(absolute, source);
  return { file, changed: true };
}

const targets = config.pages.filter(page => page.searchTitle || page.searchDescription);
const results = targets.map(syncPage);
const changed = results.filter(result => result.changed);

if (checkMode && changed.length) {
  console.error('Static search metadata is out of sync with seo.config.js:');
  changed.forEach(result => console.error(`- ${result.file}`));
  console.error('Run npm run seo:sync-heads and commit the generated HTML changes.');
  process.exit(1);
}

if (writeMode) {
  changed.forEach(result => console.log(`Updated static search metadata: ${result.file}`));
  console.log(`Static search metadata synchronized for ${targets.length} acquisition route(s).`);
} else {
  console.log(`Static search metadata is synchronized for ${targets.length} acquisition route(s).`);
}
