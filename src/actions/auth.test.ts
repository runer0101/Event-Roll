import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  findUnique: vi.fn(),
  redirect: vi.fn(() => {
    throw Object.assign(new Error('NEXT_REDIRECT'), {
      digest: 'NEXT_REDIRECT;replace;/dashboard;307;',
    })
  }),
}))

// Mutable on purpose: one test proves the identity cap survives a change of
// address, so the mocked request must be able to come from somewhere else.
const request = vi.hoisted(() => ({ ip: '203.0.113.7' }))

vi.mock('@/auth', () => ({ signIn: mocks.signIn, signOut: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  default: { user: { findUnique: mocks.findUnique } },
}))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))
vi.mock('next-auth', () => ({
  AuthError: class AuthError extends Error {},
}))
vi.mock('next/headers', () => ({
  headers: async () => new Headers({ 'x-forwarded-for': request.ip }),
}))

import { AuthError } from 'next-auth'
import {
  clearFailures,
  recordFailure,
  retryAfterSeconds,
} from '@/lib/rate-limit'
import { PUBLIC_SIGNUP_DISABLED_MESSAGE } from '@/lib/signup'
import { loginOrganizer, registerOrganizer } from './auth'

const EMAIL = 'demo@event-roll.dev'
const IP = '203.0.113.7'
const OTHER_IP = '198.51.100.9'
const KEY = `owner:${EMAIL}`
const IP_KEY = `ip:${IP}`
const WINDOW_MS = 10 * 60 * 1000

afterEach(() => {
  delete process.env.DISABLE_PUBLIC_SIGNUP
})

beforeEach(() => {
  vi.clearAllMocks()
  request.ip = IP
  clearFailures(KEY)
  clearFailures(IP_KEY)
  clearFailures(`ip:${OTHER_IP}`)
  clearFailures(`register:${IP}`)
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

describe('per-IP throttle', () => {
  it('blocks an attacker who rotates the email', async () => {
    mocks.signIn.mockRejectedValue(new AuthError('CredentialsSignin'))

    for (let index = 0; index < 20; index += 1) {
      await loginOrganizer({
        email: `atacante${index}@ejemplo.com`,
        password: 'x',
      })
    }

    const blocked = await loginOrganizer({
      email: 'otro@ejemplo.com',
      password: 'x',
    })

    expect(blocked.error).toContain('Demasiados intentos')
    expect(mocks.signIn).toHaveBeenCalledTimes(20)
  })

  it('keeps the per-identity cap when the attacker changes address', async () => {
    mocks.signIn.mockRejectedValue(new AuthError('CredentialsSignin'))

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await loginOrganizer({ email: EMAIL, password: 'x' })
    }

    request.ip = OTHER_IP
    const blocked = await loginOrganizer({ email: EMAIL, password: 'x' })

    expect(blocked.error).toContain('Demasiados intentos')
    expect(mocks.signIn).toHaveBeenCalledTimes(5)
  })
})

describe('public signup', () => {
  it('refuses new organizations when the deployment closes signup', async () => {
    process.env.DISABLE_PUBLIC_SIGNUP = 'true'

    const result = await registerOrganizer({
      name: 'Cesar',
      email: 'nuevo@ejemplo.com',
      password: 'contrasena-larga',
      organizationName: 'Negocio',
    })

    expect(result.error).toBe(PUBLIC_SIGNUP_DISABLED_MESSAGE)
  })

  it('is not blocked by failed logins from the same address', async () => {
    mocks.signIn.mockRejectedValue(new AuthError('CredentialsSignin'))
    for (let index = 0; index < 20; index += 1) {
      await loginOrganizer({
        email: `atacante${index}@ejemplo.com`,
        password: 'x',
      })
    }

    mocks.findUnique.mockResolvedValue({ id: 'existing' })
    const result = await registerOrganizer({
      name: 'Cesar',
      email: 'nuevo@ejemplo.com',
      password: 'contrasena-larga',
      organizationName: 'Negocio',
    })

    expect(result.error).not.toContain('Demasiados intentos')
  })
})
