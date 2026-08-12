# SEO deployment checklist

The repository generates canonical metadata, `sitemap.xml` and `robots.txt` from `seo.config.js`. The canonical production origin is `https://write-urdu.com`.

Before launch:

1. Confirm `SITE_ORIGIN` remains `https://write-urdu.com` and that all HTML canonicals, `og:url`, structured-data URLs and sitemap entries use that origin.
2. Keep the root `_redirects` file in the Cloudflare Pages artifact for **path-only** normalization (`.html`, legacy aliases and trailing slashes). Do not put `www` or other hostname sources in `_redirects`; Cloudflare Pages does not support domain-level redirect sources there.
3. Apply the Cloudflare zone-level host contract in `docs/CLOUDFLARE-CANONICAL-HOST.md`: permanent `www` → apex redirect, HTTP → HTTPS, redirect-only proxied `www` DNS, and production `<project>.pages.dev` → custom-domain redirect.
4. Keep the root `_headers` file in the Pages artifact so Cloudflare-owned Pages aliases carry the `X-Robots-Tag: noindex` defense while the stronger production-alias redirect remains the preferred control.
5. Run `npm run seo:generate`, `npm run seo:check`, `npm test` and the production browser smoke tests.
6. After deployment, run `npm run seo:live`. Set `PAGES_DEV_ORIGIN=https://<project>.pages.dev` so the production Pages alias is included in the live verification.
7. Add or verify a Domain property in Google Search Console, submit only `https://write-urdu.com/sitemap.xml`, and inspect the apex home, editor, keyboard, Roman Urdu guide, Documentation and About URLs.
8. Verify the site in Bing Webmaster Tools, submit the same canonical sitemap and enable IndexNow if the deployment supports it. IndexNow notifications are intentionally not sent from a visitor's browser.
9. Check CDN/firewall rules do not block Googlebot, OAI-SearchBot, PerplexityBot, Bingbot, ClaudeBot or Claude-SearchBot. `robots.txt` controls crawler policy; it cannot override a firewall.
10. Re-run Schema.org Validator and Google's Rich Results Test after deployment.

Do not use `robots.txt`, `noindex`, the Search Console removal tool or client-side JavaScript as substitutes for the permanent `www` → apex redirect.

No verification tokens or external-account credentials are committed to this repository.
