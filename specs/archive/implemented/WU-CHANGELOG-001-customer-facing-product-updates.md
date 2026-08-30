# WU-CHANGELOG-001 — Customer-facing product changelog

**Status:** Active  
**Owner:** Product / public communication  
**Public route:** `/changelog`

## Purpose

Write Urdu needs one public place where returning users can understand what changed without reading GitHub, implementation specs or technical release notes.

The changelog is a product-help surface, not an engineering log.

Each entry must answer, in customer language:

1. **What changed?**
2. **Why does it help?**
3. **How do I use it?**
4. **Where can I try it now?**

## Publication rule

Only include a change when it is public and usable on the production product.

Include:

- new public tools or capabilities;
- meaningful improvements to a public workflow;
- important changes to how a user completes a task;
- material limitations or behavior changes a user should understand.

Exclude:

- internal architecture;
- CI, tests, telemetry plumbing or infrastructure work;
- backlog/specification work that has not shipped;
- private experiments or dogfood;
- dependency upgrades with no user-visible effect;
- implementation terminology that does not help a customer complete the task.

## Language rule

Lead with the words users use for the task. Prefer plain phrases such as:

- English to Urdu typing;
- type Urdu using English letters;
- image to Urdu text;
- speak to type Urdu;
- fix Urdu text;
- share Urdu writing;
- create a card;
- format a document.

Technical terms may appear only when they are useful for recognition or precision. They must not be required to understand the update.

## Entry structure

Newest entries appear first. Each release should use:

- date;
- short customer-facing theme;
- outcome-led headline;
- **What changed**;
- **Why it helps**;
- **How to use it**;
- a direct link to the relevant tool or guide.

A multi-tool release may replace the three-column explanation with one small section per tool, but it still needs a short how-to-use summary.

## SEO and discovery

- `/changelog` is indexable and self-canonical.
- The route belongs to the About/public-product-information section.
- It is included in the XML sitemap, human-readable sitemap and `llms.txt`.
- The shared footer includes a **What’s new** link.
- `/changelog.html` permanently redirects to `/changelog`.
- The page must not create keyword-clone landing pages or compete with the canonical tool pages for transactional search intent.

## Monetization

The changelog is a product information/trust surface. Do not place ads inside release entries or between the explanation and its how-to instructions.

## Maintenance

When a meaningful customer-facing release ships, update the changelog in the same release or the next immediate public-communication slice. Do not publish an entry before the feature is available.

The changelog may summarize several closely related PRs into one customer outcome. GitHub PR titles and internal feature IDs should not appear in public copy.
