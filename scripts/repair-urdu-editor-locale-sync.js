'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const localePath = path.join(root, 'locale', 'ur.js');
let source = fs.readFileSync(localePath, 'utf8');

const marker = "    '/urdu-editor': [";
const start = source.indexOf(marker, source.indexOf('literalReplacements'));
if (start < 0) throw new Error('Could not find /urdu-editor literal replacement section.');
const end = source.indexOf("\n    ],\n    '/", start);
if (end < 0) throw new Error('Could not find end of /urdu-editor literal replacement section.');

let section = source.slice(start, end + 7);

function replacePair(oldPair, newPair) {
  if (section.includes(oldPair)) {
    section = section.replace(oldPair, newPair);
    return;
  }
  if (newPair && section.includes(newPair)) return;
  throw new Error('Expected locale pair was not found: ' + oldPair.slice(0, 100));
}

replacePair(
  "      ['<summary class=\"btn btn-dark\"><i class=\"fas fa-download\" aria-hidden=\"true\"></i> Export</summary>', '<summary class=\"btn btn-dark\"><i class=\"fas fa-download\" aria-hidden=\"true\"></i> برآمد کریں</summary>'],\n",
  ''
);
replacePair(
  "      ['<i class=\"far fa-file-word\" aria-hidden=\"true\"></i> Word document', '<i class=\"far fa-file-word\" aria-hidden=\"true\"></i> Word دستاویز'],",
  "      ['<i class=\"far fa-file-word\" aria-hidden=\"true\"></i> Word</button>', '<i class=\"far fa-file-word\" aria-hidden=\"true\"></i> Word دستاویز</button>'],"
);
replacePair(
  "      ['<i class=\"far fa-file-pdf\" aria-hidden=\"true\"></i> PDF document', '<i class=\"far fa-file-pdf\" aria-hidden=\"true\"></i> PDF دستاویز'],",
  "      ['<i class=\"far fa-file-pdf\" aria-hidden=\"true\"></i> PDF</button>', '<i class=\"far fa-file-pdf\" aria-hidden=\"true\"></i> PDF دستاویز</button>'],"
);
replacePair(
  "      ['<i class=\"far fa-image\" aria-hidden=\"true\"></i> PNG image', '<i class=\"far fa-image\" aria-hidden=\"true\"></i> PNG تصویر'],",
  "      ['<i class=\"far fa-image\" aria-hidden=\"true\"></i> PNG</button>', '<i class=\"far fa-image\" aria-hidden=\"true\"></i> PNG تصویر</button>'],"
);
replacePair(
  "      ['<i class=\"far fa-file-image\" aria-hidden=\"true\"></i> SVG image', '<i class=\"far fa-file-image\" aria-hidden=\"true\"></i> SVG تصویر'],",
  "      ['<i class=\"far fa-file-image\" aria-hidden=\"true\"></i> SVG</button>', '<i class=\"far fa-file-image\" aria-hidden=\"true\"></i> SVG تصویر</button>'],"
);

source = source.slice(0, start) + section + source.slice(end + 7);
fs.writeFileSync(localePath, source, 'utf8');

execFileSync(process.execPath, ['scripts/generate-urdu-locale.js'], { cwd: root, stdio: 'inherit' });
execFileSync(process.execPath, ['tests/urdu-locale-generated-contract.test.js'], { cwd: root, stdio: 'inherit' });

const changed = execFileSync('git', ['diff', '--name-only'], { cwd: root, encoding: 'utf8' })
  .trim()
  .split(/\r?\n/)
  .filter(Boolean);
const allowed = new Set(['locale/ur.js', 'urdu/urdu-editor.html']);
const unexpected = changed.filter((file) => !allowed.has(file));
if (unexpected.length) throw new Error('Unexpected generated changes: ' + unexpected.join(', '));

console.log('Urdu editor locale export-toolbar sync repaired.');
