---
name: wu-auth-account-shell
description: Implement or review WU-AUTH-001 AUTH-B for WriteUrdu: Google sign-in, noindex account shell, session-aware header, sign-out and safe return to local writing after AUTH-A is stable. Uses the existing METRICS_DB-backed Auth.js foundation; does not create databases or document persistence.
---

# WriteUrdu AUTH-B — Google + account shell

Use only after AUTH-A is merged/stable.

Read first:

1. `specs/WU-AUTH-001-social-authentication-foundation.md`
2. `specs/WU-ACCOUNT-001-account-document-platform-boundary.md`
3. `docs/WU-AUTH-INVOICECRAFTLY-REUSE-MAP-2026-08-19.md`
4. current `functions/lib/auth.mjs`, `/api/me`, header/runtime and `js/editor-tools.js`
5. `.claude/skills/wu-auth-add-provider/google.md`
6. current Auth.js Google provider documentation.

## Preconditions

Do not start if:

- AUTH-A does not use the existing `METRICS_DB`;
- Auth.js adapter migration is not proven additive;
- `/api/me` is unstable;
- anonymous writing regression is red;
- existing telemetry/share behavior regressed.

## Scope

Deliver:

- Google provider/configuration;
- noindex `/sign-in` page;
- current Auth.js CSRF-safe provider sign-in flow;
- session-aware shared header;
- signed-in utility menu;
- sign-out;
- same-origin return handling;
- local writer flush before OAuth;
- production custom-domain callback/session proof.

Do not deliver:

- `writing_documents`;
- My Documents persistence;
- Facebook;
- profiles/followers;
- collaboration/teams;
- new D1 database or binding.

## Database rule

AUTH-B consumes AUTH-A exactly as implemented:

```text
Auth.js → D1Adapter(env.METRICS_DB)
```

Do not introduce `ACCOUNT_DB`, `WRITE_URDU_DB` or another D1 database while adding account UI.

UI code never accesses D1 directly. It obtains account state from `/api/me`.

## Google provider

Identity-only scope equivalent to:

```text
openid email profile
```

Never request Drive, Gmail, Calendar, Contacts or unrelated provider APIs.

Provider is visible only when its configuration is ready.

User-facing label:

```text
Continue with Google
```

Do not call this “Gmail login”.

## Sign-in page

Create a static, noindex `/sign-in` route using the current v2 shell.

Required message concepts:

- account is optional;
- sign in to save selected writing and continue later;
- existing local drafts are not automatically uploaded;
- writing still works without an account.

Primary actions:

```text
Continue with Google
Continue without an account
```

Do not turn the route into a generic social-login wall.

## Session-aware header

Signed out:

```text
Sign in
```

Signed in:

```text
My Documents
Account
Sign out
```

Hydrate from `/api/me` client-side.

Reserve stable layout space so session lookup does not materially shift navigation or push the writer/canvas downward, especially on mobile.

Session lookup must not block transliteration/editor startup.

## Preserve local writing through OAuth

Before account navigation/OAuth:

1. flush scheduled local save using the existing editor adapter/persistence path;
2. never put Urdu text/rich HTML in query params or OAuth state;
3. retain only a safe same-origin return route;
4. perform Auth.js sign-in;
5. return to the safe route;
6. normal writer initialization restores local state.

Required flow:

```text
write meaningful Urdu
→ flush/save locally
→ Continue with Google
→ OAuth callback
→ return to writer
→ exact local content remains
→ sign out
→ exact local content remains
```

Also prove rich formatting survives this navigation round-trip.

## Error behavior

Normalize errors rather than expose raw Auth.js/provider responses.

Useful categories:

```text
auth-unavailable
provider-unavailable
provider-cancelled
account-not-linked
session-expired
```

All failures must preserve a clear path back to anonymous writing.

Do not enable automatic email account linking to avoid an account-not-linked error.

## Security checks

- exact canonical callback verified against current Auth.js behavior;
- same-origin return target only;
- no open redirect;
- no secret/token/session data in static assets/logs/analytics;
- account responses remain `no-store`;
- no provider storage/data permissions;
- sign-out does not clear local drafts/history;
- UI never talks directly to D1.

## Production proof

On canonical `write-urdu.com`:

1. create meaningful local writing;
2. complete Google sign-in;
3. return to intended route;
4. confirm local writing unchanged;
5. confirm `/api/me` authenticated with stable user ID;
6. confirm expected Auth.js rows exist in the existing D1 database;
7. confirm no Urdu document content exists in Auth.js rows;
8. confirm telemetry/share endpoints still work;
9. sign out and confirm local content remains;
10. cancel OAuth once and confirm writing remains usable;
11. run signed-out/signed-in homepage, rich editor and keyboard smoke tests;
12. inspect mobile header/canvas placement for regression.

## Exit gate

AUTH-B is done only when Google sign-in works end to end and the account UI creates no dependency between writing and auth availability.

My Documents begins only after this gate is green.

## Rollback

Set `AUTH_ENABLED=false` to disable account behavior. Do not remove shared-database tables as rollback.
