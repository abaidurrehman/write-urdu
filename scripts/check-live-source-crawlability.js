'use strict';

const config = require('../seo.config.js');
const templateLibrary = require('../js/template-library-core.js');

const origin = config.SITE_ORIGIN.replace(/\/$/, '');
const timeoutMs = Number(process.env.PRODUCTION_SOURCE_TIMEOUT_MS || 12000);
const failures = [];
const successes = [];

const routes = [
  { area: 'Write', path: '/' },
  { area: 'Create', path: '/urdu-templates' },
  { area: 'Learn', path: '/write-urdu-documentation' },
  { area: 'Trust', path: '/write-urdu-privacy' }
];

function signal() {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') return AbortSignal.timeout(timeoutMs);
  return undefined;
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function h1From(html) {
  const match = String(html || '').match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return match ? decodeHtml(match[1]) : '';
}

function canonicalFrom(html) {
  const match = String(html || '').match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  return match ? match[1].trim() : '';
}

function requirePattern(html, pattern, label, url) {
  if (!pattern.test(html)) failures.push(`${url}: ${label}`);
}

function forbidPattern(html, pattern, label, url) {
  if (pattern.test(html)) failures.push(`${url}: ${label}`);
}

async function fetchSource(pathname) {
  const page = config.byPath[pathname];
  if (!page) {
    failures.push(`${pathname}: missing from seo.config.js`);
    return null;
  }
  const url = config.canonical(page.path);
  try {
    const response = await fetch(url, {
      redirect: 'manual',
      signal: signal(),
      headers: {
        'user-agent': 'WriteUrduProductionSourceAudit/1.0',
        'cache-control': 'no-cache, no-store',
        'pragma': 'no-cache'
      }
    });
    const html = await response.text();
    if (response.status < 200 || response.status >= 300) {
      failures.push(`${url}: expected 2xx, received ${response.status}`);
      return null;
    }
    if (!/text\/html/i.test(response.headers.get('content-type') || '')) {
      failures.push(`${url}: expected text/html, received ${response.headers.get('content-type') || 'unknown content type'}`);
      return null;
    }
    return { page, url, html, response };
  } catch (error) {
    failures.push(`${url}: request failed (${error.message})`);
    return null;
  }
}

async function checkRoute(entry) {
  const result = await fetchSource(entry.path);
  if (!result) return;
  const { page, url, html, response } = result;

  requirePattern(html, /data-wu-static-shell=["']nav["']/i, 'source-visible static navigation missing', url);
  requirePattern(html, /data-wu-static-shell=["']footer["']/i, 'source-visible static footer missing', url);
  requirePattern(html, /<script\b[^>]*type=["']application\/ld\+json["'][^>]*data-write-urdu-schema/i, 'source-visible governed JSON-LD missing', url);

  const expectedCanonical = config.canonical(page.path);
  const actualCanonical = canonicalFrom(html);
  if (actualCanonical !== expectedCanonical) failures.push(`${url}: canonical is "${actualCanonical || 'missing'}", expected "${expectedCanonical}"`);

  const actualH1 = h1From(html);
  if (page.h1 && actualH1 !== decodeHtml(page.h1)) {
    failures.push(`${url}: source H1 is "${actualH1 || 'missing'}", expected "${decodeHtml(page.h1)}"`);
  }

  if (entry.path === '/urdu-templates') {
    requirePattern(html, /<!--\s*wu-static-collection:start:data-template-grid\s*-->/i, 'static template-grid start marker missing', url);
    requirePattern(html, /<!--\s*wu-static-collection:end:data-template-grid\s*-->/i, 'static template-grid end marker missing', url);
    requirePattern(html, /"@type":"ItemList"/i, 'source ItemList schema missing', url);
    const count = (html.match(/data-wu-static-catalogue-item/g) || []).length;
    const expected = (templateLibrary.TEMPLATES || []).length;
    if (count !== expected) failures.push(`${url}: source contains ${count} catalogue cards, expected ${expected}`);
    if (!html.includes(`${expected} templates available`)) failures.push(`${url}: source template count copy is not current`);
  }

  if (entry.path === '/write-urdu-documentation') {
    requirePattern(html, /"@type":"HowTo"/i, 'source HowTo schema missing', url);
  }

  if (entry.path === '/write-urdu-privacy') {
    requirePattern(html, /Product usage analytics/i, 'plain-language analytics disclosure missing', url);
    requirePattern(html, /private deletion key/i, 'plain-language share deletion disclosure missing', url);
    requirePattern(html, /Write Urdu(?:'|&apos;|&#39;)s form service/i, 'plain-language form-service disclosure missing', url);
    forbidPattern(html, /product-telemetry database/i, 'internal product-telemetry database wording leaked into production', url);
    forbidPattern(html, /same-origin Write Urdu Pages Function/i, 'Pages Function implementation wording leaked into production', url);
    forbidPattern(html, /private management token/i, 'management-token implementation wording leaked into production', url);
    forbidPattern(html, /ephemeral tab-session identifier/i, 'ephemeral-session implementation wording leaked into production', url);
    forbidPattern(html, /safe-area guides?/i, 'safe-area implementation wording leaked into production', url);
  }

  successes.push(`${entry.area}: ${response.status} ${url}`);
}

async function main() {
  for (const route of routes) await checkRoute(route);

  successes.forEach(message => console.log(`PRODUCTION SOURCE OK: ${message}`));
  if (failures.length) {
    console.error(failures.map(message => `PRODUCTION SOURCE FAIL: ${message}`).join('\n'));
    process.exit(1);
  }
  console.log(`Production source crawlability verification passed for ${routes.length} representative Write/Create/Learn/Trust routes.`);
}

main().catch(error => {
  console.error(`PRODUCTION SOURCE FAIL: unexpected audit error: ${error.stack || error.message}`);
  process.exit(1);
});
