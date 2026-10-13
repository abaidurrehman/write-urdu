(function () {
    'use strict';

    // WU-SHAADI-001 visual invitation composer for /urdu-wedding-invitation-maker.
    //
    // The WeddingProject (js/wedding-project-core.js) is the only source of truth and is kept in
    // this browser via js/wedding-project-storage.js. This file owns DOM wiring only: picking
    // events and designs, editing details, and exporting/sharing what the shared renderer
    // (js/wedding-invitation-canvas.js) draws. Nothing typed here is sent to telemetry or put
    // in a URL.

    var core = window.WriteUrduWeddingCore;
    var storage = window.WriteUrduWeddingProjectStorage;
    var designs = window.WriteUrduWeddingDesigns;
    var layout = window.WriteUrduWeddingLayout;
    var renderer = window.WriteUrduWeddingCanvas;
    if (!core || !storage || !designs || !layout || !renderer) return;

    var STEPS = ['event', 'design', 'details', 'share'];
    var NEXT_LABEL = { event: 'Next: design', design: 'Next: details', details: 'Finish', share: 'Done' };
    var MAIN_EVENTS = ['nikah', 'mehndi', 'baraat', 'walima'];
    var MORE_EVENTS = ['mayun', 'dholki', 'engagement', 'rukhsati', 'custom'];
    var SUITE_ORDER = ['mehndi', 'nikah', 'baraat', 'walima', 'mayun', 'dholki', 'engagement', 'rukhsati'];
    var EVENT_INFO = {
        nikah: { ur: 'نکاح', label: 'Nikah', desc: 'Elegant, sacred, ivory & green' },
        mehndi: { ur: 'مہندی', label: 'Mehndi', desc: 'Marigold, music and colour' },
        baraat: { ur: 'بارات', label: 'Baraat', desc: 'Royal maroon and gold' },
        walima: { ur: 'ولیمہ', label: 'Walima', desc: 'Refined pastels and sage' },
        mayun: { ur: 'مایوں', label: 'Mayun' },
        dholki: { ur: 'ڈھولکی', label: 'Dholki' },
        engagement: { ur: 'منگنی', label: 'Engagement' },
        rukhsati: { ur: 'رخصتی', label: 'Rukhsati' },
        custom: { ur: '', label: 'Other' }
    };
    var FILTERS = [
        { id: 'recommended', label: 'Recommended' },
        { id: 'all', label: 'All' },
        { id: 'nikah', label: 'Nikah' },
        { id: 'mehndi', label: 'Mehndi' },
        { id: 'baraat', label: 'Baraat' },
        { id: 'walima', label: 'Walima' },
        { id: 'traditional', label: 'Traditional' },
        { id: 'modern', label: 'Modern' }
    ];
    var LETTERING = [
        { id: 'calligraphic', label: 'Calligraphic' },
        { id: 'classic', label: 'Classic' },
        { id: 'modern', label: 'Modern' }
    ];
    var WORDING_STYLES = [
        { id: 'traditional', label: 'Traditional' },
        { id: 'simple', label: 'Simple' },
        { id: 'modern', label: 'Modern' }
    ];
    var HOSTS = [
        { id: 'both', label: 'Both families' },
        { id: 'bride_side', label: 'Bride’s family' },
        { id: 'groom_side', label: 'Groom’s family' },
        { id: 'couple', label: 'The couple' },
        { id: 'custom', label: 'Someone else' }
    ];
    var PROGRAMME_CHOICES = ['gathering', 'nikah', 'baraat_arrival', 'dinner', 'rukhsati', 'reception'];
    var PROGRAMME_LABELS = { gathering: 'Arrival', nikah: 'Nikah', baraat_arrival: 'Baraat arrives', dinner: 'Dinner', rukhsati: 'Rukhsati', reception: 'Reception' };
    var RECOMMENDED_COUNT = 6;
    var BISMILLAH_ID = 'bismillah-standard';

    var root = document.querySelector('[data-wedding-maker]');
    if (!root) return;

    var state = {
        project: null,
        activeEventId: null,
        step: 'event',
        filter: 'recommended',
        showAll: false,
        applyAll: true,
        sizeId: 'portrait',
        busy: false
    };

    var saveTimer = null;
    var previewTimer = null;
    var thumbTimer = null;
    var thumbObserver = null;

    // ---------- project helpers ----------

    function newEvent(type) {
        return core.normalizeWeddingProject({ events: [{ type: type, hostMode: 'both', wordingTone: 'formal' }] }).events[0];
    }

    function loadProject() {
        var loaded = storage.loadDraft();
        var project = loaded || core.createDefaultWeddingProject();
        if (!project.events.length) project.events.push(newEvent('nikah'));
        return core.normalizeWeddingProject(project);
    }

    function activeEvent() {
        for (var i = 0; i < state.project.events.length; i += 1) {
            if (state.project.events[i].id === state.activeEventId) return state.project.events[i];
        }
        state.activeEventId = state.project.events[0].id;
        return state.project.events[0];
    }

    function designIdFor(event) {
        return designs.getDesign(event.selectedBackgroundId) ? event.selectedBackgroundId : designs.defaultDesignFor(event.type);
    }

    function renderOptionsFor(event, extra) {
        return Object.assign({
            project: state.project,
            eventId: event.id,
            designId: designIdFor(event),
            colorwayId: event.designColorway,
            lettering: event.lettering,
            sizeId: 'portrait',
            sample: true
        }, extra || {});
    }

    function venueFor(event, create) {
        for (var i = 0; i < state.project.venues.length; i += 1) {
            if (state.project.venues[i].id === event.venueId) return state.project.venues[i];
        }
        if (!create) return null;
        var venue = core.normalizeWeddingProject({ venues: [{}] }).venues[0];
        state.project.venues.push(venue);
        event.venueId = venue.id;
        return venue;
    }

    function family(role, create) {
        for (var i = 0; i < state.project.families.length; i += 1) {
            if (state.project.families[i].role === role) return state.project.families[i];
        }
        if (!create) return null;
        var host = core.normalizeWeddingProject({ families: [{ role: role }] }).families[0];
        state.project.families.push(host);
        return host;
    }

    function primaryProgramme(event, create) {
        if (!event.programme.length && create) {
            event.programme.push(core.normalizeWeddingProject({ events: [{ programme: [{ labelType: 'gathering' }] }] }).events[0].programme[0]);
        }
        return event.programme[0] || null;
    }

    // Persist without re-normalizing the live object graph (normalize returns new objects,
    // which would detach the references the open form is editing).
    function scheduleSave() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function () {
            state.project.updatedAt = new Date().toISOString();
            storage.saveDraft(state.project);
        }, 250);
    }

    function changed(options) {
        scheduleSave();
        schedulePreview();
        if (!options || options.thumbs !== false) scheduleThumbs();
        if (options && options.eventsBar) renderEventsBar();
    }

    // ---------- small DOM helpers ----------

    function el(tag, attrs, children) {
        var node = document.createElement(tag);
        Object.keys(attrs || {}).forEach(function (key) {
            var value = attrs[key];
            if (value === null || value === undefined || value === false) return;
            if (key === 'text') node.textContent = value;
            else if (key === 'html') node.innerHTML = value;
            else if (key === 'onclick') node.addEventListener('click', value);
            else node.setAttribute(key, value === true ? '' : value);
        });
        (children || []).forEach(function (child) {
            if (child) node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
        });
        return node;
    }

    function urSpan(value) {
        return el('span', { lang: 'ur', dir: 'rtl', text: value });
    }

    function setDirFor(input) {
        var value = input.value;
        input.dir = value ? core.firstStrongDirection(value) : (state.project.invitationLanguage === 'english' ? 'ltr' : input.getAttribute('data-wm-default-dir') || 'ltr');
    }

    function artThumbUrl(eventType, w, h) {
        var built = designs.buildArt(designs.defaultDesignFor(eventType), null, eventType, w, h);
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(built.svg);
    }

    function track(name, detail) {
        try {
            if (window.WriteUrduTelemetry && typeof window.WriteUrduTelemetry.track === 'function') window.WriteUrduTelemetry.track(name, detail || {});
        } catch (error) { /* telemetry is optional */ }
    }

    // ---------- progress / navigation ----------

    function goTo(step, options) {
        if (STEPS.indexOf(step) < 0) return;
        state.step = step;
        STEPS.forEach(function (id) {
            var panel = root.querySelector('[data-wm-step="' + id + '"]');
            if (panel) panel.hidden = id !== step;
        });
        renderProgress();
        if (step === 'event') renderEventStep();
        if (step === 'design') renderDesignStep();
        if (step === 'details') renderDetailsStep();
        if (step === 'share') renderShareStep();
        renderMobileBar();
        schedulePreview(0);
        if (!options || options.scroll !== false) {
            var top = root.getBoundingClientRect().top + window.pageYOffset - stickyHeaderHeight() - 8;
            if (window.pageYOffset > top || root.getBoundingClientRect().top > window.innerHeight * 0.5) {
                window.scrollTo({ top: top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
            }
            var heading = root.querySelector('[data-wm-step="' + step + '"] h2');
            if (heading && options && options.focus) {
                heading.setAttribute('tabindex', '-1');
                heading.focus({ preventScroll: true });
            }
        }
    }

    // The site header can be sticky; keep the progress bar clear of it when scrolling.
    function stickyHeaderHeight() {
        var header = document.querySelector('.site-header, header.wu-site-header, [data-site-header], .navbar');
        if (!header) return 0;
        var style = window.getComputedStyle(header);
        return style.position === 'sticky' || style.position === 'fixed' ? header.getBoundingClientRect().height : 0;
    }

    function prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function renderProgress() {
        var index = STEPS.indexOf(state.step);
        root.querySelectorAll('[data-wm-progress] li').forEach(function (item, i) {
            item.classList.toggle('is-done', i < index);
            item.classList.toggle('is-current', i === index);
            var button = item.querySelector('button');
            if (i === index) button.setAttribute('aria-current', 'step');
            else button.removeAttribute('aria-current');
        });
    }

    function renderMobileBar() {
        var next = root.querySelector('[data-wm-mobile-next]');
        if (!next) return;
        next.textContent = NEXT_LABEL[state.step];
        root.querySelector('[data-wm-mobile-bar]').hidden = state.step === 'share';
    }

    // ---------- events bar (multi-event suites) ----------

    function renderEventsBar() {
        var bar = root.querySelector('[data-wm-events-bar]');
        var events = state.project.events;
        bar.hidden = events.length < 2;
        bar.innerHTML = '';
        if (events.length < 2) return;
        bar.setAttribute('role', 'group');
        bar.setAttribute('aria-label', 'Your events');
        events.forEach(function (event) {
            var active = event.id === state.activeEventId;
            var chip = el('span', { 'class': 'wm-event-chip' + (active ? ' is-active' : '') });
            var dot = el('span', { 'class': 'wm-event-chip-dot', 'aria-hidden': 'true' });
            var art = designs.buildArt(designIdFor(event), event.designColorway, event.type, 60, 75);
            dot.style.backgroundImage = 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(art.svg) + '")';
            var summary = layout.eventSummary(state.project, event.id).split(' · ');
            var main = el('button', { type: 'button', 'class': 'wm-event-chip-main', 'aria-pressed': String(active), 'data-wm-event-id': event.id, onclick: function () { switchEvent(event.id); } }, [
                dot,
                el('span', { text: summary[0] }),
                summary[1] ? el('small', { text: summary[1] }) : null
            ]);
            chip.appendChild(main);
            chip.appendChild(el('button', { type: 'button', 'class': 'wm-event-chip-remove', 'aria-label': 'Remove ' + summary[0], 'data-wm-remove-event': event.id, text: '×', onclick: function () { removeEvent(event.id); } }));
            bar.appendChild(chip);
        });
        bar.appendChild(el('button', { type: 'button', 'class': 'wm-events-add', 'data-wm-add-event': true, text: '+ Add event', onclick: addEvent }));
    }

    function switchEvent(eventId) {
        state.activeEventId = eventId;
        renderEventsBar();
        goTo(state.step, { scroll: false });
        scheduleThumbs(0);
    }

    function addEvent() {
        var used = state.project.events.map(function (event) { return event.type; });
        var type = SUITE_ORDER.filter(function (candidate) { return used.indexOf(candidate) < 0; })[0] || 'custom';
        var event = newEvent(type);
        var current = activeEvent();
        // A new event joins the current suite: same design, its own event colours.
        if (state.applyAll && current.selectedBackgroundId) event.selectedBackgroundId = current.selectedBackgroundId;
        event.lettering = current.lettering;
        event.wordingTone = current.wordingTone;
        state.project.events.push(event);
        state.activeEventId = event.id;
        changed({ eventsBar: true });
        renderEventsBar();
        goTo('event', { scroll: false });
        var status = root.querySelector('[data-wm-events-bar]');
        if (status) status.querySelector('.is-active button').focus();
    }

    function removeEvent(eventId) {
        if (state.project.events.length < 2) return;
        state.project.events = state.project.events.filter(function (event) { return event.id !== eventId; });
        if (state.activeEventId === eventId) state.activeEventId = state.project.events[0].id;
        changed({ eventsBar: true });
        renderEventsBar();
        goTo(state.step, { scroll: false });
    }

    // ---------- step 1: event ----------

    function setEventType(type) {
        var event = activeEvent();
        if (event.type === type) return;
        event.type = type;
        event.customTypeLabel = type === 'custom' ? event.customTypeLabel : '';
        // Colours follow the new event unless the user picked them for this card.
        event.designColorway = '';
        state.filter = 'recommended';
        changed({ eventsBar: true });
        renderEventsBar();
        renderEventStep();
    }

    function renderEventStep() {
        var event = activeEvent();
        var tiles = root.querySelector('[data-wm-event-tiles]');
        if (!tiles.childElementCount) {
            MAIN_EVENTS.forEach(function (type) {
                var info = EVENT_INFO[type];
                var tile = el('button', { type: 'button', role: 'radio', 'class': 'wm-event-tile', 'data-wm-event-type': type, 'aria-label': info.label + ' — ' + info.desc }, [
                    el('span', { 'class': 'wm-tick', 'aria-hidden': 'true', text: '✓' }),
                    el('span', { 'class': 'wm-event-tile-label' }, [
                        el('strong', {}, [el('span', { text: info.label }), urSpan(info.ur)]),
                        el('span', { 'class': 'wm-event-tile-desc', text: info.desc })
                    ])
                ]);
                tile.style.backgroundImage = 'url("' + artThumbUrl(type, 400, 500) + '")';
                tile.addEventListener('click', function () { setEventType(type); });
                tiles.appendChild(tile);
            });
            var more = root.querySelector('[data-wm-more-events]');
            more.setAttribute('role', 'radiogroup');
            more.setAttribute('aria-label', 'More ceremonies');
            MORE_EVENTS.forEach(function (type) {
                var info = EVENT_INFO[type];
                more.appendChild(el('button', { type: 'button', role: 'radio', 'class': 'wm-chip', 'data-wm-event-type': type, onclick: function () { setEventType(type); } }, [
                    info.label, info.ur ? urSpan(info.ur) : null
                ]));
            });
            var custom = root.querySelector('[data-wm-field="customTypeLabel"]');
            bindText(custom, function () { return activeEvent().customTypeLabel; }, function (value) { activeEvent().customTypeLabel = value; }, { eventsBar: true });
        }
        root.querySelectorAll('[data-wm-event-type]').forEach(function (button) {
            var checked = button.getAttribute('data-wm-event-type') === event.type;
            button.setAttribute('aria-checked', String(checked));
            button.tabIndex = checked ? 0 : -1;
        });
        var customWrap = root.querySelector('[data-wm-custom-event]');
        customWrap.hidden = event.type !== 'custom';
        var customInput = root.querySelector('[data-wm-field="customTypeLabel"]');
        if (document.activeElement !== customInput) customInput.value = event.customTypeLabel;
    }

    // ---------- step 2: design ----------

    function visibleDesigns() {
        var event = activeEvent();
        var list = designs.filterDesigns(state.filter, event.type);
        if (state.filter === 'recommended' && !state.showAll) list = list.slice(0, RECOMMENDED_COUNT);
        var selected = designIdFor(event);
        // Keep the current choice visible even when a filter would hide it.
        if (!list.some(function (design) { return design.id === selected; }) && state.filter === 'recommended') {
            list = [designs.getDesign(selected)].concat(list.slice(0, RECOMMENDED_COUNT - 1));
        }
        return list;
    }

    function chooseDesign(designId) {
        var event = activeEvent();
        var targets = state.applyAll ? state.project.events : [event];
        targets.forEach(function (target) {
            if (target.selectedBackgroundId !== designId) target.designColorway = '';
            target.selectedBackgroundId = designId;
        });
        changed({ eventsBar: true });
        renderEventsBar();
        renderDesignStep();
    }

    function renderDesignStep() {
        var event = activeEvent();
        var filters = root.querySelector('[data-wm-design-filters]');
        filters.innerHTML = '';
        FILTERS.forEach(function (filter) {
            filters.appendChild(el('button', { type: 'button', 'class': 'wm-chip', 'aria-pressed': String(state.filter === filter.id), 'data-wm-filter': filter.id, text: filter.label, onclick: function () {
                state.filter = filter.id;
                state.showAll = filter.id !== 'recommended';
                renderDesignStep();
            } }));
        });

        var grid = root.querySelector('[data-wm-design-grid]');
        var selected = designIdFor(event);
        var list = visibleDesigns();
        grid.innerHTML = '';
        if (thumbObserver) thumbObserver.disconnect();
        list.forEach(function (design) {
            var isSelected = design.id === selected;
            var best = design.bestFor.slice(0, 2).map(function (type) { return EVENT_INFO[type] ? EVENT_INFO[type].label : type; }).join(' & ');
            var canvas = el('canvas', { width: 432, height: 540, 'aria-hidden': 'true', 'data-wm-thumb': design.id });
            var tile = el('button', { type: 'button', 'class': 'wm-design-tile', 'aria-pressed': String(isSelected), 'data-wm-design': design.id, 'aria-label': design.name + ', best for ' + best + (isSelected ? ', selected' : '') }, [
                el('span', { 'class': 'wm-design-thumb' }, [canvas, el('span', { 'class': 'wm-tick', 'aria-hidden': 'true', text: '✓' })]),
                el('span', { 'class': 'wm-design-name' }, [el('strong', { text: design.name }), el('span', { text: 'Best for ' + best })])
            ]);
            tile.addEventListener('click', function () { chooseDesign(design.id); });
            grid.appendChild(tile);
        });
        observeThumbs();

        var seeAll = root.querySelector('[data-wm-see-all]');
        seeAll.hidden = state.filter !== 'recommended' || state.showAll;
        seeAll.textContent = 'See all ' + designs.DESIGNS.length + ' designs';

        var design = designs.getDesign(selected);
        var swatches = root.querySelector('[data-wm-colorways]');
        swatches.innerHTML = '';
        var activeColorway = designs.getColorway(design, event.designColorway, event.type).id;
        design.colorways.forEach(function (colorway) {
            var checked = colorway.id === activeColorway;
            swatches.appendChild(el('button', { type: 'button', role: 'radio', 'class': 'wm-swatch', 'aria-checked': String(checked), 'data-wm-colorway': colorway.id, onclick: function () {
                activeEvent().designColorway = colorway.id;
                changed({ eventsBar: true, thumbs: true });
                renderEventsBar();
                renderDesignStep();
            } }, [
                el('span', { 'class': 'wm-swatch-dots', 'aria-hidden': 'true' }, colorway.swatch.map(function (colour) {
                    var dot = el('i');
                    dot.style.background = colour;
                    return dot;
                })),
                colorway.name
            ]));
        });

        var lettering = root.querySelector('[data-wm-lettering]');
        lettering.innerHTML = '';
        var activeLettering = event.lettering || design.lettering;
        LETTERING.forEach(function (option) {
            lettering.appendChild(el('button', { type: 'button', role: 'radio', 'aria-checked': String(option.id === activeLettering), 'data-wm-lettering-option': option.id, text: option.label, onclick: function () {
                var targets = state.applyAll ? state.project.events : [activeEvent()];
                targets.forEach(function (target) { target.lettering = option.id; });
                changed();
                renderDesignStep();
            } }));
        });

        var applyWrap = root.querySelector('[data-wm-apply-all-wrap]');
        applyWrap.hidden = state.project.events.length < 2;
        root.querySelector('[data-wm-apply-all]').checked = state.applyAll;
    }

    function observeThumbs() {
        var canvases = root.querySelectorAll('[data-wm-thumb]');
        if (!('IntersectionObserver' in window)) {
            canvases.forEach(drawThumb);
            return;
        }
        thumbObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                entry.target.__wmVisible = entry.isIntersecting;
                if (entry.isIntersecting && !entry.target.__wmDrawnFor) drawThumb(entry.target);
            });
        }, { rootMargin: '200px 0px' });
        canvases.forEach(function (canvas) { thumbObserver.observe(canvas); });
    }

    function drawThumb(canvas) {
        var event = activeEvent();
        var designId = canvas.getAttribute('data-wm-thumb');
        var selected = designIdFor(event) === designId;
        var options = renderOptionsFor(event, {
            designId: designId,
            colorwayId: selected ? event.designColorway : '',
            lettering: selected ? event.lettering : ''
        });
        canvas.__wmDrawnFor = JSON.stringify([state.project.updatedAt, designId, event.id]);
        renderer.renderInvitation(canvas, options);
    }

    function scheduleThumbs(delay) {
        if (state.step !== 'design') return;
        clearTimeout(thumbTimer);
        thumbTimer = setTimeout(function () {
            root.querySelectorAll('[data-wm-thumb]').forEach(function (canvas) {
                canvas.__wmDrawnFor = null;
                if (canvas.__wmVisible !== false) drawThumb(canvas);
            });
        }, delay === undefined ? 450 : delay);
    }

    // ---------- step 3: details ----------

    function bindText(input, read, write, options) {
        input.value = read() || '';
        setDirFor(input);
        var handler = function () {
            if (input.value === (read() || '')) return;
            write(input.value);
            setDirFor(input);
            changed(options);
        };
        // Google's English→Urdu control rewrites the value on space without always firing
        // `input`, so listen for keyup/change as well.
        // The converted word lands a moment after the key event, so re-check shortly after.
        var settle = null;
        input.addEventListener('input', handler);
        input.addEventListener('keyup', function () {
            handler();
            clearTimeout(settle);
            settle = setTimeout(function () { handler(); settle = setTimeout(handler, 900); }, 350);
        });
        input.addEventListener('change', handler);
        input.addEventListener('blur', handler);
    }

    function field(label, attrs, read, write, options) {
        var input = el(attrs.multiline ? 'textarea' : 'input', Object.assign({ type: attrs.multiline ? null : (attrs.type || 'text') }, attrs.input || {}));
        if (attrs.urdu) input.setAttribute('data-wm-urdu-input', '');
        var wrapper = el('label', { 'class': 'wm-field' }, [el('span', { text: label }), input, attrs.hint ? el('small', { text: attrs.hint }) : null]);
        if (attrs.type === 'date' || attrs.type === 'time') {
            input.value = read() || '';
            input.addEventListener('change', function () { write(input.value); changed(options); });
            input.addEventListener('input', function () { write(input.value); changed(options); });
        } else {
            bindText(input, read, write, options);
        }
        return wrapper;
    }

    function segmented(options, current, onPick, attrName, labelText) {
        var group = el('div', { 'class': 'wm-segmented', role: 'radiogroup', 'aria-label': labelText });
        options.forEach(function (option) {
            var button = el('button', { type: 'button', role: 'radio', 'aria-checked': String(option.id === current), onclick: function () {
                onPick(option.id);
                group.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-checked', String(b === button)); });
            } }, option.ur ? [urSpan(option.ur)] : [option.label]);
            button.setAttribute(attrName, option.id);
            group.appendChild(button);
        });
        return group;
    }

    function fieldset(legend, note, children) {
        return el('fieldset', { 'class': 'wm-fieldset' }, [el('legend', { text: legend }), note ? el('p', { 'class': 'wm-fieldset-note', text: note }) : null].concat(children));
    }

    function renderDetailsStep() {
        var event = activeEvent();
        var project = state.project;
        var lang = project.invitationLanguage;
        var host = root.querySelector('[data-wm-details]');
        var openMore = host.querySelector('details.wm-more') && host.querySelector('details.wm-more').open;
        host.innerHTML = '';
        var eventName = layout.eventShortName(event);
        var multi = project.events.length > 1;
        var namePlaceholder = function (who) {
            return lang === 'english' ? (who === 'bride' ? 'e.g. Ayesha' : 'e.g. Ahmed') : (who === 'bride' ? 'مثلاً عائشہ' : 'مثلاً احمد');
        };

        var languageRow = el('div', { 'class': 'wm-language-row' }, [
            segmented([
                { id: 'urdu', label: 'Urdu', ur: 'اردو' },
                { id: 'english', label: 'English' },
                { id: 'bilingual', label: 'اردو + English' }
            ], lang, function (value) {
                project.invitationLanguage = value;
                changed();
                renderDetailsStep();
            }, 'data-wm-language', 'Invitation language')
        ]);
        // The bilingual option label mixes scripts; render it as text so both read naturally.
        var bilingual = languageRow.querySelector('[data-wm-language="bilingual"]');
        if (bilingual) { bilingual.textContent = ''; bilingual.appendChild(urSpan('اردو')); bilingual.appendChild(document.createTextNode(' + English')); }
        var urduInput = null;
        if (lang !== 'english') {
            urduInput = el('div', {
                'class': 'input-mode-control',
                'data-input-mode-control': true,
                'data-input-mode-storage': 'wedding',
                'data-input-mode-default': 'direct',
                'data-input-mode-targets': '[data-wm-urdu-input]',
                role: 'group',
                'aria-label': 'Input mode'
            }, [
                el('span', { 'class': 'input-mode-title', 'data-input-mode-title': true, text: 'Input mode' }),
                el('button', { type: 'button', 'class': 'input-mode-option', 'data-input-mode-option': 'roman', 'aria-pressed': 'false', text: 'English letters → Urdu' }),
                el('button', { type: 'button', 'class': 'input-mode-option', 'data-input-mode-option': 'direct', 'aria-pressed': 'true', text: 'Type Urdu directly' }),
                el('span', { 'class': 'input-mode-note', 'data-input-mode-note': true })
            ]);
        }
        host.appendChild(fieldset('Card language', null, [languageRow, urduInput]));

        var defaultDir = lang === 'english' ? 'ltr' : 'rtl';
        var couple = fieldset('The couple', multi ? 'Shared by all your cards.' : null, [el('div', { 'class': 'wm-grid-2' }, [
            field('Bride’s name', { urdu: true, input: { 'data-wm-field': 'bride', maxlength: 120, placeholder: namePlaceholder('bride'), autocomplete: 'off', 'data-wm-default-dir': defaultDir } },
                function () { return project.couple.personA.displayName; }, function (v) { project.couple.personA.displayName = v; }),
            field('Groom’s name', { urdu: true, input: { 'data-wm-field': 'groom', maxlength: 120, placeholder: namePlaceholder('groom'), autocomplete: 'off', 'data-wm-default-dir': defaultDir } },
                function () { return project.couple.personB.displayName; }, function (v) { project.couple.personB.displayName = v; })
        ])]);
        host.appendChild(couple);

        var programme = primaryProgramme(event, false);
        var when = fieldset('When' + (multi ? ' — ' + eventName : ''), null, [el('div', { 'class': 'wm-grid-2' }, [
            field('Date', { type: 'date', input: { 'data-wm-field': 'date' } }, function () { return event.date; }, function (v) { event.date = /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : ''; }, { eventsBar: true }),
            field('Time', { type: 'time', input: { 'data-wm-field': 'time' } }, function () { return programme ? programme.time : ''; }, function (v) { primaryProgramme(event, true).time = v; })
        ])]);
        host.appendChild(when);

        var venue = venueFor(event, false);
        var where = fieldset('Where' + (multi ? ' — ' + eventName : ''), null, [el('div', { 'class': 'wm-grid-2' }, [
            field('Venue', { urdu: true, input: { 'data-wm-field': 'venue', maxlength: 160, placeholder: lang === 'urdu' ? 'مثلاً پرل گارڈن' : 'e.g. Pearl Garden', 'data-wm-default-dir': lang === 'urdu' ? 'rtl' : 'ltr' } },
                function () { return venue ? venue.name : ''; }, function (v) { venueFor(event, true).name = v; venue = venueFor(event, false); }),
            field('City or address', { urdu: true, input: { 'data-wm-field': 'address', maxlength: 240, placeholder: lang === 'urdu' ? 'مثلاً لاہور' : 'e.g. Gulberg, Lahore', 'data-wm-default-dir': lang === 'urdu' ? 'rtl' : 'ltr' } },
                function () { return venue ? venue.address : ''; }, function (v) { venueFor(event, true).address = v; venue = venueFor(event, false); })
        ])]);
        host.appendChild(where);

        // ---- optional details ----
        var more = el('details', { 'class': 'wm-more', 'data-wm-more': true });
        if (openMore) more.open = true;
        more.appendChild(el('summary', {}, [el('span', {}, ['Add more details', el('small', { text: 'Family names, wording style, extra times, RSVP, map…' })])]));
        var body = el('div', { 'class': 'wm-more-body' });

        var wordingChildren = [];
        if (core.approvedLibraryEntry(BISMILLAH_ID)) {
            var bismillah = el('input', { type: 'checkbox', 'data-wm-field': 'bismillah' });
            bismillah.checked = project.religiousOpening.mode === 'verified_library' && project.religiousOpening.libraryId === BISMILLAH_ID;
            bismillah.addEventListener('change', function () {
                project.religiousOpening = bismillah.checked ? { mode: 'verified_library', libraryId: BISMILLAH_ID, customText: '' } : { mode: 'none', libraryId: '', customText: '' };
                changed();
            });
            wordingChildren.push(el('label', { 'class': 'wm-check' }, [bismillah, el('span', {}, [urSpan('بسم اللہ شامل کریں'), ' · Include Bismillah'])]));
        }
        wordingChildren.push(el('div', { 'class': 'wm-personalise-row' }, [
            el('span', { 'class': 'wm-personalise-label', text: 'Style' }),
            segmented(WORDING_STYLES, layout.STYLE_FOR_TONE[event.wordingTone], function (value) {
                event.wordingTone = layout.TONE_FOR_STYLE[value];
                changed();
                var invite = host.querySelector('[data-wm-field="invite"]');
                if (invite) invite.placeholder = generatedInvite(event);
            }, 'data-wm-style', 'Wording style')
        ]));
        wordingChildren.push(field('Invitation line', { urdu: true, multiline: true, hint: 'Leave empty to use the wording style above.', input: { 'data-wm-field': 'invite', maxlength: 300, placeholder: generatedInvite(event), rows: 2 } },
            function () { return event.customWording; }, function (v) { event.customWording = v; }));
        body.appendChild(fieldset('Wording' + (multi ? ' — ' + eventName : ''), null, wordingChildren));

        var hostChoices = segmented(HOSTS, event.hostMode === 'grandparents' ? 'custom' : event.hostMode, function (value) {
            event.hostMode = value;
            changed();
            renderDetailsStep();
        }, 'data-wm-host', 'Who is inviting');
        var familyFields = [];
        if (event.hostMode === 'bride_side' || event.hostMode === 'both') {
            familyFields.push(field('Bride’s family', { urdu: true, input: { 'data-wm-field': 'brideFamily', maxlength: 160, placeholder: lang === 'english' ? 'e.g. Mr & Mrs Tariq Khan' : 'مثلاً جناب و بیگم طارق خان' } },
                function () { var f = family('bride_side'); return f ? f.displayName : ''; }, function (v) { family('bride_side', true).displayName = v; }));
        }
        if (event.hostMode === 'groom_side' || event.hostMode === 'both') {
            familyFields.push(field('Groom’s family', { urdu: true, input: { 'data-wm-field': 'groomFamily', maxlength: 160, placeholder: lang === 'english' ? 'e.g. Mr & Mrs Imran Ali' : 'مثلاً جناب و بیگم عمران علی' } },
                function () { var f = family('groom_side'); return f ? f.displayName : ''; }, function (v) { family('groom_side', true).displayName = v; }));
        }
        if (event.hostMode === 'custom' || event.hostMode === 'grandparents') {
            familyFields.push(field('Invited by', { urdu: true, input: { 'data-wm-field': 'customHost', maxlength: 160 } },
                function () { var f = family('custom'); return f ? f.displayName : ''; }, function (v) { family('custom', true).displayName = v; }));
        }
        body.appendChild(fieldset('Who is inviting?' + (multi ? ' — ' + eventName : ''), 'Shown at the bottom of the card, e.g. “Hosted by …” / “منجانب …”.', [hostChoices, familyFields.length ? el('div', { 'class': 'wm-grid-2', style: 'margin-top:.75rem' }, familyFields) : null]));

        body.appendChild(fieldset('Parents’ names', 'Optional. Shown under each name exactly as you type it, e.g. “d/o Mr Tariq Khan” or “بنتِ جناب طارق خان”.', [el('div', { 'class': 'wm-grid-2' }, [
            field('Under the bride’s name', { urdu: true, input: { 'data-wm-field': 'brideParents', maxlength: 160 } }, function () { return project.couple.personA.parentageText; }, function (v) { project.couple.personA.parentageText = v; }),
            field('Under the groom’s name', { urdu: true, input: { 'data-wm-field': 'groomParents', maxlength: 160 } }, function () { return project.couple.personB.parentageText; }, function (v) { project.couple.personB.parentageText = v; })
        ])]));

        var programmeRows = el('div', {});
        function drawProgramme() {
            programmeRows.innerHTML = '';
            event.programme.forEach(function (item, index) {
                var select = el('select', { 'data-wm-programme-label': index, 'aria-label': 'What happens' });
                PROGRAMME_CHOICES.forEach(function (choice) {
                    var option = el('option', { value: choice, text: PROGRAMME_LABELS[choice] });
                    if ((item.labelType === 'custom' ? 'gathering' : item.labelType) === choice) option.selected = true;
                    select.appendChild(option);
                });
                select.addEventListener('change', function () { item.labelType = select.value; changed(); });
                var time = el('input', { type: 'time', value: item.time, 'aria-label': 'Time', 'data-wm-programme-time': index });
                time.addEventListener('input', function () { item.time = time.value; changed(); });
                var remove = el('button', { type: 'button', 'class': 'wm-icon-btn', 'aria-label': 'Remove this time', text: '×', onclick: function () {
                    event.programme.splice(index, 1);
                    changed();
                    renderDetailsStep();
                } });
                programmeRows.appendChild(el('div', { 'class': 'wm-programme-row' }, [
                    el('label', { 'class': 'wm-field' }, [el('span', { text: index === 0 ? 'Main time' : 'Then' }), select]),
                    el('label', { 'class': 'wm-field' }, [el('span', { text: 'Time' }), time]),
                    index === 0 && event.programme.length === 1 ? el('span') : remove
                ]));
            });
        }
        drawProgramme();
        body.appendChild(fieldset('Programme' + (multi ? ' — ' + eventName : ''), 'Add times such as Nikah 7:00 PM, Dinner 9:00 PM.', [
            programmeRows,
            el('button', { type: 'button', 'class': 'wm-btn wm-btn-ghost wm-btn-sm', style: 'margin-top:.75rem', 'data-wm-add-time': true, text: '+ Add a time', onclick: function () {
                primaryProgramme(event, true);
                event.programme.push(core.normalizeWeddingProject({ events: [{ programme: [{ labelType: 'dinner' }] }] }).events[0].programme[0]);
                changed();
                renderDetailsStep();
                var details = host.querySelector('details.wm-more');
                if (details) details.open = true;
            } })
        ]));

        body.appendChild(fieldset('Extras' + (multi ? ' — ' + eventName : ''), null, [el('div', { 'class': 'wm-grid-2' }, [
            field('RSVP / contact', { urdu: true, input: { 'data-wm-field': 'rsvp', maxlength: 160, placeholder: 'e.g. Tariq 0300 1234567' } }, function () { return event.rsvpText; }, function (v) { event.rsvpText = v; }),
            field('Dress code', { urdu: true, input: { 'data-wm-field': 'dressCode', maxlength: 120, placeholder: 'e.g. Yellow & green' } }, function () { return event.dressCode; }, function (v) { event.dressCode = v; })
        ]), el('div', { style: 'margin-top:.75rem' }, [
            field('Special note', { urdu: true, input: { 'data-wm-field': 'notes', maxlength: 200, placeholder: 'e.g. Dinner will be served at 9 PM' } }, function () { return event.notes; }, function (v) { event.notes = v; })
        ])]));

        var qrToggle = el('input', { type: 'checkbox', 'data-wm-field': 'showMapQr' });
        qrToggle.checked = event.showMapQr;
        qrToggle.addEventListener('change', function () {
            event.showMapQr = qrToggle.checked;
            if (qrToggle.checked) ensureQrLibrary().then(function () { schedulePreview(0); });
            changed();
        });
        body.appendChild(fieldset('Location' + (multi ? ' — ' + eventName : ''), null, [
            field('Google Maps link', { type: 'url', input: { 'data-wm-field': 'mapUrl', maxlength: 500, placeholder: 'https://maps.app.goo.gl/…', inputmode: 'url', dir: 'ltr' } },
                function () { var v = venueFor(event, false); return v ? v.mapUrl : ''; }, function (v) { venueFor(event, true).mapUrl = v.trim(); }),
            el('label', { 'class': 'wm-check', style: 'margin-top:.75rem' }, [qrToggle, el('span', { text: 'Add a location QR code to the card' })])
        ]));

        more.appendChild(body);
        host.appendChild(more);
        if (event.showMapQr) ensureQrLibrary();
        document.dispatchEvent(new CustomEvent('write-urdu:wedding-fields-changed'));
        if (window.WriteUrduInputMode && typeof window.WriteUrduInputMode.refresh === 'function') window.WriteUrduInputMode.refresh();
    }

    function generatedInvite(event) {
        var composed = layout.composeInvitation(Object.assign({}, state.project, {
            events: state.project.events.map(function (item) { return item.id === event.id ? Object.assign({}, item, { customWording: '' }) : item; })
        }), event.id, { sample: true });
        var invite = composed.blocks.filter(function (item) { return item.role === 'invite'; })[0];
        return invite ? invite.text : '';
    }

    var qrPromise = null;
    function ensureQrLibrary() {
        if (window.QRCode) return Promise.resolve();
        if (!qrPromise) {
            qrPromise = new Promise(function (resolve) {
                var script = document.createElement('script');
                script.src = '/js/vendor/qrcode.js';
                script.onload = resolve;
                script.onerror = resolve;
                document.head.appendChild(script);
            });
        }
        return qrPromise;
    }

    // ---------- live preview ----------

    function schedulePreview(delay) {
        clearTimeout(previewTimer);
        previewTimer = setTimeout(renderPreviews, delay === undefined ? 120 : delay);
    }

    function renderPreviews() {
        var event = activeEvent();
        var exportLike = state.step === 'share';
        var options = renderOptionsFor(event, { sample: !exportLike });
        var main = root.querySelector('[data-wm-preview-canvas]');
        var mini = root.querySelector('[data-wm-mini-canvas]');
        var share = root.querySelector('[data-wm-share-card] canvas');
        var lightbox = document.querySelector('[data-wm-lightbox]');
        var targets = [];
        if (main && main.offsetParent !== null) targets.push(main);
        if (mini && mini.offsetParent !== null) targets.push(mini);
        if (share && share.offsetParent !== null) targets.push(share);
        if (lightbox && lightbox.open) targets.push(document.querySelector('[data-wm-lightbox-canvas]'));
        targets.forEach(function (canvas) {
            renderer.renderInvitation(canvas, options).then(function (result) {
                if (!result || canvas !== main) return;
                var note = root.querySelector('[data-wm-sample-note]');
                note.hidden = !result.composed.usedSample;
            });
        });
        if (!targets.length || targets.indexOf(main) < 0) {
            var composed = layout.composeInvitation(state.project, event.id, { sample: true });
            root.querySelector('[data-wm-sample-note]').hidden = !composed.usedSample;
        }
    }

    function openLightbox() {
        var dialog = document.querySelector('[data-wm-lightbox]');
        if (!dialog) return;
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
        var canvas = dialog.querySelector('canvas');
        var size = renderer.SIZES[state.step === 'share' ? state.sizeId : 'portrait'];
        canvas.width = size.w;
        canvas.height = size.h;
        renderer.renderInvitation(canvas, renderOptionsFor(activeEvent(), { sample: state.step !== 'share', sizeId: size.id }));
    }

    function closeLightbox() {
        var dialog = document.querySelector('[data-wm-lightbox]');
        if (!dialog) return;
        if (typeof dialog.close === 'function' && dialog.open) dialog.close();
        else dialog.removeAttribute('open');
    }

    // ---------- step 4: share ----------

    function friendlyMissing(missing) {
        var labels = { bride: 'bride’s name', groom: 'groom’s name', date: 'date', venue: 'venue' };
        return missing.map(function (key) { return labels[key]; }).filter(Boolean);
    }

    function renderShareStep() {
        var event = activeEvent();
        var composed = layout.composeInvitation(state.project, event.id, { sample: false });
        var missing = friendlyMissing(composed.missing);
        var note = root.querySelector('[data-wm-missing]');
        note.hidden = !missing.length;
        if (missing.length) {
            note.innerHTML = '';
            note.appendChild(document.createTextNode('Not added yet: ' + missing.join(', ') + '. These lines are left off your card. '));
            note.appendChild(el('button', { type: 'button', 'class': 'wm-link', text: 'Add details', onclick: function () { goTo('details', { focus: true }); } }));
        }
        var cardHolder = root.querySelector('[data-wm-share-card]');
        var size = renderer.SIZES[state.sizeId];
        var canvas = cardHolder.querySelector('canvas');
        if (!canvas) {
            canvas = el('canvas', { role: 'img', 'aria-label': 'Your finished invitation' });
            cardHolder.appendChild(canvas);
        }
        canvas.width = Math.round(size.w / 2);
        canvas.height = Math.round(size.h / 2);
        cardHolder.style.aspectRatio = size.w + ' / ' + size.h;
        var frame = root.querySelector('.wm-preview-frame');
        if (frame) frame.style.aspectRatio = size.w + ' / ' + size.h;
        var main = root.querySelector('[data-wm-preview-canvas]');
        main.width = size.w;
        main.height = size.h;

        var sizes = root.querySelector('[data-wm-sizes]');
        sizes.innerHTML = '';
        Object.keys(renderer.SIZES).forEach(function (id) {
            var option = renderer.SIZES[id];
            sizes.appendChild(el('button', { type: 'button', role: 'radio', 'aria-checked': String(id === state.sizeId), 'data-wm-size': id, onclick: function () {
                state.sizeId = id;
                renderShareStep();
                schedulePreview(0);
            } }, [option.label, el('small', { text: option.note })]));
        });
        root.querySelector('[data-wm-download-all]').hidden = state.project.events.length < 2;
    }

    function fileName(event, sizeId) {
        var base = (event.type === 'custom' ? 'celebration' : event.type) + '-invitation';
        return base + (sizeId === 'portrait' ? '' : '-' + sizeId) + '.png';
    }

    function setStatus(message) {
        var status = root.querySelector('[data-wm-share-status]');
        if (status) status.textContent = message;
    }

    function exportEvent(event, sizeId) {
        return renderer.exportBlob(renderOptionsFor(event, { sizeId: sizeId, sample: false }), 'image/png');
    }

    function downloadBlob(blob, name) {
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    }

    function withBusy(button, work) {
        if (state.busy) return Promise.resolve();
        state.busy = true;
        button.disabled = true;
        return work().catch(function () {
            setStatus('Sorry — the image could not be created. Please try again.');
            track('export_error', { format: 'png', error_category: 'render_failed', success: false });
        }).then(function () {
            state.busy = false;
            button.disabled = false;
        });
    }

    function download(button) {
        var event = activeEvent();
        track('export_started', { format: 'png' });
        return withBusy(button, function () {
            return exportEvent(event, state.sizeId).then(function (out) {
                downloadBlob(out.blob, fileName(event, state.sizeId));
                setStatus('Saved ' + fileName(event, state.sizeId) + ' to your device.');
                track('export_completed', { format: 'png', success: true });
            });
        });
    }

    function downloadAll(button) {
        track('export_started', { format: 'png' });
        return withBusy(button, function () {
            var chain = Promise.resolve();
            state.project.events.forEach(function (event) {
                chain = chain.then(function () {
                    return exportEvent(event, state.sizeId).then(function (out) {
                        downloadBlob(out.blob, fileName(event, state.sizeId));
                        return new Promise(function (resolve) { setTimeout(resolve, 350); });
                    });
                });
            });
            return chain.then(function () {
                setStatus('Saved ' + state.project.events.length + ' invitations to your device.');
                track('export_completed', { format: 'png', success: true });
            });
        });
    }

    function shareWhatsApp(button) {
        var event = activeEvent();
        track('share_clicked', { format: 'png' });
        return withBusy(button, function () {
            return exportEvent(event, state.sizeId).then(function (out) {
                var file = null;
                try { file = new File([out.blob], fileName(event, state.sizeId), { type: 'image/png' }); } catch (error) { file = null; }
                if (file && navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
                    return navigator.share({ files: [file], title: layout.eventShortName(event) + ' invitation' }).then(function () {
                        setStatus('Shared. Mubarak ho!');
                        track('share_completed', { format: 'png', success: true });
                    }).catch(function (error) {
                        if (error && error.name === 'AbortError') { setStatus(''); return; }
                        throw error;
                    });
                }
                // No file sharing here (most desktops): save the card and point to WhatsApp.
                downloadBlob(out.blob, fileName(event, state.sizeId));
                var status = root.querySelector('[data-wm-share-status]');
                status.textContent = 'Card saved to your device. Open WhatsApp and attach it from your downloads. ';
                status.appendChild(el('a', { href: 'https://web.whatsapp.com/', target: '_blank', rel: 'noopener', text: 'Open WhatsApp Web' }));
                track('share_completed', { format: 'png', success: true });
            });
        });
    }

    function printCard(button) {
        var event = activeEvent();
        track('export_started', { format: 'print' });
        return withBusy(button, function () {
            return exportEvent(event, 'print').then(function (out) {
                var sheet = document.querySelector('[data-wm-print-sheet]');
                var url = URL.createObjectURL(out.blob);
                sheet.innerHTML = '';
                var img = el('img', { src: url, alt: '' });
                sheet.appendChild(img);
                return new Promise(function (resolve) {
                    img.onload = function () {
                        document.body.classList.add('wm-printing');
                        var done = function () {
                            document.body.classList.remove('wm-printing');
                            URL.revokeObjectURL(url);
                            window.removeEventListener('afterprint', done);
                            resolve();
                        };
                        window.addEventListener('afterprint', done);
                        window.print();
                        setTimeout(done, 1500);
                        track('export_completed', { format: 'print', success: true });
                    };
                });
            });
        });
    }

    function copyWording() {
        var text = layout.invitationPlainText(state.project, activeEvent().id);
        var done = function () { setStatus('Invitation wording copied.'); track('export_completed', { format: 'clipboard', success: true }); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text); done(); });
        } else {
            fallbackCopy(text);
            done();
        }
    }

    function fallbackCopy(text) {
        var area = el('textarea', { readonly: true, style: 'position:fixed;opacity:0' });
        area.value = text;
        document.body.appendChild(area);
        area.select();
        try { document.execCommand('copy'); } catch (error) { /* ignore */ }
        area.remove();
    }

    function resetProject() {
        if (!window.confirm('Start a new invitation? Your current details will be cleared from this browser.')) return;
        storage.resetDraft();
        state.project = loadProject();
        state.activeEventId = state.project.events[0].id;
        state.filter = 'recommended';
        state.showAll = false;
        renderEventsBar();
        goTo('event', { focus: true });
    }

    // ---------- hero samples ----------

    function heroProject(language, type, names, venue, city, familyName) {
        return core.normalizeWeddingProject({
            invitationLanguage: language,
            couple: { personA: { displayName: names[0] }, personB: { displayName: names[1] } },
            families: [{ role: 'bride_side', displayName: familyName }],
            events: [{ id: 'hero', type: type, date: '2026-11-22', hostMode: 'bride_side', wordingTone: type === 'mehndi' ? 'informal' : 'formal', programme: [{ labelType: 'gathering', time: type === 'nikah' ? '19:00' : '20:00' }], venueId: 'v' }],
            venues: [{ id: 'v', name: venue, city: city }]
        });
    }

    function renderHero() {
        var samples = [
            { project: heroProject('urdu', 'nikah', ['عائشہ', 'احمد'], 'پرل گارڈن', 'لاہور', 'جناب و بیگم طارق خان'), design: 'emerald-nikah' },
            { project: heroProject('bilingual', 'mehndi', ['Ayesha', 'Ahmed'], 'Pearl Garden', 'Lahore', ''), design: 'mehndi-marigold' },
            { project: heroProject('english', 'walima', ['Sana', 'Bilal'], 'The Royal Palm', 'Karachi', 'Mr & Mrs Imran Ali'), design: 'pastel-walima' }
        ];
        document.querySelectorAll('[data-wm-hero-card]').forEach(function (canvas) {
            var sample = samples[Number(canvas.getAttribute('data-wm-hero-card'))];
            if (!sample) return;
            renderer.renderInvitation(canvas, { project: sample.project, eventId: 'hero', designId: sample.design, sizeId: 'portrait', sample: false });
        });
    }

    // ---------- wiring ----------

    function bindStatic() {
        root.querySelectorAll('[data-wm-goto]').forEach(function (button) {
            button.addEventListener('click', function () { goTo(button.getAttribute('data-wm-goto'), { focus: true }); });
        });
        document.querySelectorAll('[data-wm-lightbox] [data-wm-goto]').forEach(function (button) {
            button.addEventListener('click', function () { closeLightbox(); goTo(button.getAttribute('data-wm-goto'), { focus: true }); });
        });
        root.querySelectorAll('[data-wm-next]').forEach(function (button) {
            button.addEventListener('click', function () { goTo(button.getAttribute('data-wm-next'), { focus: true }); });
        });
        root.querySelector('[data-wm-mobile-next]').addEventListener('click', function () {
            var index = STEPS.indexOf(state.step);
            if (index < STEPS.length - 1) goTo(STEPS[index + 1], { focus: true });
        });
        root.querySelector('[data-wm-add-event]').addEventListener('click', addEvent);
        root.querySelector('[data-wm-see-all]').addEventListener('click', function () {
            state.showAll = true;
            renderDesignStep();
        });
        root.querySelector('[data-wm-apply-all]').addEventListener('change', function (eventObj) {
            state.applyAll = eventObj.target.checked;
            if (state.applyAll) chooseDesign(designIdFor(activeEvent()));
        });
        root.querySelectorAll('[data-wm-open-full]').forEach(function (button) { button.addEventListener('click', openLightbox); });
        document.querySelectorAll('[data-wm-close-full]').forEach(function (button) { button.addEventListener('click', closeLightbox); });
        var dialog = document.querySelector('[data-wm-lightbox]');
        if (dialog) dialog.addEventListener('click', function (eventObj) { if (eventObj.target === dialog) closeLightbox(); });
        root.querySelector('[data-wm-download]').addEventListener('click', function (e) { download(e.currentTarget); });
        root.querySelector('[data-wm-download-all]').addEventListener('click', function (e) { downloadAll(e.currentTarget); });
        root.querySelector('[data-wm-whatsapp]').addEventListener('click', function (e) { shareWhatsApp(e.currentTarget); });
        root.querySelector('[data-wm-print]').addEventListener('click', function (e) { printCard(e.currentTarget); });
        root.querySelector('[data-wm-copy]').addEventListener('click', copyWording);
        root.querySelector('[data-wm-reset]').addEventListener('click', resetProject);

        var start = document.querySelector('[data-wm-start]');
        if (start) start.addEventListener('click', function (e) { e.preventDefault(); goTo('event', { focus: true }); });
        var browse = document.querySelector('[data-wm-browse]');
        if (browse) browse.addEventListener('click', function (e) {
            e.preventDefault();
            state.filter = 'all';
            state.showAll = true;
            goTo('design', { focus: true });
        });

        // Arrow-key movement inside radio groups built from buttons.
        root.addEventListener('keydown', function (eventObj) {
            var key = eventObj.key;
            if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].indexOf(key) < 0) return;
            var current = eventObj.target.closest && eventObj.target.closest('[role="radio"]');
            if (!current) return;
            var group = current.closest('[role="radiogroup"]');
            if (!group) return;
            var radios = Array.prototype.slice.call(group.querySelectorAll('[role="radio"]'));
            var index = radios.indexOf(current);
            var forward = key === 'ArrowRight' || key === 'ArrowDown';
            if (document.documentElement.dir === 'rtl' && (key === 'ArrowRight' || key === 'ArrowLeft')) forward = !forward;
            var next = radios[(index + (forward ? 1 : -1) + radios.length) % radios.length];
            eventObj.preventDefault();
            next.focus();
            next.click();
        });

        window.addEventListener('resize', function () { schedulePreview(200); });
    }

    function init() {
        state.project = loadProject();
        state.activeEventId = state.project.events[0].id;
        bindStatic();
        renderEventsBar();
        goTo('event', { scroll: false });
        renderHero();
        // Fonts can finish after the first paint; redraw once they are ready.
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { schedulePreview(0); });
    }

    init();
}());
