# WU-AUTH-001 — Social Authentication Foundation

**Status:** Planned — founder-approved 2026-08-13  
**Area:** Account / identity  
**Routes:** `/sign-in`, `/api/auth/*`, `/api/me`, shared account controls  
**Depends on:** existing Cloudflare Pages deployment  
**Unblocks:** `WU-DRAFT-001`

## Purpose

Add optional social sign-in so a user can later save selected Urdu writing to an account and restore it on another device. Accounts remain optional: transliteration, the basic editor, rich editor, Urdu keyboard, local drafts, imports, exports and creation tools must continue to work anonymously.

The approved providers are:

1. **Google** — first implementation slice. “Gmail sign-in” means a Google account and must not be limited to `@gmail.com` addresses.
2. **Facebook** — required fast-follow after Google + cloud draft restore is stable.

No email/password flow is in scope.

## Research decision

The OpenForBots implementation being reused is **Auth.js**, not Auth0. At approval time it uses `@auth/core`, `@auth/d1-adapter`, D1-backed sessions, a thin `functions/lib/auth.mjs` wrapper, `/api/auth/*`, `/api/me`, and provider-specific environment variables.

Reference files in `abaidurrehman/openforbots`:

- `functions/lib/auth.mjs`
- `functions/api/auth/[[path]].ts`
- `functions/api/me.ts`
- `migrations/audit/0002_auth_foundation.sql`
- `src/pages/sign-in.astro`
- `context/strategy/openforbots-auth-cpu-spike-2026-08-09.md`

The OpenForBots 2026-08-09 spike found Auth.js stayed inside the tested Workers Free CPU budget while Better Auth's OAuth callback did not. Reuse that decision, but re-check current Auth.js/Cloudflare behavior at implementation time rather than treating the old measurement as permanent.

Cloudflare Pages Functions can add dynamic routes through a root `/functions` directory while WriteUrdu's HTML remains static. **Do not migrate WriteUrdu to Astro/React to add accounts.**

## Non-negotiable architecture

### Anonymous-first

Authentication is additive. If auth is disabled, misconfigured or unavailable, the current product still works.

### Fail closed

Use `AUTH_ENABLED` plus required-config checks. Partial auth configuration must not expose a half-working login path. `/api/auth/*` and `/api/me` must return safe disabled/unauthenticated responses while editors continue normally.

### Thin internal auth interface

Only one WriteUrdu module may import Auth.js directly, expected to be:

`functions/lib/auth.mjs`

Product/API code calls project-owned helpers such as:

- `authEnabled(env)`
- `handleAuthRequest(request, env)`
- `getSession(request, env)`

Do not spread Auth.js cookie names, adapter calls or request shapes across draft APIs or page code.

## Runtime shape

```text
Static WriteUrdu pages
   |
   +-- anonymous/local use (unchanged)
   |
   +-- /sign-in
   |     +-- Google
   |     +-- Facebook
   |
   +-- /api/me
           |
     functions/lib/auth.mjs
           |
        Auth.js
           |
       D1 adapter
           |
    WRITE_URDU_DB
```

Use a dedicated application D1 binding, recommended name `WRITE_URDU_DB`. Do not mix user drafts into an unrelated analytics/OS database.

Use the schema expected by the installed `@auth/d1-adapter` version at implementation time. Auth.js logically owns `users`, `accounts`, `sessions` and `verification_tokens`; product-specific tables belong in separate migrations.

## Configuration contract

Expected variables/secrets:

- `AUTH_ENABLED`
- `AUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`

Never commit provider secrets. Preview and production callback URLs must be configured deliberately.

## Provider contract

### Google first

- identity-only scopes;
- no Drive, Contacts, Calendar or unrelated scopes;
- provider is offered only when both credentials exist;
- use Auth.js's current CSRF-safe sign-in POST flow;
- callback returns only to an accepted same-origin path;
- session callback exposes stable `session.user.id` for authorization.

### Facebook fast-follow

- use the current Auth.js Facebook provider at implementation time;
- identity-only permissions;
- tolerate profiles where email is absent;
- adding Facebook must not regress Google.

### Account linking

Do **not** automatically merge Google and Facebook identities merely because their email strings match. A future explicit “Connected accounts” flow may link providers only while the user is already authenticated and after a separate security review.

## UX contract

Anonymous header: `Sign in`.

Authenticated header: compact user/avatar menu with `My drafts`, `Account`, `Sign out`.

Create a noindex `/sign-in` page using the v2 shell. It must state that accounts are optional and that existing local drafts are not automatically uploaded.

Because the site remains static, hydrate account state client-side from `/api/me`. Keep the anonymous header layout stable while session state loads to avoid layout shift.

## Security and privacy

- Identity scopes only.
- Never log OAuth/session tokens or draft content.
- Account/session responses use `Cache-Control: no-store`.
- Use parameterized D1 queries.
- Protected data is authorized by `session.user.id`, never email alone.
- Use Web Crypto IDs such as `crypto.randomUUID()`.
- No request-scoped mutable module globals.
- Secrets stay in Cloudflare configuration.
- Privacy policy must be updated before cloud persistence is enabled.

## Implementation slices

### A — backend foundation

- add Auth.js dependencies;
- add adapter-compatible D1 migration;
- add D1 binding and config contract;
- add thin auth wrapper;
- add `/api/auth/*` and `/api/me`;
- add disabled/missing-config/unauthenticated tests.

**Exit:** anonymous production behavior is unchanged and auth fails closed.

### B — Google

- register Google OAuth app externally;
- add provider conditionally;
- add `/sign-in` and session-aware header;
- verify real production callback, session and D1 rows.

**Exit:** Google sign-in, `/api/me`, sign-out and return-to-editor work end to end.

### C — product value

Implement `WU-DRAFT-001`. Login alone is not the feature's product value; the valuable loop is write → save to account → restore on another device.

### D — Facebook

- register Facebook app externally;
- add provider through the same conditional provider builder;
- keep scopes minimal;
- verify no silent email-based merge;
- rerun Google regression.

## Testing

Required contract coverage:

- auth off => fail closed;
- missing DB/secret/provider pair => disabled;
- Google-only config => enabled;
- Facebook-only config => enabled once shipped;
- incomplete provider pair => provider excluded;
- `/api/me` without session => unauthenticated;
- authenticated session exposes stable user ID;
- auth module is the only direct Auth.js import location;
- anonymous editor works when auth endpoints fail;
- sign-out does not delete local drafts;
- OAuth return does not lose the in-progress local draft.

Production proof must include a custom-domain login, D1 account/session rows, `/api/me`, no secret leakage in static artifacts, and the existing homepage transliteration smoke test.

## Rollback

`AUTH_ENABLED=false` must disable account behavior without disabling writing. Provider-specific failure should be recoverable by removing that provider's credentials while another provider remains functional. Disabling auth never deletes stored data.

## Out of scope

- mandatory accounts;
- email/password or magic links;
- billing/subscriptions;
- teams/workspaces;
- generic file storage;
- Card Studio image/blob sync;
- social posting permissions;
- Google Drive access;
- automatic provider linking;
- framework migration.

## Acceptance criteria

- [ ] Anonymous writing/local drafts are unchanged.
- [ ] Auth.js is isolated behind one WriteUrdu-owned module.
- [ ] Dedicated D1 binding/database is used.
- [ ] Google works end to end on the production domain.
- [ ] `session.user.id` is stable and used for authorization.
- [ ] `/sign-in` makes optional-account behavior clear.
- [ ] Provider scopes are identity-only.
- [ ] Secrets are absent from source/build artifacts.
- [ ] Facebook is added through the same provider contract after draft restore is stable.
- [ ] No automatic Google/Facebook email merge exists.
- [ ] Privacy copy is updated before cloud storage goes live.

## Related

- `WU-DRAFT-001` — cross-device cloud drafts.
- `WU-PLAT-001` — shared product shell/journey.
- `docs/WU-AUTH-DRAFTS-IMPLEMENTATION-PLAN-2026-08-13.md` — execution sequence.
