# SEO post-deployment checklist

This checklist covers account, crawler, structured-data and measurement actions that cannot be completed safely from the static repository.

## Cloudflare Pages

1. Confirm root `_redirects`, `_headers`, `robots.txt`, `sitemap.xml` and `llms.txt` are included in the Pages artifact.
2. Configure the zone-level canonical rule so all `www.write-urdu.com` requests permanently redirect directly to `https://write-urdu.com` with the same path and query string.
3. Keep HTTP → HTTPS enabled for the canonical apex host `write-urdu.com`.
4. Redirect the production `<project>.pages.dev` hostname to `https://write-urdu.com` with path/query preservation.
5. Test a deep `.html` URL and trailing-slash URL. Each should reach the apex extensionless URL without avoidable redirect chains.
6. Check CDN/WAF rules do not block Googlebot, OAI-SearchBot, PerplexityBot, Bingbot, ClaudeBot or Claude-SearchBot.
7. Confirm the homepage, Roman Urdu guide, Urdu Alphabet, Documentation, About and Privacy pages return successful responses on canonical apex without a challenge, login or interstitial.

## Search engines

1. Keep a Google Search Console **Domain property** for `write-urdu.com` so both `www` and apex history remain visible.
2. Submit `https://write-urdu.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
3. Inspect apex versions of `/`, `/urdu-keyboard`, `/urdu-editor`, `/roman-urdu-transliteration`, `/urdu-alphabet`, `/write-urdu-documentation` and `/why-write-urdu` after deployment.
4. Confirm Google's selected canonical resolves to the apex URL.
5. Request recrawls for materially changed high-value apex pages after the migration release.
6. Monitor duplicate canonical, redirect, crawled-not-indexed and excluded states while `www`, `.html` and trailing-slash variants consolidate.
7. Do not block `www` in robots.txt or use Search Console removals as a canonicalization shortcut; crawlers need to observe the permanent redirects.

## Structured data and entity checks

1. Run Google's Rich Results Test on apex versions of `/`, `/urdu-keyboard`, `/urdu-editor`, `/write-urdu-documentation`, `/roman-urdu-transliteration` and `/urdu-alphabet`.
2. Run Schema.org Validator on the same pages.
3. Confirm the homepage graph contains one canonical `WebSite`, one `Organization` publisher and one `WebApplication` main entity.
4. Confirm `WebSite.name` is `Write Urdu` and its URL is `https://write-urdu.com/`.
5. Confirm Organization URLs, logo URLs, breadcrumbs and page entity IDs use the apex origin.
6. On guide pages, confirm `Article` dates match visible/repository revision dates and no unsupported individual byline is claimed.
7. FAQ structured data must match visible questions and answers.

## LLM and crawler discovery

1. Open `https://write-urdu.com/llms.txt` and confirm it is publicly accessible and contains apex first-party links.
2. Verify the file describes transliteration accurately and links to About, Privacy and Feedback.
3. Confirm `OAI-SearchBot` is allowed in `robots.txt` and `GPTBot` remains deliberately blocked unless product policy changes.
4. Confirm Cloudflare bot/WAF rules do not contradict `robots.txt`.
5. Treat `llms.txt` as an auxiliary discovery aid, not a replacement for crawlable HTML, sitemap coverage, internal links, authority or structured data.

## Search Console opportunity tracking

The homepage remains the primary owner for broad `urdu typing` and `urdu writing` intent unless Search Console evidence supports a deliberate split.

Record weekly:

- query;
- clicks;
- impressions;
- CTR;
- average position;
- ranking URL;
- host (`www` vs apex) during consolidation;
- device;
- country when materially different.

Priority query baseline from the supplied Search Console export:

- `urdu typing` — 7,162 impressions, position 7.21, CTR 1.79%;
- `urdu writing` — 3,705 impressions, position 6.48, CTR 1.30%.

Canonical-host historical baseline (16 July–4 August 2026):

- homepage: about 3,894 clicks on `www` vs 1,176 on apex;
- exported page set: about 4,478 clicks on `www` vs 1,376 on apex.

Use the combined host visibility as the migration baseline. The desired result is consolidation without losing aggregate search demand previously distributed across both hosts.

## Search snippet and citation review

1. Check the rendered apex homepage title/description after recrawl.
2. Compare mobile and desktop CTR before judging metadata changes.
3. Test a small stable set of non-branded discovery questions in major search/answer products and record whether Write Urdu is surfaced or cited.
4. When a guide is cited, verify its answer is supported by visible page content and routes users naturally into the relevant tool.

## IndexNow (optional)

Set `INDEXNOW_ENABLED=true` and a deployment-provided `INDEXNOW_KEY`, publish `/{key}.txt` containing the key, then run `npm run seo:indexnow -- /changed-route`. Submission failures are warnings by design.

## Evidence to record

Record mobile Lighthouse or PageSpeed Insights results for `/`, `/urdu-editor`, `/urdu-keyboard`, `/urdu-card-studio` and `/qr-code-generator`. Search Console is the source of truth for search performance; manual rank checks are directional only.
