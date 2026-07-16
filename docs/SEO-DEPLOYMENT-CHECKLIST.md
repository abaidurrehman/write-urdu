# SEO deployment checklist

The repository now generates canonical metadata, `sitemap.xml` and `robots.txt` from `seo.config.js`.

Before launch:

1. Confirm `SITE_ORIGIN` matches the host that permanently redirects in production (`https://write-urdu.com`).
2. Because production is hosted on Cloudflare Pages, ensure the root `_redirects` file is included in the Pages output. It handles verified `.html` and trailing-slash paths. Configure Cloudflare Redirect Rules or Bulk Redirects separately for HTTP and the alternate host to reach `https://write-urdu.com` in one hop; `.htaccess` is only the Apache fallback.
3. Run `npm run seo:generate`, `npm run seo:check`, `npm test` and the production browser smoke tests.
4. Add and verify the canonical property in Google Search Console, submit `/sitemap.xml`, and inspect the home, editor, Card Studio and QR Generator URLs.
5. Verify the site in Bing Webmaster Tools, submit the sitemap and enable IndexNow if the deployment supports it. IndexNow notifications are intentionally not sent from a visitor's browser.
6. Check CDN/firewall rules do not block Googlebot, OAI-SearchBot, PerplexityBot, Bingbot, ClaudeBot or Claude-SearchBot. `robots.txt` controls crawler policy; it cannot override a firewall.
7. Re-run Schema.org Validator and Google's Rich Results Test after deployment.

No verification tokens or external-account actions are committed to this repository.
