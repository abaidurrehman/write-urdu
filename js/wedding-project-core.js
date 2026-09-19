(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.WriteUrduWeddingCore = factory();
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    var SCHEMA_VERSION = 1;

    var EVENT_TYPES = ['nikah', 'mehndi', 'mayun', 'dholki', 'baraat', 'rukhsati', 'walima', 'engagement', 'custom'];
    var HOST_MODES = ['bride_side', 'groom_side', 'both', 'grandparents', 'custom'];
    var PROGRAMME_LABELS = ['gathering', 'nikah', 'baraat_arrival', 'dinner', 'rukhsati', 'reception', 'custom'];
    var INVITATION_LANGUAGES = ['urdu', 'english', 'bilingual'];
    var COUPLE_DISPLAY_MODES = ['both_names', 'lineage', 'family_led', 'custom'];
    var GUEST_SCOPES = ['individual', 'couple', 'family', 'custom'];
    var SUFFIX_STYLES = ['sahib', 'sahiba', 'with_family', 'none', 'custom'];
    var RELIGIOUS_OPENING_MODES = ['none', 'verified_library', 'custom_user_text'];
    var WORDING_TONES = ['formal', 'informal', 'concise'];

    // Only the fixed, universally identical opening formula (the basmala) is seeded here.
    // reviewStatus stays 'pending_human_review' until Write Urdu's own religious-content
    // review process signs off; verified_library mode is deliberately blocked until then.
    // No other Quranic/hadith text is generated, paraphrased or invented by this module.
    var RELIGIOUS_LIBRARY = Object.freeze([
        Object.freeze({
            id: 'bismillah-standard',
            displayText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            language: 'ur',
            source: 'Standard printed Quranic basmala (opening formula of Surah Al-Fatiha).',
            reviewStatus: 'pending_human_review'
        })
    ]);

    function text(value) {
        return value === undefined || value === null ? '' : String(value);
    }

    function trimmed(value, maxLength) {
        var valueText = text(value).trim();
        return typeof maxLength === 'number' ? valueText.slice(0, maxLength) : valueText;
    }

    function enumOrFallback(value, allowed, fallback) {
        return allowed.indexOf(value) >= 0 ? value : fallback;
    }

    function randomId(prefix) {
        var random = Math.random().toString(36).slice(2, 10);
        return prefix + '-' + Date.now().toString(36) + random;
    }

    function boundedArray(value, mapper, maxLength) {
        var source = Array.isArray(value) ? value : [];
        return source.slice(0, maxLength).map(mapper);
    }

    function findLibraryEntry(libraryId, library) {
        var entries = Array.isArray(library) ? library : RELIGIOUS_LIBRARY;
        for (var i = 0; i < entries.length; i += 1) {
            if (entries[i].id === libraryId) return entries[i];
        }
        return null;
    }

    function normalizePerson(value) {
        var source = value && typeof value === 'object' ? value : {};
        return {
            displayName: trimmed(source.displayName, 120),
            parentageText: trimmed(source.parentageText, 160)
        };
    }

    function normalizeCouple(value) {
        var source = value && typeof value === 'object' ? value : {};
        return {
            personA: normalizePerson(source.personA),
            personB: normalizePerson(source.personB),
            displayMode: enumOrFallback(source.displayMode, COUPLE_DISPLAY_MODES, 'both_names'),
            customDisplayText: trimmed(source.customDisplayText, 240)
        };
    }

    function normalizeFamilyHost(value, index) {
        var source = value && typeof value === 'object' ? value : {};
        return {
            id: trimmed(source.id, 80) || randomId('host-' + index),
            role: enumOrFallback(source.role, HOST_MODES, 'custom'),
            displayName: trimmed(source.displayName, 160),
            inviterNames: boundedArray(source.inviterNames, function (name) { return trimmed(name, 120); }, 20),
            optionalWelcomeNames: boundedArray(source.optionalWelcomeNames, function (name) { return trimmed(name, 120); }, 20)
        };
    }

    function normalizeProgrammeItem(value, index) {
        var source = value && typeof value === 'object' ? value : {};
        return {
            id: trimmed(source.id, 80) || randomId('programme-' + index),
            labelType: enumOrFallback(source.labelType, PROGRAMME_LABELS, 'custom'),
            customLabel: trimmed(source.customLabel, 80),
            time: trimmed(source.time, 40)
        };
    }

    function normalizeVenue(value, index) {
        var source = value && typeof value === 'object' ? value : {};
        return {
            id: trimmed(source.id, 80) || randomId('venue-' + index),
            name: trimmed(source.name, 160),
            address: trimmed(source.address, 240),
            city: trimmed(source.city, 80),
            mapUrl: trimmed(source.mapUrl, 500),
            phoneNote: trimmed(source.phoneNote, 80)
        };
    }

    function isValidWordingOverride(value) {
        return value && typeof value === 'object' &&
            typeof value.text === 'string' &&
            typeof value.isOverridden === 'boolean' &&
            value.generatedFrom && typeof value.generatedFrom === 'object' &&
            typeof value.generatedFrom.templateId === 'string' &&
            value.generatedFrom.sourceFieldsSnapshot && typeof value.generatedFrom.sourceFieldsSnapshot === 'object';
    }

    function normalizeWordingOverride(value) {
        return isValidWordingOverride(value) ? {
            text: text(value.text),
            isOverridden: Boolean(value.isOverridden),
            generatedFrom: {
                templateId: trimmed(value.generatedFrom.templateId, 80),
                sourceFieldsSnapshot: Object.assign({}, value.generatedFrom.sourceFieldsSnapshot)
            }
        } : null;
    }

    function normalizeEvent(value, index) {
        var source = value && typeof value === 'object' ? value : {};
        var type = enumOrFallback(source.type, EVENT_TYPES, 'custom');
        return {
            id: trimmed(source.id, 80) || randomId('event-' + index),
            type: type,
            customTypeLabel: type === 'custom' ? trimmed(source.customTypeLabel, 80) : '',
            hostMode: enumOrFallback(source.hostMode, HOST_MODES, 'custom'),
            date: /^\d{4}-\d{2}-\d{2}$/.test(text(source.date)) ? source.date : '',
            timezone: trimmed(source.timezone, 60),
            programme: boundedArray(source.programme, normalizeProgrammeItem, 12),
            venueId: trimmed(source.venueId, 80),
            wordingTemplateId: trimmed(source.wordingTemplateId, 80),
            wordingTone: enumOrFallback(source.wordingTone, WORDING_TONES, 'formal'),
            customWording: trimmed(source.customWording, 2000),
            notes: trimmed(source.notes, 500),
            selectedBackgroundId: trimmed(source.selectedBackgroundId, 80) || null,
            wordingOverride: normalizeWordingOverride(source.wordingOverride)
        };
    }

    function normalizeReligiousOpening(value) {
        var source = value && typeof value === 'object' ? value : {};
        return {
            mode: enumOrFallback(source.mode, RELIGIOUS_OPENING_MODES, 'none'),
            libraryId: trimmed(source.libraryId, 80),
            customText: trimmed(source.customText, 500)
        };
    }

    function normalizeGuestHousehold(value, index) {
        var source = value && typeof value === 'object' ? value : {};
        return {
            id: trimmed(source.id, 80) || randomId('guest-' + index),
            sourceName: trimmed(source.sourceName, 160),
            displayNameUr: trimmed(source.displayNameUr, 160),
            displayNameEn: trimmed(source.displayNameEn, 160),
            preferredLanguage: enumOrFallback(source.preferredLanguage, INVITATION_LANGUAGES, 'urdu'),
            scope: enumOrFallback(source.scope, GUEST_SCOPES, 'individual'),
            suffixStyle: enumOrFallback(source.suffixStyle, SUFFIX_STYLES, 'none'),
            customSuffix: trimmed(source.customSuffix, 40),
            invitedEventIds: boundedArray(source.invitedEventIds, function (id) { return trimmed(id, 80); }, 40),
            maxPartySize: (function () {
                var parsed = Number(source.maxPartySize);
                return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
            }()),
            phoneLocalOnly: trimmed(source.phoneLocalOnly, 40),
            notesLocalOnly: trimmed(source.notesLocalOnly, 240)
        };
    }

    function createDefaultWeddingProject(date) {
        var stamp = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
        var iso = stamp.toISOString();
        return {
            schemaVersion: SCHEMA_VERSION,
            id: randomId('wedding'),
            createdAt: iso,
            updatedAt: iso,
            locale: 'ur-PK',
            invitationLanguage: 'urdu',
            couple: normalizeCouple(),
            families: [],
            religiousOpening: normalizeReligiousOpening(),
            events: [],
            venues: [],
            guests: []
        };
    }

    function normalizeWeddingProject(raw) {
        var source = raw && typeof raw === 'object' ? raw : {};
        var base = createDefaultWeddingProject();
        return {
            schemaVersion: SCHEMA_VERSION,
            id: trimmed(source.id, 80) || base.id,
            createdAt: trimmed(source.createdAt, 40) || base.createdAt,
            updatedAt: trimmed(source.updatedAt, 40) || base.updatedAt,
            locale: trimmed(source.locale, 20) || base.locale,
            invitationLanguage: enumOrFallback(source.invitationLanguage, INVITATION_LANGUAGES, 'urdu'),
            couple: normalizeCouple(source.couple),
            families: boundedArray(source.families, normalizeFamilyHost, 8),
            religiousOpening: normalizeReligiousOpening(source.religiousOpening),
            events: boundedArray(source.events, normalizeEvent, 12),
            venues: boundedArray(source.venues, normalizeVenue, 12),
            guests: boundedArray(source.guests, normalizeGuestHousehold, 2000)
        };
    }

    function hasMeaningfulText(value) {
        return trimmed(value).length > 0;
    }

    function validateReligiousOpening(opening, library) {
        var errors = [];
        var source = opening && typeof opening === 'object' ? opening : {};
        if (RELIGIOUS_OPENING_MODES.indexOf(source.mode) < 0) {
            errors.push('religiousOpening.mode:invalid');
            return errors;
        }
        if (source.mode === 'verified_library') {
            var entry = findLibraryEntry(source.libraryId, library);
            if (!entry) {
                errors.push('religiousOpening.libraryId:not-found');
            } else if (entry.reviewStatus !== 'approved') {
                errors.push('religiousOpening:unapproved_library_entry');
            }
        }
        if (source.mode === 'custom_user_text' && !hasMeaningfulText(source.customText)) {
            errors.push('religiousOpening.customText:required');
        }
        return errors;
    }

    function validateEvent(event, venueIds, index) {
        var errors = [];
        var prefix = 'events[' + index + ']';
        if (EVENT_TYPES.indexOf(event.type) < 0) errors.push(prefix + '.type:invalid');
        if (event.type === 'custom' && !hasMeaningfulText(event.customTypeLabel)) {
            errors.push(prefix + '.customTypeLabel:required');
        }
        if (event.venueId && venueIds.indexOf(event.venueId) < 0) {
            errors.push(prefix + '.venueId:unresolved');
        }
        return errors;
    }

    function validateGuestHousehold(guest, eventIds, index) {
        var errors = [];
        var prefix = 'guests[' + index + ']';
        if (!hasMeaningfulText(guest.sourceName) && !hasMeaningfulText(guest.displayNameUr) && !hasMeaningfulText(guest.displayNameEn)) {
            errors.push(prefix + '.name:required');
        }
        if (!guest.invitedEventIds.length) {
            // Empty invitedEventIds is an explicitly incomplete state, never "all events".
            errors.push(prefix + '.invitedEventIds:required');
        } else {
            guest.invitedEventIds.forEach(function (eventId, eventIndex) {
                if (eventIds.indexOf(eventId) < 0) errors.push(prefix + '.invitedEventIds[' + eventIndex + ']:unresolved');
            });
        }
        if (guest.suffixStyle === 'custom' && !hasMeaningfulText(guest.customSuffix)) {
            errors.push(prefix + '.customSuffix:required');
        }
        return errors;
    }

    function validateWeddingProject(raw, options) {
        var project = normalizeWeddingProject(raw);
        var library = options && options.religiousLibrary;
        var errors = [];

        if (!project.events.length) errors.push('events:required');

        var venueIds = project.venues.map(function (venue) { return venue.id; });
        var eventIds = project.events.map(function (event) { return event.id; });

        project.events.forEach(function (event, index) {
            errors = errors.concat(validateEvent(event, venueIds, index));
        });

        project.guests.forEach(function (guest, index) {
            errors = errors.concat(validateGuestHousehold(guest, eventIds, index));
        });

        errors = errors.concat(validateReligiousOpening(project.religiousOpening, library));

        return { valid: errors.length === 0, errors: errors };
    }

    function addresseeForGuest(guest) {
        if (hasMeaningfulText(guest.displayNameUr)) return guest.displayNameUr;
        if (hasMeaningfulText(guest.displayNameEn)) return guest.displayNameEn;
        return guest.sourceName;
    }

    function buildInvitationViewModel(project, guestId) {
        var normalizedProject = normalizeWeddingProject(project);
        var guest = guestId
            ? normalizedProject.guests.filter(function (candidate) { return candidate.id === guestId; })[0] || null
            : null;

        // Guest-specific filtering happens here, before any serialization/rendering step,
        // never merely through UI/CSS hiding of unassigned events.
        var visibleEvents = guest
            ? normalizedProject.events.filter(function (event) { return guest.invitedEventIds.indexOf(event.id) >= 0; })
            : normalizedProject.events.slice();

        var venueById = {};
        normalizedProject.venues.forEach(function (venue) { venueById[venue.id] = venue; });

        return {
            projectId: normalizedProject.id,
            guestId: guest ? guest.id : null,
            addressee: guest ? addresseeForGuest(guest) : null,
            opening: normalizedProject.religiousOpening,
            hostLine: normalizedProject.families.map(function (family) { return family.displayName; }).filter(hasMeaningfulText),
            coupleLine: normalizedProject.couple,
            events: visibleEvents.map(function (event) {
                return {
                    id: event.id,
                    type: event.type,
                    customTypeLabel: event.customTypeLabel,
                    date: event.date,
                    programme: event.programme,
                    venue: event.venueId ? venueById[event.venueId] || null : null
                };
            }),
            familyWelcome: guest ? [] : [],
            design: null,
            language: guest ? guest.preferredLanguage : normalizedProject.invitationLanguage,
            provenance: 'Write Urdu'
        };
    }

    function firstStrongDirection(value) {
        var source = text(value);
        for (var i = 0; i < source.length; i += 1) {
            var character = source.charAt(i);
            if (/[؀-ۿݐ-ݿࢠ-ࣿ]/.test(character)) return 'rtl';
            if (/[A-Za-z]/.test(character)) return 'ltr';
        }
        return 'ltr';
    }

    function stepCheck(project) {
        var hasDate = project.events.some(function (event) { return hasMeaningfulText(event.date); });
        return [
            { step: 'events', missingFields: project.events.length ? [] : ['events'] },
            { step: 'hosts', missingFields: project.families.length ? [] : ['families'] },
            { step: 'schedule_venue', missingFields: hasDate ? [] : ['events[].date'] },
            { step: 'language_wording', missingFields: INVITATION_LANGUAGES.indexOf(project.invitationLanguage) >= 0 ? [] : ['invitationLanguage'] }
        ];
    }

    function evaluateComposerSteps(rawProject) {
        var project = normalizeWeddingProject(rawProject);
        var blocked = false;
        var steps = stepCheck(project).map(function (check) {
            var status;
            if (blocked) {
                status = 'blocked';
            } else if (check.missingFields.length) {
                status = 'current';
                blocked = true;
            } else {
                status = 'complete';
            }
            return { step: check.step, status: status, missingFields: check.missingFields };
        });

        var priorComplete = !blocked;
        // Step 5 (design) is a fixed-default stub for this slice: no picker exists yet,
        // it always resolves to the same default the render adapter already uses.
        steps.push({
            step: 'design',
            status: priorComplete ? 'complete' : 'blocked',
            missingFields: [],
            designDefault: { templateId: 'classic-nastaliq', presetId: 'portrait' }
        });
        steps.push({
            step: 'preview_export',
            status: priorComplete ? 'available' : 'blocked',
            missingFields: []
        });

        return steps;
    }

    function findVenueById(project, venueId) {
        for (var i = 0; i < project.venues.length; i += 1) {
            if (project.venues[i].id === venueId) return project.venues[i];
        }
        return null;
    }

    function snapshotWordingSourceFields(project, event) {
        var normalizedProject = normalizeWeddingProject(project);
        var normalizedEvent = normalizeEvent(event, 0);
        var venue = normalizedEvent.venueId ? findVenueById(normalizedProject, normalizedEvent.venueId) : null;
        return {
            personA: normalizedProject.couple.personA.displayName,
            personB: normalizedProject.couple.personB.displayName,
            eventDate: normalizedEvent.date,
            venueName: venue ? venue.name : ''
        };
    }

    function wrapWordingResult(renderResult, templateId, project, event) {
        if (!renderResult || !renderResult.complete) return null;
        return {
            text: renderResult.text,
            isOverridden: false,
            generatedFrom: {
                templateId: templateId,
                sourceFieldsSnapshot: snapshotWordingSourceFields(project, event)
            }
        };
    }

    function applyWordingOverride(wordingResult, newText) {
        if (!wordingResult) throw new Error('Cannot override a wording result that does not exist yet');
        return {
            text: text(newText),
            isOverridden: true,
            generatedFrom: wordingResult.generatedFrom
        };
    }

    function isWordingStale(wordingResult, project, event) {
        if (!wordingResult || !wordingResult.generatedFrom) return false;
        var current = snapshotWordingSourceFields(project, event);
        var previous = wordingResult.generatedFrom.sourceFieldsSnapshot;
        return Object.keys(current).some(function (key) { return current[key] !== previous[key]; });
    }

    return {
        SCHEMA_VERSION: SCHEMA_VERSION,
        EVENT_TYPES: EVENT_TYPES,
        HOST_MODES: HOST_MODES,
        PROGRAMME_LABELS: PROGRAMME_LABELS,
        INVITATION_LANGUAGES: INVITATION_LANGUAGES,
        COUPLE_DISPLAY_MODES: COUPLE_DISPLAY_MODES,
        GUEST_SCOPES: GUEST_SCOPES,
        SUFFIX_STYLES: SUFFIX_STYLES,
        RELIGIOUS_OPENING_MODES: RELIGIOUS_OPENING_MODES,
        RELIGIOUS_LIBRARY: RELIGIOUS_LIBRARY,
        WORDING_TONES: WORDING_TONES,
        createDefaultWeddingProject: createDefaultWeddingProject,
        normalizeWeddingProject: normalizeWeddingProject,
        validateWeddingProject: validateWeddingProject,
        buildInvitationViewModel: buildInvitationViewModel,
        firstStrongDirection: firstStrongDirection,
        evaluateComposerSteps: evaluateComposerSteps,
        snapshotWordingSourceFields: snapshotWordingSourceFields,
        wrapWordingResult: wrapWordingResult,
        applyWordingOverride: applyWordingOverride,
        isWordingStale: isWordingStale
    };
}));
