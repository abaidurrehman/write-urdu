# WU-GROWTH-002 — Account Save + Share Entry Points

**Status:** Active — revised for `WU-PLAT-002H` activation programme  
**Priority:** P0 retention/distribution dependency  
**Area:** Account conversion / retention / sharing  
**Routes:** `/`, `/urdu-editor`, `/urdu-keyboard`, `/tools/urdu-voice-typing`  
**Reuses:** `WU-AUTH-001`, `WU-DRAFT-001`, `WU-SHARE-001`, existing analytics  
**Prompt-arbitration owner:** `WU-PLAT-002H`  
**Revision date:** 2026-08-30

---

## 1. Product problem

WriteUrdu already has optional accounts, My Documents, public short-link sharing and community publishing. The problem is no longer simply that these capabilities are absent from the writing surfaces.

Product Pulse now shows a meaningful long-writing cohort and a growing number of competing post-writing actions. If every feature owner independently promotes Account, Keep, Share and Community Publish, the writing experience becomes noisier and discovery becomes worse rather than better.

The two desired loops remain:

`write -> keep/save -> return -> write again`

and

`write -> share -> recipient writes -> shares/publishes again`

But the revised product rule is:

> **Ask for one growth decision at a time, after the user has created enough value for that decision to make sense.**

---

## 2. Evidence that changes the old implementation posture

7-day Product Pulse reviewed 2026-08-30:

- 326 measured writing sessions reached 500+ characters;
- 235 reached 1,000+ characters;
- 15 new accounts were observed in the Voice & Accounts block;
- the public share loop produced 8 CTA clicks but 0 referred starts;
- core writing already exposes many task/growth actions.

Therefore `has any text` is no longer a sufficient rule for showing acquisition prompts.

---

## 3. Growth-request arbitration

`WU-PLAT-002H` owns the shared eligibility/arbitration model. This spec owns the account/save/share behavior when selected.

### Growth requests

The following are growth requests:

- `Keep this writing` / account-save acquisition;
- public `Share link` promotion;
- `Publish to Urdu Writers` promotion.

Normal task commands such as Copy/PDF/Word are **not** growth requests and may coexist.

### Default priority

1. **Protect valuable unsaved work** — Keep/save.
2. **Complete the current task** — task commands remain available.
3. **Distribute after value/completion** — Share.
4. **Community publication** — after substantial/long work and only when eligible/appropriate.

The implementation may adjust exact thresholds after measurement, but it must preserve one visible growth request at a time in the governed decision area.

---

## 4. Eligibility by writing state

Use the `WU-PLAT-002H` E0–E5 model rather than independent page-specific timers.

### E0 — empty

- no account/save/share acquisition card;
- no community publishing prompt;
- writing/input task dominates.

### E1/E2 — first value / short text

- do not interrupt first success with account creation;
- Share may remain available as an explicit user-invoked command where already supported;
- no automatic Keep promotion merely because a few characters exist.

### E3 — substantial writing (~500–999 measurement bucket)

If signed out and work is not safely account-backed:

**Keep this writing** becomes eligible and normally wins the growth-request slot.

### E4 — long form (1,000+ measurement bucket)

- Keep remains priority when valuable work is unsaved/account-unprotected;
- if signed in/saved, Community Publish may become eligible according to `WU-COMMUNITY-001`;
- Share may be offered after a meaningful completion point;
- do not show all three together.

### E5 — post-completion

After Copy/export/save:

- Share may become the selected growth request;
- Community Publish may be selected for eligible long-form work;
- account acquisition should not reappear for authenticated users.

Thresholds are evidence buckets, not permanent semantic truth. The shared controller should allow reviewed tuning without duplicating logic across pages.

---

## 5. Signed-out UX

When Keep is selected by arbitration, use outcome-led copy equivalent to:

**Keep this writing**  
Save it in My Documents so you can continue later.

Primary action: `Create free account`  
Secondary utility: existing sign-in route where appropriate.

Do not lead with:

- browser-storage architecture;
- device-sync implementation details;
- OAuth/provider details;
- generic privacy disclaimers.

Those remain in account/privacy/help surfaces.

Creating an account must not become a gate for Copy/export or public Share.

---

## 6. Signed-in UX

Never advertise account creation to an authenticated user.

Useful states/actions:

- explicit `Save to My Documents` / saved state according to the existing editor owner;
- `My Documents`;
- Share/Publish only when selected by arbitration.

Do not show a persistent acquisition card merely because the same component is used for signed-out users.

---

## 7. Share contract

Public sharing remains account-independent unless the underlying existing route explicitly requires identity for another reason.

Reuse the shipped share service:

- Basic Writer -> existing Basic public-share adapter/short-link flow;
- Rich Editor / Urdu Keyboard -> existing plain-text document-share path;
- Voice -> current transcript snapshot path where shipped;
- other surfaces -> their existing approved adapters.

Rules:

- public publishing requires explicit confirmation;
- writing is not automatically uploaded because Share is visible;
- rich formatting may remain private when the public-share contract is plain text;
- writing text never enters URL query/hash or product telemetry;
- editing after publication does not silently mutate an immutable public snapshot;
- Share link and Community Publish remain clearly distinct jobs.

---

## 8. Account-save contract

This spec does not change account ownership or storage schemas.

Preserve existing owners:

- Basic Writer account save/sync behavior;
- Rich Editor / Urdu Keyboard document metadata + revision handling;
- Voice explicit save-copy behavior;
- My Documents APIs;
- short-lived session handoff needed to survive an auth round trip where already approved.

No local draft history is automatically uploaded merely because an account is created.

---

## 9. Prompt coordinator / implementation boundary

Do **not** let each page independently decide `if text then show account card`.

Prefer one shared eligibility/arbitration layer (exact file/name may align with current architecture) that receives only bounded state such as:

- workspace;
- authenticated yes/no;
- save state (`unsaved`, `saved`, `unknown`);
- writing-depth bucket (not writing content);
- most recent completion category;
- community rollout/eligibility flag;
- explicit user-invoked action.

It returns at most one growth-prompt ID:

- `none`;
- `keep`;
- `share`;
- `community_publish`.

The coordinator must not inspect semantic writing content.

Existing persistence/share/community modules remain owners of the selected action.

---

## 10. Visibility/density

- no fixed/sticky/modal account acquisition during active writing;
- no growth prompt may cover the canvas;
- do not insert a large prompt above a focused editor when the user crosses a character threshold;
- prefer stable post-task/continuation regions;
- one growth request at a time;
- ordinary task commands remain immediately usable.

---

## 11. Telemetry

Use `WU-PLAT-002H-METRICS-CONTRACT.md`.

Measure, without content:

For each prompt family (`keep`, `share`, `community_publish`):

- eligible;
- shown;
- clicked/opened;
- completed;
- cancelled/dismissed where useful;
- `suppressed_due_to_arbitration`.

Commercial/retention review should compare:

- substantial writing -> Keep shown -> account/save completion;
- post-completion -> Share shown -> successful publication/share;
- Community Publish shown -> submitted/approved where appropriate;
- resulting return/referred-writing signals;
- task-completion guardrails.

Do not call prompt CTR alone a success.

---

## 12. Privacy boundary

Never emit:

- writing text;
- selected text;
- transcript content;
- email/user identity in product analytics;
- document/share IDs;
- filenames;
- HTML.

No new database is introduced by prompt arbitration.

---

## 13. Acceptance criteria

- [ ] Empty/first-value Basic Writer has no account/share/community acquisition wall.
- [ ] Prompt eligibility follows the shared `WU-PLAT-002H` state model.
- [ ] Substantial unsaved signed-out work can receive `Keep this writing`.
- [ ] Authenticated users never receive account-creation acquisition copy.
- [ ] At most one growth request is visibly promoted in the governed decision area.
- [ ] Share link remains available without account creation where the existing service allows it.
- [ ] Share and Community Publish use distinct labels/flows.
- [ ] Community Publish does not compete with higher-priority unsaved-work protection.
- [ ] Existing document-save/revision behavior remains unchanged.
- [ ] Existing public-share confirmation/privacy behavior remains unchanged.
- [ ] No writing content enters URLs or telemetry.
- [ ] Product Pulse reports eligible/shown/completed/suppressed states for growth requests.
- [ ] Browser acceptance covers signed-out/signed-in E0/E3/E4/E5 states on the governed core routes.

---

## 14. Non-goals

- mandatory signup;
- paid account tier;
- changing auth providers;
- collaboration/teams;
- comments/follows/likes;
- automatic cloud upload of local history;
- redesigning My Documents;
- changing share-artifact storage/API semantics;
- placing AdSense inside prompts or the active writing area;
- using text semantics/AI to decide whether writing is `good enough` to save/publish.

---

## 15. Definition of done

The account/share layer should feel like a helpful consequence of value already created, not another thing the visitor must understand before writing.

A serious writer receives a timely way to keep work. A completed writer receives a timely way to distribute it. An eligible community writer can publish. Those asks do not compete on screen, and none of them become a gate to the core writing task.
