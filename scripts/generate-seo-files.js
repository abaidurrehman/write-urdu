/* Generate crawl policy and sitemap from seo.config.js. */
const fs = require('fs');
const path = require('path');
const config = require('../seo.config.js');
const root = path.resolve(__dirname, '..');
const urls = config.pages.filter(page => page.indexable && page.path !== '/write-urdu-search' && page.path !== '/write-urdu-feedback');
const escapeXml = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const sitemap = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...urls.map(page => [
  '  <url>', `    <loc>${escapeXml(config.canonical(page.path))}</loc>`, page.lastmod ? `    <lastmod>${page.lastmod}</lastmod>` : null,
  `    <changefreq>${page.changefreq}</changefreq>`, `    <priority>${page.priority.toFixed(2)}</priority>`, '  </url>'
].filter(Boolean).join('\n')), '</urlset>', ''].join('\n');
const robots = ['User-agent: *', 'Allow: /', '', 'User-agent: Googlebot', 'Allow: /', '', 'User-agent: OAI-SearchBot', 'Allow: /', '', 'User-agent: PerplexityBot', 'Allow: /', '', '# GPTBot is allowed for this launch; change this policy deliberately if needed.', 'User-agent: GPTBot', 'Allow: /', '', '# Google-Extended is separate from Google Search crawling.', 'User-agent: Google-Extended', 'Allow: /', '', `Sitemap: ${config.SITE_ORIGIN}/sitemap.xml`, ''].join('\n');
function writeGenerated(file, content) {
  try {
    if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === content) return;
    fs.writeFileSync(file, content);
  } catch (error) {
    // Some local preview servers keep public files open on Windows. The
    // checked-in generated files remain usable; a deployment build can write
    // them normally, while this command still reports the actionable warning.
    if (error.code === 'EPERM' || error.code === 'EBUSY') {
      console.warn(`Could not replace ${path.basename(file)} because it is locked; use the generated registry in the next deployment build.`);
      return;
    }
    throw error;
  }
}
writeGenerated(path.join(root, 'sitemap.xml'), sitemap);
writeGenerated(path.join(root, 'robots.txt'), robots);
console.log(`Generated sitemap (${urls.length} URLs) and robots.txt for ${config.SITE_ORIGIN}`);
