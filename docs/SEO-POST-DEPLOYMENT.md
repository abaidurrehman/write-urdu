# SEO post-deployment checklist

This checklist covers account and deployment actions that cannot be completed safely from the static repository.

## Cloudflare Pages

1. Confirm the root `_redirects` file is included in the Pages artifact.
2. Configure one-hop Redirect Rules or Bulk Redirects for `http://write-urdu.com/*`, `http://www.write-urdu.com/*` and `https://www.write-urdu.com/*` to `https://write-urdu.com/:splat`.
3. Test a deep `.html` URL and trailing-slash URL from an external browser. Each should reach the apex extensionless URL with at most one redirect.
4. Check CDN and WAF rules do not block Googlebot, OAI-SearchBot, PerplexityBot, Bingbot, ClaudeBot or Claude-SearchBot.

## Search engines

1. Verify `https://write-urdu.com` as the canonical property in Google Search Console and Bing Webmaster Tools.
2. Submit `https://write-urdu.com/sitemap.xml` in both tools.
3. Inspect `/`, `/urdu-keyboard`, `/urdu-card-studio`, `/qr-code-generator` and `/write-urdu-documentation` after deployment.
4. Request recrawls for the two utility pages so `noindex,follow` can be processed; use temporary removals only when an urgent removal is required.
5. Monitor “excluded by noindex”, duplicate canonical and redirect reports until the old host and `.html` URLs consolidate.

## IndexNow (optional)

Set `INDEXNOW_ENABLED=true` and a deployment-provided `INDEXNOW_KEY`, publish `/{key}.txt` containing the key, then run `npm run seo:indexnow -- /changed-route`. Submission failures are warnings by design.

## Evidence to record

Record mobile Lighthouse or PageSpeed Insights results for `/`, `/urdu-editor`, `/urdu-keyboard`, `/urdu-card-studio` and `/qr-code-generator`. Search Console is the source of truth for impressions and queries; manual rank checks in `docs/SEO-QUERY-TRACKING.csv` are directional only.
