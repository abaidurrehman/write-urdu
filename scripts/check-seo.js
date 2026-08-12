const fs = require('fs');
const path = require('path');
const config = require('../seo.config.js');

const root = path.resolve(__dirname, '..');
const html = file => fs.readFileSync(path.join(root, file), 'utf8');
const files = fs.readdirSync(root).filter(file => file.endsWith('.html') && !file.startsWith('google'));
const errors = [];
const decodeHtml = value => String(value || '')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>');
const meta = (source, name, property) => {
  const re = property
    ? new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)`, 'i')
    : new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)`, 'i');
  const match = source.match(re);
  return match ? match[1] : '';
};
const canonical = source => (source.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)/i) || [])[1] || '';
const registryByFile = {};
config.pages.forEach(page => {
  registryByFile[(page.path === '/' ? 'index' : page.path.slice(1)) + '.html'] = page;
});

if (config.SITE_ORIGIN !== 'https://www.write-urdu.com') {
  errors.push(`seo.config.js: SITE_ORIGIN must remain https://www.write-urdu.com, found ${config.SITE_ORIGIN}`);
}

const titles = new Map();
const descriptions = new Map();
files.forEach(file => {
  const page = registryByFile[file];
  if (!page) {
    errors.push(`${file}: missing registry entry`);
    return;
  }

  const source = html(file);
  const title = decodeHtml((source.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '').trim();
  const description = decodeHtml(meta(source, 'description'));
  const robots = meta(source, 'robots');
  const canon = canonical(source);
  const expectedCanonical = config.canonical(page.path);
  const expectedTitle = page.searchTitle || page.title;
  const expectedDescription = page.searchDescription || page.description;
  const ogUrl = meta(source, '', 'og:url');

  if (title !== expectedTitle) errors.push(`${file}: title does not match resolved registry metadata`);
  if (description !== expectedDescription) errors.push(`${file}: description does not match resolved registry metadata`);
  if (!description) errors.push(`${file}: missing description`);
  if (titles.has(title)) errors.push(`${file}: duplicate title with ${titles.get(title)}`);
  else titles.set(title, file);
  if (descriptions.has(description)) errors.push(`${file}: duplicate description with ${descriptions.get(description)}`);
  else descriptions.set(description, file);

  const h1 = (source.match(/<h1(?:\s|>)/gi) || []).length;
  if (h1 !== 1) errors.push(`${file}: expected one H1, found ${h1}`);
  if (canon !== expectedCanonical) errors.push(`${file}: canonical must be ${expectedCanonical}`);
  if ((source.match(/<link[^>]+rel=["']canonical["']/gi) || []).length !== 1) errors.push(`${file}: expected exactly one canonical link`);
  if (/\.html(?:[?#]|$)/i.test(canon) || /[?#]/.test(canon)) errors.push(`${file}: canonical must be extensionless and query-free`);
  try {
    if (new URL(canon).origin !== config.SITE_ORIGIN) errors.push(`${file}: canonical must use ${config.SITE_ORIGIN}`);
  } catch (_) {
    errors.push(`${file}: canonical is not a valid absolute URL`);
  }

  if (page.indexable && /noindex/i.test(robots)) errors.push(`${file}: indexable page is noindex`);
  if (!page.indexable && !/noindex\s*,?\s*follow/i.test(robots)) errors.push(`${file}: utility page must be noindex,follow`);
  if (!page.indexable && !/noindex\s*,?\s*follow/i.test(meta(source, 'googlebot'))) errors.push(`${file}: utility page must include googlebot noindex,follow`);

  if (!meta(source, '', 'og:title') || !meta(source, '', 'og:description') || !ogUrl) errors.push(`${file}: missing Open Graph metadata`);
  if (ogUrl && ogUrl !== expectedCanonical) errors.push(`${file}: og:url must match the canonical URL`);

  const ogImage = meta(source, '', 'og:image');
  if (!/^https:\/\//i.test(ogImage)) errors.push(`${file}: Open Graph image must be absolute`);
  else {
    try {
      const imageUrl = new URL(ogImage);
      if (imageUrl.hostname === 'write-urdu.com') errors.push(`${file}: Open Graph image must not use the alternate apex host`);
      if (imageUrl.origin === config.SITE_ORIGIN && !fs.existsSync(path.join(root, imageUrl.pathname.replace(/^\//, '')))) {
        errors.push(`${file}: Open Graph image asset is missing`);
      }
    } catch (_) {
      errors.push(`${file}: Open Graph image URL is invalid`);
    }
  }

  const declaredLang = (source.match(/<html[^>]+lang=["']([^"']+)/i) || [])[1] || '';
  if (!/^en$/i.test(declaredLang)) errors.push(`${file}: document language must be declared as en`);

  const ids = [...source.matchAll(/\bid=["']([^"']+)["']/gi)].map(match => match[1]);
  if (new Set(ids).size !== ids.length) errors.push(`${file}: duplicate id attribute`);

  const imageTags = [...source.matchAll(/<img\b[^>]*>/gi)].map(match => match[0]).filter(tag => !/id=["']Image["']/i.test(tag));
  imageTags.forEach(tag => {
    if (!/\balt=["']/i.test(tag)) errors.push(`${file}: image is missing alt text`);
    if (!/\bwidth=["'][^"']+["']/i.test(tag) || !/\bheight=["'][^"']+["']/i.test(tag)) errors.push(`${file}: image is missing width/height`);
    if (/typeing/i.test(tag)) errors.push(`${file}: image alt contains the typeing misspelling`);
  });

  const schemaBlocks = [...source.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  schemaBlocks.forEach(match => {
    try {
      const value = JSON.parse(match[1]);
      if (value['@context'] !== 'https://schema.org') errors.push(`${file}: JSON-LD context is not Schema.org`);
    } catch (_) {
      errors.push(`${file}: invalid JSON-LD`);
    }
  });
});

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gi)].map(match => match[1].trim());
if (new Set(sitemapLocs).size !== sitemapLocs.length) errors.push('sitemap: duplicate <loc> URLs');
sitemapLocs.forEach(url => {
  try {
    if (new URL(url).origin !== config.SITE_ORIGIN) errors.push(`sitemap: non-canonical host ${url}`);
    if (/\.html(?:[?#]|$)/i.test(url) || /[?#]/.test(url)) errors.push(`sitemap: URL must be extensionless and query-free ${url}`);
  } catch (_) {
    errors.push(`sitemap: invalid URL ${url}`);
  }
});
config.pages.filter(page => page.indexable).forEach(page => {
  if (!sitemap.includes(`<loc>${config.canonical(page.path)}</loc>`)) errors.push(`sitemap: missing ${page.path}`);
});
config.pages.filter(page => !page.indexable).forEach(page => {
  if (sitemap.includes(`<loc>${config.canonical(page.path)}</loc>`)) errors.push(`sitemap: utility page included ${page.path}`);
});

const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
['OAI-SearchBot', 'PerplexityBot', 'GPTBot', 'Google-Extended', 'Bingbot', 'ClaudeBot', 'Claude-SearchBot'].forEach(bot => {
  if (!robots.includes(`User-agent: ${bot}`)) errors.push(`robots.txt: missing explicit ${bot} policy`);
});
const robotSections = robots.split(/(?=User-agent:)/i);
const wildcardPolicy = robotSections.find(section => /^User-agent:\s*\*\s*$/im.test(section)) || '';
if (/Disallow:\s*\//i.test(wildcardPolicy)) errors.push('robots.txt: wildcard crawler policy must not disallow the whole site');
const gptPolicy = robotSections.find(section => /^User-agent:\s*GPTBot\s*$/im.test(section)) || '';
if (!/(?:Allow:|Disallow:)\s*\//i.test(gptPolicy)) errors.push('robots.txt: GPTBot policy is not explicit');
if (/Disallow:\s*\/(?:assets|js|css|fonts)\/?/i.test(robots)) errors.push('robots.txt: CSS, JavaScript or fonts are blocked');
const sitemapDirective = (robots.match(/^Sitemap:\s*(\S+)/im) || [])[1] || '';
if (sitemapDirective !== `${config.SITE_ORIGIN}/sitemap.xml`) errors.push('robots.txt: Sitemap directive must use the canonical www host');

if (!fs.existsSync(path.join(root, 'llms.txt'))) errors.push('llms.txt: missing AI-readable site summary');
if (!fs.existsSync(path.join(root, 'docs', 'SEO-POST-DEPLOYMENT.md'))) errors.push('docs: post-deployment SEO procedure is missing');
if (!fs.existsSync(path.join(root, 'docs', 'CLOUDFLARE-CANONICAL-HOST.md'))) errors.push('docs: Cloudflare canonical-host runbook is missing');

const redirectsPath = path.join(root, '_redirects');
if (!fs.existsSync(redirectsPath)) {
  errors.push('_redirects: missing Cloudflare Pages path redirect file');
} else {
  const redirectLines = fs.readFileSync(redirectsPath, 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
  const redirectMap = new Map();

  redirectLines.forEach(line => {
    const [source, target, status, ...extra] = line.split(/\s+/);
    if (!source || !target || !status || extra.length) {
      errors.push(`_redirects: malformed rule ${line}`);
      return;
    }
    if (/^https?:\/\//i.test(source) || /www\.write-urdu\.com/i.test(source)) {
      errors.push(`_redirects: host-level redirect sources are unsupported by Cloudflare Pages (${source})`);
    }
    if (!source.startsWith('/')) errors.push(`_redirects: source must be path-only (${source})`);
    if (redirectMap.has(source)) errors.push(`_redirects: duplicate source ${source}`);
    redirectMap.set(source, { target, status });
  });

  config.pages.forEach(page => {
    (page.legacyPaths || []).forEach(legacyPath => {
      const rule = redirectMap.get(legacyPath);
      if (!rule) errors.push(`_redirects: missing legacy redirect ${legacyPath}`);
      else {
        if (rule.target !== page.path) errors.push(`_redirects: ${legacyPath} must target ${page.path}`);
        if (rule.status !== '301' && rule.status !== '308') errors.push(`_redirects: ${legacyPath} must be permanent`);
      }
    });
    if (page.path !== '/') {
      const slashPath = `${page.path}/`;
      const rule = redirectMap.get(slashPath);
      if (!rule || rule.target !== page.path || (rule.status !== '301' && rule.status !== '308')) {
        errors.push(`_redirects: missing permanent trailing-slash normalization ${slashPath} -> ${page.path}`);
      }
    }
  });
}

const headersPath = path.join(root, '_headers');
if (!fs.existsSync(headersPath)) {
  errors.push('_headers: missing Pages alias noindex defense');
} else {
  const headers = fs.readFileSync(headersPath, 'utf8');
  if (!/https:\/\/:project\.pages\.dev\/\*/.test(headers) || !/X-Robots-Tag:\s*noindex/i.test(headers)) {
    errors.push('_headers: production pages.dev alias must carry X-Robots-Tag: noindex');
  }
  if (!/https:\/\/:version\.:project\.pages\.dev\/\*/.test(headers)) {
    errors.push('_headers: preview pages.dev aliases must retain noindex coverage');
  }
}

if (errors.length) {
  console.error(errors.map(error => `SEO: ${error}`).join('\n'));
  process.exit(1);
}
console.log(`SEO checks passed for ${files.length} HTML pages and ${config.pages.filter(page => page.indexable).length} sitemap URLs.`);
