# WU-I001 — Product Unification Implementation Tracker

**Status:** Active — WriteUrdu v2 delivery  
**Last updated:** 2026-08-06

## Outcome

Make every WriteUrdu page feel like one professionally directed product while protecting transliteration and strengthening existing search demand.

WriteUrdu v2 follows the execution model in `docs/WU-V2-EXECUTION.md`: product slices first, minimum durable documentation, and an 80/20 implementation-to-specification ratio.

## Completed

- [x] Phase 0 — Transliteration safety contract and Cloudflare preview checklist
- [x] Phase 1 — Homepage/editor presentation polish
- [x] Repository-wide public page inventory
- [x] Initial page lifecycle and canonical registry
- [x] Product audit and target information architecture
- [x] Confirmed repository-only artifact cleanup
- [x] Explicit design-freedom and SEO-protection guardrails
- [x] WriteUrdu v2 delivery principles and protected contracts
- [x] V2-S1 — Rich Editor and Urdu Keyboard workspace foundation merged in PR #5

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
- [x] Convert existing legacy-link debt into migration warnings while keeping broken routes blocking
- [ ] Review ownership verification files before deletion
- [x] Confirm Phase 2A checks pass and merge to `main`

## V2-S1 — Writing workspace foundation

- [x] Create `css/product-shell.css`
- [x] Create `css/v2-workspace.css`
- [x] Load both layers through the existing shared `css/main.css` entry point
- [x] Define shared typography, spacing, surface, control, focus and workspace primitives
- [x] Replace decorative task-page hero cards with compact workspace headers
- [x] Put the writing surface before secondary education and promotion
- [x] Reduce visible action density on Rich Editor and Urdu Keyboard
- [x] Make transliteration guidance secondary without removing dynamic conversion actions
- [x] Move productivity controls below the writing surface
- [x] Remove duplicate onboarding from migrated writing pages
- [x] Reduce instructional-card and mobile-footer density
- [x] Extend design-system contract tests to the v2 workspace layer

## V2-S2 — Shared application shell and help centre

- [x] Create global `js/v2-shell.js` shell upgrade runtime
- [x] Create `css/v2-shell.css`
- [x] Define task-first navigation: Write, Rich Editor, Urdu Keyboard, Create, Invoice and Learn
- [x] Move the complete creation catalogue into a structured dropdown
- [x] Create a focused Learn menu for Documentation, FAQ and authority guides
- [x] Reduce the header trust bar to one concise privacy/access message
- [x] Finalize a shorter four-column footer taxonomy: Write, Create, Learn and About
- [x] Create shared `css/v2-content.css` reading system
- [x] Migrate Documentation to the shared help-page system
- [x] Add sticky in-page task navigation to Documentation
- [x] Migrate FAQ to the shared help-page system
- [x] Convert all core FAQ answers into accessible disclosure items
- [x] Remove obsolete Universal Analytics, Bootstrap, Font Awesome and inline legacy FAQ accordion code
- [x] Add V2-S2 shell/content regression contract
- [ ] Pass Cloudflare preview review on desktop and 320px mobile
- [ ] Confirm GitHub Actions, SEO and governance suites are green
- [ ] Merge V2-S2 to `main`

### Page migration order

- [x] Rich Editor — v2 workspace-first layout
- [x] Urdu Keyboard — v2 workspace-first layout
- [x] Documentation — v2 help hub
- [x] FAQ — v2 help centre
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
- [ ] Places the primary task before marketing or long guidance
- [ ] Has one visible primary workflow
- [ ] Passes desktop and 320px mobile review
- [ ] Has visible keyboard focus
- [ ] Has correct title, description, H1 and canonical
- [ ] Uses extensionless canonical internal links
- [ ] Passes automated route and SEO checks
- [ ] Passes Cloudflare preview review
- [ ] Updates the public page registry where applicable

## Current next action

Review the V2-S2 Cloudflare preview on the homepage, Rich Editor, Documentation and FAQ. Verify the new navigation and footer at desktop and mobile widths, then merge once the automated suites are green.
