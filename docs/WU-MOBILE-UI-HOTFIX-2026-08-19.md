# Write Urdu mobile production UI hotfix — 2026-08-19

## Trigger

A real mobile production capture after the Basic Writer toolbar rollout exposed layout regressions that were not represented by the previous interaction-only mobile checks.

## In scope

1. Compact outcome navigation must stay within the mobile viewport and scroll internally when its content is taller than the device.
2. An expanded outcome group must keep a normal-height summary; the summary must never stretch over its own expanded panel or later groups.
3. Phone navigation is a normal-flow single column so Write / Create / Work / Learn cannot overlap one another.
4. The Basic Writer command surface must not create horizontal page overflow. Share and Copy remain first-class and visible.
5. The PWA shell advances to v24 so corrected CSS reaches existing installations.
6. Core writing routes retain deliberate manual post-workspace advertising only; account-level Auto Ads must be excluded separately as documented in `WU-MOBILE-ADSENSE-CORE-WRITE-PAGE-EXCLUSIONS-2026-08-19.md`.

## Out of scope

- redesigning the desktop outcome navigation;
- changing the Basic Writer command order;
- changing transliteration, export or share semantics;
- hiding Google-rendered Auto Ads with CSS or JavaScript;
- changing SEO routes, titles or canonicals.

## Acceptance

Pixel 5 browser acceptance must prove:

- opening the menu does not increase document width beyond the viewport;
- opening Create leaves its summary under 70px high;
- the Create panel begins after its summary;
- Work begins after the Create panel rather than overlapping it;
- the menu is viewport-bounded and uses internal vertical scrolling;
- closing the menu restores the writing surface;
- Basic Writer Share and Copy remain visible and the toolbar stays fully inside the viewport.

The normal desktop/mobile product suite and production visual-quality audit remain release gates.
