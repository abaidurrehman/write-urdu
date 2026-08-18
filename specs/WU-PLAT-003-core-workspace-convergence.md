# WU-PLAT-003 — Core Workspace Convergence

**Priority:** P0  
**Status:** Active  
**Owner:** Product / UX  
**Depends on:** WU-PLAT-002 Product Journey / Workspace Handoffs

## Problem

Write Urdu now has a coherent product journey, outcome-led navigation and browser-local handoffs, but the product still exposes two generations of UX:

- newer workspaces such as Voice Typing, Image to Urdu Text, social makers and Invoice are focused, task-led and calm;
- the highest-traffic foundational workspaces — Basic Writer, Urdu Keyboard and Rich Editor — still contain legacy Bootstrap-era structure, old social chrome and tool-heavy controls that can compete with the actual writing canvas.

The goal is **convergence, not redesign**. Mature SEO routes, transliteration behavior and proven editor engines must remain stable while the user-facing hierarchy becomes consistent with the newer task-first workspace pattern.

## Product principle

> Make the oldest, most-used parts of Write Urdu feel as intentional as the newest parts.

A core workspace should follow:

**Clear job → dominant workspace → immediate local actions → Continue with… → supporting guidance**

It must not behave like a portal that asks users to choose among unrelated tools before they have done the primary job.

## Non-negotiables

1. Preserve mature URLs, canonicals and search ownership.
2. Do not change transliteration behavior as part of UX convergence.
3. Do not push the writing canvas lower on the page.
4. No AdSense inside the active authoring/result/action surface.
5. User text must not be placed in URLs or analytics payloads.
6. Browser-local drafts/history remain local-first.
7. Existing v2 handoff runtime and `Continue with…` registry remain authoritative.
8. Do not create a new design language; reuse the current V2/V3 design system.
9. Remove implementation jargon from primary labels where a user-job phrase is clearer.
10. Dedicated SEO/task routes remain independently addressable even if navigation becomes simpler.
11. Shared shell text and navigation must maintain readable contrast on every migrated route.

## UX findings being addressed

### F1 — Basic Writer behaves like a portal before it behaves like an editor

Current pre-writing controls expose export, Rich Editor, Templates, Invoice, Card, QR, Share and settings before the user has meaningful text.

**Desired:** hero/orientation → input mode → writing canvas. Generic output actions should be hidden until work exists. Cross-workspace creation belongs in the contextual `Continue with…` panel.

### F2 — Legacy social chrome weakens the privacy-first product story

Old Facebook like/comments and Twitter follow UI remains in foundational page markup.

**Desired:** social sharing should be about the user's writing. Legacy follow/comment chrome must not appear in the core workspace experience. Source/network retirement follows after user-visible retirement.

### F3 — Taxonomy still drifts across navigation, sitemap and documentation

The global product IA is `Write / Create / Work / Learn`, but the sitemap/documentation still partly encode older groupings.

**Desired:** the workspace registry is the product-taxonomy authority. Human directory/help surfaces should reinforce the same mental model.

### F4 — Some labels still lead with implementation language

Examples include RTL/Unicode/OCR wording in primary selection UI.

**Desired:** user outcome first; technical term secondary where useful for search or disambiguation.

### F5 — Keyboard and Rich Editor still feel structurally older than newer workspaces

**Desired:** progressively converge them toward the shared task-first workspace pattern without replacing their proven input/editor engines.

### F6 — Shared footer contrast regressed

The V3 shell can render a light footer while parts of the footer still assume light-on-dark text, making navigation and supporting copy difficult or impossible to read.

**Desired:** the shared footer must have an explicit dark surface with high-contrast headings, links and supporting text on desktop and mobile. The visual gate should measure computed contrast, not rely on a screenshot alone.

## Delivery slices

### Slice A — Canvas-first Basic Writer — **in implementation**

- move the generic Basic Writer action bar below the writing canvas;
- keep it hidden while the draft is empty;
- keep **Copy** and **Export** immediately available after text exists;
- keep text sharing available under the compact **More** menu rather than as another equal-weight action;
- retire the pre-writing Create group from the generic toolbar;
- use `Continue with…` for Rich Editor / Card Studio / QR;
- do not change transliteration, export implementation or canonical metadata.

### Slice B — Legacy trust-chrome retirement — **user-visible portion in implementation**

- remove Facebook like/comments and Twitter-follow chrome from core workspaces;
- keep the user-owned text share action under the Basic Writer completion menu;
- follow with source/network cleanup of obsolete SDK/analytics-era markup in Basic/Keyboard/Rich once each page is structurally migrated.

### Slice C — Taxonomy propagation — **visible portion in implementation**

- keep `Write / Create / Work / Learn` as the authoritative product taxonomy;
- place Text Cleaner under Write/Fix rather than Create;
- place Invoice under Work rather than Create;
- extend documentation capture paths to Voice Typing, Image to Urdu Text and InPage → Unicode;
- replace primary jargon with user-job wording;
- restore a dark readable shared footer and keep its contrast protected by browser acceptance.

### Slice D — Urdu Keyboard convergence

- replace the legacy page hierarchy with the shared workspace pattern;
- keep the on-screen keyboard and direct-input behavior unchanged;
- reduce controls before the text area;
- preserve handoffs, draft history and SEO route ownership;
- remove legacy social/analytics dependencies from source.

### Slice E — Rich Editor convergence

- make the document canvas visually dominant;
- group frequent formatting separately from advanced formatting;
- keep export in one predictable completion area;
- retain TinyMCE as the editor engine unless a separate technical migration is approved;
- remove legacy social/analytics dependencies from source.

### Slice F — Returning-user continuity

- if a recoverable local draft exists, provide a subtle `Continue your last draft` entry;
- never auto-overwrite current work;
- keep start-new explicit;
- integrate with future My Drafts without forcing authentication.

### Slice G — Create discovery simplification

- retain dedicated Card / WhatsApp / Instagram / Facebook / Name Art / Stylish / Templates / QR URLs;
- reduce equal-weight choice overload in global navigation;
- group closely related social-image outcomes where appropriate;
- do not merge SEO pages merely to simplify the menu.

### Slice H — Search and legacy dependency cleanup

- evaluate static/local site search as a privacy-consistent alternative to Google Custom Search;
- remove obsolete social SDKs and duplicate legacy analytics integrations from core pages;
- retain required product measurement through the privacy-safe telemetry system.

## Slice A/C acceptance criteria

1. On `/`, the writing textarea is above the generic output action bar in document order after runtime convergence.
2. The generic action bar is hidden for an empty Basic Writer and appears after text exists.
3. Templates, Invoice, Card and QR are not exposed in the generic Basic Writer toolbar; Card/QR/Rich remain available through `Continue with…`.
4. Copy and Export are immediately available after content exists; text sharing remains reachable through `More` without becoming another primary button.
5. The homepage canonical/title/transliteration behavior is unchanged.
6. Facebook like/comments and Twitter follow controls are not visible on Basic Writer, Keyboard or Rich Editor.
7. Global user-facing navigation describes Text Cleaner as fixing broken/badly formatted Urdu text, with technical identity secondary.
8. Image-to-text navigation leads with screenshot/photo → editable text and uses `Image to Urdu Text` as the tool identity.
9. The human sitemap has a visible Work section; Invoice belongs there; Text Cleaner belongs under Write.
10. Documentation represents Roman Urdu, direct Urdu, Voice, Image and InPage as legitimate ways to start with Urdu text.
11. Shared footer background remains dark and footer headings, links and supporting text meet at least 4.5:1 contrast in desktop and Pixel 5 acceptance.
12. Desktop and Pixel 5 acceptance remain green.
13. V3 production visual-quality audit remains a merge gate.

## Explicit non-scope for this slice

- rewriting Basic Writer HTML source wholesale;
- changing Google transliteration integration;
- replacing TinyMCE;
- redesigning the newer Voice/Image/Social/Invoice workspaces;
- changing canonical URLs;
- adding authentication;
- adding new ads or moving ads closer to authoring;
- merging dedicated creation URLs.

## Follow-up source cleanup rule

The runtime convergence layer is an intentionally low-risk bridge. It is **not** permission to leave legacy source forever. When Keyboard and Rich are structurally migrated, obsolete fallback navigation, Facebook/Twitter widgets, duplicate analytics-era scripts and retired Bootstrap-only markup should be removed from source and the runtime bridge reduced accordingly.