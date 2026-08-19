# WU-AUTH-001 — Optional Social Authentication Foundation

**Status:** Planned — founder-approved 2026-08-13; implementation contract reconciled 2026-08-19  
**Area:** Account / identity  
**Routes:** `/sign-in`, `/api/auth/*`, `/api/me`, shared account controls  
**Depends on:** existing Cloudflare Pages deployment and protected anonymous writing baseline  
**Unblocks:** `WU-DRAFT-001` / My Documents  
**Parent boundary:** `WU-ACCOUNT-001`

## 1. Purpose

Add optional social identity so a user can later save selected Urdu writing to an account and continue it across sessions/devices.

Authentication is infrastructure, not the end feature. The first valuable authenticated product loop is:

```text
write anonymously
→ sign in when useful
→ Save to my account
→ My Documents
→ reopen later / on another device
→ continue writing
```

Accounts remain optional. Transliteration, the basic writer, Urdu keyboard, rich editor, local drafts/history, imports/exports and currently anonymous creation tools must continue to work without authentication.

Approved provider order:

1. **Google** — first production provider.
2. **Facebook** — fast-follow only after Google + My Documents cross-device restore is stable.

No email/password, magic-link or passkey flow is in the first program.

## 2. Reconciled implementation decision

The authentication stack to reuse is **Auth.js + Cloudflare D1**, not Auth0.

The primary implementation precedent is now InvoiceCraftly's merged 2026-08-15 Auth.js/D1 runtime rather than only the earlier OpenForBots research.

InvoiceCraftly demonstrated the target pattern on a static Cloudflare Pages product:

```text
static pages
   |
   +-- account shell
   +-- /api/me
   +-- /api/auth/*
            |
     project-owned auth wrapper
            |
         Auth.js
            |
       D1 adapter
            |
        ACCOUNT_DB
```

Reference first:

```text
abaidurrehman/invoicecraftly
  functions/lib/auth.mjs
  functions/api/auth/[[path]].js
  functions/api/me.js
  migrations/feature-88-account/0001_authjs_d1_foundation.sql
  test/feature-82-88-authjs-d1-foundation.test.js
  test/feature-82-88-google-account-shell.test.js
  context/implementation/feature-82-88-authjs-d1-foundation-implementation-2026-08-15.md
  context/implementation/feature-82-88-google-account-shell-implementation-2026-08-15.md
  context/specs/feature-82-88-authjs-account-foundation.md
  context/specs/feature-88-multi-provider-identity-phase-1.md
```

See `docs/WU-AUTH-INVOICECRAFTLY-REUSE-MAP-2026-08-19.md` for the exact port/adapt/do-not-copy matrix.

InvoiceCraftly recorded compatibility on 2026-08-15 with Auth.js core `0.41.3` and `@auth/d1-adapter` `1.11.3`. These are implementation evidence, **not permanent WriteUrdu pins**. Re-check current Auth.js, adapter and Cloudflare runtime behavior when the implementation slice starts.

Cloudflare Pages Functions must be added beside the static site. **Do not migrate WriteUrdu to Astro, React, Next or another framework to add accounts.**

## 3. Non-negotiable product invariants

1. Authentication is optional.
2. Anonymous writing remains first-class.
3. Auth failure/misconfiguration never disables local writing.
4. Signing in does not automatically upload local drafts/history.
5. Signing out does not delete local writing or account-backed documents.
6. OAuth navigation must preserve in-progress local writing.
7. Product authorization uses stable `session.user.id`, never email.
8. Identity scopes remain separate from storage/provider API scopes.
9. Provider access/refresh tokens never become generic browser product state.
10. No provider identities are silently merged merely because email strings match.
11. Auth.js imports/cookie/session implementation details stay behind one project-owned module.
12. Public profile, follower, team and collaboration behavior is not created by account existence.

## 4. Data-plane separation

The earlier WriteUrdu design used one application database for both Auth.js and writing content. This is superseded by the reconciled two-database boundary.

### Identity/session database

Use a dedicated D1 binding:

```text
ACCOUNT_DB
```

Auth.js owns its adapter tables, logically:

```text
users
accounts
sessions
verification_tokens
```

Use the schema required by the **currently installed** `@auth/d1-adapter` version. Do not customize adapter columns to fit WriteUrdu terminology.

Minimal product-owned account metadata may later live beside identity data only when there is a concrete account-lifecycle need. It must use separate migrations/tables and never alter Auth.js tables.

### Writing/product database

`WU-DRAFT-001` owns a separate binding:

```text
WRITE_URDU_DB
```

Urdu document bodies must never be stored in Auth.js adapter/session records.

Because the databases are separate, WriteUrdu product tables store the stable Auth.js user ID as an opaque ownership subject. Do not depend on a cross-D1 foreign key.

Do not reuse analytics/Product Pulse/OS storage for either auth or user writing.

## 5. Target runtime shape

```text
Static WriteUrdu pages
   |
   +-- anonymous/local writing (unchanged)
   |
   +-- /sign-in
   +-- /api/me
   +-- /api/auth/*
            |
      functions/lib/auth.mjs
            |
         Auth.js
            |
       D1Adapter
            |
        ACCOUNT_DB
```

Only one WriteUrdu-owned module may directly import `@auth/core`, provider modules or `@auth/d1-adapter`.

Expected project-facing interface:

```js
getAuthReadiness(env)
authEnabled(env)
buildIdentityProviders(env)
handleAuthRequest(request, env)
getSession(request, env)
```

A helper such as `getCurrentUser()` may be added if it genuinely simplifies product APIs, but product code must not depend on Auth.js cookies or adapter internals.

## 6. Configuration and readiness contract

Expected environment/bindings:

```text
AUTH_ENABLED
AUTH_SECRET
ACCOUNT_DB
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
FACEBOOK_CLIENT_ID       // later
FACEBOOK_CLIENT_SECRET   // later
```

Secrets stay in Cloudflare configuration and never in source/static build output.

### Readiness states

Use explicit states equivalent to:

```text
disabled
misconfigured
ready
```

`AUTH_ENABLED !== 'true'` means disabled.

Auth core is ready only when:

- `AUTH_ENABLED === 'true'`;
- `AUTH_SECRET` is present;
- `ACCOUNT_DB` is a valid D1 binding;
- at least one identity provider has a complete credential/config pair.

Provider readiness must be data-driven from the start. Google is the first provider, but the long-term auth readiness check must not require Google specifically once Facebook exists.

A partially configured optional provider fails **that provider** closed; it must not disable another correctly configured provider.

### Operational behavior

When disabled:

- `/api/auth/*` returns a safe disabled/not-enabled response;
- `/api/me` resolves safely as unauthenticated/not-enabled;
- account controls are hidden or safe-disabled;
- writing behaves exactly as before.

When misconfigured:

- account routes fail safely;
- operational logs expose normalized missing configuration identifiers only, never values;
- anonymous/local product remains available.

## 7. Provider contract

### 7.1 Google — first provider

Use the current Auth.js Google provider.

Identity permissions must remain equivalent to:

```text
openid email profile
```

Do not request:

- Google Drive;
- Gmail;
- Calendar;
- Contacts;
- Cloud Platform;
- storage/offline scopes unrelated to basic identity.

The provider appears in UI only when its complete required configuration is ready.

Google account addresses are not limited to `@gmail.com`; user-facing copy should say **Continue with Google**, not “Gmail-only”.

### 7.2 Facebook — later provider

Facebook is implemented only after the Google + My Documents cross-device loop is stable.

Requirements:

- current Auth.js Facebook provider at implementation time;
- identity-only permissions;
- tolerate missing email;
- missing profile image/name must degrade safely;
- Facebook configuration errors must not regress Google;
- no friends, Page, posting, Messenger, ads or Instagram permissions.

### 7.3 No automatic provider linking

Do not automatically merge Google/Facebook users because their email strings match.

Keep safe Auth.js behavior equivalent to:

```text
allowDangerousEmailAccountLinking: false
```

If a future explicit `Connected accounts` feature is wanted, it must prove control of both identities while already authenticated and receive its own security/account-recovery review.

## 8. Session and `/api/me` contract

Use database sessions and expose stable adapter user identity to product code as:

```text
session.user.id
```

`/api/me` is the only small product-facing account projection needed by the static shell.

Authenticated response may be equivalent to:

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

Unauthenticated response must be deterministic and safe.

Rules:

- return only fields needed by product UI;
- never expose access/refresh tokens;
- never expose OAuth state/code;
- account/session responses use `Cache-Control: no-store`;
- add `X-Content-Type-Options: nosniff` and appropriate referrer protection where practical;
- email/image/name are optional profile data; stable `id` is the authorization subject.

## 9. Redirect and local-writing preservation

This is a release-critical WriteUrdu behavior.

Before leaving the writer for OAuth:

1. flush/save current editor state using the existing `js/editor-tools.js` / editor adapter path;
2. do not place Urdu text/rich HTML in OAuth state, callback or return-target query parameters;
3. persist only a safe same-origin return location/context;
4. complete OAuth;
5. return only to allowlisted same-origin WriteUrdu routes;
6. normal writer bootstrap restores canonical browser-local state;
7. signing out must leave local content/history untouched.

Expected proof flow:

```text
type meaningful Urdu content
→ wait/flush local save
→ Sign in
→ Google OAuth
→ return to writer
→ exact local content still present
→ Sign out
→ content still present
```

Test the rich editor with formatting as well as plain Urdu text.

## 10. Account UX contract

### Signed out

Shared account control:

```text
Sign in
```

It must not dominate the primary writing action.

### Sign-in page

Create a static, noindex `/sign-in` page using the current v2 shell.

Core message should explain the value in simple language:

- sign in to save selected writing to your account and continue later;
- existing local drafts are not uploaded automatically;
- writing still works without an account.

Primary actions:

```text
Continue with Google
Continue without an account
```

Facebook appears only after it is implemented/configured.

Do not make the page a generic social-login wall.

### Signed in

Compact menu may expose:

```text
My Documents
Account
Sign out
```

Do not expose backend language such as D1, session, cloud binding or provider tokens.

### Static-shell hydration

Hydrate account state client-side from `/api/me`.

Reserve a stable account-control footprint so session lookup does not materially shift the header or push the authoring canvas lower on mobile.

Auth/session lookup must never block transliteration/editor initialization.

## 11. Security requirements

- current official Auth.js/Cloudflare behavior must be checked at implementation time;
- Auth.js handles supported CSRF/state/OAuth mechanics; do not hand-roll OAuth;
- same-origin/allowlisted callback/return targets only;
- no open redirects;
- no auth/session/provider tokens in analytics or logs;
- no Urdu document content in auth logs;
- sanitized normalized auth logger;
- no request-scoped mutable module globals;
- account responses `no-store`;
- secrets never shipped to client build;
- stable secure IDs from supported platform/adapter behavior;
- no automatic email-based provider linking;
- product APIs authorize only by stable session user ID;
- do not broaden CSP/third-party allowances more than required for OAuth navigation.

## 12. Privacy and account lifecycle

Before accounts are broadly promoted, Privacy must explain that WriteUrdu stores identity/session data when a user creates an account.

Before account-backed documents are broadly enabled, Privacy must also explain what writing is stored, how it is deleted and the distinction between local browser data and account-backed data.

A public account product must have a documented deletion lifecycle. At minimum the implementation program must decide:

- how the user requests account deletion;
- what happens to Auth.js identity/session rows;
- what happens to `WRITE_URDU_DB` documents owned by that user;
- whether deletion is immediate or queued;
- what happens to local browser drafts (they cannot be remotely deleted reliably);
- what audit/retention metadata, if any, is legally/operationally required.

Do not market “delete your account/data” until the implemented behavior matches the claim.

## 13. Error normalization

Do not expose raw Auth.js/provider errors directly to users.

Product-facing categories may include:

```text
auth-disabled
auth-unavailable
provider-unavailable
provider-cancelled
account-not-linked
session-expired
```

Messages must remain non-destructive and always preserve a path back to anonymous writing.

For a same-email provider collision, do not reveal unnecessary provider/account metadata. Guide the user to the sign-in method previously used or allow them to continue without an account.

## 14. Implementation slices

### AUTH-A — foundation only

Use `.claude/skills/wu-auth-authjs-d1-foundation/SKILL.md`.

Deliver:

- Auth.js dependencies compatible with current Cloudflare runtime;
- dedicated `ACCOUNT_DB` binding contract;
- adapter-compatible migration;
- `functions/lib/auth.mjs` single import boundary;
- `/api/auth/*` catch-all;
- `/api/me`;
- disabled/misconfigured/ready behavior;
- no-store/sanitized logging/same-origin redirect contract;
- focused tests.

**Do not add account shell UI in this slice.**

**Exit:** auth disabled by default leaves the anonymous site unchanged, and the backend foundation is deterministic under local/test configuration.

### AUTH-B — Google + account shell

Use `.claude/skills/wu-auth-account-shell/SKILL.md` plus the Google provider reference.

Deliver:

- Google provider/config;
- `/sign-in` UI;
- CSRF-safe sign-in flow required by the installed Auth.js version;
- account-state hydration;
- sign-out;
- local-writing preservation before OAuth;
- real custom-domain callback/session proof.

**Exit:** Google sign-in, `/api/me`, return-to-writer and sign-out work end to end without losing local writing.

### AUTH-C — product value

Implement `WU-DRAFT-001` / My Documents. Login alone is not considered the completed user-value initiative.

### AUTH-D — Facebook

Use `.claude/skills/wu-auth-add-provider/SKILL.md` after the Google + My Documents cross-device loop is stable.

## 15. Contract tests

Required backend/auth coverage:

- `AUTH_ENABLED` off => safe disabled behavior;
- missing `AUTH_SECRET` => misconfigured/fail closed;
- missing/invalid `ACCOUNT_DB` => misconfigured/fail closed;
- no complete providers => unavailable;
- complete Google credentials => provider ready;
- incomplete Google pair => provider excluded/unavailable;
- future Facebook partial config does not disable valid Google;
- `/api/me` signed out => deterministic unauthenticated response;
- authenticated session exposes stable user ID;
- direct Auth.js imports confined to the auth wrapper;
- same-origin redirect accepted;
- external-origin redirect rejected/falls back safely;
- account/session responses are `no-store`;
- no storage/provider-data scope appears in Google identity login.

## 16. Browser and production proof

Before calling Google auth ready on production:

1. create meaningful local Urdu content in the homepage/basic writer;
2. enter sign-in through the real product control;
3. complete Google OAuth on the custom production domain;
4. return to the intended WriteUrdu route;
5. confirm local content is unchanged;
6. confirm `/api/me` returns the allowlisted authenticated projection with stable ID;
7. confirm expected Auth.js `users`, `accounts` and `sessions` rows exist in `ACCOUNT_DB`;
8. confirm no writing content exists in auth rows;
9. sign out and confirm local content/history remains;
10. cancel OAuth once and confirm local writing remains usable;
11. verify homepage transliteration, Urdu keyboard and rich editor still work signed out;
12. inspect built/static assets for secrets/tokens;
13. verify narrow/mobile account UI does not cover or materially displace the writer.

## 17. Rollback

`AUTH_ENABLED=false` must cleanly remove/disable account behavior without changing browser-local writing persistence.

Disabling auth must not:

- delete `ACCOUNT_DB` data;
- delete `WRITE_URDU_DB` data;
- clear local drafts/history;
- alter transliteration;
- alter static SEO/canonical behavior.

Provider-specific failure should be recoverable by disabling/removing that provider configuration without affecting another valid provider.

## 18. Stop conditions

Stop and fix before moving to account-backed documents if:

- anonymous writing waits on `/api/me` or auth availability;
- implementation requires a framework migration;
- Auth.js imports spread into product/editor modules;
- secrets appear in source/build output;
- stable user ID is missing from sessions;
- OAuth navigation loses local work;
- external return URLs are accepted;
- Pages Functions routing captures/breaks public static SEO routes;
- identity login requests provider storage/social permissions;
- auth runtime cost/compatibility cannot be kept within an acceptable Cloudflare posture.

## 19. Out of scope

- mandatory accounts;
- email/password;
- magic links;
- passkeys;
- automatic provider linking;
- Google Drive/Dropbox/OneDrive authorization;
- Gmail/Calendar/Contacts access;
- generic file storage;
- public creator profiles;
- following/followers;
- teams/workspaces;
- collaboration/comments;
- billing/subscriptions;
- Card Studio image/project cloud storage;
- framework migration.

## 20. Acceptance criteria

- [ ] Anonymous writing/local drafts remain unchanged when signed out or auth is unavailable.
- [ ] Auth.js is isolated behind one WriteUrdu-owned module.
- [ ] Dedicated `ACCOUNT_DB` is used for Auth.js identity/session data.
- [ ] Writing content is not stored in Auth.js tables.
- [ ] Provider readiness is data-driven and fail-closed.
- [ ] Google works end to end on the production custom domain.
- [ ] `session.user.id` is stable and used for authorization.
- [ ] `/api/me` exposes only the allowlisted product account projection.
- [ ] OAuth return preserves in-progress local Urdu writing and rich formatting.
- [ ] Sign-out does not delete local writing.
- [ ] Provider scopes are identity-only.
- [ ] No automatic Google/Facebook email merge exists.
- [ ] Account/session responses are non-cacheable.
- [ ] Secrets/tokens are absent from logs/static build output.
- [ ] Facebook is added only after My Documents cross-device continuity is stable.
- [ ] Privacy/account-deletion behavior is documented before broad account promotion.

## Related

- `specs/WU-ACCOUNT-001-account-document-platform-boundary.md`
- `specs/WU-DRAFT-001-cross-device-cloud-drafts.md`
- `docs/WU-AUTH-INVOICECRAFTLY-REUSE-MAP-2026-08-19.md`
- `docs/WU-AUTH-DRAFTS-IMPLEMENTATION-PLAN-2026-08-13.md`
- `.claude/skills/wu-auth-authjs-d1-foundation/SKILL.md`
- `.claude/skills/wu-auth-account-shell/SKILL.md`
- `.claude/skills/wu-auth-add-provider/SKILL.md`
