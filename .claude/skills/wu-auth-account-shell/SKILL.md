---
name: wu-auth-account-shell
description: Implement or review WU-AUTH-001 AUTH-B: Google sign-in, the static /sign-in account shell, /api/me hydration, sign-out, same-origin return handling and preservation of in-progress local Urdu writing through OAuth. Load only after the Auth.js + ACCOUNT_DB backend foundation is stable.
---

# WriteUrdu AUTH-B — Google Account Shell

Use after `wu-auth-authjs-d1-foundation` has completed and AUTH-A is green.

## Read first

1. `specs/WU-AUTH-001-social-authentication-foundation.md`
2. `specs/WU-ACCOUNT-001-account-document-platform-boundary.md`
3. `docs/WU-AUTH-INVOICECRAFTLY-REUSE-MAP-2026-08-19.md`
4. `docs/WU-AUTH-DRAFTS-IMPLEMENTATION-PLAN-2026-08-13.md`
5. current `functions/lib/auth.mjs`, `/api/auth/*`, `/api/me`
6. current `js/editor-tools.js` and all three editor bootstrap paths
7. current shared v2 header/navigation code
8. current InvoiceCraftly Google account-shell implementation/tests
9. `.claude/skills/wu-auth-add-provider/google.md`
10. current Auth.js Google sign-in/CSRF behavior and Google OAuth configuration requirements.

## Entry gate

Do not start this skill until:

- Auth.js is isolated behind one WriteUrdu module;
- `ACCOUNT_DB` migration/binding contract exists;
- `/api/me` backend behavior is tested;
- disabled/misconfigured/ready states are deterministic;
- anonymous baseline remains green.

## Product objective

The account shell should make sign-in available without turning WriteUrdu into a login-first product.

Target user journey:

```text
write
→ Sign in
→ Continue with Google
→ return to same writing context
→ local writing still present
→ optional My Documents value later
```

## Step 1 — inspect current v2 shell before markup

Do not copy InvoiceCraftly HTML/CSS.

Identify:

- current shared header mount/render path;
- mobile header behavior;
- account/control slot location;
- writer top position/canvas boundary;
- current navigation helper used for safe same-origin transitions;
- existing noindex/static metadata patterns.

The account control must not make the authoring canvas harder to notice or push it materially lower on mobile.

## Step 2 — Google provider readiness

Use the current Auth.js Google provider already prepared by AUTH-A or add it only inside `functions/lib/auth.mjs` if AUTH-A intentionally deferred construction.

Required identity scope:

```text
openid email profile
```

No Drive/Gmail/Calendar/Contacts/storage scopes.

Render Google in UI only when provider readiness says it is usable.

Do not hard-code “Google is always configured”.

## Step 3 — static `/sign-in`

Build a noindex static route using the current WriteUrdu v2 shell.

Required product copy concepts:

- account is optional;
- sign in to save selected writing to your account / continue later;
- existing local writing is not automatically uploaded;
- continue without an account remains visible.

Actions:

```text
Continue with Google
Continue without an account
```

Do not introduce email/password UI placeholders.

Do not show Facebook until it is actually implemented/configured.

## Step 4 — use current Auth.js CSRF-safe sign-in flow

Inspect the installed Auth.js behavior and InvoiceCraftly account shell before implementation.

Do not assume a bare GET to `/api/auth/signin/google` is sufficient.

Use the supported CSRF token + POST/provider flow for the installed version, or its current documented equivalent.

Do not hand-roll OAuth state/PKCE/cookies.

## Step 5 — preserve current local writing before OAuth

This is the most important WriteUrdu-specific adaptation.

Before navigation away from any writer/account entry:

- flush pending local autosave through the current `js/editor-tools.js` / adapter mechanism;
- do not create a parallel temporary save implementation;
- do not put Urdu text/rich HTML in URL/query/OAuth state;
- persist only safe local state/return context;
- navigate after the local save path is complete/best-effort according to existing semantics.

After OAuth returns, normal editor bootstrap should restore canonical local state.

Test meaningful content, not an empty editor.

## Step 6 — bounded return targets

Allow return only to safe same-origin WriteUrdu routes.

Prefer a small product-owned resolver/allowlist for relevant contexts such as:

- `/`;
- `/urdu-editor`;
- `/urdu-keyboard`;
- `/my-documents` when it exists;
- `/sign-in`/account context where appropriate.

Use current actual route paths; do not invent stale ones.

External-origin or malformed return targets fall back safely.

## Step 7 — `/api/me` hydration

The static shell should query `/api/me` client-side without blocking writer initialization.

Header behavior:

```text
signed out  → Sign in
signed in   → compact avatar/name account control
```

Signed-in menu:

```text
My Documents
Account
Sign out
```

If My Documents has not shipped yet, do not expose a dead link; hide it or route according to the current staged release decision.

Reserve stable header space so account hydration does not create material layout shift.

Missing image/name/email must degrade safely.

## Step 8 — sign-out

Use the current supported Auth.js sign-out flow including required CSRF handling.

Sign-out must:

- end the account session;
- not clear browser-local writing/history;
- not delete account-backed documents;
- return to a safe same-origin product context.

## Step 9 — error/cancel behavior

Normalize provider/account errors into small product messages.

OAuth cancel, provider outage or account-not-linked behavior must always leave a clear path to:

- retry;
- use the previous sign-in method where relevant;
- continue without an account.

Never expose raw provider/Auth.js exceptions/tokens.

Never imply local writing is lost because sign-in failed.

## Step 10 — noindex/privacy/SEO boundary

Account surfaces must be noindex.

Verify adding `/api/auth/*`, `/api/me` and `/sign-in` does not alter:

- public route canonical tags;
- sitemap membership of established public pages;
- robots behavior for public SEO owners;
- transliteration initial HTML;
- page titles/meta of mature acquisition routes.

## Step 11 — focused tests

Add/reuse tests for:

- provider button shown only when Google ready;
- no dead Google button when config incomplete;
- CSRF token/sign-in form behavior;
- bounded callback/return targets;
- account page noindex;
- `/api/me` signed-out and signed-in UI states;
- missing profile image/name/email fallback;
- sign-out form/action;
- no provider/storage tokens exposed client-side;
- shared header stable placeholder/hydration contract.

## Step 12 — browser regression

At minimum test:

### Basic/homepage writer

```text
type Urdu
→ local save
→ Sign in
→ Google
→ return
→ exact writing present
→ sign out
→ writing still present
```

### Rich editor

Use Urdu text with formatting; prove exact rich content survives the OAuth round trip.

### Urdu keyboard

Use actual Urdu keyboard input; prove content survives.

### Failure

Make `/api/me` unavailable or simulate account lookup failure; prove typing/editor initialization still works.

### Narrow/mobile

Prove account UI does not cover/push the main authoring surface into a poor first viewport.

## Step 13 — production proof

Do not call AUTH-B ready based only on mocks/local tests.

On the custom production domain:

1. create meaningful local content;
2. complete real Google sign-in;
3. return to intended writer;
4. verify content unchanged;
5. verify `/api/me` authenticated projection;
6. verify expected Auth.js `users/accounts/sessions` rows in `ACCOUNT_DB`;
7. verify no Urdu content in auth rows;
8. sign out;
9. verify local content remains;
10. cancel OAuth once and verify recovery;
11. inspect static assets for secrets/tokens;
12. capture desktop + narrow account shell/header evidence.

Record callback/binding evidence without secret values.

## Stop conditions

Stop and fix if:

- sign-in loses in-progress writing;
- account state delays editor initialization;
- session hydration causes significant header/canvas layout shift;
- Google login requests non-identity scopes;
- account routes become indexable accidentally;
- sign-out clears local data;
- external return targets are accepted;
- raw OAuth/Auth.js errors leak to UI;
- implementation introduces a framework migration;
- My Documents/profile/team functionality is pulled into this slice.

## Exit gate

AUTH-B is complete only when real Google production sign-in works and the local-writing preservation regression is proven.

After AUTH-B, move to `WU-DRAFT-001` using `wu-drafts-cloud-sync`. Do not add Facebook first merely because provider wiring is easy.
