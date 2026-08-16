# Cloudflare canonical host contract

**Canonical production origin:** `https://write-urdu.com`

This is the permanent SEO and infrastructure contract for Write Urdu. Every public production URL must converge on the HTTPS apex host while preserving path and query string. Static HTML canonicals, Open Graph URLs, JSON-LD, sitemap URLs, crawler-discovery files and deliberate first-party absolute URLs must use the same origin.

## Decision

On 16 August 2026 the project deliberately selected the apex hostname as the permanent public identity. Historical Search Console evidence had previously favored `www`, but the product decision is to perform one controlled migration now rather than consolidate to `www` and migrate again later. There is no ranking preference inherent in apex versus `www`; consistency is the objective.

## Final routing contract

| Variant | Required behavior |
| --- | --- |
| `https://write-urdu.com/page` | `200`, self-canonical |
| `https://www.write-urdu.com/page` | permanent redirect to same apex path/query |
| `http://write-urdu.com/page` | permanent redirect to HTTPS apex |
| `http://www.write-urdu.com/page` | permanent redirect to HTTPS apex |
| legacy `.html` URL | permanent redirect to extensionless apex route |
| trailing-slash route | permanent redirect to extensionless apex route |
| production `pages.dev` alias | permanent redirect to apex; `noindex` remains defense in depth |

## Cloudflare edge rule

Create a zone-level Single Redirect matching:

```text
(http.host eq "www.write-urdu.com")
```

Dynamic target:

```text
concat("https://write-urdu.com", http.request.uri.path)
```

Use status `301` (or a deliberately standardized `308`) and preserve the query string. Keep both hostnames attached for DNS/TLS continuity. Do not implement hostname normalization in Cloudflare Pages `_redirects`; that file remains path-only.

## Repository source of truth

`seo.config.js` must contain:

```js
SITE_ORIGIN = 'https://write-urdu.com'
```

`npm run seo:check` validates static canonical/discovery consistency. `npm run seo:live` validates deployed hostname behavior.

## Safety rules

- Preserve path and query strings one-to-one.
- Never redirect missing URLs to the homepage.
- Do not block the old `www` host in robots.txt; crawlers need to observe the redirect.
- Do not use `noindex` or Search Console removals as a substitute for the permanent redirect.
- Do not combine this migration with another major SEO or route change.
- Once verified, keep the `www → apex` redirect long-lived.

## Verification

After the edge switch:

```bash
npm run seo:live
npm run seo:production
```

A release is not complete if `www` or the production Pages alias still serves an indexable `200` copy.
