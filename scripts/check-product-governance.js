const fs = require('node:fs');
const path = require('node:path');
const config = require('../seo.config.js');

const root = path.resolve(__dirname, '..');
const registryPath = path.join(root, 'docs', 'WU-PUBLIC-PAGE-REGISTRY.csv');
const errors = [];
const warnings = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function parseCsv(source) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];
    if (char === '"' && quoted && next === '"') {
      field += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(field.trim());
      field = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(field.trim());
      field = '';
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field.trim());
    if (row.some(Boolean)) rows.push(row);
  }

  const [headers, ...records] = rows;
  return records.map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
}

function normalizeRoute(value) {
  if (!value) return '';
  let pathname = value;
  try {
    if (/^https?:\/\//i.test(value)) pathname = new URL(value).pathname;
  } catch (_) {
    return value;
  }
  pathname = pathname.split(/[?#]/)[0] || '/';
  if (pathname !== '/' && pathname.endsWith('/')) pathname = pathname.slice(0, -1);
  if (pathname.endsWith('.html')) pathname = pathname.slice(0, -5);
  if (pathname === '/index') pathname = '/';
  return pathname || '/';
}

function extractLinks(source) {
  return [...source.matchAll(/\bhref=["']([^"']+)["']/gi)].map(match => match[1].trim());
}

function extractTag(source, pattern) {
  return (source.match(pattern) || [])[1] || '';
}

if (!fs.existsSync(registryPath)) errors.push('registry: docs/WU-PUBLIC-PAGE-REGISTRY.csv is missing');
const registry = fs.existsSync(registryPath) ? parseCsv(fs.readFileSync(registryPath, 'utf8')) : [];
const registryByFile = new Map(registry.map(page => [page.source_file, page]));
const registryByRoute = new Map(registry.map(page => [page.canonical_route, page]));
const configByRoute = new Map(config.pages.map(page => [page.path, page]));

if (registryByFile.size !== registry.length) errors.push('registry: duplicate source_file entries');
if (registryByRoute.size !== registry.length) errors.push('registry: duplicate canonical_route entries');

const htmlFiles = fs.readdirSync(root).filter(file => file.endsWith('.html') && !file.startsWith('google'));

htmlFiles.forEach(file => {
  if (!registryByFile.has(file)) errors.push(`${file}: public HTML file is missing from route registry`);
});
registry.forEach(page => {
  if (!fs.existsSync(path.join(root, page.source_file))) errors.push(`${page.source_file}: registry source file does not exist`);
  if (!configByRoute.has(page.canonical_route)) errors.push(`${page.source_file}: canonical route is missing from seo.config.js`);
});
config.pages.forEach(page => {
  if (!registryByRoute.has(page.path)) errors.push(`seo.config.js: ${page.path} is missing from public page registry`);
});

const sitemap = read('sitemap.xml');
const sitemapRoutes = new Set([...sitemap.matchAll(/<loc>https:\/\/write-urdu\.com([^<]*)<\/loc>/gi)].map(match => normalizeRoute(match[1] || '/')));
const redirects = read('_redirects');
const redirectRules = redirects.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'));
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

  if (configPage) {
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
  }
});

const incoming = new Map(registry.map(page => [page.canonical_route, new Set()]));
const knownRoutes = new Set(registry.map(page => page.canonical_route));
const sourceByRoute = new Map(registry.map(page => [page.canonical_route, page.source_file]));

registry.forEach(page => {
  const source = read(page.source_file);
  const canonical = extractTag(source, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i);
  const robots = extractTag(source, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)/i);
  if (canonical !== config.canonical(page.canonical_route)) errors.push(`${page.source_file}: canonical does not match registry route`);
  if (page.indexability === 'noindex' && !/noindex/i.test(robots)) errors.push(`${page.source_file}: noindex registry page lacks noindex robots directive`);

  extractLinks(source).forEach(href => {
    if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:|data:)/i.test(href)) return;
    if (/^https?:\/\//i.test(href)) {
      let url;
      try { url = new URL(href); } catch (_) { errors.push(`${page.source_file}: invalid URL ${href}`); return; }
      if (url.hostname === 'www.write-urdu.com') errors.push(`${page.source_file}: internal link uses legacy www host: ${href}`);
      if (url.hostname !== 'write-urdu.com' && url.hostname !== 'www.write-urdu.com') return;
    }

    let pathname;
    try { pathname = /^https?:\/\//i.test(href) ? new URL(href).pathname : new URL(href, config.SITE_ORIGIN).pathname; }
    catch (_) { errors.push(`${page.source_file}: invalid internal link ${href}`); return; }

    if (/\.html$/i.test(pathname)) errors.push(`${page.source_file}: internal link uses .html route: ${href}`);
    if (pathname !== '/' && pathname.endsWith('/')) errors.push(`${page.source_file}: internal link uses trailing slash: ${href}`);

    const normalized = normalizeRoute(pathname);
    if (knownRoutes.has(normalized)) {
      if (normalized !== page.canonical_route) incoming.get(normalized).add(page.canonical_route);
      return;
    }

    const localPath = pathname.replace(/^\//, '');
    if (!localPath) return;
    if (!fs.existsSync(path.join(root, localPath))) errors.push(`${page.source_file}: broken internal link ${href}`);
  });
});

registry.forEach(page => {
  if (page.canonical_route === '/' || page.indexability === 'noindex') return;
  const sources = incoming.get(page.canonical_route);
  if (!sources || sources.size === 0) errors.push(`${page.source_file}: orphan public page has no incoming internal link`);
});

const humanSitemap = read('write-urdu-sitemap.html');
registry.filter(page => page.sitemap === 'yes').forEach(page => {
  if (page.canonical_route === '/') return;
  const escaped = page.canonical_route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!new RegExp(`href=["']${escaped}["']`, 'i').test(humanSitemap)) warnings.push(`human sitemap: missing ${page.canonical_route}`);
});

if (warnings.length) console.warn(warnings.map(item => `GOVERNANCE WARNING: ${item}`).join('\n'));
if (errors.length) {
  console.error(errors.map(item => `GOVERNANCE: ${item}`).join('\n'));
  process.exit(1);
}

console.log(`Product governance checks passed for ${registry.length} registered public pages, ${sitemapRoutes.size} sitemap routes, and ${redirectRules.length} redirect rules.`);
