const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const keyboard = read('urdu-keyboard.html');
const keyboardResources = keyboard.match(/<nav class="related-resources"[\s\S]*?<\/nav>/)?.[0] || '';
assert.match(
  keyboardResources,
  /href="\/urdu-phrases-copy-paste"[^>]*>Common Urdu phrases to copy and practise<\/a>/,
  'Urdu Keyboard related resources must offer a useful route to common Urdu phrases'
);

const urduKeyboard = read('urdu/urdu-keyboard.html');
assert.match(
  urduKeyboard,
  /href="\/urdu-phrases-copy-paste"[^>]*>کاپی اور مشق کے لیے عام اردو جملے<\/a>/,
  'Generated Urdu Keyboard must localize its contextual phrase link'
);

const tutorial = read('english-urdu-typing-tutorial.html');
const tutorialChecklist = tutorial.match(/<ol class="authority-checklist">[\s\S]*?<\/ol>/)?.[0] || '';
assert.match(
  tutorialChecklist,
  /href="\/urdu-phrases-copy-paste"[^>]*>common Urdu phrase to copy and practise<\/a>/,
  'Typing tutorial practice guidance must offer a useful route to common Urdu phrases'
);

const whatsapp = read('urdu-whatsapp-status-maker.html');
const whatsappRelated = whatsapp.match(/<nav class="social-maker-related"[\s\S]*?<\/nav>/)?.[0] || '';
assert.match(
  whatsappRelated,
  /href="\/urdu-phrases-copy-paste"[^>]*>Find a short Urdu phrase for your status<\/a>/,
  'WhatsApp Status Maker related tools must offer phrase ideas for the current task'
);

const invoice = read('urdu-invoice-generator.html');
const invoiceAbout = invoice.match(/<section class="invoice-about seo-content"[\s\S]*?<\/section>/)?.[0] || '';
assert.match(
  invoiceAbout,
  /href="\/urdu-bill-generator"[^>]*>Urdu Bill Generator<\/a>/,
  'Invoice Generator must route quick bill and receipt jobs to Urdu Bill Generator'
);

const bill = read('urdu-bill-generator.html');
const billAbout = bill.match(/<section class="bill-about"[\s\S]*?<\/section>/)?.[0] || '';
assert.match(
  billAbout,
  /href="\/urdu-invoice-generator"[^>]*>Urdu &amp; English Invoice Generator<\/a>/,
  'Bill Generator must keep its existing reciprocal route to Invoice Generator'
);

console.log('Contextual feature discovery contract passed.');
