const { test, expect } = require('@playwright/test');

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function waitForConvergence(page) {
  await page.waitForFunction(() => Boolean(window.WriteUrduCoreWorkspaceConvergence));
}

async function waitForBasicToolbar(page) {
  await page.waitForFunction(() => Boolean(
    window.WriteUrduBasicCommandToolbar &&
    document.querySelector('[data-wu-basic-command-surface]')
  ));
}

async function installRecognitionStub(page) {
  await page.addInitScript(() => {
    class FakeRecognition {
      constructor() {
        window.__basicVoiceConstructCount = (window.__basicVoiceConstructCount || 0) + 1;
        window.__basicVoiceRecognition = this;
      }

      start() {
        window.__basicVoiceStartCount = (window.__basicVoiceStartCount || 0) + 1;
        queueMicrotask(() => {
          if (this.onstart) this.onstart();
          if (this.onaudiostart) this.onaudiostart();
        });
      }

      stop() { queueMicrotask(() => { if (this.onend) this.onend(); }); }
      abort() { queueMicrotask(() => { if (this.onend) this.onend(); }); }
      emit(text, isFinal) {
        const result = { 0: { transcript: text }, isFinal: Boolean(isFinal), length: 1 };
        if (this.onresult) this.onresult({ resultIndex: 0, results: [result] });
      }
    }

    window.SpeechRecognition = FakeRecognition;
    window.webkitSpeechRecognition = FakeRecognition;
    window.__basicVoiceConstructCount = 0;
    window.__basicVoiceStartCount = 0;
  });
}

test('Basic Writer keeps E0 to input choices + writer and reveals Copy after first value', async ({ page }) => {
  let publishBody = '';
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async payload => { window.__writeUrduSharedPayload = payload; }
    });
  });
  await page.route('**/api/shares', async route => {
    const request = route.request();
    if (request.method() !== 'POST') return route.continue();
    publishBody = request.postDataBuffer() ? request.postDataBuffer().toString('utf8') : '';
    const origin = new URL(request.url()).origin;
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        id: 'Ab12Cd34',
        url: `${origin}/s/Ab12Cd34`,
        manageToken: 'test-management-token'
      })
    });
  });

  await page.goto('/');
  await waitForConvergence(page);
  await waitForBasicToolbar(page);

  const editor = page.locator('#transliterateTextarea');
  const surface = page.locator('[data-wu-basic-command-surface]');
  const toolbar = page.locator('.home-actions[data-wu-basic-command-toolbar]');
  const share = toolbar.locator('[data-wu-command-action="share"]');
  const copy = toolbar.locator('[data-wu-command-action="copy"]');
  const clear = toolbar.locator('[data-wu-command-action="clear"]');
  const mode = toolbar.locator('[data-input-mode-control]');
  const moreToggle = toolbar.locator('[data-wu-basic-more-toggle]');
  const morePanel = toolbar.locator('[data-wu-basic-more-panel]');
  const ensureMoreOpen = async () => {
    if (await moreToggle.getAttribute('aria-expanded') !== 'true') await moreToggle.click();
    await expect(morePanel).toBeVisible();
  };

  await expect(editor).toBeVisible();
  await expect(surface).toBeVisible();
  await expect(toolbar).toBeVisible();
  await expect(toolbar).toHaveAttribute('data-wu-core-actionbar', 'pre-editor');
  await expect(page.locator('.home-actions-group-create')).toHaveCount(0);
  await expect(page.locator('[data-wu-authoring-share-primary]')).toHaveCount(0);
  await expect(toolbar.getByText('Export', { exact: true })).toHaveCount(0);
  await expect(toolbar.getByText('Share text only', { exact: true })).toHaveCount(0);

  const toolbarBeforeCanvas = await page.evaluate(() => {
    const surface = document.querySelector('[data-wu-basic-command-surface]');
    const canvas = document.querySelector('#demo');
    return Boolean(surface && canvas && (surface.compareDocumentPosition(canvas) & Node.DOCUMENT_POSITION_FOLLOWING));
  });
  expect(toolbarBeforeCanvas).toBe(true);

  // E0 (empty): only the input-mode choices and the More disclosure are visible at the top
  // level. Copy and every content-dependent command stay tucked away rather than rendering
  // as a disabled command wall (WU-PLAT-004 §5).
  await expect(copy).toBeHidden();
  await expect(share).toBeHidden();
  await expect(clear).toBeHidden();
  await expect(mode.locator('[data-input-mode-option="roman"]')).toBeEnabled();
  await expect(moreToggle).toBeEnabled();
  await expect(page.locator('[data-wu-basic-mode-helper]')).toContainText('Type Urdu words using English letters');

  await editor.fill('میرا خیال ہے');

  // E1 (first useful text): Copy is promoted to a direct, visible primary action.
  await expect(copy).toBeVisible();
  await expect(copy).toBeEnabled();
  await expect(copy).toHaveText('Copy');

  // Share/PDF/Word/PNG/Preview/Print/Clear remain inside More even at E1 — their promotion
  // to a direct/substantial-writing state is Slice C's job, out of scope for this slice.
  await expect(share).toBeHidden();
  await expect(clear).toBeHidden();

  await ensureMoreOpen();
  await expect(share).toBeVisible();
  await expect(share).toBeEnabled();
  await expect(share).toHaveText('Share');
  await expect(clear).toBeVisible();
  await expect(clear).toBeEnabled();

  const compact = await page.evaluate(() => window.matchMedia('(max-width: 767px)').matches);
  const outputs = ['pdf', 'word', 'png', 'preview', 'print'];
  const outputLabels = { pdf: 'PDF', word: 'Word', png: 'PNG', preview: 'Preview', print: 'Print' };
  if (compact) {
    await expect(morePanel.locator('[data-wu-basic-output-group]')).toBeHidden();
    for (const action of outputs) {
      const control = morePanel.locator(`[data-wu-command-action="${action}"]`);
      await expect(control).toBeVisible();
      await expect(control).toHaveText(outputLabels[action]);
    }
  } else {
    await expect(morePanel.locator('[data-wu-basic-output-group]')).toBeVisible();
    for (const action of outputs) {
      const control = morePanel.locator(`[data-wu-command-action="${action}"]`);
      await expect(control).toBeVisible();
      await expect(control).toHaveText(outputLabels[action]);
    }
  }

  await expect(morePanel.locator('#inputFileNameToSaveAs')).toBeVisible();
  await expect(morePanel.getByText('Text file', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(morePanel).toBeHidden();

  await ensureMoreOpen();
  await share.click();
  const publishDialog = page.locator('.wu-share-dialog');
  await expect(publishDialog).toBeVisible();
  await expect(publishDialog).toContainText('write-urdu.com/s/');
  await expect(publishDialog).toContainText('Publish & get short link');
  expect(publishBody).toBe('');
  expect(await page.evaluate(() => window.__writeUrduSharedPayload || null)).toBeNull();

  await publishDialog.locator('[data-wu-basic-publish-confirm]').click();
  const shortUrl = `${new URL(page.url()).origin}/s/Ab12Cd34`;
  await expect(publishDialog.locator('[data-wu-share-url]')).toHaveValue(shortUrl, { timeout: 10000 });
  expect(publishBody).toContain('name="source_tool"');
  expect(publishBody).toContain('basic_editor');
  expect(publishBody).toContain('name="public_text"');
  expect(publishBody).toContain('name="image"');

  await publishDialog.locator('[data-wu-share-native]').click();
  await page.waitForFunction(() => Boolean(window.__writeUrduSharedPayload));
  const payload = await page.evaluate(() => window.__writeUrduSharedPayload);
  expect(payload.url).toBe(shortUrl);
  expect(payload.text).toBe('Open this Urdu writing on Write Urdu.');
  expect(payload.text).not.toContain('میرا خیال ہے');

  await publishDialog.locator('[data-wu-share-close]').click();
  await ensureMoreOpen();
  await clear.click();
  await expect(editor).toHaveValue('');
  await expect(copy).toBeHidden();
  await page.keyboard.press('Escape');

  const nextStep = page.locator('[data-wu-next-step-version="2"]');
  await editor.fill('ایک نئی تحریر');
  await expect(nextStep).toBeVisible();
  await expect(nextStep.locator('.wu-continue-actions > [data-wu-next-step-action]')).toHaveCount(3);
  await expect(nextStep.locator('[data-wu-next-step-action]')).toHaveCount(4);
  await expect(nextStep.locator('[data-wu-next-step-action="basic-to-templates"]')).toBeAttached();
});

test('Basic Writer promotes PDF/Word directly once writing is substantial (WU-PLAT-002H Gate C)', async ({ page }) => {
  await page.goto('/');
  await waitForConvergence(page);
  await waitForBasicToolbar(page);

  const editor = page.locator('#transliterateTextarea');
  const toolbar = page.locator('.home-actions[data-wu-basic-command-toolbar]');
  const promoted = toolbar.locator('[data-wu-basic-promoted-outputs]');
  const promotedPdf = promoted.locator('[data-wu-command-action="pdf"]');
  const promotedWord = promoted.locator('[data-wu-command-action="word"]');
  const moreToggle = toolbar.locator('[data-wu-basic-more-toggle]');
  const morePanel = toolbar.locator('[data-wu-basic-more-panel]');
  const ensureMoreOpen = async () => {
    if (await moreToggle.getAttribute('aria-expanded') !== 'true') await moreToggle.click();
    await expect(morePanel).toBeVisible();
  };

  const shortText = 'میرا خیال ہے';
  await editor.fill(shortText);

  // E1/E2 (under ~500 chars): PDF/Word stay inside More alongside PNG/Preview/Print, same as
  // Gate B — promotion is state-gated, not a permanent layout change.
  await expect(promoted).toBeHidden();
  await ensureMoreOpen();
  await expect(morePanel.locator('[data-wu-command-action="pdf"]')).toBeVisible();
  await expect(morePanel.locator('[data-wu-command-action="png"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(morePanel).toBeHidden();

  const longText = 'میرا خیال ہے کہ یہ ایک لمبی تحریر ہے۔ '.repeat(20);
  await editor.fill(longText);

  // E3+ (substantial writing, ~500+ chars): PDF/Word become direct, visible primary actions
  // (WU-PLAT-004 §7; UX-STATE-MATRIX.md "PDF/Word: E3+").
  await expect(promoted).toBeVisible();
  await expect(promotedPdf).toBeVisible();
  await expect(promotedPdf).toBeEnabled();
  await expect(promotedPdf).toHaveText('PDF');
  await expect(promotedWord).toBeVisible();
  await expect(promotedWord).toBeEnabled();
  await expect(promotedWord).toHaveText('Word');

  // PNG/Preview/Print remain inside More even for long-form writing — they are not promoted
  // alongside PDF/Word (UX-STATE-MATRIX.md: "PNG ... not equal to PDF/Word for long writing").
  // No duplicate nodes: the same PDF/Word buttons that were inside More moved out, they were
  // not cloned.
  await ensureMoreOpen();
  await expect(morePanel.locator('[data-wu-command-action="pdf"]')).toHaveCount(0);
  await expect(morePanel.locator('[data-wu-command-action="word"]')).toHaveCount(0);
  await expect(morePanel.locator('[data-wu-command-action="png"]')).toBeVisible();
  await expect(morePanel.locator('[data-wu-command-action="preview"]')).toBeVisible();
  await expect(morePanel.locator('[data-wu-command-action="print"]')).toBeVisible();
  await page.keyboard.press('Escape');

  // Dropping back under the threshold demotes PDF/Word back into More, still as the same
  // single nodes (never duplicated).
  await editor.fill(shortText);
  await expect(promoted).toBeHidden();
  await ensureMoreOpen();
  await expect(morePanel.locator('[data-wu-command-action="pdf"]')).toBeVisible();
  await expect(morePanel.locator('[data-wu-command-action="word"]')).toBeVisible();
  await expect(page.locator('[data-wu-command-action="pdf"]')).toHaveCount(1);
  await expect(page.locator('[data-wu-command-action="word"]')).toHaveCount(1);
});

test('Basic Writer makes AI writing help discoverable and keeps review below the editor', async ({ page }) => {
  const original = 'مجھے معلوم تھا کہ مجھے اس کا مسکرانا پسند ہے۔';
  const improved = 'مجھے معلوم تھا کہ مجھے اس کی مسکراہٹ پسند ہے۔';

  await page.addInitScript(() => {
    window.turnstile = {
      render: (_host, options) => {
        window.__aiTurnstileOptions = options;
        return 1;
      },
      reset: () => {},
      execute: () => queueMicrotask(() => window.__aiTurnstileOptions.callback('test-token'))
    };
  });
  await page.route('**/api/form-config', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ aiWritingEnabled: true, turnstileSiteKey: 'test-site-key' })
  }));
  await page.route('**/api/ai-writing', async route => {
    const request = route.request().postDataJSON();
    expect(request.text).toBe(original);
    expect(request.action).toBe('improve');
    expect(request['cf-turnstile-response']).toBe('test-token');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, version: 1, action: 'improve', result: improved })
    });
  });
  await blockExternalServices(page);
  await page.goto('/');
  await waitForConvergence(page);
  await waitForBasicToolbar(page);

  const editor = page.locator('#transliterateTextarea');
  const host = page.locator('[data-wu-ai-writing-host]');
  const jump = page.locator('[data-wu-ai-writing-jump]');

  // E0: the AI writing entry point stays tucked away until there is text to improve — its
  // own click handler already treats empty content as a precondition failure, so the state
  // model gates it the same way as Copy (WU-PLAT-004 §5).
  await expect(jump).toBeHidden();

  const hierarchy = await page.evaluate(() => {
    const editorFrame = document.querySelector('#demo');
    const assistant = document.querySelector('[data-wu-ai-writing-host]');
    const primary = document.querySelector('.wu-basic-command-primary');
    return {
      afterEditor: Boolean(editorFrame && assistant && (editorFrame.compareDocumentPosition(assistant) & Node.DOCUMENT_POSITION_FOLLOWING)),
      outsideToolbar: Boolean(primary && assistant && !primary.contains(assistant))
    };
  });
  expect(hierarchy).toEqual({ afterEditor: true, outsideToolbar: true });

  await editor.fill(original);
  await expect(host).toBeVisible();
  await expect(host).toContainText('AI writing assistant');
  await expect(host).toContainText('Make your Urdu clearer');
  await expect(jump).toBeVisible();
  await expect(jump).toContainText('AI writing');
  await jump.click();
  await expect(host.getByRole('button', { name: 'Fix Urdu' })).toBeFocused();

  await host.getByText('More improvements', { exact: true }).click();
  const menu = host.locator('.wu-ai-writing-menu-panel');
  await expect(menu).toBeVisible();
  await expect(menu).toContainText('Choose how to improve it');
  await expect(menu).toContainText('Clearer, more natural Urdu');
  await menu.getByRole('button', { name: /Improve writing/ }).click();

  const gate = page.locator('[data-wu-ai-writing-age-gate]');
  await expect(gate).toBeVisible();
  await gate.getByRole('button', { name: 'I am 18 or older, continue' }).click();

  const result = host.locator('[data-wu-ai-writing-panel]');
  await expect(result).toBeVisible();
  await expect(result).toContainText('Your suggestion is ready');
  await expect(result.locator('.wu-ai-writing-result-text')).toHaveText(improved);
  await expect(result.locator('.wu-ai-writing-result-text')).toHaveAttribute('dir', 'rtl');
  await expect(editor).toHaveValue(original);

  await result.getByRole('button', { name: 'Replace' }).click();
  await expect(editor).toHaveValue(improved);
  await result.getByRole('button', { name: 'Undo' }).click();
  await expect(editor).toHaveValue(original);

  const geometry = await page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const assistant = document.querySelector('[data-wu-ai-writing-host]').getBoundingClientRect();
    const trigger = document.querySelector('[data-wu-ai-writing-jump]').getBoundingClientRect();
    const actions = Array.from(document.querySelectorAll('.wu-ai-writing-command')).map(node => node.getBoundingClientRect().height);
    return {
      assistantLeft: assistant.left,
      assistantRight: assistant.right,
      triggerLeft: trigger.left,
      triggerRight: trigger.right,
      minActionHeight: Math.min(...actions),
      viewport,
      overflow: document.documentElement.scrollWidth - viewport
    };
  });
  expect(geometry.assistantLeft).toBeGreaterThanOrEqual(0);
  expect(geometry.assistantRight).toBeLessThanOrEqual(geometry.viewport + 1);
  expect(geometry.triggerLeft).toBeGreaterThanOrEqual(0);
  expect(geometry.triggerRight).toBeLessThanOrEqual(geometry.viewport + 1);
  expect(geometry.minActionHeight).toBeGreaterThanOrEqual(44);
  expect(geometry.overflow).toBeLessThanOrEqual(1);
});

test('Basic Writer voice uses the same editable state across Roman and direct corrections', async ({ page }) => {
  await installRecognitionStub(page);
  await blockExternalServices(page);
  await page.goto('/', { waitUntil: 'commit', timeout: 15000 });
  await waitForConvergence(page);
  await waitForBasicToolbar(page);

  const editor = page.locator('#transliterateTextarea');
  const method = page.locator('[data-wu-basic-voice-method]');
  const panel = page.locator('[data-wu-basic-voice-panel]');
  const start = page.locator('[data-wu-basic-voice-start]');
  const stop = page.locator('[data-wu-basic-voice-stop]');
  const status = page.locator('[data-wu-basic-voice-status]');

  await expect(method).toBeEnabled();
  await expect(page.locator('[data-wu-voice-entry="home"]')).toHaveCount(1);
  expect(await page.evaluate(() => window.__basicVoiceConstructCount)).toBe(0);

  await method.evaluate(node => node.click());
  await expect(panel).toBeVisible();
  await expect(status).toHaveText('Ready');
  expect(await page.evaluate(() => window.__basicVoiceConstructCount)).toBe(0);

  await editor.fill('آج موسم اچھا ہے');
  await editor.evaluate(node => node.setSelectionRange(8, 12));
  await start.click();
  await expect(status).toHaveText('Listening…');
  const recognitionConfig = await page.evaluate(() => ({
    lang: window.__basicVoiceRecognition.lang,
    continuous: window.__basicVoiceRecognition.continuous,
    interimResults: window.__basicVoiceRecognition.interimResults,
    maxAlternatives: window.__basicVoiceRecognition.maxAlternatives
  }));
  expect(recognitionConfig).toEqual({ lang: 'ur-PK', continuous: true, interimResults: true, maxAlternatives: 1 });

  await page.evaluate(() => window.__basicVoiceRecognition.emit('عارضی متن', false));
  await expect(editor).toHaveValue('آج موسم اچھا ہے');
  await expect(page.locator('[data-wu-basic-voice-interim]')).toHaveText('عارضی متن');
  await page.evaluate(() => window.__basicVoiceRecognition.emit('بہت اچھا', true));
  await expect(editor).toHaveValue('آج موسم بہت اچھا ہے');
  await stop.click();
  await expect(status).toHaveText('Text added / stopped');

  const methodGeometry = await page.evaluate(() => {
    const controls = Array.from(document.querySelectorAll('[data-input-mode-option], [data-wu-basic-voice-method]'));
    const rects = controls.map(node => node.getBoundingClientRect());
    const control = document.querySelector('[data-input-mode-control]');
    const group = control && control.closest('.wu-basic-command-mode');
    const toolbar = control && control.closest('.wu-basic-command-toolbar');
    const voicePanel = document.querySelector('[data-wu-basic-voice-panel]');
    const box = node => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return { left: rect.left, right: rect.right, width: rect.width, display: style.display, flex: style.flex, grid: style.gridTemplateColumns };
    };
    const overlaps = rects.some((rect, index) => rects.slice(index + 1).some(other => (
      rect.left < other.right && rect.right > other.left && rect.top < other.bottom && rect.bottom > other.top
    )));
    return {
      overlaps,
      rects: rects.map(rect => ({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height })),
      control: box(control),
      group: box(group),
      toolbar: box(toolbar),
      voicePanel: box(voicePanel),
      heights: rects.map(rect => rect.height),
      pageWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth
    };
  });
  expect(methodGeometry.overlaps, JSON.stringify(methodGeometry)).toBe(false);
  for (const rect of methodGeometry.rects) {
    expect(rect.left, JSON.stringify(methodGeometry)).toBeGreaterThanOrEqual(methodGeometry.toolbar.left - 1);
    expect(rect.right, JSON.stringify(methodGeometry)).toBeLessThanOrEqual(methodGeometry.toolbar.right + 1);
  }
  expect(methodGeometry.voicePanel.left, JSON.stringify(methodGeometry)).toBeGreaterThanOrEqual(methodGeometry.toolbar.left - 1);
  expect(methodGeometry.voicePanel.right, JSON.stringify(methodGeometry)).toBeLessThanOrEqual(methodGeometry.toolbar.right + 1);
  expect(Math.min(...methodGeometry.heights)).toBeGreaterThanOrEqual(methodGeometry.viewportWidth <= 767 ? 44 : 40);
  expect(methodGeometry.pageWidth).toBeLessThanOrEqual(methodGeometry.viewportWidth + 1);

  await page.locator('[data-input-mode-option="roman"]').evaluate(node => node.click());
  await editor.evaluate(node => {
    const start = node.value.indexOf('بہت اچھا');
    node.focus();
    node.setSelectionRange(start, start + 'بہت اچھا'.length);
  });
  await page.keyboard.insertText('خوبصورت');
  await expect(editor).toHaveValue('آج موسم خوبصورت ہے');

  await method.evaluate(node => node.click());
  await editor.evaluate(node => {
    node.focus();
    node.setSelectionRange(node.value.length, node.value.length);
  });
  await start.click();
  await page.evaluate(() => window.__basicVoiceRecognition.emit('ہم باہر جائیں گے', true));
  await expect(editor).toHaveValue('آج موسم خوبصورت ہے ہم باہر جائیں گے');
  await stop.click();

  await page.locator('[data-input-mode-option="direct"]').evaluate(node => node.click());
  await editor.evaluate(node => {
    node.focus();
    node.setSelectionRange(0, 2);
  });
  await page.keyboard.insertText('کل');
  await expect(editor).toHaveValue('کل موسم خوبصورت ہے ہم باہر جائیں گے');

  await method.evaluate(node => node.click());
  await editor.evaluate(node => {
    node.focus();
    node.setSelectionRange(node.value.length, node.value.length);
  });
  await start.click();
  await page.evaluate(() => window.__basicVoiceRecognition.emit('پھر واپس آئیں گے', true));
  await expect(editor).toHaveValue('کل موسم خوبصورت ہے ہم باہر جائیں گے پھر واپس آئیں گے');
  expect(await page.evaluate(() => window.__basicVoiceStartCount)).toBe(3);
});

test('unsupported Basic Writer voice leaves Roman and direct typing available', async ({ page }) => {
  await blockExternalServices(page);
  await page.addInitScript(() => {
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
  });
  await page.goto('/', { waitUntil: 'commit', timeout: 15000 });
  await waitForConvergence(page);
  await waitForBasicToolbar(page);

  await expect(page.locator('[data-wu-basic-voice-method]')).toBeDisabled();
  await expect(page.locator('[data-input-mode-option="roman"]')).toBeEnabled();
  await expect(page.locator('[data-input-mode-option="direct"]')).toBeEnabled();
  await page.locator('#transliterateTextarea').fill('عام اردو لکھائی جاری ہے');
  await expect(page.locator('#transliterateTextarea')).toHaveValue('عام اردو لکھائی جاری ہے');
});

test('Urdu Basic Writer voice controls use Urdu labels', async ({ page }) => {
  await installRecognitionStub(page);
  await blockExternalServices(page);
  await page.goto('/urdu/', { waitUntil: 'commit', timeout: 15000 });
  await waitForConvergence(page);
  await waitForBasicToolbar(page);

  const method = page.locator('[data-wu-basic-voice-method]');
  await expect(method).toContainText('بول کر اردو لکھیں');
  await method.evaluate(node => node.click());
  await expect(page.locator('[data-wu-basic-voice-status]')).toHaveText('تیار');
  await expect(page.locator('[data-wu-basic-voice-start]')).toHaveText('آواز سے لکھنا شروع کریں');
  await expect(page.locator('[data-wu-basic-voice-stop]')).toHaveText('آواز سے لکھنا روکیں');
});

test('phone outcome navigation and Basic Writer toolbar stay inside the viewport', async ({ page }) => {
  await page.goto('/');
  await waitForConvergence(page);
  await waitForBasicToolbar(page);

  const phone = await page.evaluate(() => window.matchMedia('(max-width: 560px)').matches);
  if (!phone) return;

  const menuToggle = page.locator('.wu-menu-toggle');
  const nav = page.locator('[data-wu-outcome-nav="v2"]');
  await menuToggle.click();
  await expect(nav).toBeVisible();

  const create = nav.locator('[data-wu-nav-group="create"]');
  const createSummary = create.locator('summary');
  const createPanel = create.locator('.wu-outcome-menu-panel');
  const workSummary = nav.locator('[data-wu-nav-group="work"] > summary');
  await createSummary.click();
  await expect(create).toHaveAttribute('open', '');
  await expect(createPanel).toBeVisible();

  const geometry = await page.evaluate(() => {
    const navNode = document.querySelector('[data-wu-outcome-nav="v2"]');
    const createNode = document.querySelector('[data-wu-nav-group="create"]');
    const summary = createNode && createNode.querySelector('summary');
    const panel = createNode && createNode.querySelector('.wu-outcome-menu-panel');
    const work = document.querySelector('[data-wu-nav-group="work"] > summary');
    const navRect = navNode.getBoundingClientRect();
    const summaryRect = summary.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const workRect = work.getBoundingClientRect();
    const navStyle = getComputedStyle(navNode);
    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      pageScrollWidth: document.documentElement.scrollWidth,
      navLeft: navRect.left,
      navRight: navRect.right,
      navHeight: navRect.height,
      navClientHeight: navNode.clientHeight,
      navScrollHeight: navNode.scrollHeight,
      navOverflowY: navStyle.overflowY,
      summaryHeight: summaryRect.height,
      summaryBottom: summaryRect.bottom,
      panelTop: panelRect.top,
      panelBottom: panelRect.bottom,
      workTop: workRect.top
    };
  });

  expect(geometry.pageScrollWidth).toBeLessThanOrEqual(geometry.viewportWidth + 1);
  expect(geometry.navLeft).toBeGreaterThanOrEqual(-1);
  expect(geometry.navRight).toBeLessThanOrEqual(geometry.viewportWidth + 1);
  expect(geometry.navHeight).toBeLessThanOrEqual(geometry.viewportHeight);
  expect(geometry.navOverflowY).toBe('auto');
  expect(geometry.summaryHeight).toBeLessThan(70);
  expect(geometry.panelTop).toBeGreaterThanOrEqual(geometry.summaryBottom - 1);
  expect(geometry.workTop).toBeGreaterThanOrEqual(geometry.panelBottom - 1);
  expect(geometry.navScrollHeight).toBeGreaterThanOrEqual(geometry.navClientHeight);

  await menuToggle.click();
  await expect(nav).toBeHidden();

  const editor = page.locator('#transliterateTextarea');
  await editor.fill('ایک موبائل تحریر');
  const moreToggle = page.locator('[data-wu-basic-more-toggle]');
  await moreToggle.click();
  await expect(page.locator('[data-wu-basic-more-panel]')).toBeVisible();
  const toolbarGeometry = await page.evaluate(() => {
    const surface = document.querySelector('[data-wu-basic-command-surface]');
    const share = document.querySelector('[data-wu-command-action="share"]');
    const copy = document.querySelector('[data-wu-command-action="copy"]');
    const surfaceRect = surface.getBoundingClientRect();
    const shareRect = share.getBoundingClientRect();
    const copyRect = copy.getBoundingClientRect();
    return {
      width: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      surfaceLeft: surfaceRect.left,
      surfaceRight: surfaceRect.right,
      shareLeft: shareRect.left,
      copyRight: copyRect.right
    };
  });
  expect(toolbarGeometry.scrollWidth).toBeLessThanOrEqual(toolbarGeometry.width + 1);
  expect(toolbarGeometry.surfaceLeft).toBeGreaterThanOrEqual(-1);
  expect(toolbarGeometry.surfaceRight).toBeLessThanOrEqual(toolbarGeometry.width + 1);
  expect(toolbarGeometry.shareLeft).toBeGreaterThanOrEqual(-1);
  expect(toolbarGeometry.copyRight).toBeLessThanOrEqual(toolbarGeometry.width + 1);
  await expect(page.locator('[data-wu-command-action="share"]')).toBeVisible();
  await expect(page.locator('[data-wu-command-action="copy"]')).toBeVisible();
});

test('legacy follow/comment chrome and premature header creation are retired from core workspaces', async ({ page }) => {
  for (const route of ['/', '/urdu-keyboard', '/urdu-editor']) {
    await page.goto(route);
    await waitForConvergence(page);
    await expect(page.locator('.fb-like')).toHaveCount(0);
    await expect(page.locator('.twitter-follow-button')).toHaveCount(0);
    await expect(page.locator('.fb-comments')).toHaveCount(0);
    await expect(page.locator('[data-wu-authoring-share-primary]')).toHaveCount(0);
    await expect(page.locator('body')).toHaveAttribute('data-wu-legacy-social-retired', 'true');
    await expect(page.locator('body')).toHaveAttribute('data-wu-premature-header-action-retired', 'true');
  }
});

test('global navigation uses user-first language for cleaner and image capture', async ({ page }) => {
  await page.goto('/');
  await waitForConvergence(page);
  await expect(page.locator('[data-wu-outcome-nav="v2"]')).toContainText('Fix broken or badly formatted Urdu text');
  await expect(page.locator('[data-wu-outcome-nav="v2"]')).toContainText('Turn an Urdu screenshot or photo into editable text');
});

test('human sitemap follows Write Create Work Learn taxonomy', async ({ page }) => {
  await page.goto('/write-urdu-sitemap');
  await expect(page.locator('main')).toContainText('Write');
  await expect(page.locator('main')).toContainText('Create');
  await expect(page.locator('main')).toContainText('Work');
  await expect(page.locator('main')).toContainText('Learn');
  await expect(page.locator('main')).toContainText('Fix broken or badly formatted Urdu');
  await expect(page.locator('main')).toContainText('Urdu & English Invoice Generator');
});

test('documentation includes all current ways to start with Urdu text', async ({ page }) => {
  await page.goto('/write-urdu-documentation');
  await expect(page.locator('main')).toContainText('Choose how your Urdu starts');
  await expect(page.locator('main')).toContainText('Speak Urdu');
  await expect(page.locator('main')).toContainText('Image to Urdu Text');
  await expect(page.locator('main')).toContainText('Convert older InPage text');
});
