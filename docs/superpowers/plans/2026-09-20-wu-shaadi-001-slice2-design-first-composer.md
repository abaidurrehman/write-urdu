# WU-SHAADI-001 Slice 2 — Design-First Composer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the `/urdu-wedding-invitation-maker` composer from a data-first 6-step wizard into a design-first flow: shared intro (couple/family/language/events) → per-event card pick → per-event edit-with-live-preview → review/export.

**Architecture:** `js/wedding-project-core.js`'s `evaluateComposerSteps` changes from a fixed 6-item step list to a dynamic list derived from `project.events` (`intro`, one `design_<eventId>`/`edit_<eventId>` pair per event, `review_export`). No `WeddingProject` schema changes. `js/urdu-wedding-invitation-maker.js` is rewritten to render one of four panel *types* (`intro`/`design`/`edit`/`review_export`) based on the current dynamic step, reusing a single extracted `renderInvitationPreview` helper for both the new live-preview pane and the final review step.

**Tech Stack:** Vanilla JS (UMD modules, no framework), flat HTML page, page-scoped CSS, Node `assert`-based contract tests, Playwright for browser tests — all matching this repo's existing conventions (see `urdu-bill-generator` precedent).

**Spec:** docs/superpowers/specs/2026-09-20-wu-shaadi-001-slice2-design-first-composer.md

## Global Constraints

- No `WeddingProject` schema changes — `normalizeEvent`, `normalizeWeddingProject`, `selectedBackgroundId`, `wordingOverride` etc. stay exactly as they are today.
- No route/registry/sitemap/`_redirects`/governance changes — same URL (`/urdu-wedding-invitation-maker`), same file set, `node scripts/check-product-governance.js` must report the same counts as before this slice.
- No `wedding-project-storage.js` changes.
- No Card Studio / `wedding-invitation-render-adapter.js` involvement (this page has never used them — Slice 1's Amendment 1 established plain DOM/CSS rendering, exported via html2canvas).
- `npm test` (all Node contract tests) and the full Playwright suite (`npm run test:browser`, no spec filter) must stay green before any push to `main`.
- Live preview updates must be debounced 200ms so typing does not re-render on every keystroke.
- Follow `skills/wu-shaadi-001/SKILL.md` slice discipline: `WeddingProject` remains the source of truth; no guest/couple names in URLs or telemetry; browser-local persistence only.

---

## Task 1: Dynamic per-event step model in `wedding-project-core.js`

**Files:**
- Modify: `js/wedding-project-core.js:360-406` (`stepCheck` and `evaluateComposerSteps`)
- Test: `tests/wedding-project-core.test.js:147-169` (existing `evaluateComposerSteps` block — replace it)

**Interfaces:**
- Consumes: `normalizeWeddingProject` (existing, unchanged), `hasMeaningfulText` (existing, unchanged), `INVITATION_LANGUAGES` (existing, unchanged).
- Produces: `core.evaluateComposerSteps(rawProject, options)` — **signature change** (new optional second parameter). `options.suggestBackgroundCategory` is an optional `function (project, event) -> string[]` (the real one lives in `js/wedding-template-selector.js` and is injected by the caller at DOM-wiring time — `wedding-project-core.js` never `require`s the template selector, keeping the existing one-way dependency direction). When omitted, every event's design step is treated as immediately satisfied (never blocks). Returns an array of step objects: `{ step: string, status: 'complete'|'current'|'blocked'|'available', missingFields: string[], eventId?: string }` in this exact order: `intro`, then for each event in `project.events` order — `design_<event.id>` (has `eventId`), `edit_<event.id>` (has `eventId`) — then `review_export` (status `'available'` or `'blocked'`, never `'complete'`, matching the existing convention for the terminal step).

- [ ] **Step 1: Write the failing test for the new dynamic shape**

Replace the entire "Slice 1: evaluateComposerSteps" block (`tests/wedding-project-core.test.js:147-169`) with:

```js
// --- Slice 2: evaluateComposerSteps is now dynamic, one design/edit pair per event ---
const emptyProject = core.createDefaultWeddingProject(new Date('2026-09-18T00:00:00Z'));
const emptySteps = core.evaluateComposerSteps(emptyProject);
assert.deepEqual(emptySteps.map((step) => step.step), ['intro', 'review_export'], 'A project with zero events has only intro and review_export steps');
assert.equal(emptySteps[0].status, 'current', 'intro must be current when nothing is filled in yet');
assert.deepEqual(emptySteps[0].missingFields.sort(), ['couple.personA.displayName', 'couple.personB.displayName', 'events', 'families'].sort());
assert.equal(emptySteps[1].status, 'blocked', 'review_export must be blocked while intro is incomplete');

const oneEventProject = core.normalizeWeddingProject({
  invitationLanguage: 'urdu',
  couple: { personA: { displayName: 'Ali' }, personB: { displayName: 'Sara' } },
  families: [{ id: 'fam-1', role: 'both', displayName: 'The Khan Family' }],
  events: [{ id: 'evt-nikah', type: 'nikah', date: '2026-12-05' }]
});
const oneEventSteps = core.evaluateComposerSteps(oneEventProject);
assert.deepEqual(oneEventSteps.map((step) => step.step), ['intro', 'design_evt-nikah', 'edit_evt-nikah', 'review_export']);
assert.equal(oneEventSteps[0].status, 'complete', 'intro is complete once couple/family/events/language are filled');
assert.equal(oneEventSteps[1].status, 'complete', 'design step with no injected suggester never blocks');
assert.equal(oneEventSteps[1].eventId, 'evt-nikah');
assert.equal(oneEventSteps[2].status, 'complete', 'edit step is complete once the event has a date');
assert.equal(oneEventSteps[2].eventId, 'evt-nikah');
assert.equal(oneEventSteps[3].step, 'review_export');
assert.equal(oneEventSteps[3].status, 'available');

const twoEventProject = core.normalizeWeddingProject({
  invitationLanguage: 'urdu',
  couple: { personA: { displayName: 'Ali' }, personB: { displayName: 'Sara' } },
  families: [{ id: 'fam-1', role: 'both', displayName: 'The Khan Family' }],
  events: [
    { id: 'evt-mehndi', type: 'mehndi', date: '2026-12-01' },
    { id: 'evt-walima', type: 'walima', date: '' }
  ]
});
const twoEventSteps = core.evaluateComposerSteps(twoEventProject);
assert.deepEqual(
  twoEventSteps.map((step) => step.step),
  ['intro', 'design_evt-mehndi', 'edit_evt-mehndi', 'design_evt-walima', 'edit_evt-walima', 'review_export'],
  'Steps must be generated in project.events order, one design/edit pair per event'
);
assert.equal(twoEventSteps[2].status, 'complete', 'Mehndi has a date, so its edit step is complete');
assert.equal(twoEventSteps[3].status, 'complete', 'Walima design step must remain reachable even though Walima has no date yet');
assert.equal(twoEventSteps[4].status, 'current', 'Walima edit step is current: it is missing a date');
assert.deepEqual(twoEventSteps[4].missingFields, ['events[].date']);
assert.equal(twoEventSteps[5].step, 'review_export');
assert.equal(twoEventSteps[5].status, 'blocked', 'review_export is blocked while Walima has no date');

// A suggestBackgroundCategory injected via options can force a design step to block
// until the caller explicitly picks a background — but only when a real suggestion exists.
const suggestingOptions = {
  suggestBackgroundCategory: function (project, event) {
    return event.type === 'mehndi' ? ['riwaayat-mehndi-yellow'] : [];
  }
};
const suggestedSteps = core.evaluateComposerSteps(twoEventProject, suggestingOptions);
assert.equal(suggestedSteps[1].status, 'current', 'Mehndi design step blocks when a suggestion exists and none is picked yet');
assert.deepEqual(suggestedSteps[1].missingFields, ['selectedBackgroundId']);
assert.equal(suggestedSteps[2].status, 'blocked', 'Everything after a blocking design step must be blocked');
assert.equal(suggestedSteps[3].status, 'blocked');

const pickedBackgroundProject = core.normalizeWeddingProject({
  invitationLanguage: 'urdu',
  couple: { personA: { displayName: 'Ali' }, personB: { displayName: 'Sara' } },
  families: [{ id: 'fam-1', role: 'both', displayName: 'The Khan Family' }],
  events: [{ id: 'evt-mehndi', type: 'mehndi', date: '2026-12-01', selectedBackgroundId: 'riwaayat-mehndi-yellow' }]
});
const pickedSteps = core.evaluateComposerSteps(pickedBackgroundProject, suggestingOptions);
assert.equal(pickedSteps[1].status, 'complete', 'An explicit selectedBackgroundId satisfies the design step even when suggestions exist');

// An event type with zero design suggestions (e.g. rukhsati) must never be blocked on
// selectedBackgroundId — the fallback card is treated as already "chosen".
const noSuggestionsProject = core.normalizeWeddingProject({
  invitationLanguage: 'urdu',
  couple: { personA: { displayName: 'Ali' }, personB: { displayName: 'Sara' } },
  families: [{ id: 'fam-1', role: 'both', displayName: 'The Khan Family' }],
  events: [{ id: 'evt-rukhsati', type: 'rukhsati', date: '2026-12-06' }]
});
const noSuggestionsSteps = core.evaluateComposerSteps(noSuggestionsProject, suggestingOptions);
assert.equal(noSuggestionsSteps[1].status, 'complete', 'No matching design suggestions must never hard-block progress');
assert.deepEqual(noSuggestionsSteps[1].missingFields, []);
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/wedding-project-core.test.js`
Expected: `TypeError` or `AssertionError` — `evaluateComposerSteps` still returns the old fixed 6-item shape (`events`, `hosts`, `schedule_venue`, `language_wording`, `design`, `preview_export`), so the `assert.deepEqual(... , ['intro', 'review_export'])` line fails immediately.

- [ ] **Step 3: Replace `stepCheck` and `evaluateComposerSteps` with the dynamic implementation**

In `js/wedding-project-core.js`, replace lines 360-406 (the existing `stepCheck` function through the end of `evaluateComposerSteps`) with:

```js
    function buildDynamicStepChecks(project, options) {
        var opts = options && typeof options === 'object' ? options : {};
        var suggestBackgroundCategory = typeof opts.suggestBackgroundCategory === 'function'
            ? opts.suggestBackgroundCategory
            : function () { return []; };

        var introMissing = [];
        if (!project.events.length) introMissing.push('events');
        if (!project.families.length) introMissing.push('families');
        if (!hasMeaningfulText(project.couple.personA.displayName)) introMissing.push('couple.personA.displayName');
        if (!hasMeaningfulText(project.couple.personB.displayName)) introMissing.push('couple.personB.displayName');
        if (INVITATION_LANGUAGES.indexOf(project.invitationLanguage) < 0) introMissing.push('invitationLanguage');

        var checks = [{ step: 'intro', missingFields: introMissing }];

        project.events.forEach(function (event) {
            var designMissing = [];
            if (!event.selectedBackgroundId && suggestBackgroundCategory(project, event).length > 0) {
                designMissing.push('selectedBackgroundId');
            }
            checks.push({ step: 'design_' + event.id, eventId: event.id, missingFields: designMissing });

            var editMissing = hasMeaningfulText(event.date) ? [] : ['events[].date'];
            checks.push({ step: 'edit_' + event.id, eventId: event.id, missingFields: editMissing });
        });

        return checks;
    }

    function evaluateComposerSteps(rawProject, options) {
        var project = normalizeWeddingProject(rawProject);
        var blocked = false;
        var checks = buildDynamicStepChecks(project, options);
        var steps = checks.map(function (check) {
            var status;
            if (blocked) {
                status = 'blocked';
            } else if (check.missingFields.length) {
                status = 'current';
                blocked = true;
            } else {
                status = 'complete';
            }
            var stepObj = { step: check.step, status: status, missingFields: check.missingFields };
            if (check.eventId) stepObj.eventId = check.eventId;
            return stepObj;
        });

        steps.push({
            step: 'review_export',
            status: blocked ? 'blocked' : 'available',
            missingFields: []
        });

        return steps;
    }
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node tests/wedding-project-core.test.js`
Expected: `Wedding project core tests passed (20 fixtures).` (or however many fixtures the corpus has) with no assertion errors.

- [ ] **Step 5: Run the full Node test suite to check for regressions**

Run: `npm test`
Expected: all existing suites pass — nothing else in the repo calls `evaluateComposerSteps` or `stepCheck` (verified: only `js/urdu-wedding-invitation-maker.js` and this test file reference it, and the wiring file is updated in Task 2).

- [ ] **Step 6: Commit**

```bash
git add js/wedding-project-core.js tests/wedding-project-core.test.js
git commit -m "$(cat <<'EOF'
Make composer step evaluation dynamic, one pair per event

evaluateComposerSteps now derives intro/design_<id>/edit_<id>/review_export
from project.events instead of a fixed 6-step list, so the wizard can
become design-first (pick a card per event, then fill its details) in
the next task without touching WeddingProject's schema.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Design-first composer UI (HTML + CSS + JS rewrite)

**Files:**
- Modify: `urdu-wedding-invitation-maker.html` (step-rail + panel markup)
- Modify: `css/urdu-wedding-invitation-maker.css` (new edit-layout styles)
- Modify: `js/urdu-wedding-invitation-maker.js` (full DOM-wiring rewrite)
- Test: `tests/urdu-wedding-invitation-maker.spec.js` (full rewrite)

**Interfaces:**
- Consumes: `core.evaluateComposerSteps(project, { suggestBackgroundCategory })` from Task 1 — array of `{step, status, missingFields, eventId?}` with dynamic `intro`/`design_<id>`/`edit_<id>`/`review_export` ids. `templateSelector.suggestBackgroundCategory(project, event)`, `templateSelector.selectTemplate`, `templateSelector.getBackgroundVariant`, `templateSelector.resolveEventBackground`, `templateSelector.WORDING_TONES` (all existing, unchanged, from `js/wedding-template-selector.js`). `wording.renderWording(templateId, project, event)` (existing, unchanged). `core.wrapWordingResult`, `core.applyWordingOverride`, `core.isWordingStale`, `core.firstStrongDirection` (all existing, unchanged).
- Produces: `renderInvitationPreview(sourceProject, event, containerEl, overrideText)` — the extracted, reusable per-event card-render function. Builds a `.wedding-preview-card` element (with `.wedding-preview-text` child) inside `containerEl`, replacing any previous content, and returns the created card element. When `overrideText` (a string) is passed, it is shown verbatim instead of the event's saved/rendered wording — this is what makes the live-preview pane update as the user types, before they click "Save wording".

- [ ] **Step 1: Replace the step-rail and panel markup in `urdu-wedding-invitation-maker.html`**

Replace lines 41-93 (from `<ol class="wedding-step-rail" ...>` through the closing `</section>` of the `preview_export` panel) with:

```html
        <ol class="wedding-step-rail" data-wedding-step-rail></ol>

        <section data-wedding-step-panel="intro" hidden>
            <h2>Tell us about your wedding</h2>
            <label>Person A
                <input type="text" data-wedding-couple-person-a placeholder="Person A's name">
            </label>
            <label>Person B
                <input type="text" data-wedding-couple-person-b placeholder="Person B's name">
            </label>
            <div data-wedding-families-list></div>
            <button type="button" data-wedding-add-family>Add family</button>
            <label>Invitation language
                <select data-wedding-invitation-language>
                    <option value="urdu">اردو</option>
                    <option value="english">English</option>
                    <option value="bilingual">Bilingual</option>
                </select>
            </label>
            <h3>Which events are you inviting guests to?</h3>
            <div data-wedding-events-list></div>
            <button type="button" data-wedding-add-event>Add event</button>
        </section>

        <section data-wedding-step-panel="design" hidden>
            <h2 data-wedding-design-heading>Choose a design</h2>
            <div data-wedding-design-list></div>
        </section>

        <section data-wedding-step-panel="edit" hidden>
            <h2 data-wedding-edit-heading>Event details</h2>
            <div class="wedding-edit-layout">
                <div class="wedding-edit-fields" data-wedding-edit-fields></div>
                <div class="wedding-edit-preview" data-wedding-edit-preview></div>
            </div>
        </section>

        <section data-wedding-step-panel="review_export" hidden>
            <h2>Preview and download</h2>
            <div data-wedding-preview-list></div>
        </section>
```

The step rail's `<li>` elements are no longer hardcoded — Task 2 Step 6's JS builds them fresh from the dynamic step list on every render, since the number of steps now varies with `project.events.length`.

- [ ] **Step 2: Add edit-layout styles to `css/urdu-wedding-invitation-maker.css`**

Append after the existing `[data-wedding-next-hint]` rule (after line 166):

```css
.wedding-edit-layout {
    display: flex;
    flex-wrap: wrap;
    gap: var(--wu-space-5, 1.5rem);
    align-items: flex-start;
}

.wedding-edit-fields {
    flex: 1 1 320px;
    min-width: 280px;
}

.wedding-edit-preview {
    flex: 1 1 280px;
    min-width: 240px;
    max-width: 360px;
}

@media (max-width: 700px) {
    .wedding-edit-layout {
        flex-direction: column;
    }

    .wedding-edit-preview {
        max-width: 100%;
    }
}
```

- [ ] **Step 3: Run the existing Playwright spec to confirm it now fails (red state expected)**

Run: `npx playwright test tests/urdu-wedding-invitation-maker.spec.js --project=chromium`
Expected: FAIL — the old spec references `data-wedding-step-panel="events"`, `data-wedding-step-panel="hosts"` etc., which no longer exist after Step 1's markup change. This confirms the markup change took effect; the spec itself is rewritten in Step 8.

- [ ] **Step 4: Rewrite `js/urdu-wedding-invitation-maker.js` in full**

Replace the entire file with:

```js
(function () {
    'use strict';

    var core = window.WriteUrduWeddingCore;
    var wording = window.WriteUrduWeddingWording;
    var templateSelector = window.WriteUrduWeddingTemplateSelector;
    var storage = window.WriteUrduWeddingProjectStorage;
    if (!core || !wording || !templateSelector || !storage) return;

    var EVENT_LABELS = { nikah: 'Nikah', mehndi: 'Mehndi', mayun: 'Mayun', dholki: 'Dholki', baraat: 'Baraat', rukhsati: 'Rukhsati', walima: 'Walima', engagement: 'Engagement', custom: 'Custom' };
    var MISSING_FIELD_LABELS = {
        events: 'Add at least one event',
        families: 'Add at least one family',
        'couple.personA.displayName': "Enter Person A's name",
        'couple.personB.displayName': "Enter Person B's name",
        'events[].date': 'Set a date for this event',
        invitationLanguage: 'Choose an invitation language',
        selectedBackgroundId: 'Pick a card design'
    };
    var PREVIEW_DEBOUNCE_MS = 200;

    var project = storage.loadDraft() || core.createDefaultWeddingProject();
    var currentStepIndex = 0;
    var previewDebounceTimer = null;

    function save() {
        project = core.normalizeWeddingProject(project);
        var result = storage.saveDraft(project);
        var statusEl = document.querySelector('[data-wedding-save-status]');
        if (statusEl) statusEl.textContent = result.ok ? 'Saved to this browser.' : 'Could not save (private browsing?).';
    }

    function el(tag, attrs, children) {
        var node = document.createElement(tag);
        Object.keys(attrs || {}).forEach(function (key) {
            if (key === 'text') node.textContent = attrs[key];
            else node.setAttribute(key, attrs[key]);
        });
        (children || []).forEach(function (child) { node.appendChild(child); });
        return node;
    }

    function currentSteps() {
        return core.evaluateComposerSteps(project, { suggestBackgroundCategory: templateSelector.suggestBackgroundCategory });
    }

    function stepType(stepId) {
        if (stepId === 'intro' || stepId === 'review_export') return stepId;
        if (stepId.indexOf('design_') === 0) return 'design';
        if (stepId.indexOf('edit_') === 0) return 'edit';
        return null;
    }

    function eventIdFromStep(stepId) {
        return stepId.replace(/^(design_|edit_)/, '');
    }

    function findEventById(eventId) {
        for (var i = 0; i < project.events.length; i += 1) {
            if (project.events[i].id === eventId) return project.events[i];
        }
        return null;
    }

    function findEventIndexById(eventId) {
        for (var i = 0; i < project.events.length; i += 1) {
            if (project.events[i].id === eventId) return i;
        }
        return -1;
    }

    function stepLabel(step) {
        if (step.step === 'intro') return 'Details';
        if (step.step === 'review_export') return 'Review & export';
        var event = findEventById(step.eventId);
        var label = event ? (EVENT_LABELS[event.type] || event.type) : 'Event';
        return stepType(step.step) === 'design' ? label + ' design' : label + ' details';
    }

    function renderStepRail(steps) {
        var rail = document.querySelector('[data-wedding-step-rail]');
        if (!rail) return;
        rail.innerHTML = '';
        steps.forEach(function (step, index) {
            var tab = el('li', { text: stepLabel(step) });
            tab.setAttribute('data-wedding-step-status', step.status);
            tab.setAttribute('data-wedding-step-tab', step.step);
            tab.onclick = function () {
                if (step.status === 'blocked') return;
                currentStepIndex = index;
                renderCurrentStep();
            };
            rail.appendChild(tab);
        });
    }

    function showPanel(panelType) {
        ['intro', 'design', 'edit', 'review_export'].forEach(function (type) {
            var panel = document.querySelector('[data-wedding-step-panel="' + type + '"]');
            if (panel) panel.hidden = type !== panelType;
        });
    }

    function renderEventsList() {
        var list = document.querySelector('[data-wedding-events-list]');
        if (!list) return;
        list.innerHTML = '';
        project.events.forEach(function (event, index) {
            var select = el('select', {});
            core.EVENT_TYPES.forEach(function (type) {
                var option = el('option', { value: type, text: EVENT_LABELS[type] || type });
                if (event.type === type) option.setAttribute('selected', 'selected');
                select.appendChild(option);
            });
            select.onchange = function () {
                project.events[index].type = select.value;
                save();
                refreshAll();
            };
            list.appendChild(el('div', {}, [select]));
        });
    }

    function addEvent() {
        project.events.push(core.normalizeWeddingProject({ events: [{ type: 'nikah' }] }).events[0]);
        save();
        refreshAll();
    }

    function addFamily() {
        project.families.push(core.normalizeWeddingProject({ families: [{ role: 'both' }] }).families[0]);
        save();
        refreshAll();
    }

    function renderIntroStep() {
        var personAInput = document.querySelector('[data-wedding-couple-person-a]');
        if (personAInput) {
            personAInput.value = project.couple.personA.displayName;
            personAInput.oninput = function () {
                project.couple.personA.displayName = personAInput.value;
                save();
                refreshNavState();
            };
        }
        var personBInput = document.querySelector('[data-wedding-couple-person-b]');
        if (personBInput) {
            personBInput.value = project.couple.personB.displayName;
            personBInput.oninput = function () {
                project.couple.personB.displayName = personBInput.value;
                save();
                refreshNavState();
            };
        }
        var list = document.querySelector('[data-wedding-families-list]');
        if (list) {
            list.innerHTML = '';
            project.families.forEach(function (family, index) {
                var input = el('input', { value: family.displayName, placeholder: 'Family name' });
                input.oninput = function () {
                    project.families[index].displayName = input.value;
                    save();
                    refreshNavState();
                };
                list.appendChild(el('div', {}, [input]));
            });
        }
        var languageSelect = document.querySelector('[data-wedding-invitation-language]');
        if (languageSelect) {
            languageSelect.value = project.invitationLanguage;
            languageSelect.onchange = function () {
                project.invitationLanguage = languageSelect.value;
                save();
                refreshNavState();
            };
        }
        renderEventsList();
    }

    function renderDesignStep(eventId) {
        var heading = document.querySelector('[data-wedding-design-heading]');
        var event = findEventById(eventId);
        var eventIndex = findEventIndexById(eventId);
        if (heading) heading.textContent = 'Choose a design for ' + (event ? (EVENT_LABELS[event.type] || event.type) : 'this event');
        var list = document.querySelector('[data-wedding-design-list]');
        if (!list || !event) return;
        list.innerHTML = '';
        var suggestions = templateSelector.suggestBackgroundCategory(project, event);
        if (!suggestions.length) {
            list.appendChild(el('div', { 'class': 'wedding-design-option wedding-design-fallback' }));
            list.appendChild(el('p', { text: 'No matching design yet for this event type — a plain card will be used.' }));
        } else {
            suggestions.forEach(function (variantId) {
                var variant = templateSelector.getBackgroundVariant(variantId);
                var option = el('button', { type: 'button', 'class': 'wedding-design-option', style: 'background-image:url(' + variant.src + ')' });
                option.setAttribute('aria-pressed', String(event.selectedBackgroundId === variantId));
                option.onclick = function () {
                    project.events[eventIndex].selectedBackgroundId = variantId;
                    save();
                    refreshAll();
                };
                list.appendChild(option);
            });
        }
    }

    function applyPreviewCardStyle(cardEl, textEl, variant) {
        if (variant) {
            cardEl.classList.remove('wedding-design-fallback');
            cardEl.style.backgroundImage = 'url(' + variant.src + ')';
            textEl.style.color = variant.textColor;
            textEl.style.top = (variant.safeArea.top * 100) + '%';
            textEl.style.left = (variant.safeArea.left * 100) + '%';
            textEl.style.right = (variant.safeArea.right * 100) + '%';
            textEl.style.bottom = (variant.safeArea.bottom * 100) + '%';
        } else {
            cardEl.classList.add('wedding-design-fallback');
            cardEl.style.backgroundImage = 'none';
            textEl.style.color = '#3c3324';
            textEl.style.top = '18%';
            textEl.style.left = '16%';
            textEl.style.right = '16%';
            textEl.style.bottom = '18%';
        }
    }

    // Shared by the live-preview pane (edit step) and the review/export step - the one
    // place that builds a .wedding-preview-card. overrideText, when a string, is shown
    // verbatim instead of the event's saved/rendered wording: this is what lets the
    // preview follow the user's typing before they click "Save wording".
    function renderInvitationPreview(sourceProject, event, containerEl, overrideText) {
        containerEl.innerHTML = '';
        var templateId = templateSelector.selectTemplate(sourceProject, event);
        var rendered = wording.renderWording(templateId, sourceProject, event);
        var text = typeof overrideText === 'string'
            ? overrideText
            : (event.wordingOverride ? event.wordingOverride.text : (rendered.complete ? rendered.text : ('Missing: ' + rendered.missingFields.join(', '))));

        var backgroundId = templateSelector.resolveEventBackground(sourceProject, event);
        var variant = backgroundId ? templateSelector.getBackgroundVariant(backgroundId) : null;

        var textEl = el('div', { 'class': 'wedding-preview-text', text: text });
        var direction = core.firstStrongDirection(text);
        textEl.style.direction = direction;
        textEl.style.unicodeBidi = 'plaintext';
        textEl.style.textAlign = direction === 'rtl' ? 'right' : 'left';
        var cardEl = el('div', { 'class': 'wedding-preview-card' }, [textEl]);
        applyPreviewCardStyle(cardEl, textEl, variant);
        containerEl.appendChild(cardEl);
        return cardEl;
    }

    function schedulePreviewRefresh(eventId, overrideText) {
        if (previewDebounceTimer) clearTimeout(previewDebounceTimer);
        previewDebounceTimer = setTimeout(function () {
            var previewEl = document.querySelector('[data-wedding-edit-preview]');
            var event = findEventById(eventId);
            if (previewEl && event) renderInvitationPreview(project, event, previewEl, overrideText);
        }, PREVIEW_DEBOUNCE_MS);
    }

    function renderEditStep(eventId) {
        var heading = document.querySelector('[data-wedding-edit-heading]');
        var event = findEventById(eventId);
        var eventIndex = findEventIndexById(eventId);
        if (heading) heading.textContent = (event ? (EVENT_LABELS[event.type] || event.type) : 'Event') + ' details';
        var fields = document.querySelector('[data-wedding-edit-fields]');
        if (!fields || !event) return;
        fields.innerHTML = '';

        var dateInput = el('input', { type: 'date', value: event.date || '' });
        dateInput.onchange = function () {
            project.events[eventIndex].date = dateInput.value;
            save();
            refreshNavState();
            schedulePreviewRefresh(eventId);
        };
        fields.appendChild(el('div', {}, [el('label', { text: 'Date' }), dateInput]));

        var toneSelect = el('select', {});
        templateSelector.WORDING_TONES.forEach(function (tone) {
            var option = el('option', { value: tone, text: tone });
            if (event.wordingTone === tone) option.setAttribute('selected', 'selected');
            toneSelect.appendChild(option);
        });
        toneSelect.onchange = function () {
            project.events[eventIndex].wordingTone = toneSelect.value;
            save();
            schedulePreviewRefresh(eventId);
        };
        fields.appendChild(el('div', {}, [el('label', { text: 'Wording tone' }), toneSelect]));

        var templateId = templateSelector.selectTemplate(project, event);
        var rendered = wording.renderWording(templateId, project, event);
        if (!event.wordingOverride && !rendered.complete) {
            fields.appendChild(el('p', { text: 'Missing: ' + rendered.missingFields.join(', ') }));
        }
        var textArea = el('textarea', {});
        textArea.value = event.wordingOverride ? event.wordingOverride.text : (rendered.complete ? rendered.text : '');
        textArea.dir = core.firstStrongDirection(textArea.value);
        textArea.oninput = function () {
            textArea.dir = core.firstStrongDirection(textArea.value);
            schedulePreviewRefresh(eventId, textArea.value);
        };
        fields.appendChild(textArea);

        if (event.wordingOverride && core.isWordingStale(event.wordingOverride, project, event)) {
            fields.appendChild(el('p', { text: 'Wording may be outdated — regenerate?' }));
            var regenerateButton = el('button', { type: 'button', text: 'Regenerate' });
            regenerateButton.onclick = function () {
                project.events[eventIndex].wordingOverride = null;
                save();
                renderEditStep(eventId);
            };
            fields.appendChild(regenerateButton);
        }

        var saveOverrideButton = el('button', { type: 'button', text: 'Save wording' });
        saveOverrideButton.onclick = function () {
            var wrapped = event.wordingOverride || core.wrapWordingResult(rendered, templateId, project, event);
            if (!wrapped) {
                var statusEl = document.querySelector('[data-wedding-save-status]');
                if (statusEl) statusEl.textContent = 'Cannot save wording yet — missing: ' + rendered.missingFields.join(', ');
                return;
            }
            project.events[eventIndex].wordingOverride = core.applyWordingOverride(wrapped, textArea.value);
            save();
            renderEditStep(eventId);
        };
        fields.appendChild(saveOverrideButton);

        var previewEl = document.querySelector('[data-wedding-edit-preview]');
        if (previewEl) renderInvitationPreview(project, event, previewEl);
    }

    function renderReviewStep() {
        var list = document.querySelector('[data-wedding-preview-list]');
        if (!list) return;
        list.innerHTML = '';
        project.events.forEach(function (event) {
            var cardHolder = el('div', {});
            list.appendChild(cardHolder);
            var cardEl = renderInvitationPreview(project, event, cardHolder);

            var downloadButton = el('button', { type: 'button', text: 'Download image' });
            downloadButton.onclick = function () {
                window.html2canvas(cardEl, { backgroundColor: '#ffffff', scale: 2, useCORS: true, logging: false }).then(function (canvas) {
                    var link = document.createElement('a');
                    link.download = (event.type || 'event') + '-invitation.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                });
            };
            cardHolder.appendChild(downloadButton);
        });
    }

    function renderCurrentStep() {
        var steps = currentSteps();
        if (currentStepIndex >= steps.length) currentStepIndex = steps.length - 1;
        var step = steps[currentStepIndex];
        var type = stepType(step.step);
        showPanel(type);
        if (type === 'intro') renderIntroStep();
        else if (type === 'design') renderDesignStep(eventIdFromStep(step.step));
        else if (type === 'edit') renderEditStep(eventIdFromStep(step.step));
        else if (type === 'review_export') renderReviewStep();
        renderStepRail(steps);
        renderNextState(steps);
    }

    function refreshNavState() {
        var steps = currentSteps();
        renderStepRail(steps);
        renderNextState(steps);
    }

    function renderNextState(steps) {
        var nextButton = document.querySelector('[data-wedding-next]');
        var hintEl = document.querySelector('[data-wedding-next-hint]');
        var isLastStep = currentStepIndex >= steps.length - 1;
        var willBlock = !isLastStep && steps[currentStepIndex + 1].status === 'blocked';
        if (nextButton) nextButton.disabled = willBlock;
        if (hintEl) {
            if (willBlock) {
                var missing = steps[currentStepIndex].missingFields || [];
                hintEl.textContent = missing.length
                    ? 'Before continuing: ' + missing.map(function (field) { return MISSING_FIELD_LABELS[field] || field; }).join('; ')
                    : 'Finish this step to continue.';
            } else {
                hintEl.textContent = '';
            }
        }
    }

    function refreshAll() {
        renderCurrentStep();
    }

    function bindNav() {
        var backButton = document.querySelector('[data-wedding-back]');
        var nextButton = document.querySelector('[data-wedding-next]');
        if (backButton) backButton.onclick = function () {
            if (currentStepIndex > 0) currentStepIndex -= 1;
            renderCurrentStep();
        };
        if (nextButton) nextButton.onclick = function () {
            var steps = currentSteps();
            if (currentStepIndex < steps.length - 1) {
                if (steps[currentStepIndex + 1].status !== 'blocked') {
                    currentStepIndex += 1;
                }
            }
            renderCurrentStep();
        };
    }

    function bindAddButtons() {
        var addEventButton = document.querySelector('[data-wedding-add-event]');
        if (addEventButton) addEventButton.onclick = addEvent;
        var addFamilyButton = document.querySelector('[data-wedding-add-family]');
        if (addFamilyButton) addFamilyButton.onclick = addFamily;
    }

    function init() {
        bindNav();
        bindAddButtons();
        renderCurrentStep();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
```

- [ ] **Step 5: Run the Node test suite to confirm nothing server-side broke**

Run: `npm test`
Expected: all pass — this file is browser-only (`window.*` guard makes it a no-op under Node), so no Node test touches it directly.

- [ ] **Step 6: Manually smoke-test in a local browser**

Run: `node tests/server.js` (if not already running — check with `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8765/urdu-wedding-invitation-maker` first; a running server returns `200`), then open `http://127.0.0.1:8765/urdu-wedding-invitation-maker` in a browser and confirm: the intro step shows couple/family/language/events fields; adding an event and clicking Next reaches a card-gallery step scoped to that one event; picking a card advances to an edit step with a live preview pane that updates as you type in the wording textarea; Back/Next and the step rail all work; Review & export shows the finished card with a working "Download image" button.

- [ ] **Step 7: Rewrite `tests/urdu-wedding-invitation-maker.spec.js` in full**

Replace the entire file with:

```js
const { test, expect } = require('@playwright/test');

// html2canvas is loaded eagerly from cdnjs by urdu-wedding-invitation-maker.html (a real,
// reviewed part of the page's export flow, not something this test suite should rewrite);
// the image-download test needs it to actually load, so it is allow-listed through the
// otherwise-total external block used by every other spec in this suite.
const blockExternal = (page) => Promise.all([
  page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, (route) => route.abort()),
  page.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/html2canvas/, (route) => route.continue())
]);

async function fillIntro(page, eventType) {
  await page.fill('[data-wedding-couple-person-a]', 'Ayesha');
  await page.fill('[data-wedding-couple-person-b]', 'Bilal');
  await page.click('[data-wedding-add-family]');
  await page.fill('[data-wedding-families-list] input', 'The Khan Family');
  await page.selectOption('[data-wedding-invitation-language]', 'urdu');
  await page.click('[data-wedding-add-event]');
  await page.selectOption('[data-wedding-events-list] select', eventType);
}

test('WU-SHAADI-001 composer: design-first happy path picks a card before typing details', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-wedding-invitation-maker.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

  await fillIntro(page, 'mehndi');
  await page.click('[data-wedding-next]');

  // Design step for Mehndi: a card gallery must be visible before any date/wording field.
  await expect(page.locator('[data-wedding-step-panel="design"]')).toBeVisible();
  await expect(page.locator('[data-wedding-design-list] .wedding-design-option').first()).toBeVisible();
  await page.locator('[data-wedding-design-list] .wedding-design-option').first().click();
  await page.click('[data-wedding-next]');

  // Edit step: fields plus a live preview pane, still scoped to Mehndi.
  await expect(page.locator('[data-wedding-step-panel="edit"]')).toBeVisible();
  await expect(page.locator('[data-wedding-edit-preview] .wedding-preview-card')).toBeVisible();
  await page.fill('[data-wedding-edit-fields] input[type="date"]', '2026-12-01');
  await page.click('[data-wedding-next]');

  await expect(page.locator('[data-wedding-step-panel="review_export"]')).toBeVisible();
  await expect(page.locator('.wedding-preview-card')).toBeVisible();
  await expect(page.locator('.wedding-preview-text')).not.toHaveText('');
});

test('WU-SHAADI-001 composer: live preview updates as the user types wording', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-wedding-invitation-maker.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

  await fillIntro(page, 'nikah');
  await page.click('[data-wedding-next]');
  await page.locator('[data-wedding-design-list] .wedding-design-option').first().click();
  await page.click('[data-wedding-next]');

  await page.fill('[data-wedding-edit-fields] input[type="date"]', '2026-12-05');
  await page.fill('[data-wedding-edit-fields] textarea', 'My own hand-typed wording');
  await expect(page.locator('[data-wedding-edit-preview] .wedding-preview-text')).toHaveText('My own hand-typed wording', { timeout: 2000 });
});

test('WU-SHAADI-001 composer: blocked steps cannot be jumped to', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-wedding-invitation-maker.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

  await fillIntro(page, 'walima');
  // Do not fill the date - the edit step (and review_export after it) must stay blocked.
  await page.click('[data-wedding-next]');
  await page.locator('[data-wedding-design-list] .wedding-design-option').first().click();
  await page.click('[data-wedding-next]');

  await expect(page.locator('[data-wedding-step-panel="edit"]')).toBeVisible();
  await expect(page.locator('[data-wedding-next]')).toBeDisabled();
  await page.click('[data-wedding-step-tab="review_export"]');
  await expect(page.locator('[data-wedding-step-panel="edit"]')).toBeVisible();
  await expect(page.locator('[data-wedding-step-panel="review_export"]')).toBeHidden();
});

test('WU-SHAADI-001 composer: wording override survives and image export produces a file', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-wedding-invitation-maker.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

  await fillIntro(page, 'nikah');
  await page.click('[data-wedding-next]');
  await page.locator('[data-wedding-design-list] .wedding-design-option').first().click();
  await page.click('[data-wedding-next]');
  await page.fill('[data-wedding-edit-fields] input[type="date"]', '2026-12-05');
  await page.fill('[data-wedding-edit-fields] textarea', 'My own hand-edited wording');
  await page.click('[data-wedding-edit-fields] button:has-text("Save wording")');
  await page.click('[data-wedding-next]');

  await expect(page.locator('.wedding-preview-text')).toHaveText('My own hand-edited wording');

  const downloadPromise = page.waitForEvent('download');
  await page.click('[data-wedding-preview-list] button:has-text("Download image")');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.png$/);
});

test('WU-SHAADI-001 composer: two events each get their own design and edit steps', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-wedding-invitation-maker.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

  await fillIntro(page, 'mehndi');
  await page.click('[data-wedding-add-event]');
  await page.selectOption('[data-wedding-events-list] select >> nth=1', 'baraat');
  await page.click('[data-wedding-next]');

  // Mehndi design -> Mehndi edit -> Baraat design -> Baraat edit -> review_export
  await expect(page.locator('[data-wedding-design-heading]')).toContainText('Mehndi');
  await page.locator('[data-wedding-design-list] .wedding-design-option').first().click();
  await page.click('[data-wedding-next]');
  await page.fill('[data-wedding-edit-fields] input[type="date"]', '2026-12-01');
  await page.click('[data-wedding-next]');

  await expect(page.locator('[data-wedding-design-heading]')).toContainText('Baraat');
  await page.locator('[data-wedding-design-list] .wedding-design-option').first().click();
  await page.click('[data-wedding-next]');
  await page.fill('[data-wedding-edit-fields] input[type="date"]', '2026-12-05');
  await page.click('[data-wedding-next]');

  await expect(page.locator('[data-wedding-step-panel="review_export"]')).toBeVisible();
  await expect(page.locator('[data-wedding-preview-list] .wedding-preview-card')).toHaveCount(2);
});

test('WU-SHAADI-001 composer: reload restores the in-progress draft', async ({ page }) => {
  await blockExternal(page);
  await page.goto('/urdu-wedding-invitation-maker.html', { waitUntil: 'domcontentloaded', timeout: 15000 });

  await page.click('[data-wedding-add-event]');
  await page.selectOption('[data-wedding-events-list] select', 'mehndi');
  await page.waitForTimeout(200); // allow the save() debounce-free write to localStorage

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-wedding-events-list] select')).toHaveValue('mehndi');
});
```

- [ ] **Step 8: Run the rewritten Playwright spec**

Run: `npx playwright test tests/urdu-wedding-invitation-maker.spec.js --project=chromium --project=mobile-chromium`
Expected: all 7 tests pass.

- [ ] **Step 9: Run the full Playwright suite for regressions**

Run: `npm run test:browser` (this exceeds a 2-minute terminal timeout in some environments — run it in the background and wait for completion rather than a shorter filtered run, since other specs' shared fixtures/nav assertions could be affected by the `write-urdu-sitemap`/nav markup, which this task does not touch, but must still be confirmed green)
Expected: all tests pass, 0 failures (matching the count from before this slice, since no new routes/pages were added).

- [ ] **Step 10: Run governance check**

Run: `node scripts/check-product-governance.js`
Expected: same registered-pages/sitemap-routes/redirect-rules counts as before this slice (this task adds no new files needing registration).

- [ ] **Step 11: Commit**

```bash
git add urdu-wedding-invitation-maker.html css/urdu-wedding-invitation-maker.css js/urdu-wedding-invitation-maker.js tests/urdu-wedding-invitation-maker.spec.js
git commit -m "$(cat <<'EOF'
Rebuild composer as design-first: pick a card, then type with live preview

Replaces the old 6-step data-first wizard (fill four steps of forms
before anything visual appears) with intro -> per-event card pick ->
per-event edit-with-live-preview -> review/export, driven by Task 1's
dynamic step model. The per-event card render logic is extracted into
renderInvitationPreview and reused by both the live-preview pane and
the final review step - no new rendering technology, same DOM/CSS
approach this page has always used.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review Notes (for whoever executes this plan)

- **Spec coverage:** §1 (dynamic step model) → Task 1. §2 (intro/design/edit/review UI) → Task 2 Steps 1, 4. §3 (shared preview helper) → Task 2 Step 4 (`renderInvitationPreview`). §4 (persistence/existing drafts) → no code change needed, covered by Task 2 Step 6's manual smoke test and the reload test in Step 7. §5 (error handling) → the "no design suggestions never blocks" behavior is tested in Task 1 Step 1's `noSuggestionsSteps` assertion, and the debounced-preview-keeps-last-good-render behavior falls out naturally from `renderInvitationPreview` never throwing on a fallback-complete `renderWording` result.
- **Live-typing-to-preview** (the user's original ask) is the `overrideText` parameter on `renderInvitationPreview`, wired through `textArea.oninput` → `schedulePreviewRefresh(eventId, textArea.value)`. This is the one piece of behavior that has no precedent in the Slice 1 code — flagged here so the task reviewer checks it specifically.
- **Type consistency:** `evaluateComposerSteps(project, options)` (Task 1) and `core.evaluateComposerSteps(project, { suggestBackgroundCategory: templateSelector.suggestBackgroundCategory })` (Task 2) use matching parameter shapes. `renderInvitationPreview(sourceProject, event, containerEl, overrideText)` signature is identical everywhere it's called in Task 2 Step 4.
