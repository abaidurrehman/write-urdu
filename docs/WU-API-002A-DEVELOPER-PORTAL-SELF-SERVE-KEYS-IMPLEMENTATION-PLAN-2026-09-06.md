# WU-API-002A — Developer Portal & Self-Serve API Keys (Implementation Design)

**Status:** approved for implementation
**Date:** 2026-09-06
**Depends on:** `WU-API-001` (beta API, implemented), `WU-AUTH-001` (Google sign-in + `METRICS_DB`, implemented core)
**Spec:** `specs/WU-API-002-inpage-unicode-developer-portal-self-serve-keys.md`

## 1. Purpose

Replace "email me for the beta secret" with a self-serve loop: sign in with the account system that already exists, get a key, use it against the route that already exists. This is a thin access-control layer, not a new product surface.

## 2. Survey grounding this design

- **`METRICS_DB` is the one D1 database for everything in this repo.** Migrations 0001–0018 all target it (telemetry, share artifacts, Auth.js tables via `0005_authjs_d1_foundation.sql`, `writing_documents` via `0006`). `wu-auth-account-shell`'s own skill file states the rule explicitly: "Do not introduce `ACCOUNT_DB`, `WRITE_URDU_DB` or another D1 database." This slice follows that rule — one more table, same database.
- **No `migrate` script exists in `package.json`.** Every existing migration was applied by the founder directly via `wrangler d1 migrations apply` against the production binding. This slice's migration will be applied the same manual way — tracked as a manual step, not something CI or this session can do.
- **Auth already exists and is reusable as-is.** `functions/lib/auth.mjs` exports `getAuthReadiness`/`getSession`; `functions/api/me.js` is the existing pattern for a session-gated JSON endpoint. No new provider, no new cookie/session logic needed.
- **InvoiceCraftly Feature 102.4 is the concrete pattern**, not a shared dependency: `document-api-keys.mjs` (hash-and-store, one active key per user, raw key shown once), `account-lifecycle.mjs` (`isSameOriginRequest`, `requireAuthenticatedSession`, JSON response headers), and its two account routes plus `/developers` and `/account/api-keys` static pages. Every one of these gets re-implemented locally in this repo's own module layout — none of it is imported cross-repo.
- **No account-deletion feature exists yet in write-urdu** (confirmed — no matches for delete-account routes). So unlike InvoiceCraftly's `deleteAccountIdentity`, there is nothing to wire the new table's cleanup into yet. Noted as a forward-looking TODO in the spec, not built here.
- **The beta route's existing auth check is a single constant-time string compare** (`functions/lib/inpage-unicode-api.mjs`, using `timing-safe-equal.mjs`). This slice adds a second, independent credential path (hash + D1 lookup) rather than replacing the first, so already-distributed shared-secret testers are unaffected.

## 3. Scope decisions

### 3a. Migration

New file `migrations/0019_inpage_api_keys.sql`:

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

Verify the next unused migration number against the `migrations/` directory at implementation time (0018 was the highest seen during survey) before naming the file, in case another branch has landed a migration since.

### 3b. `functions/lib/inpage-api-keys.mjs`

Mirrors `document-api-keys.mjs`'s technique exactly, renamed to this product's table/prefix:

- `KEY_PREFIX = 'wu_inpage_live_'`, 32 random bytes, base64url-encoded (same `toBase64Url` helper shape).
- `hashApiKey` via `crypto.subtle.digest('SHA-256', ...)`.
- `generateRawApiKey()`, `issueApiKeyForUser(env, userId)` (revoke-then-insert in one `env.METRICS_DB.batch([...])`), `revokeActiveApiKeyForUser(env, userId)`, `getActiveApiKeyForUser(env, userId)`, `findActiveApiKeyByRawKey(env, rawKey)`.
- Reads/writes `env.METRICS_DB`, not a new binding.

### 3c. `functions/lib/account-request-guard.mjs`

Small local module (new — this repo doesn't have an equivalent yet because `/api/me` is read-only and needed no CSRF check):

- `isSameOriginRequest(request)` — compares `Origin` header to `request.url` origin.
- `requireAuthenticatedSession(request, env, { getSessionImpl })` — wraps `getAuthReadiness`/`getSession` from `functions/lib/auth.mjs`, returns `{ ok: true, userId, session }` or `{ ok: false, response }` with the same disabled/misconfigured/unauthenticated status codes `functions/api/me.js` already uses (200 `available:false` is `/api/me`'s own shape for the disabled case — the account routes use 404/503/401 instead, matching InvoiceCraftly's equivalent, since these are action routes, not a passive profile read).
- `accountJson(body, status)` — same header set as `functions/api/me.js`'s `json()` helper (`Cache-Control: no-store`, `X-Content-Type-Options`, `Referrer-Policy`).

### 3d. Account routes

- `functions/api/account/inpage-api-keys/index.js`
  - `onRequestGet` → `requireAuthenticatedSession` → `getActiveApiKeyForUser` → `{ activeKey: {...} | null }`.
  - `onRequestPost` → `isSameOriginRequest` check (403 `cross_origin_forbidden` if it fails) → `requireAuthenticatedSession` → `issueApiKeyForUser` → `{ id, rawKey, createdAt }`.
  - `onRequest` fallback → 405 `method_not_allowed`.
- `functions/api/account/inpage-api-keys/revoke.js`
  - `onRequestPost` → same-origin + session checks → `getActiveApiKeyForUser` (404 `no_active_key` if none) → `revokeActiveApiKeyForUser` → `{ ok: true }`.
  - `onRequest` fallback → 405.

### 3e. Beta route auth extension

In `functions/lib/inpage-unicode-api.mjs`, the existing bearer-check block becomes:

```text
token = extractBearerToken(request)
if token && timingSafeEqualString(token, env.INPAGE_API_BETA_SECRET) → authenticated (unchanged)
else if token → activeKey = await findActiveApiKeyByRawKey(env, token); authenticated if activeKey found
else → 401 authentication_failed
```

Import `findActiveApiKeyByRawKey` from the new `inpage-api-keys.mjs`. No change to the 401 error shape, CORS headers, size caps, or response shape — only the authentication predicate grows a second branch.

### 3f. Pages

- `/developers` (new, indexable, static or same v2 shell as other marketing pages): what the package/API does, code samples both directions, npm install line, CTA linking to `/account/developer-api` (which itself redirects through the existing sign-in flow if the visitor isn't authenticated — reuse the existing sign-in page's redirect-back mechanism, don't build a second one).
- `/account/developer-api` (new, noindex, client-hydrated from `/api/account/inpage-api-keys` the same way `sign-in.html` hydrates from `/api/me`): "No key yet" + Generate button, or key metadata + Regenerate/Revoke buttons; on generate, render the raw key once with copy-to-clipboard and a "shown once" warning banner.

## 4. Architecture

```text
GET  /api/account/inpage-api-keys        (new — session-gated, same-origin)
  → requireAuthenticatedSession → getActiveApiKeyForUser → { activeKey }

POST /api/account/inpage-api-keys        (new — session-gated, same-origin, CSRF-checked)
  → issueApiKeyForUser (revokes prior, inserts new) → { id, rawKey, createdAt }   [rawKey shown once]

POST /api/account/inpage-api-keys/revoke (new — session-gated, same-origin, CSRF-checked)
  → revokeActiveApiKeyForUser → { ok: true }

POST /api/v1/inpage-unicode/convert      (existing — public, CORS, bearer auth)
  Authorization: Bearer <token>
    == INPAGE_API_BETA_SECRET (constant-time)   → authenticated (unchanged)
    else findActiveApiKeyByRawKey(token)        → authenticated if active row found  (new)
    else                                         → 401 authentication_failed
  → unchanged conversion logic / response shape
```

No Worker, no Durable Object, no new D1 database — one new table on `METRICS_DB`, three new Pages Functions routes, two new static pages.

## 5. Testing

- `tests/inpage-api-keys-contract.test.js` (new): generation/hash round-trip; issuing a second key revokes the first (one-active-key invariant); a revoked key's hash no longer resolves via `findActiveApiKeyByRawKey`; account routes — 401 unauthenticated GET/POST, 403 cross-origin POST, 404 `no_active_key` on revoke with nothing active, 200 happy paths for GET/POST/revoke.
- Extend `tests/inpage-unicode-api-contract.test.js` with cases for the new auth branch: valid per-user key → 200; revoked key → 401; shared secret still works unchanged → 200.
- Add the new test file to `scripts/run-contract-tests.js`.
- Full `npm test` must stay green — zero regression on `WU-API-001` and `WU-AUTH-001`/`/api/me` contract tests.
- **Not covered by automated tests (manual, post-deploy):** the real production D1 migration apply; the actual Google OAuth round-trip landing back on `/account/developer-api` (covered in spirit by `WU-AUTH-001`'s own manual production-proof steps, not re-derived here).

## 6. Explicit non-goals for this slice

- Multiple keys, key labels, usage dashboards, billing, teams — same list as spec §6.
- Sunsetting `INPAGE_API_BETA_SECRET` — a later decision, not blocking this slice.
- Wiring key cleanup into account deletion — no such feature exists yet in this repo to wire into.

## 7. Manual steps only the founder can perform

1. Apply `migrations/0019_inpage_api_keys.sql` to the production `METRICS_DB` via `wrangler d1 migrations apply` (same manual process as every prior migration in this repo).
2. Later (not blocking): decide when to sunset the shared beta secret once self-serve keys are confirmed working for existing testers.
