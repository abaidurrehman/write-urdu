# WU-DOC-001C — Document Translator Growth, SEO + Measurement

**Parent:** `WU-DOC-001`  
**Depends on:** `WU-DOC-001A`, `WU-DOC-001B`, `WU-GROWTH-001`, `WU-I18N-001`  
**Status:** Planned  
**Date:** 2026-08-24  
**Scope:** acquisition page quality, metadata/schema, internal discovery, Urdu locale, product funnel, AdSense boundary

---

## 1. Goal

Launch the translator as a real acquisition destination without fragmenting authority across thin keyword pages.

The primary growth hypothesis is:

> People searching for English-to-Urdu document/PDF translation can land directly on a useful tool, complete the translation, then continue into the broader Write Urdu product.

---

## 2. Search owner

Canonical owner:

```text
https://write-urdu.com/tools/english-to-urdu-document-translator
```

Suggested metadata direction, subject to final SERP review:

```text
Title: English to Urdu Document Translator – PDF & Word | Write Urdu
Description: Translate an English PDF, Word document or text file into editable Urdu. Review, copy, edit and continue in Write Urdu.
H1: English to Urdu Document Translator
```

Use user language. Do not use `NMT`, `LLM`, `Markdown`, `AI pipeline`, `OCR engine` or model names as primary acquisition copy.

---

## 3. Content structure

The page must remain tool-first.

After the workspace/result boundary, useful supporting content may cover:

- how to translate an English PDF to Urdu with the tool;
- supported files;
- what happens with scanned/image-only PDFs;
- how to edit the Urdu result;
- how to save/print the translated Urdu;
- why the layout may differ from the original;
- concise privacy explanation;
- FAQ based on real product questions.

Do not add generic essay content merely to increase word count.

---

## 4. No doorway cluster at launch

Do not create separate indexable clones for:

```text
pdf to urdu
english pdf to urdu
word to urdu
pdf english to urdu
english document to urdu
```

Track these as query variants against the one owner page first.

A future dedicated owner is allowed only if:

1. Search Console/external evidence shows material distinct intent;
2. the new route owns a distinct user job or capability;
3. content/tool behavior is meaningfully distinct;
4. canonical/internal-link ownership is documented before launch.

---

## 5. Structured data

Use only schema that truthfully describes the page and passes existing SEO governance.

Likely candidates after checking current site conventions:

- `WebApplication` / `SoftwareApplication` if already used correctly for tools;
- `BreadcrumbList`;
- `FAQPage` only when the visible FAQ and current search-policy guidance justify it.

Do not invent ratings/reviews/usage counts/pricing claims.

---

## 6. Internal discovery

Register the feature in the outcome-led navigation/journey model as **Work**.

Useful discovery entry points may include:

- Rich Editor `Continue with…` where document translation is a natural upstream job;
- My Documents `Start from an English document` only if it routes to the translator rather than creating a second importer;
- relevant Learn pages about Urdu in Word/documents;
- tools/sitemap page;
- homepage secondary discovery only after hierarchy review — do not crowd the primary typing job.

Do not place it in every page footer just for links.

---

## 7. Urdu locale

After the English route is stable and `WU-I18N-001` generation supports the route:

```text
/urdu/tools/english-to-urdu-document-translator
```

must be generated/static/crawlable with:

- Urdu interface/copy;
- same tool capability;
- correct hreflang/canonical relationship;
- source English content still presented LTR inside the workspace;
- translated Urdu RTL;
- no browser-language redirects.

The Urdu route should not be generated manually outside the locale pipeline.

---

## 8. Measurement funnel

Track bounded product steps:

```text
route_view
→ file_selected
→ translation_started
→ translation_completed | failed
→ result_edited
→ copy / rich_editor_handoff / print_export / save / share
```

Key questions:

- what share of landing users select a file?
- what share of selected files reach successful translation?
- failure rate by source kind/size bucket?
- what share edit the Urdu?
- what share copy/continue/export?
- which search queries/pages drive qualified translation starts?
- does the tool create useful second actions/page depth?

Never measure document content.

---

## 9. Search Console scorecard

After indexing, track at minimum:

```text
english to urdu document translator
english document to urdu
translate document english to urdu
pdf to urdu
english pdf to urdu
translate pdf to urdu
word document to urdu
```

These are observation clusters, not permission to create pages.

Track:

- impressions;
- clicks;
- CTR;
- average position;
- ranking URL;
- device/country where available;
- index/inspection state after release.

---

## 10. AdSense

Classify the route according to current page-type rules after reviewing `WU-GROWTH-001`.

The translator's active workspace remains protected.

Allowed monetization location is after:

```text
result + primary actions + normal workspace boundary
```

Do not interrupt upload → translate → review.

Measure RPM/viewability separately from task completion; do not optimize ad density at the expense of translation completion.

---

## 11. Launch checklist

- [ ] one canonical owner route.
- [ ] metadata matches user intent and product capability.
- [ ] source-visible descriptive tool content exists without technical jargon.
- [ ] sitemap/route registry updated.
- [ ] valid schema only.
- [ ] internal Work/journey discovery added deliberately.
- [ ] product telemetry funnel live before promotion.
- [ ] no user content in telemetry.
- [ ] AdSense boundary after workspace only.
- [ ] Search Console query/page tracking added.
- [ ] Urdu locale added only through `WU-I18N-001` when ready.
- [ ] no doorway keyword clones.
- [ ] `npm run seo:check`, `npm run locale:check`, `npm run governance:check`, browser tests green.
