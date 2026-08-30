# WU-TRUST-002 — Contact and Feedback Trust Surfaces

**Status:** Implemented in product code; production form delivery requires Cloudflare bindings
**Date:** 2026-08-15
**Priority:** P1 trust / authority

## Purpose

Add clear public contact and feedback routes that make Write Urdu easier to verify, easier to correct and easier to support without pretending that a contact page is a ranking shortcut.

These pages strengthen the site's trust surface by making the maintainer's public correction channel, privacy route and support process explicit. The goal is crawlable organisational completeness and real user support, not artificial keyword expansion.

## Route ownership

### `/contact`

- Indexable.
- Canonical public contact route.
- Used by Organization `contactPoint` structured data.
- Included in XML sitemap, human-readable sitemap, footer and `llms.txt`.
- Covers product questions, technical issues, transliteration corrections, privacy/data requests, accessibility and general enquiries.

### `/feedback`

- `noindex,follow`.
- Product-improvement utility rather than a search landing page.
- Name and reply email remain optional.
- Linked from Contact, footer and `llms.txt`.
- Legacy `/write-urdu-feedback` and `.html` variants redirect here.

## Form architecture

Both forms use the same first-party progressive enhancement layer:

`browser -> /api/messages Pages Function -> Cloudflare Turnstile -> private FORM_MAILER service binding -> destination-restricted send_email binding`

The Pages Function:

- accepts same-origin JSON POST only;
- rejects bodies above 16 KB;
- validates type/topic/name/email/rating/subject/message against server allowlists;
- uses a hidden honeypot and minimum completion time as secondary spam signals;
- validates Turnstile server-side;
- builds email headers only from server-controlled labels;
- never accepts attachments;
- does not store form submissions in D1.

The private mailer Worker:

- has no public route or workers.dev URL;
- accepts only the service-bound internal `/send` request;
- only accepts `[Write Urdu Contact]` and `[Write Urdu Feedback]` subjects;
- can send only through its configured `send_email` binding and verified destination;
- uses a visitor email only as `replyTo`.

## Privacy contract

Forms may transmit the fields the visitor explicitly enters plus normal request data needed by Cloudflare and Turnstile to deliver and verify the request.

Write Urdu must not collect through these forms:

- editor drafts;
- browser-local Card Studio/Name Art projects;
- uploaded images;
- QR payloads;
- invoice documents;
- attachments;
- hidden background copies of local writing.

The pages explicitly warn visitors not to submit confidential writing or sensitive data. The form has an email fallback when the protected backend is not configured.

## SEO / authority decisions

1. Contact is indexable because it is a durable organisational trust page with unique purpose.
2. Feedback stays noindex because it is a utility form and should not compete with product/help pages.
3. Contact and feedback remain ad-free trust surfaces.
4. `/contact` becomes the publisher `contactPath`; the public email remains `admin@write-urdu.com`.
5. About, Privacy, Contact, Feedback, security.txt and the human sitemap form one coherent trust cluster.
6. No invented address, phone number, founder biography, review count, certification or third-party endorsement may be added merely for SEO.

## Acceptance criteria

- `/contact` is indexable and present in sitemap.xml.
- `/feedback` is noindex and absent from sitemap.xml.
- Legacy feedback routes 301 to `/feedback`.
- Both pages use the shared Write Urdu shell and are ad-free.
- Footer exposes About, Contact, Feedback, Privacy and Sitemap.
- Privacy page explains Cloudflare/Turnstile form processing and retention criteria.
- Server validation and mailer code never use visitor text in email headers.
- Form submission cannot become an open email relay.
- If Cloudflare form bindings are missing, the page clearly exposes `admin@write-urdu.com` as a fallback.
