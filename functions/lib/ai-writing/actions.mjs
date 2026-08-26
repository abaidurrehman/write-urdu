// WU-AI-001B — canonical action registry (§12 of the spec).
// Stable action IDs independent of button labels/provider prompts.
// Phase 1 exposes the first eight; polish_roman_urdu/translate_to_urdu are not wired yet.

export const ACTIONS = Object.freeze([
  'fix',
  'improve',
  'simplify',
  'formal',
  'friendly',
  'shorten',
  'expand',
  'summarize'
]);

const ACTION_SET = new Set(ACTIONS);

export function isValidAction(action) {
  return typeof action === 'string' && ACTION_SET.has(action);
}

// Output tends to be similar length to input for most actions; summarize/shorten need less,
// expand needs more headroom. Kept conservative so a single request can't run away in cost/latency.
export const MAX_OUTPUT_TOKENS = Object.freeze({
  fix: 800,
  improve: 900,
  simplify: 900,
  formal: 900,
  friendly: 900,
  shorten: 500,
  expand: 1200,
  summarize: 500
});
