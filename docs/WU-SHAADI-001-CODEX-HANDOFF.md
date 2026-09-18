# WU-SHAADI-001 — Codex / Claude Handoff

Product: Write-Urdu.com  
Epic: WU-SHAADI-001  
Branch target: create a fresh implementation branch from current main  
Current governance: planned P1 programme unless specs/BACKLOG.md records a later explicit exception

## Mission

Build the Pakistan Wedding Invitation Platform progressively.

Do not start by drawing a wedding-card page.

The product model is:

one structured wedding project
→ multiple events
→ household-level guest personalization
→ culturally appropriate Urdu/English/bilingual wording
→ beautiful card / PDF / print / WhatsApp / private-link outputs

The long-term product promise is:

**One Shaadi. One setup. Every invitation.**

## Mandatory reading

Read these files in order before changing production code:

1. specs/BACKLOG.md
2. specs/README.md
3. skills/wu-shaadi-001/SKILL.md
4. specs/WU-SHAADI-001-pakistan-wedding-invitation-platform.md
5. specs/WU-SHAADI-001-ARCHITECTURE-CONTRACT.md
6. specs/WU-SHAADI-001-IMPLEMENTATION-CHECKLIST.md
7. specs/WU-SHAADI-001-ACCEPTANCE-MATRIX.md
8. docs/WU-SHAADI-001-EVIDENCE-2026-09-18.md
9. specs/WU-CARD-GALLERY-001-live-urdu-card-gallery.md
10. specs/WU-CARD-CONTENT-001-ready-made-urdu-cards-gallery.md
11. specs/WU-CARD-RETENTION-001-card-retention-sharing-engine.md
12. specs/WU-SHARE-001-public-share-pages-viral-publishing-loop.md

Then inspect actual current code/tests for:

- Card Studio rendering/export;
- card background/template registries;
- workspace handoff;
- Roman Urdu/transliteration;
- local storage/drafts;
- telemetry allowlists;
- share API/D1/R2/security.

Do not assume old filenames are current owners.

## First instruction

Check specs/BACKLOG.md first.

If WU-SHAADI-001 still has no explicit implementation/release exception, perform **Slice 0 only**.

Slice 0 is useful work. It should establish:

- WeddingProject v1 schema;
- schema version/migration approach;
- controlled event/host/programme/guest enums;
- InvitationViewModel;
- deterministic wording-template contract;
- representative Pakistani wedding fixtures;
- verified-religious-content boundary;
- local-first storage decision;
- renderer/handoff proof against current Card Studio/shared assets;
- mobile/performance benchmark;
- focused tests.

Do not add the public /urdu-wedding-invitation-maker route during Slice 0 unless backlog governance explicitly allows it.

## Architecture invariants

1. WeddingProject owns wedding truth.
2. GuestHousehold owns recipient scope.
3. invitedEventIds is explicit. Empty does not mean all.
4. Missing date/time/venue is an incomplete state, never an invitation for the software to invent a value.
5. Roman/Latin name → Urdu is suggestion → review → confirmation.
6. Card Studio is optional advanced visual editing, not wedding-domain storage.
7. Generic WU-SHARE-001 tables must not become a dumping ground for wedding-specific arbitrary JSON.
8. Pre-publication guest/wedding data stays local.
9. Public personalized links never expose names in URLs.
10. Verified religious source text is immutable to AI rewriting.

## Product fixtures you must cover

At minimum:

- Nikah only;
- Mehndi;
- bride-side Baraat;
- groom-side Walima;
- multi-event wedding;
- Urdu;
- English;
- bilingual;
- one timing;
- gathering + dinner;
- gathering + Nikah + dinner;
- long couple/family names;
- long venue;
- lineage wording;
- family-hosted wording;
- individual guest;
- couple;
- with-family guest;
- different event assignment per household.

## Do not build yet unless the owning slice is explicitly approved

- hosted personalized links;
- RSVP;
- WhatsApp automation;
- phone-number upload;
- CSV complexity before paste-first personalization is proven;
- video generation;
- vendor marketplace;
- event planning;
- dozens of SEO pages.

## Privacy verification

Before completion inspect network and telemetry.

There must be no:

- couple/family names;
- guest names;
- phone numbers;
- venue text;
- custom wording;
- private religious text;

in analytics payloads.

## Completion report

Return:

- exact files changed;
- what Slice 0 proved;
- schema/API summary;
- tests and benchmark results;
- existing Card Studio/share regressions checked;
- remaining unknowns;
- recommendation for whether Slice 1 is implementation-ready;
- explicit note that no public route was shipped unless backlog permission existed.

Do not continue into the next slice automatically.
