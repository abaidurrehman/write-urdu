# WriteUrdu — Authentication + My Documents Implementation Plan

**Originally prepared:** 2026-08-13  
**Reconciled:** 2026-08-19  
**Status:** Planned execution contract  
**Feature specs:** `WU-ACCOUNT-001`, `WU-AUTH-001`, `WU-DRAFT-001`  
**Primary internal precedent:** InvoiceCraftly Auth.js + D1 implementation merged/reconciled 2026-08-15  
**Goal:** Optional Google/Facebook identity plus cross-device account-backed Urdu writing, with zero regression to anonymous writing/local persistence.

## 1. Program decision

Do not redesign auth.

Reuse the proven InvoiceCraftly Auth.js + Cloudflare D1 runtime pattern, then connect it to WriteUrdu's existing local editor adapter/persistence layer.

The implementation order is deliberately narrow:

```text
protect current anonymous baseline
→ Auth.js backend foundation
→ Google + account shell
→ account-backed document API
→ basic-writer pilot
→ My Documents return journey
→ rich + keyboard support
→ conflict/deletion/privacy closure
→ Facebook
```

Login alone is not the product outcome. The first valuable loop is:

```text
write → Save to my account → My Documents → reopen elsewhere → continue
```

## 2. Reconciled architecture

The earlier plan used one `WRITE_URDU_DB` for both Auth.js identity/session records and user writing. That is superseded.

Use two separate bindings/databases:

```text
ACCOUNT_DB
  Auth.js-owned users/accounts/sessions/verification_tokens

WRITE_URDU_DB
  writing_documents
  later product-owned document metadata only
```

Ownership joins use stable `session.user.id` as an opaque subject; do not require cross-D1 foreign keys.

Independent rollout flags:

```text
AUTH_ENABLED
DOCUMENTS_ENABLED
```

If both are false, production behaves as the current anonymous/local product.

## 3. Source-of-truth and reuse order

Before implementation, read:

1. current WriteUrdu main and the three specs above;
2. `docs/WU-AUTH-INVOICECRAFTLY-REUSE-MAP-2026-08-19.md`;
3. current InvoiceCraftly auth runtime and implementation records;
4. current official Auth.js/package source and Cloudflare Pages Functions/D1 documentation;
5. older OpenForBots research only as historical support.

Primary InvoiceCraftly files:

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

InvoiceCraftly recorded Auth.js core `0.41.3` + D1 adapter `1.11.3` compatibility on 2026-08-15. Revalidate rather than copying versions blindly.

## 4. Global invariants for every slice

Every implementation slice must preserve:

- anonymous typing/editing is first-class;
- auth/session/network failure cannot block local writing;
- no framework migration;
- no account prompt may cover or delay the writer on first load;
- local writing is flushed before OAuth navigation;
- signing in never automatically uploads historical local content;
- product ownership uses stable `session.user.id`, not email;
- document content never enters Auth.js tables/logs/query strings;
- identity provider scopes are identity-only;
- no automatic provider linking by email;
- no profiles/followers/collaboration/teams are inferred from account work;
- all account/document pages are noindex unless a separate public-content spec says otherwise;
- Functions routing must not capture or alter established public SEO routes.

## 5. Slice 0 — baseline, reconciliation and feature gates

### Read/inspect

- current `package.json`;
- current deployment/build config;
- current `js/editor-tools.js`;
- basic/homepage writer bootstrap;
- rich editor bootstrap;
- Urdu keyboard bootstrap;
- shared v2 header/account-control path;
- current tests/SEO/governance/browser configuration.

### Record baseline

Run the repository's current relevant commands, including at minimum:

```text
npm test
npm run seo:check
npm run governance:check
```

Run browser coverage applicable to the changed shell/editor surfaces when dependencies/environment allow.

Record any pre-existing failure before coding; do not silently normalize unrelated failures as auth work.

### Deliver

- `AUTH_ENABLED` contract defaulting safely off;
- `DOCUMENTS_ENABLED` contract defaulting safely off;
- exact current editor local-save entry point for OAuth preservation;
- exact current Pages Functions/runtime constraints.

**Gate:** no auth backend code proceeds if the baseline writer/transliteration state is broken for unrelated reasons.

## 6. Slice 1 — AUTH-A: Auth.js/D1 backend foundation

**Skill:** `.claude/skills/wu-auth-authjs-d1-foundation/SKILL.md`

### Deliver

- compatible Auth.js core/provider + D1 adapter dependencies;
- dedicated `ACCOUNT_DB` binding contract;
- adapter-compatible migration derived from installed version;
- `functions/lib/auth.mjs` as the only direct Auth.js import boundary;
- `/api/auth/*` Pages Functions catch-all;
- `/api/me` product-facing projection;
- readiness states `disabled / misconfigured / ready`;
- same-origin redirect handling;
- sanitized logging;
- database sessions + stable `session.user.id`;
- no-store account/session responses;
- focused contract tests.

### Explicit non-deliverables

- no sign-in page yet;
- no header UI dependency on session;
- no writing/document persistence;
- no Facebook;
- no storage provider access.

### Exit proof

With auth off, the static product behaves exactly as before. With test/local auth configuration, backend readiness and `/api/me` behavior are deterministic and the current Pages Functions bundle compiles.

## 7. Slice 2 — AUTH-B: Google + account shell

**Skill:** `.claude/skills/wu-auth-account-shell/SKILL.md`

### Deliver

- Google provider with identity-only scopes;
- provider readiness/config projection;
- static noindex `/sign-in` route using current v2 shell;
- CSRF-safe Auth.js sign-in flow required by installed version;
- `Continue with Google` and `Continue without an account`;
- shared header account-state hydration from `/api/me`;
- signed-in menu: My Documents / Account / Sign out;
- bounded same-origin return target;
- flush current local writing before OAuth navigation;
- non-destructive OAuth cancel/error handling;
- real production custom-domain callback/session proof.

### Mandatory regression

Prove the homepage/basic writer, rich editor and Urdu keyboard work:

- before sign-in;
- after sign-in;
- after sign-out;
- when `/api/me` is unavailable.

### Exit proof

```text
type meaningful Urdu
→ local save
→ Google sign in
→ return to writer
→ exact writing preserved
→ /api/me authenticated
→ sign out
→ local writing still present
```

Do not call the account initiative complete here; proceed to My Documents.

## 8. Slice 3 — DOC-A: product database + authenticated document API

**Skill:** `.claude/skills/wu-drafts-cloud-sync/SKILL.md`

### Deliver

- dedicated `WRITE_URDU_DB` binding/config;
- `writing_documents` migration + indexes;
- `/api/documents` list/create;
- `/api/documents/:id` get/update/delete;
- owner derived only from session;
- validation of title/kind/content/quota;
- optimistic `revision` update contract;
- deterministic `409 Conflict` for stale revision;
- no-store private responses;
- user-isolation/security tests;
- `DOCUMENTS_ENABLED` fail-closed gate.

### Exit proof

Before any editor depends on the API:

- user A cannot read/mutate user B;
- stale update returns 409;
- disabled/unavailable product DB leaves local writing unaffected;
- list response does not send all full document bodies.

## 9. Slice 4 — DOC-B: basic writer pilot

Integrate one writer only, preferably the homepage/basic writer.

### Deliver

- one shared client module for account-document persistence;
- explicit **Save to my account**;
- no automatic upload of previous local history;
- remote document ID/revision/signature state separate from local body;
- truthful local/account save statuses;
- remote dirty coalescing;
- roughly 20–30 second account sync cadence while dirty;
- manual save may sync immediately;
- network/auth/D1 failure never blocks local save.

### Cross-device exit proof

Browser/device A:

```text
write → Save to my account
```

Browser/device B:

```text
sign in → open saved document → same content → edit → save new revision
```

Do not extend to rich/keyboard until this path is stable.

## 10. Slice 5 — DOC-C: My Documents return journey

Create noindex `/my-documents`.

### Deliver

- recent list ordered by activity;
- title + preview + modified time;
- open in correct writer;
- rename;
- delete with confirmation;
- safe duplicate/copy path for conflict recovery;
- useful empty state into writing;
- mobile layout consistent with v2 shell.

### Safety

Opening account content must not silently replace a different unsaved/current local document. Protect it into local history or present a safe choice before replacement.

**This slice is the point where the account feature becomes a coherent return experience.**

## 11. Slice 6 — DOC-D: rich editor + Urdu keyboard

Extend the same account persistence client through the existing adapter boundary.

### Prove

- TinyMCE/rich HTML survives exact round trip;
- Urdu characters/punctuation/RTL survive exact round trip;
- keyboard writer content survives exact round trip;
- local history remains independent;
- no editor-specific duplicate API/backend is introduced.

## 12. Slice 7 — DOC-E: conflict recovery

Wire API `409` into product recovery:

1. Open account version.
2. Keep this device as a copy.
3. Optional Replace account version only after fresh revision + explicit confirmation.

Do not build automatic merge or real-time collaboration.

## 13. Slice 8 — account deletion, privacy and launch closure

Before broad promotion of account-backed writing:

- update Privacy to explain identity/session storage;
- explain explicit account-backed writing storage;
- distinguish local browser content from account content;
- implement/document account deletion lifecycle;
- decide deletion behavior for owned `writing_documents`;
- verify individual document hard-delete;
- verify no document text in logs/analytics;
- verify account/document routes are noindex;
- verify static SEO/canonicals unaffected;
- capture production smoke evidence;
- update specs/registry/status with real PR/commit/config evidence.

Do not promise account/data deletion behavior that is not implemented.

## 14. Slice 9 — Facebook provider

**Skill:** `.claude/skills/wu-auth-add-provider/SKILL.md`

Facebook is a provider expansion, not a new auth stack.

### Entry gate

Google + My Documents must already prove:

```text
write locally
→ Google sign in
→ Save to my account
→ second device
→ reopen/edit
```

### Deliver

- current Auth.js Facebook provider;
- conditional provider descriptor/readiness;
- identity-only permissions;
- safe behavior when Facebook email is absent;
- no automatic same-email account merge;
- Facebook button only when configured;
- Google regression suite.

## 15. External/manual configuration

Repository code cannot complete every step.

Required operational configuration includes:

- create production `ACCOUNT_DB`;
- apply Auth.js adapter migration;
- bind `ACCOUNT_DB` to Pages Functions environments;
- generate/store `AUTH_SECRET` securely;
- create Google OAuth application/client and exact production callback;
- configure provider credentials as encrypted Cloudflare environment values;
- later create/configure Facebook app/callback;
- create/bind `WRITE_URDU_DB` before document persistence;
- apply `writing_documents` migration;
- deliberately configure preview vs production callbacks/bindings.

Never place secret values in specs, PR descriptions or logs.

## 16. Cost/write-amplification rule

Re-check current D1 limits before implementation/launch; do not rely on 2026-08-13 platform numbers indefinitely.

The architecture protects cost by preserving the existing local-save cadence and using a much slower account-sync cadence.

**Never map local autosave directly to D1 updates.**

Estimate actual write volume using:

```text
active account-backed documents
× average dirty syncs/session
× sessions/day
```

before introducing extra infrastructure.

## 17. Verification matrix

### Anonymous baseline

- homepage English-to-Urdu typing;
- Urdu keyboard;
- rich editor;
- local autosave/history;
- static SEO/canonical output;
- mobile canvas placement.

### Auth backend

- disabled;
- misconfigured;
- Google ready;
- `/api/me` signed out/in;
- stable user ID;
- same-origin redirect protection;
- no-store;
- sanitized logs;
- single Auth.js import boundary.

### OAuth UX

- local content preserved before/after login;
- OAuth cancel preserved;
- sign-out preserved;
- account API outage preserved;
- mobile header stable.

### Documents API

- owner isolation;
- size/quota/kind validation;
- list metadata only;
- revision increment;
- stale revision 409;
- hard delete;
- no content logs.

### Cross-device

- basic;
- rich;
- keyboard;
- two-device conflict;
- network/database failure;
- safe open with an existing different local document.

## 18. Rollback rules

### Auth rollback

```text
AUTH_ENABLED=false
```

must disable account identity behavior without altering local writing or deleting stored account/document data.

### Document rollback

```text
DOCUMENTS_ENABLED=false
```

must disable remote-document APIs/UI without altering local writing or deleting remote rows.

Provider-specific configuration can be removed independently.

No rollback path may rely on deleting user data.

## 19. Explicit future ideas — not authorized by this program

The broader account platform is recorded in `WU-ACCOUNT-001`, but this implementation program does **not** authorize:

- public profiles;
- follow/follower graph;
- feeds;
- likes/reactions;
- private document collaboration;
- invite colleagues;
- comments/suggestions;
- team workspaces;
- connected-account linking;
- generic cloud drive integration;
- arbitrary file storage;
- Card Studio project/image storage;
- paid storage tiers.

These remain separately gated so Auth/My Documents implementation stays small and reliable.

## 20. Definition of done

The first account + My Documents program is done when:

- anonymous writing is unaffected;
- Auth.js is isolated behind one WriteUrdu-owned boundary;
- identity/session data lives in `ACCOUNT_DB`;
- account-backed writing lives in `WRITE_URDU_DB`;
- Google works on the production custom domain;
- stable session user ID authorizes product data;
- OAuth/sign-out never loses local work;
- existing local writing is not uploaded merely by signing in;
- user can explicitly save a document to the account;
- My Documents supports open/rename/delete;
- second-device reopen/edit works;
- basic, rich and keyboard content round-trip correctly;
- account writes are throttled;
- stale-revision conflicts are detected/recoverable;
- auth/network/D1 failure never blocks local saving;
- privacy/deletion behavior matches actual storage;
- Facebook works through the same provider-neutral auth boundary after the core loop is stable;
- full product/SEO/governance/browser regression appropriate to the changed surfaces passes.
