# WriteUrdu — AdSense Strategy Feedback Reconciliation

**Date:** 2026-08-12  
**Status:** Planning input — reconciled  
**Canonical roadmap:** `specs/BACKLOG.md`  
**Commercial strategy:** `specs/WU-GROWTH-001-search-adsense-growth-system.md`  
**Operating contract:** `docs/WU-ADSENSE-OPERATING-CONTRACT.md`

## Purpose

This note reconciles the August 12 external AdSense/SEO audit with the existing WriteUrdu roadmap. It is deliberately **not a competing strategy document**. Useful findings are absorbed into existing P0/P1 work; speculative, generic or outdated recommendations are recorded so they do not re-enter the roadmap later as apparently new ideas.

The governing principle remains:

> Grow useful organic traffic and monetizable pageviews while protecting the Urdu-writing task, established search authority, mobile usability and Core Web Vitals.

## 1. Adopt now — already aligned with the roadmap

### 1.1 Treat AdSense as a measured product system

Keep the existing Write / Learn / Create / Trust monetization architecture. Do not optimize by raw ad count.

Planning implications:

- complete AdSense account-side URL/custom-channel setup;
- configure Auto-ads page exclusions and excluded areas;
- establish a comparable post-restoration baseline by earnings, page RPM, pageviews/ad impressions, country, device, page/URL and placement where available;
- annotate major deployment/ad-serving changes beside revenue trends;
- evaluate revenue together with Search Console and product/task behavior.

**Roadmap mapping:** P0.1A, P0.1B, `WU-GROWTH-001` Growth Slices A/B.

### 1.2 Verify monetization plumbing, do not assume it is absent

External observation that ads are not visible on a sampled page is not sufficient evidence that AdSense is unimplemented. The repository already contains an AdSense runtime and page-type policy, and the July 2026 serving regression has been separately diagnosed and repaired.

Add/retain explicit production checks for:

- AdSense site/account approval status;
- correct publisher/client ID in production;
- one loader only;
- serving on approved placements;
- no ads inside protected editor/workspace regions;
- no accidental duplicate legacy units;
- `ads.txt` reachable at `/ads.txt`, syntactically valid and containing the correct publisher relationship.

**Roadmap mapping:** P0.1A operational verification.

### 1.3 Improve useful internal journeys

Adopt the audit's internal-linking concern, but implement it as **next useful task navigation**, not pageview circulation.

Priority journeys remain:

- Write → Rich Editor / Keyboard;
- Write → Card Studio / Stylish Text / Name Art when visual creation is the next job;
- Roman Urdu guide → live Roman Urdu typing;
- Alphabet → Keyboard;
- Fonts → Editor / Card Studio;
- WhatsApp / Word / Google Docs guidance → relevant writing surface;
- Card Studio ↔ Templates and adjacent creation tools.

**Roadmap mapping:** P0.5.

### 1.4 Expand content around real Urdu-writing jobs

Retain the strongest content hypotheses from the audit, but gate them by query evidence and distinct intent.

Candidate clusters:

- how to type Urdu in WhatsApp;
- how to type Urdu in Microsoft Word;
- how to type Urdu in Google Docs;
- Urdu punctuation, numerals and RTL direction;
- Roman Urdu spelling/examples where reviewed examples add value;
- Urdu fonts / Nastaliq vs Naskh usage guidance;
- Urdu typing practice / WPM / exam-practice demand as a distinct product hypothesis.

Do not launch these as a bulk blog program. Prefer one evidence-backed cluster with 1–3 strong pages, then measure.

**Roadmap mapping:** P1.2, P1.6, P2.3.

### 1.5 Test monetization on Learn pages first

The safest place to improve ad economics remains long-form Learn/reference content.

Experiment queue:

1. `guide_after_answer` baseline versus a controlled alternative;
2. desktop side rail where the reading layout supports it;
3. Multiplex at true content end on sufficiently long guides;
4. mobile bottom anchor on Learn pages;
5. only later, a carefully bounded post-workspace experiment on core Write routes.

Every experiment must be evaluated on revenue, task/navigation behavior and Core Web Vitals.

**Roadmap mapping:** P1.3.

## 2. Validate before acting

### 2.1 `ads.txt`

Treat this as a concrete production verification item. Do not assume either presence or absence from a third-party audit alone.

Acceptance:

- `/ads.txt` returns HTTP 200 in production;
- publisher ID is correct;
- relationship type is correct;
- no stale/unauthorized entries remain;
- AdSense reports the file as authorized after normal processing time.

### 2.2 Geography/device economics

Pakistan/India/diaspora assumptions may be directionally useful, but generic RPM numbers are not planning inputs. Use actual country/device AdSense data before changing acquisition or page priorities.

### 2.3 Typing-practice / WPM product

This is strategically interesting because it may create repeat-use behavior and distinct search intent. Validate with Search Console and external query research before creating a feature spec.

### 2.4 Additional analytics

GA4, Cloudflare analytics or another privacy-appropriate source can help distinguish true site traffic from AdSense-serving changes. Add only if it improves decision quality without creating unnecessary instrumentation burden.

## 3. Hold / experiment later

### 3.1 Vignette ads

Do not enable as a default. They can interrupt transitions between useful product surfaces. Test only after the base monetization system is stable, with conservative frequency and explicit task-journey guardrails.

### 3.2 Anchor ads on core editors

Anchor ads may be tested on Learn/reference pages first. Do not extend them automatically to `/`, `/urdu-editor` or `/urdu-keyboard`.

### 3.3 Additional tool expansion

Do not add dictionary, grammar or generic utility tools merely because each new tool could host ads. New tools must have a strong Urdu-writing job, realistic search demand, product usefulness and maintenance case.

### 3.4 International/language expansion

Hindi or other language expansion is not an AdSense shortcut. Keep outside the active roadmap until the Urdu authority/revenue system is working and there is explicit product/search evidence.

## 4. Reject as current strategy

### 4.1 Universal banner above the main writing tool

Reject a default 728×90/header placement above the core workspace. It competes with the highest-value user task and can displace the writing experience above the fold.

### 4.2 Enable all Auto Ads immediately

Reject site-wide maximum Auto Ads load. Use page exclusions, excluded areas and controlled experiments.

### 4.3 Arbitrary three-ad-unit rule

Do not use a fixed `<= 3 units/page` planning rule. The governing constraints are policy compliance, content/ad balance, accidental-click prevention, usability, performance and experiment results.

### 4.4 Block low-paying categories to increase RPM

Do not use broad category blocking as a generic revenue optimization technique. Use blocking for suitability/brand-safety reasons and judge economics from actual auction/revenue results.

### 4.5 Bulk content production

Reject targets such as `10–15 articles immediately` or `50+ articles` without evidence. WriteUrdu should compound existing authority with strong intent owners, not become a generic content farm.

### 4.6 Generic revenue projections

Do not plan from assumed pageviews, RPM or promised `3–5x` content RPM improvements. Revenue scenarios must be derived from observed WriteUrdu data and explicitly labeled by confidence.

### 4.7 Related Search for Auto Ads

Do not plan or implement it. It has been discontinued and already belongs in the roadmap's reject/hold knowledge.

## 5. Planning deltas from this review

The external audit does **not** justify a new roadmap track. It adds the following concrete deltas to the existing plan:

- [ ] Verify production `/ads.txt` and AdSense authorization status under P0.1A.
- [ ] Verify publisher/client ID and site approval/serving status as part of the monetization plumbing check.
- [ ] Keep country/device/page/format breakdowns explicit in the first clean AdSense baseline.
- [ ] Treat mobile anchor as a Learn-page experiment, not a default site-wide format.
- [ ] Retain typing practice/WPM/exam intent as an evidence-gated P1 product hypothesis.
- [ ] Retain WhatsApp, Word, Google Docs, punctuation/numerals/RTL and font guidance as evidence-gated content clusters.
- [ ] Preserve a written reject list for universal top-of-tool banners, maximum Auto Ads, bulk blogging, speculative RPM targets and unrelated tool proliferation.

## 6. Decision rule for future external audits

Future consultant/AI audits should be treated as **hypothesis sources**, not roadmap owners.

For every recommendation:

1. check whether it already exists in the backlog/specs;
2. verify factual/product-policy claims when current guidance matters;
3. map useful ideas into the canonical P0/P1/P2 structure;
4. reject duplicates, unsupported revenue claims and recommendations that conflict with the product task;
5. avoid creating parallel strategy documents unless a genuinely new strategic decision is required.
