'use strict';

// F-6 (docs/audits/product-pulse-7d-2026-11-14): Google Input Tools spells the
// most common greetings and blessings wrongly (for example
// `assalam o alaikum` -> `اسسلام و علیکم`). A small correction list fixes
// those known provider misspellings after conversion. It must never touch
// ordinary words that only look similar (اسلام, جما, جامہ).

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'batch-transliteration.js'), 'utf8');

// Real provider outputs recorded on 2026-11-15 for fixed sample phrases.
const PROVIDER = {
  'assalam o alaikum': 'اسسلام و علیکم',
  'inshallah kal milenge': 'انشاللہ کل ملینگے',
  'jumma mubarak': 'جمّ مبارک'
};

function createHarness() {
  const window = {
    setTimeout,
    fetch: async function (query) {
      const value = new URL(query).searchParams.get('text');
      return { ok: true, json: async () => ['SUCCESS', [[value, [PROVIDER[value] || value]]]] };
    }
  };
  const document = { readyState: 'loading', addEventListener() {}, querySelectorAll() { return []; } };
  const context = vm.createContext({
    window, document, URL, encodeURIComponent, Promise, Array, String, Math,
    Event: function Event() {}, MutationObserver: function MutationObserver() {}, console
  });
  vm.runInContext(source, context, { filename: 'js/batch-transliteration.js' });
  return window.WriteUrduBatchTransliteration;
}

(async function () {
  const api = createHarness();
  assert.equal(typeof api.correctPhrases, 'function', 'The greeting correction list must be exposed for every converter.');
  const fix = api.correctPhrases;

  const corrected = [
    ['اسسلام و علیکم', 'السلام علیکم'],
    ['السلام و علیکم', 'السلام علیکم'],
    ['اسلام و علیکم', 'السلام علیکم'],
    ['اسسلامو علیکم', 'السلام علیکم'],
    ['اسسلمالیکم', 'السلام علیکم'],
    ['سلامالیکم', 'السلام علیکم'],
    ['وعلیکم اسسلام', 'وعلیکم السلام'],
    ['وہ علیکم اسسلام', 'وعلیکم السلام'],
    ['والیکمسسلام', 'وعلیکم السلام'],
    ['انشاللہ', 'انشاءاللہ'],
    ['انشااللہ', 'انشاءاللہ'],
    ['انشا الله', 'انشاءاللہ'],
    ['ماشاللہ', 'ماشاءاللہ'],
    ['ماشااللہ', 'ماشاءاللہ'],
    ['ماشا الله', 'ماشاءاللہ'],
    ['الحمدلللہ', 'الحمدللہ'],
    ['الحمدولللہ', 'الحمدللہ'],
    ['سبحاناللہ', 'سبحان اللہ'],
    ['جزاکاللہ', 'جزاک اللہ'],
    ['جزاکللاہو', 'جزاک اللہ'],
    ['جزاک الله', 'جزاک اللہ'],
    ['بسمللہ', 'بسم اللہ'],
    ['جمّ مبارک', 'جمعہ مبارک'],
    ['جما مبارک', 'جمعہ مبارک'],
    ['جامہ مبارک', 'جمعہ مبارک'],
    ['عید ال فطر', 'عید الفطر'],
    ['عید ال آدھا', 'عید الاضحیٰ'],
    ['عید ال اظہا', 'عید الاضحیٰ'],
    ['فی امنللہ', 'فی امان اللہ']
  ];
  for (const [wrong, right] of corrected) assert.equal(fix(wrong), right, `${wrong} must become ${right}`);

  // Corrections apply inside sentences and keep the surrounding text and punctuation.
  assert.equal(fix('سب کو اسسلام و علیکم، کیسے ہیں؟'), 'سب کو السلام علیکم، کیسے ہیں؟');
  assert.equal(fix('انشاللہ کل ملینگے۔\nجمّ مبارک!'), 'انشاءاللہ کل ملینگے۔\nجمعہ مبارک!');
  assert.equal(fix('اسسلام '), 'السلام ', 'A trailing space after the word just converted is kept.');

  // Correct text and look-alike real words are never changed.
  const untouched = [
    'السلام علیکم', 'وعلیکم السلام', 'انشاءاللہ', 'ان شاء اللہ', 'ماشاءاللہ', 'ماشاء اللہ', 'جمعہ مبارک',
    'اسلام', 'اسلام آباد', 'دین اسلام', 'پیسے جما کرو', 'نیا جامہ', 'عید مبارک',
    'mera khayal hai', ''
  ];
  for (const value of untouched) assert.equal(fix(value), value, `${value} must stay unchanged`);
  assert.equal(fix('مسلمانوں انشاللہی'), 'مسلمانوں انشاللہی', 'Only whole words are corrected.');

  // Passage conversion returns corrected greetings.
  assert.equal(await api.transliterate('assalam o alaikum'), 'السلام علیکم');
  assert.equal(await api.transliterate('inshallah kal milenge\njumma mubarak'), 'انشاءاللہ کل ملینگے\nجمعہ مبارک');
  assert.equal(await api.transliterate('اسسلام کو یوں لکھا'), 'اسسلام کو یوں لکھا', 'Lines with no English letters are not sent or rewritten.');

  console.log('Greeting spelling contract passed.');
}()).catch(error => {
  console.error(error);
  process.exit(1);
});
