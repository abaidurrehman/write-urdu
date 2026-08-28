# WU-SHARE-001 — Public Share Pages & Viral Publishing Loop

**Status:** Active — Phase 1 shipped in Card Studio (`functions/api/shares.js`, `functions/s/[id].js`, report/manage-token flows, `docs/../how-to-share-urdu-writing-online.html` guide live)  
**Priority:** P0.6  
**Area:** Growth / creation / distribution  
**Phase 1 source:** `/urdu-card-studio`  
**Public route:** `/s/:id`  
**API:** `/api/shares*`  
**Storage:** existing `writeurdu-db` through `METRICS_DB` + Cloudflare R2 binding for published share images  
**Telemetry dependency:** `WU-ANALYTICS-001`  
**User guide:** `docs/WU-SHARE-001-USER-GUIDE.md`

## 1. Problem

WriteUrdu already helps people create Urdu writing and Card Studio already renders polished, shareable images. The current Card Studio Share action exports the generated image into the browser/device share sheet, but the shared artifact does not carry a durable WriteUrdu permalink.

That means the product loses the strongest natural distribution moment:

`write -> create -> share -> recipient opens WriteUrdu -> recipient creates -> shares again`

The growth opportunity is not a conventional social-share button. It is a public publishing loop where each user-created artifact can become a branded, attractive WriteUrdu URL such as:

`https://write-urdu.com/s/k7P4z8Q`

The URL is the primary distribution asset. The artwork needs only restrained Write-Urdu.com branding.

## 2. Product decision

Build a reusable **Share Artifact service** and prove it first in Card Studio.

Phase 1 changes Card Studio from:

`Design -> share/download image`

into:

`Design -> Publish & Share -> public WriteUrdu link -> recipient creates -> publishes again`

The service MUST be source-agnostic from the first implementation so the main editor and other creation surfaces can use the same API/data model later.

Phase 2 will extend the same service to the main writing experience, where existing adoption is substantially stronger. Phase 1 must not hard-code the backend around Card Studio.

## 3. Success definition

This feature is successful only if it creates measurable product-led distribution.

The primary question is:

> For every 100 published WriteUrdu links, how many recipient visits create a new writing/creation session, and how many new published links are produced from those sessions?

A release is incomplete if the public-link flow ships without the telemetry and Product Pulse reporting defined in this spec.

## 4. Scope

### Phase 1 — approved

- Card Studio can explicitly publish the current card as a public WriteUrdu share artifact.
- Publishing creates a short branded `/s/:id` permalink.
- The published card image contains a small, non-intrusive `Write-Urdu.com` footer/visual mark.
- The public page renders the image prominently and the Urdu writing as real selectable HTML text.
- The page exposes Share / Copy link and a strong `Create your own` action.
- A recipient can continue into Card Studio with a share-referral context.
- Where safe/reconstructible, `Use this text` can prefill the public Urdu text into a new Card Studio project.
- The public page has server-rendered social metadata so Facebook, WhatsApp, X and other link-preview crawlers receive a useful image/title without client-side JavaScript.
- Publishing, referral and reproduction metrics are live from launch.
- Authors can delete a published artifact from the browser that created it.
- Anyone can report a public artifact.
- At least one public user guide ships with the feature.

### Phase 2 — architecture-ready, not implemented in Phase 1

- Main/basic editor `Share my writing` action.
- Automatic attractive share treatment without forcing users through Card Studio.
- `Customize appearance` handoff into Card Studio.
- Medium/long-writing share layouts where the social image is a preview and the public page carries the full writing.
- Rich Editor and other creation-tool integrations.

## 5. Non-goals for Phase 1

- Accounts or login as a requirement to publish.
- Public user profiles.
- Public gallery/feed/discovery page.
- Search indexing of arbitrary user-generated share pages.
- Comments, likes, follows or social-network mechanics.
- Paid promotion or AdSense on user-generated share pages.
- Exact collaborative editing of a published artifact.
- Full preservation of a locally uploaded background image as an editable source asset for other users.
- Claiming social-network links as guaranteed PageRank/backlinks.

## 6. Core UX contract

### 6.1 Card Studio actions

Keep `Download PNG` as a local/private export.

Replace the ambiguous public-growth use of the existing Share action with two explicit concepts:

1. **Publish & Share** — creates a public WriteUrdu URL.
2. **Share image only** — optional secondary action preserving the existing file-share behavior where supported.

Publishing MUST never happen merely because the user clicks Download or Share image.

### 6.2 First publish confirmation

The first `Publish & Share` action opens a compact confirmation/preview that states clearly:

- this will create a public link;
- anyone with the link can view the published writing/image;
- the user's local drafts/projects remain local and are not uploaded;
- the public share image contains a small Write-Urdu.com mark;
- the user can delete this published link later from this browser.

Primary action: `Publish & get link`.

Secondary action: `Cancel`.

Do not add a long legal wall to the creation flow.

### 6.3 Successful publish

After a successful publish show:

- the short public URL;
- `Copy link`;
- native `Share` where `navigator.share` is available;
- `Open public page`;
- `Delete published link` in a secondary/manage area;
- a subtle confirmation that local editing remains independent of the published snapshot.

The published artifact is a snapshot. Editing the local Card Studio project does not silently mutate an already-published URL.

A later explicit `Update published version` feature may be considered, but Phase 1 can create a new share artifact for a changed card.

## 7. Public `/s/:id` page

The public share page is an acquisition surface, not a miniature editor.

### Required hierarchy

1. shared visual/artwork above the fold;
2. public Urdu text as HTML (`dir="rtl"`, appropriate `lang`);
3. optional author/source attribution if the publisher included it;
4. `Create your own Urdu design` primary CTA;
5. `Use this text` secondary CTA when public text is available;
6. Copy link / Share controls;
7. restrained WriteUrdu identity and link back to the main writing experience;
8. `Report` control;
9. small help link to the sharing guide.

### Public page rules

- No AdSense in Phase 1.
- No comments or public engagement counters.
- No visible internal share ID except as part of the URL.
- No author identity unless the author explicitly entered attribution into the card.
- Do not expose management/delete tokens in HTML, URL query strings or metadata.
- Deleted/blocked artifacts return a clear not-available page and must not continue serving the image.

## 8. Branding contract

The public share image should advertise WriteUrdu through **tasteful provenance**, not a large advertisement.

For the published-image path only:

- add a small `Write-Urdu.com` footer/visual mark;
- keep it inside a safe margin;
- keep contrast readable but subordinate to the user's writing;
- never cover the main Urdu text or author/source;
- do not add a giant logo, CTA or banner inside the artwork.

This publication mark is independent from Card Studio's existing user-controlled watermark setting.

A user may still download a local PNG under the existing watermark behavior. The mandatory small publication mark applies to the publicly hosted social-preview image because the permalink and image are part of the WriteUrdu distribution system.

## 9. URL and identifier contract

Canonical public form:

`https://write-urdu.com/s/:id`

Requirements:

- opaque cryptographically random identifier;
- URL-safe alphabet;
- short enough to paste naturally in WhatsApp/social posts;
- enough entropy that IDs are not practically enumerable;
- no user text, title, email, timestamp or sequential database ID in the URL;
- collisions are checked server-side and regenerated.

Suggested implementation: 8 Base62 characters generated from cryptographically secure random bytes. The implementation may use a slightly different opaque format if equivalent collision/enumeration properties are preserved.

Never encode Urdu text directly into the public URL.

## 10. SEO and social-preview contract

### 10.1 User-generated pages

Phase 1 share pages MUST:

- emit `noindex,follow`;
- stay out of `sitemap.xml`;
- stay out of public feeds and llms.txt discovery lists;
- use a self-referential canonical when active;
- return `404` or `410` for deleted/blocked artifacts according to the final deletion implementation;
- avoid structured data that implies editorial endorsement by WriteUrdu.

This protects the mature domain from an uncontrolled thin/UGC index footprint while still allowing direct referral/distribution value.

### 10.2 Dynamic social metadata

`/s/:id` must return crawler-readable HTML containing at minimum:

- `og:type=article` or an equivalent appropriate public-content type;
- `og:site_name=Write Urdu`;
- concise title derived from safe generic copy, not arbitrary HTML;
- safe description using a bounded plain-text excerpt where appropriate;
- absolute `og:url`;
- absolute `og:image` pointing to the exact published artwork;
- image width/height;
- image alt text;
- `twitter:card=summary_large_image` and matching title/description/image fields.

Do not rely on client-side JavaScript to add these tags after page load.

### 10.3 Share image route

Serve published images from a stable same-brand URL, for example:

`/share-media/:id`

The route reads the validated object from R2 and sends the correct image MIME type, cache policy and content length where available.

Do not expose arbitrary R2 keys supplied by the client.

## 11. Share Artifact data contract

Create additive migration `migrations/0004_share_artifacts.sql` during implementation.

Suggested D1 table:

```sql
CREATE TABLE share_artifacts (
    id TEXT PRIMARY KEY,
    source_tool TEXT NOT NULL,
    public_text TEXT NOT NULL,
    attribution TEXT,
    image_key TEXT NOT NULL,
    image_mime TEXT NOT NULL,
    image_width INTEGER NOT NULL,
    image_height INTEGER NOT NULL,
    preset TEXT,
    remix_payload_json TEXT,
    remix_mode TEXT NOT NULL DEFAULT 'text_only',
    origin_share_id TEXT,
    manage_token_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    report_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (origin_share_id) REFERENCES share_artifacts(id)
);
```

Implementation may add operational fields/indexes, but must preserve the product semantics above.

### Allowed `source_tool` values initially

- `card_studio`

Architecture must reserve the enum path for later:

- `basic_editor`
- `rich_editor`
- `urdu_keyboard`
- `name_art`
- `whatsapp_status`
- `instagram_post`

### Content rules

- `public_text` is plain Unicode text only, never HTML.
- attribution is plain text only.
- exact local filenames are never stored.
- local object/blob URLs are never stored.
- `remix_payload_json` contains only an allowlisted, sanitized subset of reconstructible Card Studio state.
- no analytics/session IDs are stored on `share_artifacts`.

## 12. R2 object contract

The browser already renders the final Card Studio canvas. Phase 1 should upload that exact generated artifact rather than re-rendering Urdu/Nastaliq text on the server.

Suggested object key:

`shares/YYYY/MM/:id.<ext>`

Rules:

- object key generated server-side;
- accept only approved image MIME types from the publish flow;
- validate declared MIME/extension and size;
- never accept arbitrary path/key from the browser;
- object is removed or made unreachable when the share artifact is deleted/blocked;
- public delivery happens through the controlled share-media route unless a later reviewed custom-domain strategy replaces it.

The implementation should bind R2 with a clearly named binding such as `SHARE_MEDIA`.

## 13. Publish API

### `POST /api/shares`

Purpose: create an immutable public share snapshot.

Preferred request shape: `multipart/form-data` because the rendered image blob and bounded metadata are submitted together.

Approved fields:

- generated image blob;
- `source_tool`;
- plain `public_text`;
- optional attribution;
- preset/output dimensions;
- sanitized reconstructible remix payload;
- optional `origin_share_id` when this creation session came from a public share page.

Server responsibilities:

1. same-site/origin validation;
2. request and image-size limits;
3. strict source-tool enum;
4. text/attribution length limits;
5. no HTML acceptance;
6. image MIME validation;
7. opaque ID generation and collision check;
8. random management token generation;
9. hash management token before D1 storage;
10. write image to R2;
11. write metadata to D1;
12. clean up the R2 object if D1 write fails;
13. return only safe public/manage response fields.

Response:

```json
{
  "ok": true,
  "id": "k7P4z8Q",
  "url": "https://write-urdu.com/s/k7P4z8Q",
  "manageToken": "one-time-secret-returned-to-the-browser"
}
```

The browser stores the management token locally, keyed by share ID. It is not part of the public URL.

### `GET /api/shares/:id`

Purpose: return bounded public share data needed by first-party continuation/remix UI.

Must not return:

- management token/hash;
- internal storage key;
- moderation/internal fields;
- analytics/session data.

### `DELETE /api/shares/:id`

Requires the management token using a header/body contract that does not place the secret in the URL.

On success:

- mark artifact deleted;
- remove or make media unavailable;
- invalidate cached public/media responses as practical;
- future GET/public page requests return not available.

### `POST /api/shares/:id/report`

Anonymous bounded report endpoint.

Phase 1 can use a small strict reason enum such as:

- `spam`
- `abuse`
- `privacy`
- `copyright`
- `other`

Do not accept an unbounded public free-text moderation database in the first slice.

## 14. Remix / continuation contract

### Primary Phase 1 path

`Create your own Urdu design` -> Card Studio.

The public page sets a short-lived first-party referral context in `sessionStorage` before navigation. It must not put the source share ID into analytics events or the destination URL.

### `Use this text`

Because the public text is already intentionally public, the user may choose to copy it into a new local Card Studio project.

Handoff options in order of preference:

1. fetch the public share payload first-party;
2. write the approved text/style handoff into `sessionStorage`;
3. navigate to `/urdu-card-studio`;
4. Card Studio consumes and clears the handoff.

Do not put the full Urdu text into the query string.

### Exact design remix

If `remix_mode=design` and the stored allowlisted style payload is fully reconstructible, Card Studio may restore those style tokens.

If the original used a local uploaded background that cannot be safely reconstructed, the share must fall back to `text_only`. Do not pretend exact visual remix is available when the source asset is unavailable.

## 15. Privacy contract

The existing local-first principle remains the default:

> Writing and Card Studio projects stay in the browser until the user explicitly chooses Publish & Share.

Publishing changes the status of the selected snapshot only.

The product MUST make these distinctions clear:

- local draft/project: private to the browser/device;
- downloaded/shared-image-only file: no WriteUrdu public page is created;
- published share artifact: intentionally uploaded and public to anyone with the link.

Publishing does not authorize WriteUrdu to upload unrelated drafts or project history.

The privacy page must be updated in the implementation PR to describe public share artifacts, deletion, reporting and the distinction from local drafts.

## 16. Abuse and safety controls

Public anonymous publishing needs lightweight controls from the first release even though there is no public feed.

Required:

- no public gallery;
- unguessable IDs;
- strict payload/image limits;
- plain-text sanitization;
- image MIME validation;
- origin checks;
- rate limiting appropriate to anonymous publishing;
- report endpoint;
- author deletion capability;
- moderation status (`active`, `deleted`, `blocked` at minimum);
- no AdSense on share pages in Phase 1;
- safe cache behavior after deletion/blocking.

A frictionless initial flow is preferred. Turnstile or additional challenge should be introduced when abuse/rate thresholds justify it rather than automatically forcing every legitimate publisher through a challenge.

## 17. Telemetry — release-blocking

Reuse the first-party telemetry architecture in `WU-ANALYTICS-001` and `METRICS_DB`.

### 17.1 Privacy rule

Anonymous product telemetry MUST NOT send:

- share artifact ID;
- management token;
- public Urdu text;
- attribution;
- R2 key;
- social destination account/person;
- copied link value.

All `/s/:id` telemetry must normalize the route to a low-cardinality route such as `/s/:share` before emission/storage.

The share-artifact table may store `origin_share_id` solely for product relationship/reproduction measurement because both records are public artifacts. It must not be joined to anonymous browser session identities.

### 17.2 New strict telemetry events

Extend the existing event allowlist with:

- `share_publish_started`
- `share_publish_completed`
- `share_publish_failed`
- `share_page_viewed`
- `share_page_cta_clicked`
- `share_referred_creation_started`
- `share_republish_completed`
- `share_deleted`
- `share_reported`

Continue using existing events where appropriate:

- `share_clicked` — user invokes native/copy share action after a link exists;
- `share_completed` — native share API resolves successfully where observable;
- `tool_handoff` — public share page to Card Studio/main writing route.

Add a `public_share` tool enum for events emitted from `/s/:id`.

### 17.3 Referral context

When a recipient chooses `Create your own` or `Use this text`, store a short-lived boolean/referral marker in `sessionStorage`.

On the destination creation route:

- emit `share_referred_creation_started` after meaningful engagement, not simply page load;
- clear/expire the marker after attribution is consumed;
- if that referred session publishes a new share, send `share_republish_completed` in addition to the normal `share_publish_completed` event;
- the new `share_artifacts.origin_share_id` may retain the originating public artifact relationship server-side.

The telemetry event still does not contain the origin share ID.

## 18. Product Pulse metrics

The implementation must add a dedicated **Share Loop** section to `/os/product-pulse` or its successor.

Minimum reporting for 24h / 7d / 30d:

### Supply

- publish attempts;
- successful published links;
- publish failures;
- publish success rate;
- published links by `source_tool`.

### Distribution

- public share-page views;
- public page views per published link (aggregate denominator from `share_artifacts`);
- Copy/native-share actions after publishing;
- device distribution for public share-page visits.

### Activation

- `Create your own` / `Use this text` CTA clicks;
- share-page CTA rate = CTA-click sessions / public-share-page sessions;
- referred creation starts;
- referred creation start rate = referred-creation sessions / CTA-click sessions.

### Reproduction

- referred sessions that publish again;
- share-republish rate = referred republish sessions / referred creation sessions;
- child share artifacts = rows with non-null `origin_share_id`;
- parent activation rate = distinct parent share IDs that produced at least one child / eligible parent share artifacts;
- **share loop reproduction ratio** = child share artifacts / eligible parent share artifacts for the selected reporting window, shown as a directional growth metric rather than a mathematically exact viral coefficient unless cohorting is later implemented.

### Trust / abuse

- deletions;
- reports;
- report rate per 1,000 public share-page views;
- blocked artifacts if moderation blocking is introduced.

No dashboard table should display public Urdu text or individual share URLs by default.

## 19. Guide requirement

Ship at least one public guide with the feature.

Planned route:

`/how-to-share-urdu-writing-online`

Working title:

**How to Share Urdu Writing Online with a Beautiful WriteUrdu Link**

The finished guide copy starts in `docs/WU-SHARE-001-USER-GUIDE.md` and must be converted into the existing public v2 content shell during implementation.

Required guide topics:

- create/write the card;
- choose `Publish & Share`;
- what becomes public and what stays local;
- copy/share the short `write-urdu.com/s/...` link;
- what recipients see;
- how a recipient starts their own version;
- how the publisher deletes the public link;
- how image-only sharing/download differs from publishing;
- small Write-Urdu.com publication mark explanation;
- FAQ.

The guide must link directly into Card Studio and Card Studio must expose a contextual help link back to the guide from the publish UI.

## 20. Implementation map

### Slice A — storage and public-share API

- [ ] Add `0004_share_artifacts.sql`.
- [ ] Add R2 `SHARE_MEDIA` binding to production and preview environments.
- [ ] Implement strict share validation helpers.
- [ ] Implement `POST /api/shares`.
- [ ] Implement `GET /api/shares/:id`.
- [ ] Implement authenticated-by-management-token `DELETE /api/shares/:id`.
- [ ] Implement bounded `POST /api/shares/:id/report`.
- [ ] Add cleanup behavior for partial D1/R2 failures.

### Slice B — dynamic public page and media delivery

- [ ] Implement dynamic `/s/:id` Pages Function/server response.
- [ ] Implement `/share-media/:id` R2 delivery route.
- [ ] Add server-rendered OG/Twitter metadata.
- [ ] Add `noindex,follow` and self canonical.
- [ ] Add active/deleted/blocked states.
- [ ] Add public RTL text rendering and CTAs.

### Slice C — Card Studio publish UX

- [ ] Preserve Download PNG/private export.
- [ ] Add explicit `Publish & Share` control.
- [ ] Preserve image-only share as a clearly separate action if retained.
- [ ] Add first-publish privacy/public confirmation.
- [ ] Reuse the existing Card Studio renderer to create the publish image.
- [ ] Add the small mandatory publication footer only to the hosted publish image.
- [ ] Upload rendered image + bounded metadata.
- [ ] Store returned management token locally.
- [ ] Add success dialog with copy/native share/open/delete.

### Slice D — continuation loop

- [ ] Implement `Create your own` handoff.
- [ ] Implement `Use this text` using first-party fetch + sessionStorage, never text in URL.
- [ ] Add safe style-token remix only where reconstructible.
- [ ] Persist `origin_share_id` on a resulting new public artifact without exposing it to telemetry.

### Slice E — telemetry and Product Pulse

- [ ] Extend strict event/tool enums.
- [ ] Normalize `/s/:id` analytics route.
- [ ] Instrument publish attempt/success/failure.
- [ ] Instrument public page view and CTA.
- [ ] Instrument referred creation start.
- [ ] Instrument republish completion.
- [ ] Instrument delete/report outcomes.
- [ ] Add Share Loop aggregate API/reporting.
- [ ] Add Share Loop Product Pulse UI.
- [ ] Verify events in production before considering the feature released.

### Slice F — content/privacy/trust

- [ ] Convert `docs/WU-SHARE-001-USER-GUIDE.md` to `/how-to-share-urdu-writing-online` using the v2 authority/content shell.
- [ ] Add contextual guide link to publish UI.
- [ ] Update privacy page for explicit public publishing.
- [ ] Add report/help copy.
- [ ] Keep share pages out of sitemap/feed/llms discovery.

### Slice G — acceptance and rollout

- [ ] Unit/static tests for ID/token/payload validation.
- [ ] API tests for create/read/delete/report.
- [ ] R2 lifecycle tests with safe mocks or preview resources.
- [ ] Browser test Card Studio -> publish -> `/s/:id` -> create own -> republish.
- [ ] Browser test mobile sharing/copy fallback.
- [ ] Social metadata HTML regression test.
- [ ] `noindex` / sitemap exclusion regression test.
- [ ] Privacy regression: no draft content is uploaded before explicit publish.
- [ ] Telemetry privacy regression: no share ID/text/token in anonymous event payloads.
- [ ] Production smoke test at least one real published artifact and preview rendering.

## 21. Required implementation files / likely touch points

Exact filenames may evolve, but implementation should remain easy to locate.

Likely new files:

- `migrations/0004_share_artifacts.sql`
- `functions/api/shares/index.js`
- `functions/api/shares/[id].js` and/or explicitly routed method handlers
- `functions/api/shares/[id]/report.js`
- `functions/s/[id].js`
- `functions/share-media/[id].js`
- `js/share-publishing.js`
- `css/share-page.css`
- public guide HTML for `/how-to-share-urdu-writing-online`
- focused share-loop tests

Likely existing files to extend:

- `urdu-card-studio.html`
- `js/card-studio.js`
- `js/product-telemetry.js`
- `functions/api/events.js`
- Product Pulse API/UI
- `write-urdu-privacy.html`
- `seo.config.js` / route registry only for the public guide, **not** individual `/s/:id` pages
- `sitemap.xml` only to add the guide route, never share artifacts

## 22. Acceptance criteria

### Product

- [ ] A Card Studio user can publish a valid card without an account.
- [ ] A successful publish creates an opaque short `write-urdu.com/s/:id` URL.
- [ ] Downloading/exporting does not publish anything.
- [ ] The public image contains only restrained Write-Urdu.com provenance.
- [ ] The public page is attractive on mobile and desktop.
- [ ] The public page contains selectable RTL Urdu text.
- [ ] Social crawlers receive server-rendered preview metadata and the exact share artwork.
- [ ] A recipient can start a new Card Studio creation from the share page.
- [ ] `Use this text` never places the Urdu body in a URL.
- [ ] Publisher can delete the public artifact from the originating browser using a locally held management token.
- [ ] Public reporting exists.

### SEO / domain protection

- [ ] Share pages are `noindex,follow`.
- [ ] Individual share pages are absent from sitemap/feed/llms discovery.
- [ ] The public guide is indexable and included in normal SEO routing/sitemap behavior.
- [ ] No AdSense loads on user-generated share pages in Phase 1.

### Privacy / security

- [ ] Nothing is uploaded before explicit Publish & Share confirmation.
- [ ] Only the chosen snapshot/text/attribution/safe style data is stored.
- [ ] Management tokens never appear in public URLs or HTML.
- [ ] Anonymous telemetry does not contain share IDs, text, attribution or management tokens.
- [ ] Uploaded media is type/size validated and keys are server-generated.
- [ ] Deleted/blocked media is no longer publicly retrievable.

### Measurement

- [ ] Publish attempts/success/failures are measurable from first production release.
- [ ] Public share-page visits and CTA clicks are measurable.
- [ ] Referred creation starts are measurable.
- [ ] Referred republishing is measurable.
- [ ] Parent/child artifact relationship supports aggregate reproduction metrics.
- [ ] Product Pulse contains a Share Loop section for 24h/7d/30d.
- [ ] Production smoke test proves events are reaching D1 before rollout is marked complete.

### Documentation

- [ ] Public guide `/how-to-share-urdu-writing-online` ships with the feature.
- [ ] Guide explains public-vs-local behavior and deletion.
- [ ] Card Studio publish UI links to the guide.
- [ ] Privacy page reflects public publishing.

## 23. Phase 2 handoff — main editor

Do not redesign the backend for Phase 2.

The main editor should later call the same publish service with `source_tool=basic_editor`.

Expected Phase 2 UX:

1. user writes normally in the existing main experience;
2. `Share my writing` appears as a natural outcome action;
3. WriteUrdu automatically generates an attractive preview treatment using the existing Card Studio rendering primitives without forcing the user to enter Card Studio;
4. user can `Publish & Share` immediately or `Customize appearance` in Card Studio;
5. the same `/s/:id`, deletion, reporting, social preview, telemetry and reproduction model applies.

Short writing can use a card-like share image. Medium/long writing should use a preview image while the full public writing remains readable as HTML on `/s/:id`.

This main-editor integration is strategically important because the main writing surface already owns the mature product adoption. Card Studio is the controlled Phase 1 proving ground, not the final distribution surface.

## 24. Verification commands / checks

Implementation PR should define concrete commands matching the final tests. At minimum the release checklist must cover:

```bash
npm test
npx playwright test
```

Plus direct preview/production checks for:

```text
POST   /api/shares
GET    /api/shares/:id
DELETE /api/shares/:id
POST   /api/shares/:id/report
GET    /s/:id
GET    /share-media/:id
```

Verification must inspect raw HTML from `/s/:id` (not only a browser-rendered DOM) to confirm Open Graph/Twitter metadata and `noindex` are present server-side.

## 25. Decision log

- 2026-08-17 — Treat public sharing as a P0 growth/distribution capability rather than a small social button.
- 2026-08-17 — Phase 1 starts with Card Studio because the high-quality Urdu renderer already exists there.
- 2026-08-17 — Backend/data model is generic from day one so the main editor can adopt it later.
- 2026-08-17 — The permalink is the main brand/distribution mechanism; visual branding stays deliberately small.
- 2026-08-17 — Share-page UGC is `noindex` and ad-free initially to protect domain quality and reduce monetization/moderation risk.
- 2026-08-17 — Measurement is release-blocking; the loop must be observable from the first production publish.
