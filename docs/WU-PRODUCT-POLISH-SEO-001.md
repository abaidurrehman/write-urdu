# WU-PRODUCT-POLISH-SEO-001 — Production UX System, Transliteration Safety, and Priority SEO Growth

**Status:** Approved for implementation
**Baseline:** `main` at `cc81346ee7fd5ec3b32e0bafec76947b1ba5c361`
**Hosting:** Cloudflare Pages, static-first
**Primary business goal:** Increase qualified organic traffic while protecting the high-usage transliteration workflow.

## 1. Outcome

Transform WriteUrdu into a coherent, elegant, professional browser product without changing the behavior of the production transliteration engine. The first growth focus is to improve relevance, click-through rate, and ranking for:

- `urdu typing` — 7,162 impressions, average position 7.21, CTR 1.79%
- `urdu writing` — 3,705 impressions, average position 6.48, CTR 1.30%

The work must preserve the product's static Cloudflare Pages architecture and avoid introducing server dependencies for the core editor.

## 2. Non-negotiable release constraints

### 2.1 Transliteration safety

The existing production transliteration integration is behavior-critical and must be treated as a frozen contract during visual and SEO work.

Do not change without a separate reviewed feature:

- transliteration provider or provider-loading sequence;
- source and destination language configuration;
- textarea ID or DOM binding used by transliteration;
- keyboard toggle behavior;
- suggestion selection behavior;
- input, space, backspace, composition, paste, focus, or blur handlers;
- script ordering required to initialize the transliteration control;
- fallback or error states currently used by the editor.

Presentation work may wrap or style the editor, but may not replace, clone, move asynchronously, or conditionally render the behavior-critical textarea.

### 2.2 Static-first architecture

- All core editor and content pages must remain deployable as static Cloudflare Pages assets.
- No database, Worker, API, account, or network dependency may be required to type, transliterate, copy, clear, or export text.
- New JavaScript must be optional enhancement and fail safely.
- Avoid framework migration in this phase.

### 2.3 SEO safety

- Preserve existing ranking URLs unless an explicit redirect and canonical plan is approved.
- Keep the primary editor and its useful server-rendered/static HTML content available without JavaScript.
- Do not hide the editor behind a modal, onboarding screen, login wall, or client-only render.
- Do not remove existing useful explanatory content merely to shorten the page.

## 3. Phase 0 — Transliteration regression contract

Before visual restructuring, add a lightweight automated static contract test that fails when critical integration markers disappear or change unexpectedly.

Required assertions for the production homepage:

1. The editor textarea exists exactly once.
2. Its required ID remains unchanged.
3. The transliteration initialization script is present.
4. English is configured as the source language.
5. Urdu is configured as the destination language.
6. The control binds to the production textarea.
7. The keyboard toggle instruction remains visible.
8. Copy and clear controls remain present.
9. No duplicate editor textarea is introduced.
10. No required core action depends on a form submission or remote WriteUrdu API.

Add a manual smoke-test checklist covering:

- Roman Urdu word conversion after space;
- alternative suggestion behavior after backspace;
- Ctrl+G language toggle;
- direct Urdu input;
- direct English input;
- paste, copy, clear, and focus restoration;
- mobile typing and composition;
- slow or failed third-party script loading;
- refresh and back-navigation behavior.

No UX implementation PR may merge unless this contract test passes and the manual smoke checklist is completed on the Cloudflare preview deployment.

## 4. Phase 1 — Design-system foundation

### 4.1 Typography

Create a restrained typography system instead of page-by-page font weights.

Allowed Latin UI weights:

- 400: body and supporting copy;
- 500: navigation, labels, and secondary actions;
- 600: buttons, card titles, and emphasis;
- 700: page and section headings.

Avoid arbitrary weights such as 650, 750, 780, 800, or 900 unless a specific loaded font file demonstrably supports them and the design system documents the use.

Urdu content must use a consistent Urdu-capable font stack with line height appropriate for Nastaliq rendering. Urdu writing surfaces must not inherit compressed Latin line-height values.

### 4.2 Tokens

Define shared CSS custom properties for:

- background and elevated surfaces;
- text, muted text, and inverse text;
- brand, brand hover, success, warning, and danger;
- borders and focus rings;
- spacing scale;
- radius scale;
- elevation scale;
- readable content widths;
- header and control heights;
- typography sizes and weights.

### 4.3 Reusable visual patterns

Normalize these patterns across the homepage, editor, keyboard, templates, cards, invoice generator, documentation, privacy, and feedback surfaces:

- site header and navigation;
- page hero;
- primary and secondary buttons;
- editor toolbar controls;
- input fields and selects;
- cards and feature tiles;
- section headings;
- notice, help, success, warning, and error states;
- footer;
- focus-visible treatment;
- empty and loading states.

The result should feel like one product, not a collection of separately styled utilities.

### 4.4 Reading comfort

- Reduce visual noise from excessive font weights, outlines, shadows, and competing card treatments.
- Use whitespace and hierarchy instead of bolding every label.
- Keep primary reading text within a comfortable measure.
- Maintain strong contrast while avoiding pure-black-on-white glare.
- Make the main editor the obvious visual anchor.

## 5. Phase 2 — Homepage and core editor polish

The homepage should communicate the job in seconds:

1. Type Roman Urdu.
2. It converts to Urdu script.
3. Copy, format, or export the result.

Required experience:

- the editor remains above the fold on common mobile and desktop sizes;
- one dominant primary action: start typing;
- secondary tools remain discoverable but do not compete with the editor;
- controls are grouped by task, not by implementation history;
- labels use plain user language;
- editor states and shortcuts are easy to understand;
- mobile toolbar controls wrap predictably without uneven button sizes;
- no layout jump when transliteration initializes;
- no accidental editor focus loss from cosmetic enhancements.

## 6. Phase 3 — SEO growth for `urdu typing` and `urdu writing`

### 6.1 Search intent ownership

The homepage should remain the primary page for the broad combined task unless Search Console evidence supports a safer split.

The visible page copy must naturally and accurately cover:

- Urdu typing online;
- Urdu writing online;
- Roman Urdu to Urdu script;
- online Urdu keyboard/editor;
- typing Urdu using English letters.

Do not create thin near-duplicate doorway pages targeting singular keyword variations.

### 6.2 Title and description

Create a search-focused title and description that lead with the task and benefit, not a keyword list. They must accurately describe the live editor and remain readable on mobile SERPs.

Target direction:

- Title: `Urdu Typing Online — Write Urdu Using English Letters | WriteUrdu`
- Description: explain instant Roman Urdu conversion, direct Urdu writing, copying, and free browser use.

Final wording must be checked against current pixel/character truncation and must not overpromise offline operation if the provider requires network access.

### 6.3 On-page structure

- Use one clear H1 containing the core user task.
- Add a concise answer-summary immediately below it.
- Keep the editor before long-form SEO content.
- Use descriptive H2 sections for how it works, Urdu typing, Urdu writing, examples, common questions, and related tools.
- Include useful Roman Urdu → Urdu examples.
- Explain direct Urdu writing versus Roman Urdu conversion.
- Add an FAQ only for genuine user questions, with matching visible content and valid structured data where appropriate.

### 6.4 CTR improvements

Improve the search snippet by strengthening:

- title clarity;
- benefit specificity;
- free/no-account language where accurate;
- brand recognition;
- favicon and site-name consistency;
- canonical hostname consistency;
- structured data correctness.

### 6.5 Internal linking

Use descriptive internal links from relevant pages back to the primary Urdu typing/writing experience. Link outward from the homepage to the keyboard, rich editor, templates, transliteration guide, and invoice tool without weakening the homepage's primary intent.

### 6.6 Measurement

Track these Search Console metrics weekly for the two priority queries:

- impressions;
- clicks;
- CTR;
- average position;
- ranking URL;
- mobile versus desktop performance.

Success target for the first 8–12 weeks after recrawl:

- `urdu typing`: move toward positions 4–5 and CTR above 3%;
- `urdu writing`: move toward positions 3–5 and CTR above 2.5%;
- no material decline in clicks to the existing homepage query cluster;
- no transliteration-related support regression.

Traffic doubling is a strategic upside target, not a release claim. Ranking changes remain dependent on Google and competitive conditions.

## 7. Phase 4 — Quality gates

Every implementation PR must pass:

- transliteration static contract tests;
- HTML validity/sanity checks;
- internal-link and missing-asset checks;
- canonical, title, description, H1, and structured-data checks;
- responsive review at mobile, tablet, laptop, and wide desktop widths;
- keyboard-only navigation;
- visible focus states;
- reduced-motion behavior;
- Cloudflare Pages preview smoke test;
- before/after screenshots for changed primary surfaces.

## 8. Release strategy

Use small, reversible PRs:

1. Safety tests and baseline documentation.
2. Design tokens and typography normalization.
3. Header, footer, buttons, fields, cards, and section-heading patterns.
4. Homepage/editor polish without transliteration changes.
5. SEO title, description, semantic content, internal links, and structured data.
6. Secondary-page migration to the shared visual system.

Do not combine a transliteration-provider change with design or SEO work.

## 9. Manual Cloudflare Pages steps

For each PR:

1. Confirm Cloudflare Pages creates a preview deployment from the branch/PR.
2. Run the transliteration smoke checklist on the preview URL on desktop and mobile.
3. Verify no console error blocks editor initialization.
4. Verify canonical and robots behavior on the preview and production host as applicable.
5. Merge only after preview approval.
6. After production deployment, test a clean browser session and monitor Search Console and analytics for regressions.

## 10. Explicitly out of scope

- Replacing the transliteration provider;
- rewriting the application in a framework;
- accounts or cloud document storage;
- server-side AI writing features;
- paywalls around the core editor;
- mass generation of keyword-variant pages;
- redesigning every secondary tool in the first PR.
