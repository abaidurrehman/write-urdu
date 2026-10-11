import { launch, newSession, shot, box, step, summarize, BASE } from './lib.mjs';
import fs from 'node:fs';
const browser = await launch();
const R = { persona: 'P3 Roman Urdu beginner', device: 'android-small 360x780' };
const ROMAN = 'Aap sab ko Jumma Mubarak. Allah aap ko hamesha khush rakhe.';
// ---------- Run A: real environment (Google Input Tools unreachable = provider outage) ----------
{
  const { context, page, trace } = await newSession(browser, 'android-small');
  await page.goto(BASE + '/urdu-card-studio'); await page.waitForTimeout(2500);
  R.A_modeDefault = await page.$eval('[data-input-mode-option="roman"]', e => e.getAttribute('aria-pressed'));
  await page.locator('#cardText').scrollIntoViewIfNeeded();
  await page.locator('#cardText').fill(''); await page.locator('#cardText').tap();
  await page.keyboard.type('Aap sab ko ', { delay: 80 }); await page.waitForTimeout(3000);
  R.A_wordByWord = { value: await page.locator('#cardText').inputValue(), alert: await page.evaluate(() => { const a = [...document.querySelectorAll('[data-input-mode-alert], .input-mode-alert')].find(x => !x.hidden); return a ? a.innerText.trim() : null; }), status: await page.locator('[data-card-transliteration-status]').innerText() };
  step(trace, 'Word-by-word Roman during outage', R.A_wordByWord);
  await shot(page, 'P3-outage-word-by-word');
  await page.locator('#cardText').fill(ROMAN); await page.locator('#cardText').dispatchEvent('input'); await page.waitForTimeout(800);
  R.A_batchPrompt = await page.evaluate(() => { const p = document.querySelector('[data-batch-prompt]'); const b = document.querySelector('[data-batch-action]'); return { prompt: p && !p.hidden && p.innerText, button: b && !b.hidden && b.innerText, buttonTop: b && Math.round(b.getBoundingClientRect().top), textareaTop: Math.round(document.querySelector('#cardText').getBoundingClientRect().top) }; });
  step(trace, 'Pasted full Roman passage', R.A_batchPrompt);
  if (R.A_batchPrompt.button) { await page.locator('[data-batch-action]').tap(); await page.waitForTimeout(4000); }
  R.A_batchResult = { value: await page.locator('#cardText').inputValue(), status: await page.locator('[data-batch-status]').innerText() };
  step(trace, 'Convert passage during outage', R.A_batchResult);
  await page.locator('[data-batch-transliteration]').scrollIntoViewIfNeeded(); await shot(page, 'P3-outage-passage-convert');
  // Does the preview show English letters? Can user still publish Roman text?
  R.A_canvasText = await page.evaluate(() => WriteUrduCardStudioApp.getState().text.value);
  R.A_trace = trace.steps; R.A_errors = summarize(trace);
  await context.close();
}
// ---------- Run B: STUB provider (labelled simulation) to test the surrounding UI ----------
{
  const { context, page, trace } = await newSession(browser, 'android-small');
  const dict = { aap: 'آپ', sab: 'سب', ko: 'کو', jumma: 'جمعہ', mubarak: 'مبارک', allah: 'اللہ', hamesha: 'ہمیشہ', khush: 'خوش', rakhe: 'رکھے' };
  await page.route('https://inputtools.google.com/request**', route => {
    const text = new URL(route.request().url()).searchParams.get('text');
    const out = text.split(/(\s+)/).map(w => { const m = w.match(/^([A-Za-z]+)([.,!?]*)$/); if (!m) return w; return (dict[m[1].toLowerCase()] || m[1]) + m[2].replace('.', '۔'); }).join('');
    route.fulfill({ contentType: 'application/json', body: JSON.stringify(['SUCCESS', [[text, [out]]]]) });
  });
  await page.goto(BASE + '/urdu-card-studio'); await page.waitForTimeout(2500);
  await page.locator('#cardText').scrollIntoViewIfNeeded();
  await page.locator('#cardText').fill(ROMAN + ' Happy Friday!'); await page.locator('#cardText').dispatchEvent('input'); await page.waitForTimeout(600);
  const btn = page.locator('[data-batch-action]');
  R.B_buttonVisible = await btn.isVisible();
  if (R.B_buttonVisible) { await btn.tap(); await page.waitForTimeout(2500); }
  R.B_result = { value: await page.locator('#cardText').inputValue(), status: await page.locator('[data-batch-status]').innerText() };
  step(trace, '[STUB] Convert passage incl. English "Happy Friday!"', R.B_result);
  R.B_correctionUi = await page.evaluate(() => !!document.querySelector('[data-word-suggestions], .goog-transliterate-indic-suggestion-menu-vertical, [data-transliteration-alternatives]'));
  step(trace, '[STUB] Any per-word correction UI after batch conversion?', { present: R.B_correctionUi });
  await page.locator('#cardCanvas').scrollIntoViewIfNeeded(); await page.waitForTimeout(800); await shot(page, 'P3-stub-converted-preview');
  // Choose a design: Format step -> use case "Greeting / Announcement"
  await page.locator('[data-card-mobile-stepbar] [data-card-step="format"]').tap(); await page.waitForTimeout(500);
  await page.locator('[data-card-use-case="announcement"]').scrollIntoViewIfNeeded();
  await page.locator('[data-card-use-case="announcement"]').tap(); await page.waitForTimeout(1200);
  R.B_afterUseCase = await page.evaluate(() => { const s = WriteUrduCardStudioApp.getState(); return { preset: s.presetId, template: s.templateId, value: s.text.value.slice(0, 40) }; });
  step(trace, 'Chose "Greeting / Announcement" use case', R.B_afterUseCase);
  await page.locator('#cardCanvas').scrollIntoViewIfNeeded(); await page.waitForTimeout(600); await shot(page, 'P3-announcement-usecase-preview');
  // Publish & Share (top toolbar)
  await page.locator('[data-card-action="publish"]').scrollIntoViewIfNeeded();
  R.B_publishLabel = await page.locator('[data-card-action="publish"]').innerText();
  await page.locator('[data-card-action="publish"]').tap(); await page.waitForTimeout(800);
  R.B_confirm = await page.locator('dialog.wu-share-dialog').innerText().catch(() => null);
  await shot(page, 'P3-publish-confirmation');
  step(trace, 'Publish & Share tapped → confirmation dialog', { text: (R.B_confirm || '').replace(/\s+/g, ' ').slice(0, 400) });
  const t = Date.now();
  await page.locator('[data-wu-share-confirm]').tap();
  await page.locator('[data-wu-share-url]').waitFor({ timeout: 15000 }).catch(() => {});
  R.B_publishMs = Date.now() - t;
  R.B_url = await page.locator('[data-wu-share-url]').inputValue().catch(() => null);
  R.B_success = (await page.locator('dialog.wu-share-dialog').innerText().catch(() => '')).replace(/\s+/g, ' ');
  await shot(page, 'P3-publish-success');
  step(trace, 'Published', { ms: R.B_publishMs, url: R.B_url });
  // Share link (no Web Share in headless) -> copy fallback
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  await page.locator('[data-wu-share-native]').tap(); await page.waitForTimeout(800);
  R.B_shareLink = { toast: await page.locator('.wu-share-toast').innerText().catch(() => null), clipboard: await page.evaluate(() => navigator.clipboard.readText()).catch(e => String(e)) };
  step(trace, 'Tapped "Share link" (Web Share API unavailable)', R.B_shareLink);
  R.B_mgmt = await page.evaluate(() => localStorage.getItem('writeUrdu.shareManagement.v1'));
  // Edit after publish: change text and look for indication
  await page.keyboard.press('Escape');
  R.B_trace = trace.steps; R.B_errors = summarize(trace);
  await context.close();
}
fs.writeFileSync('p3.json', JSON.stringify(R, null, 1));
await browser.close();
