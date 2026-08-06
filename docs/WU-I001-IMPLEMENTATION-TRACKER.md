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
- [x] Confirmed repository-only artifact cleanup
- [x] Explicit design-freedom and SEO-protection guardrails

## Phase 2A — Governance and route safety

- [x] Add machine-readable route registry used by checks
- [x] Verify canonical tag on every registered page
- [x] Verify `noindex,follow` on utility pages
- [x] Reconcile registry with `sitemap.xml`
- [x] Reconcile registry with `_redirects`
- [x] Detect `.html`, `www` and trailing-slash internal links
- [x] Detect broken internal links
- [x] Detect orphan public pages
- [x] Detect duplicate titles and descriptions through the SEO suite
- [x] Check human-readable sitemap equivalence and report warnings
- [x] Remove `.vs/` and retain ignore rule
- [x] Remove confirmed root-level review screenshots
- [ ] Review ownership verification files before deletion
- [ ] Resolve any governance failures reported by CI
- [ ] Confirm Phase 2A checks pass on `main`

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

- [ ] Keep broad `urdu typing` and `urdu writing` ownership on the homepage unless evidence supports a deliberate change
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

Run the new Phase 2A governance suite in CI, resolve any current-route findings, merge it, and then begin **Phase 2B — Shared product shell** with the Rich Editor and Urdu Keyboard.
