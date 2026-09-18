# WU-SHAADI-001 — Pakistan Wedding Invitation Platform

Use this skill whenever planning, implementing, reviewing or continuing WU-SHAADI-001.

This epic is intentionally domain-first. The objective is not to add a wedding-themed Card Studio screen. The objective is to build a durable structured Pakistani wedding invitation system while reusing existing Write Urdu card, Urdu-input and share infrastructure.

---

## Mission

Implement the smallest slice that advances this product thesis:

**One Shaadi. One setup. Every invitation.**

The wedding project is the source of truth. Cards, PDFs, links, QR codes and WhatsApp messages are outputs.

---

## Mandatory read order

Read in full before coding:

1. AGENTS.md, if present.
2. specs/BACKLOG.md
3. specs/README.md
4. specs/WU-SHAADI-001-pakistan-wedding-invitation-platform.md
5. specs/WU-SHAADI-001-ARCHITECTURE-CONTRACT.md
6. specs/WU-SHAADI-001-IMPLEMENTATION-CHECKLIST.md
7. specs/WU-SHAADI-001-ACCEPTANCE-MATRIX.md
8. docs/WU-SHAADI-001-EVIDENCE-2026-09-18.md
9. specs/WU-CARD-GALLERY-001-live-urdu-card-gallery.md
10. specs/WU-CARD-CONTENT-001-ready-made-urdu-cards-gallery.md
11. specs/WU-CARD-RETENTION-001-card-retention-sharing-engine.md
12. specs/WU-SHARE-001-public-share-pages-viral-publishing-loop.md

Then search the current repository for actual implementation owners before changing code.

Do not trust historical filenames when runtime/tests show ownership has moved.

---

## Current roadmap gate

WU-SHAADI-001 is a planned P1 programme unless the canonical backlog records a later founder-directed exception.

If implementation permission is not explicit:

- execute Slice 0 only;
- improve schemas, fixtures, tests, benchmarks and architectural proof;
- do not ship a public production route merely because the spec exists.

Never silently override the current activation/Card Studio completion governance.

---

## Non-negotiable product rules

### 1. Structured wedding state owns the truth

Do not make Card Studio/canvas JSON the canonical wedding.

A date or venue change must be able to regenerate dependent invitations.

### 2. Household, not placeholder

Do not reduce personalization to {{name}}.

A guest household must support:

- display name;
- preferred language/script;
- individual/couple/family/custom scope;
- invited event IDs.

### 3. Multi-event by architecture

Support Nikah, Mehndi, Baraat, Walima and custom events without assuming every wedding has every function.

Mayun, Dholki, Rukhsati and Engagement belong to the bounded event registry.

### 4. Local-first

Before explicit publication:

- project stays local;
- guest names stay local;
- phone numbers are not required;
- no wedding/guest content enters telemetry.

### 5. Publication is explicit

Download/export/share-image must not silently create a hosted invitation.

A private link requires a clear Publish action.

### 6. No guest names in URLs

Never transport personalization via query string/hash.

### 7. Religious source safety

Verified Quranic/Arabic religious text is curated and immutable in generation.

Never ask an LLM to paraphrase or “improve” a Quranic verse.

### 8. Reuse current engines

Reuse:

- Roman Urdu/Urdu typing capabilities;
- shared card/background registry;
- Card Studio renderer/handoff where appropriate;
- WU-SHARE-001 security and public-page patterns.

Do not fork these systems.

---

## Implementation order

Follow the epic slices in order unless the canonical backlog explicitly approves otherwise.

Preferred work sequence inside any slice:

1. reconnaissance;
2. pure domain/state logic;
3. fixtures/tests;
4. storage/adapter logic;
5. UI;
6. rendering/export;
7. telemetry;
8. mobile/a11y;
9. regression suite;
10. completion report.

Do not start with visual polish.

---

## Slice 0 expectations

Slice 0 should produce code/tests only where they reduce future risk.

Focus on:

- WeddingProject schema;
- schemaVersion/migration helpers;
- event/host/programme enums;
- wording registry shape;
- InvitationViewModel;
- sample fixtures;
- Card Studio/shared-render proof;
- local-storage decision;
- performance benchmark;
- source/privacy tests.

Do not overbuild a generic framework.

---

## Domain invariants

### Events

Known event values are controlled. Custom events use:

- type = custom;
- explicit custom label.

Never mutate the enum because a display label changes.

### Hosts

Host semantics are explicit.

Never infer bride/groom side from a person's name.

### Programme times

One event can have several labelled times.

Do not collapse:

- gathering;
- Nikah;
- dinner;
- Rukhsati;

into one arbitrary text box when structured fields are available.

### Guests

Empty invitedEventIds means incomplete.

It never means “all events”.

### Wording

Generated wording is deterministic and editable.

Never invent missing names, dates, times or venues.

---

## Roman/Latin → Urdu guest names

Use existing engine(s).

Required workflow:

source → suggestion → user review → confirmed Urdu

Never:

- auto-publish an unconfirmed conversion;
- infer honorific from name;
- overwrite the Latin source;
- send guest names to telemetry.

---

## Card Studio boundary

Card Studio may be used for:

- authoritative visual rendering;
- advanced design fine-tuning;
- existing export primitives.

Card Studio must not own:

- wedding event semantics;
- host rules;
- guest-event filtering;
- wording template selection;
- RSVP.

If a fine-tuned visual state cannot safely round-trip, store it as an output override for that invitation variant rather than replacing the WeddingProject.

---

## Share/publication boundary

Do not change WU-SHARE-001 tables merely because they already exist.

Reuse patterns, not inappropriate schema.

Wedding-specific structured publication may use dedicated additive tables.

Before any public-link implementation verify:

- cryptographic opaque IDs;
- hashed management token;
- noindex;
- absent from sitemap;
- minimal published payload;
- recipient can see only allowed events;
- revoke/delete path;
- rate limiting;
- report/abuse path;
- data retention policy.

---

## Bulk generation rules

Do not mount one full canvas per guest.

Use bounded queueing.

Required:

- progress;
- cancel;
- retry;
- per-item errors;
- resource cleanup;
- benchmark on mobile;
- no private telemetry.

If 100 guests is unsafe on a target device, expose safe batches rather than pretending the browser can handle unlimited generation.

---

## UI rules

The first-use flow should feel easier than messaging a printer/designer.

It should not expose implementation jargon such as:

- schema;
- renderer;
- artifact;
- publication record.

Use culturally natural task language.

Do not force guest-list mode on a user who only needs one invitation.

Do not force RSVP before invitation creation.

Do not place design selection before the system understands the wedding content unless user testing proves otherwise.

---

## Mobile rules

Assume primary usage at 360–430 CSS px.

Test:

- software keyboard;
- Urdu input;
- date/time fields;
- event add/remove;
- preview;
- guest paste/review;
- export/share.

Never use a desktop-only drag interaction as the only way to edit event order/details.

---

## Privacy and telemetry

Forbidden telemetry:

- couple names;
- parent/family names;
- guest names;
- phone numbers;
- venue/address text;
- custom wording;
- custom religious text;
- RSVP identity/free text.

Allowed only as bounded controlled dimensions:

- event type;
- event-count bucket;
- guest-count bucket;
- language enum;
- template ID;
- output type;
- scope enum;
- result/error code.

Use current telemetry allowlists.

---

## SEO rules

Do not create a route family such as:

- /nikah-card-maker
- /baraat-card-maker
- /walima-card-maker
- /mehndi-card-maker

merely to target keywords.

The initial owner is one real product route.

Guest invitation links are always noindex and never placed in sitemap/llms/public directories.

---

## Required test themes

Before declaring a slice complete, test at least the applicable cases from the acceptance matrix:

- Urdu-only;
- English-only;
- bilingual;
- one event;
- multiple events;
- multiple programme times;
- long names;
- long venue;
- missing fields;
- changed venue regeneration;
- individual/couple/family guest scope;
- event-specific guest filtering;
- corrupt local draft;
- RTL/LTR;
- mobile;
- existing Card Studio/card/share regressions.

---

## Repository verification

Use the current package.json to confirm exact scripts.

Expected broad checks may include:

- npm test
- npm run shell:check
- npm run locale:check
- npm run seo:graph:check
- npm run collections:check
- relevant focused Playwright

Run npm run test:all before merge when feasible.

Never weaken an unrelated regression test to get the slice green.

---

## Completion report

Return:

### Changed

Exact files and product behavior.

### Domain preserved

Confirm:

- WeddingProject remains source of truth;
- guest scope/event assignment remains structured;
- no invented missing values;
- verified religious text untouched.

### Existing product preserved

Confirm:

- Card Studio;
- Card Gallery;
- Ready-Made Cards;
- generic /s share flow;
- core Urdu typing.

### Privacy

Confirm no private wedding/guest text in telemetry or unexpected network payloads.

### Verification

Exact commands and results plus mobile/manual QA.

### Risk

Known edge cases, storage limits or cultural assumptions needing validation.

### Rollback

How to disable the slice without damaging existing card/typing products.

---

## Stop conditions

Stop and report instead of improvising if:

- implementation requires putting names in URLs;
- existing share schema would need unsafe arbitrary JSON;
- Card Studio must become wedding-state owner;
- a change would upload guest list without explicit consent;
- religious text provenance is uncertain;
- a public route/indexability decision contradicts backlog governance;
- bulk rendering causes unacceptable mobile memory/input lag;
- a required cultural rule is ambiguous and not covered by the documented configurable model.

The correct response to ambiguity is a bounded configurable model or a research gate, not an invented “Pakistani standard”.
