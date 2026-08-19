---
name: wu-auth-authjs-d1-foundation
description: Implement or review WU-AUTH-001 AUTH-A for WriteUrdu: optional Auth.js + Cloudflare D1 backend foundation using the existing METRICS_DB database. Preserve anonymous writing, keep Auth.js behind one project-owned module, and do not create another D1 database.
---

# WriteUrdu AUTH-A — Auth.js foundation on existing D1

Use only for the backend authentication foundation.

Read first:

1. `specs/WU-ACCOUNT-001-account-document-platform-boundary.md`
2. `specs/WU-AUTH-001-social-authentication-foundation.md`
3. `docs/WU-AUTH-INVOICECRAFTLY-REUSE-MAP-2026-08-19.md`
4. `docs/WU-AUTH-DRAFTS-IMPLEMENTATION-PLAN-2026-08-13.md`
5. current WriteUrdu migrations and every current `env.METRICS_DB` consumer
6. InvoiceCraftly's current `functions/lib/auth.mjs`, auth routes, migration and tests
7. current official Auth.js/Cloudflare documentation.

## Scope

AUTH-A delivers:

```text
Auth.js dependencies
+ additive Auth.js migration
+ existing METRICS_DB binding
+ functions/lib/auth.mjs
+ /api/auth/*
+ /api/me
+ tests
```

It does **not** deliver:

- sign-in UI;
- Google production OAuth proof;
- My Documents;
- profiles;
- collaboration;
- teams;
- Facebook.

## Critical database decision

WriteUrdu already has a D1 database exposed as:

```text
METRICS_DB
```

Reuse it.

Do not create:

```text
ACCOUNT_DB
WRITE_URDU_DB
any additional D1 database
```

The existing database currently contains telemetry/share-artifact tables. Add Auth.js tables through the next additive migration.

Expected current sequence at spec time:

```text
0001_product_telemetry.sql
0002_product_telemetry_rollups.sql
0003_acquisition_telemetry.sql
0004_share_artifacts.sql
0005_authjs_d1_foundation.sql   # expected next, verify first
```

## Guardrails

- Accounts remain optional.
- Anonymous writing must work if auth is off, broken or unavailable.
- Do not migrate frameworks.
- Do not touch transliteration/editor behavior except tests needed to prove no regression.
- Only one WriteUrdu module may directly import Auth.js/D1 adapter/provider modules.
- Do not hand-roll OAuth/session cookies.
- Do not add email/password auth.
- Do not auto-link identities by email.
- Never commit secrets.
- Auth migrations are additive only.
- Never drop/rename/modify existing telemetry/share tables.

## Step 1 — establish current state

Before coding:

- inspect current branch/main and migration list;
- identify all `env.METRICS_DB` consumers;
- capture current D1 table inventory/schema;
- run existing test/SEO/governance/browser baseline;
- inspect Pages Functions routing/build conventions;
- check current Auth.js core, D1 adapter and Cloudflare compatibility;
- verify InvoiceCraftly's reference code against current package APIs.

Do not treat the 2026-08-15 InvoiceCraftly package versions as permanent pins.

## Step 2 — migration

Use the installed Auth.js D1 adapter's required schema for adapter-owned tables:

```text
users
accounts
sessions
verification_tokens
```

Add them through the next migration in WriteUrdu's existing sequence.

Before remote apply:

1. record existing tables;
2. apply migration locally/representatively;
3. verify expected Auth.js tables were added;
4. verify every pre-existing table remains;
5. run telemetry/share regression tests.

Never edit `0001`–`0004` to inject auth schema.

## Step 3 — auth wrapper

Expected module:

```text
functions/lib/auth.mjs
```

Only this module imports Auth.js directly.

Expected helpers:

```js
getAuthReadiness(env)
authEnabled(env)
buildIdentityProviders(env)
resolveAuthRedirect(url, baseUrl)
createAuthConfig(env)
handleAuthRequest(request, env)
getSession(request, env)
```

The D1 adapter must use the existing binding:

```js
D1Adapter(env.METRICS_DB)
```

Do not introduce a new binding alias solely for auth unless it points to the exact same database and there is an explicit operational reason; the default implementation should simply reuse `METRICS_DB`.

## Step 4 — readiness

Require:

```text
AUTH_ENABLED === 'true'
AUTH_SECRET
valid env.METRICS_DB
at least one complete provider
```

States:

```text
disabled
misconfigured
ready
```

A partial provider config fails that provider closed without leaking secrets.

When auth is disabled/misconfigured, the anonymous product remains usable.

## Step 5 — provider-neutral foundation

Google is first, but readiness/provider construction should not permanently hard-code Google as the only possible provider.

For Google, identity scope is equivalent to:

```text
openid email profile
```

No Drive/Gmail/Calendar/Contacts/storage scopes.

Keep safe account linking behavior; do not enable dangerous automatic email linking.

## Step 6 — `/api/auth/*` and `/api/me`

Add the Pages Functions catch-all using current repo conventions.

`/api/me` exposes only the product-facing projection needed by the static UI:

```text
id
name
email
image
```

`id` is stable authorization identity. Other fields are optional profile data.

Account/session responses:

- `Cache-Control: no-store`;
- `X-Content-Type-Options: nosniff`;
- safe referrer policy where appropriate;
- no raw Auth.js/provider errors;
- no token/cookie/request dumps.

## Step 7 — same-origin redirect

Port InvoiceCraftly's safe same-origin redirect concept.

Never allow OAuth callback return parameters to become an open redirect.

Do not serialize Urdu writing into OAuth state/query parameters.

The actual local-work flush is completed/proven in AUTH-B, but AUTH-A's redirect helper must already be safe.

## Step 8 — shared-D1 access discipline

Auth code may use `METRICS_DB` for Auth.js adapter tables.

It must not:

- run telemetry maintenance;
- query product event/rollup tables;
- query share-artifact tables;
- query future `writing_documents` for session handling.

Similarly, existing telemetry/share code must not begin reading Auth.js tables.

The physical database is shared; module ownership is not.

## Step 9 — tests

Required focused tests:

- auth off => disabled;
- missing `AUTH_SECRET` => misconfigured;
- missing/invalid `METRICS_DB` => misconfigured;
- complete Google pair => provider ready;
- incomplete pair => provider excluded;
- unauthenticated `/api/me` deterministic;
- authenticated session exposes stable ID;
- direct Auth.js imports exist only in the auth wrapper;
- same-origin redirect accepted;
- external redirect rejected/fallback;
- account/session responses `no-store`;
- Google identity scope has no storage/data permissions;
- migration adds Auth.js tables without removing/changing existing table inventory.

Run full WriteUrdu regression after focused tests, including telemetry/share tests.

## Exit proof

AUTH-A is complete only when:

- no new D1 database was created;
- Auth.js uses existing `METRICS_DB`;
- adapter tables exist in the existing database;
- existing telemetry/share tables/endpoints still work;
- `AUTH_ENABLED=false` leaves production behavior unchanged;
- auth wrapper is the only direct Auth.js boundary;
- `/api/me` is safe/deterministic;
- full regression passes.

## Rollback

Rollback AUTH-A by setting:

```text
AUTH_ENABLED=false
```

Do not drop Auth.js tables from the shared production database as normal rollback.

## Stop conditions

Stop and fix before AUTH-B if:

- implementation requires another D1 database;
- auth migration alters/drops existing tables;
- anonymous writing depends on auth availability;
- secrets appear in source/build output;
- session user ID is unstable/missing;
- Pages Functions routing breaks static routes;
- auth code starts depending on telemetry/share internals.
