import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  redirect: vi.fn(() => {
    throw Object.assign(new Error('NEXT_REDIRECT'), {
      digest: 'NEXT_REDIRECT;replace;/dashboard;307;',
    })
  }),
}))

vi.mock('@/auth', () => ({ signIn: mocks.signIn, signOut: vi.fn() }))
vi.mock('@/lib/prisma', () => ({ default: {} }))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))
vi.mock('next-auth', () => ({
  AuthError: class AuthError extends Error {},
}))

import { AuthError } from 'next-auth'
import {
  clearFailures,
  recordFailure,
  retryAfterSeconds,
} from '@/lib/rate-limit'
import { loginOrganizer } from './auth'

const EMAIL = 'demo@event-roll.dev'
const KEY = `owner:${EMAIL}`
const WINDOW_MS = 10 * 60 * 1000

beforeEach(() => {
  vi.clearAllMocks()
  clearFailures(KEY)
})

describe('organizer login failure counter', () => {
  it('clears the counter after a successful login', async () => {
    for (let index = 0; index < 4; index += 1) {
      recordFailure(KEY, WINDOW_MS)
    }
    mocks.signIn.mockResolvedValue(undefined)

    await expect(
      loginOrganizer({ email: EMAIL, password: 'correct-password' }),
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(mocks.signIn).toHaveBeenCalledWith(
      'credentials',
      expect.objectContaining({ email: EMAIL, redirect: false }),
    )

    // If the counter was cleared, one more failure is still below the limit.
    // If it was not cleared, the five accumulated failures lock the account.
    recordFailure(KEY, WINDOW_MS)
    expect(retryAfterSeconds(KEY, 4)).toBe(0)
  })

  it('records a failure and returns an error for bad credentials', async () => {
    mocks.signIn.mockRejectedValue(new AuthError('CredentialsSignin'))

    const result = await loginOrganizer({ email: EMAIL, password: 'wrong' })

    expect(result.error).toBe('Email o contraseña incorrectos')
    expect(retryAfterSeconds(KEY, 1)).toBeGreaterThan(0)
  })
})
