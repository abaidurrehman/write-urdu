(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.WriteUrduWeddingWording = factory();
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    function text(value) {
        return value === undefined || value === null ? '' : String(value).trim();
    }

    function hasText(value) {
        return text(value).length > 0;
    }

    function coupleNames(project) {
        var a = text(project.couple.personA.displayName);
        var b = text(project.couple.personB.displayName);
        return { a: a, b: b, complete: hasText(a) && hasText(b) };
    }

    function eventVenue(project, event) {
        if (!event.venueId) return null;
        for (var i = 0; i < project.venues.length; i += 1) {
            if (project.venues[i].id === event.venueId) return project.venues[i];
        }
        return null;
    }

    function eventLabel(event, urdu) {
        var labels = {
            nikah: { ur: 'نکاح', en: 'Nikah' },
            mehndi: { ur: 'مہندی', en: 'Mehndi' },
            mayun: { ur: 'مایوں', en: 'Mayun' },
            dholki: { ur: 'ڈھولکی', en: 'Dholki' },
            baraat: { ur: 'بارات', en: 'Baraat' },
            rukhsati: { ur: 'رخصتی', en: 'Rukhsati' },
            walima: { ur: 'ولیمہ', en: 'Walima' },
            engagement: { ur: 'منگنی', en: 'Engagement' }
        };
        if (event.type === 'custom') return text(event.customTypeLabel);
        var entry = labels[event.type];
        if (!entry) return text(event.customTypeLabel) || event.type;
        return urdu ? entry.ur : entry.en;
    }

    // Every template is deterministic given normalized input, has no network dependency,
    // never invents a missing date/time/venue/name, and stays fully editable after render.
    var TEMPLATES = Object.freeze([
        Object.freeze({
            id: 'formal-nikah-ur',
            eventTypes: ['nikah'],
            languages: ['urdu'],
            hostModes: ['bride_side', 'groom_side', 'both', 'grandparents', 'custom'],
            formality: 'formal',
            requiredFields: ['couple.personA.displayName', 'couple.personB.displayName', 'event.date'],
            optionalFields: ['event.venue'],
            render: function (project, event) {
                var couple = coupleNames(project);
                var venue = eventVenue(project, event);
                var missing = [];
                if (!couple.complete) missing.push('couple.displayName');
                if (!hasText(event.date)) missing.push('event.date');
                if (missing.length) return { complete: false, missingFields: missing, text: '' };
                var venueLine = venue && hasText(venue.name) ? ('\nمقام: ' + venue.name) : '';
                return {
                    complete: true,
                    missingFields: [],
                    text: 'بخوشی دعوت دی جاتی ہے\n' + couple.a + ' و ' + couple.b + ' کی تقریبِ نکاح\n' + 'بتاریخ: ' + event.date + venueLine
                };
            }
        }),
        Object.freeze({
            id: 'warm-mehndi-ur',
            eventTypes: ['mehndi'],
            languages: ['urdu'],
            hostModes: ['bride_side', 'groom_side', 'both', 'custom'],
            formality: 'informal',
            requiredFields: ['couple.personA.displayName', 'couple.personB.displayName', 'event.date'],
            optionalFields: ['event.venue'],
            render: function (project, event) {
                var couple = coupleNames(project);
                var venue = eventVenue(project, event);
                var missing = [];
                if (!couple.complete) missing.push('couple.displayName');
                if (!hasText(event.date)) missing.push('event.date');
                if (missing.length) return { complete: false, missingFields: missing, text: '' };
                var venueLine = venue && hasText(venue.name) ? ('\nمقام: ' + venue.name) : '';
                return {
                    complete: true,
                    missingFields: [],
                    text: couple.a + ' اور ' + couple.b + ' کی مہندی میں تشریف لائیں\n' + 'بتاریخ: ' + event.date + venueLine
                };
            }
        }),
        Object.freeze({
            id: 'traditional-baraat-bilingual',
            eventTypes: ['baraat'],
            languages: ['bilingual'],
            hostModes: ['bride_side', 'groom_side', 'both', 'grandparents', 'custom'],
            formality: 'formal',
            requiredFields: ['couple.personA.displayName', 'couple.personB.displayName', 'event.date'],
            optionalFields: ['event.venue'],
            render: function (project, event) {
                var couple = coupleNames(project);
                var venue = eventVenue(project, event);
                var missing = [];
                if (!couple.complete) missing.push('couple.displayName');
                if (!hasText(event.date)) missing.push('event.date');
                if (missing.length) return { complete: false, missingFields: missing, text: '' };
                var venueLine = venue && hasText(venue.name) ? ('\nVenue / مقام: ' + venue.name) : '';
                return {
                    complete: true,
                    missingFields: [],
                    text: 'You are cordially invited to the Baraat of\n' + couple.a + ' & ' + couple.b +
                        '\nبارات میں شرکت کی دعوت ہے\n' + 'Date / تاریخ: ' + event.date + venueLine
                };
            }
        }),
        Object.freeze({
            id: 'groom-family-walima-en',
            eventTypes: ['walima'],
            languages: ['english'],
            hostModes: ['groom_side', 'both', 'grandparents', 'custom'],
            formality: 'formal',
            requiredFields: ['couple.personA.displayName', 'couple.personB.displayName', 'event.date'],
            optionalFields: ['event.venue'],
            render: function (project, event) {
                var couple = coupleNames(project);
                var venue = eventVenue(project, event);
                var missing = [];
                if (!couple.complete) missing.push('couple.displayName');
                if (!hasText(event.date)) missing.push('event.date');
                if (missing.length) return { complete: false, missingFields: missing, text: '' };
                var venueLine = venue && hasText(venue.name) ? ('\nVenue: ' + venue.name) : '';
                return {
                    complete: true,
                    missingFields: [],
                    text: 'With the blessings of Allah, you are invited to the Walima of\n' + couple.a + ' & ' + couple.b +
                        '\nDate: ' + event.date + venueLine
                };
            }
        }),
        Object.freeze({
            id: 'concise-whatsapp',
            eventTypes: ['nikah', 'mehndi', 'mayun', 'dholki', 'baraat', 'rukhsati', 'walima', 'engagement', 'custom'],
            languages: ['urdu', 'english', 'bilingual'],
            hostModes: ['bride_side', 'groom_side', 'both', 'grandparents', 'custom'],
            formality: 'concise',
            requiredFields: ['couple.personA.displayName', 'couple.personB.displayName', 'event.date'],
            optionalFields: ['event.venue'],
            render: function (project, event) {
                var couple = coupleNames(project);
                var venue = eventVenue(project, event);
                var missing = [];
                if (!couple.complete) missing.push('couple.displayName');
                if (!hasText(event.date)) missing.push('event.date');
                if (missing.length) return { complete: false, missingFields: missing, text: '' };
                var venuePart = venue && hasText(venue.name) ? (' @ ' + venue.name) : '';
                return {
                    complete: true,
                    missingFields: [],
                    text: eventLabel(event, false) + ': ' + couple.a + ' & ' + couple.b + ' — ' + event.date + venuePart
                };
            }
        })
    ]);

    function findTemplate(templateId) {
        for (var i = 0; i < TEMPLATES.length; i += 1) {
            if (TEMPLATES[i].id === templateId) return TEMPLATES[i];
        }
        return null;
    }

    function renderWording(templateId, project, event) {
        var template = findTemplate(templateId);
        if (!template) return { complete: false, missingFields: ['template:not-found'], text: '' };
        return template.render(project, event);
    }

    return {
        TEMPLATES: TEMPLATES,
        findTemplate: findTemplate,
        renderWording: renderWording,
        eventLabel: eventLabel
    };
}));
