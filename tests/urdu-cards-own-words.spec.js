const { test, expect } = require('@playwright/test');
const cards = require('../js/urdu-cards-data.js').getAllCards();

const cardCount = cards.length;
const uniqueDesignCount = new Set(cards.map(card => card.backgroundId)).size;
const originalDua = cards.find(card => card.id === 'dua-1').textUr;
const blockExternal = page => page.route(/^https?:\/\/(?!127\.0\.0\.1(?::\d+)?(?:\/|$))/, route => route.abort());

async function installSpeechRecognitionMock(page) {
  await page.addInitScript(() => {
    class MockSpeechRecognition {
      constructor() {
        this.lang = '';
        this.continuous = false;
        this.interimResults = false;
        this.maxAlternatives = 0;
        window.__urduCardsRecognition = this;
        window.__urduCardsVoiceStopCalls = 0;
      }
      start() {
        if (typeof this.onstart === 'function') this.onstart();
      }
      stop() {
        window.__urduCardsVoiceStopCalls += 1;
        if (typeof this.onend === 'function') this.onend();
      }
      abort() {
        if (typeof this.onend === 'function') this.onend();
      }
    }
    window.SpeechRecognition = undefined;
    window.webkitSpeechRecognition = MockSpeechRecognition;
  });
}

async function disableSpeechRecognition(page) {
  await page.addInitScript(() => {
    window.SpeechRecognition = undefined;
    window.webkitSpeechRecognition = undefined;
  });
}

async function openCards(page, path = '/urdu-cards') {
  await blockExternal(page);
  await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await expect(page.locator('.card-gallery-card')).toHaveCount(cardCount);
  await expect.poll(() => page.evaluate(() => Boolean(window.WriteUrduCardsOwnWords))).toBe(true);
}

async function openOwnWords(page) {
  const choice = page.locator('[data-urdu-cards-start-choice="own-words"]');
  await expect(choice).toHaveAttribute('href', /urdu-card-gallery/); // no-JS fallback remains intact
  await choice.click();
  await expect(page.locator('[data-urdu-cards-own-words]')).toBeVisible();
  await expect(page.locator('[data-urdu-cards-own-input]')).toBeFocused();
}

async function seedPublicShareHandoff(page, actionId, text, sourceWorkspace = 'public-share') {
  await page.addInitScript(({ actionId, text, sourceWorkspace }) => {
    const now = Date.now();
    sessionStorage.setItem('write-urdu:workspace-handoff:v2:urdu-cards', JSON.stringify({
      version: 2,
      id: 'test-public-share-entry',
      createdAt: now,
      expiresAt: now + 30 * 60 * 1000,
      source: { workspace: sourceWorkspace, route: '/s/AbCd1234', intent: actionId.includes('use-public-text') ? 'use_public_text' : 'create_own' },
      target: { workspace: 'urdu-cards', route: '/urdu-cards' },
      actionId,
      payload: { kind: 'plain-text', text },
      context: {}
    }));
  }, { actionId, text, sourceWorkspace });
}

async function openPublicShareFixture(page, shared) {
  await blockExternal(page);
  await page.route('**/s/AbCd1234', route => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/css/share-page.css"></head><body><main class="share-shell"><div class="share-layout"><article class="share-card"><img class="share-visual" alt="Shared Urdu card" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='720' height='900'/%3E"><div class="share-media-actions"><button class="share-button share-media-action" data-share-native>Share</button><a class="share-button share-media-action" data-share-download href="/share-media/AbCd1234?download=1">Download PNG</a><button class="share-button share-media-action" data-share-copy-text>Copy Urdu</button></div><h2 data-share-public-text>${shared}</h2></article><aside class="share-panel"><a class="share-hero-cta" href="/urdu-cards" data-share-create>Make your own Urdu card</a><div class="share-actions"><button class="share-button secondary" data-share-use-text>Use these words</button><a class="share-button quiet" href="/urdu-card-studio" data-share-edit>Edit these words in Card Studio</a><button class="share-button quiet" data-share-copy>Copy link</button></div><details class="share-report"><summary>Report this shared page</summary><div class="share-report-form"><select data-share-report-reason><option value="">Choose reason</option><option value="spam">Spam</option></select><button data-share-report>Report</button></div></details><p data-share-status></p></aside></div></main><script src="/js/workspace-journey-registry.js"></script><script src="/js/workspace-handoff.js"></script><script src="/js/share-loop-telemetry.js"></script><script src="/js/share-page.js"></script></body></html>`
  }));
  await page.goto('/s/AbCd1234', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-share-create]')).toBeVisible();
}

test('public share primary CTA reaches a clean fresh Urdu Cards composer', async ({ page }) => {
  const source = 'اصل عوامی متن تازہ کارڈ میں نہیں آنا چاہیے';
  await openPublicShareFixture(page, source);
  await page.locator('[data-share-create]').click();

  await expect(page).toHaveURL(/\/urdu-cards$/);
  await expect.poll(() => page.evaluate(() => Boolean(window.WriteUrduCardsOwnWords))).toBe(true);
  await expect(page.locator('[data-urdu-cards-own-words]')).toBeVisible();
  await expect(page.locator('[data-urdu-cards-own-input]')).toHaveValue('');
  expect(page.url()).not.toContain('AbCd1234');
  expect(decodeURIComponent(page.url())).not.toContain(source);
});

test('public share secondary CTA restores exact words with clean mobile navigation', async ({ page }) => {
  const source = 'محبت بانٹنے سے بڑھتی ہے۔';
  await page.setViewportSize({ width: 360, height: 800 });
  await openPublicShareFixture(page, source);

  await expect(page.locator('[data-share-native]')).toBeVisible();
  await expect(page.locator('[data-share-copy]')).toBeVisible();
  await expect(page.locator('[data-share-download]')).toBeVisible();
  await expect(page.locator('.share-report')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);

  await page.locator('[data-share-use-text]').click();
  await expect(page).toHaveURL(/\/urdu-cards$/);
  await expect(page.locator('[data-urdu-cards-own-input]')).toHaveValue(source);
  expect(page.url()).not.toContain('AbCd1234');
  expect(decodeURIComponent(page.url())).not.toContain(source);
});

test('public share fresh start opens own words without copying source text', async ({ page }) => {
  await seedPublicShareHandoff(page, 'share-to-urdu-cards-create-own', 'یہ متن تازہ آغاز میں نہیں آنا چاہیے');
  await openCards(page);

  await expect(page).toHaveURL(/\/urdu-cards$/);
  await expect(page.locator('[data-urdu-cards-own-words]')).toBeVisible();
  await expect(page.locator('[data-urdu-cards-own-input]')).toBeFocused();
  await expect(page.locator('[data-urdu-cards-own-input]')).toHaveValue('');
  expect(await page.evaluate(() => sessionStorage.getItem('write-urdu:workspace-handoff:v2:urdu-cards'))).toBeNull();
});

test('public share words restore into existing own-words state and handoff is consumed', async ({ page }) => {
  const shared = 'یہ جان بوجھ کر عوامی کیے گئے اردو الفاظ ہیں۔';
  await seedPublicShareHandoff(page, 'share-to-urdu-cards-use-public-text', shared);
  await openCards(page);

  await expect(page).toHaveURL(/\/urdu-cards$/);
  await expect(page.locator('[data-urdu-cards-own-input]')).toHaveValue(shared);
  await expect(page.locator('#card-dua-1 .card-gallery-preview-text')).toHaveText(shared);
  expect(await page.evaluate(() => sessionStorage.getItem('write-urdu:workspace-handoff:v2:urdu-cards'))).toBeNull();
  expect(decodeURIComponent(new URL(page.url()).href)).not.toContain(shared);

  await page.locator('[data-urdu-cards-own-input]').fill(`${shared} مزید`);
  await expect(page.locator('#card-dua-1 .card-gallery-preview-text')).toHaveText(`${shared} مزید`);

  const localValues = await page.evaluate(() => Object.values(localStorage));
  expect(JSON.stringify(localValues)).not.toContain(shared);

  await page.setViewportSize({ width: 360, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test('unrelated workspace cannot inject public-share words into Urdu Cards', async ({ page }) => {
  const rejected = 'یہ غیر متعلقہ ذریعے کا متن ہے';
  await seedPublicShareHandoff(page, 'share-to-urdu-cards-use-public-text', rejected, 'basic-writer');
  await openCards(page);

  await expect(page.locator('[data-urdu-cards-own-input]')).toHaveCount(1);
  await expect(page.locator('[data-urdu-cards-own-input]')).toHaveValue('');
  await expect(page.locator('[data-urdu-cards-status]')).toContainText('could not be restored');
  expect(await page.evaluate(() => sessionStorage.getItem('write-urdu:workspace-handoff:v2:urdu-cards'))).toBeNull();
});

test('Use my own words opens inline and keeps the cards route', async ({ page }) => {
  await openCards(page);
  await openOwnWords(page);

  await expect(page).toHaveURL(/\/urdu-cards$/);
  await expect(page.locator('[data-urdu-cards-own-words] h2')).toHaveText('Use your own words');
  await expect(page.locator('[data-input-mode-control]')).toBeVisible();
  await expect(page.locator('[data-urdu-cards-start-choice="own-words"]')).toHaveAttribute('aria-expanded', 'true');
});

test('own Urdu text replaces previews and collapses duplicate backgrounds to unique designs', async ({ page }) => {
  await openCards(page);
  await openOwnWords(page);

  const custom = 'اللہ آپ کو ہمیشہ خوش رکھے اور ہر قدم پر آسانی عطا فرمائے۔';
  await page.locator('[data-urdu-cards-own-input]').fill(custom);

  await expect(page.locator('.card-gallery-card:visible')).toHaveCount(uniqueDesignCount);
  await expect(page.locator('[data-urdu-cards-count]')).toHaveText(`${uniqueDesignCount} designs`);
  await expect(page.locator('[data-urdu-cards-filters]')).toBeHidden();
  await expect(page.locator('#card-dua-1 .card-gallery-preview-text')).toHaveText(custom);
  await expect(page.locator('#card-dua-1 [data-urdu-cards-share]')).toBeHidden();
  await expect(page.locator('#card-dua-1 [data-urdu-cards-favorite]')).toBeHidden();

  const state = await page.evaluate(() => window.WriteUrduCardsOwnWords.getState());
  expect(state).toMatchObject({ active: true, composerOpen: true, designCount: uniqueDesignCount, textLength: custom.length });
});

test('existing image share and personalization actions receive the custom text', async ({ page }) => {
  await openCards(page);
  await openOwnWords(page);

  const custom = 'میری پیاری امی، اللہ آپ کو ہمیشہ سلامت اور خوش رکھے۔';
  await page.evaluate(() => {
    window.__ownWordsSharedText = null;
    window.WriteUrduWhatsAppStatusShare = {
      shareCard: async () => ({ result: 'shared' }),
      shareImage: async card => {
        window.__ownWordsSharedText = card.textUr;
        return { result: 'shared', width: 720, height: 900 };
      }
    };
  });
  await page.locator('[data-urdu-cards-own-input]').fill(custom);

  await page.locator('[data-urdu-cards-image-share="dua-1"]').click();
  await expect.poll(() => page.evaluate(() => window.__ownWordsSharedText)).toBe(custom);

  await page.locator('[data-urdu-cards-edit="dua-1"]').click();
  await expect(page.locator('[data-urdu-cards-personalizer-text="dua-1"]')).toHaveValue(custom);
});

test('clearing or leaving own-words mode restores the complete ready-made gallery', async ({ page }) => {
  await openCards(page);
  await openOwnWords(page);

  await page.locator('[data-urdu-cards-own-input]').fill('یہ میرا اپنا پیغام ہے۔');
  await expect(page.locator('.card-gallery-card:visible')).toHaveCount(uniqueDesignCount);

  await page.locator('[data-urdu-cards-own-clear]').click();
  await expect(page.locator('.card-gallery-card:visible')).toHaveCount(cardCount);
  await expect(page.locator('[data-urdu-cards-count]')).toHaveText(`${cardCount} cards`);
  await expect(page.locator('#card-dua-1 .card-gallery-preview-text')).toHaveText(originalDua);
  await expect(page.locator('[data-urdu-cards-filters]')).toBeVisible();
  expect(await page.evaluate(() => window.WriteUrduCardsOwnWords.getState().active)).toBe(false);

  await page.locator('[data-urdu-cards-own-back]').click();
  await expect(page.locator('[data-urdu-cards-own-words]')).toBeHidden();
  await expect(page).toHaveURL(/\/urdu-cards$/);
});

test('custom Urdu text is never persisted in browser storage by the cards journey', async ({ page }) => {
  await openCards(page);
  await openOwnWords(page);

  const custom = 'نجی پیغام ۹۸۷۶۵ صرف اسی ٹیسٹ کے لیے';
  await page.evaluate(() => {
    window.WriteUrduWhatsAppStatusShare = {
      shareCard: async () => ({ result: 'shared' }),
      shareImage: async () => ({ result: 'shared', width: 720, height: 900 })
    };
  });
  await page.locator('[data-urdu-cards-own-input]').fill(custom);
  await page.locator('[data-urdu-cards-image-share="dua-1"]').click();

  const storage = await page.evaluate(() => {
    const values = {};
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      values[key] = localStorage.getItem(key);
    }
    return values;
  });
  expect(JSON.stringify(storage)).not.toContain(custom);
  expect(storage['writeUrdu.urduCardsRecents.v1']).toContain('dua-1');
});

test('own-words input reuses the existing Roman Urdu transliteration adapter', async ({ page }) => {
  await openCards(page);
  await page.evaluate(() => {
    window.__transliterationTargets = [];
    window.google = {
      load: () => {},
      setOnLoadCallback: callback => callback(),
      elements: {
        transliteration: {
          LanguageCode: { ENGLISH: 'en', URDU: 'ur' },
          TransliterationControl: function () {
            this.makeTransliteratable = ids => { window.__transliterationTargets = ids.slice(); };
            this.enableTransliteration = () => {};
            this.disableTransliteration = () => {};
          }
        }
      }
    };
  });

  await openOwnWords(page);
  await expect.poll(() => page.evaluate(() => window.__transliterationTargets)).toContain('urduCardsOwnText');
  await expect(page.locator('[data-input-mode-control]')).toHaveAttribute('data-input-mode', 'roman');

  await page.locator('[data-input-mode-option="direct"]').click();
  await expect(page.locator('[data-input-mode-control]')).toHaveAttribute('data-input-mode', 'direct');
  await page.locator('[data-urdu-cards-own-input]').fill('اردو براہ راست بھی کام کرتی ہے۔');
  await expect(page.locator('#card-dua-1 .card-gallery-preview-text')).toHaveText('اردو براہ راست بھی کام کرتی ہے۔');
});

test('Speak Urdu inserts final speech into the same own-words textarea and card previews', async ({ page }) => {
  await installSpeechRecognitionMock(page);
  await openCards(page);
  await openOwnWords(page);

  const method = page.locator('[data-wu-voice-method]');
  await expect(method).toBeVisible();
  await expect(method).toBeEnabled();
  await expect(method.locator('[data-wu-voice-label]')).toHaveText('Speak Urdu');
  await method.click();
  await expect(page.locator('[data-wu-voice-panel]')).toBeVisible();
  await page.locator('[data-wu-voice-start]').click();
  await expect(page.locator('[data-wu-voice-status]')).toHaveText('Listening…');
  expect(await page.evaluate(() => window.__urduCardsRecognition.lang)).toBe('ur-PK');

  const spoken = 'اللہ آپ کو ہمیشہ خوش رکھے';
  await page.evaluate(text => {
    const result = [{ transcript: text }];
    result.isFinal = true;
    window.__urduCardsRecognition.onresult({ resultIndex: 0, results: [result] });
  }, spoken);

  await expect(page.locator('[data-urdu-cards-own-input]')).toHaveValue(spoken);
  await expect(page.locator('#card-dua-1 .card-gallery-preview-text')).toHaveText(spoken);
  await expect(page.locator('[data-urdu-cards-count]')).toHaveText(`${uniqueDesignCount} designs`);

  await page.locator('[data-urdu-cards-own-back]').click();
  await expect.poll(() => page.evaluate(() => window.__urduCardsVoiceStopCalls)).toBe(1);
  await expect(page.locator('[data-urdu-cards-own-words]')).toBeHidden();
});

test('voice permission denial is bounded and leaves typing available', async ({ page }) => {
  await installSpeechRecognitionMock(page);
  await openCards(page);
  await openOwnWords(page);

  await page.locator('[data-wu-voice-method]').click();
  await page.locator('[data-wu-voice-start]').click();
  await page.evaluate(() => window.__urduCardsRecognition.onerror({ error: 'not-allowed' }));

  await expect(page.locator('[data-wu-voice-status]')).toHaveText('Permission blocked');
  await expect(page.locator('[data-wu-voice-notice]')).toContainText('Allow microphone access');
  await page.locator('[data-urdu-cards-own-input]').fill('مائیک نہ ہو تب بھی میں لکھ سکتا ہوں۔');
  await expect(page.locator('#card-dua-1 .card-gallery-preview-text')).toHaveText('مائیک نہ ہو تب بھی میں لکھ سکتا ہوں۔');
});

test('unsupported voice stays disabled while Roman Urdu and direct typing remain available', async ({ page }) => {
  await disableSpeechRecognition(page);
  await openCards(page);
  await openOwnWords(page);

  const method = page.locator('[data-wu-voice-method]');
  await expect(method).toBeVisible();
  await expect(method).toBeDisabled();
  await expect(method).toHaveAttribute('aria-disabled', 'true');
  await page.locator('[data-urdu-cards-own-input]').fill('آواز دستیاب نہ ہو تو بھی یہ کام کرتا ہے۔');
  await expect(page.locator('#card-dua-1 .card-gallery-preview-text')).toHaveText('آواز دستیاب نہ ہو تو بھی یہ کام کرتا ہے۔');

  await page.setViewportSize({ width: 360, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test('Urdu locale keeps the inline own-words journey and voice method localized', async ({ page }) => {
  await installSpeechRecognitionMock(page);
  await openCards(page, '/urdu/urdu-cards');
  await openOwnWords(page);

  await expect(page).toHaveURL(/\/urdu\/urdu-cards$/);
  await expect(page.locator('[data-urdu-cards-own-words] h2')).toHaveText('اپنا پیغام استعمال کریں');
  await expect(page.locator('[data-urdu-cards-own-back]')).toHaveText('تیار شدہ کارڈز پر واپس جائیں');
  await expect(page.locator('[data-wu-voice-label]')).toHaveText('بول کر اردو لکھیں');
  await page.locator('[data-urdu-cards-own-input]').fill('آپ ہمیشہ خوش رہیں۔');
  await expect(page.locator('[data-urdu-cards-count]')).toHaveText(`${uniqueDesignCount} ڈیزائنز`);
});
