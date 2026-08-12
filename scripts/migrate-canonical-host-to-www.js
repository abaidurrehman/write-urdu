const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const oldOrigin = 'https://write-urdu.com';
const newOrigin = 'https://www.write-urdu.com';

const files = [
  ...fs.readdirSync(root).filter(name => name.endsWith('.html')),
  'seo.config.js',
  'llms.txt',
  '.well-known/security.txt',
  'js/qr-generator-core.js',
  '.htaccess'
];

let changed = 0;
for (const relative of files) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
  const before = fs.readFileSync(file, 'utf8');
  let after = before.split(oldOrigin).join(newOrigin);

  if (relative === '.htaccess') {
    after = after.replace(/!\^write-urdu\\\.com\$/g, '!^www\\.write-urdu\\.com$');
  }

  if (after !== before) {
    fs.writeFileSync(file, after);
    changed += 1;
    console.log(`Updated ${relative}`);
  }
}

console.log(`Canonical-host migration updated ${changed} public/runtime files.`);
