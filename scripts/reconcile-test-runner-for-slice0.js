const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const file = path.join(root, 'scripts', 'run-contract-tests.js');
let source = fs.readFileSync(file, 'utf8');

const missing = [
  'tests/core-write-auto-ads-locale-exclusions-contract.test.js',
  'tests/mobile-authoring-focus-contract.test.js',
  'tests/mobile-editor-activation-contract.test.js'
];

const anchor = "  'tests/core-workspace-convergence-contract.test.js',\n";
if (!source.includes(anchor)) throw new Error('Contract runner anchor not found');
const additions = missing.filter((test) => !source.includes(`  '${test}',`));
if (additions.length) {
  source = source.replace(anchor, anchor + additions.map((test) => `  '${test}',\n`).join(''));
  fs.writeFileSync(file, source);
}

fs.unlinkSync(__filename);
console.log(`Contract runner reconciled (${additions.length} pre-existing missing owners added).`);
