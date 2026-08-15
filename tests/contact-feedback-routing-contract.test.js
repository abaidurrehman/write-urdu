const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const redirects = fs.readFileSync(path.join(root, '_redirects'), 'utf8');
const legacy = fs.readFileSync(path.join(root, 'write-urdu-feedback.html'), 'utf8');

assert.match(redirects, /^\/write-urdu-feedback \/feedback 301$/m, 'Legacy feedback route must redirect permanently');
assert.match(redirects, /^\/write-urdu-feedback\.html \/feedback 301$/m, 'Legacy feedback HTML route must redirect permanently');
assert.match(legacy, /name="robots" content="noindex,follow"/, 'Legacy fallback source must stay noindex');
assert.match(legacy, /rel="canonical" href="https:\/\/www\.write-urdu\.com\/feedback"/, 'Legacy fallback source must point at the new canonical feedback route');
assert.match(legacy, /href="\/feedback"/, 'Legacy fallback source should offer a direct canonical link if redirects are bypassed');

console.log('Contact/feedback routing migration contracts passed.');
