const fs = require('node:fs');
const path = require('node:path');
const config = require('../seo.config.js');
const localeConfig = require('../locale.config.js');
const LocaleRoute = require('../js/locale-route.js');

const root = path.resolve(__dirname, '..');
const errors = [];
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const canonicalOrigin = new URL(config.SITE_ORIGIN).origin;
const canonicalHost = new URL(config.SITE_ORIGIN).hostname;
const alternateHost = canonicalHost.startsWith('www.') ? canonicalHost.slice(4) : `www.${canonicalHost}`;

function parseCsv(source) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];
    if (char === '"' && quoted && next === '"') { field += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(field.trim()); field = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field.trim()); field = '';
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else field += char;
  }
  if (field || row.length) { row.push(field.trim()); if (row.some(Boolean)) rows.push(row); }
  const [headers, ...records] = rows;
  return records.map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
}

function normalizeRoute(value) {
  if (!value) return '';
  let pathname = value;
  try { if (/^https?:\/\//i.test(value)) pathname = new URL(value).pathname; }
  catch (_) { return value; }
  pathname = pathname.split(/[?#]/)[0] || '/';
  if (pathname !== '/' && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
  if (pathname.endsWith('.html')) pathname = pathname.slice(0, -5);
  if (pathname === '/index') pathname = '/';
  return pathname || '/';
}

const registryPath = path.join(root, 'docs', 'WU-PUBLIC-PAGE-REGISTRY.csv');
if (!fs.existsSync(registryPath)) errors.push('registry: docs/WU-PUBLIC-PAGE-REGISTRY.csv is missing');
const registry = fs.existsSync(registryPath) ? parseCsv(fs.readFileSync(registryPath, 'utf8')) : [];
const registryByFile = new Map(registry.map(page => [page.source_file, page]));
const registryByRoute = new Map(registry.map(page => [page.canonical_route, page]));
const configByRoute = new Map(config.pages.map(page => [page.path, page]));
if (registryByFile.size !== registry.length) errors.push('registry: duplicate source_file entries');
if (registryByRoute.size !== registry.length) errors.push('registry: duplicate canonical_route entries');

const explicitLegacyHtmlFiles = new Set(config.pages.flatMap(page => (page.legacyPaths || [])
  .filter(candidate => /^\/[\w/-]+\.html$/i.test(candidate))
  .map(candidate => candidate.replace(/^\//, ''))));
const htmlFiles = fs.readdirSync(root).filter(file => file.endsWith('.html') && !file.startsWith('google') && file !== '404.html');
htmlFiles.forEach(file => {
  if (!registryByFile.has(file) && !explicitLegacyHtmlFiles.has(file)) errors.push(`${file}: public HTML file is missing from route registry`);
});
registry.forEach(page => {
  if (!fs.existsSync(path.join(root, page.source_file))) errors.push(`${page.source_file}: registry source file does not exist`);
  if (!configByRoute.has(page.canonical_route)) errors.push(`${page.source_file}: canonical route is missing from seo.config.js`);
});
config.pages.forEach(page => { if (!registryByRoute.has(page.path)) errors.push(`seo.config.js: ${page.path} is missing from public page registry`); });

const sitemapRoutes = new Set([...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/gi)].map(match => {
  try {
    const url = new URL(match[1].trim());
    if (url.origin !== canonicalOrigin) {
      errors.push(`sitemap: non-canonical origin ${url.origin}`);
      return '';
    }
    return normalizeRoute(url.pathname);
  } catch (_) {
    errors.push(`sitemap: invalid URL ${match[1].trim()}`);
    return '';
  }
}).filter(Boolean));
const redirectRules = read('_redirects').split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'));
const redirectSources = new Map();
redirectRules.forEach(line => {
  const [source, target, status] = line.split(/\s+/);
  if (redirectSources.has(source)) errors.push(`_redirects: duplicate source rule ${source}`);
  redirectSources.set(source, { target, status });
});

registry.forEach(page => {
  const configPage = configByRoute.get(page.canonical_route);
  const shouldIndex = page.indexability === 'index';
  const shouldSitemap = page.sitemap === 'yes';
  if (configPage && configPage.indexable !== shouldIndex) errors.push(`${page.source_file}: registry indexability disagrees with seo.config.js`);
  if (sitemapRoutes.has(page.canonical_route) !== shouldSitemap) errors.push(`${page.source_file}: sitemap inclusion disagrees with registry`);
  if (!configPage) return;
  (configPage.legacyPaths || []).forEach(legacy => {
    const rule = redirectSources.get(legacy);
    if (!rule) errors.push(`_redirects: missing legacy redirect ${legacy}`);
    else if (normalizeRoute(rule.target) !== page.canonical_route) errors.push(`_redirects: ${legacy} must target ${page.canonical_route}`);
    else if (!/^301!?$/.test(rule.status || '')) errors.push(`_redirects: ${legacy} must be permanent`);
  });
  if (page.canonical_route !== '/') {
    const slashRule = redirectSources.get(`${page.canonical_route}/`);
    if (!slashRule || slashRule.target !== page.canonical_route) errors.push(`_redirects: missing trailing-slash normalization for ${page.canonical_route}`);
  }
});

const incoming = new Map(registry.map(page => [page.canonical_route, new Set()]));
const knownRoutes = new Set(registry.map(page => page.canonical_route));
const localizedRoutes = new Set(localeConfig.phase1Routes.map(route => normalizeRoute(LocaleRoute.href(route, 'ur'))));
const legacyLinkCounts = { html: 0, alternateHost: 0, slash: 0 };

registry.forEach(page => {
  const source = read(page.source_file);
  const canonical = (source.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i) || [])[1] || '';
  const robots = (source.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)/i) || [])[1] || '';
  if (canonical !== config.canonical(page.canonical_route)) errors.push(`${page.source_file}: canonical does not match registry route`);
  if (page.indexability === 'noindex' && !/noindex/i.test(robots)) errors.push(`${page.source_file}: noindex registry page lacks noindex robots directive`);

  [...source.matchAll(/\bhref=["']([^"']+)["']/gi)].map(match => match[1].trim()).forEach(href => {
    if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:|data:)/i.test(href)) return;
    let url;
    try { url = new URL(href, config.SITE_ORIGIN); }
    catch (_) { errors.push(`${page.source_file}: invalid link ${href}`); return; }
    if (/^https?:\/\//i.test(href) && ![canonicalHost, alternateHost].includes(url.hostname)) return;
    if (url.hostname === alternateHost) legacyLinkCounts.alternateHost += 1;
    const pathname = url.pathname;
    const normalized = normalizeRoute(pathname);
    const isLaunchedLocale = localizedRoutes.has(normalized);
    if (/\.html$/i.test(pathname)) legacyLinkCounts.html += 1;
    if (pathname !== '/' && pathname.endsWith('/') && !isLaunchedLocale) legacyLinkCounts.slash += 1;
    if (knownRoutes.has(normalized)) {
      if (normalized !== page.canonical_route) incoming.get(normalized).add(page.canonical_route);
      return;
    }
    if (isLaunchedLocale) return;
    if (redirectSources.has(pathname)) return;
    const localPath = pathname.replace(/^\//, '');
    if (localPath && fs.existsSync(path.join(root, 'functions', `${localPath}.js`))) return;
    if (localPath && !fs.existsSync(path.join(root, localPath))) errors.push(`${page.source_file}: broken internal link ${href}`);
  });
});

registry.forEach(page => {
  if (page.canonical_route === '/' || page.indexability === 'noindex') return;
  const sources = incoming.get(page.canonical_route);
  if (!sources || sources.size === 0) errors.push(`${page.source_file}: orphan public page has no incoming internal link`);
});

const humanSitemap = read('write-urdu-sitemap.html');
registry.filter(page => page.sitemap === 'yes' && page.canonical_route !== '/').forEach(page => {
  const escaped = page.canonical_route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!new RegExp(`href=["']${escaped}["']`, 'i').test(humanSitemap)) errors.push(`human sitemap: missing canonical link to ${page.canonical_route}`);
});
if (legacyLinkCounts.html) errors.push(`noncanonical internal-link backlog: ${legacyLinkCounts.html} .html links`);
if (legacyLinkCounts.alternateHost) errors.push(`noncanonical internal-link backlog: ${legacyLinkCounts.alternateHost} ${alternateHost} links`);
if (legacyLinkCounts.slash) errors.push(`noncanonical internal-link backlog: ${legacyLinkCounts.slash} trailing-slash links`);

if (errors.length) { console.error(errors.map(item => `GOVERNANCE: ${item}`).join('\n')); process.exit(1); }
console.log(`Product governance checks passed for ${registry.length} registered public pages, ${sitemapRoutes.size} sitemap routes, and ${redirectRules.length} redirect rules.`);
