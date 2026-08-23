const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const voice = require('../js/voice-input-core.js');
const unified = require('../js/unified-urdu-input.js');

function fakeEnvironment(Recognition) {
  const documentListeners = Object.create(null);
  const windowListeners = Object.create(null);
  const document = {
    hidden: false,
    addEventListener(name, handler) { documentListeners[name] = handler; },
    removeEventListener(name, handler) { if (documentListeners[name] === handler) delete documentListeners[name]; }
  };
  const host = {
    SpeechRecognition: Recognition,
    document,
    addEventListener(name, handler) { windowListeners[name] = handler; },
    removeEventListener(name, handler) { if (windowListeners[name] === handler) delete windowListeners[name]; }
  };
  return { host, document, documentListeners, windowListeners };
}

function recognitionDouble() {
  const state = { constructed: 0, starts: 0, stops: 0, aborts: 0, instances: [] };
  class Recognition {
    constructor() {
      state.constructed += 1;
      state.instances.push(this);
    }
    start() {
      state.starts += 1;
      if (this.onstart) this.onstart();
    }
    stop() {
      state.stops += 1;
      if (this.onend) this.onend();
    }
    abort() {
      state.aborts += 1;
      if (this.onend) this.onend();
    }
    result(results, resultIndex = 0) {
      if (this.onresult) this.onresult({ results, resultIndex });
    }
    error(code) {
      if (this.onerror) this.onerror({ error: code, raw: 'must-not-escape' });
    }
  }
  return { Recognition, state };
}

function result(text, isFinal) {
  return { 0: { transcript: text }, isFinal: Boolean(isFinal), length: 1 };
}

function fakeTarget(value = '') {
  const events = [];
  return {
    value,
    selectionStart: value.length,
    selectionEnd: value.length,
    disabled: false,
    readOnly: false,
    events,
    ownerDocument: { defaultView: { Event: class Event { constructor(type, options) { this.type = type; this.bubbles = options.bubbles; } } } },
    setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; },
    dispatchEvent(event) { events.push(event.type); return true; },
    focus() { this.focused = true; }
  };
}

function fakeElement() {
  const listeners = Object.create(null);
  const attributes = Object.create(null);
  return {
    textContent: '',
    hidden: false,
    disabled: false,
    listeners,
    attributes,
    addEventListener(name, handler) { listeners[name] = handler; },
    removeEventListener(name, handler) { if (listeners[name] === handler) delete listeners[name]; },
    setAttribute(name, value) { attributes[name] = String(value); },
    click() { if (listeners.click) listeners.click(); }
  };
}

assert.equal(voice.recognitionConstructor({ SpeechRecognition: function Native() {} }).name, 'Native');
assert.equal(voice.recognitionConstructor({ webkitSpeechRecognition: function Webkit() {} }).name, 'Webkit');
assert.equal(voice.recognitionConstructor({}), null);

const noSideEffectDouble = recognitionDouble();
const noSideEffectEnvironment = fakeEnvironment(noSideEffectDouble.Recognition);
const idleController = voice.create({ host: noSideEffectEnvironment.host });
assert.equal(idleController.isSupported(), true);
assert.equal(noSideEffectDouble.state.constructed, 0, 'creating/importing controller must not construct or start recognition');
assert.equal(noSideEffectDouble.state.starts, 0, 'page initialization must not request microphone access');
idleController.destroy();

const insertCases = [
  ['', 0, 0, 'السلام علیکم', 'السلام علیکم', 12],
  ['دنیا', 0, 0, 'سلام', 'سلام دنیا', 5],
  ['آج اچھا ہے', 3, 3, 'موسم', 'آج موسم اچھا ہے', 8],
  ['آج موسم', 7, 7, 'بہت اچھا ہے', 'آج موسم بہت اچھا ہے', 19],
  ['آج موسم اچھا ہے', 8, 12, 'بہت اچھا', 'آج موسم بہت اچھا ہے', 16]
];
insertCases.forEach(([value, start, end, insertion, expected, caret]) => {
  assert.deepEqual(
    unified.insertTextAtSelection(value, start, end, insertion),
    { value: expected, selectionStart: caret, selectionEnd: caret }
  );
});
assert.equal(unified.insertTextAtSelection('سلام، دنیا', 5, 5, 'friend 123').value, 'سلام، friend 123 دنیا');
assert.equal(unified.insertTextAtSelection('Hello دنیا 123', 6, 10, 'اردو text').value, 'Hello اردو text 123');
assert.equal(unified.insertTextAtSelection('سلام دنیا', 4, 4, '،').value, 'سلام، دنیا', 'punctuation insertion must not gain a leading space');

const target = fakeTarget('آج موسم اچھا ہے');
target.selectionStart = 8;
target.selectionEnd = 12;
const adapter = unified.createTextControlAdapter(target);
const inserted = adapter.insertText('بہت اچھا');
assert.equal(target.value, 'آج موسم بہت اچھا ہے');
assert.equal(target.selectionStart, inserted.selectionStart);
assert.deepEqual(target.events, ['input', 'change']);

const lifecycleDouble = recognitionDouble();
const lifecycleEnvironment = fakeEnvironment(lifecycleDouble.Recognition);
const committed = [];
const interim = [];
const errors = [];
const states = [];
const liveTarget = fakeTarget('پہلا متن');
const liveAdapter = unified.createTextControlAdapter(liveTarget);
const controller = voice.create({
  host: lifecycleEnvironment.host,
  onState: state => states.push(state),
  onInterim: text => interim.push(text),
  onFinal: text => { committed.push(text); liveAdapter.insertText(text); },
  onError: category => errors.push(category)
});

assert.equal(controller.start(), true);
assert.equal(lifecycleDouble.state.constructed, 1);
const recognition = lifecycleDouble.state.instances[0];
assert.equal(recognition.lang, 'ur-PK');
assert.equal(recognition.continuous, true);
assert.equal(recognition.interimResults, true);
assert.equal(recognition.maxAlternatives, 1);
recognition.result([result('عارضی متن', false)]);
assert.equal(liveTarget.value, 'پہلا متن', 'interim speech must not commit');
assert.equal(interim.at(-1), 'عارضی متن');

const firstFinalResult = result('نیا متن', true);
recognition.result([firstFinalResult]);
recognition.result([firstFinalResult]);
assert.deepEqual(committed, ['نیا متن'], 'same final result slot must commit exactly once');
assert.equal(liveTarget.value, 'پہلا متن نیا متن');

liveTarget.value = 'دستی ترمیم محفوظ';
liveTarget.selectionStart = liveTarget.value.length;
liveTarget.selectionEnd = liveTarget.value.length;
controller.stop();
controller.start();
recognition.result([result('اگلا جملہ', true)]);
assert.equal(liveTarget.value, 'دستی ترمیم محفوظ اگلا جملہ', 'final speech must use current target state after manual edits');
assert.deepEqual(committed, ['نیا متن', 'اگلا جملہ'], 'new sessions may commit a new result at the same result index');

recognition.error('not-allowed');
recognition.error('no-speech');
recognition.error('audio-capture');
recognition.error('network');
recognition.error('language-not-supported');
assert.deepEqual(errors, ['permission-denied', 'no-speech', 'audio-capture', 'network', 'language-not-supported']);
assert.ok(states.includes('listening'));

lifecycleEnvironment.document.hidden = true;
lifecycleEnvironment.documentListeners.visibilitychange();
assert.equal(lifecycleDouble.state.stops, 2, 'hidden page must stop active recognition');
controller.start();
lifecycleEnvironment.windowListeners.pagehide();
assert.equal(lifecycleDouble.state.aborts, 1, 'page navigation must abort active recognition');
controller.start();
controller.destroy();
assert.equal(lifecycleDouble.state.aborts, 2, 'destroy must abort active recognition');
assert.equal(lifecycleEnvironment.documentListeners.visibilitychange, undefined, 'destroy must remove visibility cleanup listener');
assert.equal(lifecycleEnvironment.windowListeners.pagehide, undefined, 'destroy must remove navigation cleanup listener');

const embeddedDouble = recognitionDouble();
const embeddedEnvironment = fakeEnvironment(embeddedDouble.Recognition);
const embeddedTarget = fakeTarget('آج موسم اچھا ہے');
embeddedTarget.selectionStart = 8;
embeddedTarget.selectionEnd = 12;
const embeddedElements = {
  root: fakeElement(),
  methodButton: fakeElement(),
  methodLabel: fakeElement(),
  startButton: fakeElement(),
  stopButton: fakeElement(),
  status: fakeElement(),
  notice: fakeElement(),
  interim: fakeElement()
};
let embeddedFinals = 0;
let embeddedLocale = 'en';
const embeddedController = unified.createVoiceInputController({
  voiceApi: voice,
  host: embeddedEnvironment.host,
  locale: () => embeddedLocale,
  adapter: unified.createTextControlAdapter(embeddedTarget),
  elements: embeddedElements,
  onFinal() { embeddedFinals += 1; }
});
assert.equal(embeddedController.isSupported(), true);
assert.equal(embeddedDouble.state.constructed, 0, 'embedded voice setup must not construct recognition or request permission');
assert.equal(embeddedElements.status.textContent, 'Ready');
assert.equal(embeddedElements.methodLabel.textContent, 'Speak Urdu');
embeddedElements.startButton.click();
assert.equal(embeddedDouble.state.constructed, 1, 'recognition must be constructed only after Start');
assert.equal(embeddedDouble.state.starts, 1);
assert.equal(embeddedElements.status.textContent, 'Listening…');
const embeddedRecognition = embeddedDouble.state.instances[0];
embeddedRecognition.result([result('عارضی', false)]);
assert.equal(embeddedTarget.value, 'آج موسم اچھا ہے', 'embedded interim speech must stay outside document state');
assert.equal(embeddedElements.interim.textContent, 'عارضی');
embeddedRecognition.result([result('بہت اچھا', true)]);
assert.equal(embeddedTarget.value, 'آج موسم بہت اچھا ہے');
assert.equal(embeddedFinals, 1);
assert.equal(embeddedElements.status.textContent, 'Text added');
embeddedElements.stopButton.click();
embeddedTarget.value = 'دستی درستگی محفوظ';
embeddedTarget.selectionStart = embeddedTarget.value.length;
embeddedTarget.selectionEnd = embeddedTarget.value.length;
embeddedElements.startButton.click();
embeddedRecognition.result([result('اگلا جملہ', true)]);
assert.equal(embeddedTarget.value, 'دستی درستگی محفوظ اگلا جملہ', 'manual correction must survive the next embedded voice segment');
embeddedRecognition.error('not-allowed');
assert.equal(embeddedElements.status.textContent, 'Permission blocked');
embeddedLocale = 'ur';
embeddedController.refreshLocale();
assert.equal(embeddedElements.methodLabel.textContent, 'بول کر اردو لکھیں');
assert.equal(embeddedElements.status.textContent, 'مائیک کی اجازت مسدود ہے');
embeddedController.destroy();
assert.equal(embeddedElements.startButton.listeners.click, undefined, 'destroy must remove embedded Start listener');

const unsupported = voice.create({ host: fakeEnvironment(null).host });
assert.equal(unsupported.isSupported(), false);
assert.equal(unsupported.start(), false);
unsupported.destroy();

assert.equal(voice.errorCategory('service-not-allowed'), 'permission-denied');
assert.equal(voice.errorCategory('aborted'), 'aborted');
assert.equal(voice.errorCategory('unexpected-browser-value'), 'unknown');

const root = path.join(__dirname, '..');
const coreSource = fs.readFileSync(path.join(root, 'js', 'voice-input-core.js'), 'utf8');
const adapterSource = fs.readFileSync(path.join(root, 'js', 'unified-urdu-input.js'), 'utf8');
for (const source of [coreSource, adapterSource]) {
  assert.doesNotMatch(source, /fetch\s*\(|XMLHttpRequest|sendBeacon|\/api\//, 'shared input modules must have no telemetry or network sink');
  assert.doesNotMatch(source, /getUserMedia\s*\(/, 'shared input modules must use browser recognition without recording audio');
}

console.log('Shared Urdu voice core and target adapter tests passed.');
