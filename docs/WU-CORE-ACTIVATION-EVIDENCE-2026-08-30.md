# WriteUrdu Core Activation Evidence — 30 August 2026

This note records the evidence that governs `WU-PLAT-002H`. It exists so future UI work can distinguish measured facts from hypotheses and avoid rewriting the product from memory.

## Decision summary

The current product is broad enough. The immediate strategic job is to improve the proven core loop before adding another major feature:

`find WriteUrdu -> start Urdu -> get a useful result -> continue appropriately -> keep/share/publish -> return`

The founder commercial target remains $5/day AdSense. Product work should move that outcome through useful organic traffic, task success, useful continuation and repeat use rather than intrusive ads or manufactured pageviews.

## Product Pulse evidence (7-day view reviewed 2026-08-30)

### Overall

- Product visits: 5,279
- Engaged visits: 3,686
- Engagement rate: 69.8%
- Copy completions: 100
- Exports completed: 613

### Tool concentration

| Tool | Visits | Engaged | Engagement | Notable outcome |
| --- | ---: | ---: | ---: | --- |
| Basic editor | 3,597 | 2,573 | 71.5% | 502 exports |
| Rich editor | 760 | 647 | 85.1% | 96 exports |
| Voice typing | 300 | 164 | 54.7% | 34 copies |
| Stylish Urdu Text | 239 | 155 | 64.9% | 57 copies |
| Card Studio | 103 | 57 | 55.3% | 40 canvas edits, 3 exports |
| Urdu keyboard | 66 | 27 | 40.9% | — |
| Name Art | 62 | 37 | 59.7% | 24 canvas edits, 11 exports |
| Instagram Post | 30 | 4 | 13.3% | 1 export |
| WhatsApp Status | 19 | 8 | 42.1% | 6 canvas edits |
| Invoice Generator | 12 | 0 | 0% | 0 |
| QR Generator | 8 | 1 | 12.5% | 0 |

Basic + Rich + Voice + Stylish comprise about 92.7% of measured product visits. This is the main reason feature breadth is frozen during the activation phase.

### Writing depth

| Characters | Sessions |
| --- | ---: |
| 0 | 1,000 |
| 1–20 | 211 |
| 21–50 | 101 |
| 51–100 | 71 |
| 101–250 | 44 |
| 251–500 | 46 |
| 501–1,000 | 91 |
| 1,001–2,500 | 109 |
| 2,500+ | 126 |

Interpretation guardrail: the 1,000 zero-char sessions are not automatically abandonment. The first-value funnel must distinguish visibility, focus, input, successful Urdu and outcome.

Among sessions with writing, 326 reached 500+ characters and 235 reached 1,000+ characters. This is the evidence for a serious-writer state and contextual save/Rich/community prompts.

### Active-use time

- 0–10s: 568
- 11–30s: 690
- 31–60s: 283
- 61–180s: 239
- 181–600s: 81
- 600s+: 40

A short session is not inherently bad. Fast successful utility use is valid. Optimize first success and useful outcome, not dwell time.

### Input modes

Writing summaries:

- Roman/English-letter + Urdu flow: 591
- Direct Urdu / English: 157

User-facing acquisition language should remain simple (`English to Urdu typing`, `Urdu typing`) rather than leading with `transliteration`.

### Voice

Dedicated Voice & Accounts block:

- Voice visitors: 238
- Tried voice typing: 84
- Produced Urdu text: 52
- Voice success rate after try: 61.9%
- New accounts: 15
- Voice-assisted sign-ups: 1

Voice across workspaces:

- Voice exposed: 2,397
- Voice started: 167
- Rich Editor: 156 starts / 760 visits = 20.5% adoption
- Basic Editor: 8 starts / 3,597 visits ~= 0.2% adoption

Interpretation: Voice has proven use inside serious writing but appears under-discovered in Basic Writer. Test it as an input choice, not another generic tool promo.

### Outputs

- PDF: 278
- Word: 230
- PNG: 102
- TXT: 3
- JPEG: 0
- SVG: 0

PDF + Word are 82.9% of measured exports. Prioritize them for substantial writing; do not give every output equal pre-value prominence.

### Share loop

- Publish link attempts/funnel volume: 7
- Published links: 5
- Public views: 9
- CTA clicks: 8
- Referred starts: 0
- Republishes: 0

Because CTA clicks are already high in this tiny sample, the first investigation is post-click continuity/measurement, not more CTA visibility.

### Card Studio vs Name Art

- Card Studio: 40 canvas edits -> 3 exports (7.5% edit-to-export)
- Name Art: 24 canvas edits -> 11 exports (45.8%)

This does not prove the cause. It is sufficient evidence to instrument completion and test a simpler default Card path before acquisition expansion.

### Handoffs

Product outcomes show 91 handoffs across the current period. Use this as a directional signal only; eligible-session denominators are needed before setting a target.

## Search Console evidence reviewed 2026-08-30

### Query opportunity

The dominant query is `english to urdu typing`, with roughly 51k impressions, average position around 7.1 and extremely weak CTR around 0.07% in the reviewed export.

This reinforces two UX/SEO rules:

1. protect simple user language such as `English to Urdu Typing` and `Urdu Typing Online`;
2. do not lead with technical vocabulary such as `transliteration` or require users to understand `Roman Urdu` before they can start.

### Device gap

Mobile has much larger search exposure and better average ranking than desktop but materially weaker CTR. The first mobile viewport must therefore be treated as a primary acquisition/activation surface, not a compressed desktop page.

## Revenue interpretation

The current repository does not yet establish a comparable post-restoration AdSense RPM/earnings baseline. Therefore no spec should claim that a specific UI change will deliver $5/day.

Once a real page RPM is available:

`required monetizable pageviews/day = 5 * 1000 / page RPM`

The route to the target should combine:

- better CTR on already-earned organic impressions;
- higher first-value/task success;
- useful second-page continuation where it genuinely advances the task;
- more return usage;
- page-type monetization that stays outside active writing controls.

## UX conclusions permitted by the evidence

We can safely test:

- fewer pre-value commands;
- coherent input choice including Voice;
- contextual next actions;
- stronger Basic -> Rich escalation for substantial writing;
- value-triggered Keep/Share/Publish arbitration;
- share destination continuity;
- Card Studio completion simplification after instrumentation.

We cannot yet claim:

- every zero-char session is abandonment;
- long sessions are better than short sessions;
- Card Studio complexity is definitely the export cause;
- community CTA wording is the share-loop problem;
- a specific RPM or traffic number will produce $5/day;
- every low-usage tool should be deleted.

## Roadmap rule

Before any major feature work resumes, `WU-PLAT-002H` should have at least:

1. first-value measurement live;
2. Basic Writer early-state simplification tested;
3. contextual continuation/Basic->Rich path measured;
4. growth CTA arbitration live;
5. share referral continuity understood or fixed.

This document is a dated evidence record. Future Product Pulse/GSC reviews may supersede the numbers, but they should update the active spec/backlog rather than silently changing UX direction.
