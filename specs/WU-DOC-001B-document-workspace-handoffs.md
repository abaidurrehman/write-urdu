# WU-DOC-001B — Document Translator Workspace + Handoffs

**Parent:** `WU-DOC-001`  
**Depends on:** `WU-DOC-001A`, `WU-PLAT-002`  
**Status:** Planned  
**Date:** 2026-08-24  
**Scope:** public workspace, editable Urdu result, copy/edit/export, Rich Editor continuity, mobile/accessibility

---

## 1. Goal

Turn the proven Slice A API into a focused product experience:

```text
Upload → Translate → Review/Edit → Use the Urdu
```

The workspace must feel like a Write Urdu product, not a technical model demo.

---

## 2. Route

Primary route:

```text
/tools/english-to-urdu-document-translator
```

Keep one dominant task above the fold.

Suggested hierarchy:

```text
English to Urdu Document Translator
Upload a PDF, Word document or text file and turn it into editable Urdu.

[ Choose document ]
PDF · DOCX · TXT
```

Technical/privacy detail belongs below the task or in Privacy. One short accurate processing note is enough near the action.

---

## 3. Upload state machine

```text
idle
→ file_selected
→ translating
→ translated | partial | failed
```

File selection does not automatically spend AI quota. Require explicit:

```text
[ Translate to Urdu ]
```

State transitions must prevent duplicate simultaneous submits.

If the user chooses another file, reset the previous transient draft only after a clear user action; do not silently merge documents.

---

## 4. Result review

Desktop:

```text
┌──────── Original ────────┬──────── Urdu ───────────┐
│ English source blocks    │ editable RTL Urdu       │
└──────────────────────────┴─────────────────────────┘
```

Mobile:

- Urdu result first;
- source comparison collapsible per document/section;
- no mandatory side-by-side horizontal scroll.

The translated side is editable. Manual edits become the user's current result and must not be overwritten by stale server responses/retries.

Failed blocks should be visually identifiable and individually retryable where practical without retranslating the whole document.

---

## 5. Editing contract

The result editor may be a purpose-built bounded document editor or reuse a current Write Urdu editable surface after repo inspection.

Required:

- RTL Urdu editing;
- heading/paragraph/list/table semantics retained where supported;
- selection/copy works;
- undo/redo behaves normally for manual edits;
- no silent retranslation of manually edited text;
- no duplicate transcript/source field that the user must manually copy into the real result.

Embedded unified Urdu input (Roman/direct/voice) may be added if it naturally reuses the current shared input system, but it is not allowed to destabilize Slice B. `Open in Rich Editor` provides the full editing continuation.

---

## 6. Primary actions

Keep result actions outcome-led:

```text
[ Edit Urdu ]
[ Copy Urdu ]
[ Open in Rich Editor ]
[ Print / Save as PDF ]
```

Optional owner-feature actions appear only when available and appropriate:

```text
Save to My Documents
Share
Create a card
```

Use `Continue with…` for secondary journeys and cap it according to `WU-PLAT-002`.

---

## 7. Rich Editor handoff

Register a translator workspace in the shared journey registry.

Expected payload:

```text
kind: document-draft or compatible rich-text/document payload
source: document-translator
locale/language: ur
```

The handoff should preserve:

- translated text;
- supported headings;
- paragraph breaks;
- list structure;
- simple tables if Rich Editor can safely accept them.

Do not place translated document content in query parameters.

If Rich Editor already contains unsaved work, use its existing conflict/recovery contract. Do not overwrite silently.

---

## 8. Clean PDF/print output

Phase 1 output is newly typeset Urdu.

First inspect existing Rich Editor/export/print owners. Reuse them if suitable.

If a translator-specific print surface is needed, it must be small and deterministic:

- printable semantic HTML;
- RTL content;
- existing Urdu font stack;
- heading/list/table print styles;
- no app chrome;
- no ads;
- no source English unless user explicitly selects bilingual print later;
- no claim that the source PDF layout is preserved.

Browser Print / Save as PDF is acceptable for Phase 1 if the print result is polished and reliable.

---

## 9. Privacy UX

Near Translate action, concise copy such as:

> Your document is sent for translation when you choose Translate. Write Urdu does not save it as part of this tool.

Do not place a multi-paragraph Cloudflare/model/privacy explanation above the upload control.

If account save is offered later, make the transition explicit:

```text
Save this Urdu document to My Documents
```

That is a separate persistence action.

---

## 10. Accessibility

- choose-file button and drop zone are both keyboard accessible;
- drag/drop is optional enhancement;
- selected file name is announced/shown locally;
- progress has one polite live status, not per-block chatter;
- errors are associated with the workspace and focusable;
- source area is `lang="en"`/LTR;
- result area is `lang="ur"`/RTL;
- action labels contain text, not icon-only controls;
- partial-failure states are not communicated only by color.

---

## 11. Mobile acceptance

Must be tested at the repository's mobile Playwright profile and at least one narrow viewport representative of common mobile traffic.

Verify:

- upload control is visible without excessive preamble;
- result action bar does not overflow;
- Urdu editing has comfortable line height/tap targets;
- source comparison can be hidden to prioritize Urdu;
- long URLs/tables wrap/scroll inside their bounded content area, not the whole page;
- no ad enters the workspace.

---

## 12. Telemetry

Emit existing product telemetry through the shared path.

Allowed events:

```text
document_translate_viewed
file_selected
translation_started
translation_completed
translation_failed
result_edited
copy_completed
rich_editor_handoff
export_completed
```

Allowed coarse dimensions:

```text
source_kind
size_bucket
result = success | partial | failure
locale
```

No filename/text.

---

## 13. Likely files

After repo inspection:

```text
tools/english-to-urdu-document-translator.html
css/document-translator.css
js/document-translator.js
js/workspace-journey-registry.js
js/workspace-handoff.js
js/workspace-next-step.js
js/product-telemetry.js
js/ads.js
```

If current tool routing conventions use different filenames/directories, follow those conventions.

---

## 14. Acceptance criteria

- [ ] primary route renders as a focused V2 Work workspace.
- [ ] PDF/DOCX/TXT selection works on desktop/mobile.
- [ ] translation only begins after explicit action.
- [ ] duplicate submission is prevented.
- [ ] progress/error/partial states are clear.
- [ ] Urdu result is editable RTL content.
- [ ] manual edits survive secondary actions.
- [ ] Copy uses the edited result, not stale server text.
- [ ] Rich Editor handoff uses shared workspace runtime.
- [ ] existing Rich Editor content conflict is handled safely.
- [ ] clean print/Save-as-PDF path works.
- [ ] no exact-layout claim appears.
- [ ] no document content enters URL/telemetry/log payloads.
- [ ] workspace remains ad-free through primary result actions.
- [ ] accessibility and mobile browser tests pass.
