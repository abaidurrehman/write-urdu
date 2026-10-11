import { launch, newSession, shot, box, step, summarize, BASE, EVID } from './lib.mjs';
import fs from 'node:fs';
const browser = await launch(); const R = {};
const fillDirect = async (page, text) => { await page.locator('#cardText').scrollIntoViewIfNeeded(); await page.locator('[data-input-mode-option="direct"]').click(); await page.locator('#cardText').fill(text); await page.waitForTimeout(1200); };
{ // storage unavailable
  const { context, page, trace } = await newSession(browser, 'desktop');
  await page.addInitScript(() => { const thrower = { get() { throw new DOMException('blocked', 'SecurityError'); } }; Object.defineProperty(window, 'localStorage', thrower); Object.defineProperty(window, 'sessionStorage', thrower); Object.defineProperty(window, 'indexedDB', { get() { return undefined; } }); });
  await page.goto(BASE + '/urdu-card-studio'); await page.waitForTimeout(2500);
  await fillDirect(page, 'ذخیرہ دستیاب نہیں'); 
  R.storage = { status: await page.locator('[data-card-status]').innerText(), pageErrors: trace.pageErrors, publishBtn: await page.locator('[data-card-action="publish"]').count() };
  let dl = null; page.once('download', d => dl = d); await page.locator('.card-studio-top-actions [data-card-action="download"]').click(); await page.waitForTimeout(2000); R.storage.download = !!dl;
  await shot(page, 'RES-storage-unavailable'); await context.close();
}
{ // share backend down
  const { context, page, trace } = await newSession(browser, 'android');
  await page.goto('http://127.0.0.1:8791/urdu-card-studio'); await page.waitForTimeout(2500);
  await fillDirect(page, '[TEST] شیئر سروس بند');
  await page.locator('[data-card-action="publish"]').scrollIntoViewIfNeeded(); await page.locator('[data-card-action="publish"]').tap(); await page.waitForTimeout(500);
  await page.locator('[data-wu-share-confirm]').tap(); await page.waitForTimeout(2000);
  R.shareDown = await page.evaluate(() => { const d = document.querySelector('dialog[open]'); return d && d.innerText.replace(/\s+/g, ' '); });
  await shot(page, 'RES-publish-backend-unavailable'); await context.close();
}
{ // slow 3G
  const { context, page, trace } = await newSession(browser, 'android-small');
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: 400 * 1024 / 8, uploadThroughput: 400 * 1024 / 8 });
  const t = Date.now(); await page.goto(BASE + '/urdu-card-studio', { waitUntil: 'domcontentloaded', timeout: 120000 }); R.slow = { dcl: Date.now() - t };
  await page.waitForFunction(() => window.WriteUrduCardStudioApp, null, { timeout: 120000 }); R.slow.appReady = Date.now() - t;
  await page.waitForFunction(() => document.fonts.check('40px "Noto Nastaliq Urdu"', 'اردو'), null, { timeout: 120000 }).catch(() => {}); R.slow.nastaliqReady = Date.now() - t;
  await page.waitForLoadState('load', { timeout: 120000 }).catch(() => {}); R.slow.load = Date.now() - t;
  R.slow.transferKB = await page.evaluate(() => Math.round(performance.getEntriesByType('resource').reduce((a, e) => a + (e.transferSize || 0), 0) / 1024));
  R.slow.resources = await page.evaluate(() => performance.getEntriesByType('resource').length);
  await context.close();
}
{ // normal network transfer size breakdown
  const { context, page } = await newSession(browser, 'android');
  await page.goto(BASE + '/urdu-card-studio'); await page.waitForTimeout(4000);
  R.weight = await page.evaluate(() => { const e = performance.getEntriesByType('resource'); const by = {}; e.forEach(x => { const k = x.initiatorType; by[k] = (by[k] || 0) + (x.transferSize || x.encodedBodySize || 0); }); return { totalKB: Math.round(e.reduce((a, x) => a + (x.transferSize || x.encodedBodySize || 0), 0) / 1024), byType: Object.fromEntries(Object.entries(by).map(([k, v]) => [k, Math.round(v / 1024)])), scripts: e.filter(x => x.initiatorType === 'script').length }; });
  await context.close();
}
{ // Urdu UI
  const { context, page } = await newSession(browser, 'android');
  await page.goto(BASE + '/urdu-card-studio'); await page.waitForTimeout(2000);
  const toggle = page.locator('header a, header button').filter({ hasText: 'اردو' }).first();
  R.urduToggle = await toggle.count();
  if (R.urduToggle) { await toggle.tap(); await page.waitForTimeout(2500); }
  R.urduUi = { url: page.url(), dir: await page.evaluate(() => document.documentElement.dir), h1: await page.locator('h1').first().innerText(), buttons: await page.$$eval('[data-card-studio] button', b => b.filter(x => x.offsetParent).map(x => x.innerText.trim().replace(/\s+/g, ' ')).slice(0, 30)) };
  await shot(page, 'RES-urdu-interface'); 
  await page.locator('[data-card-studio] .card-studio-panel').scrollIntoViewIfNeeded(); await shot(page, 'RES-urdu-interface-panel');
  await context.close();
}
{ // long passage + mixed
  const { context, page } = await newSession(browser, 'desktop');
  await page.goto(BASE + '/urdu-card-studio'); await page.waitForTimeout(2000);
  const long = Array(9).fill('محبت ایک ایسا جذبہ ہے جو انسان کو انسان سے جوڑتا ہے اور زندگی کو خوبصورت بناتا ہے۔').join(' ');
  await fillDirect(page, long);
  R.long = { chars: long.length, fontSize: await page.evaluate(() => WriteUrduCardStudioApp.getState().text.fontSize), warning: await page.locator('[data-card-text-warning]').evaluate(e => !e.hidden && e.textContent) };
  await page.locator('#cardCanvas').scrollIntoViewIfNeeded(); await shot(page, 'RES-long-passage');
  await fillDirect(page, 'Meeting کل 10:30 AM پر ہوگی، Zoom link: meet.example.com/abc');
  await page.locator('#cardCanvas').scrollIntoViewIfNeeded(); await shot(page, 'RES-mixed-urdu-english');
  await context.close();
}
{ // two tabs
  const { context, page } = await newSession(browser, 'desktop');
  const p2 = await context.newPage();
  await page.goto(BASE + '/urdu-card-studio'); await p2.goto(BASE + '/urdu-card-studio'); await page.waitForTimeout(2500);
  await fillDirect(page, 'پہلا ٹیب'); await fillDirect(p2, 'دوسرا ٹیب'); await page.waitForTimeout(1000);
  await fillDirect(page, 'پہلا ٹیب — آخری ترمیم'); await page.waitForTimeout(1500);
  const p3 = await context.newPage(); await p3.goto(BASE + '/urdu-card-studio'); await p3.waitForTimeout(2500);
  R.twoTabs = { reopened: await p3.evaluate(() => WriteUrduCardStudioApp.getState().text.value), tab2Still: await p2.evaluate(() => WriteUrduCardStudioApp.getState().text.value), sameId: await page.evaluate(() => WriteUrduCardStudioApp.getState().id) === await p2.evaluate(() => WriteUrduCardStudioApp.getState().id) };
  await context.close();
}
{ // keyboard
  const { context, page } = await newSession(browser, 'desktop');
  await page.goto(BASE + '/urdu-card-studio'); await page.waitForTimeout(2500);
  let n = 0, found = false; const seen = [];
  for (; n < 120; n++) { await page.keyboard.press('Tab'); const id = await page.evaluate(() => { const a = document.activeElement; return (a.id || a.dataset.cardAction || a.dataset.cardStep || a.innerText || a.tagName).toString().trim().slice(0, 25); }); seen.push(id); if (id === 'cardText') { found = true; break; } }
  R.keyboard = { tabsToTextField: found ? n + 1 : '>120', first15: seen.slice(0, 15) };
  R.focusStyle = await page.evaluate(() => { const a = document.activeElement; const s = getComputedStyle(a); return { outline: s.outlineStyle + ' ' + s.outlineWidth + ' ' + s.outlineColor, boxShadow: s.boxShadow.slice(0, 60) }; });
  R.canvasA11y = await page.evaluate(() => ({ canvasHidden: document.querySelector('#cardCanvas').getAttribute('aria-hidden'), caption: document.querySelector('[data-accessible-card-text]').textContent.slice(0, 60), statusLive: document.querySelector('[data-card-status]').getAttribute('aria-live') }));
  R.contrast = await page.evaluate(() => { const els = [...document.querySelectorAll('.card-studio-action-group-label, .card-studio-help, .wu-share-publish-note, .card-studio-step small, .card-studio-mode-label')]; return els.filter(e => e.offsetParent).slice(0, 8).map(e => { const s = getComputedStyle(e); return [e.className.split(' ')[0], s.color, s.fontSize]; }); });
  await context.close();
}
fs.writeFileSync(EVID + '/resilience.json', JSON.stringify(R, null, 1)); console.log(JSON.stringify(R, null, 1).slice(0, 7000));
await browser.close();
