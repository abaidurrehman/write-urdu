# Top navigation mega-menu redesign

Status: approved by user (2026-09-06), pending spec review
Owner: abaid
Not tracked under an existing WU-* backlog ticket. This is a presentation-layer
redesign of the existing top nav (`Write`/`Create`/`Work`/`Learn`, `Explore`
when live) — no new product surface, no backend change. Confirmed against
`specs/README.md`: no conflict with the active `WU-PLAT-002H` P0 gate, since
that gate covers activation/conversion UX, not this component. If the user
wants this tracked long-term, it can be filed as a new ticket later; not
required to proceed.

## Problem

Current top nav dropdowns (`js/outcome-navigation.js` → `renderGroup`) use
native `<details>/<summary>`: instant open/close, no animation, single-column
link list, no visual identity per section. Site has been revisited on this
component "many times" without reaching a polished result. Reference: a
competitor's two-panel "Create" menu (link list left, large illustrated
preview card right, smooth open transition) that the user wants matched in
spirit across every top-level group, sitewide.

No custom raster/photo image generation is available in this environment.
The preview panel is built from CSS/SVG (gradient background, large Urdu
headline glyph via type, decorative icon accents from the existing `ICONS`
SVG paths) — not a generated photograph.

## Scope

In scope:
- `js/outcome-navigation.js`: replace `<details>/<summary>` group markup with
  JS-controlled disclosure (button + panel), add two-column panel layout, add
  a `preview` field to each `GROUPS` entry, rename `work` group label to
  `Tools` / `ٹولز` (id `work` unchanged to avoid touching any other id
  reference).
- `css/outcome-navigation.css`: two-column grid for the panel, gradient
  preview-card styles (a small fixed set of gradient/icon themes, one per
  group), open/close transition, mobile collapse (preview column hidden,
  list stays full width — unchanged mobile accordion behavior otherwise).
- `tests/outcome-navigation-contract.test.js`: update the two assertions
  currently coupled to `<summary>` CSS text so they check the equivalent
  invariants against the new toggle-button markup.

Out of scope:
- `Explore` group's rollout gating (`probeCommunityPublicDiscovery`,
  `COMMUNITY_PUBLIC_ENABLED`) — untouched. It is currently **not live**
  (client-side probe against `/api/community/publications` gates it; no
  evidence that flag is flipped in production). The new `renderGroup` applies
  uniformly to whatever is in `GROUPS` at render time, so Explore
  automatically gets the same two-panel treatment the moment it's ever
  spliced in — no special-casing needed now or later.
- Footer nav (`renderFooter`, `FOOTER_GROUPS`) — footer is a plain link list
  in the reference screenshot's own product too; no mega-menu behavior there.
  Confirmed `FOOTER_GROUPS` has no `work` id (its groups are `write-urdu`,
  `create`, `help`), so the `Work` → `Tools` label rename has no footer
  mirror to make.
- Any new backend endpoint, content, or data source.
- Hover-intent opening — click/keyboard only for v1 (see Interaction).

## Approach

Single approach (already presented and approved): two-panel mega-menu,
JS-driven disclosure, CSS-only illustrated preview pane, driven by new
`preview` data on each existing `GROUPS` entry.

## Data model

Each entry in `GROUPS` (and, when live, `EXPLORE_GROUP`) gains:

```js
preview: {
    headline: { en: '...', ur: '...' },   // large display text in the panel
    caption:  { en: '...', ur: '...' },   // small supporting line
    ctaHref:  '/some-primary-link',       // usually items[0].href
    theme:    'write' | 'create' | 'tools' | 'learn' | 'explore'
}
```

`theme` selects a CSS class (`wu-nav-preview--write` etc.) that owns the
gradient background and one large decorative icon (reused from `ICONS`) —
no new icon assets. `theme` is intentionally the same set as group `id`s but
kept as its own field so a future group can reuse another group's visual
theme without renaming ids.

Content for the five `preview` blocks (four now, `explore` ready for
whenever it goes live):

| Group | Headline (en) | Caption (en) |
|---|---|---|
| write | "Type Urdu, instantly" | "From English keys to perfect Urdu script." |
| create | "Turn words into art" | "Cards, posts and status images in Urdu." |
| work (Tools) | "Get it done in Urdu" | "Invoices, documents, and formal writing." |
| learn | "Master Urdu typing" | "Guides for the alphabet, fonts and tools." |
| explore | "Read real Urdu writing" | "Stories and posts from the community." |

Urdu headline/caption text to be written directly into the code during
implementation (not English-then-translated placeholders) — flagged here so
implementation doesn't ship literal English-only content for `ur`.

## Markup change

`renderGroup` replaces:

```html
<details class="wu-nav-more wu-outcome-menu" data-wu-nav-group="ID">
  <summary>...</summary>
  <div class="wu-nav-more-menu wu-outcome-menu-panel">...items...</div>
</details>
```

with:

```html
<div class="wu-nav-more wu-outcome-menu" data-wu-nav-group="ID">
  <button type="button" class="wu-outcome-toggle" aria-expanded="false" aria-controls="wu-nav-panel-ID">
    ...icon/label/chevron (unchanged content)...
  </button>
  <div id="wu-nav-panel-ID" class="wu-nav-more-menu wu-outcome-menu-panel" hidden>
    <div class="wu-nav-panel-list">...existing renderItem() output, unchanged...</div>
    <div class="wu-nav-panel-preview wu-nav-preview--THEME">
      <span class="wu-nav-preview-headline">HEADLINE</span>
      <span class="wu-nav-preview-caption">CAPTION</span>
      <a class="wu-nav-preview-cta" href="CTA_HREF">chevron/arrow, localized "Explore" label</a>
    </div>
  </div>
</div>
```

`data-wu-nav-group`, `data-wu-outcome-nav="v2"` and
`data-wu-outcome-navigation="v2"` markers on the container are preserved
exactly as today — `site-header.js`'s `protectOutcomeNavigationDuringV2Start`
MutationObserver checks these and must keep matching.

## Interaction

A small module-level controller in the same file:
- Click (or Enter/Space) on `.wu-outcome-toggle` toggles: flips
  `aria-expanded`, toggles the `hidden` attribute on its panel, and after
  removing `hidden` adds `.is-open` on the next animation frame so the CSS
  transition (opacity + translateY, ~160ms ease-out) actually runs instead of
  jumping.
- Opening one group's panel closes any other open panel first (single panel
  open at a time).
- Closing triggers: click outside the nav, `Escape` key (returns focus to the
  toggle button), toggle button clicked again.
- No hover-intent auto-open in this iteration — click/keyboard only. This is
  a deliberate simplification versus the reference product; can be added
  later as a separate bounded change if wanted after seeing v1 live.
- `prefers-reduced-motion: reduce` keeps today's behavior of disabling the
  transition (existing media query in `outcome-navigation.css`, extended to
  cover the new panel transition too).

## Responsive behavior

Existing mobile breakpoint (nav collapses to accordion) is unchanged in
spirit: below the breakpoint, `.wu-nav-panel-preview` is `display:none` and
`.wu-nav-panel-list` takes full width — no room for a decorative pane on a
phone screen, and current full-width single-column mobile layout keeps
working. Desktop/tablet above the breakpoint gets the two-column grid
(`grid-template-columns: minmax(0,1fr) minmax(220px,320px)` or similar, exact
values decided during implementation against real content lengths).

## Error handling / edge cases

- A `GROUPS` entry with no `preview` field: `renderGroup` must degrade to
  today's single-column panel (no crash, no empty gradient box) — guard with
  `group.preview ?` in the template. This matters because `EXPLORE_GROUP` is
  defined in the same file and will get a `preview` block per the table
  above, but any future group added without one shouldn't break rendering.
- Locale switch (`write-urdu:locale-change` event triggers `render()`):
  since `render()` fully rebuilds `GROUPS.map(renderGroup)`, headline/caption
  localization falls out of the existing `lang` parameter threading — no
  special-case needed, but implementation must double check no open-panel
  state needs preserving across a full re-render (acceptable to reset to
  closed on locale change, matching today's reset-on-rerender behavior).
- RTL: existing CSS already has `html[dir="rtl"]` panel-position overrides
  per group id; the new two-column grid must also flip column order in RTL
  (`direction` inherits, but explicit `grid-template-columns` order should be
  mirrored, not just text-direction-flipped) — call out explicitly since this
  is an easy miss.

## Testing

- Update `tests/outcome-navigation-contract.test.js`: replace the two
  `<summary>`-coupled assertions with equivalent assertions against
  `.wu-outcome-toggle` (compact height, no full-height stretch when panel is
  open) — same invariant, new selector.
- Add: assertion that `.wu-nav-panel-preview` has `display:none` inside the
  existing mobile-breakpoint media query block.
- Add: a DOM-level test (jsdom, matching existing test harness style) that
  opening one group's toggle sets `aria-expanded="true"` and removes
  `hidden` on its panel, and opening a second group closes the first
  (`aria-expanded` back to `false`, `hidden` restored).
- Manual/live check after implementation: render the real site (dev server),
  operate the menu in both `en` and `ur` locale, both LTR/RTL, and at mobile
  width, before calling this done — per project convention that shipped nav
  behavior must be verified live, not just via unit tests, since it's
  injected at runtime.

## Out-of-band items confirmed with user

- `Work` → `Tools` label rename (en/ur) approved as part of this change.
