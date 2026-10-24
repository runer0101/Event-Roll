import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  clearFailures,
  recordFailure,
  retryAfterSeconds,
  tooManyAttemptsMessage,
} from './rate-limit'

const WINDOW = 10 * 60 * 1000

afterEach(() => {
  vi.useRealTimers()
})

describe('retryAfterSeconds', () => {
  it('allows attempts until the limit is reached', () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const key = 'test:limit'

    for (let attempt = 0; attempt < 4; attempt += 1) {
      recordFailure(key, WINDOW)
    }
    expect(retryAfterSeconds(key, 5)).toBe(0)

    recordFailure(key, WINDOW)
    expect(retryAfterSeconds(key, 5)).toBe(600)
  })

  it('forgives failures once the window expires', () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const key = 'test:expire'

    for (let attempt = 0; attempt < 5; attempt += 1) {
      recordFailure(key, WINDOW)
    }
    vi.setSystemTime(WINDOW + 1)

    expect(retryAfterSeconds(key, 5)).toBe(0)
  })

  it('clears the counter after a successful login', () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const key = 'test:clear'

    for (let attempt = 0; attempt < 5; attempt += 1) {
      recordFailure(key, WINDOW)
    }
    clearFailures(key)

    expect(retryAfterSeconds(key, 5)).toBe(0)
  })
})

describe('tooManyAttemptsMessage', () => {
  it('rounds the wait up to whole minutes', () => {
    expect(tooManyAttemptsMessage(30)).toBe(
      'Demasiados intentos. Vuelve a probar en 1 minuto.',
    )
    expect(tooManyAttemptsMessage(61)).toBe(
      'Demasiados intentos. Vuelve a probar en 2 minutos.',
    )
  })
})
