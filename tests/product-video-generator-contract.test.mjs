import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { VIDEO_FORMATS, normalizeVideoStory, resolveVideoFormat } from '../scripts/video-runtime.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => readFileSync(path.join(root, relative), 'utf8');
const story = JSON.parse(read('marketing/video/stories/voice-typing.json'));
const typingStory = JSON.parse(read('marketing/video/stories/english-to-urdu-typing.json'));

test('video runtime exposes the three approved responsive formats', () => {
  assert.deepEqual(Object.keys(VIDEO_FORMATS), ['website-16x9', 'social-4x5', 'vertical-9x16']);
  assert.deepEqual(resolveVideoFormat('website-16x9'), [1920, 1080]);
  assert.deepEqual(resolveVideoFormat('social-4x5'), [1080, 1350]);
  assert.deepEqual(resolveVideoFormat('vertical-9x16'), [1080, 1920]);
  assert.throws(() => resolveVideoFormat('unknown'));
});

test('story names are constrained to safe repository paths', () => {
  assert.equal(normalizeVideoStory('voice-typing'), 'voice-typing');
  assert.throws(() => normalizeVideoStory('../voice-typing'));
  assert.throws(() => normalizeVideoStory('voice typing'));
});

test('voice typing story is continuous, captions-first, and uses demo text', () => {
  assert.equal(story.storyId, 'voice-typing');
  assert.ok(story.scenes.length >= 4);
  assert.equal(story.scenes[0].start, 0);
  for (let index = 0; index < story.scenes.length; index += 1) {
    const scene = story.scenes[index];
    assert.match(scene.id, /^[a-z0-9][a-z0-9-]*$/);
    assert.ok(scene.caption);
    assert.ok(scene.kicker);
    assert.ok(scene.end > scene.start);
    if (index > 0) assert.equal(scene.start, story.scenes[index - 1].end);
  }
  const demoText = story.scenes.flatMap((scene) => Object.values(scene.setValues || {})).join(' ');
  assert.match(demoText, /اردو/);
  assert.ok(story.scenes.every((scene) => /[\u0600-\u06ff]/.test(`${scene.kicker} ${scene.caption}`)));
  assert.equal(story.scenes.at(-1).highlight, '.urdu-voice-transcript > .urdu-tool-actions');
});

test('English-to-Urdu story shows the real homepage typing journey with fictional text', () => {
  assert.equal(typingStory.storyId, 'english-to-urdu-typing');
  assert.ok(typingStory.scenes.every((scene) => scene.route === '/'));
  assert.deepEqual(typingStory.hide, ['#spinner']);
  assert.ok(typingStory.scenes.every((scene) => /[\u0600-\u06ff]/.test(`${scene.kicker} ${scene.caption}`)));
  assert.equal(typingStory.scenes[1].setValues['#transliterateTextarea'], 'mera khayal hai');
  assert.match(typingStory.scenes[2].setValues['#transliterateTextarea'], /[\u0600-\u06ff]/);
  assert.equal(typingStory.scenes.at(-1).highlight, '[data-copy-target="#transliterateTextarea"]');
});

test('capture and renderer stay local and use the existing Playwright dependency', () => {
  const capture = read('scripts/capture-product-video.mjs');
  const renderer = read('scripts/render-product-video.mjs');
  const composition = read('marketing/video/compositions/product-film.html');
  assert.match(capture, /from '@playwright\/test'/);
  assert.match(renderer, /from '@playwright\/test'/);
  assert.match(capture, /127\.0\.0\.1/);
  assert.match(capture, /deviceScaleFactor: 2/);
  assert.match(renderer, /127\.0\.0\.1/);
  assert.match(composition, /MediaRecorder/);
  assert.match(composition, /canvas\.captureStream/);
  assert.match(composition, /createMediaStreamDestination/);
  assert.match(composition, /video\/webm;codecs=vp9,opus/);
  assert.match(composition, /context\.textAlign = 'center'/);
  assert.match(composition, /panel\.y \+ panel\.h - boxH - boxMargin/);
  assert.match(composition, /REAL PRODUCT UI · DEMO TEXT/);
  assert.ok(existsSync(path.join(root, 'marketing/video/stories/voice-typing.json')));
});
