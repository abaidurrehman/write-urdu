# WU-CARD-CONTENT-001 — Acceptance Matrix

**Parent:** `WU-CARD-CONTENT-001-ready-made-urdu-cards-gallery.md`  
**Architecture:** `WU-CARD-CONTENT-001-ARCHITECTURE-CONTRACT.md`

This matrix is intentionally stricter than a normal visual-gallery checklist. The product publishes ready-to-share Urdu content, so both **design quality** and **content integrity** are release gates.

---

## A. Corpus integrity

### A1 — Stable IDs

**Given** the curated card registry  
**When** validation runs  
**Then** every card has a unique stable ID.

Pass criteria:

- no duplicate IDs;
- no blank IDs;
- IDs are ASCII/kebab-case;
- retired IDs are not reused for unrelated content.

### A2 — Only approved cards render publicly

Public gallery data must exclude:

- `candidate`;
- `review`;
- `hold`;
- unresolved/invalid definitions.

Only `approved` content appears in browse results.

### A3 — Background reference integrity

Every approved card must reference a real background ID from the shared registry.

No duplicate background metadata should be required inside the card definition.

### A4 — Category validity

Every approved card uses an allowed category and every public category has at least one approved item before its filter is shown.

---

## B. Religious-source integrity

### B1 — Hadith source required

Any card labelled as Hadith must have:

- `source.type = hadith`;
- a non-empty reference;
- verified status;
- translation/source provenance sufficient for editorial review.

A card fails if wording came only from an unverified social-media image or aggregator.

### B2 — No invented grading

The product must not fabricate authenticity grading, narrator chains or collection references.

### B3 — Quran wording discipline

If a card is labelled as Quran/Quranic translation:

- verse reference exists;
- Arabic text, if shown, is verified;
- Urdu translation provenance/rights are known;
- no generated paraphrase is labelled as a translation of the Quran.

### B4 — General prayer vs sourced dua

Original editorial prayer text must not be labelled Hadith/Quran/sourced prophetic dua unless verified as such.

### B5 — Source visible before sharing

For sourced religious cards, the user can inspect the source before download/share.

The source may be visually secondary, but cannot be hidden so completely that the user is encouraged to spread unattributed religious material unknowingly.

---

## C. Literary rights and attribution

### C1 — Explicit rights state

Every literary/poetry/quote item has an explicit rights state.

Allowed public states:

- `original`;
- `public-domain-verified`;
- `licensed`;
- `permission-granted`;
- `rights-not-applicable` where genuinely appropriate.

Blocked:

- `hold-rights-unclear`.

### C2 — Fame is not a rights decision

A poem/ghazal/nazm cannot be approved merely because the poet is famous or the line is widely shared.

### C3 — No modern copyrighted lyrics by accident

Search the initial corpus for song lyrics, contemporary film dialogue and modern protected poetry before release.

If rights are unclear, hold the item.

### C4 — Attribution accuracy

Named quotes/poetry must not use a person's name unless attribution was verified.

Unverified sayings should either be excluded or presented without a false attribution.

### C5 — No large reproduced copyrighted works

The corpus should use only rights-approved text and should not reproduce long protected works even inside internal evidence files.

---

## D. Edit/source integrity

### D1 — Pristine sourced card

**Given** an approved sourced card  
**When** the user has not altered the wording  
**Then** source attribution may appear in the preview/export according to the card's approved attribution mode.

### D2 — Edited sourced text

**Given** sourced content  
**When** the user materially edits the Urdu wording  
**Then**:

- `isEdited` becomes true;
- UI states that the source applies to the original wording;
- exported output does not falsely imply the edited wording is the exact sourced quotation.

### D3 — Edit then restore

If the user restores the exact original normalized text, the card may return to pristine state.

### D4 — Unsourced/original cards

Editing an original greeting/motivational card must not show irrelevant source warnings.

### D5 — Handoff preserves integrity state

Opening the edited card in Card Studio must preserve enough provenance to avoid reattaching an invalid source footer automatically.

---

## E. Visual quality

### E1 — Clear text-safe region

Every approved card must keep its main Urdu text inside a calm text-safe region.

Fail examples:

- Urdu overlaps a face/bird/lantern/flower cluster;
- high-contrast ornament crosses through the main text;
- source footer overlaps body text;
- important artwork is covered by normal text length.

### E2 — Strong Urdu contrast

The main text must be quickly readable on a typical phone screen.

Do not approve:

- pale-on-pale combinations;
- thin white text over bright skies without treatment;
- gold text over dense gold ornament;
- busy textures that make Nastaliq strokes disappear.

### E3 — Typography quality

Check:

- Urdu joining/shaping;
- line breaks;
- diacritics where present;
- Nastaliq/Naskh rendering;
- punctuation direction;
- Latin/numeral mixing where relevant.

### E4 — Source line hierarchy

Attribution/source text must be legible but visually secondary.

It must not compete with the main quote or look like accidental footer debris.

### E5 — No fake/generated text in artwork

Background artwork must not contain AI-generated pseudo-Urdu or unreadable decorative text that could be mistaken for content.

---

## F. Short/medium/long content QA

The gallery is curated, so each card definition is judged with its actual text. In addition, the shared layout system must remain robust across content classes.

### F1 — Micro/short

Test examples:

- one dua phrase;
- one short greeting;
- one-line deep quote.

Requirements:

- does not look lost in the frame;
- type can scale attractively;
- no awkward excessive whitespace caused by a layout built only for long copy.

### F2 — Medium

Test 3–5-line cards.

Requirements:

- natural line breaks;
- strong hierarchy;
- safe margins;
- source line still fits.

### F3 — Long

Test 6–8-line curated content where such content is allowed.

Requirements:

- no clipping;
- no tiny unreadable type;
- no collision with artwork;
- if a background cannot support long text, that pairing must be rejected rather than forced.

### F4 — Mixed script

At least a small fixture set should test:

- Urdu + year;
- Urdu + English name;
- Urdu + numeric verse/reference;
- Urdu + punctuation.

---

## G. Receiver-first export quality

### G1 — Phone-size inspection

Review exported cards at normal phone display scale, not only zoomed desktop size.

### G2 — Messaging compression resilience

Use representative compression/re-scaling or manual sharing tests where practical.

Pass criteria:

- Urdu remains crisp enough to read;
- gradients do not collapse badly;
- border detail is not muddy;
- source text remains legible when intended;
- overall design still feels premium.

### G3 — Screenshot resilience

A screenshot of the displayed shared card should still look intentional and balanced.

### G4 — Recipient appeal review

For each launch card, ask explicitly:

> Would this feel worth saving or resharing if I received it from someone else?

This is a manual quality gate, not an automated assertion.

---

## H. Gallery UX

### H1 — First viewport value

On mobile, the user should see useful cards quickly without passing through a complex setup form.

### H2 — Filters

Filters must:

- work by tap/click;
- expose selected state;
- not overflow the page;
- hide categories with zero approved items;
- update the gallery without losing accessibility semantics.

### H3 — Card actions

Primary actions are understandable and restrained.

Recommended:

- Share;
- Edit;
- Download or Copy as secondary depending design.

Avoid four or five equally prominent buttons on every tile.

### H4 — Tap target

Touch targets should be comfortably usable on phones.

### H5 — No hover dependency

Every essential action must work on touch-only devices.

### H6 — Expanded preview

If a larger preview/detail view is used:

- keyboard users can enter/exit it;
- focus is managed correctly;
- mobile back/close behavior is clear;
- it does not become a second full editor.

---

## I. Performance

### I1 — No canvas-per-card browse loop

Inspect runtime behavior and code.

The browse grid must not create a full canvas for every card.

### I2 — Lazy offscreen assets

Offscreen rich background assets should load lazily or according to measured efficient behavior.

### I3 — High-res render on demand

High-resolution rendering should happen only after an explicit share/download/edit/export action or similarly bounded trigger.

### I4 — Scrolling responsiveness

Manual mobile testing should show smooth enough scrolling/filtering for the initial corpus.

### I5 — PWA cache bounded

Do not add the entire future rich-media corpus to a mandatory app-shell cache.

Any service-worker changes must pass existing cache-generation contracts.

---

## J. Local download

### J1 — Correct content

Downloaded image matches:

- selected curated card;
- current user-edited wording if applicable;
- selected background;
- approved layout;
- correct source/attribution behavior.

### J2 — No stale card

Rapidly selecting another card then downloading must not export the previous card due to asynchronous race conditions.

### J3 — Render failure

Render failure gives a clear error and preserves the current card state.

---

## K. Native sharing

### K1 — File sharing capability detection

Use feature detection rather than assuming `navigator.share` file support.

### K2 — Share file matches current state

Shared file must reflect current edit/background/card selection.

### K3 — Fallback

Where file sharing is unsupported, Download remains available.

### K4 — No fake WhatsApp integration

The UI must not claim that a card was sent to WhatsApp when the OS share sheet chooses the destination.

### K5 — No upload required

Native sharing must not require uploading user-edited card content to a third-party server.

---

## L. Card Studio handoff

### L1 — Background preserved

`Edit` opens Card Studio with the same background already selected/applied.

### L2 — Text preserved

Current Urdu text survives the handoff exactly.

### L3 — Source state preserved

Edited sourced cards do not regain misleading attribution after handoff.

### L4 — No text in URL

Inspect destination URL and browser history.

User text must not be placed in query parameters/hash.

### L5 — Destination ready

User arrives at a usable Card Studio state without re-entering text or waiting for an unexplained blank editor.

---

## M. Privacy and telemetry

### M1 — Public card IDs allowed

It is acceptable to emit a curated card ID/category/background ID as bounded telemetry because these identify public corpus entries.

### M2 — User edits prohibited

Network/analytics inspection must show no user-edited text.

Use sentinel test text such as:

```text
نجی-ٹیسٹ-مواد-7Q9
```

Search request payloads, query strings and telemetry bodies for the sentinel.

Expected result: absent.

### M3 — Clipboard text prohibited

Copying card text must not log the copied content.

### M4 — Render bytes prohibited

Do not send generated image bytes to Product Pulse/analytics.

### M5 — Public publishing separate

Native Share/Download must not silently create a public URL.

---

## N. SEO and canonical ownership

### N1 — Distinct route intent

When launched, `/urdu-cards` copy must clearly differ from:

- `/urdu-card-studio` — advanced/custom creation;
- `/urdu-card-gallery` — own text across backgrounds.

### N2 — No thin tag-page explosion

No automatic indexable page for every category/tag/quote in v1.

### N3 — Canonical

Extensionless canonical points to `/urdu-cards`.

### N4 — Public registry updates

When public launch is approved, relevant SEO/public-page registries/sitemap/llms/human sitemap are updated according to current repo conventions.

### N5 — Static usefulness

The route should contain enough real text/category context to remain understandable/crawlable without relying on hidden keyword dumps.

---

## O. Accessibility

### O1 — Real Urdu text in DOM

Browse cards expose the meaningful Urdu wording as text, not only pixels inside an image.

### O2 — Language/direction

Urdu content has correct language and RTL direction semantics.

### O3 — Keyboard operation

Filters, cards and actions can be operated with keyboard only.

### O4 — Focus visibility

All interactive controls have visible focus treatment.

### O5 — Screen-reader source

Source/attribution details are available programmatically for sourced content.

### O6 — Color not sole signal

Selected/filter/source-warning state is not communicated only by color.

---

## P. Content-security sanity

### P1 — Registry text rendered safely

Card text must be assigned through safe text APIs (`textContent` or equivalent).

### P2 — No markup execution

A test fixture containing HTML-like text must render literally, not execute.

Example fixture:

```text
<svg onload=alert(1)>اردو</svg>
```

### P3 — Handoff data treated as text

Card Studio handoff must not interpret content as markup.

---

## Q. Regression gates

Before production merge, all established Card Studio and Card Gallery tests must remain green.

At minimum run current equivalents of:

```bash
npm test
npm run seo:check
npm run governance:check
npm run shell:check
npm run seo:graph:check
npm run test:browser
```

Prefer the repository's aggregate full test command if available.

Do not weaken unrelated assertions to make this feature pass.

---

## R. Launch review sheet

Before first public release, produce a manual review table for every approved launch card with columns:

```text
Card ID
Category
Background
Source type
Rights state
Source verified?
Short/medium/long class
Mobile preview pass?
Export pass?
Share pass?
Receiver-quality pass?
Notes
```

A failed source/rights/receiver-quality row blocks that card, not necessarily the entire gallery.

---

## S. Release decision

A release is acceptable when:

- corpus integrity checks pass;
- no rights-unclear item is public;
- no unverified religious attribution is public;
- edited-source behavior is not misleading;
- gallery remains fast and usable on mobile;
- native share/download/edit work with fallback;
- user edits remain private;
- Card Studio regressions are absent;
- public-route governance permission has been recorded.

The bar is not “the gallery loads.” The bar is **trustworthy content + beautiful receiver-facing cards + low-friction sharing**.