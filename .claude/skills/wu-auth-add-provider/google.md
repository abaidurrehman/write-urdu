# Google OAuth reference for WriteUrdu

Use with `.claude/skills/wu-auth-add-provider/SKILL.md`.

## Product role

Google is the first approved provider for `WU-AUTH-001` and should be implemented before Facebook.

“Continue with Google” accepts a normal Google account; do not restrict sign-in to Gmail addresses.

## Required environment variables

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Values belong in Cloudflare encrypted/environment configuration, never source control.

## Callback

Register the callback expected by the current Auth.js Google provider under WriteUrdu's production custom domain, following the project's `/api/auth` base path. At spec time the intended shape is:

`https://www.write-urdu.com/api/auth/callback/google`

**Verify the exact callback path against the implementation and current Auth.js provider before registering it.** The canonical host is `www.write-urdu.com`; do not register a non-canonical hostname accidentally.

Preview callbacks are separate configuration and should be added only when a deliberate preview-OAuth workflow exists.

## Scope contract

Identity only. Use the provider/Auth.js defaults or explicit minimal equivalent needed for basic profile identity.

Do not request Drive, Contacts, Calendar, Gmail mailbox, files, posting or unrelated Google API scopes.

## Verification

- Google button appears only when both credentials are present.
- Sign-in uses the current CSRF-safe Auth.js POST flow.
- Callback returns to an accepted same-origin route.
- Auth.js creates the expected `users`, `accounts` and `sessions` data.
- `GET /api/me` exposes stable `session.user.id`.
- Sign-out works.
- In-progress local writing survives the round trip.
- Homepage transliteration still works signed out and signed in.

## Important distinction

This feature authenticates a Google identity. It does **not** access the user's Gmail inbox and should never request Gmail API scopes.
