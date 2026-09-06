import assert from 'node:assert/strict';
import { GROWTH_REQUEST, decideGrowthRequest, growthRequestDecision, writerStateFromLength, createGrowthRequestArbiter } from '../js/growth-request-arbiter.mjs';

const base = { ready: true, writerState: 'E0', accountState: 'signed-out', signedIn: false, safelySaved: false, localProtected: false, meaningfulOutcome: false, communityEligible: false, keepEnabled: true, shareEnabled: true, communityEnabled: true };
const winner = (patch) => decideGrowthRequest({ ...base, ...patch });

assert.equal(writerStateFromLength(0), 'E0');
assert.equal(writerStateFromLength(50), 'E1');
assert.equal(writerStateFromLength(250), 'E2');
assert.equal(writerStateFromLength(700), 'E3');
assert.equal(writerStateFromLength(1200), 'E4');
assert.equal(writerStateFromLength(20, true), 'E5');
assert.equal(writerStateFromLength(0, true), 'E0', 'empty writing must never become E5');

assert.equal(winner({ writerState: 'E0' }), GROWTH_REQUEST.NONE);
assert.equal(winner({ writerState: 'E2' }), GROWTH_REQUEST.NONE);
assert.equal(winner({ writerState: 'E3' }), GROWTH_REQUEST.KEEP, 'substantial unsaved work must protect recovery first');
assert.equal(winner({ writerState: 'E4', accountState: 'signed-in', signedIn: true, safelySaved: true, communityEligible: true }), GROWTH_REQUEST.COMMUNITY_PUBLISH, 'saved signed-in long form can promote Community Publish');
assert.equal(winner({ writerState: 'E5', meaningfulOutcome: true, localProtected: false, communityEligible: true }), GROWTH_REQUEST.KEEP, 'unprotected completed work keeps recovery priority');
assert.equal(winner({ writerState: 'E5', meaningfulOutcome: true, localProtected: true, communityEligible: true }), GROWTH_REQUEST.SHARE, 'safely retained completed work promotes Share before Community Publish');
assert.equal(winner({ writerState: 'E4', keepEnabled: false, communityEligible: false }), GROWTH_REQUEST.NONE, 'Voice Keep can stay disabled until Slice 3');

const multi = growthRequestDecision({ ...base, writerState: 'E5', meaningfulOutcome: true, localProtected: true, safelySaved: true, communityEligible: true, signedIn: true, accountState: 'signed-in' });
assert.equal(multi.winner, GROWTH_REQUEST.SHARE);
assert.deepEqual(multi.suppressed, [GROWTH_REQUEST.COMMUNITY_PUBLISH]);

const events = [];
const arbiter = createGrowthRequestArbiter({ workspace: 'rich-editor', telemetry: (name, detail) => events.push({ name, detail }) });
arbiter.update({ ...base, ready: true, writerState: 'E5', signedIn: true, accountState: 'signed-in', safelySaved: true, localProtected: true, meaningfulOutcome: true, communityEligible: true });
assert.equal(arbiter.current(), GROWTH_REQUEST.SHARE);
assert.ok(events.some((event) => event.detail.growth_stage === 'suppressed_due_to_arbitration' && event.detail.request_family === 'community_publish' && event.detail.suppression_winner === 'share'));
assert.ok(events.every((event) => !('text' in event.detail) && !('content' in event.detail)), 'arbiter telemetry must be bounded state only');
console.log('Growth request arbiter decision matrix passed.');
