const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function write(file, value) {
  fs.writeFileSync(path.join(root, file), value);
}

function mustReplace(file, before, after) {
  const source = read(file);
  if (!source.includes(before)) {
    throw new Error(`Slice 0 patch anchor not found in ${file}: ${before.slice(0, 120)}`);
  }
  write(file, source.replace(before, after));
}

// Product Pulse API: make bounded conversion semantics explicit and release-marked.
mustReplace(
  'functions/api/internal/product-pulse.js',
  "const ALLOWED_DAYS = new Set([1, 7, 30]);\n",
  "const ALLOWED_DAYS = new Set([1, 7, 30]);\nconst METRICS_SEMANTICS_VERSION = 'wu-plat-002h-s0-2026-09-06-v1';\n"
);

mustReplace(
  'functions/api/internal/product-pulse.js',
  "function ratio(numerator, denominator) {\n  return denominator ? numerator / denominator : 0;\n}\n",
  "function ratio(numerator, denominator) {\n  return denominator ? numerator / denominator : 0;\n}\n\n// Bounded rates are only emitted when numerator and denominator describe a\n// compatible population. Invalid historical/mixed-path pairs return null; we\n// never cap a mathematically invalid conversion at 100%.\nfunction boundedRate(numerator, denominator) {\n  const num = Number(numerator || 0);\n  const den = Number(denominator || 0);\n  if (!den) return num === 0 ? 0 : null;\n  if (num < 0 || num > den) return null;\n  return num / den;\n}\n\nfunction compatibleDifference(parent, child) {\n  const parentCount = Number(parent || 0);\n  const childCount = Number(child || 0);\n  if (parentCount < 0 || childCount < 0 || childCount > parentCount) return null;\n  return parentCount - childCount;\n}\n"
);

mustReplace(
  'functions/api/internal/product-pulse.js',
  "    focused_rate: ratio(totals.writer_focused, totals.writer_viewed),\n    first_input_rate: ratio(totals.writer_first_input, totals.writer_viewed),\n    first_urdu_success_rate: ratio(totals.writer_first_urdu_success, totals.writer_first_input),\n    outcome_rate: ratio(totals.writer_outcome_first, totals.writer_first_urdu_success)\n",
  "    focused_rate: boundedRate(totals.writer_focused, totals.writer_viewed),\n    first_input_rate: boundedRate(totals.writer_first_input, totals.writer_viewed),\n    first_urdu_success_rate: boundedRate(totals.writer_first_urdu_success, totals.writer_first_input),\n    outcome_rate: boundedRate(totals.writer_outcome_first, totals.writer_first_input)\n"
);

mustReplace(
  'functions/api/internal/product-pulse.js',
  "    conversion: {\n      focused_rate: ratio(focused, viewed),\n      first_input_rate: ratio(firstInput, focused),\n      first_urdu_success_rate: ratio(firstUrduSuccess, firstInput),\n      outcome_rate: ratio(outcomeFirst, firstUrduSuccess)\n    },\n    // Session classification per the H1 acceptance contract: replaces the\n    // blanket \"abandoned\" label for zero-character sessions with the point\n    // in the funnel where the session actually stopped.\n    session_classification: {\n      visible_not_focused: Math.max(0, viewed - focused),\n      focused_no_input: Math.max(0, focused - firstInput),\n      input_no_urdu_success: Math.max(0, firstInput - firstUrduSuccess),\n      success_no_outcome: Math.max(0, firstUrduSuccess - outcomeFirst),\n      success_with_outcome: outcomeFirst\n    },\n",
  "    conversion: {\n      // Focus and first input are sibling coverage states under writer-viewed;\n      // input does not require the focus event to have fired first.\n      focused_rate: boundedRate(focused, viewed),\n      first_input_rate: boundedRate(firstInput, viewed),\n      // Urdu-success is meaningful after an input event; outcome can occur via\n      // direct Urdu/imported state and therefore uses first-input, not Urdu-success.\n      first_urdu_success_rate: boundedRate(firstUrduSuccess, firstInput),\n      outcome_rate: boundedRate(outcomeFirst, firstInput)\n    },\n    metric_definitions: {\n      focused_rate: { numerator: 'writer_focused', denominator: 'writer_viewed', semantics: 'bounded_state_coverage' },\n      first_input_rate: { numerator: 'writer_first_input', denominator: 'writer_viewed', semantics: 'bounded_state_coverage' },\n      first_urdu_success_rate: { numerator: 'writer_first_urdu_success', denominator: 'writer_first_input', semantics: 'bounded_state_coverage' },\n      outcome_rate: { numerator: 'writer_outcome_first', denominator: 'writer_first_input', semantics: 'bounded_state_coverage' }\n    },\n    // These are compatible state differences, not a strict sequential funnel.\n    // Null means the historical aggregates cannot support that subtraction.\n    session_classification: {\n      visible_not_focused: compatibleDifference(viewed, focused),\n      visible_no_input: compatibleDifference(viewed, firstInput),\n      input_no_urdu_success: compatibleDifference(firstInput, firstUrduSuccess),\n      input_no_outcome: compatibleDifference(firstInput, outcomeFirst),\n      input_with_outcome: outcomeFirst <= firstInput ? outcomeFirst : null\n    },\n"
);

mustReplace(
  'functions/api/internal/product-pulse.js',
  "    conversion: {\n      text_entered_rate: ratio(textEntered, visits),\n      canvas_change_rate: ratio(canvasChange, textEntered),\n      export_step_reached_rate: ratio(stepReached, canvasChange),\n      export_attempted_rate: ratio(attempted, stepReached)\n    },\n    mode_split: {\n      quick,\n      advanced,\n      advanced_rate: ratio(advanced, quick + advanced)\n    }\n",
  "    conversion: {\n      text_entered_rate: boundedRate(textEntered, visits),\n      canvas_change_rate: boundedRate(canvasChange, textEntered),\n      // export_step_reached is optional/branch-specific and cannot be a\n      // denominator for all export attempts. Keep the raw count above.\n      export_step_reached_rate: null,\n      export_attempted_rate: boundedRate(attempted, textEntered)\n    },\n    branch_semantics: {\n      export_step_reached: 'optional_branch_counter',\n      export_attempted_denominator: 'text_entered'\n    },\n    mode_split: {\n      quick,\n      advanced,\n      advanced_rate: boundedRate(advanced, quick + advanced)\n    }\n"
);

mustReplace(
  'functions/api/internal/product-pulse.js',
  "  return {\n    ready: shown > 0 || selected > 0,\n    funnel: {\n      shown,\n      selected,\n      stored,\n      destination_ready: destinationReady,\n      payload_restored: payloadRestored,\n      meaningful_start: meaningfulStart\n    },\n    conversion: {\n      selected_rate: ratio(selected, shown),\n      stored_rate: ratio(stored, selected),\n      destination_ready_rate: ratio(destinationReady, stored),\n      payload_restored_rate: ratio(payloadRestored, destinationReady),\n      meaningful_start_rate: ratio(meaningfulStart, payloadRestored)\n    }\n  };\n}\n",
  "  return {\n    ready: shown > 0 || selected > 0,\n    // Legacy and v2 currently emit different optional step subsets. Until\n    // Slice 1 gives every path a comparable identity, only shown→selected is\n    // safe as a bounded conversion. Downstream values remain useful raw counts.\n    path_version: 'mixed_legacy_v2_pre_slice1',\n    rate_status: 'raw_counts_only_after_selection',\n    funnel: {\n      shown,\n      selected,\n      stored,\n      destination_ready: destinationReady,\n      payload_restored: payloadRestored,\n      meaningful_start: meaningfulStart\n    },\n    conversion: {\n      selected_rate: boundedRate(selected, shown),\n      stored_rate: null,\n      destination_ready_rate: null,\n      payload_restored_rate: null,\n      meaningful_start_rate: null\n    },\n    metric_definitions: {\n      selected_rate: { numerator: 'selected', denominator: 'shown', semantics: 'bounded_state_coverage' },\n      downstream: { semantics: 'mixed_path_raw_counts', reason: 'legacy_v2_optional_steps_not_yet_comparable' }\n    }\n  };\n}\n"
);

mustReplace(
  'functions/api/internal/product-pulse.js',
  "    storage: 'hourly_rollups',\n    days,\n",
  "    storage: 'hourly_rollups',\n    metrics_version: METRICS_SEMANTICS_VERSION,\n    days,\n"
);

mustReplace(
  'functions/api/internal/product-pulse.js',
  "      engagement_rate: sessions ? engagedSessions / sessions : 0,\n",
  "      engagement_rate: boundedRate(engagedSessions, sessions),\n"
);

// Founder dashboard: render unavailable incompatible conversions as em dash,
// and explain the corrected denominator/branch semantics.
mustReplace(
  'js/product-pulse.js',
  "  function percent(value) { return (Number(value || 0) * 100).toFixed(1).replace(/\\.0$/, '') + '%'; }\n  function ratio(value) { return Number(value || 0).toFixed(2).replace(/\\.00$/, '').replace(/(\\.\\d)0$/, '$1') + '×'; }\n",
  "  function percent(value) { return (Number(value || 0) * 100).toFixed(1).replace(/\\.0$/, '') + '%'; }\n  function boundedPercent(value) {\n    if (value === null || typeof value === 'undefined' || !Number.isFinite(Number(value))) return '—';\n    return percent(value);\n  }\n  function ratio(value) { return Number(value || 0).toFixed(2).replace(/\\.00$/, '').replace(/(\\.\\d)0$/, '$1') + '×'; }\n"
);

mustReplace(
  'js/product-pulse.js',
  "    if (kpis.focused_rate) kpis.focused_rate.textContent = percent(conversion.focused_rate);\n    if (kpis.first_input_rate) kpis.first_input_rate.textContent = percent(conversion.first_input_rate);\n    if (kpis.first_urdu_success_rate) kpis.first_urdu_success_rate.textContent = percent(conversion.first_urdu_success_rate);\n    if (kpis.outcome_rate) kpis.outcome_rate.textContent = percent(conversion.outcome_rate);\n",
  "    if (kpis.focused_rate) kpis.focused_rate.textContent = boundedPercent(conversion.focused_rate);\n    if (kpis.first_input_rate) kpis.first_input_rate.textContent = boundedPercent(conversion.first_input_rate);\n    if (kpis.first_urdu_success_rate) kpis.first_urdu_success_rate.textContent = boundedPercent(conversion.first_urdu_success_rate);\n    if (kpis.outcome_rate) kpis.outcome_rate.textContent = boundedPercent(conversion.outcome_rate);\n"
);

mustReplace(
  'js/product-pulse.js',
  "    renderBars('#activationClassificationBars', [\n      { label: 'Visible, never focused', value: classification.visible_not_focused },\n      { label: 'Focused, no input', value: classification.focused_no_input },\n      { label: 'Input, no Urdu success', value: classification.input_no_urdu_success },\n      { label: 'Urdu success, no outcome', value: classification.success_no_outcome },\n      { label: 'Success with outcome', value: classification.success_with_outcome }\n    ], 'label', 'value');\n",
  "    renderBars('#activationClassificationBars', [\n      { label: 'Visible, never focused', value: classification.visible_not_focused },\n      { label: 'Viewed, no first input', value: classification.visible_no_input },\n      { label: 'Input, no Urdu-success event', value: classification.input_no_urdu_success },\n      { label: 'Input, no first outcome', value: classification.input_no_outcome },\n      { label: 'Input with outcome', value: classification.input_with_outcome }\n    ].filter(function (item) { return item.value !== null && typeof item.value !== 'undefined'; }), 'label', 'value');\n"
);

mustReplace(
  'js/product-pulse.js',
  "    if (kpis.canvas_change_rate) kpis.canvas_change_rate.textContent = percent(conversion.canvas_change_rate);\n    if (kpis.export_attempted_rate) kpis.export_attempted_rate.textContent = percent(conversion.export_attempted_rate);\n    if (kpis.advanced_rate) kpis.advanced_rate.textContent = percent(modeSplit.advanced_rate);\n",
  "    if (kpis.canvas_change_rate) kpis.canvas_change_rate.textContent = boundedPercent(conversion.canvas_change_rate);\n    if (kpis.export_attempted_rate) kpis.export_attempted_rate.textContent = boundedPercent(conversion.export_attempted_rate);\n    if (kpis.advanced_rate) kpis.advanced_rate.textContent = boundedPercent(modeSplit.advanced_rate);\n"
);

mustReplace(
  'js/product-pulse.js',
  "    if (kpis.selected_rate) kpis.selected_rate.textContent = percent(conversion.selected_rate);\n    if (kpis.destination_ready_rate) kpis.destination_ready_rate.textContent = percent(conversion.destination_ready_rate);\n    if (kpis.payload_restored_rate) kpis.payload_restored_rate.textContent = percent(conversion.payload_restored_rate);\n    if (kpis.meaningful_start_rate) kpis.meaningful_start_rate.textContent = percent(conversion.meaningful_start_rate);\n",
  "    if (kpis.selected_rate) kpis.selected_rate.textContent = boundedPercent(conversion.selected_rate);\n    if (kpis.destination_ready_rate) kpis.destination_ready_rate.textContent = boundedPercent(conversion.destination_ready_rate);\n    if (kpis.payload_restored_rate) kpis.payload_restored_rate.textContent = boundedPercent(conversion.payload_restored_rate);\n    if (kpis.meaningful_start_rate) kpis.meaningful_start_rate.textContent = boundedPercent(conversion.meaningful_start_rate);\n"
);

mustReplace(
  'js/product-pulse.js',
  "    q('#lastUpdated').textContent = 'Updated ' + new Date(data.generated_at).toLocaleString() + (data.current && data.current.latest_event_at ? ' · latest event ' + new Date(data.current.latest_event_at).toLocaleString() : '');\n",
  "    q('#lastUpdated').textContent = 'Updated ' + new Date(data.generated_at).toLocaleString() + (data.current && data.current.latest_event_at ? ' · latest event ' + new Date(data.current.latest_event_at).toLocaleString() : '') + (data.metrics_version ? ' · metrics ' + data.metrics_version : '');\n"
);

// Dashboard copy: stop presenting independent/optional states as one strict ladder.
mustReplace(
  'os/product-pulse.html',
  'Visit → focus → first input → first Urdu success → outcome — WU-PLAT-002H Gate A',
  'Compatible state coverage + raw counts — WU-PLAT-002H Gate A / Slice 0'
);
mustReplace('os/product-pulse.html', 'First input ÷ focused', 'First input ÷ writer viewed');
mustReplace('os/product-pulse.html', 'Copy/export/share/save ÷ Urdu success', 'First outcome ÷ first input');
mustReplace('os/product-pulse.html', '<h2>Where sessions stop</h2><span class="os-panel-note">Not all zero-character sessions are "abandoned"</span>', '<h2>State diagnostics</h2><span class="os-panel-note">Compatible differences; not a strict event ladder</span>');
mustReplace('os/product-pulse.html', 'Attempted ÷ reached export step', 'Attempted ÷ text entered · export step is optional');
mustReplace('os/product-pulse.html', 'Shown → selected → stored → destination ready → restored → meaningful start — WU-PLAT-002H Gate A/C', 'Shown → selected conversion; downstream raw counts until path consolidation — Slice 0');
mustReplace('os/product-pulse.html', 'Destination ready ÷ stored', 'Raw count below · mixed legacy/v2 paths');
mustReplace('os/product-pulse.html', 'Restored ÷ destination ready', 'Raw count below · restore is path-optional');
mustReplace('os/product-pulse.html', 'Meaningful start ÷ restored', 'Raw count below · denominator awaits Slice 1');
mustReplace('os/product-pulse.html', 'Instrumented across two independent handoff code paths (legacy and v2); a known consolidation gap is tracked separately. No text content in any step.', 'Slice 0 deliberately suppresses incompatible downstream percentages while legacy and v2 paths emit different optional steps. Raw counts remain visible; Slice 1 owns path consolidation. No text content in any step.');

// Focused Slice 0 contract test.
write('tests/product-pulse-slice0-contract.test.js', `const assert = require('assert');\nconst fs = require('fs');\nconst path = require('path');\n\nconst root = path.resolve(__dirname, '..');\nconst api = fs.readFileSync(path.join(root, 'functions', 'api', 'internal', 'product-pulse.js'), 'utf8');\nconst client = fs.readFileSync(path.join(root, 'js', 'product-pulse.js'), 'utf8');\nconst html = fs.readFileSync(path.join(root, 'os', 'product-pulse.html'), 'utf8');\n\nassert.match(api, /METRICS_SEMANTICS_VERSION = 'wu-plat-002h-s0-2026-09-06-v1'/, 'Slice 0 must expose a bounded release marker');\nassert.match(api, /function boundedRate\\(/, 'Slice 0 must distinguish bounded conversion from generic ratios');\nassert.match(api, /first_input_rate: boundedRate\\(firstInput, viewed\\)/, 'First input must use writer-viewed as the compatible denominator');\nassert.doesNotMatch(api, /first_input_rate: ratio\\(firstInput, focused\\)/, 'First input must not be divided by focus');\nassert.match(api, /outcome_rate: boundedRate\\(outcomeFirst, firstInput\\)/, 'First outcome must use first-input as the compatible denominator');\nassert.doesNotMatch(api, /outcome_rate: ratio\\(outcomeFirst, firstUrduSuccess\\)/, 'First outcome must not use Urdu-success as a universal denominator');\nassert.match(api, /export_attempted_rate: boundedRate\\(attempted, textEntered\\)/, 'Card export attempt must use the common text-entered population');\nassert.match(api, /export_step_reached_rate: null/, 'Optional Card export-step must not masquerade as a universal conversion');\nassert.match(api, /path_version: 'mixed_legacy_v2_pre_slice1'/, 'Mixed continuation paths must be explicitly versioned');\nassert.match(api, /payload_restored_rate: null/, 'Mixed-path restore count must not be emitted as conversion');\nassert.match(api, /meaningful_start_rate: null/, 'Mixed-path meaningful-start count must not be divided by a path-optional step');\nassert.match(api, /metrics_version: METRICS_SEMANTICS_VERSION/, 'Product Pulse response must carry the release marker');\nassert.doesNotMatch(api, /FROM product_events/i, 'Slice 0 must stay on aggregate rollups and not scan raw events');\n\nassert.match(client, /function boundedPercent\\(/, 'Dashboard must render unavailable incompatible conversions explicitly');\nassert.match(html, /First input ÷ writer viewed/, 'Dashboard must explain the corrected first-input denominator');\nassert.match(html, /Attempted ÷ text entered · export step is optional/, 'Dashboard must explain the Card branch denominator');\nassert.match(html, /downstream raw counts until path consolidation/i, 'Continuation panel must not imply a false strict funnel');\nassert.match(html, /No text content in any step/, 'Privacy boundary must remain explicit');\n\nconsole.log('Product Pulse Slice 0 denominator semantics contracts passed.');\n`);

mustReplace(
  'scripts/run-contract-tests.js',
  "  'tests/product-pulse-contract.test.js',\n",
  "  'tests/product-pulse-contract.test.js',\n  'tests/product-pulse-slice0-contract.test.js',\n"
);

// Remove the one-shot patch machinery before the implementation commit so it
// does not remain in the product repository or trigger again.
const workflow = path.join(root, '.github', 'workflows', 'apply-product-pulse-slice0.yml');
if (fs.existsSync(workflow)) fs.unlinkSync(workflow);
if (fs.existsSync(__filename)) fs.unlinkSync(__filename);

console.log('Product Pulse Slice 0 patch applied.');
