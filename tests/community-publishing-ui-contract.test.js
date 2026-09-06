const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const community = read('js', 'community-publishing-ui.mjs');
const accountGrowth = read('js', 'account-growth-entry.mjs');

assert.match(community, /function growthArbiter\(\)/, 'Community publishing must obtain the shared growth-request owner');
assert.match(community, /runtime\.WriteUrduGrowthRequestArbiter/, 'Community publishing must reuse the shared owner rather than create a second arbiter');
assert.match(community, /owner\.update\(\{ communityEligible: familyEligible \}\)/, 'Community publishing must send only bounded eligibility into the owner');
assert.match(community, /owner\.current\(\) === 'community_publish'/, 'Community promotion must render only when Community Publish wins arbitration');
assert.match(community, /toolbarButton\.hidden = !wins \|\| promptEligible/, 'Toolbar promotion must not compete with the automatic Community prompt');
assert.match(community, /growthArbiter\(\)\?\.opened\('community_publish'\)/, 'Opening Community Publish must be measured through the shared owner');
assert.match(community, /growthArbiter\(\)\?\.completed\('community_publish'\)/, 'Completed Community Publish must be measured through the shared owner');
assert.match(accountGrowth, /WriteUrduGrowthRequestArbiter = growthArbiter/, 'Account/Share entry controller must remain the single runtime arbiter owner');

console.log('Community publishing Slice 2 arbitration UI contract passed.');
