# P0 SEO — Canonical Host Consolidation

**Status:** Step 3 repository migration in progress
**Started:** 2026-08-16
**Permanent canonical target:** `https://write-urdu.com`
**Host to consolidate:** `https://write-urdu.com`

## Decision

Write Urdu will use the apex host, `https://write-urdu.com`, as its permanent canonical origin.

This is a deliberate long-term product and brand decision, not a claim that apex domains rank better than `www`. Search engines can consolidate either form when redirects and canonical signals are consistent.

The decision accepts the following evidence and trade-off:

- historical Search Console evidence from 16 July–4 August 2026 showed the `www` URL family carrying materially more Google Search clicks at that time;
- the current Cloudflare Top Hosts view supplied on 16 August 2026 shows substantial traffic to both hosts, with the apex host receiving materially more requests in that operational view;
- Cloudflare request volume is not equivalent to Google Search traffic, so it is supporting evidence rather than the sole SEO basis;
- `write-urdu.com` is the cleaner permanent brand URL and is the host we want to use consistently for future product, authentication, sharing, structured data and public references;
- if we want apex long term, doing one controlled migration now is preferable to first consolidating into `www` and later migrating a second time.

**This decision is now frozen.** We do not alternate canonical direction in response to short-term ranking or traffic volatility.

## Important transition state

The migration release changes the repository canonical source of truth to `https://write-urdu.com`; production routing remains unchanged until the release is deployed and verified. That remains intentional until the repository-wide canonical signals are changed atomically and validated.

Therefore:

- decision state: **apex is the permanent target**;
- current implementation state: **www remains canonical until the migration release is ready**;
- current production routing: **both hosts still serve indexable `200` copies**;
- no production redirect has been changed yet.

This separation prevents a half-migration where redirects, canonicals and sitemap URLs disagree.

## Safety rules

1. Do not change page content, navigation architecture or primary keyword targeting as part of this migration.
2. Do not use `noindex`, `robots.txt` blocking, JavaScript redirects or Search Console removals as substitutes for the permanent hostname redirect.
3. Do not remove either custom domain during the migration.
4. Do not redirect arbitrary missing URLs to the homepage.
5. Preserve path and query string exactly.
6. Use a permanent `301` or `308`, never `302`/`307`.
7. Keep the canonical-host source of truth centralized in `seo.config.js`.
8. Keep both host families observable in Search Console during consolidation.
9. Do not combine the host migration with another major Write Urdu SEO or product release.
10. Do not reverse the canonical direction after launch unless there is an actual technical incident requiring rollback.

## Execution sequence

### Step 1 — Decision and migration guardrails — COMPLETE

- [x] Confirm both hosts are receiving meaningful traffic.
- [x] Review the previous repository decision that favored `www`.
- [x] Explicitly choose `https://write-urdu.com` as the permanent canonical host.
- [x] Strengthen `scripts/check-live-canonical.js` so the default live audit covers every indexable route.
- [x] Make the live canonical audit direction-agnostic so it follows `seo.config.js` rather than hard-coding `www` or apex.
- [x] Add a missing-route check so an unknown alternate-host path must map to the same unknown canonical path and remain a real `404`.

**Production traffic change in Step 1:** none.

### Step 2 — Read-only production baseline — COMPLETE EXCEPT PAGES ALIAS

A production verification run on 15 August 2026 repeatedly confirmed the pre-migration state from a GitHub-hosted runner:

- current canonical `www` priority pages return `200`;
- `robots.txt`, `sitemap.xml`, `llms.txt`, `security.txt` and `ads.txt` on `www` return `200` and pass the existing production SEO assertions;
- `http://write-urdu.com/...` permanently redirects to HTTPS `www` correctly;
- legacy `/index.html`, `.html` routes and trailing-slash routes on `www` normalize correctly;
- the apex host still serves `200` copies for representative high-value routes;
- `http://write-urdu.com/...` currently redirects only to HTTPS apex;
- the production `pages.dev` alias was not configured in the live audit environment, so that origin remains an explicit follow-up check.

This baseline proves the application is healthy and isolates the issue to canonical-host consolidation.

### Step 3 — Atomic repository canonical migration — IN PROGRESS

Change the repository from `www` to apex as one coherent release. The release must update, regenerate or validate all relevant signals together:

- `seo.config.js` → `SITE_ORIGIN = 'https://write-urdu.com'`;
- every HTML `<link rel="canonical">`;
- every `og:url`;
- first-party absolute Open Graph image URLs where applicable;
- JSON-LD `url`, `@id`, logo and related first-party absolute URLs;
- `sitemap.xml`;
- `robots.txt` Sitemap declaration;
- `llms.txt` canonical first-party links;
- `.well-known/security.txt` Canonical URL;
- deliberate absolute internal links;
- SEO tests and production assertions that currently hard-code `www`;
- active SEO/Cloudflare runbooks.

Run the repository generation/synchronization commands rather than hand-editing generated SEO surfaces wherever generators already exist.

Required release gate:

```bash
npm run seo:generate
npm run seo:sync-heads
npm run seo:check
npm run governance:check
npm test
```

The repository migration is not complete while any active indexable SEO signal still declares `www` as canonical.

### Step 4 — Deploy apex canonical signals before the hostname redirect

Deploy the repository migration first while both hosts are still reachable.

Verify on production that:

- `https://write-urdu.com/` and priority apex routes return `200`;
- apex pages self-canonicalize to apex;
- sitemap and robots declare apex URLs;
- `www` pages, during this short transition, expose canonical tags pointing to the corresponding apex URLs;
- no functional application regression exists.

This creates a safe transitional state: both hosts may briefly return `200`, but all page-level canonical signals already point toward the final apex destination before the edge redirect is enabled.

### Step 5 — Cloudflare edge switch: www → apex

Create one zone-level Single Redirect matching:

```text
(http.host eq "write-urdu.com")
```

Target expression:

```text
concat("https://write-urdu.com", http.request.uri.path)
```

Required settings:

- permanent status: `301` (or deliberately standardized `308`);
- preserve query string: enabled;
- exact path preservation;
- no homepage catch-all remapping.

Keep both hostnames attached for DNS/TLS continuity. Hostname normalization belongs at the Cloudflare zone edge, not in Pages `_redirects`.

Expected final behavior:

```text
https://write-urdu.com/page?x=1
        -> 301
https://write-urdu.com/page?x=1
        -> 200, self-canonical
```

HTTP variants should converge directly to HTTPS apex without unnecessary redirect chains.

### Step 6 — Immediate post-switch verification

Run:

```bash
npm run seo:live
npm run seo:production
```

The switch is accepted only when:

- every `www` indexable URL returns one permanent redirect to the same path on apex;
- query strings are preserved;
- canonical apex pages return `200` and self-canonicalize;
- HTTP variants converge on HTTPS apex;
- legacy `.html` and trailing-slash normalization still work;
- a nonexistent `www` URL redirects to the same nonexistent apex path and ultimately remains `404`;
- no redirect loops or new redirect chains are introduced;
- the production `pages.dev` alias is either permanently redirected to apex or otherwise prevented from becoming another indexable production origin.

### Step 7 — Search Console consolidation monitoring

- keep a Domain property covering both host families;
- submit only `https://write-urdu.com/sitemap.xml` after the migration release;
- inspect the highest-value apex pages after deployment;
- monitor clicks and impressions by page/host weekly;
- expect old `www` URLs to remain visible in indexing reports while recrawling and redirect processing occurs;
- judge the migration on combined host traffic and query/page ownership, not on one or two days of volatility;
- do not reverse the redirect because of normal short-term migration fluctuations.

## Stop conditions

Do not enable the Cloudflare `www → apex` redirect if any of these are true:

- apex priority pages do not return healthy `200` responses;
- apex pages do not self-canonicalize;
- sitemap or robots still point to `www`;
- material JSON-LD, Open Graph or internal absolute URLs still declare `www` as canonical identity;
- route normalization creates a redirect loop;
- important `www` paths do not have a valid same-path apex destination;
- the production Pages alias behavior conflicts with the final canonical host;
- the repository quality gate is red for reasons related to the migration.

## Rollback policy

Before the Cloudflare redirect is enabled, rollback is a normal repository revert to the last known-good `www` canonical release.

After the edge redirect is enabled, if the migration causes a genuine functional production incident, disable the `www → apex` rule and revert the canonical-signal release together. Do not leave redirects pointing one way while page canonicals point the other way.

Once the migration is technically verified, the apex decision is permanent and the `www → apex` redirect should remain long-lived.

## Completion definition

This P0 is complete when:

- `https://write-urdu.com` is the only indexable canonical production origin;
- `www` permanently redirects one-to-one to apex;
- all repository and discovery signals consistently use apex;
- all live canonical and production SEO checks pass;
- the Pages alias is controlled;
- Search Console monitoring is in place.

Only then should major Write Urdu SEO or product changes resume.
