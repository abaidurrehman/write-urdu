'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', '..', 'js', 'batch-transliteration.js'), 'utf8');

function create(fetchImpl) {
  if (typeof fetchImpl !== 'function') throw new TypeError('fetchImpl must be a function');

  const window = {
    fetch: fetchImpl,
    setTimeout
  };
  const document = {
    readyState: 'loading',
    addEventListener: function () {},
    querySelectorAll: function () { return []; }
  };
  const context = vm.createContext({
    window,
    document,
    URL,
    encodeURIComponent,
    Promise,
    Array,
    String,
    Math,
    Event: function Event() {},
    MutationObserver: function MutationObserver() {},
    console
  });

  vm.runInContext(source, context, { filename: 'js/batch-transliteration.js' });
  if (!window.WriteUrduBatchTransliteration || typeof window.WriteUrduBatchTransliteration.transliterate !== 'function') {
    throw new Error('production batch transliteration entry point unavailable');
  }
  return window.WriteUrduBatchTransliteration.transliterate;
}

module.exports = { create };
