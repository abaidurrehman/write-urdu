# WriteUrdu v2 — Product Execution Plan

**Status:** Active  
**Owner:** Product and UX  
**Started:** 2026-08-06

## Purpose

Turn WriteUrdu into a modern Urdu writing product while preserving the search traffic, routes and transliteration behavior that already serve hundreds of daily users.

WriteUrdu v2 is not a documentation-only redesign. It is delivered as small production slices. Every design decision must result in code, tests and a Cloudflare preview within the same workstream.

## Delivery rule

Use an **80/20 implementation ratio**:

- 80% of effort goes to working product changes, validation and migration.
- 20% goes to the minimum documentation needed to keep future work coherent.

No long standalone research phase. No speculative 100-page design package before implementation.

## Product principles

1. **The writing surface is the product.** The editor or keyboard must appear before promotional or educational content.
2. **One visible primary workflow.** Secondary tools belong in menus, navigation or related-content modules.
3. **Returning users should reach the editor immediately.** Heroes remain compact on task pages.
4. **Guidance is available without blocking work.** Help, tutorials and examples follow the workspace or use progressive disclosure.
5. **Search equity is protected.** Existing canonical routes, indexability, crawlable copy and keyword ownership remain governed by repository checks.
6. **Behavior is protected before presentation changes.** Transliteration, TinyMCE, keyboard input, copy, save and exports keep stable bindings and regression coverage.
7. **Mobile is a primary product surface.** Controls must remain usable at 320px without turning the page into stacked full-width buttons.

## v2 product architecture

### Write

- Homepage transliteration workspace
- Rich Urdu Editor
- Direct Urdu Keyboard

### Create

- Card Studio
- Templates
- Stylish Urdu Text
- Name Art
- WhatsApp Status
- Instagram Post
- QR Generator

### Business

- Urdu and English Invoice Generator

### Learn

- Documentation
- FAQ
- Roman Urdu transliteration guide
- Typing tutorial
- Urdu alphabet
- Font comparison

## Delivery slices

### V2-S1 — Writing workspace foundation

**PR:** #5  
**Status:** Merged

- Compact task-page hero
- Editor-first page order
- Restrained action hierarchy
- Integrated input-mode and editor framing
- Secondary transliteration guidance
- Compact productivity strip
- Reduced supporting-card density
- Smaller mobile footer footprint
- Rich Editor and Urdu Keyboard first migrations

### V2-S2 — Shared application shell and help centre

**Status:** In progress

- Task-first application navigation
- Structured Create and Learn menus
- Dedicated Invoice business route
- Concise privacy/access trust bar
- Four-column shared footer taxonomy
- Global shell upgrade runtime and compliance contract
- Shared help/authority reading system
- Documentation migration
- FAQ migration and accessible disclosure structure
- Removal of obsolete FAQ framework and analytics dependencies

### V2-S3 — Authority content migration

- Roman Urdu guide
- Urdu alphabet
- Font comparison
- Typing tutorial review and consolidation decision

These pages must support the product and existing keyword ownership rather than compete with the homepage.

### V2-S4 — Creation workflows

- Card Studio
- Templates
- Stylish Urdu Text
- Name Art
- Social makers
- QR Generator

### V2-S5 — Business workflow

- Invoice Generator

### V2-S6 — Consolidation and release

- Resolve overlapping feature/tutorial pages
- Complete extensionless internal-link migration
- Validate canonicals, sitemap and redirects
- Record Search Console baseline and post-release measurements
- Publish v2 release notes

## Protected contracts

The following cannot change without explicit regression evidence and approval:

- Homepage `transliterateTextarea`
- Rich Editor `basic-example` and TinyMCE iframe binding
- Urdu Keyboard `write` textarea and key handlers
- Google transliteration initialization and language configuration
- Copy, clear, save, share and export behavior
- Canonical route ownership
- Redirect continuity
- Homepage ownership of broad `urdu typing` and `urdu writing` intent

## Release gate for each slice

- Automated transliteration, static, SEO and governance checks pass
- Cloudflare preview works on desktop and 320px mobile
- No horizontal overflow
- No console initialization errors
- Primary task is visible without scrolling through marketing content
- Functional IDs and bindings are unchanged or explicitly covered by new tests
- Repository tracker and page registry are updated

## Current decision

V2-S2 finalizes the common product frame and migrates the two highest-value support pages in the same implementation slice. The shell should make the product easier to navigate without exposing every utility at once, while Documentation and FAQ should feel like a focused help centre rather than separate microsites.
