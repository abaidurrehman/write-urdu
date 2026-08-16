# SEO deployment checklist

The repository generates canonical metadata, `sitemap.xml` and `robots.txt` from `seo.config.js`. The canonical production origin is `https://write-urdu.com`.

Before launch:

1. Confirm `SITE_ORIGIN` remains `https://write-urdu.com` and HTML canonicals, `og:url`, structured-data URLs and sitemap entries use that origin.
2. Keep root `_redirects` in the Cloudflare Pages artifact for **path-only** normalization (`.html`, legacy aliases and trailing slashes). Do not put hostname sources in `_redirects`; Pages does not support domain-level source redirects there.
3. Apply `docs/CLOUDFLARE-CANONICAL-HOST.md`: permanent `www → apex` Single Redirect, HTTPS enforcement for apex, and production `<project>.pages.dev → apex` redirect.
4. Keep root `_headers` in the Pages artifact so Pages aliases carry the `X-Robots-Tag: noindex` defense while the stronger production-alias redirect remains preferred.
5. Run `npm run seo:generate`, `npm run seo:sync-heads`, `npm run seo:check`, `npm run governance:check` and `npm test` before deployment.
6. After deployment, run `npm run seo:live`; set `PAGES_DEV_ORIGIN=https://<project>.pages.dev` to include the production Pages alias.
7. Keep a Google Search Console **Domain property** for `write-urdu.com`, submit only `https://write-urdu.com/sitemap.xml`, and inspect apex URLs for home, editor, keyboard, Roman Urdu guide, Documentation and About.
8. Verify Bing Webmaster Tools with the same canonical sitemap and enable IndexNow if the deployment supports it.
9. Check CDN/firewall rules do not block Googlebot, OAI-SearchBot, PerplexityBot, Bingbot, ClaudeBot or Claude-SearchBot. `robots.txt` cannot override a firewall challenge.
10. Re-run Schema.org Validator and Google's Rich Results Test after deployment.

Do not use `robots.txt`, `noindex`, the Search Console removal tool or client-side JavaScript as substitutes for the permanent `www → apex` redirect.

No verification tokens or external-account credentials are committed to this repository.
