const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const registry = read('specs', 'README.md');
const backlog = read('specs', 'BACKLOG.md');
const activation = read('specs', 'WU-PLAT-002H-core-activation-feature-discovery.md');
const checklist = read('specs', 'WU-PLAT-002H-IMPLEMENTATION-CHECKLIST.md');
const metrics = read('specs', 'WU-PLAT-002H-METRICS-CONTRACT.md');
const states = read('specs', 'WU-PLAT-002H-UX-STATE-MATRIX.md');
const acceptance = read('specs', 'WU-PLAT-002H-ACCEPTANCE-SCENARIOS.md');
const decisions = read('specs', 'WU-PLAT-002H-DECISION-LOG.md');
const freeze = read('specs', 'WU-PLAT-002H-SCOPE-FREEZE.md');
const toolbar = read('specs', 'WU-PLAT-004-basic-writer-command-toolbar.md');
const growth = read('specs', 'WU-GROWTH-002-account-save-share-entry-points.md');
const referral = read('specs', 'WU-SHARE-001R-recipient-start-continuity.md');
const evidence = read('docs', 'WU-CORE-ACTIVATION-EVIDENCE-2026-08-30.md');
const guardrails = read('docs', 'WU-CORE-ACTIVATION-IMPLEMENTATION-GUARDRAILS.md');

assert.match(registry, /`WU-PLAT-002H` \| Core Activation & Feature Discovery Acceptance/, 'Registry must identify the core activation P0 contract');
assert.match(registry, /`WU-SHARE-001R` \| Recipient Start Continuity/, 'Registry must include the recipient-continuity child');
assert.match(backlog, /P0\.1 — Core Activation & Feature Discovery/, 'Core activation must be the first product/UX P0 item');
assert.match(backlog, /Do not start another major unrelated feature/i, 'Backlog must preserve the activation roadmap gate');
assert.match(backlog, /P0\.2 — Mature-domain growth baseline and authority\/revenue map/, 'AdSense/revenue baseline must continue in parallel');

assert.match(activation, /1,000 sessions with zero characters is different|1,000 zero-character|1,000 measured zero-character/i, 'Activation contract must retain the zero-character evidence trigger');
assert.match(activation, /Do not label all zero-char sessions `abandonment`/i, 'Activation contract must not treat the entire zero-char bucket as proven abandonment');
assert.match(activation, /one growth request at a time/i, 'Activation contract must arbitrate growth prompts');
assert.match(activation, /Mobile first-screen contract/i, 'Activation contract must include mobile-first acceptance');
assert.match(activation, /Basic -> Rich|Basic → Rich|preferred continuation for substantial writing/i, 'Activation contract must define the substantial-writing Rich escalation');
assert.match(activation, /No major Card Studio acquisition expansion/i, 'Activation contract must gate Card Studio acquisition behind completion evidence');
assert.match(activation, /Do not send typed text|Forbidden:[\s\S]*typed strings/i, 'Activation telemetry must prohibit writing content');

assert.match(toolbar, /persistent pre-value command wall is superseded/i, 'Basic Writer spec must record the visibility reversal');
assert.match(toolbar, /E0 — Empty/, 'Basic Writer spec must define an empty activation state');
assert.match(toolbar, /English letters -> Urdu/, 'Basic Writer must preserve the simple English-letter input job');
assert.match(toolbar, /Speak Urdu/, 'Voice must be discoverable as an input choice');
assert.match(toolbar, /Copy becomes directly visible\/obvious/, 'Copy must become obvious after first value');
assert.match(toolbar, /PDF[\s\S]*Word[\s\S]*E3/i, 'Document outputs must be promoted after substantial writing rather than before value');

assert.match(growth, /one growth request at a time/i, 'Growth spec must coordinate Keep, Share and Community Publish');
assert.match(growth, /E0 — empty/, 'Growth acquisition must stay out of the empty state');
assert.match(growth, /E3 — substantial writing/, 'Keep must be tied to meaningful value rather than any text');
assert.match(growth, /Never advertise account creation to an authenticated user/, 'Signed-in users must not be re-acquired');
assert.match(growth, /suppressed_due_to_arbitration/, 'Prompt arbitration must be measurable');

assert.match(referral, /CTA -> destination ready -> referred meaningful start|CTA -> destination ready -> referred first action/i, 'Share acceptance must extend beyond CTA click');
assert.match(referral, /A CTA click by itself is not success/i, 'Referral contract must reject CTA clicks as the terminal metric');
assert.match(referral, /Do not make the CTA larger\/greener/i, 'Referral repair must target continuity before more CTA promotion');
assert.match(referral, /do not put full Urdu text into URL query\/hash/i, 'Use-this-text handoff must keep public text out of URLs');

assert.match(metrics, /A click is an intermediate event, not the final success event/i, 'Metrics contract must measure downstream task success');
assert.match(metrics, /No writing, speech transcript, selected text, filename, document ID or share ID/i, 'Metrics contract must preserve the content/privacy boundary');
assert.match(metrics, /success rate.*cannot exceed 100%/i, 'Metrics contract must prevent misleading rate labels');
assert.match(states, /E0 Empty[\s\S]*Input choices \+ editor/, 'State matrix must keep input/editor primary while empty');
assert.match(states, /E3 Substantial[\s\S]*Continue with formatting/, 'State matrix must provide substantial-writing escalation');
assert.match(acceptance, /Empty writer is calm/, 'Acceptance suite must cover pre-value command density');
assert.match(acceptance, /Share recipient really starts/, 'Acceptance suite must cover referral-start continuity');
assert.match(decisions, /Freeze major feature breadth temporarily/, 'Decision log must record the roadmap freeze');
assert.match(freeze, /new unrelated mini-tools/i, 'Scope freeze must prevent immediate feature sprawl');
assert.match(guardrails, /Do not add another toolbar on top of existing toolbar\/action layers/, 'Implementation guardrails must prohibit UI layering');
assert.match(evidence, /We cannot yet claim:/, 'Evidence note must preserve measured-fact vs hypothesis discipline');

console.log('Core activation specification contract passed.');
