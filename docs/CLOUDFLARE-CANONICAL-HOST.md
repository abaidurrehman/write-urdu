# Cloudflare canonical host contract

**Canonical production origin:** `https://write-urdu.com`

This is an infrastructure contract, not a content preference. Every public production URL must converge on the HTTPS apex host while preserving its path and query string. Static HTML, `og:url`, JSON-LD, the sitemap and internal navigation should all point directly at that same URL family.

## Why this exists

The repository previously attempted to redirect `https://www.write-urdu.com/*` inside the Cloudflare Pages `_redirects` file. Cloudflare Pages only supports path sources in `_redirects`; domain-level redirect sources are not supported and can be ignored. That left `www.write-urdu.com` capable of serving the same Pages content as the apex host even though page-level canonical tags pointed at the apex.

The correct architecture is:

1. **Cloudflare zone edge:** normalize protocol and hostname.
2. **Cloudflare Pages `_redirects`:** normalize legacy paths such as `.html` and trailing slashes.
3. **HTML and discovery files:** self-canonicalize to the apex extensionless URL.
4. **Cloudflare Pages aliases:** redirect the production `*.pages.dev` hostname to the custom domain; keep `X-Robots-Tag: noindex` as defense in depth.

Do not reintroduce a hostname source into `_redirects`. `npm run seo:check` intentionally rejects it.

## Required Cloudflare production configuration

### 1. Keep the apex domain attached to Pages

In **Workers & Pages → Write Urdu project → Custom domains**, `write-urdu.com` must remain the production custom domain.

The `www` hostname must not be treated as an independent content origin. It exists only to receive a permanent redirect.

### 2. Create the www → apex Bulk Redirect

In **Cloudflare Dashboard → Bulk Redirects**, create a list entry with:

| Setting | Value |
| --- | --- |
| Source URL | `www.write-urdu.com` |
| Target URL | `https://write-urdu.com` |
| Status | `301` |
| Preserve query string | enabled |
| Subpath matching | enabled |
| Preserve path suffix | enabled |
| Include subdomains | enabled |

Create and enable a Bulk Redirect rule using that list.

This must produce mappings such as:

- `https://www.write-urdu.com/` → `https://write-urdu.com/`
- `https://www.write-urdu.com/urdu-editor` → `https://write-urdu.com/urdu-editor`
- `https://www.write-urdu.com/urdu-editor?ref=x` → `https://write-urdu.com/urdu-editor?ref=x`

Use a permanent `301` or `308`, never `302`/`307`, for this canonical-host rule.

### 3. Make www redirect-only at DNS

Cloudflare's Pages guidance for a `www` → apex redirect uses a proxied placeholder DNS record:

| Type | Name | IPv4 address | Proxy status |
| --- | --- | --- | --- |
| `A` | `www` | `192.0.2.1` | Proxied |

If `www` currently points directly at the Pages project, first create and enable the Bulk Redirect rule, then replace the `www` Pages DNS record with the redirect-only proxied record. If `www` remains listed as a Pages custom domain after the DNS change, remove that alternate custom-domain attachment after confirming the redirect is active. **Do not remove the apex Pages custom domain.**

The placeholder address is never intended to receive origin traffic; the Cloudflare redirect executes at the edge first.

### 4. Keep HTTP → HTTPS enabled

The apex and alternate host must never serve indexable HTTP content. Keep **SSL/TLS → Edge Certificates → Always Use HTTPS** enabled, or maintain an equivalent permanent zone-level redirect.

The preferred result is one hop:

- `http://write-urdu.com/path` → `https://write-urdu.com/path`
- `http://www.write-urdu.com/path` → `https://write-urdu.com/path`

Avoid chains such as HTTP → HTTPS www → HTTPS apex for normal canonical routes.

### 5. Redirect the production Pages alias

Find the project's production hostname in **Workers & Pages**, for example `<project>.pages.dev`. Add another Bulk Redirect entry:

| Setting | Value |
| --- | --- |
| Source URL | `<project>.pages.dev` |
| Target URL | `https://write-urdu.com` |
| Status | `301` |
| Preserve query string | enabled |
| Subpath matching | enabled |
| Preserve path suffix | enabled |
| Include subdomains | enabled |

Cloudflare preview deployments already receive `X-Robots-Tag: noindex` by default. The repository also ships `_headers` rules that apply `noindex` to Pages-owned aliases as defense in depth. The production `pages.dev` alias should still redirect because a redirect is the stronger consolidation signal and avoids a second publicly usable production origin.

## URL policy

| Variant | Required behavior |
| --- | --- |
| `https://write-urdu.com/page` | `200`, self-canonical |
| `https://www.write-urdu.com/page` | permanent redirect to apex same path/query |
| `http://write-urdu.com/page` | permanent redirect to HTTPS apex |
| `http://www.write-urdu.com/page` | permanent redirect to HTTPS apex |
| `https://write-urdu.com/page.html` | permanent redirect to `/page` |
| `https://write-urdu.com/page/` | permanent redirect to `/page` |
| `<project>.pages.dev/page` | permanent redirect to apex same path/query |
| preview `*.pages.dev` deployment | `noindex` at minimum; preferably access-restricted when practical |
| tracking/query URL on apex | may return `200`, but HTML canonical remains query-free |

Do not use `robots.txt`, `noindex`, the Search Console removal tool or JavaScript redirects to replace the permanent host redirect. They solve different problems and can interfere with signal consolidation.

## Repository controls

The canonical host is centralized in `seo.config.js` as `SITE_ORIGIN = 'https://write-urdu.com'`.

`npm run seo:check` verifies:

- the canonical origin cannot drift from the apex HTTPS origin;
- every HTML page has one matching self-canonical;
- every `og:url` matches its canonical;
- sitemap URLs use the canonical host and clean paths;
- the robots sitemap declaration uses the canonical host;
- Pages `_redirects` contains path-only permanent legacy redirects;
- hostname redirect rules are not placed in `_redirects`;
- the Pages alias `noindex` defense exists in `_headers`.

`npm run seo:live` verifies the actual deployed behavior. Set `PAGES_DEV_ORIGIN` to the real production Pages alias to include that host:

```bash
PAGES_DEV_ORIGIN=https://<project>.pages.dev npm run seo:live
```

The live audit checks representative canonical pages, HTTPS/HTTP host normalization, query preservation, `.html` redirects and trailing-slash redirects.

## Post-fix Google Search Console procedure

After the zone-level redirect is live:

1. Keep or add a **Domain property** for `write-urdu.com` so both apex and `www` history can be inspected together.
2. Submit only `https://write-urdu.com/sitemap.xml`.
3. Inspect representative apex URLs: `/`, `/urdu-editor`, `/urdu-keyboard`, `/roman-urdu-transliteration`, `/write-urdu-documentation` and `/why-write-urdu`.
4. Confirm Google's selected canonical is the apex URL.
5. Request indexing for the important apex URLs after the redirect deployment.
6. Monitor Page Indexing / canonical reports for old `www`, `.html` and trailing-slash variants moving into redirect/alternate states.
7. Do not delete old URLs from Search Console and do not block them in `robots.txt`; Google needs to crawl the permanent redirects in order to process the move.

Search engines may keep old alternate URLs visible for a while after a correct migration. That is not a reason to reverse the redirect. Keep the canonical origin stable and let the signals converge.

## Release verification matrix

Run these after every routing or domain change:

```bash
curl -I 'https://write-urdu.com/'
curl -I 'https://www.write-urdu.com/'
curl -I 'https://www.write-urdu.com/urdu-editor?canonical_audit=1'
curl -I 'http://write-urdu.com/urdu-editor'
curl -I 'http://www.write-urdu.com/urdu-editor'
curl -I 'https://write-urdu.com/urdu-editor.html'
curl -I 'https://write-urdu.com/urdu-editor/'
curl -I 'https://<project>.pages.dev/urdu-editor'
```

Then run:

```bash
npm run seo:check
PAGES_DEV_ORIGIN=https://<project>.pages.dev npm run seo:live
```

A release is not complete if `www` or the production Pages alias still serves a `200` copy of an indexable page.
