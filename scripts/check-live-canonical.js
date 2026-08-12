const config = require('../seo.config.js');

const canonicalOrigin = (process.env.CANONICAL_ORIGIN || config.SITE_ORIGIN).replace(/\/$/, '');
const alternateOrigin = (process.env.ALTERNATE_ORIGIN || 'https://www.write-urdu.com').replace(/\/$/, '');
const pagesDevOrigin = (process.env.PAGES_DEV_ORIGIN || '').replace(/\/$/, '');
const timeoutMs = Number(process.env.CANONICAL_AUDIT_TIMEOUT_MS || 10000);
const samplePaths = (process.env.CANONICAL_AUDIT_PATHS || '/,/urdu-editor,/urdu-keyboard,/roman-urdu-transliteration,/write-urdu-documentation')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);

const failures = [];
const successes = [];

function permanent(status) {
  return status === 301 || status === 308;
}

function withTimeout() {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') return AbortSignal.timeout(timeoutMs);
  return undefined;
}

async function request(url) {
  try {
    return await fetch(url, {
      redirect: 'manual',
      signal: withTimeout(),
      headers: { 'user-agent': 'WriteUrduCanonicalAudit/1.0' }
    });
  } catch (error) {
    failures.push(`${url}: request failed (${error.message})`);
    return null;
  }
}

function resolvedLocation(response, sourceUrl) {
  const location = response && response.headers.get('location');
  if (!location) return '';
  try {
    return new URL(location, sourceUrl).href;
  } catch (_) {
    return location;
  }
}

function exactUrl(url) {
  return new URL(url).href;
}

async function expectRedirect(sourceUrl, targetUrl, label) {
  const response = await request(sourceUrl);
  if (!response) return;
  if (!permanent(response.status)) {
    failures.push(`${label}: expected 301/308 from ${sourceUrl}, received ${response.status}`);
    return;
  }
  const actualTarget = resolvedLocation(response, sourceUrl);
  if (!actualTarget) {
    failures.push(`${label}: permanent redirect from ${sourceUrl} has no Location header`);
    return;
  }
  if (exactUrl(actualTarget) !== exactUrl(targetUrl)) {
    failures.push(`${label}: ${sourceUrl} redirects to ${actualTarget}, expected ${targetUrl}`);
    return;
  }
  successes.push(`${label}: ${response.status} ${sourceUrl} -> ${actualTarget}`);
}

async function expectCanonicalPage(pathname) {
  const expectedUrl = new URL(pathname, `${canonicalOrigin}/`).href;
  const response = await request(expectedUrl);
  if (!response) return;
  if (response.status < 200 || response.status >= 300) {
    failures.push(`canonical page: ${expectedUrl} must return 2xx, received ${response.status}`);
    return;
  }
  if (response.headers.get('location')) failures.push(`canonical page: ${expectedUrl} must not redirect`);

  const contentType = response.headers.get('content-type') || '';
  if (/text\/html/i.test(contentType)) {
    const body = await response.text();
    const canonicalMatch = body.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i);
    const declaredCanonical = canonicalMatch ? canonicalMatch[1] : '';
    if (declaredCanonical !== expectedUrl) {
      failures.push(`canonical page: ${expectedUrl} declares ${declaredCanonical || 'no canonical'}, expected ${expectedUrl}`);
      return;
    }
  }
  successes.push(`canonical page: ${response.status} ${expectedUrl}`);
}

async function main() {
  if (canonicalOrigin !== config.SITE_ORIGIN) {
    failures.push(`CANONICAL_ORIGIN ${canonicalOrigin} disagrees with seo.config.js ${config.SITE_ORIGIN}`);
  }

  for (const pathname of samplePaths) {
    await expectCanonicalPage(pathname);

    const queryPath = `${pathname}${pathname.includes('?') ? '&' : '?'}canonical_audit=1`;
    const alternateUrl = new URL(queryPath, `${alternateOrigin}/`).href;
    const canonicalUrl = new URL(queryPath, `${canonicalOrigin}/`).href;
    await expectRedirect(alternateUrl, canonicalUrl, 'www -> apex');
  }

  await expectRedirect(
    'http://write-urdu.com/?canonical_audit=1',
    `${canonicalOrigin}/?canonical_audit=1`,
    'HTTP apex -> HTTPS apex'
  );
  await expectRedirect(
    'http://www.write-urdu.com/?canonical_audit=1',
    `${canonicalOrigin}/?canonical_audit=1`,
    'HTTP www -> HTTPS apex'
  );
  await expectRedirect(
    `${canonicalOrigin}/index.html`,
    `${canonicalOrigin}/`,
    'legacy homepage'
  );
  await expectRedirect(
    `${canonicalOrigin}/urdu-editor.html`,
    `${canonicalOrigin}/urdu-editor`,
    'legacy .html route'
  );
  await expectRedirect(
    `${canonicalOrigin}/urdu-editor/`,
    `${canonicalOrigin}/urdu-editor`,
    'trailing slash route'
  );

  if (pagesDevOrigin) {
    await expectRedirect(
      `${pagesDevOrigin}/urdu-editor?canonical_audit=1`,
      `${canonicalOrigin}/urdu-editor?canonical_audit=1`,
      'pages.dev -> custom domain'
    );
  } else {
    console.warn('CANONICAL AUDIT: PAGES_DEV_ORIGIN is not set; production pages.dev redirect was not tested.');
  }

  successes.forEach(message => console.log(`CANONICAL OK: ${message}`));
  if (failures.length) {
    console.error(failures.map(message => `CANONICAL FAIL: ${message}`).join('\n'));
    process.exit(1);
  }
  console.log(`Canonical-host audit passed for ${samplePaths.length} representative public routes.`);
}

main().catch(error => {
  console.error(`CANONICAL FAIL: unexpected audit error: ${error.stack || error.message}`);
  process.exit(1);
});
