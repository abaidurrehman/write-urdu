# WriteUrdu — Authentication + Cloud Drafts Implementation Plan

**Date:** 2026-08-13  
**Status:** Planned execution record  
**Feature specs:** `WU-AUTH-001`, `WU-DRAFT-001`  
**Goal:** Optional Google/Facebook sign-in plus cross-device writing drafts, with zero regression to anonymous writing/local drafts.

## 1. Why this is now activated

The canonical backlog previously held accounts/cloud documents because there was no demonstrated demand and the architecture could distract from mature-domain growth work. The founder has now explicitly requested account-backed draft saving/restoration with Google and Facebook sign-in.

This is therefore a deliberate activation, not an accidental infrastructure project.

The feature remains bounded:

- accounts are optional;
- only writing drafts are persisted initially;
- the existing local draft system remains primary;
- no generic dashboard, team system or cloud file drive is introduced;
- no framework rewrite is permitted.

## 2. Findings carried into implementation

1. OpenForBots uses **Auth.js**, not Auth0.
2. The proven stack is `@auth/core` + `@auth/d1-adapter` + Cloudflare D1.
3. OpenForBots already solved provider building, CSRF-safe provider POST login, `session.user.id`, D1 adapter schema and fail-closed feature gating.
4. Google is already active in that implementation and is the lowest-risk first provider to reuse.
5. Facebook should be added through the same provider builder after the first end-to-end draft flow is stable.
6. WriteUrdu already has local autosave, history, restore/rename/delete and editor adapters. The cloud feature should extend that abstraction rather than replace it.
7. Cloudflare Pages Functions can be added beside the static site; no Astro/React migration is needed.
8. D1 Free limits are sufficient for a bounded draft feature if cloud writes are throttled rather than tied to the existing 650 ms local autosave loop.

## 3. Implementation order

### Slice 0 — governance and regression baseline

Before backend code:

- mark `WU-AUTH-001` and `WU-DRAFT-001` Planned in the registry/backlog;
- capture current `npm test`, `npm run seo:check` and browser-test baseline;
- identify the exact three editor adapter initialization paths;
- confirm the current Cloudflare Pages build/deploy configuration;
- add feature flags with defaults that leave production behavior unchanged.

**Gate:** no auth/cloud implementation proceeds if the current editor/transliteration suite is red for unrelated reasons.

### Slice 1 — Cloudflare/D1 + Auth.js foundation

Use `.claude/skills/wu-auth-authjs-d1-foundation/SKILL.md`.

Deliver:

- Auth.js dependencies;
- dedicated D1 binding/database contract (`WRITE_URDU_DB`);
- Auth.js migration copied/generated from the installed adapter version;
- `functions/lib/auth.mjs` thin interface;
- `/api/auth/*` Pages Function;
- `/api/me`;
- `AUTH_ENABLED` fail-closed behavior;
- tests for config gating and unauthenticated session behavior.

**Do not add account UI yet if the backend proof is not stable.**

**Exit proof:** with auth off, production behaves exactly as before. With auth on in the intended environment, the auth routes load correctly and `/api/me` is safely unauthenticated before login.

### Slice 2 — Google sign-in + account shell

Reuse the current OpenForBots Google Auth.js provider pattern, adapting branding/routes only.

Deliver:

- Google OAuth app registration/callback configuration;
- conditional Google provider;
- static noindex `/sign-in` page;
- CSRF-safe POST sign-in;
- same-origin callback validation;
- session-aware header with stable non-shifting anonymous fallback;
- sign-out;
- production proof via `/api/me` and D1 account/session rows.

**Regression gate:** homepage transliteration, rich editor and Urdu keyboard work before sign-in, after sign-in and after sign-out.

### Slice 3 — cloud draft schema + API

Use `.claude/skills/wu-drafts-cloud-sync/SKILL.md`.

Deliver:

- `cloud_drafts` migration + indexes;
- user-scoped list/create/get/update/delete endpoints;
- payload/title/editor-kind validation;
- product quota/size guards;
- `revision` optimistic concurrency;
- `409` conflict contract;
- no-store responses;
- authorization tests proving one user cannot read/write another user's draft.

**Exit proof:** API is secure and deterministic before an editor starts depending on it.

### Slice 4 — basic editor cloud pilot

Integrate one adapter path first, preferably the homepage/basic editor.

Deliver:

- explicit **Save to my account**;
- no automatic upload of previous local history;
- separate local/cloud status;
- cloud metadata stored separately from existing local draft payload;
- throttled cloud synchronization (roughly 20–30 seconds while dirty, adjustable);
- network/API failure that falls back to local safety without interrupting writing.

**Cross-device proof:** browser/device A creates a draft, browser/device B signs in and opens the same draft successfully.

### Slice 5 — My Drafts + restore journey

Deliver a focused noindex `/my-drafts` route:

- recent cloud drafts;
- preview/title/editor type/modified time;
- open in owning editor;
- rename;
- delete;
- useful empty state.

Opening a remote draft must not silently destroy a different local current draft.

This slice is the first point where the product can credibly message “your Urdu writing follows you across devices.”

### Slice 6 — rich editor + Urdu keyboard

Extend the **same cloud persistence module** through the existing adapter contract.

Do not create separate rich-editor and keyboard backends.

Verify:

- TinyMCE HTML survives round-trip;
- Urdu/RTL text is unchanged;
- keyboard editor text survives round-trip;
- local history remains independent and functional.

### Slice 7 — conflict recovery

Turn the API's existing 409 contract into user-visible recovery:

- Open cloud version;
- Keep this device as a copy;
- optionally Replace cloud version only after explicit confirmation/fresh revision.

No automatic merge/collaboration engine.

### Slice 8 — Facebook provider

Use `.claude/skills/wu-auth-add-provider/SKILL.md` and its Facebook reference.

Deliver:

- Facebook app registration/callback;
- conditional provider wiring;
- identity-only permissions;
- behavior when Facebook returns no email;
- provider button on `/sign-in` only when configured;
- Google regression.

Do not silently merge Google/Facebook identities by email.

### Slice 9 — privacy, account controls and launch closure

Before broad promotion:

- update Privacy with cloud-draft data/storage/deletion behavior;
- ensure users can delete individual cloud drafts;
- document account/provider behavior;
- validate noindex for sign-in/account pages;
- verify static SEO/canonicals were not altered by backend routing;
- run full regression suite and production smoke tests;
- update feature statuses and backlog after acceptance.

A full account-deletion/export feature can be a follow-up if required, but the privacy policy must not promise capabilities that do not yet exist.

## 4. External/manual configuration checklist

These steps cannot be solved by repository code alone:

- create/bind the production D1 database;
- configure preview/production binding strategy;
- generate/store `AUTH_SECRET` securely;
- create Google OAuth client and registered callback;
- create Facebook/Meta app and registered callback;
- set provider credentials in Cloudflare encrypted environment configuration;
- redeploy after binding/secret changes when required by Cloudflare.

The implementation agent should automate only what the connected tooling safely supports and leave exact manual console items clearly recorded.

## 5. Cost and write-amplification guardrail

As of the investigation on 2026-08-13, Cloudflare documents Workers Free D1 allowances including 5 million rows read/day, 100,000 rows written/day, 5 GB account storage and a 500 MB maximum database size on Free. These limits can change; verify them again before implementation/launch.

The design protects those limits by keeping the existing local 650 ms save and using a much slower cloud sync cadence. **Never map each local autosave to a D1 update.**

## 6. Rollout flags

Recommended independent gates:

- `AUTH_ENABLED` — auth routes/session UI;
- `CLOUD_DRAFTS_ENABLED` — draft APIs/cloud UI;
- optional provider activation implicitly controlled by whether each provider's credentials exist.

If `CLOUD_DRAFTS_ENABLED=false`, local drafts continue exactly as before even for a signed-in user.

## 7. Definition of done

The initiative is complete when:

- anonymous writing remains unaffected;
- Google and Facebook sign-in both work on the production custom domain;
- account sessions authorize by stable database user ID;
- local drafts remain local by default;
- a user can opt a draft into account storage;
- the same draft can be opened and continued from another device;
- basic, rich and keyboard editor formats survive round-trip;
- cloud failure never blocks local saving;
- stale-revision conflicts are detected instead of overwritten;
- My Drafts supports open/rename/delete;
- no provider is auto-linked by email;
- privacy copy matches actual storage/deletion behavior;
- full product/SEO/transliteration regression suite passes.

## 8. Explicit future ideas — not part of this implementation

- connected-account linking UI;
- account-wide data export/delete workflow;
- remote revision history;
- Card Studio/cloud image storage;
- public/shared documents;
- collaborative editing;
- paid storage tiers;
- teams/workspaces;
- email/password authentication.
