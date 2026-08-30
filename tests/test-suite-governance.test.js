const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const testsDir = path.join(root, 'tests');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

function duplicates(values) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))].sort();
}

const runnerSource = read('scripts/run-contract-tests.js');
const contractEntries = [...runnerSource.matchAll(/['"]tests\/([^'"]+\.test\.js)['"]/g)].map(match => match[1]);
assert.deepEqual(duplicates(contractEntries), [], 'Contract runner must not list the same test twice');

const diskContractTests = fs.readdirSync(testsDir).filter(file => file.endsWith('.test.js')).sort();
const ownedContractTests = contractEntries.map(file => path.basename(file)).sort();
assert.deepEqual(
  ownedContractTests,
  diskContractTests,
  'Every .test.js file must be owned exactly once by the contract runner'
);

const playwrightConfig = require('../playwright.config.js');
const configuredSpecs = (Array.isArray(playwrightConfig.testMatch) ? playwrightConfig.testMatch : [playwrightConfig.testMatch])
  .filter(Boolean)
  .map(file => path.basename(String(file)))
  .sort();
assert.deepEqual(duplicates(configuredSpecs), [], 'Playwright testMatch must not contain duplicate spec files');

const diskSpecs = fs.readdirSync(testsDir).filter(file => file.endsWith('.spec.js')).sort();
assert.deepEqual(
  configuredSpecs,
  diskSpecs,
  'Every .spec.js file must be included in Playwright testMatch; stale or manual-only specs must not hide in tests/'
);

const workflowSource = read('.github/workflows/quality.yml');
const workflowSpecs = [...workflowSource.matchAll(/tests\/([A-Za-z0-9._-]+\.spec\.js)/g)]
  .map(match => match[1]);
assert.deepEqual(duplicates(workflowSpecs), [], 'Quality workflow must not run the same browser spec twice');
assert.deepEqual(
  [...workflowSpecs].sort(),
  diskSpecs,
  'Every Playwright spec must protect pull requests in the Quality workflow'
);

console.log(`Test-suite governance passed for ${diskContractTests.length} contract files and ${diskSpecs.length} browser specs.`);
