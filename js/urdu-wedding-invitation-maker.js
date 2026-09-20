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
        // The edit step's live-preview pane leaves its last .wedding-preview-card in the DOM
        // when the panel is hidden (only its ancestor <section> gets [hidden]). Clear it whenever
        // the edit panel is not the active one so a stray, invisible card never coexists with the
        // review step's own card under an unscoped ".wedding-preview-card" query.
        if (panelType !== 'edit') {
            var editPreview = document.querySelector('[data-wedding-edit-preview]');
            if (editPreview) editPreview.innerHTML = '';
        }
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
            // Recompute fresh rather than closing over the templateId/rendered captured when this
            // panel was first drawn: the user may have just filled in a field (e.g. the date) that
            // was missing at that time, and a stale "incomplete" rendered result would otherwise
            // block saving even though the requirements are now met.
            var currentTemplateId = templateSelector.selectTemplate(project, event);
            var currentRendered = wording.renderWording(currentTemplateId, project, event);
            var wrapped = event.wordingOverride || core.wrapWordingResult(currentRendered, currentTemplateId, project, event);
            if (!wrapped) {
                var statusEl = document.querySelector('[data-wedding-save-status]');
                if (statusEl) statusEl.textContent = 'Cannot save wording yet — missing: ' + currentRendered.missingFields.join(', ');
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
