export const VIDEO_FORMATS = Object.freeze({
  'website-16x9': Object.freeze([1920, 1080]),
  'social-4x5': Object.freeze([1080, 1350]),
  'vertical-9x16': Object.freeze([1080, 1920])
});

export function resolveVideoFormat(requested = 'website-16x9') {
  if (!Object.hasOwn(VIDEO_FORMATS, requested)) throw new Error(`Unknown video format: ${requested}`);
  return VIDEO_FORMATS[requested];
}

export function normalizeVideoStory(value, fallback = 'voice-typing') {
  const candidate = String(value || fallback).trim();
  if (!/^[a-z0-9][a-z0-9-]*$/.test(candidate)) {
    throw new Error(`Invalid video story: ${candidate || '(empty)'}`);
  }
  return candidate;
}

export function videoPaths(root, storyId) {
  return Object.freeze({
    story: new URL(`../marketing/video/stories/${storyId}.json`, `file://${root.replaceAll('\\', '/')}/`).pathname,
    captures: new URL(`../marketing/video/captures/${storyId}/`, `file://${root.replaceAll('\\', '/')}/`).pathname,
    generated: new URL('../marketing/video/generated/', `file://${root.replaceAll('\\', '/')}/`).pathname
  });
}
