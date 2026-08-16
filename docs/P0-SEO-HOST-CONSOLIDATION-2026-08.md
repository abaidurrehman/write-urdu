# P0 SEO — Canonical Host Consolidation

**Status:** Active preflight
**Started:** 2026-08-16
**Canonical host:** `https://www.write-urdu.com`
**Alternate host to consolidate:** `https://write-urdu.com`

## Why this is P0

Write Urdu is a mature domain and both the apex and `www` host families have received traffic. Serving indexable copies on both hosts can split crawl, canonical and link signals and makes future SEO measurement harder to interpret.

The repository already contains a canonical-host decision based on Search Console evidence from 16 July–4 August 2026. That evidence showed the historical `www` URL family carrying materially more Google Search clicks than the apex URL family. The current Cloudflare Top Hosts view is useful operational evidence that both hosts are still used, but host request volume alone is not a reason to reverse the established search canonical.

Therefore this P0 keeps `www` as the canonical host and consolidates the apex into it. We do not flip the preferred host during this incident unless fresh Search Console and backlink evidence demonstrates that the existing decision is wrong.

## Safety rules

1. Do not change page content, navigation architecture or primary SEO targeting as part of the host switch.
2. Do not use `noindex`, `robots.txt` blocking, JavaScript redirects or Search Console removals to consolidate the apex host.
3. Do not remove the apex custom domain before the redirect has been proven.
4. Do not redirect arbitrary missing URLs to the homepage.
5. Preserve path and query string exactly.
6. Use a permanent `301` or `308`, never `302`/`307`.
7. Keep the canonical-host decision centralized in `seo.config.js`.
8. Keep both host properties observable in Search Console during the consolidation period.
9. Do not combine this change with another major Write Urdu release.

## Execution sequence

### Step 1 — Repository preflight — ACTIVE

- [x] Confirm canonical source of truth is `https://www.write-urdu.com`.
- [x] Confirm the repository already has static canonical, sitemap, robots and redirect guardrails.
- [x] Strengthen `scripts/check-live-canonical.js` so the default live audit covers every indexable route rather than only representative routes.
- [x] Add a missing-route check so an unknown apex path must map to the same unknown path on `www`, and the canonical target must remain a real `404`.
- [x] Changed JavaScript passes `node --check`.
- [ ] Complete the branch quality workflow.

**Production traffic change in Step 1:** none.

### Step 2 — Read-only production baseline — COMPLETE EXCEPT PAGES ALIAS

A production verification run on 15 August 2026 repeatedly confirmed the current state from a GitHub-hosted runner:

- canonical `www` priority pages return `200`;
- `robots.txt`, `sitemap.xml`, `llms.txt`, `security.txt` and `ads.txt` on `www` return `200` and pass the existing production SEO assertions;
- `http://www.write-urdu.com/...` permanently redirects to HTTPS `www` correctly;
- legacy `/index.html`, `.html` routes and trailing-slash routes on `www` normalize correctly;
- **the apex host is still serving `200` copies** for `/`, `/urdu-editor`, `/urdu-keyboard`, `/roman-urdu-transliteration`, `/write-urdu-documentation`, `/urdu-card-studio` and `/how-to-write-urdu-on-photo`;
- `http://write-urdu.com/...` currently redirects only to HTTPS apex, not directly to canonical `www`;
- the production `pages.dev` alias was not configured in the live audit environment, so that one origin remains an explicit follow-up check.

This isolates the P0 defect: repository-level canonical/discovery signals are already aligned to `www`; the missing production control is the Cloudflare zone-level apex → `www` redirect.

### Step 3 — Repository release gate

Run:

```bash
npm run seo:check
npm run governance:check
npm test
```

Then deploy the repository-only guardrail changes. This does not change the canonical host or redirect traffic; it makes the later switch measurable and regression-resistant.

### Step 4 — Cloudflare edge switch

Create one zone-level Single Redirect matching:

```text
(http.host eq "write-urdu.com")
```

Target expression:

```text
concat("https://www.write-urdu.com", http.request.uri.path)
```

Required settings:

- permanent status: `301` (or deliberately standardized `308`)
- preserve query string: enabled
- no homepage catch-all remapping

Keep the apex attached for DNS/TLS continuity. The edge redirect, not Pages `_redirects`, owns hostname normalization.

### Step 5 — Immediate post-switch verification

Run:

```bash
npm run seo:live
npm run seo:production
```

Also verify a representative query URL manually. The switch is accepted only when:

- every apex indexable URL returns one permanent redirect to the same path on `www`;
- query strings are preserved;
- canonical `www` pages return `200` and self-canonicalize;
- HTTP variants converge on HTTPS `www`;
- legacy `.html` and trailing-slash normalization still work;
- a nonexistent apex URL redirects to the same nonexistent `www` path and ultimately remains `404`;
- there are no redirect loops or chains introduced by the host rule.

### Step 6 — Search Console consolidation monitoring

- keep a Domain property covering both hosts;
- submit only the canonical `https://www.write-urdu.com/sitemap.xml`;
- inspect the highest-value `www` pages after deployment;
- monitor clicks and impressions by host weekly;
- expect apex URLs to move toward redirect/alternate states over time rather than disappearing immediately;
- do not flip the redirect direction in response to short-term volatility.

## Stop conditions

Do not enable the Cloudflare redirect if any of these are true:

- canonical `www` pages fail or redirect unexpectedly;
- sitemap or robots point at the apex host;
- material internal absolute links still point at the apex host;
- important apex paths do not have a valid same-path canonical destination;
- route normalization creates a redirect loop;
- the production Pages alias behavior is unknown and conflicts with the canonical host.

## Rollback policy

Before Step 4, rollback is simply abandoning/reverting the P0 branch; production is unchanged.

After Step 4, if the edge redirect causes a functional production incident, disable the faulty rule immediately and restore the previously known-good routing while the rule is corrected. Do not deliberately alternate the canonical direction as an SEO experiment. Once verified, the permanent redirect should remain long-lived.

## Completion definition

This P0 is complete when the apex host no longer serves indexable `200` copies, all canonical/discovery signals consistently use `www`, all live canonical checks pass, and Search Console monitoring is in place. Only then should major Write Urdu SEO or product changes resume.
