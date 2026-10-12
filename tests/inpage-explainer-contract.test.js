const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'tools/inpage-unicode-converter.html'), 'utf8');
const core = require(path.join(root, 'js/inpage-unicode-core.js'));

// The explainer is server-delivered, not injected by JavaScript.
assert.match(html, /<h3>Why older InPage text looks like symbols<\/h3>/, 'InPage explainer heading must be in the source HTML');
assert.match(html, /Converting it to Unicode turns those symbols back into Urdu/, 'InPage explainer must say what conversion achieves');

// The example must be real engine output, not hand-typed.
const figure = html.match(/<figure class="inpage-example" data-inpage-example>([\s\S]*?)<\/figure>/);
assert.ok(figure, 'InPage example figure must be present');
const sample = 'یہ ایک اردو متن ہے۔';
assert.ok(figure[1].includes('<p lang="ur" dir="rtl">' + sample + '</p>'), 'example must show the Unicode sentence');
const shown = figure[1].match(/<p class="inpage-legacy-example"[^>]*>([^<]*)<\/p>/);
assert.ok(shown, 'example must show the older InPage appearance');
const expected = core.encodeUnicodeText(sample).text.split('\u0004').join('').replace(/\u0081/g, '').replace(/ /g, ' ');
assert.strictEqual(shown[1], expected, 'older InPage example must match the conversion engine output');
assert.strictEqual(core.decodeLegacyText(core.encodeUnicodeText(sample).text).text, sample, 'example sentence must round-trip');
assert.ok(!/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/.test(html), 'page source must not contain control characters');

// Structured data advertises capabilities that the page states.
const graph = JSON.parse(html.match(/<script type="application\/ld\+json" data-write-urdu-schema>([\s\S]*?)<\/script>/)[1])['@graph'];
const app = graph.find(node => node['@type'] === 'WebApplication');
assert.ok(app && app.featureList.length >= 3, 'WebApplication featureList must be populated');
assert.ok(app.featureList.some(item => /Unicode Urdu to InPage/i.test(item)), 'featureList must mention Unicode to InPage');

// Existing limits and FAQ stay intact; privacy wording is intentionally unchanged.
assert.match(html, /handles pasted text only, so page layout and complete <code>\.inp<\/code> documents are not included/, '.inp limitation must remain');
assert.match(html, /<summary>Does WriteUrdu upload my text\?<\/summary><p>Your pasted text is used for the conversion\./, 'privacy FAQ wording is an owner decision and must not change here');

console.log('inpage explainer contract passed');
