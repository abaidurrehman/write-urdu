export const GROWTH_REQUEST = Object.freeze({
  NONE: 'none',
  KEEP: 'keep',
  SHARE: 'share',
  COMMUNITY_PUBLISH: 'community_publish'
});

export const WRITER_STATE = Object.freeze({
  E0: 'E0', E1: 'E1', E2: 'E2', E3: 'E3', E4: 'E4', E5: 'E5'
});

export const GROWTH_RELEASE_MARKER = 'wu-plat-002h-s3-2026-09-06-v1';

const FAMILIES = Object.freeze([GROWTH_REQUEST.KEEP, GROWTH_REQUEST.SHARE, GROWTH_REQUEST.COMMUNITY_PUBLISH]);
const WRITER_STATES = new Set(Object.values(WRITER_STATE));
const ACCOUNT_STATES = new Set(['signed-in', 'signed-out', 'disabled']);

export function writerStateFromLength(length, meaningfulOutcome = false) {
  const count = Math.max(0, Math.round(Number(length) || 0));
  if (count === 0) return WRITER_STATE.E0;
  if (meaningfulOutcome) return WRITER_STATE.E5;
  if (count < 100) return WRITER_STATE.E1;
  if (count < 500) return WRITER_STATE.E2;
  if (count < 1000) return WRITER_STATE.E3;
  return WRITER_STATE.E4;
}

function normalizeState(input = {}) {
  const writerState = WRITER_STATES.has(input.writerState) ? input.writerState : WRITER_STATE.E0;
  const accountState = ACCOUNT_STATES.has(input.accountState) ? input.accountState : (input.signedIn ? 'signed-in' : 'signed-out');
  return {
    ready: input.ready === true,
    writerState,
    accountState,
    signedIn: input.signedIn === true,
    safelySaved: input.safelySaved === true,
    localProtected: input.localProtected === true,
    meaningfulOutcome: input.meaningfulOutcome === true,
    communityEligible: input.communityEligible === true,
    keepMomentEligible: input.keepMomentEligible === true,
    keepEnabled: input.keepEnabled !== false,
    shareEnabled: input.shareEnabled !== false,
    communityEnabled: input.communityEnabled !== false
  };
}

export function growthRequestDecision(input = {}) {
  const state = normalizeState(input);
  if (!state.ready || state.writerState === WRITER_STATE.E0) {
    return { winner: GROWTH_REQUEST.NONE, eligible: Object.freeze({ keep: false, share: false, community_publish: false }), suppressed: Object.freeze([]) };
  }

  const substantial = state.writerState === WRITER_STATE.E3 || state.writerState === WRITER_STATE.E4 || state.writerState === WRITER_STATE.E5;
  const safelyRetained = state.safelySaved || state.localProtected;
  const keep = state.keepEnabled && (substantial || state.keepMomentEligible) && !state.safelySaved && !(state.meaningfulOutcome && state.localProtected);
  const share = state.shareEnabled && state.meaningfulOutcome && safelyRetained;
  const community = state.communityEnabled && state.communityEligible && (state.writerState === WRITER_STATE.E4 || state.writerState === WRITER_STATE.E5);
  const eligible = Object.freeze({ keep, share, community_publish: community });

  let winner = GROWTH_REQUEST.NONE;
  if (keep) winner = GROWTH_REQUEST.KEEP;
  else if (share) winner = GROWTH_REQUEST.SHARE;
  else if (community) winner = GROWTH_REQUEST.COMMUNITY_PUBLISH;

  const suppressed = Object.freeze(FAMILIES.filter((family) => eligible[family] && family !== winner));
  return { winner, eligible, suppressed };
}

export function decideGrowthRequest(input = {}) {
  return growthRequestDecision(input).winner;
}

export function createGrowthRequestArbiter({ workspace, telemetry } = {}) {
  const state = {
    ready: false, writerState: WRITER_STATE.E0, accountState: 'disabled', signedIn: false, safelySaved: false,
    localProtected: false, meaningfulOutcome: false, communityEligible: false, keepMomentEligible: false, keepEnabled: true, shareEnabled: true, communityEnabled: true
  };
  const listeners = new Set();
  let lastDecision = growthRequestDecision(state);
  let previousEligible = new Set();
  let previousSuppressed = new Set();
  const shownKeys = new Set();

  function emit(stage, family, extra = {}) {
    if (!FAMILIES.includes(family) || typeof telemetry !== 'function') return;
    telemetry('growth_request_stage', {
      request_family: family,
      growth_stage: stage,
      writer_state: state.writerState,
      growth_workspace: workspace || 'unknown',
      growth_account_state: state.accountState,
      suppression_winner: extra.winner || GROWTH_REQUEST.NONE,
      suppression_reason: extra.reason || 'none',
      growth_release_marker: GROWTH_RELEASE_MARKER
    });
  }

  function stateKey() {
    return [state.writerState, state.accountState, state.safelySaved ? 1 : 0, state.localProtected ? 1 : 0, state.meaningfulOutcome ? 1 : 0, state.communityEligible ? 1 : 0, state.keepMomentEligible ? 1 : 0].join('|');
  }

  function refresh() {
    const next = growthRequestDecision(state);
    const nowEligible = new Set(FAMILIES.filter((family) => next.eligible[family]));
    nowEligible.forEach((family) => { if (!previousEligible.has(family)) emit('eligible', family); });
    previousEligible = nowEligible;

    const nowSuppressed = new Set(next.suppressed.map((family) => String(family) + '|' + String(next.winner) + '|' + stateKey()));
    next.suppressed.forEach((family) => {
      const key = String(family) + '|' + String(next.winner) + '|' + stateKey();
      if (!previousSuppressed.has(key)) emit('suppressed_due_to_arbitration', family, { winner: next.winner, reason: 'higher_priority' });
    });
    previousSuppressed = nowSuppressed;

    const changed = next.winner !== lastDecision.winner || stateKey() !== lastDecision.stateKey;
    lastDecision = { ...next, stateKey: stateKey() };
    if (changed) listeners.forEach((listener) => { try { listener(next.winner); } catch {} });
    return next.winner;
  }

  return Object.freeze({
    update(patch = {}) {
      Object.keys(state).forEach((key) => { if (Object.prototype.hasOwnProperty.call(patch, key)) state[key] = patch[key]; });
      if (!WRITER_STATES.has(state.writerState)) state.writerState = WRITER_STATE.E0;
      if (!ACCOUNT_STATES.has(state.accountState)) state.accountState = state.signedIn ? 'signed-in' : 'signed-out';
      return refresh();
    },
    current() { return lastDecision.winner; },
    snapshot() { return Object.freeze({ ...state, winner: lastDecision.winner }); },
    shown(family) {
      if (family !== lastDecision.winner || family === GROWTH_REQUEST.NONE) return false;
      const key = String(family) + '|' + stateKey();
      if (shownKeys.has(key)) return false;
      shownKeys.add(key);
      emit('shown', family);
      return true;
    },
    opened(family) { if (!FAMILIES.includes(family)) return false; emit('opened', family); return true; },
    completed(family) { if (!FAMILIES.includes(family)) return false; emit('completed', family); return true; },
    dismissed(family) { if (!FAMILIES.includes(family)) return false; emit('dismissed', family); return true; },
    subscribe(listener) {
      if (typeof listener !== 'function') return () => {};
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  });
}
