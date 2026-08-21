const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS voice_account_hourly_metrics (
  bucket_hour TEXT PRIMARY KEY,
  voice_page_sessions INTEGER NOT NULL DEFAULT 0,
  voice_try_sessions INTEGER NOT NULL DEFAULT 0,
  voice_success_sessions INTEGER NOT NULL DEFAULT 0,
  account_signups INTEGER NOT NULL DEFAULT 0,
  voice_assisted_signups INTEGER NOT NULL DEFAULT 0,
  latest_event_at TEXT
)`;

let schemaReady = null;

function hasDatabase(db) {
  return Boolean(db && typeof db.prepare === 'function');
}

function count(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number <= 0) return 0;
  return Math.floor(number);
}

function hourIso(date) {
  return date.toISOString().slice(0, 13) + ':00:00Z';
}

export async function ensureVoiceAccountMetrics(db) {
  if (!hasDatabase(db)) throw new TypeError('A D1 database binding is required.');
  if (!schemaReady) {
    schemaReady = db.prepare(CREATE_TABLE_SQL).run().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

export async function incrementVoiceAccountMetrics(db, increments = {}, now = new Date()) {
  if (!hasDatabase(db)) throw new TypeError('A D1 database binding is required.');
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) throw new TypeError('A valid event date is required.');

  const values = {
    voicePageSessions: count(increments.voicePageSessions),
    voiceTrySessions: count(increments.voiceTrySessions),
    voiceSuccessSessions: count(increments.voiceSuccessSessions),
    accountSignups: count(increments.accountSignups),
    voiceAssistedSignups: count(increments.voiceAssistedSignups)
  };

  if (!Object.values(values).some(Boolean)) return;
  await ensureVoiceAccountMetrics(db);

  await db.prepare(`
    INSERT INTO voice_account_hourly_metrics (
      bucket_hour,
      voice_page_sessions,
      voice_try_sessions,
      voice_success_sessions,
      account_signups,
      voice_assisted_signups,
      latest_event_at
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
    ON CONFLICT(bucket_hour) DO UPDATE SET
      voice_page_sessions = voice_page_sessions + excluded.voice_page_sessions,
      voice_try_sessions = voice_try_sessions + excluded.voice_try_sessions,
      voice_success_sessions = voice_success_sessions + excluded.voice_success_sessions,
      account_signups = account_signups + excluded.account_signups,
      voice_assisted_signups = voice_assisted_signups + excluded.voice_assisted_signups,
      latest_event_at = excluded.latest_event_at
  `).bind(
    hourIso(now),
    values.voicePageSessions,
    values.voiceTrySessions,
    values.voiceSuccessSessions,
    values.accountSignups,
    values.voiceAssistedSignups,
    now.toISOString()
  ).run();
}
