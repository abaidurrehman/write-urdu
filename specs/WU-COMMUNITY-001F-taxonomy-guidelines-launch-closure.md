# WU-COMMUNITY-001F — Taxonomy + Guidelines + Launch Closure

**Parent:** `WU-COMMUNITY-001`  
**Status:** Planned  
**Date:** 2026-08-25  
**Scope:** category discovery, indexing thresholds, guidelines/privacy/terms, route/navigation integration, AdSense boundary, telemetry/OS metrics, feature flags, launch and rollback proof  
**Depends on:** `WU-COMMUNITY-001A` through `WU-COMMUNITY-001E`

---

## 1. Goal

Close the product, editorial, legal, SEO, measurement and rollout gaps required before broad public promotion of Urdu Writers.

This slice does not invent new social mechanics. It makes the already-built publishing loop safe, understandable, measurable and operable.

---

## 2. Launch definition

The community feature is not considered launched merely because `/urdu-writers/:slug` renders.

Broad launch requires all of the following to be true:

```text
submission works
human moderation works
public-only-approved boundary works
writer withdrawal works
reporting works
community guidelines exist
privacy/terms are reconciled
indexing rules are correct
OS can see queue/report health
telemetry contains no writing
route/ad/service-worker registries are reconciled
rollback flags work
```

---

## 3. Taxonomy governance

Keep v1 controlled taxonomy from Slice A.

Primary categories:

```text
poetry
essay
prose
thought
story
```

Curated tags:

```text
ghazal
nazm
shayari
essay
prose
critical-thinking
personal-reflection
society
culture
education
story
other
```

Rules:

- one primary category per publication;
- 1–5 curated tags;
- no user-created public tag URLs;
- taxonomy changes require a product/editorial migration plan;
- renaming a label does not silently change stored stable key;
- category/tag labels should have natural Urdu display strings in the Urdu-facing UI.

---

## 4. Category pages

Route:

```text
/urdu-writers/category/:category
```

Functional category filtering may ship earlier, but indexability is controlled here.

Initial indexing rule:

```text
fewer than 5 published reviewed works → noindex,follow
5+ useful published reviewed works → eligible for index,follow after manual SEO review
```

The threshold is a starting operational guard, not a ranking guarantee.

A category page eligible for indexing must have:

- unique title/H1;
- concise category intro;
- meaningful list of approved works;
- canonical;
- no empty/thin tag clouds;
- pagination behavior that avoids duplicate crawl traps.

Do not create public indexable pages for every curated tag in v1.

---

## 5. Community Guidelines

Create a concise public route:

```text
/community-guidelines
```

The page must be written for end users, not as an engineering policy.

Minimum policy topics:

### Authorship and rights

- submit your own writing or writing you have permission to publish;
- do not copy poems, books, articles or other copyrighted works without permission;
- attribution does not automatically make unauthorized copying acceptable.

### Privacy

- do not publish private/personal information about another person without a legitimate basis/permission;
- avoid phone numbers, addresses, IDs, private messages or sensitive personal details.

### Safety and conduct

- no harassment, hateful abuse, exploitation, illegal material or instructions designed to harm others;
- no sexual exploitation or sexual content involving minors;
- no direct threats or targeted abuse.

### Quality/spam

- no disguised advertising, repeated promotional links or automated bulk submissions;
- submissions should be meaningful writing rather than keyword stuffing or copied filler.

### Moderation

- WriteUrdu may approve, reject or remove writing under the guidelines;
- approval means suitable for publication on the service, not an endorsement of the ideas expressed;
- writers can withdraw their own publication;
- readers can report copyright/privacy/abuse concerns.

### Rights statement

Use product/legal wording equivalent to:

```text
You keep the copyright in writing you own. By submitting it for publication, you give WriteUrdu permission to display and distribute the approved version through the WriteUrdu service until it is withdrawn or removed, subject to the publishing terms.
```

Do not claim WriteUrdu owns the writer’s copyright.

Legal language should be reviewed before broad launch if the product needs jurisdiction-specific enforceability.

---

## 6. Privacy reconciliation

Update existing Privacy copy to distinguish:

```text
local writing
My Documents account-backed private writing
anonymous/direct share snapshots
community submissions under review
approved public community publications
moderation/report records
```

Privacy must explain at a useful level:

- account required for community submission;
- submitted snapshot is stored for review;
- public name/approved writing becomes public only after approval;
- provider email is not published by default;
- moderation/report metadata may be retained for operations/abuse handling;
- withdrawal removes public visibility but does not necessarily erase all minimal audit records immediately if documented operational/legal retention applies;
- private source document is separate from public snapshot;
- account deletion interaction.

Do not leak database/table names into user-facing Privacy copy.

---

## 7. Terms/publishing consent reconciliation

If the site has existing Terms, add a community publishing section. If it does not, create the minimum appropriate publishing terms route before broad launch.

Required concepts:

- writer represents that they have rights to submit;
- writer retains ownership of rights they already hold;
- limited license/permission to host, render, distribute and technically reproduce the approved submission as part of WriteUrdu;
- moderation/removal rights;
- withdrawal process;
- report/takedown contact path;
- no guarantee of approval, traffic, permanence or search ranking;
- prohibited abuse/spam/copyright infringement.

The exact legal wording should not overclaim beyond actual product behavior.

---

## 8. Navigation and discovery

Add `Urdu Writers` as a purposeful content destination without displacing core typing intent.

Potential discovery points:

- global Learn/Create/Community-adjacent navigation location consistent with current V2 IA;
- post-writing publish prompt/manual action;
- My Publications account area;
- `/urdu-writers` reader hub;
- relevant footer/content links.

Do not add a giant community module above the homepage editor.

The primary homepage job remains Urdu typing/writing.

---

## 9. Sitemap and robots integration

Reconcile:

```text
main sitemap/sitemap index
robots.txt if needed
llms.txt policy
route registry
SEO contract tests
```

Rules:

- only published detail URLs in community sitemap;
- category URLs only when indexing gate is met;
- `/my-publications` and submission/moderation APIs never indexed;
- `/s/:id` remains separate noindex share loop;
- community guidelines/privacy/terms follow the site's normal public trust-page indexing policy;
- no pending/rejected/withdrawn URL in any discovery file.

---

## 10. AdSense policy and placement

Community reading pages can eventually contribute monetizable pageviews, but ads must not degrade the writing or create incentive for low-quality UGC.

Initial placement contract:

### `/urdu-writers` hub

Eligible for the site's normal Learn/reading-page ad governance only after content density is useful.

### `/urdu-writers/:slug`

No ad inserted inside writer text.

At most use established safe boundaries such as:

```text
after the complete writing
between reading content and related-writing/footer area
```

only if current AdSense operating contract permits it.

### Private/moderation/submission routes

No ads on:

```text
submission sheet/page
/my-publications
Product OS moderation
```

Do not increase global Auto-ads load as part of this feature.

Register protected content boundaries so Auto ads cannot split title/author/body/report controls where the existing ad architecture supports exclusions.

---

## 11. Telemetry contract

Final allowed event family:

```text
community_publish_prompt_shown
community_publish_prompt_clicked
community_publish_manual_clicked
community_submission_started
community_submission_completed
community_submission_failed
community_my_publications_viewed
community_revision_started
community_revision_submitted
community_publication_withdrawn
community_publication_viewed
community_write_cta_clicked
community_report_submitted
```

Never emit:

```text
title
body/excerpt
public author name
email
user ID
document ID
submission ID
publication ID/slug
content signature
moderator identity
```

Every event schema should be explicitly tested against forbidden content fields.

---

## 12. Product OS metrics

Add a privacy-safe operational pulse for the moderator/product owner.

Useful aggregate metrics:

```text
pending submissions
oldest pending age
submissions last 1/7/30 days
approved last 1/7/30 days
rejected last 1/7/30 days
approval rate
published total
withdrawn/unpublished total
reports last 1/7/30 days
public views aggregate
reader → write CTA aggregate
writer submission completion aggregate
```

Do not show raw writing or user identity in aggregate dashboard metrics.

Queue/detail remain the intentional places for moderators to inspect content.

---

## 13. Moderation capacity guard

UGC quality is limited by moderation capacity.

Before broad promotion, define an operating threshold such as:

```text
oldest pending submission should normally be reviewed within 72 hours
```

If the pending queue grows beyond sustainable capacity, product owner must be able to:

- disable `COMMUNITY_SUBMISSIONS_ENABLED` temporarily;
- keep published reader pages available;
- show a truthful “submissions temporarily paused” message;
- continue writer access to My Publications/withdrawal.

Do not solve moderation overload by enabling automatic AI approval in this epic.

AI may later assist with triage only under a separate reviewed feature; human approval remains the current contract.

---

## 14. Rollout flags

Use at least:

```text
COMMUNITY_SUBMISSIONS_ENABLED
COMMUNITY_PUBLIC_ENABLED
```

Recommended staged rollout:

### Stage 0 — schema/API dark

```text
submissions=false
public=false
```

### Stage 1 — internal/limited submission proof

```text
submissions=true for controlled test cohort/environment
public=false
```

### Stage 2 — moderation + public canary

```text
submissions=true
public=true
```

with only deliberately approved seed/test writing.

### Stage 3 — broad discovery

Enable navigation/indexing/sitemap promotion after production checks.

If cohort gating is not already supported, use preview/staging environments rather than invent insecure client flags.

---

## 15. Rollback

### Disable new submissions

```text
COMMUNITY_SUBMISSIONS_ENABLED=false
```

Effects:

- writing/editors continue normally;
- existing published content remains readable if public flag remains true;
- writers can still access/manage existing publications if implementation allows read/withdraw independent of submission creation.

### Disable public community

```text
COMMUNITY_PUBLIC_ENABLED=false
```

Effects:

- public hub/detail/category/sitemap fail closed/noindex/unavailable according route contract;
- private submissions/moderation data retained;
- private writing untouched.

Normal rollback never drops community tables.

---

## 16. Production launch checklist

### Data/security

- [ ] migration applied to correct existing D1 database;
- [ ] auth/session owner isolation proven;
- [ ] OS Access moderation write boundary proven on production host;
- [ ] stale moderation/revision tests green;
- [ ] no public read from submission/private tables;
- [ ] withdrawal removes public visibility immediately.

### Product

- [ ] Basic/Rich/Keyboard/Voice manual publishing works;
- [ ] meaningful-writing prompt non-blocking;
- [ ] OAuth continuity proof green;
- [ ] short poem manual submission proof green;
- [ ] My Publications states correct;
- [ ] report flow reaches OS visibility.

### SEO

- [ ] raw HTML contains approved Urdu body;
- [ ] canonical/robots/JSON-LD validated;
- [ ] community sitemap published-only;
- [ ] withdrawn URL removed/410/noindex;
- [ ] no thin category page indexed before threshold/manual review;
- [ ] `/s/:id` remains noindex.

### Privacy/legal

- [ ] Community Guidelines live;
- [ ] Privacy updated;
- [ ] publishing terms/consent version live;
- [ ] report/takedown/contact path works;
- [ ] account deletion interaction documented.

### Monetization

- [ ] community route classified in ad governance;
- [ ] no ad inside writing body/private/moderation surfaces;
- [ ] mobile ad placement does not cover writer/read controls.

### Operations

- [ ] OS pending/reports pulse available;
- [ ] submission pause flag tested;
- [ ] public disable flag tested;
- [ ] queue capacity/oldest-pending check recorded.

---

## 17. Quality metrics after launch

Observe, do not fabricate targets without baseline.

Track trends for:

```text
engaged writing sessions → publish prompt/manual entry
publish entry → completed submission
submission → approval
median moderation time
approved publication → reader views
reader view → Write your own Urdu CTA
published writers → repeat submissions
reports per published view
withdrawal/removal rate
Search Console impressions/clicks for community corpus
AdSense pageviews/RPM only where ads are deliberately enabled
```

A large count of low-quality indexed pages is not success.

---

## 18. Out of scope

Still excluded from `WU-COMMUNITY-001` v1:

```text
comments
likes/reactions
followers
DMs
public writer profile pages
personalized social feed
leaderboards
open free-form tags
AI auto-approval
bulk import/publish of old drafts
paid creator monetization
email newsletter system
```

Any of these needs separate evidence, moderation and privacy design.

---

## 19. Tests

### Taxonomy/indexing

- stable category keys/labels;
- category < threshold remains noindex;
- category eligible threshold can be manually promoted/indexed according implementation contract;
- no tag archive crawl explosion.

### Policy routes

- guidelines reachable and linked from submission;
- privacy contains community publishing distinction;
- terms/consent version matches server stored `guidelines_version`/terms version strategy.

### Ads/routes

- private/moderation routes ad-free;
- detail body protected from in-content placement;
- route registry/service worker does not cache private responses incorrectly.

### Telemetry

- all community events reject/omit forbidden content/identity fields;
- aggregate OS metrics contain no writing/user identity.

### Rollout

- submissions flag disables create but not core writing;
- public flag disables public corpus safely;
- no table drop on rollback;
- existing My Documents/share/auth/voice/editor suites remain green.

---

## 20. Acceptance criteria

- [ ] Controlled taxonomy governance is explicit and no free-form tag archive exists.
- [ ] Category indexability is conservative and quality-gated.
- [ ] `/community-guidelines` is live and linked from submission/reporting context.
- [ ] Privacy and publishing terms reflect actual storage/publication/withdrawal behavior.
- [ ] Urdu Writers discovery is added without displacing the homepage writing job.
- [ ] Sitemap/robots/route registries contain published-only community discovery.
- [ ] Community ad classification protects writer body and keeps private/moderation surfaces ad-free.
- [ ] Community telemetry schemas forbid writing/identity/IDs.
- [ ] OS operational metrics show queue/reports/aggregate funnel health.
- [ ] Submission-pause and public-disable rollback flags are production-tested.
- [ ] Launch checklist is completed before broad promotion/indexing.
- [ ] Full repository + production smoke regressions pass.

---

## 21. Stop conditions

Stop broad launch if any of the following is true:

- moderation backlog is uncontrolled and cannot be paused;
- pending/rejected/private content appears in public discovery;
- copyright/privacy report path is missing;
- writer copyright is claimed by WriteUrdu;
- arbitrary tags generate thin indexable pages;
- private/moderation routes show ads;
- writing/identity leaks into telemetry;
- withdrawal does not remove public visibility promptly;
- rollback requires dropping shared D1 tables;
- product proposes AI auto-approval to solve queue volume without a separate reviewed contract.
