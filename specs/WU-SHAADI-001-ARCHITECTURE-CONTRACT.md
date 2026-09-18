# WU-SHAADI-001 — Architecture Contract

**Parent:** WU-SHAADI-001-pakistan-wedding-invitation-platform.md  
**Status:** Planned  
**Scope:** structured wedding state, wording, rendering, guest personalization, publication, RSVP, privacy and interoperability with existing Write Urdu card/share systems

---

## 1. Architecture principle

The wedding project is the source of truth.

Visual editors, downloaded cards, print PDFs, WhatsApp messages and published invitation pages are projections of structured wedding data.

Authoritative flow:

WeddingProject
→ normalized InvitationViewModel
→ output adapters
→ card image / PDF / print / WhatsApp / private link / QR

Do not make a canvas JSON blob, rendered image, public share row or guest-specific card the canonical project.

---

## 2. Boundary map

### WU-SHAADI-001 owns

- wedding-domain schema;
- event and programme semantics;
- host/family semantics;
- wording-template selection;
- guest-household records;
- event assignment per household;
- invitation-scope rules;
- generation orchestration;
- wedding-specific publication model;
- wedding-specific RSVP model;
- wedding-specific telemetry dimensions.

### Existing Card systems own

- shared visual background/template primitives where reusable;
- authoritative Card Studio advanced-edit/render behavior;
- generic card rendering helpers that are already shared;
- background IDs and safe-area metadata.

### WU-SHARE-001 owns reusable patterns

- cryptographically random public identifiers;
- management-token handling;
- public-artifact report/abuse conventions;
- R2 media-serving patterns;
- noindex public-share conventions;
- social metadata behavior;
- native share/copy-link UX patterns.

Do not couple wedding publication to the generic share-artifact schema if doing so would require arbitrary wedding-specific JSON fields or break share-artifact invariants.

---

## 3. Proposed module ownership

Exact filenames must be reconciled against current repository code during Slice 0.

Recommended logical modules:

- js/wedding-project-core.js
- js/wedding-wording-registry.js
- js/wedding-event-registry.js
- js/wedding-invitation-view-model.js
- js/wedding-project-storage.js
- js/wedding-guest-personalization.js
- js/wedding-invitation-render-adapter.js
- js/wedding-bulk-render.js
- js/wedding-publication-client.js
- js/wedding-rsvp-client.js

UI layer:

- js/urdu-wedding-invitation-maker.js
- css/urdu-wedding-invitation-maker.css

Server layer, only in publication slices:

- functions/api/wedding-invitations/*
- functions/wedding/[id].js or equivalent route convention
- dedicated additive D1 migration(s)
- optional R2 preview image objects

Names are illustrative. Current repository conventions win.

---

## 4. Canonical WeddingProject

A normalized project should conceptually resemble:

~~~text
WeddingProject
  schemaVersion
  id
  createdAt
  updatedAt
  locale
  invitationLanguage
  couple
  families[]
  religiousOpening
  events[]
  venues[]
  wordingPreferences
  design
  guests[]
  outputPreferences
~~~

All persisted records require a schema version.

Migration helpers must be pure and testable.

Never silently drop unknown fields from a newer schema without explicit handling.

---

## 5. Couple model

Suggested normalized semantics:

~~~text
couple:
  personA:
    displayName
    parentageText?
  personB:
    displayName
    parentageText?
  displayMode:
    both_names
    lineage
    family_led
    custom
  customDisplayText?
~~~

The model deliberately avoids encoding bride/groom assumptions into person storage.

Event/host wording may still support bride-side/groom-side conventions where the user explicitly chooses those roles.

Do not infer:

- gender;
- religion;
- caste;
- title;
- deceased status;
- family relationship

from names.

---

## 6. Family and host model

Family records:

~~~text
FamilyHost:
  id
  role:
    bride_side
    groom_side
    both
    grandparents
    custom
  displayName
  inviterNames[]
  optionalWelcomeNames[]
~~~

An event references host IDs or a host-mode enum.

The wording engine uses explicit host semantics rather than guessing from event name alone.

---

## 7. Event model

Each event should support:

~~~text
WeddingEvent:
  id
  type
  customTypeLabel?
  hostMode
  date
  timezone?
  programme[]
  venueId?
  wordingTemplateId?
  customWording?
  notes?
~~~

Controlled event type values initially:

- nikah
- mehndi
- mayun
- dholki
- baraat
- rukhsati
- walima
- engagement
- custom

Do not treat event type as decorative metadata. It affects wording defaults and information requirements.

---

## 8. Programme model

A programme is an ordered list of labelled moments.

~~~text
ProgrammeItem:
  id
  labelType:
    gathering
    nikah
    baraat_arrival
    dinner
    rukhsati
    reception
    custom
  customLabel?
  time
~~~

The model must permit:

- one timing;
- several timings;
- no timing during an incomplete draft.

Renderers must not invent missing times.

---

## 9. Venue model

~~~text
Venue:
  id
  name
  address?
  city?
  mapUrl?
  phoneNote?
~~~

Validation rules:

- map URL is optional;
- arbitrary HTML is forbidden;
- address remains plain text;
- publication includes only the venue fields required by the selected public invitation;
- changing a venue updates all events referencing it.

Later implementations may normalize maps/provider data, but the core model remains provider-neutral.

---

## 10. Religious opening model

Religious material uses references, not generated prose.

~~~text
ReligiousOpening:
  mode:
    none
    verified_library
    custom_user_text
  libraryId?
  customText?
~~~

Verified library records must include:

- stable ID;
- display text;
- language/script;
- source/reference metadata;
- review status.

An LLM must never mutate verified Arabic source text.

---

## 11. Wording registry

A wording template is pure structured data.

~~~text
WordingTemplate:
  id
  eventTypes[]
  languages[]
  hostModes[]
  formality
  requiredFields[]
  optionalFields[]
  renderer
~~~

The actual implementation may store templates/functions differently, but these invariants apply:

- deterministic given normalized input;
- no network dependency;
- no hidden personal-data enrichment;
- missing required fields produce a clear incomplete state;
- all generated wording remains editable;
- Urdu output uses correct direction and language metadata.

Do not duplicate wording strings across UI components.

---

## 12. GuestHousehold model

Canonical recipient unit:

~~~text
GuestHousehold:
  id
  sourceName
  displayNameUr?
  displayNameEn?
  preferredLanguage
  scope:
    individual
    couple
    family
    custom
  suffixStyle?
  customSuffix?
  invitedEventIds[]
  maxPartySize?
  phoneLocalOnly?
  notesLocalOnly?
~~~

Rules:

- guest IDs are local random identifiers, not names;
- invited event IDs must resolve;
- no event IDs means incomplete, not “all events”;
- max party size is optional and later-slice only;
- phone data is not required for generation;
- phone data must not be included in published payloads unless a separately approved feature needs it.

---

## 13. Name conversion contract

Roman/Latin input may produce Urdu suggestions using existing Write Urdu capabilities.

The conversion pipeline must represent uncertainty by allowing edit/confirmation rather than assuming correctness.

Required states:

- source;
- suggested Urdu;
- confirmed Urdu;
- manual override.

Bulk actions may apply confirmed conversion only.

Never auto-publish or auto-send a machine-transliterated name without user review.

---

## 14. InvitationViewModel

Renderers must consume a normalized view model rather than reading the full WeddingProject directly.

Example semantics:

~~~text
InvitationViewModel:
  projectId
  guestId?
  addressee
  opening
  hostLine
  coupleLine
  events[]
  familyWelcome[]
  design
  language
  provenance
~~~

Each event projection includes only fields visible in that invitation.

A guest-specific view model filters events before rendering.

This filtering must happen before public serialization, not merely through CSS hiding.

---

## 15. Design model

Wedding design references shared visual assets where possible.

~~~text
design:
  templateId
  backgroundId?
  typographyPreset?
  accentPreset?
  layoutPreset?
~~~

Hard rules:

- preserve shared background IDs;
- do not embed full image blobs into WeddingProject;
- local uploaded images require existing safe local-asset handling;
- public publication of a local image requires explicit inclusion;
- templates declare compatible content capacity and print behavior.

---

## 16. Card Studio adapter

A pure adapter may map InvitationViewModel to Card Studio-compatible project seed.

Responsibilities:

- text blocks;
- background/template reference;
- safe-area defaults;
- language/direction;
- output preset.

Non-responsibilities:

- guest filtering;
- event assignment;
- wording generation;
- wedding-domain validation.

Round-trip rule:

Fine-tuning one invitation in Card Studio must not silently replace the structured wedding project.

If Card Studio changes cannot safely round-trip into the wedding model, treat the edited result as an output override for that specific invitation variant.

---

## 17. Local storage

Slice 1 should prefer the repository's existing browser-local persistence conventions.

Requirements:

- schema version;
- bounded project count/size;
- clear delete/reset action;
- no server sync by default;
- robust parsing/fail-closed behavior;
- guest list stored only locally before publication.

If localStorage size is insufficient for future project richness, use IndexedDB behind a small storage adapter. Do not expose storage choice to domain code.

---

## 18. Bulk generation

Bulk generation must never synchronously instantiate N full renderers for N guests.

Preferred architecture:

guest IDs
→ generate view model lazily
→ render bounded batch
→ encode output
→ release resources
→ continue

Requirements:

- cancellation;
- progress;
- per-item failure reporting;
- deterministic file naming with safe sanitized identifiers;
- memory ceiling benchmark;
- no guest name in telemetry.

ZIP creation, if used, happens after bounded renders and must remain client-side unless a later server batch service is separately approved.

---

## 19. Publication architecture

Publication is explicit.

A likely server model:

~~~text
wedding_publications
  id
  project_snapshot_version
  public_wedding_json
  preview_image_key
  manage_token_hash
  status
  created_at
  updated_at
  deleted_at

wedding_guest_links
  id
  wedding_publication_id
  guest_public_payload_json
  allowed_event_ids_json
  status
  created_at
  revoked_at
~~~

Exact schema is deferred to Slice 4 and must be minimized.

Do not upload the full local project if the public invitation only needs a subset.

Do not upload unused guests.

Do not upload phone numbers merely because they exist locally.

---

## 20. Personalized link security

Requirements:

- cryptographic random IDs/tokens;
- no names in URL;
- no sequential IDs;
- non-enumerable;
- noindex;
- no sitemap;
- revocable;
- management secrets never in public HTML;
- recipient link must reveal only permitted event IDs;
- server validates publication status on every render.

A household-specific invitation must not be able to change guest ID in a query parameter to reveal another household.

---

## 21. Public rendering

Public invite pages should be server-rendered enough for WhatsApp/social preview metadata.

Required:

- generic safe page title or explicit couple-approved title;
- OG preview image;
- noindex;
- canonical to itself while active;
- no guest name in generic social metadata unless the product explicitly previews personalized artwork and privacy review approves it;
- responsive recipient experience without requiring JavaScript for core event information.

Do not expose structured project internals in page source beyond fields needed for the recipient experience.

---

## 22. RSVP architecture

RSVP belongs to a dedicated table/domain.

Potential minimal model:

~~~text
wedding_rsvps
  guest_link_id
  event_id? or publication scope
  attendance
  party_count?
  submitted_at
  updated_at
~~~

Avoid free-text message fields in the first release.

If per-event RSVP is confusing, use one response for the household invitation first and test demand before increasing complexity.

All RSVP endpoints require strict rate limits and validation.

---

## 23. Maps and calendar

Maps:

- open a user-supplied/validated map URL or derived provider-neutral directions URL;
- do not require location permission;
- do not silently geocode private addresses server-side.

Calendar:

- generate event-local calendar data from published event details;
- preserve timezone ambiguity rules explicitly;
- do not guess timezone from IP.

For Pakistan-only default projects, a UX default may be offered, but the stored value must remain explicit and editable.

---

## 24. Telemetry contract

Telemetry consumes only controlled dimensions.

Never send:

- wedding/couple/family names;
- guest names;
- phone numbers;
- addresses;
- custom wording;
- RSVP identity;
- local notes.

Allowed examples:

- language enum;
- event-count bucket;
- controlled event types;
- guest-count bucket;
- scope enum;
- output type;
- template ID;
- success/failure code;
- route/source.

Before adding events, reconcile with the current telemetry allowlist and Product Pulse conventions.

---

## 25. SEO architecture

Only the main product route is a candidate for indexing.

Generated guest invitation pages:

- noindex,follow;
- no sitemap;
- no public gallery;
- no llms listing;
- no browse endpoint.

Do not generate indexable pages from user-entered wedding data.

Static event wording/help content is a separate editorial/SEO decision.

---

## 26. Abuse and deletion

Publication must inherit or mirror WU-SHARE-001 protections.

Required later:

- report;
- host revoke/delete;
- blocked status;
- media cleanup;
- stale RSVP behavior after revocation;
- retention policy documented before launch.

Deleting a public publication must not delete the local project.

---

## 27. Migration discipline

Each schema change requires:

- additive migration;
- migration test;
- rollback/disable path;
- compatibility with existing share tables;
- no reuse of generic share columns for unrelated semantics merely to avoid a new table.

---

## 28. Architecture acceptance

The architecture is valid only if:

- one WeddingProject can generate multiple guest/event outputs;
- date/venue edits propagate without manual card rebuilding;
- guest-specific filtering happens before render/public serialization;
- local-only operation works through Slice 3;
- publication is explicit and minimal;
- Card Studio remains optional advanced rendering, not wedding state owner;
- no private names or addresses enter telemetry;
- no generic share-system regression is required to support weddings;
- bulk generation is bounded;
- public guest links are opaque, noindex and revocable.
