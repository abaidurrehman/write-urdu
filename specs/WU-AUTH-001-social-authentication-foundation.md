# WU-AUTH-001 — Optional Social Authentication Foundation

**Status:** Planned — founder-approved 2026-08-13; reconciled 2026-08-19  
**Area:** Account / identity  
**Routes:** `/sign-in`, `/api/auth/*`, `/api/me`, shared account controls  
**Depends on:** existing Cloudflare Pages deployment, existing `METRICS_DB` D1 binding, anonymous-writing baseline  
**Unblocks:** `WU-DRAFT-001` / My Documents  
**Parent:** `WU-ACCOUNT-001`

## 1. Purpose

Add optional identity so a user can save selected Urdu writing to an account and continue later or on another device.

Authentication is infrastructure. The first valuable authenticated loop is:

```text
write anonymously
→ sign in when useful
→ Save to my account
→ My Documents
→ reopen
→ continue writing
```

Accounts remain optional. Transliteration, basic writer, Urdu keyboard, rich editor, local drafts/history and existing anonymous creation/export tools must continue working without authentication.

Provider order:

1. Google first.
2. Facebook only after Google + My Documents cross-device restore is stable.

No email/password, magic-link or passkey flow is in the first program.

## 2. Implementation decision

Reuse the proven **Auth.js + Cloudflare D1** pattern from InvoiceCraftly, not Auth0 and not a new auth architecture.

Primary reference implementation:

```text
abaidurrehman/invoicecraftly
  functions/lib/auth.mjs
  functions/api/auth/[[path]].js
  functions/api/me.js
  migrations/feature-88-account/0001_authjs_d1_foundation.sql
  test/feature-82-88-authjs-d1-foundation.test.js
  test/feature-82-88-google-account-shell.test.js
```

InvoiceCraftly proved the Pages Functions/Auth.js/D1 pattern. WriteUrdu must reuse the pattern but **not its dedicated-database decision**.

WriteUrdu already has one production D1 database exposed as `METRICS_DB`, currently used by telemetry and share-artifact functionality. Because D1 database count is constrained, this feature must reuse that database.

Do not migrate WriteUrdu to Astro/React/Next or another framework for auth.

## 3. Non-negotiable invariants

1. Authentication is optional.
2. Anonymous writing remains first-class.
3. Auth failure never disables local writing.
4. Sign-in does not automatically upload local drafts/history.
5. Sign-out does not delete local writing or remote documents.
6. OAuth navigation preserves in-progress local writing.
7. Authorization uses stable `session.user.id`, never email.
8. Identity permissions stay separate from provider storage/data permissions.
9. Auth/session/provider tokens never become generic browser product state.
10. No automatic provider merge by matching email.
11. Only one WriteUrdu module imports Auth.js directly.
12. Account existence does not create public profile/follower/team/collaboration behavior.
13. No new D1 database is introduced for auth.

## 4. Shared D1 architecture

### Existing physical database

Use the existing Pages Functions binding:

```text
METRICS_DB
```

The binding name is historical and must not drive schema design. It now represents the existing WriteUrdu application D1 database.

Expected table domains after auth is added:

```text
METRICS_DB
│
├── existing telemetry tables
├── existing share-artifact tables
│
└── Auth.js adapter tables
    ├── users
    ├── accounts
    ├── sessions
    └── verification_tokens
```

Use the schema required by the installed `@auth/d1-adapter` version at implementation time.

### Logical isolation rules

- Auth.js tables are adapter-owned.
- Existing telemetry/share tables are not modified by auth migrations.
- Auth code receives `env.METRICS_DB` and passes it to `D1Adapter(...)`.
- Product APIs obtain identity through the project auth wrapper; they do not query Auth.js session/account tables directly.
- Urdu document content never appears in Auth.js tables or telemetry rows.
- Existing migrations are immutable; auth uses a new numbered migration after current migrations.

At the current baseline, the expected next migration is conceptually:

```text
migrations/0005_authjs_d1_foundation.sql
```

Reconcile numbering with current `main` before implementation.

## 5. Target runtime

```text
Static WriteUrdu pages
   |
   +-- anonymous/local writing
   +-- /sign-in
   +-- /api/me
   +-- /api/auth/*
            |
      functions/lib/auth.mjs
            |
         Auth.js
            |
       D1Adapter(env.METRICS_DB)
```

Only one WriteUrdu-owned module may import `@auth/core`, provider modules or `@auth/d1-adapter`.

Expected project-facing interface:

```js
getAuthReadiness(env)
authEnabled(env)
buildIdentityProviders(env)
handleAuthRequest(request, env)
getSession(request, env)
```

## 6. Configuration/readiness contract

Expected environment:

```text
AUTH_ENABLED
AUTH_SECRET
METRICS_DB                 # existing D1 binding
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
FACEBOOK_CLIENT_ID         # later
FACEBOOK_CLIENT_SECRET     # later
```

Do not create `ACCOUNT_DB` or a second auth D1 binding.

Readiness states:

```text
disabled
misconfigured
ready
```

Auth core is ready only when:

- `AUTH_ENABLED === 'true'`;
- `AUTH_SECRET` exists;
- `METRICS_DB` is a valid D1 binding;
- at least one provider has a complete configuration.

A broken optional provider fails itself closed without disabling another valid provider.

When disabled/misconfigured, `/api/auth/*` and `/api/me` fail safely while writing continues normally.

## 7. Provider contract

### Google

Use current Auth.js Google provider with identity-only permissions equivalent to:

```text
openid email profile
```

Do not request Drive, Gmail, Calendar, Contacts, Cloud Platform or unrelated offline/storage permissions.

User-facing copy says **Continue with Google**; it is not Gmail-only.

### Facebook

Implement only after the Google + My Documents flow is stable.

Requirements:

- current Auth.js Facebook provider;
- identity-only permissions;
- tolerate missing email/image/name;
- Facebook failure must not regress Google;
- no friends/Page/posting/Messenger/ads/Instagram permissions.

### No automatic account linking

Keep safe behavior equivalent to:

```text
allowDangerousEmailAccountLinking: false
```

A future explicit connected-accounts flow requires separate security and recovery design.

## 8. Session and `/api/me`

Use database sessions and expose stable adapter identity as `session.user.id`.

Authenticated projection may be:

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

Rules:

- only UI-required fields;
- never expose provider/session tokens;
- `Cache-Control: no-store`;
- `X-Content-Type-Options: nosniff`;
- stable `id` is the authorization subject;
- name/email/image are optional profile fields.

## 9. Redirect and local-writing preservation

Before OAuth:

1. flush/save current writer through existing `js/editor-tools.js` / adapter behavior;
2. never serialize Urdu text/rich HTML into OAuth state or query strings;
3. retain only a safe same-origin return route;
4. complete OAuth;
5. return only to allowlisted same-origin WriteUrdu routes;
6. normal writer startup rehydrates local content;
7. sign-out leaves local content/history untouched.

Required proof:

```text
type Urdu content
→ save/flush locally
→ Google sign-in
→ return
→ same content present
→ sign out
→ same content present
```

Include rich-editor formatting in regression proof.

## 10. Account UX

Signed out: `Sign in`.

Create a static noindex `/sign-in` page using the v2 shell with:

```text
Continue with Google
Continue without an account
```

The page must say that existing local writing is not automatically uploaded and that writing remains available without an account.

Signed-in menu:

```text
My Documents
Account
Sign out
```

Hydrate account state client-side from `/api/me` without blocking transliteration/editor initialization or materially shifting the header/canvas.

## 11. Security requirements

- verify current Auth.js/Cloudflare behavior before implementation;
- do not hand-roll OAuth/CSRF/session cookies;
- same-origin/allowlisted return targets only;
- no tokens/secrets/writing content in logs or analytics;
- sanitized auth logger;
- no request-scoped mutable globals;
- account/session responses `no-store`;
- secrets absent from static assets;
- stable user ID for authorization;
- no automatic email linking;
- auth module is the only code allowed to depend on Auth.js internals.

### Shared-database safety

Because auth shares `METRICS_DB` with existing product data:

- auth migrations must be additive only;
- never drop/rename existing telemetry/share tables;
- migration verification must inspect existing tables before and after;
- rollback disables auth through `AUTH_ENABLED=false`; it does not drop tables;
- auth runtime must not run telemetry/share schema maintenance;
- telemetry/share runtime must not inspect Auth.js tables.

## 12. Account lifecycle/privacy

Before public account promotion, Privacy must explain identity/session storage.

Before My Documents launch, Privacy must also explain stored writing, deletion and the distinction between local and account-backed content.

Account deletion design must define:

- Auth.js user/account/session deletion;
- deletion of product-owned documents for that `user_id`;
- local browser drafts remain outside remote deletion control;
- any required operational retention.

Sharing one D1 database does not mean sharing retention policies: deletion is table/domain-specific.

## 13. Implementation slices

### AUTH-A — backend foundation

Use `.claude/skills/wu-auth-authjs-d1-foundation/SKILL.md`.

Deliver:

- Auth.js dependencies;
- adapter migration in the existing migration sequence;
- reuse `METRICS_DB`;
- `functions/lib/auth.mjs`;
- `/api/auth/*`;
- `/api/me`;
- readiness/fail-closed behavior;
- safe headers/logging/redirects;
- tests proving existing database tables remain untouched.

**Do not add account UI or documents in AUTH-A.**

### AUTH-B — Google + account shell

Use `.claude/skills/wu-auth-account-shell/SKILL.md`.

Deliver Google provider, `/sign-in`, session-aware header, sign-out, local-writing preservation and real production callback/session proof.

### AUTH-C — My Documents

Implement `WU-DRAFT-001` using the same existing `METRICS_DB` database with a separate product-owned table.

### AUTH-D — Facebook

Only after Google + My Documents cross-device continuity is stable.

## 14. Required tests

Backend:

- auth off => safe disabled behavior;
- missing `AUTH_SECRET` => fail closed;
- missing/invalid `METRICS_DB` => fail closed;
- complete Google config => ready;
- incomplete provider => excluded;
- `/api/me` signed out => deterministic unauthenticated result;
- authenticated session exposes stable ID;
- Auth.js imports confined to one module;
- same-origin redirect accepted and external redirect rejected;
- account/session responses `no-store`;
- Google scopes are identity-only;
- existing telemetry/share tables still exist after auth migration;
- no auth migration modifies/drops existing table definitions unexpectedly.

Production proof:

1. meaningful local Urdu content exists;
2. Google sign-in completes on canonical custom domain;
3. content survives return;
4. `/api/me` exposes stable user ID;
5. expected Auth.js rows exist in the existing D1 database;
6. no Urdu writing exists in auth rows;
7. existing telemetry/share endpoints still work;
8. sign-out preserves local work;
9. OAuth cancellation is non-destructive;
10. anonymous basic/rich/keyboard flows still pass.

## 15. Rollback

`AUTH_ENABLED=false` disables account behavior without database deletion or migration rollback.

Do not drop shared-database Auth.js tables as a normal rollback because the physical database also serves unrelated production features.

## 16. Acceptance criteria

- [ ] No new D1 database is created for auth.
- [ ] Existing `METRICS_DB` is passed to Auth.js D1 adapter.
- [ ] Auth migration is additive and preserves existing telemetry/share tables.
- [ ] Anonymous writing remains unchanged.
- [ ] Auth.js is isolated behind one WriteUrdu module.
- [ ] Google works end to end on production domain.
- [ ] Stable `session.user.id` is used for product authorization.
- [ ] OAuth return and sign-out preserve local writing.
- [ ] Identity scopes are minimal.
- [ ] No automatic provider linking exists.
- [ ] Account UI is noindex and non-blocking.
- [ ] Privacy/account-deletion lifecycle is addressed before broad launch.

## Related

- `specs/WU-ACCOUNT-001-account-document-platform-boundary.md`
- `specs/WU-DRAFT-001-cross-device-cloud-drafts.md`
- `docs/WU-AUTH-INVOICECRAFTLY-REUSE-MAP-2026-08-19.md`
- `docs/WU-AUTH-DRAFTS-IMPLEMENTATION-PLAN-2026-08-13.md`
