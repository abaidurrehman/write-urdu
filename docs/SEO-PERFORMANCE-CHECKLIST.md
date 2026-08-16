# SEO and performance deployment checklist

This checklist records the checks that require a deployed site or an owner account. It complements the local `npm run seo:check` command; it does not claim that search visibility or Core Web Vitals have been measured from this repository.

## Before deployment

- Run `npm test`, `npm run seo:generate`, `npm run seo:sync-heads`, `npm run seo:check` and `npm run governance:check`.
- Confirm the build publishes `robots.txt`, `sitemap.xml`, `seo.config.js`, and all canonical extensionless routes.
- For Cloudflare Pages, confirm root `_redirects` is included in deployed output; `.htaccess` is not evaluated by Pages.
- Confirm the canonical host is `https://write-urdu.com`; `www`, HTTP variants, `.html` routes and trailing-slash variants must converge on it under the final routing contract.
- Check Card Studio and QR Generator JavaScript are loaded only on their own pages.

## After deployment

- Open the homepage and every URL in `sitemap.xml` in an incognito browser. Check final URL, title, canonical, one visible H1, and JSON-LD.
- Submit `https://write-urdu.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- Inspect the homepage, `/urdu-card-studio`, `/qr-code-generator`, `/urdu-editor`, and `/write-urdu-documentation` with each search engine's URL inspection tool.
- Run Lighthouse or PageSpeed Insights on the homepage, basic editor, rich editor, Card Studio, and QR Generator. Record mobile LCP, INP, and CLS; do not treat a single local run as field data.
- In Chrome DevTools or WebPageTest, verify no below-the-fold image causes layout shift and editor/card/QR bundles are not loaded on unrelated guide pages.
- Verify Googlebot, OAI-SearchBot, PerplexityBot, Bingbot and explicitly listed AI crawlers are not blocked by CDN or firewall rules. Keep `GPTBot` and `Google-Extended` policy decisions documented in `robots.txt`.
- In Cloudflare, configure a permanent same-path/query redirect from non-canonical `www.write-urdu.com` to `https://write-urdu.com`, with HTTP variants converging directly on HTTPS apex.
- If IndexNow is enabled, submit only changed canonical URLs and allow submission failures to remain non-blocking.

## Ongoing review

- Re-test after meaningful editor, Card Studio, QR Generator, font, privacy or routing changes.
- Update visible “Last updated” dates only when content actually changes.
- Replace tutorial screenshots and examples when the interface changes.
- Review Search Console and Bing data monthly for indexing errors, broken links, and queries that reveal unclear wording.
