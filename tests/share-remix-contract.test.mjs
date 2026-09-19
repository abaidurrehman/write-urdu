import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const helperPath = path.join(root, 'functions', '_lib', 'share-remix.js');
const source = fs.readFileSync(helperPath, 'utf8');
const helper = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

const base = {
  version: 1,
  project: {
    id: 'private-local-id',
    name: 'Private local name',
    createdAt: '2026-09-18T00:00:00.000Z',
    presetId: 'portrait',
    templateId: 'emerald',
    text: {
      value: 'client supplied text must not win',
      fontFamily: 'Noto Nastaliq Urdu',
      fontMode: 'manual',
      fontSize: 76,
      minFontSize: 28,
      maxFontSize: 160,
      color: '#fffdf2',
      align: 'center',
      verticalAlign: 'center',
      lineHeight: 1.8,
      shadow: 'soft',
      transform: { x: 0.1, y: 0.12, width: 0.8, height: 0.7, horizontalAnchor: 'left', verticalAnchor: 'top', rotation: 0, positionCustomized: true, widthCustomized: true }
    },
    attribution: { enabled: true, value: 'client attribution', fontFamily: 'Noto Naskh Arabic', fontSizeRatio: 0.44, color: '#d7f7e4' },
    background: { type: 'gradient', color: '#ffffff', gradientId: 'emerald-night', imageAssetId: 'private-blob-id', fit: 'cover', positionX: 0.5, positionY: 0.5, overlayColor: '#000000', overlayOpacity: 0, blur: 0 },
    watermark: { enabled: true, position: 'bottom-left' }
  }
};

const design = helper.sanitizeRemixPayload(JSON.stringify(base), 'اصل عوامی متن', 'عوامی نام');
assert.equal(design.mode, 'design');
assert.equal(design.payload.version, 1);
assert.equal(design.payload.project.text.value, 'اصل عوامی متن');
assert.equal(design.payload.project.attribution.value, 'عوامی نام');
assert.equal(design.payload.project.background.type, 'gradient');
assert.equal(design.payload.project.background.gradientId, 'emerald-night');
assert.equal(design.payload.project.id, undefined);
assert.equal(design.payload.project.name, undefined);
assert.equal(design.payload.project.createdAt, undefined);
assert.equal(design.payload.project.background.imageAssetId, undefined);

const uploaded = structuredClone(base);
uploaded.project.background.type = 'image';
uploaded.project.background.imageAssetId = 'local-upload';
assert.deepEqual(helper.sanitizeRemixPayload(JSON.stringify(uploaded), 'عوامی متن', ''), { mode: 'text_only', payload: null });

const unsafe = structuredClone(base);
unsafe.project.text.color = 'url(https://evil.example/pixel)';
assert.deepEqual(helper.sanitizeRemixPayload(JSON.stringify(unsafe), 'عوامی متن', ''), { mode: 'text_only', payload: null });

assert.deepEqual(helper.sanitizeRemixPayload('{bad json', 'عوامی متن', ''), { mode: 'text_only', payload: null });
assert.deepEqual(helper.readStoredRemix('design', JSON.stringify(design.payload), 'اصل عوامی متن', 'عوامی نام'), design.payload);
assert.equal(helper.readStoredRemix('text_only', JSON.stringify(design.payload)), null);
assert.equal(helper.readStoredRemix('design', '{bad json', 'عوامی متن', ''), null);

console.log('Safe public-share remix contract passed.');
