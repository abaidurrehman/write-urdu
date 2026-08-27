#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const replacementsByFile = {
  'urdu-card-studio.html': [
    ['Yes. Choose a JPG, PNG or WebP from your device. It stays on your device while you design.', 'Yes. Choose a JPG, PNG or WebP, then adjust its fit, position and overlay in your design.'],
    ['Can I create a card from Roman Urdu?', 'Can I create a card after typing Urdu with English letters?'],
    ['Type Roman Urdu in the basic editor first, then choose Create Urdu Card to send the resulting Urdu text to the Studio without changing your original draft.', 'Type Urdu with English letters in the basic editor first, then choose Create Urdu Card to continue with the resulting Urdu text in Card Studio.'],
    ['Type Roman Urdu in the basic editor', 'Type Urdu with English letters in the basic editor']
  ],
  'write-urdu-sitemap.html': [
    ['Understand what stays on your device, what is sent only when you choose a feature, which outside services are used, and the terms that apply.', 'Understand how Write Urdu handles writing, saved drafts, public shares, accounts, analytics, outside services and the terms that apply.'],
    ['Learn who Write Urdu helps, why core tools need no account and how privacy guides the product.', 'Learn who Write Urdu helps, what you can create and where to find help or privacy information.']
  ]
};

let changed = 0;
for (const [relative, replacements] of Object.entries(replacementsByFile)) {
  const filename = path.join(root, relative);
  const source = fs.readFileSync(filename, 'utf8');
  let next = source;
  for (const [from, to] of replacements) next = next.split(from).join(to);
  if (next !== source) {
    fs.writeFileSync(filename, next, 'utf8');
    changed += 1;
    console.log('Removed final defensive copy in ' + relative);
  }
}
console.log(`Final cleanup updated ${changed} file(s).`);
