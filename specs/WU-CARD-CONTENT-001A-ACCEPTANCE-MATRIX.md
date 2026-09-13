# WU-CARD-CONTENT-001A — Acceptance Matrix

**Parent:** `WU-CARD-CONTENT-001-ready-made-urdu-cards-gallery.md`
**Child:** `WU-CARD-CONTENT-001A-recurring-social-content-library.md`

The recurring library is an editorial product asset. A batch is not accepted merely because data validates or the gallery renders.

| Area | Acceptance | Priority | Evidence |
| --- | --- | --- | --- |
| Canonical ownership | New prepared content lives in the existing `WU-CARD-CONTENT-001` data architecture | P0 | source review |
| Compatibility | Existing public card IDs/consumers remain valid | P0 | contract tests |
| IDs | No duplicate public card/message/preset IDs | P0 | validation |
| Categories | Every public item uses a bounded known category | P0 | validation |
| Contexts | Homepage-eligible item uses only known recurring contexts | P0 | validation |
| Urdu text | Public item has non-empty reviewed Urdu text | P0 | validation + editorial review |
| Background | Every public preset resolves a shared background ID | P0 | registry validation |
| Visual fit | Text fits safe area with strong contrast and no clipping | P0 | visual/browser QA |
| Mobile | Representative items remain readable at 320–430px | P0 | browser/manual QA |
| Share output | Representative exported/published cards remain receiver-readable | P0 | render/share QA |
| Original content | General original messages have clear original/Write Urdu status | P0 | metadata review |
| Quran/Hadith | Any sourced religious text has verified source/provenance | P0 | editorial/source evidence |
| General dua | Original/general prayer is not mislabeled Quran/Hadith | P0 | metadata/editorial review |
| Poetry rights | Modern copyrighted poetry is excluded without license/permission | P0 | rights review |
| Attribution | Named quotation attribution is verified or omitted | P0 | source review |
| Blocked rights | `hold-rights-unclear` or equivalent never renders publicly | P0 | validation |
| Homepage safety | Featured subset is broad, short/medium, safe and manually approved | P0 | metadata + review |
| Homepage depth | Morning/night/Jumma/dua each have multiple eligible choices after first batch | P1 | registry audit |
| Natural language | No obvious machine-translation stiffness/engineering language | P0 | Urdu editorial review |
| No scraping | Production copy is not lifted from Pinterest/Instagram/Reddit posts | P0 | provenance review |
| No filler | Near-duplicate wording is not used solely to inflate corpus | P1 | duplicate/editorial review |
| Telemetry privacy | Only controlled public content IDs/categories are measured; user edits remain private | P0 | telemetry/source review |
| Regression | `/urdu-cards` browse/share and Card Studio handoff remain green | P0 | automated/browser tests |
| Selector regression | Homepage selector remains deterministic if context metadata changes | P0 | selector tests |
| Maintainability | Batch is small/reviewable; no unnecessary schema migration bundled | P1 | PR review |

---

## First-batch acceptance target

`001A.1` should normally add roughly **30–40 approved items** across recurring essentials. The count is flexible downward when editorial/visual review rejects candidates.

The batch must materially improve all four of:

```text
morning
night
jumma
dua/reflection
```

A batch containing 40 items but leaving one recurring family with only one usable homepage candidate is not complete.

---

## Homepage-featured eligibility questions

Every item marked homepage-eligible must pass all of these:

1. Would this make sense to a broad Urdu-speaking visitor without knowing anything about them?
2. Is the wording short/clear enough to understand quickly on a phone?
3. Is the content appropriate to show unprompted on the general homepage?
4. Are its source/rights unambiguous?
5. Does its selected background render beautifully at mobile size?
6. Is its recurring context explicit and correct?
7. Would showing it repeatedly during its context feel respectful, not manipulative?

Any “no” means it may remain in `/urdu-cards` if otherwise appropriate, but should not be homepage-featured.

---

## Religious-content blockers

Do not publish/feature if:

- exact Quran/Hadith wording/source cannot be verified;
- Urdu translation provenance/rights are unclear when a sourced translation is used;
- a general internet quote is attributed to Prophet Muhammad ﷺ, Hazrat Ali, a scholar or another figure without credible evidence;
- an original prayer is presented as a sourced prophetic dua;
- wording materially changes a sourced text while retaining exact-source attribution.

Original respectful general prayers are allowed when represented honestly as original/general content.

---

## Poetry/literature blockers

Do not publish if:

- a modern poet's text is included without established permission/license;
- song lyrics are repurposed as quote cards without rights;
- public-domain status is merely assumed because a poet is famous;
- attribution is based only on a social-media graphic/search result;
- wording cannot be confidently verified.

Prefer original Write Urdu lines when rights certainty is low.

---

## Visual sample minimum

For each PR/batch, manually sample at least:

- one short and one medium item from each newly expanded family;
- the longest new item;
- multiple background visual families;
- one homepage-eligible morning item;
- one homepage-eligible night item;
- one homepage-eligible Jumma item;
- one homepage-eligible dua item;
- one actual share/export render;
- one Card Studio handoff.

If a batch is large enough that this sample misses obvious visual classes, expand the sample rather than treating the minimum as a ceiling.

---

## Release blockers

Do not merge a content batch if any of these are true:

- validation is red;
- new card IDs collide;
- public items reference missing backgrounds;
- unverified sourced religious content is present;
- copyright/attribution status is unclear for public poetry;
- homepage-featured content includes unsafe/intense default themes;
- several cards visibly clip or collide with art;
- existing `/urdu-cards` Share is broken;
- Card Studio handoff is broken;
- homepage selector no longer returns stable results;
- the PR bundles an unnecessary large architecture rewrite that prevents meaningful editorial review.
