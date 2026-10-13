'use strict';

// Art-direction preview: renders one or more designs with real Urdu text in their declared
// safe area, the way Card Gallery overlays text, so composition and typography can be judged
// before a design is added to the registry.
//
//   node scripts/card-art/preview.js <out-dir> <design>[:palette] [...]
//
// Requires Playwright (dev dependency) and network access for Google Fonts.

var fs = require('fs');
var path = require('path');
var specs = require('./design-specs.js');

var SAMPLES = {
    short: 'محبت روشنی ہے',
    medium: 'دل کی بات لفظوں میں ڈھلے تو\nخوشبو بن کر پھیل جاتی ہے',
    long: 'اللہ آپ کے گھر کو خوشیوں سے بھر دے\nہر صبح نئی امید لائے\nہر شام سکون دے\nاور ہر دعا قبول ہو\nآپ جہاں رہیں سلامت رہیں\nآمین'
};

async function main() {
    var out = process.argv[2];
    var targets = process.argv.slice(3);
    var playwright = require('playwright');
    fs.mkdirSync(out, { recursive: true });
    var browser = await playwright.chromium.launch();
    var page = await browser.newPage({ viewport: { width: 1640, height: 700 } });
    for (var i = 0; i < targets.length; i += 1) {
        var parts = targets[i].split(':');
        var spec = specs.find(parts[0]);
        var design = require('./designs/' + spec.module + '.js');
        var markup = design.render(1080, 1350, { palette: parts[1] || spec.palette, layout: spec.layout });
        var dataUrl = 'data:image/svg+xml;base64,' + Buffer.from(markup).toString('base64');
        var safe = spec.safeArea;
        var tiles = Object.keys(SAMPLES).map(function (key) {
            return '<div class="card"><img src="' + dataUrl + '"><div class="safe" style="top:' + safe.top * 100 + '%;right:' + safe.right * 100 + '%;bottom:' + safe.bottom * 100 + '%;left:' + safe.left * 100 + '%">' +
                '<p style="color:' + spec.textColor + ';font-family:\'' + (spec.fontFamily || 'Noto Nastaliq Urdu') + '\';line-height:' + (spec.lineHeight || 1.9) + '" class="' + key + '">' + SAMPLES[key].replace(/\n/g, '<br>') + '</p></div></div>';
        }).join('');
        await page.setContent('<!doctype html><html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Noto+Naskh+Arabic:wght@400;700&family=Gulzar&family=Amiri:wght@400;700&display=block">' +
            '<style>body{margin:0;display:flex;gap:10px;padding:10px;background:#777}.card{position:relative;width:520px;height:650px;overflow:hidden}.card img{width:100%;height:100%;display:block}' +
            '.safe{position:absolute;display:flex;align-items:center;justify-content:center;outline:1px dashed rgba(255,0,0,.0)}p{margin:0;text-align:center;direction:rtl;font-weight:700}' +
            '.short{font-size:46px}.medium{font-size:30px}.long{font-size:22px}</style></head><body>' + tiles + '</body></html>');
        await page.evaluate(function () { return document.fonts.ready; });
        await page.waitForTimeout(400);
        var file = path.join(out, parts[0] + (parts[1] ? '-' + parts[1] : '') + '.png');
        await page.screenshot({ path: file });
        console.log('preview', file, Math.round(markup.length / 1024) + 'KB svg');
    }
    await browser.close();
}

main().catch(function (error) { console.error(error); process.exit(1); });
