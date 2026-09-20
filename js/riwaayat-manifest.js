(function (root, factory) {
    'use strict';
    var api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    if (root) root.WriteUrduRiwaayatManifest = api;
}(typeof window !== 'undefined' ? window : null, function () {
    'use strict';
    // Kept byte-identical to assets/wedding-invitations/riwaayat/manifest.json by
    // tests/riwaayat-manifest-sync-contract.test.js — this file exists only because
    // browsers have no synchronous way to require() a JSON asset; Node code should
    // still prefer requiring this file (not the raw JSON) so there is one bridge point.
    return {
        "id": "riwaayat",
        "name": "Riwaayat",
        "nameUr": "روایت",
        "version": 1,
        "canvas": { "width": 1080, "height": 1350, "aspectRatio": "4:5" },
        "description": "A coordinated-but-not-identical Pakistani wedding invitation suite. Event-specific motifs change while border rhythm, spacing and print character stay related.",
        "designRules": {
            "textIsSeparateFromArtwork": true,
            "externalAssets": false,
            "safeCenterTarget": "60–70%",
            "supportsUrduEnglishBilingual": true
        },
        "variants": [
            {
                "id": "riwaayat-nikah-ivory",
                "eventTypes": ["nikah"],
                "src": "/assets/wedding-invitations/riwaayat/riwaayat-nikah-ivory.svg",
                "textColor": "#3f493d",
                "overlayColor": "#fffdf7",
                "overlayOpacity": 0,
                "safeArea": { "top": 0.17, "right": 0.16, "bottom": 0.18, "left": 0.16 },
                "mood": ["sacred", "elegant", "minimal"],
                "motifs": ["mughal-arch", "jasmine", "islamic-geometry"]
            },
            {
                "id": "riwaayat-mehndi-marigold",
                "eventTypes": ["mehndi"],
                "src": "/assets/wedding-invitations/riwaayat/riwaayat-mehndi-marigold.svg",
                "textColor": "#60333a",
                "overlayColor": "#fff8de",
                "overlayOpacity": 0,
                "safeArea": { "top": 0.20, "right": 0.16, "bottom": 0.18, "left": 0.16 },
                "mood": ["festive", "bright", "playful"],
                "motifs": ["marigold", "dholki", "gota", "garland"]
            },
            {
                "id": "riwaayat-baraat-emerald",
                "eventTypes": ["baraat"],
                "src": "/assets/wedding-invitations/riwaayat/riwaayat-baraat-emerald.svg",
                "textColor": "#fff2d0",
                "overlayColor": "#082d2b",
                "overlayOpacity": 0.02,
                "safeArea": { "top": 0.22, "right": 0.15, "bottom": 0.18, "left": 0.15 },
                "mood": ["grand", "formal", "regal"],
                "motifs": ["mughal-arch", "jali", "rose", "gold-border"]
            },
            {
                "id": "riwaayat-walima-sage",
                "eventTypes": ["walima"],
                "src": "/assets/wedding-invitations/riwaayat/riwaayat-walima-sage.svg",
                "textColor": "#4d5548",
                "overlayColor": "#fcfbf6",
                "overlayOpacity": 0,
                "safeArea": { "top": 0.20, "right": 0.16, "bottom": 0.18, "left": 0.16 },
                "mood": ["gracious", "soft", "refined"],
                "motifs": ["botanical", "blush-floral", "champagne-frame"]
            },
            {
                "id": "riwaayat-mayun-saffron",
                "eventTypes": ["mayun"],
                "src": "/assets/wedding-invitations/riwaayat/riwaayat-mayun-saffron.svg",
                "textColor": "#62402e",
                "overlayColor": "#fff7d7",
                "overlayOpacity": 0,
                "safeArea": { "top": 0.20, "right": 0.16, "bottom": 0.18, "left": 0.16 },
                "mood": ["warm", "traditional", "joyful"],
                "motifs": ["genda", "gota-mirror", "saffron"]
            },
            {
                "id": "riwaayat-dholki-fuchsia",
                "eventTypes": ["dholki"],
                "src": "/assets/wedding-invitations/riwaayat/riwaayat-dholki-fuchsia.svg",
                "textColor": "#5a3150",
                "overlayColor": "#fff8df",
                "overlayOpacity": 0,
                "safeArea": { "top": 0.20, "right": 0.16, "bottom": 0.18, "left": 0.16 },
                "mood": ["musical", "energetic", "festive"],
                "motifs": ["dholki", "string-lights", "phulkari-geometry"]
            },
            {
                "id": "riwaayat-rukhsati-dove",
                "eventTypes": ["rukhsati"],
                "src": "/assets/wedding-invitations/riwaayat/riwaayat-rukhsati-dove.svg",
                "textColor": "#3c3d4d",
                "overlayColor": "#eef0f6",
                "overlayOpacity": 0,
                "safeArea": { "top": 0.20, "right": 0.16, "bottom": 0.18, "left": 0.16 },
                "mood": ["tender", "bittersweet", "gentle"],
                "motifs": ["dove", "jasmine", "farewell-path"]
            },
            {
                "id": "riwaayat-engagement-blush",
                "eventTypes": ["engagement"],
                "src": "/assets/wedding-invitations/riwaayat/riwaayat-engagement-blush.svg",
                "textColor": "#5a3a35",
                "overlayColor": "#fdf3f1",
                "overlayOpacity": 0,
                "safeArea": { "top": 0.20, "right": 0.16, "bottom": 0.18, "left": 0.16 },
                "mood": ["elegant", "soft", "hopeful"],
                "motifs": ["ring", "rose", "champagne-frame"]
            }
        ]
    };
}));
