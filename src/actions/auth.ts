'use server'

import { AuthError } from 'next-auth'
import bcrypt from 'bcryptjs'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { signIn, signOut } from '@/auth'
import { clientIpFrom } from '@/lib/client-ip'
import prisma from '@/lib/prisma'
import {
  clearFailures,
  recordFailure,
  retryAfterSeconds,
  tooManyAttemptsMessage,
} from '@/lib/rate-limit'
import {
  PUBLIC_SIGNUP_DISABLED_MESSAGE,
  isPublicSignupDisabled,
} from '@/lib/signup'
import { LoginSchema, RegisterSchema, StaffCodeSchema } from '@/lib/validations/auth'
import type { ActionResult as SharedActionResult } from '@/lib/action-result'

// These actions report success or failure only: no extra payload fields.
type ActionResult = SharedActionResult

const LOGIN_WINDOW_MS = 10 * 60 * 1000
const OWNER_ATTEMPT_LIMIT = 5
const STAFF_ATTEMPT_LIMIT = 8
// One address may not spray identities: every attempt counts here, so rotating
// the email or the code no longer buys an unlimited number of guesses.
const IP_ATTEMPT_LIMIT = 20

async function requestIp(): Promise<string> {
  return clientIpFrom(await headers())
}

function ipKey(ip: string): string {
  return `ip:${ip}`
}

// Identity buckets stay global on purpose: an account must not earn a fresh set
// of guesses for every address an attacker happens to control.
function ownerKey(email: string): string {
  return `owner:${email}`
}

function staffKey(code: string): string {
  return `staff:${code}`
}

// Signup keeps its own bucket so failed logins never lock an honest registration.
function registerKey(ip: string): string {
  return `register:${ip}`
}

export async function registerOrganizer(input: unknown): Promise<ActionResult> {
  if (isPublicSignupDisabled()) {
    return { error: PUBLIC_SIGNUP_DISABLED_MESSAGE }
  }

  const ip = await requestIp()
  const key = registerKey(ip)
  const wait = retryAfterSeconds(key, IP_ATTEMPT_LIMIT)
  if (wait > 0) return { error: tooManyAttemptsMessage(wait) }
  recordFailure(key, LOGIN_WINDOW_MS)

  const parsed = RegisterSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }
  }

  const { name, email, password, organizationName } = parsed.data
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    // Neutral on purpose: confirming the address would let anyone enumerate accounts.
    return { error: 'No se pudo crear la cuenta. Si ya tienes una, inicia sesión.' }
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, passwordHash },
    })
    await tx.organization.create({
      data: { name: organizationName, ownerId: user.id },
    })
  })

  try {
    await signIn('credentials', { email, password, redirectTo: '/dashboard' })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Cuenta creada. Inicia sesión con tus credenciales.' }
    }
    throw error
  }

  return { success: true }
}

export async function loginOrganizer(input: unknown): Promise<ActionResult> {
  const parsed = LoginSchema.safeParse(input)
  if (!parsed.success) {
    return { error: 'Email o contraseña inválidos' }
  }

  const ip = await requestIp()
  const ipWait = retryAfterSeconds(ipKey(ip), IP_ATTEMPT_LIMIT)
  if (ipWait > 0) return { error: tooManyAttemptsMessage(ipWait) }

  const key = ownerKey(parsed.data.email)
  const wait = retryAfterSeconds(key, OWNER_ATTEMPT_LIMIT)
  if (wait > 0) return { error: tooManyAttemptsMessage(wait) }

  try {
    // `redirect: false` keeps the success path reachable: the default redirect
    // throws before the failure counter can be cleared.
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      recordFailure(key, LOGIN_WINDOW_MS)
      recordFailure(ipKey(ip), LOGIN_WINDOW_MS)
      return { error: 'Email o contraseña incorrectos' }
    }
    throw error
  }

  clearFailures(key)
  redirect('/dashboard')
}

export async function loginStaff(input: unknown): Promise<ActionResult> {
  const parsed = StaffCodeSchema.safeParse(input)
  if (!parsed.success) {
    return { error: 'Escribe un código válido' }
  }

  const ip = await requestIp()
  const ipWait = retryAfterSeconds(ipKey(ip), IP_ATTEMPT_LIMIT)
  if (ipWait > 0) return { error: tooManyAttemptsMessage(ipWait) }

  const key = staffKey(parsed.data.code)
  const wait = retryAfterSeconds(key, STAFF_ATTEMPT_LIMIT)
  if (wait > 0) return { error: tooManyAttemptsMessage(wait) }

  const staff = await prisma.staff.findUnique({
    where: { code: parsed.data.code },
    include: { event: true },
  })

  if (!staff || !staff.active) {
    recordFailure(key, LOGIN_WINDOW_MS)
    recordFailure(ipKey(ip), LOGIN_WINDOW_MS)
    return { error: 'Código inválido o inactivo' }
  }
  if (staff.event.status !== 'ACTIVE') {
    clearFailures(key)
    return { error: 'Este evento ya está cerrado' }
  }

  clearFailures(key)
  try {
    await signIn('staff-code', {
      code: parsed.data.code,
      redirectTo: `/staff/event/${staff.eventId}`,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      recordFailure(key, LOGIN_WINDOW_MS)
      recordFailure(ipKey(ip), LOGIN_WINDOW_MS)
      return { error: 'No se pudo iniciar sesión con ese código' }
    }
    throw error
  }

  return { success: true }
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: '/' })
}
