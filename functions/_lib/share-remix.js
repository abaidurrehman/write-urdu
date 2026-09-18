const PRESETS = new Set(['square', 'landscape', 'facebook', 'portrait', 'story']);
const TEMPLATES = new Set(['classic-nastaliq', 'midnight', 'minimal-white', 'emerald', 'paper', 'photo-quote', 'sunflower-bloom', 'golden-mandala', 'botanical-frame']);
const FONTS = new Set(['Noto Nastaliq Urdu', 'Noto Naskh Arabic', 'Amiri', 'Lateef', 'Scheherazade New', 'Tajawal']);
const GRADIENTS = new Set(['midnight-blue', 'emerald-night', 'rose-dawn', 'saffron', 'indigo', 'ocean', 'plum', 'slate']);
const COLOR = /^(?:#[0-9a-f]{3,8}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\))$/i;
const MAX_INPUT_BYTES = 32000;

function boundedNumber(value, min, max) {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
}

function enumValue(value, allowed) {
  const candidate = String(value == null ? '' : value);
  return allowed.has(candidate) ? candidate : null;
}

function safeColor(value) {
  const color = String(value == null ? '' : value).trim();
  return color.length <= 48 && COLOR.test(color) ? color : null;
}

function sanitizeTransform(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const x = boundedNumber(value.x, 0, 0.98);
  const y = boundedNumber(value.y, 0, 0.98);
  const width = boundedNumber(value.width, 0.1, 0.98);
  const height = value.height == null ? null : boundedNumber(value.height, 0.04, 0.98);
  const horizontalAnchor = enumValue(value.horizontalAnchor, new Set(['left', 'center', 'right']));
  const verticalAnchor = enumValue(value.verticalAnchor, new Set(['top', 'center', 'bottom']));
  if (x == null || y == null || width == null || (value.height != null && height == null) || !horizontalAnchor || !verticalAnchor || x + width > 1) return null;
  return {
    x,
    y,
    width,
    height,
    horizontalAnchor,
    verticalAnchor,
    rotation: 0,
    positionCustomized: value.positionCustomized === true,
    widthCustomized: value.widthCustomized === true
  };
}

function sanitizeProject(raw, publicText, publicAttribution) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const text = raw.text;
  const attribution = raw.attribution;
  const background = raw.background;
  const watermark = raw.watermark;
  if (!text || !attribution || !background || !watermark) return null;
  if (background.type !== 'solid' && background.type !== 'gradient') return null;

  const presetId = enumValue(raw.presetId, PRESETS);
  const templateId = enumValue(raw.templateId, TEMPLATES);
  const fontFamily = enumValue(text.fontFamily, FONTS);
  const attributionFont = enumValue(attribution.fontFamily, FONTS);
  const textColor = safeColor(text.color);
  const attributionColor = safeColor(attribution.color);
  const backgroundColor = safeColor(background.color);
  const overlayColor = safeColor(background.overlayColor);
  const textTransform = sanitizeTransform(text.transform);
  const attributionTransform = attribution.transform ? sanitizeTransform(attribution.transform) : undefined;
  const gradientId = background.type === 'gradient' ? enumValue(background.gradientId, GRADIENTS) : null;
  const cleanText = String(publicText == null ? '' : publicText).trim();
  const cleanAttribution = String(publicAttribution == null ? '' : publicAttribution).trim();

  if (!cleanText || cleanText.length > 8000 || cleanAttribution.length > 240) return null;
  if (!presetId || !templateId || !fontFamily || !attributionFont || !textColor || !attributionColor || !backgroundColor || !overlayColor || !textTransform) return null;
  if (attribution.transform && !attributionTransform) return null;
  if (background.type === 'gradient' && !gradientId) return null;

  const fontSize = boundedNumber(text.fontSize, 12, 240);
  const minFontSize = boundedNumber(text.minFontSize, 12, 120);
  const maxFontSize = boundedNumber(text.maxFontSize, 12, 240);
  const lineHeight = boundedNumber(text.lineHeight, 1.2, 2.2);
  const attributionRatio = boundedNumber(attribution.fontSizeRatio, 0.1, 1);
  const positionX = boundedNumber(background.positionX, 0, 1);
  const positionY = boundedNumber(background.positionY, 0, 1);
  const overlayOpacity = boundedNumber(background.overlayOpacity, 0, 0.8);
  const blur = boundedNumber(background.blur, 0, 16);
  if ([fontSize, minFontSize, maxFontSize, lineHeight, attributionRatio, positionX, positionY, overlayOpacity, blur].some(value => value == null)) return null;
  if (maxFontSize < minFontSize) return null;

  return {
    version: 2,
    useCase: ['quote', 'social', 'story', 'announcement'].includes(raw.useCase) ? raw.useCase : null,
    presetId,
    templateId,
    text: {
      value: cleanText,
      fontFamily,
      fontMode: text.fontMode === 'manual' ? 'manual' : 'auto',
      fontSize,
      minFontSize,
      maxFontSize,
      color: textColor,
      align: ['left', 'center', 'right'].includes(text.align) ? text.align : 'center',
      verticalAlign: ['top', 'center', 'bottom'].includes(text.verticalAlign) ? text.verticalAlign : 'center',
      lineHeight,
      shadow: ['none', 'soft', 'strong'].includes(text.shadow) ? text.shadow : 'none',
      transform: textTransform
    },
    attribution: {
      enabled: Boolean(cleanAttribution && attribution.enabled === true),
      value: cleanAttribution,
      fontFamily: attributionFont,
      fontSizeRatio: attributionRatio,
      color: attributionColor,
      ...(attributionTransform ? { transform: attributionTransform } : {})
    },
    background: {
      type: background.type,
      color: backgroundColor,
      gradientId,
      fit: background.fit === 'contain' ? 'contain' : 'cover',
      positionX,
      positionY,
      overlayColor,
      overlayOpacity,
      blur
    },
    watermark: {
      enabled: watermark.enabled === true,
      position: ['bottom-left', 'bottom-center', 'bottom-right'].includes(watermark.position) ? watermark.position : 'bottom-left'
    }
  };
}

export function sanitizeRemixPayload(value, publicText, publicAttribution) {
  const fallback = { mode: 'text_only', payload: null };
  if (typeof value !== 'string' || !value || value.length > MAX_INPUT_BYTES) return fallback;
  let parsed;
  try { parsed = JSON.parse(value); } catch (error) { return fallback; }
  if (!parsed || parsed.version !== 1 || !parsed.project) return fallback;
  const project = sanitizeProject(parsed.project, publicText, publicAttribution);
  return project ? { mode: 'design', payload: { version: 1, project } } : fallback;
}

export function readStoredRemix(mode, value, publicText, publicAttribution) {
  if (mode !== 'design' || typeof value !== 'string' || !value || value.length > MAX_INPUT_BYTES) return null;
  let parsed;
  try { parsed = JSON.parse(value); } catch (error) { return null; }
  if (!parsed || parsed.version !== 1 || !parsed.project || !parsed.project.text) return null;
  const checked = sanitizeProject(parsed.project, publicText, publicAttribution);
  return checked ? { version: 1, project: checked } : null;
}
