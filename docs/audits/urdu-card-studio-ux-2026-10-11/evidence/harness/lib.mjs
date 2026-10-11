import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const HERE = path.dirname(fileURLToPath(import.meta.url));

export const BASE = process.env.WU_BASE || 'http://127.0.0.1:8790';
// New runs write here (git-ignored) so the committed 2026-10-11 evidence is never overwritten.
export const EVID = process.env.WU_AUDIT_OUT || path.join(HERE, 'out');
export const LAUNCH = process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {};
fs.mkdirSync(EVID, { recursive: true });

export const DEVICES = {
  'android-small': { viewport: { width: 360, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A135F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36' },
  'android': { viewport: { width: 393, height: 852 }, deviceScaleFactor: 2.75, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36' },
  'iphone': { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' },
  'tablet': { viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  'desktop': { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }
};

export async function launch() {
  return chromium.launch({ ...LAUNCH, args: ['--font-render-hinting=none'] });
}

export async function newSession(browser, device, opts = {}) {
  const context = await browser.newContext({ ...DEVICES[device], acceptDownloads: true, locale: 'en-PK', ...opts });
  const page = await context.newPage();
  const trace = { console: [], pageErrors: [], failed: [], steps: [] };
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) trace.console.push(`${m.type()}: ${m.text()}`.slice(0, 300)); });
  page.on('pageerror', e => trace.pageErrors.push(String(e).slice(0, 300)));
  page.on('requestfailed', r => trace.failed.push(`${r.failure()?.errorText} ${r.url().slice(0, 140)}`));
  // Production shows Google's ad-consent dialog (Funding Choices) to some regions; it blocks every tap.
  // Decline it once so the journey can continue, and record that it appeared.
  await page.addLocatorHandler(page.locator('.fc-consent-root .fc-dialog-overlay').first(), async () => {
    trace.steps.push({ t: Date.now(), text: 'Ad-consent dialog dismissed (Do not consent)' });
    const decline = page.locator('.fc-consent-root .fc-cta-do-not-consent, .fc-consent-root .fc-close').first();
    await (await decline.count() ? decline : page.locator('.fc-consent-root .fc-cta-consent').first()).click();
  }, { noWaitAfter: false });
  page.on('dialog', async d => { trace.steps.push({ dialog: d.type(), message: d.message() }); await (trace.dialogAnswer === false ? d.dismiss() : d.accept()); });
  return { context, page, trace };
}

export async function shot(page, name, full = false) {
  const file = path.join(EVID, name + '.png');
  await page.screenshot({ path: file, fullPage: full });
  return path.relative(HERE, file);
}

export function step(trace, text, extra) { const s = { t: Date.now(), text, ...(extra || {}) }; trace.steps.push(s); console.log('  ·', text, extra ? JSON.stringify(extra).slice(0, 300) : ''); }

export async function box(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const st = getComputedStyle(el);
    return { top: Math.round(r.top + scrollY), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height), visible: !!(r.width && r.height) && st.visibility !== 'hidden' && st.display !== 'none', inFirstViewport: r.top + scrollY < innerHeight && r.bottom > 0 };
  }, selector);
}

export function summarize(trace) {
  const uniq = a => [...new Set(a)];
  return { console: uniq(trace.console).slice(0, 15), pageErrors: uniq(trace.pageErrors), failed: uniq(trace.failed.map(f => f.replace(/\?.*$/, ''))).slice(0, 20) };
}
