(function (root, factory) {
    var api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.WriteUrduTemplateLibrary = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
    'use strict';

    var SUPPORTED_FONTS = [
        'Noto Nastaliq Urdu', 'Noto Naskh Arabic', 'Amiri', 'Lateef', 'Scheherazade', 'Tajawal'
    ];
    var LICENSES = ['write-urdu-original', 'public-domain', 'user-supplied'];
    var CATEGORIES = [
        { id: 'poetry', label: 'Poetry and quotations', shortLabel: 'Poetry', tags: ['poetry', 'quote', 'shayari'] },
        { id: 'social', label: 'Social media', shortLabel: 'Social', tags: ['status', 'social', 'share'] },
        { id: 'religious', label: 'Religious and seasonal', shortLabel: 'Religious', tags: ['eid', 'ramadan', 'dua', 'seasonal'] },
        { id: 'education', label: 'Education', shortLabel: 'Education', tags: ['school', 'lesson', 'learning'] },
        { id: 'business', label: 'Business', shortLabel: 'Business', tags: ['business', 'announcement', 'professional'] },
        { id: 'events', label: 'Personal and events', shortLabel: 'Events', tags: ['invitation', 'event', 'personal'] }
    ];
    var THUMBNAILS = {
        poetry: '/assets/templates/poetry.svg',
        social: '/assets/templates/social.svg',
        religious: '/assets/templates/religious.svg',
        education: '/assets/templates/education.svg',
        business: '/assets/templates/business.svg',
        events: '/assets/templates/events.svg'
    };
    var PRESETS = [
        { width: 1080, height: 1080, presetId: 'square' },
        { width: 1280, height: 720, presetId: 'landscape' },
        { width: 1200, height: 630, presetId: 'facebook' },
        { width: 1080, height: 1920, presetId: 'story' }
    ];

    var STYLES = [
        { id: 'cream', baseTemplateId: 'classic-nastaliq', backgroundColor: '#fbf7ef', fontFamily: 'Noto Nastaliq Urdu', textColor: '#1f2937', accent: '#b77935', align: 'center', verticalAlign: 'center', lineHeight: 1.8 },
        { id: 'night', baseTemplateId: 'midnight', backgroundColor: '#0f172a', gradientId: 'midnight-blue', fontFamily: 'Noto Naskh Arabic', textColor: '#f8fafc', accent: '#93c5fd', align: 'center', verticalAlign: 'center', lineHeight: 1.65 },
        { id: 'clean', baseTemplateId: 'minimal-white', backgroundColor: '#ffffff', fontFamily: 'Noto Naskh Arabic', textColor: '#172a21', accent: '#1c8152', align: 'right', verticalAlign: 'center', lineHeight: 1.5 },
        { id: 'emerald', baseTemplateId: 'emerald', backgroundColor: '#082c1d', gradientId: 'emerald-night', fontFamily: 'Noto Nastaliq Urdu', textColor: '#fffdf2', accent: '#d8f36a', align: 'center', verticalAlign: 'center', lineHeight: 1.8 },
        { id: 'paper', baseTemplateId: 'paper', backgroundColor: '#f5ead7', fontFamily: 'Noto Nastaliq Urdu', textColor: '#3d2b1f', accent: '#a66a36', align: 'right', verticalAlign: 'center', lineHeight: 1.8 },
        { id: 'photo', baseTemplateId: 'photo-quote', backgroundColor: '#263238', fontFamily: 'Noto Naskh Arabic', textColor: '#ffffff', accent: '#ffffff', align: 'center', verticalAlign: 'bottom', lineHeight: 1.6, overlayOpacity: .42 },
        { id: 'sunflower', baseTemplateId: 'sunflower-bloom', backgroundColor: '#fffdf4', fontFamily: 'Noto Nastaliq Urdu', textColor: '#26382b', accent: '#d7a51a', align: 'center', verticalAlign: 'center', lineHeight: 1.8 },
        { id: 'gold', baseTemplateId: 'golden-mandala', backgroundColor: '#f5c84b', fontFamily: 'Noto Naskh Arabic', textColor: '#2d2414', accent: '#3f2e14', align: 'center', verticalAlign: 'center', lineHeight: 1.65 },
        { id: 'botanical', baseTemplateId: 'botanical-frame', backgroundColor: '#f5f2e8', fontFamily: 'Noto Nastaliq Urdu', textColor: '#1d3b2a', accent: '#277044', align: 'right', verticalAlign: 'center', lineHeight: 1.8 }
    ];
    var DIMENSIONS = [
        { width: 1080, height: 1080 }, { width: 1280, height: 720 },
        { width: 1200, height: 630 }, { width: 1080, height: 1920 }
    ];

    var NAMES = {
        poetry: ['Quiet Morning Verse', 'Moonlit Shayari', 'Ink and Silence', 'Classic Couplets', 'Rosewater Quote', 'Sufi Reflection', 'Open Book Poetry', 'Golden Line', 'Rain on Paper', 'Heritage Verse', 'Heartfelt Words', 'Nastaliq Night'],
        social: ['Daily Reminder', 'Weekend Greeting', 'Bold Urdu Status', 'Simple Share', 'Modern Quote', 'Light and Life', 'Conversation Card', 'Community Note'],
        religious: ['Eid Mubarak Garden', 'Ramadan Kareem Glow', 'Blessed Friday', 'Dua and Hope', 'Eid Moon Greeting', 'Ramadan Reflection', 'Faith and Patience', 'Seasonal Blessing'],
        education: ['Lesson Highlight', 'Classroom Note', 'Study Motivation', 'Reading List', 'School Announcement', 'Learning Goal'],
        business: ['Business Announcement', 'Professional Quote', 'New Product Note', 'Service Update', 'Team Message', 'Minimal Brand Card'],
        events: ['Wedding Invitation', 'Birthday Greeting', 'Thank You Note', 'Save the Date', 'Family Celebration', 'Personal Announcement']
    };
    var URDU_NAMES = {
        poetry: ['صبح کی نظم', 'چاندنی شاعری', 'سیاہی اور خاموشی', 'کلاسیکی اشعار', 'گلابی اقتباس', 'صوفیانہ سوچ', 'کھلی کتاب', 'سنہری سطر', 'کاغذ پر بارش', 'روایتی شاعری', 'دل کی بات', 'نستعلیق رات'],
        social: ['آج کی یاد دہانی', 'ہفتہ وار مبارک باد', 'اردو اسٹیٹس', 'سادہ شیئر', 'جدید اقتباس', 'روشنی اور زندگی', 'گفتگو کارڈ', 'اجتماعی پیغام'],
        religious: ['عید مبارک باغ', 'رمضان کریم', 'جمعہ مبارک', 'دعا اور امید', 'عید کا چاند', 'رمضان کی سوچ', 'ایمان اور صبر', 'موسمی برکت'],
        education: ['سبق کی جھلک', 'کلاس روم نوٹ', 'مطالعے کی ترغیب', 'کتابوں کی فہرست', 'اسکول اعلان', 'تعلیمی مقصد'],
        business: ['کاروباری اعلان', 'پیشہ ورانہ اقتباس', 'نئی پیشکش', 'سروس اپ ڈیٹ', 'ٹیم پیغام', 'سادہ برانڈ کارڈ'],
        events: ['شادی کا دعوت نامہ', 'سالگرہ مبارک', 'شکریہ کا پیغام', 'تاریخ محفوظ کریں', 'خاندانی جشن', 'ذاتی اعلان']
    };
    var CATEGORY_COUNTS = { poetry: 12, social: 8, religious: 8, education: 6, business: 6, events: 6 };

    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function slugify(value) { return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
    function findCategory(id) { return CATEGORIES.find(function (category) { return category.id === id; }) || CATEGORIES[0]; }
    function findDimension(index, categoryId) {
        if (categoryId === 'social' || categoryId === 'religious' || categoryId === 'events') return DIMENSIONS[(index + 3) % DIMENSIONS.length];
        return DIMENSIONS[index % DIMENSIONS.length];
    }
    function createTemplate(categoryId, index) {
        var category = findCategory(categoryId);
        var style = STYLES[(index + CATEGORIES.indexOf(category)) % STYLES.length];
        var dimension = findDimension(index, categoryId);
        var name = NAMES[categoryId][index];
        var slug = slugify(name);
        var description = 'A polished ' + category.label.toLowerCase() + ' design for Urdu writing, sharing and local PNG export.';
        var layers = [
            { id: 'background', type: 'background', locked: true },
            { id: 'accent', type: 'decoration', locked: true, motif: style.id },
            { id: 'text', type: 'text', editable: true, align: style.align, verticalAlign: style.verticalAlign },
            { id: 'attribution', type: 'text', editable: true, optional: true, align: style.align }
        ];
        return {
            id: 'urdu-template-' + categoryId + '-' + String(index + 1).padStart(2, '0'),
            slug: slug,
            name: name,
            nameUrdu: URDU_NAMES[categoryId][index],
            description: description,
            category: categoryId,
            tags: category.tags.concat([style.id, style.fontFamily === 'Noto Nastaliq Urdu' ? 'nastaliq' : 'naskh']),
            thumbnail: THUMBNAILS[categoryId],
            featured: index < (categoryId === 'poetry' ? 4 : 2),
            canvas: { width: dimension.width, height: dimension.height, backgroundColor: style.backgroundColor },
            layers: layers,
            recommendedFonts: [style.fontFamily, style.fontFamily === 'Noto Nastaliq Urdu' ? 'Noto Naskh Arabic' : 'Amiri'],
            license: 'write-urdu-original',
            createdAt: '2026-07-' + String(1 + (index % 9)).padStart(2, '0'),
            updatedAt: '2026-07-15',
            baseTemplateId: style.baseTemplateId,
            style: clone(style)
        };
    }
    function buildTemplates() {
        var result = [];
        Object.keys(CATEGORY_COUNTS).forEach(function (categoryId) {
            for (var index = 0; index < CATEGORY_COUNTS[categoryId]; index += 1) result.push(createTemplate(categoryId, index));
        });
        return result;
    }
    var TEMPLATES = buildTemplates();

    function validColor(value) { return typeof value === 'string' && /^(#[0-9a-f]{3,8}|rgba?\([^)]*\))$/i.test(value); }
    function validateTemplate(template, options) {
        options = options || {};
        var errors = [];
        if (!template || typeof template !== 'object') return ['Template must be an object.'];
        ['id', 'slug', 'name', 'description', 'category', 'thumbnail', 'license'].forEach(function (field) { if (!String(template[field] || '').trim()) errors.push(field + ' is required.'); });
        if (!findCategory(template.category).id || !CATEGORIES.some(function (category) { return category.id === template.category; })) errors.push('category is unsupported.');
        if (!LICENSES.includes(template.license)) errors.push('license is unsupported.');
        if (!/^\/?(?:[a-z0-9._-]+\/)*[a-z0-9._-]+\.(?:svg|png|webp|avif|jpg|jpeg)$/i.test(template.thumbnail) || template.thumbnail.includes('..')) errors.push('thumbnail must be a safe local asset path.');
        if (!template.canvas || !DIMENSIONS.some(function (dimension) { return dimension.width === template.canvas.width && dimension.height === template.canvas.height; })) errors.push('canvas dimensions are unsupported.');
        if (!template.canvas || !validColor(template.canvas.backgroundColor)) errors.push('canvas backgroundColor is invalid.');
        if (!Array.isArray(template.tags) || !template.tags.length) errors.push('tags must not be empty.');
        if (!Array.isArray(template.recommendedFonts) || !template.recommendedFonts.length || template.recommendedFonts.some(function (font) { return !SUPPORTED_FONTS.includes(font); })) errors.push('recommendedFonts contains an unsupported font.');
        if (!Array.isArray(template.layers) || !template.layers.length) errors.push('layers must not be empty.');
        else { var layerIds = template.layers.map(function (layer) { return layer && layer.id; }); if (layerIds.some(function (id) { return !id; })) errors.push('every layer needs an id.'); if (new Set(layerIds).size !== layerIds.length) errors.push('layer ids must be unique.'); }
        if (options.assetExists && !options.assetExists(template.thumbnail)) errors.push('thumbnail asset does not exist.');
        return errors;
    }
    function validateRegistry(registry, options) {
        var errors = [];
        var ids = new Set(); var slugs = new Set();
        (registry || []).forEach(function (template) {
            var templateErrors = validateTemplate(template, options);
            templateErrors.forEach(function (error) { errors.push(template.id + ': ' + error); });
            if (ids.has(template.id)) errors.push(template.id + ': duplicate id.'); ids.add(template.id);
            if (slugs.has(template.slug)) errors.push(template.slug + ': duplicate slug.'); slugs.add(template.slug);
        });
        return errors;
    }
    function getTemplateBySlug(slug) { return TEMPLATES.find(function (template) { return template.slug === String(slug || '').trim().toLowerCase(); }) || null; }
    function getCategoryLabel(id) { return findCategory(id).label; }
    function dimensionsLabel(template) { return template.canvas.width + ' × ' + template.canvas.height; }
    function applyToCardProject(cardCore, project, template) {
        if (!cardCore || !template) return project;
        var result = cardCore.applyTemplate(project, template.baseTemplateId || 'classic-nastaliq');
        var matchingPreset = cardCore.PRESETS.find(function (preset) { return preset.width === template.canvas.width && preset.height === template.canvas.height; });
        if (matchingPreset) result = cardCore.applyPreset(result, matchingPreset.id);
        var style = template.style || {};
        result.libraryTemplateId = template.id;
        result.name = template.name;
        result.text.fontFamily = style.fontFamily || template.recommendedFonts[0];
        result.text.color = style.textColor || result.text.color;
        result.text.align = style.align || result.text.align;
        result.text.verticalAlign = style.verticalAlign || result.text.verticalAlign;
        result.text.lineHeight = style.lineHeight || result.text.lineHeight;
        result.background.type = style.gradientId ? 'gradient' : 'solid';
        result.background.color = style.backgroundColor || result.background.color;
        result.background.gradientId = style.gradientId || null;
        result.background.overlayOpacity = Number(style.overlayOpacity) || 0;
        result.watermark.enabled = true;
        result.watermark.position = style.watermarkPosition || 'bottom-left';
        result.updatedAt = new Date().toISOString();
        return result;
    }

    return {
        CATEGORIES: CATEGORIES,
        SUPPORTED_FONTS: SUPPORTED_FONTS,
        TEMPLATES: TEMPLATES,
        CATEGORY_COUNTS: CATEGORY_COUNTS,
        clone: clone,
        dimensionsLabel: dimensionsLabel,
        getCategoryLabel: getCategoryLabel,
        getTemplateBySlug: getTemplateBySlug,
        validateTemplate: validateTemplate,
        validateRegistry: validateRegistry,
        applyToCardProject: applyToCardProject
    };
}));
