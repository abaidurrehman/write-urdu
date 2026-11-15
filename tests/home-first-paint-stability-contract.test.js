const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Homepage first-paint stability (2026-10-18). The Basic Writer used to paint
// a legacy layout first and then let runtime-injected stylesheets and the
// command-toolbar rebuild move the editor by up to ~900px (lab CLS 1.4 on
// phones, 0.46 on desktop). The page now ships the final shell styles and
// body markers statically and keeps the legacy toolbar out of the layout,
// reserving the command surface's height, until the surface is built.

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

for (const page of ['index.html', path.join('urdu', 'index.html')]) {
  const html = read(page);
  const head = html.slice(0, html.indexOf('</head>'));

  assert.match(html, /<body class="wu-v2-shell" data-wu-core-workspace="basic">/, `${page}: shell body markers must be present at first paint`);
  assert.match(html, /<h1 class="wu-page-title"/, `${page}: the H1 must carry its final title class at first paint`);
  // basic-account-documents.mjs turns the hero into a two-column grid (reserving the
  // account card's column) about 2s after load in production; ship that layout statically.
  assert.match(html, /<div class="row home-account-hero-layout">\s*<div class="col-sm home-account-hero-copy"/, `${page}: the hero must use its final account layout at first paint`);
  assert.ok(html.slice(0, html.indexOf('</head>')).includes('<link href="/css/account-documents.css" rel="stylesheet" type="text/css" />'), `${page}: account-documents.css must be linked with the exact href site-header.js checks`);
  assert.match(html, /class="page-intro answer-summary wu-page-subtitle"/, `${page}: the lede must carry its final subtitle class at first paint`);

  // Each static link carries the attribute its runtime injector checks, so no stylesheet is added twice.
  const links = [
    ['/css/v2-shell.css', 'data-write-urdu-v2-shell'],
    ['/css/core-workspace-convergence.css', 'data-wu-core-convergence-style'],
    ['/css/basic-writer-command-toolbar.css', 'data-wu-basic-command-toolbar-style'],
    ['/css/basic-writer-export-priority.css', 'data-wu-basic-export-priority-style']
  ];
  let previous = -1;
  for (const [href, attribute] of links) {
    const index = head.indexOf(`<link href="${href}" rel="stylesheet" type="text/css" ${attribute} />`);
    assert.ok(index > previous, `${page}: ${href} must be linked in <head>, in runtime order, with ${attribute}`);
    previous = index;
  }

  const pending = head.match(/<script>\(function\(d\)\{[^<]*wu-basic-toolbar-pending[^<]*<\/script>/);
  assert.ok(pending, `${page}: the pending class must be set by an inline head script`);
  assert.match(pending[0], /addEventListener\('load',function\(\)\{window\.setTimeout\(done,3000\)/, `${page}: a failed toolbar must reveal the legacy controls shortly after load`);
  assert.match(pending[0], /addEventListener\('DOMContentLoaded',function\(\)\{window\.setTimeout\(done,30000\)/, `${page}: the legacy controls must return even if load never fires`);
  assert.ok(head.indexOf(pending[0]) < head.indexOf('/css/basic-writer-command-toolbar.css'), `${page}: the pending class must exist before the toolbar stylesheet applies`);
}

const css = read('css', 'basic-writer-command-toolbar.css');
assert.match(css, /html\.wu-basic-toolbar-pending body:not\(\[data-wu-basic-command-toolbar\]\) \.container:has\(> \.row > \.home-actions\),\s*html\.wu-basic-toolbar-pending body:not\(\[data-wu-basic-command-toolbar\]\) \.editor-chrome \{\s*display: none !important;/, 'Legacy controls must stay out of the layout only while the toolbar is pending');
assert.match(css, /html\.wu-basic-toolbar-pending body:not\(\[data-wu-basic-command-toolbar\]\) #demo \{\s*margin-top: var\(--wu-basic-surface-reserve, 0px\) !important;/, 'The editor must keep the command surface\'s space while pending');
for (const reserve of ['90px', '148px', '134px']) {
  assert.match(css, new RegExp(`--wu-basic-surface-reserve: ${reserve};`), `Measured surface reserve ${reserve} is missing`);
}

const toolbar = read('js', 'basic-writer-command-toolbar.js');
assert.match(toolbar, /demo\.parentNode\.insertBefore\(surface, demo\);[\s\S]{0,200}root\.document\.body\.setAttribute\('data-wu-basic-command-toolbar', 'true'\);/, 'The toolbar must mark the body built in the same task that inserts the surface, or the editor jumps');
assert.match(toolbar, /link\[data-wu-basic-command-toolbar-style\]/, 'Toolbar must skip injecting a stylesheet that is already linked');
assert.match(read('js', 'v2-shell.js'), /link\[href\$="css\/v2-shell\.css"\]/, 'Shell must skip injecting a stylesheet that is already linked');
assert.match(read('js', 'core-workspace-convergence.js'), /link\[data-wu-core-convergence-style\]/, 'Convergence must skip injecting a stylesheet that is already linked');
assert.match(read('js', 'basic-writer-export-priority.js'), /link\[data-wu-basic-export-priority-style\]/, 'Export priority must skip injecting a stylesheet that is already linked');

console.log('Homepage first-paint stability contract passed.');
