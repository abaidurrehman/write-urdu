const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const oldOrigin = 'https://www.write-urdu.com';
const newOrigin = 'https://write-urdu.com';
const oldHost = 'www.write-urdu.com';
const newHost = 'write-urdu.com';

const activeDocs = new Set([
  'docs/CLOUDFLARE-CANONICAL-HOST.md',
  'docs/SEO-POST-DEPLOYMENT.md',
  'docs/SEO-DEPLOYMENT-CHECKLIST.md',
  'docs/SEO-PERFORMANCE-CHECKLIST.md',
  'docs/WU-SEO-AUTHORITY-001.md',
  'docs/P0-SEO-HOST-CONSOLIDATION-2026-08.md'
]);

const textExtensions = new Set([
  '.html', '.js', '.mjs', '.cjs', '.json', '.xml', '.txt', '.md', '.yml', '.yaml', '.css', '.toml'
]);
const rootTextNames = new Set(['.htaccess', '_headers', '_redirects']);
const changed = [];

function relative(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function shouldProcess(file) {
  const rel = relative(file);
  if (rel.startsWith('.git/') || rel.startsWith('node_modules/')) return false;
  if (rel.startsWith('docs/') && !activeDocs.has(rel)) return false;
  if (rel === '.github/workflows/p0-canonical-apex-migration.yml' || rel === 'scripts/p0-migrate-canonical-apex.js') return false;
  return rootTextNames.has(rel) || textExtensions.has(path.extname(file).toLowerCase());
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (shouldProcess(full)) migrateFile(full);
  }
}

function migrateFile(file) {
  let source = fs.readFileSync(file, 'utf8');
  const original = source;
  source = source.split(oldOrigin).join(newOrigin);
  source = source.split(oldHost).join(newHost);

  const rel = relative(file);

  if (rel === 'scripts/check-live-canonical.js') {
    source = source.replace(
      /const alternateOrigin = \(process\.env\.ALTERNATE_ORIGIN \|\| 'https:\/\/write-urdu\.com'\)\.replace\(\/\\\/\$\/, ''\);/,
      "const defaultAlternateOrigin = canonicalOrigin === 'https://write-urdu.com' ? 'https://www.write-urdu.com' : 'https://write-urdu.com';\nconst alternateOrigin = (process.env.ALTERNATE_ORIGIN || defaultAlternateOrigin).replace(/\\\/$/, '');"
    );
    source = source.replace(/'apex -> www'/g, "'alternate -> canonical'");
    source = source.replace(/'missing apex path -> same missing www path'/g, "'missing alternate path -> same missing canonical path'");
    source = source.replace(
      /await expectRedirect\(\n\s*'http:\/\/write-urdu\.com\/\?canonical_audit=1',\n\s*`\$\{canonicalOrigin\}\/\?canonical_audit=1`,\n\s*'HTTP apex -> HTTPS www'\n\s*\);\n\s*await expectRedirect\(\n\s*'http:\/\/write-urdu\.com\/\?canonical_audit=1',\n\s*`\$\{canonicalOrigin\}\/\?canonical_audit=1`,\n\s*'HTTP www -> HTTPS www'\n\s*\);/,
      "await expectRedirect(\n    `${canonicalOrigin.replace('https://', 'http://')}/?canonical_audit=1`,\n    `${canonicalOrigin}/?canonical_audit=1`,\n    'HTTP canonical -> HTTPS canonical'\n  );\n  await expectRedirect(\n    `${alternateOrigin.replace('https://', 'http://')}/?canonical_audit=1`,\n    `${canonicalOrigin}/?canonical_audit=1`,\n    'HTTP alternate -> HTTPS canonical'\n  );"
    );
  }

  if (rel === 'scripts/check-seo.js') {
    source = source.replace(
      "if (imageUrl.hostname === 'write-urdu.com') errors.push(`${file}: Open Graph image must not use the alternate apex host`);",
      "if (imageUrl.hostname === 'www.write-urdu.com') errors.push(`${file}: Open Graph image must not use the alternate www host`);"
    );
    source = source.replace('robots.txt: Sitemap directive must use the canonical www host', 'robots.txt: Sitemap directive must use the canonical host');
  }

  if (rel === '.htaccess') {
    source = source.replace('!^www\\.write-urdu\\.com$', '!^write-urdu\\.com$');
    source = source.replace('keep one HTTPS www origin', 'keep one HTTPS apex origin');
  }

  if (rel === 'docs/CLOUDFLARE-CANONICAL-HOST.md') {
    source = `# Cloudflare canonical host contract\n\n**Canonical production origin:** \`https://write-urdu.com\`\n\nThis is the permanent SEO and infrastructure contract for Write Urdu. Every public production URL must converge on the HTTPS apex host while preserving path and query string. Static HTML canonicals, Open Graph URLs, JSON-LD, sitemap URLs, crawler-discovery files and deliberate first-party absolute URLs must use the same origin.\n\n## Decision\n\nOn 16 August 2026 the project deliberately selected the apex hostname as the permanent public identity. Historical Search Console evidence had previously favored \`www\`, but the product decision is to perform one controlled migration now rather than consolidate to \`www\` and migrate again later. There is no ranking preference inherent in apex versus \`www\`; consistency is the objective.\n\n## Final routing contract\n\n| Variant | Required behavior |\n| --- | --- |\n| \`https://write-urdu.com/page\` | \`200\`, self-canonical |\n| \`https://www.write-urdu.com/page\` | permanent redirect to same apex path/query |\n| \`http://write-urdu.com/page\` | permanent redirect to HTTPS apex |\n| \`http://www.write-urdu.com/page\` | permanent redirect to HTTPS apex |\n| legacy \`.html\` URL | permanent redirect to extensionless apex route |\n| trailing-slash route | permanent redirect to extensionless apex route |\n| production \`pages.dev\` alias | permanent redirect to apex; \`noindex\` remains defense in depth |\n\n## Cloudflare edge rule\n\nCreate a zone-level Single Redirect matching:\n\n\`\`\`text\n(http.host eq "www.write-urdu.com")\n\`\`\`\n\nDynamic target:\n\n\`\`\`text\nconcat("https://write-urdu.com", http.request.uri.path)\n\`\`\`\n\nUse status \`301\` (or a deliberately standardized \`308\`) and preserve the query string. Keep both hostnames attached for DNS/TLS continuity. Do not implement hostname normalization in Cloudflare Pages \`_redirects\`; that file remains path-only.\n\n## Repository source of truth\n\n\`seo.config.js\` must contain:\n\n\`\`\`js\nSITE_ORIGIN = 'https://write-urdu.com'\n\`\`\`\n\n\`npm run seo:check\` validates static canonical/discovery consistency. \`npm run seo:live\` validates deployed hostname behavior.\n\n## Safety rules\n\n- Preserve path and query strings one-to-one.\n- Never redirect missing URLs to the homepage.\n- Do not block the old \`www\` host in robots.txt; crawlers need to observe the redirect.\n- Do not use \`noindex\` or Search Console removals as a substitute for the permanent redirect.\n- Do not combine this migration with another major SEO or route change.\n- Once verified, keep the \`www → apex\` redirect long-lived.\n\n## Verification\n\nAfter the edge switch:\n\n\`\`\`bash\nnpm run seo:live\nnpm run seo:production\n\`\`\`\n\nA release is not complete if \`www\` or the production Pages alias still serves an indexable \`200\` copy.\n`;
  }

  if (rel === 'docs/P0-SEO-HOST-CONSOLIDATION-2026-08.md') {
    source = source.replace('**Status:** Decision locked; migration staged', '**Status:** Step 3 repository migration in progress');
    source = source.replace('At the moment this decision is recorded, production and the repository still declare `https://write-urdu.com` as canonical.', 'The migration release changes the repository canonical source of truth to `https://write-urdu.com`; production routing remains unchanged until the release is deployed and verified.');
    source = source.replace('### Step 3 — Atomic repository canonical migration — NEXT', '### Step 3 — Atomic repository canonical migration — IN PROGRESS');
  }

  if (source !== original) {
    fs.writeFileSync(file, source);
    changed.push(rel);
  }
}

walk(root);

const config = require(path.join(root, 'seo.config.js'));
if (config.SITE_ORIGIN !== newOrigin) {
  throw new Error(`Migration failed: seo.config.js SITE_ORIGIN is ${config.SITE_ORIGIN}, expected ${newOrigin}`);
}

console.log(`P0 canonical migration updated ${changed.length} files to ${newOrigin}.`);
changed.sort().forEach(file => console.log(`- ${file}`));
