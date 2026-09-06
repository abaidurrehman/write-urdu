const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const runnerFile = path.join(root, 'scripts', 'run-contract-tests.js');
let runner = fs.readFileSync(runnerFile, 'utf8');

const missingContracts = [
  'tests/core-write-auto-ads-locale-exclusions-contract.test.js',
  'tests/mobile-authoring-focus-contract.test.js',
  'tests/mobile-editor-activation-contract.test.js'
];

const runnerAnchor = "  'tests/core-workspace-convergence-contract.test.js',\n";
if (!runner.includes(runnerAnchor)) throw new Error('Contract runner anchor not found');
const contractAdditions = missingContracts.filter((test) => !runner.includes(`  '${test}',`));
if (contractAdditions.length) {
  runner = runner.replace(runnerAnchor, runnerAnchor + contractAdditions.map((test) => `  '${test}',\n`).join(''));
  fs.writeFileSync(runnerFile, runner);
}

const qualityFile = path.join(root, '.github', 'workflows', 'quality.yml');
let quality = fs.readFileSync(qualityFile, 'utf8');
const missingBrowserSpecs = [
  'tests/mobile-editor-activation.spec.js',
  'tests/rich-editor-mobile-activation.spec.js'
];
const qualityAnchor = '          tests/journey.spec.js\n';
if (!quality.includes(qualityAnchor)) throw new Error('Quality workflow Playwright anchor not found');
const browserAdditions = missingBrowserSpecs.filter((test) => !quality.includes(test));
if (browserAdditions.length) {
  quality = quality.replace(qualityAnchor, qualityAnchor + browserAdditions.map((test) => `          ${test}\n`).join(''));
  fs.writeFileSync(qualityFile, quality);
}

fs.unlinkSync(__filename);
console.log(`Validation governance reconciled (${contractAdditions.length} contract owners, ${browserAdditions.length} Playwright specs).`);
