const fs = require('fs');
const path = require('path');
const library = require('../js/template-library-core.js');

const root = path.resolve(__dirname, '..');
const errors = library.validateRegistry(library.TEMPLATES, {
  assetExists(assetPath) {
    return fs.existsSync(path.join(root, assetPath.replace(/^\//, '')));
  }
});

const expected = library.CATEGORY_COUNTS;
Object.keys(expected).forEach(category => {
  const count = library.TEMPLATES.filter(template => template.category === category).length;
  if (count !== expected[category]) errors.push(`${category}: expected ${expected[category]} templates, found ${count}.`);
});

if (errors.length) {
  console.error(errors.map(error => `Template registry: ${error}`).join('\n'));
  process.exit(1);
}

console.log(`Template registry passed: ${library.TEMPLATES.length} templates across ${library.CATEGORIES.length} categories.`);
