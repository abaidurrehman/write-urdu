'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const templateLibrary = require('../js/template-library-core.js');
const writingTemplates = require('../js/writing-template-catalog.js');
const {
  applyStaticCollectionContent,
  representativeStylishItems
} = require('../scripts/static-collection-content.js');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const renderedTemplates = applyStaticCollectionContent(read('urdu-templates.html'), '/urdu-templates');
assert.strictEqual(templateLibrary.TEMPLATES.length, 46, 'Design template catalogue count changed unexpectedly');
assert.strictEqual((renderedTemplates.match(/data-wu-static-catalogue-item/g) || []).length, 46, 'Source-visible design catalogue must contain all 46 templates');
for (const sample of ['Quiet Morning Verse', 'Eid Mubarak Garden', 'Business Announcement', 'Wedding Invitation']) {
  assert.ok(renderedTemplates.includes(sample), 'Design template source must expose ' + sample);
}
assert.ok(renderedTemplates.includes('Edit in Card Studio'), 'Static design cards must expose the real editing action');
assert.ok(!/data-template-skeleton[^>]*>[^<]*Loading templates/i.test(renderedTemplates), 'Static design catalogue must not depend on loading copy');

const renderedWriting = applyStaticCollectionContent(read('urdu-writing-templates.html'), '/urdu-writing-templates');
assert.strictEqual(writingTemplates.length, 12, 'Writing template catalogue must remain the reviewed 12 jobs');
assert.strictEqual((renderedWriting.match(/data-wu-static-catalogue-item/g) || []).length, 12, 'English writing page must source-render all 12 catalogue cards');
for (const template of writingTemplates) {
  assert.ok(renderedWriting.includes(template.title), 'English writing source must include ' + template.title);
  assert.ok(renderedWriting.includes(template.titleUrdu), 'English writing source must include Urdu title ' + template.titleUrdu);
}

const renderedUrduWriting = applyStaticCollectionContent(read('urdu/urdu-writing-templates.html'), '/urdu/urdu-writing-templates');
assert.strictEqual((renderedUrduWriting.match(/data-wu-static-catalogue-item/g) || []).length, 12, 'Urdu writing page must source-render all 12 catalogue cards');
for (const template of writingTemplates) assert.ok(renderedUrduWriting.includes(template.titleUrdu), 'Urdu writing source must include ' + template.titleUrdu);
assert.ok(renderedUrduWriting.includes('یہ سانچہ استعمال کریں'), 'Urdu static catalogue action must remain localized');

const stylishItems = representativeStylishItems();
assert.strictEqual(stylishItems.length, 10, 'Stylish Urdu source examples must stay bounded to 10 representative styles');
const renderedStylish = applyStaticCollectionContent(read('stylish-urdu-text-generator.html'), '/stylish-urdu-text-generator');
assert.strictEqual((renderedStylish.match(/data-wu-static-catalogue-item/g) || []).length, 10, 'Stylish Urdu source must expose 10 representative examples');
assert.ok(renderedStylish.includes('آپ کا اردو نام'), 'Stylish Urdu source examples must contain representative Urdu text');
assert.ok(renderedStylish.includes('representative styles'), 'Stylish source count must explain that examples are representative');

const designRuntime = read('js/template-library.js');
assert.match(designRuntime, /grid\.replaceChildren\(\)/, 'Design runtime must replace the static catalogue before rendering filtered state');
const writingRuntime = read('js/writing-templates-runtime.js');
assert.match(writingRuntime, /grid\.replaceChildren\(\)/, 'Writing runtime must replace the static catalogue before rendering filtered state');
const stylishRuntime = read('js/stylish-urdu-text.js');
assert.match(stylishRuntime, /if \(reset\) grid\.innerHTML = ''/, 'Stylish runtime must clear static examples before personalized output');

console.log('Static collection content foundation contracts passed.');
