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
