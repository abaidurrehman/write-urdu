# WU-ACCOUNT-001 — Account, Documents and Collaboration Platform Boundary

**Status:** Planned product boundary — founder direction reconciled 2026-08-19  
**Area:** Account platform / retention / future collaboration  
**Depends on:** existing anonymous writing product and v2 shell  
**Implementation authority:** this document authorizes only the boundaries and sequence below; individual capabilities still require their own feature spec/slice  
**Primary child specs:** `WU-AUTH-001`, `WU-DRAFT-001`

## 1. Purpose

WriteUrdu can evolve from a one-session writing utility into a persistent Urdu writing workspace without prematurely becoming a social network or enterprise collaboration suite.

The product sequence is:

```text
write anonymously
→ optionally create/sign in to an account
→ explicitly save selected writing to My Documents
→ reopen on another device
→ later share/invite collaborators when evidence supports it
→ later create team workspaces when evidence supports it
→ only then evaluate public creator/social features
```

The account is infrastructure for continuity. **The account itself is not the product value.** The first valuable authenticated loop is:

```text
write → save to my account → reopen later / on another device → continue writing
```

## 2. Why this boundary exists

Current product ideas include:

- create an account;
- build a profile;
- store documents online;
- collaborate;
- invite colleagues;
- create a team;
- follow anyone.

These ideas have very different data, trust, moderation and operational costs. Implementing them as one account epic would create unnecessary architecture and risk the mature core writing experience.

This spec separates them into layers so implementation agents cannot infer that authentication automatically authorizes profiles, collaboration, teams or a follower graph.

## 3. Product layers and status

| Layer | Capability | Status | Decision |
| --- | --- | --- | --- |
| L0 | Anonymous/local writing | Existing / protected | Must remain first-class |
| L1 | Optional account identity | Planned via `WU-AUTH-001` | Build first |
| L2 | Account-backed writing documents | Planned via `WU-DRAFT-001` | Build immediately after Google auth proof |
| L3 | Minimal profile/preferences | Future | Only fields required by real product UX; no public creator profile by default |
| L4 | Private sharing / invite collaborator | Discovery | Separate feature and authorization model |
| L5 | Team/workspace membership | Discovery | Separate feature after real multi-user demand |
| L6 | Public profile / follow / feed | Hold | Do not build without evidence that public publishing/discovery is a real user job |

`L1` does not imply `L2`; `L2` does not imply `L4`; and no lower layer may silently create a higher-layer behavior.

## 4. Non-negotiable product principles

### 4.1 Anonymous-first forever unless a later explicit strategy changes it

Users must continue to be able to:

- type English letters and get Urdu;
- use the basic writer;
- use the Urdu keyboard;
- use the rich editor;
- use local draft/history behavior;
- use creation/export tools where currently anonymous;

without creating an account.

An auth outage must never become a writing outage.

### 4.2 Identity and content are separate planes

Use two separate D1 bindings/databases:

```text
ACCOUNT_DB
  Auth.js-owned identity/session tables
  + only minimal account-lifecycle metadata when explicitly required

WRITE_URDU_DB
  writing_documents
  future product-owned document metadata
  future sharing/collaboration metadata only when those features are approved
```

Do not store Urdu writing bodies inside Auth.js adapter tables or generic account/session records.

Do not use an analytics/OS database for either account identity or user writing merely because it already exists.

### 4.3 Stable user ID is the ownership subject

All product-owned authenticated data is scoped by the stable Auth.js/D1 user ID exposed as:

`session.user.id`

Email address is profile/contact data. It is **not** an authorization key and must not be used to silently merge provider identities.

Because `ACCOUNT_DB` and `WRITE_URDU_DB` are intentionally separate, product tables store the stable user ID as an opaque ownership subject. Do not require a cross-database foreign key.

### 4.4 Local-first remains the safety layer

Signing in must not automatically upload local drafts/history.

The user explicitly opts a document into account storage. Once opted in, cloud synchronization may happen in the background according to `WU-DRAFT-001`, while browser-local save remains immediate and independent.

### 4.5 Public/social behavior is never inferred from account existence

Creating an account must not automatically create:

- a public profile page;
- a public username;
- follower/following lists;
- a discoverable content feed;
- searchable public documents;
- public activity history.

These require separate product, privacy, abuse and moderation decisions.

## 5. Data-domain ownership

### ACCOUNT_DB

Auth.js logically owns:

- `users`;
- `accounts`;
- `sessions`;
- `verification_tokens`.

Project-owned account tables may be added later only for concrete identity/account lifecycle needs, for example:

```text
account_preferences
- user_id
- preferred_locale nullable
- created_at
- updated_at
```

Do not customize Auth.js adapter tables for WriteUrdu-specific profile fields.

### WRITE_URDU_DB

The first product-owned authenticated content table is defined by `WU-DRAFT-001` and should be writing-document specific rather than a generic arbitrary file drive.

Future approved features may add separate tables such as:

```text
document_shares
collaborators
team_memberships
team_documents
```

Only add them when their corresponding feature is approved. Do not pre-build an ACL/team schema “for later”.

## 6. Route and UX ownership

Initial account surfaces should remain small:

```text
/sign-in          optional account entry
/my-documents     account-backed writing continuity
```

The shared header may expose:

```text
Signed out: Sign in
Signed in: avatar/name menu → My Documents / Account / Sign out
```

Do not add a generic authenticated dashboard full of empty modules.

If a future account settings route is introduced, it owns account identity/lifecycle settings, not document content editing.

## 7. Capability gates

### Gate A — Auth foundation

Must prove:

- optional/fail-closed Auth.js runtime;
- dedicated `ACCOUNT_DB`;
- stable `session.user.id`;
- anonymous writing unchanged;
- real Google custom-domain callback;
- in-progress local writing survives OAuth redirect and sign-out.

Only then proceed to account-backed documents.

### Gate B — My Documents

Must prove:

- explicit save-to-account;
- no automatic upload on sign-in;
- second-device restore;
- user-scoped authorization;
- local save survives D1/network failure;
- conflict detection rather than last-write-wins;
- delete behavior and privacy copy.

Only after this loop is useful should the product invest in richer account identity/profile work.

### Gate C — Collaboration discovery

Private collaboration should be considered only when there is evidence users need another person to access/edit the same writing.

A collaboration spec must define at minimum:

- owner vs collaborator roles;
- invite mechanism;
- viewer/editor permission model;
- invite expiry/revocation;
- document deletion/ownership transfer semantics;
- concurrent edit/conflict behavior;
- audit/privacy expectations;
- abuse controls.

Do not reinterpret `revision` conflict handling from `WU-DRAFT-001` as real-time collaboration.

### Gate D — Teams

Team workspaces require separate proof that shared membership is materially better than per-document invitations.

A team feature must not be introduced solely to make the product look SaaS-like.

### Gate E — Social graph

`follow anyone`, public profiles and feed/discovery remain **Hold** until public WriteUrdu artifacts show repeat usage and there is evidence that users want author discovery/following rather than simply sharing links externally.

Before this gate can move, a separate review must address:

- public/private identity;
- username policy and squatting;
- blocking/reporting;
- spam and automated abuse;
- moderation of public writing/images;
- notification controls;
- child/minor safety considerations;
- deletion/de-indexing;
- follower privacy;
- feed ranking/discovery responsibility.

## 8. Reuse decision from InvoiceCraftly

The primary internal implementation precedent for L1 is the merged InvoiceCraftly Auth.js + D1 runtime from 2026-08-15, not the earlier Auth0 idea and not a fresh authentication design.

Reuse the proven boundaries:

- one project-owned Auth.js import module;
- Pages Functions `/api/auth/*` catch-all;
- `/api/me` product projection;
- database sessions;
- stable user ID;
- `AUTH_ENABLED` fail-closed gate;
- same-origin redirect validation;
- sanitized logging;
- no-store account/session responses;
- identity-only provider scopes;
- no automatic email-based linking;
- local work preserved through OAuth.

Adapt product naming, routes and local-save integration to WriteUrdu. Do not copy InvoiceCraftly Workspace, billing or Personal Cloud behavior.

See `docs/WU-AUTH-INVOICECRAFTLY-REUSE-MAP-2026-08-19.md`.

## 9. Success measures

The account initiative should ultimately be judged by product continuity, not sign-up count alone.

Useful measures include:

- share of signed-in users who save at least one document;
- successful second-session / second-device reopen rate;
- repeat document editing;
- cloud-save error/conflict rate;
- retention of anonymous writer usage after account UI ships;
- later: collaborator invite acceptance/use, if collaboration is approved.

Do not optimize sign-in prompts at the expense of anonymous task completion.

## 10. Rollback architecture

Independent kill switches are required:

```text
AUTH_ENABLED
DOCUMENTS_ENABLED
```

Disabling account-backed features must not:

- remove browser-local writing;
- delete remote identity/document rows;
- change transliteration behavior;
- break static SEO routes.

Future collaboration/team/social features require their own independent rollout gates.

## 11. Explicitly out of scope for the first implementation program

- public creator profiles;
- following/followers;
- activity feeds;
- likes/reactions;
- notifications;
- real-time co-editing;
- comments/suggestions;
- team workspaces;
- account linking;
- generic Google Drive/Dropbox/OneDrive integration;
- arbitrary file storage;
- Card Studio image/project cloud sync;
- paid storage tiers.

## 12. Acceptance criteria for this boundary

- [ ] `WU-AUTH-001` treats identity as optional infrastructure and uses `ACCOUNT_DB`.
- [ ] `WU-DRAFT-001` stores user writing only in `WRITE_URDU_DB` and scopes ownership by stable user ID.
- [ ] Login never implies upload, publishing, collaboration or a public profile.
- [ ] My Documents is the first authenticated product-value surface.
- [ ] Collaboration, teams and social graph remain separately gated.
- [ ] Implementation skills route agents to the correct slice rather than expanding scope.
- [ ] Anonymous writing remains the protected product baseline.

## Related

- `specs/WU-AUTH-001-social-authentication-foundation.md`
- `specs/WU-DRAFT-001-cross-device-cloud-drafts.md`
- `docs/WU-AUTH-INVOICECRAFTLY-REUSE-MAP-2026-08-19.md`
- `docs/WU-AUTH-DRAFTS-IMPLEMENTATION-PLAN-2026-08-13.md`
