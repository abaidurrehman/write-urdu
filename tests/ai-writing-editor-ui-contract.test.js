const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(root, ...parts), 'utf8');

const actionsSource = read('functions', 'lib', 'ai-writing', 'actions.mjs');
const assistant = read('js', 'ai-writing-assistant.js');
const ageGate = read('js', 'ai-writing-age-gate.js');
const toolbar = read('js', 'basic-writer-command-toolbar.js');
const css = read('css', 'ai-writing-assistant.css');
const formConfig = read('functions', 'api', 'form-config.js');
const sw = read('sw.js');

const actionMatches = [...actionsSource.matchAll(/'(\w+)'/g)].map((match) => match[1]);
const registeredActions = actionMatches.slice(0, 8);

// --- Public config must gate the whole feature (kill switch stays the source of truth) ---
assert.match(formConfig, /aiWritingEnabled:\s*env\.AI_WRITING_ENABLED === 'true'/, 'Public config must expose the AI writing kill switch, not assume it is on');

// --- Client entry point mirrors the spec's compact affordance and action registry ---
assert.match(assistant, /var ACTIONS = \['fix', 'improve', 'simplify', 'formal', 'friendly', 'shorten', 'expand', 'summarize'\]/, 'Client action list must match the server registry exactly (spec §12)');
for (const action of registeredActions) {
  assert.match(assistant, new RegExp(`\\b${action}:\\s*'`), `Client must have a label for action "${action}"`);
}
assert.match(assistant, /config\.aiWritingEnabled/, 'Widget must not render before confirming the feature is enabled server-side');
assert.match(assistant, /config\.turnstileSiteKey/, 'Widget must not render without a Turnstile site key');
assert.doesNotMatch(assistant, /TURNSTILE_SECRET/, 'Client bundle must never reference the server-only Turnstile secret');

// --- Selection-first, bounded-paragraph scope (spec §16.2) ---
assert.match(assistant, /function computeScope\(adapter\)/, 'Widget must compute a bounded scope, not send the whole document');
assert.match(assistant, /end > start/, 'Selection must take priority over the bounded paragraph fallback');

// --- Result review surface offers all four required actions (spec §16.3) ---
for (const key of ['replace', 'insertBelow', 'copy', 'keep']) {
  assert.match(assistant, new RegExp(`actionButton\\('${key}'`), `Result panel must offer the "${key}" action`);
}

// --- Undo / one-step recovery (spec §16.4) ---
assert.match(assistant, /currentUndo = beforeValue/, 'Replace must snapshot prior content before mutating the editor');
assert.match(assistant, /PANEL_LABEL\[activeLang\]\.undo/, 'Replace must offer an explicit one-step undo, not rely on native browser undo');

// --- Failures leave source untouched and never name the provider (spec §16.5) ---
assert.doesNotMatch(assistant, /Mistral|Cerebras|Groq|Gemini/i, 'Client-facing failure copy must never name the underlying provider');
assert.match(assistant, /FAILURE_COPY/, 'Failure copy must be product-language, not raw provider/HTTP errors');

// --- Telemetry: outcomes only, never the source/output text (product-telemetry.js field whitelist) ---
assert.doesNotMatch(assistant, /trackOutcome\([^)]*resultText/, 'Telemetry must never carry the AI result text');
assert.doesNotMatch(assistant, /trackOutcome\([^)]*scope\.text/, 'Telemetry must never carry the source text sent to the provider');
for (const call of assistant.matchAll(/telemetry\('ai_writing_[a-z_]+',\s*\{([^}]*)\}/g)) {
  assert.doesNotMatch(call[1], /text|result/i, `Telemetry detail must stay metadata-only: ${call[1]}`);
}

// --- Age gate: acknowledgement only, no DOB/PII collection ---
assert.match(ageGate, /function ensureAccepted/, 'Age gate must expose an ensureAccepted() check');
assert.match(ageGate, /localStorage/, 'Age gate must remember acknowledgement locally so it only gates first use');
assert.doesNotMatch(ageGate, /birth|dob|date-of-birth/i, 'Age gate must not collect a date of birth');
assert.match(assistant, /root\.WriteUrduAiWritingAgeGate/, 'First AI action must run through the age gate before any request is sent');

// --- Toolbar integration: lazy-loaded, both toolbar branches mount it, adapter contract intact ---
assert.match(toolbar, /function ensureAiWritingAssistant\(/, 'AI writing assistant must load lazily, like the existing share publisher');
assert.match(toolbar, /\/js\/ai-writing-assistant\.js/, 'Toolbar must load the AI writing module on demand');
assert.match(toolbar, /\/js\/ai-writing-age-gate\.js/, 'Toolbar must load the age gate alongside the assistant');
assert.match(toolbar, /function createAiWritingAdapter\(editor\)/, 'Toolbar must adapt the real Basic Writer textarea for the AI widget');
assert.match(toolbar, /getSelectionRange:/, 'Adapter must expose the selection range the widget scopes requests to');
assert.match(toolbar, /replaceRange:/, 'Adapter must expose a single replace primitive used for replace/insert/undo');
assert.match(toolbar, /data-wu-ai-writing-host/, 'AI writing must own a dedicated surface instead of rendering its result inside Share/Copy controls');
assert.match(toolbar, /editorFrame\.parentNode\.insertBefore\(host, editorFrame\.nextSibling\)/, 'AI writing surface must follow the editor in the task flow');
const mountCalls = [...toolbar.matchAll(/mountAiWriting\(/g)];
assert.ok(mountCalls.length >= 2, 'Both the fresh-build and already-built toolbar branches must mount the AI widget');
assert.doesNotMatch(toolbar, /mountAiWriting[\s\S]{0,200}throw/, 'AI widget mount failure must not break the rest of the toolbar');

// --- Mobile constraint: only two compact controls, not eight equally-prominent buttons (spec §16.1) ---
assert.match(assistant, /wu-ai-writing-command--fix/, 'Fix Urdu must stay a single compact command');
assert.match(assistant, /wu-ai-writing-command--menu/, 'Remaining actions must collapse into one compact menu');
assert.match(assistant, /AI writing assistant/, 'Assistant must name itself clearly instead of relying on ambiguous Improve copy');
assert.match(assistant, /data-wu-ai-writing-jump/, 'Visible toolbar discovery must lead users to the dedicated assistant surface');
assert.match(assistant, /createAssistantIntro/, 'Assistant needs concise task and scope guidance before its commands');
assert.match(assistant, /resultText\.setAttribute\('dir', 'rtl'\)/, 'Suggested Urdu must use explicit RTL semantics');
assert.match(assistant, /resultText\.setAttribute\('lang', 'ur'\)/, 'Suggested Urdu must expose its language to assistive technology');
assert.match(css, /\.wu-ai-writing-shell\s*\{[\s\S]*grid-template-columns:/, 'Assistant needs a contained desktop layout separate from the generic toolbar');
assert.match(css, /min-height:\s*44px/, 'AI writing controls need mobile-sized touch targets');
assert.match(css, /@media \(max-width: 767px\)/, 'AI writing panel needs a mobile layout rule');

// --- PWA shell must know about the new lazily-loaded assets ---
assert.match(sw, /\.\/js\/ai-writing-assistant\.js/, 'Service worker must cache the AI writing assistant module');
assert.match(sw, /\.\/js\/ai-writing-age-gate\.js/, 'Service worker must cache the age gate module');
assert.match(sw, /\.\/css\/ai-writing-assistant\.css/, 'Service worker must cache the AI writing styles');

console.log('AI writing editor UI (Slice C) contract passed.');
