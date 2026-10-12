# 08 — Implementation handoff (Codex / Claude Code)

Read first: `07-prioritized-action-plan.md` (action IDs), `02-technical-crawl-audit.md` (evidence), `specs/BACKLOG.md`, `specs/WU-SEO-CTR-001A-pakistan-search-capture.md` §13 (anchor ownership), `scripts/public-language-firewall.js` (copy rules).

## Ground rules for every slice

1. One slice per branch and PR, branched from current `main`. Re-verify every file:line below against `main` before editing — line numbers are from commit `e04e08c`.
2. **Do not change** homepage title/H1/description, the InPage title/H1/default direction, canonical URLs, hreflang, robots, or any route's indexability. Those belong to `WU-SEO-CTR-001A` experiments.
3. Public copy must pass `npm run language:check`. It applies to every public `.html` and to `llms.txt`/`js/outcome-navigation.js`. Outside `write-urdu-privacy.html` it rejects: "everything runs in your browser", "stays on/in your device/browser", "without uploading", "processed in your browser", "product usage measurement", "paid API", etc.; everywhere it rejects implementation vocabulary ("mapping profile: inpage-", "legacy byte", "runs locally in JavaScript", "first release focuses"…).
4. New contract tests must be registered in the explicit list in `scripts/run-contract-tests.js`.
5. Locale: if you edit a string that has a `data-wu-l10n`/`data-wu-i18n-key`, update `locale/ur.js` (or `locale/ur-growth-overrides.js`) and run `npm run locale:generate`; then `npm run locale:check`.
6. Shell/nav changes go through `js/outcome-navigation.js` → `npm run shell:sync`. Never hand-edit the generated static nav blocks.
7. Schema changes go through `seo.config.js` / `scripts/static-seo-graph.js` → `npm run seo:graph:sync`. Never hand-edit the generated `<script type="application/ld+json" data-write-urdu-schema>` blocks.
8. Minimum gate before push: `npm test && npm run seo:check && npm run seo:graph:check && npm run shell:check && npm run collections:check && npm run governance:check`. Run `npm run test:browser` for any slice that changes visible layout.
9. Add a dated line to `changelog.html` only for user-visible improvements (customer language), following existing entries.
10. Record each shipped slice in `docs/SEO-SERP-EXPERIMENTS.csv` as a confounder for any running GSC observation (date, route, what changed).

---

## Slice 1 — `llms.txt` refresh + ownership anchors (A-3, A-4) · S · first recommended

**Goal:** make machine-readable and link-graph signals match the current product and intent-ownership contract.

### Files
- `llms.txt`
- `index.html` (lines ~277, ~324)
- `urdu-faq.html` (~51)
- `urdu-alphabet.html` (~36, ~189)
- `write-urdu-sitemap.html` (~109 card title)
- `english-urdu-typing-tutorial.html` (~32)
- `urdu-ocr.html` (~130), `urdu-text-cleaner.html` (~128)
- `locale/ur.js` for keys `home.toolCard2Title`, `home.videoLink`, `urdu-faq.navRoman`, `urdu-alphabet.ctaRoman`, `urdu-alphabet.related2Title` (only if present; keep Urdu meaning aligned)
- `tests/llm-citation-discovery-contract.test.js` (new) + register in `scripts/run-contract-tests.js`

### Changes
1. Anchor text (hrefs unchanged):
   - `index.html` tool card: `English to Urdu typing guide` → `Roman Urdu to Urdu converter`; its link `Read the typing guide` → `Open the Roman Urdu converter`.
   - `index.html` video link: `Read the English-to-Urdu typing guide →` → `Convert a Roman Urdu passage →`.
   - `urdu-faq.html` nav: `English to Urdu typing guide` → `Roman Urdu to Urdu converter`.
   - `urdu-alphabet.html` related card H3: `English to Urdu typing guide` → `Roman Urdu to Urdu converter`; CTA `Try Roman Urdu typing` (→ `/`) → `Try English to Urdu typing`.
   - `write-urdu-sitemap.html` Roman card: title `How English to Urdu typing works` → `Roman Urdu to Urdu converter`.
   - `english-urdu-typing-tutorial.html`: `Open Roman Urdu typing` (→ `/`) → `Open English to Urdu typing`.
   - `urdu-ocr.html`, `urdu-text-cleaner.html`: `Write Roman Urdu → Urdu` (→ `/`) → `Type Urdu with English letters`.
   - Do not use the firewall's left-hand strings ("Roman Urdu typing guide", "Roman Urdu to Urdu typing guide", `"Roman Urdu typing"`), or `language:check --write` will rewrite them.
2. `llms.txt`:
   - Under **Start writing** add `[Urdu Voice Typing](https://write-urdu.com/tools/urdu-voice-typing)` — speak Urdu, edit the text, copy or continue writing; availability depends on the browser/device.
   - New section **Convert and fix Urdu text**: InPage converter (`/tools/inpage-unicode-converter` — converts pasted text between older InPage Urdu and Unicode in both directions; does not open `.inp` files; unsupported characters are listed for review), Urdu Text Cleaner (`/urdu-text-cleaner`), Urdu image to text (`/urdu-ocr` — clear printed text works best).
   - **Learn**: add `/urdu-phrases-copy-paste` (Urdu and Arabic spellings of common phrases with Roman spelling variants), `/how-to-share-urdu-writing-online`.
   - **Create and export**: add `/urdu-writing-templates` (12 editable applications/letters/notices), `/urdu-wedding-invitation-maker`.
   - **Trust**: add `/10-years-of-write-urdu` ("online since July 2016; measured recent usage and a labelled lifetime estimate").
   - New section **Urdu-language pages** listing the 11 `/urdu/…` URLs from `sitemap.xml` with their Urdu titles.
   - Add an "Important facts" bullet: "Not supported: translating English meaning into Urdu, opening InPage `.inp` files, or converting Urdu script back to Roman Urdu."
   - Set `Last reviewed: <ship date>`.
   - Avoid firewall phrases (no "runs in your browser", "without uploading").
3. Test `tests/llm-citation-discovery-contract.test.js`:
   - every `seo.config.js` page with `indexable: true` has its absolute URL in `llms.txt`, except an explicit `LLMS_EXEMPT = ['/community-guidelines', '/write-urdu-features', '/urdu-editor-features']`;
   - every `/urdu/…` URL in `sitemap.xml` appears in `llms.txt`;
   - across all public HTML, any `<a>` whose text matches `/\bEnglish[- ]to[- ]Urdu typing\b/i` points to `/` or `/english-urdu-typing-tutorial`; any `<a>` whose text matches `/\bRoman Urdu\b/i` points to `/roman-urdu-transliteration` (allow-list `/english-urdu-typing-tutorial` and `/urdu-alphabet` explanatory body text if needed, with a comment).

### Acceptance criteria
- [ ] `node tests/llm-citation-discovery-contract.test.js` passes; fails if a route is removed from `llms.txt` or an anchor regresses.
- [ ] `npm test`, `npm run seo:check`, `npm run shell:check`, `npm run locale:check`, `npm run governance:check` pass.
- [ ] Inventory re-run shows no anchor-ownership conflicts (command below).
- [ ] No title/H1/canonical/description changed (diff review).

```bash
# anchor ownership check (after change, expect no output)
grep -rnoE '<a[^>]*href="([^"]*)"[^>]*>[^<]*(English[- ]to[- ]Urdu typing|Roman Urdu)[^<]*</a>' --include=*.html --exclude-dir=node_modules --exclude-dir=docs --exclude-dir=tests . \
 | grep -vE 'href="/"[^>]*>[^<]*English|href="/english-urdu-typing-tutorial"|href="/roman-urdu-transliteration"[^>]*>[^<]*Roman'
```

### Rollback
Revert the PR; no data or URL changes.

---

## Slice 2 — InPage converter explainer (A-2) · S

### Files
`tools/inpage-unicode-converter.html` (inside `<section>` "What this converter supports", after the existing H3s), `seo.config.js` or `scripts/static-seo-graph.js` for `featureList`, `npm run seo:graph:sync`, a new/extended contract test.

### Changes
- H3 **Why older InPage text looks like symbols** — 2 sentences (user language; see file 05 §2.1 item 1).
- A static `<figure>` with two `<div lang="ur" dir="rtl">`/`<code>` panes: Unicode `یہ ایک اردو متن ہے۔` and the illustrative legacy appearance `¤ ¦ Ž ‹ ¢ …` with a caption "Example: how pasted older InPage text can look before conversion". Generate the glyph sample from `js/inpage-unicode-core.js` `encodeUnicodeText()` and strip `U+0004`, so it is real output.
- A 4-item compatibility list (pasted text ✅, `.inp` files ❌, layout/fonts ❌, unknown characters kept and listed ✅).
- `featureList`: ["InPage to Unicode", "Unicode to InPage", "Unsupported characters listed for review", "Copy or continue in the Urdu editor", "Clean converted Urdu text"].
- **Excluded:** privacy FAQ wording (A-20, owner decision), title/H1/default direction (A5), "how to paste into InPage" until tested in a real InPage install.

### Acceptance criteria
- [ ] Raw HTML contains the new H3, the Unicode sample and the compatibility list (test).
- [ ] The legacy glyph string in the figure equals `encodeUnicodeText(sample).text` with `\u0004` removed (test).
- [ ] FAQ JSON-LD still matches visible FAQ exactly.
- [ ] `language:check`, `seo:graph:check`, `npm test` pass; desktop + 390 px mobile screenshot shows no layout shift above the tool.

---

## Slice 3 — Voice compatibility, WhatsApp FAQ, phrases links (A-5, A-7, A-6) · S

### Files
`tools/urdu-voice-typing.html`, `urdu-faq.html`, `index.html` (one list item), `urdu-card-studio.html` (Related tools list), `how-to-write-urdu-on-photo.html`, `locale/ur.js` + `npm run locale:generate` for `/urdu/urdu-faq` and `/urdu/tools/urdu-voice-typing`, schema via `seo.config.js` (`schema: ['WebApplication','FAQPage']` for voice) + graph sync.

### Changes
- Voice: section **Where voice typing works** (≤120 words) + 3 visible FAQs (blocked microphone; starts only after Start, link to Privacy; voice vs English-letter typing → `/`). Browser names only if `docs/VOICE-MOBILE-DEVICE-CHECKLIST.md` has a PASS record; otherwise generic wording.
- FAQ: question **How do I write Urdu in WhatsApp or other phone apps?** ≤90 words: type with English letters or voice in Write Urdu, then Copy/Send to WhatsApp; or add an Urdu keyboard in phone settings; mixed Urdu/English looking reversed → Text Cleaner.
- Phrases links: the four contextual links in 07 A-6 (exact anchors there).

### Acceptance criteria
- [ ] FAQPage JSON-LD on voice and FAQ pages matches visible text exactly.
- [ ] `/urdu-phrases-copy-paste` has ≥9 distinct static incoming pages.
- [ ] Existing voice browser tests pass (`npm run test:browser -- --grep -i voice`).
- [ ] `language:check`, `locale:check`, `seo:check` pass.

---

## Slice 4 — Entity signals (A-9) · XS · needs owner input
- `seo.config.js` `PUBLISHER`: add `foundingDate: '2016-07'`; add `sameAs: [...]` only with owner-provided URLs; teach `scripts/static-seo-graph.js` to emit them; `npm run seo:graph:sync`.
- If the owner approves a named maintainer: `PUBLISHER.publicMaintainerName`, `Organization.founder` (`Person` with `name` and optional `url`), one sentence on `/why-write-urdu` "Who maintains Write Urdu".
- Outside the repo: GitHub repo description + website field.
- **Acceptance:** `seo:graph:check` passes; Rich Results Test / Schema validator shows no errors for `/` and `/why-write-urdu`.

## Slice 5 — Static ready-made content (A-8) · M · after WU-UXR-002 settles
- Extend `scripts/static-collection-content.js` with renderers for `data-urdu-cards-grid` and `data-whatsapp-status-grid` using `require('../js/urdu-cards-data.js')`; cap at 3 items per category; each item: category heading, Urdu text (`lang="ur" dir="rtl"`), link/button target the JS app already understands.
- Update `js/urdu-cards.js` and `js/whatsapp-status-discovery.js` to replace the static block on hydrate (no duplicates).
- Locale sibling `/urdu/urdu-cards` via generator.
- **Acceptance:** `npm run collections:check` passes; raw HTML of both routes contains ≥15 Urdu items; browser test confirms each item appears once after hydration; no CLS regression on 390 px mobile; Card Studio handoff unaffected.

## Later / owner-gated
- A-20 privacy line on conversion tools (firewall exemption).
- A-11 `<main>` landmark on `/`, `/urdu-keyboard`, `/urdu-editor` (visual regression risk).
- A-14 Roman variant table (after A4 measurement window).
- A-15 git-derived `lastmod`.
- A-17 Urdu-locale InPage page (WU-I18N-001D).

## Measurement for every slice
- Before shipping Slice 1, run the manual AI test pack (file 06 §3) once as a baseline; repeat 4 and 8 weeks after each slice.
- GSC: compare the changed routes only, same country/device filters, comparable windows (per `WU-SEO-CTR-001A` §14).
- Never report an AI citation change from a single run.
