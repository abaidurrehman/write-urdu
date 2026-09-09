const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const testsDir = path.join(root, 'tests');
let replacements = 0;

for (const name of fs.readdirSync(testsDir)) {
  if (!name.endsWith('.js') && !name.endsWith('.mjs')) continue;
  const file = path.join(testsDir, name);
  const before = fs.readFileSync(file, 'utf8');
  const matches = before.match(/write-urdu-shell-v46/g) || [];
  if (!matches.length) continue;
  const after = before.replace(/write-urdu-shell-v46/g, 'write-urdu-shell-v47');
  fs.writeFileSync(file, after);
  replacements += matches.length;
}

if (replacements !== 10) {
  throw new Error(`Expected 10 current shell-version contract references; updated ${replacements}`);
}
console.log(`Updated ${replacements} shell-version contract references to v47.`);
