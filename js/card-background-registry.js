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
        { id: 'luxury', name: 'Luxury', nameUr: 'پُرتعیش' },
        { id: 'love', name: 'Love', nameUr: 'محبت' }
    ];

    function record(data) {
        return Object.assign({
            safeArea: DEFAULT_SAFE_AREA,
            textCapacity: 'long',
            preferredAlign: 'center',
            goodFor: ['quote', 'poetry']
        }, data);
    }

    // Flagship designs (WU-CARD-ART-001) lead the collection. Their artwork is generated from
    // scripts/card-art/ (one design module per family); `family` groups colourways and
    // ceremony variants of the same artistic identity.
    function flagship(data) {
        return record(Object.assign({
            src: '/assets/card-studio/backgrounds/' + data.id + '.webp',
            thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/' + data.id + '.webp',
            overlayColor: '#000000',
            overlayOpacity: 0,
            preferredAlign: 'center',
            flagship: true
        }, data));
    }

    // Earlier designs redrawn with the same generator (same IDs, so ready-made cards and saved
    // links keep working); they are family members, not separate flagships.
    function refined(data) {
        return flagship(Object.assign({ flagship: false, refined: true }, data));
    }

    var backgrounds = [
        flagship({ id: 'royal-mughal-emerald', family: 'royal-mughal', name: 'Royal Mughal', nameUr: 'شاہی مغلیہ', category: 'wedding', textColor: '#173f30', safeArea: { top: 0.36, right: 0.24, bottom: 0.17, left: 0.24 }, textCapacity: 'long', goodFor: ['wedding', 'greeting', 'dua'] }),
        flagship({ id: 'rose-garden-blush', family: 'garden-of-roses', name: 'Garden of Roses', nameUr: 'گلابوں کا باغ', category: 'love', textColor: '#5b2235', safeArea: { top: 0.33, right: 0.17, bottom: 0.31, left: 0.17 }, textCapacity: 'medium', goodFor: ['love', 'wedding', 'family'] }),
        flagship({ id: 'mehndi-marigold-festival', family: 'mehndi-festival', name: 'Mehndi Marigolds', nameUr: 'مہندی کے گیندے', category: 'wedding', textColor: '#7a1c2e', safeArea: { top: 0.36, right: 0.24, bottom: 0.16, left: 0.24 }, textCapacity: 'long', goodFor: ['wedding', 'greeting', 'social'] }),
        flagship({ id: 'moonlit-poetry-night', family: 'moonlit-poetry', name: 'Moonlit Poetry', nameUr: 'چاندنی میں شاعری', category: 'poetry', textColor: '#fdf1d8', safeArea: { top: 0.3, right: 0.13, bottom: 0.3, left: 0.13 }, textCapacity: 'long', goodFor: ['poetry', 'night', 'reflection'] }),
        flagship({ id: 'jumma-geometry-light', family: 'geometry-light', name: 'Geometry & Light', nameUr: 'نقش اور نور', category: 'classic', textColor: '#fff3d6', safeArea: { top: 0.32, right: 0.25, bottom: 0.2, left: 0.25 }, textCapacity: 'long', goodFor: ['jumma', 'dua', 'ramadan'] }),
        flagship({ id: 'phulkari-bagh-madder', family: 'phulkari', name: 'Phulkari Bagh', nameUr: 'پھلکاری باغ', category: 'pakistan', textColor: '#6b121b', safeArea: { top: 0.22, right: 0.26, bottom: 0.22, left: 0.26 }, textCapacity: 'long', goodFor: ['pakistan', 'family', 'greeting'] }),
        flagship({ id: 'manuscript-paper-ink', family: 'paper-and-ink', name: 'Manuscript Paper & Ink', nameUr: 'قلمی نسخہ', category: 'poetry', textColor: '#2b241d', safeArea: { top: 0.24, right: 0.22, bottom: 0.22, left: 0.22 }, textCapacity: 'long', goodFor: ['poetry', 'reflection', 'quote'] }),
        flagship({ id: 'rain-memory-window', family: 'rain-and-memory', name: 'Rain & Memory', nameUr: 'بارش اور یادیں', category: 'poetry', textColor: '#fff6e6', safeArea: { top: 0.22, right: 0.15, bottom: 0.36, left: 0.15 }, textCapacity: 'medium', goodFor: ['poetry', 'night', 'reflection'] }),
        flagship({ id: 'dawn-meadow-sunrise', family: 'sunrise-and-nature', name: 'Dawn Meadow', nameUr: 'صبح کا سبزہ زار', category: 'nature', textColor: '#3b3a2a', safeArea: { top: 0.3, right: 0.14, bottom: 0.4, left: 0.14 }, textCapacity: 'medium', goodFor: ['morning', 'greeting', 'nature'] }),
        flagship({ id: 'celebration-balloons', family: 'celebration', name: 'Celebration Balloons', nameUr: 'خوشیوں کے غبارے', category: 'modern', textColor: '#23305a', safeArea: { top: 0.3, right: 0.19, bottom: 0.25, left: 0.19 }, textCapacity: 'long', goodFor: ['greeting', 'family', 'friendship'] }),
        flagship({ id: 'editorial-terracotta-block', family: 'modern-editorial', name: 'Editorial Terracotta', nameUr: 'جدید ادارتی', category: 'modern', textColor: '#1f2a44', safeArea: { top: 0.28, right: 0.1, bottom: 0.14, left: 0.4 }, textCapacity: 'long', goodFor: ['social', 'quote', 'modern'] }),
        record({ id: 'emerald-mughal', name: 'Emerald Mughal', nameUr: 'زمردی مغلیہ', category: 'classic', src: '/assets/card-studio/backgrounds/emerald-mughal.svg', textColor: '#fff7df', overlayColor: '#10291f', overlayOpacity: 0.08, goodFor: ['dua', 'greeting', 'quote'] }),
        record({ id: 'moonlit-lanterns', name: 'Moonlit Lanterns', nameUr: 'چاندنی رات', category: 'classic', src: '/assets/card-studio/backgrounds/moonlit-lanterns.svg', textColor: '#fff7df', overlayColor: '#071426', overlayOpacity: 0.12, safeArea: { top: 0.14, right: 0.12, bottom: 0.46, left: 0.12 }, goodFor: ['dua', 'greeting', 'poetry'] }),
        record({ id: 'vintage-floral', name: 'Vintage Floral', nameUr: 'پھولوں کی نزاکت', category: 'nature', src: '/assets/card-studio/backgrounds/vintage-floral.svg', textColor: '#4b2e2c', overlayColor: '#ffffff', overlayOpacity: 0, goodFor: ['poetry', 'quote', 'greeting'] }),
        record({ id: 'burgundy-arch', name: 'Burgundy Arch', nameUr: 'عنابی محراب', category: 'classic', src: '/assets/card-studio/backgrounds/burgundy-arch.svg', textColor: '#fff3d2', overlayColor: '#32101d', overlayOpacity: 0.08, goodFor: ['dua', 'greeting', 'quote'] }),
        record({ id: 'emerald-jasmine-lanterns', name: 'Emerald Jasmine', nameUr: 'زمردی چنبیلی', category: 'classic', src: '/assets/card-studio/backgrounds/emerald-jasmine-lanterns.svg', textColor: '#fff7df', overlayColor: '#062f23', overlayOpacity: 0.06, goodFor: ['dua', 'greeting', 'poetry'] }),
        record({ id: 'midnight-crescent-city', name: 'Midnight Crescent', nameUr: 'ماہتابی رات', category: 'classic', src: '/assets/card-studio/backgrounds/midnight-crescent-city.svg', textColor: '#fff4d4', overlayColor: '#071426', overlayOpacity: 0.09, safeArea: { top: 0.16, right: 0.12, bottom: 0.46, left: 0.12 }, goodFor: ['dua', 'poetry', 'quote'] }),
        record({ id: 'emerald-eid-lanterns', name: 'Eid Emerald', nameUr: 'عید کی زمردی روشنی', category: 'classic', src: '/assets/card-studio/backgrounds/emerald-eid-lanterns.svg', textColor: '#fff6db', overlayColor: '#06382c', overlayOpacity: 0.05, goodFor: ['dua', 'greeting'] }),
        record({ id: 'blush-rose-lanterns', name: 'Blush Rose', nameUr: 'گلابی گلزار', category: 'wedding', src: '/assets/card-studio/backgrounds/blush-rose-lanterns.svg', textColor: '#57362f', overlayColor: '#fffaf0', overlayOpacity: 0, goodFor: ['wedding', 'greeting', 'poetry'] }),
        record({ id: 'rose-garden-frame', name: 'Rose Garden', nameUr: 'باغِ گلاب', category: 'wedding', src: '/assets/card-studio/backgrounds/rose-garden-frame.svg', textColor: '#563237', overlayColor: '#fff7ef', overlayOpacity: 0, goodFor: ['wedding', 'greeting', 'poetry'] }),
        record({ id: 'heritage-mughal-garden', name: 'Heritage Garden', nameUr: 'ورثہ گلزار', category: 'pakistan', src: '/assets/card-studio/backgrounds/heritage-mughal-garden.svg', textColor: '#4c3827', overlayColor: '#fff8e7', overlayOpacity: 0, safeArea: { top: 0.2, right: 0.12, bottom: 0.38, left: 0.12 }, goodFor: ['heritage', 'poetry', 'quote'] }),
        record({ id: 'teal-gold-botanical', name: 'Teal & Gold', nameUr: 'فیروزی و سنہری', category: 'luxury', src: '/assets/card-studio/backgrounds/teal-gold-botanical.svg', textColor: '#fff4d2', overlayColor: '#062c3b', overlayOpacity: 0.07, goodFor: ['quote', 'greeting', 'poetry'] }),
        record({ id: 'ivory-arabesque', name: 'Ivory Arabesque', nameUr: 'عاجی نقش و نگار', category: 'classic', src: '/assets/card-studio/backgrounds/ivory-arabesque.svg', textColor: '#4e3d2b', overlayColor: '#fffaf0', overlayOpacity: 0, goodFor: ['dua', 'quote', 'poetry'] }),
        record({ id: 'ajrak-heritage', name: 'Ajrak Heritage', nameUr: 'اجرک ورثہ', category: 'pakistan', src: '/assets/card-studio/backgrounds/ajrak-heritage.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/ajrak-heritage.webp', textColor: '#1b2c3f', overlayColor: '#fff4dc', overlayOpacity: 0.04, safeArea: { top: 0.14, right: 0.16, bottom: 0.14, left: 0.16 }, goodFor: ['heritage', 'quote', 'poetry'] }),
        record({ id: 'truck-art-bloom', name: 'Truck Art Bloom', nameUr: 'ٹرک آرٹ بہار', category: 'truck-art', src: '/assets/card-studio/backgrounds/truck-art-bloom.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/truck-art-bloom.webp', textColor: '#17384a', overlayColor: '#eafffb', overlayOpacity: 0.04, safeArea: { top: 0.18, right: 0.17, bottom: 0.18, left: 0.17 }, goodFor: ['greeting', 'quote'] }),
        record({ id: 'peacock-festival', name: 'Peacock Festival', nameUr: 'مور رنگ میلہ', category: 'truck-art', src: '/assets/card-studio/backgrounds/peacock-festival.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/peacock-festival.webp', textColor: '#173b3d', overlayColor: '#fff5df', overlayOpacity: 0.04, safeArea: { top: 0.16, right: 0.12, bottom: 0.22, left: 0.22 }, goodFor: ['greeting', 'quote', 'poetry'] }),
        record({ id: 'ink-wash-poetry', name: 'Ink Wash Poetry', nameUr: 'روشنائی کی شاعری', category: 'poetry', src: '/assets/card-studio/backgrounds/ink-wash-poetry.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/ink-wash-poetry.webp', textColor: '#342b27', overlayColor: '#fff8e9', overlayOpacity: 0.02, safeArea: { top: 0.15, right: 0.14, bottom: 0.22, left: 0.14 }, goodFor: ['poetry', 'quote'] }),
        record({ id: 'moon-paper', name: 'Moon Paper', nameUr: 'مہتابی ورق', category: 'poetry', src: '/assets/card-studio/backgrounds/moon-paper.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/moon-paper.webp', textColor: '#fff2d1', overlayColor: '#071426', overlayOpacity: 0.08, safeArea: { top: 0.16, right: 0.12, bottom: 0.18, left: 0.12 }, goodFor: ['poetry', 'quote'] }),
        record({ id: 'old-lahore-journal', name: 'Old Lahore Journal', nameUr: 'پرانا لاہور', category: 'pakistan', src: '/assets/card-studio/backgrounds/old-lahore-journal.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/old-lahore-journal.webp', textColor: '#35261b', overlayColor: '#fff4dc', overlayOpacity: 0.05, safeArea: { top: 0.17, right: 0.2, bottom: 0.2, left: 0.2 }, goodFor: ['heritage', 'poetry', 'quote'] }),
        record({ id: 'moonlit-lakeside', name: 'Moonlit Lakeside', nameUr: 'چاندنی جھیل', category: 'nature', src: '/assets/card-studio/backgrounds/moonlit-lakeside.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/moonlit-lakeside.webp', textColor: '#fff7e2', overlayColor: '#071426', overlayOpacity: 0.22, safeArea: { top: 0.2, right: 0.12, bottom: 0.2, left: 0.12 }, goodFor: ['nature', 'poetry', 'quote'] }),
        record({ id: 'lantern-sunrise', name: 'Lantern Sunrise', nameUr: 'چراغوں کی صبح', category: 'nature', src: '/assets/card-studio/backgrounds/lantern-sunrise.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/lantern-sunrise.webp', textColor: '#243447', attributionColor: '#141e2a', overlayColor: '#fff2df', overlayOpacity: 0.16, safeArea: { top: 0.18, right: 0.14, bottom: 0.22, left: 0.16 }, goodFor: ['nature', 'quote', 'greeting'] }),
        record({ id: 'pastel-glass', name: 'Pastel Glass', nameUr: 'نرم شفاف رنگ', category: 'modern', src: '/assets/card-studio/backgrounds/pastel-glass.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/pastel-glass.webp', textColor: '#34304d', overlayColor: '#ffffff', overlayOpacity: 0, safeArea: { top: 0.15, right: 0.14, bottom: 0.17, left: 0.14 }, goodFor: ['modern', 'quote', 'greeting'] }),
        record({ id: 'black-gold-classic', name: 'Black Gold Classic', nameUr: 'سیاہ و سنہری وقار', category: 'luxury', src: '/assets/card-studio/backgrounds/black-gold-classic.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/black-gold-classic.webp', textColor: '#f3dfac', overlayColor: '#050505', overlayOpacity: 0.04, safeArea: { top: 0.14, right: 0.13, bottom: 0.18, left: 0.13 }, goodFor: ['quote', 'poetry', 'greeting'] }),
        record({ id: 'maroon-wedding', name: 'Maroon Wedding', nameUr: 'عنابی شادی', category: 'wedding', src: '/assets/card-studio/backgrounds/maroon-wedding.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/maroon-wedding.webp', textColor: '#fff0d5', overlayColor: '#3c0710', overlayOpacity: 0.08, safeArea: { top: 0.17, right: 0.15, bottom: 0.22, left: 0.2 }, goodFor: ['wedding', 'greeting'] }),
        record({ id: 'regal-gold-arabesque', name: 'Regal Gold Arabesque', nameUr: 'شاہانہ سنہری نقش', category: 'classic', src: '/assets/card-studio/backgrounds/regal-gold-arabesque.webp', thumbnailSrc: '/assets/card-studio/backgrounds/thumbs/regal-gold-arabesque.webp', textColor: '#f5dfad', overlayColor: '#071a14', overlayOpacity: 0.08, safeArea: { top: 0.18, right: 0.16, bottom: 0.2, left: 0.16 }, goodFor: ['dua', 'quote', 'poetry'] }),
        refined({ id: 'soft-sunrise-garden', family: 'sunrise-and-nature', name: 'Soft Sunrise Garden', nameUr: 'صبح کا نرم گلزار', category: 'nature', textColor: '#344b42', safeArea: { top: 0.3, right: 0.2, bottom: 0.4, left: 0.2 }, textCapacity: 'long', goodFor: ['morning', 'dua', 'reflection', 'greeting'] }),
        refined({ id: 'window-light-tea', family: 'home-window', name: 'Window Light & Tea', nameUr: 'کھڑکی کی روشنی', category: 'nature', textColor: '#4b3a2d', safeArea: { top: 0.33, right: 0.14, bottom: 0.27, left: 0.14 }, textCapacity: 'long', goodFor: ['morning', 'family', 'reflection', 'greeting'] }),
        refined({ id: 'quiet-moon-sky', family: 'ink-wash', name: 'Quiet Moon Sky', nameUr: 'پرسکون چاندنی رات', category: 'nature', textColor: '#fff4d4', safeArea: { top: 0.32, right: 0.14, bottom: 0.26, left: 0.14 }, textCapacity: 'medium', goodFor: ['night', 'dua', 'reflection', 'poetry'] }),
        refined({ id: 'rainy-window-reflection', family: 'rain-and-memory', name: 'Rainy Window Reflection', nameUr: 'بارش بھری کھڑکی', category: 'modern', textColor: '#fff8e8', safeArea: { top: 0.22, right: 0.15, bottom: 0.36, left: 0.15 }, textCapacity: 'medium', goodFor: ['night', 'reflection', 'poetry'] }),
        refined({ id: 'jumma-ivory-geometry', family: 'geometry-light', name: 'Jumma Ivory Geometry', nameUr: 'جمعہ عاجی نقش', category: 'classic', textColor: '#214f40', safeArea: { top: 0.32, right: 0.25, bottom: 0.2, left: 0.25 }, textCapacity: 'long', goodFor: ['jumma', 'dua', 'reflection', 'greeting'] }),
        refined({ id: 'jumma-midnight-silhouette', family: 'crescent', name: 'Jumma Midnight Silhouette', nameUr: 'جمعہ کی ماہتابی رات', category: 'classic', textColor: '#fff0ba', safeArea: { top: 0.22, right: 0.2, bottom: 0.42, left: 0.2 }, textCapacity: 'medium', goodFor: ['jumma', 'dua', 'night', 'reflection'] }),
        refined({ id: 'emerald-prayer-light', family: 'geometry-light', name: 'Emerald Prayer Light', nameUr: 'زمردی دعائیہ روشنی', category: 'classic', textColor: '#fff2c7', safeArea: { top: 0.32, right: 0.25, bottom: 0.2, left: 0.25 }, textCapacity: 'long', goodFor: ['dua', 'jumma', 'reflection', 'greeting'] }),
        refined({ id: 'warm-paper-reflection', family: 'stationery', name: 'Warm Paper Reflection', nameUr: 'گرم کاغذی خیال', category: 'poetry', textColor: '#3e2f1f', safeArea: { top: 0.24, right: 0.18, bottom: 0.26, left: 0.2 }, textCapacity: 'long', goodFor: ['reflection', 'dua', 'poetry', 'family'] }),
        refined({ id: 'minimal-cream-poetry', family: 'stationery', name: 'Minimal Cream Poetry', nameUr: 'سادہ عاجی شاعری', category: 'poetry', textColor: '#3c3324', safeArea: { top: 0.24, right: 0.16, bottom: 0.24, left: 0.16 }, textCapacity: 'long', goodFor: ['poetry', 'reflection', 'quote', 'self-respect'] }),
        refined({ id: 'ink-moon-poetry', family: 'ink-wash', name: 'Ink & Moon Poetry', nameUr: 'روشنائی و ماہتاب', category: 'poetry', textColor: '#2c2a24', safeArea: { top: 0.3, right: 0.14, bottom: 0.32, left: 0.14 }, textCapacity: 'medium', goodFor: ['poetry', 'night', 'reflection'] }),
        refined({ id: 'rose-mist-affection', family: 'garden-of-roses', name: 'Rose Mist Affection', nameUr: 'گلابی دھند محبت', category: 'love', textColor: '#5a2f36', safeArea: { top: 0.34, right: 0.16, bottom: 0.26, left: 0.18 }, textCapacity: 'medium', goodFor: ['love', 'family', 'greeting'] }),
        refined({ id: 'quiet-blue-distance', family: 'ink-wash', name: 'Quiet Blue Distance', nameUr: 'خاموش نیلا فاصلہ', category: 'nature', textColor: '#14263a', attributionColor: '#0a1522', safeArea: { top: 0.38, right: 0.14, bottom: 0.36, left: 0.14 }, textCapacity: 'medium', goodFor: ['poetry', 'reflection', 'night'] }),
        refined({ id: 'self-respect-black-sand', family: 'modern-shapes', name: 'Self-Respect Black & Sand', nameUr: 'خودداری سیاہ و ریتیلا', category: 'modern', textColor: '#efdfba', safeArea: { top: 0.2, right: 0.16, bottom: 0.4, left: 0.12 }, textCapacity: 'medium', goodFor: ['self-respect', 'reflection', 'quote'] }),
        refined({ id: 'friendship-bright-modern', family: 'modern-shapes', name: 'Friendship Bright Modern', nameUr: 'دوستی روشن و جدید', category: 'modern', textColor: '#2f3a56', safeArea: { top: 0.26, right: 0.17, bottom: 0.24, left: 0.17 }, textCapacity: 'medium', goodFor: ['friendship', 'greeting', 'social'] }),
        refined({ id: 'family-warm-interior', family: 'home-window', name: 'Family Warm Interior', nameUr: 'گھر کی گرم فضا', category: 'nature', textColor: '#4a2a1a', safeArea: { top: 0.33, right: 0.22, bottom: 0.27, left: 0.22 }, textCapacity: 'long', goodFor: ['family', 'friendship', 'reflection'] }),
        refined({ id: 'ajrak-modern-frame', family: 'ajrak', name: 'Ajrak Modern Frame', nameUr: 'اجرک جدید فریم', category: 'pakistan', textColor: '#fdf6e3', safeArea: { top: 0.2, right: 0.24, bottom: 0.2, left: 0.24 }, textCapacity: 'medium', goodFor: ['pakistan', 'quote', 'poetry'] }),
        refined({ id: 'truck-art-modern-bloom', family: 'truck-art', name: 'Truck Art Modern Bloom', nameUr: 'ٹرک آرٹ جدید بہار', category: 'truck-art', textColor: '#17384a', safeArea: { top: 0.3, right: 0.22, bottom: 0.3, left: 0.22 }, textCapacity: 'medium', goodFor: ['social', 'greeting', 'quote'] }),
        refined({ id: 'ramadan-lantern-night', family: 'crescent', name: 'Ramadan Lantern Night', nameUr: 'رمضان کی راتیں', category: 'classic', textColor: '#fff3d2', safeArea: { top: 0.34, right: 0.14, bottom: 0.16, left: 0.14 }, textCapacity: 'medium', goodFor: ['ramadan', 'dua', 'night', 'reflection'] }),
        refined({ id: 'eid-morning-gold', family: 'crescent', name: 'Eid Morning Gold', nameUr: 'عید کی سنہری صبح', category: 'classic', textColor: '#2f4a3a', safeArea: { top: 0.3, right: 0.14, bottom: 0.2, left: 0.14 }, textCapacity: 'long', goodFor: ['eid', 'greeting', 'family'] }),
        refined({ id: 'pakistan-green-heritage', family: 'crescent', name: 'Pakistan Green Heritage', nameUr: 'پاکستان سبز ورثہ', category: 'pakistan', textColor: '#fdf8e8', safeArea: { top: 0.3, right: 0.14, bottom: 0.16, left: 0.26 }, textCapacity: 'medium', goodFor: ['pakistan', 'heritage', 'quote'] })
    ];

    function getBackgroundById(id) {
        return backgrounds.find(function (background) { return background.id === id; }) || null;
    }

    function getAllBackgrounds() {
        return backgrounds.slice();
    }

    function getBackgroundCategories() {
        return categories.slice();
    }

    function filterBackgrounds(category) {
        return category === 'all' ? backgrounds.slice() : backgrounds.filter(function (background) {
            return background.category === category;
        });
    }

    return {
        backgrounds: backgrounds,
        categories: categories,
        getAllBackgrounds: getAllBackgrounds,
        getBackgroundCategories: getBackgroundCategories,
        getBackgroundById: getBackgroundById,
        filterBackgrounds: filterBackgrounds
    };
}));
