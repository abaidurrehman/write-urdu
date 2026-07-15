# SEO and performance deployment checklist

This checklist records the checks that require a deployed site or an owner account. It complements the local `npm run seo:check` command; it does not claim that search visibility or Core Web Vitals have been measured from this repository.

## Before deployment

- Run `npm test`, `npm run seo:generate`, and `npm run seo:check`.
- Confirm the build publishes `robots.txt`, `sitemap.xml`, `seo.config.js`, and all canonical extensionless routes.
- For Cloudflare Pages, confirm the root `_redirects` file is included in the deployed output; `.htaccess` is not evaluated by Pages.
- For Cloudflare Pages, confirm the root `_redirects` file is included in the deployed output; `.htaccess` is not evaluated by Pages.
- Confirm the canonical host is `https://www.write-urdu.com` and that HTTP, the alternate host, `.html` routes, and trailing-slash variants redirect directly to it.
- Check that Card Studio and QR Generator JavaScript are loaded only on their own pages.

## After deployment

- Open the homepage and every URL in `sitemap.xml` in an incognito browser. Check the final URL, title, canonical, one visible H1, and the JSON-LD block.
- Submit `https://www.write-urdu.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- Inspect the homepage, `/urdu-card-studio`, `/qr-code-generator`, `/urdu-editor`, and `/write-urdu-documentation` with each search engine's URL inspection tool.
- Run Lighthouse or PageSpeed Insights on the homepage, basic editor, rich editor, Card Studio, and QR Generator. Record mobile LCP, INP, and CLS; do not treat a single local run as field data.
- In Chrome DevTools or WebPageTest, verify that no below-the-fold image causes layout shift and that editor/card/QR bundles are not loaded on unrelated guide pages.
- Verify that Googlebot, OAI-SearchBot and PerplexityBot are not blocked by CDN or firewall rules. Keep the `GPTBot` and `Google-Extended` policy decisions documented in `robots.txt`.
- In Cloudflare, configure an HTTPS and canonical-host redirect with Redirect Rules or Bulk Redirects from HTTP and the non-canonical host to `https://www.write-urdu.com`. Keep it as one direct hop and test query strings and deep links.
- In Cloudflare, configure an HTTPS and canonical-host redirect with Redirect Rules or Bulk Redirects from HTTP and the non-canonical host to `https://www.write-urdu.com`. Keep it as one direct hop and test query strings and deep links.
- If IndexNow is enabled for the deployment, submit only changed canonical URLs and allow submission failures to remain non-blocking.

## Ongoing review

- Re-test after meaningful editor, Card Studio, QR Generator, font, or privacy changes.
- Update visible “Last updated” dates only when content actually changes.
- Replace tutorial screenshots and examples when the interface changes.
- Review Search Console and Bing data monthly for indexing errors, broken links, and queries that reveal unclear wording.
