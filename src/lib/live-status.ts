/**
 * The live panel polls every few seconds. It may only say "En vivo" while the
 * last poll actually succeeded: a dropped connection must not keep claiming
 * the numbers are current.
 */
export const POLL_INTERVAL_MS = 3000

export type LivePollState = {
  lastSuccessAt: number | null
  failures: number
}

export type PollResult = { ok: true; at: number } | { ok: false; at: number }

export const INITIAL_LIVE_POLL: LivePollState = {
  lastSuccessAt: null,
  failures: 0,
}

export function applyPollResult(
  state: LivePollState,
  result: PollResult,
): LivePollState {
  if (result.ok) return { lastSuccessAt: result.at, failures: 0 }
  return { lastSuccessAt: state.lastSuccessAt, failures: state.failures + 1 }
}

export function isLive(state: LivePollState): boolean {
  return state.failures === 0
}

export type LiveBadge = {
  tone: 'live' | 'stale'
  label: string
  caption: string
}

export function liveBadge(state: LivePollState): LiveBadge {
  if (isLive(state)) {
    return {
      tone: 'live',
      label: 'En vivo',
      caption: 'Se actualiza automáticamente cada 3 segundos.',
    }
  }
  return {
    tone: 'stale',
    label: 'Sin actualizar',
    caption:
      'No pudimos actualizar el panel; los datos pueden estar ' +
      'desactualizados. Seguimos intentando cada 3 segundos.',
  }
}
