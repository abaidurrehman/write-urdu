const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// voice_exposed fires when the mic control is built, before the writer does
// anything. Routing it through trackOutcome() marked every writer visit as
// engaged, recorded writer_first_input and writer_outcome_first on page load,
// and inflated Product Pulse engagement and first-value metrics.
//
// Writer-initiated voice actions (select, start, final, error) are
// interactions: they engage the session and keep the voice input mode, but
// they are not outcomes. The metrics contract reserves writer_outcome_first
// for copy/export/print/save/share/handoff; a Speak Urdu tap that ends in a
// permission error is not a completed task (audit AN-6, 2026-10-18).

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

function extractFunction(source, signature) {
  const start = source.indexOf(signature);
  assert.ok(start >= 0, `Missing ${signature}`);
  let depth = 0;
  for (let index = source.indexOf('{', start); index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new Error(`Unterminated ${signature}`);
}

function eventNamesBlock(source) {
  const match = source.match(/var VOICE_EVENT_NAMES = \{[\s\S]*?\};/);
  assert.ok(match, 'VOICE_EVENT_NAMES map is missing');
  return match[0];
}

function harness(file) {
  const source = read('js', file);
  const calls = [];
  const telemetryApi = {
    track: (name, detail) => calls.push({ via: 'track', name, detail }),
    trackOutcome: (name, detail) => calls.push({ via: 'trackOutcome', name, detail }),
    trackInteraction: (name, detail) => calls.push({ via: 'trackInteraction', name, detail })
  };
  const context = { root: { WriteUrduTelemetry: telemetryApi }, hasContent: () => false };
  vm.createContext(context);
  vm.runInContext(`${eventNamesBlock(source)}\n${extractFunction(source, 'function telemetry(')}\nthis.telemetry = telemetry;`, context);
  return { telemetry: context.telemetry, calls };
}

{
  const { telemetry, calls } = harness('basic-writer-command-toolbar.js');
  telemetry('voice-exposed');
  telemetry('voice-selected');
  telemetry('voice-started');
  telemetry('voice-final');
  telemetry('voice-error', 'permission-denied');
  assert.deepEqual(calls.map(call => `${call.via}:${call.name}`), [
    'track:voice_exposed',
    'trackInteraction:voice_selected',
    'trackInteraction:voice_started',
    'trackInteraction:voice_final',
    'trackInteraction:voice_error'
  ], 'Basic Writer voice exposure is a plain event; writer-initiated voice actions are interactions, never outcomes');
  assert.equal(calls[4].detail.error_category, 'permission-denied', 'voice_error keeps its bounded category');
  assert.equal(calls[0].detail.input_mode, 'voice', 'voice_exposed keeps its bounded input_mode detail');
}

{
  const { telemetry, calls } = harness('writer-voice-input.js');
  telemetry('rich-editor', 'voice-exposed');
  telemetry('rich-editor', 'voice-selected');
  telemetry('rich-editor', 'voice-final');
  assert.deepEqual(calls.map(call => `${call.via}:${call.name}`), [
    'track:voice_exposed',
    'trackInteraction:voice_selected',
    'trackInteraction:voice_final'
  ], 'Shared writer voice exposure is a plain event; writer-initiated voice actions are interactions, never outcomes');
}

{
  const client = read('js', 'product-telemetry.js');
  const body = extractFunction(client, 'function trackInteraction(');
  assert.match(body, /markEngaged()/, 'A voice interaction engages the session');
  assert.match(body, /currentInputMode = 'voice'/, 'A voice interaction keeps the voice input mode for the session summary');
  assert.doesNotMatch(body, /writer-outcome-first|trackOutcome|destination_outcome/, 'A voice interaction is never a writer outcome');
  assert.match(client, /trackInteraction: trackInteraction/, 'trackInteraction must be exposed on WriteUrduTelemetry');
}

console.log('Voice exposure telemetry honesty contract passed.');
