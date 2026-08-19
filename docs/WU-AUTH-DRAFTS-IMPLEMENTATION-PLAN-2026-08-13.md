# WriteUrdu — Authentication + My Documents Implementation Plan

**Original activation:** 2026-08-13  
**Reconciled:** 2026-08-19  
**Status:** Planned execution record  
**Feature specs:** `WU-ACCOUNT-001`, `WU-AUTH-001`, `WU-DRAFT-001`

## 1. Goal

Ship optional social sign-in and cross-device Urdu writing continuity while preserving anonymous/local writing and **without creating another Cloudflare D1 database**.

The implementation reuses two proven foundations:

1. InvoiceCraftly's merged Auth.js + Cloudflare Pages Functions pattern.
2. WriteUrdu's existing D1 database exposed as `METRICS_DB` plus its current migration sequence.

## 2. Physical database decision

WriteUrdu already has one production D1 database used by telemetry and share artifacts. Database-count limits make an additional account/document database undesirable.

Therefore:

```text
existing D1 / env.METRICS_DB
├── existing telemetry tables
├── existing share-artifact tables
├── Auth.js tables (new)
│   ├── users
│   ├── accounts
│   ├── sessions
│   └── verification_tokens
└── writing_documents (new)
```

Do **not** create:

```text
ACCOUNT_DB
WRITE_URDU_DB
another D1 database
```

The legacy binding name `METRICS_DB` is retained to avoid risky production rebinding/renaming. Logical isolation is by table ownership, module/API boundaries and migrations.

At the 2026-08-19 baseline the existing migrations are:

```text
0001_product_telemetry.sql
0002_product_telemetry_rollups.sql
0003_acquisition_telemetry.sql
0004_share_artifacts.sql
```

Expected additions:

```text
0005_authjs_d1_foundation.sql
0006_writing_documents.sql
```

Reconcile exact numbering against current `main` at implementation time.

## 3. Program invariants

- anonymous writing remains first-class;
- auth/document failures never block local save or transliteration;
- signing in uploads nothing automatically;
- stable `session.user.id` owns account-backed documents;
- email is never an authorization key;
- Auth.js is isolated behind one project-owned module;
- Google identity requests identity-only scopes;
- no automatic account linking;
- existing telemetry/share tables and APIs must not regress;
- no framework migration;
- no new D1 allocation;
- collaboration/teams/profiles/followers remain out of this implementation.

## 4. Implementation order

### Slice 0 — baseline and shared-D1 inventory

Before auth code:

- capture `npm test`, SEO/governance/browser baseline;
- inspect current Pages Functions routing and deployment config;
- inspect current `METRICS_DB` consumers;
- capture the current D1 table/migration inventory;
- verify `METRICS_DB` is the production binding used by telemetry/share routes;
- add/confirm `AUTH_ENABLED=false` and `DOCUMENTS_ENABLED=false` rollout defaults.

**Gate:** do not proceed on an unexplained red baseline.

### AUTH-A — Auth.js backend foundation

Skill: `.claude/skills/wu-auth-authjs-d1-foundation/SKILL.md`

Deliver:

- current compatible `@auth/core` + `@auth/d1-adapter`;
- adapter-compatible `0005_authjs_d1_foundation.sql` or reconciled equivalent;
- `functions/lib/auth.mjs`;
- `/api/auth/*` Pages Function;
- `/api/me`;
- `D1Adapter(env.METRICS_DB)`;
- fail-closed readiness;
- sanitized/no-store/same-origin behavior;
- focused tests.

**Shared-D1 proof:** capture table list before/after migration and verify existing telemetry/share endpoints still pass.

**Do not add account UI or documents.**

### AUTH-B — Google + account shell

Skill: `.claude/skills/wu-auth-account-shell/SKILL.md`

Deliver:

- Google OAuth app/callback configuration;
- conditional Google provider;
- static noindex `/sign-in` page;
- current Auth.js CSRF-safe sign-in flow;
- session-aware header;
- sign-out;
- safe same-origin return targets;
- local-writing flush before OAuth;
- production callback/session proof.

**Exit proof:**

```text
write locally
→ Google sign in
→ return
→ exact local content remains
→ /api/me authenticated
→ sign out
→ local content remains
```

### DOC-A — `writing_documents` schema + API

Skill: `.claude/skills/wu-drafts-cloud-sync/SKILL.md`

Deliver:

- additive document migration in the same existing D1 database;
- `GET/POST /api/documents`;
- `GET/PATCH/DELETE /api/documents/:id`;
- ownership by `session.user.id`;
- validation/quota/size guards;
- optimistic `revision` contract;
- deterministic `409` conflict;
- no-store responses;
- no content logging.

**Shared-D1 proof:** document migration cannot modify/drop telemetry/share/Auth.js tables.

### DOC-B — basic writer pilot

Deliver:

- explicit **Save to my account**;
- no automatic historical upload;
- local/account save statuses kept separate;
- document metadata separate from local payload;
- 20–30 second remote dirty-sync cadence;
- local save remains safe when API/D1 fails.

**Exit:** browser A saves; browser B signs in and restores the same document.

### DOC-C — My Documents

Create noindex `/my-documents` with:

- recent list;
- title/preview/editor type/modified time;
- open;
- rename;
- delete;
- copy/recovery path;
- useful empty state.

### DOC-D — rich editor + Urdu keyboard

Reuse one account-persistence client through existing adapter contracts.

Verify:

- TinyMCE/rich HTML round-trip;
- Urdu/RTL exactness;
- keyboard text round-trip;
- local history remains independent.

### DOC-E — conflict UX

On 409 offer:

1. Open account version.
2. Keep this device as a copy.
3. Optional explicit Replace account version after fresh revision + confirmation.

No automatic merge/co-editing engine.

### DOC-F — privacy/deletion/launch closure

Before broad promotion:

- Privacy explains identity/session storage;
- Privacy explains account-backed writing;
- individual document deletion works;
- account deletion policy covers Auth.js rows + owned documents;
- local browser data distinction is clear;
- static SEO/noindex rules verified;
- full regression and production smoke completed.

### AUTH-D — Facebook fast-follow

Skill: `.claude/skills/wu-auth-add-provider/SKILL.md`

Only after the Google + My Documents second-device loop is stable.

Deliver identity-only Facebook auth, missing-email handling, provider gating and Google regression. No silent email-based merge.

## 5. Shared-database guardrails

These are mandatory because one D1 database serves multiple product domains.

### Migration discipline

- never edit already-applied migrations;
- every new schema change gets a new migration;
- auth/document migrations are additive;
- no auth/document migration may drop/rename telemetry/share tables;
- verify migration against a representative local copy/schema before remote apply;
- capture before/after table inventory for AUTH-A and DOC-A.

### Module discipline

```text
functions/lib/auth.mjs
  → Auth.js/D1 adapter tables via env.METRICS_DB

functions/api/documents*
  → writing_documents via env.METRICS_DB
  → identity only through getSession()

telemetry functions
  → telemetry tables only

share functions
  → share tables only
```

Do not introduce a generic DAO that encourages cross-domain table access.

### Rollback discipline

Feature rollback is through flags:

```text
AUTH_ENABLED=false
DOCUMENTS_ENABLED=false
```

Do not drop shared-database tables as normal rollback.

## 6. External configuration checklist

- create no additional D1 database;
- continue using the existing production `METRICS_DB` binding;
- generate/store `AUTH_SECRET` securely;
- create Google OAuth client and production callback;
- later create Facebook/Meta app/callback;
- store provider secrets in Cloudflare environment configuration;
- verify preview strategy deliberately rather than registering arbitrary callbacks.

## 7. Cost/write-amplification guardrail

Remote document writes must not mirror the existing local ~650 ms save debounce.

Use local save for typing safety and a slower remote cadence for account continuity.

Before launch, re-check current Cloudflare D1 quotas/limits and current database size/write activity. The benefit of the shared database decision is conserving database allocations; it does not remove row/write/storage limits.

## 8. Verification matrix

### Existing product regression

- homepage transliteration;
- basic writer local save;
- Urdu keyboard;
- rich editor;
- telemetry ingestion/rollups;
- share artifact publishing/view paths;
- SEO/governance tests.

### Auth

- disabled/misconfigured/ready states;
- existing `METRICS_DB` valid binding;
- stable session user ID;
- no-store responses;
- safe redirects;
- Google production callback;
- local work preserved through sign-in/sign-out;
- existing database domains unaffected.

### Documents

- user isolation;
- size/quota validation;
- 409 conflict;
- cross-device restore;
- throttled writes;
- exact Urdu/RTL/rich content;
- database failure leaves local save safe;
- existing database domains unaffected.

## 9. Definition of done

The initiative is complete when:

- no new D1 database was introduced;
- Auth.js and `writing_documents` coexist safely with existing telemetry/share tables in `METRICS_DB`;
- Google and later Facebook work on production custom domain;
- local writing remains default and anonymous;
- user explicitly saves selected writing to account;
- same document can be continued on another device;
- basic/rich/keyboard formats survive round-trip;
- stale revisions are detected;
- My Documents supports open/rename/delete;
- privacy/deletion behavior matches product claims;
- existing telemetry/share/SEO/product regressions pass.

## 10. Explicit future ideas — not part of this program

- public profiles;
- followers/feed;
- collaboration/co-editing;
- teams;
- connected-account linking;
- arbitrary cloud file storage;
- Card Studio cloud images/projects;
- paid storage tiers.
