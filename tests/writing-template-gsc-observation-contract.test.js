const assert = require('node:assert/strict');
const scorer = require('../scripts/analyze-writing-template-gsc.js');

const csv = [
  'Query,Clicks,Impressions,CTR,Position',
  'leave application in urdu,12,1500,0.8%,8.4',
  'urdu sick leave application,3,260,1.15%,11.2',
  'job application in urdu,2,620,0.32%,19.5',
  'fee concession application in urdu,0,80,0%,16.0',
  'فیس میں رعایت کی درخواست,1,35,2.86%,15.0',
  'resignation letter in urdu,0,140,0%,31.0',
  'complaint application in urdu,1,90,1.11%,14.0',
  'urdu invitation letter,0,40,0%,44.0',
  'application in urdu,4,520,0.77%,17.0',
  'شکایت کی درخواست,1,60,1.67%,12.0',
  'unrelated urdu typing query,200,9000,2.22%,5.0'
].join('\n');

const results = scorer.analyzeCsv(csv);
const byId = Object.fromEntries(results.map((item) => [item.id, item]));

assert.equal(results.length, 7, 'Scorer must keep the governed priority plus long-tail template intent clusters');
assert.equal(byId['leave-application'].impressions, 1760, 'Leave variants should aggregate into one intent cluster');
assert.equal(byId['leave-application'].clicks, 15, 'Leave clicks should aggregate');
assert.equal(byId['leave-application'].recommendation, 'promotion-review', 'Strong leave demand should trigger review, not auto-publish');
assert.deepEqual(byId['leave-application'].promotionReasons.sort(), ['click-proof', 'near-win']);
assert.equal(byId['job-application'].recommendation, 'promotion-review', 'A 100+ impression position-4-to-20 near-win should trigger promotion review');
assert.equal(byId['fee-concession'].impressions, 115, 'English and Urdu fee-concession variants should aggregate');
assert.equal(byId['fee-concession'].recommendation, 'promotion-review', 'Fee concession should trigger the near-win gate when position is strong enough');
assert.equal(byId['resignation-letter'].recommendation, 'candidate', 'Demand outside the near-win position band should remain a candidate');
assert.equal(byId['complaint-application'].impressions, 150, 'English and Urdu complaint variants should aggregate');
assert.equal(byId['complaint-application'].recommendation, 'promotion-review', 'Complaint should trigger review when weighted position is a near-win');
assert.equal(byId['general-application'].impressions, 520, 'Broad application intent should remain separate from specific clusters');
assert.equal(byId['general-application'].recommendation, 'promotion-review', 'Broad application demand can trigger review but still requires a distinct-job decision');
assert.equal(byId['invitation-letter'].recommendation, 'candidate', 'Long-tail invitation demand can be watched without pre-approving a page');
assert.ok(!results.some((item) => item.impressions >= 9000), 'Unrelated Urdu typing traffic must not contaminate template scoring');

assert.equal(scorer.findCluster('ملازمت کی درخواست').id, 'job-application');
assert.equal(scorer.findCluster('فیس معافی کی درخواست').id, 'fee-concession');
assert.equal(scorer.findCluster('استعفیٰ').id, 'resignation-letter');
assert.equal(scorer.findCluster('شکایت کی درخواست').id, 'complaint-application');
assert.equal(scorer.findCluster('درخواست').id, 'general-application');
assert.equal(scorer.findCluster('english to urdu typing'), null);

assert.deepEqual(scorer.promotionReasons({ impressions: 100, clicks: 0, position: 20 }), ['near-win']);
assert.deepEqual(scorer.promotionReasons({ impressions: 25, clicks: 3, position: 50 }), ['click-proof']);
assert.deepEqual(scorer.promotionReasons({ impressions: 24, clicks: 2, position: 10 }), [], 'Thresholds must not drift below the canonical plan');

const quoted = scorer.parseCsv('Query,Clicks,Impressions,CTR,Position\n"application, in urdu",1,100,1%,10');
assert.equal(quoted[1][0], 'application, in urdu', 'CSV parser must preserve quoted commas');

const report = scorer.markdownReport(results, 'Queries.csv');
assert.match(report, /PROMOTION REVIEW/, 'Human report should surface review triggers');
assert.match(report, /not an automatic publish decision/i, 'Report must preserve the no-thin-page governance rule');
assert.match(report, /7-day breakout-growth gate/i, 'Single query exports must not pretend to evaluate growth breakout');
assert.match(report, /\/urdu-writing-templates/, 'Report must require owner-route confirmation before promotion');

console.log('Urdu Writing Templates Search Console observation contract passed.');
