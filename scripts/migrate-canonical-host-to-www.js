const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const oldOrigin = 'https://write-urdu.com';
const newOrigin = 'https://www.write-urdu.com';

function rewrite(relative, transform) {
  const file = path.join(root, relative);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return false;
  const before = fs.readFileSync(file, 'utf8');
  const after = transform(before);
  if (after === before) return false;
  fs.writeFileSync(file, after);
  console.log(`Updated ${relative}`);
  return true;
}

const publicFiles = [
  ...fs.readdirSync(root).filter(name => name.endsWith('.html')),
  'seo.config.js',
  'llms.txt',
  '.well-known/security.txt',
  'js/qr-generator-core.js',
  '.htaccess'
];

let changed = 0;
for (const relative of publicFiles) {
  if (rewrite(relative, before => {
    let after = before.split(oldOrigin).join(newOrigin);
    if (relative === '.htaccess') {
      after = after
        .replace(/!\^write-urdu\\\.com\$/g, '!^www\\.write-urdu\\.com$')
        .replace('keep one HTTPS apex origin', 'keep one HTTPS www origin');
    }
    return after;
  })) changed += 1;
}

if (rewrite('scripts/check-seo.js', before => before
  .replace("config.SITE_ORIGIN !== 'https://write-urdu.com'", "config.SITE_ORIGIN !== 'https://www.write-urdu.com'")
  .replace('SITE_ORIGIN must remain https://write-urdu.com', 'SITE_ORIGIN must remain https://www.write-urdu.com')
  .replace("imageUrl.hostname === 'www.write-urdu.com'", "imageUrl.hostname === 'write-urdu.com'")
  .replace('Open Graph image must not use the legacy www host', 'Open Graph image must not use the alternate apex host')
  .replace('Sitemap directive must use the canonical apex host', 'Sitemap directive must use the canonical www host')
)) changed += 1;

if (rewrite('scripts/check-live-canonical.js', before => before
  .replace("process.env.ALTERNATE_ORIGIN || 'https://www.write-urdu.com'", "process.env.ALTERNATE_ORIGIN || 'https://write-urdu.com'")
  .replace("'www -> apex'", "'apex -> www'")
  .replace("'HTTP apex -> HTTPS apex'", "'HTTP apex -> HTTPS www'")
  .replace("'HTTP www -> HTTPS apex'", "'HTTP www -> HTTPS www'")
)) changed += 1;

console.log(`Canonical-host migration updated ${changed} public/runtime files.`);
