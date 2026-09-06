---
name: wu-api-002-developer-portal
description: Implement or review WU-API-002 — the self-serve developer portal and per-user API keys for WriteUrdu's InPage↔Unicode beta API. Adds one table to the existing METRICS_DB and two new session-gated routes; does not create a new database, change the existing Google auth flow, or touch WU-PLAT-002H surfaces.
---

# WriteUrdu InPage↔Unicode developer portal & self-serve API keys

Read first:

1. `specs/WU-API-002-inpage-unicode-developer-portal-self-serve-keys.md`
2. `docs/WU-API-002A-DEVELOPER-PORTAL-SELF-SERVE-KEYS-IMPLEMENTATION-PLAN-2026-09-06.md`
3. `specs/WU-API-001-inpage-unicode-developer-api.md` (§11 — this slice is a deliberate early pull-forward of that Hold list)
4. `functions/lib/auth.mjs`, `functions/api/me.js` — the existing auth/session pattern this slice reuses, does not rebuild
5. `functions/lib/inpage-unicode-api.mjs`, `functions/lib/timing-safe-equal.mjs` — the existing beta route this slice adds a second auth path to
6. `.claude/skills/wu-inpage-unicode-api/SKILL.md` — the sibling skill for the underlying API/package this depends on

## Core rule

**This is an access-control layer on an existing route, not a new product.** No new conversion logic, no new engine, no new OAuth provider, no new database. Everything here is additive to `METRICS_DB` and `functions/lib/auth.mjs`'s existing session helpers.

This is a founder-directed decision to build ahead of `WU-API-001` §11's stated "wait for real usage" gate (see spec §3). It must stay isolated the same way `WU-API-001` did: no `WU-PLAT-002H`-owned file, no Basic/Rich Editor, no mobile-activation surface. If a step here starts requiring a change to Google provider config, session cookie handling, or the sign-in page's existing flow (rather than additive use of it), stop — the isolation assumption broke.

## Step 1 — migration

Before writing `migrations/0019_inpage_api_keys.sql`, check `migrations/` for the actual current highest number — do not assume 0018 is still the latest if other work has landed since this skill was written. Table:

```sql
CREATE TABLE IF NOT EXISTS inpage_api_keys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  key_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  revoked_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_inpage_api_keys_key_hash ON inpage_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_inpage_api_keys_user_id_active ON inpage_api_keys(user_id, revoked_at);
```

Applying this migration to production is a **manual, founder-only step** (`wrangler d1 migrations apply` — no `migrate` script exists in this repo). Code that depends on the table must tolerate the table not existing yet in any environment where the migration hasn't run (fail closed with `auth_unavailable`/`503`-style responses, not a raw D1 error, matching this repo's existing convention).

## Step 2 — key lifecycle library

New `functions/lib/inpage-api-keys.mjs`. Prefix: `wu_inpage_live_`. SHA-256 hash via `crypto.subtle.digest`, never store or log the raw key. One active key per user — `issueApiKeyForUser` must revoke any existing active key for that user in the same `env.METRICS_DB.batch([...])` call that inserts the new one (atomic, not two round trips). Functions: `generateRawApiKey`, `hashApiKey`, `issueApiKeyForUser`, `revokeActiveApiKeyForUser`, `getActiveApiKeyForUser` (metadata only — never the raw key or hash), `findActiveApiKeyByRawKey`.

Do not import InvoiceCraftly's `document-api-keys.mjs` across repos — same technique, separate file, separate table name (`inpage_api_keys`, not `document_api_keys`).

## Step 3 — account request guard

New `functions/lib/account-request-guard.mjs`: `isSameOriginRequest(request)`, `requireAuthenticatedSession(request, env, { getSessionImpl })` built on top of `functions/lib/auth.mjs`'s existing `getAuthReadiness`/`getSession` — do not reimplement session logic, only wrap it. `accountJson(body, status)` using the same header set `functions/api/me.js` already uses (`no-store`, `X-Content-Type-Options`, `Referrer-Policy`).

## Step 4 — account routes

`functions/api/account/inpage-api-keys/index.js` (GET metadata / POST issue) and `functions/api/account/inpage-api-keys/revoke.js` (POST revoke). Both same-origin-checked and session-gated on every state-changing method — see spec §5c for exact status codes. The raw key appears in exactly one response body, ever: the `POST` that issues it.

## Step 5 — beta route auth extension

In `functions/lib/inpage-unicode-api.mjs`, add a second branch to the existing bearer check: if the token doesn't match `INPAGE_API_BETA_SECRET` (constant-time, unchanged), hash it and call `findActiveApiKeyByRawKey`. Do not remove or weaken the shared-secret path — already-distributed testers must keep working. Do not add a second constant-time comparison for the per-key path; a hashed indexed DB lookup is the correct technique there, not a string compare (see spec §5d for why).

## Step 6 — pages

- `/developers` — public, indexable, links into the existing sign-in flow (reuse its redirect-back mechanism, do not build a second one).
- `/account/developer-api` — noindex, client-hydrated from the new GET route the same way `sign-in.html` hydrates from `/api/me`. Show the raw key exactly once, with a clear "we can't show this again" warning and a copy button.

## Step 7 — tests

- `tests/inpage-api-keys-contract.test.js`: hash round-trip, one-active-key invariant, revoked-key lookup returns null, route-level 401/403/404/200 cases.
- Extend `tests/inpage-unicode-api-contract.test.js`: valid per-user key → 200, revoked key → 401, shared secret still works.
- Add both to `scripts/run-contract-tests.js`. Full `npm test` must stay green.

## Rollback

The new account routes and pages can be removed/hidden independently of the beta route — the beta route's shared-secret path is untouched and keeps working with `INPAGE_API_BETA_SECRET` alone if the per-key path is disabled. Dropping the `inpage_api_keys` table is a separate, manual, founder-only decision — do not do this as part of a code rollback.

## Stop conditions

Stop and fix if:

- a second key can ever be active for the same user without the first being revoked;
- the raw key is persisted, logged, or returned in any response other than the issuing `POST`;
- an account route responds successfully without both an authenticated session and (for state-changing methods) a same-origin check;
- the shared-secret auth path on the beta route regresses;
- work expands into multiple keys, quotas/billing, or a new D1 database — those are explicitly out of scope (spec §6).
