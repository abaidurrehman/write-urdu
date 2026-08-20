# WU-GROWTH-002 — Account Save + Share Entry Points

**Status:** Active — implementation slice approved 2026-08-20  
**Priority:** P0 growth loop  
**Area:** Account conversion / retention / sharing  
**Routes:** `/`, `/urdu-editor`, `/urdu-keyboard`, `/tools/urdu-voice-typing`  
**Reuses:** `WU-AUTH-001`, `WU-DRAFT-001`, `WU-SHARE-001`, `WU-ANALYTICS-001`

## 1. Problem

WriteUrdu now has optional accounts, My Documents and public short-link sharing, but those capabilities are not presented consistently at the moment a user has created valuable Urdu text.

The homepage account card is useful but verbose. Rich Editor and Urdu Keyboard have compact account-save controls, yet their copy emphasizes implementation/continuity details rather than the user outcome. Voice Typing has an editable transcript but no direct account-save or public-share entry point.

That leaves two product-growth loops underexposed:

`write -> save -> return -> write again`

and

`write -> share WriteUrdu link -> recipient opens -> recipient writes -> shares again`

The feature must improve discovery without turning the writing canvas into an account wall or a large marketing panel.

## 2. Product decision

Use one compact **Keep this writing** pattern on active writing surfaces.

For a signed-out user with useful text, the pattern should communicate only the high-value outcomes:

- create a free account to keep the writing in My Documents;
- share a public snapshot with a WriteUrdu link.

Do not lead with browser-storage architecture, device-sync terminology, OAuth details or privacy implementation. Those details remain available in the account/privacy/help surfaces where they belong.

Sharing remains available without an account. Account creation must not be inserted as a gate in front of the viral share loop.

## 3. UX contract

### Signed out

Use compact copy equivalent to:

**Keep this writing**  
Create a free account to save it in My Documents, or share it with a link.

Primary action: `Create free account`  
Secondary action: `Share link`

The sign-in route remains the single identity entry point; `Create free account` is benefit-led CTA wording, not a second authentication system.

### Signed in

Replace acquisition copy with useful state/actions:

- explicit `Save to my account` / `Save to My Documents` according to the existing editor contract;
- `My Documents`;
- `Share link`.

Do not keep advertising account creation after the user is authenticated.

### Visibility and density

- Existing homepage account value space may remain prominent.
- Rich Editor and Urdu Keyboard use the existing compact editor-native account panel.
- Voice Typing gets the same compact visual treatment below the transcript actions and appears only when the transcript contains text.
- No fixed, sticky or modal account promotion.
- No account prompt may cover the active writing canvas or push the primary writing action below a new large marketing block.

## 4. Share contract

`Share link` is account-independent.

- Basic Writer reuses its shipped `WriteUrduBasicPublish` short-link flow.
- Rich Editor and Urdu Keyboard publish the current plain-text snapshot through the existing `document-share.mjs` -> `/api/shares` -> `/s/:id` service.
- Voice Typing publishes its current transcript through the same plain-text snapshot service.
- Public publishing always requires an explicit confirmation that anyone with the link can view the selected snapshot.
- Rich formatting remains private; the public artifact contains the plain-text snapshot only.
- No user text is placed in URLs, telemetry events or account-entry query parameters.
- Editing after publication does not silently mutate an existing public snapshot.

## 5. Account-save contract

This slice does not change account ownership, document schemas or sync semantics.

- Basic Writer keeps the existing explicit opt-in account save and throttled sync.
- Rich Editor and Urdu Keyboard keep the existing explicit opt-in account save, per-editor metadata and optimistic revision handling.
- Voice Typing saves an explicit **copy** as a basic text document in the existing My Documents API. It does not introduce a fourth document editor kind or continuous voice-document sync.
- Voice text is preserved in short-lived `sessionStorage` before account navigation so an OAuth round trip does not discard a transcript. The handoff expires after 30 minutes and is consumed on restore.
- No local-draft history is automatically uploaded when a user creates an account.

## 6. Privacy and data boundaries

No new database or storage binding is introduced.

Existing services only:

- Auth.js identity session from `WU-AUTH-001`;
- `writing_documents` in the existing D1 binding from `WU-DRAFT-001`;
- Share Artifact API/storage from `WU-SHARE-001`.

The compact entry point must not send writing text to analytics. Account-entry telemetry records only a route/handoff event. Public share telemetry uses existing bounded share events.

A user can continue writing, copying and exporting without creating an account.

## 7. Telemetry / commercial measurement

This feature is intended to increase repeat usage and referral acquisition, not to claim direct revenue by itself.

Use existing privacy-safe events where available:

- account CTA -> existing `tool_handoff` to `/sign-in`;
- share attempt -> `share_clicked` / `share_publish_started`;
- successful publish -> `share_publish_completed`;
- completed native/copy share -> `share_completed`;
- failed publish -> `share_publish_failed`.

Do not add user text, email, document IDs or share IDs to product telemetry.

Commercial evaluation should compare:

1. engaged writing sessions -> account-entry clicks;
2. account-entry clicks -> authenticated users / saved documents;
3. engaged writing sessions -> public link publication;
4. published links -> share-page visits -> recipient creation starts;
5. resulting repeat sessions/page depth and observed AdSense revenue.

The founder target of `$5/day` is an outcome target, not an acceptance assertion for this individual feature.

## 8. Implementation map

### Shared growth layer

`js/account-growth-entry.mjs`

- enhances the existing Basic/Rich/Keyboard account panels rather than duplicating their persistence controllers;
- changes signed-out CTA language to `Create free account`;
- removes device/local-storage explanation from the visible compact value copy;
- exposes account-independent `Share link` actions;
- owns Voice Typing account/share continuity.

### Shared shell

`site-header.js`

- loads the growth layer only on `/`, `/urdu-editor`, `/urdu-keyboard`, `/tools/urdu-voice-typing`;
- continues to load the original account controllers on their existing routes.

### PWA

`sw.js`

- application-shell refresh so returning users receive the updated shared shell;
- include the new growth module in the application shell.

### Governance/tests

- register this spec in `specs/README.md`;
- add a focused contract test and retain existing Auth/My Documents/share/Voice contracts.

## 9. Non-goals

- mandatory signup;
- paid account tier;
- Facebook authentication in this slice;
- public profiles, followers, comments or teams;
- collaboration/live shared documents;
- changing the share-artifact backend or public `/s/:id` semantics;
- adding a new D1 database;
- automatic upload of browser-local drafts;
- redesigning My Documents;
- placing AdSense inside the account prompt or active writing canvas.

## 10. Acceptance criteria

- [ ] Homepage account value card says `Create free account` for signed-out users and exposes an actual `Share link` action.
- [ ] Homepage visible value copy focuses on My Documents + sharing rather than device/browser implementation detail.
- [ ] Rich Editor and Urdu Keyboard compact account panels say `Create free account` when signed out.
- [ ] Rich Editor and Urdu Keyboard expose account-independent `Share link` actions using plain-text immutable snapshots.
- [ ] Voice Typing shows a compact prompt only after transcript text exists.
- [ ] Signed-out Voice Typing offers `Create free account` and `Share link`.
- [ ] Voice transcript survives the sign-in round trip through a short-lived session-only handoff.
- [ ] Signed-in Voice Typing can explicitly save a copy to My Documents and can open My Documents.
- [ ] Voice sharing does not require account creation.
- [ ] Every public share path requires explicit public-snapshot confirmation.
- [ ] No writing text enters URLs or product telemetry.
- [ ] Existing local autosave, account revision safety, Voice recognition and `/s/:id` behavior remain unchanged.
- [ ] PWA application shell includes the new module so returning users receive the updated entry points.
- [ ] Focused contract tests and the repository quality suite pass.

## 11. Verification

Focused:

```bash
node tests/account-growth-entry-contract.test.js
node tests/account-documents-basic-contract.test.js
node tests/account-documents-editors-contract.test.js
node tests/urdu-voice-typing-contract.test.js
node tests/share-loop-contract.test.js
```

Repository gate:

```bash
npm test
```

Browser acceptance should cover signed-out and signed-in desktop/mobile states on the four governed routes, including public-share confirmation and Voice transcript preservation through account navigation.
