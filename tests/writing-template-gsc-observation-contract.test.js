const assert = require('node:assert/strict');
const scorer = require('../scripts/analyze-writing-template-gsc.js');

const csv = [
  'Query,Clicks,Impressions,CTR,Position',
  'leave application in urdu,12,1500,0.8%,8.4',
  'urdu sick leave application,3,260,1.15%,11.2',
  'job application in urdu,2,620,0.32%,19.5',
  'resignation letter in urdu,0,140,0%,31.0',
  'complaint application in urdu,1,90,1.11%,14.0',
  'urdu invitation letter,0,40,0%,44.0',
  'application in urdu,4,520,0.77%,17.0',
  'شکایت کی درخواست,1,60,1.67%,12.0',
  'unrelated urdu typing query,200,9000,2.22%,5.0'
].join('\n');

const results = scorer.analyzeCsv(csv);
const byId = Object.fromEntries(results.map((item) => [item.id, item]));

assert.equal(results.length, 6, 'Scorer must keep the six approved template intent clusters');
assert.equal(byId['leave-application'].impressions, 1760, 'Leave variants should aggregate into one intent cluster');
assert.equal(byId['leave-application'].clicks, 15, 'Leave clicks should aggregate');
assert.equal(byId['leave-application'].recommendation, 'promotion-review', 'Strong leave demand should trigger review, not auto-publish');
assert.equal(byId['job-application'].recommendation, 'candidate', 'Moderate job demand should remain a candidate');
assert.equal(byId['resignation-letter'].recommendation, 'observe', 'Early resignation demand should remain observe');
assert.equal(byId['complaint-application'].impressions, 150, 'English and Urdu complaint variants should aggregate');
assert.equal(byId['general-application'].impressions, 520, 'Broad application intent should remain separate from specific clusters');
assert.equal(byId['invitation-letter'].recommendation, 'hold', 'Very weak invitation demand should stay on hold');
assert.ok(!results.some((item) => item.impressions >= 9000), 'Unrelated Urdu typing traffic must not contaminate template scoring');

assert.equal(scorer.findCluster('ملازمت کی درخواست').id, 'job-application');
assert.equal(scorer.findCluster('استعفیٰ').id, 'resignation-letter');
assert.equal(scorer.findCluster('شکایت کی درخواست').id, 'complaint-application');
assert.equal(scorer.findCluster('درخواست').id, 'general-application');
assert.equal(scorer.findCluster('english to urdu typing'), null);

const quoted = scorer.parseCsv('Query,Clicks,Impressions,CTR,Position\n"application, in urdu",1,100,1%,10');
assert.equal(quoted[1][0], 'application, in urdu', 'CSV parser must preserve quoted commas');

const report = scorer.markdownReport(results, 'Queries.csv');
assert.match(report, /PROMOTION REVIEW/, 'Human report should surface review triggers');
assert.match(report, /not an automatic publish decision/i, 'Report must preserve the no-thin-page governance rule');
assert.match(report, /\/urdu-writing-templates/, 'Report must require owner-route confirmation before promotion');

console.log('Urdu Writing Templates Search Console observation contract passed.');
