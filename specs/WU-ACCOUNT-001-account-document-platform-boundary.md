# WU-ACCOUNT-001 — Account, Documents and Collaboration Platform Boundary

**Status:** Planned product boundary — founder direction reconciled 2026-08-19  
**Area:** Account platform / retention / future collaboration  
**Depends on:** existing anonymous writing product, v2 shell and existing WriteUrdu D1 database  
**Primary child specs:** `WU-AUTH-001`, `WU-DRAFT-001`

## 1. Purpose

WriteUrdu can evolve from a one-session writing utility into a persistent Urdu writing workspace without prematurely becoming a social network or enterprise collaboration suite.

The intended sequence is:

```text
write anonymously
→ optionally sign in
→ explicitly save selected writing to My Documents
→ reopen later / on another device
→ later evaluate private collaboration
→ later evaluate team workspaces
→ only then evaluate public creator/social features
```

The account is infrastructure for continuity. The first valuable authenticated loop is:

```text
write → save to my account → reopen → continue writing
```

## 2. Product layers

| Layer | Capability | Status | Decision |
| --- | --- | --- | --- |
| L0 | Anonymous/local writing | Existing / protected | Must remain first-class |
| L1 | Optional account identity | Planned via `WU-AUTH-001` | Build first |
| L2 | Account-backed writing documents | Planned via `WU-DRAFT-001` | Build after Google auth proof |
| L3 | Minimal profile/preferences | Future | Add only when a concrete UX needs it |
| L4 | Private sharing / collaborator invite | Discovery | Separate authorization feature |
| L5 | Team/workspace membership | Discovery | Only after real multi-user demand |
| L6 | Public profile / follow / feed | Hold | Requires separate evidence and moderation design |

No lower layer silently enables a higher layer.

## 3. Non-negotiable product principles

### Anonymous-first

Users must continue to type, transliterate, edit, use local draft/history and use currently anonymous creation/export tools without an account.

An auth or database outage must not become a writing outage.

### One existing D1 database, separate schema ownership

WriteUrdu already has a production D1 database exposed to Pages Functions through the existing `METRICS_DB` binding. It currently stores product telemetry and share-artifact metadata. This program **must reuse that same D1 database** rather than allocate additional D1 databases.

The binding name is historical. Do not create `ACCOUNT_DB` or `WRITE_URDU_DB` merely for conceptual cleanliness.

The physical model is:

```text
existing D1 database / METRICS_DB
│
├── existing telemetry tables
├── existing share-artifact tables
│
├── Auth.js-owned tables
│   ├── users
│   ├── accounts
│   ├── sessions
│   └── verification_tokens
│
└── WriteUrdu product-owned account content
    └── writing_documents
```

Isolation is enforced through **table ownership, modules, APIs, authorization and migrations**, not separate databases.

### Schema ownership rules

- Auth.js owns its adapter tables. Do not customize them for WriteUrdu product fields.
- Telemetry code must not query Auth.js or `writing_documents` tables.
- Share-artifact code must not query Auth.js or private document tables unless a later approved feature explicitly requires a safe boundary.
- Document APIs authorize through `session.user.id`; they do not authorize by email.
- Product code must not query Auth.js `accounts`/`sessions` directly to infer authorization.
- User writing must never be stored in Auth.js session/account records or telemetry rows.
- Existing migrations remain immutable; auth/documents are added through new numbered migrations.

Recommended migration sequence after current `0004_share_artifacts.sql`:

```text
0005_authjs_d1_foundation.sql
0006_writing_documents.sql
```

Exact numbering must be reconciled against current `main` at implementation time.

### Stable user ID is the ownership subject

All authenticated product data is scoped by the stable Auth.js user ID exposed as `session.user.id`.

Email/name/image are profile data, not authorization keys. Do not silently merge provider identities because emails match.

### Local-first remains the safety layer

Signing in must not automatically upload existing local drafts/history. The user explicitly opts a document into account storage. Browser-local save remains immediate and independent of D1 availability.

### Public/social behavior is never inferred from account existence

Creating an account must not automatically create a public username/profile, follower graph, feed, searchable documents or public activity history.

## 4. Why sharing one D1 database is acceptable

The physical database is shared to stay within platform database-count constraints. Security boundaries still remain explicit:

```text
Auth.js wrapper
  → may access Auth.js adapter tables through D1Adapter(METRICS_DB)

Document API
  → obtains session through auth wrapper
  → accesses writing_documents only

Telemetry API
  → accesses telemetry tables only

Share API
  → accesses share-artifact tables only
```

The implementation should prefer module-level access discipline over broad generic database helper APIs that make every table available everywhere.

No new database is required for auth, My Documents, profiles, collaboration or teams unless a later founder-approved architecture change explicitly justifies consuming another D1 allocation.

## 5. Initial routes and UX

```text
/sign-in          optional account entry
/my-documents     account-backed writing continuity
```

Shared header:

```text
Signed out: Sign in
Signed in: avatar/name → My Documents / Account / Sign out
```

Do not add a generic authenticated dashboard full of empty modules.

## 6. Capability gates

### Gate A — Auth foundation

Must prove:

- optional/fail-closed Auth.js runtime;
- reuse of existing `METRICS_DB` binding/database;
- adapter migration does not affect existing telemetry/share tables;
- stable `session.user.id`;
- anonymous writing unchanged;
- real Google custom-domain callback;
- local writing survives OAuth redirect and sign-out.

### Gate B — My Documents

Must prove:

- `writing_documents` lives in the same existing D1 database but is product-owned;
- explicit save-to-account;
- no automatic local-history upload;
- second-device restore;
- every document query is scoped by `session.user.id`;
- database/network failure never blocks local save;
- revision conflicts are detected;
- delete/privacy behavior is implemented.

### Gate C — Collaboration discovery

A separate collaboration spec must define owner/collaborator roles, invitation and revocation, viewer/editor permissions, concurrent edits, deletion/ownership semantics and abuse/privacy controls.

`WU-DRAFT-001` revision conflicts are not real-time collaboration.

### Gate D — Teams

Team workspaces require evidence that shared membership is materially better than per-document invites. Do not prebuild team ACL tables.

### Gate E — Social graph

Public profiles/follow/feed remain Hold until public artifact usage shows real demand and a separate moderation/privacy review covers usernames, reporting, blocking, spam, minors, notifications, deletion and discovery.

## 7. InvoiceCraftly reuse boundary

Reuse the proven InvoiceCraftly Auth.js runtime patterns:

- one project-owned Auth.js import module;
- Pages Functions `/api/auth/*` catch-all;
- `/api/me` projection;
- database sessions;
- stable user ID;
- `AUTH_ENABLED` fail-closed gate;
- same-origin redirect validation;
- sanitized logging;
- `no-store` account/session responses;
- identity-only provider scopes;
- no automatic email linking;
- local work preservation through OAuth.

**Adapt the database binding:** InvoiceCraftly used a dedicated `ACCOUNT_DB`; WriteUrdu must instead pass its existing `METRICS_DB` binding to the Auth.js D1 adapter.

Do not copy InvoiceCraftly Workspace, billing or Personal Cloud behavior.

See `docs/WU-AUTH-INVOICECRAFTLY-REUSE-MAP-2026-08-19.md`.

## 8. Rollback architecture

Independent feature gates:

```text
AUTH_ENABLED
DOCUMENTS_ENABLED
```

Disabling either feature must not delete rows, alter existing telemetry/share behavior, remove local writing, change transliteration or break static SEO routes.

Rollback means disabling runtime use, not dropping shared-database tables.

## 9. Explicitly out of scope for first implementation

- public creator profiles;
- followers/feed;
- real-time co-editing;
- comments/suggestions;
- teams;
- account linking;
- Google Drive/Dropbox/OneDrive integration;
- arbitrary file storage;
- Card Studio cloud projects/images;
- paid storage tiers.

## 10. Acceptance criteria

- [ ] No new D1 database is introduced by this initiative.
- [ ] Existing `METRICS_DB` is reused by Auth.js and My Documents.
- [ ] Existing telemetry/share tables and behavior remain intact.
- [ ] Auth.js tables are adapter-owned and isolated behind the auth module.
- [ ] `writing_documents` is product-owned and only accessed through document code.
- [ ] All document ownership uses stable `session.user.id`.
- [ ] Login never implies upload, publishing, collaboration or public profile creation.
- [ ] My Documents is the first authenticated product-value surface.
- [ ] Collaboration, teams and social graph remain separately gated.
- [ ] Anonymous writing remains the protected baseline.

## Related

- `specs/WU-AUTH-001-social-authentication-foundation.md`
- `specs/WU-DRAFT-001-cross-device-cloud-drafts.md`
- `docs/WU-AUTH-INVOICECRAFTLY-REUSE-MAP-2026-08-19.md`
- `docs/WU-AUTH-DRAFTS-IMPLEMENTATION-PLAN-2026-08-13.md`
