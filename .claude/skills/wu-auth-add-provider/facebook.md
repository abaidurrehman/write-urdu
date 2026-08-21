# Facebook OAuth reference for WriteUrdu

Use with `.claude/skills/wu-auth-add-provider/SKILL.md`.

## Product role

Facebook is an approved `WU-AUTH-001` identity provider, intentionally deferred until the Google + **My Documents** cross-device journey is stable.

Do not use Facebook provider work as a prerequisite for proving the first account-backed writing loop.

## Required environment variables

```text
FACEBOOK_CLIENT_ID
FACEBOOK_CLIENT_SECRET
```

Store values in Cloudflare encrypted/environment configuration, never source control.

Core auth continues to use the same `AUTH_SECRET`, `AUTH_ENABLED` and the existing shared `METRICS_DB` D1 binding as Google (WriteUrdu reuses its one production D1 database rather than a dedicated auth database). Facebook must not introduce another session/database stack.

## Callback

Register the callback expected by the current Auth.js Facebook provider under WriteUrdu's canonical production domain and `/api/auth` base path.

Intended shape:

`https://write-urdu.com/api/auth/callback/facebook`

**Verify the exact callback path and current Meta/Auth.js app requirements before registration.**

Do not accidentally configure only `www`, a temporary Pages hostname or preview host unless that environment is deliberately supported.

## Permission contract

Request only the minimum permissions needed for authentication/basic identity.

Do not request:

- friends/social graph;
- posting permissions;
- Pages/business management;
- advertising;
- Messenger;
- Instagram;
- unrelated Facebook/Meta APIs.

Facebook login exists to identify the user, not to make WriteUrdu a Facebook integration.

## Missing-email/profile behavior

The implementation must tolerate a Facebook identity/profile that does not provide:

- email;
- profile image;
- useful display name.

Stable Auth.js/database `session.user.id` remains the authorization identity regardless of profile fields.

My Documents ownership is always the stable user ID, never an email string.

## Account-linking rule

Do not automatically merge a Facebook login with an existing Google login because their emails match.

Preserve safe Auth.js behavior equivalent to:

`allowDangerousEmailAccountLinking: false`

For a same-email collision:

- do not merge identities;
- do not reassign account-backed documents;
- do not overwrite local writing;
- show a controlled sign-in/account-not-linked message;
- allow the user to retry the sign-in method previously used;
- allow `Continue without an account`.

A future explicit provider-linking feature requires separate authenticated proof-of-control, account-recovery and rollback design.

## Entry gate before implementation

This exact loop should already be stable with Google:

```text
write locally
→ Google sign in
→ Save to my account
→ My Documents
→ second browser/device
→ reopen and continue editing
```

If that flow is not green, fix auth/document persistence before adding Facebook.

## Provider-neutral readiness regression

Adding Facebook must preserve:

```text
Google ready + Facebook incomplete
=> auth ready, Google usable, Facebook hidden
```

A missing Facebook secret must not cause a global account outage.

## Local-writing preservation

Facebook must reuse the same pre-OAuth editor/local-save path proven by Google.

Provider-specific code must not create another editor persistence mechanism.

OAuth cancel/error must leave local writing intact.

## Verification

- Facebook button appears only when both credentials and core auth config are ready.
- OAuth callback succeeds on the canonical custom domain.
- Correct Facebook provider row appears in Auth.js `accounts` in the shared `METRICS_DB`.
- `/api/me` returns stable user ID even when email is unavailable.
- Missing image/name/email renders a safe fallback.
- Sign-out works without clearing browser-local writing.
- Google still signs in after Facebook is added.
- Incomplete Facebook configuration does not disable Google.
- Google/Facebook identities are not silently merged by email.
- My Documents authorization remains scoped only to stable database user ID.
- Existing account-backed documents are not reassigned because of provider email.
- Anonymous editors still work when Facebook is unconfigured/unavailable.
- Provider tokens are not exposed to editor/document code.
- No Facebook social/posting permissions are requested.
