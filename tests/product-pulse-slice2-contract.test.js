const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const growth = read('js/growth-request-arbiter.mjs');
const account = read('js/account-growth-entry.mjs');
const community = read('js/community-publishing-ui.mjs');
const telemetry = read('js/product-telemetry.js');
const events = read('functions/api/events.js');
const pulse = read('functions/api/internal/product-pulse.js');
const html = read('os/product-pulse.html');
const client = read('js/product-pulse.js');
const migration = read('migrations/0020_growth_request_arbiter.sql');

assert.ok(growth.includes('return growthRequestDecision(input).winner'), 'public arbiter decision must return one enum winner');
assert.ok(growth.includes('if (keep) winner = GROWTH_REQUEST.KEEP'), 'Keep must be highest priority');
assert.ok(growth.includes('else if (share) winner = GROWTH_REQUEST.SHARE'), 'Share must be second priority');
assert.ok(growth.includes('else if (community) winner = GROWTH_REQUEST.COMMUNITY_PUBLISH'), 'Community Publish must be third priority');

assert.ok(account.includes('WriteUrduGrowthRequestArbiter = growthArbiter'), 'account-growth entry must be the one runtime owner');
assert.ok(account.includes("keepEnabled: path !== '/tools/urdu-voice-typing'"), 'Slice 2 must not pre-empt the Slice 3 Voice Keep experiment');
assert.ok(account.includes('Create a free account to keep this writing'), 'signed-out Keep may use acquisition copy');
assert.ok(account.includes("signedIn ? 'Save this writing in My Documents"), 'signed-in Keep copy must not ask the user to create an account');
assert.ok(account.includes('showSignedInSaveUtility = signedIn && feature.available && hasText'), 'Voice save utility must survive Slice 2 arbitration');

assert.ok(community.includes("owner.current() === 'community_publish'"), 'Community promotion must render only when it wins arbitration');
assert.ok(community.includes('toolbarButton.hidden = !wins || promptEligible'), 'Community must expose only one promoted control at a time');
assert.ok(community.includes('owner.update({ communityEligible: familyEligible })'), 'Community must pass only bounded eligibility into the shared owner');

assert.ok(telemetry.includes('request_family'), 'client telemetry must carry bounded request family');
assert.ok(telemetry.includes('growth_stage'), 'client telemetry must carry bounded growth stage');
assert.ok(telemetry.includes('growth_release_marker'), 'client telemetry must carry Slice 2 release marker');

assert.ok(events.includes('GROWTH_REQUEST_FAMILIES = new Set'), 'server must bound growth request families');
assert.ok(events.includes('GROWTH_STAGES = new Set'), 'server must bound growth stages');
assert.ok(events.includes('growth_hourly_requests'), 'Slice 2 must use aggregate same-D1 rollups');
assert.ok(!events.includes('INSERT INTO product_events'), 'Slice 2 must not restore raw event writes');
assert.ok(!events.includes('INSERT OR IGNORE INTO product_events'), 'Slice 2 must not restore raw event writes');

assert.ok(!/^\s*(text|content|transcript|audio|filename|document_id|share_id|email|account_id)\s+/im.test(migration), 'growth rollup must not declare content or identity columns');

assert.ok(pulse.includes('function growthRequestSection('), 'Product Pulse must expose growth arbitration diagnostics');
assert.ok(pulse.includes('growth_hourly_requests'), 'Product Pulse must read aggregate growth rollups');
assert.ok(html.includes('id="growthRequestPanel"'), 'Founder dashboard must render Slice 2 panel');
assert.ok(client.includes('function renderGrowthRequests('), 'dashboard client must render growth request diagnostics');

console.log('Product Pulse Slice 2 growth-arbiter contracts passed.');
