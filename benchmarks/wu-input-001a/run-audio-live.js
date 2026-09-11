#!/usr/bin/env node
'use strict';

/**
 * WU-INPUT-001A opt-in audio benchmark.
 *
 * Use only owned/consented benchmark audio with a gold transcript.
 * Never point this script at production user audio.
 */

const fs = require('fs');
const path = require('path');

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    return match ? [match[1], match[2]] : [arg.replace(/^--/, ''), true];
  })
);

const audioPath = args.file ? path.resolve(process.cwd(), String(args.file)) : null;
const language = String(args.language || '').trim();
const task = String(args.task || 'transcribe').trim();
const translateTo = String(args['translate-to'] || '').trim();
const outputPath = args.output ? path.resolve(process.cwd(), String(args.output)) : null;
const MAX_BENCHMARK_BYTES = 10 * 1024 * 1024;
const MODEL = '@cf/openai/whisper-large-v3-turbo';

function fail(message) {
  console.error(`WU-INPUT-001A audio: ${message}`);
  process.exit(1);
}

function requiredEnv(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) fail(`missing required environment variable ${name}`);
  return value;
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

async function transcribe(buffer) {
  const account = requiredEnv('CLOUDFLARE_ACCOUNT_ID');
  const token = requiredEnv('CLOUDFLARE_API_TOKEN');
  const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/ai/run/${MODEL}`;
  const payload = {
    audio: buffer.toString('base64'),
    task,
    vad_filter: true
  };
  if (language) payload.language = language;

  const { body, duration_ms } = await fetchJson(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const result = body && Object.prototype.hasOwnProperty.call(body, 'result') ? body.result : body;
  const text = result && typeof result.text === 'string' ? result.text : null;
  if (!text) {
    const error = new Error('unexpected Whisper response');
    error.body = body;
    throw error;
  }

  return {
    transcript: text,
    whisper_duration_ms: duration_ms,
    word_count: result.word_count || (result.transcription_info && result.transcription_info.word_count) || null,
    segments: Array.isArray(result.segments) ? result.segments : null,
    vtt: typeof result.vtt === 'string' ? result.vtt : null
  };
}

async function translateText(text, from, to) {
  const route = `/translate?api-version=3.0&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  const { body, duration_ms } = await fetchJson(microsoftEndpoint(route), {
    method: 'POST',
    headers: microsoftHeaders(),
    body: JSON.stringify([{ Text: text }])
  });
  const translated = body && body[0] && body[0].translations && body[0].translations[0];
  if (!translated || typeof translated.text !== 'string') {
    throw new Error('unexpected Microsoft translation response');
  }
  return { translated_text: translated.text, translation_duration_ms: duration_ms };
}

(async () => {
  if (!audioPath) fail('provide --file=path/to/owned-benchmark-audio');
  if (!fs.existsSync(audioPath)) fail(`file not found: ${audioPath}`);
  if (!['transcribe', 'translate'].includes(task)) fail('--task must be transcribe or translate');
  if (language && !['ur', 'en'].includes(language)) fail('--language must be ur or en for this Slice 0 corpus');
  if (translateTo && !['ur', 'en'].includes(translateTo)) fail('--translate-to must be ur or en');
  if (translateTo && !language) fail('--translate-to requires an explicit --language=ur|en source language');
  if (translateTo && task !== 'transcribe') fail('--translate-to is only supported with --task=transcribe');

  const stat = fs.statSync(audioPath);
  if (!stat.isFile()) fail('benchmark audio path must be a file');
  if (!stat.size) fail('benchmark audio file is empty');
  if (stat.size > MAX_BENCHMARK_BYTES) {
    fail(`benchmark harness cap is ${MAX_BENCHMARK_BYTES} bytes; use the future chunked benchmark for larger audio`);
  }

  const buffer = fs.readFileSync(audioPath);
  const started = Date.now();
  const result = {
    benchmark: 'WU-INPUT-001A',
    mode: 'audio',
    provider: 'cloudflare-whisper-large-v3-turbo',
    model: MODEL,
    file_basename: path.basename(audioPath),
    file_bytes: stat.size,
    language: language || null,
    task,
    ran_at: new Date().toISOString()
  };

  try {
    Object.assign(result, await transcribe(buffer));
    if (translateTo && translateTo !== language) {
      Object.assign(result, await translateText(result.transcript, language, translateTo));
      result.translation_provider = 'microsoft-translator';
      result.translation_direction = `${language}-${translateTo}`;
    }
    result.ok = true;
  } catch (error) {
    result.ok = false;
    result.error = error.message;
    result.status = error.status || null;
    result.provider_body = error.body || null;
  }

  result.total_duration_ms = Date.now() - started;
  const serialized = `${JSON.stringify(result)}\n`;
  process.stdout.write(serialized);
  if (outputPath) fs.writeFileSync(outputPath, serialized, 'utf8');
  if (!result.ok) process.exitCode = 1;
})().catch((error) => fail(error && error.stack ? error.stack : String(error)));
