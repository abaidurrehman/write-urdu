#!/usr/bin/env node
'use strict';

/**
 * WU-INPUT-001A opt-in live provider benchmark.
 *
 * This script is deliberately outside production runtime. It only sends the
 * committed benchmark fixture text/terms to a provider when explicitly run.
 * It never reads user drafts, analytics, browser storage, or production audio.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    return match ? [match[1], match[2]] : [arg.replace(/^--/, ''), true];
  })
);

const mode = String(args.mode || 'translation');
const provider = String(args.provider || '');
const limit = Number(args.limit || 0);
const outputPath = args.output ? path.resolve(process.cwd(), String(args.output)) : null;

function fail(message) {
  console.error(`WU-INPUT-001A: ${message}`);
  process.exit(1);
}

function loadJson(name) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, name), 'utf8'));
}

function requiredEnv(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) fail(`missing required environment variable ${name}`);
  return value;
}

function nowIso() {
  return new Date().toISOString();
}

function languageCode(direction, side) {
  const [from, to] = direction.split('-');
  const code = side === 'from' ? from : to;
  return code;
}

function microsoftHeaders() {
  const headers = {
    'content-type': 'application/json',
    'Ocp-Apim-Subscription-Key': requiredEnv('AZURE_TRANSLATOR_KEY')
  };
  const region = String(process.env.AZURE_TRANSLATOR_REGION || '').trim();
  if (region) headers['Ocp-Apim-Subscription-Region'] = region;
  return headers;
}

function microsoftEndpoint(route) {
  const base = String(
    process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com'
  ).replace(/\/+$/, '');
  return `${base}${route}`;
}

async function fetchJson(url, options) {
  const started = Date.now();
  const response = await fetch(url, options);
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    error.body = body;
    error.duration_ms = Date.now() - started;
    throw error;
  }
  return { body, duration_ms: Date.now() - started };
}

async function microsoftTranslate(fixture) {
  const from = languageCode(fixture.direction, 'from');
  const to = languageCode(fixture.direction, 'to');
  const route = `/translate?api-version=3.0&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const { body, duration_ms } = await fetchJson(microsoftEndpoint(route), {
    method: 'POST',
    headers: microsoftHeaders(),
    body: JSON.stringify([{ Text: fixture.source }])
  });
  const translated = body && body[0] && body[0].translations && body[0].translations[0];
  if (!translated || typeof translated.text !== 'string') {
    throw new Error('unexpected Microsoft translation response');
  }
  return { translated_text: translated.text, duration_ms };
}

async function microsoftDictionary(fixture) {
  const route = `/dictionary/lookup?api-version=3.0&from=${encodeURIComponent(fixture.from)}&to=${encodeURIComponent(fixture.to)}`;
  const { body, duration_ms } = await fetchJson(microsoftEndpoint(route), {
    method: 'POST',
    headers: microsoftHeaders(),
    body: JSON.stringify([{ Text: fixture.query }])
  });
  const first = body && body[0];
  if (!first || !Array.isArray(first.translations)) {
    throw new Error('unexpected Microsoft dictionary response');
  }
  return {
    normalized_source: first.normalizedSource || null,
    display_source: first.displaySource || fixture.query,
    translations: first.translations.map((item) => ({
      display_target: item.displayTarget || item.normalizedTarget || '',
      normalized_target: item.normalizedTarget || null,
      pos_tag: item.posTag || null,
      confidence: typeof item.confidence === 'number' ? item.confidence : null,
      prefix_word: item.prefixWord || '',
      back_translations: Array.isArray(item.backTranslations)
        ? item.backTranslations.map((back) => ({
            display_text: back.displayText || back.normalizedText || '',
            normalized_text: back.normalizedText || null,
            num_examples: typeof back.numExamples === 'number' ? back.numExamples : null,
            frequency_count: typeof back.frequencyCount === 'number' ? back.frequencyCount : null
          }))
        : []
    })),
    duration_ms
  };
}

function cloudflareHeaders() {
  return {
    authorization: `Bearer ${requiredEnv('CLOUDFLARE_API_TOKEN')}`,
    'content-type': 'application/json'
  };
}

function cloudflareModelUrl(model) {
  const account = requiredEnv('CLOUDFLARE_ACCOUNT_ID');
  return `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/ai/run/${model}`;
}

function unwrapCloudflare(body) {
  if (body && Object.prototype.hasOwnProperty.call(body, 'result')) return body.result;
  return body;
}

async function cloudflareM2m100(fixture) {
  const from = languageCode(fixture.direction, 'from');
  const to = languageCode(fixture.direction, 'to');
  const model = '@cf/meta/m2m100-1.2b';
  const { body, duration_ms } = await fetchJson(cloudflareModelUrl(model), {
    method: 'POST',
    headers: cloudflareHeaders(),
    body: JSON.stringify({ text: fixture.source, source_lang: from, target_lang: to })
  });
  const result = unwrapCloudflare(body);
  const translated = result && (result.translated_text || result.translation || result.text);
  if (typeof translated !== 'string') {
    const error = new Error('unexpected Cloudflare M2M100 response');
    error.body = body;
    throw error;
  }
  return { translated_text: translated, duration_ms };
}

async function cloudflareIndicTrans2(fixture) {
  if (fixture.direction !== 'en-ur') {
    throw new Error('IndicTrans2 benchmark only accepts en-ur fixtures');
  }
  const model = '@cf/ai4bharat/indictrans2-en-indic-1B';
  const { body, duration_ms } = await fetchJson(cloudflareModelUrl(model), {
    method: 'POST',
    headers: cloudflareHeaders(),
    body: JSON.stringify({ text: [fixture.source], target_language: 'urd_Arab' })
  });
  const result = unwrapCloudflare(body);
  const list = result && Array.isArray(result.translations) ? result.translations : null;
  if (!list || typeof list[0] !== 'string') {
    const error = new Error('unexpected Cloudflare IndicTrans2 response');
    error.body = body;
    throw error;
  }
  return { translated_text: list[0], duration_ms };
}

function output(record) {
  const line = JSON.stringify(record);
  console.log(line);
  if (outputPath) fs.appendFileSync(outputPath, `${line}\n`, 'utf8');
}

async function runTranslation() {
  if (!['microsoft', 'cloudflare-m2m100', 'cloudflare-indictrans2'].includes(provider)) {
    fail('translation mode requires --provider=microsoft|cloudflare-m2m100|cloudflare-indictrans2');
  }
  let fixtures = loadJson('translation-fixtures.json').fixtures;
  if (provider === 'cloudflare-indictrans2') {
    fixtures = fixtures.filter((item) => item.direction === 'en-ur');
  }
  if (limit > 0) fixtures = fixtures.slice(0, limit);

  for (const fixture of fixtures) {
    const record = {
      benchmark: 'WU-INPUT-001A',
      mode: 'translation',
      provider,
      fixture_id: fixture.id,
      direction: fixture.direction,
      source: fixture.source,
      tags: fixture.tags,
      ran_at: nowIso()
    };
    try {
      const result = provider === 'microsoft'
        ? await microsoftTranslate(fixture)
        : provider === 'cloudflare-m2m100'
          ? await cloudflareM2m100(fixture)
          : await cloudflareIndicTrans2(fixture);
      output({ ...record, ok: true, ...result });
    } catch (error) {
      output({
        ...record,
        ok: false,
        error: error.message,
        status: error.status || null,
        provider_body: error.body || null,
        duration_ms: error.duration_ms || null
      });
    }
  }
}

async function runDictionary() {
  if (provider !== 'microsoft') {
    fail('dictionary mode currently requires --provider=microsoft');
  }
  let fixtures = loadJson('dictionary-fixtures.json').fixtures;
  if (limit > 0) fixtures = fixtures.slice(0, limit);

  for (const fixture of fixtures) {
    const record = {
      benchmark: 'WU-INPUT-001A',
      mode: 'dictionary',
      provider,
      fixture_id: fixture.id,
      query: fixture.query,
      from: fixture.from,
      to: fixture.to,
      tags: fixture.tags,
      required_behaviors: fixture.required_behaviors,
      ran_at: nowIso()
    };
    try {
      const result = await microsoftDictionary(fixture);
      output({ ...record, ok: true, ...result });
    } catch (error) {
      output({
        ...record,
        ok: false,
        error: error.message,
        status: error.status || null,
        provider_body: error.body || null,
        duration_ms: error.duration_ms || null
      });
    }
  }
}

(async () => {
  if (outputPath) fs.writeFileSync(outputPath, '', 'utf8');
  if (mode === 'translation') return runTranslation();
  if (mode === 'dictionary') return runDictionary();
  fail('unsupported --mode; use translation or dictionary');
})().catch((error) => fail(error && error.stack ? error.stack : String(error)));
