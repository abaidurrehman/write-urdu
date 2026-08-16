# P0 SEO — Canonical Host Consolidation

**Status:** Step 3 repository migration complete; awaiting controlled deployment
**Started:** 2026-08-16
**Permanent canonical target:** `https://write-urdu.com`
**Host to consolidate:** `https://www.write-urdu.com`

## Decision

Write Urdu will use the apex host, `https://write-urdu.com`, as its permanent canonical origin.

This is a deliberate long-term product and brand decision, not a claim that apex domains rank better than `www`. Historical Search Console evidence previously favored `www`, while the 16 August Cloudflare host view shows substantial usage of both hosts. The decision is to perform one controlled migration now rather than consolidate to `www` and migrate again later.

**The direction is frozen: `www → apex`.** Do not reverse it because of normal short-term migration volatility.

## Current transition state

- Decision state: **apex is permanent**.
- Repository migration branch: **all active canonical/discovery signals now use apex**.
- Repository release gate: **passed** (`seo:generate`, `seo:sync-heads`, `seo:check`, `governance:check`, `npm test`).
- Production/main: **still unchanged until this PR is deliberately merged/deployed**.
- Cloudflare hostname redirect: **not changed yet**.

This separation prevents a half-migration where edge redirects and page-level canonical signals disagree.

## Safety rules

1. Do not change page content, navigation architecture or primary keyword targeting as part of this migration.
2. Do not use `noindex`, `robots.txt` blocking, JavaScript redirects or Search Console removals as substitutes for the permanent hostname redirect.
3. Do not remove either custom domain during migration.
4. Never redirect arbitrary missing URLs to the homepage.
5. Preserve path and query string exactly.
6. Use a permanent `301` or `308`, never `302`/`307`.
7. Keep `seo.config.js` as the canonical-host source of truth.
8. Keep both host families observable in Search Console during consolidation.
9. Do not combine the host migration with another major SEO or product release.
10. Once technically verified, keep the `www → apex` redirect long-lived.

## Step 1 — Decision and migration guardrails — COMPLETE

- [x] Confirm both hosts receive meaningful traffic.
- [x] Review the previous `www` decision and its historical Search Console evidence.
- [x] Choose `https://write-urdu.com` as the permanent canonical host.
- [x] Expand the live canonical audit to every indexable route by default.
- [x] Make the audit direction-agnostic from `seo.config.js`.
- [x] Add same-path/query and missing-route protections.

**Production traffic change:** none.

## Step 2 — Read-only production baseline — COMPLETE EXCEPT PAGES ALIAS

The pre-migration production checks established:

- current `www` priority pages return healthy `200` responses;
- `robots.txt`, `sitemap.xml`, `llms.txt`, `security.txt` and `ads.txt` are healthy on the current production host;
- `http://www.write-urdu.com/...` redirects to HTTPS `www`;
- legacy `.html` and trailing-slash routes normalize correctly on the current host;
- apex still serves representative indexable `200` copies;
- `http://write-urdu.com/...` currently redirects to HTTPS apex;
- the production `pages.dev` alias remains an explicit follow-up check.

## Step 3 — Atomic repository canonical migration — COMPLETE

The validated migration commit changes the repository coherently to apex:

- `seo.config.js` now uses `SITE_ORIGIN = 'https://write-urdu.com'`;
- HTML canonical links use apex;
- `og:url` and first-party Open Graph images use apex;
- JSON-LD identity URLs use apex;
- `sitemap.xml` uses apex URLs;
- `robots.txt` declares the apex sitemap;
- `llms.txt` uses apex first-party links;
- `.well-known/security.txt` uses the apex Canonical URL;
- deliberate absolute first-party links use apex;
- `.htaccess` fallback normalization points to apex;
- SEO, shell and production assertions were migrated to the new canonical contract;
- active Cloudflare/SEO runbooks were aligned.

Required gate passed before the migration commit was written:

```bash
npm run seo:generate
npm run seo:sync-heads
npm run seo:check
npm run governance:check
npm test
```

No active non-document canonical signal remained pointed at `https://www.write-urdu.com` when the gate completed.

## Step 4 — Deploy apex canonical signals before the hostname redirect — NEXT

Merge/deploy the repository migration first while both hosts remain reachable.

Verify production before changing the Cloudflare hostname rule:

- `https://write-urdu.com/` and priority apex routes return `200`;
- apex pages self-canonicalize to apex;
- sitemap and robots declare apex URLs;
- `www` pages, during this short transition, expose canonical tags pointing to the corresponding apex URLs;
- no functional application regression exists.

This intentionally creates a short safe transition where both hosts can still return `200`, but every page-level canonical signal already points toward the final apex destination.

## Step 5 — Cloudflare edge switch: www → apex

Create one zone-level Single Redirect matching:

```text
(http.host eq "www.write-urdu.com")
```

Dynamic target:

```text
concat("https://write-urdu.com", http.request.uri.path)
```

Required settings:

- status `301` (or deliberately standardized `308`);
- preserve query string;
- preserve exact path;
- no homepage catch-all remapping.

Keep both hostnames attached for DNS/TLS continuity. Hostname normalization belongs at the Cloudflare zone edge, not in Pages `_redirects`.

Expected final behavior:

```text
https://www.write-urdu.com/page?x=1
        -> 301
https://write-urdu.com/page?x=1
        -> 200, self-canonical
```

HTTP variants should converge directly to HTTPS apex without avoidable chains.

## Step 6 — Immediate post-switch verification

Run:

```bash
npm run seo:live
npm run seo:production
```

Accept the switch only when:

- every `www` indexable URL permanently redirects to the same apex path;
- query strings are preserved;
- canonical apex pages return `200` and self-canonicalize;
- HTTP variants converge on HTTPS apex;
- legacy `.html` and trailing-slash normalization still works;
- a nonexistent `www` URL maps to the same nonexistent apex path and remains `404`;
- no redirect loops or avoidable chains exist;
- the production `pages.dev` alias is redirected to apex or otherwise prevented from becoming another indexable production origin.

## Step 7 — Search Console consolidation monitoring

- keep a Domain property covering both host families;
- submit only `https://write-urdu.com/sitemap.xml` after deployment;
- inspect the highest-value apex pages;
- monitor clicks/impressions by page and host weekly;
- expect old `www` URLs to remain visible while recrawling and redirect processing occurs;
- judge success on combined host visibility and query/page ownership, not one or two days of volatility.

## Stop conditions

Do not enable the Cloudflare `www → apex` redirect if:

- apex priority pages are not healthy `200` responses;
- apex pages do not self-canonicalize;
- sitemap or robots still point to `www`;
- material JSON-LD, Open Graph or internal absolute URLs still use `www` as canonical identity;
- route normalization creates a loop;
- important `www` paths do not have valid same-path apex destinations;
- the production Pages alias conflicts with the final canonical host;
- the repository quality gate is red for migration-related reasons.

## Rollback policy

Before the edge redirect is enabled, rollback is a repository revert to the last known-good `www` canonical release.

After the redirect is enabled, a genuine functional incident requires disabling the `www → apex` rule and reverting the canonical-signal release together. Never leave redirects pointing one way while page canonicals point the other.

Once technically verified, the apex decision is permanent.

## Completion definition

This P0 completes only when `write-urdu.com` is the sole indexable canonical production origin, `www` redirects one-to-one to apex, the Pages alias is controlled, live checks pass, and Search Console monitoring is in place.
