# Top Navigation Mega-Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the native `<details>/<summary>` top-nav dropdowns in `js/outcome-navigation.js` with a JS-controlled, animated two-panel mega-menu (link list + illustrated CSS preview card), and rename the `Work` group label to `Tools`.

**Architecture:** Single rendering module stays `js/outcome-navigation.js`. Each `GROUPS` entry gains a `preview` data field; `renderGroup` emits a `<button>` + sibling panel instead of `<details>/<summary>`; a small delegated-event controller (click/keydown on `document`) owns open/close/animate state via `hidden` attribute + `.is-open` class, independent of the legacy `[open]`-driven CSS in `css/site-header.css` that other renderers (`js/site-header-core.js`, `js/v2-shell.js`) still depend on and which this plan does not touch. All new CSS lives in `css/outcome-navigation.css`, fully self-scoped under the existing `.wu-site-header[data-wu-outcome-navigation="v2"]` ancestor selector.

**Tech Stack:** Vanilla ES5-style JS (`var`, `function`, no build step), plain CSS (no preprocessor), Node `assert`-based contract tests (`scripts/run-contract-tests.js`), Playwright browser tests (`npm run test:browser`).

**Spec:** `docs/superpowers/specs/2026-09-06-nav-mega-menu-design.md`

## Global Constraints

- Do not edit `css/site-header.css` — its `.wu-nav-more`/`.wu-nav-more-menu`/`[open]` rules are shared with `js/site-header-core.js` (~line 597-622) and `js/v2-shell.js` (~line 71), which still render real `<details>` menus. All new selectors must be self-contained in `css/outcome-navigation.css`.
- All new copy fields use the `{ en, ur }` shape already used throughout `GROUPS`.
- Preserve `data-wu-nav-group`, `data-wu-outcome-nav="v2"`, `data-wu-outcome-navigation="v2"` attributes exactly — `site-header.js`'s `protectOutcomeNavigationDuringV2Start` MutationObserver depends on them.
- No new npm dependency, no new test framework — behavioral tests go in the existing `tests/outcome-navigation.spec.js` Playwright file; static/text tests go in `tests/outcome-navigation-contract.test.js`.
- `work` group `id` stays `work` (only its `label` text changes to Tools/ٹولز) — nothing else keys off the label text.
- Run `node scripts/run-contract-tests.js` after every contract-test-touching task, and `npx playwright test outcome-navigation.spec.js` (plus `v3-visual-quality.spec.js` once touched) after every markup/CSS/behavior task.

---

## Task 1: Add `preview` data to every group, rename Work to Tools

**Files:**
- Modify: `js/outcome-navigation.js:6-77` (the `GROUPS` array and `EXPLORE_GROUP`/`FOOTER_EXPLORE_GROUP`)
- Test: `tests/outcome-navigation-contract.test.js`

**Interfaces:**
- Produces: each object in `GROUPS` (and `EXPLORE_GROUP`) now has a `preview` property shaped `{ headline: {en,ur}, caption: {en,ur}, ctaHref: string, theme: string }`. Later tasks (`renderPreview`) read `group.preview.headline[lang]`, `.caption[lang]`, `.ctaHref`, `.theme`.

- [ ] **Step 1: Add failing contract assertions**

Open `tests/outcome-navigation-contract.test.js` and add these lines directly after the existing `assert.doesNotMatch(primaryNavigation, /id: ['"](?:drafts|my-drafts)['"]/, ...)` line (around line 23):

```js
assert.match(primaryNavigation, /label: \{ en: 'Tools', ur: 'ٹولز' \}/, 'Work group must be relabeled Tools for the mega-menu redesign');
assert.doesNotMatch(primaryNavigation, /label: \{ en: 'Work', ur: 'کام' \}/, 'Old Work label must not remain alongside the new Tools label');
['write', 'create', 'work', 'learn'].forEach((group) => {
  const groupSource = primaryNavigation.slice(primaryNavigation.indexOf("id: '" + group + "'"));
  assert.match(groupSource.slice(0, groupSource.indexOf("\n        },") + 1), /preview: \{[\s\S]*?theme: '[a-z]+'/, `Missing mega-menu preview data on the ${group} group`);
});
```

- [ ] **Step 2: Run the contract tests to confirm the new assertions fail**

Run: `node scripts/run-contract-tests.js`
Expected: FAIL — the "Work group must be relabeled Tools" assertion (and the preview-data assertions) throw, since `js/outcome-navigation.js` still says `Work`/`کام` and has no `preview` field.

- [ ] **Step 3: Update `GROUPS` and `EXPLORE_GROUP` in `js/outcome-navigation.js`**

Replace the `write` group's closing (lines 8-19) — insert `preview` after `label`, before `items`:

```js
        {
            id: 'write', icon: 'write',
            label: { en: 'Write', ur: 'لکھیں' },
            preview: {
                headline: { en: 'Type Urdu, instantly', ur: 'فوری طور پر اردو ٹائپ کریں' },
                caption: { en: 'From English keys to perfect Urdu script.', ur: 'انگریزی کی بورڈ سے مکمل اردو رسم الخط تک۔' },
                ctaHref: '/',
                theme: 'write'
            },
            items: [
```

Replace the `create` group's opening (lines 21-22) the same way:

```js
        {
            id: 'create', icon: 'create',
            label: { en: 'Create', ur: 'بنائیں' },
            preview: {
                headline: { en: 'Turn words into art', ur: 'الفاظ کو فن میں بدلیں' },
                caption: { en: 'Cards, posts and status images in Urdu.', ur: 'اردو میں کارڈز، پوسٹس اور اسٹیٹس امیجز۔' },
                ctaHref: '/urdu-card-studio',
                theme: 'create'
            },
            items: [
```

Replace the `work` group's opening (lines 34-36) — this is also where the label renames:

```js
        {
            id: 'work', icon: 'work',
            label: { en: 'Tools', ur: 'ٹولز' },
            preview: {
                headline: { en: 'Get it done in Urdu', ur: 'اردو میں کام مکمل کریں' },
                caption: { en: 'Invoices, documents, and formal writing.', ur: 'انوائسز، دستاویزات اور رسمی تحریر۔' },
                ctaHref: '/urdu-invoice-generator',
                theme: 'tools'
            },
            items: [
```

Replace the `learn` group's opening (lines 42-44):

```js
        {
            id: 'learn', icon: 'learn',
            label: { en: 'Learn', ur: 'سیکھیں' },
            preview: {
                headline: { en: 'Master Urdu typing', ur: 'اردو ٹائپنگ میں مہارت حاصل کریں' },
                caption: { en: 'Guides for the alphabet, fonts and tools.', ur: 'حروفِ تہجی، فونٹس اور ٹولز کے لیے رہنما۔' },
                ctaHref: '/urdu-alphabet',
                theme: 'learn'
            },
            items: [
```

Replace `EXPLORE_GROUP` (lines 64-70):

```js
    var EXPLORE_GROUP = {
        id: 'explore', icon: 'book',
        label: { en: 'Explore', ur: 'دریافت کریں' },
        preview: {
            headline: { en: 'Read real Urdu writing', ur: 'حقیقی اردو تحریر پڑھیں' },
            caption: { en: 'Stories and posts from the community.', ur: 'کمیونٹی کی کہانیاں اور پوسٹس۔' },
            ctaHref: '/urdu-writers',
            theme: 'explore'
        },
        items: [
            { href: '/urdu-writers', icon: 'book', label: { en: 'Read Urdu writing from the community', ur: 'کمیونٹی کی اردو تحریر پڑھیں' }, tool: { en: 'Urdu Writers', ur: 'اردو رائٹرز' } }
        ]
    };
```

Leave `FOOTER_EXPLORE_GROUP` and `FOOTER_GROUPS` untouched — they have no `work` id and no preview concept (spec confirmed this).

- [ ] **Step 4: Run the contract tests again to confirm they pass**

Run: `node scripts/run-contract-tests.js`
Expected: PASS — `Outcome-led navigation contract passed.` printed, no assertion errors.

- [ ] **Step 5: Commit**

```bash
git add js/outcome-navigation.js tests/outcome-navigation-contract.test.js
git commit -m "$(cat <<'EOF'
Add mega-menu preview data to nav groups, rename Work to Tools

Data-only change: each GROUPS entry (and EXPLORE_GROUP) now carries a
preview {headline, caption, ctaHref, theme} block consumed by the
upcoming two-panel mega-menu renderer. Work group relabeled Tools/ٹولز.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Replace `<details>/<summary>` markup with a button + panel, base toggle CSS

**Files:**
- Modify: `js/outcome-navigation.js` (`renderGroup` function, ~line 212-218)
- Modify: `css/outcome-navigation.css`
- Test: `tests/outcome-navigation-contract.test.js`

**Interfaces:**
- Consumes: `group.preview` from Task 1 (only checked for truthiness in this task; not rendered yet — that's Task 4).
- Produces: `renderGroup(group, lang)` now returns `<div class="wu-nav-more wu-outcome-menu" data-wu-nav-group="ID"><button class="wu-outcome-toggle" aria-expanded="false" aria-controls="wu-nav-panel-ID">...</button><div id="wu-nav-panel-ID" class="wu-nav-more-menu wu-outcome-menu-panel[ has-preview]" hidden><div class="wu-nav-panel-list">...items...</div></div></div>`. Task 3 reads `.wu-outcome-toggle`, `.wu-nav-more`, `.wu-outcome-menu-panel` class names and the `hidden` attribute/`aria-expanded` contract established here.

- [ ] **Step 1: Update the contract test's summary-coupled assertions**

In `tests/outcome-navigation-contract.test.js`, replace:

```js
assert.match(css, /\.wu-outcome-menu>summary\{height:auto!important;min-height:48px/, 'Compact outcome summaries must keep intrinsic height');
assert.doesNotMatch(css, /\.wu-outcome-menu>summary\{height:100%/, 'Outcome summaries must never stretch across an expanded details panel');
```

with:

```js
assert.match(css, /\.wu-outcome-menu>\.wu-outcome-toggle\{height:auto!important;min-height:48px/, 'Compact outcome toggles must keep intrinsic height');
assert.doesNotMatch(css, /\.wu-outcome-menu>\.wu-outcome-toggle\{height:100%/, 'Outcome toggles must never stretch across an expanded panel');
```

- [ ] **Step 2: Run the contract tests to confirm this specific pair fails**

Run: `node scripts/run-contract-tests.js`
Expected: FAIL on the "Compact outcome toggles must keep intrinsic height" assertion — `css/outcome-navigation.css` still uses the old `summary` selector.

- [ ] **Step 3: Replace `renderGroup` in `js/outcome-navigation.js`**

Replace lines 212-218:

```js
    function renderGroup(group, lang) {
        var isActive = group.items.some(active);
        return '<details class="wu-nav-more wu-outcome-menu" data-wu-nav-group="' + group.id + '">' +
            '<summary' + (isActive ? ' class="is-active"' : '') + '>' + icon(group.icon) + '<span>' + group.label[lang] + '</span><span class="wu-nav-chevron" aria-hidden="true">⌄</span></summary>' +
            '<div class="wu-nav-more-menu wu-outcome-menu-panel">' + group.items.map(function (item) { return renderItem(item, lang); }).join('') + '</div>' +
        '</details>';
    }
```

with:

```js
    function renderGroup(group, lang) {
        var isActive = group.items.some(active);
        var panelId = 'wu-nav-panel-' + group.id;
        var hasPreview = !!group.preview;
        return '<div class="wu-nav-more wu-outcome-menu" data-wu-nav-group="' + group.id + '">' +
            '<button type="button" class="wu-outcome-toggle' + (isActive ? ' is-active' : '') + '" aria-expanded="false" aria-controls="' + panelId + '">' +
                icon(group.icon) + '<span>' + group.label[lang] + '</span><span class="wu-nav-chevron" aria-hidden="true">⌄</span>' +
            '</button>' +
            '<div id="' + panelId + '" class="wu-nav-more-menu wu-outcome-menu-panel' + (hasPreview ? ' has-preview' : '') + '" hidden>' +
                '<div class="wu-nav-panel-list">' + group.items.map(function (item) { return renderItem(item, lang); }).join('') + '</div>' +
            '</div>' +
        '</div>';
    }
```

- [ ] **Step 4: Replace the base toggle CSS in `css/outcome-navigation.css`**

Replace line 3:

```css
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-outcome-menu>summary{padding:10px 13px;font-size:.82rem}
```

with (this fully replaces the base look this element used to inherit from `css/site-header.css`'s shared `.wu-nav-more>summary` rule, since a `<button>` no longer matches that selector and that shared rule must not be edited — see Global Constraints):

```css
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-outcome-toggle{position:relative;display:inline-flex;align-items:center;gap:7px;padding:10px 13px;border:1px solid transparent;border-radius:var(--wu-radius-md);color:var(--wu-shell-nav-text)!important;background:transparent;font:inherit;font-size:.82rem;font-weight:var(--wu-weight-semibold);line-height:1;cursor:pointer;white-space:nowrap;transition:background-color var(--wu-transition-fast),color var(--wu-transition-fast),border-color var(--wu-transition-fast)}
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-outcome-toggle:hover{border-color:var(--wu-shell-nav-hover-border);background:var(--wu-color-brand-softer);color:var(--wu-color-brand-strong)!important}
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-outcome-toggle:hover .wu-outcome-icon{color:var(--wu-color-brand-strong);transform:translateY(-1px)}
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-outcome-toggle.is-active{border-color:var(--wu-shell-nav-active-border);background:var(--wu-color-brand-soft);color:var(--wu-color-brand-strong)!important}
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-outcome-toggle:focus-visible{outline:3px solid var(--wu-shell-focus-ring);outline-offset:2px}
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-outcome-menu-panel[hidden]{display:none!important}
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-outcome-menu-panel:not([hidden]){display:grid!important;gap:2px;opacity:0;transform:translateY(-6px);transition:opacity .16s ease-out,transform .16s ease-out}
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-nav-more.is-open>.wu-outcome-menu-panel{opacity:1;transform:translateY(0)}
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-nav-panel-list{display:grid;gap:2px;min-width:0}
```

Now find and replace the two mobile-breakpoint `summary` selectors later in the same file (currently lines 32 and 40):

```css
  .wu-site-header[data-wu-outcome-navigation="v2"] .wu-outcome-menu>summary{height:auto!important;min-height:48px;justify-content:flex-start;padding:13px;box-sizing:border-box}
```

becomes:

```css
  .wu-site-header[data-wu-outcome-navigation="v2"] .wu-outcome-menu>.wu-outcome-toggle{height:auto!important;min-height:48px;justify-content:flex-start;padding:13px;box-sizing:border-box}
```

and:

```css
  .wu-site-header[data-wu-outcome-navigation="v2"] .wu-outcome-menu>summary{width:100%;height:auto!important;min-height:46px}
```

becomes:

```css
  .wu-site-header[data-wu-outcome-navigation="v2"] .wu-outcome-menu>.wu-outcome-toggle{width:100%;height:auto!important;min-height:46px}
```

- [ ] **Step 5: Run the contract tests to confirm they pass**

Run: `node scripts/run-contract-tests.js`
Expected: PASS.

- [ ] **Step 6: Manual smoke check with the dev server**

Run: `npm start` (in one terminal), then open `http://127.0.0.1:8765/` in a browser.
Expected: nav groups render as buttons; clicking does nothing yet (no JS controller wired up until Task 3) but no console errors, and the button visually matches the old summary's look (same padding/hover/active colors).
Stop the dev server (Ctrl+C) when done.

- [ ] **Step 7: Commit**

```bash
git add js/outcome-navigation.js css/outcome-navigation.css tests/outcome-navigation-contract.test.js
git commit -m "$(cat <<'EOF'
Replace details/summary nav markup with button + panel

Swaps the native <details>/<summary> disclosure for a <button> +
sibling panel (hidden by default), giving JS full control over
open/close instead of relying on native details semantics. Base look
is fully self-contained in outcome-navigation.css since the old shared
summary styling in site-header.css is still used by other renderers.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Wire up the open/close/animate controller

**Files:**
- Modify: `js/outcome-navigation.js` (add controller functions + event listeners)
- Test: `tests/outcome-navigation.spec.js`

**Interfaces:**
- Consumes: `.wu-nav-more`, `.wu-outcome-toggle`, `.wu-outcome-menu-panel`, `hidden` attribute, `aria-expanded` attribute (all from Task 2).
- Produces: clicking `.wu-outcome-toggle` toggles its group open/closed; opening one group closes any other open group; `Escape` closes the open group and returns focus to its toggle; clicking outside `.wu-nav-more` closes any open group. No new exports on `WriteUrduOutcomeNavigation`.

- [ ] **Step 1: Add a failing Playwright assertion**

In `tests/outcome-navigation.spec.js`, add this new test (the existing tests in this file still reference `summary` and will be fixed in Task 5 — for now, add this new one so it's isolated and can be run on its own):

```js
test('opening a mega-menu group closes any other open group', async ({ page }) => {
  await open(page, '/');
  await openMobileMenuIfNeeded(page);

  const write = page.locator('[data-wu-nav-group="write"] > .wu-outcome-toggle');
  const create = page.locator('[data-wu-nav-group="create"] > .wu-outcome-toggle');

  await write.click();
  await expect(write).toHaveAttribute('aria-expanded', 'true');

  await create.click();
  await expect(create).toHaveAttribute('aria-expanded', 'true');
  await expect(write).toHaveAttribute('aria-expanded', 'false');

  await page.keyboard.press('Escape');
  await expect(create).toHaveAttribute('aria-expanded', 'false');
});
```

- [ ] **Step 2: Run this test to confirm it fails**

Run: `npx playwright test outcome-navigation.spec.js -g "closes any other open group"`
Expected: FAIL — `.wu-outcome-toggle` never gets `aria-expanded="true"` because clicking it does nothing yet.

- [ ] **Step 3: Add the controller to `js/outcome-navigation.js`**

Insert these functions after `renderGroup` and before `ensureStyles` (~after the new line 226 from Task 2), and the event listeners right before the existing `document.addEventListener('write-urdu:locale-change', ...)` line near the bottom of the file:

```js
    var OPEN_TRANSITION_MS = 160;

    function reducedMotion() {
        return !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    function closeGroup(group, immediate) {
        if (!group || !group.classList.contains('is-open')) return;
        var toggle = group.querySelector('.wu-outcome-toggle');
        var panel = group.querySelector('.wu-outcome-menu-panel');
        if (!toggle || !panel) return;
        toggle.setAttribute('aria-expanded', 'false');
        group.classList.remove('is-open');
        var hide = function () { panel.hidden = true; };
        if (immediate || reducedMotion()) hide();
        else root.setTimeout(hide, OPEN_TRANSITION_MS);
    }

    function closeAllGroups() {
        var nav = document.querySelector('.wu-primary-nav');
        if (!nav) return;
        Array.prototype.forEach.call(nav.querySelectorAll('.wu-nav-more.is-open'), function (group) { closeGroup(group); });
    }

    function openGroup(group) {
        var toggle = group.querySelector('.wu-outcome-toggle');
        var panel = group.querySelector('.wu-outcome-menu-panel');
        if (!toggle || !panel) return;
        closeAllGroups();
        panel.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        root.requestAnimationFrame(function () { group.classList.add('is-open'); });
    }

    document.addEventListener('click', function (event) {
        var toggle = event.target.closest ? event.target.closest('.wu-outcome-toggle') : null;
        if (toggle) {
            event.preventDefault();
            var group = toggle.closest('.wu-nav-more');
            if (group.classList.contains('is-open')) closeGroup(group);
            else openGroup(group);
            return;
        }
        if (!event.target.closest || !event.target.closest('.wu-nav-more')) closeAllGroups();
    });

    document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        var group = document.querySelector('.wu-nav-more.is-open');
        if (!group) return;
        closeGroup(group, true);
        var toggle = group.querySelector('.wu-outcome-toggle');
        if (toggle) toggle.focus();
    });
```

These listeners are registered once at module load (delegated on `document`), so they keep working across every `render()` re-render (locale switch, Explore group splice-in) without re-binding.

- [ ] **Step 4: Run the new test to confirm it passes**

Run: `npx playwright test outcome-navigation.spec.js -g "closes any other open group"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add js/outcome-navigation.js tests/outcome-navigation.spec.js
git commit -m "$(cat <<'EOF'
Wire up open/close/single-panel controller for the mega-menu

Delegated click/keydown listeners on document toggle aria-expanded and
the hidden attribute, add a .is-open class one animation frame later
so the CSS opacity/transform transition actually runs, and close on
outside-click, Escape, or opening a sibling group. Registered once at
module load so it survives every render() re-render (locale switch,
Explore group splice-in).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Preview panel — gradients, headline/caption/CTA, two-column layout, mobile hide

**Files:**
- Modify: `js/outcome-navigation.js` (add `renderPreview`, call it from `renderGroup`)
- Modify: `css/outcome-navigation.css`
- Test: `tests/outcome-navigation.spec.js`

**Interfaces:**
- Consumes: `group.preview.{headline,caption,ctaHref,theme}` (Task 1), `group.icon` + `ICONS` (existing), `localizedHref` (existing).
- Produces: `renderPreview(group, lang)` returning the preview `<div>` markup (or `''` when `group.preview` is absent); `renderGroup` appends its output inside the panel, after `.wu-nav-panel-list`.

- [ ] **Step 1: Add a failing Playwright assertion**

Add to `tests/outcome-navigation.spec.js`:

```js
test('desktop mega-menu panel shows an illustrated preview card', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, '/');

  const write = page.locator('[data-wu-nav-group="write"]');
  await write.locator('.wu-outcome-toggle').click();

  const preview = write.locator('.wu-nav-panel-preview');
  await expect(preview).toBeVisible();
  await expect(preview.locator('.wu-nav-preview-headline')).toHaveText('Type Urdu, instantly');
  await expect(preview.locator('.wu-nav-preview-cta')).toHaveAttribute('href', '/');
});

test('mobile mega-menu panel hides the preview card', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page, '/');
  await openMobileMenuIfNeeded(page);

  const write = page.locator('[data-wu-nav-group="write"]');
  await write.locator('.wu-outcome-toggle').click();
  await expect(write.locator('.wu-nav-panel-preview')).toBeHidden();
  await expect(write.locator('.wu-nav-panel-list')).toBeVisible();
});
```

- [ ] **Step 2: Run these tests to confirm they fail**

Run: `npx playwright test outcome-navigation.spec.js -g "preview card"`
Expected: FAIL — `.wu-nav-panel-preview` does not exist yet.

- [ ] **Step 3: Add `renderPreview` and wire it into `renderGroup` in `js/outcome-navigation.js`**

Add this function right before `renderGroup`:

```js
    function renderPreview(group, lang) {
        var preview = group.preview;
        if (!preview) return '';
        var ctaLabel = lang === 'ur' ? 'شروع کریں' : 'Get started';
        return '<div class="wu-nav-panel-preview wu-nav-preview--' + preview.theme + '">' +
            '<span class="wu-nav-preview-icon" aria-hidden="true"><svg viewBox="0 0 24 24">' + (ICONS[group.icon] || ICONS.write) + '</svg></span>' +
            '<span class="wu-nav-preview-headline">' + preview.headline[lang] + '</span>' +
            '<span class="wu-nav-preview-caption">' + preview.caption[lang] + '</span>' +
            '<a class="wu-nav-preview-cta" href="' + localizedHref(preview.ctaHref) + '">' + ctaLabel + '<span aria-hidden="true"> →</span></a>' +
        '</div>';
    }
```

Update `renderGroup` (from Task 2) to call it — change the panel's inner content line from:

```js
            '<div id="' + panelId + '" class="wu-nav-more-menu wu-outcome-menu-panel' + (hasPreview ? ' has-preview' : '') + '" hidden>' +
                '<div class="wu-nav-panel-list">' + group.items.map(function (item) { return renderItem(item, lang); }).join('') + '</div>' +
            '</div>' +
```

to:

```js
            '<div id="' + panelId + '" class="wu-nav-more-menu wu-outcome-menu-panel' + (hasPreview ? ' has-preview' : '') + '" hidden>' +
                '<div class="wu-nav-panel-list">' + group.items.map(function (item) { return renderItem(item, lang); }).join('') + '</div>' +
                renderPreview(group, lang) +
            '</div>' +
```

- [ ] **Step 4: Add preview CSS to `css/outcome-navigation.css`**

Add near the top of the file, after the existing `.wu-outcome-menu-panel{min-width:360px;padding:9px}` line:

```css
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-outcome-menu-panel.has-preview{min-width:560px}
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-nav-panel-preview{position:relative;display:flex;flex-direction:column;justify-content:flex-end;gap:6px;padding:18px;border-radius:var(--wu-radius-lg);color:#fff;overflow:hidden;min-height:150px}
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-nav-preview-icon{position:absolute;top:12px;right:12px;width:64px;height:64px;opacity:.22}
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-nav-preview-icon svg{width:100%;height:100%;fill:none;stroke:#fff;stroke-width:1.2}
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-nav-preview-headline{position:relative;font-size:1.3rem;font-weight:700;line-height:1.25}
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-nav-preview-caption{position:relative;font-size:.78rem;color:rgba(255,255,255,.82);line-height:1.4}
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-nav-preview-cta{position:relative;display:inline-flex;align-items:center;gap:5px;align-self:flex-start;margin-top:4px;padding:8px 14px;border:1px solid rgba(255,255,255,.32);border-radius:var(--wu-radius-pill);background:rgba(255,255,255,.16);color:#fff!important;font-size:.76rem;font-weight:600;text-decoration:none!important;transition:background var(--wu-transition-fast)}
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-nav-preview-cta:hover{background:rgba(255,255,255,.26)}
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-nav-preview--write{background:linear-gradient(135deg,#0f3d2a,#1c6b46)}
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-nav-preview--create{background:linear-gradient(135deg,#4a1942,#8a2f6d)}
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-nav-preview--tools{background:linear-gradient(135deg,#1c2b4a,#2f5c8a)}
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-nav-preview--learn{background:linear-gradient(135deg,#4a3a12,#8a6a2f)}
.wu-site-header[data-wu-outcome-navigation="v2"] .wu-nav-preview--explore{background:linear-gradient(135deg,#123d3d,#2f8a7a)}
```

Inside the existing `@media(min-width:1367px){...}` block (currently forces `grid-template-columns:1fr!important` on `.wu-nav-more-menu`), add these two lines so the extra class wins on specificity regardless of order:

```css
  .wu-site-header[data-wu-outcome-navigation="v2"] .wu-outcome-menu-panel.has-preview{grid-template-columns:minmax(240px,1fr) minmax(220px,300px)!important}
  .wu-site-header[data-wu-outcome-navigation="v2"] .wu-outcome-menu-panel.has-preview .wu-nav-panel-preview{height:100%}
```

Inside the existing `@media(max-width:1366px){...}` block, add:

```css
  .wu-site-header[data-wu-outcome-navigation="v2"] .wu-nav-panel-preview{display:none!important}
```

Do not add any RTL-specific grid override: `css/site-header.css:31` already sets `direction:rtl` on `.wu-primary-nav`, which is inherited by `.wu-outcome-menu-panel` — native CSS Grid automatically mirrors `grid-template-columns` track order under `direction:rtl`, so the preview card already lands on the correct visual side without extra CSS. Verify this visually in Task 5's manual check rather than adding speculative CSS.

- [ ] **Step 5: Run the tests to confirm they pass**

Run: `npx playwright test outcome-navigation.spec.js -g "preview card"`
Expected: PASS for both the desktop and mobile tests.

- [ ] **Step 6: Commit**

```bash
git add js/outcome-navigation.js css/outcome-navigation.css tests/outcome-navigation.spec.js
git commit -m "$(cat <<'EOF'
Add illustrated preview panel to the mega-menu

Each group's panel now shows a two-column layout on desktop: existing
link list on the left, a CSS-only gradient preview card (headline,
caption, CTA, decorative icon reused from the existing ICONS set) on
the right, one gradient theme per group. Preview card is hidden below
the 1366px breakpoint, matching the existing mobile accordion nav.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Fix the pre-existing Playwright/visual-quality tests broken by the markup change

**Files:**
- Modify: `tests/outcome-navigation.spec.js`
- Modify: `tests/v3-visual-quality.spec.js`

**Interfaces:**
- Consumes: `.wu-outcome-toggle` (Task 2), `Tools`/`ٹولز` label (Task 1). No new interfaces produced — this task only repairs existing tests to match the new contract.

- [ ] **Step 1: Update `tests/outcome-navigation.spec.js`'s pre-existing tests**

In the `'global navigation is organized by Write / Create / Work / Learn outcomes'` test, replace every `.locator('summary')` with `.locator('.wu-outcome-toggle')` (4 occurrences: lines ~23-26) and the click calls at lines ~28, 35, 39, 43 (`groups.nth(N).locator('summary').click()` → `groups.nth(N).locator('.wu-outcome-toggle').click()`). Change line 25's expected text:

```js
  await expect(groups.nth(2).locator('summary')).toContainText('Work');
```

to:

```js
  await expect(groups.nth(2).locator('.wu-outcome-toggle')).toContainText('Tools');
```

and rename the test title to match: `'global navigation is organized by Write / Create / Tools / Learn outcomes'`.

In the `'outcome navigation keeps established route owners and active category state'` test, replace:

```js
    await expect(page.locator(`[data-wu-nav-group="${group}"] > summary`)).toHaveClass(/is-active/);
```

with:

```js
    await expect(page.locator(`[data-wu-nav-group="${group}"] > .wu-outcome-toggle`)).toHaveClass(/is-active/);
```

In the `'language switch re-renders the outcome categories and compact footer in Urdu'` test, replace all four `[data-wu-nav-group="X"] > summary` locators with `[data-wu-nav-group="X"] > .wu-outcome-toggle`, and change:

```js
  await expect(page.locator('[data-wu-nav-group="work"] > summary')).toContainText('کام');
```

to:

```js
  await expect(page.locator('[data-wu-nav-group="work"] > .wu-outcome-toggle')).toContainText('ٹولز');
```

- [ ] **Step 2: Update the stale selector in `tests/v3-visual-quality.spec.js`**

Replace (around line 61):

```js
    const navItem = document.querySelector('.wu-primary-nav > a:not(.is-active), .wu-nav-more > summary:not(.is-active), .wu-primary-nav > a');
```

with:

```js
    const navItem = document.querySelector('.wu-primary-nav > a:not(.is-active), .wu-nav-more > .wu-outcome-toggle:not(.is-active), .wu-primary-nav > a');
```

- [ ] **Step 3: Run the full outcome-navigation Playwright file**

Run: `npx playwright test outcome-navigation.spec.js`
Expected: PASS — all 7 tests (5 original + 2 added in Tasks 3-4) green.

- [ ] **Step 4: Run the visual-quality Playwright file**

Run: `npx playwright test v3-visual-quality.spec.js`
Expected: PASS (no regressions from the selector edit — it was already tolerant of the selector not matching).

- [ ] **Step 5: Commit**

```bash
git add tests/outcome-navigation.spec.js tests/v3-visual-quality.spec.js
git commit -m "$(cat <<'EOF'
Update nav Playwright tests for the button-based mega-menu markup

summary locators and the literal "Work"/"کام" text are replaced with
.wu-outcome-toggle and "Tools"/"ٹولز" to match the redesigned markup
and the Task 1 label rename.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Full regression pass and live verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full contract test suite**

Run: `npm test`
Expected: PASS, no regressions in any of the other contract tests listed in `scripts/run-contract-tests.js`.

- [ ] **Step 2: Run the full Playwright suite**

Run: `npm run test:browser`
Expected: PASS across both the `desktop-chromium` and `mobile-chromium` projects.

- [ ] **Step 3: Manual live check on the dev server**

Run: `npm start`, open `http://127.0.0.1:8765/` in a real browser and check by hand:
- Each of Write / Create / Tools / Learn opens with a smooth fade/slide-in, shows its own gradient preview card with correct headline/caption/CTA link.
- Opening a second group closes the first; Escape closes the open group; clicking elsewhere on the page closes it.
- Switch to Urdu via the language toggle: labels, headlines, captions, and the CTA text ("شروع کریں") all appear correctly, and (since `html[dir="rtl"]` and `.wu-primary-nav{direction:rtl}` apply) the preview card visually sits on the correct side without any layout break.
- Resize below 1366px and below 560px: preview card disappears, link list still works as the existing mobile accordion.
- `prefers-reduced-motion: reduce` (browser/OS setting): panels open/close without animation, no stuck-open panels.

Stop the dev server when done.

- [ ] **Step 4: Push the branch**

```bash
git push -u origin feature/nav-mega-menu
```

(Do not open a PR without checking with the user first — this step only pushes the branch for visibility/CI.)
