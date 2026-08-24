const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const page = read('urdu-writing-templates.html');
const urduPage = read('urdu', 'urdu-writing-templates.html');
const visualLibrary = read('urdu-templates.html');
const humanSitemap = read('write-urdu-sitemap.html');
const sitemap = read('sitemap.xml');
const redirects = read('_redirects');
const seoConfig = require(path.join(root, 'seo.config.js'));
const catalogSource = read('js', 'writing-template-catalog.js');
const appSource = read('js', 'writing-templates-runtime.js');
const app = require(path.join(root, 'js', 'writing-templates-runtime.js'));

assert.match(page, /<meta name="robots" content="index,follow,max-image-preview:large">/, 'English writing-template route must be indexable after launch');
assert.doesNotMatch(page, /noindex/i, 'English writing-template route must not regress to noindex');
assert.match(page, /<link rel="canonical" href="https:\/\/write-urdu\.com\/urdu-writing-templates">/, 'English route must self-canonicalize');
assert.match(page, /hreflang="ur" href="https:\/\/write-urdu\.com\/urdu\/urdu-writing-templates"/, 'English route must expose Urdu hreflang');
assert.match(page, /hreflang="x-default" href="https:\/\/write-urdu\.com\/urdu-writing-templates"/, 'English route must own x-default');
assert.match(page, /data-writing-template-grid/, 'Writing template grid is missing');
assert.match(page, /data-writing-template-editor/, 'Shared editable template workspace is missing');
assert.match(page, /data-writing-template-writer/, 'Use in WriteUrdu action is missing');
assert.match(page, /data-writing-template-rich/, 'Rich Editor handoff is missing');
assert.match(page, /js\/product-telemetry\.js/, 'Writing templates must load product telemetry after SEO launch');
assert.ok(page.indexOf('workspace-journey-registry.js') < page.indexOf('workspace-handoff.js'), 'Registry must load before handoff runtime');
assert.ok(page.indexOf('workspace-handoff.js') < page.indexOf('writing-template-catalog.js'), 'Handoff runtime must load before the template catalog');
assert.ok(page.indexOf('writing-template-catalog.js') < page.indexOf('writing-templates-runtime.js'), 'Reviewed catalog must load before the interaction runtime');

assert.match(urduPage, /<html lang="ur" dir="rtl">/, 'Urdu sibling must declare Urdu RTL in initial HTML');
assert.match(urduPage, /<meta name="robots" content="index,follow,max-image-preview:large">/, 'Urdu sibling must be indexable');
assert.doesNotMatch(urduPage, /noindex/i, 'Urdu sibling must not be noindex');
assert.match(urduPage, /<link rel="canonical" href="https:\/\/write-urdu\.com\/urdu\/urdu-writing-templates">/, 'Urdu sibling must self-canonicalize');
assert.match(urduPage, /hreflang="en" href="https:\/\/write-urdu\.com\/urdu-writing-templates"/, 'Urdu sibling must link back to English owner');
assert.match(urduPage, /اردو درخواستوں اور خطوط کے تیار سانچے/, 'Urdu sibling must ship reviewed Urdu H1 in initial HTML');
assert.match(urduPage, /WriteUrdu میں استعمال کریں/, 'Urdu sibling primary action must be localized');
assert.match(urduPage, /رچ ایڈیٹر میں فارمیٹ کریں/, 'Urdu sibling Rich Editor action must be localized');

assert.equal(app.TEMPLATES.length, 12, 'Phase 1 must contain exactly 12 reviewed starter templates');
assert.ok(app.TEMPLATES.every((template) => template.body.includes('[') && template.body.includes(']')), 'Every template must expose editable placeholders');
assert.ok(app.TEMPLATES.every((template) => template.titleUrdu && template.body && template.category), 'Template core fields are required');
assert.ok(app.searchTemplates('leave', 'all').length >= 2, 'English task search should find leave templates');
assert.ok(app.searchTemplates('شکایت', 'all').some((template) => template.id === 'complaint-application'), 'Urdu search should find complaint template');
assert.ok(app.searchTemplates('', 'school').every((template) => template.category === 'school'), 'Category filtering must be deterministic');
assert.ok(app.TEMPLATES.slice(0, 4).every((template) => template.body.includes('جنابِ عالی!') && template.body.includes('مودبانہ گزارش')), 'School applications must use familiar Pakistani formal application structure');
assert.ok(app.TEMPLATES.every((template) => !/ہینڈ[ -]?اوور|دوستانہ یاد دہانی/.test(template.body)), 'Reviewed templates must avoid unnecessary English-office jargon or translated marketing phrasing');
assert.match(app.getTemplate('invitation-letter').body, /دعوت دے رہے ہیں/, 'Invitation wording must be grammatically natural Urdu');
assert.doesNotMatch(page + urduPage, /No AI/, 'Public product copy should lead with user benefit, not implementation language');

assert.match(appSource, /sourceWorkspace:\s*'templates'/, 'Writing templates should reuse the existing template workspace handoff identity');
assert.match(appSource, /sourceRoute:\s*isUrduLocale\(\) \? '\/urdu\/urdu-writing-templates' : '\/urdu-writing-templates'/, 'Handoff source route must preserve locale ownership');
assert.match(appSource, /'basic-writer'/, 'Basic Writer handoff is missing');
assert.match(appSource, /'rich-editor'/, 'Rich Editor handoff is missing');
assert.match(appSource, /template_used/, 'Template selection telemetry is missing');
assert.match(appSource, /copy_completed/, 'Copy outcome telemetry is missing');
assert.match(appSource, /tool_handoff/, 'Editor handoff telemetry is missing');
assert.match(appSource, /'\/urdu\/'/, 'Urdu Basic Writer destination must remain in the Urdu locale');
assert.match(appSource, /'\/urdu\/urdu-editor'/, 'Urdu Rich Editor destination must remain in the Urdu locale');
assert.doesNotMatch(appSource, /\bfetch\s*\(/, 'Writing templates must not call an API directly');
assert.doesNotMatch(appSource + catalogSource, /env\.AI|Workers AI|indictrans|openai|anthropic/i, 'Writing templates must remain AI-free');

const englishSeo = seoConfig.byPath['/urdu-writing-templates'];
const urduSeo = seoConfig.byPath['/urdu/urdu-writing-templates'];
assert.ok(englishSeo && englishSeo.indexable, 'English writing-template SEO registry entry must be indexable');
assert.ok(urduSeo && urduSeo.indexable, 'Urdu writing-template SEO registry entry must be indexable');
assert.equal(englishSeo.lastmod, '2026-08-24', 'English launch date must be recorded');
assert.equal(urduSeo.lastmod, '2026-08-24', 'Urdu launch date must be recorded');
assert.match(sitemap, /<loc>https:\/\/write-urdu\.com\/urdu-writing-templates<\/loc>/, 'XML sitemap must include English writing templates');
assert.match(sitemap, /<loc>https:\/\/write-urdu\.com\/urdu\/urdu-writing-templates<\/loc>/, 'XML sitemap must include Urdu writing templates');
assert.match(humanSitemap, /href="\/urdu-writing-templates"/, 'Human sitemap must discover writing templates');
assert.match(visualLibrary, /href="\/urdu-writing-templates"/, 'Existing visual template library must discover writing templates');

assert.match(redirects, /\/urdu-writing-templates\.html \/urdu-writing-templates 301/, 'English HTML clean-URL redirect is missing');
assert.match(redirects, /\/urdu-writing-templates\/ \/urdu-writing-templates 301/, 'English trailing-slash normalization is missing');
assert.match(redirects, /\/urdu\/urdu-writing-templates\.html \/urdu\/urdu-writing-templates 301/, 'Urdu HTML clean-URL redirect is missing');
assert.match(redirects, /\/urdu\/urdu-writing-templates\/ \/urdu\/urdu-writing-templates 301/, 'Urdu trailing-slash normalization is missing');

console.log('Urdu Writing Templates launch contract passed.');
