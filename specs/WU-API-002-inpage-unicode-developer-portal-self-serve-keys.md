# WU-API-002 — InPage↔Unicode Developer Portal & Self-Serve API Keys

Status: **Planned — founder-directed exception to `BACKLOG.md` rule 7, and a deliberate early pull-forward of `WU-API-001` §11**
Reuses: `WU-API-001` (beta API + npm package, implemented), `WU-AUTH-001` (Google sign-in + Auth.js/`METRICS_DB`, implemented core)
Date: 2026-09-06

## 1. Problem

`WU-API-001`'s beta API only has one door in: a single shared bearer secret you hand to testers by email. There is no public page explaining the API, no way for a developer to get access without contacting you directly, and no per-developer identity — everyone shares one secret and one rate-limit bucket.

## 2. Product promise

A small self-serve layer on top of the already-shipped beta API:

- a public **`/developers`** page (marketing + docs, mirrors InvoiceCraftly's own developer page) explaining the npm package and the API, with both-direction code samples and a "Sign in with Google to get your API key" call to action;
- a signed-in **`/account/developer-api`** page where a user generates, copies (once), and revokes their own key;
- the existing beta route accepts a per-user key in addition to the legacy shared secret, so distribution stops depending on you personally emailing a string.

No new conversion behavior. No new engine. This is a distribution/access-control layer only, on top of `WU-API-001`.

## 3. Why this is a founder decision, not a default next step

`WU-API-001` §11 explicitly put "real per-developer API keys" on **Hold** until Phase A/B showed real external usage — and as of this writing, the beta secret has been verified working but not yet handed to a single tester. Building self-serve keys now is *ahead* of that stated gate, so it is recorded here the same way the original P0.1 exception was: as an explicit, reasoned decision, not a silent scope-creep.

The reasoning for pulling it forward anyway:

- the actual blocker to learning about demand right now is that access requires emailing you — self-serve keys are the mechanism for finding out if anyone wants this, not a reward for having already proven it;
- everything this needs already exists and is already paid for: Google sign-in, session handling, and the `METRICS_DB` D1 database (`WU-AUTH-001`, implemented core) — this is not new infrastructure, it's one more table on an existing database and two more session-gated routes on an existing auth stack;
- it stays isolated the same way `WU-API-001` did: no `WU-PLAT-002H`-owned file, no Basic/Rich Editor, no mobile-activation surface is touched.

If building this starts requiring changes to the shared auth stack's *existing* behavior (Google provider config, session cookie handling, sign-in page flow) rather than additive use of it, stop — that means the isolation assumption broke.

## 4. Reused foundation (do not re-derive)

- Auth/session: `functions/lib/auth.mjs` (`getAuthReadiness`, `getSession`) and `/api/me` — already implements Google sign-in on `METRICS_DB` via the Auth.js D1 adapter. Do not add a new OAuth flow or a new database.
- Beta API: `functions/lib/inpage-unicode-api.mjs`, `functions/api/v1/inpage-unicode/convert.js` — the route this work adds a second auth path to.
- Pattern to mirror (technique, not code): InvoiceCraftly Feature 102.4 — `functions/lib/document-api-keys.mjs`, `functions/lib/account-lifecycle.mjs`, `functions/api/account/api-keys/{index,revoke}.js`, `src/developers/index.html`, `src/account/api-keys/index.html`. Same shape: SHA-256-hashed key, prefix + random bytes, one active key per user, raw key shown exactly once, session-gated + same-origin-checked issue/revoke routes.

## 5. Scope

### 5a. Storage — one new table on the existing `METRICS_DB`

New migration, `inpage_api_keys` (name distinct from InvoiceCraftly's `document_api_keys` — different product, different table):

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

No new D1 database or binding. This is additive to `METRICS_DB`, the same database `WU-AUTH-001`/`WU-DRAFT-001` already extended.

### 5b. Key lifecycle library

New `functions/lib/inpage-api-keys.mjs` (local, not imported from InvoiceCraftly):

- `generateRawApiKey()` — prefix `wu_inpage_live_` + 32 random bytes, base64url.
- `hashApiKey(rawKey)` — SHA-256 hex via `crypto.subtle.digest`, same technique as `timing-safe-equal.mjs`'s neighbor module.
- `issueApiKeyForUser(env, userId)` — revokes any existing active key for the user, inserts the new hash, returns the **raw key once**.
- `revokeActiveApiKeyForUser(env, userId)`.
- `getActiveApiKeyForUser(env, userId)` — metadata only (`id`, `createdAt`); never returns the raw key or hash.
- `findActiveApiKeyByRawKey(env, rawKey)` — hashes and looks up by `key_hash`; used by the beta route's auth check.

One active key per user, same as InvoiceCraftly's pattern — no multi-key management in this slice.

### 5c. Account routes (session-gated, same-origin only — not the public CORS route)

- `functions/api/account/inpage-api-keys/index.js`
  - `GET` → requires session; returns `{ activeKey: { id, createdAt } | null }`.
  - `POST` → requires session **and** same-origin (`Origin` header check, mirrors InvoiceCraftly's `isSameOriginRequest`); issues a new key, returns `{ id, rawKey, createdAt }` — the only response that ever carries the raw key.
- `functions/api/account/inpage-api-keys/revoke.js`
  - `POST` → requires session + same-origin; revokes the active key; 404 `no_active_key` if none.

Write local `isSameOriginRequest` / `requireAuthenticatedSession` equivalents in a small new `functions/lib/account-request-guard.mjs` (or inline if only these two routes use it) — do not import InvoiceCraftly's `account-lifecycle.mjs` across repos.

### 5d. Beta route auth — add a second accepted credential

`functions/lib/inpage-unicode-api.mjs`'s bearer check currently accepts only `env.INPAGE_API_BETA_SECRET` via constant-time compare. Extend it to:

1. If the bearer token equals the shared beta secret (constant-time) → authenticated (unchanged path, keeps already-distributed testers working).
2. Else, hash the token and look it up via `findActiveApiKeyByRawKey` → authenticated if an active row is found.
3. Else → 401 `authentication_failed` (unchanged error shape).

This adds one D1 read to the hot path only when the shared secret doesn't match — still O(1) indexed lookup, negligible against the engine's own O(n) cost. The per-key branch is a hash-then-indexed-lookup, not a constant-time string compare; that's an accepted, deliberate difference from the shared-secret branch (same posture InvoiceCraftly's own key lookup uses) — constant-time comparison exists to prevent timing attacks on a *fixed secret string*, which does not apply to a keyed DB lookup.

### 5e. Pages

- **`/developers`** (public, indexable) — mirrors InvoiceCraftly's `src/developers/index.html` structure: what the API/package does, both-direction code samples, npm install line, link to the package README, "Sign in with Google to get your API key" CTA linking to `/account/developer-api`.
- **`/account/developer-api`** (noindex, session-gated like `sign-in.html`'s account state) — hydrates from the new `GET /api/account/inpage-api-keys` route; shows "No key yet" + Generate, or key metadata + Regenerate/Revoke; on generate, shows the raw key **once** with a copy button and an explicit "we can't show this again" warning.

## 6. Non-goals for this slice

- Multiple keys per user, key naming/labels.
- Usage dashboards, per-key quota beyond the existing IP-based Cloudflare Rate Limiting rule.
- Billing.
- Teams or shared keys.
- Sunsetting the shared `INPAGE_API_BETA_SECRET` — both credential forms stay valid until existing testers are confirmed migrated; that's a later, separate decision.
- Full OpenAPI docs site (still just one reference page, now with a signup path).

## 7. Security

- Raw key returned exactly once, at issuance; only its hash is ever persisted or logged (never persisted or logged either).
- One active key per user — issuing a new key immediately revokes the previous one, so a leaked-and-regenerated key stops working.
- Issue/revoke routes require both an authenticated session and a same-origin request (CSRF posture matching InvoiceCraftly's account routes).
- `/account/developer-api` never talks to D1 directly — only through the session-gated API routes, matching the existing rule that UI never accesses D1 directly (`wu-auth-account-shell` skill).
- Forward-looking note: if/when write-urdu ships account deletion, it must also delete the user's `inpage_api_keys` rows — there is no account-deletion feature to hook into yet, so nothing to wire up in this slice, but do not forget it when that ships.

## 8. Testing

- New `tests/inpage-api-keys-contract.test.js`: key generation/hash round-trip; one-active-key-per-user invariant (issuing twice revokes the first); `findActiveApiKeyByRawKey` returns null for a revoked key; GET/POST/revoke routes — 401 unauthenticated, 403 cross-origin on state-changing routes, 404 `no_active_key` on revoke with nothing active, 200 happy path.
- Extend `tests/inpage-unicode-api-contract.test.js` (or add a case) confirming the beta route accepts both the shared secret and a valid per-user key, and rejects a revoked key.
- Add both test files to `scripts/run-contract-tests.js`.
- Full `npm test` must stay green — zero regression on `WU-API-001`'s existing contract tests.

## 9. Acceptance criteria

- [ ] `inpage_api_keys` migration applied to `METRICS_DB`.
- [ ] Signed-in user can generate, see metadata for, and revoke their own key at `/account/developer-api`.
- [ ] Beta route accepts a valid per-user key exactly like the shared secret; rejects a revoked key.
- [ ] `/developers` page live, public, links into the sign-in flow.
- [ ] Existing shared-secret testers continue to work unchanged.
- [ ] Zero regression on `WU-API-001` and `WU-AUTH-001` contract tests.

## 10. Manual steps only the founder can perform

1. Apply the new D1 migration to the production `METRICS_DB` (no `migrate` script exists in `package.json` — this repo's existing migrations 0001–0018 are applied manually via `wrangler d1 migrations apply`, same as this one will be).
2. Decide, later, when/whether to sunset the shared `INPAGE_API_BETA_SECRET` once real testers have self-serve keys — not required for this slice to ship.
