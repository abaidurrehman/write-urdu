# WriteUrdu — InvoiceCraftly Auth Reuse Map

**Prepared:** 2026-08-19  
**Purpose:** implementation evidence and reuse contract for `WU-AUTH-001`  
**Primary source repo:** `abaidurrehman/invoicecraftly`  
**Reference state:** InvoiceCraftly main inspected 2026-08-19; Auth.js foundation/account shell were implemented and reconciled on 2026-08-15

## 1. Decision

WriteUrdu must not redesign authentication from first principles.

The primary implementation precedent is InvoiceCraftly's merged Auth.js + Cloudflare D1 account runtime. OpenForBots remains useful historical evidence for the original Auth.js decision and CPU investigation, but InvoiceCraftly is now the closer code precedent because it uses the same broad deployment shape WriteUrdu needs: static product pages plus Cloudflare Pages Functions.

The implementation rule is:

> **Port the proven boundaries and tests; adapt product-specific code. Do not blindly copy Workspace/invoice behavior.**

## 2. InvoiceCraftly files to inspect first

Agents implementing WriteUrdu auth should inspect these current InvoiceCraftly files before writing equivalent code:

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

If those paths have moved, search current InvoiceCraftly main rather than assuming the old path is authoritative.

## 3. What InvoiceCraftly actually proved

The implementation record documents a working Pages Functions approach with:

- Auth.js core;
- `@auth/d1-adapter`;
- a Pages Functions catch-all at `/api/auth/*`;
- a product-facing `/api/me`;
- a dedicated `ACCOUNT_DB` binding;
- database sessions;
- stable `session.user.id`;
- an `AUTH_ENABLED` gate;
- safe behavior when auth is disabled or misconfigured;
- Google identity-only OAuth;
- same-origin redirect protection;
- sanitized auth logging;
- `Cache-Control: no-store` on account/session responses;
- no automatic email-based account linking;
- local editor state preserved through account navigation/sign-in;
- no invoice payload stored in the auth database.

On 2026-08-15 InvoiceCraftly recorded compatibility with Auth.js core `0.41.3` and `@auth/d1-adapter` `1.11.3`, plus successful Pages Functions compilation and D1 migration verification. **Those versions are evidence, not a permanent pin for WriteUrdu.** Re-check current package/runtime compatibility when implementation begins.

## 4. Direct reuse matrix

| InvoiceCraftly pattern | WriteUrdu decision | Reuse level |
| --- | --- | --- |
| `functions/lib/auth.mjs` as only direct Auth.js import boundary | Same architecture | High — adapt names/routes only |
| `AUTH_ENABLED` + strict config readiness | Same | High |
| `ACCOUNT_DB` dedicated to identity/session storage | Same | High |
| Auth.js adapter migration | Recreate from currently installed adapter version | Contract reuse, not stale copy |
| `/api/auth/*` multipath Pages Function | Same route shape unless current Pages routing requires otherwise | High |
| `/api/me` allowlisted product projection | Same | High |
| database session + stable `session.user.id` | Same | High |
| Google `openid email profile` identity scope | Same | High |
| `allowDangerousEmailAccountLinking: false` | Preserve safe behavior | High |
| same-origin redirect callback | Same | High |
| normalized/sanitized logger | Same principle | High |
| account/session `no-store` headers | Same | High |
| static account shell hydrated from `/api/me` | Same product pattern | Medium — WriteUrdu shell/UI differs |
| save local editor state before OAuth navigation | Same invariant | Medium — integrate with `js/editor-tools.js` rather than InvoiceCraftly save controller |
| Workspace/Document Library account menu | Translate to `My Documents` | Low/medium |
| Personal Cloud / Dropbox/Drive behavior | Do not copy | None |
| Invoice data/storage boundaries | Replace with Urdu writing-document boundaries | Concept only |
| billing/entitlement/commercial auth coupling | Do not copy | None |

## 5. Target WriteUrdu architecture

```text
Static WriteUrdu pages
        |
        +-- anonymous writing/localStorage (unchanged)
        |
        +-- /sign-in
        +-- /api/me
        +-- /api/auth/*
                  |
          functions/lib/auth.mjs
                  |
               Auth.js
                  |
             ACCOUNT_DB

Account-backed writing (separate feature):

editor/localStorage
        |
 explicit Save to my account
        |
 /api/documents/*
        |
 session.user.id
        |
 WRITE_URDU_DB
```

This is intentionally two data planes.

## 6. What to copy structurally

### 6.1 Readiness state

InvoiceCraftly uses explicit states equivalent to:

```text
disabled
misconfigured
ready
```

WriteUrdu should preserve this distinction so operational configuration problems do not look like user/session problems.

Auth core readiness should eventually be provider-neutral:

```text
AUTH_ENABLED=true
+ AUTH_SECRET present
+ ACCOUNT_DB valid
+ at least one complete configured provider
```

Do not bake “Google must exist” into the long-term readiness contract even though Google is the first shipped provider.

### 6.2 Product-facing session boundary

`/api/me` should expose only fields the static shell needs, for example:

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

The browser should never receive provider access/refresh tokens through this projection.

### 6.3 Redirect boundary

OAuth callback/return targets must stay same-origin/allowlisted. Do not permit arbitrary return URLs from query input.

WriteUrdu should return users only to safe product contexts such as writing routes or the account/My Documents surfaces.

### 6.4 Logging boundary

Log normalized error category/type only. Never log:

- cookies;
- session tokens;
- OAuth state/code;
- provider access/refresh tokens;
- user document content;
- raw provider responses.

## 7. WriteUrdu-specific adaptation points

### 7.1 Preserve the current draft before OAuth

InvoiceCraftly already proved the principle of flushing local work before account navigation.

WriteUrdu must implement the equivalent through its existing `js/editor-tools.js` save/adapter boundary. Do not serialize Urdu text into OAuth state or callback query parameters.

Expected flow:

```text
user selects Sign in
→ flush current editor/local autosave through existing WriteUrdu path
→ navigate to sign-in / Auth.js
→ complete OAuth
→ return to safe same-origin route
→ normal editor bootstrap restores browser-local state
```

Test with meaningful Urdu text and rich formatting, not an empty editor.

### 7.2 Static v2 shell

InvoiceCraftly UI code should not be copied wholesale. WriteUrdu needs its own v2 visual shell, account label and mobile behavior.

The session hydration pattern is reusable: render a stable anonymous account-control footprint, query `/api/me` client-side, then swap to the signed-in menu without shifting the writing canvas materially.

### 7.3 My Documents rather than Workspace

InvoiceCraftly's Workspace terminology is not WriteUrdu's product model.

WriteUrdu's first authenticated value surface is **My Documents**. Account menu labels should not expose backend concepts like D1, sessions, cloud sync or “workspace binding”.

## 8. Database separation lesson

The earlier WriteUrdu draft used one `WRITE_URDU_DB` for Auth.js and content. The InvoiceCraftly implementation demonstrated a cleaner separation with a dedicated account database.

Reconciled WriteUrdu decision:

```text
ACCOUNT_DB
  users
  accounts
  sessions
  verification_tokens

WRITE_URDU_DB
  writing_documents
  future product-owned document metadata
```

Benefits:

- identity/session schema can follow Auth.js adapter requirements independently;
- user writing lifecycle is not coupled to auth adapter migrations;
- document storage can evolve toward sharing/collaboration without altering Auth.js tables;
- account failures can be isolated from local writing;
- privacy/deletion responsibilities are clearer.

Do not attempt cross-D1 foreign keys. Store `session.user.id` as the opaque owner subject in `WRITE_URDU_DB`.

## 9. Provider lessons carried forward

### Google

Ship first with identity-only permissions equivalent to:

```text
openid email profile
```

Do not request Drive, Gmail, Calendar or Contacts permissions as part of sign-in.

### Facebook

InvoiceCraftly's multi-provider design work established useful requirements even if WriteUrdu ships it later:

- provider readiness must be data-driven;
- one broken optional provider must not disable a working provider;
- email may be absent;
- account authorization still uses stable user ID;
- do not silently merge accounts because email strings match.

Facebook remains after the Google + My Documents cross-device loop is stable.

## 10. Test reuse map

WriteUrdu should recreate equivalent contract coverage for:

- auth flag off;
- missing secret;
- missing/invalid account DB binding;
- incomplete provider pair;
- complete provider pair;
- `/api/me` signed out;
- signed-in session with stable user ID;
- direct Auth.js imports confined to one module;
- same-origin redirect acceptance and external-origin rejection;
- auth/session responses `no-store`;
- sign-out leaves local writing intact;
- OAuth cancel/error leaves local writing intact;
- auth API outage leaves anonymous writing usable.

Add WriteUrdu-specific browser proof:

- homepage English-to-Urdu typing before/after sign-in;
- Urdu keyboard before/after sign-in;
- rich editor formatting survives OAuth round trip;
- mobile account control does not cover or push the authoring canvas below the useful viewport.

## 11. What not to reuse

Do not bring these InvoiceCraftly concepts into WriteUrdu merely because they sit near auth code:

- invoice Workspace binding;
- Personal Cloud provider storage;
- Dropbox/Google Drive connection state;
- paid entitlement checks;
- checkout state;
- invoice-specific document library behavior;
- business/account language;
- invoice privacy promises.

WriteUrdu is allowed to host selected writing documents under `WU-DRAFT-001`; this differs from InvoiceCraftly's browser-local invoice-content boundary.

## 12. Implementation-time verification checklist

Before coding:

- inspect current InvoiceCraftly main implementation, not only this map;
- inspect current WriteUrdu main and local draft adapter behavior;
- verify current Auth.js core + D1 adapter package compatibility;
- verify current Cloudflare Pages Functions multipath routing and D1 binding behavior;
- obtain the current adapter schema rather than copying a stale migration blindly;
- run the current WriteUrdu regression/SEO/browser baseline;
- keep auth disabled by default until the production configuration/proof slice.

## 13. Source-of-truth order for an implementation agent

When sources disagree, use this order:

1. current WriteUrdu repository behavior and feature specs;
2. current InvoiceCraftly merged auth runtime as implementation precedent;
3. current official Auth.js and Cloudflare documentation/package source;
4. this reuse map;
5. older OpenForBots research/history.

Never preserve an old example merely because it appears in a prior spec if the current dependency/runtime contract has changed.
