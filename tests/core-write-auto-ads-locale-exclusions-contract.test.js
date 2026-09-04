const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const policy = fs.readFileSync(
  path.join(root, 'docs', 'WU-MOBILE-ADSENSE-CORE-WRITE-PAGE-EXCLUSIONS-2026-08-19.md'),
  'utf8'
);

assert.match(policy, /Core Write pages must remain monetized/i, 'Core Write pages must not be treated as routinely ad-free');
assert.match(policy, /Page Exclusions are \*\*not\*\* the desired steady-state strategy/i, 'Whole-page Auto Ads exclusion must not be the steady-state policy');
assert.match(policy, /Side rail position:\*\* \*\*Left and right\*\*/i, 'Desktop side rails must be configured left and right');
assert.match(policy, /Anchor position:\*\* \*\*Bottom only\*\*/i, 'Mobile anchors must be bottom-only');
assert.match(policy, /Excluded areas/i, 'Protected authoring regions must use AdSense Excluded areas when in-page Auto Ads remain enabled');
assert.match(policy, /Banner Auto Ads:\*\* OFF/i, 'Conservative core writer policy should disable automatic in-page banners');
assert.match(policy, /Multiplex Auto Ads:\*\* OFF/i, 'Core writing flow must not use Multiplex Auto Ads');
assert.match(policy, /manual responsive unit after the active workspace/i, 'Controlled manual post-workspace monetization must remain');
assert.match(policy, /no ad may appear between\/inside TinyMCE toolbar and editable document canvas/i, 'Rich Editor must remain a protected authoring zone');
assert.match(policy, /Repeat on `\/urdu\/`, `\/urdu\/urdu-editor` and `\/urdu\/urdu-keyboard`/, 'Localized writer variants need the same production verification');
assert.match(policy, /do not.*hiding already-rendered Google ad iframes or containers with CSS\/JavaScript/i, 'Do not hide rendered Auto Ads client-side as a workaround');

console.log('Core Write protected-zone monetization contract passed.');
