(function (rootWindow, factory) {
    'use strict';
    var core = rootWindow && rootWindow.WriteUrduWeddingCore;
    if (!core && typeof require === 'function') core = require('./wedding-project-core.js');
    var api = factory(core);
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (rootWindow) rootWindow.WriteUrduWeddingLayout = api;
}(typeof window !== 'undefined' ? window : null, function (core) {
    'use strict';
    if (!core) throw new Error('Wedding project core unavailable');

    // WU-SHAADI-001 structured invitation composer.
    //
    // Turns one event of a WeddingProject into an ordered list of text blocks (role + text +
    // script) that the canvas renderer lays out. Deterministic, no network, never invents a
    // value: when `sample` is requested, empty fields are filled with clearly-flagged sample
    // text for on-screen previews only; exports always use `sample: false`, which simply
    // omits whatever is missing.

    var STYLE_FOR_TONE = { formal: 'traditional', concise: 'simple', informal: 'modern' };
    var TONE_FOR_STYLE = { traditional: 'formal', simple: 'concise', modern: 'informal' };

    var EVENT_TITLES = {
        nikah: { ur: 'دعوتِ نکاح', en: 'Nikah Ceremony', short: 'Nikah' },
        mehndi: { ur: 'رسمِ مہندی', en: 'Mehndi Night', short: 'Mehndi' },
        mayun: { ur: 'رسمِ مایوں', en: 'Mayun', short: 'Mayun' },
        dholki: { ur: 'ڈھولکی کی شام', en: 'Dholki Night', short: 'Dholki' },
        baraat: { ur: 'تقریبِ بارات', en: 'Baraat', short: 'Baraat' },
        rukhsati: { ur: 'تقریبِ رخصتی', en: 'Rukhsati', short: 'Rukhsati' },
        walima: { ur: 'دعوتِ ولیمہ', en: 'Walima Reception', short: 'Walima' },
        engagement: { ur: 'تقریبِ منگنی', en: 'Engagement', short: 'Engagement' }
    };

    var FESTIVE_EVENTS = ['mehndi', 'mayun', 'dholki'];
    var WEDDING_KICKER_EVENTS = ['nikah', 'baraat', 'walima', 'rukhsati'];

    var COPY = {
        ur: {
            kicker: 'بسلسلۂ شادی خانہ آبادی',
            invite: {
                traditional: 'آپ کو ہماری خوشیوں میں شرکت کی پُرخلوص دعوت دی جاتی ہے',
                simple: 'آپ کو ہماری خوشیوں میں شرکت کی دعوت ہے',
                modern: 'ہماری خوشیوں میں شامل ہو کر انہیں دوبالا کیجیے',
                modernFestive: 'رنگوں، گیتوں اور خوشیوں بھری شام میں ضرور تشریف لائیں'
            },
            closing: {
                traditional: 'آپ کی تشریف آوری ہمارے لیے باعثِ مسرت ہوگی',
                simple: '',
                modern: 'آپ کا انتظار رہے گا'
            },
            joiner: 'ہمراہ',
            hostPrefix: 'منجانب',
            venuePrefix: 'بمقام',
            dressPrefix: 'لباس',
            rsvpPrefix: 'برائے رابطہ',
            and: ' و ',
            qrLabel: 'مقام کے لیے اسکین کریں'
        },
        en: {
            kicker: '',
            invite: {
                traditional: 'The pleasure of your company is requested at the {event} of',
                simple: 'You are invited to the {event} of',
                modern: 'We would love you to celebrate with us',
                modernFestive: 'Join us for an evening of colour, music & dholki'
            },
            closing: {
                traditional: 'Your presence will be our honour',
                simple: '',
                modern: 'Can’t wait to celebrate with you'
            },
            joiner: '&',
            hostPrefix: 'Hosted by',
            venuePrefix: '',
            dressPrefix: 'Dress code',
            rsvpPrefix: 'RSVP',
            and: ' & ',
            qrLabel: 'Scan for location'
        }
    };

    var UR_WEEKDAYS = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];
    var UR_MONTHS = ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'];
    var EN_WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    var PROGRAMME_LABEL_TEXT = {
        gathering: { ur: 'آمد', en: 'Arrival' },
        nikah: { ur: 'نکاح', en: 'Nikah' },
        baraat_arrival: { ur: 'آمدِ بارات', en: 'Baraat arrives' },
        dinner: { ur: 'طعام', en: 'Dinner' },
        rukhsati: { ur: 'رخصتی', en: 'Rukhsati' },
        reception: { ur: 'استقبالیہ', en: 'Reception' }
    };

    // Shown only in previews when a field is empty; flagged so the UI can label them.
    var SAMPLE = {
        bride: { ur: 'عائشہ', en: 'Ayesha' },
        groom: { ur: 'احمد', en: 'Ahmed' },
        date: '2026-11-22',
        time: '19:00',
        venue: { ur: 'پرل گارڈن', en: 'Pearl Garden' },
        city: { ur: 'لاہور', en: 'Lahore' }
    };

    function text(value) {
        return value === undefined || value === null ? '' : String(value).trim();
    }

    // Text with no letters at all (e.g. a phone number) takes the card's own language.
    function scriptOf(value, fallback) {
        if (fallback && !/[A-Za-z؀-ۿݐ-ݿ]/.test(text(value))) return fallback;
        return core.firstStrongDirection(value) === 'rtl' ? 'ur' : 'en';
    }

    function parseIsoDate(iso) {
        var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text(iso));
        if (!match) return null;
        var date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function formatDate(iso, lang) {
        var date = parseIsoDate(iso);
        if (!date) return '';
        var day = date.getUTCDate();
        var year = date.getUTCFullYear();
        if (lang === 'ur') return 'بروز ' + UR_WEEKDAYS[date.getUTCDay()] + '، ' + day + ' ' + UR_MONTHS[date.getUTCMonth()] + ' ' + year;
        return EN_WEEKDAYS[date.getUTCDay()] + ', ' + day + ' ' + EN_MONTHS[date.getUTCMonth()] + ' ' + year;
    }

    function formatShortDate(iso, lang) {
        var date = parseIsoDate(iso);
        if (!date) return '';
        if (lang === 'ur') return date.getUTCDate() + ' ' + UR_MONTHS[date.getUTCMonth()];
        return EN_WEEKDAYS[date.getUTCDay()].slice(0, 3) + ' ' + date.getUTCDate() + ' ' + EN_MONTHS[date.getUTCMonth()].slice(0, 3);
    }

    function urduDayPart(hour) {
        if (hour >= 4 && hour < 12) return 'صبح';
        if (hour >= 12 && hour < 15) return 'دوپہر';
        if (hour >= 15 && hour < 18) return 'سہ پہر';
        if (hour >= 18 && hour < 20) return 'شام';
        return 'رات';
    }

    function formatTime(value, lang) {
        var match = /^(\d{1,2}):(\d{2})$/.exec(text(value));
        if (!match) return text(value);
        var hour = Number(match[1]);
        var minute = match[2];
        if (hour > 23 || Number(minute) > 59) return text(value);
        var hour12 = hour % 12 === 0 ? 12 : hour % 12;
        if (lang === 'ur') return urduDayPart(hour) + ' ' + hour12 + (minute === '00' ? '' : ':' + minute) + ' بجے';
        return hour12 + ':' + minute + ' ' + (hour < 12 ? 'AM' : 'PM');
    }

    function findEvent(project, eventId) {
        for (var i = 0; i < project.events.length; i += 1) {
            if (project.events[i].id === eventId) return project.events[i];
        }
        return project.events[0] || null;
    }

    function findVenue(project, event) {
        if (!event || !event.venueId) return null;
        for (var i = 0; i < project.venues.length; i += 1) {
            if (project.venues[i].id === event.venueId) return project.venues[i];
        }
        return null;
    }

    function familyName(project, role) {
        for (var i = 0; i < project.families.length; i += 1) {
            if (project.families[i].role === role && text(project.families[i].displayName)) return text(project.families[i].displayName);
        }
        return '';
    }

    function wordingStyle(event) {
        return STYLE_FOR_TONE[event.wordingTone] || 'traditional';
    }

    function eventTitle(event, lang) {
        if (event.type === 'custom') return text(event.customTypeLabel) || (lang === 'ur' ? 'دعوت' : 'Celebration');
        var entry = EVENT_TITLES[event.type];
        return entry ? entry[lang] : event.type;
    }

    function eventShortName(event) {
        if (event.type === 'custom') return text(event.customTypeLabel) || 'Celebration';
        return EVENT_TITLES[event.type] ? EVENT_TITLES[event.type].short : event.type;
    }

    function hostLine(project, event, lang) {
        var bride = familyName(project, 'bride_side');
        var groom = familyName(project, 'groom_side');
        var names = [];
        if (event.hostMode === 'bride_side' && bride) names = [bride];
        else if (event.hostMode === 'groom_side' && groom) names = [groom];
        else if (event.hostMode === 'both') names = [bride, groom].filter(Boolean);
        else if (event.hostMode === 'grandparents') names = [familyName(project, 'grandparents')].filter(Boolean);
        else if (event.hostMode === 'custom') names = [familyName(project, 'custom')].filter(Boolean);
        if (!names.length) return '';
        var joined = names.join(scriptOf(names.join('')) === 'ur' ? COPY.ur.and : COPY.en.and);
        var prefixLang = scriptOf(joined);
        return COPY[prefixLang].hostPrefix + (prefixLang === 'ur' ? ': ' : ' ') + joined;
    }

    function block(role, value, script, sample) {
        return { role: role, text: value, script: script, sample: Boolean(sample) };
    }

    // Programme rows: one row shows just the time; several rows show "label time".
    function programmeLines(event, lang, sample) {
        var items = (event.programme || []).filter(function (item) { return text(item.time); });
        if (!items.length) {
            return sample ? [block('time', formatTime(SAMPLE.time, lang), lang, true)] : [];
        }
        if (items.length === 1 && (items[0].labelType === 'gathering' || items[0].labelType === 'custom' && !text(items[0].customLabel))) {
            return [block('time', formatTime(items[0].time, lang), lang)];
        }
        var parts = items.map(function (item) {
            var label = item.labelType === 'custom' ? text(item.customLabel) : (PROGRAMME_LABEL_TEXT[item.labelType] || {})[lang] || '';
            return (label ? label + (lang === 'ur' ? ': ' : ' ') : '') + formatTime(item.time, lang);
        });
        return [block('time', parts.join('  •  '), lang)];
    }

    function composeInvitation(rawProject, eventId, options) {
        var opts = options || {};
        var sample = Boolean(opts.sample);
        var project = core.normalizeWeddingProject(rawProject);
        var event = findEvent(project, eventId);
        var language = project.invitationLanguage;
        var blocks = [];
        var missing = [];
        if (!event) return { language: language, blocks: blocks, missing: ['event'], usedSample: false };

        var lang = language === 'english' ? 'en' : 'ur';
        var detailLang = language === 'urdu' ? 'ur' : 'en';
        var style = wordingStyle(event);
        var festive = FESTIVE_EVENTS.indexOf(event.type) >= 0;
        var usedSample = false;

        // Names: bride first unless the groom's family is hosting this event.
        var bride = text(project.couple.personA.displayName);
        var groom = text(project.couple.personB.displayName);
        var brideSample = false;
        var groomSample = false;
        if (!bride) { missing.push('bride'); if (sample) { bride = SAMPLE.bride[lang]; brideSample = true; } }
        if (!groom) { missing.push('groom'); if (sample) { groom = SAMPLE.groom[lang]; groomSample = true; } }
        var people = [
            { name: bride, parents: text(project.couple.personA.parentageText), sample: brideSample },
            { name: groom, parents: text(project.couple.personB.parentageText), sample: groomSample }
        ];
        if (event.hostMode === 'groom_side') people.reverse();

        var opening = project.religiousOpening;
        if (opening.mode === 'verified_library') {
            var entry = core.approvedLibraryEntry(opening.libraryId);
            if (entry) blocks.push(block('opening', entry.displayText, 'ar'));
        }

        if (style === 'traditional' && WEDDING_KICKER_EVENTS.indexOf(event.type) >= 0 && COPY[lang].kicker) {
            blocks.push(block('kicker', COPY[lang].kicker, lang));
        }

        blocks.push(block('heading', eventTitle(event, lang), event.type === 'custom' ? scriptOf(eventTitle(event, lang)) : lang));
        if (language === 'bilingual') blocks.push(block('subheading', eventTitle(event, 'en').toUpperCase(), 'en'));

        var customInvite = text(event.customWording);
        var inviteLang = language === 'bilingual' ? 'en' : lang;
        var inviteKey = style === 'modern' && festive ? 'modernFestive' : style;
        var invite = customInvite || COPY[inviteLang].invite[inviteKey].replace('{event}', eventShortName(event));
        blocks.push(block('invite', invite, customInvite ? scriptOf(customInvite) : inviteLang));

        people.forEach(function (person, index) {
            if (person.name) blocks.push(block('name', person.name, scriptOf(person.name), person.sample));
            if (person.parents) blocks.push(block('parents', person.parents, scriptOf(person.parents)));
            if (index === 0 && people[1].name && person.name) {
                var bothUrdu = scriptOf(people[0].name) === 'ur' && scriptOf(people[1].name) === 'ur';
                blocks.push(block('joiner', bothUrdu && language !== 'bilingual' ? COPY.ur.joiner : '&', bothUrdu && language !== 'bilingual' ? 'ur' : 'en'));
            }
        });
        if (brideSample || groomSample) usedSample = true;

        blocks.push(block('divider', '', detailLang));

        if (event.date) {
            blocks.push(block('date', formatDate(event.date, detailLang), detailLang));
        } else {
            missing.push('date');
            if (sample) { blocks.push(block('date', formatDate(SAMPLE.date, detailLang), detailLang, true)); usedSample = true; }
        }
        var times = programmeLines(event, detailLang, sample && !(event.programme || []).some(function (item) { return text(item.time); }));
        if (times.length && times[0].sample) usedSample = true;
        blocks = blocks.concat(times);

        var venue = findVenue(project, event);
        var venueName = venue ? text(venue.name) : '';
        var address = venue ? [text(venue.address), text(venue.city)].filter(Boolean).join(scriptOf(text(venue.address) + text(venue.city)) === 'ur' ? '، ' : ', ') : '';
        if (venueName) {
            var venueScript = scriptOf(venueName);
            var prefix = venueScript === 'ur' && style === 'traditional' ? COPY.ur.venuePrefix + ': ' : '';
            blocks.push(block('venue', prefix + venueName, venueScript));
        } else {
            missing.push('venue');
            if (sample) {
                blocks.push(block('venue', SAMPLE.venue[detailLang], detailLang, true));
                if (!address) blocks.push(block('address', SAMPLE.city[detailLang], detailLang, true));
                usedSample = true;
            }
        }
        if (address) blocks.push(block('address', address, scriptOf(address)));

        if (text(event.dressCode)) {
            var dress = text(event.dressCode);
            var dressScript = scriptOf(dress, detailLang);
            blocks.push(block('extra', COPY[dressScript].dressPrefix + ': ' + dress, dressScript));
        }
        if (text(event.notes)) blocks.push(block('extra', text(event.notes), scriptOf(event.notes)));

        var host = hostLine(project, event, lang);
        if (host) blocks.push(block('host', host, scriptOf(host)));

        if (text(event.rsvpText)) {
            var rsvp = text(event.rsvpText);
            var rsvpScript = scriptOf(rsvp, detailLang);
            blocks.push(block('rsvp', COPY[rsvpScript].rsvpPrefix + ': ' + rsvp, rsvpScript));
        }

        var closingLang = language === 'bilingual' ? 'ur' : lang;
        var closing = COPY[closingLang].closing[style];
        if (closing) blocks.push(block('closing', closing, closingLang));

        var mapUrl = venue ? text(venue.mapUrl) : '';
        var qr = event.showMapQr && /^https?:\/\//i.test(mapUrl) ? { url: mapUrl, label: COPY[detailLang].qrLabel, script: detailLang } : null;

        return { language: language, style: style, blocks: blocks, missing: missing, usedSample: usedSample, qr: qr };
    }

    // Plain-text version for "Copy wording" and the WhatsApp message body.
    function invitationPlainText(rawProject, eventId) {
        var composed = composeInvitation(rawProject, eventId, { sample: false });
        var project = core.normalizeWeddingProject(rawProject);
        var event = findEvent(project, eventId);
        var venue = findVenue(project, event);
        var lines = [];
        composed.blocks.forEach(function (item) {
            if (item.role === 'divider') { lines.push(''); return; }
            if (item.role === 'joiner') { lines[lines.length - 1] = lines[lines.length - 1] + ' ' + item.text; return; }
            if (item.role === 'name' && lines.length && /(&|ہمراہ)$/.test(lines[lines.length - 1])) { lines[lines.length - 1] += ' ' + item.text; return; }
            lines.push(item.text);
        });
        if (venue && /^https?:\/\//i.test(text(venue.mapUrl))) lines.push(text(venue.mapUrl));
        return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    }

    function eventSummary(rawProject, eventId) {
        var project = core.normalizeWeddingProject(rawProject);
        var event = findEvent(project, eventId);
        if (!event) return '';
        var label = eventShortName(event);
        var date = event.date ? formatShortDate(event.date, 'en') : '';
        return date ? label + ' · ' + date : label;
    }

    return {
        STYLE_FOR_TONE: STYLE_FOR_TONE,
        TONE_FOR_STYLE: TONE_FOR_STYLE,
        EVENT_TITLES: EVENT_TITLES,
        SAMPLE: SAMPLE,
        formatDate: formatDate,
        formatShortDate: formatShortDate,
        formatTime: formatTime,
        eventTitle: eventTitle,
        eventShortName: eventShortName,
        composeInvitation: composeInvitation,
        invitationPlainText: invitationPlainText,
        eventSummary: eventSummary
    };
}));
