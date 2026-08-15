const { spawnSync } = require('node:child_process');

const tests = [
  'tests/transliteration-contract.test.js',
  'tests/product-shell-contract.test.js',
  'tests/v2-shell-content-contract.test.js',
  'tests/v2-authority-contract.test.js',
  'tests/seo-authority-contract.test.js',
  'tests/ads-policy-contract.test.js',
  'tests/shell-style-ownership-contract.test.js',
  'tests/product-telemetry-contract.test.js',
  'tests/product-pulse-contract.test.js',
  'tests/v3-reference-pages-contract.test.js',
  'tests/v3-trust-pages-contract.test.js',
  'tests/v3-utility-pages-contract.test.js',
  'tests/contact-feedback-trust-contract.test.js',
  'tests/contact-feedback-routing-contract.test.js',
  'tests/static.test.js',
  'tests/invoice-preview-footer-contract.test.js',
  'tests/sitemap-directory-contract.test.js',
  'tests/stylish-urdu-core.test.js',
  'tests/sua-acceptance-contract.test.js',
  'tests/journey-handoffs-contract.test.js',
  'tests/v2-creation-contract.test.js',
  'tests/card-studio-acquisition-contract.test.js',
  'tests/english-urdu-typing-acquisition-contract.test.js',
  'tests/stylish-urdu-acquisition-contract.test.js',
  'tests/name-art-acquisition-contract.test.js',
  'tests/name-art-task-first-contract.test.js'
];

for (const file of tests) {
  const result = spawnSync(process.execPath, [file], { stdio: 'inherit' });
  if (result.error) {
    console.error(`::error file=${file},title=Contract runner error::${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`::error file=${file},title=Contract test failed::${file} exited with status ${result.status}`);
    process.exit(result.status || 1);
  }
}

console.log(`All ${tests.length} contract test files passed.`);
