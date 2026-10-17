const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// voice_exposed fires when the mic control is built, before the writer does
// anything. Routing it through trackOutcome() marked every writer visit as
// engaged, recorded writer_first_input and writer_outcome_first on page load,
// and inflated Product Pulse engagement and first-value metrics.

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
    trackOutcome: (name, detail) => calls.push({ via: 'trackOutcome', name, detail })
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
  assert.deepEqual(calls.map(call => `${call.via}:${call.name}`), [
    'track:voice_exposed',
    'trackOutcome:voice_selected',
    'trackOutcome:voice_started'
  ], 'Basic Writer voice exposure must be a plain event; writer-initiated voice actions stay outcomes');
  assert.equal(calls[0].detail.input_mode, 'voice', 'voice_exposed keeps its bounded input_mode detail');
}

{
  const { telemetry, calls } = harness('writer-voice-input.js');
  telemetry('rich-editor', 'voice-exposed');
  telemetry('rich-editor', 'voice-selected');
  assert.deepEqual(calls.map(call => `${call.via}:${call.name}`), [
    'track:voice_exposed',
    'trackOutcome:voice_selected'
  ], 'Shared writer voice exposure must be a plain event; writer-initiated voice actions stay outcomes');
}

console.log('Voice exposure telemetry honesty contract passed.');
