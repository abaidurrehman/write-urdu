---
name: wu-auth-authjs-d1-foundation
description: Implement or review WU-AUTH-001's optional Auth.js + Cloudflare D1 authentication foundation for WriteUrdu. Load when adding Pages Functions auth, Google sign-in foundation, sessions, /api/me, D1 Auth.js migrations, or account-aware header behavior. Preserve anonymous writing and keep Auth.js behind a thin project-owned interface.
---

# WriteUrdu Auth.js + D1 foundation

Use this skill for `WU-AUTH-001` implementation. Read these first:

1. `specs/WU-AUTH-001-social-authentication-foundation.md`
2. `docs/WU-AUTH-DRAFTS-IMPLEMENTATION-PLAN-2026-08-13.md`
3. current `js/editor-tools.js`, `site-header.js`, `package.json` and deployment config
4. current OpenForBots reference implementation:
   - `functions/lib/auth.mjs`
   - `functions/api/auth/[[path]].ts`
   - `functions/api/me.ts`
   - Auth.js migration
   - sign-in page/provider POST logic
5. latest Cloudflare Pages Functions/D1 guidance and the currently installed Auth.js adapter source.

Do not implement from memory when current library/runtime behavior can be checked.

## Guardrails

- Accounts remain optional.
- Do not convert the site to Astro/React/Next.
- Do not touch transliteration initialization to add auth.
- Existing local drafts must work whether auth succeeds, fails or is disabled.
- Only one WriteUrdu module may directly import `@auth/core` / `@auth/d1-adapter`.
- Auth must fail closed; the anonymous product must fail open to its existing local behavior.
- Do not hand-roll OAuth/PKCE/session cookies.
- Do not add email/password auth.
- Do not auto-link providers by matching email.
- Never commit OAuth/client secrets.

## Step 1 — establish the current runtime contract

Before changing code:

- inspect how Cloudflare Pages currently builds/deploys this repo;
- confirm whether a Wrangler config already exists;
- retrieve current Cloudflare Pages Functions, bindings and D1 docs;
- retrieve current Auth.js D1 adapter migration/schema;
- run the existing test/SEO/browser baseline;
- identify a feature-flag path that leaves production behavior unchanged by default.

If current repo/deployment facts conflict with the spec's suggested filenames, adapt filenames while preserving the contracts.

## Step 2 — add backend foundation only

Expected shape:

```text
functions/lib/auth.mjs
functions/api/auth/[[path]].ts
functions/api/me.ts
migrations/...auth...
```

Recommended D1 binding: `WRITE_URDU_DB`.

Use the adapter's current schema verbatim for Auth.js-owned tables. Do not customize those columns to fit product naming conventions.

Implement a thin interface such as:

- `buildProviders(env)`
- `authConfig(env)`
- `authEnabled(env)`
- `handleAuthRequest(request, env)`
- `getSession(request, env)`

Downstream routes use these helpers rather than Auth.js directly.

## Step 3 — gating

`authEnabled(env)` must require:

- `AUTH_ENABLED === 'true'`;
- D1 binding exists;
- `AUTH_SECRET` exists;
- at least one complete provider credential pair exists.

A provider is included only if **both** its client ID and secret are present. An incomplete provider configuration must not render a dead button.

When disabled/misconfigured:

- auth endpoints return safe disabled responses;
- `/api/me` is unauthenticated/not enabled;
- account UI is hidden/unavailable;
- writing pages behave as before.

## Step 4 — Google provider first

Use `.claude/skills/wu-auth-add-provider/google.md` for provider-specific setup.

Requirements:

- identity-only scopes;
- CSRF-safe provider POST flow matching current Auth.js behavior;
- same-origin callback URL handling;
- no unrelated Google APIs/scopes;
- session callback copies stable adapter user ID to `session.user.id` if the current Auth.js default does not do so.

Do not assume a bare GET to `/api/auth/signin/google` starts OAuth; OpenForBots already found the CSRF-protected POST requirement.

## Step 5 — static sign-in/account shell

Create a static, noindex sign-in route using WriteUrdu's v2 shell. Hydrate the session client-side from `/api/me`; do not server-render the entire site.

Header rules:

- anonymous layout stays stable during session lookup;
- signed out shows `Sign in`;
- signed in shows a compact user/account menu;
- no account modal may cover or delay the writing workspace on first load.

OAuth return must preserve the browser-local in-progress draft.

## Step 6 — security review

Check:

- no secret values in source/build artifacts;
- no token/session/draft-content logs;
- account API responses are `no-store`;
- user authorization uses `session.user.id`, not email;
- no request-specific mutable module globals;
- Web Crypto for IDs/tokens where project code creates them;
- parameterized D1 statements;
- callback URLs cannot become open redirects.

## Step 7 — tests

Add contract tests for:

- flag off;
- missing DB;
- missing `AUTH_SECRET`;
- no complete providers;
- Google complete/incomplete credentials;
- unauthenticated `/api/me`;
- stable `session.user.id`;
- direct Auth.js imports confined to the auth module.

Browser/regression proof:

- homepage transliteration signed out;
- rich editor signed out;
- keyboard signed out;
- real Google sign-in on intended environment;
- return to editor retains local draft;
- sign out retains local draft;
- session-aware header does not cause material layout shift.

Run the repository's existing full regression commands, not a reduced auth-only suite.

## Step 8 — production proof and documentation

Verify on the custom production domain, not only `*.pages.dev`:

- OAuth callback succeeds;
- Auth.js `users/accounts/sessions` rows are created;
- `/api/me` returns the user with stable ID;
- sign-out works;
- anonymous editor flow still works.

Update `WU-AUTH-001`, `specs/README.md`, `specs/BACKLOG.md` and the implementation plan with actual shipped status/commit/PR evidence.

## Stop conditions

Stop and fix before expanding to cloud drafts if:

- anonymous writing depends on session availability;
- auth requires a framework migration;
- secrets appear in source;
- user ID is missing from session;
- login loses the local draft;
- Pages Functions routing captures or breaks static SEO routes;
- the runtime cannot stay within acceptable Cloudflare cost/limits.

## Not this skill

Use `wu-drafts-cloud-sync` for draft persistence and conflict behavior. Use `wu-auth-add-provider` to add Facebook or another explicitly approved OAuth provider after the foundation is stable.
