const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const policy = fs.readFileSync(
  path.join(root, 'docs', 'WU-MOBILE-ADSENSE-CORE-WRITE-PAGE-EXCLUSIONS-2026-08-19.md'),
  'utf8'
);

const requiredExactPageExclusions = [
  'https://write-urdu.com/',
  'https://write-urdu.com/urdu-editor',
  'https://write-urdu.com/urdu-keyboard',
  'https://write-urdu.com/urdu/',
  'https://write-urdu.com/urdu/urdu-editor',
  'https://write-urdu.com/urdu/urdu-keyboard'
];

requiredExactPageExclusions.forEach(url => {
  assert.ok(policy.includes(url), `Core Write Auto Ads exclusion policy is missing ${url}`);
});

assert.match(policy, /Page exclusions/, 'Core Write pages must use AdSense Page Exclusions');
assert.match(policy, /This page only/, 'Core Write exclusions must be exact-page rules');
assert.match(policy, /all six AdSense Page Exclusions are active/, 'Production verification must cover all localized and English core Write URLs');
assert.match(policy, /manual responsive unit|manual post-workspace placement/i, 'The controlled manual post-workspace ad must remain permitted');
assert.match(policy, /do not.*hiding already-rendered Google ad iframes or containers with CSS\/JavaScript/i, 'Do not hide rendered Auto Ads client-side as a workaround');

console.log('Core Write Auto Ads locale exclusion contract passed.');
