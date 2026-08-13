# WU-RW-001 — Role-owned direct workspaces

**Status:** Implemented  
**Priority:** P0/P1 product architecture  
**Date:** 2026-08-13  
**Routes:** `/`, `/urdu-editor`, `/urdu-card-studio`, `/urdu-name-art-maker`, `/urdu-whatsapp-status-maker`, `/urdu-instagram-post-maker`, plus role entry points that reuse these engines  
**Source:** `docs/WU-ROLE-JOURNEY-AUDIT-2026-08-13.md`

## 1. Product rule

A user should complete the job they came for on one top-level task surface.

- Writing/document roles own a top-level editor workspace.
- Visual creation roles own a top-level image canvas/workspace.
- Role-specific controls surround that workspace on the same page.
- Shared engines may be reused internally, but the user must not encounter a nested WriteUrdu product, iframe, second application shell, or a required jump to another tool to finish the job.
- Advanced controls may be progressively disclosed, but they remain controls of the same role workspace.

The implemented architecture is **shared engine, role-owned workspace** — not duplicated renderers and not wrappers around Card Studio.

## 2. Role completion map

| Role / job | Direct role workspace | Required end-to-end completion | Implemented state |
| --- | --- | --- | --- |
| Student / assignment / report | Rich Editor | write/transliterate → format → preserve → Word/PDF/print | Direct editor, no nested product |
| Ordinary Urdu writer / WhatsApp message | Homepage writer | type/transliterate → copy/share | Direct writer, preserves simple flow |
| Poetry / quote / Urdu on photo | Card Studio | write → choose size/style/background → preview → PNG/share | Direct image canvas and broad creation owner |
| Urdu Name Art / DP | Name Art | enter/convert name → choose DP/transparent/story/wide purpose → style/refine → PNG | **Direct shared-engine canvas — PR #37** |
| WhatsApp Status / greeting image | WhatsApp Status Maker | write → status-safe preview → background/style → PNG/JPEG → manual upload | **Direct 1080×1920 shared-engine canvas — PR #38** |
| Instagram creator | Instagram Post Maker | write → square/portrait/story → safe-area preview → caption copy → PNG/JPEG | **Direct Square/Portrait/Story shared-engine canvas — PR #39** |
| Facebook marketer | Card Studio Facebook role | write → 1200×630 composition → safe-area preview → style/background → PNG/JPEG | **Direct role at `/urdu-card-studio?role=facebook`; canonical remains `/urdu-card-studio`** |

## 3. Definition of “direct”

A role is direct only when all of the following are true:

1. The top-level task surface contains the actual editable controls and rendered canvas/editor used for final output.
2. No iframe or embedded WriteUrdu route is required to render or export the result.
3. The role owns sensible role defaults without round-tripping through another page.
4. The user can complete the primary output from that surface.
5. Export/share originates from the role workspace and validates role-specific requirements.
6. Mobile contains one scroll context for the task surface.
7. Relevant controls are shown by default while deeper shared-engine capability remains internal.

Facebook intentionally uses the existing Card Studio owner route with `?role=facebook`. A query role is still direct because it changes the role state/presentation of the same top-level Card Studio canvas; it does not embed another route or create another indexable search owner.

## 4. Shared engine boundary

The role surfaces do not fork image rendering behavior.

### Shared visual engine owns

- normalized card/project state;
- canvas sizing and presets;
- Urdu-safe font loading;
- text layout and RTL rendering;
- text-object transforms and interaction primitives;
- background image decoding/placement;
- template application primitives;
- safe-area evaluation primitives;
- history primitives;
- PNG/JPEG export primitives;
- local persistence primitives where appropriate.

### Role workspace owns

- role language and first action;
- role-specific default preset/template/state;
- visible control set and progressive disclosure;
- role-specific validation;
- platform-specific safe-area toggle/copy;
- role-specific export wording and filename;
- task-first mobile ordering;
- optional transitions to other roles.

## 5. Implemented module direction

The original plan proposed extracting dedicated renderer/controller modules from `js/card-studio.js` before iframe removal. Slices B–E proved the critical boundary can be achieved safely without a renderer fork: role surfaces mount or configure the existing Card Studio application engine directly and surround it with role-owned controls.

Current implementation shape:

- `js/card-studio-core.js` — shared pure state/layout primitives.
- `js/card-studio-interaction-core.js` — shared interaction primitives.
- `js/card-studio.js` — shared canvas/render/export/application engine.
- `js/card-studio-interaction.js` — shared direct-canvas interaction layer.
- `js/card-studio-ui.js` — Card Studio workflow presentation plus Facebook role presentation/state enforcement.
- `js/name-art.js` — Name Art role controller mounting the shared application directly.
- `js/social-maker-core.js` — WhatsApp, Instagram and Facebook defaults, safe areas and social export rules.
- `js/social-direct-workspace.js` — shared direct social-role adapter used by WhatsApp Status and Instagram.
- `js/social-direct-instagram.js` — Instagram-owned Square/Portrait/Story controls mapped into shared project state.

Dedicated `card-canvas-renderer.js` / `card-workspace-controller.js` extraction remains a maintainability option, not a prerequisite. Role controllers must continue to reuse shared renderer/state/export behavior and must never create a second visual renderer.

## 6. Migration slices

### Slice A — renderer safety net — **Implemented**

- One renderer/state/export contract preserved.
- `/urdu-card-studio` remains the broad visual creator.
- Static and browser contracts prevent role layers from adding a renderer.

### Slice B — direct Name Art — **Implemented**

- Replaced the Name Art iframe with a top-level canvas/artboard.
- Preserved 24 templates, 12 packs, six presets and transparent 1600×900 PNG.
- Preserved Stylish Text handoff.
- Desktop and Pixel 5 prove real PNG output.
- Merged in PR #37 at `f5c3f6c9d6369f269cca99d6883a3b2205a66a59`.

### Slice C — direct WhatsApp Status — **Implemented**

- Replaced `urdu-card-studio.html?social=whatsapp` with a direct 1080×1920 role workspace.
- Safe area remains top 230, right 100, bottom 290, left 100.
- Preserves PNG/JPEG, JPEG quality, text copy, local backgrounds and manual-upload honesty.
- Desktop and Pixel 5 prove real JPEG output.
- Merged in PR #38 at `be5f39e40f30715dbbb3ce2398bfc525c0f984be`.

### Slice D — direct Instagram — **Implemented**

- Replaced `urdu-card-studio.html?social=instagram` with a direct role-owned canvas.
- Square 1080×1080, Portrait 1080×1350 and Story 1080×1920 are Instagram-owned choices.
- Safe areas remain Square 90/90/90/90, Portrait 120/90/150/90 and Story 230/100/290/100.
- Preserves caption copy, PNG/JPEG, JPEG quality, templates, backgrounds and direct editing.
- Desktop and Pixel 5 prove real Portrait JPEG output.
- Merged in PR #39 at `e53456df776967174844bfc4743da7745106c6ba`.

### Slice E — Facebook role mode — **Implemented**

- Facebook is exposed from Card Studio as an optional role entry, not a new public SEO route.
- Role URL: `/urdu-card-studio?role=facebook`.
- Canonical/search owner remains `/urdu-card-studio`.
- Uses the existing `facebook` 1200×630 Card Studio preset.
- Facebook safe area is top 70, right 96, bottom 70, left 96.
- Generic output presets are locked while the Facebook role is active so the role cannot drift away from 1200×630.
- Shared social controls provide PNG/JPEG, JPEG quality, safe-area guide and manual-upload messaging.
- Desktop and Pixel 5 follow the normal guided flow: write → Export → JPEG quality → real `urdu-facebook-post-…jpg` download.
- No `/facebook-post-maker`, `/urdu-facebook-post-maker` or similar indexable doorway was created.

## 7. Mobile contract

Every migrated role preserves:

1. primary task/input before supporting content;
2. useful live output as early as the role permits;
3. refinement after the live result unless required first;
4. export/share without entering another app shell;
5. no nested primary-task scroll container;
6. no iframe or second WriteUrdu page;
7. no horizontal overflow in Pixel 5 acceptance.

Facebook remains within Card Studio’s guided mobile ordering, where the preview is deliberately shown before the control panel and Export is a normal guided step.

## 8. End-to-end acceptance

- **Name Art:** `Ayesha → عائشہ → DP/Story → style → direct canvas → PNG`.
- **WhatsApp Status:** `Urdu status text → 1080×1920 → safe area → JPEG quality → real JPEG`.
- **Instagram:** `Urdu post text → Portrait → 1080×1350 → portrait safe area → JPEG quality → real JPEG`.
- **Facebook:** `/urdu-card-studio?role=facebook → Urdu text → 1200×630 → Facebook safe area → Export → JPEG quality → real JPEG`.

Migrated visual-role acceptance runs on desktop Chrome and Pixel 5, keeps user text out of URLs, and does not reach through `frame.contentWindow` or `frameLocator`.

## 9. SEO / AdSense / privacy guardrails

- Existing canonical URLs and route ownership remain unchanged.
- Facebook role mode deliberately does **not** create an additional indexable route.
- Search-facing Card Studio acquisition ownership remains on `/urdu-card-studio`.
- No ad is placed inside an active role workspace/canvas or primary export/action region.
- User text and local images remain browser-local except for the documented transliteration network behavior.
- User text is never placed in role URLs.

## 10. Completion criteria

- [x] `/urdu-name-art-maker` has no iframe and completes Name Art on its own top-level canvas.
- [x] `/urdu-whatsapp-status-maker` has no iframe and completes Status creation on its own top-level canvas.
- [x] `/urdu-instagram-post-maker` has no iframe and completes Instagram creation on its own top-level canvas.
- [x] Facebook has a direct 1200×630 role workflow using the shared Card Studio engine without a competing SEO route.
- [x] Card Studio remains the broad poetry/quote/text-on-photo owner with no renderer regression.
- [x] Student and ordinary-message roles remain direct editor/writer workflows.
- [x] Migrated visual-role acceptance does not use `frame.contentWindow` or `frameLocator`.
- [x] Desktop and Pixel 5 tests prove actual export completion for Name Art, WhatsApp Status, Instagram and Facebook.
- [x] Static, SEO, governance and AdSense contracts remain green.

**WU-RW-001 is complete.**

## 11. Non-goals

- separate renderers per role;
- direct posting to WhatsApp, Instagram or Facebook;
- accounts/cloud persistence as a prerequisite;
- multi-slide Instagram carousel composition;
- forcing every role into a literal image canvas when an editor is the correct task surface;
- creating SEO doorway routes merely to expose role presets.
