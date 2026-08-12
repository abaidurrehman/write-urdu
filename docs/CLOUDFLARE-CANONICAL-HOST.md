# Cloudflare canonical host contract

**Canonical production origin:** `https://www.write-urdu.com`

This is an SEO and infrastructure contract. Every public production URL must converge on the HTTPS `www` host while preserving its path and query string. Static HTML canonicals, `og:url`, JSON-LD, sitemap URLs, crawler-discovery files and deliberate absolute internal URLs must use the same origin.

## Decision record

The canonical host is `www` because this is the historically established search URL family for the mature Write Urdu domain, not because `www` is inherently better than an apex domain.

Evidence used for the decision:

- the supplied Google Search Console baseline for **16 July–4 August 2026** showed the homepage receiving about **3,894 clicks on `www` vs 1,176 on the apex**;
- across the exported page set, `www` carried about **4,478 clicks vs 1,376 on the apex**;
- the July SEO implementation specification explicitly selected `https://www.write-urdu.com` because the site's search presence strongly used `www`;
- current search discovery still surfaces many established `www` URLs.

Changing a mature site from `www` to apex would therefore be a genuine site-wide host migration with no product benefit. The safer remediation is to keep the historically stronger host and consolidate the duplicate apex URLs into it.

**Do not flip this decision merely for URL aesthetics.** Revisit it only if fresh Search Console and backlink evidence clearly supports a deliberate migration and that migration is planned as such.

## Root cause of the split

The site has been reachable on both `www.write-urdu.com` and `write-urdu.com`. The repository also previously attempted a hostname redirect inside Cloudflare Pages `_redirects`.

Cloudflare Pages `_redirects` supports path redirects, not domain-level source redirects. Host/protocol normalization therefore belongs in Cloudflare's zone-level Redirect Rules/Bulk Redirects, while `_redirects` remains responsible for legacy `.html` and trailing-slash normalization.

The correct layers are:

1. **Cloudflare zone edge:** apex → `www` and HTTP → HTTPS.
2. **Cloudflare Pages `_redirects`:** `.html`, legacy alias and trailing-slash normalization.
3. **HTML + discovery files:** self-canonical `www` URLs.
4. **Pages alias control:** production `<project>.pages.dev` → `www` custom domain, with `noindex` as defense in depth.

## Required Cloudflare production configuration

### 1. Keep `www` as a Pages custom domain

In **Workers & Pages → Write Urdu project → Custom domains**, confirm `www.write-urdu.com` is attached and healthy. Because it already serves production traffic, do not remove it while making this change.

The apex may remain attached to the Pages project for DNS/TLS continuity; the zone redirect below must prevent it from serving a `200` copy to visitors or crawlers.

### 2. Create one apex → www Single Redirect

In **Cloudflare Dashboard → Rules → Redirect Rules → Single Redirects**, create a rule such as:

**When incoming requests match**

```text
(http.host eq "write-urdu.com")
```

**Then**

- Type: Dynamic
- Target expression:

```text
concat("https://www.write-urdu.com", http.request.uri.path)
```

- Status code: `301`
- Preserve query string: **Enabled**

This expression handles both HTTP and HTTPS requests for the apex and preserves the exact path. With query preservation enabled it should produce, in one hop:

```text
https://write-urdu.com/                       → https://www.write-urdu.com/
https://write-urdu.com/urdu-editor            → https://www.write-urdu.com/urdu-editor
https://write-urdu.com/urdu-editor?ref=x      → https://www.write-urdu.com/urdu-editor?ref=x
http://write-urdu.com/urdu-editor             → https://www.write-urdu.com/urdu-editor
```

Use `301` (or `308` if deliberately standardized on 308), never a temporary 302/307, for canonical-host consolidation.

### 3. Keep HTTP → HTTPS for the canonical www host

Keep **SSL/TLS → Edge Certificates → Always Use HTTPS** enabled, or an equivalent permanent redirect, so:

```text
http://www.write-urdu.com/path → https://www.write-urdu.com/path
```

The apex Single Redirect already sends both HTTP and HTTPS apex traffic directly to HTTPS `www`, avoiding an apex redirect chain.

### 4. Do not put hostname redirects in Pages `_redirects`

The root `_redirects` file must contain path-only rules such as:

```text
/urdu-editor.html /urdu-editor 301
/urdu-editor/ /urdu-editor 301
```

Do not add either of these patterns:

```text
https://write-urdu.com/* ...
https://www.write-urdu.com/* ...
```

`npm run seo:check` intentionally rejects hostname-level `_redirects` sources.

### 5. Redirect the production Pages alias

Find the production Pages hostname, for example `<project>.pages.dev`, and create a Cloudflare Bulk Redirect:

| Setting | Value |
| --- | --- |
| Source URL | `<project>.pages.dev` |
| Target URL | `https://www.write-urdu.com` |
| Status | `301` |
| Preserve query string | enabled |
| Subpath matching | enabled |
| Preserve path suffix | enabled |
| Include subdomains | enabled |

Cloudflare preview deployments receive `X-Robots-Tag: noindex` by default. The repository also ships `_headers` coverage for Pages aliases as defense in depth. The production `pages.dev` hostname should still redirect because a permanent redirect is the stronger consolidation behavior and avoids another usable production origin.

## URL policy

| Variant | Required behavior |
| --- | --- |
| `https://www.write-urdu.com/page` | `200`, self-canonical |
| `https://write-urdu.com/page` | `301/308` to `https://www.write-urdu.com/page` |
| `http://write-urdu.com/page` | `301/308` directly to HTTPS `www` |
| `http://www.write-urdu.com/page` | `301/308` to HTTPS `www` |
| `https://www.write-urdu.com/page.html` | `301/308` to `/page` |
| `https://www.write-urdu.com/page/` | `301/308` to `/page` |
| `<project>.pages.dev/page` | `301/308` to canonical `www` same path/query |
| preview `*.pages.dev` | `noindex` at minimum |
| tracking/query URL on canonical host | may return `200`; HTML canonical remains query-free |

Do not use `robots.txt`, `noindex`, Search Console removals or JavaScript redirects as substitutes for the permanent apex → `www` redirect. Google needs to crawl the old/alternate URLs and see the redirect in order to consolidate signals.

## Repository controls

The source of truth is:

```js
SITE_ORIGIN = 'https://www.write-urdu.com'
```

`npm run seo:check` verifies the static SEO contract, including canonicals, `og:url`, sitemap host, robots sitemap declaration, legacy path redirects and Pages alias protection.

`npm run seo:live` verifies deployed behavior. Set the production Pages alias when known:

```bash
PAGES_DEV_ORIGIN=https://<project>.pages.dev npm run seo:live
```

The live audit checks representative canonical pages, apex → `www`, HTTP normalization, query preservation, `.html` redirects and trailing-slash redirects.

## Search Console recovery procedure

After the Cloudflare edge rule is live:

1. Keep a **Domain property** for `write-urdu.com` so both host families remain visible in one property.
2. Submit only `https://www.write-urdu.com/sitemap.xml`.
3. Inspect `https://www.write-urdu.com/`, `/urdu-editor`, `/urdu-keyboard`, `/roman-urdu-transliteration`, `/write-urdu-documentation` and `/why-write-urdu`.
4. Confirm the user-declared and Google-selected canonical both resolve to the `www` URL.
5. Request recrawling of the highest-value canonical `www` pages after deployment.
6. Monitor Page Indexing for apex, `.html` and trailing-slash variants moving to redirect/alternate states.
7. Do not block apex URLs in `robots.txt` and do not use temporary removals merely to accelerate canonicalization.
8. Track clicks/impressions by page and host weekly until the apex share approaches zero and the `www` pages retain/recover their aggregate visibility.

Do not interpret old apex URLs remaining in reports for a while as a failed migration. Search engines need recrawls to process permanent redirects and canonical changes.

## Release verification matrix

Run after every domain/routing change:

```bash
curl -I 'https://www.write-urdu.com/'
curl -I 'https://write-urdu.com/'
curl -I 'https://write-urdu.com/urdu-editor?canonical_audit=1'
curl -I 'http://write-urdu.com/urdu-editor'
curl -I 'http://www.write-urdu.com/urdu-editor'
curl -I 'https://www.write-urdu.com/urdu-editor.html'
curl -I 'https://www.write-urdu.com/urdu-editor/'
curl -I 'https://<project>.pages.dev/urdu-editor'
```

Then:

```bash
npm run seo:check
PAGES_DEV_ORIGIN=https://<project>.pages.dev npm run seo:live
```

A release is not complete if the apex or production Pages alias still serves a `200` copy of an indexable page.
