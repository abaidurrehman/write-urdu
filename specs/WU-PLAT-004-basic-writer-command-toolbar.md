# WU-PLAT-004 — Basic Writer Command Toolbar

**Priority:** P0  
**Status:** Active — implementation-ready  
**Route owner:** `/`  
**Area:** Core authoring UX / completion actions / sharing  
**Parent initiative:** `WU-PLAT-003` Core Workspace Convergence  
**Journey dependency:** `WU-PLAT-002` V2 Product Journey & Workspace Handoffs  
**Share dependency:** `WU-SHARE-001` Public Share Pages & Viral Publishing Loop  
**Design decision date:** 2026-08-18

---

## 1. Purpose

Make the Basic Writer's most important controls obvious, compact and directly connected to the writing canvas.

The current homepage exposes two generations of control UI at once:

- a legacy export/action block containing Copy + an `Export` disclosure below the writer;
- a separate `editor-chrome` strip above the writer for input mode and Clear;
- a convergence runtime that moves/hides legacy controls after load;
- Share currently lives inside the convergence-owned `More` panel even though sharing is a primary completion action for the product.

This produces unnecessary hunting and makes the core writing experience feel less intentional than newer WriteUrdu workspaces.

The approved direction is one persistent, self-explanatory **command toolbar immediately above the writing canvas**.

The user should understand the primary actions without opening a menu:

**Share → Copy → PDF → Word → PNG → Preview → Print → Input mode → More → Clear**

The toolbar is not a generic product navigation bar. It is the command surface for the current Basic Writer document.

---

## 2. Product decision

Replace the visible split Basic Writer action model with one source-owned command toolbar.

The command toolbar MUST:

1. sit directly above the Basic Writer canvas;
2. keep **Share** as the most prominent first-class completion action;
3. keep **Copy** directly visible as the second priority action;
4. expose **PDF, Word, PNG, Preview and Print** as direct compact commands on desktop;
5. keep the existing Roman Urdu / Direct Urdu input-mode control in the same command area;
6. keep **More** for genuinely lower-frequency actions;
7. visually isolate **Clear** because it is destructive;
8. remain visible before typing so the workspace is stable and learnable;
9. disable content-dependent commands while the editor is empty instead of hiding the entire command surface;
10. reuse the existing export, input-mode, draft, share and transliteration engines rather than reimplementing them.

This slice is **convergence, not a rewrite of the writing engine**.

---

## 3. Why this is P0

The homepage is the mature core acquisition and authoring route. A confusing completion area therefore affects both first-time users and repeat users on the most important surface of the product.

The command bar solves several high-value problems at once:

- reduces interaction cost for the most common completion actions;
- makes sharing discoverable at the exact moment users finish writing;
- removes the oversized export popover for common formats;
- joins input mode and document actions into one predictable place;
- removes another visible seam between the legacy homepage and the newer V2/V3 workspaces;
- creates a repeatable command-bar pattern that can later inform Urdu Keyboard and Rich Editor convergence.

The implementation MUST protect the existing homepage's search ownership, transliteration behavior, local-first draft behavior and ad boundary.

---

## 4. Current implementation baseline

The implementation must start from the current code rather than layering another toolbar over it.

### 4.1 Current static source

`index.html` currently contains:

- `.home-actions`
  - `.home-actions-group-primary`
    - `data-copy-target="#transliterateTextarea"`
    - a legacy `details.action-menu` with `Export`
    - `#inputFileNameToSaveAs`
    - Text file
    - `#exportImage` → `DownloadAsImage()`
    - `#exportPdf` → `DownloadAsPdf()`
    - `#exportWord` → `DownloadAsWord()`
    - `#PrintCurrentText` → `PrintText()`
    - `#previewExport` → `PreviewCurrentText()`
  - a legacy Create group that convergence already retires;
  - a legacy Share + More group.

`index.html` also contains a separate `.editor-chrome` immediately around the writing controls with:

- current mode description;
- `Ctrl+G` hint;
- `[data-input-mode-control]`;
- `data-input-mode-storage="basic"`;
- `data-input-mode-targets="#transliterateTextarea"`;
- Roman and Direct mode buttons;
- `[data-input-mode-note]`;
- `#spinner`;
- `#clear` → `clearText()`.

### 4.2 Current convergence runtime

`js/core-workspace-convergence.js` currently:

- relocates `.home-actions` after `#UsageAlert`;
- hides the action bar while the editor is empty;
- removes the legacy Create group;
- removes the old Share node;
- converts the secondary legacy settings disclosure into `data-wu-basic-more`;
- injects a `Share text only` button into that More panel;
- invokes `WriteUrduTools.share()` for the current native text-sharing behavior.

That runtime bridge was intentionally low risk, but this slice is the point where the Basic Writer's command surface should become source-owned rather than assembled from legacy pieces after load.

### 4.3 Existing engines to preserve

Do not rewrite these behaviors as part of this slice:

- Google transliteration initialization and suggestion behavior;
- `js/input-mode.js` mode state and `Ctrl+G` switching;
- batch transliteration engine;
- `DownloadAsPdf()`;
- `DownloadAsWord()`;
- `DownloadAsImage()`;
- `PreviewCurrentText()`;
- `PrintText()`;
- `saveTextAsFile()`;
- `clearText()` unless a minimal adapter is required for accessibility/state sync;
- `WriteUrduTools.share()` native text-share behavior;
- browser-local draft/history behavior in `js/editor-tools.js`;
- WU-PLAT-002 handoff and `Continue with…` behavior.

---

## 5. Target information hierarchy

### 5.1 Desktop command order

Use this order in DOM and keyboard navigation:

1. **Share**
2. **Copy**
3. PDF
4. Word
5. PNG
6. Preview
7. Print
8. Input mode group
9. More
10. Clear

The first two actions are visually stronger than the export utilities.

### 5.2 Conceptual desktop wireframe

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [ Share ] [ Copy ] │ PDF  Word  PNG  Preview  Print │ Input mode [Roman Urdu → Urdu][Direct Urdu] │ More │ Clear │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ✦ Type Roman Urdu and press Space to convert each word.                                      Ctrl+G │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                      │
│                                                                          Urdu writing canvas         │
│                                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

The canvas must remain the dominant visual object. The toolbar should read as one compact layer of controls, not a second hero.

### 5.3 Toolbar grouping

Use subtle separators or spacing, not additional boxed cards, between:

- Share/Copy;
- document outputs;
- input mode;
- overflow;
- destructive Clear.

Do not visually give PDF/Word/PNG the same weight as Share.

---

## 6. Visual design contract

### 6.1 Overall treatment

Use the current V2/V3 design language:

- white/light neutral surface;
- subtle green border/shadow treatment;
- existing design-system tokens where available;
- rounded corners consistent with the current workspace shell;
- compact professional iconography;
- no gradients, novelty illustrations or oversized icons;
- no new external icon/font dependency.

The toolbar should feel like a calm writing application, not a marketing CTA strip.

### 6.2 Recommended dimensions

Desktop guidance, adjustable to existing tokens:

- toolbar minimum control height: `40px`;
- primary/secondary button target height: `42–44px`;
- touch target minimum: `44 × 44px` where practical;
- toolbar internal gap: `6–10px`;
- group gap/separator spacing: `12–18px`;
- icon size: approximately `16–18px`;
- label size: approximately `14–15px`;
- toolbar vertical padding: approximately `10–12px`;
- toolbar outer radius should match the current V3 workspace card radius.

Do not shrink touch targets merely to force all actions onto one line.

### 6.3 Icon contract

Reuse the already-loaded Font Awesome 5 set. Icons supplement labels; they do not replace accessible names.

Recommended mappings:

| Action | Icon |
| --- | --- |
| Share | `fas fa-share-alt` or a reviewed equivalent share/link icon |
| Copy | `far/fas fa-copy` |
| PDF | `far fa-file-pdf` |
| Word | `far fa-file-word` |
| PNG | `far fa-image` |
| Preview | `far fa-eye` |
| Print | `fas fa-print` |
| Input mode | `fas fa-language` only if the label remains clear |
| More | `fas fa-ellipsis-h` |
| Clear | `far fa-trash-alt` |

Do not use emoji for toolbar commands.

### 6.4 Share styling

Share is the strongest action:

- filled primary green surface;
- white icon/text;
- label is simply **Share**;
- always includes visible text on desktop and mobile;
- must not be reduced to an ambiguous icon-only control.

### 6.5 Copy styling

Copy is the second priority:

- outlined/secondary green treatment;
- visible icon + **Copy** label;
- always visible on desktop and mobile.

### 6.6 Export utility styling

PDF, Word, PNG, Preview and Print:

- compact neutral/quiet controls;
- each must have icon + visible short label on desktop;
- no heavy filled button treatment;
- no nested disclosure required to discover these common actions.

### 6.7 Clear styling

Clear must be visually separated from non-destructive actions:

- soft destructive red/pink treatment;
- trash icon + `Clear` label where width permits;
- no saturated danger-red block that competes with Share;
- disabled while there is no content.

---

## 7. Persistent toolbar and content state

### 7.1 Empty editor

The command toolbar remains visible before the user types.

When `#transliterateTextarea` has no meaningful content:

- Share: disabled;
- Copy: disabled;
- PDF: disabled;
- Word: disabled;
- PNG: disabled;
- Preview: disabled;
- Print: disabled;
- Text file export under More: disabled;
- Clear: disabled;
- Input mode: enabled;
- More: enabled for non-content settings/help;
- filename editing may remain enabled;
- help/settings remain enabled.

The UI must use real `disabled` state where controls are buttons. Do not depend only on opacity or `aria-disabled` while leaving the action clickable.

This replaces the current convergence behavior that hides the entire `.home-actions` block while empty.

### 7.2 Non-empty editor

After meaningful content exists:

- Share/Copy/export/Preview/Print/Clear become enabled;
- no layout shift should occur when they enable;
- toolbar height and button positions remain stable.

### 7.3 State synchronization

The controller must respond to:

- normal `input` events;
- draft restore;
- cross-workspace import/handoff;
- batch transliteration output;
- Clear;
- any existing programmatic `setPlainText` / editor-tools restore path that dispatches `input`.

Do not poll the editor for state.

---

## 8. Input mode integration

### 8.1 Preserve the existing input-mode contract

The toolbar MUST retain the current semantic hooks so `js/input-mode.js` remains the owner of mode behavior:

```html
data-input-mode-control
data-input-mode-storage="basic"
data-input-mode-targets="#transliterateTextarea"
data-input-mode-option="roman"
data-input-mode-option="direct"
data-input-mode-note
```

Do not duplicate mode state in the new toolbar controller.

### 8.2 Segmented control

Desktop:

```text
Input mode  [ Roman Urdu → Urdu ] [ Direct Urdu / English ]
```

The active choice must remain visually obvious and expose correct `aria-pressed` state.

### 8.3 Helper row

Move the mode guidance into one subtle helper/status row immediately below the toolbar rather than letting it compete inside the segmented control.

Roman mode example:

`Type Roman Urdu and press Space to convert each word.`

Direct mode should show the current direct-input guidance supplied by `js/input-mode.js`.

Show `Ctrl+G` as a compact keyboard hint at the opposite end of the helper row on desktop.

The helper row must not look like an error or warning banner.

### 8.4 Transliteration spinner

Keep `#spinner` behavior but render it unobtrusively in the helper/status area or adjacent to the input mode label.

Do not create a second spinner implementation.

---

## 9. Share-first product contract

Share is intentionally promoted from `More` to the first toolbar position.

### 9.1 Immediate slice behavior

The toolbar Share button must have one stable entry point owned by a Basic Writer share controller/adapter.

At minimum, it must preserve the current native **share text only** behavior through `WriteUrduTools.share()`:

- do not duplicate `navigator.share` logic in the toolbar;
- preserve current empty-text validation;
- preserve current success/error feedback;
- no text in telemetry;
- no text in the current page URL.

The old convergence-injected `Share text only` item must disappear once the new toolbar is active; there must not be two competing Share entry points.

### 9.2 Branded WriteUrdu public-link evolution

`WU-SHARE-001` Phase 2 defines Basic Editor public sharing. This toolbar is the permanent entry point for that capability when it is enabled.

The toolbar MUST therefore call a small share adapter rather than bind permanently to raw `navigator.share` semantics.

Preferred logical API:

```text
BasicWriterShare.open({
  source: 'basic_editor',
  getText: () => current plain text
})
```

Exact naming may differ, but the boundary must allow the Share button to evolve from text-only sharing to the branded WriteUrdu share experience without changing the toolbar markup/order.

When branded public-link sharing is implemented, the Share surface should distinguish clearly between:

1. **Create WriteUrdu link** / `Publish & get link` — explicit public snapshot flow;
2. **Share text only** — device/browser share without publishing.

Publishing MUST never happen automatically from the toolbar click.

Until Basic Editor public publishing is actually implemented, do not label native text sharing as `Create link`, `Publish`, or otherwise imply that a public WriteUrdu URL was created.

### 9.3 Telemetry

Allowed toolbar/share telemetry contains only stable action metadata, for example:

```text
workspace: basic-writer
action: share_opened | share_text_selected | copy_clicked | export_pdf_clicked
hasContent: true|false
```

Never emit:

- Urdu text;
- selected text;
- filenames entered by the user;
- public share content;
- HTML;
- clipboard contents.

Reuse `WriteUrduTelemetry` rather than creating another analytics sink.

---

## 10. Direct document commands

The command bar changes discovery, not export semantics.

### 10.1 Copy

Keep the existing copy behavior and target:

`#transliterateTextarea`

Preferred markup retains `data-copy-target="#transliterateTextarea"` so the existing copy runtime continues to own the operation.

Success feedback should remain non-blocking and accessible.

### 10.2 PDF

Direct toolbar action invokes the existing PDF implementation.

Preserve the current stable hook where feasible:

`#exportPdf` → `DownloadAsPdf()`

### 10.3 Word

Preserve:

`#exportWord` → `DownloadAsWord()`

### 10.4 PNG

Preserve:

`#exportImage` → `DownloadAsImage()`

### 10.5 Preview

Preserve:

`#previewExport` → `PreviewCurrentText()`

### 10.6 Print

Preserve:

`#PrintCurrentText` → `PrintText()`

### 10.7 Filename

The filename field is lower-frequency configuration and must move into More.

Preserve `#inputFileNameToSaveAs` unless the export functions are deliberately migrated in the same PR with equivalent regression coverage.

Requirements:

- keep current default Urdu filename behavior;
- label field `File name`;
- field supports RTL Urdu and normal Latin input;
- changing the filename must not alter the editor text;
- direct PDF/Word/PNG export keeps using the current filename logic if that is already the engine contract.

### 10.8 Text file

`Text file` moves into More because it is lower priority than PDF/Word/PNG.

Preserve the existing `saveTextAsFile('transliterateTextarea','inputFileNameToSaveAs')` behavior.

---

## 11. More menu contract

`More` is an overflow for secondary document/editor controls, not a second tool directory.

### 11.1 Required content

At minimum:

**File**
- File name
- Download text file

**Editor options**
- existing page-background setting if it remains supported;
- a route/trigger to the existing writing productivity tools only if needed to preserve current functionality.

**Help**
- How to use Write Urdu

### 11.2 Existing productivity tools

`js/editor-tools.js` already owns functionality such as:

- Find & replace;
- Recent drafts;
- Import text;
- Focus mode;
- Shortcuts;
- word/character counts;
- local draft state.

Do not clone these functions inside the command bar.

If the current UI exposes a generic `Tools` trigger near the Basic Writer, the toolbar migration may move that entry into More, but it must trigger/reveal the existing productivity UI rather than creating duplicate controls with separate state.

### 11.3 Disclosure behavior

More must:

- use a button with `aria-expanded` and `aria-controls`;
- close on Escape;
- return focus to the More button when closed via Escape;
- close on outside click/tap where consistent with current site behavior;
- remain keyboard navigable;
- never obscure the active typing caret on mobile more than necessary.

Avoid the current oversized export popover footprint.

---

## 12. Clear behavior

Clear remains explicit and destructive.

Requirements:

- use the existing `#clear` hook / `clearText()` behavior unless safely migrated;
- disabled while editor is empty;
- does not clear unrelated local history/drafts unless current `clearText()` explicitly does so;
- does not reset input mode;
- toolbar state updates immediately after clearing;
- no accidental activation from Enter/Space while focus is on another control.

If the current clear operation permanently destroys recoverable work, implementation should verify whether the existing local-history contract already provides recovery. Do not add a blocking confirmation dialog unless current behavior or testing demonstrates a real accidental-loss risk.

---

## 13. Batch transliteration placement

`data-batch-transliteration` must continue working, but it must not create a large permanent visual barrier between the command bar and the writing canvas.

Preferred presentation:

- default instructional text is visually quiet and compact;
- the actionable `Convert passage to Urdu script` state becomes prominent only when the existing long-text detection activates it;
- the component may sit below the helper row, but the canvas must remain visually connected to the toolbar;
- do not rewrite the batch transliteration algorithm in this slice.

If the existing default panel is visually too tall, reduce its presentation through CSS/markup while preserving its content and event hooks.

---

## 14. Responsive behavior

The toolbar must be intentionally responsive rather than horizontally overflowing.

### 14.1 Large desktop — approximately `>= 1280px`

Show directly:

- Share;
- Copy;
- PDF;
- Word;
- PNG;
- Preview;
- Print;
- full Input mode segmented control;
- More;
- Clear.

A single row is preferred when the available workspace width allows it.

### 14.2 Medium desktop/tablet — approximately `768–1279px`

Priority order remains:

1. Share;
2. Copy;
3. input mode;
4. Clear;
5. direct exports as space allows;
6. More.

The layout may wrap into two compact rows. Wrapping is preferable to unreadable labels or a horizontal-scrolling command bar.

If direct export commands no longer fit cleanly, move the lowest-priority utilities into More in this order:

1. Print;
2. Preview;
3. PNG;
4. Word;
5. PDF.

Do not move Share or Copy into overflow.

### 14.3 Mobile / Pixel 5

Share and Copy are non-negotiable visible controls.

Recommended arrangement:

```text
[ Share ] [ Copy ]                         [ More ] [ Clear ]
[ Input mode: Roman Urdu → Urdu | Direct Urdu / English ]
```

PDF, Word, PNG, Preview and Print may move into More on mobile.

Requirements:

- Share retains icon + label;
- Copy retains icon + label;
- input mode remains directly discoverable;
- no horizontal page overflow;
- touch targets remain at least approximately 44px;
- editor canvas begins close to the toolbar/helper region;
- More menu remains usable without viewport clipping.

### 14.4 Very narrow widths

Prefer wrapping to icon-only ambiguity.

If Clear must become icon-only at the narrowest supported width, retain an accessible name and tooltip, but Share and Copy must keep visible labels.

---

## 15. Accessibility contract

### 15.1 Toolbar semantics

Use one command surface with:

```html
role="toolbar"
aria-label="Writing and document actions"
```

Group semantics may be used for Share/Copy, exports and input mode.

### 15.2 Keyboard

All commands must be reachable in logical DOM order.

Do not implement roving-tabindex unless there is a clear accessibility reason; normal Tab navigation is acceptable and simpler for the mixed controls in this toolbar.

### 15.3 Labels

Every icon has a visible text label on desktop.

Where responsive layout hides a visible label, the control must still have an accurate accessible name.

Tooltips are supplemental and must not be the sole means of understanding an action.

### 15.4 Focus

- use visible focus styles meeting current V3 focus treatment;
- opening More moves focus only when appropriate;
- closing More with Escape restores focus to its trigger;
- Share dialogs/sheets must manage focus according to their own modal contract;
- clicking an export action must not unexpectedly steal focus from the editor after the operation completes unless the existing Preview implementation intentionally opens a preview surface.

### 15.5 Status feedback

Copy/share/export errors should be announced through the existing accessible notification system.

Do not add competing `aria-live` regions if `WriteUrduUI.notify` already provides appropriate feedback.

---

## 16. Localization and language behavior

The command bar is product chrome; the editor remains RTL Urdu content.

Requirements:

- do not set the whole toolbar to `dir="rtl"` merely because the editor content is Urdu;
- keep current interface locale behavior;
- use existing localization hooks where equivalent labels already exist;
- new toolbar labels should be added to the site's UI translation source if the current shell localizes Basic Writer controls;
- avoid hard-coding layout assumptions based on English label width;
- preserve `lang="ur"` / `dir="rtl"` on the writing canvas and filename field where applicable.

---

## 17. Implementation architecture

### 17.1 Source-owned markup

The final Basic Writer toolbar should exist in `index.html` as meaningful source markup.

Do **not** implement the finished state by leaving the legacy action groups in source and having another MutationObserver rearrange them at runtime.

The migration may preserve stable IDs/data attributes required by existing engines.

### 17.2 Recommended files

Expected implementation surface:

- `index.html` — source-owned command bar + helper structure;
- `css/workspace-command-bar.css` — reusable visual pattern for command bars;
- `js/basic-writer-command-bar.js` — Basic-specific enable/disable/overflow/share-adapter coordination;
- `js/core-workspace-convergence.js` — retire Basic action-bar relocation/injected Share/More behavior once source owns it;
- `css/core-workspace-convergence.css` — remove Basic-only bridge styling that is no longer required;
- `js/editor-tools.js` — only if a small public method/event is needed to reveal an existing productivity panel; do not duplicate its tools;
- `js/input-mode.js` — ideally no behavior change;
- `sw.js` — cache-version bump and new shared asset registration where applicable;
- tests described below.

Exact filenames may differ if current structure makes another small module safer, but the ownership boundary must remain clear.

### 17.3 Reuse strategy

Do not over-generalize a full cross-editor command framework before this first implementation is proven.

Prefer:

- generic CSS structure/classes such as `.wu-command-bar`, `.wu-command-group`, `.wu-command-action`;
- Basic-specific JS state/controller now;
- extract shared JS only when Keyboard/Rich implementation demonstrates a genuinely common behavioral contract.

The visual pattern is intended for later reuse; the Basic implementation must not force Rich Editor into an insufficient command model.

### 17.4 No duplicate event ownership

Each command should have one owner:

- copy → existing copy runtime;
- exports → existing export functions;
- input mode → `js/input-mode.js`;
- share → Basic share adapter delegating to current/future share service;
- More → command-bar disclosure controller;
- drafts/tools → `js/editor-tools.js`;
- cross-workspace continuation → WU-PLAT-002 runtime.

The command-bar controller coordinates state and presentation; it does not reimplement these engines.

---

## 18. Suggested DOM contract

Illustrative only; implementation may adjust class names while preserving semantics/hooks.

```html
<section class="wu-command-surface" data-wu-basic-command-surface>
  <div class="wu-command-bar" role="toolbar" aria-label="Writing and document actions">
    <div class="wu-command-group wu-command-group-primary">
      <button type="button" class="wu-command-share" data-wu-basic-share>
        <i class="fas fa-share-alt" aria-hidden="true"></i>
        <span>Share</span>
      </button>

      <button type="button" class="wu-command-copy" data-copy-target="#transliterateTextarea">
        <i class="far fa-copy" aria-hidden="true"></i>
        <span>Copy</span>
      </button>
    </div>

    <div class="wu-command-group wu-command-group-export" aria-label="Document output">
      <button type="button" id="exportPdf">...</button>
      <button type="button" id="exportWord">...</button>
      <button type="button" id="exportImage">...</button>
      <button type="button" id="previewExport">...</button>
      <button type="button" id="PrintCurrentText">...</button>
    </div>

    <div class="wu-command-group wu-command-mode"
         data-input-mode-control
         data-input-mode-storage="basic"
         data-input-mode-targets="#transliterateTextarea"
         role="group"
         aria-label="Input mode">
      <span data-input-mode-title>Input mode</span>
      <button type="button" data-input-mode-option="roman" aria-pressed="true">Roman Urdu → Urdu</button>
      <button type="button" data-input-mode-option="direct" aria-pressed="false">Direct Urdu / English</button>
    </div>

    <button type="button" data-wu-basic-more-toggle aria-expanded="false" aria-controls="wuBasicMorePanel">...</button>
    <button type="button" id="clear">...</button>
  </div>

  <div class="wu-command-helper">
    <span data-input-mode-note>Type Roman Urdu and press Space to convert each word.</span>
    <span data-wu-input-shortcut>Ctrl+G</span>
    <span id="spinner" role="status">...</span>
  </div>

  <div id="wuBasicMorePanel" data-wu-basic-more-panel hidden>...</div>
</section>
```

Do not interpret this sample as permission to duplicate existing handlers with new inline JavaScript.

---

## 19. Interaction details

### 19.1 Share

- disabled when editor empty;
- enabled immediately after meaningful text exists;
- click invokes the share adapter;
- no navigation unless the selected share flow explicitly requires it;
- no automatic public publishing;
- one visible Share button only.

### 19.2 Copy

- disabled when editor empty;
- enabled on content;
- successful copy uses existing feedback;
- does not open More.

### 19.3 Export actions

- disabled while empty;
- direct single click invokes existing action;
- do not require choosing `Export` first;
- downloaded content/format must match pre-migration behavior.

### 19.4 Preview

Preview is a direct command but should preserve its existing modal/window behavior.

Do not turn Preview into another route.

### 19.5 More

- available even while editor is empty because settings/help may remain useful;
- content-dependent entries inside it are individually disabled;
- there is one disclosure state, not nested legacy `details` inside another menu.

### 19.6 Clear

- disabled while empty;
- immediate state update after clearing;
- visually separated.

---

## 20. Relationship to `Continue with…`

The command bar owns **completion actions for the current document**.

`Continue with…` owns **cross-workspace continuation/transformation**.

Therefore the command bar MUST NOT add:

- Rich Editor;
- Card Studio;
- QR Generator;
- Templates;
- Invoice;
- Text Cleaner;
- other product destinations as equal toolbar actions.

Those remain governed by WU-PLAT-002 contextual progression and global navigation.

This distinction prevents the toolbar from becoming the old tool portal again.

---

## 21. AdSense boundary

No ad may appear:

- inside the command bar;
- between the command bar/helper row and writing canvas;
- inside the writing canvas;
- inside More;
- between the writing canvas and its immediate completion/continuation actions if that interrupts the active task.

Preserve the existing approved post-workspace ad boundary.

The toolbar must not change ad placement or trigger additional ad requests.

---

## 22. SEO and route safety

This is a UI convergence change on a mature ranking route.

The implementation MUST NOT change:

- `/` canonical;
- page title;
- meta description;
- Open Graph/Twitter ownership;
- existing WebApplication/SEO schema without a separately justified correction;
- sitemap route ownership;
- transliteration keyword copy merely to match toolbar labels;
- established heading hierarchy unless an accessibility defect requires a narrowly reviewed change.

Source cleanup of legacy action markup must not delete useful indexable explanatory content.

---

## 23. Performance constraints

- no new third-party runtime dependency;
- no new icon library;
- no toolbar framework;
- no MutationObserver solely to keep the toolbar alive;
- no editor polling;
- avoid layout shift after `site-header.js`/convergence runtime starts;
- prefer source-visible final layout so the toolbar does not jump from below the editor to above it after JavaScript executes;
- add any new local JS/CSS to the PWA shell cache and bump the cache version according to repository convention.

---

## 24. Privacy and security

The command bar does not change WriteUrdu's local-first authoring model.

Rules:

- editor text stays browser-local except when the user explicitly chooses a share/publish action already covered by its own privacy contract;
- filenames stay local and out of telemetry;
- no editor text in URL query/hash;
- no editor text in analytics;
- no automatic upload caused by enabling Share;
- no clipboard read permission request;
- Copy writes only the text the user explicitly owns in the current editor;
- public-link publishing, when later enabled, must follow WU-SHARE-001's explicit confirmation and storage rules.

---

## 25. Test plan

### 25.1 Static/contract tests

Add a dedicated contract, recommended:

`tests/basic-writer-command-bar-contract.test.js`

It should verify at minimum:

1. `index.html` contains one Basic Writer command surface above `#transliterateTextarea` in source/document order.
2. Share, Copy, PDF, Word, PNG, Preview, Print, input mode, More and Clear are represented.
3. the common export commands are not hidden behind the legacy `Export` `<details>` control.
4. `#inputFileNameToSaveAs` still exists under the More/file configuration area.
5. Text file export still exists under More.
6. existing export IDs/functions remain connected.
7. current input-mode data attributes remain present.
8. old convergence-injected `Share text only` is no longer required as the primary visible Share path.
9. no Basic toolbar destination links to Rich/Card/QR/Invoice/Templates.
10. no user-content field is introduced into URL-building code.
11. new JS/CSS assets are registered in the shell/PWA cache if required.

Update `scripts/run-contract-tests.js`.

### 25.2 Browser acceptance — desktop

Add a focused Playwright spec, recommended:

`tests/basic-writer-command-bar.spec.js`

Desktop cases:

1. toolbar is visible before typing;
2. input mode + More are usable while empty;
3. Share/Copy/export/Clear are disabled while empty;
4. typing Urdu enables content actions without moving the toolbar;
5. Share is first in DOM and visually uses primary treatment;
6. Copy remains visible immediately next to Share;
7. direct PDF/Word/PNG/Preview/Print controls are visible without opening More;
8. More exposes filename + text-file export + retained secondary options;
9. More keyboard/Escape behavior is correct;
10. Ctrl+G still switches input mode;
11. helper text updates with input mode;
12. Clear empties the editor and disables content commands again;
13. `Continue with…` still appears after meaningful content and remains below the active workspace;
14. user text does not appear in the page URL.

### 25.3 Browser acceptance — Pixel 5

Verify:

1. no horizontal overflow;
2. Share visible with label;
3. Copy visible with label;
4. input mode directly discoverable;
5. More visible and usable;
6. Clear reachable;
7. PDF/Word/PNG/Preview/Print are available through the responsive overflow when not directly shown;
8. editor remains immediately reachable below the command/helper region;
9. touch targets are not cramped/overlapping;
10. More panel remains within viewport.

### 25.4 Existing regression suites

The implementation PR must keep green:

- core workspace convergence contracts;
- WU-PLAT-002 journey/handoff contracts;
- homepage SEO acquisition tests;
- transliteration/browser acceptance;
- desktop + Pixel 5 focused product suite;
- V3 production visual-quality audit;
- AdSense/monetization boundary contracts;
- static route/governance checks.

### 25.5 Export smoke coverage

Where downloads are difficult to inspect in CI, stub/spyon the existing export entry functions and prove each toolbar command invokes exactly the same owner function as before.

At least one existing functional export path should remain covered end to end if current tests already support it.

Do not weaken export tests merely because the entry point moved.

---

## 26. Visual-quality acceptance

The production visual audit must specifically review the Basic Writer at:

- wide desktop;
- common laptop width;
- Pixel 5/mobile.

Reject the implementation if any of these are true:

- Share no longer reads as the primary action;
- toolbar feels taller/heavier than the editor orientation itself;
- export labels wrap awkwardly on desktop;
- toolbar horizontally scrolls on normal mobile widths;
- helper row looks like an error alert;
- input-mode active state is unclear;
- Clear competes visually with Share;
- canvas is pushed materially farther below the fold;
- More overlays the typing caret excessively;
- duplicated old actions remain visible below the editor;
- ad placement appears between toolbar and canvas.

---

## 27. Acceptance criteria

The slice is complete only when all of the following are true.

### Structure

- [ ] One unified Basic Writer command bar exists directly above the canvas.
- [ ] The old visible split action/export + editor-chrome model is retired.
- [ ] The final layout is source-owned rather than reconstructed by a Basic-only MutationObserver bridge.
- [ ] Toolbar remains visible in the empty state.

### Priority and clarity

- [ ] Share is the first and strongest visible action.
- [ ] Copy is second and always directly visible.
- [ ] PDF, Word, PNG, Preview and Print are direct desktop actions.
- [ ] More contains the filename and text-file export.
- [ ] Clear is visually separated as destructive.
- [ ] Input mode is part of the same command surface.

### Behavior

- [ ] Empty-content actions disable correctly.
- [ ] Content actions enable without layout shift after typing/import/restore.
- [ ] Copy behavior is unchanged.
- [ ] PDF behavior is unchanged.
- [ ] Word behavior is unchanged.
- [ ] PNG behavior is unchanged.
- [ ] Preview behavior is unchanged.
- [ ] Print behavior is unchanged.
- [ ] Text-file behavior is unchanged.
- [ ] Filename behavior is unchanged.
- [ ] Clear behavior is unchanged except for correct toolbar-state synchronization.
- [ ] Ctrl+G and mode persistence remain unchanged.
- [ ] batch transliteration remains functional.

### Share

- [ ] Only one obvious Share entry point is visible in the Basic Writer command surface.
- [ ] The toolbar Share entry delegates to a share adapter rather than duplicating native/browser share logic.
- [ ] Current text-only sharing remains available until branded Basic sharing is implemented.
- [ ] Public publishing never happens implicitly.
- [ ] No user text enters telemetry or the current page URL.

### Responsive/accessibility

- [ ] Desktop layout is self-explanatory without opening More.
- [ ] Pixel 5 keeps Share and Copy visible.
- [ ] Mobile has no horizontal overflow.
- [ ] All actions have accessible names and visible focus.
- [ ] More disclosure is keyboard/Escape accessible.
- [ ] input mode keeps correct `aria-pressed` behavior.

### Product safety

- [ ] homepage canonical/title/SEO ownership unchanged.
- [ ] transliteration engine unchanged.
- [ ] local drafts/history unchanged.
- [ ] WU-PLAT-002 `Continue with…` remains the owner of cross-workspace destinations.
- [ ] no new ad is introduced into the active authoring area.
- [ ] existing SEO/governance/monetization/visual gates remain green.

---

## 28. Recommended delivery slices

### Slice A — Source-owned command-bar foundation

- create the command surface above the editor;
- preserve stable existing command IDs/data attributes;
- integrate input mode + helper row;
- move filename/Text file into More;
- remove the legacy common-action `Export` disclosure;
- retire Basic runtime relocation of `.home-actions`;
- keep current engines unchanged.

### Slice B — Share-first + responsive state controller

- make Share primary and Copy secondary;
- create the Basic share adapter;
- remove the convergence-injected Share item;
- implement empty/non-empty enable state;
- implement responsive overflow policy;
- wire More accessibility;
- preserve productivity-tool ownership.

Slices A and B should normally ship together in one carefully gated PR because a half-migrated command surface would create duplicate controls.

### Slice C — Basic public-link sharing (`WU-SHARE-001` Phase 2)

Separate release slice unless generic Basic share publishing is already implementation-ready when this work begins:

- extend the generic Share Artifact service to `basic_editor` according to WU-SHARE-001;
- add explicit publish confirmation;
- offer `Create WriteUrdu link` as the primary Share-sheet choice;
- keep `Share text only` as a private/non-publishing alternative;
- add share-loop telemetry and Product Pulse reporting required by WU-SHARE-001.

Do not block the command-bar convergence on a server-side publishing expansion if that expansion is not already ready.

### Follow-on — Keyboard and Rich

After Basic is proven:

1. reuse the command-bar visual language for Urdu Keyboard while preserving its on-screen keyboard contract;
2. adapt the same hierarchy principles for Rich Editor, but retain its richer formatting toolbar and document-specific completion model;
3. extract genuinely shared JS only after those implementations expose stable common behavior.

---

## 29. Implementation checklist for Codex

Before editing:

- read `WU-PLAT-003`, `WU-PLAT-002` and this spec;
- inspect `index.html`, `js/core-workspace-convergence.js`, `js/editor-tools.js`, `js/input-mode.js`, current export functions and relevant CSS;
- inspect current desktop + Pixel 5 tests before choosing selectors;
- do not alter transliteration provider code.

During implementation:

- work on a fresh branch from current `main`;
- prefer source markup over runtime DOM reconstruction;
- preserve stable function owners;
- add tests in the same commits as the changed behavior;
- keep user text out of URLs and telemetry;
- bump the service-worker cache if a new cached JS/CSS asset is added;
- avoid unrelated cleanup in the same PR.

Before marking ready:

- run all contract tests;
- run SEO and governance checks;
- run focused desktop + Pixel 5 product tests;
- explicitly inspect the new Basic command-bar cases;
- run the V3 production visual audit;
- review screenshots for wide desktop, laptop and Pixel 5;
- confirm no duplicate old action strip remains;
- confirm no ad moved into the active workspace;
- confirm the exact PR head SHA is green.

---

## 30. Explicit non-scope

This implementation MUST NOT become a pretext to:

- rewrite Google transliteration;
- replace the Basic Writer textarea;
- replace TinyMCE;
- redesign Urdu Keyboard in the same PR;
- redesign Rich Editor in the same PR;
- add Rich/Card/QR/Templates/Invoice buttons to the command bar;
- move AdSense into the toolbar/editor;
- change mature SEO URLs;
- rename the homepage for UI neatness;
- create a new icon library;
- create a new analytics sink;
- automatically publish user writing;
- implement accounts/My Drafts;
- rewrite all editor productivity tools;
- build a generic cross-editor command framework before a second workspace proves the abstraction.

---

## 31. Definition of done

A first-time user should be able to look at the Basic Writer and immediately answer:

- **How do I share this?** — Share.
- **How do I copy it?** — Copy.
- **How do I make a PDF/Word/image?** — direct visible commands on desktop.
- **How do I preview or print it?** — direct visible commands on desktop.
- **How do I change how I type?** — Input mode.
- **Where are less common options?** — More.
- **How do I clear the document?** — Clear.

A returning user should be able to execute those actions without opening a large export menu or searching below the editor.

The editor canvas remains visually dominant, Share is unmistakably first class, and the underlying mature writing/export behavior remains stable.