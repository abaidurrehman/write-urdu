const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const redirects = fs.readFileSync(path.join(root, '_redirects'), 'utf8');

assert.match(redirects, /^\/write-urdu-feedback \/feedback 301$/m, 'Legacy feedback route must redirect permanently');
assert.match(redirects, /^\/write-urdu-feedback\.html \/feedback 301$/m, 'Legacy feedback HTML route must redirect permanently');
assert.strictEqual(fs.existsSync(path.join(root, 'write-urdu-feedback.html')), false, 'Retired feedback source must not remain as a duplicate HTML document');

console.log('Contact/feedback routing migration contracts passed.');
