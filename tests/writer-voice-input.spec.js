const { test, expect } = require('@playwright/test');

const blockExternalServices = page => page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());

async function installRecognitionStub(page) {
  await page.addInitScript(() => {
    class FakeRecognition {
      constructor() {
        window.__writerVoiceConstructCount = (window.__writerVoiceConstructCount || 0) + 1;
        window.__writerVoiceRecognition = this;
      }

      start() {
        window.__writerVoiceStartCount = (window.__writerVoiceStartCount || 0) + 1;
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
    window.__writerVoiceConstructCount = 0;
    window.__writerVoiceStartCount = 0;
  });
}

test('Urdu Keyboard voice shares the same writing target as the on-screen keys', async ({ page }) => {
  await installRecognitionStub(page);
  await blockExternalServices(page);
  await page.goto('/urdu-keyboard.html', { waitUntil: 'commit', timeout: 15000 });

  const editor = page.locator('#write');
  const method = page.locator('[data-wu-voice-method]');
  const panel = page.locator('[data-wu-voice-panel]');
  const start = page.locator('[data-wu-voice-start]');
  const stop = page.locator('[data-wu-voice-stop]');
  const status = page.locator('[data-wu-voice-status]');

  await expect(method).toBeEnabled({ timeout: 10000 });
  expect(await page.evaluate(() => window.__writerVoiceConstructCount)).toBe(0);

  await page.locator('#sater1 input[value="ا"]').click();
  await expect(editor).toHaveValue('ا');

  await method.click();
  await expect(panel).toBeVisible();
  await start.click();
  await expect(status).toHaveText('Listening…');
  await page.evaluate(() => window.__writerVoiceRecognition.emit('بولا ہوا متن', true));
  await expect(editor).toHaveValue('ا بولا ہوا متن');
  await stop.click();
  await expect(status).toHaveText('Text added / stopped');

  await page.locator('#sater1 input[value="ب"]').click();
  await expect(editor).toHaveValue('ا بولا ہوا متنب');
});

test('unsupported Urdu Keyboard voice leaves direct typing and on-screen keys available', async ({ page }) => {
  await page.addInitScript(() => {
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
  });
  await blockExternalServices(page);
  await page.goto('/urdu-keyboard.html', { waitUntil: 'commit', timeout: 15000 });

  const method = page.locator('[data-wu-voice-method]');
  await expect(method).toBeDisabled({ timeout: 10000 });
  await page.locator('#sater1 input[value="ا"]').click();
  await expect(page.locator('#write')).toHaveValue('ا');
});

test('Rich Editor voice inserts into the real TinyMCE document at the current selection', async ({ page }) => {
  await installRecognitionStub(page);
  await blockExternalServices(page);
  await page.goto('/urdu-editor.html', { waitUntil: 'commit', timeout: 15000 });

  const frameBody = page.frameLocator('#basic-example_ifr').locator('body');
  await expect(frameBody).toBeVisible({ timeout: 20000 });
  await frameBody.fill('السلام علیکم');

  const method = page.locator('[data-wu-voice-method]');
  await expect(method).toBeEnabled({ timeout: 20000 });
  await method.click();
  const panel = page.locator('[data-wu-voice-panel]');
  await expect(panel).toBeVisible();
  const start = page.locator('[data-wu-voice-start]');
  const stop = page.locator('[data-wu-voice-stop]');
  const status = page.locator('[data-wu-voice-status]');

  await frameBody.press('End');
  await start.click();
  await expect(status).toHaveText('Listening…');
  await page.evaluate(() => window.__writerVoiceRecognition.emit(' خوش آمدید', true));
  await expect(frameBody).toContainText('السلام علیکم خوش آمدید');
  await stop.click();
  await expect(status).toHaveText('Text added / stopped');

  // Selection replacement: select the whole document via the editor's own
  // selection API, then commit a voice replacement and confirm it replaces
  // the selection rather than appending.
  await page.evaluate(() => {
    var editor = window.tinymce.get('basic-example');
    editor.selection.select(editor.getBody(), true);
  });
  await expect(panel).toBeVisible();
  await start.click();
  await page.evaluate(() => window.__writerVoiceRecognition.emit('بہت شکریہ', true));
  await expect(frameBody).toContainText('بہت شکریہ');
  await expect(frameBody).not.toContainText('السلام علیکم');
  await stop.click();

  // Manual typed correction after voice must survive, and a second voice
  // segment must still land in the shared document afterwards.
  await frameBody.press('End');
  await page.keyboard.type(' یہ دستی تصحیح ہے۔');
  await expect(frameBody).toContainText('یہ دستی تصحیح ہے۔');

  await expect(panel).toBeVisible();
  await start.click();
  await page.evaluate(() => window.__writerVoiceRecognition.emit(' آخری فقرہ۔', true));
  await expect(frameBody).toContainText('آخری فقرہ۔');
  expect(await page.evaluate(() => window.__writerVoiceStartCount)).toBe(3);
});

test('My Documents "Start with voice" handoff opens the Basic Writer panel without requesting the microphone', async ({ page }) => {
  await installRecognitionStub(page);
  await blockExternalServices(page);
  await page.goto('/?wu-voice=1', { waitUntil: 'commit', timeout: 15000 });

  const method = page.locator('[data-wu-basic-voice-method]');
  const panel = page.locator('[data-wu-basic-voice-panel]');
  await expect(method).toBeEnabled({ timeout: 10000 });
  await expect(panel).toBeVisible();
  expect(await page.evaluate(() => window.__writerVoiceConstructCount)).toBe(0);
  expect(new URL(page.url()).searchParams.has('wu-voice')).toBe(false);

  const start = page.locator('[data-wu-basic-voice-start]');
  const status = page.locator('[data-wu-basic-voice-status]');
  await start.click();
  await expect(status).toHaveText('Listening…');
});

test('My Documents voice handoff on an unsupported browser leaves typing available and the panel closed', async ({ page }) => {
  await page.addInitScript(() => {
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
  });
  await blockExternalServices(page);
  await page.goto('/?wu-voice=1', { waitUntil: 'commit', timeout: 15000 });

  const method = page.locator('[data-wu-basic-voice-method]');
  await expect(method).toBeDisabled({ timeout: 10000 });
  await expect(page.locator('[data-wu-basic-voice-panel]')).toBeHidden();
});

test('unsupported Rich Editor voice leaves Roman and direct typing available', async ({ page }) => {
  await page.addInitScript(() => {
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
  });
  await blockExternalServices(page);
  await page.goto('/urdu-editor.html', { waitUntil: 'commit', timeout: 15000 });

  const frameBody = page.frameLocator('#basic-example_ifr').locator('body');
  await expect(frameBody).toBeVisible({ timeout: 20000 });
  const method = page.locator('[data-wu-voice-method]');
  await expect(method).toBeDisabled({ timeout: 20000 });

  await frameBody.fill('یہ عام ٹائپنگ ہے۔');
  await expect(frameBody).toContainText('یہ عام ٹائپنگ ہے۔');
});
