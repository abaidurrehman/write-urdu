# WU-COMMUNITY-001 — Moderated Urdu Writing Publishing

**Status:** Planned — founder-approved 2026-08-25  
**Priority:** P0/P1 growth-retention bridge; sequence after current auth/My Documents baseline is production-stable  
**Area:** Community publishing / writer identity / moderated UGC / organic growth  
**Primary public route:** `/urdu-writers`  
**Public detail route:** `/urdu-writers/:slug`  
**Private routes:** `/my-publications`, editor submission entry points  
**Internal route:** `os.write-urdu.com` moderation queue  
**Depends on:** `WU-AUTH-001`, `WU-DRAFT-001`, current Product OS + Cloudflare Access boundary  
**Related:** `WU-GROWTH-002`, `WU-SHARE-001`, `WU-PLAT-002`

## 1. Product purpose

Turn meaningful Urdu writing created in WriteUrdu into a curated public destination where people can discover essays, poems, ghazals, nazms, prose and thoughtful writing from real WriteUrdu users.

The product loop is:

```text
write privately
→ create something meaningful
→ prompt to share talent / message
→ sign in if needed
→ choose title, public name, category and tags
→ submit a snapshot
→ moderation in Product OS
→ approve
→ durable public page on WriteUrdu
→ readers discover the work
→ reader starts writing
→ writer returns and publishes again
```

This is deliberately different from the existing anonymous `/s/:id` share loop.

`/s/:id` remains a user-triggered public snapshot for direct sharing and remains outside the indexable editorial corpus. `WU-COMMUNITY-001` creates an **editorially approved, durable, indexable community-writing corpus**.

## 2. Product principles

1. **Writing stays private until explicit submission.**
2. **Writer must be signed in to submit.** Reading never requires an account.
3. **Submission is a snapshot, not a live view of My Documents.**
4. **Nothing becomes public without moderation approval.**
5. **Approved content cannot be silently changed by later private edits.**
6. **The author explicitly chooses the public name shown with the work.** Auth provider name/email are never automatically published.
7. **Public content has a curated taxonomy.** Do not allow an unbounded free-tag system in v1.
8. **Public pages are server-rendered/crawlable and only approved content is indexable.**
9. **Writers retain ownership; WriteUrdu receives only the permission needed to display the submitted work under the publishing terms.**
10. **Comments, likes, follows and social feeds are not part of v1.** Avoid creating a moderation-heavy social network before the publishing loop is proven.

## 3. User-facing concept

Working product name: **Urdu Writers**.

Public copy should be simple and outcome-led:

- “Read writing from the WriteUrdu community.”
- “Publish your Urdu writing.”
- “Share your poem, essay, ghazal, nazm or ideas with more readers.”
- “Show your writing talent.”

Avoid product copy such as “UGC”, “submission workflow”, “moderation state”, “D1” or “content snapshot”.

Urdu-localized surfaces should use natural terms such as:

- شاعری
- غزل
- نظم
- مضمون
- نثر
- تنقیدی / فکری تحریر
- کہانی

## 4. Public information architecture

### `/urdu-writers`

Indexable community hub after launch gate is met.

Minimum content:

- page title / short intro;
- featured or newest approved writing;
- category chips;
- compact “Write and submit your own” CTA;
- cards showing title, public author name, primary category, tags and published date;
- pagination or bounded load-more behavior once corpus grows.

The page must not expose pending, rejected, withdrawn or unpublished records.

### `/urdu-writers/:slug`

Indexable server-rendered public writing page.

Minimum content:

- title;
- public author name/pen name chosen during submission;
- primary category;
- tags;
- published date;
- full approved text with correct Urdu/RTL rendering;
- restrained WriteUrdu provenance;
- “Write your own Urdu” CTA;
- “More writing” links;
- report action;
- canonical URL;
- Open Graph/Twitter metadata;
- structured data suitable for the work (`Article` or `CreativeWork` with genre/category/author representation as appropriate).

Do not render private document IDs, user IDs, emails, OAuth/provider data or moderation metadata.

### Category discovery

Use a curated taxonomy and stable category/filter URLs. Initial indexability can be conservative.

Recommended route shape:

```text
/urdu-writers/category/poetry
/urdu-writers/category/essay
/urdu-writers/category/prose
/urdu-writers/category/thought
/urdu-writers/category/story
```

Category pages should only become indexable when they contain enough reviewed content to be useful. Until then they may remain `noindex,follow` while still functioning for users.

### Dynamic community sitemap

Add a server-generated community sitemap such as:

```text
/sitemap-community.xml
```

It contains only currently published approved detail URLs (and later sufficiently useful category URLs).

Withdrawn/unpublished/rejected/pending content never enters the sitemap.

## 5. Taxonomy

Every submission requires:

- exactly one primary category;
- at least one tag;
- maximum five tags.

### Primary categories

Initial controlled values:

```text
poetry       # شاعری — broad poetry
essay        # مضمون
prose        # نثر
thought      # فکری / تنقیدی تحریر
story        # کہانی
```

### Initial curated tags

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

Do not accept arbitrary public tag strings in v1. Taxonomy expansion is a product/editorial decision so category pages do not fragment into thin or spammy URLs.

The moderation UI may correct category/tags before approval without modifying the submitted writing text.

## 6. Writer eligibility and identity

A user may write anonymously as today. Authentication becomes required only when they choose to submit to Urdu Writers.

Submission authorization uses the existing stable:

```text
session.user.id
```

Never use email as ownership.

### Public author name

The submission form requires a public display name / pen name.

Rules:

- prefill from account name only as a convenience;
- user must explicitly confirm/edit it before first submission;
- provider email is never shown;
- provider photo is not required and should not be published in v1;
- public name is snapshotted into the submission/publication so a later account-profile change cannot silently alter an approved page;
- reasonable length/character validation applies.

Public author profile pages are **out of scope for v1**. The approved writing page contains attribution and can later become the seed for a moderated writer-profile feature without coupling this launch to profiles/followers.

## 7. Long-writing publish prompt

The feature must become discoverable at the moment the user has created meaningful writing.

Eligible writing surfaces initially:

- Basic Writer `/`;
- Rich Editor `/urdu-editor`;
- Urdu Keyboard `/urdu-keyboard`;
- Voice transcript surface when the transcript has meaningful text.

Exclude transactional/non-literary workspaces such as Invoice, QR and Card Studio from the automatic long-writing prompt.

### Trigger

Implement one shared, testable “meaningful long writing” predicate. Initial product heuristic:

```text
plain text >= 600 non-whitespace characters
OR
plain text >= 90 whitespace-delimited words
```

The heuristic is only for prompting. It does not classify the work or automatically submit it.

Prompt at most once per local document/content signature/session unless the writer explicitly opens publishing again.

### Prompt copy

Equivalent user-facing copy:

**Share your writing with more readers**  
Publish this poem, essay or idea in Urdu Writers and show your creativity to the WriteUrdu community.

Primary action:

```text
Submit for publishing
```

Secondary:

```text
Not now
```

Signed-out action routes through existing sign-in continuity so the writing survives OAuth return. It must not serialize writing into the URL or auth state.

### Manual entry point

Do not rely only on the long-text prompt.

Eligible editors also expose a compact explicit action such as:

```text
Publish to Urdu Writers
```

This allows shorter poetry/ghazal/nazm submissions that would not meet the long-writing heuristic.

## 8. Submission flow

The submission sheet/page uses the current editor snapshot and asks for only publishing metadata.

Required fields:

```text
title
public author name / pen name
primary category
1–5 curated tags
writing snapshot
```

Required confirmations:

- “This is my writing, or I have permission to publish it.”
- “I understand that approved writing will be publicly readable on WriteUrdu.”
- acceptance of Community Publishing Guidelines / Terms.

The user can preview the exact public text before submitting.

### Content rules

Initial server guards should include:

- title <= 180 characters;
- public author name <= 80 characters;
- plain-text body minimum 80 characters for manual submissions;
- body maximum aligned with My Documents practical limits, with a tighter public guard if needed;
- rich HTML must pass a strict allowlist sanitizer before storage/publication;
- empty/whitespace-only content rejected;
- no script/style/iframe/form/event-handler markup;
- no writing text in logs or product telemetry.

The minimum is intentionally low enough for poetry. Moderation determines whether a very short piece is publication-quality.

## 9. Snapshot and revision semantics

Do **not** expose a private `writing_documents` row directly as a public page.

Submission copies a snapshot into the community domain.

### Before approval

A pending submission may be replaced by the author with a new snapshot; doing so increments its submission revision and leaves it pending.

### After approval

The approved public snapshot is immutable from the writer’s private editor.

If the writer wants to change title/body/category/tags/public name:

1. create a new revision submission referencing the publication;
2. keep the currently approved version public;
3. review the revision in OS;
4. only replace the public snapshot after the revision is approved.

No edit to My Documents may silently alter public content.

### Withdrawal

The author can withdraw/unpublish their own publication without waiting for editorial approval.

Withdrawal:

- removes it from hub/category/sitemap immediately;
- public detail returns `410 Gone` (or equivalent unavailable response) with `noindex`;
- does not delete the writer’s private My Documents source;
- preserves moderation/audit metadata needed for abuse/operations without retaining more content than the documented policy allows.

Republishing after withdrawal requires a new moderation decision.

## 10. Data architecture

Reuse the existing WriteUrdu D1 binding:

```text
env.METRICS_DB
```

Do not create another D1 database.

Keep private documents and community publishing as separate product-owned domains.

Expected additive migration number at the 2026-08-25 baseline:

```text
0009_community_writing.sql
```

Reconcile against current `main` before implementation.

### `community_writing_submissions`

Suggested shape:

```sql
id TEXT PRIMARY KEY
user_id TEXT NOT NULL
source_document_id TEXT NULL
publication_id TEXT NULL
submission_revision INTEGER NOT NULL
status TEXT NOT NULL                -- pending|approved|rejected|withdrawn
content_format TEXT NOT NULL        -- plain|rich
editor_kind TEXT NOT NULL
public_author_name TEXT NOT NULL
title TEXT NOT NULL
content TEXT NOT NULL
plain_text TEXT NOT NULL
primary_category TEXT NOT NULL
tags_json TEXT NOT NULL
rights_confirmed INTEGER NOT NULL
public_confirmed INTEGER NOT NULL
submitted_at TEXT NOT NULL
updated_at TEXT NOT NULL
reviewed_at TEXT NULL
reviewed_by TEXT NULL
rejection_code TEXT NULL
rejection_note TEXT NULL
```

Indexes:

```text
(status, submitted_at)
(user_id, submitted_at DESC)
(publication_id, submission_revision DESC)
```

### `community_writing_publications`

Public API/pages read only this approved snapshot table.

```sql
id TEXT PRIMARY KEY
source_submission_id TEXT NOT NULL
user_id TEXT NOT NULL
slug TEXT NOT NULL UNIQUE
status TEXT NOT NULL                -- published|unpublished
public_author_name TEXT NOT NULL
title TEXT NOT NULL
content TEXT NOT NULL
plain_text TEXT NOT NULL
content_format TEXT NOT NULL
primary_category TEXT NOT NULL
tags_json TEXT NOT NULL
published_at TEXT NOT NULL
updated_at TEXT NOT NULL
report_count INTEGER NOT NULL DEFAULT 0
last_report_at TEXT NULL
```

Indexes:

```text
(status, published_at DESC)
(status, primary_category, published_at DESC)
(user_id, status, published_at DESC)
```

### Why two tables

The split prevents a pending author edit from becoming public before approval.

```text
private editor / My Documents
        ↓ explicit snapshot
community_writing_submissions
        ↓ moderator approves
community_writing_publications
        ↓ public read only
/urdu-writers/:slug
```

Community code must not modify Auth.js tables, telemetry tables or share-artifact rows.

## 11. Slug contract

Generate the public slug server-side only at first approval.

Requirements:

- stable after publication;
- unique;
- safe for routing;
- not dependent on a client-supplied value;
- changing the title later does not automatically break the canonical URL.

A practical form is a short generated public prefix plus a normalized title fragment, for example:

```text
/urdu-writers/a8k2-meri-pehli-ghazal
```

The opaque prefix is the identity; the title fragment is presentation. Route resolution must not depend on exact transliteration quality.

## 12. APIs

### Writer APIs — authenticated

```text
POST   /api/community/submissions
GET    /api/community/submissions
GET    /api/community/submissions/:id
PATCH  /api/community/submissions/:id       # pending replacement only
POST   /api/community/submissions/:id/revise
POST   /api/community/publications/:id/withdraw
```

Rules:

- all writer mutations require `getSession()`;
- every writer query is scoped by `session.user.id`;
- client never supplies/trusts owner ID;
- responses are `Cache-Control: no-store`;
- parameterized D1 statements only;
- text never enters logs/analytics;
- ownership is non-enumerable.

### Public APIs — read only

```text
GET /api/community/publications
GET /api/community/publications/:slug
POST /api/community/publications/:id/report
```

Public read endpoints return published rows only.

The public page may query D1 directly in its Pages Function rather than depend on a second HTTP hop.

### Moderation APIs — Product OS only

```text
GET  /api/internal/community/moderation?status=pending
GET  /api/internal/community/moderation/:id
POST /api/internal/community/moderation/:id/approve
POST /api/internal/community/moderation/:id/reject
POST /api/internal/community/publications/:id/unpublish
```

Mutation routes must be fail-closed behind the existing Product OS / Cloudflare Access boundary. A production moderation write must not be authorized only by a browser-supplied flag or query parameter.

Recommended requirements:

- request host must equal `PRODUCT_OS_HOST`;
- Cloudflare Access must protect the OS hostname;
- require an authenticated Access identity/header for moderation writes in production;
- optionally enforce a configured moderator allowlist;
- record only the moderator identity needed for audit, never tokens/secrets.

## 13. Product OS moderation queue

Add a dedicated **Community Writing** moderation area.

### Queue view

Show:

- pending count;
- newest submissions first;
- title;
- public author name;
- category/tags;
- submitted time;
- source editor kind;
- short preview;
- revision indicator.

Do not display user email by default. Moderator identity/ownership lookups should be exceptional, not routine review UI.

### Review view

Show the exact text that would be published, rendered safely in RTL/plain/rich form as appropriate.

Actions:

```text
Approve & publish
Reject
```

Optional moderator adjustments allowed before approval:

- primary category;
- curated tags.

Do not silently rewrite the writer’s title/body/public author name. If those need changes, reject/request resubmission.

### Rejection reasons

Use structured internal codes with optional reader-safe note:

```text
incomplete_or_low_quality
spam_or_promotion
abusive_or_hateful
sexual_or_unsafe
personal_information
copyright_or_ownership
plagiarism_concern
duplicate
off_topic
other
```

The writer sees a respectful product message and, where supplied, a short moderation note. Do not expose internal security/abuse heuristics.

### Approval transaction

Approval must be idempotent.

Within one D1 transaction/batch-equivalent safe flow:

1. confirm submission is still pending/current revision;
2. create or update the public publication snapshot;
3. create slug if first publication;
4. set publication `published`;
5. mark submission `approved` with review metadata;
6. preserve previous published version until replacement approval succeeds.

Repeated approve requests must not create duplicate public records.

## 14. Community publishing guidelines

Before public launch, ship a concise public policy page such as:

```text
/community-guidelines
```

It should explain in normal user language:

- submit your own writing or writing you have rights to publish;
- do not post private/personal information about others;
- no spam or disguised advertising;
- no harassment/hate/sexual exploitation/illegal content;
- do not republish copyrighted poems/articles/books without permission;
- WriteUrdu may reject or remove content that does not fit the community;
- the writer can withdraw their own published writing;
- how to report a copyright/privacy/safety problem.

Terms/privacy should explain the public-display permission and the fact that approved submitted text becomes public/indexable.

Do not imply WriteUrdu owns the writer’s copyright.

## 15. Public reporting and removal

Every public writing page includes a report control.

Initial reasons:

```text
spam
abuse
privacy
copyright
other
```

Reuse the existing bounded/report-rate-limiting patterns where appropriate, but keep community reports in the community domain.

A report does not automatically edit the work. Report count/last report time raises the item in OS for review.

Moderators can unpublish immediately. Unpublished pages leave the sitemap and return an unavailable/noindex response.

## 16. Abuse and moderation capacity guards

Because every item requires human review, v1 must protect the queue.

Initial guards:

- max 5 pending submissions per user;
- bounded submission attempts per user/time window;
- duplicate-content signature detection is allowed as a queue guard, but the signature must not be a public identifier;
- ability to block further community submissions for abusive accounts without modifying Auth.js tables;
- no anonymous submission endpoint;
- no automatic approval based on account age/provider.

If an account-control table is needed, keep it product-owned, for example:

```text
community_writer_controls
- user_id
- submissions_disabled
- reason_code
- updated_at
- updated_by
```

This is a later slice unless launch abuse evidence requires it earlier.

## 17. My Publications

Create a noindex authenticated `/my-publications` surface or an equivalent clearly separated section linked from My Documents/account navigation.

Show the writer’s submissions/publications with states:

```text
In review
Published
Not approved
Withdrawn
Revision in review
```

Actions:

- open published page;
- revise/resubmit;
- withdraw published writing;
- view rejection reason/note;
- return to source editor/document where safely resolvable.

Do not mix this status model into the local/cloud save status of My Documents.

## 18. Editor integration

Add one shared community-publishing client layer; do not duplicate submission logic separately in each editor.

Suggested module:

```text
js/community-publishing.mjs
```

Responsibilities:

- meaningful-long-writing predicate;
- prompt state/dismissal;
- capture editor snapshot via existing adapters;
- preserve snapshot through auth return using the existing bounded same-origin handoff approach;
- open submission flow;
- call writer APIs;
- show submission success/status link;
- emit privacy-safe telemetry without text.

The module must not alter transliteration, typing latency or local autosave behavior.

## 19. SEO and quality guardrails

This feature can create meaningful long-tail authority only if the published corpus remains genuinely useful.

Required safeguards:

- pending/rejected/unpublished pages are never indexable;
- approved detail page is SSR/crawler-readable without client JS;
- canonical points to the stable approved URL;
- public title/description are derived from approved title/excerpt, not unreviewed metadata;
- one H1 per writing page;
- use `lang="ur"` / `dir="rtl"` on Urdu content;
- community sitemap contains approved/published URLs only;
- withdrawn/unpublished content disappears from discovery surfaces;
- category/tag archives do not create thin indexable combinations;
- do not expose arbitrary query/search result pages to indexing;
- no automatic mass publication from imported/local history;
- no AI-generated bulk publishing workflow in this epic.

## 20. AdSense/product monetization boundary

The writer/editor submission experience remains ad-light and must not put ads inside the active writing/submission form.

Approved public writing pages can use the existing route-classification/ad-boundary system after the article body or other safe content boundary.

Do not add ad density specifically to this feature before the existing AdSense operating contract allows it. Public/community pages must remain readable first.

## 21. Telemetry

Measure the loop without collecting writing text.

Suggested events:

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

Allowed event properties are bounded product metadata such as:

```text
route
editor_kind
signed_in
trigger=manual|long_text
primary_category (only after explicit selection)
```

Do not send:

- title;
- body/excerpt;
- public author name;
- email;
- user ID;
- document/submission/publication ID.

OS operational counts can query community tables directly rather than duplicating content into telemetry.

## 22. Implementation slices

### COMMUNITY-A — schema + authenticated submission API

- add additive community migration to existing `METRICS_DB`;
- implement writer submission CRUD/status API;
- enforce stable user ownership, content limits, controlled taxonomy and pending quota;
- no public pages yet.

**Exit:** authenticated user can create/list/read own pending submission; user A cannot access user B.

### COMMUNITY-B — editor prompt + submission UX

- shared long-writing heuristic;
- manual “Publish to Urdu Writers” action;
- sign-in continuity;
- metadata/rights/public confirmation form;
- Basic Writer pilot first, then Rich/Keyboard/Voice through the same module.

**Exit:** meaningful private text can be submitted without altering local/My Documents behavior.

### COMMUNITY-C — Product OS moderation

- pending queue;
- safe review page;
- approve/reject;
- category/tag correction;
- rejection reason/note;
- production OS/Cloudflare Access write guard.

**Exit:** moderator can approve exactly one immutable public snapshot or reject it; repeat approval is idempotent.

### COMMUNITY-D — public SSR pages + hub

- `/urdu-writers` hub;
- `/urdu-writers/:slug` SSR page;
- metadata/OG/structured data;
- public report action;
- community sitemap;
- published-only read contract.

**Exit:** approved work is crawlable and shareable; pending/rejected work is impossible to retrieve publicly.

### COMMUNITY-E — My Publications + revisions + withdrawal

- writer status library;
- revision submission while old approved version stays live;
- self-withdraw/unpublish;
- 410/noindex removal behavior.

### COMMUNITY-F — taxonomy/category discovery + launch closure

- category filters/pages;
- no thin indexable tag combinations;
- community guidelines/privacy/terms changes;
- moderation/report regression;
- route/ad classification;
- telemetry/OS operational counts;
- production proof.

### COMMUNITY-G — later evidence-gated expansion

Not required for v1:

- moderated writer profile pages;
- “more by this writer” identity surface;
- editor picks/featured collections;
- search;
- bookmarks;
- notifications;
- AI-assisted moderation triage.

No automatic AI approval.

## 23. Required tests

### Database/API

- additive migration preserves telemetry/share/Auth.js/document tables;
- unauthenticated submit rejected;
- invalid taxonomy rejected;
- oversized/empty submission rejected;
- max pending quota enforced;
- user isolation for list/get/patch/revise/withdraw;
- provider email/name cannot be client-forced as owner;
- pending update increments revision and stays pending;
- approved publication cannot be mutated through pending writer PATCH;
- withdrawal only by owner;
- no text in logs/telemetry.

### Moderation

- public host cannot call internal approve/reject route;
- production moderation write requires the OS/Access boundary;
- approve on current pending revision succeeds once;
- duplicate approve does not duplicate publication;
- stale revision approval fails safely;
- reject leaves no public publication;
- revision approval replaces public snapshot only after approval;
- category/tag correction persists to publication;
- moderator cannot inject unsafe HTML.

### Public/SEO

- pending/rejected/withdrawn cannot be fetched publicly;
- published detail is SSR with correct title/canonical/robots/lang/dir;
- public page contains no user ID/email/private document ID;
- report endpoint is bounded/rate-limited;
- community sitemap contains published rows only;
- unpublish removes sitemap visibility and detail returns unavailable/noindex;
- hub only lists published rows;
- arbitrary tag/query combinations do not create indexable thin pages.

### Browser/product

- long-writing prompt does not appear before threshold;
- prompt appears after meaningful threshold and not repeatedly in same session/signature;
- manual publish action works for shorter poetry;
- signed-out submission preserves writing through OAuth return;
- submitting never changes/overwrites the private My Documents source;
- Basic/Rich/Keyboard/Voice exact Urdu text survives snapshot;
- published formatting is safe/expected;
- editor typing/local autosave remains unaffected if community API fails;
- writer can see In review/Published/Not approved/Withdrawn states.

## 24. Rollback

Feature flags should separate submission, moderation and public discovery where practical, for example:

```text
COMMUNITY_PUBLISHING_ENABLED
COMMUNITY_PUBLIC_ENABLED
```

Rollback rules:

- disabling submission leaves existing public publications readable unless public feature is also disabled intentionally;
- disabling public discovery must not delete rows;
- private writing/My Documents continue normally;
- never drop the shared D1 community tables as routine rollback.

## 25. Launch gate

Do not broadly promote “Publish to Urdu Writers” until all are true:

- [ ] Google sign-in and My Documents continuity are production-stable.
- [ ] Writer submission is authenticated and owner-scoped.
- [ ] OS moderation queue is protected and usable.
- [ ] Nothing can become public without explicit approve.
- [ ] Public page reads only approved snapshot data.
- [ ] Community Guidelines + Privacy/Terms changes are live.
- [ ] Report + unpublish path works.
- [ ] Community sitemap contains published-only URLs.
- [ ] Long-text prompt is dismissible and non-disruptive.
- [ ] No writing text enters telemetry/logs.
- [ ] Mobile/RTL/public-page accessibility passes.
- [ ] Full repository test suite and production smoke proof are green.

## 26. Success signals

Initial product signals:

1. meaningful-writing sessions that open the publish flow;
2. publish-flow completion rate;
3. pending → approved rate and moderation workload;
4. approved writings per week;
5. public writing page views;
6. reader → WriteUrdu editor starts;
7. repeat submissions/writers;
8. Search Console impressions/clicks to the approved community corpus;
9. incremental useful pageviews/AdSense contribution without degrading editor experience.

Do not optimize for raw submission volume at the expense of editorial quality.

## 27. Non-goals

- anonymous publishing;
- automatic public upload of My Documents/local history;
- public access to private document URLs;
- comments;
- likes/reactions;
- follows;
- direct messaging;
- teams/collaboration;
- public author profiles in v1;
- arbitrary user-created tags;
- automatic AI approval/moderation;
- pay-to-publish;
- publication without human approval;
- replacing the existing `/s/:id` direct-share loop.

## 28. Related files to re-read before implementation

- `specs/WU-AUTH-001-social-authentication-foundation.md`
- `specs/WU-DRAFT-001-cross-device-cloud-drafts.md`
- `specs/WU-GROWTH-002-account-save-share-entry-points.md`
- `specs/WU-SHARE-001-public-share-pages-viral-publishing-loop.md`
- `functions/lib/auth.mjs`
- current `/api/documents*` handlers
- `functions/api/internal/*` Product OS patterns
- `functions/s/[id].js`
- `functions/api/shares/[id]/report.js`
- current migration list
- current route/SEO/ad registries and sitemap implementation
