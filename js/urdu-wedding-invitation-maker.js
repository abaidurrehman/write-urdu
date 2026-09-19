(function () {
    'use strict';

    var core = window.WriteUrduWeddingCore;
    var wording = window.WriteUrduWeddingWording;
    var templateSelector = window.WriteUrduWeddingTemplateSelector;
    var storage = window.WriteUrduWeddingProjectStorage;
    if (!core || !wording || !templateSelector || !storage) return;

    var STEP_IDS = ['events', 'hosts', 'schedule_venue', 'language_wording', 'design', 'preview_export'];
    var EVENT_LABELS = { nikah: 'Nikah', mehndi: 'Mehndi', mayun: 'Mayun', dholki: 'Dholki', baraat: 'Baraat', rukhsati: 'Rukhsati', walima: 'Walima', engagement: 'Engagement', custom: 'Custom' };

    var project = storage.loadDraft() || core.createDefaultWeddingProject();
    var currentStepIndex = 0;

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

    function renderStepRail(steps) {
        var rail = document.querySelector('[data-wedding-step-rail]');
        if (!rail) return;
        STEP_IDS.forEach(function (stepId, index) {
            var tab = rail.querySelector('[data-wedding-step-tab="' + stepId + '"]');
            if (!tab) return;
            tab.setAttribute('data-wedding-step-status', steps[index].status);
            tab.onclick = function () {
                if (steps[index].status === 'blocked') return;
                currentStepIndex = index;
                renderCurrentStep();
            };
        });
    }

    function showPanel(stepId) {
        STEP_IDS.forEach(function (id) {
            var panel = document.querySelector('[data-wedding-step-panel="' + id + '"]');
            if (panel) panel.hidden = id !== stepId;
        });
    }

    function renderEventsStep() {
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

    function renderFamiliesStep() {
        var personAInput = document.querySelector('[data-wedding-couple-person-a]');
        if (personAInput) {
            personAInput.value = project.couple.personA.displayName;
            personAInput.oninput = function () {
                project.couple.personA.displayName = personAInput.value;
                save();
                renderStepRail(core.evaluateComposerSteps(project));
            };
        }
        var personBInput = document.querySelector('[data-wedding-couple-person-b]');
        if (personBInput) {
            personBInput.value = project.couple.personB.displayName;
            personBInput.oninput = function () {
                project.couple.personB.displayName = personBInput.value;
                save();
                renderStepRail(core.evaluateComposerSteps(project));
            };
        }
        var list = document.querySelector('[data-wedding-families-list]');
        if (!list) return;
        list.innerHTML = '';
        project.families.forEach(function (family, index) {
            var input = el('input', { value: family.displayName, placeholder: 'Family name' });
            input.oninput = function () {
                project.families[index].displayName = input.value;
                save();
                renderStepRail(core.evaluateComposerSteps(project));
            };
            list.appendChild(el('div', {}, [input]));
        });
    }

    function addFamily() {
        project.families.push(core.normalizeWeddingProject({ families: [{ role: 'both' }] }).families[0]);
        save();
        refreshAll();
    }

    function renderScheduleStep() {
        var list = document.querySelector('[data-wedding-schedule-list]');
        if (!list) return;
        list.innerHTML = '';
        project.events.forEach(function (event, index) {
            var dateInput = el('input', { type: 'date', value: event.date || '' });
            dateInput.onchange = function () {
                project.events[index].date = dateInput.value;
                save();
                renderStepRail(core.evaluateComposerSteps(project));
            };
            list.appendChild(el('div', {}, [el('label', { text: EVENT_LABELS[event.type] || event.type }), dateInput]));
        });
    }

    function renderWordingStep() {
        var languageSelect = document.querySelector('[data-wedding-invitation-language]');
        if (languageSelect) {
            languageSelect.value = project.invitationLanguage;
            languageSelect.onchange = function () {
                project.invitationLanguage = languageSelect.value;
                save();
                refreshAll();
            };
        }
        var list = document.querySelector('[data-wedding-wording-list]');
        if (!list) return;
        list.innerHTML = '';
        project.events.forEach(function (event, index) {
            var container = el('div', {});
            container.appendChild(el('h3', { text: EVENT_LABELS[event.type] || event.type }));

            var toneSelect = el('select', {});
            templateSelector.WORDING_TONES.forEach(function (tone) {
                var option = el('option', { value: tone, text: tone });
                if (event.wordingTone === tone) option.setAttribute('selected', 'selected');
                toneSelect.appendChild(option);
            });
            toneSelect.onchange = function () {
                project.events[index].wordingTone = toneSelect.value;
                save();
                renderWordingStep();
            };
            container.appendChild(toneSelect);

            var templateId = templateSelector.selectTemplate(project, event);
            var rendered = wording.renderWording(templateId, project, event);
            var textArea = el('textarea', {});
            textArea.value = event.wordingOverride ? event.wordingOverride.text : (rendered.complete ? rendered.text : '');
            container.appendChild(textArea);

            if (event.wordingOverride && core.isWordingStale(event.wordingOverride, project, event)) {
                container.appendChild(el('p', { text: 'Wording may be outdated — regenerate?' }));
                var regenerateButton = el('button', { type: 'button', text: 'Regenerate' });
                regenerateButton.onclick = function () {
                    project.events[index].wordingOverride = null;
                    save();
                    renderWordingStep();
                };
                container.appendChild(regenerateButton);
            }

            var saveOverrideButton = el('button', { type: 'button', text: 'Save wording' });
            saveOverrideButton.onclick = function () {
                var wrapped = event.wordingOverride || core.wrapWordingResult(rendered, templateId, project, event);
                if (!wrapped) return;
                project.events[index].wordingOverride = core.applyWordingOverride(wrapped, textArea.value);
                save();
                renderWordingStep();
            };
            container.appendChild(saveOverrideButton);

            list.appendChild(container);
        });
    }

    function renderDesignStep() {
        var list = document.querySelector('[data-wedding-design-list]');
        if (!list) return;
        list.innerHTML = '';
        project.events.forEach(function (event, index) {
            var container = el('div', {});
            container.appendChild(el('h3', { text: EVENT_LABELS[event.type] || event.type }));

            var suggestions = templateSelector.suggestBackgroundCategory(project, event);
            if (!suggestions.length) {
                container.appendChild(el('div', { 'class': 'wedding-design-option wedding-design-fallback' }));
                container.appendChild(el('p', { text: 'No matching design yet for this event type.' }));
            } else {
                suggestions.forEach(function (variantId) {
                    var variant = templateSelector.getBackgroundVariant(variantId);
                    var option = el('button', { type: 'button', 'class': 'wedding-design-option', style: 'background-image:url(' + variant.src + ')' });
                    option.setAttribute('aria-pressed', String(event.selectedBackgroundId === variantId));
                    option.onclick = function () {
                        project.events[index].selectedBackgroundId = variantId;
                        save();
                        renderDesignStep();
                    };
                    container.appendChild(option);
                });
            }
            list.appendChild(container);
        });
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

    function renderPreviewStep() {
        var list = document.querySelector('[data-wedding-preview-list]');
        if (!list) return;
        list.innerHTML = '';
        project.events.forEach(function (event, index) {
            var templateId = templateSelector.selectTemplate(project, event);
            var rendered = wording.renderWording(templateId, project, event);
            var text = event.wordingOverride ? event.wordingOverride.text : (rendered.complete ? rendered.text : '');

            var backgroundId = templateSelector.resolveEventBackground(project, event);
            var variant = backgroundId ? templateSelector.getBackgroundVariant(backgroundId) : null;

            var textEl = el('div', { 'class': 'wedding-preview-text', text: text });
            var cardEl = el('div', { 'class': 'wedding-preview-card' }, [textEl]);
            applyPreviewCardStyle(cardEl, textEl, variant);

            var downloadButton = el('button', { type: 'button', text: 'Download image' });
            downloadButton.onclick = function () {
                window.html2canvas(cardEl, { backgroundColor: '#ffffff', scale: 2, useCORS: true, logging: false }).then(function (canvas) {
                    var link = document.createElement('a');
                    link.download = (event.type || 'event') + '-invitation.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                });
            };

            list.appendChild(el('div', {}, [cardEl, downloadButton]));
        });
    }

    var STEP_RENDERERS = {
        events: renderEventsStep,
        hosts: renderFamiliesStep,
        schedule_venue: renderScheduleStep,
        language_wording: renderWordingStep,
        design: renderDesignStep,
        preview_export: renderPreviewStep
    };

    function renderCurrentStep() {
        var stepId = STEP_IDS[currentStepIndex];
        showPanel(stepId);
        STEP_RENDERERS[stepId]();
        renderStepRail(core.evaluateComposerSteps(project));
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
            if (currentStepIndex < STEP_IDS.length - 1) currentStepIndex += 1;
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
