import { describe, expect, it } from 'vitest'
import {
  INITIAL_LIVE_POLL,
  applyPollResult,
  isLive,
  liveBadge,
} from './live-status'

describe('live poll state', () => {
  it('starts live so the first paint matches the server data', () => {
    expect(isLive(INITIAL_LIVE_POLL)).toBe(true)
    expect(liveBadge(INITIAL_LIVE_POLL).label).toBe('En vivo')
  })

  it('stays live while a poll succeeds and records when it landed', () => {
    const state = applyPollResult(INITIAL_LIVE_POLL, { ok: true, at: 1000 })

    expect(state).toEqual({ lastSuccessAt: 1000, failures: 0 })
    expect(isLive(state)).toBe(true)
  })

  it('stops claiming live when the last poll failed', () => {
    const state = applyPollResult(INITIAL_LIVE_POLL, { ok: false, at: 2000 })

    expect(isLive(state)).toBe(false)
    expect(state.failures).toBe(1)
    expect(liveBadge(state).label).not.toBe('En vivo')
    expect(liveBadge(state).tone).toBe('stale')
  })

  it('keeps the last successful data timestamp across failures', () => {
    const afterSuccess = applyPollResult(INITIAL_LIVE_POLL, { ok: true, at: 1000 })
    const afterFailure = applyPollResult(afterSuccess, { ok: false, at: 2000 })

    expect(afterFailure.lastSuccessAt).toBe(1000)
  })

  it('counts consecutive failures', () => {
    const first = applyPollResult(INITIAL_LIVE_POLL, { ok: false, at: 2000 })
    const second = applyPollResult(first, { ok: false, at: 5000 })

    expect(second.failures).toBe(2)
  })

  it('comes back to live after a successful poll', () => {
    const failed = applyPollResult(INITIAL_LIVE_POLL, { ok: false, at: 2000 })
    const recovered = applyPollResult(failed, { ok: true, at: 5000 })

    expect(recovered).toEqual({ lastSuccessAt: 5000, failures: 0 })
    expect(liveBadge(recovered).label).toBe('En vivo')
    expect(liveBadge(recovered).caption).toContain('cada 3 segundos')
  })

  it('tells the truth about the retry while stale', () => {
    const state = applyPollResult(INITIAL_LIVE_POLL, { ok: false, at: 2000 })

    expect(liveBadge(state).caption).toContain('cada 3 segundos')
    expect(liveBadge(state).caption.toLowerCase()).toContain('desactualiz')
  })
})
