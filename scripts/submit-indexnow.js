/*
 * Deployment-only IndexNow notifier.
 *
 * Usage (production only):
 *   INDEXNOW_ENABLED=true INDEXNOW_KEY=... node scripts/submit-indexnow.js /urdu-card-studio /qr-code-generator
 *
 * The script is intentionally non-blocking for deployments. It never sends
 * editor text, QR payloads, project names or uploaded asset names.
 */
const config = require('../seo.config.js');

const enabled = String(process.env.INDEXNOW_ENABLED || '').toLowerCase() === 'true';
if (!enabled) {
  console.log('IndexNow is disabled; no notification sent. Set INDEXNOW_ENABLED=true in production to enable it.');
  process.exit(0);
}

const key = String(process.env.INDEXNOW_KEY || '').trim();
if (!key) {
  console.warn('IndexNow is enabled but INDEXNOW_KEY is missing; deployment continues without submitting URLs.');
  process.exit(0);
}

const known = new Set(config.pages.filter(page => page.indexable).map(page => page.path));
const requested = process.argv.slice(2).concat(String(process.env.INDEXNOW_URLS || '').split(',').map(value => value.trim()).filter(Boolean));
const paths = [...new Set((requested.length ? requested : ['/']).filter(path => known.has(path)))];
if (!paths.length) {
  console.warn('IndexNow received no changed indexable routes; nothing was submitted.');
  process.exit(0);
}

const body = JSON.stringify({
  host: new URL(config.SITE_ORIGIN).host,
  key,
  keyLocation: `${config.SITE_ORIGIN}/${encodeURIComponent(key)}.txt`,
  urlList: paths.map(path => config.canonical(path))
});

(async () => {
  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body
    });
    if (!response.ok) {
      console.warn(`IndexNow returned HTTP ${response.status}; deployment continues.`);
      process.exit(0);
    }
    console.log(`IndexNow accepted ${paths.length} changed canonical route(s).`);
  } catch (error) {
    console.warn(`IndexNow submission failed (${error.message}); deployment continues.`);
  }
})();
