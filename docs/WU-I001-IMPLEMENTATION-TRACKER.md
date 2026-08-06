# WU-I001 — Product Unification Implementation Tracker

**Status:** Active  
**Last updated:** 2026-08-06

## Outcome

Make every WriteUrdu page feel like one professionally directed product while protecting transliteration and strengthening existing search demand.

## Completed

- [x] Phase 0 — Transliteration safety contract and Cloudflare preview checklist
- [x] Phase 1 — Homepage/editor presentation polish
- [x] Repository-wide public page inventory
- [x] Initial page lifecycle and canonical registry
- [x] Product audit and target information architecture

## Phase 2A — Governance and route safety

- [ ] Add machine-readable route registry used by checks
- [ ] Verify canonical tag on every indexable page
- [ ] Verify `noindex,follow` on internal search page
- [ ] Reconcile registry with `sitemap.xml`
- [ ] Reconcile registry with `_redirects`
- [ ] Detect `.html`, `www` and trailing-slash internal links
- [ ] Detect broken internal links
- [ ] Detect orphan public pages
- [ ] Detect duplicate titles, descriptions and H1 ownership
- [ ] Generate human-readable sitemap from registry or test equivalence
- [ ] Remove `.vs/` and add ignore rule
- [ ] Move or remove root-level review screenshots after reference check
- [ ] Review verification files before deletion

## Phase 2B — Shared product shell

- [ ] Create `css/product-shell.css`
- [ ] Define shared header and navigation contract
- [ ] Define shared footer taxonomy
- [ ] Define breadcrumb pattern
- [ ] Define page hero and section heading patterns
- [ ] Define buttons, cards, fields, notices and badges
- [ ] Define related-tools and related-learning modules
- [ ] Add design-system compliance checks

### Page migration order

- [ ] Rich Editor
- [ ] Urdu Keyboard
- [ ] Documentation
- [ ] FAQ
- [ ] Card Studio
- [ ] Templates
- [ ] Invoice Generator
- [ ] Stylish Urdu Text
- [ ] Name Art
- [ ] WhatsApp Status Maker
- [ ] Instagram Post Maker
- [ ] QR Generator
- [ ] Roman Urdu guide
- [ ] English-to-Urdu tutorial
- [ ] Urdu Alphabet
- [ ] Urdu font comparison
- [ ] About / Why WriteUrdu
- [ ] Privacy
- [ ] Feedback
- [ ] Search
- [ ] Human sitemap

## Phase 2C — Content and canonical consolidation

- [ ] Decide ownership of broad `urdu typing` and `urdu writing` intent
- [ ] Review `write-urdu-features` against documentation and About
- [ ] Review `urdu-editor-features` against editor and documentation
- [ ] Review typing tutorial against transliteration guide and homepage
- [ ] Decide keep, merge or redirect for overlapping pages
- [ ] Implement one-hop redirects
- [ ] Update sitemap, internal links and structured data
- [ ] Record Search Console baseline before URL changes

## Phase 2D — Asset and code cleanup

- [ ] Build HTML/CSS/JS asset reference report
- [ ] Identify zero-reference images and documents
- [ ] Identify obsolete CSS selectors and files
- [ ] Identify obsolete JavaScript modules
- [ ] Remove confirmed unused assets
- [ ] Document retained legacy dependencies
- [ ] Confirm Cloudflare deploy output contains only product files

## Phase 2E — Existing-demand SEO growth

- [ ] Track `urdu typing` position, impressions and CTR
- [ ] Track `urdu writing` position, impressions and CTR
- [ ] Improve supporting internal links to homepage
- [ ] Refine examples and FAQs without keyword stuffing
- [ ] Validate title and description CTR changes
- [ ] Observe an 8–12 week measurement window

## Release gates for every migrated page

- [ ] Uses shared header and footer
- [ ] Uses approved typography weights
- [ ] Has one primary task and CTA
- [ ] Has related tools and learning links
- [ ] Passes desktop and 320px mobile review
- [ ] Has visible keyboard focus
- [ ] Has correct title, description, H1 and canonical
- [ ] Uses extensionless canonical internal links
- [ ] Passes automated route and SEO checks
- [ ] Passes Cloudflare preview review
- [ ] Updates the public page registry where applicable

## Current next action

Implement **Phase 2A — Governance and route safety** before migrating additional pages. This creates executable guardrails for the larger UX migration.