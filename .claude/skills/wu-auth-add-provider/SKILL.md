---
name: wu-auth-add-provider
description: Add an approved OAuth identity provider to WU-AUTH-001 after the Auth.js + D1 foundation is stable. Load for Google or Facebook provider registration/wiring, provider buttons, credential gating, callback verification, or provider regression checks. Keep identity scopes minimal and never auto-link accounts by email.
references:
  - google
  - facebook
---

# WriteUrdu — add an OAuth provider

Use only after `WU-AUTH-001`'s Auth.js/D1 foundation is present and stable.

Read:

- `specs/WU-AUTH-001-social-authentication-foundation.md`;
- `docs/WU-AUTH-DRAFTS-IMPLEMENTATION-PLAN-2026-08-13.md`;
- current `functions/lib/auth.mjs`;
- the matching provider reference in this directory;
- current Auth.js provider source/docs before coding.

## Provider order

Approved product order:

1. Google first.
2. Facebook after Google + first cross-device cloud-draft restore is stable.

Do not add providers merely because Auth.js supports them. Each provider adds credentials, attack surface, consent UX and maintenance.

## What must remain provider-agnostic

Adding a provider should not require:

- a new session system;
- a new D1 database;
- a new `users` table;
- editor changes;
- draft-table changes;
- a new auth framework.

The existing Auth.js `accounts` model is provider-generic. Provider-specific work belongs in provider construction/configuration and sign-in UX only.

## Implementation steps

### 1. Re-check current provider API

Retrieve the current Auth.js provider export/config and provider developer-console requirements. Do not assume callback/scopes from old examples.

### 2. Register provider app externally

Use the production custom-domain callback documented in the reference file. Configure preview callbacks only when deliberately supported.

Record which steps remain manual and never paste secrets into repository docs/issues/logs.

### 3. Add Cloudflare secrets

Use the established variable names:

Google:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Facebook:

- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`

Do not commit values.

### 4. Update the single auth module

Only `functions/lib/auth.mjs` (or the current single project-owned auth module) imports the provider.

`buildProviders(env)` includes a provider only when its complete credential pair exists.

`authEnabled(env)` means at least one complete provider exists; it must not accidentally become Google-specific once Facebook is added.

### 5. Identity scopes only

The auth feature needs identity, not provider data access.

Do not request:

- Google Drive/Contacts/Calendar;
- Facebook posting/page-management/friends permissions;
- any scope unrelated to basic identity/session creation.

Any scope expansion requires a separate documented product need.

### 6. Sign-in UI

Render a provider button only when that provider is actually configured. Use the same Auth.js CSRF-safe POST flow and same-origin callback rules as the first provider.

Do not show a disabled-looking provider button that cannot work.

### 7. Account linking safety

Do not enable automatic account merging just because two providers return the same email.

For v1:

- Google identity and Facebook identity may remain separate Auth.js accounts/users according to safe adapter behavior;
- email absence from Facebook must be handled;
- user-owned cloud drafts remain scoped to stable database user ID;
- any future connected-provider feature requires authenticated explicit linking and its own review.

### 8. Regression tests

For each provider:

- complete pair => provider included;
- missing ID or secret => excluded;
- provider-only configuration can enable auth;
- existing provider still works after new one is added;
- `/api/me` still exposes stable user ID;
- cloud draft authorization remains by user ID, not provider/email.

Production smoke:

- complete OAuth consent/callback;
- inspect provider row in D1 `accounts`;
- verify session;
- verify sign-out;
- verify existing provider;
- verify anonymous editor.

## Facebook-specific gate

Before Facebook ships, the Google + cloud-draft path must already prove:

`write locally -> Google sign in -> Save to my account -> second device -> restore/edit`

This keeps provider work from masking persistence bugs.

## Not in scope

- email/password;
- provider API integrations;
- automatic provider linking;
- social posting;
- changing the draft schema;
- changing transliteration/editor behavior.

## Governance after provider addition

Update `WU-AUTH-001`, the implementation plan, registry/backlog status if needed, and record the exact provider/callback/environment verification performed.
