# WriteUrdu role-based discovery and task-value audit

**Audit date:** 2026-08-13  
**Status:** Living audit — discovery + task-completion pass  
**Scope:** Current public WriteUrdu experience and current `main` implementation  
**Purpose:** Judge the product as users with real jobs, not as users who already know WriteUrdu's internal tool names.

---

## 1. Roles audited

This audit follows four primary users from intent to useful output:

1. **Student preparing an Urdu assignment** — needs to write Roman Urdu/Urdu, format a document, preserve work and export Word/PDF.
2. **Facebook / Instagram marketer** — needs to create a social post with Urdu text, usable dimensions, a credible visual result and an export suitable for posting.
3. **Ordinary individual preparing a message for friends in WhatsApp** — primarily wants Urdu text to copy/share; a separate branch covers a WhatsApp Status/greeting image.
4. **Individual creating Urdu Name Art / a DP/profile image** — wants to enter a name, choose an attractive style and download the result with very little design-tool knowledge.

The first pass asks **Can the user find the correct tool?**  
The second pass asks **Once there, can the user achieve the wanted result with minimum friction?**

---

## 2. Method

Evidence used:

- current public pages where externally retrievable;
- current repository source on `main`;
- existing desktop and Pixel 5 Playwright acceptance contracts;
- current journey/handoff, editor, Card Studio, social-maker and Name Art implementation contracts.

This is not yet a moderated human usability study. Findings labelled **Observed implementation** are directly supported by current source/tests. Findings labelled **UX inference** are conclusions from the current interaction structure and should be validated on real devices during implementation.

Scoring dimensions:

- discoverability of the correct starting point;
- clarity of first action;
- time/actions to first useful output;
- number of decisions required before value;
- continuity when moving between tools;
- confidence that the result matches the intended destination;
- export/share completion;
- mobile friction;
- need to understand WriteUrdu-specific terminology.

---

# Part A — discoverability / navigation findings

## 3. Overall discovery result

The individual products are now stronger than the navigation around them.

| Role | Finding the correct starting point | Main discovery problem |
|---|---:|---|
| Student / assignment | 8/10 | Site says “Rich Text Editor” more often than “assignment / homework / report”. |
| Instagram marketer | 6/10 | Dedicated capability exists but is hidden under the Create taxonomy and absent from the homepage task map. |
| Facebook marketer | 5/10 | Facebook-compatible dimensions/templates exist, but there is no obvious Facebook journey. |
| WhatsApp chat message | 8/10 | Homepage is the right tool but message-vs-Status distinction is not explicit before choosing. |
| WhatsApp Status image | 5/10 | Strong dedicated tool; weak homepage discovery. |
| Name Art / DP | 5/10 | Strong destination hidden under Create; absent from the homepage’s primary tool map. |

### Discovery finding D1 — homepage describes products more than user jobs

The homepage is excellent at explaining Roman Urdu → Urdu script, but the main chooser still uses product concepts such as Rich Text Editor, Card Studio, Template Library and QR Generator.

A user thinks:

- “I need to finish my Urdu assignment.”
- “I need a Facebook/Instagram post.”
- “I want to send an Urdu message in WhatsApp.”
- “I want my name as a DP.”

They should not have to translate those goals into our architecture first.

**Recommendation:** add a compact, task-led **What do you want to make?** layer after the primary writing task.

### Discovery finding D2 — `Create` is not a consistent taxonomy

The shared navigation places Stylish Text, Name Art, WhatsApp Status and Instagram under **Create**, while Card Studio and Templates — clearly creation products — live outside that group.

**Impact:** first-time users cannot form a predictable mental model of the navigation.

### Discovery finding D3 — mobile creative discovery is too deep

Creative destinations such as Name Art, Instagram and WhatsApp Status require **Menu → Create → tool** on mobile.

These are some of the most mobile-native roles on the site.

### Discovery finding D4 — documentation still represents the old writing-centric product

Documentation strongly explains Basic Editor / Keyboard / Rich Editor, but the product now includes substantial creation and utility surfaces. It no longer acts as a complete map of WriteUrdu.

### Discovery finding D5 — hidden capability is not helping perception

The template library already supports Poetry, Social, Religious/Seasonal, Education, Business and Events, including social output dimensions. The homepage does not expose this breadth clearly enough.

### Discovery finding D6 — WhatsApp chat and WhatsApp Status are different jobs

The correct path for a normal message is the homepage writer + Copy/Share. The WhatsApp Status Maker creates a 1080×1920 image. This distinction is clear *inside* the Status Maker but not clear enough before tool selection.

### Discovery finding D7 — Urdu locale page-copy coverage has gaps

The shared locale layer falls back to homepage page-copy when a public route is not registered in `pageCopy`. Modern routes such as Stylish Text and Name Art need explicit localized page identity rather than relying on fallback behavior.

---

# Part B — value and minimum-friction audit inside the tools

## 4. Student preparing an Urdu assignment

### Desired result

Write a substantial Urdu assignment, add headings/formatting, preserve work, and export a file suitable for submission or printing.

### Best current path

`Homepage / Rich Editor → Roman Urdu transliteration → formatting → Word/PDF/Print`

### What works well

**Observed implementation**

- Both the basic and rich editors support Roman Urdu → Urdu script and direct input modes.
- Longer Roman Urdu passages can be converted in one step rather than word-by-word.
- Rich Editor exposes headings/fonts/colour/alignment through the editor plus Word, PDF, PNG and print export.
- Editor productivity support includes local drafts, recent drafts, word/character count, find/replace, import text, focus mode, punctuation and spacing cleanup.
- Share is available after the text is complete.

### Does the student get value?

**Yes, if they begin in the Rich Editor.** The Rich Editor is capable of producing a submission-ready document with relatively little conceptual overhead.

### Critical friction S1 — Basic → Rich does not preserve the draft automatically

**Observed implementation**

The homepage says users can move a finished draft into richer formatting “without starting over”, but the contextual handoff runtime currently defines destinations for:

- Card Studio;
- Stylish Text;
- Name Art.

It does **not** define Rich Editor as a text-handoff destination.

Editor local drafts are also keyed by editor kind (`basic`, `rich`, etc.), which means the existence of a basic-editor draft does not itself populate the Rich Editor.

**User consequence:** a student who writes the assignment in the basic editor and then decides to format it is likely to have to copy/paste manually.

**Severity:** **P0/P1 usability** because it contradicts the stated continuity promise and affects a core role.

**Recommended fix:** first-class Basic → Rich handoff using the same short-lived browser-session pattern already used successfully for Card Studio/Stylish/Name Art. Add a visible action such as **Continue formatting in Rich Editor** that carries the text locally and consumes it once.

### Friction S2 — role language comes too late

The Rich Editor explains documents and reports after the user arrives, but the homepage does not strongly say **Assignment / homework / report** at the decision point.

**Recommended fix:** task-led homepage card and contextual CTA.

### Friction S3 — mobile completion is not proven at the role level

Current browser acceptance protects layout and broad product behavior, but there is no dedicated Pixel 5 role test that:

`writes multi-paragraph assignment → formats heading/body → exports Word/PDF`.

**Recommendation:** add a role acceptance test after the Basic → Rich handoff is implemented. Real-device export should also be checked because browser download behavior varies.

### Student score

| Dimension | Score |
|---|---:|
| Once in Rich Editor | 8.5/10 |
| Direct assignment completion | 8/10 |
| Basic → Rich continuity | 4/10 |
| Export coverage | 9/10 |
| Overall role journey today | **7/10** |

**Verdict:** real value is present. The major friction is not document capability; it is continuity into the correct document workspace.

---

## 5. Instagram / Facebook marketer

This role should be split into **one-off social creator** and **repeat marketer**, because their needs differ materially.

### 5.1 Instagram one-off post

### Desired result

Create a credible Urdu square/portrait/story image, optionally reuse the text as a caption, download it and post it.

### What works well

**Observed implementation**

- Dedicated Instagram mode defaults to a **square** preset and a usable minimal template.
- A sample Urdu text is provided when no incoming text exists, so the first preview is not blank.
- Instagram mode knows square, portrait and story safe areas.
- Card Studio provides Roman Urdu/direct input, templates, local backgrounds, Urdu-safe fonts, text positioning and PNG/JPEG output.
- **Copy caption text** reduces the need to retype the wording after creating the image.
- The product explicitly says it does not connect to Instagram or post on the user’s behalf, preventing false expectations.
- Card Studio starts in **Quick mode**, hiding advanced controls until requested.

### Does the Instagram user get value?

**Yes.** A one-off Instagram creator can produce a correctly sized, shareable Urdu post without an account and without understanding image dimensions first.

### Friction M1 — dedicated social pages embed the full Card Studio

**Observed implementation / UX inference**

Instagram and WhatsApp routes place Card Studio inside an iframe. On mobile the social iframe is explicitly given a large fixed height (1120px) while Card Studio itself becomes a vertically stacked mobile interface.

This avoids horizontal overflow, but it creates an outer-page/inner-workspace architecture and a risk of long/nested scrolling on real phones.

**Severity:** P1 usability validation.

**Recommended fix direction:** preserve the shared renderer but move toward a single-shell embedded mode where the social route owns the page chrome and Card Studio contributes only the creation workspace, not an entire page-level application frame.

### Friction M2 — Facebook requires product knowledge

**Observed implementation**

Card Studio already has:

- `Wide Social Post` / 1200×630 preset;
- Social Post use case;
- business/social templates in the template library.

But there is no equivalent Facebook-directed workflow. A Facebook marketer has to know to open Card Studio and choose the correct combination.

**Recommended fix:** initially surface **Facebook post** as a task/preset entry point into the existing renderer; do not build another renderer.

### Friction M3 — “Social post” defaults to square, not Facebook-wide

The guided Card Studio `social` use case applies square + minimal-white. That is sensible generically but does not solve the explicit Facebook job.

### Friction M4 — no marketer brand layer

For one-off posts the product is useful. For repeat marketing work, there is no obvious own-logo / saved brand-colour / reusable brand-preset workflow.

This is not necessary for the first navigation uplift, but it limits recurring professional value.

### Friction M5 — carousel support is only partial

The Instagram page can describe or produce a carousel cover, but WriteUrdu is not currently a multi-slide carousel composition workflow.

Do not imply a full carousel builder unless implemented.

### Marketer score

| Scenario | Score |
|---|---:|
| One-off Instagram post | **8/10** |
| Instagram on mobile | 7/10 pending real-device nested-scroll validation |
| One-off Facebook post | **6/10** |
| Repeat professional marketer | **5.5/10** |

**Verdict:** the rendering value is strong. Friction is primarily platform entry-point clarity, iframe architecture on mobile, and lack of reusable branding for repeat work.

---

## 6. Ordinary person sending an Urdu WhatsApp message

### Desired result

Type a short message using Roman Urdu, get correct Urdu script, and send/copy it into WhatsApp.

### Best current path

`Homepage → type Roman Urdu → Copy text / Share → WhatsApp`

### What works exceptionally well

**Observed implementation**

- Homepage starts directly at the writing task.
- Roman Urdu converts into Urdu script.
- Copy Text is prominent.
- Share uses the browser/device **Web Share API** when available.
- If Web Share is unavailable, the implementation falls back to a WhatsApp share URL containing only the encoded text.
- If sharing is blocked, the UI tells the user to copy manually.
- No WriteUrdu account, WhatsApp login or contact permission is required by the site.

### Does the user get value?

**Yes — with very low friction.** This is currently one of the strongest end-to-end jobs on WriteUrdu.

On a normal mobile browser the expected flow is roughly:

`type → press Space as needed → Share → choose WhatsApp/contact`

or simply:

`type → Copy → paste in WhatsApp`.

### Friction W1 — generic Share vs explicit WhatsApp

Web Share correctly opens the device share sheet rather than forcing WhatsApp. This is good platform behavior, but the current button uses a WhatsApp visual cue while its primary behavior can be generic Share.

**Recommendation:** keep Web Share, but label the user goal more clearly where appropriate — e.g. **Share message** with explanatory destination copy, rather than implying guaranteed direct WhatsApp routing on every browser.

### Friction W2 — message vs Status selection can send a user to the wrong product

This is primarily a discoverability problem. Once the user is on the homepage, ordinary message completion is excellent.

### WhatsApp chat score

**9/10** once the user is on the homepage.

**Verdict:** preserve this simple flow. Do not over-design it.

---

## 7. Person making a WhatsApp Status / greeting image

### Desired result

Create a tall Urdu greeting/poetry/reminder image and post it as WhatsApp Status.

### What works well

**Observed implementation**

- Dedicated mode defaults to 1080×1920 story/status.
- Midnight template and sample Urdu text provide an immediate non-empty starting state.
- Safe-area dimensions are defined specifically for WhatsApp Status.
- User can download PNG/JPEG and manually upload it.
- The page clearly explains that WriteUrdu does not post to WhatsApp.

### Does the user get value?

**Yes.** It is a good one-off Status creator once found.

### Main friction

Same embedded-Card-Studio/mobile-scroll concern as Instagram, plus the site-level risk of confusing this image workflow with an ordinary WhatsApp chat message.

### WhatsApp Status score

**8/10 once landed; 5/10 discoverability.**

---

## 8. Individual making Urdu Name Art / DP

This is where the difference between **product capability** and **minimum-friction product design** is most obvious.

### Desired result

Enter a name, choose an attractive Urdu style/profile layout, see the result, and download it.

### What works well

**Observed implementation**

- 24 original templates across 12 packs.
- Six output presets including Profile square and transparent 1600×900.
- Real Urdu-safe font rendering rather than pretending Unicode decorations are fonts.
- Local background support.
- PNG and transparent PNG export.
- Direct handoff from Stylish Text works: selected text is stored in short-lived session storage, consumed once and inserted into the embedded Card Studio.
- Existing tests verify the handoff and exact preset/template counts.

### Does the user get value?

**Yes, but the direct-entry experience makes the user work harder than the product should.**

The best Name Art experience today is actually:

`Stylish Text → choose result → Name Art`

because the name is already carried into the design workspace.

A user who lands directly on Name Art has more friction.

### Critical friction N1 — no direct name field in the Name Art shell

**Observed implementation**

The outer Name Art page starts with:

- Template pack;
- Output size;
- Download controls;
- 24 template buttons.

The actual text field is inside the embedded Card Studio below/alongside this shell.

For the role “I want my name as a DP”, the natural first action should be **type my name**.

**Recommendation:** add a top-level **Your name / text** field to Name Art and synchronize it with the Card Studio state. Keep the full editor available for refinement.

### Critical friction N2 — mobile shows all 24 template choices before the workspace

**Observed implementation**

At <=900px, Name Art changes from desktop side-by-side layout to block layout. The shortcut section becomes non-sticky/non-scrolling, and the workspace follows it. The template grid contains all 24 items by default (two columns on common phones, one column below 390/420px depending the layered CSS rules).

**UX consequence:** a direct mobile user can encounter a long template chooser before reaching the actual place where the name is edited.

**Severity:** **P1 high** because Name Art/DP is inherently mobile-heavy.

**Recommendation:** mobile should be **name input → live preview/workspace → compact template carousel/filter**, not 24 textual template buttons before the editor.

### Critical friction N3 — template choices are mostly labels, not visual previews

**Observed implementation**

`js/name-art.js` renders each outer template button as template name + pack/font text. The outer buttons do not render image/visual thumbnails of the design.

A design user should not have to infer what “Royal Midnight”, “Warm Promise” or “Profile Clean” looks like from a label.

**Recommendation:** visual swatches/thumbnails or a fast preview-on-select interaction.

### Friction N4 — Download controls appear before successful personalization

Normal PNG download delegates straight to Card Studio. Transparent PNG has a stronger validation path and refuses empty/default text, but the normal outer Download PNG action does not perform the same Name-Art-specific “did the user actually enter a name?” check before delegating.

**Recommendation:** disable/guard both outer exports until the workspace is ready and personalized text is present.

### Friction N5 — DP intent should have a one-click starting path

The correct preset already exists: **Profile square 1080×1080**, and there is a **Social Profile** template pack.

A DP user should be able to choose **Profile / DP** and immediately receive that configuration instead of separately understanding pack + preset.

### Name Art score

| Entry path | Desktop | Mobile |
|---|---:|---:|
| Stylish Text → Name Art handoff | 8.5/10 | 8/10 |
| Direct Name Art landing | 6.5/10 | **4.5–5/10** |

**Verdict:** output capability is strong; direct creation hierarchy is not yet optimized around the simple human job “type my name and make it look good.”

---

# Part C — cross-role product findings

## 9. Strong flows we should preserve

### C1 — ordinary Urdu writing → Copy / Share

This is concise, understandable and platform-native. Avoid adding unnecessary steps.

### C2 — editor → Card Studio / Stylish / Name Art browser-session handoffs

The current short-lived `sessionStorage` handoff model is a strong reusable architectural pattern. It keeps user text out of URLs and avoids backend state.

### C3 — Card Studio Quick mode

Quick mode hides advanced controls while keeping them available. This is the correct direction for casual creators.

### C4 — social-mode defaults

Instagram and WhatsApp modes choose useful dimensions/templates/sample text automatically. Platform-specific defaults reduce decision cost.

### C5 — export honesty

The social tools correctly say “download, then upload manually” instead of pretending to connect to Instagram/WhatsApp.

---

## 10. Systemic friction patterns

### C6 — tool boundaries are visible to users when they should feel like one workflow

The product internally benefits from modular tools, but users should not pay the architecture cost. Basic → Rich and social iframe flows expose too much of the separation between modules.

### C7 — some “Create” roles still begin with configuration rather than content

Card Studio has already moved toward **Content → Format → Style → Export**. Name Art should follow the same principle more strictly.

### C8 — mobile layout tests protect geometry, not yet role completion

Existing tests are strong at preventing overflow/layout regression, but we should add role-level acceptance such as:

- student: type multi-paragraph content → continue to Rich → format → export;
- Instagram: replace sample → select portrait → download;
- WhatsApp message: type → invoke Share fallback safely;
- Name Art: enter name → choose Profile/DP → choose visual template → download.

### C9 — “minimum friction” differs by one-off vs repeat user

WriteUrdu is already strong for one-off browser-local jobs. Repeat marketers will eventually need reuse/brand memory; students may need document continuity; casual Name Art users need fewer design decisions.

---

# Part D — prioritized remediation queue

## P0 / P1 — should be addressed before adding more tools

1. **Basic Editor → Rich Editor text handoff** and remove/repair any “without starting over” promise until the flow is guaranteed.
2. **Name Art direct-entry simplification:** visible name field, live preview earlier, DP/Profile shortcut.
3. **Name Art mobile hierarchy:** do not force all 24 template labels before the live workspace.
4. **Task-led homepage discovery:** Assignment/Document, WhatsApp Message, Instagram/Facebook Post, WhatsApp Status, Name/DP, Stylish Text, Poetry/Card.
5. **Clarify WhatsApp message vs WhatsApp Status** before destination selection.
6. **Complete shared locale page-copy registration** for modern routes.

## P1 — high-value journey improvements

7. Add **Facebook Post** as an explicit entry point into the existing Card Studio preset/template system.
8. Rework shared navigation taxonomy so `Create` has a consistent meaning and mobile creative destinations are shallower.
9. Extend contextual “Use the Urdu you just wrote” journeys to include **Continue as document**, **WhatsApp Status** and **Instagram post** where appropriate.
10. Add role-level Playwright acceptance, especially mobile Name Art and Basic → Rich document continuity.
11. Validate embedded Instagram/WhatsApp Card Studio scrolling on real iOS/Android devices and reduce nested-shell friction if confirmed.

## P2 — deeper product value

12. Marketer branding layer: own logo, reusable colours and a small local brand preset.
13. Visual Name Art template previews rather than text labels alone.
14. Broaden documentation from writing-only architecture to **Write / Create / Utilities / Learn**.
15. Improve template discovery around actual jobs: education, business, social, events, poetry and seasonal/religious.

---

# 11. Current role-level conclusion

WriteUrdu is **not failing to deliver value**. In most cases the underlying tools now do the real job.

The next product-quality gap is the amount of **translation work we make the user do between their goal and our modules**.

- The student should not understand Basic vs Rich storage boundaries.
- The marketer should not understand Card Studio presets before asking for a Facebook post.
- The WhatsApp user should not have to reason about Message vs Status after choosing the wrong tool.
- The Name Art user should not understand that Name Art is an outer shell around Card Studio before typing a name.

The next design principle should therefore be:

> **Start from the user’s desired output, preserve their content automatically, expose complexity only when they ask for it, and keep the final export/share action obvious.**

---

## 12. Validation still required

Before closing this audit, perform or automate the following real-device checks:

- iPhone/Android basic message → native Share → WhatsApp;
- student multi-paragraph Rich Editor formatting and Word/PDF download on mobile and desktop;
- Instagram/WhatsApp social iframe scrolling and keyboard behavior on mobile;
- direct Name Art entry on a 360–390px phone, measuring scroll distance before the name can be edited;
- final downloaded PNG/JPEG readability at normal phone size;
- failed/slow transliteration network behavior while a user is midway through each role.

These are validation items, not assumptions of failure.
