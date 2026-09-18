# WU-SHAADI-001 — Implementation Checklist

**Parent:** WU-SHAADI-001-pakistan-wedding-invitation-platform.md  
**Architecture:** WU-SHAADI-001-ARCHITECTURE-CONTRACT.md  
**Acceptance:** WU-SHAADI-001-ACCEPTANCE-MATRIX.md  
**Evidence:** ../docs/WU-SHAADI-001-EVIDENCE-2026-09-18.md

This checklist is intentionally progressive. Do not jump directly to RSVP, animated invites or public guest links before the local structured invitation path is proven.

---

## Slice 0 — Evidence, ownership and domain foundation

### Repository reconnaissance

- [ ] Read specs/BACKLOG.md and specs/README.md.
- [ ] Read WU-CARD-GALLERY-001, WU-CARD-CONTENT-001, WU-CARD-RETENTION-001 and WU-SHARE-001.
- [ ] Inspect current Card Studio background registry, handoff, renderer and export paths.
- [ ] Inspect current Roman Urdu/transliteration engine and any reusable pure APIs.
- [ ] Inspect local draft/storage conventions.
- [ ] Inspect telemetry allowlist and Product Pulse event patterns.
- [ ] Inspect public share API/D1/R2 security patterns.
- [ ] Record exact implementation-owner files before proposing refactors.

### Domain schema

- [ ] Implement or prototype pure WeddingProject schema/version validation.
- [ ] Define bounded event enum.
- [ ] Define host/family enum.
- [ ] Define programme timing enum.
- [ ] Define invitation-language enum.
- [ ] Define guest-household scope enum.
- [ ] Define InvitationViewModel.
- [ ] Add schema migration fixtures.
- [ ] Add invalid/missing-field tests.

### Cultural fixtures

Create representative fixtures for at minimum:

- [ ] formal Nikah;
- [ ] bride-side Baraat;
- [ ] groom-side Walima;
- [ ] Mehndi;
- [ ] multi-event wedding;
- [ ] bilingual Urdu/English;
- [ ] Urdu-only;
- [ ] English-only;
- [ ] bride name shown;
- [ ] lineage-style wording;
- [ ] family-hosted wording;
- [ ] one gathering time;
- [ ] gathering + dinner;
- [ ] gathering + Nikah + dinner;
- [ ] custom event;
- [ ] no religious opening;
- [ ] verified Bismillah opening.

### Privacy decisions

- [ ] Confirm local-first project storage.
- [ ] Confirm phone numbers are not required.
- [ ] Confirm no guest data telemetry.
- [ ] Confirm public invitation publication is a later explicit action.
- [ ] Confirm share/RSVP data-retention policy must be written before Slice 4/5 release.

### Renderer proof

- [ ] Map one InvitationViewModel into current Card Studio/shared renderer without copying wedding rules into Card Studio.
- [ ] Validate Urdu line-height and mixed-script output.
- [ ] Validate at least one print-size export path.
- [ ] Benchmark mobile preview cost.

### Slice 0 exit gate

Do not start Slice 1 until:

- [ ] schema is stable enough for version 1;
- [ ] no duplicate ownership with Card Studio/share infrastructure remains;
- [ ] wording fixtures can render deterministically;
- [ ] route/indexability decision is recorded;
- [ ] performance/privacy constraints are testable.

---

## Slice 1 — Local structured invitation composer

### Route and shell

- [ ] Add /urdu-wedding-invitation-maker only after roadmap/release permission.
- [ ] Register route through the repository's canonical SEO/public-page mechanisms.
- [ ] Keep noindex during limited validation unless SEO ownership is explicitly approved.
- [ ] Use existing site shell/navigation conventions.
- [ ] No account requirement.

### Setup flow

- [ ] Step 1: event selection.
- [ ] Step 2: couple/family/host details.
- [ ] Step 3: event date/programme/venue.
- [ ] Step 4: language/wording mode.
- [ ] Step 5: design selection.
- [ ] Step 6: preview/export entry point.

### MVP events

At minimum:

- [ ] Nikah.
- [ ] Mehndi.
- [ ] Baraat.
- [ ] Walima.
- [ ] Custom event.

Mayun/Dholki/Rukhsati/Engagement should be included if the domain registry makes this low risk, but the first UI must not become cluttered merely to expose every enum.

### Wording

- [ ] Deterministic template selection.
- [ ] Urdu wording.
- [ ] English wording.
- [ ] bilingual wording.
- [ ] editable final wording.
- [ ] missing required data surfaced clearly.
- [ ] no AI dependency.
- [ ] verified religious source records only.

### Local persistence

- [ ] Save draft locally.
- [ ] Restore draft.
- [ ] Delete/reset project.
- [ ] Schema-version test.
- [ ] Corrupt data fail-closed behavior.
- [ ] No network write before explicit share/publish.

### Preview

- [ ] One live invitation preview.
- [ ] No canvas-per-form-field architecture.
- [ ] RTL and mixed-script correctness.
- [ ] Mobile portrait QA.
- [ ] Long host/family names.
- [ ] Long venue.
- [ ] Multiple programme timings.
- [ ] print-safe content warning where applicable.

### Slice 1 exit gate

- [ ] A user can create a complete single/multi-event local invitation without understanding design software.
- [ ] No guest list is required.
- [ ] Existing Card Studio/card gallery remains regression-free.
- [ ] Core tests green.
- [ ] Real mobile manual QA complete.

---

## Slice 2 — Design system and output

### Wedding design collection

- [ ] Define 8–12 high-quality launch templates, not dozens of mediocre variations.
- [ ] Cover traditional, elegant floral, Mughal-inspired, modern minimal and bilingual-safe layouts.
- [ ] Declare text capacity and safe areas.
- [ ] Declare compatible output aspect/print sizes.
- [ ] Validate Urdu Nastaliq readability.
- [ ] Validate no religious decorative motif misplacement.

### Reuse

- [ ] Reuse shared background/template registry where appropriate.
- [ ] Preserve existing IDs.
- [ ] Do not duplicate image assets merely for wedding naming.
- [ ] Create wedding-specific layout metadata only where generic card metadata is insufficient.

### Output

- [ ] PNG export.
- [ ] PDF/print path.
- [ ] print preview.
- [ ] image-share/native share where supported.
- [ ] WhatsApp-friendly share copy.
- [ ] output filenames sanitized.
- [ ] output generated entirely locally in this slice.

### Card Studio continuation

- [ ] Add optional Fine-tune in Card Studio.
- [ ] Use safe handoff, not wedding text in URL.
- [ ] Preserve WeddingProject after return.
- [ ] Treat non-round-trippable Card Studio changes as output override, not canonical wedding mutation.
- [ ] Regression-test existing visual-project-seed flows.

### Slice 2 exit gate

- [ ] A family can produce a receiver-quality digital card and a credible print/PDF output.
- [ ] Changing date/venue updates regenerated output.
- [ ] Card Studio remains optional.

---

## Slice 3 — Guest household personalization

### Single guest first

- [ ] Add one guest-household record.
- [ ] Individual/couple/family/custom scope.
- [ ] Select invited event IDs.
- [ ] Preview personalized addressee.
- [ ] Confirm no guest data in URL/telemetry.

### Name conversion

- [ ] Paste Latin/Roman name.
- [ ] Generate Urdu suggestion via existing engine.
- [ ] Edit suggestion.
- [ ] Confirm conversion.
- [ ] Preserve original source.
- [ ] Never infer honorific from name.

### Bulk paste

- [ ] Paste newline-separated names.
- [ ] Parse safely.
- [ ] Deduplicate only with explicit user review; do not silently merge households.
- [ ] Review conversions.
- [ ] Apply default scope/event selection then allow exceptions.
- [ ] Previous/next guest preview.

### Batch output

- [ ] Bounded render queue.
- [ ] Progress.
- [ ] Cancel.
- [ ] Retry failed items.
- [ ] Per-item status.
- [ ] Memory benchmark on mid-range mobile.
- [ ] ZIP only if practical.
- [ ] Graceful alternative if browser ZIP/bulk limits are exceeded.

### Envelope/recipient output

- [ ] Printable recipient label or envelope text.
- [ ] Urdu/English/mixed support.
- [ ] “with family” / و اہلِ خانہ option.
- [ ] Print-safe margins.

### CSV import

Only add if user evidence shows paste is insufficient.

- [ ] CSV mapping UX.
- [ ] No spreadsheet formula execution.
- [ ] Safe text-only parse.
- [ ] Explicit columns for name/language/scope/events.
- [ ] Validation report before import.

### Slice 3 exit gate

- [ ] One project can generate meaningfully different event-specific invitations for different households.
- [ ] Bulk path does not freeze common mobile devices.
- [ ] User reviews transliterated names before generation.

---

## Slice 4 — Private personalized invitation links

Do not implement until Slices 1–3 are stable.

### Publication UX

- [ ] Clear publish explanation.
- [ ] Explicit confirmation.
- [ ] Identify exactly which wedding/event fields become public to link holders.
- [ ] Make clear local guest list is not uploaded wholesale.
- [ ] Generate/manage link.
- [ ] Revoke/delete.

### Backend

- [ ] Dedicated additive migration.
- [ ] Minimal publication snapshot.
- [ ] Opaque publication ID.
- [ ] Opaque household link ID.
- [ ] Hashed management token.
- [ ] Status/revocation fields.
- [ ] R2 preview image only if needed.
- [ ] Cleanup behavior for partial D1/R2 failure.

### Access control by construction

- [ ] Household payload contains only assigned events.
- [ ] Server validates link status.
- [ ] No client-side “hide uninvited events” shortcut.
- [ ] No name/event switching via query parameter.
- [ ] No phone numbers stored.
- [ ] No local-only notes stored.

### Recipient page

- [ ] Beautiful invitation first.
- [ ] Personalized addressee.
- [ ] assigned event list.
- [ ] date/times.
- [ ] venue.
- [ ] restrained provenance.
- [ ] mobile fast.
- [ ] core information server-rendered.
- [ ] noindex,follow.
- [ ] no sitemap.
- [ ] no public directory.

### Social metadata

- [ ] Safe title.
- [ ] absolute og:url.
- [ ] image preview.
- [ ] WhatsApp-compatible metadata.
- [ ] privacy review for personalized names in preview.
- [ ] default to non-personalized metadata if uncertain.

### Slice 4 exit gate

- [ ] Link A cannot reveal Link B household information.
- [ ] revoked link fails safely.
- [ ] share service regressions absent.
- [ ] public data inventory documented.

---

## Slice 5 — Maps, calendar and RSVP

### Maps

- [ ] Open map/directions action.
- [ ] No location permission.
- [ ] user-controlled venue/map fields.
- [ ] mobile deep-link/fallback behavior.

### Calendar

- [ ] Per-event calendar action.
- [ ] explicit timezone handling.
- [ ] correct date/time.
- [ ] no guessed timezone from IP.
- [ ] calendar description contains only already-published invitation fields.

### RSVP

- [ ] Optional per wedding.
- [ ] Urdu/English/bilingual labels.
- [ ] attendance yes/no.
- [ ] culturally natural wording.
- [ ] optional party count.
- [ ] party count constrained by configured scope/cap.
- [ ] no free text in first release.
- [ ] idempotent/update behavior.
- [ ] rate limiting.
- [ ] host response view.

### Privacy/lifecycle

- [ ] RSVP deletion behavior.
- [ ] publication deletion cascades/retention defined.
- [ ] no RSVP identity in analytics.
- [ ] terms/privacy copy reviewed before public release.

### Slice 5 exit gate

- [ ] guest can understand and respond on mobile without account.
- [ ] host can see bounded useful attendance information.
- [ ] RSVP does not transform the product into a full event planner.

---

## Slice 6 — Hybrid print system

- [ ] high-resolution print render;
- [ ] A5 or repository-selected canonical print size;
- [ ] optional 6×8-style layout if evidence supports Pakistani printer compatibility;
- [ ] event insert design;
- [ ] envelope/label sheet;
- [ ] QR placement and print scan test;
- [ ] bleed/safe-area guidance;
- [ ] grayscale/print contrast review;
- [ ] PDF font/render QA;
- [ ] proof before print;
- [ ] printer handoff documentation.

Exit only when printed proof is physically readable and QR remains scannable.

---

## Slice 7 — Lifecycle and retention

Evidence-gated candidates:

- [ ] save-the-date;
- [ ] update notice when venue/date changes;
- [ ] post-event thank-you;
- [ ] anniversary reuse;
- [ ] clone design without guest list;
- [ ] share recipient → create own invitation continuation;
- [ ] measured return/use loop.

Do not ship these as a bundle. Choose from usage evidence.

---

## Slice 8 — Animated invitation

- [ ] validate demand from Product Pulse/search/user feedback;
- [ ] decide client/server rendering architecture;
- [ ] cost budget;
- [ ] Urdu font/video rendering benchmark;
- [ ] event-duration/audio rights policy;
- [ ] MP4/web share compatibility;
- [ ] reuse WeddingProject rather than re-enter data.

No animated output if it compromises the core static/link flow.

---

## Cross-slice release checks

Before every implementation PR:

- [ ] cite owning slice;
- [ ] list files touched;
- [ ] confirm protected existing Card Studio/share behavior;
- [ ] run focused tests;
- [ ] run npm test;
- [ ] run shell/locale/SEO checks where affected;
- [ ] run relevant Playwright;
- [ ] verify 360–430 px;
- [ ] verify Urdu RTL;
- [ ] confirm no private telemetry;
- [ ] document rollback.

Before a public/indexable product launch:

- [ ] SEO owner and canonical query intent recorded;
- [ ] sitemap/public registry updated through canonical mechanism;
- [ ] public copy reviewed;
- [ ] privacy page reflects publication/RSVP behavior;
- [ ] post-launch Product Pulse/GSC review scheduled.
