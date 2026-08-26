const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const seo = require('../seo.config.js');
const { buildGraph, applyStaticSeoGraph } = require('../scripts/static-seo-graph.js');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const page = route => seo.byPath[route];
const types = graph => graph['@graph'].map(node => node['@type']);
const nodes = (graph, type) => graph['@graph'].filter(node => node['@type'] === type);

const home = buildGraph(page('/'), read('index.html'));
assert.deepStrictEqual(types(home).slice(0, 3), ['WebSite', 'Organization', 'WebPage'], 'Homepage must start with stable site/publisher/page identities');
assert.ok(types(home).includes('WebApplication'), 'Homepage must expose WebApplication statically');
assert.strictEqual(nodes(home, 'WebPage')[0]['@id'], 'https://write-urdu.com/#webpage', 'Homepage WebPage identity changed');
assert.strictEqual(nodes(home, 'WebApplication')[0].inLanguage, 'en', 'English application schema must declare English');

const keyboardHtml = read('urdu-keyboard.html');
const keyboard = buildGraph(page('/urdu-keyboard'), keyboardHtml);
assert.ok(types(keyboard).includes('WebApplication'), 'Urdu Keyboard must expose WebApplication');
assert.ok(types(keyboard).includes('FAQPage'), 'Urdu Keyboard must expose FAQPage from visible FAQ content');
const keyboardFaq = nodes(keyboard, 'FAQPage')[0];
assert.ok(keyboardFaq.mainEntity.length >= 1, 'Urdu Keyboard FAQ schema must contain visible questions');
for (const entity of keyboardFaq.mainEntity) {
  assert.ok(keyboardHtml.includes(entity.name), 'FAQ schema question must be sourced from visible page text');
  assert.ok(entity.acceptedAnswer.text.length > 0, 'FAQ schema answer must not be empty');
}

const docs = buildGraph(page('/write-urdu-documentation'), read('write-urdu-documentation.html'));
assert.ok(types(docs).includes('Article'), 'Documentation must expose Article statically');
assert.ok(types(docs).includes('HowTo'), 'Documentation must expose HowTo statically');
assert.strictEqual(nodes(docs, 'HowTo')[0].step.length, 4, 'Documentation HowTo workflow must retain four truthful steps');

const photo = buildGraph(page('/how-to-write-urdu-on-photo'), read('how-to-write-urdu-on-photo.html'));
assert.ok(types(photo).includes('Article'), 'Photo guide must expose Article statically');

const templates = buildGraph(page('/urdu-templates'), read('urdu-templates.html'));
assert.ok(types(templates).includes('CollectionPage'), 'Urdu Templates must expose CollectionPage');
assert.ok(types(templates).includes('ItemList'), 'Urdu Templates must expose ItemList from the shared template catalogue');
const templateList = nodes(templates, 'ItemList')[0];
assert.ok(templateList.numberOfItems >= 20, 'Template ItemList unexpectedly lost catalogue entries');
assert.strictEqual(templateList.numberOfItems, templateList.itemListElement.length, 'Template ItemList count must match catalogue items');

const writingTemplates = buildGraph(page('/urdu-writing-templates'), read('urdu-writing-templates.html'));
assert.ok(types(writingTemplates).includes('CollectionPage'), 'Writing Templates must expose CollectionPage');
assert.strictEqual(nodes(writingTemplates, 'ItemList')[0].numberOfItems, 12, 'Writing Templates ItemList must use the 12-item product catalogue');
assert.strictEqual(nodes(writingTemplates, 'WebApplication')[0].inLanguage, 'en', 'Writing Templates application schema language must stay English');

const about = buildGraph(page('/why-write-urdu'), read('why-write-urdu.html'));
assert.ok(types(about).includes('AboutPage'), 'About route must use AboutPage identity');
assert.ok(types(about).includes('BreadcrumbList'), 'About route must expose breadcrumb semantics');

const rendered = applyStaticSeoGraph(read('urdu-keyboard.html'), page('/urdu-keyboard'));
assert.strictEqual((rendered.match(/data-write-urdu-schema/g) || []).length, 1, 'Static graph application must be idempotent and own exactly one schema tag');
const renderedTwice = applyStaticSeoGraph(rendered, page('/urdu-keyboard'));
assert.strictEqual((renderedTwice.match(/data-write-urdu-schema/g) || []).length, 1, 'Second graph application must not duplicate schema');

const instagramRendered = applyStaticSeoGraph(read('urdu-instagram-post-maker.html'), page('/urdu-instagram-post-maker'));
assert.strictEqual((instagramRendered.match(/type="application\/ld\+json"/g) || []).length, 1, 'Governed Instagram WebApplication schema must not coexist with a legacy duplicate block');
assert.strictEqual(nodes(buildGraph(page('/urdu-instagram-post-maker'), instagramRendered), 'WebApplication')[0].applicationCategory, 'DesignApplication', 'Instagram maker must retain design application semantics');

const runtime = read('js/seo.js');
assert.match(runtime, /!document\.head\.querySelector\('script\[data-write-urdu-schema\]'\)/, 'Runtime SEO must detect the static owned graph before attempting dynamic schema');

const urduGenerator = read('scripts/generate-urdu-locale.js');
assert.match(urduGenerator, /data-write-urdu-schema/, 'Urdu generator must explicitly strip inherited English static schema');
const urduHome = read('urdu/index.html');
assert.match(urduHome, /data-wu-urdu-schema/, 'Existing Urdu static schema must remain present');
assert.doesNotMatch(urduHome, /data-write-urdu-schema/, 'Generated Urdu source must not carry the English owned schema graph');
assert.match(urduHome, /"inLanguage":"ur"/, 'Existing Urdu graph must remain Urdu-language schema');

console.log('Static SEO graph foundation contracts passed.');
