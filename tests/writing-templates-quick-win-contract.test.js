const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const page = read('urdu-writing-templates.html');
const visualLibrary = read('urdu-templates.html');
const redirects = read('_redirects');
const catalogSource = read('js', 'writing-template-catalog.js');
const appSource = read('js', 'writing-templates-runtime.js');
const app = require(path.join(root, 'js', 'writing-templates-runtime.js'));

assert.match(page, /<meta name="robots" content="noindex,follow">/, 'Quick-win route must stay noindex until content/SEO promotion');
assert.match(page, /data-writing-template-grid/, 'Writing template grid is missing');
assert.match(page, /data-writing-template-editor/, 'Shared editable template workspace is missing');
assert.match(page, /data-writing-template-writer/, 'Use in WriteUrdu action is missing');
assert.match(page, /data-writing-template-rich/, 'Rich Editor handoff is missing');
assert.ok(page.indexOf('workspace-journey-registry.js') < page.indexOf('workspace-handoff.js'), 'Registry must load before handoff runtime');
assert.ok(page.indexOf('workspace-handoff.js') < page.indexOf('writing-template-catalog.js'), 'Handoff runtime must load before the template catalog');
assert.ok(page.indexOf('writing-template-catalog.js') < page.indexOf('writing-templates-runtime.js'), 'Reviewed catalog must load before the interaction runtime');

assert.equal(app.TEMPLATES.length, 12, 'Phase 1 must contain exactly 12 reviewed starter templates');
assert.ok(app.TEMPLATES.every((template) => template.body.includes('[') && template.body.includes(']')), 'Every template must expose editable placeholders');
assert.ok(app.TEMPLATES.every((template) => template.titleUrdu && template.body && template.category), 'Template core fields are required');
assert.ok(app.searchTemplates('leave', 'all').length >= 2, 'English task search should find leave templates');
assert.ok(app.searchTemplates('شکایت', 'all').some((template) => template.id === 'complaint-application'), 'Urdu search should find complaint template');
assert.ok(app.searchTemplates('', 'school').every((template) => template.category === 'school'), 'Category filtering must be deterministic');
assert.ok(app.TEMPLATES.slice(0, 4).every((template) => template.body.includes('جنابِ عالی!') && template.body.includes('مودبانہ گزارش')), 'School applications must use familiar Pakistani formal application structure');
assert.ok(app.TEMPLATES.every((template) => !/ہینڈ[ -]?اوور|دوستانہ یاد دہانی/.test(template.body)), 'Reviewed templates must avoid unnecessary English-office jargon or translated marketing phrasing');
assert.match(app.getTemplate('invitation-letter').body, /دعوت دے رہے ہیں/, 'Invitation wording must be grammatically natural Urdu');
assert.doesNotMatch(page, /No AI/, 'Public product copy should lead with user benefit, not implementation language');

assert.match(appSource, /sourceWorkspace:\s*'templates'/, 'Quick-win should reuse the existing template workspace handoff identity');
assert.match(appSource, /targetWorkspace:\s*targetWorkspace/, 'Shared handoff target is missing');
assert.match(appSource, /'basic-writer'/, 'Basic Writer handoff is missing');
assert.match(appSource, /'rich-editor'/, 'Rich Editor handoff is missing');
assert.doesNotMatch(appSource, /\bfetch\s*\(/, 'Writing templates must not call an API');
assert.doesNotMatch(appSource + catalogSource, /env\.AI|Workers AI|indictrans|openai|anthropic/i, 'Writing templates must remain AI-free');

assert.match(visualLibrary, /href="\/urdu-writing-templates"/, 'Existing visual template library must discover writing templates');
assert.match(redirects, /\/urdu-writing-templates\.html \/urdu-writing-templates 301/, 'HTML clean-URL redirect is missing');
assert.match(redirects, /\/urdu-writing-templates\/ \/urdu-writing-templates 301/, 'Trailing-slash normalization is missing');

console.log('Urdu Writing Templates quick-win contract passed.');
