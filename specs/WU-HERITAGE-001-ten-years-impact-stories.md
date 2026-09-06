# WU-HERITAGE-001 — Ten Years of Write Urdu: Heritage, Impact & User Stories

**Status:** Active — founder-approved 2026-09-06  
**Area:** Trust / brand heritage / authority / community memory  
**Primary public route:** `/10-years-of-write-urdu`  
**Related:** `/why-write-urdu`, `WU-COMMUNITY-001`, `WU-PLAT-002H`, `WU-GROWTH-001`  
**Launch month:** July 2016 (founder-confirmed; do not publish a precise day unless separately verified)

## 1. Product goal

Turn Write Urdu's decade of real use into a durable, trustworthy part of the product identity without inventing history, pretending historical telemetry exists, or weakening the site's privacy stance.

The experience should answer four questions:

1. **How long has Write Urdu existed?** — online since July 2016.
2. **How much writing happens here?** — show recent aggregate measurements and a clearly labelled lifetime estimate.
3. **What does that writing mean in human terms?** — education, applications, letters, poetry, family messages, work and social sharing, presented as plausible purposes rather than tracked categories.
4. **How did Write Urdu matter to individual people?** — invite real users to submit memories, moderate them, obtain publishing permission, and publish only approved stories.

This is not a vanity-statistics page. It is a heritage, trust and community-memory surface.

## 2. Public claim discipline

Every quantitative statement must belong to one of these classes and be visibly labelled where ambiguity is possible:

| Class | Meaning | Example |
|---|---|---|
| **Measured** | directly present in current aggregate telemetry | `128 recent writing sessions exceeded 2,500 characters` |
| **Derived** | arithmetic from measured aggregate buckets | `1,067 non-zero writing sessions in the sampled window` |
| **Estimated** | extrapolation using disclosed assumptions | `tens of millions of words over the site's lifetime` |
| **Illustrative equivalent** | scale comparison, not an observed use case | `hundreds of full-length books' worth of text` |
| **User story** | submitted by a real person and approved for publication | a first-person memory with consent |

Rules:

- Never write `100 million words written` as a verified historical counter.
- Never write `thousands of books were written on Write Urdu`.
- Never claim a percentage of writing was homework, poetry, formal letters, social posts or any other purpose unless future telemetry explicitly measures that category with an acceptable privacy boundary.
- Human-use sections must use wording such as `what people may have used Write Urdu for`, `the kinds of writing Write Urdu supports`, or first-person approved user stories.
- Do not claim the site stored historical writing. The opposite is part of the trust story: aggregate telemetry does not include the text users write.
- Current telemetry must not be described as a ten-year historical dataset.

## 3. Evidence baseline for the first release

The first release is grounded in the Product Pulse snapshot reviewed on 2026-09-06. The durable arithmetic and assumptions live in:

`docs/WU-HERITAGE-001-EVIDENCE-2026-09-06.md`

The public headline should remain conservative:

> **Tens of millions of Urdu words — estimated, not counted.**

Supporting recent-sample facts may include:

- 5,323 product visits;
- 4,225 engaged visits;
- 1,067 derived non-zero writing sessions from the writing-length buckets;
- 128 writing sessions in the `2500+` character bucket;
- roughly 0.60–0.92 million written characters represented by the sampled non-zero buckets, depending on the bounded assumption for the open-ended `2500+` bucket.

The initial lifetime estimate must not assume that pre-generative-AI years were definitely busier. That is a plausible historical hypothesis, not measured evidence. The first public estimate therefore uses a simpler floor/scale exercise: what the current measured writing rate would imply if sustained across ten years.

## 4. Experience principles

### 4.1 Editorial, not SaaS-dashboard UI

The page should feel like a small digital museum / anniversary editorial:

- strong 2016 → 2026 visual anchor;
- generous whitespace;
- large Urdu typography used meaningfully, not decoratively;
- warm paper/ink/brand-green surfaces rather than a grid of generic KPI cards;
- timeline moments;
- evidence labels and a readable methodology disclosure;
- human writing categories expressed through editorial vignettes;
- excellent mobile reading order.

### 4.2 The emotional centre

A core statement should remain close to this meaning:

> We can estimate how much was written. We cannot tell you what was written.
>
> Write Urdu did not keep a decade of people's homework, letters, poems or private messages just to produce a bigger statistic. Much of that writing left through copy, download, print or sharing and continued its life elsewhere. That is exactly how it should be.

Product voice may refine the wording, but not the principle.

### 4.3 No fake social proof

The user-story area must start empty or with an invitation. Do not seed it with invented testimonials, fictional names, fabricated countries, generated quotes or founder-written stories presented as user submissions.

## 5. Information architecture

### Public heritage page

`/10-years-of-write-urdu`

Recommended section order:

1. anniversary hero — `10 years of writing Urdu together`;
2. `Since July 2016` origin statement;
3. current measured impact snapshot;
4. transparent lifetime estimate + `How we estimated this` disclosure;
5. human-purpose editorial section — education, applications/letters, poetry/literature, family/personal, work/business, social internet;
6. privacy/trust statement;
7. decade timeline;
8. `Were you here sometime in the last 10 years?` story invitation;
9. links back to About and the writing tools.

### About integration

`/why-write-urdu` remains the canonical About/trust route. It should eventually gain:

- a compact `Since July 2016` trust marker;
- one high-quality link to the heritage page;
- no duplicate full heritage narrative.

### Homepage integration

A future compact trust marker may say:

`Helping people write Urdu online since 2016.`

It must not displace the P0 first-value editor on mobile. Placement is governed by `WU-PLAT-002H` and must be post-value or otherwise proven not to hurt the first viewport.

## 6. User-story collection contract

The intended prompt:

> **Were you here sometime in the last 10 years?**
>
> Maybe Write Urdu helped with school, an application, poetry, a Facebook post, a letter home or something completely different. Tell us the story around it — not the private document itself.

### Minimum fields

- approximate first-use period: `2016–2018`, `2019–2021`, `2022–2024`, `2025–2026`, `I don't remember`;
- purpose category: education, letter/application, poetry/writing, work/business, social media, family/personal, other;
- story body;
- public display name OR `Publish anonymously`;
- country optional;
- email optional and never public;
- explicit permission to publish the submitted story;
- optional permission for light spelling/length editing without changing meaning.

### Safety/privacy copy

The form must visibly say:

> Please do not paste the private document, message, application or letter you wrote. Tell us the story around it instead.

### Moderation

Nothing publishes automatically.

Required flow:

`submit → private moderation queue → review → approve/reject → public story`

Reuse the security and human-approval patterns already proven by `WU-COMMUNITY-001`; do not point heritage stories at private writing documents and do not reuse the Urdu Writers publication table as an unrelated generic testimonial store.

## 7. Slices

### HERITAGE-A — Ten-year page + evidence contract

**Approved to implement now.** It is an additive trust/content surface and must not change Basic/Rich Editor first-value UI.

Deliver:

- `/10-years-of-write-urdu`;
- polished responsive heritage UI;
- evidence/methodology disclosure;
- conservative lifetime estimate language;
- SEO/social metadata + sitemap discovery;
- ad-free classification/behavior;
- contract tests for claims and route behavior;
- story invitation may use the existing feedback channel as an interim entry point, but must not pretend a dedicated story system already exists.

Detailed acceptance: `WU-HERITAGE-001A-ten-year-impact-page.md`.

### HERITAGE-B — About/home heritage integration

Deliver after A is reviewed visually:

- About `Since July 2016` marker + link;
- optional homepage post-value trust line only if it passes P0 mobile first-value guardrails;
- human sitemap / llms discovery updates where appropriate;
- no new pre-value command/promo layer.

### HERITAGE-C — Moderated user-story collection + publication

Planned; do not sneak into A.

Deliver:

- dedicated form/API/data model;
- explicit publication consent;
- anti-spam/rate limits;
- Product OS queue using existing moderation security patterns;
- approve/reject/edit-with-consent workflow;
- public story rendering with anonymous option;
- removal/unpublish path;
- privacy/terms reconciliation;
- aggregate story telemetry only, never private story text in Product Pulse.

This slice should coordinate with `WU-PLAT-002H` growth-request arbitration so the site does not stack `Keep`, `Publish to Urdu Writers`, `Share` and `Tell us your story` requests in the same writing state.

## 8. SEO / authority contract

The heritage page is indexable because it contains unique first-party product history and transparent methodology.

Requirements:

- canonical extensionless route;
- unique title/H1/description;
- `Article` or appropriate WebPage structured data generated by the shared SEO graph;
- sitemap inclusion;
- no thin duplicate `/about/10-years` alias;
- one canonical About → heritage link in Slice B;
- do not stuff broad `Urdu typing` keywords into the anniversary narrative;
- do not turn estimates into JSON-LD ratings/reviews/aggregateRating or other unsupported schema.

## 9. Monetization

The heritage page and user-story collection/publication surfaces are **trust/community-memory pages and remain ad-free** for this epic.

Do not use the anniversary page as a high-RPM content experiment. Its job is authority, trust, brand memory and community connection.

## 10. Accessibility / mobile

- semantic headings and landmarks;
- timeline must remain understandable without visual connector lines;
- Urdu text uses `lang="ur" dir="rtl"`;
- no meaning conveyed by colour alone;
- `details/summary` methodology is keyboard accessible;
- large numeric displays have adjacent textual labels;
- 360px mobile width has no horizontal overflow;
- story CTA remains secondary to page reading, never sticky;
- prefers-reduced-motion must not lose content.

## 11. Acceptance gates

The epic is complete only when:

- [ ] Heritage A page is live, responsive and claim-disciplined.
- [ ] A public methodology explains measured vs estimated numbers.
- [ ] About links to the heritage page without duplicating it.
- [ ] Any homepage heritage marker passes mobile first-value acceptance.
- [ ] Story collection uses explicit consent and human moderation.
- [ ] No fake testimonial has ever been seeded.
- [ ] Published stories can be removed/unpublished.
- [ ] Privacy/terms reflect story handling before the dedicated form is promoted.
- [ ] Product OS can manage story moderation without exposing private writing.
- [ ] SEO, shell, language-firewall, ads-policy and browser/mobile tests pass.

## 12. Non-goals

- reconstructing or storing historical user text;
- claiming exact lifetime words/users/hours without evidence;
- creating a public social profile system;
- comments, likes or follows on heritage stories;
- AI-generated testimonials;
- using story submissions to train a model;
- putting a new homepage modal/banner ahead of the editor;
- monetizing the heritage page in this epic.
