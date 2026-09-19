const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.join(__dirname, '..', 'assets', 'wedding-invitations', 'riwaayat', 'manifest.json');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const embedded = require('../js/riwaayat-manifest.js');

assert.deepEqual(embedded, source, 'js/riwaayat-manifest.js must stay byte-identical to assets/wedding-invitations/riwaayat/manifest.json (this is the sole browser bridge for that data)');

console.log('Riwaayat manifest sync contract passed.');
