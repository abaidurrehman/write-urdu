const fs = require('fs');
const path = require('path');
const assert = require('assert');
const config = require('../seo.config.js');
const root = path.resolve(__dirname, '..');
const html = file => fs.readFileSync(path.join(root, file), 'utf8');
const files = fs.readdirSync(root).filter(file => file.endsWith('.html') && !file.startsWith('google'));
const errors = [];
const text = (value) => value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const meta = (source, name, property) => { const re = property ? new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)`, 'i') : new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)`, 'i'); const match = source.match(re); return match ? match[1] : ''; };
const canonical = source => (source.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)/i) || [])[1] || '';
const registryByFile = {};
config.pages.forEach(page => registryByFile[(page.path === '/' ? 'index' : page.path.slice(1)) + '.html'] = page);
const titles = new Map(); const descriptions = new Map();
files.forEach(file => {
  const page = registryByFile[file]; if (!page) { errors.push(`${file}: missing registry entry`); return; }
  const source = html(file); const title = (source.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || ''; const description = meta(source, 'description'); const robots = meta(source, 'robots'); const canon = canonical(source);
  if (title.trim() !== page.title) errors.push(`${file}: title does not match registry`);
  if (!description) errors.push(`${file}: missing description`);
  if (titles.has(title.trim())) errors.push(`${file}: duplicate title with ${titles.get(title.trim())}`); else titles.set(title.trim(), file);
  if (descriptions.has(description)) errors.push(`${file}: duplicate description with ${descriptions.get(description)}`); else descriptions.set(description, file);
  const h1 = (source.match(/<h1(?:\s|>)/gi) || []).length; if (h1 !== 1) errors.push(`${file}: expected one H1, found ${h1}`);
  if (canon !== config.canonical(page.path)) errors.push(`${file}: canonical must be ${config.canonical(page.path)}`);
  if (page.indexable && /noindex/i.test(robots)) errors.push(`${file}: indexable page is noindex`);
  if (!page.indexable && !/noindex/i.test(robots)) errors.push(`${file}: utility page must be noindex`);
  if (!meta(source, '', 'og:title') || !meta(source, '', 'og:description') || !meta(source, '', 'og:url')) errors.push(`${file}: missing Open Graph metadata`);
});
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
config.pages.filter(page => page.indexable).forEach(page => { if (!sitemap.includes(`<loc>${config.canonical(page.path)}</loc>`)) errors.push(`sitemap: missing ${page.path}`); });
config.pages.filter(page => !page.indexable).forEach(page => { if (sitemap.includes(`<loc>${config.canonical(page.path)}</loc>`)) errors.push(`sitemap: utility page included ${page.path}`); });
const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8'); ['OAI-SearchBot', 'PerplexityBot', 'GPTBot', 'Google-Extended', 'Bingbot', 'ClaudeBot', 'Claude-SearchBot'].forEach(bot => { if (!robots.includes(`User-agent: ${bot}`)) errors.push(`robots.txt: missing explicit ${bot} policy`); });
if (!fs.existsSync(path.join(root, 'llms.txt'))) errors.push('llms.txt: missing AI-readable site summary');
const redirectsPath = path.join(root, '_redirects');
if (!fs.existsSync(redirectsPath) || !fs.readFileSync(redirectsPath, 'utf8').includes('https://www.write-urdu.com/* https://write-urdu.com/:splat 301!')) errors.push('_redirects: missing Cloudflare www-to-apex redirect');
if (errors.length) { console.error(errors.map(error => `SEO: ${error}`).join('\n')); process.exit(1); }
console.log(`SEO checks passed for ${files.length} HTML pages and ${config.pages.filter(page => page.indexable).length} sitemap URLs.`);
