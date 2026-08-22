const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const home = read('index.html');
const keyboard = read('urdu-keyboard.html');
const seoConfig = require(path.join(root, 'seo.config.js'));
const experimentLog = read('docs/SEO-SERP-EXPERIMENTS.csv');
const baseline = read('docs/WU-SEO-CTR-001-BASELINE-2026-08-22.md');
const queryTracking = read('docs/SEO-QUERY-TRACKING.csv');

assert.strictEqual(seoConfig.byPath['/'].searchTitle, 'English to Urdu Typing Online | WriteUrdu', 'PR 1 must keep the homepage search title frozen');
assert.match(home, /mera khayal hai\s*→\s*میرا خیال ہے/, 'Homepage must show a concrete English-letter to Urdu-script result beside the editor');
assert.match(home, /Type Urdu words using English letters and press Space after each word/i, 'Homepage proof must explain the user action in plain language');

assert.match(keyboard, /Type Urdu directly—no installation required/, 'Keyboard must retain its direct-input promise');
assert.doesNotMatch(keyboard, /Roman Urdu words convert when you press Space/i, 'Keyboard instructions must not present English-letter conversion as a primary behavior');
assert.doesNotMatch(keyboard, />Roman Urdu editor<\/a>/i, 'Keyboard links back to the homepage must use the measured acquisition language');
assert.ok((keyboard.match(/<a href="\/">English to Urdu typing<\/a>/g) || []).length >= 3, 'Keyboard must use descriptive links for the secondary English-letter workflow');

const expectedColumns = 'change_id,status,recorded_date,deployed_at,deployed_sha,page,changed_variable,previous_value,new_value,hypothesis,target_query,baseline_window,observation_window,outcome,decision,notes';
assert.strictEqual(experimentLog.split(/\r?\n/, 1)[0], expectedColumns, 'SERP experiment log must preserve the evidence and decision fields');
assert.match(experimentLog, /WU-SEO-CTR-001-P1-HOME-PROOF/, 'Homepage proof change must be recorded before deployment');
assert.match(experimentLog, /metadata remains frozen|not a title or description experiment/i, 'PR 1 log must distinguish foundation work from a SERP metadata experiment');

assert.match(baseline, /Search Console URL Inspection and dated export evidence pending/i, 'Baseline must disclose missing external evidence');
assert.match(baseline, /Homepage metadata remains frozen/i, 'Baseline must block an early title or description experiment');
for (const query of ['english to urdu typing', 'urdu typing', 'urdu writing', 'urdu typing online', 'urdu keyboard online']) {
  assert.match(queryTracking, new RegExp(`Google,${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')},`, 'i'), `Query tracking must include ${query}`);
}

console.log('SERP CTR and intent optimization contract passed.');
