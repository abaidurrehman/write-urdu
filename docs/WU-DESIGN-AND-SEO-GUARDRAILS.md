# WriteUrdu design freedom and SEO protection guardrails

**Status:** Active product policy  
**Last reviewed:** 2026-08-06

## Product direction

WriteUrdu has full freedom to evolve visually. Typography, logo treatment, color palette, spacing, layout, component styling, iconography, navigation presentation and overall art direction may all change when doing so improves clarity, usability and product quality.

The current green visual identity is not a permanent constraint. It is a working direction, not a protected brand artifact.

## What is protected

The protected assets are search performance, canonical ownership, public route continuity and core product behavior.

Any visual or structural redesign must preserve or deliberately migrate:

1. the homepage transliteration behavior and its production textarea contract;
2. canonical URLs and preferred hostname;
3. indexed routes with existing search traffic or backlinks;
4. unique page titles, meta descriptions and H1 ownership;
5. internal links that establish the intended page hierarchy;
6. sitemap inclusion for approved indexable routes;
7. redirect coverage for retired or renamed URLs;
8. crawlable server-rendered content for search-facing pages;
9. mobile usability and accessible keyboard interaction;
10. the homepage's ownership of broad `urdu typing` and `urdu writing` intent unless Search Console evidence supports a deliberate change.

## Safe design changes

The following changes are encouraged when validated on a Cloudflare Pages preview:

- replacing typography families and scales;
- redesigning the logo or changing its color treatment;
- changing the complete color system;
- rebuilding header, footer, cards, forms and tool chrome;
- changing spacing, density, shadows, radius and responsive layout;
- reorganizing navigation and tool discovery;
- replacing page-specific CSS with shared product patterns;
- simplifying or restructuring HTML when behavior and SEO contracts remain intact.

## Search-risk changes

The following require explicit registry updates, redirect/canonical review and Search Console evidence:

- changing a public URL;
- deleting or merging an indexable page;
- changing which page owns a major keyword intent;
- removing substantial crawlable content;
- replacing server-rendered content with client-only rendering;
- changing canonical hostname or route style;
- removing a page from the sitemap;
- altering structured data that supports page identity;
- changing homepage title, H1 or primary search proposition materially.

## Release rule

Design quality should not be limited by legacy styling. Search protection should be achieved through tests, route governance, redirects, canonicals and measurement—not by freezing the current visual identity.

Every significant redesign PR must state:

- which public pages changed;
- whether titles, descriptions, H1s, canonicals or routes changed;
- whether internal links or sitemap entries changed;
- which Cloudflare preview checks were completed;
- whether transliteration and other behavior-critical tools were retested;
- how Search Console performance will be monitored after release.
