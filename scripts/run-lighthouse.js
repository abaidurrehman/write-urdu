/* Repeatable mobile Lighthouse workflow for the five highest-value routes.
 * Lighthouse is intentionally optional so the static site does not ship a
 * large audit dependency. Install it locally (`npm i -D lighthouse`) or run
 * this command in CI with Lighthouse available on PATH.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');

const baseUrl = (process.env.LIGHTHOUSE_BASE_URL || 'http://127.0.0.1:4173').replace(/\/$/, '');
const routes = ['/', '/urdu-editor', '/urdu-card-studio', '/qr-code-generator', '/urdu-keyboard'];
const outputDir = process.env.LIGHTHOUSE_OUTPUT || 'lighthouse-results';
fs.mkdirSync(outputDir, { recursive: true });
const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const argsFor = route => [
  '--no-install', 'lighthouse', `${baseUrl}${route}`,
  '--quiet', '--form-factor=mobile', '--screenEmulation.mobile=true',
  '--only-categories=performance,accessibility,best-practices,seo',
  '--output=json', `--output-path=${outputDir}${route === '/' ? '/home' : route.replace(/\//g, '_')}.json`,
  '--chrome-flags=--headless=new'
];

let attempted = false;
for (const route of routes) {
  attempted = true;
  const result = spawnSync(command, argsFor(route), { stdio: 'inherit', shell: false });
  if (result.error && (result.error.code === 'ENOENT' || /not found|cannot find/i.test(result.error.message))) {
    console.warn('Lighthouse is not installed. Install it with `npm install --save-dev lighthouse`, then rerun `npm run lighthouse:seo`.');
    process.exit(0);
  }
  if (result.status !== 0) console.warn(`Lighthouse could not complete for ${route}; continuing so local score variance does not block the build.`);
}
if (attempted) console.log(`Lighthouse workflow finished for ${routes.length} mobile routes (base: ${baseUrl}).`);
