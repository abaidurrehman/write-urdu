# WriteUrdu — InvoiceCraftly Auth Reuse Map

**Date:** 2026-08-19  
**Purpose:** Tell implementation agents exactly what to reuse from InvoiceCraftly, what to adapt for WriteUrdu, and what not to copy.

## 1. Decision

InvoiceCraftly is the primary internal implementation precedent for WriteUrdu authentication because it already shipped the same essential runtime pattern:

```text
static Cloudflare Pages
+ Pages Functions
+ Auth.js
+ D1 adapter
+ Google identity
+ /api/me
+ local-work preservation through OAuth
```

WriteUrdu should **port the proven auth boundary, not redesign authentication**.

One deliberate difference is required by WriteUrdu's platform constraints:

> InvoiceCraftly uses a dedicated `ACCOUNT_DB`; WriteUrdu must reuse its existing D1 database exposed as `METRICS_DB` because we want to preserve limited D1 database allocations.

## 2. Primary InvoiceCraftly references

Inspect current `main` before implementation, especially:

```text
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

Treat versions recorded there as compatibility evidence, not permanent pins. Re-check current packages and Cloudflare behavior at implementation time.

## 3. Port / adapt / reject matrix

| InvoiceCraftly pattern | WriteUrdu decision | Notes |
| --- | --- | --- |
| `@auth/core` + `@auth/d1-adapter` | **Port** | Revalidate current compatible versions |
| one `functions/lib/auth.mjs` import boundary | **Port** | Strong architecture boundary |
| `/api/auth/*` Pages Functions catch-all | **Port** | Adapt extension/style to repo conventions |
| `/api/me` allowlisted identity projection | **Port** | Stable ID + optional name/email/image only |
| database session strategy | **Port** | Required for stable product user identity |
| `AUTH_ENABLED` fail-closed gate | **Port** | Anonymous site must remain usable |
| readiness state disabled/misconfigured/ready | **Port** | Generalize for future providers |
| Google `openid email profile` identity scope | **Port** | Never add Drive/Gmail/etc. here |
| same-origin redirect callback | **Port** | Adapt allowed WriteUrdu routes |
| sanitized auth logging | **Port** | No tokens or Urdu content |
| `Cache-Control: no-store` | **Port** | `/api/me` and auth/account responses |
| `allowDangerousEmailAccountLinking: false` | **Port** | No silent provider merge |
| local save before OAuth navigation | **Port concept** | Use WriteUrdu `editor-tools.js` adapters |
| dedicated `ACCOUNT_DB` | **Do not port** | Use existing `env.METRICS_DB` instead |
| invoice Workspace persistence | **Reject** | WriteUrdu has its own local draft/document model |
| Personal Cloud / Dropbox / Drive logic | **Reject** | Not part of account identity or My Documents v1 |
| billing/entitlement logic | **Reject** | WriteUrdu AdSense product, not InvoiceCraftly billing |
| invoice-specific trust/commercial registry logic | **Reject** | Use WriteUrdu governance instead |

## 4. WriteUrdu database adaptation

### InvoiceCraftly

```js
adapter: D1Adapter(env.ACCOUNT_DB)
```

### WriteUrdu

Target concept:

```js
adapter: D1Adapter(env.METRICS_DB)
```

`METRICS_DB` is the existing WriteUrdu production D1 binding. It already backs telemetry and share-artifact metadata. The name is historical; do not allocate or rename a database solely to make auth naming prettier.

Auth.js adds only its adapter-owned tables:

```text
users
accounts
sessions
verification_tokens
```

My Documents later adds:

```text
writing_documents
```

Existing telemetry/share tables remain untouched.

## 5. Migration adaptation

InvoiceCraftly's Auth.js migration is a useful source for the adapter schema **only after verifying it matches the Auth.js/D1 adapter version installed in WriteUrdu**.

WriteUrdu already has a sequential migration set. At the current baseline:

```text
0001_product_telemetry.sql
0002_product_telemetry_rollups.sql
0003_acquisition_telemetry.sql
0004_share_artifacts.sql
```

Expected new migrations:

```text
0005_authjs_d1_foundation.sql
0006_writing_documents.sql
```

Before applying either migration:

1. inspect current `main` migration list;
2. inspect existing D1 tables;
3. verify migration is additive;
4. run locally/against representative schema;
5. capture table list before/after;
6. verify telemetry/share behavior remains green.

Never edit already-applied migration files to insert auth tables retroactively.

## 6. Auth wrapper adaptation

Start from the InvoiceCraftly wrapper's concepts:

```text
AUTH_CONFIGURATION_STATE
getAuthReadiness(env)
authEnabled(env)
buildIdentityProviders(env)
resolveAuthRedirect(...)
createAuthConfig(env)
handleAuthRequest(...)
getSession(...)
```

Adapt:

- database source: `env.METRICS_DB`;
- sign-in page: WriteUrdu `/sign-in`;
- redirect allowlist: WriteUrdu writer/account routes;
- provider readiness: provider-neutral from the start;
- product copy/branding.

Do not change:

- stable `session.user.id` principle;
- identity-only scopes;
- no automatic email linking;
- sanitized logging;
- no-store session/account responses;
- safe same-origin redirect behavior.

## 7. Local-work preservation adaptation

InvoiceCraftly used its established invoice Workspace save path before OAuth.

WriteUrdu must instead use its existing writer persistence abstraction:

```text
current editor state
→ flush existing local save through editor adapter
→ OAuth navigation
→ callback to safe route
→ normal editor bootstrap restores local state
```

Do not put Urdu text, rich HTML or document contents into OAuth state/query parameters.

Regression must include basic writer and rich editor.

## 8. Account shell adaptation

Reuse the behavior, not InvoiceCraftly wording/layout.

WriteUrdu signed-out account page:

```text
Continue with Google
Continue without an account
```

It should explain:

- account is optional;
- sign-in lets the user save selected writing and continue later;
- existing local drafts are not uploaded automatically.

Signed-in utility menu:

```text
My Documents
Account
Sign out
```

No billing, Workspace Overview, Storage & Protection or InvoiceCraftly-specific navigation.

## 9. Shared-D1 safety rules

The biggest WriteUrdu-specific risk is not Auth.js itself; it is accidentally coupling unrelated domains inside the shared physical database.

Required boundaries:

```text
auth module
  → Auth.js adapter tables through METRICS_DB

documents module
  → writing_documents through METRICS_DB
  → obtains identity from auth wrapper only

telemetry module
  → telemetry tables only

share module
  → share-artifact tables only
```

Do not create a generic database abstraction that encourages arbitrary cross-table access.

Auth/document migrations must not drop, rename or modify existing telemetry/share tables.

Rollback is feature-flag based, never “drop the auth tables from the shared production database”.

## 10. What agents must verify instead of copying

Before coding, verify current:

- `@auth/core` version;
- `@auth/d1-adapter` version/schema;
- Google provider API and CSRF-safe sign-in flow;
- Facebook provider behavior when later added;
- Cloudflare Pages Functions catch-all routing;
- D1 binding/runtime API;
- existing WriteUrdu `METRICS_DB` schema/migration state;
- current canonical host/callback URL;
- current editor save/handoff behavior.

The reference implementation reduces design work. It does not remove implementation-time verification.

## 11. Reuse acceptance checklist

- [ ] Auth.js architecture is adapted from InvoiceCraftly rather than redesigned.
- [ ] No `ACCOUNT_DB` or additional D1 database is created for WriteUrdu.
- [ ] Auth.js uses `D1Adapter(env.METRICS_DB)` or the current equivalent existing binding.
- [ ] Existing telemetry/share tables survive migration unchanged.
- [ ] Only one WriteUrdu module imports Auth.js directly.
- [ ] `/api/me` exposes stable ID and only needed profile fields.
- [ ] Google scopes remain identity-only.
- [ ] External redirects are rejected.
- [ ] Local Urdu writing survives OAuth/sign-out.
- [ ] InvoiceCraftly billing/Workspace/Personal Cloud concepts are not copied.

## Related

- `specs/WU-ACCOUNT-001-account-document-platform-boundary.md`
- `specs/WU-AUTH-001-social-authentication-foundation.md`
- `specs/WU-DRAFT-001-cross-device-cloud-drafts.md`
- `docs/WU-AUTH-DRAFTS-IMPLEMENTATION-PLAN-2026-08-13.md`
