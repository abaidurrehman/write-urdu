# Google OAuth reference for WriteUrdu

Use primarily with `.claude/skills/wu-auth-account-shell/SKILL.md`; use `.claude/skills/wu-auth-add-provider/SKILL.md` for later provider-neutral regression work.

## Product role

Google is the first production identity provider for `WU-AUTH-001`.

“Continue with Google” accepts a normal Google account; do not restrict sign-in to `@gmail.com` addresses.

Google identity is the entry point to later **My Documents** continuity. It is not permission to access Google Drive, Gmail or other Google data.

## Required environment variables

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

Values belong in Cloudflare encrypted/environment configuration, never source control.

Core auth also requires the shared `AUTH_SECRET`, `AUTH_ENABLED=true` and dedicated `ACCOUNT_DB` binding.

## Callback

Register the callback expected by the currently installed Auth.js Google provider under WriteUrdu's canonical production custom domain and `/api/auth` base path.

Intended shape:

`https://write-urdu.com/api/auth/callback/google`

**Verify the exact callback path against current implementation/Auth.js before registration.**

The canonical host is `write-urdu.com`; do not accidentally register only `www`, a temporary Pages hostname or a preview host unless that environment is deliberately supported.

Preview callbacks are separate configuration and should be added only when a deliberate preview-OAuth workflow exists.

## Scope contract

Identity only, equivalent to:

```text
openid email profile
```

Do not request:

- Drive;
- Gmail/mailbox;
- Contacts;
- Calendar;
- Cloud Platform;
- files/offline-storage permissions;
- unrelated Google API scopes.

## Account-linking rule

Preserve safe Auth.js behavior equivalent to:

`allowDangerousEmailAccountLinking: false`

Google email is profile/contact data, not a product authorization key.

## Local-writing preservation

Before starting Google OAuth from a writer:

- flush current browser-local writing through the existing editor persistence path;
- do not place Urdu text/rich HTML in OAuth state or query parameters;
- return only to safe same-origin routes;
- normal writer bootstrap must restore the exact local content.

## Verification

- Google provider is ready only when both credentials are complete and core auth config is valid.
- Google button appears only when the provider is ready.
- Sign-in uses the current supported Auth.js CSRF-safe flow.
- Callback succeeds on the canonical custom domain.
- Auth.js creates expected `users`, `accounts` and `sessions` records in `ACCOUNT_DB`.
- Auth rows contain no Urdu writing content.
- `GET /api/me` exposes stable `session.user.id` through the allowlisted product projection.
- Sign-out works without clearing browser-local writing.
- OAuth cancel/error leaves local writing usable.
- In-progress basic, rich and keyboard content survives the round trip.
- Homepage transliteration still works signed out, signed in and when `/api/me` fails.
- Built/static assets expose no Google client secret/session/provider tokens.

## Important distinction

This provider authenticates identity only.

It does **not**:

- access Gmail;
- access Google Drive;
- create provider-backed cloud storage;
- automatically upload WriteUrdu local drafts;
- link another provider by matching email.
