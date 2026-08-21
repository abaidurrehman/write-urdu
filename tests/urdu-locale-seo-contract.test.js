const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const result = spawnSync(process.execPath, ['scripts/check-urdu-locale-seo.js'], { cwd: root, encoding: 'utf8' });
assert.strictEqual(result.status, 0, result.stderr || result.stdout || 'Urdu locale SEO checker failed');
console.log('Urdu locale SEO contract passed.');
