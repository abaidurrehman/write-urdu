# SEO deployment checklist

The repository now generates canonical metadata, `sitemap.xml` and `robots.txt` from `seo.config.js`.

Before launch:

1. Confirm `SITE_ORIGIN` matches the host that permanently redirects in production (`https://www.write-urdu.com`).
2. Configure Apache (or the hosting platform) to redirect HTTP, the alternate host, trailing slashes and verified `.html` paths to the extensionless canonical routes. The repository `.htaccess` contains the Apache map.
3. Run `npm run seo:generate`, `npm run seo:check`, `npm test` and the production browser smoke tests.
4. Add and verify the canonical property in Google Search Console, submit `/sitemap.xml`, and inspect the home, editor, Card Studio and QR Generator URLs.
5. Verify the site in Bing Webmaster Tools, submit the sitemap and enable IndexNow if the deployment supports it. IndexNow notifications are intentionally not sent from a visitor's browser.
6. Check CDN/firewall rules do not block Googlebot, OAI-SearchBot or PerplexityBot. `robots.txt` controls crawler policy; it cannot override a firewall.
7. Re-run Schema.org Validator and Google's Rich Results Test after deployment.

No verification tokens or external-account actions are committed to this repository.
