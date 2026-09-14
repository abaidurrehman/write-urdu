(function (root, factory) {
    'use strict';
    var api = factory(root && root.document ? root.document : null);
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.WriteUrduFontRegistry = api;
}(typeof window !== 'undefined' ? window : null, function (defaultDocument) {
    'use strict';

    var LICENSE_STATUSES = ['approved-web', 'approved-system-reference', 'license-review', 'rejected'];
    var DELIVERIES = ['google-fonts', 'bundled-webfont', 'system-reference', 'future-webfont'];
    var STYLES = ['nastaliq', 'naskh', 'modern-arabic', 'decorative', 'decorative-nastaliq', 'calligraphic'];
    var CAPABILITIES = ['dom', 'canvas', 'editor', 'card-studio', 'name-art', 'preview', 'system-reference', 'candidate'];
    var DEFAULT_SAMPLE = 'اردو کی خوبصورت تحریر';

    function googleCss(family, weights) {
        var encoded = String(family).trim().replace(/ /g, '+');
        var suffix = Array.isArray(weights) && weights.length ? ':wght@' + weights.join(';') : '';
        return 'https://fonts.googleapis.com/css2?family=' + encoded + suffix + '&display=swap';
    }

    function freezeRecord(data) {
        var record = Object.assign({
            displayName: data.family,
            displayNameUr: '',
            weights: [400],
            defaultWeight: 400,
            lineHeight: 1.8,
            fallback: 'serif',
            recommendedFor: [],
            exportSupport: 'none',
            capabilities: [],
            priority: 100,
            sourceUrl: null,
            licenseUrl: null,
            stylesheetUrl: null,
            assetUrl: null,
            attribution: null
        }, data);
        record.weights = Object.freeze(record.weights.slice());
        record.recommendedFor = Object.freeze(record.recommendedFor.slice());
        record.capabilities = Object.freeze(record.capabilities.slice());
        return Object.freeze(record);
    }

    var records = [
        freezeRecord({
            id: 'noto-nastaliq-urdu', family: 'Noto Nastaliq Urdu', displayNameUr: 'نوٹو نستعلیق اردو',
            style: 'nastaliq', delivery: 'google-fonts', licenseStatus: 'approved-web', weights: [400, 500, 600, 700],
            defaultWeight: 400, lineHeight: 2, fallback: '"Noto Naskh Arabic", serif',
            recommendedFor: ['poetry', 'cards', 'documents'], exportSupport: 'canvas',
            capabilities: ['dom', 'canvas', 'editor', 'card-studio', 'name-art', 'preview'], priority: 10,
            sourceUrl: 'https://fonts.google.com/noto/specimen/Noto+Nastaliq+Urdu',
            licenseUrl: 'https://openfontlicense.org/',
            stylesheetUrl: googleCss('Noto Nastaliq Urdu', [400, 500, 600, 700])
        }),
        freezeRecord({
            id: 'noto-naskh-arabic', family: 'Noto Naskh Arabic', displayNameUr: 'نوٹو نسخ عربی',
            style: 'naskh', delivery: 'google-fonts', licenseStatus: 'approved-web', weights: [400, 500, 600, 700],
            defaultWeight: 400, lineHeight: 1.7, fallback: 'serif',
            recommendedFor: ['reading', 'documents', 'small-text'], exportSupport: 'canvas',
            capabilities: ['dom', 'canvas', 'editor', 'card-studio', 'name-art', 'preview'], priority: 20,
            sourceUrl: 'https://fonts.google.com/noto/specimen/Noto+Naskh+Arabic',
            licenseUrl: 'https://openfontlicense.org/',
            stylesheetUrl: googleCss('Noto Naskh Arabic', [400, 500, 600, 700])
        }),
        freezeRecord({
            id: 'amiri', family: 'Amiri', displayNameUr: 'امیری',
            style: 'naskh', delivery: 'google-fonts', licenseStatus: 'approved-web', weights: [400, 700],
            defaultWeight: 400, lineHeight: 1.75, fallback: 'serif',
            recommendedFor: ['reading', 'formal', 'cards'], exportSupport: 'canvas',
            capabilities: ['dom', 'canvas', 'editor', 'card-studio', 'name-art', 'preview'], priority: 30,
            sourceUrl: 'https://fonts.google.com/specimen/Amiri', licenseUrl: 'https://openfontlicense.org/',
            stylesheetUrl: googleCss('Amiri', [400, 700])
        }),
        freezeRecord({
            id: 'lateef', family: 'Lateef', displayNameUr: 'لطیف',
            style: 'naskh', delivery: 'google-fonts', licenseStatus: 'approved-web', weights: [400, 700],
            defaultWeight: 400, lineHeight: 1.8, fallback: 'serif',
            recommendedFor: ['cards', 'greetings', 'reading'], exportSupport: 'canvas',
            capabilities: ['dom', 'canvas', 'editor', 'card-studio', 'name-art', 'preview'], priority: 40,
            sourceUrl: 'https://fonts.google.com/specimen/Lateef', licenseUrl: 'https://openfontlicense.org/',
            stylesheetUrl: googleCss('Lateef', [400, 700])
        }),
        freezeRecord({
            id: 'scheherazade-new', family: 'Scheherazade New', displayNameUr: 'شہرازاد',
            style: 'naskh', delivery: 'google-fonts', licenseStatus: 'approved-web', weights: [400, 700],
            defaultWeight: 400, lineHeight: 1.75, fallback: 'serif',
            recommendedFor: ['reading', 'formal', 'cards'], exportSupport: 'canvas',
            capabilities: ['dom', 'canvas', 'card-studio', 'name-art', 'preview'], priority: 50,
            sourceUrl: 'https://fonts.google.com/specimen/Scheherazade+New', licenseUrl: 'https://openfontlicense.org/',
            stylesheetUrl: googleCss('Scheherazade New', [400, 700])
        }),
        freezeRecord({
            id: 'tajawal', family: 'Tajawal', displayNameUr: 'تجوال',
            style: 'modern-arabic', delivery: 'google-fonts', licenseStatus: 'approved-web', weights: [400, 500, 700],
            defaultWeight: 400, lineHeight: 1.55, fallback: 'sans-serif',
            recommendedFor: ['modern', 'headings', 'cards'], exportSupport: 'canvas',
            capabilities: ['dom', 'canvas', 'editor', 'card-studio', 'name-art', 'preview'], priority: 60,
            sourceUrl: 'https://fonts.google.com/specimen/Tajawal', licenseUrl: 'https://openfontlicense.org/',
            stylesheetUrl: googleCss('Tajawal', [400, 500, 700])
        }),
        freezeRecord({
            id: 'harmattan', family: 'Harmattan', displayNameUr: 'ہارمتن',
            style: 'naskh', delivery: 'google-fonts', licenseStatus: 'approved-web', weights: [400, 500, 600, 700],
            defaultWeight: 400, lineHeight: 1.65, fallback: 'serif',
            recommendedFor: ['reading', 'editor'], exportSupport: 'none',
            capabilities: ['dom', 'editor', 'preview'], priority: 70,
            sourceUrl: 'https://fonts.google.com/specimen/Harmattan', licenseUrl: 'https://openfontlicense.org/',
            stylesheetUrl: googleCss('Harmattan', [400, 500, 600, 700])
        }),
        freezeRecord({
            id: 'katibeh', family: 'Katibeh', displayNameUr: 'کتیبہ',
            style: 'decorative', delivery: 'google-fonts', licenseStatus: 'approved-web', weights: [400],
            defaultWeight: 400, lineHeight: 1.55, fallback: 'serif',
            recommendedFor: ['headings', 'decorative'], exportSupport: 'none',
            capabilities: ['dom', 'editor', 'preview'], priority: 80,
            sourceUrl: 'https://fonts.google.com/specimen/Katibeh', licenseUrl: 'https://openfontlicense.org/',
            stylesheetUrl: googleCss('Katibeh', [400])
        }),
        freezeRecord({
            id: 'mehr-nastaliq-web', family: 'Mehr Nastaliq Web', displayNameUr: 'مہر نستعلیق ویب',
            style: 'nastaliq', delivery: 'future-webfont', licenseStatus: 'license-review',
            recommendedFor: ['poetry', 'cards'], capabilities: ['candidate'], priority: 200,
            sourceUrl: 'https://mehrtype.com/product/mehr-nastaliq-web/'
        }),
        freezeRecord({
            id: 'awami-nastaliq', family: 'Awami Nastaliq', displayNameUr: 'عوامی نستعلیق',
            style: 'nastaliq', delivery: 'system-reference', licenseStatus: 'approved-system-reference',
            recommendedFor: ['reading', 'poetry'], capabilities: ['candidate', 'system-reference'], priority: 210,
            sourceUrl: 'https://software.sil.org/awami/', licenseUrl: 'https://openfontlicense.org/'
        }),
        freezeRecord({ id: 'nafees-nastaleeq', family: 'Nafees Nastaleeq', style: 'nastaliq', delivery: 'system-reference', licenseStatus: 'license-review', capabilities: ['candidate', 'system-reference'], priority: 220 }),
        freezeRecord({ id: 'jameel-noori-nastaleeq', family: 'Jameel Noori Nastaleeq', style: 'nastaliq', delivery: 'system-reference', licenseStatus: 'license-review', capabilities: ['candidate', 'system-reference'], priority: 230 }),
        freezeRecord({ id: 'jameel-noori-kasheeda', family: 'Jameel Noori Kasheeda', style: 'nastaliq', delivery: 'system-reference', licenseStatus: 'license-review', capabilities: ['candidate', 'system-reference'], priority: 240 }),
        freezeRecord({ id: 'alqalam-taj-nastaleeq', family: 'AlQalam Taj Nastaleeq', style: 'decorative-nastaliq', delivery: 'system-reference', licenseStatus: 'license-review', capabilities: ['candidate', 'system-reference'], priority: 250 }),
        freezeRecord({ id: 'aa-sameer-sagar', family: 'AA Sameer Sagar', style: 'decorative', delivery: 'system-reference', licenseStatus: 'license-review', capabilities: ['candidate', 'system-reference'], priority: 260 }),
        freezeRecord({ id: 'gandhara-suls', family: 'Gandhara Suls', style: 'calligraphic', delivery: 'system-reference', licenseStatus: 'license-review', capabilities: ['candidate', 'system-reference'], priority: 270 })
    ];

    function validateRecord(record) {
        if (!record || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.id || '')) throw new Error('invalid_font_id');
        if (!record.family) throw new Error('missing_font_family:' + record.id);
        if (STYLES.indexOf(record.style) === -1) throw new Error('invalid_font_style:' + record.id);
        if (DELIVERIES.indexOf(record.delivery) === -1) throw new Error('invalid_font_delivery:' + record.id);
        if (LICENSE_STATUSES.indexOf(record.licenseStatus) === -1) throw new Error('invalid_font_license:' + record.id);
        if (!Array.isArray(record.weights) || !record.weights.length) throw new Error('invalid_font_weights:' + record.id);
        if (record.weights.indexOf(record.defaultWeight) === -1) throw new Error('invalid_default_weight:' + record.id);
        record.capabilities.forEach(function (capability) {
            if (CAPABILITIES.indexOf(capability) === -1) throw new Error('invalid_font_capability:' + record.id + ':' + capability);
        });
        if (record.licenseStatus === 'license-review' && (record.assetUrl || record.stylesheetUrl)) throw new Error('unapproved_font_asset:' + record.id);
        if (record.licenseStatus === 'approved-web' && !record.sourceUrl) throw new Error('approved_web_requires_source:' + record.id);
        return true;
    }

    function validateRecords(list) {
        var ids = Object.create(null);
        (list || []).forEach(function (record) {
            validateRecord(record);
            if (ids[record.id]) throw new Error('duplicate_font_id:' + record.id);
            ids[record.id] = true;
        });
        return true;
    }

    validateRecords(records);

    var byId = Object.create(null);
    var aliases = Object.create(null);
    records.forEach(function (record) {
        byId[record.id] = record;
        aliases[record.id.toLowerCase()] = record.id;
        aliases[record.family.toLowerCase()] = record.id;
    });
    aliases['scheherazade'] = 'scheherazade-new';
    aliases['scheherazade new'] = 'scheherazade-new';
    aliases['noto nastaliq urdu'] = 'noto-nastaliq-urdu';
    aliases['noto naskh arabic'] = 'noto-naskh-arabic';

    function normalizeKey(value) {
        return String(value || '').trim().replace(/^['"]|['"]$/g, '').replace(/\s+/g, ' ').toLowerCase();
    }

    function resolveId(value) {
        return aliases[normalizeKey(value)] || null;
    }

    function get(value) {
        var id = resolveId(value);
        return id ? byId[id] : null;
    }

    function getAll() {
        return records.slice().sort(function (a, b) { return a.priority - b.priority; });
    }

    function getForCapability(capability, options) {
        options = options || {};
        if (CAPABILITIES.indexOf(capability) === -1) return [];
        return getAll().filter(function (record) {
            if (record.capabilities.indexOf(capability) === -1) return false;
            if (options.webOnly && record.licenseStatus !== 'approved-web') return false;
            if (options.excludeCandidates && record.capabilities.indexOf('candidate') !== -1) return false;
            return true;
        });
    }

    function fontCssSpec(record, weight, sizePx) {
        return String(weight || record.defaultWeight || 400) + ' ' + String(sizePx || 32) + 'px "' + record.family + '"';
    }

    function createLoader(options) {
        options = options || {};
        var doc = options.document || defaultDocument;
        var timeoutMs = Number(options.timeoutMs) > 0 ? Number(options.timeoutMs) : 8000;
        var sampleText = options.sampleText || DEFAULT_SAMPLE;
        var cache = Object.create(null);
        var stylesheetCache = Object.create(null);

        function result(ok, record, code, extra) {
            return Object.assign({ ok: ok, id: record ? record.id : null, family: record ? record.family : null, code: code }, extra || {});
        }

        function tryLoad(record, weight, sample) {
            if (!doc || !doc.fonts || typeof doc.fonts.load !== 'function') return Promise.resolve([]);
            return Promise.resolve(doc.fonts.load(fontCssSpec(record, weight), sample)).catch(function () { return []; });
        }

        function ensureStylesheet(record) {
            if (!record.stylesheetUrl) return Promise.resolve(false);
            if (stylesheetCache[record.stylesheetUrl]) return stylesheetCache[record.stylesheetUrl];
            stylesheetCache[record.stylesheetUrl] = new Promise(function (resolve) {
                if (!doc || typeof doc.createElement !== 'function' || !doc.head || typeof doc.head.appendChild !== 'function') {
                    resolve(false);
                    return;
                }
                if (typeof doc.querySelector === 'function') {
                    var existing = doc.querySelector('link[data-wu-font-id="' + record.id + '"]');
                    if (existing) {
                        resolve(true);
                        return;
                    }
                }
                var link = doc.createElement('link');
                var settled = false;
                var timer = setTimeout(function () {
                    if (settled) return;
                    settled = true;
                    resolve(false);
                }, timeoutMs);
                function finish(value) {
                    if (settled) return;
                    settled = true;
                    clearTimeout(timer);
                    resolve(value);
                }
                link.rel = 'stylesheet';
                link.href = record.stylesheetUrl;
                if (link.setAttribute) link.setAttribute('data-wu-font-id', record.id);
                link.onload = function () { finish(true); };
                link.onerror = function () { finish(false); };
                doc.head.appendChild(link);
            });
            return stylesheetCache[record.stylesheetUrl];
        }

        function verify(record, weight, sample) {
            if (!doc || !doc.fonts) return false;
            if (typeof doc.fonts.check !== 'function') return true;
            try {
                return !!doc.fonts.check(fontCssSpec(record, weight), sample);
            } catch (error) {
                return false;
            }
        }

        function load(value, loadOptions) {
            loadOptions = loadOptions || {};
            var record = get(value);
            if (!record) return Promise.resolve(result(false, null, 'unknown-font'));
            if (record.licenseStatus !== 'approved-web') return Promise.resolve(result(false, record, 'not-web-approved'));
            if (!doc || !doc.fonts || typeof doc.fonts.load !== 'function') return Promise.resolve(result(false, record, 'font-loading-api-unavailable'));

            var weight = Number(loadOptions.weight) || record.defaultWeight;
            if (record.weights.indexOf(weight) === -1) weight = record.defaultWeight;
            var sample = loadOptions.sampleText || sampleText;
            var key = record.id + ':' + weight + ':' + sample;
            if (cache[key]) return cache[key];

            cache[key] = tryLoad(record, weight, sample).then(function (faces) {
                if (faces && faces.length && verify(record, weight, sample)) return result(true, record, 'loaded', { weight: weight, source: 'existing' });
                return ensureStylesheet(record).then(function (stylesheetReady) {
                    if (!stylesheetReady) return result(false, record, 'stylesheet-unavailable', { weight: weight });
                    return tryLoad(record, weight, sample).then(function (loadedFaces) {
                        if (loadedFaces && loadedFaces.length && verify(record, weight, sample)) {
                            return Promise.resolve(doc.fonts.ready).catch(function () { return null; }).then(function () {
                                return result(true, record, 'loaded', { weight: weight, source: 'stylesheet' });
                            });
                        }
                        return result(false, record, 'font-load-failed', { weight: weight });
                    });
                });
            }).catch(function (error) {
                return result(false, record, 'font-load-error', { weight: weight, error: error && error.message ? error.message : String(error || '') });
            });
            return cache[key];
        }

        function clear() {
            cache = Object.create(null);
            stylesheetCache = Object.create(null);
        }

        return Object.freeze({ load: load, clear: clear });
    }

    return Object.freeze({
        LICENSE_STATUSES: Object.freeze(LICENSE_STATUSES.slice()),
        DELIVERIES: Object.freeze(DELIVERIES.slice()),
        STYLES: Object.freeze(STYLES.slice()),
        CAPABILITIES: Object.freeze(CAPABILITIES.slice()),
        DEFAULT_SAMPLE: DEFAULT_SAMPLE,
        getAll: getAll,
        get: get,
        resolveId: resolveId,
        getForCapability: getForCapability,
        validateRecord: validateRecord,
        validateRecords: validateRecords,
        createLoader: createLoader
    });
}));
