'use strict';

const VALID_ASSERTIONS = new Set(['exact_expected', 'accepted_set', 'preserve_token', 'suggestion_contains', 'manual_review']);
const VALID_CATEGORIES = new Set([
  'canonical_phonetic', 'spelling_variant', 'texting_shorthand', 'code_switching',
  'names_entities', 'long_paste', 'suggestion_recovery', 'direct_urdu_protection'
]);

function normalize(value) {
  return String(value == null ? '' : value).replace(/\r\n?/g, '\n').trim();
}

function validateFixture(fixture) {
  const errors = [];
  if (!fixture || typeof fixture !== 'object') return ['fixture must be an object'];
  if (!/^[a-z0-9][a-z0-9-]+$/.test(String(fixture.id || ''))) errors.push('invalid id');
  if (!VALID_CATEGORIES.has(fixture.category)) errors.push('invalid category');
  if (!VALID_ASSERTIONS.has(fixture.assertion)) errors.push('invalid assertion');
  if (!normalize(fixture.input)) errors.push('input is required');
  if (fixture.assertion === 'exact_expected' && !normalize(fixture.expected)) errors.push('exact_expected requires expected');
  if ((fixture.assertion === 'accepted_set' || fixture.assertion === 'suggestion_contains') && (!Array.isArray(fixture.accepted) || !fixture.accepted.length)) errors.push(fixture.assertion + ' requires accepted[]');
  if (fixture.assertion === 'preserve_token' && (!Array.isArray(fixture.tokens) || !fixture.tokens.length)) errors.push('preserve_token requires tokens[]');
  return errors;
}

function scoreFixture(fixture, providerResult) {
  const validation = validateFixture(fixture);
  if (validation.length) return { status: 'invalid', pass: false, reasons: validation };
  if (fixture.assertion === 'manual_review') return { status: 'manual', pass: null, reasons: ['manual review fixture'] };

  const primary = normalize(providerResult && providerResult.primary);
  const suggestions = Array.isArray(providerResult && providerResult.suggestions)
    ? providerResult.suggestions.map(normalize).filter(Boolean)
    : primary ? [primary] : [];

  if (!primary && !suggestions.length) return { status: 'error', pass: false, reasons: ['provider returned no result'] };

  if (fixture.assertion === 'exact_expected') {
    const pass = primary === normalize(fixture.expected);
    return { status: pass ? 'pass' : 'fail', pass, reasons: pass ? [] : ['primary result differs from expected'] };
  }

  if (fixture.assertion === 'accepted_set') {
    const accepted = fixture.accepted.map(normalize);
    const pass = accepted.includes(primary);
    return { status: pass ? 'pass' : 'fail', pass, reasons: pass ? [] : ['primary result not in accepted set'] };
  }

  if (fixture.assertion === 'suggestion_contains') {
    const accepted = fixture.accepted.map(normalize);
    const pass = suggestions.some(candidate => accepted.includes(candidate));
    return { status: pass ? 'pass' : 'fail', pass, reasons: pass ? [] : ['accepted result missing from suggestions'] };
  }

  if (fixture.assertion === 'preserve_token') {
    const missing = fixture.tokens.filter(token => !primary.includes(token));
    const pass = missing.length === 0;
    return { status: pass ? 'pass' : 'fail', pass, reasons: pass ? [] : ['missing preserved token(s): ' + missing.join(', ')] };
  }

  return { status: 'invalid', pass: false, reasons: ['unsupported assertion'] };
}

function summarize(results) {
  const summary = { total: results.length, pass: 0, fail: 0, manual: 0, error: 0, invalid: 0, by_category: {} };
  for (const result of results) {
    const status = result.score.status;
    if (Object.prototype.hasOwnProperty.call(summary, status)) summary[status] += 1;
    const category = result.fixture.category || 'unknown';
    if (!summary.by_category[category]) summary.by_category[category] = { total: 0, pass: 0, fail: 0, manual: 0, error: 0, invalid: 0 };
    summary.by_category[category].total += 1;
    if (Object.prototype.hasOwnProperty.call(summary.by_category[category], status)) summary.by_category[category][status] += 1;
  }
  const scored = summary.pass + summary.fail;
  summary.scored = scored;
  summary.pass_rate = scored ? Number((summary.pass / scored).toFixed(4)) : null;
  return summary;
}

function parseGoogleResponse(data) {
  if (!Array.isArray(data) || data[0] !== 'SUCCESS' || !Array.isArray(data[1])) throw new Error('unexpected Google Input Tools response');
  const suggestions = [];
  for (const entry of data[1]) {
    if (!entry || !Array.isArray(entry[1])) continue;
    for (const candidate of entry[1]) {
      const value = normalize(candidate);
      if (value && !suggestions.includes(value)) suggestions.push(value);
    }
  }
  return { primary: suggestions[0] || '', suggestions };
}

module.exports = { VALID_ASSERTIONS, VALID_CATEGORIES, normalize, validateFixture, scoreFixture, summarize, parseGoogleResponse };
