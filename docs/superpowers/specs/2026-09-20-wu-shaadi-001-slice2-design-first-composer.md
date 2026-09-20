# WU-SHAADI-001 Slice 2 — Design-First Composer (card-first flow + live preview)

**Date:** 2026-09-20
**Epic:** WU-SHAADI-001 (Pakistan Wedding Invitation Platform)
**Parent spec:** specs/WU-SHAADI-001-pakistan-wedding-invitation-platform.md
**Architecture:** specs/WU-SHAADI-001-ARCHITECTURE-CONTRACT.md
**Prior slice (shipped):** docs/superpowers/specs/2026-09-19-wu-shaadi-001-slice-1-ui-design.md — released `/urdu-wedding-invitation-maker` as a 6-step data-first wizard (events → hosts → schedule/venue → language/wording → design → preview/export).

## Why this slice exists

Live user feedback on the Slice 1 wizard: users get lost filling in data fields for four steps before seeing anything resembling the finished invitation — the design/preview only appears at the very end. The reported experience is that the flow "isn't working": users can't tell what they're building until it's nearly done. This slice restructures the composer to be design-first — pick a card per event up front, then fill in that event's details while watching it render live — without touching the underlying `WeddingProject` schema, which stays exactly as Slice 1 left it.

## Scope

Net-new / changed work in this slice:

1. `js/wedding-project-core.js` — `evaluateComposerSteps` changes from a fixed 6-item step list to a **dynamic** step list derived from `project.events` (see §1). No schema field changes; `normalizeEvent`, `normalizeWeddingProject`, `selectedBackgroundId`, `wordingOverride` etc. are all unchanged.
2. `urdu-wedding-invitation-maker.html` / `css/urdu-wedding-invitation-maker.css` — updated step-rail and panel markup for the new step shape; new card-gallery and live-preview-pane styles (mostly reusing `.wedding-preview-card`/`.wedding-preview-text`/`.wedding-design-option`, all of which already exist).
3. `js/urdu-wedding-invitation-maker.js` — DOM wiring rewrite: new intro step, per-event design-pick + edit-with-live-preview steps, updated review/export step. Extracts the existing per-event render logic out of today's `renderPreviewStep` into a shared helper reused by both the live-preview pane and the final review step.
4. `js/wedding-project-storage.js` — **no changes.** Existing drafts saved under Slice 1's step shape are discarded on load if their step-tracking data doesn't match the new dynamic shape (see §4) — no migration code.
5. Extended/rewritten tests: `tests/wedding-project-core.test.js` (dynamic step evaluation), `tests/urdu-wedding-invitation-maker.spec.js` (rewritten for new flow).

Explicitly excluded (unchanged from the epic's sequencing): guest list/households, publication, RSVP, PDF export, per-guest links. No route/registry/sitemap changes — same URL, same page, no new files registered.

## 1. Step model: from fixed to dynamic

Today, `evaluateComposerSteps` walks a hardcoded `STEP_IDS` array (`events`, `hosts`, `schedule_venue`, `language_wording`, `design`, `preview_export`) and returns one status object per id.

New step sequence, computed fresh from `project.events` each time:

```
intro
design_<event.id>   (repeated once per event, in project.events order)
edit_<event.id>     (repeated once per event, immediately after its design step)
review_export
```

- `intro` replaces today's `hosts` + `language_wording` steps, **plus** it absorbs event *selection* (adding which ceremonies are happening — today's `events` step's job). It does not absorb per-event date/venue/wording — those move to that event's `edit_<id>` step.
- `design_<id>` replaces the per-event portion of today's `design` step. Its `missingFields` check is simply `['selectedBackgroundId']` if unset (never blocks progress hard — an unmatched event type gets the existing fallback card and is treated as "chosen").
- `edit_<id>` replaces the per-event portion of today's `schedule_venue` + `language_wording` steps (date, venue, wording tone, `wordingOverride`).
- `review_export` replaces today's `preview_export` step, unchanged in purpose: shows every event's finished card with a per-event "Download image" button.
- Adding a new event via the `intro` step appends a new `design_<id>`/`edit_<id>` pair to the sequence; removing an event (if supported) removes its pair. The step rail always reflects `project.events`'s current contents — there is no stale step list to fall out of sync, because it's derived, not stored.
- Blocking cascade logic (`complete`/`current`/`blocked`, first incomplete = `current`, everything after = `blocked`) is otherwise unchanged from Slice 1 — only the list being walked is now dynamic instead of a module-level constant.

`evaluateComposerSteps(project)` keeps its existing signature and return shape (array of `{id, status, missingFields}`); callers that only ever consumed that array (the step rail renderer, the Next-button gate from the prior bugfix session) need no change beyond iterating whatever length it now returns.

## 2. Wizard UI

- **Step rail**: same flex-wrap pill list as today (`.wedding-step-rail`), now populated from the dynamic sequence. Labels: "Details" (intro), "{Event label} design", "{Event label} details" per event (e.g. "Mehndi design", "Mehndi details"), "Review & export". With many events this rail gets long — it already wraps via existing CSS; no new overflow handling needed for a realistic guest-event count (Pakistani weddings rarely exceed 5-6 named events).
- **Intro step**: couple names (`personA`/`personB`), hosting families (reuses today's `renderFamiliesStep` add/edit-family UI verbatim), invitation language (reuses today's `renderWordingStep`'s language control), and "add an event" (reuses today's `renderEventsStep`'s event-type picker, date/venue fields removed — they move to that event's edit step). One panel, same `[data-wedding-step-panel]` styling as every other step today.
- **Design step (`design_<id>`)**: card gallery — `suggestBackgroundCategory(project, event)`'s matches rendered as clickable `.wedding-design-option` thumbnails (same markup/CSS as today's step 5, just shown earlier and scoped to one event at a time instead of all events on one screen). Clicking a thumbnail sets `event.selectedBackgroundId` and advances straight to that event's edit step. Empty suggestions (rukhsati/engagement/custom) show the existing single fallback card with the existing "no matching design yet" note — same behavior as today, just earlier in the flow.
- **Edit step (`edit_<id>`)**: two-column layout (stacks to one column under `~700px`, matching the responsive rule every other page in this repo uses). Left/top: date, venue, wording tone selector, "Edit wording" override control (`applyWordingOverride`, `isWordingStale` — unchanged from Slice 1). Right/bottom: **live preview pane** — the extracted per-event render helper (§3) re-runs on every relevant input's `oninput`/`onchange`, debounced 200ms so typing doesn't re-render on every keystroke.
- **Review/export step**: unchanged in purpose from today's step 6 — one rendered card per event (via the same extracted helper) with a "Download image" button (html2canvas), plus the existing staleness notice for any event whose `wordingOverride` no longer matches its source fields.

## 3. Shared preview-rendering helper (the reuse point)

Today's `renderPreviewStep()` (js/urdu-wedding-invitation-maker.js:264) already contains the complete per-event render logic: `wording.renderWording(templateId, project, event)` → `templateSelector.resolveEventBackground(project, event)` → build a `.wedding-preview-card` element with a `.wedding-preview-text` child positioned/colored/sized from the resolved variant's `safeArea`/`textColor`/`overlayColor`/`overlayOpacity` (or the neutral fallback class when no variant resolves).

This slice extracts that logic into a single function, `renderInvitationPreview(project, event, containerEl)`, that both the new edit step's live-preview pane and the review/export step call. This is not new rendering technology — it is the existing, already-tested DOM/CSS render path, called from two call sites instead of one, with the live-preview call site adding a debounce around its input-triggered re-renders. No Card Studio, no canvas library, no `wedding-invitation-render-adapter.js` involvement (consistent with Slice 1's Amendment 1, which already established this page never uses Card Studio).

## 4. Persistence & existing drafts

- `saveDraft`/`loadDraft` (`wedding-project-storage.js`) are unchanged — they persist `WeddingProject`, which has no step-tracking field of its own (steps are always recomputed from project data, in both Slice 1 and this slice).
- Because step *identity* changes shape (fixed ids → dynamic per-event ids), a project saved mid-wizard under Slice 1 will, on load under this slice, simply be re-evaluated against the new dynamic step list from scratch — whatever data the user already entered (events, hosts, families, language, any per-event fields already filled) is preserved as-is (the schema didn't change), and `evaluateComposerSteps` places them at whatever step their existing data now lands on under the new sequence. This is not data loss and needs no migration code: it's the same "derive steps from data, not from stored progress" principle Slice 1 already used, just applied across the flow-shape change. (Given the route's current traffic and the flow being reported as not working, an in-progress draft surviving is a bonus, not a requirement — but it falls out for free from the existing architecture.)

## 5. Error handling

- Event type with no Riwaayat coverage (rukhsati/engagement/custom): existing fallback card, unblocked — same as Slice 1, just encountered at the design step instead of at the end.
- No fields are newly "required" by this slice; the same `missingFields` rules from Slice 1 apply, just distributed across more, smaller steps.
- Debounced live preview: if `renderWording` throws (should not happen — Slice 1's `renderWording` always returns a template match or `FALLBACK_TEMPLATE_ID`), the preview pane keeps its last successful render rather than clearing, so a transient bad state never blanks the user's card.

## Testing plan

- `tests/wedding-project-core.test.js` (extended): `evaluateComposerSteps` fixtures for the dynamic sequence — zero events (just `intro` → `review_export`), one event, multiple events, adding/removing an event mid-flow, and the blocking cascade still working correctly across the new step shape.
- `tests/urdu-wedding-invitation-maker.spec.js` (rewritten): intro step happy path (names, family, language, add two events) → design-pick for event 1 → edit event 1 with live preview updating on input → design-pick for event 2 → edit event 2 → review/export shows both cards → download image works for each. Plus: step rail reflects the dynamic sequence; blocked-step gating still works; reload mid-flow restores correctly.
- `npm test` (all Node contract tests) stays green.
- `node scripts/check-product-governance.js` — unchanged counts (no new route/registry/sitemap/redirect entries in this slice).

## Rollback

No schema changes, no new files needing registration, no route changes. Reverting the commit(s) restores the Slice 1 fixed-step wizard exactly; any in-progress draft under this slice's dynamic steps re-evaluates cleanly under Slice 1's fixed steps for the same reason described in §4 (steps are always derived, never stored).

## Explicitly not decided here

- Whether users can reorder or remove events after adding them in the intro step — out of scope; today's Slice 1 events step has no remove affordance either, so this slice doesn't add one.
- Riwaayat's "next design round" (more SVG suites, non-floral, rukhsati/engagement coverage) — separate, later-sequenced initiative.
- Any richer live-preview interaction (drag-to-reposition text, manual font/color override) — this slice's preview is read-only/live-updating from form fields, same visual fidelity as today's step 6, just shown earlier and continuously.
