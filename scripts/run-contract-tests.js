const { spawnSync } = require('node:child_process');

const tests = [
  'tests/transliteration-contract.test.js',
  'tests/product-shell-contract.test.js',
  'tests/v2-shell-content-contract.test.js',
  'tests/v2-authority-contract.test.js',
  'tests/seo-authority-contract.test.js',
  'tests/public-language-leakage-contract.test.js',
  'tests/ads-policy-contract.test.js',
  'tests/shell-style-ownership-contract.test.js',
  'tests/product-telemetry-contract.test.js',
  'tests/acquisition-revenue-contract.test.js',
  'tests/product-pulse-contract.test.js',
  'tests/share-loop-contract.test.js',
  'tests/auth-foundation-contract.test.js',
  'tests/documents-contract.test.js',
  'tests/account-documents-basic-contract.test.js',
  'tests/my-documents-contract.test.js',
  'tests/account-documents-editors-contract.test.js',
  'tests/account-growth-entry-contract.test.js',
  'tests/v3-reference-pages-contract.test.js',
  'tests/v3-trust-pages-contract.test.js',
  'tests/v3-utility-pages-contract.test.js',
  'tests/contact-feedback-trust-contract.test.js',
  'tests/contact-feedback-routing-contract.test.js',
  'tests/changelog-contract.test.js',
  'tests/static.test.js',
  'tests/pages-routing-contract.test.js',
  'tests/urdu-locale-route-contract.test.js',
  'tests/urdu-locale-generated-contract.test.js',
  'tests/urdu-locale-seo-contract.test.js',
  'tests/urdu-locale-closeout-contract.test.js',
  'tests/invoice-preview-footer-contract.test.js',
  'tests/sitemap-directory-contract.test.js',
  'tests/stylish-urdu-core.test.js',
  'tests/urdu-text-cleaner-core.test.js',
  'tests/urdu-ocr-contract.test.js',
  'tests/voice-input-core.test.js',
  'tests/urdu-voice-typing-contract.test.js',
  'tests/basic-writer-voice-input-contract.test.js',
  'tests/rich-editor-keyboard-voice-input-contract.test.js',
  'tests/voice-account-analytics-contract.test.js',
  'tests/voice-discovery-launch-contract.test.js',
  'tests/service-worker-navigation-freshness-contract.test.js',
  'tests/inpage-unicode-core.test.js',
  'tests/inpage-unicode-contract.test.js',
  'tests/document-translator-quick-win-contract.test.js',
  'tests/writing-templates-quick-win-contract.test.js',
  'tests/writing-template-gsc-observation-contract.test.js',
  'tests/sua-acceptance-contract.test.js',
  'tests/journey-handoffs-contract.test.js',
  'tests/workspace-journey-runtime.test.js',
  'tests/core-continuity-contract.test.js',
  'tests/outcome-navigation-contract.test.js',
  'tests/workspace-next-step-contract.test.js',
  'tests/core-workspace-convergence-contract.test.js',
  'tests/capture-continuity-contract.test.js',
  'tests/create-publish-boundaries-contract.test.js',
  'tests/v2-creation-contract.test.js',
  'tests/card-studio-acquisition-contract.test.js',
  'tests/english-urdu-typing-acquisition-contract.test.js',
  'tests/serp-intent-optimization-contract.test.js',
  'tests/stylish-urdu-acquisition-contract.test.js',
  'tests/name-art-acquisition-contract.test.js',
  'tests/name-art-task-first-contract.test.js',
  'tests/create-social-voice-input-contract.test.js'
];

function annotationText(value) {
  return String(value || '')
    .replace(/%/g, '%25')
    .replace(/\r/g, '%0D')
    .replace(/\n/g, '%0A')
    .slice(0, 7000);
}

for (const file of tests) {
  const result = spawnSync(process.execPath, [file], { encoding: 'utf8' });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error) {
    console.error(`::error file=${file},title=Contract runner error::${annotationText(result.error.message)}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    const details = (result.stderr || result.stdout || `${file} exited with status ${result.status}`).trim();
    console.error(`::error file=${file},title=Contract test failed::${annotationText(details)}`);
    process.exit(result.status || 1);
  }
}

console.log(`All ${tests.length} contract test files passed.`);