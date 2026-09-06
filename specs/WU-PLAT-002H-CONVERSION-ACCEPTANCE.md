# WU-PLAT-002H — Post-Value Conversion Acceptance Matrix

**Owner:** `WU-PLAT-002H-CONVERSION-REPAIR.md`  
**Purpose:** Browser/manual/telemetry acceptance for the post-value conversion repair.  
**Rule:** This matrix tests outcomes. It must not be used to justify broad UI changes that are not required by the owning spec.

---

## 1. Global invariants

Every slice must satisfy all of these:

- core writing/voice/copy/export stays usable without account creation;
- user text is never sent to anonymous telemetry;
- no speech transcript/audio is logged;
- no writing is placed in URLs;
- no duplicate Keep/Share/Publish promotional requests are visible at once;
- no new generic tool grid is inserted into the active writing/completion area;
- mobile first-value hierarchy from the B2 contract is preserved;
- canonical route/H1/title ownership is unchanged unless a separate SEO owner approves it;
- source text remains recoverable if a continuation/auth destination fails;
- signed-in users do not receive account-acquisition copy.

---

## 2. Slice 0 — Metrics/data quality

| ID | Scenario | Expected |
| --- | --- | --- |
| M0.1 | First-value funnel displayed | Every `rate`/`conversion` uses compatible unique session-state numerator/denominator |
| M0.2 | Repeatable speech finals | Displayed as frequency (`results per start` or equivalent), not success conversion |
| M0.3 | Repeatable numerator > denominator | Dashboard must not label result a success/conversion rate |
| M0.4 | Continuation legacy + v2 events coexist | Path/version dimension separates or safely consolidates them |
| M0.5 | Optional handoff restore step | N/A path is not counted as failure |
| M0.6 | Card Studio Quick path bypasses a step | Funnel does not imply the bypassed step is mandatory |
| M0.7 | Product Pulse metric detail | Numerator + denominator semantics are available in label/definition/footnote |
| M0.8 | Release after denominator change | New release marker permits clean post-change comparison |
| M0.9 | Telemetry payload inspection | No text, transcript, filename, share/doc/community ID, email/account ID |

**Blocking rule:** Slice 1 UI work cannot start until M0.1–M0.8 pass.

---

## 3. Slice 1 — Continuation transport and diagnostic

| ID | Scenario | Expected |
| --- | --- | --- |
| C1.1 | Recommendation becomes eligible | Stable bounded recommendation ID exists |
| C1.2 | Recommendation shown | One impression/session-state is available for conversion denominator |
| C1.3 | Recommendation selected | Selection is attributed to correct source/destination/recommendation |
| C1.4 | Handoff required | Existing handoff mechanism stores/creates payload without URL text |
| C1.5 | Destination navigation succeeds | `destination_ready` only after destination workspace can accept/use state |
| C1.6 | Payload restore required | Restore/accept event is emitted only when actual restoration succeeds |
| C1.7 | Destination user interacts | `meaningful_start` requires destination task interaction, not page load |
| C1.8 | Destination import fails | Source work remains recoverable; failure is bounded and visible/retryable |
| C1.9 | Existing Rich draft conflicts | No silent overwrite |
| C1.10 | Click but destination failure | Not counted as handoff success |
| C1.11 | Mobile continuation | No focus/scroll loop; target task remains visible/usable |
| C1.12 | User ignores recommendation | Core task remains unaffected |

### Diagnostic output required before UI optimization

For each material recommendation/source/destination pair, Product Pulse must show enough data to identify whether the dominant loss is:

- eligibility/impression;
- selection;
- navigation/readiness;
- restore/import;
- meaningful start.

A PR that changes CTA styling before this diagnostic exists fails acceptance.

---

## 4. Slice 2 — Growth request arbitration

Use these product states:

- `E0`: empty/pre-value;
- `E1/E2`: useful short writing;
- `E3`: substantial writing;
- `E4`: long-form writing;
- `E5`: post meaningful completion.

| ID | State | Account/save state | Expected promoted growth request |
| --- | --- | --- | --- |
| A2.1 | E0 | signed out | none |
| A2.2 | E1/E2 | signed out, unsaved | normally none unless owning contract defines a natural completion point |
| A2.3 | E3/E4 | signed out, substantial unsaved | `keep` normally wins |
| A2.4 | E3/E4 | signed in + safely saved | no account acquisition; Keep normally ineligible |
| A2.5 | E5 | signed out + work not protected | Keep may still outrank Share |
| A2.6 | E5 | work safely retained | Share may be eligible |
| A2.7 | E4/E5 | signed in + community eligible | Community Publish may be eligible only if no higher-priority request wins |
| A2.8 | Any | multiple families eligible | exactly one promoted request returned by arbiter |
| A2.9 | Any | no family eligible | arbiter returns none; no placeholder banner |
| A2.10 | Any | task commands present | Copy/PDF/Word/etc. are not suppressed merely because one growth request is selected |

### Telemetry acceptance

For Keep / Share / Publish, verify bounded events/states for:

- eligible;
- shown;
- opened/clicked;
- completed;
- dismissed where relevant;
- suppressed_due_to_arbitration;
- bounded suppression reason/winner.

---

## 5. Slice 3 — Voice-success account/save experiment

| ID | Scenario | Expected |
| --- | --- | --- |
| V3.1 | Voice supported, before mic use | No signup/Keep prompt caused merely by availability |
| V3.2 | Permission requested | No account prompt |
| V3.3 | Listening/interim result | No account prompt interrupts capture |
| V3.4 | Final speech commits Urdu successfully, signed out + unsaved | Keep may become eligible after idle/editable state |
| V3.5 | Final speech fails/no Urdu committed | Voice-success Keep experiment is not eligible |
| V3.6 | User already signed in | No account-acquisition copy |
| V3.7 | Another growth request currently wins | Voice Keep request is suppressed by shared arbiter, not stacked |
| V3.8 | User ignores/dismisses prompt | Voice/text editing remains fully usable |
| V3.9 | User opens account flow | Current writing is preserved using existing account-growth handoff |
| V3.10 | Auth completes and user returns | Writing is restored/saved according to owning draft/auth contract |
| V3.11 | Session contains transcript | Anonymous telemetry still contains no transcript/audio/text |
| V3.12 | Unsupported browser | Existing unsupported fallback unchanged; no misleading account prompt |

### Success definition

The experiment's downstream success is **account flow completed + writing restored/saved**, not navigation to sign-in.

Do not claim a winning conversion variant from 3 assisted sign-ups or another tiny sample. Use a clean release-marked post-change window.

---

## 6. Slice 4 — Long-form continuation

| ID | Scenario | Expected |
| --- | --- | --- |
| L4.1 | User crosses 500 chars | Eligibility may change; no forced modal/interruption |
| L4.2 | User crosses 1,000 chars | Long-form state becomes eligible; no popup exactly at threshold |
| L4.3 | Signed-out unsaved long-form | Keep normally wins promoted growth request |
| L4.4 | Long-form Basic Writer | Rich Editor / Word / PDF remain available as normal task continuations |
| L4.5 | Basic → Rich selected | Text safely transfers; conflict protection applies |
| L4.6 | Destination restore succeeds | User sees/has restored writing and can continue immediately |
| L4.7 | Destination restore fails | Source remains recoverable; no silent data loss |
| L4.8 | Signed-in saved long-form + community eligible | Publish may be eligible after arbitration |
| L4.9 | Long-form text semantic content varies | Recommendation behavior depends on state/depth, not content words |
| L4.10 | Mobile long-form | New continuation UI does not displace editor or create keyboard/focus regressions |

---

## 7. Slice 5 — Export prioritization

| ID | Scenario | Expected |
| --- | --- | --- |
| E5.1 | Substantial/long writing | PDF/Word may receive primary/prominent placement per owner UI |
| E5.2 | Visual job where PNG is relevant | PNG remains discoverable |
| E5.3 | JPEG/TXT/SVG low current usage | Still reachable through existing progressive/More path unless separately deprecated |
| E5.4 | Signed-out user | Copy/export remains account-free |
| E5.5 | Mobile | Export prioritization does not recreate a pre-value command wall |
| E5.6 | Existing export format | Output behavior/format quality unchanged unless explicitly in scope |

---

## 8. Slice 6 — Share/referral continuity

| ID | Scenario | Expected |
| --- | --- | --- |
| S6.1 | Author publishes | Public snapshot/link behavior remains governed by share contract |
| S6.2 | Human opens public page | Reader view counted without exposing share ID in Product Pulse |
| S6.3 | `Create your own` | Correct destination opens ready for creation |
| S6.4 | `Use this text` | Public text restored through approved handoff, never URL text |
| S6.5 | Destination loaded but no interaction | Not a meaningful referred start |
| S6.6 | Reader begins destination task | Referred meaningful start counted |
| S6.7 | Current sample <20 human public views | No product-level CTA redesign conclusion |

---

## 9. Regression routes

At minimum exercise current relevant routes when touched:

```text
/
/urdu-editor
/tools/urdu-voice-typing
/urdu-card-studio
/sign-in
/my-documents (or current draft owner)
public share route(s)
community publish entry point(s)
```

Also test Urdu locale equivalents when the touched shared component is generated/reused there.

---

## 10. Device/browser closeout

Automated browser tests do not replace the current mobile B2 acceptance closeout.

For any slice that changes visible/focus/navigation behavior on writer surfaces, validate at minimum where available:

- iPhone Safari;
- Android Chrome;
- desktop Chromium;
- keyboard-only desktop flow;
- reduced-width viewport from the existing mobile matrix.

Do not mark the pre-existing mobile B2 programme complete from this child spec.

---

## 11. Release review template

For each shipped slice record:

```text
Slice:
Release marker / commit:
Observation window:
Eligible volume:
Primary metric:
Guardrail metrics:
Result: Keep | Iterate | Rollback | Insufficient evidence
What changed:
What did not change:
Next approved slice:
```

Low-volume Share/Community flows should use a longer window rather than forcing a decision from insufficient traffic.