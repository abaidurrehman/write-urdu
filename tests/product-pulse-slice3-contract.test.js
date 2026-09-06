const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const voice = read('js', 'urdu-voice-typing.js');
const growth = read('js', 'account-growth-entry.mjs');
const arbiter = read('js', 'growth-request-arbiter.mjs');

assert.match(voice, /var finalCommittedSinceStart = false;/, 'Voice route must track whether a final Urdu result was committed');
const finalIndex = voice.indexOf('transcriptTarget.insertText(text)');
const finalFlagIndex = voice.indexOf('finalCommittedSinceStart = true', finalIndex);
const endIndex = voice.indexOf('onEnd: function ()', finalFlagIndex);
const dispatchIndex = voice.indexOf("write-urdu:voice-success-idle", endIndex);
assert.ok(finalIndex >= 0 && finalFlagIndex > finalIndex, 'success state must be set only after inserting a final result');
assert.match(voice.slice(finalIndex, finalFlagIndex + 80), /\\u0600-\\u06FF/, 'Voice Keep eligibility must require Urdu script in the committed final result');
assert.ok(endIndex > finalFlagIndex && dispatchIndex > endIndex, 'Voice success must be emitted only after recognition ends');
const interimBlock = voice.slice(voice.indexOf('onInterim: function'), voice.indexOf('onFinal: function'));
assert.doesNotMatch(interimBlock, /voice-success-idle/, 'interim recognition must never trigger Keep');
const dispatchBlock = voice.slice(dispatchIndex - 140, dispatchIndex + 190);
assert.doesNotMatch(dispatchBlock, /transcript\\s*:|audio\\s*:|text\\s*:/, 'Voice success signal must carry bounded state only');

assert.match(arbiter, /keepMomentEligible: input\.keepMomentEligible === true/, 'arbiter must normalize the Voice success moment as a bounded boolean');
assert.match(arbiter, /\(substantial \|\| state\.keepMomentEligible\)/, 'bounded success moment may make Keep eligible without changing global length buckets');
assert.match(arbiter, /wu-plat-002h-s3-2026-09-06-v1/, 'Slice 3 must establish a clean growth release boundary');

assert.match(growth, /let voiceSuccessEligible = false;/, 'account-growth owner must keep local bounded Voice-success state');
assert.match(growth, /write-urdu:voice-success-idle/, 'account-growth owner must consume the post-idle success signal');
assert.match(growth, /account\.state !== ACCOUNT_STATE\.SIGNED_OUT \|\| !feature\.available/, 'Voice acquisition experiment must be signed-out only');
assert.match(growth, /growthArbiter\.update\(\{ keepEnabled: true, keepMomentEligible: true \}\)/, 'successful Voice must enable Keep only through the shared arbiter');
assert.match(growth, /const keepWins = winner === GROWTH_REQUEST\.KEEP;/, 'Voice panel must render shared-arbiter Keep rather than a second banner');
assert.match(growth, /growthArbiter\.shown\(GROWTH_REQUEST\.KEEP\)/, 'Voice Keep impressions must use shared growth measurement');
assert.match(growth, /preserveVoiceDraft\(\);[\s\S]{0,180}growthArbiter\?\.opened\(GROWTH_REQUEST\.KEEP\)/, 'opening account Keep must preserve the existing Voice draft first');
assert.match(growth, /const restoredFromAccountFlow = restoreVoiceDraft\(field\)/, 'account return must restore through the existing consume-once handoff');
assert.match(growth, /restoredFromAccountFlow && account\.state === ACCOUNT_STATE\.SIGNED_IN[\s\S]{0,120}save\.click\(\)/, 'successful account return must finish by saving restored writing');
assert.match(growth, /keepEnabled: path !== '\/tools\/urdu-voice-typing' && feature\.available/, 'Voice Keep must remain disabled at boot until real speech success');
assert.doesNotMatch(growth, /[?&](?:text|content|transcript)=/i, 'Voice account continuity must never put writing in a URL');

console.log('Product Pulse Slice 3 Voice-success Keep contracts passed.');
