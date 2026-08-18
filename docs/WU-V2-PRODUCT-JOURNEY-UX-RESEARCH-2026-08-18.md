# WriteUrdu V2 Product Journey / Workspace Handoff — UX Director Research

**Date:** 2026-08-18  
**Status:** Decision research for P0 initiative  
**Scope:** Current WriteUrdu workspaces, current/planned browser-first tools, navigation, cross-workspace continuity, local/cloud draft continuity, creation/share journeys and mobile behavior  
**Companion spec:** `specs/WU-PLAT-002-v2-product-journey-workspace-handoffs.md`

---

## 1. Executive conclusion

WriteUrdu has crossed the point where it should be designed as a collection of tools.

The product already contains several capable standalone workspaces and a first generation of useful handoffs. The remaining UX problem is that discovery and continuity still expose too much of the implementation model to the user:

- users are asked to understand names such as Rich Text Editor, Card Studio, QR Generator and Invoice Generator before they know which product surface solves their job;
- handoffs were added destination by destination, so continuity exists but is not yet governed by one product contract;
- newly added capture/fix tools such as OCR, Text Cleaner, Voice Typing and InPage conversion can make the fragmentation worse if each becomes another isolated destination;
- the product still has moments where finishing one task effectively returns the user to site navigation rather than suggesting the next natural action;
- persistence is split between editor-specific local drafts, short-lived handoffs and a planned account/cloud-draft layer.

The V2 product model should therefore be:

> **Discover by outcome. Work in the simplest suitable workspace. Carry the user's work forward. Suggest only the next natural actions. Preserve recovery at every transition.**

The core journey spine is:

```text
CAPTURE            FIX / REFINE           CREATE / WORK             PUBLISH / USE          RESUME

Roman typing  ─┐
Urdu keyboard ─┤
Voice typing  ─┤
OCR           ─┼──> Unicode Urdu ───> Cleaner / Editor ───> Card / Social ───> Download ─┐
InPage        ─┘                         Rich document ─────> Work output ─────> Copy       ├──> Local drafts
                                                  └────────> Invoice          QR          ├──> My Drafts
                                                                              Public share┘

LEARN supports every stage without becoming a required detour.
```

This is not a mandate to combine every feature into one screen. The existing role-owned workspace rule remains correct: each job should have one appropriate top-level workspace. V2 joins those workspaces into one coherent service.

---

## 2. Evidence from the current product

### 2.1 Current strengths

WriteUrdu already has several architectural decisions worth preserving:

1. **Role-owned direct workspaces.** `WU-RW-001` established that writing roles should own an editor and visual-creation roles should own a direct canvas rather than an iframe or nested WriteUrdu application.
2. **Privacy-safe local handoffs.** Existing journey code moves text through short-lived `sessionStorage`, never through public URLs or analytics payloads.
3. **Draft safety.** The Rich Editor handoff now preserves existing Rich Editor work before staging incoming content.
4. **Templates already lead into creation.** The template library opens the selected template in Card Studio rather than becoming a second renderer.
5. **Creation roles are increasingly outcome-specific.** WhatsApp, Instagram, Facebook and Name Art use a shared rendering engine while exposing role-specific controls.
6. **New browser-first tools were explicitly conceived as a workflow.** `WU-TOOLS-EXPANSION-001` already describes Capture → Fix → Write → Export and requires an Open in WriteUrdu handoff.
7. **Planned drafts are local-first.** `WU-DRAFT-001` extends existing browser-local drafts instead of replacing them and requires explicit user choice before cloud persistence.

### 2.2 Current fragmentation

The current system also exposes the reason a new governing initiative is necessary.

#### Discovery fragmentation

The shared header still starts from implementation names: Write Urdu, Rich Text Editor, Urdu Keyboard, Card Studio, Invoice Generator, Stylish Urdu Text, Name Art, social makers, Templates, QR Generator and utilities. This accurately lists products but makes a first-time visitor translate a real-world goal into WriteUrdu's architecture.

#### Handoff fragmentation

There are at least two handoff mechanisms in current source:

- `js/card-studio-entry.js` maintains destination-specific keys for Rich Editor, Card Studio, Stylish Text and Name Art;
- `js/text-handoff.js` maintains a separate generic text-handoff key and currently consumes it on the basic editor and Text Cleaner.

Both are reasonable implementations in isolation. Together they show the absence of one destination capability registry and one payload contract.

#### Journey UI fragmentation

The existing `Your next step` panel is an important foundation, but it is attached to a limited set of writing routes and exposes a mostly static set of creation destinations. New capture/fix/work/publish tools need context-sensitive progression rather than simply being added as more buttons.

#### Persistence fragmentation

Current local drafts are intentionally editor-specific. Short-lived handoffs are session-scoped. Future cloud drafts are planned for basic/rich/keyboard editors. Visual projects, invoice data and share artifacts have different state models. V2 must therefore define a **continuity layer**, not force everything into one universal database record.

---

## 3. External UX research and benchmark synthesis

External patterns are used here as design evidence and benchmark material, not as proof of WriteUrdu user behavior. WriteUrdu decisions still require product telemetry and usability validation.

### 3.1 Design around the user's outcome, not the implementation

GOV.UK's user-needs guidance defines a useful service need around what the person is trying to achieve and explicitly recommends wording needs in language users would recognize. Its Service Standard further says to understand the full context of what the user is trying to achieve rather than only the interaction with the service.

**Implication for WriteUrdu:** primary navigation should use stable outcome concepts — Write, Create, Work, Learn — while implementation/tool names remain useful as secondary labels, SEO page identities and expert shortcuts.

Sources:

- GOV.UK Service Manual — Learning about users and their needs: https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs
- GOV.UK Service Standard — Understand users and their needs: https://www.gov.uk/service-manual/service-standard/point-1-understand-user-needs

### 3.2 Solve the whole problem, but do not build a giant screen

The GOV.UK Service Standard says services should solve the whole user problem rather than be designed around technologies or preselected solutions. It also warns against creating large complicated services that try to do too much.

**Implication:** WriteUrdu should connect capture, writing, creation and publishing, but retain focused workspaces. The answer is continuity between workspaces, not a super-editor containing OCR + invoice + Card Studio + QR + every other control at once.

Source:

- GOV.UK Service Standard — Solve a whole problem for users: https://www.gov.uk/service-manual/service-standard/point-2-solve-a-whole-problem

### 3.3 A clear end-to-end journey reduces the need for global navigation

The GOV.UK Design System's service-navigation guidance recommends simplifying a journey before adding more navigation. When tasks have a meaningful progression, task-oriented progression is more useful than making users navigate around the service.

**Implication:** global navigation helps a user choose a starting outcome. Once they are working, the workspace should expose the next relevant action directly. Returning to a mega-menu should be optional, not the normal workflow.

Sources:

- GOV.UK Design System — Navigate a service: https://design-system.service.gov.uk/patterns/navigate-a-service/
- GOV.UK Design System — Task list: https://design-system.service.gov.uk/components/task-list/

### 3.4 Familiar concepts, consistency, feedback and recovery matter more as the product expands

Apple's Human Interface Guidelines emphasize familiar concepts, consistent interactions, clear feedback and recovery from mistakes. These principles are especially important for cross-workspace handoffs because a transition can otherwise feel like the user has left one product and entered another.

**Implication:** every Continue action should behave the same way; every destination should acknowledge what arrived; and prior work must be recoverable when incoming content would replace it.

Source:

- Apple Human Interface Guidelines — Design principles: https://developer.apple.com/design/human-interface-guidelines/design-principles

### 3.5 Do not hide so much UI that users pay an interaction-cost penalty

Nielsen Norman Group's work on reduced-chrome/"zen" interfaces notes that hiding interface elements can increase interaction cost, cognitive load and attention switching when users must repeatedly reveal controls.

**Implication:** WriteUrdu should protect the active authoring surface from noise, but not hide the current task's essential actions or bury every next step. Progressive disclosure should separate essential vs advanced controls, not make basic completion undiscoverable.

Source:

- Nielsen Norman Group — Why Zen Mode Isn't the Answer to Everything: https://www.nngroup.com/articles/zen-mode/

### 3.6 Mature creation products lead with output intent, templates and direct editing

Current Canva and Adobe Express acquisition surfaces are organized around outputs such as Instagram posts, social media, photo, video, print, business and education rather than exposing internal rendering technology. Templates move directly into editable work. Adobe's current flow for generated templates is Generate → choose → Edit template → Download, and its social-post maker starts by choosing the kind of post, then templates/editing, then saving/sharing.

**Implication:** Card Studio can remain the broad rendering owner while task starters say "Make a poetry image", "Create an Instagram post", "Make a school announcement" or "Create a Facebook post". New intent does not automatically require a new renderer or even a new indexable route.

Sources:

- Canva — Instagram Post Creator: https://www.canva.com/create/instagram-posts/
- Adobe Express — Create: https://www.adobe.com/express/create
- Adobe Express — Social Media Post Maker: https://www.adobe.com/express/create/post
- Adobe Express — Create editable templates with generative AI: https://helpx.adobe.com/express/web/create-with-templates/text-to-template.html

### 3.7 Draft continuity should feel automatic locally, while cloud behavior remains explicit

Google Docs' current help describes automatic saving while editing and on-device saving when offline. Microsoft Word's recovery guidance emphasizes AutoSave/Document Recovery so unexpected interruption does not cost work.

**Implication:** the user should not need to think about persistence during normal browser-local writing. A cross-workspace action must never make the user trade continuity for safety. Cloud persistence can remain optional and explicit as already planned.

Sources:

- Google Docs Editors Help — Create, view, or download a file: https://support.google.com/docs/answer/49114
- Microsoft Support — Recover your Word files and documents: https://support.microsoft.com/en-us/word/recover-your-word-files-and-documents

### 3.8 Cross-workspace feedback must be accessible

WCAG guidance requires logical focus order and supports programmatically announced status messages so users can understand changes without hunting around the page.

**Implication:** destination acknowledgement such as "Your Urdu text is ready to format" should use a consistent accessible status pattern. Imported content should appear in a predictable position and focus should move only as a consequence of the explicit Continue action.

Sources:

- W3C WAI — Understanding SC 2.4.3 Focus Order: https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html
- W3C WAI — Status Messages / ARIA role=status: https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA22

---

## 4. Recommended WriteUrdu mental model

### 4.1 Primary product outcomes

Use four stable primary navigation categories:

1. **Write** — get Urdu text into a usable written form.
2. **Create** — turn Urdu into a visual or shareable creative artifact.
3. **Work** — complete structured practical documents/tasks.
4. **Learn** — understand Urdu typing, alphabet, transliteration and product guidance.

`My drafts` is not a fifth content category. It is a signed-in/local continuity utility and should live in the account/utility area when available.

### 4.2 Stage model beneath the navigation

The internal product architecture should use a more precise stage model:

- **Capture** — obtain Urdu text.
- **Fix** — normalize or repair text.
- **Write / Refine** — compose and format.
- **Create** — make a visual/social artifact.
- **Work** — make a structured document such as an invoice.
- **Publish / Use** — copy, download, QR, share.
- **Resume** — local history and My Drafts.
- **Learn** — lateral support at any stage.

This stage model is primarily for product design and handoff logic. It does not need to become another navigation taxonomy visible to users.

---

## 5. Outcome-led navigation proposal

### 5.1 Desktop header

```text
Write Urdu      Write      Create      Work      Learn                         My drafts / Account   اردو
```

Keep global navigation deliberately small. Search/More can remain secondary utilities if necessary.

### 5.2 Write menu

Use outcome label first, existing tool identity second where useful:

- **Start writing in Urdu** — Roman Urdu → Urdu writer
- **Type directly in Urdu** — Urdu Keyboard
- **Format an assignment or document** — Rich Text Editor
- **Speak and turn it into Urdu text** — Voice Typing
- **Extract Urdu text from an image** — Urdu OCR
- **Fix spacing, RTL and Unicode issues** — Urdu Text Cleaner
- **Convert legacy InPage text** — InPage ↔ Unicode

The first three should be visually dominant. Capture/fix utilities can sit under "More writing tools" when the menu becomes too long.

### 5.3 Create menu

- **Make a poetry or quote image** — Card Studio
- **Create a WhatsApp Status**
- **Create an Instagram post**
- **Create a Facebook post** — Card Studio role preset; no new SEO owner required
- **Make Urdu Name Art / DP**
- **Create stylish copyable Urdu text**
- **Start from a template**
- **Turn text or a link into a QR code**

### 5.4 Work menu

The Work category should stay deliberately small until real jobs justify expansion:

- **Create an Urdu / English invoice** — Invoice Generator
- **Write a school announcement** — intent starter into the appropriate editor/template, not automatically a new generator
- **Write a notice or formal document** — Rich Editor starter/template

Do not manufacture a separate route for every work intent. Prefer role presets and templates until search/product evidence supports a distinct owner.

### 5.5 Learn menu

- Learn the Urdu alphabet
- Roman Urdu / transliteration guide
- Urdu fonts: Nastaliq vs Naskh
- Typing tutorial
- Documentation
- FAQ

Learn pages should contain direct task exits such as Start typing, Open keyboard, Try this in Rich Editor or Create a card.

---

## 6. Workspace progression model

### 6.1 One shared component: `Continue with…`

Every interactive workspace should implement a shared progression region after the primary task/result boundary.

Rules:

1. Maximum **three immediately visible next actions**.
2. One action may be visually primary.
3. Additional relevant destinations sit behind **More options**, not another six-card grid.
4. Actions use outcomes first: "Format this as a document" rather than only "Rich Text Editor".
5. The action states what will carry forward when useful: "Create a card with this text".
6. The panel must not become sticky during active typing/design work.
7. On mobile it appears after the primary result/actions, not as a second fixed toolbar.
8. If there is no transferable content, do not present a misleading Continue action. A normal link may still be shown as a discovery action.
9. Recommended actions are context-sensitive by source, content state and completion state.
10. Never show a transition only because it increases pageviews.

### 6.2 Destination acknowledgement

A successful transfer should produce a consistent inline/status acknowledgement:

- "Your Urdu text is ready to format."
- "Your cleaned Urdu text is ready to write."
- "Your template is open with your text."
- "Your OCR text is ready to review."

If prior destination work was preserved, make recovery clear:

- "We kept your previous Rich Editor draft in Recent drafts."

Do not use an interruptive modal for normal successful handoffs.

### 6.3 Back/recovery contract

A transition is not successful merely because the destination loaded.

A good cross-workspace continuation must guarantee:

- source work remains saved according to the source's normal persistence model;
- destination content is not silently overwritten without preservation/recovery;
- browser Back returns to a source state that still contains the user's work wherever browser/local persistence supports it;
- failed transfer does not delete source state;
- incompatible/stale payloads fail safely and explain what happened.

---

## 7. Current + planned workspace map

| Workspace / capability | User job | Stage | Primary inputs | Primary outputs | Natural next steps |
| --- | --- | --- | --- | --- | --- |
| Basic writer `/` | Write a message / simple Urdu text | Capture + Write | Roman Urdu, Unicode Urdu | Plain Urdu text | Rich Editor, Card, QR, Cleaner when needed |
| Urdu Keyboard | Type Unicode Urdu directly | Capture + Write | Keyboard input | Plain Urdu text | Rich Editor, Card, QR |
| Rich Editor | Assignment, report, formal text | Write + Work | Plain/rich text | Rich document, Word/PDF/PNG/print | Card for visual reuse, QR for text/link, copy/share |
| Text Cleaner / RTL Fixer | Repair pasted Urdu | Fix | Unicode text | Clean Unicode text | Basic writer, Rich Editor, Card, QR |
| Urdu OCR | Extract text from screenshot/image | Capture | Local image | OCR text | Review → Cleaner when issues → Basic/Rich |
| Voice Typing | Speak instead of type | Capture | Speech/browser recognition | Unicode/transcript text | Basic/Rich, Card, QR |
| InPage ↔ Unicode | Move between legacy/modern text workflows | Capture + Fix | Legacy/Unicode text | Converted text | Unicode → Cleaner/Basic/Rich; InPage output → copy/download |
| Urdu ↔ Hindi R&D | Script conversion | Transform | Urdu/Hindi text | Converted text | Basic/Rich after quality gate |
| Templates | Start from a known outcome | Create starter | Template selection + optional current text | Template/project seed | Correct Card/Social role workspace |
| Card Studio | Poetry, quote, announcement, text-on-photo | Create | Text + template/media | Image/project | Download, public share, caption/copy, QR of published link where relevant |
| WhatsApp Status | Status/greeting image | Create | Text + visual project | 1080×1920 image | Download/share, caption/text copy |
| Instagram Post | Instagram visual | Create | Text + role project | Platform image | Download/share, caption copy |
| Facebook role | Facebook visual | Create | Text + role project | 1200×630 image | Download/share, caption copy |
| Stylish Urdu Text | Copyable decorative Unicode text | Create/Transform | Text | Styled Unicode variants | Copy, Name Art, Card |
| Name Art | Name/DP/profile image | Create | Name/text | Image | Download/share, optional matching Card |
| QR Generator | Turn payload into scannable artifact | Publish/Use | Text, URL, contact/payment payload | QR PNG/SVG | Download/share; return to source if relevant |
| Invoice Generator | Structured invoice | Work | Structured invoice fields | Invoice PDF/image/print | Embedded payment QR, export/share; not generic Rich Editor handoff |
| Public Share Page | Publish/receive an artifact | Publish/Distribution | Published artifact | Branded public link | Use this text / Create your own in correct owner workspace |
| Local drafts/history | Recover current work | Resume | Local workspace state | Restored work | Resume owning workspace |
| My Drafts | Resume across devices | Resume | Cloud-enabled writing draft | Restored editor state | Owning editor |
| Learn pages | Understand and gain confidence | Learn | Information need | Knowledge + task start | Contextual writing/creation route |

---

## 8. Handoff graph — recommended edges

The graph must be curated. "Everything links to everything" is not a coherent journey.

### 8.1 Core P0 edges

#### Basic writer

- Basic → Rich: **primary** when user needs formatting/document export.
- Basic → Card: strong creative branch.
- Basic → QR: useful transformation for text.
- Basic → Cleaner: contextual/secondary, especially for pasted/imported Unicode rather than normal transliteration output.

#### Urdu Keyboard

- Keyboard → Rich.
- Keyboard → Card.
- Keyboard → QR.

#### Rich Editor

- Rich → Card using plain/selected text; explicitly disclose that complex formatting does not map to a visual card.
- Rich → QR using selected/current plain text.
- Rich → export/share inside the same workspace.
- Do **not** present Rich → Invoice as a generic recommendation. Invoice is a structured-data job, not a normal continuation of prose.

#### Cleaner

- Cleaner → Basic writer.
- Cleaner → Rich Editor.
- Cleaner → Card.
- Cleaner → QR.

#### OCR

- OCR → Cleaner when normalization/quality checks find issues.
- OCR → Basic writer for simple editing.
- OCR → Rich Editor for document formatting.
- Avoid forcing Cleaner when OCR output is already usable.

#### Templates

- Template → correct direct creation owner with `templateId` + optional carried text.
- Social-specific template → corresponding role state when that creates a better direct task than generic Card Studio.

#### Card / social creation

- Completion actions remain inside the workspace: download, caption/text copy, local share.
- Public publish is an explicit later action under `WU-SHARE-001`.
- QR from a published artifact should encode the stable public share URL, not an internal session identifier.

#### Invoice

- Payment QR is an **embedded capability**, not a workspace hop.
- Export/print/share remain inside Invoice.
- No default Invoice → Rich or Rich → Invoice path.

### 8.2 Planned/new-tool edges

#### Voice Typing

- Voice → Basic or Rich depending whether the user wants a message or document.
- Card/QR may be offered only after usable text exists.

#### InPage ↔ Unicode

- InPage → Unicode result → Cleaner / Basic / Rich.
- Unicode → InPage is normally an endpoint for a legacy workflow; copy/download is more important than forcing another WriteUrdu destination.

#### Urdu ↔ Hindi conversion

- If the R&D gate passes, treat it as a transform node with an explicit review step before opening converted output in the editor.

#### My Drafts

- Draft metadata routes to the owning editor and restores through the editor adapter layer.
- My Drafts must not become a universal project store for invoices/images unless those formats receive deliberate storage contracts later.

#### Public share

- Recipient CTA must map artifact type back to the right owner:
  - text share → basic/rich depending presentation;
  - Card artifact → Card Studio / matching role;
  - "Use this text" → appropriate writing surface;
  - "Create your own" → same creation role with a copy/remix seed where allowed.

---

## 9. Handoff vs transformation vs embedded capability

Every proposed cross-tool connection must be classified before implementation.

### Handoff

The user is continuing the same work in a better-suited workspace.

Examples:

- Basic → Rich
- OCR → Rich
- Cleaner → Card
- Template → Card Studio

### Transformation

The user creates a derivative representation.

Examples:

- editor text → QR
- text → Stylish Unicode variants
- text → Name Art image
- document text → Card image

The source remains valid; the derived result should not imply the source was "moved".

### Embedded capability

The functionality is part of completing the current job and should not become a navigation transition.

Examples:

- Invoice → payment QR section
- Card Studio → caption copy
- social maker → safe-area validation
- Rich Editor → Word/PDF export

This classification prevents accidental product fragmentation.

---

## 10. Unified continuity architecture recommendation

### 10.1 Do not build one universal document database

Different product surfaces own different state:

- basic/rich/keyboard text drafts;
- Card Studio visual projects;
- social-role project state;
- invoice structured fields;
- QR payload/configuration;
- short-lived handoff payloads;
- optional cloud writing drafts;
- public share artifacts.

The unifying layer should therefore be **handoff capability + provenance + recovery**, not a single schema that pretends all content is the same.

### 10.2 Introduce one `WorkspaceHandoff` runtime

Replace destination-specific handoff growth with a central module and registry.

Conceptual payload:

```json
{
  "version": 2,
  "id": "ephemeral-id",
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
    "text": "browser-local user content"
  },
  "context": {
    "templateId": null,
    "role": null
  }
}
```

The actual implementation may use destination-keyed session storage for simplicity, but producers/consumers must use the shared API rather than inventing new keys.

### 10.3 Supported payload kinds

Start narrow:

- `plain-text`
- `rich-text` where the destination explicitly supports safe HTML
- `template-seed`
- `visual-project-seed`
- `structured-seed` only for explicitly compatible workspaces

Do not serialize arbitrary DOM state.

### 10.4 Destination capability descriptor

Every interactive workspace should declare something equivalent to:

```text
workspace id
outcome category
accepted payload kinds
produced payload kinds
primary user jobs
natural next actions
embedded capabilities
persistence owner
import conflict policy
```

New tools are incomplete until this descriptor and journey behavior are specified.

### 10.5 Safety rules

- default TTL: 30 minutes for user-content handoffs unless a feature proves another need;
- one-time consume after successful validation/import;
- incompatible target must not consume a still-valid payload;
- content never enters URL/query/hash;
- content never enters analytics;
- existing target work is preserved or the user explicitly chooses replacement;
- source state remains intact;
- storage failure cannot silently imply successful transfer;
- destination verifies payload size/type/version;
- only bounded non-content metadata can be emitted to telemetry.

---

## 11. Mobile UX contract

Mobile should be treated as the primary constraint for these journeys, not a desktop layout compressed later.

1. One top-level task scroll context.
2. Input / current result appears before educational content.
3. The essential current-task actions remain visible without repeatedly opening advanced drawers.
4. `Continue with…` appears after the task/result boundary, not over the keyboard or canvas.
5. Maximum three visible next actions.
6. No large mega-menu of every tool after each workspace.
7. Incoming-content acknowledgement is compact and non-modal.
8. Browser Back restores/reveals source state where persistence permits.
9. Touch targets and focus order remain logical in both LTR shell and RTL content.
10. No horizontal overflow at Pixel 5-class widths.
11. No nested WriteUrdu iframe/application shell.
12. Long creation workspaces keep export/completion reachable without making the next-step panel sticky.

---

## 12. Accessibility contract

- Use semantic links for navigation and buttons for stateful transfer actions.
- Status acknowledgement uses an accessible live/status pattern.
- Never trigger navigation merely by receiving focus.
- Focus order follows the visual/task order.
- When an explicit Continue action loads a destination, focus may enter the imported editor/result once the destination has announced what happened.
- Do not rely on color to distinguish primary vs secondary next steps.
- Provide meaningful accessible names such as "Create a card with this text" rather than "Continue" repeated five times.
- Urdu content direction and shell-language direction must remain independently correct.
- Handoff failure/recovery controls are keyboard accessible.

---

## 13. Analytics and success measurement

The existing privacy rule is correct: user text never belongs in journey telemetry.

### 13.1 Event model

Extend the current bounded journey vocabulary around events such as:

- `next_step_impression`
- `handoff_started`
- `handoff_imported`
- `handoff_failed`
- `handoff_recovered_previous_work`
- `workspace_completed`
- `result_copied`
- `result_downloaded`
- `publish_started`
- `publish_completed`

Bounded dimensions only:

- source workspace;
- destination workspace;
- journey/action ID;
- payload kind;
- has transferable content boolean;
- device class;
- failure/recovery reason from a small enum.

Never include text, HTML, filenames, image data, OCR output, transcript, URLs containing user payloads or persistent identity.

### 13.2 Product metrics

Prioritize:

1. successful task completion by workspace;
2. next-step action rate after a completed/usable result;
3. handoff import success rate;
4. second-workspace completion after a handoff;
5. recovery/overwrite incidents;
6. mobile vs desktop journey drop-off;
7. repeat/resume behavior;
8. public-share reproduction loop when `WU-SHARE-001` ships.

Page depth is useful only when it corresponds to a useful second task. Do not optimize this system for extra pageviews alone.

Do not set arbitrary adoption targets before a clean baseline exists. Transport/recovery correctness, however, should be treated as a release-quality requirement rather than an experiment.

---

## 14. Research validation plan

Repository/source analysis cannot substitute for user research. The P0 implementation should include lightweight validation in parallel.

### Round A — information architecture / task finding

Test outcome labels without implementation clues.

Representative tasks:

- "I want to write a WhatsApp message in Urdu."
- "I need an Urdu school announcement."
- "I have a photo with Urdu text and want to edit the words."
- "I want to make a poetry image."
- "I need an invoice."
- "I want to type Urdu directly on my phone."
- "I want to learn the alphabet."

Measure first-choice category and destination confidence. Use card sorting/tree testing before adding more header categories.

### Round B — continuity prototype

Test five core flows on mobile and desktop:

1. Basic writer → Rich Editor → PDF/Word.
2. Basic writer → Card Studio → image export.
3. OCR → review/clean → Rich Editor.
4. Template → Card Studio → export/caption.
5. Editor → QR → download.

Observe whether users understand that their content carried forward and whether they can recover prior target work.

### Round C — new-tool integration

As new tools ship, test the complete job rather than only the tool screen:

- image → OCR → corrected text → message/document;
- voice → text → card/message;
- InPage → Unicode → clean → edit;
- public share recipient → use text/remix → publish again.

### Research principle

If participants repeatedly return to the global menu between known sequential tasks, the journey handoff is still failing even if every destination is technically discoverable.

---

## 15. SEO and mature-route guardrails

Outcome-led UX must not sacrifice established search ownership.

- Keep existing canonical routes unless separate SEO evidence supports consolidation.
- Keep explicit page titles/H1s such as Urdu Keyboard, Urdu OCR, Urdu Text Cleaner and Urdu Invoice Generator where they are useful query owners.
- Change global-navigation grouping/labels without changing established destination URLs.
- Intent starters such as School announcement or Facebook post may be presets/deep states rather than new indexable routes.
- Do not create doorway pages for every journey node.
- Internal links should remain crawlable when they are useful standalone destinations; stateful content transfer itself stays local and URL-free.
- Public share pages follow their own noindex/distribution contract.

---

## 16. Monetization guardrails

The journey must not become a pretext for more ad impressions.

- No ad inside active editor/canvas/input/result/action regions.
- No ad inserted between a result and its immediate completion actions.
- A post-workspace monetization boundary may remain after the useful task/next-step region where the existing AdSense operating contract permits it.
- Evaluate revenue together with task completion, handoff success and Core Web Vitals.
- A journey change that increases pageviews but reduces successful outputs is a product regression.

---

## 17. Strategic decisions from this research

### Adopt

- outcome-led global navigation: **Write / Create / Work / Learn**;
- `My drafts` as an account/continuity utility, not a fifth product category;
- one shared `Continue with…` pattern;
- a central handoff/capability registry;
- Capture → Fix/Refine → Create/Work → Publish/Use → Resume as internal journey architecture;
- explicit treatment of handoff vs transformation vs embedded capability;
- all current and planned browser-first tools as first-class journey nodes;
- state preservation/recovery as part of the handoff definition of done;
- mobile-first role completion and one-scroll-context rule;
- intent starters/presets before new routes when the rendering/workspace owner already exists;
- telemetry based on useful completion and continuity rather than circulation.

### Reject

- a header containing every tool;
- a `Next step` panel containing every tool;
- generic Rich Editor → Invoice as a default flow;
- making payment QR a separate invoice handoff;
- creating separate renderers for social/name/card outcomes;
- putting user content in URLs for convenience;
- auto-uploading local drafts as part of continuity;
- one giant universal document/project schema;
- new tools that ship without defined input/output/next-step contracts;
- new SEO routes merely because a role/preset exists.

---

## 18. Recommended P0 implementation order

1. **Governance:** approve `WU-PLAT-002` and make it the journey contract for new tools.
2. **Registry:** inventory every interactive workspace with accepted/produced content and natural next actions.
3. **Runtime:** consolidate current handoff mechanisms behind one shared API while retaining safe current behavior.
4. **Core continuation:** Basic/Keyboard/Rich/Cleaner/QR/Card/Templates.
5. **New-tool onboarding:** OCR first, then Voice and InPage using the same descriptor/runtime.
6. **Outcome navigation:** implement Write/Create/Work/Learn without changing canonical destination URLs.
7. **Contextual next steps:** replace static/generic journey lists with source/result-aware recommendations.
8. **Recovery/accessibility:** consistent target acknowledgement, history preservation and status/focus contract.
9. **Persistence integration:** local draft adapters first; later My Drafts opens through the same workspace ownership model.
10. **Publish integration:** connect Card/editor public-share journeys when `WU-SHARE-001` is implemented.
11. **Measurement:** compare task completion, handoff success and second-workspace completion before/after rollout.
12. **Research:** tree-test the IA and run role-flow usability checks on desktop + mobile before declaring P0 complete.

---

## 19. Final product statement

WriteUrdu V2 should feel like one Urdu workspace with specialized rooms, not a directory of unrelated utilities.

A user should be able to arrive with a real job — type a message, extract text from an image, fix broken Urdu, make a poetry card, prepare an assignment, create a social post, produce an invoice — and move toward the finished outcome without learning the site's implementation architecture or manually carrying their work between WriteUrdu surfaces.

The unit of product design is therefore no longer **the tool**.

It is **the user's job and the continuity of their work across the capabilities required to finish it**.
