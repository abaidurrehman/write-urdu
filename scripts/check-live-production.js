const config = require('../seo.config.js');

const origin = config.SITE_ORIGIN.replace(/\/$/, '');
const timeoutMs = Number(process.env.PRODUCTION_SEO_TIMEOUT_MS || 12000);
const failures = [];
const successes = [];

const priorityPaths = [
  '/',
  '/urdu-card-studio',
  '/how-to-write-urdu-on-photo',
  '/urdu-editor',
  '/urdu-keyboard',
  '/write-urdu-documentation',
  '/urdu-faq',
  '/roman-urdu-transliteration',
  '/urdu-alphabet',
  '/urdu-fonts-nastaliq-vs-naskh',
  '/english-urdu-typing-tutorial',
  '/why-write-urdu'
];

function signal() {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') return AbortSignal.timeout(timeoutMs);
  return undefined;
}

async function fetchText(url) {
  try {
    const response = await fetch(url, {
      redirect: 'manual',
      signal: signal(),
      headers: { 'user-agent': 'WriteUrduProductionSeoAudit/1.0' }
    });
    const text = await response.text();
    return { response, text };
  } catch (error) {
    failures.push(`${url}: request failed (${error.message})`);
    return null;
  }
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .trim();
}

function titleFrom(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? decodeHtml(match[1].replace(/\s+/g, ' ')) : '';
}

function metaFrom(html, attribute, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`<meta\\s+${attribute}=["']${escaped}["']\\s+content=["']([^"']*)["']`, 'i');
  const match = html.match(regex);
  return match ? decodeHtml(match[1]) : '';
}

function canonicalFrom(html) {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  return match ? match[1].trim() : '';
}

async function checkPage(pathname) {
  const page = config.byPath[pathname];
  if (!page) {
    failures.push(`${pathname}: missing from seo.config.js`);
    return;
  }
  const url = config.canonical(page.path);
  const result = await fetchText(url);
  if (!result) return;
  const { response, text } = result;
  if (response.status < 200 || response.status >= 300) {
    failures.push(`${url}: expected 2xx, received ${response.status}`);
    return;
  }
  if (!/text\/html/i.test(response.headers.get('content-type') || '')) {
    failures.push(`${url}: expected text/html, received ${response.headers.get('content-type') || 'unknown content type'}`);
    return;
  }

  const expectedTitle = page.searchTitle || page.title;
  const expectedDescription = page.searchDescription || page.description;
  const actualTitle = titleFrom(text);
  const actualDescription = metaFrom(text, 'name', 'description');
  const actualCanonical = canonicalFrom(text);

  if (actualTitle !== expectedTitle) failures.push(`${url}: initial HTML title is "${actualTitle}", expected "${expectedTitle}"`);
  if (actualDescription !== expectedDescription) failures.push(`${url}: initial HTML description is out of sync with seo.config.js`);
  if (actualCanonical !== url) failures.push(`${url}: canonical is "${actualCanonical || 'missing'}", expected "${url}"`);

  const ogTitle = metaFrom(text, 'property', 'og:title');
  const twitterTitle = metaFrom(text, 'name', 'twitter:title');
  if (ogTitle !== expectedTitle) failures.push(`${url}: initial og:title is out of sync`);
  if (twitterTitle !== expectedTitle) failures.push(`${url}: initial twitter:title is out of sync`);

  if (pathname === '/' && !/Type Roman Urdu and convert it to Urdu script/i.test(text)) {
    failures.push(`${url}: homepage H1 ownership signal is missing`);
  }
  if (pathname === '/urdu-keyboard' && /Best online English to Urdu typing tool/i.test(text)) {
    failures.push(`${url}: legacy English-to-Urdu ownership copy still appears on the Keyboard page`);
  }

  successes.push(`page ${response.status}: ${url}`);
}

async function checkResource(pathname, contentTypePattern, assertions) {
  const url = origin + pathname;
  const result = await fetchText(url);
  if (!result) return;
  const { response, text } = result;
  if (response.status < 200 || response.status >= 300) {
    failures.push(`${url}: expected 2xx, received ${response.status}`);
    return;
  }
  const contentType = response.headers.get('content-type') || '';
  if (contentTypePattern && !contentTypePattern.test(contentType)) failures.push(`${url}: unexpected content type ${contentType || 'missing'}`);
  assertions.forEach(({ pattern, message }) => {
    if (!pattern.test(text)) failures.push(`${url}: ${message}`);
  });
  successes.push(`resource ${response.status}: ${url}`);
}

async function main() {
  for (const pathname of priorityPaths) await checkPage(pathname);

  await checkResource('/robots.txt', /text\/plain/i, [
    { pattern: /User-agent:\s*OAI-SearchBot[\s\S]*?Allow:\s*\//i, message: 'OAI-SearchBot allow rule missing' },
    { pattern: /User-agent:\s*GPTBot[\s\S]*?Disallow:\s*\//i, message: 'GPTBot training opt-out missing' },
    { pattern: new RegExp(`Sitemap:\\s*${origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\/sitemap\\.xml`, 'i'), message: 'canonical sitemap declaration missing' }
  ]);

  const sitemapAssertions = priorityPaths.map(pathname => {
    const canonical = config.canonical(config.byPath[pathname].path);
    return { pattern: new RegExp(`<loc>${canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/loc>`), message: `missing canonical URL ${canonical}` };
  });
  await checkResource('/sitemap.xml', /(?:application|text)\/xml/i, sitemapAssertions);

  await checkResource('/llms.txt', /text\/plain/i, [
    { pattern: /English to Urdu typing/i, message: 'homepage English-to-Urdu ownership statement missing' },
    { pattern: /Urdu Card Studio[\s\S]*text or poetry on a photo/i, message: 'Card Studio acquisition role missing' },
    { pattern: /How to write Urdu on a photo/i, message: 'Urdu-on-photo guide missing' }
  ]);

  await checkResource('/.well-known/security.txt', /text\/plain/i, [
    { pattern: /^Contact:\s*mailto:admin@write-urdu\.com$/mi, message: 'public security contact missing' },
    { pattern: /^Canonical:\s*https:\/\/www\.write-urdu\.com\/\.well-known\/security\.txt$/mi, message: 'security canonical missing' }
  ]);

  await checkResource('/ads.txt', /text\/plain/i, [
    { pattern: /^google\.com,\s*pub-4727847909946286,\s*DIRECT,\s*f08c47fec0942fa0$/mi, message: 'Google publisher declaration missing' }
  ]);

  successes.forEach(message => console.log(`PRODUCTION SEO OK: ${message}`));
  if (failures.length) {
    console.error(failures.map(message => `PRODUCTION SEO FAIL: ${message}`).join('\n'));
    process.exit(1);
  }
  console.log(`Production SEO verification passed for ${priorityPaths.length} priority pages and five public control files.`);
}

main().catch(error => {
  console.error(`PRODUCTION SEO FAIL: unexpected audit error: ${error.stack || error.message}`);
  process.exit(1);
});
