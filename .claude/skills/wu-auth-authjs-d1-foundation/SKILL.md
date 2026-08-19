---
name: wu-auth-authjs-d1-foundation
description: Implement or review WU-AUTH-001 AUTH-A, the optional Auth.js + Cloudflare D1 backend foundation for WriteUrdu. Load when adding Auth.js dependencies, ACCOUNT_DB, auth migrations, /api/auth/*, /api/me, session.user.id, readiness gates or auth security tests. This skill stops before account-shell UI and preserves anonymous/local writing.
---

# WriteUrdu AUTH-A — Auth.js + ACCOUNT_DB Foundation

This skill implements the backend identity/session foundation only.

## Read before changing code

1. `specs/WU-ACCOUNT-001-account-document-platform-boundary.md`
2. `specs/WU-AUTH-001-social-authentication-foundation.md`
3. `docs/WU-AUTH-INVOICECRAFTLY-REUSE-MAP-2026-08-19.md`
4. `docs/WU-AUTH-DRAFTS-IMPLEMENTATION-PLAN-2026-08-13.md`
5. current `package.json`, deployment config and `/functions` tree
6. current `js/editor-tools.js` only to understand the protected local-writing boundary
7. current InvoiceCraftly auth implementation and tests listed in the reuse map
8. current official Auth.js/D1 adapter and Cloudflare Pages Functions/D1 docs/package source.

Do not implement from memory when the current package/runtime contract can be inspected.

## Scope boundary

AUTH-A includes:

- Auth.js dependencies;
- dedicated `ACCOUNT_DB`;
- adapter migration;
- one project-owned auth wrapper;
- `/api/auth/*`;
- `/api/me`;
- configuration/readiness state;
- database sessions/stable user ID;
- redirect/log/header security behavior;
- tests.

AUTH-A does **not** include:

- `/sign-in` UI;
- shared-header account UI;
- browser account hydration;
- Google production OAuth proof beyond provider/config testability needed by the backend;
- My Documents;
- writing persistence;
- Facebook;
- profiles/teams/collaboration.

Use `wu-auth-account-shell` for AUTH-B after this foundation is green.

## Primary reuse precedent

Inspect current `abaidurrehman/invoicecraftly` first, especially:

```text
functions/lib/auth.mjs
functions/api/auth/[[path]].js
functions/api/me.js
migrations/feature-88-account/0001_authjs_d1_foundation.sql
test/feature-82-88-authjs-d1-foundation.test.js
context/implementation/feature-82-88-authjs-d1-foundation-implementation-2026-08-15.md
```

Reuse its boundaries, not its product-specific Workspace/business behavior.

InvoiceCraftly recorded Auth.js core `0.41.3` + D1 adapter `1.11.3` on 2026-08-15. Treat that as proven evidence only. Resolve the current compatible versions before changing WriteUrdu dependencies.

## Non-negotiable architecture

```text
static WriteUrdu pages
        |
        +-- anonymous product (no auth dependency)
        |
        +-- /api/auth/*
        +-- /api/me
                 |
          functions/lib/auth.mjs
                 |
              Auth.js
                 |
             ACCOUNT_DB
```

`ACCOUNT_DB` is identity/session storage only.

Do not use `WRITE_URDU_DB` for Auth.js adapter tables. Do not add writing-document tables in this skill.

## Step 0 — baseline before edits

Inspect current main and run the current relevant baseline:

```text
npm test
npm run seo:check
npm run governance:check
```

Run applicable browser tests if the environment supports them.

Record pre-existing failures rather than absorbing them into auth work.

Confirm:

- current Cloudflare Pages build/deploy arrangement;
- current Functions routing convention;
- whether Wrangler config exists and what is local-only vs production authority;
- current Node/package constraints;
- current static public-route behavior.

## Step 1 — resolve dependency/runtime compatibility

Before installing/pinning packages:

- inspect current InvoiceCraftly package versions;
- inspect current Auth.js core and D1 adapter compatibility/peer dependencies;
- inspect the D1 adapter's current migration/schema;
- inspect current Cloudflare Pages Functions routing and compatibility requirements.

Prefer the smallest dependency delta that reproduces the proven InvoiceCraftly boundary.

Do not migrate frameworks.

## Step 2 — dedicated ACCOUNT_DB

Add a dedicated account/auth binding contract named:

`ACCOUNT_DB`

Use the current D1 adapter schema for Auth.js-owned tables, logically:

```text
users
accounts
sessions
verification_tokens
```

Keep the migration in an account-specific migration path.

Do not customize Auth.js adapter columns or add Urdu document content/profile fields to them.

Do not reuse analytics/OS storage.

## Step 3 — one auth import boundary

Expected module:

`functions/lib/auth.mjs`

Only this module may directly import:

- `@auth/core`;
- `@auth/d1-adapter`;
- Auth.js provider modules.

Product/API files call WriteUrdu-owned helpers.

Target interface:

```js
getAuthReadiness(env)
authEnabled(env)
buildIdentityProviders(env)
createAuthConfig(env)
handleAuthRequest(request, env)
getSession(request, env)
```

Exact names may adapt to current repository conventions, but keep one boundary.

## Step 4 — readiness model

Model explicit states equivalent to:

```text
disabled
misconfigured
ready
```

Rules:

- `AUTH_ENABLED !== 'true'` => disabled;
- missing `AUTH_SECRET` => misconfigured;
- invalid/missing `ACCOUNT_DB` => misconfigured;
- no complete identity provider => misconfigured/unavailable;
- at least one complete provider + valid core config => ready.

Design provider readiness to be data-driven from the start. Google is first, but future Facebook configuration must not require rewriting auth-core readiness.

Partial provider pairs fail that provider closed without exposing a dead UI descriptor later.

## Step 5 — provider foundation

AUTH-A may wire the Google provider because readiness requires at least one provider, but do not build the user-facing account shell here.

Google identity scope must be explicitly equivalent to:

```text
openid email profile
```

Do not request Drive, Gmail, Calendar, Contacts or storage permissions.

Preserve safe account-linking behavior equivalent to:

```text
allowDangerousEmailAccountLinking: false
```

## Step 6 — auth catch-all

Implement `/api/auth/*` through the current Pages Functions multipath pattern.

Use `handleAuthRequest()` so routing files contain minimal framework glue.

Behavior:

- auth disabled => safe not-enabled response;
- auth misconfigured => safe unavailable response;
- auth ready => delegate to Auth.js;
- unexpected Auth.js failure => normalized unavailable response;
- account responses non-cacheable.

Do not leak raw runtime/provider errors to users.

## Step 7 — `/api/me`

Implement a tiny product-facing projection using `getSession()`.

Authenticated shape may be:

```json
{
  "authenticated": true,
  "user": {
    "id": "stable-user-id",
    "name": "...",
    "email": "...",
    "image": "..."
  }
}
```

Requirements:

- stable `id` must come from the adapter user/session callback;
- email/name/image are optional presentation fields;
- unauthenticated response is deterministic;
- do not return provider tokens/account IDs;
- `Cache-Control: no-store`;
- `X-Content-Type-Options: nosniff`;
- safe referrer policy where practical.

## Step 8 — session contract

Use database sessions as in the proven InvoiceCraftly pattern unless current Auth.js evidence requires a documented change.

Ensure session callback exposes stable:

`session.user.id`

All later product authorization must use this value, never email.

## Step 9 — redirect safety

Implement a project-owned same-origin redirect resolver equivalent to the InvoiceCraftly pattern.

Rules:

- accept valid same-origin return targets;
- reject/fallback external origins;
- reject malformed targets safely;
- use a deterministic safe fallback such as `/`;
- never place user writing in return URLs/OAuth state.

The account-shell skill will later decide the bounded set of product return routes.

## Step 10 — sanitized logging

Use a normalized logger that emits only safe categories/types.

Never log:

- request/cookie headers;
- OAuth code/state;
- session token;
- access/refresh tokens;
- raw provider response;
- Urdu writing;
- secret/config values.

## Step 11 — failure isolation

Auth API failure must not become a static-site failure.

Confirm no current writer/transliteration module imports or calls auth synchronously during initialization.

No auth module may become a dependency of transliteration logic.

## Step 12 — contract tests

Add focused tests for at least:

- flag off => disabled state;
- missing secret => misconfigured;
- missing/invalid `ACCOUNT_DB` => misconfigured;
- no complete provider => unavailable;
- complete Google pair => provider included/readiness possible;
- incomplete Google pair => provider excluded;
- Google scope contains identity only;
- automatic email linking disabled;
- `/api/me` signed out => unauthenticated;
- authenticated session projection includes stable ID;
- same-origin redirect accepted;
- external-origin redirect rejected/fallback;
- auth and `/api/me` responses are `no-store`;
- only the auth wrapper imports Auth.js directly;
- normalized logger does not include secret/request/token payloads.

Where useful, mirror the structure of InvoiceCraftly's focused auth tests, adapting to WriteUrdu's runner and module conventions.

## Step 13 — build/runtime proof

Before closing AUTH-A:

- clean dependency install succeeds;
- focused auth tests pass;
- full current WriteUrdu test suite passes;
- SEO/governance checks pass;
- Pages Functions bundle compiles with the repository's current tooling;
- local/test D1 migration creates the adapter tables;
- static build artifacts contain no client secrets;
- disabled mode leaves public site behavior unchanged.

Do not require a production Google callback to close AUTH-A; that belongs to AUTH-B.

## Rollback

`AUTH_ENABLED=false` must disable auth behavior without migrations/deletion and without changing local writing.

Do not delete account rows as part of rollback.

## Stop conditions

Stop and fix if:

- adding auth requires a framework migration;
- `ACCOUNT_DB` is mixed with user writing/analytics;
- Auth.js imports spread beyond one module;
- stable user ID is absent from session;
- readiness is accidentally hard-coded forever to Google;
- auth requests can redirect to arbitrary origins;
- secrets/tokens appear in logs/build output;
- identity provider requests storage/social permissions;
- auth failure affects transliteration/editor initialization;
- current Auth.js/Cloudflare compatibility cannot be established.

## After AUTH-A

Record:

- exact dependency versions;
- migration path;
- binding name;
- test/build evidence;
- branch/PR/commit;
- any differences from InvoiceCraftly precedent and why.

Then use `wu-auth-account-shell` for Google production sign-in/account UX. Do not start My Documents until AUTH-B's production/local-writing-preservation gate passes.
