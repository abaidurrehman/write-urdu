# WriteUrdu — Auth.js Port Implementation Record

**Date:** 2026-08-19  
**Status:** Implementation complete on draft PR; production activation/evidence pending  
**Feature:** `WU-AUTH-001` AUTH-A + AUTH-B runtime foundation  
**Branch:** `agent/write-urdu-auth-port`  
**Pull request:** #82 — `Port Auth.js account foundation from InvoiceCraftly`  
**Primary precedent:** InvoiceCraftly Feature 82/88 Auth.js + D1 implementation

## 1. What was implemented

The proven InvoiceCraftly Auth.js pattern was ported into WriteUrdu without copying InvoiceCraftly-specific Workspace, billing, Personal Cloud or invoice behavior.

Runtime added:

```text
functions/lib/auth.mjs
functions/api/auth/[[path]].js
functions/api/me.js
migrations/0005_authjs_d1_foundation.sql
js/account-session.mjs
js/account-control.mjs
js/account-page.mjs
css/account.css
sign-in.html
```

Existing shared/runtime files were integrated deliberately rather than bypassed:

```text
site-header.js
sw.js
js/ads.js
seo.config.js
_headers
_redirects
docs/WU-PUBLIC-PAGE-REGISTRY.csv
```

The focused auth contract is `tests/auth-foundation-contract.test.js` and is part of the normal `npm test` runner.

## 2. Intentional WriteUrdu adaptation: reuse the existing D1 database

InvoiceCraftly used a dedicated `ACCOUNT_DB`. WriteUrdu does not copy that physical-database decision because the product has a constrained D1 database allocation and already has one production database binding:

```text
METRICS_DB
```

The same physical D1 database already contains telemetry and share-artifact domains. Auth adds only its adapter-owned tables through migration `0005_authjs_d1_foundation.sql`:

```text
accounts
sessions
users
verification_tokens
```

No new `ACCOUNT_DB` or `WRITE_URDU_DB` binding/database was introduced.

Isolation is enforced by table/module/API ownership:

- Auth.js owns its four adapter tables.
- Existing telemetry code owns telemetry/rollup tables.
- Existing share-artifact code owns share tables.
- Future My Documents owns a separate `writing_documents` table/migration.
- Urdu document bodies are never written to Auth.js or telemetry tables.
- Auth/session code never treats email as the authorization key; product ownership uses stable `session.user.id`.

## 3. Auth runtime contract

The port preserves the useful InvoiceCraftly security/runtime decisions:

- optional `AUTH_ENABLED` gate;
- disabled / misconfigured / ready readiness states;
- one WriteUrdu-owned Auth.js import boundary;
- `@auth/core` + `@auth/d1-adapter`;
- database sessions;
- stable `session.user.id` projection;
- Google identity-only scope `openid email profile`;
- `allowDangerousEmailAccountLinking: false`;
- same-origin redirect validation;
- sanitized auth logging;
- `Cache-Control: no-store` on auth/account responses;
- `/api/me` exposes only `id`, `name`, `email`, `image`;
- provider/session/access tokens never become browser product state.

The implementation currently pins the same package pair that InvoiceCraftly had already proven on Cloudflare:

```text
@auth/core 0.41.3
@auth/d1-adapter 1.11.3
```

These versions should be deliberately reviewed before a future dependency upgrade rather than drifting automatically.

## 4. Local-writing preservation

WriteUrdu already owns local draft persistence in `js/editor-tools.js`.

The account port therefore does not introduce a second draft system. Before navigating into sign-in from the shared account control it calls the existing:

```text
WriteUrduTools.saveDraft()
```

OAuth state/query parameters never contain Urdu writing content.

Signing in alone does not upload current/history drafts. Account-backed content remains a separate `WU-DRAFT-001` / My Documents implementation slice.

## 5. Shared-shell and PWA adaptations

Two WriteUrdu-specific integration issues were found and fixed during PR validation.

### Governed route ownership

Every root HTML surface must participate in the shared route/SEO/product governance model. `/sign-in` was therefore registered as:

```text
utility
noindex
not in sitemap
ad-free
canonical /sign-in
```

The shared shell contains a hidden-by-default source-visible `/sign-in` fallback inside the optional account-control slot. The account client replaces/reveals it only when `/api/me` reports that account services are available. Auth disabled therefore leaves the public header unchanged.

### Service worker exclusion

The existing service worker previously cached successful same-origin GET responses generically. That is unsafe for authenticated/session-specific endpoints.

The port advances the shell cache generation to `write-urdu-shell-v26` and explicitly bypasses the Cache API for:

```text
/api/*
/sign-in
/sign-in.html
```

This protects `/api/me`, Auth.js CSRF/session/callback endpoints and future authenticated document APIs from stale/shared application-cache behavior.

## 6. Monetization boundary

`/sign-in` is explicitly classified with the existing ad-free trust/utility routes.

The account page must not contain or inherit an AdSense placement. Authentication exists to support continuity, not to create another monetized pageview.

## 7. Validation evidence

GitHub Actions workflow `Quality checks`, run `32278475244`, completed successfully on the PR branch after the WU-specific integration fixes.

The successful run proves:

- `npm ci` succeeded under the repository Node 20 quality environment;
- dependency audit reported zero vulnerabilities in the installed tree;
- full `npm test` contract suite passed, including `Auth.js account foundation contracts passed`;
- static regression suite passed for all 31 governed HTML files;
- SEO validation passed;
- product-governance validation passed;
- InPage browser acceptance passed;
- focused Playwright product browser acceptance passed;
- V3 production visual-quality audit passed;
- visual-audit artifact upload passed.

Earlier failing runs were used as integration feedback rather than bypassed:

1. the initial auth migration ownership assertion incorrectly matched explanatory comment text; it was corrected to validate the exact set of created tables;
2. WU static governance required `/sign-in` to be source-connected to the shared shell; a hidden optional account fallback was added;
3. mature workspace contracts still asserted service-worker generation `v25`; they were advanced consistently to `v26` because the account port legitimately changes the shared app shell/cache contract.

No existing quality gate was removed or weakened to make the port pass.

## 8. Production activation still required

Repository implementation is not equivalent to production OAuth proof.

Before enabling accounts publicly:

1. apply `migrations/0005_authjs_d1_foundation.sql` to the **existing production D1 database currently bound as `METRICS_DB`**;
2. configure a strong `AUTH_SECRET` in the Cloudflare Pages environment;
3. create/configure the Google OAuth client;
4. register/verify the production callback expected by the implementation, intended as `https://write-urdu.com/api/auth/callback/google`;
5. configure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` as Cloudflare secrets/environment values;
6. set `AUTH_ENABLED=true` only in the intended environment after the binding/migration/provider configuration is complete;
7. deploy and complete the production evidence checklist below.

Do not commit secret values to the repository.

## 9. Production evidence checklist

Use a meaningful local Urdu draft and prove the complete custom-domain flow:

```text
write Urdu locally
→ allow/force local save
→ Sign in
→ Google OAuth
→ return to the intended WriteUrdu route
→ exact local writing remains
→ /api/me reports authenticated stable user ID
→ users/accounts/sessions rows exist in the existing D1 database
→ no Urdu writing exists in auth tables
→ sign out
→ local writing remains
```

Also prove:

- OAuth cancellation is non-destructive;
- incomplete/missing auth configuration fails closed without harming writing;
- anonymous homepage transliteration still works;
- Urdu Keyboard and Rich Editor still work signed out;
- `/sign-in` remains noindex/ad-free/no-store;
- service worker does not intercept `/api/me` or `/api/auth/*`;
- built/static assets contain no OAuth client secret, auth secret, session token or provider token.

## 10. Not implemented by this port

The following remain separately gated:

- My Documents / `writing_documents` persistence;
- cross-device document restore;
- Facebook provider;
- provider/account linking;
- public profiles;
- follower graph/feed;
- collaboration/comments;
- team workspaces;
- Google Drive/Dropbox/OneDrive access;
- automatic upload of local draft history.

The next product-value slice after production Google identity proof is `WU-DRAFT-001` / My Documents, not another identity provider.
