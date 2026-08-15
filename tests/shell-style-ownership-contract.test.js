const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const designTokens = read('css/design-tokens.css');
const siteHeader = read('css/site-header.css');
const v2Shell = read('css/v2-shell.css');
const productionPolish = read('css/v3-production-polish.css');
const headerBootstrap = siteHeader.split('/* Shared editorial typography')[0];

assert.doesNotMatch(designTokens, /@import\s+url/, 'Design tokens must remain dependency-free and must not load production CSS');
assert.match(designTokens, /--wu-shell-header-bg:/, 'Shared header background must live in design tokens');
assert.match(designTokens, /--wu-shell-nav-text:/, 'Shared navigation text colour must live in design tokens');
assert.match(designTokens, /--wu-shell-menu-bg:/, 'Shared dropdown background must live in design tokens');

assert.match(siteHeader, /^@import\s+url\(["']\.\/design-tokens\.css["']\)/, 'Header bootstrap must consume the shared design tokens');
assert.match(headerBootstrap, /var\(--wu-shell-header-bg\)/, 'Header bootstrap must use the shared header background token');
assert.match(headerBootstrap, /var\(--wu-shell-nav-text\)/, 'Header bootstrap must use the shared navigation text token');
assert.match(headerBootstrap, /var\(--wu-shell-menu-bg\)/, 'Header bootstrap must use the shared dropdown surface token');
assert.doesNotMatch(
  headerBootstrap,
  /#eff8f2|#a9c3b3|#1b7047|#0d3523|#0b3422|rgba\(10\s*,\s*42\s*,\s*27|rgba\(239\s*,\s*248\s*,\s*242/i,
  'Header bootstrap must not carry the retired dark-header palette'
);

assert.match(v2Shell, /@import\s+url\(["']\.\/v3-design-system\.css["']\)/, 'V2 compatibility shim must load the V3 design system');
assert.match(v2Shell, /@import\s+url\(["']\.\/v3-production-polish\.css["']\)/, 'V2 compatibility shim must load production polish after the V3 system');
assert.doesNotMatch(v2Shell, /--wu-v2-shell-ink|--wu-v2-shell-bg|#0b2f1f|#072719|#0b3422|rgba\(236\s*,\s*247\s*,\s*240/i, 'V2 compatibility shim must not own a competing shell palette');

assert.doesNotMatch(productionPolish, /P0 production contrast guard|-webkit-text-fill-color/, 'Temporary incident override must be removed after fixing shell ownership');

console.log('Shared shell style-ownership contract passed.');
