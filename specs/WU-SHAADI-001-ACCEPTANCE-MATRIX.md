# WU-SHAADI-001 — Acceptance Matrix

**Parent:** WU-SHAADI-001-pakistan-wedding-invitation-platform.md  
**Architecture:** WU-SHAADI-001-ARCHITECTURE-CONTRACT.md

This matrix defines product acceptance across the complete epic. Individual slices use the applicable subset and must not claim full-epic completion prematurely.

---

## 1. Domain correctness

| Scenario | Expected |
|---|---|
| Nikah-only wedding | One Nikah event can be completed without forcing Mehndi/Baraat/Walima fields. |
| Multi-event wedding | Multiple functions have independent date, programme and venue data. |
| Bride-side Baraat | Host wording can be explicitly configured without hard-coded hidden assumptions. |
| Groom-side Walima | Host wording can be explicitly configured and rendered independently of Baraat. |
| Custom event | User can add a named event without breaking controlled defaults for known event types. |
| One event changes venue | Every dependent invitation regenerated from the project reflects the new venue. |
| One event changes time | All dependent outputs reflect the new time without editing each card. |
| Event removed | Guest links/outputs no longer include the removed event after regeneration/publication update. |
| Missing required data | Preview clearly marks incomplete content; renderer does not invent values. |
| Long venue name | Layout adapts or warns; no silent clipping. |

---

## 2. Couple/family wording

| Scenario | Expected |
|---|---|
| Both couple names shown | Supported in Urdu, English and bilingual output. |
| Lineage mode | Parentage can be included explicitly. |
| Family-led wording | Family/host invitation wording can be selected without requiring couple-first phrasing. |
| Bride name intentionally omitted | Product supports a user-selected alternate formulation without judging or forcing disclosure. |
| Custom wording | Editable plain text is preserved; no hidden AI rewrite. |
| Deceased parent marker | Only appears when user explicitly enters/selects it; never inferred. |
| Honorific/social title | Only user-provided or explicitly selected. |
| Mixed Urdu/Latin names | Correct direction and legibility; no punctuation scrambling. |

---

## 3. Religious content

| Scenario | Expected |
|---|---|
| No religious opening | Valid invitation. |
| Bismillah selected | Uses reviewed library entry. |
| Verified verse selected | Exact approved text/reference rendered; no LLM mutation. |
| Custom user religious text | Clearly treated as user-provided content, not verified by Write Urdu. |
| AI wording assistance enabled later | Verified Arabic religious text is excluded from rewriting. |
| Source missing/unreviewed | Item cannot appear in verified library. |

---

## 4. Wording engine

| Scenario | Expected |
|---|---|
| Urdu Nikah | Complete deterministic wording from valid project fields. |
| English Nikah | Complete deterministic wording. |
| Bilingual | Both languages remain readable and directionally correct. |
| Mehndi | Less-formal template available without forcing formal Baraat wording. |
| Walima | Can use groom-side host wording. |
| Missing host | Clear incomplete state; no invented family name. |
| Missing event time | No fake default time in final output. |
| User edits generated wording | Edit persists for that project/template context according to documented behavior. |

---

## 5. Guest household personalization

| Scenario | Expected |
|---|---|
| Individual guest | Addressee does not imply family/couple. |
| Couple | Couple scope can be expressed without exposing another household. |
| Family | User can explicitly add و اہلِ خانہ or equivalent controlled wording. |
| Custom scope | Custom label supported with validation. |
| One household invited to Nikah+Baraat | Only those events render for that household. |
| Another household invited to Walima only | Only Walima renders. |
| Empty invited-event list | Mark incomplete; never silently interpret as all events. |
| Duplicate display names | Remain separate records unless user explicitly merges them. |
| Guest name contains punctuation | Safely rendered as text. |
| Guest name contains HTML-like content | Escaped; never interpreted as markup. |

---

## 6. Roman/Latin → Urdu name assistance

| Scenario | Expected |
|---|---|
| Muhammad Usman | Urdu suggestion shown but editable. |
| Ambiguous name | User can correct before confirmation. |
| Batch paste | Each row gets independent review state. |
| Confirmed conversion | Used in Urdu output. |
| Unconfirmed conversion | Must not be auto-published/sent. |
| User enters Urdu directly | No forced transliteration pass. |
| Mixed Roman Urdu relationship label | Conversion may be suggested but must remain editable. |
| Honorific | Never inferred from the name. |

---

## 7. Local-first privacy

| Scenario | Expected |
|---|---|
| User starts project | No wedding project is uploaded. |
| User adds 100 guest names | Names remain local before explicit publication. |
| User adds phone numbers in a later supported local field | No telemetry/server upload by default. |
| User exports PNG/PDF | Export does not publish. |
| User shares image-only via native device share | Does not implicitly create a public invitation link unless explicitly labeled. |
| User clears project | Local project/guest data is removed according to storage contract. |
| Analytics inspection | No names, addresses, wording, phone numbers or RSVP identity present. |
| Network inspection before publication | No wedding/guest payload sent except ordinary static assets and existing bounded telemetry. |

---

## 8. Local storage and recovery

| Scenario | Expected |
|---|---|
| Refresh | Local project restores. |
| Schema version upgrade | Supported migration preserves known data. |
| Corrupt JSON/storage | Fail closed with recover/reset guidance; page remains usable. |
| Old template ID removed | Project reports unavailable design and offers safe fallback without losing content. |
| Storage quota exceeded | User receives actionable warning; current in-memory project is not silently discarded. |
| Delete project | Removes project and guest records locally. |

---

## 9. Visual rendering

| Scenario | Expected |
|---|---|
| Short Urdu wording | Attractive readable layout. |
| Long Urdu wording | Fits, reflows or warns; never silently clipped. |
| Bilingual wording | Urdu and Latin blocks preserve intentional alignment/direction. |
| Long family names | No overlap with decorative elements. |
| Multiple programme rows | All rows readable. |
| 360px mobile | Preview remains readable and no horizontal page overflow. |
| print output | Safe margins respected. |
| background changed | Structured content remains unchanged. |
| Card Studio fine-tune | Advanced visual edit does not corrupt WeddingProject. |

---

## 10. Existing Card ecosystem regression

| Existing feature | Must remain |
|---|---|
| /urdu-card-studio | Existing projects/render/export behavior. |
| /urdu-card-gallery | Shared backgrounds and preview behavior. |
| /urdu-cards | Ready-made card browse/share path. |
| WU-SHARE-001 | Existing /s/:id artifacts, management and reporting. |
| background registry | Existing IDs stable. |
| visual handoffs | Existing source allowlists remain strict. |
| public card sharing | No wedding schema leakage into generic share rows. |

---

## 11. Export

| Scenario | Expected |
|---|---|
| PNG | Receiver-quality image with correct Urdu rendering. |
| PDF | Valid readable output; font/rendering checked. |
| print proof | Output matches selected print preset and safe areas. |
| image native share | Works where supported and falls back safely. |
| failure during export | Local project remains intact. |
| repeated export | Deterministic content for unchanged project. |
| filename | Safe; no path injection. |

---

## 12. Bulk generation

| Scenario | Expected |
|---|---|
| 10 guests | Completes without UI freeze. |
| 100 guests | Uses bounded queue; progress visible. |
| large guest list on mobile | System warns/uses manageable batches rather than crashing. |
| one guest render fails | Other items continue; failure listed. |
| cancel | Stops future renders and releases resources. |
| retry | Failed items can be regenerated. |
| output order | Stable/deterministic. |
| telemetry | Uses count buckets only, never names. |

Slice 0/3 must set concrete practical thresholds from benchmarks before release.

---

## 13. Envelope/recipient label

| Scenario | Expected |
|---|---|
| Urdu family label | Correct RTL and readable print. |
| English label | Correct LTR. |
| Mixed label | Stable punctuation/direction. |
| with-family option | Explicit controlled wording. |
| printer output | Margins and scaling preserve names. |
| long name | Wraps or warns; no clipping. |

---

## 14. Publication consent

| Scenario | Expected |
|---|---|
| User exports locally | No publication. |
| User clicks Publish invitation | Clear explanation before upload. |
| User cancels | No publication row/media created. |
| Publish succeeds | User gets private/opaque link and management/revoke control. |
| Publish partially fails | Cleanup/retry behavior documented; no orphaned public content where avoidable. |
| Local project changes | Existing publication does not silently mutate unless explicit update behavior exists. |

---

## 15. Personalized link privacy/security

| Scenario | Expected |
|---|---|
| Link ID inspected | Opaque random value; no guest/couple name. |
| Guess adjacent ID | No sequential relationship. |
| Guest A opens link | Only Guest A allowed events are serialized/rendered. |
| User edits query parameter | Cannot select Guest B. |
| Guest B link revoked | Becomes unavailable without affecting Guest A unless publication-wide revoke chosen. |
| Wedding publication revoked | All dependent guest links become unavailable. |
| page source inspected | No phone numbers/local notes/full guest list. |
| robots | noindex. |
| sitemap | absent. |
| management token | never in public HTML/URL. |

Security tests should include direct endpoint requests, not only browser UI.

---

## 16. Social preview

| Scenario | Expected |
|---|---|
| WhatsApp crawler | Receives server-rendered title/image metadata. |
| generic guest link | Preview does not unexpectedly leak personalized name. |
| explicit personalized-preview feature later | Requires separate privacy approval and tests. |
| revoked link | Preview/media no longer exposes active invitation content according to cache policy. |

---

## 17. Maps

| Scenario | Expected |
|---|---|
| valid map link | Opens directions/map appropriately. |
| no map link | Invitation remains complete; no broken CTA. |
| malformed URL | Rejected or safely treated as text; no script execution. |
| guest denies location | No effect; product does not require location permission. |
| private draft | Map/address is not uploaded pre-publication. |

---

## 18. Calendar

| Scenario | Expected |
|---|---|
| one event | Calendar action has correct date/time. |
| multiple events | Each event can be added separately. |
| timezone explicitly set | Calendar reflects it. |
| timezone unknown | UI requires clarification or uses documented project default; never IP guess. |
| changed time | regenerated calendar data reflects update. |

---

## 19. RSVP

| Scenario | Expected |
|---|---|
| RSVP disabled | No RSVP UI/table requirement. |
| RSVP yes | Host sees bounded positive response. |
| RSVP no | Host sees bounded decline. |
| family invited with cap 4 | Party count cannot exceed 4. |
| individual invitation | Party count defaults/limits accordingly. |
| repeated response | Defined update/idempotency behavior. |
| bot spam | Rate limits/validation present. |
| free text | Not collected in first release. |
| analytics | No identity or response text; only bounded aggregate product events. |
| publication revoked | Further RSVP behavior follows documented closed state. |

---

## 20. Mobile UX

Required test widths: 360, 375, 390, 412/430 CSS px.

Acceptance:

- [ ] first task obvious;
- [ ] progress/steps understandable;
- [ ] no horizontal page overflow;
- [ ] no tiny tap targets;
- [ ] event add/remove works with software keyboard;
- [ ] time/date fields remain reachable;
- [ ] preview can be inspected without losing form state;
- [ ] Urdu input does not jump page unexpectedly;
- [ ] bulk guest review remains usable;
- [ ] sticky footer/header does not cover fields;
- [ ] Share/Download actions remain discoverable after completion.

---

## 21. Accessibility

- [ ] semantic form labels;
- [ ] fieldset/legend or equivalent grouping for event/host choices;
- [ ] correct lang and dir attributes;
- [ ] visible focus;
- [ ] no hover-only actions;
- [ ] status/progress announced appropriately;
- [ ] errors associated with fields;
- [ ] preview not sole carrier of important data;
- [ ] keyboard operation for add/remove/reorder where available;
- [ ] reduced motion respected;
- [ ] sufficient contrast in UI and card templates.

---

## 22. Performance

Required benchmark categories:

- [ ] initial route load;
- [ ] first interactive form;
- [ ] live preview update;
- [ ] transliteration suggestion;
- [ ] single PNG export;
- [ ] PDF export;
- [ ] 10-guest generation;
- [ ] 100-guest bounded generation;
- [ ] public invite first render.

Hard architectural gates:

- no N canvases mounted for N guests;
- no eager full-res asset download for every wedding design;
- no AI call required for basic invitation completion;
- no network write on each form keystroke;
- no synchronous bulk loop that blocks interaction for seconds.

---

## 23. SEO

| Surface | Rule |
|---|---|
| main product route | indexability only after canonical intent approval. |
| guest invitation link | noindex, absent sitemap. |
| user wedding data | never used to create indexable pages automatically. |
| event-specific SEO pages | separate evidence-gated content decision. |
| near-duplicate maker routes | forbidden without distinct task/query evidence. |

---

## 24. Telemetry

Allowed event examples must use bounded properties.

Acceptance:

- [ ] no names;
- [ ] no phone numbers;
- [ ] no addresses;
- [ ] no custom wording;
- [ ] no guest list content;
- [ ] no URL containing personalized link ID if current analytics policy treats it as content;
- [ ] guest count bucketed;
- [ ] event count bucketed;
- [ ] template/event type values controlled;
- [ ] failure codes controlled;
- [ ] recipient funnel measured without identifying recipient.

---

## 25. Abuse/deletion

- [ ] host can revoke publication;
- [ ] host can revoke household link where supported;
- [ ] report path exists before public rollout;
- [ ] deleted/blocked content stops rendering;
- [ ] associated media cleanup behavior tested;
- [ ] retention documented;
- [ ] local project remains independent of public deletion;
- [ ] abuse tools do not reveal other guest links.

---

## 26. Full-epic acceptance statement

WU-SHAADI-001 is complete only when the same structured wedding can credibly produce:

- a normal single invitation;
- a multi-event invitation;
- Urdu/English/bilingual wording;
- personalized household outputs;
- event-scoped guest invitations;
- digital card PNG;
- print/PDF output;
- envelope/recipient label;
- private invitation link/QR;
- map/calendar action;
- optional culturally natural RSVP;

while preserving local-first privacy, existing Card Studio/share behavior, mobile usability and one-source-of-truth regeneration.
