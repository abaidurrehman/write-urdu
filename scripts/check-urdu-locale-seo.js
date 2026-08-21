#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const seo = require('../seo.config.js');
const localeConfig = require('../locale.config.js');
const ur = require('../locale/ur.js');
const Route = require('../js/locale-route.js');
const root = path.resolve(__dirname, '..');
const errors = [];
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const decode = value => String(value || '').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
const text = value => decode(String(value || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
const title = source => text((source.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);
const h1 = source => text((source.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]);
function meta(source, key, property) {
  const attr = property ? 'property' : 'name';
  const re = new RegExp('<meta\\b(?=[^>]*\\b' + attr + '=["\\\']' + key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '["\\\'])[^>]*\\bcontent=["\\\']([^"\\\']*)', 'i');
  const match = source.match(re);
  return match ? decode(match[1]) : '';
}
const canonical = source => decode((source.match(/<link\b(?=[^>]*rel=["']canonical["'])[^>]*href=["']([^"']+)/i) || [])[1] || '');
function alternates(source) {
  const values = {};
  for (const match of source.matchAll(/<link\b(?=[^>]*rel=["']alternate["'])(?=[^>]*hreflang=["']([^"']+)["'])[^>]*href=["']([^"']+)/gi)) values[match[1].toLowerCase()] = decode(match[2]);
  return values;
}
function generatedFile(productPath) { return productPath === '/' ? 'urdu/index.html' : 'urdu' + productPath + '.html'; }
const expectedUrduUrls = new Set();

for (const productPath of localeConfig.phase1Routes) {
  const record = localeConfig.routes[productPath];
  const copy = ur.routes[productPath];
  const page = seo.byPath[productPath];
  const file = generatedFile(productPath);
  if (!record || !record.ur || !copy || !page || !page.indexable || !fs.existsSync(path.join(root, file))) {
    errors.push(`${productPath}: launched Urdu route is incomplete`);
    continue;
  }
  const source = read(file);
  const englishSource = read(record.source);
  const enUrl = seo.SITE_ORIGIN + Route.href(productPath, 'en');
  const urUrl = seo.SITE_ORIGIN + Route.href(productPath, 'ur');
  expectedUrduUrls.add(urUrl);
  if (!/<html\b[^>]*lang=["']ur["'][^>]*dir=["']rtl["']/i.test(source)) errors.push(`${file}: lang=ur dir=rtl required in initial HTML`);
  if (canonical(source) !== urUrl) errors.push(`${file}: canonical must self-reference ${urUrl}`);
  if ((source.match(/<link\b(?=[^>]*rel=["']canonical["'])/gi) || []).length !== 1) errors.push(`${file}: expected exactly one canonical`);
  if (/noindex/i.test(meta(source, 'robots', false))) errors.push(`${file}: launched Urdu page must not be noindex`);
  if (title(source) !== copy.title) errors.push(`${file}: title must match reviewed Urdu metadata`);
  if (meta(source, 'description', false) !== copy.description) errors.push(`${file}: description must match reviewed Urdu metadata`);
  if (h1(source) !== copy.h1) errors.push(`${file}: H1 must match reviewed Urdu metadata`);
  const expectedAlt = { en: enUrl, ur: urUrl, 'x-default': enUrl };
  const urAlt = alternates(source);
  const enAlt = alternates(englishSource);
  for (const key of Object.keys(expectedAlt)) {
    if (urAlt[key] !== expectedAlt[key]) errors.push(`${file}: hreflang ${key} mismatch`);
    if (enAlt[key] !== expectedAlt[key]) errors.push(`${record.source}: reciprocal hreflang ${key} mismatch`);
  }
  if (canonical(englishSource) !== enUrl) errors.push(`${record.source}: established English canonical changed`);
  if (productPath === '/') {
    const expectedEnglishTitle = page.searchTitle || page.title;
    const expectedEnglishDescription = page.searchDescription || page.description;
    if (title(englishSource) !== expectedEnglishTitle) errors.push(`${record.source}: protected English homepage title changed`);
    if (meta(englishSource, 'description', false) !== expectedEnglishDescription) errors.push(`${record.source}: protected English homepage description changed`);
  }
  if (meta(source, 'og:title', true) !== copy.title) errors.push(`${file}: og:title mismatch`);
  if (meta(source, 'og:description', true) !== copy.description) errors.push(`${file}: og:description mismatch`);
  if (meta(source, 'og:url', true) !== urUrl) errors.push(`${file}: og:url must match Urdu canonical`);
  if (meta(source, 'og:locale', true) !== (ur.ogLocale || 'ur_PK')) errors.push(`${file}: og:locale must be Urdu`);

  const schemaMatch = source.match(/<script\b[^>]*data-wu-urdu-schema[^>]*>([\s\S]*?)<\/script>/i);
  if ((page.schema || []).length && !schemaMatch) errors.push(`${file}: localized structured data missing`);
  if (schemaMatch) {
    try {
      const payload = JSON.parse(schemaMatch[1]);
      const graph = Array.isArray(payload['@graph']) ? payload['@graph'] : [];
      (page.schema || []).forEach(type => { if (!graph.some(node => node && node['@type'] === type)) errors.push(`${file}: schema type ${type} missing`); });
      graph.forEach(node => {
        if (node && node.url && node.url !== urUrl) errors.push(`${file}: schema URL leaks another locale`);
        if (node && node.inLanguage && node.inLanguage !== 'ur') errors.push(`${file}: schema inLanguage must be ur`);
      });
    } catch (_) { errors.push(`${file}: invalid localized JSON-LD`); }
  }
}

const sitemap = read('sitemap.xml');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gi)].map(match => decode(match[1]).trim());
const actualUrduUrls = new Set(locs.filter(url => {
  try { const p = new URL(url).pathname; return p === '/urdu/' || p.startsWith('/urdu/'); } catch (_) { return false; }
}));
if (actualUrduUrls.size !== expectedUrduUrls.size) errors.push(`sitemap: expected exactly ${expectedUrduUrls.size} launched Urdu URLs, found ${actualUrduUrls.size}`);
for (const url of expectedUrduUrls) if (!actualUrduUrls.has(url)) errors.push(`sitemap: missing launched Urdu URL ${url}`);
for (const url of actualUrduUrls) if (!expectedUrduUrls.has(url)) errors.push(`sitemap: unlaunched Urdu URL included ${url}`);
if (errors.length) { console.error(errors.map(error => 'URDU-SEO: ' + error).join('\n')); process.exit(1); }
console.log(`Urdu locale SEO checks passed for ${localeConfig.phase1Routes.length} reciprocal locale pairs and ${actualUrduUrls.size} Urdu sitemap URLs.`);
