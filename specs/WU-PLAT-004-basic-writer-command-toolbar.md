# WU-PLAT-004 — Basic Writer Adaptive Command Surface

**Priority:** P0  
**Status:** Active — revised by 2026-08-30 product evidence  
**Route owner:** `/`  
**Area:** Core authoring UX / completion actions  
**Parent initiative:** `WU-PLAT-003` Core Workspace Convergence  
**Acceptance owner:** `WU-PLAT-002H` Core Activation & Feature Discovery Acceptance  
**Journey dependency:** `WU-PLAT-002` V2 Product Journey & Workspace Handoffs  
**Share dependency:** `WU-SHARE-001` Public Share Pages & Viral Publishing Loop  
**Original design decision:** 2026-08-18  
**Evidence-driven revision:** 2026-08-30

---

## 1. Revision notice

The 2026-08-18 version proposed a persistent desktop command row:

`Share -> Copy -> PDF -> Word -> PNG -> Preview -> Print -> Input mode -> More -> Clear`

and required content-dependent commands to remain visible while the editor was empty.

**That visibility/priority model is superseded by `WU-PLAT-002H`.**

The new Product Pulse evidence shows:

- 1,000 measured zero-character writing sessions that require first-value investigation;
- strong concentration in Basic/Rich/Voice/Stylish rather than broad tool usage;
- PDF + Word account for 82.9% of exports, but those are post-value outputs;
- Rich Editor has 85.1% engagement and is the preferred substantial-writing escalation;
- Voice adoption is 20.5% in Rich Editor but about 0.2% in Basic Editor, making input discovery a stronger pre-value need than an export command wall.

Therefore the command surface remains source-owned and coherent, but it becomes **adaptive/progressive** rather than permanently exposing every content command.

Git history preserves the old contract for reference. Do not implement its conflicting persistent-empty-state requirements.

---

## 2. Purpose

Make the Basic Writer immediately understandable before first value and increasingly capable as the user creates more valuable writing.

The command surface must answer the right question for the current state:

- before writing: **How do I enter Urdu?**
- after first value: **How do I copy/use it?**
- for substantial writing: **How do I format/export/keep it?**
- after completion: **How do I share/publish/continue?**

The goal is not to hide functionality. It is to stop forcing users to process every possible output before they have produced anything.

---

## 3. Non-negotiable architecture

The final Basic Writer command/discovery UI must be **source-owned** rather than assembled by stacking another runtime toolbar over legacy `.home-actions` / `editor-chrome` generations.

Implementation must:

1. preserve existing transliteration and input-mode engines;
2. preserve existing export functions and stable IDs where practical;
3. preserve local draft/history behavior;
4. preserve WU-PLAT-002 handoffs/continuation ownership;
5. preserve share/publish privacy contracts;
6. remove or retire superseded visible legacy action UI instead of duplicating it;
7. keep the writer canvas visually dominant;
8. use state-driven presentation, not time-based popups.

This is convergence, not an editor-engine rewrite.

---

## 4. Engines to preserve

Do not reimplement these as part of this slice:

- Google transliteration initialization/suggestions;
- `js/input-mode.js` mode state and `Ctrl+G` switching;
- batch transliteration engine;
- `DownloadAsPdf()`;
- `DownloadAsWord()`;
- `DownloadAsImage()`;
- `PreviewCurrentText()`;
- `PrintText()`;
- `saveTextAsFile()`;
- `clearText()` except a minimal state adapter if required;
- existing Copy runtime;
- `WriteUrduTools.share()` / current share adapters;
- browser-local draft/history behavior in `js/editor-tools.js`;
- WU-PLAT-002 workspace-handoff runtime.

The command controller coordinates **presentation and eligibility**. Existing engines remain owners of the actual actions.

---

## 5. Governed UI states

`WU-PLAT-002H-UX-STATE-MATRIX.md` owns the detailed state matrix. This spec implements that model on `/`.

### E0 — Empty

Primary visible UI:

- `English letters -> Urdu` input choice;
- `Type Urdu directly` input choice;
- `Speak Urdu` input choice when supported;
- writing canvas;
- compact mode/status/help;
- a quiet stable `More`/settings path if needed.

Content-dependent actions such as Share, Copy, PDF, Word, PNG, Preview and Print must **not** appear as a large disabled command wall.

No account, save or community-publish promotion in E0.

### E1 — First useful text

Once meaningful content exists:

- Copy becomes directly visible/obvious;
- a compact contextual `Continue` entry becomes eligible;
- input mode remains available;
- More remains the stable route to less-common outputs/settings;
- do not interrupt the first success with signup/publish marketing.

### E2 — Short writing

Suggested measurement bucket: about 20–499 chars.

- Copy remains primary;
- contextual transformation may surface when evidence supports it;
- lower-frequency output commands remain reachable without dominating the canvas;
- do not show a generic all-tools grid.

### E3 — Substantial writing

Suggested measurement bucket: about 500–999 chars.

Promote:

- `Continue with formatting` -> Rich Editor;
- PDF;
- Word;
- Keep/save request when eligible under `WU-PLAT-002H` / `WU-GROWTH-002` arbitration.

### E4 — Long-form writing

Suggested measurement bucket: 1,000+ chars.

Promote document-oriented completion:

- Rich Editor;
- PDF/Word;
- save/keep state;
- community publishing only when eligible and not competing with a higher-priority growth request.

### E5 — Post-completion

After a meaningful Copy/export/save outcome:

- Share/publish may become relevant according to arbitration;
- do not stack multiple growth promos;
- preserve a useful continuation path.

Thresholds are measurement buckets, not immutable UX truth. Future evidence can adjust exact counts without changing the purpose of each state.

---

## 6. Input-choice contract

The Basic Writer pre-value discovery layer presents three understandable ways to enter Urdu:

1. **English letters -> Urdu** — default proven acquisition/input path;
2. **Type Urdu directly** — existing direct-input path;
3. **Speak Urdu** — existing unified Voice platform when supported.

### Language

Lead with user language, not implementation language.

Preferred labels/examples:

- `English letters -> Urdu`
- `Type Urdu directly`
- `Speak Urdu`
- `mera khayal hai -> میرا خیال ہے`

Do not require the visitor to understand `transliteration` or `Roman Urdu` before starting. Those terms may remain in help/reference contexts.

### Voice

Voice discovery must reuse the existing Voice platform. Do not create a second recognition implementation in Basic Writer.

If voice is unsupported/unavailable:

- English-letter and direct input remain fully usable;
- Voice has a clear bounded unavailable state;
- no blocking modal is shown merely because Voice is unavailable.

---

## 7. Command hierarchy after value

### Direct primary

- **Copy** — E1+

### Direct/promoted for substantial writing

- **PDF** — E3+
- **Word** — E3+
- **Continue with formatting** — E3/E4, owned by WU-PLAT-002 handoff runtime

### Progressive/secondary

- PNG;
- Preview;
- Print;
- Text file;
- filename configuration;
- productivity/settings/help.

These remain reachable through `More`, an output disclosure, or a contextually appropriate stable region.

### Share

Share remains an important completion/distribution capability but is no longer required to be the strongest **pre-value** toolbar action.

It should become visible/promoted when:

- content exists and the user explicitly asks for sharing; or
- a meaningful completion state makes Share the selected growth request under `WU-PLAT-002H` arbitration.

Public publishing must never happen implicitly.

---

## 8. `More` / output disclosure

`More` is not a product directory.

It may contain:

**Outputs**
- PNG;
- Preview;
- Print;
- Text file;
- filename configuration;
- PDF/Word on narrow layouts if state/space requires it while preserving strong discovery for substantial writing.

**Editor options**
- existing page/background/productivity settings owned by their current engines;
- current writing tools only where required to preserve capability.

**Help**
- concise usage/input guidance.

Do not place Rich Editor, Card Studio, QR, Invoice, Templates and every other product destination into the command menu. Cross-workspace movement remains owned by contextual continuation/global navigation.

---

## 9. Contextual continuation boundary

The command surface owns actions on the **current writing**.

`WU-PLAT-002` owns movement to another workspace.

For substantial writing, Basic -> Rich is the preferred escalation because current Product Pulse shows strong Rich engagement.

Requirements:

- transfer text through the approved first-party handoff mechanism;
- no writing text in URL query/hash;
- do not silently overwrite an existing Rich draft;
- source remains recoverable if destination import fails;
- instrument recommendation shown -> selected -> destination ready -> meaningful start;
- do not call a click alone `handoff success`.

---

## 10. Growth CTA boundary

This command spec does not independently decide when to advertise account, share or community publishing.

`WU-PLAT-002H` + `WU-GROWTH-002` own arbitration.

Rule:

> one growth request at a time.

Normal task commands (Copy/PDF/Word/etc.) are not growth requests and may coexist.

Examples:

- signed-out substantial unsaved writing -> Keep may win;
- post-export -> Share may win;
- signed-in saved long-form work -> Community Publish may be eligible;
- empty/first-value state -> no growth request.

---

## 11. Layout stability

Progressive presentation must not cause the writing canvas/caret to jump when thresholds are crossed.

Prefer:

- stable reserved command/continuation regions;
- post-editor continuation areas;
- state/class changes with predictable height;
- explicit user disclosures.

Avoid:

- inserting a large banner above a focused editor after 500 characters;
- sticky command overlays covering text;
- horizontal toolbar scrolling on normal mobile widths;
- hiding the editor under newly appearing account/publish promos.

---

## 12. Responsive contract

### Mobile

The first task sequence is:

1. intent-matched heading/example;
2. input choices;
3. writer.

After value:

- Copy directly visible;
- Continue/More reachable;
- PDF/Word promoted when substantial writing makes them relevant;
- no horizontal row of all exports.

### Desktop

More room does **not** mean every available command must be visible in E0.

Desktop may expose additional direct output commands in E3/E4, but state relevance still governs priority.

### Accessibility

- practical touch targets around 44px where possible;
- visible text labels for primary actions;
- no icon-only Voice control;
- accurate accessible names;
- visible focus;
- `aria-expanded` / `aria-controls` for disclosures;
- correct `aria-pressed` for input mode;
- Escape/focus return behavior for menus.

---

## 13. Source-owned migration

Expected implementation surface may include:

- `index.html` — final semantic input/command structure;
- shared/current workspace CSS — adaptive visual states;
- Basic-specific controller for eligibility/presentation;
- `js/core-workspace-convergence.js` — retire Basic-only action relocation/injection no longer needed;
- `js/input-mode.js` — ideally no behavioral rewrite;
- service-worker cache update if assets change;
- focused contract/browser tests.

Do not leave the full legacy action surface in source and add another MutationObserver-generated toolbar on top.

Each command has one owner:

- Copy -> existing Copy runtime;
- export -> existing export functions;
- input -> input-mode/transliteration/Voice platforms;
- share -> approved share adapter/service;
- save -> existing account/documents owner;
- cross-workspace -> WU-PLAT-002.

---

## 14. SEO/ad/privacy guardrails

Do not change as part of this slice:

- homepage canonical ownership;
- established ranking URL;
- title/meta unless separately owned by `WU-SEO-CTR-001` and measured;
- transliteration provider/initialization;
- local draft semantics;
- user text privacy.

No ad may appear:

- inside the input selector;
- between selector and writer;
- inside writer/result;
- inside command/output menu;
- deceptively adjacent to Copy/export/share/publish controls.

Preserve the approved post-workspace monetization path governed by `WU-GROWTH-001`.

No writing/transcript/filename content enters product telemetry or URLs.

---

## 15. Measurement dependency

Implementation is incomplete without `WU-PLAT-002H-METRICS-CONTRACT.md` support.

At minimum measure:

- writer eligible/visible;
- focus;
- first input;
- first successful Urdu;
- depth buckets;
- first outcome;
- contextual recommendation shown/clicked;
- destination ready/meaningful start.

Do not label all empty sessions abandonment.

---

## 16. Acceptance scenarios

Use `WU-PLAT-002H-ACCEPTANCE-SCENARIOS.md` as the browser/manual acceptance source.

Minimum Basic Writer acceptance:

- [ ] E0 is dominated by input choices + writer, not disabled output commands.
- [ ] English-letter input remains the default proven path.
- [ ] Direct Urdu remains available.
- [ ] Voice is discoverable when supported without blocking unsupported devices.
- [ ] Copy becomes obvious after first useful content.
- [ ] E3/E4 expose strong Rich/PDF/Word progression.
- [ ] PNG/Preview/Print/Text remain reachable.
- [ ] no duplicate old action strip remains visible.
- [ ] no generic tool directory is inserted into the command surface.
- [ ] thresholds do not cause disruptive caret/editor movement.
- [ ] source text survives Basic -> Rich handoff safely.
- [ ] no content enters telemetry/URL.
- [ ] existing export/input/draft/share regression behavior remains green.
- [ ] mobile has no horizontal command overflow.
- [ ] ad boundary remains intact.

---

## 17. Delivery sequence

### Slice A — instrumentation/readiness

Complete first-value + continuation measurement needed by `WU-PLAT-002H`.

### Slice B — E0/E1 source-owned convergence

- simplify pre-value action presentation;
- present coherent input choices;
- keep writer dominant;
- reveal Copy/Continue after value;
- retire duplicate legacy Basic controls.

### Slice C — E3/E4 document progression

- Basic -> Rich contextual continuation;
- PDF/Word substantial-writing promotion;
- responsive output disclosure.

### Slice D — growth arbitration integration

Integrate the surface with Keep/Share/Community prompt arbitration; do not implement independent competing banners here.

---

## 18. Explicit non-scope

Do not use this work to:

- rewrite transliteration;
- replace the Basic textarea;
- redesign Rich Editor/Keyboard in the same PR;
- add every WriteUrdu tool to the command surface;
- add a new icon/framework dependency;
- add a new analytics sink;
- automatically publish writing;
- move AdSense into the active task;
- change mature SEO URLs;
- build new unrelated features.

---

## 19. Definition of done

A first-time visitor should immediately understand:

- where to type;
- that English letters can become Urdu;
- that direct Urdu and speaking are alternative input paths;
- how to Copy once something useful exists.

A serious writer should naturally discover:

- Rich Editor;
- PDF/Word;
- Keep/save;
- later Share/Publish when contextually appropriate.

All existing lower-frequency capabilities remain reachable, but the product no longer demands that a user understand them before writing their first word.
