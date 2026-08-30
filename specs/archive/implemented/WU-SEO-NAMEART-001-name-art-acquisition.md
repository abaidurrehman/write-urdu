# WU-SEO-NAMEART-001 — Urdu Name Art acquisition strengthening

**Status:** Implemented in this slice  
**Date:** 2026-08-13  
**Owner route:** `/urdu-name-art-maker`

## Purpose

Strengthen the existing Urdu Name Art product as the narrow search owner for image-based Urdu name design without creating duplicate landing pages or weakening the live Card Studio-based design workflow.

## Query ownership

`/urdu-name-art-maker` owns image intent around:

- Urdu name art
- Urdu name image maker
- Urdu name DP / profile image maker
- Urdu name design
- write a name in Urdu on an image

The route does **not** own broad generic `name art maker` intent and must not be repositioned as a random-name generator.

## Product differentiation

The page must accurately expose what the shipped product already provides:

- 12 template packs;
- 24 original Name Art templates;
- six output presets: square, portrait, landscape, wide social, story and transparent name;
- Urdu-safe font rendering through the shared Card Studio renderer;
- local background-image processing;
- regular PNG and dedicated transparent PNG output;
- short-lived sessionStorage handoff from Stylish Urdu Text.

These are product facts, not keyword decoration. `js/name-art-core.js` remains the source of truth for template packs, templates and presets.

## Intent boundary with Stylish Urdu Text

- `/stylish-urdu-text-generator` owns copyable Unicode decoration and text-style intent.
- `/urdu-name-art-maker` owns exact rendered image intent where the selected Urdu font appearance needs to survive export.
- The two routes should link to one another and explain the distinction rather than compete for the same promise.

## Intent boundary with Card Studio

Card Studio remains the broad Urdu text/photo/post creator. Name Art is the focused shortcut layer for personal-name/profile/design jobs and continues to reuse Card Studio as the renderer.

## SEO/content implementation

1. Preserve the established canonical URL and product H1 `Urdu Name Art Studio`.
2. Use a search-facing title that leads with `Urdu Name Art Maker` and clarifies name-image / DP intent.
3. Keep all substantial acquisition content **after** the active shortcuts + embedded design workspace.
4. Surface the real 24-template / 12-pack / six-preset product depth in crawlable source-visible text.
5. Add practical use cases for profile/DP images, transparent name layers and personal photo/background designs.
6. Add FAQ answers that distinguish image rendering from copyable Stylish Urdu Text and distinguish designing a supplied name from generating a random name.
7. Keep Name Art in the Create section of `llms.txt`.

## Mobile guardrail

The design task stays first. On phone layouts, the shortcuts and Card Studio workspace must remain ahead of acquisition guidance/FAQ content, with no horizontal overflow. Existing P1.4 Playwright acceptance remains authoritative for the responsive workspace.

## AdSense guardrail

Name Art remains a Create page. The explicit `data-wu-ad-boundary="post-workspace"` boundary belongs after the embedded design workspace. No ad may be inserted inside the shortcut controls, template grid, iframe workspace or export controls.

## Do not do

- no programmatic page per personal name;
- no `/urdu-name-dp-maker`, `/urdu-name-image-maker` or similar keyword-clone route;
- no generic name-generation claims;
- no claims that copyable text preserves an exact Urdu font across apps;
- no change to the Card Studio renderer, templates, session handoff or export logic in this SEO slice;
- no separate Name Art guide until Search Console proves a distinct informational query cluster.

## Acceptance

- static acquisition contract verifies route ownership, metadata, product facts and ad boundary placement;
- browser acquisition acceptance verifies final rendered title, canonical and WebApplication schema after shared-shell initialization;
- existing Name Art v2 browser acceptance continues to verify 24 templates, six presets, mobile stacking and workspace-first behavior;
- full static/SEO/governance/desktop+mobile CI must pass before merge.
