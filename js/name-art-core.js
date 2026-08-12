(function (root, factory) {
    var api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.WriteUrduNameArt = api;
}(typeof window !== 'undefined' ? window : globalThis, function () {
    'use strict';

    var PACKS = [
        { id: 'minimal', label: 'Minimal' },
        { id: 'royal', label: 'Royal' },
        { id: 'islamic', label: 'Islamic' },
        { id: 'gaming', label: 'Gaming' },
        { id: 'love', label: 'Love' },
        { id: 'floral', label: 'Floral' },
        { id: 'neon', label: 'Neon' },
        { id: 'traditional', label: 'Traditional' },
        { id: 'modern', label: 'Modern' },
        { id: 'pakistan', label: 'Pakistan' },
        { id: 'wedding', label: 'Wedding' },
        { id: 'social-profile', label: 'Social Profile' }
    ];

    var PRESETS = [
        { id: 'square', label: 'Profile square', width: 1080, height: 1080 },
        { id: 'portrait', label: 'Portrait', width: 1080, height: 1350 },
        { id: 'landscape', label: 'Landscape', width: 1280, height: 720 },
        { id: 'facebook', label: 'Wide social', width: 1200, height: 630 },
        { id: 'story', label: 'Story', width: 1080, height: 1920 },
        { id: 'name-transparent', label: 'Transparent name', width: 1600, height: 900, transparent: true }
    ];

    var TEMPLATE_DATA = [
        ['minimal','01','Quiet Ivory','Noto Nastaliq Urdu','#172a21','#fbfaf6','solid',null,'clean','#1c8152'],
        ['minimal','02','Soft Slate','Noto Naskh Arabic','#21332a','#eef3f0','solid',null,'clean','#607269'],
        ['royal','01','Royal Midnight','Noto Nastaliq Urdu','#fff8db',null,'gradient','midnight-blue','night','#d7b65d'],
        ['royal','02','Emerald Court','Noto Nastaliq Urdu','#fffdf2',null,'gradient','emerald-night','emerald','#d8f36a'],
        ['islamic','01','Moonlit Dua','Noto Naskh Arabic','#f8fafc','#10243c','solid',null,'night','#dbeafe'],
        ['islamic','02','Golden Prayer','Amiri','#2d2414','#f5c84b','solid',null,'mandala','#3f2e14'],
        ['gaming','01','Electric Urdu','Noto Naskh Arabic','#f8fafc',null,'gradient','plum','photo','#e879f9'],
        ['gaming','02','Indigo Player','Tajawal','#ffffff',null,'gradient','indigo','night','#a5b4fc'],
        ['love','01','Rose Heart','Noto Nastaliq Urdu','#5f1736','#fff1f5','solid',null,'clean','#db2777'],
        ['love','02','Warm Promise','Lateef','#fff7ed','#7c2d12','solid',null,'paper','#fb923c'],
        ['floral','01','Botanical Name','Noto Nastaliq Urdu','#1d3b2a','#f5f2e8','solid',null,'botanical','#277044'],
        ['floral','02','Sunflower Name','Noto Nastaliq Urdu','#26382b','#fffdf4','solid',null,'sunflower','#d7a51a'],
        ['neon','01','Neon Ocean','Noto Naskh Arabic','#ecfeff',null,'gradient','ocean','photo','#22d3ee'],
        ['neon','02','Neon Plum','Tajawal','#faf5ff',null,'gradient','plum','photo','#c084fc'],
        ['traditional','01','Heritage Paper','Noto Nastaliq Urdu','#3d2b1f','#f5ead7','solid',null,'paper','#a66a36'],
        ['traditional','02','Classic Cream','Noto Nastaliq Urdu','#2d2414','#fbf7ef','solid',null,'cream','#b77935'],
        ['modern','01','Modern White','Noto Naskh Arabic','#172a21','#ffffff','solid',null,'clean','#1c8152'],
        ['modern','02','Modern Slate','Tajawal','#f8fafc',null,'gradient','slate','photo','#cbd5e1'],
        ['pakistan','01','Pakistan Green','Noto Nastaliq Urdu','#ffffff','#01411c','solid',null,'emerald','#ffffff'],
        ['pakistan','02','Pakistan Light','Noto Naskh Arabic','#01411c','#f8fff9','solid',null,'clean','#01411c'],
        ['wedding','01','Wedding Gold','Noto Nastaliq Urdu','#5a3513','#fff8e7','solid',null,'mandala','#c28a2b'],
        ['wedding','02','Wedding Rose','Lateef','#6b243d','#fff5f7','solid',null,'botanical','#be6a88'],
        ['social-profile','01','Profile Dark','Noto Naskh Arabic','#ffffff','#172a21','solid',null,'photo','#d8f36a'],
        ['social-profile','02','Profile Clean','Noto Nastaliq Urdu','#163b2a','#eef7f1','solid',null,'clean','#177245']
    ];

    function makeTemplate(row) {
        return {
            id: 'name-' + row[0] + '-' + row[1],
            pack: row[0],
            name: row[2],
            fontFamily: row[3],
            textColor: row[4],
            attributionColor: row[4],
            textAlign: 'center',
            verticalAlign: 'center',
            fontSizeRatio: .075,
            lineHeight: row[3] === 'Noto Nastaliq Urdu' ? 1.8 : 1.55,
            background: row[6] === 'gradient' ? { type: 'gradient', gradientId: row[7] } : { type: 'solid', color: row[5] },
            decoration: { border: { enabled: row[8] !== 'clean' && row[8] !== 'photo', color: row[9] + '55' }, accent: row[9], motif: row[8] },
            watermark: { enabled: false, position: 'bottom-left' }
        };
    }

    var TEMPLATES = TEMPLATE_DATA.map(makeTemplate);
    var TRANSPARENT_TEMPLATE = {
        id: 'name-transparent-clean', pack: 'minimal', name: 'Transparent Name',
        fontFamily: 'Noto Nastaliq Urdu', textColor: '#172a21', attributionColor: '#172a21',
        textAlign: 'center', verticalAlign: 'center', fontSizeRatio: .09, lineHeight: 1.8,
        background: { type: 'solid', color: 'rgba(0,0,0,0)' },
        decoration: { border: { enabled: false, color: 'rgba(0,0,0,0)' }, accent: 'rgba(0,0,0,0)' },
        watermark: { enabled: false, position: 'bottom-left' }
    };

    function install(cardCore) {
        if (!cardCore || !Array.isArray(cardCore.PRESETS) || !Array.isArray(cardCore.TEMPLATES)) return false;
        if (!cardCore.PRESETS.some(function (preset) { return preset.id === 'name-transparent'; })) {
            cardCore.PRESETS.push({ id: 'name-transparent', name: 'Transparent Name', width: 1600, height: 900, marginX: 120, marginY: 90 });
        }
        TEMPLATES.concat([TRANSPARENT_TEMPLATE]).forEach(function (template) {
            if (!cardCore.TEMPLATES.some(function (item) { return item.id === template.id; })) cardCore.TEMPLATES.push(JSON.parse(JSON.stringify(template)));
        });
        return true;
    }

    function templatesForPack(pack) {
        return TEMPLATES.filter(function (template) { return !pack || pack === 'all' || template.pack === pack; });
    }

    function transparentState(cardCore, current) {
        install(cardCore);
        var next = JSON.parse(JSON.stringify(current || cardCore.createDefaultCardProject('')));
        next = cardCore.applyPreset(next, 'name-transparent');
        next = cardCore.applyTemplate(next, 'name-transparent-clean');
        next.background.type = 'solid';
        next.background.color = 'rgba(0,0,0,0)';
        next.background.gradientId = null;
        next.background.imageAssetId = null;
        next.background.overlayOpacity = 0;
        next.background.blur = 0;
        next.watermark = { enabled: false, position: 'bottom-left' };
        return cardCore.normalizeCardProject(next);
    }

    return {
        PACKS: PACKS,
        PRESETS: PRESETS,
        TEMPLATES: TEMPLATES,
        TRANSPARENT_TEMPLATE: TRANSPARENT_TEMPLATE,
        install: install,
        templatesForPack: templatesForPack,
        transparentState: transparentState
    };
}));
