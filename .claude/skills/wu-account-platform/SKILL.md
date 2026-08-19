---
name: wu-account-platform
description: Route and govern WriteUrdu account, identity, My Documents and future collaboration work. Load when a task mentions accounts, sign-in, profiles, saved documents, cross-device continuity, collaborators, invitations, teams, followers or account-backed storage. Use this skill to choose the correct child spec/skill and prevent scope expansion from auth into social/collaboration features.
---

# WriteUrdu Account Platform — Orchestration Skill

Use this skill before implementing any account-adjacent feature.

## Read first

1. `specs/WU-ACCOUNT-001-account-document-platform-boundary.md`
2. `specs/WU-AUTH-001-social-authentication-foundation.md`
3. `specs/WU-DRAFT-001-cross-device-cloud-drafts.md`
4. `docs/WU-AUTH-INVOICECRAFTLY-REUSE-MAP-2026-08-19.md`
5. `docs/WU-AUTH-DRAFTS-IMPLEMENTATION-PLAN-2026-08-13.md`
6. current `specs/BACKLOG.md`
7. current repository implementation/status before assuming any slice is still pending.

## Primary rule

**Account is a platform boundary, not permission to build every account idea.**

Route work to the narrowest approved layer:

```text
L0 anonymous/local writing      existing/protected
L1 identity/auth                WU-AUTH-001
L2 My Documents                 WU-DRAFT-001
L3 minimal account/profile      future spec only
L4 collaboration/invites        future spec only
L5 teams                        future spec only
L6 profiles/follow/feed         Hold until evidence + separate spec
```

Do not infer that an account implementation should also add profiles, collaborators, teams or followers.

## Task routing

### Auth.js / D1 / sessions / `/api/me`

Use:

`.claude/skills/wu-auth-authjs-d1-foundation/SKILL.md`

This is AUTH-A only.

### Google sign-in / account page / header / OAuth preservation

Use:

`.claude/skills/wu-auth-account-shell/SKILL.md`

This is AUTH-B.

### Saved Urdu writing / My Documents / cross-device / revision conflicts

Use:

`.claude/skills/wu-drafts-cloud-sync/SKILL.md`

This is DOC-A onward.

### Add Facebook or another explicitly approved identity provider

Use:

`.claude/skills/wu-auth-add-provider/SKILL.md`

Provider expansion never creates a second auth/session stack.

### Profile / collaboration / invite colleague / team / follow

Do **not** implement from this skill unless a dedicated approved feature spec now exists on current main.

If no spec exists:

- record/groom the idea against `WU-ACCOUNT-001`;
- define the missing authorization/privacy/moderation/data lifecycle;
- do not add speculative tables/routes/UI.

## Architecture invariants

### Two data planes

```text
ACCOUNT_DB
  Auth.js identity/session data

WRITE_URDU_DB
  account-backed writing documents
```

Never place Urdu writing in Auth.js adapter/session tables.

Never place Auth.js sessions/provider credentials in `WRITE_URDU_DB` document rows.

### Stable authorization subject

Authenticated product ownership uses:

`session.user.id`

Never use email as an ownership key.

Never silently merge provider identities by matching email.

### Local writing is always the safety layer

Auth, session, network or D1 failure must not disable typing or browser-local saving.

Signing in never uploads local history automatically.

### No framework migration

Cloudflare Pages Functions must coexist with the current static site. Do not introduce Astro/React/Next merely to support accounts.

## Reuse hierarchy

For implementation details, prefer:

1. current WriteUrdu behavior/specs;
2. current InvoiceCraftly merged Auth.js implementation;
3. current official Auth.js/Cloudflare docs/package source;
4. WriteUrdu reuse map;
5. older OpenForBots precedent.

Do not copy stale dependency versions blindly.

Do not copy InvoiceCraftly billing, invoice Workspace or Personal Cloud behavior.

## Program sequence gate

Default execution order:

```text
Slice 0  baseline/gates
AUTH-A   Auth.js backend foundation
AUTH-B   Google + account shell
DOC-A    account document API
DOC-B    basic writer pilot
DOC-C    My Documents
DOC-D    rich + keyboard
DOC-E    conflict recovery
DOC-F    privacy/deletion/launch closure
AUTH-D   Facebook
```

Do not parallelize later product-value slices ahead of their dependency proof if doing so creates competing persistence/auth assumptions.

## Product-language rules

User-facing:

- `Sign in`
- `Continue with Google`
- `Save to my account`
- `My Documents`
- `Saved on this device`
- `Saved to your account`

Avoid exposing:

- Auth.js;
- D1;
- cloud_drafts;
- workspace binding;
- session strategy;
- OAuth implementation terms;

in normal product UI.

## Stop conditions

Stop implementation and reconcile scope if any task starts doing one of these without a separate approved feature contract:

- public profile creation;
- usernames/follower graph/feed;
- collaborator ACLs;
- team membership;
- real-time editing;
- comments/suggestions;
- arbitrary file drive;
- provider API access beyond identity;
- storage provider integration;
- automatic account/provider merging.

## Completion discipline

After each implementation slice:

- record actual branch/PR/commit evidence;
- record current dependency versions/runtime proof;
- update spec acceptance/status only for what truly shipped;
- rerun the full relevant WriteUrdu regression/SEO/governance/browser checks;
- keep later slices Planned until their own exit gate passes.
