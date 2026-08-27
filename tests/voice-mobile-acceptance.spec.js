const { test, expect } = require('@playwright/test');

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function installRecognitionStub(page, mode = 'success') {
  await page.addInitScript(({ mode }) => {
    class FakeRecognition {
      constructor() {
        this.lang = '';
        this.continuous = false;
        this.interimResults = false;
        this.maxAlternatives = 0;
        window.__voiceRecognition = this;
      }

      start() {
        window.__voiceRecognitionStartCount = (window.__voiceRecognitionStartCount || 0) + 1;
        if (mode === 'denied') {
          queueMicrotask(() => {
            if (this.onerror) this.onerror({ error: 'not-allowed' });
            if (this.onend) this.onend();
          });
          return;
        }
        queueMicrotask(() => {
          if (this.onstart) this.onstart();
          if (this.onaudiostart) this.onaudiostart();
        });
      }

      stop() {
        queueMicrotask(() => { if (this.onend) this.onend(); });
      }

      abort() {
        queueMicrotask(() => { if (this.onend) this.onend(); });
      }

      emit(text, isFinal) {
        const result = { 0: { transcript: text }, isFinal: Boolean(isFinal), length: 1 };
        if (this.onresult) this.onresult({ resultIndex: 0, results: [result] });
      }
    }

    window.SpeechRecognition = FakeRecognition;
    window.webkitSpeechRecognition = FakeRecognition;
    window.__voiceRecognitionStartCount = 0;
  }, { mode });
}

async function installUserAgent(page, userAgent) {
  await page.addInitScript(({ userAgent }) => {
    Object.defineProperty(window.navigator, 'userAgent', {
      configurable: true,
      get: () => userAgent
    });
  }, { userAgent });
}

async function openVoice(page) {
  await blockExternalServices(page);
  await page.goto('/tools/urdu-voice-typing', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.locator('[data-urdu-voice-typing]').waitFor({ state: 'attached' });
}

test('mobile voice path starts from user action, requests Urdu and preserves interim/final text', async ({ page }) => {
  await installRecognitionStub(page, 'success');
  await openVoice(page);

  await expect(page.locator('[data-voice-status-pill]')).toHaveText('Ready');
  expect(await page.evaluate(() => window.__voiceRecognitionStartCount)).toBe(0);

  await page.locator('[data-voice-start]').click();
  await expect(page.locator('[data-voice-status-pill]')).toHaveText('Listening');

  const config = await page.evaluate(() => ({
    lang: window.__voiceRecognition.lang,
    continuous: window.__voiceRecognition.continuous,
    interimResults: window.__voiceRecognition.interimResults,
    maxAlternatives: window.__voiceRecognition.maxAlternatives,
    starts: window.__voiceRecognitionStartCount
  }));
  expect(config).toEqual({
    lang: 'ur-PK',
    continuous: true,
    interimResults: true,
    maxAlternatives: 1,
    starts: 1
  });

  await page.evaluate(() => window.__voiceRecognition.emit('السلام علیکم', false));
  await expect(page.locator('[data-voice-interim]')).toContainText('السلام علیکم');
  await expect(page.locator('#voiceTranscript')).toHaveValue('');

  await page.evaluate(() => window.__voiceRecognition.emit('السلام علیکم', true));
  await expect(page.locator('#voiceTranscript')).toHaveValue('السلام علیکم');

  await page.locator('#voiceTranscript').fill('السلام علیکم دوست');
  await page.evaluate(() => window.__voiceRecognition.emit('آج موسم اچھا ہے', true));
  await expect(page.locator('#voiceTranscript')).toHaveValue('السلام علیکم دوست آج موسم اچھا ہے');

  await page.locator('[data-voice-stop]').click();
  await expect(page.locator('[data-voice-status-pill]')).toHaveText('Text ready');
  await expect(page.locator('#voiceTranscript')).toHaveValue('السلام علیکم دوست آج موسم اچھا ہے');
  await expect(page.locator('[data-voice-start]')).toBeVisible();
});

test('mobile voice permission denial is bounded and leaves the transcript usable', async ({ page }) => {
  await installRecognitionStub(page, 'denied');
  await openVoice(page);

  expect(await page.evaluate(() => window.__voiceRecognitionStartCount)).toBe(0);
  await page.locator('[data-voice-start]').click();

  await expect(page.locator('[data-voice-status-pill]')).toHaveText('Permission blocked');
  await expect(page.locator('[data-voice-notice]')).toContainText('Microphone access was blocked');
  await expect(page.locator('[data-voice-support-note]')).toContainText(/Enable (?:microphone access|the microphone on Android)/);
  await expect(page.locator('[data-voice-support-note]')).toContainText('Microphone to Allow');
  await expect(page.locator('[data-voice-start]')).toBeVisible();

  await page.locator('#voiceTranscript').fill('میں پھر بھی یہاں اردو لکھ سکتا ہوں');
  await expect(page.locator('#voiceTranscript')).toHaveValue('میں پھر بھی یہاں اردو لکھ سکتا ہوں');
});

test('iPhone Safari permission denial shows the exact Safari recovery path', async ({ page }) => {
  await installUserAgent(page, 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1');
  await installRecognitionStub(page, 'denied');
  await openVoice(page);

  await page.locator('[data-voice-start]').click();

  const help = page.locator('[data-voice-support-note]');
  await expect(help).toContainText('Enable the microphone on iPhone or iPad');
  await expect(help).toContainText('Website Settings');
  await expect(help).toContainText('Apps → Safari → Microphone');
});

test('Android permission denial shows the Chrome site-permission recovery path', async ({ page }) => {
  await installUserAgent(page, 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36');
  await installRecognitionStub(page, 'denied');
  await openVoice(page);

  await page.locator('[data-voice-start]').click();

  const help = page.locator('[data-voice-support-note]');
  await expect(help).toContainText('Enable the microphone on Android');
  await expect(help).toContainText('Site settings → Microphone');
  await expect(help).toContainText('write-urdu.com');
});
