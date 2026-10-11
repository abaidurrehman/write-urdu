import { launch, newSession, shot, box, step, summarize, BASE, EVID } from './lib.mjs';
import fs from 'node:fs';
const id = process.argv[2]; const browser = await launch(); const R = { id };
for (const device of ['android', 'desktop']) {
  const { context, page, trace } = await newSession(browser, device);
  const t = Date.now();
  const resp = await page.goto(BASE + '/s/' + id, { waitUntil: 'load' }); await page.waitForTimeout(1200);
  const r = { status: resp.status(), loadMs: Date.now() - t, headers: { robots: resp.headers()['x-robots-tag'], csp: resp.headers()['content-security-policy'] } };
  r.meta = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('meta[property^="og:"],meta[name^="twitter:"],meta[name="description"],title')].map(m => [m.getAttribute('property') || m.getAttribute('name') || 'title', m.content || m.textContent])));
  r.img = await box(page, '.share-visual'); r.cta = await box(page, '[data-share-create]'); r.useWords = await box(page, '[data-share-use-text]');
  r.urduFont = await page.evaluate(() => getComputedStyle(document.querySelector('.share-urdu')).fontFamily);
  r.fontsLoaded = await page.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family));
  r.pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  r.shot = await shot(page, `J10-recipient-${device}`); await shot(page, `J10-recipient-${device}-full`, true);
  r.mediaBytes = await page.evaluate(async (id) => (await (await fetch('/share-media/' + id)).arrayBuffer()).byteLength, id);
  // Share button without Web Share
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  await page.locator('[data-share-native]').click(); await page.waitForTimeout(700);
  r.shareBtn = { status: await page.locator('[data-share-status]').innerText(), clip: await page.evaluate(() => navigator.clipboard.readText()).catch(() => '') };
  await page.locator('[data-share-copy-text]').click(); await page.waitForTimeout(500);
  r.copyUrdu = { status: await page.locator('[data-share-status]').innerText(), clip: await page.evaluate(() => navigator.clipboard.readText()).catch(() => '') };
  r.editDesign = await page.locator('[data-share-edit]').count();
  if (device === 'android') {
    await page.locator('[data-share-use-text]').click(); await page.waitForLoadState('load'); await page.waitForTimeout(2500);
    r.useWordsLanding = { url: page.url(), h1: await page.locator('h1').first().innerText().catch(() => '') };
    r.useWordsShot = await shot(page, 'J10-recipient-use-these-words-landing');
    r.useWordsTextInEditor = await page.evaluate(() => { const a = window.WriteUrduCardStudioApp; if (a) return a.getState().text.value; const t = document.querySelector('textarea'); return t && t.value; });
    await page.goto(BASE + '/s/' + id); await page.waitForTimeout(800);
    await page.locator('[data-share-create]').click(); await page.waitForLoadState('load'); await page.waitForTimeout(1500);
    r.createOwnLanding = { url: page.url(), h1: await page.locator('h1').first().innerText().catch(() => '') };
  }
  r.errors = summarize(trace);
  R[device] = r; await context.close();
}
fs.writeFileSync(EVID + '/recipient-' + id + '.json', JSON.stringify(R, null, 1)); console.log(JSON.stringify(R, null, 1).slice(0, 6000));
await browser.close();
