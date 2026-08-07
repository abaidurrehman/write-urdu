# SEO post-deployment checklist

This checklist covers account, crawler, structured-data and measurement actions that cannot be completed safely from the static repository.

## Cloudflare Pages

1. Confirm the root `_redirects`, `robots.txt`, `sitemap.xml` and `llms.txt` files are included in the Pages artifact.
2. Configure one-hop Redirect Rules or Bulk Redirects for `http://write-urdu.com/*`, `http://www.write-urdu.com/*` and `https://www.write-urdu.com/*` to `https://write-urdu.com/:splat`.
3. Test a deep `.html` URL and trailing-slash URL from an external browser. Each should reach the apex extensionless URL with at most one redirect.
4. Check CDN and WAF rules do not block Googlebot, OAI-SearchBot, PerplexityBot, Bingbot, ClaudeBot or Claude-SearchBot.
5. Confirm the homepage, Roman Urdu guide, Urdu Alphabet, Documentation, About and Privacy pages return a successful response without a challenge, login or interstitial.

## Search engines

1. Verify `https://write-urdu.com` as the canonical property in Google Search Console and Bing Webmaster Tools.
2. Submit `https://write-urdu.com/sitemap.xml` in both tools.
3. Inspect `/`, `/urdu-keyboard`, `/urdu-editor`, `/roman-urdu-transliteration`, `/urdu-alphabet`, `/write-urdu-documentation` and `/why-write-urdu` after deployment.
4. Request recrawls for materially changed indexable pages. Request recrawls for utility pages when `noindex,follow` changes need to be processed; use temporary removals only when an urgent removal is required.
5. Monitor duplicate canonical, redirect, crawled-not-indexed and excluded-by-noindex reports until old host and `.html` URLs consolidate.

## Structured data and entity checks

1. Run Google's Rich Results Test on `/`, `/urdu-keyboard`, `/urdu-editor`, `/write-urdu-documentation`, `/roman-urdu-transliteration` and `/urdu-alphabet`.
2. Run Schema.org Validator on the same pages to catch vocabulary issues that are outside Google's rich-result feature set.
3. Confirm the homepage graph contains one canonical `WebSite`, one `Organization` publisher and one `WebApplication` main entity.
4. Confirm `WebSite.name` is `Write Urdu`, the canonical URL is `https://write-urdu.com/`, and alternate names remain factual brand variants only.
5. Confirm the Organization node exposes the real correction/contact channel and links to the public publishing/correction policy. Do not add founder names, addresses, reviews, awards or social `sameAs` values unless they are public and verified.
6. On guide pages, confirm `Article` dates match visible/repository revision dates and the Organization remains the publisher/author while no public individual byline is claimed.
7. FAQ structured data must match visible questions and answers. Treat it as semantic markup; do not assume a Google FAQ rich result will be shown.

## LLM and crawler discovery

1. Open `https://write-urdu.com/llms.txt` directly and confirm it is plain-text/Markdown, publicly accessible and contains canonical HTTPS links.
2. Verify the file accurately describes transliteration as transliteration, not translation; identifies the core writing tools; and links to About, Privacy and Feedback.
3. Confirm `OAI-SearchBot` is allowed in `robots.txt` and `GPTBot` remains deliberately blocked unless product policy changes.
4. Confirm Cloudflare bot/WAF rules do not contradict `robots.txt`. A permitted crawler that receives a Cloudflare challenge is still effectively blocked.
5. Treat `llms.txt` as an auxiliary discovery aid. It does not replace crawlable HTML, sitemap coverage, internal links, Search Console, authority or accurate structured data.

## Search Console opportunity tracking

The homepage remains the primary owner for broad `urdu typing` and `urdu writing` intent unless Search Console evidence supports a deliberate split.

Record weekly:

- query;
- clicks;
- impressions;
- CTR;
- average position;
- ranking URL;
- device;
- country when materially different.

Priority baseline from the supplied Search Console export:

- `urdu typing` — 7,162 impressions, position 7.21, CTR 1.79%;
- `urdu writing` — 3,705 impressions, position 6.48, CTR 1.30%.

Watch for ranking-URL changes after every content or canonical migration. A supporting guide taking over the broad homepage query is a cannibalization warning, not automatically a win.

## Search snippet and citation review

1. Check the rendered homepage title/description after recrawl. The intended search-facing title leads with `Urdu Typing Online` while remaining readable and factual.
2. Compare mobile and desktop CTR before judging title/description changes; do not optimize from manual rank checks alone.
3. Test a small stable set of non-branded discovery questions in major search/answer products and record whether Write Urdu is surfaced or cited. Treat results as observational evidence, not proof of guaranteed inclusion.
4. When a guide is cited, verify that its answer is factually supported by visible page content and that the page routes users naturally into the relevant writing tool.

## IndexNow (optional)

Set `INDEXNOW_ENABLED=true` and a deployment-provided `INDEXNOW_KEY`, publish `/{key}.txt` containing the key, then run `npm run seo:indexnow -- /changed-route`. Submission failures are warnings by design.

## Evidence to record

Record mobile Lighthouse or PageSpeed Insights results for `/`, `/urdu-editor`, `/urdu-keyboard`, `/urdu-card-studio` and `/qr-code-generator`. Search Console is the source of truth for impressions and queries; manual rank checks in `docs/SEO-QUERY-TRACKING.csv` are directional only.
