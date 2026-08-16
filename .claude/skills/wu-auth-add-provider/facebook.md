# Facebook OAuth reference for WriteUrdu

Use with `.claude/skills/wu-auth-add-provider/SKILL.md`.

## Product role

Facebook is an approved `WU-AUTH-001` provider, but it is intentionally a fast-follow after the Google + cross-device cloud-draft journey is stable.

Do not use Facebook provider work as a prerequisite for proving the first draft persistence loop.

## Required environment variables

- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`

Store values in Cloudflare encrypted/environment configuration, never source control.

## Callback

Register the callback expected by the current Auth.js Facebook provider under WriteUrdu's canonical production domain and `/api/auth` base path. At spec time the intended shape is:

`https://write-urdu.com/api/auth/callback/facebook`

**Verify the exact callback path and current Meta/Auth.js requirements before app registration.** Do not accidentally register only the non-canonical hostname or a temporary Pages URL.

## Permission contract

Request only the minimum permissions needed for authentication/basic identity.

Do not request posting, Pages management, friends, advertising, business-management or unrelated Facebook/Meta permissions.

The implementation must tolerate a Facebook identity/profile that does not provide an email address. Draft ownership is always the Auth.js/database user ID, never an email string.

## Account-linking rule

Do not automatically merge a Facebook login with a Google login because their emails match.

A future explicit provider-linking feature may be designed separately while the user is already authenticated. Until then, preserve the safe provider/account behavior defined by `WU-AUTH-001`.

## Gate before implementation

The following flow should already be stable with Google:

`write locally -> sign in -> Save to my account -> second browser/device -> restore and continue`

If that flow is not green, fix persistence before adding Facebook.

## Verification

- Facebook button appears only when both credentials are present.
- OAuth callback succeeds on the canonical custom domain.
- Correct provider row appears in Auth.js `accounts`.
- `/api/me` returns a stable user ID even when email is unavailable.
- Sign-out works.
- Google still signs in after Facebook is added.
- Google/Facebook identities are not silently merged by email.
- Draft authorization remains scoped to stable database user ID.
- Anonymous editors still work when Facebook is unconfigured or unavailable.
