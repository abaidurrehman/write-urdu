'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const seo = require('../seo.config.js');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function sourceFile(page) {
  if (page.path === '/') return 'index.html';
  const legacy = (page.legacyPaths || []).find(candidate => /\.html$/i.test(candidate));
  return legacy ? legacy.replace(/^\//, '') : page.path.replace(/^\//, '') + '.html';
}

function decode(value) {
  return String(value || '')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function text(value) {
  return decode(String(value || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function attr(html, tagPattern, name) {
  const tag = (html.match(tagPattern) || [])[0] || '';
  const match = tag.match(new RegExp('\\b' + name + '=(["\'])([\\s\\S]*?)\\1', 'i'));
  return match ? decode(match[2]).trim() : '';
}

const indexable = seo.pages.filter(page => page.indexable);
assert.ok(indexable.length >= 30, 'Epic registry should retain the full indexable public route set');

for (const page of indexable) {
  const file = sourceFile(page);
  assert.ok(fs.existsSync(path.join(root, file)), `${page.path}: expected source file ${file}`);
  const html = read(file);
  const expectedCanonical = seo.canonical(page.path);
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const h1Match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const description = attr(html, /<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i, 'content');
  const canonical = attr(html, /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i, 'href');

  assert.ok(titleMatch && text(titleMatch[1]), `${page.path}: initial HTML must contain a non-empty title`);
  assert.ok(description, `${page.path}: initial HTML must contain a meta description`);
  assert.strictEqual(canonical, expectedCanonical, `${page.path}: canonical must remain ${expectedCanonical}`);
  assert.ok(h1Match && text(h1Match[1]), `${page.path}: initial HTML must contain a non-empty H1`);
  assert.ok(html.includes('data-wu-static-shell="nav"'), `${page.path}: crawl-important navigation must be source-visible`);
  assert.ok(html.includes('data-wu-static-shell="footer"'), `${page.path}: crawl-important footer must be source-visible`);
  assert.ok(html.includes('data-write-urdu-schema'), `${page.path}: structured data must be source-visible`);
}

const homepage = read('index.html');
assert.match(homepage, /<title>English to Urdu Typing Online \| WriteUrdu<\/title>/,
  'Homepage search title ownership must not change during crawlability work');
assert.match(homepage, /<h1[^>]*>English to Urdu Typing Online<\/h1>/,
  'Homepage H1 ownership must not change during crawlability work');
assert.match(homepage, /<meta name="description" content="English to Urdu typing online\./,
  'Homepage search description must retain simple English-to-Urdu intent language');

const templates = read('urdu-templates.html');
assert.strictEqual((templates.match(/data-wu-static-catalogue-item/g) || []).length, 46,
  'Design template catalogue must expose all 46 source-visible items');
assert.ok(templates.includes('Quiet Morning Verse') && templates.includes('Wedding Invitation'),
  'Design catalogue must expose representative named items without JavaScript');

const writing = read('urdu-writing-templates.html');
assert.strictEqual((writing.match(/data-wu-static-catalogue-item/g) || []).length, 12,
  'Writing template catalogue must expose all 12 source-visible jobs');
assert.ok(writing.includes('School sick leave application') && writing.includes('درخواست برائے رخصتِ بیماری'),
  'Writing catalogue must expose English and Urdu item names');

const urduWriting = read('urdu/urdu-writing-templates.html');
assert.strictEqual((urduWriting.match(/data-wu-static-catalogue-item/g) || []).length, 12,
  'Urdu writing-template sibling must expose the same 12-item catalogue');
assert.ok(urduWriting.includes('یہ سانچہ استعمال کریں'), 'Urdu source catalogue actions must remain localized');

const stylish = read('stylish-urdu-text-generator.html');
assert.strictEqual((stylish.match(/data-wu-static-catalogue-item/g) || []).length, 10,
  'Stylish Urdu must expose a bounded 10-example source catalogue');
assert.ok(stylish.includes('Popular 1') && stylish.includes('آپ کا اردو نام'),
  'Stylish Urdu source must contain unique representative family examples');

const searchPage = read('write-urdu-search.html');
const feedbackPage = read('feedback.html');
for (const [name, html] of [['Search', searchPage], ['Feedback', feedbackPage]]) {
  assert.match(html, /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex\s*,\s*follow/i,
    `${name} must remain noindex,follow`);
}

const sitemap = read('sitemap.xml');
assert.ok(!sitemap.includes('<loc>https://write-urdu.com/write-urdu-search</loc>'), 'Search must remain outside XML sitemap');
assert.ok(!sitemap.includes('<loc>https://write-urdu.com/feedback</loc>'), 'Feedback must remain outside XML sitemap');

const instagramConfig = seo.pages.find(page => page.id === 'urdu-instagram-post-maker');
assert.ok(instagramConfig && !/safe[- ]area/i.test(instagramConfig.description || ''),
  'SEO registry must not reintroduce safe-area implementation jargon into Instagram copy');

console.log(`Public source crawlability closeout checks passed for ${indexable.length} indexable routes.`);
