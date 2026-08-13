# WU-RW-001 — Role-owned direct workspaces

**Status:** Active  
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

The architectural target is **shared engine, role-owned workspace** — not duplicated renderers and not wrappers around Card Studio.

## 2. Role completion map

| Role / job | Direct role workspace | Required end-to-end completion | Target state |
| --- | --- | --- | --- |
| Student / assignment / report | Rich Editor | write/transliterate → format → preserve → Word/PDF/print | Direct editor, no nested product |
| Ordinary Urdu writer / WhatsApp message | Homepage writer | type/transliterate → copy/share | Direct writer, preserve current simple flow |
| Poetry / quote / Urdu on photo | Card Studio | write → choose size/style/background → preview → PNG/share | Direct image canvas |
| Urdu Name Art / DP | Name Art | enter/convert name → choose DP/transparent/story/wide purpose → style/refine → PNG | **Implemented — direct shared-engine canvas (PR #37)** |
| WhatsApp Status / greeting image | WhatsApp Status Maker | write → status-safe preview → background/style → PNG/JPEG → manual upload | **Implemented — direct 1080×1920 shared-engine canvas** |
| Instagram creator | Instagram Post Maker | write → square/portrait/story → safe-area preview → caption copy → PNG/JPEG | **Direct canvas; remove Card Studio iframe** |
| Facebook marketer | Facebook role entry into shared visual engine | write → 1200×630/default Facebook-safe composition → brand/style → PNG/JPEG | Direct canvas role mode; no need to understand generic Card Studio presets |

## 3. Definition of “direct”

A role route is direct only when all of the following are true:

1. The page contains the actual editable textarea/content controls and the actual rendered canvas/editor used for the final output.
2. No iframe or embedded WriteUrdu route is required to render or export the result.
3. The role page owns its state and can initialize sensible role defaults without round-tripping through another page.
4. The user can complete the role’s primary output from that route.
5. Export/share originates from the role workspace and validates role-specific requirements.
6. Mobile contains one scroll context for the task surface; there is no outer-page + inner-app scrolling model.
7. The role page can expose only relevant controls by default while sharing deeper engine capabilities internally.

## 4. Shared engine boundary

The role routes must not fork image rendering behavior.

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
- related role transitions only when they are optional, never required to finish.

## 5. Shared-engine implementation direction

The original plan proposed extracting dedicated renderer/controller modules from `js/card-studio.js` before removing the role iframes. Slices B and C proved that the critical boundary can be achieved safely without a renderer fork: the role page can mount the existing Card Studio application engine directly into its own top-level DOM and surround it with role-owned controls.

Current implementation shape:

- `js/card-studio-core.js` — shared pure state/layout primitives.
- `js/card-studio-interaction-core.js` — shared interaction primitives.
- `js/card-studio.js` — existing shared canvas/render/export/application engine.
- `js/card-studio-interaction.js` — shared direct-canvas interaction layer.
- `js/name-art.js` — Name Art role controller mounting the shared application directly.
- `js/social-maker-core.js` — platform defaults, safe areas and social export rules.
- `js/social-direct-workspace.js` — direct social-role adapter; currently used by WhatsApp Status and intended for Instagram/Facebook reuse.

Dedicated `card-canvas-renderer.js` / `card-workspace-controller.js` extraction is now a maintainability option rather than a prerequisite. The non-negotiable dependency rule remains: role controllers reuse the shared renderer/state/export behavior and must never create a second visual renderer.

## 6. Migration sequence

### Slice A — renderer safety net

1. Preserve one renderer and shared state/export contracts.
2. Keep `/urdu-card-studio` visually and functionally stable.
3. Add contracts proving role migrations do not create a second renderer.

### Slice B — direct Name Art — **Implemented**

1. Replaced `<iframe data-name-art-frame>` with a top-level Name Art canvas/artboard.
2. Kept the task-first flow: name → purpose → live result → style → export.
3. Mounted shared rendering/interaction behavior directly.
4. Preserved 24 templates, 12 packs, six presets, transparent 1600×900 export and handoff from Stylish Text.
5. Removed iframe-dependent Name Art app access/tests.
6. Merged in PR #37 at `f5c3f6c9d6369f269cca99d6883a3b2205a66a59`.

### Slice C — direct WhatsApp Status — **Implemented on current branch**

1. Replaced `urdu-card-studio.html?social=whatsapp` iframe with a direct role-owned workspace.
2. Resolves the WhatsApp social mode from `/urdu-whatsapp-status-maker` itself and locks the role to 1080×1920 Story/Status output.
3. Preserves WhatsApp safe-area behavior: top 230, right 100, bottom 290, left 100 pixels.
4. Keeps PNG/JPEG export, JPEG quality, text copy, direct canvas editing, local backgrounds and manual-upload honesty.
5. Keeps normal WhatsApp-message flow on `/`; message and Status jobs remain separate.
6. Desktop Chrome and Pixel 5 acceptance complete an actual JPEG download from the top-level canvas with no iframe/contentWindow access.

### Slice D — direct Instagram

1. Replace `urdu-card-studio.html?social=instagram` iframe with a direct canvas.
2. Expose square, portrait and story as role choices.
3. Keep safe areas, caption copy, PNG/JPEG and quality controls.
4. Reuse the direct social-role adapter introduced by Slice C where practical.

### Slice E — Facebook role mode

1. Add a Facebook-directed role entry using the same direct visual workspace engine.
2. Default to the existing 1200×630 wide-social capability.
3. Expose marketer-relevant controls without requiring generic Card Studio terminology.
4. Do not create a second renderer or a near-duplicate SEO doorway route without evidence; role entry can initially be task navigation/preset configuration on an existing owner route.

## 7. Mobile contract

For every role route on mobile:

1. role task/primary input appears first;
2. useful live output appears immediately after the minimum required input/choice;
3. refinement controls follow the live output unless required to produce it;
4. export/share remains reachable without entering another app shell;
5. no nested scroll containers for the primary task;
6. no iframe; no full second WriteUrdu page embedded below the role controls;
7. no horizontal overflow at Pixel 5 and 360–390px widths.

## 8. End-to-end acceptance by role

### Student

`basic writing → Continue in Rich Editor → format heading/body → export document`

### WhatsApp message

`Roman Urdu → Urdu script → Copy/Share → safe fallback`

### Name Art

`Ayesha → عائشہ → DP or Story → choose visual style → direct canvas changes → download PNG`

The test asserts there is no iframe and the exported image originates from the top-level role workspace.

### WhatsApp Status

`Urdu status text → verify 1080×1920 → safe-area guide → JPEG quality → download real JPEG`

The test asserts there is no iframe, verifies the exact safe area, and runs on desktop Chrome and Pixel 5.

### Instagram

`replace text → portrait or square → safe-area guide → copy caption → download PNG/JPEG`

### Facebook

`enter text → Facebook/wide-social role choice → verify 1200×630 → style/background → download`

All visual-role flows run on desktop Chrome and Pixel 5 as their migration slices complete.

## 9. SEO / AdSense / privacy guardrails

- Existing canonical URLs and route ownership stay unchanged during renderer migration.
- No new query-variant routes are created merely to expose a role mode.
- Search-facing copy remains owned by the existing acquisition specs.
- No ad is placed inside an active role workspace/canvas or primary export/action region.
- User text and local images remain browser-local except for the already documented transliteration network behavior.
- Do not place user text in URLs when passing optional context between role entry points.

## 10. Completion criteria

WU-RW-001 is complete when:

- [x] `/urdu-name-art-maker` has no iframe and completes Name Art end to end on its own top-level canvas.
- [x] `/urdu-whatsapp-status-maker` has no iframe and completes Status creation end to end on its own top-level canvas.
- [ ] `/urdu-instagram-post-maker` has no iframe and completes Instagram creation end to end on its own top-level canvas.
- [ ] Facebook role intent has a direct 1200×630 role workflow using the shared engine.
- [x] Card Studio still owns the broad poetry/quote/text-on-photo job and has no regression in the current migration gates.
- [x] Student and ordinary-message roles remain direct editor/writer workflows.
- [ ] No visual role acceptance test reaches into `frame.contentWindow` or `frameLocator` (Instagram still uses its legacy iframe until Slice D).
- [ ] Role-level desktop and Pixel 5 tests prove actual export completion for every migrated visual role.
- [x] Static, SEO, governance and AdSense contracts remain green for completed Slices B/C.

## 11. Non-goals

- separate renderers per role;
- direct posting to WhatsApp, Instagram or Facebook;
- accounts/cloud persistence as a prerequisite;
- multi-slide Instagram carousel composition;
- forcing every role into a literal image canvas when an editor is the correct task surface;
- redesigning SEO ownership while performing the workspace architecture refactor.
