---
name: wu-auth-add-provider
description: Add an explicitly approved OAuth identity provider to WU-AUTH-001 after the Auth.js + ACCOUNT_DB foundation is stable. Load for Facebook or future provider wiring, provider descriptors/readiness, credential gating, callback verification and provider regressions. Keep identity scopes minimal, preserve My Documents ownership by stable user ID and never auto-link accounts by email.
references:
  - google
  - facebook
---

# WriteUrdu — Add an OAuth Identity Provider

Use this skill only after the shared Auth.js/`ACCOUNT_DB` foundation is stable.

For Facebook, also wait until the Google + My Documents cross-device loop has passed its gate.

## Read first

- `specs/WU-ACCOUNT-001-account-document-platform-boundary.md`;
- `specs/WU-AUTH-001-social-authentication-foundation.md`;
- `specs/WU-DRAFT-001-cross-device-cloud-drafts.md`;
- `docs/WU-AUTH-INVOICECRAFTLY-REUSE-MAP-2026-08-19.md`;
- `docs/WU-AUTH-DRAFTS-IMPLEMENTATION-PLAN-2026-08-13.md`;
- current `functions/lib/auth.mjs`;
- current `/sign-in` account shell;
- matching provider reference in this skill directory;
- current InvoiceCraftly multi-provider identity spec/runtime if available;
- current Auth.js provider source/docs and provider developer-console requirements.

## Provider order

Approved initial order:

1. Google — AUTH-B first provider.
2. Facebook — after Google + My Documents continuity is stable.

Do not add identity providers simply because Auth.js supports them. Each provider adds credentials, consent UX, attack surface and operational maintenance.

## Architecture invariants

Adding a provider must **not** require:

- a second auth/session stack;
- a second account database;
- provider-specific product `users` tables;
- editor changes;
- `writing_documents` schema changes;
- a framework migration;
- different ownership rules for My Documents.

All identity providers feed the same Auth.js `ACCOUNT_DB` model.

All product document ownership remains:

`session.user.id`

Never use provider email or provider account ID as document ownership.

## Provider-neutral readiness model

Do not make auth readiness Google-specific.

Target conceptual state:

```text
core
  AUTH_ENABLED
  AUTH_SECRET
  ACCOUNT_DB

providers
  google: ready / incomplete / absent
  facebook: ready / incomplete / absent
```

Auth core is usable when core config is valid and **at least one** provider is ready.

A broken optional provider must not disable a valid provider.

Example:

```text
Google ready
Facebook missing secret
```

Expected result:

```text
Auth ready
Google shown
Facebook hidden/unavailable
```

not a global account outage.

## Step 1 — verify current provider implementation

Before coding:

- inspect current Auth.js provider export/config;
- inspect current provider default scopes/profile behavior;
- inspect current developer-console callback/app requirements;
- inspect current InvoiceCraftly multi-provider lessons for equivalent provider if present.

Do not assume old callback/scopes from examples.

## Step 2 — external app registration

Configure the exact intended custom-domain callback.

Preview callbacks are configured only when intentionally supported.

Record:

- provider app/account audience;
- callback paths/domains;
- required identity permissions;
- secret rotation/expiry ownership where applicable;
- production proof status.

Never record secret values in repo docs/issues/PR text.

## Step 3 — Cloudflare configuration

Established names:

Google:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

Facebook:

```text
FACEBOOK_CLIENT_ID
FACEBOOK_CLIENT_SECRET
```

Provider variables may change only with a documented implementation reason.

Do not expose secrets to client-side code.

## Step 4 — change only the single auth module

Provider construction belongs inside:

`functions/lib/auth.mjs`

or the current single WriteUrdu-owned auth boundary.

Do not import Auth.js providers in page scripts, document APIs or editor modules.

Prefer small safe provider descriptors for UI, for example:

```js
{
  id: 'facebook',
  label: 'Facebook',
  signInPath: '/api/auth/signin/facebook',
  available: true,
  brandKey: 'facebook'
}
```

Never include client secret, access token, refresh token, provider account ID, user email or raw configuration error in a descriptor.

## Step 5 — identity scopes only

Provider sign-in exists to identify the user.

### Google

Keep identity scopes equivalent to:

```text
openid email profile
```

No Drive/Gmail/Calendar/Contacts.

### Facebook

Use only current basic identity permissions required by Auth.js/profile handling.

Do not add:

- friends/social graph;
- posting permissions;
- Page/business management;
- Messenger;
- ads;
- Instagram.

A provider API integration is a separate feature.

## Step 6 — account-linking safety

Do not enable automatic account merge based on matching email.

Preserve safe Auth.js behavior equivalent to:

`allowDangerousEmailAccountLinking: false`

Typical collision:

```text
user first signs in with Google person@example.com
later tries Facebook with person@example.com
provider identity is not linked
```

Desired v1 behavior:

- do not merge automatically;
- do not reassign My Documents;
- do not overwrite local writing;
- surface a controlled sign-in/account-not-linked message;
- allow user to retry the method previously used;
- allow continue without an account.

Do not disclose unnecessary provider/account linkage metadata to a signed-out user.

A future Connected Accounts feature requires its own authenticated proof-of-control and security/recovery spec.

## Step 7 — missing profile data

Account UX must tolerate:

- missing email;
- missing image;
- missing/empty display name;
- provider-specific claim differences.

Stable `session.user.id` remains authorization identity regardless of profile fields.

Safe display fallback concept:

```text
name
→ email when present/useful
→ "WriteUrdu account"
```

Provider-specific reference files may define a better safe label.

Never fail authentication solely because Facebook returns no email if the Auth.js session/user identity is otherwise valid.

## Step 8 — account shell UI

Render a provider button only when that provider is ready.

Each button must:

- show provider name visibly;
- use current supported CSRF-safe Auth.js sign-in flow;
- be keyboard accessible;
- have deterministic loading/disabled behavior;
- preserve the same local-writing-before-OAuth flow;
- return only to safe same-origin routes.

Do not turn `/sign-in` into a mandatory wall.

`Continue without an account` remains available.

## Step 9 — preserve local writing

Every provider must reuse the same pre-OAuth local-save path proven by Google.

Do not create provider-specific editor save behavior.

Regression:

```text
write locally
→ provider sign in
→ return
→ local content unchanged
```

Provider cancel/error must also preserve local content.

## Step 10 — provider-specific tests

For each new provider:

- complete config => provider included;
- missing ID => provider excluded;
- missing secret => provider excluded;
- valid provider can enable auth when core is ready;
- incomplete provider does not disable existing valid provider;
- descriptor exposes no secret/user/token data;
- identity-only scope contract;
- same-origin return behavior;
- `/api/me` stable user ID;
- missing email/image/name safe fallback;
- no automatic email linking;
- My Documents authorization remains stable user ID only;
- anonymous writer still works.

## Step 11 — production proof

For the new provider on the custom production domain:

1. create meaningful local writing;
2. complete provider OAuth;
3. return to intended route;
4. verify local writing unchanged;
5. verify session and `/api/me` stable ID;
6. inspect expected Auth.js provider-account row in `ACCOUNT_DB`;
7. verify no provider token leaks to browser product state;
8. verify sign-out;
9. verify Google/current existing provider still works;
10. verify My Documents ownership/isolation still works;
11. verify anonymous writing;
12. cancel provider OAuth once and verify safe recovery.

## Facebook entry gate

Do not ship Facebook before this real product loop already works through Google:

```text
write locally
→ Google sign in
→ Save to my account
→ My Documents / second device
→ reopen and edit
```

This prevents provider expansion from hiding persistence/identity bugs.

## Stop conditions

Stop and fix if:

- new provider requires a new account/session database;
- existing Google auth regresses;
- provider readiness becomes global all-or-nothing;
- provider requests non-identity permissions;
- email becomes required ownership identity;
- same-email identities are silently merged;
- local writing is lost during provider flow;
- My Documents schema is modified for provider-specific IDs;
- provider tokens are exposed to document/editor code;
- task expands into social graph/provider API access.

## Governance after provider addition

Record:

- provider/config variables (names only, no secret values);
- current package/provider version;
- callback/environment proof;
- focused + regression test evidence;
- production sign-in proof;
- branch/PR/commit.

Update `WU-AUTH-001` status only for provider behavior actually proven.
