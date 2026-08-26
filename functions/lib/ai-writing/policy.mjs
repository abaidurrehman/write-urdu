// WU-AI-001B — cost/abuse controls (spec §19): monthly budget paced across the month so a
// burst of early-month usage can't exhaust the whole Mistral free-tier budget in a week.
//
// Mistral's published free (Experiment) tier is ~1B tokens/month with a 500K TPM ceiling
// (docs.mistral.ai/deployment/ai-studio/tier, checked 2026-08-26). AI_WRITING_MONTHLY_TOKEN_BUDGET
// defaults well under that as a conservative baseline — it is NOT meant to be a precise accounting
// of the real account limit. Tune it from the real number at admin.mistral.ai/plateforme/limits.
//
// This is pacing, not precise cost accounting: token counts are estimated pre-call from input
// length + the action's max output tokens, not the provider's actual usage report.

const DEFAULT_MONTHLY_TOKEN_BUDGET = 20_000_000;
const DEFAULT_PACING_MULTIPLIER = 1.5; // allow some days heavier than the flat daily average

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS ai_writing_monthly_usage (
  month TEXT PRIMARY KEY,
  requests_count INTEGER NOT NULL DEFAULT 0,
  estimated_tokens INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT
)`;

let schemaReady = null;

function hasDatabase(db) {
  return Boolean(db && typeof db.prepare === 'function');
}

function monthKey(now) {
  return now.toISOString().slice(0, 7); // YYYY-MM
}

function daysInMonth(now) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
}

export function estimateTokens(text, maxOutputTokens) {
  const inputTokens = Math.ceil(text.length / 4);
  return inputTokens + maxOutputTokens;
}

async function ensureSchema(db) {
  if (!schemaReady) {
    schemaReady = db.prepare(CREATE_TABLE_SQL).run().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

async function readUsage(db, month) {
  const row = await db.prepare('SELECT estimated_tokens FROM ai_writing_monthly_usage WHERE month = ?1').bind(month).first();
  return row ? Number(row.estimated_tokens) || 0 : 0;
}

// Returns { allowed: true } or { allowed: false, code: 'budget-exhausted', message }.
// Must be called, then recordUsage() called only after a successful provider call.
export async function checkBudget(db, { text, maxOutputTokens, env, now = new Date() }) {
  if (!hasDatabase(db)) {
    return { allowed: false, code: 'provider-unavailable', message: 'Budget tracking is not configured.' };
  }
  await ensureSchema(db);

  const monthlyBudget = Number(env.AI_WRITING_MONTHLY_TOKEN_BUDGET) || DEFAULT_MONTHLY_TOKEN_BUDGET;
  const pacingMultiplier = Number(env.AI_WRITING_PACING_MULTIPLIER) || DEFAULT_PACING_MULTIPLIER;

  const month = monthKey(now);
  const dayOfMonth = now.getUTCDate();
  const totalDays = daysInMonth(now);
  const estimate = estimateTokens(text, maxOutputTokens);

  const usedSoFar = await readUsage(db, month);
  const pacedAllowance = monthlyBudget * (dayOfMonth / totalDays) * pacingMultiplier;
  const hardCeiling = monthlyBudget;

  if (usedSoFar + estimate > hardCeiling) {
    return { allowed: false, code: 'budget-exhausted', message: 'Monthly AI writing budget is exhausted.' };
  }
  if (usedSoFar + estimate > pacedAllowance) {
    return { allowed: false, code: 'budget-exhausted', message: 'Daily pacing limit reached; budget is held back for the rest of the month.' };
  }

  return { allowed: true, month, estimate };
}

export async function recordUsage(db, month, tokens, now = new Date()) {
  if (!hasDatabase(db)) return;
  await ensureSchema(db);
  await db.prepare(`
    INSERT INTO ai_writing_monthly_usage (month, requests_count, estimated_tokens, updated_at)
    VALUES (?1, 1, ?2, ?3)
    ON CONFLICT(month) DO UPDATE SET
      requests_count = requests_count + 1,
      estimated_tokens = estimated_tokens + excluded.estimated_tokens,
      updated_at = excluded.updated_at
  `).bind(month, Math.max(0, Math.floor(tokens)), now.toISOString()).run();
}
