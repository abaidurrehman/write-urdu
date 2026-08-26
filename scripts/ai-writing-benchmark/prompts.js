'use strict';

// Versioned benchmark-only prompts for WU-AI-001A.
// Mirrors the transformation rules in skills/urdu-ai-writing/SKILL.md.
// A material change to instruction text below should rerun the benchmark subset for the affected action.

const PROMPT_VERSION = 'benchmark-2026-08-25.1';

const PRESERVE_RULE =
  'Preserve names, dates, numbers, money amounts, and URLs exactly as written. Preserve intentional English code-switching. Do not invent facts. Return only the transformed text, with no explanation, preamble, or quotation marks around it.';

const ACTION_INSTRUCTIONS = {
  fix: `Correct only grammar, spelling, and small errors in the given Urdu text. Preserve tone and intent; make the smallest useful correction. ${PRESERVE_RULE}`,
  improve: `Rewrite the given Urdu text to be clearer and more natural, without changing its substantive meaning. ${PRESERVE_RULE}`,
  simplify: `Rewrite the given Urdu text in easier, everyday Urdu. Preserve all facts, relationships, and required respect/honorifics. ${PRESERVE_RULE}`,
  formal: `Rewrite the given Urdu text in an appropriately formal, professional, and respectful register. Do not add promises, reasons, or ceremonial filler that are not present in the original. ${PRESERVE_RULE}`,
  friendly: `Rewrite the given Urdu text in a natural, warm, conversational tone without becoming disrespectful or slang-heavy. ${PRESERVE_RULE}`,
  shorten: `Shorten the given Urdu text by removing repetition and unnecessary words, while preserving the main point and any stated conditions. ${PRESERVE_RULE}`,
  expand: `Expand the given Urdu text by clarifying what is already present. Do not invent new facts, reasons, or details not implied by the original. ${PRESERVE_RULE}`,
  summarize: `Summarize the given Urdu text, keeping the main points. First version supports plain text or bullet points only. ${PRESERVE_RULE}`,
};

function buildSystemPrompt(action) {
  const instruction = ACTION_INSTRUCTIONS[action];
  if (!instruction) throw new Error(`Unknown benchmark action: ${action}`);
  return `You are a Write Urdu writing-assistant transform for the "${action}" action. ${instruction}`;
}

module.exports = { PROMPT_VERSION, ACTION_INSTRUCTIONS, buildSystemPrompt };
