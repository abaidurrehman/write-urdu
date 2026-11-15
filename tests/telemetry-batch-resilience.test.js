const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

// The client batches up to ten events per request. Before 2026-10-18 one
// unrecognised event name (for example Basic Writer's basic_toolbar_action,
// queued on every toolbar click including Copy) made /api/events reject the
// whole batch, silently dropping the copy_completed, writer_* and
// session_summary events queued alongside it. Product Pulse showed ~0 Basic
// Writer copies for two months because of this.

const endpointUrl = pathToFileURL(path.resolve(__dirname, '..', 'functions', 'api', 'events.js')).href;

function fakeDb() {
  const statements = [];
  const db = {
    statements,
    prepare(sql) {
      const statement = { sql, args: [], bind(...args) { this.args = args; return this; }, first: async () => null, all: async () => ({ results: [] }), run: async () => ({}) };
      return statement;
    },
    batch: async (list) => { statements.push(...list); return []; }
  };
  return db;
}

let counter = 0;
function event(name, extra) {
  counter += 1;
  return Object.assign({
    event_id: 'evt-batch-resilience-' + counter,
    session_id: 'session-batch-resilience',
    route: '/',
    locale: 'en',
    tool: 'basic_editor',
    event_name: name,
    device_class: 'mobile',
    length_bucket: '1-20'
  }, extra || {});
}

async function post(onRequestPost, events, db) {
  const request = new Request('https://write-urdu.com/api/events', {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://write-urdu.com' },
    body: JSON.stringify({ events })
  });
  const response = await onRequestPost({ request, env: { METRICS_DB: db } });
  return { status: response.status, body: await response.json() };
}

function copiesWritten(db) {
  return db.statements.some((statement) => {
    const match = statement.sql.match(/INSERT INTO product_hourly_metrics \(([^)]*)\)/);
    if (!match) return false;
    const columns = match[1].split(',').map((column) => column.trim());
    return Number(statement.args[columns.indexOf('copies')]) > 0;
  });
}

(async () => {
  const { onRequestPost } = await import(endpointUrl);

  {
    const db = fakeDb();
    const result = await post(onRequestPost, [
      event('basic_toolbar_action'),
      event('copy_completed', { format: 'clipboard', success: true }),
      event('writer_outcome_first')
    ], db);
    assert.equal(result.status, 202, 'A batch with one unknown event must still be accepted');
    assert.equal(result.body.accepted, 2, 'Only the recognised events are accepted');
    assert.equal(result.body.dropped, 1, 'The unknown event is dropped and reported as dropped');
    assert.ok(copiesWritten(db), 'copy_completed in a mixed batch must reach the hourly rollup');
  }

  {
    const db = fakeDb();
    const result = await post(onRequestPost, [event('basic_toolbar_action'), event('not_a_real_event')], db);
    assert.equal(result.status, 400, 'A batch with no recognised events is still rejected');
    assert.equal(result.body.error, 'invalid_event');
    assert.equal(db.statements.length, 0, 'A fully invalid batch writes nothing');
  }

  {
    const db = fakeDb();
    const result = await post(onRequestPost, [event('copy_completed', { format: 'clipboard', success: true })], db);
    assert.equal(result.status, 202);
    assert.equal(result.body.accepted, 1);
    assert.equal(result.body.dropped, 0, 'A clean batch reports zero dropped events');
  }

  {
    const db = fakeDb();
    const tooMany = Array.from({ length: 11 }, () => event('copy_completed'));
    const result = await post(onRequestPost, tooMany, db);
    assert.equal(result.status, 400, 'The ten-event batch limit still applies');
    assert.equal(result.body.error, 'invalid_event_batch');
  }

  console.log('Telemetry batch resilience contract passed.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
