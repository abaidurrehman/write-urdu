/* Generate crawl policy and sitemap from SEO + launched locale registries. */
const fs = require('fs');
const path = require('path');
const config = require('../seo.config.js');
const localeConfig = require('../locale.config.js');
const ur = require('../locale/ur.js');
const Route = require('../js/locale-route.js');
const root = path.resolve(__dirname, '..');
const englishUrls = config.pages.filter(page => page.indexable).map(page => ({ page, url: config.canonical(page.path), lastmod: page.lastmod }));
const urduUrls = localeConfig.phase1Routes.map(productPath => {
  const page = config.byPath[productPath];
  const localeRecord = localeConfig.routes[productPath];
  const copy = ur.routes[productPath];
  const generated = productPath === '/' ? 'urdu/index.html' : 'urdu' + productPath + '.html';
  if (!page || !page.indexable || !localeRecord || !localeRecord.ur || !copy || !fs.existsSync(path.join(root, generated))) {
    throw new Error(`Urdu sitemap route is not launch-ready: ${productPath}`);
  }
  return { page, url: config.SITE_ORIGIN + Route.href(productPath, 'ur'), lastmod: copy.lastReviewed || page.lastmod };
});
const urls = englishUrls.concat(urduUrls);
const escapeXml = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const sitemap = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...urls.map(entry => [
  '  <url>', `    <loc>${escapeXml(entry.url)}</loc>`, entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>` : null,
  `    <changefreq>${entry.page.changefreq}</changefreq>`, `    <priority>${entry.page.priority.toFixed(2)}</priority>`, '  </url>'
].filter(Boolean).join('\n')), '</urlset>', ''].join('\n');
const robots = ['User-agent: *', 'Allow: /', '', 'User-agent: Googlebot', 'Allow: /', '', 'User-agent: OAI-SearchBot', 'Allow: /', '', 'User-agent: PerplexityBot', 'Allow: /', '', 'User-agent: Bingbot', 'Allow: /', '', 'User-agent: ClaudeBot', 'Allow: /', '', 'User-agent: Claude-SearchBot', 'Allow: /', '', '# GPTBot is deliberately opted out for training; OAI-SearchBot remains allowed for search discovery.', 'User-agent: GPTBot', 'Disallow: /', '', '# Google-Extended is separate from Google Search crawling and remains allowed.', 'User-agent: Google-Extended', 'Allow: /', '', `Sitemap: ${config.SITE_ORIGIN}/sitemap.xml`, ''].join('\n');
function writeGenerated(file, content) {
  try {
    if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === content) return;
    fs.writeFileSync(file, content);
  } catch (error) {
    if (error.code === 'EPERM' || error.code === 'EBUSY') {
      console.warn(`Could not replace ${path.basename(file)} because it is locked; use the generated registry in the next deployment build.`);
      return;
    }
    throw error;
  }
}
writeGenerated(path.join(root, 'sitemap.xml'), sitemap);
writeGenerated(path.join(root, 'robots.txt'), robots);
console.log(`Generated sitemap (${englishUrls.length} English + ${urduUrls.length} Urdu URLs) and robots.txt for ${config.SITE_ORIGIN}`);
