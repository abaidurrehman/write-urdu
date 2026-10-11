import { launch, newSession, shot, box, summarize, BASE, DEVICES } from './lib.mjs';
const browser = await launch();
const out = {};
for (const device of Object.keys(DEVICES)) {
  const { context, page, trace } = await newSession(browser, device);
  const t0 = Date.now();
  await page.goto(BASE + '/urdu-card-studio', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const r = { loadMs: Date.now() - t0 };
  r.firstViewport = await shot(page, `first-impression-card-studio-${device}`);
  r.full = await shot(page, `full-card-studio-${device}`, true);
  for (const [k, sel] of Object.entries({ h1: 'h1', textarea: '#cardText', canvas: '#cardCanvas', publish: '[data-card-action="publish"]', stepPublish: '[data-wu-share-step-publish]', download: '.card-studio-top-actions [data-card-action="download"]', shareImg: '.card-studio-top-actions [data-card-action="share"]', stepper: '[data-card-stepper]', mobileStepbar: '[data-card-mobile-stepbar]', modeSwitch: '.card-studio-mode-switch', sample: '[data-card-content-action="sample"]', templates: '[data-card-templates]', inputMode: '[data-input-mode-control]', batch: '[data-batch-transliteration]', submitCommunity: '[data-card-action="publish-community"]' })) r[k] = await box(page, sel);
  r.pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  r.visibleButtonsFirstViewport = await page.evaluate(() => [...document.querySelectorAll('main button, main a, main select, main input, main textarea')].filter(e => { const b = e.getBoundingClientRect(); return b.width && b.height && b.top < innerHeight && b.bottom > 0 && getComputedStyle(e).visibility !== 'hidden'; }).map(e => (e.innerText || e.getAttribute('aria-label') || e.id || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 40)));
  r.allVisibleControlsInMain = await page.evaluate(() => [...document.querySelectorAll('main button, main a[href], main select, main input, main textarea')].filter(e => { const b = e.getBoundingClientRect(); return b.width && b.height && getComputedStyle(e).visibility !== 'hidden'; }).length);
  r.status = await page.locator('[data-card-status]').innerText().catch(() => '');
  r.translitStatus = await page.locator('[data-card-transliteration-status]').innerText().catch(() => '');
  r.textareaValue = await page.locator('#cardText').inputValue();
  r.smallTargets = await page.evaluate(() => [...document.querySelectorAll('main button, main a[href], main select, main input')].filter(e => { const b = e.getBoundingClientRect(); return b.width && b.height && (b.height < 44 || b.width < 44) && getComputedStyle(e).visibility !== 'hidden'; }).map(e => `${(e.innerText || e.getAttribute('aria-label') || e.type || e.tagName).trim().slice(0, 28)} ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`).slice(0, 40));
  r.errors = summarize(trace);
  out[device] = r;
  await context.close();
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
