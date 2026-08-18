# WU-PLAT-002 — V2 Product Journey & Workspace Handoffs

**Status:** Active — P0 product architecture initiative  
**Priority:** P0  
**Date:** 2026-08-18  
**Area:** Information architecture / workspace continuity / shared product shell  
**Scope:** Sitewide interactive journeys; current + planned tools  
**Research:** `docs/WU-V2-PRODUCT-JOURNEY-UX-RESEARCH-2026-08-18.md`

---

## 1. Purpose

Turn WriteUrdu from a set of individually strong tools into one coherent Urdu task journey.

Users should discover the product through the outcome they want, complete the current job in the simplest appropriate workspace, and move to the next natural step without manually copying content, returning to global navigation, or understanding WriteUrdu's internal tool architecture.

The initiative governs:

- outcome-led global information architecture;
- cross-workspace text/project/template handoffs;
- contextual `Continue with…` progression;
- content preservation and recovery at transitions;
- how new browser-first tools join the product journey;
- mobile continuity;
- accessibility feedback/focus behavior;
- privacy-safe journey measurement;
- integration boundaries with local/cloud drafts and public share pages.

This feature does **not** merge every tool into one screen and does not replace role-owned direct workspaces.

---

## 2. Product problem

### Current state

WriteUrdu already provides:

- basic Roman Urdu → Urdu writing;
- direct Urdu keyboard input;
- Rich Editor document formatting/export;
- Card Studio and templates;
- social creation roles;
- Stylish Urdu Text and Name Art;
- QR Generator;
- Invoice Generator;
- Text Cleaner;
- OCR;
- planned Voice Typing and InPage ↔ Unicode;
- planned cloud drafts and public share artifacts.

The product also already has first-generation session-local handoffs and a `Your next step` panel on core writing surfaces.

### Gap

The governing model is still too tool-centric:

1. global navigation exposes implementation names before user outcomes;
2. handoff keys/consumers have grown independently;
3. the current next-step panel is mostly static and cannot simply absorb every new tool;
4. new Capture/Fix tools risk becoming dead-end utilities;
5. persistence/recovery rules differ by workspace and are not yet expressed as one continuity contract;
6. users can finish a task and still need to return to navigation to discover the next natural action.

### Required shift

```text
OLD
Choose a tool → use it → finish → navigate elsewhere → copy/paste → use another tool

V2
Choose an outcome → work → continue with the relevant capability → finish/share/resume
```

---

## 3. Non-negotiable product principles

1. **User job before tool name.** Navigation and next-step labels begin with the outcome the user recognizes.
2. **Focused workspace.** Each role/job keeps one appropriate top-level editor/canvas/workspace under `WU-RW-001`.
3. **Continuity, not a super-app screen.** Join workspaces through state and progression; do not place every feature in every workspace.
4. **Explicit transitions.** A handoff happens after a user action such as `Create a card with this text`; never automatically because focus/scroll changed.
5. **No manual copy/paste between WriteUrdu workspaces when compatible transfer is available.**
6. **Preserve before replace.** Incoming work must not silently destroy an existing target draft/project.
7. **Source remains safe.** Failed navigation/import must not delete the user's source work.
8. **Contextual next steps.** Show the next likely actions, not the complete product directory.
9. **Maximum three visible continuation actions.** Additional valid paths use `More options` or global navigation.
10. **Outcome presets before new products.** New user jobs may be a role/template/deep state when an existing workspace owns the capability.
11. **Search ownership remains stable.** Outcome-led IA does not rename established URLs merely for UX neatness.
12. **Local-first privacy remains the default.** Handoff content is browser-local and never analytics/URL material.
13. **New tools must join the journey by contract.** No interactive tool is complete without input/output/next-step behavior.
14. **Useful completion beats page circulation.** Page depth is a success only when the user completes another meaningful task.

---

## 4. V2 product model

### 4.1 User-visible primary navigation

The stable top-level product categories are:

- **Write**
- **Create**
- **Work**
- **Learn**

`My drafts` is a continuity/account utility, not a fifth information-architecture category.

The site/brand identity may continue to use `Write Urdu`; the navigation item `Write` should not be confused with a Home label.

### 4.2 Internal journey stages

For product architecture, every interactive capability belongs to one or more stages:

1. **Capture** — obtain Unicode Urdu text.
2. **Fix** — normalize/repair text.
3. **Write / Refine** — compose and format.
4. **Create** — build a visual/shareable artifact.
5. **Work** — complete a structured practical output.
6. **Publish / Use** — copy, export, QR, public share.
7. **Resume** — local history / My Drafts.
8. **Learn** — supporting guidance from any stage.

This stage vocabulary is an implementation/product-design model, not another menu to expose to users.

---

## 5. Outcome-led IA contract

### 5.1 Write

At minimum expose clear paths for:

- **Start writing in Urdu** → basic Roman Urdu writer;
- **Type directly in Urdu** → Urdu Keyboard;
- **Format an assignment or document** → Rich Editor;
- **Speak and turn it into Urdu text** → Voice Typing when shipped;
- **Extract Urdu text from an image** → OCR;
- **Fix spacing, RTL and Unicode issues** → Text Cleaner;
- **Convert legacy InPage text** → InPage ↔ Unicode when shipped.

The first three remain the dominant/familiar writing paths. Capture/fix utilities may live under a secondary subsection such as `More writing tools` to prevent menu overload.

### 5.2 Create

Expose outcomes such as:

- Make a poetry/quote/announcement image → Card Studio;
- Create WhatsApp Status;
- Create Instagram post;
- Create Facebook post → Card Studio role state;
- Make Urdu Name Art / DP;
- Create stylish copyable Urdu text;
- Start from a template;
- Turn text/link into a QR code.

Tool names may appear as secondary descriptions. Existing canonical routes remain owners.

### 5.3 Work

Start narrow:

- Create an Urdu / English invoice;
- Format an assignment/report/formal document;
- school announcement / notice / letter intent starters using Rich Editor/Card Studio/templates where appropriate.

Do not create an indexable generator page for every Work intent without independent product/search justification.

### 5.4 Learn

At minimum:

- Urdu Alphabet;
- Roman Urdu/transliteration;
- Urdu fonts;
- typing tutorial;
- documentation;
- FAQ.

Every relevant Learn page should expose a direct next task, not a generic Home-only exit.

### 5.5 My Drafts / account utility

When `WU-DRAFT-001` ships:

- place `My drafts` in the utility/account region of the shell;
- opening a draft routes to its owning editor;
- never place `My drafts` alongside Write/Create/Work/Learn as though it were a content category.

---

## 6. Workspace descriptor contract

Every current or future interactive workspace must have a descriptor in the journey registry or equivalent source of truth.

Minimum logical fields:

```text
id
route(s)
outcome category
journey stage(s)
primary user jobs
accepted payload kinds
produced payload kinds
natural next actions
embedded capabilities
persistence owner
import conflict policy
completion signals
```

Example:

```text
id: urdu-text-cleaner
category: Write
stages: Fix
accepts: plain-text
produces: plain-text
next: basic-writer, rich-editor, card-studio, qr
persistence: source/result local only
conflict-policy: never overwrite source input automatically
```

A new tool specification is incomplete until this information exists.

---

## 7. Shared `Continue with…` component

### 7.1 Purpose

Replace dead-end workspace completion and generic tool grids with a consistent, context-sensitive continuation surface.

### 7.2 Placement

- after the active task/result/immediate completion actions;
- before generic supporting content where practical;
- never over the editor/canvas;
- never inserted between a result and the result's essential Copy/Download/Export action;
- never sticky during active authoring/creation;
- on mobile, part of the natural single-page scroll flow.

### 7.3 Action limit

- maximum 3 visible actions;
- normally 1 primary + up to 2 secondary;
- `More options` may reveal other valid paths when needed;
- do not show every destination on every workspace.

### 7.4 Label contract

Prefer:

- `Format this as a document`
- `Create a card with this text`
- `Make a QR code from this text`
- `Fix this Urdu text`

Avoid relying only on:

- `Rich Editor`
- `Card Studio`
- `QR Generator`
- `Text Cleaner`

The destination tool name may appear in hint text.

### 7.5 State awareness

The component may use bounded local UI state such as:

- transferable text exists;
- result exists;
- source workspace;
- role/preset;
- issues detected by Cleaner/OCR;
- user is at a completion/export stage.

It must not inspect or transmit user content for ranking/analytics purposes.

---

## 8. Handoff classification contract

Every proposed connection must be classified as exactly one of:

### 8.1 Handoff

Continue the same work in another suitable owner workspace.

Examples:

- Basic → Rich;
- OCR → Rich;
- Cleaner → Basic;
- Template → Card Studio.

### 8.2 Transformation

Create a derivative artifact while retaining the source.

Examples:

- text → QR;
- text → Stylish variants;
- text → Card image;
- text → Name Art.

### 8.3 Embedded capability

Complete a subtask inside the current workspace rather than navigating.

Examples:

- Invoice payment QR;
- Card caption copy;
- Rich Editor PDF/Word export;
- social safe-area validation.

A feature review should reject unnecessary workspace hops when the behavior is really an embedded capability.

---

## 9. Core journey graph

### 9.1 Basic writer `/`

Visible priorities when text exists:

1. **Format this as a document** → Rich Editor.
2. **Create a card with this text** → Card Studio.
3. **Make a QR code** → QR Generator.

Conditional/More:

- Text Cleaner for imported/pasted/problem text;
- Stylish Text / Name Art where current usage evidence supports surfacing them;
- Templates as a creation discovery path.

### 9.2 Urdu Keyboard

- Keyboard → Rich Editor;
- Keyboard → Card Studio;
- Keyboard → QR;
- preserve existing writing and local draft behavior.

### 9.3 Rich Editor

Primary completion remains inside Rich Editor:

- copy/share;
- Word;
- PDF;
- PNG;
- print.

Natural transformations after usable text exists:

- Rich → Card using selected/current **plain text**;
- Rich → QR using selected/current plain text.

Do not make `Rich → Invoice` a generic next step. Rich text and invoice structured data are not equivalent payloads.

### 9.4 Text Cleaner

After a clean result:

1. **Continue writing** → Basic writer.
2. **Format as a document** → Rich Editor.
3. Contextual third action: Card or QR.

The source and clean result remain visible/recoverable until the user intentionally leaves.

### 9.5 Urdu OCR

Flow:

```text
Image → OCR → review result
               |
               +-- issues detected / user asks to fix --> Text Cleaner
               +-- simple edit -------------------------> Basic writer
               +-- document work -----------------------> Rich Editor
```

Do not force every OCR result through Cleaner.

### 9.6 Voice Typing

When shipped:

- captured text → Basic writer for message/simple use;
- captured text → Rich Editor for document use;
- Card/QR may be available after usable text exists;
- browser/vendor processing disclosure remains owned by the Voice tool.

### 9.7 InPage ↔ Unicode

When shipped:

- legacy/InPage → Unicode → Cleaner/Basic/Rich;
- Unicode → legacy output normally ends in copy/download;
- do not create a circular recommendation simply to keep the user moving.

### 9.8 Templates

- selected template opens its correct owner workspace;
- carry `templateId` as bounded metadata;
- when the user arrived from a writing workspace, current text may be carried separately when compatible;
- social-role templates may initialize role state without creating a new renderer or SEO route.

### 9.9 Card Studio / social roles

Immediate completion remains inside the creation workspace:

- download;
- image/share action;
- caption/text copy where relevant.

When `WU-SHARE-001` ships:

- `Publish & Share` is an explicit publish action;
- public share URL may later be used as a QR payload;
- internal handoff IDs/session keys must never become QR/public URLs.

### 9.10 Stylish Text

- Copy remains primary;
- Stylish → Name Art;
- Stylish → Card Studio;
- Templates may remain a discovery path.

### 9.11 Name Art

- download/share remain primary completion;
- optional `Create a matching card` can be a contextual transformation if evidence supports it;
- do not force users into generic Card Studio after they already completed Name Art.

### 9.12 QR Generator

QR is usually a transformation endpoint.

- accept compatible text/URL payload from editors/cleaner/share flows;
- show generated QR + existing copy/download/share controls;
- preserve payload validation/quiet-zone/contrast rules;
- if opened by handoff, destination acknowledges source without exposing content in URL.

### 9.13 Invoice Generator

- invoice remains a standalone structured Work workspace;
- payment QR belongs inside Invoice;
- export/print/share remain inside Invoice;
- no generic editor-text import unless a later explicitly structured mapping is specified;
- do not add Rich → Invoice merely because both contain text.

### 9.14 Learn pages

Each owner guide chooses 1–3 task exits based on content:

- Roman Urdu guide → start writing;
- Alphabet → Urdu Keyboard / writing;
- Font guide → Rich Editor / Card / Name Art;
- photo guide → Card Studio;
- share guide → relevant creation/writing surface.

---

## 10. Shared handoff runtime v2

### 10.1 Goal

Consolidate the current destination-specific handoff growth behind one producer/consumer API and workspace registry while preserving already-working routes during migration.

### 10.2 Recommended module boundary

Implementation should converge toward equivalents of:

- `js/workspace-journey-registry.js` — descriptors, destinations and recommendation IDs;
- `js/workspace-handoff.js` — store/validate/consume/dispatch API;
- `js/workspace-next-step.js` — shared contextual continuation rendering/binding;
- `css/workspace-journey.css` — shared presentation.

Exact filenames may differ if current architecture suggests a safer consolidation.

Existing `js/card-studio-entry.js` and `js/text-handoff.js` may remain as compatibility adapters during migration. Do not perform a risky flag-day rewrite.

### 10.3 Payload envelope

Logical contract:

```json
{
  "version": 2,
  "id": "ephemeral",
  "createdAt": 0,
  "expiresAt": 0,
  "source": {
    "workspace": "basic-writer",
    "route": "/",
    "intent": "message"
  },
  "target": {
    "workspace": "rich-editor",
    "route": "/urdu-editor"
  },
  "payload": {
    "kind": "plain-text",
    "text": "local user content"
  },
  "context": {
    "templateId": null,
    "role": null
  }
}
```

The envelope is conceptual; the runtime may omit unnecessary fields. Privacy/safety semantics are mandatory.

### 10.4 Initial payload kinds

- `plain-text`
- `rich-text` only for trusted destination support
- `template-seed`
- `visual-project-seed` where the shared visual engine already has a compatible project contract
- `structured-seed` only when two workspaces explicitly share a structured schema

Do not hand arbitrary HTML/DOM/project state to destinations that have not declared compatibility.

### 10.5 Storage and TTL

- user-content handoffs remain browser-session local;
- default max age remains 30 minutes unless a specific feature proves otherwise;
- one-time consume after successful validation/import;
- wrong/incompatible consumer must not destroy a valid payload;
- bounded maximum payload size is required;
- URL/query/hash remains content-free.

### 10.6 Source safety

Before navigation:

- let the source's normal local autosave/persistence run or snapshot if needed;
- storing a handoff does not replace the source draft;
- if handoff storage fails, do not silently claim that content will follow.

### 10.7 Destination conflict safety

Before applying incoming content:

1. validate version, target, age, kind and size;
2. inspect whether target contains meaningful existing work;
3. preserve existing work using the target's own history/project persistence when a safe mechanism exists;
4. apply incoming content;
5. acknowledge import and any preservation action;
6. consume payload only after successful acceptance.

If a target lacks a recoverable preservation model, require an explicit replace/open-copy choice rather than silent replacement.

### 10.8 Destination acknowledgement

Use a consistent status pattern such as:

- `Your Urdu text is ready to format.`
- `Your cleaned text is ready to edit.`
- `Your template is ready with your text.`

If previous target work was saved:

- `Your previous Rich Editor draft is in Recent drafts.`

Acknowledgement must be accessible via the shared notification/status system.

---

## 11. Drafts and resume integration

### 11.1 Local drafts

Do not replace editor-local draft adapters with the handoff bus.

The responsibilities remain separate:

- draft system = durable/recent state for an owning workspace;
- handoff system = short-lived transfer between compatible workspaces.

### 11.2 `WU-DRAFT-001`

When My Drafts ships:

- draft record points to an owning editor kind;
- Open uses the editor adapter / safe restore path;
- if target local work exists, preserve/offer recovery according to `WU-DRAFT-001`;
- cloud content is never placed in public URLs;
- visual projects/invoices remain out of cloud writing drafts unless separate formats are approved later.

### 11.3 Cross-device continuity

The P0 handoff initiative must work without authentication. Account/cloud drafts enhance Resume; they are not a dependency for local cross-tool continuity.

---

## 12. Public-share integration

`WU-SHARE-001` is a publish/distribution service, not an extension of `sessionStorage` handoffs.

Rules:

- author publishing remains explicit;
- `/s/:id` contains public artifact state under its own privacy/moderation contract;
- recipient `Use this text` / `Create your own` actions initialize the correct owner workspace through a server-fetched/public-artifact-to-local seed path;
- once the seed is local, normal workspace import/recovery rules apply;
- share identifiers/URLs may be QR payloads only when they are intentionally public/stable;
- never expose internal draft/handoff keys.

---

## 13. New-tool integration requirements

### 13.1 `WU-TOOLS-EXPANSION-002` Text Cleaner

P0 journey node.

Required:

- accept text from compatible writers/capture tools;
- preserve source and cleaned result;
- continue to Basic/Rich;
- offer Card/QR contextually;
- use unified handoff runtime when available.

### 13.2 `WU-TOOLS-EXPANSION-003` OCR

P0 experiment/product node.

Required if shipped:

- image remains governed by OCR privacy contract;
- extracted text becomes transferable plain text;
- review before continuation;
- Cleaner suggested only when useful;
- Basic/Rich direct next actions;
- no OCR output in analytics.

### 13.3 `WU-TOOLS-EXPANSION-004` Voice Typing

P1 implementation but **P0 architecture registration**.

Required:

- descriptor/accepted-produced payload contract defined before release;
- captured text can continue into Basic/Rich;
- unsupported browser path remains useful/honest;
- speech transcript never enters journey telemetry.

### 13.4 `WU-TOOLS-EXPANSION-005` InPage ↔ Unicode

P1 implementation but **P0 architecture registration**.

Required:

- Unicode output is a first-class handoff payload;
- convert → review → Clean/Write paths;
- legacy output supports copy/download without forced continuation.

### 13.5 `WU-TOOLS-EXPANSION-006` Urdu ↔ Hindi R&D

R&D only.

If approved later:

- conversion result is reviewable before handoff;
- converted text may continue to Basic/Rich;
- quality uncertainty is never hidden by an automatic transition.

---

## 14. Mobile contract

All P0 slices must preserve:

1. one top-level task scroll context;
2. active input/result before supporting content;
3. no nested WriteUrdu iframe/application shell;
4. no horizontal overflow at Pixel 5-class viewport;
5. immediate completion actions reachable without navigating to another tool;
6. `Continue with…` after task/result, not over keyboard/canvas;
7. max 3 visible continuation actions;
8. no fixed/sticky next-step panel that competes with typing/design controls;
9. compact imported-content acknowledgement;
10. browser Back/source recovery works as far as normal local persistence allows;
11. destination focus is predictable after explicit continuation;
12. mobile menu groups tools by Write/Create/Work/Learn rather than one long flat product list.

---

## 15. Accessibility contract

- semantic links for simple destination navigation;
- buttons for actions that first store/transform local state before navigation;
- logical focus order matching task sequence;
- no change of context on focus alone;
- import/success/failure messages available to assistive technology through the shared status/notification pattern;
- action names are unique and outcome-specific;
- keyboard-only users can execute and recover every P0 handoff;
- English shell and Urdu RTL text direction remain independently correct;
- `More options` is a real accessible disclosure/menu pattern, not hover-only content.

---

## 16. Privacy and security contract

### User content

Never place in:

- query string;
- fragment/hash;
- analytics event;
- console/server log intentionally;
- referrer-dependent URL;
- public share route unless the user explicitly publishes under `WU-SHARE-001`.

### Browser storage

- handoff: short-lived session storage;
- durable local drafts/projects: owning workspace storage contract;
- optional cloud drafts: `WU-DRAFT-001` explicit account contract;
- public artifact: `WU-SHARE-001` explicit publish contract.

### Telemetry

Journey telemetry may include only bounded metadata such as source, destination, action ID, payload kind, `hasContent`, success/failure and bounded failure reason.

---

## 17. SEO contract

- preserve current canonical destination URLs;
- preserve existing high-intent titles/H1s/tool identities on owner pages;
- outcome-led global nav may use different anchor wording without changing route ownership;
- do not create doorway routes for every task starter;
- role/template state may use existing direct owner routes and bounded parameters only when current SEO governance permits them;
- user content never appears in route parameters;
- useful static destination links remain crawlable where the destination is independently valuable;
- stateful handoff is enhancement, not the only way to reach a destination;
- sitemap/canonical/redirect tests remain green.

---

## 18. AdSense contract

- no ad inside the active workspace;
- no ad between result and its immediate Copy/Download/Export controls;
- no ad that visually resembles a Continue action;
- no journey recommendation chosen because it creates an extra monetizable pageview;
- existing post-workspace/learn-page monetization rules remain authoritative;
- journey experiments evaluate task completion and handoff success alongside revenue/CWV.

---

## 19. Journey telemetry

Extend the current `write-urdu:journey` concept rather than sending user content.

Recommended bounded events:

- `next_step_impression`
- `handoff_started`
- `handoff_imported`
- `handoff_failed`
- `handoff_recovery_used`
- `workspace_completed`
- `result_copied`
- `result_downloaded`

Minimum dimensions where applicable:

```text
sourceWorkspace
destinationWorkspace
actionId
payloadKind
hasContent
outcome
failureReason (enum)
```

No text, HTML, filename, OCR result, speech transcript, image bytes or user-supplied URL value.

---

## 20. P0 implementation slices

### Slice A — Journey governance + workspace registry

**Goal:** make continuity a product contract before adding more integrations.

- create registry/descriptors for all current interactive workspaces;
- register planned Voice/InPage/Hindi nodes without exposing unshipped UI;
- classify edges as Handoff / Transformation / Embedded;
- add governance tests preventing unregistered interactive tool launch;
- document migration from current handoff keys.

**Exit:** current + approved new tools have explicit input/output/next-action ownership.

### Slice B — Shared handoff runtime v2

**Goal:** one producer/consumer API.

- central store/validate/consume API;
- preserve 30-minute local session behavior;
- payload version/kind/target/size checks;
- source/destination bounded event hooks;
- compatibility adapters for current Rich/Card/Stylish/Name Art/text-handoff behavior;
- preserve all current accepted journeys.

**Exit:** no new P0 destination requires inventing a new storage key/API directly in page code.

### Slice C — Core Write/Fix continuity

- Basic → Rich/Card/QR;
- Keyboard → Rich/Card/QR;
- Cleaner → Basic/Rich + contextual Card/QR;
- Rich → Card/QR using plain/selected text;
- existing local draft preservation remains green;
- destination acknowledgement/recovery standardized.

**Exit:** core writing and fixing surfaces can continue without manual copy/paste.

### Slice D — Outcome-led navigation

- desktop/mobile top level becomes Write / Create / Work / Learn;
- outcome labels lead; tool names may appear as secondary descriptions;
- `My drafts` reserved for utility/account position;
- preserve destination URLs/canonicals;
- update footer/directory/documentation taxonomy where needed without duplicating route ownership;
- add task-finding browser/static contracts.

**Exit:** a visitor can choose a real-world task without knowing the internal product names.

### Slice E — Contextual `Continue with…`

- replace static/generic journey list with registry-driven recommendations;
- maximum three visible actions;
- result/content-aware eligibility;
- source-specific priorities;
- `More options` only when needed;
- no sticky authoring interruption;
- source-visible/crawlable fallback links where SEO/accessibility needs them.

**Exit:** every P0 interactive workspace has an intentional completion/continuation state or an explicit reason it is an endpoint.

### Slice F — Capture/new-tool continuity

- OCR → Cleaner/Basic/Rich;
- Text Cleaner uses v2 runtime;
- register Voice/InPage future behavior now;
- implement Voice/InPage edges when their feature specs ship without redesigning the journey layer;
- Hindi converter remains registered R&D only.

**Exit:** new tools are participants in the existing task journey rather than standalone utilities.

### Slice G — Templates / Create / Publish / Work boundaries

- template + optional current text → correct creation owner;
- Card/social completion actions remain embedded;
- QR accepts editor/cleaner/public-share-compatible payloads;
- invoice payment QR remains embedded;
- no generic Rich ↔ Invoice path;
- define `WU-SHARE-001` seed/import adapter boundary without implementing the share backend here.

**Exit:** creation/work flows follow the same rules without forcing artificial hops.

### Slice H — Measurement + usability closure

- privacy-safe journey completion telemetry wired to existing product telemetry where approved;
- desktop + Pixel 5 role-flow acceptance;
- task-finding/tree-test prototype for Write/Create/Work/Learn;
- usability checks for the five core end-to-end flows in the research document;
- update stale role-audit findings after implementation;
- compare before/after journey data once a baseline is available.

**Exit:** implementation is proven at the user-flow level, not only by link presence.

---

## 21. Acceptance scenarios

### A — simple message to formatted document

```text
Homepage → Roman Urdu → Urdu text → Format this as a document
→ Rich Editor contains text → acknowledgement → Word/PDF export
```

Pass conditions:

- no manual copy/paste;
- source remains locally recoverable;
- prior Rich work is preserved/recoverable;
- no user text in URL/event.

### B — simple writing to poetry image

```text
Homepage → Urdu text → Create a card with this text
→ Card Studio receives text → template/style → PNG
```

### C — OCR to usable document

```text
OCR image → extracted Urdu → review
→ (Cleaner only if needed) → Rich Editor → PDF/Word
```

No forced Cleaner hop when output is already acceptable.

### D — broken pasted text to reusable content

```text
Text Cleaner → issues/fixes → clean result
→ Continue writing / Format document / Create card
```

### E — template to finished social artifact

```text
Template intent → correct direct visual role
→ text preserved when provided → edit → export → caption copy
```

### F — editor to QR

```text
Basic/Rich/Keyboard → Make QR from this text
→ QR Generator validates imported text → PNG/SVG download
```

### G — invoice payment QR

```text
Invoice → payment details → payment QR inside invoice → export
```

Pass only if no unnecessary separate QR-workspace round trip is required.

### H — mobile recovery

```text
Pixel 5 → write text → handoff → destination has prior work
→ previous work preserved/acknowledged → imported work usable → Back/source still safe
```

### I — future Voice tool

```text
Voice → recognized text → Continue writing / Format document
```

The Journey layer should require no new ad hoc storage design when Voice ships.

### J — future My Drafts

```text
My Drafts → select Rich draft → owning Rich Editor → restore safely
```

My Drafts never behaves like a fifth generic tool category.

---

## 22. Test requirements

### Static / governance

- every registered interactive route has a descriptor;
- navigation contains expected outcome groups;
- established canonicals/routes unchanged;
- user-content handoff code has no query/hash serialization;
- journey event schemas contain no text/content field;
- max visible next-step contract represented in shared renderer;
- no iframe/nested-app regression on role-owned workspaces;
- new tool route cannot be marked implementation-complete without journey descriptor/contract.

### Unit

- handoff TTL expiry;
- wrong-target does not consume;
- invalid version/kind rejected;
- payload size bounded;
- successful consume is one-time;
- recommendation ordering by source/completion state;
- embedded capability is not emitted as a navigation recommendation;
- bounded telemetry mapping.

### Browser desktop + Pixel 5

At minimum automate:

- Basic → Rich;
- Basic → Card;
- Basic/Rich → QR;
- Cleaner → Rich;
- OCR → Rich or Cleaner → Rich when OCR is production-ready;
- Template → Card/Social role;
- destination acknowledgement;
- target prior-work preservation;
- Back/source safety where deterministic;
- mobile no-overflow + one-scroll-context checks;
- keyboard journey execution/status visibility.

### Existing regression suites

All existing editor, Card Studio, social, Stylish/Name Art, invoice, QR, SEO, AdSense, PWA and journey contracts remain green.

---

## 23. Release gates

Do not call `WU-PLAT-002` P0 complete until:

- [ ] Write/Create/Work/Learn IA is implemented on desktop and mobile.
- [ ] My Drafts placement is defined as utility/account, not primary category.
- [ ] All current interactive workspaces have descriptors.
- [ ] Approved new tools have descriptors before release.
- [ ] One shared handoff API owns new cross-workspace transfer behavior.
- [ ] Current handoffs continue to work during migration.
- [ ] Basic → Rich/Card/QR works without manual copy/paste.
- [ ] Cleaner → Basic/Rich works without manual copy/paste.
- [ ] Rich → Card/QR has explicit plain-text semantics.
- [ ] OCR has defined Review/Clean/Write continuation if shipped.
- [ ] Templates can seed the correct creation owner.
- [ ] Invoice payment QR remains embedded, not an artificial tool hop.
- [ ] `Continue with…` is contextual and capped at three visible actions.
- [ ] target prior work is preserved/recoverable on P0 handoffs.
- [ ] destination success/failure is visibly and accessibly acknowledged.
- [ ] no handoff user content appears in URLs or analytics.
- [ ] desktop + Pixel 5 role-flow tests are green.
- [ ] existing canonical/SEO/AdSense/product contracts remain green.
- [ ] the August 13 role audit is updated or superseded where findings became stale.
- [ ] at least one IA/task-finding validation pass and one continuity usability pass are recorded.

---

## 24. Non-goals

- one giant WriteUrdu editor containing all tools;
- universal project/database format for text, cards, invoices and QR;
- automatic cloud upload of local content;
- changing established canonical URLs merely to match the new nav;
- creating a route for every school/social/business intent;
- direct posting to WhatsApp/Instagram/Facebook;
- real-time cross-tool collaborative editing;
- automatic AI interpretation of what the user should do next;
- journey recommendations optimized only for AdSense pageviews;
- replacing `WU-RW-001` role-owned workspace architecture;
- reopening completed renderer/export contracts unless a journey regression requires a narrowly scoped fix.

---

## 25. Dependencies and relationships

### Builds on

- `WU-PLAT-001` — acquisition-first homepage / initial unified journey foundation;
- completed P0.5 contextual writing journeys;
- `WU-RW-001` — role-owned direct workspaces;
- existing local draft/editor adapter system;
- current Card Studio/Template/Social/QR/Invoice contracts.

### Governs integration of

- `WU-TOOLS-EXPANSION-001` through `006`;
- `WU-DRAFT-001` Resume entry when implemented;
- `WU-SHARE-001` publish/remix entry when implemented.

### Does not supersede

`WU-PLAT-001` remains the implemented acquisition/homepage foundation. `WU-PLAT-002` is the next product-architecture layer: outcome-led IA + continuity across the expanded product.

---

## 26. Definition of success

The initiative succeeds when WriteUrdu no longer feels like a menu of unrelated utilities.

A person can arrive with a real task, choose an understandable outcome, complete the job in an appropriate focused workspace, move their work into the next compatible capability without manual transfer, recover safely from transitions, and finish/export/share without needing to understand the implementation structure.

The product-design unit becomes:

> **user job → continuous work → finished outcome**

rather than:

> **tool page → tool page → tool page**.
