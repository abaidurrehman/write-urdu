'use strict';

// Builds the generated card backgrounds listed in scripts/card-art/design-specs.js.
//
//   node scripts/card-art/build.js            # every design
//   node scripts/card-art/build.js <id> ...   # selected designs
//
// Each design is rendered from its SVG source in Chromium (Playwright, a dev dependency) and
// written as the full 1080x1350 WebP plus the 320x400 gallery thumbnail, exactly the asset
// pair the shared background registry expects. Rasterising here (instead of shipping the SVG)
// keeps texture filters out of every visitor's render path and makes gallery tiles, Card
// Studio and exports all start from the same pixels.

var fs = require('fs');
var path = require('path');
var specs = require('./design-specs.js');

var ROOT = path.resolve(__dirname, '..', '..');
var OUT = path.join(ROOT, 'assets', 'card-studio', 'backgrounds');
var WIDTH = 1080;
var HEIGHT = 1350;

async function rasterise(page, markup, width, height, quality) {
    var dataUrl = 'data:image/svg+xml;base64,' + Buffer.from(markup).toString('base64');
    var encoded = await page.evaluate(function (args) {
        return new Promise(function (resolve, reject) {
            var image = new Image();
            image.onload = function () {
                var canvas = document.createElement('canvas');
                canvas.width = args.width;
                canvas.height = args.height;
                var context = canvas.getContext('2d');
                context.imageSmoothingQuality = 'high';
                context.drawImage(image, 0, 0, args.width, args.height);
                resolve(canvas.toDataURL('image/webp', args.quality));
            };
            image.onerror = function () { reject(new Error('SVG failed to load')); };
            image.src = args.src;
        });
    }, { src: dataUrl, width: width, height: height, quality: quality });
    return Buffer.from(encoded.split(',')[1], 'base64');
}

async function main() {
    var wanted = process.argv.slice(2);
    var list = specs.designs.filter(function (spec) { return !wanted.length || wanted.indexOf(spec.id) !== -1; });
    if (!list.length) throw new Error('No matching designs');
    var playwright = require('playwright');
    var browser = await playwright.chromium.launch();
    var page = await browser.newPage();
    await page.setContent('<!doctype html><title>card-art</title>');
    fs.mkdirSync(path.join(OUT, 'thumbs'), { recursive: true });
    for (var i = 0; i < list.length; i += 1) {
        var spec = list[i];
        var design = require('./designs/' + spec.module + '.js');
        var markup = design.render(WIDTH, HEIGHT, { palette: spec.palette });
        var full = await rasterise(page, markup, WIDTH, HEIGHT, spec.quality || 0.86);
        var thumb = await rasterise(page, markup, 320, 400, 0.84);
        fs.writeFileSync(path.join(OUT, spec.id + '.webp'), full);
        fs.writeFileSync(path.join(OUT, 'thumbs', spec.id + '.webp'), thumb);
        console.log(spec.id, Math.round(full.length / 1024) + 'KB', 'thumb ' + Math.round(thumb.length / 1024) + 'KB');
    }
    await browser.close();
}

main().catch(function (error) { console.error(error); process.exit(1); });
