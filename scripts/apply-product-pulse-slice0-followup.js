const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

function replace(file, before, after) {
  const target = path.join(root, file);
  const source = fs.readFileSync(target, 'utf8');
  if (!source.includes(before)) throw new Error(`Missing Slice 0 follow-up anchor in ${file}`);
  fs.writeFileSync(target, source.replace(before, after));
}

replace(
  'functions/api/internal/product-pulse.js',
  "    mobile_writer_first_input_rate: mobile ? ratio(mobile.writer_first_input, mobile.writer_viewed) : null",
  "    mobile_writer_first_input_rate: mobile ? boundedRate(mobile.writer_first_input, mobile.writer_viewed) : null"
);

replace(
  'tests/product-pulse-slice0-contract.test.js',
  "assert.match(api, /outcome_rate: boundedRate\\(outcomeFirst, firstInput\\)/, 'First outcome must use first-input as the compatible denominator');\n",
  "assert.match(api, /outcome_rate: boundedRate\\(outcomeFirst, firstInput\\)/, 'First outcome must use first-input as the compatible denominator');\nassert.match(api, /mobile_writer_first_input_rate: mobile \\? boundedRate\\(mobile\\.writer_first_input, mobile\\.writer_viewed\\) : null/, 'Mobile first-input rate must use the same bounded denominator semantics');\n"
);

const workflow = path.join(root, '.github', 'workflows', 'apply-product-pulse-slice0-followup.yml');
if (fs.existsSync(workflow)) fs.unlinkSync(workflow);
fs.unlinkSync(__filename);
console.log('Slice 0 mobile denominator follow-up applied.');
