# WU-SHAADI-001 — Pakistan Wedding Invitation Platform

**Status:** Planned — founder-approved for specification on 2026-09-18  
**Priority:** P1 candidate behind the current activation evidence review  
**Area:** Cards / invitations / WhatsApp distribution / print / family events  
**Primary proposed route:** /urdu-wedding-invitation-maker  
**Related:** WU-CARD-GALLERY-001, WU-CARD-CONTENT-001, WU-CARD-RETENTION-001, WU-SHARE-001, WU-INPUT-001, WU-PLAT-002H  
**Product thesis:** one Shaadi setup should generate every useful invitation output without forcing the family to repeatedly redesign cards.

---

## 1. Product goal

Build a durable Pakistani wedding invitation system rather than another generic card editor.

The product should let a family enter the wedding once, then create culturally appropriate, beautiful and personalized invitations for each guest household across digital and print channels.

Core loop:

family + couple + events + venues + wording + guests
→ choose a visual identity
→ generate the right invitation for each guest household
→ WhatsApp / link / PNG / PDF / print / QR
→ optional RSVP and event logistics

The long-term product promise is:

**One Shaadi. One setup. Every invitation.**

Urdu wording:

**ایک بار شادی کی تفصیل لکھیں — ہر مہمان کے لیے خوبصورت ذاتی دعوت نامہ تیار کریں۔**

This epic must not collapse into a Canva clone. Structured wedding data is the source of truth; cards, pages, PDFs and messages are renderings of that data.

---

## 2. Why this fits Write Urdu

Write Urdu already owns useful building blocks:

- Roman/English-letter → Urdu input;
- Urdu typing and Nastaliq rendering;
- Card Studio;
- shared card background registry;
- ready-made cards and social sharing;
- PNG/PDF/print-oriented output paths;
- browser-local product patterns;
- public share artifacts with short opaque URLs;
- mobile-first Pakistani usage.

The new product should compound these systems rather than fork them.

The unique product advantage is not merely design. It is the combination of:

1. Pakistani wedding structure;
2. Urdu and Roman-Urdu entry;
3. culturally appropriate invitation wording;
4. guest-household personalization;
5. event-specific invitations;
6. WhatsApp-first distribution;
7. hybrid digital + print output.

---

## 3. Research-backed product model

Research on Pakistani wedding invitation cards shows recurring structural elements rather than arbitrary free-form design.

The evidence ledger for this epic records:

- Baraat cards commonly include an opening/invocation, host/inviter, request for attendance, couple, date/day, time, venue and family/RSVP-style names.
- Mehndi cards use a somewhat less formal style while retaining ceremony name, date, time and venue as important elements.
- The outer envelope traditionally carries the invitee name, optionally with wording equivalent to “with family”.
- Current Pakistani print vendors still collect bride/groom, parentage, date, gathering/reception timing, dinner timing, venue and “Awaiting to Welcome” details.
- Current digital vendors already sell WhatsApp-ready Nikkah, Mehndi, Baraat, Walima and Dholki invitations.
- Newer interactive Pakistani products add multiple events, map/calendar actions, private links and QR.
- Pakistani online wedding-card research found that social, cultural and religious invitation conventions persist when invitations move online.

Therefore, personalization is not a foreign layer added to Pakistani wedding cards. It is the digital continuation of the personalized envelope.

---

## 4. Product principles

### 4.1 Wedding data, not canvas state, is authoritative

Do not make Card Studio state the canonical wedding record.

The authoritative hierarchy is:

WeddingProject
→ Families
→ Couple
→ Events
→ Venues / programme timings
→ Wording
→ Guest households
→ Invitation variants
→ Outputs / publications / RSVP

A user must be able to change a date, venue or spelling once and regenerate every dependent output.

### 4.2 Household-first personalization

The primary recipient unit is a guest household, not merely a string placeholder.

Examples:

- محمد عمران صاحب
- محترم محمد عمران صاحب و اہلِ خانہ
- Ali & Sara
- خالہ رضیہ و اہلِ خانہ

Each household can independently own:

- display name;
- preferred script/language;
- invitation scope: individual / couple / family;
- invited event IDs;
- optional maximum party size;
- optional WhatsApp number kept browser-local unless the user explicitly uses a later send/integration feature.

### 4.3 Multi-event from the data model

Pakistan wedding flows frequently include multiple functions.

Supported bounded event types should include:

- Nikah / نکاح
- Mehndi / مہندی
- Mayun / مایوں
- Dholki / ڈھولکی
- Baraat / بارات
- Rukhsati / رخصتی
- Walima / ولیمہ
- Engagement / منگنی
- custom

Do not assume every wedding uses every event.

Each event may have:

- host side;
- date/day;
- one or more labelled timings;
- venue;
- address;
- map location;
- wording variant;
- invited guest subset.

### 4.4 WhatsApp-first, not WhatsApp-only

Primary digital output should work naturally through WhatsApp, but the same project should also support:

- PNG;
- PDF;
- print proof;
- envelope/recipient label;
- QR pointing to an interactive invitation;
- private invitation link;
- calendar action;
- map action;
- later animated/video output if evidence supports it.

### 4.5 Hybrid digital + print

Do not position physical cards as obsolete.

The product should support a common hybrid workflow:

create once
→ print selected cards/envelopes for some guests
→ send personalized WhatsApp invitations to others
→ add QR to physical cards for current venue/programme details

---

## 5. Core information model

### 5.1 Wedding project

Minimum fields:

- project ID, local by default;
- preferred interface language;
- preferred invitation language: Urdu / English / bilingual;
- couple display strategy;
- wedding visual theme;
- selected verified invocation/dua ID where used;
- optional custom opening;
- family/host records;
- events;
- venues;
- guest households;
- output preferences.

### 5.2 Couple and family

Support variants rather than hard-coding one social convention:

- both names;
- name + son/daughter of;
- daughter-of / son-of wording;
- family-led wording;
- custom reviewed text.

Family/host records may represent:

- bride side;
- groom side;
- both families;
- grandparents;
- custom host.

Do not infer social titles, caste, relationship, gender or deceased status from names. If such wording is desired, the user enters/selects it explicitly.

### 5.3 Programme timings

Do not model one event as only one timestamp.

Allow labelled programme entries such as:

- gathering;
- Nikah;
- Baraat arrival;
- dinner;
- Rukhsati;
- reception;
- custom.

This reflects current Pakistani print-card practice and avoids cramming multiple times into arbitrary text.

### 5.4 Venue

A venue record may contain:

- display name;
- full address;
- city;
- optional map URL/location selected by user;
- optional phone/contact note.

A map link must never silently become a public precise-location field until the user explicitly publishes the invitation containing it.

---

## 6. Wording system

The first reliable wording system should be deterministic and template-driven.

Each wording template declares:

- event types it supports;
- host-side assumptions;
- language;
- formality level;
- required fields;
- optional fields;
- safe fallback wording.

Examples:

- formal Nikah;
- traditional Baraat;
- groom-family Walima;
- warm Mehndi;
- concise WhatsApp version;
- bilingual version.

The user can edit the rendered wording.

AI wording assistance may be added later, but it is never required to produce a complete invitation.

### Religious text rule

Bismillah, Quranic verses, hadith references and religious quotations must come from a curated, verified source library or explicit user-provided text.

Do not generate, paraphrase or “improve” Quranic Arabic using an LLM.

---

## 7. Roman Urdu and Urdu names

This is a core Write Urdu advantage.

The user may paste:

Muhammad Usman
Shakeel Ahmed
Khala Razia
Naveed Bhai
Chaudhry Akram

The product may suggest:

محمد عثمان
شکیل احمد
خالہ رضیہ
نوید بھائی
چوہدری اکرم

Every conversion remains editable and confirmable before bulk generation.

Do not silently transliterate a guest list and send/publish it without review.

Honorific/family suffix options should be explicit controlled choices, for example:

- صاحب
- صاحبہ
- و اہلِ خانہ
- no suffix
- custom

Do not infer honorifics from names.

---

## 8. Invitation scope

For each guest household, invitation scope must be explicit.

Minimum enum:

- individual;
- couple;
- family;
- custom label.

Optional party cap belongs to later RSVP-enabled slices.

The rendered invitation should make the scope understandable without producing humiliating or confrontational wording.

The system must support selecting exactly which event IDs a household is invited to.

Example:

Household A → Nikah + Baraat
Household B → Mehndi + Baraat + Walima
Household C → Walima only

A personalized private link must reveal only the events assigned to that household.

---

## 9. Receiver experience

The invitation must still feel like opening a Pakistani wedding card.

Preferred hierarchy:

1. elegant visual opening / Bismillah where selected;
2. personalized addressee;
3. family/couple invitation wording;
4. event cards;
5. date/timings;
6. venue;
7. map / calendar actions;
8. optional RSVP;
9. restrained Write Urdu provenance.

Do not make the first screen feel like an event-management dashboard.

The decorative invitation remains the emotional product. Interaction appears underneath it.

---

## 10. RSVP model

RSVP is not an MVP dependency.

When introduced, default wording should be culturally natural rather than importing a US wedding-site mental model.

Suggested Urdu:

**کیا آپ تشریف لائیں گے؟**

- ان شاء اللہ
- معذرت، شرکت ممکن نہیں

Then, only where relevant:

**کتنے افراد تشریف لائیں گے؟**

The allowed count should respect invitation scope / party cap.

Do not request dietary, identity or other personal data by default merely because generic wedding platforms do.

---

## 11. Output model

Every output should derive from the same structured project.

### Required eventual outputs

- digital card PNG;
- high-resolution print card/PDF;
- WhatsApp share text;
- personalized private link;
- QR for the link;
- recipient/envelope label;
- event summary;
- map/calendar actions.

### Evidence-gated later outputs

- animated invitation/video;
- save-the-date;
- thank-you card;
- post-wedding photo/album continuation;
- printer export package.

Do not build a separate data entry experience per output.

---

## 12. Privacy model

### Local-first project

Before explicit publication, wedding project data and guest list should remain browser-local.

The product should make this distinction clear:

**Local project** — wedding/guest data stays on this device/browser.

**Published invitation** — only the fields required for the selected share experience are uploaded.

Do not silently sync the guest list.

### Guest phone numbers

Do not require phone numbers merely to personalize cards.

If entered for convenience, keep them local in early slices.

No analytics payload may contain:

- guest names;
- phone numbers;
- couple/family names;
- private wording;
- venue addresses;
- RSVP free text.

### Public/private links

Invitation links should be:

- opaque;
- non-enumerable;
- noindex;
- absent from sitemap/public feeds;
- revocable by host;
- scoped to the intended publication.

Personalized links must not place guest names in the URL.

---

## 13. Relationship to existing share infrastructure

Reuse patterns from WU-SHARE-001, but do not force interactive wedding state into the generic image-share artifact table if the semantics no longer fit.

Shared infrastructure may include:

- opaque ID generation;
- management-token hashing;
- abuse/report patterns;
- R2 preview images;
- noindex share-page rendering;
- social metadata;
- native-share / copy-link UX.

Wedding publication should have its own bounded domain model if it stores events, guest scopes or RSVP responses.

---

## 14. Relationship to Card Studio

Card Studio remains the authoritative advanced visual editor/rendering engine where practical.

The wedding product owns structured semantics.

A rendering adapter may translate a WeddingInvitationViewModel into Card Studio-compatible visual project state.

Do not place wedding business rules directly inside Card Studio.

Do not make the user manually rebuild every guest card in Card Studio.

Preferred flow:

structured invitation
→ choose theme/template
→ automatic preview
→ optional “Fine-tune design” in Card Studio
→ return/export without losing wedding data

Fine-tuning must not destroy the ability to regenerate other guests/events.

---

## 15. Proposed UX

### Step 1 — Tell us about your Shaadi

Choose event types and primary language.

### Step 2 — Couple and families

Enter couple names, parentage/host wording where desired, and invitation style.

### Step 3 — Programme and places

Add event dates, labelled times and venues.

### Step 4 — Choose a design

Select a Pakistani invitation design after the content is known.

### Step 5 — Add guests

Start with one recipient, paste names, or later import CSV.

Review Urdu conversion.

Set:

- individual / couple / family;
- invited event(s);
- language.

### Step 6 — Invite

Generate:

- card image;
- PDF/print;
- WhatsApp message;
- later private link/QR.

The first-use path must also support a user who only wants one wedding card and no guest list.

---

## 16. Progressive slices

### Slice 0 — Evidence, domain contract and technical prototype

No public route required.

Deliver:

- dated evidence ledger;
- canonical WeddingProject schema;
- event/host/timing/guest enums;
- privacy/storage decision;
- wording-template fixtures;
- religious-text policy;
- sample Pakistani wedding fixtures;
- renderer/handoff proof using existing Card Studio assets;
- route/SEO ownership decision;
- performance benchmark;
- migration path for future share/RSVP without implementing it.

### Slice 1 — Local structured invitation composer

Deliver:

- /urdu-wedding-invitation-maker behind normal release governance;
- no account;
- local-only project;
- couple/family/events/venue/timing form;
- Urdu / English / bilingual wording;
- deterministic wording templates;
- one polished live invitation preview;
- mobile-first UX;
- save local draft where repository conventions allow;
- no guest bulk mode yet;
- no public publishing yet.

### Slice 2 — Beautiful output and Card Studio integration

Deliver:

- Pakistani wedding design collection;
- PNG;
- print/PDF output;
- print-safe sizes;
- optional Card Studio fine-tune;
- stable regeneration from structured state;
- no duplicate renderer architecture where existing renderer can be reused.

### Slice 3 — Guest household personalization

Deliver:

- add one recipient;
- paste multiple recipient names;
- Roman/English → Urdu suggestions;
- editable confirmation;
- invitation scope;
- event assignment per household;
- previous/next guest preview;
- bulk generation;
- ZIP or bounded batch download if browser performance permits;
- envelope/recipient-label output.

CSV import belongs here only if paste-first usage is proven insufficient.

### Slice 4 — Private personalized invitation links

Deliver only after local generation is reliable:

- explicit publish action;
- one wedding publication with event data;
- opaque household-specific links;
- recipient sees only assigned events;
- server-rendered social metadata;
- optional QR;
- host revocation;
- noindex/no sitemap;
- reuse WU-SHARE-001 security patterns.

### Slice 5 — Maps, calendar and culturally natural RSVP

Deliver:

- Maps/open-location action;
- add-to-calendar per invited event;
- optional RSVP;
- attendance yes/no;
- bounded party count where configured;
- host response view;
- privacy/deletion lifecycle;
- no forced account for guests.

### Slice 6 — Hybrid print system

Deliver if evidence supports print usage:

- print proof;
- high-resolution card;
- matching envelope label;
- QR placement;
- event insert layouts;
- printer-friendly crop/safe-area guidance;
- bilingual print QA.

### Slice 7 — Retention and lifecycle

Evidence-gated:

- save-the-date;
- venue/date update notice;
- thank-you card;
- anniversary reuse;
- wedding photo/album continuation;
- template reuse without carrying old guest data.

### Slice 8 — Animated/video invitations

Only after static/link flows demonstrate real demand.

Do not make video generation a prerequisite for the core invitation job.

---

## 17. SEO ownership

The product route should own a real task, not keyword variants.

Primary candidate:

/urdu-wedding-invitation-maker

Potential query themes to evaluate before indexable release:

- Urdu wedding card maker;
- Shadi card maker Urdu;
- wedding invitation in Urdu;
- Nikah invitation Urdu;
- Urdu digital wedding invitation;
- WhatsApp wedding invitation Pakistan.

Do not pre-create separate near-duplicate routes for Nikah/Baraat/Walima merely for SEO.

Event-specific educational/wording pages may be added later only if GSC/search evidence shows distinct intent and each page provides substantial value.

Personalized/public guest invitations are noindex.

---

## 18. Telemetry

Measure product states, never invitation content.

Candidate bounded funnel:

visit
→ project started
→ first event complete
→ preview ready
→ design selected
→ first export
→ guest mode opened
→ first guest personalized
→ batch generated
→ publish started
→ private link ready
→ recipient opened
→ map/calendar used
→ RSVP completed

Allowed dimensions may include:

- event-count bucket;
- invitation language enum;
- output type;
- guest-count bucket;
- invitation-scope enum;
- template/background controlled ID;
- source route;
- success/failure code.

Never log user-entered names, venue strings, wording or phone numbers.

---

## 19. Mobile and accessibility requirements

At 360–430 CSS px:

- first useful task is obvious;
- no giant explanation before setup;
- each step is understandable without horizontal overflow;
- Urdu text remains readable;
- event cards are touch-friendly;
- date/time entry works with mobile keyboards;
- preview does not obscure the form;
- sticky actions do not hide fields;
- guest bulk mode remains usable with the software keyboard open.

Accessibility:

- all fields have semantic labels;
- Urdu text has lang=ur and correct RTL;
- mixed Urdu/English fields handle direction deliberately;
- progress is not communicated by colour alone;
- preview is not the only representation of entered information;
- error messages name the affected field;
- keyboard navigation works on desktop.

---

## 20. Performance requirements

- do not boot one canvas per guest during normal editing;
- preview one current invitation at a time;
- bulk rendering must be queued/batched;
- do not eagerly render hundreds of guest cards on paste;
- templates/backgrounds should use the shared registry;
- large print assets load only when needed;
- no runtime AI dependency for basic completion;
- mobile typing/transliteration should remain responsive.

Slice 0 must set measurable budgets using current Card Studio performance as baseline.

---

## 21. Failure and recovery

The system must handle:

- incomplete event details;
- invalid or missing date/time;
- transliteration uncertainty;
- deleted/changed template;
- local draft corruption;
- failed image/PDF render;
- partial bulk render;
- failed publication;
- revoked link;
- unavailable map/calendar capability;
- duplicate guest labels.

No failure should erase the local wedding project.

Bulk generation should report per-recipient failures and allow retry.

---

## 22. Non-goals

This epic is not permission to build:

- a generic wedding planning suite;
- vendor marketplace;
- payment collection;
- matchmaking;
- public guest directory;
- social profiles/comments/likes;
- automatic WhatsApp scraping/sending;
- guest phone-number upload by default;
- AI-written Quran/Hadith;
- a second Card Studio;
- dozens of event keyword doorway pages;
- mandatory account creation;
- server storage before explicit publish;
- an RSVP-first Western wedding-site clone.

---

## 23. Definition of done

The long-term epic is successful when a Pakistani family can:

1. describe its wedding once;
2. represent multiple functions correctly;
3. produce culturally natural Urdu/English/bilingual wording;
4. choose a beautiful Pakistani design;
5. personalize recipients by household and event scope;
6. generate digital and print-ready outputs without retyping;
7. share privately through WhatsApp/link/QR;
8. optionally collect simple attendance responses;
9. update core wedding information once and regenerate dependent outputs;
10. do all of this without exposing guest data or turning Write Urdu into a generic design tool.

The product should feel as natural as writing a guest name on a physical wedding-card envelope, while making that invitation digital, current and useful.
