# WU-SEO-AUTHORITY-001 — Existing-Demand SEO, Authority and Citation Readiness

**Status:** Implementation slice  
**Date:** 2026-08-07  
**Primary owner:** Homepage `/` for broad Urdu typing and writing intent

## Outcome

Strengthen Write Urdu's existing organic opportunity and machine-readable authority without creating doorway pages, inventing trust claims, exposing internal SEO strategy in public copy, or weakening the writing experience.

Priority Search Console baseline:

- `urdu typing` — 7,162 impressions, average position 7.21, CTR 1.79%
- `urdu writing` — 3,705 impressions, average position 6.48, CTR 1.30%

The homepage remains the broad intent owner unless Search Console shows a deliberate reason to change ownership.

## Product truth before markup

Authority signals must describe facts that a visitor can verify on the public site.

Write Urdu may state that:

- it provides browser-based Urdu writing tools;
- Roman Urdu input is transliteration into Urdu script, not translation;
- the core editors do not require an account;
- direct Urdu keyboard input is available;
- formatted document and export workflows are available;
- some local drafts and creation workflows use browser-side storage or processing;
- the privacy policy describes the external transliteration provider and other processing;
- an independent project maintains the product and provides a public correction/feedback channel.

Do not add unverified founder identity, addresses, awards, customer counts, ratings, reviews, press logos, social `sameAs` profiles or claims of guaranteed ranking, indexing, citation or recommendation.

## Search opportunity

The search-facing homepage metadata should lead with the task already earning impressions:

- `Urdu Typing Online`
- writing Urdu using English letters
- Roman Urdu to Urdu script
- Urdu writing online
- direct Urdu keyboard

These phrases must describe the real product rather than appear as a keyword list. Supporting guides should answer narrower questions and route readers back to the relevant writing workflow.

## Entity and structured-data model

Use one stable graph rooted at canonical identifiers:

- `https://write-urdu.com/#website` — `WebSite`
- `https://write-urdu.com/#publisher` — `Organization`
- `{canonical}#webpage` — page-level `WebPage` or `AboutPage`
- `{canonical}#application` — `WebApplication` for tools
- `{canonical}#article` — `Article` for maintained guides
- `{canonical}#breadcrumbs` — `BreadcrumbList` on non-home pages

The Organization should expose only verified public facts: name, alternate brand spelling, canonical URL, logo, description, languages, correction/contact channel and publishing/correction policy.

Article pages should carry truthful revision dates, Organization author/publisher identity, canonical URL and publishing principles. FAQ markup must match visible FAQ content and is semantic markup, not a promise of a Google FAQ rich result.

## llms.txt role

`/llms.txt` is a curated machine-readable map, not an indexing shortcut. It should:

- identify the product and canonical domain;
- state important interpretation facts before the link sections;
- distinguish transliteration from translation;
- identify the main writing workflows;
- link to maintained guides;
- link to About, Privacy and Feedback;
- use canonical HTTPS URLs;
- place secondary creative tools in an Optional section;
- carry a visible review date.

Do not treat `llms.txt` as a substitute for crawlable HTML, internal links, sitemaps, robots policy, structured data, authority or Search Console measurement.

## Crawler policy

Keep search-discovery crawlers accessible while maintaining the deliberate training choice already documented in `robots.txt`:

- Googlebot — allowed
- Bingbot — allowed
- OAI-SearchBot — allowed
- PerplexityBot — allowed
- ClaudeBot / Claude-SearchBot — allowed
- GPTBot — blocked for training

Cloudflare WAF/bot settings must not silently contradict the public robots policy.

## Trust surfaces

The public trust chain is:

Homepage → About → editorial/correction policy → Feedback → Privacy

Guides should identify useful revision dates where appropriate and link naturally to the tool that performs the task they explain.

## Measurement

Record weekly for `urdu typing` and `urdu writing`:

- clicks;
- impressions;
- CTR;
- average position;
- ranking URL;
- device;
- country when materially different.

Watch specifically for supporting guides replacing `/` as the broad-query ranking URL. That is a possible cannibalization signal and requires intent review before celebrating the ranking movement.

## Release gates

- Search-facing homepage title remains factual and task-led.
- Homepage broad intent ownership remains explicit in repository governance.
- `llms.txt` follows the proposal's Markdown structure and links only to canonical public resources.
- Organization/WebSite/WebPage/Application/Article relationships use stable `@id` values.
- Contact and publishing-principles links resolve to public Write Urdu pages.
- No invented `sameAs`, review, rating, award, founder or customer claims.
- Sitemap revision dates match materially changed pages.
- `npm test`, `npm run seo:check` and `npm run governance:check` pass.
- Cloudflare preview serves `llms.txt`, sitemap and changed pages without a bot challenge.
- Post-deploy validation includes Rich Results Test, Schema.org Validator and Search Console inspection.
