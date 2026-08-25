---
name: wu-community-publishing
description: Implement or review WU-COMMUNITY-001 for WriteUrdu. Build authenticated Urdu writing submissions, long-writing publish prompts, Product OS moderation, approved immutable public snapshots, /urdu-writers SSR pages, taxonomy, reporting, revisions and withdrawal while preserving private My Documents and local-first writing.
---

# WriteUrdu Community Publishing — moderated Urdu Writers

Read first:

1. `specs/WU-COMMUNITY-001-moderated-urdu-writing-publishing.md`
2. `specs/WU-AUTH-001-social-authentication-foundation.md`
3. `specs/WU-DRAFT-001-cross-device-cloud-drafts.md`
4. `specs/WU-GROWTH-002-account-save-share-entry-points.md`
5. `specs/WU-SHARE-001-public-share-pages-viral-publishing-loop.md`
6. current `functions/lib/auth.mjs`
7. current `/api/documents*` handlers and document client modules
8. current Product OS internal endpoint patterns
9. current `functions/s/[id].js` and share report implementation
10. current migration, route, SEO, sitemap, AdSense and service-worker registries.

## Core rule

**Private writing is never the public object.**

The only path to public content is:

```text
editor / My Documents
  → explicit authenticated snapshot
  → community_writing_submissions
  → Product OS human approval
  → community_writing_publications
  → /urdu-writers/:slug
```

Never point a public page at `writing_documents`.

Never let a post-approval private edit mutate the approved publication.

## Database decision

Use:

```text
env.METRICS_DB
```

Do not create another D1 database.

At the 2026-08-25 baseline, inspect current migrations and expect the next migration to be around:

```text
0009_community_writing.sql
```

Reconcile numbering with current `main`; never renumber or edit applied migrations.

Add product-owned community tables only. Preserve telemetry, share-artifact, Auth.js and `writing_documents` tables unchanged.

## Phase 1 — schema and writer API

Create at least:

```text
community_writing_submissions
community_writing_publications
```

Submission ownership is always `session.user.id` from the project auth wrapper.

Initial primary categories:

```text
poetry
essay
prose
thought
story
```

Initial curated tags:

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

- exactly one category;
- 1–5 curated tags;
- no free-form tags in v1;
- public author name chosen explicitly by user;
- never auto-publish account email/name/photo;
- title <= 180 chars;
- public name <= 80 chars;
- manual submission body minimum 80 chars;
- strict rich HTML sanitizer if rich format is retained;
- body/title/name never enter logs/telemetry.

Writer routes require auth and `Cache-Control: no-store`.

## Phase 2 — editor discovery and submission

Implement one shared client module, suggested:

```text
js/community-publishing.mjs
```

Do not put publish logic into transliteration internals.

Initial automatic prompt heuristic:

```text
>= 600 non-whitespace characters
OR
>= 90 whitespace-delimited words
```

Eligible automatic prompt surfaces:

- Basic Writer;
- Rich Editor;
- Urdu Keyboard;
- Voice transcript.

Exclude Invoice, QR, Card Studio and other transactional workspaces from the automatic long-writing prompt.

Prompt once per content signature/session and make it dismissible.

Also expose an explicit `Publish to Urdu Writers` action so short poems/ghazals can be submitted without reaching the long-text threshold.

Signed-out submission must preserve writing through the existing safe OAuth/session handoff pattern. Never put text in URL/auth state.

Submission requires explicit confirmation that:

- writer owns/has rights to the work;
- approved work will be public;
- community publishing terms/guidelines are accepted.

## Phase 3 — moderation

Product OS is the only approval surface.

Expected internal routes:

```text
GET  /api/internal/community/moderation?status=pending
GET  /api/internal/community/moderation/:id
POST /api/internal/community/moderation/:id/approve
POST /api/internal/community/moderation/:id/reject
POST /api/internal/community/publications/:id/unpublish
```

Moderation writes must fail closed:

- correct `PRODUCT_OS_HOST`;
- OS hostname protected by Cloudflare Access;
- production write requires authenticated Access identity/header;
- optional moderator allowlist if configured;
- never authorize from a client flag/query parameter.

Queue shows title, chosen public name, tags/category, submitted time, source editor and safe preview.

Do not show account email by default.

Moderator may adjust curated category/tags before approval.

Moderator must not silently rewrite title/body/public author name. Reject/resubmit if writer text needs changes.

Approval must be idempotent and revision-aware.

## Phase 4 — public snapshot

Only `community_writing_publications` can power public routes.

Public routes:

```text
/urdu-writers
/urdu-writers/:slug
/urdu-writers/category/:category
/sitemap-community.xml
```

Public detail must be SSR/crawler-readable and contain:

- approved title;
- approved public author name;
- category/tags;
- publish date;
- exact approved safe text;
- correct `lang="ur"` and `dir="rtl"` where appropriate;
- canonical;
- OG/Twitter metadata;
- suitable Article/CreativeWork JSON-LD;
- report action;
- Write your own Urdu continuation CTA.

Never expose:

- user ID;
- email;
- provider/account data;
- private document ID;
- submission/moderation metadata.

Pending/rejected/withdrawn/unpublished records must be impossible to retrieve through public endpoints.

## Slugs

Generate server-side on first approval.

Use stable identity plus a readable title fragment, e.g.:

```text
a8k2-meri-pehli-ghazal
```

The stable prefix identifies the publication. Do not depend on perfect Urdu-to-Latin transliteration for routing.

Title changes must not automatically break the canonical URL.

## Revision rule

Pending submission can be replaced and revision increments.

After approval:

```text
current approved publication stays live
→ writer submits revision
→ revision becomes pending
→ moderator reviews
→ approved revision replaces public snapshot
```

Never take the old approved version down merely because a new revision is pending.

Stale approval/revision operations fail safely.

## Withdrawal

Writer can withdraw own published writing without waiting for approval.

Withdrawal:

- removes hub/category/sitemap visibility;
- public detail becomes unavailable/`410` + `noindex`;
- does not delete My Documents source;
- does not permit automatic republish.

Republishing requires moderation again.

## My Publications

Provide a noindex authenticated status surface:

```text
In review
Published
Not approved
Withdrawn
Revision in review
```

Keep publication status separate from local/account document save status.

Writer actions:

- open public page;
- revise/resubmit;
- withdraw;
- read rejection reason/note;
- return to source editor/document when safe.

## Public reporting

Every published page supports bounded reporting:

```text
spam
abuse
privacy
copyright
other
```

Reuse existing report rate-limit/security patterns where useful, but do not write community reports into share-artifact tables.

Reports raise moderation visibility; they do not automatically rewrite content.

Moderators can unpublish immediately.

## Guidelines / legal product copy

Before broad launch ship a concise `/community-guidelines` page and reconcile Privacy/Terms.

Copy must explain:

- submit own/licensed work only;
- no private information about others;
- no spam/disguised ads;
- no harassment/hate/exploitation/illegal material;
- no unauthorized copyrighted poems/articles/books;
- WriteUrdu can reject/remove content;
- writer can withdraw own work;
- reporting/takedown path;
- writer retains copyright; WriteUrdu receives permission to display approved work.

Do not claim ownership of writer copyright.

## SEO quality gates

Do not ship indexable UGC until moderation/public-read boundaries are proven.

Required:

- approved/published only in public corpus;
- SSR full text;
- stable canonical;
- published-only community sitemap;
- no thin indexable arbitrary tag/search pages;
- withdrawn content removed from discovery;
- no bulk publication from local/imported history;
- no AI bulk publishing or automatic approval in this epic.

Category pages can remain `noindex,follow` until they contain enough reviewed material to be useful.

## Abuse guards

At minimum:

- auth required;
- max 5 pending submissions/user;
- bounded submission rate;
- server-side taxonomy/content validation;
- duplicate signature may be used as a queue guard;
- ability to disable community submissions for abusive accounts without editing Auth.js tables when evidence requires it.

Never auto-approve based on provider or account age.

## Telemetry

Allowed event names include:

```text
community_publish_prompt_shown
community_publish_prompt_clicked
community_submission_started
community_submission_completed
community_submission_failed
community_publication_viewed
community_write_cta_clicked
community_report_submitted
```

Never include title/body/excerpt/public name/email/user ID/document ID/submission ID/publication ID.

## Suggested implementation order

1. COMMUNITY-A schema + writer submission API.
2. COMMUNITY-B Basic Writer prompt + submission UX, then reuse for Rich/Keyboard/Voice.
3. COMMUNITY-C Product OS queue + approve/reject.
4. COMMUNITY-D public SSR hub/detail + report + sitemap.
5. COMMUNITY-E My Publications + revisions + withdrawal.
6. COMMUNITY-F category discovery + guidelines/privacy/terms + route/ad/telemetry launch closure.

Do not start with public pages before the approval boundary exists.

## Test gates

Server/API:

- unauthenticated submission rejected;
- user A cannot see/mutate user B;
- controlled taxonomy enforced;
- max pending quota;
- content validation/sanitization;
- no writing in logs/telemetry;
- private document edits never change publication.

Moderation:

- public host cannot approve/reject;
- production write requires OS/Access boundary;
- duplicate approval idempotent;
- stale revision fails;
- rejection produces no public row;
- approved revision replaces only after approval.

Public:

- pending/rejected/withdrawn inaccessible;
- published SSR page has canonical/robots/lang/dir/metadata;
- no private IDs/email in HTML/API;
- sitemap published-only;
- withdrawal removes discovery and returns unavailable/noindex.

Browser:

- long prompt threshold and once-per-session behavior;
- short poetry manual action;
- OAuth continuity;
- exact Urdu/RTL snapshot across Basic/Rich/Keyboard/Voice;
- API failure never breaks typing/local save;
- My Publications states/actions.

Run full repository suite after focused tests.

## Stop conditions

Stop and fix if:

- another D1 database is introduced;
- public page reads `writing_documents` directly;
- writer can alter an approved public row without moderation;
- pending/rejected content is reachable publicly;
- auth provider email/name becomes public automatically;
- moderator writes are callable from normal public origin;
- arbitrary tags create unbounded public URLs;
- text is logged/telemetried;
- the prompt interferes with typing/local autosave;
- publication can happen without human approval.
