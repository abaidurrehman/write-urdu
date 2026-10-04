# WU-SEO-CTR-001A A0/A1 baseline — 2026-10-04

**Status:** A0 partial; A1 defect confirmed; traffic-facing route changes blocked

**Search Console window:** 2026-07-16 through 2026-09-29

**Search type:** Web

**Production origin checked:** `https://write-urdu.com`

## Decision summary

- Do not start A2–A7 traffic-facing changes yet. The supplied Search Console export does not contain query-by-page or host-by-date rows, so it cannot prove query ownership or host decay.
- Repair the verified `www` authority defect first. HTTPS `www` currently serves duplicate `200` pages instead of permanently redirecting to the apex host.
- Preserve current page metadata and route ownership during the host repair. Homepage, Stylish Urdu Text Generator and Urdu Editor are protected winners.

## Dated release baseline

The unfiltered daily export contains 690,234 impressions and 25,626 clicks across 76 days. The 2026-09-26 row contains 26,039 impressions and 347 clicks and is excluded from comparisons as the declared outlier. The resulting baseline contains 664,195 impressions and 25,279 clicks across 75 days.

The 33 days before the discontinuity, 2026-07-16 through 2026-08-17, average 5,711 impressions and 306 clicks per day. The comparable 33-day period from 2026-08-20 through 2026-09-21 averages 11,418 impressions and 357 clicks per day. These periods deliberately omit 2026-08-18 and 2026-08-19.

Relevant releases around the discontinuity include:

- 2026-08-18: multiple V2 workspace, navigation, toolbar and public-sharing releases;
- 2026-08-19: PR #79 aligned homepage and related acquisition language with Search Console intent, alongside mobile UI and footer releases;
- 2026-08-20: account documents, voice discovery and growth entry-point releases.

This release density is a confounder. The aggregate daily export cannot attribute the impression increase to one release.

## Aggregate host baseline

The Pages export is aggregate, not dated. It reports:

| Host | Clicks | Impressions | Share of page-export clicks | Share of page-export impressions |
| --- | ---: | ---: | ---: | ---: |
| `write-urdu.com` | 20,901 | 640,270 | 80.9% | 85.9% |
| `www.write-urdu.com` | 4,946 | 105,172 | 19.1% | 14.1% |
| other historical subdomains | 0 | 2 | 0.0% | 0.0% |

Priority split examples:

| Route | Apex clicks / impressions | `www` clicks / impressions |
| --- | ---: | ---: |
| `/` | 12,411 / 389,601 | 4,150 / 86,686 |
| `/urdu-editor` | 2,796 / 42,749 | 753 / 12,956 |
| `/urdu-keyboard` | 62 / 6,489 | 9 / 1,630 |
| `/roman-urdu-transliteration` | 120 / 45,493 | 0 / 26 |
| `/stylish-urdu-text-generator` | 3,459 / 35,367 | 0 / 92 |

These totals prove material historical `www` ownership but cannot classify it as decaying, stable or growing.

## Live A1 verification

`npm run seo:live` was run against `/`, `/roman-urdu-transliteration`, `/urdu-keyboard`, `/tools/inpage-unicode-converter`, `/stylish-urdu-text-generator` and `/urdu-editor`.

Passed:

- all six apex URLs returned `200` and declared exact apex self-canonicals;
- HTTP apex permanently redirected to HTTPS apex;
- checked `.html` and trailing-slash editor variants permanently redirected to clean apex URLs;
- an unknown apex path remained `404`.

Failed:

- all six HTTPS `www` URLs returned `200` instead of `301` or `308`;
- HTTP `www` redirected to HTTPS `www`, creating a second canonicalization hop once the host redirect is added;
- an unknown `www` path returned `404` instead of redirecting to the same missing apex path.

The production Pages alias was not checked because its origin was not supplied.

The redirect rule was not changed during this run. Wrangler is authenticated, but the current OAuth grant has zone read access and the Rulesets API returned Cloudflare error `10000` (`Authentication error`). Applying the repair requires a grant with `Zone > Single Redirect > Edit` or an authenticated dashboard change.

## Required repair

Create one zone-level Cloudflare Single Redirect before changing any route metadata:

```text
Match:    (http.host eq "www.write-urdu.com")
Target:   concat("https://write-urdu.com", http.request.uri.path)
Status:   301
Query:    preserve
```

Cloudflare requires `www` traffic to remain proxied for the rule to execute. Use the `http_request_dynamic_redirect` phase and keep path and query string unchanged. Current configuration syntax is documented in [Cloudflare Single Redirects](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/create-api/).

After activation, rerun:

```powershell
$env:CANONICAL_AUDIT_PATHS='/,/roman-urdu-transliteration,/urdu-keyboard,/tools/inpage-unicode-converter,/stylish-urdu-text-generator,/urdu-editor'
npm run seo:live
```

Keep the rule only if every `www` request becomes a one-hop permanent redirect to the same apex path and query, apex pages remain `200`, and missing paths remain missing after redirection. Disable the rule if it changes paths, drops queries, creates loops or sends missing URLs to the homepage.

## Missing A0 exports

Complete A0 with Search Console API rows or filtered UI exports containing:

1. `date,page` for apex versus `www` trend classification;
2. `query,page` for `/` and `/roman-urdu-transliteration`, especially `english to urdu typing`;
3. `query,page` for `urdu typing`, `urdu writing` and `urdu typing online`;
4. `query,page` for `online inpage`, `inpage online` and related variants;
5. `query,page` for keyboard queries and both host variants.

Store aggregate results only. Do not commit raw full query strings, authentication material, identity or IP data.
