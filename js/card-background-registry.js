(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.WriteUrduCardBackgroundRegistry = api;
}(typeof window !== 'undefined' ? window : null, function () {
    'use strict';

    var DEFAULT_SAFE_AREA = { top: 0.16, right: 0.12, bottom: 0.16, left: 0.12 };
    var categories = [
        { id: 'all', name: 'All', nameUr: 'سب' },
        { id: 'classic', name: 'Classic', nameUr: 'کلاسیکی' },
        { id: 'pakistan', name: 'Pakistan', nameUr: 'پاکستان' },
        { id: 'truck-art', name: 'Truck Art', nameUr: 'ٹرک آرٹ' },
        { id: 'poetry', name: 'Poetry', nameUr: 'شاعری' },
        { id: 'nature', name: 'Nature', nameUr: 'قدرت' },
        { id: 'modern', name: 'Modern', nameUr: 'جدید' },
        { id: 'wedding', name: 'Wedding', nameUr: 'شادی' },
        { id: 'luxury', name: 'Luxury', nameUr: 'پُرتعیش' }
    ];

    function record(data) {
        return Object.assign({
            safeArea: DEFAULT_SAFE_AREA,
            textCapacity: 'long',
            preferredAlign: 'center',
            goodFor: ['quote', 'poetry']
        }, data);
    }

    var backgrounds = [
        record({ id: 'emerald-mughal', name: 'Emerald Mughal', nameUr: 'زمردی مغلیہ', category: 'classic', src: '/assets/card-studio/backgrounds/emerald-mughal.svg', textColor: '#fff7df', overlayColor: '#10291f', overlayOpacity: 0.08, goodFor: ['dua', 'greeting', 'quote'] }),
        record({ id: 'moonlit-lanterns', name: 'Moonlit Lanterns', nameUr: 'چاندنی رات', category: 'classic', src: '/assets/card-studio/backgrounds/moonlit-lanterns.svg', textColor: '#fff7df', overlayColor: '#071426', overlayOpacity: 0.12, goodFor: ['dua', 'greeting', 'poetry'] }),
        record({ id: 'vintage-floral', name: 'Vintage Floral', nameUr: 'پھولوں کی نزاکت', category: 'nature', src: '/assets/card-studio/backgrounds/vintage-floral.svg', textColor: '#4b2e2c', overlayColor: '#ffffff', overlayOpacity: 0, goodFor: ['poetry', 'quote', 'greeting'] }),
        record({ id: 'burgundy-arch', name: 'Burgundy Arch', nameUr: 'عنابی محراب', category: 'classic', src: '/assets/card-studio/backgrounds/burgundy-arch.svg', textColor: '#fff3d2', overlayColor: '#32101d', overlayOpacity: 0.08, goodFor: ['dua', 'greeting', 'quote'] }),
        record({ id: 'emerald-jasmine-lanterns', name: 'Emerald Jasmine', nameUr: 'زمردی چنبیلی', category: 'classic', src: '/assets/card-studio/backgrounds/emerald-jasmine-lanterns.svg', textColor: '#fff7df', overlayColor: '#062f23', overlayOpacity: 0.06, goodFor: ['dua', 'greeting', 'poetry'] }),
        record({ id: 'midnight-crescent-city', name: 'Midnight Crescent', nameUr: 'ماہتابی رات', category: 'classic', src: '/assets/card-studio/backgrounds/midnight-crescent-city.svg', textColor: '#fff4d4', overlayColor: '#071426', overlayOpacity: 0.09, goodFor: ['dua', 'poetry', 'quote'] }),
        record({ id: 'emerald-eid-lanterns', name: 'Eid Emerald', nameUr: 'عید کی زمردی روشنی', category: 'classic', src: '/assets/card-studio/backgrounds/emerald-eid-lanterns.svg', textColor: '#fff6db', overlayColor: '#06382c', overlayOpacity: 0.05, goodFor: ['dua', 'greeting'] }),
        record({ id: 'blush-rose-lanterns', name: 'Blush Rose', nameUr: 'گلابی گلزار', category: 'wedding', src: '/assets/card-studio/backgrounds/blush-rose-lanterns.svg', textColor: '#57362f', overlayColor: '#fffaf0', overlayOpacity: 0, goodFor: ['wedding', 'greeting', 'poetry'] }),
        record({ id: 'rose-garden-frame', name: 'Rose Garden', nameUr: 'باغِ گلاب', category: 'wedding', src: '/assets/card-studio/backgrounds/rose-garden-frame.svg', textColor: '#563237', overlayColor: '#fff7ef', overlayOpacity: 0, goodFor: ['wedding', 'greeting', 'poetry'] }),
        record({ id: 'heritage-mughal-garden', name: 'Heritage Garden', nameUr: 'ورثہ گلزار', category: 'pakistan', src: '/assets/card-studio/backgrounds/heritage-mughal-garden.svg', textColor: '#4c3827', overlayColor: '#fff8e7', overlayOpacity: 0, goodFor: ['heritage', 'poetry', 'quote'] }),
        record({ id: 'teal-gold-botanical', name: 'Teal & Gold', nameUr: 'فیروزی و سنہری', category: 'luxury', src: '/assets/card-studio/backgrounds/teal-gold-botanical.svg', textColor: '#fff4d2', overlayColor: '#062c3b', overlayOpacity: 0.07, goodFor: ['quote', 'greeting', 'poetry'] }),
        record({ id: 'ivory-arabesque', name: 'Ivory Arabesque', nameUr: 'عاجی نقش و نگار', category: 'classic', src: '/assets/card-studio/backgrounds/ivory-arabesque.svg', textColor: '#4e3d2b', overlayColor: '#fffaf0', overlayOpacity: 0, goodFor: ['dua', 'quote', 'poetry'] }),
        record({ id: 'ajrak-heritage', name: 'Ajrak Heritage', nameUr: 'اجرک ورثہ', category: 'pakistan', src: '/assets/card-studio/backgrounds/ajrak-heritage.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/ajrak-heritage.webp', textColor: '#1b2c3f', overlayColor: '#fff4dc', overlayOpacity: 0.04, safeArea: { top: 0.14, right: 0.16, bottom: 0.14, left: 0.16 }, goodFor: ['heritage', 'quote', 'poetry'] }),
        record({ id: 'truck-art-bloom', name: 'Truck Art Bloom', nameUr: 'ٹرک آرٹ بہار', category: 'truck-art', src: '/assets/card-studio/backgrounds/truck-art-bloom.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/truck-art-bloom.webp', textColor: '#17384a', overlayColor: '#eafffb', overlayOpacity: 0.04, safeArea: { top: 0.18, right: 0.17, bottom: 0.18, left: 0.17 }, goodFor: ['greeting', 'quote'] }),
        record({ id: 'peacock-festival', name: 'Peacock Festival', nameUr: 'مور رنگ میلہ', category: 'truck-art', src: '/assets/card-studio/backgrounds/peacock-festival.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/peacock-festival.webp', textColor: '#173b3d', overlayColor: '#fff5df', overlayOpacity: 0.04, safeArea: { top: 0.16, right: 0.12, bottom: 0.22, left: 0.22 }, goodFor: ['greeting', 'quote', 'poetry'] }),
        record({ id: 'ink-wash-poetry', name: 'Ink Wash Poetry', nameUr: 'روشنائی کی شاعری', category: 'poetry', src: '/assets/card-studio/backgrounds/ink-wash-poetry.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/ink-wash-poetry.webp', textColor: '#342b27', overlayColor: '#fff8e9', overlayOpacity: 0.02, safeArea: { top: 0.15, right: 0.14, bottom: 0.22, left: 0.14 }, goodFor: ['poetry', 'quote'] }),
        record({ id: 'moon-paper', name: 'Moon Paper', nameUr: 'مہتابی ورق', category: 'poetry', src: '/assets/card-studio/backgrounds/moon-paper.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/moon-paper.webp', textColor: '#fff2d1', overlayColor: '#071426', overlayOpacity: 0.08, safeArea: { top: 0.16, right: 0.12, bottom: 0.18, left: 0.12 }, goodFor: ['poetry', 'quote'] }),
        record({ id: 'old-lahore-journal', name: 'Old Lahore Journal', nameUr: 'پرانا لاہور', category: 'pakistan', src: '/assets/card-studio/backgrounds/old-lahore-journal.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/old-lahore-journal.webp', textColor: '#35261b', overlayColor: '#fff4dc', overlayOpacity: 0.05, safeArea: { top: 0.17, right: 0.2, bottom: 0.2, left: 0.2 }, goodFor: ['heritage', 'poetry', 'quote'] }),
        record({ id: 'moonlit-lakeside', name: 'Moonlit Lakeside', nameUr: 'چاندنی جھیل', category: 'nature', src: '/assets/card-studio/backgrounds/moonlit-lakeside.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/moonlit-lakeside.webp', textColor: '#fff7e2', overlayColor: '#071426', overlayOpacity: 0.22, safeArea: { top: 0.2, right: 0.12, bottom: 0.2, left: 0.12 }, goodFor: ['nature', 'poetry', 'quote'] }),
        record({ id: 'lantern-sunrise', name: 'Lantern Sunrise', nameUr: 'چراغوں کی صبح', category: 'nature', src: '/assets/card-studio/backgrounds/lantern-sunrise.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/lantern-sunrise.webp', textColor: '#243447', overlayColor: '#fff2df', overlayOpacity: 0.16, safeArea: { top: 0.18, right: 0.14, bottom: 0.22, left: 0.16 }, goodFor: ['nature', 'quote', 'greeting'] }),
        record({ id: 'pastel-glass', name: 'Pastel Glass', nameUr: 'نرم شفاف رنگ', category: 'modern', src: '/assets/card-studio/backgrounds/pastel-glass.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/pastel-glass.webp', textColor: '#34304d', overlayColor: '#ffffff', overlayOpacity: 0, safeArea: { top: 0.15, right: 0.14, bottom: 0.17, left: 0.14 }, goodFor: ['modern', 'quote', 'greeting'] }),
        record({ id: 'black-gold-classic', name: 'Black Gold Classic', nameUr: 'سیاہ و سنہری وقار', category: 'luxury', src: '/assets/card-studio/backgrounds/black-gold-classic.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/black-gold-classic.webp', textColor: '#f3dfac', overlayColor: '#050505', overlayOpacity: 0.04, safeArea: { top: 0.14, right: 0.13, bottom: 0.18, left: 0.13 }, goodFor: ['quote', 'poetry', 'greeting'] }),
        record({ id: 'maroon-wedding', name: 'Maroon Wedding', nameUr: 'عنابی شادی', category: 'wedding', src: '/assets/card-studio/backgrounds/maroon-wedding.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/maroon-wedding.webp', textColor: '#fff0d5', overlayColor: '#3c0710', overlayOpacity: 0.08, safeArea: { top: 0.17, right: 0.15, bottom: 0.22, left: 0.2 }, goodFor: ['wedding', 'greeting'] }),
        record({ id: 'regal-gold-arabesque', name: 'Regal Gold Arabesque', nameUr: 'شاہانہ سنہری نقش', category: 'classic', src: '/assets/card-studio/backgrounds/regal-gold-arabesque.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/regal-gold-arabesque.webp', textColor: '#f5dfad', overlayColor: '#071a14', overlayOpacity: 0.08, safeArea: { top: 0.18, right: 0.16, bottom: 0.2, left: 0.16 }, goodFor: ['dua', 'quote', 'poetry'] })
    ];

    function getBackgroundById(id) {
        return backgrounds.find(function (background) { return background.id === id; }) || null;
    }

    function filterBackgrounds(category) {
        return category === 'all' ? backgrounds.slice() : backgrounds.filter(function (background) {
            return background.category === category;
        });
    }

    return {
        backgrounds: backgrounds,
        categories: categories,
        getBackgroundById: getBackgroundById,
        filterBackgrounds: filterBackgrounds
    };
}));
